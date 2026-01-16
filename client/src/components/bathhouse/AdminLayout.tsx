import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { SteamParticles, FogOverlay } from './SteamParticles';
import {
  Shield,
  Users,
  MessageSquare,
  CreditCard,
  Video,
  Settings,
  AlertTriangle,
  BarChart3,
  FileText,
  Lock
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  zone?: 'control-room' | 'security-booth' | 'cashier' | 'camera-room' | 'maintenance' | 'registry';
}

// Zone configurations for different admin areas
const zoneConfig = {
  'control-room': {
    icon: BarChart3,
    label: 'MAIN CONTROL ROOM',
    color: '#475569',
    description: 'System Overview & Monitoring'
  },
  'security-booth': {
    icon: Shield,
    label: 'SECURITY BOOTH',
    color: '#ff6600',
    description: 'Content Moderation & Verification'
  },
  'cashier': {
    icon: CreditCard,
    label: 'CASHIER BOOTH',
    color: '#00ff88',
    description: 'Payments & Transactions'
  },
  'camera-room': {
    icon: Video,
    label: 'CAMERA ROOM',
    color: '#ff0044',
    description: 'Live Streaming & Media'
  },
  'maintenance': {
    icon: Settings,
    label: 'MAINTENANCE CLOSET',
    color: '#ffcc00',
    description: 'System Configuration'
  },
  'registry': {
    icon: Users,
    label: 'GUEST REGISTRY',
    color: '#8855ff',
    description: 'User Management'
  }
};

