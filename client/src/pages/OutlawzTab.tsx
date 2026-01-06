import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CategoryNavigation } from "@/components/CategoryNavigation";
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
} from "lucide-react";

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

  if (!ageVerified) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Card className="max-w-lg w-full mx-4">
          <CardHeader className="text-center">
            <div className="mx-auto p-4 bg-red-500/10 rounded-full w-fit mb-4">
              <Skull className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-2xl">Outlawz Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Content Warning</AlertTitle>
              <AlertDescription>
                The Outlawz section contains creators who have been banned or restricted
                from other platforms. Content may be more explicit or edgy.
                You must be 18+ to enter.
              </AlertDescription>
            </Alert>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Ban className="h-4 w-4" />
                Creators banned from mainstream platforms
              </p>
              <p className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Still compliant with FANZ policies & 2257
              </p>
              <p className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Uncensored, unfiltered content
              </p>
            </div>

            <Button
              className="w-full bg-red-600 hover:bg-red-700"
              onClick={() => setAgeVerified(true)}
            >
              I am 18+ - Enter Outlawz
            </Button>
            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-red-900 via-black to-red-900 p-6 rounded-lg mb-6 border border-red-500/30">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 rounded-lg" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-full backdrop-blur-sm border border-red-500/30">
            <Skull className="h-8 w-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Outlawz
              <Badge variant="destructive" className="animate-pulse">
                UNCENSORED
              </Badge>
            </h1>
            <p className="text-gray-400 mt-1">
              Creators too hot for other platforms. No limits, no filters.
            </p>
          </div>
        </div>
      </div>

      {/* Warning Banner */}
      <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          Outlawz creators operate under special guidelines. All content remains 2257 compliant
          and legal. Report any concerns to our moderation team.
        </AlertDescription>
      </Alert>

      {/* Category Navigation */}
      <CategoryNavigation
        onOrientationChange={() => {}}
        onCategoriesChange={setSelectedCategories}
        className="mb-6"
      />

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid bg-red-950/50">
          <TabsTrigger value="trending" className="gap-2 data-[state=active]:bg-red-600">
            <TrendingUp className="h-4 w-4" />
            Hot
          </TabsTrigger>
          <TabsTrigger value="newest" className="gap-2 data-[state=active]:bg-red-600">
            <Sparkles className="h-4 w-4" />
            New
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2 data-[state=active]:bg-red-600">
            <Video className="h-4 w-4" />
            Live
          </TabsTrigger>
          <TabsTrigger value="creators" className="gap-2 data-[state=active]:bg-red-600">
            <Users className="h-4 w-4" />
            Outlawz
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
          <Card key={i} className="animate-pulse bg-red-950/20 border-red-500/20">
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
      <div className="text-center py-12">
        <Skull className="h-12 w-12 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No content yet</h3>
        <p className="text-gray-500">Outlawz are loading their arsenal...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {content.map((item) => (
        <Card key={item.id} className="group cursor-pointer bg-red-950/20 border-red-500/20 hover:border-red-500/50 transition-all">
          <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {item.isLocked && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <Badge className="bg-red-600">Premium</Badge>
              </div>
            )}
            {item.contentWarning && (
              <Badge className="absolute top-2 left-2 bg-yellow-600">
                {item.contentWarning}
              </Badge>
            )}
            <div className="absolute top-2 right-2">
              {item.type === "video" ? (
                <Video className="h-4 w-4 text-white drop-shadow-lg" />
              ) : (
                <Image className="h-4 w-4 text-white drop-shadow-lg" />
              )}
            </div>
          </div>
          <CardContent className="p-3">
            <p className="font-medium text-sm truncate text-gray-200">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <img
                src={item.creatorProfileImage}
                alt={item.creatorUsername}
                className="h-5 w-5 rounded-full ring-1 ring-red-500"
              />
              <span className="text-xs text-gray-400">@{item.creatorUsername}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3" /> {item.likes.toLocaleString()}
              </span>
              <span>{item.views.toLocaleString()} views</span>
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
          <Card key={i} className="animate-pulse bg-red-950/20 border-red-500/20 p-4">
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
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No outlawz found</h3>
        <p className="text-gray-500">They're hiding from the law...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="p-4 bg-red-950/20 border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={creator.profileImageUrl}
                alt={creator.displayName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-red-500/50"
              />
              {creator.isLive && (
                <Badge className="absolute -bottom-1 -right-1 bg-red-500 text-xs px-1">
                  LIVE
                </Badge>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-200 flex items-center gap-2">
                {creator.displayName}
                <Skull className="h-4 w-4 text-red-500" />
              </h3>
              <p className="text-sm text-gray-400">@{creator.username}</p>
              {creator.bannedFrom && creator.bannedFrom.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {creator.bannedFrom.slice(0, 3).map((platform) => (
                    <Badge key={platform} variant="outline" className="text-xs border-red-500/30 text-red-400">
                      <Ban className="h-3 w-3 mr-1" />
                      {platform}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2 line-clamp-2">{creator.bio}</p>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-red-500/20">
            <span className="text-sm text-gray-400">
              <span className="font-medium text-gray-200">{creator.subscriberCount.toLocaleString()}</span> fans
            </span>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
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
          <Card key={i} className="animate-pulse bg-red-950/20 border-red-500/20">
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
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-red-500/50 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No outlawz streaming</h3>
        <p className="text-gray-500">They're laying low for now...</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="overflow-hidden bg-red-950/20 border-red-500/20 hover:border-red-500/50 transition-all cursor-pointer">
          <div className="relative aspect-video bg-gradient-to-br from-red-900/50 to-black">
            <img
              src={creator.profileImageUrl}
              alt={creator.displayName}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-red-600 animate-pulse">
              🔴 LIVE - UNCENSORED
            </Badge>
          </div>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <img
                src={creator.profileImageUrl}
                alt={creator.displayName}
                className="h-10 w-10 rounded-full ring-2 ring-red-500"
              />
              <div>
                <h3 className="font-medium text-gray-200 flex items-center gap-1">
                  {creator.displayName}
                  <Skull className="h-4 w-4 text-red-500" />
                </h3>
                <p className="text-sm text-gray-400">@{creator.username}</p>
              </div>
            </div>
            <Button className="w-full mt-3 bg-red-600 hover:bg-red-700">
              Watch Uncensored
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
