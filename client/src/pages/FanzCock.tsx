import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Heart, MessageCircle, Share2, Bookmark, MoreVertical,
  Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown,
  Home, Search, PlusCircle, User, Flame, Music2, Shield,
  Eye, Lock, Sparkles, Zap, Crown, Gift, X
} from 'lucide-react';

interface Reel {
  id: number;
  creatorId: string;
  creator?: {
    id: string;
    displayName: string | null;
    username: string | null;
    profileImage: string | null;
  };
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string;
  duration: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked: boolean;
  visibility: 'public' | 'subscribers' | 'premium';
  tags: string[];
  homePlatform: string;
  visibleOnPlatforms: string[];
  createdAt: Date;
}

// Mock reels data
const mockReels: Reel[] = [
  {
    id: 'reel-1',
    creatorId: 'creator-1',
    creatorUsername: 'hotdaddy69',
    creatorName: 'Hot Daddy',
    creatorAvatar: '/boyfanz-logo.png',
    isVerified: true,
    videoUrl: '/underground-bg.jpg', // placeholder
    thumbnailUrl: '/underground-bg.jpg',
    caption: '🔥 Getting ready for tonight... Who wants to join? #NightLife #Daddy #NSFW',
    audioName: 'Original Audio - Hot Daddy',
    likes: 12500,
    comments: 892,
    shares: 245,
    views: 89000,
    isLiked: false,
    isSaved: false,
    isFollowing: false,
    visibility: 'public',
    tags: ['NightLife', 'Daddy', 'NSFW'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reel-2',
    creatorId: 'creator-2',
    creatorUsername: 'musclebear',
    creatorName: 'Muscle Bear',
    creatorAvatar: '/boyfanz-logo.png',
    isVerified: true,
    videoUrl: '/underground-bg.jpg',
    thumbnailUrl: '/underground-bg.jpg',
    caption: '💪 Post-workout pump. Subscribe for the full video 😈 #Fitness #Bear #Gains',
    audioName: 'Gym Beats - DJ Pump',
    likes: 8900,
    comments: 456,
    shares: 123,
    views: 45000,
    isLiked: true,
    isSaved: false,
    isFollowing: true,
    visibility: 'subscribers',
    tags: ['Fitness', 'Bear', 'Gains'],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'reel-3',
    creatorId: 'creator-3',
    creatorUsername: 'leatherdad',
    creatorName: 'Leather Dad',
    creatorAvatar: '/boyfanz-logo.png',
    isVerified: false,
    videoUrl: '/underground-bg.jpg',
    thumbnailUrl: '/underground-bg.jpg',
    caption: '🖤 New gear arrived... Premium members get the unboxing 🎁 #Leather #Kink #Gear',
    audioName: 'Dark Industrial - Underground',
    likes: 5600,
    comments: 234,
    shares: 89,
    views: 23000,
    isLiked: false,
    isSaved: true,
    isFollowing: false,
    visibility: 'premium',
    tags: ['Leather', 'Kink', 'Gear'],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

function formatCount(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

function ReelCard({ reel, isActive, onLike, onSave, onFollow, onShare }: {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onSave: () => void;
  onFollow: () => void;
  onShare: () => void;
}) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeart, setShowHeart] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastTap = useRef<number>(0);

  // Handle double tap to like
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      onLike();
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 800);
    }
    lastTap.current = now;
  }, [onLike]);

  // Play/pause based on visibility
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="relative w-full h-full bg-black snap-start snap-always">
      {/* Video/Image Background */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onClick={handleDoubleTap}
      >
        {/* For now using image, replace with video when available */}
        <img
          src={reel.thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
        />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Play/Pause indicator */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-black/50 flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Double tap heart animation */}
        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center animate-ping">
            <Heart className="w-32 h-32 text-red-500 fill-red-500" />
          </div>
        )}

        {/* Locked content overlay */}
        {reel.visibility !== 'public' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
            <Lock className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-white text-xl font-bold mb-2">
              {reel.visibility === 'subscribers' ? 'Subscribers Only' : 'Premium Content'}
            </p>
            <Button className="bg-red-600 hover:bg-red-700 mt-2">
              {reel.visibility === 'subscribers' ? 'Subscribe to View' : 'Unlock for $4.99'}
            </Button>
          </div>
        )}
      </div>

      {/* Right side actions */}
      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5 z-20">
        {/* Creator avatar */}
        <div className="relative">
          <Link href={`/creator/${reel.creatorId}`}>
            <Avatar className="w-12 h-12 ring-2 ring-red-500">
              <AvatarImage src={reel.creator?.profileImage || undefined} />
              <AvatarFallback className="bg-red-950 text-red-500">
                {reel.creator?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <button
            onClick={onFollow}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-red-600 flex items-center justify-center"
          >
            <PlusCircle className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Like */}
        <button
          onClick={onLike}
          className="flex flex-col items-center"
        >
          <div className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center transition-all",
            reel.isLiked ? "bg-red-600/20" : "bg-black/30"
          )}>
            <Heart className={cn(
              "w-7 h-7 transition-all",
              reel.isLiked ? "text-red-500 fill-red-500 scale-110" : "text-white"
            )} />
          </div>
          <span className="text-white text-xs mt-1 font-medium">{formatCount(reel.likeCount)}</span>
        </button>

        {/* Comments */}
        <button className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-medium">{formatCount(reel.commentCount)}</span>
        </button>

        {/* Save */}
        <button
          onClick={onSave}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            <Bookmark className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-medium">Save</span>
        </button>

        {/* Share */}
        <button
          onClick={onShare}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            <Share2 className="w-7 h-7 text-white" />
          </div>
          <span className="text-white text-xs mt-1 font-medium">{formatCount(reel.shareCount)}</span>
        </button>

        {/* Sound */}
        <button
          onClick={toggleMute}
          className="flex flex-col items-center"
        >
          <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center">
            {isMuted ? (
              <VolumeX className="w-7 h-7 text-white" />
            ) : (
              <Volume2 className="w-7 h-7 text-white" />
            )}
          </div>
        </button>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-20 left-0 right-16 p-4 z-20">
        {/* Creator info */}
        <div className="flex items-center gap-2 mb-3">
          <Link href={`/creator/${reel.creatorId}`}>
            <span className="font-bold text-white text-lg">
              @{reel.creator?.username || 'unknown'}
            </span>
          </Link>
          <Shield className="w-5 h-5 text-blue-400" />
          <Button
            size="sm"
            variant="outline"
            onClick={onFollow}
            className="ml-2 border-white/50 text-white hover:bg-white/20 h-7 px-3"
          >
            Follow
          </Button>
        </div>

        {/* Caption */}
        <p className="text-white text-sm mb-3 line-clamp-2">
          {reel.caption}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {reel.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-white/30 text-white/90 bg-black/30 text-xs"
            >
              #{tag}
            </Badge>
          ))}
        </div>

        {/* Platform badge for cross-platform reels */}
        {reel.homePlatform !== 'boyfanz' && (
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="border-purple-500 text-purple-400 bg-purple-950/30 text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              From {reel.homePlatform}
            </Badge>
          </div>
        )}
      </div>

      {/* Top gradient */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent z-10" />

      {/* Views counter */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
        <Eye className="w-4 h-4 text-white" />
        <span className="text-white text-xs">{formatCount(reel.viewCount)}</span>
      </div>
    </div>
  );
}

