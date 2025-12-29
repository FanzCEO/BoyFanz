import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Swords, Trophy, Users, DollarSign, Clock, Crown, Flame, Star, Plus, Play, Ban, Eye, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Battle {
  id: string;
  title: string;
  description: string;
  battle_type: 'tips' | 'votes' | 'views' | 'subscribers';
  creator_1_id: string;
  creator_1_username: string;
  creator_1_display_name: string;
  creator_1_score: number;
  creator_2_id: string;
  creator_2_username: string;
  creator_2_display_name: string;
  creator_2_score: number;
  prize_pool: number;
  winner_id?: string;
  status: 'upcoming' | 'active' | 'voting' | 'completed' | 'cancelled';
  starts_at: string;
  ends_at: string;
  created_at: string;
}

interface BattleAnalytics {
  totalBattles: number;
  activeBattles: number;
  totalPrizePool: number;
  totalParticipants: number;
  avgVotesPerBattle: number;
  topCreators: Array<{ creator_id: string; username: string; wins: number; total_earnings: number }>;
  battlesByType: Record<string, number>;
}

export default function BattlesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedBattle, setSelectedBattle] = useState<Battle | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Form state for creating battles
  const [newBattle, setNewBattle] = useState({
    title: "",
    description: "",
    battleType: "tips" as Battle['battle_type'],
    creator1Id: "",
    creator2Id: "",
    prizePool: 0,
    startsAt: "",
    endsAt: "",
  });

  // Fetch battles
  const { data: battlesData, isLoading } = useQuery({
    queryKey: ["/api/battles/admin", searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("searchQuery", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const res = await fetch(`/api/battles/admin?${params}`);
      if (!res.ok) throw new Error("Failed to fetch battles");
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analytics } = useQuery<BattleAnalytics>({
    queryKey: ["/api/battles/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/battles/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Create battle mutation
  const createBattle = useMutation({
    mutationFn: async (data: typeof newBattle) => {
      const res = await fetch("/api/battles/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create battle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/battles/admin"] });
      toast({ title: "Battle created!" });
      setIsCreateDialogOpen(false);
      setNewBattle({ title: "", description: "", battleType: "tips", creator1Id: "", creator2Id: "", prizePool: 0, startsAt: "", endsAt: "" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Update battle status
  const updateBattleStatus = useMutation({
    mutationFn: async ({ battleId, status }: { battleId: string; status: string }) => {
      const res = await fetch(`/api/battles/admin/${battleId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/battles/admin"] });
      toast({ title: "Battle status updated" });
    },
  });

  // End battle and declare winner
  const endBattle = useMutation({
    mutationFn: async (battleId: string) => {
      const res = await fetch(`/api/battles/admin/${battleId}/end`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to end battle");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/battles/admin"] });
      toast({ title: "Battle ended, winner declared!" });
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "upcoming": return "secondary";
      case "voting": return "outline";
      case "completed": return "default";
      case "cancelled": return "destructive";
      default: return "secondary";
    }
  };

  const getBattleTypeIcon = (type: string) => {
    switch (type) {
      case "tips": return <DollarSign className="h-4 w-4" />;
      case "votes": return <Users className="h-4 w-4" />;
      case "views": return <Eye className="h-4 w-4" />;
      case "subscribers": return <Star className="h-4 w-4" />;
      default: return <Swords className="h-4 w-4" />;
    }
  };

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Swords className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold">Access Denied</h2>
            <p className="text-muted-foreground">Admin access required</p>
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
            <Swords className="h-8 w-8 text-primary" />
            Creator Battles
          </h1>
          <p className="text-muted-foreground">Manage head-to-head creator competitions</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Battle
        </Button>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Battles</CardTitle>
            <Swords className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalBattles || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{analytics?.activeBattles || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prize Pool</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${formatNumber(analytics?.totalPrizePool || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalParticipants || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Votes/Battle</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics?.avgVotesPerBattle || 0).toFixed(0)}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="battles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="battles" className="flex items-center gap-2">
            <Swords className="h-4 w-4" />
            All Battles
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Champions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="battles" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Battle Arena</CardTitle>
                  <CardDescription>All creator battles</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search battles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="voting">Voting</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading battles...</div>
              ) : (
                <div className="space-y-4">
                  {(battlesData?.battles || []).map((battle: Battle) => {
                    const totalScore = battle.creator_1_score + battle.creator_2_score;
                    const creator1Percent = totalScore > 0 ? (battle.creator_1_score / totalScore) * 100 : 50;

                    return (
                      <Card key={battle.id} className="overflow-hidden">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Badge variant={getStatusColor(battle.status)}>
                                {battle.status === 'active' && <Flame className="h-3 w-3 mr-1" />}
                                {battle.status}
                              </Badge>
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getBattleTypeIcon(battle.battle_type)}
                                {battle.battle_type}
                              </Badge>
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(battle.starts_at).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${formatNumber(battle.prize_pool)} Pool
                              </Badge>
                            </div>
                          </div>

                          <h3 className="text-lg font-semibold mb-2">{battle.title}</h3>
                          {battle.description && (
                            <p className="text-sm text-muted-foreground mb-4">{battle.description}</p>
                          )}

                          {/* Battle Progress */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                  {battle.creator_1_display_name?.[0] || 'A'}
                                </div>
                                <div>
                                  <p className="font-medium">{battle.creator_1_display_name}</p>
                                  <p className="text-muted-foreground text-xs">@{battle.creator_1_username}</p>
                                </div>
                              </div>
                              <span className="font-bold text-orange-500">{formatNumber(battle.creator_1_score)}</span>
                            </div>

                            <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-orange-500 transition-all duration-500"
                                style={{ width: `${creator1Percent}%` }}
                              />
                              <div
                                className="absolute right-0 top-0 h-full bg-red-500 transition-all duration-500"
                                style={{ width: `${100 - creator1Percent}%` }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white drop-shadow">VS</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold">
                                  {battle.creator_2_display_name?.[0] || 'B'}
                                </div>
                                <div>
                                  <p className="font-medium">{battle.creator_2_display_name}</p>
                                  <p className="text-muted-foreground text-xs">@{battle.creator_2_username}</p>
                                </div>
                              </div>
                              <span className="font-bold text-red-500">{formatNumber(battle.creator_2_score)}</span>
                            </div>
                          </div>

                          {/* Winner Display */}
                          {battle.status === 'completed' && battle.winner_id && (
                            <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg flex items-center justify-center gap-2">
                              <Crown className="h-5 w-5 text-yellow-500" />
                              <span className="font-semibold">
                                Winner: @{battle.winner_id === battle.creator_1_id ? battle.creator_1_username : battle.creator_2_username}
                              </span>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2 mt-4 pt-4 border-t">
                            {battle.status === 'upcoming' && (
                              <Button
                                size="sm"
                                onClick={() => updateBattleStatus.mutate({ battleId: battle.id, status: 'active' })}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start Battle
                              </Button>
                            )}
                            {battle.status === 'active' && (
                              <Button
                                size="sm"
                                onClick={() => endBattle.mutate(battle.id)}
                              >
                                <Trophy className="h-4 w-4 mr-1" />
                                End & Declare Winner
                              </Button>
                            )}
                            {['upcoming', 'active'].includes(battle.status) && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => updateBattleStatus.mutate({ battleId: battle.id, status: 'cancelled' })}
                              >
                                <Ban className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBattle(battle);
                                setIsDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Battle Champions
              </CardTitle>
              <CardDescription>Top performers in creator battles</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Wins</TableHead>
                    <TableHead>Total Earnings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(analytics?.topCreators || []).map((creator, index) => (
                    <TableRow key={creator.creator_id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {index === 0 && <Crown className="h-5 w-5 text-yellow-500" />}
                          {index === 1 && <Crown className="h-5 w-5 text-gray-400" />}
                          {index === 2 && <Crown className="h-5 w-5 text-amber-700" />}
                          {index > 2 && <span className="w-5 text-center font-bold">{index + 1}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">@{creator.username}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{creator.wins} wins</Badge>
                      </TableCell>
                      <TableCell className="text-green-500 font-semibold">
                        ${formatNumber(creator.total_earnings)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Battle Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Battles by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {Object.entries(analytics?.battlesByType || {}).map(([type, count]) => (
                  <Card key={type} className="p-4 text-center">
                    <div className="flex justify-center mb-2">
                      {getBattleTypeIcon(type)}
                    </div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">{type} Battles</p>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Battle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Battle</DialogTitle>
            <DialogDescription>Set up a head-to-head creator battle</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Battle Title</Label>
              <Input
                value={newBattle.title}
                onChange={(e) => setNewBattle({ ...newBattle, title: e.target.value })}
                placeholder="e.g., Weekend Showdown"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newBattle.description}
                onChange={(e) => setNewBattle({ ...newBattle, description: e.target.value })}
                placeholder="Battle description..."
              />
            </div>
            <div className="space-y-2">
              <Label>Battle Type</Label>
              <Select
                value={newBattle.battleType}
                onValueChange={(value: Battle['battle_type']) => setNewBattle({ ...newBattle, battleType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tips">Tips Battle</SelectItem>
                  <SelectItem value="votes">Voting Battle</SelectItem>
                  <SelectItem value="views">Views Battle</SelectItem>
                  <SelectItem value="subscribers">Subscriber Battle</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Creator 1 ID</Label>
                <Input
                  value={newBattle.creator1Id}
                  onChange={(e) => setNewBattle({ ...newBattle, creator1Id: e.target.value })}
                  placeholder="User ID"
                />
              </div>
              <div className="space-y-2">
                <Label>Creator 2 ID</Label>
                <Input
                  value={newBattle.creator2Id}
                  onChange={(e) => setNewBattle({ ...newBattle, creator2Id: e.target.value })}
                  placeholder="User ID"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Prize Pool ($)</Label>
              <Input
                type="number"
                value={newBattle.prizePool}
                onChange={(e) => setNewBattle({ ...newBattle, prizePool: Number(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Starts At</Label>
                <Input
                  type="datetime-local"
                  value={newBattle.startsAt}
                  onChange={(e) => setNewBattle({ ...newBattle, startsAt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Ends At</Label>
                <Input
                  type="datetime-local"
                  value={newBattle.endsAt}
                  onChange={(e) => setNewBattle({ ...newBattle, endsAt: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createBattle.mutate(newBattle)}
              disabled={!newBattle.title || !newBattle.creator1Id || !newBattle.creator2Id}
            >
              Create Battle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
