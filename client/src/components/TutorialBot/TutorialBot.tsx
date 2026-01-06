import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  Bot, X, ChevronRight, ChevronLeft, Sparkles, Play, Pause,
  Crown, Heart, Upload, DollarSign, Shield, Users, MessageCircle,
  Video, Image, Star, Settings, Bell, Wallet, BarChart3, HelpCircle,
  CheckCircle, Circle, Zap, Target, Gift, Lock, Eye, Compass,
  Rocket, Award, TrendingUp, Camera, FileText, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

// Tutorial step types
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  targetPath?: string;
  action?: 'navigate' | 'highlight' | 'explain';
  highlightSelector?: string;
  isComplete?: boolean;
}

interface TutorialTrack {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  forRole: 'creator' | 'fan' | 'both';
  steps: TutorialStep[];
  estimatedMinutes: number;
  priority: number;
}

// Contextual help for each page
const PAGE_CONTEXT: Record<string, { title: string; tips: string[]; quickActions: { label: string; path: string }[] }> = {
  '/': {
    title: 'Home Feed',
    tips: [
      'Your personalized feed shows content from creators you follow',
      'Scroll to discover trending content and new creators',
      'Double-tap posts to like them quickly'
    ],
    quickActions: [
      { label: 'Find Creators', path: '/explore' },
      { label: 'Post Content', path: '/post' }
    ]
  },
  '/infinity-feed': {
    title: 'Fanz Spa',
    tips: [
      'Endless scrolling of curated content based on your preferences',
      'AI-powered recommendations learn from your interactions',
      'Swipe right to follow a creator, left to skip'
    ],
    quickActions: [
      { label: 'Adjust Preferences', path: '/settings' }
    ]
  },
  '/dashboard': {
    title: 'Creator Dashboard',
    tips: [
      'Track your earnings, subscribers, and engagement metrics',
      'See which content performs best',
      'Monitor your growth trends over time'
    ],
    quickActions: [
      { label: 'View Analytics', path: '/analytics' },
      { label: 'Withdraw Funds', path: '/wallet' }
    ]
  },
  '/post': {
    title: 'Create Content',
    tips: [
      'Upload images, videos, or go live with your audience',
      'Set prices for premium content or offer for free',
      'Tag co-stars for 2257 compliance when needed'
    ],
    quickActions: [
      { label: 'Media Library', path: '/media' },
      { label: 'Go Live', path: '/streams' }
    ]
  },
  '/messages': {
    title: 'Messages',
    tips: [
      'Chat with your fans and fellow creators',
      'Send paid messages for premium interactions',
      'Use mass messaging to reach all subscribers'
    ],
    quickActions: [
      { label: 'Mass Message', path: '/mass-messaging' }
    ]
  },
  '/earnings': {
    title: 'Earnings',
    tips: [
      'View detailed breakdown of your income sources',
      'Track tips, subscriptions, and PPV sales',
      'Request payouts when you hit your threshold'
    ],
    quickActions: [
      { label: 'Withdraw', path: '/wallet' },
      { label: 'Tax Info', path: '/settings' }
    ]
  },
  '/explore': {
    title: 'Explore Creators',
    tips: [
      'Discover new creators by category and popularity',
      'Use filters to find exactly what you like',
      'Featured creators are verified and highly rated'
    ],
    quickActions: [
      { label: 'Search', path: '/search' }
    ]
  },
  '/subscriptions': {
    title: 'Your Subscriptions',
    tips: [
      'Manage all your active subscriptions here',
      'See renewal dates and subscription costs',
      'Cancel or upgrade subscriptions anytime'
    ],
    quickActions: [
      { label: 'Find More', path: '/explore' }
    ]
  },
  '/wallet': {
    title: 'Wallet',
    tips: [
      'Add funds to tip creators and purchase content',
      'Withdraw your earnings to your bank account',
      'View complete transaction history'
    ],
    quickActions: [
      { label: 'Add Funds', path: '/wallet' },
      { label: 'Withdraw', path: '/wallet' }
    ]
  }
};

