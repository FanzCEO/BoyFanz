// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'wouter';
import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Users,
  Star,
  Heart,
  MessageCircle,
  Navigation,
  Filter,
  Search,
  Map,
  Globe,
  Calendar,
  Clock,
  Video,
  Crown,
  Sparkles,
  Lock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw
} from 'lucide-react';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Platform colors for cross-platform badges
const PLATFORM_COLORS: Record<string, string> = {
  boyfanz: 'bg-blue-500',
  girlfanz: 'bg-pink-500',
  gayfanz: 'bg-rainbow-gradient',
  transfanz: 'bg-slate-500',
  milffanz: 'bg-red-500',
  cougarfanz: 'bg-amber-600',
  bearfanz: 'bg-amber-800',
  daddyfanz: 'bg-gray-700',
  pupfanz: 'bg-purple-500',
  taboofanz: 'bg-black',
  fanzuncut: 'bg-orange-500',
  femmefanz: 'bg-fuchsia-500',
  brofanz: 'bg-green-600',
  southernfanz: 'bg-yellow-600',
  dlbroz: 'bg-indigo-600',
  guyz: 'bg-teal-500',
};

// Tier badge colors
const TIER_COLORS: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  free: { bg: 'bg-gray-100', text: 'text-gray-600', icon: null },
  bronze: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Star className="h-3 w-3" /> },
  silver: { bg: 'bg-gray-200', text: 'text-gray-700', icon: <Star className="h-3 w-3" /> },
  gold: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: <Crown className="h-3 w-3" /> },
  platinum: { bg: 'bg-slate-200', text: 'text-slate-700', icon: <Crown className="h-3 w-3" /> },
  diamond: { bg: 'bg-cyan-100', text: 'text-slate-700', icon: <Sparkles className="h-3 w-3" /> },
  vip: { bg: 'bg-purple-100', text: 'text-purple-700', icon: <Sparkles className="h-3 w-3" /> },
  royal_creator: { bg: 'bg-gradient-to-r from-purple-500 to-pink-500', text: 'text-white', icon: <Crown className="h-3 w-3" /> },
};

interface NearbyCreator {
  id: string;
  username: string;
  profileImageUrl?: string;
  isVerified: boolean;
  bio?: string;
  followerCount: number;
  distance: number;
  location: {
    city: string;
    state: string;
    lat: number;
    lng: number;
    isApproximate?: boolean;
  };
  lastActiveAt: string;
  isOnline: boolean;
  tags: string[];
  homePlatform: string;
  membershipTier: string;
}

interface TierFeatures {
  tier: string;
  canViewNearbyMap: boolean;
  canViewCrossPlatform: boolean;
  canViewExactLocations: boolean;
  maxViewRadius: number;
  canMessageFromMap: boolean;
  canCrossPlatformMessage: boolean;
  canScheduleMeetups: boolean;
  maxMeetupsPerMonth: number;
  hasPushNotifications: boolean;
  hasSMSReminders: boolean;
}

interface MeetupFormData {
  requesteeId: string;
  requesteePlatform: string;
  title: string;
  description: string;
  type: string;
  proposedDateTime: string;
  duration: number;
  isVirtual: boolean;
  locationName: string;
}

