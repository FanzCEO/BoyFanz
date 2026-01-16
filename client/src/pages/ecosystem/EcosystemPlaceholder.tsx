import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";

interface EcosystemPlaceholderProps {
  name: string;
  tagline: string;
  icon: string;
  color: string;
  features: string[];
  status: "LIVE" | "BETA" | "COMING SOON";
}

export default function EcosystemPlaceholder({
  name,
  tagline,
  icon,
  color,
  features,
  status
}: EcosystemPlaceholderProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${color} mb-6`}>
            <i className={`${icon} text-4xl text-white`} />
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-4">{name}</h1>
          <p className="text-xl text-gray-400 mb-6">{tagline}</p>

          <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${
            status === "LIVE" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
            status === "BETA" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
            "bg-blue-500/20 text-blue-400 border border-blue-500/30"
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              status === "LIVE" ? "bg-green-400" :
              status === "BETA" ? "bg-yellow-400" :
              "bg-blue-400"
            } animate-pulse`} />
            {status}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Features</h2>
          <div className="grid gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-gray-800/50 border border-gray-700 rounded-xl"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
                  <i className="fas fa-check text-white" />
                </div>
                <span className="text-gray-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-16"
        >
          <Link href="/empire">
            <a className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all">
              <i className="fas fa-atom" />
              View in FANZ Empire
            </a>
          </Link>
        </motion.div>

        <div className="text-center mt-12 text-gray-600 text-sm">
          Part of the <span className="text-green-400">FANZ SINGULARITY</span>
        </div>
      </div>
    </div>
  );
}

// Pre-configured pages
export function StarzStudio() {
  return (
    <EcosystemPlaceholder
      name="Starz Studio"
      tagline="Professional creator tools for content production"
      icon="fas fa-star"
      color="from-purple-500 to-violet-600"
      status="LIVE"
      features={[
        "Advanced video editing suite",
        "AI-powered content optimization",
        "Multi-platform publishing",
        "Analytics dashboard",
        "Collaboration tools"
      ]}
    />
  );
}

export function FanzDefendPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // FanzDefend external platform URL - frames the dedicated security platform
  const FANZDEFEND_URL = "https://defend.fanz.website";

  return (
    <div className="h-full w-full bg-gray-900">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-700 border-b border-green-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <i className="fas fa-shield-alt text-white text-lg" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg">FanzDefend</h1>
            <p className="text-xs text-green-200">Content Protection & DMCA Automation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-green-500/20 border border-green-400/30 rounded text-green-300 text-xs font-medium">
            <i className="fas fa-circle text-green-400 text-[6px] mr-1 animate-pulse" />
            PROTECTED
          </span>
          <a
            href={FANZDEFEND_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition-colors"
          >
            <i className="fas fa-external-link-alt mr-1" />
            Open Full App
          </a>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 top-14 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mb-4" />
            <p className="text-gray-400">Loading FanzDefend...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-gray-900">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
              <i className="fas fa-exclamation-triangle text-red-400 text-3xl" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Unable to Load FanzDefend</h2>
            <p className="text-gray-400 mb-6">
              The FanzDefend platform is temporarily unavailable. Please try again or access it directly.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { setHasError(false); setIsLoading(true); }}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
              >
                <i className="fas fa-redo mr-2" />
                Retry
              </button>
              <a
                href={FANZDEFEND_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
              >
                <i className="fas fa-external-link-alt mr-2" />
                Open Direct
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Iframe Container */}
      <iframe
        src={FANZDEFEND_URL}
        className={`w-full h-[calc(100vh-120px)] border-0 ${isLoading || hasError ? 'invisible' : 'visible'}`}
        title="FanzDefend - Content Protection Platform"
        onLoad={() => setIsLoading(false)}
        onError={() => { setIsLoading(false); setHasError(true); }}
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-modals"
        loading="lazy"
      />
    </div>
  );
}

export function FanzForgePage() {
  return (
    <EcosystemPlaceholder
      name="FanzForge"
      tagline="Build and customize your platform"
      icon="fas fa-hammer"
      color="from-orange-500 to-red-600"
      status="BETA"
      features={[
        "Custom theme builder",
        "Widget marketplace",
        "API integrations",
        "White-label solutions",
        "Developer tools"
      ]}
    />
  );
}

export function FanzFiliatePage() {
  return (
    <EcosystemPlaceholder
      name="FanzFiliate"
      tagline="Grow your network, earn commissions"
      icon="fas fa-handshake"
      color="from-blue-500 to-slate-600"
      status="LIVE"
      features={[
        "Affiliate tracking dashboard",
        "Multi-tier commission structure",
        "Custom referral links",
        "Real-time analytics",
        "Automated payouts"
      ]}
    />
  );
}

