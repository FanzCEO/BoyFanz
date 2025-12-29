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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dice5, CircleDollarSign, Trophy, Gift, Search, MoreHorizontal,
  Download, CheckCircle, XCircle, Eye,
  TrendingUp, BarChart3, Clock, RefreshCw,
  Zap, Percent, Users, Plus, Settings, Sparkles,
  Target, Flame, Award, Crown
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TipGame {
  id: string;
  creatorId: string;
  name: string;
  gameType: 'wheel' | 'slots' | 'dice' | 'mystery_box';
  minTip: number;
  prizes: Prize[];
  isActive: boolean;
  totalSpins: number;
  totalRevenue: number;
  createdAt: string;
  creator?: {
    username: string;
    displayName: string;
  };
}

interface Prize {
  id: string;
  name: string;
  type: 'content' | 'discount' | 'custom' | 'physical';
  value: string;
  probability: number;
  color?: string;
}

interface SpinRecord {
  id: string;
  gameId: string;
  spinnerId: string;
  tipAmount: number;
  prizeWon: string;
  createdAt: string;
  spinner?: {
    username: string;
  };
}

export default function TipGamesManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('games');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showGameDialog, setShowGameDialog] = useState(false);
  const [showStatsDialog, setShowStatsDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<TipGame | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [newGame, setNewGame] = useState({
    name: '',
    gameType: 'wheel' as const,
    minTip: 5,
    isActive: true,
    prizes: [] as Prize[]
  });

  // Fetch all tip games
  const { data: gamesData, isLoading: gamesLoading, refetch: refetchGames } = useQuery({
    queryKey: ['/api/tip-games/admin', { searchQuery, status: statusFilter, type: typeFilter, page: currentPage, limit: pageSize }],
    enabled: (user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator'
  });

  // Fetch spin history
  const { data: spinsData, isLoading: spinsLoading } = useQuery({
    queryKey: ['/api/tip-games/admin/spins', { page: currentPage, limit: pageSize }],
    enabled: ((user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator') && activeTab === 'history'
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/tip-games/admin/analytics'],
    enabled: (user?.role === 'admin' || user?.role === 'super_admin') || user?.role === 'moderator'
  });

  // Create game mutation
  const createGameMutation = useMutation({
    mutationFn: async (gameData: typeof newGame) => {
      return await apiRequest('/api/tip-games', {
        method: 'POST',
        body: JSON.stringify(gameData)
      });
    },
    onSuccess: () => {
      toast({ title: "Game created successfully" });
      setShowGameDialog(false);
      setIsCreating(false);
      resetNewGame();
      refetchGames();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create game", description: error.message, variant: "destructive" });
    }
  });

  // Update game mutation
  const updateGameMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TipGame> }) => {
      return await apiRequest(`/api/tip-games/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({ title: "Game updated successfully" });
      setShowGameDialog(false);
      setSelectedGame(null);
      refetchGames();
    },
    onError: (error: any) => {
      toast({ title: "Failed to update game", description: error.message, variant: "destructive" });
    }
  });

  // Toggle game status mutation
  const toggleGameMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return await apiRequest(`/api/tip-games/${id}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isActive })
      });
    },
    onSuccess: () => {
      toast({ title: "Game status updated" });
      refetchGames();
    }
  });

  const resetNewGame = () => {
    setNewGame({
      name: '',
      gameType: 'wheel',
      minTip: 5,
      isActive: true,
      prizes: []
    });
  };

  const addPrize = () => {
    const newPrize: Prize = {
      id: crypto.randomUUID(),
      name: '',
      type: 'content',
      value: '',
      probability: 10,
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    };
    setNewGame(prev => ({
      ...prev,
      prizes: [...prev.prizes, newPrize]
    }));
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    setNewGame(prev => ({
      ...prev,
      prizes: prev.prizes.map((p, i) => i === index ? { ...p, [field]: value } : p)
    }));
  };

  const removePrize = (index: number) => {
    setNewGame(prev => ({
      ...prev,
      prizes: prev.prizes.filter((_, i) => i !== index)
    }));
  };

  const getGameTypeIcon = (type: string) => {
    switch (type) {
      case 'wheel': return <Target className="h-4 w-4" />;
      case 'slots': return <Dice5 className="h-4 w-4" />;
      case 'dice': return <Dice5 className="h-4 w-4" />;
      case 'mystery_box': return <Gift className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const games = gamesData?.games || [];
  const spins = spinsData?.spins || [];
  const analytics = analyticsData || { totalGames: 0, totalSpins: 0, totalRevenue: 0, avgTip: 0 };

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
            <Dice5 className="h-8 w-8 text-primary" />
            Tip Games Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage Wheel of Fortune, Slots, Dice & Mystery Box games
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetchGames()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => { setIsCreating(true); setShowGameDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Create Game
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Games</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGames}</div>
            <p className="text-xs text-muted-foreground">Active tip games</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Spins</CardTitle>
            <Flame className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalSpins?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.totalRevenue || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">From tip games</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Tip</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(analytics.avgTip || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Per spin</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="games" className="gap-2">
            <Dice5 className="h-4 w-4" />
            Games
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Spin History
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Games Tab */}
        <TabsContent value="games" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search games..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Game Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="wheel">Wheel</SelectItem>
                    <SelectItem value="slots">Slots</SelectItem>
                    <SelectItem value="dice">Dice</SelectItem>
                    <SelectItem value="mystery_box">Mystery Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Games Table */}
          <Card>
            <CardContent className="pt-6">
              {gamesLoading ? (
                <div className="text-center py-12">Loading games...</div>
              ) : games.length === 0 ? (
                <div className="text-center py-12">
                  <Dice5 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No games found</h3>
                  <p className="text-muted-foreground">Create a new tip game to get started</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Game</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Min Tip</TableHead>
                      <TableHead>Spins</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {games.map((game: TipGame) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getGameTypeIcon(game.gameType)}
                            {game.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {game.creator?.displayName || game.creator?.username || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {game.gameType.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>${game.minTip}</TableCell>
                        <TableCell>{game.totalSpins?.toLocaleString() || 0}</TableCell>
                        <TableCell>${(game.totalRevenue || 0).toFixed(2)}</TableCell>
                        <TableCell>
                          <Switch
                            checked={game.isActive}
                            onCheckedChange={(checked) =>
                              toggleGameMutation.mutate({ id: game.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGame(game);
                                setShowStatsDialog(true);
                              }}
                            >
                              <BarChart3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedGame(game);
                                setIsCreating(false);
                                setNewGame({
                                  name: game.name,
                                  gameType: game.gameType,
                                  minTip: game.minTip,
                                  isActive: game.isActive,
                                  prizes: game.prizes || []
                                });
                                setShowGameDialog(true);
                              }}
                            >
                              <Settings className="h-4 w-4" />
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

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Spins</CardTitle>
              <CardDescription>View all spin history across tip games</CardDescription>
            </CardHeader>
            <CardContent>
              {spinsLoading ? (
                <div className="text-center py-12">Loading history...</div>
              ) : spins.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No spins yet</h3>
                  <p className="text-muted-foreground">Spin history will appear here</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Game</TableHead>
                      <TableHead>Tip Amount</TableHead>
                      <TableHead>Prize Won</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {spins.map((spin: SpinRecord) => (
                      <TableRow key={spin.id}>
                        <TableCell>{spin.spinner?.username || 'Unknown'}</TableCell>
                        <TableCell>{spin.gameId}</TableCell>
                        <TableCell>${spin.tipAmount}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="gap-1">
                            <Trophy className="h-3 w-3" />
                            {spin.prizeWon}
                          </Badge>
                        </TableCell>
                        <TableCell>{format(new Date(spin.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Top Games by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.topGames || []).map((game: any, index: number) => (
                    <div key={game.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold",
                          index === 0 ? "bg-yellow-500 text-black" :
                          index === 1 ? "bg-gray-300 text-black" :
                          index === 2 ? "bg-amber-600 text-white" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {index + 1}
                        </span>
                        <span className="font-medium">{game.name}</span>
                      </div>
                      <span className="text-green-500 font-semibold">${game.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                  {(!analyticsData?.topGames || analyticsData.topGames.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Most Popular Prizes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(analyticsData?.topPrizes || []).map((prize: any, index: number) => (
                    <div key={prize.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-4 w-4 text-red-500" />
                        <span className="font-medium">{prize.name}</span>
                      </div>
                      <Badge variant="outline">{prize.count} wins</Badge>
                    </div>
                  ))}
                  {(!analyticsData?.topPrizes || analyticsData.topPrizes.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">No data yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit Game Dialog */}
      <Dialog open={showGameDialog} onOpenChange={setShowGameDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Tip Game' : 'Edit Tip Game'}
            </DialogTitle>
            <DialogDescription>
              Configure game settings and prizes
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Game Name</label>
                <Input
                  value={newGame.name}
                  onChange={(e) => setNewGame(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Spin to Win"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Game Type</label>
                <Select
                  value={newGame.gameType}
                  onValueChange={(v: any) => setNewGame(prev => ({ ...prev, gameType: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheel">Wheel of Fortune</SelectItem>
                    <SelectItem value="slots">Slots</SelectItem>
                    <SelectItem value="dice">Dice Roll</SelectItem>
                    <SelectItem value="mystery_box">Mystery Box</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Tip ($)</label>
                <Input
                  type="number"
                  min="1"
                  value={newGame.minTip}
                  onChange={(e) => setNewGame(prev => ({ ...prev, minTip: Number(e.target.value) }))}
                />
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  checked={newGame.isActive}
                  onCheckedChange={(checked) => setNewGame(prev => ({ ...prev, isActive: checked }))}
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Prizes</label>
                <Button type="button" variant="outline" size="sm" onClick={addPrize}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Prize
                </Button>
              </div>

              {newGame.prizes.map((prize, index) => (
                <Card key={prize.id} className="p-4">
                  <div className="grid grid-cols-4 gap-3">
                    <Input
                      placeholder="Prize name"
                      value={prize.name}
                      onChange={(e) => updatePrize(index, 'name', e.target.value)}
                    />
                    <Select
                      value={prize.type}
                      onValueChange={(v) => updatePrize(index, 'type', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="content">Content</SelectItem>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Probability %"
                      value={prize.probability}
                      onChange={(e) => updatePrize(index, 'probability', Number(e.target.value))}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePrize(index)}
                      className="text-destructive"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    className="mt-2"
                    placeholder="Prize value/description"
                    value={prize.value}
                    onChange={(e) => updatePrize(index, 'value', e.target.value)}
                  />
                </Card>
              ))}

              {newGame.prizes.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Gift className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No prizes added yet</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowGameDialog(false); resetNewGame(); }}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (isCreating) {
                  createGameMutation.mutate(newGame);
                } else if (selectedGame) {
                  updateGameMutation.mutate({ id: selectedGame.id, data: newGame });
                }
              }}
              disabled={createGameMutation.isPending || updateGameMutation.isPending}
            >
              {(createGameMutation.isPending || updateGameMutation.isPending) ? 'Saving...' :
               isCreating ? 'Create Game' : 'Update Game'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={showStatsDialog} onOpenChange={setShowStatsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Game Statistics</DialogTitle>
            <DialogDescription>{selectedGame?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{selectedGame?.totalSpins || 0}</div>
                <p className="text-sm text-muted-foreground">Total Spins</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">${(selectedGame?.totalRevenue || 0).toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{selectedGame?.prizes?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Prizes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">${selectedGame?.minTip || 0}</div>
                <p className="text-sm text-muted-foreground">Min Tip</p>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
