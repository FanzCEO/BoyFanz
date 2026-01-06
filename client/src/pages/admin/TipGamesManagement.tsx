import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit, BarChart3, CircleDollarSign, Dices, Gift } from "lucide-react";

interface Prize {
  name: string;
  value: number;
  probability: number;
  color: string;
}

interface TipGame {
  id: string;
  creator_id: string;
  name: string;
  game_type: string;
  min_tip: number;
  prizes: Prize[];
  is_active: boolean;
  total_spins: number;
  total_revenue: number;
  created_at: string;
}

export default function TipGamesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedGame, setSelectedGame] = useState<TipGame | null>(null);
  const [newGame, setNewGame] = useState({
    name: "",
    gameType: "wheel",
    minTip: 100,
    prizes: [
      { name: "Free Spin", value: 0, probability: 30, color: "#3b82f6" },
      { name: "Shoutout", value: 50, probability: 25, color: "#22c55e" },
      { name: "DM Access", value: 100, probability: 20, color: "#eab308" },
      { name: "Exclusive Content", value: 200, probability: 15, color: "#f97316" },
      { name: "Video Call", value: 500, probability: 8, color: "#ef4444" },
      { name: "JACKPOT", value: 1000, probability: 2, color: "#a855f7" },
    ],
  });

  const { data: games = [], isLoading } = useQuery({
    queryKey: ["/api/tip-games/admin/all"],
    queryFn: async () => {
      const res = await fetch("/api/tip-games/admin/all");
      if (!res.ok) throw new Error("Failed to fetch games");
      const data = await res.json();
      return data.games || [];
    },
  });

  const createGame = useMutation({
    mutationFn: async (game: typeof newGame) => {
      const res = await fetch("/api/tip-games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      });
      if (!res.ok) throw new Error("Failed to create game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tip-games/admin/all"] });
      setShowCreateDialog(false);
      toast({ title: "Game created!", description: "Your tip game is now live." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create game", variant: "destructive" });
    },
  });

  const toggleGame = useMutation({
    mutationFn: async ({ gameId, isActive }: { gameId: string; isActive: boolean }) => {
      const res = await fetch(`/api/tip-games/${gameId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tip-games/admin/all"] });
      toast({ title: "Game updated!" });
    },
  });

  const deleteGame = useMutation({
    mutationFn: async (gameId: string) => {
      const res = await fetch(`/api/tip-games/${gameId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete game");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tip-games/admin/all"] });
      toast({ title: "Game deleted" });
    },
  });

  const gameTypeIcons: Record<string, any> = {
    wheel: Dices,
    slots: Gift,
    dice: Dices,
    card_flip: Gift,
    mystery_box: Gift,
  };

  const addPrize = () => {
    setNewGame({
      ...newGame,
      prizes: [
        ...newGame.prizes,
        { name: "New Prize", value: 0, probability: 10, color: "#6b7280" },
      ],
    });
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updatedPrizes = [...newGame.prizes];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: value };
    setNewGame({ ...newGame, prizes: updatedPrizes });
  };

  const removePrize = (index: number) => {
    setNewGame({
      ...newGame,
      prizes: newGame.prizes.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tip Games Management</h1>
          <p className="text-muted-foreground">
            Manage wheel of fortune and tip games across the platform
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Game
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Tip Game</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Game Name</Label>
                  <Input
                    value={newGame.name}
                    onChange={(e) => setNewGame({ ...newGame, name: e.target.value })}
                    placeholder="Wheel of Fortune"
                  />
                </div>
                <div>
                  <Label>Game Type</Label>
                  <Select
                    value={newGame.gameType}
                    onValueChange={(v) => setNewGame({ ...newGame, gameType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wheel">Wheel of Fortune</SelectItem>
                      <SelectItem value="slots">Slots</SelectItem>
                      <SelectItem value="dice">Dice Roll</SelectItem>
                      <SelectItem value="card_flip">Card Flip</SelectItem>
                      <SelectItem value="mystery_box">Mystery Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Minimum Tip (credits)</Label>
                <Input
                  type="number"
                  value={newGame.minTip}
                  onChange={(e) => setNewGame({ ...newGame, minTip: Number(e.target.value) })}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Prizes</Label>
                  <Button variant="outline" size="sm" onClick={addPrize}>
                    <Plus className="w-4 h-4 mr-1" /> Add Prize
                  </Button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {newGame.prizes.map((prize, i) => (
                    <div key={i} className="flex gap-2 items-center p-2 border rounded">
                      <Input
                        className="w-24"
                        type="color"
                        value={prize.color}
                        onChange={(e) => updatePrize(i, "color", e.target.value)}
                      />
                      <Input
                        placeholder="Prize name"
                        value={prize.name}
                        onChange={(e) => updatePrize(i, "name", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Value"
                        className="w-20"
                        value={prize.value}
                        onChange={(e) => updatePrize(i, "value", Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="%"
                        className="w-16"
                        value={prize.probability}
                        onChange={(e) => updatePrize(i, "probability", Number(e.target.value))}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePrize(i)}
                        disabled={newGame.prizes.length <= 2}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => createGame.mutate(newGame)}
                disabled={createGame.isPending || !newGame.name}
              >
                {createGame.isPending ? "Creating..." : "Create Game"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg dark:bg-blue-900">
                <Dices className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Games</p>
                <p className="text-2xl font-bold">{games.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg dark:bg-green-900">
                <CircleDollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">
                  ${games.reduce((sum: number, g: TipGame) => sum + (g.total_revenue || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg dark:bg-purple-900">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Spins</p>
                <p className="text-2xl font-bold">
                  {games.reduce((sum: number, g: TipGame) => sum + (g.total_spins || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg dark:bg-yellow-900">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Games</p>
                <p className="text-2xl font-bold">
                  {games.filter((g: TipGame) => g.is_active).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Games List */}
      <Card>
        <CardHeader>
          <CardTitle>All Tip Games</CardTitle>
          <CardDescription>Manage games created by creators</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading games...</div>
          ) : games.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No tip games created yet
            </div>
          ) : (
            <div className="space-y-4">
              {games.map((game: TipGame) => {
                const Icon = gameTypeIcons[game.game_type] || Dices;
                return (
                  <div
                    key={game.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {game.game_type.replace("_", " ")} • Min tip: {game.min_tip} credits
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${game.total_revenue || 0}</p>
                        <p className="text-sm text-muted-foreground">
                          {game.total_spins || 0} spins
                        </p>
                      </div>
                      <Badge variant={game.is_active ? "default" : "secondary"}>
                        {game.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Switch
                        checked={game.is_active}
                        onCheckedChange={(checked) =>
                          toggleGame.mutate({ gameId: game.id, isActive: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteGame.mutate(game.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
