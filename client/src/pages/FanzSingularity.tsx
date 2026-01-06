import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Float, Html } from "@react-three/drei";
import * as THREE from "three";

// 3D Animated Core (NEXUS)
function NexusCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#00ff88"
          wireframe
          emissive="#00ff88"
          emissiveIntensity={0.5}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshStandardMaterial
          color="#0066ff"
          transparent
          opacity={0.3}
          emissive="#0066ff"
          emissiveIntensity={0.3}
        />
      </mesh>
    </Float>
  );
}

// Neuroverse Ring
function NeuroRing({ radius, color, speed }: { radius: number; color: string; speed: number }) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.x = Math.sin(state.clock.elapsedTime * speed) * 0.3;
      ringRef.current.rotation.y = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} />
    </mesh>
  );
}

// Platform Node - Interactive & Clickable
function PlatformNode({
  position,
  color,
  name,
  onClick
}: {
  position: [number, number, number];
  color: string;
  name: string;
  onClick: (name: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
    }
    if (glowRef.current) {
      glowRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1;
      glowRef.current.scale.setScalar(hovered ? 2.5 : 1.8);
    }
  });

  return (
    <group>
      {/* Glow effect */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.4 : 0.15}
        />
      </mesh>
      {/* Main sphere - clickable */}
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(name);
        }}
        scale={hovered ? 1.8 : 1}
      >
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 1.5 : 0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Connection line to core */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([0, 0, 0, ...position])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} opacity={0.4} transparent linewidth={2} />
      </line>
      {/* Platform label when hovered */}
      {hovered && (
        <Html position={[position[0], position[1] + 0.5, position[2]]} center>
          <div className="px-3 py-1 bg-black/90 border border-white/20 rounded-lg text-white text-sm font-bold whitespace-nowrap backdrop-blur-sm">
            {name}
          </div>
        </Html>
      )}
    </group>
  );
}

// Main 3D Scene - Mobile Optimized with Touch Controls
function Scene3D({ onPlatformClick }: { onPlatformClick: (name: string) => void }) {
  const platforms = [
    { name: "BoyFanz", color: "#ff4444", angle: 0, url: "https://boyfanz.fanz.website" },
    { name: "GirlFanz", color: "#ff44ff", angle: 40, url: "https://girlfanz.fanz.website" },
    { name: "GayFanz", color: "#ff8800", angle: 80, url: "https://gayfanz.fanz.website" },
    { name: "TransFanz", color: "#44ffff", angle: 120, url: "https://transfanz.com" },
    { name: "BearFanz", color: "#8844ff", angle: 160, url: "https://bearfanz.com" },
    { name: "MilfFanz", color: "#ff4488", angle: 200, url: "https://milffanz.com" },
    { name: "DaddyFanz", color: "#44ff44", angle: 240, url: "https://daddyfanz.com" },
    { name: "PupFanz", color: "#ffff44", angle: 280, url: "https://pupfanz.com" },
    { name: "CougarFanz", color: "#ff6600", angle: 320, url: "https://cougarfanz.com" },
    // Auxiliary platforms
    { name: "FanzTube", color: "#ff0000", angle: 20, url: "/tube" },
    { name: "StarzStudio", color: "#9900ff", angle: 60, url: "/starz-studio" },
    { name: "FanzDefend", color: "#00ff00", angle: 100, url: "/fanz-defend" },
    { name: "FanzMeet", color: "#0099ff", angle: 140, url: "/fanz-meet" },
    { name: "FanzSwipe", color: "#ff0099", angle: 180, url: "/fanz-swipe" },
    { name: "WickedCRM", color: "#ffcc00", angle: 220, url: "/wicked-crm" },
    { name: "FanzVarsity", color: "#00ffcc", angle: 260, url: "/fanz-varsity" },
    { name: "FanzWorld", color: "#cc00ff", angle: 300, url: "/fanz-world" },
    { name: "StarzCardz", color: "#00ccff", angle: 340, url: "/starz-cardz" },
  ];

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.8} color="#0066ff" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ff00ff" />

      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={0.5} />

      {/* NEXUS Core */}
      <NexusCore />

      {/* NEUROVERSE Rings */}
      <NeuroRing radius={2} color="#8800ff" speed={0.5} />
      <NeuroRing radius={2.5} color="#0088ff" speed={0.3} />
      <NeuroRing radius={3} color="#00ff88" speed={0.2} />

      {/* Platform Nodes - Two orbital rings */}
      {platforms.slice(0, 9).map((platform, i) => {
        const angle = (platform.angle * Math.PI) / 180;
        const radius = 4;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <PlatformNode
            key={platform.name}
            position={[x, Math.sin(i * 0.7) * 0.3, z]}
            color={platform.color}
            name={platform.name}
            onClick={onPlatformClick}
          />
        );
      })}

      {/* Auxiliary platforms - outer ring */}
      {platforms.slice(9).map((platform, i) => {
        const angle = (platform.angle * Math.PI) / 180;
        const radius = 5.5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        return (
          <PlatformNode
            key={platform.name}
            position={[x, Math.sin(i * 0.5) * 0.2, z]}
            color={platform.color}
            name={platform.name}
            onClick={onPlatformClick}
          />
        );
      })}

      {/* Outer Singularity Shell */}
      <mesh>
        <sphereGeometry args={[7, 64, 64]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.02}
          wireframe
        />
      </mesh>

      {/* Touch-friendly OrbitControls */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={4}
        maxDistance={20}
        autoRotate
        autoRotateSpeed={0.3}
        touches={{
          ONE: THREE.TOUCH.ROTATE,
          TWO: THREE.TOUCH.DOLLY_PAN
        }}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.5}
        dampingFactor={0.05}
        enableDamping={true}
      />
    </>
  );
}

