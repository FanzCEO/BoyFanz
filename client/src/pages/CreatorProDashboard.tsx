import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  Crown,
  Star,
  Trophy,
  Award,
  Users,
  FileVideo,
  Shield,
  UserPlus,
  Network,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Copy,
  Share2,
  Flame,
  Zap,
  Target,
  ArrowUp,
  ArrowDown,
  Medal,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Tier configuration with colors and icons
const TIER_CONFIG: Record<string, { color: string; bgColor: string; icon: any; gradient: string }> = {
  rising: {
    color: "text-gray-400",
    bgColor: "bg-gray-900/50",
    icon: TrendingUp,
    gradient: "from-gray-600 to-gray-800",
  },
  established: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-900/30",
    icon: CheckCircle,
    gradient: "from-emerald-600 to-emerald-800",
  },
  pro: {
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
    icon: Star,
    gradient: "from-blue-600 to-blue-800",
  },
  elite: {
    color: "text-purple-400",
    bgColor: "bg-purple-900/30",
    icon: Crown,
    gradient: "from-purple-600 to-purple-800",
  },
  legend: {
    color: "text-amber-400",
    bgColor: "bg-amber-900/30",
    icon: Trophy,
    gradient: "from-amber-500 to-orange-600",
  },
};

// Achievement tier badges
const ACHIEVEMENT_TIERS: Record<string, { color: string; bgColor: string }> = {
  bronze: { color: "text-orange-700", bgColor: "bg-orange-900/30" },
  silver: { color: "text-gray-300", bgColor: "bg-gray-700/30" },
  gold: { color: "text-yellow-400", bgColor: "bg-yellow-900/30" },
  platinum: { color: "text-cyan-300", bgColor: "bg-cyan-900/30" },
  diamond: { color: "text-blue-300", bgColor: "bg-blue-800/30" },
};

interface CreatorProStatus {
  userId: string;
  currentTier: string;
  totalScore: number;
  tierProgress: number;
  nextTier: string | null;
  pointsToNextTier: number;
  metrics: {
    fanMetrics: {
      fanCount: number;
      fanCountScore: number;
      retentionRate: number;
      retentionScore: number;
      engagementRate: number;
      engagementScore: number;
      totalScore: number;
    };
    contentMetrics: {
      totalUploads: number;
      quantityScore: number;
      averageQuality: number;
      qualityScore: number;
      consistencyDays: number;
      consistencyScore: number;
      totalScore: number;
    };
    complianceMetrics: {
      totalStrikes: number;
      activeStrikes: number;
      daysWithoutStrike: number;
      complianceScore: number;
    };
    referralMetrics: {
      totalReferrals: number;
      activeReferrals: number;
      referralScore: number;
    };
    networkingMetrics: {
      collaborations: number;
      interactions: number;
      contributions: number;
      networkingScore: number;
    };
  };
  achievements: Array<{
    id: string;
    name: string;
    icon: string;
    tier: string;
    completedAt: Date | null;
  }>;
  tierHistory: Array<{
    tier: string;
    achievedAt: Date;
    reason: string;
  }>;
}

interface Strike {
  id: string;
  strikeType: string;
  severity: string;
  reason: string;
  pointsDeducted: number;
  isActive: boolean;
  appealStatus: string | null;
  createdAt: string;
}

