// FANZ Paywall Compliance Service v2
// Updated for actual database schema
// Created: 2026-01-29

class PaywallComplianceService {
  constructor(pool) {
    this.pool = pool;

    // Compliance thresholds
    this.MINIMUM_SUBSCRIPTION_CONTENT_RATIO = 0.70;
    this.PPV_WARNING_THRESHOLD = 0.25;
    this.PPV_RESTRICTION_THRESHOLD = 0.40;
    this.MAX_PPV_SOLICITATIONS_PER_WEEK = 2;
  }

  /**
   * Calculate content ratio for a creator
   * Note: posts.author_id links to users, need to map to creator
   */
  async calculateContentRatio(creatorId) {
    try {
      // Get posts by visibility
      // visibility values: 'public', 'subscribers', 'private', 'unlisted'
      // PPV is tracked via price column (price > 0 = PPV)
      const result = await this.pool.query(`
        SELECT
          COALESCE(SUM(CASE WHEN visibility = 'public' THEN 1 ELSE 0 END), 0) as free_count,
          COALESCE(SUM(CASE WHEN visibility = 'subscribers' AND (price IS NULL OR price = 0) THEN 1 ELSE 0 END), 0) as subscription_count,
          COALESCE(SUM(CASE WHEN price > 0 THEN 1 ELSE 0 END), 0) as ppv_count,
          COUNT(*) as total_posts
        FROM posts
        WHERE deleted_at IS NULL
          AND created_at > NOW() - INTERVAL '90 days'
      `);

      const row = result.rows[0] || {};
      const freeCount = parseInt(row.free_count || 0);
      const subscriptionCount = parseInt(row.subscription_count || 0);
      const ppvCount = parseInt(row.ppv_count || 0);
      const totalPosts = parseInt(row.total_posts || 0);

      if (totalPosts === 0) {
        return {
          creatorId,
          freeRatio: 0,
          subscriptionRatio: 0,
          ppvRatio: 0,
          totalPosts: 0,
          isCompliant: true,
          complianceStatus: 'new_creator',
          complianceMessage: 'New creator - no posts yet'
        };
      }

      const freeRatio = Math.round((freeCount / totalPosts) * 100);
      const subscriptionRatio = Math.round((subscriptionCount / totalPosts) * 100);
      const ppvRatio = Math.round((ppvCount / totalPosts) * 100);
      const accessibleRatio = freeRatio + subscriptionRatio;

      const complianceResult = this.evaluateCompliance(accessibleRatio, ppvRatio);

      return {
        creatorId,
        freeCount,
        subscriptionCount,
        ppvCount,
        totalPosts,
        freeRatio,
        subscriptionRatio,
        ppvRatio,
        accessibleRatio,
        ...complianceResult,
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Content ratio calculation error:', error);
      throw error;
    }
  }

  evaluateCompliance(accessibleRatio, ppvRatio) {
    if (ppvRatio >= this.PPV_RESTRICTION_THRESHOLD * 100) {
      return {
        isCompliant: false,
        complianceStatus: 'restricted',
        complianceMessage: 'Too much PPV content. New subscriptions disabled.',
        actionRequired: 'Post more subscription-accessible content.'
      };
    }

    if (ppvRatio >= this.PPV_WARNING_THRESHOLD * 100) {
      return {
        isCompliant: false,
        complianceStatus: 'warning',
        complianceMessage: 'High PPV ratio. Please post more subscription content.',
        actionRequired: 'Increase subscription content to avoid restrictions.'
      };
    }

    if (accessibleRatio >= this.MINIMUM_SUBSCRIPTION_CONTENT_RATIO * 100) {
      return {
        isCompliant: true,
        complianceStatus: 'compliant',
        complianceMessage: 'Good standing.',
        actionRequired: null,
        eligibleForBadge: accessibleRatio >= 90
      };
    }

    return {
      isCompliant: false,
      complianceStatus: 'review',
      complianceMessage: 'Content ratio needs improvement.',
      actionRequired: 'Post more subscriber-accessible content.'
    };
  }

  async canPostPPV(creatorId) {
    const ratio = await this.calculateContentRatio(creatorId);

    if (ratio.ppvRatio >= this.PPV_WARNING_THRESHOLD * 100) {
      return {
        allowed: false,
        reason: `PPV limit reached (${ratio.ppvRatio}% of content). Post more subscription content first.`,
        currentRatio: ratio
      };
    }

    return {
      allowed: true,
      currentRatio: ratio
    };
  }

  async canSendPPVSolicitation(creatorId) {
    try {
      const result = await this.pool.query(`
        SELECT COUNT(*) as count
        FROM ppv_solicitation_log
        WHERE creator_id = $1
          AND sent_at > NOW() - INTERVAL '7 days'
      `, [creatorId]);

      const count = parseInt(result.rows[0]?.count || 0);

      if (count >= this.MAX_PPV_SOLICITATIONS_PER_WEEK) {
        return {
          allowed: false,
          reason: `Weekly limit of ${this.MAX_PPV_SOLICITATIONS_PER_WEEK} PPV messages reached.`,
          nextAvailable: 'in 7 days'
        };
      }

      return {
        allowed: true,
        remaining: this.MAX_PPV_SOLICITATIONS_PER_WEEK - count
      };
    } catch (error) {
      console.error('Solicitation check error:', error);
      return { allowed: true, remaining: this.MAX_PPV_SOLICITATIONS_PER_WEEK };
    }
  }

  async logPPVSolicitation(creatorId, messageType, recipientCount) {
    try {
      await this.pool.query(`
        INSERT INTO ppv_solicitation_log (creator_id, message_type, recipient_count)
        VALUES ($1, $2, $3)
      `, [creatorId, messageType, recipientCount]);
    } catch (error) {
      console.error('Log solicitation error:', error);
    }
  }

  async getSubscriptionDisclosure(creatorId) {
    const ratio = await this.calculateContentRatio(creatorId);

    return {
      creatorId,
      contentBreakdown: {
        subscription: ratio.subscriptionRatio + ratio.freeRatio,
        ppv: ratio.ppvRatio,
        free: ratio.freeRatio
      },
      disclosure: {
        title: "What Your Subscription Includes",
        included: [
          "Access to subscription-tier posts",
          "Direct messaging with creator",
          "Priority in comments"
        ],
        mayRequireAdditionalPurchase: ratio.ppvRatio > 0 ? [
          "Some premium content may be offered as pay-per-view"
        ] : [],
        transparency: `This creator posts ${ratio.accessibleRatio}% of content accessible to subscribers.`
      },
      complianceStatus: ratio.complianceStatus,
      subscriptionFriendlyBadge: ratio.eligibleForBadge || false
    };
  }

  async recordDisclosureAcknowledgment(userId, creatorId, subscriptionId) {
    try {
      const ratio = await this.calculateContentRatio(creatorId);
      await this.pool.query(`
        UPDATE subscriptions
        SET
          disclosure_acknowledged = true,
          disclosure_acknowledged_at = NOW(),
          content_ratio_at_subscription = $1
        WHERE id = $2
      `, [JSON.stringify(ratio), subscriptionId]);
      return { success: true };
    } catch (error) {
      console.error('Record acknowledgment error:', error);
      return { success: false };
    }
  }

  getProhibitedPhrases() {
    return [
      'full access',
      'unlimited access',
      'all content',
      'everything included',
      'complete access'
    ];
  }

  containsProhibitedPhrases(text) {
    const lowerText = text.toLowerCase();
    for (const phrase of this.getProhibitedPhrases()) {
      if (lowerText.includes(phrase)) {
        return {
          found: true,
          phrase,
          suggestion: 'subscription content access'
        };
      }
    }
    return { found: false };
  }
}

export default PaywallComplianceService;
