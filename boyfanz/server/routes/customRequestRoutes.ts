// @ts-nocheck
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import {
  customRequests,
  customRequestMessages,
  escrowTransactions,
  creatorRequestSettings,
  users
} from '@shared/schema';
import { eq, and, desc, or, sql } from 'drizzle-orm';
import { isAuthenticated, requireCreator } from '../middleware/auth';

const router = Router();

// ============================================
// CUSTOM REQUEST SCHEMAS
// ============================================

const createRequestSchema = z.object({
  creatorId: z.string().uuid(),
  type: z.enum(['photo_set', 'video', 'voice_message', 'video_message', 'custom_content', 'other']),
  title: z.string().min(5).max(200),
  description: z.string().min(10),
  requirements: z.string().optional(),
  offeredPriceCents: z.number().int().min(500), // $5 minimum
  requestedDeliveryDays: z.number().int().min(1).max(30).default(7),
  isExclusive: z.boolean().default(false),
  isRush: z.boolean().default(false),
});

const respondToRequestSchema = z.object({
  action: z.enum(['accept', 'decline', 'counter']),
  message: z.string().optional(),
  counterPriceCents: z.number().int().optional(),
  counterDeliveryDays: z.number().int().optional(),
});

const deliverContentSchema = z.object({
  deliveryMediaUrls: z.array(z.string().url()),
  deliveryMessage: z.string().optional(),
});

// ============================================
// FAN ENDPOINTS
// ============================================

/**
 * Create a new custom request
 * POST /api/custom-requests
 */
router.post('/', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const data = createRequestSchema.parse(req.body);

    // Check if creator exists and is accepting requests
    const [creator] = await db.select().from(users).where(eq(users.id, data.creatorId));
    if (!creator || creator.role !== 'creator') {
      return res.status(404).json({ error: 'Creator not found' });
    }

    // Get creator settings
    const [settings] = await db.select()
      .from(creatorRequestSettings)
      .where(eq(creatorRequestSettings.creatorId, data.creatorId));

    if (settings && !settings.isAcceptingRequests) {
      return res.status(400).json({ error: 'Creator is not accepting custom requests' });
    }

    if (settings && data.offeredPriceCents < (settings.minPriceCents || 2500)) {
      return res.status(400).json({
        error: `Minimum price is $${((settings.minPriceCents || 2500) / 100).toFixed(2)}`
      });
    }

    // Calculate fees
    const platformFeeCents = Math.round(data.offeredPriceCents * 0.20); // 20% platform fee
    const creatorEarningsCents = data.offeredPriceCents - platformFeeCents;

    // Calculate rush/exclusive fees if applicable
    let rushFeeCents = 0;
    let exclusivityFeeCents = 0;

    if (data.isRush && settings) {
      rushFeeCents = Math.round(data.offeredPriceCents * ((settings.rushDeliveryMultiplier || 1.5) - 1));
    }

    if (data.isExclusive && settings) {
      exclusivityFeeCents = Math.round(data.offeredPriceCents * ((settings.exclusivityMultiplier || 2.0) - 1));
    }

    // Set expiration (48 hours for creator to respond)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Create the request
    const [request] = await db.insert(customRequests).values({
      fanId: userId,
      creatorId: data.creatorId,
      type: data.type,
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      offeredPriceCents: data.offeredPriceCents + rushFeeCents + exclusivityFeeCents,
      platformFeeCents,
      creatorEarningsCents: creatorEarningsCents + Math.round((rushFeeCents + exclusivityFeeCents) * 0.80),
      requestedDeliveryDays: data.requestedDeliveryDays,
      isExclusive: data.isExclusive,
      exclusivityFeeCents,
      isRush: data.isRush,
      rushFeeCents,
      status: 'pending',
      expiresAt,
    }).returning();

    // Create initial message
    await db.insert(customRequestMessages).values({
      requestId: request.id,
      senderId: userId,
      content: data.description,
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Create custom request error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to create custom request' });
  }
});

/**
 * Get fan's custom requests
 * GET /api/custom-requests/my-requests
 */
