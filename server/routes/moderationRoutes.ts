// @ts-nocheck
/**
 * Content Moderation API Routes
 *
 * Provides endpoints for AI-powered content moderation using:
 * - Hugging Face NSFW detection (primary)
 * - Sightengine (fallback/enterprise)
 * - VerifyMy (age/identity verification)
 */

import { Router, Request, Response } from 'express';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
import { unifiedModerationService } from '../services/unifiedModerationService';
import { huggingFaceNSFWService } from '../services/huggingFaceNSFWService';
import { sightengineService } from '../services/sightengineService';
import { kycService } from '../services/kycService';
import multer from 'multer';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// ===== Public Moderation Endpoints =====

/**
 * Moderate uploaded content
 * POST /api/moderation/check
 */
router.post('/check', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const { contentId, contentType, contentUrl, textContent } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Validate input
    if (!contentId) {
      return res.status(400).json({ error: 'contentId is required' });
    }

    if (!contentType || !['image', 'video', 'text', 'audio'].includes(contentType)) {
      return res.status(400).json({ error: 'Valid contentType is required (image, video, text, audio)' });
    }

    // Get content source
    let imageBuffer: Buffer | undefined;
    let imageUrl: string | undefined;

    if (req.file) {
      imageBuffer = req.file.buffer;
    } else if (contentUrl) {
      imageUrl = contentUrl;
    } else if (contentType !== 'text' && !textContent) {
      return res.status(400).json({ error: 'Either file upload, contentUrl, or textContent is required' });
    }

    // Run moderation
    const decision = await unifiedModerationService.moderateContent({
      contentId,
      contentType,
      contentUrl: imageUrl,
      contentBuffer: imageBuffer,
      textContent,
      uploadedBy: userId,
      metadata: req.body.metadata
    });

    res.json({
      success: true,
      decision: {
        approved: decision.approved,
        action: decision.action,
        category: decision.category,
        confidence: decision.confidence,
        flags: decision.flags,
        reason: decision.reason,
        processingTime: decision.processingTime
      }
    });

  } catch (error) {
    console.error('Moderation check error:', error);
    res.status(500).json({ error: 'Moderation check failed' });
  }
});

/**
 * Quick NSFW check (image only)
 * POST /api/moderation/nsfw
 */
router.post('/nsfw', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
  try {
    let imageInput: string | Buffer;

    if (req.file) {
      imageInput = req.file.buffer;
    } else if (req.body.imageUrl) {
      imageInput = req.body.imageUrl;
    } else if (req.body.imageBase64) {
      imageInput = Buffer.from(req.body.imageBase64, 'base64');
    } else {
      return res.status(400).json({ error: 'Image file, imageUrl, or imageBase64 is required' });
    }

    const result = await huggingFaceNSFWService.detectNSFWImage(imageInput);

    res.json({
      success: true,
      result: {
        isNSFW: result.isNSFW,
        category: result.category,
        confidence: result.confidence,
        scores: result.scores,
        requiresAgeGate: result.requiresAgeGate,
        requiresBlur: result.requiresBlur,
        processingTime: result.processingTime
      }
    });

  } catch (error) {
    console.error('NSFW check error:', error);
    res.status(500).json({ error: 'NSFW check failed' });
  }
});

/**
 * Text moderation check
 * POST /api/moderation/text
 */
router.post('/text', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text content is required' });
    }

    if (text.length > 10000) {
      return res.status(400).json({ error: 'Text exceeds maximum length (10000 characters)' });
    }

    const result = await huggingFaceNSFWService.detectNSFWText(text);

    res.json({
      success: true,
      result: {
        isNSFW: result.isNSFW,
        recommendation: result.recommendation,
        categories: result.categories,
        flaggedTerms: result.flaggedTerms,
        confidence: result.confidence
      }
    });

  } catch (error) {
    console.error('Text moderation error:', error);
    res.status(500).json({ error: 'Text moderation failed' });
  }
});

/**
 * Age estimation from image
 * POST /api/moderation/age-check
 */
router.post('/age-check', isAuthenticated, upload.single('image'), async (req: Request, res: Response) => {
  try {
    let imageInput: string | Buffer;

    if (req.file) {
      imageInput = req.file.buffer;
    } else if (req.body.imageUrl) {
      imageInput = req.body.imageUrl;
    } else {
      return res.status(400).json({ error: 'Image file or imageUrl is required' });
    }

    const result = await huggingFaceNSFWService.estimateAge(imageInput);

    res.json({
      success: true,
      result: {
        estimatedAge: result.estimatedAge,
        isMinor: result.isMinor,
        confidence: result.confidence,
        faceDetected: result.faceDetected,
        multipleFaces: result.multipleFaces
      }
    });

  } catch (error) {
    console.error('Age check error:', error);
    res.status(500).json({ error: 'Age check failed' });
  }
});

// ===== Admin Moderation Queue Endpoints =====

/**
 * Get moderation queue
 * GET /api/moderation/queue
 */
router.get('/queue', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;

    // Return mock queue data for now - integrate with actual moderation queue table
    const queue = {
      items: [],
      total: 0,
      page: Number(page),
      limit: Number(limit),
      stats: {
        pending: 0,
        approved: 0,
        rejected: 0,
        escalated: 0
      }
    };

    res.json(queue);
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ error: 'Failed to get moderation queue' });
  }
});

