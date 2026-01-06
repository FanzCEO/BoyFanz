// @ts-nocheck
/**
 * AI Content Scoring Service
 *
 * Scores content during the moderation/approval process.
 * Integrates with Creator Pro merit system to track content quality.
 *
 * Scoring Categories (each 0-100):
 * - Technical Quality: Resolution, lighting, audio quality
 * - Creativity: Originality, effort, presentation
 * - Engagement Potential: Predicted engagement based on content type
 * - Compliance: Policy adherence, appropriate content
 */

import { db } from '../db';
import { eq, and, sql, desc } from 'drizzle-orm';
import {
  contentQualityScores,
  posts,
  postMedia,
  creatorProMetrics,
} from '../../shared/schema';

export interface ContentScore {
  technicalQuality: number;
  creativityScore: number;
  engagementPotential: number;
  complianceScore: number;
  overallScore: number;
  analysisDetails: {
    technicalNotes: string[];
    creativityNotes: string[];
    engagementNotes: string[];
    complianceNotes: string[];
    recommendations: string[];
  };
}

export interface ScoringResult {
  id: string;
  contentId: string;
  contentType: string;
  scores: ContentScore;
  approvalStatus: 'approved' | 'rejected' | 'pending' | 'needs_review';
  autoApproved: boolean;
}

// Scoring thresholds
const THRESHOLDS = {
  autoApprove: 75,      // Auto-approve if overall >= 75
  needsReview: 50,      // Needs manual review if between 50-75
  autoReject: 30,       // Auto-reject if overall < 30
};

// Content type base scores (some content types naturally score higher)
const CONTENT_TYPE_MODIFIERS: Record<string, number> = {
  'photo': 0,
  'video': 5,      // Videos get slight bonus
  'live_stream': 10, // Live streams get higher bonus
  'story': -5,     // Stories are ephemeral, lower base
  'album': 3,      // Albums show effort
};

class ContentScoringService {
  /**
   * Analyze and score content
   */
  async scoreContent(
    contentId: string,
    contentType: 'post' | 'media' | 'stream',
    creatorId: string,
    metadata: {
      mediaType?: 'photo' | 'video' | 'live_stream' | 'story' | 'album';
      duration?: number;        // Video duration in seconds
      resolution?: string;      // e.g., "1920x1080"
      fileSize?: number;        // In bytes
      hasAudio?: boolean;
      captionLength?: number;
      hashtagCount?: number;
      isOriginal?: boolean;     // True if we detect it's original content
      contentWarnings?: string[];
    }
  ): Promise<ScoringResult> {
    // Calculate individual scores
    const technicalQuality = this.calculateTechnicalQuality(metadata);
    const creativityScore = this.calculateCreativityScore(metadata);
    const engagementPotential = this.calculateEngagementPotential(metadata);
    const complianceScore = this.calculateComplianceScore(metadata);

    // Calculate weighted overall score
    const weights = {
      technical: 0.25,
      creativity: 0.25,
      engagement: 0.25,
      compliance: 0.25,
    };

    let overallScore = Math.round(
      technicalQuality * weights.technical +
      creativityScore * weights.creativity +
      engagementPotential * weights.engagement +
      complianceScore * weights.compliance
    );

    // Apply content type modifier
    const typeModifier = CONTENT_TYPE_MODIFIERS[metadata.mediaType || 'photo'] || 0;
    overallScore = Math.min(100, Math.max(0, overallScore + typeModifier));

    // Generate analysis details
    const analysisDetails = this.generateAnalysisDetails(
      metadata,
      technicalQuality,
      creativityScore,
      engagementPotential,
      complianceScore
    );

    // Determine approval status
    let approvalStatus: 'approved' | 'rejected' | 'pending' | 'needs_review';
    let autoApproved = false;

    if (overallScore >= THRESHOLDS.autoApprove && complianceScore >= 70) {
      approvalStatus = 'approved';
      autoApproved = true;
    } else if (overallScore < THRESHOLDS.autoReject || complianceScore < 40) {
      approvalStatus = 'rejected';
    } else {
      approvalStatus = 'needs_review';
    }

    // Store score in database
    const [scoreRecord] = await db.insert(contentQualityScores).values({
      contentId,
      contentType,
      creatorId,
      technicalQuality,
      creativityScore,
      engagementPotential,
      complianceScore,
      overallScore,
      aiModel: 'content-scorer-v1',
      analysisDetails,
      approvalStatus,
      ...(autoApproved ? { approvedAt: new Date() } : {}),
    }).returning();

    // Update creator's average quality score
    await this.updateCreatorQualityAverage(creatorId);

    return {
      id: scoreRecord.id,
      contentId,
      contentType,
      scores: {
        technicalQuality,
        creativityScore,
        engagementPotential,
        complianceScore,
        overallScore,
        analysisDetails,
      },
      approvalStatus,
      autoApproved,
    };
  }