router.get('/my-requests', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const status = req.query.status as string | undefined;

    let query = db.select({
      request: customRequests,
      creator: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(customRequests)
    .innerJoin(users, eq(customRequests.creatorId, users.id))
    .where(eq(customRequests.fanId, userId))
    .orderBy(desc(customRequests.createdAt));

    const requests = await query;

    // Filter by status if provided
    const filtered = status
      ? requests.filter(r => r.request.status === status)
      : requests;

    res.json(filtered);
  } catch (error) {
    console.error('Get my requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * Pay for accepted custom request (creates escrow)
 * POST /api/custom-requests/:id/pay
 */
router.post('/:id/pay', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the request
    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.fanId, userId),
        eq(customRequests.status, 'accepted')
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not ready for payment' });
    }

    const amountCents = request.agreedPriceCents || request.offeredPriceCents;
    const platformFeeCents = Math.round(amountCents * 0.20);
    const creatorEarningsCents = amountCents - platformFeeCents;

    // Create escrow transaction
    const [escrow] = await db.insert(escrowTransactions).values({
      payerId: userId,
      payeeId: request.creatorId,
      referenceType: 'custom_request',
      referenceId: requestId,
      amountCents,
      platformFeeCents,
      payeeEarningsCents: creatorEarningsCents,
      status: 'held',
      heldAt: new Date(),
    }).returning();

    // Update request status
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + (request.requestedDeliveryDays || 7));

    await db.update(customRequests)
      .set({
        status: 'paid',
        escrowTransactionId: escrow.id,
        agreedDeliveryDate: deliveryDate,
        updatedAt: new Date(),
      })
      .where(eq(customRequests.id, requestId));

    res.json({
      success: true,
      escrowId: escrow.id,
      message: 'Payment held in escrow. Creator will be notified to begin work.'
    });
  } catch (error) {
    console.error('Pay for request error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

/**
 * Approve delivered content (releases escrow)
 * POST /api/custom-requests/:id/approve
 */
router.post('/:id/approve', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get the request
    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.fanId, userId),
        eq(customRequests.status, 'delivered')
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not delivered' });
    }

    // Update request status
    await db.update(customRequests)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customRequests.id, requestId));

    // Release escrow
    if (request.escrowTransactionId) {
      await db.update(escrowTransactions)
        .set({
          status: 'released',
          releasedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(escrowTransactions.id, request.escrowTransactionId));
    }

    res.json({
      success: true,
      message: 'Content approved! Payment has been released to the creator.'
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({ error: 'Failed to approve request' });
  }
});

/**
 * Dispute delivered content
 * POST /api/custom-requests/:id/dispute
 */
router.post('/:id/dispute', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;
    const { reason } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!reason || reason.length < 10) {
      return res.status(400).json({ error: 'Please provide a detailed reason for the dispute' });
    }

    // Get the request
    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.fanId, userId),
        eq(customRequests.status, 'delivered')
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not delivered' });
    }

    // Update request status
    await db.update(customRequests)
      .set({
        status: 'disputed',
        disputeReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(customRequests.id, requestId));

    // Update escrow
    if (request.escrowTransactionId) {
      await db.update(escrowTransactions)
        .set({
          status: 'disputed',
          disputedAt: new Date(),
          disputeNotes: reason,
          updatedAt: new Date(),
        })
        .where(eq(escrowTransactions.id, request.escrowTransactionId));
    }

    res.json({
      success: true,
      message: 'Dispute submitted. Our team will review and contact both parties.'
    });
  } catch (error) {
    console.error('Dispute request error:', error);
    res.status(500).json({ error: 'Failed to submit dispute' });
  }
});

// ============================================
// CREATOR ENDPOINTS
// ============================================

/**
 * Get creator's pending requests
 * GET /api/custom-requests/pending
 */
