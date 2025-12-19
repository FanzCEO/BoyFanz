/**
 * FANZ SEO & AEO Service
 *
 * Comprehensive Search Engine Optimization and Answer Engine Optimization
 * Handles:
 * - Macro SEO (site-wide meta, sitemaps, robots.txt)
 * - Micro SEO (user profiles, posts, content pages)
 * - AEO (structured data, FAQ schema, rich snippets)
 * - Backlink management and tracking
 * - Social media optimization (Open Graph, Twitter Cards)
 */

// Industry Backlinks Database - Priority partners for link building
export const INDUSTRY_BACKLINKS = [
  // Industry News & Awards (Priority 10)
  { site: 'XBIZ', url: 'https://www.xbiz.com', category: 'Industry News & Awards', type: 'Press coverage, awards listings, directory', priority: 10 },
  { site: 'AVN Media Network', url: 'https://avn.com', category: 'Industry News & Awards', type: 'News features, AVN Awards, AEE exhibitor listings', priority: 10 },
  { site: 'AVN Adult Entertainment Expo', url: 'https://avnshow.com', category: 'Expo & Trade Show', type: 'Exhibitor listings and sponsor links', priority: 10 },
  { site: 'YNOT', url: 'https://www.ynot.com', category: 'Industry News & Directory', type: 'Business directory listing, news, interviews', priority: 10 },

  // LGBTQ+ Specific
  { site: 'GAYVN', url: 'https://www.gayvn.com', category: 'LGBTQ+ Industry News & Awards', type: 'Creator spotlights, awards listings', priority: 9 },
  { site: 'TheSword', url: 'https://www.thesword.com', category: 'Gay Industry News', type: 'News/feature articles', priority: 8 },
  { site: 'Str8UpGayPorn', url: 'https://str8upgayporn.com', category: 'Gay Industry News & Blogs', type: 'Blog features, opinion pieces', priority: 8 },
  { site: 'GayVN Awards', url: 'https://gayvnawards.com', category: 'Awards Show', type: 'Nominee and sponsor links', priority: 8 },

  // Content Protection & DMCA
  { site: 'delevit', url: 'https://www.delevit.com', category: 'DMCA & Content Protection', type: 'Partner/solution pages, blog links', priority: 9 },
  { site: 'Erasa', url: 'https://www.erasa.net', category: 'Content Protection & DMCA', type: 'Partner and educational content links', priority: 9 },
  { site: 'OnSist', url: 'https://www.onsist.com', category: 'Content Protection / Anti-Piracy', type: 'Case studies and partner pages', priority: 8 },

  // Ad Networks & Traffic
  { site: 'Clickadu', url: 'https://www.clickadu.com', category: 'Ad Network / Traffic', type: 'Partner pages, case studies, blog articles', priority: 9 },
  { site: 'TrafficStars', url: 'https://www.trafficstars.com', category: 'Ad Network / Traffic', type: 'Blog, partner, and case-study links', priority: 9 },

  // Hosting & Infrastructure
  { site: 'MojoHost', url: 'https://www.mojohost.com', category: 'Hosting & Infrastructure', type: 'Client/partner listings and case studies', priority: 9 },

  // Crypto Payments
  { site: 'NOWPayments', url: 'https://nowpayments.io', category: 'Crypto Payments', type: 'Partner listings, integration showcases', priority: 9 },

  // Awards Shows
  { site: 'XBIZ Awards', url: 'https://xbizawards.xbiz.com', category: 'Awards Show', type: 'Nominee, winner and sponsor links', priority: 9 },
  { site: 'YNOT Cam Awards', url: 'https://awards.ynotcam.com', category: 'Awards Show', type: 'Nominee, winner and sponsor listings', priority: 9 },

  // Conferences & Events
  { site: 'The European Summit (TES)', url: 'https://www.tesaffiliateconferences.com', category: 'Affiliate & Adult Conference', type: 'Sponsor/exhibitor lists and partner pages', priority: 9 },
  { site: 'ShootXEvents', url: 'https://www.shootxevents.com', category: 'Events & Networking', type: 'Event partner/sponsor listings', priority: 8 },
  { site: 'Bcams', url: 'https://bcams-expo.com', category: 'Streaming Industry Event', type: 'Exhibitor/sponsor listings', priority: 8 },
  { site: 'Webmaster Access (WMA)', url: 'https://webmasteraccess.com', category: 'Conference & Networking', type: 'Sponsor/exhibitor listings, partner links', priority: 8 },
  { site: 'Erotic Trade Only', url: 'https://www.erotictradeonly.com', category: 'Trade Magazine & Event', type: 'Articles, exhibitor and sponsor links', priority: 8 },

  // Affiliate Networks
  { site: 'CrakRevenue', url: 'https://www.crakrevenue.com', category: 'CPA Network', type: 'Partner and case-study backlinks', priority: 8 },
  { site: 'BongaCash', url: 'https://bongacash.com', category: 'Webcam Affiliate Network', type: 'Affiliate resources and partner listings', priority: 8 },
  { site: 'PussyCash', url: 'https://pussycash.com', category: 'Affiliate Network', type: 'Affiliate resource and promo links', priority: 8 },

  // Review Sites
  { site: "Rabbit's Reviews", url: 'http://www.rabbitsreviews.com/Default.aspx', category: 'Review Site', type: 'Review pages and resource links', priority: 8 },
  { site: 'Honest Porn Reviews', url: 'https://www.honestpornreviews.com', category: 'Review Site', type: 'Review links and toplists', priority: 7 },
  { site: 'The Best Porn', url: 'https://www.thebestporn.com', category: 'Review Directory', type: 'Site review backlinks', priority: 7 },

  // Creator Platforms
  { site: 'iWantClips', url: 'https://iwantclips.com', category: 'Clip Store Platform', type: 'Creator resources, blog, press links', priority: 8 },
  { site: 'JustFor.Fans', url: 'https://justfor.fans', category: 'Creator Platform', type: 'Blog, comparison pieces, partner links', priority: 7 },
  { site: 'CAM4', url: 'https://www.cam4.com', category: 'Live Cam Platform', type: 'Blog, partner and promo links', priority: 7 },
  { site: 'Babestation', url: 'https://babestation.com', category: 'TV & Cam Brand', type: 'Partner, promo and blog links', priority: 7 },

  // Community & Forums
  { site: 'XBIZ.net', url: 'https://xbiz.net', category: 'Industry Social Network', type: 'Profile and group links', priority: 8 },
  { site: 'GFY Forum', url: 'https://gfy.com', category: 'Webmaster Community', type: 'Signature, marketplace and resource links', priority: 8 },
  { site: 'FreeOnes Board', url: 'https://board.freeones.com', category: 'Adult Forum', type: 'Signature and promo links', priority: 6 },
  { site: 'FUBAR Webmasters', url: 'https://fubarwebmasters.com', category: 'Event Photos & Community', type: 'Event recap and resource links', priority: 7 },

  // Magazines & Publications
  { site: 'PayOut Magazine', url: 'http://www.payoutmag.com', category: 'Magazine & Photographers', type: 'Articles, interviews, resource links', priority: 7 },
  { site: 'Erotic Sky Magazine', url: 'https://www.eroticskymagazine.com', category: 'Magazine', type: 'Interviews, features, partner links', priority: 7 },

  // Other Services
  { site: 'Dao of Leads', url: 'https://www.daoofleads.com', category: 'Dating Affiliate Network', type: 'Affiliate and partner pages', priority: 7 },
  { site: 'Mail Value Profits', url: 'https://mailvalueprofits.com', category: 'Email Monetization', type: 'Partner and case-study links', priority: 7 },
  { site: 'Adult Site Broker', url: 'https://adultsitebroker.com', category: 'M&A / Brokerage', type: 'Podcast features, partner links', priority: 7 },
  { site: 'Gaelic WWW Conference', url: 'https://www.gaelicwwwconference.com', category: 'Conference & Networking', type: 'Event partner and sponsor links', priority: 6 },
];

