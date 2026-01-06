// @ts-nocheck
/**
 * SMS Service - Twilio Integration
 *
 * Provides SMS capabilities for:
 * - 2FA verification codes
 * - Co-star invitation notifications
 * - Support chat alerts
 * - Account notifications
 */

import Twilio from 'twilio';

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface BulkSMSResult {
  sent: number;
  failed: number;
  results: Array<{ phone: string; success: boolean; messageId?: string; error?: string }>;
}

class SMSService {
  private client: Twilio.Twilio | null = null;
  private fromNumber: string = '';
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromNumber) {
      try {
        this.client = Twilio(accountSid, authToken);
        this.fromNumber = fromNumber;
        this.isConfigured = true;
        console.log('✅ SMS Service initialized with Twilio');
      } catch (error) {
        console.error('❌ Failed to initialize Twilio:', error);
        this.isConfigured = false;
      }
    } else {
      console.log('⚠️ SMS Service: Twilio not configured (missing credentials)');
      this.isConfigured = false;
    }
  }

  /**
   * Check if SMS service is available
   */
  isAvailable(): boolean {
    return this.isConfigured;
  }

  /**
   * Send a single SMS message
   */
  async send(to: string, message: string): Promise<SMSResult> {
    if (!this.isConfigured || !this.client) {
      console.log(`[SMS] Would send to ${to}: ${message}`);
      return { success: false, error: 'SMS service not configured' };
    }

    try {
      // Format phone number
      const formattedNumber = this.formatPhoneNumber(to);

      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: formattedNumber
      });

      console.log(`[SMS] Sent to ${formattedNumber}: ${result.sid}`);
      return { success: true, messageId: result.sid };
    } catch (error: any) {
      console.error(`[SMS] Failed to send to ${to}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send 2FA verification code
   */
  async sendVerificationCode(phone: string, code: string): Promise<SMSResult> {
    const message = `Your BoyFanz verification code is: ${code}. This code expires in 10 minutes. Don't share this code with anyone.`;
    return this.send(phone, message);
  }

  /**
   * Send co-star invitation
   */
  async sendCoStarInvitation(phone: string, inviterName: string, inviteUrl: string): Promise<SMSResult> {
    const message = `${inviterName} has invited you to verify as a co-star on BoyFanz. Complete your 2257 verification here: ${inviteUrl}. This link expires in 30 days.`;
    return this.send(phone, message);
  }

  /**
   * Send support alert to admin/moderator
   */
  async sendSupportAlert(phone: string, userName: string, sessionId: string): Promise<SMSResult> {
    const message = `🔔 BoyFanz Support: ${userName} needs assistance. Check the support dashboard to respond.`;
    return this.send(phone, message);
  }

  /**
   * Send password reset code
   */
  async sendPasswordReset(phone: string, code: string): Promise<SMSResult> {
    const message = `Your BoyFanz password reset code is: ${code}. This code expires in 15 minutes. If you didn't request this, please ignore.`;
    return this.send(phone, message);
  }

  /**
   * Send account notification
   */
  async sendAccountNotification(phone: string, notification: string): Promise<SMSResult> {
    const message = `BoyFanz: ${notification}`;
    return this.send(phone, message);
  }

  /**
   * Send earnings notification
   */
  async sendEarningsNotification(phone: string, amount: string, type: 'tip' | 'subscription' | 'ppv'): Promise<SMSResult> {
    const typeLabels = {
      tip: 'tip',
      subscription: 'subscription',
      ppv: 'PPV purchase'
    };
    const message = `💰 BoyFanz: You received a $${amount} ${typeLabels[type]}!`;
    return this.send(phone, message);
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulk(messages: Array<{ to: string; message: string }>): Promise<BulkSMSResult> {
    const results: BulkSMSResult['results'] = [];
    let sent = 0;
    let failed = 0;

    for (const { to, message } of messages) {
      const result = await this.send(to, message);
      results.push({
        phone: to,
        success: result.success,
        messageId: result.messageId,
        error: result.error
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
      }

      // Rate limit: pause between messages
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return { sent, failed, results };
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');

    // If it doesn't start with country code, assume US (+1)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    // Must be 10 digits (US) or 11+ digits (international)
    return cleaned.length >= 10 && cleaned.length <= 15;
  }

  /**
   * Get SMS delivery status (if Twilio configured)
   */
  async getMessageStatus(messageId: string): Promise<{ status: string; error?: string } | null> {
    if (!this.isConfigured || !this.client) {
      return null;
    }

    try {
      const message = await this.client.messages(messageId).fetch();
      return {
        status: message.status,
        error: message.errorMessage || undefined
      };
    } catch (error: any) {
      console.error(`[SMS] Failed to get status for ${messageId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const smsService = new SMSService();
export default smsService;
