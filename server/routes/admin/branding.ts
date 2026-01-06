/**
 * Branding Management Routes
 * Manage platform branding assets (logo, favicon, hero images)
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';
import multer from 'multer';

const router = Router();

// Configure multer for image uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Mock branding data - in production from database
let platformBranding = {
  id: 'branding_boyfanz',
  platformId: 'boyfanz',
  logo: {
    url: 'https://cdn.fanz.website/branding/boyfanz/logo.png',
    width: 200,
    height: 60,
    format: 'png',
    updatedAt: new Date().toISOString()
  },
  favicon: {
    url: 'https://cdn.fanz.website/branding/boyfanz/favicon.ico',
    size: 32,
    format: 'ico',
    updatedAt: new Date().toISOString()
  },
  heroImage: {
    url: 'https://cdn.fanz.website/branding/boyfanz/hero.jpg',
    width: 1920,
    height: 600,
    format: 'jpg',
    updatedAt: new Date().toISOString()
  },
  ogImage: {
    url: 'https://cdn.fanz.website/branding/boyfanz/og-image.jpg',
    width: 1200,
    height: 630,
    format: 'jpg',
    updatedAt: new Date().toISOString()
  },
  watermark: {
    url: 'https://cdn.fanz.website/branding/boyfanz/watermark.png',
    opacity: 0.3,
    position: 'bottom-right',
    enabled: true,
    updatedAt: new Date().toISOString()
  },
  colors: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#0f0f23',
    surface: '#1a1a2e'
  },
  fonts: {
    heading: 'Inter',
    body: 'Inter'
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
};

// Get current branding
router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      branding: platformBranding
    });
  } catch (error) {
    console.error('Get branding error:', error);
    res.status(500).json({ error: 'Failed to get branding' });
  }
});

// Update branding colors
router.put('/colors', requireAdmin, async (req, res) => {
  try {
    const { primary, secondary, accent, background, surface } = req.body;

    platformBranding.colors = {
      primary: primary || platformBranding.colors.primary,
      secondary: secondary || platformBranding.colors.secondary,
      accent: accent || platformBranding.colors.accent,
      background: background || platformBranding.colors.background,
      surface: surface || platformBranding.colors.surface
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      colors: platformBranding.colors
    });
  } catch (error) {
    console.error('Update colors error:', error);
    res.status(500).json({ error: 'Failed to update colors' });
  }
});

// Update fonts
router.put('/fonts', requireAdmin, async (req, res) => {
  try {
    const { heading, body } = req.body;

    platformBranding.fonts = {
      heading: heading || platformBranding.fonts.heading,
      body: body || platformBranding.fonts.body
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      fonts: platformBranding.fonts
    });
  } catch (error) {
    console.error('Update fonts error:', error);
    res.status(500).json({ error: 'Failed to update fonts' });
  }
});

// Upload logo
router.post('/logo', requireAdmin, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // In production: upload to CDN, get URL
    const newUrl = `https://cdn.fanz.website/branding/boyfanz/logo-${Date.now()}.png`;

    platformBranding.logo = {
      url: newUrl,
      width: 200,
      height: 60,
      format: req.file.mimetype.split('/')[1] || 'png',
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      logo: platformBranding.logo
    });
  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Upload favicon
router.post('/favicon', requireAdmin, upload.single('favicon'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newUrl = `https://cdn.fanz.website/branding/boyfanz/favicon-${Date.now()}.ico`;

    platformBranding.favicon = {
      url: newUrl,
      size: 32,
      format: 'ico',
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      favicon: platformBranding.favicon
    });
  } catch (error) {
    console.error('Upload favicon error:', error);
    res.status(500).json({ error: 'Failed to upload favicon' });
  }
});

// Upload hero image
router.post('/hero', requireAdmin, upload.single('hero'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newUrl = `https://cdn.fanz.website/branding/boyfanz/hero-${Date.now()}.jpg`;

    platformBranding.heroImage = {
      url: newUrl,
      width: 1920,
      height: 600,
      format: req.file.mimetype.split('/')[1] || 'jpg',
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      heroImage: platformBranding.heroImage
    });
  } catch (error) {
    console.error('Upload hero error:', error);
    res.status(500).json({ error: 'Failed to upload hero image' });
  }
});

// Upload OG image
router.post('/og-image', requireAdmin, upload.single('ogImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newUrl = `https://cdn.fanz.website/branding/boyfanz/og-${Date.now()}.jpg`;

    platformBranding.ogImage = {
      url: newUrl,
      width: 1200,
      height: 630,
      format: req.file.mimetype.split('/')[1] || 'jpg',
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      ogImage: platformBranding.ogImage
    });
  } catch (error) {
    console.error('Upload OG image error:', error);
    res.status(500).json({ error: 'Failed to upload OG image' });
  }
});

// Update watermark settings
router.put('/watermark', requireAdmin, async (req, res) => {
  try {
    const { opacity, position, enabled } = req.body;

    platformBranding.watermark = {
      ...platformBranding.watermark,
      opacity: opacity ?? platformBranding.watermark.opacity,
      position: position || platformBranding.watermark.position,
      enabled: enabled ?? platformBranding.watermark.enabled,
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      watermark: platformBranding.watermark
    });
  } catch (error) {
    console.error('Update watermark error:', error);
    res.status(500).json({ error: 'Failed to update watermark' });
  }
});

// Upload watermark image
router.post('/watermark/image', requireAdmin, upload.single('watermark'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const newUrl = `https://cdn.fanz.website/branding/boyfanz/watermark-${Date.now()}.png`;

    platformBranding.watermark = {
      ...platformBranding.watermark,
      url: newUrl,
      updatedAt: new Date().toISOString()
    };
    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      watermark: platformBranding.watermark
    });
  } catch (error) {
    console.error('Upload watermark error:', error);
    res.status(500).json({ error: 'Failed to upload watermark' });
  }
});

// Reset to defaults
router.post('/reset', requireAdmin, async (req, res) => {
  try {
    const { asset } = req.body;

    // Reset specific asset or all
    if (asset === 'colors') {
      platformBranding.colors = {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        accent: '#ec4899',
        background: '#0f0f23',
        surface: '#1a1a2e'
      };
    } else if (asset === 'fonts') {
      platformBranding.fonts = {
        heading: 'Inter',
        body: 'Inter'
      };
    }

    platformBranding.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      branding: platformBranding
    });
  } catch (error) {
    console.error('Reset branding error:', error);
    res.status(500).json({ error: 'Failed to reset branding' });
  }
});

export default router;
