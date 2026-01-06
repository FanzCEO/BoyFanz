/**
 * Together AI Service - Unified AI Gateway for FANZ Platforms
 *
 * Provides access to multiple open-source AI models as alternatives:
 * - Llama 3.1 (70B, 8B) - General purpose, great for chat
 * - Mistral (7B) - Fast, efficient
 * - Mixtral (8x7B) - High quality MoE
 * - CodeLlama - Code generation
 * - Qwen - Multilingual support
 */

interface TogetherAIConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  maxTokens?: number;
  temperature?: number;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GenerateOptions {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  repetitionPenalty?: number;
  stop?: string[];
  stream?: boolean;
}

interface AIResponse {
  content: string;
  model: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  finishReason: string;
}

// Available models on Together AI
export const TOGETHER_MODELS = {
  // Meta Llama 3.1 - Best overall
  LLAMA_3_1_70B: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
  LLAMA_3_1_8B: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  LLAMA_3_1_405B: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',

  // Mistral - Fast and efficient
  MISTRAL_7B: 'mistralai/Mistral-7B-Instruct-v0.3',
  MIXTRAL_8X7B: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
  MIXTRAL_8X22B: 'mistralai/Mixtral-8x22B-Instruct-v0.1',

  // Qwen - Great for multilingual
  QWEN_2_72B: 'Qwen/Qwen2-72B-Instruct',
  QWEN_2_7B: 'Qwen/Qwen2-7B-Instruct',

  // Code models
  CODELLAMA_34B: 'codellama/CodeLlama-34b-Instruct-hf',
  CODELLAMA_70B: 'codellama/CodeLlama-70b-Instruct-hf',
  DEEPSEEK_CODER: 'deepseek-ai/deepseek-coder-33b-instruct',

  // Specialized
  NOUS_HERMES: 'NousResearch/Nous-Hermes-2-Mixtral-8x7B-DPO',
  DOLPHIN_MIXTRAL: 'cognitivecomputations/dolphin-2.5-mixtral-8x7b',

  // Vision models
  LLAVA_1_6: 'llava-hf/llava-v1.6-mistral-7b-hf',
} as const;

// Model configurations for different use cases
export const MODEL_PROFILES = {
  // Fast responses for chat
  CHAT_FAST: {
    model: TOGETHER_MODELS.LLAMA_3_1_8B,
    maxTokens: 512,
    temperature: 0.7,
  },

  // High quality chat
  CHAT_QUALITY: {
    model: TOGETHER_MODELS.LLAMA_3_1_70B,
    maxTokens: 1024,
    temperature: 0.7,
  },

  // Creative writing (stories, roleplay)
  CREATIVE: {
    model: TOGETHER_MODELS.MIXTRAL_8X7B,
    maxTokens: 2048,
    temperature: 0.9,
    topP: 0.95,
  },

  // AI Clone personality (consistent, engaging)
  AI_CLONE: {
    model: TOGETHER_MODELS.LLAMA_3_1_70B,
    maxTokens: 512,
    temperature: 0.8,
    repetitionPenalty: 1.1,
  },

  // Code generation
  CODE: {
    model: TOGETHER_MODELS.DEEPSEEK_CODER,
    maxTokens: 2048,
    temperature: 0.2,
  },

  // Moderation/analysis
  MODERATION: {
    model: TOGETHER_MODELS.LLAMA_3_1_8B,
    maxTokens: 256,
    temperature: 0.1,
  },

  // Uncensored (for adult platforms)
  UNCENSORED: {
    model: TOGETHER_MODELS.DOLPHIN_MIXTRAL,
    maxTokens: 1024,
    temperature: 0.8,
  },
};

