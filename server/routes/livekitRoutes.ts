/**
 * LiveKit Routes for BoyFanz
 * API endpoints for real-time video/audio streaming
 */

import { Router, Request, Response } from 'express';
import { livekitService } from '../services/livekitService';

const router = Router();

/**
 * GET /api/livekit/health
 * Check LiveKit service health
 */
router.get('/health', async (_req: Request, res: Response) => {
  try {
    const health = await livekitService.health();
    res.json({ success: true, ...health });
  } catch (error: any) {
    console.error('[LiveKit] Health check failed:', error);
    res.status(503).json({
      success: false,
      error: 'LiveKit service unavailable',
      details: error.message
    });
  }
});

/**
 * POST /api/livekit/livestream
 * Create a new livestream for the authenticated creator
 */
router.post('/livestream', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }

    const livestream = await livekitService.createLivestream({
      creatorId: user.id.toString(),
      title,
      description,
    });

    res.json({
      success: true,
      ...livestream
    });
  } catch (error: any) {
    console.error('[LiveKit] Create livestream failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create livestream',
      details: error.message
    });
  }
});

/**
 * POST /api/livekit/video-call
 * Create a video call between the authenticated user and another user
 */
router.post('/video-call', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { calleeId } = req.body;
    if (!calleeId) {
      return res.status(400).json({ success: false, error: 'Callee ID is required' });
    }

    const videoCall = await livekitService.createVideoCall({
      callerId: user.id.toString(),
      calleeId: calleeId.toString(),
    });

    res.json({
      success: true,
      ...videoCall
    });
  } catch (error: any) {
    console.error('[LiveKit] Create video call failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create video call',
      details: error.message
    });
  }
});

/**
 * GET /api/livekit/viewer-token
 * Get a viewer token for watching a livestream
 */
router.get('/viewer-token', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { room_name } = req.query;
    if (!room_name || typeof room_name !== 'string') {
      return res.status(400).json({ success: false, error: 'Room name is required' });
    }

    const viewerToken = await livekitService.getViewerToken({
      roomName: room_name,
      viewerId: user.id.toString(),
      viewerName: user.displayName || user.username || 'Viewer',
    });

    res.json({
      success: true,
      ...viewerToken
    });
  } catch (error: any) {
    console.error('[LiveKit] Get viewer token failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get viewer token',
      details: error.message
    });
  }
});

/**
 * GET /api/livekit/rooms
 * List all active rooms (admin only)
 */
router.get('/rooms', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    // Check admin status
    const isAdmin = user.isAdmin || user.isSuperAdmin;
    if (!isAdmin) {
      return res.status(403).json({ success: false, error: 'Admin access required' });
    }

    const rooms = await livekitService.listRooms();
    res.json({ success: true, ...rooms });
  } catch (error: any) {
    console.error('[LiveKit] List rooms failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list rooms',
      details: error.message
    });
  }
});

/**
 * GET /api/livekit/rooms/:roomName
 * Get room details
 */
router.get('/rooms/:roomName', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const room = await livekitService.getRoom(roomName);
    res.json({ success: true, ...room });
  } catch (error: any) {
    console.error('[LiveKit] Get room failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get room',
      details: error.message
    });
  }
});

/**
 * DELETE /api/livekit/rooms/:roomName
 * End/delete a room (creator or admin only)
 */
router.delete('/rooms/:roomName', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { roomName } = req.params;

    // Get room to check ownership
    const roomData = await livekitService.getRoom(roomName);
    const metadata = JSON.parse(roomData.room?.metadata || '{}');

    // Check if user is owner or admin
    const isOwner = metadata.creator_id === user.id.toString();
    const isAdmin = user.isAdmin || user.isSuperAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to delete this room' });
    }

    const result = await livekitService.deleteRoom(roomName);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[LiveKit] Delete room failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete room',
      details: error.message
    });
  }
});

/**
 * GET /api/livekit/rooms/:roomName/participants
 * Get room participants
 */
router.get('/rooms/:roomName/participants', async (req: Request, res: Response) => {
  try {
    const { roomName } = req.params;
    const participants = await livekitService.getRoomParticipants(roomName);
    res.json({ success: true, ...participants });
  } catch (error: any) {
    console.error('[LiveKit] Get participants failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get participants',
      details: error.message
    });
  }
});

/**
 * DELETE /api/livekit/rooms/:roomName/participants/:identity
 * Remove a participant from a room (creator or admin only)
 */
router.delete('/rooms/:roomName/participants/:identity', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { roomName, identity } = req.params;

    // Get room to check ownership
    const roomData = await livekitService.getRoom(roomName);
    const metadata = JSON.parse(roomData.room?.metadata || '{}');

    // Check if user is owner or admin
    const isOwner = metadata.creator_id === user.id.toString();
    const isAdmin = user.isAdmin || user.isSuperAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to remove participants' });
    }

    const result = await livekitService.removeParticipant(roomName, identity);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[LiveKit] Remove participant failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove participant',
      details: error.message
    });
  }
});

/**
 * POST /api/livekit/rooms/:roomName/record
 * Start recording a room (creator or admin only)
 */
router.post('/rooms/:roomName/record', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { roomName } = req.params;

    // Get room to check ownership
    const roomData = await livekitService.getRoom(roomName);
    const metadata = JSON.parse(roomData.room?.metadata || '{}');

    // Check if user is owner or admin
    const isOwner = metadata.creator_id === user.id.toString();
    const isAdmin = user.isAdmin || user.isSuperAdmin;

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, error: 'Not authorized to record this room' });
    }

    const result = await livekitService.startRecording(roomName);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[LiveKit] Start recording failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start recording',
      details: error.message
    });
  }
});

/**
 * DELETE /api/livekit/egress/:egressId
 * Stop a recording
 */
router.delete('/egress/:egressId', async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    const { egressId } = req.params;
    const result = await livekitService.stopRecording(egressId);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[LiveKit] Stop recording failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop recording',
      details: error.message
    });
  }
});

/**
 * GET /api/livekit/active-streams
 * Get all active livestreams for the explore page
 */
router.get('/active-streams', async (_req: Request, res: Response) => {
  try {
    const roomsData = await livekitService.listRooms();

    // Filter for active livestreams only
    const activeStreams = roomsData.rooms
      .filter(room => {
        const metadata = JSON.parse(room.metadata || '{}');
        return metadata.room_type === 'livestream' && room.num_participants > 0;
      })
      .map(room => {
        const metadata = JSON.parse(room.metadata || '{}');
        return {
          roomName: room.name,
          title: metadata.title || 'Untitled Stream',
          creatorId: metadata.creator_id,
          viewerCount: room.num_participants - 1, // Exclude the creator
          startedAt: metadata.started_at,
          platform: metadata.platform,
        };
      });

    res.json({
      success: true,
      streams: activeStreams,
      count: activeStreams.length
    });
  } catch (error: any) {
    console.error('[LiveKit] Get active streams failed:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get active streams',
      details: error.message
    });
  }
});

export default router;
