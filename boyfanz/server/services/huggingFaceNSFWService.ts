// @ts-nocheck
/**
 * Hugging Face NSFW Detection Service
 *
 * Uses open-source models from Hugging Face for cost-effective NSFW content moderation:
 * - Marqo/nsfw-image-detection-384 (Best accuracy)
 * - Falconsai/nsfw_image_detection (Fast, reliable)
 * - TostAI/nsfw-text-detection-large (Text/prompt moderation)
 * - prithivMLmods/Guard-Against-Unsafe-Content-Siglip2 (99% accuracy)
 */

import { storage } from '../storage';

export interface NSFWDetectionResult {
  isNSFW: boolean;
  confidence: number;
  category: 'safe' | 'suggestive' | 'nsfw' | 'explicit';
  scores: {
    safe: number;
    suggestive: number;
    nsfw: number;
    explicit?: number;
  };
  model: string;
  processingTime: number;
  requiresAgeGate: boolean;
  requiresBlur: boolean;
}

export interface TextModerationResult {
  isNSFW: boolean;
  confidence: number;
  categories: {
    sexual: number;
    violence: number;
    harassment: number;
    hateSpeech: number;
    selfHarm: number;
    illegal: number;
  };
  flaggedTerms: string[];
  recommendation: 'allow' | 'warn' | 'block';
}

export interface AgeEstimationResult {
  estimatedAge: number;
  confidence: number;
  isMinor: boolean;
  faceDetected: boolean;
  multipleFaces: number;
}

interface HuggingFaceConfig {
  apiKey: string;
  baseUrl: string;
  models: {
    nsfwImage: string;
    nsfwImageFast: string;
    nsfwText: string;
    ageEstimation: string;
    faceDetection: string;
  };
  thresholds: {
    nsfw: number;
    suggestive: number;
    ageGate: number;
    blur: number;
  };
}

class HuggingFaceNSFWService {
  private config: HuggingFaceConfig;
  private cache: Map<string, NSFWDetectionResult> = new Map();
  private requestQueue: Map<string, Promise<any>> = new Map();
  private rateLimitDelay = 100; // ms between requests

  constructor() {
    this.config = {
      apiKey: process.env.HUGGINGFACE_API_KEY || '',
      baseUrl: 'https://router.huggingface.co/models',
      models: {
        // Primary model - best accuracy for adult content
        nsfwImage: process.env.HF_NSFW_MODEL || 'Marqo/nsfw-image-detection-384',
        // Fast fallback model
        nsfwImageFast: 'Falconsai/nsfw_image_detection',
        // Text moderation
        nsfwText: 'TostAI/nsfw-text-detection-large',
        // Age estimation
        ageEstimation: 'nateraw/vit-age-classifier',
        // Face detection
        faceDetection: 'dima806/facial_emotions_image_detection'
      },
      thresholds: {
        nsfw: parseFloat(process.env.NSFW_THRESHOLD || '0.5'),
        suggestive: parseFloat(process.env.SUGGESTIVE_THRESHOLD || '0.3'),
        ageGate: parseFloat(process.env.AGE_GATE_THRESHOLD || '0.4'),
        blur: parseFloat(process.env.BLUR_THRESHOLD || '0.6')
      }
    };

    console.log('🤗 Hugging Face NSFW Service initialized');
    console.log(`📊 Using models: ${this.config.models.nsfwImage}, ${this.config.models.nsfwText}`);
  }

