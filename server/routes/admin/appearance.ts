/**
 * Site Appearance Routes
 * Platform appearance and content settings
 */

import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth';

const router = Router();

// Site settings data - in production from database
let siteSettings = {
  id: 'settings_boyfanz',
  platformId: 'boyfanz',

  // Basic Info
  tagline: 'The Premier Platform for Male Content Creators',
  description: 'BoyFanz is where top male creators share exclusive content with their biggest fans. Join thousands of subscribers enjoying premium access to your favorite creators.',

  // SEO
  seo: {
    metaTitle: 'BoyFanz - Exclusive Male Creator Content',
    metaDescription: 'Subscribe to your favorite male creators on BoyFanz. Access exclusive photos, videos, live streams and direct messaging.',
    keywords: ['male creators', 'exclusive content', 'subscription', 'adult content', 'live streams'],
    ogType: 'website'
  },

  // Featured Reviews
  featuredReviews: [
    {
      id: 'review_001',
      author: 'Alex M.',
      avatar: 'https://ui-avatars.com/api/?name=Alex+M',
      rating: 5,
      text: 'Best platform for connecting with amazing creators. The content is top-notch!',
      creatorName: 'Jake Thunder',
      verified: true,
      featured: true
    },
    {
      id: 'review_002',
      author: 'Chris T.',
      avatar: 'https://ui-avatars.com/api/?name=Chris+T',
      rating: 5,
      text: 'Love the exclusive live streams and the DM feature. Worth every penny!',
      creatorName: 'Marco Blaze',
      verified: true,
      featured: true
    },
    {
      id: 'review_003',
      author: 'Sam R.',
      avatar: 'https://ui-avatars.com/api/?name=Sam+R',
      rating: 4,
      text: 'Great variety of creators. Easy to find exactly what you\'re looking for.',
      creatorName: 'Tyler Storm',
      verified: true,
      featured: true
    }
  ],

  // Homepage Sections
  homepageSections: [
    { id: 'hero', name: 'Hero Banner', enabled: true, order: 1 },
    { id: 'featured_creators', name: 'Featured Creators', enabled: true, order: 2 },
    { id: 'trending', name: 'Trending Now', enabled: true, order: 3 },
    { id: 'categories', name: 'Browse Categories', enabled: true, order: 4 },
    { id: 'new_creators', name: 'New Creators', enabled: true, order: 5 },
    { id: 'live_now', name: 'Live Now', enabled: true, order: 6 },
    { id: 'reviews', name: 'Fan Reviews', enabled: true, order: 7 },
    { id: 'cta', name: 'Call to Action', enabled: true, order: 8 }
  ],

  // Social Links
  socialLinks: {
    twitter: 'https://twitter.com/boyfanz',
    instagram: 'https://instagram.com/boyfanz',
    tiktok: '',
    discord: 'https://discord.gg/boyfanz',
    telegram: ''
  },

  // Footer Settings
  footer: {
    copyrightText: ' 2025 BoyFanz. All rights reserved.',
    showSocialLinks: true,
    showNewsletter: true,
    additionalLinks: [
      { label: 'Creator Program', url: '/creators/apply' },
      { label: 'Affiliate Program', url: '/affiliates' },
      { label: 'Blog', url: '/blog' }
    ]
  },

  // Maintenance Mode
  maintenance: {
    enabled: false,
    message: 'We\'re currently performing scheduled maintenance. We\'ll be back shortly!',
    allowedIPs: ['127.0.0.1']
  },

  // Feature Flags
  features: {
    showLiveIndicator: true,
    showOnlineStatus: true,
    enableDarkMode: true,
    showVerifiedBadges: true,
    enableNotifications: true,
    showPriceInFeed: true,
    allowGuestBrowsing: true
  },

  updatedAt: new Date().toISOString(),
  updatedBy: 'admin'
};

// Get all site settings
router.get('/', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      settings: siteSettings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to get settings' });
  }
});

// Update basic info
router.put('/basic', requireAdmin, async (req, res) => {
  try {
    const { tagline, description } = req.body;

    siteSettings.tagline = tagline || siteSettings.tagline;
    siteSettings.description = description || siteSettings.description;
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      tagline: siteSettings.tagline,
      description: siteSettings.description
    });
  } catch (error) {
    console.error('Update basic info error:', error);
    res.status(500).json({ error: 'Failed to update basic info' });
  }
});

// Update SEO settings
router.put('/seo', requireAdmin, async (req, res) => {
  try {
    const { metaTitle, metaDescription, keywords, ogType } = req.body;

    siteSettings.seo = {
      metaTitle: metaTitle || siteSettings.seo.metaTitle,
      metaDescription: metaDescription || siteSettings.seo.metaDescription,
      keywords: keywords || siteSettings.seo.keywords,
      ogType: ogType || siteSettings.seo.ogType
    };
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      seo: siteSettings.seo
    });
  } catch (error) {
    console.error('Update SEO error:', error);
    res.status(500).json({ error: 'Failed to update SEO settings' });
  }
});