// Platform-specific SEO configurations
export interface PlatformSEOConfig {
  name: string;
  domain: string;
  tagline: string;
  description: string;
  keywords: string[];
  primaryColor: string;
  category: string;
  targetAudience: string;
  socialHandles?: {
    twitter?: string;
    instagram?: string;
  };
}

export const PLATFORM_SEO_CONFIGS: Record<string, PlatformSEOConfig> = {
  boyfanz: {
    name: 'BoyFanz',
    domain: 'boyfanz.com',
    tagline: 'Premium Male Creator Platform',
    description: 'Connect with exclusive male content creators. Subscribe, tip, and unlock premium content from your favorite creators.',
    keywords: ['male creators', 'content subscription', 'exclusive content', 'creator platform', 'fan subscription'],
    primaryColor: '#3B82F6',
    category: 'Creator Platform',
    targetAudience: 'Adults 18+',
  },
  gayfanz: {
    name: 'GayFanz',
    domain: 'gayfanz.com',
    tagline: 'LGBTQ+ Creator Community',
    description: 'The premier platform for LGBTQ+ content creators. Discover, subscribe, and support diverse creators.',
    keywords: ['LGBTQ creators', 'gay content', 'queer creators', 'pride content', 'inclusive platform'],
    primaryColor: '#EC4899',
    category: 'LGBTQ+ Creator Platform',
    targetAudience: 'Adults 18+',
  },
  bearfanz: {
    name: 'BearFanz',
    domain: 'bearfanz.com',
    tagline: 'Bear Community Creator Hub',
    description: 'Dedicated platform for bear community creators and fans. Authentic content from real creators.',
    keywords: ['bear community', 'bear creators', 'cub content', 'bear culture', 'body positive'],
    primaryColor: '#92400E',
    category: 'Niche Creator Platform',
    targetAudience: 'Adults 18+',
  },
  transfanz: {
    name: 'TransFanz',
    domain: 'transfanz.com',
    tagline: 'Celebrating Trans Creators',
    description: 'Safe and empowering platform for transgender and gender-diverse creators. Support authentic voices.',
    keywords: ['trans creators', 'transgender content', 'gender diverse', 'trans community', 'inclusive platform'],
    primaryColor: '#5BCEFA',
    category: 'Trans Creator Platform',
    targetAudience: 'Adults 18+',
  },
  cougarfanz: {
    name: 'CougarFanz',
    domain: 'cougarfanz.com',
    tagline: 'Mature Creator Excellence',
    description: 'Premium platform for mature content creators. Experience and confidence meet exclusive content.',
    keywords: ['mature creators', 'cougar content', 'experienced creators', 'mature women', 'premium content'],
    primaryColor: '#7C3AED',
    category: 'Mature Creator Platform',
    targetAudience: 'Adults 18+',
  },
  milffanz: {
    name: 'MILFFanz',
    domain: 'milffanz.com',
    tagline: 'Premium Mature Creators',
    description: 'Connect with confident, mature content creators. Exclusive subscriptions and premium content.',
    keywords: ['milf creators', 'mature content', 'mom creators', 'experienced women', 'premium subscriptions'],
    primaryColor: '#DC2626',
    category: 'Mature Creator Platform',
    targetAudience: 'Adults 18+',
  },
  southernfanz: {
    name: 'SouthernFanz',
    domain: 'southernfanz.com',
    tagline: 'Southern Charm Creators',
    description: 'Authentic southern creators sharing exclusive content. Country charm meets premium content.',
    keywords: ['southern creators', 'country content', 'rural creators', 'southern charm', 'authentic content'],
    primaryColor: '#D97706',
    category: 'Regional Creator Platform',
    targetAudience: 'Adults 18+',
  },
  taboofanz: {
    name: 'TabooFanz',
    domain: 'taboofanz.com',
    tagline: 'Explore Fantasy Content',
    description: 'Safe space for fantasy roleplay content creators. Consensual adult fantasy exploration.',
    keywords: ['fantasy content', 'roleplay creators', 'taboo fantasy', 'adult roleplay', 'fantasy exploration'],
    primaryColor: '#1F2937',
    category: 'Fantasy Creator Platform',
    targetAudience: 'Adults 18+',
  },
  femmefanz: {
    name: 'FemmeFanz',
    domain: 'femmefanz.com',
    tagline: 'Feminine Creator Excellence',
    description: 'Celebrating feminine creators in all their glory. Premium content from diverse women.',
    keywords: ['feminine creators', 'women creators', 'female content', 'feminine expression', 'women empowerment'],
    primaryColor: '#F472B6',
    category: 'Women Creator Platform',
    targetAudience: 'Adults 18+',
  },
  pupfanz: {
    name: 'PupFanz',
    domain: 'pupfanz.com',
    tagline: 'Pup & Pet Play Community',
    description: 'Dedicated platform for pup play and pet play community creators. Safe, consensual, community-focused.',
    keywords: ['pup play', 'pet play', 'kink community', 'leather community', 'pup community'],
    primaryColor: '#1E3A8A',
    category: 'Kink Creator Platform',
    targetAudience: 'Adults 18+',
  },
  daddyfanz: {
    name: 'DaddyFanz',
    domain: 'daddyfanz.com',
    tagline: 'Daddy Creator Community',
    description: 'Platform celebrating daddy-type creators. Mature, confident content from experienced creators.',
    keywords: ['daddy creators', 'mature men', 'silver fox', 'daddy content', 'experienced men'],
    primaryColor: '#374151',
    category: 'Mature Male Creator Platform',
    targetAudience: 'Adults 18+',
  },
  brofanz: {
    name: 'BroFanz',
    domain: 'brofanz.com',
    tagline: 'Brotherhood Creator Platform',
    description: 'Masculine creators celebrating brotherhood. Athletic, confident content from real guys.',
    keywords: ['bro content', 'masculine creators', 'athletic content', 'jock creators', 'masculine energy'],
    primaryColor: '#059669',
    category: 'Male Creator Platform',
    targetAudience: 'Adults 18+',
  },
  girlfanz: {
    name: 'GirlFanz',
    domain: 'girlfanz.com',
    tagline: 'Female Creator Destination',
    description: 'Premier platform for female content creators. Discover, subscribe, and support amazing women.',
    keywords: ['female creators', 'women content', 'girl creators', 'female empowerment', 'women platform'],
    primaryColor: '#EC4899',
    category: 'Female Creator Platform',
    targetAudience: 'Adults 18+',
  },
};

