/**
 * FanzCloud Routes
 *
 * API endpoints for cloud storage powered by pCloud
 * Provides file upload, download, streaming, and management
 */

import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { fanzCloudService } from "../services/fanzCloudService";
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

const authenticateSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const oauthExchangeSchema = z.object({
  code: z.string().min(1, "Authorization code is required"),
});

const folderSchema = z.object({
  path: z.string().optional(),
  folderId: z.union([z.string(), z.number()]).optional(),
  name: z.string().optional(),
});

const createFolderSchema = z.object({
  path: z.string().optional(),
  folderId: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(1, "Folder name is required"),
});

const renameSchema = z.object({
  path: z.string().optional(),
  fileId: z.union([z.string(), z.number()]).optional(),
  folderId: z.union([z.string(), z.number()]).optional(),
  toName: z.string().min(1, "New name is required"),
});

const copyMoveSchema = z.object({
  path: z.string().optional(),
  fileId: z.union([z.string(), z.number()]).optional(),
  folderId: z.union([z.string(), z.number()]).optional(),
  toPath: z.string().optional(),
  toFolderId: z.union([z.string(), z.number()]).optional(),
});

const publicLinkSchema = z.object({
  fileId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  folderId: z.union([z.string(), z.number()]).optional(),
  expire: z.string().optional(),
  maxDownloads: z.number().optional(),
  maxTraffic: z.number().optional(),
});

const uploadLinkSchema = z.object({
  folderId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  comment: z.string().optional(),
  expire: z.string().optional(),
  maxSpace: z.number().optional(),
  maxFiles: z.number().optional(),
});

const streamSchema = z.object({
  fileId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  forceDownload: z.boolean().optional(),
  contentType: z.string().optional(),
});

const thumbnailSchema = z.object({
  fileId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  size: z.string().optional(),
  crop: z.boolean().optional(),
  type: z.enum(['png', 'jpeg']).optional(),
});

const revisionSchema = z.object({
  fileId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  revisionId: z.union([z.string(), z.number()]).optional(),
});

const shareSchema = z.object({
  folderId: z.union([z.string(), z.number()]).optional(),
  path: z.string().optional(),
  mail: z.string().email().optional(),
  permissions: z.number().optional(),
  name: z.string().optional(),
  message: z.string().optional(),
});

const archiveSchema = z.object({
  fileIds: z.array(z.union([z.string(), z.number()])).optional(),
  paths: z.array(z.string()).optional(),
  filename: z.string().optional(),
  toPath: z.string().optional(),
  toFolderId: z.union([z.string(), z.number()]).optional(),
});

const creatorVaultSchema = z.object({
  creatorId: z.string().min(1, "Creator ID is required"),
  creatorName: z.string().min(1, "Creator name is required"),
});

const creatorUploadSchema = z.object({
  creatorId: z.string().min(1, "Creator ID is required"),
  contentType: z.enum(['photos', 'videos', 'audio', 'documents', 'other']),
});

// ============================================================
// MIDDLEWARE
// ============================================================

// Authentication middleware for protected routes
const requireAuth = (req: Request, res: Response, next: Function) => {
  // In production, verify session or JWT token
  // For now, check if fanzCloudService is configured
  if (!process.env.FANZCLOUD_ACCESS_TOKEN && !process.env.FANZCLOUD_AUTH_TOKEN) {
    return res.status(401).json({
      success: false,
      error: "FanzCloud not configured. Please set FANZCLOUD_ACCESS_TOKEN or FANZCLOUD_AUTH_TOKEN.",
    });
  }
  next();
};

// ============================================================
// AUTHENTICATION ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/auth/login
 * Authenticate with pCloud using email and password
 */
