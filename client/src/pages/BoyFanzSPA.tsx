// @ts-nocheck
import { useEffect, useState, useRef } from "react";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2, Lock, CheckCircle2, Shield, Video, Image as ImageIcon, Play, Heart,
  MessageCircle, Repeat2, Quote, Share2, X, ChevronLeft, ChevronRight, BarChart3,
  Check, Plus, Camera, Smile, MapPin, Tag, MoreHorizontal, Send, Bookmark,
  Flame, Sparkles, Eye, TrendingUp, Radio, Users, Calendar, Gift, Crown,
  Zap, Star, ThumbsUp, PartyPopper, Laugh, Angry, Frown, Hash, Globe,
  Home, Bell, Settings, Search, UserPlus, MessageSquare, Tv, ShoppingBag,
  Music, Gamepad2, Newspaper, Briefcase, GraduationCap, Heart as HeartIcon
} from "lucide-react";
import { OptimizedImage, OptimizedAvatar } from "@/components/ui/OptimizedImage";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { FAN_PLATFORMS as FANZ_PLATFORMS, getPlatformById as getPlatformConfig, getPlatformByDomain, type FanzPlatform as PlatformConfig } from "@/../../shared/fanzEcosystemRegistry";
import { BathhousePipes } from "@/components/bathhouse/BathhousePipes";
import { FeedAd } from "@/components/ads/AdBanner";

// Helper to get current platform from hostname
const getCurrentPlatform = () => {
  if (typeof window !== 'undefined') {
    return getPlatformByDomain(window.location.hostname) || getPlatformConfig('boyfanz');
  }
  return getPlatformConfig('boyfanz');
};

const POSTS_PER_AD = 4;

// Reaction types for underground adult platform
const REACTIONS = [
  { id: 'fire', emoji: '🔥', label: 'Fire', color: 'text-orange-500' },
  { id: 'heart', emoji: '❤️', label: 'Love', color: 'text-red-500' },
  { id: 'drool', emoji: '🤤', label: 'Drool', color: 'text-pink-500' },
  { id: 'mindblown', emoji: '🤯', label: 'Mind Blown', color: 'text-purple-500' },
  { id: 'naughty', emoji: '😈', label: 'Naughty', color: 'text-violet-500' },
  { id: 'peach', emoji: '🍑', label: 'Peachy', color: 'text-orange-400' },
];

interface Story {
  id: string;
  creatorId: string;
  type: string;
  mediaUrl: string;
  thumbnailUrl: string | null;
  text: string | null;
  viewsCount: number;
  expiresAt: string;
  createdAt: string;
  creatorUsername: string;
  creatorAvatar: string;
  hasUnviewed?: boolean;
}

interface StoryGroup {
  creatorId: string;
  creatorUsername: string;
  creatorAvatar: string;
  stories: Story[];
  hasUnviewed?: boolean;
}

interface PollOption {
  index: number;
  text: string;
  votes: number;
}

interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  endsAt: string | null;
  isMultiChoice: boolean;
  userVote?: number | null;
}

interface Reaction {
  type: string;
  count: number;
  hasReacted: boolean;
}

interface Post {
  id: string;
  creatorId: string;
  creatorHandle: string;
  creatorName: string;
  creatorAvatar: string;
  type: string;
  visibility: string;
  title: string | null;
  content: string | null;
  mediaUrls: string[];
  thumbnailUrl: string | null;
  priceCents: number;
  isSubscribed: boolean;
  isFreeToView: boolean;
  isAgeVerified: boolean;
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  repostsCount?: number;
  quotesCount?: number;
  reactions?: Reaction[];
  pollId?: string | null;
  poll?: Poll | null;
  createdAt: string;
  isLive?: boolean;
  isSaved?: boolean;
  platformSlug?: string; // Which FANZ platform this post is from
  isCrossPlatform?: boolean; // Is this from a different platform
}

interface LiveStream {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar: string;
  title: string;
  viewerCount: number;
  thumbnailUrl?: string;
}

interface TrendingTopic {
  id: string;
  tag: string;
  postCount: number;
  category: string;
}

interface SuggestedCreator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  isVerified: boolean;
  subscriberCount: number;
  category: string;
}

