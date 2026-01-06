import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  Share2,
  MessageSquare,
  Heart,
  Repeat2,
  ExternalLink,
  Send,
  UserPlus,
  Search,
  X,
  Check,
  Clock,
  AlertCircle,
  Zap,
  Crown,
  Link2,
  Twitter,
  Instagram,
  Copy,
  ChevronRight,
  Plus,
  Image,
  Video,
  FileText,
  AtSign,
  Hash,
  Globe,
  Lock,
  Sparkles,
  TrendingUp,
  Eye,
  DollarSign
} from 'lucide-react';

// Types
interface CollabRequest {
  id: string;
  fromUser: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
    subscriberCount: number;
  };
  toUser: {
    id: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  type: 'collab_post' | 'quote_repost' | 'reply_thread' | 'promo_exchange';
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  revenueShare?: number; // percentage for collab posts
  proposedContent?: string;
  createdAt: string;
  expiresAt: string;
}

interface CollabPost {
  id: string;
  participants: Array<{
    userId: string;
    username: string;
    avatarUrl?: string;
    isVerified: boolean;
    revenueShare: number;
  }>;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  repostsCount: number;
  viewsCount: number;
  earningsTotal: number;
  visibility: 'public' | 'subscribers';
  createdAt: string;
}

interface QuoteRepost {
  id: string;
  originalPost: {
    id: string;
    userId: string;
    username: string;
    avatarUrl?: string;
    content: string;
    mediaUrl?: string;
    createdAt: string;
  };
  quotedBy: {
    userId: string;
    username: string;
    avatarUrl?: string;
  };
  quoteContent: string;
  likesCount: number;
  commentsCount: number;
  createdAt: string;
}

interface Creator {
  id: string;
  username: string;
  avatarUrl?: string;
  isVerified: boolean;
  subscriberCount: number;
  categories: string[];
}

