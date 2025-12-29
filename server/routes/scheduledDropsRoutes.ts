import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { scheduledDrops, creatorProfiles, users } from '../../shared/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Middleware to verify authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Schema for creating/updating scheduled drops
const scheduledDropSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dropType: z.enum(['content', 'live_stream', 'exclusive', 'bundle']).default('content'),
  scheduledAt: z.string().transform(val => new Date(val)),
  thumbnailUrl: z.string().url().optional(),
  isPublic: z.boolean().default(true),
  notifySubscribers: z.boolean().default(true),
});

// GET /api/scheduled-drops/creator/:creatorId - Public endpoint to get a creator's upcoming drops
router.get('/creator/:creatorId', async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;
    const now = new Date();

    // Check if creator has schedule visibility enabled
    const [profile] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.userId, creatorId));

    if (!profile?.showScheduleOnProfile) {
      return res.json({ drops: [], scheduleEnabled: false });
    }

    // Fetch upcoming public drops
    const drops = await db
      .select({
        id: scheduledDrops.id,
        title: scheduledDrops.title,
        description: scheduledDrops.description,
        dropType: scheduledDrops.dropType,
        scheduledAt: scheduledDrops.scheduledAt,
        thumbnailUrl: scheduledDrops.thumbnailUrl,
      })
      .from(scheduledDrops)
      .where(
        and(
          eq(scheduledDrops.creatorId, creatorId),
          eq(scheduledDrops.isPublic, true),
          eq(scheduledDrops.status, 'scheduled'),
          gte(scheduledDrops.scheduledAt, now)
        )
      )
      .orderBy(asc(scheduledDrops.scheduledAt))
      .limit(20);

    res.json({ drops, scheduleEnabled: true });
  } catch (error) {
    console.error('Error fetching scheduled drops:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled drops' });
  }
});

// GET /api/scheduled-drops/my-drops - Get authenticated creator's scheduled drops
router.get('/my-drops', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { status, startDate, endDate } = req.query;

    let query = db
      .select()
      .from(scheduledDrops)
      .where(eq(scheduledDrops.creatorId, userId));

    const drops = await db
      .select()
      .from(scheduledDrops)
      .where(eq(scheduledDrops.creatorId, userId))
      .orderBy(desc(scheduledDrops.scheduledAt));

    res.json({ drops });
  } catch (error) {
    console.error('Error fetching my drops:', error);
    res.status(500).json({ message: 'Failed to fetch scheduled drops' });
  }
});

// POST /api/scheduled-drops - Create a new scheduled drop
router.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const parsed = scheduledDropSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request', errors: parsed.error.errors });
    }

    const data = parsed.data;

    const [drop] = await db
      .insert(scheduledDrops)
      .values({
        creatorId: userId,
        title: data.title,
        description: data.description,
        dropType: data.dropType,
        scheduledAt: data.scheduledAt,
        thumbnailUrl: data.thumbnailUrl,
        isPublic: data.isPublic,
        notifySubscribers: data.notifySubscribers,
        status: 'scheduled',
      })
      .returning();

    res.status(201).json(drop);
  } catch (error) {
    console.error('Error creating scheduled drop:', error);
    res.status(500).json({ message: 'Failed to create scheduled drop' });
  }
});

// PUT /api/scheduled-drops/:id - Update a scheduled drop
router.put('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;
    const parsed = scheduledDropSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ message: 'Invalid request', errors: parsed.error.errors });
    }

    // Verify ownership
    const [existing] = await db
      .select()
      .from(scheduledDrops)
      .where(and(eq(scheduledDrops.id, id), eq(scheduledDrops.creatorId, userId)));

    if (!existing) {
      return res.status(404).json({ message: 'Scheduled drop not found' });
    }

    const [updated] = await db
      .update(scheduledDrops)
      .set({
        ...parsed.data,
        updatedAt: new Date(),
      })
      .where(eq(scheduledDrops.id, id))
      .returning();

    res.json(updated);
  } catch (error) {
    console.error('Error updating scheduled drop:', error);
    res.status(500).json({ message: 'Failed to update scheduled drop' });
  }
});

// DELETE /api/scheduled-drops/:id - Delete/cancel a scheduled drop
router.delete('/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { id } = req.params;

    // Verify ownership
    const [existing] = await db
      .select()
      .from(scheduledDrops)
      .where(and(eq(scheduledDrops.id, id), eq(scheduledDrops.creatorId, userId)));

    if (!existing) {
      return res.status(404).json({ message: 'Scheduled drop not found' });
    }

    // Soft delete by updating status
    await db
      .update(scheduledDrops)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(scheduledDrops.id, id));

    res.json({ message: 'Scheduled drop cancelled' });
  } catch (error) {
    console.error('Error deleting scheduled drop:', error);
    res.status(500).json({ message: 'Failed to delete scheduled drop' });
  }
});

// PATCH /api/creator-profiles/schedule-visibility - Toggle schedule visibility
router.patch('/schedule-visibility', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as any).id;
    const { showScheduleOnProfile } = req.body;

    if (typeof showScheduleOnProfile !== 'boolean') {
      return res.status(400).json({ message: 'showScheduleOnProfile must be a boolean' });
    }

    const [updated] = await db
      .update(creatorProfiles)
      .set({
        showScheduleOnProfile,
        updatedAt: new Date(),
      })
      .where(eq(creatorProfiles.userId, userId))
      .returning();

    if (!updated) {
      return res.status(404).json({ message: 'Creator profile not found' });
    }

    res.json({ showScheduleOnProfile: updated.showScheduleOnProfile });
  } catch (error) {
    console.error('Error updating schedule visibility:', error);
    res.status(500).json({ message: 'Failed to update schedule visibility' });
  }
});

export default router;
