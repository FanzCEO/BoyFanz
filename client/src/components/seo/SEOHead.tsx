/**
 * SEO Head Component
 *
 * Injects meta tags and structured data into the document head
 * for improved SEO and AEO (Answer Engine Optimization)
 *
 * Uses direct DOM manipulation for portability (no react-helmet dependency)
 */

import { useEffect, useRef } from 'react';
import { useSEOConfig, useStructuredData } from '@/hooks/use-seo';

interface SEOHeadProps {
  // Page metadata
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;

  // Page type
  type?: 'website' | 'article' | 'profile';

  // Article metadata
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];

  // Control
  noindex?: boolean;
  nofollow?: boolean;
  canonical?: string;

  // Structured data
  structuredData?: object | object[];
  includeOrganization?: boolean;
  includeWebsite?: boolean;
  includeFAQ?: boolean;
}

function setMetaTag(
  attr: 'name' | 'property',
  key: string,
  content: string,
  addedElements: HTMLElement[]
) {
  const selector = `meta[${attr}="${key}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
    addedElements.push(meta);
  }

  meta.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string, addedElements: HTMLElement[]) {
  const selector = `link[rel="${rel}"]`;
  let link = document.querySelector(selector) as HTMLLinkElement;

  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
    addedElements.push(link);
  }

  link.setAttribute('href', href);
}

function addJsonLdScript(data: object, addedElements: HTMLElement[]) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
  addedElements.push(script);
}

export function SEOHead({
  title,
  description,
  keywords = [],
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false,
  nofollow = false,
  canonical,
  structuredData,
  includeOrganization = false,
  includeWebsite = false,
  includeFAQ = false,
}: SEOHeadProps) {
  const { data: config } = useSEOConfig();
  const { data: orgSchema } = useStructuredData(includeOrganization ? 'organization' : undefined);
  const { data: webSchema } = useStructuredData(includeWebsite ? 'website' : undefined);
  const { data: faqSchema } = useStructuredData(includeFAQ ? 'faq' : undefined);
  const addedElementsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    if (!config) return;

    // Clean up previously added elements
    addedElementsRef.current.forEach((el) => el.remove());
    addedElementsRef.current = [];

    const addedElements: HTMLElement[] = [];

    const baseUrl = `https://${config.domain}`;
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
    const pageTitle = title
      ? `${title} | ${config.name}`
      : `${config.name} - ${config.tagline}`;
    const pageDescription = description || config.description;
    const pageImage = image || `${baseUrl}/og-image.png`;
    const allKeywords = [...keywords, ...config.keywords];
    const canonicalUrl = canonical || fullUrl;

    // Update document title
    document.title = pageTitle;

    // Basic meta tags
    setMetaTag('name', 'title', pageTitle, addedElements);
    setMetaTag('name', 'description', pageDescription, addedElements);
    setMetaTag('name', 'keywords', allKeywords.join(', '), addedElements);
    if (author) {
      setMetaTag('name', 'author', author, addedElements);
    }

    // Robots directive
    const robotsContent = [
      noindex ? 'noindex' : 'index',
      nofollow ? 'nofollow' : 'follow',
    ].join(', ');
    setMetaTag('name', 'robots', robotsContent, addedElements);

    // Canonical URL
    setLinkTag('canonical', canonicalUrl, addedElements);

    // Open Graph
    setMetaTag('property', 'og:type', type, addedElements);
    setMetaTag('property', 'og:url', fullUrl, addedElements);
    setMetaTag('property', 'og:title', pageTitle, addedElements);
    setMetaTag('property', 'og:description', pageDescription, addedElements);
    setMetaTag('property', 'og:image', pageImage, addedElements);
    setMetaTag('property', 'og:site_name', config.name, addedElements);
    setMetaTag('property', 'og:locale', 'en_US', addedElements);

    // Twitter Card
    setMetaTag('name', 'twitter:card', 'summary_large_image', addedElements);
    setMetaTag('name', 'twitter:url', fullUrl, addedElements);
    setMetaTag('name', 'twitter:title', pageTitle, addedElements);
    setMetaTag('name', 'twitter:description', pageDescription, addedElements);
    setMetaTag('name', 'twitter:image', pageImage, addedElements);
    if (config.socialLinks.twitter) {
      setMetaTag('name', 'twitter:site', config.socialLinks.twitter, addedElements);
    }

    // Article meta
    if (type === 'article') {
      if (publishedTime) {
        setMetaTag('property', 'article:published_time', publishedTime, addedElements);
      }
      if (modifiedTime) {
        setMetaTag('property', 'article:modified_time', modifiedTime, addedElements);
      }
      if (author) {
        setMetaTag('property', 'article:author', author, addedElements);
      }
      if (section) {
        setMetaTag('property', 'article:section', section, addedElements);
      }
      tags.forEach((tag, i) => {
        const tagMeta = document.createElement('meta');
        tagMeta.setAttribute('property', 'article:tag');
        tagMeta.setAttribute('content', tag);
        document.head.appendChild(tagMeta);
        addedElements.push(tagMeta);
      });
    }

    // Profile meta
    if (type === 'profile' && author) {
      setMetaTag('property', 'profile:username', author, addedElements);
    }

    // Structured Data (JSON-LD)
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        structuredData.forEach((data) => addJsonLdScript(data, addedElements));
      } else {
        addJsonLdScript(structuredData, addedElements);
      }
    }
    if (orgSchema) addJsonLdScript(orgSchema as object, addedElements);
    if (webSchema) addJsonLdScript(webSchema as object, addedElements);
    if (faqSchema) addJsonLdScript(faqSchema as object, addedElements);

    // Store references for cleanup
    addedElementsRef.current = addedElements;

    // Cleanup on unmount
    return () => {
      addedElementsRef.current.forEach((el) => el.remove());
      addedElementsRef.current = [];
    };
  }, [
    config,
    title,
    description,
    keywords,
    image,
    url,
    type,
    author,
    publishedTime,
    modifiedTime,
    section,
    tags,
    noindex,
    nofollow,
    canonical,
    structuredData,
    orgSchema,
    webSchema,
    faqSchema,
  ]);

  return null; // This component doesn't render anything
}

