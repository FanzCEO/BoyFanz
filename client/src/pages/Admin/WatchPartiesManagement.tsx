import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Tv,
  Users,
  Handshake,
  Radio,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Play,
  UserPlus,
  Video,
} from "lucide-react";

interface WatchParty {
  id: string;
  hostId: string;
  title: string;
  description: string;
  contentType: string;
  contentUrl: string;
  thumbnailUrl: string | null;
  maxParticipants: number;
  participantCount: number;
  isLive: boolean;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  status: string;
  createdAt: string;
  host?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CollabRequest {
  id: string;
  senderId: string;
  receiverId: string;
  collabType: string;
  message: string;
  proposedDate: string | null;
  revenueShare: { sender: number; receiver: number };
  status: string;
  projectId: string | null;
  createdAt: string;
  sender?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  receiver?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface CollabProject {
  id: string;
  title: string;
  description: string;
  collabType: string;
  participantIds: string[];
  revenueShares: { sender: number; receiver: number };
  totalEarnings: number;
  contentCount: number;
  status: string;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}

export default function WatchPartiesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedParty, setSelectedParty] = useState<WatchParty | null>(null);
  const [showPartyDialog, setShowPartyDialog] = useState(false);

  // Fetch watch parties
  const { data: partiesData, isLoading: loadingParties } = useQuery({
    queryKey: ["/api/watch-party/admin/parties"],
    queryFn: async () => {
      const res = await fetch("/api/watch-party/admin/parties");
      if (!res.ok) throw new Error("Failed to fetch parties");
      return res.json();
    },
  });

  // Fetch collab requests
  const { data: collabsData, isLoading: loadingCollabs } = useQuery({
    queryKey: ["/api/watch-party/admin/collabs"],
    queryFn: async () => {
      const res = await fetch("/api/watch-party/admin/collabs");
      if (!res.ok) throw new Error("Failed to fetch collabs");
      return res.json();
    },
  });

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["/api/watch-party/admin/projects"],
    queryFn: async () => {
      const res = await fetch("/api/watch-party/admin/projects");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/watch-party/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/watch-party/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Update party status mutation
  const updatePartyStatusMutation = useMutation({
    mutationFn: async ({ partyId, status }: { partyId: string; status: string }) => {
      const res = await fetch(`/api/watch-party/admin/parties/${partyId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watch-party/admin/parties"] });
      toast({ title: "Party status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Delete party mutation
  const deletePartyMutation = useMutation({
    mutationFn: async (partyId: string) => {
      const res = await fetch(`/api/watch-party/admin/parties/${partyId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete party");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watch-party/admin/parties"] });
      toast({ title: "Watch party deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete party", variant: "destructive" });
    },
  });

