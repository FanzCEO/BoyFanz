import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute } from 'wouter';
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  MessageCircle,
  Star,
  Users,
  DollarSign,
  Camera,
  Video,
  Shield,
  ExternalLink,
  Music,
  Palette,
  Sparkles,
  Eye,
  Share2,
  UserPlus,
  Crown,
  Flame,
  Gift,
  ThumbsUp,
  MessageSquare,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Send,
  Twitter,
  Instagram,
  Link2,
  Copy,
  Check,
  Zap,
  TrendingUp,
  Clock,
  Calendar,
  BarChart2,
  Settings,
  Edit3,
  Image,
  Smile
} from 'lucide-react';

interface CreatorProfile {
  userId: string;
  monthlyPriceCents: number;
  isVerified: boolean;
  verificationBadge: string;
  coverImageUrl?: string;
  welcomeMessageEnabled: boolean;
  welcomeMessageText?: string;
  welcomeMessagePriceCents: number;
  categories: string[];
  totalEarningsCents: number;
  totalSubscribers: number;
  isOnline: boolean;
  lastActiveAt: string;
  profileViews?: number;
  mood?: string;
  profileSongUrl?: string;
  profileSongTitle?: string;
  profileSongArtist?: string;
  themeColor?: string;
  backgroundColor?: string;
  backgroundImageUrl?: string;
  aboutMe?: string;
  interests?: string;
  whoIdLikeToMeet?: string;
  favoriteQuote?: string;
  topFriends?: Array<{
    id: string;
    username: string;
    avatarUrl?: string;
  }>;
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
  stats?: {
    totalPosts: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
  };
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    website?: string;
  };
}

interface Post {
  id: string;
  type: string;
  title?: string;
  content?: string;
  visibility: string;
  priceCents: number;
  thumbnailUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount?: number;
  createdAt: string;
}

interface ProfileComment {
  id: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
  createdAt: string;
}

interface ScheduledDrop {
  id: string;
  title: string;
  description?: string;
  dropType: 'content' | 'live_stream' | 'exclusive' | 'bundle';
  scheduledAt: string;
  thumbnailUrl?: string;
}

// MySpace-style theme presets
const THEME_PRESETS = [
  { name: 'Midnight', bg: 'from-gray-900 via-purple-900 to-black', accent: 'purple-500' },
  { name: 'Sunset', bg: 'from-orange-600 via-pink-600 to-purple-700', accent: 'orange-400' },
  { name: 'Ocean', bg: 'from-cyan-500 via-blue-600 to-indigo-800', accent: 'cyan-400' },
  { name: 'Forest', bg: 'from-green-700 via-emerald-800 to-teal-900', accent: 'emerald-400' },
  { name: 'Neon', bg: 'from-pink-500 via-purple-500 to-indigo-500', accent: 'pink-400' },
  { name: 'Fire', bg: 'from-red-600 via-orange-500 to-yellow-500', accent: 'red-400' },
];

// Mood options
const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🔥', label: 'Hot' },
  { emoji: '💋', label: 'Flirty' },
  { emoji: '😏', label: 'Naughty' },
  { emoji: '🥰', label: 'Loving' },
  { emoji: '😈', label: 'Mischievous' },
  { emoji: '🎉', label: 'Celebrating' },
  { emoji: '💪', label: 'Confident' },
];

