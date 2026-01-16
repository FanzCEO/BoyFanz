// @ts-nocheck
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Heart, MessageCircle, Star, Users, DollarSign, Camera, Video, Calendar,
  Shield, ExternalLink, Share2, Globe, UserCheck, Grid3X3, Infinity, Lock,
  MapPin, Link as LinkIcon, Briefcase, GraduationCap, Clock, Eye, Crown,
  Gift, Flame, Sparkles, UserPlus, MoreHorizontal, Edit3, Settings, Image,
  Play, Bookmark, TrendingUp, Zap, CheckCircle2, Ban, Flag, Bell, BellOff,
  Send, Music, Instagram, Twitter, Youtube, X, ChevronDown, ChevronRight,
  Plus, ThumbsUp, Award, Verified, Facebook, ShoppingBag, Link2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { ProfileQRCode } from '@/components/profile/ProfileQRCode';
import { ProfileCustomizer } from '@/components/profile/ProfileCustomizer';
import { SidebarAdStack } from '@/components/ads/AdBanner';
import { OptimizedImage } from '@/components/ui/OptimizedImage';

interface CreatorProfile {
  userId: string;
  monthlyPriceCents: number;
  isVerified: boolean;
  verificationBadge: string;
  coverImageUrl?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedDate?: string;
  welcomeMessageEnabled: boolean;
  welcomeMessageText?: string;
  welcomeMessagePriceCents: number;
  categories: string[];
  totalEarningsCents: number;
  totalSubscribers: number;
  totalPosts: number;
  totalMedia: number;
  totalLikes: number;
  isOnline: boolean;
  lastActiveAt: string;
  isSubscribed?: boolean;
  isFollowing?: boolean;
  mutualFriends?: number;
  showEmailOnProfile?: boolean;
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
    onlyfans?: string;
    amazon?: string; // Amazon Gift Registry
    fanzlink?: string; // FanzLink bio platform
  };
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    email?: string;
  };
  featuredContent?: Post[];
}

interface Post {
  id: string;
  type: string;
  title?: string;
  content?: string;
  visibility: string;
  priceCents: number;
  thumbnailUrl?: string;
  mediaUrls?: string[];
  likesCount: number;
  commentsCount: number;
  viewsCount: number;
  createdAt: string;
  isPinned?: boolean;
}

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string;
  createdAt: string;
  likesCount: number;
}

