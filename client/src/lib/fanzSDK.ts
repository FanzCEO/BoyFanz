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
   * Redirect to SSO login with PKCE
   */
  async login(): Promise<void> {
    try {
      // Generate PKCE parameters
      const { verifier, challenge } = await this.generatePKCE();
      const state = this.generateState();

      // Store verifier and state in sessionStorage for callback
      sessionStorage.setItem(`${PLATFORM_ID}_pkce_verifier`, verifier);
      sessionStorage.setItem(`${PLATFORM_ID}_pkce_state`, state);

      // Build authorization URL with PKCE
      const params = new URLSearchParams({
        client_id: PLATFORM_ID,
        response_type: 'code',
        redirect_uri: `${window.location.origin}/auth/sso/callback`,
        scope: 'openid profile email',
        state: state,
        code_challenge: challenge,
        code_challenge_method: 'S256',
      });

      // Redirect to SSO authorization endpoint
      window.location.href = `https://sso.fanz.website/authorize?${params.toString()}`;
    } catch (error) {
      console.error('[FanzSDK] Login failed:', error);
      throw error;
    }
  }

  /**
   * Handle SSO callback and exchange code for tokens
   */
  async handleCallback(code: string, state: string): Promise<void> {
    try {
      // Verify state parameter
      const storedState = sessionStorage.getItem(`${PLATFORM_ID}_pkce_state`);
      if (!storedState || storedState !== state) {
        throw new Error('Invalid state parameter - possible CSRF attack');
      }

      // Retrieve PKCE verifier
      const verifier = sessionStorage.getItem(`${PLATFORM_ID}_pkce_verifier`);
      if (!verifier) {
        throw new Error('PKCE verifier not found in session');
      }

      // Exchange authorization code for tokens
      const response = await fetch('https://sso.fanz.website/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${window.location.origin}/auth/sso/callback`,
          client_id: PLATFORM_ID,
          code_verifier: verifier,
        }).toString(),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Token exchange failed: ${error}`);
      }

      const data = await response.json();

      // Store tokens
      this.setTokens(data.access_token, data.refresh_token);

      // Fetch and store user info if available
      if (data.id_token || data.access_token) {
        // Decode user info from id_token or fetch from userinfo endpoint
        // For now, store basic user data
        if (data.user) {
          this.setUser(data.user);
        }
      }

      // Clean up PKCE parameters
      sessionStorage.removeItem(`${PLATFORM_ID}_pkce_verifier`);
      sessionStorage.removeItem(`${PLATFORM_ID}_pkce_state`);

      console.log('[FanzSDK] Authentication successful');
    } catch (error) {
      console.error('[FanzSDK] Callback handling failed:', error);
      // Clean up on error
      sessionStorage.removeItem(`${PLATFORM_ID}_pkce_verifier`);
      sessionStorage.removeItem(`${PLATFORM_ID}_pkce_state`);
      throw error;
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
