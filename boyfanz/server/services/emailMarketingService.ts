/**
 * Email Marketing Service
 * Handles campaigns, newsletters, bulk sending, and automated email sequences
 */

import { Resend } from 'resend';
import { db } from '../db';
import { eq, and, lt, gt, isNull, desc, sql, inArray } from 'drizzle-orm';
import { users } from '../../shared/schema';

// Initialize Resend client
let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
  console.log('✅ Email Marketing Service initialized with Resend');
} else {
  console.warn('⚠️  Email Marketing Service not configured (RESEND_API_KEY missing)');
}

const FROM_EMAIL = process.env.FROM_EMAIL || 'BoyFanz <noreply@fanz.website>';
const APP_URL = process.env.APP_URL || 'https://boyfanz.fanz.website';
const PLATFORM_NAME = 'BoyFanz';

// Email template types
export type EmailTemplateType =
  | 'verification_reminder'
  | 'welcome'
  | 'new_subscriber'
  | 'new_tip'
  | 'new_message'
  | 'new_follower'
  | 'payout_processed'
  | 'content_approved'
  | 'content_rejected'
  | 'costar_invitation'
  | 'newsletter'
  | 'promotion'
  | 'reengagement'
  | 'milestone';

// Campaign status
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';

// Email campaign interface
export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  templateType: EmailTemplateType;
  status: CampaignStatus;
  targetAudience: 'all' | 'creators' | 'fans' | 'unverified' | 'inactive' | 'custom';
  customFilters?: Record<string, any>;
  scheduledFor?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

// In-memory campaign storage (use database in production)
const campaigns: Map<string, EmailCampaign> = new Map();
const emailQueue: Array<{
  id: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  campaignId?: string;
  scheduledFor?: Date;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  attempts: number;
  lastError?: string;
  createdAt: Date;
}> = [];

