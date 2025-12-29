import { useQuery, useMutation, useInfiniteQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCSRF } from '@/hooks/useCSRF';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import {
  Heart,
  MessageCircle,
  Share2,
  Play,
  Camera,
  Video,
  Music,
  Type,
  Clock,
  Users,
  Eye,
  MoreVertical,
  Image as ImageIcon,
  Smile,
  Calendar,
  Link as LinkIcon,
  Radio,
  QrCode,
  Copy,
  ExternalLink,
  Instagram,
  Twitter,
  Globe,
  MapPin,
  Verified,
  Edit,
  Lock,
  Loader2,
  Bell,
  TrendingUp,
  Flame,
  Zap,
  Star,
  Plus,
  Repeat2,
  Quote,
  Bookmark,
  Grid3X3,
  FolderOpen,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Menu
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

// Stories Carousel - THE DUNGEON - Dark & Seductive
const StoriesCarousel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStory, setSelectedStory] = useState<any>(null);
  const [storyIndex, setStoryIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['/api/stories/feed'],
    refetchInterval: 60000,
  });

  const createStoryMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('media', file);
      const response = await fetch('/api/stories', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to create story');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stories/feed'] });
      toast({ title: "🔥 Story posted!", description: "Now showing in the dungeon for 24 hours" });
    },
  });

  const handleCreateStory = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      createStoryMutation.mutate(file);
    }
  };

  const nextStoryItem = () => {
    if (selectedStory && storyIndex < selectedStory.items.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else {
      // Move to next user's story
      const currentIdx = stories.findIndex((s: any) => s.userId === selectedStory?.userId);
      if (currentIdx < stories.length - 1) {
        setSelectedStory(stories[currentIdx + 1]);
        setStoryIndex(0);
      } else {
        setSelectedStory(null);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-3 px-4 py-4 overflow-x-auto scrollbar-hide bg-gradient-to-r from-black via-red-950/40 to-black">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 text-center animate-pulse">
            <div className="w-18 h-18 rounded-full bg-gradient-to-br from-red-900/50 to-black ring-2 ring-red-600/30" />
            <div className="h-2 w-14 bg-red-900/30 mt-2 mx-auto rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Header Label */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-1 bg-gradient-to-r from-black via-red-950/40 to-black">
        <span className="text-red-500 font-bebas text-lg tracking-wider">🔗 THE DUNGEON</span>
        <span className="text-red-400/60 text-[10px] uppercase tracking-widest">• Fresh Meat</span>
      </div>

      <div className="flex gap-4 px-4 py-3 overflow-x-auto scrollbar-hide bg-gradient-to-r from-black via-red-950/40 to-black border-b-2 border-red-600/60 shadow-[0_0_50px_rgba(220,38,38,0.4)] shadow-inner">
        {/* Add Story Button - Dungeon Entry */}
        <div className="flex-shrink-0 text-center">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-18 h-18 rounded-full bg-gradient-to-br from-red-800 via-red-950 to-black flex items-center justify-center border-2 border-dashed border-red-500 hover:border-red-300 hover:shadow-[0_0_30px_rgba(220,38,38,0.8)] transition-all group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Plus className="w-7 h-7 text-red-400 group-hover:text-red-300 group-hover:scale-110 transition-all" />
          </button>
          <p className="text-xs text-red-400 mt-1.5 font-bebas tracking-wide">EXPOSE 🍆</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleCreateStory}
          />
        </div>

        {/* Stories - Captured Moments */}
        {stories.map((story: any) => (
          <button
            key={story.userId}
            onClick={() => { setSelectedStory(story); setStoryIndex(0); }}
            className="flex-shrink-0 text-center group"
          >
            <div className={`w-18 h-18 rounded-full p-0.5 ${story.hasUnviewed ? 'bg-gradient-to-br from-red-500 via-pink-500 to-red-600 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.6)]' : 'bg-gradient-to-br from-gray-700 to-gray-800'}`}>
              <div className="w-full h-full rounded-full bg-black p-0.5 group-hover:bg-red-950/50 transition-colors">
                <Avatar className="w-full h-full ring-1 ring-red-600/30 group-hover:ring-red-500/60 transition-all">
                  <AvatarImage src={story.userAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-red-900 to-black text-red-200 font-bebas">{story.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <p className="text-xs text-white/70 mt-1.5 truncate max-w-[70px] group-hover:text-red-400 transition-colors font-medium">
              {story.username}
            </p>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal */}
      {selectedStory && (
        <Dialog open={!!selectedStory} onOpenChange={() => setSelectedStory(null)}>
          <DialogContent className="max-w-md p-0 bg-black border-0 overflow-hidden">
            <div className="relative aspect-[9/16] bg-black">
              {/* Progress bars */}
              <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
                {selectedStory.items?.map((_: any, idx: number) => (
                  <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div className={`h-full bg-white ${idx < storyIndex ? 'w-full' : idx === storyIndex ? 'w-1/2 animate-pulse' : 'w-0'}`} />
                  </div>
                ))}
              </div>

              {/* User info */}
              <div className="absolute top-6 left-4 right-4 flex items-center gap-3 z-10">
                <Avatar className="w-10 h-10 ring-2 ring-white/30">
                  <AvatarImage src={selectedStory.userAvatar} />
                  <AvatarFallback>{selectedStory.username?.[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-white font-semibold">{selectedStory.username}</p>
                  <p className="text-white/60 text-xs">{selectedStory.items?.[storyIndex]?.timeAgo}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedStory(null)} className="text-white">
                  <X className="w-6 h-6" />
                </Button>
              </div>

              {/* Story content */}
              <img
                src={selectedStory.items?.[storyIndex]?.mediaUrl}
                alt=""
                className="w-full h-full object-cover"
                onClick={nextStoryItem}
              />

              {/* Navigation arrows */}
              {storyIndex > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStoryIndex(storyIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Photo & Video Albums - Facebook Style
const AlbumsSection = ({ userId }: { userId: string }) => {
  const [activeAlbum, setActiveAlbum] = useState<any>(null);

  const { data: albums = [] } = useQuery({
    queryKey: ['/api/albums', userId],
    enabled: !!userId,
  });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bebas text-xl text-gold-500 flex items-center gap-2">
          <FolderOpen className="w-5 h-5" /> Albums
        </h3>
        <Link href="/albums/create">
          <Button size="sm" variant="outline" className="glass-button">
            <Plus className="w-4 h-4 mr-2" /> Create Album
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {albums.slice(0, 6).map((album: any) => (
          <Card
            key={album.id}
            className="glass-card overflow-hidden cursor-pointer hover:ring-2 ring-red-500/50 transition-all"
            onClick={() => setActiveAlbum(album)}
          >
            <div className="relative aspect-square bg-black/50">
              <img src={album.coverUrl || album.items?.[0]?.thumbnailUrl} alt={album.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-white font-semibold truncate">{album.name}</p>
                <p className="text-white/60 text-xs">{album.itemCount} items</p>
              </div>
              {album.type === 'video' && (
                <Badge className="absolute top-2 right-2 bg-red-600/80">
                  <Video className="w-3 h-3 mr-1" /> Video
                </Badge>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Album Viewer Modal */}
      <Dialog open={!!activeAlbum} onOpenChange={() => setActiveAlbum(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {activeAlbum?.type === 'video' ? <Video className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
              {activeAlbum?.name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh]">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {activeAlbum?.items?.map((item: any, idx: number) => (
                <div key={idx} className="relative aspect-square bg-black/50 rounded-lg overflow-hidden">
                  {item.type === 'video' ? (
                    <video src={item.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={item.url} alt="" className="w-full h-full object-cover" />
                  )}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Quick Menu Dropdown (Hamburger) - Top Right
const QuickMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard', highlight: true },
    { icon: Camera, label: 'Creator Studio', href: '/studio' },
    { icon: Video, label: 'Go Live', href: '/streams/create' },
    { icon: Calendar, label: 'Events', href: '/events' },
    { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
    { icon: FolderOpen, label: 'Albums', href: '/albums' },
    { icon: Users, label: 'Subscribers', href: '/subscriptions' },
  ];

  return (
    <div className="fixed top-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-black/80 backdrop-blur border-red-500/50 hover:bg-red-900/50 w-10 h-10"
          >
            <Menu className="w-5 h-5 text-red-400" />
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-card border-red-900/50 w-80">
          <DialogHeader>
            <DialogTitle className="font-bebas text-gold-500 text-xl">Quick Menu</DialogTitle>
          </DialogHeader>
          <div className="space-y-1 py-2">
            {menuItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.highlight ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'hover:bg-white/5 text-foreground'}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.highlight && <Badge className="ml-auto bg-red-600 text-xs">Admin</Badge>}
                </button>
              </Link>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Fuck Buddies Reactions - Raw & Explicit
const REACTIONS = [
  { emoji: '🍆', name: 'dick', color: 'text-purple-500' },
  { emoji: '🍑', name: 'ass', color: 'text-orange-400' },
  { emoji: '💦', name: 'cum', color: 'text-blue-300' },
  { emoji: '🥵', name: 'horny', color: 'text-red-500' },
  { emoji: '👅', name: 'lick', color: 'text-pink-500' },
  { emoji: '🔥', name: 'hot', color: 'text-orange-500' },
  { emoji: '😈', name: 'nasty', color: 'text-purple-400' },
  { emoji: '🍆💦', name: 'breed', color: 'text-red-600' },
];

const ReactionsButton = ({ postId, reactions = {} }: { postId: string; reactions: Record<string, number> }) => {
  const [showPicker, setShowPicker] = useState(false);
  const { toast } = useToast();

  const totalReactions = Object.values(reactions).reduce((a: any, b: any) => a + b, 0);
  const topReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  const reactMutation = useMutation({
    mutationFn: async (reactionType: string) => {
      return apiRequest('POST', '/api/posts/react', { postId, reactionType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setShowPicker(false);
    },
  });

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="text-muted-foreground hover:text-red-400"
        onMouseEnter={() => setShowPicker(true)}
        onMouseLeave={() => setTimeout(() => setShowPicker(false), 500)}
        onClick={() => reactMutation.mutate('love')}
      >
        <Heart className="w-5 h-5 mr-1" />
        {totalReactions > 0 && (
          <span className="flex items-center gap-0.5">
            {topReactions.map(([type]) => (
              <span key={type}>{REACTIONS.find(r => r.name === type)?.emoji}</span>
            ))}
            {totalReactions}
          </span>
        )}
      </Button>

      {/* Reaction Picker */}
      {showPicker && (
        <div
          className="absolute bottom-full left-0 mb-2 flex gap-1 bg-black/90 backdrop-blur rounded-full p-2 border border-red-500/30 shadow-lg"
          onMouseEnter={() => setShowPicker(true)}
          onMouseLeave={() => setShowPicker(false)}
        >
          {REACTIONS.map((reaction) => (
            <button
              key={reaction.name}
              onClick={() => reactMutation.mutate(reaction.name)}
              className="text-2xl hover:scale-125 transition-transform p-1"
              title={reaction.name}
            >
              {reaction.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Twitter-style Share/Repost Dialog
const ShareDialog = ({ post }: { post: any }) => {
  const [mode, setMode] = useState<'repost' | 'quote' | null>(null);
  const [quoteText, setQuoteText] = useState('');
  const { toast } = useToast();

  const repostMutation = useMutation({
    mutationFn: async ({ type, text }: { type: string; text?: string }) => {
      return apiRequest('POST', '/api/posts/repost', {
        postId: post.id,
        type,
        quoteText: text
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: variables.type === 'repost' ? "Reposted!" : "Quote posted!",
        description: "Shared to your followers"
      });
      setMode(null);
    },
  });

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({ title: "Link copied!", description: "Post link copied to clipboard" });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-400">
          <Share2 className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-red-900/50">
        <DialogHeader>
          <DialogTitle className="font-bebas text-gold-500">Share Post</DialogTitle>
        </DialogHeader>

        {!mode ? (
          <div className="grid grid-cols-1 gap-2 py-4">
            <Button
              variant="outline"
              className="justify-start glass-button h-14"
              onClick={() => repostMutation.mutate({ type: 'repost' })}
            >
              <Repeat2 className="w-5 h-5 mr-3 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Repost</p>
                <p className="text-xs text-muted-foreground">Instantly share to your followers</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start glass-button h-14"
              onClick={() => setMode('quote')}
            >
              <Quote className="w-5 h-5 mr-3 text-blue-400" />
              <div className="text-left">
                <p className="font-medium">Quote</p>
                <p className="text-xs text-muted-foreground">Add your own thoughts</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start glass-button h-14"
              onClick={copyLink}
            >
              <Copy className="w-5 h-5 mr-3 text-gold-500" />
              <div className="text-left">
                <p className="font-medium">Copy Link</p>
                <p className="text-xs text-muted-foreground">Share anywhere</p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start glass-button h-14"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Post by ${post.creator?.username}`,
                    url: `${window.location.origin}/post/${post.id}`,
                  });
                }
              }}
            >
              <ExternalLink className="w-5 h-5 mr-3 text-purple-400" />
              <div className="text-left">
                <p className="font-medium">Share via...</p>
                <p className="text-xs text-muted-foreground">More sharing options</p>
              </div>
            </Button>
          </div>
        ) : (
          <div className="py-4">
            <Textarea
              placeholder="Add your thoughts..."
              value={quoteText}
              onChange={(e) => setQuoteText(e.target.value)}
              className="mb-3 min-h-[80px] border-red-900/30"
            />

            {/* Preview of quoted post */}
            <Card className="glass-card border-red-900/20 p-3 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={post.creator?.profileImageUrl} />
                  <AvatarFallback className="text-xs">{post.creator?.username?.[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">@{post.creator?.username}</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{post.content}</p>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setMode(null)}>Cancel</Button>
              <Button
                className="glass-button-neon"
                onClick={() => repostMutation.mutate({ type: 'quote', text: quoteText })}
                disabled={repostMutation.isPending}
              >
                Post Quote
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

// Bookmark Button
const BookmarkButton = ({ postId, isBookmarked }: { postId: string; isBookmarked: boolean }) => {
  const { toast } = useToast();

  const bookmarkMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/posts/bookmark', { postId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: isBookmarked ? "Removed from bookmarks" : "Saved to bookmarks",
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => bookmarkMutation.mutate()}
      className={isBookmarked ? "text-gold-500" : "text-muted-foreground hover:text-gold-400"}
    >
      <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </Button>
  );
};

// Fuck Buddies Live - Boys Getting Freaky Right Now
const PlatformLiveBar = () => {
  const { data: liveCreators = [], isLoading } = useQuery({
    queryKey: ['/api/streams/live'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-black via-red-950/40 to-black border-b-2 border-red-600/60 py-4 overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.4)]">
        <div className="flex gap-4 px-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex-shrink-0 text-center">
              <div className="w-16 h-16 rounded-full bg-red-900/40 ring-2 ring-red-600/50" />
              <div className="h-2 w-14 bg-red-900/40 mt-2 mx-auto rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-black via-red-950/40 to-black border-b-2 border-red-600/60 py-4 overflow-hidden shadow-[0_0_40px_rgba(220,38,38,0.4)]">
      <div className="flex items-center gap-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 flex-shrink-0 pr-4 border-r-2 border-red-600/50">
          <Radio className="w-6 h-6 text-red-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-red-500 font-bebas text-xl tracking-wider">LIVE 🔴</span>
            <span className="text-red-400/70 text-[10px] uppercase tracking-widest">Boys Getting Nasty</span>
          </div>
        </div>

        {liveCreators.length === 0 ? (
          <div className="flex-shrink-0 text-muted-foreground text-sm">
            No one is live right now
          </div>
        ) : (
          liveCreators.map((creator: any) => (
            <Link key={creator.id} href={`/streams/${creator.streamId}/watch`}>
              <div className="flex-shrink-0 text-center cursor-pointer hover:scale-105 transition-transform group">
                <div className="relative">
                  <Avatar className="w-14 h-14 ring-2 ring-red-500 ring-offset-2 ring-offset-black">
                    <AvatarImage src={creator.avatarUrl} />
                    <AvatarFallback className="bg-red-900 text-red-100">
                      {creator.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                    LIVE
                  </span>
                </div>
                <p className="text-xs text-white/80 mt-2 truncate max-w-[60px] group-hover:text-red-400">
                  {creator.username}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {creator.viewerCount || 0} watching
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

// Full Profile Section - Twitter/X Style with Fuck Buddies Vibe
const ProfileSection = ({ user }: { user: any }) => {
  const [showQR, setShowQR] = useState(false);
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['/api/naughty-profile', user?.id],
    enabled: !!user?.id,
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/user/stats', user?.id],
    enabled: !!user?.id,
  });

  const copyProfileLink = () => {
    const link = `${window.location.origin}/creator/${user?.id}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: "Profile link copied to clipboard" });
  };

  const shareProfile = async () => {
    const link = `${window.location.origin}/creator/${user?.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.displayName || user?.username} on BoyFanz`,
          text: `Check out my profile on BoyFanz!`,
          url: link,
        });
      } catch (err) {
        copyProfileLink();
      }
    } else {
      copyProfileLink();
    }
  };

  // Format join date
  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Recently joined';
    const date = new Date(dateString);
    return `Joined ${date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  };

  return (
    <Card className="glass-card border-red-900/30 overflow-hidden shadow-[0_0_30px_rgba(220,38,38,0.2)]">
      {/* Cover Photo - Dark & Sexy */}
      <div className="relative h-36 md:h-52 bg-gradient-to-r from-black via-red-950 to-black">
        {profile?.coverUrl ? (
          <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-900/50 via-black to-red-950/50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Edit Cover Button */}
        <Link href="/settings/profile">
          <Button size="sm" variant="outline" className="absolute top-3 right-3 glass-button text-xs">
            <Camera className="w-3 h-3 mr-1" /> Edit Cover
          </Button>
        </Link>
      </div>

      <CardContent className="relative -mt-16 md:-mt-20 pb-6">
        {/* Avatar & Action Buttons Row */}
        <div className="flex items-end justify-between mb-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-28 h-28 md:w-36 md:h-36 ring-4 ring-red-600 ring-offset-4 ring-offset-black shadow-[0_0_20px_rgba(220,38,38,0.5)]">
              <AvatarImage src={user?.avatarUrl || user?.profileImageUrl} />
              <AvatarFallback className="bg-gradient-to-br from-red-800 to-red-950 text-red-100 text-3xl font-bebas">
                {user?.displayName?.[0] || user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1.5 shadow-lg">
                <Verified className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Action Buttons - Right Aligned */}
          <div className="flex items-center gap-2">
            <Link href="/settings/profile">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bebas">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Button size="sm" variant="outline" className="glass-button" onClick={shareProfile}>
              <Share2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="glass-button"
              onClick={() => setShowQR(!showQR)}
            >
              <QrCode className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Name & Username */}
        <div className="mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-bebas text-3xl text-gold-500">
              {user?.displayName || user?.username}
            </h1>
            {user?.isVerified && (
              <Verified className="w-5 h-5 text-blue-400" />
            )}
            {profile?.isCreator && (
              <Badge className="bg-red-600/80 text-xs">🔥 CREATOR</Badge>
            )}
          </div>
          <p className="text-muted-foreground">@{user?.username}</p>
        </div>

        {/* Bio Section - Twitter Style */}
        <div className="mb-4">
          {profile?.bio ? (
            <p className="text-foreground/90 whitespace-pre-wrap text-sm leading-relaxed">
              {profile.bio}
            </p>
          ) : (
            <Link href="/settings/profile">
              <p className="text-red-400/70 text-sm italic cursor-pointer hover:text-red-400">
                + Add a bio to tell people about yourself...
              </p>
            </Link>
          )}
        </div>

        {/* Location, Website, Join Date Row - Twitter Style */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mb-4">
          {profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4 text-red-400" /> {profile.location}
            </span>
          )}
          {profile?.websiteUrl && (
            <a
              href={profile.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-red-400 hover:underline"
            >
              <LinkIcon className="w-4 h-4" /> {profile.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-red-400" /> {formatJoinDate(user?.createdAt)}
          </span>
        </div>

        {/* Following / Followers - Twitter Style */}
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/creator/${user?.id}/following`}>
            <span className="hover:underline cursor-pointer">
              <span className="font-bold text-white">{stats?.followingCount || 0}</span>
              <span className="text-muted-foreground ml-1">Following</span>
            </span>
          </Link>
          <Link href={`/creator/${user?.id}/followers`}>
            <span className="hover:underline cursor-pointer">
              <span className="font-bold text-white">{stats?.followersCount || 0}</span>
              <span className="text-muted-foreground ml-1">Fans</span>
            </span>
          </Link>
          <Link href={`/creator/${user?.id}/subscribers`}>
            <span className="hover:underline cursor-pointer">
              <span className="font-bold text-red-400">{stats?.subscribersCount || 0}</span>
              <span className="text-muted-foreground ml-1">Subscribers</span>
            </span>
          </Link>
        </div>

        {/* Social Media Links - Twitter Style */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {profile?.socialLinks?.twitter && (
            <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-gray-700 hover:bg-gray-800 transition-colors text-sm">
              <Twitter className="w-4 h-4 text-white" />
              <span className="text-gray-300">X / Twitter</span>
            </a>
          )}
          {profile?.socialLinks?.instagram && (
            <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-pink-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-colors text-sm">
              <Instagram className="w-4 h-4 text-pink-400" />
              <span className="text-pink-300">Instagram</span>
            </a>
          )}
          {profile?.socialLinks?.tiktok && (
            <a href={profile.socialLinks.tiktok} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/50 border border-gray-700 hover:bg-gray-800 transition-colors text-sm">
              <span className="text-white text-sm">🎵</span>
              <span className="text-gray-300">TikTok</span>
            </a>
          )}
          {profile?.socialLinks?.onlyfans && (
            <a href={profile.socialLinks.onlyfans} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors text-sm">
              <span className="text-blue-400 text-sm">🔞</span>
              <span className="text-blue-300">OnlyFans</span>
            </a>
          )}
          {!profile?.socialLinks?.twitter && !profile?.socialLinks?.instagram && (
            <Link href="/settings/profile">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-dashed border-red-600/50 hover:bg-red-900/20 transition-colors text-sm text-red-400 cursor-pointer">
                <Plus className="w-4 h-4" /> Add Social Links
              </span>
            </Link>
          )}
        </div>

        {/* Sexual Preferences / Kinks (Fuck Buddies Specific) */}
        {profile?.sexualPreferences && (
          <div className="mb-4">
            <p className="text-xs text-red-400 font-bebas uppercase tracking-wider mb-2">🔥 Into</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.sexualPreferences.map((pref: string, idx: number) => (
                <Badge key={idx} className="bg-red-900/50 text-red-300 border-red-600/30 text-xs">
                  {pref}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Profile Stats Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 bg-black/40 rounded-lg border border-red-900/30 mb-4">
          <div className="text-center">
            <p className="font-bebas text-xl text-white">{stats?.postsCount || 0}</p>
            <p className="text-xs text-muted-foreground">Posts</p>
          </div>
          <div className="text-center border-l border-red-900/30">
            <p className="font-bebas text-xl text-white">{stats?.mediaCount || 0}</p>
            <p className="text-xs text-muted-foreground">Media</p>
          </div>
          <div className="text-center border-l border-red-900/30">
            <p className="font-bebas text-xl text-red-400">{stats?.likesCount || 0}</p>
            <p className="text-xs text-muted-foreground">Likes</p>
          </div>
          <div className="text-center border-l border-red-900/30">
            <p className="font-bebas text-xl text-gold-500">${((stats?.earningsTotal || 0) / 100).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Earned</p>
          </div>
        </div>

        {/* Copy Profile Link */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="glass-button flex-1"
            onClick={copyProfileLink}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Profile Link
          </Button>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="mt-4 p-4 bg-white rounded-lg inline-block mx-auto md:mx-0">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/creator/' + user?.id)}`}
              alt="Profile QR Code"
              className="w-36 h-36"
            />
            <p className="text-black text-xs text-center mt-2">Scan to view profile</p>
          </div>
        )}

        {/* Photo & Video Albums - Facebook Style */}
        {user?.id && <AlbumsSection userId={user.id} />}
      </CardContent>
    </Card>
  );
};

// Post Composer - Share Your Dirty Thoughts
const PostComposer = () => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { csrfToken, isLoading: csrfLoading } = useCSRF();

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; type: string }) => {
      return apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      setContent('');
      setIsExpanded(false);
      toast({ title: "Posted!", description: "Your post has been published" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleSubmit = () => {
    if (!content.trim() || !csrfToken) return;
    createPostMutation.mutate({ content, type: 'text' });
  };

  return (
    <Card className="glass-card border-red-900/30 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-red-500/30">
            <AvatarImage src={user?.avatarUrl || user?.profileImageUrl} />
            <AvatarFallback className="bg-red-900 text-red-100">
              {user?.username?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="What's on your mind? Share something with your fans..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="min-h-[80px] border-red-900/30 bg-black/30 resize-none focus:ring-red-500/50"
            />

            {isExpanded && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                    <Calendar className="h-4 w-4" />
                  </Button>
                </div>

                <Button
                  size="sm"
                  className="glass-button-neon"
                  onClick={handleSubmit}
                  disabled={!content.trim() || createPostMutation.isPending || csrfLoading}
                >
                  {createPostMutation.isPending ? 'Posting...' : 'Post'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Post Card Component
const PostCard = ({ post }: { post: any }) => {
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/posts/like', { postId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
    },
  });

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <Card className="glass-card border-red-900/20 hover:border-red-500/40 transition-all overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Link href={`/creator/${post.creatorId}`}>
            <div className="flex items-center gap-3 cursor-pointer">
              <Avatar className="w-10 h-10 ring-2 ring-red-500/30">
                <AvatarImage src={post.creator?.profileImageUrl} />
                <AvatarFallback className="bg-red-900 text-red-100">
                  {post.creator?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gold-500">{post.creator?.username}</span>
                  {post.creator?.isVerified && (
                    <Verified className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </Link>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-2">
        {post.content && (
          <p className="text-foreground/90 mb-3 whitespace-pre-wrap">{post.content}</p>
        )}

        {/* Media */}
        {(post.thumbnailUrl || post.mediaUrls?.length > 0) && (
          <Link href={`/post/${post.id}`}>
            <div className="relative aspect-video rounded-lg overflow-hidden bg-black/50 cursor-pointer group">
              <img
                src={post.thumbnailUrl || post.mediaUrls?.[0]}
                alt=""
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {post.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-4">
                    <Play className="w-8 h-8 text-white fill-current" />
                  </div>
                </div>
              )}
              {post.visibility !== 'free' && (
                <div className="absolute inset-0 backdrop-blur-xl bg-black/60 flex items-center justify-center">
                  <div className="text-center">
                    <Lock className="w-10 h-10 text-red-500 mx-auto mb-2" />
                    <p className="text-red-500 font-bebas">
                      {post.priceCents > 0 ? `$${(post.priceCents / 100).toFixed(2)}` : 'Subscribe to View'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Repost indicator if this is a repost/quote */}
        {post.repostedFrom && (
          <Card className="glass-card border-red-900/20 p-3 mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Repeat2 className="w-4 h-4 text-green-500" />
              <Avatar className="w-6 h-6">
                <AvatarImage src={post.repostedFrom.creator?.profileImageUrl} />
                <AvatarFallback className="text-xs">{post.repostedFrom.creator?.username?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm text-muted-foreground">@{post.repostedFrom.creator?.username}</span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">{post.repostedFrom.content}</p>
          </Card>
        )}

        {/* Actions - Twitter Style */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-900/20">
          <div className="flex items-center gap-2">
            {/* Reactions (Facebook style with picker) */}
            <ReactionsButton postId={post.id} reactions={post.reactions || {}} />

            {/* Comments */}
            <Link href={`/post/${post.id}`}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-gold-400">
                <MessageCircle className="w-5 h-5 mr-1" />
                {post.commentsCount || 0}
              </Button>
            </Link>

            {/* Repost/Quote - Twitter Style */}
            <ShareDialog post={post} />

            {/* Bookmark */}
            <BookmarkButton postId={post.id} isBookmarked={post.isBookmarked} />
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Eye className="w-4 h-4" /> {post.viewsCount || 0}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Co-Star Question Ribbon
const CoStarRibbon = () => {
  const [dismissed, setDismissed] = useState(false);
  const { data: hasCoStar } = useQuery({
    queryKey: ['/api/user/costar-status'],
  });

  // Don't show if already has costar or dismissed
  if (hasCoStar || dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-yellow-600 via-gold-500 to-yellow-600 rounded-lg p-4 mb-4 shadow-lg shadow-yellow-500/20">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-black" />
          <div>
            <p className="font-bebas text-lg text-black">Do you have a co-star?</p>
            <p className="text-xs text-black/70">Add your partner to collaborate on content together!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/costar/add">
            <Button size="sm" className="bg-black text-gold-500 hover:bg-black/80 font-bebas">
              <Users className="w-4 h-4 mr-2" />
              Yes, Add Co-Star
            </Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            className="border-black/30 text-black hover:bg-black/10"
            onClick={() => setDismissed(true)}
          >
            No, Solo Creator
          </Button>
        </div>
      </div>
    </div>
  );
};

// My Feed Tab Content
const MyFeedTab = () => {
  const { data: feedData, isLoading } = useQuery({
    queryKey: ['/api/feed'],
  });

  const posts = feedData?.posts || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-900/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-red-900/30 rounded w-1/4" />
                  <div className="h-3 bg-red-900/30 rounded w-1/2" />
                </div>
              </div>
              <div className="h-48 bg-red-900/30 rounded mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Co-Star Question Ribbon */}
      <CoStarRibbon />

      {/* Post Composer */}
      <PostComposer />

      {posts.length === 0 ? (
        <Card className="glass-card text-center py-12">
          <Camera className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bebas text-2xl text-gold-500 mb-2">No Posts Yet</h3>
          <p className="text-muted-foreground mb-4">Share your first post with your fans!</p>
          <Link href="/studio">
            <Button className="glass-button-neon">
              <Camera className="w-4 h-4 mr-2" /> Create Content
            </Button>
          </Link>
        </Card>
      ) : (
        posts.map((post: any) => <PostCard key={post.id} post={post} />)
      )}
    </div>
  );
};

// Infinity Feed Tab Content
const InfinityFeedTab = () => {
  const loader = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['/api/infinity-feed'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/infinity-feed?page=${pageParam}`);
      if (!response.ok) throw new Error('Failed to fetch feed');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loader.current) observer.observe(loader.current);
    return () => { if (loader.current) observer.unobserve(loader.current); };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-red-900/30" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-red-900/30 rounded w-1/4" />
                  <div className="h-3 bg-red-900/30 rounded w-1/2" />
                </div>
              </div>
              <div className="h-48 bg-red-900/30 rounded mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <Card className="glass-card text-center py-12">
          <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bebas text-2xl text-gold-500 mb-2">Discover Content</h3>
          <p className="text-muted-foreground mb-4">Follow creators to see their content here</p>
          <Link href="/search">
            <Button className="glass-button-neon">
              <Users className="w-4 h-4 mr-2" /> Find Creators
            </Button>
          </Link>
        </Card>
      ) : (
        <>
          {posts.map((post: any) => <PostCard key={post.id} post={post} />)}
          <div ref={loader} className="flex justify-center py-4">
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-red-500" />
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Fanz Feed Tab Content (Notifications/Interactions)
const FanzFeedTab = () => {
  const { data: interactions = [], isLoading } = useQuery({
    queryKey: ['/api/notifications/interactions'],
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-900/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-red-900/30 rounded w-3/4" />
                <div className="h-2 bg-red-900/30 rounded w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {interactions.length === 0 ? (
        <Card className="glass-card text-center py-12">
          <Bell className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-bebas text-2xl text-gold-500 mb-2">No Interactions Yet</h3>
          <p className="text-muted-foreground">When fans like or comment on your posts, you'll see it here</p>
        </Card>
      ) : (
        interactions.map((item: any, idx: number) => (
          <Card key={idx} className="glass-card hover:border-red-500/40 transition-colors">
            <CardContent className="p-3">
              <Link href={item.link || `/post/${item.postId}`}>
                <div className="flex items-center gap-3 cursor-pointer">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={item.user?.avatarUrl} />
                    <AvatarFallback className="bg-red-900 text-red-100">
                      {item.user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-semibold text-gold-500">{item.user?.username}</span>
                      {' '}{item.type === 'like' ? 'liked your post' : item.type === 'comment' ? 'commented on your post' : item.message}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.timeAgo || 'Just now'}</p>
                  </div>
                  {item.type === 'like' && <Heart className="w-5 h-5 text-red-500 fill-red-500" />}
                  {item.type === 'comment' && <MessageCircle className="w-5 h-5 text-gold-500" />}
                </div>
              </Link>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

// FanzCock Tab Content - Vertical Short Videos
const FanzCockTab = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: videos = [], isLoading } = useQuery({
    queryKey: ['/api/fanzcock/feed'],
    refetchInterval: 60000,
  });

  // Fallback videos for demo
  const demoVideos = [
    { id: '1', creatorId: 'demo1', creator: { username: 'hotboy_mike', avatarUrl: '', isVerified: true }, videoUrl: '', thumbnailUrl: '', caption: '🔥 New content dropping tonight... who wants a preview? 💦 #HornyBoys #FuckMe', likes: 12847, comments: 892, shares: 234, views: 98234 },
    { id: '2', creatorId: 'demo2', creator: { username: 'daddy_jake', avatarUrl: '', isVerified: true }, videoUrl: '', thumbnailUrl: '', caption: 'When daddy comes home early 😈🍆 #DaddysBoy #BreedMe', likes: 8923, comments: 567, shares: 189, views: 67890 },
    { id: '3', creatorId: 'demo3', creator: { username: 'twink_tyler', avatarUrl: '', isVerified: false }, videoUrl: '', thumbnailUrl: '', caption: 'POV: You caught me 🥵👀 #TwinkSlut #Caught', likes: 15678, comments: 1234, shares: 456, views: 123456 },
    { id: '4', creatorId: 'demo4', creator: { username: 'alpha_chad', avatarUrl: '', isVerified: true }, videoUrl: '', thumbnailUrl: '', caption: 'Top energy only 💪🔥 Who can handle it? #TopEnergy #RawDog', likes: 21345, comments: 1876, shares: 678, views: 234567 },
    { id: '5', creatorId: 'demo5', creator: { username: 'bottom_boi', avatarUrl: '', isVerified: false }, videoUrl: '', thumbnailUrl: '', caption: 'Looking for someone to use me tonight 🍑💦 #BottomBitch #UseMe', likes: 9876, comments: 654, shares: 321, views: 87654 },
  ];

  const allVideos = videos.length > 0 ? videos : demoVideos;

  // Handle scroll to change videos
  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const height = containerRef.current.clientHeight;
    const newIndex = Math.round(scrollTop / height);

    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < allVideos.length) {
      setCurrentIndex(newIndex);
      // Pause previous video
      if (videoRefs.current[currentIndex]) {
        videoRefs.current[currentIndex]?.pause();
      }
      // Play new video
      if (videoRefs.current[newIndex]) {
        videoRefs.current[newIndex]?.play();
      }
    }
  };

  const likeMutation = useMutation({
    mutationFn: async (videoId: string) => {
      return apiRequest('POST', '/api/fanzcock/like', { videoId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fanzcock/feed'] });
      toast({ title: '🍆 Liked!', description: 'Added to your favorites' });
    },
  });

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-200px)] bg-black flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-red-400 font-bebas text-xl">Loading FanzCock...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* FanzCock Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">🐓</span>
          <h3 className="font-bebas text-xl text-red-500">FANZCOCK</h3>
          <Badge className="bg-gradient-to-r from-red-600 to-pink-600 text-xs animate-pulse">VIRAL SHORTS</Badge>
        </div>
        <Link href="/fanzcock/upload">
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Plus className="w-4 h-4 mr-1" /> Upload
          </Button>
        </Link>
      </div>

      {/* Vertical Short Video Feed */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-[calc(100vh-280px)] overflow-y-scroll snap-y snap-mandatory scrollbar-hide rounded-xl bg-black"
        style={{ scrollSnapType: 'y mandatory' }}
      >
        {allVideos.map((video: any, index: number) => (
          <div
            key={video.id}
            className="relative h-full w-full snap-start snap-always"
            style={{ minHeight: 'calc(100vh - 280px)' }}
          >
            {/* Video Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-red-950">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <Play className="w-20 h-20 text-red-500/50 mx-auto mb-4" />
                    <p className="text-red-400/70 font-bebas text-lg">Video Preview</p>
                  </div>
                </div>
              )}
              {video.videoUrl && (
                <video
                  ref={el => videoRefs.current[index] = el}
                  src={video.videoUrl}
                  className="absolute inset-0 w-full h-full object-cover"
                  loop
                  playsInline
                  muted={muted}
                  onClick={() => {
                    const vid = videoRefs.current[index];
                    if (vid?.paused) vid.play();
                    else vid?.pause();
                  }}
                />
              )}
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />

            {/* Right Side Actions - Vertical Layout */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
              {/* Creator Avatar */}
              <Link href={`/creator/${video.creatorId}`}>
                <div className="relative">
                  <Avatar className="w-12 h-12 ring-2 ring-red-500">
                    <AvatarImage src={video.creator?.avatarUrl} />
                    <AvatarFallback className="bg-red-900 text-red-100 font-bebas">
                      {video.creator?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 rounded-full w-5 h-5 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-white" />
                  </div>
                </div>
              </Link>

              {/* Like */}
              <button
                onClick={() => likeMutation.mutate(video.id)}
                className="flex flex-col items-center group"
              >
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-red-600/50 transition-colors">
                  <Heart className="w-7 h-7 text-white group-hover:text-red-400 group-hover:fill-red-400" />
                </div>
                <span className="text-white text-xs mt-1">{formatCount(video.likes)}</span>
              </button>

              {/* Comment */}
              <button className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-red-600/50 transition-colors">
                  <MessageCircle className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{formatCount(video.comments)}</span>
              </button>

              {/* Share */}
              <button className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-red-600/50 transition-colors">
                  <Share2 className="w-7 h-7 text-white" />
                </div>
                <span className="text-white text-xs mt-1">{formatCount(video.shares)}</span>
              </button>

              {/* Bookmark */}
              <button className="flex flex-col items-center group">
                <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-gold-500/50 transition-colors">
                  <Bookmark className="w-7 h-7 text-white" />
                </div>
              </button>

              {/* Sound Toggle */}
              <button
                onClick={() => setMuted(!muted)}
                className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center"
              >
                {muted ? (
                  <span className="text-white text-lg">🔇</span>
                ) : (
                  <span className="text-white text-lg">🔊</span>
                )}
              </button>
            </div>

            {/* Bottom Info Overlay */}
            <div className="absolute left-3 right-16 bottom-4">
              {/* Creator Info */}
              <div className="flex items-center gap-2 mb-2">
                <Link href={`/creator/${video.creatorId}`}>
                  <span className="font-bold text-white hover:underline">@{video.creator?.username}</span>
                </Link>
                {video.creator?.isVerified && (
                  <Verified className="w-4 h-4 text-blue-400" />
                )}
              </div>

              {/* Caption */}
              <p className="text-white text-sm mb-2 line-clamp-2">
                {video.caption}
              </p>

              {/* Music/Sound - Scrolling Text */}
              <div className="flex items-center gap-2 overflow-hidden">
                <Music className="w-4 h-4 text-white flex-shrink-0" />
                <div className="overflow-hidden">
                  <p className="text-white text-xs whitespace-nowrap animate-marquee">
                    🎵 Original Sound - @{video.creator?.username} • FanzCock Original
                  </p>
                </div>
              </div>
            </div>

            {/* Video Index Indicator */}
            <div className="absolute top-3 right-3 bg-black/50 px-2 py-1 rounded text-xs text-white">
              {index + 1} / {allVideos.length}
            </div>

            {/* Views */}
            <div className="absolute top-3 left-3 bg-black/50 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
              <Eye className="w-3 h-3" /> {formatCount(video.views)}
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 text-xs flex flex-col items-center animate-bounce">
        <ChevronRight className="w-4 h-4 rotate-90" />
        <span>Scroll for more</span>
      </div>

      {/* CSS for marquee animation */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

// Live Events Tab Content
const LiveEventsTab = () => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['/api/events/upcoming'],
  });

  const { data: liveNow = [] } = useQuery({
    queryKey: ['/api/streams/live'],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-card animate-pulse">
            <CardContent className="p-4">
              <div className="h-32 bg-red-900/30 rounded mb-3" />
              <div className="h-4 bg-red-900/30 rounded w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Currently Live */}
      {liveNow.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bebas text-xl text-red-500 mb-3 flex items-center gap-2">
            <Radio className="w-5 h-5 animate-pulse" /> Live Now
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {liveNow.map((stream: any) => (
              <Link key={stream.id} href={`/streams/${stream.id}/watch`}>
                <Card className="glass-card hover:border-red-500/50 cursor-pointer overflow-hidden">
                  <div className="relative aspect-video bg-black">
                    {stream.thumbnailUrl && (
                      <img src={stream.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    )}
                    <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse">LIVE</Badge>
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs">
                      {stream.viewerCount || 0} watching
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm truncate">{stream.title || 'Live Stream'}</p>
                    <p className="text-xs text-muted-foreground">@{stream.creator?.username}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Events */}
      <div>
        <h3 className="font-bebas text-xl text-gold-500 mb-3 flex items-center gap-2">
          <Calendar className="w-5 h-5" /> Upcoming Events
        </h3>
        {events.length === 0 ? (
          <Card className="glass-card text-center py-12">
            <Calendar className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-bebas text-xl text-gold-500 mb-2">No Upcoming Events</h3>
            <p className="text-muted-foreground mb-4">Check back later for live events!</p>
            <Link href="/events/host">
              <Button className="glass-button-neon">
                <Radio className="w-4 h-4 mr-2" /> Host an Event
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {events.map((event: any) => (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card className="glass-card hover:border-gold-500/40 cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="w-16 h-16 bg-gold-500/20 rounded-lg flex items-center justify-center">
                      <Calendar className="w-8 h-8 text-gold-500" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.scheduledFor}</p>
                      <p className="text-xs text-gold-500">by @{event.host?.username}</p>
                    </div>
                    <Button size="sm" variant="outline" className="glass-button">
                      Remind Me
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Trending Hashtags - What's Hot Right Now
const TrendingHashtags = () => {
  const { data: trending = [] } = useQuery({
    queryKey: ['/api/hashtags/trending'],
    refetchInterval: 60000,
  });

  // Fallback trending tags if API returns empty
  const defaultTags = [
    { tag: '#HornyBoys', count: 2847, hot: true },
    { tag: '#FuckMeHard', count: 1923, hot: true },
    { tag: '#BreedMe', count: 1654 },
    { tag: '#DaddysBoy', count: 1432 },
    { tag: '#TwinkSlut', count: 1287 },
    { tag: '#RawDog', count: 1156, hot: true },
    { tag: '#TopEnergy', count: 998 },
    { tag: '#BottomBitch', count: 876 },
  ];

  const tags = trending.length > 0 ? trending : defaultTags;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-4 h-4 text-red-500" />
        <span className="text-sm font-bebas text-red-400 uppercase tracking-wider">Trending Now 🔥</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.slice(0, 8).map((item: any, idx: number) => (
          <Link key={idx} href={`/explore?tag=${encodeURIComponent(item.tag)}`}>
            <Badge
              className={`cursor-pointer transition-all hover:scale-105 ${
                item.hot
                  ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-0 shadow-[0_0_10px_rgba(220,38,38,0.5)] animate-pulse'
                  : 'bg-red-950/50 text-red-400 border-red-600/30 hover:bg-red-900/50'
              }`}
            >
              {item.tag}
              <span className="ml-1 text-[10px] opacity-70">{item.count?.toLocaleString()}</span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Fuck Buddies Request Notifications - Premium Tinder-Style Card Stack
const FuckBuddiesRequests = () => {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedUser, setMatchedUser] = useState<any>(null);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/fuck-buddies/requests'],
    refetchInterval: 15000,
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest('POST', '/api/fuck-buddies/accept', { requestId });
    },
    onSuccess: (_, requestId) => {
      const acceptedUser = requests.find((r: any) => r.id === requestId);
      setMatchedUser(acceptedUser?.fromUser);
      setShowMatch(true);
      setTimeout(() => setShowMatch(false), 2500);
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies/requests'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (requestId: string) => {
      return apiRequest('POST', '/api/fuck-buddies/reject', { requestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies/requests'] });
      toast({ title: 'Passed', description: 'Maybe someone better...', variant: 'default' });
    },
  });

  const handleSwipe = (direction: 'left' | 'right', requestId: string) => {
    setSwipeDirection(direction);
    setTimeout(() => {
      if (direction === 'right') {
        acceptMutation.mutate(requestId);
      } else {
        rejectMutation.mutate(requestId);
      }
      setSwipeDirection(null);
      setCurrentIndex(prev => Math.min(prev + 1, requests.length));
    }, 300);
  };

  if (isLoading) {
    return (
      <div className="relative h-[320px] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-red-950/20 to-black/60 rounded-xl" />
        <div className="relative w-full max-w-[280px] h-[280px] rounded-xl bg-gradient-to-br from-red-950/40 to-black/80 border border-red-600/30 animate-pulse">
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-red-900/40 mb-4" />
            <div className="h-4 w-32 bg-red-900/40 rounded mb-2" />
            <div className="h-3 w-24 bg-red-900/30 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0 || currentIndex >= requests.length) {
    return (
      <div className="relative h-[320px] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-black to-red-950/20 rounded-xl" />
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-4 left-4 w-32 h-32 bg-red-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-4 right-4 w-40 h-40 bg-red-800/20 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative text-center px-4">
          <div className="relative mx-auto w-20 h-20 mb-4">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/30 to-red-900/30 rounded-full animate-ping" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-red-900/60 to-black flex items-center justify-center border border-red-600/40">
              <Heart className="w-8 h-8 text-red-500/60" />
            </div>
          </div>
          <h3 className="font-bebas text-xl text-red-400 tracking-wide mb-1">ALL CAUGHT UP</h3>
          <p className="text-sm text-muted-foreground mb-4">No pending requests right now</p>
          <Link href="/explore">
            <Button className="bg-gradient-to-r from-red-700 to-red-600 hover:from-red-600 hover:to-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all">
              <Users className="w-4 h-4 mr-2" />
              Find Boys to Connect
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentRequest = requests[currentIndex];
  const nextRequest = requests[currentIndex + 1];

  return (
    <div className="relative h-[340px] overflow-hidden">
      {/* Match Animation Overlay */}
      {showMatch && matchedUser && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 rounded-xl animate-in fade-in duration-300">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-2xl opacity-50 animate-ping" />
              <Avatar className="w-24 h-24 ring-4 ring-red-500 relative">
                <AvatarImage src={matchedUser?.avatarUrl} />
                <AvatarFallback className="bg-red-900 text-red-100 font-bebas text-2xl">
                  {matchedUser?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            <h3 className="font-bebas text-3xl text-red-500 mt-4 animate-pulse">IT'S A MATCH!</h3>
            <p className="text-sm text-muted-foreground">You and @{matchedUser?.username} are now fuck buddies</p>
          </div>
        </div>
      )}

      {/* Card Stack */}
      <div className="relative h-full flex items-center justify-center">
        {/* Background card (next in stack) */}
        {nextRequest && (
          <div className="absolute w-[260px] h-[280px] rounded-xl bg-gradient-to-br from-red-950/30 to-black/80 border border-red-600/20 transform scale-95 translate-y-2 opacity-50" />
        )}

        {/* Main Card */}
        <div
          className={`relative w-[280px] rounded-xl overflow-hidden border border-red-600/40 shadow-[0_0_30px_rgba(220,38,38,0.2)] transition-all duration-300 transform ${
            swipeDirection === 'right' ? 'translate-x-[120%] rotate-12 opacity-0' :
            swipeDirection === 'left' ? '-translate-x-[120%] -rotate-12 opacity-0' : ''
          }`}
        >
          {/* Card Background with User's Image */}
          <div className="relative h-[180px] overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentRequest.fromUser?.bannerUrl || currentRequest.fromUser?.avatarUrl})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

            {/* Online indicator */}
            {currentRequest.fromUser?.isOnline && (
              <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[10px] text-green-400 font-medium">ONLINE</span>
              </div>
            )}

            {/* Avatar Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-end gap-3">
                <Link href={`/creator/${currentRequest.fromUser?.id}`}>
                  <Avatar className="w-16 h-16 ring-3 ring-red-500 shadow-xl hover:scale-105 transition-transform">
                    <AvatarImage src={currentRequest.fromUser?.avatarUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-red-800 to-red-900 text-white font-bebas text-xl">
                      {currentRequest.fromUser?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="flex-1 min-w-0 pb-1">
                  <Link href={`/creator/${currentRequest.fromUser?.id}`}>
                    <h4 className="font-bebas text-xl text-white flex items-center gap-1 hover:text-red-400 transition-colors truncate">
                      @{currentRequest.fromUser?.username}
                      {currentRequest.fromUser?.isVerified && (
                        <Verified className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      )}
                    </h4>
                  </Link>
                  <p className="text-xs text-red-400/80">{currentRequest.timeAgo || 'Just now'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="bg-gradient-to-b from-black/90 to-red-950/30 p-4">
            {/* User Stats */}
            <div className="flex justify-around mb-3 py-2 border-y border-red-600/20">
              <div className="text-center">
                <p className="font-bebas text-lg text-white">{currentRequest.fromUser?.postCount || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Posts</p>
              </div>
              <div className="text-center border-x border-red-600/20 px-6">
                <p className="font-bebas text-lg text-white">{currentRequest.fromUser?.followerCount || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Fans</p>
              </div>
              <div className="text-center">
                <p className="font-bebas text-lg text-white">{currentRequest.fromUser?.contentCount || 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Media</p>
              </div>
            </div>

            {/* Request Message */}
            {currentRequest.message && (
              <div className="mb-3 p-2 bg-red-950/30 rounded-lg border border-red-600/20">
                <p className="text-xs text-muted-foreground italic">"{currentRequest.message}"</p>
              </div>
            )}

            {/* Action Buttons - Tinder Style */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleSwipe('left', currentRequest.id)}
                disabled={rejectMutation.isPending}
                className="group relative w-14 h-14 rounded-full bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-gray-600/50 hover:border-gray-500 shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <X className="w-6 h-6 text-gray-400 group-hover:text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-colors" />
                {rejectMutation.isPending && (
                  <Loader2 className="w-6 h-6 text-gray-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                )}
              </button>

              <button
                onClick={() => handleSwipe('right', currentRequest.id)}
                disabled={acceptMutation.isPending}
                className="group relative w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-700 border-2 border-red-500/50 hover:border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
              >
                <Heart className="w-7 h-7 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform" />
                {acceptMutation.isPending && (
                  <Loader2 className="w-7 h-7 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Request Counter */}
      <div className="absolute bottom-2 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground">
          {currentIndex + 1} of {requests.length} requests
        </p>
      </div>

      {/* View All Link */}
      <Link href="/fuck-buddies/requests" className="absolute top-2 right-2">
        <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-950/30 text-xs h-7">
          View All Requests <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Link>
    </div>
  );
};

// Main Social Home Component
export default function SocialHome() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-feed');

  return (
    <div className="min-h-screen bg-background -m-4 md:-m-6">
      {/* Quick Menu - Hamburger top right with Dashboard access */}
      <QuickMenu />

      {/* Platform Live Bar - Fixed at top */}
      <PlatformLiveBar />

      {/* Stories Carousel - Facebook/Instagram Style */}
      <StoriesCarousel />

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Section */}
        <ProfileSection user={user} />

        {/* Fuck Buddies Social - Tabs */}
        <div className="mt-6">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bebas text-2xl text-red-500 flex items-center gap-2">
              <span className="text-3xl">🍆</span> FUCK BUDDIES SOCIAL
            </h2>
            <Link href="/explore">
              <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                Explore <TrendingUp className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Trending Hashtags */}
          <TrendingHashtags />

          {/* Fuck Buddies Request Notifications - Who Wants You */}
          <Card className="mb-4 bg-gradient-to-r from-black via-red-950/30 to-black border-2 border-red-600/50 shadow-[0_0_25px_rgba(220,38,38,0.3)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bebas text-xl text-red-500 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-red-400 animate-pulse" />
                  <span>BUDDY REQUESTS</span>
                  <Badge className="bg-red-600/80 text-xs animate-pulse">🔥 NEW</Badge>
                </h3>
                <Link href="/fuck-buddies">
                  <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 text-xs">
                    My Buddies <Users className="w-3 h-3 ml-1" />
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Boys who want to connect with you 🍆</p>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Fuck Buddies Request Notifications */}
              <FuckBuddiesRequests />
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full bg-black/60 border-2 border-red-600/50 p-1 mb-4 grid grid-cols-4 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
              <TabsTrigger
                value="my-feed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-700 data-[state=active]:to-red-900 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(220,38,38,0.5)] font-bebas text-red-400"
              >
                <Flame className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Feed</span>
              </TabsTrigger>
              <TabsTrigger
                value="fanzcock"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(236,72,153,0.5)] font-bebas text-pink-400"
              >
                <span className="text-lg mr-1">🐓</span>
                <span className="hidden md:inline">FanzCock</span>
              </TabsTrigger>
              <TabsTrigger
                value="infinity-feed"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-700 data-[state=active]:to-red-900 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(220,38,38,0.5)] font-bebas text-red-400"
              >
                <Zap className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden md:inline">Explore</span>
              </TabsTrigger>
              <TabsTrigger
                value="live-events"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-700 data-[state=active]:to-red-900 data-[state=active]:text-white data-[state=active]:shadow-[0_0_15px_rgba(220,38,38,0.5)] font-bebas text-red-400"
              >
                <Radio className="w-4 h-4 mr-1 md:mr-2 animate-pulse" />
                <span className="hidden md:inline">Live 🔴</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="my-feed" className="mt-0">
              <MyFeedTab />
            </TabsContent>

            <TabsContent value="fanzcock" className="mt-0">
              <FanzCockTab />
            </TabsContent>

            <TabsContent value="infinity-feed" className="mt-0">
              <InfinityFeedTab />
            </TabsContent>

            <TabsContent value="live-events" className="mt-0">
              <LiveEventsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
