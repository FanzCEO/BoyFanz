// @ts-nocheck
/**
 * User Discipline Service
 *
 * Comprehensive system for managing user warnings, suspensions, and restrictions
 * Features:
 * - 1-2-3 strike warning system
 * - Configurable suspension durations
 * - Automatic re-enablement after suspension ends
 * - Detailed email notifications
 * - Limited access during suspension
 * - Appeal system
 */

import { db } from '../db';
import {
  users,
  userWarnings,
  userSuspensions,
  userDisciplineStatus
} from '../../shared/schema';
import { eq, and, lte, gte, desc, sql } from 'drizzle-orm';
import { logger } from '../logger';

interface IssueWarningParams {
  userId: string;
  warningType: string;
  severity: 'minor' | 'moderate' | 'severe' | 'critical';
  reason: string;
  detailedExplanation: string;
  evidenceUrls?: string[];
  relatedContentIds?: string[];
  violationPolicy?: string;
  issuedBy: string;
  issuedByRole: string;
  autoSuspend?: boolean;
}

interface SuspendUserParams {
  userId: string;
  reason: string;
  banType: 'temporary' | 'permanent' | 'shadow';
  description: string;
  violationDetails?: Record<string, any>;
  suspendedBy: string;
  durationHours?: number; // null for permanent
}

interface DisciplineStatus {
  userId: string;
  isSuspended: boolean;
  suspensionEndsAt: Date | null;
  suspensionReason: string | null;
  isRestricted: boolean;
  restrictions: Record<string, any>;
  currentStrikeLevel: number;
  activeWarnings: number;
  canAccessPlatform: boolean;
  limitedAccess: boolean;
  allowedActions: string[];
}

class UserDisciplineService {
  private emailService: any = null;

  constructor() {
    this.startAutoUnlockChecker();
  }

  /**
   * Set email service for sending notifications
   */
  setEmailService(service: any) {
    this.emailService = service;
  }

  /**
   * Get or create discipline status for a user
   */
  async getOrCreateDisciplineStatus(userId: string) {
    const existing = await db.query.userDisciplineStatus.findFirst({
      where: eq(userDisciplineStatus.userId, userId),
    });

    if (existing) return existing;

    // Create new discipline status
    const [status] = await db.insert(userDisciplineStatus).values({
      userId,
      activeWarnings: 0,
      totalWarnings: 0,
      currentStrikeLevel: 0,
      isSuspended: false,
      isRestricted: false,
      trustScore: 100,
      timesWarned: 0,
      timesSuspended: 0,
      goodStandingSince: new Date(),
    }).returning();

    return status;
  }

  /**
   * Issue a warning to a user (strike system)
   */
  async issueWarning(params: IssueWarningParams): Promise<{
    warning: any;
    newStrikeLevel: number;
    autoSuspended: boolean;
  }> {
    const {
      userId,
      warningType,
      severity,
      reason,
      detailedExplanation,
      evidenceUrls = [],
      relatedContentIds = [],
      violationPolicy,
      issuedBy,
      issuedByRole,
      autoSuspend = true,
    } = params;

    // Get current discipline status
    const status = await this.getOrCreateDisciplineStatus(userId);

    // Calculate new strike level
    let newStrikeLevel = status.currentStrikeLevel + 1;
    if (severity === 'critical') {
      newStrikeLevel = 3; // Critical violations go straight to strike 3
    }

    // Determine restrictions based on strike level
    let restrictionApplied = '';
    let restrictionEndsAt: Date | null = null;

    switch (newStrikeLevel) {
      case 1:
        restrictionApplied = 'warning_only';
        break;
      case 2:
        restrictionApplied = 'limited_posting';
        restrictionEndsAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        break;
      case 3:
        restrictionApplied = 'pending_suspension';
        break;
    }

    // Create the warning
    const [warning] = await db.insert(userWarnings).values({
      userId,
      warningType: warningType as any,
      severity: severity as any,
      strikeNumber: Math.min(newStrikeLevel, 3),
      reason,
      detailedExplanation,
      evidenceUrls,
      relatedContentIds,
      violationPolicy,
      issuedBy,
      issuedByRole,
      restrictionApplied,
      restrictionEndsAt,
      isActive: true,
      emailSent: false,
    }).returning();

    // Update discipline status
    await db.update(userDisciplineStatus)
      .set({
        currentStrikeLevel: Math.min(newStrikeLevel, 3),
        activeWarnings: status.activeWarnings + 1,
        totalWarnings: status.totalWarnings + 1,
        timesWarned: status.timesWarned + 1,
        lastWarningAt: new Date(),
        isRestricted: newStrikeLevel >= 2,
        restrictions: this.getRestrictionsForLevel(newStrikeLevel),
        updatedAt: new Date(),
      })
      .where(eq(userDisciplineStatus.userId, userId));

    // Auto-suspend on strike 3
    let autoSuspended = false;
    if (newStrikeLevel >= 3 && autoSuspend) {
      await this.suspendUser({
        userId,
        reason: 'strike_3_reached',
        banType: 'temporary',
        description: `Automatic suspension due to reaching 3 strikes. Original violation: ${reason}`,
        violationDetails: {
          warningId: warning.id,
          warningType,
          severity,
        },
        suspendedBy: issuedBy,
        durationHours: 72, // 72 hour suspension for strike 3
      });
      autoSuspended = true;
    }

    // Send email notification
    await this.sendWarningEmail(userId, warning, newStrikeLevel);

    logger.info(`Warning issued to user ${userId}: Strike ${newStrikeLevel}, Type: ${warningType}`);

    return {
      warning,
      newStrikeLevel,
      autoSuspended,
    };
  }

