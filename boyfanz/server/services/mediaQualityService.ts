/**
 * Media Quality Scoring Service
 * 
 * AI-powered analysis of uploaded media for Starz Studio tier qualification.
 * Analyzes: Resolution, Bitrate, Framing, Lighting, Audio, Originality
 */

import { db } from "../db";
import { mediaQualityScores, mediaAssets, starzMemberships } from "../../shared/schema";
import { eq, avg } from "drizzle-orm";

interface MediaMetadata {
  width?: number;
  height?: number;
  bitrate?: number;
  duration?: number;
  fileSize: number;
  mimeType: string;
  hasAudio?: boolean;
}

export class MediaQualityService {
  /**
   * Score resolution quality (0-100)
   */
  private scoreResolution(width?: number, height?: number): number {
    if (!width || !height) return 50; // Default for non-visual media
    
    const pixels = width * height;
    
    // Scoring based on resolution
    if (pixels >= 8294400) return 100;  // 4K (3840x2160)
    if (pixels >= 2073600) return 90;   // 1080p (1920x1080)
    if (pixels >= 921600) return 75;    // 720p (1280x720)
    if (pixels >= 409920) return 60;    // 480p (854x480)
    if (pixels >= 230400) return 40;    // 360p (640x360)
    return 20;
  }

  /**
   * Score bitrate quality (0-100)
   */
  private scoreBitrate(bitrate?: number, isVideo?: boolean): number {
    if (!bitrate) return 50;
    
    if (isVideo) {
      if (bitrate >= 25000000) return 100;  // 25 Mbps+
      if (bitrate >= 15000000) return 90;   // 15 Mbps
      if (bitrate >= 8000000) return 80;    // 8 Mbps
      if (bitrate >= 5000000) return 70;    // 5 Mbps
      if (bitrate >= 2500000) return 60;    // 2.5 Mbps
      return 40;
    } else {
      // Audio bitrate
      if (bitrate >= 320000) return 100;  // 320 kbps
      if (bitrate >= 256000) return 90;   // 256 kbps
      if (bitrate >= 192000) return 80;   // 192 kbps
      if (bitrate >= 128000) return 70;   // 128 kbps
      return 50;
    }
  }

  /**
   * Score framing/composition (AI placeholder - returns baseline)
   * In production, this would use AI vision analysis
   */
  private scoreFraming(): number {
    // AI would analyze: rule of thirds, subject centering, crop quality
    return 70; // Baseline score
  }

  /**
   * Score lighting quality (AI placeholder - returns baseline)
   * In production, this would use AI vision analysis
   */
  private scoreLighting(): number {
    // AI would analyze: exposure, contrast, color balance, shadows
    return 70; // Baseline score
  }

  /**
   * Score audio quality (0-100)
   */
  private scoreAudio(metadata: MediaMetadata): number {
    if (!metadata.hasAudio) return 50; // N/A for images
    
    const isVideo = metadata.mimeType.startsWith("video/");
    if (!isVideo) return 50;
    
    // In production, this would analyze actual audio quality
    // For now, estimate based on file characteristics
    return 70; // Baseline score
  }

  /**
   * Score originality (AI placeholder)
   * In production, this would check for plagiarism, watermarks, etc.
   */
  private scoreOriginality(): number {
    // AI would check: duplicate detection, watermarks, AI-generated content
    return 80; // Baseline score (assume original until proven otherwise)
  }

  /**
   * Predict engagement based on content analysis (AI placeholder)
   */
  private predictEngagement(): number {
    // AI would analyze: trending topics, optimal timing, audience preferences
    return 70; // Baseline score
  }

  /**
   * Calculate overall score from individual metrics
   */
  private calculateOverallScore(scores: {
    resolution: number;
    bitrate: number;
    framing: number;
    lighting: number;
    audio: number;
    originality: number;
    engagement: number;
  }): number {
    // Weighted average
    const weights = {
      resolution: 0.20,
      bitrate: 0.15,
      framing: 0.15,
      lighting: 0.15,
      audio: 0.10,
      originality: 0.15,
      engagement: 0.10,
    };

    return Math.round(
      scores.resolution * weights.resolution +
      scores.bitrate * weights.bitrate +
      scores.framing * weights.framing +
      scores.lighting * weights.lighting +
      scores.audio * weights.audio +
      scores.originality * weights.originality +
      scores.engagement * weights.engagement
    );
  }

