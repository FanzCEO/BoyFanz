import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Edit3,
  Eye,
  FileText,
  Heart,
  Image,
  Inbox,
  LineChart,
  MessageCircle,
  MoreHorizontal,
  PieChart,
  Plus,
  Send,
  Settings,
  Share2,
  TrendingUp,
  Upload,
  Users,
  Video,
  Zap,
  Target,
  Bell,
  Gift,
  Crown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Copy,
  Play,
  Pause,
  Globe,
  Lock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  RefreshCcw,
  Download,
  Filter,
  Search,
  CalendarDays,
  Mail
} from 'lucide-react';

// Types
interface CreatorStats {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  totalSubscribers: number;
  newSubscribersThisMonth: number;
  churnRate: number;
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  averageEngagementRate: number;
  profileViews: number;
  topPerformingPost: {
    id: string;
    title: string;
    views: number;
    likes: number;
  } | null;
}

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  scheduledAt: string;
  visibility: 'public' | 'subscribers' | 'ppv';
  priceCents?: number;
  status: 'scheduled' | 'published' | 'failed' | 'draft';
}

interface PostDraft {
  id: string;
  title: string;
  content: string;
  mediaUrls: string[];
  createdAt: string;
  lastEditedAt: string;
}

interface AudienceInsight {
  ageRange: string;
  percentage: number;
}

interface TopFan {
  id: string;
  username: string;
  avatarUrl?: string;
  totalSpent: number;
  subscriptionMonths: number;
}

interface EarningsBreakdown {
  subscriptions: number;
  tips: number;
  ppvContent: number;
  messages: number;
}