  /**
   * Suspend a user
   */
  async suspendUser(params: SuspendUserParams): Promise<any> {
    const {
      userId,
      reason,
      banType,
      description,
      violationDetails = {},
      suspendedBy,
      durationHours,
    } = params;

    // Calculate end date
    let endsAt: Date | null = null;
    if (banType !== 'permanent' && durationHours) {
      endsAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    }

    // Create suspension record
    const [suspension] = await db.insert(userSuspensions).values({
      userId,
      reason: reason as any,
      banType: banType as any,
      description,
      violationDetails,
      suspendedBy,
      duration: durationHours || null,
      startedAt: new Date(),
      endsAt,
      isActive: true,
    }).returning();

    // Update discipline status
    await db.update(userDisciplineStatus)
      .set({
        isSuspended: true,
        suspensionId: suspension.id,
        suspensionEndsAt: endsAt,
        lastSuspensionAt: new Date(),
        timesSuspended: sql`${userDisciplineStatus.timesSuspended} + 1`,
        trustScore: sql`GREATEST(0, ${userDisciplineStatus.trustScore} - 25)`,
        updatedAt: new Date(),
      })
      .where(eq(userDisciplineStatus.userId, userId));

    // Update user status
    await db.update(users)
      .set({
        status: banType === 'shadow' ? 'active' : 'suspended',
      })
      .where(eq(users.id, userId));

    // Send suspension email
    await this.sendSuspensionEmail(userId, suspension, endsAt);

    logger.info(`User ${userId} suspended: ${banType}, Duration: ${durationHours || 'permanent'} hours`);

    return suspension;
  }

