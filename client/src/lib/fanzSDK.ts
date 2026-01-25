/**
 * PROPRIETARY - Owned by Joshua Stone (Wyatt Cole) and Licensed Usage to FANZ Group Holdings LLC.
 * 30 N GOULD STREET SHERIDAN, WY 82801
 * (tm) FANZ patent pending 2025
 *
 * FANZ Platform SDK
 * Handles authentication, tokens, and platform-specific operations
 */

const PLATFORM_ID = 'boyfanz';
const TOKEN_KEY = `${PLATFORM_ID}_access_token`;
const REFRESH_TOKEN_KEY = `${PLATFORM_ID}_refresh_token`;
const USER_KEY = `${PLATFORM_ID}_user`;

interface FanzUser {
  id: string;
  email?: string;
  handle?: string;
  displayName?: string;
  avatarUrl?: string;
  isCreator?: boolean;
  roles?: string[];
}

class FanzSDK {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private user: FanzUser | null = null;

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      this.accessToken = localStorage.getItem(TOKEN_KEY);
      this.refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      const userStr = localStorage.getItem(USER_KEY);
      if (userStr) {
        this.user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('[FanzSDK] Error loading from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      if (this.accessToken) {
        localStorage.setItem(TOKEN_KEY, this.accessToken);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
      if (this.refreshToken) {
        localStorage.setItem(REFRESH_TOKEN_KEY, this.refreshToken);
      } else {
        localStorage.removeItem(REFRESH_TOKEN_KEY);
      }
      if (this.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(this.user));
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      console.error('[FanzSDK] Error saving to storage:', error);
    }
  }

  /**
   * Check if user is currently authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current user
   */
  getUser(): FanzUser | null {
    return this.user;
  }

  /**
   * Set authentication tokens after successful login
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.accessToken = accessToken;
    if (refreshToken) {
      this.refreshToken = refreshToken;
    }
    this.saveToStorage();
  }

  /**
   * Set current user
   */
  setUser(user: FanzUser): void {
    this.user = user;
    this.saveToStorage();
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  private async generatePKCE(): Promise<{ verifier: string; challenge: string }> {
    // Generate random code verifier (43-128 characters)
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    // Create SHA-256 hash of verifier
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Base64url encode the hash
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const challenge = btoa(String.fromCharCode.apply(null, hashArray))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    return { verifier, challenge };
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Login via BoyFanz backend (which proxies to SSO)
   * Browser → BoyFanz backend → SSO (never direct to SSO)
   */
  async loginWithCredentials(email: string, password: string): Promise<{ success: boolean; user?: FanzUser; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }

      // Store user if returned
      if (data.user) {
        this.setUser(data.user);
      }

      // Store tokens if returned (may be server-side session only)
      if (data.accessToken) {
        this.setTokens(data.accessToken, data.refreshToken);
      }

      console.log('[FanzSDK] Login successful');
      return { success: true, user: data.user };
    } catch (error) {
      console.error('[FanzSDK] Login failed:', error);
      return { success: false, error: 'Network error' };
    }
  }

  /**
   * @deprecated Use loginWithCredentials() instead. SSO does not have /authorize endpoint.
   * Keeping for backwards compatibility - redirects to login page.
   */
  async login(): Promise<void> {
    // SSO v3.0.0 does NOT have /authorize - redirect to login page
    console.warn('[FanzSDK] login() is deprecated. Use loginWithCredentials() instead.');
    window.location.href = '/login';
  }

  /**
   * @deprecated SSO does not have OAuth callback flow. Use loginWithCredentials() instead.
   */
  async handleCallback(code: string, state: string): Promise<void> {
    // SSO v3.0.0 does NOT have OAuth callback flow
    console.error('[FanzSDK] handleCallback() is deprecated - SSO does not support OAuth flow');
    throw new Error('SSO callback flow not supported. Use loginWithCredentials() instead.');
  }

  /**
   * Start age verification flow via BoyFanz backend
   */
  async startAgeVerification(): Promise<{ url?: string; error?: string }> {
    try {
      const response = await fetch('/api/auth/verify-age', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || 'Failed to start age verification' };
      }

      const data = await response.json();
      // Backend returns verification URL from SSO
      if (data.url) {
        return { url: data.url };
      }
      return { error: 'No verification URL returned' };
    } catch (error) {
      console.error('[FanzSDK] Age verification failed:', error);
      return { error: 'Network error' };
    }
  }

  /**
   * Check age verification status
   */
  async checkAgeVerificationStatus(): Promise<{ verified: boolean; status?: string; error?: string }> {
    try {
      const response = await fetch('/api/auth/verification-status', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return { verified: false, error: 'Failed to check verification status' };
      }

      const data = await response.json();
      return { verified: data.verified || data.ageVerified || false, status: data.status };
    } catch (error) {
      console.error('[FanzSDK] Verification status check failed:', error);
      return { verified: false, error: 'Network error' };
    }
  }

  /**
   * Logout and clear all tokens
   */
  async logout(): Promise<void> {
    try {
      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('[FanzSDK] Logout API call failed:', error);
    }

    // Clear local state
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    this.saveToStorage();

    // Redirect to home
    window.location.href = '/';
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('[FanzSDK] Token refresh failed:', error);
    }

    return false;
  }

  /**
   * Make authenticated API request
   */
  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = new Headers(options.headers);

    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // If unauthorized, try to refresh token
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        headers.set('Authorization', `Bearer ${this.accessToken}`);
        return fetch(url, {
          ...options,
          headers,
          credentials: 'include',
        });
      }
    }

    return response;
  }

  /**
   * Get platform identifier
   */
  getPlatformId(): string {
    return PLATFORM_ID;
  }
}

// Export singleton instance
export const fanzSDK = new FanzSDK();
export default fanzSDK;
