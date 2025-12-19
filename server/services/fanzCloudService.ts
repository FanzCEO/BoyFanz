/**
 * FanzCloud Service
 *
 * Cloud storage service for FANZ platforms powered by pCloud.
 * Provides secure file storage, sharing, streaming, and backup capabilities
 * for creators and their content.
 *
 * Features:
 * - File upload/download with progress tracking
 * - Folder management
 * - Public and private link sharing
 * - Video/audio streaming
 * - Thumbnail generation
 * - File versioning and revision history
 * - Trash management and recovery
 * - Upload links for fan submissions
 * - Encrypted storage for sensitive content
 */

import crypto from 'crypto';
import { EventEmitter } from 'events';

// ===== TYPES & INTERFACES =====

interface FanzCloudConfig {
  accessToken?: string;
  authToken?: string;
  apiEndpoint: string;
  locationId: number; // 1 for US, 2 for EU
  encryptionEnabled: boolean;
  encryptionKey?: string;
}

interface CloudFile {
  fileid: number;
  name: string;
  path: string;
  size: number;
  hash: string;
  contenttype: string;
  created: Date;
  modified: Date;
  isshared: boolean;
  isfolder: boolean;
  parentfolderid: number;
  thumb?: boolean;
  icon?: string;
  category?: number;
}

interface CloudFolder {
  folderid: number;
  name: string;
  path: string;
  created: Date;
  modified: Date;
  isshared: boolean;
  ismine: boolean;
  parentfolderid: number;
  contents?: (CloudFile | CloudFolder)[];
}

interface UploadProgress {
  uploadId: string;
  filename: string;
  bytesUploaded: number;
  totalBytes: number;
  percentage: number;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'failed';
  error?: string;
}

interface PublicLink {
  linkid: number;
  code: string;
  shortcode?: string;
  link: string;
  downloadlink?: string;
  shortlink?: string;
  created: Date;
  modified: Date;
  downloads: number;
  traffic: number;
  expire?: Date;
  maxdownloads?: number;
  maxtraffic?: number;
  haspassword: boolean;
}

interface UploadLink {
  uploadlinkid: number;
  code: string;
  link: string;
  created: Date;
  modified: Date;
  uploads: number;
  space: number;
  maxspace?: number;
  maxfiles?: number;
  comment?: string;
}

interface ShareInfo {
  shareid: number;
  folderid: number;
  sharename: string;
  created: Date;
  permissions: {
    canread: boolean;
    canwrite: boolean;
    candelete: boolean;
    canmanage: boolean;
  };
  mail: string;
  status: 'accepted' | 'pending' | 'declined';
}

interface StreamingLink {
  path: string;
  hosts: string[];
  expires: number;
}

interface Thumbnail {
  width: number;
  height: number;
  path: string;
  expires: number;
}

interface FileRevision {
  revisionid: number;
  hash: string;
  size: number;
  created: Date;
}

interface StorageQuota {
  quota: number;
  usedquota: number;
  availablequota: number;
  premium: boolean;
  premiumexpires?: Date;
}

interface FanzCloudOperationResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
  metadata?: {
    responseTime?: number;
    requestId?: string;
  };
}

// ===== SERVICE CLASS =====

export class FanzCloudService extends EventEmitter {
  private config: FanzCloudConfig;
  private isInitialized: boolean = false;
  private uploadProgress: Map<string, UploadProgress> = new Map();
  private cachedQuota?: StorageQuota;
  private quotaCacheTime?: number;

  constructor() {
    super();
    this.config = {
      apiEndpoint: process.env.FANZCLOUD_API_ENDPOINT || 'https://api.pcloud.com',
      locationId: parseInt(process.env.FANZCLOUD_LOCATION || '1'), // 1 = US, 2 = EU
      encryptionEnabled: process.env.FANZCLOUD_ENCRYPTION === 'true',
      accessToken: process.env.FANZCLOUD_ACCESS_TOKEN,
      authToken: process.env.FANZCLOUD_AUTH_TOKEN,
    };

    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('☁️  Initializing FanzCloud Service...');

    if (!this.config.accessToken && !this.config.authToken) {
      console.warn('⚠️  FanzCloud not configured (missing access token). Set FANZCLOUD_ACCESS_TOKEN or FANZCLOUD_AUTH_TOKEN.');
      return;
    }

    try {
      // Verify connection and get quota info
      const quota = await this.getQuota();
      if (quota.success) {
        this.isInitialized = true;
        console.log('✅ FanzCloud Service initialized successfully');
        console.log(`   📊 Storage: ${this.formatBytes(quota.data.usedquota)} / ${this.formatBytes(quota.data.quota)} used`);
        console.log(`   💾 Available: ${this.formatBytes(quota.data.availablequota)}`);
        if (quota.data.premium) {
          console.log(`   ⭐ Premium account (expires: ${quota.data.premiumexpires})`);
        }
      }
    } catch (error) {
      console.error('❌ FanzCloud initialization failed:', error);
    }
  }