export function AdminLayout({
  children,
  title,
  subtitle,
  zone = 'control-room'
}: AdminLayoutProps) {
  const config = zoneConfig[zone];
  const ZoneIcon = config.icon;

  return (
    <div className="control-room min-h-screen relative">
      {/* Subtle ambient fog in corners */}
      <FogOverlay intensity="light" />

      {/* Fluorescent ceiling lights */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-500/30 to-transparent" />

      {/* Zone indicator bar */}
      <div className="admin-zone-nav sticky top-0 z-10">
        <div className="flex items-center gap-4 w-full">
          {/* Zone Badge */}
          <motion.div
            className="flex items-center gap-3 px-4 py-2 rounded"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              background: `linear-gradient(135deg, ${config.color}15, transparent)`,
              border: `1px solid ${config.color}40`
            }}
          >
            <div
              className="status-light"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${config.color}, ${config.color}88)`,
                boxShadow: `0 0 8px ${config.color}80`
              }}
            />
            <ZoneIcon className="w-4 h-4" style={{ color: config.color }} />
            <span
              className="text-xs font-bold tracking-wider"
              style={{ color: config.color }}
            >
              {config.label}
            </span>
          </motion.div>

          {/* Quick Access Keys */}
          <div className="hidden md:flex items-center gap-2 ml-auto">
            <QuickAccessKey label="DASH" href="/panel/admin/dashboard" active={zone === 'control-room'} />
            <QuickAccessKey label="USERS" href="/panel/admin/users" active={zone === 'registry'} />
            <QuickAccessKey label="MOD" href="/panel/admin/moderation" active={zone === 'security-booth'} />
            <QuickAccessKey label="PAY" href="/panel/admin/payment-settings" active={zone === 'cashier'} />
            <QuickAccessKey label="LIVE" href="/panel/admin/streaming" active={zone === 'camera-room'} />
            <QuickAccessKey label="SYS" href="/panel/admin/system-settings" active={zone === 'maintenance'} />
          </div>
        </div>
      </div>

      {/* Page Header */}
      {(title || subtitle) && (
        <motion.div
          className="px-6 py-6 border-b border-gray-700/50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-4">
            {/* Room Number Plate */}
            <div className="control-panel-header rounded-lg px-4 py-3">
              <ZoneIcon className="w-6 h-6 text-slate-400" />
            </div>

            <div>
              {title && (
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="control-panel-title">{title}</span>
                </h1>
              )}
              {subtitle && (
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>

            {/* System Status Lights */}
            <div className="ml-auto hidden lg:flex items-center gap-6">
              <StatusLight label="POWER" status="green" />
              <StatusLight label="NETWORK" status="green" />
              <StatusLight label="DATABASE" status="green" />
              <StatusLight label="STORAGE" status="yellow" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content Area */}
      <motion.div
        className="p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {children}
      </motion.div>

      {/* Bottom Status Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-900/95 border-t border-gray-700/50 px-6 py-2 flex items-center justify-between text-xs z-50">
        <div className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            SECURE SESSION
          </span>
          <span>|</span>
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center gap-4 text-gray-500">
          <span className="text-slate-400">ADMIN LEVEL: MASTER</span>
          <span>|</span>
          <span>BATHHOUSE CONTROL SYSTEM v2.0</span>
        </div>
      </div>
    </div>
  );
}

// Quick Access Key Component (like key tags on a key rack)
function QuickAccessKey({
  label,
  href,
  active = false
}: {
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <a
      href={href}
      className={`key-tag transition-all duration-150 ${
        active
          ? 'bg-gradient-to-br from-slate-400 to-slate-600 text-gray-900 shadow-lg shadow-slate-500/30'
          : 'bg-gradient-to-br from-amber-200 to-amber-400 hover:from-amber-100 hover:to-amber-300'
      }`}
      style={{
        textDecoration: 'none',
        cursor: 'pointer'
      }}
    >
      {label}
    </a>
  );
}

// Status Light Component
function StatusLight({
  label,
  status
}: {
  label: string;
  status: 'green' | 'yellow' | 'red' | 'cyan';
}) {
  return (
    <div className="flex items-center gap-2">
      <div className={`status-light status-light-${status}`} />
      <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
    </div>
  );
}

// Control Panel Card Component for Admin
export function ControlPanelCard({
  children,
  title,
  icon: Icon,
  className = ''
}: {
  children: ReactNode;
  title?: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <motion.div
      className={`control-panel ${className}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {title && (
        <div className="control-panel-header">
          {Icon && <Icon className="w-4 h-4 text-slate-400" />}
          <span className="control-panel-title">{title}</span>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}

// Monitor Card Component for displaying data
export function MonitorCard({
  children,
  title,
  showScanlines = true,
  className = ''
}: {
  children: ReactNode;
  title?: string;
  showScanlines?: boolean;
  className?: string;
}) {
  return (
    <div className={`monitor-card ${showScanlines ? 'monitor-scanline' : ''} ${className}`}>
      {title && (
        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
          {title}
        </div>
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Admin Stat Card
export function AdminStatCard({
  value,
  label,
  trend,
  trendUp = true,
  color = 'cyan'
}: {
  value: string | number;
  label: string;
  trend?: string;
  trendUp?: boolean;
  color?: 'cyan' | 'green' | 'red' | 'yellow' | 'purple';
}) {
  const colors = {
    cyan: '#475569',
    green: '#00ff88',
    red: '#ff4444',
    yellow: '#ffcc00',
    purple: '#8855ff'
  };

  return (
    <motion.div
      className="admin-stat-card"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <div
        className="admin-stat-value"
        style={{ color: colors[color], textShadow: `0 0 10px ${colors[color]}40` }}
      >
        {value}
      </div>
      <div className="admin-stat-label">{label}</div>
      {trend && (
        <div className={`text-xs mt-2 ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </motion.div>
  );
}

// Camera Feed Style Container
export function CameraFeed({
  children,
  label,
  className = ''
}: {
  children: ReactNode;
  label?: string;
  className?: string;
}) {
  return (
    <div className={`camera-feed ${className}`}>
      <div className="relative z-10">
        {children}
      </div>
      {label && (
        <div className="camera-timestamp">
          CAM: {label}
        </div>
      )}
    </div>
  );
}

// Maintenance Panel for Settings
export function MaintenancePanel({
  children,
  title,
  warning = false,
  className = ''
}: {
  children: ReactNode;
  title?: string;
  warning?: boolean;
  className?: string;
}) {
  return (
    <div className={`maintenance-panel ${className}`}>
      {warning && <div className="warning-stripes" />}
      {title && (
        <div className="px-4 py-3 border-b border-gray-700/50">
          <h3 className="text-sm font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {title}
          </h3>
        </div>
      )}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export default AdminLayout;