// Get featured reviews
router.get('/reviews', requireAdmin, async (req, res) => {
  try {
    res.json({
      success: true,
      reviews: siteSettings.featuredReviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Failed to get reviews' });
  }
});

// Add featured review
router.post('/reviews', requireAdmin, async (req, res) => {
  try {
    const { author, avatar, rating, text, creatorName, verified } = req.body;

    const newReview = {
      id: `review_${Date.now().toString(36)}`,
      author,
      avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(author)}`,
      rating: rating || 5,
      text,
      creatorName,
      verified: verified ?? true,
      featured: true
    };

    siteSettings.featuredReviews.push(newReview);
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      review: newReview
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

// Update featured review
router.put('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const review = siteSettings.featuredReviews.find(r => r.id === req.params.id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const { author, avatar, rating, text, creatorName, verified, featured } = req.body;

    review.author = author || review.author;
    review.avatar = avatar || review.avatar;
    review.rating = rating ?? review.rating;
    review.text = text || review.text;
    review.creatorName = creatorName || review.creatorName;
    review.verified = verified ?? review.verified;
    review.featured = featured ?? review.featured;

    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete featured review
router.delete('/reviews/:id', requireAdmin, async (req, res) => {
  try {
    const index = siteSettings.featuredReviews.findIndex(r => r.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: 'Review not found' });
    }

    siteSettings.featuredReviews.splice(index, 1);
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: 'Review deleted'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// Update homepage sections order
router.put('/sections', requireAdmin, async (req, res) => {
  try {
    const { sections } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'Invalid sections data' });
    }

    siteSettings.homepageSections = sections;
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      sections: siteSettings.homepageSections
    });
  } catch (error) {
    console.error('Update sections error:', error);
    res.status(500).json({ error: 'Failed to update sections' });
  }
});

// Toggle section visibility
router.put('/sections/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const section = siteSettings.homepageSections.find(s => s.id === req.params.id);

    if (!section) {
      return res.status(404).json({ error: 'Section not found' });
    }

    section.enabled = !section.enabled;
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      section
    });
  } catch (error) {
    console.error('Toggle section error:', error);
    res.status(500).json({ error: 'Failed to toggle section' });
  }
});

// Update social links
router.put('/social', requireAdmin, async (req, res) => {
  try {
    const { twitter, instagram, tiktok, discord, telegram } = req.body;

    siteSettings.socialLinks = {
      twitter: twitter ?? siteSettings.socialLinks.twitter,
      instagram: instagram ?? siteSettings.socialLinks.instagram,
      tiktok: tiktok ?? siteSettings.socialLinks.tiktok,
      discord: discord ?? siteSettings.socialLinks.discord,
      telegram: telegram ?? siteSettings.socialLinks.telegram
    };
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      socialLinks: siteSettings.socialLinks
    });
  } catch (error) {
    console.error('Update social links error:', error);
    res.status(500).json({ error: 'Failed to update social links' });
  }
});

// Update footer settings
router.put('/footer', requireAdmin, async (req, res) => {
  try {
    const { copyrightText, showSocialLinks, showNewsletter, additionalLinks } = req.body;

    siteSettings.footer = {
      copyrightText: copyrightText || siteSettings.footer.copyrightText,
      showSocialLinks: showSocialLinks ?? siteSettings.footer.showSocialLinks,
      showNewsletter: showNewsletter ?? siteSettings.footer.showNewsletter,
      additionalLinks: additionalLinks || siteSettings.footer.additionalLinks
    };
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      footer: siteSettings.footer
    });
  } catch (error) {
    console.error('Update footer error:', error);
    res.status(500).json({ error: 'Failed to update footer' });
  }
});

// Update maintenance mode
router.put('/maintenance', requireAdmin, async (req, res) => {
  try {
    const { enabled, message, allowedIPs } = req.body;

    siteSettings.maintenance = {
      enabled: enabled ?? siteSettings.maintenance.enabled,
      message: message || siteSettings.maintenance.message,
      allowedIPs: allowedIPs || siteSettings.maintenance.allowedIPs
    };
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      maintenance: siteSettings.maintenance
    });
  } catch (error) {
    console.error('Update maintenance error:', error);
    res.status(500).json({ error: 'Failed to update maintenance mode' });
  }
});

// Update feature flags
router.put('/features', requireAdmin, async (req, res) => {
  try {
    const newFeatures = req.body;

    siteSettings.features = {
      ...siteSettings.features,
      ...newFeatures
    };
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      features: siteSettings.features
    });
  } catch (error) {
    console.error('Update features error:', error);
    res.status(500).json({ error: 'Failed to update features' });
  }
});

// Toggle individual feature
router.put('/features/:feature/toggle', requireAdmin, async (req, res) => {
  try {
    const feature = req.params.feature as keyof typeof siteSettings.features;

    if (!(feature in siteSettings.features)) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    siteSettings.features[feature] = !siteSettings.features[feature];
    siteSettings.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      feature,
      enabled: siteSettings.features[feature]
    });
  } catch (error) {
    console.error('Toggle feature error:', error);
    res.status(500).json({ error: 'Failed to toggle feature' });
  }
});

export default router;
