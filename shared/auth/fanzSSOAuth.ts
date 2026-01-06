/**
 * FanzSSO Authentication Module for Creator Platforms
 *
 * This module provides FanzSSO JWT-based integration for all FANZ creator platforms.
 * Import this into each platform's server to enable centralized SSO authentication.
 *
 * Usage:
 *   import { setupFanzSSO } from '@shared/auth/fanzSSOAuth';
 *   setupFanzSSO(app, { platformId: 'boyfanz', platformName: 'BoyFanz' });
 */

import { Router, type Express, type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import crypto from "crypto";

// SSO Configuration
const SSO_BASE_URL = process.env.SSO_BASE_URL || process.env.SSO_URL || "https://sso.fanz.website";
const SSO_SHARED_SECRET = process.env.SSO_SHARED_SECRET || process.env.JWT_SECRET || "fanz-sso-shared-secret";

export interface PlatformSSOConfig {
  platformId: string;
  platformName: string;
  clientSecret?: string;
  redirectPath?: string;
  onUserLogin?: (user: SSOUser, req: Request) => Promise<void>;
  onUserRegister?: (user: SSOUser, req: Request) => Promise<void>;
}

export interface SSOUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  roles: string[];
  permissions: string[];
  platformAccess: string[];
  ssoProvider?: string;
  emailVerified: boolean;
  ageVerified: boolean;
  idVerified: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isCreator: boolean;
}

export interface SSOTokenPayload {
  sub: string;
  email: string;
  roles: string[];
  permissions: string[];
  platformAccess: string[];
  iss: string;
  aud: string;
  exp: number;
  iat: number;
  tokenType?: string;
}

// Extend Express Request
declare global {
  namespace Express {
    interface Request {
      ssoUser?: SSOUser;
      ssoToken?: SSOTokenPayload;
    }
  }
}

/**
 * Verify SSO token
 */
export async function verifySSOToken(token: string): Promise<SSOTokenPayload | null> {
  try {
    const decoded = jwt.verify(token, SSO_SHARED_SECRET, {
      algorithms: ["HS256", "RS256"],
    }) as SSOTokenPayload;
    return decoded;
  } catch (error) {
    console.error("[FanzSSO] Token verification failed:", error);
    return null;
  }
}

/**
 * Map token payload to SSOUser
 */
function mapTokenToUser(payload: SSOTokenPayload): SSOUser {
  return {
    id: payload.sub,
    email: payload.email,
    username: (payload as any).preferred_username || (payload as any).username,
    firstName: (payload as any).given_name || (payload as any).firstName,
    lastName: (payload as any).family_name || (payload as any).lastName,
    profileImageUrl: (payload as any).picture || (payload as any).profileImageUrl,
    roles: payload.roles || ["user"],
    permissions: payload.permissions || [],
    platformAccess: payload.platformAccess || [],
    ssoProvider: (payload as any).ssoProvider || (payload as any).identity_provider,
    emailVerified: (payload as any).email_verified || (payload as any).emailVerified || false,
    ageVerified: (payload as any).age_verified || (payload as any).ageVerified || false,
    idVerified: (payload as any).id_verified || (payload as any).idVerified || false,
    isAdmin: (payload as any).isAdmin || payload.roles?.includes("admin") || false,
    isModerator: (payload as any).isModerator || payload.roles?.includes("moderator") || false,
    isCreator: (payload as any).isCreator || payload.roles?.includes("creator") || false,
  };
}

/**
 * SSO Authentication Middleware
 */
export function requireSSOAuth(config: PlatformSSOConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check for Bearer token
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

      // Also check cookie for session-based auth
      const sessionToken = req.cookies?.fanz_sso_token;

      const tokenToVerify = token || sessionToken;

      if (!tokenToVerify) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          ssoUrl: `${SSO_BASE_URL}/authorize?client_id=${config.platformId}`,
        });
        return;
      }

      // Verify the token
      const decoded = await verifySSOToken(tokenToVerify);
      if (!decoded) {
        res.status(401).json({
          success: false,
          error: "Invalid or expired token",
          code: "INVALID_TOKEN",
          ssoUrl: `${SSO_BASE_URL}/authorize?client_id=${config.platformId}`,
        });
        return;
      }

      // Check platform access
      if (!decoded.platformAccess.includes(config.platformId) && !decoded.platformAccess.includes("*")) {
        res.status(403).json({
          success: false,
          error: "No access to this platform",
          code: "PLATFORM_ACCESS_DENIED",
          platformId: config.platformId,
        });
        return;
      }

      // Attach user to request
      req.ssoUser = mapTokenToUser(decoded);
      req.ssoToken = decoded;

      next();
    } catch (error) {
      console.error("[FanzSSO] Auth middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Authentication error",
        code: "AUTH_ERROR",
      });
    }
  };
}

