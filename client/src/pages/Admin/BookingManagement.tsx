/**
 * Booking Management - Creator appointment and booking system
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Booking {
  id: string;
  creatorId: string;
  creatorName: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  type: string;
  status: string;
  scheduledAt: string;
  duration: number;
  price: number;
  notes?: string;
  clientNotes?: string;
  creatorNotes?: string;
  cancellationReason?: string;
  rating?: number;
  review?: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-500",
  confirmed: "bg-blue-500/20 text-blue-500",
  completed: "bg-green-500/20 text-green-500",
  cancelled: "bg-red-500/20 text-red-500",
  no_show: "bg-gray-500/20 text-gray-500"
};

const typeLabels: Record<string, string> = {
  video_call: "Video Call",
  custom_content: "Custom Content",
  live_session: "Live Session",
  meet_greet: "Meet & Greet",
  other: "Other"
};

export default function BookingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<string>("");
  const [reason, setReason] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch bookings
  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/bookings", statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (typeFilter !== "all") params.set("type", typeFilter);

      const res = await fetch(`/api/admin/bookings?${params}`);
      return res.json();
    }
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      const res = await fetch(`/api/admin/bookings/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: "Booking updated" });
      setActionDialogOpen(false);
      setDetailsOpen(false);
      setReason("");
    }
  });

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status, reason }: { ids: string[]; status: string; reason?: string }) => {
      const res = await fetch("/api/admin/bookings/bulk/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status, reason })
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
      toast({ title: `${data.updated} bookings updated` });
      setSelectedIds([]);
      setActionDialogOpen(false);
    }
  });

  const handleAction = (type: string, booking?: Booking) => {
    setActionType(type);
    if (booking) setSelectedBooking(booking);
    setActionDialogOpen(true);
  };

  const executeAction = () => {
    if (actionType === "bulk") {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: "confirmed" });
    } else if (actionType === "bulk_cancel") {
      bulkUpdateMutation.mutate({ ids: selectedIds, status: "cancelled", reason });
    } else if (selectedBooking) {
      const newStatus = actionType === "confirm" ? "confirmed" :
                        actionType === "complete" ? "completed" :
                        actionType === "cancel" ? "cancelled" : "pending";
      updateStatusMutation.mutate({
        id: selectedBooking.id,
        status: newStatus,
        reason: actionType === "cancel" ? reason : undefined
      });
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === data?.bookings?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data?.bookings?.map((b: Booking) => b.id) || []);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Management</h1>
          <p className="text-gray-400">Manage creator appointments and bookings</p>
        </div>
        <Button>
          <i className="fas fa-plus mr-2" />
          New Booking
        </Button>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{data.stats.total}</div>
              <div className="text-sm text-gray-400">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-500">{data.stats.pending}</div>
              <div className="text-sm text-gray-400">Pending</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-500">{data.stats.confirmed}</div>
              <div className="text-sm text-gray-400">Confirmed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500">{data.stats.completed}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-500">{data.stats.cancelled}</div>
              <div className="text-sm text-gray-400">Cancelled</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-400">${data.stats.revenue?.toFixed(2)}</div>
              <div className="text-sm text-gray-400">Revenue</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list">
            <i className="fas fa-list mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <i className="fas fa-calendar mr-2" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters and Bulk Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video_call">Video Call</SelectItem>
                    <SelectItem value="custom_content">Custom Content</SelectItem>
                    <SelectItem value="live_session">Live Session</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                {selectedIds.length > 0 && (
                  <div className="flex gap-2">
                    <Badge variant="outline">{selectedIds.length} selected</Badge>
                    <Button size="sm" onClick={() => handleAction("bulk")}>
                      <i className="fas fa-check mr-1" />
                      Confirm All
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleAction("bulk_cancel")}>
                      <i className="fas fa-times mr-1" />
                      Cancel All
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bookings Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-800">
                      <tr className="text-left text-sm text-gray-400">
                        <th className="p-4">
                          <Checkbox
                            checked={selectedIds.length === data?.bookings?.length && data?.bookings?.length > 0}
                            onCheckedChange={selectAll}
                          />
                        </th>
                        <th className="p-4">Client</th>
                        <th className="p-4">Creator</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Scheduled</th>
                        <th className="p-4">Duration</th>
                        <th className="p-4">Price</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.bookings?.map((booking: Booking) => (
                        <tr key={booking.id} className="border-b border-gray-800 hover:bg-gray-900/50">
                          <td className="p-4">
                            <Checkbox
                              checked={selectedIds.includes(booking.id)}
                              onCheckedChange={() => toggleSelect(booking.id)}
                            />
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {booking.clientAvatar && (
                                <img
                                  src={booking.clientAvatar}
                                  alt=""
                                  className="w-8 h-8 rounded-full"
                                />
                              )}
                              <span>{booking.clientName}</span>
                            </div>
                          </td>
                          <td className="p-4">{booking.creatorName}</td>
                          <td className="p-4">{typeLabels[booking.type] || booking.type}</td>
                          <td className="p-4">
                            {new Date(booking.scheduledAt).toLocaleString()}
                          </td>
                          <td className="p-4">{booking.duration} min</td>
                          <td className="p-4">${booking.price.toFixed(2)}</td>
                          <td className="p-4">
                            <Badge className={statusColors[booking.status]}>
                              {booking.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setDetailsOpen(true);
                                }}
                              >
                                <i className="fas fa-eye" />
                              </Button>
                              {booking.status === "pending" && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-green-500"
                                  onClick={() => handleAction("confirm", booking)}
                                >
                                  <i className="fas fa-check" />
                                </Button>
                              )}
                              {(booking.status === "pending" || booking.status === "confirmed") && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-500"
                                  onClick={() => handleAction("cancel", booking)}
                                >
                                  <i className="fas fa-times" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-gray-400 py-12">
                <i className="fas fa-calendar text-4xl mb-4" />
                <p>Calendar view coming soon</p>
                <p className="text-sm">View bookings on an interactive calendar</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Booking Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                {selectedBooking.clientAvatar && (
                  <img
                    src={selectedBooking.clientAvatar}
                    alt=""
                    className="w-16 h-16 rounded-full"
                  />
                )}
                <div>
                  <div className="font-bold">{selectedBooking.clientName}</div>
                  <div className="text-sm text-gray-400">with {selectedBooking.creatorName}</div>
                </div>
                <Badge className={`ml-auto ${statusColors[selectedBooking.status]}`}>
                  {selectedBooking.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-400">Type</Label>
                  <div>{typeLabels[selectedBooking.type]}</div>
                </div>
                <div>
                  <Label className="text-gray-400">Duration</Label>
                  <div>{selectedBooking.duration} minutes</div>
                </div>
                <div>
                  <Label className="text-gray-400">Scheduled</Label>
                  <div>{new Date(selectedBooking.scheduledAt).toLocaleString()}</div>
                </div>
                <div>
                  <Label className="text-gray-400">Price</Label>
                  <div className="font-bold text-green-400">${selectedBooking.price.toFixed(2)}</div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div>
                  <Label className="text-gray-400">Notes</Label>
                  <div className="text-sm">{selectedBooking.notes}</div>
                </div>
              )}

              {selectedBooking.clientNotes && (
                <div>
                  <Label className="text-gray-400">Client Notes</Label>
                  <div className="text-sm">{selectedBooking.clientNotes}</div>
                </div>
              )}

              {selectedBooking.rating && (
                <div>
                  <Label className="text-gray-400">Rating</Label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <i
                        key={i}
                        className={`fas fa-star ${i < selectedBooking.rating! ? "text-yellow-400" : "text-gray-600"}`}
                      />
                    ))}
                    <span className="ml-2 text-sm">{selectedBooking.review}</span>
                  </div>
                </div>
              )}

              {selectedBooking.cancellationReason && (
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <Label className="text-red-400">Cancellation Reason</Label>
                  <div className="text-sm">{selectedBooking.cancellationReason}</div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedBooking?.status === "pending" && (
              <Button onClick={() => handleAction("confirm", selectedBooking)}>
                Confirm Booking
              </Button>
            )}
            {selectedBooking?.status === "confirmed" && (
              <Button onClick={() => handleAction("complete", selectedBooking)}>
                Mark Complete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "cancel" || actionType === "bulk_cancel"
                ? "Cancel Booking"
                : actionType === "confirm" || actionType === "bulk"
                ? "Confirm Booking"
                : "Complete Booking"}
            </DialogTitle>
            <DialogDescription>
              {actionType.includes("cancel")
                ? "Please provide a reason for cancellation."
                : "This action will update the booking status."}
            </DialogDescription>
          </DialogHeader>

          {actionType.includes("cancel") && (
            <div className="space-y-2">
              <Label>Cancellation Reason</Label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={executeAction}
              variant={actionType.includes("cancel") ? "destructive" : "default"}
              disabled={actionType.includes("cancel") && !reason}
            >
              {actionType.includes("cancel") ? "Cancel Booking" : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
