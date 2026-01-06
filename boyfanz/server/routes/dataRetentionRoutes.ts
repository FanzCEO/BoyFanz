/**
 * FANZ Data Retention API Routes
 *
 * GDPR/CCPA compliant endpoints for:
 * - Data export requests (Right to Portability)
 * - Account deletion requests (Right to Erasure)
 * - Consent management
 * - Audit log access
 *
 * CRITICAL: All operations require authentication and platformId
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { DataRetentionService } from "../services/dataRetentionService";
import { UserDataExportService } from "../services/userDataExportService";
import { AccountDeletionService } from "../services/accountDeletionService";
import { dataRetentionScheduler } from "../services/dataRetentionScheduler";

const router = Router();

// Service instances
const dataRetentionService = new DataRetentionService();
const userDataExportService = new UserDataExportService();
const accountDeletionService = new AccountDeletionService();

// Get platformId from environment or derive from hostname
const getPlatformId = (req: Request): string => {
  // Try to get from request headers first
  const platformHeader = req.headers["x-platform-id"] as string;
  if (platformHeader) return platformHeader;

  // Try to derive from hostname
  const hostname = req.hostname || "";
  const platformMatch = hostname.match(/^(\w+)\.fanz\.website$/);
  if (platformMatch) return platformMatch[1];

  // Fall back to environment variable
  return process.env.PLATFORM_ID || "boyfanz";
};

// Middleware to ensure user is authenticated
const requireAuth = (req: Request, res: Response, next: any) => {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }
  next();
};

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const dataExportRequestSchema = z.object({
  includeProfile: z.boolean().default(true),
  includeContent: z.boolean().default(true),
  includeMessages: z.boolean().default(true),
  includeTransactions: z.boolean().default(true),
  includeSubscriptions: z.boolean().default(true),
  includePurchases: z.boolean().default(true),
  includeEarnings: z.boolean().default(true),
  includeActivityLogs: z.boolean().default(false),
  format: z.enum(["json", "csv", "zip"]).default("json"),
});

const deletionRequestSchema = z.object({
  requestType: z
    .enum([
      "full_account",
      "platform_only",
      "content_only",
      "messages_only",
      "financial_anonymize",
    ])
    .default("full_account"),
  reason: z.string().max(1000).optional(),
  gracePeriodDays: z.number().min(1).max(90).default(30),
});

const consentSchema = z.object({
  consentType: z.enum([
    "marketing",
    "analytics",
    "personalization",
    "third_party",
    "cookies",
    "adult_content",
  ]),
  granted: z.boolean(),
  version: z.string(),
  consentText: z.string().optional(),
});

// ============================================================
// DATA EXPORT ROUTES
// ============================================================

/**
 * POST /api/data-retention/export
 * Request a data export
 */
router.post("/export", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const data = dataExportRequestSchema.parse(req.body);

    const exportRequest = await dataRetentionService.requestDataExport({
      userId: user.id,
      platformId,
      ...data,
      requestedIp: req.ip,
      requestedUserAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: "Data export request submitted successfully",
      data: {
        requestId: exportRequest.id,
        status: exportRequest.status,
        createdAt: exportRequest.createdAt,
        estimatedCompletion: "Usually within 24 hours",
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || "Failed to request data export",
    });
  }
});

/**
 * GET /api/data-retention/export
 * Get user's export requests
 */
router.get("/export", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const requests = await dataRetentionService.getExportRequests({
      userId: user.id,
      platformId,
      limit: 10,
    });

    res.json({
      success: true,
      data: requests.map((r) => ({
        id: r.id,
        status: r.status,
        format: r.format,
        archiveUrl: r.status === "completed" ? r.archiveUrl : null,
        archiveSizeBytes: r.archiveSizeBytes,
        expiresAt: r.expiresAt,
        downloadCount: r.downloadCount,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get export requests",
    });
  }
});

/**
 * GET /api/data-retention/export/:id/download
 * Download a completed export
 */
router.get(
  "/export/:id/download",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const platformId = getPlatformId(req);
      const exportId = req.params.id;

      // Get the export request
      const requests = await dataRetentionService.getExportRequests({
        userId: user.id,
        platformId,
      });

      const exportRequest = requests.find((r) => r.id === exportId);

      if (!exportRequest) {
        return res.status(404).json({
          success: false,
          error: "Export request not found",
        });
      }

      if (exportRequest.status !== "completed") {
        return res.status(400).json({
          success: false,
          error: `Export is not ready. Current status: ${exportRequest.status}`,
        });
      }

      if (!exportRequest.archiveUrl) {
        return res.status(400).json({
          success: false,
          error: "Export archive not available",
        });
      }

      // Check if expired
      if (exportRequest.expiresAt && new Date() > exportRequest.expiresAt) {
        return res.status(410).json({
          success: false,
          error: "Export has expired. Please request a new export.",
        });
      }

      // Record download
      await userDataExportService.recordDownload(exportId);

      // Redirect to signed URL
      res.redirect(exportRequest.archiveUrl);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to download export",
      });
    }
  }
);

