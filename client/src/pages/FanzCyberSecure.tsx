import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Fingerprint, Server, Cpu, Network, AlertTriangle, CheckCircle2, Zap } from "lucide-react";

export default function FanzCyberSecure() {
  const [threatLevel, setThreatLevel] = useState("NOMINAL");
  const [systemsOnline, setSystemsOnline] = useState(0);
  const [encryptionStatus, setEncryptionStatus] = useState("ACTIVE");

  useEffect(() => {
    // Simulate systems coming online
    const interval = setInterval(() => {
      setSystemsOnline(prev => Math.min(prev + 1, 47));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const securityLayers = [
    {
      icon: Lock,
      name: "AES-256 Military Encryption",
      description: "Bank-grade encryption protecting all data at rest and in transit",
      status: "ACTIVE",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: Shield,
      name: "FanzForensics",
      description: "Real-time threat detection and incident response system",
      status: "MONITORING",
      color: "from-blue-500 to-cyan-600"
    },
    {
      icon: Fingerprint,
      name: "Biometric Auth Layer",
      description: "Multi-factor authentication with biometric verification",
      status: "ENABLED",
      color: "from-purple-500 to-violet-600"
    },
    {
      icon: Eye,
      name: "Zero-Trust Architecture",
      description: "Every request verified, no implicit trust granted",
      status: "ENFORCED",
      color: "from-red-500 to-orange-600"
    },
    {
      icon: Server,
      name: "Distributed Defense Grid",
      description: "Globally distributed infrastructure with automatic failover",
      status: "ONLINE",
      color: "from-amber-500 to-yellow-600"
    },
    {
      icon: Network,
      name: "Neural Threat Detection",
      description: "AI-powered anomaly detection across all endpoints",
      status: "SCANNING",
      color: "from-pink-500 to-rose-600"
    }
  ];

  const certifications = [
    "SOC 2 Type II Compliant",
    "GDPR Certified",
    "PCI DSS Level 1",
    "ISO 27001",
    "HIPAA Ready",
    "CCPA Compliant"
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Grid Background */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 136, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 136, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* Scanning Line Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50"
          animate={{ y: [0, window.innerHeight, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-mono">DEFENSE SYSTEMS ACTIVE</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
            <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              FANZ
            </span>
            <span className="text-white">CYBERSECURE</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light">
            Military-grade protection for the creator economy. Your data. Your content. Your fortress.
          </p>
        </motion.div>

        {/* Live Stats Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-6 mb-16"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-black text-green-400 font-mono">{systemsOnline}/47</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Systems Online</div>
            </div>
            <div>
              <div className="text-4xl font-black text-cyan-400 font-mono">256-BIT</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Encryption</div>
            </div>
            <div>
              <div className="text-4xl font-black text-blue-400 font-mono">0.00ms</div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Breach Time</div>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="text-4xl font-black text-green-400 font-mono">{threatLevel}</span>
              </div>
              <div className="text-gray-500 text-sm uppercase tracking-wider">Threat Level</div>
            </div>
          </div>
        </motion.div>

        {/* Security Layers Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">
            <span className="text-gray-500">{"<"}</span>
            <span className="text-white">DEFENSE_LAYERS</span>
            <span className="text-gray-500">{"/>"}</span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {securityLayers.map((layer, index) => (
              <motion.div
                key={layer.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-gray-900/50 border border-gray-800 rounded-xl p-6 hover:border-gray-600 transition-all duration-300"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${layer.color} opacity-0 group-hover:opacity-5 rounded-xl transition-opacity`} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${layer.color}`}>
                      <layer.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-2 py-1 text-xs font-mono bg-green-500/10 text-green-400 rounded border border-green-500/20">
                      {layer.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2">{layer.name}</h3>
                  <p className="text-gray-500 text-sm">{layer.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FanzForensics Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-cyan-900/20 border border-blue-500/20 rounded-3xl p-8 md:p-12 mb-16"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-500/20 rounded-xl">
              <Cpu className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white">FANZFORENSICS</h2>
              <p className="text-blue-400">Advanced Threat Intelligence Platform</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Real-time behavioral analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Automated incident response</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">Deep packet inspection</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">AI-powered threat prediction</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-gray-300">24/7 Security Operations Center</span>
              </div>
            </div>

            <div className="bg-black/50 rounded-xl p-6 font-mono text-sm">
              <div className="text-green-400 mb-2">$ fanzforensics --status</div>
              <div className="text-gray-500">
                <span className="text-cyan-400">[INFO]</span> Scanning 47 active nodes...<br/>
                <span className="text-cyan-400">[INFO]</span> Neural network: ONLINE<br/>
                <span className="text-green-400">[OK]</span> No threats detected<br/>
                <span className="text-cyan-400">[INFO]</span> Last scan: 0.3s ago<br/>
                <span className="text-yellow-400">[ACTIVE]</span> Real-time monitoring enabled<br/>
                <span className="text-green-400">[SECURE]</span> All systems nominal_<span className="animate-pulse">|</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Encryption Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-green-400" />
              <h3 className="text-2xl font-bold">Military-Grade Encryption</h3>
            </div>
            <p className="text-gray-400 mb-6">
              Every piece of data on FANZ is protected by AES-256 encryption — the same standard used by governments and military organizations worldwide. Your content, messages, and personal information are mathematically impossible to decrypt without authorization.
            </p>
            <div className="bg-black/50 rounded-lg p-4 font-mono text-xs text-green-400 overflow-hidden">
              <div className="animate-pulse">
                ████████████████████████████████<br/>
                █ ENCRYPTION: AES-256-GCM     █<br/>
                █ KEY LENGTH: 256-bit         █<br/>
                █ STATUS: UNBREAKABLE         █<br/>
                ████████████████████████████████
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Zap className="w-8 h-8 text-yellow-400" />
              <h3 className="text-2xl font-bold">Zero-Knowledge Architecture</h3>
            </div>
            <p className="text-gray-400 mb-6">
              We can't see your private content. Period. Our zero-knowledge architecture means your encrypted data remains yours alone. Even with physical access to our servers, your private content stays private.
            </p>
            <div className="flex flex-wrap gap-2">
              {["E2E Encrypted", "Zero Access", "Privacy First", "No Backdoors"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-sm border border-yellow-500/20">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h3 className="text-xl font-bold text-gray-400 mb-6 uppercase tracking-wider">Compliance & Certifications</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {certifications.map((cert) => (
              <div key={cert} className="px-6 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 font-medium">
                {cert}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Footer CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-center py-12 border-t border-gray-800"
        >
          <p className="text-gray-500 text-sm font-mono">
            Built on the <span className="text-cyan-400">FANZ NEXUS</span> • Powered by <span className="text-purple-400">FANZ NEUROVERSE</span> • Within the <span className="text-green-400">FANZ SINGULARITY</span>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes grid-move {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  );
}