export default function CreatorProfile() {
  const [, params] = useRoute('/creator/:userId');
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = params?.userId;
  const [activeTab, setActiveTab] = useState('posts');
  const [showFullBio, setShowFullBio] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [coverPhotoHover, setCoverPhotoHover] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const { data: creator, isLoading } = useQuery<CreatorProfile>({
    queryKey: ['/api/creator-profiles', userId],
    enabled: !!userId,
  });

  // Creator Pro Status
  const { data: creatorProStatus } = useQuery<{
    currentTier: string;
    totalScore: number;
    tierProgress: number;
    achievements: Array<{ id: string; name: string; tier: string }>;
  }>({
    queryKey: ['/api/creator-pro/status', userId],
    enabled: !!userId,
  });

  // Tier configuration for display
  const TIER_CONFIG: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
    rising: { color: 'text-gray-400', bgColor: 'bg-gray-900/30', icon: TrendingUp, label: 'Rising' },
    established: { color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', icon: CheckCircle2, label: 'Established' },
    pro: { color: 'text-blue-400', bgColor: 'bg-blue-900/30', icon: Star, label: 'Pro' },
    elite: { color: 'text-purple-400', bgColor: 'bg-purple-900/30', icon: Crown, label: 'Elite' },
    legend: { color: 'text-amber-400', bgColor: 'bg-amber-900/30', icon: Award, label: 'Legend' },
  };

  // My Feed - creator's own posts
  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts/creator', userId],
    enabled: !!userId,
  });

  // Photos
  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: ['/api/photos/creator', userId],
    enabled: !!userId && activeTab === 'photos',
  });

  // Videos
  const { data: videos = [] } = useQuery<Post[]>({
    queryKey: ['/api/videos/creator', userId],
    enabled: !!userId && activeTab === 'videos',
  });

  // Mutations
  const subscribeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ creatorId: userId }),
      });
      if (!res.ok) throw new Error('Failed to subscribe');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Subscribed!", description: `You're now subscribed to ${creator?.user?.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/creator-profiles', userId] });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to follow');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Following!", description: `You're now following ${creator?.user?.username}` });
      queryClient.invalidateQueries({ queryKey: ['/api/creator-profiles', userId] });
    },
  });

  const tipMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await fetch(`/api/tips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ creatorId: userId, amountCents: amount * 100 }),
      });
      if (!res.ok) throw new Error('Failed to send tip');
      return res.json();
    },
    onSuccess: (_, amount) => {
      toast({ title: "Tip Sent!", description: `You sent $${amount} to ${creator?.user?.username}` });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ recipientId: userId, content }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Message Sent!" });
      setMessageDialogOpen(false);
      setMessageContent('');
    },
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black flex items-center justify-center">
        <Card className="w-96 bg-black/40 border-red-900/30">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Creator Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              This creator profile doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/search">
              <Button className="bg-red-600 hover:bg-red-700">
                Discover Creators
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pinnedPosts = posts.filter(p => p.isPinned);
  const regularPosts = posts.filter(p => !p.isPinned);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-red-950/10 to-black">
      {/* Cover Photo Section */}
      <div
        className="relative h-[350px] md:h-[400px] w-full overflow-hidden"
        onMouseEnter={() => setCoverPhotoHover(true)}
        onMouseLeave={() => setCoverPhotoHover(false)}
      >
        {/* Cover Image */}
        <div className="absolute inset-0">
          {creator.coverImageUrl ? (
            <OptimizedImage
              src={creator.coverImageUrl}
              alt="Cover"
              className="w-full h-full object-cover"
              objectFit="cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-900/60 via-black to-purple-900/40" />
          )}
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Edit Cover Button (for owner) */}
        {isOwnProfile && (
          <AnimatePresence>
            {coverPhotoHover && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4"
              >
                <Button className="bg-black/60 hover:bg-black/80 text-white">
                  <Camera className="h-4 w-4 mr-2" />
                  Edit Cover Photo
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* Live Indicator */}
        {creator.isOnline && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 rounded-full px-3 py-1 animate-pulse">
            <div className="w-2 h-2 bg-white rounded-full" />
            <span className="text-sm font-semibold text-white">LIVE NOW</span>
          </div>
        )}
      </div>

      {/* Profile Info Section */}
      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="relative group">
              <Avatar className="w-40 h-40 md:w-48 md:h-48 ring-4 ring-black border-4 border-red-500/50">
                <AvatarImage src={creator.user?.profileImageUrl || creator.profileImageUrl} />
                <AvatarFallback className="bg-red-950 text-red-500 text-4xl">
                  {creator.user?.username?.[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>

              {creator.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2 border-4 border-black">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
              )}

              {creator.isOnline && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-black" />
              )}

              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-4 md:pt-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                {/* Name & Username */}
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {creator.user?.firstName && creator.user?.lastName
                      ? `${creator.user.firstName} ${creator.user.lastName}`
                      : creator.user?.username || 'Creator'}
                  </h1>
                  {creator.isVerified && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>2257 Age Verified Creator</TooltipContent>
                    </Tooltip>
                  )}
                  {/* Creator Pro Tier Badge */}
                  {creatorProStatus && creatorProStatus.currentTier !== 'rising' && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link href={isOwnProfile ? "/creator-pro" : undefined}>
                          <Badge className={`${TIER_CONFIG[creatorProStatus.currentTier]?.bgColor || 'bg-gray-900/30'} ${TIER_CONFIG[creatorProStatus.currentTier]?.color || 'text-gray-400'} border border-current/30 cursor-pointer hover:opacity-80 transition-opacity`}>
                            {(() => {
                              const TierIcon = TIER_CONFIG[creatorProStatus.currentTier]?.icon || Star;
                              return <TierIcon className="h-3 w-3 mr-1" />;
                            })()}
                            {TIER_CONFIG[creatorProStatus.currentTier]?.label || 'Creator'}
                          </Badge>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <div className="font-semibold">Creator Pro: {TIER_CONFIG[creatorProStatus.currentTier]?.label}</div>
                          <div className="text-xs text-muted-foreground">{creatorProStatus.totalScore} points</div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>

                <p className="text-xl text-gray-400 mb-3">@{creator.user?.username}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users className="h-4 w-4 text-red-400" />
                    <span className="font-semibold text-white">{formatNumber(creator.totalSubscribers)}</span>
                    <span className="text-gray-400">subscribers</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Grid3X3 className="h-4 w-4 text-purple-400" />
                    <span className="font-semibold text-white">{formatNumber(creator.totalPosts || posts.length)}</span>
                    <span className="text-gray-400">posts</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <span className="font-semibold text-white">{formatNumber(creator.totalLikes || 0)}</span>
                    <span className="text-gray-400">likes</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {isOwnProfile ? (
                  <>
                    <Link href="/settings">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </Link>
                    <Link href="/breeding-zone">
                      <Button variant="outline" className="border-red-500/30 text-white hover:bg-red-950/30">
                        <Crown className="h-4 w-4 mr-2" />
                        Starz Studio
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    {!creator.isSubscribed ? (
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white px-8"
                        onClick={() => subscribeMutation.mutate()}
                        disabled={subscribeMutation.isPending}
                      >
                        <Crown className="h-4 w-4 mr-2" />
                        Subscribe {formatCurrency(creator.monthlyPriceCents)}/mo
                      </Button>
                    ) : (
                      <Button className="bg-green-600/20 text-green-400 border border-green-500/30">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Subscribed
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className={cn(
                        "border-red-500/30",
                        creator.isFollowing ? "bg-red-600/20 text-red-400" : "text-white hover:bg-red-950/30"
                      )}
                      onClick={() => followMutation.mutate()}
                    >
                      {creator.isFollowing ? (
                        <>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Following
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      className="border-red-500/30 text-white hover:bg-red-950/30"
                      onClick={() => setMessageDialogOpen(true)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Message
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon" className="border-red-500/30 text-white hover:bg-red-950/30">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/95 border-red-900/50">
                        <DropdownMenuItem>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          Turn on Notifications
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-red-900/30" />
                        <DropdownMenuItem>
                          <Ban className="mr-2 h-4 w-4" />
                          Block
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400">
                          <Flag className="mr-2 h-4 w-4" />
                          Report
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Intro & About */}
          <aside className="lg:col-span-4 space-y-4">
            {/* Intro Card */}
            <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-yellow-400" />
                  Intro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bio */}
                {creator.bio && (
                  <div>
                    <p className={cn(
                      "text-gray-300",
                      !showFullBio && creator.bio.length > 150 && "line-clamp-3"
                    )}>
                      {creator.bio}
                    </p>
                    {creator.bio.length > 150 && (
                      <button
                        onClick={() => setShowFullBio(!showFullBio)}
                        className="text-red-400 text-sm mt-1 hover:text-red-300"
                      >
                        {showFullBio ? 'Show less' : 'See more'}
                      </button>
                    )}
                  </div>
                )}

                {/* Quick Info */}
                <div className="space-y-3">
                  {creator.location && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <MapPin className="h-5 w-5 text-red-400" />
                      <span>{creator.location}</span>
                    </div>
                  )}

                  {creator.website && (
                    <div className="flex items-center gap-3 text-gray-400">
                      <LinkIcon className="h-5 w-5 text-blue-400" />
                      <a href={creator.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline truncate">
                        {creator.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}

                  <div className="flex items-center gap-3 text-gray-400">
                    <Calendar className="h-5 w-5 text-purple-400" />
                    <span>Joined {new Date(creator.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <Eye className="h-5 w-5 text-green-400" />
                    <span>
                      {creator.isOnline ? (
                        <span className="text-green-400">Online now</span>
                      ) : (
                        `Last active ${timeAgo(creator.lastActiveAt)}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Categories */}
                {creator.categories?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {creator.categories.map((category, idx) => (
                      <Badge key={idx} variant="outline" className="bg-red-950/30 border-red-500/30 text-red-400">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Social Links */}
                {creator.socialLinks && Object.keys(creator.socialLinks).some(k => creator.socialLinks[k]) && (
                  <div className="pt-2 border-t border-red-900/30">
                    <p className="text-sm text-gray-500 mb-3">Social Links</p>
                    <div className="flex gap-3">
                      {creator.socialLinks.instagram && (
                        <a href={`https://instagram.com/${creator.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-pink-500/30 text-pink-400 hover:bg-pink-950/30">
                            <Instagram className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.socialLinks.twitter && (
                        <a href={`https://twitter.com/${creator.socialLinks.twitter}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-blue-500/30 text-blue-400 hover:bg-blue-950/30">
                            <Twitter className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.socialLinks.youtube && (
                        <a href={creator.socialLinks.youtube} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-red-500/30 text-red-400 hover:bg-red-950/30">
                            <Youtube className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.socialLinks.facebook && (
                        <a href={`https://facebook.com/${creator.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-blue-600/30 text-blue-500 hover:bg-blue-950/30">
                            <Facebook className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.socialLinks.amazon && (
                        <a href={creator.socialLinks.amazon} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-amber-500/30 text-amber-400 hover:bg-amber-950/30" title="Amazon Gift Registry">
                            <ShoppingBag className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.socialLinks.fanzlink && (
                        <a href={creator.socialLinks.fanzlink} target="_blank" rel="noopener noreferrer">
                          <Button variant="outline" size="icon" className="border-slate-500/30 text-slate-400 hover:bg-cyan-950/30" title="FanzLink Bio">
                            <Link2 className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                      {creator.showEmailOnProfile && creator.user?.email && (
                        <a href={`mailto:${creator.user.email}`}>
                          <Button variant="outline" size="icon" className="border-purple-500/30 text-purple-400 hover:bg-purple-950/30" title={`Contact via Email: ${creator.user.email}`}>
                            <Mail className="h-5 w-5" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {isOwnProfile && (
                  <Button variant="outline" className="w-full border-red-500/30 text-white hover:bg-red-950/30">
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Photos Preview */}
            <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Image className="h-5 w-5 text-green-400" />
                    Photos
                  </CardTitle>
                  <Button variant="link" className="text-red-400 hover:text-red-300 p-0" onClick={() => setActiveTab('photos')}>
                    See All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {posts.filter(p => p.type === 'image' || p.thumbnailUrl).slice(0, 9).map((post, idx) => (
                    <Link key={post.id} href={`/post/${post.id}`}>
                      <div className="aspect-square bg-red-950/30 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity">
                        {post.thumbnailUrl && (
                          <img
                            src={post.thumbnailUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Card (for visitors) */}
            {!isOwnProfile && (
              <Card className="bg-gradient-to-br from-red-900/40 to-purple-900/40 backdrop-blur-xl border-red-500/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Subscribe
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    Get exclusive access to all content
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white">
                      {formatCurrency(creator.monthlyPriceCents)}
                    </div>
                    <div className="text-gray-400">per month</div>
                  </div>

                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Full access to all posts
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Direct messaging
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-400" />
                      Cancel anytime
                    </li>
                  </ul>

                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => subscribeMutation.mutate()}
                    disabled={subscribeMutation.isPending || creator.isSubscribed}
                  >
                    {creator.isSubscribed ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Subscribed
                      </>
                    ) : (
                      'Subscribe Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Send Tip Card */}
            {!isOwnProfile && (
              <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gift className="h-5 w-5 text-pink-400" />
                    Send a Tip
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[5, 10, 25, 50].map((amount) => (
                      <Button
                        key={amount}
                        variant="outline"
                        className="border-red-500/30 text-white hover:bg-red-950/30"
                        onClick={() => tipMutation.mutate(amount)}
                        disabled={tipMutation.isPending}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                  <Button className="w-full bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white">
                    <Flame className="h-4 w-4 mr-2" />
                    Custom Amount
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* QR Code & Share */}
            <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
              <CardContent className="p-4 flex items-center justify-between">
                <ProfileQRCode
                  username={creator.user?.username || 'creator'}
                  userId={creator.userId}
                  profileImageUrl={creator.user?.profileImageUrl}
                />

                {isOwnProfile && (
                  <ProfileCustomizer userId={creator.userId} />
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-500/30 text-white hover:bg-red-950/30"
                  onClick={() => {
                    navigator.share?.({
                      title: `${creator.user?.username}'s Profile`,
                      url: window.location.href
                    }).catch(() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast({ title: "Link Copied", description: "Profile link copied to clipboard!" });
                    });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Sponsored */}
            <SidebarAdStack count={1} />
          </aside>

          {/* Main Content - Posts & Tabs */}
          <main className="lg:col-span-8 space-y-4">
            {/* Navigation Tabs */}
            <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 sticky top-16 z-20">
              <CardContent className="p-0">
                <div className="flex overflow-x-auto scrollbar-hide">
                  {[
                    { id: 'posts', label: 'Posts', icon: Grid3X3 },
                    { id: 'photos', label: 'Photos', icon: Image },
                    { id: 'videos', label: 'Videos', icon: Video },
                    { id: 'about', label: 'About', icon: Users },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap",
                        activeTab === tab.id
                          ? "text-red-400 border-b-2 border-red-500"
                          : "text-gray-400 hover:text-white hover:bg-red-950/20"
                      )}
                    >
                      <tab.icon className="h-5 w-5" />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Create Post (for owner) */}
            {isOwnProfile && activeTab === 'posts' && (
              <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 ring-2 ring-red-500/30">
                      <AvatarImage src={currentUser?.profileImageUrl} />
                      <AvatarFallback className="bg-red-950 text-red-500">
                        {currentUser?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <Link href="/breeding-zone" className="flex-1">
                      <div className="bg-red-950/30 rounded-full px-6 py-3 text-gray-400 hover:bg-red-950/50 transition-colors cursor-pointer">
                        What's on your mind, {currentUser?.firstName || 'Star'}?
                      </div>
                    </Link>
                  </div>
                  <Separator className="my-4 bg-red-900/30" />
                  <div className="flex items-center justify-around">
                    <Link href="/breeding-zone">
                      <Button variant="ghost" className="text-red-400 hover:bg-red-950/30">
                        <Video className="h-5 w-5 mr-2" />
                        Live Video
                      </Button>
                    </Link>
                    <Link href="/breeding-zone">
                      <Button variant="ghost" className="text-green-400 hover:bg-green-950/30">
                        <Image className="h-5 w-5 mr-2" />
                        Photo/Video
                      </Button>
                    </Link>
                    <Link href="/breeding-zone">
                      <Button variant="ghost" className="text-purple-400 hover:bg-purple-950/30">
                        <Lock className="h-5 w-5 mr-2" />
                        Premium Post
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pinned Posts */}
            {activeTab === 'posts' && pinnedPosts.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-400 flex items-center gap-2 px-2">
                  <Bookmark className="h-4 w-4" />
                  PINNED POSTS
                </h3>
                {pinnedPosts.map((post) => (
                  <PostCard key={post.id} post={post} creator={creator} isPinned />
                ))}
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === 'posts' && (
              <div className="space-y-4">
                {regularPosts.length > 0 ? (
                  regularPosts.map((post) => (
                    <PostCard key={post.id} post={post} creator={creator} />
                  ))
                ) : (
                  <Card className="bg-black/40 border-red-900/30 p-12 text-center">
                    <Camera className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-white mb-2">No Posts Yet</h3>
                    <p className="text-gray-400">
                      {isOwnProfile
                        ? "Share your first post with your fans!"
                        : "This creator hasn't posted anything yet."}
                    </p>
                    {isOwnProfile && (
                      <Link href="/breeding-zone">
                        <Button className="mt-4 bg-red-600 hover:bg-red-700">
                          Create Your First Post
                        </Button>
                      </Link>
                    )}
                  </Card>
                )}
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {posts.filter(p => p.type === 'image' || p.thumbnailUrl).map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="aspect-square bg-red-950/30 rounded-lg overflow-hidden cursor-pointer relative group"
                        >
                          {post.thumbnailUrl && (
                            <img
                              src={post.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1 text-white">
                              <Heart className="h-5 w-5" />
                              <span>{post.likesCount}</span>
                            </div>
                            <div className="flex items-center gap-1 text-white">
                              <MessageCircle className="h-5 w-5" />
                              <span>{post.commentsCount}</span>
                            </div>
                          </div>
                          {post.visibility === 'premium' && !creator.isSubscribed && !isOwnProfile && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                              <Lock className="h-8 w-8 text-red-500" />
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  {posts.filter(p => p.type === 'image').length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Image className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No photos yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Videos Tab */}
            {activeTab === 'videos' && (
              <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    {posts.filter(p => p.type === 'video').map((post) => (
                      <Link key={post.id} href={`/post/${post.id}`}>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          className="aspect-video bg-red-950/30 rounded-lg overflow-hidden cursor-pointer relative group"
                        >
                          {post.thumbnailUrl && (
                            <img
                              src={post.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center group-hover:bg-red-600 transition-colors">
                              <Play className="h-8 w-8 text-white ml-1" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-xs text-white">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              <span>{formatNumber(post.viewsCount)}</span>
                            </div>
                            {post.visibility === 'premium' && (
                              <Badge className="bg-red-600 text-white text-xs">
                                Premium
                              </Badge>
                            )}
                          </div>
                          {post.visibility === 'premium' && !creator.isSubscribed && !isOwnProfile && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                              <Lock className="h-8 w-8 text-red-500" />
                            </div>
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                  {posts.filter(p => p.type === 'video').length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>No videos yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* About Tab */}
            {activeTab === 'about' && (
              <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">About</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">
                      {creator.bio || "This creator hasn't added a bio yet."}
                    </p>
                  </div>

                  <Separator className="bg-red-900/30" />

                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Details</h3>
                    <div className="space-y-4">
                      {creator.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-400" />
                          <span className="text-gray-300">Lives in <span className="font-medium text-white">{creator.location}</span></span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-purple-400" />
                        <span className="text-gray-300">Joined <span className="font-medium text-white">{new Date(creator.joinedDate || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-blue-400" />
                        <span className="text-gray-300"><span className="font-medium text-white">{formatNumber(creator.totalSubscribers)}</span> subscribers</span>
                      </div>
                    </div>
                  </div>

                  {creator.categories?.length > 0 && (
                    <>
                      <Separator className="bg-red-900/30" />
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                        <div className="flex flex-wrap gap-2">
                          {creator.categories.map((category, idx) => (
                            <Badge key={idx} className="bg-red-600/20 text-red-400 border-red-500/30 px-3 py-1">
                              {category}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="bg-black/95 border-red-900/50">
          <DialogHeader>
            <DialogTitle className="text-white">Message {creator.user?.username}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Write your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="min-h-[150px] bg-red-950/20 border-red-900/30 text-white"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setMessageDialogOpen(false)} className="border-red-500/30 text-white">
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => sendMessageMutation.mutate(messageContent)}
                disabled={!messageContent.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Post Card Component
function PostCard({ post, creator, isPinned = false }: { post: Post; creator: CreatorProfile; isPinned?: boolean }) {
  const [showFullContent, setShowFullContent] = useState(false);
  const { user: currentUser } = useAuth();
  const isOwnProfile = currentUser?.id === creator.userId;
  const canView = post.visibility !== 'premium' || creator.isSubscribed || isOwnProfile;

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-red-500/30">
                <AvatarImage src={creator.user?.profileImageUrl} />
                <AvatarFallback className="bg-red-950 text-red-500">
                  {creator.user?.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{creator.user?.username}</span>
                  {creator.isVerified && <Shield className="h-4 w-4 text-blue-400" />}
                  {isPinned && (
                    <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                      <Bookmark className="h-3 w-3 mr-1" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <span className="text-sm text-gray-400">{timeAgo(post.createdAt)}</span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/95 border-red-900/50">
                <DropdownMenuItem>
                  <Bookmark className="mr-2 h-4 w-4" />
                  Save Post
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {post.content && (
            <div className="px-4 pb-3">
              <p className={cn(
                "text-gray-100 whitespace-pre-wrap",
                !showFullContent && post.content.length > 300 && "line-clamp-4"
              )}>
                {post.content}
              </p>
              {post.content.length > 300 && (
                <button
                  onClick={() => setShowFullContent(!showFullContent)}
                  className="text-red-400 text-sm mt-1 hover:text-red-300"
                >
                  {showFullContent ? 'Show less' : 'See more'}
                </button>
              )}
            </div>
          )}

          {/* Media */}
          {(post.thumbnailUrl || post.mediaUrls?.length > 0) && (
            <Link href={`/post/${post.id}`}>
              <div className="relative aspect-video bg-black/60 cursor-pointer">
                {canView ? (
                  <>
                    <img
                      src={post.thumbnailUrl || post.mediaUrls?.[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {post.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center">
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-black/90 to-red-950/30">
                    <Lock className="w-16 h-16 text-red-500 mb-4" />
                    <p className="text-xl font-bold text-white mb-2">
                      {post.priceCents > 0
                        ? `Unlock for $${(post.priceCents / 100).toFixed(2)}`
                        : "Subscribe to View"}
                    </p>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      {post.priceCents > 0 ? 'Unlock' : 'Subscribe'}
                    </Button>
                  </div>
                )}
              </div>
            </Link>
          )}

          {/* Stats */}
          <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-400 border-t border-red-900/20">
            <div className="flex items-center gap-1">
              <span>🔥</span>
              <span>{post.likesCount}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{post.commentsCount} comments</span>
              <span>{post.viewsCount.toLocaleString()} views</span>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2 py-1 flex items-center justify-around border-t border-red-900/20">
            <Button variant="ghost" className="flex-1 text-gray-400 hover:text-red-400 hover:bg-red-950/30">
              <Flame className="h-5 w-5 mr-2" />
              React
            </Button>
            <Link href={`/post/${post.id}`} className="flex-1">
              <Button variant="ghost" className="w-full text-gray-400 hover:text-blue-400 hover:bg-blue-950/30">
                <MessageCircle className="h-5 w-5 mr-2" />
                Comment
              </Button>
            </Link>
            <Button variant="ghost" className="flex-1 text-gray-400 hover:text-green-400 hover:bg-green-950/30">
              <Share2 className="h-5 w-5 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
