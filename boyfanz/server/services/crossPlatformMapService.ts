/**
 * Cross-Platform Map Service
 *
 * Handles:
 * - Real geolocation storage and privacy controls
 * - Cross-platform creator visibility across all FANZ platforms
 * - Distance calculations using Haversine formula
 * - Membership tier-based access control
 * - Meetup scheduling and coordination
 */

import { db } from "../db";
import { eq, and, sql, gte, lte, inArray, desc, asc, or } from "drizzle-orm";
import {
  userLocations,
  crossPlatformVisibility,
  creatorMeetups,
  meetupReminders,
  mapNotificationPreferences,
  tierFeatures,
  type UserLocation,
  type CrossPlatformVisibility,
  type CreatorMeetup,
  type TierFeatures,
} from "../../shared/nearbyMapSchema";
import { users } from "../../shared/schema";

// Types for the service
interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NearbyCreatorResult {
  id: string;
  username: string;
  profileImageUrl?: string;
  isVerified: boolean;
  bio?: string;
  followerCount: number;
  distance: number; // miles
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    isApproximate: boolean;
  };
  lastActiveAt: Date;
  isOnline: boolean;
  tags: string[];
  homePlatform: string;
  membershipTier: string;
}

interface MeetupRequest {
  requesteeId: string;
  requesteePlatform: string;
  title: string;
  description?: string;
  type: "content_creation" | "collaboration" | "casual" | "business" | "fan_meet";
  proposedDateTime: Date;
  alternateDateTime1?: Date;
  alternateDateTime2?: Date;
  duration?: number;
  locationName?: string;
  locationAddress?: string;
  locationCoords?: Coordinates;
  isVirtual?: boolean;
  virtualMeetingUrl?: string;
}

// Platform configuration for cross-platform API calls
const PLATFORM_ENDPOINTS: Record<string, string> = {
  boyfanz: process.env.BOYFANZ_API_URL || "https://boy.fanz.website/api",
  girlfanz: process.env.GIRLFANZ_API_URL || "https://girl.fanz.website/api",
  gayfanz: process.env.GAYFANZ_API_URL || "https://gay.fanz.website/api",
  transfanz: process.env.TRANSFANZ_API_URL || "https://trans.fanz.website/api",
  milffanz: process.env.MILFFANZ_API_URL || "https://milf.fanz.website/api",
  cougarfanz: process.env.COUGARFANZ_API_URL || "https://cougar.fanz.website/api",
  bearfanz: process.env.BEARFANZ_API_URL || "https://bear.fanz.website/api",
  daddyfanz: process.env.DADDYFANZ_API_URL || "https://daddy.fanz.website/api",
  pupfanz: process.env.PUPFANZ_API_URL || "https://pup.fanz.website/api",
  taboofanz: process.env.TABOOFANZ_API_URL || "https://taboo.fanz.website/api",
  fanzuncut: process.env.FANZUNCUT_API_URL || "https://uncut.fanz.website/api",
  femmefanz: process.env.FEMMEFANZ_API_URL || "https://femme.fanz.website/api",
  brofanz: process.env.BROFANZ_API_URL || "https://bro.fanz.website/api",
  southernfanz: process.env.SOUTHERNFANZ_API_URL || "https://southern.fanz.website/api",
  dlbroz: process.env.DLBROZ_API_URL || "https://dlbroz.fanz.website/api",
  guyz: process.env.GUYZ_API_URL || "https://guyz.fanz.website/api",
  fanzunlimited: process.env.FANZUNLIMITED_API_URL || "https://unlimited.fanz.website/api",
};

class CrossPlatformMapService {
  private currentPlatform: string;

