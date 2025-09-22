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
            fontDisplay: 'Orbitron',
            fontHeading: 'Rajdhani',
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

  // ===== GDPR PRIVACY API ROUTES =====
  
  // Data export (DSAR)
  app.get('/api/privacy/export', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Collect all user data
      const profile = await storage.getUserProfile(userId);
      const posts = await storage.getUserPosts(userId);
      const messages = await storage.getUserMessages(userId); 
      const transactions = await storage.getUserTransactions(userId);
      const kycRecords = await storage.getUserKYCRecords(userId);
      
      const exportData = {
        user: req.user,
        profile: profile || {},
        posts: posts || [],
        messages: messages || [],
        transactions: transactions || [],
        kyc: kycRecords || [],
        exportedAt: new Date().toISOString(),
        dataRetentionInfo: "Data is retained according to our retention policy. Contact support for details."
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=boyfanz-data-export-${userId}.json`);
      res.json(exportData);
    } catch (error) {
      console.error('Privacy export error:', error);
      res.status(500).json({ error: 'Failed to export user data' });
    }
  });

  // Data deletion request (DSAR)
  app.delete('/api/privacy/delete', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Soft delete approach - mark for deletion but keep for legal retention period
      await storage.markUserForDeletion(userId);
      
      // Immediately anonymize PII while preserving transaction records for compliance
      await storage.anonymizeUserData(userId);
      
      // Log deletion request for audit trail
      await storage.createAuditLog({
        userId,
        action: 'DATA_DELETION_REQUESTED',
        details: 'User requested full account and data deletion',
        timestamp: new Date()
      });
      
      res.json({ 
        message: 'Account deletion requested. Data will be permanently deleted within 30 days as per our retention policy.',
        deletionRequestId: `DEL_${userId}_${Date.now()}`
      });
    } catch (error) {
      console.error('Privacy deletion error:', error);
      res.status(500).json({ error: 'Failed to process deletion request' });
    }
  });

  // Privacy preferences
  app.post('/api/privacy/preferences', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { marketing, analytics, functional, performance } = req.body;
      
      const preferences = {
        userId,
        marketing: !!marketing,
        analytics: !!analytics,
        functional: !!functional,
        performance: !!performance,
        updatedAt: new Date()
      };
      
      await storage.updateUserPrivacyPreferences(preferences);
      
      res.json({ message: 'Privacy preferences updated successfully', preferences });
    } catch (error) {
      console.error('Privacy preferences error:', error);
      res.status(500).json({ error: 'Failed to update privacy preferences' });
    }
  });

  app.get('/api/privacy/preferences', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const preferences = await storage.getUserPrivacyPreferences(userId);
      
      res.json(preferences || {
        marketing: false,
        analytics: false,
        functional: true,
        performance: false
      });
    } catch (error) {
      console.error('Get privacy preferences error:', error);
      res.status(500).json({ error: 'Failed to get privacy preferences' });
    }
  });

  // Consent management endpoints
  app.post('/api/consent', csrfProtection, async (req, res) => {
    try {
      const { sessionId, consents } = req.body;
      const userId = req.user?.id || null;
      
      const consentRecord = {
        userId,
        sessionId,
        consents,
        timestamp: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      };
      
      await storage.recordConsent(consentRecord);
      
      res.json({ message: 'Consent recorded successfully' });
    } catch (error) {
      console.error('Consent recording error:', error);
      res.status(500).json({ error: 'Failed to record consent' });
    }
  });

  app.get('/api/consent/:sessionId', async (req, res) => {
    try {
      const { sessionId } = req.params;
      const consent = await storage.getConsent(sessionId);
      
      res.json(consent || { consents: {} });
    } catch (error) {
      console.error('Get consent error:', error);
      res.status(500).json({ error: 'Failed to get consent' });
    }
  });

  // ===== ADULT CONTENT COMPLIANCE ROUTES =====

  // Age verification gate
  app.post('/api/compliance/age-verify', csrfProtection, async (req, res) => {
    try {
      const { dateOfBirth, country, consentToAdultContent } = req.body;
      const sessionId = req.sessionID;
      const ip = req.ip || '127.0.0.1';
      
      if (!dateOfBirth || !country || !consentToAdultContent) {
        return res.status(400).json({ error: 'All fields are required for age verification' });
      }
      
      // Calculate age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Check geo-specific age requirements
      const geoResult = await geoBlockingService.checkGeoAccess({
        ip,
        userId: req.user?.id,
        feature: 'adult_content',
        type: 'age_verification'
      });
      
      if (!geoResult.allowed) {
        return res.status(403).json({ 
          error: 'Adult content not available in your region',
          details: geoResult.reason 
        });
      }
      
      const minimumAge = geoResult.metadata?.minimumAge || 18;
      
      if (age < minimumAge) {
        return res.status(403).json({ 
          error: `You must be at least ${minimumAge} years old to access this content`,
          minimumAge 
        });
      }
      
      // Record age verification in audit log
      await storage.createAuditLog({
        userId: req.user?.id,
        action: 'AGE_VERIFICATION_PASSED',
        details: JSON.stringify({
          sessionId,
          age,
          country,
          ip,
          minimumAge,
          userAgent: req.headers['user-agent']
        }),
        timestamp: new Date()
      });
      
      res.json({ 
        verified: true, 
        age,
        minimumAge,
        sessionId
      });
    } catch (error) {
      console.error('Age verification error:', error);
      res.status(500).json({ error: 'Age verification failed' });
    }
  });

  // 2257 compliance check for content creation
  app.post('/api/compliance/2257-check', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { mediaId, performerIds } = req.body;
      
      // Check if user has valid KYC
      const kycRecord = await storage.getKycVerification(userId);
      if (!kycRecord || kycRecord.status !== 'verified') {
        return res.status(403).json({
          error: '2257 compliance check failed',
          reason: 'Creator must complete KYC verification before publishing content',
          requiresKyc: true
        });
      }
      
      // Check if all performers have 2257 records
      const missingRecords = [];
      for (const performerId of performerIds || []) {
        const performerKyc = await storage.getKycVerification(performerId);
        if (!performerKyc || performerKyc.status !== 'verified') {
          missingRecords.push(performerId);
        }
      }
      
      if (missingRecords.length > 0) {
        return res.status(403).json({
          error: '2257 compliance check failed',
          reason: 'All performers must have verified 2257 records',
          missingRecords,
          requiresPerformerVerification: true
        });
      }
      
      // Log compliance check
      await storage.createAuditLog({
        userId,
        action: '2257_COMPLIANCE_VERIFIED',
        details: JSON.stringify({
          mediaId,
          performerIds,
          kycRecordId: kycRecord.id
        }),
        timestamp: new Date()
      });
      
      res.json({ 
        compliant: true,
        kycRecordId: kycRecord.id,
        verifiedPerformers: performerIds || []
      });
    } catch (error) {
      console.error('2257 compliance check error:', error);
      res.status(500).json({ error: '2257 compliance check failed' });
    }
  });

  // Custodian of Records notice endpoint
  app.get('/api/compliance/custodian-notice', async (req, res) => {
    try {
      const custodianInfo = {
        title: 'Custodian of Records Notice',
        notice: `Pursuant to 18 U.S.C. Section 2257, the following individual has been designated as the custodian of records for BoyFanz platform:`,
        custodian: {
          name: 'BoyFanz Legal Compliance Officer',
          company: 'BoyFanz LLC',
          address: {
            street: '123 Compliance Street',
            city: 'Legal City',
            state: 'CA',
            zipCode: '90210',
            country: 'United States'
          },
          businessHours: 'Monday through Friday, 9:00 AM to 5:00 PM PST'
        },
        statement: `All records required to be maintained by 18 U.S.C. Section 2257 and 2257A are kept by the custodian of records at the above address. All performers appearing in any visual depictions of sexually explicit conduct were 18 years of age or older at the time of creation.`,
        lastUpdated: new Date().toISOString(),
        contactInfo: {
          email: 'records@boyfanz.com',
          phone: '+1 (555) 123-4567'
        }
      };
      
      res.json(custodianInfo);
    } catch (error) {
      console.error('Custodian notice error:', error);
      res.status(500).json({ error: 'Failed to get custodian notice' });
    }
  });

  // Content publishing gate
  app.post('/api/compliance/content-publish-gate', csrfProtection, isAuthenticated, async (req, res) => {
    try {
      const userId = req.user!.id;
      const { contentId, contentType, performerIds } = req.body;
      
      // Check 2257 compliance
      const complianceCheck = await fetch(`${req.protocol}://${req.get('host')}/api/compliance/2257-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': req.headers.cookie || ''
        },
        body: JSON.stringify({
          mediaId: contentId,
          performerIds
        })
      });
      
      const complianceResult = await complianceCheck.json();
      
      if (!complianceResult.compliant) {
        return res.status(403).json({
          error: 'Content cannot be published due to compliance issues',
          complianceError: complianceResult
        });
      }
      
      // Check geo restrictions for content type
      const geoCheck = await geoBlockingService.checkGeoAccess({
        ip: req.ip || '127.0.0.1',
        userId,
        contentId,
        feature: 'content_publishing',
        type: contentType
      });
      
      if (!geoCheck.allowed) {
        return res.status(403).json({
          error: 'Content publishing not allowed in your region',
          geoRestriction: geoCheck
        });
      }
      
      // Log successful publish gate check
      await storage.createAuditLog({
        userId,
        action: 'CONTENT_PUBLISH_GATE_PASSED',
        details: JSON.stringify({
          contentId,
          contentType,
          performerIds,
          complianceRecordId: complianceResult.kycRecordId
        }),
        timestamp: new Date()
      });
      
      res.json({
        approved: true,
        contentId,
        complianceRecordId: complianceResult.kycRecordId,
        message: 'Content approved for publishing'
      });
    } catch (error) {
      console.error('Content publish gate error:', error);
      res.status(500).json({ error: 'Content publish gate check failed' });
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