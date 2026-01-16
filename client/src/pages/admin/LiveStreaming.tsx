import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Video, Users, Search, Filter, MoreHorizontal, AlertTriangle, Download,
  Upload, CheckCircle, XCircle, Eye, EyeOff, Calendar, Activity, Star,
  Trash2, Edit, Flag, Play, Pause, StopCircle, Settings, Shield,
  TrendingUp, BarChart3, PieChart, Clock, DollarSign, MessageSquare,
  RefreshCw, Zap, Wifi, WifiOff, Signal, Globe, Monitor, Camera,
  Volume2, VolumeX, Maximize, Minimize, RotateCcw, MapPin, Timer,
  Gauge, Archive, FileVideo, Radio, PhoneCall, VideoOff, Vibrate,
  Bluetooth, Link2, Power, Gamepad2, Save, Copy, Trash, Plus
} from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function LiveStreaming() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Filters and Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [qualityFilter, setQualityFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [viewerFilter, setViewerFilter] = useState('all');
  const [revenueFilter, setRevenueFilter] = useState('all');
  
  // Pagination and Sorting
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Bulk Operations
  const [selectedStreams, setSelectedStreams] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  
  // Dialogs and Modals
  const [showStreamDialog, setShowStreamDialog] = useState(false);
  const [showModerationDialog, setShowModerationDialog] = useState(false);
  const [showBulkOperationDialog, setShowBulkOperationDialog] = useState(false);
  const [showAnalyticsDialog, setShowAnalyticsDialog] = useState(false);
  const [showQualityDialog, setShowQualityDialog] = useState(false);
  const [showRestrictionsDialog, setShowRestrictionsDialog] = useState(false);
  const [selectedStream, setSelectedStream] = useState<any>(null);
  const [bulkOperation, setBulkOperation] = useState('');
  const [moderationReason, setModerationReason] = useState('');
  const [moderationNotes, setModerationNotes] = useState('');

  // Real-time updates every 30 seconds
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Lovense Integration State
  const [lovenseEnabled, setLovenseEnabled] = useState(true);
  const [lovenseApiKey, setLovenseApiKey] = useState('');
  const [lovenseWebhookUrl, setLovenseWebhookUrl] = useState('');
  const [selectedToy, setSelectedToy] = useState('');
  const [vibrationIntensity, setVibrationIntensity] = useState(50);
  const [vibrationPattern, setVibrationPattern] = useState('wave');
  const [tipToVibrateEnabled, setTipToVibrateEnabled] = useState(true);
  const [customPatterns, setCustomPatterns] = useState<any[]>([
    { id: 1, name: 'Gentle Wave', pattern: '1-5-1-5-1-5', duration: 10, tipAmount: 5 },
    { id: 2, name: 'Pulse', pattern: '10-0-10-0-10', duration: 15, tipAmount: 10 },
    { id: 3, name: 'Earthquake', pattern: '20-20-20', duration: 20, tipAmount: 25 },
    { id: 4, name: 'Fireworks', pattern: '1-10-20-10-1', duration: 30, tipAmount: 50 },
  ]);
  const [showPatternDialog, setShowPatternDialog] = useState(false);
  const [newPattern, setNewPattern] = useState({ name: '', pattern: '', duration: 10, tipAmount: 5 });

  // Fetch live streams with comprehensive filtering
  const { data: streamsData, isLoading, error, refetch } = useQuery<any>({
    queryKey: [
      '/api/admin/streams',
      {
        searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        creatorId: creatorFilter !== 'all' ? creatorFilter : undefined,
        quality: qualityFilter !== 'all' ? qualityFilter : undefined,
        duration: durationFilter !== 'all' ? durationFilter : undefined,
        viewerRange: viewerFilter !== 'all' ? viewerFilter : undefined,
        revenueRange: revenueFilter !== 'all' ? revenueFilter : undefined,
        page: currentPage,
        pageSize,
        sortBy,
        sortOrder
      }
    ] || user?.role === 'moderator',
    refetchInterval: autoRefresh ? 30000 : false
  });

  // Fetch real-time analytics
  const { data: streamStats } = useQuery<any>({
    queryKey: ['/api/admin/streams/stats'] || user?.role === 'moderator',
    refetchInterval: autoRefresh ? 10000 : false
  });

  // Fetch active stream analytics
  const { data: liveAnalytics } = useQuery<any>({
    queryKey: ['/api/admin/streams/live-analytics'] || user?.role === 'moderator',
    refetchInterval: autoRefresh ? 5000 : false
  });

  // Fetch creators for filter
  const { data: creators } = useQuery<any[]>({
    queryKey: ['/api/admin/creators'] || user?.role === 'moderator'
  });

  const streams = streamsData?.streams || [];
  const totalStreams = streamsData?.total || 0;
  const totalPages = Math.ceil(totalStreams / pageSize);
  
  // Mutations
  const terminateStreamMutation = useMutation({
    mutationFn: (data: { streamId: string; reason?: string; notify?: boolean }) => 
      apiRequest('/api/admin/streams/terminate', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Stream terminated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/streams'] });
    },
    onError: () => {
      toast({ title: "Failed to terminate stream", variant: "destructive" });
    }
  });

  const moderateStreamMutation = useMutation({
    mutationFn: (data: { streamId: string; action: string; reason?: string; notes?: string }) => 
      apiRequest('/api/admin/streams/moderate', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Stream moderated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/streams'] });
      setShowModerationDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to moderate stream", variant: "destructive" });
    }
  });

  const bulkOperationMutation = useMutation({
    mutationFn: (data: { streamIds: string[]; operation: string; data?: any }) => 
      apiRequest('/api/admin/streams/bulk', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Bulk operation completed successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/streams'] });
      setSelectedStreams([]);
      setShowBulkOperationDialog(false);
    },
    onError: () => {
      toast({ title: "Bulk operation failed", variant: "destructive" });
    }
  });

  const updateStreamMutation = useMutation({
    mutationFn: (data: { streamId: string; updates: any }) => 
      apiRequest(`/api/admin/streams/${data.streamId}`, {
        method: 'PATCH',
        body: JSON.stringify(data.updates)
      }),
    onSuccess: () => {
      toast({ title: "Stream updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/streams'] });
      setShowStreamDialog(false);
    },
    onError: () => {
      toast({ title: "Failed to update stream", variant: "destructive" });
    }
  });

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live': return <Badge className="bg-red-500 text-white animate-pulse"><Radio className="w-3 h-3 mr-1" />Live</Badge>;
      case 'scheduled': return <Badge className="bg-blue-500 text-white"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      case 'ended': return <Badge className="bg-gray-500 text-white"><StopCircle className="w-3 h-3 mr-1" />Ended</Badge>;
      case 'cancelled': return <Badge className="bg-red-500 text-white"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'public': return <Badge className="bg-green-500 text-white"><Globe className="w-3 h-3 mr-1" />Public</Badge>;
      case 'private': return <Badge className="bg-orange-500 text-white"><Shield className="w-3 h-3 mr-1" />Private</Badge>;
      case 'subscribers_only': return <Badge className="bg-purple-500 text-white"><Star className="w-3 h-3 mr-1" />Subscribers</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getQualityIndicator = (stream: any) => {
    const quality = stream.quality || 'unknown';
    const bitrate = stream.bitrate || 0;
    
    if (quality === '4K' || bitrate > 15000) {
      return <Badge className="bg-purple-500 text-white">4K Ultra</Badge>;
    } else if (quality === '1080p' || bitrate > 8000) {
      return <Badge className="bg-blue-500 text-white">1080p HD</Badge>;
    } else if (quality === '720p' || bitrate > 3000) {
      return <Badge className="bg-green-500 text-white">720p HD</Badge>;
    } else if (quality === '480p' || bitrate > 1000) {
      return <Badge className="bg-yellow-500 text-white">480p SD</Badge>;
    } else {
      return <Badge className="bg-gray-500 text-white">Low Quality</Badge>;
    }
  };

  const getConnectionStatus = (stream: any) => {
    const connectionQuality = stream.connectionQuality || 0;
    
    if (connectionQuality > 80) {
      return <Signal className="h-4 w-4 text-green-500" />;
    } else if (connectionQuality > 60) {
      return <Signal className="h-4 w-4 text-yellow-500" />;
    } else if (connectionQuality > 30) {
      return <Signal className="h-4 w-4 text-orange-500" />;
    } else {
      return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  const handleStreamSelect = (streamId: string, checked: boolean) => {
    if (checked) {
      setSelectedStreams([...selectedStreams, streamId]);
    } else {
      setSelectedStreams(selectedStreams.filter(id => id !== streamId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStreams(streams.map((s: any) => s.id));
    } else {
      setSelectedStreams([]);
    }
  };

  const handleBulkOperation = (operation: string) => {
    setBulkOperation(operation);
    setShowBulkOperationDialog(true);
  };

  const executeBulkOperation = () => {
    let data: any = {};
    
    if (bulkOperation === 'moderate') {
      data.reason = moderationReason;
      data.notes = moderationNotes;
    }
    
    bulkOperationMutation.mutate({
      streamIds: selectedStreams,
      operation: bulkOperation,
      data
    });
  };

  const filteredStreams = useMemo(() => {
    if (!searchQuery) return streams;
    
    return streams.filter((stream: any) => 
      stream.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      stream.creator?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [streams, searchQuery]);

  // Auto-refresh toggle effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refetch();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refetch]);

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Failed to load live streams. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Lovense Mutations
  const saveLovenseSettingsMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/admin/streams/lovense/settings', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Lovense settings saved successfully" });
    },
    onError: () => {
      toast({ title: "Failed to save Lovense settings", variant: "destructive" });
    }
  });

  const testLovenseToyMutation = useMutation({
    mutationFn: (data: { toyId: string; intensity: number; pattern: string; duration: number }) =>
      apiRequest('/api/admin/streams/lovense/test', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Test command sent to toy" });
    },
    onError: () => {
      toast({ title: "Failed to control toy", variant: "destructive" });
    }
  });

  const supportedLovenseToys = [
    { id: 'lush', name: 'Lush 2/3', type: 'Vibrator', icon: Vibrate },
    { id: 'hush', name: 'Hush 2', type: 'Butt Plug', icon: Vibrate },
    { id: 'edge', name: 'Edge 2', type: 'Prostate Massager', icon: Vibrate },
    { id: 'max', name: 'Max 2', type: 'Male Masturbator', icon: Gamepad2 },
    { id: 'nora', name: 'Nora', type: 'Rabbit Vibrator', icon: Vibrate },
    { id: 'domi', name: 'Domi 2', type: 'Wand', icon: Vibrate },
    { id: 'osci', name: 'Osci 2', type: 'G-Spot', icon: Vibrate },
    { id: 'diamo', name: 'Diamo', type: 'Wearable', icon: Vibrate },
    { id: 'dolce', name: 'Dolce', type: 'Wearable', icon: Vibrate },
    { id: 'ferri', name: 'Ferri', type: 'Panty Vibrator', icon: Vibrate },
  ];

  const handleSaveLovenseSettings = () => {
    saveLovenseSettingsMutation.mutate({
      enabled: lovenseEnabled,
      apiKey: lovenseApiKey,
      webhookUrl: lovenseWebhookUrl,
      tipToVibrateEnabled,
      customPatterns
    });
  };

  const handleTestToy = () => {
    if (!selectedToy) {
      toast({ title: "Please select a toy first", variant: "destructive" });
      return;
    }
    testLovenseToyMutation.mutate({
      toyId: selectedToy,
      intensity: vibrationIntensity,
      pattern: vibrationPattern,
      duration: 10
    });
  };

  const handleAddPattern = () => {
    setCustomPatterns([...customPatterns, { ...newPattern, id: Date.now() }]);
    setNewPattern({ name: '', pattern: '', duration: 10, tipAmount: 5 });
    setShowPatternDialog(false);
    toast({ title: "Pattern added successfully" });
  };

  const handleDeletePattern = (id: number) => {
    setCustomPatterns(customPatterns.filter(p => p.id !== id));
    toast({ title: "Pattern deleted" });
  };

  return (
    <div className="space-y-6" data-testid="live-streaming-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" data-testid="page-title">Live Streaming Management</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Real-time monitoring, control, and Lovense integration
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              data-testid="auto-refresh-toggle"
            />
            <span className="text-sm text-muted-foreground">Auto-refresh</span>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setShowAnalyticsDialog(true)}>
            <BarChart3 className="h-4 w-4" />
            Live Analytics
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tabs for Stream Monitoring and Lovense Integration */}
      <Tabs defaultValue="monitoring" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="monitoring">
            <Video className="h-4 w-4 mr-2" />
            Stream Monitoring
          </TabsTrigger>
          <TabsTrigger value="lovense">
            <Vibrate className="h-4 w-4 mr-2" />
            Lovense Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitoring" className="space-y-6 mt-6">
          {/* Real-time Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-8 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-red-500/10 rounded-lg flex items-center justify-center">
                <Radio className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Live Now</p>
                <p className="text-xl font-bold text-red-500" data-testid="live-streams">
                  {streamStats?.liveStreams || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Live Viewers</p>
                <p className="text-xl font-bold text-blue-500" data-testid="live-viewers">
                  {streamStats?.totalViewers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="text-xl font-bold text-green-500" data-testid="scheduled-streams">
                  {streamStats?.scheduledStreams || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Live Revenue</p>
                <p className="text-xl font-bold text-purple-500" data-testid="live-revenue">
                  ${(streamStats?.liveRevenue || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Gauge className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Quality</p>
                <p className="text-xl font-bold text-yellow-500" data-testid="avg-quality">
                  {streamStats?.avgQuality || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Duration</p>
                <p className="text-xl font-bold text-orange-500" data-testid="avg-duration">
                  {streamStats?.avgDuration || '0m'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-slate-500/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-slate-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Peak Viewers</p>
                <p className="text-xl font-bold text-slate-500" data-testid="peak-viewers">
                  {streamStats?.peakViewers?.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-pink-500/10 rounded-lg flex items-center justify-center">
                <Activity className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Today</p>
                <p className="text-xl font-bold text-pink-500" data-testid="streams-today">
                  {streamStats?.streamsToday || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filtering & Stream Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Stream Monitoring & Control</CardTitle>
              <CardDescription>
                Real-time monitoring, moderation, and management of live broadcasts
              </CardDescription>
            </div>
            {selectedStreams.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{selectedStreams.length} selected</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Bulk Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBulkOperation('terminate')}>
                      <StopCircle className="h-4 w-4 mr-2" />
                      Terminate Streams
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('moderate')}>
                      <Flag className="h-4 w-4 mr-2" />
                      Moderate Streams
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('feature')}>
                      <Star className="h-4 w-4 mr-2" />
                      Feature Streams
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('archive')}>
                      <Archive className="h-4 w-4 mr-2" />
                      Archive Streams
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkOperation('export')}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Selected
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search streams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="stream-search-input"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger data-testid="status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="ended">Ended</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
                <SelectItem value="subscribers_only">Subscribers Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={creatorFilter} onValueChange={setCreatorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {creators?.map((creator: any) => (
                  <SelectItem key={creator.id} value={creator.id}>
                    {creator.username || creator.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={qualityFilter} onValueChange={setQualityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Quality</SelectItem>
                <SelectItem value="4K">4K Ultra</SelectItem>
                <SelectItem value="1080p">1080p HD</SelectItem>
                <SelectItem value="720p">720p HD</SelectItem>
                <SelectItem value="480p">480p SD</SelectItem>
                <SelectItem value="low">Low Quality</SelectItem>
              </SelectContent>
            </Select>

            <Select value={viewerFilter} onValueChange={setViewerFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Viewers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Viewers</SelectItem>
                <SelectItem value="high">1000+ Viewers</SelectItem>
                <SelectItem value="medium">100-999 Viewers</SelectItem>
                <SelectItem value="low">1-99 Viewers</SelectItem>
                <SelectItem value="none">No Viewers</SelectItem>
              </SelectContent>
            </Select>

            <Select value={durationFilter} onValueChange={setDurationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Duration</SelectItem>
                <SelectItem value="long">3+ Hours</SelectItem>
                <SelectItem value="medium">1-3 Hours</SelectItem>
                <SelectItem value="short">&lt; 1 Hour</SelectItem>
              </SelectContent>
            </Select>

            <Select value={revenueFilter} onValueChange={setRevenueFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Revenue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Revenue</SelectItem>
                <SelectItem value="high">$500+ Revenue</SelectItem>
                <SelectItem value="medium">$100-499 Revenue</SelectItem>
                <SelectItem value="low">$1-99 Revenue</SelectItem>
                <SelectItem value="free">Free Streams</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Streams Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox 
                      checked={selectedStreams.length === streams.length && streams.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Stream Details</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Status & Type</TableHead>
                  <TableHead>Quality & Connection</TableHead>
                  <TableHead>Viewers & Engagement</TableHead>
                  <TableHead>Duration & Revenue</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={9}>
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 bg-muted rounded animate-pulse" />
                          <div className="space-y-2 flex-1">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : filteredStreams.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12">
                      <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Video className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">No streams found</h3>
                      <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStreams.map((stream: any) => (
                    <TableRow key={stream.id} data-testid={`stream-row-${stream.id}`}>
                      <TableCell>
                        <Checkbox 
                          checked={selectedStreams.includes(stream.id)}
                          onCheckedChange={(checked) => handleStreamSelect(stream.id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="h-16 w-20 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                            {stream.thumbnailUrl ? (
                              <img 
                                src={stream.thumbnailUrl} 
                                alt={stream.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Video className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                            {stream.status === 'live' && (
                              <div className="absolute top-1 right-1">
                                <Badge className="bg-red-500 text-white text-xs animate-pulse">LIVE</Badge>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium truncate" data-testid={`stream-title-${stream.id}`}>
                              {stream.title || "Untitled Stream"}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {stream.description?.substring(0, 60)}...
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              {stream.isRecording && (
                                <Badge variant="outline" className="text-xs">
                                  <FileVideo className="w-3 h-3 mr-1" />
                                  Recording
                                </Badge>
                              )}
                              {stream.isFeatured && (
                                <Badge variant="outline" className="text-xs">
                                  <Star className="w-3 h-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img 
                            src={stream.creator?.profileImageUrl || '/default-avatar.png'} 
                            alt={stream.creator?.username}
                            className="h-8 w-8 rounded-full ring-2 ring-primary/20"
                          />
                          <div>
                            <p className="font-medium text-sm">{stream.creator?.username}</p>
                            <p className="text-xs text-muted-foreground">{stream.creator?.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getStatusBadge(stream.status)}
                          {getTypeBadge(stream.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {getQualityIndicator(stream)}
                          <div className="flex items-center gap-1">
                            {getConnectionStatus(stream)}
                            <span className="text-xs text-muted-foreground">
                              {stream.bitrate ? `${(stream.bitrate / 1000).toFixed(1)}k` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="font-medium">{stream.viewersCount?.toLocaleString() || 0}</span>
                            {stream.maxViewers && (
                              <span className="text-muted-foreground">
                                / {stream.maxViewers.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {stream.chatMessages || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            ${((stream.totalTipsCents || 0) / 100).toFixed(0)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {stream.status === 'live' && stream.startedAt ? 
                              formatDuration(stream.startedAt) :
                              stream.endedAt ? formatDuration(stream.startedAt, stream.endedAt) : 'N/A'
                            }
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Revenue: ${((stream.priceCents || 0) / 100).toFixed(2)}
                          </div>
                          {stream.status === 'scheduled' && stream.scheduledFor && (
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(stream.scheduledFor), "MMM d, h:mm a")}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {stream.health && (
                            <div className="flex items-center gap-1">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className={cn(
                                    "h-2 rounded-full",
                                    stream.health > 80 ? "bg-green-500" :
                                    stream.health > 60 ? "bg-yellow-500" : "bg-red-500"
                                  )}
                                  style={{ width: `${stream.health}%` }}
                                />
                              </div>
                              <span className="text-xs">{stream.health}%</span>
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {stream.region && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {stream.region}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              setSelectedStream(stream);
                              setShowStreamDialog(true);
                            }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {stream.status === 'live' && (
                              <DropdownMenuItem onClick={() => {
                                terminateStreamMutation.mutate({
                                  streamId: stream.id,
                                  reason: "Administrative termination"
                                });
                              }}>
                                <StopCircle className="h-4 w-4 mr-2" />
                                Terminate Stream
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => {
                              setSelectedStream(stream);
                              setShowModerationDialog(true);
                            }}>
                              <Flag className="h-4 w-4 mr-2" />
                              Moderate
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Monitor className="h-4 w-4 mr-2" />
                              Live Monitor
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Stream Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Archive className="h-4 w-4 mr-2" />
                              Archive Stream
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalStreams)} of {totalStreams} streams
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8 h-8"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>

        {/* Lovense Integration Tab */}
        <TabsContent value="lovense" className="space-y-6 mt-6">
          {/* Lovense API Configuration */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Vibrate className="h-5 w-5 text-pink-500" />
                    Lovense API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure Lovense API integration for interactive toy control during streams
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Enable Integration</span>
                  <Switch
                    checked={lovenseEnabled}
                    onCheckedChange={setLovenseEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Lovense API Key</label>
                  <Input
                    type="password"
                    placeholder="Enter your Lovense Developer API key"
                    value={lovenseApiKey}
                    onChange={(e) => setLovenseApiKey(e.target.value)}
                    disabled={!lovenseEnabled}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Get your API key from the Lovense Developer Portal
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Webhook URL</label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="https://boyfanz.fanz.website/api/lovense/webhook"
                      value={lovenseWebhookUrl}
                      onChange={(e) => setLovenseWebhookUrl(e.target.value)}
                      disabled={!lovenseEnabled}
                    />
                    <Button variant="outline" size="sm" disabled={!lovenseEnabled}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Configure this URL in your Lovense Developer settings
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveLovenseSettings} disabled={!lovenseEnabled}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
                <Button variant="outline" disabled={!lovenseEnabled}>
                  <Bluetooth className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Supported Lovense Devices */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-slate-500" />
                Supported Lovense Devices
              </CardTitle>
              <CardDescription>
                All Lovense devices compatible with BoyFanz streaming platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {supportedLovenseToys.map((toy) => (
                  <Card
                    key={toy.id}
                    className={cn(
                      "cursor-pointer transition-all hover:border-primary/50",
                      selectedToy === toy.id && "border-primary bg-primary/5"
                    )}
                    onClick={() => setSelectedToy(toy.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center">
                        <div className={cn(
                          "h-12 w-12 rounded-full flex items-center justify-center mb-2",
                          selectedToy === toy.id ? "bg-primary/20" : "bg-muted"
                        )}>
                          <toy.icon className={cn(
                            "h-6 w-6",
                            selectedToy === toy.id ? "text-primary" : "text-muted-foreground"
                          )} />
                        </div>
                        <p className="font-medium text-sm">{toy.name}</p>
                        <p className="text-xs text-muted-foreground">{toy.type}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Toy Control & Testing */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Toy Control & Testing
              </CardTitle>
              <CardDescription>
                Test vibration patterns and intensity controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Vibration Intensity: {vibrationIntensity}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={vibrationIntensity}
                    onChange={(e) => setVibrationIntensity(parseInt(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                    disabled={!lovenseEnabled || !selectedToy}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Off</span>
                    <span>Low</span>
                    <span>Medium</span>
                    <span>High</span>
                    <span>Max</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Vibration Pattern</label>
                  <Select value={vibrationPattern} onValueChange={setVibrationPattern} disabled={!lovenseEnabled || !selectedToy}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="constant">Constant</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="earthquake">Earthquake</SelectItem>
                      <SelectItem value="fireworks">Fireworks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleTestToy} disabled={!lovenseEnabled || !selectedToy} className="gap-2">
                    <Play className="h-4 w-4" />
                    Test Vibration (10s)
                  </Button>
                  <Button variant="outline" disabled={!lovenseEnabled || !selectedToy} className="gap-2">
                    <StopCircle className="h-4 w-4" />
                    Stop
                  </Button>
                </div>

                {selectedToy && (
                  <Alert>
                    <Vibrate className="h-4 w-4" />
                    <AlertDescription>
                      Testing {supportedLovenseToys.find(t => t.id === selectedToy)?.name} at {vibrationIntensity}% intensity with {vibrationPattern} pattern
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tip-to-Vibrate Patterns */}
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Tip-to-Vibrate Patterns
                  </CardTitle>
                  <CardDescription>
                    Configure automatic vibration patterns triggered by viewer tips
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Enable Tip-to-Vibrate</span>
                  <Switch
                    checked={tipToVibrateEnabled}
                    onCheckedChange={setTipToVibrateEnabled}
                    disabled={!lovenseEnabled}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {customPatterns.length} custom patterns configured
                </p>
                <Button onClick={() => setShowPatternDialog(true)} size="sm" disabled={!lovenseEnabled || !tipToVibrateEnabled}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Pattern
                </Button>
              </div>

              <div className="space-y-3">
                {customPatterns.map((pattern) => (
                  <Card key={pattern.id} className="bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Vibrate className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{pattern.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Pattern: {pattern.pattern} • {pattern.duration}s • ${pattern.tipAmount} tip
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setVibrationPattern(pattern.pattern);
                            handleTestToy();
                          }} disabled={!selectedToy}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePattern(pattern.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Connection Status & Analytics */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Connection Status & Analytics
              </CardTitle>
              <CardDescription>
                Real-time Lovense connection monitoring and usage statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <Link2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Connected Toys</p>
                        <p className="text-xl font-bold text-green-500">24</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                        <Radio className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Active Streams</p>
                        <p className="text-xl font-bold text-blue-500">12</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Tips Today</p>
                        <p className="text-xl font-bold text-purple-500">$1,247</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-muted/50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <Zap className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Activations</p>
                        <p className="text-xl font-bold text-yellow-500">847</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Pattern Dialog */}
      <Dialog open={showPatternDialog} onOpenChange={setShowPatternDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Vibration Pattern</DialogTitle>
            <DialogDescription>
              Create a new tip-to-vibrate pattern for your streams
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Pattern Name</label>
              <Input
                placeholder="e.g., Gentle Wave"
                value={newPattern.name}
                onChange={(e) => setNewPattern({...newPattern, name: e.target.value})}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Vibration Pattern</label>
              <Input
                placeholder="e.g., 1-5-10-5-1 (intensity levels separated by dashes)"
                value={newPattern.pattern}
                onChange={(e) => setNewPattern({...newPattern, pattern: e.target.value})}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use numbers 0-20 separated by dashes. Each number is 1 second.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Duration (seconds)</label>
                <Input
                  type="number"
                  min="5"
                  max="60"
                  value={newPattern.duration}
                  onChange={(e) => setNewPattern({...newPattern, duration: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tip Amount ($)</label>
                <Input
                  type="number"
                  min="1"
                  value={newPattern.tipAmount}
                  onChange={(e) => setNewPattern({...newPattern, tipAmount: parseInt(e.target.value)})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPatternDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPattern} disabled={!newPattern.name || !newPattern.pattern}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pattern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stream Moderation Dialog */}
      <Dialog open={showModerationDialog} onOpenChange={setShowModerationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderate Live Stream</DialogTitle>
            <DialogDescription>
              Apply moderation actions to this stream. Actions will be logged for audit purposes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Action</label>
              <Select value={moderationReason} onValueChange={setModerationReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select moderation action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warning">Issue Warning</SelectItem>
                  <SelectItem value="terminate">Terminate Stream</SelectItem>
                  <SelectItem value="suspend">Suspend Creator</SelectItem>
                  <SelectItem value="feature">Feature Stream</SelectItem>
                  <SelectItem value="restrict">Restrict Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Reason & Notes</label>
              <Textarea
                placeholder="Provide detailed reasoning for this moderation action..."
                value={moderationNotes}
                onChange={(e) => setModerationNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModerationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              moderateStreamMutation.mutate({
                streamId: selectedStream?.id,
                action: moderationReason,
                notes: moderationNotes
              });
            }}>
              Apply Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Operation Dialog */}
      <Dialog open={showBulkOperationDialog} onOpenChange={setShowBulkOperationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Stream Operation</DialogTitle>
            <DialogDescription>
              Apply {bulkOperation} to {selectedStreams.length} selected streams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {bulkOperation === 'moderate' && (
              <>
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea
                    placeholder="Reason for bulk moderation..."
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    placeholder="Additional notes..."
                    value={moderationNotes}
                    onChange={(e) => setModerationNotes(e.target.value)}
                  />
                </div>
              </>
            )}
            {bulkOperation === 'terminate' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Warning: This will immediately terminate all selected live streams and notify creators.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBulkOperationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={executeBulkOperation}
              variant={bulkOperation === 'terminate' ? 'destructive' : 'default'}
            >
              Execute {bulkOperation}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}