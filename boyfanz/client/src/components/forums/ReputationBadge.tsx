import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Star, Award, Shield, Crown, Sparkles } from "lucide-react";

interface ReputationData {
  points: number;
  level: string;
  badges: string[];
  topicsCount: number;
  repliesCount: number;
  bestAnswersCount: number;
  likesReceivedCount: number;
}

interface ReputationBadgeProps {
  userId: string;
  compact?: boolean;
  showPoints?: boolean;
}

const levelConfig: Record<string, { color: string; icon: React.ReactNode; label: string; bgColor: string }> = {
  newcomer: {
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    icon: <Sparkles className="h-3 w-3" />,
    label: "Newcomer"
  },
  member: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    icon: <Star className="h-3 w-3" />,
    label: "Member"
  },
  active: {
    color: "text-green-400",
    bgColor: "bg-green-500/20",
    icon: <Award className="h-3 w-3" />,
    label: "Active"
  },
  trusted: {
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
    icon: <Shield className="h-3 w-3" />,
    label: "Trusted"
  },
  expert: {
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
    icon: <Crown className="h-3 w-3" />,
    label: "Expert"
  }
};

export function ReputationBadge({ userId, compact = false, showPoints = false }: ReputationBadgeProps) {
  const { data: reputation } = useQuery<ReputationData>({
    queryKey: [`/api/forums/reputation/${userId}`],
    enabled: !!userId,
    staleTime: 60000, // Cache for 1 minute
  });

  if (!reputation) {
    return null;
  }

  const config = levelConfig[reputation.level] || levelConfig.newcomer;

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 gap-1 text-xs px-1.5 py-0.5`}>
              {config.icon}
              {showPoints && <span>{reputation.points}</span>}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold">{config.label}</p>
              <p className="text-xs text-muted-foreground">{reputation.points} points</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`${config.bgColor} ${config.color} border-0 gap-1`}>
            {config.icon}
            <span>{config.label}</span>
            {showPoints && <span className="text-xs opacity-75">({reputation.points})</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="w-48">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">{config.label}</span>
              <span className={config.color}>{reputation.points} pts</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>Topics: {reputation.topicsCount}</div>
              <div>Replies: {reputation.repliesCount}</div>
              <div>Best Answers: {reputation.bestAnswersCount}</div>
              <div>Likes: {reputation.likesReceivedCount}</div>
            </div>
            {reputation.badges && reputation.badges.length > 0 && (
              <div className="pt-1 border-t">
                <p className="text-xs font-medium mb-1">Badges</p>
                <div className="flex flex-wrap gap-1">
                  {reputation.badges.map((badge: string) => (
                    <Badge key={badge} variant="secondary" className="text-xs px-1.5 py-0">
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ReputationCard({ userId }: { userId: string }) {
  const { data: reputation, isLoading } = useQuery<ReputationData>({
    queryKey: [`/api/forums/reputation/${userId}`],
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-8 bg-muted rounded" />
      </div>
    );
  }

  if (!reputation) {
    return null;
  }

  const config = levelConfig[reputation.level] || levelConfig.newcomer;

  // Calculate progress to next level
  const levelThresholds = [0, 51, 201, 501, 1001];
  const levelNames = ['newcomer', 'member', 'active', 'trusted', 'expert'];
  const currentIndex = levelNames.indexOf(reputation.level);
  const currentThreshold = levelThresholds[currentIndex] || 0;
  const nextThreshold = levelThresholds[currentIndex + 1] || reputation.points;
  const progressToNext = currentIndex < 4
    ? ((reputation.points - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 100;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg ${config.bgColor}`}>
            <div className={config.color}>{config.icon}</div>
          </div>
          <div>
            <p className={`font-semibold ${config.color}`}>{config.label}</p>
            <p className="text-xs text-muted-foreground">{reputation.points} points</p>
          </div>
        </div>
      </div>

      {/* Progress bar to next level */}
      {currentIndex < 4 && (
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>{currentThreshold} pts</span>
            <span>{nextThreshold} pts</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${config.bgColor.replace('/20', '')} transition-all duration-500`}
              style={{ width: `${Math.min(100, progressToNext)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1 text-center">
            {nextThreshold - reputation.points} points to {levelNames[currentIndex + 1]}
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold">{reputation.topicsCount}</p>
          <p className="text-xs text-muted-foreground">Topics</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold">{reputation.repliesCount}</p>
          <p className="text-xs text-muted-foreground">Replies</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold">{reputation.bestAnswersCount}</p>
          <p className="text-xs text-muted-foreground">Best Answers</p>
        </div>
        <div className="p-2 bg-muted/50 rounded-lg">
          <p className="text-lg font-bold">{reputation.likesReceivedCount}</p>
          <p className="text-xs text-muted-foreground">Likes</p>
        </div>
      </div>

      {/* Badges */}
      {reputation.badges && reputation.badges.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Badges</p>
          <div className="flex flex-wrap gap-1">
            {reputation.badges.map((badge: string) => (
              <Badge key={badge} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
