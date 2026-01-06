/**
 * Email Marketing Routes
 * Admin routes for managing email campaigns, templates, and analytics
 */

import { Router } from 'express';
import { z } from 'zod';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
import { emailMarketingService, EmailTemplateType } from '../services/emailMarketingService';
import { emailSchedulerService } from '../services/emailSchedulerService';

const router = Router();

// Validation schemas
const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(255),
  preheader: z.string().max(255).optional(),
  htmlContent: z.string().min(1),
  textContent: z.string().optional(),
  templateType: z.enum([
    'verification_reminder', 'welcome', 'new_subscriber', 'new_tip',
    'new_message', 'new_follower', 'payout_processed', 'content_approved',
    'content_rejected', 'costar_invitation', 'newsletter', 'promotion',
    'reengagement', 'milestone'
  ]),
  targetAudience: z.enum(['all', 'creators', 'fans', 'unverified', 'inactive', 'custom']),
  customFilters: z.record(z.any()).optional(),
  scheduledFor: z.string().datetime().optional(),
});

const updateCampaignSchema = createCampaignSchema.partial();

const sendTestEmailSchema = z.object({
  testEmail: z.string().email(),
});

// ============================================
// CAMPAIGN MANAGEMENT
// ============================================

/**
 * Get all campaigns
 */