// Email templates
const emailTemplates = {
  baseWrapper: (content: string, unsubscribeUrl?: string) => `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background: white;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #ff0000;
          }
          .logo {
            font-size: 32px;
            font-weight: bold;
          }
          .logo .boy { color: #ff0000; }
          .logo .fanz { color: #d4a959; }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            padding: 14px 28px;
            background: #ff0000;
            color: white !important;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
          }
          .button:hover {
            background: #cc0000;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
          .social-links {
            margin: 15px 0;
          }
          .social-links a {
            margin: 0 10px;
            color: #666;
            text-decoration: none;
          }
          .unsubscribe {
            margin-top: 15px;
            font-size: 11px;
          }
          .unsubscribe a {
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <span class="boy">Boy</span><span class="fanz">Fanz</span>
            </div>
          </div>

          <div class="content">
            ${content}
          </div>

          <div class="footer">
            <div class="social-links">
              <a href="${APP_URL}">Visit ${PLATFORM_NAME}</a>
            </div>
            <p>&copy; ${new Date().getFullYear()} ${PLATFORM_NAME}. All rights reserved.</p>
            <p>Every Man's Playground</p>
            ${unsubscribeUrl ? `
            <div class="unsubscribe">
              <a href="${unsubscribeUrl}">Unsubscribe</a> |
              <a href="${APP_URL}/settings/notifications">Manage Preferences</a>
            </div>
            ` : ''}
          </div>
        </div>
      </body>
    </html>
  `,

  verificationReminder: (username: string, verificationUrl: string, hoursRemaining: number) => `
    <h2>Don't forget to verify your email!</h2>
    <p>Hey ${username},</p>
    <p>We noticed you haven't verified your email yet. Your verification link will expire in <strong>${hoursRemaining} hours</strong>.</p>
    <p>Click the button below to verify your account and unlock all features:</p>
    <p style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify My Email</a>
    </p>
    <p>Once verified, you'll be able to:</p>
    <ul>
      <li>Subscribe to your favorite creators</li>
      <li>Send and receive messages</li>
      <li>Make purchases and tips</li>
      <li>Become a creator yourself</li>
    </ul>
    <p style="color: #666; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
  `,

  welcome: (username: string) => `
    <h2>Welcome to ${PLATFORM_NAME}! 🎉</h2>
    <p>Hey ${username},</p>
    <p>Thanks for joining the ${PLATFORM_NAME} community! We're excited to have you.</p>
    <p>Here's what you can do now:</p>
    <ul>
      <li><strong>Explore Creators</strong> - Discover amazing content from our talented creators</li>
      <li><strong>Subscribe</strong> - Support your favorites with a subscription</li>
      <li><strong>Connect</strong> - Message creators directly</li>
      <li><strong>Become a Creator</strong> - Share your own content and earn</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}/explore" class="button">Start Exploring</a>
    </p>
    <p>Need help? Check out our <a href="${APP_URL}/help">Help Center</a> or reach out to support.</p>
  `,

  newSubscriber: (creatorName: string, subscriberName: string, tier: string, amount: string) => `
    <h2>New Subscriber! 💰</h2>
    <p>Hey ${creatorName},</p>
    <p>Great news! <strong>${subscriberName}</strong> just subscribed to your ${tier} tier for <strong>${amount}/month</strong>!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">View Dashboard</a>
    </p>
    <p>Keep creating amazing content to grow your fanbase!</p>
  `,

  newTip: (creatorName: string, tipperName: string, amount: string, message?: string) => `
    <h2>You received a tip! 💸</h2>
    <p>Hey ${creatorName},</p>
    <p><strong>${tipperName}</strong> just sent you a <strong>${amount}</strong> tip!</p>
    ${message ? `<p style="background: #f9f9f9; padding: 15px; border-radius: 6px; font-style: italic;">"${message}"</p>` : ''}
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">View Earnings</a>
    </p>
  `,

  newMessage: (username: string, senderName: string, preview: string) => `
    <h2>New Message 💬</h2>
    <p>Hey ${username},</p>
    <p>You have a new message from <strong>${senderName}</strong>:</p>
    <p style="background: #f9f9f9; padding: 15px; border-radius: 6px;">"${preview.substring(0, 100)}${preview.length > 100 ? '...' : ''}"</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/messages" class="button">Read Message</a>
    </p>
  `,

  newFollower: (username: string, followerName: string, followerCount: number) => `
    <h2>New Follower! 👋</h2>
    <p>Hey ${username},</p>
    <p><strong>${followerName}</strong> just started following you!</p>
    <p>You now have <strong>${followerCount.toLocaleString()}</strong> followers.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/@${followerName}" class="button">View Profile</a>
    </p>
  `,

  payoutProcessed: (creatorName: string, amount: string, method: string) => `
    <h2>Payout Sent! 🏦</h2>
    <p>Hey ${creatorName},</p>
    <p>Great news! Your payout of <strong>${amount}</strong> has been processed and sent via <strong>${method}</strong>.</p>
    <p>The funds should arrive within 2-5 business days depending on your payment method.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/payouts" class="button">View Payout History</a>
    </p>
  `,

  contentApproved: (creatorName: string, contentTitle: string) => `
    <h2>Content Approved! ✅</h2>
    <p>Hey ${creatorName},</p>
    <p>Your content "<strong>${contentTitle}</strong>" has been approved and is now live!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">View Content</a>
    </p>
  `,

  contentRejected: (creatorName: string, contentTitle: string, reason: string) => `
    <h2>Content Review Update</h2>
    <p>Hey ${creatorName},</p>
    <p>Unfortunately, your content "<strong>${contentTitle}</strong>" was not approved.</p>
    <p><strong>Reason:</strong> ${reason}</p>
    <p>Please review our <a href="${APP_URL}/terms">Content Guidelines</a> and resubmit.</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/help">Contact Support</a>
    </p>
  `,

  costarInvitation: (inviterName: string, costarName: string, inviteUrl: string) => `
    <h2>You've Been Invited! 🌟</h2>
    <p>Hey ${costarName},</p>
    <p><strong>${inviterName}</strong> has invited you to collaborate as a CoStar on ${PLATFORM_NAME}!</p>
    <p>As a CoStar, you'll:</p>
    <ul>
      <li>Appear in content together</li>
      <li>Share in the earnings</li>
      <li>Build your audience</li>
    </ul>
    <p style="text-align: center;">
      <a href="${inviteUrl}" class="button">Accept Invitation</a>
    </p>
    <p style="color: #666; font-size: 14px;">This invitation expires in 7 days.</p>
  `,

  reengagement: (username: string, daysSinceActive: number) => `
    <h2>We Miss You! 💔</h2>
    <p>Hey ${username},</p>
    <p>It's been ${daysSinceActive} days since we've seen you on ${PLATFORM_NAME}. A lot has changed!</p>
    <p>Here's what you've been missing:</p>
    <ul>
      <li>New creators have joined</li>
      <li>Your favorites have posted new content</li>
      <li>Exclusive promotions are waiting</li>
    </ul>
    <p style="text-align: center;">
      <a href="${APP_URL}" class="button">Come Back</a>
    </p>
  `,

  milestone: (username: string, milestoneType: string, value: string) => `
    <h2>Congratulations! 🎉</h2>
    <p>Hey ${username},</p>
    <p>You've reached an amazing milestone:</p>
    <p style="text-align: center; font-size: 24px; font-weight: bold; color: #ff0000;">
      ${milestoneType}: ${value}
    </p>
    <p>Keep up the amazing work!</p>
    <p style="text-align: center;">
      <a href="${APP_URL}/dashboard" class="button">View Dashboard</a>
    </p>
  `,

  newsletter: (title: string, content: string) => `
    <h2>${title}</h2>
    ${content}
  `,

  promotion: (title: string, content: string, ctaText: string, ctaUrl: string) => `
    <h2>${title}</h2>
    ${content}
    <p style="text-align: center;">
      <a href="${ctaUrl}" class="button">${ctaText}</a>
    </p>
  `,
};