  /**
   * Analyze and score a media asset
   */
  async analyzeMedia(mediaAssetId: string, profileId: string, metadata: MediaMetadata) {
    const isVideo = metadata.mimeType.startsWith("video/");
    
    const scores = {
      resolution: this.scoreResolution(metadata.width, metadata.height),
      bitrate: this.scoreBitrate(metadata.bitrate, isVideo),
      framing: this.scoreFraming(),
      lighting: this.scoreLighting(),
      audio: this.scoreAudio(metadata),
      originality: this.scoreOriginality(),
      engagement: this.predictEngagement(),
    };

    const overallScore = this.calculateOverallScore(scores);

    // Store the quality score
    const [qualityScore] = await db.insert(mediaQualityScores)
      .values({
        mediaAssetId,
        profileId,
        resolutionScore: scores.resolution,
        bitrateScore: scores.bitrate,
        framingScore: scores.framing,
        lightingScore: scores.lighting,
        audioScore: scores.audio,
        originalityScore: scores.originality,
        engagementPrediction: scores.engagement,
        overallScore,
        aiAnalysisModel: "baseline-v1",
        aiAnalysisResults: { scores, metadata },
      })
      .returning();

    // Update creator's average quality score
    await this.updateCreatorQualityScore(profileId);

    return qualityScore;
  }

  /**
   * Update a creator's average media quality score for Starz membership
   */
  async updateCreatorQualityScore(profileId: string) {
    const avgResult = await db
      .select({ avgScore: avg(mediaQualityScores.overallScore) })
      .from(mediaQualityScores)
      .where(eq(mediaQualityScores.profileId, profileId));

    const avgScore = Math.round(Number(avgResult[0]?.avgScore) || 0);

    await db.update(starzMemberships)
      .set({
        mediaQualityScore: avgScore,
        updatedAt: new Date(),
      })
      .where(eq(starzMemberships.profileId, profileId));

    return avgScore;
  }

  /**
   * Get quality scores for a profile's media
   */
  async getProfileQualityScores(profileId: string) {
    return db.query.mediaQualityScores.findMany({
      where: eq(mediaQualityScores.profileId, profileId),
      orderBy: (scores, { desc }) => [desc(scores.analyzedAt)],
    });
  }

  /**
   * Get quality breakdown analytics
   */
  async getQualityAnalytics(profileId: string) {
    const scores = await this.getProfileQualityScores(profileId);
    
    if (scores.length === 0) {
      return null;
    }

    const avgScores = {
      resolution: scores.reduce((a, s) => a + (s.resolutionScore || 0), 0) / scores.length,
      bitrate: scores.reduce((a, s) => a + (s.bitrateScore || 0), 0) / scores.length,
      framing: scores.reduce((a, s) => a + (s.framingScore || 0), 0) / scores.length,
      lighting: scores.reduce((a, s) => a + (s.lightingScore || 0), 0) / scores.length,
      audio: scores.reduce((a, s) => a + (s.audioScore || 0), 0) / scores.length,
      originality: scores.reduce((a, s) => a + (s.originalityScore || 0), 0) / scores.length,
      overall: scores.reduce((a, s) => a + (s.overallScore || 0), 0) / scores.length,
    };

    const improvements = [];
    if (avgScores.resolution < 70) improvements.push("Upload higher resolution media (1080p+ recommended)");
    if (avgScores.framing < 70) improvements.push("Improve composition and framing in your shots");
    if (avgScores.lighting < 70) improvements.push("Use better lighting for clearer, more appealing content");
    if (avgScores.originality < 80) improvements.push("Focus on creating more original content");

    return {
      totalMediaScored: scores.length,
      averageScores: avgScores,
      improvements,
      trend: scores.slice(0, 10).map(s => ({
        date: s.analyzedAt,
        score: s.overallScore,
      })),
    };
  }
}

export const mediaQualityService = new MediaQualityService();
