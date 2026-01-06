import { useState } from 'react';
import { Link } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Droplets, Flame, Users, Lock, Eye, Heart,
  Dumbbell, Waves, Wind, DoorOpen, Armchair,
  Sparkles, Crown, Zap, AlertTriangle
} from 'lucide-react';
import { BathhousePipes } from '@/components/bathhouse/BathhousePipes';

interface BathhouseZone {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  gradient: string;
  occupancy: number;
  maxOccupancy: number;
  isHot: boolean;
  isNew: boolean;
  isPrivate: boolean;
  liveCount: number;
}

const bathhouseZones: BathhouseZone[] = [
  {
    id: 'locker-room',
    name: 'Locker Room',
    description: 'Get undressed and ready. Store your belongings. The start of your journey.',
    icon: <Lock className="h-8 w-8" />,
    path: '/bathhouse/locker-room',
    color: 'text-zinc-400',
    gradient: 'from-zinc-600 to-zinc-800',
    occupancy: 47,
    maxOccupancy: 100,
    isHot: false,
    isNew: false,
    isPrivate: false,
    liveCount: 12
  },
  {
    id: 'showers',
    name: 'Showers',
    description: 'Get clean... or dirty. Open showers with plenty of eye candy.',
    icon: <Droplets className="h-8 w-8" />,
    path: '/bathhouse/showers',
    color: 'text-cyan-400',
    gradient: 'from-cyan-600 to-blue-800',
    occupancy: 34,
    maxOccupancy: 50,
    isHot: true,
    isNew: false,
    isPrivate: false,
    liveCount: 8
  },
  {
    id: 'steam-room',
    name: 'Steam Room',
    description: 'Where the fog hides everything... and reveals everything.',
    icon: <Wind className="h-8 w-8" />,
    path: '/bathhouse/steam-room',
    color: 'text-gray-300',
    gradient: 'from-gray-500 to-gray-700',
    occupancy: 28,
    maxOccupancy: 40,
    isHot: true,
    isNew: false,
    isPrivate: false,
    liveCount: 6
  },
  {
    id: 'sauna',
    name: 'Sauna',
    description: 'Get hot and sweaty. Wooden benches, dim lighting, pure heat.',
    icon: <Flame className="h-8 w-8" />,
    path: '/bathhouse/sauna',
    color: 'text-orange-400',
    gradient: 'from-orange-600 to-red-800',
    occupancy: 22,
    maxOccupancy: 30,
    isHot: true,
    isNew: false,
    isPrivate: false,
    liveCount: 5
  },
  {
    id: 'pool',
    name: 'Pool & Hot Tub',
    description: 'Cool off or heat up. Underwater adventures await.',
    icon: <Waves className="h-8 w-8" />,
    path: '/bathhouse/pool',
    color: 'text-blue-400',
    gradient: 'from-blue-600 to-indigo-800',
    occupancy: 41,
    maxOccupancy: 60,
    isHot: false,
    isNew: false,
    isPrivate: false,
    liveCount: 9
  },
  {
    id: 'gym',
    name: 'Gym',
    description: 'Pump iron. Show off. Get pumped in more ways than one.',
    icon: <Dumbbell className="h-8 w-8" />,
    path: '/bathhouse/gym',
    color: 'text-green-400',
    gradient: 'from-green-600 to-emerald-800',
    occupancy: 18,
    maxOccupancy: 40,
    isHot: false,
    isNew: true,
    isPrivate: false,
    liveCount: 4
  },
  {
    id: 'private-rooms',
    name: 'Private Rooms',
    description: 'Numbered doors. Dim red lights. What happens inside stays inside.',
    icon: <DoorOpen className="h-8 w-8" />,
    path: '/bathhouse/private-rooms',
    color: 'text-red-400',
    gradient: 'from-red-600 to-red-900',
    occupancy: 38,
    maxOccupancy: 50,
    isHot: true,
    isNew: false,
    isPrivate: true,
    liveCount: 15
  },
  {
    id: 'sling-room',
    name: 'Sling Room',
    description: 'For the adventurous. Leather, chains, and possibilities.',
    icon: <Armchair className="h-8 w-8" />,
    path: '/bathhouse/sling-room',
    color: 'text-purple-400',
    gradient: 'from-purple-600 to-purple-900',
    occupancy: 16,
    maxOccupancy: 25,
    isHot: true,
    isNew: false,
    isPrivate: true,
    liveCount: 7
  },
  {
    id: 'fuck-bench',
    name: 'Fuck Bench',
    description: 'The main attraction. Get comfortable, get busy.',
    icon: <Zap className="h-8 w-8" />,
    path: '/bathhouse/fuck-bench',
    color: 'text-pink-400',
    gradient: 'from-pink-600 to-rose-900',
    occupancy: 24,
    maxOccupancy: 30,
    isHot: true,
    isNew: false,
    isPrivate: true,
    liveCount: 11
  },
  {
    id: 'voyeur-zone',
    name: 'Voyeur Zone',
    description: 'Watch or be watched. Peek windows and glory holes.',
    icon: <Eye className="h-8 w-8" />,
    path: '/bathhouse/voyeur',
    color: 'text-amber-400',
    gradient: 'from-amber-600 to-orange-900',
    occupancy: 32,
    maxOccupancy: 45,
    isHot: true,
    isNew: true,
    isPrivate: false,
    liveCount: 8
  },
  {
    id: 'dark-room',
    name: 'Dark Room',
    description: 'No lights. No names. Just anonymous encounters.',
    icon: <AlertTriangle className="h-8 w-8" />,
    path: '/bathhouse/dark-room',
    color: 'text-slate-400',
    gradient: 'from-slate-700 to-black',
    occupancy: 19,
    maxOccupancy: 35,
    isHot: true,
    isNew: false,
    isPrivate: true,
    liveCount: 6
  },
  {
    id: 'vip-lounge',
    name: 'VIP Lounge',
    description: 'Premium members only. The elite experience.',
    icon: <Crown className="h-8 w-8" />,
    path: '/bathhouse/vip',
    color: 'text-yellow-400',
    gradient: 'from-yellow-500 to-amber-700',
    occupancy: 12,
    maxOccupancy: 20,
    isHot: false,
    isNew: true,
    isPrivate: true,
    liveCount: 3
  }
];

