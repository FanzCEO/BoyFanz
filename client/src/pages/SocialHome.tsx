import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useCSRF } from '@/hooks/useCSRF';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Link } from 'wouter';
import { SidebarAdStack, FeedAd } from '@/components/ads/AdBanner';
import { CoStarPromptModal } from '@/components/costar/CoStarPromptModal';
import { CoStarInviteForm } from '@/components/costar/CoStarInviteForm';
import {
  Heart,
  MessageCircle,
  Share,
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
  Plus,
  Shield,
  BarChart3,
  X,
  Trash2
} from 'lucide-react';
import { useState } from 'react';

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
  createdAt: string;
  creator?: {
    username: string;
    profileImageUrl?: string;
    isVerified: boolean;
  };
}

interface Creator {
  id: string;
  username: string;
  profileImageUrl?: string;
  isVerified: boolean;
  followerCount: number;
  score: number;
}

const PostTypeIcon = ({ type }: { type: string }) => {
  const icons = {
    photo: Camera,
    video: Video,
    audio: Music,
    text: Type,
    reel: Play,
    story: Clock,
    live: Users,
  };
  const Icon = icons[type as keyof typeof icons] || Camera;
  return <Icon className="h-4 w-4" />;
};

const PostCard = ({ post }: { post: Post }) => {
  const { toast } = useToast();

  const likeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/posts/like', { postId: post.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      toast({
        title: "Liked!",
        description: "Added to your likes",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-card border-border" data-testid={`post-card-${post.id}`}>
      {/* Post Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/creator/${post.creatorId}`}>
              <Avatar className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src={post.creator?.profileImageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {post.creator?.username?.[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div>
              <Link href={`/creator/${post.creatorId}`}>
                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                  <span className="font-semibold text-sm" data-testid={`creator-name-${post.id}`}>
                    {post.creator?.username || 'Creator'}
                  </span>
                  {post.creator?.isVerified && (
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      ✓
                    </Badge>
                  )}
                </div>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <PostTypeIcon type={post.type} />
                <span className="capitalize">{post.type}</span>
                <span>•</span>
                <span data-testid={`post-time-${post.id}`}>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.visibility === 'premium' && (
              <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
                {formatCurrency(post.priceCents)}
              </Badge>
            )}
            {post.visibility === 'subscribers_only' && (
              <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                Subscribers
              </Badge>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {post.title && (
          <h3 className="text-lg leading-tight font-semibold" data-testid={`post-title-${post.id}`}>
            {post.title}
          </h3>
        )}
      </CardHeader>

      {/* Post Content */}
      <CardContent className="pt-0">
        {post.content && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`post-content-${post.id}`}>
            {post.content}
          </p>
        )}

        {/* Media Preview */}
        {(post.thumbnailUrl || post.mediaUrls.length > 0) && (
          <Link href={`/post/${post.id}`}>
            <div className="relative aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg overflow-hidden cursor-pointer hover:opacity-95 transition-opacity group">
              {post.thumbnailUrl ? (
                <img 
                  src={post.thumbnailUrl} 
                  alt={post.title || 'Post media'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : post.mediaUrls[0] ? (
                <img 
                  src={post.mediaUrls[0]} 
                  alt={post.title || 'Post media'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <PostTypeIcon type={post.type} />
                </div>
              )}
              
              {post.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-full p-4 group-hover:bg-black/80 transition-colors">
                    <Play className="h-8 w-8 text-white fill-current" />
                  </div>
                </div>
              )}

              {post.type === 'live' && (
                <div className="absolute top-3 left-3">
                  <Badge className="bg-red-500 text-white animate-pulse">
                    LIVE
                  </Badge>
                </div>
              )}

              {post.mediaUrls.length > 1 && (
                <div className="absolute top-3 right-3">
                  <Badge variant="secondary" className="text-xs">
                    +{post.mediaUrls.length - 1}
                  </Badge>
                </div>
              )}
            </div>
          </Link>
        )}

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.hashtags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-xs text-primary hover:text-primary/80 cursor-pointer">
                #{tag}
              </span>
            ))}
            {post.hashtags.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{post.hashtags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 hover:text-red-400 hover:bg-red-400/10"
              onClick={handleLike}
              data-testid={`like-button-${post.id}`}
            >
              <Heart className="h-4 w-4" />
              <span className="text-sm" data-testid={`likes-count-${post.id}`}>
                {post.likesCount}
              </span>
            </Button>

            <Link href={`/post/${post.id}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2 hover:text-blue-400 hover:bg-blue-400/10"
                data-testid={`comments-button-${post.id}`}
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm" data-testid={`comments-count-${post.id}`}>
                  {post.commentsCount}
                </span>
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2 hover:text-green-400 hover:bg-green-400/10"
              data-testid={`share-button-${post.id}`}
            >
              <Share className="h-4 w-4" />
              <span className="text-sm">Share</span>
            </Button>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            <span data-testid={`views-count-${post.id}`}>{post.viewsCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface PollOption {
  text: string;
}

const PostComposer = () => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPollCreator, setShowPollCreator] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState<PollOption[]>([{ text: '' }, { text: '' }]);
  const [pollDuration, setPollDuration] = useState(24); // hours
  const [isMultiChoice, setIsMultiChoice] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { csrfToken, isLoading: csrfLoading } = useCSRF();

  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, { text: '' }]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, text: string) => {
    const updated = [...pollOptions];
    updated[index] = { text };
    setPollOptions(updated);
  };

  const clearPoll = () => {
    setShowPollCreator(false);
    setPollQuestion('');
    setPollOptions([{ text: '' }, { text: '' }]);
    setPollDuration(24);
    setIsMultiChoice(false);
  };

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      content: string;
      type: string;
      poll?: {
        question: string;
        options: string[];
        durationHours: number;
        isMultiChoice: boolean;
      };
    }) => {
      if (!csrfToken) {
        throw new Error('CSRF token not available. Please refresh the page.');
      }
      return apiRequest('POST', '/api/posts', postData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/infinity-feed'] });
      setContent('');
      setIsExpanded(false);
      clearPoll();
      toast({
        title: "Posted!",
        description: showPollCreator ? "Your poll has been published" : "Your post has been published",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!csrfToken) {
      toast({
        title: "Error",
        description: "Security token not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    // Validate poll if creating one
    if (showPollCreator) {
      if (!pollQuestion.trim()) {
        toast({ title: "Error", description: "Please enter a poll question", variant: "destructive" });
        return;
      }
      const validOptions = pollOptions.filter(o => o.text.trim());
      if (validOptions.length < 2) {
        toast({ title: "Error", description: "Please add at least 2 poll options", variant: "destructive" });
        return;
      }
      createPostMutation.mutate({
        content: content || pollQuestion,
        type: 'poll',
        poll: {
          question: pollQuestion,
          options: validOptions.map(o => o.text.trim()),
          durationHours: pollDuration,
          isMultiChoice,
        }
      });
    } else {
      if (!content.trim()) return;
      createPostMutation.mutate({ content, type: 'text' });
    }
  };

  return (
    <Card className="mb-6 bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder={showPollCreator ? "Add context to your poll (optional)..." : "Write something..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              className="min-h-[100px] border-none bg-muted/50 resize-none focus:ring-0 focus:border-none"
              data-testid="post-composer-textarea"
            />

            {/* Poll Creator UI */}
            {showPollCreator && (
              <div className="mt-4 p-4 border border-primary/30 rounded-lg bg-primary/5">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Create Poll
                  </h4>
                  <Button variant="ghost" size="sm" onClick={clearPoll} className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Poll Question */}
                <Input
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                  className="mb-3 bg-background"
                  data-testid="poll-question-input"
                />

                {/* Poll Options */}
                <div className="space-y-2 mb-3">
                  {pollOptions.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => updatePollOption(index, e.target.value)}
                        className="flex-1 bg-background"
                        data-testid={`poll-option-${index}`}
                      />
                      {pollOptions.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePollOption(index)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add Option Button */}
                {pollOptions.length < 6 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                    className="w-full mb-3"
                    data-testid="add-poll-option"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                )}

                {/* Poll Settings */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isMultiChoice}
                        onChange={(e) => setIsMultiChoice(e.target.checked)}
                        className="rounded border-muted-foreground"
                      />
                      <span className="text-muted-foreground">Multiple choice</span>
                    </label>
                  </div>
                  <select
                    value={pollDuration}
                    onChange={(e) => setPollDuration(Number(e.target.value))}
                    className="text-sm bg-background border border-border rounded px-2 py-1"
                    data-testid="poll-duration-select"
                  >
                    <option value={1}>1 hour</option>
                    <option value={6}>6 hours</option>
                    <option value={12}>12 hours</option>
                    <option value={24}>1 day</option>
                    <option value={72}>3 days</option>
                    <option value={168}>7 days</option>
                  </select>
                </div>
              </div>
            )}

            {isExpanded && (
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="add-photo-button">
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="add-video-button">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="add-link-button">
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="add-emoji-button">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" data-testid="schedule-post-button">
                    <Calendar className="h-4 w-4" />
                  </Button>
                  {/* Poll Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`h-8 w-8 p-0 ${showPollCreator ? 'text-primary bg-primary/10' : ''}`}
                    onClick={() => setShowPollCreator(!showPollCreator)}
                    data-testid="add-poll-button"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">1000</span>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={handleSubmit}
                    disabled={
                      (showPollCreator ? !pollQuestion.trim() || pollOptions.filter(o => o.text.trim()).length < 2 : !content.trim()) ||
                      createPostMutation.isPending || csrfLoading || !csrfToken
                    }
                    data-testid="publish-button"
                  >
                    {csrfLoading ? 'Loading...' : createPostMutation.isPending ? 'Publishing...' : showPollCreator ? 'Create Poll' : 'Publish'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Leaderboard = () => {
  const { data: topCreators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators/leaderboard'],
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Leaderboard</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 bg-muted rounded-full" />
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded mb-1" />
                  <div className="h-2 bg-muted rounded" />
                </div>
              </div>
            ))
          ) : (
            topCreators.slice(0, 3).map((creator, index) => (
              <div key={creator.id} className="flex items-center gap-3" data-testid={`leaderboard-creator-${creator.id}`}>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-muted-foreground w-4">
                    {index + 1}.
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={creator.profileImageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {creator.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium truncate">{creator.username}</span>
                    {creator.isVerified && <span className="text-xs">✓</span>}
                  </div>
                  <Progress 
                    value={creator.score} 
                    className="h-1 mt-1" 
                    data-testid={`creator-progress-${creator.id}`}
                  />
                </div>
                
                <span className="text-sm font-bold text-right">
                  {creator.score}
                </span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ExploreCreators = () => {
  const { data: suggestedCreators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators/suggested'],
  });

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <h3 className="font-semibold text-sm">Explore Creators</h3>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 gap-3">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="text-center">
                <div className="h-16 w-16 bg-muted rounded-full mx-auto mb-2 animate-pulse" />
                <div className="h-3 bg-muted rounded" />
              </div>
            ))
          ) : (
            suggestedCreators.slice(0, 6).map((creator) => (
              <Link key={creator.id} href={`/creator/${creator.id}`}>
                <div className="text-center cursor-pointer hover:opacity-80 transition-opacity" data-testid={`suggested-creator-${creator.id}`}>
                  <Avatar className="h-16 w-16 mx-auto mb-2">
                    <AvatarImage src={creator.profileImageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {creator.username[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-medium truncate">{creator.username}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const AdSpace = () => {
  return (
    <div className="space-y-4">
      {/* Premium Ad Slots */}
      <SidebarAdStack count={2} />

      {/* Advertise With Us CTA */}
      <Card className="bg-card border-border">
        <CardContent className="p-4 text-center">
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-lg p-6 border border-amber-500/20">
            <div className="flex items-center justify-center mb-2">
              <Plus className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-sm font-semibold text-foreground">Advertise With Us</p>
            <p className="text-xs text-muted-foreground mt-1 mb-3">Reach thousands of engaged users</p>
            <Link href="/ads">
              <Button size="sm" variant="outline" className="bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20 text-amber-600">
                Get Started
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface FeedData {
  posts: Post[];
}

export default function SocialHome() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Co-star verification modal state
  const [showCoStarPrompt, setShowCoStarPrompt] = useState(false);
  const [showCoStarInvite, setShowCoStarInvite] = useState(false);
  const [coStarDismissed, setCoStarDismissed] = useState(false);

  const { data: feedData, isLoading: postsLoading } = useQuery<FeedData>({
    queryKey: ['/api/feed'],
  });

  const posts: Post[] = feedData?.posts || [];

  const { data: userWithStory } = useQuery({
    queryKey: ['/api/user/story-status'],
  });

  // Co-star handlers
  const handleCoStarYes = () => {
    setShowCoStarPrompt(true);
  };

  const handleCoStarNo = () => {
    setCoStarDismissed(true);
    toast({
      title: "Got it!",
      description: "You can always add co-stars later from your uploads.",
    });
  };

  const handleNoCoStar = () => {
    setShowCoStarPrompt(false);
    setCoStarDismissed(true);
    toast({
      title: "Solo content confirmed",
      description: "You're all set to upload solo content.",
    });
  };

  const handleHasCoStar = () => {
    setShowCoStarPrompt(false);
    setShowCoStarInvite(true);
  };

  const handleCoStarInviteComplete = (invitations: any[]) => {
    setShowCoStarInvite(false);
    setCoStarDismissed(true);
    toast({
      title: "Invitations sent!",
      description: `${invitations.length} co-star verification${invitations.length > 1 ? 's' : ''} created successfully.`,
    });
  };

  return (
    <div className="min-h-screen bg-background" data-testid="social-home">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Story Section */}
            <div className="mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarImage src={user?.profileImageUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button 
                    size="sm" 
                    className="absolute -bottom-1 -right-1 h-6 w-16 text-xs bg-red-600 hover:bg-red-700 text-white rounded-full"
                    data-testid="add-story-button"
                  >
                    Add story
                  </Button>
                </div>
              </div>
            </div>

            {/* Post Composer */}
            <PostComposer />

            {/* Co-star Verification Prompt */}
            {!coStarDismissed ? (
              <Card className="mb-6 bg-gradient-to-r from-primary/10 to-yellow-500/10 border-primary/20" data-testid="costar-prompt-card">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">2257 Compliance Check</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Does your content feature any other performers? Federal law requires verification of all performers.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleCoStarYes}
                          className="bg-primary hover:bg-primary/90"
                          data-testid="costar-yes-button"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Yes, I have co-stars
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCoStarNo}
                          data-testid="costar-no-button"
                        >
                          Solo content only
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="mb-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCoStarDismissed(false)}
                  className="text-muted-foreground hover:text-primary"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Add Co-Stars
                </Button>
              </div>
            )}

            {/* Posts Feed */}
            <div className="space-y-6">
              {postsLoading ? (
                [...Array(3)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-muted rounded-full" />
                        <div className="space-y-2">
                          <div className="h-4 w-32 bg-muted rounded" />
                          <div className="h-3 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-video bg-muted rounded-lg mb-4" />
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-3/4 bg-muted rounded" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : posts.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <div className="space-y-4">
                      <Camera className="h-16 w-16 mx-auto text-muted-foreground/50" />
                      <div>
                        <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">
                          Start following creators to see their posts in your feed
                        </p>
                        <Link href="/search">
                          <Button data-testid="discover-creators-button">
                            Discover Creators
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post: Post, index: number) => (
                  <div key={post.id}>
                    <PostCard post={post} />
                    {/* Insert native ad every 4 posts */}
                    {(index + 1) % 4 === 0 && index < posts.length - 1 && (
                      <FeedAd className="mt-6" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <Leaderboard />
            <ExploreCreators />
            <AdSpace />
          </div>
        </div>
      </div>

      {/* Co-Star Verification Modals */}
      <CoStarPromptModal
        isOpen={showCoStarPrompt}
        onClose={() => setShowCoStarPrompt(false)}
        onNoCoStar={handleNoCoStar}
        onHasCoStar={handleHasCoStar}
      />

      <CoStarInviteForm
        isOpen={showCoStarInvite}
        onClose={() => setShowCoStarInvite(false)}
        onComplete={handleCoStarInviteComplete}
        onBack={() => {
          setShowCoStarInvite(false);
          setShowCoStarPrompt(true);
        }}
      />
    </div>
  );
}