  constructor(platform: string = "boyfanz") {
    this.currentPlatform = platform;
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in miles
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 3958.8; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Create approximate coordinates for privacy (fuzzy ~0.5-1 mile radius)
   */
  private createApproximateLocation(lat: number, lng: number): { lat: number; lng: number } {
    // Add random offset of 0.01-0.02 degrees (~0.7-1.4 miles)
    const latOffset = (Math.random() - 0.5) * 0.02;
    const lngOffset = (Math.random() - 0.5) * 0.02;

    return {
      lat: Math.round((lat + latOffset) * 1000000) / 1000000,
      lng: Math.round((lng + lngOffset) * 1000000) / 1000000,
    };
  }

  /**
   * Update user's location
   */
  async updateUserLocation(
    userId: string,
    coords: Coordinates,
    options: {
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      accuracy?: number;
      source?: string;
      isPublic?: boolean;
      showExact?: boolean;
      locationRadius?: number;
      visiblePlatforms?: string[];
    } = {}
  ): Promise<UserLocation> {
    const approxCoords = this.createApproximateLocation(coords.latitude, coords.longitude);

    const existing = await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(userLocations)
        .set({
          latitude: coords.latitude.toString(),
          longitude: coords.longitude.toString(),
          approxLatitude: approxCoords.lat.toString(),
          approxLongitude: approxCoords.lng.toString(),
          city: options.city,
          state: options.state,
          country: options.country || "US",
          postalCode: options.postalCode,
          accuracy: options.accuracy,
          source: options.source || "browser",
          isLocationPublic: options.isPublic ?? true,
          showExactLocation: options.showExact ?? false,
          locationRadius: options.locationRadius ?? 5,
          visibleOnPlatforms: options.visiblePlatforms ?? [this.currentPlatform],
          lastUpdated: new Date(),
        })
        .where(eq(userLocations.userId, userId))
        .returning();

      return updated;
    }

    const [newLocation] = await db
      .insert(userLocations)
      .values({
        userId,
        latitude: coords.latitude.toString(),
        longitude: coords.longitude.toString(),
        approxLatitude: approxCoords.lat.toString(),
        approxLongitude: approxCoords.lng.toString(),
        city: options.city,
        state: options.state,
        country: options.country || "US",
        postalCode: options.postalCode,
        accuracy: options.accuracy,
        source: options.source || "browser",
        isLocationPublic: options.isPublic ?? true,
        showExactLocation: options.showExact ?? false,
        locationRadius: options.locationRadius ?? 5,
        visibleOnPlatforms: options.visiblePlatforms ?? [this.currentPlatform],
      })
      .returning();

    return newLocation;
  }

  /**
   * Get user's tier features
   */
  async getUserTierFeatures(userId: string): Promise<TierFeatures | null> {
    const visibility = await db
      .select()
      .from(crossPlatformVisibility)
      .where(eq(crossPlatformVisibility.userId, userId))
      .limit(1);

    if (visibility.length === 0) {
      // Return free tier by default
      const freeTier = await db
        .select()
        .from(tierFeatures)
        .where(eq(tierFeatures.tier, "free"))
        .limit(1);

      return freeTier[0] || null;
    }

    const tier = visibility[0].membershipTier;
    const features = await db
      .select()
      .from(tierFeatures)
      .where(eq(tierFeatures.tier, tier))
      .limit(1);

    return features[0] || null;
  }

