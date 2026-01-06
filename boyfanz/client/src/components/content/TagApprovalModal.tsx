import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";
import {
  Check,
  X,
  Image,
  Video,
  Eye,
  Share2,
  Globe,
  Lock,
  ExternalLink,
} from "lucide-react";

interface Platform {
  id: string;
  name: string;
  color: string;
}

interface TagApproval {
  id: string;
  tagId: string;
  contentId: string;
  sourcePlatformId: string;
  contentPreview?: {
    type: 'image' | 'video';
    thumbnailUrl?: string;
    title?: string;
  };
  taggerInfo?: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

const PLATFORMS: Platform[] = [
  { id: 'boyfanz', name: 'BoyFanz', color: '#6366f1' },
  { id: 'girlfanz', name: 'GirlFanz', color: '#ec4899' },
  { id: 'gayfanz', name: 'GayFanz', color: '#f472b6' },
  { id: 'transfanz', name: 'TransFanz', color: '#14b8a6' },
  { id: 'bearfanz', name: 'BearFanz', color: '#78716c' },
  { id: 'daddyfanz', name: 'DaddyFanz', color: '#1e40af' },
  { id: 'pupfanz', name: 'PupFanz', color: '#059669' },
  { id: 'milffanz', name: 'MILFFanz', color: '#be185d' },
  { id: 'cougarfanz', name: 'CougarFanz', color: '#b45309' },
  { id: 'femmefanz', name: 'FemmeFanz', color: '#a855f7' },
  { id: 'taboofanz', name: 'TabooFanz', color: '#7c3aed' },
  { id: 'fanzuncut', name: 'FanzUncut', color: '#dc2626' },
  { id: 'brofanz', name: 'BroFanz', color: '#3b82f6' },
  { id: 'southernfanz', name: 'SouthernFanz', color: '#d97706' },
  { id: 'dlbroz', name: 'DL Broz', color: '#1f2937' },
  { id: 'guyz', name: 'Guyz', color: '#0ea5e9' },
];

interface TagApprovalModalProps {
  tagApproval: TagApproval;
  userPlatforms: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved?: () => void;
  onRejected?: () => void;
}

export function TagApprovalModal({
  tagApproval,
  userPlatforms,
  open,
  onOpenChange,
  onApproved,
  onRejected,
}: TagApprovalModalProps) {
  const queryClient = useQueryClient();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([tagApproval.sourcePlatformId]);
  const [showOnProfile, setShowOnProfile] = useState(true);
  const [showInFeed, setShowInFeed] = useState(true);

  // Get platforms user has access to
  const availablePlatforms = PLATFORMS.filter(p => userPlatforms.includes(p.id));

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/tags/approve', {
        tagDisplayId: tagApproval.id,
        displayPlatforms: selectedPlatforms,
        displaySettings: {
          showOnProfile,
          showInFeed,
        },
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags/pending'] });
      onOpenChange(false);
      onApproved?.();
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/tags/reject', {
        tagDisplayId: tagApproval.id,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tags/pending'] });
      onOpenChange(false);
      onRejected?.();
    },
  });

  const togglePlatform = (platformId: string) => {
    if (selectedPlatforms.includes(platformId)) {
      setSelectedPlatforms(selectedPlatforms.filter(id => id !== platformId));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platformId]);
    }
  };

  const selectAllPlatforms = () => {
    setSelectedPlatforms(availablePlatforms.map(p => p.id));
  };

  const sourcePlatform = PLATFORMS.find(p => p.id === tagApproval.sourcePlatformId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            You've Been Tagged!
          </DialogTitle>
          <DialogDescription>
            Choose where you'd like this content to appear on your profiles
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                {tagApproval.contentPreview?.thumbnailUrl ? (
                  <div className="relative h-20 w-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={tagApproval.contentPreview.thumbnailUrl}
                      alt="Content preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-1 right-1">
                      {tagApproval.contentPreview.type === 'video' ? (
                        <Video className="h-4 w-4 text-white drop-shadow-lg" />
                      ) : (
                        <Image className="h-4 w-4 text-white drop-shadow-lg" />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Image className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-2">
                    {tagApproval.contentPreview?.title || 'Content'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={tagApproval.taggerInfo?.avatarUrl} />
                      <AvatarFallback className="text-xs">
                        {tagApproval.taggerInfo?.displayName?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      Tagged by @{tagApproval.taggerInfo?.username || 'unknown'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-xs"
                      style={{ borderColor: sourcePlatform?.color }}
                    >
                      {sourcePlatform?.name || tagApproval.sourcePlatformId}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Display Settings</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-profile" className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Show on my profile
              </Label>
              <Switch
                id="show-profile"
                checked={showOnProfile}
                onCheckedChange={setShowOnProfile}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="show-feed" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                Show in my feed
              </Label>
              <Switch
                id="show-feed"
                checked={showInFeed}
                onCheckedChange={setShowInFeed}
              />
            </div>
          </div>

          <Separator />

          {/* Platform Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Display on these platforms</h4>
              <Button variant="ghost" size="sm" onClick={selectAllPlatforms}>
                Select all
              </Button>
            </div>
            <ScrollArea className="h-48">
              <div className="grid grid-cols-2 gap-2">
                {availablePlatforms.map((platform) => {
                  const isSelected = selectedPlatforms.includes(platform.id);
                  const isSource = platform.id === tagApproval.sourcePlatformId;
                  return (
                    <div
                      key={platform.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all",
                        isSelected && "border-primary bg-primary/5",
                        !isSelected && "border-border hover:border-muted-foreground"
                      )}
                      onClick={() => togglePlatform(platform.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePlatform(platform.id)}
                      />
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          style={{ backgroundColor: platform.color }}
                          className="text-white text-[10px]"
                        >
                          {platform.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm flex-1">{platform.name}</span>
                      {isSource && (
                        <Badge variant="secondary" className="text-[10px]">
                          Source
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {selectedPlatforms.length === 0 && (
            <p className="text-sm text-amber-600 text-center">
              Select at least one platform to display this content
            </p>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => rejectMutation.mutate()}
            disabled={rejectMutation.isPending || approveMutation.isPending}
            className="flex-1 sm:flex-none"
          >
            <X className="h-4 w-4 mr-2" />
            Decline
          </Button>
          <Button
            onClick={() => approveMutation.mutate()}
            disabled={
              selectedPlatforms.length === 0 ||
              approveMutation.isPending ||
              rejectMutation.isPending
            }
            className="flex-1 sm:flex-none"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve {selectedPlatforms.length > 0 && `(${selectedPlatforms.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default TagApprovalModal;
