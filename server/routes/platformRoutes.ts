import { Router, Request, Response } from "express";
import { platformAccessService } from "../services/platformAccessService";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

/**
 * GET /api/platform/current
 * Returns current platform metadata - public endpoint
 */
router.get("/current", (req, res) => {
  res.json({
    success: true,
    platform: "boyfanz",
    brand: "BoyFanz",
    host: req.headers.host,
    themeColor: "#dc2626",
    description: "Premium adult content platform for guys",
    features: {
      streaming: true,
      messaging: true,
      tips: true,
      subscriptions: true
    }
  });
});

/**
 * Get all platform definitions
 */
router.get("/platforms/definitions", async (req: Request, res: Response) => {
  try {
    const platforms = platformAccessService.getPlatformDefinitions();
    res.json({ platforms });
  } catch (error) {
    console.error("Error fetching platform definitions:", error);
    res.status(500).json({ error: "Failed to fetch platform definitions" });
  }
});

/**
 * Get current user's platform access
 */
router.get("/user/platform-access", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const access = await platformAccessService.getUserPlatforms(userId);
    res.json(access);
  } catch (error) {
    console.error("Error fetching user platform access:", error);
    res.status(500).json({ error: "Failed to fetch platform access" });
  }
});

/**
 * Enable a platform for the current user
 */
router.post("/platforms/access", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { platformId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!platformId) {
      return res.status(400).json({ error: "Platform ID is required" });
    }

    const access = await platformAccessService.enablePlatform(userId, platformId);
    res.json({ success: true, access });
  } catch (error) {
    console.error("Error enabling platform:", error);
    res.status(500).json({ error: "Failed to enable platform" });
  }
});

/**
 * Disable a platform for the current user
 */
router.delete("/platforms/access/:platformId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { platformId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    await platformAccessService.disablePlatform(userId, platformId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error disabling platform:", error);
    res.status(500).json({ error: "Failed to disable platform" });
  }
});

/**
 * Bulk enable multiple platforms (for signup)
 */
router.post("/platforms/access/bulk", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { platformIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!Array.isArray(platformIds)) {
      return res.status(400).json({ error: "Platform IDs must be an array" });
    }

    const results = await platformAccessService.enableMultiplePlatforms(userId, platformIds);
    res.json({ success: true, results });
  } catch (error) {
    console.error("Error enabling platforms:", error);
    res.status(500).json({ error: "Failed to enable platforms" });
  }
});

/**
 * Sync profile to all active platforms
 */
router.post("/platforms/sync-profile", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const syncedPlatforms = await platformAccessService.syncProfileToAllPlatforms(userId);
    res.json({ success: true, syncedPlatforms });
  } catch (error) {
    console.error("Error syncing profile:", error);
    res.status(500).json({ error: "Failed to sync profile" });
  }
});

// ===== 2257 VERIFICATION ROUTES =====

/**
 * Get user's universal verification status
 */
router.get("/verification/status", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const verification = await platformAccessService.getUniversalVerification(userId);
    res.json({ verification });
  } catch (error) {
    console.error("Error fetching verification status:", error);
    res.status(500).json({ error: "Failed to fetch verification status" });
  }
});

/**
 * Share verification to additional platforms
 */
router.post("/verification/share", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { verificationId, platformIds } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!verificationId) {
      return res.status(400).json({ error: "Verification ID is required" });
    }

    let links;
    if (platformIds && Array.isArray(platformIds)) {
      links = await platformAccessService.linkVerificationToPlatforms(verificationId, platformIds);
    } else {
      links = await platformAccessService.shareVerificationToAllPlatforms(userId, verificationId);
    }

    res.json({ success: true, links });
  } catch (error) {
    console.error("Error sharing verification:", error);
    res.status(500).json({ error: "Failed to share verification" });
  }
});

/**
 * Check if user is verified on a specific platform
 */
router.get("/verification/check/:platformId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { platformId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const isVerified = await platformAccessService.isVerifiedOnPlatform(userId, platformId);
    res.json({ isVerified, platformId });
  } catch (error) {
    console.error("Error checking verification:", error);
    res.status(500).json({ error: "Failed to check verification" });
  }
});

// ===== TAG APPROVAL ROUTES =====

/**
 * Get pending tag approvals
 */
router.get("/tags/pending", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pending = await platformAccessService.getPendingTagApprovals(userId);
    res.json({ pending });
  } catch (error) {
    console.error("Error fetching pending tags:", error);
    res.status(500).json({ error: "Failed to fetch pending tags" });
  }
});

/**
 * Approve a tag with platform selection
 */
router.post("/tags/approve", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { tagDisplayId, displayPlatforms } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!tagDisplayId) {
      return res.status(400).json({ error: "Tag display ID is required" });
    }

    const approved = await platformAccessService.approveTag(tagDisplayId, displayPlatforms || []);
    res.json({ success: true, approved });
  } catch (error) {
    console.error("Error approving tag:", error);
    res.status(500).json({ error: "Failed to approve tag" });
  }
});

/**
 * Reject a tag
 */
router.post("/tags/reject", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { tagDisplayId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!tagDisplayId) {
      return res.status(400).json({ error: "Tag display ID is required" });
    }

    const rejected = await platformAccessService.rejectTag(tagDisplayId);
    res.json({ success: true, rejected });
  } catch (error) {
    console.error("Error rejecting tag:", error);
    res.status(500).json({ error: "Failed to reject tag" });
  }
});

// ===== CROSSPOST CREDIT ROUTES =====

/**
 * Get pending crosspost approvals
 */
router.get("/crosspost/pending", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const pending = await platformAccessService.getPendingCrosspostApprovals(userId);
    res.json({ pending });
  } catch (error) {
    console.error("Error fetching pending crossposts:", error);
    res.status(500).json({ error: "Failed to fetch pending crossposts" });
  }
});

/**
 * Approve a crosspost credit
 */
router.post("/crosspost/approve", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { creditId, displaySettings } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!creditId) {
      return res.status(400).json({ error: "Credit ID is required" });
    }

    const approved = await platformAccessService.approveCrosspostCredit(creditId, displaySettings);
    res.json({ success: true, approved });
  } catch (error) {
    console.error("Error approving crosspost:", error);
    res.status(500).json({ error: "Failed to approve crosspost" });
  }
});

/**
 * Reject a crosspost credit
 */
router.post("/crosspost/reject", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { creditId } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!creditId) {
      return res.status(400).json({ error: "Credit ID is required" });
    }

    const rejected = await platformAccessService.rejectCrosspostCredit(creditId);
    res.json({ success: true, rejected });
  } catch (error) {
    console.error("Error rejecting crosspost:", error);
    res.status(500).json({ error: "Failed to reject crosspost" });
  }
});

export default router;
