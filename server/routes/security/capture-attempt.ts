import { Router } from 'express';
import { db } from '@/db';

const router = Router();

/**
 * Log screenshot/recording capture attempts
 */
router.post('/capture-attempt', async (req, res) => {
  try {
    const { platform, attemptNumber, timestamp, userAgent } = req.body;
    const userId = req.user?.id || null;
    
    // Log to database
    await db.captureAttempts.create({
      data: {
        platform,
        userId,
        attemptNumber,
        timestamp: new Date(timestamp),
        userAgent,
        ipAddress: req.ip,
      },
    });
    
    // Alert admins if too many attempts
    if (attemptNumber > 5) {
      console.warn(`🚨 User ${userId || 'anonymous'} has attempted ${attemptNumber} captures on ${platform}`);
      
      // TODO: Send alert to admins
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error logging capture attempt:', error);
    res.status(500).json({ error: 'Failed to log attempt' });
  }
});

export default router;