  /**
   * Get nearby creators from current platform
   */
  async getNearbyCreatorsLocal(
    center: Coordinates,
    radiusMiles: number,
    viewerUserId: string
  ): Promise<NearbyCreatorResult[]> {
    const viewerFeatures = await this.getUserTierFeatures(viewerUserId);

    // Apply tier-based radius limit
    const maxRadius = viewerFeatures?.maxViewRadius || 25;
    const effectiveRadius = Math.min(radiusMiles, maxRadius);

    // Calculate bounding box for initial filter
    const latDelta = effectiveRadius / 69; // ~69 miles per degree latitude
    const lngDelta = effectiveRadius / (69 * Math.cos(this.toRadians(center.latitude)));

    const minLat = center.latitude - latDelta;
    const maxLat = center.latitude + latDelta;
    const minLng = center.longitude - lngDelta;
    const maxLng = center.longitude + lngDelta;

    // Query creators with locations in bounding box
    const creatorsWithLocations = await db
      .select({
        user: users,
        location: userLocations,
        visibility: crossPlatformVisibility,
      })
      .from(users)
      .innerJoin(userLocations, eq(users.id, userLocations.userId))
      .leftJoin(crossPlatformVisibility, eq(users.id, crossPlatformVisibility.userId))
      .where(
        and(
          eq(users.isCreator, true),
          eq(userLocations.isLocationPublic, true),
          gte(userLocations.approxLatitude, minLat.toString()),
          lte(userLocations.approxLatitude, maxLat.toString()),
          gte(userLocations.approxLongitude, minLng.toString()),
          lte(userLocations.approxLongitude, maxLng.toString())
        )
      );

    // Calculate actual distances and filter
    const canViewExact = viewerFeatures?.canViewExactLocations ?? false;

    const results: NearbyCreatorResult[] = creatorsWithLocations
      .map(({ user, location, visibility }) => {
        const lat = canViewExact && location.showExactLocation
          ? parseFloat(location.latitude || "0")
          : parseFloat(location.approxLatitude || "0");
        const lng = canViewExact && location.showExactLocation
          ? parseFloat(location.longitude || "0")
          : parseFloat(location.approxLongitude || "0");

        const distance = this.calculateDistance(
          center.latitude,
          center.longitude,
          lat,
          lng
        );

        if (distance > effectiveRadius) return null;

        return {
          id: user.id,
          username: user.username || "Anonymous",
          profileImageUrl: user.profileImageUrl || undefined,
          isVerified: user.isVerified || false,
          bio: user.bio || undefined,
          followerCount: 0, // Would need to join with followers table
          distance,
          location: {
            city: location.city || "Unknown",
            state: location.state || "Unknown",
            lat,
            lng,
            isApproximate: !canViewExact || !location.showExactLocation,
          },
          lastActiveAt: user.lastSeenAt || new Date(),
          isOnline: user.onlineStatus || false,
          tags: [], // Would need to join with tags table
          homePlatform: visibility?.homePlatform || this.currentPlatform,
          membershipTier: visibility?.membershipTier || "free",
        };
      })
      .filter((r): r is NearbyCreatorResult => r !== null)
      .sort((a, b) => a.distance - b.distance);

    return results;
  }