export class EmailMarketingService {
  private processingQueue = false;

  /**
   * Send a single email
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    tags?: string[];
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!resend) {
      console.warn(`⚠️  Email not sent (no API key): ${options.subject} to ${options.to}`);
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const result = await resend.emails.send({
        from: FROM_EMAIL,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        tags: options.tags?.map(tag => ({ name: tag, value: 'true' })),
      });

      if (result.error) {
        console.error(`❌ Email send failed: ${result.error.message}`);
        return { success: false, error: result.error.message };
      }

      console.log(`✅ Email sent to ${options.to}: ${options.subject}`);
      return { success: true, messageId: result.data?.id };
    } catch (error: any) {
      console.error(`❌ Email error: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send templated email
   */
  async sendTemplatedEmail(
    templateType: EmailTemplateType,
    to: string,
    data: Record<string, any>,
    options?: { unsubscribeUrl?: string }
  ): Promise<{ success: boolean; error?: string }> {
    let subject = '';
    let content = '';

    switch (templateType) {
      case 'verification_reminder':
        subject = `⏰ Verify your ${PLATFORM_NAME} account - ${data.hoursRemaining}hrs left`;
        content = emailTemplates.verificationReminder(data.username, data.verificationUrl, data.hoursRemaining);
        break;
      case 'welcome':
        subject = `Welcome to ${PLATFORM_NAME}! 🎉`;
        content = emailTemplates.welcome(data.username);
        break;
      case 'new_subscriber':
        subject = `💰 New subscriber: ${data.subscriberName}`;
        content = emailTemplates.newSubscriber(data.creatorName, data.subscriberName, data.tier, data.amount);
        break;
      case 'new_tip':
        subject = `💸 You received a ${data.amount} tip!`;
        content = emailTemplates.newTip(data.creatorName, data.tipperName, data.amount, data.message);
        break;
      case 'new_message':
        subject = `💬 New message from ${data.senderName}`;
        content = emailTemplates.newMessage(data.username, data.senderName, data.preview);
        break;
      case 'new_follower':
        subject = `👋 ${data.followerName} started following you`;
        content = emailTemplates.newFollower(data.username, data.followerName, data.followerCount);
        break;
      case 'payout_processed':
        subject = `🏦 Your ${data.amount} payout is on the way!`;
        content = emailTemplates.payoutProcessed(data.creatorName, data.amount, data.method);
        break;
      case 'content_approved':
        subject = `✅ Your content has been approved`;
        content = emailTemplates.contentApproved(data.creatorName, data.contentTitle);
        break;
      case 'content_rejected':
        subject = `Content review update`;
        content = emailTemplates.contentRejected(data.creatorName, data.contentTitle, data.reason);
        break;
      case 'costar_invitation':
        subject = `🌟 ${data.inviterName} invited you to be a CoStar!`;
        content = emailTemplates.costarInvitation(data.inviterName, data.costarName, data.inviteUrl);
        break;
      case 'reengagement':
        subject = `We miss you! Come back to ${PLATFORM_NAME}`;
        content = emailTemplates.reengagement(data.username, data.daysSinceActive);
        break;
      case 'milestone':
        subject = `🎉 Congratulations on your milestone!`;
        content = emailTemplates.milestone(data.username, data.milestoneType, data.value);
        break;
      case 'newsletter':
        subject = data.subject || `${PLATFORM_NAME} Newsletter`;
        content = emailTemplates.newsletter(data.title, data.content);
        break;
      case 'promotion':
        subject = data.subject || `Special offer from ${PLATFORM_NAME}`;
        content = emailTemplates.promotion(data.title, data.content, data.ctaText, data.ctaUrl);
        break;
      default:
        return { success: false, error: 'Unknown template type' };
    }

    const html = emailTemplates.baseWrapper(content, options?.unsubscribeUrl);
    return this.sendEmail({ to, subject, html });
  }

