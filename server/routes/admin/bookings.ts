/**
 * Booking Management Routes
 * Creator appointment and booking system
 */

import { Router } from 'express';
import { requireAdmin, isAuthenticated } from '../../middleware/auth';

const router = Router();

// Booking types
type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
type BookingType = 'video_call' | 'custom_content' | 'live_session' | 'meet_greet' | 'other';

interface Booking {
  id: string;
  creatorId: string;
  creatorName: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  type: BookingType;
  status: BookingStatus;
  scheduledAt: string;
  duration: number; // minutes
  price: number;
  notes?: string;
  clientNotes?: string;
  creatorNotes?: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  rating?: number;
  review?: string;
}

// Mock bookings data
let bookings: Booking[] = [
  {
    id: 'book_001',
    creatorId: 'creator_001',
    creatorName: 'Jake Thunder',
    clientId: 'user_123',
    clientName: 'Alex M.',
    clientAvatar: 'https://ui-avatars.com/api/?name=Alex+M',
    type: 'video_call',
    status: 'confirmed',
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    price: 75.00,
    notes: '30-min private video call',
    clientNotes: 'First time booking!',
    platform: 'boyfanz',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'book_002',
    creatorId: 'creator_002',
    creatorName: 'Marco Blaze',
    clientId: 'user_456',
    clientName: 'Chris T.',
    clientAvatar: 'https://ui-avatars.com/api/?name=Chris+T',
    type: 'custom_content',
    status: 'pending',
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 60,
    price: 150.00,
    notes: 'Custom photo set',
    clientNotes: 'Outdoor theme requested',
    platform: 'boyfanz',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'book_003',
    creatorId: 'creator_001',
    creatorName: 'Jake Thunder',
    clientId: 'user_789',
    clientName: 'Mike D.',
    clientAvatar: 'https://ui-avatars.com/api/?name=Mike+D',
    type: 'live_session',
    status: 'completed',
    scheduledAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 45,
    price: 100.00,
    notes: 'Private live stream',
    platform: 'boyfanz',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    rating: 5,
    review: 'Amazing session! Jake was great!'
  },
  {
    id: 'book_004',
    creatorId: 'creator_003',
    creatorName: 'Tyler Storm',
    clientId: 'user_321',
    clientName: 'Sam R.',
    clientAvatar: 'https://ui-avatars.com/api/?name=Sam+R',
    type: 'video_call',
    status: 'cancelled',
    scheduledAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 30,
    price: 60.00,
    notes: 'Quick chat session',
    platform: 'boyfanz',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    cancelledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    cancellationReason: 'Creator unavailable due to scheduling conflict'
  }
];

