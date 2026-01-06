// @ts-nocheck
/**
 * User Discipline Routes
 *
 * API endpoints for managing user warnings, suspensions, and appeals
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { userDisciplineService } from "../services/userDisciplineService";
import { isAuthenticated, requireAdmin, requireModeratorOrAdmin } from "../middleware/auth";

const router = Router();

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const issueWarningSchema = z.object({
  userId: z.string().min(1),
  warningType: z.enum([
    'content_violation',
    'harassment',
    'spam',
    'fraud_attempt',
    'copyright',
    'underage_content',
    'illegal_content',
    'impersonation',
    'terms_violation',
    'other',
  ]),
  severity: z.enum(['minor', 'moderate', 'severe', 'critical']),
  reason: z.string().min(10),
  detailedExplanation: z.string().min(20),
  evidenceUrls: z.array(z.string()).optional(),
  relatedContentIds: z.array(z.string()).optional(),
  violationPolicy: z.string().optional(),
  autoSuspend: z.boolean().optional().default(true),
});

const suspendUserSchema = z.object({
  userId: z.string().min(1),
  reason: z.enum(['violation', 'abuse', 'fraud', 'dmca', 'manual', 'auto_flag']),
  banType: z.enum(['temporary', 'permanent', 'shadow']),
  description: z.string().min(10),
  violationDetails: z.record(z.any()).optional(),
  durationHours: z.number().min(1).max(8760).optional(), // Max 1 year
});

const appealSchema = z.object({
  appealText: z.string().min(50).max(2000),
});

const reviewAppealSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  decisionReason: z.string().min(10),
});

const liftSuspensionSchema = z.object({
  liftReason: z.string().min(10),
});

// ============================================================
// PUBLIC USER ROUTES (Authenticated)
// ============================================================

/**
 * GET /api/discipline/status
 * Get current user's discipline status
 */
router.get("/status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const status = await userDisciplineService.getUserDisciplineStatus(userId);

    res.json({
      success: true,
      data: status,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get discipline status",
    });
  }
});

/**
 * GET /api/discipline/warnings
 * Get current user's warnings
 */
router.get("/warnings", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const activeOnly = req.query.active === 'true';
    const warnings = await userDisciplineService.getUserWarnings(userId, activeOnly);

    res.json({
      success: true,
      data: {
        warnings,
        count: warnings.length,
        activeCount: warnings.filter((w: any) => w.isActive).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get warnings",
    });
  }
});

/**
 * GET /api/discipline/suspensions
 * Get current user's suspension history
 */
router.get("/suspensions", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const activeOnly = req.query.active === 'true';
    const suspensions = await userDisciplineService.getUserSuspensions(userId, activeOnly);

    res.json({
      success: true,
      data: {
        suspensions,
        count: suspensions.length,
        activeCount: suspensions.filter((s: any) => s.isActive).length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get suspensions",
    });
  }
});

/**
 * POST /api/discipline/warnings/:id/appeal
 * Submit an appeal for a warning
 */
router.post("/warnings/:id/appeal", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const data = appealSchema.parse(req.body);

    const success = await userDisciplineService.submitAppeal(
      'warning',
      id,
      userId,
      data.appealText
    );

    res.json({
      success,
      message: success ? "Appeal submitted successfully" : "Failed to submit appeal",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to submit appeal",
    });
  }
});

/**
 * POST /api/discipline/suspensions/:id/appeal
 * Submit an appeal for a suspension
 */
router.post("/suspensions/:id/appeal", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const data = appealSchema.parse(req.body);

    const success = await userDisciplineService.submitAppeal(
      'suspension',
      id,
      userId,
      data.appealText
    );

    res.json({
      success,
      message: success ? "Appeal submitted successfully" : "Failed to submit appeal",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to submit appeal",
    });
  }
});

// ============================================================
// ADMIN ROUTES
// ============================================================

/**
 * GET /api/discipline/admin/user/:userId/status
 * Get a specific user's discipline status (admin)
 */
