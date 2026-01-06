// @ts-nocheck
/**
 * Blog Routes
 *
 * API routes for platform and creator blogs with SEO optimization:
 * - Platform blog posts (news, tutorials, etc.)
 * - Creator blog posts
 * - Comments and likes
 * - SEO metadata
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { blogPosts, blogComments, blogLikes, users } from "@shared/schema";
import { eq, and, desc, asc, sql, like, or, count, ilike } from "drizzle-orm";
import { isAuthenticated, requireAdmin, requireCreatorOrAdmin } from "../middleware/auth";
import { logger } from "../logger";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const createPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().optional(),
  content: z.string().min(1),
  coverImage: z.string().optional(),
  category: z.string().default("general"),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  scheduledFor: z.string().optional(),
  seoTitle: z.string().max(60).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isPinned: z.boolean().default(false),
  allowComments: z.boolean().default(true),
  isCreatorBlog: z.boolean().default(false),
});

const createCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().uuid().optional(),
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]+>/g, "").split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ============================================================
// PUBLIC ROUTES
// ============================================================

/**
 * Get all published blog posts
 * GET /api/blog/posts
 */
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      category,
      search,
      featured,
      creatorId,
      isCreatorBlog
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 50);
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const conditions = [eq(blogPosts.status, "published")];

    if (category && category !== "all") {
      conditions.push(eq(blogPosts.category, category as string));
    }

    if (search) {
      conditions.push(
        or(
          ilike(blogPosts.title, `%${search}%`),
          ilike(blogPosts.excerpt, `%${search}%`)
        )!
      );
    }

    if (featured === "true") {
      conditions.push(eq(blogPosts.isFeatured, true));
    }

    if (creatorId) {
      conditions.push(eq(blogPosts.authorId, creatorId as string));
    }

    if (isCreatorBlog !== undefined) {
      conditions.push(eq(blogPosts.isCreatorBlog, isCreatorBlog === "true"));
    }

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        commentsCount: blogPosts.commentsCount,
        readingTime: blogPosts.readingTime,
        isFeatured: blogPosts.isFeatured,
        isPinned: blogPosts.isPinned,
        isCreatorBlog: blogPosts.isCreatorBlog,
        authorId: blogPosts.authorId,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(and(...conditions))
      .orderBy(desc(blogPosts.isPinned), desc(blogPosts.publishedAt))
      .limit(limitNum)
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(and(...conditions));

    const total = totalResult[0]?.count || 0;

    return res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching blog posts");
    return res.status(500).json({ error: "Failed to fetch blog posts" });
  }
});

/**
 * Get featured blog posts
 * GET /api/blog/posts/featured
 */
router.get("/posts/featured", async (req: Request, res: Response) => {
  try {
    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        publishedAt: blogPosts.publishedAt,
        readingTime: blogPosts.readingTime,
        authorUsername: users.username,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(and(
        eq(blogPosts.status, "published"),
        eq(blogPosts.isFeatured, true)
      ))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(5);

    return res.json(posts);
  } catch (error) {
    logger.error({ err: error }, "Error fetching featured posts");
    return res.status(500).json({ error: "Failed to fetch featured posts" });
  }
});

/**
 * Get single blog post by slug
 * GET /api/blog/posts/:slug
 */
router.get("/posts/:slug", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const post = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        content: blogPosts.content,
        coverImage: blogPosts.coverImage,
        category: blogPosts.category,
        tags: blogPosts.tags,
        publishedAt: blogPosts.publishedAt,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        commentsCount: blogPosts.commentsCount,
        readingTime: blogPosts.readingTime,
        seoTitle: blogPosts.seoTitle,
        seoDescription: blogPosts.seoDescription,
        seoKeywords: blogPosts.seoKeywords,
        allowComments: blogPosts.allowComments,
        isCreatorBlog: blogPosts.isCreatorBlog,
        authorId: blogPosts.authorId,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
        authorBio: users.bio,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(and(
        eq(blogPosts.slug, slug),
        eq(blogPosts.status, "published")
      ))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Increment view count
    await db
      .update(blogPosts)
      .set({ viewsCount: sql`${blogPosts.viewsCount} + 1` })
      .where(eq(blogPosts.slug, slug));

    return res.json(post[0]);
  } catch (error) {
    logger.error({ err: error }, "Error fetching blog post");
    return res.status(500).json({ error: "Failed to fetch blog post" });
  }
});

