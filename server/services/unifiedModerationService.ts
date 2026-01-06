// @ts-nocheck
/**
 * Unified Content Moderation Service
 *
 * Orchestrates multiple AI moderation providers:
 * 1. Hugging Face (Primary - Free/Low-cost)
 * 2. Sightengine (Fallback - Enterprise accuracy)
 * 3. VerifyMy (Age/Identity verification)
 *
 * Decision flow:
 * - Primary: Hugging Face for all content
 * - If confidence < 0.7: Escalate to Sightengine
 * - If potential minor detected: Mandatory Sightengine + VerifyMy
 * - If CSAM suspected: Immediate block + report
 */

import { huggingFaceNSFWService, NSFWDetectionResult, TextModerationResult } from './huggingFaceNSFWService';
import { sightengineService, SightengineResult } from './sightengineService';
import { kycService } from './kycService';
import { storage } from '../storage';

export interface ModerationDecision {
  contentId: string;
  approved: boolean;
  action: 'approve' | 'age_gate' | 'blur' | 'manual_review' | 'block' | 'report_authorities';
  confidence: number;
  category: 'safe' | 'suggestive' | 'nsfw' | 'explicit' | 'illegal';
  flags: string[];
  providers: {
    huggingFace?: NSFWDetectionResult;
    sightengine?: SightengineResult;
    combined: {
      nudityScore: number;
      violenceScore: number;
      minorDetected: boolean;
      estimatedAge?: number;
    };
  };
  processingTime: number;
  escalated: boolean;
  reason: string;
}

export interface ModerationConfig {
  enableHuggingFace: boolean;
  enableSightengine: boolean;
  enableVerifyMy: boolean;
  confidenceThreshold: number;
  escalationThreshold: number;
  autoApproveThreshold: number;
  minorDetectionStrict: boolean;
  csamZeroTolerance: boolean;
}

class UnifiedModerationService {
  private config: ModerationConfig;
  private stats = {
    totalProcessed: 0,
    approved: 0,
    blocked: 0,
    escalated: 0,
    manualReview: 0
  };

  constructor() {
    this.config = {
      enableHuggingFace: true,
      enableSightengine: sightengineService.isEnabled(),
      enableVerifyMy: !!(process.env.VERIFYMY_API_KEY && process.env.VERIFYMY_API_KEY !== 'test_key'),
      confidenceThreshold: parseFloat(process.env.MODERATION_CONFIDENCE_THRESHOLD || '0.7'),
      escalationThreshold: parseFloat(process.env.MODERATION_ESCALATION_THRESHOLD || '0.6'),
      autoApproveThreshold: parseFloat(process.env.MODERATION_AUTO_APPROVE_THRESHOLD || '0.9'),
      minorDetectionStrict: process.env.MINOR_DETECTION_STRICT !== 'false',
      csamZeroTolerance: true // Always true - non-configurable
    };

    console.log('🛡️ Unified Moderation Service initialized');
    console.log(`  - Hugging Face: ${this.config.enableHuggingFace ? '✅' : '❌'}`);
    console.log(`  - Sightengine: ${this.config.enableSightengine ? '✅' : '❌'}`);
    console.log(`  - VerifyMy: ${this.config.enableVerifyMy ? '✅' : '❌'}`);
  }

