import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupLocalAuth } from "./auth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { kycService } from "./services/kycService";
import { payoutService } from "./services/payoutService";
import { moderationService } from "./services/moderationService";
import { notificationService } from "./services/notificationService";
import { earningsService } from "./services/earningsService";
import { watermarkService } from "./services/watermarkService";
import { rateLimit } from "./middleware/rateLimit";
import { uploadRateLimit } from "./middleware/authRateLimit";
import { csrfProtection } from "./middleware/csrf";
import { validateRequest } from "./middleware/validation";
import { 
  insertMediaAssetSchema, 
  insertPayoutRequestSchema, 
  insertWebhookSchema,
  insertCreatorProfileSchema,
  insertSubscriptionSchema,
  insertPostSchema,
  insertMessageSchema,
  insertCommentSchema,
  insertLikeSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupLocalAuth(app); // Add local email/password auth

  // Rate limiting
  app.use('/api/', rateLimit);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const profile = await storage.getProfile(userId);
      res.json({ ...user, profile });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Media routes
  app.get('/api/media', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const mediaAssets = await storage.getMediaAssets(userId, limit);
      res.json(mediaAssets);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post('/api/media/upload', isAuthenticated, uploadRateLimit, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  app.post('/api/media', isAuthenticated, csrfProtection, uploadRateLimit, validateRequest(insertMediaAssetSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const mediaData = req.body;
      
      const mediaAsset = await storage.createMediaAsset({
        ...mediaData,
        ownerId: userId,
      });

      // Apply watermark to new media
      if (mediaData.s3Key) {
        await watermarkService.applyWatermark(mediaAsset.id, userId, mediaData.s3Key);
      }

      // Add to moderation queue
      await moderationService.addToQueue(mediaAsset.id);

      // Set ACL policy for the uploaded object
      const objectStorageService = new ObjectStorageService();
      await objectStorageService.trySetObjectEntityAclPolicy(
        mediaData.s3Key,
        {
          owner: userId,
          visibility: "private",
        }
      );

      res.status(201).json(mediaAsset);
    } catch (error) {
      console.error("Error creating media asset:", error);
      res.status(500).json({ message: "Failed to create media asset" });
    }
  });

  // Object serving routes
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Moderation routes (admin only)
  app.get('/api/moderation/queue', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const queue = await storage.getModerationQueue(limit);
      res.json(queue);
    } catch (error) {
      console.error("Error fetching moderation queue:", error);
      res.status(500).json({ message: "Failed to fetch moderation queue" });
    }
  });

  app.put('/api/moderation/:id/approve', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await moderationService.approve(req.params.id, req.user.claims.sub, req.body.notes);
      res.json({ message: "Content approved" });
    } catch (error) {
      console.error("Error approving content:", error);
      res.status(500).json({ message: "Failed to approve content" });
    }
  });

  app.put('/api/moderation/:id/reject', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await moderationService.reject(req.params.id, req.user.claims.sub, req.body.notes);
      res.json({ message: "Content rejected" });
    } catch (error) {
      console.error("Error rejecting content:", error);
      res.status(500).json({ message: "Failed to reject content" });
    }
  });

  // KYC routes
  app.get('/api/kyc/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const kyc = await storage.getKycVerification(userId);
      res.json(kyc || { status: 'pending' });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post('/api/kyc/verify', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const verification = await kycService.initiateVerification(userId);
      res.json(verification);
    } catch (error) {
      console.error("Error initiating KYC:", error);
      res.status(500).json({ message: "Failed to initiate KYC verification" });
    }
  });

  // Webhook endpoint for VerifyMy
  app.post('/webhooks/verifymy', async (req, res) => {
    try {
      await kycService.handleWebhook(req.body, req.headers['x-signature'] as string);
      res.status(200).json({ received: true });
    } catch (error) {
      console.error("Error handling VerifyMy webhook:", error);
      res.status(400).json({ message: "Invalid webhook" });
    }
  });

  // Theme management routes (admin only)
  app.get('/api/themes', async (req, res) => {
    try {
      const themes = await storage.getThemes();
      res.json(themes);
    } catch (error) {
      console.error("Error fetching themes:", error);
      res.status(500).json({ message: "Failed to fetch themes" });
    }
  });

  app.get('/api/themes/active', async (req, res) => {
    try {
      const theme = await storage.getActiveTheme();
      res.json(theme);
    } catch (error) {
      console.error("Error fetching active theme:", error);
      res.status(500).json({ message: "Failed to fetch active theme" });
    }
  });

  app.post('/api/themes', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const theme = await storage.createTheme(req.body);
      res.json(theme);
    } catch (error) {
      console.error("Error creating theme:", error);
      res.status(500).json({ message: "Failed to create theme" });
    }
  });

  app.put('/api/themes/:id', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      const theme = await storage.updateTheme(req.params.id, req.body);
      res.json(theme);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  app.put('/api/themes/:id/activate', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.setActiveTheme(req.params.id);
      res.json({ message: "Theme activated" });
    } catch (error) {
      console.error("Error activating theme:", error);
      res.status(500).json({ message: "Failed to activate theme" });
    }
  });

  app.delete('/api/themes/:id', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTheme(req.params.id);
      res.json({ message: "Theme deleted" });
    } catch (error) {
      console.error("Error deleting theme:", error);
      res.status(500).json({ message: "Failed to delete theme" });
    }
  });

  // Earnings routes
  app.get('/api/earnings/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const period = req.query.period as '24h' | '7d' | '30d' | 'all' | undefined;
      const stats = await earningsService.getEarningsStats(userId, period);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching earnings stats:", error);
      res.status(500).json({ message: "Failed to fetch earnings stats" });
    }
  });

  app.get('/api/earnings/breakdown', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const breakdown = await earningsService.getEarningsBreakdown(userId);
      res.json(breakdown);
    } catch (error) {
      console.error("Error fetching earnings breakdown:", error);
      res.status(500).json({ message: "Failed to fetch earnings breakdown" });
    }
  });

  app.post('/api/earnings/subscription', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const fanUserId = req.user.claims.sub;
      const { creatorUserId, amount } = req.body;
      const transaction = await earningsService.processSubscriptionPayment(fanUserId, creatorUserId, amount);
      res.json(transaction);
    } catch (error) {
      console.error("Error processing subscription:", error);
      res.status(500).json({ message: "Failed to process subscription payment" });
    }
  });

  app.post('/api/earnings/ppv', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const fanUserId = req.user.claims.sub;
      const { creatorUserId, mediaId, amount } = req.body;
      const transaction = await earningsService.processPPVPurchase(fanUserId, creatorUserId, mediaId, amount);
      res.json(transaction);
    } catch (error) {
      console.error("Error processing PPV purchase:", error);
      res.status(500).json({ message: "Failed to process PPV purchase" });
    }
  });

  app.post('/api/earnings/tip', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const fanUserId = req.user.claims.sub;
      const { creatorUserId, amount, message } = req.body;
      const transaction = await earningsService.processTip(fanUserId, creatorUserId, amount, message);
      res.json(transaction);
    } catch (error) {
      console.error("Error processing tip:", error);
      res.status(500).json({ message: "Failed to process tip" });
    }
  });

  app.post('/api/earnings/tokens', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const fanUserId = req.user.claims.sub;
      const { creatorUserId, tokenCount, tokenValue } = req.body;
      const transaction = await earningsService.processLiveStreamTokens(fanUserId, creatorUserId, tokenCount, tokenValue);
      res.json(transaction);
    } catch (error) {
      console.error("Error processing live stream tokens:", error);
      res.status(500).json({ message: "Failed to process live stream tokens" });
    }
  });

  app.get('/api/earnings/top', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const topEarners = await earningsService.getTopEarners(limit);
      res.json(topEarners);
    } catch (error) {
      console.error("Error fetching top earners:", error);
      res.status(500).json({ message: "Failed to fetch top earners" });
    }
  });

  // Watermark routes
  app.get('/api/watermark/verify/:mediaId', isAuthenticated, async (req: any, res) => {
    try {
      const result = await watermarkService.verifyWatermark(req.params.mediaId);
      res.json(result);
    } catch (error) {
      console.error("Error verifying watermark:", error);
      res.status(500).json({ message: "Failed to verify watermark" });
    }
  });

  app.get('/api/watermark/report/:mediaId', isAuthenticated, async (req: any, res) => {
    try {
      const result = await watermarkService.getForensicReport(req.params.mediaId);
      res.json(result);
    } catch (error) {
      console.error("Error generating forensic report:", error);
      res.status(500).json({ message: "Failed to generate forensic report" });
    }
  });

  // Creator Profile routes
  app.get('/api/creator-profiles/:userId', async (req, res) => {
    try {
      const creatorProfile = await storage.getCreatorProfile(req.params.userId);
      if (!creatorProfile) {
        return res.status(404).json({ message: "Creator profile not found" });
      }
      res.json(creatorProfile);
    } catch (error) {
      console.error("Error fetching creator profile:", error);
      res.status(500).json({ message: "Failed to fetch creator profile" });
    }
  });

  app.post('/api/creator-profiles', isAuthenticated, csrfProtection, validateRequest(insertCreatorProfileSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const creatorProfile = await storage.createCreatorProfile({
        ...req.body,
        userId,
      });
      res.status(201).json(creatorProfile);
    } catch (error) {
      console.error("Error creating creator profile:", error);
      res.status(500).json({ message: "Failed to create creator profile" });
    }
  });

  app.put('/api/creator-profiles', isAuthenticated, csrfProtection, validateRequest(insertCreatorProfileSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const updatedProfile = await storage.updateCreatorProfile(userId, req.body);
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating creator profile:", error);
      res.status(500).json({ message: "Failed to update creator profile" });
    }
  });

  app.get('/api/creators', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const category = req.query.category as string;
      const creators = await storage.getCreators(limit, category);
      res.json(creators);
    } catch (error) {
      console.error("Error fetching creators:", error);
      res.status(500).json({ message: "Failed to fetch creators" });
    }
  });

  // Subscription routes
  // Validation schema for subscription creation
  const createSubscriptionSchema = z.object({
    creatorId: z.string().uuid("Invalid creator ID format"),
  });

  app.post('/api/subscriptions', isAuthenticated, csrfProtection, validateRequest(createSubscriptionSchema), async (req: any, res) => {
    try {
      const fanId = req.user.claims.sub;
      const { creatorId } = req.body;
      
      // Prevent self-subscription
      if (fanId === creatorId) {
        return res.status(400).json({ message: "Cannot subscribe to yourself" });
      }
      
      // Check for existing active/pending subscription
      const existingSubscription = await storage.getSubscription(fanId, creatorId);
      if (existingSubscription && (existingSubscription.status === 'active' || existingSubscription.status === 'pending')) {
        return res.status(409).json({ message: "Already subscribed or subscription pending" });
      }
      
      // Get creator profile to get the monthly price
      const creatorProfile = await storage.getCreatorProfile(creatorId);
      if (!creatorProfile) {
        return res.status(404).json({ message: "Creator not found" });
      }
      
      const subscription = await storage.createSubscription({
        fanId,
        creatorId,
        status: 'pending',
        monthlyPriceCents: creatorProfile.monthlyPriceCents,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        stripeSubscriptionId: null,
        cancelledAt: null,
      });
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get('/api/subscriptions/creator/:creatorId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const creatorId = req.params.creatorId;
      
      // Only allow creators to view their own subscriber list or admins
      const user = await storage.getUser(userId);
      if (userId !== creatorId && user?.role !== 'admin') {
        return res.status(403).json({ message: "Access denied - can only view own subscribers" });
      }
      
      const subscriptions = await storage.getCreatorSubscriptions(creatorId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching creator subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.get('/api/subscriptions/fan', isAuthenticated, async (req: any, res) => {
    try {
      const fanId = req.user.claims.sub;
      const subscriptions = await storage.getFanSubscriptions(fanId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching fan subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  // Posts routes
  app.post('/api/posts', isAuthenticated, csrfProtection, validateRequest(insertPostSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const post = await storage.createPost({
        ...req.body,
        creatorId,
      });
      res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/posts/:postId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const post = await storage.getPost(req.params.postId);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user can access this post
      if (post.visibility === 'free' || post.creatorId === userId) {
        // Free posts or creator's own posts - full access
        res.json(post);
      } else {
        // Premium/subscribers-only content - check subscription
        const subscription = await storage.getSubscription(userId, post.creatorId);
        const hasActiveSubscription = subscription && 
          subscription.status === 'active' &&
          subscription.currentPeriodStart && subscription.currentPeriodStart <= new Date() &&
          (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());
          
        if (hasActiveSubscription) {
          res.json(post);
        } else {
          // Return limited metadata for non-subscribers
          res.json({
            id: post.id,
            creatorId: post.creatorId,
            type: post.type,
            visibility: post.visibility,
            title: post.title,
            priceCents: post.priceCents,
            thumbnailUrl: post.thumbnailUrl,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            createdAt: post.createdAt,
            // Exclude premium content fields
            content: "Subscribe to view this content",
            mediaUrls: [],
          });
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.get('/api/posts/creator/:creatorId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const creatorId = req.params.creatorId;
      const limit = parseInt(req.query.limit as string) || 50;
      const posts = await storage.getCreatorPosts(creatorId, limit);
      
      // Check subscription status for premium content filtering
      const subscription = await storage.getSubscription(userId, creatorId);
      const hasActiveSubscription = subscription && 
        subscription.status === 'active' &&
        subscription.currentPeriodStart && subscription.currentPeriodStart <= new Date() &&
        (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date());
      
      // Filter posts based on access rights
      const filteredPosts = posts.map(post => {
        if (post.visibility === 'free' || post.creatorId === userId || hasActiveSubscription) {
          return post;
        } else {
          // Return limited metadata for premium posts
          return {
            id: post.id,
            creatorId: post.creatorId,
            type: post.type,
            visibility: post.visibility,
            title: post.title,
            priceCents: post.priceCents,
            thumbnailUrl: post.thumbnailUrl,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            createdAt: post.createdAt,
            content: "Subscribe to view this content",
            mediaUrls: [],
          };
        }
      });
      
      res.json(filteredPosts);
    } catch (error) {
      console.error("Error fetching creator posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  // Helper function to check if user can view full post content
  const canViewFullPost = async (userId: string, post: any): Promise<boolean> => {
    if (post.visibility === 'free' || post.creatorId === userId) {
      return true;
    }
    
    const subscription = await storage.getSubscription(userId, post.creatorId);
    return !!(subscription && 
      subscription.status === 'active' &&
      subscription.currentPeriodStart && subscription.currentPeriodStart <= new Date() &&
      (!subscription.currentPeriodEnd || subscription.currentPeriodEnd > new Date()));
  };

  // Helper function to create limited post metadata
  const createLimitedPostMetadata = (post: any) => ({
    id: post.id,
    creatorId: post.creatorId,
    type: post.type,
    visibility: post.visibility,
    title: post.title,
    priceCents: post.priceCents,
    thumbnailUrl: post.thumbnailUrl,
    likesCount: post.likesCount,
    commentsCount: post.commentsCount,
    createdAt: post.createdAt,
    content: "Subscribe to view this content",
    mediaUrls: [],
  });

  app.get('/api/feed', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const cursor = req.query.cursor ? JSON.parse(req.query.cursor as string) : undefined;
      
      if (cursor) {
        cursor.createdAt = new Date(cursor.createdAt);
      }
      
      const feed = await storage.getFeedPosts(userId, limit, cursor);
      
      // Apply access control to each post in the feed
      const filteredPosts = await Promise.all(
        feed.posts.map(async (postWithCreator) => {
          const post = postWithCreator;
          const hasAccess = await canViewFullPost(userId, post);
          
          if (hasAccess) {
            return post;
          } else {
            return {
              ...createLimitedPostMetadata(post),
              creator: postWithCreator.creator,
            };
          }
        })
      );
      
      res.json({
        posts: filteredPosts,
        nextCursor: feed.nextCursor,
        hasMore: feed.hasMore,
      });
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ message: "Failed to fetch feed" });
    }
  });

  // Payout routes
  app.get('/api/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const payouts = await storage.getPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post('/api/payouts', isAuthenticated, csrfProtection, validateRequest(insertPayoutRequestSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const payout = await payoutService.createPayoutRequest(userId, req.body);
      res.status(201).json(payout);
    } catch (error) {
      console.error("Error creating payout request:", error);
      res.status(500).json({ message: "Failed to create payout request" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      await storage.markNotificationRead(req.params.id);
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Webhook management routes
  app.get('/api/webhooks', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const webhooks = await storage.getWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, validateRequest(insertWebhookSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const webhook = await storage.createWebhook({
        ...req.body,
        userId,
        secret: crypto.randomUUID(),
      });
      res.status(201).json(webhook);
    } catch (error) {
      console.error("Error creating webhook:", error);
      res.status(500).json({ message: "Failed to create webhook" });
    }
  });

  // API key management routes
  app.get('/api/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const apiKeys = await storage.getApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/api-keys', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const keyValue = crypto.randomUUID();
      const keyHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(keyValue));
      
      const apiKey = await storage.createApiKey({
        userId,
        keyHash: Array.from(new Uint8Array(keyHash)).map(b => b.toString(16).padStart(2, '0')).join(''),
        scopes: req.body.scopes || [],
        lastUsedAt: null,
      });
      
      res.status(201).json({ ...apiKey, key: keyValue });
    } catch (error) {
      console.error("Error creating API key:", error);
      res.status(500).json({ message: "Failed to create API key" });
    }
  });

  // Health check
  app.get('/healthz', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Version info
  app.get('/version', (req, res) => {
    res.json({ version: '1.0.0', build: 'development' });
  });

  // OpenAPI docs
  app.get('/docs', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>BoyFanz API Documentation</title>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">
          <style>
            body { margin: 0; padding: 0; }
          </style>
        </head>
        <body>
          <redoc spec-url='/docs/openapi.json'></redoc>
          <script src="https://cdn.jsdelivr.net/npm/redoc@2.0.0/bundles/redoc.standalone.js"></script>
        </body>
      </html>
    `);
  });

  app.get('/docs/openapi.json', (req, res) => {
    const openApiSpec = {
      openapi: '3.0.0',
      info: {
        title: 'BoyFanz API',
        version: '1.0.0',
        description: 'Creator economy platform API',
      },
      servers: [
        { url: process.env.API_URL || 'http://localhost:5000/api' }
      ],
      paths: {
        '/auth/user': {
          get: {
            summary: 'Get current user',
            security: [{ sessionAuth: [] }],
            responses: {
              '200': { description: 'User data' },
              '401': { description: 'Unauthorized' }
            }
          }
        },
        '/media': {
          get: {
            summary: 'Get user media assets',
            security: [{ sessionAuth: [] }],
            responses: {
              '200': { description: 'Media assets list' }
            }
          },
          post: {
            summary: 'Create media asset',
            security: [{ sessionAuth: [] }],
            responses: {
              '201': { description: 'Media asset created' }
            }
          }
        }
      },
      components: {
        securitySchemes: {
          sessionAuth: {
            type: 'apiKey',
            in: 'cookie',
            name: 'connect.sid'
          }
        }
      }
    };
    res.json(openApiSpec);
  });

  const httpServer = createServer(app);

  // Messages routes
  app.get('/api/messages/conversations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const conversations = await storage.getUserConversations(userId);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.get('/api/messages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const otherUserId = req.query.userId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      
      if (!otherUserId) {
        return res.status(400).json({ message: "Missing userId parameter" });
      }
      
      // Validate otherUserId format
      if (!otherUserId.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ message: "Invalid userId format" });
      }
      
      // Prevent users from accessing conversations they're not part of
      // The storage.getConversation should only return messages where the authenticated user
      // is either the sender or receiver
      const messages = await storage.getConversation(userId, otherUserId, limit);
      
      // Additional security check: ensure all returned messages involve the authenticated user
      const unauthorizedMessages = messages.filter(msg => 
        msg.senderId !== userId && msg.receiverId !== userId
      );
      
      if (unauthorizedMessages.length > 0) {
        console.warn(`Authorization violation: User ${userId} attempted to access unauthorized messages`);
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post('/api/messages', isAuthenticated, csrfProtection, validateRequest(insertMessageSchema), async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const messageData = req.body;
      
      // Prevent users from trying to send messages as someone else
      if (messageData.senderId && messageData.senderId !== senderId) {
        return res.status(403).json({ message: "Cannot send messages as another user" });
      }
      
      // Validate receiverId format
      if (!messageData.receiverId?.match(/^[0-9a-fA-F-]{36}$/)) {
        return res.status(400).json({ message: "Invalid receiverId format" });
      }
      
      // Prevent self-messaging (optional business rule)
      if (messageData.receiverId === senderId) {
        return res.status(400).json({ message: "Cannot send messages to yourself" });
      }
      
      const message = await storage.createMessage({
        ...messageData,
        senderId, // Always use authenticated user as sender
        isPaid: messageData.priceCents > 0,
        isMassMessage: false,
        readAt: null,
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  app.put('/api/messages/:id/read', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const messageId = req.params.id;
      
      // Get all conversations to find the message and verify authorization
      const conversations = await storage.getUserConversations(userId);
      let foundMessage = null;
      
      // Check if this user has any conversations with messages matching the ID
      for (const conversation of conversations) {
        if (conversation.lastMessage.id === messageId) {
          foundMessage = conversation.lastMessage;
          break;
        }
      }
      
      if (!foundMessage) {
        // Also check recent messages in conversations
        for (const conversation of conversations) {
          const messages = await storage.getConversation(userId, conversation.otherUser.id, 100);
          const message = messages.find(m => m.id === messageId);
          if (message) {
            foundMessage = message;
            break;
          }
        }
      }
      
      if (!foundMessage) {
        return res.status(404).json({ message: "Message not found or access denied" });
      }
      
      // Only the receiver can mark a message as read
      if (foundMessage.receiverId !== userId) {
        return res.status(403).json({ message: "Only the recipient can mark a message as read" });
      }
      
      // Check if already read
      if (foundMessage.readAt) {
        return res.json({ message: "Message already read" });
      }
      
      await storage.markMessageRead(messageId);
      res.json({ message: "Message marked as read" });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  // Comments routes
  app.get('/api/posts/:postId/comments', isAuthenticated, async (req: any, res) => {
    try {
      const postId = req.params.postId;
      const comments = await storage.getPostComments(postId);
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/comments', isAuthenticated, csrfProtection, validateRequest(insertCommentSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = req.body;
      
      const comment = await storage.createComment({
        ...commentData,
        userId,
        likesCount: 0,
      });
      
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Likes routes
  app.post('/api/posts/like', isAuthenticated, csrfProtection, validateRequest(insertLikeSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { postId } = req.body;
      
      await storage.likePost(userId, postId);
      res.json({ message: "Post liked successfully" });
    } catch (error) {
      console.error("Error liking post:", error);
      res.status(500).json({ message: "Failed to like post" });
    }
  });

  // Validation schema for DELETE parameter
  const unlikePostSchema = z.object({
    postId: z.string().uuid("Invalid post ID format")
  });

  app.delete('/api/posts/:postId/like', isAuthenticated, csrfProtection, validateRequest(unlikePostSchema, 'params'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postId = req.params.postId;
      
      await storage.unlikePost(userId, postId);
      res.json({ message: "Post unliked successfully" });
    } catch (error) {
      console.error("Error unliking post:", error);
      res.status(500).json({ message: "Failed to unlike post" });
    }
  });

  // WebSocket setup for real-time notifications
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws: WebSocket, req) => {
    console.log('WebSocket connection established');
    
    // Store user ID with the WebSocket connection
    (ws as any).userId = null;
    
    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message);
        if (data.type === 'auth' && data.userId) {
          (ws as any).userId = data.userId;
          ws.send(JSON.stringify({ type: 'auth_success' }));
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });
  });

  // Initialize notification service with WebSocket server
  notificationService.setWebSocketServer(wss);

  return httpServer;
}