/**
 * Optional SSO Auth (attaches user if present, but doesn't require it)
 */
export function optionalSSOAuth(config: PlatformSSOConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const sessionToken = req.cookies?.fanz_sso_token;
      const tokenToVerify = token || sessionToken;

      if (tokenToVerify) {
        const decoded = await verifySSOToken(tokenToVerify);
        if (decoded) {
          req.ssoUser = mapTokenToUser(decoded);
          req.ssoToken = decoded;
        }
      }

      next();
    } catch {
      // Don't fail on optional auth
      next();
    }
  };
}

/**
 * Create SSO routes for a platform
 */
export function createSSORoutes(config: PlatformSSOConfig): Router {
  const router = Router();

  // SSO info endpoint - returns platform config for login pages
  router.get("/sso/config", (req, res) => {
    res.json({
      platformId: config.platformId,
      platformName: config.platformName,
      loginEndpoint: "/api/auth/sso/login",
      registerEndpoint: "/api/auth/sso/register",
      statusEndpoint: "/api/auth/sso/status",
    });
  });

  // SSO callback - receives token from SSO server
  router.get("/sso/callback", async (req, res) => {
    try {
      const { token, error, error_description } = req.query;

      if (error) {
        return res.redirect(`/login?error=${encodeURIComponent(error_description as string || error as string)}`);
      }

      if (!token) {
        return res.redirect("/login?error=No+token+received");
      }

      // Verify the token
      const decoded = await verifySSOToken(token as string);
      if (!decoded) {
        return res.redirect("/login?error=Invalid+token");
      }

      // Set token in cookie
      res.cookie("fanz_sso_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        domain: ".fanz.website",
      });

      // Get user info and call hooks
      const user = mapTokenToUser(decoded);

      // Call onUserLogin hook if provided
      if (config.onUserLogin) {
        await config.onUserLogin(user, req);
      }

      // Redirect to dashboard
      res.redirect("/dashboard");
    } catch (error) {
      console.error("[FanzSSO] Callback error:", error);
      res.redirect("/login?error=Authentication+failed");
    }
  });

  // Login via API (for SPA/mobile apps)
  router.post("/sso/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: "Email and password required" });
      }

      // Forward login to SSO server
      const response = await fetch(`${SSO_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, platformId: config.platformId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: data.error || "Login failed" });
      }

      // Set token in cookie
      res.cookie("fanz_sso_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: ".fanz.website",
      });

      // Call onUserLogin hook
      if (config.onUserLogin && data.user) {
        const ssoUser = mapTokenToUser({
          sub: data.user.id,
          email: data.user.email,
          roles: ["user"],
          permissions: [],
          platformAccess: [config.platformId],
          iss: SSO_BASE_URL,
          aud: config.platformId,
          exp: Math.floor(Date.now() / 1000) + 86400,
          iat: Math.floor(Date.now() / 1000),
        });
        await config.onUserLogin(ssoUser, req);
      }

      res.json({ success: true, user: data.user, token: data.token });
    } catch (error) {
      console.error("[FanzSSO] Login error:", error);
      res.status(500).json({ success: false, error: "Login error" });
    }
  });

  // Register via API
  router.post("/sso/register", async (req, res) => {
    try {
      const { email, password, username, displayName } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ success: false, error: "Email, password, and username required" });
      }

      // Forward registration to SSO server
      const response = await fetch(`${SSO_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, username, displayName, platformId: config.platformId }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({ success: false, error: data.error || "Registration failed" });
      }

      // Set token in cookie
      res.cookie("fanz_sso_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: ".fanz.website",
      });

      // Call onUserRegister hook
      if (config.onUserRegister && data.user) {
        const ssoUser = mapTokenToUser({
          sub: data.user.id,
          email: data.user.email,
          roles: ["user"],
          permissions: [],
          platformAccess: [config.platformId],
          iss: SSO_BASE_URL,
          aud: config.platformId,
          exp: Math.floor(Date.now() / 1000) + 86400,
          iat: Math.floor(Date.now() / 1000),
        });
        await config.onUserRegister(ssoUser, req);
      }

      res.json({ success: true, user: data.user, token: data.token });
    } catch (error) {
      console.error("[FanzSSO] Register error:", error);
      res.status(500).json({ success: false, error: "Registration error" });
    }
  });

  // Get current user
  router.get("/sso/user", requireSSOAuth(config), (req, res) => {
    res.json({
      success: true,
      user: req.ssoUser,
    });
  });

  // Check auth status
  router.get("/sso/status", async (req, res) => {
    const token = req.cookies?.fanz_sso_token;

    if (!token) {
      return res.json({ authenticated: false });
    }

    const decoded = await verifySSOToken(token);
    if (!decoded) {
      return res.json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      user: mapTokenToUser(decoded),
    });
  });

  // Logout
  router.post("/sso/logout", async (req, res) => {
    // Clear cookies
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
    res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  });

  // Also support GET logout for convenience
  router.get("/sso/logout", (req, res) => {
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
    res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
    res.redirect("/");
  });

  return router;
}

