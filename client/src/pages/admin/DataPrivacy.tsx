import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  FileText,
  Users,
  Scale,
  Eye,
  Calendar,
  Play,
  Pause,
  XCircle,
  Archive,
  Database,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

// Types
interface RetentionStats {
  pendingExports: number;
  pendingDeletions: number;
  activeLegalHolds: number;
  exportsThisMonth: number;
  deletionsThisMonth: number;
}

interface SchedulerStats {
  exportsProcessed: number;
  exportsFailed: number;
  deletionsProcessed: number;
  deletionsFailed: number;
  archivesCleaned: number;
  remindersSent: number;
  lastRunAt: string | null;
  isRunning: boolean;
}

interface PendingWork {
  pendingExports: number;
  pendingDeletions: number;
  expiringSoonDeletions: number;
  expiredExports: number;
}

interface ExportRequest {
  id: string;
  userId: string;
  platformId: string;
  status: string;
  format: string;
  archiveUrl?: string;
  archiveSizeBytes?: number;
  expiresAt?: string;
  downloadCount?: number;
  createdAt: string;
}

interface DeletionRequest {
  id: string;
  userId: string;
  platformId: string;
  status: string;
  requestType: string;
  reason?: string;
  gracePeriodDays?: number;
  gracePeriodEndsAt?: string;
  scheduledDeletionAt?: string;
  recordsDeleted?: number;
  createdAt: string;
}

interface LegalHold {
  id: string;
  name: string;
  description?: string;
  caseReference?: string;
  affectedUserIds: string[];
  affectedPlatformIds: string[];
  holdStartDate: string;
  holdEndDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  completed: "bg-green-500",
  failed: "bg-red-500",
  expired: "bg-gray-500",
  downloaded: "bg-purple-500",
  grace_period: "bg-orange-500",
  cancelled: "bg-gray-400",
  held: "bg-red-600",
  partial: "bg-amber-500",
};

const PIE_COLORS = ["#22c55e", "#eab308", "#3b82f6", "#ef4444", "#8b5cf6"];

