/**
 * Step-Up Authentication Routes
 * 
 * WebAuthn passkey authentication for Empire access.
 * Requires user to re-authenticate with biometrics/device security.
 */

import { Router, type Request, type Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  AuthenticatorTransportFuture,
  CredentialDeviceType,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/types";
import { db } from "../db";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const router = Router();

// RP (Relying Party) configuration
const rpID = process.env.NODE_ENV === "production" ? "boyfanz.fanz.website" : "localhost";
const rpName = "FANZ Empire";
const origin = process.env.NODE_ENV === "production" 
  ? "https://boyfanz.fanz.website" 
  : "http://localhost:3000";

// Store challenges temporarily (in production, use Redis)
const challengeStore = new Map<string, string>();

// Step-up session duration (15 minutes)
const STEP_UP_DURATION_MS = 15 * 60 * 1000;

/**
 * Get available step-up methods for the user
 */
router.get("/methods", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify SSO token and get user
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Check for existing WebAuthn credentials
    const credentials = await db.execute(
      sql`SELECT id, friendly_name, created_at FROM webauthn_credentials WHERE account_id = ${accountId}`
    );

    const hasWebAuthn = credentials.rows.length > 0;
    
    // Check WebAuthn availability on client (indicated by header)
    const webAuthnAvailable = req.headers["x-webauthn-available"] === "true";

    res.json({
      methods: {
        webauthn: {
          available: webAuthnAvailable,
          enrolled: hasWebAuthn,
          credentials: hasWebAuthn ? credentials.rows.map((c: any) => ({
            id: c.id,
            name: c.friendly_name || "Security Key",
            createdAt: c.created_at,
          })) : [],
        },
        password: {
          available: true,
        },
      },
      recommended: hasWebAuthn ? "webauthn" : "password",
    });
  } catch (error) {
    console.error("[StepUp] Methods error:", error);
    res.status(500).json({ error: "Failed to get authentication methods" });
  }
});

/**
 * Generate WebAuthn registration options
 */
router.post("/webauthn/register/options", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get existing credentials to exclude
    const existingCreds = await db.execute(
      sql`SELECT credential_id FROM webauthn_credentials WHERE account_id = ${accountId}`
    );

    const excludeCredentials = existingCreds.rows.map((cred: any) => ({
      id: cred.credential_id,
      type: "public-key" as const,
    }));

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(accountId),
      userName: user.email || user.handle || accountId,
      userDisplayName: user.displayName || user.email || "User",
      attestationType: "none",
      excludeCredentials,
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
      supportedAlgorithmIDs: [-7, -257], // ES256, RS256
    });

    // Store challenge
    challengeStore.set(`reg:${accountId}`, options.challenge);

    res.json(options);
  } catch (error) {
    console.error("[StepUp] Registration options error:", error);
    res.status(500).json({ error: "Failed to generate registration options" });
  }
});

/**
 * Verify WebAuthn registration
 */
router.post("/webauthn/register/verify", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    const { response: credential, friendlyName } = req.body as {
      response: RegistrationResponseJSON;
      friendlyName?: string;
    };

    const expectedChallenge = challengeStore.get(`reg:${accountId}`);
    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge expired" });
    }

    const verification = await verifyRegistrationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: "Verification failed" });
    }

    const { credential: verifiedCredential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    // Store the credential
    await db.execute(
      sql`INSERT INTO webauthn_credentials 
        (account_id, credential_id, public_key, counter, device_type, backed_up, transports, friendly_name)
        VALUES (
          ${accountId},
          ${Buffer.from(verifiedCredential.id).toString("base64url")},
          ${Buffer.from(verifiedCredential.publicKey).toString("base64url")},
          ${verifiedCredential.counter},
          ${credentialDeviceType},
          ${credentialBackedUp},
          ${credential.response.transports || []},
          ${friendlyName || "Security Key"}
        )`
    );

    // Clear challenge
    challengeStore.delete(`reg:${accountId}`);

    // Grant step-up access
    const expiresAt = new Date(Date.now() + STEP_UP_DURATION_MS);
    await db.execute(
      sql`INSERT INTO step_up_sessions (account_id, session_id, expires_at, method)
        VALUES (${accountId}, ${req.sessionID}, ${expiresAt}, 'webauthn')`
    );

    res.json({
      success: true,
      verified: true,
      message: "Passkey registered successfully",
    });
  } catch (error) {
    console.error("[StepUp] Registration verify error:", error);
    res.status(500).json({ error: "Failed to verify registration" });
  }
});

/**
 * Generate WebAuthn authentication options
 */
router.post("/webauthn/authenticate/options", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Get user's credentials
    const credentials = await db.execute(
      sql`SELECT credential_id, transports FROM webauthn_credentials WHERE account_id = ${accountId}`
    );

    if (credentials.rows.length === 0) {
      return res.status(400).json({ 
        error: "No passkeys registered",
        code: "NO_CREDENTIALS"
      });
    }

    const allowCredentials = credentials.rows.map((cred: any) => ({
      id: cred.credential_id,
      type: "public-key" as const,
      transports: cred.transports as AuthenticatorTransportFuture[],
    }));

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials,
      userVerification: "preferred",
    });

    // Store challenge
    challengeStore.set(`auth:${accountId}`, options.challenge);

    res.json(options);
  } catch (error) {
    console.error("[StepUp] Authentication options error:", error);
    res.status(500).json({ error: "Failed to generate authentication options" });
  }
});

