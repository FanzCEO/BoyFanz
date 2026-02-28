import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  ClipboardList,
  Search,
  Filter,
  Clock,
  User,
  Settings,
  FileText,
  DollarSign,
  Shield,
  Trash2,
  Edit,
  Plus,
  Eye,
  RefreshCw,
  Undo2
} from "lucide-react";
import { useState } from "react";

interface AuditLogEntry {
  id: number;
  adminId: number;
  adminUsername: string;
  action: string;
  entityType: string;
  entityId: number | null;
  previousState: any;
  newState: any;
  ipAddress: string;
  userAgent: string;
  canUndo: boolean;
  createdAt: string;
}

interface AdminActivitySummary {
  adminId: number;
  adminUsername: string;
  totalActions: number;
  lastAction: string;
}

export default function AuditLog() {
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  const { data: logs, isLoading: logsLoading, refetch } = useQuery<AuditLogEntry[]>({
    queryKey: ["/api/admin/audit/logs", actionFilter, entityFilter],
  });

  const { data: activitySummary } = useQuery<AdminActivitySummary[]>({
    queryKey: ["/api/admin/audit/activity-summary"],
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "create": return <Plus className="h-4 w-4 text-green-500" />;
      case "update": return <Edit className="h-4 w-4 text-blue-500" />;
      case "delete": return <Trash2 className="h-4 w-4 text-red-500" />;
      case "view": return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Settings className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-500";
      case "update": return "bg-blue-500";
      case "delete": return "bg-red-500";
      case "view": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType) {
      case "user": return <User className="h-4 w-4" />;
      case "content": return <FileText className="h-4 w-4" />;
      case "payment": return <DollarSign className="h-4 w-4" />;
      case "settings": return <Settings className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      default: return <ClipboardList className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const filteredLogs = logs?.filter(log => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        log.adminUsername.toLowerCase().includes(query) ||
        log.action.toLowerCase().includes(query) ||
        log.entityType.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Audit Log</h1>
          <p className="text-muted-foreground">Track all administrative actions for compliance and security</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Admin Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {activitySummary?.slice(0, 4).map((admin) => (
          <Card key={admin.adminId}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                {admin.adminUsername}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{admin.totalActions}</div>
              <p className="text-xs text-muted-foreground">
                Last: {formatTimeAgo(admin.lastAction)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by admin, action, or entity..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
              </SelectContent>
            </Select>
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="settings">Settings</SelectItem>
                <SelectItem value="security">Security</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Loading audit logs...</TableCell>
                </TableRow>
              ) : filteredLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">No audit logs found</TableCell>
                </TableRow>
              ) : (
                filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {formatTimeAgo(log.createdAt)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{log.adminUsername}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>
                        <span className="flex items-center gap-1">
                          {getActionIcon(log.action)}
                          {log.action}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityIcon(log.entityType)}
                        <span className="capitalize">{log.entityType}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.entityId ? `#${log.entityId}` : "-"}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono">{log.ipAddress}</span>
                    </TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="ghost" onClick={() => setSelectedEntry(log)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              Full details of the administrative action
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-1">Admin</h4>
                                <p className="text-sm">{log.adminUsername}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Timestamp</h4>
                                <p className="text-sm">{new Date(log.createdAt).toLocaleString()}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Action</h4>
                                <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">Entity</h4>
                                <p className="text-sm capitalize">{log.entityType} #{log.entityId}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">IP Address</h4>
                                <p className="text-sm font-mono">{log.ipAddress}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-1">User Agent</h4>
                                <p className="text-sm text-xs truncate">{log.userAgent}</p>
                              </div>
                            </div>

                            {log.previousState && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">Previous State</h4>
                                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                                  {JSON.stringify(log.previousState, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.newState && (
                              <div>
                                <h4 className="text-sm font-medium mb-1">New State</h4>
                                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                                  {JSON.stringify(log.newState, null, 2)}
                                </pre>
                              </div>
                            )}

                            {log.canUndo && (
                              <div className="pt-4 border-t">
                                <Button variant="outline" className="w-full">
                                  <Undo2 className="h-4 w-4 mr-2" />
                                  Undo This Action
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
