/**
 * AgentSidebar Component
 * Admin-only sidebar showing real-time bot status
 * Shows both local (platform-specific) and central (shared) bots
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { cn } from '@/lib/utils';
import { useAllAgents } from '@/hooks/useAgents';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface AgentSidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

// Status indicator component
function StatusIndicator({ status, size = 'sm' }: { status: string; size?: 'sm' | 'md' }) {
  const getColor = () => {
    switch (status) {
      case 'online':
      case 'running':
        return 'bg-green-500';
      case 'degraded':
        return 'bg-yellow-500';
      case 'offline':
      case 'stopped':
        return 'bg-gray-500';
      case 'error':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const sizeClass = size === 'md' ? 'w-3 h-3' : 'w-2 h-2';

  return (
    <span className={cn('rounded-full inline-block', sizeClass, getColor())}>
      <span className={cn('animate-ping absolute rounded-full opacity-75', sizeClass, getColor())} />
    </span>
  );
}

// Bot card component
function BotCard({ bot, type }: { bot: any; type: 'local' | 'central' }) {
  const status = type === 'local'
    ? (bot.isRunning ? 'running' : 'stopped')
    : bot.status;

  const healthScore = type === 'local'
    ? (bot.stats?.overallScore || 100)
    : (bot.health?.score || 100);

  const issueCount = type === 'local'
    ? (bot.issues?.length || 0)
    : (bot.health?.issues || 0);

  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="relative">
        <StatusIndicator status={status} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground truncate">
          {bot.name}
        </p>
        <p className="text-[10px] text-muted-foreground truncate">
          {type === 'local' ? 'Local' : 'Central'} • {Math.round(healthScore)}%
        </p>
      </div>
      {issueCount > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 bg-destructive/10 text-destructive rounded-full">
          {issueCount}
        </span>
      )}
    </div>
  );
}

// Overall health indicator
function HealthIndicator({ health, issues }: { health: number; issues: number }) {
  const getHealthColor = () => {
    if (health >= 90) return 'text-green-500';
    if (health >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = () => {
    if (health >= 90) return 'bg-green-500/20';
    if (health >= 70) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', getHealthBg())}>
      <i className={cn('fas fa-shield-alt', getHealthColor())}></i>
      <div className="flex-1">
        <p className={cn('text-sm font-bold', getHealthColor())}>
          {Math.round(health)}%
        </p>
        <p className="text-[10px] text-muted-foreground">
          {issues > 0 ? `${issues} issues` : 'All systems operational'}
        </p>
      </div>
    </div>
  );
}

export default function AgentSidebar({ className, collapsed = false, onToggle }: AgentSidebarProps) {
  const [localOpen, setLocalOpen] = useState(true);
  const [centralOpen, setCentralOpen] = useState(true);

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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <i className="fas fa-robot text-primary"></i>
          <span className="font-semibold text-sm">Agents & Bots</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">
            {onlineCount}/{totalBots}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => refetch()}
          >
            <i className={cn('fas fa-sync-alt text-xs', isLoading && 'animate-spin')}></i>
          </Button>
        </div>
      </div>

      {/* Overall Health */}
      <div className="px-3 py-3">
        <HealthIndicator health={overallHealth} issues={totalIssues} />
      </div>

      {/* Bot Sections */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {/* Local Bots Section */}
        <Collapsible open={localOpen} onOpenChange={setLocalOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            <i className={cn('fas fa-chevron-right transition-transform', localOpen && 'rotate-90')}></i>
            <span>Local Bots</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-muted rounded-full">
              {localBots.length}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {localBots.length > 0 ? (
              localBots.map((bot: any) => (
                <BotCard key={bot.id} bot={bot} type="local" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-2 py-2">
                No local bots configured
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Central Bots Section */}
        <Collapsible open={centralOpen} onOpenChange={setCentralOpen}>
          <CollapsibleTrigger className="flex items-center gap-2 w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors">
            <i className={cn('fas fa-chevron-right transition-transform', centralOpen && 'rotate-90')}></i>
            <span>Central Bots</span>
            <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-muted rounded-full">
              {centralBots.length}
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {centralBots.length > 0 ? (
              centralBots.map((bot: any) => (
                <BotCard key={bot.id} bot={bot} type="central" />
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-2 py-2">
                Unable to connect to central bots
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Quick Actions */}
      <div className="px-3 py-2 border-t border-border space-y-2">
        {totalIssues > 0 && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-destructive/10 rounded-md">
            <i className="fas fa-exclamation-triangle text-destructive text-xs"></i>
            <span className="text-xs text-destructive font-medium">
              {totalIssues} issue{totalIssues !== 1 ? 's' : ''} detected
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border">
        <Link href="/panel/admin/agents">
          <Button variant="outline" size="sm" className="w-full justify-between text-xs">
            <span>View All Agents</span>
            <i className="fas fa-arrow-right text-[10px]"></i>
          </Button>
        </Link>
      </div>
    </div>
  );

  if (isError) {
    return (
      <aside className={cn('w-56 bg-card border-l border-border', className)}>
        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
          <i className="fas fa-exclamation-circle text-2xl text-destructive mb-2"></i>
          <p className="text-sm text-muted-foreground">Failed to load agents</p>
          <Button variant="ghost" size="sm" onClick={() => refetch()} className="mt-2">
            <i className="fas fa-redo mr-2"></i>
            Retry
          </Button>
        </div>
      </aside>
    );
  }

  return (
    <aside className={cn('w-56 bg-card border-l border-border', className)}>
      {sidebarContent}
    </aside>
  );
}

// Floating version for mobile/compact layouts
export function FloatingAgentButton() {
  const { totalIssues, overallHealth } = useAllAgents();
  const [open, setOpen] = useState(false);

  const getHealthColor = () => {
    if (overallHealth >= 90) return 'bg-green-500';
    if (overallHealth >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg border-2"
        >
          <div className="relative">
            <i className="fas fa-robot text-lg"></i>
            <span className={cn('absolute -top-1 -right-1 w-3 h-3 rounded-full', getHealthColor())} />
            {totalIssues > 0 && (
              <span className="absolute -bottom-1 -right-1 text-[9px] px-1 bg-destructive text-destructive-foreground rounded-full">
                {totalIssues}
              </span>
            )}
          </div>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-64 p-0">
        <AgentSidebar />
      </SheetContent>
    </Sheet>
  );
}
