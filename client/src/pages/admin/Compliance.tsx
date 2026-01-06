import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch compliance stats
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/compliance/stats'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/stats'),
  });

  // Fetch compliance dashboard
  const { data: dashboard } = useQuery({
    queryKey: ['/api/admin/compliance/dashboard'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/dashboard'),
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Compliance & Accountability</h1>
        <p className="text-muted-foreground">
          Adult industry compliance: 2257, content moderation, IP blocking, user bans
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active IP Blocks</div>
          <div className="text-2xl font-bold">{stats?.activeIpBlocks || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Bans</div>
          <div className="text-2xl font-bold">{stats?.activeBans || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Pending 2257</div>
          <div className="text-2xl font-bold">{stats?.pending2257Reviews || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Content Flags</div>
          <div className="text-2xl font-bold">{stats?.pendingContentFlags || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">DMCA Pending</div>
          <div className="text-2xl font-bold">{stats?.pendingDmcaTakedowns || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Suspicious Logins</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.suspiciousLogins24h || 0}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">Active Sessions</div>
          <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="ip-blocks">IP Blocks</TabsTrigger>
          <TabsTrigger value="user-bans">User Bans</TabsTrigger>
          <TabsTrigger value="2257">2257 Records</TabsTrigger>
          <TabsTrigger value="content-flags">Content Flags</TabsTrigger>
          <TabsTrigger value="dmca">DMCA</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <ComplianceDashboard dashboard={dashboard} />
        </TabsContent>

        {/* IP Blocks Tab */}
        <TabsContent value="ip-blocks">
          <IPBlocksTab />
        </TabsContent>

        {/* User Bans Tab */}
        <TabsContent value="user-bans">
          <UserBansTab />
        </TabsContent>

        {/* 2257 Records Tab */}
        <TabsContent value="2257">
          <Records2257Tab />
        </TabsContent>

        {/* Content Flags Tab */}
        <TabsContent value="content-flags">
          <ContentFlagsTab />
        </TabsContent>

        {/* DMCA Tab */}
        <TabsContent value="dmca">
          <DMCATab />
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Compliance Dashboard
function ComplianceDashboard({ dashboard }: { dashboard: any }) {
  if (!dashboard) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4">Overall Compliance Score</h3>
        <div className="text-5xl font-bold text-green-600 mb-6">{dashboard.overallScore}%</div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboard.areas?.map((area: any) => (
            <Card key={area.name} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="text-sm font-medium">{area.name}</div>
                <Badge variant={area.status === 'compliant' ? 'default' : 'destructive'}>
                  {area.status}
                </Badge>
              </div>
              <div className="text-2xl font-bold">{area.score}%</div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Audits</h3>
          <div className="space-y-3">
            {dashboard.recentAudits?.map((audit: any) => (
              <div key={audit.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{audit.type}</div>
                  <div className="text-sm text-muted-foreground">{audit.date}</div>
                </div>
                <Badge variant={audit.result === 'passed' ? 'default' : 'destructive'}>
                  {audit.result}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {dashboard.upcomingDeadlines?.map((deadline: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center border-b pb-2">
                <div>
                  <div className="font-medium">{deadline.type}</div>
                  <div className="text-sm text-muted-foreground">{deadline.deadline}</div>
                </div>
                <Badge>{deadline.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// IP Blocks Tab
function IPBlocksTab() {
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const { data: blocks } = useQuery({
    queryKey: ['/api/admin/compliance/ip-blocks', { search }],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/ip-blocks', { params: { search } }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search IP address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>
              <i className="fas fa-ban mr-2" />
              Block IP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Block IP Address</DialogTitle>
              <DialogDescription>
                Add a new IP address or range to the block list
              </DialogDescription>
            </DialogHeader>
            <IPBlockForm onSuccess={() => setShowDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Hits</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Expires</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blocks?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No IP blocks found
                </TableCell>
              </TableRow>
            ) : (
              blocks?.items?.map((block: any) => (
                <TableRow key={block.id}>
                  <TableCell className="font-mono">{block.ipAddress}</TableCell>
                  <TableCell>
                    <Badge>{block.status}</Badge>
                  </TableCell>
                  <TableCell>{block.reason}</TableCell>
                  <TableCell>{block.hitCount || 0}</TableCell>
                  <TableCell>{block.country || '-'}</TableCell>
                  <TableCell>{block.expiresAt || 'Permanent'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <i className="fas fa-edit" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// User Bans Tab
function UserBansTab() {
  const [search, setSearch] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  const { data: bans } = useQuery({
    queryKey: ['/api/admin/compliance/user-bans', { search }],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/user-bans', { params: { search } }),
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <i className="fas fa-user-slash mr-2" />
              Ban User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ban User</DialogTitle>
              <DialogDescription>
                Create a new user ban with evidence and reason
              </DialogDescription>
            </DialogHeader>
            <UserBanForm onSuccess={() => setShowDialog(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Ban Type</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Can Appeal</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bans?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No bans found
                </TableCell>
              </TableRow>
            ) : (
              bans?.items?.map((ban: any) => (
                <TableRow key={ban.id}>
                  <TableCell>{ban.userId}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{ban.banType}</Badge>
                  </TableCell>
                  <TableCell>{ban.reason}</TableCell>
                  <TableCell>{new Date(ban.startsAt).toLocaleDateString()}</TableCell>
                  <TableCell>{ban.endsAt ? new Date(ban.endsAt).toLocaleDateString() : 'Permanent'}</TableCell>
                  <TableCell>{ban.canAppeal ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <i className="fas fa-info-circle" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// 2257 Records Tab
function Records2257Tab() {
  const { data } = useQuery({
    queryKey: ['/api/admin/compliance/2257-records'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/2257-records'),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">2257 Compliance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">Total Records</div>
            <div className="text-2xl font-bold">{data?.summary?.totalRecords || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Complete</div>
            <div className="text-2xl font-bold text-green-600">{data?.summary?.complete || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Incomplete</div>
            <div className="text-2xl font-bold text-yellow-600">{data?.summary?.incomplete || 0}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Need Review</div>
            <div className="text-2xl font-bold text-red-600">{data?.summary?.recordsNeedingReview || 0}</div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Custodian of Records</h3>
        <div className="space-y-2">
          <div>
            <span className="font-medium">Name:</span> {data?.summary?.custodianOfRecords?.name}
          </div>
          <div>
            <span className="font-medium">Address:</span> {data?.summary?.custodianOfRecords?.address}
          </div>
          <div>
            <span className="font-medium">Last Updated:</span> {data?.summary?.custodianOfRecords?.lastUpdated}
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Creator ID</TableHead>
              <TableHead>Legal Name</TableHead>
              <TableHead>DOB</TableHead>
              <TableHead>ID Type</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data?.items?.map((record: any) => (
                <TableRow key={record.id}>
                  <TableCell>{record.creatorId}</TableCell>
                  <TableCell>{`${record.legalFirstName} ${record.legalLastName}`}</TableCell>
                  <TableCell>{record.dateOfBirth}</TableCell>
                  <TableCell>{record.idType}</TableCell>
                  <TableCell>{new Date(record.idVerifiedAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={record.isActive ? 'default' : 'secondary'}>
                      {record.isActive ? 'Active' : 'Revoked'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost">
                      <i className="fas fa-eye" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Content Flags Tab
function ContentFlagsTab() {
  const { data: flags } = useQuery({
    queryKey: ['/api/admin/compliance/content-flags'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/content-flags'),
  });

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Content ID</TableHead>
            <TableHead>Creator</TableHead>
            <TableHead>Flag Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reported</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {flags?.items?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No content flags found
              </TableCell>
            </TableRow>
          ) : (
            flags?.items?.map((flag: any) => (
              <TableRow key={flag.id}>
                <TableCell>{flag.contentId}</TableCell>
                <TableCell>{flag.creatorId}</TableCell>
                <TableCell>
                  <Badge variant="destructive">{flag.flagType}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={flag.priority >= 8 ? 'destructive' : 'default'}>
                    {flag.priority}/10
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge>{flag.status}</Badge>
                </TableCell>
                <TableCell>{new Date(flag.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// DMCA Tab
function DMCATab() {
  const { data: takedowns } = useQuery({
    queryKey: ['/api/admin/compliance/takedowns'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/takedowns'),
  });

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Content</TableHead>
            <TableHead>Claimant</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received</TableHead>
            <TableHead>Resolved</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {takedowns?.items?.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No DMCA takedowns found
              </TableCell>
            </TableRow>
          ) : (
            takedowns?.items?.map((takedown: any) => (
              <TableRow key={takedown.id}>
                <TableCell>#{takedown.id}</TableCell>
                <TableCell>
                  <div>{takedown.contentType}</div>
                  <div className="text-sm text-muted-foreground">{takedown.contentId}</div>
                </TableCell>
                <TableCell>{takedown.requester}</TableCell>
                <TableCell>
                  <Badge>{takedown.status}</Badge>
                </TableCell>
                <TableCell>{new Date(takedown.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{takedown.resolvedAt ? new Date(takedown.resolvedAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost">
                    <i className="fas fa-eye" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Card>
  );
}

// Security Tab
function SecurityTab() {
  const { data: loginAttempts } = useQuery({
    queryKey: ['/api/admin/compliance/login-attempts'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/login-attempts'),
  });

  const { data: sessions } = useQuery({
    queryKey: ['/api/admin/compliance/active-sessions'],
    queryFn: () => apiRequest('GET', '/api/admin/compliance/active-sessions'),
  });

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Login Attempts (Last 24h)</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Suspicious</TableHead>
              <TableHead>Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loginAttempts?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No login attempts found
                </TableCell>
              </TableRow>
            ) : (
              loginAttempts?.items?.map((attempt: any) => (
                <TableRow key={attempt.id}>
                  <TableCell>{attempt.email}</TableCell>
                  <TableCell className="font-mono">{attempt.ipAddress}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.success ? 'default' : 'destructive'}>
                      {attempt.success ? 'Success' : 'Failed'}
                    </Badge>
                  </TableCell>
                  <TableCell>{attempt.country || '-'}</TableCell>
                  <TableCell>
                    {attempt.isSuspicious ? (
                      <Badge variant="destructive">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(attempt.attemptedAt).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Active Sessions</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions?.items?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No active sessions found
                </TableCell>
              </TableRow>
            ) : (
              sessions?.items?.map((session: any) => (
                <TableRow key={session.id}>
                  <TableCell>{session.userId}</TableCell>
                  <TableCell className="font-mono">{session.ipAddress}</TableCell>
                  <TableCell>{session.deviceType || '-'}</TableCell>
                  <TableCell>{session.city ? `${session.city}, ${session.country}` : session.country || '-'}</TableCell>
                  <TableCell>{new Date(session.lastActivityAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="destructive">
                      Terminate
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// IP Block Form
function IPBlockForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <form className="space-y-4">
      <div>
        <Label>IP Address or Range</Label>
        <Input placeholder="192.168.1.1 or 192.168.1.0/24" />
      </div>
      <div>
        <Label>Status</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
            <SelectItem value="monitored">Monitored</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Reason</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fraud">Fraud</SelectItem>
            <SelectItem value="chargebacks">Chargebacks</SelectItem>
            <SelectItem value="abuse">Abuse</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="bot_activity">Bot Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Notes</Label>
        <Textarea placeholder="Additional details..." />
      </div>
      <Button type="submit" className="w-full">Block IP</Button>
    </form>
  );
}

// User Ban Form
function UserBanForm({ onSuccess }: { onSuccess: () => void }) {
  return (
    <form className="space-y-4">
      <div>
        <Label>User ID</Label>
        <Input placeholder="Enter user ID" />
      </div>
      <div>
        <Label>Ban Type</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select ban type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="temporary">Temporary</SelectItem>
            <SelectItem value="permanent">Permanent</SelectItem>
            <SelectItem value="shadow">Shadow Ban</SelectItem>
            <SelectItem value="content_only">Content Only</SelectItem>
            <SelectItem value="messaging_only">Messaging Only</SelectItem>
            <SelectItem value="payout_hold">Payout Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Reason</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select reason" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="terms_violation">Terms Violation</SelectItem>
            <SelectItem value="underage_content">Underage Content</SelectItem>
            <SelectItem value="non_consensual_content">Non-Consensual Content</SelectItem>
            <SelectItem value="illegal_content">Illegal Content</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="fraud">Fraud</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Reason Details</Label>
        <Textarea placeholder="Explain the reason for this ban..." />
      </div>
      <div>
        <Label>End Date (leave empty for permanent)</Label>
        <Input type="datetime-local" />
      </div>
      <Button type="submit" variant="destructive" className="w-full">Ban User</Button>
    </form>
  );
}
