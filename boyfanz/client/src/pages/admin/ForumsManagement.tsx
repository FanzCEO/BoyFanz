import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  MessagesSquare,
  CheckCircle,
  XCircle,
  Flag,
  Pin,
  Lock,
  Unlock,
  MoreHorizontal,
  Eye,
  AlertTriangle,
  Clock,
  TrendingUp,
  Users,
  RefreshCw
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  moderationStatus: string;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorEmail: string;
}

interface ForumStats {
  categories: number;
  topics: number;
  replies: number;
  pending: number;
  flagged: number;
}

export default function ForumsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [moderationAction, setModerationAction] = useState<string>("");

  // Fetch stats
  const { data: stats, isLoading: statsLoading } = useQuery<ForumStats>({
    queryKey: ["/api/forums/admin/stats"],
  });

  // Fetch topics for moderation
  const { data: topicsData, isLoading: topicsLoading, refetch } = useQuery<{
    topics: ForumTopic[];
    pagination: { page: number; total: number; totalPages: number };
  }>({
    queryKey: [`/api/forums/admin/topics`, { status: selectedStatus }],
    queryFn: async () => {
      const res = await fetch(`/api/forums/admin/topics?status=${selectedStatus}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch topics");
      return res.json();
    },
  });

  // Moderation mutation
  const moderateMutation = useMutation({
    mutationFn: async ({ topicId, action, reason }: { topicId: string; action: string; reason?: string }) => {
      const res = await fetch(`/api/forums/admin/topics/${topicId}/moderate`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to moderate topic");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Topic moderated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/admin/topics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/forums/admin/stats"] });
      setShowModerationDialog(false);
      setSelectedTopic(null);
      setModerationReason("");
    },
    onError: () => {
      toast({ title: "Failed to moderate topic", variant: "destructive" });
    },
  });

  const handleModerate = (topic: ForumTopic, action: string) => {
    if (action === "approve") {
      // Quick approve without dialog
      moderateMutation.mutate({ topicId: topic.id, action });
    } else {
      setSelectedTopic(topic);
      setModerationAction(action);
      setShowModerationDialog(true);
    }
  };

  const confirmModeration = () => {
    if (!selectedTopic) return;
    moderateMutation.mutate({
      topicId: selectedTopic.id,
      action: moderationAction,
      reason: moderationReason,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-accent"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case "flagged":
        return <Badge variant="destructive" className="bg-orange-500"><Flag className="h-3 w-3 mr-1" />Flagged</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const topics = topicsData?.topics || [];

  return (
    <div className="space-y-6" data-testid="forums-management">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display flex items-center gap-2">
            <MessagesSquare className="h-8 w-8 text-primary" />
            Forums Management
          </h1>
          <p className="text-muted-foreground">
            Moderate community forum topics and manage content
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.categories || 0}</p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-secondary" />
              <div>
                <p className="text-2xl font-bold">{stats?.topics || 0}</p>
                <p className="text-xs text-muted-foreground">Topics</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <div>
                <p className="text-2xl font-bold">{stats?.replies || 0}</p>
                <p className="text-xs text-muted-foreground">Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats?.pending ? "border-yellow-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={stats?.flagged ? "border-red-500/50" : ""}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats?.flagged || 0}</p>
                <p className="text-xs text-muted-foreground">Flagged</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Moderation Queue</CardTitle>
          <CardDescription>
            Review and moderate forum topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {topicsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : topics.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-accent" />
              <h3 className="font-semibold mb-2">All clear!</h3>
              <p className="text-muted-foreground">
                No topics with status "{selectedStatus}"
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Topic</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <Link href={`/forums/topic/${topic.id}`}>
                          <p className="font-medium hover:text-primary cursor-pointer line-clamp-1">
                            {topic.title}
                          </p>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {topic.content.replace(/<[^>]+>/g, '').substring(0, 100)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {topic.authorUsername?.charAt(0).toUpperCase() || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">@{topic.authorUsername}</p>
                          <p className="text-xs text-muted-foreground">{topic.authorEmail}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(topic.moderationStatus)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(topic.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/forums/topic/${topic.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Topic
                            </Link>
                          </DropdownMenuItem>
                          {topic.moderationStatus !== "approved" && (
                            <DropdownMenuItem onClick={() => handleModerate(topic, "approve")}>
                              <CheckCircle className="h-4 w-4 mr-2 text-accent" />
                              Approve
                            </DropdownMenuItem>
                          )}
                          {topic.moderationStatus !== "rejected" && (
                            <DropdownMenuItem onClick={() => handleModerate(topic, "reject")}>
                              <XCircle className="h-4 w-4 mr-2 text-destructive" />
                              Reject
                            </DropdownMenuItem>
                          )}
                          {topic.moderationStatus !== "flagged" && (
                            <DropdownMenuItem onClick={() => handleModerate(topic, "flag")}>
                              <Flag className="h-4 w-4 mr-2 text-orange-500" />
                              Flag
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleModerate(topic, "pin")}>
                            <Pin className="h-4 w-4 mr-2" />
                            Pin Topic
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleModerate(topic, "lock")}>
                            <Lock className="h-4 w-4 mr-2" />
                            Lock Topic
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moderationAction === "reject" && "Reject Topic"}
              {moderationAction === "flag" && "Flag Topic"}
              {moderationAction === "pin" && "Pin Topic"}
              {moderationAction === "lock" && "Lock Topic"}
            </DialogTitle>
            <DialogDescription>
              {selectedTopic && (
                <span className="line-clamp-1">{selectedTopic.title}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium mb-2 block">
              Reason (optional)
            </label>
            <Textarea
              placeholder="Enter a reason for this action..."
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={confirmModeration}
              disabled={moderateMutation.isPending}
              variant={moderationAction === "reject" ? "destructive" : "default"}
            >
              {moderateMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