// Get all bookings (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const { status, type, creatorId, page = 1, limit = 20 } = req.query;

    let filtered = [...bookings];

    if (status) {
      filtered = filtered.filter(b => b.status === status);
    }
    if (type) {
      filtered = filtered.filter(b => b.type === type);
    }
    if (creatorId) {
      filtered = filtered.filter(b => b.creatorId === creatorId);
    }

    // Sort by scheduled date
    filtered.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());

    const total = filtered.length;
    const offset = (Number(page) - 1) * Number(limit);
    const paged = filtered.slice(offset, offset + Number(limit));

    // Stats
    const stats = {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      revenue: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + b.price, 0),
      avgRating: bookings.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) /
                 (bookings.filter(b => b.rating).length || 1)
    };

    res.json({
      success: true,
      bookings: paged,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// Get single booking
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// Create booking (for admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { creatorId, creatorName, clientId, clientName, type, scheduledAt, duration, price, notes } = req.body;

    const newBooking: Booking = {
      id: `book_${Date.now().toString(36)}`,
      creatorId,
      creatorName,
      clientId,
      clientName,
      type: type || 'video_call',
      status: 'pending',
      scheduledAt,
      duration: duration || 30,
      price: price || 0,
      notes,
      platform: 'boyfanz',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(newBooking);

    res.json({
      success: true,
      booking: newBooking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking status
router.put('/:id/status', requireAdmin, async (req, res) => {
  try {
    const { status, reason } = req.body;
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    if (status === 'cancelled') {
      booking.cancelledAt = new Date().toISOString();
      booking.cancellationReason = reason;
    } else if (status === 'completed') {
      booking.completedAt = new Date().toISOString();
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: 'Failed to update booking status' });
  }
});

// Bulk update bookings
router.put('/bulk/status', requireAdmin, async (req, res) => {
  try {
    const { ids, status, reason } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'No booking IDs provided' });
    }

    const updated: Booking[] = [];

    for (const id of ids) {
      const booking = bookings.find(b => b.id === id);
      if (booking) {
        booking.status = status;
        booking.updatedAt = new Date().toISOString();

        if (status === 'cancelled') {
          booking.cancelledAt = new Date().toISOString();
          booking.cancellationReason = reason;
        } else if (status === 'completed') {
          booking.completedAt = new Date().toISOString();
        }

        updated.push(booking);
      }
    }

    res.json({
      success: true,
      updated: updated.length,
      bookings: updated
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ error: 'Failed to bulk update bookings' });
  }
});

// Reschedule booking
router.put('/:id/reschedule', requireAdmin, async (req, res) => {
  try {
    const { scheduledAt, duration, notes } = req.body;
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.scheduledAt = scheduledAt || booking.scheduledAt;
    booking.duration = duration || booking.duration;
    if (notes) booking.creatorNotes = notes;
    booking.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Reschedule booking error:', error);
    res.status(500).json({ error: 'Failed to reschedule booking' });
  }
});

// Add review/rating (client endpoint)
router.put('/:id/review', isAuthenticated, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const booking = bookings.find(b => b.id === req.params.id);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'completed') {
      return res.status(400).json({ error: 'Can only review completed bookings' });
    }

    booking.rating = rating;
    booking.review = review;
    booking.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Get calendar data (for calendar view)
router.get('/calendar/data', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, creatorId } = req.query;

    let filtered = [...bookings];

    if (startDate) {
      filtered = filtered.filter(b => new Date(b.scheduledAt) >= new Date(startDate as string));
    }
    if (endDate) {
      filtered = filtered.filter(b => new Date(b.scheduledAt) <= new Date(endDate as string));
    }
    if (creatorId) {
      filtered = filtered.filter(b => b.creatorId === creatorId);
    }

    // Transform for calendar
    const events = filtered.map(b => ({
      id: b.id,
      title: `${b.clientName} - ${b.type.replace('_', ' ')}`,
      start: b.scheduledAt,
      end: new Date(new Date(b.scheduledAt).getTime() + b.duration * 60000).toISOString(),
      status: b.status,
      type: b.type,
      creator: b.creatorName,
      price: b.price
    }));

    res.json({
      success: true,
      events
    });
  } catch (error) {
    console.error('Get calendar data error:', error);
    res.status(500).json({ error: 'Failed to get calendar data' });
  }
});

// Get creator availability
router.get('/availability/:creatorId', async (req, res) => {
  try {
    // Mock availability - in production from database
    const availability = {
      creatorId: req.params.creatorId,
      timezone: 'America/New_York',
      slots: [
        { day: 'monday', start: '10:00', end: '18:00', enabled: true },
        { day: 'tuesday', start: '10:00', end: '18:00', enabled: true },
        { day: 'wednesday', start: '10:00', end: '18:00', enabled: true },
        { day: 'thursday', start: '10:00', end: '18:00', enabled: true },
        { day: 'friday', start: '10:00', end: '16:00', enabled: true },
        { day: 'saturday', start: '12:00', end: '16:00', enabled: true },
        { day: 'sunday', start: '12:00', end: '16:00', enabled: false }
      ],
      bufferMinutes: 15,
      maxAdvanceDays: 30,
      minAdvanceHours: 24
    };

    res.json({
      success: true,
      availability
    });
  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// Delete booking
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const index = bookings.findIndex(b => b.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(index, 1);

    res.json({
      success: true,
      message: 'Booking deleted'
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;
