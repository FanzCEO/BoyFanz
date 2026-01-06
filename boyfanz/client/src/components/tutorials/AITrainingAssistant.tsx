import { useState, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Bot,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Loader2,
  BookOpen,
  HelpCircle,
  Lightbulb,
  MessageCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useLocation } from 'wouter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  actions?: Array<{
    label: string;
    action: 'navigate' | 'tutorial' | 'link';
    target: string;
  }>;
  timestamp: Date;
}

interface AITrainingAssistantProps {
  context?: {
    currentPage?: string;
    currentTutorial?: string;
    userRole?: 'creator' | 'fan';
  };
  isFloating?: boolean;
  defaultOpen?: boolean;
}

// Quick questions for different contexts
const QUICK_QUESTIONS: Record<string, string[]> = {
  default: [
    "How do I complete 2257 verification?",
    "What content is not allowed?",
    "How do I invite a CoStar?",
    "How do I set up payouts?"
  ],
  compliance: [
    "What records do I need to keep?",
    "How long must I keep 2257 records?",
    "What happens if I'm not compliant?",
    "Do I need verification for solo content?"
  ],
  monetization: [
    "How do I price my content?",
    "When do I get paid?",
    "How do tips work?",
    "What are PPV posts?"
  ],
  streaming: [
    "How do I go live?",
    "What equipment do I need?",
    "How do I accept tips during streams?",
    "Can I save my live streams?"
  ]
};

// Contextual tips based on page
const CONTEXTUAL_TIPS: Record<string, string> = {
  '/compliance': "I can help you understand 2257 requirements and guide you through the verification process.",
  '/costar': "Need help inviting and verifying a collaborator? I can walk you through the CoStar process.",
  '/payouts': "Questions about payments? I can explain payout schedules, minimums, and tax requirements.",
  '/streams/create': "Getting ready to go live? I can help you prepare for your first stream.",
  '/settings': "I can help you configure your profile, privacy settings, and security options."
};

export function AITrainingAssistant({
  context,
  isFloating = true,
  defaultOpen = false
}: AITrainingAssistantProps) {
  const [, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your BoyFanz Training Assistant. I can help you learn about platform features, answer questions about compliance, and guide you through any process. What would you like to know?",
      suggestions: QUICK_QUESTIONS.default,
      timestamp: new Date()
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get quick questions based on current context
  const getQuickQuestions = () => {
    if (context?.currentPage?.includes('compliance')) return QUICK_QUESTIONS.compliance;
    if (context?.currentPage?.includes('payout')) return QUICK_QUESTIONS.monetization;
    if (context?.currentPage?.includes('stream')) return QUICK_QUESTIONS.streaming;
    return QUICK_QUESTIONS.default;
  };

  // Get contextual tip
  const getContextualTip = () => {
    if (context?.currentPage) {
      return CONTEXTUAL_TIPS[context.currentPage];
    }
    return null;
  };

  // AI response mutation
  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const res = await fetch('/api/help/training-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          question,
          context: {
            ...context,
            previousMessages: messages.slice(-5).map(m => ({
              role: m.role,
              content: m.content
            }))
          }
        })
      });
      if (!res.ok) throw new Error('Failed to get response');
      return res.json();
    },
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        suggestions: data.suggestions,
        actions: data.actions,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't process that request. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  });

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || askMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    askMutation.mutate(input.trim());
    setInput('');
  };

  const handleQuickQuestion = (question: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: question,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    askMutation.mutate(question);
  };

  const handleAction = (action: Message['actions'][0]) => {
    switch (action.action) {
      case 'navigate':
        setLocation(action.target);
        break;
      case 'tutorial':
        setLocation(`/help/tutorials/${action.target}`);
        break;
      case 'link':
        window.open(action.target, '_blank');
        break;
    }
  };

  // Floating button when closed
  if (isFloating && !isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
      >
        <Bot className="h-6 w-6" />
      </Button>
    );
  }

  // Minimized state
  if (isOpen && isMinimized) {
    return (
      <div className={cn(
        "bg-gray-800 border border-gray-700 rounded-lg shadow-xl",
        isFloating && "fixed bottom-20 right-4 z-50"
      )}>
        <div
          className="flex items-center gap-3 px-4 py-3 cursor-pointer"
          onClick={() => setIsMinimized(false)}
        >
          <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-medium">Training Assistant</span>
          <div className="flex items-center gap-1 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-gray-400 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={cn(
      "bg-gray-800 border-gray-700 shadow-xl flex flex-col",
      isFloating && "fixed bottom-20 right-4 z-50 w-96 max-h-[600px]"
    )}>
      {/* Header */}
      <CardHeader className="flex-shrink-0 pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg text-white">Training Assistant</CardTitle>
              <p className="text-xs text-gray-400">Powered by AI</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {isFloating && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsMinimized(true)}
              >
                <Minimize2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contextual Tip */}
        {getContextualTip() && (
          <div className="mt-3 p-2 bg-purple-900/30 border border-purple-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-purple-300">{getContextualTip()}</p>
            </div>
          </div>
        )}
      </CardHeader>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-3",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-gray-700 text-gray-100"
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-400 flex items-center">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Quick questions:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          className="text-xs h-auto py-1 px-2 border-gray-600 text-gray-300 hover:bg-gray-600"
                          onClick={() => handleQuickQuestion(suggestion)}
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {message.actions.map((action, i) => (
                      <Button
                        key={i}
                        variant="secondary"
                        size="sm"
                        className="w-full justify-between text-xs"
                        onClick={() => handleAction(action)}
                      >
                        <span className="flex items-center">
                          {action.action === 'tutorial' && <BookOpen className="h-3 w-3 mr-2" />}
                          {action.action === 'navigate' && <ChevronRight className="h-3 w-3 mr-2" />}
                          {action.action === 'link' && <ExternalLink className="h-3 w-3 mr-2" />}
                          {action.label}
                        </span>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {askMutation.isPending && (
            <div className="flex justify-start">
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex-shrink-0 p-4 border-t border-gray-700">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            disabled={askMutation.isPending}
          />
          <Button
            type="submit"
            size="icon"
            disabled={!input.trim() || askMutation.isPending}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => handleQuickQuestion("Show me available tutorials")}
          >
            <BookOpen className="h-3 w-3 mr-1" />
            Tutorials
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white"
            onClick={() => handleQuickQuestion("What should I do first as a new creator?")}
          >
            <Sparkles className="h-3 w-3 mr-1" />
            Getting Started
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default AITrainingAssistant;
