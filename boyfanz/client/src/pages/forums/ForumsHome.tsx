import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { ReputationCard } from "@/components/forums/ReputationBadge";
import {
  MessageSquare,
  Users,
  TrendingUp,
  Plus,
  Search,
  MessagesSquare,
  Clock,
  Flame,
  Star,
  ChevronRight,
  Trophy
} from "lucide-react";
import { useState } from "react";

interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  isCreatorForum: boolean;
  topicsCount: number;
  postsCount: number;
  lastActivityAt: string | null;
  creatorId: string | null;
}

export default function ForumsHome() {
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useAuth();

  const { data: categoriesData, isLoading } = useQuery<{ categories: ForumCategory[] }>({
    queryKey: ["/api/forums/categories"],
  });

  const categories = categoriesData?.categories || [];
  const platformCategories = categories.filter(c => !c.isCreatorForum);
  const creatorCategories = categories.filter(c => c.isCreatorForum);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/forums/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="forums-home">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MessagesSquare className="h-8 w-8 text-primary" />
              Community Forums
            </h1>
            <p className="text-muted-foreground mt-1">
              Connect with creators and fans, share tips, and join discussions
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/forums/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Topic
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search topics, tags, or discussions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Main Layout with Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-4 text-center">
                  <MessagesSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold">{categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <MessageSquare className="h-6 w-6 mx-auto mb-2 text-secondary" />
                  <p className="text-2xl font-bold">
                    {categories.reduce((sum, c) => sum + c.topicsCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Topics</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2 text-accent" />
                  <p className="text-2xl font-bold">
                    {categories.reduce((sum, c) => sum + c.postsCount, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Posts</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 mx-auto mb-2 text-pink-500" />
                  <p className="text-2xl font-bold">{creatorCategories.length}</p>
                  <p className="text-xs text-muted-foreground">Creator Forums</p>
                </CardContent>
              </Card>
            </div>

            {/* Platform Categories */}
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Community Categories
              </h2>

              {isLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24" />
                  ))}
                </div>
              ) : platformCategories.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <MessagesSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">No categories yet</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Be the first to create a discussion category!
                    </p>
                    <Link href="/forums/categories/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Category
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {platformCategories.map((category) => (
                    <Link key={category.id} href={`/forums/category/${category.slug}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              {category.iconUrl ? (
                                <img src={category.iconUrl} alt="" className="w-8 h-8 rounded" />
                              ) : (
                                <MessageSquare className="h-6 w-6 text-primary" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold group-hover:text-primary transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {category.description || "Join the discussion"}
                              </p>
                            </div>
                            <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{category.topicsCount}</p>
                                <p className="text-xs">Topics</p>
                              </div>
                              <div className="text-center">
                                <p className="font-semibold text-foreground">{category.postsCount}</p>
                                <p className="text-xs">Posts</p>
                              </div>
                              {category.lastActivityAt && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(category.lastActivityAt).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Creator Forums */}
            {creatorCategories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Creator Fan Clubs
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {creatorCategories.map((category) => (
                    <Link key={category.id} href={`/forums/category/${category.slug}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                              {category.iconUrl ? (
                                <img src={category.iconUrl} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <Users className="h-5 w-5 text-white" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold">{category.name}</h3>
                              <Badge variant="secondary" className="text-xs">Fan Club</Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {category.description || "Exclusive fan community"}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{category.topicsCount} topics</span>
                            <span>{category.postsCount} posts</span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Create Category CTA */}
            <Card className="mt-12 bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardContent className="p-8 text-center">
                <h3 className="text-xl font-bold mb-2">Start Your Own Community</h3>
                <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                  Create a category for your fans or start a new discussion topic in the community
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link href="/forums/categories/create">
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Category
                    </Button>
                  </Link>
                  <Link href="/forums/create">
                    <Button>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Start a Topic
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* User Reputation */}
            {isAuthenticated && user && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-amber-500" />
                    Your Reputation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ReputationCard userId={user.id} />
                </CardContent>
              </Card>
            )}

            {/* Forum Rules */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Forum Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <p>• Be respectful to other members</p>
                <p>• No spam or self-promotion</p>
                <p>• Keep discussions on-topic</p>
                <p>• Report inappropriate content</p>
                <p>• Have fun and engage!</p>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/forums/create">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    New Topic
                  </Button>
                </Link>
                <Link href="/forums/categories/create">
                  <Button variant="outline" className="w-full justify-start">
                    <MessagesSquare className="h-4 w-4 mr-2" />
                    Create Category
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
