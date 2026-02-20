import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle, RefreshCw, AlertCircle, Ban, UserX, CreditCard, Activity } from "lucide-react";
import { useState } from "react";

interface FraudSignal {
  id: number;
  userId: number;
  signalType: string;
  severity: string;
  description: string;
  evidence: any;
  status: string;
  reviewedBy: number | null;
  createdAt: string;
}

interface FraudSummary {
  bySeverity: { severity: string; count: number }[];
  byType: { signalType: string; count: number }[];
  pendingCount: number;
  reviewedToday: number;
}

export default function FraudDetection() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [severityFilter, setSeverityFilter] = useState<string>("all");

  const { data: signals, isLoading: signalsLoading } = useQuery<FraudSignal[]>({
    queryKey: ["/api/admin/fraud/signals", statusFilter, severityFilter],
  });

  const { data: summary } = useQuery<FraudSummary>({
    queryKey: ["/api/admin/fraud/dashboard"],
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ signalId, action }: { signalId: number; action: string }) => {
      return apiRequest("POST", `/api/admin/fraud/signals/${signalId}/review`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud"] });
      toast({ title: "Signal reviewed", description: "Fraud signal has been processed." });
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getSignalIcon = (type: string) => {
    switch (type) {
      case "chargeback": return <CreditCard className="h-4 w-4" />;
      case "account_takeover": return <UserX className="h-4 w-4" />;
      case "suspicious_activity": return <Activity className="h-4 w-4" />;
      case "bot_behavior": return <Ban className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Fraud Detection Dashboard</h1>
          <p className="text-muted-foreground">AI-powered fraud monitoring and prevention</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/fraud"] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-500" />
              Critical Signals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {summary?.bySeverity?.find(s => s.severity === "critical")?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              High Priority
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {summary?.bySeverity?.find(s => s.severity === "high")?.count || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-500" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pendingCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Reviewed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{summary?.reviewedToday || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fraud Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {signalsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading signals...</TableCell>
                </TableRow>
              ) : signals?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No fraud signals found</TableCell>
                </TableRow>
              ) : (
                signals?.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getSignalIcon(signal.signalType)}
                        <span className="capitalize">{signal.signalType.replace("_", " ")}</span>
                      </div>
                    </TableCell>
                    <TableCell>#{signal.userId}</TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(signal.severity)}>{signal.severity}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{signal.description}</TableCell>
                    <TableCell>
                      <Badge variant={signal.status === "pending" ? "outline" : "secondary"}>{signal.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(signal.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {signal.status === "pending" && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => reviewMutation.mutate({ signalId: signal.id, action: "confirm" })}>
                            <CheckCircle className="h-3 w-3 mr-1" />Confirm
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => reviewMutation.mutate({ signalId: signal.id, action: "dismiss" })}>
                            <XCircle className="h-3 w-3 mr-1" />Dismiss
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Signals by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.byType?.map((item) => (
                <div key={item.signalType} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(item.signalType)}
                    <span className="capitalize">{item.signalType.replace("_", " ")}</span>
                  </div>
                  <Badge variant="secondary">{item.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {summary?.bySeverity?.map((item) => (
                <div key={item.severity} className="flex items-center justify-between">
                  <Badge className={getSeverityColor(item.severity)}>{item.severity}</Badge>
                  <span className="font-medium">{item.count} signals</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