  /**
   * Lift a suspension (manual or automatic)
   */
  async liftSuspension(
    suspensionId: string,
    liftedBy: string,
    liftReason: string,
    isAutomatic: boolean = false
  ): Promise<boolean> {
    const suspension = await db.query.userSuspensions.findFirst({
      where: eq(userSuspensions.id, suspensionId),
    });

    if (!suspension || !suspension.isActive) {
      return false;
    }

    // Update suspension record
    await db.update(userSuspensions)
      .set({
        isActive: false,
        liftedAt: new Date(),
        liftedBy,
        liftReason,
        updatedAt: new Date(),
      })
      .where(eq(userSuspensions.id, suspensionId));

    // Update discipline status
    await db.update(userDisciplineStatus)
      .set({
        isSuspended: false,
        suspensionId: null,
        suspensionEndsAt: null,
        // Reduce strike level by 1 on lift (if not permanent ban)
        currentStrikeLevel: sql`GREATEST(0, ${userDisciplineStatus.currentStrikeLevel} - 1)`,
        goodStandingSince: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(userDisciplineStatus.userId, suspension.userId));

    // Update user status
    await db.update(users)
      .set({
        status: 'active',
      })
      .where(eq(users.id, suspension.userId));

    // Send reinstatement email
    await this.sendReinstatementEmail(suspension.userId, isAutomatic);

    logger.info(`Suspension ${suspensionId} lifted for user ${suspension.userId}. Automatic: ${isAutomatic}`);

    return true;
  }

  /**
   * Check and auto-lift expired suspensions (runs periodically)
   */
  async checkAndLiftExpiredSuspensions(): Promise<number> {
    const now = new Date();

    // Find all active suspensions that have ended
    const expiredSuspensions = await db.query.userSuspensions.findMany({
      where: and(
        eq(userSuspensions.isActive, true),
        lte(userSuspensions.endsAt, now)
      ),
    });

    let liftedCount = 0;
    for (const suspension of expiredSuspensions) {
      await this.liftSuspension(
        suspension.id,
        'system',
        'Suspension period completed',
        true
      );
      liftedCount++;
    }

    if (liftedCount > 0) {
      logger.info(`Auto-lifted ${liftedCount} expired suspensions`);
    }

    return liftedCount;
  }

  /**
   * Start periodic checker for auto-lifting suspensions
   */
  private startAutoUnlockChecker() {
    // Check every 5 minutes
    setInterval(() => {
      this.checkAndLiftExpiredSuspensions().catch(err => {
        logger.error('Error in auto-unlock checker:', err);
      });
    }, 5 * 60 * 1000);
  }

  /**
   * Get user's discipline status for display
   */
  async getUserDisciplineStatus(userId: string): Promise<DisciplineStatus> {
    const status = await this.getOrCreateDisciplineStatus(userId);

    // Get active suspension if any
    let suspensionReason = null;
    if (status.isSuspended && status.suspensionId) {
      const suspension = await db.query.userSuspensions.findFirst({
        where: eq(userSuspensions.id, status.suspensionId),
      });
      suspensionReason = suspension?.description || null;
    }

    // Determine allowed actions during suspension/restriction
    const allowedActions = this.getAllowedActions(status);

    return {
      userId,
      isSuspended: status.isSuspended,
      suspensionEndsAt: status.suspensionEndsAt,
      suspensionReason,
      isRestricted: status.isRestricted,
      restrictions: status.restrictions as Record<string, any>,
      currentStrikeLevel: status.currentStrikeLevel,
      activeWarnings: status.activeWarnings,
      canAccessPlatform: !status.isSuspended || this.hasLimitedAccess(status),
      limitedAccess: status.isSuspended || status.isRestricted,
      allowedActions,
    };
  }

  /**
   * Get user's warning history
   */
  async getUserWarnings(userId: string, activeOnly: boolean = false) {
    const warnings = await db.query.userWarnings.findMany({
      where: activeOnly
        ? and(eq(userWarnings.userId, userId), eq(userWarnings.isActive, true))
        : eq(userWarnings.userId, userId),
      orderBy: desc(userWarnings.createdAt),
    });

    return warnings;
  }

  /**
   * Get user's suspension history
   */
  async getUserSuspensions(userId: string, activeOnly: boolean = false) {
    const suspensions = await db.query.userSuspensions.findMany({
      where: activeOnly
        ? and(eq(userSuspensions.userId, userId), eq(userSuspensions.isActive, true))
        : eq(userSuspensions.userId, userId),
      orderBy: desc(userSuspensions.createdAt),
    });

    return suspensions;
  }

  /**
   * Submit an appeal for a warning or suspension
   */
  async submitAppeal(
    type: 'warning' | 'suspension',
    recordId: string,
    userId: string,
    appealText: string
  ): Promise<boolean> {
    if (type === 'warning') {
      await db.update(userWarnings)
        .set({
          appealed: true,
          appealText,
          appealedAt: new Date(),
          appealStatus: 'pending',
          updatedAt: new Date(),
        })
        .where(and(
          eq(userWarnings.id, recordId),
          eq(userWarnings.userId, userId)
        ));
    } else {
      await db.update(userSuspensions)
        .set({
          appealSubmitted: true,
          appealText,
          appealedAt: new Date(),
          appealDecision: 'pending',
          updatedAt: new Date(),
        })
        .where(and(
          eq(userSuspensions.id, recordId),
          eq(userSuspensions.userId, userId)
        ));
    }

    logger.info(`Appeal submitted for ${type} ${recordId} by user ${userId}`);
    return true;
  }

  /**
   * Review an appeal (admin action)
   */
  async reviewAppeal(
    type: 'warning' | 'suspension',
    recordId: string,
    decision: 'approved' | 'rejected',
    reviewedBy: string,
    decisionReason: string
  ): Promise<boolean> {
    if (type === 'warning') {
      await db.update(userWarnings)
        .set({
          appealStatus: decision,
          appealReviewedBy: reviewedBy,
          appealReviewedAt: new Date(),
          appealDecisionReason: decisionReason,
          isActive: decision === 'approved' ? false : true,
          updatedAt: new Date(),
        })
        .where(eq(userWarnings.id, recordId));

      if (decision === 'approved') {
        // Reduce strike level
        const warning = await db.query.userWarnings.findFirst({
          where: eq(userWarnings.id, recordId),
        });
        if (warning) {
          await db.update(userDisciplineStatus)
            .set({
              currentStrikeLevel: sql`GREATEST(0, ${userDisciplineStatus.currentStrikeLevel} - 1)`,
              activeWarnings: sql`GREATEST(0, ${userDisciplineStatus.activeWarnings} - 1)`,
              updatedAt: new Date(),
            })
            .where(eq(userDisciplineStatus.userId, warning.userId));
        }
      }
    } else {
      const suspension = await db.query.userSuspensions.findFirst({
        where: eq(userSuspensions.id, recordId),
      });

      await db.update(userSuspensions)
        .set({
          appealDecision: decision,
          appealDecidedBy: reviewedBy,
          appealDecidedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userSuspensions.id, recordId));

      if (decision === 'approved' && suspension) {
        // Lift the suspension
        await this.liftSuspension(recordId, reviewedBy, `Appeal approved: ${decisionReason}`);
      }
    }

    logger.info(`Appeal ${decision} for ${type} ${recordId} by ${reviewedBy}`);
    return true;
  }

  /**
   * Get restrictions for a strike level
   */
  private getRestrictionsForLevel(strikeLevel: number): Record<string, any> {
    switch (strikeLevel) {
      case 0:
        return { none: true };
      case 1:
        return {
          warning: true,
          canPost: true,
          canMessage: true,
          canStream: true,
          canComment: true,
        };
      case 2:
        return {
          warning: true,
          canPost: false,
          canMessage: true,
          canStream: false,
          canComment: true,
          canTip: true,
          restrictionDuration: '24_hours',
        };
      case 3:
      default:
        return {
          suspended: true,
          canPost: false,
          canMessage: false,
          canStream: false,
          canComment: false,
          canTip: false,
        };
    }
  }

  /**
   * Get allowed actions during suspension/restriction
   */
  private getAllowedActions(status: any): string[] {
    if (!status.isSuspended && !status.isRestricted) {
      return ['full_access'];
    }

    // Always allowed during suspension
    const alwaysAllowed = [
      'view_suspension_details',
      'submit_appeal',
      'contact_support',
      'delete_account',
      'download_data',
      'update_email',
      'update_password',
    ];

    if (status.isSuspended) {
      return alwaysAllowed;
    }

    // Restricted but not suspended
    const restrictions = status.restrictions || {};
    const allowed = [...alwaysAllowed];

    if (restrictions.canMessage) allowed.push('send_messages');
    if (restrictions.canComment) allowed.push('post_comments');
    if (restrictions.canTip) allowed.push('send_tips');

    return allowed;
  }

  /**
   * Check if user has limited access (not full suspension)
   */
  private hasLimitedAccess(status: any): boolean {
    // Shadow bans allow access
    // Limited access during suspension for specific actions
    return true;
  }

  /**
   * Send warning email to user
   */
  private async sendWarningEmail(userId: string, warning: any, strikeLevel: number) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user?.email) return;

