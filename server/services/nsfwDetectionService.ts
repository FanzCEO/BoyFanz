/**
 * Fanz NSFW Detection Service Client
 * Connects to self-hosted NSFW detection microservice
 */

interface NSFWDetectionResult {
  is_nsfw: boolean;
  confidence: number;
  safe_for_work: boolean;
  classifications: {
    label: string;
    confidence: number;
    is_nsfw: boolean;
  }[];
  weighted_score: number;
  processing_time_ms: number;
}

interface NSFWClientOptions {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

class NSFWDetectionService {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(options: NSFWClientOptions = {}) {
    this.baseUrl = options.baseUrl || process.env.NSFW_SERVICE_URL || 'http://localhost:8100';
    this.apiKey = options.apiKey || process.env.NSFW_API_KEY || '';
    this.timeout = options.timeout || 30000; // 30 second timeout
  }

  /**
   * Check if the NSFW detection service is healthy
   */
  async health(): Promise<{ status: string; model_loaded: boolean; version: string }> {
    const response = await fetch(`${this.baseUrl}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.json();
  }

  /**
   * Detect NSFW content from a buffer (file bytes)
   */
  async detectBuffer(buffer: Buffer, filename: string = 'image.jpg'): Promise<NSFWDetectionResult> {
    const formData = new FormData();
    const blob = new Blob([buffer], { type: this.getMimeType(filename) });
    formData.append('file', blob, filename);

    const response = await fetch(`${this.baseUrl}/detect`, {
      method: 'POST',
      headers: {
        'X-API-Key': this.apiKey,
      },
      body: formData,
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Detection failed' }));
      throw new Error(error.detail || `NSFW detection failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Detect NSFW content from base64 encoded image
   */
  async detectBase64(base64Data: string, filename: string = 'image.jpg'): Promise<NSFWDetectionResult> {
    const response = await fetch(`${this.baseUrl}/detect/base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({
        image: base64Data,
        filename,
      }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Detection failed' }));
      throw new Error(error.detail || `NSFW detection failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Detect NSFW content from URL
   */
  async detectUrl(imageUrl: string): Promise<NSFWDetectionResult> {
    const response = await fetch(`${this.baseUrl}/detect/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey,
      },
      body: JSON.stringify({ url: imageUrl }),
      signal: AbortSignal.timeout(this.timeout),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Detection failed' }));
      throw new Error(error.detail || `NSFW detection failed: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Detect NSFW content from storage key (S3/object storage URL)
   */
  async detectStorageKey(storageKey: string, cdnBaseUrl?: string): Promise<NSFWDetectionResult> {
    // Build full URL from storage key
    const baseUrl = cdnBaseUrl || process.env.CDN_BASE_URL || process.env.BUNNY_CDN_URL || '';
    const fullUrl = storageKey.startsWith('http') ? storageKey : `${baseUrl}/${storageKey}`;

    return this.detectUrl(fullUrl);
  }

  /**
   * Convert NSFW detection result to moderation format
   * Maps our service output to the existing AI moderation interface
   */
  toModerationFormat(result: NSFWDetectionResult): { score: number; labels: string[] } {
    const labels: string[] = [];

    // Extract labels from classifications
    for (const classification of result.classifications) {
      if (classification.confidence > 0.3) {
        labels.push(classification.label.toLowerCase().replace(/_/g, '_'));
      }

      // Add specific NSFW labels for high-confidence detections
      if (classification.is_nsfw && classification.confidence > 0.5) {
        labels.push(`nsfw_${classification.label.toLowerCase()}`);
      }
    }

    // Add general nsfw label if detected
    if (result.is_nsfw) {
      labels.push('nsfw_detected');
    }

    return {
      score: result.weighted_score, // 0-1 scale
      labels: [...new Set(labels)], // Deduplicate labels
    };
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'bmp': 'image/bmp',
    };
    return mimeTypes[ext || ''] || 'application/octet-stream';
  }
}

// Export singleton instance
export const nsfwDetectionService = new NSFWDetectionService();

// Export class for custom configuration
export { NSFWDetectionService, NSFWDetectionResult, NSFWClientOptions };
