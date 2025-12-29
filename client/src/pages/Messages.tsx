import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRealtimeMessages, usePresence } from '@/hooks/useWebSocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Send,
  MessageCircle,
  Image,
  Video,
  DollarSign,
  MoreVertical,
  Search,
  Lock,
  Unlock,
  CreditCard,
  Flame,
  Zap,
  Eye,
  Heart,
  Users,
  Sparkles
} from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'photo' | 'video' | 'audio' | 'tip' | 'welcome';
  content?: string;
  mediaUrl?: string;
  priceCents: number;
  isPaid: boolean;
  isMassMessage: boolean;
  readAt?: string;
  createdAt: string;
  sender?: {
    username: string;
    profileImageUrl?: string;
  };
}

interface Conversation {
  userId: string;
  username: string;
  profileImageUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  isOnline: boolean;
}

const ConversationList = ({
  conversations,
  selectedUserId,
  onSelectConversation
}: {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (userId: string) => void;
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <div className="space-y-2">
      {conversations.map((conversation) => (
        <div
          key={conversation.userId}
          className={`p-3 rounded-xl cursor-pointer transition-all border ${
            selectedUserId === conversation.userId
              ? 'bg-gradient-to-r from-pink-950/60 to-red-950/60 border-pink-500/50 shadow-lg shadow-pink-500/10'
              : 'bg-gradient-to-r from-gray-900/40 to-black/40 border-gray-800/30 hover:border-pink-500/30 hover:shadow-md hover:shadow-pink-500/5'
          }`}
          onClick={() => onSelectConversation(conversation.userId)}
          data-testid={`conversation-${conversation.userId}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12 ring-2 ring-gray-700/50">
                <AvatarImage src={conversation.profileImageUrl} />
                <AvatarFallback className="bg-gradient-to-br from-pink-600 to-red-600 text-white font-bold">
                  {conversation.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-black rounded-full shadow-lg shadow-green-500/50 animate-pulse" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm truncate text-white" data-testid={`username-${conversation.userId}`}>
                  {conversation.username}
                </span>
                {conversation.lastMessage && (
                  <span className="text-xs text-gray-500 font-medium">
                    {formatTimeAgo(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>

              {conversation.lastMessage && (
                <p className="text-xs text-gray-400 truncate mt-1">
                  {conversation.lastMessage.type === 'text'
                    ? conversation.lastMessage.content
                    : `${conversation.lastMessage.type} message`
                  }
                </p>
              )}
            </div>

            {conversation.unreadCount > 0 && (
              <Badge className="bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold text-xs min-w-[24px] h-6 flex items-center justify-center shadow-lg shadow-pink-500/30 animate-pulse">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const MessageBubble = ({ message, isOwn, onPurchase }: {
  message: Message;
  isOwn: boolean;
  onPurchase: (message: Message) => void;
}) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isPaidMessage = message.priceCents > 0;
  const canViewContent = isOwn || !isPaidMessage || message.isPaid;

  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      data-testid={`message-${message.id}`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg ${
        isOwn
          ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-red-500/20'
          : isPaidMessage && !canViewContent
            ? 'bg-gradient-to-br from-yellow-950/50 via-black to-orange-950/50 border-2 border-yellow-500/30 shadow-yellow-500/10'
            : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50'
      }`}>
        {message.type === 'tip' && (
          <div className="flex items-center gap-2 mb-2 text-yellow-400">
            <div className="p-1.5 bg-yellow-500/20 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
            <span className="font-black uppercase tracking-wide">
              {formatCurrency(message.priceCents)} tip
            </span>
            <Flame className="h-4 w-4 animate-pulse" />
          </div>
        )}

        {/* Paid Message Header */}
        {isPaidMessage && !isOwn && (
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${canViewContent ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
              {canViewContent ? <Unlock className="h-4 w-4 text-green-400" /> : <Lock className="h-4 w-4 text-yellow-400" />}
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide ${canViewContent ? 'text-green-400' : 'text-yellow-400'}`}>
              {canViewContent ? 'Unlocked' : 'Premium Content'} - {formatCurrency(message.priceCents)}
            </span>
          </div>
        )}

        {/* Message Content */}
        {message.type === 'text' && (
          <>
            {canViewContent ? (
              <p className="text-sm leading-relaxed">{message.content}</p>
            ) : (
              <div className="text-center py-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl inline-block mb-3">
                  <Lock className="h-8 w-8 text-yellow-400" />
                </div>
                <p className="text-xs text-gray-400 mb-4 font-medium">
                  Pay {formatCurrency(message.priceCents)} to unlock this message
                </p>
                <Button
                  size="sm"
                  onClick={() => onPurchase(message)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold uppercase tracking-wide shadow-lg shadow-yellow-500/30"
                  data-testid={`unlock-message-${message.id}`}
                >
                  <CreditCard className="h-3 w-3 mr-2" />
                  Unlock {formatCurrency(message.priceCents)}
                </Button>
              </div>
            )}
          </>
        )}

        {(message.type === 'photo' || message.type === 'video') && (
          <div className="mb-2">
            {canViewContent && message.mediaUrl ? (
              <>
                <img
                  src={message.mediaUrl}
                  alt="Message media"
                  className="rounded-xl max-w-full h-auto shadow-lg"
                />
                {message.content && (
                  <p className="text-sm mt-2">{message.content}</p>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <div className="p-4 bg-yellow-500/10 rounded-xl inline-block mb-3">
                  <Eye className="h-10 w-10 text-yellow-400" />
                </div>
                <p className="text-xs text-gray-400 mb-4 font-medium">
                  Premium {message.type} - Pay {formatCurrency(message.priceCents)} to unlock
                </p>
                <Button
                  size="sm"
                  onClick={() => onPurchase(message)}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black font-bold uppercase tracking-wide shadow-lg shadow-yellow-500/30"
                >
                  <CreditCard className="h-3 w-3 mr-2" />
                  Unlock {formatCurrency(message.priceCents)}
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
          <span className="text-xs opacity-60 font-medium">
            {formatTime(message.createdAt)}
          </span>
          {message.readAt && isOwn && (
            <span className="text-xs text-green-400 font-medium flex items-center gap-1">
              <Eye className="h-3 w-3" /> Seen
            </span>
          )}
          {isPaidMessage && isOwn && (
            <Badge className="text-xs bg-green-600/30 text-green-400 border border-green-600/30 font-bold">
              {formatCurrency(message.priceCents)}
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [newMessage, setNewMessage] = useState('');
  const [isPaidMessage, setIsPaidMessage] = useState(false);
  const [messagePrice, setMessagePrice] = useState('');
  const [showPaymentDialog, setShowPaymentDialog] = useState<Message | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = 'current-user'; // This would come from auth context

  // Real-time messaging hooks
  const { messages: realtimeMessages, isTyping, handleTyping, markAsRead } = useRealtimeMessages(selectedUserId || undefined);
  const presenceStatus = usePresence(selectedUserId ? [selectedUserId] : []);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
  });

  // Combine API messages with real-time messages
  const { data: apiMessages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUserId],
    enabled: !!selectedUserId,
  });

  // Merge API and real-time messages, removing duplicates
  const messages = [...apiMessages, ...realtimeMessages]
    .filter((msg, index, self) =>
      index === self.findIndex(m => m.id === msg.id)
    )
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicator
  const handleInputChange = useCallback((value: string) => {
    setNewMessage(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    if (value && selectedUserId) {
      handleTyping(true);

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 2000);
    } else if (!value && selectedUserId) {
      handleTyping(false);
    }
  }, [selectedUserId, handleTyping]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedUserId && messages.length > 0) {
      const unreadMessageIds = messages
        .filter(msg => msg.receiverId === currentUserId && !msg.readAt)
        .map(msg => msg.id);

      if (unreadMessageIds.length > 0) {
        markAsRead(unreadMessageIds);
      }
    }
  }, [selectedUserId, messages, markAsRead, currentUserId]);

  const { data: currentUser } = useQuery<{ id: string; role: string }>({
    queryKey: ['/api/auth/me'],
  });

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // First send via WebSocket for instant delivery
      const { default: websocketService } = await import('@/services/websocketService');

      if (selectedUserId) {
        websocketService.sendMessage(
          selectedUserId,
          messageData.content,
          messageData.type,
          messageData.mediaUrl,
          messageData.priceCents
        );
      }

      // Then save to database via API
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        body: JSON.stringify(messageData),
      });
      if (!response.ok) throw new Error('Failed to send message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      setNewMessage('');
      setIsPaidMessage(false);
      setMessagePrice('');
      toast({
        title: "Message sent!",
        description: isPaidMessage ? `Paid message sent for $${messagePrice}` : "Message sent successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Purchase Message Mutation
  const purchaseMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      if (!response.ok) throw new Error('Failed to purchase message');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
      setShowPaymentDialog(null);
      toast({
        title: "Message unlocked!",
        description: "You can now view the message content.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    const priceCents = isPaidMessage && messagePrice ? parseFloat(messagePrice) * 100 : 0;

    sendMessageMutation.mutate({
      receiverId: selectedUserId,
      type: 'text',
      content: newMessage,
      priceCents,
      isPaid: isPaidMessage
    });
  };

  const handlePurchaseMessage = (message: Message) => {
    purchaseMessageMutation.mutate(message.id);
  };

  const isCreator = currentUser?.role === 'creator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black p-4 md:p-6" data-testid="messages-page">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-950/80 via-black to-red-950/80 border border-pink-500/20 p-6 md:p-8 mb-6">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-pink-600 to-red-600 rounded-xl shadow-lg shadow-pink-500/30">
            <Heart className="h-8 w-8 md:h-10 md:w-10 text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-red-400 to-orange-500">
              Fuck Buddies Social
            </h1>
            <p className="text-gray-400 mt-1 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-pink-400 animate-pulse" />
              <span className="font-medium">Connect with your buddies</span>
              <span className="text-gray-600">•</span>
              <span className="text-pink-400">{conversations.length} Active Chats</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="h-[calc(100vh-14rem)] max-h-[700px] border-2 border-gray-800/50 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900 shadow-2xl shadow-black/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Conversations List */}
          <div className="border-r-2 border-gray-800/50 bg-gradient-to-b from-gray-900/50 to-black/50">
            <div className="p-4 border-b-2 border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-black/80">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-pink-400" />
                <h2 className="text-lg font-black uppercase tracking-wide text-white">Your Buddies</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Find a buddy..."
                  className="pl-10 bg-gray-900/50 border-gray-700/50 focus:border-pink-500/50 focus:ring-pink-500/20 placeholder:text-gray-600"
                  data-testid="search-conversations"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(100%-120px)]">
              <div className="p-3">
                {conversations.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="p-4 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl inline-block mb-4">
                      <Heart className="h-12 w-12 text-pink-400" />
                    </div>
                    <p className="text-gray-400 font-bold uppercase tracking-wide">No buddies yet</p>
                    <p className="text-gray-600 text-sm mt-2">Start connecting with creators</p>
                    <p className="text-gray-600 text-xs mt-1">Find someone who catches your eye 👀</p>
                  </div>
                ) : (
                  <ConversationList
                    conversations={conversations}
                    selectedUserId={selectedUserId}
                    onSelectConversation={setSelectedUserId}
                  />
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col bg-gradient-to-br from-gray-950/50 to-black/50">
            {selectedUserId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b-2 border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-black/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Avatar className="h-12 w-12 ring-2 ring-pink-500/30">
                          <AvatarImage src={conversations.find(c => c.userId === selectedUserId)?.profileImageUrl} />
                          <AvatarFallback className="bg-gradient-to-br from-pink-600 to-red-600 text-white font-bold">
                            {conversations.find(c => c.userId === selectedUserId)?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {conversations.find(c => c.userId === selectedUserId)?.isOnline && (
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 bg-gradient-to-r from-green-400 to-emerald-400 border-2 border-black rounded-full shadow-lg shadow-green-500/50" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-white uppercase tracking-wide" data-testid="chat-username">
                          {conversations.find(c => c.userId === selectedUserId)?.username}
                        </h3>
                        <p className="text-xs flex items-center gap-2">
                          {conversations.find(c => c.userId === selectedUserId)?.isOnline ? (
                            <>
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              <span className="text-green-400 font-medium">Online now</span>
                            </>
                          ) : (
                            <>
                              <span className="w-2 h-2 bg-gray-600 rounded-full"></span>
                              <span className="text-gray-500 font-medium">Offline</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800/50">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="p-4 bg-gray-800/30 rounded-xl inline-block mb-4">
                        <Zap className="h-10 w-10 text-yellow-500" />
                      </div>
                      <p className="text-gray-400 font-bold uppercase tracking-wide">Break the ice</p>
                      <p className="text-gray-600 text-sm mt-1">Send the first message</p>
                    </div>
                  ) : (
                    <div>
                      {messages.map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isOwn={message.senderId === currentUserId}
                          onPurchase={handlePurchaseMessage}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t-2 border-gray-800/50 bg-gradient-to-r from-gray-900/80 to-black/80">
                  {/* Paid Message Settings (Creators Only) */}
                  {isCreator && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-yellow-950/30 via-black to-orange-950/30 rounded-xl border border-yellow-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <Label htmlFor="paid-message" className="text-sm font-bold uppercase tracking-wide text-yellow-400 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Premium Message
                        </Label>
                        <Switch
                          id="paid-message"
                          checked={isPaidMessage}
                          onCheckedChange={setIsPaidMessage}
                          data-testid="paid-message-toggle"
                          className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-yellow-600 data-[state=checked]:to-orange-600"
                        />
                      </div>
                      {isPaidMessage && (
                        <div className="flex items-center gap-3 bg-black/30 rounded-lg p-2">
                          <div className="p-2 bg-yellow-500/20 rounded-lg">
                            <DollarSign className="h-4 w-4 text-yellow-400" />
                          </div>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            max="999.99"
                            value={messagePrice}
                            onChange={(e) => setMessagePrice(e.target.value)}
                            placeholder="0.00"
                            className="w-24 text-sm bg-transparent border-yellow-500/30 focus:border-yellow-500 text-yellow-400 font-bold"
                            data-testid="message-price-input"
                          />
                          <span className="text-xs text-yellow-500/70 font-bold uppercase">USD</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 hover:bg-red-500/10" data-testid="attach-image">
                      <Image className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-red-400 hover:bg-red-500/10" data-testid="attach-video">
                      <Video className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10" data-testid="send-tip">
                      <DollarSign className="h-5 w-5" />
                    </Button>

                    <div className="flex-1 flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={
                          isPaidMessage && messagePrice
                            ? `Premium message ($${messagePrice})...`
                            : "Type your message..."
                        }
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        data-testid="message-input"
                        className={`bg-gray-900/50 border-gray-700/50 focus:ring-red-500/20 placeholder:text-gray-600 ${
                          isPaidMessage
                            ? "border-yellow-500/30 focus:border-yellow-500"
                            : "focus:border-red-500/50"
                        }`}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || (isPaidMessage && !messagePrice) || sendMessageMutation.isPending}
                        data-testid="send-message"
                        className={`font-bold uppercase tracking-wide shadow-lg ${
                          isPaidMessage
                            ? "bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-black shadow-yellow-500/30"
                            : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-red-500/30"
                        }`}
                      >
                        {sendMessageMutation.isPending ? (
                          <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                        ) : isPaidMessage ? (
                          <Lock className="h-4 w-4" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="p-6 bg-gradient-to-br from-pink-500/20 via-red-500/10 to-orange-500/20 rounded-2xl inline-block mb-6 border border-pink-500/30">
                    <Heart className="h-16 w-16 text-pink-400 fill-pink-400/30" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400 mb-2">Pick a Buddy</h3>
                  <p className="text-gray-500 font-medium">Choose someone to start chatting</p>
                  <p className="text-gray-600 text-sm mt-2 flex items-center justify-center gap-2">
                    <Sparkles className="h-4 w-4 text-pink-500" />
                    Slide into their DMs
                    <Sparkles className="h-4 w-4 text-pink-500" />
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
