// @ts-nocheck
/**
 * Sightengine Content Moderation Service
 *
 * Enterprise-grade fallback for high-confidence moderation
 * Pricing: $29-399/mo depending on volume
 * Accuracy: 99.2% for adult content detection
 *
 * Used as fallback when:
 * - Hugging Face models are uncertain (confidence < 0.7)
 * - Content requires human-level accuracy
 * - CSAM/illegal content detection
 */

export interface SightengineResult {
  status: 'success' | 'error';
  requestId: string;
  nudity: {
    raw: number;
    partial: number;
    safe: number;
    erotica: number;
    sexual_activity: number;
    sexual_display: number;
    sextoy: number;
    suggestive: number;
    suggestive_classes: {
      bikini: number;
      cleavage: number;
      lingerie: number;
      male_chest: number;
      male_underwear: number;
      miniskirt: number;
      other: number;
    };
  };
  weapon: number;
  alcohol: number;
  drugs: number;
  offensive: {
    nazi: number;
    supremacist: number;
    terrorist: number;
    middle_finger: number;
  };
  gore: {
    prob: number;
    types: string[];
  };
  tobacco: number;
  gambling: number;
  money: number;
  scam: number;
  text: {
    has_artificial: boolean;
    has_natural: boolean;
    profanity: string[];
  };
  faces: {
    count: number;
    faces: Array<{
      age: number;
      gender: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    }>;
  };
  celebrities: Array<{
    name: string;
    confidence: number;
  }>;
}

export interface SightengineConfig {
  apiUser: string;
  apiSecret: string;
  baseUrl: string;
  models: string[];
}

class SightengineService {
  private config: SightengineConfig;
  private enabled: boolean;

  constructor() {
    this.config = {
      apiUser: process.env.SIGHTENGINE_API_USER || '',
      apiSecret: process.env.SIGHTENGINE_API_SECRET || '',
      baseUrl: 'https://api.sightengine.com/1.0',
      models: [
        'nudity-2.1',
        'weapon',
        'alcohol',
        'drugs',
        'offensive-2.0',
        'gore-2.0',
        'tobacco',
        'gambling',
        'text-content',
        'face-attributes'
      ]
    };

    this.enabled = !!(this.config.apiUser && this.config.apiSecret);

    if (this.enabled) {
      console.log('👁️ Sightengine service initialized');
    } else {
      console.log('⚠️ Sightengine not configured - will use Hugging Face only');
    }
  }

  /**
   * Check if Sightengine is available
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Moderate an image using Sightengine API
   */
  async moderateImage(imageUrl: string): Promise<SightengineResult | null> {
    if (!this.enabled) {
      console.log('⚠️ Sightengine not enabled, skipping');
      return null;
    }

    try {
      const params = new URLSearchParams({
        url: imageUrl,
        models: this.config.models.join(','),
        api_user: this.config.apiUser,
        api_secret: this.config.apiSecret
      });

      const response = await fetch(`${this.config.baseUrl}/check.json?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Sightengine API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'failure') {
        throw new Error(`Sightengine error: ${result.error?.message || 'Unknown error'}`);
      }

      console.log(`👁️ Sightengine moderation complete: nudity=${result.nudity?.raw || 0}`);

      return result as SightengineResult;

    } catch (error) {
      console.error('❌ Sightengine moderation failed:', error);
      return null;
    }
  }

  /**
   * Moderate image from binary data
   */
  async moderateImageData(imageData: Buffer, filename: string = 'image.jpg'): Promise<SightengineResult | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const formData = new FormData();
      const blob = new Blob([imageData], { type: 'image/jpeg' });
      formData.append('media', blob, filename);
      formData.append('models', this.config.models.join(','));
      formData.append('api_user', this.config.apiUser);
      formData.append('api_secret', this.config.apiSecret);

      const response = await fetch(`${this.config.baseUrl}/check.json`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Sightengine API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === 'failure') {
        throw new Error(`Sightengine error: ${result.error?.message || 'Unknown error'}`);
      }

      return result as SightengineResult;

    } catch (error) {
      console.error('❌ Sightengine image data moderation failed:', error);
      return null;
    }
  }

  /**
   * Moderate video (processes key frames)
   */
  async moderateVideo(videoUrl: string): Promise<{ frames: SightengineResult[]; summary: any } | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        url: videoUrl,
        models: this.config.models.join(','),
        api_user: this.config.apiUser,
        api_secret: this.config.apiSecret,
        callback_url: process.env.SIGHTENGINE_WEBHOOK_URL || ''
      });

      const response = await fetch(`${this.config.baseUrl}/video/check.json?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Sightengine video API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        frames: result.data?.frames || [],
        summary: {
          maxNudity: result.data?.summary?.nudity?.max || 0,
          maxWeapon: result.data?.summary?.weapon?.max || 0,
          maxGore: result.data?.summary?.gore?.max || 0,
          duration: result.data?.duration || 0,
          framesAnalyzed: result.data?.frames?.length || 0
        }
      };

    } catch (error) {
      console.error('❌ Sightengine video moderation failed:', error);
      return null;
    }
  }

