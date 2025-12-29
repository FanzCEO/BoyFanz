# AI Concierge Bot System - Implementation Guide

**Platform:** BoyFanz  
**Feature:** Context-Aware AI Help System  
**Version:** 1.0  
**Date:** November 24, 2025

---

## 🤖 Overview

The **AI Concierge Bot** is an intelligent, context-aware help system that provides real-time assistance throughout the BoyFanz platform. It learns from user behavior, anticipates needs, and offers proactive suggestions.

---

## 🎯 Core Capabilities

### 1. **Context-Aware Help**
The bot understands where the user is and what they're doing:
- Current page/feature
- User's role (creator/fan/admin)
- Recent actions
- Historical patterns
- Performance metrics

### 2. **Scroll-Triggered Assistance**
As users scroll through pages, the bot offers relevant tips:

**Example Triggers:**

```typescript
// Content Upload Page - User scrolls to pricing section
{
  trigger: "scroll",
  section: "content-pricing",
  message: "💡 Tip: Most creators in your category price similar content between $8-$12. Your average is $10.",
  actions: ["Apply smart pricing", "See pricing analytics", "Dismiss"]
}

// Messages Page - Unread messages detected
{
  trigger: "scroll",
  section: "messages-inbox",
  condition: "hasUnreadMessages > 5",
  message: "📨 You have 7 unread messages from subscribers. Want me to prioritize them by engagement level?",
  actions: ["Yes, smart sort", "Show all", "Remind me later"]
}

// Earnings Dashboard - Below average week detected
{
  trigger: "scroll",
  section: "earnings-overview",
  condition: "weeklyEarnings < averageWeeklyEarnings",
  message: "📊 Your earnings are 15% below average this week. Here are 3 quick actions to boost revenue:",
  actions: [
    "Post exclusive content", 
    "Send promotional message", 
    "Schedule a live stream"
  ]
}
```

### 3. **Click-Activated Tutorials**
When a user clicks a feature for the first time:

```typescript
{
  trigger: "firstTimeClick",
  feature: "live-streaming",
  action: "showQuickTutorial",
  content: {
    type: "video",
    duration: 15, // seconds
    transcript: "Going live is easy! Tap the camera icon, set your stream title and price, then tap 'Start Stream'. Your subscribers will be notified automatically.",
    skippable: true,
    showAgain: false // Don't show on subsequent clicks
  }
}
```

### 4. **Proactive Suggestions**
The bot monitors activity and makes intelligent suggestions:

**Posting Frequency:**
```typescript
if (daysSinceLastPost > 3 && userIsCreator) {
  bot.suggest({
    priority: "medium",
    message: "🎨 It's been 3 days since your last post. Your engagement is highest when you post 4-5x per week.",
    actions: [
      { 
        label: "Create post now", 
        action: "navigate",
        target: "/create-post" 
      },
      { 
        label: "Schedule for later", 
        action: "navigate",
        target: "/content-calendar" 
      },
      { 
        label: "Remind me tomorrow", 
        action: "snooze",
        duration: 86400000 // 24 hours
      }
    ]
  });
}
```

**Earnings Opportunities:**
```typescript
if (liveStreamPerformance > 80 && !hasLiveStreamScheduled) {
  bot.suggest({
    priority: "high",
    message: "🔥 Your live streams earn 3x more than regular posts! Schedule your next stream?",
    actions: [
      { label: "Schedule now", action: "openModal", modal: "schedule-stream" },
      { label: "See analytics", action: "navigate", target: "/analytics/streams" }
    ]
  });
}
```

**Message Management:**
```typescript
if (unreadMessagesCount > 10 && hoursInactive > 12) {
  bot.suggest({
    priority: "high",
    message: "💬 You have 12 unread messages. Quick reply to your top 5 fans?",
    actions: [
      { label: "Smart sort & reply", action: "openInbox", filter: "vip" },
      { label: "Use auto-responses", action: "navigate", target: "/settings/auto-responses" }
    ]
  });
}
```

### 5. **Voice Assistant Mode**
Users can interact via voice commands:

**Supported Commands:**
```typescript
const voiceCommands = {
  // Content Creation
  "create a post": () => navigate("/create-post"),
  "upload a photo": () => openMediaUploader(),
  "schedule a post for [time]": (time) => schedulePost(time),
  
  // Streaming
  "start a live stream": () => initiateLiveStream(),
  "go live": () => initiateLiveStream(),
  "end my stream": () => endLiveStream(),
  
  // Messages
  "show my messages": () => navigate("/messages"),
  "reply to [name]": (name) => openConversation(name),
  "send message to [name] saying [message]": (name, message) => sendMessage(name, message),
  
  // Analytics
  "show my earnings": () => navigate("/earnings"),
  "how much did I make this week": () => showWeeklyEarnings(),
  "show my top fans": () => showTopSubscribers(),
  
  // Account
  "show my profile": () => navigate("/profile"),
  "update my settings": () => navigate("/settings"),
  
  // Help
  "help me with [feature]": (feature) => showFeatureHelp(feature),
  "show me a tutorial for [feature]": (feature) => playTutorial(feature)
};
```

