import { motion } from "framer-motion";
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
          <Link href="/fanz-singularity">
            <a className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all">
              <i className="fas fa-atom" />
              View in FANZ Singularity
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
  return (
    <EcosystemPlaceholder
      name="FanzDefend"
      tagline="Protect your content and brand"
      icon="fas fa-shield-alt"
      color="from-green-500 to-emerald-600"
      status="LIVE"
      features={[
        "Content piracy detection",
        "DMCA takedown automation",
        "Brand monitoring",
        "Watermarking tools",
        "Legal support resources"
      ]}
    />
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
      color="from-blue-500 to-cyan-600"
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
      color="from-cyan-500 to-blue-600"
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
