import { Router, type Request, type Response } from "express";
import { z } from "zod";
import { trackLoginAttempt, checkBruteForce } from "../middleware/bruteForceProtection";
import { authRateLimit } from "../middleware/rateLimitingAdvanced";
import { db } from "../db";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = Router();

// SSO Configuration
const SSO_BASE_URL = process.env.SSO_BASE_URL || process.env.SSO_URL || "https://sso.fanz.website";
const PLATFORM_ID = "boyfanz";
const PLATFORM_URL = process.env.PLATFORM_URL || "https://boyfanz.fanz.website";
const JWT_SECRET = process.env.SSO_SHARED_SECRET || process.env.JWT_SECRET || "fanz-sso-shared-secret";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters").optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// GET /api/auth/sso - Redirect to SSO login
router.get("/sso", (req: Request, res: Response) => {
  const state = Math.random().toString(36).substring(2, 15);
  res.cookie("sso_state", state, { httpOnly: true, maxAge: 600000, sameSite: "lax" });
  const returnUrl = encodeURIComponent(`${PLATFORM_URL}/api/auth/sso/callback`);
  res.redirect(`${SSO_BASE_URL}/auth/login?platform=${PLATFORM_ID}&return_to=${returnUrl}&state=${state}`);
});

// GET /api/auth/sso/callback - Handle SSO callback
router.get("/sso/callback", async (req: Request, res: Response) => {
  try {
    const { token, error } = req.query;
    if (error) return res.redirect(`/?error=${encodeURIComponent(String(error))}`);
    if (!token) return res.redirect("/?error=no_token");

    // Verify token with SSO
    const verifyRes = await fetch(`${SSO_BASE_URL}/verify-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, platform: PLATFORM_ID })
    });

    if (!verifyRes.ok) return res.redirect("/?error=invalid_token");
    const { valid } = await verifyRes.json();
    if (!valid) return res.redirect("/?error=token_invalid");

    // Set cookies
    res.cookie("fanz_sso_token", token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: ".fanz.website",
      path: "/"
    });
    res.cookie("fanz_token", token as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      domain: ".fanz.website",
      path: "/"
    });

    res.redirect("/");
  } catch (error) {
    console.error("[SSO] Callback error:", error);
    res.redirect("/?error=sso_error");
  }
});

// GET /api/auth/user - Get current user
router.get("/user", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.fanz_sso_token || req.cookies?.fanz_token || 
                  req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      if ((req.session as any)?.ssoUser) {
        return res.json({ success: true, authenticated: true, user: (req.session as any).ssoUser });
      }
      return res.status(401).json({ message: "Unauthorized" });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e: any) {
      console.warn("[Auth] JWT verify failed:", e.message);
      res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
      res.clearCookie("fanz_token", { domain: ".fanz.website" });
      return res.status(401).json({ message: "Invalid token" });
    }

    const userId = decoded.userId || decoded.sub || decoded.id;
    if (!userId) return res.status(401).json({ message: "Invalid token payload" });

    // Try DB lookup
    let dbUser = null;
    try {
      const result = await db.execute(sql`SELECT id, email, username, display_name, role, email_verified FROM accounts WHERE id = ${userId} LIMIT 1`);
      dbUser = result.rows?.[0];
    } catch (dbError: any) {
      console.warn("[Auth] DB lookup failed:", dbError?.message);
    }

    if (dbUser) {
      return res.json({
        id: dbUser.id,
        email: dbUser.email,
        username: dbUser.username || decoded.username,
        displayName: dbUser.display_name || decoded.displayName,
        role: dbUser.role || "fan",
        emailVerified: dbUser.email_verified || false,
        ageVerified: decoded.ageVerified || decoded.age_verified || false,
        identityVerified: decoded.identityVerified || decoded.identity_verified || false,
        isCreator: dbUser.role === "creator" || decoded.isCreator || false,
        profile: null
      });
    }

    // Fallback to token data
    console.warn("[Auth] Returning user from token (DB unavailable)");
    return res.json({
      id: userId,
      email: decoded.email,
      username: decoded.username || decoded.email?.split("@")[0],
      displayName: decoded.name || decoded.displayName || decoded.username,
      ageVerified: decoded.ageVerified || decoded.age_verified || false,
      identityVerified: decoded.identityVerified || decoded.identity_verified || false,
      isCreator: decoded.isCreator || false,
      profile: null
    });
  } catch (error) {
    console.error("[Auth] Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
});

// GET /api/auth/session
router.get("/session", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.fanz_sso_token || req.cookies?.fanz_token ||
                  req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      if ((req.session as any)?.ssoUser) {
        return res.json({ success: true, authenticated: true, user: (req.session as any).ssoUser });
      }
      return res.json({ success: true, authenticated: false, user: null });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (e) {
      res.clearCookie("fanz_sso_token", { domain: ".fanz.website" });
      res.clearCookie("fanz_token", { domain: ".fanz.website" });
      return res.json({ success: true, authenticated: false, user: null });
    }

    res.json({
      success: true,
      authenticated: true,
      user: {
        id: decoded.userId || decoded.sub || decoded.id,
        email: decoded.email,
        username: decoded.username || decoded.email?.split("@")[0],
        ageVerified: decoded.ageVerified || decoded.age_verified || false,
      }
    });
  } catch (error) {
    res.json({ success: true, authenticated: false, user: null });
  }
});

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const response = await fetch(`${SSO_BASE_URL}/register`, {
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
      return res.status(response.status).json({ success: false, error: result.error || "Registration failed" });
    }

    if (result.token) {
      res.cookie("fanz_sso_token", result.token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, domain: ".fanz.website", path: "/"
      });
      res.cookie("fanz_token", result.token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, domain: ".fanz.website", path: "/"
      });
    }

    res.json({ success: true, message: "Registration successful!", user: result.user, token: result.token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Registration service unavailable" });
  }
});

// POST /api/auth/login
router.post("/login", authRateLimit, async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";

    const bruteCheck = checkBruteForce(ipAddress);
    if (bruteCheck.blocked) {
      return res.status(429).json({ success: false, error: bruteCheck.message, retryAfter: bruteCheck.retryAfterMs });
    }

    const response = await fetch(`${SSO_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.email, password: data.password, platformId: PLATFORM_ID }),
    });

    const result = await response.json();
    if (!response.ok) {
      trackLoginAttempt(ipAddress, false);
      return res.status(response.status).json({ success: false, error: result.error || "Login failed" });
    }

    trackLoginAttempt(ipAddress, true);

    if (result.token) {
      res.cookie("fanz_sso_token", result.token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, domain: ".fanz.website", path: "/"
      });
      res.cookie("fanz_token", result.token, {
        httpOnly: true, secure: process.env.NODE_ENV === "production",
        sameSite: "lax", maxAge: 7 * 24 * 60 * 60 * 1000, domain: ".fanz.website", path: "/"
      });
    }

    res.json({ success: true, message: "Login successful", user: result.user, token: result.token });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: "Validation failed", details: error.errors });
    }
    res.status(500).json({ success: false, error: "Authentication service unavailable" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website", path: "/" });
    res.clearCookie("fanz_token", { domain: ".fanz.website", path: "/" });
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logout successful" });
  });
});

// GET /api/auth/logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    res.clearCookie("fanz_sso_token", { domain: ".fanz.website", path: "/" });
    res.clearCookie("fanz_token", { domain: ".fanz.website", path: "/" });
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
});

export default router;
