import type { Express } from "express";
import express from "express";
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
import { createGetstreamService } from "./services/getstreamService";
import { rateLimit } from "./middleware/rateLimit";
import { 
  uploadRateLimit, 
  paymentRateLimit,
  contentRateLimit,
  sensitiveOperationRateLimit,
  verificationRateLimit 
} from "./middleware/authRateLimit";
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
  insertLikeSchema,
  subscriptionPaymentSchema,
  ppvPurchaseSchema,
  tipSchema,
  liveStreamTokensSchema,
  moderationDecisionSchema,
  // Enhanced Subscription System Schemas
  insertSubscriptionPlanSchema,
  updateSubscriptionPlanSchema,
  insertPromoCodeSchema,
  updatePromoCodeSchema,
  validatePromoCodeSchema,
  applyPromoCodeSchema,
  createSubscriptionEnhancedSchema,
  // Lovense Integration Schemas
  updateLovenseIntegrationSettingsSchema,
  lovenseDeviceControlSchema,
  // Live Streaming Schemas
  insertLiveStreamSchema
} from "@shared/schema";
import { z } from "zod";

// Admin delegation validation schemas
const updateUserRoleSchema = z.object({
  role: z.enum(['fan', 'creator', 'moderator'])
});

const delegationPermissionSchema = z.object({
  userId: z.string().uuid(),
  permission: z.enum(['moderation_queue', 'content_approval', 'theme_management', 'analytics_access', 'user_management'])
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  setupLocalAuth(app); // Add local email/password auth

  // Rate limiting
  app.use('/api/', rateLimit);

  // Helper function to check if user is admin (for admin-only operations)
  async function isAdmin(userId: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    return user?.role === 'admin';
  }

  // Helper function to check admin/moderator access with specific permission requirements
  async function hasAdminAccess(userId: string, requiredPermission: string): Promise<boolean> {
    const user = await storage.getUser(userId);
    
    // Full admin always has access
    if (user?.role === 'admin') {
      return true;
    }
    
    // Only moderators can have delegated admin permissions
    if (user?.role === 'moderator') {
      return await storage.hasPermission(userId, requiredPermission);
    }
    
    // Regular users (fan, creator) cannot access admin functions
    return false;
  }

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

  app.post('/api/media/upload', isAuthenticated, csrfProtection, uploadRateLimit, async (req: any, res) => {
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
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'moderation_queue'))) {
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

  app.put('/api/moderation/:id/approve', isAuthenticated, csrfProtection, validateRequest(moderationDecisionSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'content_approval'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      await moderationService.approve(req.params.id, userId, req.body.notes);
      res.json({ message: "Content approved" });
    } catch (error) {
      console.error("Error approving content:", error);
      res.status(500).json({ message: "Failed to approve content" });
    }
  });

  app.put('/api/moderation/:id/reject', isAuthenticated, csrfProtection, validateRequest(moderationDecisionSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'content_approval'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      await moderationService.reject(req.params.id, userId, req.body.notes);
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

  app.post('/api/kyc/verify', isAuthenticated, csrfProtection, verificationRateLimit, async (req: any, res) => {
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

  app.post('/api/themes', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'theme_management'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      const theme = await storage.createTheme(req.body);
      res.json(theme);
    } catch (error) {
      console.error("Error creating theme:", error);
      res.status(500).json({ message: "Failed to create theme" });
    }
  });

  app.put('/api/themes/:id', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'theme_management'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      const theme = await storage.updateTheme(req.params.id, req.body);
      res.json(theme);
    } catch (error) {
      console.error("Error updating theme:", error);
      res.status(500).json({ message: "Failed to update theme" });
    }
  });

  app.put('/api/themes/:id/activate', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'theme_management'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.setActiveTheme(req.params.id);
      res.json({ message: "Theme activated" });
    } catch (error) {
      console.error("Error activating theme:", error);
      res.status(500).json({ message: "Failed to activate theme" });
    }
  });

  app.delete('/api/themes/:id', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'theme_management'))) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteTheme(req.params.id);
      res.json({ message: "Theme deleted" });
    } catch (error) {
      console.error("Error deleting theme:", error);
      res.status(500).json({ message: "Failed to delete theme" });
    }
  });

  // Admin delegation management routes (admin-only)
  app.get('/api/admin/users', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isAdmin(userId))) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }

      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.put('/api/admin/users/:userId/role', isAuthenticated, csrfProtection, validateRequest(updateUserRoleSchema), async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      if (!(await isAdmin(adminUserId))) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }

      const { userId } = req.params;
      const { role } = req.body;

      // Prevent users from modifying their own role
      if (userId === adminUserId) {
        return res.status(400).json({ message: "Cannot modify your own role" });
      }

      await storage.updateUserRole(userId, role);
      res.json({ message: "User role updated successfully" });
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  app.get('/api/admin/delegations', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await isAdmin(userId))) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }

      const delegations = await storage.getAllDelegatedPermissions();
      res.json(delegations);
    } catch (error) {
      console.error("Error fetching delegations:", error);
      res.status(500).json({ message: "Failed to fetch delegations" });
    }
  });

  app.post('/api/admin/delegations/grant', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, validateRequest(delegationPermissionSchema), async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      if (!(await isAdmin(adminUserId))) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }

      const { userId, permission } = req.body;
      
      // Prevent admins from modifying their own permissions
      if (userId === adminUserId) {
        return res.status(400).json({ message: "Cannot modify your own permissions" });
      }

      // Set audit fields server-side for integrity
      const delegation = await storage.grantPermission({
        userId,
        permission,
        granted: true,
        grantedBy: adminUserId, // Set server-side, never trust client
      });

      res.json(delegation);
    } catch (error) {
      console.error("Error granting permission:", error);
      res.status(500).json({ message: "Failed to grant permission" });
    }
  });

  app.post('/api/admin/delegations/revoke', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, validateRequest(delegationPermissionSchema), async (req: any, res) => {
    try {
      const adminUserId = req.user.claims.sub;
      if (!(await isAdmin(adminUserId))) {
        return res.status(403).json({ message: "Access denied - Admin privileges required" });
      }

      const { userId, permission } = req.body;
      
      // Prevent admins from modifying their own permissions
      if (userId === adminUserId) {
        return res.status(400).json({ message: "Cannot modify your own permissions" });
      }

      await storage.revokePermission(userId, permission);
      res.json({ message: "Permission revoked successfully" });
    } catch (error) {
      console.error("Error revoking permission:", error);
      res.status(500).json({ message: "Failed to revoke permission" });
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

  app.post('/api/earnings/subscription', isAuthenticated, csrfProtection, paymentRateLimit, validateRequest(subscriptionPaymentSchema), async (req: any, res) => {
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

  app.post('/api/earnings/ppv', isAuthenticated, csrfProtection, paymentRateLimit, validateRequest(ppvPurchaseSchema), async (req: any, res) => {
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

  app.post('/api/earnings/tip', isAuthenticated, csrfProtection, paymentRateLimit, validateRequest(tipSchema), async (req: any, res) => {
    try {
      const fanUserId = req.user.claims.sub;
      const { creatorUserId, amount, message } = req.body;
      
      // Process the financial transaction
      const transaction = await earningsService.processTip(fanUserId, creatorUserId, amount, message);
      
      // Trigger Lovense device vibration if integrated
      try {
        const { lovenseService } = await import('./services/lovenseService');
        await lovenseService.processTipVibration(creatorUserId, amount, fanUserId);
      } catch (lovenseError) {
        console.log("Lovense integration not available or failed:", lovenseError);
      }
      
      res.json(transaction);
    } catch (error) {
      console.error("Error processing tip:", error);
      res.status(500).json({ message: "Failed to process tip" });
    }
  });

  app.post('/api/earnings/tokens', isAuthenticated, csrfProtection, paymentRateLimit, validateRequest(liveStreamTokensSchema), async (req: any, res) => {
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

  // Lovense Integration Routes (Creator Only)
  app.get('/api/lovense/settings', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { lovenseService } = await import('./services/lovenseService');
      const settings = await lovenseService.getCreatorSettings(creatorId);
      res.json(settings || {});
    } catch (error) {
      console.error("Error fetching Lovense settings:", error);
      res.status(500).json({ message: "Failed to fetch Lovense settings" });
    }
  });

  app.put('/api/lovense/settings', isAuthenticated, csrfProtection, validateRequest(updateLovenseIntegrationSettingsSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { lovenseService } = await import('./services/lovenseService');
      const updated = await lovenseService.updateCreatorSettings(creatorId, req.body);
      res.json(updated);
    } catch (error) {
      console.error("Error updating Lovense settings:", error);
      res.status(500).json({ message: "Failed to update Lovense settings" });
    }
  });

  app.get('/api/lovense/devices', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { lovenseService } = await import('./services/lovenseService');
      const devices = await lovenseService.getCreatorDevices(creatorId);
      res.json(devices);
    } catch (error) {
      console.error("Error fetching Lovense devices:", error);
      res.status(500).json({ message: "Failed to fetch devices" });
    }
  });

  app.post('/api/lovense/sync', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { lovenseService } = await import('./services/lovenseService');
      const result = await lovenseService.syncDevices(creatorId);
      res.json(result);
    } catch (error) {
      console.error("Error syncing Lovense devices:", error);
      res.status(500).json({ message: "Failed to sync devices" });
    }
  });

  app.post('/api/lovense/control', isAuthenticated, csrfProtection, validateRequest(lovenseDeviceControlSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { deviceId, ...control } = req.body;
      const { lovenseService } = await import('./services/lovenseService');
      const result = await lovenseService.controlDevice(creatorId, deviceId, control);
      res.json(result);
    } catch (error) {
      console.error("Error controlling Lovense device:", error);
      res.status(500).json({ message: "Failed to control device" });
    }
  });

  app.post('/api/lovense/test/:deviceId', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { deviceId } = req.params;
      const { lovenseService } = await import('./services/lovenseService');
      const result = await lovenseService.testDevice(creatorId, deviceId);
      res.json(result);
    } catch (error) {
      console.error("Error testing Lovense device:", error);
      res.status(500).json({ message: "Failed to test device" });
    }
  });

  app.get('/api/lovense/actions/:deviceId', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { deviceId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      
      // Verify device belongs to creator
      const device = await storage.getLovenseDevice(deviceId);
      if (!device || device.creatorId !== creatorId) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      const actions = await storage.getLovenseDeviceActions(deviceId, limit);
      res.json(actions);
    } catch (error) {
      console.error("Error fetching device actions:", error);
      res.status(500).json({ message: "Failed to fetch device actions" });
    }
  });

  // Enhanced Subscription System API Routes
  // Subscription Plans Management (Creator Only)
  app.get('/api/subscription-plans/:creatorId', async (req, res) => {
    try {
      const { creatorId } = req.params;
      const plans = await storage.getCreatorSubscriptionPlans(creatorId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.get('/api/subscription-plans/creator/my-plans', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const plans = await storage.getCreatorSubscriptionPlans(creatorId);
      res.json(plans);
    } catch (error) {
      console.error("Error fetching creator's subscription plans:", error);
      res.status(500).json({ message: "Failed to fetch subscription plans" });
    }
  });

  app.post('/api/subscription-plans', isAuthenticated, csrfProtection, validateRequest(insertSubscriptionPlanSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const planData = { ...req.body, creatorId };
      const plan = await storage.createSubscriptionPlan(planData);
      res.json(plan);
    } catch (error) {
      console.error("Error creating subscription plan:", error);
      res.status(500).json({ message: "Failed to create subscription plan" });
    }
  });

  app.put('/api/subscription-plans/:planId', isAuthenticated, csrfProtection, validateRequest(updateSubscriptionPlanSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { planId } = req.params;
      
      // Verify plan belongs to creator
      const existingPlan = await storage.getSubscriptionPlan(planId);
      if (!existingPlan || existingPlan.creatorId !== creatorId) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      const updatedPlan = await storage.updateSubscriptionPlan(planId, req.body);
      res.json(updatedPlan);
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      res.status(500).json({ message: "Failed to update subscription plan" });
    }
  });

  app.delete('/api/subscription-plans/:planId', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { planId } = req.params;
      
      // Verify plan belongs to creator
      const existingPlan = await storage.getSubscriptionPlan(planId);
      if (!existingPlan || existingPlan.creatorId !== creatorId) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      await storage.deleteSubscriptionPlan(planId);
      res.json({ success: true, message: "Subscription plan deleted" });
    } catch (error) {
      console.error("Error deleting subscription plan:", error);
      res.status(500).json({ message: "Failed to delete subscription plan" });
    }
  });

  // Promo Code Management (Creator Only)
  app.get('/api/promo-codes/my-codes', isAuthenticated, async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const promoCodes = await storage.getCreatorPromoCodes(creatorId);
      res.json(promoCodes);
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      res.status(500).json({ message: "Failed to fetch promo codes" });
    }
  });

  app.post('/api/promo-codes', isAuthenticated, csrfProtection, validateRequest(insertPromoCodeSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const promoCodeData = { ...req.body, creatorId };
      const promoCode = await storage.createPromoCode(promoCodeData);
      res.json(promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      res.status(500).json({ message: "Failed to create promo code" });
    }
  });

  app.put('/api/promo-codes/:codeId', isAuthenticated, csrfProtection, validateRequest(updatePromoCodeSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims.sub;
      const { codeId } = req.params;
      
      // Verify promo code belongs to creator
      const existingCode = await storage.getCreatorPromoCodes(creatorId);
      const codeExists = existingCode.find(code => code.id === codeId);
      
      if (!codeExists) {
        return res.status(404).json({ message: "Promo code not found" });
      }
      
      const updatedCode = await storage.updatePromoCode(codeId, req.body);
      res.json(updatedCode);
    } catch (error) {
      console.error("Error updating promo code:", error);
      res.status(500).json({ message: "Failed to update promo code" });
    }
  });

  // Promo Code Validation and Application (Public)
  app.post('/api/promo-codes/validate', isAuthenticated, validateRequest(validatePromoCodeSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code, subscriptionPlanId } = req.body;
      
      if (!subscriptionPlanId) {
        return res.status(400).json({ message: "Subscription plan ID is required" });
      }
      
      const validation = await storage.validatePromoCode(code, subscriptionPlanId, userId);
      res.json(validation);
    } catch (error) {
      console.error("Error validating promo code:", error);
      res.status(500).json({ message: "Failed to validate promo code" });
    }
  });

  app.post('/api/promo-codes/apply', isAuthenticated, csrfProtection, validateRequest(applyPromoCodeSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { code, subscriptionPlanId } = req.body;
      
      // Validate promo code first
      const validation = await storage.validatePromoCode(code, subscriptionPlanId, userId);
      
      if (!validation.valid) {
        return res.status(400).json({ 
          message: validation.error || "Invalid promo code",
          valid: false 
        });
      }
      
      // Record usage (would integrate with actual subscription creation)
      const usage = await storage.recordPromoCodeUsage({
        promoCodeId: validation.promoCode!.id,
        userId,
        originalPriceCents: validation.discountedPrice! + validation.savings!,
        discountedPriceCents: validation.discountedPrice!,
        savingsCents: validation.savings!,
      });
      
      res.json({
        valid: true,
        applied: true,
        usage,
        savings: validation.savings,
        finalPrice: validation.discountedPrice
      });
    } catch (error) {
      console.error("Error applying promo code:", error);
      res.status(500).json({ message: "Failed to apply promo code" });
    }
  });

  // Enhanced Subscriptions (Fan Subscriptions)
  app.get('/api/subscriptions/enhanced', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const subscriptions = await storage.getUserEnhancedSubscriptions(userId);
      res.json(subscriptions);
    } catch (error) {
      console.error("Error fetching enhanced subscriptions:", error);
      res.status(500).json({ message: "Failed to fetch subscriptions" });
    }
  });

  app.post('/api/subscriptions/enhanced', isAuthenticated, csrfProtection, validateRequest(createSubscriptionEnhancedSchema), async (req: any, res) => {
    try {
      const fanId = req.user.claims.sub;
      const subscriptionData = { ...req.body, fanId };
      const subscription = await storage.createEnhancedSubscription(subscriptionData);
      res.json(subscription);
    } catch (error) {
      console.error("Error creating enhanced subscription:", error);
      res.status(500).json({ message: "Failed to create subscription" });
    }
  });

  app.get('/api/earnings/top', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      if (!(await hasAdminAccess(userId, 'analytics_access'))) {
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
  app.post('/api/posts', isAuthenticated, csrfProtection, contentRateLimit, validateRequest(insertPostSchema), async (req: any, res) => {
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

  app.post('/api/payouts', isAuthenticated, csrfProtection, paymentRateLimit, validateRequest(insertPayoutRequestSchema), async (req: any, res) => {
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

  app.post('/api/webhooks', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, validateRequest(insertWebhookSchema), async (req: any, res) => {
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

  app.post('/api/api-keys', isAuthenticated, csrfProtection, sensitiveOperationRateLimit, async (req: any, res) => {
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
        },
        '/messages/conversations': {
          get: {
            summary: 'Get user conversations',
            security: [{ sessionAuth: [] }],
            responses: {
              '200': { description: 'List of user conversations with other users' }
            }
          }
        },
        '/messages': {
          get: {
            summary: 'Get conversation messages',
            security: [{ sessionAuth: [] }],
            parameters: [
              {
                name: 'userId',
                in: 'query',
                required: true,
                schema: { type: 'string', format: 'uuid' },
                description: 'Other user ID to get conversation with'
              },
              {
                name: 'limit',
                in: 'query',
                schema: { type: 'integer', default: 50 },
                description: 'Maximum number of messages to return'
              }
            ],
            responses: {
              '200': { description: 'Messages in conversation' },
              '400': { description: 'Missing or invalid userId parameter' },
              '403': { description: 'Access denied to conversation' }
            }
          },
          post: {
            summary: 'Send a message',
            security: [{ sessionAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['receiverId'],
                    properties: {
                      receiverId: { type: 'string', format: 'uuid' },
                      type: { type: 'string', enum: ['text', 'photo', 'video', 'audio', 'tip', 'welcome'] },
                      content: { type: 'string' },
                      mediaUrl: { type: 'string' },
                      priceCents: { type: 'integer', minimum: 0 }
                    }
                  }
                }
              }
            },
            responses: {
              '201': { description: 'Message sent successfully' },
              '400': { description: 'Invalid request data' },
              '403': { description: 'Cannot send message as another user' }
            }
          }
        },
        '/messages/{id}/read': {
          put: {
            summary: 'Mark message as read',
            security: [{ sessionAuth: [] }],
            parameters: [
              {
                name: 'id',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
                description: 'Message ID to mark as read'
              }
            ],
            responses: {
              '200': { description: 'Message marked as read' },
              '403': { description: 'Only recipient can mark message as read' },
              '404': { description: 'Message not found or access denied' }
            }
          }
        },
        '/posts/{postId}/comments': {
          get: {
            summary: 'Get post comments',
            security: [{ sessionAuth: [] }],
            parameters: [
              {
                name: 'postId',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
                description: 'Post ID to get comments for'
              }
            ],
            responses: {
              '200': { description: 'List of comments for the post' }
            }
          }
        },
        '/comments': {
          post: {
            summary: 'Create a comment',
            security: [{ sessionAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['postId', 'content'],
                    properties: {
                      postId: { type: 'string', format: 'uuid' },
                      content: { type: 'string' },
                      parentId: { type: 'string', format: 'uuid', nullable: true }
                    }
                  }
                }
              }
            },
            responses: {
              '201': { description: 'Comment created successfully' },
              '400': { description: 'Missing postId or content' }
            }
          }
        },
        '/posts/like': {
          post: {
            summary: 'Like a post',
            security: [{ sessionAuth: [] }],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    required: ['postId'],
                    properties: {
                      postId: { type: 'string', format: 'uuid' }
                    }
                  }
                }
              }
            },
            responses: {
              '200': { description: 'Post liked successfully' },
              '400': { description: 'Missing postId' }
            }
          }
        },
        '/posts/{postId}/like': {
          delete: {
            summary: 'Unlike a post',
            security: [{ sessionAuth: [] }],
            parameters: [
              {
                name: 'postId',
                in: 'path',
                required: true,
                schema: { type: 'string', format: 'uuid' },
                description: 'Post ID to unlike'
              }
            ],
            responses: {
              '200': { description: 'Post unliked successfully' },
              '400': { description: 'Invalid post ID format' }
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

      // Send real-time notification to receiver
      notificationService.sendNotification(messageData.receiverId, {
        kind: 'fan_activity',
        payloadJson: {
          message: `New message from ${req.user.claims.username || 'someone'}`,
          messageId: message.id,
          senderId: senderId,
          type: messageData.type || 'text'
        }
      });
      
      res.status(201).json(message);
    } catch (error) {
      console.error("Error creating message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Mass messaging endpoints
  app.post('/api/messages/mass', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      // Only creators can send mass messages
      if (userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can send mass messages" });
      }
      
      const { content, type, mediaUrl, priceCents, targetSegment, customRecipientIds, scheduledAt } = req.body;
      
      if (!content || !targetSegment) {
        return res.status(400).json({ message: "Content and target segment are required" });
      }
      
      const { massMessagingService } = await import('./services/massMessagingService');
      
      const result = await massMessagingService.sendMassMessage({
        senderId,
        content,
        type: type || 'text',
        mediaUrl,
        priceCents: priceCents || 0,
        targetSegment,
        customRecipientIds,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined
      });
      
      res.json(result);
    } catch (error) {
      console.error("Error sending mass message:", error);
      res.status(500).json({ 
        message: "Failed to send mass message", 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  });

  app.get('/api/messages/mass/jobs/:jobId', isAuthenticated, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const senderId = req.user.claims.sub;
      
      const { massMessagingService } = await import('./services/massMessagingService');
      const job = await massMessagingService.getJobStatus(jobId);
      
      if (!job || job.senderId !== senderId) {
        return res.status(404).json({ message: "Job not found" });
      }
      
      res.json(job);
    } catch (error) {
      console.error("Error getting job status:", error);
      res.status(500).json({ message: "Failed to get job status" });
    }
  });

  app.get('/api/messages/mass/jobs', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      if (userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can view mass message jobs" });
      }
      
      const { massMessagingService } = await import('./services/massMessagingService');
      const jobs = massMessagingService.getCreatorJobs(senderId);
      
      res.json(jobs);
    } catch (error) {
      console.error("Error getting creator jobs:", error);
      res.status(500).json({ message: "Failed to get jobs" });
    }
  });

  app.delete('/api/messages/mass/jobs/:jobId', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const { jobId } = req.params;
      const senderId = req.user.claims.sub;
      
      const { massMessagingService } = await import('./services/massMessagingService');
      const cancelled = await massMessagingService.cancelJob(jobId, senderId);
      
      if (!cancelled) {
        return res.status(400).json({ message: "Job could not be cancelled" });
      }
      
      res.json({ message: "Job cancelled successfully" });
    } catch (error) {
      console.error("Error cancelling job:", error);
      res.status(500).json({ 
        message: "Failed to cancel job",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/api/messages/mass/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const senderId = req.user.claims.sub;
      const userRole = req.user.claims.role;
      
      if (userRole !== 'creator') {
        return res.status(403).json({ message: "Only creators can view mass message analytics" });
      }
      
      const days = parseInt(req.query.days as string) || 30;
      
      const { massMessagingService } = await import('./services/massMessagingService');
      const analytics = await massMessagingService.getMassMessageAnalytics(senderId, days);
      
      res.json(analytics);
    } catch (error) {
      console.error("Error getting mass message analytics:", error);
      res.status(500).json({ message: "Failed to get analytics" });
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

  app.post('/api/comments', isAuthenticated, csrfProtection, contentRateLimit, validateRequest(insertCommentSchema), async (req: any, res) => {
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

  app.delete('/api/posts/:postId/like', isAuthenticated, csrfProtection, async (req: any, res) => {
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

  // Live Streaming Routes
  
  // Create a new live stream
  app.post('/api/streams', isAuthenticated, csrfProtection, validateRequest(insertLiveStreamSchema), async (req: any, res) => {
    try {
      const creatorId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      const streamData = {
        ...req.body,
        creatorId,
      };
      
      const stream = await getstreamService.createLiveStream(streamData);
      res.status(201).json(stream);
    } catch (error) {
      console.error("Error creating live stream:", error);
      res.status(500).json({ message: "Failed to create live stream" });
    }
  });

  // Get live streams (for creator dashboard)
  app.get('/api/streams', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims?.sub || req.user.id;
      const status = req.query.status as string;
      const limit = parseInt(req.query.limit as string) || 20;
      
      const streams = await storage.getLiveStreams(userId, { status, limit });
      res.json(streams);
    } catch (error) {
      console.error("Error fetching live streams:", error);
      res.status(500).json({ message: "Failed to fetch live streams" });
    }
  });

  // Get public live streams (no auth required)
  app.get('/api/streams/public', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const streams = await storage.getPublicLiveStreams({ limit, offset });
      res.json(streams);
    } catch (error) {
      console.error("Error fetching public live streams:", error);
      res.status(500).json({ message: "Failed to fetch public live streams" });
    }
  });

  // Get specific live stream details with proper authorization and field redaction
  app.get('/api/streams/:streamId', isAuthenticated, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const userId = req.user.claims?.sub || req.user.id;
      const stream = await storage.getLiveStream(streamId);
      
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      // Check if user is the creator to determine what data to return
      if (stream.creatorId === userId) {
        // Creator gets full access to their stream including sensitive fields
        res.json(stream);
      } else {
        // Non-creators must pass access control and get redacted data
        const { createGetstreamService } = await import('./services/getstreamService');
        const getstreamService = createGetstreamService(storage);
        
        // Check access permissions before returning any data
        try {
          await getstreamService.checkStreamAccess(stream, userId);
          
          // Return redacted stream data without sensitive fields
          const {
            streamKey,
            rtmpIngestUrl,
            streamUrl,
            ...safeStreamData
          } = stream;
          
          res.json(safeStreamData);
        } catch (accessError) {
          return res.status(403).json({ message: "Access denied to this stream" });
        }
      }
    } catch (error) {
      console.error("Error fetching live stream:", error);
      res.status(500).json({ message: "Failed to fetch live stream" });
    }
  });

  // Start a live stream
  app.post('/api/streams/:streamId/start', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const creatorId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      await getstreamService.startLiveStream(streamId, creatorId);
      res.json({ message: "Stream started successfully" });
    } catch (error) {
      console.error("Error starting live stream:", error);
      res.status(500).json({ message: "Failed to start live stream" });
    }
  });

  // End a live stream
  app.post('/api/streams/:streamId/end', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const creatorId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      await getstreamService.endLiveStream(streamId, creatorId);
      res.json({ message: "Stream ended successfully" });
    } catch (error) {
      console.error("Error ending live stream:", error);
      res.status(500).json({ message: "Failed to end live stream" });
    }
  });

  // Join a live stream as viewer - returns access token
  app.post('/api/streams/:streamId/join', isAuthenticated, csrfProtection, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const userId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      const result = await getstreamService.joinStream(streamId, userId);
      res.json(result);
    } catch (error) {
      console.error("Error joining live stream:", error);
      
      // Provide specific error messages for access control
      if (error instanceof Error && (error.message.includes('access denied') || error.message.includes('subscribers only') || error.message.includes('private stream'))) {
        res.status(403).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to join live stream" });
      }
    }
  });

  // Leave a live stream
  app.post('/api/streams/:streamId/leave', isAuthenticated, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const userId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      await getstreamService.leaveStream(streamId, userId);
      res.json({ message: "Left stream successfully" });
    } catch (error) {
      console.error("Error leaving live stream:", error);
      res.status(500).json({ message: "Failed to leave live stream" });
    }
  });

  // Get live stream analytics (creator only)
  app.get('/api/streams/:streamId/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const { streamId } = req.params;
      const creatorId = req.user.claims?.sub || req.user.id;
      const { createGetstreamService } = await import('./services/getstreamService');
      const getstreamService = createGetstreamService(storage);
      
      const analytics = await getstreamService.getStreamAnalytics(streamId, creatorId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching stream analytics:", error);
      res.status(500).json({ message: "Failed to fetch stream analytics" });
    }
  });

  // Get public live streams (for discovery)
  app.get('/api/streams/public/live', async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const streams = await storage.getPublicLiveStreams({ limit, offset });
      res.json(streams);
    } catch (error) {
      console.error("Error fetching public live streams:", error);
      res.status(500).json({ message: "Failed to fetch public live streams" });
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
