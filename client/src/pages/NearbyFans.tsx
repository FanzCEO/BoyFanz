/**
 * Nearby Fans - Cross-Platform Fan Discovery Map
 *
 * Fan-to-fan discovery across all FANZ platforms
 * Features:
 * - Real-time geolocation-based map
 * - Profile picture bubble markers (fans only)
 * - Click-to-chat functionality
 * - Cross-platform visibility (all FANZ platforms)
 * - Privacy-aware location sharing
 */

import { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  MapPin,
  MessageCircle,
  CheckCircle,
  Loader2,
  Navigation,
  Users,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Stadia Maps API Key
const STADIA_API_KEY = "16ac6691-38f3-40f4-9cdc-ea4667fe3716";

// Platform theme colors
const PLATFORM_COLORS = {
  boyfanz: { primary: "#475569", accent: "#64748b", neon: "#475569" },
  girlfanz: { primary: "#ff49db", accent: "#ff69b4", neon: "#ff1493" },
  gayfanz: { primary: "#9333ea", accent: "#a855f7", neon: "#c084fc" },
  transfanz: { primary: "#64748b", accent: "#94a3b8", neon: "#cbd5e1" },
  milffanz: { primary: "#dc2626", accent: "#ef4444", neon: "#f87171" },
  bearfanz: { primary: "#92400e", accent: "#b45309", neon: "#f59e0b" },
  cougarfanz: { primary: "#be123c", accent: "#e11d48", neon: "#fb7185" },
  daddyfanz: { primary: "#1e40af", accent: "#3b82f6", neon: "#60a5fa" },
  pupfanz: { primary: "#c2410c", accent: "#ea580c", neon: "#fb923c" },
  taboofanz: { primary: "#7c2d12", accent: "#9a3412", neon: "#c2410c" },
  femmefanz: { primary: "#db2777", accent: "#ec4899", neon: "#f472b6" },
  brofanz: { primary: "#0891b2", accent: "#64748b", neon: "#94a3b8" },
  southernfanz: { primary: "#16a34a", accent: "#22c55e", neon: "#4ade80" },
  dlbroz: { primary: "#6366f1", accent: "#818cf8", neon: "#a5b4fc" },
};

interface Fan {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  role: string;
  location: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
    country?: string;
    showExact: boolean;
  };
  platform: string;
  visiblePlatforms: string[];
  membershipTier: string;
  distance: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
}

// Custom marker icon for fan profile pictures
function createProfileMarker(
  avatarUrl: string | null,
  isVerified: boolean,
  platform: string = "boyfanz"
) {
  const platformColor = PLATFORM_COLORS[platform as keyof typeof PLATFORM_COLORS] || PLATFORM_COLORS.boyfanz;

  const iconHtml = `
    <div style="
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid ${isVerified ? platformColor.neon : platformColor.primary};
      box-shadow: 0 0 15px ${platformColor.primary}60, 0 3px 8px rgba(0,0,0,0.4);
      overflow: hidden;
      background: linear-gradient(135deg, ${platformColor.primary} 0%, ${platformColor.accent} 100%);
      cursor: pointer;
      transition: all 0.3s ease;
    "
    onmouseover="this.style.transform='scale(1.15)'; this.style.boxShadow='0 0 25px ${platformColor.primary}, 0 5px 12px rgba(0,0,0,0.6)';"
    onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 0 15px ${platformColor.primary}60, 0 3px 8px rgba(0,0,0,0.4)';">
      ${
        avatarUrl
          ? `<img src="${avatarUrl}" style="width: 100%; height: 100%; object-fit: cover;" />`
          : `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">?</div>`
      }
      ${
        isVerified
          ? `<div style="position: absolute; bottom: -2px; right: -2px; background: ${platformColor.neon}; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; border: 2px solid #0A0A0F;">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0A0A0F" stroke-width="3">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>`
          : ""
      }
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: "custom-profile-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
}

// Component to handle map movements and location updates
function MapController({
  onCenterChange,
  userLocation,
}: {
  onCenterChange: (lat: number, lng: number) => void;
  userLocation: UserLocation | null;
}) {
  const map = useMap();

  useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onCenterChange(center.lat, center.lng);
    },
  });

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 13);
    }
  }, [userLocation, map]);

  return null;
}

