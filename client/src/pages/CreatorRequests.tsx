// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Image,
  Video,
  Mic,
  Package,
  Loader2,
  PlayCircle,
  Send,
  Settings,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { formatDistanceToNow, format, addDays } from 'date-fns';

type CustomRequest = {
  id: string;
  fanId: string;
  creatorId: string;
  type: string;
  title: string;
  description: string;
  offeredPriceCents: number;
  agreedPriceCents?: number;
  status: string;
  isExclusive: boolean;
  isRush: boolean;
  requestedDeliveryDays: number;
  agreedDeliveryDate?: string;
  deliveredAt?: string;
  deliveryMediaUrls?: string[];
  deliveryMessage?: string;
  createdAt: string;
};

type RequestWithFan = {
  request: CustomRequest;
  fan: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
};

type CreatorSettings = {
  isAcceptingRequests: boolean;
  minimumPriceCents: number;
  maximumPriceCents: number;
  standardDeliveryDays: number;
  rushDeliveryDays: number;
  rushSurchargePct: number;
  exclusiveSurchargePct: number;
  allowedTypes: string[];
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'New Request', color: 'bg-yellow-500', icon: Clock },
  negotiating: { label: 'Negotiating', color: 'bg-blue-500', icon: MessageSquare },
  accepted: { label: 'Awaiting Payment', color: 'bg-orange-500', icon: DollarSign },
  paid: { label: 'Ready to Start', color: 'bg-green-500', icon: PlayCircle },
  in_progress: { label: 'In Progress', color: 'bg-purple-500', icon: Package },
  delivered: { label: 'Delivered', color: 'bg-cyan-500', icon: Send },
  approved: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'bg-red-500', icon: AlertCircle },
  refunded: { label: 'Refunded', color: 'bg-gray-500', icon: XCircle },
  expired: { label: 'Expired', color: 'bg-gray-500', icon: Clock },
  declined: { label: 'Declined', color: 'bg-red-500', icon: XCircle },
};

const typeIcons: Record<string, any> = {
  photo_set: Image,
  video: Video,
  voice_message: Mic,
  video_message: Video,
  custom_content: Package,
  other: Package,
};