/**
 * Get blog categories
 * GET /api/blog/categories
 */
router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await db
      .select({
        category: blogPosts.category,
        count: count(),
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .groupBy(blogPosts.category);

    return res.json(categories);
  } catch (error) {
    logger.error({ err: error }, "Error fetching categories");
    return res.status(500).json({ error: "Failed to fetch categories" });
  }
});

/**
 * Get comments for a post
 * GET /api/blog/posts/:slug/comments
 */
router.get("/posts/:slug/comments", async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    // Get post ID
    const post = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    const comments = await db
      .select({
        id: blogComments.id,
        content: blogComments.content,
        parentId: blogComments.parentId,
        likesCount: blogComments.likesCount,
        createdAt: blogComments.createdAt,
        authorId: blogComments.authorId,
        authorUsername: users.username,
        authorAvatar: users.avatarUrl,
      })
      .from(blogComments)
      .leftJoin(users, eq(blogComments.authorId, users.id))
      .where(and(
        eq(blogComments.postId, post[0].id),
        eq(blogComments.isApproved, true)
      ))
      .orderBy(asc(blogComments.createdAt));

    return res.json(comments);
  } catch (error) {
    logger.error({ err: error }, "Error fetching comments");
    return res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ============================================================
// AUTHENTICATED ROUTES
// ============================================================

/**
 * Create a blog post (creator or admin)
 * POST /api/blog/posts
 */
router.post("/posts", isAuthenticated, requireCreatorOrAdmin, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const validation = createPostSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const data = validation.data;
    const readingTime = calculateReadingTime(data.content);

    // Generate slug if not provided or auto-generate
    const slug = data.slug || generateSlug(data.title);

    // Check slug uniqueness
    const existingPost = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (existingPost.length > 0) {
      return res.status(400).json({ error: "Slug already exists" });
    }

    const newPost = await db
      .insert(blogPosts)
      .values({
        authorId: userId,
        title: data.title,
        slug,
        excerpt: data.excerpt,
        content: data.content,
        coverImage: data.coverImage,
        category: data.category,
        tags: data.tags,
        status: data.status,
        publishedAt: data.status === "published" ? new Date() : null,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        seoTitle: data.seoTitle || data.title.substring(0, 60),
        seoDescription: data.seoDescription || data.excerpt?.substring(0, 160),
        seoKeywords: data.seoKeywords,
        readingTime,
        isFeatured: data.isFeatured,
        isPinned: data.isPinned,
        allowComments: data.allowComments,
        isCreatorBlog: data.isCreatorBlog,
      })
      .returning();

    logger.info({ postId: newPost[0].id, author: userId }, "Blog post created");
    return res.status(201).json(newPost[0]);
  } catch (error) {
    logger.error({ err: error }, "Error creating blog post");
    return res.status(500).json({ error: "Failed to create blog post" });
  }
});

/**
 * Update a blog post
 * PUT /api/blog/posts/:id
 */
router.put("/posts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    // Check ownership
    const post = await db
      .select({ authorId: blogPosts.authorId })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post[0].authorId !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to edit this post" });
    }

    const validation = createPostSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    const data = validation.data;
    const updateData: any = { ...data, updatedAt: new Date() };

    if (data.content) {
      updateData.readingTime = calculateReadingTime(data.content);
    }

    if (data.status === "published" && !post[0].authorId) {
      updateData.publishedAt = new Date();
    }

    const updated = await db
      .update(blogPosts)
      .set(updateData)
      .where(eq(blogPosts.id, id))
      .returning();

    return res.json(updated[0]);
  } catch (error) {
    logger.error({ err: error }, "Error updating blog post");
    return res.status(500).json({ error: "Failed to update blog post" });
  }
});

/**
 * Delete a blog post
 * DELETE /api/blog/posts/:id
 */
router.delete("/posts/:id", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { id } = req.params;

    const post = await db
      .select({ authorId: blogPosts.authorId })
      .from(blogPosts)
      .where(eq(blogPosts.id, id))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (post[0].authorId !== userId && userRole !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this post" });
    }

    await db.delete(blogPosts).where(eq(blogPosts.id, id));

    return res.json({ success: true, message: "Post deleted" });
  } catch (error) {
    logger.error({ err: error }, "Error deleting blog post");
    return res.status(500).json({ error: "Failed to delete blog post" });
  }
});

/**
 * Add a comment to a post
 * POST /api/blog/posts/:slug/comments
 */
