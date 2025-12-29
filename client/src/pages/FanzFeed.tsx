import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';
import {
  ThumbsUp,
  MessageCircle,
  Repeat2,
  Bookmark,
  MoreHorizontal,
  Play,
  Camera,
  Video,
  Music,
  Eye,
  Lock,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Quote,
  Send,
  AlertTriangle,
  Flame,
  Zap,
  Star,
  TrendingUp,
  Hash,
  Globe
} from 'lucide-react';

interface Creator {
  id: string;
  username: string;
  profileImageUrl?: string;
  isVerified: boolean;
}

interface Post {
  id: string;
  creatorId: string;
  type: 'photo' | 'video' | 'audio' | 'text' | 'reel' | 'story' | 'live';
  visibility: 'free' | 'premium' | 'subscribers_only';
  title?: string;
  content?: string;
  priceCents: number;
  mediaUrls: string[];
  thumbnailUrl?: string;
  hashtags: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  repostsCount: number;
  quotesCount: number;
  createdAt: string;
  creator?: Creator;
  // Reshare info
  isRepost?: boolean;
  repostedBy?: Creator;
  repostedAt?: string;
  quoteText?: string;
}

interface User {
  id: string;
  isAgeVerified: boolean;
  isIdentityVerified: boolean;
}

// Anti-screenshot/download protection styles
const protectedContentStyles = `
  .protected-content {
    user-select: none !important;
    -webkit-user-select: none !important;
    -webkit-touch-callout: none !important;
    pointer-events: auto;
  }
  .protected-content img,
  .protected-content video {
    pointer-events: none;
    -webkit-user-drag: none;
    user-drag: none;
  }
  @media print {
    .protected-content { display: none !important; }
  }
`;

