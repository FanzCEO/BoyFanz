/**
 * FanzSSO Client for BoyFanz
 * Enables cross-platform single sign-on across all Fanz platforms
 */

import jwt from 'jsonwebtoken';
import { db } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { logger } from '../logger';

const SSO_URL = process.env.SSO_URL || 'https://sso.fanz.website';
const PLATFORM_ID = process.env.PLATFORM_ID || 'boyfanz';
const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'boyfanz-jwt-secret';
const APP_URL = process.env.APP_URL || 'https://boy.fanz.website';

export interface SSOUser {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar?: string;
  membershipTier: 'free' | 'premium' | 'vip' | 'creator';
  isVerified: boolean;
  ageVerified: boolean;
  idVerified: boolean;
  createdAt: Date;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface SSOValidationResult {
  valid: boolean;
  token?: {
    userId: string;
    email: string;
    platformId: string;
    expiresAt: number;
    scopes: string[];
  };
  error?: string;
}

class SSOClient {
  /**
   * Safely parse error response - handles both JSON and non-JSON error responses
   */
  private async parseErrorResponse(response: Response): Promise<{ message?: string; status: number; statusText: string }> {
    const contentType = response.headers.get('content-type') || '';
    const status = response.status;
    const statusText = response.statusText;

    try {
      const text = await response.text();

      if (contentType.includes('application/json') || (text.trim().startsWith('{') || text.trim().startsWith('['))) {
        try {
          const json = JSON.parse(text);
          return {
            message: json.message || json.error || statusText,
            status,
            statusText,
          };
        } catch (parseError) {
          return {
            message: text || statusText,
            status,
            statusText,
          };
        }
      }

      return {
        message: text || statusText,
        status,
        statusText,
      };
    } catch (error) {
      logger.warn({ error, status, statusText }, 'Failed to read error response body');
      return {
        message: statusText,
        status,
        statusText,
      };
    }
  }

  /**
   * Generate the SSO login URL with redirect back to our app
   */
  getAuthorizationUrl(state?: string): string {
    const returnUrl = encodeURIComponent(`${APP_URL}/api/auth/callback`);
    return `${SSO_URL}?platform=${PLATFORM_ID}&return_to=${returnUrl}&state=${state || this.generateState()}`;
  }

  /**
   * Validate SSO token from another platform
   */
  async validateToken(token: string): Promise<SSOValidationResult> {
    try {
      const response = await fetch(`${SSO_URL}/api/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-ID': PLATFORM_ID,
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorInfo = await this.parseErrorResponse(response);
        return { valid: false, error: errorInfo.message || 'Invalid token' };
      }

      const data = await response.json();

      if (!data.token) {
        logger.warn({ response: data }, 'SSO validation response missing token property');
        return { valid: false, error: 'Invalid response format from SSO service' };
      }

      return { valid: true, token: data.token };
    } catch (error) {
      logger.error({ error }, 'SSO token validation failed');
      return { valid: false, error: 'SSO service unavailable' };
    }
  }

  /**
   * Verify SSO token and get user info
   */
  async verifyToken(token: string): Promise<{ valid: boolean; user?: SSOUser; platformId?: string } | null> {
    try {
      const response = await fetch(`${SSO_URL}/verify-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token })
      });

      if (!response.ok) {
        console.error('[SSO] Token verification failed:', response.status);
        return null;
      }

      const data = await response.json();
      if (!data.valid) return null;

