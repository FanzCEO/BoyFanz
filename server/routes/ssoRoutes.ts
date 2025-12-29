/**
 * FanzSSO Authentication Routes
 *
 * Handles OAuth 2.0 / OIDC authentication flow with central FanzSSO server.
 */

import { Router, type Request, type Response } from "express";
import {
  FanzSSOClient,
  requireFanzSSO,
  optionalFanzSSO,
  type SSOUser,
} from "../auth/fanzSSO";
import { storage } from "../storage";

const router = Router();

// Super Admin emails - these accounts have unrestricted access and no charges
const SUPER_ADMIN_EMAILS = [
  "wyatt@wyattxxxcole.com",
  "wyatt@fanz.website",
];

/**
 * Check if user is a super admin (CEO/Owner)
 */
function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Enhance user with super admin privileges if applicable
 */
function enhanceUserWithSuperAdmin(user: SSOUser): SSOUser {
  if (isSuperAdmin(user.email)) {
    return {
      ...user,
      isAdmin: true,
      isModerator: true,
      isCreator: true,
      roles: [...new Set([...user.roles, "admin", "moderator", "creator", "superadmin", "ceo"])],
      permissions: [...new Set([...user.permissions, "*"])], // All permissions
      platformAccess: ["*"], // Access to all platforms
      ageVerified: true, // Bypass age verification
    };
  }
  return user;
}

// ============================================================
// SSO LOGIN FLOW
// ============================================================

/**
 * GET /login or /auth/sso/login
 * Redirect to FanzSSO for authentication
 */
router.get(["/login", "/auth/sso/login"], (req: Request, res: Response) => {
  // Generate CSRF state token
  const state = FanzSSOClient.generateState();
  req.session.oauthState = state;

  // Store return URL if provided
  const returnTo = req.query.returnTo as string || req.session.returnTo || "/";
  req.session.returnTo = returnTo;

  // Redirect to FanzSSO
  const authUrl = FanzSSOClient.getAuthorizationUrl(state, returnTo);
  res.redirect(authUrl);
});

/**
 * GET /auth/sso/callback
 * Handle callback from FanzSSO after authentication
 * Supports both:
 *   1. Direct token flow: ?token=JWT (from FanzSSO unified)
 *   2. OAuth code flow: ?code=X&state=Y (legacy OAuth)
 */
router.get("/auth/sso/callback", async (req: Request, res: Response) => {
  try {
    const { code, state, token, error, error_description } = req.query;

    // Handle errors from FanzSSO
    if (error) {
      console.error("[FanzSSO] Auth error:", error, error_description);
      return res.redirect(`/auth-error?error=${encodeURIComponent(error as string)}`);
    }

    let decoded: any;

    // FLOW 1: Direct token from FanzSSO (unified SSO)
    if (token) {
      console.log("[FanzSSO] Processing direct token flow");
      decoded = FanzSSOClient.decodeToken(token as string);
      if (!decoded) {
        console.error("[FanzSSO] Failed to decode direct token");
        return res.redirect("/auth-error?error=invalid_token");
      }
    }
    // FLOW 2: OAuth code flow (legacy)
    else if (code) {
      // Validate state (CSRF protection) - only for OAuth flow
      if (!state || state !== req.session.oauthState) {
        console.error("[FanzSSO] Invalid state parameter");
        return res.redirect("/auth-error?error=invalid_state");
      }

      // Clear the state from session
      delete req.session.oauthState;

      // Exchange code for tokens
      const tokens = await FanzSSOClient.exchangeCodeForTokens(code as string);

      // Decode the ID token to get user info
      decoded = FanzSSOClient.decodeToken(tokens.idToken);
      if (!decoded) {
        console.error("[FanzSSO] Failed to decode ID token");
        return res.redirect("/auth-error?error=invalid_token");
      }

      // Store OAuth tokens in session
      req.session.accessToken = tokens.accessToken;
      req.session.refreshToken = tokens.refreshToken;
    }
    // No token or code received
    else {
      console.error("[FanzSSO] No token or authorization code received");
      return res.redirect("/auth-error?error=no_credentials");
    }

    // Map to user object and enhance with super admin if applicable
    let user = FanzSSOClient.mapTokenToUser(decoded);
    user = enhanceUserWithSuperAdmin(user);

    // Store user in session
    req.session.ssoUserId = user.id;
    req.session.ssoUser = user;

    // Get return URL before clearing it
    const returnTo = req.session.returnTo || "/";
    delete req.session.returnTo;

    // Find or create local user record
    await syncUserToLocalDatabase(user);

    // Log successful authentication
    console.log(`[FanzSSO] User authenticated: ${user.email} (${user.id})${isSuperAdmin(user.email) ? " [SUPER ADMIN]" : ""}`);

    // CRITICAL: Explicitly save session to PostgreSQL before redirect
    // This prevents race condition where redirect happens before session is persisted
    req.session.save((err) => {
      if (err) {
        console.error("[FanzSSO] Session save error:", err);
        return res.redirect("/auth-error?error=session_save_failed");
      }

      // Redirect to original destination or home
      res.redirect(returnTo);
    });
  } catch (error) {
    console.error("[FanzSSO] Callback error:", error);
    res.redirect("/auth-error?error=callback_failed");
  }
});

/**
 * POST /logout or /auth/sso/logout
 * Logout from platform (and optionally from FanzSSO)
 */
