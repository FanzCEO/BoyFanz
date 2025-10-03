// FANZ Service Registry & Orchestration Setup
// Registers all platform services and defines common workflows

import ServiceOrchestrationEngine from '../services/serviceOrchestrationEngine.js';

// Import all service instances
import authService from '../services/authService.js';
import userService from '../services/userService.js';
import contentService from '../services/contentService.js';
import subscriptionService from '../services/subscriptionService.js';
import paymentService from '../services/paymentService.js';
import streamingService from '../services/streamingService.js';
import moderationService from '../services/moderationService.js';
import notificationService from '../services/notificationService.js';
import aiService from '../services/aiService.js';
import analyticsService from '../services/analyticsService.js';
import searchService from '../services/searchService.js';
import socialService from '../services/socialService.js';
import mediaService from '../services/mediaService.js';
import messageService from '../services/messageService.js';
import complianceService from '../services/complianceService.js';
import securityService from '../services/securityService.js';
import gamificationService from '../services/gamificationService.js';
import apiGatewayService from '../services/apiGatewayService.js';
import revenueOptimizationService from '../services/revenueOptimizationService.js';

class ServiceRegistry {
  constructor() {
    this.orchestrationEngine = new ServiceOrchestrationEngine();
    this.initialized = false;
  }

  /**
   * Initialize and register all platform services
   */
  async initialize() {
    if (this.initialized) {
      console.log('🎭 Service registry already initialized');
      return this.orchestrationEngine;
    }

    console.log('🎭 Initializing FANZ Service Registry...');

    try {
      // Register core infrastructure services
      await this.registerInfrastructureServices();
      
      // Register business logic services
      await this.registerBusinessServices();
      
      // Register AI and analytics services
      await this.registerIntelligenceServices();
      
      // Define common workflows
      await this.registerWorkflows();
      
      // Set up event-based triggers
      this.orchestrationEngine.setupTriggers();
      
      this.initialized = true;
      console.log('✅ Service registry initialization complete');
      
      return this.orchestrationEngine;
    } catch (error) {
      console.error('❌ Service registry initialization failed:', error);
      throw error;
    }
  }