// ============================================================
// ACCOUNT DELETION ROUTES
// ============================================================

/**
 * POST /api/data-retention/delete
 * Request account deletion
 */
router.post("/delete", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const data = deletionRequestSchema.parse(req.body);

    const deletionRequest = await dataRetentionService.requestAccountDeletion({
      userId: user.id,
      platformId,
      requestType: data.requestType,
      reason: data.reason,
      gracePeriodDays: data.gracePeriodDays,
      requestedIp: req.ip,
      requestedUserAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: `Account deletion scheduled. You have ${data.gracePeriodDays} days to cancel.`,
      data: {
        requestId: deletionRequest.id,
        status: deletionRequest.status,
        requestType: deletionRequest.requestType,
        gracePeriodDays: deletionRequest.gracePeriodDays,
        gracePeriodEndsAt: deletionRequest.gracePeriodEndsAt,
        canCancelUntil: deletionRequest.canCancelUntil,
        scheduledDeletionAt: deletionRequest.scheduledDeletionAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || "Failed to request account deletion",
    });
  }
});

/**
 * GET /api/data-retention/delete
 * Get user's deletion requests
 */
router.get("/delete", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const requests = await dataRetentionService.getDeletionRequests({
      userId: user.id,
      platformId,
      limit: 10,
    });

    res.json({
      success: true,
      data: requests.map((r) => ({
        id: r.id,
        status: r.status,
        requestType: r.requestType,
        reason: r.reason,
        gracePeriodDays: r.gracePeriodDays,
        gracePeriodEndsAt: r.gracePeriodEndsAt,
        canCancelUntil: r.canCancelUntil,
        scheduledDeletionAt: r.scheduledDeletionAt,
        recordsDeleted: r.recordsDeleted,
        createdAt: r.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get deletion requests",
    });
  }
});

/**
 * POST /api/data-retention/delete/:id/cancel
 * Cancel a pending deletion request
 */
router.post(
  "/delete/:id/cancel",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const platformId = getPlatformId(req);
      const deletionId = req.params.id;

      const cancelledRequest = await dataRetentionService.cancelAccountDeletion({
        deletionRequestId: deletionId,
        userId: user.id,
        platformId,
        cancelledIp: req.ip,
      });

      res.json({
        success: true,
        message: "Account deletion cancelled successfully",
        data: {
          requestId: cancelledRequest.id,
          status: cancelledRequest.status,
        },
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to cancel deletion request",
      });
    }
  }
);

// ============================================================
// CONSENT MANAGEMENT ROUTES
// ============================================================

/**
 * POST /api/data-retention/consent
 * Record user consent
 */
