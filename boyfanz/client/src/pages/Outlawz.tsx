// @ts-nocheck
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import {
  Skull,
  Flame,
  Ban,
  AlertTriangle,
  Shield,
  Users,
  Heart,
  MessageCircle,
  Star,
  Zap,
  Crown,
  Target,
  Search,
  Filter,
  TrendingUp,
  Eye,
  Lock,
  Unlock,
  UserX,
  Swords,
  Bomb,
  Ghost
} from 'lucide-react';

interface OutlawCreator {
  id: string;
  username: string;
  displayName?: string;
  profileImageUrl?: string;
  bio?: string;
  isVerified: boolean;
  followerCount: number;
  subscriberCount: number;
  bannedFrom: string[];
  banReason?: string;
  joinedAt: string;
  isOnline: boolean;
  contentCount: number;
  outlawRank: 'rookie' | 'outlaw' | 'desperado' | 'legend' | 'godfather';
  tags: string[];
}

const outlawRankInfo = {
  rookie: { label: 'Rookie Outlaw', icon: Ghost, color: 'text-muted-foreground', bg: 'bg-card' },
  outlaw: { label: 'Certified Outlaw', icon: Skull, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  desperado: { label: 'Desperado', icon: Swords, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  legend: { label: 'Legendary Outlaw', icon: Flame, color: 'text-red-400', bg: 'bg-red-500/10' },
  godfather: { label: 'Godfather', icon: Crown, color: 'text-purple-400', bg: 'bg-purple-500/10' },
};

const bannedPlatforms = [
  { id: 'onlyfans', name: 'OnlyFans', icon: '🔞' },
  { id: 'pornhub', name: 'Pornhub', icon: '🎬' },
  { id: 'xvideos', name: 'XVideos', icon: '📹' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦' },
  { id: 'instagram', name: 'Instagram', icon: '📸' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵' },
  { id: 'youtube', name: 'YouTube', icon: '▶️' },
  { id: 'patreon', name: 'Patreon', icon: '🎨' },
  { id: 'fansly', name: 'Fansly', icon: '💎' },
  { id: 'clips4sale', name: 'Clips4Sale', icon: '🎞️' },
];

export default function Outlawz() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('featured');

  // Fetch outlawz creators
  const { data: outlawzResponse, isLoading } = useQuery<{
    creators: OutlawCreator[];
    total: number;
  }>({
    queryKey: ['/api/outlawz', { search: searchQuery, platform: selectedPlatform }],
  });

  const outlawz = outlawzResponse?.creators || [];

  // Production mode - no mock data, show real creators only
  const displayOutlawz = outlawz;

  const getRankBadge = (rank: OutlawCreator['outlawRank']) => {
    const info = outlawRankInfo[rank];
    const Icon = info.icon;
    return (
      <Badge className={`${info.bg} ${info.color} border-0 gap-1`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background" data-testid="outlawz-page">
      {/* Epic Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/40 via-black to-orange-900/30" />
        <div className="absolute inset-0 bg-[url('/flames-pattern.png')] opacity-10" />

        {/* Animated fire effect */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-orange-500/20 to-transparent" />

        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <Skull className="h-16 w-16 text-red-500 animate-pulse" />
            <div>
              <h1 className="text-6xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent tracking-tight">
                OUTLAWZ
              </h1>
              <p className="text-2xl font-bold text-orange-400 tracking-widest">
                TOO HOT FOR THE MAINSTREAM
              </p>
            </div>
            <Flame className="h-16 w-16 text-orange-500 animate-pulse" />
          </div>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            These creators were banned, censored, and silenced by mainstream platforms.
            <br />
            <span className="text-red-400 font-semibold">Here, they reign supreme.</span>
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-4xl font-black text-red-400">{displayOutlawz.length}+</div>
              <div className="text-sm text-muted-foreground">Outlawz</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-orange-400">
                {displayOutlawz.reduce((acc, c) => acc + c.contentCount, 0).toLocaleString()}+
              </div>
              <div className="text-sm text-muted-foreground">Uncensored Posts</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-yellow-400">
                {bannedPlatforms.length}
              </div>
              <div className="text-sm text-muted-foreground">Platforms Escaped</div>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search outlawz by name or tag..."
                className="pl-12 h-14 text-lg bg-black/50 border-red-500/30 focus:border-red-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Platform Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Ban className="h-5 w-5 text-red-500" />
            Filter by Platform They Escaped
          </h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedPlatform === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPlatform('all')}
              className={selectedPlatform === 'all' ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              All Platforms
            </Button>
            {bannedPlatforms.map((platform) => (
              <Button
                key={platform.id}
                variant={selectedPlatform === platform.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPlatform(platform.id)}
                className={selectedPlatform === platform.id ? 'bg-red-500 hover:bg-red-600' : ''}
              >
                {platform.icon} {platform.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="bg-black/50 border border-red-500/20">
            <TabsTrigger value="featured" className="data-[state=active]:bg-red-500">
              <Flame className="h-4 w-4 mr-2" />
              Featured
            </TabsTrigger>
            <TabsTrigger value="trending" className="data-[state=active]:bg-red-500">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="new" className="data-[state=active]:bg-red-500">
              <Zap className="h-4 w-4 mr-2" />
              New Arrivals
            </TabsTrigger>
            <TabsTrigger value="legends" className="data-[state=active]:bg-red-500">
              <Crown className="h-4 w-4 mr-2" />
              Legends
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Outlawz Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse bg-black/50 border-red-500/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 bg-red-500/20 rounded-full" />
                    <div className="flex-1">
                      <div className="h-5 bg-red-500/20 rounded w-2/3 mb-2" />
                      <div className="h-4 bg-red-500/10 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-16 bg-red-500/10 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayOutlawz.map((creator) => (
              <Link href={`/creator/${creator.id}`} key={creator.id}>
                <Card className="group overflow-hidden bg-gradient-to-br from-black via-red-950/20 to-black border-red-500/30 hover:border-red-500 transition-all duration-300 cursor-pointer hover:shadow-lg hover:shadow-red-500/20">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <Avatar className="h-16 w-16 ring-2 ring-red-500/50 group-hover:ring-red-500">
                          <AvatarImage src={creator.profileImageUrl} />
                          <AvatarFallback className="bg-red-500/20 text-red-400 text-xl font-bold">
                            {creator.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {creator.isOnline && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 border-2 border-black rounded-full flex items-center justify-center">
                            <Flame className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg truncate group-hover:text-red-400 transition-colors">
                            {creator.displayName || creator.username}
                          </h3>
                          {creator.isVerified && (
                            <Shield className="h-4 w-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">@{creator.username}</p>
                        {getRankBadge(creator.outlawRank)}
                      </div>
                    </div>

                    {/* Bio */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {creator.bio}
                    </p>

                    {/* Banned From */}
                    <div className="mb-4">
                      <div className="text-xs text-red-400 font-semibold mb-2 flex items-center gap-1">
                        <Ban className="h-3 w-3" />
                        BANNED FROM:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {creator.bannedFrom.map((platformId) => {
                          const platform = bannedPlatforms.find(p => p.id === platformId);
                          return platform ? (
                            <Badge key={platformId} variant="outline" className="text-xs border-red-500/30 text-red-300">
                              {platform.icon} {platform.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {creator.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} className="bg-orange-500/20 text-orange-300 border-0 text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-red-500/20 pt-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-red-400" />
                        <span>{creator.followerCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-red-400" />
                        <span>{creator.subscriberCount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4 text-red-400" />
                        <span>{creator.contentCount}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold">
                      <Unlock className="h-4 w-4 mr-2" />
                      Unlock Their Content
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Join the Outlawz CTA */}
        <Card className="mt-12 bg-gradient-to-r from-red-900/50 via-black to-orange-900/50 border-red-500/30">
          <CardContent className="p-8 text-center">
            <Skull className="h-16 w-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-3xl font-black mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              BEEN BANNED? JOIN THE OUTLAWZ
            </h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Were you kicked off another platform? Had your content removed?
              Your account suspended? Here, you're not just welcome - you're celebrated.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/become-creator">
                <Button size="lg" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold">
                  <Flame className="h-5 w-5 mr-2" />
                  Join the Outlawz
                </Button>
              </Link>
              <Link href="/help/outlawz">
                <Button size="lg" variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10">
                  Learn More
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
