/**
 * Streaming & Upload Routes
 * API endpoints for optimized uploads, live streaming, and Lovense integration
 */

import { Router, Request, Response } from 'express';
import { optimizedUploadService } from '../services/optimizedUploadService';
import { liveStreamingService } from '../services/liveStreamingService';
import { lovenseService } from '../services/lovenseService';
import { logger } from '../logger';

const router = Router();

// Middleware to check authentication
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// Middleware to check creator status
const isCreator = (req: Request, res: Response, next: Function) => {
  if (!req.user?.isCreator) {
    return res.status(403).json({ error: 'Creator access required' });
  }
  next();
};

// ============================================
// OPTIMIZED UPLOAD ENDPOINTS
// ============================================

/**
 * Initialize chunked upload session
 */
router.post('/api/upload/init', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { filename, mimeType, totalSize, metadata } = req.body;

    if (!filename || !mimeType || !totalSize) {
      return res.status(400).json({ error: 'filename, mimeType, and totalSize are required' });
    }

    const result = await optimizedUploadService.initializeUpload({
      userId: req.user!.id,
      filename,
      mimeType,
      totalSize,
      metadata
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Upload init failed:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Upload a chunk
 */
router.post('/api/upload/chunk/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const chunkIndex = parseInt(req.headers['x-chunk-index'] as string);

    if (isNaN(chunkIndex)) {
      return res.status(400).json({ error: 'X-Chunk-Index header required' });
    }

    // Collect raw body data
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const chunkData = Buffer.concat(chunks);

    const result = await optimizedUploadService.uploadChunk(sessionId, chunkIndex, chunkData);
    res.json(result);
  } catch (error: any) {
    logger.error('Chunk upload failed:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get upload status
 */
router.get('/api/upload/status/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const status = optimizedUploadService.getUploadStatus(req.params.sessionId);
    if (!status) {
      return res.status(404).json({ error: 'Upload session not found' });
    }
    res.json(status);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Resume interrupted upload
 */
router.post('/api/upload/resume/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await optimizedUploadService.resumeUpload(req.params.sessionId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Cancel upload
 */
router.delete('/api/upload/:sessionId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const success = optimizedUploadService.cancelUpload(req.params.sessionId);
    res.json({ success });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// LIVE STREAMING ENDPOINTS
// ============================================

/**
 * Create a new stream
 */
router.post('/api/stream/create', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const { title, description, category, tags, isPrivate, isPPV, ppvPrice, enableLovense } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await liveStreamingService.createStream({
      creatorId: req.user!.id,
      creatorUsername: req.user!.username || 'Creator',
      title,
      description,
      category,
      tags,
      isPrivate,
      isPPV,
      ppvPrice,
      enableLovense
    });

    res.json(result);
  } catch (error: any) {
    logger.error('Stream creation failed:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Start streaming (go live)
 */
router.post('/api/stream/:streamId/start', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const stream = liveStreamingService.getStream(req.params.streamId);
    if (!stream || stream.creatorId !== req.user!.id) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    await liveStreamingService.startStream(req.params.streamId);
    res.json({ success: true, status: 'live' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * End stream
 */
router.post('/api/stream/:streamId/end', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const stream = liveStreamingService.getStream(req.params.streamId);
    if (!stream || stream.creatorId !== req.user!.id) {
      return res.status(404).json({ error: 'Stream not found' });
    }

    const analytics = await liveStreamingService.endStream(req.params.streamId);
    res.json({ success: true, analytics });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Join stream as viewer
 */
router.post('/api/stream/:streamId/join', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const result = await liveStreamingService.joinStream(req.params.streamId, {
      oderId: req.user!.id,
      username: req.user!.username || 'Viewer',
      isSubscriber: req.user!.isSubscriber,
      isVIP: req.user!.isVIP
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Leave stream
 */
router.post('/api/stream/:streamId/leave', isAuthenticated, async (req: Request, res: Response) => {
  try {
    await liveStreamingService.leaveStream(req.params.streamId, req.user!.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get stream info
 */
router.get('/api/stream/:streamId', async (req: Request, res: Response) => {
  try {
    const stream = liveStreamingService.getStream(req.params.streamId);
    if (!stream) {
      return res.status(404).json({ error: 'Stream not found' });
    }
    res.json(stream);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get live streams list
 */
router.get('/api/streams/live', async (req: Request, res: Response) => {
  try {
    const { category, limit, offset, sortBy } = req.query;
    const streams = liveStreamingService.getLiveStreams({
      category: category as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
      sortBy: sortBy as 'viewers' | 'tips' | 'recent'
    });
    res.json({ streams, total: streams.length });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Send tip to stream
 */
router.post('/api/stream/:streamId/tip', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { amount, message, isAnonymous, lovenseIntensity, lovenseDuration, lovensePattern } = req.body;

    if (!amount || amount < 1) {
      return res.status(400).json({ error: 'Valid tip amount required' });
    }

    const tip = await liveStreamingService.sendTip(req.params.streamId, {
      senderId: req.user!.id,
      senderUsername: req.user!.username || 'Viewer',
      amount,
      message,
      isAnonymous,
      lovenseIntensity,
      lovenseDuration,
      lovensePattern
    });

    res.json({ success: true, tip });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Send chat message
 */
router.post('/api/stream/:streamId/chat', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Message content required' });
    }

    const message = await liveStreamingService.sendChatMessage(req.params.streamId, {
      senderId: req.user!.id,
      senderUsername: req.user!.username || 'Viewer',
      content
    });

    res.json({ success: true, message });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// LOVENSE INTEGRATION ENDPOINTS
// ============================================

/**
 * Get Lovense QR code for pairing
 */
router.get('/api/lovense/qr', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const result = await lovenseService.generateQRCode(
      req.user!.id,
      req.user!.username || 'Creator'
    );
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Lovense callback URL (called by Lovense servers)
 */
router.post('/api/lovense/callback', async (req: Request, res: Response) => {
  try {
    await lovenseService.handleCallback(req.body);
    res.json({ success: true });
  } catch (error: any) {
    logger.error('Lovense callback failed:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Check Lovense connection status
 */
router.get('/api/lovense/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const connected = lovenseService.isConnected(req.user!.id);
    const toys = lovenseService.getConnectedToys(req.user!.id);
    res.json({ connected, toys });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get tip actions configuration
 */
router.get('/api/lovense/tip-actions', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const actions = lovenseService.getTipActions(req.user!.id);
    res.json({ actions });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Set custom tip actions
 */
router.post('/api/lovense/tip-actions', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const { actions } = req.body;
    if (!Array.isArray(actions)) {
      return res.status(400).json({ error: 'actions array required' });
    }
    lovenseService.setTipActions(req.user!.id, actions);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Test Lovense vibration
 */
router.post('/api/lovense/test', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const { intensity = 10, duration = 3, toyId } = req.body;
    const result = await lovenseService.vibrate(req.user!.id, intensity, duration, toyId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Stop all Lovense toys
 */
router.post('/api/lovense/stop', isAuthenticated, isCreator, async (req: Request, res: Response) => {
  try {
    const result = await lovenseService.stop(req.user!.id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Lovense service stats (admin only)
 */
router.get('/api/lovense/stats', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const stats = lovenseService.getStats();
    res.json(stats);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============================================
// SERVICE HEALTH & STATS
// ============================================

router.get('/api/streaming/health', (req: Request, res: Response) => {
  res.json({
    upload: { status: 'ok', stats: optimizedUploadService.getStats() },
    streaming: { status: 'ok', liveStreams: liveStreamingService.getLiveStreams().length },
    lovense: { status: lovenseService.isReady() ? 'ok' : 'not_configured', stats: lovenseService.getStats() }
  });
});

export default router;
