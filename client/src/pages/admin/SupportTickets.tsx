import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Ticket,
  Clock,
  AlertCircle,
  CheckCircle,
  MessageSquare,
  User,
  Calendar,
  RefreshCw,
  Send,
  UserPlus,
  XCircle
} from "lucide-react";
import { useState } from "react";

interface SupportTicket {
  id: number;
  userId: number;
  username: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: number | null;
  assignedUsername: string | null;
  slaDeadline: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TicketMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderName: string;
  isStaff: boolean;
  message: string;
  createdAt: string;
}

interface TicketStats {
  total: number;
  open: number;
  pending: number;
  resolved: number;
  avgResponseTime: string;
}

export default function SupportTickets() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("open");

  const { data: tickets, isLoading: ticketsLoading } = useQuery<SupportTicket[]>({
    queryKey: ["/api/admin/support-tickets", statusFilter],
  });

  const { data: stats } = useQuery<TicketStats>({
    queryKey: ["/api/admin/support-tickets/stats"],
  });

  const { data: ticketMessages, isLoading: messagesLoading } = useQuery<{ ticket: SupportTicket; messages: TicketMessage[] }>({
    queryKey: ["/api/admin/support-tickets", selectedTicket?.id],
    enabled: !!selectedTicket,
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      return apiRequest("POST", `/api/admin/support-tickets/${ticketId}/reply`, { message });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setReplyMessage("");
      toast({ title: "Reply sent", description: "Your response has been added to the ticket." });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({ ticketId, adminId }: { ticketId: number; adminId: number }) => {
      return apiRequest("POST", `/api/admin/support-tickets/${ticketId}/assign`, { adminId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      toast({ title: "Ticket assigned", description: "The ticket has been assigned successfully." });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      return apiRequest("POST", `/api/admin/support-tickets/${ticketId}/resolve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] });
      setSelectedTicket(null);
      toast({ title: "Ticket resolved", description: "The ticket has been marked as resolved." });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-yellow-500 text-black";
      case "low": return "bg-blue-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "bg-green-500";
      case "pending": return "bg-yellow-500";
      case "in_progress": return "bg-blue-500";
      case "resolved": return "bg-gray-500";
      case "closed": return "bg-gray-700";
      default: return "bg-gray-500";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage customer support requests and inquiries</p>
        </div>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/support-tickets"] })}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Total Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-green-500" />
              Open
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats?.open || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats?.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats?.resolved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats?.avgResponseTime || "N/A"}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ticket List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">Tickets</CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ticketsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading tickets...</TableCell>
                    </TableRow>
                  ) : tickets?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">No tickets found</TableCell>
                    </TableRow>
                  ) : (
                    tickets?.map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className={`cursor-pointer hover:bg-muted ${selectedTicket?.id === ticket.id ? "bg-muted" : ""}`}
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <TableCell>#{ticket.id}</TableCell>
                        <TableCell className="max-w-xs truncate">{ticket.subject}</TableCell>
                        <TableCell>@{ticket.username}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>{ticket.status.replace("_", " ")}</Badge>
                        </TableCell>
                        <TableCell>{formatTimeAgo(ticket.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Detail Panel */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedTicket ? `Ticket #${selectedTicket.id}` : "Select a Ticket"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedTicket ? (
                <div className="text-center py-8 text-muted-foreground">
                  Click on a ticket to view details
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">{selectedTicket.subject}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className={getPriorityColor(selectedTicket.priority)}>{selectedTicket.priority}</Badge>
                      <Badge className={getStatusColor(selectedTicket.status)}>{selectedTicket.status}</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>From: @{selectedTicket.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                    </div>
                    {selectedTicket.assignedUsername && (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        <span>Assigned to: {selectedTicket.assignedUsername}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Messages
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {messagesLoading ? (
                        <p className="text-sm text-muted-foreground">Loading messages...</p>
                      ) : ticketMessages?.messages?.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No messages yet</p>
                      ) : (
                        ticketMessages?.messages?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-3 rounded-lg ${msg.isStaff ? "bg-blue-50 border-l-2 border-blue-500" : "bg-gray-50"}`}
                          >
                            <div className="flex justify-between text-xs mb-1">
                              <span className="font-medium">{msg.senderName}</span>
                              <span className="text-muted-foreground">{formatTimeAgo(msg.createdAt)}</span>
                            </div>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {selectedTicket.status !== "resolved" && selectedTicket.status !== "closed" && (
                    <div className="border-t pt-4 space-y-3">
                      <Textarea
                        placeholder="Type your reply..."
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: replyMessage })}
                          disabled={!replyMessage.trim()}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Reply
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => resolveMutation.mutate(selectedTicket.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolve
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
