import { Router } from 'express';
import { requireAdmin } from '@/middleware/auth';
import { db } from '@/db';

const router = Router();

// Get current theme
router.get('/theme', requireAdmin, async (req, res) => {
  try {
    const theme = await db.theme.findFirst({
      where: {
        platformId: req.headers.host?.split('.')[0] || 'default'
      }
    });
    
    if (!theme) {
      return res.status(404).json({ error: 'Theme not found' });
    }
    
    res.json(theme.config);
  } catch (error) {
    console.error('Error fetching theme:', error);
    res.status(500).json({ error: 'Failed to fetch theme' });
  }
});

// Update theme
router.put('/theme', requireAdmin, async (req, res) => {
  try {
    const platformId = req.headers.host?.split('.')[0] || 'default';
    const themeConfig = req.body;
    
    const theme = await db.theme.upsert({
      where: {
        platformId
      },
      update: {
        config: themeConfig,
        updatedAt: new Date(),
        updatedBy: req.user.id
      },
      create: {
        platformId,
        config: themeConfig,
        createdBy: req.user.id
      }
    });
    
    res.json({ success: true, theme });
  } catch (error) {
    console.error('Error saving theme:', error);
    res.status(500).json({ error: 'Failed to save theme' });
  }
});

export default router;
