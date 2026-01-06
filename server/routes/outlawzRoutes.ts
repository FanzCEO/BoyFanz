/**
 * OUTLAWZ PROGRAM API ROUTES
 * "Banned elsewhere? Be legendary here."
 *
 * This module provides API endpoints for the Outlawz Program, which showcases
 * creators who have been banned from competitor platforms.
 *
 * @module routes/outlawzRoutes
 * @author Joshua Stone
 * @license FANZ Group Holdings LLC
 * @date 2025-11-02
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { authenticateToken } from "../middleware/auth";
import { requireRole } from "../middleware/roleCheck";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const outlawzApplicationSchema = z.object({
  bannedFrom: z.array(z.string()).min(1, "At least one platform is required"),
  bannedReason: z.string().optional(),
  bannedReasonTag: z.enum(['tos', 'dmca', 'content', 'behavior', 'other']).optional(),
  applicationText: z.string().min(50, "Please provide at least 50 characters explaining your situation").max(2000),
  proofDocuments: z.array(z.object({
    type: z.string(),
    url: z.string().url(),
    platform: z.string(),
    banDate: z.string().optional()
  })).optional()
});

const outlawzClipSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  tags: z.array(z.string()).optional(),
  assetId: z.string().optional(),
  videoUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  durationSeconds: z.number().int().positive(),
  safeExcerptStart: z.number().int().min(0).optional(),
  safeExcerptEnd: z.number().int().min(0).optional(),
  verticals: z.array(z.string()).optional(),
  consentHash: z.string().optional()
});

const outlawzReviewSchema = z.object({
  status: z.enum(['approved', 'rejected', 'under_review']),
  verificationNotes: z.string().optional(),
  rejectionReason: z.string().optional(),
  isFeatured: z.boolean().optional(),
  badgeTier: z.enum(['outlawz', 'legend', 'icon']).optional()
});

// ============================================================
// PUBLIC ROUTES - Outlawz Showcase
// ============================================================

/**
 * GET /api/outlawz/showcase
 * Get published Outlawz clips for the showcase
 * Query params: vertical, limit, offset, sort
 */
router.get("/showcase", async (req: Request, res: Response) => {
  try {
    const vertical = req.query.vertical as string | undefined;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const sort = req.query.sort as string || 'newest'; // newest, trending, views

    let query = `
      SELECT
        oc.*,
        op.badge_tier,
        op.banned_from,
        u.username,
        u.display_name,
        u.avatar_url
      FROM outlawz_clips oc
      JOIN outlawz_profiles op ON oc.outlawz_profile_id = op.id
      JOIN users u ON oc.creator_id = u.id
      WHERE oc.is_published = TRUE
        AND oc.deleted_at IS NULL
        AND oc.compliance_status = 'approved'
        AND op.status = 'approved'
        AND op.deleted_at IS NULL
    `;

    const params: any[] = [];

    // Filter by vertical if specified
    if (vertical) {
      params.push(vertical);
      query += ` AND $${params.length} = ANY(oc.verticals)`;
    }

    // Sorting
    switch (sort) {
      case 'trending':
        query += ` ORDER BY oc.view_count DESC, oc.published_at DESC`;
        break;
      case 'views':
        query += ` ORDER BY oc.view_count DESC`;
        break;
      case 'newest':
      default:
        query += ` ORDER BY oc.published_at DESC`;
    }

    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        clips: result.rows,
        count: result.rows.length,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching Outlawz showcase:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Outlawz showcase'
    });
  }
});

/**
 * GET /api/outlawz/profiles
 * Get active Outlawz profiles
 * Query params: limit, offset, featured
 */
router.get("/profiles", async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const featured = req.query.featured === 'true';

    let query = `
      SELECT * FROM view_active_outlawz
      WHERE 1=1
    `;

    const params: any[] = [];

    if (featured) {
      query += ` AND is_featured = TRUE`;
    }

    query += ` ORDER BY showcase_priority DESC, verified_at DESC`;

    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: {
        profiles: result.rows,
        count: result.rows.length,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching Outlawz profiles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Outlawz profiles'
    });
  }
});

/**
 * GET /api/outlawz/profile/:creatorId
 * Get a specific creator's Outlawz profile
 */
router.get("/profile/:creatorId", async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.params;

    const profileResult = await db.query(`
      SELECT * FROM view_active_outlawz
      WHERE creator_id = $1
    `, [creatorId]);

    if (profileResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Outlawz profile not found'
      });
    }

    const clipsResult = await db.query(`
      SELECT * FROM view_published_outlawz_clips
      WHERE creator_id = $1
      ORDER BY published_at DESC
    `, [creatorId]);

    res.json({
      success: true,
      data: {
        profile: profileResult.rows[0],
        clips: clipsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching Outlawz profile:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch Outlawz profile'
    });
  }
});

// ============================================================
// AUTHENTICATED CREATOR ROUTES
// ============================================================

/**
 * POST /api/outlawz/apply
 * Submit an application to join the Outlawz program
 * Requires authentication
 */
