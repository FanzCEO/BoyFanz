// @ts-nocheck
/**
 * Cross-Platform AI Client
 *
 * This lightweight client allows other FANZ platforms to connect to the
 * unified AI Gateway hosted on BoyFanz. Use this in:
 * - GirlFanz, GayFanz, TransFanz, etc.
 * - FanzDash
 * - Any other FANZ ecosystem service
 *
 * Usage:
 * ```typescript
 * import { fanzAIClient } from './services/crossPlatformAIClient';
 *
 * // Chat completion
 * const response = await fanzAIClient.chat({
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * });
 *
 * // Chatbot
 * const botResponse = await fanzAIClient.chatbot({
 *   message: 'How do I upload content?'
 * });
 *
 * // Content moderation
 * const moderation = await fanzAIClient.moderate({
 *   content: 'Some text to moderate',
 *   contentType: 'text'
 * });
 * ```
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIClientConfig {
  gatewayUrl: string;
  apiKey: string;
  platform: string;
  timeout?: number;
}

interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  provider?: 'openai' | 'anthropic' | 'auto';
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

interface ChatResponse {
  content: string;
  model: string;
  provider: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cached: boolean;
  processingTime: number;
}

interface ChatbotRequest {
  message: string;
  conversationHistory?: ChatMessage[];
  personality?: 'helpful' | 'flirty' | 'professional';
  userId?: string;
  isCreator?: boolean;
}

interface ChatbotResponse {
  response: string;
  suggestedActions?: string[];
  sentiment?: string;
}

interface ModerationRequest {
  content: string | Buffer;
  contentType: 'text' | 'image';
}

interface ModerationResponse {
  flagged: boolean;
  categories: {
    nsfw: { flagged: boolean; score: number };
    violence: { flagged: boolean; score: number };
    hate: { flagged: boolean; score: number };
    selfHarm: { flagged: boolean; score: number };
    illegal: { flagged: boolean; score: number };
  };
  recommendation: 'allow' | 'review' | 'block';
  provider: string;
  processingTime: number;
}

interface CaptionRequest {
  contentType: string;
  contentDescription: string;
  tone?: 'flirty' | 'professional' | 'funny' | 'mysterious';
  includeEmojis?: boolean;
  maxLength?: number;
}

interface CaptionResponse {
  caption: string;
  hashtags: string[];
  alternatives: string[];
}

interface ContentSuggestionsRequest {
  niche?: string;
  audienceType?: string;
  contentStyle?: string;
  topPerformingContent?: string[];
  audienceInterests?: string[];
}

interface ContentSuggestionsResponse {
  suggestions: Array<{
    title: string;
    description: string;
    type: string;
    predictedEngagement: 'high' | 'medium' | 'low';
  }>;
  trendingTopics: string[];
  optimalPostingTimes: string[];
}

interface EmbeddingRequest {
  text: string | string[];
  model?: string;
}

interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  dimensions: number;
  processingTime: number;
}

class CrossPlatformAIClient {
  private config: AIClientConfig;

  constructor(config?: Partial<AIClientConfig>) {
    this.config = {
      gatewayUrl: config?.gatewayUrl || process.env.FANZ_AI_GATEWAY_URL || 'https://boyfanz.fanz.website/api/ai',
      apiKey: config?.apiKey || process.env.FANZ_CROSS_PLATFORM_API_KEY || '',
      platform: config?.platform || process.env.PLATFORM_ID || 'unknown',
      timeout: config?.timeout || 30000
    };
  }

  /**
   * Make a request to the AI Gateway
   */
  private async request<T>(endpoint: string, payload: any, useAuth = true): Promise<T> {
    const url = `${this.config.gatewayUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    // For cross-platform requests, use the special endpoint
    if (useAuth && this.config.apiKey) {
      return this.crossPlatformRequest<T>(endpoint.replace('/', ''), payload);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(this.config.timeout!)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `AI Gateway request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'AI Gateway request failed');
    }

    return data;
  }

  /**
   * Make a cross-platform authenticated request
   */
  private async crossPlatformRequest<T>(requestType: string, payload: any): Promise<T> {
    const url = `${this.config.gatewayUrl}/cross-platform/request`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: this.config.apiKey,
        platform: this.config.platform,
        requestType,
        payload
      }),
      signal: AbortSignal.timeout(this.config.timeout!)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Cross-platform request failed: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Cross-platform request failed');
    }

    return data.result;
  }

  // ===== PUBLIC API =====

  /**
   * Chat completion with Claude or GPT
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const result = await this.request<{ response: ChatResponse }>('/chat', request);
    return result.response;
  }

  /**
   * AI Chatbot interaction
   */
  async chatbot(request: ChatbotRequest): Promise<ChatbotResponse> {
    return await this.request<ChatbotResponse>('/chatbot', {
      message: request.message,
      conversationHistory: request.conversationHistory,
      personality: request.personality,
      userContext: {
        userId: request.userId,
        isCreator: request.isCreator,
        platform: this.config.platform
      }
    });
  }

  /**
   * Spicy/Flirty AI chatbot
   */
  async spicyChatbot(message: string, conversationHistory?: ChatMessage[]): Promise<ChatbotResponse> {
    return await this.request<ChatbotResponse>('/chatbot/spicy', {
      message,
      conversationHistory
    });
  }

  /**
   * Content moderation
   */
  async moderate(request: ModerationRequest): Promise<ModerationResponse> {
    const result = await this.request<{ moderation: ModerationResponse }>('/moderate', request);
    return result.moderation;
  }

  /**
   * Generate caption for content
   */
  async generateCaption(request: CaptionRequest): Promise<CaptionResponse> {
    return await this.request<CaptionResponse>('/caption', request);
  }

  /**
   * Get content suggestions for creators
   */
  async getContentSuggestions(request: ContentSuggestionsRequest): Promise<ContentSuggestionsResponse> {
    return await this.request<ContentSuggestionsResponse>('/content-suggestions', request);
  }

  /**
   * Generate text embeddings
   */
  async getEmbeddings(request: EmbeddingRequest): Promise<EmbeddingResponse> {
    const result = await this.request<EmbeddingResponse>('/embeddings', request);
    return result;
  }

  /**
   * Check AI Gateway health
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    providers: Array<{ name: string; status: 'up' | 'down'; latency?: number }>;
  }> {
    const response = await fetch(`${this.config.gatewayUrl}/health`);
    const data = await response.json();
    return {
      healthy: data.healthy,
      providers: data.providers
    };
  }

  /**
   * Update client configuration
   */
  updateConfig(newConfig: Partial<AIClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration (without API key)
   */
  getConfig(): Omit<AIClientConfig, 'apiKey'> & { apiKey: string } {
    return {
      gatewayUrl: this.config.gatewayUrl,
      platform: this.config.platform,
      timeout: this.config.timeout,
      apiKey: this.config.apiKey ? '***' : 'not set'
    };
  }
}

// Export singleton instance for easy usage
export const fanzAIClient = new CrossPlatformAIClient();

// Export class for custom configuration
export { CrossPlatformAIClient };

// Export types
export type {
  ChatMessage,
  AIClientConfig,
  ChatRequest,
  ChatResponse,
  ChatbotRequest,
  ChatbotResponse,
  ModerationRequest,
  ModerationResponse,
  CaptionRequest,
  CaptionResponse,
  ContentSuggestionsRequest,
  ContentSuggestionsResponse,
  EmbeddingRequest,
  EmbeddingResponse
};
