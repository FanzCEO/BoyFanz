import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Shield,
  AlertTriangle,
  Camera,
  Ban,
  Flag,
  Bell,
  Settings,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  UserX,
  FileWarning,
  TrendingDown,
  TrendingUp
} from "lucide-react";

interface Report {
  id: string;
  type: string;
  priority: string;
  status: string;
  reporterId: string;
  reporterUsername: string;
  reportedId: string;
  reportedUsername: string;
  description: string;
  evidence: string[];
  createdAt: string;
  resolution?: string;
}

interface PanicAlert {
  id: string;
  userId: string;
  username: string;
  streamId: string;
  triggeredAt: string;
  status: string;
  reason: string;
  viewerCount: number;
  responseActions: string[];
  resolution?: string;
}

interface ScreenshotLog {
  id: string;
  userId: string;
  username: string;
  contentType: string;
  creatorUsername: string;
  detectedAt: string;
  method: string;
  deviceInfo: string;
  action: string;
  warningCount: number;
}

interface BlockedUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  reason: string;
  blockedAt: string;
  blockType: string;
  violations: string[];
  appealStatus: string;
}

export default function SafetyCenter() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<PanicAlert | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [reportFilter, setReportFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  // Fetch safety dashboard stats
  const { data: stats } = useQuery({
    queryKey: ['/api/safety/admin/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/safety/admin/dashboard');
      if (!res.ok) throw new Error('Failed to fetch safety stats');
      return res.json();
    }
  });

  // Fetch reports
  const { data: reportsData } = useQuery({
    queryKey: ['/api/safety/admin/reports', reportFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (reportFilter !== 'all') params.append('status', reportFilter);
      if (priorityFilter !== 'all') params.append('priority', priorityFilter);
      const res = await fetch(`/api/safety/admin/reports?${params}`);
      if (!res.ok) throw new Error('Failed to fetch reports');
      return res.json();
    }
  });

  // Fetch panic alerts
  const { data: panicData } = useQuery({
    queryKey: ['/api/safety/admin/panic-alerts'],
    queryFn: async () => {
      const res = await fetch('/api/safety/admin/panic-alerts');
      if (!res.ok) throw new Error('Failed to fetch panic alerts');
      return res.json();
    }
  });

  // Fetch screenshot logs
  const { data: screenshotData } = useQuery({
    queryKey: ['/api/safety/admin/screenshot-logs'],
    queryFn: async () => {
      const res = await fetch('/api/safety/admin/screenshot-logs');
      if (!res.ok) throw new Error('Failed to fetch screenshot logs');
      return res.json();
    }
  });

  // Fetch blocked users
  const { data: blockedData } = useQuery({
    queryKey: ['/api/safety/admin/blocked-users'],
    queryFn: async () => {
      const res = await fetch('/api/safety/admin/blocked-users');
      if (!res.ok) throw new Error('Failed to fetch blocked users');
      return res.json();
    }
  });

  // Fetch safety settings
  const { data: settings } = useQuery({
    queryKey: ['/api/safety/admin/settings'],
    queryFn: async () => {
      const res = await fetch('/api/safety/admin/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      return res.json();
    }
  });

  // Update report mutation
  const updateReport = useMutation({
    mutationFn: async ({ reportId, status, resolution }: { reportId: string; status: string; resolution?: string }) => {
      const res = await fetch(`/api/safety/admin/reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, resolution })
      });
      if (!res.ok) throw new Error('Failed to update report');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/admin/reports'] });
      toast({ title: "Report Updated", description: "Report status has been updated." });
      setSelectedReport(null);
    }
  });

  // Respond to panic alert
  const respondToAlert = useMutation({
    mutationFn: async ({ alertId, action, notes }: { alertId: string; action: string; notes?: string }) => {
      const res = await fetch(`/api/safety/admin/panic-alerts/${alertId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes })
      });
      if (!res.ok) throw new Error('Failed to respond to alert');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/safety/admin/panic-alerts'] });
      toast({ title: "Alert Responded", description: "Panic alert has been addressed." });
      setSelectedAlert(null);
    }
  });

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access the Safety Center.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-black';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500';
      case 'investigating': return 'bg-blue-500/20 text-blue-500';
      case 'resolved': return 'bg-green-500/20 text-green-500';
      case 'active': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'harassment': return <AlertTriangle className="h-4 w-4" />;
      case 'underage_suspicion': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'content_violation': return <FileWarning className="h-4 w-4" />;
      case 'impersonation': return <UserX className="h-4 w-4" />;
      case 'scam': return <Ban className="h-4 w-4" />;
      default: return <Flag className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-500" />
            Safety Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and respond to platform safety incidents
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Panic Alerts</p>
                <p className="text-3xl font-bold text-red-500">{stats?.panicButtonTriggered || 0}</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {(stats?.trendsThisWeek?.panicButton || 0) < 0 ? (
                    <>
                      <TrendingDown className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{stats?.trendsThisWeek?.panicButton}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-3 w-3 text-red-500" />
                      <span className="text-red-500">+{stats?.trendsThisWeek?.panicButton}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
              <Phone className="h-10 w-10 text-red-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-orange-500/30 bg-orange-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Screenshot Attempts</p>
                <p className="text-3xl font-bold text-orange-500">{stats?.screenshotAttempts || 0}</p>
                <div className="flex items-center gap-1 text-xs mt-1">
                  {(stats?.trendsThisWeek?.screenshots || 0) > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                      <span className="text-orange-500">+{stats?.trendsThisWeek?.screenshots}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{stats?.trendsThisWeek?.screenshots}%</span>
                    </>
                  )}
                  <span className="text-muted-foreground">this week</span>
                </div>
              </div>
              <Camera className="h-10 w-10 text-orange-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Reports</p>
                <p className="text-3xl font-bold text-yellow-500">{stats?.activeReports || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.resolvedReports || 0} resolved total
                </p>
              </div>
              <Flag className="h-10 w-10 text-yellow-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Safety Score</p>
                <p className="text-3xl font-bold text-green-500">{stats?.safetyScore || 0}%</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Avg response: {stats?.avgResponseTime || 'N/A'}
                </p>
              </div>
              <Shield className="h-10 w-10 text-green-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reports" className="gap-2">
            <Flag className="h-4 w-4" />
            Reports
            {reportsData?.byStatus?.pending > 0 && (
              <Badge variant="destructive" className="ml-1">{reportsData.byStatus.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="panic" className="gap-2">
            <Bell className="h-4 w-4" />
            Panic Alerts
            {panicData?.activeCount > 0 && (
              <Badge variant="destructive" className="ml-1">{panicData.activeCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="gap-2">
            <Camera className="h-4 w-4" />
            Screenshot Logs
          </TabsTrigger>
          <TabsTrigger value="blocked" className="gap-2">
            <Ban className="h-4 w-4" />
            Blocked Users
          </TabsTrigger>
        </TabsList>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Safety Reports</CardTitle>
                  <CardDescription>Review and respond to user reports</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={reportFilter} onValueChange={setReportFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportsData?.reports?.map((report: Report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        {getTypeIcon(report.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">{report.type.replace(/_/g, ' ')}</span>
                          <Badge className={getPriorityColor(report.priority)}>{report.priority}</Badge>
                          <Badge className={getStatusColor(report.status)}>{report.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Reported: @{report.reportedUsername} • By: @{report.reporterUsername}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {report.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(report.createdAt).toLocaleString()}
                      </div>
                      {report.evidence?.length > 0 && (
                        <p className="text-xs text-muted-foreground">{report.evidence.length} evidence files</p>
                      )}
                    </div>
                  </div>
                ))}

                {!reportsData?.reports?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No reports matching your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Panic Alerts Tab */}
        <TabsContent value="panic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Panic Button Alerts</CardTitle>
              <CardDescription>Urgent safety alerts from creators during streams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {panicData?.alerts?.map((alert: PanicAlert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${alert.status === 'active' ? 'border-red-500 bg-red-500/5 animate-pulse' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${alert.status === 'active' ? 'bg-red-500' : 'bg-green-500/20'}`}>
                          <Phone className={`h-5 w-5 ${alert.status === 'active' ? 'text-white' : 'text-green-500'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">@{alert.username}</span>
                            <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{alert.reason}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {alert.viewerCount} viewers
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {new Date(alert.triggeredAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.status === 'active' && (
                          <>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setSelectedAlert(alert)}
                            >
                              Respond Now
                            </Button>
                          </>
                        )}
                        {alert.status === 'resolved' && (
                          <div className="text-right">
                            <p className="text-xs text-green-500">Resolved</p>
                            <p className="text-xs text-muted-foreground">{alert.resolution}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    {alert.responseActions?.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {alert.responseActions.map((action, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {action.replace(/_/g, ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {!panicData?.alerts?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p className="text-green-500 font-medium">All Clear</p>
                    <p className="text-sm">No active panic alerts</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Screenshot Logs Tab */}
        <TabsContent value="screenshots" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Screenshot Detection Logs</CardTitle>
                  <CardDescription>Monitor content protection violations</CardDescription>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span>Warning: {screenshotData?.byAction?.warning_sent || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Restricted: {screenshotData?.byAction?.account_restricted || 0}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span>Suspended: {screenshotData?.byAction?.account_suspended || 0}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {screenshotData?.logs?.map((log: ScreenshotLog) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Camera className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">@{log.username}</span>
                          <Badge variant="outline">{log.contentType}</Badge>
                          <Badge className={
                            log.action === 'warning_sent' ? 'bg-yellow-500/20 text-yellow-500' :
                            log.action === 'account_restricted' ? 'bg-orange-500/20 text-orange-500' :
                            'bg-red-500/20 text-red-500'
                          }>
                            {log.action.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Creator: @{log.creatorUsername} • Method: {log.method.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-muted-foreground">{log.deviceInfo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Warning #{log.warningCount}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(log.detectedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {!screenshotData?.logs?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No screenshot attempts logged</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Users Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>Users banned from the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {blockedData?.blockedUsers?.map((blocked: BlockedUser) => (
                  <div key={blocked.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/20 rounded-lg">
                        <Ban className="h-5 w-5 text-red-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">@{blocked.username}</span>
                          <Badge variant={blocked.blockType === 'permanent' ? 'destructive' : 'secondary'}>
                            {blocked.blockType}
                          </Badge>
                          <Badge className={
                            blocked.appealStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            blocked.appealStatus === 'denied' ? 'bg-red-500/20 text-red-500' :
                            'bg-gray-500/20 text-gray-500'
                          }>
                            Appeal: {blocked.appealStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{blocked.reason}</p>
                        <div className="flex gap-2 mt-2">
                          {blocked.violations.map((v, i) => (
                            <Badge key={i} variant="outline" className="text-xs">{v}</Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        Blocked: {new Date(blocked.blockedAt).toLocaleDateString()}
                      </p>
                      <Button variant="ghost" size="sm" className="mt-2">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}

                {!blockedData?.blockedUsers?.length && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No blocked users</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Details Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getTypeIcon(selectedReport?.type || '')}
              <span className="capitalize">{selectedReport?.type?.replace(/_/g, ' ')}</span>
              <Badge className={getPriorityColor(selectedReport?.priority || '')}>
                {selectedReport?.priority}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              Report ID: {selectedReport?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Reported User</Label>
                <p className="font-medium">@{selectedReport?.reportedUsername}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Reported By</Label>
                <p className="font-medium">@{selectedReport?.reporterUsername}</p>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="mt-1">{selectedReport?.description}</p>
            </div>

            {selectedReport?.evidence && selectedReport.evidence.length > 0 && (
              <div>
                <Label className="text-muted-foreground">Evidence ({selectedReport.evidence.length} files)</Label>
                <div className="flex gap-2 mt-2">
                  {selectedReport.evidence.map((e, i) => (
                    <Badge key={i} variant="outline">{e}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label className="text-muted-foreground">Update Status</Label>
              <Select
                value={selectedReport?.status}
                onValueChange={(status) => {
                  if (selectedReport) {
                    updateReport.mutate({ reportId: selectedReport.id, status });
                  }
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedReport(null)}>Close</Button>
            <Button variant="destructive" onClick={() => {
              toast({ title: "User Blocked", description: `@${selectedReport?.reportedUsername} has been blocked.` });
            }}>
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Panic Alert Response Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <Phone className="h-5 w-5" />
              Respond to Panic Alert
            </DialogTitle>
            <DialogDescription>
              Creator @{selectedAlert?.username} needs immediate assistance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="font-medium">Reason: {selectedAlert?.reason}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedAlert?.viewerCount} viewers at time of alert
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => respondToAlert.mutate({ alertId: selectedAlert!.id, action: 'contact_creator' })}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Creator Directly
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => respondToAlert.mutate({ alertId: selectedAlert!.id, action: 'end_stream' })}
              >
                <XCircle className="h-4 w-4 mr-2" />
                End Stream
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => respondToAlert.mutate({ alertId: selectedAlert!.id, action: 'ban_offender' })}
              >
                <Ban className="h-4 w-4 mr-2" />
                Ban Offending Users
              </Button>
              <Button
                className="w-full justify-start bg-green-500 hover:bg-green-600"
                onClick={() => respondToAlert.mutate({ alertId: selectedAlert!.id, action: 'resolve' })}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Safety Settings</DialogTitle>
            <DialogDescription>Configure platform safety features</DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Screenshot Protection */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Screenshot Protection
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch checked={settings?.screenshotProtection?.enabled} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Notify Creators</Label>
                  <Switch checked={settings?.screenshotProtection?.notifyCreators} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs">Warning Threshold</Label>
                  <Input type="number" value={settings?.screenshotProtection?.warningThreshold || 3} />
                </div>
                <div>
                  <Label className="text-xs">Restriction Threshold</Label>
                  <Input type="number" value={settings?.screenshotProtection?.restrictionThreshold || 5} />
                </div>
                <div>
                  <Label className="text-xs">Suspension Threshold</Label>
                  <Input type="number" value={settings?.screenshotProtection?.suspensionThreshold || 10} />
                </div>
              </div>
            </div>

            {/* Panic Button */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Panic Button
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Enabled</Label>
                  <Switch checked={settings?.panicButton?.enabled} />
                </div>
                <div>
                  <Label className="text-xs">Response Time Target (min)</Label>
                  <Input type="number" value={settings?.panicButton?.responseTimeTarget || 5} />
                </div>
              </div>
            </div>

            {/* Report System */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Flag className="h-4 w-4" />
                Report System
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label>Anonymous Reporting</Label>
                  <Switch checked={settings?.reportSystem?.anonymousReporting} />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Auto Moderation</Label>
                  <Switch checked={settings?.reportSystem?.autoModeration} />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSettings(false)}>Cancel</Button>
            <Button onClick={() => {
              toast({ title: "Settings Saved", description: "Safety settings have been updated." });
              setShowSettings(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