export default function CreatorStudio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // New post state
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    visibility: 'subscribers' as 'public' | 'subscribers' | 'ppv',
    priceCents: 0,
    scheduledAt: '',
    mediaUrls: [] as string[],
  });

  // Fetch creator stats
  const { data: stats, isLoading: statsLoading } = useQuery<CreatorStats>({
    queryKey: ['/api/creator/stats', selectedTimeRange],
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch scheduled posts
  const { data: scheduledPosts = [] } = useQuery<ScheduledPost[]>({
    queryKey: ['/api/creator/scheduled-posts'],
  });

  // Fetch drafts
  const { data: drafts = [] } = useQuery<PostDraft[]>({
    queryKey: ['/api/creator/drafts'],
  });

  // Fetch top fans
  const { data: topFans = [] } = useQuery<TopFan[]>({
    queryKey: ['/api/creator/top-fans'],
  });

  // Fetch audience insights
  const { data: audienceInsights = [] } = useQuery<AudienceInsight[]>({
    queryKey: ['/api/creator/audience-insights'],
  });

  // Fetch earnings breakdown
  const { data: earningsBreakdown } = useQuery<EarningsBreakdown>({
    queryKey: ['/api/creator/earnings-breakdown', selectedTimeRange],
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (post: typeof newPost) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post),
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Post Created!', description: 'Your post has been published.' });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/creator/scheduled-posts'] });
      setIsCreatingPost(false);
      setNewPost({
        title: '',
        content: '',
        visibility: 'subscribers',
        priceCents: 0,
        scheduledAt: '',
        mediaUrls: [],
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create post', variant: 'destructive' });
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

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  // Mock data for demonstration
  const mockStats: CreatorStats = stats || {
    totalEarnings: 1523400,
    monthlyEarnings: 234500,
    weeklyEarnings: 58200,
    dailyEarnings: 8340,
    totalSubscribers: 1247,
    newSubscribersThisMonth: 89,
    churnRate: 2.3,
    totalPosts: 156,
    totalViews: 89432,
    totalLikes: 12453,
    totalComments: 3421,
    totalShares: 876,
    averageEngagementRate: 18.7,
    profileViews: 45321,
    topPerformingPost: {
      id: '1',
      title: 'Behind the scenes...',
      views: 12453,
      likes: 2341,
    },
  };

  const mockEarningsBreakdown: EarningsBreakdown = earningsBreakdown || {
    subscriptions: 145000,
    tips: 54000,
    ppvContent: 28500,
    messages: 7000,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-400" />
              Creator Studio
            </h1>
            <p className="text-gray-400 mt-1">Manage your content, analytics, and earnings</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[140px] bg-white/5 border-purple-500/30 text-white">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-500/30">
                <SelectItem value="7d" className="text-white">Last 7 days</SelectItem>
                <SelectItem value="30d" className="text-white">Last 30 days</SelectItem>
                <SelectItem value="90d" className="text-white">Last 90 days</SelectItem>
                <SelectItem value="1y" className="text-white">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsCreatingPost(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Post
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400 text-xs">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  12.5%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.monthlyEarnings)}</p>
              <p className="text-gray-400 text-sm">Monthly Earnings</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400 text-xs">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +{mockStats.newSubscribersThisMonth}
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(mockStats.totalSubscribers)}</p>
              <p className="text-gray-400 text-sm">Total Subscribers</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Eye className="h-5 w-5 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  8.2%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(mockStats.totalViews)}</p>
              <p className="text-gray-400 text-sm">Total Views</p>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 text-pink-400" />
                <span className="text-pink-400 text-sm font-medium">{mockStats.averageEngagementRate}%</span>
              </div>
              <p className="text-2xl font-bold text-white">{formatNumber(mockStats.totalLikes + mockStats.totalComments)}</p>
              <p className="text-gray-400 text-sm">Engagement</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-purple-500/30 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              Content
            </TabsTrigger>
            <TabsTrigger value="schedule" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="audience" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Audience
            </TabsTrigger>
            <TabsTrigger value="earnings" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-2" />
              Earnings
            </TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Mail className="h-4 w-4 mr-2" />
              Mass Message
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Earnings Chart */}
              <Card className="lg:col-span-2 bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-green-400" />
                    Earnings Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-purple-900/20 rounded-lg">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto text-purple-500/50 mb-4" />
                      <p className="text-gray-400">Earnings chart visualization</p>
                      <p className="text-2xl font-bold text-green-400 mt-2">
                        {formatCurrency(mockStats.monthlyEarnings)}
                      </p>
                      <p className="text-gray-500 text-sm">this month</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Earnings Breakdown */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" />
                    Revenue Sources
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">Subscriptions</span>
                      <span className="text-white font-medium">{formatCurrency(mockEarningsBreakdown.subscriptions)}</span>
                    </div>
                    <Progress value={62} className="h-2 bg-purple-900/30" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">Tips</span>
                      <span className="text-white font-medium">{formatCurrency(mockEarningsBreakdown.tips)}</span>
                    </div>
                    <Progress value={23} className="h-2 bg-purple-900/30" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">PPV Content</span>
                      <span className="text-white font-medium">{formatCurrency(mockEarningsBreakdown.ppvContent)}</span>
                    </div>
                    <Progress value={12} className="h-2 bg-purple-900/30" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-gray-300 text-sm">Messages</span>
                      <span className="text-white font-medium">{formatCurrency(mockEarningsBreakdown.messages)}</span>
                    </div>
                    <Progress value={3} className="h-2 bg-purple-900/30" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Content & Top Fans */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Performing Content */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-pink-400" />
                    Top Performing Content
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {mockStats.topPerformingPost ? (
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <Image className="h-8 w-8 text-purple-500/50" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">{mockStats.topPerformingPost.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {formatNumber(mockStats.topPerformingPost.views)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            {formatNumber(mockStats.topPerformingPost.likes)}
                          </span>
                        </div>
                        <Button variant="outline" size="sm" className="mt-3 border-purple-500/50 text-purple-300">
                          View Insights
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No posts yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Fans */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    Top Fans
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { id: '1', username: 'SuperFan123', totalSpent: 45000, subscriptionMonths: 12 },
                      { id: '2', username: 'LoyalFollower', totalSpent: 32000, subscriptionMonths: 8 },
                      { id: '3', username: 'BigTipper', totalSpent: 28000, subscriptionMonths: 6 },
                    ].map((fan, index) => (
                      <div key={fan.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-purple-600 text-white">
                            {fan.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm">{fan.username}</p>
                          <p className="text-gray-400 text-xs">{fan.subscriptionMonths} months</p>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-medium">{formatCurrency(fan.totalSpent)}</p>
                          <p className="text-gray-500 text-xs">total spent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Your Content</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    className="pl-10 bg-white/5 border-purple-500/30 text-white w-64"
                  />
                </div>
                <Button variant="outline" className="border-purple-500/50 text-purple-300">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="bg-black/40 backdrop-blur-lg border-purple-500/30 overflow-hidden group">
                  <div className="aspect-square bg-purple-900/30 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {i % 2 === 0 ? (
                        <Image className="h-12 w-12 text-purple-500/50" />
                      ) : (
                        <Video className="h-12 w-12 text-purple-500/50" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="sm" variant="ghost" className="text-white">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white">
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge className="absolute top-2 right-2 bg-purple-600/90 text-white text-xs">
                      {i % 3 === 0 ? 'PPV' : 'Sub'}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="text-white text-sm font-medium truncate">Post title #{i + 1}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {Math.floor(Math.random() * 500)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {Math.floor(Math.random() * 50)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {Math.floor(Math.random() * 2000)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar View */}
              <Card className="lg:col-span-2 bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-purple-400" />
                    Content Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-96 flex items-center justify-center bg-purple-900/20 rounded-lg">
                    <div className="text-center">
                      <Calendar className="h-16 w-16 mx-auto text-purple-500/50 mb-4" />
                      <p className="text-gray-400">Calendar view coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Scheduled Posts List */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Upcoming Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {scheduledPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                      <p className="text-gray-500">No scheduled posts</p>
                      <Button
                        size="sm"
                        className="mt-3 bg-purple-600 hover:bg-purple-500"
                        onClick={() => setIsCreatingPost(true)}
                      >
                        Schedule Post
                      </Button>
                    </div>
                  ) : (
                    scheduledPosts.map((post) => (
                      <div key={post.id} className="p-3 rounded-lg bg-white/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">{post.title}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {new Date(post.scheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <Badge className={`text-xs ${
                            post.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' :
                            post.status === 'published' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {post.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Drafts */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-400" />
                  Drafts ({drafts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {drafts.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No drafts saved</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {drafts.map((draft) => (
                      <div key={draft.id} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <h4 className="text-white font-medium mb-1">{draft.title || 'Untitled Draft'}</h4>
                        <p className="text-gray-400 text-sm line-clamp-2">{draft.content}</p>
                        <p className="text-gray-500 text-xs mt-2">
                          Last edited: {new Date(draft.lastEditedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audience Tab */}
          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscriber Growth */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    Subscriber Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-purple-900/20 rounded-lg">
                    <div className="text-center">
                      <LineChart className="h-16 w-16 mx-auto text-purple-500/50 mb-4" />
                      <p className="text-gray-400">Growth chart</p>
                      <div className="flex items-center justify-center gap-6 mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-green-400">+{mockStats.newSubscribersThisMonth}</p>
                          <p className="text-gray-500 text-sm">new this month</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-red-400">{mockStats.churnRate}%</p>
                          <p className="text-gray-500 text-sm">churn rate</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Demographics */}
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-purple-400" />
                    Audience Demographics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: '18-24', percentage: 15 },
                    { label: '25-34', percentage: 45 },
                    { label: '35-44', percentage: 25 },
                    { label: '45+', percentage: 15 },
                  ].map((demo) => (
                    <div key={demo.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-300 text-sm">{demo.label}</span>
                        <span className="text-white font-medium">{demo.percentage}%</span>
                      </div>
                      <Progress value={demo.percentage} className="h-2 bg-purple-900/30" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Active Times */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  Best Times to Post
                </CardTitle>
                <CardDescription className="text-gray-400">
                  When your audience is most active
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="text-center">
                      <p className="text-gray-400 text-xs mb-2">{day}</p>
                      <div className="space-y-1">
                        {[9, 12, 15, 18, 21].map((hour) => (
                          <div
                            key={hour}
                            className={`h-6 rounded-sm ${
                              Math.random() > 0.5
                                ? 'bg-purple-500'
                                : Math.random() > 0.3
                                ? 'bg-purple-700'
                                : 'bg-purple-900/50'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded" />
                    <span className="text-gray-400 text-xs">High activity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-700 rounded" />
                    <span className="text-gray-400 text-xs">Medium</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-900/50 rounded" />
                    <span className="text-gray-400 text-xs">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-black/40 backdrop-blur-lg border-green-500/30">
                <CardContent className="p-4">
                  <DollarSign className="h-5 w-5 text-green-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.totalEarnings)}</p>
                  <p className="text-gray-400 text-sm">All Time</p>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
                <CardContent className="p-4">
                  <Calendar className="h-5 w-5 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.monthlyEarnings)}</p>
                  <p className="text-gray-400 text-sm">This Month</p>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-lg border-blue-500/30">
                <CardContent className="p-4">
                  <Clock className="h-5 w-5 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.weeklyEarnings)}</p>
                  <p className="text-gray-400 text-sm">This Week</p>
                </CardContent>
              </Card>
              <Card className="bg-black/40 backdrop-blur-lg border-pink-500/30">
                <CardContent className="p-4">
                  <Zap className="h-5 w-5 text-pink-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{formatCurrency(mockStats.dailyEarnings)}</p>
                  <p className="text-gray-400 text-sm">Today</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white">Transaction History</CardTitle>
                <Button variant="outline" size="sm" className="border-purple-500/50 text-purple-300">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { type: 'Subscription', user: 'FanUser123', amount: 999, date: '2 hours ago' },
                    { type: 'Tip', user: 'BigTipper', amount: 5000, date: '5 hours ago' },
                    { type: 'PPV Purchase', user: 'ContentLover', amount: 1500, date: 'Yesterday' },
                    { type: 'Subscription', user: 'NewFan456', amount: 999, date: 'Yesterday' },
                    { type: 'Message', user: 'PrivateUser', amount: 500, date: '2 days ago' },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          tx.type === 'Subscription' ? 'bg-purple-600' :
                          tx.type === 'Tip' ? 'bg-green-600' :
                          tx.type === 'PPV Purchase' ? 'bg-pink-600' :
                          'bg-blue-600'
                        }`}>
                          {tx.type === 'Subscription' ? <Crown className="h-5 w-5 text-white" /> :
                           tx.type === 'Tip' ? <Gift className="h-5 w-5 text-white" /> :
                           tx.type === 'PPV Purchase' ? <Lock className="h-5 w-5 text-white" /> :
                           <MessageCircle className="h-5 w-5 text-white" />}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{tx.type}</p>
                          <p className="text-gray-400 text-xs">from {tx.user}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">+{formatCurrency(tx.amount)}</p>
                        <p className="text-gray-500 text-xs">{tx.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mass Message Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-400" />
                  Mass Message
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Send a message to all your subscribers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Target Audience</Label>
                  <Select defaultValue="all">
                    <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-purple-500/30">
                      <SelectItem value="all" className="text-white">All Subscribers</SelectItem>
                      <SelectItem value="active" className="text-white">Active (last 30 days)</SelectItem>
                      <SelectItem value="expiring" className="text-white">Expiring Soon</SelectItem>
                      <SelectItem value="tippers" className="text-white">Top Tippers</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Message</Label>
                  <Textarea
                    placeholder="Type your message..."
                    className="bg-white/5 border-purple-500/30 text-white min-h-[150px]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Image className="h-4 w-4 mr-2" />
                    Attach Media
                  </Button>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Lock className="h-4 w-4 mr-2" />
                    Add PPV Content
                  </Button>
                </div>

                <Separator className="bg-purple-500/20" />

                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    Estimated reach: <span className="text-white font-medium">{formatNumber(mockStats.totalSubscribers)} subscribers</span>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500">
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Message Templates */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-400" />
                  Message Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { title: 'Welcome Message', preview: 'Hey! Thanks for subscribing...' },
                    { title: 'New Content Alert', preview: 'Just posted something special...' },
                    { title: 'Promotion', preview: 'Limited time offer...' },
                  ].map((template, i) => (
                    <div key={i} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <h4 className="text-white font-medium mb-1">{template.title}</h4>
                      <p className="text-gray-400 text-sm truncate">{template.preview}</p>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg border-2 border-dashed border-purple-500/30 hover:border-purple-500/50 transition-colors cursor-pointer flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="h-6 w-6 text-purple-400 mx-auto mb-1" />
                      <p className="text-purple-300 text-sm">Create Template</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Post Modal */}
        {isCreatingPost && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl bg-gray-900 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-purple-400" />
                    Create New Post
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsCreatingPost(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <XCircle className="h-5 w-5" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Title</Label>
                  <Input
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                    placeholder="Post title..."
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Content</Label>
                  <Textarea
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                    placeholder="What's on your mind?"
                    className="bg-white/5 border-purple-500/30 text-white min-h-[150px]"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Image className="h-4 w-4 mr-2" />
                    Add Photo
                  </Button>
                  <Button variant="outline" className="border-purple-500/50 text-purple-300">
                    <Video className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Visibility</Label>
                    <Select
                      value={newPost.visibility}
                      onValueChange={(value: 'public' | 'subscribers' | 'ppv') =>
                        setNewPost({ ...newPost, visibility: value })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-purple-500/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-purple-500/30">
                        <SelectItem value="public" className="text-white">
                          <span className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            Public
                          </span>
                        </SelectItem>
                        <SelectItem value="subscribers" className="text-white">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Subscribers Only
                          </span>
                        </SelectItem>
                        <SelectItem value="ppv" className="text-white">
                          <span className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Pay-Per-View
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newPost.visibility === 'ppv' && (
                    <div className="space-y-2">
                      <Label className="text-white">Price ($)</Label>
                      <Input
                        type="number"
                        value={newPost.priceCents / 100}
                        onChange={(e) => setNewPost({ ...newPost, priceCents: parseFloat(e.target.value) * 100 })}
                        placeholder="0.00"
                        className="bg-white/5 border-purple-500/30 text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Schedule (optional)</Label>
                  <Input
                    type="datetime-local"
                    value={newPost.scheduledAt}
                    onChange={(e) => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                    className="bg-white/5 border-purple-500/30 text-white"
                  />
                </div>

                <Separator className="bg-purple-500/20" />

                <div className="flex items-center justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingPost(false)}
                    className="border-purple-500/50 text-purple-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-300"
                  >
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => createPostMutation.mutate(newPost)}
                    disabled={createPostMutation.isPending}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  >
                    {newPost.scheduledAt ? (
                      <>
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Post Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
