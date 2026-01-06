// @ts-nocheck
/**
 * Forum Routes
 *
 * API routes for community forums:
 * - Categories management
 * - Topics CRUD
 * - Replies CRUD
 * - Polls and voting
 * - Likes and reputation
 * - Moderation (admin only)
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import {
  forumCategories,
  forumTopics,
  forumReplies,
  forumPolls,
  forumPollVotes,
  forumLikes,
  forumReputation,
  forumModerationLog,
  users
} from "@shared/schema";
import { eq, and, desc, asc, sql, like, or, count, inArray } from "drizzle-orm";
import { isAuthenticated, requireAdmin } from "../middleware/auth";
import { logger } from "../logger";
import { fanzDashClient } from "../services/fanzDashClient";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  isCreatorForum: z.boolean().optional(),
});

const createTopicSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(1).max(255),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
  attachmentUrls: z.array(z.string()).optional(),
  poll: z.object({
    question: z.string().min(1).max(255),
    options: z.array(z.string().min(1)).min(2).max(10),
    endsAt: z.string().optional(),
    isMultiChoice: z.boolean().optional(),
  }).optional(),
});

const createReplySchema = z.object({
  content: z.string().min(1),
  parentId: z.string().uuid().optional(),
  attachmentUrls: z.array(z.string()).optional(),
});

const updateTopicSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  content: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

const updateReplySchema = z.object({
  content: z.string().min(1),
});

const moderateSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag', 'pin', 'unpin', 'lock', 'unlock', 'close', 'reopen']),
  reason: z.string().optional(),
});

const voteSchema = z.object({
  optionIndices: z.array(z.number().min(0)),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function updateReputationPoints(userId: string, pointsDelta: number) {
  // Get or create reputation record
  const existing = await db.select().from(forumReputation).where(eq(forumReputation.userId, userId)).limit(1);

  if (existing.length === 0) {
    await db.insert(forumReputation).values({
      userId,
      points: Math.max(0, pointsDelta),
      level: 'newcomer',
    });
  } else {
    const newPoints = Math.max(0, existing[0].points + pointsDelta);
    let level = 'newcomer';
    if (newPoints >= 1001) level = 'expert';
    else if (newPoints >= 501) level = 'trusted';
    else if (newPoints >= 201) level = 'active';
    else if (newPoints >= 51) level = 'member';

    await db.update(forumReputation)
      .set({ points: newPoints, level, updatedAt: new Date() })
      .where(eq(forumReputation.userId, userId));
  }
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * GET /api/forums/categories
 * List all active categories
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await db
      .select({
        id: forumCategories.id,
        name: forumCategories.name,
        slug: forumCategories.slug,
        description: forumCategories.description,
        iconUrl: forumCategories.iconUrl,
        isCreatorForum: forumCategories.isCreatorForum,
        topicsCount: forumCategories.topicsCount,
        postsCount: forumCategories.postsCount,
        lastActivityAt: forumCategories.lastActivityAt,
        creatorId: forumCategories.creatorId,
      })
      .from(forumCategories)
      .where(eq(forumCategories.isActive, true))
      .orderBy(asc(forumCategories.sortOrder));

    res.json({ categories });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch categories');
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

/**
 * GET /api/forums/categories/:slug
 * Get single category with recent topics
 */