export default function CreatorProDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedStrike, setSelectedStrike] = useState<Strike | null>(null);
  const [appealReason, setAppealReason] = useState("");

  // Fetch pro status
  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<CreatorProStatus>({
    queryKey: ["/api/creator-pro/status"],
  });

  // Fetch tier info
  const { data: tiers } = useQuery({
    queryKey: ["/api/creator-pro/tiers"],
  });

  // Fetch scoring info
  const { data: scoringInfo } = useQuery({
    queryKey: ["/api/creator-pro/scoring"],
  });

  // Fetch strikes
  const { data: strikes } = useQuery<Strike[]>({
    queryKey: ["/api/creator-pro/strikes"],
  });

  // Recalculate mutation
  const recalculateMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/creator-pro/recalculate"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator-pro/status"] });
      toast({ title: "Metrics recalculated", description: "Your Creator Pro status has been updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to recalculate metrics.", variant: "destructive" });
    },
  });

  // Generate referral code
  const referralCodeMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/creator-pro/referral-code"),
    onSuccess: (data: any) => {
      navigator.clipboard.writeText(data.url);
      toast({ title: "Referral link copied!", description: data.url });
    },
  });

  // Appeal mutation
  const appealMutation = useMutation({
    mutationFn: ({ strikeId, reason }: { strikeId: string; reason: string }) =>
      apiRequest("POST", `/api/creator-pro/strikes/${strikeId}/appeal`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/creator-pro/strikes"] });
      setSelectedStrike(null);
      setAppealReason("");
      toast({ title: "Appeal submitted", description: "Your appeal is under review." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit appeal.", variant: "destructive" });
    },
  });

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  const tierConfig = status ? TIER_CONFIG[status.currentTier] : TIER_CONFIG.rising;
  const TierIcon = tierConfig.icon;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold neon-crimson-heading flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" />
              Creator Pro Status
            </h1>
            <p className="text-muted-foreground mt-1">
              Earn your status through performance - no fees, purely merit-based
            </p>
          </div>
          <Button
            onClick={() => recalculateMutation.mutate()}
            disabled={recalculateMutation.isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${recalculateMutation.isPending ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </Button>
        </div>

        {/* Current Tier Card */}
        {status && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden"
          >
            <Card className={`${tierConfig.bgColor} border-2 border-${tierConfig.color.replace('text-', '')}/30`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${tierConfig.gradient} opacity-10`} />
              <CardContent className="relative p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  {/* Tier Badge */}
                  <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${tierConfig.gradient} flex items-center justify-center shadow-lg`}>
                    <TierIcon className="h-12 w-12 text-white" />
                  </div>

                  {/* Tier Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className={`text-3xl font-bold capitalize ${tierConfig.color}`}>
                        {status.currentTier}
                      </h2>
                      <Badge className={tierConfig.bgColor}>
                        {status.totalScore} / 1000 Points
                      </Badge>
                    </div>

                    {/* Progress to next tier */}
                    {status.nextTier && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progress to {status.nextTier}
                          </span>
                          <span className={tierConfig.color}>
                            {status.pointsToNextTier} points needed
                          </span>
                        </div>
                        <Progress value={status.tierProgress} className="h-3" />
                      </div>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-background/50">
                      <div className="text-2xl font-bold text-primary">{status.metrics.fanMetrics.fanCount}</div>
                      <div className="text-xs text-muted-foreground">Total Fans</div>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50">
                      <div className="text-2xl font-bold text-primary">{status.metrics.contentMetrics.totalUploads}</div>
                      <div className="text-xs text-muted-foreground">Content</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Metrics Breakdown */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="strikes">Compliance</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="tiers">Tier Guide</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {status && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Fan Metrics */}
                <Card className="bg-card/50 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Users className="h-5 w-5 text-primary" />
                      Fan Metrics
                      <Badge variant="outline" className="ml-auto">
                        {status.metrics.fanMetrics.totalScore}/250
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Fan Count</span>
                      <span className="font-medium">
                        {status.metrics.fanMetrics.fanCount}
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.fanMetrics.fanCountScore} pts)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Retention Rate</span>
                      <span className="font-medium">
                        {status.metrics.fanMetrics.retentionRate}%
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.fanMetrics.retentionScore} pts)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Engagement</span>
                      <span className="font-medium">
                        {status.metrics.fanMetrics.engagementRate}%
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.fanMetrics.engagementScore} pts)
                        </span>
                      </span>
                    </div>
                    <Progress value={(status.metrics.fanMetrics.totalScore / 250) * 100} className="h-2" />
                  </CardContent>
                </Card>

                {/* Content Metrics */}
                <Card className="bg-card/50 border-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <FileVideo className="h-5 w-5 text-secondary" />
                      Content Metrics
                      <Badge variant="outline" className="ml-auto">
                        {status.metrics.contentMetrics.totalScore}/250
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Uploads</span>
                      <span className="font-medium">
                        {status.metrics.contentMetrics.totalUploads}
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.contentMetrics.quantityScore} pts)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg Quality</span>
                      <span className="font-medium">
                        {status.metrics.contentMetrics.averageQuality}/100
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.contentMetrics.qualityScore} pts)
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Posting Streak</span>
                      <span className="font-medium">
                        {status.metrics.contentMetrics.consistencyDays} days
                        <span className="text-xs text-muted-foreground ml-1">
                          (+{status.metrics.contentMetrics.consistencyScore} pts)
                        </span>
                      </span>
                    </div>
                    <Progress value={(status.metrics.contentMetrics.totalScore / 250) * 100} className="h-2" />
                  </CardContent>
                </Card>

                {/* Compliance Metrics */}
                <Card className="bg-card/50 border-emerald-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      Compliance
                      <Badge variant="outline" className="ml-auto">
                        {status.metrics.complianceMetrics.complianceScore}/200
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active Strikes</span>
                      <span className={`font-medium ${status.metrics.complianceMetrics.activeStrikes > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                        {status.metrics.complianceMetrics.activeStrikes}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Days Clean</span>
                      <span className="font-medium text-emerald-500">
                        {status.metrics.complianceMetrics.daysWithoutStrike}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Score</span>
                      <span className="font-medium">
                        {status.metrics.complianceMetrics.complianceScore} pts
                      </span>
                    </div>
                    <Progress value={(status.metrics.complianceMetrics.complianceScore / 200) * 100} className="h-2" />
                  </CardContent>
                </Card>

                {/* Referral Metrics */}
                <Card className="bg-card/50 border-amber-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <UserPlus className="h-5 w-5 text-amber-500" />
                      Referrals
                      <Badge variant="outline" className="ml-auto">
                        {status.metrics.referralMetrics.referralScore}/150
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Referrals</span>
                      <span className="font-medium">{status.metrics.referralMetrics.totalReferrals}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Active</span>
                      <span className="font-medium text-amber-500">{status.metrics.referralMetrics.activeReferrals}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full mt-2"
                      onClick={() => referralCodeMutation.mutate()}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Get Referral Link
                    </Button>
                    <Progress value={(status.metrics.referralMetrics.referralScore / 150) * 100} className="h-2" />
                  </CardContent>
                </Card>

                {/* Networking Metrics */}
                <Card className="bg-card/50 border-purple-500/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Network className="h-5 w-5 text-purple-500" />
                      Networking
                      <Badge variant="outline" className="ml-auto">
                        {status.metrics.networkingMetrics.networkingScore}/150
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Collaborations</span>
                      <span className="font-medium">{status.metrics.networkingMetrics.collaborations}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Interactions</span>
                      <span className="font-medium">{status.metrics.networkingMetrics.interactions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Contributions</span>
                      <span className="font-medium">{status.metrics.networkingMetrics.contributions}</span>
                    </div>
                    <Progress value={(status.metrics.networkingMetrics.networkingScore / 150) * 100} className="h-2" />
                  </CardContent>
                </Card>

                {/* Score Breakdown */}
                <Card className="bg-card/50 border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {[
                        { label: "Fans", score: status.metrics.fanMetrics.totalScore, max: 250, color: "bg-primary" },
                        { label: "Content", score: status.metrics.contentMetrics.totalScore, max: 250, color: "bg-secondary" },
                        { label: "Compliance", score: status.metrics.complianceMetrics.complianceScore, max: 200, color: "bg-emerald-500" },
                        { label: "Referrals", score: status.metrics.referralMetrics.referralScore, max: 150, color: "bg-amber-500" },
                        { label: "Network", score: status.metrics.networkingMetrics.networkingScore, max: 150, color: "bg-purple-500" },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-20">{item.label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${item.color} transition-all`}
                              style={{ width: `${(item.score / item.max) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium w-16 text-right">
                            {item.score}/{item.max}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Your Achievements
                </CardTitle>
                <CardDescription>
                  Badges earned through your performance and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {status?.achievements.map((achievement) => {
                    const tierStyle = ACHIEVEMENT_TIERS[achievement.tier] || ACHIEVEMENT_TIERS.bronze;
                    return (
                      <motion.div
                        key={achievement.id}
                        whileHover={{ scale: 1.05 }}
                        className={`p-4 rounded-lg ${tierStyle.bgColor} border border-${tierStyle.color.replace('text-', '')}/30 text-center`}
                      >
                        <div className={`w-12 h-12 mx-auto rounded-full ${tierStyle.bgColor} flex items-center justify-center mb-2`}>
                          <Medal className={`h-6 w-6 ${tierStyle.color}`} />
                        </div>
                        <h4 className="font-medium text-sm">{achievement.name}</h4>
                        <Badge variant="outline" className={`text-xs mt-1 ${tierStyle.color}`}>
                          {achievement.tier}
                        </Badge>
                      </motion.div>
                    );
                  })}
                  {(!status?.achievements || status.achievements.length === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      <Lock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No achievements yet. Keep creating to unlock badges!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Strikes/Compliance Tab */}
          <TabsContent value="strikes">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-500" />
                  Compliance History
                </CardTitle>
                <CardDescription>
                  Policy violations and appeals - maintain good standing to maximize your score
                </CardDescription>
              </CardHeader>
              <CardContent>
                {strikes && strikes.length > 0 ? (
                  <div className="space-y-4">
                    {strikes.map((strike) => (
                      <div
                        key={strike.id}
                        className={`p-4 rounded-lg border ${
                          strike.isActive ? 'border-red-500/30 bg-red-900/10' : 'border-muted bg-muted/10'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-full ${
                              strike.isActive ? 'bg-red-900/30' : 'bg-muted'
                            }`}>
                              <AlertTriangle className={`h-5 w-5 ${
                                strike.isActive ? 'text-red-500' : 'text-muted-foreground'
                              }`} />
                            </div>
                            <div>
                              <h4 className="font-medium capitalize">
                                {strike.strikeType.replace(/_/g, ' ')}
                              </h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {strike.reason}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={strike.severity === 'warning' ? 'secondary' : 'destructive'}>
                                  {strike.severity}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  -{strike.pointsDeducted} points
                                </span>
                                {strike.appealStatus && (
                                  <Badge variant="outline" className="capitalize">
                                    Appeal: {strike.appealStatus}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          {strike.isActive && !strike.appealStatus && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedStrike(strike)}
                                >
                                  Appeal
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Appeal Strike</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="p-4 bg-muted rounded-lg">
                                    <p className="font-medium capitalize">
                                      {strike.strikeType.replace(/_/g, ' ')}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {strike.reason}
                                    </p>
                                  </div>
                                  <Textarea
                                    placeholder="Explain why this strike should be reversed..."
                                    value={appealReason}
                                    onChange={(e) => setAppealReason(e.target.value)}
                                    rows={4}
                                  />
                                  <Button
                                    className="w-full"
                                    onClick={() => appealMutation.mutate({
                                      strikeId: strike.id,
                                      reason: appealReason,
                                    })}
                                    disabled={appealReason.length < 10 || appealMutation.isPending}
                                  >
                                    Submit Appeal
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
                    <h4 className="font-medium text-lg">Perfect Record!</h4>
                    <p className="text-muted-foreground">
                      You have no strikes. Keep up the great work!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Referrals Tab */}
          <TabsContent value="referrals">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-amber-500" />
                    Referral Program
                  </CardTitle>
                  <CardDescription>
                    Earn points by referring creators and fans to the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-500/30">
                    <h4 className="font-medium text-amber-400 mb-2">Earning Points</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• 10 points per active creator referral</li>
                      <li>• 3 points per active fan referral</li>
                      <li>• Bonus points when referrals stay active</li>
                    </ul>
                  </div>

                  <Button
                    className="w-full gap-2"
                    onClick={() => referralCodeMutation.mutate()}
                    disabled={referralCodeMutation.isPending}
                  >
                    <Share2 className="h-4 w-4" />
                    Generate Referral Link
                  </Button>

                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <div className="text-3xl font-bold text-primary">
                      {status?.metrics.referralMetrics.activeReferrals || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Referrals</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle>Referral Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold">
                        {status?.metrics.referralMetrics.totalReferrals || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Invited</div>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg text-center">
                      <div className="text-2xl font-bold text-amber-500">
                        {status?.metrics.referralMetrics.referralScore || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">Points Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tiers Guide Tab */}
          <TabsContent value="tiers">
            <Card className="bg-card/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Tier Guide
                </CardTitle>
                <CardDescription>
                  Understand the requirements and benefits of each Creator Pro tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(tiers as any[])?.map((tier: any) => {
                    const config = TIER_CONFIG[tier.id] || TIER_CONFIG.rising;
                    const TIcon = config.icon;
                    const isCurrentTier = status?.currentTier === tier.id;

                    return (
                      <div
                        key={tier.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          isCurrentTier
                            ? `${config.bgColor} border-${config.color.replace('text-', '')}/50`
                            : 'border-muted bg-muted/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                            <TIcon className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-bold text-lg ${config.color}`}>{tier.name}</h4>
                              <Badge variant="outline">
                                {tier.minScore} - {tier.maxScore} pts
                              </Badge>
                              {isCurrentTier && (
                                <Badge className="bg-primary text-primary-foreground">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <ul className="text-sm space-y-1 text-muted-foreground mt-2">
                              {tier.benefits.map((benefit: string, i: number) => (
                                <li key={i} className="flex items-center gap-2">
                                  <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                                  {benefit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