export default function DataPrivacy() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateHoldOpen, setIsCreateHoldOpen] = useState(false);
  const [newHold, setNewHold] = useState({
    name: "",
    description: "",
    caseReference: "",
    affectedUserIds: "",
    holdStartDate: new Date().toISOString().split("T")[0],
  });

  // Fetch admin stats
  const { data: adminStats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["data-retention-admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/data-retention/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      return data.data as {
        retention: RetentionStats;
        scheduler: SchedulerStats;
        pending: PendingWork;
      };
    },
    refetchInterval: 30000,
  });

  // Trigger export processing
  const triggerExportsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/data-retention/admin/trigger-exports", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger exports");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Export processing triggered" });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Failed to trigger exports",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Trigger deletion processing
  const triggerDeletionsMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/data-retention/admin/trigger-deletions", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to trigger deletions");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Deletion processing triggered" });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Failed to trigger deletions",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create legal hold
  const createHoldMutation = useMutation({
    mutationFn: async (holdData: any) => {
      const res = await fetch("/api/data-retention/admin/legal-hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holdData),
      });
      if (!res.ok) throw new Error("Failed to create legal hold");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Legal hold created successfully" });
      setIsCreateHoldOpen(false);
      setNewHold({
        name: "",
        description: "",
        caseReference: "",
        affectedUserIds: "",
        holdStartDate: new Date().toISOString().split("T")[0],
      });
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Failed to create legal hold",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Format bytes
  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  // Stats for pie chart
  const getStatusPieData = () => {
    if (!adminStats?.retention) return [];
    return [
      { name: "Completed Exports", value: adminStats.retention.exportsThisMonth, color: "#22c55e" },
      { name: "Pending Exports", value: adminStats.pending.pendingExports, color: "#eab308" },
      { name: "Pending Deletions", value: adminStats.pending.pendingDeletions, color: "#ef4444" },
      { name: "Expiring Soon", value: adminStats.pending.expiringSoonDeletions, color: "#f97316" },
    ].filter(item => item.value > 0);
  };

  if (statsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Data Privacy & Retention
          </h1>
          <p className="text-muted-foreground">
            GDPR/CCPA compliance management for data exports, deletions, and legal holds
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetchStats()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Scheduler Status */}
      {adminStats?.scheduler && (
        <Alert className={adminStats.scheduler.isRunning ? "border-green-500" : "border-red-500"}>
          <div className="flex items-center gap-2">
            {adminStats.scheduler.isRunning ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <AlertDescription>
              <span className="font-medium">
                Scheduler {adminStats.scheduler.isRunning ? "Running" : "Stopped"}
              </span>
              {adminStats.scheduler.lastRunAt && (
                <span className="ml-2 text-muted-foreground">
                  Last run: {formatDistanceToNow(new Date(adminStats.scheduler.lastRunAt))} ago
                </span>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Exports</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.pending.pendingExports || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.retention.exportsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Deletions</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.pending.pendingDeletions || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.pending.expiringSoonDeletions || 0} expiring in 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Legal Holds</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.retention.activeLegalHolds || 0}</div>
            <p className="text-xs text-muted-foreground">Active holds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exports Processed</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.scheduler.exportsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.scheduler.exportsFailed || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deletions Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminStats?.scheduler.deletionsProcessed || 0}</div>
            <p className="text-xs text-muted-foreground">
              {adminStats?.scheduler.deletionsFailed || 0} failed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Request Distribution</CardTitle>
            <CardDescription>Current status of data requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={getStatusPieData()}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {getStatusPieData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {getStatusPieData().map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manual scheduler controls</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <Button
                onClick={() => triggerExportsMutation.mutate()}
                disabled={triggerExportsMutation.isPending}
                className="w-full"
              >
                <Play className="h-4 w-4 mr-2" />
                Process Pending Exports
                {adminStats?.pending.pendingExports
                  ? ` (${adminStats.pending.pendingExports})`
                  : ""}
              </Button>

              <Button
                onClick={() => triggerDeletionsMutation.mutate()}
                disabled={triggerDeletionsMutation.isPending}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Process Ready Deletions
                {adminStats?.pending.pendingDeletions
                  ? ` (${adminStats.pending.pendingDeletions})`
                  : ""}
              </Button>

              <Dialog open={isCreateHoldOpen} onOpenChange={setIsCreateHoldOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Lock className="h-4 w-4 mr-2" />
                    Create Legal Hold
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Legal Hold</DialogTitle>
                    <DialogDescription>
                      Create a new legal hold to prevent data deletion for specific users or
                      platforms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="hold-name">Hold Name *</Label>
                      <Input
                        id="hold-name"
                        value={newHold.name}
                        onChange={(e) =>
                          setNewHold({ ...newHold, name: e.target.value })
                        }
                        placeholder="e.g., Investigation #12345"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="case-ref">Case Reference</Label>
                      <Input
                        id="case-ref"
                        value={newHold.caseReference}
                        onChange={(e) =>
                          setNewHold({ ...newHold, caseReference: e.target.value })
                        }
                        placeholder="e.g., CASE-2024-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newHold.description}
                        onChange={(e) =>
                          setNewHold({ ...newHold, description: e.target.value })
                        }
                        placeholder="Reason for legal hold..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="affected-users">
                        Affected User IDs (comma-separated)
                      </Label>
                      <Input
                        id="affected-users"
                        value={newHold.affectedUserIds}
                        onChange={(e) =>
                          setNewHold({ ...newHold, affectedUserIds: e.target.value })
                        }
                        placeholder="user-123, user-456"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date *</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={newHold.holdStartDate}
                        onChange={(e) =>
                          setNewHold({ ...newHold, holdStartDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateHoldOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() =>
                        createHoldMutation.mutate({
                          name: newHold.name,
                          description: newHold.description,
                          caseReference: newHold.caseReference,
                          affectedUserIds: newHold.affectedUserIds
                            .split(",")
                            .map((id) => id.trim())
                            .filter(Boolean),
                          holdStartDate: new Date(newHold.holdStartDate).toISOString(),
                        })
                      }
                      disabled={!newHold.name || createHoldMutation.isPending}
                    >
                      {createHoldMutation.isPending ? "Creating..." : "Create Hold"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {/* Scheduler Metrics */}
            <div className="pt-4 border-t space-y-3">
              <h4 className="font-medium text-sm">Scheduler Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Archive className="h-4 w-4 text-muted-foreground" />
                  <span>Archives cleaned: {adminStats?.scheduler.archivesCleaned || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Reminders sent: {adminStats?.scheduler.remindersSent || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <span>Expired exports: {adminStats?.pending.expiredExports || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Expiring soon: {adminStats?.pending.expiringSoonDeletions || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Information Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Export (GDPR Art. 20)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Right to Data Portability:</strong> Users can request a complete copy of their
              data in a machine-readable format.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Exports include profile, content, messages, transactions</li>
              <li>Available in JSON, CSV, or ZIP format</li>
              <li>Download links expire after 7 days</li>
              <li>Processing typically completes within 24 hours</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Account Deletion (GDPR Art. 17)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Right to Erasure:</strong> Users can request permanent deletion of their
              account and associated data.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>30-day grace period (can be cancelled)</li>
              <li>Financial records anonymized (7-year tax retention)</li>
              <li>Content files permanently deleted from storage</li>
              <li>Fraud data retained for 5 years (anonymized)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5" />
              Legal Holds
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>
              <strong>Litigation Hold:</strong> Preserve user data when required for legal
              proceedings or investigations.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Blocks deletion requests for affected users</li>
              <li>Can target specific users or entire platforms</li>
              <li>Requires case reference and approval</li>
              <li>Automatically expires when hold is released</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Current state of data protection compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">GDPR Compliant</div>
                <div className="text-sm text-muted-foreground">EU Data Protection</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">CCPA Compliant</div>
                <div className="text-sm text-muted-foreground">California Privacy</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">LGPD Compliant</div>
                <div className="text-sm text-muted-foreground">Brazil Privacy</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <div className="font-medium">Audit Logging</div>
                <div className="text-sm text-muted-foreground">Full traceability</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
