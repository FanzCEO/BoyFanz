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

router.get("/pulse/live", async (req: Request, res: Response) => {
  try {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 300000);
    const signups = await db.execute(sql`SELECT id, username, created_at FROM users WHERE created_at > ${since} ORDER BY created_at DESC LIMIT 20`);
    res.json({ activities: signups.rows || [], timestamp: new Date().toISOString() });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

router.get("/metrics/overview", async (req: Request, res: Response) => {
  try {
    const userStats = await db.execute(sql`SELECT COUNT(*) as total_users FROM users`);
    res.json({ users: userStats.rows?.[0], timestamp: new Date().toISOString() });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;