export function FanzVarsityPage() {
  return (
    <EcosystemPlaceholder
      name="FanzVarsity"
      tagline="Learn from the best creators"
      icon="fas fa-graduation-cap"
      color="from-indigo-500 to-purple-600"
      status="LIVE"
      features={[
        "Creator masterclasses",
        "Marketing tutorials",
        "Business courses",
        "Community mentorship",
        "Certification programs"
      ]}
    />
  );
}

export function FanzMeetPage() {
  return (
    <EcosystemPlaceholder
      name="FanzMeet"
      tagline="Video calls for creators and fans"
      icon="fas fa-video"
      color="from-slate-500 to-blue-600"
      status="LIVE"
      features={[
        "1-on-1 video calls",
        "Group meetings",
        "Screen sharing",
        "Recording & playback",
        "Integrated payments"
      ]}
    />
  );
}

export function FanzSwipePage() {
  return (
    <EcosystemPlaceholder
      name="FanzSwipe"
      tagline="Connect with like-minded creators"
      icon="fas fa-heart"
      color="from-pink-500 to-rose-600"
      status="BETA"
      features={[
        "Creator matching",
        "Collaboration finder",
        "Networking events",
        "Direct messaging",
        "Profile verification"
      ]}
    />
  );
}

export function FanzWorldPage() {
  return (
    <EcosystemPlaceholder
      name="FanzWorld"
      tagline="The creator metaverse"
      icon="fas fa-globe-americas"
      color="from-violet-500 to-purple-600"
      status="COMING SOON"
      features={[
        "Virtual creator spaces",
        "3D content galleries",
        "Live virtual events",
        "NFT integration",
        "Immersive experiences"
      ]}
    />
  );
}

export function FanzIncognitoPage() {
  return (
    <EcosystemPlaceholder
      name="FanzIncognito"
      tagline="Private browsing mobile app"
      icon="fas fa-user-secret"
      color="from-gray-600 to-gray-800"
      status="LIVE"
      features={[
        "Stealth mode browsing",
        "No app icon visible",
        "Biometric lock",
        "Private notifications",
        "Secure vault storage"
      ]}
    />
  );
}

export function FanzCloudPage() {
  return (
    <EcosystemPlaceholder
      name="FanzCloud"
      tagline="Secure mobile content vault"
      icon="fas fa-cloud"
      color="from-sky-500 to-blue-600"
      status="LIVE"
      features={[
        "Encrypted cloud storage",
        "Automatic backup",
        "Cross-device sync",
        "Media organization",
        "Offline access"
      ]}
    />
  );
}

export function StarzCardzPage() {
  return (
    <EcosystemPlaceholder
      name="StarzCardz"
      tagline="Creator payment cards"
      icon="fas fa-id-card"
      color="from-amber-500 to-orange-600"
      status="LIVE"
      features={[
        "Instant payouts to card",
        "Virtual & physical cards",
        "Cashback rewards",
        "Expense tracking",
        "International support"
      ]}
    />
  );
}

export function WickedCRMPage() {
  return (
    <EcosystemPlaceholder
      name="WickedCRM"
      tagline="Professional fan management"
      icon="fas fa-address-book"
      color="from-red-500 to-pink-600"
      status="LIVE"
      features={[
        "Fan database management",
        "Automated messaging",
        "Segmentation & targeting",
        "Revenue analytics",
        "Campaign automation"
      ]}
    />
  );
}

export function FanzTubePage() {
  return (
    <EcosystemPlaceholder
      name="FanzTube"
      tagline="Premium video streaming"
      icon="fas fa-play-circle"
      color="from-red-600 to-red-800"
      status="LIVE"
      features={[
        "4K video streaming",
        "Content categories",
        "Creator channels",
        "Watch history",
        "Recommendations engine"
      ]}
    />
  );
}

/**
 * FanzCybersecure - Security & Privacy Center
 * Elegant bathhouse aesthetic - calm, sophisticated, trustworthy
 */
