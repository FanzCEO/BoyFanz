// Social OAuth Strategies for BoyFanz - Multiple provider support
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as TwitterStrategy } from "passport-twitter";
import { Strategy as DiscordStrategy } from "passport-discord";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Express } from "express";
import { storage } from "./storage";
import { logger } from "./logger";
import { z } from "zod";
import { encryptToken } from "./utils/tokenEncryption";

// Environment validation schema for OAuth credentials
const oauthConfigSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  FACEBOOK_APP_ID: z.string().optional(),
  FACEBOOK_APP_SECRET: z.string().optional(),
  TWITTER_CONSUMER_KEY: z.string().optional(),
  TWITTER_CONSUMER_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});

const config = oauthConfigSchema.parse(process.env);

interface SocialProfile {
  provider: string;
  id: string;
  username?: string;
  displayName?: string;
  name?: { familyName?: string; givenName?: string };
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  profileUrl?: string;
  _json?: any;
}

// Unified verify function for all social providers
async function verifySocialUser(
  accessToken: string,
  refreshToken: string,
  profile: SocialProfile,
  done: (error: any, user?: any, info?: any) => void,
  req?: any // Request object to access session
) {
  try {
    const provider = profile.provider;
    const providerId = profile.id;
    const email = profile.emails?.[0]?.value || null;
    const displayName = profile.displayName || profile.username || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
    const profileImageUrl = profile.photos?.[0]?.value || null;

    logger.info('Social auth attempt', { 
      provider, 
      providerId, 
      email, 
      displayName: displayName || 'No display name'
    });

    // Check if social account already exists
    const existingSocialAccount = await storage.getSocialAccountByProvider(provider, providerId);
    
    if (existingSocialAccount) {
      // Update tokens and login existing user with encrypted tokens
      await storage.updateSocialAccount(existingSocialAccount.id, {
        accessToken: encryptToken(accessToken),
        refreshToken: encryptToken(refreshToken),
        expiresAt: null, // Will be set based on provider
        updatedAt: new Date(),
      });
      
      const user = await storage.getUser(existingSocialAccount.userId);
      if (user) {
        logger.info('Existing social account login', { 
          provider, 
          userId: user.id, 
          username: user.username 
        });
        return done(null, { ...user, authProvider: 'social', socialProvider: provider });
      }
    }

    // Check if user exists with same email
    let existingUser = null;
    if (email) {
      existingUser = await storage.getUserByEmail(email);
    }

    if (existingUser) {
      // Link social account to existing user with encrypted tokens
      await storage.createSocialAccount({
        userId: existingUser.id,
        provider,
        providerId,
        email,
        displayName,
        profileUrl: profile.profileUrl || null,
        profileImageUrl,
        accessToken: encryptToken(accessToken),
        refreshToken: encryptToken(refreshToken),
        expiresAt: null,
      });

      logger.info('Social account linked to existing user', { 
        provider, 
        userId: existingUser.id,
        username: existingUser.username 
      });
      
      return done(null, { ...existingUser, authProvider: 'social', socialProvider: provider });
    }

    // Get intended role from session or default to fan
    const intendedRole = req?.session?.socialAuthRole || "fan";
    
    // Create new user with social account
    const username = profile.username || 
                    email?.split('@')[0] || 
                    `${provider}_${providerId.slice(-8)}`;
    
    const newUser = await storage.createUser({
      username,
      email,
      firstName: profile.name?.givenName || displayName?.split(' ')[0] || null,
      lastName: profile.name?.familyName || displayName?.split(' ').slice(1).join(' ') || null,
      profileImageUrl,
      role: intendedRole, // Use intended role from session
      authProvider: "social",
      status: "active",
      onlineStatus: false,
      lastSeenAt: new Date(),
    });

    // Create social account record with encrypted tokens
    await storage.createSocialAccount({
      userId: newUser.id,
      provider,
      providerId,
      email,
      displayName,
      profileUrl: profile.profileUrl || null,
      profileImageUrl,
      accessToken: encryptToken(accessToken),
      refreshToken: encryptToken(refreshToken),
      expiresAt: null,
    });

    logger.info('New user created from social login', { 
      provider, 
      userId: newUser.id, 
      username: newUser.username,
      role: newUser.role
    });

    // Clear the role from session after use
    if (req?.session) {
      delete req.session.socialAuthRole;
    }

    return done(null, { ...newUser, authProvider: 'social', socialProvider: provider });
  } catch (error) {
    logger.error('Social auth verification error', { 
      provider: profile.provider, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return done(error);
  }
}

export function setupSocialAuth(app: Express) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.PRODUCTION_URL || 'https://boyfanz.com'
    : 'http://localhost:5000';

  // Google OAuth Strategy
  if (config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `${baseUrl}/auth/google/callback`,
      scope: ['profile', 'email'],
      passReqToCallback: true
    }, verifySocialUser));

    // Google auth routes with role support
    app.get('/auth/google', (req, res, next) => {
      const role = req.query.role as string;
      if (role && (role === 'creator' || role === 'fan')) {
        req.session.socialAuthRole = role;
      }
      passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
    });

    app.get('/auth/google/callback',
      passport.authenticate('google', { 
        successRedirect: '/',
        failureRedirect: '/auth/login?error=google_auth_failed'
      })
    );
  }

  // Facebook OAuth Strategy  
  if (config.FACEBOOK_APP_ID && config.FACEBOOK_APP_SECRET) {
    passport.use(new FacebookStrategy({
      clientID: config.FACEBOOK_APP_ID,
      clientSecret: config.FACEBOOK_APP_SECRET,
      callbackURL: `${baseUrl}/auth/facebook/callback`,
      profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
      passReqToCallback: true
    }, verifySocialUser));

    // Facebook auth routes with role support
    app.get('/auth/facebook', (req, res, next) => {
      const role = req.query.role as string;
      if (role && (role === 'creator' || role === 'fan')) {
        req.session.socialAuthRole = role;
      }
      passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
    });

    app.get('/auth/facebook/callback',
      passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: '/auth/login?error=facebook_auth_failed'
      })
    );
  }

  // Twitter OAuth Strategy
  if (config.TWITTER_CONSUMER_KEY && config.TWITTER_CONSUMER_SECRET) {
    passport.use(new TwitterStrategy({
      consumerKey: config.TWITTER_CONSUMER_KEY,
      consumerSecret: config.TWITTER_CONSUMER_SECRET,
      callbackURL: `${baseUrl}/auth/twitter/callback`,
      includeEmail: true,
      passReqToCallback: true
    }, verifySocialUser));

    // Twitter auth routes with role support
    app.get('/auth/twitter', (req, res, next) => {
      const role = req.query.role as string;
      if (role && (role === 'creator' || role === 'fan')) {
        req.session.socialAuthRole = role;
      }
      passport.authenticate('twitter')(req, res, next);
    });

    app.get('/auth/twitter/callback',
      passport.authenticate('twitter', {
        successRedirect: '/',
        failureRedirect: '/auth/login?error=twitter_auth_failed'
      })
    );
  }

  // Discord OAuth Strategy
  if (config.DISCORD_CLIENT_ID && config.DISCORD_CLIENT_SECRET) {
    passport.use(new DiscordStrategy({
      clientID: config.DISCORD_CLIENT_ID,
      clientSecret: config.DISCORD_CLIENT_SECRET,
      callbackURL: `${baseUrl}/auth/discord/callback`,
      scope: ['identify', 'email'],
      passReqToCallback: true
    }, verifySocialUser));

    // Discord auth routes with role support
    app.get('/auth/discord', (req, res, next) => {
      const role = req.query.role as string;
      if (role && (role === 'creator' || role === 'fan')) {
        req.session.socialAuthRole = role;
      }
      passport.authenticate('discord')(req, res, next);
    });

    app.get('/auth/discord/callback',
      passport.authenticate('discord', {
        successRedirect: '/',
        failureRedirect: '/auth/login?error=discord_auth_failed'
      })
    );
  }

  // GitHub OAuth Strategy
  if (config.GITHUB_CLIENT_ID && config.GITHUB_CLIENT_SECRET) {
    passport.use(new GitHubStrategy({
      clientID: config.GITHUB_CLIENT_ID,
      clientSecret: config.GITHUB_CLIENT_SECRET,
      callbackURL: `${baseUrl}/auth/github/callback`,
      scope: ['user:email'],
      passReqToCallback: true
    }, verifySocialUser));

    // GitHub auth routes with role support
    app.get('/auth/github', (req, res, next) => {
      const role = req.query.role as string;
      if (role && (role === 'creator' || role === 'fan')) {
        req.session.socialAuthRole = role;
      }
      passport.authenticate('github')(req, res, next);
    });

    app.get('/auth/github/callback',
      passport.authenticate('github', {
        successRedirect: '/',
        failureRedirect: '/auth/login?error=github_auth_failed'
      })
    );
  }

  // Social account management endpoints
  app.get('/api/user/social-accounts', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const socialAccounts = await storage.getSocialAccountsByUserId(req.user.id);
      
      // Don't return sensitive tokens to client
      const publicAccounts = socialAccounts.map(account => ({
        id: account.id,
        provider: account.provider,
        email: account.email,
        displayName: account.displayName,
        profileImageUrl: account.profileImageUrl,
        createdAt: account.createdAt,
      }));

      res.json(publicAccounts);
    } catch (error) {
      logger.error('Error fetching social accounts', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id 
      });
      res.status(500).json({ error: 'Failed to fetch social accounts' });
    }
  });

  app.delete('/api/user/social-accounts/:provider', async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { provider } = req.params;
      const userId = req.user.id;

      const deleted = await storage.deleteSocialAccountByProvider(userId, provider);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Social account not found' });
      }

      logger.info('Social account unlinked', { provider, userId });
      res.json({ success: true });
    } catch (error) {
      logger.error('Error unlinking social account', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.user?.id,
        provider: req.params.provider
      });
      res.status(500).json({ error: 'Failed to unlink social account' });
    }
  });

  logger.info('Social authentication strategies configured', {
    google: !!config.GOOGLE_CLIENT_ID,
    facebook: !!config.FACEBOOK_APP_ID, 
    twitter: !!config.TWITTER_CONSUMER_KEY,
    discord: !!config.DISCORD_CLIENT_ID,
    github: !!config.GITHUB_CLIENT_ID,
  });
}