export default function BoyFanzSPA() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const loader = useRef<HTMLDivElement>(null);
  const [location] = useLocation();

  // State
  const [quoteDialogOpen, setQuoteDialogOpen] = useState<string | null>(null);
  const [quoteContent, setQuoteContent] = useState("");
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [postContent, setPostContent] = useState("");
  const [activeReactionPost, setActiveReactionPost] = useState<string | null>(null);
  const [viewingStory, setViewingStory] = useState<{ group: StoryGroup; index: number } | null>(null);
  const [feedFilter, setFeedFilter] = useState<'all' | 'following' | 'trending' | 'crossplatform' | 'buddies'>('all');
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState(false);

  // Mock data for API fallbacks
  const mockLiveStreams: LiveStream[] = [
    { id: 'live-1', creatorId: 'creator-1', creatorName: 'Hot Daddy', creatorAvatar: '/boyfanz-logo.png', title: 'Late Night Show 🔥', viewerCount: 127, thumbnailUrl: '/underground-bg.jpg' },
    { id: 'live-2', creatorId: 'creator-2', creatorName: 'Muscle Jock', creatorAvatar: '/boyfanz-logo.png', title: 'Gym Session Q&A', viewerCount: 89, thumbnailUrl: '/underground-bg.jpg' },
  ];

  const mockTrendingTopics: TrendingTopic[] = [
    { id: '1', tag: 'NightLife', postCount: 2500, category: 'Entertainment' },
    { id: '2', tag: 'ExclusiveContent', postCount: 1800, category: 'Creators' },
    { id: '3', tag: 'LiveTonight', postCount: 1200, category: 'Events' },
    { id: '4', tag: 'NewCreator', postCount: 950, category: 'Community' },
    { id: '5', tag: 'WeekendVibes', postCount: 800, category: 'Lifestyle' },
  ];

  const mockSuggestedCreators: SuggestedCreator[] = [
    { id: 'creator-1', username: 'hotdaddy69', displayName: 'Hot Daddy', avatar: '/boyfanz-logo.png', isVerified: true, subscriberCount: 15000, category: 'Entertainment' },
    { id: 'creator-2', username: 'musclejock', displayName: 'Muscle Jock', avatar: '/boyfanz-logo.png', isVerified: true, subscriberCount: 12000, category: 'Fitness' },
    { id: 'creator-3', username: 'bearhugs', displayName: 'Bear Hugs', avatar: '/boyfanz-logo.png', isVerified: false, subscriberCount: 8500, category: 'Lifestyle' },
  ];

  // Fetch live streams with fallback
  const { data: liveStreams = mockLiveStreams } = useQuery<LiveStream[]>({
    queryKey: ['/api/streams/live'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/streams/live', { credentials: 'include' });
        if (!response.ok) return mockLiveStreams;
        const result = await response.json();
        return result.length > 0 ? result : mockLiveStreams;
      } catch (err) {
        return mockLiveStreams;
      }
    },
    enabled: !!user,
  });

  // Fetch trending topics with fallback
  const { data: trendingTopics = mockTrendingTopics } = useQuery<TrendingTopic[]>({
    queryKey: ['/api/trending/topics'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/trending/topics', { credentials: 'include' });
        if (!response.ok) return mockTrendingTopics;
        const result = await response.json();
        return result.length > 0 ? result : mockTrendingTopics;
      } catch (err) {
        return mockTrendingTopics;
      }
    },
    enabled: !!user,
  });

  // Fetch suggested creators with fallback
  const { data: suggestedCreators = mockSuggestedCreators } = useQuery<SuggestedCreator[]>({
    queryKey: ['/api/creators/suggested'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/creators/suggested', { credentials: 'include' });
        if (!response.ok) return mockSuggestedCreators;
        const result = await response.json();
        return result.length > 0 ? result : mockSuggestedCreators;
      } catch (err) {
        return mockSuggestedCreators;
      }
    },
    enabled: !!user,
  });

  // Fetch Top 8 Fuck Buddies
  const { data: topEightBuddies = [] } = useQuery({
    queryKey: ['/api/fuck-buddies', user?.id, 'top-eight'],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/fuck-buddies/${user.id}/top-eight`, { credentials: 'include' });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Fetch pending Fuck Buddy requests
  const { data: buddyRequests } = useQuery({
    queryKey: ['/api/fuck-buddies/requests/pending'],
    queryFn: async () => {
      const response = await fetch('/api/fuck-buddies/requests/pending', { credentials: 'include' });
      if (!response.ok) return { received: [], sent: [] };
      return response.json();
    },
    enabled: !!user?.id,
  });

  // Mutations
  const repostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/repost`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to repost');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Reposted!", description: "Post shared to your profile" });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
    },
  });

  const quoteMutation = useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const res = await fetch(`/api/posts/${postId}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quoteContent: content }),
      });
      if (!res.ok) throw new Error('Failed to quote');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Quoted!", description: "Post quoted with your comment" });
      setQuoteDialogOpen(null);
      setQuoteContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
    },
  });

  const reactMutation = useMutation({
    mutationFn: async ({ postId, reactionType }: { postId: string; reactionType: string }) => {
      const res = await fetch(`/api/posts/${postId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reactionType }),
      });
      if (!res.ok) throw new Error('Failed to react');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
      setActiveReactionPost(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Saved!", description: "Post added to your collection" });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content, type: 'text', visibility: 'public' }),
      });
      if (!res.ok) throw new Error('Failed to create post');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Posted!", description: "Your post is now live" });
      setPostContent("");
      setCreatePostOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
    },
  });

  const pollVoteMutation = useMutation({
    mutationFn: async ({ pollId, optionIndex }: { pollId: string; optionIndex: number }) => {
      const res = await fetch(`/api/polls/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ optionIndex }),
      });
      if (!res.ok) throw new Error('Failed to vote');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Vote recorded!" });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
    },
  });

  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        credentials: 'include',
      });
    }
  });

  // Get current platform
  const currentPlatform = getCurrentPlatform();

  // Mock posts for when API returns empty - with cross-platform support
  const mockPosts: Post[] = [
    {
      id: 'mock-1',
      creatorId: 'creator-1',
      creatorHandle: 'hotdaddy69',
      creatorName: 'Hot Daddy',
      creatorAvatar: '/boyfanz-logo.png',
      type: 'photo',
      visibility: 'public',
      title: null,
      content: 'Welcome to BoyFanz! 🔥 The hottest new platform for content creators. Follow me for exclusive content!',
      mediaUrls: ['/underground-bg.jpg'],
      thumbnailUrl: null,
      priceCents: 0,
      isSubscribed: false,
      isFreeToView: true,
      isAgeVerified: true,
      likesCount: 247,
      commentsCount: 42,
      viewsCount: 1520,
      repostsCount: 15,
      quotesCount: 8,
      reactions: [
        { type: 'fire', count: 150, hasReacted: false },
        { type: 'heart', count: 97, hasReacted: false },
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      isSaved: false,
      platformSlug: 'boyfanz',
      isCrossPlatform: false,
    },
    {
      id: 'mock-2',
      creatorId: 'creator-2',
      creatorHandle: 'musclejock',
      creatorName: 'Muscle Jock',
      creatorAvatar: '/boyfanz-logo.png',
      type: 'text',
      visibility: 'public',
      title: null,
      content: 'Just finished an intense workout 💪 Who wants to see the results? Subscribe for the full video 😈',
      mediaUrls: [],
      thumbnailUrl: null,
      priceCents: 0,
      isSubscribed: false,
      isFreeToView: true,
      isAgeVerified: true,
      likesCount: 189,
      commentsCount: 28,
      viewsCount: 890,
      repostsCount: 12,
      quotesCount: 5,
      reactions: [
        { type: 'drool', count: 100, hasReacted: false },
        { type: 'fire', count: 89, hasReacted: false },
      ],
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      isSaved: false,
      platformSlug: 'brofanz',
      isCrossPlatform: true,
    },
    {
      id: 'mock-3',
      creatorId: 'creator-3',
      creatorHandle: 'bearhugs',
      creatorName: 'Bear Hugs',
      creatorAvatar: '/boyfanz-logo.png',
      type: 'text',
      visibility: 'public',
      title: null,
      content: 'Late night thoughts... Who else is up? 🌙 DMs are open for my subscribers 💋',
      mediaUrls: [],
      thumbnailUrl: null,
      priceCents: 0,
      isSubscribed: false,
      isFreeToView: true,
      isAgeVerified: true,
      likesCount: 156,
      commentsCount: 67,
      viewsCount: 720,
      repostsCount: 8,
      quotesCount: 3,
      reactions: [
        { type: 'heart', count: 100, hasReacted: false },
        { type: 'naughty', count: 56, hasReacted: false },
      ],
      createdAt: new Date(Date.now() - 14400000).toISOString(),
      isSaved: false,
      platformSlug: 'bearfanz',
      isCrossPlatform: true,
    },
    {
      id: 'mock-4',
      creatorId: 'creator-4',
      creatorHandle: 'fierceQueen',
      creatorName: 'Fierce Queen',
      creatorAvatar: '/boyfanz-logo.png',
      type: 'text',
      visibility: 'public',
      title: null,
      content: 'New photoshoot dropping tomorrow 💅✨ You boys ready for this? #FemmeFatale',
      mediaUrls: [],
      thumbnailUrl: null,
      priceCents: 0,
      isSubscribed: false,
      isFreeToView: true,
      isAgeVerified: true,
      likesCount: 342,
      commentsCount: 89,
      viewsCount: 1240,
      repostsCount: 24,
      quotesCount: 12,
      reactions: [
        { type: 'fire', count: 200, hasReacted: false },
        { type: 'heart', count: 142, hasReacted: false },
      ],
      createdAt: new Date(Date.now() - 21600000).toISOString(),
      isSaved: false,
      platformSlug: 'femmefanz',
      isCrossPlatform: true,
    },
  ];

  // Feed query
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['/api/infinity-feed', feedFilter],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await fetch(`/api/infinity-feed?page=${pageParam}&filter=${feedFilter}`, {
          credentials: 'include',
        });
        if (!response.ok) {
          // Return mock data on error
          return { posts: pageParam === 1 ? mockPosts : [], hasMore: false };
        }
        const result = await response.json() as { posts: Post[]; hasMore: boolean };
        // If API returns empty, use mock data for first page
        if (result.posts.length === 0 && pageParam === 1) {
          return { posts: mockPosts, hasMore: false };
        }
        return result;
      } catch (err) {
        // Return mock data on network error
        return { posts: pageParam === 1 ? mockPosts : [], hasMore: false };
      }
    },
    getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined,
    initialPageParam: 1,
    enabled: !!user,
  });

  // Mock story groups
  const mockStoryGroups: StoryGroup[] = [
    {
      creatorId: 'creator-1',
      creatorUsername: 'hotdaddy69',
      creatorAvatar: '/boyfanz-logo.png',
      stories: [{
        id: 'story-1',
        creatorId: 'creator-1',
        type: 'photo',
        mediaUrl: '/underground-bg.jpg',
        thumbnailUrl: null,
        text: 'New content dropping soon! 🔥',
        viewsCount: 234,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        creatorUsername: 'hotdaddy69',
        creatorAvatar: '/boyfanz-logo.png',
      }],
      hasUnviewed: true,
    },
    {
      creatorId: 'creator-2',
      creatorUsername: 'musclejock',
      creatorAvatar: '/boyfanz-logo.png',
      stories: [{
        id: 'story-2',
        creatorId: 'creator-2',
        type: 'photo',
        mediaUrl: '/underground-bg.jpg',
        thumbnailUrl: null,
        text: 'Gym selfie 💪',
        viewsCount: 189,
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        creatorUsername: 'musclejock',
        creatorAvatar: '/boyfanz-logo.png',
      }],
      hasUnviewed: true,
    },
  ];

  // Stories query
  const { data: storiesData } = useInfiniteQuery({
    queryKey: ['/api/stories'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/stories', { credentials: 'include' });
        if (!response.ok) return mockStoryGroups;
        const result = await response.json() as StoryGroup[];
        return result.length > 0 ? result : mockStoryGroups;
      } catch (err) {
        return mockStoryGroups;
      }
    },
    getNextPageParam: () => undefined,
    initialPageParam: 1,
    enabled: !!user,
  });
  const storyGroups = storiesData?.pages[0] || mockStoryGroups;

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );

    if (loader.current) {
      observer.observe(loader.current);
    }

    return () => {
      if (loader.current) {
        observer.unobserve(loader.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const posts = data?.pages.flatMap(page => page.posts) ?? [];

  // Time ago helper
  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  // Render Post Card
  const renderPost = (post: Post, index: number) => {
    const canView = post.isFreeToView || post.isSubscribed;
    const hasMedia = post.mediaUrls && post.mediaUrls.length > 0;
    const totalReactions = post.reactions?.reduce((acc, r) => acc + r.count, 0) || post.likesCount;

    // Get platform info for cross-platform badge
    const postPlatform = post.platformSlug ? getPlatformConfig(post.platformSlug) : null;
    const showPlatformBadge = post.isCrossPlatform && postPlatform && postPlatform.slug !== currentPlatform.slug;

    return (
      <motion.div
        key={post.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all duration-300 overflow-hidden group">
          <CardContent className="p-0">
            {/* Creator Header */}
            <div className="p-4 flex items-center justify-between">
              <Link href={`/creator/${post.creatorId}`}>
                <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                  <div className="relative">
                    <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
                      <AvatarImage src={post.creatorAvatar || '/default-avatar.png'} />
                      <AvatarFallback className="bg-red-950 text-red-500">
                        {post.creatorName?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {post.isAgeVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {post.isLive && (
                      <div className="absolute -top-1 -right-1 bg-red-500 rounded-full px-1.5 py-0.5 animate-pulse">
                        <span className="text-[10px] font-bold text-white">LIVE</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white hover:text-red-400 transition-colors">
                        {post.creatorName}
                      </span>
                      {post.isAgeVerified && (
                        <Shield className="w-4 h-4 text-blue-400" />
                      )}
                      {showPlatformBadge && postPlatform && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge
                              className="text-[10px] px-1.5 py-0 h-4 font-bold border-0"
                              style={{
                                backgroundColor: postPlatform.primaryColor + '20',
                                color: postPlatform.primaryColor,
                              }}
                            >
                              {postPlatform.emoji} {postPlatform.name}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            Cross-posted from {postPlatform.name}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <span>@{post.creatorHandle}</span>
                      <span>•</span>
                      <span>{timeAgo(post.createdAt)}</span>
                      {showPlatformBadge && postPlatform && (
                        <>
                          <span>•</span>
                          <span className="text-xs" style={{ color: postPlatform.primaryColor }}>
                            via {postPlatform.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/90 border-red-900/30">
                  <DropdownMenuItem onClick={() => saveMutation.mutate(post.id)}>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Save Post
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400">
                    <X className="mr-2 h-4 w-4" />
                    Hide
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            {post.content && (
              <div className="px-4 pb-3">
                <p className="text-gray-100 whitespace-pre-wrap">{post.content}</p>
              </div>
            )}

            {/* Media */}
            {hasMedia && (
              <div className="relative bg-black/60 aspect-video">
                {canView ? (
                  <>
                    {post.type === 'video' ? (
                      <div className="relative w-full h-full">
                        <video
                          className="w-full h-full object-cover"
                          poster={post.thumbnailUrl || undefined}
                          controls
                        >
                          <source src={post.mediaUrls[0]} type="video/mp4" />
                        </video>
                        <div className="absolute top-4 right-4 bg-black/60 rounded-full p-2">
                          <Play className="w-5 h-5 text-red-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <OptimizedImage
                          src={post.mediaUrls[0]}
                          alt={post.title || 'Post media'}
                          className="w-full h-full object-cover"
                          objectFit="cover"
                        />
                        {post.mediaUrls.length > 1 && (
                          <div className="absolute top-4 right-4 bg-black/60 rounded-full px-2 py-1">
                            <span className="text-xs text-white">+{post.mediaUrls.length - 1}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/90 to-red-950/30 backdrop-blur-xl">
                    <Lock className="w-16 h-16 text-red-500 mb-4 animate-pulse" />
                    <p className="text-xl font-bold text-white mb-2">
                      {post.priceCents > 0
                        ? `Unlock for $${(post.priceCents / 100).toFixed(2)}`
                        : "Subscribe to View"}
                    </p>
                    <Link href={`/creator/${post.creatorId}`}>
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        {post.priceCents > 0 ? 'Unlock Now' : 'Subscribe'}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Poll */}
            {post.poll && (
              <div className="mx-4 my-3 p-4 rounded-xl bg-red-950/20 border border-red-900/30">
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-5 w-5 text-red-400" />
                  <span className="font-semibold text-white">{post.poll.question}</span>
                </div>
                <div className="space-y-2">
                  {post.poll.options.map((option) => {
                    const percentage = post.poll!.totalVotes > 0
                      ? Math.round((option.votes / post.poll!.totalVotes) * 100)
                      : 0;
                    const hasVoted = post.poll!.userVote !== undefined && post.poll!.userVote !== null;
                    const isSelected = post.poll!.userVote === option.index;

                    return (
                      <button
                        key={option.index}
                        onClick={() => !hasVoted && pollVoteMutation.mutate({ pollId: post.poll!.id, optionIndex: option.index })}
                        disabled={hasVoted}
                        className={cn(
                          "w-full relative overflow-hidden rounded-lg border p-3 transition-all text-left",
                          isSelected
                            ? 'border-red-500 bg-red-500/20'
                            : hasVoted
                              ? 'border-gray-700 bg-black/20'
                              : 'border-gray-700 bg-black/20 hover:border-red-500/50'
                        )}
                      >
                        {hasVoted && (
                          <div
                            className={cn("absolute inset-0", isSelected ? 'bg-red-500/20' : 'bg-gray-700/20')}
                            style={{ width: `${percentage}%` }}
                          />
                        )}
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {isSelected && <Check className="h-4 w-4 text-red-500" />}
                            <span className={cn("text-sm", isSelected && 'text-red-400 font-medium')}>
                              {option.text}
                            </span>
                          </div>
                          {hasVoted && <span className="text-sm text-gray-400">{percentage}%</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                  <span>{post.poll.totalVotes} votes</span>
                  {post.poll.endsAt && (
                    <span>{new Date(post.poll.endsAt) < new Date() ? 'Final results' : `Ends ${new Date(post.poll.endsAt).toLocaleDateString()}`}</span>
                  )}
                </div>
              </div>
            )}

            {/* Engagement Stats */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-t border-red-900/20">
              <div className="flex items-center gap-4">
                {totalReactions > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="flex -space-x-1">
                      {REACTIONS.slice(0, 3).map((r) => (
                        <span key={r.id} className="text-sm">{r.emoji}</span>
                      ))}
                    </div>
                    <span>{totalReactions.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span>{post.commentsCount} comments</span>
                <span>{post.repostsCount || 0} shares</span>
                <span>{post.viewsCount.toLocaleString()} views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-2 py-1 flex items-center justify-around border-t border-red-900/20">
              {/* Reaction Button with Picker */}
              <div className="relative">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1 text-gray-400 hover:text-red-400 hover:bg-red-950/20 px-2 h-8"
                      onMouseEnter={() => setActiveReactionPost(post.id)}
                      onClick={() => reactMutation.mutate({ postId: post.id, reactionType: 'fire' })}
                    >
                      <Flame className="h-4 w-4" />
                      <span className="hidden sm:inline text-xs font-medium">React</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>React to this post</TooltipContent>
                </Tooltip>

                {/* Reaction Picker */}
                <AnimatePresence>
                  {activeReactionPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 bg-black/95 border border-red-900/50 rounded-full px-2 py-1 flex gap-1 shadow-xl"
                      onMouseLeave={() => setActiveReactionPost(null)}
                    >
                      {REACTIONS.map((reaction) => (
                        <motion.button
                          key={reaction.id}
                          whileHover={{ scale: 1.3, y: -5 }}
                          onClick={() => reactMutation.mutate({ postId: post.id, reactionType: reaction.id })}
                          className="p-2 hover:bg-red-950/50 rounded-full transition-colors"
                          title={reaction.label}
                        >
                          <span className="text-2xl">{reaction.emoji}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Comment */}
              <Link href={`/post/${post.id}`}>
                <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-400 hover:text-blue-400 hover:bg-blue-950/20 px-2 h-8">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline text-xs font-medium">Comment</span>
                </Button>
              </Link>

              {/* Share/Repost */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1 text-gray-400 hover:text-green-400 hover:bg-green-950/20 px-2 h-8">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline text-xs font-medium">Share</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-black/95 border-red-900/50">
                  <DropdownMenuItem onClick={() => repostMutation.mutate(post.id)}>
                    <Repeat2 className="mr-2 h-4 w-4" />
                    Repost
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setQuoteDialogOpen(post.id)}>
                    <Quote className="mr-2 h-4 w-4" />
                    Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => {
                    navigator.share?.({ url: `${window.location.origin}/post/${post.id}` })
                      .catch(() => {
                        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
                        toast({ title: "Link copied!" });
                      });
                  }}>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Save */}
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "flex items-center gap-1 px-2 h-8",
                  post.isSaved ? "text-yellow-400" : "text-gray-400 hover:text-yellow-400 hover:bg-yellow-950/20"
                )}
                onClick={() => saveMutation.mutate(post.id)}
              >
                <Bookmark className={cn("h-4 w-4", post.isSaved && "fill-current")} />
                <span className="hidden sm:inline text-xs font-medium">Save</span>
              </Button>
            </div>

            {/* Quick Comment Input */}
            <div className="p-3 border-t border-red-900/20 flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-red-950 text-red-500 text-xs">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Link href={`/post/${post.id}`} className="flex-1">
                <div className="bg-red-950/30 rounded-full px-4 py-2 text-sm text-gray-400 hover:bg-red-950/50 transition-colors cursor-pointer">
                  Write a comment...
                </div>
              </Link>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Smile className="h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quote Dialog */}
        <Dialog open={quoteDialogOpen === post.id} onOpenChange={(open) => setQuoteDialogOpen(open ? post.id : null)}>
          <DialogContent className="bg-black/95 border-red-900/50">
            <DialogHeader>
              <DialogTitle className="text-red-400">Quote Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Add your thoughts..."
                value={quoteContent}
                onChange={(e) => setQuoteContent(e.target.value)}
                className="min-h-[100px] bg-red-950/20 border-red-900/30"
              />
              <div className="p-3 rounded-lg bg-red-950/10 border border-red-900/20">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={post.creatorAvatar} />
                  </Avatar>
                  <span className="text-sm text-gray-400">@{post.creatorHandle}</span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-2">{post.content || post.title}</p>
              </div>
              <Button
                className="w-full bg-red-600 hover:bg-red-700"
                onClick={() => quoteMutation.mutate({ postId: post.id, content: quoteContent })}
                disabled={!quoteContent.trim() || quoteMutation.isPending}
              >
                {quoteMutation.isPending ? 'Posting...' : 'Quote Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>
    );
  };

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Card className="bg-black/40 border-red-900/30 p-8 text-center max-w-md">
          <Lock className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view your feed</h2>
          <p className="text-gray-400 mb-6">Join the community to see content from creators you follow and subscribe to.</p>
          <div className="flex gap-4 justify-center">
            <Link href="/login">
              <Button variant="default" className="bg-red-600 hover:bg-red-700">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button variant="outline" className="border-red-900/50 text-red-500 hover:bg-red-950/30">
                Create Account
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <Card className="bg-black/40 border-red-500/50 p-8 text-center max-w-md">
          <p className="text-red-500 text-xl mb-4">Error loading feed</p>
          <p className="text-gray-400 mb-4">There was a problem loading your feed. This could be a temporary issue.</p>
          <Button
            variant="outline"
            className="border-red-900/50 text-red-500 hover:bg-red-950/30"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black relative">
      {/* Steam particles overlay */}
      <div className="steam-particles pointer-events-none" aria-hidden="true" />

      {/* Bathhouse steam pipes */}
      <BathhousePipes pipeCount={8} steamInterval={7000} />

      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Sidebar - Collapsible */}
          <aside className={cn(
            "hidden lg:block space-y-4 transition-all duration-300 ease-in-out",
            leftSidebarCollapsed ? "lg:col-span-1" : "lg:col-span-3"
          )} style={leftSidebarCollapsed ? { width: '80px', minWidth: '80px', maxWidth: '80px' } : {}}>
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30 sticky top-20 relative overflow-hidden">
              <CardContent className={cn(
                "space-y-1 relative transition-all duration-300",
                leftSidebarCollapsed ? "p-2 overflow-hidden" : "p-4"
              )}>
                {/* Collapse Toggle */}
                <button
                  onClick={() => setLeftSidebarCollapsed(!leftSidebarCollapsed)}
                  className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors z-10"
                  title={leftSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {leftSidebarCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronLeft className="h-4 w-4" />
                  )}
                </button>
                {/* User Profile Quick Access */}
                {!leftSidebarCollapsed && (
                  <Link href={`/creator/${user?.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <Avatar className="h-10 w-10 ring-2 ring-gray-600/30">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-white">{user?.firstName || user?.username}</p>
                        <p className="text-xs text-gray-400">View your profile</p>
                      </div>
                    </div>
                  </Link>
                )}

                {leftSidebarCollapsed && (
                  <Link href={`/creator/${user?.id}`}>
                    <div className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-700/30 transition-colors cursor-pointer">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="bg-gray-700 text-white text-xs">
                          {user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </Link>
                )}

                <Separator className="my-2 bg-red-900/30" />

                {/* Quick Navigation - Facebook Style */}
                <nav className="space-y-1">
                  {[
                    { icon: Home, label: 'Feed', href: '/', active: location === '/' },
                    { icon: Users, label: 'Fuck Buddies', href: '/fuck-buddies' },
                    { icon: Tv, label: 'Live Shows', href: '/streams', badge: liveStreams.length || null },
                    { icon: MessageSquare, label: 'Messages', href: '/messages' },
                    { icon: Bell, label: 'Notifications', href: '/notifications' },
                    { icon: Bookmark, label: 'Saved', href: '/saved' },
                    { icon: Calendar, label: 'Events', href: '/events' },
                    { icon: ShoppingBag, label: 'Marketplace', href: '/marketplace' },
                    { icon: Users, label: 'Groups', href: '/groups' },
                  ].map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={cn(
                            "flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer relative",
                            item.active
                              ? "bg-blue-600/20 text-blue-400"
                              : "text-gray-300 hover:bg-gray-700/30 hover:text-white",
                            leftSidebarCollapsed && "justify-center"
                          )}>
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!leftSidebarCollapsed && (
                              <>
                                <span className="font-medium text-sm">{item.label}</span>
                                {item.badge && (
                                  <Badge className="ml-auto bg-red-600 text-white text-xs">
                                    {item.badge}
                                  </Badge>
                                )}
                              </>
                            )}
                            {leftSidebarCollapsed && item.badge && (
                              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                                {item.badge}
                              </div>
                            )}
                          </div>
                        </TooltipTrigger>
                        {leftSidebarCollapsed && (
                          <TooltipContent side="right">
                            {item.label}
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </Link>
                  ))}
                </nav>

                {!leftSidebarCollapsed && (
                  <>
                    <Separator className="my-3 bg-gray-700/30" />

                    {/* Shortcuts */}
                    <div className="px-3">
                      <p className="text-xs text-gray-500 font-semibold mb-2">Your Shortcuts</p>
                      <nav className="space-y-1">
                        {[
                          { icon: Flame, label: 'Trending Now', color: 'text-orange-400' },
                          { icon: Star, label: 'Top Creators', color: 'text-yellow-400' },
                          { icon: Crown, label: 'VIP Access', color: 'text-purple-400' },
                          { icon: Heart, label: 'Favorites', color: 'text-pink-400' },
                        ].map((item) => (
                          <button
                            key={item.label}
                            className="w-full flex items-center gap-3 p-2 rounded-lg text-gray-300 hover:bg-gray-700/30 hover:text-white transition-colors"
                          >
                            <item.icon className={cn("h-4 w-4", item.color)} />
                            <span className="text-sm">{item.label}</span>
                          </button>
                        ))}
                      </nav>
                    </div>

                    <Separator className="my-3 bg-gray-700/30" />

                    {/* Fuck Buddies Section */}
                    <div className="px-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-gray-500 font-semibold">Fuck Buddies</p>
                        <Link href="/fuck-buddies">
                          <Badge variant="secondary" className="text-[10px] cursor-pointer hover:bg-gray-700">
                            View All
                          </Badge>
                        </Link>
                      </div>

                      {/* Top 8 Display - First 4 */}
                      {topEightBuddies.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {topEightBuddies.slice(0, 4).map((buddy: any, index: number) => (
                            <Link key={buddy.id} href={`/creator/${buddy.buddy?.id}`}>
                              <div className="relative">
                                <Avatar className="h-12 w-12 ring-2 ring-blue-500/30 cursor-pointer hover:ring-blue-500 transition-all">
                                  <AvatarImage src={buddy.buddy?.profileImageUrl} />
                                  <AvatarFallback className="bg-gray-700 text-xs">
                                    {buddy.buddy?.username?.[0]?.toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[8px] bg-blue-600">
                                  {buddy.topEightPosition || index + 1}
                                </Badge>
                              </div>
                            </Link>
                          ))}
                          {/* Fill empty slots */}
                          {topEightBuddies.length < 4 && Array.from({ length: 4 - topEightBuddies.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="relative">
                              <Avatar className="h-12 w-12 ring-2 ring-gray-700/30 cursor-pointer opacity-30">
                                <AvatarFallback className="bg-gray-800 text-xs">+</AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Buddy Requests */}
                      {buddyRequests && buddyRequests.received?.length > 0 && (
                        <Link href="/fuck-buddies/requests">
                          <div className="flex items-center gap-3 p-2 rounded-lg bg-red-900/20 hover:bg-red-900/30 transition-colors cursor-pointer">
                            <Users className="h-4 w-4 text-red-400" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">Friend Requests</p>
                              <p className="text-xs text-gray-400">{buddyRequests.received.length} pending</p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </div>
                        </Link>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Main Feed */}
          <main className={cn(
            "space-y-4 transition-all duration-300",
            leftSidebarCollapsed ? "lg:col-span-8" : "lg:col-span-6"
          )}>
            {/* Stories Section - SHOWER ROOM */}
            <Card className="zone-shower-room bg-black/40 backdrop-blur-xl border-red-900/30 overflow-hidden relative">
              <CardContent className="p-4">
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-red-900/50">
                  {/* Create Story */}
                  <button className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="relative w-16 h-16">
                      <Avatar className="w-16 h-16 ring-2 ring-gray-700">
                        <AvatarImage src={user?.profileImageUrl} />
                        <AvatarFallback className="bg-red-950 text-red-500">
                          {user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-black">
                        <Plus className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Flash 'Em</span>
                  </button>

                  {/* Story Groups */}
                  {storyGroups.map((group) => (
                    <button
                      key={group.creatorId}
                      onClick={() => {
                        setViewingStory({ group, index: 0 });
                        viewStoryMutation.mutate(group.stories[0].id);
                      }}
                      className="flex-shrink-0 flex flex-col items-center gap-2 group"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-full p-0.5",
                        group.hasUnviewed
                          ? "bg-gradient-to-tr from-red-500 via-orange-500 to-yellow-500"
                          : "bg-gray-600"
                      )}>
                        <Avatar className="w-full h-full ring-2 ring-black">
                          <AvatarImage src={group.creatorAvatar || '/default-avatar.png'} />
                          <AvatarFallback className="bg-red-950 text-red-500">
                            {group.creatorUsername?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors truncate max-w-[70px]">
                        @{group.creatorUsername}
                      </span>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Post Card */}
            <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-red-950 text-red-500">
                      {user?.username?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => setCreatePostOpen(true)}
                    className="flex-1 bg-red-950/30 rounded-full px-6 py-3 text-left text-gray-400 hover:bg-red-950/50 transition-colors"
                  >
                    Show off, {user?.firstName || 'Stud'}... 🔥
                  </button>
                </div>

                <Separator className="my-4 bg-red-900/30" />

                <div className="flex items-center justify-around">
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-red-400 hover:bg-red-950/30">
                    <Video className="h-5 w-5 text-red-500" />
                    <span className="hidden sm:inline">🔴 Go Live</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-green-400 hover:bg-green-950/30">
                    <ImageIcon className="h-5 w-5 text-green-500" />
                    <span className="hidden sm:inline">📸 Tease</span>
                  </Button>
                  <Button variant="ghost" className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-950/30">
                    <Smile className="h-5 w-5 text-yellow-500" />
                    <span className="hidden sm:inline">😈 Mood</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Feed Filter Tabs - Compact Facebook Style */}
            <div className="flex items-center gap-0.5 bg-black/40 backdrop-blur-xl border border-gray-700/30 rounded-lg p-0.5">
              {[
                { id: 'all', label: 'For You', icon: Home },
                { id: 'following', label: 'Following', icon: Users },
                { id: 'buddies', label: 'Buddies', icon: Heart },
                { id: 'trending', label: 'Trending', icon: TrendingUp },
                { id: 'crossplatform', label: 'All Platforms', icon: Globe },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFeedFilter(filter.id as any)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded-md transition-all text-xs font-semibold whitespace-nowrap",
                    feedFilter === filter.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-400 hover:text-white hover:bg-gray-700/40"
                  )}
                >
                  <filter.icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{filter.label}</span>
                </button>
              ))}
            </div>

            {/* Live Streams Banner */}
            {liveStreams.length > 0 && (
              <Card className="bg-gradient-to-r from-red-900/40 to-orange-900/40 backdrop-blur-xl border-red-500/50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-semibold text-white">Live Now</span>
                    <Badge className="bg-red-600 text-white">{liveStreams.length}</Badge>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {liveStreams.slice(0, 4).map((stream) => (
                      <Link key={stream.id} href={`/streams/${stream.id}/watch`}>
                        <div className="flex-shrink-0 relative w-32 h-20 rounded-lg overflow-hidden group cursor-pointer">
                          <img
                            src={stream.thumbnailUrl || '/default-stream-thumb.jpg'}
                            alt={stream.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                          <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/60 rounded px-1.5 py-0.5">
                            <Eye className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-white">{stream.viewerCount}</span>
                          </div>
                          <div className="absolute top-1 left-1 bg-red-600 rounded px-1.5 py-0.5">
                            <span className="text-[10px] font-bold text-white">LIVE</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts with Ads */}
            <div className="space-y-4">
              {posts.map((post, index) => (
                <div key={`post-${post.id}`}>
                  {renderPost(post, index)}
                  {/* Insert ad after every 4th post */}
                  {(index + 1) % POSTS_PER_AD === 0 && (
                    <FeedAd key={`ad-${index}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Loading Indicator */}
            <div ref={loader} className="flex justify-center py-8">
              {(isLoading || isFetchingNextPage) && (
                <div className="flex items-center gap-3 text-red-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>{isLoading ? 'Loading feed...' : 'Loading more...'}</span>
                </div>
              )}
              {!hasNextPage && posts.length > 0 && !isLoading && (
                <p className="text-gray-500">You've reached the end of the feed</p>
              )}
            </div>

            {/* Empty State */}
            {!isLoading && posts.length === 0 && (
              <Card className="bg-black/40 border-red-900/30 p-12 text-center">
                <Flame className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl text-white mb-4">No Posts Yet</h3>
                <p className="text-gray-400 mb-6">
                  Start following creators to see their content in your feed
                </p>
                <Link href="/search">
                  <Button className="bg-red-600 hover:bg-red-700">
                    Discover Creators
                  </Button>
                </Link>
              </Card>
            )}
          </main>

          {/* Right Sidebar - POOL ZONE (Hot Tub Area) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            {/* Trending Topics */}
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30 sticky top-20 relative overflow-hidden">
              <CardContent className="p-4 relative z-10">
                <h3 className="font-bold text-white mb-3 text-base">
                  Trending
                </h3>
                <div className="space-y-2">
                  {(trendingTopics.length > 0 ? trendingTopics : [
                    { id: '1', tag: 'NightLife', postCount: 2500, category: 'Entertainment' },
                    { id: '2', tag: 'ExclusiveContent', postCount: 1800, category: 'Creators' },
                    { id: '3', tag: 'LiveTonight', postCount: 1200, category: 'Events' },
                    { id: '4', tag: 'NewCreator', postCount: 950, category: 'Community' },
                    { id: '5', tag: 'WeekendVibes', postCount: 800, category: 'Lifestyle' },
                  ]).slice(0, 5).map((topic, idx) => (
                    <div key={topic.id} className="group cursor-pointer p-2 hover:bg-gray-700/30 rounded-lg transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-normal">
                            {idx + 1} · {topic.category} · Trending
                          </p>
                          <p className="font-semibold text-white text-sm">
                            #{topic.tag}
                          </p>
                          <p className="text-xs text-gray-500">{topic.postCount.toLocaleString()} posts</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-500 hover:text-white hover:bg-gray-600/30">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* People You May Know - Fuck Buddies */}
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30 relative overflow-hidden">
              <CardContent className="p-4 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white text-base">
                    People You May Know
                  </h3>
                </div>
                <div className="space-y-3">
                  {(suggestedCreators.length > 0 ? suggestedCreators : [
                    { id: '1', username: 'nightowl', displayName: 'Night Owl', avatar: '', isVerified: true, subscriberCount: 15000, category: 'Entertainment' },
                    { id: '2', username: 'midnight_star', displayName: 'Midnight Star', avatar: '', isVerified: true, subscriberCount: 12000, category: 'Lifestyle' },
                    { id: '3', username: 'velvet_dreams', displayName: 'Velvet Dreams', avatar: '', isVerified: false, subscriberCount: 8500, category: 'Art' },
                  ]).slice(0, 5).map((creator) => (
                    <div key={creator.id} className="flex items-start gap-3">
                      <Link href={`/creator/${creator.id}`}>
                        <Avatar className="h-12 w-12 cursor-pointer hover:opacity-80 transition-opacity">
                          <AvatarImage src={creator.avatar} />
                          <AvatarFallback className="bg-gray-700 text-white">
                            {creator.displayName?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/creator/${creator.id}`}>
                          <div className="flex items-center gap-1 cursor-pointer">
                            <span className="font-semibold text-white hover:underline text-sm truncate">
                              {creator.displayName}
                            </span>
                            {creator.isVerified && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                            )}
                          </div>
                        </Link>
                        <p className="text-xs text-gray-400 truncate">
                          {Math.floor(Math.random() * 10) + 1} mutual friends
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 h-7 rounded-md flex-1">
                            Add Friend
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700/50 text-xs font-semibold px-4 h-7 rounded-md">
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Starz Profile Banner Ad */}
            <Link href="/auth/starz-signup">
              <Card className="bg-black/40 backdrop-blur-xl border-yellow-500/50 relative overflow-hidden cursor-pointer group hover:border-yellow-400 transition-all">
                {/* Background Banner Image */}
                <div className="h-32 relative overflow-hidden">
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-yellow-600 via-amber-500 to-orange-600"
                    style={{
                      backgroundImage: user?.bannerImageUrl ? `url(${user.bannerImageUrl})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  {/* Starz Badge */}
                  <div className="absolute top-3 right-3 bg-yellow-500 text-black px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="h-3 w-3 fill-black" />
                    <span className="text-xs font-bold">STARZ</span>
                  </div>
                </div>

                <CardContent className="p-4 -mt-10 relative z-10">
                  {/* Round Profile Pic */}
                  <div className="flex justify-center mb-3">
                    <Avatar className="h-20 w-20 ring-4 ring-yellow-500 border-4 border-black">
                      <AvatarImage src={user?.profileImageUrl} />
                      <AvatarFallback className="bg-yellow-600 text-black text-2xl font-bold">
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="font-bold text-white text-lg">
                      Become a Starz
                    </h3>
                    <p className="text-sm text-gray-300">
                      Join the elite. Get discovered. Earn more.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-yellow-400 text-xs">
                      <Crown className="h-4 w-4" />
                      <span className="font-semibold">Premium Profile Features</span>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-bold mt-3 group-hover:scale-105 transition-transform">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Explore Other Platforms */}
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30 relative overflow-hidden">
              <CardContent className="p-4 relative z-10">
                <h3 className="font-bold text-white mb-3 text-base">
                  Explore FANZ Network
                </h3>
                <div className="space-y-2">
                  {Object.values(FANZ_PLATFORMS)
                    .filter(p => p.slug !== currentPlatform.slug)
                    .slice(0, 6)
                    .map((platform) => (
                      <a
                        key={platform.id}
                        href={`https://${platform.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/30 transition-colors group"
                      >
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xl font-bold"
                          style={{
                            backgroundColor: platform.primaryColor + '20',
                            color: platform.primaryColor,
                          }}
                        >
                          {platform.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white text-sm group-hover:underline truncate">
                            {platform.name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {platform.tagline}
                          </p>
                        </div>
                        <Globe className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                </div>
                <button className="w-full mt-3 text-xs text-blue-400 hover:text-blue-300 font-semibold py-2">
                  View All {Object.keys(FANZ_PLATFORMS).length} Platforms →
                </button>
              </CardContent>
            </Card>

            {/* Upcoming Events - Hook Ups */}
            <Card className="bg-black/40 backdrop-blur-xl border-gray-700/30 relative overflow-hidden">
              <CardContent className="p-4 relative z-10">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-400" />
                  🌙 Hook Ups Tonight
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30">
                    <p className="text-xs text-purple-300">Tonight at 10 PM</p>
                    <p className="font-medium text-white">Late Night Live Show</p>
                    <p className="text-xs text-gray-400 mt-1">24 going</p>
                  </div>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30">
                    <p className="text-xs text-red-300">Saturday 9 PM</p>
                    <p className="font-medium text-white">VIP Members Party</p>
                    <p className="text-xs text-gray-400 mt-1">156 interested</p>
                  </div>
                </div>
                <Link href="/events">
                  <Button variant="ghost" className="w-full mt-4 text-purple-400 hover:text-purple-300 hover:bg-purple-950/30">
                    View All Events
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="text-xs text-gray-500 space-y-2 px-4">
              <div className="flex flex-wrap gap-2">
                <Link href="/terms"><span className="hover:text-gray-300 cursor-pointer">Terms</span></Link>
                <span>•</span>
                <Link href="/privacy"><span className="hover:text-gray-300 cursor-pointer">Privacy</span></Link>
                <span>•</span>
                <Link href="/safety"><span className="hover:text-gray-300 cursor-pointer">Safety</span></Link>
                <span>•</span>
                <Link href="/help"><span className="hover:text-gray-300 cursor-pointer">Help</span></Link>
              </div>
              <p>© 2025 BoyFanz. Every Man's Playground.</p>
            </div>
          </aside>
        </div>
      </div>

      {/* Story Viewer Modal */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          >
            <button
              onClick={() => setViewingStory(null)}
              className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={() => {
                if (viewingStory.index > 0) {
                  const newIndex = viewingStory.index - 1;
                  setViewingStory({ ...viewingStory, index: newIndex });
                  viewStoryMutation.mutate(viewingStory.group.stories[newIndex].id);
                }
              }}
              disabled={viewingStory.index === 0}
              className="absolute left-4 text-white hover:text-red-400 transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <button
              onClick={() => {
                if (viewingStory.index < viewingStory.group.stories.length - 1) {
                  const newIndex = viewingStory.index + 1;
                  setViewingStory({ ...viewingStory, index: newIndex });
                  viewStoryMutation.mutate(viewingStory.group.stories[newIndex].id);
                } else {
                  setViewingStory(null);
                }
              }}
              className="absolute right-4 text-white hover:text-red-400 transition-colors"
            >
              <ChevronRight className="w-10 h-10" />
            </button>

            <div className="relative max-w-lg w-full mx-4">
              {/* Progress bars */}
              <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 z-10">
                {viewingStory.group.stories.map((_, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      idx <= viewingStory.index ? 'bg-red-500' : 'bg-white/30'
                    )}
                  />
                ))}
              </div>

              {/* Creator info */}
              <div className="absolute top-6 left-4 flex items-center gap-2 z-10">
                <Avatar className="h-10 w-10 ring-2 ring-red-500">
                  <AvatarImage src={viewingStory.group.creatorAvatar || '/default-avatar.png'} />
                  <AvatarFallback className="bg-red-950 text-red-500">
                    {viewingStory.group.creatorUsername?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">@{viewingStory.group.creatorUsername}</p>
                  <p className="text-xs text-white/60">
                    {timeAgo(viewingStory.group.stories[viewingStory.index].createdAt)}
                  </p>
                </div>
              </div>

              {/* Story media */}
              <div className="aspect-[9/16] bg-black rounded-lg overflow-hidden">
                {viewingStory.group.stories[viewingStory.index].type === 'video' ? (
                  <video
                    src={viewingStory.group.stories[viewingStory.index].mediaUrl}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    onEnded={() => {
                      if (viewingStory.index < viewingStory.group.stories.length - 1) {
                        const newIndex = viewingStory.index + 1;
                        setViewingStory({ ...viewingStory, index: newIndex });
                        viewStoryMutation.mutate(viewingStory.group.stories[newIndex].id);
                      } else {
                        setViewingStory(null);
                      }
                    }}
                  />
                ) : (
                  <OptimizedImage
                    src={viewingStory.group.stories[viewingStory.index].mediaUrl}
                    alt="Story media"
                    className="w-full h-full object-cover"
                    objectFit="cover"
                    priority={true}
                  />
                )}

                {viewingStory.group.stories[viewingStory.index].text && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-white text-center">
                      {viewingStory.group.stories[viewingStory.index].text}
                    </p>
                  </div>
                )}
              </div>

              <div className="absolute bottom-4 right-4 text-white/60 text-sm z-10">
                {viewingStory.group.stories[viewingStory.index].viewsCount} views
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Post Dialog */}
      <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
        <DialogContent className="bg-black/95 border-red-900/50 max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-white text-center pb-2 border-b border-red-900/30">
              Create Post
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-red-950 text-red-500">
                  {user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white">{user?.firstName || user?.username}</p>
                <Button variant="ghost" size="sm" className="text-xs text-gray-400 h-auto p-1">
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </Button>
              </div>
            </div>

            <Textarea
              placeholder={`What's on your mind, ${user?.firstName || 'Star'}?`}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              className="min-h-[150px] bg-transparent border-none text-lg text-white placeholder:text-gray-500 resize-none focus-visible:ring-0"
            />

            <div className="flex items-center justify-between p-3 rounded-lg border border-red-900/30">
              <span className="text-sm text-gray-400">Add to your post</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-green-500 hover:bg-green-950/30">
                  <ImageIcon className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-blue-500 hover:bg-blue-950/30">
                  <Tag className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-yellow-500 hover:bg-yellow-950/30">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-950/30">
                  <MapPin className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={() => createPostMutation.mutate(postContent)}
              disabled={!postContent.trim() || createPostMutation.isPending}
            >
              {createPostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