  /**
   * Main moderation entry point
   */
  async moderateContent(params: {
    contentId: string;
    contentType: 'image' | 'video' | 'text' | 'audio';
    contentUrl?: string;
    contentBuffer?: Buffer;
    textContent?: string;
    uploadedBy: string;
    metadata?: Record<string, any>;
  }): Promise<ModerationDecision> {
    const startTime = Date.now();
    this.stats.totalProcessed++;

    console.log(`🔍 Moderating ${params.contentType}: ${params.contentId}`);

    const decision: ModerationDecision = {
      contentId: params.contentId,
      approved: true,
      action: 'approve',
      confidence: 0,
      category: 'safe',
      flags: [],
      providers: {
        combined: {
          nudityScore: 0,
          violenceScore: 0,
          minorDetected: false
        }
      },
      processingTime: 0,
      escalated: false,
      reason: 'Content approved'
    };

    try {
      // Step 1: Primary moderation with Hugging Face
      if (this.config.enableHuggingFace && (params.contentUrl || params.contentBuffer)) {
        const hfResult = await huggingFaceNSFWService.detectNSFWImage(
          params.contentUrl || params.contentBuffer!
        );
        decision.providers.huggingFace = hfResult;
        decision.providers.combined.nudityScore = hfResult.scores.nsfw + hfResult.scores.explicit;
        decision.confidence = hfResult.confidence;
        decision.category = hfResult.category;

        // Check if we need to escalate
        if (hfResult.confidence < this.config.escalationThreshold ||
            hfResult.category === 'explicit' ||
            hfResult.requiresAgeGate) {
          decision.escalated = true;
        }
      }

      // Step 2: Text moderation if text content provided
      if (params.textContent) {
        const textResult = await huggingFaceNSFWService.detectNSFWText(params.textContent);

        if (textResult.recommendation === 'block') {
          decision.approved = false;
          decision.action = 'block';
          decision.flags.push('prohibited_text');
          decision.reason = `Prohibited text content: ${textResult.flaggedTerms.join(', ')}`;
        } else if (textResult.recommendation === 'warn') {
          decision.flags.push('flagged_text');
        }
      }

      // Step 3: Escalate to Sightengine if needed
      if (decision.escalated && this.config.enableSightengine && params.contentUrl) {
        console.log('📈 Escalating to Sightengine for higher accuracy');
        this.stats.escalated++;

        const seResult = await sightengineService.moderateImage(params.contentUrl);

        if (seResult) {
          decision.providers.sightengine = seResult;

          // Analyze Sightengine results
          const nudityAnalysis = sightengineService.analyzeNudityLevel(seResult.nudity);
          decision.category = nudityAnalysis.level;
          decision.providers.combined.nudityScore = seResult.nudity.raw;
          decision.providers.combined.violenceScore = seResult.gore?.prob || 0;

          // Check for weapons/violence
          if (seResult.weapon > 0.5) {
            decision.flags.push('weapon_detected');
          }
          if (seResult.gore?.prob > 0.5) {
            decision.flags.push('violence_detected');
          }

          // Check for minors
          if (seResult.faces?.faces?.length > 0) {
            const minorFaces = seResult.faces.faces.filter((f: any) => f.age < 18);
            if (minorFaces.length > 0) {
              decision.providers.combined.minorDetected = true;
              decision.providers.combined.estimatedAge = Math.min(...minorFaces.map((f: any) => f.age));
              decision.flags.push('potential_minor');

              // CRITICAL: If nudity + minor detected
              if (nudityAnalysis.level !== 'safe') {
                decision.approved = false;
                decision.action = 'report_authorities';
                decision.category = 'illegal';
                decision.reason = 'CRITICAL: Nudity with potential minor detected';
                await this.handleCriticalViolation(params.contentId, params.uploadedBy, decision);
                this.stats.blocked++;
                decision.processingTime = Date.now() - startTime;
                return decision;
              }
            }
          }

          // Update confidence based on Sightengine (higher weight)
          decision.confidence = Math.max(decision.confidence, seResult.nudity.raw);
        }
      }

      // Step 4: Age estimation if minor detection is strict
      if (this.config.minorDetectionStrict && (params.contentUrl || params.contentBuffer)) {
        const ageResult = await huggingFaceNSFWService.estimateAge(
          params.contentUrl || params.contentBuffer!
        );

        if (ageResult.isMinor && ageResult.confidence > 0.5) {
          decision.providers.combined.minorDetected = true;
          decision.providers.combined.estimatedAge = ageResult.estimatedAge;
          decision.flags.push('age_verification_required');

          // If explicit content + potential minor = BLOCK
          if (decision.category === 'explicit' || decision.category === 'nsfw') {
            decision.approved = false;
            decision.action = 'block';
            decision.reason = `Content blocked: Potential minor detected (age: ${ageResult.estimatedAge})`;
            decision.flags.push('blocked_minor_content');
          }
        }
      }

      // Step 5: Determine final action based on category
      if (decision.approved) {
        switch (decision.category) {
          case 'explicit':
            decision.action = 'blur';
            decision.flags.push('age_gate_required', 'blur_required');
            decision.reason = 'Explicit content - age gate and blur applied';
            break;

          case 'nsfw':
            decision.action = 'age_gate';
            decision.flags.push('age_gate_required');
            if (decision.confidence > 0.7) {
              decision.flags.push('blur_recommended');
            }
            decision.reason = 'NSFW content - age gate applied';
            break;

          case 'suggestive':
            if (decision.confidence > this.config.escalationThreshold) {
              decision.action = 'age_gate';
              decision.flags.push('age_gate_recommended');
              decision.reason = 'Suggestive content - age gate recommended';
            } else {
              decision.action = 'approve';
              decision.reason = 'Suggestive content approved';
            }
            break;

          case 'safe':
            decision.action = 'approve';
            decision.reason = 'Safe content approved';
            break;
        }
      }

      // Step 6: Check if manual review is needed
      if (decision.confidence < this.config.confidenceThreshold &&
          decision.confidence > 0.3 &&
          decision.category !== 'safe') {
        decision.action = 'manual_review';
        decision.flags.push('low_confidence');
        decision.reason = `Low confidence (${(decision.confidence * 100).toFixed(1)}%) - manual review required`;
        this.stats.manualReview++;
      }

      // Update stats
      if (decision.approved && decision.action === 'approve') {
        this.stats.approved++;
      } else if (!decision.approved) {
        this.stats.blocked++;
      }

      decision.processingTime = Date.now() - startTime;

      // Store moderation result
      await this.storeResult(params.contentId, params.uploadedBy, decision);

      console.log(`✅ Moderation complete: ${decision.action} (${decision.reason})`);

      return decision;

    } catch (error) {
      console.error('❌ Moderation error:', error);

      // Fail-safe: Block content on error
      decision.approved = false;
      decision.action = 'manual_review';
      decision.reason = 'Moderation system error - queued for manual review';
      decision.flags.push('system_error');
      decision.processingTime = Date.now() - startTime;

      return decision;
    }
  }

