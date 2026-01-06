import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import {
  Rainbow,
  Heart,
  Video,
  Image,
  Users,
  TrendingUp,
  Sparkles,
  Filter,
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
}

export default function GayTab() {
  const [activeTab, setActiveTab] = useState("trending");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Fetch gay-specific creators
  const { data: creators = [], isLoading: creatorsLoading } = useQuery<Creator[]>({
    queryKey: ["gay-creators", selectedCategories],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("orientation", "gay");
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      }
      const res = await fetch(`/api/creators/discover?${params}`);
      if (!res.ok) throw new Error("Failed to fetch creators");
      return res.json();
    },
  });

  // Fetch gay-specific content
  const { data: content = [], isLoading: contentLoading } = useQuery<ContentItem[]>({
    queryKey: ["gay-content", activeTab, selectedCategories],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.set("orientation", "gay");
      params.set("sort", activeTab);
      if (selectedCategories.length > 0) {
        params.set("categories", selectedCategories.join(","));
      }
      const res = await fetch(`/api/content/feed?${params}`);
      if (!res.ok) throw new Error("Failed to fetch content");
      return res.json();
    },
  });

  return (
    <div className="min-h-screen">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-lg mb-6">
        <div className="absolute inset-0 bg-black/20 rounded-lg" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
            <Rainbow className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              Gay
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Pride
              </Badge>
            </h1>
            <p className="text-white/80 mt-1">
              Discover amazing gay creators and exclusive content
            </p>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <CategoryNavigation
        onOrientationChange={() => {}}
        onCategoriesChange={setSelectedCategories}
        className="mb-6"
      />

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="newest" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Newest
          </TabsTrigger>
          <TabsTrigger value="live" className="gap-2">
            <Video className="h-4 w-4" />
            Live Now
          </TabsTrigger>
          <TabsTrigger value="creators" className="gap-2">
            <Users className="h-4 w-4" />
            Creators
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
          <CreatorsGrid creators={creators} isLoading={creatorsLoading} />
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
          <Card key={i} className="animate-pulse">
            <div className="aspect-[9/16] bg-muted rounded-t-lg" />
            <CardContent className="p-3">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (content.length === 0) {
    return (
      <div className="text-center py-12">
        <Rainbow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No content yet</h3>
        <p className="text-muted-foreground">Check back soon for new uploads!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {content.map((item) => (
        <Card key={item.id} className="group cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all">
          <div className="relative aspect-[9/16] overflow-hidden rounded-t-lg">
            <img
              src={item.thumbnailUrl}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            {item.isLocked && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="secondary">Premium</Badge>
              </div>
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
            <p className="font-medium text-sm truncate">{item.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <img
                src={item.creatorProfileImage}
                alt={item.creatorUsername}
                className="h-5 w-5 rounded-full"
              />
              <span className="text-xs text-muted-foreground">@{item.creatorUsername}</span>
            </div>
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
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

function CreatorsGrid({ creators, isLoading }: { creators: Creator[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse p-4">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-3" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto mb-2" />
            <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
          </Card>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No creators found</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="p-4 text-center hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer">
          <div className="relative inline-block">
            <img
              src={creator.profileImageUrl}
              alt={creator.displayName}
              className="h-20 w-20 rounded-full mx-auto object-cover ring-2 ring-primary/20"
            />
            {creator.isLive && (
              <Badge className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-500">
                LIVE
              </Badge>
            )}
          </div>
          <h3 className="font-medium mt-3 flex items-center justify-center gap-1">
            {creator.displayName}
            {creator.isVerified && (
              <Badge variant="secondary" className="h-4 px-1">✓</Badge>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">@{creator.username}</p>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{creator.bio}</p>
          <p className="text-xs mt-2">
            <span className="font-medium">{creator.subscriberCount.toLocaleString()}</span> subscribers
          </p>
          <Button size="sm" className="mt-3 w-full">Subscribe</Button>
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
          <Card key={i} className="animate-pulse">
            <div className="aspect-video bg-muted rounded-t-lg" />
            <CardContent className="p-4">
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (creators.length === 0) {
    return (
      <div className="text-center py-12">
        <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No one is live right now</h3>
        <p className="text-muted-foreground">Check back later or explore other content</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {creators.map((creator) => (
        <Card key={creator.id} className="overflow-hidden hover:ring-2 hover:ring-red-500/50 transition-all cursor-pointer">
          <div className="relative aspect-video bg-gradient-to-br from-red-500/20 to-pink-500/20">
            <img
              src={creator.profileImageUrl}
              alt={creator.displayName}
              className="w-full h-full object-cover"
            />
            <Badge className="absolute top-2 left-2 bg-red-500 animate-pulse">
              🔴 LIVE
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
                <h3 className="font-medium">{creator.displayName}</h3>
                <p className="text-sm text-muted-foreground">@{creator.username}</p>
              </div>
            </div>
            <Button className="w-full mt-3 bg-red-500 hover:bg-red-600">
              Watch Live
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