export default function CreatorRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<RequestWithFan | null>(null);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [deliverDialogOpen, setDeliverDialogOpen] = useState(false);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);

  // Response form state
  const [counterPrice, setCounterPrice] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [declineReason, setDeclineReason] = useState('');

  // Delivery form state
  const [deliveryMessage, setDeliveryMessage] = useState('');
  const [deliveryMediaUrls, setDeliveryMediaUrls] = useState<string[]>([]);

  // Settings form state
  const [settings, setSettings] = useState<CreatorSettings>({
    isAcceptingRequests: true,
    minimumPriceCents: 1000,
    maximumPriceCents: 100000,
    standardDeliveryDays: 7,
    rushDeliveryDays: 2,
    rushSurchargePct: 50,
    exclusiveSurchargePct: 100,
    allowedTypes: ['photo_set', 'video', 'voice_message', 'video_message', 'custom_content'],
  });

  const { data: pendingRequests, isLoading: pendingLoading } = useQuery<RequestWithFan[]>({
    queryKey: ['/api/custom-requests/creator/pending'],
    enabled: !!user,
  });

  const { data: activeRequests, isLoading: activeLoading } = useQuery<RequestWithFan[]>({
    queryKey: ['/api/custom-requests/creator/active'],
    enabled: !!user,
  });

  const { data: creatorSettings } = useQuery<CreatorSettings>({
    queryKey: ['/api/custom-requests/settings'],
    enabled: !!user,
    onSuccess: (data) => {
      if (data) setSettings(data);
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ requestId, action, data }: { requestId: string; action: string; data?: any }) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/respond`, { action, ...data });
      return res.json();
    },
    onSuccess: (_, variables) => {
      const actionMessages: Record<string, string> = {
        accept: 'Request accepted! Waiting for fan payment.',
        decline: 'Request declined.',
        counter: 'Counter offer sent.',
      };
      toast({ title: actionMessages[variables.action] || 'Response sent' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/creator/pending'] });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/creator/active'] });
      setResponseDialogOpen(false);
      setSelectedRequest(null);
      resetResponseForm();
    },
    onError: () => {
      toast({ title: 'Failed to respond', variant: 'destructive' });
    },
  });

  const startMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/start`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Started working on request' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/creator/active'] });
    },
    onError: () => {
      toast({ title: 'Failed to start', variant: 'destructive' });
    },
  });

  const deliverMutation = useMutation({
    mutationFn: async ({ requestId, message, mediaUrls }: { requestId: string; message: string; mediaUrls: string[] }) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/deliver`, { message, mediaUrls });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Content delivered!', description: 'Waiting for fan approval to release payment.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/creator/active'] });
      setDeliverDialogOpen(false);
      setSelectedRequest(null);
      setDeliveryMessage('');
      setDeliveryMediaUrls([]);
    },
    onError: () => {
      toast({ title: 'Failed to deliver', variant: 'destructive' });
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: CreatorSettings) => {
      const res = await apiRequest('PUT', '/api/custom-requests/settings', newSettings);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Settings updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/settings'] });
      setSettingsDialogOpen(false);
    },
    onError: () => {
      toast({ title: 'Failed to update settings', variant: 'destructive' });
    },
  });

  const resetResponseForm = () => {
    setCounterPrice('');
    setCounterMessage('');
    setDeclineReason('');
  };

  const isLoading = pendingLoading || activeLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedRequests = activeRequests?.filter(r =>
    ['approved', 'disputed', 'refunded'].includes(r.request.status)
  ) || [];

  const inProgressRequests = activeRequests?.filter(r =>
    ['paid', 'in_progress', 'delivered'].includes(r.request.status)
  ) || [];

  const RequestCard = ({ data, showActions = true }: { data: RequestWithFan; showActions?: boolean }) => {
    const { request, fan } = data;
    const status = statusConfig[request.status] || statusConfig.pending;
    const TypeIcon = typeIcons[request.type] || Package;
    const earnings = ((request.agreedPriceCents || request.offeredPriceCents) * 0.8 / 100).toFixed(2);

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={fan.profileImageUrl} />
                <AvatarFallback>{fan.displayName?.charAt(0) || fan.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{request.title}</CardTitle>
                <CardDescription>@{fan.username}</CardDescription>
              </div>
            </div>
            <Badge className={`${status.color} text-white`}>
              <status.icon className="h-3 w-3 mr-1" />
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <TypeIcon className="h-4 w-4" />
              <span className="capitalize">{request.type.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>${((request.agreedPriceCents || request.offeredPriceCents) / 100).toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-green-500">
              <TrendingUp className="h-4 w-4" />
              <span>You earn ${earnings}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {request.isExclusive && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">Exclusive (+100%)</Badge>
            )}
            {request.isRush && (
              <Badge variant="outline" className="border-red-500 text-red-500">Rush (+50%)</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>Requested {request.requestedDeliveryDays} day delivery</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
          </div>
        </CardContent>
        {showActions && (
          <CardFooter className="flex gap-2">
            {request.status === 'pending' && (
              <>
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => respondMutation.mutate({ requestId: request.id, action: 'accept' })}
                  disabled={respondMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(data);
                    setResponseDialogOpen(true);
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Counter
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setSelectedRequest(data);
                    setResponseDialogOpen(true);
                    setDeclineReason('Unable to fulfill this request at this time.');
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
            {request.status === 'paid' && (
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700"
                onClick={() => startMutation.mutate(request.id)}
                disabled={startMutation.isPending}
              >
                <PlayCircle className="h-4 w-4 mr-2" />
                Start Working
              </Button>
            )}
            {request.status === 'in_progress' && (
              <Button
                className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                onClick={() => {
                  setSelectedRequest(data);
                  setDeliverDialogOpen(true);
                }}
              >
                <Send className="h-4 w-4 mr-2" />
                Deliver Content
              </Button>
            )}
            {request.status === 'delivered' && (
              <Badge className="flex-1 justify-center py-2 bg-cyan-500 text-white">
                Awaiting Fan Approval
              </Badge>
            )}
          </CardFooter>
        )}
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Custom Requests</h1>
          <p className="text-muted-foreground">Manage personalized content orders from your fans</p>
        </div>
        <Button variant="outline" onClick={() => setSettingsDialogOpen(true)}>
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{pendingRequests?.length || 0}</div>
            <p className="text-sm text-muted-foreground">New Requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{inProgressRequests.length}</div>
            <p className="text-sm text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              ${(inProgressRequests.reduce((sum, r) => sum + (r.request.agreedPriceCents || r.request.offeredPriceCents), 0) * 0.8 / 100).toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground">Pending Earnings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{completedRequests.length}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            New ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Active ({inProgressRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {!pendingRequests?.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No pending requests</p>
                <p className="text-muted-foreground">New requests from fans will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map(r => <RequestCard key={r.request.id} data={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {!inProgressRequests.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No active requests</p>
                <p className="text-muted-foreground">Requests you're working on will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {inProgressRequests.map(r => <RequestCard key={r.request.id} data={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {!completedRequests.length ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No completed requests</p>
                <p className="text-muted-foreground">Your completed orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedRequests.map(r => <RequestCard key={r.request.id} data={r} showActions={false} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Response Dialog */}
      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respond to Request</DialogTitle>
            <DialogDescription>
              Accept, counter, or decline this custom content request.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">{selectedRequest.request.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{selectedRequest.request.description}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>Offered: ${(selectedRequest.request.offeredPriceCents / 100).toFixed(2)}</span>
                  <span>Delivery: {selectedRequest.request.requestedDeliveryDays} days</span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label>Counter Price (optional)</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      placeholder={(selectedRequest.request.offeredPriceCents / 100).toString()}
                      value={counterPrice}
                      onChange={(e) => setCounterPrice(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Message</Label>
                  <Textarea
                    placeholder="Add a message to the fan..."
                    value={counterMessage || declineReason}
                    onChange={(e) => {
                      if (declineReason) setDeclineReason(e.target.value);
                      else setCounterMessage(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {declineReason ? (
              <Button
                variant="destructive"
                onClick={() => respondMutation.mutate({
                  requestId: selectedRequest!.request.id,
                  action: 'decline',
                  data: { reason: declineReason }
                })}
                disabled={respondMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Decline Request
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => respondMutation.mutate({
                    requestId: selectedRequest!.request.id,
                    action: 'counter',
                    data: {
                      counterPriceCents: counterPrice ? Math.round(parseFloat(counterPrice) * 100) : undefined,
                      message: counterMessage
                    }
                  })}
                  disabled={respondMutation.isPending || !counterPrice}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Counter Offer
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => respondMutation.mutate({
                    requestId: selectedRequest!.request.id,
                    action: 'accept'
                  })}
                  disabled={respondMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Original Offer
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog open={deliverDialogOpen} onOpenChange={setDeliverDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Deliver Content</DialogTitle>
            <DialogDescription>
              Upload your completed content and add a message for the fan.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold">{selectedRequest.request.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.request.description}</p>
              </div>

              <div>
                <Label>Delivery Message</Label>
                <Textarea
                  placeholder="Add a personal message with your delivery..."
                  value={deliveryMessage}
                  onChange={(e) => setDeliveryMessage(e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label>Media URLs (one per line)</Label>
                <Textarea
                  placeholder="https://example.com/image1.jpg&#10;https://example.com/video.mp4"
                  value={deliveryMediaUrls.join('\n')}
                  onChange={(e) => setDeliveryMediaUrls(e.target.value.split('\n').filter(url => url.trim()))}
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter direct links to your content files (images, videos, etc.)
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              className="bg-cyan-600 hover:bg-cyan-700"
              onClick={() => deliverMutation.mutate({
                requestId: selectedRequest!.request.id,
                message: deliveryMessage,
                mediaUrls: deliveryMediaUrls
              })}
              disabled={deliverMutation.isPending || !deliveryMessage || !deliveryMediaUrls.length}
            >
              {deliverMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Deliver Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={settingsDialogOpen} onOpenChange={setSettingsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Custom Request Settings</DialogTitle>
            <DialogDescription>
              Configure how you handle custom content requests.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Accept Custom Requests</Label>
              <Button
                variant={settings.isAcceptingRequests ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSettings({ ...settings, isAcceptingRequests: !settings.isAcceptingRequests })}
              >
                {settings.isAcceptingRequests ? 'Enabled' : 'Disabled'}
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Minimum Price ($)</Label>
                <Input
                  type="number"
                  value={settings.minimumPriceCents / 100}
                  onChange={(e) => setSettings({ ...settings, minimumPriceCents: Math.round(parseFloat(e.target.value) * 100) })}
                />
              </div>
              <div>
                <Label>Maximum Price ($)</Label>
                <Input
                  type="number"
                  value={settings.maximumPriceCents / 100}
                  onChange={(e) => setSettings({ ...settings, maximumPriceCents: Math.round(parseFloat(e.target.value) * 100) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Standard Delivery (days)</Label>
                <Input
                  type="number"
                  value={settings.standardDeliveryDays}
                  onChange={(e) => setSettings({ ...settings, standardDeliveryDays: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Rush Delivery (days)</Label>
                <Input
                  type="number"
                  value={settings.rushDeliveryDays}
                  onChange={(e) => setSettings({ ...settings, rushDeliveryDays: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Rush Surcharge (%)</Label>
                <Input
                  type="number"
                  value={settings.rushSurchargePct}
                  onChange={(e) => setSettings({ ...settings, rushSurchargePct: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label>Exclusive Surcharge (%)</Label>
                <Input
                  type="number"
                  value={settings.exclusiveSurchargePct}
                  onChange={(e) => setSettings({ ...settings, exclusiveSurchargePct: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => updateSettingsMutation.mutate(settings)}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