export default function CreatorProfile() {
  const [, params] = useRoute('/creator/:userId');
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const userId = params?.userId;
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [showKudosAnimation, setShowKudosAnimation] = useState(false);

  const isOwnProfile = currentUser?.id === userId;

  const { data: creator, isLoading } = useQuery<CreatorProfile>({
    queryKey: ['/api/creator-profiles', userId],
    enabled: !!userId,
  });

  const { data: posts = [] } = useQuery<Post[]>({
    queryKey: ['/api/posts/creator', userId],
    enabled: !!userId,
  });

  const { data: comments = [] } = useQuery<ProfileComment[]>({
    queryKey: ['/api/profile-comments', userId],
    enabled: !!userId,
  });

  const { data: scheduleData } = useQuery<{ drops: ScheduledDrop[], scheduleEnabled: boolean }>({
    queryKey: ['/api/scheduled-drops/creator', userId],
    enabled: !!userId,
  });

  // Track profile view
  useEffect(() => {
    if (userId && !isOwnProfile) {
      fetch(`/api/creator-profiles/${userId}/view`, { method: 'POST' }).catch(() => {});
    }
  }, [userId, isOwnProfile]);

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to subscribe to creators",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorId: userId }),
      });

      if (response.ok) {
        toast({
          title: "Subscribed!",
          description: `You're now subscribed to ${creator?.user?.username}`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Subscription Failed",
          description: error.message || "Failed to subscribe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSendKudos = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to send kudos",
        variant: "destructive",
      });
      return;
    }

    setShowKudosAnimation(true);
    setTimeout(() => setShowKudosAnimation(false), 1500);

    try {
      await fetch(`/api/creator-profiles/${userId}/kudos`, { method: 'POST' });
      toast({ title: "Kudos Sent!", description: `You sent props to ${creator?.user?.username}!` });
    } catch (error) {
      console.error('Kudos error:', error);
    }
  };

  const handleAddFriend = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to add friends",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(`/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId }),
      });
      toast({ title: "Friend Request Sent!", description: `Request sent to ${creator?.user?.username}` });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    if (!isAuthenticated) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive",
      });
      return;
    }

    try {
      await fetch(`/api/profile-comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId: userId, content: newComment }),
      });
      setNewComment('');
      queryClient.invalidateQueries({ queryKey: ['/api/profile-comments', userId] });
      toast({ title: "Comment Posted!" });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment",
        variant: "destructive",
      });
    }
  };

  const handleShare = async (platform: string) => {
    const profileUrl = `${window.location.origin}/creator/${userId}`;
    const shareText = `Check out ${creator?.user?.username}'s profile on BoyFanz!`;

    switch (platform) {
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(profileUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast({ title: "Link Copied!" });
        break;
    }
    setShowShareMenu(false);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-fanz-red border-t-transparent mx-auto mb-4"></div>
          <p className="text-red-300 animate-pulse">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black">
        <Card className="w-96 bg-black/50 border-red-500/30 backdrop-blur-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Creator Not Found</CardTitle>
            <CardDescription className="text-gray-400">
              This creator profile doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Default theme
  const theme = THEME_PRESETS[0];

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg}`}>
      {/* Audio Player for Profile Song */}
      {creator.profileSongUrl && (
        <audio ref={audioRef} src={creator.profileSongUrl} loop />
      )}

      {/* Kudos Animation Overlay */}
      {showKudosAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-ping">
            <Sparkles className="h-32 w-32 text-yellow-400" />
          </div>
          <div className="absolute animate-bounce">
            <ThumbsUp className="h-24 w-24 text-yellow-500" />
          </div>
        </div>
      )}

      {/* Cover Section with MySpace-style customization */}
      <div className="relative h-80 overflow-hidden">
        {creator.backgroundImageUrl ? (
          <img
            src={creator.backgroundImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${theme.bg}`}>
            {/* Animated sparkle effects */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                  }}
                >
                  <Sparkles className="h-4 w-4 text-white/30" />
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Profile Views Counter - MySpace style */}
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 border border-white/20">
          <Eye className="h-4 w-4 text-orange-400" />
          <span className="text-white text-sm font-medium">{formatNumber(creator.profileViews || 0)} views</span>
        </div>

        {/* Music Player - MySpace style */}
        {creator.profileSongUrl && (
          <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md rounded-lg p-3 border border-red-500/30">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="h-10 w-10 rounded-full bg-red-600 hover:bg-red-500 text-white"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{creator.profileSongTitle || 'Profile Song'}</p>
                <p className="text-red-300 text-xs">{creator.profileSongArtist || 'Unknown Artist'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white/70 hover:text-white"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
            {isPlaying && (
              <div className="flex gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-orange-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.random() * 16 + 8}px`,
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Main Profile Card */}
            <Card className="bg-black/60 backdrop-blur-lg border-red-500/30 overflow-hidden">
              <div className="p-6 text-center">
                <div className="relative inline-block mb-4">
                  <Avatar className="h-32 w-32 ring-4 ring-red-500/50 mx-auto" data-testid="creator-avatar">
                    <AvatarImage src={creator.user?.profileImageUrl} />
                    <AvatarFallback className="bg-red-600 text-white text-4xl">
                      {creator.user?.username?.[0]?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  {creator.isOnline && (
                    <div className="absolute bottom-2 right-2 h-6 w-6 bg-green-500 rounded-full border-4 border-black animate-pulse" />
                  )}
                  {creator.isVerified && (
                    <div className="absolute -top-2 -right-2">
                      <div className="bg-green-500 rounded-full p-1">
                        <Shield className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                <h1 className="text-2xl font-bold text-white mb-1" data-testid="creator-username">
                  {creator.user?.username || 'Creator'}
                </h1>

                {creator.mood && (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full mb-3">
                    <span className="text-lg">{MOOD_OPTIONS.find(m => m.label === creator.mood)?.emoji}</span>
                    <span className="text-red-300 text-sm">{creator.mood}</span>
                  </div>
                )}

                <p className="text-gray-400 text-sm mb-4">
                  {creator.user?.firstName && creator.user?.lastName &&
                    `${creator.user.firstName} ${creator.user.lastName}`
                  }
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold" data-testid="subscriber-count">{formatNumber(creator.totalSubscribers)}</p>
                    <p className="text-gray-400 text-xs">Fans</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold">{formatNumber(creator.stats?.totalPosts || 0)}</p>
                    <p className="text-gray-400 text-xs">Posts</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2">
                    <p className="text-white font-bold">{formatNumber(creator.stats?.totalLikes || 0)}</p>
                    <p className="text-gray-400 text-xs">Likes</p>
                  </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1 justify-center mb-4">
                  {creator.categories.slice(0, 4).map((category, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-red-500/50 text-red-300">
                      {category}
                    </Badge>
                  ))}
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500"
                      onClick={handleSubscribe}
                      data-testid="subscribe-button"
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      Subscribe {formatCurrency(creator.monthlyPriceCents)}/mo
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                        onClick={handleAddFriend}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-300 hover:bg-yellow-500/20"
                        onClick={handleSendKudos}
                      >
                        <Sparkles className="h-4 w-4 mr-1" />
                        Props
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                        data-testid="message-button"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Message
                      </Button>
                      <Button
                        variant="outline"
                        className="border-pink-500/50 text-pink-300 hover:bg-pink-500/20"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                      </Button>
                    </div>
                  </div>
                )}

                {isOwnProfile && (
                  <Button variant="outline" className="w-full border-red-500/50 text-red-300">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                )}

                {/* Share Menu Dropdown */}
                {showShareMenu && (
                  <div className="absolute mt-2 right-0 left-0 mx-4 bg-black/90 backdrop-blur-lg rounded-lg border border-red-500/30 p-2 z-50">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-red-500/20"
                      onClick={() => handleShare('twitter')}
                    >
                      <Twitter className="h-4 w-4 mr-2 text-orange-400" />
                      Share on X/Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-white hover:bg-red-500/20"
                      onClick={() => handleShare('copy')}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 mr-2 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4 mr-2" />
                      )}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </Button>
                  </div>
                )}
              </div>
            </Card>

            {/* Social Links */}
            {creator.socialLinks && (
              <Card className="bg-black/60 backdrop-blur-lg border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-orange-400" />
                    Links
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {creator.socialLinks.twitter && (
                    <a href={creator.socialLinks.twitter} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors">
                      <Twitter className="h-4 w-4" />
                      <span className="text-sm">Twitter</span>
                    </a>
                  )}
                  {creator.socialLinks.instagram && (
                    <a href={creator.socialLinks.instagram} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-gray-300 hover:text-pink-400 transition-colors">
                      <Instagram className="h-4 w-4" />
                      <span className="text-sm">Instagram</span>
                    </a>
                  )}
                  {creator.socialLinks.website && (
                    <a href={creator.socialLinks.website} target="_blank" rel="noopener noreferrer"
                       className="flex items-center gap-2 text-gray-300 hover:text-orange-400 transition-colors">
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm">Website</span>
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Top Friends - MySpace style */}
            {creator.topFriends && creator.topFriends.length > 0 && (
              <Card className="bg-black/60 backdrop-blur-lg border-red-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-400" />
                    Top Friends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {creator.topFriends.slice(0, 8).map((friend) => (
                      <a key={friend.id} href={`/creator/${friend.id}`} className="group text-center">
                        <Avatar className="h-12 w-12 mx-auto ring-2 ring-transparent group-hover:ring-red-500 transition-all">
                          <AvatarImage src={friend.avatarUrl} />
                          <AvatarFallback className="bg-red-600/50 text-white text-xs">
                            {friend.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-gray-300 text-xs mt-1 truncate group-hover:text-red-300">
                          {friend.username}
                        </p>
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Send Tip */}
            <Card className="bg-black/60 backdrop-blur-lg border-red-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Gift className="h-4 w-4 text-green-400" />
                  Send Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[5, 10, 25].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      className="border-green-500/50 text-green-300 hover:bg-green-500/20"
                    >
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-500" data-testid="tip-button">
                  <DollarSign className="h-4 w-4 mr-1" />
                  Custom Amount
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-4">
            {/* About Section - MySpace style */}
            <Card className="bg-black/60 backdrop-blur-lg border-red-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Smile className="h-5 w-5 text-orange-400" />
                  About Me
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {creator.aboutMe && (
                  <div>
                    <h4 className="text-orange-300 text-sm font-medium mb-2">About Me</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">{creator.aboutMe}</p>
                  </div>
                )}
                {creator.interests && (
                  <div>
                    <h4 className="text-orange-300 text-sm font-medium mb-2">Interests</h4>
                    <p className="text-gray-300 text-sm">{creator.interests}</p>
                  </div>
                )}
                {creator.whoIdLikeToMeet && (
                  <div>
                    <h4 className="text-orange-300 text-sm font-medium mb-2">Who I'd Like to Meet</h4>
                    <p className="text-gray-300 text-sm">{creator.whoIdLikeToMeet}</p>
                  </div>
                )}
                {creator.favoriteQuote && (
                  <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-500/10 rounded-r-lg">
                    <p className="text-gray-300 italic">"{creator.favoriteQuote}"</p>
                  </div>
                )}
                {!creator.aboutMe && !creator.interests && !creator.whoIdLikeToMeet && (
                  <p className="text-gray-500 text-center py-4">No bio yet...</p>
                )}
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Card className="bg-black/60 backdrop-blur-lg border-red-500/30">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <CardHeader className="pb-0">
                  <TabsList className="bg-white/5 w-full justify-start">
                    <TabsTrigger value="posts" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      <Camera className="h-4 w-4 mr-2" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger value="media" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      <Video className="h-4 w-4 mr-2" />
                      Media
                    </TabsTrigger>
                    <TabsTrigger value="comments" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Wall ({comments.length})
                    </TabsTrigger>
                    {scheduleData?.scheduleEnabled && (
                      <TabsTrigger value="schedule" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </TabsTrigger>
                    )}
                  </TabsList>
                </CardHeader>
                <CardContent className="pt-4">
                  <TabsContent value="posts" className="mt-0">
                    {posts.length === 0 ? (
                      <div className="text-center py-12">
                        <Camera className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
                        <p className="text-gray-400">No posts yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {posts.map((post) => (
                          <div
                            key={post.id}
                            className="group relative aspect-square rounded-lg overflow-hidden bg-red-900/20 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                            data-testid={`post-${post.id}`}
                          >
                            {post.thumbnailUrl ? (
                              <img
                                src={post.thumbnailUrl}
                                alt={post.title || 'Post'}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                {post.type === 'video' ? (
                                  <Video className="h-12 w-12 text-red-500/50" />
                                ) : (
                                  <Camera className="h-12 w-12 text-red-500/50" />
                                )}
                              </div>
                            )}

                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="absolute bottom-0 left-0 right-0 p-3">
                                <div className="flex items-center justify-between text-white text-sm">
                                  <div className="flex items-center gap-3">
                                    <span className="flex items-center gap-1">
                                      <Heart className="h-4 w-4" />
                                      {formatNumber(post.likesCount)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MessageCircle className="h-4 w-4" />
                                      {formatNumber(post.commentsCount)}
                                    </span>
                                  </div>
                                  {post.visibility === 'premium' && (
                                    <Badge className="bg-red-600 text-white text-xs">
                                      ${(post.priceCents / 100).toFixed(0)}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Video indicator */}
                            {post.type === 'video' && (
                              <div className="absolute top-2 left-2 bg-black/60 rounded-full p-1">
                                <Play className="h-3 w-3 text-white" />
                              </div>
                            )}

                            {/* Premium indicator */}
                            {post.visibility === 'premium' && (
                              <div className="absolute top-2 right-2 bg-gradient-to-r from-red-600 to-orange-600 rounded-full p-1">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="media" className="mt-0">
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {posts.filter(p => p.type === 'video' || p.type === 'image').map((post) => (
                        <div
                          key={post.id}
                          className="aspect-square rounded-lg overflow-hidden bg-red-900/20 cursor-pointer hover:ring-2 hover:ring-red-500 transition-all"
                        >
                          {post.thumbnailUrl ? (
                            <img
                              src={post.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Camera className="h-8 w-8 text-red-500/50" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="comments" className="mt-0">
                    {/* Comment Input - Guestbook style */}
                    {isAuthenticated && !isOwnProfile && (
                      <div className="flex gap-3 mb-6">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={currentUser?.profileImageUrl} />
                          <AvatarFallback className="bg-red-600 text-white">
                            {currentUser?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 flex gap-2">
                          <Input
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={`Leave a comment for ${creator.user?.username}...`}
                            className="bg-white/5 border-red-500/30 text-white placeholder:text-gray-500"
                          />
                          <Button onClick={handlePostComment} className="bg-red-600 hover:bg-red-500">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Comments List */}
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageSquare className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
                        <p className="text-gray-400">No comments yet. Be the first!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3 p-4 bg-white/5 rounded-lg">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={comment.avatarUrl} />
                              <AvatarFallback className="bg-red-600/50 text-white">
                                {comment.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <a href={`/creator/${comment.userId}`} className="text-red-300 font-medium hover:text-red-200">
                                  {comment.username}
                                </a>
                                <span className="text-gray-500 text-xs">
                                  {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-300 text-sm">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Schedule Tab - Upcoming Content Drops */}
                  <TabsContent value="schedule" className="mt-0">
                    {!scheduleData?.scheduleEnabled ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
                        <p className="text-gray-400">Schedule not available</p>
                      </div>
                    ) : (scheduleData?.drops || []).length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
                        <p className="text-gray-400">No upcoming drops scheduled</p>
                        <p className="text-gray-500 text-sm mt-2">Check back soon for new content!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(scheduleData?.drops || []).map((drop) => (
                          <div key={drop.id} className="flex gap-4 p-4 bg-gradient-to-r from-red-950/30 to-orange-950/30 rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all">
                            {drop.thumbnailUrl ? (
                              <img
                                src={drop.thumbnailUrl}
                                alt={drop.title}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-20 h-20 rounded-lg bg-red-900/30 flex items-center justify-center">
                                {drop.dropType === 'live_stream' ? (
                                  <Video className="h-8 w-8 text-red-500/50" />
                                ) : drop.dropType === 'exclusive' ? (
                                  <Crown className="h-8 w-8 text-yellow-500/50" />
                                ) : drop.dropType === 'bundle' ? (
                                  <Gift className="h-8 w-8 text-green-500/50" />
                                ) : (
                                  <Camera className="h-8 w-8 text-red-500/50" />
                                )}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-bold">{drop.title}</h4>
                                <Badge className={
                                  drop.dropType === 'live_stream'
                                    ? 'bg-red-600 text-white text-xs'
                                    : drop.dropType === 'exclusive'
                                    ? 'bg-yellow-600 text-white text-xs'
                                    : drop.dropType === 'bundle'
                                    ? 'bg-green-600 text-white text-xs'
                                    : 'bg-orange-600 text-white text-xs'
                                }>
                                  {drop.dropType === 'live_stream' ? 'LIVE' :
                                   drop.dropType === 'exclusive' ? 'EXCLUSIVE' :
                                   drop.dropType === 'bundle' ? 'BUNDLE' : 'CONTENT'}
                                </Badge>
                              </div>
                              {drop.description && (
                                <p className="text-gray-400 text-sm mb-2">{drop.description}</p>
                              )}
                              <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-orange-400" />
                                <span className="text-orange-300">
                                  {new Date(drop.scheduledAt).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: 'numeric',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
