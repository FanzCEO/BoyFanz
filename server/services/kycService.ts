import { storage } from "../storage";
import { notificationService } from "./notificationService";

class KycService {
  private verifyMyApiUrl: string;
  private verifyMyApiKey: string;

  constructor() {
    this.verifyMyApiUrl = process.env.VERIFYMY_API_URL || 'https://api.verifymy.com';
    this.verifyMyApiKey = process.env.VERIFYMY_API_KEY || 'test_key';
  }

  async initiateVerification(userId: string) {
    try {
      // In a real implementation, this would call VerifyMy API
      const verification = await storage.upsertKycVerification({
        userId,
        provider: 'verifymy',
        externalId: `vm_${Date.now()}`,
        status: 'pending',
        dataJson: { initiated: true },
      });

      await notificationService.sendNotification(userId, {
        kind: 'kyc',
        payloadJson: {
          message: 'KYC verification initiated',
          status: 'pending'
        }
      });

      return verification;
    } catch (error) {
      console.error('Error initiating KYC verification:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any, signature: string) {
    try {
      // Verify webhook signature (simplified)
      if (!signature) {
        throw new Error('No signature provided');
      }

      // Process the webhook payload
      const { external_id, status, user_data } = payload;
      
      if (!external_id) {
        throw new Error('No external_id in payload');
      }

      // Find the verification record by external_id
      // This is a simplified implementation
      const verification = await storage.upsertKycVerification({
        userId: user_data?.user_id || 'unknown',
        provider: 'verifymy',
        externalId: external_id,
        status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
        dataJson: payload,
      });

      // Send notification to user
      if (verification.userId !== 'unknown') {
        await notificationService.sendNotification(verification.userId, {
          kind: 'kyc',
          payloadJson: {
            message: `KYC verification ${status}`,
            status
          }
        });
      }

      // Create audit log
      await storage.createAuditLog({
        actorId: 'system',
        action: 'kyc_webhook_received',
        targetType: 'kyc_verification',
        targetId: verification.id,
        diffJson: { payload }
      });

      return verification;
    } catch (error) {
      console.error('Error handling KYC webhook:', error);
      throw error;
    }
  }
}

export const kycService = new KycService();
