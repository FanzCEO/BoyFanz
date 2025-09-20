import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Link } from 'wouter';
import { useState } from 'react';
import { 
  MapPin,
  Users,
  Star,
  Heart,
  MessageCircle,
  Navigation,
  Filter,
  Search
} from 'lucide-react';

interface NearbyCreator {
  id: string;
  username: string;
  profileImageUrl?: string;
  isVerified: boolean;
  bio?: string;
  followerCount: number;
  distance: number; // in miles
  location: {
    city: string;
    state: string;
  };
  lastActiveAt: string;
  isOnline: boolean;
  tags: string[];
}

export default function Nearby() {
  const { user } = useAuth();
  const [searchRadius, setSearchRadius] = useState(25);
  const [locationFilter, setLocationFilter] = useState('');

  const { data: nearbyCreators = [], isLoading } = useQuery<NearbyCreator[]>({
    queryKey: ['/api/creators/nearby', searchRadius],
  });

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
    creator.location.city.toLowerCase().includes(locationFilter.toLowerCase()) ||
    creator.location.state.toLowerCase().includes(locationFilter.toLowerCase())
  );

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
      <div className="flex items-center gap-3 mb-8">
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

      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Search Radius</label>
            <select 
              value={searchRadius} 
              onChange={(e) => setSearchRadius(Number(e.target.value))}
              className="w-full p-2 border rounded-md bg-background"
              data-testid="radius-select"
            >
              <option value={5}>5 miles</option>
              <option value={10}>10 miles</option>
              <option value={25}>25 miles</option>
              <option value={50}>50 miles</option>
              <option value={100}>100 miles</option>
            </select>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Location Filter</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City or state..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10"
                data-testid="location-filter"
              />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Results</label>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm" data-testid="results-count">
                {filteredCreators.length} creators found
              </span>
            </div>
          </div>
        </Card>
      </div>

      {filteredCreators.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <div className="space-y-4">
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold mb-2">No creators found nearby</h3>
                <p className="text-muted-foreground mb-6">
                  Try expanding your search radius or check back later for new creators in your area.
                </p>
                <Button 
                  onClick={() => setSearchRadius(searchRadius * 2)}
                  data-testid="expand-search-button"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Expand Search to {searchRadius * 2} miles
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <Card key={creator.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 group" data-testid={`creator-${creator.id}`}>
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
                        <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/creator/${creator.id}`}>
                        <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
                          <h3 className="font-semibold truncate" data-testid={`creator-name-${creator.id}`}>
                            {creator.username}
                          </h3>
                          {creator.isVerified && (
                            <Badge variant="secondary" className="text-xs px-1 py-0">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </Link>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{creator.location.city}, {creator.location.state}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {creator.bio && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-2" data-testid={`creator-bio-${creator.id}`}>
                    {creator.bio}
                  </p>
                )}
              </CardHeader>

              <CardContent className="pt-0">
                {/* Tags */}
                {creator.tags.length > 0 && (
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
                    <span data-testid={`creator-distance-${creator.id}`}>
                      {formatDistance(creator.distance)}
                    </span>
                  </div>
                </div>

                {/* Activity Status */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <span className={creator.isOnline ? 'text-green-500' : 'text-muted-foreground'}>
                    {getLastActiveText(creator.lastActiveAt)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Link href={`/creator/${creator.id}`}>
                    <Button size="sm" className="flex-1" data-testid={`view-profile-${creator.id}`}>
                      View Profile
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" data-testid={`message-${creator.id}`}>
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`follow-${creator.id}`}>
                    <Heart className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}