router.get('/pending', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const requests = await db.select({
      request: customRequests,
      fan: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(customRequests)
    .innerJoin(users, eq(customRequests.fanId, users.id))
    .where(and(
      eq(customRequests.creatorId, userId),
      or(
        eq(customRequests.status, 'pending'),
        eq(customRequests.status, 'negotiating')
      )
    ))
    .orderBy(desc(customRequests.createdAt));

    res.json(requests);
  } catch (error) {
    console.error('Get pending requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * Get creator's active requests (paid, in_progress)
 * GET /api/custom-requests/active
 */
router.get('/active', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const requests = await db.select({
      request: customRequests,
      fan: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(customRequests)
    .innerJoin(users, eq(customRequests.fanId, users.id))
    .where(and(
      eq(customRequests.creatorId, userId),
      or(
        eq(customRequests.status, 'paid'),
        eq(customRequests.status, 'in_progress')
      )
    ))
    .orderBy(customRequests.agreedDeliveryDate);

    res.json(requests);
  } catch (error) {
    console.error('Get active requests error:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
});

/**
 * Respond to a custom request (accept/decline/counter)
 * POST /api/custom-requests/:id/respond
 */
router.post('/:id/respond', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const data = respondToRequestSchema.parse(req.body);

    // Get the request
    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.creatorId, userId),
        or(
          eq(customRequests.status, 'pending'),
          eq(customRequests.status, 'negotiating')
        )
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    let newStatus: string;
    let updates: any = { updatedAt: new Date() };

    switch (data.action) {
      case 'accept':
        newStatus = 'accepted';
        updates.agreedPriceCents = request.offeredPriceCents;
        updates.platformFeeCents = Math.round(request.offeredPriceCents * 0.20);
        updates.creatorEarningsCents = request.offeredPriceCents - updates.platformFeeCents;
        break;

      case 'decline':
        newStatus = 'declined';
        break;

      case 'counter':
        if (!data.counterPriceCents) {
          return res.status(400).json({ error: 'Counter price is required' });
        }
        newStatus = 'negotiating';
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    updates.status = newStatus;

    await db.update(customRequests)
      .set(updates)
      .where(eq(customRequests.id, requestId));

    // Add message if provided or if counter offer
    if (data.message || data.action === 'counter') {
      await db.insert(customRequestMessages).values({
        requestId,
        senderId: userId,
        content: data.message || `Counter offer: $${(data.counterPriceCents! / 100).toFixed(2)}`,
        isCounterOffer: data.action === 'counter',
        counterPriceCents: data.counterPriceCents,
        counterDeliveryDays: data.counterDeliveryDays,
      });
    }

    res.json({
      success: true,
      status: newStatus,
      message: data.action === 'accept'
        ? 'Request accepted! Waiting for fan to pay.'
        : data.action === 'decline'
        ? 'Request declined.'
        : 'Counter offer sent to fan.'
    });
  } catch (error) {
    console.error('Respond to request error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to respond to request' });
  }
});

/**
 * Mark request as in progress
 * POST /api/custom-requests/:id/start
 */
router.post('/:id/start', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.creatorId, userId),
        eq(customRequests.status, 'paid')
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not paid' });
    }

    await db.update(customRequests)
      .set({
        status: 'in_progress',
        updatedAt: new Date(),
      })
      .where(eq(customRequests.id, requestId));

    res.json({ success: true, message: 'Request marked as in progress' });
  } catch (error) {
    console.error('Start request error:', error);
    res.status(500).json({ error: 'Failed to start request' });
  }
});

/**
 * Deliver custom content
 * POST /api/custom-requests/:id/deliver
 */
router.post('/:id/deliver', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const data = deliverContentSchema.parse(req.body);

    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        eq(customRequests.creatorId, userId),
        or(
          eq(customRequests.status, 'paid'),
          eq(customRequests.status, 'in_progress')
        )
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found or not ready for delivery' });
    }

    await db.update(customRequests)
      .set({
        status: 'delivered',
        deliveryMediaUrls: data.deliveryMediaUrls,
        deliveryMessage: data.deliveryMessage,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(customRequests.id, requestId));

    // Add delivery message
    await db.insert(customRequestMessages).values({
      requestId,
      senderId: userId,
      content: data.deliveryMessage || 'Your custom content has been delivered!',
      attachmentUrls: data.deliveryMediaUrls,
    });

    // Set auto-release timer for escrow (48 hours if fan doesn't respond)
    if (request.escrowTransactionId) {
      const releaseAt = new Date();
      releaseAt.setHours(releaseAt.getHours() + 48);

      await db.update(escrowTransactions)
        .set({
          releaseAt,
          updatedAt: new Date(),
        })
        .where(eq(escrowTransactions.id, request.escrowTransactionId));
    }

    res.json({
      success: true,
      message: 'Content delivered! Fan has 48 hours to approve or dispute. Payment will auto-release after that.'
    });
  } catch (error) {
    console.error('Deliver request error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to deliver content' });
  }
});

/**
 * Get/Update creator request settings
 * GET/PUT /api/custom-requests/settings
 */
