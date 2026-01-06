import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Bot,
  Shield,
  Activity,
  Database,
  RefreshCw,
  Settings,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  Heart,
  DollarSign,
  FileText,
  ChevronRight,
  Search,
  Terminal,
} from "lucide-react";

interface BotConfig {
  id: string;
  name: string;
  description: string;
  type: "local" | "central";
  category: string;
  status: "running" | "stopped" | "error" | "idle";
  autonomyLevel: number;
  lastHeartbeat?: string;
  metrics?: {
    tasksCompleted: number;
    pendingTasks: number;
    successRate: number;
    avgResponseTime: number;
  };
  config?: Record<string, any>;
}

export default function AgentsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBot, setSelectedBot] = useState<BotConfig | null>(null);

  // Fetch local bots
  const { data: localBotsData, isLoading: localLoading, refetch: refetchLocal } = useQuery({
    queryKey: ["/api/bots/local"],
    refetchInterval: 15000,
  });

  // Fetch central bots from FanzDash
  const { data: centralBotsData, isLoading: centralLoading, refetch: refetchCentral } = useQuery({
    queryKey: ["central-bots"],
    queryFn: async () => {
      try {
        const res = await fetch("https://dash.fanz.website/api/central-bots", {
          credentials: "include",
        });
        if (!res.ok) return { bots: [] };
        return res.json();
      } catch {
        return { bots: [] };
      }
    },
    refetchInterval: 30000,
  });

  // Default local bots
  const localBots: BotConfig[] = localBotsData?.bots || [
    {
      id: "content-moderation-bot",
      name: "Content Moderation Bot",
      description: "AI-powered content moderation with platform-specific rules",
      type: "local",
      category: "moderation",
      status: "running",
      autonomyLevel: 2,
      metrics: { tasksCompleted: 1247, pendingTasks: 12, successRate: 98.5, avgResponseTime: 45 },
    },
    {
      id: "platform-health-bot",
      name: "Platform Health Bot",
      description: "Monitors platform health, performance, and uptime",
      type: "local",
      category: "operations",
      status: "running",
      autonomyLevel: 2,
      metrics: { tasksCompleted: 8750, pendingTasks: 0, successRate: 100, avgResponseTime: 12 },
    },
    {
      id: "user-financial-bot",
      name: "User Financial Bot",
      description: "Handles user transactions, payouts, and financial tracking",
      type: "local",
      category: "financial",
      status: "running",
      autonomyLevel: 1,
      metrics: { tasksCompleted: 456, pendingTasks: 3, successRate: 99.8, avgResponseTime: 89 },
    },
  ];

  // Central bots
  const centralBots: BotConfig[] = (centralBotsData?.bots || []).map((bot: any) => ({
    id: bot.bot_id,
    name: bot.display_name,
    description: bot.description,
    type: "central" as const,
    category: bot.category,
    status: "running" as const,
    autonomyLevel: bot.default_autonomy_level,
    metrics: { tasksCompleted: 0, pendingTasks: 0, successRate: 100, avgResponseTime: 0 },
  }));

  const allBots = [...localBots, ...centralBots];

  const filteredBots = allBots.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRefresh = () => {
    refetchLocal();
    refetchCentral();
    toast({ title: "Refreshed", description: "Agent status updated" });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "stopped":
        return "bg-gray-500";
      case "error":
        return "bg-red-500";
      case "idle":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Running</Badge>;
      case "stopped":
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Stopped</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Error</Badge>;
      case "idle":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Idle</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "moderation":
        return <Shield className="w-5 h-5 text-purple-400" />;
      case "operations":
        return <Heart className="w-5 h-5 text-red-400" />;
      case "financial":
        return <DollarSign className="w-5 h-5 text-green-400" />;
      case "database":
        return <Database className="w-5 h-5 text-blue-400" />;
      case "orchestration":
        return <Zap className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bot className="w-5 h-5 text-cyan-400" />;
    }
  };

  const totalActive = allBots.filter((b) => b.status === "running").length;
  const totalTasks = allBots.reduce((acc, b) => acc + (b.metrics?.tasksCompleted || 0), 0);
  const avgSuccessRate = allBots.reduce((acc, b) => acc + (b.metrics?.successRate || 0), 0) / allBots.length;

  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-cyan-400" />
              Agent Management
            </h1>
            <p className="text-gray-400 mt-1">Monitor and manage platform bots and AI agents</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total Agents</p>
                  <p className="text-2xl font-bold text-white">{allBots.length}</p>
                </div>
                <Bot className="w-8 h-8 text-cyan-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-green-400">{totalActive}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Tasks Completed</p>
                  <p className="text-2xl font-bold text-white">{totalTasks.toLocaleString()}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Avg Success Rate</p>
                  <p className="text-2xl font-bold text-white">{avgSuccessRate.toFixed(1)}%</p>
                </div>
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-900 border-gray-800 text-white"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList className="bg-gray-900 border border-gray-800">
            <TabsTrigger value="all">All Agents ({allBots.length})</TabsTrigger>
            <TabsTrigger value="local">Local ({localBots.length})</TabsTrigger>
            <TabsTrigger value="central">Central ({centralBots.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <AgentGrid bots={filteredBots} getCategoryIcon={getCategoryIcon} getStatusBadge={getStatusBadge} />
          </TabsContent>

          <TabsContent value="local" className="space-y-4">
            <AgentGrid
              bots={filteredBots.filter((b) => b.type === "local")}
              getCategoryIcon={getCategoryIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>

          <TabsContent value="central" className="space-y-4">
            <AgentGrid
              bots={filteredBots.filter((b) => b.type === "central")}
              getCategoryIcon={getCategoryIcon}
              getStatusBadge={getStatusBadge}
            />
          </TabsContent>
        </Tabs>

        {/* Activity Log */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-green-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-gray-500">2 min ago</span>
                <span className="text-green-400">Content Moderation Bot</span>
                <span>approved 12 items</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-gray-500">5 min ago</span>
                <span className="text-blue-400">Platform Health Bot</span>
                <span>completed health scan</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-gray-500">15 min ago</span>
                <span className="text-purple-400">User Financial Bot</span>
                <span>processed 3 payouts</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AgentGrid({
  bots,
  getCategoryIcon,
  getStatusBadge,
}: {
  bots: BotConfig[];
  getCategoryIcon: (category: string) => React.ReactNode;
  getStatusBadge: (status: string) => React.ReactNode;
}) {
  if (bots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No agents found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bots.map((bot) => (
        <Card key={bot.id} className="bg-gray-900 border-gray-800 hover:border-cyan-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-800">{getCategoryIcon(bot.category)}</div>
                <div>
                  <h3 className="font-semibold text-white">{bot.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{bot.type} Bot</p>
                </div>
              </div>
              {getStatusBadge(bot.status)}
            </div>

            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{bot.description}</p>

            {bot.metrics && (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-gray-800/50">
                  <p className="text-gray-500">Tasks</p>
                  <p className="text-white font-medium">{bot.metrics.tasksCompleted.toLocaleString()}</p>
                </div>
                <div className="p-2 rounded bg-gray-800/50">
                  <p className="text-gray-500">Success</p>
                  <p className="text-white font-medium">{bot.metrics.successRate}%</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-800">
              <Badge variant="outline" className="text-xs text-gray-400">
                Autonomy: L{bot.autonomyLevel}
              </Badge>
              <Button variant="ghost" size="sm" className="text-cyan-400 hover:text-cyan-300">
                <Settings className="w-4 h-4 mr-1" />
                Config
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
