import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import {
  Bot,
  Shield,
  Activity,
  Database,
  AlertCircle,
  CheckCircle,
  Clock,
  ChevronRight,
  RefreshCw,
  Zap,
  Heart,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface BotStatus {
  id: string;
  name: string;
  type: "local" | "central";
  status: "online" | "offline" | "degraded" | "idle";
  lastHeartbeat?: string;
  metrics?: {
    tasksCompleted?: number;
    pendingTasks?: number;
    cpu?: number;
    memory?: number;
  };
}

export function AgentSidebar() {
  const [isExpanded, setIsExpanded] = useState(true);

  // Fetch local bots status
  const { data: localBots, refetch: refetchLocal, isLoading: localLoading } = useQuery({
    queryKey: ["/api/bots/local/status"],
    refetchInterval: 10000,
  });

  // Fetch central bots status from FanzDash
  const { data: centralBots, refetch: refetchCentral, isLoading: centralLoading } = useQuery({
    queryKey: ["https://dash.fanz.website/api/central-bots"],
    queryFn: async () => {
      const res = await fetch("https://dash.fanz.website/api/central-bots", {
        credentials: "include",
      });
      if (!res.ok) return { bots: [] };
      return res.json();
    },
    refetchInterval: 30000,
  });

  const handleRefresh = () => {
    refetchLocal();
    refetchCentral();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
      case "active":
        return "bg-green-500";
      case "degraded":
        return "bg-yellow-500";
      case "idle":
        return "bg-blue-500";
      case "offline":
      case "error":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "online":
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-[10px]">Online</Badge>;
      case "degraded":
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[10px]">Degraded</Badge>;
      case "idle":
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">Idle</Badge>;
      default:
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">Offline</Badge>;
    }
  };

  const getTypeIcon = (type: string, name: string) => {
    if (name.toLowerCase().includes("moderation") || name.toLowerCase().includes("content")) {
      return <Shield className="w-4 h-4 text-purple-400" />;
    }
    if (name.toLowerCase().includes("health") || name.toLowerCase().includes("monitor")) {
      return <Heart className="w-4 h-4 text-red-400" />;
    }
    if (name.toLowerCase().includes("financial") || name.toLowerCase().includes("payment")) {
      return <DollarSign className="w-4 h-4 text-green-400" />;
    }
    if (name.toLowerCase().includes("database") || name.toLowerCase().includes("db")) {
      return <Database className="w-4 h-4 text-blue-400" />;
    }
    return <Bot className="w-4 h-4 text-cyan-400" />;
  };

  // Default local bots for this platform
  const localBotsList: BotStatus[] = localBots?.bots || [
    { id: "content-mod", name: "Content Moderation", type: "local", status: "online" },
    { id: "platform-health", name: "Platform Health", type: "local", status: "online" },
    { id: "user-financial", name: "User Financial", type: "local", status: "online" },
  ];

  // Central bots from FanzDash
  const centralBotsList: BotStatus[] = centralBots?.bots || [];

  const allOnline = [...localBotsList, ...centralBotsList].every(
    (b) => b.status === "online" || b.status === "active"
  );
  const issueCount = [...localBotsList, ...centralBotsList].filter(
    (b) => b.status !== "online" && b.status !== "active"
  ).length;

  return (
    <div className="w-64 border-l border-gray-800 bg-gray-900/50 backdrop-blur-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span className="font-semibold text-white">Agent Status</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full animate-pulse", allOnline ? "bg-green-500" : "bg-yellow-500")} />
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRefresh}>
              <RefreshCw className="w-3 h-3 text-gray-400" />
            </Button>
          </div>
        </div>
        {issueCount > 0 && (
          <div className="mt-2 flex items-center gap-2 text-xs text-yellow-400">
            <AlertCircle className="w-3 h-3" />
            <span>{issueCount} agent{issueCount > 1 ? "s" : ""} need attention</span>
          </div>
        )}
      </div>

      {/* Bot Lists */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {/* Local Bots Section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm font-medium text-white">Local Bots</span>
              <Badge className="bg-gray-700 text-gray-300 text-[10px]">{localBotsList.length}</Badge>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 transition-transform ui-open:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {localBotsList.map((bot) => (
              <div
                key={bot.id}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getTypeIcon(bot.type, bot.name)}
                  <span className="text-xs text-gray-300">{bot.name}</span>
                </div>
                <div className={cn("w-2 h-2 rounded-full", getStatusColor(bot.status))} />
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* Central Bots Section */}
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">Central Bots</span>
              <Badge className="bg-gray-700 text-gray-300 text-[10px]">{centralBotsList.length}</Badge>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-400 transition-transform ui-open:rotate-90" />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {centralBotsList.length === 0 ? (
              <div className="p-2 text-xs text-gray-500 text-center">
                {centralLoading ? "Loading..." : "No central bots connected"}
              </div>
            ) : (
              centralBotsList.map((bot: any) => (
                <div
                  key={bot.bot_id || bot.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {getTypeIcon("central", bot.display_name || bot.name)}
                    <span className="text-xs text-gray-300 truncate max-w-[120px]">
                      {bot.display_name || bot.name}
                    </span>
                  </div>
                  <div className={cn("w-2 h-2 rounded-full", getStatusColor(bot.status || "online"))} />
                </div>
              ))
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <Link href="/panel/admin/agents">
          <a className="flex items-center justify-center gap-2 w-full p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-sm font-medium transition-colors">
            <Activity className="w-4 h-4" />
            <span>Manage Agents</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </Link>
      </div>
    </div>
  );
}

export default AgentSidebar;