// Schema.org structured data generators
export interface UserProfileSchema {
  userId: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  followerCount?: number;
  postCount?: number;
  joinDate?: string;
  verified?: boolean;
  socialLinks?: Record<string, string>;
}

export interface PostSchema {
  postId: string;
  authorId: string;
  authorName: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  publishDate: string;
  likeCount?: number;
  commentCount?: number;
  isPremium?: boolean;
}

export interface FAQSchema {
  question: string;
  answer: string;
}

/**
 * Generate Schema.org Person structured data for creator profiles
 */
export function generatePersonSchema(profile: UserProfileSchema, platformConfig: PlatformSEOConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `https://${platformConfig.domain}/@${profile.username}`,
    name: profile.displayName,
    alternateName: profile.username,
    description: profile.bio,
    image: profile.avatarUrl,
    url: `https://${platformConfig.domain}/@${profile.username}`,
    sameAs: profile.socialLinks ? Object.values(profile.socialLinks) : [],
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: profile.followerCount || 0,
      },
    ],
    memberOf: {
      '@type': 'Organization',
      name: platformConfig.name,
      url: `https://${platformConfig.domain}`,
    },
  };
}

/**
 * Generate Schema.org CreativeWork for posts/content
 */
export function generatePostSchema(post: PostSchema, platformConfig: PlatformSEOConfig): object {
  const baseSchema: any = {
    '@context': 'https://schema.org',
    '@type': post.videoUrl ? 'VideoObject' : 'ImageObject',
    '@id': `https://${platformConfig.domain}/post/${post.postId}`,
    name: post.title || `Post by ${post.authorName}`,
    description: post.description,
    author: {
      '@type': 'Person',
      name: post.authorName,
      url: `https://${platformConfig.domain}/@${post.authorId}`,
    },
    datePublished: post.publishDate,
    publisher: {
      '@type': 'Organization',
      name: platformConfig.name,
      url: `https://${platformConfig.domain}`,
    },
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/LikeAction',
        userInteractionCount: post.likeCount || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CommentAction',
        userInteractionCount: post.commentCount || 0,
      },
    ],
  };

  if (post.imageUrl) {
    baseSchema.thumbnailUrl = post.imageUrl;
    baseSchema.contentUrl = post.imageUrl;
  }

  if (post.videoUrl) {
    baseSchema.contentUrl = post.videoUrl;
    baseSchema.embedUrl = post.videoUrl;
  }

  if (post.isPremium) {
    baseSchema.isAccessibleForFree = false;
    baseSchema.offers = {
      '@type': 'Offer',
      availability: 'https://schema.org/InStock',
      category: 'Subscription',
    };
  }

  return baseSchema;
}

