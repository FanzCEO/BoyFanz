import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import {
  Shield,
  Camera,
  AlertTriangle,
  Ban,
  Eye,
  TrendingUp,
  Users,
  Clock,
} from 'lucide-react';

interface CaptureAttempt {
  id: string;
  userId: string;
  username: string;
  email: string;
  platform: string;
  attemptNumber: number;
  timestamp: string;
  userAgent: string;
  ipAddress: string;
  strikes: number;
  status: 'active' | 'warned' | 'suspended' | 'banned';
}

interface SecurityStats {
  totalAttempts24h: number;
  totalAttemptsWeek: number;
  uniqueOffenders24h: number;
  repeatOffenders: number;
  usersOnStrike: number;
  activeBans: number;
}

export default function SecurityDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('24h');
  const queryClient = useQueryClient();

  // Fetch security stats
  const { data: stats } = useQuery<SecurityStats>({
    queryKey: ['/api/admin/security/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/security/stats'),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch capture attempts
  const { data: attempts, isLoading } = useQuery<CaptureAttempt[]>({
    queryKey: ['/api/admin/security/capture-attempts', { timeFilter, search: searchQuery }],
    queryFn: () =>
      apiRequest('GET', '/api/admin/security/capture-attempts', {
        params: { timeFilter, search: searchQuery },
      }),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  // Issue warning mutation
  const issueWarning = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', '/api/admin/security/issue-warning', { userId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/capture-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
    },
  });

  // Add strike mutation
  const addStrike = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', '/api/admin/security/add-strike', { userId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/capture-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
    },
  });

  // Suspend user mutation
  const suspendUser = useMutation({
    mutationFn: async ({
      userId,
      duration,
      reason,
    }: {
      userId: string;
      duration: number;
      reason: string;
    }) =>
      apiRequest('POST', '/api/admin/security/suspend-user', {
        userId,
        duration,
        reason,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/capture-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
    },
  });

  // Ban user mutation
  const banUser = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', '/api/admin/security/ban-user', { userId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/capture-attempts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/stats'] });
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      warned: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-orange-100 text-orange-800',
      banned: 'bg-red-100 text-red-800',
    };
    return variants[status] || variants.active;
  };

  const getStrikeBadge = (strikes: number) => {
    if (strikes === 0) return 'bg-gray-100 text-gray-800';
    if (strikes === 1) return 'bg-yellow-100 text-yellow-800';
    if (strikes === 2) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Security Dashboard</h1>
        </div>
        <p className="text-muted-foreground">
          Monitor screenshot attempts, manage user strikes, and enforce content protection
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="w-4 h-4 text-orange-600" />
            <div className="text-sm text-muted-foreground">Attempts (24h)</div>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {stats?.totalAttempts24h || 0}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div className="text-sm text-muted-foreground">This Week</div>
          </div>
          <div className="text-2xl font-bold">{stats?.totalAttemptsWeek || 0}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-purple-600" />
            <div className="text-sm text-muted-foreground">Unique Offenders</div>
          </div>
          <div className="text-2xl font-bold">{stats?.uniqueOffenders24h || 0}</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <div className="text-sm text-muted-foreground">Repeat Offenders</div>
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {stats?.repeatOffenders || 0}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-orange-600" />
            <div className="text-sm text-muted-foreground">On Strike List</div>
          </div>
          <div className="text-2xl font-bold text-orange-600">
            {stats?.usersOnStrike || 0}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Ban className="w-4 h-4 text-red-600" />
            <div className="text-sm text-muted-foreground">Active Bans</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{stats?.activeBans || 0}</div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Live Attempts</TabsTrigger>
          <TabsTrigger value="repeat-offenders">Repeat Offenders</TabsTrigger>
          <TabsTrigger value="strike-list">Strike List</TabsTrigger>
          <TabsTrigger value="banned">Banned Users</TabsTrigger>
        </TabsList>

        {/* Live Attempts Tab */}
        <TabsContent value="overview" className="mt-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Capture Attempts</h2>
                <div className="flex gap-2">
                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">Last Hour</SelectItem>
                      <SelectItem value="24h">Last 24h</SelectItem>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Search by username or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Attempts</TableHead>
                      <TableHead>Strikes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Attempt</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          Loading...
                        </TableCell>
                      </TableRow>
                    ) : !attempts || attempts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No capture attempts found
                        </TableCell>
                      </TableRow>
                    ) : (
                      attempts.map((attempt) => (
                        <TableRow key={attempt.id}>
                          <TableCell className="font-medium">{attempt.username}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {attempt.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                attempt.attemptNumber > 5
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : attempt.attemptNumber > 2
                                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              }
                            >
                              {attempt.attemptNumber}x
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStrikeBadge(attempt.strikes)}>
                              {attempt.strikes} {attempt.strikes === 1 ? 'strike' : 'strikes'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(attempt.status)}>
                              {attempt.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(attempt.timestamp).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-sm font-mono">
                            {attempt.ipAddress}
                          </TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  Actions
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Take Action Against User</DialogTitle>
                                  <DialogDescription>
                                    User: {attempt.username} ({attempt.email})
                                    <br />
                                    Attempts: {attempt.attemptNumber} | Strikes:{' '}
                                    {attempt.strikes}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <ActionButton
                                    label="⚠️ Issue Warning"
                                    description="Send warning message to user"
                                    onClick={() =>
                                      issueWarning.mutate({
                                        userId: attempt.userId,
                                        reason: 'Screenshot attempt detected',
                                      })
                                    }
                                    variant="warning"
                                  />
                                  <ActionButton
                                    label="📋 Add Strike"
                                    description="Add a strike to user's record"
                                    onClick={() =>
                                      addStrike.mutate({
                                        userId: attempt.userId,
                                        reason: 'Screenshot capture violation',
                                      })
                                    }
                                    variant="strike"
                                  />
                                  <ActionButton
                                    label="⏸️ Suspend (7 Days)"
                                    description="Temporarily suspend account access"
                                    onClick={() =>
                                      suspendUser.mutate({
                                        userId: attempt.userId,
                                        duration: 7,
                                        reason: 'Multiple screenshot violations',
                                      })
                                    }
                                    variant="suspend"
                                  />
                                  <ActionButton
                                    label="🚫 Permanent Ban"
                                    description="Permanently ban user from platform"
                                    onClick={() =>
                                      banUser.mutate({
                                        userId: attempt.userId,
                                        reason: 'Repeated screenshot violations',
                                      })
                                    }
                                    variant="ban"
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Other tabs can be added here */}
        <TabsContent value="repeat-offenders" className="mt-6">
          <Card className="p-6">
            <p className="text-muted-foreground">
              Repeat offenders view - coming soon
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="strike-list" className="mt-6">
          <Card className="p-6">
            <p className="text-muted-foreground">Strike list view - coming soon</p>
          </Card>
        </TabsContent>

        <TabsContent value="banned" className="mt-6">
          <Card className="p-6">
            <p className="text-muted-foreground">Banned users view - coming soon</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for action buttons
function ActionButton({
  label,
  description,
  onClick,
  variant,
}: {
  label: string;
  description: string;
  onClick: () => void;
  variant: 'warning' | 'strike' | 'suspend' | 'ban';
}) {
  const colors = {
    warning: 'border-yellow-200 hover:bg-yellow-50',
    strike: 'border-orange-200 hover:bg-orange-50',
    suspend: 'border-blue-200 hover:bg-blue-50',
    ban: 'border-red-200 hover:bg-red-50',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 border-2 rounded-lg text-left transition-colors ${colors[variant]}`}
    >
      <div className="font-semibold">{label}</div>
      <div className="text-sm text-muted-foreground">{description}</div>
    </button>
  );
}
