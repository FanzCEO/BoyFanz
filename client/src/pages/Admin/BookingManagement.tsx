import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Clock, 
  User, 
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Eye,
  MessageSquare,
  X,
  Check,
  CalendarDays,
  Video,
  Phone
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Booking {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  type: "video_call" | "phone_call" | "custom" | "meetup";
  status: "pending" | "confirmed" | "completed" | "cancelled" | "no_show";
  scheduledAt: string;
  duration: number; // in minutes
  price: number;
  notes?: string;
  createdAt: string;
  cancelReason?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  completed: "bg-green-500/10 text-green-500 border-green-500/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
  no_show: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

const typeIcons: Record<string, React.ReactNode> = {
  video_call: <Video className="h-4 w-4" />,
  phone_call: <Phone className="h-4 w-4" />,
  custom: <MessageSquare className="h-4 w-4" />,
  meetup: <User className="h-4 w-4" />,
};

export default function BookingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  // Fetch bookings
  const { data: bookings, isLoading, refetch } = useQuery<Booking[]>({
    queryKey: ["/api/admin/bookings", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to load bookings");
      return res.json();
    },
  });

  // Update booking status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancelReason: reason }),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Booking updated", description: "Status has been updated successfully." });
      setSelectedBooking(null);
      setCancelReason("");
    },
    onError: (error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  // Filter bookings
  const filteredBookings = bookings?.filter(booking => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.creatorName.toLowerCase().includes(query) ||
        booking.clientName.toLowerCase().includes(query) ||
        booking.clientEmail.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Stats
  const stats = {
    total: bookings?.length || 0,
    pending: bookings?.filter(b => b.status === "pending").length || 0,
    confirmed: bookings?.filter(b => b.status === "confirmed").length || 0,
    completed: bookings?.filter(b => b.status === "completed").length || 0,
    cancelled: bookings?.filter(b => b.status === "cancelled").length || 0,
    revenue: bookings?.filter(b => b.status === "completed").reduce((sum, b) => sum + b.price, 0) || 0,
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <X className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access booking management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <CalendarDays className="h-8 w-8" />
            Booking Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage creator appointments and bookings
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-blue-500">{stats.confirmed}</div>
            <p className="text-xs text-muted-foreground">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-500">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">${stats.revenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by creator or client..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="no_show">No Show</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <Card>
        <CardHeader>
          <CardTitle>Bookings ({filteredBookings.length})</CardTitle>
          <CardDescription>All scheduled appointments and sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-10">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">No bookings found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "Try a different search term" : "No bookings match the current filter"}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                      {typeIcons[booking.type] || <Calendar className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{booking.creatorName}</span>
                        <span className="text-muted-foreground">→</span>
                        <span>{booking.clientName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(booking.scheduledAt), "MMM d, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(booking.scheduledAt), "h:mm a")}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          ${booking.price}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className={statusColors[booking.status]}>
                      {booking.status.replace("_", " ")}
                    </Badge>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedBooking(booking)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Booking Details</DialogTitle>
                          <DialogDescription>
                            #{booking.id.slice(0, 8)}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <Label className="text-muted-foreground">Creator</Label>
                              <p className="font-medium">{booking.creatorName}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Client</Label>
                              <p className="font-medium">{booking.clientName}</p>
                              <p className="text-xs text-muted-foreground">{booking.clientEmail}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Date & Time</Label>
                              <p className="font-medium">
                                {format(new Date(booking.scheduledAt), "PPp")}
                              </p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Duration</Label>
                              <p className="font-medium">{booking.duration} minutes</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Price</Label>
                              <p className="font-medium">${booking.price}</p>
                            </div>
                            <div>
                              <Label className="text-muted-foreground">Type</Label>
                              <p className="font-medium capitalize">{booking.type.replace("_", " ")}</p>
                            </div>
                          </div>
                          {booking.notes && (
                            <div>
                              <Label className="text-muted-foreground">Notes</Label>
                              <p className="text-sm mt-1">{booking.notes}</p>
                            </div>
                          )}
                          {booking.status === "pending" && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                className="flex-1"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "confirmed" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="destructive" className="flex-1">
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Cancel Booking</DialogTitle>
                                    <DialogDescription>
                                      Provide a reason for cancellation
                                    </DialogDescription>
                                  </DialogHeader>
                                  <Textarea
                                    placeholder="Reason for cancellation..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                  />
                                  <DialogFooter>
                                    <Button
                                      variant="destructive"
                                      onClick={() => updateStatusMutation.mutate({
                                        id: booking.id,
                                        status: "cancelled",
                                        reason: cancelReason,
                                      })}
                                      disabled={updateStatusMutation.isPending}
                                    >
                                      Confirm Cancellation
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          )}
                          {booking.status === "confirmed" && (
                            <div className="flex gap-2 pt-4">
                              <Button
                                className="flex-1"
                                variant="outline"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "completed" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Completed
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={() => updateStatusMutation.mutate({ id: booking.id, status: "no_show" })}
                                disabled={updateStatusMutation.isPending}
                              >
                                No Show
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