**Voice Interaction Example:**
```
User: "How much did I make today?"
Bot: "You've earned $247 today! That's 18% higher than your average Tuesday. Great job! 💰"

User: "Nice! Can you schedule a post for 6pm?"
Bot: "Sure! What would you like to post? You can say 'upload photo', 'write text', or 'schedule from drafts'."

User: "Schedule from drafts"
Bot: "I found 3 drafts. Which one? 'Workout video', 'Behind the scenes', or 'Q&A session'?"

User: "Workout video"
Bot: "Perfect! I'll post 'Workout video' today at 6pm. I've set the price at $10 based on your similar content. Want to change anything?"

User: "No, that's perfect!"
Bot: "Done! Your post is scheduled. I'll notify you 10 minutes before it goes live. 📅"
```

---

## 📚 Knowledge Base Integration

The bot pulls information from structured JSON files in `/docs/ai-knowledge-base/`:

### Knowledge Base Structure

```json
{
  "feature": "content-upload",
  "title": "Uploading Content",
  "category": "content-creation",
  "keywords": ["upload", "post", "photo", "video", "content"],
  "commonQuestions": [
    {
      "question": "How do I upload a photo?",
      "answer": "Click the '+' button in the bottom right, select 'Photo', choose your image, add a caption and price, then tap 'Post'. Your subscribers will be notified instantly!",
      "video": "/tutorials/upload-photo.mp4",
      "relatedFeatures": ["content-pricing", "watermarks", "scheduling"]
    },
    {
      "question": "What file formats are supported?",
      "answer": "We support JPG, PNG, GIF for images and MP4, MOV, AVI for videos up to 2GB. Videos up to 4K resolution!",
      "relatedFeatures": ["video-upload", "file-limits"]
    },
    {
      "question": "How do I price my content?",
      "answer": "When uploading, you can set custom pricing or use our AI pricing recommendation. Based on your content history and similar creators, we suggest prices that maximize earnings.",
      "video": "/tutorials/pricing-strategy.mp4",
      "relatedFeatures": ["dynamic-pricing", "earnings-optimization"]
    }
  ],
  "quickTips": [
    "Upload multiple files at once by holding Shift and selecting multiple photos",
    "Add watermarks automatically in Settings > Content Protection",
    "Schedule posts for optimal times using our AI recommendation"
  ],
  "troubleshooting": [
    {
      "issue": "Upload failed",
      "solution": "Check your internet connection and file size. Videos must be under 2GB. Try compressing large files."
    }
  ]
}
```

---

## 🎨 UI/UX Design

### Bot Interface Components

#### 1. **Floating Chat Bubble**
```tsx
<FloatingChatBubble
  position="bottom-right"
  unreadCount={hasNewSuggestion ? 1 : 0}
  onClick={() => openBotInterface()}
  pulseAnimation={hasUrgentSuggestion}
/>
```

#### 2. **Inline Contextual Cards**
```tsx
<ContextualHelpCard
  trigger="scroll"
  section="earnings-dashboard"
  dismissible={true}
  persistent={false}
>
  <Icon>💡</Icon>
  <Message>
    Your top 3 fans contributed 45% of this month's earnings. 
    Want to send them a thank you message?
  </Message>
  <Actions>
    <Button onClick={composeThankYouMessage}>Send thank you</Button>
    <Button onClick={viewTopFans}>See top fans</Button>
  </Actions>
</ContextualHelpCard>
```

#### 3. **Quick Action Tooltips**
```tsx
<TooltipTrigger
  feature="first-time-use"
  showOnce={true}
>
  <Tooltip position="top" arrow={true}>
    <strong>Quick Tip:</strong> Double-tap any message to quick-reply 
    with your most used responses!
  </Tooltip>
</TooltipTrigger>
```

#### 4. **Voice Assistant Modal**
```tsx
<VoiceAssistantModal
  isListening={isRecording}
  transcript={liveTranscript}
  response={botResponse}
  suggestions={[
    "Show my earnings",
    "Create a post",
    "Read my messages"
  ]}
/>
```

---

## 🧠 Intelligence Engine

