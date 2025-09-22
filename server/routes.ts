import { Express } from 'express';
import express from 'express';
import { storage } from './storage';
import { csrfProtection, setupCSRFTokenEndpoint } from './middleware/csrf';
import { isAuthenticated, requireAdmin } from './middleware/auth';
import { ObjectStorageService } from './objectStorage';

const objectStorageService = new ObjectStorageService();
import { enhancedPaymentService } from './services/enhancedPaymentService';
import { financialLedgerService } from './services/financialLedgerService';
import { messageSecurityService } from './services/messageSecurityService';
import { performanceOptimizationService } from './services/performanceOptimizationService';
import { contentManagementService } from './services/contentManagementService';
import { aiCreatorToolsService } from './services/aiCreatorToolsService';
import { identityVerificationService } from './services/identityVerificationService';
import { geoBlockingService } from './services/geoBlockingService';
import { comprehensiveAnalyticsService } from './services/comprehensiveAnalyticsService';
import Stripe from 'stripe';
import { z } from 'zod';

export function registerRoutes(app: Express) {
  // Set up CSRF token endpoint
  setupCSRFTokenEndpoint(app);

  // ===== THEME ROUTES =====
  
  // Get active theme
  app.get('/api/themes/active', async (req, res) => {
    try {
      const activeTheme = await storage.getActiveTheme();
      if (!activeTheme) {
        // Return a default theme if none is active
        return res.json({
          id: 'default',
          name: 'BoyFanz Dark',
          isActive: true,
          colors: {
            primary: 'hsl(0, 72%, 51%)',
            secondary: 'hsl(45, 93%, 47%)',
            background: 'hsl(0, 0%, 7%)',
            foreground: 'hsl(0, 0%, 98%)'
          },
          typography: {
            fontDisplay: 'Oxanium',
            fontHeading: 'Montserrat',
            fontBody: 'Inter'
          },
          effects: {
            neonIntensity: 0.8,
            glowEnabled: true,
            smokyBackground: true,
            flickerEnabled: true
          }
        });
      }
      res.json(activeTheme);
    } catch (error) {
      console.error('Failed to get active theme:', error);
      res.status(500).json({ error: 'Failed to get active theme' });
    }
  });

  // ===== ENHANCED PAYMENT ROUTES WITH SECURITY FIXES =====

  // Apple Pay merchant validation
  app.post('/api/payments/apple-pay/validate', async (req, res) => {
    try {
      const { validationURL, domainName } = req.body;
      
      const session = await enhancedPaymentService.validateApplePayMerchant(
        validationURL, 
        domainName
      );
      
      res.json(session);
    } catch (error) {
      console.error('Apple Pay validation failed:', error);
      res.status(400).json({ error: 'Merchant validation failed' });
    }
  });

  // Apple Pay payment processing with server-side validation
  app.post('/api/payments/apple-pay/process', isAuthenticated, async (req, res) => {
    try {
      const { paymentToken, productId } = req.body; // Remove client-supplied amount
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // SECURITY: Use fixed amount for demo - in production, get from product catalog
      const amount = 10.00; // Fixed amount for demo
      const currency = 'USD';
      
      const result = await enhancedPaymentService.processApplePayPayment(
        paymentToken, 
        amount, 
        currency, 
        userId
      );
      
      res.json(result);
    } catch (error) {
      console.error('Apple Pay processing failed:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Google Pay payment processing with server-side validation
  app.post('/api/payments/google-pay/process', isAuthenticated, async (req, res) => {
    try {
      const { paymentMethodData, productId } = req.body; // Remove client-supplied amount
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // SECURITY: Use fixed amount for demo - in production, get from product catalog
      const amount = 10.00; // Fixed amount for demo
      const currency = 'USD';
      
      const result = await enhancedPaymentService.processGooglePayPayment(
        paymentMethodData, 
        amount, 
        currency, 
        userId
      );
      
      res.json(result);
    } catch (error) {
      console.error('Google Pay processing failed:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  // Enhanced Stripe payment intents with server-side validation
  app.post('/api/payments/stripe/payment-intent', isAuthenticated, async (req, res) => {
    try {
      const { productId, savePaymentMethod, paymentMethodId } = req.body; // Remove client-supplied amount
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // SECURITY: Get price from server-side product catalog, not client
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Server-side amount validation
      const amount = product.price;
      const currency = product.currency || 'USD';
      
      let customerId;
      const user = await storage.getUser(userId);
      customerId = await enhancedPaymentService.getOrCreateStripeCustomer(
        userId, 
        user?.email, 
        user?.username
      );

      const result = await enhancedPaymentService.createPaymentIntent({
        amount,
        currency,
        customerId,
        paymentMethodId,
        savePaymentMethod,
        metadata: {
          user_id: userId,
          product_id: productId,
          platform: 'boyfanz'
        }
      });
      
      res.json(result);
    } catch (error) {
      console.error('Stripe payment intent creation failed:', error);
      res.status(500).json({ error: 'Payment intent creation failed' });
    }
  });

  // Get saved payment methods
  app.get('/api/payments/stripe/payment-methods', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const paymentMethods = await enhancedPaymentService.getSavedPaymentMethods(userId);
      res.json(paymentMethods);
    } catch (error) {
      console.error('Failed to get payment methods:', error);
      res.status(500).json({ error: 'Failed to get payment methods' });
    }
  });

  // Delete saved payment method
  app.delete('/api/payments/stripe/payment-methods/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      await enhancedPaymentService.deleteSavedPaymentMethod(id, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Failed to delete payment method:', error);
      res.status(500).json({ error: 'Failed to delete payment method' });
    }
  });

  // SECURITY: Stripe webhook validation for payment confirmations
  app.post('/api/webhooks/stripe', express.raw({type: 'application/json'}), async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      
      if (!webhookSecret || !sig) {
        console.error('Missing Stripe webhook secret or signature');
        return res.status(400).send('Webhook signature verification failed');
      }

      // Verify webhook signature using Stripe library
      let event;
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
          apiVersion: '2023-10-16'
        });
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send('Webhook signature verification failed');
      }

      // Handle payment events
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          await financialLedgerService.updateTransactionStatus(
            paymentIntent.metadata.transaction_id,
            'completed',
            paymentIntent.id
          );
          console.log(`💰 Payment confirmed via webhook: ${paymentIntent.id}`);
          break;

        case 'payment_intent.payment_failed':
          const failedIntent = event.data.object;
          await financialLedgerService.updateTransactionStatus(
            failedIntent.metadata.transaction_id,
            'failed',
            failedIntent.id,
            { failure_reason: failedIntent.last_payment_error?.message }
          );
          console.log(`❌ Payment failed via webhook: ${failedIntent.id}`);
          break;

        default:
          console.log(`Unhandled Stripe event type: ${event.type}`);
      }

      res.json({received: true});
    } catch (error) {
      console.error('Stripe webhook processing failed:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // ===== FINANCIAL LEDGER ROUTES =====

  // Get user transaction history
  app.get('/api/transactions', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { page = 1, limit = 50, type } = req.query;
      const transactions = await financialLedgerService.getUserTransactions(userId, {
        page: Number(page),
        limit: Number(limit),
        type: type as string
      });

      res.json(transactions);
    } catch (error) {
      console.error('Failed to get transactions:', error);
      res.status(500).json({ error: 'Failed to get transactions' });
    }
  });

  // Get transaction details
  app.get('/api/transactions/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const transaction = await financialLedgerService.getTransactionDetails(id, userId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      res.json(transaction);
    } catch (error) {
      console.error('Failed to get transaction:', error);
      res.status(500).json({ error: 'Failed to get transaction' });
    }
  });

  // ===== CONTENT MANAGEMENT ROUTES =====

  // DMCA takedown request
  app.post('/api/content/dmca/takedown', csrfProtection, async (req, res) => {
    try {
      const { contentId, claimantInfo, description } = req.body;
      
      const result = await contentManagementService.submitDMCATakedown({
        contentId,
        claimantInfo,
        description,
        submittedBy: req.user?.id || 'anonymous'
      });

      res.json(result);
    } catch (error) {
      console.error('DMCA takedown failed:', error);
      res.status(500).json({ error: 'DMCA takedown failed' });
    }
  });

  // Create content bundle
  app.post('/api/content/bundles', isAuthenticated, csrfProtection, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const bundleData = {
        ...req.body,
        creatorId: userId
      };

      const result = await contentManagementService.createContentBundle(bundleData);
      res.json(result);
    } catch (error) {
      console.error('Bundle creation failed:', error);
      res.status(500).json({ error: 'Bundle creation failed' });
    }
  });

  // Get content bundles
  app.get('/api/content/bundles', async (req, res) => {
    try {
      const { creatorId, limit = 20 } = req.query;
      const bundles = await contentManagementService.getContentBundles(
        creatorId as string,
        Number(limit)
      );
      res.json(bundles);
    } catch (error) {
      console.error('Failed to get bundles:', error);
      res.status(500).json({ error: 'Failed to get bundles' });
    }
  });

  // ===== AI CREATOR TOOLS ROUTES =====

  // Generate auto-captions for video
  app.post('/api/ai/captions', isAuthenticated, async (req, res) => {
    try {
      const { videoUrl, language = 'en' } = req.body;
      const result = await aiCreatorToolsService.generateAutoCaptions(videoUrl, language);
      res.json(result);
    } catch (error) {
      console.error('Auto-caption generation failed:', error);
      res.status(500).json({ error: 'Caption generation failed' });
    }
  });

  // Analyze thumbnail effectiveness
  app.post('/api/ai/thumbnails/analyze', isAuthenticated, async (req, res) => {
    try {
      const { thumbnailUrl, contentMetadata } = req.body;
      const analysis = await aiCreatorToolsService.analyzeThumbnail(thumbnailUrl, contentMetadata);
      res.json(analysis);
    } catch (error) {
      console.error('Thumbnail analysis failed:', error);
      res.status(500).json({ error: 'Thumbnail analysis failed' });
    }
  });

  // Generate content optimization suggestions
  app.post('/api/ai/content/optimize', isAuthenticated, async (req, res) => {
    try {
      const { contentId } = req.body;
      const optimization = await aiCreatorToolsService.optimizeContent(contentId);
      res.json(optimization);
    } catch (error) {
      console.error('Content optimization failed:', error);
      res.status(500).json({ error: 'Content optimization failed' });
    }
  });

  // Generate engagement analytics
  app.get('/api/ai/analytics/:creatorId', isAuthenticated, async (req, res) => {
    try {
      const { creatorId } = req.params;
      const { timeframe = 'weekly' } = req.query;
      
      // Check if user can access this creator's analytics
      if (req.user?.id !== creatorId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const analytics = await aiCreatorToolsService.generateEngagementAnalytics(
        creatorId,
        timeframe as any
      );
      res.json(analytics);
    } catch (error) {
      console.error('Analytics generation failed:', error);
      res.status(500).json({ error: 'Analytics generation failed' });
    }
  });

  // ===== KYC/IDENTITY VERIFICATION ROUTES =====

  // Initiate KYC verification
  app.post('/api/kyc/verify', isAuthenticated, csrfProtection, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { type, personalInfo, documents } = req.body;
      const result = await identityVerificationService.initiateKYCVerification({
        userId,
        type,
        personalInfo,
        documents
      });

      res.json(result);
    } catch (error) {
      console.error('KYC verification failed:', error);
      res.status(500).json({ error: 'KYC verification failed' });
    }
  });

  // Check payment compliance
  app.post('/api/payments/compliance-check', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { amount, type, metadata } = req.body;
      const result = await identityVerificationService.checkPaymentCompliance({
        userId,
        amount,
        type,
        metadata
      });

      res.json(result);
    } catch (error) {
      console.error('Compliance check failed:', error);
      res.status(500).json({ error: 'Compliance check failed' });
    }
  });

  // ===== GEO-BLOCKING ROUTES =====

  // Check geo access for content
  app.post('/api/geo/check-access', async (req, res) => {
    try {
      const { contentId, feature, type } = req.body;
      const ip = req.ip || req.connection.remoteAddress || '127.0.0.1';
      
      const result = await geoBlockingService.checkGeoAccess({
        ip,
        userId: req.user?.id,
        contentId,
        feature,
        type
      });

      res.json(result);
    } catch (error) {
      console.error('Geo access check failed:', error);
      res.status(500).json({ error: 'Geo access check failed' });
    }
  });

  // Create geo-restriction (admin only)
  app.post('/api/geo/restrictions', requireAdmin, csrfProtection, async (req, res) => {
    try {
      const { type, targetId, countries, isWhitelist, reason, expiresAt } = req.body;
      const createdBy = req.user?.id || 'admin';

      const result = await geoBlockingService.createGeoRestriction({
        type,
        targetId,
        countries,
        isWhitelist,
        reason,
        createdBy,
        expiresAt: expiresAt ? new Date(expiresAt) : undefined
      });

      res.json(result);
    } catch (error) {
      console.error('Geo restriction creation failed:', error);
      res.status(500).json({ error: 'Geo restriction creation failed' });
    }
  });

  // ===== ANALYTICS ROUTES =====

  // Track analytics event
  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { eventType, eventName, properties, revenue, currency } = req.body;
      const sessionId = req.sessionID;
      const userId = req.user?.id;

      await comprehensiveAnalyticsService.trackEvent({
        userId,
        sessionId,
        eventType,
        eventName,
        properties,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        referrer: req.headers.referer,
        pageUrl: req.headers.origin,
        revenue,
        currency
      });

      res.json({ success: true });
    } catch (error) {
      console.error('Analytics tracking failed:', error);
      res.status(500).json({ error: 'Analytics tracking failed' });
    }
  });

  // Get user behavior insights
  app.get('/api/analytics/behavior/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe = '30d' } = req.query;

      // Check access permissions
      if (req.user?.id !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied' });
      }

      const insights = await comprehensiveAnalyticsService.generateUserBehaviorInsights(
        userId,
        timeframe as string
      );

      res.json(insights);
    } catch (error) {
      console.error('Behavior insights failed:', error);
      res.status(500).json({ error: 'Behavior insights failed' });
    }
  });

  // Get payment analytics (admin only)
  app.get('/api/analytics/payments', requireAdmin, async (req, res) => {
    try {
      const { timeframe = '30d' } = req.query;
      const analytics = await comprehensiveAnalyticsService.generatePaymentAnalytics(
        timeframe as string
      );
      res.json(analytics);
    } catch (error) {
      console.error('Payment analytics failed:', error);
      res.status(500).json({ error: 'Payment analytics failed' });
    }
  });

  // Create alert rule (admin only)
  app.post('/api/analytics/alerts', requireAdmin, csrfProtection, async (req, res) => {
    try {
      const { name, metric, condition, threshold, severity, channels, recipients, cooldownMinutes } = req.body;
      
      const result = await comprehensiveAnalyticsService.createAlertRule({
        name,
        metric,
        condition,
        threshold,
        severity,
        channels,
        recipients,
        cooldownMinutes
      });

      res.json(result);
    } catch (error) {
      console.error('Alert rule creation failed:', error);
      res.status(500).json({ error: 'Alert rule creation failed' });
    }
  });

  // ===== MESSAGE SECURITY ROUTES =====

  // Validate message before sending
  app.post('/api/messages/validate', isAuthenticated, async (req, res) => {
    try {
      const { content, recipientId, type } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const validation = await messageSecurityService.validateMessage({
        content,
        senderId,
        recipientId,
        type
      });

      res.json(validation);
    } catch (error) {
      console.error('Message validation failed:', error);
      res.status(500).json({ error: 'Message validation failed' });
    }
  });

  // ===== GENERAL API ROUTES =====

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Get current user
  app.get('/api/user', isAuthenticated, (req, res) => {
    res.json(req.user);
  });

  console.log('🛡️ Enhanced routes registered with comprehensive security features');
}