/**
 * Generate Schema.org Organization for platform
 */
export function generateOrganizationSchema(platformConfig: PlatformSEOConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `https://${platformConfig.domain}`,
    name: platformConfig.name,
    url: `https://${platformConfig.domain}`,
    description: platformConfig.description,
    logo: `https://${platformConfig.domain}/logo.png`,
    sameAs: platformConfig.socialHandles ? [
      platformConfig.socialHandles.twitter ? `https://twitter.com/${platformConfig.socialHandles.twitter}` : null,
      platformConfig.socialHandles.instagram ? `https://instagram.com/${platformConfig.socialHandles.instagram}` : null,
    ].filter(Boolean) : [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: `support@${platformConfig.domain}`,
    },
  };
}

/**
 * Generate Schema.org WebSite for search box
 */
export function generateWebSiteSchema(platformConfig: PlatformSEOConfig): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `https://${platformConfig.domain}/#website`,
    url: `https://${platformConfig.domain}`,
    name: platformConfig.name,
    description: platformConfig.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `https://${platformConfig.domain}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate FAQ Schema for AEO
 */
export function generateFAQSchema(faqs: FAQSchema[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generate BreadcrumbList Schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  platformConfig: PlatformSEOConfig
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `https://${platformConfig.domain}${item.url}`,
    })),
  };
}