  /**
   * Batch moderate multiple content items
   */
  async moderateBatch(items: Array<{
    contentId: string;
    contentType: 'image' | 'video' | 'text';
    contentUrl?: string;
    textContent?: string;
    uploadedBy: string;
  }>): Promise<ModerationDecision[]> {
    const results: ModerationDecision[] = [];

    // Process in parallel batches of 5
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => this.moderateContent(item))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Get moderation statistics
   */
  getStats(): typeof this.stats & { approvalRate: number; escalationRate: number } {
    const approvalRate = this.stats.totalProcessed > 0
      ? (this.stats.approved / this.stats.totalProcessed) * 100
      : 0;
    const escalationRate = this.stats.totalProcessed > 0
      ? (this.stats.escalated / this.stats.totalProcessed) * 100
      : 0;

    return {
      ...this.stats,
      approvalRate,
      escalationRate
    };
  }

  /**
   * Handle critical violations (CSAM, minors in explicit content)
   */
  private async handleCriticalViolation(
    contentId: string,
    userId: string,
    decision: ModerationDecision
  ): Promise<void> {
    console.log(`🚨 CRITICAL VIOLATION: ${contentId}`);

    try {
      // 1. Immediately block content
      await storage.blockContent(contentId);

      // 2. Suspend user account
      await storage.updateUser(userId, {
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: decision.reason
      });

      // 3. Create emergency report
      await storage.createAuditLog({
        actorId: 'system',
        action: 'critical_violation_detected',
        targetType: 'content',
        targetId: contentId,
        diffJson: {
          userId,
          decision: decision.action,
          reason: decision.reason,
          flags: decision.flags,
          timestamp: new Date().toISOString()
        }
      });

      // 4. Flag for KYC if VerifyMy is enabled
      if (this.config.enableVerifyMy) {
        await kycService.flagComplianceViolation(userId, decision.reason, 'critical');
      }

      // 5. Log for legal compliance
      console.log(`📝 Critical violation logged: ${contentId} by ${userId}`);
      console.log(`   Reason: ${decision.reason}`);
      console.log(`   Flags: ${decision.flags.join(', ')}`);

    } catch (error) {
      console.error('❌ Failed to handle critical violation:', error);
    }
  }

  /**
   * Store moderation result in database
   */
  private async storeResult(
    contentId: string,
    userId: string,
    decision: ModerationDecision
  ): Promise<void> {
    try {
      await storage.createAuditLog({
        actorId: 'ai_moderation',
        action: `content_moderated_${decision.action}`,
        targetType: 'content',
        targetId: contentId,
        diffJson: {
          userId,
          approved: decision.approved,
          action: decision.action,
          category: decision.category,
          confidence: decision.confidence,
          flags: decision.flags,
          escalated: decision.escalated,
          processingTime: decision.processingTime,
          providers: {
            huggingFace: decision.providers.huggingFace ? {
              category: decision.providers.huggingFace.category,
              confidence: decision.providers.huggingFace.confidence
            } : null,
            sightengine: decision.providers.sightengine ? {
              nudity: decision.providers.sightengine.nudity?.raw,
              weapon: decision.providers.sightengine.weapon,
              gore: decision.providers.sightengine.gore?.prob
            } : null
          }
        }
      });
    } catch (error) {
      console.error('❌ Failed to store moderation result:', error);
    }
  }

  /**
   * Health check for all moderation services
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    services: {
      huggingFace: { healthy: boolean; message: string };
      sightengine: { healthy: boolean; message: string };
      verifyMy: { healthy: boolean; message: string };
    };
    stats: typeof this.stats;
  }> {
    const [hfHealth, seHealth] = await Promise.all([
      huggingFaceNSFWService.healthCheck(),
      sightengineService.healthCheck()
    ]);

    const verifyMyHealthy = this.config.enableVerifyMy;

    return {
      healthy: hfHealth.healthy || seHealth.healthy,
      services: {
        huggingFace: { healthy: hfHealth.healthy, message: hfHealth.message },
        sightengine: seHealth,
        verifyMy: {
          healthy: verifyMyHealthy,
          message: verifyMyHealthy ? 'VerifyMy configured' : 'VerifyMy not configured'
        }
      },
      stats: this.stats
    };
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<ModerationConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('🔧 Moderation config updated:', updates);
  }
}

// Export singleton
export const unifiedModerationService = new UnifiedModerationService();

// Export class for testing
export { UnifiedModerationService };
