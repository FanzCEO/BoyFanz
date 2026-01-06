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

// Get admin audit log
router.get("/", async (req: Request, res: Response) => {
  try {
    const { actionType, adminId, limit = "100", offset = "0" } = req.query;
    const logs = await db.execute(sql`
      SELECT aal.*, u.username as admin_username
      FROM admin_audit_log aal
      JOIN users u ON aal.admin_id = u.id
      ORDER BY aal.created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
    `);
    res.json({ logs: logs.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Log an admin action (internal helper)
const logAdminAction = async (adminId: string, actionType: string, targetTable: string, targetId: string, data: any) => {
  await db.execute(sql`
    INSERT INTO admin_audit_log (admin_id, action_type, target_table, target_id, previous_state, new_state, reason)
    VALUES (${adminId}, ${actionType}, ${targetTable}, ${targetId}, ${JSON.stringify(data.previous)}::jsonb, ${JSON.stringify(data.newState)}::jsonb, ${data.reason || null})
  `);
};

// Undo an action (if possible)
router.post("/:id/undo", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const log = await db.execute(sql`SELECT * FROM admin_audit_log WHERE id = ${id} AND can_undo = true AND undone_at IS NULL`);
    if (!log.rows?.[0]) {
      return res.status(400).json({ error: "Action cannot be undone" });
    }
    await db.execute(sql`UPDATE admin_audit_log SET undone_at = NOW(), undone_by = ${req.user?.id} WHERE id = ${id}`);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get activity summary by admin
router.get("/summary", async (req: Request, res: Response) => {
  try {
    const summary = await db.execute(sql`
      SELECT u.username, aal.action_type, COUNT(*) as count
      FROM admin_audit_log aal
      JOIN users u ON aal.admin_id = u.id
      WHERE aal.created_at > NOW() - INTERVAL '7 days'
      GROUP BY u.username, aal.action_type
      ORDER BY count DESC
    `);
    res.json({ summary: summary.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;
export { logAdminAction };