// Custom marker icons
const createMarkerIcon = (color: string, isOnline: boolean) => {
  const fillColor = isOnline ? '#10b981' : color;
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${fillColor}"/>
        <circle cx="12.5" cy="12.5" r="8" fill="white"/>
        <circle cx="12.5" cy="12.5" r="5" fill="${fillColor}"/>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Map recenter component
function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

// Creator map component with enhanced features
const CreatorMap = ({
  creators,
  center,
  onCreatorClick,
  onScheduleMeetup
}: {
  creators: NearbyCreator[];
  center: [number, number];
  onCreatorClick: (creator: NearbyCreator) => void;
  onScheduleMeetup: (creator: NearbyCreator) => void;
}) => {
  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg overflow-hidden"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapRecenter center={center} />
      {creators.map((creator) => {
        const platformColor = PLATFORM_COLORS[creator.homePlatform] || '#3b82f6';
        const icon = createMarkerIcon(platformColor.startsWith('bg-') ? '#3b82f6' : platformColor, creator.isOnline);

        return (
          <Marker
            key={`${creator.homePlatform}-${creator.id}`}
            position={[creator.location.lat, creator.location.lng]}
            icon={icon}
          >
            <Popup>
              <div className="p-2 min-w-[220px]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden">
                      {creator.profileImageUrl ? (
                        <img src={creator.profileImageUrl} alt={creator.username} className="w-full h-full object-cover" />
                      ) : (
                        creator.username[0]?.toUpperCase()
                      )}
                    </div>
                    {creator.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-sm">{creator.username}</span>
                      {creator.isVerified && <CheckCircle className="h-3 w-3 text-blue-500" />}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {creator.location.city}, {creator.location.state}
                    </div>
                  </div>
                </div>

                {/* Platform badge */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs capitalize">
                    {creator.homePlatform.replace('fanz', '')}
                  </Badge>
                  {creator.location.isApproximate && (
                    <span className="text-xs text-muted-foreground">~{creator.distance.toFixed(1)} mi</span>
                  )}
                </div>

                <div className="text-xs text-muted-foreground mb-3">
                  {creator.followerCount.toLocaleString()} followers
                </div>

                {creator.bio && (
                  <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {creator.bio}
                  </div>
                )}

                <div className="flex gap-1.5">
                  <button
                    onClick={() => onCreatorClick(creator)}
                    className="flex-1 text-xs bg-primary text-primary-foreground px-2 py-1.5 rounded hover:bg-primary/80 transition-colors"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => onScheduleMeetup(creator)}
                    className="text-xs bg-secondary text-secondary-foreground px-2 py-1.5 rounded hover:bg-secondary/80 transition-colors"
                  >
                    <Calendar className="h-3 w-3" />
                  </button>
                  <button className="text-xs bg-secondary text-secondary-foreground px-2 py-1.5 rounded hover:bg-secondary/80 transition-colors">
                    <MessageCircle className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

// Meetup scheduling dialog
const MeetupDialog = ({
  creator,
  open,
  onOpenChange,
  tierFeatures
}: {
  creator: NearbyCreator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tierFeatures: TierFeatures | null;
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<MeetupFormData>({
    requesteeId: '',
    requesteePlatform: '',
    title: '',
    description: '',
    type: 'content_creation',
    proposedDateTime: '',
    duration: 60,
    isVirtual: false,
    locationName: '',
  });

  useEffect(() => {
    if (creator) {
      setFormData(prev => ({
        ...prev,
        requesteeId: creator.id,
        requesteePlatform: creator.homePlatform,
        title: `Meetup with ${creator.username}`,
      }));
    }
  }, [creator]);

  const createMeetupMutation = useMutation({
    mutationFn: async (data: MeetupFormData) => {
      const response = await fetch('/api/map/meetups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create meetup');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Meetup Request Sent!',
        description: `Your meetup request has been sent to ${creator?.username}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/map/meetups'] });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create meetup',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMeetupMutation.mutate(formData);
  };

  if (!tierFeatures?.canScheduleMeetups) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Upgrade Required
            </DialogTitle>
            <DialogDescription>
              Meetup scheduling requires Silver tier or higher membership.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Silver Tier Benefits:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>- Schedule up to 3 meetups per month</li>
                <li>- Cross-platform messaging</li>
                <li>- 50 mile search radius</li>
                <li>- Push notifications</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Link href="/settings/subscription">
              <Button>
                <Crown className="h-4 w-4 mr-2" />
                Upgrade Now
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Meetup with {creator?.username}
          </DialogTitle>
          <DialogDescription>
            Request a meetup for content creation, collaboration, or just hanging out.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meetup Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="What's this meetup about?"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Meetup Type</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="content_creation">Content Creation</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
                <SelectItem value="casual">Casual Hangout</SelectItem>
                <SelectItem value="business">Business Meeting</SelectItem>
                <SelectItem value="fan_meet">Fan Meet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="datetime">Date & Time</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={formData.proposedDateTime}
                onChange={(e) => setFormData(prev => ({ ...prev, proposedDateTime: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Select
                value={formData.duration.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="virtual"
              checked={formData.isVirtual}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVirtual: checked }))}
            />
            <Label htmlFor="virtual" className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              Virtual Meetup
            </Label>
          </div>

          {!formData.isVirtual && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.locationName}
                onChange={(e) => setFormData(prev => ({ ...prev, locationName: e.target.value }))}
                placeholder="Where should you meet?"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Message (optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add a personal message..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMeetupMutation.isPending}>
              {createMeetupMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default function Nearby() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchRadius, setSearchRadius] = useState(25);
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [crossPlatformEnabled, setCrossPlatformEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState<[number, number]>([40.7128, -74.0060]);
  const [locationLoading, setLocationLoading] = useState(true);
  const [meetupDialogOpen, setMeetupDialogOpen] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<NearbyCreator | null>(null);

  // Fetch user's tier features
  const { data: tierFeatures, isLoading: tierLoading } = useQuery<TierFeatures>({
    queryKey: ['/api/map/tier-features'],
    queryFn: async () => {
      const response = await fetch('/api/map/tier-features', { credentials: 'include' });
      if (!response.ok) return null;
      const data = await response.json();
      return data.features;
    },
  });

  // Get user's location and update server
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setLocationLoading(false);

          // Update location on server
          try {
            await fetch('/api/map/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                source: 'browser',
                isPublic: true,
              }),
            });
          } catch (error) {
            console.error('Failed to update location:', error);
          }
        },
        (error) => {
          console.log('Location access denied, using default location');
          setLocationLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLocationLoading(false);
    }
  }, []);

  // Fetch nearby creators
  const {
    data: nearbyData,
    isLoading: creatorsLoading,
    refetch: refetchCreators
  } = useQuery({
    queryKey: [
      crossPlatformEnabled ? '/api/map/nearby/cross-platform' : '/api/map/nearby',
      { lat: userLocation[0], lng: userLocation[1], radius: searchRadius }
    ],
    queryFn: async () => {
      const endpoint = crossPlatformEnabled
        ? '/api/map/nearby/cross-platform'
        : '/api/map/nearby';

      const params = new URLSearchParams({
        lat: userLocation[0].toString(),
        lng: userLocation[1].toString(),
        radius: searchRadius.toString(),
      });

      const response = await fetch(`${endpoint}?${params}`, { credentials: 'include' });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch nearby creators');
      }
      return response.json();
    },
    enabled: !locationLoading,
  });

  const nearbyCreators: NearbyCreator[] = nearbyData?.creators || [];

  // Handle cross-platform toggle
  const handleCrossPlatformToggle = (enabled: boolean) => {
    if (enabled && !tierFeatures?.canViewCrossPlatform) {
      toast({
        title: 'Upgrade Required',
        description: 'Cross-platform view requires Bronze tier or higher.',
        variant: 'destructive',
      });
      return;
    }
    setCrossPlatformEnabled(enabled);
  };

  // Handle radius change with tier limits
  const handleRadiusChange = (radius: number) => {
    const maxRadius = tierFeatures?.maxViewRadius || 25;
    if (radius > maxRadius) {
      toast({
        title: 'Radius Limited',
        description: `Your tier allows up to ${maxRadius} mile radius. Upgrade for more.`,
      });
      setSearchRadius(maxRadius);
    } else {
      setSearchRadius(radius);
    }
  };

  const handleScheduleMeetup = (creator: NearbyCreator) => {
    setSelectedCreator(creator);
    setMeetupDialogOpen(true);
  };

  const handleCreatorClick = (creator: NearbyCreator) => {
    navigate(`/creator/${creator.id}`);
  };

  const formatDistance = (miles: number) => {
    if (miles < 1) return `${Math.round(miles * 5280)} ft away`;
    return `${miles.toFixed(1)} miles away`;
  };

  const getLastActiveText = (lastActiveAt: string) => {
    const date = new Date(lastActiveAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (hours < 1) return 'Active now';
    if (hours < 24) return `Active ${hours}h ago`;
    return `Active ${days}d ago`;
  };

  const filteredCreators = nearbyCreators.filter(creator =>
    locationFilter === '' ||
    creator.location.city?.toLowerCase().includes(locationFilter.toLowerCase()) ||
    creator.location.state?.toLowerCase().includes(locationFilter.toLowerCase()) ||
    creator.homePlatform.toLowerCase().includes(locationFilter.toLowerCase())
  );

  const mappableCreators = filteredCreators.filter(creator =>
    creator.location?.lat && creator.location?.lng &&
    Number.isFinite(creator.location.lat) && Number.isFinite(creator.location.lng)
  );

  const isLoading = locationLoading || creatorsLoading || tierLoading;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-2" />
            <div className="h-4 bg-muted rounded w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded mb-2" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="nearby-page">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <MapPin className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display" data-testid="page-title">
              Near by me
            </h1>
            <p className="text-muted-foreground">
              Discover creators in your area and connect locally
            </p>
          </div>
        </div>

        {/* Tier badge */}
        {tierFeatures && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${TIER_COLORS[tierFeatures.tier]?.bg || 'bg-gray-100'} ${TIER_COLORS[tierFeatures.tier]?.text || 'text-gray-600'}`}>
            {TIER_COLORS[tierFeatures.tier]?.icon}
            <span className="text-sm font-medium capitalize">{tierFeatures.tier.replace('_', ' ')}</span>
          </div>
        )}
      </div>

      {/* Controls Row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <Users className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <Map className="h-4 w-4 mr-2" />
            Map
          </Button>
        </div>

        {/* Cross-Platform Toggle */}
        <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-lg">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Switch
            id="cross-platform"
            checked={crossPlatformEnabled}
            onCheckedChange={handleCrossPlatformToggle}
            disabled={!tierFeatures?.canViewCrossPlatform}
          />
          <Label htmlFor="cross-platform" className="text-sm cursor-pointer">
            All Platforms
          </Label>
          {!tierFeatures?.canViewCrossPlatform && (
            <Lock className="h-3 w-3 text-muted-foreground" />
          )}
        </div>

        {/* Refresh Button */}
        <Button variant="ghost" size="sm" onClick={() => refetchCreators()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Radius</label>
            <select
              value={searchRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full p-2 border rounded-md bg-background"
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50} disabled={!tierFeatures || tierFeatures.maxViewRadius < 50}>
                50 miles {tierFeatures?.maxViewRadius < 50 && '(Silver+)'}
              </option>
              <option value={100} disabled={!tierFeatures || tierFeatures.maxViewRadius < 100}>
                100 miles {tierFeatures?.maxViewRadius < 100 && '(Gold+)'}
              </option>
              <option value={200} disabled={!tierFeatures || tierFeatures.maxViewRadius < 200}>
                200 miles {tierFeatures?.maxViewRadius < 200 && '(Platinum+)'}
              </option>
            </select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City, state, or platform..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {filteredCreators.length} creators found
              </span>
            </div>
            {crossPlatformEnabled && nearbyData?.byPlatform && (
              <div className="text-xs text-muted-foreground">
                from {Object.keys(nearbyData.byPlatform).length} platforms
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Location</label>
            <div className="flex items-center gap-2 text-sm">
              <Navigation className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">
                {userLocation[0].toFixed(4)}, {userLocation[1].toFixed(4)}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Map View */}
      {viewMode === 'map' && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Map className="h-5 w-5" />
              Creators Map
              {crossPlatformEnabled && (
                <Badge variant="secondary" className="ml-2">
                  <Globe className="h-3 w-3 mr-1" />
                  Cross-Platform
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Click markers to view profiles and schedule meetups
              {tierFeatures?.canViewExactLocations ? (
                <span className="text-green-600"> - Exact locations enabled</span>
              ) : (
                <span className="text-muted-foreground"> - Approximate locations (upgrade for exact)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <CreatorMap
              creators={mappableCreators}
              center={userLocation}
              onCreatorClick={handleCreatorClick}
              onScheduleMeetup={handleScheduleMeetup}
            />
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredCreators.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No creators found nearby</h3>
                <p className="text-muted-foreground mb-6">
                  Try expanding your search radius or enabling cross-platform search.
                </p>
                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => handleRadiusChange(Math.min(searchRadius * 2, tierFeatures?.maxViewRadius || 100))}
                    variant="outline"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Expand Radius
                  </Button>
                  {!crossPlatformEnabled && tierFeatures?.canViewCrossPlatform && (
                    <Button onClick={() => setCrossPlatformEnabled(true)}>
                      <Globe className="h-4 w-4 mr-2" />
                      Search All Platforms
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <Card key={`${creator.homePlatform}-${creator.id}`} className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Link href={`/creator/${creator.id}`}>
                        <Avatar className="h-12 w-12 cursor-pointer ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                          <AvatarImage src={creator.profileImageUrl} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {creator.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      {creator.isOnline && (
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link href={`/creator/${creator.id}`}>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                          <h3 className="font-semibold truncate">
                            {creator.username}
                          </h3>
                          {creator.isVerified && (
                            <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{creator.location.city}, {creator.location.state}</span>
                      </div>
                    </div>
                  </div>

                  {/* Platform Badge */}
                  {crossPlatformEnabled && (
                    <Badge
                      variant="secondary"
                      className={`text-xs capitalize ${PLATFORM_COLORS[creator.homePlatform] || 'bg-gray-500'} text-white`}
                    >
                      {creator.homePlatform.replace('fanz', '')}
                    </Badge>
                  )}
                </div>

                {creator.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                    {creator.bio}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                {creator.tags && creator.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {creator.tags.slice(0, 3).map((tag, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {creator.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{creator.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{creator.followerCount.toLocaleString()} followers</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    <span>
                      {creator.location.isApproximate && '~'}
                      {formatDistance(creator.distance)}
                    </span>
                  </div>
                </div>

                {/* Activity Status */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={creator.isOnline ? 'text-green-500' : 'text-muted-foreground'}>
                    {getLastActiveText(creator.lastActiveAt)}
                  </span>
                  {/* Tier Badge */}
                  {creator.membershipTier && creator.membershipTier !== 'free' && (
                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${TIER_COLORS[creator.membershipTier]?.bg || ''} ${TIER_COLORS[creator.membershipTier]?.text || ''}`}>
                      {TIER_COLORS[creator.membershipTier]?.icon}
                      <span className="capitalize">{creator.membershipTier.replace('_', ' ')}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/creator/${creator.id}`} className="flex-1">
                    <Button size="sm" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleScheduleMeetup(creator)}
                    disabled={!tierFeatures?.canScheduleMeetups}
                    title={tierFeatures?.canScheduleMeetups ? 'Schedule Meetup' : 'Upgrade to Silver+ to schedule meetups'}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!tierFeatures?.canMessageFromMap}
                    title={tierFeatures?.canMessageFromMap ? 'Send Message' : 'Upgrade to Bronze+ to message from map'}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Meetup Dialog */}
      <MeetupDialog
        creator={selectedCreator}
        open={meetupDialogOpen}
        onOpenChange={setMeetupDialogOpen}
        tierFeatures={tierFeatures}
      />
    </div>
  );
}
