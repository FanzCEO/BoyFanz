import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { trackLoginAttempt, checkBruteForce } from "../middleware/bruteForceProtection";
import { authRateLimit } from "../middleware/rateLimitingAdvanced";
import { db } from "../db";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

const router = Router();

// SSO Configuration
const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
const PLATFORM_ID = "boyfanz";

// ============================================================
// VALIDATION SCHEMAS
// ============================================================

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
  confirmPassword: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ============================================================
// AUTHENTICATION ROUTES - FORWARD TO SSO
// ============================================================

/**
 * POST /api/auth/register
 * Forward registration to FanzSSO
 */
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);

    // Forward registration to SSO server
    const response = await fetch(`${SSO_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        username: data.username || data.email.split("@")[0],
        platformId: PLATFORM_ID,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: result.error || result.message || "Registration failed",
      });
    }

    // Set SSO token cookie
    if (result.token) {
      res.cookie("fanz_sso_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined,
      });
    }

    res.json({
      success: true,
      message: "Registration successful!",
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }
    console.error("[Auth] Registration error:", error);
    res.status(500).json({
      success: false,
      error: "Registration service unavailable",
    });
  }
});

/**
 * POST /api/auth/login
 * Forward login to FanzSSO with local fallback
 */
router.post("/login", authRateLimit, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
                     req.socket.remoteAddress || "unknown";

    // Check for brute force attacks
    const bruteCheck = checkBruteForce(ipAddress);
    if (bruteCheck.blocked) {
      return res.status(429).json({
        success: false,
        error: bruteCheck.message,
        retryAfter: bruteCheck.retryAfterMs,
      });
    }

    const emailBruteCheck = checkBruteForce(`email:${data.email.toLowerCase()}`);
    if (emailBruteCheck.blocked) {
      return res.status(429).json({
        success: false,
        error: emailBruteCheck.message,
        retryAfter: emailBruteCheck.retryAfterMs,
      });
    }

    // Forward login to SSO server
    const response = await fetch(`${SSO_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        platformId: PLATFORM_ID,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      trackLoginAttempt(ipAddress, false);
      trackLoginAttempt(`email:${data.email.toLowerCase()}`, false);

      return res.status(response.status).json({
        success: false,
        error: result.error || result.message || "Login failed",
      });
    }

    // Track successful login
    trackLoginAttempt(ipAddress, true);
    trackLoginAttempt(`email:${data.email.toLowerCase()}`, true);

    // Set SSO token cookie
    if (result.token) {
      res.cookie("fanz_sso_token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        domain: process.env.NODE_ENV === "production" ? ".fanz.website" : undefined,
      });
    }

    // Also set session for backwards compatibility
    if (result.user?.id) {
      req.session.userId = result.user.id;
      req.session.emailVerified = result.user.emailVerified;
    }

    res.json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
    });
  } catch (error: any) {
    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
                     req.socket.remoteAddress || "unknown";
    const email = req.body?.email?.toLowerCase();

    // Handle validation errors first
    if (error instanceof z.ZodError) {
      if (ipAddress) trackLoginAttempt(ipAddress, false);
      if (email) trackLoginAttempt(`email:${email}`, false);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    // SSO unavailable - try local authentication fallback using accounts table
    console.log("[Auth] SSO failed, trying local auth. Error:", error?.message);

    try {
      const data = loginSchema.parse(req.body);

      // Query accounts table directly (production schema uses accounts with password_hash)
      const accountResult = await db.execute(
        sql`SELECT id, email, password_hash, status, email_verified, metadata
            FROM accounts
            WHERE LOWER(email) = LOWER(${data.email})
            LIMIT 1`
      );

      const account = accountResult.rows?.[0] as any;

      if (!account) {
        trackLoginAttempt(ipAddress, false);
        trackLoginAttempt(`email:${data.email.toLowerCase()}`, false);
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Verify password using bcrypt against password_hash
      let isValidPassword = false;
      if (account.password_hash && account.password_hash.startsWith('$2')) {
        isValidPassword = await bcrypt.compare(data.password, account.password_hash);
      }

      if (!isValidPassword) {
        trackLoginAttempt(ipAddress, false);
        trackLoginAttempt(`email:${data.email.toLowerCase()}`, false);
        return res.status(401).json({
          success: false,
          error: "Invalid email or password",
        });
      }

      // Check account status
      if (account.status !== 'active') {
        return res.status(403).json({
          success: false,
          error: "Account is not active",
        });
      }

      // Track successful login
      trackLoginAttempt(ipAddress, true);
      trackLoginAttempt(`email:${data.email.toLowerCase()}`, true);

      // Parse metadata for additional user info
      const metadata = typeof account.metadata === 'string'
        ? JSON.parse(account.metadata)
        : (account.metadata || {});

      // Create ssoUser object for session
      const ssoUser = {
        id: account.id,
        email: account.email,
        username: metadata.username || account.email.split('@')[0],
        displayName: metadata.displayName || metadata.username || account.email.split('@')[0],
        profileImageUrl: metadata.profileImageUrl || null,
        emailVerified: account.email_verified || false,
        role: metadata.role || 'fan',
        isAdmin: metadata.role === 'admin' || metadata.role === 'superadmin',
        isModerator: metadata.role === 'moderator',
        roles: metadata.role ? [metadata.role] : ['fan'],
      };

      // Set session with ssoUser (required for ssoRoutes /api/auth/session check)
      (req.session as any).ssoUser = ssoUser;
      req.session.userId = account.id;
      req.session.emailVerified = account.email_verified || false;

      // Update last login
      await db.execute(
        sql`UPDATE accounts SET last_login_at = NOW() WHERE id = ${account.id}`
      );

      // Explicitly save session before responding
      req.session.save((saveErr) => {
        if (saveErr) {
          console.error("[Auth] Session save error:", saveErr);
          return res.status(500).json({
            success: false,
            error: "Failed to create session",
          });
        }
        console.log("[Auth] Local auth successful for account:", account.id);
        return res.json({
          success: true,
          message: "Login successful",
          user: ssoUser,
        });
      });
    } catch (localError: any) {
      console.error("[Auth] Local auth error:", localError?.message, localError?.stack);
      if (ipAddress) trackLoginAttempt(ipAddress, false);
      if (email) trackLoginAttempt(`email:${email}`, false);
      return res.status(500).json({
        success: false,
        error: "Authentication service unavailable (local)",
        localAuthError: localError?.message,
      });
    }
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  // Clear session
  req.session.destroy((err) => {
    // Clear SSO cookies
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
    res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
    res.clearCookie("connect.sid");

    res.json({
      success: true,
      message: "Logout successful",
    });
  });
});

/**
 * GET /api/auth/session
 * Check session status - supports both SSO and local auth
 */
router.get("/session", async (req, res) => {
  // Check for local session first (from local auth fallback)
  if ((req.session as any).ssoUser) {
    return res.json({
      success: true,
      authenticated: true,
      user: (req.session as any).ssoUser,
    });
  }

  // Check SSO token
  const ssoToken = req.cookies?.fanz_sso_token;

  if (ssoToken) {
    try {
      // Verify with SSO
      const response = await fetch(`${SSO_BASE_URL}/auth/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ssoToken}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        return res.json({
          success: true,
          authenticated: true,
          user: result.user,
        });
      } else {
        // Clear invalid SSO tokens to prevent redirect loops
        console.warn("[Auth] Invalid SSO token (status " + response.status + "), clearing cookies");
        res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
        res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
      }
    } catch (e) {
      console.error("[Auth] Session verification error:", e);
      // Clear invalid SSO tokens on error to prevent redirect loops
      res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
      res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
    }
  }

  res.json({
    success: true,
    authenticated: false,
    user: null,
  });
});

/**
 * GET /api/auth/user
 * Always returns 200 - returns user:null when not authenticated
 */
router.get("/user", async (req, res) => {
  // Check for local session first (from local auth fallback)
  if ((req.session as any).ssoUser) {
    return res.json({
      success: true,
      authenticated: true,
      user: (req.session as any).ssoUser,
    });
  }

  const ssoToken = req.cookies?.fanz_sso_token;

  if (!ssoToken) {
    return res.json({
      success: true,
      authenticated: false,
      user: null,
    });
  }

  try {
    const response = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!response.ok) {
      console.warn("[Auth] Invalid SSO token in /user endpoint, clearing cookies");
      res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
      res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
      return res.json({
        success: true,
        authenticated: false,
        user: null,
      });
    }

    const result = await response.json();
    res.json({
      success: true,
      authenticated: true,
      user: result.user,
    });
  } catch (error) {
    console.error("[Auth] Get user error:", error);
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
    res.clearCookie("fanz_refresh_token", { domain: ".fanz.website" });
    res.json({
      success: true,
      authenticated: false,
      user: null,
    });
  }
});

export default router;
