import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { ReputationBadge } from "@/components/forums/ReputationBadge";
import {
  MessageSquare,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Lock,
  Clock,
  ChevronRight,
  Send,
  MoreHorizontal,
  Edit,
  Trash,
  Flag,
  Award,
  ThumbsUp
} from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ForumReply {
  id: string;
  content: string;
  parentId: string | null;
  attachmentUrls: string[];
  likesCount: number;
  isEdited: boolean;
  isBestAnswer: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
}

interface ForumTopic {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  viewsCount: number;
  repliesCount: number;
  likesCount: number;
  attachmentUrls: string[];
  pollId: string | null;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
}

interface ForumPoll {
  id: string;
  question: string;
  options: { id: number; text: string; votes: number }[];
  endsAt: string | null;
  isMultiChoice: boolean;
  totalVotes: number;
}

interface TopicResponse {
  topic: ForumTopic;
  replies: ForumReply[];
  poll: ForumPoll | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ForumTopic() {
  const params = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [replyContent, setReplyContent] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<TopicResponse>({
    queryKey: [`/api/forums/topics/${params.id}`, { page }],
    queryFn: async () => {
      const res = await fetch(`/api/forums/topics/${params.id}?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch topic");
      return res.json();
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/forums/topics/${params.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: () => {
      setReplyContent("");
      queryClient.invalidateQueries({ queryKey: [`/api/forums/topics/${params.id}`] });
      toast({ title: "Reply posted!" });
    },
    onError: () => {
      toast({ title: "Failed to post reply", variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/forums/topics/${params.id}/like`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/forums/topics/${params.id}`] });
    },
  });

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    replyMutation.mutate(replyContent);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-96 mb-4" />
          <Skeleton className="h-48 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center py-12">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Topic not found</h2>
          <p className="text-muted-foreground mb-4">This topic doesn't exist or has been removed.</p>
          <Link href="/forums">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forums
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { topic, replies, poll, pagination } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/forums" className="hover:text-foreground transition-colors">
            Forums
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium line-clamp-1">{topic.title}</span>
        </div>

        {/* Topic */}
        <Card className="mb-8">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {topic.isPinned && (
                    <Badge variant="secondary">
                      <Pin className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                  {topic.isLocked && (
                    <Badge variant="outline">
                      <Lock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{topic.title}</CardTitle>
              </div>
              {isAuthenticated && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user?.id === topic.authorId && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-4">
              <Avatar>
                <AvatarImage src={topic.authorAvatarUrl || undefined} />
                <AvatarFallback>
                  {topic.authorUsername?.charAt(0).toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <Link href={`/creator/${topic.authorId}`} className="font-medium hover:text-primary">
                    @{topic.authorUsername}
                  </Link>
                  <ReputationBadge userId={topic.authorId} compact showPoints />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{new Date(topic.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: topic.content }} />

            {/* Tags */}
            {(topic.tags as string[])?.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap mb-4">
                {(topic.tags as string[]).map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Poll */}
            {poll && (
              <Card className="mb-4 bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">{poll.question}</h4>
                  <div className="space-y-2">
                    {poll.options.map((option) => {
                      const percentage = poll.totalVotes > 0
                        ? Math.round((option.votes / poll.totalVotes) * 100)
                        : 0;
                      return (
                        <div key={option.id} className="relative">
                          <div
                            className="absolute inset-0 bg-primary/20 rounded"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex justify-between p-2">
                            <span>{option.text}</span>
                            <span className="font-medium">{percentage}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {poll.totalVotes} total votes
                    {poll.endsAt && ` • Ends ${new Date(poll.endsAt).toLocaleDateString()}`}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Stats & Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{topic.viewsCount} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  <span>{topic.repliesCount} replies</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => likeMutation.mutate()}
                  disabled={!isAuthenticated || likeMutation.isPending}
                >
                  <Heart className="h-4 w-4 mr-1" />
                  {topic.likesCount}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">
            {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
          </h3>

          {replies.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <MessageCircle className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {replies.map((reply) => (
                <Card key={reply.id} className={reply.isBestAnswer ? "border-accent" : ""}>
                  <CardContent className="p-4">
                    {reply.isBestAnswer && (
                      <Badge className="mb-2 bg-accent text-accent-foreground">
                        <Award className="h-3 w-3 mr-1" />
                        Best Answer
                      </Badge>
                    )}
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarImage src={reply.authorAvatarUrl || undefined} />
                        <AvatarFallback>
                          {reply.authorUsername?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link href={`/creator/${reply.authorId}`} className="font-medium hover:text-primary">
                              @{reply.authorUsername}
                            </Link>
                            <ReputationBadge userId={reply.authorId} compact />
                            <span className="text-xs text-muted-foreground">
                              {new Date(reply.createdAt).toLocaleString()}
                              {reply.isEdited && " (edited)"}
                            </span>
                          </div>
                          {isAuthenticated && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {user?.id === reply.authorId && (
                                  <>
                                    <DropdownMenuItem>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash className="h-4 w-4 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                <DropdownMenuItem>
                                  <Flag className="h-4 w-4 mr-2" />
                                  Report
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                        <div className="prose prose-invert prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: reply.content }} />
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {reply.likesCount}
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground px-4">
                Page {page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {isAuthenticated && !topic.isLocked ? (
          <Card>
            <CardContent className="p-4">
              <form onSubmit={handleSubmitReply}>
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[100px] mb-4"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!replyContent.trim() || replyMutation.isPending}>
                    <Send className="h-4 w-4 mr-2" />
                    {replyMutation.isPending ? "Posting..." : "Post Reply"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : topic.isLocked ? (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <Lock className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">This topic is locked. No new replies can be added.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-4 text-center">
              <MessageCircle className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">
                <Link href="/auth/login" className="text-primary hover:underline">Sign in</Link> to reply to this topic.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