// Tutorial tracks for different user types
const TUTORIAL_TRACKS: TutorialTrack[] = [
  {
    id: 'creator-quickstart',
    name: 'Creator Quick Start',
    description: 'Essential steps to start earning on BoyFanz',
    icon: <Crown className="h-5 w-5 text-yellow-400" />,
    forRole: 'creator',
    priority: 1,
    estimatedMinutes: 10,
    steps: [
      {
        id: 'profile-setup',
        title: 'Complete Your Profile',
        description: 'Add a profile photo, bio, and set your subscription price to attract fans.',
        icon: <Users className="h-5 w-5" />,
        targetPath: '/settings',
        action: 'navigate'
      },
      {
        id: 'verification',
        title: 'Get Verified',
        description: 'Complete age verification (2257 compliance) to unlock all features and build trust.',
        icon: <Shield className="h-5 w-5" />,
        targetPath: '/compliance',
        action: 'navigate'
      },
      {
        id: 'first-post',
        title: 'Create Your First Post',
        description: 'Upload your first piece of content. Mix free and premium posts to attract subscribers.',
        icon: <Upload className="h-5 w-5" />,
        targetPath: '/post',
        action: 'navigate'
      },
      {
        id: 'payment-setup',
        title: 'Set Up Payouts',
        description: 'Add your bank account or payment method to receive your earnings.',
        icon: <CreditCard className="h-5 w-5" />,
        targetPath: '/payouts',
        action: 'navigate'
      },
      {
        id: 'share-profile',
        title: 'Share Your Profile',
        description: 'Copy your profile link and share it on social media to drive traffic.',
        icon: <Rocket className="h-5 w-5" />,
        action: 'explain'
      }
    ]
  },
  {
    id: 'creator-advanced',
    name: 'Maximize Your Earnings',
    description: 'Advanced strategies to grow your income',
    icon: <TrendingUp className="h-5 w-5 text-green-400" />,
    forRole: 'creator',
    priority: 2,
    estimatedMinutes: 15,
    steps: [
      {
        id: 'analytics-mastery',
        title: 'Understand Your Analytics',
        description: 'Learn to read your performance data and identify your best content.',
        icon: <BarChart3 className="h-5 w-5" />,
        targetPath: '/analytics',
        action: 'navigate'
      },
      {
        id: 'ppv-strategy',
        title: 'Pay-Per-View Strategy',
        description: 'Create exclusive content and price it effectively for maximum revenue.',
        icon: <DollarSign className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'mass-messaging',
        title: 'Mass Messaging Mastery',
        description: 'Send targeted messages to subscribers with new content and offers.',
        icon: <MessageCircle className="h-5 w-5" />,
        targetPath: '/mass-messaging',
        action: 'navigate'
      },
      {
        id: 'live-streaming',
        title: 'Go Live for Tips',
        description: 'Host live streams to engage fans in real-time and earn tips.',
        icon: <Video className="h-5 w-5" />,
        targetPath: '/streams',
        action: 'navigate'
      },
      {
        id: 'costar-collab',
        title: 'Collaborate with Co-Stars',
        description: 'Invite other creators to appear in your content (2257 compliant).',
        icon: <Users className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'custom-requests',
        title: 'Custom Content Requests',
        description: 'Accept paid requests from fans for personalized content.',
        icon: <Gift className="h-5 w-5" />,
        targetPath: '/custom-requests',
        action: 'navigate'
      }
    ]
  },
  {
    id: 'fan-welcome',
    name: 'Welcome to BoyFanz',
    description: 'Discover how to enjoy the platform',
    icon: <Heart className="h-5 w-5 text-pink-400" />,
    forRole: 'fan',
    priority: 1,
    estimatedMinutes: 5,
    steps: [
      {
        id: 'explore-creators',
        title: 'Discover Creators',
        description: 'Browse our curated selection of creators and find your favorites.',
        icon: <Compass className="h-5 w-5" />,
        targetPath: '/explore',
        action: 'navigate'
      },
      {
        id: 'first-subscription',
        title: 'Subscribe to a Creator',
        description: 'Subscribe to unlock exclusive content from your favorite creators.',
        icon: <Star className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'add-funds',
        title: 'Add Funds to Wallet',
        description: 'Top up your wallet to tip creators and purchase premium content.',
        icon: <Wallet className="h-5 w-5" />,
        targetPath: '/wallet',
        action: 'navigate'
      },
      {
        id: 'messaging-intro',
        title: 'Message Your Favorites',
        description: 'Start conversations with creators you follow.',
        icon: <MessageCircle className="h-5 w-5" />,
        targetPath: '/messages',
        action: 'navigate'
      },
      {
        id: 'notifications',
        title: 'Set Up Notifications',
        description: 'Never miss new content from your subscriptions.',
        icon: <Bell className="h-5 w-5" />,
        targetPath: '/notifications',
        action: 'navigate'
      }
    ]
  },
  {
    id: 'compliance-training',
    name: '2257 Compliance Training',
    description: 'Mandatory training for content creators',
    icon: <Shield className="h-5 w-5 text-red-400" />,
    forRole: 'creator',
    priority: 0,
    estimatedMinutes: 20,
    steps: [
      {
        id: 'why-2257',
        title: 'Understanding 2257',
        description: 'Learn why age verification is legally required for adult content.',
        icon: <FileText className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'self-verification',
        title: 'Verify Yourself',
        description: 'Complete your own identity and age verification first.',
        icon: <Lock className="h-5 w-5" />,
        targetPath: '/compliance',
        action: 'navigate'
      },
      {
        id: 'costar-verification',
        title: 'Co-Star Requirements',
        description: 'Learn how to verify anyone appearing in your content.',
        icon: <Users className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'record-keeping',
        title: 'Record Keeping',
        description: 'Understand what records you must maintain and for how long.',
        icon: <FileText className="h-5 w-5" />,
        action: 'explain'
      },
      {
        id: 'content-tagging',
        title: 'Tagging Co-Stars',
        description: 'Practice tagging verified co-stars when posting content.',
        icon: <Camera className="h-5 w-5" />,
        targetPath: '/post',
        action: 'navigate'
      }
    ]
  }
];

