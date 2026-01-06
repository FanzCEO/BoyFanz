/**
 * Bunny CDN Service - Media Storage, Delivery & Streaming
 * Handles all media uploads, CDN delivery, and video streaming via Bunny.net
 */

import { logger } from '../logger';

interface BunnyConfig {
  apiKey: string;
  storageZoneName: string;
  storageZonePassword: string;
  pullZoneUrl: string;
  streamLibraryId?: string;
  streamApiKey?: string;
}

interface UploadResult {
  success: boolean;
  url: string;
  cdnUrl: string;
  fileId: string;
  size: number;
  checksum?: string;
}

interface VideoUploadResult {
  success: boolean;
  videoId: string;
  guid: string;
  thumbnailUrl: string;
  hlsUrl: string;
  status: string;
}

interface PurgeResult {
  success: boolean;
  itemsPurged: number;
}

class BunnyCdnService {
  private config: BunnyConfig | null = null;
  private isInitialized: boolean = false;
  private storageBaseUrl: string = '';
  private streamBaseUrl: string = 'https://video.bunnycdn.com';

  constructor() {
    this.initialize();
  }

  /**
   * Initialize Bunny CDN with environment variables
   */
  initialize(): boolean {
    const apiKey = process.env.BUNNY_API_KEY;
    const storageZoneName = process.env.BUNNY_STORAGE_ZONE_NAME;
    const storageZonePassword = process.env.BUNNY_STORAGE_ZONE_PASSWORD;
    const pullZoneUrl = process.env.BUNNY_PULL_ZONE_URL;
    const streamLibraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
    const streamApiKey = process.env.BUNNY_STREAM_API_KEY;

    if (!apiKey || !storageZoneName || !storageZonePassword || !pullZoneUrl) {
      logger.warn('Bunny CDN not fully configured - missing environment variables');
      logger.info('Required: BUNNY_API_KEY, BUNNY_STORAGE_ZONE_NAME, BUNNY_STORAGE_ZONE_PASSWORD, BUNNY_PULL_ZONE_URL');
      return false;
    }

    this.config = {
      apiKey,
      storageZoneName,
      storageZonePassword,
      pullZoneUrl,
      streamLibraryId,
      streamApiKey,
    };

    // Storage API base URL (region-specific)
    this.storageBaseUrl = `https://storage.bunnycdn.com/${storageZoneName}`;

    this.isInitialized = true;
    logger.info(`Bunny CDN initialized - Storage Zone: ${storageZoneName}, Pull Zone: ${pullZoneUrl}`);

    return true;
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.config !== null;
  }

  /**
   * Get authorization headers for Storage API
   */
  private getStorageHeaders(): Record<string, string> {
    if (!this.config) throw new Error('Bunny CDN not initialized');
    return {
      'AccessKey': this.config.storageZonePassword,
      'Content-Type': 'application/octet-stream',
    };
  }

