// @ts-nocheck
import { Express } from 'express';
import { db } from '../db';
import { isAuthenticated } from '../middleware/auth';
import { eq, and, desc } from 'drizzle-orm';

// Tutorial progress storage (in-memory for now, should be moved to DB)
const tutorialProgress = new Map<string, Map<string, any>>();

// Tutorial categories
const TUTORIAL_CATEGORIES = [
  { name: "Mandatory Creator Training", slug: "mandatory", count: 3, description: "Required training for all creators", color: "red" },
  { name: "Getting Started", slug: "getting-started", count: 2, description: "Essential tutorials for new users", color: "blue" },
  { name: "Content Creation", slug: "content-creation", count: 2, description: "Creating and managing content", color: "purple" },
  { name: "Monetization", slug: "monetization", count: 2, description: "Earning and payments", color: "green" },
  { name: "Fan Engagement", slug: "fan-engagement", count: 1, description: "Building your audience", color: "pink" },
  { name: "Live Streaming", slug: "live-streaming", count: 1, description: "Going live and events", color: "orange" },
  { name: "Privacy & Security", slug: "privacy-security", count: 2, description: "Protecting yourself", color: "gray" }
];

// Tutorial data (summary - full content is in client)
const TUTORIALS = [
  // Mandatory
  { id: "mandatory-2257", title: "18 U.S.C. §2257 Compliance Training", slug: "2257-compliance-training", category: "mandatory", duration: 25, steps: 9, difficulty: "beginner", isMandatory: true },
  { id: "mandatory-costar", title: "CoStar Verification Training", slug: "costar-verification-training", category: "mandatory", duration: 20, steps: 6, difficulty: "beginner", isMandatory: true },
  { id: "mandatory-best-practices", title: "Creator Best Practices & Platform Rules", slug: "creator-best-practices", category: "mandatory", duration: 30, steps: 8, difficulty: "beginner", isMandatory: true },
  // Getting Started
  { id: "gs-account-setup", title: "Setting Up Your Creator Account", slug: "account-setup", category: "getting-started", duration: 15, steps: 3, difficulty: "beginner" },
  { id: "gs-first-post", title: "Creating Your First Post", slug: "first-post", category: "getting-started", duration: 10, steps: 2, difficulty: "beginner" },
  // Content Creation
  { id: "cc-photo-tips", title: "Taking Great Photos", slug: "photo-tips", category: "content-creation", duration: 20, steps: 2, difficulty: "beginner" },
  { id: "cc-video-basics", title: "Video Content Fundamentals", slug: "video-basics", category: "content-creation", duration: 25, steps: 1, difficulty: "intermediate" },
  // Monetization
  { id: "mon-pricing", title: "Pricing Your Content", slug: "pricing-strategy", category: "monetization", duration: 15, steps: 1, difficulty: "intermediate" },
  { id: "mon-tips-custom", title: "Tips & Custom Requests", slug: "tips-custom-requests", category: "monetization", duration: 20, steps: 1, difficulty: "intermediate" },
  // Live Streaming
  { id: "live-basics", title: "Going Live: The Complete Guide", slug: "going-live-guide", category: "live-streaming", duration: 25, steps: 1, difficulty: "intermediate" },
  // Privacy & Security
  { id: "sec-account", title: "Securing Your Account", slug: "account-security", category: "privacy-security", duration: 15, steps: 1, difficulty: "beginner" },
  { id: "sec-privacy", title: "Privacy Settings Deep Dive", slug: "privacy-settings", category: "privacy-security", duration: 20, steps: 1, difficulty: "intermediate" }
];

