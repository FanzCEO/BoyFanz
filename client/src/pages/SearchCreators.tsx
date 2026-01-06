import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FeedAd, SidebarAd } from '@/components/ads/AdBanner';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Star,
  Shield,
  Heart,
  Flame,
  Eye,
  Lock,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';
import { PrivateDoor, BathhousePipes, SubtleSteamAccent } from '@/components/bathhouse';

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

const CreatorDoor = ({ creator, roomNumber }: { creator: Creator; roomNumber: number }) => {
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <Link href={`/creator/${creator.userId}`}>
      <motion.div
        className="relative h-full cursor-pointer group"
        whileHover={{ scale: 1.02, y: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Door frame */}
        <div
          className="relative h-full rounded-sm overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(25, 15, 15, 0.95) 0%, rgba(15, 8, 8, 0.98) 100%)',
            border: '3px solid rgba(60, 40, 40, 0.8)',
            boxShadow: creator.isOnline
              ? '0 0 30px rgba(255, 50, 50, 0.4), inset 0 0 40px rgba(255, 0, 0, 0.1)'
              : 'inset 0 0 30px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Room number plate */}
          <div
            className="absolute top-3 right-3 px-3 py-1 rounded-sm text-xs font-bold tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #8B6914 0%, #D4AF37 50%, #8B6914 100%)',
              color: '#1a1a1a',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            {roomNumber}
          </div>

          {/* Online indicator - pulsing red light */}
          {creator.isOnline && (
            <motion.div
              className="absolute top-3 left-3 flex items-center gap-2"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, #ff4444, #cc0000)',
                  boxShadow: '0 0 10px #ff0000, 0 0 20px #ff000080'
                }}
              />
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Live</span>
            </motion.div>
          )}

          {/* Peek window with avatar */}
          <div className="p-6 pt-12">
            <div
              className="mx-auto w-24 h-32 mb-4 overflow-hidden rounded-sm relative"
              style={{
                background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(20, 10, 10, 0.9) 100%)',
                border: '2px solid rgba(80, 60, 60, 0.6)',
                boxShadow: 'inset 0 0 20px rgba(255, 50, 50, 0.1)'
              }}
            >
              {creator.user?.profileImageUrl ? (
                <img
                  src={creator.user.profileImageUrl}
                  alt={creator.user.username}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-red-500/50">
                  {creator.user?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              {/* Peek window reflection */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Creator name */}
            <h3
              className="text-lg font-bold text-center mb-2 text-white"
              style={{ textShadow: '0 0 10px rgba(255, 100, 100, 0.5)' }}
            >
              {creator.user?.username || 'Anonymous'}
            </h3>

            {/* Verification badge */}
            {creator.verificationBadge !== 'none' && (
              <div className="flex justify-center mb-3">
                <Badge
                  className="text-xs"
                  style={{
                    background: creator.verificationBadge === 'featured'
                      ? 'linear-gradient(135deg, rgba(255, 50, 50, 0.3) 0%, rgba(200, 30, 30, 0.4) 100%)'
                      : 'linear-gradient(135deg, rgba(0, 229, 255, 0.2) 0%, rgba(0, 180, 200, 0.3) 100%)',
                    border: creator.verificationBadge === 'featured'
                      ? '1px solid rgba(255, 100, 100, 0.5)'
                      : '1px solid rgba(0, 229, 255, 0.4)',
                    color: creator.verificationBadge === 'featured' ? '#ff6666' : '#00e5ff'
                  }}
                >
                  <Flame className="h-3 w-3 mr-1" />
                  {creator.verificationBadge === 'featured' ? 'HOT' : 'Verified'}
                </Badge>
              </div>
            )}

            {/* Categories as kinks */}
            <div className="flex flex-wrap gap-1 mb-3 justify-center">
              {creator.categories.slice(0, 2).map((category, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="text-xs border-red-900/50 text-red-400/80"
                >
                  {category}
                </Badge>
              ))}
              {creator.categories.length > 2 && (
                <Badge variant="outline" className="text-xs border-red-900/50 text-red-400/80">
                  +{creator.categories.length - 2}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between text-sm mb-4 px-2">
              <div className="flex items-center gap-1 text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{creator.totalSubscribers}</span>
              </div>
              <div
                className="font-bold text-red-400"
                style={{ textShadow: '0 0 10px rgba(255, 50, 50, 0.5)' }}
              >
                {formatCurrency(creator.monthlyPriceCents)}/mo
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2">
              <Button
                className="w-full text-sm font-bold uppercase tracking-wider"
                style={{
                  background: 'linear-gradient(135deg, #cc0000 0%, #8B0000 100%)',
                  boxShadow: '0 0 20px rgba(200, 0, 0, 0.4)',
                  border: '1px solid rgba(255, 100, 100, 0.3)'
                }}
              >
                <Lock className="h-4 w-4 mr-2" />
                Get Access
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-gray-700 text-gray-400 hover:bg-red-900/20 hover:text-red-300 hover:border-red-800 text-xs"
              >
                <Heart className="h-3 w-3 mr-1" />
                Save for Later
              </Button>
            </div>
          </div>

          {/* Door handle */}
          <div
            className="absolute right-4 top-1/2 w-3 h-12 rounded-full"
            style={{
              background: 'linear-gradient(180deg, #8B6914 0%, #D4AF37 50%, #8B6914 100%)',
              boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.5)'
            }}
          />
        </div>
      </motion.div>
    </Link>
  );
};

// Sexually explicit categories
const CATEGORY_GROUPS = {
  'Body Types': ['Athletic', 'Thick', 'Petite', 'Beefy', 'Muscular', 'Hairy', 'Smooth', 'Tattooed', 'Hung', 'Bubble Butt'],
  'Types': ['Twink', 'Bear', 'Otter', 'Wolf', 'Daddy', 'Jock', 'Cub', 'Pup', 'Leather', 'Rubber'],
  'Kinks': ['Bondage', 'Dom/Sub', 'Leather', 'Latex', 'Pup Play', 'Spanking', 'Edging', 'CBT', 'Watersports'],
  'Positions': ['Top', 'Bottom', 'Vers', 'Power Bottom', 'Service Top', 'Dom Top', 'Sub Bottom'],
  'Activities': ['Solo', 'JO', 'Oral', 'Anal', 'Fisting', 'Group', 'Anon', 'Breeding', 'Rimming'],
  'Style': ['Amateur', 'Pro', 'POV', 'JOI', 'Dirty Talk', 'Roleplay', 'Customs', 'Live Shows'],
  'Scenes': ['Locker Room', 'Shower', 'Glory Hole', 'Sling', 'Outdoor', 'Public', 'Cruising', 'Bareback'],
};

// Special zones
const SPECIAL_TABS = [
  { id: 'hot', label: '🔥 On Fire', description: 'Trending now' },
  { id: 'new', label: '🍆 Fresh Meat', description: 'New arrivals' },
  { id: 'live', label: '📺 Live Now', description: 'Currently streaming' },
];

export default function SearchCreators() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [specialTab, setSpecialTab] = useState<string | null>(null);

  const { data: creators = [], isLoading } = useQuery<Creator[]>({
    queryKey: ['/api/creators', { search: searchQuery, category: selectedCategory, specialTab }],
  });

  // Quick picks - most searched
  const quickPickCategories = ['Hung', 'Muscle', 'Twink', 'Bear', 'Daddy', 'Bottom', 'Top', 'Live Shows'];
  const displayCategories = selectedGroup
    ? CATEGORY_GROUPS[selectedGroup as keyof typeof CATEGORY_GROUPS]
    : quickPickCategories;

  const featuredCreators = creators.filter(c => c.verificationBadge === 'featured');
  const verifiedCreators = creators.filter(c => c.isVerified && c.verificationBadge !== 'featured');
  const regularCreators = creators.filter(c => !c.isVerified && c.verificationBadge === 'none');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="h-96 rounded-sm"
                  style={{
                    background: 'linear-gradient(180deg, rgba(30, 15, 15, 0.5) 0%, rgba(15, 8, 8, 0.5) 100%)',
                    border: '2px solid rgba(60, 40, 40, 0.3)'
                  }}
                  animate={{ opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" data-testid="search-creators">
      {/* Dark corridor background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top, rgba(80, 0, 0, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at bottom, rgba(50, 0, 0, 0.1) 0%, transparent 50%),
            linear-gradient(180deg, #0a0505 0%, #050202 100%)
          `
        }}
      />

      {/* Red ceiling strip lights */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />

      {/* Corridor lighting effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Pulsing red overhead lights */}
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-2 h-40"
            style={{ left: `${i * 18}%` }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity }}
          >
            <div className="w-full h-full bg-gradient-to-b from-red-600/40 to-transparent" />
          </motion.div>
        ))}

        {/* Side darkness for depth */}
        <div className="absolute inset-y-0 left-0 w-48 bg-gradient-to-r from-black/80 to-transparent" />
        <div className="absolute inset-y-0 right-0 w-48 bg-gradient-to-l from-black/80 to-transparent" />
      </div>

      {/* Industrial pipes with occasional steam - much more readable */}
      <BathhousePipes pipeCount={6} steamInterval={12000} />
      <SubtleSteamAccent />

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1 max-w-5xl mx-auto">

            {/* Header - Aggressive bathhouse sign */}
            <div className="mb-10 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1
                  className="text-6xl md:text-8xl font-black uppercase mb-4"
                  style={{
                    background: 'linear-gradient(180deg, #ffffff 0%, #ff6666 50%, #cc0000 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 0 60px rgba(255, 0, 0, 0.5)'
                  }}
                >
                  WHO'S HUNGRY?
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-6">
                  Find your <span className="text-red-400 font-semibold">type</span>. Get what you <span className="text-red-400 font-semibold">need</span>.
                </p>
              </motion.div>

              {/* Neon room count */}
              <motion.div
                className="inline-flex items-center gap-3 px-6 py-3 rounded-sm mb-6"
                style={{
                  background: 'linear-gradient(135deg, rgba(30, 15, 15, 0.9) 0%, rgba(15, 8, 8, 0.95) 100%)',
                  border: '1px solid rgba(255, 50, 50, 0.3)'
                }}
                animate={{ boxShadow: ['0 0 20px rgba(255, 0, 0, 0.2)', '0 0 30px rgba(255, 0, 0, 0.4)', '0 0 20px rgba(255, 0, 0, 0.2)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="h-5 w-5 text-red-500" />
                <span className="text-red-400 font-bold">{creators.length} ROOMS OCCUPIED</span>
                <Zap className="h-5 w-5 text-red-500" />
              </motion.div>
            </div>

            {/* Special Zone Tabs */}
            <div className="mb-6 flex flex-wrap gap-3 justify-center">
              {SPECIAL_TABS.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setSpecialTab(specialTab === tab.id ? null : tab.id);
                    setSelectedGroup(null);
                    setSelectedCategory('');
                  }}
                  className={`px-5 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all ${
                    specialTab === tab.id
                      ? 'text-white'
                      : 'text-gray-400 hover:text-red-400'
                  }`}
                  style={specialTab === tab.id ? {
                    background: 'linear-gradient(135deg, #8B0000 0%, #cc0000 100%)',
                    boxShadow: '0 0 20px rgba(200, 0, 0, 0.5)',
                    border: '1px solid rgba(255, 100, 100, 0.4)'
                  } : {
                    background: 'rgba(20, 10, 10, 0.8)',
                    border: '1px solid rgba(60, 40, 40, 0.5)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  data-testid={`special-tab-${tab.id}`}
                >
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Search Bar - Dark industrial */}
            <div className="mb-8 space-y-4">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-red-500/60 h-6 w-6" />
                <Input
                  type="search"
                  placeholder="What are you looking for tonight?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-14 py-7 text-lg bg-black/80 border-2 border-red-900/50 focus:border-red-600/70 text-white placeholder:text-gray-600"
                  style={{
                    boxShadow: 'inset 0 0 30px rgba(0, 0, 0, 0.8)',
                    borderRadius: '2px'
                  }}
                  data-testid="search-input"
                />
              </motion.div>

              {/* Category Groups */}
              <div className="flex flex-wrap gap-2 pb-4 border-b border-red-900/30">
                <Button
                  variant={!selectedGroup ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setSelectedGroup(null);
                    setSelectedCategory('');
                  }}
                  className={!selectedGroup
                    ? 'bg-red-800 hover:bg-red-700 text-white'
                    : 'text-gray-500 hover:text-red-400'
                  }
                >
                  All Types
                </Button>
                {Object.keys(CATEGORY_GROUPS).map((group) => (
                  <Button
                    key={group}
                    variant={selectedGroup === group ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                      setSelectedGroup(selectedGroup === group ? null : group);
                      setSelectedCategory('');
                    }}
                    className={selectedGroup === group
                      ? 'bg-red-800 hover:bg-red-700 text-white'
                      : 'text-gray-500 hover:text-red-400'
                    }
                    data-testid={`group-${group.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  >
                    {group}
                  </Button>
                ))}
              </div>

              {/* Individual Categories */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === '' ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                  className={selectedCategory === ''
                    ? 'bg-red-900/50 text-red-300 border-red-800'
                    : 'border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-800'
                  }
                >
                  Show All
                </Button>
                {displayCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'secondary' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={selectedCategory === category
                      ? 'bg-red-900/50 text-red-300 border-red-800'
                      : 'border-gray-800 text-gray-500 hover:text-red-400 hover:border-red-800'
                    }
                    data-testid={`category-${category.toLowerCase().replace(/[^a-z]/g, '-')}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Results */}
            {creators.length === 0 ? (
              <motion.div
                className="text-center py-20"
                style={{
                  background: 'linear-gradient(180deg, rgba(20, 10, 10, 0.8) 0%, rgba(10, 5, 5, 0.9) 100%)',
                  border: '2px solid rgba(60, 40, 40, 0.5)',
                  borderRadius: '2px'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Lock className="h-20 w-20 mx-auto text-red-900/50 mb-4" />
                <h3 className="text-2xl font-bold text-gray-400 mb-2">No one matching that vibe</h3>
                <p className="text-gray-600">
                  Try a different search or browse all rooms
                </p>
              </motion.div>
            ) : (
              <div className="space-y-16">

                {/* Featured - VIP Suites */}
                {featuredCreators.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <Flame className="h-8 w-8 text-red-500" />
                      <h2
                        className="text-3xl font-black uppercase tracking-wider"
                        style={{
                          background: 'linear-gradient(90deg, #ff6666 0%, #ffcc00 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          textShadow: '0 0 30px rgba(255, 100, 0, 0.5)'
                        }}
                      >
                        VIP SUITES
                      </h2>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-red-600/50 via-yellow-600/30 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {featuredCreators.map((creator, idx) => (
                        <CreatorDoor key={creator.userId} creator={creator} roomNumber={100 + idx + 1} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Ad */}
                <FeedAd className="my-8" />

                {/* Popular - Hot Corridor */}
                {verifiedCreators.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <Zap className="h-8 w-8 text-red-400" />
                      <h2
                        className="text-3xl font-black uppercase tracking-wider text-red-400"
                        style={{ textShadow: '0 0 20px rgba(255, 50, 50, 0.5)' }}
                      >
                        POPULAR TONIGHT
                      </h2>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-red-600/50 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {verifiedCreators.map((creator, idx) => (
                        <CreatorDoor key={creator.userId} creator={creator} roomNumber={200 + idx + 1} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Another Ad */}
                {regularCreators.length > 0 && <FeedAd className="my-8" />}

                {/* All Rooms */}
                {regularCreators.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <Users className="h-8 w-8 text-gray-500" />
                      <h2 className="text-3xl font-black uppercase tracking-wider text-gray-400">
                        EXPLORE MORE
                      </h2>
                      <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-700/50 to-transparent" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {regularCreators.map((creator, idx) => (
                        <CreatorDoor key={creator.userId} creator={creator} roomNumber={300 + idx + 1} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="hidden xl:block w-80 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div
                className="p-4 rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 8, 8, 0.95) 0%, rgba(8, 4, 4, 0.98) 100%)',
                  border: '1px solid rgba(60, 40, 40, 0.5)'
                }}
              >
                <SidebarAd />
              </div>
              <div
                className="p-4 rounded-sm"
                style={{
                  background: 'linear-gradient(180deg, rgba(15, 8, 8, 0.95) 0%, rgba(8, 4, 4, 0.98) 100%)',
                  border: '1px solid rgba(60, 40, 40, 0.5)'
                }}
              >
                <SidebarAd />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
