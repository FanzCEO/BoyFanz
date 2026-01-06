/**
 * Unified AI Gateway Service - FANZ Brain Edition
 *
 * Drop-in replacement for direct AI provider calls.
 * Routes ALL requests through brain.fanz.website for:
 * - Centralized audit logging and cost tracking
 * - Multi-provider failover (Together, OpenRouter, Groq)
 * - Intelligent model routing based on task type
 *
 * This replaces the old unifiedAIGatewayService that called providers directly.
 */

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  success: boolean;
  provider: string;
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  error?: string;
}

interface ImageAnalysisResponse {
  success: boolean;
  provider: string;
  description: string;
  tags: string[];
  suggestedCaption: string;
  error?: string;
}

interface EmbeddingResponse {
  success: boolean;
  provider: string;
  embedding: number[];
  error?: string;
}

class UnifiedAIGatewayService {
  private brainUrl: string;
  private authToken: string;
  private platformName: string;
  private metrics = {
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    totalLatencyMs: 0,
    totalTokens: 0,
  };

  constructor() {
    this.brainUrl = process.env.FANZ_BRAIN_URL || 'https://brain.fanz.website';
    this.authToken = process.env.FANZ_BRAIN_AUTH_TOKEN || process.env.INTERNAL_AUTH_TOKEN || '';
    this.platformName = process.env.PLATFORM_NAME || 'unknown';

    if (!this.authToken) {
      console.warn('[UnifiedAIGateway] Warning: No FANZ_BRAIN_AUTH_TOKEN configured');
    }
  }

  /**
   * Main chat completion - routes through fanz-brain
   */
  async chat(
    messages: ChatMessage[],
    options: {
      temperature?: number;
      maxTokens?: number;
      model?: string;
      bot?: string;
      purpose?: string;
    } = {}
  ): Promise<AIResponse> {
    this.metrics.totalRequests++;
    const startTime = Date.now();

    try {
      const response = await fetch(`${this.brainUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Auth': this.authToken,
        },
        body: JSON.stringify({
          messages,
          temperature: options.temperature ?? 0.7,
          max_tokens: options.maxTokens ?? 1000,
          model: options.model || 'fanz-brain',
          bot: options.bot || 'UnifiedGateway',
          purpose: options.purpose || 'chat',
          platform: this.platformName,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      this.metrics.successfulRequests++;
      this.metrics.totalLatencyMs += latencyMs;
      if (data.usage) {
        this.metrics.totalTokens += data.usage.total_tokens || 0;
      }

      return {
        success: true,
        provider: data.provider || 'fanz-brain',
        content: data.content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens,
        } : undefined,
      };
    } catch (error) {
      this.metrics.failedRequests++;
      console.error('[UnifiedAIGateway] Chat failed:', error);

      return {
        success: false,
        provider: 'fanz-brain',
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Simple completion (no history)
   */
  async complete(
    prompt: string,
    options: { temperature?: number; maxTokens?: number; model?: string } = {}
  ): Promise<AIResponse> {
    return this.chat(
      [{ role: 'user', content: prompt }],
      { ...options, purpose: 'completion' }
    );
  }

  /**
   * Content moderation
   */
  async moderate(content: string): Promise<{
    safe: boolean;
    categories: string[];
    confidence: number;
    reason?: string;
  }> {
    const systemPrompt = `You are a content moderation AI for an adult content platform. Analyze the content for policy violations.

Respond ONLY with valid JSON:
{
  "safe": boolean,
  "categories": ["category1", "category2"],
  "confidence": 0.0-1.0,
  "reason": "brief explanation if unsafe"
}

Flag categories: underage, non-consensual, violence, hate_speech, illegal, spam, doxxing, impersonation`;

    const response = await this.chat(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this content:\n\n${content}` },
      ],
      { temperature: 0.1, bot: 'ContentModerationBot', purpose: 'moderation' }
    );

    if (!response.success) {
      return { safe: true, categories: [], confidence: 0, reason: 'Moderation failed' };
    }

