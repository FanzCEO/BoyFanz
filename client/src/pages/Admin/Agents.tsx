/**
 * Agents Management Page
 * Full bot management interface for admins
 * Shows local and central bots with configuration and monitoring
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/hooks/useAuth';
import {
  useAllAgents,
  useCentralBotStatus,
  useLocalBotStatus,
  useCentralBotAction,
  useLocalBotAction,
} from '@/hooks/useAgents';
import {
  Bot,
  Server,
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Settings,
  Play,
  Pause,
  RefreshCw,
  ExternalLink,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Eye,
  Zap,
  Lock,
  Brain,
  Database,
  FileText,
  CreditCard,
  Users,
  ChevronRight,
} from 'lucide-react';

// Bot Status Card Component
function BotStatusCard({ bot, type, onAction }: { bot: any; type: 'local' | 'central'; onAction: (action: string) => void }) {
  const isOnline = type === 'local'
    ? bot.isRunning
    : bot.status === 'online';

  const healthScore = type === 'local'
    ? (bot.stats?.overallScore || 100)
    : (bot.health?.score || 100);

  const issueCount = type === 'local'
    ? (bot.issues?.length || 0)
    : (bot.health?.issues || 0);

  const getStatusColor = () => {
    if (!isOnline) return 'bg-gray-500';
    if (issueCount > 0) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (issueCount > 0) return 'Degraded';
    return 'Online';
  };

  const getIcon = () => {
    switch (bot.id) {
      case 'content-moderation': return <Shield className="h-5 w-5" />;
      case 'platform-health': return <Activity className="h-5 w-5" />;
      case 'user-financial': return <CreditCard className="h-5 w-5" />;
      case 'ai-intelligence': return <Brain className="h-5 w-5" />;
      case 'compliance-legal': return <FileText className="h-5 w-5" />;
      case 'knowledge-resources': return <FileText className="h-5 w-5" />;
      case 'database-owner':
      case 'database-medic': return <Database className="h-5 w-5" />;
      case 'system-admin': return <Server className="h-5 w-5" />;
      case 'enterprise-ops': return <Users className="h-5 w-5" />;
      default: return <Bot className="h-5 w-5" />;
    }
  };

  return (
    <Card className="relative overflow-hidden">
      {/* Status indicator bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor()}`} />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isOnline ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-base">{bot.name}</CardTitle>
              <CardDescription className="text-xs">
                {type === 'local' ? 'Local Bot' : 'Central Bot'} • {bot.category || 'General'}
              </CardDescription>
            </div>
          </div>
          <Badge variant={isOnline ? 'default' : 'secondary'} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Score */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Health Score</span>
            <span className="font-medium">{Math.round(healthScore)}%</span>
          </div>
          <Progress value={healthScore} className="h-1.5" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">{issueCount}</p>
            <p className="text-[10px] text-muted-foreground">Issues</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">
              {bot.stats?.totalReviewed || bot.stats?.requestsPerMinute || 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Processed</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-md">
            <p className="text-lg font-bold">
              {Math.floor((bot.uptime || 0) / 3600000)}h
            </p>
            <p className="text-[10px] text-muted-foreground">Uptime</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {type === 'local' && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onAction(isOnline ? 'stop' : 'start')}
              >
                {isOnline ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAction('restart')}
                disabled={!isOnline}
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
            </>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{bot.name} Configuration</DialogTitle>
                <DialogDescription>
                  View and modify bot settings
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-xs overflow-auto max-h-64">
                    {JSON.stringify(bot.stats || bot.config || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

// Activity Log Component
function ActivityLog({ actions }: { actions: any[] }) {
  if (!actions || actions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {actions.slice(0, 20).map((action, index) => (
          <div key={index} className="flex items-start gap-3 p-2 hover:bg-muted/50 rounded-md">
            <div className="mt-0.5">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{action.action}</p>
              <p className="text-xs text-muted-foreground truncate">{action.target}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {new Date(action.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Issues Panel Component
function IssuesPanel({ issues }: { issues: any[] }) {
  if (!issues || issues.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
        <p className="text-sm">No active issues</p>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <ScrollArea className="h-64">
      <div className="space-y-2">
        {issues.map((issue, index) => (
          <div key={issue.id || index} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)}`} />
                <span className="text-sm font-medium">{issue.title}</span>
              </div>
              <Badge variant="outline" className="text-xs capitalize">
                {issue.severity}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{issue.description}</p>
            {issue.suggestedAction && (
              <p className="text-xs text-primary">
                <span className="font-medium">Suggested:</span> {issue.suggestedAction}
              </p>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

// Main Component
export default function AgentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    isLoading,
    isError,
    localBots,
    centralBots,
    totalBots,
    onlineCount,
    totalIssues,
    overallHealth,
    refetch,
  } = useAllAgents();

  const centralBotAction = useCentralBotAction();
  const localBotAction = useLocalBotAction();

  const handleBotAction = async (botId: string, type: 'local' | 'central', action: string) => {
    if (type === 'local') {
      await localBotAction.mutateAsync({ botId, action });
    } else {
      await centralBotAction.mutateAsync({ botId, action });
    }
    refetch();
  };

  // Collect all issues and actions from all bots
  const allIssues = [
    ...localBots.flatMap((b: any) => (b.issues || []).map((i: any) => ({ ...i, botName: b.name }))),
    ...centralBots.flatMap((b: any) =>
      Array((b.health?.issues || 0)).fill(null).map((_, idx) => ({
        id: `${b.id}-${idx}`,
        title: `Issue in ${b.name}`,
        severity: 'medium',
        description: 'Central bot reporting issues',
        botName: b.name,
      }))
    ),
  ];

  const allActions = localBots.flatMap((b: any) =>
    (b.recentActions || []).map((a: any) => ({ ...a, botName: b.name }))
  );

  if (user?.role !== 'admin' && user?.role !== 'moderator') {
    return (
      <div className="flex items-center justify-center h-64">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              You don't have permission to view this page
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            Agents & Bots
          </h1>
          <p className="text-muted-foreground">
            Monitor and manage platform automation
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalBots}</p>
                <p className="text-xs text-muted-foreground">Total Bots</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Wifi className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{onlineCount}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${totalIssues > 0 ? 'bg-yellow-500/10' : 'bg-green-500/10'}`}>
                <AlertTriangle className={`h-6 w-6 ${totalIssues > 0 ? 'text-yellow-500' : 'text-green-500'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalIssues}</p>
                <p className="text-xs text-muted-foreground">Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Shield className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{Math.round(overallHealth)}%</p>
                <p className="text-xs text-muted-foreground">Health</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="local">Local Bots ({localBots.length})</TabsTrigger>
          <TabsTrigger value="central">Central Bots ({centralBots.length})</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="issues">
            Issues
            {totalIssues > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {totalIssues}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Local Bots Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Local Bots</h2>
              <Badge variant="outline">{localBots.length} bots</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {localBots.map((bot: any) => (
                <BotStatusCard
                  key={bot.id}
                  bot={bot}
                  type="local"
                  onAction={(action) => handleBotAction(bot.id, 'local', action)}
                />
              ))}
              {localBots.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No local bots configured</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <Separator />

          {/* Central Bots Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Central Bots (FanzDash)</h2>
              <Badge variant="outline">{centralBots.length} bots</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {centralBots.map((bot: any) => (
                <BotStatusCard
                  key={bot.id}
                  bot={bot}
                  type="central"
                  onAction={(action) => handleBotAction(bot.id, 'central', action)}
                />
              ))}
              {centralBots.length === 0 && (
                <Card className="col-span-full">
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <Server className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Unable to connect to central bots</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="local">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localBots.map((bot: any) => (
              <BotStatusCard
                key={bot.id}
                bot={bot}
                type="local"
                onAction={(action) => handleBotAction(bot.id, 'local', action)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="central">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centralBots.map((bot: any) => (
              <BotStatusCard
                key={bot.id}
                bot={bot}
                type="central"
                onAction={(action) => handleBotAction(bot.id, 'central', action)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Actions performed by bots in the last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ActivityLog actions={allActions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues">
          <Card>
            <CardHeader>
              <CardTitle>Active Issues</CardTitle>
              <CardDescription>Problems detected by bots that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <IssuesPanel issues={allIssues} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