  /**
   * Get nearby creators from ALL FANZ platforms (cross-platform)
   */
  async getNearbyCreatorsCrossPlatform(
    center: Coordinates,
    radiusMiles: number,
    viewerUserId: string
  ): Promise<NearbyCreatorResult[]> {
    const viewerFeatures = await this.getUserTierFeatures(viewerUserId);

    // Check if user has cross-platform access
    if (!viewerFeatures?.canViewCrossPlatform) {
      // Return only local platform creators
      return this.getNearbyCreatorsLocal(center, radiusMiles, viewerUserId);
    }

    // Get local creators first
    const localCreators = await this.getNearbyCreatorsLocal(center, radiusMiles, viewerUserId);

    // Query other platforms via API
    const crossPlatformCreators: NearbyCreatorResult[] = [];
    const apiKey = process.env.FANZ_CROSS_PLATFORM_API_KEY;

    if (!apiKey) {
      console.warn("Cross-platform API key not configured");
      return localCreators;
    }

    const platformPromises = Object.entries(PLATFORM_ENDPOINTS)
      .filter(([platform]) => platform !== this.currentPlatform)
      .map(async ([platform, baseUrl]) => {
        try {
          const response = await fetch(`${baseUrl}/map/nearby`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Cross-Platform-Key": apiKey,
              "X-Requesting-Platform": this.currentPlatform,
            },
            body: JSON.stringify({
              center,
              radiusMiles,
              viewerUserId,
            }),
          });

          if (!response.ok) return [];

          const data = await response.json();
          return (data.creators || []).map((c: any) => ({
            ...c,
            homePlatform: platform,
          }));
        } catch (error) {
          console.error(`Failed to fetch from ${platform}:`, error);
          return [];
        }
      });

    const results = await Promise.allSettled(platformPromises);
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        crossPlatformCreators.push(...result.value);
      }
    });

    // Combine and sort by distance
    return [...localCreators, ...crossPlatformCreators].sort(
      (a, b) => a.distance - b.distance
    );
  }

  /**
   * Create a meetup request
   */
  async createMeetup(
    requesterId: string,
    requesterPlatform: string,
    request: MeetupRequest
  ): Promise<CreatorMeetup> {
    // Check if requester has meetup permissions
    const features = await this.getUserTierFeatures(requesterId);
    if (!features?.canScheduleMeetups) {
      throw new Error("Your membership tier does not allow scheduling meetups");
    }

    // Check monthly limit
    if (features.maxMeetupsPerMonth > 0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const meetupsThisMonth = await db
        .select({ count: sql<number>`count(*)` })
        .from(creatorMeetups)
        .where(
          and(
            eq(creatorMeetups.requesterId, requesterId),
            gte(creatorMeetups.createdAt, monthStart)
          )
        );

      if (meetupsThisMonth[0].count >= features.maxMeetupsPerMonth) {
        throw new Error(
          `You've reached your monthly meetup limit (${features.maxMeetupsPerMonth})`
        );
      }
    }

    const [meetup] = await db
      .insert(creatorMeetups)
      .values({
        requesterId,
        requesteeId: request.requesteeId,
        requesterPlatform: requesterPlatform as any,
        requesteePlatform: request.requesteePlatform as any,
        type: request.type,
        title: request.title,
        description: request.description,
        proposedDateTime: request.proposedDateTime,
        alternateDateTime1: request.alternateDateTime1,
        alternateDateTime2: request.alternateDateTime2,
        duration: request.duration || 60,
        locationName: request.locationName,
        locationAddress: request.locationAddress,
        locationLatitude: request.locationCoords?.latitude.toString(),
        locationLongitude: request.locationCoords?.longitude.toString(),
        isVirtual: request.isVirtual || false,
        virtualMeetingUrl: request.virtualMeetingUrl,
      })
      .returning();

    // Schedule default reminders
    await this.scheduleDefaultReminders(meetup.id, requesterId);
    await this.scheduleDefaultReminders(meetup.id, request.requesteeId);

    return meetup;
  }

  /**
   * Schedule default reminders for a meetup
   */
  private async scheduleDefaultReminders(meetupId: string, userId: string): Promise<void> {
    const meetup = await db
      .select()
      .from(creatorMeetups)
      .where(eq(creatorMeetups.id, meetupId))
      .limit(1);

    if (!meetup.length) return;

    const prefs = await db
      .select()
      .from(mapNotificationPreferences)
      .where(eq(mapNotificationPreferences.userId, userId))
      .limit(1);

    const userPrefs = prefs[0] || { pushEnabled: true, smsEnabled: false };
    const meetupTime = meetup[0].confirmedDateTime || meetup[0].proposedDateTime;

    // Reminder times: 24h, 1h, 15min before
    const reminderTimes = [
      { minutes: 24 * 60, channel: "push" as const },
      { minutes: 60, channel: "push" as const },
      { minutes: 15, channel: "push" as const },
    ];

    // Add SMS reminders if enabled
    if (userPrefs.smsEnabled && userPrefs.smsPhoneNumber) {
      reminderTimes.push(
        { minutes: 24 * 60, channel: "sms" as const },
        { minutes: 60, channel: "sms" as const }
      );
    }

    for (const { minutes, channel } of reminderTimes) {
      const scheduledFor = new Date(meetupTime.getTime() - minutes * 60 * 1000);

      if (scheduledFor > new Date()) {
        await db.insert(meetupReminders).values({
          meetupId,
          userId,
          scheduledFor,
          minutesBefore: minutes,
          channel,
          phoneNumber: channel === "sms" ? userPrefs.smsPhoneNumber || undefined : undefined,
        });
      }
    }
  }

  /**
   * Accept a meetup request
   */
  async acceptMeetup(
    meetupId: string,
    userId: string,
    confirmedDateTime?: Date
  ): Promise<CreatorMeetup> {
    const meetup = await db
      .select()
      .from(creatorMeetups)
      .where(eq(creatorMeetups.id, meetupId))
      .limit(1);

    if (!meetup.length) {
      throw new Error("Meetup not found");
    }

    if (meetup[0].requesteeId !== userId) {
      throw new Error("Only the requestee can accept this meetup");
    }

    const [updated] = await db
      .update(creatorMeetups)
      .set({
        status: "accepted",
        confirmedDateTime: confirmedDateTime || meetup[0].proposedDateTime,
        updatedAt: new Date(),
      })
      .where(eq(creatorMeetups.id, meetupId))
      .returning();

    return updated;
  }

  /**
   * Decline a meetup request
   */
  async declineMeetup(meetupId: string, userId: string): Promise<CreatorMeetup> {
    const meetup = await db
      .select()
      .from(creatorMeetups)
      .where(eq(creatorMeetups.id, meetupId))
      .limit(1);

    if (!meetup.length) {
      throw new Error("Meetup not found");
    }

    if (meetup[0].requesteeId !== userId) {
      throw new Error("Only the requestee can decline this meetup");
    }

    const [updated] = await db
      .update(creatorMeetups)
      .set({
        status: "declined",
        updatedAt: new Date(),
      })
      .where(eq(creatorMeetups.id, meetupId))
      .returning();

    // Cancel all reminders
    await db
      .update(meetupReminders)
      .set({ status: "cancelled" })
      .where(eq(meetupReminders.meetupId, meetupId));

    return updated;
  }

  /**
   * Get user's meetups
   */
  async getUserMeetups(
    userId: string,
    status?: string
  ): Promise<CreatorMeetup[]> {
    const conditions = [
      or(
        eq(creatorMeetups.requesterId, userId),
        eq(creatorMeetups.requesteeId, userId)
      ),
    ];

    if (status) {
      conditions.push(eq(creatorMeetups.status, status as any));
    }

    return db
      .select()
      .from(creatorMeetups)
      .where(and(...conditions))
      .orderBy(desc(creatorMeetups.proposedDateTime));
  }

  /**
   * Update user's cross-platform visibility settings
   */
  async updateVisibilitySettings(
    userId: string,
    settings: {
      visiblePlatforms?: string[];
      allowCrossPlatformMessaging?: boolean;
      showOnCrossPlatformMaps?: boolean;
    }
  ): Promise<CrossPlatformVisibility> {
    const existing = await db
      .select()
      .from(crossPlatformVisibility)
      .where(eq(crossPlatformVisibility.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      const [updated] = await db
        .update(crossPlatformVisibility)
        .set({
          visiblePlatforms: settings.visiblePlatforms,
          allowCrossPlatformMessaging: settings.allowCrossPlatformMessaging,
          showOnCrossPlatformMaps: settings.showOnCrossPlatformMaps,
          updatedAt: new Date(),
        })
        .where(eq(crossPlatformVisibility.userId, userId))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(crossPlatformVisibility)
      .values({
        userId,
        homePlatform: this.currentPlatform as any,
        visiblePlatforms: settings.visiblePlatforms || [this.currentPlatform],
        allowCrossPlatformMessaging: settings.allowCrossPlatformMessaging ?? true,
        showOnCrossPlatformMaps: settings.showOnCrossPlatformMaps ?? true,
      })
      .returning();

    return created;
  }

  /**
   * Set user's membership tier
   */
  async setMembershipTier(
    userId: string,
    tier: string,
    expiresAt?: Date
  ): Promise<CrossPlatformVisibility> {
    const existing = await db
      .select()
      .from(crossPlatformVisibility)
      .where(eq(crossPlatformVisibility.userId, userId))
      .limit(1);

    const tierFeatureData = await db
      .select()
      .from(tierFeatures)
      .where(eq(tierFeatures.tier, tier as any))
      .limit(1);

    const features = tierFeatureData[0];

    if (existing.length > 0) {
      const [updated] = await db
        .update(crossPlatformVisibility)
        .set({
          membershipTier: tier as any,
          membershipExpiresAt: expiresAt,
          canViewExactLocations: features?.canViewExactLocations ?? false,
          canInitiateMeetups: features?.canScheduleMeetups ?? false,
          maxMeetupsPerMonth: features?.maxMeetupsPerMonth ?? 0,
          updatedAt: new Date(),
        })
        .where(eq(crossPlatformVisibility.userId, userId))
        .returning();

      return updated;
    }

    const [created] = await db
      .insert(crossPlatformVisibility)
      .values({
        userId,
        homePlatform: this.currentPlatform as any,
        membershipTier: tier as any,
        membershipExpiresAt: expiresAt,
        canViewExactLocations: features?.canViewExactLocations ?? false,
        canInitiateMeetups: features?.canScheduleMeetups ?? false,
        maxMeetupsPerMonth: features?.maxMeetupsPerMonth ?? 0,
      })
      .returning();

    return created;
  }
}

// Export singleton factory
export function createCrossPlatformMapService(platform: string = "boyfanz") {
  return new CrossPlatformMapService(platform);
}

export default CrossPlatformMapService;
