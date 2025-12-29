import { useState, useRef, useEffect } from 'react';
import {
  MessageCircle,
  Send,
  Bot,
  Clock,
  HelpCircle,
  FileText,
  CreditCard,
  Shield,
  Camera,
  Users,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Link } from 'wouter';

interface Message {
  id: string;
  content: string;
  type: 'user' | 'bot';
  timestamp: Date;
}

// Common help topics with quick answers
const helpTopics = [
  {
    id: 'earnings',
    icon: CreditCard,
    title: 'Earnings & Payouts',
    description: 'How to get paid',
    answer: 'BoyFanz operates on a 100% creator earnings program - we take 0% platform fees. You only pay standard payment processing fees (around 2.9%). Request payouts anytime once you reach the $20 minimum. Payments process within 3-5 business days via PayPal, Stripe, or direct bank transfer.'
  },
  {
    id: 'verification',
    icon: Shield,
    title: 'Account Verification',
    description: 'ID verification process',
    answer: 'To verify your account: 1) Go to Settings > Verification, 2) Upload a government-issued ID (passport, driver\'s license, or national ID), 3) Take a selfie holding your ID, 4) Wait 24-48 hours for review. Verified creators get a badge and access to premium features.'
  },
  {
    id: 'content',
    icon: Camera,
    title: 'Content Guidelines',
    description: 'What you can post',
    answer: 'All content must comply with our Terms of Service. You must be 18+ and own rights to everything you post. All performers must be verified. Prohibited content includes: illegal activities, non-consensual content, minors (even non-sexual), and copyrighted material you don\'t own.'
  },
  {
    id: 'subscribers',
    icon: Users,
    title: 'Managing Subscribers',
    description: 'Subscriber features',
    answer: 'View your subscribers in Dashboard > Subscribers. You can: send mass messages, offer discounts, create subscription tiers ($4.99-$49.99/month), enable free trials, and manage blocked users. Subscribers can be filtered by status, join date, and spending.'
  },
  {
    id: 'technical',
    icon: HelpCircle,
    title: 'Technical Issues',
    description: 'Common problems & fixes',
    answer: 'Common fixes: Clear browser cache, try incognito mode, check internet connection, update browser. For upload issues: ensure files are under 2GB, use supported formats (MP4, MOV, JPG, PNG). Still having issues? Email support@fanz.website with your username and a description of the problem.'
  },
  {
    id: 'safety',
    icon: Shield,
    title: 'Safety & Privacy',
    description: 'Protect your content',
    answer: 'We protect your content with: digital watermarking, screenshot detection alerts, DMCA takedown services, and profile visibility controls. Enable two-factor authentication in Settings > Security. Block users anytime. Report violations through the Report button on any content or profile.'
  }
];

// Simple AI response generator based on keywords
const generateResponse = (userMessage: string): string => {
  const msg = userMessage.toLowerCase();

  if (msg.includes('payout') || msg.includes('payment') || msg.includes('earn') || msg.includes('money') || msg.includes('pay')) {
    return helpTopics.find(t => t.id === 'earnings')?.answer || '';
  }
  if (msg.includes('verify') || msg.includes('verification') || msg.includes('id')) {
    return helpTopics.find(t => t.id === 'verification')?.answer || '';
  }
  if (msg.includes('content') || msg.includes('post') || msg.includes('upload') || msg.includes('guideline')) {
    return helpTopics.find(t => t.id === 'content')?.answer || '';
  }
  if (msg.includes('subscriber') || msg.includes('fan') || msg.includes('follow')) {
    return helpTopics.find(t => t.id === 'subscribers')?.answer || '';
  }
  if (msg.includes('bug') || msg.includes('error') || msg.includes('broken') || msg.includes('not working') || msg.includes('issue')) {
    return helpTopics.find(t => t.id === 'technical')?.answer || '';
  }
  if (msg.includes('safe') || msg.includes('privacy') || msg.includes('protect') || msg.includes('block') || msg.includes('report')) {
    return helpTopics.find(t => t.id === 'safety')?.answer || '';
  }

  return "I can help you with: earnings & payouts, account verification, content guidelines, managing subscribers, technical issues, and safety & privacy. What would you like to know more about? For urgent issues, email support@fanz.website.";
};

export function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm BoyFanz Support Bot. Ask me anything about payouts, verification, content guidelines, or technical issues. What can I help you with today?",
      type: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(userMessage.content);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        type: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleTopicClick = (topic: typeof helpTopics[0]) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: topic.title,
      type: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: topic.answer,
        type: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-900/20" data-testid="chat-page">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-500/10"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <Link href="/help" className="inline-flex items-center text-gray-400 hover:text-white mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Link>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-red-600 to-orange-500 rounded-full">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Support Chat</h1>
              <p className="text-gray-400">Get instant help with common questions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Quick Topics Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-400" />
                  Quick Topics
                </CardTitle>
                <CardDescription>
                  Click a topic for instant answers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {helpTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleTopicClick(topic)}
                    className="w-full p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-red-500/30 transition-all text-left group"
                    data-testid={`topic-${topic.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                        <topic.icon className="h-4 w-4 text-red-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{topic.title}</p>
                        <p className="text-xs text-gray-500">{topic.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="bg-gray-900/50 border-gray-800 mt-4">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-orange-500/10 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Need More Help?</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Email: support@fanz.website
                    </p>
                    <p className="text-xs text-gray-400">
                      Response time: 24-48 hours
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card className="bg-gray-900/50 border-gray-800 h-[600px] flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b border-gray-800 py-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 bg-gradient-to-r from-red-600 to-orange-500">
                      <AvatarFallback className="bg-transparent">
                        <Bot className="h-5 w-5 text-white" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                  </div>
                  <div>
                    <p className="font-semibold text-white">BoyFanz Support</p>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-400">Online</span>
                    </div>
                  </div>
                  <Badge className="ml-auto bg-red-500/10 text-red-400 border-red-500/20">
                    AI Assistant
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[85%] ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}>
                        {msg.type === 'bot' && (
                          <Avatar className="h-8 w-8 flex-shrink-0 bg-gradient-to-r from-red-600 to-orange-500">
                            <AvatarFallback className="bg-transparent">
                              <Bot className="h-4 w-4 text-white" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2.5 ${
                            msg.type === 'user'
                              ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white'
                              : 'bg-gray-800 text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="flex gap-2">
                        <Avatar className="h-8 w-8 bg-gradient-to-r from-red-600 to-orange-500">
                          <AvatarFallback className="bg-transparent">
                            <Bot className="h-4 w-4 text-white" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-800 rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex gap-3">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your question..."
                    className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 resize-none min-h-[44px] max-h-[120px]"
                    rows={1}
                    data-testid="chat-input"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white px-4"
                    data-testid="send-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  For urgent issues or account problems, email support@fanz.website
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