  // Update collab status mutation
  const updateCollabStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: string }) => {
      const res = await fetch(`/api/watch-party/admin/collabs/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/watch-party/admin/collabs"] });
      toast({ title: "Collab status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const parties: WatchParty[] = partiesData?.parties || [];
  const collabs: CollabRequest[] = collabsData?.requests || [];
  const projects: CollabProject[] = projectsData?.projects || [];
  const analytics = analyticsData || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500";
      case "scheduled":
        return "bg-orange-500";
      case "completed":
        return "bg-green-500";
      case "cancelled":
        return "bg-gray-500";
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "active":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Watch Parties & Collabs</h1>
          <p className="text-muted-foreground">
            Synchronized viewing and creator collaborations
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Tv className="w-4 h-4 mr-2" />
            {parties.length} Parties
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Handshake className="w-4 h-4 mr-2" />
            {projects.length} Collabs
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Parties</CardTitle>
            <Radio className="h-4 w-4 text-red-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {analytics.partyStats?.liveParties || parties.filter((p) => p.isLive).length}
            </div>
            <p className="text-xs text-muted-foreground">Currently streaming</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Viewers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.partyStats?.totalParticipants || parties.reduce((sum, p) => sum + p.participantCount, 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all parties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Collabs</CardTitle>
            <Handshake className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {analytics.collabStats?.pendingRequests || collabs.filter((c) => c.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {analytics.collabStats?.activeProjects || projects.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">In production</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="watch-parties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="watch-parties">Watch Parties</TabsTrigger>
          <TabsTrigger value="collab-requests">Collab Requests</TabsTrigger>
          <TabsTrigger value="active-projects">Active Projects</TabsTrigger>
        </TabsList>

        {/* Watch Parties Tab */}
        <TabsContent value="watch-parties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="w-5 h-5" />
                Watch Parties
              </CardTitle>
              <CardDescription>Synchronized viewing sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingParties ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : parties.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tv className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No watch parties yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Party</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Viewers</TableHead>
                      <TableHead>Scheduled</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parties.map((party) => (
                      <TableRow key={party.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {party.thumbnailUrl ? (
                              <img
                                src={party.thumbnailUrl}
                                alt={party.title}
                                className="w-16 h-10 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-10 bg-muted rounded flex items-center justify-center">
                                <Tv className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{party.title}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {party.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {party.host?.avatarUrl ? (
                              <img
                                src={party.host.avatarUrl}
                                alt={party.host.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted" />
                            )}
                            <span className="text-sm">
                              {party.host?.displayName || party.host?.username}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{party.contentType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{party.participantCount}/{party.maxParticipants}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {party.scheduledAt ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-4 h-4" />
                              {new Date(party.scheduledAt).toLocaleDateString()}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {party.isLive && (
                              <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                LIVE
                              </span>
                            )}
                            <Badge className={getStatusColor(party.status)}>
                              {party.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedParty(party);
                                setShowPartyDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select
                              value={party.status}
                              onValueChange={(value) =>
                                updatePartyStatusMutation.mutate({
                                  partyId: party.id,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-[100px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="scheduled">Scheduled</SelectItem>
                                <SelectItem value="live">Live</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => {
                                if (confirm("Delete this party?")) {
                                  deletePartyMutation.mutate(party.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Collab Requests Tab */}
        <TabsContent value="collab-requests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" />
                Collaboration Requests
              </CardTitle>
              <CardDescription>Creator-to-creator collab requests</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCollabs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : collabs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Handshake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No collab requests yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {collabs.map((collab) => (
                    <div
                      key={collab.id}
                      className="p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          {/* Sender */}
                          <div className="text-center">
                            {collab.sender?.avatarUrl ? (
                              <img
                                src={collab.sender.avatarUrl}
                                alt={collab.sender.displayName}
                                className="w-12 h-12 rounded-full mx-auto"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted mx-auto" />
                            )}
                            <p className="text-xs font-medium mt-1">
                              {collab.sender?.displayName || collab.sender?.username}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="flex flex-col items-center">
                            <Handshake className="w-6 h-6 text-primary" />
                            <span className="text-xs text-muted-foreground">
                              {collab.revenueShare.sender}/{collab.revenueShare.receiver}
                            </span>
                          </div>

                          {/* Receiver */}
                          <div className="text-center">
                            {collab.receiver?.avatarUrl ? (
                              <img
                                src={collab.receiver.avatarUrl}
                                alt={collab.receiver.displayName}
                                className="w-12 h-12 rounded-full mx-auto"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-muted mx-auto" />
                            )}
                            <p className="text-xs font-medium mt-1">
                              {collab.receiver?.displayName || collab.receiver?.username}
                            </p>
                          </div>

                          {/* Details */}
                          <div className="ml-4">
                            <Badge variant="outline" className="mb-1">
                              {collab.collabType}
                            </Badge>
                            <p className="text-sm text-muted-foreground max-w-[300px]">
                              {collab.message || "No message"}
                            </p>
                            {collab.proposedDate && (
                              <p className="text-xs text-muted-foreground mt-1">
                                <Calendar className="w-3 h-3 inline mr-1" />
                                {new Date(collab.proposedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(collab.status)}>
                            {collab.status}
                          </Badge>
                          <Select
                            value={collab.status}
                            onValueChange={(value) =>
                              updateCollabStatusMutation.mutate({
                                requestId: collab.id,
                                status: value,
                              })
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Projects Tab */}
        <TabsContent value="active-projects">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Active Projects
              </CardTitle>
              <CardDescription>Ongoing collaboration projects</CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active projects yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Participants</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{project.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {project.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{project.collabType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <UserPlus className="w-4 h-4" />
                            <span>{project.participantIds.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>{project.contentCount} items</TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${(project.totalEarnings / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(project.status)}>
                            {project.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(project.startDate).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Party Details Dialog */}
      <Dialog open={showPartyDialog} onOpenChange={setShowPartyDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tv className="w-5 h-5" />
              {selectedParty?.title}
            </DialogTitle>
            <DialogDescription>Watch party details</DialogDescription>
          </DialogHeader>

          {selectedParty && (
            <div className="space-y-4">
              {selectedParty.thumbnailUrl && (
                <img
                  src={selectedParty.thumbnailUrl}
                  alt={selectedParty.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <p className="text-muted-foreground">{selectedParty.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{selectedParty.participantCount}</p>
                  <p className="text-xs text-muted-foreground">Current Viewers</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{selectedParty.maxParticipants}</p>
                  <p className="text-xs text-muted-foreground">Max Capacity</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host</span>
                  <span>{selectedParty.host?.displayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Content Type</span>
                  <Badge variant="outline">{selectedParty.contentType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedParty.status)}>
                    {selectedParty.status}
                  </Badge>
                </div>
                {selectedParty.scheduledAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Scheduled</span>
                    <span>{new Date(selectedParty.scheduledAt).toLocaleString()}</span>
                  </div>
                )}
                {selectedParty.startedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span>{new Date(selectedParty.startedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPartyDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