  /**
   * Calculate technical quality score
   */
  private calculateTechnicalQuality(metadata: {
    resolution?: string;
    duration?: number;
    fileSize?: number;
    hasAudio?: boolean;
  }): number {
    let score = 50; // Base score

    // Resolution scoring
    if (metadata.resolution) {
      const [width, height] = metadata.resolution.split('x').map(Number);
      if (width >= 3840 || height >= 2160) score += 25; // 4K
      else if (width >= 1920 || height >= 1080) score += 20; // 1080p
      else if (width >= 1280 || height >= 720) score += 10; // 720p
      else if (width >= 854 || height >= 480) score += 5; // 480p
      else score -= 10; // Below 480p
    }

    // Video duration scoring (optimal 30s - 3min)
    if (metadata.duration) {
      if (metadata.duration >= 30 && metadata.duration <= 180) score += 15;
      else if (metadata.duration > 180 && metadata.duration <= 600) score += 10;
      else if (metadata.duration > 600) score += 5;
      else score += 5; // Very short clips
    }

    // File size scoring (indicates quality)
    if (metadata.fileSize) {
      const sizeMB = metadata.fileSize / (1024 * 1024);
      if (sizeMB >= 50) score += 10;
      else if (sizeMB >= 10) score += 5;
    }

    // Audio quality
    if (metadata.hasAudio) score += 5;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate creativity score
   */
  private calculateCreativityScore(metadata: {
    captionLength?: number;
    hashtagCount?: number;
    isOriginal?: boolean;
  }): number {
    let score = 50; // Base score

    // Caption quality
    if (metadata.captionLength) {
      if (metadata.captionLength >= 100) score += 20; // Detailed caption
      else if (metadata.captionLength >= 50) score += 15;
      else if (metadata.captionLength >= 20) score += 10;
      else if (metadata.captionLength > 0) score += 5;
    }

    // Hashtag usage (optimal 3-10)
    if (metadata.hashtagCount) {
      if (metadata.hashtagCount >= 3 && metadata.hashtagCount <= 10) score += 15;
      else if (metadata.hashtagCount >= 1 && metadata.hashtagCount <= 15) score += 10;
      else if (metadata.hashtagCount > 15) score -= 5; // Hashtag spam
    }

    // Originality bonus
    if (metadata.isOriginal) score += 20;

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate engagement potential score
   */
  private calculateEngagementPotential(metadata: {
    mediaType?: string;
    duration?: number;
    captionLength?: number;
  }): number {
    let score = 50; // Base score

    // Media type engagement
    const typeEngagement: Record<string, number> = {
      'video': 20,
      'live_stream': 25,
      'photo': 10,
      'album': 15,
      'story': 5,
    };
    score += typeEngagement[metadata.mediaType || 'photo'] || 0;

    // Optimal video length for engagement
    if (metadata.duration) {
      if (metadata.duration >= 15 && metadata.duration <= 60) score += 15; // Short-form content
      else if (metadata.duration > 60 && metadata.duration <= 300) score += 10;
      else if (metadata.duration > 300) score += 5;
    }

    // Caption encourages engagement
    if (metadata.captionLength && metadata.captionLength > 0) {
      score += Math.min(15, metadata.captionLength / 10);
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Calculate compliance score
   */
  private calculateComplianceScore(metadata: {
    contentWarnings?: string[];
  }): number {
    let score = 100; // Start at full compliance

    // Deduct for content warnings
    if (metadata.contentWarnings) {
      const warningPenalties: Record<string, number> = {
        'explicit': -10, // Normal for adult platform
        'extreme': -30,
        'underage_appearance': -100, // Immediate rejection
        'non_consensual': -100,
        'illegal': -100,
        'hate_speech': -50,
        'violence': -40,
        'spam': -20,
        'copyright': -30,
      };

      for (const warning of metadata.contentWarnings) {
        score += warningPenalties[warning] || -10;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Generate detailed analysis notes
   */
  private generateAnalysisDetails(
    metadata: any,
    technicalQuality: number,
    creativityScore: number,
    engagementPotential: number,
    complianceScore: number
  ) {
    const technicalNotes: string[] = [];
    const creativityNotes: string[] = [];
    const engagementNotes: string[] = [];
    const complianceNotes: string[] = [];
    const recommendations: string[] = [];

    // Technical notes
    if (metadata.resolution) {
      const [width] = metadata.resolution.split('x').map(Number);
      if (width >= 1920) technicalNotes.push('High resolution content');
      else if (width < 720) {
        technicalNotes.push('Low resolution detected');
        recommendations.push('Consider uploading higher resolution content for better engagement');
      }
    }

    if (technicalQuality >= 80) {
      technicalNotes.push('Excellent technical quality');
    } else if (technicalQuality < 50) {
      recommendations.push('Focus on improving technical quality (lighting, resolution, audio)');
    }

    // Creativity notes
    if (metadata.captionLength && metadata.captionLength >= 100) {
      creativityNotes.push('Detailed, engaging caption');
    } else if (!metadata.captionLength || metadata.captionLength < 20) {
      creativityNotes.push('Caption could be more descriptive');
      recommendations.push('Add a more detailed caption to improve engagement');
    }

    if (metadata.isOriginal) {
      creativityNotes.push('Original content bonus applied');
    }

    // Engagement notes
    if (engagementPotential >= 80) {
      engagementNotes.push('High engagement potential');
    } else if (engagementPotential < 50) {
      engagementNotes.push('Below average engagement potential');
      recommendations.push('Consider posting at peak times and engaging with comments');
    }

    // Compliance notes
    if (complianceScore >= 90) {
      complianceNotes.push('Fully compliant content');
    } else if (complianceScore < 70) {
      complianceNotes.push('Some compliance concerns flagged');
    }

    if (metadata.contentWarnings?.length > 0) {
      complianceNotes.push(`Content warnings: ${metadata.contentWarnings.join(', ')}`);
    }

    return {
      technicalNotes,
      creativityNotes,
      engagementNotes,
      complianceNotes,
      recommendations,
    };
  }

  /**
   * Update creator's average quality score
   */
  private async updateCreatorQualityAverage(creatorId: string): Promise<void> {
    const result = await db
      .select({
        avgScore: sql<number>`COALESCE(AVG(${contentQualityScores.overallScore}), 0)`,
      })
      .from(contentQualityScores)
      .where(and(
        eq(contentQualityScores.creatorId, creatorId),
        eq(contentQualityScores.approvalStatus, 'approved')
      ));

    const avgQuality = result[0]?.avgScore || 0;

    await db
      .update(creatorProMetrics)
      .set({
        averageContentQuality: avgQuality,
        updatedAt: new Date(),
      })
      .where(eq(creatorProMetrics.userId, creatorId));
  }

  /**
   * Get content score by content ID
   */
  async getContentScore(contentId: string): Promise<ScoringResult | null> {
    const score = await db.query.contentQualityScores?.findFirst({
      where: eq(contentQualityScores.contentId, contentId),
    });

    if (!score) return null;

    return {
      id: score.id,
      contentId: score.contentId,
      contentType: score.contentType,
      scores: {
        technicalQuality: score.technicalQuality,
        creativityScore: score.creativityScore,
        engagementPotential: score.engagementPotential,
        complianceScore: score.complianceScore,
        overallScore: score.overallScore,
        analysisDetails: score.analysisDetails as any,
      },
      approvalStatus: score.approvalStatus as any,
      autoApproved: score.approvedAt !== null && !score.approvedBy,
    };
  }

  /**
   * Moderator override of content score
   */
  async moderatorOverride(
    contentId: string,
    moderatorId: string,
    newScore: number,
    notes: string,
    approvalStatus: 'approved' | 'rejected'
  ): Promise<void> {
    const score = await db.query.contentQualityScores?.findFirst({
      where: eq(contentQualityScores.contentId, contentId),
    });

    if (!score) {
      throw new Error('Content score not found');
    }

    await db
      .update(contentQualityScores)
      .set({
        moderatorOverride: true,
        moderatorScore: newScore,
        moderatorNotes: notes,
        overallScore: newScore, // Update overall with moderator score
        approvalStatus,
        approvedBy: approvalStatus === 'approved' ? moderatorId : null,
        approvedAt: approvalStatus === 'approved' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(contentQualityScores.contentId, contentId));

    // Recalculate creator's average
    await this.updateCreatorQualityAverage(score.creatorId);
  }

  /**
   * Get creator's content scoring history
   */
  async getCreatorScoringHistory(creatorId: string, limit = 50): Promise<ScoringResult[]> {
    const scores = await db.query.contentQualityScores?.findMany({
      where: eq(contentQualityScores.creatorId, creatorId),
      orderBy: desc(contentQualityScores.createdAt),
      limit,
    }) || [];

    return scores.map(score => ({
      id: score.id,
      contentId: score.contentId,
      contentType: score.contentType,
      scores: {
        technicalQuality: score.technicalQuality,
        creativityScore: score.creativityScore,
        engagementPotential: score.engagementPotential,
        complianceScore: score.complianceScore,
        overallScore: score.overallScore,
        analysisDetails: score.analysisDetails as any,
      },
      approvalStatus: score.approvalStatus as any,
      autoApproved: score.approvedAt !== null && !score.approvedBy,
    }));
  }
}

export const contentScoringService = new ContentScoringService();
export default contentScoringService;