router.post(["/logout", "/api/logout", "/auth/sso/logout"], (req: Request, res: Response) => {
  const globalLogout = req.query.global === "true" || req.body?.global === true;

  // Destroy local session
  req.session.destroy((err) => {
    if (err) {
      console.error("[FanzSSO] Session destruction error:", err);
    }

    // Clear SSO cookie
    res.clearCookie("fanz_sso_token");
    res.clearCookie("connect.sid");

    if (globalLogout) {
      // Redirect to FanzSSO for global logout
      const returnUrl = `${req.protocol}://${req.get("host")}/`;
      res.redirect(FanzSSOClient.getLogoutUrl(returnUrl));
    } else {
      // Local logout only - return to home
      res.redirect("/");
    }
  });
});

/**
 * GET /api/logout
 * API endpoint for logout (for SPA clients)
 */
router.get("/api/logout", (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("fanz_sso_token");
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// ============================================================
// USER SESSION ENDPOINTS
// ============================================================

/**
 * GET /api/auth/user
 * Get current authenticated user
 */
router.get("/api/auth/user", optionalFanzSSO, (req: Request, res: Response) => {
  if (!req.ssoUser && !req.session.ssoUser) {
    return res.status(401).json({
      authenticated: false,
      user: null,
    });
  }

  // Get user from request or session, enhance with super admin if needed
  let user = req.ssoUser || req.session.ssoUser;
  if (user) {
    user = enhanceUserWithSuperAdmin(user);
  }

  res.json({
    authenticated: true,
    user: {
      id: user?.id,
      email: user?.email,
      username: user?.username,
      firstName: user?.firstName,
      lastName: user?.lastName,
      profileImageUrl: user?.profileImageUrl,
      roles: user?.roles,
      isAdmin: user?.isAdmin,
      isModerator: user?.isModerator,
      isCreator: user?.isCreator,
      isSuperAdmin: user ? isSuperAdmin(user.email) : false,
      ageVerified: user?.ageVerified,
      emailVerified: user?.emailVerified,
      // Super admins bypass all charges
      bypassCharges: user ? (isSuperAdmin(user.email) || user.roles.includes("admin") || user.roles.includes("moderator")) : false,
    },
  });
});

/**
 * GET /api/auth/session
 * Get current session status
 */
router.get("/api/auth/session", optionalFanzSSO, (req: Request, res: Response) => {
  const user = req.ssoUser || req.session.ssoUser;
  const enhanced = user ? enhanceUserWithSuperAdmin(user) : null;

  res.json({
    authenticated: !!enhanced,
    userId: enhanced?.id || null,
    email: enhanced?.email || null,
    isSuperAdmin: enhanced ? isSuperAdmin(enhanced.email) : false,
    isAdmin: enhanced?.isAdmin || false,
    roles: enhanced?.roles || [],
  });
});

/**
 * GET /api/auth/check-admin
 * Check if current user has admin privileges
 */
router.get("/api/auth/check-admin", optionalFanzSSO, (req: Request, res: Response) => {
  const user = req.ssoUser || req.session.ssoUser;

  if (!user) {
    return res.json({ isAdmin: false, isSuperAdmin: false, bypassCharges: false });
  }

  const enhanced = enhanceUserWithSuperAdmin(user);
  const superAdmin = isSuperAdmin(enhanced.email);

  res.json({
    isAdmin: enhanced.isAdmin,
    isSuperAdmin: superAdmin,
    isModerator: enhanced.isModerator,
    bypassCharges: superAdmin || enhanced.isAdmin || enhanced.isModerator,
    roles: enhanced.roles,
  });
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Sync SSO user to local database
 * Creates or updates the local user record
 */
async function syncUserToLocalDatabase(ssoUser: SSOUser): Promise<void> {
  try {
    // Check if user exists locally
    const existingUser = await storage.getUserByEmail(ssoUser.email);

    const superAdmin = isSuperAdmin(ssoUser.email);

    if (existingUser) {
      // Update existing user with SSO data
      await storage.updateUser(existingUser.id, {
        email: ssoUser.email,
        username: ssoUser.username || existingUser.username,
        firstName: ssoUser.firstName || existingUser.firstName,
        lastName: ssoUser.lastName || existingUser.lastName,
        profileImageUrl: ssoUser.profileImageUrl || existingUser.profileImageUrl,
        // Super admins and admins get admin role locally
        role: superAdmin ? "admin" : (ssoUser.isAdmin ? "admin" : (ssoUser.isCreator ? "creator" : existingUser.role)),
        isAdmin: superAdmin || ssoUser.isAdmin,
        ssoUserId: ssoUser.id,
        lastSeenAt: new Date(),
        onlineStatus: true,
      });
    } else {
      // Create new local user record
      await storage.createUser({
        email: ssoUser.email,
        username: ssoUser.username || ssoUser.email.split("@")[0],
        firstName: ssoUser.firstName || null,
        lastName: ssoUser.lastName || null,
        profileImageUrl: ssoUser.profileImageUrl || null,
        // Super admins get admin role
        role: superAdmin ? "admin" : (ssoUser.isAdmin ? "admin" : (ssoUser.isCreator ? "creator" : "fan")),
        isAdmin: superAdmin || ssoUser.isAdmin,
        ssoUserId: ssoUser.id,
        authProvider: "fanz_sso",
        status: "active",
        onlineStatus: true,
        lastSeenAt: new Date(),
        password: null, // SSO users don't have local passwords
      });
    }
  } catch (error) {
    console.error("[FanzSSO] Error syncing user to local database:", error);
    // Don't throw - user can still use the platform even if local sync fails
  }
}

export default router;
export { isSuperAdmin, enhanceUserWithSuperAdmin, SUPER_ADMIN_EMAILS };
