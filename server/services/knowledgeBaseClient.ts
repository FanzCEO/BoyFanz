// @ts-nocheck
/**
 * Knowledge Base Client - Connects to kb.fanz.website central knowledge base
 * Provides unified access to policies, content rules, AI context, and help articles
 */

import { logger } from '../logger';

interface KBSearchResult {
  id: string;
  title: string;
  content: string;
  category: string;
  relevanceScore: number;
  url?: string;
}

interface KBPolicy {
  id: string;
  platform: string;
  type: string;
  title: string;
  content: string;
  version: string;
  effectiveDate: string;
  lastUpdated: string;
}

interface KBContentRule {
  id: string;
  platform: string;
  category: string;
  rule: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  action: string;
  examples?: string[];
}

interface KBArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  platform?: string;
  createdAt: string;
  updatedAt: string;
}

interface AIContext {
  platformInfo: {
    name: string;
    description: string;
    policies: string[];
  };
  contentGuidelines: string[];
  commonQuestions: Array<{
    question: string;
    answer: string;
  }>;
}

class KnowledgeBaseClient {
  private baseUrl: string;
  private apiKey: string | null;
  private platform: string;
  private cache: Map<string, { data: any; expiry: number }>;
  private cacheTTL: number;
  private isConnected: boolean;

  constructor() {
    this.baseUrl = process.env.KNOWLEDGE_BASE_URL || 'https://kb.fanz.website';
    this.apiKey = process.env.KNOWLEDGE_BASE_API_KEY || null;
    this.platform = 'boyfanz';
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.isConnected = false;
  }

  /**
   * Initialize connection to knowledge base
   */
  async connect(): Promise<boolean> {
    if (!this.apiKey) {
      logger.warn('Knowledge Base API key not configured - using local knowledge base only');
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        this.isConnected = true;
        logger.info('Connected to Knowledge Base at ' + this.baseUrl);
        return true;
      } else {
        logger.warn('Knowledge Base health check failed:', response.status);
        return false;
      }
    } catch (error) {
      logger.warn('Failed to connect to Knowledge Base:', error);
      return false;
    }
  }

  /**
   * Get request headers with authentication
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Platform': this.platform,
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Get from cache or fetch
   */
  private async getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    if (cached && cached.expiry > Date.now()) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, expiry: Date.now() + this.cacheTTL });
    return data;
  }

  /**
   * Search the AI knowledge base
   */
  async search(query: string): Promise<KBSearchResult[]> {
    if (!this.isConnected) {
      return [];
    }

    const cacheKey = `search:${query}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/ai/search?query=${encodeURIComponent(query)}&platform=${this.platform}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          logger.error('KB search failed:', response.status);
          return [];
        }

        const data = await response.json();
        return data.results || [];
      } catch (error) {
        logger.error('KB search error:', error);
        return [];
      }
    });
  }

  /**
   * Get AI context for bot integration
   */
  async getAIContext(): Promise<AIContext | null> {
    if (!this.isConnected) {
      return null;
    }

    const cacheKey = `ai-context:${this.platform}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/ai/context?platform=${this.platform}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          logger.error('KB AI context fetch failed:', response.status);
          return null;
        }

        return await response.json();
      } catch (error) {
        logger.error('KB AI context error:', error);
        return null;
      }
    });
  }

  /**
   * Get policies by type
   */
  async getPolicy(type: string): Promise<KBPolicy | null> {
    if (!this.isConnected) {
      return null;
    }

    const cacheKey = `policy:${this.platform}:${type}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/policies/${this.platform}/${type}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          logger.error('KB policy fetch failed:', response.status);
          return null;
        }

        return await response.json();
      } catch (error) {
        logger.error('KB policy error:', error);
        return null;
      }
    });
  }

  /**
   * Get all policies for this platform
   */
  async getAllPolicies(): Promise<KBPolicy[]> {
    if (!this.isConnected) {
      return [];
    }

    const cacheKey = `policies:${this.platform}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/policies?platform=${this.platform}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          logger.error('KB policies fetch failed:', response.status);
          return [];
        }

        const data = await response.json();
        return data.policies || [];
      } catch (error) {
        logger.error('KB policies error:', error);
        return [];
      }
    });
  }

  /**
   * Get content rules
   */
  async getContentRules(): Promise<KBContentRule[]> {
    if (!this.isConnected) {
      return [];
    }

    const cacheKey = `rules:${this.platform}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/rules?platform=${this.platform}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          logger.error('KB rules fetch failed:', response.status);
          return [];
        }

        const data = await response.json();
        return data.rules || [];
      } catch (error) {
        logger.error('KB rules error:', error);
        return [];
      }
    });
  }

  /**
   * Get help articles
   */
  async getArticles(category?: string): Promise<KBArticle[]> {
    if (!this.isConnected) {
      return [];
    }

    const cacheKey = `articles:${this.platform}:${category || 'all'}`;
    return this.getCached(cacheKey, async () => {
      try {
        let url = `${this.baseUrl}/api/articles?platform=${this.platform}`;
        if (category) {
          url += `&category=${encodeURIComponent(category)}`;
        }

        const response = await fetch(url, { headers: this.getHeaders() });

        if (!response.ok) {
          logger.error('KB articles fetch failed:', response.status);
          return [];
        }

        const data = await response.json();
        return data.articles || [];
      } catch (error) {
        logger.error('KB articles error:', error);
        return [];
      }
    });
  }

  /**
   * Get a specific article
   */
  async getArticle(id: string): Promise<KBArticle | null> {
    if (!this.isConnected) {
      return null;
    }

    const cacheKey = `article:${id}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/articles/${id}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          if (response.status === 404) {
            return null;
          }
          logger.error('KB article fetch failed:', response.status);
          return null;
        }

        return await response.json();
      } catch (error) {
        logger.error('KB article error:', error);
        return null;
      }
    });
  }

  /**
   * Get moderator guides
   */
  async getModeratorGuides(): Promise<any[]> {
    if (!this.isConnected) {
      return [];
    }

    const cacheKey = `guides:${this.platform}`;
    return this.getCached(cacheKey, async () => {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/guides?platform=${this.platform}`,
          { headers: this.getHeaders() }
        );

        if (!response.ok) {
          logger.error('KB guides fetch failed:', response.status);
          return [];
        }

        const data = await response.json();
        return data.guides || [];
      } catch (error) {
        logger.error('KB guides error:', error);
        return [];
      }
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    logger.info('Knowledge Base cache cleared');
  }

  /**
   * Get connection status
   */
  getStatus(): { connected: boolean; baseUrl: string; platform: string } {
    return {
      connected: this.isConnected,
      baseUrl: this.baseUrl,
      platform: this.platform,
    };
  }
}

// Export singleton instance
export const knowledgeBaseClient = new KnowledgeBaseClient();

// Export types
export type {
  KBSearchResult,
  KBPolicy,
  KBContentRule,
  KBArticle,
  AIContext,
};
