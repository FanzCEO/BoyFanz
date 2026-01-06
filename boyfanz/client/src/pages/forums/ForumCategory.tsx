import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MessageSquare,
  Plus,
  ArrowLeft,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Lock,
  Clock,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isLocked: boolean;
  status: string;
  viewsCount: number;
  repliesCount: number;
  likesCount: number;
  lastReplyAt: string | null;
  createdAt: string;
  authorId: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
}

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  isCreatorForum: boolean;
  topicsCount: number;
  postsCount: number;
}

interface CategoryResponse {
  category: ForumCategory;
  topics: ForumTopic[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ForumCategory() {
  const params = useParams<{ slug: string }>();
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery<CategoryResponse>({
    queryKey: [`/api/forums/categories/${params.slug}`, { page }],
    queryFn: async () => {
      const res = await fetch(`/api/forums/categories/${params.slug}?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch category");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-4 w-96 mb-8" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-24" />
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
          <h2 className="text-xl font-semibold mb-2">Category not found</h2>
          <p className="text-muted-foreground mb-4">This category doesn't exist or has been removed.</p>
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

  const { category, topics, pagination } = data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/forums" className="hover:text-foreground transition-colors">
            Forums
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{category.name}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
              {category.iconUrl ? (
                <img src={category.iconUrl} alt="" className="w-10 h-10 rounded" />
              ) : (
                <MessageSquare className="h-7 w-7 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{category.name}</h1>
              {category.description && (
                <p className="text-muted-foreground">{category.description}</p>
              )}
            </div>
          </div>
          <Link href={`/forums/create?category=${category.id}`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Topic
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{category.topicsCount} topics</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" />
            <span>{category.postsCount} posts</span>
          </div>
          {category.isCreatorForum && (
            <Badge variant="secondary">Creator Forum</Badge>
          )}
        </div>

        {/* Topics List */}
        {topics.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No topics yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Be the first to start a discussion in this category!
              </p>
              <Link href={`/forums/create?category=${category.id}`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Topic
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {topics.map((topic) => (
              <Link key={topic.id} href={`/forums/topic/${topic.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="hidden sm:flex h-10 w-10">
                        <AvatarImage src={topic.authorAvatarUrl || undefined} />
                        <AvatarFallback>
                          {topic.authorUsername?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {topic.isPinned && (
                            <Badge variant="secondary" className="text-xs">
                              <Pin className="h-3 w-3 mr-1" />
                              Pinned
                            </Badge>
                          )}
                          {topic.isLocked && (
                            <Badge variant="outline" className="text-xs">
                              <Lock className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                          <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-1">
                            {topic.title}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {topic.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>by @{topic.authorUsername}</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
                          </div>
                          {(topic.tags as string[])?.slice(0, 3).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{topic.viewsCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{topic.repliesCount}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{topic.likesCount}</span>
                          </div>
                        </div>
                        {topic.lastReplyAt && (
                          <span className="text-xs">
                            Last reply {new Date(topic.lastReplyAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
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
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