### Learning & Personalization

#### User Behavior Tracking
```typescript
interface UserBehaviorProfile {
  userId: string;
  role: "creator" | "fan" | "admin";
  activity: {
    postingFrequency: number; // posts per week
    averagePostPrice: number;
    preferredPostTime: string; // "18:00-22:00"
    contentTypes: string[]; // ["photo", "video", "story"]
    streamingFrequency: number;
  };
  performance: {
    weeklyEarnings: number;
    monthlyEarnings: number;
    subscriberCount: number;
    engagementRate: number;
    averageMessageResponseTime: number; // minutes
  };
  preferences: {
    helpLevel: "beginner" | "intermediate" | "advanced";
    notificationFrequency: "low" | "medium" | "high";
    autoResponses: boolean;
    voiceAssistantEnabled: boolean;
  };
  helpHistory: {
    topicsViewed: string[];
    tutorialsCompleted: string[];
    commonQuestions: string[];
    dismissedSuggestions: string[];
  };
}
```

#### Intelligent Suggestion Engine
```typescript
function generateSuggestions(user: UserBehaviorProfile): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // Earnings optimization
  if (user.performance.weeklyEarnings < user.performance.averageWeeklyEarnings * 0.85) {
    suggestions.push({
      priority: "high",
      type: "earning-boost",
      message: `Your earnings are below average this week. Try these proven strategies:`,
      actions: [
        { label: "Post exclusive content", impact: "+$50-100" },
        { label: "Schedule a live stream", impact: "+$200-300" },
        { label: "Send promo to subscribers", impact: "+$30-80" }
      ]
    });
  }
  
  // Content calendar
  if (isTodayOptimalPostingDay(user) && !hasScheduledPost(user)) {
    suggestions.push({
      priority: "medium",
      type: "content-reminder",
      message: `${getDayOfWeek()} at ${getOptimalTime(user)} is your best posting time!`,
      actions: [
        { label: "Create post now", action: "navigate", target: "/create-post" },
        { label: "Schedule for later", action: "openScheduler" }
      ]
    });
  }
  
  // Fan engagement
  if (user.performance.averageMessageResponseTime > 120) { // >2 hours
    suggestions.push({
      priority: "medium",
      type: "engagement",
      message: "Faster message responses lead to 40% higher retention! Set up quick replies?",
      actions: [
        { label: "Configure auto-responses", action: "navigate", target: "/settings/auto-responses" },
        { label: "See message templates", action: "navigate", target: "/settings/templates" }
      ]
    });
  }
  
  return suggestions.sort((a, b) => 
    priorityScore(b.priority) - priorityScore(a.priority)
  );
}
```

---

## 🔧 Technical Implementation

### Bot Service Architecture

```typescript
// services/aiConciergeBot.ts

import OpenAI from 'openai';

class AIConciergeBot {
  private openai: OpenAI;
  private knowledgeBase: Map<string, KnowledgeEntry>;
  
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.loadKnowledgeBase();
  }
  
  private async loadKnowledgeBase() {
    // Load all JSON files from ai-knowledge-base/
    const files = await glob('./docs/ai-knowledge-base/*.json');
    files.forEach(file => {
      const data = JSON.parse(readFileSync(file, 'utf-8'));
      this.knowledgeBase.set(data.feature, data);
    });
  }
  
  async handleUserQuery(query: string, context: UserContext): Promise<BotResponse> {
    // 1. Search knowledge base
    const relevantKnowledge = this.searchKnowledgeBase(query);
    
    // 2. If found in KB, return structured response
    if (relevantKnowledge) {
      return this.formatKnowledgeResponse(relevantKnowledge);
    }
    
    // 3. Otherwise, use AI to generate response
    return this.generateAIResponse(query, context);
  }
  
  private searchKnowledgeBase(query: string): KnowledgeEntry | null {
    const queryLower = query.toLowerCase();
    
    for (const [key, entry] of this.knowledgeBase) {
      // Check if query matches keywords
      if (entry.keywords.some(keyword => queryLower.includes(keyword))) {
        // Find matching question
        const matchingQuestion = entry.commonQuestions.find(q =>
          this.calculateSimilarity(queryLower, q.question.toLowerCase()) > 0.7
        );
        
        if (matchingQuestion) {
          return { ...entry, matchedQuestion: matchingQuestion };
        }
      }
    }
    
    return null;
  }
  
  private async generateAIResponse(query: string, context: UserContext): Promise<BotResponse> {
    const systemPrompt = `You are a helpful AI assistant for BoyFanz, a creator economy platform. 
    
