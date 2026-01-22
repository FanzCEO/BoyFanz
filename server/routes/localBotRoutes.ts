/**
 * Local Bot API Routes
 *
 * Platform-specific bot endpoints for managing local bots.
 * These bots run within the platform and handle platform-specific tasks.
 */

import { Router, Request, Response } from 'express';

const router = Router();

// Platform-specific local bots
const localBots = [
  {
    id: 'content-moderation-bot',
    name: 'Content Moderation Bot',
    description: 'AI-powered content moderation with platform-specific rules',
    type: 'local' as const,
    category: 'moderation',
    status: 'running' as const,
    autonomyLevel: 2,
    metrics: {
      tasksCompleted: 1247,
      pendingTasks: 12,
      successRate: 98.5,
      avgResponseTime: 45,
    },
    config: {
      autoApproveThreshold: 0.95,
      flagThreshold: 0.7,
      escalateThreshold: 0.5,
    },
  },
  {
    id: 'platform-health-bot',
    name: 'Platform Health Bot',
    description: 'Monitors platform health, performance, and uptime',
    type: 'local' as const,
    category: 'operations',
    status: 'running' as const,
    autonomyLevel: 2,
    metrics: {
      tasksCompleted: 8750,
      pendingTasks: 0,
      successRate: 100,
      avgResponseTime: 12,
    },
    config: {
      checkIntervalMs: 30000,
      cpuAlertThreshold: 80,
      memoryAlertThreshold: 99,
    },
  },
  {
    id: 'user-financial-bot',
    name: 'User Financial Bot',
    description: 'Handles user transactions, payouts, and financial tracking',
    type: 'local' as const,
    category: 'financial',
    status: 'running' as const,
    autonomyLevel: 1,
    metrics: {
      tasksCompleted: 456,
      pendingTasks: 3,
      successRate: 99.8,
      avgResponseTime: 89,
    },
    config: {
      minPayoutAmount: 50,
      payoutSchedule: 'weekly',
      autoProcessThreshold: 1000,
    },
  },
];

// Track bot status dynamically
const botStatus: Record<string, { status: string; lastHeartbeat: Date }> = {};
localBots.forEach(bot => {
  botStatus[bot.id] = { status: 'running', lastHeartbeat: new Date() };
});

/**
 * GET /api/bots/local
 * Returns all local bots for this platform
 */
router.get('/', (req: Request, res: Response) => {
  const bots = localBots.map(bot => ({
    ...bot,
    status: botStatus[bot.id]?.status || bot.status,
    lastHeartbeat: botStatus[bot.id]?.lastHeartbeat?.toISOString(),
  }));

  res.json({
    bots,
    count: bots.length,
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/bots/local/status
 * Returns status summary for all local bots
 */
router.get('/status', (req: Request, res: Response) => {
  const bots = localBots.map(bot => ({
    id: bot.id,
    name: bot.name,
    type: bot.type,
    status: botStatus[bot.id]?.status || bot.status,
    lastHeartbeat: botStatus[bot.id]?.lastHeartbeat?.toISOString(),
    metrics: bot.metrics,
  }));

  res.json({ bots, timestamp: new Date().toISOString() });
});

/**
 * GET /api/bots/local/:botId
 * Returns detailed info for a specific local bot
 */
router.get('/:botId', (req: Request, res: Response) => {
  const bot = localBots.find(b => b.id === req.params.botId);

  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  res.json({
    ...bot,
    status: botStatus[bot.id]?.status || bot.status,
    lastHeartbeat: botStatus[bot.id]?.lastHeartbeat?.toISOString(),
  });
});

/**
 * POST /api/bots/local/:botId/start
 * Start a specific local bot
 */
router.post('/:botId/start', (req: Request, res: Response) => {
  const bot = localBots.find(b => b.id === req.params.botId);

  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  botStatus[bot.id] = { status: 'running', lastHeartbeat: new Date() };

  res.json({
    success: true,
    bot_id: bot.id,
    status: 'running',
    message: `${bot.name} started successfully`,
  });
});

/**
 * POST /api/bots/local/:botId/stop
 * Stop a specific local bot
 */
router.post('/:botId/stop', (req: Request, res: Response) => {
  const bot = localBots.find(b => b.id === req.params.botId);

  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  botStatus[bot.id] = { status: 'stopped', lastHeartbeat: new Date() };

  res.json({
    success: true,
    bot_id: bot.id,
    status: 'stopped',
    message: `${bot.name} stopped successfully`,
  });
});

/**
 * PUT /api/bots/local/:botId/config
 * Update configuration for a specific local bot
 */
router.put('/:botId/config', (req: Request, res: Response) => {
  const bot = localBots.find(b => b.id === req.params.botId);

  if (!bot) {
    return res.status(404).json({ error: 'Bot not found' });
  }

  const { config } = req.body;

  if (config && typeof config === 'object') {
    bot.config = { ...bot.config, ...config };
  }

  res.json({
    success: true,
    bot_id: bot.id,
    config: bot.config,
    message: `${bot.name} configuration updated`,
  });
});

export default router;
