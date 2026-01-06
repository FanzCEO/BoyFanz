import { Router, Request, Response } from "express";
import { db } from "../../db";
import { sql, eq, and, desc, gte, lte, count } from "drizzle-orm";

const router = Router();

// Admin middleware
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.use(requireAdmin);

// Get moderation queue with AI pre-classification
router.get("/queue", async (req: Request, res: Response) => {
  try {
    const { status = "pending", contentType = "all", priority = "all" } = req.query;

    // Mock moderation queue with AI classification
    const queue = [
      {
        id: 1,
        contentId: 101,
        contentType: "post",
        creatorId: 5,
        creatorUsername: "creator1",
        title: "Sample Post Title",
        previewUrl: "/uploads/preview1.jpg",
        aiClassification: {
          confidence: 0.92,
          categories: ["adult", "verified_creator"],
          flags: [],
          recommendation: "approve"
        },
        reportCount: 0,
        priority: "normal",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ];

    res.json(queue);
  } catch (error) {
    console.error("Get moderation queue error:", error);
    res.status(500).json({ error: "Failed to fetch moderation queue" });
  }
});

// AI-powered content analysis
router.post("/analyze/:contentId", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;

    // Mock AI analysis result
    const analysis = {
      contentId: parseInt(contentId),
      overallSafe: true,
      confidence: 0.95,
      categories: {
        adult: { detected: true, confidence: 0.98 },
        violence: { detected: false, confidence: 0.02 },
        hate: { detected: false, confidence: 0.01 },
        spam: { detected: false, confidence: 0.03 }
      },
      textAnalysis: {
        sentiment: "neutral",
        toxicity: 0.05,
        profanity: false
      },
      imageAnalysis: {
        faces: 1,
        ageVerified: true,
        nudity: { detected: true, type: "adult_only" }
      },
      recommendation: "approve",
      requiredActions: []
    };

    res.json(analysis);
  } catch (error) {
    console.error("Content analysis error:", error);
    res.status(500).json({ error: "Failed to analyze content" });
  }
});

// Bulk moderation actions
router.post("/bulk-action", async (req: Request, res: Response) => {
  try {
    const { contentIds, action, reason } = req.body;
    const adminId = req.user!.id;

    // Process bulk action
    const results = {
      processed: contentIds.length,
      success: contentIds.length,
      failed: 0,
      action,
      processedBy: adminId,
      processedAt: new Date().toISOString()
    };

    res.json(results);
  } catch (error) {
    console.error("Bulk moderation error:", error);
    res.status(500).json({ error: "Failed to process bulk action" });
  }
});

// Get moderation statistics
router.get("/stats", async (req: Request, res: Response) => {
  try {
    const stats = {
      today: {
        reviewed: 45,
        approved: 42,
        rejected: 3,
        avgReviewTime: "2m 15s"
      },
      queue: {
        pending: 12,
        highPriority: 2,
        reported: 5
      },
      aiAssist: {
        autoApproved: 38,
        flaggedForReview: 7,
        accuracy: 0.96
      },
      byModerator: [
        { adminId: 1, name: "Admin 1", reviewed: 25, avgTime: "1m 45s" },
        { adminId: 2, name: "Admin 2", reviewed: 20, avgTime: "2m 30s" }
      ]
    };

    res.json(stats);
  } catch (error) {
    console.error("Get moderation stats error:", error);
    res.status(500).json({ error: "Failed to fetch moderation stats" });
  }
});

// Review single content item
router.post("/review/:contentId", async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { action, reason, notes } = req.body;
    const adminId = req.user!.id;

    const result = {
      contentId: parseInt(contentId),
      action,
      reviewedBy: adminId,
      reviewedAt: new Date().toISOString(),
      reason,
      notes
    };

    res.json(result);
  } catch (error) {
    console.error("Review content error:", error);
    res.status(500).json({ error: "Failed to review content" });
  }
});

// Get content reports
router.get("/reports", async (req: Request, res: Response) => {
  try {
    const reports = [
      {
        id: 1,
        contentId: 101,
        contentType: "post",
        reporterId: 10,
        reporterUsername: "user10",
        reason: "inappropriate",
        description: "Content violates guidelines",
        status: "pending",
        createdAt: new Date().toISOString()
      }
    ];

    res.json(reports);
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

export default router;