  /**
   * Detect NSFW content in an image
   */
  async detectNSFWImage(imageInput: string | Buffer): Promise<NSFWDetectionResult> {
    const startTime = Date.now();

    try {
      // Generate cache key
      const cacheKey = this.generateCacheKey(imageInput);

      // Check cache
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('📋 Using cached NSFW result');
        return cached;
      }

      // Prepare image data
      const imageData = await this.prepareImageData(imageInput);

      // Try primary model first
      let result: NSFWDetectionResult;
      try {
        result = await this.callNSFWModel(imageData, this.config.models.nsfwImage);
      } catch (primaryError) {
        console.warn('⚠️ Primary model failed, trying fallback...');
        result = await this.callNSFWModel(imageData, this.config.models.nsfwImageFast);
      }

      result.processingTime = Date.now() - startTime;

      // Cache result
      this.cache.set(cacheKey, result);

      // Cleanup old cache entries (keep last 1000)
      if (this.cache.size > 1000) {
        const firstKey = this.cache.keys().next().value;
        this.cache.delete(firstKey);
      }

      console.log(`🔍 NSFW Detection: ${result.category} (${(result.confidence * 100).toFixed(1)}%) in ${result.processingTime}ms`);

      return result;

    } catch (error) {
      console.error('❌ NSFW detection failed:', error);

      // Fail-safe: Return conservative result
      return {
        isNSFW: true,
        confidence: 0.5,
        category: 'suggestive',
        scores: { safe: 0.2, suggestive: 0.5, nsfw: 0.3 },
        model: 'fallback',
        processingTime: Date.now() - startTime,
        requiresAgeGate: true,
        requiresBlur: true
      };
    }
  }

  /**
   * Detect NSFW content in text (captions, messages, prompts)
   */
  async detectNSFWText(text: string): Promise<TextModerationResult> {
    try {
      if (!text || text.trim().length === 0) {
        return {
          isNSFW: false,
          confidence: 1.0,
          categories: { sexual: 0, violence: 0, harassment: 0, hateSpeech: 0, selfHarm: 0, illegal: 0 },
          flaggedTerms: [],
          recommendation: 'allow'
        };
      }

      const response = await this.callHuggingFaceAPI(this.config.models.nsfwText, { inputs: text });

      // Parse response based on model output format
      const scores = this.parseTextModerationResponse(response);

      const maxScore = Math.max(...Object.values(scores.categories));
      const isNSFW = scores.categories.sexual > 0.5 || maxScore > 0.7;

      return {
        isNSFW,
        confidence: maxScore,
        categories: scores.categories,
        flaggedTerms: scores.flaggedTerms,
        recommendation: maxScore > 0.8 ? 'block' : maxScore > 0.5 ? 'warn' : 'allow'
      };

    } catch (error) {
      console.error('❌ Text moderation failed:', error);
      return {
        isNSFW: false,
        confidence: 0,
        categories: { sexual: 0, violence: 0, harassment: 0, hateSpeech: 0, selfHarm: 0, illegal: 0 },
        flaggedTerms: [],
        recommendation: 'allow'
      };
    }
  }

  /**
   * Estimate age from face in image (for additional safety)
   */
  async estimateAge(imageInput: string | Buffer): Promise<AgeEstimationResult> {
    try {
      const imageData = await this.prepareImageData(imageInput);

      const response = await this.callHuggingFaceAPI(this.config.models.ageEstimation, imageData);

      // Parse age estimation response
      const ageResult = this.parseAgeResponse(response);

      console.log(`👤 Age estimation: ${ageResult.estimatedAge} years (${(ageResult.confidence * 100).toFixed(1)}% confidence)`);

      return ageResult;

    } catch (error) {
      console.error('❌ Age estimation failed:', error);

      // Fail-safe: Assume potential minor
      return {
        estimatedAge: 16,
        confidence: 0.1,
        isMinor: true,
        faceDetected: false,
        multipleFaces: 0
      };
    }
  }

  /**
   * Comprehensive content moderation (image + text + age)
   */
  async moderateContent(params: {
    imageUrl?: string;
    imageBuffer?: Buffer;
    text?: string;
    checkAge?: boolean;
  }): Promise<{
    approved: boolean;
    nsfwResult?: NSFWDetectionResult;
    textResult?: TextModerationResult;
    ageResult?: AgeEstimationResult;
    actions: string[];
    reason: string;
  }> {
    const actions: string[] = [];
    let approved = true;
    let reason = 'Content approved';

    // Check image NSFW
    let nsfwResult: NSFWDetectionResult | undefined;
    if (params.imageUrl || params.imageBuffer) {
      nsfwResult = await this.detectNSFWImage(params.imageUrl || params.imageBuffer!);

      if (nsfwResult.category === 'explicit') {
        actions.push('age_gate_required');
        actions.push('blur_preview');
      } else if (nsfwResult.category === 'nsfw') {
        actions.push('age_gate_required');
        if (nsfwResult.confidence > this.config.thresholds.blur) {
          actions.push('blur_preview');
        }
      } else if (nsfwResult.category === 'suggestive') {
        if (nsfwResult.confidence > this.config.thresholds.ageGate) {
          actions.push('age_gate_required');
        }
      }
    }

    // Check text content
    let textResult: TextModerationResult | undefined;
    if (params.text) {
      textResult = await this.detectNSFWText(params.text);

      if (textResult.recommendation === 'block') {
        approved = false;
        reason = `Text contains prohibited content: ${textResult.flaggedTerms.join(', ')}`;
        actions.push('block_content');
      } else if (textResult.recommendation === 'warn') {
        actions.push('manual_review');
      }
    }

    // Check age if requested and image provided
    let ageResult: AgeEstimationResult | undefined;
    if (params.checkAge && (params.imageUrl || params.imageBuffer)) {
      ageResult = await this.estimateAge(params.imageUrl || params.imageBuffer!);

      if (ageResult.isMinor && ageResult.confidence > 0.6) {
        approved = false;
        reason = `Potential minor detected (estimated age: ${ageResult.estimatedAge})`;
        actions.push('block_content');
        actions.push('manual_review_required');
        actions.push('flag_for_compliance');
      }
    }

    return {
      approved,
      nsfwResult,
      textResult,
      ageResult,
      actions,
      reason
    };
  }

  /**
   * Batch process multiple images
   */
  async batchDetectNSFW(images: (string | Buffer)[]): Promise<NSFWDetectionResult[]> {
    const results: NSFWDetectionResult[] = [];

    // Process in batches of 5 to avoid rate limiting
    const batchSize = 5;
    for (let i = 0; i < images.length; i += batchSize) {
      const batch = images.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(img => this.detectNSFWImage(img))
      );
      results.push(...batchResults);

      // Add delay between batches
      if (i + batchSize < images.length) {
        await this.delay(this.rateLimitDelay * 2);
      }
    }

    return results;
  }

  // ===== Private Helper Methods =====

  private async callNSFWModel(imageData: Buffer, model: string): Promise<NSFWDetectionResult> {
    const response = await this.callHuggingFaceAPI(model, imageData);

    // Parse the response based on model format
    return this.parseNSFWResponse(response, model);
  }

  private async callHuggingFaceAPI(model: string, data: any): Promise<any> {
    const url = `${this.config.baseUrl}/${model}`;

    // Check for pending request to same endpoint
    const requestKey = `${model}:${this.generateCacheKey(data)}`;
    const pendingRequest = this.requestQueue.get(requestKey);
    if (pendingRequest) {
      return pendingRequest;
    }

    const headers: Record<string, string> = {};

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    let body: any;
    let contentType: string;

    if (Buffer.isBuffer(data)) {
      body = data;
      contentType = 'application/octet-stream';
    } else {
      body = JSON.stringify(data);
      contentType = 'application/json';
    }

    headers['Content-Type'] = contentType;

    const request = fetch(url, {
      method: 'POST',
      headers,
      body
    }).then(async (response) => {
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
      }
      return response.json();
    }).finally(() => {
      this.requestQueue.delete(requestKey);
    });

    this.requestQueue.set(requestKey, request);

    // Add rate limiting delay
    await this.delay(this.rateLimitDelay);

    return request;
  }

  private async prepareImageData(input: string | Buffer): Promise<Buffer> {
    if (Buffer.isBuffer(input)) {
      return input;
    }

    // If URL, fetch the image
    if (input.startsWith('http://') || input.startsWith('https://')) {
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    }

    // If base64
    if (input.startsWith('data:image')) {
      const base64Data = input.split(',')[1];
      return Buffer.from(base64Data, 'base64');
    }

    // Assume it's already base64 without prefix
    return Buffer.from(input, 'base64');
  }

  private parseNSFWResponse(response: any, model: string): NSFWDetectionResult {
    // Different models return different formats
    // Handle common formats

    let scores = { safe: 0, suggestive: 0, nsfw: 0, explicit: 0 };

    if (Array.isArray(response)) {
      // Format: [{ label: "nsfw", score: 0.9 }, { label: "safe", score: 0.1 }]
      for (const item of response) {
        const label = item.label?.toLowerCase() || '';
        const score = item.score || 0;

        if (label.includes('safe') || label === 'sfw' || label === 'normal') {
          scores.safe = score;
        } else if (label.includes('suggestive') || label === 'questionable' || label === 'sexy') {
          scores.suggestive = score;
        } else if (label.includes('nsfw') || label === 'porn' || label === 'hentai') {
          scores.nsfw = score;
        } else if (label.includes('explicit') || label === 'xxx') {
          scores.explicit = score;
        } else if (label === 'unsafe' || label === 'unsafe content') {
          scores.nsfw = score;
        }
      }
    } else if (response && typeof response === 'object') {
      // Format: { nsfw: 0.9, safe: 0.1 }
      scores.safe = response.safe || response.sfw || 0;
      scores.suggestive = response.suggestive || response.questionable || 0;
      scores.nsfw = response.nsfw || response.porn || response.unsafe || 0;
      scores.explicit = response.explicit || response.xxx || 0;
    }

    // Normalize scores if needed
    const total = scores.safe + scores.suggestive + scores.nsfw + scores.explicit;
    if (total > 0 && total !== 1) {
      scores.safe /= total;
      scores.suggestive /= total;
      scores.nsfw /= total;
      scores.explicit /= total;
    }

    // Determine category
    let category: 'safe' | 'suggestive' | 'nsfw' | 'explicit' = 'safe';
    let maxScore = scores.safe;

    if (scores.explicit > maxScore) {
      category = 'explicit';
      maxScore = scores.explicit;
    }
    if (scores.nsfw > maxScore) {
      category = 'nsfw';
      maxScore = scores.nsfw;
    }
    if (scores.suggestive > maxScore && scores.safe < this.config.thresholds.suggestive) {
      category = 'suggestive';
      maxScore = scores.suggestive;
    }

    const isNSFW = category === 'nsfw' || category === 'explicit' ||
                   (category === 'suggestive' && maxScore > this.config.thresholds.nsfw);

    return {
      isNSFW,
      confidence: maxScore,
      category,
      scores,
      model,
      processingTime: 0,
      requiresAgeGate: isNSFW || (category === 'suggestive' && maxScore > this.config.thresholds.ageGate),
      requiresBlur: category === 'explicit' || (category === 'nsfw' && maxScore > this.config.thresholds.blur)
    };
  }

  private parseTextModerationResponse(response: any): {
    categories: TextModerationResult['categories'];
    flaggedTerms: string[]
  } {
    const categories = {
      sexual: 0,
      violence: 0,
      harassment: 0,
      hateSpeech: 0,
      selfHarm: 0,
      illegal: 0
    };
    const flaggedTerms: string[] = [];

    if (Array.isArray(response)) {
      for (const item of response) {
        const label = item.label?.toLowerCase() || '';
        const score = item.score || 0;

        if (label.includes('sexual') || label.includes('nsfw') || label.includes('adult')) {
          categories.sexual = Math.max(categories.sexual, score);
        }
        if (label.includes('violence') || label.includes('gore')) {
          categories.violence = Math.max(categories.violence, score);
        }
        if (label.includes('harassment') || label.includes('bully')) {
          categories.harassment = Math.max(categories.harassment, score);
        }
        if (label.includes('hate') || label.includes('racist')) {
          categories.hateSpeech = Math.max(categories.hateSpeech, score);
        }
        if (label.includes('self') || label.includes('suicide')) {
          categories.selfHarm = Math.max(categories.selfHarm, score);
        }
        if (label.includes('illegal') || label.includes('drug')) {
          categories.illegal = Math.max(categories.illegal, score);
        }

        if (score > 0.7) {
          flaggedTerms.push(label);
        }
      }
    }

    return { categories, flaggedTerms };
  }

  private parseAgeResponse(response: any): AgeEstimationResult {
    let estimatedAge = 25;
    let confidence = 0.5;
    let faceDetected = false;

    if (Array.isArray(response)) {
      // Find highest confidence age prediction
      let maxScore = 0;
      for (const item of response) {
        if (item.score > maxScore) {
          maxScore = item.score;
          confidence = item.score;
          faceDetected = true;

          // Parse age from label (e.g., "20-30", "25", "young")
          const label = item.label || '';
          const ageMatch = label.match(/(\d+)/);
          if (ageMatch) {
            estimatedAge = parseInt(ageMatch[1], 10);
          } else if (label.includes('child') || label.includes('kid')) {
            estimatedAge = 10;
          } else if (label.includes('teen')) {
            estimatedAge = 15;
          } else if (label.includes('young')) {
            estimatedAge = 20;
          } else if (label.includes('adult') || label.includes('middle')) {
            estimatedAge = 35;
          } else if (label.includes('old') || label.includes('senior')) {
            estimatedAge = 60;
          }
        }
      }
    }

    return {
      estimatedAge,
      confidence,
      isMinor: estimatedAge < 18,
      faceDetected,
      multipleFaces: 1
    };
  }

  private generateCacheKey(input: any): string {
    if (Buffer.isBuffer(input)) {
      // Use first and last bytes + length for quick hash
      const len = input.length;
      return `buf:${len}:${input[0]}:${input[Math.floor(len/2)]}:${input[len-1]}`;
    }
    if (typeof input === 'string') {
      return `str:${input.length}:${input.substring(0, 50)}`;
    }
    return `obj:${JSON.stringify(input).substring(0, 50)}`;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; models: Record<string, boolean>; message: string }> {
    const modelStatus: Record<string, boolean> = {};

    try {
      // Test primary NSFW model with a small test
      const testImage = Buffer.alloc(100); // Minimal test buffer

      try {
        await this.callHuggingFaceAPI(this.config.models.nsfwImage, { inputs: 'test' });
        modelStatus[this.config.models.nsfwImage] = true;
      } catch {
        modelStatus[this.config.models.nsfwImage] = false;
      }

      const healthy = Object.values(modelStatus).some(v => v);

      return {
        healthy,
        models: modelStatus,
        message: healthy ? 'NSFW detection service operational' : 'All models unavailable'
      };
    } catch (error) {
      return {
        healthy: false,
        models: modelStatus,
        message: `Health check failed: ${error}`
      };
    }
  }
}

// Export singleton instance
export const huggingFaceNSFWService = new HuggingFaceNSFWService();

// Export class for testing
export { HuggingFaceNSFWService };
