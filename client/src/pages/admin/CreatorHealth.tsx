import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Star,
  Users,
  DollarSign,
  Activity,
  Award,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from "lucide-react";

interface CreatorHealth {
  id: number;
  creatorId: number;
  username: string;
  overallScore: number;
  engagementScore: number;
  revenueScore: number;
  contentScore: number;
  retentionScore: number;
  trend: string;
  riskLevel: string;
  lastUpdated: string;
}

export default function CreatorHealthScores() {
  const { data: allCreators, isLoading: loadingAll } = useQuery<CreatorHealth[]>({
    queryKey: ["/api/admin/creator-health/scores"],
  });

  const { data: atRiskCreators, isLoading: loadingAtRisk } = useQuery<CreatorHealth[]>({
    queryKey: ["/api/admin/creator-health/at-risk"],
  });

  const { data: topPerformers, isLoading: loadingTop } = useQuery<CreatorHealth[]>({
    queryKey: ["/api/admin/creator-health/top-performers"],
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    if (score >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low": return <Badge className="bg-green-500">Low Risk</Badge>;
      case "medium": return <Badge className="bg-yellow-500 text-black">Medium Risk</Badge>;
      case "high": return <Badge className="bg-orange-500">High Risk</Badge>;
      case "critical": return <Badge className="bg-red-500">Critical</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <ArrowUp className="h-4 w-4 text-green-500" />;
      case "declining": return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const ScoreCard = ({ title, icon: Icon, score, color }: { title: string; icon: any; score: number; color: string }) => (
    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <Progress value={score} className="w-16 h-2" />
        <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Creator Health Scores</h1>
          <p className="text-muted-foreground">Monitor creator performance and identify at-risk accounts</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Scores
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topPerformers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Score above 80</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              At-Risk Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{atRiskCreators?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Improving
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {allCreators?.filter(c => c.trend === "improving").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Positive trend</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              Declining
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {allCreators?.filter(c => c.trend === "declining").length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Needs intervention</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="at-risk">
        <TabsList>
          <TabsTrigger value="at-risk">At-Risk Creators</TabsTrigger>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
          <TabsTrigger value="all">All Creators</TabsTrigger>
        </TabsList>

        <TabsContent value="at-risk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Creators Requiring Attention
              </CardTitle>
              <CardDescription>
                These creators have declining metrics and may need support or intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingAtRisk ? (
                <div className="text-center py-8">Loading at-risk creators...</div>
              ) : atRiskCreators?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No at-risk creators found</div>
              ) : (
                <div className="space-y-4">
                  {atRiskCreators?.map((creator) => (
                    <Card key={creator.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">@{creator.username}</h3>
                              {getRiskBadge(creator.riskLevel)}
                              {getTrendIcon(creator.trend)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Overall Score: <span className={getScoreColor(creator.overallScore)}>{creator.overallScore}/100</span>
                            </p>
                          </div>
                          <Button size="sm">View Details</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                          <ScoreCard title="Engagement" icon={Users} score={creator.engagementScore} color="text-blue-500" />
                          <ScoreCard title="Revenue" icon={DollarSign} score={creator.revenueScore} color="text-green-500" />
                          <ScoreCard title="Content" icon={Activity} score={creator.contentScore} color="text-purple-500" />
                          <ScoreCard title="Retention" icon={Heart} score={creator.retentionScore} color="text-pink-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                Top Performing Creators
              </CardTitle>
              <CardDescription>
                These creators are excelling across all metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingTop ? (
                <div className="text-center py-8">Loading top performers...</div>
              ) : topPerformers?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No top performers found</div>
              ) : (
                <div className="space-y-4">
                  {topPerformers?.map((creator, index) => (
                    <Card key={creator.id} className="border-l-4 border-l-green-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-yellow-500">#{index + 1}</span>
                              <h3 className="font-semibold">@{creator.username}</h3>
                              <Badge className="bg-green-500">Top Performer</Badge>
                              {getTrendIcon(creator.trend)}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Overall Score: <span className="text-green-500 font-bold">{creator.overallScore}/100</span>
                            </p>
                          </div>
                          <Button size="sm" variant="outline">Feature Creator</Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
                          <ScoreCard title="Engagement" icon={Users} score={creator.engagementScore} color="text-blue-500" />
                          <ScoreCard title="Revenue" icon={DollarSign} score={creator.revenueScore} color="text-green-500" />
                          <ScoreCard title="Content" icon={Activity} score={creator.contentScore} color="text-purple-500" />
                          <ScoreCard title="Retention" icon={Heart} score={creator.retentionScore} color="text-pink-500" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">All Creator Health Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead>Overall</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Trend</TableHead>
                    <TableHead>Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingAll ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : allCreators?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">No creators found</TableCell>
                    </TableRow>
                  ) : (
                    allCreators?.map((creator) => (
                      <TableRow key={creator.id}>
                        <TableCell className="font-medium">@{creator.username}</TableCell>
                        <TableCell>
                          <span className={`font-bold ${getScoreColor(creator.overallScore)}`}>
                            {creator.overallScore}
                          </span>
                        </TableCell>
                        <TableCell>{creator.engagementScore}</TableCell>
                        <TableCell>{creator.revenueScore}</TableCell>
                        <TableCell>{creator.contentScore}</TableCell>
                        <TableCell>{creator.retentionScore}</TableCell>
                        <TableCell>{getTrendIcon(creator.trend)}</TableCell>
                        <TableCell>{getRiskBadge(creator.riskLevel)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