export default function NearbyFans() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [mapCenter, setMapCenter] = useState<UserLocation>({ latitude: 40.7128, longitude: -74.006 });
  const [radiusMiles, setRadiusMiles] = useState(25);
  const [selectedFan, setSelectedFan] = useState<Fan | null>(null);
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const [isLocating, setIsLocating] = useState(false);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    setIsLocating(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setUserLocation(location);
          setMapCenter(location);
          setLocationPermission("granted");
          setIsLocating(false);

          // Update location on server
          updateLocationMutation.mutate(location);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationPermission("denied");
          setIsLocating(false);
        }
      );
    }
  }, []);

  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Fetch nearby fans (NOT creators - role filter on backend)
  const { data: fansData, isLoading: isLoadingFans } = useQuery({
    queryKey: [
      "/api/map/nearby/fans",
      {
        lat: mapCenter.latitude,
        lng: mapCenter.longitude,
        radius: radiusMiles,
      },
    ],
    enabled: !!userLocation,
    refetchInterval: 30000, // Refresh every 30 seconds
    queryFn: async () => {
      const response = await fetch(
        `/api/map/nearby?lat=${mapCenter.latitude}&lng=${mapCenter.longitude}&radius=${radiusMiles}&type=fans`
      );
      if (!response.ok) throw new Error("Failed to fetch nearby fans");
      return response.json();
    },
  });

  // Update user location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async (location: UserLocation) => {
      const response = await fetch("/api/map/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          isLocationPublic: true,
        }),
      });
      if (!response.ok) throw new Error("Failed to update location");
      return response.json();
    },
  });

  // Open chat with fan
  const handleStartChat = (fan: Fan) => {
    window.location.href = `/messages?user=${fan.username}`;
  };

  // View fan profile
  const handleViewProfile = (fan: Fan) => {
    window.location.href = `/${fan.username}`;
  };

  const fans: Fan[] = fansData?.creators || []; // API returns same format

  // Current platform
  const currentPlatform = "boyfanz";
  const platformColor = PLATFORM_COLORS[currentPlatform];

  return (
    <div className="relative w-full h-screen" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Map Container */}
      <MapContainer
        center={[mapCenter.latitude, mapCenter.longitude]}
        zoom={13}
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Stadia Maps Dark Theme */}
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>'
          url={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png?api_key=${STADIA_API_KEY}`}
          maxZoom={20}
        />

        {/* Map Controller */}
        <MapController onCenterChange={(lat, lng) => setMapCenter({ latitude: lat, longitude: lng })} userLocation={userLocation} />

        {/* User's current location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={L.divIcon({
              html: `
                <div style="
                  width: 16px;
                  height: 16px;
                  background: ${platformColor.neon};
                  border: 3px solid white;
                  border-radius: 50%;
                  box-shadow: 0 0 20px ${platformColor.primary};
                "></div>
              `,
              className: "user-location-marker",
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })}
          >
            <Popup>
              <div className="text-center">
                <strong>You are here</strong>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Fan markers */}
        {fans.map((fan) => (
          <Marker
            key={fan.id}
            position={[fan.location.latitude, fan.location.longitude]}
            icon={createProfileMarker(fan.avatarUrl, fan.isVerified, fan.platform)}
            eventHandlers={{
              click: () => setSelectedFan(fan),
            }}
          >
            <Popup>
              <div className="text-center min-w-[180px]">
                <Avatar className="w-14 h-14 mx-auto mb-2">
                  <AvatarImage src={fan.avatarUrl || undefined} />
                  <AvatarFallback>{fan.username[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="font-bold">{fan.displayName || fan.username}</div>
                <div className="text-sm text-gray-500">@{fan.username}</div>
                {fan.isVerified && (
                  <Badge className="mt-1 bg-green-500 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                  </Badge>
                )}
                <div className="mt-2 text-xs text-gray-600">
                  {fan.distance} miles away • {fan.platform}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Platform Logo */}
      <div className="absolute top-4 left-4 z-[1001]">
        <div
          className="px-6 py-3 rounded-lg font-bold text-2xl tracking-wider"
          style={{
            background: `linear-gradient(135deg, ${platformColor.primary} 0%, ${platformColor.accent} 100%)`,
            boxShadow: `0 0 30px ${platformColor.primary}60`,
            color: "#0A0A0F"
          }}
        >
          BOYFANZ
        </div>
      </div>

      {/* Top Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2 mt-20">
        <Card
          className="flex-1 backdrop-blur-sm p-4"
          style={{
            backgroundColor: "rgba(10, 10, 15, 0.9)",
            borderColor: platformColor.primary + "40"
          }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: platformColor.neon }} />
              <span className="text-white font-semibold">Nearby Fans</span>
            </div>
            <Badge
              variant="secondary"
              style={{
                backgroundColor: platformColor.primary + "30",
                color: platformColor.neon
              }}
            >
              {fans.length} found
            </Badge>
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-400 block mb-2">
              Search Radius: {radiusMiles} miles
            </label>
            <Slider
              value={[radiusMiles]}
              onValueChange={([value]) => setRadiusMiles(value)}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
          </div>
        </Card>

        <Button
          onClick={getUserLocation}
          disabled={isLocating}
          className="font-bold"
          style={{
            background: platformColor.primary,
            color: "#0A0A0F"
          }}
        >
          {isLocating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
        </Button>
      </div>

      {/* Loading State */}
      {isLoadingFans && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
          <Card
            className="backdrop-blur-sm px-6 py-3"
            style={{
              backgroundColor: "rgba(10, 10, 15, 0.9)",
              borderColor: platformColor.primary + "40"
            }}
          >
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: platformColor.neon }} />
              <span>Finding nearby fans...</span>
            </div>
          </Card>
        </div>
      )}

      {/* Fan Profile Dialog */}
      <Dialog open={!!selectedFan} onOpenChange={() => setSelectedFan(null)}>
        <DialogContent
          className="text-white"
          style={{
            backgroundColor: "rgba(10, 10, 15, 0.98)",
            borderColor: platformColor.primary + "50"
          }}
        >
          {selectedFan && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4">
                  <Avatar
                    className="w-20 h-20 border-2"
                    style={{
                      borderColor: platformColor.neon,
                      boxShadow: `0 0 20px ${platformColor.primary}80`
                    }}
                  >
                    <AvatarImage src={selectedFan.avatarUrl || undefined} />
                    <AvatarFallback>{selectedFan.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-2xl text-white">
                      {selectedFan.displayName || selectedFan.username}
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      @{selectedFan.username}
                    </DialogDescription>
                    {selectedFan.isVerified && (
                      <Badge
                        className="mt-2"
                        style={{
                          background: platformColor.neon,
                          color: "#0A0A0F"
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" /> Verified Fan
                      </Badge>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <MapPin className="w-4 h-4" style={{ color: platformColor.neon }} />
                  <span>{selectedFan.distance} miles away</span>
                  {selectedFan.location.city && (
                    <span>
                      • {selectedFan.location.city}
                      {selectedFan.location.state && `, ${selectedFan.location.state}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: PLATFORM_COLORS[selectedFan.platform as keyof typeof PLATFORM_COLORS]?.primary + "50",
                      color: PLATFORM_COLORS[selectedFan.platform as keyof typeof PLATFORM_COLORS]?.neon
                    }}
                  >
                    {selectedFan.platform}
                  </Badge>
                  <Badge variant="outline" className="border-purple-500/30 text-purple-400">
                    {selectedFan.membershipTier}
                  </Badge>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    onClick={() => handleStartChat(selectedFan)}
                    className="flex-1 font-bold"
                    style={{
                      background: platformColor.primary,
                      color: "#0A0A0F"
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                  <Button
                    onClick={() => handleViewProfile(selectedFan)}
                    variant="outline"
                    className="flex-1"
                    style={{
                      borderColor: platformColor.primary + "50",
                      color: platformColor.neon
                    }}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Location Permission Denied */}
      {locationPermission === "denied" && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000]">
          <Card
            className="p-6 max-w-md"
            style={{
              backgroundColor: "rgba(10, 10, 15, 0.95)",
              borderColor: "#dc2626"
            }}
          >
            <h3 className="text-xl font-bold text-white mb-2">Location Access Required</h3>
            <p className="text-gray-400 mb-4">
              To find nearby fans, please enable location access in your browser settings.
            </p>
            <Button
              onClick={getUserLocation}
              className="w-full font-bold"
              style={{
                background: platformColor.primary,
                color: "#0A0A0F"
              }}
            >
              Try Again
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