export default function FanzCock() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'foryou' | 'following' | 'live'>('foryou');
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch reels with cross-platform support
  const { data: reelsResponse } = useQuery({
    queryKey: ['/api/reels', activeTab],
    queryFn: async () => {
      const filter = activeTab === 'following' ? 'following' : 'for-you';
      const response = await fetch(`/api/reels?filter=${filter}&limit=20&platform=all`);
      if (!response.ok) throw new Error('Failed to fetch reels');
      return response.json();
    },
  });

  const reels = reelsResponse?.reels || [];

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex]);

  const scrollToIndex = (index: number) => {
    if (containerRef.current && index >= 0 && index < reels.length) {
      containerRef.current.scrollTo({
        top: index * containerRef.current.clientHeight,
        behavior: 'smooth'
      });
    }
  };

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: async (reelId: number) => {
      const response = await fetch(`/api/reels/${reelId}/like`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to like reel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reels'] });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async ({ reelId, platform }: { reelId: number; platform?: string }) => {
      const response = await fetch(`/api/reels/${reelId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ platform: platform || 'link' }),
      });
      if (!response.ok) throw new Error('Failed to share reel');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reels'] });
    },
  });

  const handleLike = (reelId: number) => {
    likeMutation.mutate(reelId);
  };

  const handleSave = (reelId: number) => {
    // TODO: Implement save mutation (requires backend endpoint)
    console.log('Save reel:', reelId);
  };

  const handleFollow = (creatorId: string) => {
    // TODO: Implement follow mutation (use existing follow system)
    console.log('Follow creator:', creatorId);
  };

  const handleShare = (reelId: number) => {
    shareMutation.mutate({ reelId });
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
            <X className="w-6 h-6" />
          </Button>
        </Link>

        {/* Tab switcher */}
        <div className="flex items-center gap-4">
          {[
            { id: 'following', label: 'Following' },
            { id: 'foryou', label: 'For You' },
            { id: 'live', label: '🔴 LIVE' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "text-base font-semibold transition-all",
                activeTab === tab.id
                  ? "text-white border-b-2 border-red-500"
                  : "text-white/60"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
          <Search className="w-6 h-6" />
        </Button>
      </div>

      {/* FanzCock Logo */}
      <div className="absolute top-16 left-0 right-0 z-30 flex justify-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-red-500">🍆</span>
          <span className="text-xl font-bold text-white">FanzCock</span>
        </div>
      </div>

      {/* Reels container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        onScroll={handleScroll}
      >
        {reels.map((reel, index) => (
          <div
            key={reel.id}
            className="w-full h-full flex-shrink-0"
            style={{ height: '100vh' }}
          >
            <ReelCard
              reel={reel}
              isActive={index === currentIndex}
              onLike={() => handleLike(reel.id)}
              onSave={() => handleSave(reel.id)}
              onFollow={() => handleFollow(reel.creatorId)}
              onShare={() => handleShare(reel.id)}
            />
          </div>
        ))}
      </div>

      {/* Navigation hints */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
        {currentIndex > 0 && (
          <button
            onClick={() => scrollToIndex(currentIndex - 1)}
            className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronUp className="w-5 h-5 text-white" />
          </button>
        )}
        {currentIndex < reels.length - 1 && (
          <button
            onClick={() => scrollToIndex(currentIndex + 1)}
            className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center"
          >
            <ChevronDown className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black to-transparent pb-safe">
        <div className="flex items-center justify-around py-3 px-4">
          <Link href="/">
            <div className="flex flex-col items-center gap-1">
              <Home className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70">Home</span>
            </div>
          </Link>
          <Link href="/search">
            <div className="flex flex-col items-center gap-1">
              <Search className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70">Discover</span>
            </div>
          </Link>
          <button className="flex flex-col items-center gap-1 -mt-4">
            <div className="w-12 h-10 bg-gradient-to-r from-red-500 via-red-600 to-orange-500 rounded-lg flex items-center justify-center">
              <PlusCircle className="w-7 h-7 text-white" />
            </div>
          </button>
          <Link href="/messages">
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="w-6 h-6 text-white/70" />
              <span className="text-xs text-white/70">Inbox</span>
            </div>
          </Link>
          <Link href={`/creator/${user?.id}`}>
            <div className="flex flex-col items-center gap-1">
              <User className="w-6 h-6 text-white" />
              <span className="text-xs text-white">Profile</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
