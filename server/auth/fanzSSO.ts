/**
 * FanzSSO Client Integration
 *
 * This module integrates with the central FanzSSO service at sso.fanz.website
 * for unified authentication across all Fanz ecosystem platforms.
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";

// SSO Configuration
const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
const SSO_CLIENT_ID = process.env.SSO_CLIENT_ID || "boyfanz";
const SSO_CLIENT_SECRET = process.env.SSO_CLIENT_SECRET || "";
const SSO_CALLBACK_URL = process.env.SSO_CALLBACK_URL || "https://boy.fanz.website/auth/sso/callback";
const SSO_SHARED_SECRET = process.env.SSO_SHARED_SECRET || process.env.JWT_SECRET || "";

// Platform identification
const PLATFORM_ID = process.env.PLATFORM_ID || "boyfanz";

/**
 * SSO Login Response - SSO might return token under various keys
 */
type LoginResponse = {
  token?: string;
  accessToken?: string;
  jwt?: string;
  sessionToken?: string;
  user?: any;
  [k: string]: any;
};

/**
 * Pick the auth token from SSO response (handles various field names)
 */
function pickAuthToken(payload: LoginResponse): string {
  const t =
    payload.token ||
    payload.accessToken ||
    payload.jwt ||
    payload.sessionToken;

  if (!t) throw new Error("SSO /login returned no usable token");
  return t;
}

/**
 * Step 1: Authenticate with SSO via POST /login
 * This is the REAL SSO endpoint (not OAuth /authorize or /token)
 */
export async function ssoLogin(email: string, password: string, platformId: string = PLATFORM_ID) {
  const resp = await fetch(`${SSO_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, platformId }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SSO /login failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as LoginResponse;
  const bearer = pickAuthToken(data);
  return { raw: data, bearer, user: data.user };
}

/**
 * Step 2: Mint platform JWT via POST /api/auth/platform-token
 * SSO requires Authorization header with bearer token from login
 */
export async function ssoPlatformToken(bearer: string, platformId: string = PLATFORM_ID) {
  const resp = await fetch(`${SSO_BASE_URL}/api/auth/platform-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearer}`,
    },
    body: JSON.stringify({ platformId }),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SSO platform-token failed (${resp.status}): ${text}`);
  }

  return await resp.json();
}

/**
 * Get age verification URL from SSO
 */
export async function ssoGetAgeVerificationUrl(bearer: string, redirectUri?: string) {
  const url = new URL(`${SSO_BASE_URL}/verify-age`);
  if (redirectUri) {
    url.searchParams.set("redirect_uri", redirectUri);
  }

  const resp = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SSO verify-age failed (${resp.status}): ${text}`);
  }

  return await resp.json();
}

/**
 * Check age verification status from SSO
 */
export async function ssoCheckVerificationStatus(bearer: string) {
  const resp = await fetch(`${SSO_BASE_URL}/api/verification/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${bearer}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`SSO verification status failed (${resp.status}): ${text}`);
  }

  return await resp.json();
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
  ageVerified: boolean;
  ageVerifiedAt?: string;
  emailVerified: boolean;
  creatorVerified: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  isCreator: boolean;
}

export interface SSOTokenPayload {
  sub: string;           // User ID
  email: string;
  username?: string;
  roles: string[];
  permissions: string[];
  platformAccess: string[];
  age_verified: boolean;
  age_verified_at?: string;
  email_verified: boolean;
  iss: string;           // Issuer (should be sso.fanz.website)
  aud: string;           // Audience (the platform)
  exp: number;           // Expiration
  iat: number;           // Issued at
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      ssoUser?: SSOUser;
      ssoToken?: SSOTokenPayload;
    }
  }
}

// Extend session type
declare module 'express-session' {
  interface SessionData {
    ssoUserId?: string;
    ssoUser?: SSOUser;
    accessToken?: string;
    refreshToken?: string;
    oauthState?: string;
    returnTo?: string;
  }
}

/**
 * FanzSSO Client Service
 */
export class FanzSSOClient {
  /**
   * @deprecated SSO does not have /authorize endpoint. Use ssoLogin() instead.
   * This method now throws an error to prevent silent failures.
   */
  static getAuthorizationUrl(state: string, returnTo?: string): string {
    // SSO v3.0.0 does NOT have /authorize - use direct login flow via ssoLogin()
    throw new Error(
      "DEPRECATED: SSO does not support /authorize. Use ssoLogin() for authentication."
    );
  }

  /**
   * Generate a secure random state token for CSRF protection
   */
  static generateState(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * @deprecated SSO does not have /token endpoint. Use ssoPlatformToken() instead.
   * This method now throws an error to prevent silent failures.
   */
  static async exchangeCodeForTokens(code: string): Promise<{
    accessToken: string;
    refreshToken: string;
    idToken: string;
    expiresIn: number;
  }> {
    // SSO v3.0.0 does NOT have /token - use ssoLogin() + ssoPlatformToken() instead
    throw new Error(
      "DEPRECATED: SSO does not support /token. Use ssoLogin() then ssoPlatformToken()."
    );
  }

  /**
   * @deprecated SSO does not have /token endpoint for refresh. Re-authenticate via ssoLogin().
   * This method now throws an error to prevent silent failures.
   */
  static async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    // SSO v3.0.0 does NOT have token refresh - re-authenticate via ssoLogin()
    throw new Error(
      "DEPRECATED: SSO does not support token refresh. Re-authenticate via ssoLogin()."
    );
  }

