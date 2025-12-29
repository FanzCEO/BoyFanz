import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Film, Play, Eye, Heart, MessageCircle, Share2, Flag, Ban, TrendingUp, Clock, Music, Hash } from "lucide-react";

interface Reel {
  id: string;
  creator_id: string;
  creator_username: string;
  creator_display_name: string;
  video_url: string;
  thumbnail_url: string;
  caption: string;
  duration: number;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  sound_id?: string;
  sound_name?: string;
  hashtags: string[];
  status: 'pending' | 'approved' | 'rejected' | 'flagged';
  is_featured: boolean;
  created_at: string;
}

interface ReelAnalytics {
  totalReels: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  avgEngagementRate: number;
  trendingSounds: Array<{ sound_id: string; sound_name: string; usage_count: number }>;
  topHashtags: Array<{ hashtag: string; usage_count: number }>;
  topCreators: Array<{ creator_id: string; username: string; reel_count: number; total_views: number }>;
}

export default function ReelsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSoundDialogOpen, setIsSoundDialogOpen] = useState(false);

  // Fetch reels
  const { data: reelsData, isLoading: reelsLoading } = useQuery({
    queryKey: ["/api/reels/admin", searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append("searchQuery", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);
      const res = await fetch(`/api/reels/admin?${params}`);
      if (!res.ok) throw new Error("Failed to fetch reels");
      return res.json();
    },
  });

  // Fetch analytics
  const { data: analytics } = useQuery<ReelAnalytics>({
    queryKey: ["/api/reels/admin/analytics"],
    queryFn: async () => {
      const res = await fetch("/api/reels/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  // Fetch sounds
  const { data: soundsData } = useQuery({
    queryKey: ["/api/reels/admin/sounds"],
    queryFn: async () => {
      const res = await fetch("/api/reels/admin/sounds");
      if (!res.ok) throw new Error("Failed to fetch sounds");
      return res.json();
    },
  });

  // Update reel status mutation
  const updateReelStatus = useMutation({
    mutationFn: async ({ reelId, status }: { reelId: string; status: string }) => {
      const res = await fetch(`/api/reels/admin/${reelId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update reel status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reels/admin"] });
      toast({ title: "Reel status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Feature/unfeature reel mutation
  const toggleFeatured = useMutation({
    mutationFn: async ({ reelId, isFeatured }: { reelId: string; isFeatured: boolean }) => {
      const res = await fetch(`/api/reels/admin/${reelId}/feature`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured }),
      });
      if (!res.ok) throw new Error("Failed to update featured status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reels/admin"] });
      toast({ title: "Featured status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Delete reel mutation
  const deleteReel = useMutation({
    mutationFn: async (reelId: string) => {
      const res = await fetch(`/api/reels/admin/${reelId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete reel");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reels/admin"] });
      toast({ title: "Reel deleted" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "default";
      case "pending": return "secondary";
      case "rejected": return "destructive";
      case "flagged": return "outline";
      default: return "secondary";
    }
  };

  if (user?.role !== "admin" && user?.role !== "moderator") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <Film className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
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
            <Film className="h-8 w-8 text-primary" />
            Reels Management
          </h1>
          <p className="text-muted-foreground">TikTok-style short videos</p>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reels</CardTitle>
            <Film className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalReels || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalViews || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalLikes || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comments</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalComments || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shares</CardTitle>
            <Share2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(analytics?.totalShares || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(analytics?.avgEngagementRate || 0).toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reels" className="flex items-center gap-2">
            <Film className="h-4 w-4" />
            All Reels
          </TabsTrigger>
          <TabsTrigger value="sounds" className="flex items-center gap-2">
            <Music className="h-4 w-4" />
            Sounds Library
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Reels Library</CardTitle>
                  <CardDescription>Manage all short-form video content</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by caption, creator..."
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
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {reelsLoading ? (
                <div className="text-center py-8">Loading reels...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Preview</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Caption</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Engagement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(reelsData?.reels || []).map((reel: Reel) => (
                      <TableRow key={reel.id}>
                        <TableCell>
                          <div
                            className="relative w-16 h-24 bg-muted rounded cursor-pointer group"
                            onClick={() => {
                              setSelectedReel(reel);
                              setIsPreviewOpen(true);
                            }}
                          >
                            {reel.thumbnail_url ? (
                              <img
                                src={reel.thumbnail_url}
                                alt="Thumbnail"
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded">
                              <Play className="h-6 w-6 text-white" />
                            </div>
                            {reel.is_featured && (
                              <Badge className="absolute top-1 right-1 text-[10px] px-1">
                                Featured
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{reel.creator_display_name}</p>
                            <p className="text-sm text-muted-foreground">@{reel.creator_username}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px]">
                            <p className="truncate">{reel.caption || "No caption"}</p>
                            {reel.hashtags?.length > 0 && (
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {reel.hashtags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            {formatDuration(reel.duration)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Eye className="h-3 w-3" />
                              {formatNumber(reel.view_count)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Heart className="h-3 w-3" />
                              {formatNumber(reel.like_count)}
                            </div>
                            <div className="flex items-center gap-2">
                              <MessageCircle className="h-3 w-3" />
                              {formatNumber(reel.comment_count)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(reel.status)}>
                            {reel.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Select
                              value={reel.status}
                              onValueChange={(value) => updateReelStatus.mutate({ reelId: reel.id, status: value })}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approve</SelectItem>
                                <SelectItem value="rejected">Reject</SelectItem>
                                <SelectItem value="flagged">Flag</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant={reel.is_featured ? "default" : "outline"}
                              size="icon"
                              onClick={() => toggleFeatured.mutate({ reelId: reel.id, isFeatured: !reel.is_featured })}
                              title={reel.is_featured ? "Remove from featured" : "Add to featured"}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (confirm("Delete this reel?")) {
                                  deleteReel.mutate(reel.id);
                                }
                              }}
                            >
                              <Ban className="h-4 w-4" />
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

        <TabsContent value="sounds" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sounds Library</CardTitle>
              <CardDescription>Audio tracks used in reels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {(soundsData?.sounds || []).map((sound: any) => (
                  <Card key={sound.id} className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Music className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{sound.name}</p>
                        <p className="text-sm text-muted-foreground">{sound.artist || "Original Sound"}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatNumber(sound.usage_count)} reels
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="h-5 w-5" />
                  Trending Sounds
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(analytics?.trendingSounds || []).map((sound, index) => (
                    <div key={sound.sound_id} className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-6">
                        {index + 1}
                      </span>
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded flex items-center justify-center">
                        <Music className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{sound.sound_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatNumber(sound.usage_count)} uses
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Top Hashtags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(analytics?.topHashtags || []).map((tag) => (
                    <Badge key={tag.hashtag} variant="secondary" className="text-sm py-1 px-3">
                      #{tag.hashtag}
                      <span className="ml-2 text-muted-foreground">
                        {formatNumber(tag.usage_count)}
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Top Creators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Creator</TableHead>
                      <TableHead>Reels</TableHead>
                      <TableHead>Total Views</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(analytics?.topCreators || []).map((creator, index) => (
                      <TableRow key={creator.creator_id}>
                        <TableCell className="font-bold">{index + 1}</TableCell>
                        <TableCell className="font-medium">@{creator.username}</TableCell>
                        <TableCell>{creator.reel_count}</TableCell>
                        <TableCell>{formatNumber(creator.total_views)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Video Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reel Preview</DialogTitle>
            <DialogDescription>
              By @{selectedReel?.creator_username}
            </DialogDescription>
          </DialogHeader>
          {selectedReel && (
            <div className="space-y-4">
              <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                <video
                  src={selectedReel.video_url}
                  controls
                  className="w-full h-full object-contain"
                  poster={selectedReel.thumbnail_url}
                />
              </div>
              <div>
                <p className="text-sm">{selectedReel.caption}</p>
                <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {formatNumber(selectedReel.view_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    {formatNumber(selectedReel.like_count)}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {formatNumber(selectedReel.comment_count)}
                  </span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
