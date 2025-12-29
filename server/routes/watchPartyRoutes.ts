import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireAdmin } from '../middleware/auth';

const router = Router();

// Mock watch party data
const mockParties = [
  {
    id: 'party_001',
    hostId: 'creator_001',
    title: 'Friday Night Movie',
    description: 'Join me for a fun movie night!',
    contentUrl: 'https://cdn.fanz.website/content/movie1.mp4',
    maxParticipants: 50,
    currentParticipants: 23,
    status: 'live',
    isPrivate: false,
    ticketPrice: 5,
    startTime: new Date().toISOString(),
    endTime: null,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    host: { id: 'creator_001', username: 'jakethunder', displayName: 'Jake Thunder' }
  },
  {
    id: 'party_002',
    hostId: 'creator_002',
    title: 'VIP Lounge Session',
    description: 'Exclusive watch party for VIP members',
    contentUrl: 'https://cdn.fanz.website/content/exclusive1.mp4',
    maxParticipants: 20,
    currentParticipants: 15,
    status: 'live',
    isPrivate: true,
    ticketPrice: 25,
    startTime: new Date().toISOString(),
    endTime: null,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    host: { id: 'creator_002', username: 'marcoblaze', displayName: 'Marco Blaze' }
  }
];

const mockCollabs = [
  {
    id: 'collab_001',
    requesterId: 'creator_001',
    targetId: 'creator_002',
    title: 'Gym Workout Collab',
    description: 'Joint workout video',
    type: 'video',
    status: 'pending',
    revenueSplit: 50,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    requester: { id: 'creator_001', username: 'jakethunder', displayName: 'Jake Thunder' },
    target: { id: 'creator_002', username: 'marcoblaze', displayName: 'Marco Blaze' }
  }
];

// =============================================================================
// ADMIN ROUTES - Watch Party Management
// =============================================================================

router.get('/admin/parties', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = {
      total: mockParties.length,
      live: mockParties.filter(p => p.status === 'live').length,
      scheduled: mockParties.filter(p => p.status === 'scheduled').length,
      totalParticipants: mockParties.reduce((sum, p) => sum + p.currentParticipants, 0),
      totalRevenue: mockParties.reduce((sum, p) => sum + (p.ticketPrice * p.currentParticipants), 0)
    };

    res.json({ parties: mockParties, stats });
  } catch (error) {
    console.error('Failed to fetch watch parties:', error);
    res.status(500).json({ error: 'Failed to fetch watch parties' });
  }
});

router.get('/admin/collabs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = {
      total: mockCollabs.length,
      pending: mockCollabs.filter(c => c.status === 'pending').length,
      active: mockCollabs.filter(c => c.status === 'active').length,
      completed: mockCollabs.filter(c => c.status === 'completed').length
    };

    res.json({ collabs: mockCollabs, stats });
  } catch (error) {
    console.error('Failed to fetch collabs:', error);
    res.status(500).json({ error: 'Failed to fetch collaborations' });
  }
});

router.put('/admin/parties/:id/end', requireAdmin, async (req: Request, res: Response) => {
  try {
    const party = mockParties.find(p => p.id === req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    party.status = 'ended';
    party.endTime = new Date().toISOString();
    res.json({ success: true, party });
  } catch (error) {
    res.status(500).json({ error: 'Failed to end party' });
  }
});

// =============================================================================
// PUBLIC/FAN ROUTES
// =============================================================================

router.get('/live', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const liveParties = mockParties.filter(p => p.status === 'live' && !p.isPrivate);
    res.json({ parties: liveParties });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch live parties' });
  }
});

router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const party = mockParties.find(p => p.id === req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }
    res.json({ party });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch party' });
  }
});

router.post('/:id/join', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const party = mockParties.find(p => p.id === req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    if (party.currentParticipants >= party.maxParticipants) {
      return res.status(400).json({ error: 'Party is full' });
    }

    party.currentParticipants += 1;
    res.json({ success: true, party });
  } catch (error) {
    res.status(500).json({ error: 'Failed to join party' });
  }
});

router.post('/:id/leave', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const party = mockParties.find(p => p.id === req.params.id);
    if (!party) {
      return res.status(404).json({ error: 'Party not found' });
    }

    party.currentParticipants = Math.max(0, party.currentParticipants - 1);
    res.json({ success: true, party });
  } catch (error) {
    res.status(500).json({ error: 'Failed to leave party' });
  }
});

// Creator routes
router.post('/create', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { title, description, contentUrl, maxParticipants, isPrivate, ticketPrice, startTime } = req.body;

    const newParty = {
      id: `party_${Date.now()}`,
      hostId: (req as any).user?.id || 'unknown',
      title,
      description,
      contentUrl,
      maxParticipants: maxParticipants || 50,
      currentParticipants: 0,
      status: 'scheduled',
      isPrivate: isPrivate || false,
      ticketPrice: ticketPrice || 0,
      startTime: startTime || new Date().toISOString(),
      endTime: null,
      createdAt: new Date().toISOString(),
      host: { id: (req as any).user?.id, username: (req as any).user?.username, displayName: (req as any).user?.displayName }
    };

    mockParties.push(newParty);
    res.json({ success: true, party: newParty });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create party' });
  }
});

export default router;
