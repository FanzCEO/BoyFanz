import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Rainbow,
  HeartHandshake,
  Sparkles,
  Star,
  Filter,
  ChevronDown,
  ChevronRight,
  User,
  Calendar,
  Globe,
  Eye,
  Flame,
  Theater,
  Activity,
  Film,
  Map,
  X,
} from "lucide-react";

// Platform type for this instance
const PLATFORM_TYPE = import.meta.env.VITE_PLATFORM_TYPE || "male";

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  heart: Heart,
  rainbow: Rainbow,
  "heart-handshake": HeartHandshake,
  sparkles: Sparkles,
  star: Star,
  user: User,
  calendar: Calendar,
  globe: Globe,
  eye: Eye,
  flame: Flame,
  theater: Theater,
  activity: Activity,
  film: Film,
  map: Map,
};

interface OrientationTab {
  id: string;
  platform_type: string;
  label: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

interface Category {
  id: string;
  group_id: string;
  label: string;
  description?: string;
  platforms: string[];
  content_count: number;
}

interface CategoryGroup {
  id: string;
  label: string;
  icon: string;
  categories: Category[];
}

interface CategoryNavigationProps {
  onOrientationChange?: (orientation: string) => void;
  onCategoriesChange?: (categories: string[]) => void;
  className?: string;
}

export function CategoryNavigation({
  onOrientationChange,
  onCategoriesChange,
  className,
}: CategoryNavigationProps) {
  const [activeOrientation, setActiveOrientation] = useState<string>("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  // Fetch orientation tabs
  const { data: orientationTabs = [] } = useQuery<OrientationTab[]>({
    queryKey: ["orientation-tabs", PLATFORM_TYPE],
    queryFn: async () => {
      const res = await fetch(`/api/categories/orientations?platform=${PLATFORM_TYPE}`);
      if (!res.ok) throw new Error("Failed to fetch orientations");
      return res.json();
    },
  });

  // Fetch category groups
  const { data: categoryGroups = [] } = useQuery<CategoryGroup[]>({
    queryKey: ["category-groups", PLATFORM_TYPE],
    queryFn: async () => {
      const res = await fetch(`/api/categories/groups?platform=${PLATFORM_TYPE}`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      return res.json();
    },
  });

  const handleOrientationClick = (id: string) => {
    setActiveOrientation(id);
    onOrientationChange?.(id);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((c) => c !== categoryId)
      : [...selectedCategories, categoryId];
    setSelectedCategories(newCategories);
    onCategoriesChange?.(newCategories);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((g) => g !== groupId)
        : [...prev, groupId]
    );
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
    onCategoriesChange?.([]);
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Star;
    return IconComponent;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Orientation Tabs - Horizontal scrollable */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-sm sticky top-0 z-10">
        <ScrollArea className="w-full">
          <div className="flex items-center gap-1 p-2">
            {/* All tab */}
            <Button
              variant={activeOrientation === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => handleOrientationClick("all")}
              className={cn(
                "shrink-0 gap-2 rounded-full px-4",
                activeOrientation === "all" && "bg-primary text-primary-foreground"
              )}
            >
              <Star className="h-4 w-4" />
              All
            </Button>

            {/* Orientation tabs */}
            {orientationTabs.map((tab) => {
              const Icon = getIcon(tab.icon);
              return (
                <Button
                  key={tab.id}
                  variant={activeOrientation === tab.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleOrientationClick(tab.id)}
                  className={cn(
                    "shrink-0 gap-2 rounded-full px-4",
                    activeOrientation === tab.id &&
                      "bg-primary text-primary-foreground",
                    tab.id === "gay" || tab.id === "lesbian"
                      ? "hover:bg-rainbow-gradient"
                      : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}

            {/* Filter button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0 gap-2 rounded-full ml-auto"
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {selectedCategories.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                      {selectedCategories.length}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    <span>Filter by Category</span>
                    {selectedCategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllCategories}
                        className="text-muted-foreground"
                      >
                        Clear all
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-100px)] mt-4">
                  <div className="space-y-2 pr-4">
                    {categoryGroups.map((group) => {
                      const GroupIcon = getIcon(group.icon);
                      const isExpanded = expandedGroups.includes(group.id);
                      const selectedInGroup = group.categories.filter((c) =>
                        selectedCategories.includes(c.id)
                      ).length;

                      return (
                        <Collapsible
                          key={group.id}
                          open={isExpanded}
                          onOpenChange={() => toggleGroup(group.id)}
                        >
                          <CollapsibleTrigger className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-accent/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <GroupIcon className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium">{group.label}</span>
                              {selectedInGroup > 0 && (
                                <Badge variant="secondary" className="h-5 px-1.5">
                                  {selectedInGroup}
                                </Badge>
                              )}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="ml-8 mt-1 space-y-1 pb-2">
                              {group.categories.map((category) => (
                                <button
                                  key={category.id}
                                  onClick={() => handleCategoryToggle(category.id)}
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                    selectedCategories.includes(category.id)
                                      ? "bg-primary/20 text-primary"
                                      : "hover:bg-accent/50"
                                  )}
                                >
                                  <span>{category.label}</span>
                                  {category.content_count > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {category.content_count.toLocaleString()}
                                    </span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Selected categories chips */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border-b border-border/30">
          {selectedCategories.map((catId) => {
            const category = categoryGroups
              .flatMap((g) => g.categories)
              .find((c) => c.id === catId);
            if (!category) return null;
            return (
              <Badge
                key={catId}
                variant="secondary"
                className="gap-1 pr-1 cursor-pointer hover:bg-destructive/20"
                onClick={() => handleCategoryToggle(catId)}
              >
                {category.label}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllCategories}
            className="h-6 px-2 text-xs text-muted-foreground"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}

export default CategoryNavigation;
