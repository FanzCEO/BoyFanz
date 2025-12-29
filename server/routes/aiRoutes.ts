import { Router } from 'express';
import { isAuthenticated, requireAdmin } from '../middleware/auth';
import { unifiedAIGateway } from '../services/unifiedAIGatewayService';
import { togetherAI, TOGETHER_MODELS, MODEL_PROFILES } from '../services/togetherAIService';

const router = Router();

// ===== PUBLIC AI ROUTES =====

// Get AI provider status
router.get('/status', async (req, res) => {
  try {
    const status = unifiedAIGateway.getStatus();
    res.json({
      success: true,
      ...status,
      availableModels: Object.keys(TOGETHER_MODELS),
      profiles: Object.keys(MODEL_PROFILES)
    });
  } catch (error) {
    console.error('AI status error:', error);
    res.status(500).json({ error: 'Failed to get AI status' });
  }
});

// ===== AUTHENTICATED AI ROUTES =====

// AI Chat (general purpose)
router.post('/chat', isAuthenticated, async (req, res) => {
  try {
    const { messages, model, temperature, maxTokens, profile } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    const response = await unifiedAIGateway.chat(messages, {
      model,
      temperature,
      maxTokens
    });

    res.json(response);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'AI chat failed' });
  }
});

// AI Clone Chat (for creator clones)
router.post('/clone-chat', isAuthenticated, async (req, res) => {
  try {
    const { creatorPersona, conversationHistory, fanMessage } = req.body;

    if (!creatorPersona || !fanMessage) {
      return res.status(400).json({ error: 'creatorPersona and fanMessage are required' });
    }

    const response = await unifiedAIGateway.generateChatResponse({
      creatorPersona,
      conversationHistory: conversationHistory || [],
      fanMessage
    });

    res.json(response);
  } catch (error) {
    console.error('AI clone chat error:', error);
    res.status(500).json({ error: 'AI clone chat failed' });
  }
});

// Generate content suggestions
router.post('/suggest-content', isAuthenticated, async (req, res) => {
  try {
    const { creatorName, contentType, audience, recentContent } = req.body;

    const response = await unifiedAIGateway.generateContentSuggestions({
      creatorName: creatorName || 'Creator',
      contentType: contentType || 'photos and videos',
      audience: audience || 'general',
      recentContent
    });

    res.json(response);
  } catch (error) {
    console.error('Content suggestion error:', error);
    res.status(500).json({ error: 'Content suggestion failed' });
  }
});

// Generate pricing suggestions
router.post('/suggest-pricing', isAuthenticated, async (req, res) => {
  try {
    const { contentType, creatorTier, subscriberCount, engagementRate, competitorPricing } = req.body;

    const response = await unifiedAIGateway.suggestPricing({
      contentType: contentType || 'premium content',
      creatorTier: creatorTier || 'standard',
      subscriberCount: subscriberCount || 0,
      engagementRate: engagementRate || 5,
      competitorPricing
    });

    res.json(response);
  } catch (error) {
    console.error('Pricing suggestion error:', error);
    res.status(500).json({ error: 'Pricing suggestion failed' });
  }
});

// Analyze image
router.post('/analyze-image', isAuthenticated, async (req, res) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'imageUrl is required' });
    }

    const response = await unifiedAIGateway.analyzeImage(imageUrl, prompt);
    res.json(response);
  } catch (error) {
    console.error('Image analysis error:', error);
    res.status(500).json({ error: 'Image analysis failed' });
  }
});

// Generate caption
router.post('/generate-caption', isAuthenticated, async (req, res) => {
  try {
    const { description, contentType, mood, style } = req.body;

    const prompt = `Write a short, engaging caption for a ${contentType || 'post'}.
Description: ${description || 'content'}
Mood: ${mood || 'flirty'}
Style: ${style || 'casual'}

Keep it under 50 words. Use emojis sparingly. Make it attention-grabbing.`;

    const response = await unifiedAIGateway.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.9, maxTokens: 100 });

    res.json({
      success: response.success,
      caption: response.content,
      provider: response.provider
    });
  } catch (error) {
    console.error('Caption generation error:', error);
    res.status(500).json({ error: 'Caption generation failed' });
  }
});