router.post("/apply", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const validatedData = outlawzApplicationSchema.parse(req.body);

    // Check if user already has an Outlawz profile
    const existing = await db.query(`
      SELECT id FROM outlawz_profiles
      WHERE creator_id = $1 AND deleted_at IS NULL
    `, [userId]);

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to the Outlawz program'
      });
    }

    // Create Outlawz profile
    const result = await db.query(`
      INSERT INTO outlawz_profiles (
        creator_id,
        banned_from,
        banned_reason,
        banned_reason_tag,
        application_text,
        status
      ) VALUES ($1, $2, $3, $4, $5, 'pending')
      RETURNING *
    `, [
      userId,
      validatedData.bannedFrom,
      validatedData.bannedReason || null,
      validatedData.bannedReasonTag || null,
      validatedData.applicationText
    ]);

    const profileId = result.rows[0].id;

    // Save proof documents if provided
    if (validatedData.proofDocuments && validatedData.proofDocuments.length > 0) {
      for (const doc of validatedData.proofDocuments) {
        await db.query(`
          INSERT INTO outlawz_verification_documents (
            outlawz_profile_id,
            uploaded_by,
            document_type,
            file_url,
            platform_name,
            ban_date
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          profileId,
          userId,
          doc.type,
          doc.url,
          doc.platform,
          doc.banDate || null
        ]);
      }
    }

    // TODO: Emit event to event bus: outlawz.applied
    // await eventBus.publish('outlawz.applied', { profileId, creatorId: userId });

    res.status(201).json({
      success: true,
      message: 'Your Outlawz application has been submitted successfully',
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    console.error('Error submitting Outlawz application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    });
  }
});

/**
 * GET /api/outlawz/my-application
 * Get the current user's Outlawz application status
 */
router.get("/my-application", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await db.query(`
      SELECT
        op.*,
        array_agg(
          json_build_object(
            'id', ovd.id,
            'type', ovd.document_type,
            'url', ovd.file_url,
            'platform', ovd.platform_name,
            'isVerified', ovd.is_verified
          )
        ) FILTER (WHERE ovd.id IS NOT NULL) as documents
      FROM outlawz_profiles op
      LEFT JOIN outlawz_verification_documents ovd ON op.id = ovd.outlawz_profile_id
      WHERE op.creator_id = $1 AND op.deleted_at IS NULL
      GROUP BY op.id
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No application found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching Outlawz application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch application'
    });
  }
});

/**
 * POST /api/outlawz/clip
 * Upload a clip to the Outlawz showcase
 * Requires approved Outlawz profile
 */
router.post("/clip", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const validatedData = outlawzClipSchema.parse(req.body);

    // Verify user has approved Outlawz profile
    const profileResult = await db.query(`
      SELECT id FROM outlawz_profiles
      WHERE creator_id = $1 AND status = 'approved' AND deleted_at IS NULL
    `, [userId]);

    if (profileResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'You must have an approved Outlawz profile to upload clips'
      });
    }

    const profileId = profileResult.rows[0].id;

    // Create clip
    const result = await db.query(`
      INSERT INTO outlawz_clips (
        outlawz_profile_id,
        creator_id,
        title,
        description,
        tags,
        asset_id,
        video_url,
        thumbnail_url,
        duration_seconds,
        safe_excerpt_start,
        safe_excerpt_end,
        verticals,
        consent_hash,
        compliance_status,
        is_published
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending', FALSE)
      RETURNING *
    `, [
      profileId,
      userId,
      validatedData.title,
      validatedData.description || null,
      validatedData.tags || [],
      validatedData.assetId || null,
      validatedData.videoUrl,
      validatedData.thumbnailUrl || null,
      validatedData.durationSeconds,
      validatedData.safeExcerptStart || null,
      validatedData.safeExcerptEnd || null,
      validatedData.verticals || ['boyfanz'], // Default to current platform
      validatedData.consentHash || null
    ]);

    // TODO: Emit event to event bus: outlawz.clip.uploaded
    // await eventBus.publish('outlawz.clip.uploaded', { clipId: result.rows[0].id });

    res.status(201).json({
      success: true,
      message: 'Clip uploaded successfully and pending review',
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    console.error('Error uploading Outlawz clip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload clip'
    });
  }
});

/**
 * GET /api/outlawz/my-clips
 * Get current user's Outlawz clips
 */
router.get("/my-clips", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const result = await db.query(`
      SELECT * FROM outlawz_clips
      WHERE creator_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `, [userId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching user clips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clips'
    });
  }
});

// ============================================================
// ADMIN ROUTES - For FanzDash & HubVault Staff
// ============================================================

/**
 * GET /api/outlawz/admin/pending
 * Get pending Outlawz applications for review
 * Requires staff/admin role
 */
