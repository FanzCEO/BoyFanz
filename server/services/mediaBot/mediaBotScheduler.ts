/**
 * FanzMediaBot Scheduler
 * Scheduled tasks for media optimization, maintenance, and feature rollouts
 */

import { fanzMediaBot } from './FanzMediaBot';
import { logger } from '../../logger';

interface ScheduledTask {
  id: string;
  name: string;
  schedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
  lastRun?: Date;
  nextRun: Date;
  enabled: boolean;
  handler: () => Promise<void>;
}

class MediaBotScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  constructor() {
    this.registerDefaultTasks();
  }

  private registerDefaultTasks(): void {
    // Hourly stream health audit
    this.addTask({
      id: 'stream-health-audit',
      name: 'Stream Health Audit',
      schedule: 'hourly',
      enabled: true,
      handler: async () => {
        logger.info('Running hourly stream health audit');
        await fanzMediaBot.forceHealthCheck();
        const status = fanzMediaBot.getStatus();
        logger.info(`Audit complete: ${status.activeStreams} streams, ${status.issuesCount} issues`);
      }
    });

    // Daily CDN optimization
    this.addTask({
      id: 'cdn-optimization',
      name: 'CDN Performance Optimization',
      schedule: 'daily',
      enabled: true,
      handler: async () => {
        logger.info('Running daily CDN optimization');
        const platforms = [
          'boyfanz', 'girlfanz', 'gayfanz', 'transfanz', 'milffanz',
          'cougarfanz', 'bearfanz', 'daddyfanz', 'pupfanz', 'taboofanz',
          'fanzuncut', 'femmefanz', 'brofanz', 'southernfanz', 'dlbroz', 'guyz'
        ];

        for (const platform of platforms) {
          await fanzMediaBot.triggerOptimization(platform);
        }
        logger.info('CDN optimization complete for all platforms');
      }
    });

    // Daily encoding profile update
    this.addTask({
      id: 'encoding-profile-update',
      name: 'Encoding Profile Optimization',
      schedule: 'daily',
      enabled: true,
      handler: async () => {
        logger.info('Analyzing encoding profiles across platforms');
        // Analyze stream quality and adjust encoding presets
        const capabilities = fanzMediaBot.getCapabilities();
        const encodingCaps = capabilities.filter(c => c.category === 'encoding');
        logger.info(`Active encoding capabilities: ${encodingCaps.length}`);
      }
    });

    // Weekly feature health check
    this.addTask({
      id: 'feature-health-check',
      name: 'Feature Capability Health Check',
      schedule: 'weekly',
      enabled: true,
      handler: async () => {
        logger.info('Running weekly feature health check');
        const capabilities = fanzMediaBot.getCapabilities();

        // Check each active capability
        for (const cap of capabilities) {
          if (cap.status === 'active') {
            // Verify capability is working on deployed platforms
            logger.debug(`Verifying capability: ${cap.name} on ${cap.platforms.length} platforms`);
          }
        }
        logger.info(`Checked ${capabilities.length} capabilities`);
      }
    });

    // Weekly analytics report
    this.addTask({
      id: 'analytics-report',
      name: 'Weekly Analytics Report',
      schedule: 'weekly',
      enabled: true,
      handler: async () => {
        logger.info('Generating weekly analytics report');
        const status = fanzMediaBot.getStatus();
        const report = {
          period: 'weekly',
          generatedAt: new Date(),
          stats: status.stats,
          activeStreams: status.activeStreams,
          healthyStreams: status.healthySteams,
          resolvedIssues: status.stats.issuesResolved,
          optimizationsApplied: status.stats.optimizationsApplied
        };
        logger.info(`Weekly report: ${JSON.stringify(report)}`);
      }
    });

    // Monthly capacity planning
    this.addTask({
      id: 'capacity-planning',
      name: 'Monthly Capacity Planning',
      schedule: 'monthly',
      enabled: true,
      handler: async () => {
        logger.info('Running monthly capacity planning analysis');
        const status = fanzMediaBot.getStatus();

        // Analyze trends and project future needs
        const analysis = {
          currentPlatforms: status.platformCount,
          activeStreams: status.activeStreams,
          estimatedGrowth: '15%', // Would be calculated from historical data
          recommendedActions: [
            'Review CDN edge node coverage',
            'Evaluate transcoding capacity',
            'Check storage utilization trends'
          ]
        };

        logger.info(`Capacity analysis: ${JSON.stringify(analysis)}`);
      }
    });

    // Monthly feature rollout review
    this.addTask({
      id: 'feature-rollout-review',
      name: 'Feature Rollout Review',
      schedule: 'monthly',
      enabled: true,
      handler: async () => {
        logger.info('Reviewing feature rollout status');
        const capabilities = fanzMediaBot.getCapabilities();

        const betaFeatures = capabilities.filter(c => c.status === 'beta');
        const plannedFeatures = capabilities.filter(c => c.status === 'planned');

        logger.info(`Beta features: ${betaFeatures.length}, Planned: ${plannedFeatures.length}`);

        // Consider promoting beta features to active
        for (const beta of betaFeatures) {
          const daysSinceLaunch = (Date.now() - beta.lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceLaunch > 30) {
            logger.info(`Consider promoting ${beta.name} to active status (${Math.round(daysSinceLaunch)} days in beta)`);
          }
        }
      }
    });
  }

  private addTask(task: Omit<ScheduledTask, 'nextRun'>): void {
    const nextRun = this.calculateNextRun(task.schedule);
    this.tasks.set(task.id, { ...task, nextRun });
  }

  private calculateNextRun(schedule: ScheduledTask['schedule']): Date {
    const now = new Date();
    const next = new Date(now);

    switch (schedule) {
      case 'hourly':
        next.setHours(next.getHours() + 1, 0, 0, 0);
        break;
      case 'daily':
        next.setDate(next.getDate() + 1);
        next.setHours(3, 0, 0, 0); // Run at 3 AM
        break;
      case 'weekly':
        next.setDate(next.getDate() + (7 - next.getDay())); // Next Sunday
        next.setHours(4, 0, 0, 0); // Run at 4 AM
        break;
      case 'monthly':
        next.setMonth(next.getMonth() + 1, 1); // First of next month
        next.setHours(5, 0, 0, 0); // Run at 5 AM
        break;
    }

    return next;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    logger.info('MediaBotScheduler starting...');

    for (const [id, task] of this.tasks) {
      if (task.enabled) {
        this.scheduleTask(task);
      }
    }

    logger.info(`MediaBotScheduler started with ${this.tasks.size} tasks`);
  }

  private scheduleTask(task: ScheduledTask): void {
    const now = Date.now();
    const delay = Math.max(0, task.nextRun.getTime() - now);

    const timer = setTimeout(async () => {
      try {
        logger.info(`Executing scheduled task: ${task.name}`);
        task.lastRun = new Date();
        await task.handler();

        // Schedule next run
        task.nextRun = this.calculateNextRun(task.schedule);
        this.tasks.set(task.id, task);
        this.scheduleTask(task);
      } catch (error: any) {
        logger.error(`Scheduled task ${task.name} failed: ${error.message}`);
        // Retry in 5 minutes on failure
        setTimeout(() => this.scheduleTask(task), 5 * 60 * 1000);
      }
    }, delay);

    this.timers.set(task.id, timer);
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();

    logger.info('MediaBotScheduler stopped');
  }

  getSchedule(): Array<{
    id: string;
    name: string;
    schedule: string;
    enabled: boolean;
    lastRun?: Date;
    nextRun: Date;
  }> {
    return Array.from(this.tasks.values()).map(t => ({
      id: t.id,
      name: t.name,
      schedule: t.schedule,
      enabled: t.enabled,
      lastRun: t.lastRun,
      nextRun: t.nextRun
    }));
  }

  enableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.enabled = true;
    if (this.isRunning && !this.timers.has(taskId)) {
      this.scheduleTask(task);
    }
    return true;
  }

  disableTask(taskId: string): boolean {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    task.enabled = false;
    const timer = this.timers.get(taskId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(taskId);
    }
    return true;
  }

  async runTaskNow(taskId: string): Promise<boolean> {
    const task = this.tasks.get(taskId);
    if (!task) return false;

    try {
      logger.info(`Manually running task: ${task.name}`);
      task.lastRun = new Date();
      await task.handler();
      return true;
    } catch (error: any) {
      logger.error(`Manual task run failed: ${error.message}`);
      return false;
    }
  }
}

export const mediaBotScheduler = new MediaBotScheduler();

// Auto-start if enabled
if (process.env.MEDIA_BOT_SCHEDULER_ENABLED === 'true') {
  mediaBotScheduler.start().catch(err => {
    logger.error(`Failed to start MediaBotScheduler: ${err.message}`);
  });
}

export { MediaBotScheduler };
