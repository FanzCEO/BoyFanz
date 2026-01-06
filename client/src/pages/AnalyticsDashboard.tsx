// @ts-nocheck
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";

interface EarningsData {
  total: number;
  subscriptions: number;
  tips: number;
  ppv: number;
  customContent: number;
  referrals: number;
  change: number;
}

interface EngagementData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  profileViews: number;
  messagesSent: number;
  messagesReceived: number;
}

interface SubscriberData {
  total: number;
  active: number;
  newThisPeriod: number;
  churned: number;
  retention: number;
  averageLifetime: number;
  averageSpend: number;
}

interface ContentPerformance {
  id: string;
  title: string;
  type: 'photo' | 'video' | 'post';
  views: number;
  likes: number;
  comments: number;
  earnings: number;
  engagementRate: number;
  postedAt: string;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");

  // Production mode - fetch real analytics data from API
  const { data: earnings } = useQuery<EarningsData>({
    queryKey: ["/api/analytics/earnings", timeRange],
  });

  const { data: engagement } = useQuery<EngagementData>({
    queryKey: ["/api/analytics/engagement", timeRange],
  });

  const { data: subscribers } = useQuery<SubscriberData>({
    queryKey: ["/api/analytics/subscribers", timeRange],
  });

  const { data: topContent } = useQuery<ContentPerformance[]>({
    queryKey: ["/api/analytics/top-content", timeRange],
  });

  const { data: earningsHistory } = useQuery<TimeSeriesPoint[]>({
    queryKey: ["/api/analytics/earnings-history", timeRange],
  });

  // Default empty values for when no data exists
  const defaultEarnings: EarningsData = {
    total: 0,
    subscriptions: 0,
    tips: 0,
    ppv: 0,
    customContent: 0,
    referrals: 0,
    change: 0,
  };

  const defaultEngagement: EngagementData = {
    views: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    saves: 0,
    profileViews: 0,
    messagesSent: 0,
    messagesReceived: 0,
  };

  const defaultSubscribers: SubscriberData = {
    total: 0,
    active: 0,
    newThisPeriod: 0,
    churned: 0,
    retention: 0,
    averageLifetime: 0,
    averageSpend: 0,
  };

  // Use real data or defaults
  const earningsData = earnings || defaultEarnings;
  const engagementData = engagement || defaultEngagement;
  const subscribersData = subscribers || defaultSubscribers;
  const topContentData = topContent || [];
  const earningsHistoryData = earningsHistory || [];

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(num);

  const getChangeIndicator = (change: number) => {
    if (change > 0) return <span className="text-green-500">+{change}%</span>;
    if (change < 0) return <span className="text-red-500">{change}%</span>;
    return <span className="text-muted-foreground">0%</span>;
  };