    try {
      return JSON.parse(response.content);
    } catch {
      return { safe: true, categories: [], confidence: 0, reason: 'Parse error' };
    }
  }

  /**
   * Image/Video analysis (vision)
   */
  async analyzeImage(imageUrl: string, prompt?: string): Promise<ImageAnalysisResponse> {
    // Vision requests go through GPT-4o via OpenRouter
    const response = await this.chat(
      [
        {
          role: 'system',
          content: 'You are an image analysis AI. Describe images accurately and suggest captions.',
        },
        {
          role: 'user',
          content: prompt || `Analyze this image and provide:
1. A detailed description
2. Relevant tags (comma-separated)
3. A suggested social media caption

Image URL: ${imageUrl}`,
        },
      ],
      { model: 'gpt-4o', bot: 'VisionAnalysisBot', purpose: 'vision_analysis' }
    );

    if (!response.success) {
      return {
        success: false,
        provider: 'fanz-brain',
        description: '',
        tags: [],
        suggestedCaption: '',
        error: response.error,
      };
    }

    // Parse the response
    const lines = response.content.split('\n');
    return {
      success: true,
      provider: response.provider,
      description: lines[0] || response.content,
      tags: lines[1]?.split(',').map(t => t.trim()) || [],
      suggestedCaption: lines[2] || '',
    };
  }

  /**
   * Generate captions
   */
  async generateCaption(
    description: string,
    style: 'casual' | 'professional' | 'flirty' | 'humorous' = 'casual'
  ): Promise<string> {
    const styleGuides = {
      casual: 'Write in a friendly, relaxed tone with emojis',
      professional: 'Write in a polished, sophisticated tone',
      flirty: 'Write in a playful, teasing tone with hints',
      humorous: 'Write in a funny, witty tone',
    };

    const response = await this.chat(
      [
        {
          role: 'system',
          content: `Generate social media captions. ${styleGuides[style]}. Keep under 280 characters.`,
        },
        { role: 'user', content: `Create a caption for: ${description}` },
      ],
      { temperature: 0.8, bot: 'CreatorAssistantBot', purpose: 'caption_generation' }
    );

    return response.success ? response.content : '';
  }

  /**
   * Hashtag suggestions
   */
  async suggestHashtags(content: string, count: number = 10): Promise<string[]> {
    const response = await this.chat(
      [
        {
          role: 'system',
          content: `Suggest relevant hashtags for adult content platforms. Return ONLY hashtags, one per line, no explanations.`,
        },
        { role: 'user', content: `Suggest ${count} hashtags for: ${content}` },
      ],
      { temperature: 0.7, bot: 'CreatorAssistantBot', purpose: 'hashtag_suggestion' }
    );

    if (!response.success) return [];

    return response.content
      .split('\n')
      .map(tag => tag.trim().replace(/^#?/, '#'))
      .filter(tag => tag.length > 1)
      .slice(0, count);
  }

  /**
   * Support ticket triage
   */
  async triageTicket(message: string): Promise<{
    priority: 'urgent' | 'high' | 'medium' | 'low';
    category: string;
    suggestedResponse: string;
    sentiment: string;
  }> {
    const response = await this.chat(
      [
        {
          role: 'system',
          content: `Triage support tickets. Respond with JSON:
{
  "priority": "urgent|high|medium|low",
  "category": "billing|technical|account|content|verification|payout|other",
  "suggestedResponse": "brief helpful response",
  "sentiment": "positive|neutral|frustrated|angry"
}`,
        },
        { role: 'user', content: message },
      ],
      { temperature: 0.2, model: 'groq-llama', bot: 'SupportTriageBot', purpose: 'support_triage' }
    );

    if (!response.success) {
      return {
        priority: 'medium',
        category: 'other',
        suggestedResponse: '',
        sentiment: 'neutral',
      };
    }

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        priority: 'medium',
        category: 'other',
        suggestedResponse: '',
        sentiment: 'neutral',
      };
    }
  }

  /**
   * Text embedding (for search/similarity)
   */
  async embed(text: string): Promise<EmbeddingResponse> {
    // Embeddings not yet supported through gateway - use local fallback
    console.warn('[UnifiedAIGateway] Embeddings not yet routed through fanz-brain');
    return {
      success: false,
      provider: 'none',
      embedding: [],
      error: 'Embeddings endpoint not available',
    };
  }

  /**
   * Translate text
   */
  async translate(text: string, targetLanguage: string): Promise<string> {
    const response = await this.chat(
      [
        {
          role: 'system',
          content: `You are a translator. Translate text to ${targetLanguage}. Return ONLY the translation.`,
        },
        { role: 'user', content: text },
      ],
      { temperature: 0.3, bot: 'TranslatorBot', purpose: 'translation' }
    );

    return response.success ? response.content : text;
  }

  /**
   * Summarize content
   */
  async summarize(text: string, maxLength: number = 100): Promise<string> {
    const response = await this.chat(
      [
        {
          role: 'system',
          content: `Summarize text concisely in ${maxLength} words or less. Be direct and clear.`,
        },
        { role: 'user', content: text },
      ],
      { temperature: 0.3, bot: 'AnalyticsBot', purpose: 'summarization' }
    );

    return response.success ? response.content : '';
  }

  /**
   * Check if service is healthy
   */
  async healthCheck(): Promise<{ healthy: boolean; latencyMs: number }> {
    const start = Date.now();
    try {
      const response = await fetch(`${this.brainUrl}/health`);
      const data = await response.json();
      return {
        healthy: data.status === 'ok',
        latencyMs: Date.now() - start,
      };
    } catch {
      return { healthy: false, latencyMs: Date.now() - start };
    }
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      avgLatencyMs: this.metrics.successfulRequests > 0
        ? Math.round(this.metrics.totalLatencyMs / this.metrics.successfulRequests)
        : 0,
      successRate: this.metrics.totalRequests > 0
        ? ((this.metrics.successfulRequests / this.metrics.totalRequests) * 100).toFixed(1) + '%'
        : '0%',
    };
  }
}

// Export singleton
export const unifiedAI = new UnifiedAIGatewayService();
export default unifiedAI;