class TogetherAIService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultMaxTokens: number;
  private defaultTemperature: number;

  constructor(config?: Partial<TogetherAIConfig>) {
    this.apiKey = config?.apiKey || process.env.TOGETHER_AI_API_KEY || '';
    this.baseUrl = config?.baseUrl || 'https://api.together.xyz/v1';
    this.defaultModel = config?.defaultModel || TOGETHER_MODELS.LLAMA_3_1_70B;
    this.defaultMaxTokens = config?.maxTokens || 1024;
    this.defaultTemperature = config?.temperature || 0.7;
  }

  /**
   * Generate a chat completion
   */
  async chat(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature ?? this.defaultTemperature,
        top_p: options?.topP,
        top_k: options?.topK,
        repetition_penalty: options?.repetitionPenalty,
        stop: options?.stop,
        stream: false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together AI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.message.content,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Generate text completion (non-chat)
   */
  async complete(prompt: string, options?: GenerateOptions): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;

    const response = await fetch(`${this.baseUrl}/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature ?? this.defaultTemperature,
        top_p: options?.topP,
        top_k: options?.topK,
        repetition_penalty: options?.repetitionPenalty,
        stop: options?.stop,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Together AI error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const choice = data.choices[0];

    return {
      content: choice.text,
      model: data.model,
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
      },
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Stream chat completion
   */
  async *streamChat(
    messages: ChatMessage[],
    options?: GenerateOptions
  ): AsyncGenerator<string, void, unknown> {
    const model = options?.model || this.defaultModel;

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: options?.maxTokens || this.defaultMaxTokens,
        temperature: options?.temperature ?? this.defaultTemperature,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices[0]?.delta?.content;
            if (content) yield content;
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }

  /**
   * Generate embeddings
   */
  async embed(texts: string | string[]): Promise<number[][]> {
    const input = Array.isArray(texts) ? texts : [texts];

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'togethercomputer/m2-bert-80M-8k-retrieval',
        input,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI embedding error: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((item: any) => item.embedding);
  }

  // ===== SPECIALIZED METHODS FOR FANZ FEATURES =====

  /**
   * AI Clone Chat - Simulate creator personality
   */
  async aiCloneChat(
    creatorPersonality: string,
    conversationHistory: ChatMessage[],
    fanMessage: string
  ): Promise<string> {
    const systemPrompt = `You are an AI clone of a content creator. Here is your personality and style:

${creatorPersonality}

IMPORTANT RULES:
- Stay in character at all times
- Be flirty, engaging, and playful
- Remember context from the conversation
- Never break character or mention you're an AI
- Keep responses conversational (1-3 sentences usually)
- Use emojis sparingly but appropriately
- Be responsive to the fan's interests and mood`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10), // Last 10 messages for context
      { role: 'user', content: fanMessage },
    ];

    const response = await this.chat(messages, MODEL_PROFILES.AI_CLONE);
    return response.content;
  }

  /**
   * Content Moderation - Check if content is appropriate
   */
  async moderateContent(content: string): Promise<{
    safe: boolean;
    categories: string[];
    confidence: number;
    reason?: string;
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a content moderation AI for an adult platform. Analyze the following content and determine if it violates these categories:
- ILLEGAL: Child exploitation, bestiality, non-consent
- DANGEROUS: Violence threats, doxxing, self-harm promotion
- SPAM: Advertising, phishing, scams
- HARASSMENT: Targeted abuse, hate speech

Respond in JSON format:
{"safe": boolean, "categories": [], "confidence": 0.0-1.0, "reason": "explanation if not safe"}`
      },
      { role: 'user', content: `Analyze this content:\n\n${content}` }
    ];

    const response = await this.chat(messages, MODEL_PROFILES.MODERATION);

    try {
      return JSON.parse(response.content);
    } catch {
      return { safe: true, categories: [], confidence: 0.5 };
    }
  }

  /**
   * Generate creator bio/description
   */
  async generateCreatorBio(
    name: string,
    interests: string[],
    style: string,
    platform: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a bio writer for adult content creators. Write engaging, flirty, and inviting bios that attract subscribers. Keep it under 200 words.`
      },
      {
        role: 'user',
        content: `Write a bio for:
Name: ${name}
Interests: ${interests.join(', ')}
Style: ${style}
Platform: ${platform}`
      }
    ];

    const response = await this.chat(messages, MODEL_PROFILES.CREATIVE);
    return response.content;
  }

  /**
   * Generate caption for content
   */
  async generateCaption(
    contentType: 'photo' | 'video' | 'story',
    description: string,
    mood: string
  ): Promise<string> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You write short, engaging captions for adult content. Be flirty, use emojis, and create FOMO. Keep it under 50 words.`
      },
      {
        role: 'user',
        content: `Write a caption for a ${contentType}:
Description: ${description}
Mood: ${mood}`
      }
    ];

    const response = await this.chat(messages, {
      ...MODEL_PROFILES.CREATIVE,
      maxTokens: 100,
    });
    return response.content;
  }

  /**
   * Smart auto-reply suggestions
   */
  async suggestReplies(
    messageContext: string,
    senderInfo: string
  ): Promise<string[]> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are a reply suggestion AI for content creators. Generate 3 short, flirty reply options. Format as JSON array of strings.`
      },
      {
        role: 'user',
        content: `Sender: ${senderInfo}\nMessage: ${messageContext}\n\nSuggest 3 replies:`
      }
    ];

    const response = await this.chat(messages, MODEL_PROFILES.CHAT_FAST);

    try {
      return JSON.parse(response.content);
    } catch {
      return [response.content];
    }
  }

  /**
   * Analyze fan engagement patterns
   */
  async analyzeEngagement(
    interactions: Array<{ type: string; timestamp: string; value?: number }>
  ): Promise<{
    summary: string;
    suggestions: string[];
    bestTimes: string[];
    riskLevel: 'low' | 'medium' | 'high';
  }> {
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `Analyze fan engagement data and provide insights. Return JSON with: summary, suggestions (array), bestTimes (array), riskLevel.`
      },
      {
        role: 'user',
        content: `Analyze this engagement data:\n${JSON.stringify(interactions, null, 2)}`
      }
    ];

    const response = await this.chat(messages, MODEL_PROFILES.MODERATION);

    try {
      return JSON.parse(response.content);
    } catch {
      return {
        summary: response.content,
        suggestions: [],
        bestTimes: [],
        riskLevel: 'low'
      };
    }
  }

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ healthy: boolean; latency: number }> {
    const start = Date.now();
    try {
      await this.chat([
        { role: 'user', content: 'Hi' }
      ], { maxTokens: 5 });
      return { healthy: true, latency: Date.now() - start };
    } catch {
      return { healthy: false, latency: Date.now() - start };
    }
  }

  /**
   * List available models
   */
  async listModels(): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list models: ${response.status}`);
    }

    const data = await response.json();
    return data.data.map((m: any) => m.id);
  }
}

// Export singleton instance
export const togetherAI = new TogetherAIService();

// Export class for custom instances
export { TogetherAIService };
export type { ChatMessage, GenerateOptions, AIResponse, TogetherAIConfig };