  /**
   * Get authorization headers for main API
   */
  private getApiHeaders(): Record<string, string> {
    if (!this.config) throw new Error('Bunny CDN not initialized');
    return {
      'AccessKey': this.config.apiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get authorization headers for Stream API
   */
  private getStreamHeaders(): Record<string, string> {
    if (!this.config?.streamApiKey) throw new Error('Bunny Stream not configured');
    return {
      'AccessKey': this.config.streamApiKey,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Upload a file to Bunny Storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    filePath: string,
    contentType?: string
  ): Promise<UploadResult> {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }

    try {
      const uploadUrl = `${this.storageBaseUrl}/${filePath}`;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          ...this.getStorageHeaders(),
          ...(contentType && { 'Content-Type': contentType }),
        },
        body: fileBuffer,
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${error}`);
      }

      const cdnUrl = `${this.config!.pullZoneUrl}/${filePath}`;

      logger.info(`File uploaded to Bunny CDN: ${filePath}`);

      return {
        success: true,
        url: uploadUrl,
        cdnUrl,
        fileId: filePath,
        size: fileBuffer.length,
      };
    } catch (error) {
      logger.error('Bunny CDN upload failed:', error);
      throw error;
    }
  }

  /**
   * Upload media with automatic path generation
   */
  async uploadMedia(
    fileBuffer: Buffer,
    fileName: string,
    userId: string,
    mediaType: 'image' | 'video' | 'audio' | 'document'
  ): Promise<UploadResult> {
    const timestamp = Date.now();
    const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${mediaType}s/${userId}/${timestamp}-${sanitizedFileName}`;

    const contentTypeMap: Record<string, string> = {
      image: 'image/jpeg',
      video: 'video/mp4',
      audio: 'audio/mpeg',
      document: 'application/pdf',
    };

    return this.uploadFile(fileBuffer, filePath, contentTypeMap[mediaType]);
  }

  /**
   * Delete a file from Bunny Storage
   */
  async deleteFile(filePath: string): Promise<boolean> {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }

    try {
      const deleteUrl = `${this.storageBaseUrl}/${filePath}`;

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: this.getStorageHeaders(),
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete failed: ${response.status}`);
      }

      logger.info(`File deleted from Bunny CDN: ${filePath}`);
      return true;
    } catch (error) {
      logger.error('Bunny CDN delete failed:', error);
      return false;
    }
  }

  /**
   * List files in a directory
   */
  async listFiles(directory: string): Promise<any[]> {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }

    try {
      const listUrl = `${this.storageBaseUrl}/${directory}/`;

      const response = await fetch(listUrl, {
        method: 'GET',
        headers: this.getStorageHeaders(),
      });

      if (!response.ok) {
        throw new Error(`List failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Bunny CDN list failed:', error);
      return [];
    }
  }

  /**
   * Purge CDN cache for a file or directory
   */
  async purgeCache(urlOrPath: string): Promise<PurgeResult> {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }

    try {
      const purgeUrl = 'https://api.bunny.net/purge';
      const fullUrl = urlOrPath.startsWith('http')
        ? urlOrPath
        : `${this.config!.pullZoneUrl}/${urlOrPath}`;

      const response = await fetch(`${purgeUrl}?url=${encodeURIComponent(fullUrl)}`, {
        method: 'POST',
        headers: this.getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Purge failed: ${response.status}`);
      }

      logger.info(`Cache purged for: ${fullUrl}`);
      return { success: true, itemsPurged: 1 };
    } catch (error) {
      logger.error('Bunny CDN purge failed:', error);
      return { success: false, itemsPurged: 0 };
    }
  }

  // ==================== BUNNY STREAM (Video) ====================

  /**
   * Upload video to Bunny Stream for HLS streaming
   */
  async uploadVideo(
    fileBuffer: Buffer,
    title: string,
    collectionId?: string
  ): Promise<VideoUploadResult> {
    if (!this.config?.streamLibraryId || !this.config?.streamApiKey) {
      throw new Error('Bunny Stream not configured');
    }

    try {
      // Step 1: Create video entry
      const createResponse = await fetch(
        `${this.streamBaseUrl}/library/${this.config.streamLibraryId}/videos`,
        {
          method: 'POST',
          headers: this.getStreamHeaders(),
          body: JSON.stringify({
            title,
            collectionId,
          }),
        }
      );

      if (!createResponse.ok) {
        throw new Error(`Create video failed: ${createResponse.status}`);
      }

      const videoData = await createResponse.json();
      const videoId = videoData.guid;

      // Step 2: Upload video file
      const uploadResponse = await fetch(
        `${this.streamBaseUrl}/library/${this.config.streamLibraryId}/videos/${videoId}`,
        {
          method: 'PUT',
          headers: {
            'AccessKey': this.config.streamApiKey,
            'Content-Type': 'application/octet-stream',
          },
          body: fileBuffer,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(`Upload video failed: ${uploadResponse.status}`);
      }

      const pullZone = process.env.BUNNY_STREAM_PULL_ZONE || 'vz-abc123';

      logger.info(`Video uploaded to Bunny Stream: ${videoId}`);

      return {
        success: true,
        videoId,
        guid: videoData.guid,
        thumbnailUrl: `https://${pullZone}.b-cdn.net/${videoId}/thumbnail.jpg`,
        hlsUrl: `https://${pullZone}.b-cdn.net/${videoId}/playlist.m3u8`,
        status: 'processing',
      };
    } catch (error) {
      logger.error('Bunny Stream upload failed:', error);
      throw error;
    }
  }

  /**
   * Get video status and details
   */
  async getVideo(videoId: string): Promise<any> {
    if (!this.config?.streamLibraryId || !this.config?.streamApiKey) {
      throw new Error('Bunny Stream not configured');
    }

    try {
      const response = await fetch(
        `${this.streamBaseUrl}/library/${this.config.streamLibraryId}/videos/${videoId}`,
        {
          method: 'GET',
          headers: this.getStreamHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Get video failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Bunny Stream get video failed:', error);
      throw error;
    }
  }

  /**
   * Delete video from Bunny Stream
   */
  async deleteVideo(videoId: string): Promise<boolean> {
    if (!this.config?.streamLibraryId || !this.config?.streamApiKey) {
      throw new Error('Bunny Stream not configured');
    }

    try {
      const response = await fetch(
        `${this.streamBaseUrl}/library/${this.config.streamLibraryId}/videos/${videoId}`,
        {
          method: 'DELETE',
          headers: this.getStreamHeaders(),
        }
      );

      if (!response.ok && response.status !== 404) {
        throw new Error(`Delete video failed: ${response.status}`);
      }

      logger.info(`Video deleted from Bunny Stream: ${videoId}`);
      return true;
    } catch (error) {
      logger.error('Bunny Stream delete failed:', error);
      return false;
    }
  }

  /**
   * Create a video collection (for organizing creator content)
   */
  async createCollection(name: string): Promise<string> {
    if (!this.config?.streamLibraryId || !this.config?.streamApiKey) {
      throw new Error('Bunny Stream not configured');
    }

    try {
      const response = await fetch(
        `${this.streamBaseUrl}/library/${this.config.streamLibraryId}/collections`,
        {
          method: 'POST',
          headers: this.getStreamHeaders(),
          body: JSON.stringify({ name }),
        }
      );

      if (!response.ok) {
        throw new Error(`Create collection failed: ${response.status}`);
      }

      const data = await response.json();
      logger.info(`Collection created: ${name} (${data.guid})`);
      return data.guid;
    } catch (error) {
      logger.error('Bunny Stream create collection failed:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Generate signed URL for private content (time-limited access)
   */
  generateSignedUrl(filePath: string, expiresInSeconds: number = 3600): string {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }

    const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const baseUrl = this.config!.pullZoneUrl;
    const tokenSecurityKey = process.env.BUNNY_TOKEN_KEY;

    if (!tokenSecurityKey) {
      // If no token key, return unsigned URL
      return `${baseUrl}/${filePath}`;
    }

    // Generate token using Bunny's token authentication
    const crypto = require('crypto');
    const hashableBase = tokenSecurityKey + filePath + expirationTime;
    const token = crypto.createHash('sha256').update(hashableBase).digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    return `${baseUrl}/${filePath}?token=${token}&expires=${expirationTime}`;
  }

  /**
   * Get CDN URL for a file
   */
  getCdnUrl(filePath: string): string {
    if (!this.isReady()) {
      throw new Error('Bunny CDN not initialized');
    }
    return `${this.config!.pullZoneUrl}/${filePath}`;
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<any> {
    if (!this.isReady()) {
      return { error: 'Not initialized' };
    }

    try {
      const response = await fetch('https://api.bunny.net/storagezone', {
        method: 'GET',
        headers: this.getApiHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Get stats failed: ${response.status}`);
      }

      const zones = await response.json();
      const ourZone = zones.find((z: any) => z.Name === this.config!.storageZoneName);

      return ourZone || { error: 'Zone not found' };
    } catch (error) {
      logger.error('Bunny CDN get stats failed:', error);
      return { error: 'Failed to get stats' };
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    initialized: boolean;
    storageZone: string | null;
    pullZone: string | null;
    streamEnabled: boolean;
  } {
    return {
      initialized: this.isInitialized,
      storageZone: this.config?.storageZoneName || null,
      pullZone: this.config?.pullZoneUrl || null,
      streamEnabled: !!(this.config?.streamLibraryId && this.config?.streamApiKey),
    };
  }
}

// Export singleton instance
export const bunnyCdnService = new BunnyCdnService();

// Export class for testing
export { BunnyCdnService };
