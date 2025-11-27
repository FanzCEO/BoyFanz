// Cross-posting feature types

export type CrosspostStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';
export type PlatformPostStatus = 'queued' | 'processing' | 'posted' | 'failed' | 'cancelled';

// Creator being tagged
export interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isVerified?: boolean;
  isFollowing?: boolean;
  isSubscribed?: boolean;
}

// Post tag
export interface PostTag {
  id: string;
  postId: string;
  taggedCreatorId: string;
  taggedByCreatorId: string;
  status: CrosspostStatus;
  isVisibleOnTaggedWall: boolean;
  taggedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

// Post tag with creator details
export interface PostTagWithCreator extends PostTag {
  taggedCreator: Creator;
  taggedByCreator: Creator;
  post?: {
    id: string;
    title?: string;
    content?: string;
    thumbnailUrl?: string;
  };
}

// Creator cross-post settings
export interface CreatorCrosspostSettings {
  id: string;
  creatorId: string;
  autoApproveAllTags: boolean;
  autoApproveFromFollowing: boolean;
  autoApproveFromSubscribers: boolean;
  autoApproveFromVerified: boolean;
  notifyOnTag: boolean;
  notifyOnApprovalNeeded: boolean;
  blockedCreatorIds: string[];
  alwaysApproveCreatorIds: string[];
  createdAt: string;
  updatedAt: string;
}

// Platform for multi-platform posting
export interface Platform {
  id: string;
  slug: string;
  name: string;
  domain: string;
  icon?: string;
  color?: string;
  isActive: boolean;
}

// Platform-specific settings
export interface PlatformSettings {
  enabled: boolean;
  modifyCaption?: boolean;
  captionPrefix?: string;
  captionSuffix?: string;
  addWatermark?: boolean;
  customHashtags?: string[];
}

// Multi-platform settings
export interface MultiplatformSettings {
  id: string;
  creatorId: string;
  defaultPlatforms: string[];
  autoPostEnabled: boolean;
  autoPostDelaySeconds: number;
  platformSettings: Record<string, PlatformSettings>;
  notifyOnPostSuccess: boolean;
  notifyOnPostFailure: boolean;
  createdAt: string;
  updatedAt: string;
}

// Queued multi-platform post
export interface MultiplatformQueueItem {
  id: string;
  originalPostId: string;
  creatorId: string;
  targetPlatform: string;
  status: PlatformPostStatus;
  modifiedCaption?: string;
  modifiedTitle?: string;
  modifiedHashtags?: string[];
  addPlatformWatermark: boolean;
  scheduledFor?: string;
  targetPostId?: string;
  errorMessage?: string;
  retryCount: number;
  maxRetries: number;
  queuedAt: string;
  processingStartedAt?: string;
  completedAt?: string;
  failedAt?: string;
}

// Multi-platform queue with platform details
export interface MultiplatformQueueItemWithDetails extends MultiplatformQueueItem {
  platform: Platform;
  originalPost?: {
    id: string;
    title?: string;
    content?: string;
    thumbnailUrl?: string;
  };
}

// Multi-platform analytics
export interface MultiplatformAnalytics {
  totalCrossPosts: number;
  successRate: number;
  platformBreakdown: Record<string, {
    totalPosts: number;
    successfulPosts: number;
    failedPosts: number;
    avgEngagement: {
      views: number;
      likes: number;
      comments: number;
    };
  }>;
}

// API request/response types
export interface TagCreatorsRequest {
  taggedCreatorIds: string[];
}

export interface TagCreatorsResponse {
  success: boolean;
  tags: PostTag[];
}

export interface ApproveRejectTagRequest {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface ApproveRejectTagResponse {
  success: boolean;
  tag: PostTag;
  crosspostedPost?: {
    id: string;
    originalPostId: string;
    crosspostedToCreatorId: string;
  };
}

export interface UpdateCrosspostSettingsRequest extends Partial<Omit<CreatorCrosspostSettings, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>> {}

export interface UpdateMultiplatformSettingsRequest extends Partial<Omit<MultiplatformSettings, 'id' | 'creatorId' | 'createdAt' | 'updatedAt'>> {}

export interface CreatePostWithMultiplatformRequest {
  title?: string;
  content: string;
  type: string;
  visibility: string;
  multiplatform?: {
    enabled: boolean;
    platforms?: string[]; // Override default platforms
    platformModifications?: Record<string, {
      caption?: string;
      title?: string;
      hashtags?: string[];
    }>;
  };
}