router.post("/posts/:slug/comments", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { slug } = req.params;

    const validation = createCommentSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors });
    }

    // Get post
    const post = await db
      .select({ id: blogPosts.id, allowComments: blogPosts.allowComments })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    if (!post[0].allowComments) {
      return res.status(400).json({ error: "Comments are disabled for this post" });
    }

    const comment = await db
      .insert(blogComments)
      .values({
        postId: post[0].id,
        authorId: userId,
        content: validation.data.content,
        parentId: validation.data.parentId,
      })
      .returning();

    // Update comment count
    await db
      .update(blogPosts)
      .set({ commentsCount: sql`${blogPosts.commentsCount} + 1` })
      .where(eq(blogPosts.id, post[0].id));

    return res.status(201).json(comment[0]);
  } catch (error) {
    logger.error({ err: error }, "Error creating comment");
    return res.status(500).json({ error: "Failed to create comment" });
  }
});

/**
 * Like a blog post
 * POST /api/blog/posts/:slug/like
 */
router.post("/posts/:slug/like", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { slug } = req.params;

    const post = await db
      .select({ id: blogPosts.id })
      .from(blogPosts)
      .where(eq(blogPosts.slug, slug))
      .limit(1);

    if (post.length === 0) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if already liked
    const existingLike = await db
      .select({ id: blogLikes.id })
      .from(blogLikes)
      .where(and(
        eq(blogLikes.postId, post[0].id),
        eq(blogLikes.userId, userId)
      ))
      .limit(1);

    if (existingLike.length > 0) {
      // Unlike
      await db.delete(blogLikes).where(eq(blogLikes.id, existingLike[0].id));
      await db
        .update(blogPosts)
        .set({ likesCount: sql`GREATEST(${blogPosts.likesCount} - 1, 0)` })
        .where(eq(blogPosts.id, post[0].id));
      return res.json({ liked: false });
    }

    // Like
    await db.insert(blogLikes).values({
      postId: post[0].id,
      userId,
    });
    await db
      .update(blogPosts)
      .set({ likesCount: sql`${blogPosts.likesCount} + 1` })
      .where(eq(blogPosts.id, post[0].id));

    return res.json({ liked: true });
  } catch (error) {
    logger.error({ err: error }, "Error liking post");
    return res.status(500).json({ error: "Failed to like post" });
  }
});

/**
 * Get my blog posts (creator dashboard)
 * GET /api/blog/my-posts
 */
router.get("/my-posts", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { status } = req.query;

    const conditions = [eq(blogPosts.authorId, userId)];
    if (status) {
      conditions.push(eq(blogPosts.status, status as string));
    }

    const posts = await db
      .select()
      .from(blogPosts)
      .where(and(...conditions))
      .orderBy(desc(blogPosts.createdAt));

    return res.json(posts);
  } catch (error) {
    logger.error({ err: error }, "Error fetching my posts");
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

/**
 * Get all blog posts (admin)
 * GET /api/blog/admin/posts
 */
router.get("/admin/posts", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "20", status, category } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(blogPosts.status, status as string));
    if (category) conditions.push(eq(blogPosts.category, category as string));

    const posts = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        status: blogPosts.status,
        category: blogPosts.category,
        publishedAt: blogPosts.publishedAt,
        viewsCount: blogPosts.viewsCount,
        likesCount: blogPosts.likesCount,
        isFeatured: blogPosts.isFeatured,
        isCreatorBlog: blogPosts.isCreatorBlog,
        authorUsername: users.username,
        createdAt: blogPosts.createdAt,
      })
      .from(blogPosts)
      .leftJoin(users, eq(blogPosts.authorId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(blogPosts.createdAt))
      .limit(limitNum)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(blogPosts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return res.json({
      posts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalResult[0]?.count || 0,
        totalPages: Math.ceil((totalResult[0]?.count || 0) / limitNum),
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error fetching admin posts");
    return res.status(500).json({ error: "Failed to fetch posts" });
  }
});

/**
 * Feature/unfeature a post (admin)
 * PUT /api/blog/admin/posts/:id/feature
 */
router.put("/admin/posts/:id/feature", requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;

    await db
      .update(blogPosts)
      .set({ isFeatured: featured })
      .where(eq(blogPosts.id, id));

    return res.json({ success: true });
  } catch (error) {
    logger.error({ err: error }, "Error featuring post");
    return res.status(500).json({ error: "Failed to feature post" });
  }
});

export default router;
