/**
 * FanzMediaBot API Routes
 * Control and monitor the autonomous media optimization bot
 */

import { Router, Request, Response } from 'express';
import { fanzMediaBot } from './FanzMediaBot';
import { authenticateJWT, requireAdmin } from '../../middleware/auth';
import { logger } from '../../logger';

const router = Router();

// Get bot status
router.get('/api/media-bot/status', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const status = fanzMediaBot.getStatus();
    res.json({ success: true, ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start the bot (admin only)
router.post('/api/media-bot/start', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    await fanzMediaBot.start();
    res.json({ success: true, message: 'FanzMediaBot started' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Stop the bot (admin only)
router.post('/api/media-bot/stop', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    await fanzMediaBot.stop();
    res.json({ success: true, message: 'FanzMediaBot stopped' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Force health check
router.post('/api/media-bot/health-check', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    await fanzMediaBot.forceHealthCheck();
    const status = fanzMediaBot.getStatus();
    res.json({ success: true, message: 'Health check completed', ...status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all capabilities
router.get('/api/media-bot/capabilities', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const capabilities = fanzMediaBot.getCapabilities();
    res.json({ success: true, capabilities });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add new capability (admin only)
router.post('/api/media-bot/capabilities', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { name, category, status, platforms, version } = req.body;
    const capability = await fanzMediaBot.addCapability({
      name,
      category,
      status: status || 'planned',
      platforms: platforms || [],
      version: version || '0.1.0'
    });
    res.json({ success: true, capability });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Deploy capability to platforms (admin only)
router.post('/api/media-bot/capabilities/:capabilityId/deploy', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { capabilityId } = req.params;
    const { platforms } = req.body;

    if (!platforms || !Array.isArray(platforms)) {
      return res.status(400).json({ success: false, error: 'platforms array required' });
    }

    const success = await fanzMediaBot.deployCapability(capabilityId, platforms);
    if (success) {
      res.json({ success: true, message: `Capability deployed to ${platforms.join(', ')}` });
    } else {
      res.status(404).json({ success: false, error: 'Capability not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get platform health
router.get('/api/media-bot/platforms/:platformId/health', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const { platformId } = req.params;
    const health = fanzMediaBot.getPlatformHealth(platformId);
    res.json({ success: true, platformId, streams: health });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active issues
router.get('/api/media-bot/issues', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const issues = fanzMediaBot.getActiveIssues();
    res.json({ success: true, count: issues.length, issues });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get pending optimizations
router.get('/api/media-bot/optimizations', authenticateJWT, async (req: Request, res: Response) => {
  try {
    const optimizations = fanzMediaBot.getPendingOptimizations();
    res.json({ success: true, count: optimizations.length, optimizations });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Trigger manual optimization for platform (admin only)
router.post('/api/media-bot/platforms/:platformId/optimize', authenticateJWT, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { platformId } = req.params;
    const action = await fanzMediaBot.triggerOptimization(platformId);

    if (action) {
      res.json({ success: true, action });
    } else {
      res.status(404).json({ success: false, error: 'Platform not found' });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Event stream for real-time updates
router.get('/api/media-bot/events', authenticateJWT, (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  // Initial status
  sendEvent('status', fanzMediaBot.getStatus());

  // Listen for events
  const onCycleComplete = (data: any) => sendEvent('cycle', data);
  const onIssueResolved = (data: any) => sendEvent('issue-resolved', data);
  const onOptimization = (data: any) => sendEvent('optimization', data);
  const onCapability = (data: any) => sendEvent('capability', data);

  fanzMediaBot.on('cycle:complete', onCycleComplete);
  fanzMediaBot.on('issue:resolved', onIssueResolved);
  fanzMediaBot.on('optimization:applied', onOptimization);
  fanzMediaBot.on('capability:added', onCapability);

  // Cleanup on disconnect
  req.on('close', () => {
    fanzMediaBot.off('cycle:complete', onCycleComplete);
    fanzMediaBot.off('issue:resolved', onIssueResolved);
    fanzMediaBot.off('optimization:applied', onOptimization);
    fanzMediaBot.off('capability:added', onCapability);
  });
});

export default router;
