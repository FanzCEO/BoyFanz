import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Trash2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Eye,
  XCircle,
  Lock,
  Info,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";

// Types
interface ExportRequest {
  id: string;
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
  status: string;
  requestType: string;
  reason?: string;
  gracePeriodDays?: number;
  gracePeriodEndsAt?: string;
  canCancelUntil?: string;
  scheduledDeletionAt?: string;
  recordsDeleted?: number;
  createdAt: string;
}

interface Consent {
  id: string;
  consentType: string;
  status: string;
  version: string;
  grantedAt?: string;
  withdrawnAt?: string;
}

interface PrivacyDashboard {
  exports: {
    pending: number;
    completed: number;
    latestExport: ExportRequest | null;
  };
  deletions: {
    pending: number;
    activeRequest: DeletionRequest | null;
  };
  consents: Record<string, boolean>;
  legalHolds: {
    hasActiveHolds: boolean;
  };
  rights: Record<string, string>;
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
};

export default function PrivacySettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [exportOptions, setExportOptions] = useState({
    includeProfile: true,
    includeContent: true,
    includeMessages: true,
    includeTransactions: true,
    includeSubscriptions: true,
    format: "json" as "json" | "csv" | "zip",
  });

  // Fetch privacy dashboard
  const { data: dashboard, isLoading, refetch } = useQuery({
    queryKey: ["privacy-dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/data-retention/dashboard");
      if (!res.ok) throw new Error("Failed to fetch privacy dashboard");
      const data = await res.json();
      return data.data as PrivacyDashboard;
    },
  });

  // Fetch export requests
  const { data: exportRequests } = useQuery({
    queryKey: ["export-requests"],
    queryFn: async () => {
      const res = await fetch("/api/data-retention/export");
      if (!res.ok) throw new Error("Failed to fetch exports");
      const data = await res.json();
      return data.data as ExportRequest[];
    },
  });

  // Fetch deletion requests
  const { data: deletionRequests } = useQuery({
    queryKey: ["deletion-requests"],
    queryFn: async () => {
      const res = await fetch("/api/data-retention/delete");
      if (!res.ok) throw new Error("Failed to fetch deletions");
      const data = await res.json();
      return data.data as DeletionRequest[];
    },
  });

  // Fetch consents
  const { data: consents } = useQuery({
    queryKey: ["user-consents"],
    queryFn: async () => {
      const res = await fetch("/api/data-retention/consent");
      if (!res.ok) throw new Error("Failed to fetch consents");
      const data = await res.json();
      return data.data as Consent[];
    },
  });

  // Request data export
  const requestExportMutation = useMutation({
    mutationFn: async (options: typeof exportOptions) => {
      const res = await fetch("/api/data-retention/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });
      if (!res.ok) throw new Error("Failed to request export");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Export request submitted",
        description: "You'll be notified when your data is ready for download.",
      });
      setIsExportDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["export-requests"] });
      queryClient.invalidateQueries({ queryKey: ["privacy-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to request export",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Request account deletion
  const requestDeletionMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await fetch("/api/data-retention/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestType: "full_account",
          reason,
          gracePeriodDays: 30,
        }),
      });
      if (!res.ok) throw new Error("Failed to request deletion");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deletion request submitted",
        description: "Your account will be deleted in 30 days. You can cancel anytime before then.",
      });
      setIsDeleteDialogOpen(false);
      setDeleteReason("");
      setDeleteConfirmText("");
      queryClient.invalidateQueries({ queryKey: ["deletion-requests"] });
      queryClient.invalidateQueries({ queryKey: ["privacy-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to request deletion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel deletion
  const cancelDeletionMutation = useMutation({
    mutationFn: async (deletionId: string) => {
      const res = await fetch(`/api/data-retention/delete/${deletionId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to cancel deletion");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Deletion cancelled",
        description: "Your account will remain active.",
      });
      queryClient.invalidateQueries({ queryKey: ["deletion-requests"] });
      queryClient.invalidateQueries({ queryKey: ["privacy-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to cancel deletion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update consent
  const updateConsentMutation = useMutation({
    mutationFn: async (params: { consentType: string; granted: boolean }) => {
      const res = await fetch("/api/data-retention/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          version: "1.0",
        }),
      });
      if (!res.ok) throw new Error("Failed to update consent");
      return res.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: `Consent ${variables.granted ? "granted" : "withdrawn"}`,
        description: `${variables.consentType} preference updated.`,
      });
      queryClient.invalidateQueries({ queryKey: ["user-consents"] });
      queryClient.invalidateQueries({ queryKey: ["privacy-dashboard"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update consent",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "0 B";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const activeDeleteRequest = deletionRequests?.find(
    (r) => r.status === "grace_period" || r.status === "pending"
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Privacy & Data
          </h1>
          <p className="text-muted-foreground">
            Manage your data, privacy preferences, and account
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Active Deletion Warning */}
      {activeDeleteRequest && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Account Scheduled for Deletion</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              Your account will be deleted on{" "}
              {activeDeleteRequest.gracePeriodEndsAt
                ? format(new Date(activeDeleteRequest.gracePeriodEndsAt), "PPP")
                : "soon"}
              . You have{" "}
              {activeDeleteRequest.gracePeriodEndsAt
                ? formatDistanceToNow(new Date(activeDeleteRequest.gracePeriodEndsAt))
                : "limited time"}{" "}
              to cancel.
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancelDeletionMutation.mutate(activeDeleteRequest.id)}
              disabled={cancelDeletionMutation.isPending}
            >
              {cancelDeletionMutation.isPending ? "Cancelling..." : "Cancel Deletion"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Legal Hold Notice */}
      {dashboard?.legalHolds.hasActiveHolds && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertTitle>Data Retention Notice</AlertTitle>
          <AlertDescription>
            Your account has an active legal hold. Some data operations may be restricted until the
            hold is released.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="exports">Data Exports</TabsTrigger>
          <TabsTrigger value="consent">Privacy Preferences</TabsTrigger>
          <TabsTrigger value="delete">Delete Account</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Your Rights */}
          <Card>
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
              <CardDescription>
                We respect your privacy. Here are the rights you have over your data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Download className="h-6 w-6 text-primary mt-1" />
                <div>
                  <h4 className="font-medium">Right to Portability</h4>
                  <p className="text-sm text-muted-foreground">
                    Request a copy of all your data in a machine-readable format.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Trash2 className="h-6 w-6 text-destructive mt-1" />
                <div>
                  <h4 className="font-medium">Right to Erasure</h4>
                  <p className="text-sm text-muted-foreground">
                    Request permanent deletion of your account and data.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <Eye className="h-6 w-6 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">Right to Access</h4>
                  <p className="text-sm text-muted-foreground">
                    View all the data we have about you at any time.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/50">
                <FileText className="h-6 w-6 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Right to Rectification</h4>
                  <p className="text-sm text-muted-foreground">
                    Update your personal information in your account settings.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Download Your Data
                </CardTitle>
                <CardDescription>
                  Get a complete copy of all your data including profile, content, messages, and
                  transactions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">Request Data Export</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Request Data Export</DialogTitle>
                      <DialogDescription>
                        Select what data you want to include in your export. Processing typically
                        takes 24 hours.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center justify-between">
                        <Label>Profile Information</Label>
                        <Switch
                          checked={exportOptions.includeProfile}
                          onCheckedChange={(v) =>
                            setExportOptions({ ...exportOptions, includeProfile: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Content (Posts, Media)</Label>
                        <Switch
                          checked={exportOptions.includeContent}
                          onCheckedChange={(v) =>
                            setExportOptions({ ...exportOptions, includeContent: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Messages</Label>
                        <Switch
                          checked={exportOptions.includeMessages}
                          onCheckedChange={(v) =>
                            setExportOptions({ ...exportOptions, includeMessages: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Transactions</Label>
                        <Switch
                          checked={exportOptions.includeTransactions}
                          onCheckedChange={(v) =>
                            setExportOptions({ ...exportOptions, includeTransactions: v })
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>Subscriptions</Label>
                        <Switch
                          checked={exportOptions.includeSubscriptions}
                          onCheckedChange={(v) =>
                            setExportOptions({ ...exportOptions, includeSubscriptions: v })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Export Format</Label>
                        <Select
                          value={exportOptions.format}
                          onValueChange={(v: "json" | "csv" | "zip") =>
                            setExportOptions({ ...exportOptions, format: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                            <SelectItem value="zip">ZIP Archive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={() => requestExportMutation.mutate(exportOptions)}
                        disabled={requestExportMutation.isPending}
                      >
                        {requestExportMutation.isPending ? "Requesting..." : "Request Export"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {dashboard?.exports.latestExport && (
                  <div className="mt-4 p-3 rounded-lg bg-muted">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Latest Export</p>
                        <p className="text-xs text-muted-foreground">
                          {dashboard.exports.latestExport.archiveSizeBytes
                            ? formatBytes(dashboard.exports.latestExport.archiveSizeBytes)
                            : "Processing..."}
                        </p>
                      </div>
                      {dashboard.exports.latestExport.archiveUrl && (
                        <Button size="sm" variant="outline" asChild>
                          <a
                            href={`/api/data-retention/export/${dashboard.exports.latestExport.id}/download`}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <Trash2 className="h-5 w-5" />
                  Delete Account
                </CardTitle>
                <CardDescription>
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeDeleteRequest ? (
                  <div className="space-y-4">
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Deletion scheduled for{" "}
                        {activeDeleteRequest.gracePeriodEndsAt
                          ? format(new Date(activeDeleteRequest.gracePeriodEndsAt), "PPP")
                          : "soon"}
                      </AlertDescription>
                    </Alert>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => cancelDeletionMutation.mutate(activeDeleteRequest.id)}
                      disabled={cancelDeletionMutation.isPending}
                    >
                      {cancelDeletionMutation.isPending ? "Cancelling..." : "Cancel Deletion"}
                    </Button>
                  </div>
                ) : (
                  <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Delete My Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="text-destructive">Delete Account</DialogTitle>
                        <DialogDescription>
                          This will permanently delete your account. You'll have 30 days to cancel.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>
                            <strong>What will be deleted:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Profile and account settings</li>
                              <li>All posts and media</li>
                              <li>Messages and conversations</li>
                              <li>Subscriptions and follows</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>What will be retained:</strong>
                            <ul className="list-disc list-inside mt-2 space-y-1">
                              <li>Anonymized financial records (7 years, tax compliance)</li>
                              <li>Anonymized fraud prevention data</li>
                            </ul>
                          </AlertDescription>
                        </Alert>
                        <div className="space-y-2">
                          <Label>Why are you leaving? (Optional)</Label>
                          <Textarea
                            value={deleteReason}
                            onChange={(e) => setDeleteReason(e.target.value)}
                            placeholder="Your feedback helps us improve..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Type "DELETE" to confirm</Label>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="DELETE"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => requestDeletionMutation.mutate(deleteReason)}
                          disabled={
                            deleteConfirmText !== "DELETE" || requestDeletionMutation.isPending
                          }
                        >
                          {requestDeletionMutation.isPending
                            ? "Processing..."
                            : "Delete My Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export History</CardTitle>
              <CardDescription>
                View and download your previous data exports
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!exportRequests?.length ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Download className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No export requests yet</p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsExportDialogOpen(true)}
                  >
                    Request Your First Export
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {exportRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[request.status]}>
                            {request.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), "PPP")}
                          </span>
                        </div>
                        <div className="text-sm">
                          {request.archiveSizeBytes
                            ? formatBytes(request.archiveSizeBytes)
                            : "Processing..."}
                          {request.expiresAt && (
                            <span className="text-muted-foreground ml-2">
                              Expires: {format(new Date(request.expiresAt), "PP")}
                            </span>
                          )}
                        </div>
                      </div>
                      {request.status === "completed" && request.archiveUrl && (
                        <Button size="sm" asChild>
                          <a href={`/api/data-retention/export/${request.id}/download`}>
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consent Tab */}
        <TabsContent value="consent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Preferences</CardTitle>
              <CardDescription>
                Control how we use your data for different purposes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                {
                  type: "marketing",
                  title: "Marketing Communications",
                  description: "Receive emails about promotions, new features, and updates",
                },
                {
                  type: "analytics",
                  title: "Analytics & Improvements",
                  description: "Help us improve by allowing anonymous usage analytics",
                },
                {
                  type: "personalization",
                  title: "Personalized Content",
                  description: "Get content recommendations based on your activity",
                },
                {
                  type: "third_party",
                  title: "Third-Party Sharing",
                  description: "Allow sharing with trusted partners for better services",
                },
              ].map((consent) => {
                const currentConsent = consents?.find((c) => c.consentType === consent.type);
                const isGranted = currentConsent?.status === "granted";

                return (
                  <div
                    key={consent.type}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <h4 className="font-medium">{consent.title}</h4>
                      <p className="text-sm text-muted-foreground">{consent.description}</p>
                    </div>
                    <Switch
                      checked={isGranted}
                      onCheckedChange={(granted) =>
                        updateConsentMutation.mutate({ consentType: consent.type, granted })
                      }
                      disabled={updateConsentMutation.isPending}
                    />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Delete Tab */}
        <TabsContent value="delete" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Delete Account</CardTitle>
              <CardDescription>
                Permanently remove your account and all associated data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Before you delete</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Download your data first using the export feature</li>
                    <li>Cancel any active subscriptions</li>
                    <li>Withdraw any available earnings</li>
                    <li>Save any important messages or content</li>
                  </ul>
                </AlertDescription>
              </Alert>

              {activeDeleteRequest ? (
                <div className="p-6 rounded-lg bg-destructive/10 border border-destructive space-y-4">
                  <div className="flex items-center gap-2 text-destructive">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Deletion Scheduled</span>
                  </div>
                  <p>
                    Your account will be permanently deleted on{" "}
                    <strong>
                      {activeDeleteRequest.gracePeriodEndsAt
                        ? format(new Date(activeDeleteRequest.gracePeriodEndsAt), "PPPP")
                        : "soon"}
                    </strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You can cancel this request anytime before the deletion date.
                  </p>
                  <Button
                    onClick={() => cancelDeletionMutation.mutate(activeDeleteRequest.id)}
                    disabled={cancelDeletionMutation.isPending}
                  >
                    {cancelDeletionMutation.isPending ? "Cancelling..." : "Cancel Deletion Request"}
                  </Button>
                </div>
              ) : (
                <div className="p-6 rounded-lg border space-y-4">
                  <div className="flex items-center gap-2">
                    <Trash2 className="h-5 w-5 text-destructive" />
                    <span className="font-medium">Request Account Deletion</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    When you delete your account:
                  </p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      All your posts and content will be permanently deleted
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Your messages will be removed
                    </li>
                    <li className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      Your profile information will be erased
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      You'll have 30 days to change your mind
                    </li>
                  </ul>
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Delete My Account
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deletion History */}
          {deletionRequests && deletionRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Deletion History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deletionRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[request.status]}>
                            {request.status.replace("_", " ")}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), "PPP")}
                          </span>
                        </div>
                        {request.reason && (
                          <p className="text-sm text-muted-foreground">
                            Reason: {request.reason}
                          </p>
                        )}
                      </div>
                      {request.status === "grace_period" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => cancelDeletionMutation.mutate(request.id)}
                          disabled={cancelDeletionMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
