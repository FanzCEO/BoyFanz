/**
 * useAgents Hook
 * Fetches and manages agent/bot data from both local and central APIs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Central bot data from FanzDash
interface CentralBot {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'central';
  status: 'online' | 'offline' | 'degraded' | 'error';
  health: {
    score: number;
    issues: number;
  };
  uptime: number;
  lastHeartbeat: string;
}

// Local bot data from this platform
interface LocalBot {
  id: string;
  name: string;
  type: 'local';
  status: 'running' | 'stopped' | 'error';
  isRunning: boolean;
  uptime: number;
  stats: Record<string, any>;
  issues: BotIssue[];
  recentActions: BotAction[];
}

interface BotIssue {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  detectedAt: string;
  autoFixable: boolean;
  suggestedAction?: string;
}

interface BotAction {
  action: string;
  target: string;
  result: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

interface SecurityStatus {
  securityStatus: string;
  overallScore: number;
  layers: {
    encryption: { status: string; type: string; description: string };
    aiDefense: { status: string; type: string; description: string; modelsActive: number };
    securityWalls: { status: string; type: string; description: string };
    uptime: { status: string; percentage: number; description: string };
    compliance: { status: string; score: number; certifications: string[]; description: string };
    dataProtection: { status: string; type: string; description: string };
  };
  metrics: {
    threatsBlockedToday: number;
    lastSecurityScan: string;
    protectionLayers: number;
    contentScanned: number;
    complianceAudits: number;
  };
  systemStatus: string;
  message: string;
  timestamp: string;
}

const FANZDASH_URL = 'https://dash.fanz.website';

/**
 * Fetch central bots from FanzDash
 */
export function useCentralBots() {
  return useQuery<{ success: boolean; bots: CentralBot[]; totalBots: number; onlineBots: number }>({
    queryKey: ['central-bots'],
    queryFn: async () => {
      const response = await fetch(`${FANZDASH_URL}/api/central-bots`);
      if (!response.ok) throw new Error('Failed to fetch central bots');
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000,
  });
}

/**
 * Fetch local bots from this platform
 */
export function useLocalBots() {
  return useQuery<{ success: boolean; bots: LocalBot[] }>({
    queryKey: ['local-bots'],
    queryFn: async () => {
      const response = await fetch('/api/local-bots');
      if (!response.ok) throw new Error('Failed to fetch local bots');
      return response.json();
    },
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 5000,
  });
}

/**
 * Fetch security status for public SecurityShield
 */
export function useSecurityStatus() {
  return useQuery<SecurityStatus>({
    queryKey: ['security-status'],
    queryFn: async () => {
      const response = await fetch(`${FANZDASH_URL}/api/central-bots/security/status`);
      if (!response.ok) throw new Error('Failed to fetch security status');
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
}

/**
 * Fetch status for a specific central bot
 */
export function useCentralBotStatus(botId: string) {
  return useQuery({
    queryKey: ['central-bot', botId],
    queryFn: async () => {
      const response = await fetch(`${FANZDASH_URL}/api/central-bots/${botId}/status`);
      if (!response.ok) throw new Error(`Failed to fetch status for ${botId}`);
      return response.json();
    },
    enabled: !!botId,
    refetchInterval: 30000,
  });
}

/**
 * Fetch status for a specific local bot
 */
export function useLocalBotStatus(botId: string) {
  return useQuery({
    queryKey: ['local-bot', botId],
    queryFn: async () => {
      const response = await fetch(`/api/local-bots/${botId}/status`);
      if (!response.ok) throw new Error(`Failed to fetch status for ${botId}`);
      return response.json();
    },
    enabled: !!botId,
    refetchInterval: 15000,
  });
}

/**
 * Trigger action on a central bot
 */
export function useCentralBotAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ botId, action, params }: { botId: string; action: string; params?: any }) => {
      const response = await fetch(`${FANZDASH_URL}/api/central-bots/${botId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      if (!response.ok) throw new Error(`Failed to execute action on ${botId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['central-bots'] });
    },
  });
}

/**
 * Trigger action on a local bot
 */
export function useLocalBotAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ botId, action, params }: { botId: string; action: string; params?: any }) => {
      const response = await fetch(`/api/local-bots/${botId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, params }),
      });
      if (!response.ok) throw new Error(`Failed to execute action on ${botId}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['local-bots'] });
    },
  });
}

/**
 * Combined hook for all agents (local + central)
 */
export function useAllAgents() {
  const centralBots = useCentralBots();
  const localBots = useLocalBots();

  const isLoading = centralBots.isLoading || localBots.isLoading;
  const isError = centralBots.isError || localBots.isError;

  const allBots = [
    ...(localBots.data?.bots || []).map(b => ({ ...b, source: 'local' as const })),
    ...(centralBots.data?.bots || []).map(b => ({ ...b, source: 'central' as const })),
  ];

  const totalIssues = allBots.reduce((sum, bot) => {
    if ('issues' in bot) return sum + (bot.issues?.length || 0);
    if ('health' in bot) return sum + (bot.health?.issues || 0);
    return sum;
  }, 0);

  const onlineCount = allBots.filter(bot => {
    if ('isRunning' in bot) return bot.isRunning;
    if ('status' in bot) return bot.status === 'online' || bot.status === 'running';
    return false;
  }).length;

  const overallHealth = allBots.length > 0
    ? (onlineCount / allBots.length) * 100
    : 100;

  return {
    isLoading,
    isError,
    allBots,
    localBots: localBots.data?.bots || [],
    centralBots: centralBots.data?.bots || [],
    totalBots: allBots.length,
    onlineCount,
    totalIssues,
    overallHealth,
    refetch: () => {
      centralBots.refetch();
      localBots.refetch();
    },
  };
}
