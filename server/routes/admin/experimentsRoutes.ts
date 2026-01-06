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

// Get all experiments
router.get("/", async (req: Request, res: Response) => {
  try {
    const experiments = await db.execute(sql`SELECT * FROM experiments ORDER BY created_at DESC`);
    res.json({ experiments: experiments.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Create new experiment
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, description, hypothesis, featureFlag, variants, primaryMetric, trafficPercentage } = req.body;
    await db.execute(sql`
      INSERT INTO experiments (name, description, hypothesis, feature_flag, variants, primary_metric, traffic_percentage, created_by)
      VALUES (${name}, ${description}, ${hypothesis}, ${featureFlag}, ${JSON.stringify(variants)}::jsonb, ${primaryMetric}, ${trafficPercentage}, ${req.user?.id})
    `);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Start/stop experiment
router.post("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.execute(sql`UPDATE experiments SET status = ${status}, started_at = CASE WHEN ${status} = 'running' THEN NOW() ELSE started_at END WHERE id = ${id}`);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get experiment results
router.get("/:id/results", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [experiment, assignments] = await Promise.all([
      db.execute(sql`SELECT * FROM experiments WHERE id = ${id}`),
      db.execute(sql`SELECT variant, COUNT(*) as count, COUNT(*) FILTER (WHERE converted_at IS NOT NULL) as conversions FROM experiment_assignments WHERE experiment_id = ${id} GROUP BY variant`)
    ]);
    res.json({ experiment: experiment.rows?.[0], results: assignments.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;