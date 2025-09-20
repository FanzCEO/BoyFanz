import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  MessageCircle, 
  Image,
  Video,
  DollarSign,
  MoreVertical,
  Search
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
          className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent/50 ${
            selectedUserId === conversation.userId ? 'bg-accent' : ''
          }`}
          onClick={() => onSelectConversation(conversation.userId)}
          data-testid={`conversation-${conversation.userId}`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-12 w-12">
                <AvatarImage src={conversation.profileImageUrl} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {conversation.username[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              {conversation.isOnline && (
                <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate" data-testid={`username-${conversation.userId}`}>
                  {conversation.username}
                </span>
                {conversation.lastMessage && (
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(conversation.lastMessage.createdAt)}
                  </span>
                )}
              </div>
              
              {conversation.lastMessage && (
                <p className="text-xs text-muted-foreground truncate mt-1">
                  {conversation.lastMessage.type === 'text' 
                    ? conversation.lastMessage.content 
                    : `${conversation.lastMessage.type} message`
                  }
                </p>
              )}
            </div>

            {conversation.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const MessageBubble = ({ message, isOwn }: { message: Message; isOwn: boolean }) => {
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

  return (
    <div 
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      data-testid={`message-${message.id}`}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
        isOwn 
          ? 'bg-primary text-primary-foreground' 
          : 'bg-muted'
      }`}>
        {message.type === 'tip' && (
          <div className="flex items-center gap-2 mb-2 text-amber-400">
            <DollarSign className="h-4 w-4" />
            <span className="font-semibold">
              {formatCurrency(message.priceCents)} tip
            </span>
          </div>
        )}

        {message.type === 'text' && message.content && (
          <p className="text-sm">{message.content}</p>
        )}

        {(message.type === 'photo' || message.type === 'video') && message.mediaUrl && (
          <div className="mb-2">
            <img 
              src={message.mediaUrl} 
              alt="Message media"
              className="rounded max-w-full h-auto"
            />
            {message.content && (
              <p className="text-sm mt-2">{message.content}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-75">
            {formatTime(message.createdAt)}
          </span>
          {message.readAt && isOwn && (
            <span className="text-xs opacity-75">Read</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default function Messages() {
  const [selectedUserId, setSelectedUserId] = useState<string>();
  const [newMessage, setNewMessage] = useState('');

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUserId],
    enabled: !!selectedUserId,
  });

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUserId) return;

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverId: selectedUserId,
          type: 'text',
          content: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        // Refetch messages
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const currentUserId = 'current-user'; // This would come from auth context

  return (
    <div className="h-[calc(100vh-2rem)] max-h-[800px] border rounded-lg overflow-hidden bg-background" data-testid="messages-page">
      <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
        {/* Conversations List */}
        <div className="border-r border-border bg-muted/30">
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-semibold mb-3">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="search"
                placeholder="Search conversations..."
                className="pl-10"
                data-testid="search-conversations"
              />
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100%-120px)]">
            <div className="p-4">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No conversations yet</p>
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
        <div className="lg:col-span-2 flex flex-col">
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conversations.find(c => c.userId === selectedUserId)?.profileImageUrl} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {conversations.find(c => c.userId === selectedUserId)?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold" data-testid="chat-username">
                        {conversations.find(c => c.userId === selectedUserId)?.username}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {conversations.find(c => c.userId === selectedUserId)?.isOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">Start the conversation!</p>
                  </div>
                ) : (
                  <div>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.senderId === currentUserId}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" data-testid="attach-image">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid="attach-video">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" data-testid="send-tip">
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  
                  <div className="flex-1 flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      data-testid="message-input"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      data-testid="send-message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-sm">Choose a conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}