router.post("/auth/login", async (req, res) => {
  try {
    const data = authenticateSchema.parse(req.body);
    const result = await fanzCloudService.authenticate(data.email, data.password);

    res.json({
      success: true,
      message: "Authentication successful",
      data: {
        authToken: result.auth,
        userId: result.userid,
        email: result.email,
        premium: result.premium,
        quota: result.quota,
        usedQuota: result.usedquota,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(401).json({
      success: false,
      error: error.message || "Authentication failed",
    });
  }
});

/**
 * GET /api/fanzcloud/auth/oauth-url
 * Get OAuth URL for pCloud authorization
 */
router.get("/auth/oauth-url", async (req, res) => {
  try {
    const redirectUri = req.query.redirectUri as string || `${req.protocol}://${req.get('host')}/api/fanzcloud/auth/oauth-callback`;
    const url = fanzCloudService.getOAuthUrl(redirectUri);

    res.json({
      success: true,
      data: { url },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate OAuth URL",
    });
  }
});

/**
 * POST /api/fanzcloud/auth/oauth-exchange
 * Exchange OAuth authorization code for access token
 */
router.post("/auth/oauth-exchange", async (req, res) => {
  try {
    const data = oauthExchangeSchema.parse(req.body);
    const redirectUri = req.body.redirectUri || `${req.protocol}://${req.get('host')}/api/fanzcloud/auth/oauth-callback`;
    const result = await fanzCloudService.exchangeOAuthCode(data.code, redirectUri);

    res.json({
      success: true,
      message: "OAuth exchange successful",
      data: {
        accessToken: result.access_token,
        tokenType: result.token_type,
        userId: result.userid,
        locationId: result.locationid,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    res.status(400).json({
      success: false,
      error: error.message || "OAuth exchange failed",
    });
  }
});

// ============================================================
// QUOTA & ACCOUNT ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/quota
 * Get storage quota information
 */
router.get("/quota", requireAuth, async (req, res) => {
  try {
    const quota = await fanzCloudService.getQuota();

    res.json({
      success: true,
      data: {
        quota: quota.quota,
        usedQuota: quota.usedquota,
        freeQuota: quota.quota - quota.usedquota,
        percentUsed: ((quota.usedquota / quota.quota) * 100).toFixed(2),
        premium: quota.premium,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get quota",
    });
  }
});

// ============================================================
// FOLDER ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/folders
 * List folder contents
 */
router.get("/folders", requireAuth, async (req, res) => {
  try {
    const path = req.query.path as string || "/";
    const folderId = req.query.folderId as string;
    const recursive = req.query.recursive === "true";
    const showDeleted = req.query.showDeleted === "true";

    const options = {
      ...(path && { path }),
      ...(folderId && { folderId: parseInt(folderId) }),
      recursive,
      showDeleted,
    };

    const result = await fanzCloudService.listFolder(options);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list folder",
    });
  }
});

/**
 * POST /api/fanzcloud/folders
 * Create a new folder
 */
router.post("/folders", requireAuth, async (req, res) => {
  try {
    const data = createFolderSchema.parse(req.body);
    const result = await fanzCloudService.createFolder({
      path: data.path,
      folderId: data.folderId ? Number(data.folderId) : undefined,
      name: data.name,
    });

    res.json({
      success: true,
      message: "Folder created successfully",
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
      error: error.message || "Failed to create folder",
    });
  }
});

/**
 * PUT /api/fanzcloud/folders/rename
 * Rename a folder
 */
router.put("/folders/rename", requireAuth, async (req, res) => {
  try {
    const data = renameSchema.parse(req.body);
    const result = await fanzCloudService.renameFolder({
      path: data.path,
      folderId: data.folderId ? Number(data.folderId) : undefined,
      toName: data.toName,
    });

    res.json({
      success: true,
      message: "Folder renamed successfully",
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
      error: error.message || "Failed to rename folder",
    });
  }
});

/**
 * POST /api/fanzcloud/folders/copy
 * Copy a folder
 */
router.post("/folders/copy", requireAuth, async (req, res) => {
  try {
    const data = copyMoveSchema.parse(req.body);
    const result = await fanzCloudService.copyFolder({
      path: data.path,
      folderId: data.folderId ? Number(data.folderId) : undefined,
      toPath: data.toPath,
      toFolderId: data.toFolderId ? Number(data.toFolderId) : undefined,
    });

    res.json({
      success: true,
      message: "Folder copied successfully",
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
      error: error.message || "Failed to copy folder",
    });
  }
});

/**
 * DELETE /api/fanzcloud/folders
 * Delete a folder
 */
router.delete("/folders", requireAuth, async (req, res) => {
  try {
    const path = req.query.path as string;
    const folderId = req.query.folderId as string;
    const recursive = req.query.recursive === "true";

    const result = await fanzCloudService.deleteFolder({
      ...(path && { path }),
      ...(folderId && { folderId: parseInt(folderId) }),
      recursive,
    });

    res.json({
      success: true,
      message: "Folder deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete folder",
    });
  }
});

// ============================================================
// FILE ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/files/upload
 * Upload a file
 */
router.post("/files/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const path = req.body.path || "/";
    const folderId = req.body.folderId ? parseInt(req.body.folderId) : undefined;
    const filename = req.body.filename || req.file.originalname;
    const noPartial = req.body.noPartial === "true";
    const renameIfExists = req.body.renameIfExists === "true";

    const result = await fanzCloudService.uploadFile({
      file: req.file.buffer,
      filename,
      path,
      folderId,
      noPartial,
      renameIfExists,
      progressCallback: (percent) => {
        // For SSE or WebSocket progress updates in the future
        console.log(`Upload progress: ${percent}%`);
      },
    });

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
 * GET /api/fanzcloud/files/download
 * Download a file
 */
router.get("/files/download", requireAuth, async (req, res) => {
  try {
    const path = req.query.path as string;
    const fileId = req.query.fileId as string;

    if (!path && !fileId) {
      return res.status(400).json({
        success: false,
        error: "Either path or fileId is required",
      });
    }

    const result = await fanzCloudService.downloadFile({
      ...(path && { path }),
      ...(fileId && { fileId: parseInt(fileId) }),
    });

    // Set appropriate headers
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${path?.split("/").pop() || "download"}"`);
    res.send(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to download file",
    });
  }
});

/**
 * PUT /api/fanzcloud/files/rename
 * Rename a file
 */
router.put("/files/rename", requireAuth, async (req, res) => {
  try {
    const data = renameSchema.parse(req.body);
    const result = await fanzCloudService.renameFile({
      path: data.path,
      fileId: data.fileId ? Number(data.fileId) : undefined,
      toName: data.toName,
    });

    res.json({
      success: true,
      message: "File renamed successfully",
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
      error: error.message || "Failed to rename file",
    });
  }
});

/**
 * POST /api/fanzcloud/files/copy
 * Copy a file
 */
router.post("/files/copy", requireAuth, async (req, res) => {
  try {
    const data = copyMoveSchema.parse(req.body);
    const result = await fanzCloudService.copyFile({
      path: data.path,
      fileId: data.fileId ? Number(data.fileId) : undefined,
      toPath: data.toPath,
      toFolderId: data.toFolderId ? Number(data.toFolderId) : undefined,
    });

    res.json({
      success: true,
      message: "File copied successfully",
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
      error: error.message || "Failed to copy file",
    });
  }
});

/**
 * DELETE /api/fanzcloud/files
 * Delete a file
 */
router.delete("/files", requireAuth, async (req, res) => {
  try {
    const path = req.query.path as string;
    const fileId = req.query.fileId as string;

    if (!path && !fileId) {
      return res.status(400).json({
        success: false,
        error: "Either path or fileId is required",
      });
    }

    const result = await fanzCloudService.deleteFile({
      ...(path && { path }),
      ...(fileId && { fileId: parseInt(fileId) }),
    });

    res.json({
      success: true,
      message: "File deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete file",
    });
  }
});

// ============================================================
// PUBLIC LINKS ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/public-links
 * Create a public link for a file
 */
router.post("/public-links", requireAuth, async (req, res) => {
  try {
    const data = publicLinkSchema.parse(req.body);
    const result = await fanzCloudService.createPublicLink({
      fileId: data.fileId ? Number(data.fileId) : undefined,
      path: data.path,
      expire: data.expire,
      maxDownloads: data.maxDownloads,
      maxTraffic: data.maxTraffic,
    });

    res.json({
      success: true,
      message: "Public link created successfully",
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
      error: error.message || "Failed to create public link",
    });
  }
});

/**
 * POST /api/fanzcloud/public-links/folder
 * Create a public link for a folder
 */
router.post("/public-links/folder", requireAuth, async (req, res) => {
  try {
    const data = publicLinkSchema.parse(req.body);
    const result = await fanzCloudService.createFolderPublicLink({
      folderId: data.folderId ? Number(data.folderId) : undefined,
      path: data.path,
      expire: data.expire,
      maxDownloads: data.maxDownloads,
      maxTraffic: data.maxTraffic,
    });

    res.json({
      success: true,
      message: "Folder public link created successfully",
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
      error: error.message || "Failed to create folder public link",
    });
  }
});

/**
 * GET /api/fanzcloud/public-links
 * List public links
 */
router.get("/public-links", requireAuth, async (req, res) => {
  try {
    const result = await fanzCloudService.listPublicLinks();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list public links",
    });
  }
});

/**
 * DELETE /api/fanzcloud/public-links/:linkId
 * Delete a public link
 */
router.delete("/public-links/:linkId", requireAuth, async (req, res) => {
  try {
    const linkId = parseInt(req.params.linkId);
    const result = await fanzCloudService.deletePublicLink(linkId);

    res.json({
      success: true,
      message: "Public link deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete public link",
    });
  }
});

// ============================================================
// UPLOAD LINKS ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/upload-links
 * Create an upload link
 */
router.post("/upload-links", requireAuth, async (req, res) => {
  try {
    const data = uploadLinkSchema.parse(req.body);
    const result = await fanzCloudService.createUploadLink({
      folderId: data.folderId ? Number(data.folderId) : undefined,
      path: data.path,
      comment: data.comment,
      expire: data.expire,
      maxSpace: data.maxSpace,
      maxFiles: data.maxFiles,
    });

    res.json({
      success: true,
      message: "Upload link created successfully",
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
      error: error.message || "Failed to create upload link",
    });
  }
});

/**
 * GET /api/fanzcloud/upload-links
 * List upload links
 */
router.get("/upload-links", requireAuth, async (req, res) => {
  try {
    const result = await fanzCloudService.listUploadLinks();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list upload links",
    });
  }
});

/**
 * DELETE /api/fanzcloud/upload-links/:uploadLinkId
 * Delete an upload link
 */
router.delete("/upload-links/:uploadLinkId", requireAuth, async (req, res) => {
  try {
    const uploadLinkId = parseInt(req.params.uploadLinkId);
    const result = await fanzCloudService.deleteUploadLink(uploadLinkId);

    res.json({
      success: true,
      message: "Upload link deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete upload link",
    });
  }
});

// ============================================================
// STREAMING ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/stream/video
 * Get video streaming link
 */
router.get("/stream/video", requireAuth, async (req, res) => {
  try {
    const data = streamSchema.parse({
      fileId: req.query.fileId ? parseInt(req.query.fileId as string) : undefined,
      path: req.query.path as string,
      forceDownload: req.query.forceDownload === "true",
      contentType: req.query.contentType as string,
    });

    const result = await fanzCloudService.getVideoStreamLink({
      fileId: data.fileId,
      path: data.path,
      forceDownload: data.forceDownload,
      contentType: data.contentType,
    });

    res.json({
      success: true,
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
      error: error.message || "Failed to get video stream link",
    });
  }
});

/**
 * GET /api/fanzcloud/stream/audio
 * Get audio streaming link
 */
router.get("/stream/audio", requireAuth, async (req, res) => {
  try {
    const data = streamSchema.parse({
      fileId: req.query.fileId ? parseInt(req.query.fileId as string) : undefined,
      path: req.query.path as string,
      forceDownload: req.query.forceDownload === "true",
      contentType: req.query.contentType as string,
    });

    const result = await fanzCloudService.getAudioStreamLink({
      fileId: data.fileId,
      path: data.path,
      forceDownload: data.forceDownload,
      contentType: data.contentType,
    });

    res.json({
      success: true,
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
      error: error.message || "Failed to get audio stream link",
    });
  }
});

/**
 * GET /api/fanzcloud/stream/hls
 * Get HLS streaming link
 */
router.get("/stream/hls", requireAuth, async (req, res) => {
  try {
    const fileId = req.query.fileId ? parseInt(req.query.fileId as string) : undefined;
    const path = req.query.path as string;

    if (!fileId && !path) {
      return res.status(400).json({
        success: false,
        error: "Either fileId or path is required",
      });
    }

    const result = await fanzCloudService.getHLSLink({ fileId, path });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get HLS stream link",
    });
  }
});

