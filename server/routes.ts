import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import { kycService } from "./services/kycService";
import { payoutService } from "./services/payoutService";
import { moderationService } from "./services/moderationService";
import { notificationService } from "./services/notificationService";
import { rateLimit } from "./middleware/rateLimit";
import { validateRequest } from "./middleware/validation";
import { insertMediaAssetSchema, insertPayoutRequestSchema, insertWebhookSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Rate limiting
  app.use('/api/', rateLimit);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const mediaAssets = await storage.getMediaAssets(userId, limit);
      res.json(mediaAssets);
    } catch (error) {
      console.error("Error fetching media:", error);
      res.status(500).json({ message: "Failed to fetch media" });
    }
  });

  app.post('/api/media/upload', isAuthenticated, async (req: any, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error generating upload URL:", error);
      res.status(500).json({ message: "Failed to generate upload URL" });
    }
  });

  app.post('/api/media', isAuthenticated, validateRequest(insertMediaAssetSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mediaData = req.body;
      
      const mediaAsset = await storage.createMediaAsset({
        ...mediaData,
        ownerId: userId,
      });

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

  app.put('/api/moderation/:id/approve', isAuthenticated, async (req: any, res) => {
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

  app.put('/api/moderation/:id/reject', isAuthenticated, async (req: any, res) => {
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
      const userId = req.user.claims.sub;
      const kyc = await storage.getKycVerification(userId);
      res.json(kyc || { status: 'pending' });
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      res.status(500).json({ message: "Failed to fetch KYC status" });
    }
  });

  app.post('/api/kyc/verify', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Payout routes
  app.get('/api/payouts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const payouts = await storage.getPayoutRequests(userId);
      res.json(payouts);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      res.status(500).json({ message: "Failed to fetch payouts" });
    }
  });

  app.post('/api/payouts', isAuthenticated, validateRequest(insertPayoutRequestSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await storage.getNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
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
      const userId = req.user.claims.sub;
      const webhooks = await storage.getWebhooks(userId);
      res.json(webhooks);
    } catch (error) {
      console.error("Error fetching webhooks:", error);
      res.status(500).json({ message: "Failed to fetch webhooks" });
    }
  });

  app.post('/api/webhooks', isAuthenticated, validateRequest(insertWebhookSchema), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
      const userId = req.user.claims.sub;
      const apiKeys = await storage.getApiKeys(userId);
      res.json(apiKeys);
    } catch (error) {
      console.error("Error fetching API keys:", error);
      res.status(500).json({ message: "Failed to fetch API keys" });
    }
  });

  app.post('/api/api-keys', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
          <title>Fanz API Documentation</title>
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
        title: 'Fanz API',
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