// Meta tag generators
export interface MetaTags {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: 'summary' | 'summary_large_image' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  robots?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Generate meta tags for a page
 */
export function generateMetaTags(options: {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
  keywords?: string[];
  author?: string;
  noIndex?: boolean;
  platformConfig: PlatformSEOConfig;
}): MetaTags {
  const { title, description, url, image, type, keywords, author, noIndex, platformConfig } = options;

  const fullTitle = `${title} | ${platformConfig.name}`;
  const fullUrl = url.startsWith('http') ? url : `https://${platformConfig.domain}${url}`;
  const defaultImage = `https://${platformConfig.domain}/og-image.jpg`;

  return {
    title: fullTitle,
    description: description.substring(0, 160),
    keywords: [...(keywords || []), ...platformConfig.keywords],
    canonical: fullUrl,
    ogTitle: fullTitle,
    ogDescription: description.substring(0, 200),
    ogImage: image || defaultImage,
    ogType: type || 'website',
    ogUrl: fullUrl,
    twitterCard: image ? 'summary_large_image' : 'summary',
    twitterTitle: fullTitle,
    twitterDescription: description.substring(0, 200),
    twitterImage: image || defaultImage,
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    author,
  };
}

/**
 * Generate meta tags for user profile
 */
export function generateProfileMetaTags(
  profile: UserProfileSchema,
  platformConfig: PlatformSEOConfig
): MetaTags {
  return generateMetaTags({
    title: `${profile.displayName} (@${profile.username})`,
    description: profile.bio || `Follow ${profile.displayName} on ${platformConfig.name} for exclusive content.`,
    url: `/@${profile.username}`,
    image: profile.avatarUrl,
    type: 'profile',
    author: profile.displayName,
    platformConfig,
  });
}

/**
 * Generate meta tags for post/content
 */
export function generatePostMetaTags(
  post: PostSchema,
  platformConfig: PlatformSEOConfig
): MetaTags {
  return generateMetaTags({
    title: post.title || `Post by ${post.authorName}`,
    description: post.description || `Check out this exclusive content from ${post.authorName} on ${platformConfig.name}.`,
    url: `/post/${post.postId}`,
    image: post.imageUrl,
    type: 'article',
    author: post.authorName,
    platformConfig,
  });
}

// Sitemap generation
export interface SitemapEntry {
  url: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

/**
 * Generate XML sitemap content
 */
export function generateSitemapXML(entries: SitemapEntry[], baseUrl: string): string {
  const urlEntries = entries.map(entry => {
    const fullUrl = entry.url.startsWith('http') ? entry.url : `${baseUrl}${entry.url}`;
    return `  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    ${entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''}
    ${entry.changefreq ? `<changefreq>${entry.changefreq}</changefreq>` : ''}
    ${entry.priority !== undefined ? `<priority>${entry.priority}</priority>` : ''}
  </url>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries.join('\n')}
</urlset>`;
}

/**
 * Generate sitemap index for large sites
 */
export function generateSitemapIndexXML(sitemaps: Array<{ url: string; lastmod?: string }>, baseUrl: string): string {
  const entries = sitemaps.map(sitemap => {
    const fullUrl = sitemap.url.startsWith('http') ? sitemap.url : `${baseUrl}${sitemap.url}`;
    return `  <sitemap>
    <loc>${escapeXml(fullUrl)}</loc>
    ${sitemap.lastmod ? `<lastmod>${sitemap.lastmod}</lastmod>` : ''}
  </sitemap>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</sitemapindex>`;
}

// robots.txt generation
export interface RobotsTxtConfig {
  allowAll?: boolean;
  disallowPaths?: string[];
  allowPaths?: string[];
  sitemapUrl?: string;
  crawlDelay?: number;
}

/**
 * Generate robots.txt content
 */
export function generateRobotsTxt(config: RobotsTxtConfig): string {
  const lines: string[] = ['User-agent: *'];

  if (config.allowAll) {
    lines.push('Allow: /');
  }

  if (config.disallowPaths) {
    config.disallowPaths.forEach(path => {
      lines.push(`Disallow: ${path}`);
    });
  }

  if (config.allowPaths) {
    config.allowPaths.forEach(path => {
      lines.push(`Allow: ${path}`);
    });
  }

  if (config.crawlDelay) {
    lines.push(`Crawl-delay: ${config.crawlDelay}`);
  }

  if (config.sitemapUrl) {
    lines.push('', `Sitemap: ${config.sitemapUrl}`);
  }

  return lines.join('\n');
}

// Helper functions
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get backlinks by priority
 */
export function getBacklinksByPriority(minPriority: number = 7): typeof INDUSTRY_BACKLINKS {
  return INDUSTRY_BACKLINKS.filter(link => link.priority >= minPriority)
    .sort((a, b) => b.priority - a.priority);
}

/**
 * Get backlinks by category
 */
export function getBacklinksByCategory(category: string): typeof INDUSTRY_BACKLINKS {
  return INDUSTRY_BACKLINKS.filter(link =>
    link.category.toLowerCase().includes(category.toLowerCase())
  );
}

/**
 * Generate default FAQs for platform (for AEO)
 */
export function generatePlatformFAQs(platformConfig: PlatformSEOConfig): FAQSchema[] {
  return [
    {
      question: `What is ${platformConfig.name}?`,
      answer: platformConfig.description,
    },
    {
      question: `How do I become a creator on ${platformConfig.name}?`,
      answer: `To become a creator on ${platformConfig.name}, sign up for a free account, complete your profile verification, and start uploading your exclusive content. Creators can set their own subscription prices and earn directly from their fans.`,
    },
    {
      question: `How do subscriptions work on ${platformConfig.name}?`,
      answer: `Fans can subscribe to their favorite creators on ${platformConfig.name} by choosing a subscription tier. Once subscribed, you get access to all the creator's exclusive content for the subscription period.`,
    },
    {
      question: `What payment methods does ${platformConfig.name} accept?`,
      answer: `${platformConfig.name} accepts major credit cards, debit cards, and cryptocurrency payments including Bitcoin, Ethereum, USDT, USDC, and many more through our secure payment partners.`,
    },
    {
      question: `Is my content protected on ${platformConfig.name}?`,
      answer: `Yes! ${platformConfig.name} uses advanced content protection including watermarking, DMCA protection, and anti-piracy measures to protect creator content.`,
    },
    {
      question: `How do creators get paid on ${platformConfig.name}?`,
      answer: `Creators on ${platformConfig.name} receive payouts based on their earnings from subscriptions, tips, and content sales. Payouts are available via bank transfer, cryptocurrency, and other payment methods.`,
    },
  ];
}

export default {
  INDUSTRY_BACKLINKS,
  PLATFORM_SEO_CONFIGS,
  generatePersonSchema,
  generatePostSchema,
  generateOrganizationSchema,
  generateWebSiteSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateMetaTags,
  generateProfileMetaTags,
  generatePostMetaTags,
  generateSitemapXML,
  generateSitemapIndexXML,
  generateRobotsTxt,
  getBacklinksByPriority,
  getBacklinksByCategory,
  generatePlatformFAQs,
};