export function registerTutorialRoutes(app: Express) {

  // Get tutorial categories
  app.get('/api/help/tutorials/categories', async (req, res) => {
    try {
      res.json(TUTORIAL_CATEGORIES);
    } catch (error) {
      console.error('Get tutorial categories error:', error);
      res.status(500).json({ error: 'Failed to get categories' });
    }
  });

  // Get tutorials list
  app.get('/api/help/tutorials', async (req, res) => {
    try {
      const { category, difficulty, search, sort = 'popular', page = 1, limit = 20 } = req.query;
      const userId = req.user?.id;

      let filteredTutorials = [...TUTORIALS];

      // Filter by category
      if (category) {
        filteredTutorials = filteredTutorials.filter(t => t.category === category);
      }

      // Filter by difficulty
      if (difficulty) {
        filteredTutorials = filteredTutorials.filter(t => t.difficulty === difficulty);
      }

      // Filter by search
      if (search) {
        const searchLower = (search as string).toLowerCase();
        filteredTutorials = filteredTutorials.filter(t =>
          t.title.toLowerCase().includes(searchLower) ||
          t.slug.toLowerCase().includes(searchLower)
        );
      }

      // Add progress info if user is authenticated
      const tutorials = filteredTutorials.map(tutorial => {
        let progress = 0;
        let isCompleted = false;
        let completedSteps = 0;

        if (userId) {
          const userProgress = tutorialProgress.get(userId)?.get(tutorial.id);
          if (userProgress) {
            completedSteps = userProgress.completedSteps?.length || 0;
            progress = (completedSteps / tutorial.steps) * 100;
            isCompleted = userProgress.isCompleted || false;
          }
        }

        return {
          ...tutorial,
          progress,
          isCompleted,
          completedSteps,
          enrollments: Math.floor(Math.random() * 1000) + 100, // Placeholder
          rating: 4.5 + Math.random() * 0.5, // Placeholder
          thumbnailUrl: null,
          instructor: {
            name: "BoyFanz Academy",
            avatar: "/avatars/academy.png"
          },
          tags: [tutorial.category, tutorial.difficulty],
          status: 'published'
        };
      });

      const startIndex = ((page as number) - 1) * (limit as number);
      const paginatedTutorials = tutorials.slice(startIndex, startIndex + (limit as number));

      res.json({
        tutorials: paginatedTutorials,
        totalCount: tutorials.length,
        hasMore: startIndex + (limit as number) < tutorials.length
      });
    } catch (error) {
      console.error('Get tutorials error:', error);
      res.status(500).json({ error: 'Failed to get tutorials' });
    }
  });

  // Get single tutorial
  app.get('/api/help/tutorials/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const tutorial = TUTORIALS.find(t => t.slug === slug);

      if (!tutorial) {
        return res.status(404).json({ error: 'Tutorial not found' });
      }

      res.json({
        success: true,
        data: {
          tutorial: {
            ...tutorial,
            enrollments: Math.floor(Math.random() * 1000) + 100,
            rating: 4.5 + Math.random() * 0.5,
            instructor: {
              name: "BoyFanz Academy",
              avatar: "/avatars/academy.png"
            }
          },
          progress: null // Will be populated from progress endpoint
        }
      });
    } catch (error) {
      console.error('Get tutorial error:', error);
      res.status(500).json({ error: 'Failed to get tutorial' });
    }
  });

  // Get tutorial progress
  app.get('/api/tutorials/:tutorialId/progress', isAuthenticated, async (req, res) => {
    try {
      const { tutorialId } = req.params;
      const userId = req.user!.id;

      const userProgressMap = tutorialProgress.get(userId);
      const progress = userProgressMap?.get(tutorialId);

      if (!progress) {
        return res.json({
          tutorialId,
          currentStep: 0,
          completedSteps: [],
          quizAnswers: {},
          startedAt: null,
          completedAt: null,
          isCompleted: false
        });
      }

      res.json(progress);
    } catch (error) {
      console.error('Get tutorial progress error:', error);
      res.status(500).json({ error: 'Failed to get progress' });
    }
  });

  // Update tutorial progress
  app.put('/api/tutorials/:tutorialId/progress', isAuthenticated, async (req, res) => {
    try {
      const { tutorialId } = req.params;
      const userId = req.user!.id;
      const { currentStep, completedSteps, quizAnswers, isCompleted } = req.body;

      if (!tutorialProgress.has(userId)) {
        tutorialProgress.set(userId, new Map());
      }

      const userProgressMap = tutorialProgress.get(userId)!;
      const existingProgress = userProgressMap.get(tutorialId) || {
        tutorialId,
        startedAt: new Date().toISOString(),
        completedSteps: [],
        quizAnswers: {}
      };

      const updatedProgress = {
        ...existingProgress,
        currentStep: currentStep ?? existingProgress.currentStep,
        completedSteps: completedSteps ?? existingProgress.completedSteps,
        quizAnswers: quizAnswers ? { ...existingProgress.quizAnswers, ...quizAnswers } : existingProgress.quizAnswers,
        isCompleted: isCompleted ?? existingProgress.isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : existingProgress.completedAt
      };

      userProgressMap.set(tutorialId, updatedProgress);

      res.json({ success: true, data: updatedProgress });
    } catch (error) {
      console.error('Update tutorial progress error:', error);
      res.status(500).json({ error: 'Failed to update progress' });
    }
  });

  // Complete tutorial
  app.post('/api/tutorials/:tutorialId/complete', isAuthenticated, async (req, res) => {
    try {
      const { tutorialId } = req.params;
      const userId = req.user!.id;

      if (!tutorialProgress.has(userId)) {
        tutorialProgress.set(userId, new Map());
      }

      const userProgressMap = tutorialProgress.get(userId)!;
      const tutorial = TUTORIALS.find(t => t.id === tutorialId);

      const progress = userProgressMap.get(tutorialId) || {
        tutorialId,
        startedAt: new Date().toISOString(),
        completedSteps: [],
        quizAnswers: {}
      };

      progress.isCompleted = true;
      progress.completedAt = new Date().toISOString();
      progress.completedSteps = Array.from({ length: tutorial?.steps || 0 }, (_, i) => i);

      userProgressMap.set(tutorialId, progress);

      // Generate certification if applicable
      let certification = null;
      if (tutorial?.isMandatory) {
        certification = {
          id: `cert-${tutorialId}-${userId}`,
          name: tutorial.title.replace(' Training', ' Certified'),
          earnedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
        };
      }

      res.json({
        success: true,
        message: 'Tutorial completed successfully',
        certification
      });
    } catch (error) {
      console.error('Complete tutorial error:', error);
      res.status(500).json({ error: 'Failed to complete tutorial' });
    }
  });

  // Get creator training progress (for onboarding)
  app.get('/api/creator/training-progress', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const mandatoryTutorials = TUTORIALS.filter(t => t.isMandatory);

      const userProgressMap = tutorialProgress.get(userId);

      const progress = mandatoryTutorials.map(tutorial => {
        const tutorialProgress = userProgressMap?.get(tutorial.id);
        return {
          tutorialId: tutorial.id,
          isCompleted: tutorialProgress?.isCompleted || false,
          completedAt: tutorialProgress?.completedAt || null
        };
      });

      const allComplete = progress.every(p => p.isCompleted);

      // Get certifications
      const certifications = mandatoryTutorials
        .filter(t => userProgressMap?.get(t.id)?.isCompleted)
        .map(t => ({
          id: `cert-${t.id}-${userId}`,
          name: t.title.replace(' Training', ' Certified'),
          earnedAt: userProgressMap?.get(t.id)?.completedAt,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        }));

      res.json({
        progress,
        allComplete,
        certifications
      });
    } catch (error) {
      console.error('Get training progress error:', error);
      res.status(500).json({ error: 'Failed to get training progress' });
    }
  });

  // Check if mandatory training is complete
  app.get('/api/creator/training-complete', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const mandatoryTutorials = TUTORIALS.filter(t => t.isMandatory);
      const userProgressMap = tutorialProgress.get(userId);

      const allComplete = mandatoryTutorials.every(tutorial =>
        userProgressMap?.get(tutorial.id)?.isCompleted === true
      );

      res.json({ complete: allComplete });
    } catch (error) {
      console.error('Check training complete error:', error);
      res.status(500).json({ error: 'Failed to check training status' });
    }
  });

  // AI Training Assistant endpoint
  app.post('/api/help/training-assistant', async (req, res) => {
    try {
      const { question, context } = req.body;
      const questionLower = question.toLowerCase();

      // Simple response logic (can be enhanced with actual AI)
      let response = "";
      let suggestions: string[] = [];
      let actions: Array<{ label: string; action: string; target: string }> = [];

      // 2257 Related
      if (questionLower.includes('2257') || questionLower.includes('record') || questionLower.includes('compliance')) {
        response = "2257 compliance is a federal law requiring you to verify the age of all performers and maintain records. Here's what you need to know:\n\n" +
          "1. Verify everyone's age with government ID before creating content\n" +
          "2. Keep copies of IDs and signed consent forms\n" +
          "3. Maintain records for at least 7 years\n" +
          "4. Solo creators still need their own verification on file\n\n" +
          "Would you like to complete the full 2257 training or visit your compliance page?";
        suggestions = ["What records do I need?", "What if I'm a solo creator?", "How long to keep records?"];
        actions = [
          { label: "Take 2257 Training", action: "tutorial", target: "2257-compliance-training" },
          { label: "Go to Compliance Page", action: "navigate", target: "/compliance" }
        ];
      }
      // CoStar Related
      else if (questionLower.includes('costar') || questionLower.includes('collaborat') || questionLower.includes('partner')) {
        response = "CoStar is our system for verifying collaborators who appear in your content. Before creating content with someone else:\n\n" +
          "1. Invite them to verify through CoStar\n" +
          "2. They complete identity verification\n" +
          "3. Both sign digital consent forms\n" +
          "4. Content automatically links to their verification\n\n" +
          "This protects both of you legally and enables features like revenue sharing.";
        suggestions = ["How do I invite someone?", "What about consent forms?", "Can I split revenue?"];
        actions = [
          { label: "Take CoStar Training", action: "tutorial", target: "costar-verification-training" },
          { label: "Invite a CoStar", action: "navigate", target: "/costar/verify" }
        ];
      }
      // Pricing Related
      else if (questionLower.includes('price') || questionLower.includes('subscription') || questionLower.includes('ppv') || questionLower.includes('earn')) {
        response = "Pricing your content effectively is key to success! Here are some tips:\n\n" +
          "**Subscription Pricing:**\n" +
          "- New creators: $5-15/month\n" +
          "- Established: $15-30/month\n\n" +
          "**PPV Pricing:**\n" +
          "- Photos: $5-25\n" +
          "- Videos: $10-50+\n" +
          "- Custom content: $50-500+\n\n" +
          "Research similar creators and adjust based on your content quality and engagement.";
        suggestions = ["How do tips work?", "What about custom requests?", "When do I get paid?"];
        actions = [
          { label: "Pricing Tutorial", action: "tutorial", target: "pricing-strategy" },
          { label: "Payout Settings", action: "navigate", target: "/payouts" }
        ];
      }
      // Getting Started
      else if (questionLower.includes('start') || questionLower.includes('first') || questionLower.includes('new creator') || questionLower.includes('begin')) {
        response = "Welcome to BoyFanz! Here's what to do as a new creator:\n\n" +
          "1. **Complete Mandatory Training** - 2257, CoStar, and Best Practices\n" +
          "2. **Verify Your Identity** - KYC verification through VerifyMy\n" +
          "3. **Set Up Your Profile** - Photos, bio, and branding\n" +
          "4. **Configure Payments** - Bank details and payout preferences\n" +
          "5. **Start Creating** - Post your first content!\n\n" +
          "Would you like me to guide you through any of these steps?";
        suggestions = ["What's mandatory training?", "How do I verify identity?", "How do I set up payments?"];
        actions = [
          { label: "Start Training", action: "navigate", target: "/help/tutorials" },
          { label: "Complete Verification", action: "navigate", target: "/compliance" }
        ];
      }
      // Streaming
      else if (questionLower.includes('live') || questionLower.includes('stream') || questionLower.includes('broadcast')) {
        response = "Going live on BoyFanz is a great way to engage with fans! Here's what you need:\n\n" +
          "**Equipment:**\n" +
          "- Camera (phone or webcam works)\n" +
          "- Good lighting\n" +
          "- Stable internet (5+ Mbps upload)\n\n" +
          "**Tips:**\n" +
          "- Set up your stream title and thumbnail\n" +
          "- Prepare your tip menu\n" +
          "- Engage with viewers\n" +
          "- Moderate your chat";
        suggestions = ["What internet speed do I need?", "How do tips work during streams?", "Can I save my streams?"];
        actions = [
          { label: "Streaming Tutorial", action: "tutorial", target: "going-live-guide" },
          { label: "Go Live Now", action: "navigate", target: "/streams/create" }
        ];
      }
      // Default/tutorials
      else if (questionLower.includes('tutorial') || questionLower.includes('learn') || questionLower.includes('help')) {
        response = "I can help you learn about any platform feature! Here are the available tutorials:\n\n" +
          "**Mandatory Training:**\n" +
          "- 2257 Compliance (25 min)\n" +
          "- CoStar Verification (20 min)\n" +
          "- Creator Best Practices (30 min)\n\n" +
          "**Optional Training:**\n" +
          "- Account Setup, Content Creation\n" +
          "- Monetization, Live Streaming\n" +
          "- Privacy & Security\n\n" +
          "What would you like to learn about?";
        suggestions = ["Show mandatory training", "Content creation tips", "Monetization strategies"];
        actions = [
          { label: "Browse All Tutorials", action: "navigate", target: "/help/tutorials" }
        ];
      }
      // Safety/Security
      else if (questionLower.includes('safe') || questionLower.includes('secur') || questionLower.includes('protect') || questionLower.includes('privacy')) {
        response = "Keeping yourself safe is our priority. Here are key security measures:\n\n" +
          "**Account Security:**\n" +
          "- Enable Two-Factor Authentication (2FA)\n" +
          "- Use a strong, unique password\n" +
          "- Monitor for suspicious activity\n\n" +
          "**Content Protection:**\n" +
          "- Enable screenshot protection\n" +
          "- Watermark your content\n" +
          "- Use DMCA takedown tools\n\n" +
          "**Personal Safety:**\n" +
          "- Use a stage name if desired\n" +
          "- Don't share personal address\n" +
          "- Block harassers immediately";
        suggestions = ["How do I enable 2FA?", "How do I block someone?", "What if my content is stolen?"];
        actions = [
          { label: "Security Settings", action: "navigate", target: "/settings/password" },
          { label: "Privacy Settings", action: "navigate", target: "/settings/privacy" }
        ];
      }
      // Default response
      else {
        response = "I'm here to help you succeed on BoyFanz! I can assist with:\n\n" +
          "- **Compliance**: 2257 requirements, CoStar verification\n" +
          "- **Getting Started**: Account setup, first posts\n" +
          "- **Content**: Photography tips, video basics\n" +
          "- **Monetization**: Pricing, tips, custom content\n" +
          "- **Live Streaming**: Setup and engagement\n" +
          "- **Security**: Account protection, privacy\n\n" +
          "What would you like to know more about?";
        suggestions = ["How do I get started?", "Explain 2257 compliance", "Tips for pricing content", "How to go live"];
      }

      res.json({
        response,
        suggestions,
        actions
      });
    } catch (error) {
      console.error('Training assistant error:', error);
      res.status(500).json({ error: 'Failed to process question' });
    }
  });
}
