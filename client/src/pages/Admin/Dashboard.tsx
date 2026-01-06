import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
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
} from 'recharts';
import {
  Users,
  DollarSign,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Clock,
  Eye,
  Download,
  Upload,
  MessageSquare,
  UserCheck,
  CreditCard,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AdminLayout, ControlPanelCard, MonitorCard, AdminStatCard } from "@/components/bathhouse";

// TypeScript interfaces for type safety
interface DashboardOverview {
  totalUsers?: number;
  totalRevenue?: number;
  totalContent?: number;
  totalTransactions?: number;
  monthlyGrowth?: {
    users?: number;
    revenue?: number;
    content?: number;
    transactions?: number;
  };
}

interface ActivityItem {
  id: number;
  type: string;
  user: string;
  time: string;
  status: string;
}

interface AlertItem {
  id: number;
  type: string;
  message: string;
  time: string;
}

interface RevenueChartData {
  name: string;
  revenue: number;
  users: number;
}

interface ContentStats {
  name: string;
  value: number;
  color: string;
}

interface DashboardStats {
  recentActivity?: ActivityItem[];
  alerts?: AlertItem[];
  revenueChart?: RevenueChartData[];
  contentStats?: ContentStats[];
}

interface SystemMetrics {
  cpu?: { usage: number; status: string };
  memory?: { usage: number; status: string };
  disk?: { usage: number; status: string };
  network?: { latency: number; status: string };
}

interface ServiceStatus {
  name: string;
  status: string;
  uptime: string;
}