  // ===== API REQUEST HELPER =====

  private async apiRequest(
    method: string,
    params: Record<string, any> = {},
    options: { timeout?: number; isUpload?: boolean } = {}
  ): Promise<any> {
    const url = new URL(`${this.config.apiEndpoint}/${method}`);

    // Add auth token
    if (this.config.accessToken) {
      params.access_token = this.config.accessToken;
    } else if (this.config.authToken) {
      params.auth = this.config.authToken;
    }

    // Build query string for non-upload requests
    if (!options.isUpload) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), options.timeout || 30000);

    try {
      const response = await fetch(url.toString(), {
        method: options.isUpload ? 'POST' : 'GET',
        signal: controller.signal,
        body: options.isUpload ? JSON.stringify(params) : undefined,
        headers: options.isUpload ? { 'Content-Type': 'application/json' } : undefined,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (data.result !== 0) {
        throw new Error(data.error || `pCloud API error: ${data.result}`);
      }

      return {
        success: true,
        data,
        metadata: {
          responseTime: Date.now() - startTime,
          requestId: response.headers.get('x-request-id'),
        },
      };
    } catch (error: any) {
      clearTimeout(timeout);
      throw error;
    }
  }

  // ===== AUTHENTICATION =====

  async authenticate(email: string, password: string): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('userinfo', {
        getauth: 1,
        logout: 1,
        username: email,
        password: password,
      });

      if (result.data.auth) {
        this.config.authToken = result.data.auth;
        this.isInitialized = true;
        return {
          success: true,
          message: 'Authentication successful',
          data: {
            authToken: result.data.auth,
            userId: result.data.userid,
            email: result.data.email,
            premium: result.data.premium,
          },
        };
      }

      return {
        success: false,
        message: 'Authentication failed',
        error: 'Invalid credentials',
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Authentication failed',
        error: error.message,
      };
    }
  }

  async getOAuthUrl(clientId: string, redirectUri: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
    });
    return `https://my.pcloud.com/oauth2/authorize?${params.toString()}`;
  }

  async exchangeOAuthCode(
    clientId: string,
    clientSecret: string,
    code: string
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('oauth2_token', {
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
      });

      if (result.data.access_token) {
        this.config.accessToken = result.data.access_token;
        this.isInitialized = true;
        return {
          success: true,
          message: 'OAuth token obtained',
          data: {
            accessToken: result.data.access_token,
            userId: result.data.userid,
            locationId: result.data.locationid,
          },
        };
      }

      return {
        success: false,
        message: 'OAuth exchange failed',
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'OAuth exchange failed',
        error: error.message,
      };
    }
  }

  // ===== STORAGE QUOTA =====

  async getQuota(forceRefresh: boolean = false): Promise<FanzCloudOperationResult> {
    // Return cached quota if available and not expired (5 min cache)
    if (!forceRefresh && this.cachedQuota && this.quotaCacheTime &&
        Date.now() - this.quotaCacheTime < 300000) {
      return {
        success: true,
        message: 'Quota retrieved from cache',
        data: this.cachedQuota,
      };
    }

    try {
      const result = await this.apiRequest('userinfo');

      this.cachedQuota = {
        quota: result.data.quota,
        usedquota: result.data.usedquota,
        availablequota: result.data.quota - result.data.usedquota,
        premium: result.data.premium,
        premiumexpires: result.data.premiumexpires
          ? new Date(result.data.premiumexpires * 1000)
          : undefined,
      };
      this.quotaCacheTime = Date.now();

      return {
        success: true,
        message: 'Quota retrieved successfully',
        data: this.cachedQuota,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get quota',
        error: error.message,
      };
    }
  }

  // ===== FOLDER OPERATIONS =====

  async createFolder(
    path: string,
    options: { ifNotExists?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const method = options.ifNotExists ? 'createfolderifnotexists' : 'createfolder';
      const result = await this.apiRequest(method, { path });

      return {
        success: true,
        message: 'Folder created successfully',
        data: {
          folderid: result.data.metadata.folderid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
          created: new Date(result.data.metadata.created),
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create folder',
        error: error.message,
      };
    }
  }

  async listFolder(
    path: string = '/',
    options: { recursive?: boolean; showDeleted?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('listfolder', {
        path,
        recursive: options.recursive ? 1 : 0,
        showdeleted: options.showDeleted ? 1 : 0,
        nofiles: 0,
      });

      const contents = this.parseContents(result.data.metadata);

      return {
        success: true,
        message: 'Folder listed successfully',
        data: contents,
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list folder',
        error: error.message,
      };
    }
  }

  async renameFolder(path: string, newName: string): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('renamefolder', {
        path,
        toname: newName,
      });

      return {
        success: true,
        message: 'Folder renamed successfully',
        data: {
          folderid: result.data.metadata.folderid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to rename folder',
        error: error.message,
      };
    }
  }

  async deleteFolder(
    path: string,
    options: { recursive?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const method = options.recursive ? 'deletefolderrecursive' : 'deletefolder';
      const result = await this.apiRequest(method, { path });

      return {
        success: true,
        message: 'Folder deleted successfully',
        data: { deletedfolderid: result.data.deletedfolderid },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete folder',
        error: error.message,
      };
    }
  }

  async copyFolder(
    path: string,
    toPath: string,
    options: { overwrite?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('copyfolder', {
        path,
        topath: toPath,
        noover: options.overwrite ? 0 : 1,
      });

      return {
        success: true,
        message: 'Folder copied successfully',
        data: {
          folderid: result.data.metadata.folderid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to copy folder',
        error: error.message,
      };
    }
  }

  // ===== FILE OPERATIONS =====

  async uploadFile(
    file: Buffer | NodeJS.ReadableStream,
    path: string,
    filename: string,
    options: {
      progressCallback?: (progress: UploadProgress) => void;
      noPartial?: boolean;
      renameIfExists?: boolean;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    const uploadId = crypto.randomUUID();

    try {
      // Get upload URL
      const uploadUrlResult = await this.apiRequest('uploadfile', {
        path,
        filename,
        nopartial: options.noPartial ? 1 : 0,
        renameifexists: options.renameIfExists ? 1 : 0,
      });

      // Initialize progress tracking
      const fileBuffer = Buffer.isBuffer(file) ? file : await this.streamToBuffer(file);
      const progress: UploadProgress = {
        uploadId,
        filename,
        bytesUploaded: 0,
        totalBytes: fileBuffer.length,
        percentage: 0,
        status: 'uploading',
      };
      this.uploadProgress.set(uploadId, progress);

      // Perform upload
      const formData = new FormData();
      const blob = new Blob([fileBuffer]);
      formData.append('file', blob, filename);

      const uploadHost = uploadUrlResult.data.hosts[0];
      const uploadPath = uploadUrlResult.data.path;

      const response = await fetch(`https://${uploadHost}${uploadPath}`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.result !== 0) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update progress to complete
      progress.status = 'complete';
      progress.percentage = 100;
      progress.bytesUploaded = fileBuffer.length;
      this.emit('upload:complete', progress);

      return {
        success: true,
        message: 'File uploaded successfully',
        data: {
          fileid: result.metadata[0].fileid,
          name: result.metadata[0].name,
          path: result.metadata[0].path,
          size: result.metadata[0].size,
          hash: result.metadata[0].hash,
          contenttype: result.metadata[0].contenttype,
        },
        metadata: { responseTime: result.metadata[0].created },
      };
    } catch (error: any) {
      const progress = this.uploadProgress.get(uploadId);
      if (progress) {
        progress.status = 'failed';
        progress.error = error.message;
      }
      this.emit('upload:error', { uploadId, error: error.message });

      return {
        success: false,
        message: 'Upload failed',
        error: error.message,
      };
    }
  }

  async downloadFile(
    fileId: number | string,
    options: { forceDownload?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = { forcedownload: options.forceDownload ? 1 : 0 };

      if (typeof fileId === 'number') {
        params.fileid = fileId;
      } else {
        params.path = fileId;
      }

      const result = await this.apiRequest('getfilelink', params);

      const downloadUrl = `https://${result.data.hosts[0]}${result.data.path}`;

      return {
        success: true,
        message: 'Download link generated',
        data: {
          url: downloadUrl,
          expires: new Date(result.data.expires * 1000),
          size: result.data.size,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get download link',
        error: error.message,
      };
    }
  }

  async copyFile(
    path: string,
    toPath: string,
    options: { overwrite?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('copyfile', {
        path,
        topath: toPath,
        noover: options.overwrite ? 0 : 1,
      });

      return {
        success: true,
        message: 'File copied successfully',
        data: {
          fileid: result.data.metadata.fileid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to copy file',
        error: error.message,
      };
    }
  }

  async renameFile(path: string, newName: string): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('renamefile', {
        path,
        toname: newName,
      });

      return {
        success: true,
        message: 'File renamed successfully',
        data: {
          fileid: result.data.metadata.fileid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to rename file',
        error: error.message,
      };
    }
  }

  async deleteFile(fileId: number | string): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      const result = await this.apiRequest('deletefile', params);

      return {
        success: true,
        message: 'File deleted successfully',
        data: { deletedfileid: result.data.metadata.fileid },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete file',
        error: error.message,
      };
    }
  }

  async getFileInfo(fileId: number | string): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      const result = await this.apiRequest('stat', params);

      return {
        success: true,
        message: 'File info retrieved',
        data: {
          fileid: result.data.metadata.fileid,
          name: result.data.metadata.name,
          path: result.data.metadata.path,
          size: result.data.metadata.size,
          hash: result.data.metadata.hash,
          contenttype: result.data.metadata.contenttype,
          created: new Date(result.data.metadata.created),
          modified: new Date(result.data.metadata.modified),
          isshared: result.data.metadata.isshared,
          thumb: result.data.metadata.thumb,
          category: result.data.metadata.category,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get file info',
        error: error.message,
      };
    }
  }

  async getFileChecksum(fileId: number | string): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      const result = await this.apiRequest('checksumfile', params);

      return {
        success: true,
        message: 'Checksum calculated',
        data: {
          sha256: result.data.sha256,
          sha1: result.data.sha1,
          md5: result.data.md5,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to calculate checksum',
        error: error.message,
      };
    }
  }

  // ===== PUBLIC LINKS (SHARING) =====

  async createPublicLink(
    fileId: number | string,
    options: {
      maxDownloads?: number;
      maxTraffic?: number;
      expireDate?: Date;
      password?: string;
      shortLink?: boolean;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      if (options.maxDownloads) params.maxdownloads = options.maxDownloads;
      if (options.maxTraffic) params.maxtraffic = options.maxTraffic;
      if (options.expireDate) params.expire = Math.floor(options.expireDate.getTime() / 1000);
      if (options.password) params.password = options.password;
      if (options.shortLink) params.shortlink = 1;

      const result = await this.apiRequest('getfilepublink', params);

      return {
        success: true,
        message: 'Public link created',
        data: {
          linkid: result.data.linkid,
          code: result.data.code,
          link: result.data.link,
          downloadlink: result.data.downloadlink,
          shortlink: result.data.shortlink,
          shortcode: result.data.shortcode,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create public link',
        error: error.message,
      };
    }
  }

  async createFolderPublicLink(
    folderId: number | string,
    options: {
      expireDate?: Date;
      password?: string;
      shortLink?: boolean;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof folderId === 'number'
        ? { folderid: folderId }
        : { path: folderId };

      if (options.expireDate) params.expire = Math.floor(options.expireDate.getTime() / 1000);
      if (options.password) params.password = options.password;
      if (options.shortLink) params.shortlink = 1;

      const result = await this.apiRequest('getfolderpublink', params);

      return {
        success: true,
        message: 'Folder public link created',
        data: {
          linkid: result.data.linkid,
          code: result.data.code,
          link: result.data.link,
          shortlink: result.data.shortlink,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create folder public link',
        error: error.message,
      };
    }
  }

  async listPublicLinks(): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('listpublinks');

      const links = result.data.publinks.map((link: any) => ({
        linkid: link.linkid,
        code: link.code,
        link: link.link,
        created: new Date(link.created),
        modified: new Date(link.modified),
        downloads: link.downloads,
        traffic: link.traffic,
        haspassword: link.haspassword,
        expire: link.expire ? new Date(link.expire * 1000) : undefined,
        maxdownloads: link.maxdownloads,
        maxtraffic: link.maxtraffic,
      }));

      return {
        success: true,
        message: 'Public links listed',
        data: { links, total: links.length },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list public links',
        error: error.message,
      };
    }
  }

  async deletePublicLink(linkId: number): Promise<FanzCloudOperationResult> {
    try {
      await this.apiRequest('deletepublink', { linkid: linkId });

      return {
        success: true,
        message: 'Public link deleted',
        data: { deletedLinkId: linkId },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete public link',
        error: error.message,
      };
    }
  }

  // ===== UPLOAD LINKS (FOR FAN SUBMISSIONS) =====

  async createUploadLink(
    folderId: number | string,
    options: {
      comment?: string;
      maxFiles?: number;
      maxSpace?: number;
      expire?: Date;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof folderId === 'number'
        ? { folderid: folderId }
        : { path: folderId };

      if (options.comment) params.comment = options.comment;
      if (options.maxFiles) params.maxfiles = options.maxFiles;
      if (options.maxSpace) params.maxspace = options.maxSpace;
      if (options.expire) params.expire = Math.floor(options.expire.getTime() / 1000);

      const result = await this.apiRequest('createuploadlink', params);

      return {
        success: true,
        message: 'Upload link created',
        data: {
          uploadlinkid: result.data.uploadlinkid,
          code: result.data.code,
          link: result.data.link,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create upload link',
        error: error.message,
      };
    }
  }

  async listUploadLinks(): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('listuploadlinks');

      const links = result.data.uploadlinks.map((link: any) => ({
        uploadlinkid: link.uploadlinkid,
        code: link.code,
        link: link.link,
        created: new Date(link.created),
        modified: new Date(link.modified),
        uploads: link.uploads,
        space: link.space,
        comment: link.comment,
        maxspace: link.maxspace,
        maxfiles: link.maxfiles,
      }));

      return {
        success: true,
        message: 'Upload links listed',
        data: { links, total: links.length },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list upload links',
        error: error.message,
      };
    }
  }

  async deleteUploadLink(uploadLinkId: number): Promise<FanzCloudOperationResult> {
    try {
      await this.apiRequest('deleteuploadlink', { uploadlinkid: uploadLinkId });

      return {
        success: true,
        message: 'Upload link deleted',
        data: { deletedUploadLinkId: uploadLinkId },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to delete upload link',
        error: error.message,
      };
    }
  }

  // ===== STREAMING (VIDEO/AUDIO) =====

  async getVideoStreamLink(
    fileId: number | string,
    options: {
      abitrate?: number;
      vbitrate?: number;
      resolution?: string;
      fixedbitrate?: boolean;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      if (options.abitrate) params.abitrate = options.abitrate;
      if (options.vbitrate) params.vbitrate = options.vbitrate;
      if (options.resolution) params.resolution = options.resolution;
      if (options.fixedbitrate) params.fixedbitrate = 1;

      const result = await this.apiRequest('getvideolink', params);

      return {
        success: true,
        message: 'Video stream link generated',
        data: {
          url: `https://${result.data.hosts[0]}${result.data.path}`,
          expires: new Date(result.data.expires * 1000),
          duration: result.data.duration,
          videocodec: result.data.videocodec,
          audiocodec: result.data.audiocodec,
          width: result.data.width,
          height: result.data.height,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get video stream link',
        error: error.message,
      };
    }
  }

  async getAudioStreamLink(
    fileId: number | string,
    options: { abitrate?: number } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      if (options.abitrate) params.abitrate = options.abitrate;

      const result = await this.apiRequest('getaudiolink', params);

      return {
        success: true,
        message: 'Audio stream link generated',
        data: {
          url: `https://${result.data.hosts[0]}${result.data.path}`,
          expires: new Date(result.data.expires * 1000),
          duration: result.data.duration,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get audio stream link',
        error: error.message,
      };
    }
  }

  async getHLSLink(
    fileId: number | string,
    options: {
      abitrate?: number;
      vbitrate?: number;
      resolution?: string;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      if (options.abitrate) params.abitrate = options.abitrate;
      if (options.vbitrate) params.vbitrate = options.vbitrate;
      if (options.resolution) params.resolution = options.resolution;

      const result = await this.apiRequest('gethlslink', params);

      return {
        success: true,
        message: 'HLS stream link generated',
        data: {
          url: result.data.path,
          expires: new Date(result.data.expires * 1000),
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get HLS stream link',
        error: error.message,
      };
    }
  }

  // ===== THUMBNAILS =====

  async getThumbnail(
    fileId: number | string,
    options: { width?: number; height?: number; type?: string; crop?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const size = `${options.width || 256}x${options.height || 256}`;
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId, size }
        : { path: fileId, size };

      if (options.type) params.type = options.type;
      if (options.crop) params.crop = 1;

      const result = await this.apiRequest('getthumb', params);

      return {
        success: true,
        message: 'Thumbnail generated',
        data: {
          url: `https://${result.data.hosts[0]}${result.data.path}`,
          expires: new Date(result.data.expires * 1000),
          width: result.data.width,
          height: result.data.height,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to generate thumbnail',
        error: error.message,
      };
    }
  }

  async getThumbsLinks(
    fileIds: number[],
    options: { width?: number; height?: number; crop?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const size = `${options.width || 256}x${options.height || 256}`;
      const result = await this.apiRequest('getthumbslinks', {
        fileids: fileIds.join(','),
        size,
        crop: options.crop ? 1 : 0,
      });

      const thumbs = Object.entries(result.data.thumbs).map(([id, data]: [string, any]) => ({
        fileid: parseInt(id),
        url: `https://${data.hosts[0]}${data.path}`,
        expires: new Date(data.expires * 1000),
      }));

      return {
        success: true,
        message: 'Thumbnails generated',
        data: { thumbnails: thumbs },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to generate thumbnails',
        error: error.message,
      };
    }
  }

  // ===== FILE REVISIONS =====

  async listRevisions(fileId: number | string): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof fileId === 'number'
        ? { fileid: fileId }
        : { path: fileId };

      const result = await this.apiRequest('listrevisions', params);

      const revisions = result.data.revisions.map((rev: any) => ({
        revisionid: rev.revisionid,
        hash: rev.hash,
        size: rev.size,
        created: new Date(rev.created),
      }));

      return {
        success: true,
        message: 'Revisions listed',
        data: { revisions, total: revisions.length },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list revisions',
        error: error.message,
      };
    }
  }

  async revertToRevision(
    fileId: number,
    revisionId: number
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('revertrevision', {
        fileid: fileId,
        revisionid: revisionId,
      });

      return {
        success: true,
        message: 'File reverted successfully',
        data: {
          fileid: result.data.metadata.fileid,
          name: result.data.metadata.name,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to revert file',
        error: error.message,
      };
    }
  }

  // ===== TRASH MANAGEMENT =====

  async listTrash(): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('trash_list');

      return {
        success: true,
        message: 'Trash listed',
        data: this.parseContents(result.data.metadata),
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list trash',
        error: error.message,
      };
    }
  }

  async restoreFromTrash(
    fileId?: number,
    folderId?: number
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = {};
      if (fileId) params.fileid = fileId;
      if (folderId) params.folderid = folderId;

      const result = await this.apiRequest('trash_restore', params);

      return {
        success: true,
        message: 'Item restored from trash',
        data: result.data.metadata,
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to restore from trash',
        error: error.message,
      };
    }
  }

  async emptyTrash(): Promise<FanzCloudOperationResult> {
    try {
      await this.apiRequest('trash_clear');

      return {
        success: true,
        message: 'Trash emptied successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to empty trash',
        error: error.message,
      };
    }
  }

  // ===== ARCHIVING (ZIP) =====

  async createZip(
    fileIds: number[],
    filename: string,
    options: { toPath?: string } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('savezipasync', {
        fileids: fileIds.join(','),
        filename,
        topath: options.toPath || '/',
      });

      return {
        success: true,
        message: 'ZIP creation started',
        data: {
          progresshash: result.data.progresshash,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to create ZIP',
        error: error.message,
      };
    }
  }

  async checkZipProgress(progressHash: string): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('savezipprogress', {
        progresshash: progressHash,
      });

      return {
        success: true,
        message: 'ZIP progress retrieved',
        data: {
          status: result.data.status,
          finished: result.data.finished,
          files: result.data.files,
          totalfiles: result.data.totalfiles,
          bytes: result.data.bytes,
          totalbytes: result.data.totalbytes,
          fileid: result.data.fileid,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to check ZIP progress',
        error: error.message,
      };
    }
  }

  async extractZip(
    fileId: number,
    options: { toPath?: string; overwrite?: boolean } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('extractarchiveasync', {
        fileid: fileId,
        topath: options.toPath || '/',
        noover: options.overwrite ? 0 : 1,
      });

      return {
        success: true,
        message: 'ZIP extraction started',
        data: {
          progresshash: result.data.progresshash,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to extract ZIP',
        error: error.message,
      };
    }
  }

  // ===== FOLDER SHARING =====

  async shareFolder(
    folderId: number | string,
    email: string,
    options: {
      permissions?: {
        canRead?: boolean;
        canWrite?: boolean;
        canDelete?: boolean;
        canManage?: boolean;
      };
      message?: string;
    } = {}
  ): Promise<FanzCloudOperationResult> {
    try {
      const params: any = typeof folderId === 'number'
        ? { folderid: folderId, mail: email }
        : { path: folderId, mail: email };

      const perms = options.permissions || { canRead: true };
      params.permissions = 0;
      if (perms.canRead) params.permissions |= 1;
      if (perms.canWrite) params.permissions |= 2;
      if (perms.canDelete) params.permissions |= 4;
      if (perms.canManage) params.permissions |= 8;

      if (options.message) params.message = options.message;

      const result = await this.apiRequest('sharefolder', params);

      return {
        success: true,
        message: 'Folder shared successfully',
        data: {
          shareid: result.data.shareid,
        },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to share folder',
        error: error.message,
      };
    }
  }

  async listShares(): Promise<FanzCloudOperationResult> {
    try {
      const result = await this.apiRequest('listshares');

      const shares = (result.data.shares || []).map((share: any) => ({
        shareid: share.shareid,
        folderid: share.folderid,
        sharename: share.sharename,
        created: new Date(share.created),
        permissions: {
          canread: !!(share.permissions & 1),
          canwrite: !!(share.permissions & 2),
          candelete: !!(share.permissions & 4),
          canmanage: !!(share.permissions & 8),
        },
        mail: share.mail,
        status: share.accepted ? 'accepted' : share.declined ? 'declined' : 'pending',
      }));

      return {
        success: true,
        message: 'Shares listed',
        data: { shares, total: shares.length },
        metadata: result.metadata,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to list shares',
        error: error.message,
      };
    }
  }

  async removeShare(shareId: number): Promise<FanzCloudOperationResult> {
    try {
      await this.apiRequest('removeshare', { shareid: shareId });

      return {
        success: true,
        message: 'Share removed successfully',
        data: { removedShareId: shareId },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to remove share',
        error: error.message,
      };
    }
  }

  // ===== CREATOR-SPECIFIC METHODS =====

  async createCreatorVault(creatorId: string): Promise<FanzCloudOperationResult> {
    const vaultPath = `/creators/${creatorId}`;

    // Create folder structure for creator
    const folders = [
      `${vaultPath}`,
      `${vaultPath}/content`,
      `${vaultPath}/content/images`,
      `${vaultPath}/content/videos`,
      `${vaultPath}/content/audio`,
      `${vaultPath}/messages`,
      `${vaultPath}/ppv`,
      `${vaultPath}/drafts`,
      `${vaultPath}/analytics`,
      `${vaultPath}/backup`,
    ];

    const results = [];
    for (const folder of folders) {
      const result = await this.createFolder(folder, { ifNotExists: true });
      results.push({ folder, success: result.success });
    }

    return {
      success: results.every(r => r.success),
      message: 'Creator vault created',
      data: {
        vaultPath,
        folders: results,
      },
    };
  }

  async uploadCreatorContent(
    creatorId: string,
    file: Buffer,
    filename: string,
    contentType: 'images' | 'videos' | 'audio' | 'ppv'
  ): Promise<FanzCloudOperationResult> {
    const path = `/creators/${creatorId}/content/${contentType}`;
    return this.uploadFile(file, path, filename, { renameIfExists: true });
  }

  async getCreatorStorageStats(creatorId: string): Promise<FanzCloudOperationResult> {
    try {
      const vaultPath = `/creators/${creatorId}`;
      const result = await this.listFolder(vaultPath, { recursive: true });

      if (!result.success) {
        return result;
      }

      const stats = this.calculateFolderStats(result.data);

      return {
        success: true,
        message: 'Creator storage stats calculated',
        data: {
          totalSize: stats.totalSize,
          totalFiles: stats.totalFiles,
          totalFolders: stats.totalFolders,
          byType: stats.byType,
          formattedSize: this.formatBytes(stats.totalSize),
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to get creator storage stats',
        error: error.message,
      };
    }
  }

  async backupCreatorContent(creatorId: string): Promise<FanzCloudOperationResult> {
    try {
      const contentPath = `/creators/${creatorId}/content`;
      const contentList = await this.listFolder(contentPath, { recursive: true });

      if (!contentList.success) {
        return contentList;
      }

      // Get all file IDs
      const fileIds = this.extractFileIds(contentList.data);

      if (fileIds.length === 0) {
        return {
          success: true,
          message: 'No content to backup',
          data: { filesBackedUp: 0 },
        };
      }

      // Create backup ZIP
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `backup-${timestamp}.zip`;
      const backupPath = `/creators/${creatorId}/backup`;

      const zipResult = await this.createZip(fileIds, backupFilename, { toPath: backupPath });

      return {
        success: zipResult.success,
        message: 'Backup initiated',
        data: {
          progressHash: zipResult.data?.progresshash,
          filesIncluded: fileIds.length,
          backupPath: `${backupPath}/${backupFilename}`,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to backup content',
        error: error.message,
      };
    }
  }

  // ===== UTILITY METHODS =====

  private parseContents(metadata: any): any {
    if (!metadata) return null;

    const result: any = {
      name: metadata.name,
      path: metadata.path,
      isFolder: metadata.isfolder,
      created: metadata.created ? new Date(metadata.created) : undefined,
      modified: metadata.modified ? new Date(metadata.modified) : undefined,
    };

    if (metadata.isfolder) {
      result.folderid = metadata.folderid;
      result.contents = (metadata.contents || []).map((item: any) => this.parseContents(item));
    } else {
      result.fileid = metadata.fileid;
      result.size = metadata.size;
      result.hash = metadata.hash;
      result.contenttype = metadata.contenttype;
      result.thumb = metadata.thumb;
      result.category = metadata.category;
    }

    return result;
  }

  private calculateFolderStats(folder: any): any {
    let totalSize = 0;
    let totalFiles = 0;
    let totalFolders = 0;
    const byType: Record<string, { count: number; size: number }> = {};

    const processItem = (item: any) => {
      if (item.isFolder) {
        totalFolders++;
        if (item.contents) {
          item.contents.forEach(processItem);
        }
      } else {
        totalFiles++;
        totalSize += item.size || 0;

        const ext = (item.name || '').split('.').pop()?.toLowerCase() || 'unknown';
        if (!byType[ext]) {
          byType[ext] = { count: 0, size: 0 };
        }
        byType[ext].count++;
        byType[ext].size += item.size || 0;
      }
    };

    if (folder.contents) {
      folder.contents.forEach(processItem);
    }

    return { totalSize, totalFiles, totalFolders, byType };
  }

  private extractFileIds(folder: any): number[] {
    const fileIds: number[] = [];

    const processItem = (item: any) => {
      if (item.isFolder && item.contents) {
        item.contents.forEach(processItem);
      } else if (item.fileid) {
        fileIds.push(item.fileid);
      }
    };

    if (folder.contents) {
      folder.contents.forEach(processItem);
    }

    return fileIds;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  // ===== PUBLIC GETTERS =====

  isReady(): boolean {
    return this.isInitialized;
  }

  getUploadProgress(uploadId: string): UploadProgress | undefined {
    return this.uploadProgress.get(uploadId);
  }

  getAllUploadProgress(): UploadProgress[] {
    return Array.from(this.uploadProgress.values());
  }
}

// Export singleton instance
export const fanzCloudService = new FanzCloudService();
export default fanzCloudService;