router.get('/campaigns', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    const result = await emailMarketingService.getCampaigns({
      status: status as any,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: result.campaigns,
      pagination: {
        total: result.total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get single campaign
 */
router.get('/campaigns/:id', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const campaign = await emailMarketingService.getCampaign(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Create campaign
 */
router.post('/campaigns', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const validation = createCampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error.errors });
    }

    const campaign = await emailMarketingService.createCampaign({
      ...validation.data,
      scheduledFor: validation.data.scheduledFor ? new Date(validation.data.scheduledFor) : undefined,
    });

    res.status(201).json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Error creating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Update campaign
 */
router.put('/campaigns/:id', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const validation = updateCampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error.errors });
    }

    const campaign = await emailMarketingService.updateCampaign(req.params.id, {
      ...validation.data,
      scheduledFor: validation.data.scheduledFor ? new Date(validation.data.scheduledFor) : undefined,
    });

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, data: campaign });
  } catch (error: any) {
    console.error('Error updating campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Delete campaign
 */
router.delete('/campaigns/:id', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const deleted = await emailMarketingService.deleteCampaign(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    res.json({ success: true, message: 'Campaign deleted' });
  } catch (error: any) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send campaign
 */
router.post('/campaigns/:id/send', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const result = await emailMarketingService.sendCampaign(req.params.id);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, sent: result.sent });
  } catch (error: any) {
    console.error('Error sending campaign:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send test email for campaign
 */
router.post('/campaigns/:id/test', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const validation = sendTestEmailSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, error: validation.error.errors });
    }

    const result = await emailMarketingService.sendTestEmail(
      req.params.id,
      validation.data.testEmail
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Test email sent' });
  } catch (error: any) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Preview campaign recipients
 */
router.get('/campaigns/:id/recipients', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const campaign = await emailMarketingService.getCampaign(req.params.id);

    if (!campaign) {
      return res.status(404).json({ success: false, error: 'Campaign not found' });
    }

    const recipients = await emailMarketingService.getCampaignRecipients(campaign);

    res.json({
      success: true,
      data: {
        total: recipients.length,
        preview: recipients.slice(0, 10), // First 10 for preview
      },
    });
  } catch (error: any) {
    console.error('Error fetching recipients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ANALYTICS
// ============================================

/**
 * Get email analytics
 */
router.get('/analytics', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const analytics = await emailMarketingService.getAnalytics({
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({ success: true, data: analytics });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// SCHEDULER MANAGEMENT
// ============================================

/**
 * Get scheduler status
 */
router.get('/scheduler/status', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const stats = emailSchedulerService.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Error fetching scheduler status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get scheduled emails
 */
router.get('/scheduler/emails', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { type, status, limit = 50, offset = 0 } = req.query;

    const result = emailSchedulerService.getScheduledEmails({
      type: type as any,
      status: status as any,
      limit: Number(limit),
      offset: Number(offset),
    });

    res.json({
      success: true,
      data: result.emails,
      pagination: {
        total: result.total,
        limit: Number(limit),
        offset: Number(offset),
      },
    });
  } catch (error: any) {
    console.error('Error fetching scheduled emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Start scheduler
 */
router.post('/scheduler/start', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    emailSchedulerService.start();
    res.json({ success: true, message: 'Scheduler started' });
  } catch (error: any) {
    console.error('Error starting scheduler:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Stop scheduler
 */
router.post('/scheduler/stop', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    emailSchedulerService.stop();
    res.json({ success: true, message: 'Scheduler stopped' });
  } catch (error: any) {
    console.error('Error stopping scheduler:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Cancel scheduled email
 */
router.post('/scheduler/emails/:id/cancel', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const cancelled = emailSchedulerService.cancelEmail(req.params.id);

    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Email not found or already processed' });
    }

    res.json({ success: true, message: 'Email cancelled' });
  } catch (error: any) {
    console.error('Error cancelling email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// VERIFICATION REMINDERS
// ============================================

/**
 * Send verification reminder to specific user
 */
router.post('/verification-reminder/:userId', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const result = await emailSchedulerService.sendVerificationReminder(req.params.userId);

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Verification reminder sent' });
  } catch (error: any) {
    console.error('Error sending verification reminder:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Send bulk verification reminders
 */
router.post('/verification-reminder/bulk', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const result = await emailSchedulerService.sendBulkVerificationReminders();
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Error sending bulk verification reminders:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// TRANSACTIONAL EMAILS (Manual Triggers)
// ============================================

/**
 * Send transactional email
 */
router.post('/send', isAuthenticated, requireAdmin, async (req, res) => {
  try {
    const { templateType, to, data } = req.body;

    if (!templateType || !to || !data) {
      return res.status(400).json({
        success: false,
        error: 'templateType, to, and data are required',
      });
    }

    const result = await emailMarketingService.sendTemplatedEmail(
      templateType as EmailTemplateType,
      to,
      data
    );

    if (!result.success) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.json({ success: true, message: 'Email sent' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// UNSUBSCRIBE HANDLING
// ============================================

/**
 * Handle unsubscribe (public endpoint)
 */
router.get('/unsubscribe', async (req, res) => {
  try {
    const { email, campaign } = req.query;

    if (!email) {
      return res.status(400).send('Invalid unsubscribe request');
    }

    await emailMarketingService.handleUnsubscribe(
      email as string,
      campaign as string
    );

    // Show unsubscribe confirmation page
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed - BoyFanz</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              max-width: 600px;
              margin: 50px auto;
              padding: 20px;
              text-align: center;
            }
            h1 { color: #333; }
            p { color: #666; }
            a { color: #ff0000; }
          </style>
        </head>
        <body>
          <h1>You've been unsubscribed</h1>
          <p>You will no longer receive marketing emails from BoyFanz.</p>
          <p>Changed your mind? <a href="${process.env.APP_URL || 'https://boyfanz.fanz.website'}/settings/notifications">Manage your preferences</a></p>
        </body>
      </html>
    `);
  } catch (error: any) {
    console.error('Error processing unsubscribe:', error);
    res.status(500).send('Error processing unsubscribe request');
  }
});

/**
 * Get available template types
 */
router.get('/templates', isAuthenticated, requireAdmin, async (req, res) => {
  const templates = [
    { type: 'verification_reminder', name: 'Verification Reminder', description: 'Remind users to verify their email' },
    { type: 'welcome', name: 'Welcome Email', description: 'Welcome new users to the platform' },
    { type: 'new_subscriber', name: 'New Subscriber', description: 'Notify creators of new subscribers' },
    { type: 'new_tip', name: 'New Tip', description: 'Notify creators of received tips' },
    { type: 'new_message', name: 'New Message', description: 'Notify users of new messages' },
    { type: 'new_follower', name: 'New Follower', description: 'Notify users of new followers' },
    { type: 'payout_processed', name: 'Payout Processed', description: 'Notify creators of processed payouts' },
    { type: 'content_approved', name: 'Content Approved', description: 'Notify creators of approved content' },
    { type: 'content_rejected', name: 'Content Rejected', description: 'Notify creators of rejected content' },
    { type: 'costar_invitation', name: 'CoStar Invitation', description: 'Invite users to be CoStars' },
    { type: 'newsletter', name: 'Newsletter', description: 'General newsletter template' },
    { type: 'promotion', name: 'Promotion', description: 'Promotional campaign template' },
    { type: 'reengagement', name: 'Re-engagement', description: 'Win back inactive users' },
    { type: 'milestone', name: 'Milestone', description: 'Celebrate user achievements' },
  ];

  res.json({ success: true, data: templates });
});

export { router as emailMarketingRoutes };
