// @ts-nocheck
/**
 * Bunny CDN Routes
 *
 * API endpoints for Bunny CDN storage and streaming
 * Alternative/complementary to FanzCloud (pCloud)
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { bunnyCdnService } from "../services/bunnyCdnService";
import { isAuthenticated } from "../middleware/auth";
import multer from "multer";

const router = Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 * 1024, // 5GB max file size
  },
});

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const uploadMediaSchema = z.object({
  mediaType: z.enum(['image', 'video', 'audio', 'document']),
});

const videoUploadSchema = z.object({
  title: z.string().min(1, "Video title is required"),
  collectionId: z.string().optional(),
});

// ============================================================
// STATUS & CONFIG
// ============================================================

/**
 * GET /api/bunny/status
 * Get Bunny CDN status and configuration
 */
router.get("/status", (req: Request, res: Response) => {
  const status = bunnyCdnService.getStatus();

  res.json({
    success: true,
    data: {
      ...status,
      features: {
        storage: status.initialized,
        streaming: status.streamEnabled,
        signedUrls: !!process.env.BUNNY_TOKEN_KEY,
        cacheControl: true,
      },
      endpoints: {
        storage: status.storageZone ? `https://storage.bunnycdn.com/${status.storageZone}` : null,
        pullZone: status.pullZone,
        stream: status.streamEnabled ? 'https://video.bunnycdn.com' : null,
      },
    },
  });
});

/**
 * GET /api/bunny/stats
 * Get storage statistics
 */
router.get("/stats", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const stats = await bunnyCdnService.getStorageStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get storage stats",
    });
  }
});

// ============================================================
// FILE OPERATIONS
// ============================================================

/**
 * POST /api/bunny/upload
 * Upload a file to Bunny Storage
 */
router.post("/upload", isAuthenticated, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const userId = (req as any).user?.id || 'anonymous';
    const filePath = req.body.path || `uploads/${userId}/${Date.now()}-${req.file.originalname}`;
    const contentType = req.file.mimetype;

    const result = await bunnyCdnService.uploadFile(
      req.file.buffer,
      filePath,
      contentType
    );

    res.json({
      success: true,
      message: "File uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload file",
    });
  }
});

/**
 * POST /api/bunny/upload/media
 * Upload media with automatic path generation
 */
router.post("/upload/media", isAuthenticated, upload.single("file"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const data = uploadMediaSchema.parse(req.body);
    const userId = (req as any).user?.id || 'anonymous';

    const result = await bunnyCdnService.uploadMedia(
      req.file.buffer,
      req.file.originalname,
      userId,
      data.mediaType
    );

    res.json({
      success: true,
      message: "Media uploaded successfully",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload media",
    });
  }
});

/**
 * DELETE /api/bunny/files
 * Delete a file from Bunny Storage
 */
router.delete("/files", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    const success = await bunnyCdnService.deleteFile(filePath);

    res.json({
      success,
      message: success ? "File deleted successfully" : "Failed to delete file",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete file",
    });
  }
});

/**
 * GET /api/bunny/files
 * List files in a directory
 */
router.get("/files", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const directory = req.query.directory as string || "";

    const files = await bunnyCdnService.listFiles(directory);

    res.json({
      success: true,
      data: {
        directory,
        files,
        count: files.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list files",
    });
  }
});

/**
 * GET /api/bunny/cdn-url
 * Get CDN URL for a file
 */
router.get("/cdn-url", isAuthenticated, (req: Request, res: Response) => {
  try {
    const filePath = req.query.path as string;
    const signed = req.query.signed === "true";
    const expiry = parseInt(req.query.expiry as string) || 3600;

    if (!filePath) {
      return res.status(400).json({
        success: false,
        error: "File path is required",
      });
    }

    let url: string;
    if (signed) {
      url = bunnyCdnService.generateSignedUrl(filePath, expiry);
    } else {
      url = bunnyCdnService.getCdnUrl(filePath);
    }

    res.json({
      success: true,
      data: {
        url,
        signed,
        expiresIn: signed ? expiry : null,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate CDN URL",
    });
  }
});

/**
 * POST /api/bunny/purge
 * Purge CDN cache for a file or URL
 */
router.post("/purge", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { urlOrPath } = req.body;

    if (!urlOrPath) {
      return res.status(400).json({
        success: false,
        error: "URL or path is required",
      });
    }

    const result = await bunnyCdnService.purgeCache(urlOrPath);

    res.json({
      success: result.success,
      message: result.success ? "Cache purged successfully" : "Failed to purge cache",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to purge cache",
    });
  }
});

// ============================================================
// VIDEO STREAMING (BUNNY STREAM)
// ============================================================

/**
 * POST /api/bunny/stream/upload
 * Upload video to Bunny Stream for HLS streaming
 */
router.post("/stream/upload", isAuthenticated, upload.single("video"), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No video file provided",
      });
    }

    const data = videoUploadSchema.parse(req.body);

    const result = await bunnyCdnService.uploadVideo(
      req.file.buffer,
      data.title,
      data.collectionId
    );

    res.json({
      success: true,
      message: "Video upload started - processing may take a few minutes",
      data: result,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Failed to upload video",
    });
  }
});

/**
 * GET /api/bunny/stream/:videoId
 * Get video details and streaming URLs
 */
router.get("/stream/:videoId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const video = await bunnyCdnService.getVideo(videoId);

    res.json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get video",
    });
  }
});

/**
 * DELETE /api/bunny/stream/:videoId
 * Delete a video from Bunny Stream
 */
router.delete("/stream/:videoId", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { videoId } = req.params;
    const success = await bunnyCdnService.deleteVideo(videoId);

    res.json({
      success,
      message: success ? "Video deleted successfully" : "Failed to delete video",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete video",
    });
  }
});

/**
 * POST /api/bunny/stream/collection
 * Create a video collection (for organizing creator content)
 */
router.post("/stream/collection", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Collection name is required",
      });
    }

    const collectionId = await bunnyCdnService.createCollection(name);

    res.json({
      success: true,
      message: "Collection created successfully",
      data: {
        collectionId,
        name,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to create collection",
    });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/bunny/health
 * Health check endpoint
 */
router.get("/health", async (req: Request, res: Response) => {
  const status = bunnyCdnService.getStatus();

  res.json({
    success: true,
    status: status.initialized ? "healthy" : "unconfigured",
    configured: status.initialized,
    storage: status.initialized,
    streaming: status.streamEnabled,
    message: status.initialized
      ? "Bunny CDN is operational"
      : "Bunny CDN is available but not configured. Set BUNNY_API_KEY to enable.",
  });
});

export default router;
