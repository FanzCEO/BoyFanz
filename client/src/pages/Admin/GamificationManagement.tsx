import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Award, Star, Trophy, Medal, Search, MoreHorizontal,
  TrendingUp, BarChart3, Clock, RefreshCw, Zap, Users, Plus, Sparkles,
  Target, Flame, Crown, Shield, Heart, Gift, Swords
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface UserXP {
  id: string;
  userId: string;
  currentXp: number;
  level: number;
  totalXpEarned: number;
  user?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  category: 'creator' | 'fan' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  xpReward: number;
  requirement: string;
  isActive: boolean;
}

interface LeaderboardEntry {
  id: string;
  userId: string;
  score: number;
  rank: number;
  leaderboardType: string;
  periodType: string;
  user?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

export default function GamificationManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('xp');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');
  const [leaderboardType, setLeaderboardType] = useState('tips_given');
  const [periodFilter, setPeriodFilter] = useState('all_time');

  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newBadge, setNewBadge] = useState({
    name: '',
    description: '',
    iconUrl: '',
    category: 'fan' as const,
    rarity: 'common' as const,
    xpReward: 100,
    requirement: '',
    isActive: true
  });

  // Fetch XP leaderboard
  const { data: xpData, isLoading: xpLoading, refetch: refetchXP } = useQuery({
    queryKey: ['/api/gamification/xp/leaderboard', { search: searchQuery, limit: 50 }],
    enabled: (user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator'
  });

  // Fetch badges
  const { data: badgesData, isLoading: badgesLoading, refetch: refetchBadges } = useQuery({
    queryKey: ['/api/gamification/badges', { category: categoryFilter, rarity: rarityFilter }],
    enabled: ((user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator') && activeTab === 'badges'
  });

  // Fetch leaderboards
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['/api/gamification/leaderboards', { type: leaderboardType, period: periodFilter }],
    enabled: ((user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator') && activeTab === 'leaderboards'
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/gamification/analytics'],
    enabled: (user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator'
  });

  // Create badge mutation
  const createBadgeMutation = useMutation({
    mutationFn: async (badgeData: typeof newBadge) => {
      return await apiRequest('/api/gamification/badges', {
        method: 'POST',
        body: JSON.stringify(badgeData)
      });
    },
    onSuccess: () => {
      toast({ title: "Badge created successfully" });
      setShowBadgeDialog(false);
      setIsCreating(false);
      resetNewBadge();
      refetchBadges();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create badge", description: error.message, variant: "destructive" });
    }
  });

  // Award XP mutation
  const awardXPMutation = useMutation({
    mutationFn: async ({ userId, amount, reason }: { userId: string; amount: number; reason: string }) => {
      return await apiRequest('/api/gamification/xp/award', {
        method: 'POST',
        body: JSON.stringify({ userId, amount, reason })
      });
    },
    onSuccess: () => {
      toast({ title: "XP awarded successfully" });
      refetchXP();
    }
  });

  const resetNewBadge = () => {
    setNewBadge({
      name: '',
      description: '',
      iconUrl: '',
      category: 'fan',
      rarity: 'common',
      xpReward: 100,
      requirement: '',
      isActive: true
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-400/10 text-gray-400 border-gray-400/20';
      case 'rare': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'epic': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'legendary': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getLevelProgress = (xp: number, level: number) => {
    const xpForCurrentLevel = level * 1000;
    const xpForNextLevel = (level + 1) * 1000;
    const xpInCurrentLevel = xp - (level * (level - 1) * 500);
    return Math.min((xpInCurrentLevel / (xpForNextLevel - xpForCurrentLevel)) * 100, 100);
  };

  const xpLeaderboard = xpData?.leaderboard || [];
  const badges = badgesData?.badges || [];
  const leaderboard = leaderboardData?.entries || [];
  const analytics = analyticsData || { totalXPAwarded: 0, totalBadgesEarned: 0, avgLevel: 0, topLevel: 0 };

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="p-8">
          <CardTitle className="text-destructive">Access Denied</CardTitle>
          <CardDescription>You don't have permission to view this page.</CardDescription>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Gamification Management
          </h1>
          <p className="text-muted-foreground mt-1">
            XP, Badges, Levels & Leaderboards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { refetchXP(); refetchBadges(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {activeTab === 'badges' && (
            <Button onClick={() => { setIsCreating(true); setShowBadgeDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Badge
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total XP Awarded</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalXPAwarded?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            <Medal className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBadgesEarned?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Total achievements</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Level</CardTitle>
            <Star className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics.avgLevel || 0).toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Platform average</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Highest Level</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.topLevel || 0}</div>
            <p className="text-xs text-muted-foreground">Top player</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="xp" className="gap-2">
            <Zap className="h-4 w-4" />
            XP & Levels
          </TabsTrigger>
          <TabsTrigger value="badges" className="gap-2">
            <Medal className="h-4 w-4" />
            Badges
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="gap-2">
            <Trophy className="h-4 w-4" />
            Leaderboards
          </TabsTrigger>
        </TabsList>

        {/* XP Tab */}
        <TabsContent value="xp" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>XP Leaderboard</CardTitle>
              <CardDescription>Top players by XP and level</CardDescription>
            </CardHeader>
            <CardContent>
              {xpLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : xpLeaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No XP data yet</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {xpLeaderboard.map((entry: UserXP, index: number) => (
                    <div key={entry.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <span className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                        index === 0 ? "bg-yellow-500 text-black" :
                        index === 1 ? "bg-gray-300 text-black" :
                        index === 2 ? "bg-amber-600 text-white" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{entry.user?.displayName || entry.user?.username}</span>
                          <Badge variant="outline" className="gap-1">
                            <Star className="h-3 w-3" />
                            Level {entry.level}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <Progress value={getLevelProgress(entry.currentXp, entry.level)} className="h-2" />
                          <p className="text-xs text-muted-foreground mt-1">
                            {entry.currentXp.toLocaleString()} XP
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const amount = prompt('Enter XP amount to award:');
                          if (amount && !isNaN(Number(amount))) {
                            awardXPMutation.mutate({
                              userId: entry.userId,
                              amount: Number(amount),
                              reason: 'Admin award'
                            });
                          }
                        }}
                      >
                        <Gift className="h-4 w-4 mr-1" />
                        Award XP
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search badges..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="fan">Fan</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={rarityFilter} onValueChange={setRarityFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badgesLoading ? (
              <div className="col-span-full text-center py-12">Loading badges...</div>
            ) : badges.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Medal className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No badges found</h3>
                <p className="text-muted-foreground">Create your first badge</p>
              </div>
            ) : (
              badges.map((badge: BadgeDefinition) => (
                <Card key={badge.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <Award className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-base">{badge.name}</CardTitle>
                          <Badge className={cn("mt-1 capitalize", getRarityColor(badge.rarity))}>
                            {badge.rarity}
                          </Badge>
                        </div>
                      </div>
                      <Switch checked={badge.isActive} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1 text-yellow-500">
                        <Zap className="h-4 w-4" />
                        +{badge.xpReward} XP
                      </span>
                      <Badge variant="outline" className="capitalize">{badge.category}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Leaderboards Tab */}
        <TabsContent value="leaderboards" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <Select value={leaderboardType} onValueChange={setLeaderboardType}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Leaderboard Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tips_given">Tips Given</SelectItem>
                    <SelectItem value="tips_received">Tips Received</SelectItem>
                    <SelectItem value="content_views">Content Views</SelectItem>
                    <SelectItem value="subscribers">Subscribers</SelectItem>
                    <SelectItem value="engagement">Engagement</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={periodFilter} onValueChange={setPeriodFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Today</SelectItem>
                    <SelectItem value="weekly">This Week</SelectItem>
                    <SelectItem value="monthly">This Month</SelectItem>
                    <SelectItem value="all_time">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                {leaderboardType.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())} Leaderboard
              </CardTitle>
              <CardDescription>
                {periodFilter === 'all_time' ? 'All Time' :
                 periodFilter === 'monthly' ? 'This Month' :
                 periodFilter === 'weekly' ? 'This Week' : 'Today'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboardLoading ? (
                <div className="text-center py-12">Loading...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No leaderboard data</h3>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Rank</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboard.map((entry: LeaderboardEntry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          <span className={cn(
                            "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                            entry.rank === 1 ? "bg-yellow-500 text-black" :
                            entry.rank === 2 ? "bg-gray-300 text-black" :
                            entry.rank === 3 ? "bg-amber-600 text-white" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {entry.rank}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{entry.user?.displayName || entry.user?.username}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {entry.score.toLocaleString()}
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

      {/* Create Badge Dialog */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Badge</DialogTitle>
            <DialogDescription>Define a new achievement badge</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Badge Name</label>
              <Input
                value={newBadge.name}
                onChange={(e) => setNewBadge(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Super Tipper"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newBadge.description}
                onChange={(e) => setNewBadge(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Awarded for tipping over $1000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select
                  value={newBadge.category}
                  onValueChange={(v: any) => setNewBadge(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="creator">Creator</SelectItem>
                    <SelectItem value="fan">Fan</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rarity</label>
                <Select
                  value={newBadge.rarity}
                  onValueChange={(v: any) => setNewBadge(prev => ({ ...prev, rarity: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">XP Reward</label>
                <Input
                  type="number"
                  min="0"
                  value={newBadge.xpReward}
                  onChange={(e) => setNewBadge(prev => ({ ...prev, xpReward: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={newBadge.isActive}
                  onCheckedChange={(checked) => setNewBadge(prev => ({ ...prev, isActive: checked }))}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Requirement</label>
              <Input
                value={newBadge.requirement}
                onChange={(e) => setNewBadge(prev => ({ ...prev, requirement: e.target.value }))}
                placeholder="e.g., tips_given >= 1000"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBadgeDialog(false); resetNewBadge(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => createBadgeMutation.mutate(newBadge)}
              disabled={createBadgeMutation.isPending}
            >
              {createBadgeMutation.isPending ? 'Creating...' : 'Create Badge'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
