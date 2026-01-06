import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  Flame,
  Calendar,
  Upload,
  Image,
  Video,
  FileText,
  Wand2,
  Palette,
  Clock,
  BarChart3,
  Settings,
  Plus,
  Trash2,
  Edit,
  Copy,
  Eye,
  Send,
  Save,
  Layers,
  Filter,
  Droplets,
  Type,
  Hash,
  Zap,
  ArrowRight,
  Check,
  X,
  Play,
  Pause,
  MoreVertical,
  Download,
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  List,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  content: string;
  mediaUrls: string[];
  scheduledFor: string;
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  visibility: 'public' | 'subscribers' | 'ppv';
  ppvPrice?: number;
}

interface ContentTemplate {
  id: string;
  name: string;
  content: string;
  tags: string[];
  visibility: 'public' | 'subscribers' | 'ppv';
  ppvPrice?: number;
  createdAt: string;
}

interface WatermarkPreset {
  id: string;
  name: string;
  text?: string;
  imageUrl?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  size: number;
}

// Quick Action Card Component
const QuickAction = ({
  icon: Icon,
  title,
  description,
  onClick,
  color = 'primary'
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
  color?: string;
}) => (
  <Card
    className="cursor-pointer hover:border-primary/50 transition-all hover:shadow-lg"
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className={`w-12 h-12 rounded-xl bg-${color}/10 flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 text-${color}`} />
      </div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

// Calendar Day Component
const CalendarDay = ({
  date,
  posts,
  isToday,
  isCurrentMonth,
  onClick
}: {
  date: Date;
  posts: ScheduledPost[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}) => (
  <div
    className={cn(
      "min-h-[100px] p-2 border rounded-lg cursor-pointer transition-colors",
      isToday && "border-primary bg-primary/5",
      !isCurrentMonth && "opacity-50 bg-muted/30",
      "hover:border-primary/50"
    )}
    onClick={onClick}
  >
    <div className={cn(
      "text-sm font-medium mb-1",
      isToday && "text-primary"
    )}>
      {date.getDate()}
    </div>
    <div className="space-y-1">
      {posts.slice(0, 3).map((post, i) => (
        <div
          key={post.id}
          className={cn(
            "text-xs p-1 rounded truncate",
            post.status === 'scheduled' && "bg-blue-500/20 text-blue-400",
            post.status === 'published' && "bg-green-500/20 text-green-400",
            post.status === 'failed' && "bg-red-500/20 text-red-400"
          )}
        >
          {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      ))}
      {posts.length > 3 && (
        <div className="text-xs text-muted-foreground">+{posts.length - 3} more</div>
      )}
    </div>
  </div>
);

export default function BreedingZone() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [aiCaption, setAiCaption] = useState('');
  const [isGeneratingCaption, setIsGeneratingCaption] = useState(false);

  // Fetch scheduled posts from Breeding Zone API
  const { data: scheduledPostsResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/breeding-zone/scheduled'],
    staleTime: 60000
  });

  // Map backend data to frontend format
  const scheduledPosts: ScheduledPost[] = (scheduledPostsResponse?.data || []).map((post: any) => ({
    id: post.id,
    content: post.caption || '',
    mediaUrls: typeof post.mediaAssetIds === 'string' ? JSON.parse(post.mediaAssetIds) : (post.mediaAssetIds || []),
    scheduledFor: post.scheduledFor,
    status: post.status,
    visibility: post.visibility,
    ppvPrice: post.ppvPriceCents ? post.ppvPriceCents / 100 : undefined
  }));

  // Fetch templates from Breeding Zone API
  const { data: templatesResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/breeding-zone/templates'],
    staleTime: 60000
  });

  // Map backend template data to frontend format
  const templates: ContentTemplate[] = (templatesResponse?.data || []).map((tmpl: any) => ({
    id: tmpl.id,
    name: tmpl.name,
    content: tmpl.captionTemplate || '',
    tags: typeof tmpl.tags === 'string' ? JSON.parse(tmpl.tags || '[]') : (tmpl.tags || []),
    visibility: tmpl.visibility,
    ppvPrice: tmpl.ppvPriceCents ? tmpl.ppvPriceCents / 100 : undefined,
    createdAt: tmpl.createdAt
  }));

  // Fetch watermark presets (using creator route for now - can be migrated later)
  const { data: watermarks = [] } = useQuery<WatermarkPreset[]>({
    queryKey: ['/api/creator/watermarks'],
    staleTime: 60000
  });

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const days: { date: Date; posts: ScheduledPost[]; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = startPadding - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push({
        date,
        posts: scheduledPosts.filter(p =>
          new Date(p.scheduledFor).toDateString() === date.toDateString()
        ),
        isCurrentMonth: false
      });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        posts: scheduledPosts.filter(p =>
          new Date(p.scheduledFor).toDateString() === date.toDateString()
        ),
        isCurrentMonth: true
      });
    }

    // Next month padding
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        posts: scheduledPosts.filter(p =>
          new Date(p.scheduledFor).toDateString() === date.toDateString()
        ),
        isCurrentMonth: false
      });
    }

    return days;
  };

  // AI Caption Generator
  const generateAICaption = async (context: string) => {
    setIsGeneratingCaption(true);
    try {
      const res = await fetch('/api/ai/generate-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ context })
      });
      if (res.ok) {
        const data = await res.json();
        setAiCaption(data.caption);
        toast({ title: 'Caption generated!', description: 'You can edit it before using.' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate caption', variant: 'destructive' });
    } finally {
      setIsGeneratingCaption(false);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calendarDays = generateCalendarDays();

  const upcomingPosts = scheduledPosts
    .filter(p => p.status === 'scheduled' && new Date(p.scheduledFor) > new Date())
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-900/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden py-8 bg-gradient-to-r from-red-600/20 to-orange-500/20">
        <div className="absolute inset-0 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-xl">
                <Flame className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Breeding Zone</h1>
                <p className="text-gray-300">Premium Creator Tools</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowScheduleDialog(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Schedule Post
              </Button>
              <Button className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Quick Post
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="bg-gray-800/50 p-1">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="batch">Batch Upload</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="ai">AI Tools</TabsTrigger>
            <TabsTrigger value="watermarks">Watermarks</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                  icon={Calendar}
                  title="Schedule Content"
                  description="Plan posts for the future"
                  onClick={() => setActiveTab('calendar')}
                  color="blue"
                />
                <QuickAction
                  icon={Upload}
                  title="Batch Upload"
                  description="Upload multiple files at once"
                  onClick={() => setActiveTab('batch')}
                  color="green"
                />
                <QuickAction
                  icon={Wand2}
                  title="AI Caption"
                  description="Generate captions with AI"
                  onClick={() => setActiveTab('ai')}
                  color="purple"
                />
                <QuickAction
                  icon={Layers}
                  title="Templates"
                  description="Save & reuse post templates"
                  onClick={() => setActiveTab('templates')}
                  color="pink"
                />
              </div>
            </div>

            {/* Upcoming Posts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-400" />
                    Upcoming Scheduled Posts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingPosts.length > 0 ? (
                    <div className="space-y-3">
                      {upcomingPosts.map(post => (
                        <div
                          key={post.id}
                          className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                              {post.mediaUrls.length > 0 ? (
                                <Image className="h-4 w-4 text-blue-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-blue-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm text-gray-300 line-clamp-1">{post.content}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(post.scheduledFor).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Send className="h-4 w-4 mr-2" />
                                Post Now
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-400">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Cancel
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No scheduled posts</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => setShowScheduleDialog(true)}
                      >
                        Schedule Your First Post
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-green-400" />
                    Zone Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{scheduledPosts.length}</p>
                      <p className="text-xs text-gray-400">Scheduled Posts</p>
                    </div>
                    <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{templates.length}</p>
                      <p className="text-xs text-gray-400">Saved Templates</p>
                    </div>
                    <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">{watermarks.length}</p>
                      <p className="text-xs text-gray-400">Watermark Presets</p>
                    </div>
                    <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-white">0</p>
                      <p className="text-xs text-gray-400">Batch Uploads Today</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Templates */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-pink-400" />
                  Recent Templates
                </CardTitle>
                <Button variant="outline" size="sm" onClick={() => setActiveTab('templates')}>
                  View All
                </Button>
              </CardHeader>
              <CardContent>
                {templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.slice(0, 3).map(template => (
                      <Card key={template.id} className="bg-gray-700/50 border-gray-600">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-400 line-clamp-2">{template.content}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <Button variant="ghost" size="sm">
                              <Copy className="h-3 w-3 mr-1" />
                              Use
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No templates yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowTemplateDialog(true)}
                    >
                      Create Your First Template
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Content Calendar
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-white font-medium min-w-[150px] text-center">
                      {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date())}
                    >
                      Today
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
                      {day}
                    </div>
                  ))}
                  {calendarDays.map(({ date, posts, isCurrentMonth }, i) => (
                    <CalendarDay
                      key={i}
                      date={date}
                      posts={posts}
                      isToday={date.toDateString() === today.toDateString()}
                      isCurrentMonth={isCurrentMonth}
                      onClick={() => {
                        setSelectedDate(date);
                        setShowScheduleDialog(true);
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Batch Upload Tab */}
          <TabsContent value="batch" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Upload className="h-5 w-5 text-green-400" />
                  Batch Upload
                </CardTitle>
                <CardDescription>Upload multiple files at once and schedule them</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-600 rounded-xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    Drop files here or click to upload
                  </h3>
                  <p className="text-gray-400 mb-4">
                    Support for images and videos up to 500MB each
                  </p>
                  <div className="flex justify-center gap-4">
                    <Badge variant="outline" className="text-gray-400">
                      <Image className="h-3 w-3 mr-1" />
                      JPG, PNG, GIF, WEBP
                    </Badge>
                    <Badge variant="outline" className="text-gray-400">
                      <Video className="h-3 w-3 mr-1" />
                      MP4, MOV, WEBM
                    </Badge>
                  </div>
                  <Button className="mt-6">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                </div>

                <div className="mt-8">
                  <h4 className="font-medium text-white mb-4">Upload Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-blue-400" />
                          <div>
                            <p className="font-medium text-white">Auto-Schedule</p>
                            <p className="text-xs text-gray-400">Space posts evenly</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Droplets className="h-5 w-5 text-purple-400" />
                          <div>
                            <p className="font-medium text-white">Apply Watermark</p>
                            <p className="text-xs text-gray-400">Protect your content</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-700/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Wand2 className="h-5 w-5 text-pink-400" />
                          <div>
                            <p className="font-medium text-white">AI Captions</p>
                            <p className="text-xs text-gray-400">Generate for each</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Content Templates</h2>
              <Button onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map(template => (
                  <Card key={template.id} className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">{template.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant="outline">{template.visibility}</Badge>
                        {template.ppvPrice && (
                          <Badge className="bg-green-600">${template.ppvPrice}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{template.content}</p>
                      {template.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {template.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Copy className="h-3 w-3 mr-1" />
                          Use Template
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-400">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Layers className="h-16 w-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-lg font-medium text-white mb-2">No Templates Yet</h3>
                  <p className="text-gray-400 mb-6">
                    Save your favorite post formats as templates for quick reuse
                  </p>
                  <Button onClick={() => setShowTemplateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Template
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Tools Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Caption Generator */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-400" />
                    AI Caption Generator
                  </CardTitle>
                  <CardDescription>
                    Describe your content and let AI write engaging captions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Describe your content
                    </label>
                    <Textarea
                      placeholder="E.g., A seductive beach photoshoot at sunset, showing off my new swimwear..."
                      className="min-h-[100px] bg-gray-700/50 border-gray-600"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateAICaption('test')}
                      disabled={isGeneratingCaption}
                      className="flex-1 bg-gradient-to-r from-red-600 to-orange-500"
                    >
                      {isGeneratingCaption ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Wand2 className="h-4 w-4 mr-2" />
                          Generate Caption
                        </>
                      )}
                    </Button>
                  </div>
                  {aiCaption && (
                    <div className="p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs text-purple-400 font-medium">Generated Caption</span>
                        <Button variant="ghost" size="sm">
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-gray-300">{aiCaption}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hashtag Generator */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Hash className="h-5 w-5 text-blue-400" />
                    Hashtag Suggestions
                  </CardTitle>
                  <CardDescription>
                    Get relevant hashtags for better discoverability
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Content category
                    </label>
                    <Input
                      placeholder="E.g., fitness, lifestyle, cosplay..."
                      className="bg-gray-700/50 border-gray-600"
                    />
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Hash className="h-4 w-4 mr-2" />
                    Generate Hashtags
                  </Button>
                  <div className="flex flex-wrap gap-2">
                    {['#content', '#creator', '#exclusive', '#subscribe', '#premium'].map((tag, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-500/20"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Content Ideas */}
              <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    Content Ideas
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered content ideas based on trending topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: 'Behind the Scenes', desc: 'Show your creative process' },
                      { title: 'Q&A Session', desc: 'Answer fan questions' },
                      { title: 'Tutorial', desc: 'Teach something unique' },
                      { title: 'Day in the Life', desc: 'Personal vlog style' },
                      { title: 'Throwback', desc: 'Share past content' },
                      { title: 'Collab Idea', desc: 'Partner with another creator' }
                    ].map((idea, i) => (
                      <Card key={i} className="bg-gray-700/50 border-gray-600 cursor-pointer hover:border-yellow-500/50 transition-colors">
                        <CardContent className="p-4">
                          <h4 className="font-medium text-white mb-1">{idea.title}</h4>
                          <p className="text-sm text-gray-400">{idea.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Watermarks Tab */}
          <TabsContent value="watermarks" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Watermark Presets</h2>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Watermark
              </Button>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Watermark Preview */}
                  <div className="aspect-video bg-gray-700/50 rounded-xl relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image className="h-20 w-20 text-gray-500" />
                    </div>
                    <div className="absolute bottom-4 right-4 text-white/50 text-sm font-bold">
                      @YourUsername
                    </div>
                  </div>

                  {/* Watermark Settings */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Watermark Type
                      </label>
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Type className="h-4 w-4 mr-2" />
                          Text
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Image className="h-4 w-4 mr-2" />
                          Image
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Watermark Text
                      </label>
                      <Input
                        placeholder="@YourUsername"
                        className="bg-gray-700/50 border-gray-600"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Position
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Top Left', 'Top Right', 'Center', 'Bottom Left', 'Bottom Right'].map(pos => (
                          <Button key={pos} variant="outline" size="sm" className="text-xs">
                            {pos}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-300 mb-2 block">
                        Opacity: 50%
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        defaultValue="50"
                        className="w-full"
                      />
                    </div>

                    <Button className="w-full bg-gradient-to-r from-red-600 to-orange-500">
                      <Save className="h-4 w-4 mr-2" />
                      Save Watermark Preset
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Saved Presets */}
            {watermarks.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {watermarks.map(preset => (
                  <Card key={preset.id} className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-700/50 rounded-lg mb-3 relative">
                        <div className="absolute bottom-2 right-2 text-white/50 text-xs">
                          {preset.text || 'Image'}
                        </div>
                      </div>
                      <h4 className="font-medium text-white mb-1">{preset.name}</h4>
                      <p className="text-xs text-gray-400">
                        {preset.position} • {preset.opacity}% opacity
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Schedule Post Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Schedule a Post</DialogTitle>
            <DialogDescription>
              Create and schedule content for future publication
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Content</label>
              <Textarea
                placeholder="What's on your mind?"
                className="min-h-[100px] bg-gray-700/50 border-gray-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Date</label>
                <Input
                  type="date"
                  defaultValue={selectedDate?.toISOString().split('T')[0]}
                  className="bg-gray-700/50 border-gray-600"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Time</label>
                <Input
                  type="time"
                  className="bg-gray-700/50 border-gray-600"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Visibility</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Public</Button>
                <Button variant="outline" className="flex-1">Subscribers</Button>
                <Button variant="outline" className="flex-1">PPV</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button className="bg-gradient-to-r from-red-600 to-orange-500">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">Create Template</DialogTitle>
            <DialogDescription>
              Save your post format as a reusable template
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Template Name</label>
              <Input
                placeholder="E.g., Weekly Update"
                className="bg-gray-700/50 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Content</label>
              <Textarea
                placeholder="Your template content..."
                className="min-h-[100px] bg-gray-700/50 border-gray-600"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Tags (comma separated)</label>
              <Input
                placeholder="fitness, lifestyle, tips"
                className="bg-gray-700/50 border-gray-600"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