interface SystemHealth {
  overall?: string;
  metrics?: SystemMetrics;
  services?: ServiceStatus[];
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [refreshTime, setRefreshTime] = useState(new Date());

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // Dashboard Overview Data
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/overview', refreshTime],
    refetchInterval: 30000,
  });

  // Dashboard Stats Data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/stats', refreshTime],
    refetchInterval: 30000,
  });

  // System Health Data
  const { data: systemHealth, isLoading: healthLoading } = useQuery({
    queryKey: ['/api/admin/dashboard/system-health', refreshTime],
    refetchInterval: 15000,
  });

  // Security Data
  const { data: securityStats } = useQuery({
    queryKey: ['/api/security/stats', refreshTime],
    refetchInterval: 30000,
  });

  const { data: captureAttempts } = useQuery({
    queryKey: ['/api/security/capture-attempts', { limit: 20 }],
    refetchInterval: 30000,
  });

  // Default empty state when API hasn't been set up yet
  const defaultOverview: DashboardOverview = {
    totalUsers: 0,
    totalRevenue: 0,
    totalContent: 0,
    totalTransactions: 0,
    monthlyGrowth: {
      users: 0,
      revenue: 0,
      content: 0,
      transactions: 0
    }
  };

  const defaultStats: DashboardStats = {
    recentActivity: [],
    alerts: [],
    revenueChart: [],
    contentStats: []
  };

  const defaultSystemHealth: SystemHealth = {
    overall: 'unknown',
    metrics: {
      cpu: { usage: 0, status: 'unknown' },
      memory: { usage: 0, status: 'unknown' },
      disk: { usage: 0, status: 'unknown' },
      network: { latency: 0, status: 'unknown' }
    },
    services: []
  };

  const currentData: DashboardOverview = overview || defaultOverview;
  const currentStats: DashboardStats = stats || defaultStats;
  const currentHealth: SystemHealth = systemHealth || defaultSystemHealth;

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-500 bg-red-50 text-red-700';
      case 'warning': return 'border-yellow-500 bg-yellow-50 text-yellow-700';
      case 'info': return 'border-blue-500 bg-blue-50 text-blue-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration': return <UserCheck className="h-4 w-4" />;
      case 'content_upload': return <Upload className="h-4 w-4" />;
      case 'payout_request': return <CreditCard className="h-4 w-4" />;
      case 'verification_submitted': return <Shield className="h-4 w-4" />;
      case 'complaint_filed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-100 text-green-700" data-testid={`status-${status}`}>Completed</Badge>;
      case 'processing': return <Badge className="bg-blue-100 text-blue-700" data-testid={`status-${status}`}>Processing</Badge>;
      case 'pending': return <Badge className="bg-yellow-100 text-yellow-700" data-testid={`status-${status}`}>Pending</Badge>;
      case 'review': return <Badge className="bg-purple-100 text-purple-700" data-testid={`status-${status}`}>Review</Badge>;
      case 'assigned': return <Badge className="bg-orange-100 text-orange-700" data-testid={`status-${status}`}>Assigned</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-700" data-testid={`status-${status}`}>{status}</Badge>;
    }
  };

  if (overviewLoading || statsLoading) {
    return (
      <AdminLayout
        title="Control Room"
        subtitle="Loading system data..."
        zone="control-room"
      >
        <div className="space-y-6" data-testid="dashboard-loading">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="monitor-card animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Control Room"
      subtitle={`Welcome back, ${user?.firstName}. Bathhouse systems operational.`}
      zone="control-room"
    >
      <div className="space-y-6 pb-12" data-testid="admin-dashboard">
        {/* Refresh Bar */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3">
            <div className="status-light status-light-green" />
            <span className="text-sm text-gray-400">All systems operational</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRefreshTime(new Date())}
              className="admin-action-btn"
              data-testid="button-refresh"
            >
              <RefreshCw className="h-4 w-4" />
              REFRESH
            </Button>
            <span className="text-xs text-gray-500 font-mono" data-testid="text-last-updated">
              {refreshTime.toLocaleTimeString()}
            </span>
          </div>
        </motion.div>

      {/* Key Metrics - Monitor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AdminStatCard
            value={currentData.totalUsers?.toLocaleString() || '0'}
            label="Total Guests"
            trend={`+${currentData.monthlyGrowth?.users || 0}%`}
            trendUp={true}
            color="cyan"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminStatCard
            value={`$${currentData.totalRevenue?.toLocaleString() || '0'}`}
            label="Total Revenue"
            trend={`+${currentData.monthlyGrowth?.revenue || 0}%`}
            trendUp={true}
            color="green"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AdminStatCard
            value={currentData.totalContent?.toLocaleString() || '0'}
            label="Content Items"
            trend={`+${currentData.monthlyGrowth?.content || 0}%`}
            trendUp={true}
            color="purple"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AdminStatCard
            value={currentData.totalTransactions?.toLocaleString() || '0'}
            label="Transactions"
            trend={`+${currentData.monthlyGrowth?.transactions || 0}%`}
            trendUp={true}
            color="yellow"
          />
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6" data-testid="dashboard-tabs">
        <TabsList>
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          <TabsTrigger value="system" data-testid="tab-system">System Health</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest platform activities and events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStats.recentActivity?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  currentStats.recentActivity?.map((activity: ActivityItem) => (
                    <div key={activity.id} className="flex items-center justify-between" data-testid={`activity-item-${activity.id}`}>
                      <div className="flex items-center gap-3">
                        {getActivityIcon(activity.type)}
                        <div>
                          <p className="text-sm font-medium" data-testid={`activity-user-${activity.id}`}>
                            {activity.user}
                          </p>
                          <p className="text-xs text-muted-foreground" data-testid={`activity-time-${activity.id}`}>
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(activity.status)}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card data-testid="card-system-alerts">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
                <CardDescription>Important notifications and warnings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStats.alerts?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No active alerts</p>
                ) : (
                  currentStats.alerts?.map((alert: AlertItem) => (
                    <Alert key={alert.id} className={getAlertColor(alert.type)} data-testid={`alert-item-${alert.id}`}>
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <span data-testid={`alert-message-${alert.id}`}>{alert.message}</span>
                          <span className="text-xs opacity-70" data-testid={`alert-time-${alert.id}`}>
                            {alert.time}
                          </span>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link href="/panel/admin/users">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2"
                    data-testid="button-user-management"
                  >
                    <Users className="h-6 w-6" />
                    User Management
                  </Button>
                </Link>
                <Link href="/panel/admin/complaints">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2"
                    data-testid="button-complaints"
                  >
                    <MessageSquare className="h-6 w-6" />
                    Complaints
                  </Button>
                </Link>
                <Link href="/panel/admin/withdrawals">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2"
                    data-testid="button-withdrawals"
                  >
                    <CreditCard className="h-6 w-6" />
                    Withdrawals
                  </Button>
                </Link>
                <Link href="/panel/admin/verification">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2"
                    data-testid="button-verification"
                  >
                    <Shield className="h-6 w-6" />
                    Verification
                  </Button>
                </Link>
                <Link href="/panel/admin/compliance">
                  <Button
                    variant="outline"
                    className="h-20 w-full flex-col gap-2"
                    data-testid="button-compliance"
                  >
                    <Shield className="h-6 w-6" />
                    Compliance
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <Card data-testid="card-revenue-chart">
              <CardHeader>
                <CardTitle>Revenue & User Growth</CardTitle>
                <CardDescription>Monthly revenue and user acquisition trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={currentStats.revenueChart || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stackId="1"
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Content Distribution */}
            <Card data-testid="card-content-distribution">
              <CardHeader>
                <CardTitle>Content Distribution</CardTitle>
                <CardDescription>Breakdown of content types on the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentStats.contentStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {currentStats.contentStats?.map((entry: ContentStats, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          {/* System Health Overview */}
          <Card data-testid="card-system-health">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                System Health Overview
                <Badge 
                  className={`ml-auto ${currentHealth.overall === 'healthy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  data-testid="badge-system-overall"
                >
                  {currentHealth.overall}
                </Badge>
              </CardTitle>
              <CardDescription>Real-time system performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2" data-testid="metric-cpu">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    <span className="text-sm font-medium">CPU Usage</span>
                  </div>
                  <Progress value={currentHealth.metrics?.cpu?.usage || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {currentHealth.metrics?.cpu?.usage || 0}% - {currentHealth.metrics?.cpu?.status || 'unknown'}
                  </p>
                </div>

                <div className="space-y-2" data-testid="metric-memory">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <Progress value={currentHealth.metrics?.memory?.usage || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {currentHealth.metrics?.memory?.usage || 0}% - {currentHealth.metrics?.memory?.status || 'unknown'}
                  </p>
                </div>

                <div className="space-y-2" data-testid="metric-disk">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4" />
                    <span className="text-sm font-medium">Disk Usage</span>
                  </div>
                  <Progress value={currentHealth.metrics?.disk?.usage || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {currentHealth.metrics?.disk?.usage || 0}% - {currentHealth.metrics?.disk?.status || 'unknown'}
                  </p>
                </div>

                <div className="space-y-2" data-testid="metric-network">
                  <div className="flex items-center gap-2">
                    <Wifi className="h-4 w-4" />
                    <span className="text-sm font-medium">Network</span>
                  </div>
                  <p className="text-sm font-medium">{currentHealth.metrics?.network?.latency || 0}ms</p>
                  <p className="text-xs text-muted-foreground">
                    {currentHealth.metrics?.network?.status || 'unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card data-testid="card-service-status">
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>Status and uptime of critical platform services</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentHealth.services?.map((service: ServiceStatus, index: number) => (
                  <div key={index} className="flex items-center justify-between" data-testid={`service-${index}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'healthy' ? 'bg-green-500' : 
                        service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <span className="font-medium" data-testid={`service-name-${index}`}>
                        {service.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground" data-testid={`service-uptime-${index}`}>
                        {service.uptime} uptime
                      </span>
                      <Badge 
                        className={getHealthColor(service.status)}
                        data-testid={`service-status-${index}`}
                      >
                        {service.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          {/* Security Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card data-testid="card-total-attempts">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats?.captureAttempts?.total_attempts || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </CardContent>
            </Card>

            <Card data-testid="card-unique-users">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Unique Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{securityStats?.captureAttempts?.unique_users || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Attempted capture</p>
              </CardContent>
            </Card>

            <Card data-testid="card-last-24h">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last 24 Hours</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{securityStats?.captureAttempts?.last_24h || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Recent activity</p>
              </CardContent>
            </Card>

            <Card data-testid="card-last-7d">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Last 7 Days</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-500">{securityStats?.captureAttempts?.last_7d || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Weekly trend</p>
              </CardContent>
            </Card>
          </div>

          {/* Capture Attempts Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card data-testid="card-capture-types">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Capture Type Breakdown
                </CardTitle>
                <CardDescription>Distribution by screenshot vs screen recording</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Screenshots</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{securityStats?.captureAttempts?.screenshots || 0}</span>
                    </div>
                  </div>
                  <Progress
                    value={securityStats?.captureAttempts?.total_attempts > 0
                      ? (securityStats?.captureAttempts?.screenshots / securityStats?.captureAttempts?.total_attempts) * 100
                      : 0}
                    className="h-2"
                  />

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Screen Recordings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold">{securityStats?.captureAttempts?.recordings || 0}</span>
                    </div>
                  </div>
                  <Progress
                    value={securityStats?.captureAttempts?.total_attempts > 0
                      ? (securityStats?.captureAttempts?.recordings / securityStats?.captureAttempts?.total_attempts) * 100
                      : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-security-status">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Protection Status
                </CardTitle>
                <CardDescription>Content security features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Screenshot Protection</span>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Screen Recording Detection</span>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Capture Logging</span>
                    <Badge className="bg-green-100 text-green-700">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Watermarking</span>
                    <Badge className="bg-blue-100 text-blue-700">Enabled</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Capture Attempts Table */}
          <Card data-testid="card-recent-captures">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Recent Capture Attempts
              </CardTitle>
              <CardDescription>Latest screenshot and screen recording attempts logged</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Timestamp</th>
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Content</th>
                      <th className="text-left py-3 px-4">IP Address</th>
                      <th className="text-left py-3 px-4">Browser</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!captureAttempts?.attempts || captureAttempts.attempts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-muted-foreground">
                          No capture attempts logged yet
                        </td>
                      </tr>
                    ) : (
                      captureAttempts.attempts.map((attempt: any, index: number) => (
                        <tr key={index} className="border-b hover:bg-muted/50" data-testid={`capture-row-${index}`}>
                          <td className="py-3 px-4">
                            {new Date(attempt.timestamp).toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            {attempt.user_email || `User ${attempt.user_id}`}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={attempt.capture_type === 'screenshot' ? 'default' : 'secondary'}>
                              {attempt.capture_type}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate">
                            {attempt.content_id || 'N/A'}
                          </td>
                          <td className="py-3 px-4 font-mono text-xs">
                            {attempt.ip_address || 'Unknown'}
                          </td>
                          <td className="py-3 px-4 max-w-xs truncate text-xs">
                            {attempt.user_agent ? attempt.user_agent.substring(0, 50) + '...' : 'Unknown'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {captureAttempts?.total > 20 && (
                <div className="mt-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    Showing 20 of {captureAttempts.total} total attempts
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AdminLayout>
  );
}