import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { logger, requestIdMiddleware, requestLoggingMiddleware } from "./logger";
import { setupHealthEndpoints, setupGracefulShutdown } from "./health";
import { setupCSRFTokenEndpoint } from "./middleware/csrf";

const app = express();

// Trust proxy for correct IP handling behind load balancers/CDN
app.set('trust proxy', true);

// Production-ready security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Remove unsafe-inline for production security
      styleSrc: ["'self'", "data:"], // Allow data URIs for styles, remove unsafe-inline
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "wss:", "https:"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false, // Disable CSP in development for ease of use
  crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production'
}));

// Request tracing and logging
app.use(requestIdMiddleware);
app.use(requestLoggingMiddleware);

// Cookie parsing for CSRF tokens
app.use(cookieParser());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Health endpoints (before auth setup)
setupHealthEndpoints(app);

// CSRF token endpoint
setupCSRFTokenEndpoint(app);

(async () => {
  const server = await registerRoutes(app);

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
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    logger.info({ port }, 'Server started successfully');
    log(`serving on port ${port}`);
  });

  // Setup graceful shutdown handling
  setupGracefulShutdown(server);
})();
