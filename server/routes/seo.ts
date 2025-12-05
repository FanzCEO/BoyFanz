/**
 * SEO API Routes
 *
 * Serves sitemaps, robots.txt, and structured data for SEO/AEO
 */

import { Router, Request, Response } from 'express';
import {
  generateSitemapXML,
  generateSitemapIndexXML,
  generateRobotsTxt,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generatePlatformFAQs,
  PLATFORM_SEO_CONFIGS,
  INDUSTRY_BACKLINKS,
  getBacklinksByPriority,
  getBacklinksByCategory,
} from '../services/seo';
import { db } from '../db';
import { users, posts } from '@shared/schema';
import { eq, desc, sql } from 'drizzle-orm';

const router = Router();

// Get platform config from environment or default
const getPlatformConfig = () => {
  const platformId = process.env.PLATFORM_ID || 'boyfanz';
  return PLATFORM_SEO_CONFIGS[platformId] || PLATFORM_SEO_CONFIGS.boyfanz;
};

/**
 * Serve robots.txt
 */
router.get('/robots.txt', (req: Request, res: Response) => {
  const platformConfig = getPlatformConfig();
  const baseUrl = `https://${platformConfig.domain}`;

  const robotsTxt = generateRobotsTxt({
    allowAll: true,
    disallowPaths: [
      '/api/',
      '/admin/',
      '/settings/',
      '/messages/',
      '/checkout/',
      '/payment/',
      '/*.json$',
      '/auth/',
    ],
    allowPaths: [
      '/api/seo/',
      '/@*',
      '/post/*',
      '/explore',
      '/creators',
    ],
    sitemapUrl: `${baseUrl}/sitemap.xml`,
    crawlDelay: 1,
  });

  res.type('text/plain').send(robotsTxt);
});

/**
 * Serve sitemap index
 */