Context:
- User role: ${context.role}
- Current page: ${context.currentPage}
- Recent action: ${context.recentAction}

Guidelines:
- Be friendly, concise, and action-oriented
- Provide specific steps when possible
- Reference relevant features and documentation
- Include emojis for personality
- Keep responses under 150 words
`;
    
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: query }
      ],
      temperature: 0.7,
      max_tokens: 200
    });
    
    return {
      type: "ai-generated",
      message: response.choices[0].message.content,
      relatedFeatures: this.extractRelatedFeatures(response.choices[0].message.content),
      actions: this.extractSuggestedActions(query, response.choices[0].message.content)
    };
  }
  
  // Contextual triggers
  async getScrollTriggers(
    section: string, 
    userData: UserBehaviorProfile
  ): Promise<ContextualSuggestion[]> {
    const triggers: ContextualSuggestion[] = [];
    
    // Check for relevant triggers based on section and user data
    if (section === "content-pricing" && userData.activity.averagePostPrice < 5) {
      triggers.push({
        message: "💡 Tip: Creators in your category average $10-15 per post. Consider testing higher prices!",
        actions: [
          { label: "Apply smart pricing", action: "applySuggestedPricing" },
          { label: "See pricing guide", action: "navigate", target: "/help/pricing" }
        ]
      });
    }
    
    if (section === "messages-inbox" && userData.performance.averageMessageResponseTime > 180) {
      triggers.push({
        message: "⚡ Quick Tip: Faster responses = happier fans! Set up quick replies to save time.",
        actions: [
          { label: "Create templates", action: "navigate", target: "/settings/templates" },
          { label: "Enable auto-responses", action: "navigate", target: "/settings/auto-responses" }
        ]
      });
    }
    
    return triggers;
  }
}

export const aiConciergeBot = new AIConciergeBot();
```

### Frontend Integration

```typescript
// hooks/useAIConcierge.ts

import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

export function useAIConcierge() {
  const [location] = useLocation();
  const [suggestions, setSuggestions] = useState<ContextualSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Fetch contextual suggestions for current page
    fetchSuggestions(location);
  }, [location]);
  
  const fetchSuggestions = async (page: string) => {
    const response = await fetch('/api/ai-concierge/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, context: getUserContext() })
    });
    
    const data = await response.json();
    setSuggestions(data.suggestions);
  };
  
  const askQuestion = async (question: string) => {
    const response = await fetch('/api/ai-concierge/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: getUserContext() })
    });
    
    return response.json();
  };
  
  return {
    suggestions,
    isOpen,
    setIsOpen,
    askQuestion
  };
}
```

---

## 📊 Performance & Analytics

### Tracking Bot Effectiveness

```typescript
interface BotAnalytics {
  interactions: {
    questionsAsked: number;
    suggestionsShown: number;
    suggestionsDismissed: number;
    suggestionsActedUpon: number;
  };
  userSatisfaction: {
    helpfulResponses: number;
    unhelpfulResponses: number;
    averageRating: number;
  };
  impact: {
    timeToCompletionReduction: number; // percentage
    supportTicketReduction: number; // percentage
    featureAdoptionIncrease: number; // percentage
  };
}
```

---

## 🚀 Deployment Plan

### Phase 1: Core Bot (Week 1-2)
- [ ] Implement knowledge base loading
- [ ] Build chat interface
- [ ] Deploy basic Q&A functionality
- [ ] Test with 10% of users

### Phase 2: Contextual Triggers (Week 3-4)
- [ ] Implement scroll triggers
- [ ] Add click-activated tutorials
- [ ] Deploy to 50% of users
- [ ] Gather feedback

### Phase 3: Proactive Suggestions (Week 5-6)
- [ ] Build suggestion engine
- [ ] Implement user behavior tracking
- [ ] Deploy AI-generated recommendations
- [ ] Full rollout to 100%

### Phase 4: Voice Assistant (Week 7-8)
- [ ] Implement voice recognition
- [ ] Add voice command handling
- [ ] Build voice response system
- [ ] Beta test with select creators

---

## ✅ Success Criteria

- **User Engagement:** 60% of users interact with bot within first week
- **Satisfaction:** 4.5+ star rating from users
- **Support Reduction:** 40% decrease in support tickets
- **Feature Discovery:** 50% increase in feature adoption
- **Time Savings:** Average 15min saved per user per day

---

**Next Steps:**
1. Review implementation plan
2. Set up OpenAI API integration
3. Build knowledge base JSON files
4. Deploy Phase 1
5. Monitor and iterate

---

**Document Version:** 1.0  
**Last Updated:** November 24, 2025  
**Status:** Ready for Implementation