  /**
   * Verify and decode a JWT token
   */
  static verifyToken(token: string): SSOTokenPayload | null {
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
   * Decode a JWT token without verification (for id_token from trusted source)
   */
  static decodeToken(token: string): SSOTokenPayload | null {
    try {
      return jwt.decode(token) as SSOTokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * Map token payload to SSOUser format
   */
  static mapTokenToUser(payload: SSOTokenPayload): SSOUser {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      roles: payload.roles || ["user"],
      permissions: payload.permissions || [],
      platformAccess: payload.platformAccess || [PLATFORM_ID],
      ageVerified: payload.age_verified || false,
      ageVerifiedAt: payload.age_verified_at,
      emailVerified: payload.email_verified || false,
      creatorVerified: payload.roles?.includes("creator") || false,
      isAdmin: payload.roles?.includes("admin") || false,
      isModerator: payload.roles?.includes("moderator") || false,
      isCreator: payload.roles?.includes("creator") || false,
    };
  }

  /**
   * Get the logout URL for FanzSSO
   */
  static getLogoutUrl(returnTo?: string): string {
    const params = new URLSearchParams();
    if (returnTo) {
      params.append("redirect_uri", returnTo);
    }
    return `${SSO_BASE_URL}/logout?${params.toString()}`;
  }

  /**
   * Check if user has access to this platform
   */
  static hasPlatformAccess(user: SSOUser): boolean {
    // Admins always have access
    if (user.isAdmin) return true;

    // Check platform access list
    return user.platformAccess.includes(PLATFORM_ID) ||
           user.platformAccess.includes("*");
  }
}

/**
 * Middleware: Require FanzSSO authentication
 */
export const requireFanzSSO = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Check for Bearer token in header
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    // Check for token in session
    const sessionToken = req.session?.accessToken;

    // Check for cookie token
    const cookieToken = req.cookies?.fanz_sso_token;

    const token = bearerToken || sessionToken || cookieToken;

    if (!token) {
      // For API requests, return 401
      if (req.path.startsWith("/api/")) {
        res.status(401).json({
          error: "Authentication required",
          code: "AUTH_REQUIRED",
          loginUrl: "/login",
        });
        return;
      }

      // For page requests, redirect to login
      req.session.returnTo = req.originalUrl;
      res.redirect("/login");
      return;
    }

    // Verify the token
    const decoded = FanzSSOClient.verifyToken(token);
    if (!decoded) {
      // Token invalid or expired - SSO doesn't support refresh, need to re-authenticate
      // Clear invalid session tokens
      if (req.session) {
        delete req.session.accessToken;
        delete req.session.refreshToken;
        delete req.session.ssoUser;
      }

      if (req.path.startsWith("/api/")) {
        res.status(401).json({
          error: "Invalid or expired token",
          code: "INVALID_TOKEN",
          loginUrl: "/login",
        });
        return;
      }

      req.session.returnTo = req.originalUrl;
      res.redirect("/login");
      return;
    }

    // Map to user object
    const user = FanzSSOClient.mapTokenToUser(decoded);

    // Check platform access
    if (!FanzSSOClient.hasPlatformAccess(user)) {
      res.status(403).json({
        error: "No access to this platform",
        code: "PLATFORM_ACCESS_DENIED",
      });
      return;
    }

    // Attach user and token to request
    req.ssoUser = user;
    req.ssoToken = decoded;

    next();
  } catch (error) {
    console.error("[FanzSSO] Auth middleware error:", error);
    res.status(500).json({
      error: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

/**
 * Middleware: Optional FanzSSO auth (attaches user if present)
 */
export const optionalFanzSSO = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const sessionToken = req.session?.accessToken;
    const cookieToken = req.cookies?.fanz_sso_token;

    const token = bearerToken || sessionToken || cookieToken;

    if (token) {
      const decoded = FanzSSOClient.verifyToken(token);
      if (decoded) {
        req.ssoUser = FanzSSOClient.mapTokenToUser(decoded);
        req.ssoToken = decoded;
      }
    }

    next();
  } catch {
    // Don't fail on optional auth
    next();
  }
};

/**
 * Middleware: Require age verification
 */
export const requireAgeVerification = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.ssoUser) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.ssoUser.ageVerified) {
    res.status(403).json({
      error: "Age verification required",
      code: "AGE_VERIFICATION_REQUIRED",
      verificationUrl: `${SSO_BASE_URL}/verify-age?redirect_uri=${encodeURIComponent(req.originalUrl)}`,
    });
    return;
  }

  next();
};

/**
 * Middleware: Require specific role
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.ssoUser) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const hasRole = roles.some(role =>
      req.ssoUser!.roles.includes(role) || req.ssoUser!.isAdmin
    );

    if (!hasRole) {
      res.status(403).json({
        error: "Insufficient permissions",
        code: "FORBIDDEN",
        requiredRoles: roles,
      });
      return;
    }

    next();
  };
};

/**
 * Middleware: Require admin access
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.ssoUser) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.ssoUser.isAdmin) {
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  next();
};

/**
 * Middleware: Require creator access
 */
export const requireCreator = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.ssoUser) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  if (!req.ssoUser.isCreator && !req.ssoUser.isAdmin) {
    res.status(403).json({ error: "Creator access required" });
    return;
  }

  next();
};

export default FanzSSOClient;