/**
 * Verify WebAuthn authentication
 */
router.post("/webauthn/authenticate/verify", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    const { response: credential } = req.body as { response: AuthenticationResponseJSON };

    const expectedChallenge = challengeStore.get(`auth:${accountId}`);
    if (!expectedChallenge) {
      return res.status(400).json({ error: "Challenge expired" });
    }

    // Get the credential from database
    const credentialId = credential.id;
    const storedCred = await db.execute(
      sql`SELECT * FROM webauthn_credentials 
        WHERE account_id = ${accountId} AND credential_id = ${credentialId}`
    );

    if (storedCred.rows.length === 0) {
      return res.status(400).json({ error: "Credential not found" });
    }

    const authenticator = storedCred.rows[0] as any;

    const verification = await verifyAuthenticationResponse({
      response: credential,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: Buffer.from(authenticator.credential_id, "base64url"),
        publicKey: Buffer.from(authenticator.public_key, "base64url"),
        counter: Number(authenticator.counter),
        transports: authenticator.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      return res.status(400).json({ error: "Verification failed" });
    }

    // Update counter
    await db.execute(
      sql`UPDATE webauthn_credentials 
        SET counter = ${verification.authenticationInfo.newCounter}, last_used_at = NOW()
        WHERE id = ${authenticator.id}`
    );

    // Clear challenge
    challengeStore.delete(`auth:${accountId}`);

    // Grant step-up access
    const expiresAt = new Date(Date.now() + STEP_UP_DURATION_MS);
    
    // Delete existing step-up sessions for this account
    await db.execute(
      sql`DELETE FROM step_up_sessions WHERE account_id = ${accountId}`
    );
    
    await db.execute(
      sql`INSERT INTO step_up_sessions (account_id, session_id, expires_at, method)
        VALUES (${accountId}, ${req.sessionID}, ${expiresAt}, 'webauthn')`
    );

    res.json({
      success: true,
      verified: true,
      message: "Authentication successful",
    });
  } catch (error) {
    console.error("[StepUp] Authentication verify error:", error);
    res.status(500).json({ error: "Failed to verify authentication" });
  }
});

/**
 * Password fallback authentication
 */
router.post("/password", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    // Verify SSO token and get user
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.status(401).json({ error: "User not found" });
    }

    // Verify password against SSO
    const passwordResponse = await fetch(`${SSO_BASE_URL}/auth/verify-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
      body: JSON.stringify({ password }),
    });

    if (!passwordResponse.ok) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Grant step-up access
    const expiresAt = new Date(Date.now() + STEP_UP_DURATION_MS);
    
    // Delete existing step-up sessions
    await db.execute(
      sql`DELETE FROM step_up_sessions WHERE account_id = ${accountId}`
    );
    
    await db.execute(
      sql`INSERT INTO step_up_sessions (account_id, session_id, expires_at, method)
        VALUES (${accountId}, ${req.sessionID}, ${expiresAt}, 'password')`
    );

    res.json({
      success: true,
      verified: true,
      message: "Password verified successfully",
    });
  } catch (error) {
    console.error("[StepUp] Password auth error:", error);
    res.status(500).json({ error: "Failed to verify password" });
  }
});

/**
 * Check if user has valid step-up session (Empire access)
 */
router.get("/empire-access", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.json({ hasAccess: false });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (!ssoResponse.ok) {
      return res.json({ hasAccess: false });
    }

    const { user } = await ssoResponse.json();
    const accountId = user?.id;

    if (!accountId) {
      return res.json({ hasAccess: false });
    }

    // Check for valid step-up session
    const session = await db.execute(
      sql`SELECT * FROM step_up_sessions 
        WHERE account_id = ${accountId} 
        AND session_id = ${req.sessionID}
        AND expires_at > NOW()`
    );

    const hasAccess = session.rows.length > 0;

    res.json({ 
      hasAccess,
      expiresAt: hasAccess ? session.rows[0].expires_at : null,
      method: hasAccess ? session.rows[0].method : null,
    });
  } catch (error) {
    console.error("[StepUp] Empire access check error:", error);
    res.json({ hasAccess: false });
  }
});

/**
 * Revoke step-up access (logout from Empire)
 */
router.post("/revoke", async (req: Request, res: Response) => {
  try {
    const ssoToken = req.cookies?.fanz_sso_token;
    
    if (!ssoToken) {
      return res.json({ success: true });
    }

    // Verify SSO token
    const SSO_BASE_URL = process.env.SSO_BASE_URL || "https://sso.fanz.website";
    const ssoResponse = await fetch(`${SSO_BASE_URL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ssoToken}`
      },
    });

    if (ssoResponse.ok) {
      const { user } = await ssoResponse.json();
      if (user?.id) {
        await db.execute(
          sql`DELETE FROM step_up_sessions WHERE account_id = ${user.id}`
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("[StepUp] Revoke error:", error);
    res.json({ success: true });
  }
});

export default router;