// ============================================================
// THUMBNAIL ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/thumbnails
 * Get thumbnail for a file
 */
router.get("/thumbnails", requireAuth, async (req, res) => {
  try {
    const data = thumbnailSchema.parse({
      fileId: req.query.fileId ? parseInt(req.query.fileId as string) : undefined,
      path: req.query.path as string,
      size: req.query.size as string || "256x256",
      crop: req.query.crop === "true",
      type: req.query.type as 'png' | 'jpeg' || 'jpeg',
    });

    const result = await fanzCloudService.getThumbnail({
      fileId: data.fileId,
      path: data.path,
      size: data.size,
      crop: data.crop,
      type: data.type,
    });

    // Set content type based on requested type
    res.setHeader("Content-Type", data.type === 'png' ? 'image/png' : 'image/jpeg');
    res.send(result);
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
      error: error.message || "Failed to get thumbnail",
    });
  }
});

/**
 * GET /api/fanzcloud/thumbnails/links
 * Get thumbnail links for multiple files
 */
router.get("/thumbnails/links", requireAuth, async (req, res) => {
  try {
    const fileIds = (req.query.fileIds as string)?.split(",").map(id => parseInt(id.trim()));
    const size = req.query.size as string || "256x256";
    const crop = req.query.crop === "true";
    const type = req.query.type as 'png' | 'jpeg' || 'jpeg';

    if (!fileIds || fileIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: "fileIds query parameter is required",
      });
    }

    const result = await fanzCloudService.getThumbsLinks(fileIds, size, crop, type);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get thumbnail links",
    });
  }
});

