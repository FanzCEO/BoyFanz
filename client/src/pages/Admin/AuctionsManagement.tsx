import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Gavel,
  Target,
  DollarSign,
  Users,
  Clock,
  TrendingUp,
  Trophy,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Gift,
} from "lucide-react";

interface Auction {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  itemType: string;
  mediaUrl: string | null;
  startingBid: number;
  currentBid: number;
  highestBidderId: string | null;
  bidCount: number;
  startsAt: string;
  endsAt: string;
  status: string;
  createdAt: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  highestBidder?: {
    id: string;
    username: string;
    displayName: string;
  } | null;
}

interface TipGoal {
  id: string;
  creatorId: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  rewardType: string;
  rewardContent: string | null;
  contributorCount: number;
  status: string;
  expiresAt: string | null;
  completedAt: string | null;
  createdAt: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

export default function AuctionsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(null);
  const [showAuctionDialog, setShowAuctionDialog] = useState(false);

  // Fetch auctions
  const { data: auctionsData, isLoading: loadingAuctions } = useQuery({
    queryKey: ["/api/auction/admin/auctions"],
    queryFn: async () => {
      const res = await fetch("/api/auction/admin/auctions");
      if (!res.ok) throw new Error("Failed to fetch auctions");
      return res.json();
    },
  });

