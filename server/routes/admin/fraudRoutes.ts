import { Router, Request, Response } from "express";
import { db } from "../../db";
import { sql } from "drizzle-orm";

const router = Router();

const requireAdmin = (req: Request, res: Response, next: any) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

router.use(requireAdmin);

// Get all fraud signals with filtering
router.get("/signals", async (req: Request, res: Response) => {
  try {
    const { severity, status, type, limit = "50", offset = "0" } = req.query;
    const signals = await db.execute(sql`
      SELECT fs.*, u.username, u.email 
      FROM fraud_signals fs
      LEFT JOIN users u ON fs.user_id = u.id
      WHERE 1=1
      ORDER BY fs.created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
    `);
    res.json({ signals: signals.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get fraud dashboard summary
router.get("/dashboard", async (req: Request, res: Response) => {
  try {
    const dayAgo = new Date(Date.now() - 86400000);
    const [severityCounts, typeCounts, recentSignals] = await Promise.all([
      db.execute(sql`SELECT severity, COUNT(*) as count FROM fraud_signals WHERE status = 'active' GROUP BY severity`),
      db.execute(sql`SELECT signal_type, COUNT(*) as count FROM fraud_signals WHERE status = 'active' GROUP BY signal_type`),
      db.execute(sql`SELECT * FROM fraud_signals WHERE created_at > ${dayAgo} ORDER BY created_at DESC LIMIT 10`)
    ]);
    res.json({
      severityCounts: severityCounts.rows || [],
      typeCounts: typeCounts.rows || [],
      recentSignals: recentSignals.rows || []
    });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Review a fraud signal
router.post("/signals/:id/review", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    await db.execute(sql`UPDATE fraud_signals SET status = ${status}, resolution = ${resolution}, reviewed_by = ${req.user?.id}, reviewed_at = NOW() WHERE id = ${id}`);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;