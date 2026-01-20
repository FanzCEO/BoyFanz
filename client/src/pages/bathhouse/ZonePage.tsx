import { useState, useEffect } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Droplets, Flame, Users, Lock, Eye, Heart, ArrowLeft,
  Dumbbell, Waves, Wind, DoorOpen, Armchair, Video,
  Sparkles, Crown, Zap, AlertTriangle, MessageCircle,
  Camera, Play, Grid, List, MapPin
} from 'lucide-react';

// Zone configurations
const zoneConfigs: Record<string, {
  name: string;
  icon: React.ReactNode;
  gradient: string;
  color: string;
  description: string;
  ambiance: string;
  features: string[];
}> = {
  'locker-room': {
    name: 'Locker Room',
    icon: <Lock className="h-6 w-6" />,
    gradient: 'from-zinc-600 to-zinc-800',
    color: 'text-zinc-400',
    description: 'The entrance to the bathhouse. Strip down, store your belongings, and get ready for the experience.',
    ambiance: 'Metallic lockers, benches, dim overhead lights, the sound of doors opening and closing.',
    features: ['Lockers', 'Benches', 'Towel Station', 'Full Length Mirrors']
  },
  'showers': {
    name: 'Showers',
    icon: <Droplets className="h-6 w-6" />,
    gradient: 'from-cyan-600 to-blue-800',
    color: 'text-cyan-400',
    description: 'Open communal showers with hot water. Get clean, show off, or just enjoy the view.',
    ambiance: 'Steam rising, water cascading, tile floors, shared shower heads along the walls.',
    features: ['Open Showers', 'Private Stalls', 'Soap Dispensers', 'Towel Racks']
  },
  'steam-room': {
    name: 'Steam Room',
    icon: <Wind className="h-6 w-6" />,
    gradient: 'from-gray-500 to-gray-700',
    color: 'text-gray-300',
    description: 'Dense fog obscures everything. Only touch reveals what\'s nearby.',
    ambiance: 'Thick steam, barely visible figures, the hiss of steam vents, warm condensation on every surface.',
    features: ['Steam Vents', 'Tile Benches', 'Limited Visibility', 'High Humidity']
  },
  'sauna': {
    name: 'Sauna',
    icon: <Flame className="h-6 w-6" />,
    gradient: 'from-orange-600 to-red-800',
    color: 'text-orange-400',
    description: 'Dry heat radiates from hot stones. Wooden benches at multiple levels. Sweat drips.',
    ambiance: 'Cedar wood walls, hot stones, dry crackling heat, tiered wooden benches.',
    features: ['Hot Stones', 'Tiered Seating', 'Wood Paneling', 'Water Bucket']
  },
  'pool': {
    name: 'Pool & Hot Tub',
    icon: <Waves className="h-6 w-6" />,
    gradient: 'from-blue-600 to-indigo-800',
    color: 'text-blue-400',
    description: 'Cool pool for swimming, hot tub for relaxing. Underwater lights create a cyan glow.',
    ambiance: 'Underwater lights, bubbling hot tub, pool deck loungers, the echo of water.',
    features: ['Swimming Pool', 'Hot Tub', 'Pool Deck', 'Underwater Lights']
  },
  'gym': {
    name: 'Gym',
    icon: <Dumbbell className="h-6 w-6" />,
    gradient: 'from-green-600 to-emerald-800',
    color: 'text-green-400',
    description: 'Work out, show off, spot each other. Mirrors everywhere. Minimal clothing required.',
    ambiance: 'Clanking weights, mirrors on every wall, rubber floor mats, the smell of effort.',
    features: ['Free Weights', 'Machines', 'Mirrors', 'Towel Service']
  },
  'private-rooms': {
    name: 'Private Rooms',
    icon: <DoorOpen className="h-6 w-6" />,
    gradient: 'from-red-600 to-red-900',
    color: 'text-red-400',
    description: 'Numbered doors line a dim corridor. Red lights indicate occupied rooms. What happens inside...',
    ambiance: 'Dim corridor, numbered doors, red "occupied" lights, the creak of doors.',
    features: ['Private Beds', 'Lockable Doors', 'Dim Lighting', 'Towels Provided']
  },
  'sling-room': {
    name: 'Sling Room',
    icon: <Armchair className="h-6 w-6" />,
    gradient: 'from-purple-600 to-purple-900',
    color: 'text-purple-400',
    description: 'For the adventurous. Leather, chains, and specialized equipment. Not for beginners.',
    ambiance: 'Dark leather, metal chains, specialized furniture, industrial aesthetic.',
    features: ['Slings', 'Chains', 'Play Equipment', 'Spectator Areas']
  },
  'fuck-bench': {
    name: 'Fuck Bench',
    icon: <Zap className="h-6 w-6" />,
    gradient: 'from-pink-600 to-rose-900',
    color: 'text-pink-400',
    description: 'The main attraction. Padded benches in various configurations. Get comfortable.',
    ambiance: 'Padded surfaces, dim red lighting, the sounds of pleasure, strategically placed mirrors.',
    features: ['Padded Benches', 'Various Positions', 'Mirrors', 'Towel Service']
  },
  'voyeur': {
    name: 'Voyeur Zone',
    icon: <Eye className="h-6 w-6" />,
    gradient: 'from-amber-600 to-orange-900',
    color: 'text-amber-400',
    description: 'Watch or be watched. One-way glass, peek holes, and glory holes. Exhibitionists welcome.',
    ambiance: 'One-way mirrors, viewing booths, strategically placed openings, anonymous encounters.',
    features: ['Viewing Booths', 'Glory Holes', 'One-Way Glass', 'Anonymous Encounters']
  },
  'dark-room': {
    name: 'Dark Room',
    icon: <AlertTriangle className="h-6 w-6" />,
    gradient: 'from-slate-700 to-black',
    color: 'text-slate-400',
    description: 'Complete darkness. No names, no faces, just touch. Enter at your own risk.',
    ambiance: 'Total darkness, anonymous hands, the rustle of movement, heightened senses.',
    features: ['No Lighting', 'Anonymous', 'Touch Only', 'Multiple Levels']
  },
  'vip': {
    name: 'VIP Lounge',
    icon: <Crown className="h-6 w-6" />,
    gradient: 'from-yellow-500 to-amber-700',
    color: 'text-yellow-400',
    description: 'Premium members only. Luxury amenities, exclusive company, the best of everything.',
    ambiance: 'Plush seating, premium drinks, exclusive clientele, luxury everywhere.',
    features: ['Premium Bar', 'Private Rooms', 'Exclusive Events', 'Concierge Service']
  }
};