router.get("/admin/pending", authenticateToken, requireRole(['staff', 'admin']), async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string || 'pending';
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await db.query(`
      SELECT
        op.*,
        u.username,
        u.display_name,
        u.email,
        u.avatar_url,
        u.created_at as user_joined_at,
        COUNT(ovd.id) as document_count
      FROM outlawz_profiles op
      JOIN users u ON op.creator_id = u.id
      LEFT JOIN outlawz_verification_documents ovd ON op.id = ovd.outlawz_profile_id
      WHERE op.status = $1 AND op.deleted_at IS NULL
      GROUP BY op.id, u.id
      ORDER BY op.application_date ASC
      LIMIT $2 OFFSET $3
    `, [status, limit, offset]);

    res.json({
      success: true,
      data: {
        applications: result.rows,
        count: result.rows.length,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch applications'
    });
  }
});

/**
 * POST /api/outlawz/admin/review/:profileId
 * Review and approve/reject an Outlawz application
 * Requires staff/admin role
 */
router.post("/admin/review/:profileId", authenticateToken, requireRole(['staff', 'admin']), async (req: Request, res: Response) => {
  try {
    const { profileId } = req.params;
    const reviewerId = (req as any).user.id;
    const validatedData = outlawzReviewSchema.parse(req.body);

    const result = await db.query(`
      UPDATE outlawz_profiles
      SET
        status = $1,
        verified_by = $2,
        verified_at = $3,
        verification_notes = $4,
        rejection_reason = $5,
        is_featured = $6,
        badge_tier = $7
      WHERE id = $8 AND deleted_at IS NULL
      RETURNING *
    `, [
      validatedData.status,
      reviewerId,
      new Date(),
      validatedData.verificationNotes || null,
      validatedData.rejectionReason || null,
      validatedData.isFeatured || false,
      validatedData.badgeTier || 'outlawz',
      profileId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Profile not found'
      });
    }

    // TODO: Emit event to event bus
    if (validatedData.status === 'approved') {
      // await eventBus.publish('outlawz.approved', { profileId });
    } else if (validatedData.status === 'rejected') {
      // await eventBus.publish('outlawz.rejected', { profileId });
    }

    res.json({
      success: true,
      message: `Application ${validatedData.status}`,
      data: result.rows[0]
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    }
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to review application'
    });
  }
});

/**
 * GET /api/outlawz/admin/clips/pending
 * Get pending Outlawz clips for content review
 * Requires staff/admin role
 */
router.get("/admin/clips/pending", authenticateToken, requireRole(['staff', 'admin']), async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;

    const result = await db.query(`
      SELECT
        oc.*,
        u.username,
        u.display_name,
        op.badge_tier,
        op.banned_from
      FROM outlawz_clips oc
      JOIN outlawz_profiles op ON oc.outlawz_profile_id = op.id
      JOIN users u ON oc.creator_id = u.id
      WHERE oc.compliance_status = 'pending' AND oc.deleted_at IS NULL
      ORDER BY oc.created_at ASC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.json({
      success: true,
      data: {
        clips: result.rows,
        count: result.rows.length,
        offset,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching pending clips:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clips'
    });
  }
});

/**
 * POST /api/outlawz/admin/clip/:clipId/approve
 * Approve and publish an Outlawz clip
 * Requires staff/admin role
 */
router.post("/admin/clip/:clipId/approve", authenticateToken, requireRole(['staff', 'admin']), async (req: Request, res: Response) => {
  try {
    const { clipId } = req.params;

    const result = await db.query(`
      UPDATE outlawz_clips
      SET
        compliance_status = 'approved',
        is_published = TRUE,
        published_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `, [clipId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Clip not found'
      });
    }

    // TODO: Emit event to event bus: outlawz.clip.published
    // await eventBus.publish('outlawz.clip.published', { clipId });

    res.json({
      success: true,
      message: 'Clip approved and published',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving clip:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve clip'
    });
  }
});

/**
 * POST /api/outlawz/track-view
 * Track a view/click on an Outlawz clip or profile
 * Public endpoint
 */
router.post("/track-view", async (req: Request, res: Response) => {
  try {
    const { clipId, profileId, eventType, metadata } = req.body;

    // Get user context
    const userId = (req as any).user?.id || null;
    const sessionId = req.headers['x-session-id'] as string || null;
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || null;

    await db.query(`
      INSERT INTO outlawz_analytics (
        outlawz_clip_id,
        outlawz_profile_id,
        event_type,
        event_metadata,
        user_id,
        session_id,
        user_agent,
        ip_address,
        vertical
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `, [
      clipId || null,
      profileId || null,
      eventType || 'view',
      metadata ? JSON.stringify(metadata) : '{}',
      userId,
      sessionId,
      userAgent,
      ipAddress,
      'boyfanz' // TODO: Get from request context
    ]);

    // Update view count on clip if applicable
    if (clipId && eventType === 'view') {
      await db.query(`
        UPDATE outlawz_clips
        SET view_count = view_count + 1
        WHERE id = $1
      `, [clipId]);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    // Don't fail on analytics errors
    res.json({ success: true });
  }
});

export default router;
