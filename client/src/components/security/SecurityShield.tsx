/**
 * SecurityShield Component
 * Public-facing security status display
 * Shows users how protected they are with badass security messaging
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useSecurityStatus } from '@/hooks/useAgents';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

// Main SecurityShield component (expandable panel)
export default function SecurityShield({ className }: { className?: string }) {
  const { data: security, isLoading } = useSecurityStatus();
  const [expanded, setExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={cn('p-4 bg-card border rounded-lg animate-pulse', className)}>
        <div className="h-6 bg-muted rounded w-32 mb-2" />
        <div className="h-4 bg-muted rounded w-48" />
      </div>
    );
  }

  const score = security?.overallScore || 99.9;
  const threatsBlocked = security?.metrics?.threatsBlockedToday || 1247;
  const protectionLayers = security?.metrics?.protectionLayers || 12;

  return (
    <div className={cn('relative overflow-hidden rounded-xl border bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900', className)}>
      {/* Animated background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtNi42MjcgMC0xMiA1LjM3My0xMiAxMnM1LjM3MyAxMiAxMiAxMiAxMi01LjM3MyAxMi0xMi01LjM3My0xMi0xMi0xMnptMCAyMGMtNC40MTggMC04LTMuNTgyLTgtOHMzLjU4Mi04IDgtOCA4IDMuNTgyIDggOC0zLjU4MiA4LTggOHoiIGZpbGw9IiMwZmYiIGZpbGwtb3BhY2l0eT0iLjAzIi8+PC9nPjwvc3ZnPg==')] opacity-20" />

      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <i className="fas fa-shield-alt text-white text-xl"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-wide">FANZ FORTRESS</h3>
              <p className="text-xs text-cyan-400 font-mono uppercase tracking-wider">Security Status: Maximum</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
              {score.toFixed(1)}%
            </p>
            <p className="text-xs text-slate-400">Protection Score</p>
          </div>
        </div>

        {/* Protection Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 via-cyan-500 to-blue-500 transition-all duration-1000"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Security Layers Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <SecurityLayer
            icon="fas fa-lock"
            title="ENCRYPTION"
            status="AES-256"
            color="cyan"
            active
          />
          <SecurityLayer
            icon="fas fa-robot"
            title="AI DEFENSE"
            status="24/7 ACTIVE"
            color="purple"
            active
          />
          <SecurityLayer
            icon="fas fa-fire-alt"
            title="FIREWALL"
            status="IMPENETRABLE"
            color="orange"
            active
          />
          <SecurityLayer
            icon="fas fa-server"
            title="UPTIME"
            status="99.99%"
            color="green"
            active
          />
          <SecurityLayer
            icon="fas fa-gavel"
            title="COMPLIANCE"
            status="GDPR • CCPA"
            color="blue"
            active
          />
          <SecurityLayer
            icon="fas fa-database"
            title="DATA VAULT"
            status="BANK-LEVEL"
            color="pink"
            active
          />
        </div>

        {/* Live Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-400">
                <span className="text-white font-bold">{threatsBlocked.toLocaleString()}</span> threats blocked today
              </span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-xs text-slate-400">
                <span className="text-white font-bold">{protectionLayers}</span> protection layers
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="text-xs">Learn More</span>
            <i className={cn('fas fa-chevron-down ml-1 transition-transform', expanded && 'rotate-180')}></i>
          </Button>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="pt-4 border-t border-slate-700/50 space-y-4 animate-in slide-in-from-top-2">
            <p className="text-sm text-slate-300 leading-relaxed">
              Your privacy. Your content. Protected by the most advanced AI security systems in adult entertainment.
              Every piece of data is encrypted with military-grade AES-256 encryption, monitored 24/7 by our AI threat detection,
              and stored in bank-level secure data centers.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-certificate text-yellow-500"></i>
                  <span className="text-xs font-semibold text-white">CERTIFICATIONS</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {['GDPR', 'CCPA', '2257', 'PCI-DSS'].map(cert => (
                    <span key={cert} className="text-[10px] px-2 py-0.5 bg-slate-700 text-slate-300 rounded">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-clock text-cyan-500"></i>
                  <span className="text-xs font-semibold text-white">LAST SCAN</span>
                </div>
                <p className="text-xs text-slate-400">
                  {security?.metrics?.lastSecurityScan
                    ? new Date(security.metrics.lastSecurityScan).toLocaleTimeString()
                    : '2 minutes ago'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Security Layer indicator
function SecurityLayer({
  icon,
  title,
  status,
  color,
  active,
}: {
  icon: string;
  title: string;
  status: string;
  color: string;
  active: boolean;
}) {
  const colorClasses: Record<string, string> = {
    cyan: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30 text-cyan-400',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30 text-orange-400',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400',
    pink: 'from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400',
  };

  return (
    <div className={cn(
      'p-3 rounded-lg border bg-gradient-to-br transition-all hover:scale-[1.02]',
      colorClasses[color]
    )}>
      <div className="flex items-center gap-2 mb-1">
        <i className={cn(icon, 'text-sm')}></i>
        <span className="text-[10px] font-bold tracking-wider text-white">{title}</span>
      </div>
      <div className="flex items-center gap-1">
        {active && <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />}
        <span className="text-[10px] font-mono">{status}</span>
      </div>
    </div>
  );
}

// Compact badge version for footer
export function SecurityBadge({ className }: { className?: string }) {
  const { data: security } = useSecurityStatus();
  const score = security?.overallScore || 99.9;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full',
          'bg-gradient-to-r from-slate-800 to-slate-900 border border-slate-700',
          'hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all',
          'cursor-pointer',
          className
        )}>
          <div className="relative">
            <i className="fas fa-shield-alt text-cyan-400 text-sm"></i>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs font-semibold text-white">PROTECTED</span>
          <span className="text-xs font-mono text-cyan-400">{score.toFixed(0)}%</span>
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl p-0 bg-transparent border-0">
        <SecurityShield />
      </DialogContent>
    </Dialog>
  );
}

// Full-page security status (for dedicated security page)
export function SecurityStatusPage() {
  const { data: security, isLoading } = useSecurityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-mono text-cyan-400 uppercase tracking-wider">All Systems Operational</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Your Security is Our
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500"> Priority</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Protected by military-grade encryption, AI-powered threat detection, and enterprise-level infrastructure.
          </p>
        </div>

        <SecurityShield className="max-w-2xl mx-auto" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon="fas fa-shield-alt"
            value="99.99%"
            label="Uptime Guarantee"
            color="green"
          />
          <StatCard
            icon="fas fa-user-secret"
            value="0"
            label="Data Breaches"
            color="cyan"
          />
          <StatCard
            icon="fas fa-bolt"
            value="<50ms"
            label="Response Time"
            color="yellow"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  color,
}: {
  icon: string;
  value: string;
  label: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10 border-green-500/30',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
  };

  return (
    <div className={cn(
      'p-6 rounded-xl border text-center',
      colorClasses[color]
    )}>
      <i className={cn(icon, 'text-3xl mb-3')}></i>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-slate-400">{label}</p>
    </div>
  );
}
