/**
 * FanzSSO Shared Types
 *
 * Common types used across server and client SDKs.
 */

// ============================================================
// PLATFORM CONFIGURATION
// ============================================================

export type FanzPlatform =
  | 'boyfanz'
  | 'girlfanz'
  | 'pupfanz'
  | 'taboofanz'
  | 'transfanz'
  | 'bearfanz'
  | 'milffanz'
  | 'cougarfanz'
  | 'brofanz'
  | 'femmefanz'
  | 'daddyfanz'
  | 'southernfanz'
  | 'gayfanz';

export interface FanzSSOConfig {
  /** Platform identifier (e.g., 'boyfanz', 'girlfanz') */
  platformId: FanzPlatform;
  /** SSO server base URL */
  ssoBaseUrl: string;
  /** OAuth client ID for this platform */
  clientId: string;
  /** OAuth client secret */
  clientSecret: string;
  /** OAuth callback URL for this platform */
  callbackUrl: string;
  /** JWT shared secret for token verification */
  jwtSecret: string;
}

// ============================================================
// USER & AUTHENTICATION TYPES
// ============================================================

export interface SSOUser {
  /** Unique user ID from SSO */
  id: string;
  /** User's email address */
  email: string;
  /** Username */
  username?: string;
  /** Display name */
  displayName?: string;
  /** First name */
  firstName?: string;
  /** Last name */
  lastName?: string;
  /** Profile image URL */
  profileImageUrl?: string;
  /** User roles (admin, moderator, creator, fan) */
  roles: string[];
  /** Specific permissions */
  permissions: string[];
  /** Platforms this user has access to */
  platformAccess: FanzPlatform[];
  /** Age verification status */
  ageVerified: boolean;
  /** When age was verified */
  ageVerifiedAt?: string;
  /** Email verification status */
  emailVerified: boolean;
  /** 2257 creator verification status */
  creatorVerified: boolean;
  /** Whether user has submitted 2257 forms */
  creator2257Verified: boolean;
  /** Is user an admin */
  isAdmin: boolean;
  /** Is user a moderator */
  isModerator: boolean;
  /** Is user a creator */
  isCreator: boolean;
  /** Is this a super admin (CEO/owner) */
  isSuperAdmin: boolean;
}

export interface SSOTokenPayload {
  /** Subject (user ID) */
  sub: string;
  /** Email */
  email: string;
  /** Username */
  username?: string;
  /** Display name */
  display_name?: string;
  /** Roles */
  roles: string[];
  /** Permissions */
  permissions: string[];
  /** Platform access */
  platformAccess: FanzPlatform[];
  /** Age verified */
  age_verified: boolean;
  /** Age verified timestamp */
  age_verified_at?: string;
  /** Email verified */
  email_verified: boolean;
  /** Is creator */
  is_creator: boolean;
  /** Creator 2257 verified */
  creator_2257_verified: boolean;
  /** Membership tier */
  membership_tier: MembershipTier;
  /** Token issuer */
  iss: string;
  /** Token audience */
  aud: string;
  /** Expiration timestamp */
  exp: number;
  /** Issued at timestamp */
  iat: number;
}

// ============================================================
// ENTITLEMENTS & MEMBERSHIP
// ============================================================

export type MembershipTier =
  | 'free'
  | 'basic'
  | 'premium'
  | 'vip'
  | 'unlimited';

export interface Entitlements {
  /** Current membership tier */
  tier: MembershipTier;
  /** Is membership active */
  isActive: boolean;
  /** Membership expiration date */
  expiresAt?: string;
  /** Feature flags */
  features: EntitlementFeatures;
  /** Platform/zone access levels */
  zoneAccess: Record<FanzPlatform, 'none' | 'limited' | 'full'>;
  /** Step-up verification completed */
  stepUpVerified: boolean;
  /** Step-up verification expiration */
  stepUpExpiresAt?: string;
}

