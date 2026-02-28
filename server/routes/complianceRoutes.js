// FANZ Compliance API Routes
// Paywall transparency and creator compliance monitoring
// Created: 2026-01-29

import express from 'express';
import PaywallComplianceService from '../services/paywallComplianceService.js';

const router = express.Router();

// Initialize compliance service (pass your DB connection)
let complianceService;

export function initComplianceRoutes(db) {
  complianceService = new PaywallComplianceService(db);
  return router;
}

// =====================================================
// PUBLIC ENDPOINTS (for subscription flow)
// =====================================================

/**
 * GET /api/compliance/creator/:creatorId/disclosure
 * Get subscription disclosure data for pre-purchase display
 * REQUIRED before any subscription purchase
 */
router.get('/creator/:creatorId/disclosure', async (req, res) => {
  try {
    const { creatorId } = req.params;

    const disclosure = await complianceService.getSubscriptionDisclosure(creatorId);

    res.json({
      success: true,
      disclosure,
      legal: {
        requiresAcknowledgment: true,
        disclosureVersion: '1.0',
        effectiveDate: '2026-01-29'
      }
    });
  } catch (error) {
    console.error('Disclosure fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch disclosure data'
    });
  }
});

/**
 * GET /api/compliance/creator/:creatorId/content-ratio
 * Get real-time content ratio for a creator
 */
router.get('/creator/:creatorId/content-ratio', async (req, res) => {
  try {
    const { creatorId } = req.params;

    const ratio = await complianceService.calculateContentRatio(creatorId);

    res.json({
      success: true,
      ratio,
      badges: {
        subscriptionFriendly: ratio.eligibleForBadge || false,
        ppvHeavy: ratio.ppvRatio > 25
      }
    });
  } catch (error) {
    console.error('Content ratio error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate content ratio'
    });
  }
});

/**
 * POST /api/compliance/subscription/acknowledge
 * Record that subscriber acknowledged disclosure before purchase
 * REQUIRED - subscription should not proceed without this
 */
router.post('/subscription/acknowledge', async (req, res) => {
  try {
    const { userId, creatorId, subscriptionId } = req.body;

    if (!userId || !creatorId || !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'userId, creatorId, and subscriptionId are required'
      });
    }

    await complianceService.recordDisclosureAcknowledgment(userId, creatorId, subscriptionId);

    res.json({
      success: true,
      message: 'Disclosure acknowledgment recorded',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Acknowledgment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record acknowledgment'
    });
  }
});

// =====================================================
// CREATOR ENDPOINTS (for dashboard)
// =====================================================

/**
 * GET /api/compliance/creator/my-status
 * Get compliance status for authenticated creator
 */
router.get('/creator/my-status', async (req, res) => {
  try {
    const creatorId = req.user?.id;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const ratio = await complianceService.calculateContentRatio(creatorId);
    const canPostPPV = await complianceService.canPostPPV(creatorId);
    const canSendSolicitation = await complianceService.canSendPPVSolicitation(creatorId);

    res.json({
      success: true,
      compliance: {
        status: ratio.complianceStatus,
        isCompliant: ratio.isCompliant,
        message: ratio.complianceMessage,
        actionRequired: ratio.actionRequired
      },
      contentRatio: {
        subscription: ratio.subscriptionRatio,
        free: ratio.freeRatio,
        ppv: ratio.ppvRatio,
        totalPosts: ratio.totalPosts
      },
      limits: {
        canPostPPV: canPostPPV.allowed,
        ppvReason: canPostPPV.reason || null,
        ppvRemaining: canPostPPV.ppvRemaining || 0,
        canSendPPVMessage: canSendSolicitation.allowed,
        ppvMessagesRemaining: canSendSolicitation.remaining || 0
      },
      badges: {
        subscriptionFriendly: ratio.eligibleForBadge || false
      },
      recommendations: getComplianceRecommendations(ratio)
    });
  } catch (error) {
    console.error('Creator status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch compliance status'
    });
  }
});

/**
 * POST /api/compliance/creator/check-ppv
 * Check if creator can post PPV content before allowing post
 */
