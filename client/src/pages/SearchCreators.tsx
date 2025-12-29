import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Search,
  Users,
  Star,
  Filter,
  Shield,
  Heart,
  TrendingUp,
  Skull,
  Flame,
  Zap,
  Crown,
  Eye,
  Target,
  Crosshair
} from 'lucide-react';
import { Link } from 'wouter';

interface Creator {
  userId: string;
  monthlyPriceCents: number;
  isVerified: boolean;
  verificationBadge: string;
  categories: string[];
  totalSubscribers: number;
  isOnline: boolean;
  user?: {
    username: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

const CreatorCard = ({ creator }: { creator: Creator }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const isFeatured = creator.verificationBadge === 'featured';
  const isVerified = creator.isVerified;

  return (
    <Card className={`overflow-hidden transition-all duration-300 group border-2 ${
      isFeatured
        ? 'bg-gradient-to-br from-yellow-950/40 via-black to-orange-950/40 border-yellow-500/30 hover:border-yellow-400/50 hover:shadow-xl hover:shadow-yellow-500/20'
        : isVerified
          ? 'bg-gradient-to-br from-red-950/30 via-black to-orange-950/30 border-red-500/20 hover:border-red-400/40 hover:shadow-xl hover:shadow-red-500/20'
          : 'bg-gradient-to-br from-gray-950/50 via-black to-gray-900/50 border-gray-700/30 hover:border-gray-500/40 hover:shadow-lg'
    }`} data-testid={`creator-card-${creator.userId}`}>
      <div className="relative">
        <div className={`aspect-square p-6 flex items-center justify-center relative ${
          isFeatured
            ? 'bg-gradient-to-br from-yellow-600/10 via-transparent to-orange-600/10'
            : 'bg-gradient-to-br from-red-600/10 via-transparent to-orange-600/10'
        }`}>
          {/* Background flame effect for featured */}
          {isFeatured && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <Flame className="h-32 w-32 text-yellow-500" />
            </div>
          )}

          <Avatar className={`h-28 w-28 ring-4 transition-all duration-300 ${
            isFeatured
              ? 'ring-yellow-500/40 group-hover:ring-yellow-400/60'
              : isVerified
                ? 'ring-red-500/30 group-hover:ring-red-400/50'
                : 'ring-gray-600/30 group-hover:ring-gray-500/50'
          }`}>
            <AvatarImage src={creator.user?.profileImageUrl} />
            <AvatarFallback className={`text-3xl font-black ${
              isFeatured
                ? 'bg-gradient-to-br from-yellow-600 to-orange-600 text-white'
                : 'bg-gradient-to-br from-red-600 to-orange-600 text-white'
            }`}>
              {creator.user?.username?.[0]?.toUpperCase() || 'C'}
            </AvatarFallback>
          </Avatar>
        </div>

        {creator.isOnline && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-600/90 text-white border-green-400/50 text-xs font-bold animate-pulse">
              <div className="h-2 w-2 bg-white rounded-full mr-1.5" />
              LIVE
            </Badge>
          </div>
        )}

        {creator.verificationBadge !== 'none' && (
          <div className="absolute top-3 left-3">
            <Badge className={`text-xs font-bold ${
              isFeatured
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-yellow-400/50'
                : 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-400/50'
            }`}>
              {isFeatured ? <Crown className="h-3 w-3 mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
              {isFeatured ? 'FEATURED' : 'VERIFIED'}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-3">
        <div className="text-center">
          <CardTitle className={`flex items-center justify-center gap-2 text-lg font-black uppercase tracking-wide ${
            isFeatured
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400'
              : 'text-white'
          }`} data-testid={`creator-name-${creator.userId}`}>
            {creator.user?.username || 'Creator'}
            {creator.isVerified && (
              <Shield className={`h-4 w-4 ${isFeatured ? 'text-yellow-400' : 'text-red-400'}`} />
            )}
          </CardTitle>

          {creator.user?.firstName && creator.user?.lastName && (
            <CardDescription className="mt-1 text-gray-400">
              {creator.user.firstName} {creator.user.lastName}
            </CardDescription>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 mt-3">
          {creator.categories.slice(0, 2).map((category, idx) => (
            <Badge key={idx} variant="outline" className="text-xs bg-red-950/30 text-red-300 border-red-500/30 uppercase tracking-wider">
              {category}
            </Badge>
          ))}
          {creator.categories.length > 2 && (
            <Badge variant="outline" className="text-xs bg-gray-800/50 text-gray-400 border-gray-600/30">
              +{creator.categories.length - 2}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users className="h-4 w-4 text-red-400" />
            <span className="font-semibold" data-testid={`subscriber-count-${creator.userId}`}>
              {creator.totalSubscribers.toLocaleString()}
            </span>
            <span className="text-xs">subs</span>
          </div>
          <div className={`font-black text-lg ${
            isFeatured
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400'
              : 'text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400'
          }`} data-testid={`monthly-price-${creator.userId}`}>
            {formatCurrency(creator.monthlyPriceCents)}/mo
          </div>
        </div>

        <div className="space-y-2">
          <Link href={`/creator/${creator.userId}`}>
            <Button className={`w-full font-bold uppercase tracking-wide ${
              isFeatured
                ? 'bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white shadow-lg shadow-yellow-500/25'
                : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/25'
            }`} data-testid={`view-profile-${creator.userId}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="w-full border-red-500/30 text-red-300 hover:bg-red-500/10 hover:text-red-200 hover:border-red-400/50" data-testid={`follow-${creator.userId}`}>
            <Heart className="h-4 w-4 mr-2" />
            Follow
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function SearchCreators() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators', { search: searchQuery, category: selectedCategory }],
  });

  const categories = [
    { id: '', label: 'All', icon: Target },
    { id: 'muscle', label: 'Muscle', icon: Flame },
    { id: 'twink', label: 'Twink', icon: Zap },
    { id: 'bear', label: 'Bear', icon: Skull },
    { id: 'daddy', label: 'Daddy', icon: Crown },
    { id: 'jock', label: 'Jock', icon: Star },
    { id: 'leather', label: 'Leather', icon: Shield },
    { id: 'solo', label: 'Solo', icon: Eye },
  ];

  const featuredCreators = creators.filter(c => c.verificationBadge === 'featured');
  const verifiedCreators = creators.filter(c => c.isVerified && c.verificationBadge !== 'featured');
  const regularCreators = creators.filter(c => !c.isVerified && c.verificationBadge === 'none');

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton with underground style */}
          <div className="mb-8 animate-pulse">
            <div className="h-10 bg-gradient-to-r from-red-950/50 to-orange-950/50 rounded-xl w-64 mb-4" />
            <div className="h-6 bg-gray-800/50 rounded w-96" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse bg-gradient-to-br from-gray-900 to-black border-gray-800/50">
                <div className="aspect-square bg-gradient-to-br from-red-950/20 to-orange-950/20" />
                <CardHeader>
                  <div className="h-5 w-32 bg-gray-800 rounded mx-auto mb-2" />
                  <div className="h-4 w-24 bg-gray-800/50 rounded mx-auto" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-10 bg-gradient-to-r from-red-900/30 to-orange-900/30 rounded-lg" />
                    <div className="h-8 bg-gray-800/30 rounded-lg" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="search-creators">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-orange-950/80 border border-red-500/20 p-8 mb-8">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
          <div className="absolute top-0 right-0 opacity-10">
            <Crosshair className="h-48 w-48 text-red-500" />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg shadow-red-500/30">
              <Target className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500 mb-1">
                Hunt for Creators
              </h1>
              <p className="text-gray-400 text-lg">
                Find the hottest underground talent across all categories
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
              <Search className="h-5 w-5 text-white" />
            </div>
            <Input
              type="search"
              placeholder="Search creators by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-16 h-14 text-lg bg-gradient-to-r from-gray-900 to-black border-2 border-red-500/20 focus:border-red-500/50 rounded-xl placeholder:text-gray-500"
              data-testid="search-input"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive = selectedCategory === category.id;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  size="lg"
                  onClick={() => setSelectedCategory(category.id)}
                  className={`font-bold uppercase tracking-wide transition-all duration-300 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white border-red-400/50 shadow-lg shadow-red-500/25'
                      : 'bg-gray-900/50 border-gray-700/50 text-gray-400 hover:bg-red-950/30 hover:border-red-500/30 hover:text-red-300'
                  }`}
                  data-testid={`category-${category.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {category.label}
                </Button>
              );
            })}
          </div>
        </div>

        {creators.length === 0 ? (
          <Card className="text-center py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-gray-800/50">
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-gradient-to-br from-red-950/30 to-orange-950/30 rounded-full w-fit mx-auto">
                  <Skull className="h-16 w-16 text-red-400/50" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-wide text-white mb-2">
                    No Targets Found
                  </h3>
                  <p className="text-gray-400 text-lg">
                    Try adjusting your search or browse all categories
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {/* Featured Creators */}
            {featuredCreators.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg shadow-lg shadow-yellow-500/30">
                    <Crown className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Elite Creators
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {featuredCreators.map((creator) => (
                    <CreatorCard key={creator.userId} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* Trending Creators */}
            {verifiedCreators.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg shadow-red-500/30">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    Rising Heat
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-red-500/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {verifiedCreators.map((creator) => (
                    <CreatorCard key={creator.userId} creator={creator} />
                  ))}
                </div>
              </div>
            )}

            {/* All Creators */}
            {regularCreators.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-wide text-gray-300">
                    Underground Talent
                  </h2>
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-600/50 to-transparent" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {regularCreators.map((creator) => (
                    <CreatorCard key={creator.userId} creator={creator} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