// Generate reply suggestions
router.post('/suggest-replies', isAuthenticated, async (req, res) => {
  try {
    const { message, context, tone } = req.body;

    const prompt = `Generate 3 short, ${tone || 'flirty'} reply options for this message:
"${message}"
${context ? `Context: ${context}` : ''}

Return as a JSON array of 3 strings. Keep each under 100 characters.`;

    const response = await unifiedAIGateway.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.8, maxTokens: 200 });

    let replies: string[] = [];
    try {
      replies = JSON.parse(response.content);
    } catch {
      replies = [response.content];
    }

    res.json({
      success: response.success,
      replies,
      provider: response.provider
    });
  } catch (error) {
    console.error('Reply suggestion error:', error);
    res.status(500).json({ error: 'Reply suggestion failed' });
  }
});

// Generate bio
router.post('/generate-bio', isAuthenticated, async (req, res) => {
  try {
    const { name, interests, style, platform } = req.body;

    const prompt = `Write a flirty, engaging bio for an adult content creator:
Name: ${name || 'Creator'}
Interests: ${interests?.join(', ') || 'content creation'}
Style: ${style || 'playful'}
Platform: ${platform || 'BoyFanz'}

Keep it under 200 words. Make it inviting and intriguing.`;

    const response = await unifiedAIGateway.chat([
      { role: 'user', content: prompt }
    ], { temperature: 0.9, maxTokens: 300 });

    res.json({
      success: response.success,
      bio: response.content,
      provider: response.provider
    });
  } catch (error) {
    console.error('Bio generation error:', error);
    res.status(500).json({ error: 'Bio generation failed' });
  }
});

// ===== MODERATION ROUTES =====

// Moderate content
router.post('/moderate', isAuthenticated, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'content is required' });
    }

    const result = await unifiedAIGateway.moderateContent(content);
    res.json(result);
  } catch (error) {
    console.error('Moderation error:', error);
    res.status(500).json({ error: 'Moderation failed' });
  }
});

// ===== ADMIN AI ROUTES =====

// Get AI analytics
router.get('/admin/analytics', requireAdmin, async (req, res) => {
  try {
    // Mock analytics - in production pull from database
    const analytics = {
      totalRequests: 15847,
      totalTokens: 2456789,
      estimatedCost: 12.34,
      byProvider: {
        'Together AI': { requests: 14523, tokens: 2234567, cost: 1.12 },
        'OpenAI': { requests: 1324, tokens: 222222, cost: 11.22 }
      },
      byEndpoint: {
        'clone-chat': 8234,
        'suggest-replies': 4123,
        'generate-caption': 2345,
        'moderate': 1145
      },
      averageLatency: 234, // ms
      errorRate: 0.02 // 2%
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Reset failover
router.post('/admin/reset-failover', requireAdmin, async (req, res) => {
  try {
    unifiedAIGateway.resetFailover();
    res.json({ success: true, message: 'Failover state reset' });
  } catch (error) {
    console.error('Reset failover error:', error);
    res.status(500).json({ error: 'Failed to reset failover' });
  }
});

// Test provider connection
router.post('/admin/test-provider', requireAdmin, async (req, res) => {
  try {
    const { provider } = req.body;

    const response = await unifiedAIGateway.chat([
      { role: 'user', content: 'Hello, this is a test message.' }
    ], { maxTokens: 20 });

    res.json({
      success: response.success,
      provider: response.provider,
      latency: Date.now(), // Would measure actual latency in production
      message: response.content
    });
  } catch (error) {
    console.error('Provider test error:', error);
    res.status(500).json({ error: 'Provider test failed' });
  }
});

// List available models
router.get('/admin/models', requireAdmin, async (req, res) => {
  try {
    res.json({
      together: TOGETHER_MODELS,
      profiles: MODEL_PROFILES,
      default: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo'
    });
  } catch (error) {
    console.error('List models error:', error);
    res.status(500).json({ error: 'Failed to list models' });
  }
});

// Update AI settings
router.put('/admin/settings', requireAdmin, async (req, res) => {
  try {
    const { primaryProvider, defaultModel, defaultTemperature, maxTokensDefault } = req.body;

    // In production, save to database
    res.json({
      success: true,
      settings: {
        primaryProvider: primaryProvider || 'together',
        defaultModel: defaultModel || TOGETHER_MODELS.LLAMA_3_1_70B,
        defaultTemperature: defaultTemperature ?? 0.7,
        maxTokensDefault: maxTokensDefault || 1024
      }
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
