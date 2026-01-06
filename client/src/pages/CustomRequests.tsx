// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Eye,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

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

type RequestWithCreator = {
  request: CustomRequest;
  creator: {
    id: string;
    username: string;
    displayName: string;
    profileImageUrl?: string;
  };
};

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  negotiating: { label: 'Negotiating', color: 'bg-blue-500', icon: MessageSquare },
  accepted: { label: 'Accepted - Pay Now', color: 'bg-green-500', icon: DollarSign },
  paid: { label: 'Paid - In Production', color: 'bg-purple-500', icon: Package },
  in_progress: { label: 'In Progress', color: 'bg-purple-500', icon: Package },
  delivered: { label: 'Delivered - Review', color: 'bg-cyan-500', icon: Eye },
  approved: { label: 'Completed', color: 'bg-green-600', icon: CheckCircle },
  disputed: { label: 'Disputed', color: 'bg-red-500', icon: AlertTriangle },
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

export default function CustomRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<RequestWithCreator | null>(null);
  const [disputeReason, setDisputeReason] = useState('');

  const { data: requests, isLoading } = useQuery<RequestWithCreator[]>({
    queryKey: ['/api/custom-requests/my-requests'],
    enabled: !!user,
  });

  const payMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/pay`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Payment processed', description: 'Your payment is now held in escrow.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/my-requests'] });
    },
    onError: () => {
      toast({ title: 'Payment failed', variant: 'destructive' });
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/approve`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Content approved!', description: 'Payment has been released to the creator.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/my-requests'] });
      setSelectedRequest(null);
    },
    onError: () => {
      toast({ title: 'Approval failed', variant: 'destructive' });
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string; reason: string }) => {
      const res = await apiRequest('POST', `/api/custom-requests/${requestId}/dispute`, { reason });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: 'Dispute submitted', description: 'Our team will review your case.' });
      queryClient.invalidateQueries({ queryKey: ['/api/custom-requests/my-requests'] });
      setSelectedRequest(null);
      setDisputeReason('');
    },
    onError: () => {
      toast({ title: 'Failed to submit dispute', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pendingRequests = requests?.filter(r => ['pending', 'negotiating'].includes(r.request.status)) || [];
  const activeRequests = requests?.filter(r => ['accepted', 'paid', 'in_progress', 'delivered'].includes(r.request.status)) || [];
  const completedRequests = requests?.filter(r => ['approved', 'disputed', 'refunded', 'expired', 'declined'].includes(r.request.status)) || [];

  const RequestCard = ({ data }: { data: RequestWithCreator }) => {
    const { request, creator } = data;
    const status = statusConfig[request.status] || statusConfig.pending;
    const TypeIcon = typeIcons[request.type] || Package;

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={creator.profileImageUrl} />
                <AvatarFallback>{creator.displayName?.charAt(0) || creator.username.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{request.title}</CardTitle>
                <CardDescription>@{creator.username}</CardDescription>
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
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex gap-2">
            {request.isExclusive && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">Exclusive</Badge>
            )}
            {request.isRush && (
              <Badge variant="outline" className="border-red-500 text-red-500">Rush</Badge>
            )}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{request.description}</p>
        </CardContent>
        <CardFooter className="flex gap-2">
          {request.status === 'accepted' && (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => payMutation.mutate(request.id)}
              disabled={payMutation.isPending}
            >
              {payMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <DollarSign className="h-4 w-4 mr-2" />}
              Pay ${((request.agreedPriceCents || request.offeredPriceCents) / 100).toFixed(2)}
            </Button>
          )}
          {request.status === 'delivered' && (
            <>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={() => setSelectedRequest(data)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Review & Approve
              </Button>
            </>
          )}
          <Link href={`/custom-requests/${request.id}`}>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">My Custom Requests</h1>
          <p className="text-muted-foreground">Track your personalized content orders</p>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No pending requests</p>
                <p className="text-muted-foreground">Requests awaiting creator response will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {pendingRequests.map(r => <RequestCard key={r.request.id} data={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active">
          {activeRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No active requests</p>
                <p className="text-muted-foreground">Requests being worked on will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {activeRequests.map(r => <RequestCard key={r.request.id} data={r} />)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedRequests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium">No completed requests</p>
                <p className="text-muted-foreground">Your completed orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {completedRequests.map(r => <RequestCard key={r.request.id} data={r} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Delivered Content</DialogTitle>
            <DialogDescription>
              Review the content and approve to release payment, or dispute if there's an issue.
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">{selectedRequest.request.title}</h4>
                <p className="text-sm text-muted-foreground">{selectedRequest.request.deliveryMessage}</p>
              </div>

              {selectedRequest.request.deliveryMediaUrls && selectedRequest.request.deliveryMediaUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {selectedRequest.request.deliveryMediaUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="aspect-square bg-muted rounded-lg flex items-center justify-center hover:opacity-80">
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </a>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Dispute Reason (if any issues)</label>
                <Textarea
                  placeholder="Describe the issue with the delivered content..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() => disputeMutation.mutate({
                requestId: selectedRequest!.request.id,
                reason: disputeReason
              })}
              disabled={disputeReason.length < 10 || disputeMutation.isPending}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Dispute
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={() => approveMutation.mutate(selectedRequest!.request.id)}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
              Approve & Release Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
