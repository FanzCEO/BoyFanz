/**
 * AI Tutorial Guide Component
 * Interactive AI-powered help assistant for BoyFanz
 * Styled with neon cyan BoyFanz theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  Bot,
  Send,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  BookOpen,
  MessageCircle,
  Zap,
  X
} from 'lucide-react';
import { wikiArticles, WikiArticle, searchArticles } from '@/data/wiki/wikiContent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: string[];
  relatedArticles?: WikiArticle[];
  timestamp: Date;
}

interface AITutorialGuideProps {
  initialContext?: string;
  compact?: boolean;
  onArticleSelect?: (slug: string) => void;
}

export function AITutorialGuide({
  initialContext,
  compact = false,
  onArticleSelect
}: AITutorialGuideProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick action prompts
  const quickPrompts = [
    { icon: Sparkles, text: 'How do I get started?', category: 'getting-started' },
    { icon: Zap, text: 'How do I earn money?', category: 'payments' },
    { icon: BookOpen, text: 'Explain 2257 compliance', category: 'compliance' },
    { icon: MessageCircle, text: 'Help with my account', category: 'troubleshooting' },
  ];

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: initialContext
          ? `I'm your BoyFanz AI Guide! I see you're looking at ${initialContext}. How can I help you with this topic?`
          : `Welcome to BoyFanz! I'm your AI-powered guide. I can help you with:\n\n• Getting started on the platform\n• Creator tools and strategies\n• Payments and earnings\n• Security and compliance\n• Technical questions\n\nWhat would you like to know?`,
        suggestions: ['How do I become a creator?', 'Explain subscription tiers', 'How do payouts work?'],
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [initialContext]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateResponse = (userQuery: string): Message => {
    const query = userQuery.toLowerCase();

    // Search for relevant articles
    const relevantArticles = searchArticles(userQuery).slice(0, 3);

    // Generate contextual response based on query
    let response = '';
    let suggestions: string[] = [];

    if (query.includes('start') || query.includes('begin') || query.includes('new')) {
      response = `Great question! Here's how to get started on BoyFanz:\n\n**1. Create Your Account**\nSign up using email or FanzSSO for instant access.\n\n**2. Verify Your Age**\nComplete age verification (required for all users).\n\n**3. Set Up Your Profile**\nAdd a photo, bio, and customize your page.\n\n**4. Choose Your Path**\n• **As a Fan**: Subscribe to creators, tip, and engage\n• **As a Creator**: Set up monetization and start posting\n\nWould you like me to explain any of these steps in detail?`;
      suggestions = ['How do I verify my age?', 'Setting up as a creator', 'How do subscriptions work?'];
    } else if (query.includes('earn') || query.includes('money') || query.includes('payout') || query.includes('payment')) {
      response = `Here's how you earn money on BoyFanz:\n\n**Revenue Streams:**\n• **Subscriptions** - Recurring monthly income\n• **Tips** - One-time gifts from fans\n• **PPV Content** - Pay-per-view locked posts\n• **Custom Requests** - Personalized content\n• **Live Streams** - Virtual gifts\n\n**Revenue Split:**\nYou keep **80%** of all earnings. Platform takes 20% for processing, hosting, and support.\n\n**Payouts:**\n• Weekly automatic payouts (every Monday)\n• Minimum: $20 for ACH, $500 for wire\n• Options: Direct deposit, Paxum, crypto\n\nNeed more details on any of these?`;
      suggestions = ['Payout methods', 'Tax information', 'How to increase earnings'];
    } else if (query.includes('2257') || query.includes('compliance') || query.includes('legal')) {
      response = `**18 U.S.C. §2257 Compliance**\n\nThis is federal law requiring age verification for adult content.\n\n**What You Need:**\n• Government-issued photo ID\n• Proof you're 18+\n• Content index records\n\n**BoyFanz Handles:**\n• Secure document storage\n• Automated record keeping\n• Custodian of records\n• Audit trail\n\n**Your Responsibility:**\n• Provide accurate ID info\n• Keep your documents current\n• Maintain backup copies\n\nThis is automatically managed when you verify your account. Need help with verification?`;
      suggestions = ['Start verification', 'What documents are accepted?', 'Privacy of my documents'];
    } else if (query.includes('security') || query.includes('hack') || query.includes('protect')) {
      response = `**Securing Your BoyFanz Account**\n\n**Essential Steps:**\n1. **Strong Password** - 12+ chars, mixed case, numbers, symbols\n2. **Enable 2FA** - Use authenticator app (not SMS)\n3. **Unique Email** - Don't reuse passwords\n4. **Session Management** - Review active devices\n\n**We Protect You With:**\n• End-to-end encryption\n• Zero-trust architecture\n• Login alerts\n• Automatic suspicious activity detection\n\n**If Compromised:**\n1. Change password immediately\n2. Revoke all sessions\n3. Reset 2FA\n4. Contact support\n\nWant me to guide you through enabling 2FA?`;
      suggestions = ['Enable 2FA now', 'View active sessions', 'Security best practices'];
    } else if (query.includes('creator') || query.includes('content') || query.includes('post')) {
      response = `**Creator Success on BoyFanz**\n\n**Setting Up:**\n1. Complete creator verification\n2. Set subscription prices (we suggest $9.99-$19.99 to start)\n3. Create welcome message for new subs\n4. Upload initial content library\n\n**Content Strategy:**\n• Post 3-7 times per week\n• Mix free teasers with paid content\n• Engage with comments and DMs\n• Go live regularly\n\n**Growth Tips:**\n• Cross-promote on social media\n• Collaborate with other creators\n• Offer limited-time promotions\n• Respond quickly to messages\n\nWhat aspect would you like to dive deeper into?`;
      suggestions = ['Pricing strategies', 'Content ideas', 'Growing subscribers'];
    } else {
      // Generic helpful response with article suggestions
      if (relevantArticles.length > 0) {
        response = `I found some articles that might help with "${userQuery}":\n\n`;
        relevantArticles.forEach((article, i) => {
          response += `**${i + 1}. ${article.title}**\n${article.summary}\n\n`;
        });
        response += `Click on any article to read more, or ask me a specific question!`;
      } else {
        response = `I'd be happy to help with that! While I search for the best answer, here are some things I can definitely help with:\n\n• Account setup and verification\n• Creator tools and monetization\n• Payment and payout questions\n• Security and privacy\n• Technical troubleshooting\n\nCould you rephrase your question or pick one of these topics?`;
      }
      suggestions = ['Getting started guide', 'Creator tips', 'Payment help', 'Contact support'];
    }

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      suggestions,
      relatedArticles: relevantArticles,
      timestamp: new Date()
    };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(input);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleQuickPrompt = (text: string) => {
    setInput(text);
    setTimeout(() => handleSend(), 100);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  if (compact && !isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold rounded-full shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 transition-all duration-300"
      >
        <Bot className="w-5 h-5" />
        <span>AI Guide</span>
        <Sparkles className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className={`${compact ? 'fixed bottom-6 right-6 z-50 w-96' : 'w-full'} bg-gradient-to-b from-gray-900 to-black border border-cyan-500/30 rounded-xl shadow-2xl shadow-cyan-500/10 overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-cyan-500/20 to-transparent border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-6 h-6 text-cyan-400" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">BoyFanz AI Guide</h3>
            <p className="text-xs text-cyan-400/70">Powered by FANZ Intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {compact && (
            <button
              onClick={() => setIsExpanded(false)}
              className="p-1.5 hover:bg-cyan-500/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="h-80 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-gray-800/80 text-gray-100 border border-cyan-500/10'
              }`}
            >
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>

              {/* Related Articles */}
              {message.relatedArticles && message.relatedArticles.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-500/20">
                  <p className="text-xs text-cyan-400 mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Related Articles
                  </p>
                  <div className="space-y-1">
                    {message.relatedArticles.map((article) => (
                      <button
                        key={article.id}
                        onClick={() => onArticleSelect?.(article.slug)}
                        className="block w-full text-left text-xs text-cyan-300 hover:text-cyan-100 hover:bg-cyan-500/10 rounded px-2 py-1 transition-colors"
                      >
                        {article.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {message.suggestions && message.suggestions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-cyan-500/20 flex flex-wrap gap-2">
                  {message.suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 px-2 py-1 rounded-full transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 rounded-xl px-4 py-3 border border-cyan-500/10">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {quickPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleQuickPrompt(prompt.text)}
                className="flex items-center gap-1.5 text-xs bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 px-3 py-1.5 rounded-full border border-cyan-500/20 transition-all hover:border-cyan-500/40"
              >
                <prompt.icon className="w-3 h-3" />
                {prompt.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-gray-800/50 border border-cyan-500/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:cursor-not-allowed text-black rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          AI responses are for guidance only. For account issues, contact support.
        </p>
      </div>
    </div>
  );
}

export default AITutorialGuide;