// ============================================================
// REVISION / VERSION CONTROL ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/revisions
 * List file revisions
 */
router.get("/revisions", requireAuth, async (req, res) => {
  try {
    const fileId = req.query.fileId ? parseInt(req.query.fileId as string) : undefined;
    const path = req.query.path as string;

    if (!fileId && !path) {
      return res.status(400).json({
        success: false,
        error: "Either fileId or path is required",
      });
    }

    const result = await fanzCloudService.listRevisions({ fileId, path });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list revisions",
    });
  }
});

/**
 * POST /api/fanzcloud/revisions/revert
 * Revert to a specific revision
 */
router.post("/revisions/revert", requireAuth, async (req, res) => {
  try {
    const data = revisionSchema.parse(req.body);

    if (!data.revisionId) {
      return res.status(400).json({
        success: false,
        error: "revisionId is required",
      });
    }

    const result = await fanzCloudService.revertToRevision({
      fileId: data.fileId ? Number(data.fileId) : undefined,
      path: data.path,
      revisionId: Number(data.revisionId),
    });

    res.json({
      success: true,
      message: "Reverted to revision successfully",
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
      error: error.message || "Failed to revert to revision",
    });
  }
});

// ============================================================
// TRASH ROUTES
// ============================================================

/**
 * GET /api/fanzcloud/trash
 * List items in trash
 */