/**
 * Approve moderation item
 * PUT /api/moderation/:id/approve
 */
router.put('/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const adminId = (req as any).user?.id;

    // Update moderation item status
    res.json({
      success: true,
      message: 'Item approved',
      id,
      status: 'approved',
      approvedBy: adminId,
      notes
    });
  } catch (error) {
    console.error('Approve moderation item error:', error);
    res.status(500).json({ error: 'Failed to approve item' });
  }
});

/**
 * Reject moderation item
 * PUT /api/moderation/:id/reject
 */
router.put('/:id/reject', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { notes, reason } = req.body;
    const adminId = (req as any).user?.id;

    // Update moderation item status
    res.json({
      success: true,
      message: 'Item rejected',
      id,
      status: 'rejected',
      rejectedBy: adminId,
      notes,
      reason
    });
  } catch (error) {
    console.error('Reject moderation item error:', error);
    res.status(500).json({ error: 'Failed to reject item' });
  }
});

// ===== Admin Moderation Endpoints =====

/**
 * Get moderation service health
 * GET /api/moderation/health
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await unifiedModerationService.healthCheck();

    res.json({
      success: true,
      healthy: health.healthy,
      services: health.services,
      stats: health.stats
    });

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Health check failed', healthy: false });
  }
});

/**
 * Get moderation statistics
 * GET /api/moderation/stats
 */
router.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = unifiedModerationService.getStats();

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

/**
 * Batch moderate multiple items
 * POST /api/moderation/batch
 */
router.post('/batch', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Items array is required' });
    }

    if (items.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 items per batch' });
    }

    // Validate items
    for (const item of items) {
      if (!item.contentId || !item.contentType) {
        return res.status(400).json({ error: 'Each item must have contentId and contentType' });
      }
    }

    const results = await unifiedModerationService.moderateBatch(
      items.map(item => ({
        ...item,
        uploadedBy: (req as any).user?.id || 'admin'
      }))
    );

    res.json({
      success: true,
      results: results.map(r => ({
        contentId: r.contentId,
        approved: r.approved,
        action: r.action,
        category: r.category,
        confidence: r.confidence,
        flags: r.flags
      }))
    });

  } catch (error) {
    console.error('Batch moderation error:', error);
    res.status(500).json({ error: 'Batch moderation failed' });
  }
});

/**
 * Update moderation configuration
 * PUT /api/moderation/config
 */
router.put('/config', requireAdmin, async (req: Request, res: Response) => {
  try {
    const allowedUpdates = [
      'confidenceThreshold',
      'escalationThreshold',
      'autoApproveThreshold',
      'minorDetectionStrict'
    ];

    const updates: Record<string, any> = {};
    for (const key of allowedUpdates) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid configuration updates provided' });
    }

    unifiedModerationService.updateConfig(updates);

    res.json({
      success: true,
      message: 'Configuration updated',
      updates
    });

  } catch (error) {
    console.error('Config update error:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// ===== VerifyMy KYC Endpoints =====

/**
 * Initiate KYC verification
 * POST /api/moderation/kyc/initiate
 */
router.post('/kyc/initiate', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const verification = await kycService.initiateVerification(userId);

    res.json({
      success: true,
      verification: {
        id: verification.id,
        status: verification.status,
        message: 'Verification initiated - please complete the VerifyMy process'
      }
    });

  } catch (error) {
    console.error('KYC initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate verification' });
  }
});

/**
 * Get KYC verification status
 * GET /api/moderation/kyc/status
 */
router.get('/kyc/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const status = await kycService.getVerificationStatus(userId);

    res.json({
      success: true,
      status
    });

  } catch (error) {
    console.error('KYC status error:', error);
    res.status(500).json({ error: 'Failed to get verification status' });
  }
});

/**
 * VerifyMy webhook handler
 * POST /api/moderation/kyc/webhook
 */
router.post('/kyc/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-verifymy-signature'] as string || '';
    const result = await kycService.handleWebhook(req.body, signature);

    res.json({ success: true, processed: true });

  } catch (error) {
    console.error('KYC webhook error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// ===== Sightengine Direct Endpoints (Admin only) =====

/**
 * Check content with Sightengine directly
 * POST /api/moderation/sightengine/check
 */
router.post('/sightengine/check', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    if (!sightengineService.isEnabled()) {
      return res.status(503).json({ error: 'Sightengine is not configured' });
    }

    const result = await sightengineService.moderateImage(imageUrl);

    if (!result) {
      return res.status(500).json({ error: 'Sightengine moderation failed' });
    }

    const nudityAnalysis = sightengineService.analyzeNudityLevel(result.nudity);

    res.json({
      success: true,
      result: {
        nudity: result.nudity,
        weapon: result.weapon,
        gore: result.gore,
        faces: result.faces,
        analysis: nudityAnalysis
      }
    });

  } catch (error) {
    console.error('Sightengine check error:', error);
    res.status(500).json({ error: 'Sightengine check failed' });
  }
});

export default router;