router.get('/settings', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let [settings] = await db.select()
      .from(creatorRequestSettings)
      .where(eq(creatorRequestSettings.creatorId, userId));

    // Create default settings if none exist
    if (!settings) {
      [settings] = await db.insert(creatorRequestSettings)
        .values({ creatorId: userId })
        .returning();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings', isAuthenticated, requireCreator, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const updates = {
      ...req.body,
      updatedAt: new Date(),
    };

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.creatorId;
    delete updates.createdAt;

    const [settings] = await db.update(creatorRequestSettings)
      .set(updates)
      .where(eq(creatorRequestSettings.creatorId, userId))
      .returning();

    if (!settings) {
      // Create if doesn't exist
      const [newSettings] = await db.insert(creatorRequestSettings)
        .values({ creatorId: userId, ...updates })
        .returning();
      return res.json(newSettings);
    }

    res.json(settings);
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// ============================================
// SHARED ENDPOINTS
// ============================================

/**
 * Get single request details
 * GET /api/custom-requests/:id
 */
router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const [result] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        or(
          eq(customRequests.fanId, userId),
          eq(customRequests.creatorId, userId)
        )
      ));

    if (!result) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Get messages
    const messages = await db.select({
      message: customRequestMessages,
      sender: {
        id: users.id,
        username: users.username,
        displayName: users.displayName,
        profileImageUrl: users.profileImageUrl,
      }
    })
    .from(customRequestMessages)
    .innerJoin(users, eq(customRequestMessages.senderId, users.id))
    .where(eq(customRequestMessages.requestId, requestId))
    .orderBy(customRequestMessages.createdAt);

    // Get escrow info if exists
    let escrow = null;
    if (result.escrowTransactionId) {
      [escrow] = await db.select()
        .from(escrowTransactions)
        .where(eq(escrowTransactions.id, result.escrowTransactionId));
    }

    res.json({
      request: result,
      messages,
      escrow,
    });
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

/**
 * Send message in request thread
 * POST /api/custom-requests/:id/messages
 */
router.post('/:id/messages', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const requestId = req.params.id;
    const { content, attachmentUrls } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // Verify user is part of this request
    const [request] = await db.select()
      .from(customRequests)
      .where(and(
        eq(customRequests.id, requestId),
        or(
          eq(customRequests.fanId, userId),
          eq(customRequests.creatorId, userId)
        )
      ));

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const [message] = await db.insert(customRequestMessages).values({
      requestId,
      senderId: userId,
      content,
      attachmentUrls: attachmentUrls || [],
    }).returning();

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * Get creator's public request info (for fans to see pricing/availability)
 * GET /api/custom-requests/creator/:creatorId/info
 */
router.get('/creator/:creatorId/info', async (req: Request, res: Response) => {
  try {
    const creatorId = req.params.creatorId;

    const [creator] = await db.select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(users)
    .where(and(
      eq(users.id, creatorId),
      eq(users.role, 'creator')
    ));

    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    let [settings] = await db.select()
      .from(creatorRequestSettings)
      .where(eq(creatorRequestSettings.creatorId, creatorId));

    // Default settings if none exist
    if (!settings) {
      settings = {
        isAcceptingRequests: true,
        minPriceCents: 2500,
        photoSetBasePriceCents: 7500,
        videoPerMinuteCents: 5000,
        messageBasePriceCents: 2500,
        standardDeliveryDays: 7,
        rushDeliveryDays: 3,
        expressDeliveryDays: 1,
        rushDeliveryMultiplier: 1.5,
        expressDeliveryMultiplier: 2.0,
        exclusivityMultiplier: 2.0,
        guidelines: null,
      } as any;
    }

    res.json({
      creator,
      settings: {
        isAcceptingRequests: settings.isAcceptingRequests,
        minPriceCents: settings.minPriceCents,
        photoSetBasePriceCents: settings.photoSetBasePriceCents,
        videoPerMinuteCents: settings.videoPerMinuteCents,
        messageBasePriceCents: settings.messageBasePriceCents,
        standardDeliveryDays: settings.standardDeliveryDays,
        rushDeliveryDays: settings.rushDeliveryDays,
        expressDeliveryDays: settings.expressDeliveryDays,
        rushDeliveryMultiplier: settings.rushDeliveryMultiplier,
        exclusivityMultiplier: settings.exclusivityMultiplier,
        guidelines: settings.guidelines,
      }
    });
  } catch (error) {
    console.error('Get creator info error:', error);
    res.status(500).json({ error: 'Failed to fetch creator info' });
  }
});

export default router;
