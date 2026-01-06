import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Check, Users, Star, Sparkles } from "lucide-react";

interface Platform {
  id: string;
  name: string;
  domain: string;
  color: string;
  description: string;
  category: 'male' | 'female' | 'trans' | 'niche';
  logoUrl?: string;
}

const PLATFORMS: Platform[] = [
  { id: 'boyfanz', name: 'BoyFanz', domain: 'boy.fanz.website', color: '#6366f1', description: 'Premium male content creators', category: 'male' },
  { id: 'girlfanz', name: 'GirlFanz', domain: 'girl.fanz.website', color: '#ec4899', description: 'Premium female content creators', category: 'female' },
  { id: 'gayfanz', name: 'GayFanz', domain: 'gay.fanz.website', color: '#f472b6', description: 'LGBTQ+ male creators', category: 'male' },
  { id: 'transfanz', name: 'TransFanz', domain: 'trans.fanz.website', color: '#14b8a6', description: 'Trans & non-binary creators', category: 'trans' },
  { id: 'bearfanz', name: 'BearFanz', domain: 'bear.fanz.website', color: '#78716c', description: 'Bear community creators', category: 'male' },
  { id: 'daddyfanz', name: 'DaddyFanz', domain: 'daddy.fanz.website', color: '#1e40af', description: 'Mature male creators', category: 'male' },
  { id: 'pupfanz', name: 'PupFanz', domain: 'pup.fanz.website', color: '#059669', description: 'Pet play community', category: 'niche' },
  { id: 'milffanz', name: 'MILFFanz', domain: 'milf.fanz.website', color: '#be185d', description: 'Mature female creators', category: 'female' },
  { id: 'cougarfanz', name: 'CougarFanz', domain: 'cougar.fanz.website', color: '#b45309', description: 'Sophisticated female creators', category: 'female' },
  { id: 'femmefanz', name: 'FemmeFanz', domain: 'femme.fanz.website', color: '#a855f7', description: 'Feminine creators showcase', category: 'female' },
  { id: 'taboofanz', name: 'TabooFanz', domain: 'taboo.fanz.website', color: '#7c3aed', description: 'Taboo fantasy content', category: 'niche' },
  { id: 'fanzuncut', name: 'FanzUncut', domain: 'uncut.fanz.website', color: '#dc2626', description: 'Unfiltered content', category: 'niche' },
  { id: 'brofanz', name: 'BroFanz', domain: 'bro.fanz.website', color: '#3b82f6', description: 'Fraternity style content', category: 'male' },
  { id: 'southernfanz', name: 'SouthernFanz', domain: 'southern.fanz.website', color: '#d97706', description: 'Southern charm creators', category: 'niche' },
  { id: 'dlbroz', name: 'DL Broz', domain: 'dlbroz.fanz.website', color: '#1f2937', description: 'Discreet creators', category: 'male' },
  { id: 'guyz', name: 'Guyz', domain: 'guyz.fanz.website', color: '#0ea5e9', description: 'Urban male creators', category: 'male' },
];

interface PlatformSelectionProps {
  selectedPlatforms: string[];
  onSelectionChange: (platforms: string[]) => void;
  showCategories?: boolean;
  className?: string;
}

export function PlatformSelection({
  selectedPlatforms,
  onSelectionChange,
  showCategories = true,
  className,
}: PlatformSelectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      onSelectionChange(selectedPlatforms.filter(id => id !== platformId));
    } else {
      onSelectionChange([...selectedPlatforms, platformId]);
    }
  };

  const selectAll = () => {
    onSelectionChange(PLATFORMS.map(p => p.id));
  };

  const selectNone = () => {
    onSelectionChange([]);
  };

  const selectCategory = (category: string) => {
    const categoryPlatforms = PLATFORMS.filter(p => p.category === category).map(p => p.id);
    const currentlySelected = selectedPlatforms.filter(id =>
      !categoryPlatforms.includes(id)
    );
    onSelectionChange([...currentlySelected, ...categoryPlatforms]);
  };

  const filteredPlatforms = activeCategory === 'all'
    ? PLATFORMS
    : PLATFORMS.filter(p => p.category === activeCategory);

  const categoryCounts = {
    all: PLATFORMS.length,
    male: PLATFORMS.filter(p => p.category === 'male').length,
    female: PLATFORMS.filter(p => p.category === 'female').length,
    trans: PLATFORMS.filter(p => p.category === 'trans').length,
    niche: PLATFORMS.filter(p => p.category === 'niche').length,
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Choose Your Platforms</h3>
          <p className="text-sm text-muted-foreground">
            Select which Fanz platforms you want to join ({selectedPlatforms.length} selected)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={selectAll}>
            Select All
          </Button>
          <Button variant="outline" size="sm" onClick={selectNone}>
            Clear
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      {showCategories && (
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all" className="text-xs sm:text-sm">
              All ({categoryCounts.all})
            </TabsTrigger>
            <TabsTrigger value="male" className="text-xs sm:text-sm">
              Male ({categoryCounts.male})
            </TabsTrigger>
            <TabsTrigger value="female" className="text-xs sm:text-sm">
              Female ({categoryCounts.female})
            </TabsTrigger>
            <TabsTrigger value="trans" className="text-xs sm:text-sm">
              Trans ({categoryCounts.trans})
            </TabsTrigger>
            <TabsTrigger value="niche" className="text-xs sm:text-sm">
              Niche ({categoryCounts.niche})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Quick category select buttons */}
      {activeCategory !== 'all' && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => selectCategory(activeCategory)}
          className="w-full"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Select all {activeCategory} platforms
        </Button>
      )}

      {/* Platform grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredPlatforms.map((platform) => {
          const isSelected = selectedPlatforms.includes(platform.id);
          return (
            <Card
              key={platform.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                isSelected && "ring-2 ring-offset-2",
                isSelected && "shadow-md"
              )}
              style={{
                borderColor: isSelected ? platform.color : undefined,
                ringColor: isSelected ? platform.color : undefined,
              }}
              onClick={() => togglePlatform(platform.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={platform.logoUrl} alt={platform.name} />
                      <AvatarFallback
                        style={{ backgroundColor: platform.color }}
                        className="text-white font-bold"
                      >
                        {platform.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {isSelected && (
                      <div
                        className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: platform.color }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold truncate">{platform.name}</h4>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {platform.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {platform.description}
                    </p>
                  </div>
                  <Checkbox
                    checked={isSelected}
                    onClick={(e) => e.stopPropagation()}
                    onCheckedChange={() => togglePlatform(platform.id)}
                    className="shrink-0"
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {selectedPlatforms.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium">
                  {selectedPlatforms.length} platform{selectedPlatforms.length !== 1 ? 's' : ''} selected
                </p>
                <p className="text-sm text-muted-foreground">
                  Your profile will be created on these platforms
                </p>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedPlatforms.slice(0, 5).map((platformId) => {
                  const platform = PLATFORMS.find(p => p.id === platformId);
                  if (!platform) return null;
                  return (
                    <Avatar key={platformId} className="h-6 w-6">
                      <AvatarFallback
                        style={{ backgroundColor: platform.color }}
                        className="text-white text-[10px]"
                      >
                        {platform.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
                {selectedPlatforms.length > 5 && (
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] bg-muted">
                      +{selectedPlatforms.length - 5}
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default PlatformSelection;