      const subject = `Account Warning - Strike ${strikeLevel} of 3`;
      const strikesRemaining = 3 - strikeLevel;

      const emailBody = `
Dear ${user.displayName || user.username},

We are writing to inform you that your account has received a warning due to a violation of our community guidelines.

**Warning Details:**
- Type: ${warning.warningType.replace(/_/g, ' ').toUpperCase()}
- Severity: ${warning.severity.toUpperCase()}
- Strike Level: ${strikeLevel} of 3
- Date: ${new Date().toLocaleDateString()}

**Reason:**
${warning.reason}

**Detailed Explanation:**
${warning.detailedExplanation}

${warning.violationPolicy ? `**Policy Violated:** ${warning.violationPolicy}` : ''}

**Current Status:**
- Active Warnings: ${strikeLevel}
- Strikes Remaining Before Suspension: ${strikesRemaining}

${strikeLevel === 1 ? `
This is your first warning. Please review our community guidelines to prevent future violations.
` : ''}

${strikeLevel === 2 ? `
**IMPORTANT:** This is your second warning. You have been temporarily restricted from posting content for 24 hours. One more violation will result in account suspension.
` : ''}

${strikeLevel === 3 ? `
**ACCOUNT SUSPENDED:** Due to receiving 3 strikes, your account has been temporarily suspended. You can still access limited features including contacting support and submitting an appeal.
` : ''}

**How to Appeal:**
If you believe this warning was issued in error, you can submit an appeal through your account settings or by contacting our support team.

**Avoid Future Violations:**
- Review our Terms of Service and Community Guidelines
- Ensure all content complies with platform policies
- Contact support if you have questions about acceptable content

We value you as a member of our community and hope to see you in good standing.

Best regards,
The Fanz Trust & Safety Team

---
This is an automated message. Please do not reply directly to this email.
For support, visit: https://boyfanz.fanz.website/help
      `;