router.post('/creator/check-ppv', async (req, res) => {
  try {
    const creatorId = req.user?.id || req.body.creatorId;

    const result = await complianceService.canPostPPV(creatorId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('PPV check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check PPV eligibility'
    });
  }
});

/**
 * POST /api/compliance/creator/check-solicitation
 * Check if creator can send PPV promotional message
 */
router.post('/creator/check-solicitation', async (req, res) => {
  try {
    const creatorId = req.user?.id || req.body.creatorId;

    const result = await complianceService.canSendPPVSolicitation(creatorId);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Solicitation check error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check solicitation eligibility'
    });
  }
});

/**
 * POST /api/compliance/creator/log-solicitation
 * Log that creator sent a PPV promotional message
 */
router.post('/creator/log-solicitation', async (req, res) => {
  try {
    const creatorId = req.user?.id || req.body.creatorId;
    const { messageType, recipientCount } = req.body;

    // First check if allowed
    const canSend = await complianceService.canSendPPVSolicitation(creatorId);

    if (!canSend.allowed) {
      return res.status(429).json({
        success: false,
        message: canSend.reason
      });
    }

    await complianceService.logPPVSolicitation(creatorId, messageType, recipientCount);

    res.json({
      success: true,
      message: 'Solicitation logged',
      remaining: canSend.remaining - 1
    });
  } catch (error) {
    console.error('Solicitation log error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log solicitation'
    });
  }
});

// =====================================================
// ADMIN ENDPOINTS (for monitoring)
// =====================================================

/**
 * GET /api/compliance/admin/overview
 * Get compliance overview for all creators
 */
router.get('/admin/overview', async (req, res) => {
  try {
    // Verify admin
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // This would query aggregated compliance data
    // For now, return structure
    res.json({
      success: true,
      overview: {
        totalCreators: 0,
        compliant: 0,
        warning: 0,
        restricted: 0,
        percentageCompliant: 0
      },
      recentViolations: [],
      topPPVCreators: []
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch overview'
    });
  }
});

/**
 * POST /api/compliance/admin/run-audit
 * Manually trigger compliance audit
 */
router.post('/admin/run-audit', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const results = await complianceService.runComplianceAudit();

    res.json({
      success: true,
      message: 'Compliance audit completed',
      results
    });
  } catch (error) {
    console.error('Audit error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run audit'
    });
  }
});

/**
 * GET /api/compliance/admin/violations
 * Get list of compliance violations
 */
router.get('/admin/violations', async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { status, page = 1, limit = 50 } = req.query;

    // Query creators with compliance issues
    // This would be implemented with actual DB query

    res.json({
      success: true,
      violations: [],
      pagination: { page, limit, total: 0 }
    });
  } catch (error) {
    console.error('Violations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch violations'
    });
  }
});

/**
 * POST /api/compliance/content/validate
 * Validate content/marketing text for prohibited phrases
 */
router.post('/content/validate', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      });
    }

    const result = complianceService.containsProhibitedPhrases(text);

    res.json({
      success: true,
      valid: !result.found,
      violation: result.found ? {
        phrase: result.phrase,
        suggestion: result.suggestion
      } : null,
      prohibitedPhrases: complianceService.getProhibitedPhrases()
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate content'
    });
  }
});

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function getComplianceRecommendations(ratio) {
  const recommendations = [];

  if (ratio.ppvRatio > 20) {
    recommendations.push({
      priority: 'high',
      message: 'Post more subscription content to improve your ratio',
      action: 'Create subscriber-only posts'
    });
  }

  if (ratio.ppvRatio > 0 && ratio.subscriptionRatio < 70) {
    recommendations.push({
      priority: 'medium',
      message: 'Consider converting some PPV content to subscription-only',
      action: 'Review your content strategy'
    });
  }

  if (ratio.eligibleForBadge === false && ratio.subscriptionRatio >= 80) {
    recommendations.push({
      priority: 'low',
      message: 'You\'re close to earning the Subscription Friendly badge!',
      action: 'Reach 90% subscription content'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      priority: 'info',
      message: 'Great job! Your content ratio is healthy.',
      action: 'Keep up the good work'
    });
  }

  return recommendations;
}

export default router;
