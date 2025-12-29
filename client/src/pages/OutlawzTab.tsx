import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Skull,
  Shield,
  Video,
  Image,
  Users,
  TrendingUp,
  Sparkles,
  AlertTriangle,
  Heart,
  Ban,
  Star,
  ChevronDown,
  Flame,
  Zap,
  Eye,
  Lock,
  Crown,
  Swords,
  X,
  Filter,
  Dumbbell,
  Shirt,
  Theater,
  Camera,
  Gamepad2,
  Music,
  Footprints,
  Hand,
  Link2,
  Moon,
  Cigarette,
  Droplets,
  Scissors,
  PersonStanding,
  Binary,
} from "lucide-react";

// Comprehensive Outlawz Categories with Subcategories
const OUTLAWZ_CATEGORIES = [
  {
    id: "body-types",
    label: "Body Types",
    icon: Dumbbell,
    subcategories: [
      { id: "muscular", label: "Muscular / Jacked", count: 2847 },
      { id: "athletic", label: "Athletic / Fit", count: 4521 },
      { id: "slim", label: "Slim / Lean", count: 3102 },
      { id: "average", label: "Average / Dad Bod", count: 5234 },
      { id: "thick", label: "Thick / Stocky", count: 2156 },
      { id: "bear", label: "Bear / Husky", count: 1893 },
      { id: "twink", label: "Twink / Smooth", count: 3567 },
      { id: "otter", label: "Otter", count: 1245 },
      { id: "cub", label: "Cub", count: 987 },
    ],
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: Eye,
    subcategories: [
      { id: "hairy", label: "Hairy / Furry", count: 3421 },
      { id: "smooth", label: "Smooth / Shaved", count: 4123 },
      { id: "tattooed", label: "Tattooed / Inked", count: 2876 },
      { id: "pierced", label: "Pierced", count: 1567 },
      { id: "bearded", label: "Bearded / Facial Hair", count: 2934 },
      { id: "uncut", label: "Uncut / Natural", count: 3456 },
      { id: "cut", label: "Cut", count: 2987 },
      { id: "hung", label: "Hung / Well-Endowed", count: 4532 },
    ],
  },
  {
    id: "age-range",
    label: "Age Range",
    icon: PersonStanding,
    subcategories: [
      { id: "18-24", label: "Young (18-24)", count: 5678 },
      { id: "25-34", label: "Prime (25-34)", count: 7234 },
      { id: "35-44", label: "Experienced (35-44)", count: 4521 },
      { id: "45-54", label: "Mature (45-54)", count: 2876 },
      { id: "55-plus", label: "Silver (55+)", count: 1432 },
      { id: "daddy", label: "Daddy Types", count: 3567 },
      { id: "dilf", label: "DILF", count: 2156 },
    ],
  },
  {
    id: "acts",
    label: "Acts & Activities",
    icon: Flame,
    subcategories: [
      { id: "solo", label: "Solo / JO", count: 8934 },
      { id: "oral", label: "Oral", count: 7654 },
      { id: "anal", label: "Anal", count: 6543 },
      { id: "topping", label: "Topping / Giving", count: 4321 },
      { id: "bottoming", label: "Bottoming / Taking", count: 4567 },
      { id: "vers", label: "Versatile / Flip-Flop", count: 3876 },
      { id: "group", label: "Group / Orgy", count: 2345 },
      { id: "breeding", label: "Breeding / Raw", count: 3987 },
      { id: "rimming", label: "Rimming", count: 2876 },
      { id: "fisting", label: "Fisting", count: 1234 },
      { id: "toys", label: "Toys / Dildos", count: 3456 },
      { id: "edging", label: "Edging / Denial", count: 1987 },
    ],
  },
  {
    id: "fetish",
    label: "Fetish & Kink",
    icon: Link2,
    subcategories: [
      { id: "leather", label: "Leather", count: 2134 },
      { id: "rubber", label: "Rubber / Latex", count: 1567 },
      { id: "bdsm", label: "BDSM / Bondage", count: 2876 },
      { id: "dom", label: "Dom / Master", count: 1876 },
      { id: "sub", label: "Sub / Slave", count: 1654 },
      { id: "feet", label: "Feet / Foot Worship", count: 2345 },
      { id: "armpits", label: "Pits / Armpit", count: 1234 },
      { id: "underwear", label: "Underwear / Jocks", count: 2567 },
      { id: "watersports", label: "Watersports", count: 987 },
      { id: "verbal", label: "Verbal / Dirty Talk", count: 3456 },
      { id: "roleplay", label: "Role Play", count: 2134 },
      { id: "uniforms", label: "Uniforms / Costumes", count: 1876 },
      { id: "military", label: "Military / Cops", count: 1567 },
      { id: "sports", label: "Sports Gear / Jocks", count: 2345 },
    ],
  },
  {
    id: "scenarios",
    label: "Scenarios",
    icon: Theater,
    subcategories: [
      { id: "hookup", label: "Hookup / Cruising", count: 4567 },
      { id: "gloryhole", label: "Glory Hole", count: 1876 },
      { id: "public", label: "Public / Outdoor", count: 2345 },
      { id: "locker-room", label: "Locker Room / Gym", count: 2134 },
      { id: "office", label: "Office / Boss", count: 1567 },
      { id: "stepdad", label: "Stepdad / Family RP", count: 3456 },
      { id: "massage", label: "Massage / Happy Ending", count: 2876 },
      { id: "casting", label: "Casting Couch", count: 1234 },
      { id: "first-time", label: "First Time / Virgin", count: 2567 },
      { id: "cheating", label: "Cheating / Affair", count: 1987 },
      { id: "anonymous", label: "Anonymous / Blindfolded", count: 1654 },
    ],
  },
  {
    id: "ethnicity",
    label: "Ethnicity",
    icon: Binary,
    subcategories: [
      { id: "caucasian", label: "Caucasian / White", count: 8765 },
      { id: "latino", label: "Latino / Hispanic", count: 4567 },
      { id: "black", label: "Black / African", count: 3876 },
      { id: "asian", label: "Asian", count: 2987 },
      { id: "middle-eastern", label: "Middle Eastern / Arab", count: 1876 },
      { id: "mixed", label: "Mixed / Multi-Racial", count: 2345 },
      { id: "interracial", label: "Interracial", count: 3456 },
    ],
  },
  {
    id: "content-type",
    label: "Content Type",
    icon: Camera,
    subcategories: [
      { id: "photos", label: "Photos / Pics", count: 12345 },
      { id: "videos", label: "Videos / Clips", count: 8765 },
      { id: "live-streams", label: "Live Streams", count: 567 },
      { id: "cam-shows", label: "Cam Shows", count: 876 },
      { id: "custom", label: "Custom Content", count: 2345 },
      { id: "sexting", label: "Sexting / DMs", count: 3456 },
      { id: "audio", label: "Audio / Moans", count: 1234 },
      { id: "pov", label: "POV", count: 4567 },
      { id: "amateur", label: "Amateur / Homemade", count: 6543 },
      { id: "pro", label: "Professional / Studio", count: 3876 },
    ],
  },
  {
    id: "special",
    label: "Special & Extreme",
    icon: Zap,
    subcategories: [
      { id: "extreme", label: "Extreme / Hardcore", count: 2134 },
      { id: "rough", label: "Rough / Aggressive", count: 3456 },
      { id: "gangbang", label: "Gangbang", count: 987 },
      { id: "dp", label: "DP / Double", count: 876 },
      { id: "size-queen", label: "Size Queen / XXL", count: 1567 },
      { id: "gaping", label: "Gaping", count: 654 },
      { id: "prolapse", label: "Prolapse", count: 234 },
      { id: "cbt", label: "CBT", count: 567 },
      { id: "sounding", label: "Sounding", count: 345 },
    ],
  },
];