/**
 * Setup FanzSSO for a platform
 */
export function setupFanzSSO(app: Express, config: PlatformSSOConfig): void {
  console.log(`[FanzSSO] Setting up SSO for ${config.platformName} (${config.platformId})`);

  // Mount SSO routes at /api/auth/sso/*
  const ssoRoutes = createSSORoutes(config);
  app.use("/api/auth", ssoRoutes);

  // Also mount root-level /api/login and /api/register for platform's branded login pages
  // This allows existing frontend code that calls /api/login to work with SSO
  app.post("/api/login", async (req: Request, res: Response) => {
    try {
      const { email, password, username } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
      }

      // Forward login to SSO server
      const response = await fetch(`${SSO_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
          platformId: config.platformId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message: data.error || data.message || "Login failed"
        });
      }

      // Set token in cookie
      res.cookie("fanz_sso_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined,
      });

      // Call onUserLogin hook if provided
      if (config.onUserLogin && data.user) {
        const ssoUser = mapTokenToUser({
          sub: data.user.id,
          email: data.user.email,
          roles: data.user.roles || ["user"],
          permissions: data.user.permissions || [],
          platformAccess: data.user.platformAccess || [config.platformId],
          iss: SSO_BASE_URL,
          aud: config.platformId,
          exp: Math.floor(Date.now() / 1000) + 86400,
          iat: Math.floor(Date.now() / 1000),
        });
        await config.onUserLogin(ssoUser, req);
      }

      // Return user data in format expected by platform frontend
      res.json({
        success: true,
        user: data.user,
        token: data.token
      });
    } catch (error) {
      console.error("[FanzSSO] Login error:", error);
      res.status(500).json({ success: false, message: "Authentication service unavailable" });
    }
  });

  app.post("/api/register", async (req: Request, res: Response) => {
    try {
      const { email, password, username, displayName } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ success: false, message: "Email, password, and username required" });
      }

      // Forward registration to SSO server
      const response = await fetch(`${SSO_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          username,
          displayName,
          platformId: config.platformId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return res.status(response.status).json({
          success: false,
          message: data.error || data.message || "Registration failed"
        });
      }

      // Set token in cookie
      res.cookie("fanz_sso_token", data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined,
      });

      // Call onUserRegister hook if provided
      if (config.onUserRegister && data.user) {
        const ssoUser = mapTokenToUser({
          sub: data.user.id,
          email: data.user.email,
          roles: ["user"],
          permissions: [],
          platformAccess: [config.platformId],
          iss: SSO_BASE_URL,
          aud: config.platformId,
          exp: Math.floor(Date.now() / 1000) + 86400,
          iat: Math.floor(Date.now() / 1000),
        });
        await config.onUserRegister(ssoUser, req);
      }

      // Return user data in format expected by platform frontend
      res.json({
        success: true,
        user: data.user,
        token: data.token
      });
    } catch (error) {
      console.error("[FanzSSO] Register error:", error);
      res.status(500).json({ success: false, message: "Registration service unavailable" });
    }
  });

  // /api/user endpoint for getting current user
  app.get("/api/user", async (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
      const sessionToken = req.cookies?.fanz_sso_token;
      const tokenToVerify = token || sessionToken;

      if (!tokenToVerify) {
        return res.status(401).json({ success: false, message: "Not authenticated" });
      }

      const decoded = await verifySSOToken(tokenToVerify);
      if (!decoded) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }

      res.json({
        success: true,
        user: mapTokenToUser(decoded)
      });
    } catch (error) {
      console.error("[FanzSSO] Get user error:", error);
      res.status(500).json({ success: false, message: "Error fetching user" });
    }
  });

  // /api/logout endpoint
  app.post("/api/logout", (req: Request, res: Response) => {
    res.clearCookie("fanz_sso_token", {
      domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined
    });
    res.clearCookie("fanz_refresh_token", {
      domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined
    });
    res.json({ success: true, message: "Logged out successfully" });
  });

  console.log(`[FanzSSO] SSO routes mounted at /api/auth/sso/* and /api/login, /api/register, /api/user, /api/logout`);
}

export default {
  setupFanzSSO,
  createSSORoutes,
  requireSSOAuth,
  optionalSSOAuth,
  verifySSOToken,
};
