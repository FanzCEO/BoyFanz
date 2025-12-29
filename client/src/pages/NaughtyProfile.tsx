// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  MessageCircle,
  Star,
  Users,
  Camera,
  Video,
  Shield,
  Share2,
  Flame,
  Sparkles,
  Crown,
  Zap,
  Eye,
  Lock,
  Music,
  Gift,
  ThumbsUp,
  Send,
  MoreHorizontal,
  Settings,
  Edit3,
  UserPlus,
  HeartHandshake,
  Bed,
  Wine,
  Moon,
  Sun,
  Palette,
  ImageIcon
} from 'lucide-react';

// Naughty terminology for social sections
const NAUGHTY_LABELS = {
  friends: 'Fuck Buddies',
  followers: 'Admirers',
  following: 'Playmates',
  posts: 'Naughty Moments',
  likes: 'Turn-Ons',
  interests: 'Fantasies',
  hobbies: 'Kinks & Fetishes',
  about: 'What Gets Me Off',
  status: 'Current Mood',
  gallery: 'Spicy Gallery',
  videos: 'XXX Videos',
  wishlist: 'Spoil Me',
  topFriends: 'Top 8 Fuck Buddies',
  testimonials: 'What Lovers Say',
  seeking: 'Looking For',
  turnOns: 'Turn-Ons',
  turnOffs: 'Turn-Offs',
  wall: 'The Wall',
  wallPosts: 'Wall Posts',
};

// Naughty reaction emojis
const WALL_REACTIONS = [
  { type: 'fire', emoji: '🔥', label: 'Hot' },
  { type: 'heart', emoji: '❤️', label: 'Love' },
  { type: 'eggplant', emoji: '🍆', label: 'Big Energy' },
  { type: 'peach', emoji: '🍑', label: 'Thicc' },
  { type: 'sweat', emoji: '💦', label: 'Wet' },
  { type: 'devil', emoji: '😈', label: 'Naughty' },
  { type: 'tongue', emoji: '👅', label: 'Tasty' },
  { type: 'eyes', emoji: '👀', label: 'Watching' },
];

interface WallPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  authorIsCreator: boolean;
  authorIsVerified: boolean;
  type: 'text' | 'photo' | 'video' | 'mood' | 'check_in' | 'milestone';
  content: string;
  mediaUrls?: string[];
  mood?: string;
  moodEmoji?: string;
  location?: string;
  isPinned: boolean;
  reactionsCount: number;
  commentsCount: number;
  myReaction?: string;
  reactions: { type: string; count: number }[];
  createdAt: string;
}

interface ProfileTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  backgroundImage?: string;
  fontFamily: string;
  glitterEffect: boolean;
  sparkleEffect: boolean;
  musicUrl?: string;
  layoutStyle: 'classic' | 'modern' | 'wild';
}

interface FuckBuddy {
  id: string;
  username: string;
  profileImageUrl?: string;
  isOnline: boolean;
  relationship: 'fuckbuddy' | 'fwb' | 'crush' | 'lover' | 'playmate';
}

interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  coverImageUrl?: string;
  bio?: string;
  isVerified: boolean;
  isOnline: boolean;
  lastSeenAt: string;
  joinedAt: string;
  location?: string;
  age?: number;
  pronouns?: string;

  // Naughty profile fields
  currentMood?: string;
  fantasies: string[];
  kinks: string[];
  turnOns: string[];
  turnOffs: string[];
  lookingFor: string[];
  sexualOrientation?: string;
  relationshipStatus?: string;
  bodyType?: string;
  position?: string;

  // Stats
  fuckBuddyCount: number;
  admirerCount: number;
  playmateCount: number;
  postCount: number;

  // Theme
  theme?: ProfileTheme;

  // Top 8
  topFuckBuddies: FuckBuddy[];

  // Testimonials
  testimonials: {
    id: string;
    fromUser: { id: string; username: string; profileImageUrl?: string };
    content: string;
    rating: number;
    createdAt: string;
  }[];
}

const defaultTheme: ProfileTheme = {
  primaryColor: '#ec4899',
  secondaryColor: '#8b5cf6',
  backgroundColor: '#0a0a0a',
  fontFamily: 'system-ui',
  glitterEffect: false,
  sparkleEffect: true,
  layoutStyle: 'modern',
};

const moodOptions = [
  { emoji: '🔥', label: 'Horny AF' },
  { emoji: '😈', label: 'Feeling Naughty' },
  { emoji: '💋', label: 'Ready to Play' },
  { emoji: '🍆', label: 'DTF' },
  { emoji: '🌙', label: 'Late Night Vibes' },
  { emoji: '💦', label: 'Wet & Wild' },
  { emoji: '👀', label: 'Looking for Fun' },
  { emoji: '😴', label: 'Netflix & Chill' },
  { emoji: '🍑', label: 'Thicc Thoughts' },
  { emoji: '💕', label: 'Feeling Romantic' },
];

