import { storage } from '../storage';
import { notificationService } from './notificationService';
import { aiModerationService } from './aiModerationService';

interface KycDocumentData {
  docType: 'id_verification' | 'consent_form' | 'model_release';
  s3Key: string;
  checksum: string;
  userId: string;
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  errors: string[];
  extractedData?: {
    dateOfBirth?: string;
    fullName?: string;
    idNumber?: string;
    expirationDate?: string;
  };
}

class KycService {
  private verifyMyApiUrl: string;
  private verifyMyApiKey: string;

  constructor() {
    this.verifyMyApiUrl = process.env.VERIFYMY_API_URL || 'https://api.verifymy.com';
    this.verifyMyApiKey = process.env.VERIFYMY_API_KEY || 'test_key';
  }

  async submit2257Document(documentData: KycDocumentData): Promise<{ id: string; status: string }> {
    try {
      // Create 2257 record
      const record = await storage.create2257Record({
        userId: documentData.userId,
        docType: documentData.docType,
        s3Key: documentData.s3Key,
        checksum: documentData.checksum
      });

      // Initiate verification process
      const verification = await this.initiateDocumentVerification(documentData);
      
      // Update user KYC status
      await storage.upsertKycVerification({
        userId: documentData.userId,
        provider: 'verifymy',
        externalId: verification.externalId,
        status: 'pending',
        dataJson: {
          documentType: documentData.docType,
          submittedAt: new Date().toISOString()
        }
      });

      // Create audit log
      await storage.createAuditLog({
        actorId: documentData.userId,
        action: 'kyc_document_submitted',
        targetType: '2257_record',
        targetId: record.id,
        diffJson: { docType: documentData.docType }
      });

      // Notify admins of new submission
      await notificationService.sendSystemNotification({
        kind: 'system',
        payloadJson: {
          message: `New 2257 document submitted: ${documentData.docType}`,
          userId: documentData.userId,
          docType: documentData.docType
        }
      });

      return { id: record.id, status: 'pending' };
    } catch (error) {
      console.error('Error submitting 2257 document:', error);
      throw error;
    }
  }

  private async initiateDocumentVerification(documentData: KycDocumentData): Promise<{ externalId: string }> {
    // In production, this would integrate with actual verification providers
    // like VerifyMy, Jumio, or similar KYC services
    
    const mockExternalId = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Simulate API call to verification provider
    console.log(`Initiating verification for ${documentData.docType} via VerifyMy`);
    
    return { externalId: mockExternalId };
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
      const { external_id, status, user_data, verification_data } = payload;
      
      if (!external_id) {
        throw new Error('No external_id in payload');
      }

      // Find the verification record by external_id
      const kyc = await storage.getKycByExternalId(external_id);
      if (!kyc) {
        throw new Error('KYC verification not found');
      }

      // Update verification status
      await storage.upsertKycVerification({
        userId: kyc.userId,
        provider: kyc.provider,
        externalId: kyc.externalId,
        status: status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'pending',
        dataJson: {
          ...kyc.dataJson,
          verificationData: verification_data,
          completedAt: new Date().toISOString()
        }
      });

      // Notify user of verification result
      await notificationService.sendNotification(kyc.userId, {
        kind: 'kyc',
        payloadJson: {
          message: status === 'approved' 
            ? 'Your identity verification has been approved'
            : 'Your identity verification requires additional review',
          status
        }
      });

      // Create audit log
      await storage.createAuditLog({
        actorId: 'system',
        action: `kyc_${status}`,
        targetType: 'kyc_verification',
        targetId: kyc.id,
        diffJson: { externalId: external_id, verificationData: verification_data }
      });

      // If approved, update user compliance status
      if (status === 'approved') {
        await this.updateUserComplianceStatus(kyc.userId);
      }
      
      return kyc;
    } catch (error) {
      console.error('Error handling KYC webhook:', error);
      throw error;
    }
  }

  private async updateUserComplianceStatus(userId: string): Promise<void> {
    // Check if user has all required verifications
    const requiredDocs = ['id_verification', 'consent_form', 'model_release'];
    const records = await storage.get2257Records(userId);
    
    const hasAllDocs = requiredDocs.every(docType => 
      records.some(record => record.docType === docType)
    );

    if (hasAllDocs) {
      // User is now fully compliant
      await storage.updateUser(userId, { 
        complianceStatus: 'verified',
        verifiedAt: new Date()
      });

      // Notify user of full verification
      await notificationService.sendNotification(userId, {
        kind: 'system',
        payloadJson: {
          message: 'Congratulations! Your account is now fully verified and compliant.',
          status: 'verified'
        }
      });
    }
  }

  async getVerificationStatus(userId: string): Promise<{
    status: string;
    requiredDocuments: string[];
    submittedDocuments: string[];
    missingDocuments: string[];
    complianceScore: number;
  }> {
    const kyc = await storage.getKycVerification(userId);
    const records = await storage.get2257Records(userId);
    
    const requiredDocs = ['id_verification', 'consent_form', 'model_release'];
    const submittedDocs = records.map(r => r.docType);
    const missingDocs = requiredDocs.filter(doc => !submittedDocs.includes(doc));
    
    // Calculate compliance score (0-100)
    const complianceScore = Math.round((submittedDocs.length / requiredDocs.length) * 100);

    return {
      status: kyc?.status || 'pending',
      requiredDocuments: requiredDocs,
      submittedDocuments: submittedDocs,
      missingDocuments: missingDocs,
      complianceScore
    };
  }

  async flagComplianceViolation(userId: string, reason: string, severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    // Create compliance violation record
    await storage.createAuditLog({
      actorId: 'system',
      action: 'compliance_violation',
      targetType: 'user',
      targetId: userId,
      diffJson: { reason, severity, timestamp: new Date().toISOString() }
    });

    // If critical, immediately suspend user and trigger kill switch
    if (severity === 'critical') {
      await storage.updateUser(userId, { 
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason
      });

      // Trigger kill switch for all user content
      await this.triggerKillSwitch(userId, reason);
    }

    // Notify compliance team
    await notificationService.sendSystemNotification({
      kind: 'system',
      payloadJson: {
        message: `Compliance violation flagged: ${reason}`,
        userId,
        severity,
        timestamp: new Date().toISOString()
      }
    });
  }

  private async triggerKillSwitch(userId: string, reason: string): Promise<void> {
    console.log(`🚨 KILL SWITCH ACTIVATED for user ${userId}: ${reason}`);
    
    // Immediately hide all user content
    const userMedia = await storage.getMediaAssetsByOwner(userId);
    for (const media of userMedia) {
      await storage.updateMediaAssetStatus(media.id, 'flagged');
      
      // Flag via AI moderation service for audit trail
      await aiModerationService.flagContent(media.id, reason, 'critical');
    }

    // Create high-priority audit log
    await storage.createAuditLog({
      actorId: 'system',
      action: 'kill_switch_activated',
      targetType: 'user',
      targetId: userId,
      diffJson: { 
        reason, 
        affectedMedia: userMedia.length,
        timestamp: new Date().toISOString()
      }
    });

    // Send immediate alerts to all admins
    await notificationService.sendSystemNotification({
      kind: 'system',
      payloadJson: {
        message: `🚨 KILL SWITCH: User ${userId} suspended - ${reason}`,
        userId,
        reason,
        severity: 'critical',
        mediaCount: userMedia.length
      }
    });
  }
}

export const kycService = new KycService();
