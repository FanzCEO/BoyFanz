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

// Get all support tickets
router.get("/", async (req: Request, res: Response) => {
  try {
    const { status, priority, category, limit = "50", offset = "0" } = req.query;
    const tickets = await db.execute(sql`
      SELECT st.*, u.username, u.email, a.username as assigned_to_name
      FROM support_tickets st
      JOIN users u ON st.user_id = u.id
      LEFT JOIN users a ON st.assigned_to = a.id
      ORDER BY 
        CASE st.priority WHEN 'critical' THEN 1 WHEN 'urgent' THEN 2 WHEN 'high' THEN 3 WHEN 'normal' THEN 4 ELSE 5 END,
        st.created_at DESC
      LIMIT ${parseInt(limit as string)} OFFSET ${parseInt(offset as string)}
    `);
    res.json({ tickets: tickets.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get ticket details with messages
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [ticket, messages] = await Promise.all([
      db.execute(sql`SELECT st.*, u.username, u.email FROM support_tickets st JOIN users u ON st.user_id = u.id WHERE st.id = ${id}`),
      db.execute(sql`SELECT tm.*, u.username FROM ticket_messages tm JOIN users u ON tm.sender_id = u.id WHERE tm.ticket_id = ${id} ORDER BY tm.created_at ASC`)
    ]);
    res.json({ ticket: ticket.rows?.[0], messages: messages.rows || [] });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Assign ticket
router.post("/:id/assign", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { assigneeId } = req.body;
    await db.execute(sql`UPDATE support_tickets SET assigned_to = ${assigneeId}, status = 'open' WHERE id = ${id}`);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Reply to ticket
router.post("/:id/reply", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, isInternal } = req.body;
    await db.execute(sql`
      INSERT INTO ticket_messages (ticket_id, sender_id, is_staff, is_internal, content)
      VALUES (${id}, ${req.user?.id}, true, ${isInternal || false}, ${content})
    `);
    if (!isInternal) {
      await db.execute(sql`UPDATE support_tickets SET status = 'pending_user', first_response_at = COALESCE(first_response_at, NOW()) WHERE id = ${id}`);
    }
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Resolve ticket
router.post("/:id/resolve", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.execute(sql`UPDATE support_tickets SET status = 'resolved', resolved_at = NOW() WHERE id = ${id}`);
    res.json({ success: true });
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

// Get ticket stats
router.get("/stats/summary", async (req: Request, res: Response) => {
  try {
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'new') as new_tickets,
        COUNT(*) FILTER (WHERE status = 'open') as open_tickets,
        COUNT(*) FILTER (WHERE priority IN ('urgent', 'critical') AND status NOT IN ('resolved', 'closed')) as urgent_tickets,
        AVG(EXTRACT(EPOCH FROM (first_response_at - created_at))) / 60 as avg_first_response_mins
      FROM support_tickets
    `);
    res.json(stats.rows?.[0] || {});
  } catch (error: any) { res.status(500).json({ error: error.message }); }
});

export default router;