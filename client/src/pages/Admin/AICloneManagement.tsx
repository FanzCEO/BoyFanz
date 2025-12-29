import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { Bot, MessageCircle, DollarSign, Star, Users, TrendingUp, Settings, Trash2, Eye, Brain } from "lucide-react";

interface AIClone {
  id: string;
  creatorId: string;
  name: string;
  personality: string;
  voiceStyle: string;
  knowledgeBase: string | null;
  isActive: boolean;
  pricePerMessage: number;
  totalConversations: number;
  totalMessages: number;
  totalRevenue: number;
  avgRating: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
}

interface Conversation {
  id: string;
  cloneId: string;
  fanId: string;
  messageCount: number;
  totalSpent: number;
  rating: number | null;
  createdAt: string;
}

export default function AICloneManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedClone, setSelectedClone] = useState<AIClone | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Fetch all AI clones
  const { data: clonesData, isLoading } = useQuery({
    queryKey: ["/api/ai-clone/admin"],
    queryFn: async () => {
      const res = await fetch("/api/ai-clone/admin");
      if (!res.ok) throw new Error("Failed to fetch AI clones");
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analyticsData } = useQuery({
    queryKey: ["/api/ai-clone/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/ai-clone/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Toggle clone status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ cloneId, isActive }: { cloneId: string; isActive: boolean }) => {
      const res = await fetch(`/api/ai-clone/admin/${cloneId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-clone/admin"] });
      toast({ title: "Status updated" });
    },
    onError: () => {
      toast({ title: "Failed to update status", variant: "destructive" });
    },
  });

  // Update clone settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async ({ cloneId, settings }: { cloneId: string; settings: any }) => {
      const res = await fetch(`/api/ai-clone/admin/${cloneId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-clone/admin"] });
      setShowSettingsDialog(false);
      toast({ title: "Settings updated" });
    },
    onError: () => {
      toast({ title: "Failed to update settings", variant: "destructive" });
    },
  });

  // Delete clone mutation
  const deleteCloneMutation = useMutation({
    mutationFn: async (cloneId: string) => {
      const res = await fetch(`/api/ai-clone/admin/${cloneId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete clone");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-clone/admin"] });
      toast({ title: "AI clone deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete clone", variant: "destructive" });
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Access denied. Admin only.</p>
      </div>
    );
  }

  const clones: AIClone[] = clonesData?.clones || [];
  const analytics = analyticsData?.totalStats || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">AI Creator Clones</h1>
          <p className="text-muted-foreground">
            Manage AI chatbot clones that chat like creators
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Bot className="w-4 h-4 mr-2" />
          {clones.length} Clones
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clones</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalClones || clones.length}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.activeClones || clones.filter(c => c.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics.totalMessages || clones.reduce((sum, c) => sum + c.totalMessages, 0)).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {(analytics.totalConversations || clones.reduce((sum, c) => sum + c.totalConversations, 0)).toLocaleString()} conversations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${((analytics.totalRevenue || clones.reduce((sum, c) => sum + c.totalRevenue, 0)) / 100).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">From paid chats</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              {(analytics.avgRating || (clones.length > 0 ? clones.reduce((sum, c) => sum + c.avgRating, 0) / clones.length : 0)).toFixed(1)}
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
            </div>
            <p className="text-xs text-muted-foreground">User satisfaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="all-clones" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-clones">All Clones</TabsTrigger>
          <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
          <TabsTrigger value="recent-activity">Recent Activity</TabsTrigger>
        </TabsList>

        {/* All Clones Tab */}
        <TabsContent value="all-clones">
          <Card>
            <CardHeader>
              <CardTitle>AI Clone Directory</CardTitle>
              <CardDescription>All creator AI clones on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : clones.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No AI clones created yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clone</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Personality</TableHead>
                      <TableHead>Price/Msg</TableHead>
                      <TableHead>Messages</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clones.map((clone) => (
                      <TableRow key={clone.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                              <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">{clone.name}</p>
                              <p className="text-xs text-muted-foreground">{clone.voiceStyle}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {clone.creator?.avatarUrl ? (
                              <img
                                src={clone.creator.avatarUrl}
                                alt={clone.creator.displayName}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-muted" />
                            )}
                            <span className="text-sm">
                              {clone.creator?.displayName || clone.creator?.username || "Unknown"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {clone.personality}
                          </Badge>
                        </TableCell>
                        <TableCell>${(clone.pricePerMessage / 100).toFixed(2)}</TableCell>
                        <TableCell>
                          <div>
                            <p>{clone.totalMessages.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">
                              {clone.totalConversations} convos
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-green-600">
                          ${(clone.totalRevenue / 100).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span>{clone.avgRating.toFixed(1)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={clone.isActive}
                            onCheckedChange={(checked) =>
                              toggleStatusMutation.mutate({ cloneId: clone.id, isActive: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedClone(clone);
                                setShowDetailsDialog(true);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                setSelectedClone(clone);
                                setShowSettingsDialog(true);
                              }}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => {
                                if (confirm("Delete this AI clone?")) {
                                  deleteCloneMutation.mutate(clone.id);
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

        {/* Top Performers Tab */}
        <TabsContent value="top-performers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Performing AI Clones
              </CardTitle>
              <CardDescription>Ranked by revenue generated</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.topClones?.map((clone: any, index: number) => (
                  <div
                    key={clone.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-black"
                            : index === 1
                            ? "bg-gray-400 text-black"
                            : index === 2
                            ? "bg-amber-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{clone.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {clone.totalMessages.toLocaleString()} messages
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ${(clone.totalRevenue / 100).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                        {clone.avgRating.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No performance data available
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent-activity">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Recent Conversations
              </CardTitle>
              <CardDescription>Latest AI clone chat sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData?.recentConversations?.map((conv: Conversation) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Conversation #{conv.id.slice(0, 8)}</p>
                        <p className="text-sm text-muted-foreground">
                          {conv.messageCount} messages • ${(conv.totalSpent / 100).toFixed(2)} spent
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {conv.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                          <span>{conv.rating}</span>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )) || (
                  <p className="text-center text-muted-foreground py-8">
                    No recent conversations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clone Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              {selectedClone?.name}
            </DialogTitle>
            <DialogDescription>
              AI clone details and configuration
            </DialogDescription>
          </DialogHeader>

          {selectedClone && (
            <div className="space-y-6">
              {/* Creator Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                {selectedClone.creator?.avatarUrl ? (
                  <img
                    src={selectedClone.creator.avatarUrl}
                    alt={selectedClone.creator.displayName}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-muted" />
                )}
                <div>
                  <p className="font-medium">
                    {selectedClone.creator?.displayName || selectedClone.creator?.username}
                  </p>
                  <p className="text-sm text-muted-foreground">Creator</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{selectedClone.totalConversations}</p>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">{selectedClone.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Messages</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold text-green-600">
                    ${(selectedClone.totalRevenue / 100).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-2xl font-bold">{selectedClone.avgRating.toFixed(1)}</span>
                    <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">Rating</p>
                </div>
              </div>

              {/* Configuration */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Personality</span>
                  <Badge variant="outline">{selectedClone.personality}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Voice Style</span>
                  <Badge variant="outline">{selectedClone.voiceStyle}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price per Message</span>
                  <span className="font-medium">
                    ${(selectedClone.pricePerMessage / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={selectedClone.isActive ? "default" : "secondary"}>
                    {selectedClone.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Knowledge Base */}
              {selectedClone.knowledgeBase && (
                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <Brain className="w-4 h-4" />
                    Knowledge Base
                  </Label>
                  <div className="p-3 rounded-lg bg-muted/50 max-h-40 overflow-auto">
                    <pre className="text-xs whitespace-pre-wrap">
                      {JSON.stringify(JSON.parse(selectedClone.knowledgeBase), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clone Settings Dialog */}
      <CloneSettingsDialog
        clone={selectedClone}
        open={showSettingsDialog}
        onOpenChange={setShowSettingsDialog}
        onSave={(settings) => {
          if (selectedClone) {
            updateSettingsMutation.mutate({ cloneId: selectedClone.id, settings });
          }
        }}
      />
    </div>
  );
}

// Settings Dialog Component
function CloneSettingsDialog({
  clone,
  open,
  onOpenChange,
  onSave,
}: {
  clone: AIClone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (settings: any) => void;
}) {
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState("");
  const [voiceStyle, setVoiceStyle] = useState("");
  const [pricePerMessage, setPricePerMessage] = useState("");

  // Reset form when clone changes
  useState(() => {
    if (clone) {
      setName(clone.name);
      setPersonality(clone.personality);
      setVoiceStyle(clone.voiceStyle);
      setPricePerMessage((clone.pricePerMessage / 100).toString());
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Edit AI Clone Settings
          </DialogTitle>
          <DialogDescription>
            Update the AI clone configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Clone Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Sexy AI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personality">Personality</Label>
            <Select value={personality} onValueChange={setPersonality}>
              <SelectTrigger>
                <SelectValue placeholder="Select personality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly and flirty">Friendly & Flirty</SelectItem>
                <SelectItem value="dominant">Dominant</SelectItem>
                <SelectItem value="submissive">Submissive</SelectItem>
                <SelectItem value="playful and teasing">Playful & Teasing</SelectItem>
                <SelectItem value="mysterious">Mysterious</SelectItem>
                <SelectItem value="romantic">Romantic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="voiceStyle">Voice Style</Label>
            <Select value={voiceStyle} onValueChange={setVoiceStyle}>
              <SelectTrigger>
                <SelectValue placeholder="Select voice style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="sexy">Sexy</SelectItem>
                <SelectItem value="sweet">Sweet</SelectItem>
                <SelectItem value="sarcastic">Sarcastic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price per Message ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={pricePerMessage}
              onChange={(e) => setPricePerMessage(e.target.value)}
              placeholder="1.00"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave({
                name,
                personality,
                voiceStyle,
                pricePerMessage: Math.round(parseFloat(pricePerMessage || "0") * 100),
              });
            }}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