export default function Collaborations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCollabDialog, setShowCollabDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  // New collab state
  const [newCollab, setNewCollab] = useState({
    type: 'collab_post' as 'collab_post' | 'quote_repost' | 'promo_exchange',
    message: '',
    revenueShare: 50,
    proposedContent: '',
  });

  // Fetch collab requests
  const { data: collabRequests = [] } = useQuery<CollabRequest[]>({
    queryKey: ['/api/collaborations/requests'],
  });

  // Fetch collab posts
  const { data: collabPosts = [] } = useQuery<CollabPost[]>({
    queryKey: ['/api/collaborations/posts'],
  });

  // Fetch quote reposts
  const { data: quoteReposts = [] } = useQuery<QuoteRepost[]>({
    queryKey: ['/api/quote-reposts'],
  });

  // Search creators
  const { data: searchResults = [] } = useQuery<Creator[]>({
    queryKey: ['/api/creators/search', searchQuery],
    enabled: searchQuery.length >= 2,
  });

  // Send collab request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (data: { toUserId: string } & typeof newCollab) => {
      const response = await fetch('/api/collaborations/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to send request');
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Request Sent!', description: 'Your collaboration request has been sent.' });
      queryClient.invalidateQueries({ queryKey: ['/api/collaborations/requests'] });
      setShowCollabDialog(false);
      setSelectedCreator(null);
      setNewCollab({
        type: 'collab_post',
        message: '',
        revenueShare: 50,
        proposedContent: '',
      });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to send request', variant: 'destructive' });
    },
  });

  // Accept/Decline request mutations
  const respondToRequestMutation = useMutation({
    mutationFn: async ({ requestId, action }: { requestId: string; action: 'accept' | 'decline' }) => {
      const response = await fetch(`/api/collaborations/request/${requestId}/${action}`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error(`Failed to ${action} request`);
      return response.json();
    },
    onSuccess: (_, { action }) => {
      toast({
        title: action === 'accept' ? 'Request Accepted!' : 'Request Declined',
        description: action === 'accept' ? 'You can now create content together.' : 'The request has been declined.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/collaborations/requests'] });
    },
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  // Mock data for demonstration
  const mockRequests: CollabRequest[] = collabRequests.length > 0 ? collabRequests : [
    {
      id: '1',
      fromUser: {
        id: '101',
        username: 'HotCreator',
        avatarUrl: undefined,
        isVerified: true,
        subscriberCount: 15000,
      },
      toUser: { id: user?.id || '', username: user?.username || '', avatarUrl: undefined, isVerified: true },
      type: 'collab_post',
      message: 'Hey! I love your content. Would you be interested in doing a collab together? I think our audiences would love it!',
      status: 'pending',
      revenueShare: 50,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      expiresAt: new Date(Date.now() + 604800000).toISOString(),
    },
    {
      id: '2',
      fromUser: {
        id: '102',
        username: 'TopModel',
        avatarUrl: undefined,
        isVerified: true,
        subscriberCount: 8500,
      },
      toUser: { id: user?.id || '', username: user?.username || '', avatarUrl: undefined, isVerified: true },
      type: 'promo_exchange',
      message: 'Looking to do a shoutout exchange! I have 8.5K subs and great engagement.',
      status: 'pending',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      expiresAt: new Date(Date.now() + 604800000).toISOString(),
    },
  ];

  const mockCollabPosts: CollabPost[] = collabPosts.length > 0 ? collabPosts : [
    {
      id: 'cp1',
      participants: [
        { userId: user?.id || '', username: user?.username || 'You', avatarUrl: undefined, isVerified: true, revenueShare: 50 },
        { userId: '101', username: 'HotCreator', avatarUrl: undefined, isVerified: true, revenueShare: 50 },
      ],
      content: 'Our amazing collab! Check out what happens when two creators combine forces...',
      mediaUrls: [],
      likesCount: 2341,
      commentsCount: 156,
      repostsCount: 89,
      viewsCount: 12500,
      earningsTotal: 45600,
      visibility: 'subscribers',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const incomingRequests = mockRequests.filter(r => r.toUser.id === user?.id && r.status === 'pending');
  const outgoingRequests = mockRequests.filter(r => r.fromUser.id === user?.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Users className="h-8 w-8 text-purple-400" />
              Collaborations
            </h1>
            <p className="text-gray-400 mt-1">Partner with other creators, share content, and grow together</p>
          </div>
          <Button
            onClick={() => setShowCollabDialog(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            New Collaboration
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{mockCollabPosts.length}</p>
                  <p className="text-gray-400 text-sm">Collabs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{incomingRequests.length}</p>
                  <p className="text-gray-400 text-sm">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-600/20 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatCurrency(mockCollabPosts.reduce((sum, p) => sum + p.earningsTotal, 0))}
                  </p>
                  <p className="text-gray-400 text-sm">Collab Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-600/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(mockCollabPosts.reduce((sum, p) => sum + p.viewsCount, 0))}
                  </p>
                  <p className="text-gray-400 text-sm">Total Reach</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white/5 border border-purple-500/30 p-1">
            <TabsTrigger value="requests" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Requests
              {incomingRequests.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs">{incomingRequests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Active Collabs
            </TabsTrigger>
            <TabsTrigger value="reposts" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Repeat2 className="h-4 w-4 mr-2" />
              Quote Reposts
            </TabsTrigger>
            <TabsTrigger value="discover" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Search className="h-4 w-4 mr-2" />
              Discover Creators
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-6">
            {/* Incoming Requests */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Incoming Requests ({incomingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {incomingRequests.map((request) => (
                      <div key={request.id} className="p-4 rounded-lg bg-white/5 border border-purple-500/20">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={request.fromUser.avatarUrl} />
                            <AvatarFallback className="bg-purple-600 text-white">
                              {request.fromUser.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-white font-medium">{request.fromUser.username}</span>
                              {request.fromUser.isVerified && (
                                <Crown className="h-4 w-4 text-blue-400" />
                              )}
                              <Badge className="bg-purple-500/20 text-purple-300 text-xs">
                                {formatNumber(request.fromUser.subscriberCount)} subs
                              </Badge>
                            </div>
                            <Badge className={`text-xs mb-2 ${
                              request.type === 'collab_post' ? 'bg-pink-500/20 text-pink-300' :
                              request.type === 'quote_repost' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-green-500/20 text-green-300'
                            }`}>
                              {request.type === 'collab_post' ? 'Collab Post' :
                               request.type === 'quote_repost' ? 'Quote Repost' : 'Promo Exchange'}
                            </Badge>
                            <p className="text-gray-300 text-sm">{request.message}</p>
                            {request.revenueShare && (
                              <p className="text-purple-300 text-sm mt-2">
                                Proposed split: {request.revenueShare}% / {100 - request.revenueShare}%
                              </p>
                            )}
                            <p className="text-gray-500 text-xs mt-2">
                              Expires: {new Date(request.expiresAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-500"
                              onClick={() => respondToRequestMutation.mutate({ requestId: request.id, action: 'accept' })}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-red-500/50 text-red-300 hover:bg-red-500/20"
                              onClick={() => respondToRequestMutation.mutate({ requestId: request.id, action: 'decline' })}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outgoing Requests */}
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="h-5 w-5 text-blue-400" />
                  Sent Requests ({outgoingRequests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {outgoingRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="h-12 w-12 mx-auto text-gray-500/50 mb-3" />
                    <p className="text-gray-500">No sent requests</p>
                    <Button
                      size="sm"
                      className="mt-3 bg-purple-600 hover:bg-purple-500"
                      onClick={() => setShowCollabDialog(true)}
                    >
                      Start a Collaboration
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {outgoingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-purple-600/50 text-white">
                              {request.toUser.username[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-white font-medium text-sm">{request.toUser.username}</p>
                            <p className="text-gray-400 text-xs">
                              {request.type === 'collab_post' ? 'Collab Post' : 'Promo Exchange'}
                            </p>
                          </div>
                        </div>
                        <Badge className={`text-xs ${
                          request.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300' :
                          request.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                          'bg-red-500/20 text-red-300'
                        }`}>
                          {request.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Collabs Tab */}
          <TabsContent value="active" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white">Active Collaborations</CardTitle>
                <CardDescription className="text-gray-400">Content you've created with other creators</CardDescription>
              </CardHeader>
              <CardContent>
                {mockCollabPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto text-purple-500/50 mb-4" />
                    <p className="text-gray-400 mb-4">No collaborations yet</p>
                    <Button
                      className="bg-purple-600 hover:bg-purple-500"
                      onClick={() => setShowCollabDialog(true)}
                    >
                      Start Your First Collab
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockCollabPosts.map((post) => (
                      <div key={post.id} className="p-4 rounded-lg bg-white/5 border border-purple-500/20">
                        {/* Participants */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex -space-x-2">
                            {post.participants.map((p, i) => (
                              <Avatar key={p.userId} className="h-8 w-8 ring-2 ring-gray-900">
                                <AvatarFallback className="bg-purple-600 text-white text-xs">
                                  {p.username[0]}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                          </div>
                          <span className="text-gray-300 text-sm">
                            {post.participants.map(p => p.username).join(' & ')}
                          </span>
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs ml-auto">
                            {post.visibility === 'public' ? <Globe className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                            {post.visibility}
                          </Badge>
                        </div>

                        {/* Content Preview */}
                        <p className="text-white text-sm mb-3 line-clamp-2">{post.content}</p>

                        {/* Stats */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {formatNumber(post.viewsCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {formatNumber(post.likesCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              {formatNumber(post.commentsCount)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Repeat2 className="h-4 w-4" />
                              {formatNumber(post.repostsCount)}
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-green-400 font-medium">{formatCurrency(post.earningsTotal)}</p>
                            <p className="text-gray-500 text-xs">total earnings</p>
                          </div>
                        </div>

                        {/* Revenue Split */}
                        <div className="mt-3 pt-3 border-t border-purple-500/20">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-400">Revenue Split:</span>
                            <div className="flex items-center gap-2">
                              {post.participants.map((p, i) => (
                                <span key={p.userId} className="flex items-center gap-1">
                                  <span className="text-white">{p.username}</span>
                                  <span className="text-purple-300">({p.revenueShare}%)</span>
                                  {i < post.participants.length - 1 && <span className="text-gray-500">|</span>}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Quote Reposts Tab */}
          <TabsContent value="reposts" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Repeat2 className="h-5 w-5 text-green-400" />
                  Quote Reposts
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Share other creators' content with your commentary
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Repeat2 className="h-16 w-16 mx-auto text-purple-500/50 mb-4" />
                  <p className="text-gray-400 mb-4">No quote reposts yet</p>
                  <Button
                    variant="outline"
                    className="border-purple-500/50 text-purple-300"
                    onClick={() => setShowQuoteDialog(true)}
                  >
                    <Repeat2 className="h-4 w-4 mr-2" />
                    Create Quote Repost
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-lg border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="h-5 w-5 text-blue-400" />
                  Find Creators to Collaborate With
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search Input */}
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search creators by username or category..."
                    className="pl-10 bg-white/5 border-purple-500/30 text-white"
                  />
                </div>

                {/* Suggested Creators */}
                <div className="space-y-3">
                  <h3 className="text-gray-400 text-sm font-medium">Suggested for You</h3>
                  {[
                    { id: '201', username: 'FitnessGuru', subscriberCount: 25000, categories: ['Fitness', 'Lifestyle'], isVerified: true },
                    { id: '202', username: 'TravelExplorer', subscriberCount: 18000, categories: ['Travel', 'Adventure'], isVerified: true },
                    { id: '203', username: 'ArtisticSoul', subscriberCount: 12000, categories: ['Art', 'Creative'], isVerified: false },
                  ].map((creator) => (
                    <div key={creator.id} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                            {creator.username[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{creator.username}</span>
                            {creator.isVerified && <Crown className="h-4 w-4 text-blue-400" />}
                          </div>
                          <p className="text-gray-400 text-sm">{formatNumber(creator.subscriberCount)} subscribers</p>
                          <div className="flex gap-1 mt-1">
                            {creator.categories.map((cat) => (
                              <Badge key={cat} variant="outline" className="text-xs border-purple-500/30 text-purple-300">
                                {cat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-purple-500/50 text-purple-300 hover:bg-purple-500/20"
                        onClick={() => {
                          setSelectedCreator(creator);
                          setShowCollabDialog(true);
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Collaboration Dialog */}
        <Dialog open={showCollabDialog} onOpenChange={setShowCollabDialog}>
          <DialogContent className="bg-gray-900 border-purple-500/30 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-400" />
                New Collaboration Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              {selectedCreator && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-500/10">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-purple-600 text-white">
                      {selectedCreator.username[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-medium">{selectedCreator.username}</p>
                    <p className="text-gray-400 text-sm">{formatNumber(selectedCreator.subscriberCount)} subscribers</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white">Collaboration Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'collab_post', label: 'Collab Post', icon: Users },
                    { value: 'promo_exchange', label: 'Promo Exchange', icon: Share2 },
                  ].map(({ value, label, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={newCollab.type === value ? 'default' : 'outline'}
                      className={newCollab.type === value
                        ? 'bg-purple-600'
                        : 'border-purple-500/50 text-purple-300'}
                      onClick={() => setNewCollab({ ...newCollab, type: value as typeof newCollab.type })}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>

              {newCollab.type === 'collab_post' && (
                <div className="space-y-2">
                  <Label className="text-white">Revenue Split (%)</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min={10}
                      max={90}
                      value={newCollab.revenueShare}
                      onChange={(e) => setNewCollab({ ...newCollab, revenueShare: parseInt(e.target.value) })}
                      className="w-24 bg-white/5 border-purple-500/30 text-white"
                    />
                    <span className="text-gray-400">You: {newCollab.revenueShare}% | Them: {100 - newCollab.revenueShare}%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-white">Message</Label>
                <Textarea
                  value={newCollab.message}
                  onChange={(e) => setNewCollab({ ...newCollab, message: e.target.value })}
                  placeholder="Introduce yourself and explain what you have in mind..."
                  className="bg-white/5 border-purple-500/30 text-white min-h-[100px]"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-purple-500/50 text-purple-300"
                  onClick={() => setShowCollabDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                  disabled={!newCollab.message || sendRequestMutation.isPending}
                  onClick={() => {
                    if (selectedCreator) {
                      sendRequestMutation.mutate({
                        toUserId: selectedCreator.id,
                        ...newCollab,
                      });
                    }
                  }}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Social Share Buttons - Fixed Position */}
        <div className="fixed bottom-6 right-6 flex flex-col gap-2">
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-blue-600 hover:bg-blue-500 shadow-lg"
            onClick={() => {
              const text = `Check out my profile on BoyFanz!`;
              const url = window.location.origin;
              window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
            }}
          >
            <Twitter className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="rounded-full w-14 h-14 bg-purple-600 hover:bg-purple-500 shadow-lg"
            onClick={() => {
              navigator.clipboard.writeText(window.location.origin);
              toast({ title: 'Link Copied!', description: 'Share your profile anywhere!' });
            }}
          >
            <Link2 className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
