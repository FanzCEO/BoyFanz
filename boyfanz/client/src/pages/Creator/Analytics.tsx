import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Heart,
  Eye,
  Clock,
  Star,
  MessageSquare,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Calendar
} from "lucide-react";
import { useState } from "react";

interface EarningsBreakdown {
  subscriptions: { amount: number; trend: number; count: number };
  tips: { amount: number; trend: number; count: number };
  ppv: { amount: number; trend: number; count: number };
  custom: { amount: number; trend: number; count: number };
  total: { amount: number; trend: number };
  byDay: { date: string; subscriptions: number; tips: number; ppv: number }[];
}

interface SubscriberGrowth {
  total: number;
  new: number;
  churned: number;
  netGrowth: number;
  growthRate: number;
  byDay: { date: string; total: number; new: number; churned: number }[];
  topSources: { source: string; count: number }[];
}

interface ContentPerformance {
  topPosts: {
    id: number;
    title: string;
    views: number;
    likes: number;
    comments: number;
    earnings: number;
    engagementRate: number;
  }[];
  averageEngagement: number;
  totalViews: number;
  totalLikes: number;
}

interface BestTimes {
  byHour: { hour: number; engagement: number }[];
  byDay: { day: string; engagement: number }[];
  recommendation: string;
}

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#00C49F"];

export default function CreatorAnalytics() {
  const [timeRange, setTimeRange] = useState<string>("30d");

  const { data: earnings, isLoading: earningsLoading } = useQuery<EarningsBreakdown>({
    queryKey: ["/api/creator/analytics/earnings", timeRange],
  });

  const { data: subscribers, isLoading: subscribersLoading } = useQuery<SubscriberGrowth>({
    queryKey: ["/api/creator/analytics/subscribers", timeRange],
  });

  const { data: content, isLoading: contentLoading } = useQuery<ContentPerformance>({
    queryKey: ["/api/creator/analytics/content-performance", timeRange],
  });

  const { data: bestTimes, isLoading: timesLoading } = useQuery<BestTimes>({
    queryKey: ["/api/creator/analytics/best-times", timeRange],
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const TrendBadge = ({ value }: { value: number }) => {
    const isPositive = value >= 0;
    return (
      <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
        {isPositive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
        {Math.abs(value).toFixed(1)}%
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Creator Analytics</h1>
          <p className="text-muted-foreground">Track your performance and optimize your content strategy</p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="90d">Last 90 Days</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {formatCurrency(earnings?.total?.amount || 0)}
            </div>
            {earnings?.total?.trend !== undefined && <TrendBadge value={earnings.total.trend} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Total Subscribers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{subscribers?.total || 0}</div>
            <div className="text-xs text-muted-foreground">
              +{subscribers?.new || 0} new / -{subscribers?.churned || 0} churned
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              Total Views
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {content?.totalViews?.toLocaleString() || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-pink-500">
              {(content?.averageEngagement || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="earnings">
        <TabsList>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="timing">Best Times</TabsTrigger>
        </TabsList>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(earnings?.subscriptions?.amount || 0)}</div>
                <div className="text-xs text-muted-foreground">{earnings?.subscriptions?.count || 0} active</div>
                {earnings?.subscriptions?.trend !== undefined && <TrendBadge value={earnings.subscriptions.trend} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(earnings?.tips?.amount || 0)}</div>
                <div className="text-xs text-muted-foreground">{earnings?.tips?.count || 0} received</div>
                {earnings?.tips?.trend !== undefined && <TrendBadge value={earnings.tips.trend} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pay-Per-View</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(earnings?.ppv?.amount || 0)}</div>
                <div className="text-xs text-muted-foreground">{earnings?.ppv?.count || 0} purchases</div>
                {earnings?.ppv?.trend !== undefined && <TrendBadge value={earnings.ppv.trend} />}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Custom Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(earnings?.custom?.amount || 0)}</div>
                <div className="text-xs text-muted-foreground">{earnings?.custom?.count || 0} orders</div>
                {earnings?.custom?.trend !== undefined && <TrendBadge value={earnings.custom.trend} />}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Earnings Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={earnings?.byDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Area type="monotone" dataKey="subscriptions" stackId="1" stroke="#8884d8" fill="#8884d8" name="Subscriptions" />
                    <Area type="monotone" dataKey="tips" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Tips" />
                    <Area type="monotone" dataKey="ppv" stackId="1" stroke="#ffc658" fill="#ffc658" name="PPV" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Net Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(subscribers?.netGrowth || 0) >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {(subscribers?.netGrowth || 0) >= 0 ? "+" : ""}{subscribers?.netGrowth || 0}
                </div>
                <div className="text-xs text-muted-foreground">
                  {(subscribers?.growthRate || 0).toFixed(1)}% growth rate
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  New Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">+{subscribers?.new || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Churned
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">-{subscribers?.churned || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Subscriber Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subscribers?.byDay || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#8884d8" strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="new" stroke="#82ca9d" strokeWidth={2} name="New" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Top Subscriber Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {subscribers?.topSources?.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">#{index + 1}</span>
                      <span>{source.source}</span>
                    </div>
                    <Badge variant="secondary">{source.count} subscribers</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Top Performing Content
              </CardTitle>
              <CardDescription>Your best content ranked by engagement and earnings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contentLoading ? (
                  <div className="text-center py-8">Loading content data...</div>
                ) : content?.topPosts?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No content data available</div>
                ) : (
                  content?.topPosts?.map((post, index) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {post.views.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" /> {post.likes.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" /> {post.comments}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">{formatCurrency(post.earnings)}</div>
                        <div className="text-sm text-muted-foreground">{post.engagementRate.toFixed(1)}% engagement</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Best Times Tab */}
        <TabsContent value="timing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Best Posting Times
              </CardTitle>
              <CardDescription>When your audience is most active</CardDescription>
            </CardHeader>
            <CardContent>
              {bestTimes?.recommendation && (
                <div className="p-4 bg-blue-50 rounded-lg mb-6">
                  <h4 className="font-medium text-blue-800 mb-1">Recommendation</h4>
                  <p className="text-sm text-blue-700">{bestTimes.recommendation}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">Engagement by Hour</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bestTimes?.byHour || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                        <YAxis />
                        <Tooltip labelFormatter={(h) => `${h}:00`} />
                        <Bar dataKey="engagement" fill="#8884d8" name="Engagement" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">Engagement by Day</h4>
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bestTimes?.byDay || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="engagement" fill="#82ca9d" name="Engagement" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
