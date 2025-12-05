/**
 * SEO Hook
 *
 * React hook for managing SEO meta tags and structured data
 */

import { useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SEOConfig {
  name: string;
  tagline: string;
  description: string;
  domain: string;
  primaryColor: string;
  keywords: string[];
  socialLinks: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
  };
}

interface MetaTagsOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  canonical?: string;
}

interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

interface SEOStats {
  platform: string;
  domain: string;
  indexableCreators: number;
  indexablePosts: number;
  staticPages: number;
  totalBacklinkPartners: number;
  highPriorityBacklinks: number;
  sitemapUrls: {
    index: string;
    static: string;
    creators: string;
    posts: string;
  };
}

interface Backlink {
  site: string;
  url: string;
  category: string;
  type: string;
  priority: number;
}

/**
 * Get platform SEO configuration
 */
export function useSEOConfig() {
  return useQuery<SEOConfig>({
    queryKey: ['seo-config'],
    queryFn: async () => {
      const response = await fetch('/api/seo/config');
      if (!response.ok) throw new Error('Failed to get SEO config');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Get structured data for a page type
 */
export function useStructuredData(pageType?: 'organization' | 'website' | 'faq') {
  return useQuery<StructuredData | StructuredData[]>({
    queryKey: ['structured-data', pageType],
    queryFn: async () => {
      const url = pageType
        ? `/api/seo/structured-data/${pageType}`
        : '/api/seo/structured-data';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to get structured data');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Get SEO statistics
 */
export function useSEOStats() {
  return useQuery<SEOStats>({
    queryKey: ['seo-stats'],
    queryFn: async () => {
      const response = await fetch('/api/seo/stats');
      if (!response.ok) throw new Error('Failed to get SEO stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Get industry backlinks for link building
 */
export function useBacklinks(options?: { priority?: number; category?: string }) {
  const queryParams = new URLSearchParams();
  if (options?.priority) queryParams.set('priority', options.priority.toString());
  if (options?.category) queryParams.set('category', options.category);

  return useQuery<{ total: number; backlinks: Backlink[]; categories: string[] }>({
    queryKey: ['backlinks', options],
    queryFn: async () => {
      const url = `/api/seo/backlinks${queryParams.toString() ? `?${queryParams}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to get backlinks');
      return response.json();
    },
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

/**
 * Generate meta tags for head injection
 */
export function useMetaTags(options: MetaTagsOptions) {
  const { data: config } = useSEOConfig();

  const metaTags = useMemo(() => {
    if (!config) return [];

    const baseUrl = `https://${config.domain}`;
    const fullUrl = options.url ? `${baseUrl}${options.url}` : baseUrl;
    const title = options.title
      ? `${options.title} | ${config.name}`
      : `${config.name} - ${config.tagline}`;
    const description = options.description || config.description;
    const image = options.image || `${baseUrl}/og-image.png`;
    const keywords = [...(options.keywords || []), ...config.keywords].join(', ');

    const tags: Array<{ name?: string; property?: string; content: string }> = [
      // Basic meta
      { name: 'description', content: description },
      { name: 'keywords', content: keywords },
      { name: 'author', content: options.author || config.name },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:url', content: fullUrl },
      { property: 'og:type', content: options.type || 'website' },
      { property: 'og:site_name', content: config.name },

      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image },
    ];

    // Twitter handle
    if (config.socialLinks.twitter) {
      tags.push({ name: 'twitter:site', content: config.socialLinks.twitter });
    }

    // Article-specific meta
    if (options.type === 'article') {
      if (options.publishedTime) {
        tags.push({ property: 'article:published_time', content: options.publishedTime });
      }
      if (options.modifiedTime) {
        tags.push({ property: 'article:modified_time', content: options.modifiedTime });
      }
      if (options.author) {
        tags.push({ property: 'article:author', content: options.author });
      }
      if (options.section) {
        tags.push({ property: 'article:section', content: options.section });
      }
      if (options.tags) {
        options.tags.forEach(tag => {
          tags.push({ property: 'article:tag', content: tag });
        });
      }
    }

    // Robots
    if (options.noindex) {
      tags.push({ name: 'robots', content: 'noindex, nofollow' });
    }

    return tags;
  }, [config, options]);

  return { metaTags, title: options.title, config };
}

/**
 * Hook to manage document head meta tags
 */
export function useSEO(options: MetaTagsOptions) {
  const { metaTags, title, config } = useMetaTags(options);

  useEffect(() => {
    if (!config) return;

    // Update document title
    const fullTitle = title
      ? `${title} | ${config.name}`
      : `${config.name} - ${config.tagline}`;
    document.title = fullTitle;

    // Track existing meta tags we've added
    const addedTags: HTMLMetaElement[] = [];
    const addedLinks: HTMLLinkElement[] = [];

    // Add/update meta tags
    metaTags.forEach(({ name, property, content }) => {
      const selector = name
        ? `meta[name="${name}"]`
        : `meta[property="${property}"]`;

      let meta = document.querySelector(selector) as HTMLMetaElement;

      if (!meta) {
        meta = document.createElement('meta');
        if (name) meta.setAttribute('name', name);
        if (property) meta.setAttribute('property', property);
        document.head.appendChild(meta);
        addedTags.push(meta);
      }

      meta.setAttribute('content', content);
    });

    // Add canonical URL
    if (options.canonical || options.url) {
      const canonicalUrl = options.canonical || `https://${config.domain}${options.url || ''}`;
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
        addedLinks.push(link);
      }

      link.setAttribute('href', canonicalUrl);
    }

    // Cleanup on unmount
    return () => {
      addedTags.forEach(tag => tag.remove());
      addedLinks.forEach(link => link.remove());
    };
  }, [metaTags, title, config, options.canonical, options.url]);

  return { config };
}

/**
 * Generate Person schema for creator profiles
 */
export function generateCreatorSchema(creator: {
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  followerCount?: number;
  postCount?: number;
  isVerified?: boolean;
  socialLinks?: Record<string, string>;
}, baseUrl: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${baseUrl}/@${creator.username}#person`,
    name: creator.displayName,
    alternateName: creator.username,
    description: creator.bio,
    image: creator.avatar,
    url: `${baseUrl}/@${creator.username}`,
    sameAs: creator.socialLinks ? Object.values(creator.socialLinks) : undefined,
    interactionStatistic: [
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/FollowAction',
        userInteractionCount: creator.followerCount || 0,
      },
      {
        '@type': 'InteractionCounter',
        interactionType: 'https://schema.org/CreateAction',
        userInteractionCount: creator.postCount || 0,
      },
    ],
  };
}

/**
 * Generate CreativeWork schema for posts
 */
export function generatePostSchema(post: {
  id: string;
  title?: string;
  content?: string;
  thumbnail?: string;
  createdAt: string;
  updatedAt?: string;
  likeCount?: number;
  commentCount?: number;
  creator: {
    username: string;
    displayName: string;
    avatar?: string;
  };
}, baseUrl: string): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${baseUrl}/post/${post.id}#post`,
    name: post.title || `Post by ${post.creator.displayName}`,
    description: post.content?.substring(0, 160),
    image: post.thumbnail,
    url: `${baseUrl}/post/${post.id}`,
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    author: {
      '@type': 'Person',
      name: post.creator.displayName,
      url: `${baseUrl}/@${post.creator.username}`,
      image: post.creator.avatar,
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
}

/**
 * Generate BreadcrumbList schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  };
}

export default useSEO;