router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    const platformConfig = getPlatformConfig();
    const baseUrl = `https://${platformConfig.domain}`;
    const now = new Date().toISOString().split('T')[0];

    const sitemaps = [
      { url: '/sitemap-static.xml', lastmod: now },
      { url: '/sitemap-creators.xml', lastmod: now },
      { url: '/sitemap-posts.xml', lastmod: now },
    ];

    const sitemapIndex = generateSitemapIndexXML(sitemaps, baseUrl);
    res.type('application/xml').send(sitemapIndex);
  } catch (error) {
    console.error('Sitemap index error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Static pages sitemap
 */
router.get('/sitemap-static.xml', (req: Request, res: Response) => {
  const platformConfig = getPlatformConfig();
  const baseUrl = `https://${platformConfig.domain}`;
  const now = new Date().toISOString().split('T')[0];

  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' as const },
    { url: '/explore', priority: 0.9, changefreq: 'hourly' as const },
    { url: '/creators', priority: 0.9, changefreq: 'daily' as const },
    { url: '/trending', priority: 0.8, changefreq: 'hourly' as const },
    { url: '/categories', priority: 0.8, changefreq: 'weekly' as const },
    { url: '/about', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/help', priority: 0.6, changefreq: 'monthly' as const },
    { url: '/faq', priority: 0.7, changefreq: 'weekly' as const },
    { url: '/terms', priority: 0.4, changefreq: 'yearly' as const },
    { url: '/privacy', priority: 0.4, changefreq: 'yearly' as const },
    { url: '/dmca', priority: 0.5, changefreq: 'yearly' as const },
    { url: '/creator-signup', priority: 0.8, changefreq: 'monthly' as const },
  ].map(page => ({ ...page, lastmod: now }));

  const sitemap = generateSitemapXML(staticPages, baseUrl);
  res.type('application/xml').send(sitemap);
});

/**
 * Creators/users sitemap
 */
router.get('/sitemap-creators.xml', async (req: Request, res: Response) => {
  try {
    const platformConfig = getPlatformConfig();
    const baseUrl = `https://${platformConfig.domain}`;

    // Get all public creator profiles
    const creators = await db
      .select({
        username: users.username,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.isCreator, true))
      .orderBy(desc(users.followerCount))
      .limit(10000);

    const entries = creators.map(creator => ({
      url: `/@${creator.username}`,
      lastmod: creator.updatedAt?.toISOString().split('T')[0],
      priority: 0.7,
      changefreq: 'weekly' as const,
    }));

    const sitemap = generateSitemapXML(entries, baseUrl);
    res.type('application/xml').send(sitemap);
  } catch (error) {
    console.error('Creators sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Posts sitemap
 */
router.get('/sitemap-posts.xml', async (req: Request, res: Response) => {
  try {
    const platformConfig = getPlatformConfig();
    const baseUrl = `https://${platformConfig.domain}`;

    // Get recent public posts
    const recentPosts = await db
      .select({
        id: posts.id,
        updatedAt: posts.updatedAt,
      })
      .from(posts)
      .where(eq(posts.isPublic, true))
      .orderBy(desc(posts.createdAt))
      .limit(10000);

    const entries = recentPosts.map(post => ({
      url: `/post/${post.id}`,
      lastmod: post.updatedAt?.toISOString().split('T')[0],
      priority: 0.6,
      changefreq: 'weekly' as const,
    }));

    const sitemap = generateSitemapXML(entries, baseUrl);
    res.type('application/xml').send(sitemap);
  } catch (error) {
    console.error('Posts sitemap error:', error);
    res.status(500).send('Error generating sitemap');
  }
});

/**
 * Get structured data for homepage (Organization + WebSite + FAQPage)
 */
router.get('/api/seo/structured-data', (req: Request, res: Response) => {
  const platformConfig = getPlatformConfig();

  const schemas = [
    generateOrganizationSchema(platformConfig),
    generateWebSiteSchema(platformConfig),
    generateFAQSchema(generatePlatformFAQs(platformConfig)),
  ];

  res.json(schemas);
});

/**
 * Get structured data for a specific page type
 */
router.get('/api/seo/structured-data/:pageType', (req: Request, res: Response) => {
  const { pageType } = req.params;
  const platformConfig = getPlatformConfig();

  switch (pageType) {
    case 'organization':
      res.json(generateOrganizationSchema(platformConfig));
      break;
    case 'website':
      res.json(generateWebSiteSchema(platformConfig));
      break;
    case 'faq':
      res.json(generateFAQSchema(generatePlatformFAQs(platformConfig)));
      break;
    default:
      res.status(404).json({ error: 'Unknown page type' });
  }
});

/**
 * Get platform SEO config
 */
router.get('/api/seo/config', (req: Request, res: Response) => {
  const platformConfig = getPlatformConfig();
  res.json(platformConfig);
});

/**
 * Get all platform SEO configs (for admin/dashboard)
 */
router.get('/api/seo/platforms', (req: Request, res: Response) => {
  res.json(PLATFORM_SEO_CONFIGS);
});

/**
 * Get industry backlinks
 */
router.get('/api/seo/backlinks', (req: Request, res: Response) => {
  const { priority, category } = req.query;

  let backlinks = INDUSTRY_BACKLINKS;

  if (priority) {
    backlinks = getBacklinksByPriority(Number(priority));
  }

  if (category) {
    backlinks = getBacklinksByCategory(category as string);
  }

  res.json({
    total: backlinks.length,
    backlinks,
    categories: [...new Set(INDUSTRY_BACKLINKS.map(l => l.category))],
  });
});

/**
 * Get SEO stats (for admin dashboard)
 */
router.get('/api/seo/stats', async (req: Request, res: Response) => {
  try {
    const platformConfig = getPlatformConfig();

    // Get counts for sitemap
    const [creatorCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(eq(users.isCreator, true));

    const [postCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(posts)
      .where(eq(posts.isPublic, true));

    res.json({
      platform: platformConfig.name,
      domain: platformConfig.domain,
      indexableCreators: Number(creatorCount?.count || 0),
      indexablePosts: Number(postCount?.count || 0),
      staticPages: 12,
      totalBacklinkPartners: INDUSTRY_BACKLINKS.length,
      highPriorityBacklinks: getBacklinksByPriority(9).length,
      sitemapUrls: {
        index: `https://${platformConfig.domain}/sitemap.xml`,
        static: `https://${platformConfig.domain}/sitemap-static.xml`,
        creators: `https://${platformConfig.domain}/sitemap-creators.xml`,
        posts: `https://${platformConfig.domain}/sitemap-posts.xml`,
      },
    });
  } catch (error) {
    console.error('SEO stats error:', error);
    res.status(500).json({ error: 'Failed to get SEO stats' });
  }
});

export default router;