export function FanzCybersecurePage() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);

  const securityLayers = [
    { id: 'shield', name: 'Content Shield', desc: 'DMCA protection & takedown automation', icon: 'fas fa-shield-alt', color: '#10b981' },
    { id: 'vault', name: 'Secure Vault', desc: 'End-to-end encrypted storage', icon: 'fas fa-lock', color: '#6366f1' },
    { id: 'identity', name: 'Identity Guard', desc: 'Privacy protection & anonymity tools', icon: 'fas fa-user-shield', color: '#8b5cf6' },
    { id: 'payment', name: 'Payment Security', desc: 'PCI-compliant transaction protection', icon: 'fas fa-credit-card', color: '#f59e0b' },
    { id: 'monitoring', name: '24/7 Monitoring', desc: 'Real-time threat detection', icon: 'fas fa-eye', color: '#ec4899' },
    { id: 'backup', name: 'Auto Backup', desc: 'Continuous data protection', icon: 'fas fa-cloud', color: '#06b6d4' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 p-6 md:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/20 mb-6">
            <i className="fas fa-shield-alt text-3xl text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              FanzCybersecure
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Your privacy and security are our top priority. Rest easy knowing your content and data are protected.
          </p>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-6 mb-12"
        >
          {[
            { icon: 'fas fa-check-circle', label: 'Bank-Level Encryption' },
            { icon: 'fas fa-check-circle', label: 'GDPR Compliant' },
            { icon: 'fas fa-check-circle', label: 'PCI DSS Certified' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-emerald-400/80">
              <i className={`${item.icon} text-sm`} />
              <span className="text-sm">{item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Security Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 text-center">
            <div className="relative w-32 h-32 mx-auto mb-6">
              {/* Outer ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" fill="none" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="8" />
                <motion.circle
                  cx="64" cy="64" r="58"
                  fill="none"
                  stroke="url(#securityGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={364}
                  initial={{ strokeDashoffset: 364 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="securityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <i className="fas fa-shield-alt text-2xl text-emerald-400 mb-1" />
                <span className="text-xs text-gray-400">SECURE</span>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">You're Protected</h3>
            <p className="text-gray-400 text-sm">All security layers active and monitoring</p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-sm">All systems operational</span>
            </div>
          </div>
        </motion.div>

        {/* Security Layers Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-300">Security Layers</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {securityLayers.map((layer, i) => (
              <motion.div
                key={layer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                onMouseEnter={() => setActiveLayer(layer.id)}
                onMouseLeave={() => setActiveLayer(null)}
                className={`p-5 rounded-xl border transition-all duration-300 cursor-default ${
                  activeLayer === layer.id
                    ? 'bg-gray-800/50 border-gray-600/50 scale-[1.02]'
                    : 'bg-gray-800/20 border-gray-700/30 hover:bg-gray-800/30'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: layer.color + '15' }}
                  >
                    <i className={`${layer.icon} text-lg`} style={{ color: layer.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium text-white mb-1">{layer.name}</h3>
                    <p className="text-sm text-gray-400">{layer.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs text-emerald-400/80">Active</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-12 pb-6"
        >
          <p className="text-gray-500 text-sm">
            Protected by <span className="text-emerald-400/70">FANZ Enterprise Security</span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * FanzNeuroverse - AI NEURAL COMMAND CENTER
 * Cinematic AI visualization with synaptic connections
 */
export function FanzNeurovorsePage() {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Neural network animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const nodes: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];
    const nodeCount = 80;

    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ['#a855f7', '#ec4899', '#06b6d4', '#8b5cf6', '#f472b6'][Math.floor(Math.random() * 5)]
      });
    }

    let animationId: number;
    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            const opacity = (1 - dist / 150) * 0.3;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(168, 85, 247, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw and update nodes
      nodes.forEach((node) => {
        // Draw glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 4);
        gradient.addColorStop(0, node.color + '60');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw node
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
        ctx.fill();

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Bounce off edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Pulse animation for AI models
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIndex(prev => (prev + 1) % 5);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const aiModels = [
    { id: 'gpt', name: 'FanzGPT', desc: 'Language Intelligence', icon: 'fas fa-comments', color: '#a855f7' },
    { id: 'vision', name: 'FanzVision', desc: 'Visual Processing', icon: 'fas fa-eye', color: '#06b6d4' },
    { id: 'predict', name: 'FanzPredict', desc: 'Predictive Engine', icon: 'fas fa-chart-line', color: '#22c55e' },
    { id: 'guard', name: 'FanzGuard', desc: 'Security Matrix', icon: 'fas fa-shield-alt', color: '#ef4444' },
    { id: 'recommend', name: 'FanzMatch', desc: 'Discovery AI', icon: 'fas fa-magic', color: '#ec4899' },
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Neural network canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-cyan-900/20 z-[1]" />
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black z-[1]" />

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          {/* Animated brain icon */}
          <div className="relative inline-block mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="w-32 h-32 rounded-full border border-purple-500/30"
              style={{ borderStyle: 'dashed' }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-2 rounded-full border border-pink-500/30"
              style={{ borderStyle: 'dashed' }}
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-4 rounded-full border border-cyan-500/30"
              style={{ borderStyle: 'dashed' }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 30px #a855f7, 0 0 60px #a855f750',
                    '0 0 50px #ec4899, 0 0 100px #ec489950',
                    '0 0 30px #06b6d4, 0 0 60px #06b6d450',
                    '0 0 30px #a855f7, 0 0 60px #a855f750',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 flex items-center justify-center"
              >
                <i className="fas fa-brain text-3xl text-white" />
              </motion.div>
            </div>
          </div>

          <motion.h1
            animate={{
              textShadow: [
                '0 0 20px #a855f7',
                '0 0 40px #ec4899',
                '0 0 20px #06b6d4',
                '0 0 20px #a855f7',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="text-5xl md:text-7xl font-black mb-2"
          >
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              NEUROVERSE
            </span>
          </motion.h1>
          <p className="text-purple-400/60 text-sm tracking-[0.5em]">ARTIFICIAL INTELLIGENCE LAYER</p>
        </motion.div>

        {/* Central AI visualization */}
        <div className="max-w-4xl mx-auto mb-12">
          {/* Hexagonal AI model grid */}
          <div className="relative flex justify-center items-center py-8">
            {/* Center core */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center z-20"
              style={{ boxShadow: '0 0 50px #a855f7, 0 0 100px #a855f750' }}
            >
              <i className="fas fa-atom text-3xl text-white animate-spin" style={{ animationDuration: '10s' }} />
            </motion.div>

            {/* Orbiting AI models */}
            <div className="relative w-80 h-80">
              {aiModels.map((model, i) => {
                const angle = (i / aiModels.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 130;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                return (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    className="absolute cursor-pointer group"
                    style={{
                      left: `calc(50% + ${x}px - 40px)`,
                      top: `calc(50% + ${y}px - 40px)`,
                    }}
                  >
                    {/* Connection line to center */}
                    <svg
                      className="absolute pointer-events-none"
                      style={{
                        left: 40,
                        top: 40,
                        width: Math.abs(x) + 20,
                        height: Math.abs(y) + 20,
                        transform: `translate(${x < 0 ? x : 0}px, ${y < 0 ? y : 0}px)`,
                        overflow: 'visible'
                      }}
                    >
                      <line
                        x1={x < 0 ? Math.abs(x) : 0}
                        y1={y < 0 ? Math.abs(y) : 0}
                        x2={x < 0 ? 0 : x}
                        y2={y < 0 ? 0 : y}
                        stroke={model.color}
                        strokeWidth="1"
                        opacity={pulseIndex === i ? 0.8 : 0.2}
                        strokeDasharray={pulseIndex === i ? "none" : "4 4"}
                      />
                    </svg>

                    {/* Model node */}
                    <motion.div
                      animate={pulseIndex === i ? {
                        scale: [1, 1.15, 1],
                        boxShadow: [`0 0 20px ${model.color}`, `0 0 40px ${model.color}`, `0 0 20px ${model.color}`]
                      } : {}}
                      transition={{ duration: 0.5 }}
                      className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center transition-all ${
                        selectedModel === model.id ? 'scale-110' : 'group-hover:scale-105'
                      }`}
                      style={{
                        backgroundColor: model.color + '20',
                        border: `2px solid ${model.color}`,
                        boxShadow: selectedModel === model.id ? `0 0 30px ${model.color}` : `0 0 15px ${model.color}50`
                      }}
                    >
                      <i className={`${model.icon} text-2xl mb-1`} style={{ color: model.color }} />
                      <span className="text-[10px] text-white/80 font-medium">{model.name.replace('Fanz', '')}</span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected model details */}
        <AnimatePresence>
          {selectedModel && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="max-w-2xl mx-auto mb-8"
            >
              {(() => {
                const model = aiModels.find(m => m.id === selectedModel);
                if (!model) return null;
                return (
                  <div
                    className="p-6 rounded-2xl backdrop-blur-xl border"
                    style={{
                      background: `linear-gradient(135deg, ${model.color}10, transparent)`,
                      borderColor: model.color + '30'
                    }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: model.color + '30' }}
                      >
                        <i className={`${model.icon} text-2xl`} style={{ color: model.color }} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{model.name}</h3>
                        <p className="text-gray-400">{model.desc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-400 text-sm">Neural pathways active</span>
                    </div>
                  </div>
                );
              })()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bottom status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full">
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map(i => (
                <motion.div
                  key={i}
                  animate={{ height: [8, 20, 8] }}
                  transition={{ duration: 0.5, delay: i * 0.1, repeat: Infinity }}
                  className="w-1 bg-purple-500 rounded-full"
                />
              ))}
            </div>
            <span className="text-purple-300 text-sm">All neural networks synchronized</span>
          </div>
        </motion.div>
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 70%, rgba(0,0,0,0.9) 100%)'
      }} />
    </div>
  );
}