const relationshipBadges = {
  fuckbuddy: { label: 'Fuck Buddy', color: 'bg-red-500/20 text-red-400' },
  fwb: { label: 'FWB', color: 'bg-pink-500/20 text-pink-400' },
  crush: { label: 'Crush', color: 'bg-purple-500/20 text-purple-400' },
  lover: { label: 'Lover', color: 'bg-rose-500/20 text-rose-400' },
  playmate: { label: 'Playmate', color: 'bg-orange-500/20 text-orange-400' },
};

export default function NaughtyProfile() {
  // Support multiple route patterns: /profile/:userId, /naughty-profile, /fuck-buddies
  const [matchProfile, profileParams] = useRoute('/profile/:userId');
  const [matchNaughty] = useRoute('/naughty-profile');
  const [matchFuckBuddies] = useRoute('/fuck-buddies');
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // If viewing /naughty-profile or /fuck-buddies without userId, use current user's ID
  const userId = profileParams?.userId || (matchNaughty || matchFuckBuddies ? currentUser?.id : undefined);
  const isOwnProfile = !profileParams?.userId || currentUser?.id === userId;

  const [activeTab, setActiveTab] = useState('wall');
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [testimonialText, setTestimonialText] = useState('');
  const [wallPostText, setWallPostText] = useState('');
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<File[]>([]);

  // Fetch profile
  const { data: profile, isLoading } = useQuery<UserProfile>({
    queryKey: ['/api/naughty-profile', userId],
    enabled: !!userId,
  });

  // Production mode - no mock data, only real profiles
  const displayProfile = profile;
  const theme = displayProfile?.theme || defaultTheme;

  // Show loading or not found state
  if (!displayProfile && !isLoading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
            <p className="text-muted-foreground">This user profile doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch wall posts
  const { data: wallPosts = [] } = useQuery<WallPost[]>({
    queryKey: [`/api/naughty-profile/wall/${userId}`],
    enabled: !!userId,
  });

  // Fetch fuck buddies list
  const { data: fuckBuddiesData } = useQuery({
    queryKey: ['/api/fuck-buddies', userId],
    enabled: !!userId,
  });

  // Fetch buddy requests (only for own profile)
  const { data: buddyRequests = [] } = useQuery({
    queryKey: ['/api/fuck-buddies/requests'],
    enabled: isOwnProfile,
  });

  // Fetch privacy settings (only for own profile)
  const { data: privacySettings } = useQuery({
    queryKey: ['/api/privacy'],
    enabled: isOwnProfile,
  });

  // Fetch block status
  const { data: buddyStatus } = useQuery({
    queryKey: ['/api/fuck-buddies/status', userId],
    enabled: !!userId && !!currentUser && userId !== currentUser?.id,
  });

  // Production mode - only real wall posts
  const displayWallPosts = wallPosts;
  const displayFuckBuddies = fuckBuddiesData?.buddies || displayProfile?.topFuckBuddies || [];
  const pendingRequestsCount = buddyRequests?.filter((r: any) => r.status === 'pending')?.length || 0;

  // Is current user a verified creator? (for media upload restrictions)
  const currentUserIsCreator = currentUser?.isCreator && currentUser?.isVerified;

  // Handle wall post submission
  const handlePostToWall = async () => {
    if (!wallPostText.trim() && selectedMedia.length === 0) {
      toast({
        title: "Oops!",
        description: "Write something naughty first...",
        variant: "destructive",
      });
      return;
    }

    // Check media restriction for non-verified creators
    if (selectedMedia.length > 0 && !currentUserIsCreator) {
      toast({
        title: "Verified Creators Only 🔒",
        description: "Only verified creators can post media. Apply to become a creator!",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/naughty-profile/wall/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: wallPostText.trim(),
          type: selectedMedia.length > 0 ? 'media' : 'text',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to post');
      }

      toast({
        title: "Posted! 🔥",
        description: `Your message was posted to ${displayProfile.username}'s wall`,
      });
      setWallPostText('');
      setSelectedMedia([]);
      // Refresh wall posts
      queryClient.invalidateQueries({ queryKey: [`/api/naughty-profile/wall/${userId}`] });
    } catch (error: any) {
      toast({
        title: "Failed to post",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  // Handle reaction
  const handleReaction = (postId: string, reactionType: string) => {
    toast({
      title: WALL_REACTIONS.find(r => r.type === reactionType)?.emoji + " Reacted!",
      description: `You reacted with ${WALL_REACTIONS.find(r => r.type === reactionType)?.label}`,
    });
    setShowReactionPicker(null);
  };

  // Time ago helper
  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  // Dynamic styles based on theme
  const themeStyles = {
    '--profile-primary': theme.primaryColor,
    '--profile-secondary': theme.secondaryColor,
    '--profile-bg': theme.backgroundColor,
  } as React.CSSProperties;

  const handleAddFuckBuddy = async () => {
    toast({
      title: 'Request Sent! 🔥',
      description: `Your fuck buddy request has been sent to ${displayProfile.username}`,
    });
  };

  const handleSendMessage = async () => {
    toast({
      title: 'Slide into their DMs! 💬',
      description: 'Opening messages...',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={themeStyles}
      data-testid="naughty-profile-page"
    >
      {/* Sparkle/Glitter Effects */}
      {theme.sparkleEffect && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute top-20 left-20 w-2 h-2 bg-pink-400 rounded-full animate-ping" />
          <div className="absolute top-40 right-40 w-1 h-1 bg-purple-400 rounded-full animate-pulse" />
          <div className="absolute bottom-40 left-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-ping delay-300" />
          <div className="absolute top-1/3 right-20 w-1 h-1 bg-pink-300 rounded-full animate-pulse delay-500" />
        </div>
      )}

      {/* Cover Image with Gradient */}
      <div className="relative h-80">
        {displayProfile.coverImageUrl ? (
          <img
            src={displayProfile.coverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}40 0%, ${theme.secondaryColor}40 50%, ${theme.backgroundColor} 100%)`
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

        {/* Edit Cover Button */}
        {isOwnProfile && (
          <Button
            variant="outline"
            size="sm"
            className="absolute top-4 right-4 bg-black/50 border-white/20 hover:bg-black/70"
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Change Cover
          </Button>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile Card */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardContent className="p-6 text-center">
                {/* Avatar */}
                <div className="relative inline-block mb-4">
                  <Avatar className="h-32 w-32 ring-4 ring-pink-500/50 mx-auto">
                    <AvatarImage src={displayProfile.profileImageUrl} />
                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 text-white text-4xl">
                      {displayProfile.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {displayProfile.isOnline && (
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 bg-green-500 border-4 border-black rounded-full flex items-center justify-center">
                      <Flame className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {isOwnProfile && (
                    <Button
                      size="icon"
                      variant="outline"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-black/80"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Name & Badges */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {displayProfile.displayName || displayProfile.username}
                  </h1>
                  {displayProfile.isVerified && (
                    <Shield className="h-5 w-5 text-pink-500" />
                  )}
                </div>
                <p className="text-muted-foreground mb-2">@{displayProfile.username}</p>

                {/* Pronouns & Age */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-4">
                  {displayProfile.pronouns && <Badge variant="outline">{displayProfile.pronouns}</Badge>}
                  {displayProfile.age && <Badge variant="outline">{displayProfile.age}yo</Badge>}
                  {displayProfile.location && <Badge variant="outline">{displayProfile.location}</Badge>}
                </div>

                {/* Current Mood */}
                <div
                  className="relative mb-4 p-3 rounded-lg bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30 cursor-pointer"
                  onClick={() => isOwnProfile && setShowMoodPicker(!showMoodPicker)}
                >
                  <div className="text-xs text-pink-400 font-semibold mb-1">{NAUGHTY_LABELS.status}</div>
                  <div className="text-lg">{displayProfile.currentMood || '😈 Feeling Naughty'}</div>
                  {isOwnProfile && <Edit3 className="absolute top-2 right-2 h-4 w-4 text-pink-400" />}
                </div>

                {showMoodPicker && isOwnProfile && (
                  <Card className="absolute left-4 right-4 z-50 bg-black/95 border-pink-500/50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-2">
                        {moodOptions.map((mood) => (
                          <Button
                            key={mood.label}
                            variant="outline"
                            size="sm"
                            className="justify-start"
                            onClick={() => {
                              setShowMoodPicker(false);
                              toast({ title: `Mood updated to ${mood.emoji} ${mood.label}` });
                            }}
                          >
                            {mood.emoji} {mood.label}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-pink-500/10">
                    <div className="text-xl font-bold text-pink-400">{displayProfile.fuckBuddyCount}</div>
                    <div className="text-xs text-muted-foreground">{NAUGHTY_LABELS.friends}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-purple-500/10">
                    <div className="text-xl font-bold text-purple-400">{displayProfile.admirerCount.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{NAUGHTY_LABELS.followers}</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-orange-500/10">
                    <div className="text-xl font-bold text-orange-400">{displayProfile.playmateCount}</div>
                    <div className="text-xs text-muted-foreground">{NAUGHTY_LABELS.following}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!isOwnProfile ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                      onClick={handleAddFuckBuddy}
                    >
                      <HeartHandshake className="h-4 w-4 mr-2" />
                      Add as {NAUGHTY_LABELS.friends.slice(0, -1)}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-pink-500/50"
                      onClick={handleSendMessage}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Slide into DMs
                    </Button>
                    <Button variant="outline" className="w-full border-pink-500/50">
                      <Gift className="h-4 w-4 mr-2" />
                      {NAUGHTY_LABELS.wishlist}
                    </Button>
                  </div>
                ) : (
                  <Link href="/settings/profile">
                    <Button className="w-full" variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* About Me Card */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-pink-400 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  {NAUGHTY_LABELS.about}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{displayProfile.bio}</p>
              </CardContent>
            </Card>

            {/* Fantasies & Kinks */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-purple-400 flex items-center gap-2">
                  <Moon className="h-5 w-5" />
                  {NAUGHTY_LABELS.interests}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {displayProfile.fantasies.map((fantasy) => (
                    <Badge key={fantasy} className="bg-purple-500/20 text-purple-300 border-0">
                      {fantasy}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-orange-400 flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  {NAUGHTY_LABELS.hobbies}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {displayProfile.kinks.map((kink) => (
                    <Badge key={kink} className="bg-orange-500/20 text-orange-300 border-0">
                      {kink}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Turn-Ons / Turn-Offs */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardContent className="p-4 space-y-4">
                <div>
                  <div className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    {NAUGHTY_LABELS.turnOns}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayProfile.turnOns.map((item) => (
                      <Badge key={item} className="bg-green-500/20 text-green-300 border-0 text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Separator className="bg-pink-500/20" />
                <div>
                  <div className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4 rotate-180" />
                    {NAUGHTY_LABELS.turnOffs}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {displayProfile.turnOffs.map((item) => (
                      <Badge key={item} className="bg-red-500/20 text-red-300 border-0 text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Card */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-pink-400">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Orientation</span>
                  <span className="text-pink-300">{displayProfile.sexualOrientation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-pink-300">{displayProfile.relationshipStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Body Type</span>
                  <span className="text-pink-300">{displayProfile.bodyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="text-pink-300">{displayProfile.position}</span>
                </div>
                <Separator className="bg-pink-500/20" />
                <div>
                  <div className="text-muted-foreground mb-2">{NAUGHTY_LABELS.seeking}</div>
                  <div className="flex flex-wrap gap-1">
                    {displayProfile.lookingFor.map((item) => (
                      <Badge key={item} className="bg-pink-500/20 text-pink-300 border-0 text-xs">
                        {item}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Top 8 Fuck Buddies - MySpace Style! */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <CardHeader>
                <CardTitle className="text-xl text-pink-400 flex items-center gap-2">
                  <Heart className="h-6 w-6" />
                  {NAUGHTY_LABELS.topFriends}
                </CardTitle>
                <CardDescription>
                  The hottest people in my life right now
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {displayProfile.topFuckBuddies.slice(0, 8).map((buddy, idx) => (
                    <Link href={`/profile/${buddy.id}`} key={buddy.id}>
                      <div className="text-center group cursor-pointer">
                        <div className="relative mb-2">
                          <Avatar className="h-16 w-16 mx-auto ring-2 ring-pink-500/50 group-hover:ring-pink-500 transition-all">
                            <AvatarImage src={buddy.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500/50 to-purple-500/50">
                              {buddy.username[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {buddy.isOnline && (
                            <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-black rounded-full" />
                          )}
                          <div className="absolute -top-1 -left-1 h-5 w-5 bg-pink-500 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </div>
                        </div>
                        <p className="text-xs font-medium truncate group-hover:text-pink-400 transition-colors">
                          {buddy.username}
                        </p>
                        <Badge className={`${relationshipBadges[buddy.relationship].color} text-xs mt-1`}>
                          {relationshipBadges[buddy.relationship].label}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Content Tabs */}
            <Card className="bg-black/80 backdrop-blur border-pink-500/30">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-transparent border-b border-pink-500/20 rounded-none p-0">
                  <TabsTrigger
                    value="wall"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.wall}
                  </TabsTrigger>
                  <TabsTrigger
                    value="feed"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.posts}
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.gallery}
                  </TabsTrigger>
                  <TabsTrigger
                    value="videos"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.videos}
                  </TabsTrigger>
                  <TabsTrigger
                    value="testimonials"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.testimonials}
                  </TabsTrigger>
                  <TabsTrigger
                    value="buddies"
                    className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    {NAUGHTY_LABELS.friends}
                  </TabsTrigger>
                  {isOwnProfile && (
                    <TabsTrigger
                      value="privacy"
                      className="flex-1 data-[state=active]:bg-pink-500/20 data-[state=active]:border-b-2 data-[state=active]:border-pink-500 rounded-none"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Privacy
                    </TabsTrigger>
                  )}
                </TabsList>

                {/* === THE WALL - Facebook Style === */}
                <TabsContent value="wall" className="p-4 space-y-4">
                  {/* Wall Post Composer */}
                  {currentUser && (
                    <Card className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-pink-500/40">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Avatar className="h-10 w-10 ring-2 ring-pink-500/50">
                            <AvatarImage src={currentUser.profileImageUrl} />
                            <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600">
                              {currentUser.username?.[0]?.toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <Textarea
                              placeholder={isOwnProfile
                                ? "What's on your naughty mind? 😈"
                                : `Write something on ${displayProfile.username}'s wall...`}
                              value={wallPostText}
                              onChange={(e) => setWallPostText(e.target.value)}
                              className="min-h-[80px] bg-black/50 border-pink-500/30 focus:border-pink-500 resize-none"
                            />
                            <div className="flex items-center justify-between mt-3">
                              <div className="flex gap-2">
                                {/* Photo Button - Only for verified creators */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${currentUserIsCreator ? 'text-pink-400 hover:text-pink-300' : 'text-muted-foreground cursor-not-allowed opacity-50'}`}
                                  disabled={!currentUserIsCreator}
                                  title={currentUserIsCreator ? "Add photos" : "Only verified creators can post media"}
                                >
                                  <ImageIcon className="h-4 w-4 mr-1" />
                                  Photo
                                  {!currentUserIsCreator && <Lock className="h-3 w-3 ml-1" />}
                                </Button>
                                {/* Video Button - Only for verified creators */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={`${currentUserIsCreator ? 'text-purple-400 hover:text-purple-300' : 'text-muted-foreground cursor-not-allowed opacity-50'}`}
                                  disabled={!currentUserIsCreator}
                                  title={currentUserIsCreator ? "Add video" : "Only verified creators can post media"}
                                >
                                  <Video className="h-4 w-4 mr-1" />
                                  Video
                                  {!currentUserIsCreator && <Lock className="h-3 w-3 ml-1" />}
                                </Button>
                                {/* Mood Button - Available to all */}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-yellow-400 hover:text-yellow-300"
                                >
                                  <Flame className="h-4 w-4 mr-1" />
                                  Mood
                                </Button>
                              </div>
                              <Button
                                size="sm"
                                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
                                onClick={handlePostToWall}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Post
                              </Button>
                            </div>
                            {!currentUserIsCreator && (
                              <p className="text-xs text-muted-foreground mt-2">
                                🔒 Only verified creators can post photos & videos.{' '}
                                <Link href="/become-creator" className="text-pink-400 hover:underline">
                                  Apply to become a creator
                                </Link>
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Wall Posts */}
                  {displayWallPosts
                    .sort((a, b) => {
                      // Pinned posts first
                      if (a.isPinned && !b.isPinned) return -1;
                      if (!a.isPinned && b.isPinned) return 1;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .map((post) => (
                      <Card
                        key={post.id}
                        className={`bg-black/60 border-pink-500/20 hover:border-pink-500/40 transition-all ${post.isPinned ? 'ring-1 ring-pink-500/50' : ''}`}
                      >
                        <CardContent className="p-4">
                          {/* Pinned badge */}
                          {post.isPinned && (
                            <div className="flex items-center gap-1 text-xs text-pink-400 mb-2">
                              <Star className="h-3 w-3 fill-pink-400" />
                              Pinned Post
                            </div>
                          )}

                          {/* Post Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <Link href={`/profile/${post.authorId}`}>
                              <Avatar className="h-10 w-10 ring-2 ring-pink-500/30 cursor-pointer hover:ring-pink-500/60 transition-all">
                                <AvatarImage src={post.authorAvatar} />
                                <AvatarFallback className="bg-gradient-to-br from-pink-500/50 to-purple-500/50">
                                  {post.authorUsername[0]?.toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                            </Link>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Link href={`/profile/${post.authorId}`}>
                                  <span className="font-semibold text-pink-400 hover:underline cursor-pointer">
                                    {post.authorUsername}
                                  </span>
                                </Link>
                                {post.authorIsVerified && (
                                  <Shield className="h-4 w-4 text-pink-500" />
                                )}
                                {post.authorIsCreator && (
                                  <Badge className="bg-purple-500/20 text-purple-300 border-0 text-xs px-1.5">
                                    Creator
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{timeAgo(post.createdAt)}</span>
                                {post.type === 'mood' && post.moodEmoji && (
                                  <span className="text-yellow-400">
                                    is feeling {post.moodEmoji} {post.mood}
                                  </span>
                                )}
                                {post.type === 'check_in' && post.location && (
                                  <span className="text-blue-400">
                                    📍 at {post.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Post Content */}
                          <div className="mb-3">
                            <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                          </div>

                          {/* Media (if present) */}
                          {post.mediaUrls && post.mediaUrls.length > 0 && (
                            <div className="mb-3 rounded-lg overflow-hidden">
                              <div className={`grid gap-1 ${post.mediaUrls.length === 1 ? '' : post.mediaUrls.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                                {post.mediaUrls.slice(0, 4).map((url, idx) => (
                                  <div
                                    key={idx}
                                    className="aspect-square bg-pink-500/10 rounded-lg flex items-center justify-center"
                                  >
                                    <ImageIcon className="h-8 w-8 text-pink-500/50" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Reactions Summary */}
                          <div className="flex items-center justify-between py-2 border-y border-pink-500/10">
                            <div className="flex items-center gap-1">
                              {post.reactions.slice(0, 3).map((r, idx) => (
                                <span key={r.type} className="text-sm" style={{ zIndex: 3 - idx }}>
                                  {WALL_REACTIONS.find(wr => wr.type === r.type)?.emoji}
                                </span>
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                {post.reactionsCount.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.commentsCount} comments
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2">
                            <div className="relative">
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`text-muted-foreground hover:text-pink-400 ${post.myReaction ? 'text-pink-400' : ''}`}
                                onClick={() => setShowReactionPicker(showReactionPicker === post.id ? null : post.id)}
                              >
                                {post.myReaction
                                  ? WALL_REACTIONS.find(r => r.type === post.myReaction)?.emoji
                                  : <Flame className="h-4 w-4 mr-1" />
                                }
                                React
                              </Button>
                              {/* Reaction Picker */}
                              {showReactionPicker === post.id && (
                                <div className="absolute bottom-full left-0 mb-2 p-2 bg-black/95 border border-pink-500/30 rounded-lg flex gap-1 z-50">
                                  {WALL_REACTIONS.map((reaction) => (
                                    <button
                                      key={reaction.type}
                                      className="text-xl hover:scale-125 transition-transform p-1"
                                      onClick={() => handleReaction(post.id, reaction.type)}
                                      title={reaction.label}
                                    >
                                      {reaction.emoji}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-pink-400">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Comment
                            </Button>
                            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-pink-400">
                              <Share2 className="h-4 w-4 mr-1" />
                              Share
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                  {/* Load More */}
                  <div className="text-center">
                    <Button variant="outline" className="border-pink-500/30 text-pink-400">
                      Load More Posts
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="feed" className="p-4">
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                      <div
                        key={i}
                        className="aspect-square bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-lg flex items-center justify-center hover:ring-2 hover:ring-pink-500 transition-all cursor-pointer"
                      >
                        <Lock className="h-8 w-8 text-pink-500/50" />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="gallery" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-4 text-pink-500/50" />
                    <p>Subscribe to unlock the spicy gallery</p>
                  </div>
                </TabsContent>

                <TabsContent value="videos" className="p-4">
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="h-12 w-12 mx-auto mb-4 text-pink-500/50" />
                    <p>Subscribe to watch XXX videos</p>
                  </div>
                </TabsContent>

                <TabsContent value="testimonials" className="p-4 space-y-4">
                  {displayProfile.testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="bg-pink-500/10 border-pink-500/20">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Link href={`/profile/${testimonial.fromUser.id}`}>
                            <Avatar className="h-10 w-10 cursor-pointer">
                              <AvatarImage src={testimonial.fromUser.profileImageUrl} />
                              <AvatarFallback className="bg-pink-500/20">
                                {testimonial.fromUser.username[0]?.toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Link href={`/profile/${testimonial.fromUser.id}`}>
                                <span className="font-semibold text-pink-400 hover:underline cursor-pointer">
                                  {testimonial.fromUser.username}
                                </span>
                              </Link>
                              <div className="flex">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                  <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm">{testimonial.content}</p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(testimonial.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Add Testimonial */}
                  {!isOwnProfile && currentUser && (
                    <Card className="bg-black/50 border-pink-500/30">
                      <CardContent className="p-4">
                        <div className="text-sm font-semibold mb-2">Leave a Testimonial</div>
                        <Textarea
                          placeholder="How was your experience? Be honest (and naughty)..."
                          value={testimonialText}
                          onChange={(e) => setTestimonialText(e.target.value)}
                          className="mb-2 bg-black/50 border-pink-500/30"
                        />
                        <Button
                          size="sm"
                          className="bg-pink-500 hover:bg-pink-600"
                          onClick={() => {
                            toast({ title: 'Testimonial submitted!' });
                            setTestimonialText('');
                          }}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* === FUCK BUDDIES TAB === */}
                <TabsContent value="buddies" className="p-4 space-y-4">
                  {/* Buddy Request Button (for viewing other profiles) */}
                  {!isOwnProfile && currentUser && (
                    <Card className="bg-gradient-to-r from-pink-600/20 to-red-600/20 border-pink-500/40">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <HeartHandshake className="h-8 w-8 text-pink-400" />
                          <div>
                            <div className="font-semibold text-pink-300">
                              {buddyStatus?.areBuddies
                                ? `You're ${displayProfile?.username}'s Fuck Buddy! 🔥`
                                : buddyStatus?.hasPendingRequest
                                ? 'Request Pending...'
                                : `Become ${displayProfile?.username}'s Fuck Buddy`}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {buddyStatus?.areBuddies
                                ? 'Access exclusive content & direct connection'
                                : 'Send a request to connect intimately'}
                            </div>
                          </div>
                        </div>
                        {!buddyStatus?.areBuddies && !buddyStatus?.hasPendingRequest && (
                          <Button
                            className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
                            onClick={() => {
                              toast({ title: '💋 Request Sent!', description: `Waiting for ${displayProfile?.username} to accept...` });
                            }}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Send Request
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Pending Requests (own profile only) */}
                  {isOwnProfile && pendingRequestsCount > 0 && (
                    <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/40">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          Buddy Requests ({pendingRequestsCount})
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {buddyRequests?.filter((r: any) => r.status === 'pending').slice(0, 5).map((request: any) => (
                          <div key={request.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-purple-500/30">
                            <Link href={`/profile/${request.fromUser?.id}`}>
                              <div className="flex items-center gap-3 cursor-pointer">
                                <Avatar className="h-10 w-10 ring-2 ring-purple-500/50">
                                  <AvatarImage src={request.fromUser?.profileImageUrl} />
                                  <AvatarFallback className="bg-purple-500/20">
                                    {request.fromUser?.username?.[0]?.toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-semibold text-purple-300 hover:underline">
                                    {request.fromUser?.username}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {request.message || 'wants to be your Fuck Buddy'}
                                  </div>
                                </div>
                              </div>
                            </Link>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => toast({ title: '✅ Accepted!', description: `${request.fromUser?.username} is now your Fuck Buddy!` })}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                onClick={() => toast({ title: 'Declined' })}
                              >
                                Decline
                              </Button>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  {/* Fuck Buddies Grid */}
                  <Card className="bg-black/60 border-pink-500/30">
                    <CardHeader>
                      <CardTitle className="text-pink-400 flex items-center gap-2">
                        <HeartHandshake className="h-5 w-5" />
                        {isOwnProfile ? 'Your Fuck Buddies' : `${displayProfile?.username}'s Fuck Buddies`}
                      </CardTitle>
                      <CardDescription>
                        {displayFuckBuddies.length} connections
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {displayFuckBuddies.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {displayFuckBuddies.map((buddy: FuckBuddy, index: number) => (
                            <Link key={buddy.id} href={`/profile/${buddy.id}`}>
                              <div className="relative group cursor-pointer">
                                <div className="aspect-square rounded-lg overflow-hidden border-2 border-pink-500/30 group-hover:border-pink-500 transition-all">
                                  <Avatar className="w-full h-full rounded-none">
                                    <AvatarImage src={buddy.profileImageUrl} className="object-cover" />
                                    <AvatarFallback className="bg-gradient-to-br from-pink-500 to-purple-600 rounded-none text-2xl">
                                      {buddy.username?.[0]?.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  {/* Top 8 Badge */}
                                  {index < 8 && (
                                    <div className="absolute top-1 left-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-1.5 py-0.5 rounded">
                                      #{index + 1}
                                    </div>
                                  )}
                                  {/* Online indicator */}
                                  {buddy.isOnline && (
                                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-black" />
                                  )}
                                </div>
                                <div className="mt-2 text-center">
                                  <div className="text-sm font-semibold text-pink-300 truncate group-hover:underline">
                                    {buddy.username}
                                  </div>
                                  <Badge className={`text-xs ${relationshipBadges[buddy.relationship]?.color || 'bg-pink-500/20 text-pink-400'}`}>
                                    {relationshipBadges[buddy.relationship]?.label || 'Buddy'}
                                  </Badge>
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <HeartHandshake className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>{isOwnProfile ? 'No fuck buddies yet. Start connecting!' : `${displayProfile?.username} hasn't added any fuck buddies yet.`}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* === PRIVACY SETTINGS TAB (Own Profile Only) === */}
                {isOwnProfile && (
                  <TabsContent value="privacy" className="p-4 space-y-4">
                    <Card className="bg-gradient-to-br from-gray-900/80 to-black/80 border-gray-500/30">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-400" />
                          Privacy & Visibility Settings
                        </CardTitle>
                        <CardDescription>
                          Control who can see and interact with your profile
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Profile Visibility */}
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Profile Visibility
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'public', label: 'Public', desc: 'Anyone can see' },
                              { value: 'buddies_only', label: 'Buddies Only', desc: 'Only fuck buddies' },
                              { value: 'mutual_only', label: 'Mutual Only', desc: 'Only mutual connections' },
                              { value: 'nobody', label: 'Hidden', desc: 'Nobody can see' },
                            ].map((option) => (
                              <Button
                                key={option.value}
                                variant="outline"
                                className={`h-auto py-3 flex flex-col items-start ${
                                  privacySettings?.profileVisibility === option.value
                                    ? 'border-pink-500 bg-pink-500/20'
                                    : 'border-gray-700 hover:border-gray-500'
                                }`}
                                onClick={() => toast({ title: 'Updated!', description: `Profile visibility set to ${option.label}` })}
                              >
                                <span className="text-sm font-semibold">{option.label}</span>
                                <span className="text-xs text-muted-foreground">{option.desc}</span>
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        {/* Who Can Message */}
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Who Can Message You
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { value: 'public', label: 'Everyone' },
                              { value: 'buddies_only', label: 'Buddies Only' },
                              { value: 'mutual_only', label: 'Mutual Only' },
                              { value: 'nobody', label: 'Nobody' },
                            ].map((option) => (
                              <Button
                                key={option.value}
                                variant="outline"
                                size="sm"
                                className={`${
                                  privacySettings?.whoCanMessage === option.value
                                    ? 'border-purple-500 bg-purple-500/20'
                                    : 'border-gray-700 hover:border-gray-500'
                                }`}
                                onClick={() => toast({ title: 'Updated!' })}
                              >
                                {option.label}
                              </Button>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        {/* Show/Hide Options */}
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-300">Display Options</div>
                          <div className="space-y-2">
                            {[
                              { key: 'showOnlineStatus', label: 'Show Online Status', icon: Sun },
                              { key: 'showLastSeen', label: 'Show Last Seen', icon: Eye },
                              { key: 'showLocation', label: 'Show Location', icon: Users },
                              { key: 'showAge', label: 'Show Age', icon: Users },
                              { key: 'showInSearch', label: 'Appear in Search', icon: Eye },
                              { key: 'showInNearby', label: 'Appear in Nearby', icon: Users },
                            ].map((option) => (
                              <div
                                key={option.key}
                                className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-gray-700 hover:border-gray-500 cursor-pointer"
                                onClick={() => toast({ title: 'Toggled!' })}
                              >
                                <div className="flex items-center gap-2">
                                  <option.icon className="h-4 w-4 text-gray-400" />
                                  <span className="text-sm">{option.label}</span>
                                </div>
                                <div className={`w-10 h-5 rounded-full transition-colors ${
                                  privacySettings?.[option.key as keyof typeof privacySettings] !== false
                                    ? 'bg-pink-500'
                                    : 'bg-gray-600'
                                }`}>
                                  <div className={`w-4 h-4 rounded-full bg-white transform transition-transform mt-0.5 ${
                                    privacySettings?.[option.key as keyof typeof privacySettings] !== false
                                      ? 'translate-x-5 ml-0.5'
                                      : 'translate-x-0.5'
                                  }`} />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator className="bg-gray-700" />

                        {/* Blocked Users */}
                        <div className="space-y-3">
                          <div className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                            <Lock className="h-4 w-4 text-red-400" />
                            Blocked Users
                          </div>
                          <Button
                            variant="outline"
                            className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
                            onClick={() => toast({ title: 'Opening blocked users list...' })}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            Manage Blocked Users
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Subscribe Card */}
            <Card className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border-pink-500/50">
              <CardHeader>
                <CardTitle className="text-pink-400 flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  Unlock Everything
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-white">$9.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    All {NAUGHTY_LABELS.posts}
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Full {NAUGHTY_LABELS.gallery}
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    All {NAUGHTY_LABELS.videos}
                  </li>
                  <li className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    Direct Messages
                  </li>
                </ul>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 font-bold">
                  Subscribe Now
                </Button>
              </CardContent>
            </Card>

            {/* Tip Card */}
            <Card className="bg-black/80 border-pink-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Gift className="h-5 w-5 text-yellow-400" />
                  Send a Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[5, 10, 25].map((amount) => (
                    <Button key={amount} variant="outline" size="sm" className="border-pink-500/30">
                      ${amount}
                    </Button>
                  ))}
                </div>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
                  <Heart className="h-4 w-4 mr-2" />
                  Custom Tip
                </Button>
              </CardContent>
            </Card>

            {/* Theme Customization (Own Profile) */}
            {isOwnProfile && (
              <Card className="bg-black/80 border-pink-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="h-5 w-5 text-purple-400" />
                    Customize Theme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href="/settings/theme">
                    <Button variant="outline" className="w-full border-purple-500/50">
                      <Sparkles className="h-4 w-4 mr-2" />
                      Edit Theme
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