interface Creator {
  id: string;
  username: string;
  displayName: string;
  profileImageUrl: string;
  bio: string;
  subscriberCount: number;
  isVerified: boolean;
  isLive: boolean;
  bannedFrom?: string[];
  outlawzReason?: string;
}

interface ContentItem {
  id: string;
  type: "video" | "image" | "post";
  thumbnailUrl: string;
  title: string;
  creatorId: string;
  creatorUsername: string;
  creatorProfileImage: string;
  likes: number;
  views: number;
  isLocked: boolean;
  contentWarning?: string;
}

export default function OutlawzTab() {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [ageVerified, setAgeVerified] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Fetch outlawz creators
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["outlawz-creators", selectedCategories],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("section", "outlawz");
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      }
      const res = await fetch(`/api/creators/discover?${params}`);
      if (!res.ok) throw new Error("Failed to fetch creators");
      return res.json();
    },
    enabled: ageVerified,
  });

  // Fetch outlawz content
  const { data: content = [], isLoading: contentLoading } = useQuery<ContentItem[]>({
    queryKey: ["outlawz-content", activeTab, selectedCategories],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("section", "outlawz");
      params.set("sort", activeTab);
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      }
      const res = await fetch(`/api/content/feed?${params}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
    enabled: ageVerified,
  });

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(c => c !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const getCategoryLabel = (id: string): string => {
    for (const cat of OUTLAWZ_CATEGORIES) {
      const sub = cat.subcategories.find(s => s.id === id);
      if (sub) return sub.label;
    }
    return id;
  };

  if (!ageVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4 bg-gradient-to-b from-black via-red-950/30 to-black border-red-500/50 shadow-2xl shadow-red-500/20">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-red-500/20 rounded-full w-fit mb-4 animate-pulse">
              <Skull className="h-16 w-16 text-red-500" />
            </div>
            <CardTitle className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-red-500">
              OUTLAWZ ZONE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive" className="bg-red-950/50 border-red-500/50">
              <AlertTriangle className="h-5 w-5" />
              <AlertTitle className="text-lg">⚠️ EXTREME CONTENT WARNING</AlertTitle>
              <AlertDescription className="text-red-200">
                The Outlawz section contains creators banned from mainstream platforms.
                Content is uncensored, unfiltered, and intended for mature audiences only.
                <strong className="block mt-2">YOU MUST BE 18+ TO ENTER.</strong>
              </AlertDescription>
            </Alert>

            <div className="space-y-3 text-sm text-gray-300 bg-black/40 p-4 rounded-lg border border-red-500/20">
              <p className="flex items-center gap-3">
                <Ban className="h-5 w-5 text-red-500" />
                <span>Creators <strong>banned</strong> from OnlyFans, JustForFans, etc.</span>
              </p>
              <p className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <span>Uncensored, <strong>unfiltered</strong> extreme content</span>
              </p>
              <p className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-green-500" />
                <span>Still <strong>2257 compliant</strong> & legal</span>
              </p>
              <p className="flex items-center gap-3">
                <Swords className="h-5 w-5 text-purple-500" />
                <span>No limits. No filters. <strong>No mercy.</strong></span>
              </p>
            </div>

            <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-red-600 via-red-500 to-orange-600 hover:from-red-500 hover:via-red-400 hover:to-orange-500 shadow-lg shadow-red-500/30 border border-red-400/30"
              onClick={() => setAgeVerified(true)}
            >
              <Skull className="mr-2 h-6 w-6" />
              I AM 18+ — ENTER THE OUTLAWZ
            </Button>
            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-gray-200"
              onClick={() => window.history.back()}
            >
              ← Take Me Back to Safety
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Epic Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-black via-red-950 to-black p-6 rounded-xl mb-6 border border-red-500/40 shadow-2xl shadow-red-500/20">
        {/* Animated background effects */}
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-red-600/30 to-orange-600/30 rounded-xl backdrop-blur-sm border border-red-500/40 shadow-lg shadow-red-500/20">
            <Skull className="h-12 w-12 text-red-500 drop-shadow-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-red-400 flex items-center gap-3 drop-shadow-lg">
              OUTLAWZ
              <Badge variant="destructive" className="animate-pulse text-sm px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 border-0">
                🔥 UNCENSORED
              </Badge>
            </h1>
            <p className="text-gray-300 mt-1 text-lg">
              Creators too <span className="text-red-400 font-bold">HOT</span> for other platforms.
              No limits. No filters. <span className="text-orange-400 font-bold">No mercy.</span>
            </p>
          </div>
          <div className="ml-auto hidden lg:flex items-center gap-2">
            <Badge className="bg-red-900/50 border-red-500/50 text-red-200 px-3 py-1">
              <Users className="h-4 w-4 mr-1" />
              {(creators?.length || 247).toLocaleString()} Outlawz
            </Badge>
            <Badge className="bg-orange-900/50 border-orange-500/50 text-orange-200 px-3 py-1">
              <Video className="h-4 w-4 mr-1" />
              {(content?.length || 12847).toLocaleString()} Posts
            </Badge>
          </div>
        </div>
      </div>

      {/* Category Navigation with Dropdowns */}
      <div className="mb-6 bg-gradient-to-r from-red-950/30 via-black to-red-950/30 rounded-xl border border-red-500/20 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-red-400" />
          <span className="font-bold text-gray-200">Filter by Category</span>
          {selectedCategories.length > 0 && (
            <Badge variant="secondary" className="bg-red-600 text-white border-0">
              {selectedCategories.length} selected
            </Badge>
          )}
        </div>

        {/* Category Dropdown Buttons */}
        <ScrollArea className="w-full pb-2">
          <div className="flex gap-2 flex-nowrap">
            {OUTLAWZ_CATEGORIES.map((category) => {
              const Icon = category.icon;
              const selectedInCategory = category.subcategories.filter(
                s => selectedCategories.includes(s.id)
              ).length;

              return (
                <DropdownMenu key={category.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className={`shrink-0 gap-2 rounded-lg border-red-500/30 bg-red-950/30 hover:bg-red-900/50 hover:border-red-500/50 transition-all ${
                        selectedInCategory > 0 ? 'border-red-500 bg-red-900/50' : ''
                      }`}
                    >
                      <Icon className="h-4 w-4 text-red-400" />
                      {category.label}
                      {selectedInCategory > 0 && (
                        <Badge className="ml-1 bg-red-600 text-white text-xs px-1.5">
                          {selectedInCategory}
                        </Badge>
                      )}
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 bg-black/95 border-red-500/30 backdrop-blur-xl max-h-80 overflow-y-auto"
                    align="start"
                  >
                    <DropdownMenuLabel className="text-red-400 flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {category.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-red-500/20" />
                    {category.subcategories.map((sub) => (
                      <DropdownMenuCheckboxItem
                        key={sub.id}
                        checked={selectedCategories.includes(sub.id)}
                        onCheckedChange={() => toggleCategory(sub.id)}
                        className="cursor-pointer hover:bg-red-900/30 focus:bg-red-900/30"
                      >
                        <div className="flex justify-between w-full items-center">
                          <span>{sub.label}</span>
                          <span className="text-xs text-gray-500">{sub.count.toLocaleString()}</span>
                        </div>
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Selected Categories Pills */}
        {selectedCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-red-500/20">
            {selectedCategories.map((catId) => (
              <Badge
                key={catId}
                variant="secondary"
                className="bg-red-900/50 border-red-500/30 text-red-200 cursor-pointer hover:bg-red-800/50 gap-1 pr-1"
                onClick={() => toggleCategory(catId)}
              >
                {getCategoryLabel(catId)}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllCategories}
              className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-gradient-to-r from-red-950/50 via-black to-red-950/50 border border-red-500/20 p-1 rounded-xl">
          <TabsTrigger
            value="trending"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <TrendingUp className="h-4 w-4" />
            🔥 Hot
          </TabsTrigger>
          <TabsTrigger
            value="newest"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Sparkles className="h-4 w-4" />
            ⚡ New
          </TabsTrigger>
          <TabsTrigger
            value="live"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Video className="h-4 w-4" />
            🔴 Live
          </TabsTrigger>
          <TabsTrigger
            value="creators"
            className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white rounded-lg transition-all"
          >
            <Skull className="h-4 w-4" />
            💀 Outlawz
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="space-y-4">
          <ContentGrid content={content} isLoading={contentLoading} />
        </TabsContent>

        <TabsContent value="newest" className="space-y-4">
          <ContentGrid content={content} isLoading={contentLoading} />
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <LiveCreatorsGrid creators={creators.filter(c => c.isLive)} isLoading={creatorsLoading} />
        </TabsContent>

        <TabsContent value="creators" className="space-y-4">
          <OutlawzCreatorsGrid creators={creators} isLoading={creatorsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ContentGrid({ content, isLoading }: { content: ContentItem[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-b from-red-950/30 to-black border-red-500/20">
            <div className="aspect-[9/16] bg-red-950/40 rounded-t-lg" />
            <CardContent className="p-3">
              <div className="h-4 bg-red-950/40 rounded w-3/4 mb-2" />
              <div className="h-3 bg-red-950/40 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-red-950/20 to-black rounded-xl border border-red-500/20">
        <Skull className="h-16 w-16 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">No content yet</h3>
        <p className="text-gray-500 mt-2">Outlawz are loading their arsenal...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {content.map((item) => (
        <Card key={item.id} className="group cursor-pointer bg-gradient-to-b from-red-950/30 to-black border-red-500/20 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all overflow-hidden">
          <div className="relative aspect-[9/16] overflow-hidden">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            {item.isLocked && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                <Badge className="bg-gradient-to-r from-red-600 to-orange-600 border-0 px-4 py-2">
                  <Lock className="h-4 w-4 mr-2" />
                  Premium
                </Badge>
              </div>
            )}
            {item.contentWarning && (
              <Badge className="absolute top-2 left-2 bg-yellow-600/90 border-0">
                ⚠️ {item.contentWarning}
              </Badge>
            )}
            <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1.5">
              {item.type === "video" ? (
                <Video className="h-4 w-4 text-red-400" />
              ) : (
                <Image className="h-4 w-4 text-red-400" />
              )}
            </div>
          </div>
          <CardContent className="p-3">
            <p className="font-bold text-sm truncate text-gray-200">{item.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <img
                src={item.creatorProfileImage}
                alt={item.creatorUsername}
                className="h-6 w-6 rounded-full ring-2 ring-red-500/50"
              />
              <span className="text-xs text-gray-400 truncate">@{item.creatorUsername}</span>
              <Skull className="h-3 w-3 text-red-500 ml-auto" />
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 text-red-400" /> {item.likes.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-3 w-3" /> {item.views.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OutlawzCreatorsGrid({ creators, isLoading }: { creators: Creator[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-b from-red-950/30 to-black border-red-500/20 p-4">
            <div className="h-20 w-20 bg-red-950/40 rounded-full mx-auto mb-3" />
            <div className="h-4 bg-red-950/40 rounded w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-red-950/40 rounded w-1/2 mx-auto" />
          </Card>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-red-950/20 to-black rounded-xl border border-red-500/20">
        <Users className="h-16 w-16 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">No outlawz found</h3>
        <p className="text-gray-500 mt-2">They're hiding from the law...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="p-4 bg-gradient-to-b from-red-950/30 to-black border-red-500/20 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={creator.profileImageUrl}
                alt={creator.displayName}
                className="h-20 w-20 rounded-full object-cover ring-4 ring-red-500/50 group-hover:ring-red-500 transition-all"
              />
              {creator.isLive && (
                <Badge className="absolute -bottom-1 -right-1 bg-gradient-to-r from-red-600 to-orange-600 border-0 text-xs px-2 animate-pulse">
                  🔴 LIVE
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-black text-lg text-gray-200 flex items-center gap-2">
                {creator.displayName}
                <Skull className="h-5 w-5 text-red-500" />
              </h3>
              <p className="text-sm text-gray-400">@{creator.username}</p>
              {creator.bannedFrom && creator.bannedFrom.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creator.bannedFrom.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs border-red-500/30 text-red-400 bg-red-950/30">
                      <Ban className="h-3 w-3 mr-1" />
                      {platform}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{creator.bio}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-red-500/20">
            <span className="text-sm text-gray-400">
              <span className="font-bold text-white">{creator.subscriberCount.toLocaleString()}</span> fans
            </span>
            <Button size="sm" className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-0 font-bold">
              <Crown className="h-4 w-4 mr-1" />
              Follow Outlaw
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

function LiveCreatorsGrid({ creators, isLoading }: { creators: Creator[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-gradient-to-b from-red-950/30 to-black border-red-500/20">
            <div className="aspect-video bg-red-950/40 rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-red-950/40 rounded w-3/4 mb-2" />
              <div className="h-3 bg-red-950/40 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-b from-red-950/20 to-black rounded-xl border border-red-500/20">
        <Video className="h-16 w-16 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-xl font-bold text-gray-300">No outlawz streaming</h3>
        <p className="text-gray-500 mt-2">They're laying low for now...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="overflow-hidden bg-gradient-to-b from-red-950/30 to-black border-red-500/20 hover:border-red-500/60 hover:shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer group">
          <div className="relative aspect-video bg-gradient-to-br from-red-900/50 to-black overflow-hidden">
            <img
              src={creator.profileImageUrl}
              alt={creator.displayName}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-600 to-orange-600 border-0 animate-pulse px-3 py-1.5 text-sm font-bold">
              🔴 LIVE — UNCENSORED
            </Badge>
            <div className="absolute bottom-3 right-3 bg-black/60 rounded-lg px-2 py-1 text-xs text-gray-300">
              <Eye className="h-3 w-3 inline mr-1" />
              {Math.floor(Math.random() * 500) + 50} watching
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={creator.profileImageUrl}
                alt={creator.displayName}
                className="h-12 w-12 rounded-full ring-2 ring-red-500"
              />
              <div>
                <h3 className="font-bold text-gray-200 flex items-center gap-1">
                  {creator.displayName}
                  <Skull className="h-4 w-4 text-red-500" />
                </h3>
                <p className="text-sm text-gray-400">@{creator.username}</p>
              </div>
            </div>
            <Button className="w-full mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 border-0 font-bold h-11">
              <Video className="h-5 w-5 mr-2" />
              Watch Uncensored
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
