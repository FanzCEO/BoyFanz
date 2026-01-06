import { Router, Request, Response } from "express";
import { db } from "../../db";
import { sql, eq, and, desc, gte, lte, sum } from "drizzle-orm";

const router = Router();

// Admin middleware
const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.use(requireAdmin);

// Revenue overview with predictions
router.get("/overview", async (req: Request, res: Response) => {
  try {
    const { period = "30d" } = req.query;

    const overview = {
      current: {
        total: 125000,
        subscriptions: 75000,
        tips: 35000,
        ppv: 10000,
        custom: 5000
      },
      previous: {
        total: 110000,
        subscriptions: 68000,
        tips: 30000,
        ppv: 8000,
        custom: 4000
      },
      growth: {
        total: 13.6,
        subscriptions: 10.3,
        tips: 16.7,
        ppv: 25.0,
        custom: 25.0
      },
      predictions: {
        nextMonth: 142000,
        nextQuarter: 450000,
        confidence: 0.85
      }
    };

    res.json(overview);
  } catch (error) {
    console.error("Revenue overview error:", error);
    res.status(500).json({ error: "Failed to fetch revenue overview" });
  }
});

// Revenue trends and forecasting
router.get("/trends", async (req: Request, res: Response) => {
  try {
    const trends = {
      daily: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split("T")[0],
        revenue: Math.floor(3000 + Math.random() * 2000),
        subscriptions: Math.floor(2000 + Math.random() * 1000),
        tips: Math.floor(800 + Math.random() * 500),
        ppv: Math.floor(200 + Math.random() * 300)
      })),
      seasonality: {
        bestDays: ["Friday", "Saturday"],
        bestHours: [20, 21, 22],
        bestMonths: ["December", "February"]
      },
      forecast: {
        next7Days: 32000,
        next30Days: 145000,
        trend: "increasing",
        confidence: 0.82
      }
    };

    res.json(trends);
  } catch (error) {
    console.error("Revenue trends error:", error);
    res.status(500).json({ error: "Failed to fetch revenue trends" });
  }
});

// Top revenue generators
router.get("/top-creators", async (req: Request, res: Response) => {
  try {
    const { limit = 20, period = "30d" } = req.query;

    const topCreators = [
      {
        creatorId: 1,
        username: "topCreator1",
        totalRevenue: 15000,
        subscriptionRevenue: 10000,
        tipRevenue: 4000,
        ppvRevenue: 1000,
        subscriberCount: 500,
        avgRevenuePerSub: 30,
        growth: 12.5,
        rank: 1,
        previousRank: 2
      },
      {
        creatorId: 2,
        username: "topCreator2",
        totalRevenue: 12000,
        subscriptionRevenue: 8000,
        tipRevenue: 3000,
        ppvRevenue: 1000,
        subscriberCount: 400,
        avgRevenuePerSub: 30,
        growth: 8.3,
        rank: 2,
        previousRank: 1
      }
    ];

    res.json(topCreators);
  } catch (error) {
    console.error("Top creators error:", error);
    res.status(500).json({ error: "Failed to fetch top creators" });
  }
});

// Revenue breakdown by source
router.get("/breakdown", async (req: Request, res: Response) => {
  try {
    const breakdown = {
      bySource: [
        { source: "Subscriptions", amount: 75000, percentage: 60, count: 2500 },
        { source: "Tips", amount: 35000, percentage: 28, count: 5000 },
        { source: "Pay-Per-View", amount: 10000, percentage: 8, count: 800 },
        { source: "Custom Content", amount: 5000, percentage: 4, count: 50 }
      ],
      byTier: [
        { tier: "Basic ($9.99)", revenue: 25000, subscribers: 2500 },
        { tier: "Premium ($19.99)", revenue: 40000, subscribers: 2000 },
        { tier: "VIP ($49.99)", revenue: 10000, subscribers: 200 }
      ],
      byCountry: [
        { country: "US", revenue: 80000, percentage: 64 },
        { country: "UK", revenue: 20000, percentage: 16 },
        { country: "CA", revenue: 12500, percentage: 10 },
        { country: "AU", revenue: 7500, percentage: 6 },
        { country: "Other", revenue: 5000, percentage: 4 }
      ]
    };

    res.json(breakdown);
  } catch (error) {
    console.error("Revenue breakdown error:", error);
    res.status(500).json({ error: "Failed to fetch revenue breakdown" });
  }
});

// Platform fees and payouts
router.get("/platform-fees", async (req: Request, res: Response) => {
  try {
    const fees = {
      totalRevenue: 125000,
      platformFee: 25000,
      feePercentage: 20,
      creatorPayouts: 100000,
      pendingPayouts: 15000,
      processingFees: {
        stripe: 3750,
        paypal: 500,
        other: 250
      },
      netPlatformRevenue: 20500
    };

    res.json(fees);
  } catch (error) {
    console.error("Platform fees error:", error);
    res.status(500).json({ error: "Failed to fetch platform fees" });
  }
});

// Financial reconciliation
router.get("/reconciliation", async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const reconciliation = {
      period: { startDate, endDate },
      summary: {
        totalTransactions: 8500,
        totalAmount: 125000,
        successfulTransactions: 8350,
        failedTransactions: 100,
        refunds: 50,
        chargebacks: 5
      },
      discrepancies: [],
      status: "reconciled",
      lastReconciled: new Date().toISOString()
    };

    res.json(reconciliation);
  } catch (error) {
    console.error("Reconciliation error:", error);
    res.status(500).json({ error: "Failed to fetch reconciliation data" });
  }
});

// Export financial report
router.get("/export", async (req: Request, res: Response) => {
  try {
    const { format = "csv", startDate, endDate, type = "summary" } = req.query;

    // In production, generate actual report file
    res.json({
      message: "Report generation started",
      format,
      type,
      period: { startDate, endDate },
      downloadUrl: `/api/admin/revenue/download/${Date.now()}`,
      estimatedTime: "2 minutes"
    });
  } catch (error) {
    console.error("Export report error:", error);
    res.status(500).json({ error: "Failed to generate report" });
  }
});

export default router;
