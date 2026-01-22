import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Heart, Clock, UserPlus, Flame } from 'lucide-react';
import { Link } from 'wouter';

interface User {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  isVerified: boolean;
  isCreator: boolean;
  onlineStatus?: string;
}

interface FuckBuddy {
  id: string;
  userId: string;
  buddyId: string;
  relationshipType: string;
  nickname?: string;
  isTopEight: boolean;
  topEightPosition?: number;
  connectionScore: number;
  createdAt: string;
  user?: User;
}

interface BuddyRequest {
  id: string;
  senderId: string;
  receiverId: string;
  relationshipType: string;
  message?: string;
  status: string;
  createdAt: string;
  sender?: User;
}

const RELATIONSHIP_LABELS: Record<string, { emoji: string; label: string }> = {
  fuckbuddy: { emoji: '🔥', label: 'Fuck Buddy' },
  fwb: { emoji: '💕', label: 'Friends with Benefits' },
  crush: { emoji: '💜', label: 'Crush' },
  lover: { emoji: '❤️', label: 'Lover' },
  playmate: { emoji: '🎮', label: 'Playmate' },
  admirer: { emoji: '👀', label: 'Admirer' },
};

export default function FuckBuddies() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('buddies');

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => {
      const response = await fetch('/api/user', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch user');
      return response.json();
    },
  });

  // Fetch fuck buddies
  const { data: buddies, refetch: refetchBuddies } = useQuery({
    queryKey: ['/api/fuck-buddies', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/fuck-buddies/${user.id}`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch buddies');
      const data = await response.json();
      return data.buddies || [];
    },
    enabled: !!user?.id,
  });

  // Fetch top 8
  const { data: topEight } = useQuery({
    queryKey: ['/api/fuck-buddies', user?.id, 'top-eight'],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/fuck-buddies/${user.id}/top-eight`, { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch top eight');
      const data = await response.json();
      return data.topEight || [];
    },
    enabled: !!user?.id,
  });

  // Fetch pending requests
  const { data: requests, refetch: refetchRequests } = useQuery({
    queryKey: ['/api/fuck-buddies/requests/pending'],
    queryFn: async () => {
      const response = await fetch('/api/fuck-buddies/requests/pending', { credentials: 'include' });
      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      return data.requests || [];
    },
  });

  const handleRespondRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      const response = await fetch(`/api/fuck-buddies/request/${requestId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} request`);

      toast({
        title: action === 'accept' ? 'Request accepted' : 'Request declined',
        description: action === 'accept' ? 'You are now fuck buddies!' : 'Request has been declined',
      });

      refetchRequests();
      refetchBuddies();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to respond to request',
        variant: 'destructive',
      });
    }
  };

  const renderBuddyCard = (buddy: FuckBuddy) => {
    const relationship = RELATIONSHIP_LABELS[buddy.relationshipType] || RELATIONSHIP_LABELS.fuckbuddy;

    return (
      <Card key={buddy.id}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Link href={`/creator/${buddy.user?.username || buddy.buddyId}`}>
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarImage src={buddy.user?.profileImageUrl} />
                <AvatarFallback>{buddy.user?.displayName?.[0] || '?'}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/creator/${buddy.user?.username || buddy.buddyId}`}>
                  <h3 className="font-semibold hover:underline cursor-pointer">
                    {buddy.nickname || buddy.user?.displayName || 'Unknown'}
                  </h3>
                </Link>
                {buddy.user?.isVerified && (
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                )}
                {buddy.isTopEight && (
                  <Badge variant="default" className="text-xs">Top {buddy.topEightPosition || 8}</Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{relationship.emoji} {relationship.label}</span>
                {buddy.user?.onlineStatus === 'online' && (
                  <Badge variant="outline" className="text-xs">Online</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRequestCard = (request: BuddyRequest) => {
    const relationship = RELATIONSHIP_LABELS[request.relationshipType] || RELATIONSHIP_LABELS.fuckbuddy;

    return (
      <Card key={request.id}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Link href={`/creator/${request.sender?.username || request.senderId}`}>
              <Avatar className="h-12 w-12 cursor-pointer">
                <AvatarImage src={request.sender?.profileImageUrl} />
                <AvatarFallback>{request.sender?.displayName?.[0] || '?'}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <Link href={`/creator/${request.sender?.username || request.senderId}`}>
                  <h3 className="font-semibold hover:underline cursor-pointer">
                    {request.sender?.displayName || 'Unknown'}
                  </h3>
                </Link>
                {request.sender?.isVerified && (
                  <Badge variant="secondary" className="text-xs">✓</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {relationship.emoji} Wants to be your {relationship.label}
              </p>
              {request.message && (
                <p className="text-sm mt-1 italic">&quot;{request.message}&quot;</p>
              )}
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => handleRespondRequest(request.id, 'accept')}>
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleRespondRequest(request.id, 'decline')}>
                  Decline
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Flame className="h-8 w-8 text-orange-500" />
          Fuck Buddies
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your connections and relationships
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="buddies">
            <Users className="h-4 w-4 mr-2" />
            My Buddies ({buddies?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="top-eight">
            <Heart className="h-4 w-4 mr-2" />
            Top 8 ({topEight?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="h-4 w-4 mr-2" />
            Requests ({requests?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buddies" className="mt-6 space-y-4">
          {!buddies || buddies.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">No Buddies Yet</CardTitle>
                <CardDescription className="text-center">
                  Start connecting with other members to build your network
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            buddies.map(renderBuddyCard)
          )}
        </TabsContent>

        <TabsContent value="top-eight" className="mt-6 space-y-4">
          {!topEight || topEight.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">No Top 8 Selected</CardTitle>
                <CardDescription className="text-center">
                  Add your favorite buddies to your Top 8
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topEight.map(renderBuddyCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6 space-y-4">
          {!requests || requests.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-center">No Pending Requests</CardTitle>
                <CardDescription className="text-center">
                  You don&apos;t have any pending buddy requests
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            requests.map(renderRequestCard)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