router.post("/consent", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const data = consentSchema.parse(req.body);

    const consent = await dataRetentionService.recordConsent({
      userId: user.id,
      platformId,
      consentType: data.consentType,
      granted: data.granted,
      version: data.version,
      consentText: data.consentText,
      consentMethod: "web_form",
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });

    res.json({
      success: true,
      message: `Consent ${data.granted ? "granted" : "withdrawn"} for ${data.consentType}`,
      data: {
        id: consent.id,
        consentType: consent.consentType,
        status: consent.status,
        grantedAt: consent.grantedAt,
        withdrawnAt: consent.withdrawnAt,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(400).json({
      success: false,
      error: error.message || "Failed to record consent",
    });
  }
});

/**
 * GET /api/data-retention/consent
 * Get user's consent records
 */
router.get("/consent", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const consents = await dataRetentionService.getUserConsents({
      userId: user.id,
      platformId,
    });

    res.json({
      success: true,
      data: consents.map((c) => ({
        id: c.id,
        consentType: c.consentType,
        status: c.status,
        version: c.version,
        grantedAt: c.grantedAt,
        withdrawnAt: c.withdrawnAt,
        expiresAt: c.expiresAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get consent records",
    });
  }
});

// ============================================================
// AUDIT LOG ROUTES
// ============================================================

/**
 * GET /api/data-retention/audit
 * Get user's data access audit log
 */
router.get("/audit", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const auditLog = await dataRetentionService.getAuditLog({
      targetUserId: user.id,
      platformId,
      limit: 100,
    });

    res.json({
      success: true,
      data: auditLog.map((log) => ({
        id: log.id,
        action: log.action,
        dataCategory: log.dataCategory,
        accessorType: log.accessorType,
        createdAt: log.createdAt,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get audit log",
    });
  }
});

// ============================================================
// LEGAL HOLDS CHECK (User-facing)
// ============================================================

/**
 * GET /api/data-retention/legal-holds
 * Check if user has any active legal holds
 */
router.get("/legal-holds", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    const holds = await dataRetentionService.checkLegalHolds(user.id, platformId);

    res.json({
      success: true,
      data: {
        hasActiveHolds: holds.length > 0,
        message:
          holds.length > 0
            ? "Your account has an active legal hold. Some data operations may be restricted."
            : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check legal holds",
    });
  }
});

// ============================================================
// PRIVACY DASHBOARD
// ============================================================

/**
 * GET /api/data-retention/dashboard
 * Get privacy dashboard summary for user
 */
router.get("/dashboard", requireAuth, async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const platformId = getPlatformId(req);

    // Get all relevant data in parallel
    const [exportRequests, deletionRequests, consents, legalHolds] =
      await Promise.all([
        dataRetentionService.getExportRequests({ userId: user.id, platformId }),
        dataRetentionService.getDeletionRequests({ userId: user.id, platformId }),
        dataRetentionService.getUserConsents({ userId: user.id, platformId }),
        dataRetentionService.checkLegalHolds(user.id, platformId),
      ]);

    // Calculate consent summary
    const consentSummary = consents.reduce(
      (acc, c) => {
        acc[c.consentType] = c.status === "granted";
        return acc;
      },
      {} as Record<string, boolean>
    );

    res.json({
      success: true,
      data: {
        exports: {
          pending: exportRequests.filter((r) => r.status === "pending").length,
          completed: exportRequests.filter((r) => r.status === "completed").length,
          latestExport:
            exportRequests.find((r) => r.status === "completed") || null,
        },
        deletions: {
          pending: deletionRequests.filter(
            (r) => r.status === "pending" || r.status === "grace_period"
          ).length,
          activeRequest: deletionRequests.find(
            (r) => r.status === "grace_period"
          ) || null,
        },
        consents: consentSummary,
        legalHolds: {
          hasActiveHolds: legalHolds.length > 0,
        },
        rights: {
          portability: "You can request a copy of all your data at any time.",
          erasure:
            "You can request deletion of your account. A 30-day grace period applies.",
          access: "You can view all data we have about you.",
          rectification: "You can update your personal information in settings.",
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to load privacy dashboard",
    });
  }
});

// ============================================================
// ADMIN ROUTES (require admin role)
// ============================================================

const requireAdmin = (req: Request, res: Response, next: any) => {
  const user = req.user as any;
  if (!user?.role || !["admin", "superadmin"].includes(user.role)) {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }
  next();
};

/**
 * GET /api/data-retention/admin/stats
 * Get retention statistics for admin dashboard
 */
router.get(
  "/admin/stats",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const platformId = getPlatformId(req);

      const [retentionStats, schedulerStats, pendingWork] = await Promise.all([
        dataRetentionService.getRetentionStats(platformId),
        Promise.resolve(dataRetentionScheduler.getStats()),
        dataRetentionScheduler.getPendingWorkSummary(),
      ]);

      res.json({
        success: true,
        data: {
          retention: retentionStats,
          scheduler: schedulerStats,
          pending: pendingWork,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to get admin stats",
      });
    }
  }
);

/**
 * POST /api/data-retention/admin/trigger-exports
 * Manually trigger export processing
 */
router.post(
  "/admin/trigger-exports",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const processed = await dataRetentionScheduler.triggerExportProcessing();

      res.json({
        success: true,
        message: `Triggered export processing`,
        data: { processed },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to trigger export processing",
      });
    }
  }
);

/**
 * POST /api/data-retention/admin/trigger-deletions
 * Manually trigger deletion processing
 */
router.post(
  "/admin/trigger-deletions",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const processed = await dataRetentionScheduler.triggerDeletionProcessing();

      res.json({
        success: true,
        message: `Triggered deletion processing`,
        data: { processed },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Failed to trigger deletion processing",
      });
    }
  }
);

/**
 * POST /api/data-retention/admin/legal-hold
 * Create a legal hold
 */
router.post(
  "/admin/legal-hold",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      const holdSchema = z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        caseReference: z.string().optional(),
        affectedUserIds: z.array(z.string()).optional(),
        affectedPlatformIds: z.array(z.string()).optional(),
        dataCategories: z.array(z.string()).optional(),
        holdStartDate: z.string().transform((s) => new Date(s)),
        holdEndDate: z
          .string()
          .optional()
          .transform((s) => (s ? new Date(s) : undefined)),
      });

      const data = holdSchema.parse(req.body);

      const hold = await dataRetentionService.createLegalHold({
        ...data,
        createdBy: user.id,
      });

      res.json({
        success: true,
        message: "Legal hold created successfully",
        data: hold,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.errors,
        });
      }

      res.status(400).json({
        success: false,
        error: error.message || "Failed to create legal hold",
      });
    }
  }
);

/**
 * DELETE /api/data-retention/admin/legal-hold/:id
 * Release a legal hold
 */
router.delete(
  "/admin/legal-hold/:id",
  requireAuth,
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;
      const holdId = req.params.id;

      const hold = await dataRetentionService.releaseLegalHold({
        holdId,
        releasedBy: user.id,
      });

      res.json({
        success: true,
        message: "Legal hold released successfully",
        data: hold,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || "Failed to release legal hold",
      });
    }
  }
);

export default router;