// Mock users in zone
const mockZoneUsers = [
  { id: '1', name: 'HotDaddy69', avatar: '/boyfanz-logo.png', isLive: true, isVerified: true },
  { id: '2', name: 'MuscleBear', avatar: '/boyfanz-logo.png', isLive: false, isVerified: true },
  { id: '3', name: 'TwinkStar', avatar: '/boyfanz-logo.png', isLive: true, isVerified: false },
  { id: '4', name: 'DominantTop', avatar: '/boyfanz-logo.png', isLive: false, isVerified: true },
  { id: '5', name: 'SubmissiveBottom', avatar: '/boyfanz-logo.png', isLive: true, isVerified: false },
  { id: '6', name: 'VersatileGuy', avatar: '/boyfanz-logo.png', isLive: false, isVerified: true },
];

// Mock content posts
const mockZonePosts = [
  { id: '1', type: 'photo', thumbnail: '/underground-bg.jpg', likes: 234, comments: 45, isLocked: false },
  { id: '2', type: 'video', thumbnail: '/underground-bg.jpg', likes: 567, comments: 89, isLocked: true },
  { id: '3', type: 'photo', thumbnail: '/underground-bg.jpg', likes: 123, comments: 23, isLocked: false },
  { id: '4', type: 'video', thumbnail: '/underground-bg.jpg', likes: 890, comments: 134, isLocked: true },
  { id: '5', type: 'photo', thumbnail: '/underground-bg.jpg', likes: 345, comments: 56, isLocked: false },
  { id: '6', type: 'photo', thumbnail: '/underground-bg.jpg', likes: 456, comments: 78, isLocked: true },
];