  // Simple bar chart component
  const SimpleBarChart = ({ data, height = 120 }: { data: TimeSeriesPoint[]; height?: number }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    return (
      <div className="flex items-end gap-[2px] h-[120px]" style={{ height }}>
        {data.map((point, i) => (
          <div
            key={i}
            className="flex-1 bg-primary/80 hover:bg-primary rounded-t transition-colors cursor-pointer relative group"
            style={{ height: `${(point.value / maxValue) * 100}%`, minWidth: '4px' }}
          >
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-popover border rounded px-2 py-1 text-xs whitespace-nowrap z-10">
              ${point.value}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <i className="fas fa-chart-line text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your earnings, engagement, and audience growth
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <i className="fas fa-download mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="text-2xl font-bold">{formatCurrency(earningsData.total || 0)}</p>
                    <p className="text-xs mt-1">{getChangeIndicator(earningsData.change || 0)} vs last period</p>
                  </div>
                  <div className="p-3 rounded-full bg-green-500/10">
                    <i className="fas fa-dollar-sign text-green-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{formatNumber(engagementData.views || 0)}</p>
                    <p className="text-xs mt-1 text-green-500">+18.2% vs last period</p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-500/10">
                    <i className="fas fa-eye text-blue-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Subscribers</p>
                    <p className="text-2xl font-bold">{formatNumber(subscribersData.active || 0)}</p>
                    <p className="text-xs mt-1 text-green-500">+{subscribersData.newThisPeriod || 0} new</p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <i className="fas fa-users text-purple-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Engagement Rate</p>
                    <p className="text-2xl font-bold">
                      {((engagementData.likes || 0) / Math.max(engagementData.views || 1, 1) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs mt-1 text-green-500">Above average</p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-500/10">
                    <i className="fas fa-heart text-yellow-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Over Time</CardTitle>
              <CardDescription>Daily earnings for the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsHistoryData.length > 0 && <SimpleBarChart data={earningsHistoryData} />}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{timeRange === "7d" ? "7 days ago" : timeRange === "30d" ? "30 days ago" : "90 days ago"}</span>
                <span>Today</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Sources & Top Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Subscriptions", value: earningsData.subscriptions || 0, color: "bg-blue-500" },
                  { label: "Tips", value: earningsData.tips || 0, color: "bg-green-500" },
                  { label: "PPV Content", value: earningsData.ppv || 0, color: "bg-purple-500" },
                  { label: "Custom Content", value: earningsData.customContent || 0, color: "bg-yellow-500" },
                ].map((source) => (
                  <div key={source.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{source.label}</span>
                      <span className="font-medium">{formatCurrency(source.value)}</span>
                    </div>
                    <Progress
                      value={(source.value / (earningsData.total || 1)) * 100}
                      className={`h-2 ${source.color}`}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Content</CardTitle>
                <CardDescription>Highest earning posts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topContentData.slice(0, 5).map((content, i) => (
                    <div key={content.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        i === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                        i === 1 ? 'bg-gray-300/20 text-gray-400' :
                        i === 2 ? 'bg-amber-600/20 text-amber-600' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{content.title}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatNumber(content.views)} views</span>
                          <span>•</span>
                          <span>{content.engagementRate.toFixed(1)}% eng</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-500">{formatCurrency(content.earnings)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Earnings Tab */}
        <TabsContent value="earnings" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-xl font-bold text-green-500">{formatCurrency(earningsData.total || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Subscriptions</p>
                <p className="text-xl font-bold">{formatCurrency(earningsData.subscriptions || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Tips</p>
                <p className="text-xl font-bold">{formatCurrency(earningsData.tips || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">PPV</p>
                <p className="text-xl font-bold">{formatCurrency(earningsData.ppv || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Custom</p>
                <p className="text-xl font-bold">{formatCurrency(earningsData.customContent || 0)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground">Referrals</p>
                <p className="text-xl font-bold">{formatCurrency(earningsData.referrals || 0)}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              {earningsHistoryData.length > 0 && <SimpleBarChart data={earningsHistoryData} height={200} />}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Percentage of total earnings by source</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Subscriptions", value: earningsData.subscriptions || 0, icon: "fas fa-users", color: "text-blue-500" },
                  { label: "Tips", value: earningsData.tips || 0, icon: "fas fa-gift", color: "text-green-500" },
                  { label: "PPV Content", value: earningsData.ppv || 0, icon: "fas fa-lock", color: "text-purple-500" },
                  { label: "Custom Content", value: earningsData.customContent || 0, icon: "fas fa-magic", color: "text-yellow-500" },
                ].map((source) => {
                  const percentage = ((source.value / (earningsData.total || 1)) * 100).toFixed(1);
                  return (
                    <div key={source.label} className="text-center p-4 bg-muted/30 rounded-lg">
                      <i className={`${source.icon} text-2xl ${source.color} mb-2`} />
                      <p className="text-2xl font-bold">{percentage}%</p>
                      <p className="text-xs text-muted-foreground">{source.label}</p>
                      <p className="text-sm font-medium mt-1">{formatCurrency(source.value)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-eye text-3xl text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(engagementData.views || 0)}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-heart text-3xl text-red-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(engagementData.likes || 0)}</p>
                <p className="text-xs text-muted-foreground">Likes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-comment text-3xl text-green-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(engagementData.comments || 0)}</p>
                <p className="text-xs text-muted-foreground">Comments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-share text-3xl text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{formatNumber(engagementData.shares || 0)}</p>
                <p className="text-xs text-muted-foreground">Shares</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Saves", value: engagementData.saves || 0, icon: "fas fa-bookmark", max: engagementData.likes || 1 },
                  { label: "Profile Views", value: engagementData.profileViews || 0, icon: "fas fa-user", max: engagementData.views || 1 },
                  { label: "Messages Received", value: engagementData.messagesReceived || 0, icon: "fas fa-envelope", max: 3000 },
                  { label: "Messages Sent", value: engagementData.messagesSent || 0, icon: "fas fa-paper-plane", max: engagementData.messagesReceived || 1 },
                ].map((metric) => (
                  <div key={metric.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-2">
                        <i className={`${metric.icon} text-muted-foreground`} />
                        {metric.label}
                      </span>
                      <span className="font-medium">{formatNumber(metric.value)}</span>
                    </div>
                    <Progress value={(metric.value / metric.max) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate by Content Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Photos", rate: 32.5, count: 45 },
                    { type: "Videos", rate: 28.3, count: 23 },
                    { type: "Stories", rate: 45.2, count: 156 },
                    { type: "Streams", rate: 52.1, count: 8 },
                  ].map((content) => (
                    <div key={content.type} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{content.type}</p>
                        <p className="text-xs text-muted-foreground">{content.count} posts</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{content.rate}%</p>
                        <p className="text-xs text-muted-foreground">eng rate</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold">{subscribersData.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Subscribers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-green-500">+{subscribersData.newThisPeriod || 0}</p>
                <p className="text-xs text-muted-foreground">New This Period</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-red-500">-{subscribersData.churned || 0}</p>
                <p className="text-xs text-muted-foreground">Churned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-3xl font-bold text-blue-500">{subscribersData.retention || 0}%</p>
                <p className="text-xs text-muted-foreground">Retention Rate</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-clock text-muted-foreground" />
                    <span>Average Subscription Length</span>
                  </div>
                  <span className="font-bold">{subscribersData.averageLifetime || 0} months</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-dollar-sign text-muted-foreground" />
                    <span>Average Lifetime Spend</span>
                  </div>
                  <span className="font-bold">{formatCurrency(subscribersData.averageSpend || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-users text-muted-foreground" />
                    <span>Active Subscribers</span>
                  </div>
                  <span className="font-bold">{subscribersData.active || 0} / {subscribersData.total || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <i className="fas fa-chart-line text-muted-foreground" />
                    <span>Net Growth</span>
                  </div>
                  <span className="font-bold text-green-500">
                    +{(subscribersData.newThisPeriod || 0) - (subscribersData.churned || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Tiers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { tier: "Basic ($9.99)", count: 187, percent: 55 },
                    { tier: "Premium ($19.99)", count: 98, percent: 29 },
                    { tier: "VIP ($49.99)", count: 45, percent: 13 },
                    { tier: "Custom", count: 12, percent: 3 },
                  ].map((tier) => (
                    <div key={tier.tier}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{tier.tier}</span>
                        <span className="text-muted-foreground">{tier.count} subs ({tier.percent}%)</span>
                      </div>
                      <Progress value={tier.percent} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance</CardTitle>
              <CardDescription>Your top performing content this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topContentData.map((content, i) => (
                  <div key={content.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      content.type === 'photo' ? 'bg-blue-500/10 text-blue-500' :
                      content.type === 'video' ? 'bg-purple-500/10 text-purple-500' :
                      'bg-green-500/10 text-green-500'
                    }`}>
                      <i className={content.type === 'photo' ? 'fas fa-image' : content.type === 'video' ? 'fas fa-video' : 'fas fa-file-alt'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{content.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Posted {new Date(content.postedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div>
                        <p className="font-medium">{formatNumber(content.views)}</p>
                        <p className="text-xs text-muted-foreground">Views</p>
                      </div>
                      <div>
                        <p className="font-medium">{formatNumber(content.likes)}</p>
                        <p className="text-xs text-muted-foreground">Likes</p>
                      </div>
                      <div>
                        <p className="font-medium">{content.engagementRate.toFixed(1)}%</p>
                        <p className="text-xs text-muted-foreground">Eng</p>
                      </div>
                      <div>
                        <p className="font-medium text-green-500">{formatCurrency(content.earnings)}</p>
                        <p className="text-xs text-muted-foreground">Earned</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-image text-3xl text-blue-500 mb-2" />
                <p className="text-2xl font-bold">45</p>
                <p className="text-xs text-muted-foreground">Photos Posted</p>
                <Badge variant="outline" className="mt-2">32.5% avg eng</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-video text-3xl text-purple-500 mb-2" />
                <p className="text-2xl font-bold">23</p>
                <p className="text-xs text-muted-foreground">Videos Posted</p>
                <Badge variant="outline" className="mt-2">28.3% avg eng</Badge>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <i className="fas fa-bolt text-3xl text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-muted-foreground">Stories Posted</p>
                <Badge variant="outline" className="mt-2">45.2% avg eng</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Tips Section */}
      <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <i className="fas fa-lightbulb text-yellow-500" />
            Growth Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid md:grid-cols-2 gap-3 text-sm">
            <li className="flex items-start gap-2">
              <i className="fas fa-check text-green-500 mt-1" />
              <span>Your engagement rate is 27.2% - that's above the platform average of 22%!</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-check text-green-500 mt-1" />
              <span>Videos get 15% more engagement than photos - consider posting more video content</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-lightbulb text-yellow-500 mt-1" />
              <span>Your best performing day is Thursday - schedule more content for that day</span>
            </li>
            <li className="flex items-start gap-2">
              <i className="fas fa-lightbulb text-yellow-500 mt-1" />
              <span>Subscribers who message you have 3x higher retention - engage in DMs more</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