router.get("/categories/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    const category = await db
      .select()
      .from(forumCategories)
      .where(and(eq(forumCategories.slug, slug), eq(forumCategories.isActive, true)))
      .limit(1);

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Get topics with author info
    const topics = await db
      .select({
        id: forumTopics.id,
        title: forumTopics.title,
        content: forumTopics.content,
        tags: forumTopics.tags,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        status: forumTopics.status,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        likesCount: forumTopics.likesCount,
        lastReplyAt: forumTopics.lastReplyAt,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(and(
        eq(forumTopics.categoryId, category[0].id),
        eq(forumTopics.moderationStatus, 'approved')
      ))
      .orderBy(desc(forumTopics.isPinned), desc(forumTopics.lastReplyAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(forumTopics)
      .where(and(
        eq(forumTopics.categoryId, category[0].id),
        eq(forumTopics.moderationStatus, 'approved')
      ));

    res.json({
      category: category[0],
      topics,
      pagination: {
        page,
        limit,
        total: totalResult[0].count,
        totalPages: Math.ceil(totalResult[0].count / limit),
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch category');
    res.status(500).json({ message: "Failed to fetch category" });
  }
});

/**
 * GET /api/forums/topics/:id
 * Get single topic with replies
 */
router.get("/topics/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    const topic = await db
      .select({
        id: forumTopics.id,
        categoryId: forumTopics.categoryId,
        title: forumTopics.title,
        content: forumTopics.content,
        tags: forumTopics.tags,
        isPinned: forumTopics.isPinned,
        isLocked: forumTopics.isLocked,
        status: forumTopics.status,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        likesCount: forumTopics.likesCount,
        attachmentUrls: forumTopics.attachmentUrls,
        pollId: forumTopics.pollId,
        createdAt: forumTopics.createdAt,
        updatedAt: forumTopics.updatedAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.id, id))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    // Increment view count
    await db.update(forumTopics)
      .set({ viewsCount: sql`${forumTopics.viewsCount} + 1` })
      .where(eq(forumTopics.id, id));

    // Get replies
    const replies = await db
      .select({
        id: forumReplies.id,
        content: forumReplies.content,
        parentId: forumReplies.parentId,
        attachmentUrls: forumReplies.attachmentUrls,
        likesCount: forumReplies.likesCount,
        isEdited: forumReplies.isEdited,
        isBestAnswer: forumReplies.isBestAnswer,
        createdAt: forumReplies.createdAt,
        updatedAt: forumReplies.updatedAt,
        authorId: forumReplies.authorId,
        authorUsername: users.username,
        authorAvatarUrl: users.avatarUrl,
      })
      .from(forumReplies)
      .leftJoin(users, eq(forumReplies.authorId, users.id))
      .where(and(
        eq(forumReplies.topicId, id),
        eq(forumReplies.moderationStatus, 'auto_approved')
      ))
      .orderBy(asc(forumReplies.createdAt))
      .limit(limit)
      .offset(offset);

    // Get poll if exists
    let poll = null;
    if (topic[0].pollId) {
      const pollData = await db
        .select()
        .from(forumPolls)
        .where(eq(forumPolls.id, topic[0].pollId))
        .limit(1);
      poll = pollData[0] || null;
    }

    // Get total replies count
    const totalResult = await db
      .select({ count: count() })
      .from(forumReplies)
      .where(and(
        eq(forumReplies.topicId, id),
        eq(forumReplies.moderationStatus, 'auto_approved')
      ));

    res.json({
      topic: { ...topic[0], viewsCount: topic[0].viewsCount + 1 },
      replies,
      poll,
      pagination: {
        page,
        limit,
        total: totalResult[0].count,
        totalPages: Math.ceil(totalResult[0].count / limit),
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch topic');
    res.status(500).json({ message: "Failed to fetch topic" });
  }
});

/**
 * GET /api/forums/search
 * Search topics by query
 */
router.get("/search", async (req: Request, res: Response) => {
  try {
    const query = (req.query.q as string) || '';
    const categoryId = req.query.category as string;
    const tag = req.query.tag as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    let conditions = [eq(forumTopics.moderationStatus, 'approved')];

    if (query) {
      conditions.push(or(
        like(forumTopics.title, `%${query}%`),
        like(forumTopics.content, `%${query}%`)
      )!);
    }

    if (categoryId) {
      conditions.push(eq(forumTopics.categoryId, categoryId));
    }

    const topics = await db
      .select({
        id: forumTopics.id,
        categoryId: forumTopics.categoryId,
        title: forumTopics.title,
        content: forumTopics.content,
        tags: forumTopics.tags,
        viewsCount: forumTopics.viewsCount,
        repliesCount: forumTopics.repliesCount,
        likesCount: forumTopics.likesCount,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(forumTopics.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ topics });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to search topics');
    res.status(500).json({ message: "Failed to search topics" });
  }
});

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

/**
 * POST /api/forums/categories
 * Create a new category
 */
router.post("/categories", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const data = createCategorySchema.parse(req.body);

    // Check if slug already exists
    const existing = await db
      .select({ id: forumCategories.id })
      .from(forumCategories)
      .where(eq(forumCategories.slug, data.slug))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Category slug already exists" });
    }

    const [category] = await db.insert(forumCategories).values({
      ...data,
      creatorId: data.isCreatorForum ? userId : null,
    }).returning();

    // Update reputation
    await updateReputationPoints(userId, 5);

    logger.info({ categoryId: category.id, userId }, 'Forum category created');

    // Track to FanzDash
    fanzDashClient.trackForumCategoryCreated(userId, category.id, data.name, data.isCreatorForum || false);

    res.status(201).json({ category });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to create category');
    res.status(500).json({ message: "Failed to create category" });
  }
});

/**
 * POST /api/forums/topics
 * Create a new topic
 */
router.post("/topics", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const data = createTopicSchema.parse(req.body);

    // Verify category exists
    const category = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.id, data.categoryId))
      .limit(1);

    if (category.length === 0) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Check if creator forum requires subscription
    if (category[0].isCreatorForum && category[0].creatorId) {
      // TODO: Check if user is subscribed to creator
    }

    // Create poll if provided
    let pollId = null;
    if (data.poll) {
      const pollOptions = data.poll.options.map((text, index) => ({
        id: index,
        text,
        votes: 0,
      }));

      const [poll] = await db.insert(forumPolls).values({
        topicId: '', // Will be updated after topic creation
        question: data.poll.question,
        options: pollOptions,
        endsAt: data.poll.endsAt ? new Date(data.poll.endsAt) : null,
        isMultiChoice: data.poll.isMultiChoice || false,
      }).returning();
      pollId = poll.id;
    }

    // Create topic
    const [topic] = await db.insert(forumTopics).values({
      categoryId: data.categoryId,
      authorId: userId,
      title: data.title,
      content: data.content,
      tags: data.tags || [],
      attachmentUrls: data.attachmentUrls || [],
      pollId,
      moderationStatus: 'pending', // Topics go through moderation
    }).returning();

    // Update poll with topic ID
    if (pollId) {
      await db.update(forumPolls)
        .set({ topicId: topic.id })
        .where(eq(forumPolls.id, pollId));
    }

    // Update category stats
    await db.update(forumCategories)
      .set({
        topicsCount: sql`${forumCategories.topicsCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(forumCategories.id, data.categoryId));

    // Update reputation
    await updateReputationPoints(userId, 5);

    logger.info({ topicId: topic.id, userId }, 'Forum topic created');

    // Track to FanzDash
    fanzDashClient.trackForumTopicCreated(userId, topic.id, data.categoryId, data.title);

    res.status(201).json({ topic });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to create topic');
    res.status(500).json({ message: "Failed to create topic" });
  }
});

/**
 * POST /api/forums/topics/:id/replies
 * Create a reply to a topic
 */
router.post("/topics/:id/replies", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const topicId = req.params.id;
    const data = createReplySchema.parse(req.body);

    // Verify topic exists and is not locked
    const topic = await db
      .select()
      .from(forumTopics)
      .where(eq(forumTopics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic[0].isLocked) {
      return res.status(403).json({ message: "Topic is locked" });
    }

    // Create reply
    const [reply] = await db.insert(forumReplies).values({
      topicId,
      authorId: userId,
      content: data.content,
      parentId: data.parentId,
      attachmentUrls: data.attachmentUrls || [],
      moderationStatus: 'auto_approved', // Replies auto-approved for now
    }).returning();

    // Update topic stats
    await db.update(forumTopics)
      .set({
        repliesCount: sql`${forumTopics.repliesCount} + 1`,
        lastReplyAt: new Date(),
        lastReplyUserId: userId,
      })
      .where(eq(forumTopics.id, topicId));

    // Update category stats
    await db.update(forumCategories)
      .set({
        postsCount: sql`${forumCategories.postsCount} + 1`,
        lastActivityAt: new Date(),
      })
      .where(eq(forumCategories.id, topic[0].categoryId));

    // Update reputation
    await updateReputationPoints(userId, 2);

    logger.info({ replyId: reply.id, topicId, userId }, 'Forum reply created');

    // Track to FanzDash
    fanzDashClient.trackForumReplyCreated(userId, reply.id, topicId);

    res.status(201).json({ reply });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to create reply');
    res.status(500).json({ message: "Failed to create reply" });
  }
});

/**
 * POST /api/forums/topics/:id/like
 * Like/unlike a topic
 */
router.post("/topics/:id/like", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const topicId = req.params.id;

    // Check if already liked
    const existing = await db
      .select()
      .from(forumLikes)
      .where(and(eq(forumLikes.userId, userId), eq(forumLikes.topicId, topicId)))
      .limit(1);

    if (existing.length > 0) {
      // Unlike
      await db.delete(forumLikes).where(eq(forumLikes.id, existing[0].id));
      await db.update(forumTopics)
        .set({ likesCount: sql`${forumTopics.likesCount} - 1` })
        .where(eq(forumTopics.id, topicId));

      // Get topic author and decrease their reputation
      const topic = await db.select({ authorId: forumTopics.authorId }).from(forumTopics).where(eq(forumTopics.id, topicId)).limit(1);
      if (topic.length > 0) {
        await updateReputationPoints(topic[0].authorId, -1);
      }

      res.json({ liked: false });
    } else {
      // Like
      await db.insert(forumLikes).values({ userId, topicId });
      await db.update(forumTopics)
        .set({ likesCount: sql`${forumTopics.likesCount} + 1` })
        .where(eq(forumTopics.id, topicId));

      // Get topic author and increase their reputation
      const topic = await db.select({ authorId: forumTopics.authorId }).from(forumTopics).where(eq(forumTopics.id, topicId)).limit(1);
      if (topic.length > 0) {
        await updateReputationPoints(topic[0].authorId, 1);
      }

      res.json({ liked: true });
    }
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to toggle topic like');
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

/**
 * POST /api/forums/replies/:id/like
 * Like/unlike a reply
 */
router.post("/replies/:id/like", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const replyId = req.params.id;

    // Check if already liked
    const existing = await db
      .select()
      .from(forumLikes)
      .where(and(eq(forumLikes.userId, userId), eq(forumLikes.replyId, replyId)))
      .limit(1);

    if (existing.length > 0) {
      // Unlike
      await db.delete(forumLikes).where(eq(forumLikes.id, existing[0].id));
      await db.update(forumReplies)
        .set({ likesCount: sql`${forumReplies.likesCount} - 1` })
        .where(eq(forumReplies.id, replyId));

      const reply = await db.select({ authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, replyId)).limit(1);
      if (reply.length > 0) {
        await updateReputationPoints(reply[0].authorId, -1);
      }

      res.json({ liked: false });
    } else {
      // Like
      await db.insert(forumLikes).values({ userId, replyId });
      await db.update(forumReplies)
        .set({ likesCount: sql`${forumReplies.likesCount} + 1` })
        .where(eq(forumReplies.id, replyId));

      const reply = await db.select({ authorId: forumReplies.authorId }).from(forumReplies).where(eq(forumReplies.id, replyId)).limit(1);
      if (reply.length > 0) {
        await updateReputationPoints(reply[0].authorId, 1);
      }

      res.json({ liked: true });
    }
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to toggle reply like');
    res.status(500).json({ message: "Failed to toggle like" });
  }
});

/**
 * POST /api/forums/polls/:id/vote
 * Vote on a poll
 */
router.post("/polls/:id/vote", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const pollId = req.params.id;
    const data = voteSchema.parse(req.body);

    // Get poll
    const poll = await db
      .select()
      .from(forumPolls)
      .where(eq(forumPolls.id, pollId))
      .limit(1);

    if (poll.length === 0) {
      return res.status(404).json({ message: "Poll not found" });
    }

    // Check if poll has ended
    if (poll[0].endsAt && new Date(poll[0].endsAt) < new Date()) {
      return res.status(400).json({ message: "Poll has ended" });
    }

    // Check if already voted
    const existing = await db
      .select()
      .from(forumPollVotes)
      .where(and(eq(forumPollVotes.pollId, pollId), eq(forumPollVotes.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ message: "Already voted" });
    }

    // Validate option indices
    const options = poll[0].options as any[];
    for (const idx of data.optionIndices) {
      if (idx < 0 || idx >= options.length) {
        return res.status(400).json({ message: "Invalid option index" });
      }
    }

    if (!poll[0].isMultiChoice && data.optionIndices.length > 1) {
      return res.status(400).json({ message: "Only one option allowed" });
    }

    // Record vote
    await db.insert(forumPollVotes).values({
      pollId,
      userId,
      optionIndices: data.optionIndices,
    });

    // Update poll options vote counts
    const updatedOptions = options.map((opt, idx) => ({
      ...opt,
      votes: data.optionIndices.includes(idx) ? opt.votes + 1 : opt.votes,
    }));

    await db.update(forumPolls)
      .set({
        options: updatedOptions,
        totalVotes: sql`${forumPolls.totalVotes} + 1`,
      })
      .where(eq(forumPolls.id, pollId));

    res.json({ success: true, options: updatedOptions });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to vote on poll');
    res.status(500).json({ message: "Failed to vote" });
  }
});

/**
 * PUT /api/forums/topics/:id
 * Edit a topic (author only)
 */
router.put("/topics/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const topicId = req.params.id;
    const data = updateTopicSchema.parse(req.body);

    const topic = await db
      .select()
      .from(forumTopics)
      .where(eq(forumTopics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic[0].authorId !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this topic" });
    }

    const [updated] = await db.update(forumTopics)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(forumTopics.id, topicId))
      .returning();

    res.json({ topic: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to update topic');
    res.status(500).json({ message: "Failed to update topic" });
  }
});

/**
 * PUT /api/forums/replies/:id
 * Edit a reply (author only)
 */
router.put("/replies/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const replyId = req.params.id;
    const data = updateReplySchema.parse(req.body);

    const reply = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, replyId))
      .limit(1);

    if (reply.length === 0) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply[0].authorId !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this reply" });
    }

    const [updated] = await db.update(forumReplies)
      .set({ content: data.content, isEdited: true, updatedAt: new Date() })
      .where(eq(forumReplies.id, replyId))
      .returning();

    res.json({ reply: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to update reply');
    res.status(500).json({ message: "Failed to update reply" });
  }
});

/**
 * DELETE /api/forums/topics/:id
 * Delete a topic (author or admin only)
 */
router.delete("/topics/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const topicId = req.params.id;

    const topic = await db
      .select()
      .from(forumTopics)
      .where(eq(forumTopics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    if (topic[0].authorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this topic" });
    }

    await db.delete(forumTopics).where(eq(forumTopics.id, topicId));

    // Update category stats
    await db.update(forumCategories)
      .set({ topicsCount: sql`${forumCategories.topicsCount} - 1` })
      .where(eq(forumCategories.id, topic[0].categoryId));

    logger.info({ topicId, userId }, 'Forum topic deleted');
    res.json({ success: true });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to delete topic');
    res.status(500).json({ message: "Failed to delete topic" });
  }
});

/**
 * DELETE /api/forums/replies/:id
 * Delete a reply (author or admin only)
 */
router.delete("/replies/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const replyId = req.params.id;

    const reply = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.id, replyId))
      .limit(1);

    if (reply.length === 0) {
      return res.status(404).json({ message: "Reply not found" });
    }

    if (reply[0].authorId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: "Not authorized to delete this reply" });
    }

    await db.delete(forumReplies).where(eq(forumReplies.id, replyId));

    // Update topic stats
    await db.update(forumTopics)
      .set({ repliesCount: sql`${forumTopics.repliesCount} - 1` })
      .where(eq(forumTopics.id, reply[0].topicId));

    logger.info({ replyId, userId }, 'Forum reply deleted');
    res.json({ success: true });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to delete reply');
    res.status(500).json({ message: "Failed to delete reply" });
  }
});

// ============================================================
// ADMIN MODERATION ROUTES
// ============================================================

/**
 * GET /api/forums/admin/topics
 * List all topics for moderation
 */
router.get("/admin/topics", requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string || 'pending';
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = (page - 1) * limit;

    const topics = await db
      .select({
        id: forumTopics.id,
        categoryId: forumTopics.categoryId,
        title: forumTopics.title,
        content: forumTopics.content,
        moderationStatus: forumTopics.moderationStatus,
        createdAt: forumTopics.createdAt,
        authorId: forumTopics.authorId,
        authorUsername: users.username,
        authorEmail: users.email,
      })
      .from(forumTopics)
      .leftJoin(users, eq(forumTopics.authorId, users.id))
      .where(eq(forumTopics.moderationStatus, status as any))
      .orderBy(desc(forumTopics.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(forumTopics)
      .where(eq(forumTopics.moderationStatus, status as any));

    res.json({
      topics,
      pagination: {
        page,
        limit,
        total: totalResult[0].count,
        totalPages: Math.ceil(totalResult[0].count / limit),
      },
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch topics for moderation');
    res.status(500).json({ message: "Failed to fetch topics" });
  }
});

/**
 * PUT /api/forums/admin/topics/:id/moderate
 * Moderate a topic (approve/reject/flag/pin/lock)
 */
router.put("/admin/topics/:id/moderate", requireAdmin, async (req: Request, res: Response) => {
  try {
    const moderatorId = (req as any).user?.id;
    const topicId = req.params.id;
    const data = moderateSchema.parse(req.body);

    const topic = await db
      .select()
      .from(forumTopics)
      .where(eq(forumTopics.id, topicId))
      .limit(1);

    if (topic.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const updates: any = {
      moderatedBy: moderatorId,
      moderatedAt: new Date(),
      moderationNotes: data.reason,
      updatedAt: new Date(),
    };

    switch (data.action) {
      case 'approve':
        updates.moderationStatus = 'approved';
        break;
      case 'reject':
        updates.moderationStatus = 'rejected';
        break;
      case 'flag':
        updates.moderationStatus = 'flagged';
        break;
      case 'pin':
        updates.isPinned = true;
        break;
      case 'unpin':
        updates.isPinned = false;
        break;
      case 'lock':
        updates.isLocked = true;
        break;
      case 'unlock':
        updates.isLocked = false;
        break;
      case 'close':
        updates.status = 'closed';
        break;
      case 'reopen':
        updates.status = 'open';
        break;
    }

    const [updated] = await db.update(forumTopics)
      .set(updates)
      .where(eq(forumTopics.id, topicId))
      .returning();

    // Log moderation action
    await db.insert(forumModerationLog).values({
      moderatorId,
      targetType: 'topic',
      targetId: topicId,
      action: data.action,
      reason: data.reason,
      previousStatus: topic[0].moderationStatus,
      newStatus: updates.moderationStatus || topic[0].moderationStatus,
    });

    logger.info({ topicId, action: data.action, moderatorId }, 'Forum topic moderated');

    // Track to FanzDash
    fanzDashClient.trackForumModeration(topicId, data.action, data.reason || null, moderatorId);

    res.json({ topic: updated });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid input", errors: error.errors });
    }
    logger.error({ err: error }, 'Failed to moderate topic');
    res.status(500).json({ message: "Failed to moderate topic" });
  }
});

/**
 * GET /api/forums/admin/stats
 * Get forum statistics
 */
router.get("/admin/stats", requireAdmin, async (req: Request, res: Response) => {
  try {
    const [categoriesCount] = await db.select({ count: count() }).from(forumCategories);
    const [topicsCount] = await db.select({ count: count() }).from(forumTopics);
    const [repliesCount] = await db.select({ count: count() }).from(forumReplies);
    const [pendingCount] = await db.select({ count: count() }).from(forumTopics).where(eq(forumTopics.moderationStatus, 'pending'));
    const [flaggedCount] = await db.select({ count: count() }).from(forumTopics).where(eq(forumTopics.moderationStatus, 'flagged'));

    res.json({
      categories: categoriesCount.count,
      topics: topicsCount.count,
      replies: repliesCount.count,
      pending: pendingCount.count,
      flagged: flaggedCount.count,
    });
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch forum stats');
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

/**
 * GET /api/forums/reputation/:userId
 * Get user's forum reputation
 */
router.get("/reputation/:userId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const reputation = await db
      .select()
      .from(forumReputation)
      .where(eq(forumReputation.userId, userId))
      .limit(1);

    if (reputation.length === 0) {
      return res.json({
        points: 0,
        level: 'newcomer',
        badges: [],
        topicsCount: 0,
        repliesCount: 0,
        bestAnswersCount: 0,
        likesReceivedCount: 0,
      });
    }

    res.json(reputation[0]);
  } catch (error: any) {
    logger.error({ err: error }, 'Failed to fetch reputation');
    res.status(500).json({ message: "Failed to fetch reputation" });
  }
});

export default router;
