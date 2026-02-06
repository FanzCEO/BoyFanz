/**
 * VerifyMy Age Verification Routes
 *
 * Integrates with VerifyMy API for age verification of users and creators.
 *
 * Flow:
 * - Fans: Verified when attempting to subscribe to any creator
 * - Creators: Verified during 2257 signup process with ID docs
 *
 * API Documentation: https://docs.verifymyage.com/docs/adult/authorisation/index.html
 */

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { profiles, ageVerifications } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import rateLimit from 'express-rate-limit';

const router = Router();

// ============================================
// SECURITY: Rate Limiting for verification endpoints
// ============================================
const verificationRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 verification attempts per window
  message: { error: 'Too many verification attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const checkRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // Limit check requests
  message: { error: 'Too many requests' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// SECURITY: Configuration - NO hardcoded keys
// ============================================
const VERIFYMY_CONFIG = {
  sandbox: {
    baseUrl: 'https://sandbox.verifymyage.com',
    apiKey: process.env.VERIFYMY_SANDBOX_API_KEY,
    apiSecret: process.env.VERIFYMY_SANDBOX_SECRET,
  },
  production: {
    baseUrl: 'https://oauth.verifymyage.com',
    apiKey: process.env.VERIFYMY_API_KEY,
    apiSecret: process.env.VERIFYMY_SECRET,
  },
};

const isProduction = process.env.NODE_ENV === 'production';
const config = isProduction ? VERIFYMY_CONFIG.production : VERIFYMY_CONFIG.sandbox;

// Validate configuration on startup
if (!config.apiKey || !config.apiSecret) {
  console.error('SECURITY WARNING: VerifyMy API credentials not configured in environment variables');
}

// ============================================
// SECURITY: Input Validation
// ============================================
const ALLOWED_VERIFICATION_TYPES = ['fan', 'creator'] as const;
const ALLOWED_COUNTRIES = ['us', 'gb', 'ca', 'au', 'de', 'fr'] as const;

function isValidVerificationType(type: string): type is typeof ALLOWED_VERIFICATION_TYPES[number] {
  return ALLOWED_VERIFICATION_TYPES.includes(type as any);
}

function sanitizeString(str: string | undefined, maxLength: number = 100): string {
  if (!str) return '';
  return str.slice(0, maxLength).replace(/[<>\"'&]/g, '');
}

// ============================================
// SECURITY: Signed verification token
// ============================================
const VERIFICATION_SECRET = process.env.SESSION_SECRET || process.env.JWT_SECRET;

function generateVerificationToken(userId: string, timestamp: number): string {
  if (!VERIFICATION_SECRET) {
    throw new Error('Session secret not configured');
  }
  const data = `${userId}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', VERIFICATION_SECRET)
    .update(data)
    .digest('hex');
  return Buffer.from(`${data}:${signature}`).toString('base64');
}

function verifyVerificationToken(token: string): { userId: string; timestamp: number } | null {
  if (!VERIFICATION_SECRET) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [userId, timestampStr, signature] = decoded.split(':');
    const timestamp = parseInt(timestampStr, 10);

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', VERIFICATION_SECRET)
      .update(`${userId}:${timestamp}`)
      .digest('hex');

    if (signature !== expectedSignature) return null;

    // Check expiry (30 days)
    if (Date.now() - timestamp > 30 * 24 * 60 * 60 * 1000) return null;

    return { userId, timestamp };
  } catch {
    return null;
  }
}

/**
 * Generate HMAC signature for VerifyMy API authentication
 */
function generateHmacSignature(requestBody: string): string {
  if (!config.apiSecret) {
    throw new Error('VerifyMy API secret not configured');
  }
  return crypto
    .createHmac('sha256', config.apiSecret)
    .update(requestBody)
    .digest('hex');
}

/**
 * Generate Basic Auth header for token exchange
 */
function generateBasicAuth(): string {
  if (!config.apiKey || !config.apiSecret) {
    throw new Error('VerifyMy API credentials not configured');
  }
  const credentials = `${config.apiKey}:${config.apiSecret}`;
  return Buffer.from(credentials).toString('base64');
}

/**
 * POST /api/verification/age/initiate
 * Initiates age verification flow with VerifyMy
 */
router.post('/age/initiate', verificationRateLimiter, async (req: Request, res: Response) => {
  try {
    // SECURITY: Validate API credentials exist
    if (!config.apiKey || !config.apiSecret) {
      console.error('VerifyMy credentials not configured');
      return res.status(503).json({ error: 'Age verification service unavailable' });
    }

    const userId = (req as any).user?.id;
    const { verificationType = 'fan' } = req.body;

    // SECURITY: Validate input
    if (!isValidVerificationType(verificationType)) {
      return res.status(400).json({ error: 'Invalid verification type' });
    }

    // Build redirect URL based on environment
    const baseUrl = process.env.APP_URL || 'https://boyfanz.fanz.website';
    // SECURITY: Validate baseUrl is our domain
    if (!baseUrl.includes('fanz.website') && !baseUrl.includes('localhost')) {
      console.error('Invalid APP_URL configuration');
      return res.status(500).json({ error: 'Configuration error' });
    }
    const redirectUrl = `${baseUrl}/api/verification/age/callback`;

    // Request body for VerifyMy
    const requestBody = JSON.stringify({
      redirect_url: redirectUrl,
      country: 'us',
      method: 'AgeEstimation',
      external_user_id: userId?.toString() || undefined,
    });

    const hmacSignature = generateHmacSignature(requestBody);

    // Call VerifyMy API
    const response = await fetch(`${config.baseUrl}/v2/auth/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `hmac ${config.apiKey}:${hmacSignature}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('VerifyMy API error:', response.status, errorText);
      // SECURITY: Don't expose internal error details
      return res.status(502).json({ error: 'Verification service error' });
    }

    const data = await response.json();

    // Store verification attempt in database
    if (userId) {
      try {
        await db.insert(ageVerifications).values({
          userId,
          method: 'third_party',
          verificationData: {
            provider: 'verifymy',
            sessionId: sanitizeString(data.session_id, 255),
            verificationType,
            initiatedAt: new Date().toISOString(),
          },
          isVerified: false,
          ipAddress: sanitizeString(req.ip || req.headers['x-forwarded-for']?.toString(), 45),
          userAgent: sanitizeString(req.headers['user-agent'], 500),
        });
      } catch (dbError) {
        console.log('Updating existing verification record');
      }
    }

    res.json({
      redirectUrl: data.start_verification_url || data.url,
      sessionId: data.session_id,
    });
  } catch (error) {
    console.error('Error initiating age verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/verification/age/callback
 * Handles the callback from VerifyMy after verification
 */
router.get('/age/callback', async (req: Request, res: Response) => {
  try {
    const { code, error, error_description } = req.query;

    // Handle verification errors
    if (error) {
      console.error('VerifyMy callback error:', error, error_description);
      // SECURITY: Sanitize error before including in URL
      const safeError = encodeURIComponent(sanitizeString(error as string, 50));
      return res.redirect(`/?verification=failed&error=${safeError}`);
    }

    if (!code || typeof code !== 'string') {
      return res.redirect('/?verification=failed&error=no_code');
    }

    // SECURITY: Validate code format (should be alphanumeric with dashes)
    if (!/^[a-zA-Z0-9-]+$/.test(code)) {
      return res.redirect('/?verification=failed&error=invalid_code');
    }

    // SECURITY: Validate API credentials
    if (!config.apiKey || !config.apiSecret) {
      return res.redirect('/?verification=failed&error=service_unavailable');
    }

    // Exchange code for access token
    const tokenRequestBody = JSON.stringify({ code });

    const tokenResponse = await fetch(`${config.baseUrl}/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${generateBasicAuth()}`,
      },
      body: tokenRequestBody,
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange error:', tokenResponse.status);
      return res.redirect('/?verification=failed&error=token_exchange_failed');
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.redirect('/?verification=failed&error=no_token');
    }

    // Get user verification status
    const userResponse = await fetch(
      `${config.baseUrl}/users/me?access_token=${encodeURIComponent(accessToken)}`,
      { method: 'GET' }
    );

    if (!userResponse.ok) {
      console.error('User status check error:', userResponse.status);
      return res.redirect('/?verification=failed&error=status_check_failed');
    }

    const userData = await userResponse.json();

    if (userData.age_verified) {
      const userId = (req as any).user?.id || (req.session as any)?.userId;

      if (userId) {
        // Update profile's verification status
        await db.update(profiles).set({
          ageVerified: true,
        }).where(eq(profiles.id, userId));

        // Update verification record
        await db.update(ageVerifications).set({
          isVerified: true,
          verifiedAt: new Date(),
          verificationData: {
            provider: 'verifymy',
            verifyMyUserId: sanitizeString(userData.id, 255),
            threshold: userData.threshold || 18,
            verifiedAt: new Date().toISOString(),
          },
        }).where(eq(ageVerifications.userId, userId));

        // SECURITY: Set signed verification cookie
        const token = generateVerificationToken(userId, Date.now());
        res.cookie('age_verification_token', token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'strict',
          maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
          signed: true,
        });
      }

      return res.redirect('/?verification=success');
    } else {
      return res.redirect('/?verification=failed&error=not_verified');
    }
  } catch (error) {
    console.error('Error in age verification callback:', error);
    return res.redirect('/?verification=failed&error=internal_error');
  }
});

/**
 * GET /api/verification/age/check
 * Checks if the current user is age verified
 */
router.get('/age/check', checkRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    // SECURITY: Check signed cookie
    const signedToken = req.signedCookies?.age_verification_token;
    let cookieValid = false;

    if (signedToken) {
      const tokenData = verifyVerificationToken(signedToken);
      if (tokenData && (!userId || tokenData.userId === userId)) {
        cookieValid = true;
      }
    }

    if (userId) {
      const profile = await db.select({
        ageVerified: profiles.ageVerified,
      })
        .from(profiles)
        .where(eq(profiles.id, userId))
        .limit(1);

      if (profile.length > 0 && profile[0].ageVerified) {
        const verification = await db.select()
          .from(ageVerifications)
          .where(eq(ageVerifications.userId, userId))
          .limit(1);

        return res.json({
          verified: true,
          method: (verification[0]?.verificationData as any)?.provider || 'verifymy',
          verifiedAt: verification[0]?.verifiedAt,
        });
      }
    }

    if (cookieValid) {
      return res.json({
        verified: true,
        method: 'cookie',
        verifiedAt: null,
      });
    }

    res.json({ verified: false });
  } catch (error) {
    console.error('Error checking age verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/verification/age/confirm
 * Confirms self-declaration age verification (fallback method)
 */
router.post('/age/confirm', verificationRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { method } = req.body;

    // SECURITY: Validate method
    if (method !== 'self-declaration') {
      return res.status(400).json({ error: 'Invalid verification method' });
    }

    const timestamp = Date.now();

    if (userId) {
      await db.update(profiles).set({
        ageVerified: true,
      }).where(eq(profiles.id, userId));

      try {
        await db.insert(ageVerifications).values({
          userId,
          method: 'phone_verification',
          verificationData: {
            provider: 'self-declaration',
            method: 'self-declaration',
            verifiedAt: new Date().toISOString(),
          },
          isVerified: true,
          verifiedAt: new Date(),
          ipAddress: sanitizeString(req.ip || req.headers['x-forwarded-for']?.toString(), 45),
          userAgent: sanitizeString(req.headers['user-agent'], 500),
        });
      } catch (e) {
        await db.update(ageVerifications).set({
          isVerified: true,
          verifiedAt: new Date(),
          verificationData: {
            provider: 'self-declaration',
            method: 'self-declaration',
            verifiedAt: new Date().toISOString(),
          },
        }).where(eq(ageVerifications.userId, userId));
      }

      // SECURITY: Set signed verification cookie
      const token = generateVerificationToken(userId, timestamp);
      res.cookie('age_verification_token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        signed: true,
      });
    } else {
      // For anonymous users, use a simpler signed cookie
      const anonToken = generateVerificationToken('anon', timestamp);
      res.cookie('age_verification_token', anonToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        signed: true,
      });
    }

    res.json({ success: true, method: 'self-declaration' });
  } catch (error) {
    console.error('Error confirming age verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/verification/creator/verify
 * Initiates creator verification (2257 compliance + age verification)
 */
router.post('/creator/verify', verificationRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // SECURITY: Validate API credentials
    if (!config.apiKey || !config.apiSecret) {
      return res.status(503).json({ error: 'Verification service unavailable' });
    }

    const baseUrl = process.env.APP_URL || 'https://boyfanz.fanz.website';
    if (!baseUrl.includes('fanz.website') && !baseUrl.includes('localhost')) {
      return res.status(500).json({ error: 'Configuration error' });
    }
    const redirectUrl = `${baseUrl}/api/verification/age/callback?type=creator`;

    const requestBody = JSON.stringify({
      redirect_url: redirectUrl,
      country: 'us',
      method: 'IDScanFaceMatch',
      external_user_id: userId.toString(),
    });

    const hmacSignature = generateHmacSignature(requestBody);

    const response = await fetch(`${config.baseUrl}/v2/auth/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `hmac ${config.apiKey}:${hmacSignature}`,
      },
      body: requestBody,
    });

    if (!response.ok) {
      console.error('VerifyMy creator verification error:', response.status);
      return res.status(502).json({ error: 'Verification service error' });
    }

    const data = await response.json();

    try {
      await db.insert(ageVerifications).values({
        userId,
        method: 'id_document',
        verificationData: {
          provider: 'verifymy',
          sessionId: sanitizeString(data.session_id, 255),
          verificationType: 'creator',
          method: 'IDScanFaceMatch',
          initiatedAt: new Date().toISOString(),
        },
        isVerified: false,
        ipAddress: sanitizeString(req.ip || req.headers['x-forwarded-for']?.toString(), 45),
        userAgent: sanitizeString(req.headers['user-agent'], 500),
      });
    } catch (e) {
      await db.update(ageVerifications).set({
        method: 'id_document',
        verificationData: {
          provider: 'verifymy',
          sessionId: sanitizeString(data.session_id, 255),
          verificationType: 'creator',
          method: 'IDScanFaceMatch',
          initiatedAt: new Date().toISOString(),
        },
        isVerified: false,
      }).where(eq(ageVerifications.userId, userId));
    }

    res.json({
      redirectUrl: data.start_verification_url || data.url,
      sessionId: data.session_id,
    });
  } catch (error) {
    console.error('Error initiating creator verification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/verification/status
 * Gets comprehensive verification status for current user
 */
router.get('/status', checkRateLimiter, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.json({
        ageVerified: false,
        creatorVerified: false,
        is2257Compliant: false,
      });
    }

    const profile = await db.select({
      ageVerified: profiles.ageVerified,
      is2257Compliant: profiles.is2257Compliant,
      type: profiles.type,
    })
      .from(profiles)
      .where(eq(profiles.id, userId))
      .limit(1);

    if (profile.length === 0) {
      return res.json({
        ageVerified: false,
        creatorVerified: false,
        is2257Compliant: false,
      });
    }

    const p = profile[0];
    const isCreator = p.type === 'creator';

    res.json({
      ageVerified: p.ageVerified || false,
      creatorVerified: isCreator && p.is2257Compliant,
      is2257Compliant: p.is2257Compliant || false,
      isCreator,
    });
  } catch (error) {
    console.error('Error getting verification status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