// Frosted glass blur overlay for unverified users
const FrostedOverlay = ({
  children,
  isVerified,
  contentType
}: {
  children: React.ReactNode;
  isVerified: boolean;
  contentType: 'age' | 'identity' | 'both';
}) => {
  if (isVerified) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Blurred content */}
      <div className="blur-xl opacity-50 pointer-events-none select-none">
        {children}
      </div>

      {/* Frosted glass overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-gray-900/90 to-black/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center">
        <div className="p-4 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-2xl border border-red-500/30 mb-4">
          {contentType === 'age' ? (
            <ShieldAlert className="h-12 w-12 text-red-400" />
          ) : contentType === 'identity' ? (
            <Shield className="h-12 w-12 text-yellow-400" />
          ) : (
            <Lock className="h-12 w-12 text-red-400" />
          )}
        </div>

        <h3 className="text-xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 mb-2">
          {contentType === 'age' ? 'Age Verification Required' :
           contentType === 'identity' ? 'Identity Verification Required' :
           'Verification Required'}
        </h3>

        <p className="text-gray-400 text-sm mb-4 max-w-xs">
          {contentType === 'age'
            ? 'Verify your age (18+) to view this content'
            : contentType === 'identity'
            ? 'Verify your identity to view premium content'
            : 'Complete verification to unlock this content'}
        </p>

        <Link href="/settings/verification">
          <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/30">
            <ShieldCheck className="h-4 w-4 mr-2" />
            Verify Now
          </Button>
        </Link>
      </div>
    </div>
  );
};

// Repost dialog
const RepostDialog = ({
  post,
  onRepost,
  onQuote,
  isOpen,
  setIsOpen
}: {
  post: Post;
  onRepost: () => void;
  onQuote: (text: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [quoteText, setQuoteText] = useState('');
  const [mode, setMode] = useState<'repost' | 'quote'>('repost');

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-700/50 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 flex items-center gap-2">
            <Repeat2 className="h-5 w-5 text-red-400" />
            Reshare Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Mode selector */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'repost' ? 'default' : 'ghost'}
              onClick={() => setMode('repost')}
              className={mode === 'repost'
                ? 'flex-1 bg-gradient-to-r from-green-600 to-emerald-600'
                : 'flex-1 border border-gray-700 hover:bg-gray-800'}
            >
              <Repeat2 className="h-4 w-4 mr-2" />
              Repost
            </Button>
            <Button
              variant={mode === 'quote' ? 'default' : 'ghost'}
              onClick={() => setMode('quote')}
              className={mode === 'quote'
                ? 'flex-1 bg-gradient-to-r from-red-600 to-orange-600'
                : 'flex-1 border border-gray-700 hover:bg-gray-800'}
            >
              <Quote className="h-4 w-4 mr-2" />
              Quote
            </Button>
          </div>

          {mode === 'quote' && (
            <div className="space-y-2">
              <Textarea
                placeholder="Add your thoughts..."
                value={quoteText}
                onChange={(e) => setQuoteText(e.target.value)}
                className="bg-gray-900/50 border-gray-700 focus:border-red-500 min-h-[100px] resize-none"
                maxLength={280}
              />
              <div className="text-right text-xs text-gray-500">
                {quoteText.length}/280
              </div>
            </div>
          )}

          {/* Preview of original post */}
          <div className="p-3 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={post.creator?.profileImageUrl} />
                <AvatarFallback className="bg-red-600 text-white text-xs">
                  {post.creator?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-bold text-white">
                @{post.creator?.username}
              </span>
            </div>
            <p className="text-sm text-gray-400 line-clamp-2">
              {post.content || post.title || 'Media post'}
            </p>
          </div>

          {/* Warning about on-platform sharing */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
            <p className="text-xs text-yellow-200">
              Content stays on BoyFanz. Downloads and screenshots are disabled to protect creators.
            </p>
          </div>

          <Button
            onClick={() => {
              if (mode === 'repost') {
                onRepost();
              } else {
                onQuote(quoteText);
              }
              setIsOpen(false);
              setQuoteText('');
            }}
            className={`w-full font-bold uppercase tracking-wide shadow-lg ${
              mode === 'repost'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 shadow-green-500/30'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/30'
            }`}
          >
            <Send className="h-4 w-4 mr-2" />
            {mode === 'repost' ? 'Repost' : 'Quote Post'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Post card component with anti-download protection
const FeedPost = ({
  post,
  userVerified,
  onLike,
  onRepost,
  onQuote,
  onBookmark
}: {
  post: Post;
  userVerified: { age: boolean; identity: boolean };
  onLike: (postId: string) => void;
  onRepost: (postId: string) => void;
  onQuote: (postId: string, text: string) => void;
  onBookmark: (postId: string) => void;
}) => {
  const [repostDialogOpen, setRepostDialogOpen] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const needsAgeVerification = post.visibility !== 'free';
  const needsIdentityVerification = post.visibility === 'premium';
  const canViewContent =
    (!needsAgeVerification || userVerified.age) &&
    (!needsIdentityVerification || userVerified.identity);

  return (
    <Card
      className="bg-gradient-to-br from-gray-900/50 via-black/50 to-gray-900/50 border border-gray-800/50 hover:border-gray-700/50 transition-all overflow-hidden"
      data-testid={`post-${post.id}`}
    >
      {/* Repost indicator */}
      {post.isRepost && post.repostedBy && (
        <div className="px-4 pt-3 flex items-center gap-2 text-gray-500 text-sm">
          <Repeat2 className="h-4 w-4" />
          <Link href={`/profile/${post.repostedBy.id}`}>
            <span className="hover:text-gray-300 font-medium">
              @{post.repostedBy.username}
            </span>
          </Link>
          <span>reposted</span>
        </div>
      )}

      {/* Quote text if this is a quote post */}
      {post.quoteText && (
        <div className="px-4 pt-3 pb-2 border-b border-gray-800/50">
          <p className="text-white/90 text-sm">{post.quoteText}</p>
        </div>
      )}

      <CardHeader className="pb-2 pt-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.creatorId}`}>
              <Avatar className="h-12 w-12 ring-2 ring-gray-700/50 hover:ring-red-500/50 transition-all cursor-pointer">
                <AvatarImage src={post.creator?.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-red-600 to-orange-600 text-white font-bold">
                  {post.creator?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>

            <div className="flex flex-col">
              <Link href={`/profile/${post.creatorId}`}>
                <div className="flex items-center gap-2 cursor-pointer hover:text-gray-300 transition-colors">
                  <span className="font-black text-white text-sm">
                    {post.creator?.username || 'Creator'}
                  </span>
                  {post.creator?.isVerified && (
                    <ShieldCheck className="h-4 w-4 text-green-400" />
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>@{post.creator?.username}</span>
                <span>·</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-white hover:bg-gray-800/50 h-8 w-8">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-3">
        {/* Post text content */}
        {post.content && (
          <p className="text-white/90 text-sm mb-3 whitespace-pre-wrap">
            {post.content}
          </p>
        )}

        {/* Media content with protection */}
        {(post.thumbnailUrl || post.mediaUrls.length > 0) && (
          <div className="protected-content mb-3">
            <style dangerouslySetInnerHTML={{ __html: protectedContentStyles }} />

            <FrostedOverlay
              isVerified={canViewContent}
              contentType={needsIdentityVerification ? 'both' : needsAgeVerification ? 'age' : 'age'}
            >
              <Link href={`/post/${post.id}`}>
                <div
                  className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl overflow-hidden cursor-pointer group"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {post.thumbnailUrl || post.mediaUrls[0] ? (
                    <img
                      src={post.thumbnailUrl || post.mediaUrls[0]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      draggable={false}
                      onDragStart={(e) => e.preventDefault()}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-12 w-12 text-gray-600" />
                    </div>
                  )}

                  {post.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="p-4 bg-black/60 rounded-full group-hover:bg-red-600/80 transition-all shadow-lg">
                        <Play className="h-8 w-8 text-white fill-current" />
                      </div>
                    </div>
                  )}

                  {post.type === 'live' && (
                    <Badge className="absolute top-3 left-3 bg-red-600 text-white font-bold animate-pulse">
                      <Flame className="h-3 w-3 mr-1" /> LIVE
                    </Badge>
                  )}

                  {post.mediaUrls.length > 1 && (
                    <Badge variant="secondary" className="absolute top-3 right-3 bg-black/60 text-white">
                      +{post.mediaUrls.length - 1}
                    </Badge>
                  )}

                  {/* Anti-screenshot watermark overlay */}
                  <div className="absolute inset-0 pointer-events-none select-none opacity-0 group-hover:opacity-10 transition-opacity">
                    <div className="absolute inset-0 flex items-center justify-center rotate-[-30deg]">
                      <span className="text-white text-4xl font-black uppercase tracking-widest">
                        BoyFanz
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </FrostedOverlay>
          </div>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.hashtags.slice(0, 5).map((tag, idx) => (
              <Link key={idx} href={`/explore?tag=${tag}`}>
                <span className="text-sm text-red-400 hover:text-red-300 cursor-pointer">
                  #{tag}
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Engagement stats */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
          <div className="flex items-center gap-1">
            {/* Like */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsLiked(!isLiked);
                onLike(post.id);
              }}
              className={`flex items-center gap-1.5 ${
                isLiked
                  ? 'text-red-500 hover:text-red-400'
                  : 'text-gray-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
            >
              <ThumbsUp className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
              {post.likesCount > 0 && (
                <span className="text-xs">{formatCount(post.likesCount)}</span>
              )}
            </Button>

            {/* Comment */}
            <Link href={`/post/${post.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5 text-gray-500 hover:text-orange-400 hover:bg-orange-500/10"
              >
                <MessageCircle className="h-5 w-5" />
                {post.commentsCount > 0 && (
                  <span className="text-xs">{formatCount(post.commentsCount)}</span>
                )}
              </Button>
            </Link>

            {/* Repost */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRepostDialogOpen(true)}
              className="flex items-center gap-1.5 text-gray-500 hover:text-green-400 hover:bg-green-500/10"
            >
              <Repeat2 className="h-5 w-5" />
              {(post.repostsCount + post.quotesCount) > 0 && (
                <span className="text-xs">{formatCount(post.repostsCount + post.quotesCount)}</span>
              )}
            </Button>

            {/* Bookmark */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsBookmarked(!isBookmarked);
                onBookmark(post.id);
              }}
              className={`flex items-center gap-1.5 ${
                isBookmarked
                  ? 'text-yellow-500 hover:text-yellow-400'
                  : 'text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10'
              }`}
            >
              <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Views */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Eye className="h-4 w-4" />
            <span>{formatCount(post.viewsCount)}</span>
          </div>
        </div>
      </CardContent>

      <RepostDialog
        post={post}
        isOpen={repostDialogOpen}
        setIsOpen={setRepostDialogOpen}
        onRepost={() => onRepost(post.id)}
        onQuote={(text) => onQuote(post.id, text)}
      />
    </Card>
  );
};

// Trending sidebar
const TrendingSidebar = () => {
  const { data: trending = [] } = useQuery<{ tag: string; count: number }[]>({
    queryKey: ['/api/trending/tags'],
  });

  return (
    <div className="space-y-4">
      {/* Trending tags */}
      <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-gray-800/50">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-red-400" />
            <h3 className="font-black uppercase tracking-wide text-white">Trending</h3>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {(trending.length > 0 ? trending : [
              { tag: 'jockstrap', count: 1234 },
              { tag: 'musclebear', count: 987 },
              { tag: 'showoff', count: 756 },
              { tag: 'naughty', count: 654 },
              { tag: 'daddy', count: 543 }
            ]).map((trend, idx) => (
              <Link key={idx} href={`/explore?tag=${trend.tag}`}>
                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-all group">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-gray-500 group-hover:text-red-400 transition-colors" />
                    <span className="font-bold text-white group-hover:text-red-400 transition-colors">
                      {trend.tag}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {trend.count.toLocaleString()} posts
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Verification reminder */}
      <Card className="bg-gradient-to-br from-red-950/30 to-orange-950/30 border border-red-500/20">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <ShieldCheck className="h-5 w-5 text-red-400" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm mb-1">Get Verified</h4>
              <p className="text-xs text-gray-400 mb-3">
                Unlock all content and features with full verification.
              </p>
              <Link href="/settings/verification">
                <Button size="sm" className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold text-xs">
                  Verify Now
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default function FanzFeed() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // User verification status
  const { data: verificationStatus } = useQuery<{ ageVerified: boolean; identityVerified: boolean }>({
    queryKey: ['/api/user/verification-status'],
  });

  const userVerified = {
    age: verificationStatus?.ageVerified ?? false,
    identity: verificationStatus?.identityVerified ?? false
  };

  // Feed data
  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ['/api/feed'],
  });

  // Mutations
  const likeMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error('Failed to like');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    }
  });

  const repostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error('Failed to repost');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Reposted!",
        description: "Post shared to your profile",
      });
    }
  });

  const quoteMutation = useMutation({
    mutationFn: async ({ postId, text }: { postId: string; text: string }) => {
      const res = await fetch(`/api/posts/${postId}/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify({ text })
      });
      if (!res.ok) throw new Error('Failed to quote');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Quoted!",
        description: "Quote post shared to your profile",
      });
    }
  });

  const bookmarkMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/bookmark`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      });
      if (!res.ok) throw new Error('Failed to bookmark');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved!",
        description: "Post added to bookmarks",
      });
    }
  });

  // Block screenshots/recording on mobile
  useEffect(() => {
    // Disable right-click on the entire page
    const handleContextMenu = (e: MouseEvent) => {
      if ((e.target as Element).closest('.protected-content')) {
        e.preventDefault();
      }
    };

    // Detect screenshot attempts (basic)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Could log attempt or show warning
        console.log('Tab hidden - potential screenshot detected');
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black" data-testid="fanz-feed">
      {/* Global anti-screenshot styles */}
      <style dangerouslySetInnerHTML={{ __html: protectedContentStyles }} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg shadow-red-500/30">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400">
                    FanzFeed
                  </h1>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Star className="h-3 w-3 text-red-400" />
                    Your personalized creator feed
                  </p>
                </div>
              </div>

              {!userVerified.age && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  Limited View
                </Badge>
              )}
            </div>

            {/* Feed posts */}
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse bg-gray-900/50 border-gray-800/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gray-800 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <div className="h-4 w-32 bg-gray-800 rounded" />
                          <div className="h-3 w-20 bg-gray-800 rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="h-4 w-full bg-gray-800 rounded" />
                        <div className="h-48 bg-gray-800 rounded-xl" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <Card className="text-center py-16 bg-gradient-to-br from-gray-900/50 to-black/50 border-gray-800/50">
                <CardContent>
                  <div className="p-6 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-2xl inline-block mb-6 border border-red-500/20">
                    <Zap className="h-16 w-16 text-red-400" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-2">
                    Your Feed is Empty
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Follow creators to see their posts here
                  </p>
                  <Link href="/explore">
                    <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold uppercase">
                      Discover Creators
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {posts.map((post) => (
                  <FeedPost
                    key={post.id}
                    post={post}
                    userVerified={userVerified}
                    onLike={(id) => likeMutation.mutate(id)}
                    onRepost={(id) => repostMutation.mutate(id)}
                    onQuote={(id, text) => quoteMutation.mutate({ postId: id, text })}
                    onBookmark={(id) => bookmarkMutation.mutate(id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <TrendingSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