router.get("/trash", requireAuth, async (req, res) => {
  try {
    const result = await fanzCloudService.listTrash();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list trash",
    });
  }
});

/**
 * POST /api/fanzcloud/trash/restore
 * Restore an item from trash
 */
router.post("/trash/restore", requireAuth, async (req, res) => {
  try {
    const fileId = req.body.fileId ? parseInt(req.body.fileId) : undefined;
    const folderId = req.body.folderId ? parseInt(req.body.folderId) : undefined;

    if (!fileId && !folderId) {
      return res.status(400).json({
        success: false,
        error: "Either fileId or folderId is required",
      });
    }

    const result = await fanzCloudService.restoreFromTrash({ fileId, folderId });

    res.json({
      success: true,
      message: "Item restored from trash successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to restore from trash",
    });
  }
});

/**
 * DELETE /api/fanzcloud/trash
 * Empty trash
 */
router.delete("/trash", requireAuth, async (req, res) => {
  try {
    const result = await fanzCloudService.emptyTrash();

    res.json({
      success: true,
      message: "Trash emptied successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to empty trash",
    });
  }
});

// ============================================================
// ARCHIVE ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/archive/create
 * Create a ZIP archive
 */
router.post("/archive/create", requireAuth, async (req, res) => {
  try {
    const data = archiveSchema.parse(req.body);
    const result = await fanzCloudService.createZip({
      fileIds: data.fileIds?.map(id => Number(id)),
      paths: data.paths,
      filename: data.filename,
    });

    res.json({
      success: true,
      message: "ZIP archive creation started",
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
      error: error.message || "Failed to create archive",
    });
  }
});

/**
 * GET /api/fanzcloud/archive/progress/:progressHash
 * Check ZIP creation progress
 */
router.get("/archive/progress/:progressHash", requireAuth, async (req, res) => {
  try {
    const progressHash = req.params.progressHash;
    const result = await fanzCloudService.checkZipProgress(progressHash);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to check archive progress",
    });
  }
});

/**
 * POST /api/fanzcloud/archive/extract
 * Extract a ZIP file
 */