/**
 * SEO for the homepage
 */
export function HomePageSEO() {
  return (
    <SEOHead
      url="/"
      includeOrganization
      includeWebsite
      includeFAQ
    />
  );
}

/**
 * SEO for creator profile pages
 */
export function ProfilePageSEO({
  creator,
}: {
  creator: {
    username: string;
    displayName: string;
    bio?: string;
    avatar?: string;
    followerCount?: number;
    postCount?: number;
    isVerified?: boolean;
    socialLinks?: Record<string, string>;
  };
}) {
  const { data: config } = useSEOConfig();
  if (!config) return null;

  const baseUrl = `https://${config.domain}`;

  const personSchema = {
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Creators',
        item: `${baseUrl}/creators`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: creator.displayName,
        item: `${baseUrl}/@${creator.username}`,
      },
    ],
  };

  return (
    <SEOHead
      title={`${creator.displayName} (@${creator.username})`}
      description={creator.bio || `Follow ${creator.displayName} on ${config.name}`}
      image={creator.avatar}
      url={`/@${creator.username}`}
      type="profile"
      author={creator.username}
      structuredData={[personSchema, breadcrumbSchema]}
    />
  );
}

/**
 * SEO for post/content pages
 */
export function PostPageSEO({
  post,
}: {
  post: {
    id: string;
    title?: string;
    content?: string;
    thumbnail?: string;
    createdAt: string;
    updatedAt?: string;
    likeCount?: number;
    commentCount?: number;
    tags?: string[];
    creator: {
      username: string;
      displayName: string;
      avatar?: string;
    };
  };
}) {
  const { data: config } = useSEOConfig();
  if (!config) return null;

  const baseUrl = `https://${config.domain}`;
  const postTitle = post.title || `Post by ${post.creator.displayName}`;

  const postSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': `${baseUrl}/post/${post.id}#post`,
    name: postTitle,
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: post.creator.displayName,
        item: `${baseUrl}/@${post.creator.username}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: postTitle,
        item: `${baseUrl}/post/${post.id}`,
      },
    ],
  };

  return (
    <SEOHead
      title={postTitle}
      description={post.content?.substring(0, 160)}
      image={post.thumbnail}
      url={`/post/${post.id}`}
      type="article"
      author={post.creator.displayName}
      publishedTime={post.createdAt}
      modifiedTime={post.updatedAt}
      tags={post.tags}
      structuredData={[postSchema, breadcrumbSchema]}
    />
  );
}

/**
 * SEO for explore/discovery pages
 */
export function ExplorePageSEO({
  category,
  tag,
}: {
  category?: string;
  tag?: string;
}) {
  const { data: config } = useSEOConfig();
  if (!config) return null;

  const baseUrl = `https://${config.domain}`;
  let title = 'Explore';
  let description = `Discover amazing creators and content on ${config.name}`;
  let urlPath = '/explore';

  if (category) {
    title = `${category} - Explore`;
    description = `Explore ${category} content and creators on ${config.name}`;
    urlPath = `/explore/${category.toLowerCase()}`;
  }

  if (tag) {
    title = `#${tag} - Explore`;
    description = `Explore content tagged with #${tag} on ${config.name}`;
    urlPath = `/explore/tag/${tag}`;
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Explore',
        item: `${baseUrl}/explore`,
      },
      ...(category || tag
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: category || `#${tag}`,
              item: `${baseUrl}${urlPath}`,
            },
          ]
        : []),
    ],
  };

  return (
    <SEOHead
      title={title}
      description={description}
      url={urlPath}
      structuredData={breadcrumbSchema}
    />
  );
}

export default SEOHead;