// Steam particles component
function SteamEffect({ intensity = 'medium' }: { intensity?: 'low' | 'medium' | 'high' }) {
  const particleCount = intensity === 'high' ? 30 : intensity === 'medium' ? 20 : 10;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(particleCount)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: `${Math.random() * 80 + 40}px`,
            height: `${Math.random() * 80 + 40}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `steam-float ${6 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 4}s`,
            filter: 'blur(15px)'
          }}
        />
      ))}
    </div>
  );
}

interface ZonePageProps {
  zoneName: string;
}

export default function ZonePage({ zoneName }: ZonePageProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('activity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const config = zoneConfigs[zoneName] || zoneConfigs['locker-room'];
  const steamIntensity = ['steam-room', 'sauna', 'showers'].includes(zoneName) ? 'high' :
                         ['pool', 'private-rooms'].includes(zoneName) ? 'medium' : 'low';

  const onlineCount = Math.floor(Math.random() * 50) + 10;
  const liveCount = Math.floor(Math.random() * 10) + 2;

  return (
    <div className="relative min-h-screen">
      {/* Ambient steam effect */}
      <SteamEffect intensity={steamIntensity} />

      {/* Zone-specific gradient overlay */}
      <div className={cn(
        "fixed inset-0 pointer-events-none opacity-20",
        `bg-gradient-to-br ${config.gradient}`
      )} />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Back to Bathhouse */}
        <Link href="/bathhouse">
          <Button variant="ghost" className="text-gray-400 hover:text-white gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Bathhouse
          </Button>
        </Link>

        {/* Zone Header */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className={cn(
            "absolute inset-0 bg-gradient-to-br",
            config.gradient
          )} />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative p-8">
            <div className="flex items-start gap-6">
              {/* Zone Icon */}
              <div className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center",
                "bg-black/40 backdrop-blur-sm border border-white/10",
                config.color
              )}>
                {config.icon}
              </div>

              {/* Zone Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-white">{config.name}</h1>
                  <Badge className="bg-red-600/80 border-0">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                    {liveCount} LIVE
                  </Badge>
                </div>
                <p className="text-gray-300 mb-4 max-w-2xl">{config.description}</p>

                {/* Stats */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-cyan-400" />
                    <span className="text-white font-semibold">{onlineCount}</span>
                    <span className="text-gray-400">online now</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Video className="h-4 w-4 text-red-400" />
                    <span className="text-white font-semibold">{liveCount}</span>
                    <span className="text-gray-400">streaming</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Camera className="h-4 w-4 text-purple-400" />
                    <span className="text-white font-semibold">{mockZonePosts.length}</span>
                    <span className="text-gray-400">posts today</span>
                  </div>
                </div>
              </div>

              {/* Enter Zone Button */}
              <Button className={cn(
                "bg-gradient-to-r text-white font-semibold px-6",
                config.gradient
              )}>
                <Play className="h-4 w-4 mr-2" />
                Enter Zone
              </Button>
            </div>

            {/* Features */}
            <div className="mt-6 flex flex-wrap gap-2">
              {config.features.map((feature) => (
                <Badge key={feature} variant="outline" className="bg-black/30 border-white/20 text-gray-300">
                  {feature}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Ambiance Description */}
        <Card className="bg-black/40 backdrop-blur-xl border-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-medium">Ambiance: </span>
                  {config.ambiance}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-black/40 border border-red-900/30">
              <TabsTrigger value="activity" className="data-[state=active]:bg-red-600">
                <Flame className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="live" className="data-[state=active]:bg-red-600">
                <Video className="h-4 w-4 mr-2" />
                Live Now
              </TabsTrigger>
              <TabsTrigger value="members" className="data-[state=active]:bg-red-600">
                <Users className="h-4 w-4 mr-2" />
                Who's Here
              </TabsTrigger>
              <TabsTrigger value="posts" className="data-[state=active]:bg-red-600">
                <Camera className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('grid')}
                className={viewMode === 'grid' ? 'text-red-400' : 'text-gray-400'}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'text-red-400' : 'text-gray-400'}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="ring-2 ring-red-500/30">
                        <AvatarImage src="/boyfanz-logo.png" />
                        <AvatarFallback className="bg-red-950 text-red-500">U</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-white">Anonymous{i + 1}</span>
                          <span className="text-xs text-gray-500">
                            {Math.floor(Math.random() * 30) + 1}m ago
                          </span>
                        </div>
                        <p className="text-sm text-gray-400">
                          {['Just entered the zone...', 'Looking for company...', 'Who wants to play?',
                            'Ready for action...', 'Anyone else here?', 'Let\'s have some fun...'][i]}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Live Tab */}
          <TabsContent value="live" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockZoneUsers.filter(u => u.isLive).map((user) => (
                <Card key={user.id} className="bg-black/40 backdrop-blur-xl border-red-900/30 overflow-hidden group cursor-pointer hover:border-red-500/50 transition-all">
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src="/underground-bg.jpg"
                      alt=""
                      className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="h-8 w-8 text-white ml-1" />
                      </div>
                    </div>
                    <Badge className="absolute top-2 left-2 bg-red-600 border-0">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse mr-1" />
                      LIVE
                    </Badge>
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white bg-black/60 px-2 py-1 rounded">
                      <Eye className="h-3 w-3" />
                      {Math.floor(Math.random() * 200) + 50}
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 ring-2 ring-red-500/30">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-red-950 text-red-500">{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-white text-sm">{user.name}</span>
                          {user.isVerified && <Sparkles className="h-3 w-3 text-cyan-400" />}
                        </div>
                        <p className="text-xs text-gray-500">Live in {config.name}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className={cn(
              viewMode === 'grid'
                ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
                : "space-y-2"
            )}>
              {mockZoneUsers.map((member) => (
                viewMode === 'grid' ? (
                  <Link key={member.id} href={`/creator/${member.id}`}>
                    <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all cursor-pointer">
                      <CardContent className="p-4 text-center">
                        <Avatar className="h-16 w-16 mx-auto mb-2 ring-2 ring-red-500/30">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-red-950 text-red-500">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center justify-center gap-1 mb-1">
                          <span className="font-semibold text-white text-sm">{member.name}</span>
                          {member.isVerified && <Sparkles className="h-3 w-3 text-cyan-400" />}
                        </div>
                        {member.isLive && (
                          <Badge className="bg-red-600/80 border-0 text-xs">
                            LIVE
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ) : (
                  <Link key={member.id} href={`/creator/${member.id}`}>
                    <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 hover:border-red-500/50 transition-all cursor-pointer">
                      <CardContent className="p-3 flex items-center gap-3">
                        <Avatar className="ring-2 ring-red-500/30">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-red-950 text-red-500">{member.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-white">{member.name}</span>
                            {member.isVerified && <Sparkles className="h-3 w-3 text-cyan-400" />}
                          </div>
                          <p className="text-xs text-gray-500">Online in {config.name}</p>
                        </div>
                        {member.isLive && (
                          <Badge className="bg-red-600/80 border-0">LIVE</Badge>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                )
              ))}
            </div>
          </TabsContent>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mockZonePosts.map((post) => (
                <div key={post.id} className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden group cursor-pointer">
                  <img
                    src={post.thumbnail}
                    alt=""
                    className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                  {post.isLocked && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <Lock className="h-8 w-8 text-red-400" />
                    </div>
                  )}
                  {post.type === 'video' && !post.isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-red-600/80 flex items-center justify-center">
                        <Play className="h-6 w-6 text-white ml-1" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3 text-white text-sm">
                      <span className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Safety Notice */}
        <Card className="bg-red-950/30 border-red-900/30">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-red-400 font-semibold">Zone Rules:</span> Be respectful. Consent is mandatory.
              No means no. Report any violations to staff immediately.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes steam-float {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-40px) translateX(15px) scale(1.3);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
}
