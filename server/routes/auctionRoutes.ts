import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, requireAdmin } from '../middleware/auth';

const router = Router();

// Mock auction data
const mockAuctions = [
  {
    id: 'auction_001',
    creatorId: 'creator_001',
    title: 'Private Video Call (30 min)',
    description: 'One-on-one video call with Jake',
    type: 'experience',
    startingBid: 50,
    currentBid: 250,
    bidCount: 12,
    status: 'active',
    startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    winnerId: null,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    creator: { id: 'creator_001', username: 'jakethunder', displayName: 'Jake Thunder' }
  },
  {
    id: 'auction_002',
    creatorId: 'creator_002',
    title: 'Custom Photo Set',
    description: '10 exclusive photos just for you',
    type: 'content',
    startingBid: 25,
    currentBid: 85,
    bidCount: 8,
    status: 'active',
    startTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    winnerId: null,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    creator: { id: 'creator_002', username: 'marcoblaze', displayName: 'Marco Blaze' }
  }
];

const mockTipGoals = [
  {
    id: 'goal_001',
    creatorId: 'creator_001',
    title: 'Pool Party Stream',
    description: 'Help me reach this goal for a special pool party live stream!',
    targetAmount: 1000,
    currentAmount: 650,
    contributorCount: 45,
    status: 'active',
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    creator: { id: 'creator_001', username: 'jakethunder', displayName: 'Jake Thunder' }
  }
];

// =============================================================================
// ADMIN ROUTES - Auction Management
// =============================================================================

router.get('/admin/auctions', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    let auctions = [...mockAuctions];
    if (status) {
      auctions = auctions.filter(a => a.status === status);
    }

    const stats = {
      total: mockAuctions.length,
      active: mockAuctions.filter(a => a.status === 'active').length,
      completed: mockAuctions.filter(a => a.status === 'completed').length,
      totalBids: mockAuctions.reduce((sum, a) => sum + a.bidCount, 0),
      totalValue: mockAuctions.reduce((sum, a) => sum + a.currentBid, 0)
    };

    res.json({ auctions, stats });
  } catch (error) {
    console.error('Failed to fetch auctions:', error);
    res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

router.get('/admin/tip-goals', requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = {
      total: mockTipGoals.length,
      active: mockTipGoals.filter(g => g.status === 'active').length,
      completed: mockTipGoals.filter(g => g.status === 'completed').length,
      totalRaised: mockTipGoals.reduce((sum, g) => sum + g.currentAmount, 0)
    };

    res.json({ tipGoals: mockTipGoals, stats });
  } catch (error) {
    console.error('Failed to fetch tip goals:', error);
    res.status(500).json({ error: 'Failed to fetch tip goals' });
  }
});

router.put('/admin/auctions/:id/cancel', requireAdmin, async (req: Request, res: Response) => {
  try {
    const auction = mockAuctions.find(a => a.id === req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    auction.status = 'cancelled';
    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel auction' });
  }
});

// =============================================================================
// PUBLIC/FAN ROUTES
// =============================================================================

router.get('/active', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activeAuctions = mockAuctions.filter(a => a.status === 'active');
    res.json({ auctions: activeAuctions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active auctions' });
  }
});

router.get('/goals', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const activeGoals = mockTipGoals.filter(g => g.status === 'active');
    res.json({ tipGoals: activeGoals });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tip goals' });
  }
});

router.get('/:id', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const auction = mockAuctions.find(a => a.id === req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    res.json({ auction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

router.post('/:id/bid', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const auction = mockAuctions.find(a => a.id === req.params.id);
    if (!auction) {
      return res.status(404).json({ error: 'Auction not found' });
    }

    const { amount } = req.body;
    if (amount <= auction.currentBid) {
      return res.status(400).json({ error: 'Bid must be higher than current bid' });
    }

    auction.currentBid = amount;
    auction.bidCount += 1;

    res.json({ success: true, auction });
  } catch (error) {
    res.status(500).json({ error: 'Failed to place bid' });
  }
});

router.post('/goals/:id/contribute', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const goal = mockTipGoals.find(g => g.id === req.params.id);
    if (!goal) {
      return res.status(404).json({ error: 'Tip goal not found' });
    }

    const { amount } = req.body;
    goal.currentAmount += amount;
    goal.contributorCount += 1;

    if (goal.currentAmount >= goal.targetAmount) {
      goal.status = 'completed';
    }

    res.json({ success: true, tipGoal: goal });
  } catch (error) {
    res.status(500).json({ error: 'Failed to contribute' });
  }
});

export default router;