  /**
   * Moderate text content
   */
  async moderateText(text: string, language: string = 'en'): Promise<{
    profanity: string[];
    personal: boolean;
    link: boolean;
    spam: number;
    sexual: number;
    discriminatory: number;
    insult: number;
    violence: number;
    self_harm: number;
  } | null> {
    if (!this.enabled) {
      return null;
    }

    try {
      const params = new URLSearchParams({
        text: text,
        lang: language,
        mode: 'ml',
        api_user: this.config.apiUser,
        api_secret: this.config.apiSecret
      });

      const response = await fetch(`${this.config.baseUrl}/text/check.json?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Sightengine text API error: ${response.status}`);
      }

      const result = await response.json();

      return {
        profanity: result.profanity?.matches || [],
        personal: result.personal?.detected || false,
        link: result.link?.detected || false,
        spam: result.spam?.prob || 0,
        sexual: result.sexual?.prob || 0,
        discriminatory: result.discriminatory?.prob || 0,
        insult: result.insult?.prob || 0,
        violence: result.violence?.prob || 0,
        self_harm: result.self_harm?.prob || 0
      };

    } catch (error) {
      console.error('❌ Sightengine text moderation failed:', error);
      return null;
    }
  }

  /**
   * Check for underage content (CRITICAL)
   */
  async checkForMinors(imageUrl: string): Promise<{
    hasMinor: boolean;
    confidence: number;
    faces: Array<{ age: number; confidence: number }>;
  }> {
    if (!this.enabled) {
      return { hasMinor: false, confidence: 0, faces: [] };
    }

    try {
      const params = new URLSearchParams({
        url: imageUrl,
        models: 'face-attributes',
        api_user: this.config.apiUser,
        api_secret: this.config.apiSecret
      });

      const response = await fetch(`${this.config.baseUrl}/check.json?${params.toString()}`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Sightengine API error: ${response.status}`);
      }

      const result = await response.json();

      const faces = (result.faces?.faces || []).map((face: any) => ({
        age: face.age || 25,
        confidence: 0.9
      }));

      const hasMinor = faces.some((face: any) => face.age < 18);

      return {
        hasMinor,
        confidence: faces.length > 0 ? 0.9 : 0,
        faces
      };

    } catch (error) {
      console.error('❌ Sightengine minor check failed:', error);
      // Fail-safe: assume potential minor
      return { hasMinor: true, confidence: 0.5, faces: [] };
    }
  }

  /**
   * Analyze nudity details for content classification
   */
  analyzeNudityLevel(nudity: SightengineResult['nudity']): {
    level: 'safe' | 'suggestive' | 'nsfw' | 'explicit';
    requiresAgeGate: boolean;
    requiresBlur: boolean;
    details: string[];
  } {
    const details: string[] = [];

    // Check explicit content
    if (nudity.raw > 0.7 || nudity.sexual_activity > 0.5 || nudity.sexual_display > 0.5) {
      if (nudity.sexual_activity > 0.5) details.push('sexual_activity');
      if (nudity.sexual_display > 0.5) details.push('sexual_display');
      if (nudity.raw > 0.7) details.push('full_nudity');

      return {
        level: 'explicit',
        requiresAgeGate: true,
        requiresBlur: true,
        details
      };
    }

    // Check NSFW content
    if (nudity.raw > 0.4 || nudity.partial > 0.6 || nudity.erotica > 0.5) {
      if (nudity.partial > 0.6) details.push('partial_nudity');
      if (nudity.erotica > 0.5) details.push('erotica');

      return {
        level: 'nsfw',
        requiresAgeGate: true,
        requiresBlur: nudity.raw > 0.5,
        details
      };
    }

    // Check suggestive content
    if (nudity.suggestive > 0.5) {
      const suggestive = nudity.suggestive_classes;
      if (suggestive.bikini > 0.5) details.push('bikini');
      if (suggestive.lingerie > 0.5) details.push('lingerie');
      if (suggestive.cleavage > 0.5) details.push('cleavage');

      return {
        level: 'suggestive',
        requiresAgeGate: nudity.suggestive > 0.7,
        requiresBlur: false,
        details
      };
    }

    return {
      level: 'safe',
      requiresAgeGate: false,
      requiresBlur: false,
      details: ['safe_content']
    };
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled) {
      return { healthy: false, message: 'Sightengine not configured' };
    }

    try {
      // Test with a simple API call
      const params = new URLSearchParams({
        api_user: this.config.apiUser,
        api_secret: this.config.apiSecret
      });

      const response = await fetch(`${this.config.baseUrl}/account.json?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        return {
          healthy: true,
          message: `Sightengine operational - Credits: ${data.balance?.credits || 'unknown'}`
        };
      }

      return { healthy: false, message: `API returned ${response.status}` };

    } catch (error) {
      return { healthy: false, message: `Health check failed: ${error}` };
    }
  }
}

// Export singleton
export const sightengineService = new SightengineService();

// Export class for testing
export { SightengineService };
