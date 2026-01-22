// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Users,
  Headphones,
  HelpCircle,
  Book,
  Ticket,
  PlayCircle,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Bell,
  BellOff,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
    role: 'user' | 'agent' | 'admin' | 'moderator';
  };
  metadata?: {
    confidence?: number;
    suggestedActions?: Array<{ title: string; url: string }>;
    isTyping?: boolean;
  };
}

interface LiveSession {
  id: string;
  status: 'waiting' | 'connected' | 'ended';
  queuePosition?: number;
  estimatedWait?: number;
  agent?: {
    id: string;
    name: string;
    avatar?: string;
    status: 'online' | 'busy';
  };
  createdAt: Date;
}

interface SupportStatus {
  isOnline: boolean;
  agentsAvailable: number;
  averageWaitTime: string;
  queueLength: number;
}

export function FloatingSupportWidget() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'live' | 'resources'>('ai');
  const [message, setMessage] = useState('');
  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([]);
  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Check support availability
  const { data: supportStatus } = useQuery<SupportStatus>({
    queryKey: ['/api/help/support/status'],
    refetchInterval: 30000, // Check every 30 seconds
    staleTime: 15000
  });

  // Initialize AI welcome message
  useEffect(() => {
    if (aiMessages.length === 0) {
      setAiMessages([{
        id: 'welcome',
        type: 'bot',
        content: "Hi! I'm your AI assistant. How can I help you today?",
        timestamp: new Date(),
        metadata: {
          confidence: 1,
          suggestedActions: [
            { title: 'Account Help', url: '/help/wiki?category=account' },
            { title: 'Payment Issues', url: '/help/wiki?category=billing' },
            { title: 'Content Upload', url: '/help/wiki?category=content' }
          ]
        }
      }]);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiMessages, liveMessages]);

  // Check PWA push notification status
  useEffect(() => {
    const checkPushStatus = async () => {
      if ('Notification' in window && 'serviceWorker' in navigator) {
        const permission = Notification.permission;
        setPushEnabled(permission === 'granted');
      }
    };
    checkPushStatus();
  }, []);

  // Poll for live chat messages when in session
  useEffect(() => {
    if (liveSession?.status === 'connected') {
      const interval = setInterval(async () => {
        try {
          const response = await apiRequest<{ messages: ChatMessage[] }>(
            `/api/help/chat/live/${liveSession.id}/messages`
          );
          if (response.messages) {
            setLiveMessages(response.messages.map(m => ({
              ...m,
              timestamp: new Date(m.timestamp)
            })));
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [liveSession]);

  // AI Chat mutation
  const aiChatMutation = useMutation({
    mutationFn: async (query: string) => {
      return apiRequest<{
        success: boolean;
        data: {
          answer: string;
          confidence: number;
          suggestedActions?: Array<{ title: string; url: string }>;
        };
      }>('/api/help/ask', {
        method: 'POST',
        body: { query, context: { currentPage: window.location.pathname } }
      });
    },
    onMutate: (query) => {
      // Add user message immediately
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content: query,
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, userMsg]);
    },
    onSuccess: (response) => {
      if (response.success) {
        const botMsg: ChatMessage = {
          id: `bot_${Date.now()}`,
          type: 'bot',
          content: response.data.answer,
          timestamp: new Date(),
          metadata: {
            confidence: response.data.confidence,
            suggestedActions: response.data.suggestedActions
          }
        };
        setAiMessages(prev => [...prev, botMsg]);
      }
    },
    onError: () => {
      const errorMsg: ChatMessage = {
        id: `error_${Date.now()}`,
        type: 'system',
        content: "I'm having trouble responding. Try again or connect to live support.",
        timestamp: new Date()
      };
      setAiMessages(prev => [...prev, errorMsg]);
    }
  });

  // Start live chat session
  const startLiveChatMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ session: LiveSession }>('/api/help/chat/live/start', {
        method: 'POST',
        body: {
          userId: user?.id,
          userName: user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Guest',
          userEmail: user?.email,
          currentPage: window.location.pathname
        }
      });
    },
    onSuccess: (response) => {
      setLiveSession({
        ...response.session,
        createdAt: new Date(response.session.createdAt)
      });
      setActiveTab('live');

      // Add system message
      setLiveMessages([{
        id: 'connecting',
        type: 'system',
        content: response.session.status === 'waiting'
          ? `You're #${response.session.queuePosition} in queue. Estimated wait: ${response.session.estimatedWait} minutes.`
          : 'Connecting you to a support agent...',
        timestamp: new Date()
      }]);

      // Request push notification permission
      requestPushPermission();
    }
  });

  // Send live message
  const sendLiveMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest<{ message: ChatMessage }>(`/api/help/chat/live/${liveSession?.id}/send`, {
        method: 'POST',
        body: { content, type: 'user' }
      });
    },
    onMutate: (content) => {
      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        type: 'user',
        content,
        timestamp: new Date(),
        sender: {
          id: user?.id || 'guest',
          name: user?.firstName || 'You',
          role: 'user'
        }
      };
      setLiveMessages(prev => [...prev, userMsg]);
    }
  });

  // Request push notification permission
  const requestPushPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      setPushEnabled(permission === 'granted');

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        // Register for push notifications
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: process.env.VAPID_PUBLIC_KEY
          });

          // Send subscription to server
          await apiRequest('/api/pwa/push/subscribe', {
            method: 'POST',
            body: { subscription, type: 'support_chat' }
          });
        } catch (error) {
          console.error('Push subscription failed:', error);
        }
      }
    }
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (activeTab === 'ai') {
      aiChatMutation.mutate(message);
    } else if (activeTab === 'live' && liveSession?.status === 'connected') {
      sendLiveMessageMutation.mutate(message);
    }
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickLinks = [
    { icon: Book, title: 'Knowledge Base', url: '/help/wiki', description: 'Browse help articles' },
    { icon: PlayCircle, title: 'Tutorials', url: '/help/tutorials', description: 'Step-by-step guides' },
    { icon: Ticket, title: 'Submit Ticket', url: '/help/tickets/new', description: 'Create support ticket' },
    { icon: HelpCircle, title: 'FAQ', url: '/help/wiki?category=faq', description: 'Common questions' }
  ];

  return (
    <>
      {/* Floating Button */}
      <div className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-300",
        isOpen && "hidden"
      )}>
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all relative"
          data-testid="button-open-support"
        >
          <MessageCircle className="h-6 w-6 text-white" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Pulsing indicator when support is online */}
        {supportStatus?.isOnline && (
          <span className="absolute top-0 right-0 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
        )}
      </div>

      {/* Support Widget Panel */}
      {isOpen && (
        <div className={cn(
          "fixed bottom-6 right-6 z-50 transition-all duration-300",
          isMinimized ? "w-80 h-14" : "w-96 h-[550px]"
        )}>
          <Card className="h-full flex flex-col bg-gray-900 border-gray-700 shadow-2xl overflow-hidden">
            {/* Header */}
            <CardHeader className="p-3 bg-gradient-to-r from-cyan-600 to-cyan-500 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-1.5 rounded-full">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-semibold text-white">Support Center</CardTitle>
                    {!isMinimized && (
                      <p className="text-xs text-white/80">
                        {supportStatus?.isOnline
                          ? `${supportStatus.agentsAvailable} agents online`
                          : 'AI support available 24/7'}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                  >
                    {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-7 w-7 p-0 text-white hover:bg-white/20"
                    data-testid="button-close-support"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <>
                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
                  <TabsList className="grid grid-cols-3 bg-gray-800 border-b border-gray-700 rounded-none">
                    <TabsTrigger
                      value="ai"
                      className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400"
                    >
                      <Bot className="h-3 w-3 mr-1" />
                      AI Chat
                    </TabsTrigger>
                    <TabsTrigger
                      value="live"
                      className="data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400"
                    >
                      <Headphones className="h-3 w-3 mr-1" />
                      Live
                      {supportStatus?.isOnline && (
                        <span className="ml-1 w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="resources"
                      className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400"
                    >
                      <Book className="h-3 w-3 mr-1" />
                      Help
                    </TabsTrigger>
                  </TabsList>

                  {/* AI Chat Tab */}
                  <TabsContent value="ai" className="flex-1 flex flex-col m-0 p-0">
                    <ScrollArea className="flex-1 p-3">
                      <div className="space-y-3">
                        {aiMessages.map((msg) => (
                          <div key={msg.id} className={cn(
                            "flex",
                            msg.type === 'user' ? 'justify-end' : 'justify-start'
                          )}>
                            <div className={cn(
                              "max-w-[85%] rounded-lg p-2.5 text-sm",
                              msg.type === 'user'
                                ? 'bg-cyan-600 text-white'
                                : msg.type === 'system'
                                ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                                : 'bg-gray-800 text-gray-100'
                            )}>
                              {msg.type === 'bot' && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Bot className="h-3 w-3 text-cyan-400" />
                                  <span className="text-xs text-gray-400">AI Assistant</span>
                                </div>
                              )}
                              <p className="whitespace-pre-wrap">{msg.content}</p>

                              {msg.metadata?.suggestedActions && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {msg.metadata.suggestedActions.map((action, i) => (
                                    <Button
                                      key={i}
                                      size="sm"
                                      variant="outline"
                                      className="text-xs h-6 px-2 border-gray-600 hover:bg-cyan-500/20"
                                      onClick={() => setLocation(action.url)}
                                    >
                                      {action.title}
                                    </Button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {aiChatMutation.isPending && (
                          <div className="flex justify-start">
                            <div className="bg-gray-800 rounded-lg p-2.5">
                              <div className="flex items-center gap-2">
                                <Bot className="h-3 w-3 text-cyan-400" />
                                <div className="flex gap-1">
                                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* AI Input */}
                    <div className="p-3 border-t border-gray-700">
                      <div className="flex gap-2">
                        <Input
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Ask me anything..."
                          className="flex-1 bg-gray-800 border-gray-600 text-white text-sm h-9"
                          disabled={aiChatMutation.isPending}
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || aiChatMutation.isPending}
                          className="bg-cyan-600 hover:bg-cyan-700 h-9 w-9 p-0"
                        >
                          {aiChatMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Live Chat Tab */}
                  <TabsContent value="live" className="flex-1 flex flex-col m-0 p-0">
                    {!liveSession ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                        <Headphones className="h-12 w-12 text-green-400 mb-4" />
                        <h3 className="text-lg font-semibold text-white mb-2">Live Support</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {supportStatus?.isOnline
                            ? `${supportStatus.agentsAvailable} agents ready to help • ~${supportStatus.averageWaitTime} wait`
                            : 'Live support is currently offline. Try AI chat or leave a message.'}
                        </p>

                        {supportStatus?.isOnline ? (
                          <Button
                            onClick={() => startLiveChatMutation.mutate()}
                            disabled={startLiveChatMutation.isPending}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {startLiveChatMutation.isPending ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Users className="h-4 w-4 mr-2" />
                            )}
                            Connect to Agent
                          </Button>
                        ) : (
                          <Button
                            onClick={() => setLocation('/help/tickets/new')}
                            variant="outline"
                            className="border-gray-600"
                          >
                            <Ticket className="h-4 w-4 mr-2" />
                            Leave a Message
                          </Button>
                        )}

                        {/* Push notification toggle */}
                        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={requestPushPermission}
                          >
                            {pushEnabled ? (
                              <>
                                <Bell className="h-3 w-3 mr-1 text-green-400" />
                                Notifications On
                              </>
                            ) : (
                              <>
                                <BellOff className="h-3 w-3 mr-1" />
                                Enable Notifications
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Connection Status */}
                        <div className={cn(
                          "px-3 py-2 text-xs flex items-center justify-between",
                          liveSession.status === 'connected'
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        )}>
                          {liveSession.status === 'connected' ? (
                            <>
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-3 w-3" />
                                <span>Connected to {liveSession.agent?.name}</span>
                              </div>
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={liveSession.agent?.avatar} />
                                <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                              </Avatar>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 animate-pulse" />
                                <span>Queue position: #{liveSession.queuePosition}</span>
                              </div>
                              <span>~{liveSession.estimatedWait} min wait</span>
                            </>
                          )}
                        </div>

                        <ScrollArea className="flex-1 p-3">
                          <div className="space-y-3">
                            {liveMessages.map((msg) => (
                              <div key={msg.id} className={cn(
                                "flex",
                                msg.type === 'user' ? 'justify-end' : 'justify-start'
                              )}>
                                {msg.type === 'agent' && (
                                  <Avatar className="h-6 w-6 mr-2 flex-shrink-0">
                                    <AvatarImage src={msg.sender?.avatar} />
                                    <AvatarFallback><User className="h-3 w-3" /></AvatarFallback>
                                  </Avatar>
                                )}
                                <div className={cn(
                                  "max-w-[80%] rounded-lg p-2.5 text-sm",
                                  msg.type === 'user'
                                    ? 'bg-green-600 text-white'
                                    : msg.type === 'system'
                                    ? 'bg-gray-700 text-gray-300 text-xs italic'
                                    : 'bg-gray-800 text-gray-100'
                                )}>
                                  {msg.type === 'agent' && msg.sender && (
                                    <div className="text-xs text-gray-400 mb-1">{msg.sender.name}</div>
                                  )}
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                              </div>
                            ))}
                            <div ref={messagesEndRef} />
                          </div>
                        </ScrollArea>

                        {/* Live Input */}
                        <div className="p-3 border-t border-gray-700">
                          <div className="flex gap-2">
                            <Input
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder={liveSession.status === 'connected' ? 'Type a message...' : 'Waiting for agent...'}
                              className="flex-1 bg-gray-800 border-gray-600 text-white text-sm h-9"
                              disabled={liveSession.status !== 'connected' || sendLiveMessageMutation.isPending}
                            />
                            <Button
                              onClick={handleSendMessage}
                              disabled={!message.trim() || liveSession.status !== 'connected' || sendLiveMessageMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 h-9 w-9 p-0"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* Resources Tab */}
                  <TabsContent value="resources" className="flex-1 m-0 p-0">
                    <ScrollArea className="h-full">
                      <div className="p-3 space-y-2">
                        <p className="text-xs text-gray-400 mb-3">Quick access to help resources</p>

                        {quickLinks.map((link, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            className="w-full justify-start h-auto py-3 px-3 bg-gray-800/50 hover:bg-gray-800 text-left"
                            onClick={() => {
                              setLocation(link.url);
                              setIsOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-cyan-500/20 p-2 rounded-lg">
                                <link.icon className="h-4 w-4 text-cyan-400" />
                              </div>
                              <div>
                                <div className="font-medium text-white text-sm">{link.title}</div>
                                <div className="text-xs text-gray-400">{link.description}</div>
                              </div>
                              <ExternalLink className="h-3 w-3 text-gray-500 ml-auto" />
                            </div>
                          </Button>
                        ))}

                        <div className="pt-4 border-t border-gray-700 mt-4">
                          <Button
                            variant="outline"
                            className="w-full border-gray-600 text-gray-300 hover:bg-cyan-500/10 hover:border-cyan-500/50"
                            onClick={() => {
                              setLocation('/help');
                              setIsOpen(false);
                            }}
                          >
                            <HelpCircle className="h-4 w-4 mr-2" />
                            Open Full Help Center
                          </Button>
                        </div>
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