router.get("/admin/user/:userId/status", isAuthenticated, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const status = await userDisciplineService.getUserDisciplineStatus(userId);
    const warnings = await userDisciplineService.getUserWarnings(userId);
    const suspensions = await userDisciplineService.getUserSuspensions(userId);

    res.json({
      success: true,
      data: {
        status,
        warnings,
        suspensions,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get user discipline status",
    });
  }
});

/**
 * POST /api/discipline/admin/warnings
 * Issue a warning to a user (admin/moderator)
 */
router.post("/admin/warnings", isAuthenticated, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const data = issueWarningSchema.parse(req.body);
    const issuedBy = (req as any).user?.id;
    const issuedByRole = (req as any).user?.role || 'moderator';

    const result = await userDisciplineService.issueWarning({
      ...data,
      issuedBy,
      issuedByRole,
    });

    res.json({
      success: true,
      message: `Warning issued successfully. Strike level: ${result.newStrikeLevel}`,
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to issue warning",
    });
  }
});

/**
 * POST /api/discipline/admin/suspensions
 * Suspend a user (admin/moderator)
 */
router.post("/admin/suspensions", isAuthenticated, requireModeratorOrAdmin, async (req: Request, res: Response) => {
  try {
    const data = suspendUserSchema.parse(req.body);
    const suspendedBy = (req as any).user?.id;

    const suspension = await userDisciplineService.suspendUser({
      ...data,
      suspendedBy,
    });

    res.json({
      success: true,
      message: "User suspended successfully",
      data: suspension,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to suspend user",
    });
  }
});

/**
 * POST /api/discipline/admin/suspensions/:id/lift
 * Lift a suspension early (admin)
 */
router.post("/admin/suspensions/:id/lift", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = liftSuspensionSchema.parse(req.body);
    const liftedBy = (req as any).user?.id;

    const success = await userDisciplineService.liftSuspension(
      id,
      liftedBy,
      data.liftReason,
      false
    );

    res.json({
      success,
      message: success ? "Suspension lifted successfully" : "Failed to lift suspension",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to lift suspension",
    });
  }
});

/**
 * POST /api/discipline/admin/warnings/:id/review
 * Review a warning appeal (admin)
 */
router.post("/admin/warnings/:id/review", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = reviewAppealSchema.parse(req.body);
    const reviewedBy = (req as any).user?.id;

    const success = await userDisciplineService.reviewAppeal(
      'warning',
      id,
      data.decision,
      reviewedBy,
      data.decisionReason
    );

    res.json({
      success,
      message: `Appeal ${data.decision}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to review appeal",
    });
  }
});

/**
 * POST /api/discipline/admin/suspensions/:id/review
 * Review a suspension appeal (admin)
 */
router.post("/admin/suspensions/:id/review", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data = reviewAppealSchema.parse(req.body);
    const reviewedBy = (req as any).user?.id;

    const success = await userDisciplineService.reviewAppeal(
      'suspension',
      id,
      data.decision,
      reviewedBy,
      data.decisionReason
    );

    res.json({
      success,
      message: `Appeal ${data.decision}`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to review appeal",
    });
  }
});

/**
 * GET /api/discipline/admin/pending-appeals
 * Get all pending appeals (admin)
 */
router.get("/admin/pending-appeals", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    // This would need a custom query - for now return empty
    res.json({
      success: true,
      data: {
        warningAppeals: [],
        suspensionAppeals: [],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get pending appeals",
    });
  }
});

/**
 * POST /api/discipline/admin/check-expired
 * Manually trigger check for expired suspensions (admin)
 */
router.post("/admin/check-expired", isAuthenticated, requireAdmin, async (req: Request, res: Response) => {
  try {
    const count = await userDisciplineService.checkAndLiftExpiredSuspensions();

    res.json({
      success: true,
      message: `Lifted ${count} expired suspensions`,
      data: { liftedCount: count },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check expired suspensions",
    });
  }
});

export default router;