  /**
   * Register infrastructure and gateway services
   */
  async registerInfrastructureServices() {
    console.log('📡 Registering infrastructure services...');

    // API Gateway Service
    this.orchestrationEngine.registerService({
      name: 'apiGateway',
      instance: apiGatewayService,
      healthCheck: () => apiGatewayService.getHealthStatus(),
      capabilities: ['routing', 'rate-limiting', 'load-balancing', 'circuit-breaker'],
      priority: 'critical',
      dependencies: [],
      timeout: 5000
    });

    // Security Service
    this.orchestrationEngine.registerService({
      name: 'security',
      instance: securityService,
      healthCheck: async () => {
        try {
          await securityService.validateSecurityConfig();
          return { healthy: true, component: 'security', timestamp: new Date() };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['encryption', 'threat-detection', 'access-control', 'audit'],
      priority: 'critical',
      dependencies: [],
      timeout: 10000
    });

    // Compliance Service
    this.orchestrationEngine.registerService({
      name: 'compliance',
      instance: complianceService,
      healthCheck: async () => {
        try {
          const status = await complianceService.checkComplianceStatus();
          return { healthy: true, compliance: status };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['age-verification', 'content-classification', 'gdpr', 'record-keeping'],
      priority: 'critical',
      dependencies: ['security'],
      timeout: 15000
    });
  }

  /**
   * Register core business logic services
   */
  async registerBusinessServices() {
    console.log('🏢 Registering business services...');

    // Auth Service
    this.orchestrationEngine.registerService({
      name: 'auth',
      instance: authService,
      healthCheck: async () => {
        try {
          // Simple health check - verify JWT functions work
          const testToken = authService.generateToken({ test: true }, '1s');
          const decoded = authService.verifyToken(testToken);
          return { healthy: !!decoded, component: 'auth' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['authentication', 'authorization', 'jwt', 'session-management'],
      priority: 'critical',
      dependencies: ['security'],
      timeout: 10000
    });

    // User Service
    this.orchestrationEngine.registerService({
      name: 'user',
      instance: userService,
      healthCheck: async () => {
        try {
          // Check database connectivity
          const result = await userService.getUserCount();
          return { healthy: true, userCount: result, component: 'user' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['user-management', 'profile-management', 'preferences'],
      priority: 'high',
      dependencies: ['auth', 'security'],
      timeout: 15000
    });

    // Content Service
    this.orchestrationEngine.registerService({
      name: 'content',
      instance: contentService,
      healthCheck: async () => {
        try {
          const stats = await contentService.getContentStats();
          return { healthy: true, stats, component: 'content' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['content-upload', 'content-management', 'metadata', 'versioning'],
      priority: 'high',
      dependencies: ['user', 'media', 'moderation'],
      timeout: 20000
    });

    // Media Service
    this.orchestrationEngine.registerService({
      name: 'media',
      instance: mediaService,
      healthCheck: async () => {
        try {
          const status = await mediaService.getStorageStatus();
          return { healthy: true, storage: status, component: 'media' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['file-upload', 'transcoding', 'cdn', 'watermarking'],
      priority: 'high',
      dependencies: ['security'],
      timeout: 30000
    });

    // Payment Service
    this.orchestrationEngine.registerService({
      name: 'payment',
      instance: paymentService,
      healthCheck: async () => {
        try {
          const gatewayStatus = await paymentService.checkGatewayHealth();
          return { healthy: gatewayStatus.healthy, gateways: gatewayStatus };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['payment-processing', 'subscription-management', 'payouts', 'fraud-detection'],
      priority: 'critical',
      dependencies: ['user', 'security', 'compliance'],
      timeout: 25000
    });

    // Subscription Service
    this.orchestrationEngine.registerService({
      name: 'subscription',
      instance: subscriptionService,
      healthCheck: async () => {
        try {
          const stats = await subscriptionService.getSubscriptionStats();
          return { healthy: true, stats, component: 'subscription' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['subscription-lifecycle', 'billing', 'tier-management'],
      priority: 'high',
      dependencies: ['user', 'payment'],
      timeout: 15000
    });

    // Streaming Service
    this.orchestrationEngine.registerService({
      name: 'streaming',
      instance: streamingService,
      healthCheck: async () => {
        try {
          const status = await streamingService.getStreamingStatus();
          return { healthy: true, streaming: status, component: 'streaming' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['live-streaming', 'video-on-demand', 'rtmp', 'hls'],
      priority: 'high',
      dependencies: ['user', 'media', 'payment'],
      timeout: 20000
    });

    // Moderation Service
    this.orchestrationEngine.registerService({
      name: 'moderation',
      instance: moderationService,
      healthCheck: async () => {
        try {
          const queueStatus = await moderationService.getQueueStatus();
          return { healthy: true, queue: queueStatus, component: 'moderation' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['content-moderation', 'ai-detection', 'manual-review', 'policy-enforcement'],
      priority: 'critical',
      dependencies: ['content', 'ai', 'compliance'],
      timeout: 15000
    });

    // Social Service
    this.orchestrationEngine.registerService({
      name: 'social',
      instance: socialService,
      healthCheck: async () => {
        try {
          const features = await socialService.getActiveFeatures();
          return { healthy: true, features, component: 'social' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['social-features', 'messaging', 'comments', 'likes', 'follows'],
      priority: 'normal',
      dependencies: ['user', 'content', 'notification'],
      timeout: 15000
    });

    // Message Service
    this.orchestrationEngine.registerService({
      name: 'message',
      instance: messageService,
      healthCheck: async () => {
        try {
          const stats = await messageService.getMessageStats();
          return { healthy: true, stats, component: 'message' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['direct-messaging', 'group-messaging', 'message-encryption', 'file-sharing'],
      priority: 'normal',
      dependencies: ['user', 'media', 'moderation'],
      timeout: 15000
    });

    // Notification Service
    this.orchestrationEngine.registerService({
      name: 'notification',
      instance: notificationService,
      healthCheck: async () => {
        try {
          const providers = await notificationService.getProviderStatus();
          return { healthy: true, providers, component: 'notification' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['push-notifications', 'email', 'sms', 'in-app-notifications'],
      priority: 'normal',
      dependencies: ['user'],
      timeout: 10000
    });
  }

  /**
   * Register AI, analytics, and intelligence services
   */
  async registerIntelligenceServices() {
    console.log('🤖 Registering intelligence services...');

    // AI Service
    this.orchestrationEngine.registerService({
      name: 'ai',
      instance: aiService,
      healthCheck: async () => {
        try {
          const models = await aiService.getModelStatus();
          return { healthy: true, models, component: 'ai' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['content-analysis', 'recommendation', 'moderation-ai', 'personalization'],
      priority: 'high',
      dependencies: ['content', 'user'],
      timeout: 30000
    });

    // Analytics Service
    this.orchestrationEngine.registerService({
      name: 'analytics',
      instance: analyticsService,
      healthCheck: async () => {
        try {
          const status = await analyticsService.getAnalyticsHealth();
          return { healthy: true, status, component: 'analytics' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['user-analytics', 'content-analytics', 'revenue-analytics', 'performance-metrics'],
      priority: 'normal',
      dependencies: ['user', 'content', 'payment'],
      timeout: 20000
    });

    // Search Service
    this.orchestrationEngine.registerService({
      name: 'search',
      instance: searchService,
      healthCheck: async () => {
        try {
          const indexStatus = await searchService.getIndexHealth();
          return { healthy: true, indices: indexStatus, component: 'search' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['content-search', 'user-search', 'full-text-search', 'faceted-search'],
      priority: 'normal',
      dependencies: ['content', 'user'],
      timeout: 15000
    });

    // Revenue Optimization Service
    this.orchestrationEngine.registerService({
      name: 'revenueOptimization',
      instance: revenueOptimizationService,
      healthCheck: async () => {
        try {
          const status = await revenueOptimizationService.getSystemHealth();
          return { healthy: true, aiModels: status, component: 'revenueOptimization' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['pricing-optimization', 'revenue-prediction', 'audience-segmentation', 'content-scheduling'],
      priority: 'high',
      dependencies: ['user', 'content', 'payment', 'analytics', 'ai'],
      timeout: 25000
    });

    // Gamification Service
    this.orchestrationEngine.registerService({
      name: 'gamification',
      instance: gamificationService,
      healthCheck: async () => {
        try {
          const systems = await gamificationService.getSystemStatus();
          return { healthy: true, systems, component: 'gamification' };
        } catch (error) {
          return { healthy: false, error: error.message };
        }
      },
      capabilities: ['achievements', 'badges', 'leaderboards', 'rewards'],
      priority: 'low',
      dependencies: ['user', 'content', 'social'],
      timeout: 15000
    });
  }

  /**
   * Register common platform workflows
   */
  async registerWorkflows() {
    console.log('⚡ Registering platform workflows...');

    // User Onboarding Workflow
    this.orchestrationEngine.registerWorkflow({
      name: 'userOnboarding',
      description: 'Complete user onboarding process from registration to content creation',
      steps: [
        {
          service: 'auth',
          action: 'createUser',
          params: { userData: '${userInput}' },
          outputKey: 'user'
        },
        {
          service: 'compliance',
          action: 'performAgeVerification',
          params: { userId: '${user.id}', documents: '${userInput.documents}' },
          outputKey: 'verification'
        },
        {
          service: 'user',
          action: 'setupProfile',
          params: { userId: '${user.id}', profileData: '${userInput.profile}' },
          outputKey: 'profile'
        },
        {
          service: 'payment',
          action: 'setupPayoutMethod',
          params: { userId: '${user.id}', payoutData: '${userInput.payout}' },
          outputKey: 'payout',
          retries: 2
        },
        {
          service: 'notification',
          action: 'sendWelcomeNotification',
          params: { userId: '${user.id}', profile: '${profile}' }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'user.registration.started',
          conditions: [
            { field: 'userType', operator: 'equals', value: 'creator' }
          ]
        }
      ],
      timeout: 120000, // 2 minutes
      rollbackEnabled: true
    });

    // Content Publishing Workflow
    this.orchestrationEngine.registerWorkflow({
      name: 'contentPublishing',
      description: 'Full content publishing pipeline with moderation and optimization',
      steps: [
        {
          service: 'media',
          action: 'uploadContent',
          params: { content: '${contentData}', userId: '${userId}' },
          outputKey: 'uploadResult'
        },
        {
          service: 'ai',
          action: 'analyzeContent',
          params: { contentId: '${uploadResult.contentId}' },
          outputKey: 'analysis'
        },
        {
          service: 'moderation',
          action: 'moderateContent',
          params: { 
            contentId: '${uploadResult.contentId}', 
            analysis: '${analysis}',
            priority: '${priority}'
          },
          outputKey: 'moderation'
        },
        {
          service: 'revenueOptimization',
          action: 'optimizeContentPricing',
          params: { 
            userId: '${userId}',
            contentData: '${analysis}',
            userTier: '${userTier}'
          },
          outputKey: 'pricing'
        },
        {
          service: 'content',
          action: 'publishContent',
          params: { 
            contentId: '${uploadResult.contentId}',
            moderation: '${moderation}',
            pricing: '${pricing}'
          },
          outputKey: 'publication'
        },
        {
          service: 'search',
          action: 'indexContent',
          params: { contentId: '${uploadResult.contentId}', metadata: '${analysis}' }
        },
        {
          service: 'analytics',
          action: 'trackContentEvent',
          params: { 
            event: 'content.published',
            contentId: '${uploadResult.contentId}',
            userId: '${userId}'
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'content.upload.completed',
          conditions: [
            { field: 'status', operator: 'equals', value: 'pending_review' }
          ]
        }
      ],
      timeout: 300000, // 5 minutes
      rollbackEnabled: true
    });

    // Payment Processing Workflow
    this.orchestrationEngine.registerWorkflow({
      name: 'paymentProcessing',
      description: 'Secure payment processing with fraud detection and compliance',
      steps: [
        {
          service: 'security',
          action: 'validatePaymentRequest',
          params: { paymentData: '${paymentRequest}' },
          outputKey: 'validation'
        },
        {
          service: 'payment',
          action: 'processPayment',
          params: { 
            paymentData: '${paymentRequest}',
            validation: '${validation}'
          },
          outputKey: 'paymentResult',
          retries: 3
        },
        {
          service: 'subscription',
          action: 'updateSubscription',
          params: { 
            userId: '${paymentRequest.userId}',
            payment: '${paymentResult}'
          },
          outputKey: 'subscription'
        },
        {
          service: 'analytics',
          action: 'recordRevenue',
          params: { 
            payment: '${paymentResult}',
            userId: '${paymentRequest.userId}'
          }
        },
        {
          service: 'notification',
          action: 'sendPaymentConfirmation',
          params: { 
            userId: '${paymentRequest.userId}',
            payment: '${paymentResult}'
          }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'payment.initiated',
          conditions: [
            { field: 'amount', operator: 'greater_than', value: 0 }
          ]
        }
      ],
      timeout: 60000, // 1 minute
      rollbackEnabled: true
    });

    // Stream Setup Workflow
    this.orchestrationEngine.registerWorkflow({
      name: 'streamSetup',
      description: 'Live streaming setup with quality assurance and monetization',
      steps: [
        {
          service: 'streaming',
          action: 'createStream',
          params: { 
            userId: '${userId}',
            streamConfig: '${streamConfig}'
          },
          outputKey: 'stream'
        },
        {
          service: 'payment',
          action: 'setupStreamMonetization',
          params: { 
            streamId: '${stream.id}',
            userId: '${userId}',
            pricing: '${streamConfig.pricing}'
          },
          outputKey: 'monetization'
        },
        {
          service: 'moderation',
          action: 'enableStreamModeration',
          params: { streamId: '${stream.id}' },
          outputKey: 'moderation'
        },
        {
          service: 'notification',
          action: 'notifyFollowers',
          params: { 
            userId: '${userId}',
            streamId: '${stream.id}',
            message: 'Stream starting soon!'
          }
        },
        {
          service: 'analytics',
          action: 'initStreamTracking',
          params: { streamId: '${stream.id}', userId: '${userId}' }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'stream.setup.requested',
          conditions: [
            { field: 'userType', operator: 'equals', value: 'creator' }
          ]
        }
      ],
      timeout: 90000, // 1.5 minutes
      rollbackEnabled: true
    });

    // Revenue Optimization Workflow
    this.orchestrationEngine.registerWorkflow({
      name: 'revenueOptimization',
      description: 'Daily revenue optimization and pricing adjustments',
      steps: [
        {
          service: 'analytics',
          action: 'generateRevenueReport',
          params: { period: 'daily', includePredictions: true },
          outputKey: 'report'
        },
        {
          service: 'revenueOptimization',
          action: 'analyzePerformanceMetrics',
          params: { report: '${report}' },
          outputKey: 'analysis'
        },
        {
          service: 'revenueOptimization',
          action: 'generatePricingRecommendations',
          params: { analysis: '${analysis}' },
          outputKey: 'recommendations'
        },
        {
          service: 'user',
          action: 'sendOptimizationRecommendations',
          params: { recommendations: '${recommendations}' }
        }
      ],
      triggers: [
        {
          type: 'event',
          event: 'revenue.optimization.scheduled',
          conditions: [
            { field: 'type', operator: 'equals', value: 'daily' }
          ]
        }
      ],
      timeout: 180000, // 3 minutes
      rollbackEnabled: false
    });

    console.log('✅ All workflows registered successfully');
  }

  /**
   * Get the orchestration engine instance
   */
  getOrchestrationEngine() {
    if (!this.initialized) {
      throw new Error('Service registry not initialized. Call initialize() first.');
    }
    return this.orchestrationEngine;
  }

  /**
   * Gracefully shutdown the service registry
   */
  async shutdown() {
    console.log('🛑 Shutting down service registry...');
    
    if (this.orchestrationEngine) {
      await this.orchestrationEngine.shutdown();
    }
    
    this.initialized = false;
    console.log('✅ Service registry shutdown complete');
  }
}

export default ServiceRegistry;