  /**
   * Create a new campaign
   */
  async createCampaign(data: {
    name: string;
    subject: string;
    preheader?: string;
    htmlContent: string;
    textContent?: string;
    templateType: EmailTemplateType;
    targetAudience: EmailCampaign['targetAudience'];
    customFilters?: Record<string, any>;
    scheduledFor?: Date;
  }): Promise<EmailCampaign> {
    const id = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const campaign: EmailCampaign = {
      id,
      name: data.name,
      subject: data.subject,
      preheader: data.preheader,
      htmlContent: data.htmlContent,
      textContent: data.textContent,
      templateType: data.templateType,
      status: data.scheduledFor ? 'scheduled' : 'draft',
      targetAudience: data.targetAudience,
      customFilters: data.customFilters,
      scheduledFor: data.scheduledFor,
      createdAt: new Date(),
      updatedAt: new Date(),
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        unsubscribed: 0,
      },
    };

    campaigns.set(id, campaign);
    return campaign;
  }

  /**
   * Get all campaigns
   */
  async getCampaigns(options?: {
    status?: CampaignStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ campaigns: EmailCampaign[]; total: number }> {
    let result = Array.from(campaigns.values());

    if (options?.status) {
      result = result.filter(c => c.status === options.status);
    }

    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = result.length;

    if (options?.offset) {
      result = result.slice(options.offset);
    }
    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return { campaigns: result, total };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(id: string): Promise<EmailCampaign | null> {
    return campaigns.get(id) || null;
  }

  /**
   * Update campaign
   */
  async updateCampaign(id: string, data: Partial<EmailCampaign>): Promise<EmailCampaign | null> {
    const campaign = campaigns.get(id);
    if (!campaign) return null;

    const updated = { ...campaign, ...data, updatedAt: new Date() };
    campaigns.set(id, updated);
    return updated;
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(id: string): Promise<boolean> {
    return campaigns.delete(id);
  }

  /**
   * Get recipients for campaign based on target audience
   */
  async getCampaignRecipients(campaign: EmailCampaign): Promise<Array<{ id: string; email: string; username: string }>> {
    try {
      let query = db.select({
        id: users.id,
        email: users.email,
        username: users.username,
      }).from(users);

      // Filter based on target audience
      switch (campaign.targetAudience) {
        case 'creators':
          query = query.where(eq(users.role, 'creator'));
          break;
        case 'fans':
          query = query.where(eq(users.role, 'fan'));
          break;
        case 'unverified':
          query = query.where(isNull(users.emailVerifiedAt));
          break;
        case 'inactive':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          query = query.where(lt(users.lastActiveAt, thirtyDaysAgo));
          break;
        case 'all':
        default:
          // No additional filter
          break;
      }

      const recipients = await query;
      return recipients.filter(r => r.email); // Only users with email
    } catch (error) {
      console.error('Error getting campaign recipients:', error);
      return [];
    }
  }

  /**
   * Send campaign
   */
  async sendCampaign(id: string): Promise<{ success: boolean; error?: string; sent?: number }> {
    const campaign = campaigns.get(id);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    if (campaign.status === 'sent') {
      return { success: false, error: 'Campaign already sent' };
    }

    // Update status to sending
    campaign.status = 'sending';
    campaign.updatedAt = new Date();

    const recipients = await this.getCampaignRecipients(campaign);
    campaign.stats.totalRecipients = recipients.length;

    let sent = 0;
    const batchSize = 50;
    const delayBetweenBatches = 1000; // 1 second

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.all(batch.map(async (recipient) => {
        const unsubscribeUrl = `${APP_URL}/unsubscribe?email=${encodeURIComponent(recipient.email)}&campaign=${id}`;
        const html = emailTemplates.baseWrapper(campaign.htmlContent, unsubscribeUrl);

        const result = await this.sendEmail({
          to: recipient.email,
          subject: campaign.subject,
          html,
          text: campaign.textContent,
          tags: ['campaign', campaign.id],
        });

        if (result.success) {
          sent++;
          campaign.stats.sent++;
        } else {
          campaign.stats.bounced++;
        }
      }));

      // Delay between batches to avoid rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
      }
    }

    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.updatedAt = new Date();

    return { success: true, sent };
  }

  /**
   * Get email analytics
   */
  async getAnalytics(options?: {
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    totalSent: number;
    totalDelivered: number;
    totalOpened: number;
    totalClicked: number;
    totalBounced: number;
    totalUnsubscribed: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
    campaignCount: number;
  }> {
    let filteredCampaigns = Array.from(campaigns.values());

    if (options?.startDate) {
      filteredCampaigns = filteredCampaigns.filter(c => c.createdAt >= options.startDate!);
    }
    if (options?.endDate) {
      filteredCampaigns = filteredCampaigns.filter(c => c.createdAt <= options.endDate!);
    }

    const stats = filteredCampaigns.reduce((acc, c) => ({
      totalSent: acc.totalSent + c.stats.sent,
      totalDelivered: acc.totalDelivered + c.stats.delivered,
      totalOpened: acc.totalOpened + c.stats.opened,
      totalClicked: acc.totalClicked + c.stats.clicked,
      totalBounced: acc.totalBounced + c.stats.bounced,
      totalUnsubscribed: acc.totalUnsubscribed + c.stats.unsubscribed,
    }), {
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalBounced: 0,
      totalUnsubscribed: 0,
    });

    return {
      ...stats,
      openRate: stats.totalSent > 0 ? (stats.totalOpened / stats.totalSent) * 100 : 0,
      clickRate: stats.totalOpened > 0 ? (stats.totalClicked / stats.totalOpened) * 100 : 0,
      bounceRate: stats.totalSent > 0 ? (stats.totalBounced / stats.totalSent) * 100 : 0,
      campaignCount: filteredCampaigns.length,
    };
  }

  /**
   * Handle unsubscribe
   */
  async handleUnsubscribe(email: string, campaignId?: string): Promise<boolean> {
    try {
      // In production, update user's email preferences in database
      console.log(`📧 Unsubscribe request: ${email} (campaign: ${campaignId || 'n/a'})`);

      // Update campaign stats if campaign ID provided
      if (campaignId) {
        const campaign = campaigns.get(campaignId);
        if (campaign) {
          campaign.stats.unsubscribed++;
        }
      }

      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  }

  /**
   * Send test email for campaign
   */
  async sendTestEmail(campaignId: string, testEmail: string): Promise<{ success: boolean; error?: string }> {
    const campaign = campaigns.get(campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }

    const html = emailTemplates.baseWrapper(campaign.htmlContent);
    return this.sendEmail({
      to: testEmail,
      subject: `[TEST] ${campaign.subject}`,
      html,
      text: campaign.textContent,
    });
  }
}

export const emailMarketingService = new EmailMarketingService();
