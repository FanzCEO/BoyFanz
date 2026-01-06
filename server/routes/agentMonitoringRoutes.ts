// @ts-nocheck
/**
 * Agent Monitoring API Routes
 *
 * Provides endpoints for monitoring and managing 24/7 bots and agents.
 */

import { Router } from 'express';
import { agentMonitoringService, AgentType } from '../services/agentMonitoringService';
import { isAuthenticated, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * GET /api/agents/health
 * Get overall health status of all agents
 */
router.get('/health', isAuthenticated, async (req, res) => {
  try {
    const health = agentMonitoringService.getHealthStatus();
    res.json(health);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get health status', message: error.message });
  }
});

/**
 * GET /api/agents/status
 * Get status of all agents (admin only)
 */
router.get('/status', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const health = agentMonitoringService.getHealthStatus();
    res.json({
      isRunning: true,
      uptime: process.uptime(),
      agents: health.agents,
      metrics: health.metrics,
      overallStatus: health.overallStatus,
      issues: health.issues,
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get agent status', message: error.message });
  }
});

/**
 * GET /api/agents/:agentType
 * Get status of a specific agent
 */
router.get('/:agentType', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { agentType } = req.params;
    const status = agentMonitoringService.getAgentStatus(agentType as AgentType);

    if (!status) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(status);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get agent status', message: error.message });
  }
});

/**
 * POST /api/agents/:agentType/restart
 * Restart a specific agent (admin only)
 */
router.post('/:agentType/restart', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { agentType } = req.params;
    const success = await agentMonitoringService.restartAgent(agentType as AgentType);

    if (success) {
      res.json({ message: `Agent ${agentType} restart initiated` });
    } else {
      res.status(500).json({ error: 'Failed to restart agent' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to restart agent', message: error.message });
  }
});

/**
 * POST /api/agents/:agentType/heartbeat
 * Record a heartbeat from an agent (internal use)
 */
router.post('/:agentType/heartbeat', async (req, res) => {
  try {
    const { agentType } = req.params;
    const metrics = req.body;

    agentMonitoringService.recordHeartbeat(agentType as AgentType, metrics);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record heartbeat', message: error.message });
  }
});

/**
 * POST /api/agents/start
 * Start the monitoring service (admin only)
 */
router.post('/start', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    await agentMonitoringService.start();
    res.json({ message: 'Agent monitoring service started' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to start service', message: error.message });
  }
});

/**
 * POST /api/agents/stop
 * Stop the monitoring service (admin only)
 */
router.post('/stop', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    await agentMonitoringService.stop();
    res.json({ message: 'Agent monitoring service stopped' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to stop service', message: error.message });
  }
});

export default router;