  // Fetch tip goals
  const { data: goalsData, isLoading: loadingGoals } = useQuery({
    queryKey: ["/api/auction/admin/goals"],
    queryFn: async () => {
      const res = await fetch("/api/auction/admin/goals");
      if (!res.ok) throw new Error("Failed to fetch tip goals");
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/auction/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/auction/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Update auction status mutation
  const updateAuctionStatusMutation = useMutation({
    mutationFn: async ({ auctionId, status }: { auctionId: string; status: string }) => {
      const res = await fetch(`/api/auction/admin/auctions/${auctionId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction/admin/auctions"] });
      toast({ title: "Auction status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // End auction mutation
  const endAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      const res = await fetch(`/api/auction/admin/auctions/${auctionId}/end`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to end auction");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction/admin/auctions"] });
      toast({
        title: "Auction ended!",
        description: `Winner: ${data.winner || "No bids"} - $${(data.finalPrice / 100).toFixed(2)}`,
      });
    },
    onError: () => {
      toast({ title: "Failed to end auction", variant: "destructive" });
    },
  });

  // Delete auction mutation
  const deleteAuctionMutation = useMutation({
    mutationFn: async (auctionId: string) => {
      const res = await fetch(`/api/auction/admin/auctions/${auctionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete auction");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction/admin/auctions"] });
      toast({ title: "Auction deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete auction", variant: "destructive" });
    },
  });

  // Update goal status mutation
  const updateGoalStatusMutation = useMutation({
    mutationFn: async ({ goalId, status }: { goalId: string; status: string }) => {
      const res = await fetch(`/api/auction/admin/goals/${goalId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction/admin/goals"] });
      toast({ title: "Goal status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const res = await fetch(`/api/auction/admin/goals/${goalId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete goal");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auction/admin/goals"] });
      toast({ title: "Tip goal deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete goal", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const auctions: Auction[] = auctionsData?.auctions || [];
  const goals: TipGoal[] = goalsData?.goals || [];
  const analytics = analyticsData || {};

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTimeRemaining = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Auctions & Tip Goals</h1>
          <p className="text-muted-foreground">
            Live auction house and crowdfunding goals
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Gavel className="w-4 h-4 mr-2" />
            {auctions.length} Auctions
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Target className="w-4 h-4 mr-2" />
            {goals.length} Goals
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Auctions</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.auctionStats?.activeAuctions || auctions.filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.auctionStats?.totalBids || auctions.reduce((sum, a) => sum + a.bidCount, 0)} total bids
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auction Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${((analytics.auctionStats?.totalRevenue || 0) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From completed auctions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.tipGoalStats?.activeGoals || goals.filter((g) => g.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.tipGoalStats?.completedGoals || goals.filter((g) => g.status === "completed").length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              ${((analytics.tipGoalStats?.totalRaised || goals.reduce((sum, g) => sum + g.currentAmount, 0)) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From tip goals</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="auctions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="auctions">Live Auctions</TabsTrigger>
          <TabsTrigger value="tip-goals">Tip Goals</TabsTrigger>
          <TabsTrigger value="recent-bids">Recent Activity</TabsTrigger>
        </TabsList>

        {/* Auctions Tab */}
        <TabsContent value="auctions">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gavel className="w-5 h-5" />
                Auction House
              </CardTitle>
              <CardDescription>Manage creator auctions and bids</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAuctions ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : auctions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Gavel className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No auctions yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Auction</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Current Bid</TableHead>
                      <TableHead>Bids</TableHead>
                      <TableHead>Time Left</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {auctions.map((auction) => (
                      <TableRow key={auction.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{auction.title}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {auction.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {auction.creator?.avatarUrl ? (
                              <img
                                src={auction.creator.avatarUrl}
                                alt={auction.creator.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted" />
                            )}
                            <span className="text-sm">
                              {auction.creator?.displayName || auction.creator?.username || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{auction.itemType}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-green-600">
                              ${(auction.currentBid / 100).toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Start: ${(auction.startingBid / 100).toFixed(2)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{auction.bidCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{getTimeRemaining(auction.endsAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(auction.status)}>
                            {auction.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedAuction(auction);
                                setShowAuctionDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {auction.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => endAuctionMutation.mutate(auction.id)}
                              >
                                End Now
                              </Button>
                            )}
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm("Delete this auction?")) {
                                  deleteAuctionMutation.mutate(auction.id);
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

        {/* Tip Goals Tab */}
        <TabsContent value="tip-goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Tip Goals
              </CardTitle>
              <CardDescription>Crowdfunding goals with rewards</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGoals ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : goals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tip goals yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {goals.map((goal) => {
                    const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
                    return (
                      <div
                        key={goal.id}
                        className="p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            {goal.creator?.avatarUrl ? (
                              <img
                                src={goal.creator.avatarUrl}
                                alt={goal.creator.displayName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-muted" />
                            )}
                            <div>
                              <h3 className="font-semibold">{goal.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                by {goal.creator?.displayName || goal.creator?.username}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getStatusColor(goal.status)}>
                              {goal.status}
                            </Badge>
                            <Select
                              value={goal.status}
                              onValueChange={(value) =>
                                updateGoalStatusMutation.mutate({
                                  goalId: goal.id,
                                  status: value,
                                })
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500"
                              onClick={() => {
                                if (confirm("Delete this goal?")) {
                                  deleteGoalMutation.mutate(goal.id);
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {goal.description}
                        </p>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>
                              ${(goal.currentAmount / 100).toFixed(2)} raised
                            </span>
                            <span className="font-medium">
                              ${(goal.targetAmount / 100).toFixed(2)} goal
                            </span>
                          </div>
                          <Progress value={progress} className="h-3" />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{progress}% complete</span>
                            <span>
                              <Users className="w-3 h-3 inline mr-1" />
                              {goal.contributorCount} contributors
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <Gift className="w-4 h-4 text-purple-500" />
                          <Badge variant="outline">{goal.rewardType}</Badge>
                          {goal.expiresAt && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              Expires: {new Date(goal.expiresAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent-bids">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest bids and contributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentBids?.map((bid: any) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Bid #{bid.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          Auction: {bid.auctionId.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${(bid.amount / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No recent activity
                  </p>
                )}
              </div>

              {/* Top Auctions */}
              {analytics.topAuctions?.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Top Auctions by Bids
                  </h4>
                  <div className="space-y-2">
                    {analytics.topAuctions.map((auction: any, index: number) => (
                      <div
                        key={auction.id}
                        className="flex items-center justify-between p-2 rounded bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-black"
                                : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                ? "bg-amber-600 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <span className="font-medium">{auction.title}</span>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${(auction.currentBid / 100).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{auction.bidCount} bids</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Auction Details Dialog */}
      <Dialog open={showAuctionDialog} onOpenChange={setShowAuctionDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gavel className="w-5 h-5" />
              {selectedAuction?.title}
            </DialogTitle>
            <DialogDescription>Auction details and bid history</DialogDescription>
          </DialogHeader>

          {selectedAuction && (
            <div className="space-y-4">
              {selectedAuction.mediaUrl && (
                <img
                  src={selectedAuction.mediaUrl}
                  alt={selectedAuction.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              )}

              <p className="text-muted-foreground">{selectedAuction.description}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    ${(selectedAuction.currentBid / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Current Bid</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-2xl font-bold">{selectedAuction.bidCount}</p>
                  <p className="text-xs text-muted-foreground">Total Bids</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Item Type</span>
                  <Badge variant="outline">{selectedAuction.itemType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starting Bid</span>
                  <span>${(selectedAuction.startingBid / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge className={getStatusColor(selectedAuction.status)}>
                    {selectedAuction.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Time Remaining</span>
                  <span>{getTimeRemaining(selectedAuction.endsAt)}</span>
                </div>
                {selectedAuction.highestBidder && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Highest Bidder</span>
                    <span>{selectedAuction.highestBidder.displayName}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAuctionDialog(false)}>
              Close
            </Button>
            {selectedAuction?.status === "active" && (
              <Button
                variant="destructive"
                onClick={() => {
                  endAuctionMutation.mutate(selectedAuction.id);
                  setShowAuctionDialog(false);
                }}
              >
                End Auction
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
