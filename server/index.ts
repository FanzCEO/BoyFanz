// @ts-nocheck
// CRITICAL: Load environment variables FIRST before any other imports
import './env';
import { db } from "./db";
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
// Vite is only used in development - dynamically imported to avoid bundling in production
// serveStatic is inlined below for production
import { logger, requestIdMiddleware, requestLoggingMiddleware } from "./logger";
import { setupHealthEndpoints, setupGracefulShutdown } from "./health";
import { setupCSRFTokenEndpoint } from "./middleware/csrf";
import { dataRetentionScheduler } from "./services/dataRetentionScheduler";

const app = express();

// CRITICAL SECURITY: Comprehensive security headers for compliance
// In development, use relaxed CSP for Safari compatibility
const isDevelopment = process.env.NODE_ENV !== 'production';

// Trust proxy for correct IP handling behind load balancers/CDN
// Use specific number of trusted proxies to prevent rate limit bypass (1 = nginx reverse proxy)
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: isDevelopment ? false : {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Google Fonts
      fontSrc: ["'self'", "data:"], // Google Fonts
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Support for media uploads
      connectSrc: ["'self'", "wss:", "ws:", "https://api.stripe.com"], // Allow websockets
      mediaSrc: ["'self'", "blob:"], // Media playback
      objectSrc: ["'none'"], // Prevent object/embed attacks
      frameSrc: ["'self'", "https://js.stripe.com", "https://hooks.stripe.com"], // Allow Stripe payment iframes
      baseUri: ["'self'"], // Restrict base tag
      formAction: ["'self'"], // Restrict form submissions
      frameAncestors: ["'none'"], // Additional clickjacking protection
    },
  },
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  } : false, // Only enable HSTS in production (HTTPS required)
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: isDevelopment ? false : { policy: 'same-origin' },
  crossOriginOpenerPolicy: isDevelopment ? false : { policy: 'same-origin' },
  // Additional security headers
  xssFilter: true, // X-XSS-Protection
  noSniff: true, // X-Content-Type-Options: nosniff
  frameguard: { action: 'deny' }, // X-Frame-Options: DENY
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, // Referrer-Policy
  // Note: Permissions-Policy headers will be added separately as custom headers
}));

// CRITICAL SECURITY: Additional security headers for compliance
app.use((req, res, next) => {
  // Permissions-Policy header (controls browser features)
  res.setHeader('Permissions-Policy', 
    'geolocation=(), microphone=(), camera=(), payment=(self), usb=(), bluetooth=(), midi=()');
  next();
});

// Request tracing and logging
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);

// Cookie parsing for CSRF tokens
app.use(cookieParser());

// Session management for email/password authentication
import { sessionMiddleware } from "./session";
app.use(sessionMiddleware);

// Body parsing
// Register GetStream webhook BEFORE global JSON parser to preserve raw body
app.post('/api/webhooks/getstream', express.raw({ type: 'application/json' }), async (req: any, res) => {
  try {
    // Ensure we have raw body buffer for signature verification
    if (!Buffer.isBuffer(req.body)) {
      console.error('❌ GetStream webhook: Expected raw body buffer but got:', typeof req.body);
      return res.status(400).json({ message: "Invalid request body format" });
    }

    const rawBody = req.body as Buffer;
    const signature = req.headers['x-stream-signature'] || req.headers['x-signature'] || '';
    
    if (!signature) {
      console.error('❌ GetStream webhook: Missing signature header');
      return res.status(401).json({ message: "Missing signature" });
    }

    // Import and initialize GetStream service
    const { createGetstreamService } = await import('./services/getstreamService');
    const { storage } = await import('./storage');
    const getstreamService = createGetstreamService(storage as any);
    
    // Extract signature value (handle "sha256=..." prefix if present)
    const signatureValue = signature.toString().replace(/^sha256=/, '');
    
    // Verify signature using raw bytes FIRST
    if (!getstreamService.verifyWebhookSignature(rawBody.toString('utf8'), signatureValue)) {
      console.error('❌ GetStream webhook: Invalid signature');
      return res.status(401).json({ message: "Invalid signature" });
    }

    // Only AFTER verification, parse the JSON payload
    const event = JSON.parse(rawBody.toString('utf8'));
    
    // Process the verified webhook event
    await getstreamService.handleWebhookEvent(event);
    
    console.log('✅ GetStream webhook processed successfully');
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("❌ Error processing GetStream webhook:", error);
    res.status(500).json({ message: "Failed to process webhook" });
  }
});

// CRITICAL: Order matters! Stripe webhook must be registered BEFORE global JSON parser
// or signature verification will fail. Stripe webhook is registered in routes.ts

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Health endpoints (before auth setup)
setupHealthEndpoints(app);

// CSRF token endpoint
setupCSRFTokenEndpoint(app);