// Steam particles animation component
function SteamParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/5"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 100 + 50}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animation: `steam-rise ${8 + Math.random() * 4}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 5}s`,
            filter: 'blur(20px)'
          }}
        />
      ))}
    </div>
  );
}

// Zone card component
function ZoneCard({ zone }: { zone: BathhouseZone }) {
  const occupancyPercentage = (zone.occupancy / zone.maxOccupancy) * 100;

  return (
    <Link href={zone.path}>
      <Card className={cn(
        "relative overflow-hidden cursor-pointer transition-all duration-300",
        "bg-black/40 backdrop-blur-xl border-red-900/30",
        "hover:border-red-500/50 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/20",
        "group"
      )}>
        {/* Background gradient */}
        <div className={cn(
          "absolute inset-0 opacity-20 transition-opacity group-hover:opacity-40",
          `bg-gradient-to-br ${zone.gradient}`
        )} />

        {/* Steam effect for hot zones */}
        {zone.isHot && (
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/5 to-transparent animate-pulse" />
          </div>
        )}

        <CardContent className="relative p-6">
          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            {zone.isHot && (
              <Badge className="bg-red-600/80 text-white border-0 animate-pulse">
                <Flame className="h-3 w-3 mr-1" />
                HOT
              </Badge>
            )}
            {zone.isNew && (
              <Badge className="bg-cyan-600/80 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                NEW
              </Badge>
            )}
            {zone.isPrivate && (
              <Badge className="bg-purple-600/80 text-white border-0">
                <Lock className="h-3 w-3 mr-1" />
                18+
              </Badge>
            )}
          </div>

          {/* Icon */}
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center mb-4",
            "bg-gradient-to-br transition-transform group-hover:scale-110",
            zone.gradient
          )}>
            <div className={zone.color}>
              {zone.icon}
            </div>
          </div>

          {/* Name & Description */}
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
            {zone.name}
          </h3>
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {zone.description}
          </p>

          {/* Occupancy bar */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{zone.occupancy} inside</span>
              <span>{zone.maxOccupancy} max</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  occupancyPercentage > 80 ? "bg-red-500" :
                  occupancyPercentage > 50 ? "bg-yellow-500" :
                  "bg-green-500"
                )}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>

          {/* Live count */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {zone.liveCount} LIVE
            </div>
            <span className="text-gray-600">|</span>
            <span className="text-gray-500">{zone.occupancy} online</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function Bathhouse() {
  const { user } = useAuth();
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  const totalOnline = bathhouseZones.reduce((acc, zone) => acc + zone.occupancy, 0);
  const totalLive = bathhouseZones.reduce((acc, zone) => acc + zone.liveCount, 0);

  return (
    <div className="relative min-h-screen">
      {/* Steam background effect */}
      <SteamParticles />

      {/* Bathhouse steam pipes */}
      <BathhousePipes pipeCount={10} steamInterval={6000} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center animate-pulse">
              <Flame className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
            The <span className="text-red-500">Bathhouse</span>
          </h1>
          <p className="text-xl text-gray-400 mb-4">
            Welcome to every man's playground. Pick your zone.
          </p>

          {/* Stats bar */}
          <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-black/60 backdrop-blur-sm border border-red-900/30">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-400" />
              <span className="text-white font-semibold">{totalOnline}</span>
              <span className="text-gray-400">online</span>
            </div>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white font-semibold">{totalLive}</span>
              <span className="text-gray-400">LIVE streams</span>
            </div>
            <div className="w-px h-6 bg-gray-700" />
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400" />
              <span className="text-gray-400">Steam's rising</span>
            </div>
          </div>
        </div>

        {/* Quick Access - Featured Zones */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="h-5 w-5 text-red-400" />
            Hottest Zones Right Now
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bathhouseZones.filter(z => z.isHot).slice(0, 4).map((zone) => (
              <Link key={zone.id} href={zone.path}>
                <div className={cn(
                  "relative h-32 rounded-xl overflow-hidden cursor-pointer",
                  "transition-all duration-300 hover:scale-105",
                  "group"
                )}>
                  <div className={cn(
                    "absolute inset-0 bg-gradient-to-br",
                    zone.gradient
                  )} />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                  <div className="relative h-full flex flex-col items-center justify-center p-4">
                    <div className={zone.color}>{zone.icon}</div>
                    <span className="text-white font-semibold mt-2">{zone.name}</span>
                    <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      {zone.liveCount} LIVE
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* All Zones Grid */}
        <div className="px-4">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <DoorOpen className="h-5 w-5 text-cyan-400" />
            All Zones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {bathhouseZones.map((zone) => (
              <ZoneCard key={zone.id} zone={zone} />
            ))}
          </div>
        </div>

        {/* Floor Plan / Map Section */}
        <div className="px-4 pb-8">
          <Card className="bg-black/40 backdrop-blur-xl border-red-900/30 p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="h-5 w-5 text-amber-400" />
              Bathhouse Floor Plan
            </h2>
            <div className="relative aspect-[2/1] bg-gray-900/50 rounded-xl border border-gray-700/50 overflow-hidden">
              {/* Simple floor plan visualization */}
              <div className="absolute inset-0 p-4 grid grid-cols-4 grid-rows-3 gap-2">
                {/* Row 1 */}
                <Link href="/bathhouse/locker-room" className="col-span-1 row-span-1 bg-zinc-700/50 rounded-lg flex items-center justify-center hover:bg-zinc-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Locker Room</span>
                </Link>
                <Link href="/bathhouse/showers" className="col-span-1 row-span-1 bg-cyan-700/50 rounded-lg flex items-center justify-center hover:bg-cyan-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Showers</span>
                </Link>
                <Link href="/bathhouse/gym" className="col-span-1 row-span-1 bg-green-700/50 rounded-lg flex items-center justify-center hover:bg-green-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Gym</span>
                </Link>
                <Link href="/bathhouse/vip" className="col-span-1 row-span-1 bg-yellow-700/50 rounded-lg flex items-center justify-center hover:bg-yellow-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">VIP</span>
                </Link>

                {/* Row 2 */}
                <Link href="/bathhouse/steam-room" className="col-span-1 row-span-1 bg-gray-600/50 rounded-lg flex items-center justify-center hover:bg-gray-500/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Steam</span>
                </Link>
                <Link href="/bathhouse/pool" className="col-span-2 row-span-1 bg-blue-700/50 rounded-lg flex items-center justify-center hover:bg-blue-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Pool & Hot Tub</span>
                </Link>
                <Link href="/bathhouse/sauna" className="col-span-1 row-span-1 bg-orange-700/50 rounded-lg flex items-center justify-center hover:bg-orange-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Sauna</span>
                </Link>

                {/* Row 3 */}
                <Link href="/bathhouse/dark-room" className="col-span-1 row-span-1 bg-slate-800/50 rounded-lg flex items-center justify-center hover:bg-slate-700/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Dark Room</span>
                </Link>
                <Link href="/bathhouse/private-rooms" className="col-span-1 row-span-1 bg-red-700/50 rounded-lg flex items-center justify-center hover:bg-red-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Private</span>
                </Link>
                <Link href="/bathhouse/sling-room" className="col-span-1 row-span-1 bg-purple-700/50 rounded-lg flex items-center justify-center hover:bg-purple-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Sling</span>
                </Link>
                <Link href="/bathhouse/voyeur" className="col-span-1 row-span-1 bg-amber-700/50 rounded-lg flex items-center justify-center hover:bg-amber-600/50 transition-colors cursor-pointer">
                  <span className="text-xs text-white">Voyeur</span>
                </Link>
              </div>

              {/* Corridor lines */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-600/30" />
              <div className="absolute top-0 bottom-0 left-1/4 w-0.5 bg-gray-600/30" />
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Click any zone to enter. Navigate through the corridors freely.
            </p>
          </Card>
        </div>

        {/* Safety Notice */}
        <div className="px-4 pb-16">
          <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/30 text-center">
            <p className="text-sm text-gray-400">
              <span className="text-red-400 font-semibold">18+ ONLY</span> - All participants must be age-verified.
              Practice safe encounters. Respect boundaries. Report violations.
            </p>
          </div>
        </div>
      </div>

      {/* CSS Animation for steam */}
      <style>{`
        @keyframes steam-rise {
          0%, 100% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translateY(-50px) translateX(20px) scale(1.2);
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
