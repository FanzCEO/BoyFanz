import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireAdmin } from '../middleware/auth';

const router = Router();

// Mock data for AI Clones
const mockClones = [
  {
    id: 'clone_001',
    creatorId: 'creator_001',
    name: 'Jake AI',
    personality: 'Flirty and adventurous',
    voiceStyle: 'deep_masculine',
    knowledgeBase: ['fitness', 'travel', 'music'],
    isActive: true,
    pricePerMessage: 0.50,
    totalConversations: 1250,
    totalMessages: 15600,
    totalRevenue: 7800,
    avgRating: 4.8,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'creator_001',
      username: 'jakethunder',
      displayName: 'Jake Thunder',
      avatarUrl: 'https://cdn.fanz.website/avatars/jake.jpg'
    }
  },
  {
    id: 'clone_002',
    creatorId: 'creator_002',
    name: 'Marco Bot',
    personality: 'Mysterious and seductive',
    voiceStyle: 'smooth_latin',
    knowledgeBase: ['art', 'cooking', 'romance'],
    isActive: true,
    pricePerMessage: 0.75,
    totalConversations: 890,
    totalMessages: 12400,
    totalRevenue: 9300,
    avgRating: 4.9,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    creator: {
      id: 'creator_002',
      username: 'marcoblaze',
      displayName: 'Marco Blaze',
      avatarUrl: 'https://cdn.fanz.website/avatars/marco.jpg'
    }
  }
];

// =============================================================================
// ADMIN ROUTES - AI Clone Management
// =============================================================================

// Get all AI clones with stats
router.get('/admin', requireAdmin, async (req: Request, res: Response) => {
  try {
    res.json({ clones: mockClones });
  } catch (error) {
    console.error('Failed to fetch AI clones:', error);
    res.status(500).json({ error: 'Failed to fetch AI clones' });
  }
});

// Get AI clone analytics
router.get('/admin/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const totalStats = {
      totalClones: mockClones.length,
      activeClones: mockClones.filter(c => c.isActive).length,
      totalConversations: mockClones.reduce((sum, c) => sum + c.totalConversations, 0),
      totalMessages: mockClones.reduce((sum, c) => sum + c.totalMessages, 0),
      totalRevenue: mockClones.reduce((sum, c) => sum + c.totalRevenue, 0),
      avgRating: mockClones.reduce((sum, c) => sum + c.avgRating, 0) / mockClones.length,
    };

    res.json({
      totalStats,
      topClones: mockClones.slice(0, 10),
      recentConversations: [],
      dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() }
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Toggle AI clone status
router.put('/admin/:id/toggle', requireAdmin, async (req: Request, res: Response) => {
  try {
    const clone = mockClones.find(c => c.id === req.params.id);
    if (!clone) {
      return res.status(404).json({ error: 'Clone not found' });
    }
    clone.isActive = !clone.isActive;
    res.json({ success: true, clone });
  } catch (error) {
    console.error('Failed to toggle clone:', error);
    res.status(500).json({ error: 'Failed to toggle clone status' });
  }
});

// Update AI clone settings
router.put('/admin/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const clone = mockClones.find(c => c.id === req.params.id);
    if (!clone) {
      return res.status(404).json({ error: 'Clone not found' });
    }
    Object.assign(clone, req.body, { updatedAt: new Date().toISOString() });
    res.json({ success: true, clone });
  } catch (error) {
    console.error('Failed to update clone:', error);
    res.status(500).json({ error: 'Failed to update clone' });
  }
});

// =============================================================================
// FAN ROUTES - AI Clone Interactions
// =============================================================================

router.get('/available', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activeClones = mockClones.filter(c => c.isActive);
    res.json({ clones: activeClones });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available clones' });
  }
});

router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const clone = mockClones.find(c => c.id === req.params.id);
    if (!clone) {
      return res.status(404).json({ error: 'Clone not found' });
    }
    res.json({ clone });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clone' });
  }
});

router.post('/:id/message', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const clone = mockClones.find(c => c.id === req.params.id);
    if (!clone) {
      return res.status(404).json({ error: 'Clone not found' });
    }

    // Mock AI response
    const response = {
      id: `msg_${Date.now()}`,
      cloneId: clone.id,
      content: `Hey there! This is ${clone.name}. Thanks for your message! 💋`,
      timestamp: new Date().toISOString(),
      cost: clone.pricePerMessage
    };

    res.json({ message: response });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

export default router;
