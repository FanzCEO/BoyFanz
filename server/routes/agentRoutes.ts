/**
 * Agent Routes for BoyFanz
 * API endpoints for local bot management
 */

import { Router, Request, Response } from 'express';
import {
  localBots,
  localBotMetadata,
  getAllLocalBotStatus,
  startAllLocalBots,
  stopAllLocalBots,
} from '../bots/localBots';

const router = Router();

/**
 * GET /api/local-bots
 * List all local bots with their current status
 */
router.get('/', async (_req: Request, res: Response) => {
  try {
    const bots = getAllLocalBotStatus();

    res.json({
      success: true,
      platformId: 'boyfanz',
      totalBots: bots.length,
      runningBots: bots.filter(b => b.isRunning).length,
      bots: bots.map(bot => ({
        id: bot.id,
        name: bot.name,
        description: bot.description,
        category: bot.category,
        type: 'local',
        isRunning: bot.isRunning,
        uptime: bot.status.uptime,
        stats: bot.status.stats,
        issues: bot.status.issues,
        recentActions: bot.status.recentActions,
      })),
    });
  } catch (error) {
    console.error('[AgentRoutes] Error listing local bots:', error);
    res.status(500).json({ success: false, error: 'Failed to list local bots' });
  }
});

/**
 * GET /api/local-bots/:botId/status
 * Get detailed status for a specific local bot
 */
router.get('/:botId/status', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const bot = localBots[botId];

    if (!bot) {
      return res.status(404).json({ success: false, error: `Bot '${botId}' not found` });
    }

    const meta = localBotMetadata[botId];
    const status = bot.getStatus();

    res.json({
      success: true,
      bot: {
        id: botId,
        name: meta.name,
        description: meta.description,
        category: meta.category,
        type: 'local',
      },
      ...status,
    });
  } catch (error) {
    console.error(`[AgentRoutes] Error getting status for ${req.params.botId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to get bot status' });
  }
});

/**
 * GET /api/local-bots/:botId/issues
 * Get active issues for a specific local bot
 */
router.get('/:botId/issues', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const bot = localBots[botId];

    if (!bot) {
      return res.status(404).json({ success: false, error: `Bot '${botId}' not found` });
    }

    const status = bot.getStatus();

    res.json({
      success: true,
      botId,
      totalIssues: status.issues.length,
      issues: status.issues,
    });
  } catch (error) {
    console.error(`[AgentRoutes] Error getting issues for ${req.params.botId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to get bot issues' });
  }
});

/**
 * GET /api/local-bots/:botId/actions
 * Get recent actions for a specific local bot
 */
router.get('/:botId/actions', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const bot = localBots[botId];

    if (!bot) {
      return res.status(404).json({ success: false, error: `Bot '${botId}' not found` });
    }

    const status = bot.getStatus();
    const limit = parseInt(req.query.limit as string) || 50;

    res.json({
      success: true,
      botId,
      totalActions: status.recentActions.length,
      actions: status.recentActions.slice(0, limit),
    });
  } catch (error) {
    console.error(`[AgentRoutes] Error getting actions for ${req.params.botId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to get bot actions' });
  }
});

/**
 * POST /api/local-bots/:botId/action
 * Trigger an action on a specific local bot (admin only)
 */
router.post('/:botId/action', async (req: Request, res: Response) => {
  try {
    const { botId } = req.params;
    const { action } = req.body;
    const bot = localBots[botId] as any;

    if (!bot) {
      return res.status(404).json({ success: false, error: `Bot '${botId}' not found` });
    }

    // Handle common actions
    switch (action) {
      case 'start':
        await bot.start();
        return res.json({ success: true, message: `Bot ${botId} started` });
      case 'stop':
        await bot.stop();
        return res.json({ success: true, message: `Bot ${botId} stopped` });
      case 'restart':
        await bot.stop();
        await bot.start();
        return res.json({ success: true, message: `Bot ${botId} restarted` });
      default:
        return res.status(400).json({ success: false, error: `Unknown action: ${action}` });
    }
  } catch (error) {
    console.error(`[AgentRoutes] Error executing action on ${req.params.botId}:`, error);
    res.status(500).json({ success: false, error: 'Failed to execute bot action' });
  }
});

/**
 * POST /api/local-bots/start-all
 * Start all local bots
 */
router.post('/start-all', async (_req: Request, res: Response) => {
  try {
    await startAllLocalBots();
    res.json({ success: true, message: 'All local bots started' });
  } catch (error) {
    console.error('[AgentRoutes] Error starting all bots:', error);
    res.status(500).json({ success: false, error: 'Failed to start all bots' });
  }
});

/**
 * POST /api/local-bots/stop-all
 * Stop all local bots
 */
router.post('/stop-all', async (_req: Request, res: Response) => {
  try {
    await stopAllLocalBots();
    res.json({ success: true, message: 'All local bots stopped' });
  } catch (error) {
    console.error('[AgentRoutes] Error stopping all bots:', error);
    res.status(500).json({ success: false, error: 'Failed to stop all bots' });
  }
});

export default router;