// AI-generated contextual messages
const AI_MESSAGES = {
  welcome: [
    "Welcome to BoyFanz! I'm here to show you around and help you get the most out of the platform.",
    "Hey there! Ready to explore? I'll be your guide to everything BoyFanz has to offer.",
    "Hi! Whether you're a creator or a fan, I'm here to help you navigate and succeed."
  ],
  creatorTip: [
    "Pro tip: Creators who post consistently earn 3x more than those who don't!",
    "Did you know? Live streams generate 40% more tips than regular posts.",
    "Top performers respond to messages within 2 hours. Quick responses = happy fans!"
  ],
  fanTip: [
    "Tip: Adding funds in bulk saves on transaction fees!",
    "Many creators offer discounts for longer subscription periods.",
    "Turn on notifications to catch live streams when they start!"
  ]
};

export function TutorialBot() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hasSeenWelcome, setHasSeenWelcome] = useLocalStorage('tutorialBot_seenWelcome', false);
  const [neverShowAgain, setNeverShowAgain] = useLocalStorage('tutorialBot_neverShow', false);
  const [completedSteps, setCompletedSteps] = useLocalStorage<string[]>('tutorialBot_completedSteps', []);
  const [currentTrack, setCurrentTrack] = useState<TutorialTrack | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showContextualHelp, setShowContextualHelp] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isCreator = user?.role === 'creator' || user?.isCreator;
  const currentPageContext = PAGE_CONTEXT[location] || null;

  // Get relevant tracks for user
  const relevantTracks = TUTORIAL_TRACKS.filter(
    track => track.forRole === 'both' ||
    (isCreator && track.forRole === 'creator') ||
    (!isCreator && track.forRole === 'fan')
  ).sort((a, b) => a.priority - b.priority);

  // Calculate overall progress
  const totalSteps = relevantTracks.reduce((sum, track) => sum + track.steps.length, 0);
  const completedCount = completedSteps.length;
  const overallProgress = totalSteps > 0 ? (completedCount / totalSteps) * 100 : 0;

  // Simulate AI typing effect
  const typeMessage = useCallback((message: string) => {
    // Clear any existing typing interval to prevent race conditions
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }

    // Validate message to prevent undefined issues
    if (!message || typeof message !== 'string') {
      setAiMessage("Welcome! I'm your Fanz Guide. How can I help you today?");
      setIsTyping(false);
      return;
    }

    setIsTyping(true);
    setAiMessage('');
    let i = 0;
    const messageToType = message; // Capture the message in closure

    typingIntervalRef.current = setInterval(() => {
      if (i < messageToType.length) {
        setAiMessage(messageToType.substring(0, i + 1));
        i++;
      } else {
        if (typingIntervalRef.current) {
          clearInterval(typingIntervalRef.current);
          typingIntervalRef.current = null;
        }
        setIsTyping(false);
      }
    }, 20);
  }, []);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, []);

  // Show welcome message for new users
  useEffect(() => {
    if (user && !hasSeenWelcome) {
      const timeoutId = setTimeout(() => {
        setIsOpen(true);
        const welcomeMessages = AI_MESSAGES.welcome;
        const randomMessage = welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
        if (randomMessage) {
          typeMessage(randomMessage);
        }
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [user, hasSeenWelcome, typeMessage]);

  // Show contextual tips when navigating
  useEffect(() => {
    if (currentPageContext && isOpen && !currentTrack) {
      const tips = isCreator ? AI_MESSAGES.creatorTip : AI_MESSAGES.fanTip;
      if (tips && tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        if (randomTip) {
          typeMessage(randomTip);
        }
      }
    }
  }, [location, currentPageContext, isOpen, currentTrack, isCreator, typeMessage]);

  const startTrack = (track: TutorialTrack) => {
    setCurrentTrack(track);
    setCurrentStepIndex(0);
    const firstStepDesc = track.steps[0]?.description;
    if (firstStepDesc) {
      typeMessage(firstStepDesc);
    }
  };

  const nextStep = () => {
    if (!currentTrack) return;

    // Mark current step as complete
    const stepId = currentTrack.steps[currentStepIndex]?.id;
    if (stepId && !completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }

    if (currentStepIndex < currentTrack.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const nextStepDesc = currentTrack.steps[nextIndex]?.description;
      if (nextStepDesc) {
        typeMessage(nextStepDesc);
      }

      // Navigate if needed
      const nextStepItem = currentTrack.steps[nextIndex];
      if (nextStepItem?.action === 'navigate' && nextStepItem?.targetPath) {
        setLocation(nextStepItem.targetPath);
      }
    } else {
      // Track complete
      setCurrentTrack(null);
      typeMessage("Great job completing this tutorial! Ready for more?");
    }
  };

  const prevStep = () => {
    if (!currentTrack || currentStepIndex === 0) return;
    const prevIndex = currentStepIndex - 1;
    setCurrentStepIndex(prevIndex);
    const prevStepDesc = currentTrack.steps[prevIndex]?.description;
    if (prevStepDesc) {
      typeMessage(prevStepDesc);
    }
  };

  const dismissWelcome = () => {
    setHasSeenWelcome(true);
  };

  const goToStep = (step: TutorialStep) => {
    if (step?.targetPath) {
      setLocation(step.targetPath);
    }
    if (step?.description) {
      typeMessage(step.description);
    }
  };

  // Don't render if user opted to never show again
  if (!user || neverShowAgain) return null;

  return (
    <>
      {/* Floating Bot Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
      >
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              onClick={() => setIsOpen(true)}
              className="relative group"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-primary/30">
                <Bot className="h-8 w-8 text-white" />
              </div>

              {/* Pulse animation */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />

              {/* Progress indicator */}
              {overallProgress > 0 && overallProgress < 100 && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs font-bold text-black">
                  {Math.round(overallProgress)}%
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/90 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                  Need help? Click me!
                </div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bot Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-h-[600px]"
          >
            <Card className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-primary/30 shadow-2xl shadow-primary/20 overflow-hidden">
              {/* Header */}
              <CardHeader className="bg-gradient-to-r from-primary/20 to-purple-500/20 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10 ring-2 ring-primary/50">
                        <AvatarImage src="/bot-avatar.png" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500">
                          <Bot className="h-5 w-5 text-white" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white flex items-center gap-2">
                        Fanz Guide
                        <Sparkles className="h-4 w-4 text-yellow-400" />
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-xs">
                        Your personal assistant
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setIsOpen(false); setHasSeenWelcome(true); }}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                    <span>Your Progress</span>
                    <span>{completedCount}/{totalSteps} steps</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </CardHeader>

              <CardContent className="p-4 max-h-[400px] overflow-y-auto">
                {/* AI Message */}
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-200">
                      {aiMessage || "Welcome! I'm your Fanz Guide. How can I help you today?"}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </p>
                  </div>
                </div>

                {/* Current Track Progress */}
                {currentTrack && (
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {currentTrack.icon}
                        <span className="text-sm font-medium text-white">{currentTrack.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {currentStepIndex + 1}/{currentTrack.steps.length}
                      </Badge>
                    </div>

                    {/* Current Step */}
                    <Card className="bg-black/30 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            {currentTrack.steps[currentStepIndex].icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-medium mb-1">
                              {currentTrack.steps[currentStepIndex].title}
                            </h4>
                            <p className="text-sm text-gray-400">
                              {currentTrack.steps[currentStepIndex].description}
                            </p>
                          </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={prevStep}
                            disabled={currentStepIndex === 0}
                            className="text-gray-400"
                          >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Back
                          </Button>
                          <Button
                            size="sm"
                            onClick={nextStep}
                            className="bg-primary hover:bg-primary/80"
                          >
                            {currentStepIndex === currentTrack.steps.length - 1 ? 'Finish' : 'Next'}
                            <ChevronRight className="h-4 w-4 ml-1" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentTrack(null)}
                      className="w-full mt-2 text-gray-400"
                    >
                      Exit Tutorial
                    </Button>
                  </div>
                )}

                {/* Contextual Help */}
                {!currentTrack && currentPageContext && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-white">
                        {currentPageContext.title}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {currentPageContext.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                    {currentPageContext.quickActions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {currentPageContext.quickActions.map((action, i) => (
                          <Button
                            key={i}
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(action.path)}
                            className="text-xs"
                          >
                            {action.label}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tutorial Tracks */}
                {!currentTrack && (
                  <div>
                    <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" />
                      Guided Tutorials
                    </h3>
                    <div className="space-y-2">
                      {relevantTracks.map((track) => {
                        const trackCompletedSteps = track.steps.filter(
                          step => completedSteps.includes(step.id)
                        ).length;
                        const trackProgress = (trackCompletedSteps / track.steps.length) * 100;
                        const isComplete = trackProgress === 100;

                        return (
                          <button
                            key={track.id}
                            onClick={() => startTrack(track)}
                            className={cn(
                              "w-full p-3 rounded-lg text-left transition-all",
                              "bg-white/5 hover:bg-white/10 border border-white/10",
                              isComplete && "border-green-500/30 bg-green-500/5"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center",
                                isComplete ? "bg-green-500/20" : "bg-primary/20"
                              )}>
                                {isComplete ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  track.icon
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-white">
                                    {track.name}
                                  </span>
                                  <Badge variant="secondary" className="text-xs">
                                    {track.estimatedMinutes}m
                                  </Badge>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {track.description}
                                </p>
                                <Progress
                                  value={trackProgress}
                                  className="h-1 mt-2"
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                {!currentTrack && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/help')}
                        className="text-xs"
                      >
                        <HelpCircle className="h-3 w-3 mr-1" />
                        Help Center
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/help/tutorials')}
                        className="text-xs"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        All Tutorials
                      </Button>
                    </div>

                    {/* Don't show again option */}
                    <div className="mt-4 pt-3 border-t border-white/5">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={false}
                          onChange={() => {
                            setNeverShowAgain(true);
                            setIsOpen(false);
                          }}
                          className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-primary focus:ring-primary focus:ring-offset-0"
                        />
                        <span className="text-xs text-gray-500 group-hover:text-gray-400 transition-colors">
                          Don't show this guide again
                        </span>
                      </label>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default TutorialBot;