      return {
        valid: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          displayName: data.user.display_name || data.user.displayName,
          avatar: data.user.avatar_url,
          membershipTier: data.user.fanzai_tier || data.user.fanzaiTier || 'free',
          isVerified: data.user.email_verified || false,
          ageVerified: data.user.ageVerified || data.user.age_verified || false,
          idVerified: data.user.identityVerified || data.user.identity_verified || false,
          createdAt: new Date(data.user.created_at || Date.now())
        },
        platformId: data.platformId
      };
    } catch (error) {
      console.error('[SSO] Token verification error:', error);
      return null;
    }
  }

  /**
   * Generate SSO token for cross-platform login
   */
  async generateToken(userId: string, email: string, scopes: string[] = ['read']): Promise<string | null> {
    try {
      const response = await fetch(`${SSO_URL}/api/auth/platform-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-ID': PLATFORM_ID,
        },
        body: JSON.stringify({
          userId,
          email,
          platformId: PLATFORM_ID,
          scopes,
        }),
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.token || typeof data.token !== 'string') {
        logger.warn({ response: data }, 'SSO token generation response missing or invalid token property');
        return null;
      }

      return data.token;
    } catch (error) {
      logger.error({ error }, 'SSO token generation failed');
      return null;
    }
  }

  /**
   * Login user via SSO API (for API-based login)
   */
  async login(email: string, password: string): Promise<{ success: boolean; user?: SSOUser; token?: string; error?: string }> {
    try {
      const response = await fetch(`${SSO_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, platformId: PLATFORM_ID })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Login failed' };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          displayName: data.user.displayName,
          avatar: data.user.avatar,
          membershipTier: data.user.fanzaiTier || 'free',
          isVerified: data.user.emailVerified || false,
          ageVerified: data.user.ageVerified || false,
          idVerified: data.user.identityVerified || false,
          createdAt: new Date()
        },
        token: data.token
      };
    } catch (error) {
      logger.error({ error }, 'SSO login failed');
      return { success: false, error: 'SSO service unavailable' };
    }
  }

  /**
   * Register user via SSO API
   */
  async register(userData: {
    email: string;
    password: string;
    username?: string;
  }): Promise<{ success: boolean; user?: SSOUser; token?: string; error?: string }> {
    try {
      const response = await fetch(`${SSO_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...userData,
          platformId: PLATFORM_ID,
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      return {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: data.user.username,
          displayName: data.user.displayName || userData.username,
          membershipTier: 'free',
          isVerified: false,
          ageVerified: false,
          idVerified: false,
          createdAt: new Date()
        },
        token: data.token
      };
    } catch (error) {
      logger.error({ error }, 'SSO registration failed');
      return { success: false, error: 'SSO service unavailable' };
    }
  }

  /**
   * Get verification status from SSO
   */
  async getVerificationStatus(userId: string): Promise<{ ageVerified: boolean; identityVerified: boolean; verificationUrl?: string } | null> {
    try {
      const response = await fetch(`${SSO_URL}/api/verification/check/${userId}`);
      if (!response.ok) return null;

      const data = await response.json();
      return {
        ageVerified: data.ageVerified || false,
        identityVerified: data.identityVerified || false,
        verificationUrl: data.ageVerified ? undefined : `${SSO_URL}/verify-age?user_id=${userId}&return_to=${encodeURIComponent(APP_URL)}`
      };
    } catch (error) {
      console.error('[SSO] Verification status error:', error);
      return null;
    }
  }

  /**
   * Create or update user in local database and link to SSO
   */
  async createOrLinkUser(ssoUser: SSOUser): Promise<{ user: any; isNew: boolean }> {
    try {
      // Check if user already exists by email
      const existingUsers = await db.select().from(users).where(eq(users.email, ssoUser.email)).limit(1);

      if (existingUsers.length > 0) {
        // Update existing user
        const existingUser = existingUsers[0];
        await db.update(users)
          .set({
            displayName: ssoUser.displayName || existingUser.displayName,
            profileImageUrl: ssoUser.avatar || existingUser.profileImageUrl,
            emailVerified: ssoUser.isVerified,
            lastSeenAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id));

        return { user: { ...existingUser, ...ssoUser }, isNew: false };
      }

      // Create new user
      const newUserData = {
        id: ssoUser.id,
        email: ssoUser.email,
        username: ssoUser.username,
        displayName: ssoUser.displayName,
        profileImageUrl: ssoUser.avatar || null,
        role: 'fan' as const,
        status: 'active' as const,
        authProvider: 'sso' as const,
        emailVerified: ssoUser.isVerified,
        password: 'sso_authenticated', // SSO users don't have local passwords
        onlineStatus: true,
        lastSeenAt: new Date(),
      };

      const [newUser] = await db.insert(users).values(newUserData).returning();

      return { user: newUser, isNew: true };
    } catch (error) {
      console.error('[SSO] Create/link user error:', error);
      throw error;
    }
  }

  /**
   * Generate a local JWT token for the user
   */
  generateLocalToken(user: any): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        isAnonymous: false
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  /**
   * Logout from SSO
   */
  async logout(accessToken: string): Promise<boolean> {
    try {
      await fetch(`${SSO_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Platform-ID': PLATFORM_ID,
        },
        body: JSON.stringify({ token: accessToken }),
      });
      return true;
    } catch (error) {
      logger.error({ error }, 'SSO logout failed');
      return false;
    }
  }

  /**
   * Generate random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }
}

export const ssoClient = new SSOClient();
