import { Router, Request, Response } from 'express';
import { unifiedAI as unifiedAIGateway } from '../services/unifiedAIGatewayService';

const router = Router();

/**
 * GET /api/ai/status
 * Get AI gateway status and available providers
 */
router.get('/status', (req: Request, res: Response) => {
  try {
    const status = unifiedAIGateway.getStatus();
    res.json({
      success: true,
      gateway: status
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/chat
 * Send a chat completion request
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { messages, temperature, maxTokens } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Messages array required'
      });
    }

    const response = await unifiedAIGateway.chat(messages, {
      temperature,
      maxTokens
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/analyze-image
 * Analyze an image using vision AI
 */
router.post('/analyze-image', async (req: Request, res: Response) => {
  try {
    const { imageUrl, prompt } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl required'
      });
    }

    const response = await unifiedAIGateway.analyzeImage(imageUrl, prompt);
    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/content-suggestions
 * Generate content suggestions for creators
 */
router.post('/content-suggestions', async (req: Request, res: Response) => {
  try {
    const { creatorName, contentType, audience, recentContent } = req.body;

    if (!creatorName || !contentType || !audience) {
      return res.status(400).json({
        success: false,
        error: 'creatorName, contentType, and audience required'
      });
    }

    const response = await unifiedAIGateway.generateContentSuggestions({
      creatorName,
      contentType,
      audience,
      recentContent
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/pricing-suggestions
 * Get AI-powered pricing recommendations
 */
router.post('/pricing-suggestions', async (req: Request, res: Response) => {
  try {
    const { contentType, creatorTier, subscriberCount, engagementRate, competitorPricing } = req.body;

    if (!contentType || !creatorTier) {
      return res.status(400).json({
        success: false,
        error: 'contentType and creatorTier required'
      });
    }

    const response = await unifiedAIGateway.suggestPricing({
      contentType,
      creatorTier,
      subscriberCount: subscriberCount || 0,
      engagementRate: engagementRate || 0,
      competitorPricing
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/chatbot-response
 * Generate AI chatbot response for fan interactions
 */
router.post('/chatbot-response', async (req: Request, res: Response) => {
  try {
    const { creatorPersona, conversationHistory, fanMessage } = req.body;

    if (!creatorPersona || !fanMessage) {
      return res.status(400).json({
        success: false,
        error: 'creatorPersona and fanMessage required'
      });
    }

    const response = await unifiedAIGateway.generateChatResponse({
      creatorPersona,
      conversationHistory: conversationHistory || [],
      fanMessage
    });

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/moderate
 * Check content for policy violations
 */
router.post('/moderate', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'content required'
      });
    }

    const result = await unifiedAIGateway.moderateContent(content);
    res.json({
      success: true,
      ...result
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ai/reset
 * Reset failover state (admin only)
 */
router.post('/reset', (req: Request, res: Response) => {
  try {
    unifiedAIGateway.resetFailover();
    res.json({
      success: true,
      message: 'AI Gateway failover state reset',
      status: unifiedAIGateway.getStatus()
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
