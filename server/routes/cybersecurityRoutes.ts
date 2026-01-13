/**
 * FANZ Cybersecurity System API Routes
 * 500 Security Bots - Defense, Detection, Prevention, Compliance
 *
 * @author FANZ BOT LAW Compliant
 * @version 1.0.0
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import {
  securityEvents,
  blockedIps,
  securityBotStatus,
  attackPatterns,
  securityAlerts,
  rateLimitRules,
  botLawViolations,
  threatIntelligence,
  securityMetrics,
  aiCapabilityToggles
} from '../../shared/schema.js';
import { eq, desc, and, gte, lte, sql, count, or, like, isNull } from 'drizzle-orm';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Apply admin authentication to all security routes
router.use(requireAdmin);

// ===== SECURITY DASHBOARD OVERVIEW =====

// GET /api/cybersecurity/overview
// Comprehensive security system overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get bot status counts
    const [runningBots] = await db.select({ count: count() })
      .from(securityBotStatus)
      .where(eq(securityBotStatus.isRunning, true));

    const [totalBots] = await db.select({ count: count() })
      .from(securityBotStatus);

    // Get event counts by severity (last 24h)
    const eventsBySeverity = await db.select({
      severity: securityEvents.severity,
      count: count()
    })
    .from(securityEvents)
    .where(gte(securityEvents.createdAt, last24h))
    .groupBy(securityEvents.severity);

    // Get blocked IPs count
    const [blockedIpCount] = await db.select({ count: count() })
      .from(blockedIps)
      .where(or(isNull(blockedIps.expiresAt), gte(blockedIps.expiresAt, now)));

    // Get open alerts count
    const [openAlertsCount] = await db.select({ count: count() })
      .from(securityAlerts)
      .where(eq(securityAlerts.status, 'open'));

    // Get critical alerts count
    const [criticalAlerts] = await db.select({ count: count() })
      .from(securityAlerts)
      .where(and(
        eq(securityAlerts.status, 'open'),
        eq(securityAlerts.severity, 'critical')
      ));

    // Get threats blocked (last 24h)
    const [threatsBlocked] = await db.select({
      count: count()
    })
    .from(securityEvents)
    .where(and(
      gte(securityEvents.createdAt, last24h),
      eq(securityEvents.blocked, true)
    ));

    // Calculate health score
    const healthScore = calculateSystemHealthScore({
      runningBots: runningBots?.count || 0,
      totalBots: totalBots?.count || 500,
      criticalAlerts: criticalAlerts?.count || 0,
      openAlerts: openAlertsCount?.count || 0
    });

    res.json({
      timestamp: now,
      systemHealth: {
        score: healthScore,
        status: healthScore >= 90 ? 'healthy' : healthScore >= 70 ? 'degraded' : 'critical'
      },
      bots: {
        total: totalBots?.count || 500,
        running: runningBots?.count || 0,
        stopped: (totalBots?.count || 500) - (runningBots?.count || 0)
      },
      threats: {
        blocked24h: threatsBlocked?.count || 0,
        eventsBySeverity: eventsBySeverity.reduce((acc, e) => {
          acc[e.severity] = e.count;
          return acc;
        }, {} as Record<string, number>)
      },
      alerts: {
        open: openAlertsCount?.count || 0,
        critical: criticalAlerts?.count || 0
      },
      blockedIps: blockedIpCount?.count || 0
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Overview error:', error);
    res.status(500).json({ error: 'Failed to fetch security overview' });
  }
});

// ===== SECURITY BOTS MANAGEMENT =====

// GET /api/cybersecurity/bots
// List all 500 security bots
router.get('/bots', async (req: Request, res: Response) => {
  try {
    const { category, running, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (category) conditions.push(eq(securityBotStatus.category, category as any));
    if (running === 'true') conditions.push(eq(securityBotStatus.isRunning, true));
    if (running === 'false') conditions.push(eq(securityBotStatus.isRunning, false));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [bots, [total]] = await Promise.all([
      db.select()
        .from(securityBotStatus)
        .where(whereClause)
        .orderBy(securityBotStatus.botId)
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(securityBotStatus)
        .where(whereClause)
    ]);

    res.json({
      bots,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List bots error:', error);
    res.status(500).json({ error: 'Failed to list security bots' });
  }
});

// GET /api/cybersecurity/bots/:botId
// Get specific bot details
router.get('/bots/:botId', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;

    const [bot] = await db.select()
      .from(securityBotStatus)
      .where(eq(securityBotStatus.botId, botId));

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    // Get recent events from this bot
    const recentEvents = await db.select()
      .from(securityEvents)
      .where(eq(securityEvents.botId, botId))
      .orderBy(desc(securityEvents.createdAt))
      .limit(20);

    res.json({
      bot,
      recentEvents
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Get bot error:', error);
    res.status(500).json({ error: 'Failed to get bot details' });
  }
});

// POST /api/cybersecurity/bots/:botId/toggle
// Start/stop a security bot
router.post('/bots/:botId/toggle', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { action } = req.body; // 'start' or 'stop'

    const [bot] = await db.select()
      .from(securityBotStatus)
      .where(eq(securityBotStatus.botId, botId));

    if (!bot) {
      return res.status(404).json({ error: 'Bot not found' });
    }

    const isRunning = action === 'start';

    await db.update(securityBotStatus)
      .set({
        isRunning,
        startedAt: isRunning ? new Date() : bot.startedAt,
        updatedAt: new Date()
      })
      .where(eq(securityBotStatus.botId, botId));

    res.json({
      success: true,
      botId,
      isRunning,
      message: `Bot ${botId} ${isRunning ? 'started' : 'stopped'}`
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Toggle bot error:', error);
    res.status(500).json({ error: 'Failed to toggle bot' });
  }
});

// ===== SECURITY EVENTS =====

// GET /api/cybersecurity/events
// List security events
router.get('/events', async (req: Request, res: Response) => {
  try {
    const {
      severity,
      eventType,
      botId,
      platform,
      blocked,
      startDate,
      endDate,
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (severity) conditions.push(eq(securityEvents.severity, severity as any));
    if (eventType) conditions.push(eq(securityEvents.eventType, eventType as any));
    if (botId) conditions.push(eq(securityEvents.botId, botId as string));
    if (platform) conditions.push(eq(securityEvents.platform, platform as string));
    if (blocked === 'true') conditions.push(eq(securityEvents.blocked, true));
    if (startDate) conditions.push(gte(securityEvents.createdAt, new Date(startDate as string)));
    if (endDate) conditions.push(lte(securityEvents.createdAt, new Date(endDate as string)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [events, [total]] = await Promise.all([
      db.select()
        .from(securityEvents)
        .where(whereClause)
        .orderBy(desc(securityEvents.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(securityEvents)
        .where(whereClause)
    ]);

    res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List events error:', error);
    res.status(500).json({ error: 'Failed to list security events' });
  }
});

// POST /api/cybersecurity/events/:eventId/review
// Mark event as reviewed/false positive
router.post('/events/:eventId/review', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { falsePositive, notes } = req.body;
    const reviewerId = (req as any).user?.id || 'admin';

    await db.update(securityEvents)
      .set({
        falsePositive: falsePositive === true,
        reviewedBy: reviewerId,
        reviewedAt: new Date()
      })
      .where(eq(securityEvents.id, eventId));

    res.json({ success: true, message: 'Event reviewed' });
  } catch (error) {
    console.error('[CybersecurityAPI] Review event error:', error);
    res.status(500).json({ error: 'Failed to review event' });
  }
});

// ===== BLOCKED IPS =====

// GET /api/cybersecurity/blocked-ips
// List blocked IPs
router.get('/blocked-ips', async (req: Request, res: Response) => {
  try {
    const { active, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const now = new Date();
    const conditions = [];

    if (active === 'true') {
      conditions.push(or(isNull(blockedIps.expiresAt), gte(blockedIps.expiresAt, now)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [ips, [total]] = await Promise.all([
      db.select()
        .from(blockedIps)
        .where(whereClause)
        .orderBy(desc(blockedIps.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(blockedIps)
        .where(whereClause)
    ]);

    res.json({
      blockedIps: ips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List blocked IPs error:', error);
    res.status(500).json({ error: 'Failed to list blocked IPs' });
  }
});

// POST /api/cybersecurity/blocked-ips
// Manually block an IP
router.post('/blocked-ips', async (req: Request, res: Response) => {
  try {
    const { ipAddress, reason, blockType = 'permanent', durationMinutes } = req.body;
    const adminId = (req as any).user?.id || 'admin';

    const expiresAt = blockType === 'temporary' && durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : null;

    const [blocked] = await db.insert(blockedIps)
      .values({
        ipAddress,
        reason,
        blockedBy: adminId,
        blockType,
        severity: 'high',
        expiresAt
      })
      .returning();

    res.json({ success: true, blockedIp: blocked });
  } catch (error) {
    console.error('[CybersecurityAPI] Block IP error:', error);
    res.status(500).json({ error: 'Failed to block IP' });
  }
});

// DELETE /api/cybersecurity/blocked-ips/:id
// Unblock an IP
router.delete('/blocked-ips/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(blockedIps).where(eq(blockedIps.id, id));

    res.json({ success: true, message: 'IP unblocked' });
  } catch (error) {
    console.error('[CybersecurityAPI] Unblock IP error:', error);
    res.status(500).json({ error: 'Failed to unblock IP' });
  }
});

// ===== SECURITY ALERTS =====

// GET /api/cybersecurity/alerts
// List security alerts
router.get('/alerts', async (req: Request, res: Response) => {
  try {
    const { status, severity, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (status) conditions.push(eq(securityAlerts.status, status as string));
    if (severity) conditions.push(eq(securityAlerts.severity, severity as any));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [alerts, [total]] = await Promise.all([
      db.select()
        .from(securityAlerts)
        .where(whereClause)
        .orderBy(desc(securityAlerts.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(securityAlerts)
        .where(whereClause)
    ]);

    res.json({
      alerts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List alerts error:', error);
    res.status(500).json({ error: 'Failed to list alerts' });
  }
});

// POST /api/cybersecurity/alerts/:alertId/acknowledge
// Acknowledge an alert
router.post('/alerts/:alertId/acknowledge', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const adminId = (req as any).user?.id || 'admin';

    await db.update(securityAlerts)
      .set({
        status: 'acknowledged',
        acknowledgedBy: adminId,
        acknowledgedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(securityAlerts.id, alertId));

    res.json({ success: true, message: 'Alert acknowledged' });
  } catch (error) {
    console.error('[CybersecurityAPI] Acknowledge alert error:', error);
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// POST /api/cybersecurity/alerts/:alertId/resolve
// Resolve an alert
router.post('/alerts/:alertId/resolve', async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { resolutionNotes } = req.body;
    const adminId = (req as any).user?.id || 'admin';

    await db.update(securityAlerts)
      .set({
        status: 'resolved',
        resolvedBy: adminId,
        resolvedAt: new Date(),
        resolutionNotes,
        updatedAt: new Date()
      })
      .where(eq(securityAlerts.id, alertId));

    res.json({ success: true, message: 'Alert resolved' });
  } catch (error) {
    console.error('[CybersecurityAPI] Resolve alert error:', error);
    res.status(500).json({ error: 'Failed to resolve alert' });
  }
});

// ===== ATTACK PATTERNS =====

// GET /api/cybersecurity/patterns
// List detected attack patterns
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const { category, active, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (category) conditions.push(eq(attackPatterns.category, category as any));
    if (active === 'true') conditions.push(eq(attackPatterns.isActive, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [patterns, [total]] = await Promise.all([
      db.select()
        .from(attackPatterns)
        .where(whereClause)
        .orderBy(desc(attackPatterns.detectionCount))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(attackPatterns)
        .where(whereClause)
    ]);

    res.json({
      patterns,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List patterns error:', error);
    res.status(500).json({ error: 'Failed to list attack patterns' });
  }
});

// ===== RATE LIMIT RULES =====

// GET /api/cybersecurity/rate-limits
// List rate limit rules
router.get('/rate-limits', async (req: Request, res: Response) => {
  try {
    const rules = await db.select()
      .from(rateLimitRules)
      .orderBy(desc(rateLimitRules.priority));

    res.json({ rules });
  } catch (error) {
    console.error('[CybersecurityAPI] List rate limits error:', error);
    res.status(500).json({ error: 'Failed to list rate limit rules' });
  }
});

// POST /api/cybersecurity/rate-limits
// Create rate limit rule
router.post('/rate-limits', async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      endpoint,
      method,
      windowSeconds,
      maxRequests,
      blockDurationSeconds,
      byIp,
      byUser,
      bySession,
      exemptRoles,
      exemptIps,
      priority
    } = req.body;

    const adminId = (req as any).user?.id || 'admin';

    const [rule] = await db.insert(rateLimitRules)
      .values({
        name,
        description,
        endpoint,
        method,
        windowSeconds: windowSeconds || 60,
        maxRequests: maxRequests || 100,
        blockDurationSeconds: blockDurationSeconds || 300,
        byIp: byIp !== false,
        byUser: byUser === true,
        bySession: bySession === true,
        exemptRoles: exemptRoles || [],
        exemptIps: exemptIps || [],
        priority: priority || 0,
        createdBy: adminId
      })
      .returning();

    res.json({ success: true, rule });
  } catch (error) {
    console.error('[CybersecurityAPI] Create rate limit error:', error);
    res.status(500).json({ error: 'Failed to create rate limit rule' });
  }
});

// DELETE /api/cybersecurity/rate-limits/:id
// Delete rate limit rule
router.delete('/rate-limits/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await db.delete(rateLimitRules).where(eq(rateLimitRules.id, id));

    res.json({ success: true, message: 'Rate limit rule deleted' });
  } catch (error) {
    console.error('[CybersecurityAPI] Delete rate limit error:', error);
    res.status(500).json({ error: 'Failed to delete rate limit rule' });
  }
});

// ===== BOT LAW VIOLATIONS =====

// GET /api/cybersecurity/bot-law-violations
// List BOT LAW violations
router.get('/bot-law-violations', async (req: Request, res: Response) => {
  try {
    const { acknowledged, severity, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (acknowledged === 'true') conditions.push(eq(botLawViolations.acknowledged, true));
    if (acknowledged === 'false') conditions.push(eq(botLawViolations.acknowledged, false));
    if (severity) conditions.push(eq(botLawViolations.severity, severity as any));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [violations, [total]] = await Promise.all([
      db.select()
        .from(botLawViolations)
        .where(whereClause)
        .orderBy(desc(botLawViolations.createdAt))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(botLawViolations)
        .where(whereClause)
    ]);

    res.json({
      violations,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List BOT LAW violations error:', error);
    res.status(500).json({ error: 'Failed to list BOT LAW violations' });
  }
});

// POST /api/cybersecurity/bot-law-violations/:id/acknowledge
// Acknowledge a BOT LAW violation
router.post('/bot-law-violations/:id/acknowledge', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminId = (req as any).user?.id || 'admin';

    await db.update(botLawViolations)
      .set({
        acknowledged: true,
        reviewedBy: adminId,
        reviewedAt: new Date()
      })
      .where(eq(botLawViolations.id, id));

    res.json({ success: true, message: 'Violation acknowledged' });
  } catch (error) {
    console.error('[CybersecurityAPI] Acknowledge violation error:', error);
    res.status(500).json({ error: 'Failed to acknowledge violation' });
  }
});

// ===== THREAT INTELLIGENCE =====

// GET /api/cybersecurity/threat-intel
// List threat intelligence indicators
router.get('/threat-intel', async (req: Request, res: Response) => {
  try {
    const { indicatorType, threatType, active, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = Math.min(parseInt(limit as string), 100);
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    if (indicatorType) conditions.push(eq(threatIntelligence.indicatorType, indicatorType as string));
    if (threatType) conditions.push(eq(threatIntelligence.threatType, threatType as string));
    if (active === 'true') conditions.push(eq(threatIntelligence.isActive, true));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [indicators, [total]] = await Promise.all([
      db.select()
        .from(threatIntelligence)
        .where(whereClause)
        .orderBy(desc(threatIntelligence.lastSeen))
        .limit(limitNum)
        .offset(offset),
      db.select({ count: count() })
        .from(threatIntelligence)
        .where(whereClause)
    ]);

    res.json({
      indicators,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: total?.count || 0,
        totalPages: Math.ceil((total?.count || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('[CybersecurityAPI] List threat intel error:', error);
    res.status(500).json({ error: 'Failed to list threat intelligence' });
  }
});

// POST /api/cybersecurity/threat-intel
// Add threat intelligence indicator
router.post('/threat-intel', async (req: Request, res: Response) => {
  try {
    const {
      indicator,
      indicatorType,
      threatType,
      severity,
      confidence,
      source,
      tags,
      expiresAt
    } = req.body;

    const [intel] = await db.insert(threatIntelligence)
      .values({
        indicator,
        indicatorType,
        threatType,
        severity: severity || 'medium',
        confidence: confidence || 80,
        source,
        tags: tags || [],
        firstSeen: new Date(),
        lastSeen: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null
      })
      .returning();

    res.json({ success: true, indicator: intel });
  } catch (error) {
    console.error('[CybersecurityAPI] Add threat intel error:', error);
    res.status(500).json({ error: 'Failed to add threat intelligence' });
  }
});

// ===== CAPABILITY TOGGLES =====

// GET /api/cybersecurity/capability-toggles/:agentId
// Get capability toggles for an agent
router.get('/capability-toggles/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const toggles = await db.select()
      .from(aiCapabilityToggles)
      .where(eq(aiCapabilityToggles.agentId, agentId));

    res.json({ toggles });
  } catch (error) {
    console.error('[CybersecurityAPI] Get capability toggles error:', error);
    res.status(500).json({ error: 'Failed to get capability toggles' });
  }
});

// POST /api/cybersecurity/capability-toggles/:agentId/:capability
// Toggle a capability for an agent (DANGEROUS - requires approval)
router.post('/capability-toggles/:agentId/:capability', async (req: Request, res: Response) => {
  try {
    const { agentId, capability } = req.params;
    const { enabled, trainingCompleted } = req.body;
    const adminId = (req as any).user?.id || 'admin';

    // BOT LAW: Execution capabilities require extra validation
    const executionCapabilities = ['execute', 'restart', 'deploy', 'modify', 'delete', 'scale'];
    if (executionCapabilities.includes(capability) && enabled) {
      // Log as potential violation
      await db.insert(botLawViolations)
        .values({
          agentId,
          agentName: agentId,
          violationType: 'CAPABILITY_ENABLE_ATTEMPT',
          severity: 'high',
          details: `Attempt to enable execution capability: ${capability}`,
          configSnapshot: { capability, enabled },
          autoFixed: false
        });
    }

    // Update or insert the toggle
    const existing = await db.select()
      .from(aiCapabilityToggles)
      .where(and(
        eq(aiCapabilityToggles.agentId, agentId),
        eq(aiCapabilityToggles.capability, capability)
      ));

    if (existing.length > 0) {
      await db.update(aiCapabilityToggles)
        .set({
          enabled: enabled === true,
          enabledBy: enabled ? adminId : existing[0].enabledBy,
          enabledAt: enabled ? new Date() : existing[0].enabledAt,
          disabledBy: !enabled ? adminId : existing[0].disabledBy,
          disabledAt: !enabled ? new Date() : existing[0].disabledAt,
          trainingCompleted: trainingCompleted === true,
          updatedAt: new Date()
        })
        .where(eq(aiCapabilityToggles.id, existing[0].id));
    } else {
      await db.insert(aiCapabilityToggles)
        .values({
          agentId,
          capability,
          enabled: enabled === true,
          enabledBy: enabled ? adminId : null,
          enabledAt: enabled ? new Date() : null,
          trainingCompleted: trainingCompleted === true
        });
    }

    res.json({
      success: true,
      message: `Capability ${capability} ${enabled ? 'enabled' : 'disabled'} for ${agentId}`,
      warning: executionCapabilities.includes(capability)
        ? 'WARNING: Execution capability changes are logged per FANZ BOT LAW'
        : undefined
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Toggle capability error:', error);
    res.status(500).json({ error: 'Failed to toggle capability' });
  }
});

// ===== SECURITY METRICS =====

// GET /api/cybersecurity/metrics
// Get security metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const { metricName, botId, startDate, endDate, limit = '1000' } = req.query;
    const limitNum = Math.min(parseInt(limit as string), 10000);

    const conditions = [];
    if (metricName) conditions.push(eq(securityMetrics.metricName, metricName as string));
    if (botId) conditions.push(eq(securityMetrics.botId, botId as string));
    if (startDate) conditions.push(gte(securityMetrics.timestamp, new Date(startDate as string)));
    if (endDate) conditions.push(lte(securityMetrics.timestamp, new Date(endDate as string)));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const metrics = await db.select()
      .from(securityMetrics)
      .where(whereClause)
      .orderBy(desc(securityMetrics.timestamp))
      .limit(limitNum);

    res.json({ metrics });
  } catch (error) {
    console.error('[CybersecurityAPI] Get metrics error:', error);
    res.status(500).json({ error: 'Failed to get security metrics' });
  }
});

// ===== BULK OPERATIONS =====

// POST /api/cybersecurity/bots/start-all
// Start all security bots
router.post('/bots/start-all', async (req: Request, res: Response) => {
  try {
    const { category } = req.body;

    const conditions = category
      ? eq(securityBotStatus.category, category)
      : undefined;

    await db.update(securityBotStatus)
      .set({
        isRunning: true,
        startedAt: new Date(),
        updatedAt: new Date()
      })
      .where(conditions);

    const [count] = await db.select({ count: count() })
      .from(securityBotStatus)
      .where(conditions);

    res.json({
      success: true,
      message: `Started ${count?.count || 0} security bots`,
      category: category || 'all'
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Start all bots error:', error);
    res.status(500).json({ error: 'Failed to start all bots' });
  }
});

// POST /api/cybersecurity/bots/stop-all
// Stop all security bots
router.post('/bots/stop-all', async (req: Request, res: Response) => {
  try {
    const { category } = req.body;

    const conditions = category
      ? eq(securityBotStatus.category, category)
      : undefined;

    await db.update(securityBotStatus)
      .set({
        isRunning: false,
        updatedAt: new Date()
      })
      .where(conditions);

    const [count] = await db.select({ count: count() })
      .from(securityBotStatus)
      .where(conditions);

    res.json({
      success: true,
      message: `Stopped ${count?.count || 0} security bots`,
      category: category || 'all'
    });
  } catch (error) {
    console.error('[CybersecurityAPI] Stop all bots error:', error);
    res.status(500).json({ error: 'Failed to stop all bots' });
  }
});

// ===== HELPER FUNCTIONS =====

function calculateSystemHealthScore(data: {
  runningBots: number;
  totalBots: number;
  criticalAlerts: number;
  openAlerts: number;
}): number {
  let score = 100;

  // Deduct for stopped bots
  const botUptime = data.runningBots / data.totalBots;
  score -= (1 - botUptime) * 30;

  // Deduct for critical alerts
  score -= Math.min(data.criticalAlerts * 10, 30);

  // Deduct for open alerts
  score -= Math.min(data.openAlerts * 2, 20);

  return Math.max(0, Math.round(score));
}

export default router;
