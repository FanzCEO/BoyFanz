// @ts-nocheck
import '@/styles/social-profile.css';
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRoute, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { BathhousePipes, SubtleSteamAccent } from '@/components/bathhouse';
import {
  Heart,
  MessageCircle,
  Users,
  Video,
  Shield,
  Share2,
  Flame,
  Crown,
  Eye,
  Lock,
  Send,
  Settings,
  UserPlus,
  Play,
  Compass,
  Star,
  DoorOpen,
  Sparkles,
  HeartHandshake,
  Bookmark,
  Bell,
  MapPin,
  Clock,
  TrendingUp,
  Zap,
  Gift,
  Camera,
  Music,
  MoreHorizontal,
  ThumbsUp,
  Radio,
  Search,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  X,
  Check,
  AlertCircle,
  Verified,
  DollarSign,
  Calendar,
  AtSign,
  Type,
  Copy,
  ExternalLink,
  Pin,
  Trash2,
  Edit3,
  Flag,
  CreditCard,
  Wallet,
  Medal,
  Filter,
  SlidersHorizontal,
  Globe,
  Users2,
  Maximize2,
  SkipBack,
  SkipForward,
  Pause,
  Subtitles,
  PictureInPicture,
  Minimize2,
  Home
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// ========================================
// DEFAULT ASSETS - BoyFanz Platform
// ========================================
const DEFAULT_PROFILE_IMAGE = '/boyfanz-logo.png';
const DEFAULT_BANNER_IMAGE = '/underground-bg.jpg';

// ========================================
// SEXUAL TERMINOLOGY - Platform Branding
// ========================================
const SEXY_LABELS = {
  // Main Tabs (New Structure)
  funRoom: 'Fun Room',
  fanzCock: 'FanzCock',
  groupPlay: 'Group Play',
  oneOnOne: '1 on 1',
  cruising: 'Cruising',
  fuckBuddies: 'Fuck Buddies',

  // Legacy/Alternative Names
  wall: 'The Glory Hole',
  reels: 'Stroke Reels',
  stories: 'Quickies',
  explore: 'Cruising',
  search: 'Hunting',
  messages: 'Slide In',
  live: 'Live & Raw',

  // Social
  followers: 'Admirers',
  following: 'Stalking',
  friends: 'Fuck Buddies',
  topEight: 'Top 8 Holes',

  // Actions
  likes: 'Throbs',
  comments: 'Moans',
  share: 'Pass Around',
  saved: 'Spank Bank',
  notifications: 'Alerts & Arousal',
  tips: 'Tributes',

  // Profile
  profile: 'My Room',
  settings: 'Safe Word',
  subscriptions: 'VIP Access',

  // Status
  online: 'Ready to Play',
  away: 'Edging',
  offline: 'Sleeping',
  verified: 'Certified Meat',

  // Discovery
  newUsers: 'Fresh Meat',
  trending: 'On Fire',
  forYou: 'Just For You, Daddy',

  // Content
  exclusive: 'VIP Access',
  premium: 'Premium Meat',
  free: 'Free Taste',
};

// Naughty reaction emojis
const GLORY_REACTIONS = [
  { type: 'throb', emoji: '🍆', label: 'Throb', color: '#9333ea' },
  { type: 'fire', emoji: '🔥', label: 'Hot AF', color: '#ef4444' },
  { type: 'wet', emoji: '💦', label: 'Wet', color: '#3b82f6' },
  { type: 'peach', emoji: '🍑', label: 'Dat Ass', color: '#f97316' },
  { type: 'devil', emoji: '😈', label: 'Naughty', color: '#dc2626' },
  { type: 'tongue', emoji: '👅', label: 'Tasty', color: '#ec4899' },
  { type: 'eyes', emoji: '👀', label: 'Watching', color: '#6366f1' },
  { type: 'drool', emoji: '🤤', label: 'Drooling', color: '#14b8a6' },
];

// Relationship types for Fuck Buddies
const FUCK_BUDDY_TYPES = [
  { id: 'fuck_buddy', label: 'Fuck Buddy', emoji: '🔥', color: '#ef4444' },
  { id: 'fwb', label: 'FWB', emoji: '💕', color: '#ec4899' },
  { id: 'crush', label: 'Crush', emoji: '💜', color: '#a855f7' },
  { id: 'lover', label: 'Lover', emoji: '❤️', color: '#f43f5e' },
  { id: 'playmate', label: 'Playmate', emoji: '🎮', color: '#8b5cf6' },
  { id: 'admirer', label: 'Admirer', emoji: '👀', color: '#6366f1' },
  { id: 'daddy', label: 'Daddy', emoji: '👨', color: '#78716c' },
  { id: 'boy', label: 'Boy', emoji: '👦', color: '#0ea5e9' },
  { id: 'master', label: 'Master', emoji: '👑', color: '#eab308' },
  { id: 'slave', label: 'Slave', emoji: '⛓️', color: '#71717a' },
];

// Mood options
const MOOD_OPTIONS = [
  { emoji: '🔥', label: 'Horny AF', color: '#ef4444' },
  { emoji: '😈', label: 'Feeling Naughty', color: '#dc2626' },
  { emoji: '💋', label: 'Ready to Play', color: '#ec4899' },
  { emoji: '🍆', label: 'DTF', color: '#9333ea' },
  { emoji: '🌙', label: 'Late Night Vibes', color: '#6366f1' },
  { emoji: '💦', label: 'Wet & Wild', color: '#3b82f6' },
  { emoji: '👀', label: 'Cruising', color: '#8b5cf6' },
  { emoji: '🍑', label: 'Thicc Thoughts', color: '#f97316' },
  { emoji: '🛁', label: 'At the Bathhouse', color: '#64748b' },
  { emoji: '🏋️', label: 'Post-Gym Pump', color: '#22c55e' },
];

// Creator Categories (28+ from spec)
const CREATOR_CATEGORIES = [
  { id: 'alpha', label: 'Alpha', emoji: '👑', color: '#ffd700' },
  { id: 'barely18', label: 'Barely 18+', emoji: '🔞', color: '#ef4444' },
  { id: 'bbc', label: 'BBC', emoji: '🍆', color: '#1a1a1a' },
  { id: 'bdsm', label: 'BDSM & Hardcore', emoji: '⛓️', color: '#8b0000' },
  { id: 'bi', label: 'Bi', emoji: '💜', color: '#9333ea' },
  { id: 'bro', label: 'Bro', emoji: '🤙', color: '#22c55e' },
  { id: 'bubble', label: 'Bubble Butt', emoji: '🍑', color: '#f97316' },
  { id: 'bukkake', label: 'Bukkake', emoji: '💦', color: '#60a5fa' },
  { id: 'bwc', label: 'BWC', emoji: '🥒', color: '#d4d4d4' },
  { id: 'chub', label: 'Chub', emoji: '🐻', color: '#a16207' },
  { id: 'college', label: 'College', emoji: '🎓', color: '#3b82f6' },
  { id: 'cosplay', label: 'Cosplay', emoji: '🎭', color: '#ec4899' },
  { id: 'couples', label: 'Couples', emoji: '💑', color: '#f43f5e' },
  { id: 'crossdressers', label: 'Crossdressers', emoji: '👗', color: '#c084fc' },
  { id: 'daddies', label: 'Daddies', emoji: '👨', color: '#78716c' },
  { id: 'dl', label: 'DL', emoji: '🤫', color: '#374151' },
  { id: 'fem', label: 'Fem', emoji: '💅', color: '#f9a8d4' },
  { id: 'fisting', label: 'Fisting', emoji: '✊', color: '#dc2626' },
  { id: 'gay', label: 'Gay', emoji: '🏳️‍🌈', color: '#64748b' },
  { id: 'jock', label: 'Jock', emoji: '🏈', color: '#16a34a' },
  { id: 'kink', label: 'Kink', emoji: '🔥', color: '#b91c1c' },
  { id: 'public', label: 'Public', emoji: '🌳', color: '#65a30d' },
  { id: 'pups', label: 'Pups', emoji: '🐶', color: '#ea580c' },
  { id: 'sissy', label: 'Sissy', emoji: '🎀', color: '#f472b6' },
  { id: 'southern', label: 'Southern', emoji: '🤠', color: '#92400e' },
  { id: 'straight', label: 'Straight Guyz', emoji: '🔥', color: '#1e40af' },
  { id: 'trans', label: 'Trans', emoji: '🏳️‍⚧️', color: '#cbd5e1' },
  { id: 'twinkz', label: 'Twinkz', emoji: '✨', color: '#fbbf24' },
];

// Sexual Orientation Options
const ORIENTATION_OPTIONS = [
  { id: 'gay', label: 'Gay', emoji: '🏳️‍🌈' },
  { id: 'lesbian', label: 'Lesbian', emoji: '👩‍❤️‍👩' },
  { id: 'bisexual', label: 'Bisexual', emoji: '💜' },
  { id: 'transgender', label: 'Transgender', emoji: '🏳️‍⚧️' },
  { id: 'metrosexual', label: 'Metrosexual', emoji: '💅' },
];

// Relationship Status Options
const RELATIONSHIP_OPTIONS = [
  { id: 'single', label: 'Single', emoji: '💔' },
  { id: 'couple', label: 'Couple', emoji: '💑' },
  { id: 'open', label: 'Open', emoji: '🔓' },
  { id: 'married', label: 'Married', emoji: '💍' },
  { id: 'monogamous', label: 'Monogamous', emoji: '❤️' },
  { id: 'poly', label: 'Poly', emoji: '💕' },
];

// Style & Attitude Options
const STYLE_OPTIONS = [
  { id: 'badass', label: 'Badass With A Good Ass', emoji: '🍑' },
  { id: 'bde', label: 'Big Dick Energy', emoji: '🍆' },
  { id: 'down-to-earth', label: 'Down To Earth', emoji: '🌍' },
  { id: 'southern', label: 'Southern', emoji: '🤠' },
  { id: 'masculine', label: 'Masculine', emoji: '💪' },
  { id: 'girl-bye', label: 'Girl Bye', emoji: '👋' },
  { id: 'cant-touch', label: "Can't Touch Dis", emoji: '🙅' },
  { id: 'cunty', label: 'Cunty', emoji: '👑' },
  { id: 'lover', label: 'Lover', emoji: '💋' },
  { id: 'fighter', label: 'Fighter', emoji: '👊' },
  { id: 'horny-boy', label: 'Horny Boy', emoji: '😈' },
  { id: 'bad-boy', label: 'Bad Boy', emoji: '🔥' },
  { id: 'good-boy', label: 'Good Boy', emoji: '😇' },
  { id: 'sex-demon', label: 'Sex Demon', emoji: '👹' },
  { id: 'sex-god', label: 'Sex God', emoji: '⚡' },
  { id: 'chill', label: 'Chill', emoji: '🧊' },
  { id: 'over-the-top', label: 'Over The Damn Top', emoji: '🚀' },
  { id: 'high-maintenance', label: 'High Maintenance', emoji: '💎' },
  { id: 'suck-my-dick', label: 'Just Suck My Dick', emoji: '🍆' },
  { id: 'shove-it-in', label: 'Shove It In Me', emoji: '🍑' },
  { id: 'bossy', label: 'Bossy', emoji: '🗣️' },
  { id: 'sub', label: 'Sub', emoji: '🪢' },
  { id: 'dom', label: 'Dom', emoji: '⛓️' },
  { id: 'better-than', label: 'Better Than', emoji: '💅' },
  { id: 'good-ol-boy', label: "Just A Good Ol' Boy", emoji: '🎸' },
];

// Explore/Cruising Filter Types
const EXPLORE_FILTERS = [
  { id: 'popular', label: 'Popular', icon: 'Heart', color: '#ef4444' },
  { id: 'featured', label: 'Featured Creators', icon: 'Medal', color: '#ffd700' },
  { id: 'active', label: 'More Active', icon: 'Zap', color: '#22c55e' },
  { id: 'new', label: 'New Creators', icon: 'Sparkles', color: '#3b82f6' },
  { id: 'free', label: 'Free Subscription', icon: 'Gift', color: '#a855f7' },
  { id: 'live', label: 'Live', icon: 'Radio', color: '#dc2626' },
];

// Interfaces
interface GloryPost {
  id: string;
  authorId: string;
  authorUsername: string;
  authorAvatar?: string;
  authorIsVerified: boolean;
  authorIsOnline: boolean;
  type: 'text' | 'photo' | 'video' | 'mood' | 'check_in' | 'repost';
  content: string;
  mediaUrls?: string[];
  mood?: string;
  moodEmoji?: string;
  location?: string;
  isPinned: boolean;
  throbCount: number;
  moanCount: number;
  passCount: number;
  myReaction?: string;
  reactions: { type: string; count: number }[];
  createdAt: string;
  // Repost/Quote Post fields (Twitter/X style)
  isRepost?: boolean;
  repostComment?: string;
  originalPost?: {
    id: string;
    authorId: string;
    authorUsername: string;
    authorAvatar?: string;
    authorIsVerified: boolean;
    content: string;
    mediaUrls?: string[];
    createdAt: string;
  };
}

interface StrokeReel {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  creatorIsVerified: boolean;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  soundName?: string;
  viewCount: number;
  throbCount: number;
  moanCount: number;
  isThrobbed: boolean;
  isInSpankBank: boolean;
  duration: number;
  createdAt: string;
}

interface Quickie {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  mediaUrl: string;
  mediaType: 'photo' | 'video';
  viewCount: number;
  expiresAt: string;
  isViewed: boolean;
}

interface FuckBuddy {
  id: string;
  username: string;
  avatar?: string;
  relationshipType: string;
  nickname?: string;
  connectionScore: number;
  isOnline: boolean;
  isTopEight: boolean;
  lastInteraction?: string;
}

interface SubscriptionTier {
  id: string;
  name: string;
  priceCents: number;
  benefits: string[];
  isPopular?: boolean;
  subscriberCount?: number;
}

// ========================================
// COMPONENTS
// ========================================

// Glory Hole Post (Wall Post)
const GloryPostCard = ({
  post,
  onReact,
  onMoan,
  onPassAround,
  isOwnPost = false
}: {
  post: GloryPost;
  onReact: (type: string) => void;
  onMoan: () => void;
  onPassAround: () => void;
  isOwnPost?: boolean;
}) => {
  const { toast } = useToast();
  const [showReactions, setShowReactions] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <motion.div
      className="rounded-lg mb-4 overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.95) 0%, rgba(10, 5, 8, 0.98) 100%)',
        border: post.isPinned
          ? '2px solid rgba(255, 215, 0, 0.4)'
          : '1px solid rgba(139, 0, 0, 0.3)',
        boxShadow: post.isPinned
          ? '0 0 20px rgba(255, 215, 0, 0.1)'
          : 'inset 0 0 30px rgba(139, 0, 0, 0.1)'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Pinned Badge */}
      {post.isPinned && (
        <div className="px-4 py-2 bg-gradient-to-r from-yellow-600/20 to-transparent border-b border-yellow-500/20">
          <span className="text-xs text-yellow-400 flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400" /> Pinned to {SEXY_LABELS.wall}
          </span>
        </div>
      )}

      {/* Repost Badge */}
      {post.isRepost && (
        <div className="px-4 py-2 bg-gradient-to-r from-slate-600/20 to-transparent border-b border-slate-500/20">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Share2 className="h-3 w-3" /> {post.authorUsername} passed this around
          </span>
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <Link href={`/profile/${post.authorId}`}>
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-red-900/50 cursor-pointer hover:ring-red-500/50 transition-all">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-red-900 to-black text-red-400">
                  {post.authorUsername[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {post.authorIsOnline && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-black" />
              )}
            </div>
          </Link>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link href={`/profile/${post.authorId}`}>
                <span className="font-bold text-gray-200 hover:text-red-400 cursor-pointer transition-colors">
                  {post.authorUsername}
                </span>
              </Link>
              {post.authorIsVerified && (
                <Badge
                  className="text-xs px-1.5 py-0"
                  style={{
                    background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                    border: 'none'
                  }}
                >
                  {SEXY_LABELS.verified}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>{timeAgo(post.createdAt)}</span>
              {post.mood && (
                <span className="text-yellow-400">
                  • {post.moodEmoji} {post.mood}
                </span>
              )}
              {post.location && (
                <span className="text-slate-400">
                  • <MapPin className="h-3 w-3 inline" /> {post.location}
                </span>
              )}
            </div>
          </div>

          <PostActionsMenu
            isOwnPost={isOwnPost}
            onCopyLink={() => {
              navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
              toast({ title: 'Link copied!' });
            }}
            onGoToPost={() => {
              toast({ title: 'Opening post...' });
            }}
            onPin={() => {
              toast({ title: post.isPinned ? 'Unpinned from profile' : 'Pinned to profile!' });
            }}
            onEdit={() => {
              toast({ title: 'Opening editor...' });
            }}
            onDelete={() => {
              toast({ title: 'Post deleted', variant: 'destructive' });
            }}
            onReport={() => {
              toast({ title: 'Report submitted' });
            }}
          />
        </div>

        {/* Content */}
        <div className="mb-3">
          {/* If this is a repost, show the reposter's comment first */}
          {post.isRepost && post.repostComment && (
            <p className="text-gray-300 whitespace-pre-wrap mb-3">
              {post.repostComment}
            </p>
          )}

          {/* Regular post content OR embedded original post for reposts */}
          {post.isRepost && post.originalPost ? (
            // Twitter/X Style Embedded Original Post
            <Link href={`/profile/${post.originalPost.authorId}`}>
              <motion.div
                className="rounded-lg p-4 cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(20, 10, 15, 0.4) 100%)',
                  border: '1px solid rgba(139, 0, 0, 0.3)'
                }}
                whileHover={{ borderColor: 'rgba(139, 0, 0, 0.6)' }}
              >
                {/* Original Author */}
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6 ring-1 ring-red-900/30">
                    <AvatarImage src={post.originalPost.authorAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-red-900 to-black text-red-400 text-xs">
                      {post.originalPost.authorUsername[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-semibold text-gray-300 text-sm">
                    {post.originalPost.authorUsername}
                  </span>
                  {post.originalPost.authorIsVerified && (
                    <Badge
                      className="text-[10px] px-1 py-0"
                      style={{
                        background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                        border: 'none'
                      }}
                    >
                      ✓
                    </Badge>
                  )}
                  <span className="text-xs text-gray-500">
                    • {timeAgo(post.originalPost.createdAt)}
                  </span>
                </div>

                {/* Original Content */}
                <p className="text-gray-400 text-sm line-clamp-3">
                  {post.originalPost.content}
                </p>

                {/* Original Media (if any) */}
                {post.originalPost.mediaUrls && post.originalPost.mediaUrls.length > 0 && (
                  <div className="mt-2 rounded overflow-hidden">
                    <img
                      src={post.originalPost.mediaUrls[0]}
                      alt=""
                      className="w-full h-24 object-cover opacity-70"
                    />
                    {post.originalPost.mediaUrls.length > 1 && (
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-xs text-gray-300">
                        +{post.originalPost.mediaUrls.length - 1}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </Link>
          ) : (
            // Regular post content
            <>
              <p className={`text-gray-300 whitespace-pre-wrap ${!expanded && post.content.length > 300 ? 'line-clamp-4' : ''}`}>
                {post.content}
              </p>
              {post.content.length > 300 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-red-400 text-sm mt-1 hover:underline"
                >
                  {expanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Media */}
        {post.mediaUrls && post.mediaUrls.length > 0 && (
          <div className="rounded-lg overflow-hidden mb-3">
            <div className={`grid gap-1 ${
              post.mediaUrls.length === 1 ? '' :
              post.mediaUrls.length === 2 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.mediaUrls.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className="relative aspect-square bg-black/50 cursor-pointer group"
                >
                  <img
                    src={url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  {post.mediaUrls!.length > 4 && idx === 3 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-2xl font-bold text-white">+{post.mediaUrls!.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reactions Summary */}
        <div className="flex items-center justify-between py-2 border-t border-red-900/30">
          <div className="flex items-center gap-1">
            {post.reactions.slice(0, 4).map((r, idx) => (
              <motion.span
                key={r.type}
                className="text-base"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {GLORY_REACTIONS.find(gr => gr.type === r.type)?.emoji}
              </motion.span>
            ))}
            {post.throbCount > 0 && (
              <span className="text-xs text-gray-400 ml-1">
                {post.throbCount.toLocaleString()} {SEXY_LABELS.likes}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{post.moanCount} {SEXY_LABELS.comments}</span>
            <span>{post.passCount} {SEXY_LABELS.share}s</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-red-900/30">
          {/* Throb Button with Reactions */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-400 hover:text-purple-400 ${post.myReaction ? 'text-purple-400' : ''}`}
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              onClick={() => onReact('throb')}
            >
              {post.myReaction ? (
                <span className="text-lg mr-1">
                  {GLORY_REACTIONS.find(r => r.type === post.myReaction)?.emoji}
                </span>
              ) : (
                <Heart className="h-4 w-4 mr-1" />
              )}
              {SEXY_LABELS.likes}
            </Button>

            {/* Reaction Picker */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  className="absolute bottom-full left-0 mb-2 p-2 rounded-full flex gap-1 z-50"
                  style={{
                    background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(40, 20, 30, 0.98) 100%)',
                    border: '1px solid rgba(139, 0, 0, 0.5)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
                  }}
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                >
                  {GLORY_REACTIONS.map((reaction, idx) => (
                    <motion.button
                      key={reaction.type}
                      onClick={() => {
                        onReact(reaction.type);
                        setShowReactions(false);
                      }}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                      title={reaction.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {reaction.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-pink-400"
            onClick={onMoan}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            {SEXY_LABELS.comments}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-slate-400"
            onClick={onPassAround}
          >
            <Share2 className="h-4 w-4 mr-1" />
            {SEXY_LABELS.share}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-yellow-400"
          >
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

// Stroke Reel Card (TikTok-style)
const StrokeReelCard = ({
  reel,
  isActive,
  onThrob,
  onMoan,
  onSpankBank
}: {
  reel: StrokeReel;
  isActive?: boolean;
  onThrob: () => void;
  onMoan: () => void;
  onSpankBank: () => void;
}) => {
  const [isMuted, setIsMuted] = useState(true);

  return (
    <motion.div
      className="relative aspect-[9/16] rounded-lg overflow-hidden cursor-pointer group"
      style={{
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%)',
      }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Thumbnail/Video */}
      <img
        src={reel.thumbnailUrl || '/placeholder-video.jpg'}
        alt=""
        className="w-full h-full object-cover"
      />

      {/* Play Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Play className="h-16 w-16 text-white/80 fill-white/80" />
        </motion.div>
      </div>

      {/* Duration Badge */}
      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-xs text-white">
        {Math.floor(reel.duration / 60)}:{(reel.duration % 60).toString().padStart(2, '0')}
      </div>

      {/* Creator Info */}
      <div className="absolute top-2 left-2 flex items-center gap-2">
        <Avatar className="h-8 w-8 ring-2 ring-white/30">
          <AvatarImage src={reel.creatorAvatar} />
          <AvatarFallback className="bg-red-900 text-white text-xs">
            {reel.creatorUsername[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-xs font-semibold text-white drop-shadow-lg">
            {reel.creatorUsername}
          </p>
          {reel.creatorIsVerified && (
            <Badge className="text-[10px] px-1 py-0 bg-purple-600">✓</Badge>
          )}
        </div>
      </div>

      {/* Right Side Actions (TikTok style) */}
      <div className="absolute right-2 bottom-20 flex flex-col items-center gap-4">
        <button
          onClick={(e) => { e.stopPropagation(); onThrob(); }}
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${reel.isThrobbed ? 'bg-red-500' : 'bg-black/50'}`}>
            <Heart className={`h-6 w-6 ${reel.isThrobbed ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-xs text-white mt-1">{reel.throbCount}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onMoan(); }}
          className="flex flex-col items-center"
        >
          <div className="p-2 rounded-full bg-black/50">
            <MessageCircle className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-white mt-1">{reel.moanCount}</span>
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onSpankBank(); }}
          className="flex flex-col items-center"
        >
          <div className={`p-2 rounded-full ${reel.isInSpankBank ? 'bg-yellow-500' : 'bg-black/50'}`}>
            <Bookmark className={`h-6 w-6 ${reel.isInSpankBank ? 'fill-white text-white' : 'text-white'}`} />
          </div>
          <span className="text-xs text-white mt-1">{SEXY_LABELS.saved}</span>
        </button>

        <button className="flex flex-col items-center">
          <div className="p-2 rounded-full bg-black/50">
            <Share2 className="h-6 w-6 text-white" />
          </div>
          <span className="text-xs text-white mt-1">Share</span>
        </button>
      </div>

      {/* Bottom Info */}
      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
        <p className="text-sm text-white mb-1 line-clamp-2">{reel.caption}</p>
        {reel.soundName && (
          <div className="flex items-center gap-1 text-xs text-gray-300">
            <Music className="h-3 w-3" />
            <span className="truncate">{reel.soundName}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
          <span><Eye className="h-3 w-3 inline" /> {reel.viewCount.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Quickie (Story) Circle
const QuickieCircle = ({
  quickie,
  onClick
}: {
  quickie: Quickie;
  onClick: () => void;
}) => {
  return (
    <motion.div
      className="flex flex-col items-center gap-1 cursor-pointer"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div
        className={`p-0.5 rounded-full ${
          quickie.isViewed
            ? 'bg-gray-600'
            : 'bg-gradient-to-br from-red-500 via-purple-500 to-pink-500'
        }`}
      >
        <div className="p-0.5 rounded-full bg-black">
          <Avatar className="h-16 w-16">
            <AvatarImage src={quickie.creatorAvatar} />
            <AvatarFallback className="bg-red-900 text-white">
              {quickie.creatorUsername[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      <span className="text-xs text-gray-400 truncate max-w-[70px]">
        {quickie.creatorUsername}
      </span>
    </motion.div>
  );
};

// Fuck Buddy Card (MySpace Top 8 style)
const FuckBuddyCard = ({
  buddy,
  rank,
  onMessage,
  onViewProfile
}: {
  buddy: FuckBuddy;
  rank?: number;
  onMessage: () => void;
  onViewProfile: () => void;
}) => {
  const relType = FUCK_BUDDY_TYPES.find(r => r.id === buddy.relationshipType);

  return (
    <motion.div
      className="relative p-4 rounded-lg text-center cursor-pointer group"
      style={{
        background: 'linear-gradient(135deg, rgba(30, 15, 25, 0.95) 0%, rgba(15, 8, 12, 0.98) 100%)',
        border: buddy.isTopEight
          ? '2px solid rgba(255, 215, 0, 0.4)'
          : '1px solid rgba(139, 0, 0, 0.3)',
        boxShadow: buddy.isTopEight
          ? '0 0 25px rgba(255, 215, 0, 0.15)'
          : 'inset 0 0 20px rgba(139, 0, 0, 0.1)'
      }}
      onClick={onViewProfile}
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Rank Badge */}
      {rank && (
        <motion.div
          className="absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black z-10"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 1) 0%, rgba(205, 127, 50, 1) 100%)',
            color: '#1a0a0a',
            boxShadow: '0 2px 10px rgba(255, 215, 0, 0.5)'
          }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', delay: rank * 0.05 }}
        >
          #{rank}
        </motion.div>
      )}

      {/* Online Indicator */}
      {buddy.isOnline && (
        <motion.div
          className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      {/* Avatar */}
      <Avatar className="h-20 w-20 mx-auto mb-3 ring-2 ring-red-900/50 group-hover:ring-red-500/50 transition-all">
        <AvatarImage src={buddy.avatar} />
        <AvatarFallback className="bg-gradient-to-br from-red-900 to-black text-red-400 text-xl">
          {buddy.username[0]?.toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Name */}
      <p className="font-bold text-gray-200 text-sm mb-1 group-hover:text-red-400 transition-colors">
        {buddy.nickname || buddy.username}
      </p>
      <p className="text-xs text-gray-500 mb-2">@{buddy.username}</p>

      {/* Relationship Badge */}
      <Badge
        className="text-xs mb-2"
        style={{
          background: `${relType?.color}20`,
          border: `1px solid ${relType?.color}50`,
          color: relType?.color
        }}
      >
        {relType?.emoji} {relType?.label}
      </Badge>

      {/* Connection Score */}
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        <Flame className="h-3 w-3 text-orange-500" />
        <span>{buddy.connectionScore}% connection</span>
      </div>

      {/* Quick Actions on Hover */}
      <motion.div
        className="absolute inset-x-2 bottom-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={false}
      >
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 h-7 text-xs bg-red-900/50 hover:bg-red-800/50 text-white"
          onClick={(e) => { e.stopPropagation(); onMessage(); }}
        >
          <MessageCircle className="h-3 w-3" />
        </Button>
      </motion.div>
    </motion.div>
  );
};

// Subscription Tier Card
const TierCard = ({
  tier,
  onSubscribe
}: {
  tier: SubscriptionTier;
  onSubscribe: () => void;
}) => {
  return (
    <motion.div
      className="relative p-6 rounded-lg overflow-hidden"
      style={{
        background: tier.isPopular
          ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(30, 15, 10, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(25, 15, 20, 0.95) 0%, rgba(15, 8, 12, 0.98) 100%)',
        border: tier.isPopular
          ? '2px solid rgba(255, 215, 0, 0.5)'
          : '1px solid rgba(139, 0, 0, 0.3)',
      }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      {/* Popular Badge */}
      {tier.isPopular && (
        <Badge
          className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 1) 0%, rgba(205, 127, 50, 1) 100%)',
            color: '#1a0a0a',
            border: 'none'
          }}
        >
          <Crown className="h-3 w-3 mr-1" /> MOST POPULAR
        </Badge>
      )}

      <h3
        className="text-2xl font-display text-center mb-2"
        style={{
          color: tier.isPopular ? '#ffd700' : '#ff4444',
          textShadow: tier.isPopular
            ? '0 0 20px rgba(255, 215, 0, 0.5)'
            : '0 0 15px rgba(255, 68, 68, 0.3)'
        }}
      >
        {tier.name}
      </h3>

      <p className="text-4xl font-black text-center text-white mb-1">
        ${(tier.priceCents / 100).toFixed(2)}
      </p>
      <p className="text-sm text-center text-gray-500 mb-4">/month</p>

      {tier.subscriberCount && (
        <p className="text-xs text-center text-gray-500 mb-4">
          {tier.subscriberCount.toLocaleString()} subscribers
        </p>
      )}

      <ul className="space-y-2 mb-6">
        {tier.benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
            <Check className="h-4 w-4 text-green-500" />
            {benefit}
          </li>
        ))}
      </ul>

      <Button
        onClick={onSubscribe}
        className="w-full font-bold"
        style={{
          background: tier.isPopular
            ? 'linear-gradient(135deg, rgba(255, 215, 0, 1) 0%, rgba(205, 127, 50, 1) 100%)'
            : 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
          color: tier.isPopular ? '#1a0a0a' : '#ffffff'
        }}
      >
        <Lock className="h-4 w-4 mr-2" />
        Get {SEXY_LABELS.subscriptions}
      </Button>
    </motion.div>
  );
};

// Send Tip Modal
const SendTipModal = ({
  isOpen,
  onClose,
  recipientName,
  onSend
}: {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  onSend: (amount: number, method: string) => void;
}) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'wallet'>('wallet');
  const walletBalance = 50.00; // Mock balance
  const taxRate = 0.06; // 6% WY tax
  const platformFee = 0.00; // 0% platform fee

  const amountNum = parseFloat(amount) || 0;
  const tax = amountNum * taxRate;
  const fee = amountNum * platformFee;
  const total = amountNum + tax + fee;

  const presetAmounts = [5, 10, 20, 50, 100];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(30, 15, 20, 0.98) 100%)',
          border: '2px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Send {SEXY_LABELS.tips} to {recipientName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Show your appreciation with a tip
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preset Amounts */}
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((preset) => (
              <Button
                key={preset}
                variant="outline"
                size="sm"
                className={`${amount === String(preset) ? 'bg-red-900/50 border-red-500' : 'border-red-900/50'} text-gray-300`}
                onClick={() => setAmount(String(preset))}
              >
                ${preset}
              </Button>
            ))}
          </div>

          {/* Custom Amount */}
          <div>
            <Label className="text-gray-400">Amount (USD)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-9 bg-black/50 border-red-900/30 text-white"
                min="1"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-gray-400">Payment Method</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className={`${paymentMethod === 'card' ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} justify-start`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Debit/Credit
              </Button>
              <Button
                variant="outline"
                className={`${paymentMethod === 'wallet' ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} justify-start`}
                onClick={() => setPaymentMethod('wallet')}
              >
                <Wallet className="h-4 w-4 mr-2" />
                Wallet (${walletBalance.toFixed(2)})
              </Button>
            </div>
          </div>

          {/* Fee Breakdown */}
          {amountNum > 0 && (
            <div
              className="p-3 rounded-lg space-y-2 text-sm"
              style={{ background: 'rgba(0, 0, 0, 0.5)', border: '1px solid rgba(139, 0, 0, 0.3)' }}
            >
              <div className="flex justify-between text-gray-400">
                <span>Amount</span>
                <span>${amountNum.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>WY Tax (6%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Platform Fee (0%)</span>
                <span>${fee.toFixed(2)}</span>
              </div>
              <Separator className="bg-red-900/30" />
              <div className="flex justify-between text-white font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            disabled={amountNum < 1 || (paymentMethod === 'wallet' && total > walletBalance)}
            onClick={() => onSend(amountNum, paymentMethod)}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
            }}
          >
            <Send className="h-4 w-4 mr-2" />
            Send ${total.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Send Gift Modal
const SendGiftModal = ({
  isOpen,
  onClose,
  recipientName,
  onSend
}: {
  isOpen: boolean;
  onClose: () => void;
  recipientName: string;
  onSend: (giftId: string) => void;
}) => {
  const [selectedGift, setSelectedGift] = useState<string | null>(null);
  const walletBalance = 50.00;

  const gifts = [
    { id: 'rose', emoji: '🌹', name: 'Rose', price: 1.00 },
    { id: 'kiss', emoji: '💋', name: 'Kiss', price: 2.00 },
    { id: 'fire', emoji: '🔥', name: 'Fire', price: 5.00 },
    { id: 'diamond', emoji: '💎', name: 'Diamond', price: 10.00 },
    { id: 'crown', emoji: '👑', name: 'Crown', price: 25.00 },
    { id: 'rocket', emoji: '🚀', name: 'Rocket', price: 50.00 },
    { id: 'eggplant', emoji: '🍆', name: 'Eggplant', price: 5.30 },
    { id: 'peach', emoji: '🍑', name: 'Peach', price: 5.30 },
  ];

  const selectedGiftData = gifts.find(g => g.id === selectedGift);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(30, 15, 20, 0.98) 100%)',
          border: '2px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-pink-400 flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Send Gift to {recipientName}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a virtual gift (uses wallet balance: ${walletBalance.toFixed(2)})
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-3 py-4">
          {gifts.map((gift) => (
            <motion.button
              key={gift.id}
              onClick={() => setSelectedGift(gift.id)}
              className={`p-3 rounded-lg flex flex-col items-center gap-1 ${
                selectedGift === gift.id ? 'ring-2 ring-pink-500' : ''
              }`}
              style={{
                background: selectedGift === gift.id
                  ? 'rgba(236, 72, 153, 0.2)'
                  : 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(139, 0, 0, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-3xl">{gift.emoji}</span>
              <span className="text-xs text-gray-400">{gift.name}</span>
              <span className="text-xs text-yellow-400">${gift.price.toFixed(2)}</span>
            </motion.button>
          ))}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            disabled={!selectedGift || (selectedGiftData && selectedGiftData.price > walletBalance)}
            onClick={() => selectedGift && onSend(selectedGift)}
            style={{
              background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9) 0%, rgba(168, 85, 247, 0.9) 100%)',
            }}
          >
            <Gift className="h-4 w-4 mr-2" />
            Send {selectedGiftData?.emoji} ${selectedGiftData?.price.toFixed(2)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Live Stream Setup Modal
const LiveStreamModal = ({
  isOpen,
  onClose,
  onStart
}: {
  isOpen: boolean;
  onClose: () => void;
  onStart: (name: string, visibility: string, price: number) => void;
}) => {
  const [streamName, setStreamName] = useState('');
  const [visibility, setVisibility] = useState('everyone_free');
  const [price, setPrice] = useState('5');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(30, 15, 20, 0.98) 100%)',
          border: '2px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-red-400 flex items-center gap-2">
            <Radio className="h-5 w-5" />
            Create {SEXY_LABELS.live}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Start a live stream for your admirers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-400">Stream Name</Label>
            <div className="relative">
              <Zap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-yellow-500" />
              <Input
                value={streamName}
                onChange={(e) => setStreamName(e.target.value)}
                placeholder="What's tonight's show?"
                className="pl-9 bg-black/50 border-red-900/30 text-white"
              />
            </div>
          </div>

          <div>
            <Label className="text-gray-400">Visibility</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-black border-red-900/50">
                <SelectItem value="everyone_free">Free for everyone</SelectItem>
                <SelectItem value="free_paid_subscribers">Free for subscribers</SelectItem>
                <SelectItem value="all_pay">Everyone pays</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {visibility === 'all_pay' && (
            <div>
              <Label className="text-gray-400">Price (min $5)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="pl-9 bg-black/50 border-red-900/30 text-white"
                  min="5"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">All users must pay to access</p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-600/30">
            <p className="text-xs text-yellow-400 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Free streaming limited to 30 minutes
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            disabled={!streamName.trim()}
            onClick={() => onStart(streamName, visibility, parseFloat(price) || 5)}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
            }}
          >
            <Radio className="h-4 w-4 mr-2" />
            Go Live
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Schedule Post Modal
const SchedulePostModal = ({
  isOpen,
  onClose,
  onSchedule
}: {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (datetime: string) => void;
}) => {
  const [datetime, setDatetime] = useState('');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(30, 15, 20, 0.98) 100%)',
          border: '2px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-400 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Post
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-gray-400">Date & Time</Label>
            <Input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="bg-black/50 border-red-900/30 text-white"
            />
          </div>
          <p className="text-xs text-gray-500">
            Posts are scheduled based on server time. Server timezone: UTC
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            disabled={!datetime}
            onClick={() => onSchedule(datetime)}
            className="bg-slate-600 hover:bg-slate-700"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========================================
// PROFILE EDITOR MODAL - Comprehensive Controls
// ========================================
const ProfileEditorModal = ({
  isOpen,
  onClose,
  profile,
  onSave
}: {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onSave: (data: any) => void;
}) => {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('basic');

  // Form states
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [orientation, setOrientation] = useState(profile?.orientation || '');
  const [relationshipStatus, setRelationshipStatus] = useState(profile?.relationshipStatus || '');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(profile?.styles || []);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(profile?.categories || []);

  // Privacy settings
  const [showOnline, setShowOnline] = useState(profile?.showOnline ?? true);
  const [showLastSeen, setShowLastSeen] = useState(profile?.showLastSeen ?? true);
  const [allowMessages, setAllowMessages] = useState(profile?.allowMessages ?? true);
  const [allowBuddyRequests, setAllowBuddyRequests] = useState(profile?.allowBuddyRequests ?? true);
  const [nsfw, setNsfw] = useState(profile?.nsfw ?? false);

  // Content settings
  const [subscriptionPrice, setSubscriptionPrice] = useState(profile?.subscriptionPrice || '9.99');
  const [freeTrialDays, setFreeTrialDays] = useState(profile?.freeTrialDays || '0');
  const [messagePrice, setMessagePrice] = useState(profile?.messagePrice || '0');
  const [welcomeMessage, setWelcomeMessage] = useState(profile?.welcomeMessage || '');

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: <Edit3 className="h-4 w-4" /> },
    { id: 'identity', label: 'Identity', icon: <Heart className="h-4 w-4" /> },
    { id: 'style', label: 'Style & Vibe', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'categories', label: 'Categories', icon: <Filter className="h-4 w-4" /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock className="h-4 w-4" /> },
    { id: 'monetization', label: 'Monetization', icon: <DollarSign className="h-4 w-4" /> },
    { id: 'media', label: 'Photos/Videos', icon: <Camera className="h-4 w-4" /> },
  ];

  const handleSave = () => {
    onSave({
      displayName,
      bio,
      location,
      website,
      orientation,
      relationshipStatus,
      styles: selectedStyles,
      categories: selectedCategories,
      showOnline,
      showLastSeen,
      allowMessages,
      allowBuddyRequests,
      nsfw,
      subscriptionPrice: parseFloat(subscriptionPrice),
      freeTrialDays: parseInt(freeTrialDays),
      messagePrice: parseFloat(messagePrice),
      welcomeMessage,
    });
    toast({ title: '✅ Profile Updated', description: 'Your changes have been saved' });
    onClose();
  };

  const toggleStyle = (styleId: string) => {
    setSelectedStyles(prev =>
      prev.includes(styleId)
        ? prev.filter(s => s !== styleId)
        : [...prev, styleId]
    );
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId)
        ? prev.filter(c => c !== catId)
        : [...prev, catId]
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-hidden p-0"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 8, 12, 0.98) 0%, rgba(25, 12, 18, 0.98) 100%)',
          border: '2px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl text-red-400 flex items-center gap-3">
            <Settings className="h-6 w-6" />
            Profile Settings
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Customize your BoyFanz profile - make it yours
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Sidebar Navigation */}
          <div className="w-48 border-r border-red-900/30 p-4">
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                    activeSection === section.id
                      ? 'bg-red-900/50 text-red-400 border border-red-700/50'
                      : 'text-gray-400 hover:text-gray-300 hover:bg-red-900/20'
                  }`}
                >
                  {section.icon}
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info */}
            {activeSection === 'basic' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Basic Information</h3>

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-400">Display Name</Label>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                      className="bg-black/50 border-red-900/30 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-400">Bio</Label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell people about yourself... be naughty 😈"
                      className="bg-black/50 border-red-900/30 text-white mt-1 min-h-[100px]"
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">{bio.length}/500</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Location</Label>
                      <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="City, State"
                          className="pl-9 bg-black/50 border-red-900/30 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-gray-400">Website</Label>
                      <div className="relative mt-1">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://..."
                          className="pl-9 bg-black/50 border-red-900/30 text-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Identity */}
            {activeSection === 'identity' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Identity</h3>

                <div>
                  <Label className="text-gray-400 mb-3 block">Sexual Orientation</Label>
                  <div className="flex flex-wrap gap-2">
                    {ORIENTATION_OPTIONS.map((opt) => (
                      <Button
                        key={opt.id}
                        variant="outline"
                        size="sm"
                        className={`${orientation === opt.id ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} text-gray-300`}
                        onClick={() => setOrientation(opt.id)}
                      >
                        {opt.emoji} {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400 mb-3 block">Relationship Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {RELATIONSHIP_OPTIONS.map((opt) => (
                      <Button
                        key={opt.id}
                        variant="outline"
                        size="sm"
                        className={`${relationshipStatus === opt.id ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} text-gray-300`}
                        onClick={() => setRelationshipStatus(opt.id)}
                      >
                        {opt.emoji} {opt.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Style & Vibe */}
            {activeSection === 'style' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Style & Attitude</h3>
                <p className="text-gray-400 text-sm mb-4">Select all that apply to your vibe</p>

                <div className="flex flex-wrap gap-2">
                  {STYLE_OPTIONS.map((style) => (
                    <Button
                      key={style.id}
                      variant="outline"
                      size="sm"
                      className={`${selectedStyles.includes(style.id) ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} text-gray-300`}
                      onClick={() => toggleStyle(style.id)}
                    >
                      {style.emoji} {style.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {activeSection === 'categories' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Content Categories</h3>
                <p className="text-gray-400 text-sm mb-4">What type of content do you create?</p>

                <div className="flex flex-wrap gap-2">
                  {CREATOR_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.id}
                      variant="outline"
                      size="sm"
                      className={`${selectedCategories.includes(cat.id) ? 'bg-red-900/50 border-red-500' : 'border-red-900/30'} text-gray-300`}
                      style={{
                        borderColor: selectedCategories.includes(cat.id) ? cat.color : undefined
                      }}
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {cat.emoji} {cat.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Privacy Settings</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-red-900/20">
                    <div>
                      <p className="text-white font-medium">Show Online Status</p>
                      <p className="text-gray-500 text-sm">Let others see when you're online</p>
                    </div>
                    <Switch checked={showOnline} onCheckedChange={setShowOnline} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-red-900/20">
                    <div>
                      <p className="text-white font-medium">Show Last Seen</p>
                      <p className="text-gray-500 text-sm">Display when you were last active</p>
                    </div>
                    <Switch checked={showLastSeen} onCheckedChange={setShowLastSeen} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-red-900/20">
                    <div>
                      <p className="text-white font-medium">Allow Direct Messages</p>
                      <p className="text-gray-500 text-sm">Let people slide into your DMs</p>
                    </div>
                    <Switch checked={allowMessages} onCheckedChange={setAllowMessages} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-red-900/20">
                    <div>
                      <p className="text-white font-medium">Allow {SEXY_LABELS.friends} Requests</p>
                      <p className="text-gray-500 text-sm">Let people request to be your fuck buddy</p>
                    </div>
                    <Switch checked={allowBuddyRequests} onCheckedChange={setAllowBuddyRequests} />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg bg-black/30 border border-red-900/20">
                    <div>
                      <p className="text-white font-medium">🔞 NSFW Profile</p>
                      <p className="text-gray-500 text-sm">Mark profile as explicit content</p>
                    </div>
                    <Switch checked={nsfw} onCheckedChange={setNsfw} />
                  </div>
                </div>
              </div>
            )}

            {/* Monetization */}
            {activeSection === 'monetization' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Monetization</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-400">Monthly Subscription ($)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        type="number"
                        value={subscriptionPrice}
                        onChange={(e) => setSubscriptionPrice(e.target.value)}
                        placeholder="9.99"
                        className="pl-9 bg-black/50 border-red-900/30 text-white"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-400">Free Trial Days</Label>
                    <Input
                      type="number"
                      value={freeTrialDays}
                      onChange={(e) => setFreeTrialDays(e.target.value)}
                      placeholder="0"
                      className="bg-black/50 border-red-900/30 text-white mt-1"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Message Price ($)</Label>
                  <p className="text-gray-500 text-xs mb-1">Charge for DMs (0 = free)</p>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      value={messagePrice}
                      onChange={(e) => setMessagePrice(e.target.value)}
                      placeholder="0"
                      className="pl-9 bg-black/50 border-red-900/30 text-white"
                      min="0"
                      step="0.50"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-400">Welcome Message</Label>
                  <p className="text-gray-500 text-xs mb-1">Auto-sent to new subscribers</p>
                  <Textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    placeholder="Hey there sexy, thanks for subscribing! 😈🔥"
                    className="bg-black/50 border-red-900/30 text-white min-h-[80px]"
                    maxLength={300}
                  />
                </div>
              </div>
            )}

            {/* Media */}
            {activeSection === 'media' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-white mb-4">Profile Media</h3>

                {/* Profile Picture */}
                <div>
                  <Label className="text-gray-400 mb-3 block">Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-24 w-24 ring-2 ring-red-900/50">
                      <AvatarImage src={profile?.profileImageUrl || DEFAULT_PROFILE_IMAGE} />
                      <AvatarFallback className="bg-red-900">
                        <img src={DEFAULT_PROFILE_IMAGE} alt="" className="w-full h-full object-contain p-2" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-2">
                      <Button variant="outline" className="border-red-900/50 text-red-400 hover:bg-red-900/20">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <p className="text-gray-500 text-xs">JPG, PNG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                {/* Banner Image */}
                <div>
                  <Label className="text-gray-400 mb-3 block">Banner Image</Label>
                  <div
                    className="relative h-32 rounded-lg overflow-hidden cursor-pointer group"
                    style={{ background: 'rgba(0, 0, 0, 0.5)' }}
                  >
                    <img
                      src={profile?.bannerImageUrl || DEFAULT_BANNER_IMAGE}
                      alt="Banner"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="outline" className="border-white/30 text-white">
                        <Camera className="h-4 w-4 mr-2" />
                        Change Banner
                      </Button>
                    </div>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">Recommended: 1500x500 pixels</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 border-t border-red-900/30">
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ========================================
// REPOST MODAL - Twitter/X Style Quote Post
// ========================================
const RepostModal = ({
  isOpen,
  onClose,
  post,
  onRepost
}: {
  isOpen: boolean;
  onClose: () => void;
  post: GloryPost | null;
  onRepost: (comment: string) => void;
}) => {
  const [comment, setComment] = useState('');
  const { toast } = useToast();

  if (!post) return null;

  const handleRepost = () => {
    onRepost(comment);
    setComment('');
    onClose();
    toast({
      title: '🔄 Passed Around!',
      description: comment ? 'Your quote post has been shared' : 'Post has been reposted to your wall'
    });
  };

  const timeAgo = (date: string) => {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 8, 12, 0.98) 0%, rgba(20, 10, 15, 0.98) 100%)',
          border: '1px solid rgba(139, 0, 0, 0.5)',
          boxShadow: '0 0 50px rgba(139, 0, 0, 0.3)'
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-red-400 flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            {SEXY_LABELS.share} Post
          </DialogTitle>
          <DialogDescription className="text-gray-500">
            Add your own comment or just repost to share with your admirers
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Optional Comment Input */}
          <div className="space-y-2">
            <Label className="text-gray-400">Add your thoughts (optional)</Label>
            <Textarea
              placeholder="What's on your mind about this post..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="bg-black/50 border-red-900/30 text-white resize-none h-20"
              maxLength={500}
            />
            <p className="text-xs text-gray-600 text-right">{comment.length}/500</p>
          </div>

          {/* Embedded Original Post Preview (Twitter/X Style) */}
          <div
            className="rounded-lg p-4 border"
            style={{
              background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.5) 0%, rgba(20, 10, 15, 0.5) 100%)',
              border: '1px solid rgba(139, 0, 0, 0.3)'
            }}
          >
            {/* Original Author Header */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-10 w-10 ring-2 ring-red-900/30">
                <AvatarImage src={post.authorAvatar} />
                <AvatarFallback className="bg-gradient-to-br from-red-900 to-black text-red-400 text-sm">
                  {post.authorUsername[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-200 truncate">
                    {post.authorUsername}
                  </span>
                  {post.authorIsVerified && (
                    <Badge
                      className="text-[10px] px-1 py-0"
                      style={{
                        background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                        border: 'none'
                      }}
                    >
                      ✓
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-gray-500">{timeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Original Content */}
            <p className="text-gray-300 text-sm line-clamp-4 mb-2">
              {post.content}
            </p>

            {/* Original Media Preview */}
            {post.mediaUrls && post.mediaUrls.length > 0 && (
              <div className="rounded overflow-hidden mt-2">
                <img
                  src={post.mediaUrls[0]}
                  alt=""
                  className="w-full h-32 object-cover opacity-80"
                />
                {post.mediaUrls.length > 1 && (
                  <div className="bg-black/60 text-center py-1 text-xs text-gray-400">
                    +{post.mediaUrls.length - 1} more
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Repost Options */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 border-gray-700 text-gray-400 hover:bg-gray-800/50"
              onClick={handleRepost}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Repost
            </Button>
            <Button
              className="flex-1"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
              }}
              onClick={handleRepost}
              disabled={!comment.trim()}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Quote Post
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Post Actions Menu Component
const PostActionsMenu = ({
  isOwnPost,
  onCopyLink,
  onGoToPost,
  onPin,
  onEdit,
  onDelete,
  onReport
}: {
  isOwnPost: boolean;
  onCopyLink: () => void;
  onGoToPost: () => void;
  onPin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-300">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48"
        style={{
          background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.98) 0%, rgba(30, 15, 20, 0.98) 100%)',
          border: '1px solid rgba(139, 0, 0, 0.5)',
        }}
      >
        <DropdownMenuItem onClick={onCopyLink} className="text-gray-300 focus:text-white focus:bg-red-900/50">
          <Copy className="h-4 w-4 mr-2" />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onGoToPost} className="text-gray-300 focus:text-white focus:bg-red-900/50">
          <ExternalLink className="h-4 w-4 mr-2" />
          Go to post
        </DropdownMenuItem>

        {isOwnPost ? (
          <>
            <DropdownMenuSeparator className="bg-red-900/30" />
            <DropdownMenuItem onClick={onPin} className="text-gray-300 focus:text-white focus:bg-red-900/50">
              <Pin className="h-4 w-4 mr-2" />
              Pin to profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit} className="text-gray-300 focus:text-white focus:bg-red-900/50">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit post
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-red-400 focus:text-red-300 focus:bg-red-900/50">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete post
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuSeparator className="bg-red-900/30" />
            <DropdownMenuItem onClick={onReport} className="text-yellow-400 focus:text-yellow-300 focus:bg-red-900/50">
              <Flag className="h-4 w-4 mr-2" />
              Report
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Enhanced Post Composer
const EnhancedPostComposer = ({
  profile,
  onPost
}: {
  profile: any;
  onPost: (data: any) => void;
}) => {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isLocked, setIsLocked] = useState(false);
  const [ppvPrice, setPpvPrice] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [showPricing, setShowPricing] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showCostar, setShowCostar] = useState(false);
  const [costarInput, setCostarInput] = useState('');
  const [showLiveModal, setShowLiveModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handlePost = () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    onPost({
      content,
      isLocked,
      price: ppvPrice ? parseFloat(ppvPrice) : null,
      title: postTitle || null,
      costar: costarInput || null,
      files: selectedFiles
    });

    // Reset
    setContent('');
    setIsLocked(false);
    setPpvPrice('');
    setPostTitle('');
    setCostarInput('');
    setShowPricing(false);
    setShowTitle(false);
    setShowCostar(false);
    setSelectedFiles([]);

    toast({ title: 'Posted to ' + SEXY_LABELS.wall + '! 🔥' });
  };

  return (
    <motion.div
      className="p-4 rounded-lg mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(25, 12, 18, 0.95) 0%, rgba(12, 6, 10, 0.98) 100%)',
        border: '1px solid rgba(139, 0, 0, 0.3)',
      }}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-red-900/50">
          <AvatarImage src={profile?.profileImageUrl || DEFAULT_PROFILE_IMAGE} />
          <AvatarFallback className="bg-red-900">
            <img src={DEFAULT_PROFILE_IMAGE} alt="" className="w-full h-full object-contain p-1" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          {/* Title Input (Optional) */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value.slice(0, 100))}
                    placeholder="Add a title (max 100 chars)"
                    className="pl-9 bg-black/50 border-red-900/30 text-white text-sm"
                    maxLength={100}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    {postTitle.length}/100
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content */}
          <Textarea
            placeholder="What's on your dirty mind? Share with your admirers..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="bg-black/50 border-red-900/30 text-gray-200 min-h-[80px] focus:border-red-500 resize-none"
          />
          <span className="text-xs text-gray-500 block text-right">{content.length}/5000</span>

          {/* Costar Tagging */}
          <AnimatePresence>
            {showCostar && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 rounded-lg bg-purple-900/20 border border-purple-600/30"
              >
                <p className="text-sm text-purple-400 mb-2">Do you have a costar?</p>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <Input
                    value={costarInput}
                    onChange={(e) => setCostarInput(e.target.value)}
                    placeholder="Type their username..."
                    className="pl-9 bg-black/50 border-purple-600/30 text-white text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Only verified creators can be tagged as costars
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* PPV Pricing */}
          <AnimatePresence>
            {showPricing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                  <Input
                    type="number"
                    value={ppvPrice}
                    onChange={(e) => setPpvPrice(e.target.value)}
                    placeholder="Set PPV price..."
                    className="pl-9 bg-black/50 border-green-600/30 text-white text-sm"
                    min="1"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setPpvPrice(''); setShowPricing(false); }}
                  className="text-gray-500 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Locked Content Toggle */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-black/30">
            <div className="flex items-center gap-2">
              <Lock className={`h-4 w-4 ${isLocked ? 'text-yellow-400' : 'text-gray-500'}`} />
              <span className="text-sm text-gray-400">Subscribers Only</span>
            </div>
            <Switch
              checked={isLocked}
              onCheckedChange={setIsLocked}
              className="data-[state=checked]:bg-yellow-600"
            />
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex gap-1 flex-wrap">
              <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 hover:bg-pink-900/20">
                <Camera className="h-4 w-4 mr-1" /> Photo
              </Button>
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20">
                <Video className="h-4 w-4 mr-1" /> Video
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${showPricing ? 'text-green-400' : 'text-gray-400'} hover:text-green-300 hover:bg-green-900/20`}
                onClick={() => setShowPricing(!showPricing)}
              >
                <DollarSign className="h-4 w-4 mr-1" /> PPV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                onClick={() => setShowLiveModal(true)}
              >
                <Radio className="h-4 w-4 mr-1" /> Live
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-cyan-300 hover:bg-cyan-900/20"
                onClick={() => setShowScheduleModal(true)}
              >
                <Calendar className="h-4 w-4 mr-1" /> Schedule
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${showTitle ? 'text-orange-400' : 'text-gray-400'} hover:text-orange-300 hover:bg-orange-900/20`}
                onClick={() => setShowTitle(!showTitle)}
              >
                <Type className="h-4 w-4 mr-1" /> Title
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`${showCostar ? 'text-purple-400' : 'text-gray-400'} hover:text-purple-300 hover:bg-purple-900/20`}
                onClick={() => setShowCostar(!showCostar)}
              >
                <AtSign className="h-4 w-4 mr-1" /> Costar
              </Button>
            </div>
            <Button
              size="sm"
              className="font-bold"
              style={{
                background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
              }}
              disabled={!content.trim() && selectedFiles.length === 0}
              onClick={handlePost}
            >
              <Send className="h-4 w-4 mr-2" />
              Post
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LiveStreamModal
        isOpen={showLiveModal}
        onClose={() => setShowLiveModal(false)}
        onStart={(name, visibility, price) => {
          toast({ title: `Going live: ${name}` });
          setShowLiveModal(false);
        }}
      />
      <SchedulePostModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSchedule={(datetime) => {
          toast({ title: `Post scheduled for ${datetime}` });
          setShowScheduleModal(false);
        }}
      />
    </motion.div>
  );
};

// Category Filter Bar for Cruising
const CategoryFilterBar = ({
  selectedCategory,
  onSelectCategory,
  selectedFilter,
  onSelectFilter
}: {
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  selectedFilter: string;
  onSelectFilter: (id: string) => void;
}) => {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4 mb-6">
      {/* Main Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {EXPLORE_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            variant="outline"
            size="sm"
            className={`${selectedFilter === filter.id ? 'ring-2' : ''}`}
            style={{
              borderColor: filter.color + '60',
              color: selectedFilter === filter.id ? filter.color : '#9ca3af',
              background: selectedFilter === filter.id ? filter.color + '20' : 'transparent',
              ringColor: filter.color
            }}
            onClick={() => onSelectFilter(filter.id)}
          >
            {filter.id === 'popular' && <Heart className="h-3 w-3 mr-1" />}
            {filter.id === 'featured' && <Medal className="h-3 w-3 mr-1" />}
            {filter.id === 'active' && <Zap className="h-3 w-3 mr-1" />}
            {filter.id === 'new' && <Sparkles className="h-3 w-3 mr-1" />}
            {filter.id === 'free' && <Gift className="h-3 w-3 mr-1" />}
            {filter.id === 'live' && <Radio className="h-3 w-3 mr-1" />}
            {filter.label}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="border-purple-600/50 text-purple-400 hover:bg-purple-900/20"
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal className="h-3 w-3 mr-1" />
          Filters
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="p-4 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.95) 0%, rgba(30, 15, 20, 0.95) 100%)',
              border: '1px solid rgba(139, 0, 0, 0.3)',
            }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label className="text-gray-400 text-sm">Gender</Label>
                <Select>
                  <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                    <SelectValue placeholder="All genders" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/50">
                    <SelectItem value="all">All genders</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="nonbinary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Orientation</Label>
                <Select>
                  <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/50">
                    {ORIENTATION_OPTIONS.map(o => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.emoji} {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Relationship</Label>
                <Select>
                  <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/50">
                    {RELATIONSHIP_OPTIONS.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.emoji} {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-400 text-sm">Age Range</Label>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Min" className="bg-black/50 border-red-900/30 text-white" min="18" />
                  <Input type="number" placeholder="Max" className="bg-black/50 border-red-900/30 text-white" />
                </div>
              </div>
              <div>
                <Label className="text-gray-400 text-sm">Style & Attitude</Label>
                <Select>
                  <SelectTrigger className="bg-black/50 border-red-900/30 text-white">
                    <SelectValue placeholder="Any style" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-red-900/50 max-h-[200px]">
                    {STYLE_OPTIONS.map(s => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.emoji} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          className={`rounded-full ${!selectedCategory ? 'bg-red-900/50 text-red-400' : 'text-gray-400'}`}
          onClick={() => onSelectCategory(null)}
        >
          All
        </Button>
        {CREATOR_CATEGORIES.map((cat) => (
          <Button
            key={cat.id}
            variant="ghost"
            size="sm"
            className={`rounded-full ${selectedCategory === cat.id ? 'ring-1' : ''}`}
            style={{
              background: selectedCategory === cat.id ? cat.color + '30' : 'transparent',
              color: selectedCategory === cat.id ? cat.color : '#9ca3af',
              ringColor: cat.color
            }}
            onClick={() => onSelectCategory(cat.id)}
          >
            {cat.emoji} {cat.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

// ========================================
// MAIN COMPONENT
// ========================================
export default function SocialProfile() {
  const [, params] = useRoute('/profile/:userId');
  const userId = params?.userId;
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('funroom');
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<typeof MOOD_OPTIONS[0] | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);

  // Modal States
  const [showTipModal, setShowTipModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showRepostModal, setShowRepostModal] = useState(false);
  const [repostingPost, setRepostingPost] = useState<GloryPost | null>(null);

  // Cruising Tab States
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('popular');

  const isOwnProfile = currentUser?.id === userId;

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users', userId],
    enabled: !!userId,
  });

  // Fetch glory hole posts (wall)
  const { data: gloryPosts = [] } = useQuery<GloryPost[]>({
    queryKey: ['/api/glory-posts', userId],
    enabled: !!userId && activeTab === 'glory',
  });

  // Fetch stroke reels
  const { data: strokeReels = [] } = useQuery<StrokeReel[]>({
    queryKey: ['/api/stroke-reels', userId],
    enabled: !!userId && activeTab === 'reels',
  });

  // Fetch quickies (stories)
  const { data: quickies = [] } = useQuery<Quickie[]>({
    queryKey: ['/api/quickies', userId],
    enabled: !!userId,
  });

  // Fetch fuck buddies
  const { data: fuckBuddies = [] } = useQuery<FuckBuddy[]>({
    queryKey: ['/api/fuck-buddies', userId],
    enabled: !!userId && activeTab === 'buddies',
  });

  // Fetch subscription tiers
  const { data: tiers = [] } = useQuery<SubscriptionTier[]>({
    queryKey: ['/api/subscription-tiers', userId],
    enabled: !!userId && activeTab === 'vip',
  });

  // Mock data for demo
  const mockQuickies: Quickie[] = [
    { id: '1', creatorId: userId || '', creatorUsername: 'Me', creatorAvatar: profile?.profileImageUrl, mediaUrl: '', mediaType: 'photo', viewCount: 0, expiresAt: '', isViewed: false },
  ];

  const mockTiers: SubscriptionTier[] = [
    { id: '1', name: 'Bronze', priceCents: 999, benefits: ['Access to feed', 'DM access', 'Weekly updates'], subscriberCount: 142 },
    { id: '2', name: 'Silver', priceCents: 1999, benefits: ['All Bronze perks', 'Exclusive photos', 'Behind the scenes', 'Priority replies'], isPopular: true, subscriberCount: 89 },
    { id: '3', name: 'Gold', priceCents: 4999, benefits: ['All Silver perks', 'Custom content requests', 'Video calls', 'Early access', 'Personal shoutouts'], subscriberCount: 23 },
  ];

  const mockFuckBuddies: FuckBuddy[] = [
    { id: '1', username: 'HotDaddy69', relationshipType: 'daddy', connectionScore: 95, isOnline: true, isTopEight: true },
    { id: '2', username: 'MuscleJock', relationshipType: 'fuck_buddy', connectionScore: 88, isOnline: false, isTopEight: true },
    { id: '3', username: 'CuteOtter', relationshipType: 'fwb', connectionScore: 82, isOnline: true, isTopEight: true },
    { id: '4', username: 'BearHugger', relationshipType: 'playmate', connectionScore: 79, isOnline: false, isTopEight: true },
    { id: '5', username: 'TwinkBoy', relationshipType: 'boy', connectionScore: 76, isOnline: true, isTopEight: true },
    { id: '6', username: 'LeatherDom', relationshipType: 'master', connectionScore: 71, isOnline: false, isTopEight: true },
    { id: '7', username: 'Vers4Fun', relationshipType: 'lover', connectionScore: 68, isOnline: true, isTopEight: true },
    { id: '8', username: 'GymRat', relationshipType: 'crush', connectionScore: 65, isOnline: false, isTopEight: true },
  ];

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(180deg, #0a0508 0%, #150a10 100%)' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <DoorOpen className="h-16 w-16 text-red-500" />
        </motion.div>
        <span className="ml-4 text-red-400 text-lg">Entering {SEXY_LABELS.profile}...</span>
      </div>
    );
  }

  const topEightBuddies = (fuckBuddies.length > 0 ? fuckBuddies : mockFuckBuddies).filter(b => b.isTopEight).slice(0, 8);
  const displayTiers = tiers.length > 0 ? tiers : mockTiers;
  const displayQuickies = quickies.length > 0 ? quickies : mockQuickies;

  return (
    <div
      className="social-profile min-h-screen relative"
      data-testid="social-profile"
    >
      {/* Ambient Effects - Now handled by CSS class profile-ambient-lights */}
      <div className="profile-ambient-lights">
        {/* Red ceiling lights */}
        <div className="absolute top-0 left-1/4 w-1 h-32 bg-gradient-to-b from-red-600/40 to-transparent" />
        <div className="absolute top-0 left-1/2 w-1 h-40 bg-gradient-to-b from-red-600/50 to-transparent" />
        <div className="absolute top-0 right-1/4 w-1 h-32 bg-gradient-to-b from-red-600/40 to-transparent" />

        {/* Corner shadows */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-black/80 to-transparent" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-black/80 to-transparent" />
      </div>

      {/* Industrial pipes with occasional steam - much more readable */}
      <BathhousePipes pipeCount={5} steamInterval={10000} />
      <SubtleSteamAccent />

      <div className="container mx-auto px-4 py-8 relative">
        {/* Room Number Badge */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div
            className="px-10 py-3 rounded-sm"
            style={{
              background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.95) 0%, rgba(255, 215, 0, 1) 30%, rgba(205, 127, 50, 0.95) 60%)',
              color: 'rgba(30, 15, 10, 1)',
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: '1.75rem',
              letterSpacing: '0.2em',
              boxShadow: '0 4px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.2)'
            }}
          >
            ROOM {String(userId?.slice(-3) || '000').padStart(3, '0')}
          </div>
        </motion.div>

        {/* Facebook-Style Profile Banner - BoyFanz Underground Background */}
        <motion.div
          className="relative w-full h-56 md:h-72 rounded-xl overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Banner Image */}
          <img
            src={profile?.bannerImageUrl || DEFAULT_BANNER_IMAGE}
            alt="Profile Banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_BANNER_IMAGE;
            }}
          />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Banner Edit Button (own profile only) */}
          {isOwnProfile && (
            <motion.button
              className="absolute top-4 right-4 p-2.5 rounded-lg bg-black/70 text-white hover:bg-red-900/80 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowProfileEditor(true)}
            >
              <Camera className="h-4 w-4" />
              <span className="text-sm hidden md:inline">Edit Cover</span>
            </motion.button>
          )}

          {/* Bathhouse Steam Effect on Banner */}
          <div className="absolute bottom-0 left-0 right-0 h-24 pointer-events-none">
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(0deg, rgba(10, 5, 8, 1) 0%, rgba(139, 0, 0, 0.2) 50%, transparent 100%)'
              }}
            />
          </div>

          {/* Facebook-Style Avatar Container - Positioned at bottom left, overlapping banner */}
          <div className="absolute -bottom-16 left-4 md:left-8">
            <div className="relative">
              {/* Glow effect behind avatar */}
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #dc2626, #9333ea, #ec4899)',
                  filter: 'blur(12px)',
                  opacity: 0.6
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              />
              <Avatar className="h-32 w-32 md:h-40 md:w-40 relative ring-4 ring-black shadow-2xl">
                <AvatarImage src={profile?.profileImageUrl || DEFAULT_PROFILE_IMAGE} />
                <AvatarFallback className="bg-gradient-to-br from-red-900 to-black">
                  <img
                    src={DEFAULT_PROFILE_IMAGE}
                    alt="BoyFanz"
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </AvatarFallback>
              </Avatar>
              {profile?.isOnline && (
                <motion.div
                  className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-green-500 border-4 border-black flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Flame className="h-3.5 w-3.5 text-white" />
                </motion.div>
              )}
              {/* Edit avatar button */}
              {isOwnProfile && (
                <motion.button
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-red-900/90 text-white hover:bg-red-800 transition-colors border-2 border-black"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowProfileEditor(true)}
                >
                  <Camera className="h-4 w-4" />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Profile Info Card - Facebook Style (beside avatar) */}
        <motion.div
          className="rounded-xl p-4 md:p-6 mb-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(15, 8, 12, 0.98) 0%, rgba(10, 5, 8, 0.98) 100%)',
            border: '1px solid rgba(139, 0, 0, 0.3)',
            boxShadow: 'inset 0 0 40px rgba(139, 0, 0, 0.1), 0 8px 32px rgba(0, 0, 0, 0.4)'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="relative flex flex-col md:flex-row items-start gap-4">
            {/* Spacer for overlapping avatar */}
            <div className="w-36 md:w-44 h-16 flex-shrink-0" />

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-2 flex-wrap">
                <h1
                  className="text-4xl font-display"
                  style={{
                    color: '#ff4444',
                    textShadow: '0 0 30px rgba(255, 68, 68, 0.5)'
                  }}
                >
                  {profile?.username || 'User'}
                </h1>
                {profile?.isVerified && (
                  <Badge
                    className="text-xs"
                    style={{
                      background: 'linear-gradient(135deg, #9333ea 0%, #ec4899 100%)',
                      border: 'none'
                    }}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {SEXY_LABELS.verified}
                  </Badge>
                )}
                {profile?.isCreator && (
                  <Badge
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 215, 0, 1) 0%, rgba(205, 127, 50, 1) 100%)',
                      color: '#1a0a0a',
                      border: 'none'
                    }}
                  >
                    <Star className="h-3 w-3 mr-1" /> CREATOR
                  </Badge>
                )}
              </div>

              {/* Status/Mood */}
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-3">
                {profile?.isOnline ? (
                  <span className="text-green-400 text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {SEXY_LABELS.online}
                  </span>
                ) : (
                  <span className="text-gray-500 text-sm">{SEXY_LABELS.away}</span>
                )}
                {selectedMood && (
                  <span className="text-yellow-400 text-sm">
                    • {selectedMood.emoji} {selectedMood.label}
                  </span>
                )}
              </div>

              {profile?.bio && (
                <p className="text-gray-400 mb-4 max-w-xl">{profile.bio}</p>
              )}

              {/* Stats Row */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile?.stats?.posts || 0}</p>
                  <p className="text-gray-500 text-xs">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile?.stats?.fuckBuddies || 0}</p>
                  <p className="text-gray-500 text-xs">{SEXY_LABELS.friends}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile?.stats?.admirers || 0}</p>
                  <p className="text-gray-500 text-xs">{SEXY_LABELS.followers}</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{profile?.stats?.stalking || 0}</p>
                  <p className="text-gray-500 text-xs">{SEXY_LABELS.following}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {isOwnProfile ? (
                <>
                  <Button
                    variant="outline"
                    className="border-red-900/50 text-red-400 hover:bg-red-900/20"
                    onClick={() => setShowProfileEditor(true)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {SEXY_LABELS.settings}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-400 hover:bg-gray-800/50"
                    onClick={() => setShowMoodPicker(!showMoodPicker)}
                  >
                    {selectedMood?.emoji || '😈'} Set Mood
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="font-bold"
                    style={{
                      background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%)',
                      boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
                    }}
                  >
                    <HeartHandshake className="h-4 w-4 mr-2" />
                    Add {SEXY_LABELS.friends.slice(0, -1)}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-red-900/50 text-red-400 hover:bg-red-900/20"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    {SEXY_LABELS.messages}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-600/50 text-yellow-400 hover:bg-yellow-900/20"
                    onClick={() => setShowTipModal(true)}
                  >
                    <Gift className="h-4 w-4 mr-2" />
                    Send {SEXY_LABELS.tips}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-600/50 text-pink-400 hover:bg-pink-900/20"
                    onClick={() => setShowGiftModal(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Send Gift
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mood Picker */}
          <AnimatePresence>
            {showMoodPicker && (
              <motion.div
                className="mt-4 p-4 rounded-lg"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  border: '1px solid rgba(139, 0, 0, 0.3)'
                }}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <p className="text-sm text-gray-400 mb-3">How are you feeling?</p>
                <div className="flex flex-wrap gap-2">
                  {MOOD_OPTIONS.map((mood) => (
                    <Button
                      key={mood.label}
                      variant="ghost"
                      size="sm"
                      className={`${selectedMood?.label === mood.label ? 'ring-2 ring-red-500' : ''}`}
                      style={{
                        background: `${mood.color}20`,
                        border: `1px solid ${mood.color}40`
                      }}
                      onClick={() => {
                        setSelectedMood(mood);
                        setShowMoodPicker(false);
                        toast({ title: `Mood set: ${mood.emoji} ${mood.label}` });
                      }}
                    >
                      {mood.emoji} {mood.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Quickies (Stories) Row */}
        {displayQuickies.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-400" />
              {SEXY_LABELS.stories}
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Add Quickie Button (own profile) */}
              {isOwnProfile && (
                <motion.div
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="p-0.5 rounded-full bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className="p-0.5 rounded-full bg-black">
                      <div className="h-16 w-16 rounded-full bg-gray-900 flex items-center justify-center">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">Add New</span>
                </motion.div>
              )}
              {displayQuickies.map((quickie) => (
                <QuickieCircle
                  key={quickie.id}
                  quickie={quickie}
                  onClick={() => toast({ title: `Viewing ${quickie.creatorUsername}'s quickie...` })}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="profile-tabs w-full grid grid-cols-3 sm:grid-cols-6 mb-8 p-1 rounded-lg h-auto gap-1">
            {/* Fun Room - Personal Wall/Profile */}
            <TabsTrigger
              value="funroom"
              className="data-[state=active]:bg-red-900/50 data-[state=active]:text-red-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Home className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{SEXY_LABELS.funRoom}</span>
            </TabsTrigger>

            {/* FanzCock - TikTok Style Videos */}
            <TabsTrigger
              value="fanzcock"
              className="data-[state=active]:bg-purple-900/50 data-[state=active]:text-purple-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Video className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{SEXY_LABELS.fanzCock}</span>
            </TabsTrigger>

            {/* Group Play - Platform-Wide Feed */}
            <TabsTrigger
              value="groupplay"
              className="data-[state=active]:bg-orange-900/50 data-[state=active]:text-orange-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Users className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{SEXY_LABELS.groupPlay}</span>
            </TabsTrigger>

            {/* 1 on 1 - Creator's Content (only when viewing others) */}
            {!isOwnProfile && (
              <TabsTrigger
                value="oneonone"
                className="data-[state=active]:bg-yellow-900/50 data-[state=active]:text-yellow-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
              >
                <Lock className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">{SEXY_LABELS.oneOnOne}</span>
              </TabsTrigger>
            )}

            {/* Cruising - Discovery + AI Recommendations */}
            <TabsTrigger
              value="cruising"
              className="data-[state=active]:bg-cyan-900/50 data-[state=active]:text-slate-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Compass className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{SEXY_LABELS.cruising}</span>
            </TabsTrigger>

            {/* Fuck Buddies - Friends */}
            <TabsTrigger
              value="buddies"
              className="data-[state=active]:bg-pink-900/50 data-[state=active]:text-pink-400 text-gray-500 py-2 sm:py-3 text-xs sm:text-sm"
            >
              <Heart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{SEXY_LABELS.fuckBuddies}</span>
            </TabsTrigger>
          </TabsList>

          {/* FUN ROOM - Personal Wall/Profile (like Facebook Home) */}
          <TabsContent value="funroom">
            <div className="max-w-2xl mx-auto">
              {/* Enhanced Post Composer */}
              {isOwnProfile && (
                <EnhancedPostComposer
                  profile={profile}
                  onPost={(data) => {
                    console.log('Posting:', data);
                    toast({ title: 'Posted to ' + SEXY_LABELS.wall + '! 🔥' });
                  }}
                />
              )}

              {/* Posts */}
              {gloryPosts.length > 0 ? (
                gloryPosts.map((post) => (
                  <GloryPostCard
                    key={post.id}
                    post={post}
                    isOwnPost={isOwnProfile || post.authorId === currentUser?.id}
                    onReact={(type) => toast({ title: `${GLORY_REACTIONS.find(r => r.type === type)?.emoji} ${type}!` })}
                    onMoan={() => toast({ title: 'Opening moans...' })}
                    onPassAround={() => {
                      setRepostingPost(post);
                      setShowRepostModal(true);
                    }}
                  />
                ))
              ) : (
                <div className="text-center py-16">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 text-red-900/50" />
                  <p className="text-gray-500 text-lg">No posts in {SEXY_LABELS.wall} yet</p>
                  <p className="text-gray-600 text-sm">Be the first to post something naughty!</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* FANZCOCK - TikTok Style Adult Video Feed */}
          <TabsContent value="fanzcock">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {strokeReels.length > 0 ? (
                strokeReels.map((reel) => (
                  <StrokeReelCard
                    key={reel.id}
                    reel={reel}
                    onThrob={() => toast({ title: '🍆 Throbbed!' })}
                    onMoan={() => toast({ title: 'Opening moans...' })}
                    onSpankBank={() => toast({ title: `Added to ${SEXY_LABELS.saved}!` })}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <Video className="h-16 w-16 mx-auto mb-4 text-purple-900/50" />
                  <p className="text-gray-500 text-lg">No {SEXY_LABELS.reels} yet</p>
                  <p className="text-gray-600 text-sm">Upload your first reel to get started!</p>
                  {isOwnProfile && (
                    <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Upload Reel
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* GROUP PLAY - Platform-Wide Feed (Age Verified Auto-Scroll) */}
          <TabsContent value="groupplay">
            <div className="space-y-6">
              {/* Age Verification Notice */}
              <motion.div
                className="p-4 rounded-lg text-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(234, 88, 12, 0.05) 100%)',
                  border: '1px solid rgba(251, 146, 60, 0.3)',
                }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-orange-400" />
                  <span className="text-orange-400 font-semibold">{SEXY_LABELS.groupPlay}</span>
                </div>
                <p className="text-gray-400 text-sm mb-3">
                  The entire platform's hottest free content. Age-verified users get unlimited auto-scrolling access.
                </p>
                <div className="flex justify-center gap-3">
                  <Badge className="bg-green-900/50 text-green-400 border-green-600/30">
                    <Shield className="h-3 w-3 mr-1" /> Age Verified
                  </Badge>
                  <Badge className="bg-orange-900/50 text-orange-400 border-orange-600/30">
                    <Flame className="h-3 w-3 mr-1" /> Free Content
                  </Badge>
                </div>
              </motion.div>

              {/* Auto-Scrolling Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-300 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                    {SEXY_LABELS.trending} Right Now
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-orange-600/50 text-orange-400 hover:bg-orange-900/20"
                  >
                    <Play className="h-4 w-4 mr-1" /> Auto-Play
                  </Button>
                </div>

                {/* Platform-wide posts grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Mock platform posts */}
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      className="aspect-[9/16] rounded-lg overflow-hidden relative group cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, rgba(${Math.random() * 50 + 20}, ${Math.random() * 30 + 10}, ${Math.random() * 40 + 20}, 0.95) 0%, rgba(10, 5, 8, 0.98) 100%)`,
                        border: '1px solid rgba(251, 146, 60, 0.2)',
                      }}
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-6 w-6 ring-1 ring-orange-500/50">
                            <AvatarFallback className="bg-orange-900 text-orange-400 text-xs">
                              {String.fromCharCode(65 + i)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-gray-300">creator{i}</span>
                          {i % 3 === 0 && (
                            <Badge className="bg-green-600/80 text-xs py-0 px-1">FREE</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {Math.floor(Math.random() * 10000)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {Math.floor(Math.random() * 1000)}
                          </span>
                        </div>
                      </div>
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-orange-500/80 flex items-center justify-center">
                          <Play className="h-6 w-6 text-white fill-white" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Load More */}
                <div className="text-center py-4">
                  <Button
                    variant="outline"
                    className="border-orange-600/50 text-orange-400 hover:bg-orange-900/20"
                  >
                    Load More Content
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* CRUISING - Discovery + AI Recommendations */}
          <TabsContent value="cruising">
            <div className="space-y-6">
              {/* Category Filter Bar */}
              <CategoryFilterBar
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
                selectedFilter={selectedFilter}
                onSelectFilter={setSelectedFilter}
              />

              {/* AI Recommendations Section - For Creators */}
              {isOwnProfile && profile?.isCreator && (
                <motion.div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.1) 0%, rgba(139, 69, 255, 0.1) 100%)',
                    border: '1px solid rgba(71, 85, 105, 0.3)',
                  }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-full bg-slate-500/20">
                      <Zap className="h-5 w-5 text-slate-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-400">AI-Powered Outreach</h3>
                      <p className="text-xs text-gray-400">Recommended fans to offer your content</p>
                    </div>
                  </div>

                  {/* AI Recommended Fans to Reach Out To */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { name: 'Alex_Hot', match: 94, interests: ['Bear', 'Daddy'], online: true },
                      { name: 'MaxPower', match: 89, interests: ['Muscle', 'Alpha'], online: false },
                      { name: 'SteveXXX', match: 87, interests: ['Twink', 'Latino'], online: true },
                      { name: 'JakePlays', match: 82, interests: ['BDSM', 'Fetish'], online: true },
                    ].map((fan, i) => (
                      <motion.div
                        key={fan.name}
                        className="p-3 rounded-lg cursor-pointer hover:scale-102"
                        style={{
                          background: 'rgba(0, 0, 0, 0.4)',
                          border: '1px solid rgba(71, 85, 105, 0.2)',
                        }}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ borderColor: 'rgba(71, 85, 105, 0.5)' }}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="relative">
                            <Avatar className="h-8 w-8 ring-1 ring-slate-500/50">
                              <AvatarFallback className="bg-cyan-900 text-slate-400 text-xs">
                                {fan.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {fan.online && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-gray-300 truncate">{fan.name}</div>
                            <div className="text-xs text-slate-400">{fan.match}% match</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {fan.interests.map((int) => (
                            <Badge key={int} className="text-[10px] bg-cyan-900/50 text-cyan-300 py-0 px-1">
                              {int}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          size="sm"
                          className="w-full text-xs bg-slate-600/80 hover:bg-slate-600"
                        >
                          <Gift className="h-3 w-3 mr-1" />
                          Offer Free Trial
                        </Button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>AI analyzes viewer patterns to find your ideal fans</span>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cyan-300">
                      View All Recommendations →
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Discover Other Creators */}
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4 flex items-center gap-2">
                  <Compass className="h-5 w-5 text-slate-400" />
                  Discover Creators
                </h3>
                <p className="text-gray-500 mb-4 text-sm">
                  {selectedCategory
                    ? `Browsing ${CREATOR_CATEGORIES.find(c => c.id === selectedCategory)?.label || selectedCategory} creators...`
                    : 'Find your next favorite playmate. Browse by category or let AI suggest matches.'}
                </p>
                {selectedFilter && (
                  <Badge
                    className="mb-4"
                    style={{ background: 'rgba(71, 85, 105, 0.2)', color: '#475569' }}
                  >
                    Filter: {selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}
                  </Badge>
                )}

                {/* Creator Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <motion.div
                      key={i}
                      className="rounded-lg overflow-hidden cursor-pointer group"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20, 10, 15, 0.95) 0%, rgba(10, 5, 8, 0.98) 100%)',
                        border: '1px solid rgba(71, 85, 105, 0.2)',
                      }}
                      whileHover={{ scale: 1.02, borderColor: 'rgba(71, 85, 105, 0.5)' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <div className="aspect-square relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute top-2 right-2">
                          {i % 3 === 0 && (
                            <Badge className="bg-green-600/80 text-xs">FREE</Badge>
                          )}
                          {i % 4 === 0 && (
                            <Badge className="bg-red-600/80 text-xs">LIVE</Badge>
                          )}
                        </div>
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6 ring-1 ring-slate-500/50">
                              <AvatarFallback className="bg-cyan-900 text-slate-400 text-xs">
                                {String.fromCharCode(65 + i)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-white font-medium">creator{i}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{Math.floor(Math.random() * 500)}K {SEXY_LABELS.followers}</span>
                          <span className="text-xs text-slate-400">${(Math.random() * 15 + 5).toFixed(2)}/mo</span>
                        </div>
                        <Button
                          size="sm"
                          className="w-full text-xs bg-slate-600/80 hover:bg-slate-600"
                        >
                          View Profile
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="flex justify-center gap-3 mt-6">
                  <Button className="bg-slate-600 hover:bg-slate-700">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    {SEXY_LABELS.trending}
                  </Button>
                  <Button variant="outline" className="border-slate-600/50 text-slate-400 hover:bg-cyan-900/20">
                    <Sparkles className="h-4 w-4 mr-2" />
                    {SEXY_LABELS.newUsers}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 1 ON 1 - This Creator's Content & Subscription Tiers */}
          <TabsContent value="oneonone">
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2
                  className="text-3xl font-display mb-2"
                  style={{
                    color: '#ffd700',
                    textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
                  }}
                >
                  {SEXY_LABELS.oneOnOne} with {profile?.username}
                </h2>
                <p className="text-gray-400">Private content and exclusive access to this creator</p>
              </motion.div>

              {/* Creator's Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                  <div className="text-2xl font-bold text-yellow-400">{gloryPosts.length || 12}</div>
                  <div className="text-xs text-gray-400">Posts</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                  <div className="text-2xl font-bold text-yellow-400">{strokeReels.length || 8}</div>
                  <div className="text-xs text-gray-400">Videos</div>
                </div>
                <div className="text-center p-4 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.2)' }}>
                  <div className="text-2xl font-bold text-yellow-400">24/7</div>
                  <div className="text-xs text-gray-400">Access</div>
                </div>
              </div>

              {/* Subscription Tiers */}
              {profile?.isCreator ? (
                <div>
                  <h3 className="text-xl text-center text-gray-300 mb-6">Subscribe for {SEXY_LABELS.subscriptions}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    {displayTiers.map((tier) => (
                      <TierCard
                        key={tier.id}
                        tier={tier}
                        onSubscribe={() => toast({ title: `Subscribing to ${tier.name}...` })}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Lock className="h-12 w-12 mx-auto mb-4 text-yellow-900/50" />
                  <p className="text-gray-500">No subscription tiers set up yet</p>
                </div>
              )}

              {/* Recent Exclusive Content Preview */}
              <div>
                <h3 className="text-lg text-gray-300 mb-4 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-yellow-400" />
                  Exclusive Content Preview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(139, 0, 0, 0.2) 100%)',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                      }}
                    >
                      <div className="absolute inset-0 backdrop-blur-xl flex items-center justify-center">
                        <Lock className="h-8 w-8 text-yellow-500/50" />
                      </div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge className="bg-yellow-900/80 text-yellow-400 text-xs">Subscribe to View</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* FUCK BUDDIES */}
          <TabsContent value="buddies">
            {/* Top 8 Section */}
            {topEightBuddies.length > 0 && (
              <div className="mb-10">
                <h2
                  className="text-2xl font-display text-center mb-6"
                  style={{
                    color: '#ffd700',
                    textShadow: '0 0 15px rgba(255, 215, 0, 0.4)'
                  }}
                >
                  ⭐ {SEXY_LABELS.topEight} ⭐
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                  {topEightBuddies.map((buddy, idx) => (
                    <FuckBuddyCard
                      key={buddy.id}
                      buddy={buddy}
                      rank={idx + 1}
                      onMessage={() => toast({ title: `${SEXY_LABELS.messages} to ${buddy.username}...` })}
                      onViewProfile={() => toast({ title: `Viewing ${buddy.username}'s room...` })}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Buddies */}
            {(fuckBuddies.length > 0 || mockFuckBuddies.length > 0) ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">
                  All {SEXY_LABELS.friends} ({(fuckBuddies.length || mockFuckBuddies.length)})
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {(fuckBuddies.length > 0 ? fuckBuddies : mockFuckBuddies).map((buddy) => (
                    <FuckBuddyCard
                      key={buddy.id}
                      buddy={buddy}
                      onMessage={() => toast({ title: `${SEXY_LABELS.messages} to ${buddy.username}...` })}
                      onViewProfile={() => toast({ title: `Viewing ${buddy.username}'s room...` })}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="h-16 w-16 mx-auto mb-4 text-pink-900/50" />
                <p className="text-gray-500 text-lg">No {SEXY_LABELS.friends} yet</p>
                <p className="text-gray-600 text-sm mb-4">Start connecting with other users!</p>
                <Button className="bg-pink-600 hover:bg-pink-700">
                  <Search className="h-4 w-4 mr-2" />
                  {SEXY_LABELS.search}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Payment Modals */}
      <SendTipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        recipientName={profile?.username || 'User'}
        onSend={(amount, method) => {
          toast({
            title: `Tribute Sent!`,
            description: `$${amount.toFixed(2)} sent to ${profile?.username} via ${method}`
          });
          setShowTipModal(false);
        }}
      />

      <SendGiftModal
        isOpen={showGiftModal}
        onClose={() => setShowGiftModal(false)}
        recipientName={profile?.username || 'User'}
        onSend={(giftId) => {
          const gift = [
            { id: 'rose', emoji: '🌹', name: 'Rose' },
            { id: 'kiss', emoji: '💋', name: 'Kiss' },
            { id: 'fire', emoji: '🔥', name: 'Fire' },
            { id: 'diamond', emoji: '💎', name: 'Diamond' },
            { id: 'crown', emoji: '👑', name: 'Crown' },
            { id: 'rocket', emoji: '🚀', name: 'Rocket' },
            { id: 'eggplant', emoji: '🍆', name: 'Eggplant' },
            { id: 'peach', emoji: '🍑', name: 'Peach' },
          ].find(g => g.id === giftId);
          toast({
            title: `${gift?.emoji} ${gift?.name} Sent!`,
            description: `Gift delivered to ${profile?.username}`
          });
          setShowGiftModal(false);
        }}
      />

      {/* Profile Editor Modal */}
      <ProfileEditorModal
        isOpen={showProfileEditor}
        onClose={() => setShowProfileEditor(false)}
        profile={profile}
        onSave={(data) => {
          // TODO: Connect to backend API to save profile changes
          console.log('Saving profile:', data);
          toast({
            title: '✅ Profile Updated',
            description: 'Your changes have been saved'
          });
        }}
      />

      {/* Repost/Quote Post Modal - Twitter/X Style */}
      <RepostModal
        isOpen={showRepostModal}
        onClose={() => {
          setShowRepostModal(false);
          setRepostingPost(null);
        }}
        post={repostingPost}
        onRepost={(comment) => {
          // TODO: Connect to backend API to create repost
          console.log('Reposting with comment:', comment, 'Original post:', repostingPost);
          // The toast is handled inside the RepostModal component
        }}
      />
    </div>
  );
}
