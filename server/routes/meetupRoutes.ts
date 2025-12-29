/**
 * Meetup Routes - BoyFanz
 *
 * API endpoints for scheduling and managing meetups between creators.
 * Integrates with FanzChat for real-time messaging.
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { meetups, users, creatorLocations } from '@shared/schema';
import { eq, and, or, desc, sql } from 'drizzle-orm';

const router = Router();

// Validation schemas
const createMeetupSchema = z.object({
  inviteeId: z.string().uuid(),
  locationName: z.string().min(1).max(255).optional(),
  locationAddress: z.string().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  proposedAt: z.string().datetime(),
  alternateTime1: z.string().datetime().optional(),
  alternateTime2: z.string().datetime().optional(),
  creatorNotes: z.string().max(1000).optional(),
  isPublic: z.boolean().optional(),
  maxAttendees: z.number().min(2).max(20).optional(),
});

const respondMeetupSchema = z.object({
  action: z.enum(['accept', 'decline', 'propose_alternate']),
  selectedTime: z.string().datetime().optional(),
  inviteeNotes: z.string().max(1000).optional(),
  cancelReason: z.string().max(500).optional(),
});

/**
 * POST /api/meetups
 * Create a new meetup request
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const data = createMeetupSchema.parse(req.body);

    // Verify invitee exists and is a creator
    const [invitee] = await db
      .select()
      .from(users)
      .where(eq(users.id, data.inviteeId))
      .limit(1);

    if (!invitee) {
      return res.status(404).json({ success: false, error: 'Invitee not found' });
    }

    if (invitee.accountType !== 'creator') {
      return res.status(400).json({ success: false, error: 'Can only schedule meetups with creators' });
    }

    // Create the meetup
    const [meetup] = await db.insert(meetups).values({
      creatorId: userId,
      inviteeId: data.inviteeId,
      locationName: data.locationName,
      locationAddress: data.locationAddress,
      lat: data.lat?.toString(),
      lng: data.lng?.toString(),
      proposedAt: new Date(data.proposedAt),
      alternateTime1: data.alternateTime1 ? new Date(data.alternateTime1) : null,
      alternateTime2: data.alternateTime2 ? new Date(data.alternateTime2) : null,
      creatorNotes: data.creatorNotes,
      isPublic: data.isPublic ?? false,
      maxAttendees: data.maxAttendees ?? 2,
      creatorPlatform: 'boyfanz',
      status: 'pending',
    }).returning();

    // TODO: Send notification to invitee via FanzNotify
    // TODO: Create chat room via FanzChat if needed

    res.status(201).json({
      success: true,
      data: meetup,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('[Meetups] Create error:', error);
    res.status(500).json({ success: false, error: 'Failed to create meetup' });
  }
});

/**
 * GET /api/meetups
 * List meetups for current user (as creator or invitee)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const status = req.query.status as string;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    let query = db
      .select({
        meetup: meetups,
        creator: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(meetups)
      .leftJoin(users, eq(meetups.creatorId, users.id))
      .where(
        or(
          eq(meetups.creatorId, userId),
          eq(meetups.inviteeId, userId)
        )
      )
      .orderBy(desc(meetups.proposedAt))
      .limit(limit)
      .offset(offset);

    const results = await query;

    res.json({
      success: true,
      data: results,
      pagination: {
        limit,
        offset,
        hasMore: results.length === limit,
      },
    });
  } catch (error) {
    console.error('[Meetups] List error:', error);
    res.status(500).json({ success: false, error: 'Failed to list meetups' });
  }
});

/**
 * GET /api/meetups/:id
 * Get a specific meetup
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const meetupId = req.params.id;

    const [meetup] = await db
      .select()
      .from(meetups)
      .where(
        and(
          eq(meetups.id, meetupId),
          or(
            eq(meetups.creatorId, userId),
            eq(meetups.inviteeId, userId)
          )
        )
      )
      .limit(1);

    if (!meetup) {
      return res.status(404).json({ success: false, error: 'Meetup not found' });
    }

    res.json({ success: true, data: meetup });
  } catch (error) {
    console.error('[Meetups] Get error:', error);
    res.status(500).json({ success: false, error: 'Failed to get meetup' });
  }
});

/**
 * POST /api/meetups/:id/respond
 * Respond to a meetup request (accept, decline, or propose alternate)
 */
