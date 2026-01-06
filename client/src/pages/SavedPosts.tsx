import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bookmark, Heart, MessageSquare, Share2, Trash2, Eye, Lock, Play, Image as ImageIcon } from "lucide-react";
import { Link } from "wouter";

interface SavedPost {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  type: 'photo' | 'video' | 'text';
  visibility: 'public' | 'subscribers' | 'premium';
  content: string;
  mediaUrls: string[];
  likes: number;
  comments: number;
  savedAt: string;
  isLocked: boolean;
}

export default function SavedPosts() {
  const { user } = useAuth();

  const { data: savedPosts = [], isLoading } = useQuery<SavedPost[]>({
    queryKey: ['/api/user/saved-posts'],
    queryFn: async () => {
      const response = await fetch('/api/user/saved-posts');
      if (!response.ok) {
        // Return mock data for now
        return [
          {
            id: 'saved-1',
            creatorId: 'creator-1',
            creatorHandle: 'hotdaddy69',
            creatorName: 'Hot Daddy',
            creatorAvatar: '/boyfanz-logo.png',
            type: 'photo' as const,
            visibility: 'public' as const,
            content: '🔥 Just finished my workout. Who wants to see the results? 💪',
            mediaUrls: ['/underground-bg.jpg'],
            likes: 1247,
            comments: 89,
            savedAt: new Date().toISOString(),
            isLocked: false,
          },
          {
            id: 'saved-2',
            creatorId: 'creator-2',
            creatorHandle: 'musclebear',
            creatorName: 'Muscle Bear',
            creatorAvatar: '/boyfanz-logo.png',
            type: 'video' as const,
            visibility: 'subscribers' as const,
            content: 'Exclusive behind the scenes content just for my subscribers 😈',
            mediaUrls: [],
            likes: 892,
            comments: 156,
            savedAt: new Date(Date.now() - 86400000).toISOString(),
            isLocked: true,
          },
        ];
      }
      return response.json();
    },
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Bookmark className="h-8 w-8 text-red-500" />
            Spank Bank
          </h1>
          <p className="text-gray-400 mt-1">Your saved content for later... enjoyment 😏</p>
        </div>
        <Badge className="bg-red-600/20 text-red-400 border-red-500/30">
          {savedPosts.length} saved
        </Badge>
      </div>

      {/* Saved Posts Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-black/40 backdrop-blur-xl border-red-900/30 animate-pulse">
              <CardContent className="p-6 h-48" />
            </Card>
          ))}
        </div>
      ) : savedPosts.length === 0 ? (
        <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
          <CardContent className="p-12 text-center">
            <Bookmark className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Your Spank Bank is Empty</h3>
            <p className="text-gray-400 mb-6">
              Save posts you want to come back to by clicking the bookmark icon
            </p>
            <Link href="/search">
              <Button className="bg-red-600 hover:bg-red-700">
                Browse Creators
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedPosts.map((post) => (
            <Card
              key={post.id}
              className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all group overflow-hidden"
            >
              {/* Media Preview */}
              {post.mediaUrls.length > 0 && (
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.mediaUrls[0]}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {post.isLocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="h-12 w-12 text-red-400" />
                    </div>
                  )}
                  {post.type === 'video' && !post.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={`
                      ${post.visibility === 'public' ? 'bg-green-600/80' : ''}
                      ${post.visibility === 'subscribers' ? 'bg-red-600/80' : ''}
                      ${post.visibility === 'premium' ? 'bg-purple-600/80' : ''}
                    `}>
                      {post.visibility === 'public' && <Eye className="h-3 w-3 mr-1" />}
                      {post.visibility === 'subscribers' && <Lock className="h-3 w-3 mr-1" />}
                      {post.visibility}
                    </Badge>
                  </div>
                </div>
              )}

              <CardContent className="p-4">
                {/* Creator Info */}
                <Link href={`/creator/${post.creatorId}`}>
                  <div className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <Avatar className="h-10 w-10 ring-2 ring-red-500/30">
                      <AvatarImage src={post.creatorAvatar} />
                      <AvatarFallback className="bg-red-950 text-red-500">
                        {post.creatorName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-white">{post.creatorName}</p>
                      <p className="text-xs text-gray-400">@{post.creatorHandle}</p>
                    </div>
                  </div>
                </Link>

                {/* Content Preview */}
                <p className="text-gray-300 text-sm line-clamp-2 mb-3">
                  {post.content}
                </p>

                {/* Stats & Actions */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-gray-400 text-sm">
                    <span className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {post.comments}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{formatDate(post.savedAt)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