router.post("/archive/extract", requireAuth, async (req, res) => {
  try {
    const fileId = req.body.fileId ? parseInt(req.body.fileId) : undefined;
    const path = req.body.path as string;
    const toPath = req.body.toPath as string;
    const toFolderId = req.body.toFolderId ? parseInt(req.body.toFolderId) : undefined;

    if (!fileId && !path) {
      return res.status(400).json({
        success: false,
        error: "Either fileId or path is required",
      });
    }

    const result = await fanzCloudService.extractZip({
      fileId,
      path,
      toPath,
      toFolderId,
    });

    res.json({
      success: true,
      message: "Archive extraction started",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to extract archive",
    });
  }
});

// ============================================================
// SHARING ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/share
 * Share a folder with another user
 */
router.post("/share", requireAuth, async (req, res) => {
  try {
    const data = shareSchema.parse(req.body);
    const result = await fanzCloudService.shareFolder({
      folderId: data.folderId ? Number(data.folderId) : undefined,
      path: data.path,
      mail: data.mail,
      permissions: data.permissions,
      name: data.name,
      message: data.message,
    });

    res.json({
      success: true,
      message: "Folder shared successfully",
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
      error: error.message || "Failed to share folder",
    });
  }
});

/**
 * GET /api/fanzcloud/shares
 * List folder shares
 */
router.get("/shares", requireAuth, async (req, res) => {
  try {
    const result = await fanzCloudService.listShares();

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to list shares",
    });
  }
});

/**
 * DELETE /api/fanzcloud/shares/:shareRequestId
 * Remove a folder share
 */
router.delete("/shares/:shareRequestId", requireAuth, async (req, res) => {
  try {
    const shareRequestId = parseInt(req.params.shareRequestId);
    const result = await fanzCloudService.removeShare(shareRequestId);

    res.json({
      success: true,
      message: "Share removed successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to remove share",
    });
  }
});

// ============================================================
// CREATOR-SPECIFIC ROUTES
// ============================================================

/**
 * POST /api/fanzcloud/creator/vault
 * Create a vault structure for a creator
 */
router.post("/creator/vault", requireAuth, async (req, res) => {
  try {
    const data = creatorVaultSchema.parse(req.body);
    const result = await fanzCloudService.createCreatorVault(data.creatorId, data.creatorName);

    res.json({
      success: true,
      message: "Creator vault created successfully",
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
      error: error.message || "Failed to create creator vault",
    });
  }
});

/**
 * POST /api/fanzcloud/creator/upload
 * Upload content to creator's vault
 */
router.post("/creator/upload", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No file provided",
      });
    }

    const data = creatorUploadSchema.parse(req.body);
    const result = await fanzCloudService.uploadCreatorContent(
      data.creatorId,
      req.file.buffer,
      req.file.originalname,
      data.contentType
    );

    res.json({
      success: true,
      message: "Creator content uploaded successfully",
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
      error: error.message || "Failed to upload creator content",
    });
  }
});

/**
 * GET /api/fanzcloud/creator/:creatorId/stats
 * Get creator's storage statistics
 */
router.get("/creator/:creatorId/stats", requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const result = await fanzCloudService.getCreatorStorageStats(creatorId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to get creator storage stats",
    });
  }
});

/**
 * POST /api/fanzcloud/creator/:creatorId/backup
 * Create a backup of creator's content
 */
router.post("/creator/:creatorId/backup", requireAuth, async (req, res) => {
  try {
    const creatorId = req.params.creatorId;
    const result = await fanzCloudService.backupCreatorContent(creatorId);

    res.json({
      success: true,
      message: "Creator backup started",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || "Failed to start creator backup",
    });
  }
});

// ============================================================
// HEALTH CHECK
// ============================================================

/**
 * GET /api/fanzcloud/health
 * Health check endpoint
 */
router.get("/health", async (req, res) => {
  try {
    const configured = !!(process.env.FANZCLOUD_ACCESS_TOKEN || process.env.FANZCLOUD_AUTH_TOKEN);

    if (configured) {
      const quota = await fanzCloudService.getQuota();
      res.json({
        success: true,
        status: "healthy",
        configured: true,
        storage: {
          totalBytes: quota.quota,
          usedBytes: quota.usedquota,
          freeBytes: quota.quota - quota.usedquota,
          percentUsed: ((quota.usedquota / quota.quota) * 100).toFixed(2),
        },
      });
    } else {
      res.json({
        success: true,
        status: "unconfigured",
        configured: false,
        message: "FanzCloud is available but not configured. Set FANZCLOUD_ACCESS_TOKEN to enable.",
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      status: "error",
      error: error.message || "FanzCloud health check failed",
    });
  }
});

export default router;
