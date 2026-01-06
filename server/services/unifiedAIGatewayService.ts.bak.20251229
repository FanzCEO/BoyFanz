/**
 * Unified AI Gateway Service
 * Supports multiple AI providers with automatic failover
 * Primary: Together AI | Fallback: OpenAI
 */

interface AIProvider {
  name: string;
  baseUrl: string;
  apiKeyEnv: string;
  models: {
    chat: string;
    vision: string;
    embedding: string;
  };
}

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

class UnifiedAIGatewayService {
  private providers: Record<string, AIProvider> = {
    together: {
      name: 'Together AI',
      baseUrl: 'https://api.together.xyz/v1',
      apiKeyEnv: 'TOGETHER_API_KEY',
      models: {
        chat: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
        vision: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        embedding: 'togethercomputer/m2-bert-80M-8k-retrieval'
      }
    },
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      apiKeyEnv: 'OPENAI_API_KEY',
      models: {
        chat: 'gpt-4o-mini',
        vision: 'gpt-4o',
        embedding: 'text-embedding-3-small'
      }
    }
  };

  private providerOrder: string[] = ['together', 'openai'];
  private currentProviderIndex = 0;
  private failoverCount = 0;
  private maxFailovers = 3;

  constructor() {
    // Set provider order from env if specified
    const primaryProvider = process.env.AI_PRIMARY_PROVIDER?.toLowerCase();
    if (primaryProvider && this.providers[primaryProvider]) {
      this.providerOrder = [primaryProvider, ...Object.keys(this.providers).filter(p => p !== primaryProvider)];
    }
    console.log(`AI Gateway initialized. Provider order: ${this.providerOrder.join(' -> ')}`);
  }

  private getApiKey(provider: AIProvider): string | null {
    return process.env[provider.apiKeyEnv] || null;
  }

  private getActiveProvider(): AIProvider | null {
    for (let i = this.currentProviderIndex; i < this.providerOrder.length; i++) {
      const providerKey = this.providerOrder[i];
      const provider = this.providers[providerKey];
      const apiKey = this.getApiKey(provider);
      if (apiKey) {
        return provider;
      }
    }
    return null;
  }

  private async failover(): Promise<AIProvider | null> {
    this.failoverCount++;
    if (this.failoverCount >= this.maxFailovers) {
      console.error('AI Gateway: Max failovers reached');
      return null;
    }

    this.currentProviderIndex++;
    if (this.currentProviderIndex >= this.providerOrder.length) {
      this.currentProviderIndex = 0;
    }

    const provider = this.getActiveProvider();
    if (provider) {
      console.log(`AI Gateway: Failing over to ${provider.name}`);
    }
    return provider;
  }

  /**
   * Send a chat completion request
   */
  async chat(messages: ChatMessage[], options?: {
    temperature?: number;
    maxTokens?: number;
    model?: string;
  }): Promise<AIResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        success: false,
        provider: 'none',
        content: '',
        error: 'No AI provider configured. Set TOGETHER_API_KEY or OPENAI_API_KEY.'
      };
    }

    const apiKey = this.getApiKey(provider);
    const model = options?.model || provider.models.chat;

    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: options?.temperature ?? 0.7,
          max_tokens: options?.maxTokens ?? 1024
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AI Gateway ${provider.name} error:`, errorText);

        // Try failover
        const fallbackProvider = await this.failover();
        if (fallbackProvider) {
          return this.chat(messages, options);
        }

        return {
          success: false,
          provider: provider.name,
          content: '',
          error: `API error: ${response.status}`
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      return {
        success: true,
        provider: provider.name,
        content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0
        }
      };

    } catch (error: any) {
      console.error(`AI Gateway ${provider.name} exception:`, error.message);

      // Try failover
      const fallbackProvider = await this.failover();
      if (fallbackProvider) {
        return this.chat(messages, options);
      }

      return {
        success: false,
        provider: provider.name,
        content: '',
        error: error.message
      };
    }
  }

  /**
   * Analyze an image and generate description/tags
   */
  async analyzeImage(imageUrl: string, prompt?: string): Promise<ImageAnalysisResponse> {
    const provider = this.getActiveProvider();
    if (!provider) {
      return {
        success: false,
        provider: 'none',
        description: '',
        tags: [],
        suggestedCaption: '',
        error: 'No AI provider configured'
      };
    }

    const apiKey = this.getApiKey(provider);
    const analysisPrompt = prompt || 'Analyze this image. Provide: 1) A brief description, 2) Relevant tags (comma-separated), 3) A suggested caption for social media.';

    try {
      const response = await fetch(`${provider.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: provider.models.vision,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: analysisPrompt },
                { type: 'image_url', image_url: { url: imageUrl } }
              ]
            }
          ],
          max_tokens: 500
        })
      });

      if (!response.ok) {
        const fallbackProvider = await this.failover();
        if (fallbackProvider) {
          return this.analyzeImage(imageUrl, prompt);
        }
        return {
          success: false,
          provider: provider.name,
          description: '',
          tags: [],
          suggestedCaption: '',
          error: `Vision API error: ${response.status}`
        };
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // Parse the response
      const lines = content.split('\n').filter((l: string) => l.trim());
      let description = '';
      let tags: string[] = [];
      let suggestedCaption = '';

      for (const line of lines) {
        if (line.toLowerCase().includes('description')) {
          description = line.replace(/^.*?:\s*/i, '');
        } else if (line.toLowerCase().includes('tag')) {
          tags = line.replace(/^.*?:\s*/i, '').split(',').map((t: string) => t.trim());
        } else if (line.toLowerCase().includes('caption')) {
          suggestedCaption = line.replace(/^.*?:\s*/i, '');
        }
      }

      // Fallback parsing if structured format not found
      if (!description && content.length > 0) {
        description = content.substring(0, 200);
      }

      return {
        success: true,
        provider: provider.name,
        description,
        tags,
        suggestedCaption
      };

    } catch (error: any) {
      const fallbackProvider = await this.failover();
      if (fallbackProvider) {
        return this.analyzeImage(imageUrl, prompt);
      }
      return {
        success: false,
        provider: provider.name,
        description: '',
        tags: [],
        suggestedCaption: '',
        error: error.message
      };
    }
  }

  /**
   * Generate content suggestions
   */
  async generateContentSuggestions(context: {
    creatorName: string;
    contentType: string;
    audience: string;
    recentContent?: string[];
  }): Promise<AIResponse> {
    const systemPrompt = `You are an expert content strategist for adult content creators.
Provide personalized, actionable content suggestions that are tasteful yet engaging.
Focus on what performs well for the ${context.audience} audience.`;

    const userPrompt = `Creator: ${context.creatorName}
Content Type: ${context.contentType}
Target Audience: ${context.audience}
${context.recentContent ? `Recent content themes: ${context.recentContent.join(', ')}` : ''}

Suggest 5 content ideas with:
1. Title/theme
2. Best time to post
3. Expected engagement level
4. Tips for maximum impact`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.8 });
  }

  /**
   * Generate optimized pricing suggestions
   */
  async suggestPricing(context: {
    contentType: string;
    creatorTier: string;
    subscriberCount: number;
    engagementRate: number;
    competitorPricing?: number[];
  }): Promise<AIResponse> {
    const systemPrompt = `You are a pricing optimization expert for subscription-based content platforms.
Analyze the creator's metrics and suggest optimal pricing strategies.`;

    const userPrompt = `Content Type: ${context.contentType}
Creator Tier: ${context.creatorTier}
Subscribers: ${context.subscriberCount}
Engagement Rate: ${context.engagementRate}%
${context.competitorPricing ? `Competitor prices: $${context.competitorPricing.join(', $')}` : ''}

Suggest:
1. Optimal subscription price
2. PPV content pricing range
3. Tips pricing suggestions
4. Bundle discount strategy`;

    return this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], { temperature: 0.5 });
  }

  /**
   * Generate chat responses for AI chatbot
   */
  async generateChatResponse(context: {
    creatorPersona: string;
    conversationHistory: ChatMessage[];
    fanMessage: string;
  }): Promise<AIResponse> {
    const systemPrompt = `You are roleplaying as a content creator with this persona: ${context.creatorPersona}
Respond naturally and engagingly. Keep responses flirty but tasteful.
Never break character. Be warm, personable, and encourage continued engagement.`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...context.conversationHistory,
      { role: 'user', content: context.fanMessage }
    ];

    return this.chat(messages, { temperature: 0.9, maxTokens: 256 });
  }

  /**
   * Content moderation check
   */
  async moderateContent(content: string): Promise<{
    safe: boolean;
    provider: string;
    flags: string[];
    confidence: number;
  }> {
    const response = await this.chat([
      {
        role: 'system',
        content: `You are a content moderation system. Analyze content for:
1. Illegal content (CSAM, non-consensual)
2. Hate speech
3. Threats or violence
4. Spam/scam

Respond in JSON format: {"safe": boolean, "flags": ["flag1", "flag2"], "confidence": 0-100}`
      },
      { role: 'user', content: `Analyze: ${content}` }
    ], { temperature: 0.1 });

    if (!response.success) {
      return { safe: true, provider: response.provider, flags: ['analysis_failed'], confidence: 0 };
    }

    try {
      const parsed = JSON.parse(response.content);
      return {
        safe: parsed.safe ?? true,
        provider: response.provider,
        flags: parsed.flags || [],
        confidence: parsed.confidence || 50
      };
    } catch {
      return { safe: true, provider: response.provider, flags: ['parse_error'], confidence: 0 };
    }
  }

  /**
   * Get current provider status
   */
  getStatus(): {
    primaryProvider: string;
    activeProvider: string | null;
    failoverCount: number;
    availableProviders: string[];
  } {
    const activeProvider = this.getActiveProvider();
    const availableProviders = Object.entries(this.providers)
      .filter(([_, p]) => this.getApiKey(p))
      .map(([key]) => key);

    return {
      primaryProvider: this.providerOrder[0],
      activeProvider: activeProvider?.name || null,
      failoverCount: this.failoverCount,
      availableProviders
    };
  }

  /**
   * Reset failover state
   */
  resetFailover(): void {
    this.currentProviderIndex = 0;
    this.failoverCount = 0;
    console.log('AI Gateway: Failover state reset');
  }
}

export const unifiedAIGateway = new UnifiedAIGatewayService();
export default UnifiedAIGatewayService;
