/**
 * SEO Components
 *
 * Export all SEO-related components for easy import
 */

export {
  SEOHead,
  HomePageSEO,
  ProfilePageSEO,
  PostPageSEO,
  ExplorePageSEO,
} from './SEOHead';

export { SEODashboard } from './SEODashboard';

export {
  useSEOConfig,
  useStructuredData,
  useSEOStats,
  useBacklinks,
  useMetaTags,
  useSEO,
  generateCreatorSchema,
  generatePostSchema,
  generateBreadcrumbSchema,
} from '@/hooks/use-seo';