router.post('/:id/respond', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const meetupId = req.params.id;
    const data = respondMeetupSchema.parse(req.body);

    // Get the meetup and verify user is the invitee
    const [meetup] = await db
      .select()
      .from(meetups)
      .where(
        and(
          eq(meetups.id, meetupId),
          eq(meetups.inviteeId, userId),
          eq(meetups.status, 'pending')
        )
      )
      .limit(1);

    if (!meetup) {
      return res.status(404).json({ success: false, error: 'Meetup not found or already responded' });
    }

    let updateData: any = {
      updatedAt: new Date(),
      inviteeNotes: data.inviteeNotes,
      inviteePlatform: 'boyfanz',
    };

    switch (data.action) {
      case 'accept':
        updateData.status = 'confirmed';
        updateData.confirmedAt = data.selectedTime
          ? new Date(data.selectedTime)
          : meetup.proposedAt;
        break;

      case 'decline':
        updateData.status = 'cancelled';
        updateData.cancelledAt = new Date();
        updateData.cancelReason = data.cancelReason;
        break;

      case 'propose_alternate':
        // Keep pending but update alternate times
        if (data.selectedTime) {
          updateData.alternateTime1 = new Date(data.selectedTime);
        }
        break;
    }

    const [updated] = await db
      .update(meetups)
      .set(updateData)
      .where(eq(meetups.id, meetupId))
      .returning();

    // TODO: Notify creator of response via FanzNotify

    res.json({ success: true, data: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
        details: error.errors,
      });
    }
    console.error('[Meetups] Respond error:', error);
    res.status(500).json({ success: false, error: 'Failed to respond to meetup' });
  }
});

/**
 * POST /api/meetups/:id/cancel
 * Cancel a meetup (by creator)
 */
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const meetupId = req.params.id;
    const { reason } = req.body;

    const [meetup] = await db
      .select()
      .from(meetups)
      .where(
        and(
          eq(meetups.id, meetupId),
          eq(meetups.creatorId, userId),
          or(
            eq(meetups.status, 'pending'),
            eq(meetups.status, 'confirmed')
          )
        )
      )
      .limit(1);

    if (!meetup) {
      return res.status(404).json({ success: false, error: 'Meetup not found or cannot be cancelled' });
    }

    const [updated] = await db
      .update(meetups)
      .set({
        status: 'cancelled',
        cancelledAt: new Date(),
        cancelReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(meetups.id, meetupId))
      .returning();

    // TODO: Notify invitee of cancellation

    res.json({ success: true, data: updated });
  } catch (error) {
    console.error('[Meetups] Cancel error:', error);
    res.status(500).json({ success: false, error: 'Failed to cancel meetup' });
  }
});

/**
 * GET /api/meetups/upcoming
 * Get upcoming confirmed meetups
 */
router.get('/upcoming', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const upcoming = await db
      .select()
      .from(meetups)
      .where(
        and(
          or(
            eq(meetups.creatorId, userId),
            eq(meetups.inviteeId, userId)
          ),
          eq(meetups.status, 'confirmed'),
          sql`${meetups.confirmedAt} > NOW()`
        )
      )
      .orderBy(meetups.confirmedAt)
      .limit(10);

    res.json({ success: true, data: upcoming });
  } catch (error) {
    console.error('[Meetups] Upcoming error:', error);
    res.status(500).json({ success: false, error: 'Failed to get upcoming meetups' });
  }
});

export default router;
