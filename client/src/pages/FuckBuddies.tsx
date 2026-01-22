// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  Users, UserPlus, UserMinus, Heart, MessageCircle, Shield, Ban,
  Check, X, Search, Filter, Send, Star, Crown, Eye, EyeOff,
  Bell, BellOff, MoreHorizontal, Settings, Trash2, ThumbsUp
} from 'lucide-react';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface FuckBuddy {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isCreator: boolean;
  isVerified: boolean;
  status: 'accepted' | 'pending' | 'blocked';
  mutualFriends: number;
  addedAt: string;
  lastActive?: string;
}

interface Follower {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  isCreator: boolean;
  followedAt: string;
  notificationsEnabled: boolean;
}


// Content moderation for messages
export default function FuckBuddies() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('buddies');
  const [searchQuery, setSearchQuery] = useState('');
  const [thankYouMessage, setThankYouMessage] = useState('');
  const [selectedUser, setSelectedUser] = useState<FuckBuddy | Follower | null>(null);
  const [showThankYouDialog, setShowThankYouDialog] = useState(false);

  // Fetch fuck buddies
  const { data: buddies = [], isLoading: buddiesLoading } = useQuery({
    queryKey: ['/api/fuck-buddies', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/fuck-buddies/${user.id}`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch pending requests
  const { data: requests = [], isLoading: requestsLoading } = useQuery({
    queryKey: ['/api/fuck-buddies/requests'],
    queryFn: async () => {
      const res = await fetch('/api/fuck-buddies/requests/pending');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch blocked users
  const { data: blocked = [], isLoading: blockedLoading } = useQuery({
    queryKey: ['/api/blocked-users'],
    queryFn: async () => {
      const res = await fetch('/api/users/blocked');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch followers
  const { data: followers = [], isLoading: followersLoading } = useQuery({
    queryKey: ['/api/followers'],
    queryFn: async () => {
      if (!user?.id) return [];
      const res = await fetch(`/api/users/${user.id}/followers`);
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Fetch fanz (subscribers)
  const { data: fanz = [], isLoading: fanzLoading } = useQuery({
    queryKey: ['/api/subscribers'],
    queryFn: async () => {
      const res = await fetch('/api/subscribers');
      if (!res.ok) return [];
      return res.json();
    }
  });

  // Mutations
  const acceptRequest = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/fuck-buddies/accept/${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to accept');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies/requests'] });
      toast({ title: 'Request accepted!', description: 'You have a new fuck buddy 🔥' });
    }
  });

  const rejectRequest = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/fuck-buddies/reject/${userId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to reject');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies/requests'] });
      toast({ title: 'Request rejected' });
    }
  });

  const blockUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/block`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to block');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies'] });
      queryClient.invalidateQueries({ queryKey: ['/api/followers'] });
      toast({ title: 'User blocked', description: 'They can no longer see your content' });
    }
  });

  const unblockUser = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}/unblock`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to unblock');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blocked-users'] });
      toast({ title: 'User unblocked' });
    }
  });

  const removeBuddy = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/fuck-buddies/${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/fuck-buddies'] });
      toast({ title: 'Buddy removed' });
    }
  });

  const toggleFollowerNotifications = useMutation({
    mutationFn: async ({ userId, enabled }: { userId: string; enabled: boolean }) => {
      const res = await fetch(`/api/followers/${userId}/notifications`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled })
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/followers'] });
    }
  });

  const sendThankYou = useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: userId, content: message, isThankYou: true })
      });
      if (!res.ok) throw new Error('Failed to send');
      return res.json();
    },
    onSuccess: () => {
      setShowThankYouDialog(false);
      setThankYouMessage('');
      setSelectedUser(null);
      toast({ title: 'Thank you sent! 💜', description: 'Your appreciation has been delivered' });
    }
  });

  const filteredBuddies = (Array.isArray(buddies) ? buddies : []).filter((b: FuckBuddy) => 
    b.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowers = (Array.isArray(followers) ? followers : []).filter((f: Follower) =>
    f.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container max-w-6xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Heart className="h-8 w-8 text-pink-500" />
            Fuck Buddies
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your connections, followers, and fanz
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="text-lg px-4 py-2">
            <Users className="h-4 w-4 mr-2" />
            {(Array.isArray(buddies) ? buddies : []).length} Buddies
          </Badge>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Star className="h-4 w-4 mr-2" />
            {(Array.isArray(fanz) ? fanz : []).length} Fanz
          </Badge>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="buddies" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Buddies ({buddies.length})
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Requests ({(Array.isArray(requests) ? requests : []).length})
          </TabsTrigger>
          <TabsTrigger value="followers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Followers ({(Array.isArray(followers) ? followers : []).length})
          </TabsTrigger>
          <TabsTrigger value="fanz" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Fanz ({fanz.length})
          </TabsTrigger>
          <TabsTrigger value="blocked" className="flex items-center gap-2">
            <Ban className="h-4 w-4" />
            Blocked ({(Array.isArray(blocked) ? blocked : []).length})
          </TabsTrigger>
        </TabsList>

        {/* Fuck Buddies Tab */}
        <TabsContent value="buddies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Fuck Buddies</CardTitle>
              <CardDescription>People you've connected with intimately</CardDescription>
            </CardHeader>
            <CardContent>
              {buddiesLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredBuddies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fuck buddies yet</p>
                  <p className="text-sm">Start connecting to build your network</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredBuddies.map((buddy: FuckBuddy) => (
                    <Card key={buddy.id} className="relative">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={buddy.avatar} />
                            <AvatarFallback>{buddy.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold truncate">{buddy.displayName || buddy.username}</span>
                              {buddy.isVerified && <Badge variant="secondary" className="text-xs">✓</Badge>}
                              {buddy.isCreator && <Crown className="h-4 w-4 text-yellow-500" />}
                            </div>
                            <p className="text-sm text-muted-foreground">@{buddy.username}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {buddy.mutualFriends} mutual friends
                            </p>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => window.location.href = `/messages?user=${buddy.id}`}>
                                <MessageCircle className="h-4 w-4 mr-2" />
                                Message
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setSelectedUser(buddy); setShowThankYouDialog(true); }}>
                                <ThumbsUp className="h-4 w-4 mr-2" />
                                Send Thank You
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => removeBuddy.mutate(buddy.id)}
                              >
                                <UserMinus className="h-4 w-4 mr-2" />
                                Remove Buddy
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => blockUser.mutate(buddy.id)}
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Block
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Friend Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Requests</CardTitle>
              <CardDescription>People who want to be your fuck buddy</CardDescription>
            </CardHeader>
            <CardContent>
              {requestsLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : requests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(requests) ? requests : []).map((request: FuckBuddy) => (
                    <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.avatar} />
                          <AvatarFallback>{request.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{request.displayName || request.username}</span>
                            {request.isCreator && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">@{request.username}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => acceptRequest.mutate(request.id)}
                          disabled={acceptRequest.isPending}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => rejectRequest.mutate(request.id)}
                          disabled={rejectRequest.isPending}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => blockUser.mutate(request.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Followers</CardTitle>
              <CardDescription>Toggle notifications and manage who follows you</CardDescription>
            </CardHeader>
            <CardContent>
              {followersLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : filteredFollowers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No followers yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFollowers.map((follower: Follower) => (
                    <div key={follower.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={follower.avatar} />
                          <AvatarFallback>{follower.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold">{follower.displayName || follower.username}</span>
                          <p className="text-sm text-muted-foreground">@{follower.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`notify-${follower.id}`} className="text-sm">
                            {follower.notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                          </Label>
                          <Switch
                            id={`notify-${follower.id}`}
                            checked={follower.notificationsEnabled}
                            onCheckedChange={(checked) => 
                              toggleFollowerNotifications.mutate({ userId: follower.id, enabled: checked })
                            }
                          />
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => { setSelectedUser(follower); setShowThankYouDialog(true); }}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Thank
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => blockUser.mutate(follower.id)}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fanz Tab */}
        <TabsContent value="fanz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Fanz</CardTitle>
              <CardDescription>Paying subscribers who support your content</CardDescription>
            </CardHeader>
            <CardContent>
              {fanzLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : fanz.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No fanz subscribers yet</p>
                  <p className="text-sm">Share your profile to gain supporters</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {(Array.isArray(fanz) ? fanz : []).map((fan: any) => (
                    <Card key={fan.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={fan.avatar} />
                            <AvatarFallback>{fan.username?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{fan.displayName || fan.username}</span>
                              <Crown className="h-4 w-4 text-yellow-500" />
                            </div>
                            <p className="text-sm text-muted-foreground">@{fan.username}</p>
                            <p className="text-xs text-green-600 mt-1">
                              ${fan.totalSpent?.toFixed(2) || '0.00'} lifetime
                            </p>
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => { setSelectedUser(fan); setShowThankYouDialog(true); }}
                          >
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Blocked Tab */}
        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blocked Users</CardTitle>
              <CardDescription>Users who cannot see or interact with your content</CardDescription>
            </CardHeader>
            <CardContent>
              {blockedLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : blocked.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No blocked users</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {(Array.isArray(blocked) ? blocked : []).map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 opacity-50">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.username?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-semibold">{user.displayName || user.username}</span>
                          <p className="text-sm text-muted-foreground">@{user.username}</p>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => unblockUser.mutate(user.id)}
                        disabled={unblockUser.isPending}
                      >
                        Unblock
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Thank You Dialog */}
      <Dialog open={showThankYouDialog} onOpenChange={setShowThankYouDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send a Thank You 💜</DialogTitle>
            <DialogDescription>
              Show your appreciation to {selectedUser?.displayName || selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Write a personal thank you message..."
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={4}
            />
            <div className="flex gap-2 flex-wrap">
              {['Thanks for the support! 💕', 'You are amazing! 🔥', 'Love having you here! 😘', 'You make my day! ✨'].map((msg) => (
                <Button
                  key={msg}
                  variant="outline"
                  size="sm"
                  onClick={() => setThankYouMessage(msg)}
                >
                  {msg}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowThankYouDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedUser && sendThankYou.mutate({ userId: selectedUser.id, message: thankYouMessage })}
              disabled={!thankYouMessage || sendThankYou.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              Send Thank You
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