      // Send email (implementation depends on email service)
      if (this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        });
      }

      // Mark email as sent
      await db.update(userWarnings)
        .set({
          emailSent: true,
          emailSentAt: new Date(),
        })
        .where(eq(userWarnings.id, warning.id));

      logger.info(`Warning email sent to user ${userId}`);
    } catch (error) {
      logger.error('Failed to send warning email:', error);
    }
  }

  /**
   * Send suspension email to user
   */
  private async sendSuspensionEmail(userId: string, suspension: any, endsAt: Date | null) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user?.email) return;

      const isPermanent = !endsAt;
      const subject = isPermanent
        ? 'Account Permanently Suspended'
        : `Account Suspended - Returns ${endsAt.toLocaleDateString()}`;

      const emailBody = `
Dear ${user.displayName || user.username},

Your account has been ${isPermanent ? 'permanently ' : ''}suspended due to violations of our Terms of Service.

**Suspension Details:**
- Type: ${suspension.banType.replace(/_/g, ' ').toUpperCase()}
- Start Date: ${new Date().toLocaleDateString()}
${!isPermanent ? `- End Date: ${endsAt!.toLocaleDateString()} at ${endsAt!.toLocaleTimeString()}` : ''}

**Reason for Suspension:**
${suspension.description}

**What This Means:**
While suspended, your account access is limited. You can:
✓ Log in to view your suspension details
✓ Submit an appeal
✓ Contact support
✓ Request account deletion
✓ Download your data

You cannot:
✗ Post content
✗ Send or receive messages
✗ Go live or stream
✗ Comment or interact
✗ Process payments

${!isPermanent ? `
**Automatic Reinstatement:**
Your account will be automatically reinstated on ${endsAt!.toLocaleDateString()} at ${endsAt!.toLocaleTimeString()}. You will receive a confirmation email when your suspension is lifted.
` : ''}

**How to Appeal:**
If you believe this suspension was issued in error, you can submit an appeal:
1. Log into your account
2. Go to your Account Status page
3. Click "Submit Appeal"
4. Provide detailed information about why you believe the suspension should be reconsidered

Appeals are typically reviewed within 24-48 hours.

**Need Help?**
Our support team is available to answer questions about your suspension:
- Visit: https://boyfanz.fanz.website/help/chat
- Email: support@fanzunlimited.com

We take community safety seriously. We hope to welcome you back in good standing.

Regards,
The Fanz Trust & Safety Team

---
This is an automated message. Please do not reply directly to this email.
      `;

      if (this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        });
      }

      logger.info(`Suspension email sent to user ${userId}`);
    } catch (error) {
      logger.error('Failed to send suspension email:', error);
    }
  }

  /**
   * Send reinstatement email to user
   */
  private async sendReinstatementEmail(userId: string, isAutomatic: boolean) {
    try {
      const user = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });

      if (!user?.email) return;

      const subject = 'Account Reinstated - Welcome Back!';

      const emailBody = `
Dear ${user.displayName || user.username},

Great news! Your account suspension has been lifted and your full access has been restored.

${isAutomatic ? `
**Automatic Reinstatement:**
Your suspension period has ended, and your account has been automatically reinstated.
` : `
**Manual Reinstatement:**
After reviewing your case, we have decided to reinstate your account ahead of schedule.
`}

**Important Reminders:**
- Please review our Community Guidelines before resuming activity
- Future violations may result in longer suspensions or permanent bans
- Your previous warnings remain on your account record

**Your Current Status:**
- Account Status: Active
- Strike Level: Reduced by 1
- Full access to all features

We value you as a member of our community and appreciate your understanding during the suspension period.

If you have any questions, our support team is here to help.

Welcome back!

Best regards,
The Fanz Team

---
This is an automated message. Please do not reply directly to this email.
      `;

      if (this.emailService) {
        await this.emailService.sendEmail({
          to: user.email,
          subject,
          text: emailBody,
          html: emailBody.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
        });
      }

      logger.info(`Reinstatement email sent to user ${userId}`);
    } catch (error) {
      logger.error('Failed to send reinstatement email:', error);
    }
  }
}

// Export singleton instance
export const userDisciplineService = new UserDisciplineService();
export { UserDisciplineService };