// Architecture Layer Card
function LayerCard({
  title,
  subtitle,
  description,
  color,
  icon,
  delay
}: {
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm p-6"
    >
      <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color}`} />
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
          <i className={`${icon} text-2xl text-white`} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white">{title}</h3>
          <p className="text-sm text-gray-400 mb-2">{subtitle}</p>
          <p className="text-gray-500">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function FanzSingularity() {
  const [activeTab, setActiveTab] = useState<"overview" | "architecture" | "platforms">("overview");
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);

  const handlePlatformClick = (name: string) => {
    setSelectedPlatform(name);
    // Navigate to platform or show modal
    const platformUrls: Record<string, string> = {
      "BoyFanz": "https://boyfanz.fanz.website",
      "GirlFanz": "https://girlfanz.fanz.website",
      "GayFanz": "https://gayfanz.fanz.website",
      "TransFanz": "https://transfanz.com",
      "BearFanz": "https://bearfanz.com",
      "MilfFanz": "https://milffanz.com",
      "DaddyFanz": "https://daddyfanz.com",
      "PupFanz": "https://pupfanz.com",
      "CougarFanz": "https://cougarfanz.com",
      "FanzTube": "/tube",
      "StarzStudio": "/starz-studio",
      "FanzDefend": "/fanz-defend",
      "FanzMeet": "/fanz-meet",
      "FanzSwipe": "/fanz-swipe",
      "WickedCRM": "/wicked-crm",
      "FanzVarsity": "/fanz-varsity",
      "FanzWorld": "/fanz-world",
      "StarzCardz": "/starz-cardz",
    };
    // If external URL, open in new tab
    const url = platformUrls[name];
    if (url?.startsWith("http")) {
      window.open(url, "_blank");
    } else if (url) {
      window.location.href = url;
    }
  };

  const platforms = [
    { name: "BoyFanz", category: "Creator Platform", status: "LIVE" },
    { name: "GirlFanz", category: "Creator Platform", status: "LIVE" },
    { name: "GayFanz", category: "Creator Platform", status: "LIVE" },
    { name: "TransFanz", category: "Creator Platform", status: "LIVE" },
    { name: "BearFanz", category: "Creator Platform", status: "LIVE" },
    { name: "MilfFanz", category: "Creator Platform", status: "LIVE" },
    { name: "DaddyFanz", category: "Creator Platform", status: "LIVE" },
    { name: "PupFanz", category: "Creator Platform", status: "LIVE" },
    { name: "CougarFanz", category: "Creator Platform", status: "LIVE" },
    { name: "TabooFanz", category: "Creator Platform", status: "LIVE" },
    { name: "FanzTube", category: "Video Platform", status: "LIVE" },
    { name: "StarzStudio", category: "Creator Tools", status: "LIVE" },
    { name: "FanzDefend", category: "Security", status: "LIVE" },
    { name: "FanzForge", category: "Development", status: "BETA" },
    { name: "FanzFiliate", category: "Affiliate Network", status: "LIVE" },
    { name: "FanzVarsity", category: "Education", status: "LIVE" },
    { name: "FanzMeet", category: "Video Conferencing", status: "LIVE" },
    { name: "FanzSwipe", category: "Dating", status: "BETA" },
    { name: "FanzWorld", category: "Metaverse", status: "ALPHA" },
    { name: "WickedCRM", category: "Business Tools", status: "LIVE" },
    { name: "StarzCardz", category: "Payments", status: "LIVE" },
    { name: "FanzIncognito", category: "Mobile App", status: "LIVE" },
    { name: "FanzCloud", category: "Mobile App", status: "LIVE" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero with 3D Scene */}
      <div className="relative h-screen">
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 10], fov: 60 }}
            style={{ touchAction: 'none' }}
            dpr={[1, 2]}
            performance={{ min: 0.5 }}
          >
            <Suspense fallback={null}>
              <Scene3D onPlatformClick={handlePlatformClick} />
            </Suspense>
          </Canvas>
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center z-10 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="mb-4">
              <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-gray-400 backdrop-blur-sm">
                THE CONNECTED UNIVERSE
              </span>
            </div>
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter mb-4">
              <span className="bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                FANZ
              </span>
            </h1>
            <h2 className="text-4xl md:text-6xl font-black text-white/90 tracking-tight">
              SINGULARITY
            </h2>
            <p className="mt-6 text-xl text-gray-400 max-w-2xl mx-auto">
              One ecosystem. Infinite possibilities.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </div>

      {/* Architecture Section */}
      <div className="container mx-auto px-4 py-24">
        {/* Canonical Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mb-24"
        >
          <h2 className="text-4xl font-black text-center mb-4">
            <span className="text-gray-600">{"// "}</span>
            <span className="text-white">CANONICAL STACK</span>
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            FANZ is not a single platform — it is a connected universe built on three foundational layers.
          </p>

          <div className="space-y-6 max-w-4xl mx-auto">
            <LayerCard
              title="FANZ SINGULARITY"
              subtitle="The Universe"
              description="The total ecosystem of FANZ platforms, creators, and communities operating as one unified experience."
              color="from-green-500 to-emerald-600"
              icon="fas fa-atom"
              delay={0}
            />
            <LayerCard
              title="FANZ NEUROVERSE"
              subtitle="The Intelligence Layer"
              description="Adaptive AI that powers discovery, safety, optimization, and growth across all platforms."
              color="from-purple-500 to-violet-600"
              icon="fas fa-brain"
              delay={0.2}
            />
            <LayerCard
              title="FANZ NEXUS"
              subtitle="The Core Infrastructure"
              description="The foundational infrastructure synchronizing identity, compliance, content, and payments."
              color="from-cyan-500 to-blue-600"
              icon="fas fa-server"
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 mb-24"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">System Status</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 font-mono text-sm">ALL SYSTEMS OPERATIONAL</span>
            </div>
          </div>

          <div className="font-mono text-sm bg-black/50 rounded-xl p-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Universe:</span>
              <span className="text-green-400">FANZ SINGULARITY</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Intelligence Layer:</span>
              <span className="text-purple-400">FANZ NEUROVERSE</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Core Infrastructure:</span>
              <span className="text-cyan-400">FANZ NEXUS</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className="text-green-400">Operational</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Active Platforms:</span>
              <span className="text-white">{platforms.length}+</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Microservices:</span>
              <span className="text-white">200+</span>
            </div>
          </div>
        </motion.div>

        {/* Platform Grid */}
        <div className="mb-24">
          <h2 className="text-3xl font-black text-center mb-12">
            <span className="text-gray-600">{"<"}</span>
            <span className="text-white">CONNECTED_PLATFORMS</span>
            <span className="text-gray-600">{"/>"}</span>
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {platforms.map((platform, index) => (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className="bg-gray-900/50 border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white group-hover:text-green-400 transition-colors">
                    {platform.name}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded font-mono ${
                    platform.status === "LIVE" ? "bg-green-500/20 text-green-400" :
                    platform.status === "BETA" ? "bg-yellow-500/20 text-yellow-400" :
                    "bg-blue-500/20 text-blue-400"
                  }`}>
                    {platform.status}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{platform.category}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Vision Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="max-w-4xl mx-auto text-center py-24 border-t border-gray-800"
        >
          <blockquote className="text-2xl md:text-3xl font-light text-gray-300 leading-relaxed mb-8">
            "FANZ operates as a unified digital ecosystem built for scale, security, and creator sovereignty.
            The system functions within the <span className="text-green-400 font-medium">FANZ SINGULARITY</span>,
            powered by <span className="text-purple-400 font-medium">FANZ NEUROVERSE</span>,
            and executed through the <span className="text-cyan-400 font-medium">FANZ NEXUS</span>."
          </blockquote>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>FANZ SINGULARITY</span>
            <span>•</span>
            <span>NEUROVERSE</span>
            <span>•</span>
            <span>NEXUS</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