export interface EntitlementFeatures {
  /** Can view basic/free content */
  basic_viewing: boolean;
  /** Can view public content */
  public_content: boolean;
  /** Can view premium content */
  premium_content: boolean;
  /** Can access live streaming */
  live_streaming: boolean;
  /** Can send direct messages */
  direct_messaging: boolean;
  /** Can tip creators */
  tipping: boolean;
  /** Can purchase content */
  purchases: boolean;
  /** Can subscribe to creators */
  subscriptions: boolean;
  /** Priority support */
  priority_support: boolean;
  /** Ad-free experience */
  ad_free: boolean;
}

// ============================================================
// API RESPONSE TYPES
// ============================================================

export interface AuthResponse {
  success: boolean;
  authenticated: boolean;
  user: SSOUser | null;
  entitlements?: Entitlements;
  token?: string;
  error?: string;
}

export interface SessionResponse {
  authenticated: boolean;
  userId: string | null;
  email: string | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  roles: string[];
}

// ============================================================
// SUPER ADMIN CONFIGURATION
// ============================================================

/** CEO/Owner emails with unrestricted access */
export const SUPER_ADMIN_EMAILS = [
  'wyatt@wyattxxxcole.com',
  'wyatt@fanz.website',
] as const;

/**
 * Check if an email belongs to a super admin
 */
export function isSuperAdmin(email: string): boolean {
  return SUPER_ADMIN_EMAILS.includes(email.toLowerCase() as any);
}

/**
 * Get default entitlements for a membership tier
 */
export function getDefaultEntitlements(tier: MembershipTier): Entitlements {
  const baseFeatures: EntitlementFeatures = {
    basic_viewing: true,
    public_content: true,
    premium_content: false,
    live_streaming: false,
    direct_messaging: false,
    tipping: false,
    purchases: false,
    subscriptions: false,
    priority_support: false,
    ad_free: false,
  };

  const zoneAccess: Record<FanzPlatform, 'none' | 'limited' | 'full'> = {
    boyfanz: 'limited',
    girlfanz: 'limited',
    pupfanz: 'limited',
    taboofanz: 'none',
    transfanz: 'limited',
    bearfanz: 'limited',
    milffanz: 'limited',
    cougarfanz: 'limited',
    brofanz: 'limited',
    femmefanz: 'limited',
    daddyfanz: 'limited',
    southernfanz: 'limited',
    gayfanz: 'limited',
  };

  switch (tier) {
    case 'free':
      return {
        tier,
        isActive: true,
        features: baseFeatures,
        zoneAccess,
        stepUpVerified: false,
      };

    case 'basic':
      return {
        tier,
        isActive: true,
        features: {
          ...baseFeatures,
          direct_messaging: true,
          tipping: true,
          purchases: true,
        },
        zoneAccess: Object.fromEntries(
          Object.entries(zoneAccess).map(([k]) => [k, 'limited'])
        ) as Record<FanzPlatform, 'none' | 'limited' | 'full'>,
        stepUpVerified: false,
      };

    case 'premium':
      return {
        tier,
        isActive: true,
        features: {
          ...baseFeatures,
          premium_content: true,
          live_streaming: true,
          direct_messaging: true,
          tipping: true,
          purchases: true,
          subscriptions: true,
        },
        zoneAccess: Object.fromEntries(
          Object.entries(zoneAccess).map(([k]) => [k, 'full'])
        ) as Record<FanzPlatform, 'none' | 'limited' | 'full'>,
        stepUpVerified: false,
      };

    case 'vip':
    case 'unlimited':
      return {
        tier,
        isActive: true,
        features: {
          basic_viewing: true,
          public_content: true,
          premium_content: true,
          live_streaming: true,
          direct_messaging: true,
          tipping: true,
          purchases: true,
          subscriptions: true,
          priority_support: true,
          ad_free: true,
        },
        zoneAccess: Object.fromEntries(
          Object.entries(zoneAccess).map(([k]) => [k, 'full'])
        ) as Record<FanzPlatform, 'none' | 'limited' | 'full'>,
        stepUpVerified: false,
      };

    default:
      return {
        tier: 'free',
        isActive: false,
        features: baseFeatures,
        zoneAccess,
        stepUpVerified: false,
      };
  }
}