(async () => {
  // Email/Password authentication is handled via API routes (server/routes/authRoutes.ts)
  // Session management is configured in server/routes.ts
  
  await registerRoutes(app);
  
  // Initialize advanced features
  // Advanced features disabled - initializeAdvancedFeatures commented out
  
  // Import and register advanced features
  const { setupAdvancedRoutes } = await import('./routes');
  await setupAdvancedRoutes(app);

  // Initialize FanzDash Central Command Center Connection
  try {
    const { fanzDashConnector } = await import('./services/fanzDashConnector');
    const connected = await fanzDashConnector.initialize();
    if (connected) {
      app.locals.fanzDashConnector = fanzDashConnector;
      logger.info('Connected to FanzDash Central Command Center');
    } else {
      logger.info('Running in standalone mode (FanzDash not available)');
    }
  } catch (fanzDashError) {
    logger.warn({ err: fanzDashError }, 'FanzDash connection failed, running standalone');
  }

  // Initialize FanzMediaHub Connection
  try {
    const { mediaHubClient } = await import('./services/mediaHubClient');
    const mediaHubConnected = await mediaHubClient.connect();
    if (mediaHubConnected) {
      app.locals.mediaHubClient = mediaHubClient;
      logger.info('Connected to FanzMediaHub');
    } else {
      logger.info('FanzMediaHub not configured - chunked uploads available locally');
    }
  } catch (mediaHubError) {
    logger.warn({ err: mediaHubError }, 'FanzMediaHub connection failed, using local uploads');
  }

  // Initialize Knowledge Base Connection
  try {
    const { knowledgeBaseClient } = await import('./services/knowledgeBaseClient');
    const kbConnected = await knowledgeBaseClient.connect();
    if (kbConnected) {
      app.locals.knowledgeBaseClient = knowledgeBaseClient;
      logger.info('Connected to Knowledge Base (kb.fanz.website)');
    } else {
      logger.info('Knowledge Base not configured - using local knowledge base');
    }
  } catch (kbError) {
    logger.warn({ err: kbError }, 'Knowledge Base connection failed, using local');
  }

// Initialize Service Orchestration Engine
  const ServiceRegistry = (await import('./orchestration/serviceRegistry.js')).default;
  const serviceRegistry = new ServiceRegistry();
  
  try {
    const orchestrationEngine = await serviceRegistry.initialize();
    app.locals.orchestrationEngine = orchestrationEngine;
    app.locals.serviceRegistry = serviceRegistry;
    logger.info('Service Orchestration Engine initialized successfully');
    
    // Initialize Pipeline Integration
    try {
      const PipelineIntegration = (await import('./pipeline/pipelineIntegration.js')).default;
      const pipelineIntegration = new PipelineIntegration(orchestrationEngine);
      await pipelineIntegration.initialize();
      app.locals.pipelineIntegration = pipelineIntegration;
      logger.info('Pipeline Integration initialized successfully');
      
      // Initialize Enterprise Command Center
      try {
        const EnterpriseCommandCenter = (await import('./services/enterpriseCommandCenter.js')).default;
        const commandCenter = new EnterpriseCommandCenter(orchestrationEngine, pipelineIntegration);
        await commandCenter.initialize();
        app.locals.commandCenter = commandCenter;
        logger.info('Enterprise Command Center initialized successfully');
        
        // Initialize Automated Workflow Engine
        try {
          const AutomatedWorkflowEngine = (await import('./services/automatedWorkflowEngine.js')).default;
          const workflowEngine = new AutomatedWorkflowEngine(orchestrationEngine, pipelineIntegration, commandCenter);
          await workflowEngine.initialize();
          app.locals.workflowEngine = workflowEngine;
          logger.info('Automated Workflow Engine initialized successfully');
          
          // Initialize Service Discovery & Health Monitoring (if enabled)
          if (process.env.HEALTH_MONITORING_ENABLED !== "false") {
          try {
            const ServiceDiscoveryHealth = (await import('./services/serviceDiscoveryHealth.js')).default;
            const serviceDiscovery = new ServiceDiscoveryHealth(orchestrationEngine, commandCenter, workflowEngine);
            await serviceDiscovery.initialize();
            app.locals.serviceDiscovery = serviceDiscovery;
            logger.info('Service Discovery & Health Monitoring System initialized successfully');
          } catch (serviceDiscoveryError) {
            logger.error({ err: serviceDiscoveryError }, 'Failed to initialize Service Discovery & Health Monitoring System');
            // Continue startup but with reduced service monitoring functionality
          }
          } else {
            logger.info("Service Discovery & Health Monitoring disabled via env");
          }

          // Initialize FanzDash Central Command Connection
          try {
            const { fanzDashClient } = await import('./services/fanzDashClient.js');
            if (process.env.FANZDASH_API_KEY) {
              await fanzDashClient.connect();
              app.locals.fanzDashClient = fanzDashClient;
              logger.info('FanzDash Central Command connection established');
            } else {
              logger.warn('FANZDASH_API_KEY not set - running in standalone mode');
            }
          } catch (fanzDashError) {
            logger.error({ err: fanzDashError }, 'Failed to connect to FanzDash Central Command');
            // Continue startup - platform can operate independently
          }

          // Initialize FANZ Cybersecurity System - 500 Security Bots
          try {
            const { startCybersecuritySystem } = await import('./services/cybersecurityService.js');
            await startCybersecuritySystem();
            logger.info('FANZ Cybersecurity System initialized - 500 security bots active');
          } catch (cybersecurityError) {
            logger.error({ err: cybersecurityError }, 'Failed to initialize Cybersecurity System');
            // Continue startup - security system can be started manually
          }

        } catch (workflowError) {
          logger.error({ err: workflowError }, 'Failed to initialize Automated Workflow Engine');
          // Continue startup but with reduced automation functionality
        }
        
      } catch (commandCenterError) {
        logger.error({ err: commandCenterError }, 'Failed to initialize Enterprise Command Center');
        // Continue startup but with reduced dashboard functionality
      }
      
    } catch (pipelineError) {
      logger.error({ err: pipelineError }, 'Failed to initialize Pipeline Integration');
      // Continue startup but with reduced analytics functionality
    }
    
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize Service Orchestration Engine');
    // Continue startup but with reduced functionality
  }
  
  // Setup API Gateway middleware (after routes are registered)
  const { setupGatewayMiddleware } = await import('./middleware/gatewayMiddleware.js');
  setupGatewayMiddleware(app);
  
  // Create server from the Express app
  const { createServer } = await import('http');
  const server = createServer(app);
  
  // Initialize WebSocket server
  // const { wsManager } = await import('./websocket');
  // logger.info('WebSocket server initialized on port 3001');

  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Structured error logging
    logger.error({
      error: err,
      req: {
        id: (req as any).id,
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent']
      },
      status
    }, 'Request error occurred');

    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  const serveStaticFiles = async () => {
    const fs = await import("fs");
    const path = await import("path");
    const distPath = path.resolve(import.meta.dirname, "public");

    if (!fs.existsSync(distPath)) {
      logger.warn(`Build directory not found: ${distPath}. Run 'npm run build:client' first.`);
      return;
    }

    app.use(express.static(distPath));

    // fall through to index.html if the file doesn't exist (but NOT for /api/* routes)
    app.use((req, res, next) => {
      // Don't catch API routes
      if (req.path.startsWith('/api/')) {
        return next();
      }
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  };

  if (app.get("env") === "development") {
    // Dynamically import vite module only in development (when running with tsx)
    try {
      const { setupVite } = await import("./vite");
      await setupVite(app, server);
    } catch (err) {
      // Running from dist bundle - vite module not available
      // Fall back to serving static files
      logger.info('Vite not available (running from dist), serving static files');
      await serveStaticFiles();
    }
  } else {
    // Production: serve static files from dist/public
    await serveStaticFiles();
  }

  // 404 handler for unmatched API routes only (after static file serving)
  app.use('/api/*', (req: Request, res: Response) => {
    logger.warn({
      req: {
        id: (req as any).id,
        method: req.method,
        path: req.path
      }
    }, 'API route not found');
    
    res.status(404).json({ message: "Route not found" });
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    logger.info({ port }, 'Server started successfully');
    console.log(`🚀 BoyFanz server running on port ${port}`);

    // Start Data Retention Scheduler for GDPR/CCPA compliance
    if (process.env.ENABLE_DATA_RETENTION_SCHEDULER !== 'false') {
      dataRetentionScheduler.start();
      console.log('📋 Data Retention Scheduler started');
    }
  });

  // Setup graceful shutdown handling with service orchestration cleanup
  const originalShutdown = setupGracefulShutdown(server);
  
  // Extend shutdown to include all enterprise services cleanup
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, shutting down gracefully');
    try {
      // Stop Data Retention Scheduler
      dataRetentionScheduler.stop();

      if (app.locals.serviceDiscovery) {
        await app.locals.serviceDiscovery.shutdown();
      }
      if (app.locals.workflowEngine) {
        await app.locals.workflowEngine.shutdown();
      }
      if (app.locals.commandCenter) {
        await app.locals.commandCenter.shutdown();
      }
      if (app.locals.pipelineIntegration) {
        await app.locals.pipelineIntegration.shutdown();
      }
      if (app.locals.serviceRegistry) {
        await app.locals.serviceRegistry.shutdown();
      }
      if (app.locals.fanzDashClient) {
        await app.locals.fanzDashClient.disconnect();
      }
    } catch (error) {
      logger.error({ err: error }, 'Error during graceful shutdown');
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received, shutting down gracefully');
    try {
      if (app.locals.commandCenter) {
        await app.locals.commandCenter.shutdown();
      }
      if (app.locals.pipelineIntegration) {
        await app.locals.pipelineIntegration.shutdown();
      }
      if (app.locals.serviceRegistry) {
        await app.locals.serviceRegistry.shutdown();
      }
      if (app.locals.fanzDashClient) {
        await app.locals.fanzDashClient.disconnect();
      }
    } catch (error) {
      logger.error('Error during graceful shutdown:', error);
    }
    process.exit(0);
  });
})();
