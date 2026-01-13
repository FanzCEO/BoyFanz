/**
 * FanzNexus - THE EMPIRE COMMAND CENTER
 * Holographic 3D visualization of the FANZ Empire
 */

import { useState, useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  Stars,
  Float,
  MeshDistortMaterial,
  Sphere,
  Trail,
  Sparkles,
  Text,
  Billboard,
  Line,
  PointMaterial,
  Points
} from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// EMPIRE DATA
const EMPIRE_DATA = {
  core: [
    { id: 'boyfanz', name: 'BoyFanz', tagline: "Every Man's Playground", url: 'https://boyfanz.fanz.website', color: '#00ff88' },
    { id: 'girlfanz', name: 'GirlFanz', tagline: 'Her Empire, Her Rules', url: 'https://girlfanz.fanz.website', color: '#ff69b4' },
    { id: 'gayfanz', name: 'GayFanz', tagline: 'Pride in Every Pixel', url: 'https://gayfanz.fanz.website', color: '#9400d3' },
    { id: 'transfanz', name: 'TransFanz', tagline: 'Authentically You', url: 'https://transfanz.fanz.website', color: '#00bfff' },
  ],
  niche: [
    { id: 'bearfanz', name: 'BearFanz', tagline: 'Bear Community', color: '#8b4513' },
    { id: 'daddyfanz', name: 'DaddyFanz', tagline: 'Mature Connections', color: '#ffd700' },
    { id: 'milffanz', name: 'MILFFanz', tagline: 'Experienced Creators', color: '#ff6347' },
    { id: 'cougarfanz', name: 'CougarFanz', tagline: 'Confident & Bold', color: '#ff4500' },
    { id: 'pupfanz', name: 'PupFanz', tagline: 'Playful Spirits', color: '#98fb98' },
    { id: 'brofanz', name: 'BroFanz', tagline: 'Brotherhood Vibes', color: '#4169e1' },
    { id: 'femmefanz', name: 'FemmeFanz', tagline: 'Feminine Energy', color: '#da70d6' },
    { id: 'southernfanz', name: 'SouthernFanz', tagline: 'Southern Charm', color: '#deb887' },
    { id: 'taboofanz', name: 'TabooFanz', tagline: 'No Limits', color: '#dc143c' },
  ],
  services: [
    { id: 'sso', name: 'FanzSSO', desc: 'Universal Identity', color: '#00ffff' },
    { id: 'vault', name: 'FanzVault', desc: 'Encrypted Storage', color: '#7cfc00' },
    { id: 'meet', name: 'FanzMeet', desc: 'Live Connections', color: '#00ced1' },
    { id: 'crm', name: 'WickedCRM', desc: 'Fan Intelligence', color: '#ff1493' },
    { id: 'studio', name: 'StarzStudio', desc: 'Creator Tools', color: '#9932cc' },
    { id: 'defend', name: 'FanzDefend', desc: 'Content Shield', color: '#32cd32' },
  ],
  ai: [
    { id: 'neuroverse', name: 'Neuroverse', desc: 'The AI Brain', color: '#ff00ff' },
    { id: 'cybersecure', name: 'Cybersecure', desc: 'Digital Fortress', color: '#00ff00' },
  ]
};

// Floating particles around the scene
function ParticleField() {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 30 + Math.random() * 50;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.1;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#00ffff" size={0.15} sizeAttenuation depthWrite={false} opacity={0.6} />
    </Points>
  );
}

// Holographic ring
function HolographicRing({ radius, color, speed, tilt }: { radius: number; color: string; speed: number; tilt: number }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.elapsedTime * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={[tilt, 0, 0]}>
      <torusGeometry args={[radius, 0.02, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={3}
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}

// Central nexus core with energy pulses
function NexusCore() {
  const coreRef = useRef<THREE.Group>(null);
  const pulseRef = useRef<THREE.Mesh>(null);
  const [pulseScale, setPulseScale] = useState(1);

  useFrame((state) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += 0.003;
    }
    if (pulseRef.current) {
      const scale = 2 + Math.sin(state.clock.elapsedTime * 2) * 0.5;
      pulseRef.current.scale.setScalar(scale);
      (pulseRef.current.material as THREE.MeshBasicMaterial).opacity = 0.3 - (scale - 2) * 0.3;
    }
  });

  return (
    <group ref={coreRef}>
      {/* Core sphere */}
      <Sphere args={[1.5, 64, 64]}>
        <MeshDistortMaterial
          color="#ffffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          distort={0.3}
          speed={3}
          roughness={0}
          metalness={1}
        />
      </Sphere>

      {/* Inner glow */}
      <Sphere args={[1.8, 32, 32]}>
        <meshBasicMaterial color="#00ffff" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* Pulse wave */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.BackSide} />
      </mesh>

      {/* Holographic rings */}
      <HolographicRing radius={3} color="#00ffff" speed={0.5} tilt={Math.PI / 2} />
      <HolographicRing radius={3.5} color="#ff00ff" speed={-0.3} tilt={Math.PI / 3} />
      <HolographicRing radius={4} color="#ffff00" speed={0.4} tilt={Math.PI / 4} />
      <HolographicRing radius={4.5} color="#00ff88" speed={-0.2} tilt={Math.PI / 2.5} />

      {/* Energy sparkles */}
      <Sparkles count={100} scale={8} size={3} speed={0.5} color="#ffffff" />
    </group>
  );
}

// Energy beam connecting nodes to center
function EnergyBeam({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Line>(null);
  const [opacity, setOpacity] = useState(0.3);

  useFrame((state) => {
    setOpacity(0.2 + Math.sin(state.clock.elapsedTime * 3 + start[0]) * 0.15);
  });

  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end]);

  return (
    <Line
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={opacity}
    />
  );
}

// Platform node - hexagonal prism
function PlatformNode({
  position,
  color,
  name,
  isSelected,
  onClick,
  category
}: {
  position: [number, number, number];
  color: string;
  name: string;
  isSelected: boolean;
  onClick: () => void;
  category: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      const targetScale = hovered || isSelected ? 1.3 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2;
      glowRef.current.scale.setScalar(pulse * 1.5);
      (glowRef.current.material as THREE.MeshBasicMaterial).opacity = hovered || isSelected ? 0.4 : 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group position={position}>
        {/* Energy beam to center */}
        <EnergyBeam start={[0, 0, 0]} end={[-position[0], -position[1], -position[2]]} color={color} />

        {/* Outer glow */}
        <mesh ref={glowRef}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.15} side={THREE.BackSide} />
        </mesh>

        {/* Main node */}
        <mesh
          ref={meshRef}
          onClick={onClick}
          onPointerOver={() => setHovered(true)}
          onPointerOut={() => setHovered(false)}
        >
          <dodecahedronGeometry args={[0.6, 0]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={hovered || isSelected ? 2 : 1}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>

        {/* Label */}
        {(hovered || isSelected) && (
          <Billboard position={[0, 1.2, 0]}>
            <Text
              fontSize={0.3}
              color="white"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.02}
              outlineColor="black"
            >
              {name}
            </Text>
          </Billboard>
        )}

        {/* Orbital particle */}
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </group>
    </Float>
  );
}

// 3D Scene
function EmpireScene({ selectedPlatform, onSelectPlatform }: { selectedPlatform: string | null; onSelectPlatform: (id: string | null) => void }) {
  // Position platforms in orbital shells
  const allPlatforms = useMemo(() => {
    const platforms: any[] = [];

    // Core platforms - inner orbit
    EMPIRE_DATA.core.forEach((p, i) => {
      const angle = (i / EMPIRE_DATA.core.length) * Math.PI * 2;
      const radius = 8;
      platforms.push({
        ...p,
        position: [Math.cos(angle) * radius, Math.sin(i * 0.5) * 2, Math.sin(angle) * radius] as [number, number, number],
        category: 'core'
      });
    });

    // Niche platforms - middle orbit
    EMPIRE_DATA.niche.forEach((p, i) => {
      const angle = (i / EMPIRE_DATA.niche.length) * Math.PI * 2 + 0.2;
      const radius = 14;
      platforms.push({
        ...p,
        position: [Math.cos(angle) * radius, Math.sin(i * 0.7) * 3, Math.sin(angle) * radius] as [number, number, number],
        category: 'niche'
      });
    });

    // Services - outer orbit
    EMPIRE_DATA.services.forEach((p, i) => {
      const angle = (i / EMPIRE_DATA.services.length) * Math.PI * 2 + 0.4;
      const radius = 20;
      platforms.push({
        ...p,
        position: [Math.cos(angle) * radius, Math.sin(i * 0.9) * 4, Math.sin(angle) * radius] as [number, number, number],
        category: 'services'
      });
    });

    // AI layer - top
    EMPIRE_DATA.ai.forEach((p, i) => {
      const angle = (i / EMPIRE_DATA.ai.length) * Math.PI * 2;
      const radius = 6;
      platforms.push({
        ...p,
        position: [Math.cos(angle) * radius, 10 + i * 2, Math.sin(angle) * radius] as [number, number, number],
        category: 'ai'
      });
    });

    return platforms;
  }, []);

  return (
    <>
      <color attach="background" args={['#000005']} />
      <fog attach="fog" args={['#000005', 30, 100]} />

      {/* Lighting */}
      <ambientLight intensity={0.1} />
      <pointLight position={[0, 0, 0]} intensity={5} color="#00ffff" distance={50} />
      <pointLight position={[30, 20, 30]} intensity={2} color="#ff00ff" />
      <pointLight position={[-30, -20, -30]} intensity={2} color="#ffff00" />
      <spotLight position={[0, 50, 0]} angle={0.5} penumbra={1} intensity={3} color="#ffffff" />

      {/* Background */}
      <Stars radius={150} depth={100} count={8000} factor={5} saturation={0} fade speed={0.5} />
      <ParticleField />

      {/* Central core */}
      <NexusCore />

      {/* Platform nodes */}
      {allPlatforms.map((platform) => (
        <PlatformNode
          key={platform.id}
          position={platform.position}
          color={platform.color}
          name={platform.name}
          isSelected={selectedPlatform === platform.id}
          onClick={() => onSelectPlatform(selectedPlatform === platform.id ? null : platform.id)}
          category={platform.category}
        />
      ))}

      {/* Camera controls */}
      <OrbitControls
        enablePan={false}
        minDistance={12}
        maxDistance={50}
        autoRotate
        autoRotateSpeed={0.2}
        maxPolarAngle={Math.PI / 1.3}
        minPolarAngle={Math.PI / 5}
      />
    </>
  );
}

// Main Component
export default function FanzNexus() {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoaded(true), 500);
  }, []);

  const allData = [...EMPIRE_DATA.core, ...EMPIRE_DATA.niche, ...EMPIRE_DATA.services, ...EMPIRE_DATA.ai];
  const selectedData = selectedPlatform ? allData.find(p => p.id === selectedPlatform) : null;

  return (
    <div className="h-screen w-full bg-black overflow-hidden relative">
      {/* Loading overlay */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-black flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 mx-auto mb-4 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
              />
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-cyan-400 text-xl font-bold tracking-widest"
              >
                INITIALIZING NEXUS
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute top-0 left-0 right-0 z-20 p-6"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-14 h-14 rounded-full border-2 border-cyan-500/50 flex items-center justify-center"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center">
                <i className="fas fa-atom text-xl text-white" />
              </div>
            </motion.div>
            <div className="absolute -inset-2 rounded-full bg-cyan-500/20 blur-xl -z-10" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                FANZ NEXUS
              </span>
            </h1>
            <p className="text-cyan-400/50 text-xs tracking-[0.3em]">EMPIRE COMMAND CENTER</p>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.7 }}
        className="absolute top-28 left-6 z-20 space-y-2"
      >
        {[
          { label: 'CORE', color: '#00ff88' },
          { label: 'NICHE', color: '#ffd700' },
          { label: 'SERVICES', color: '#00ffff' },
          { label: 'AI', color: '#ff00ff' },
        ].map((cat) => (
          <div key={cat.label} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color, boxShadow: `0 0 10px ${cat.color}` }} />
            <span className="text-gray-400 tracking-wider">{cat.label}</span>
          </div>
        ))}
      </motion.div>

      {/* 3D Canvas */}
      <Canvas
        camera={{ position: [25, 15, 25], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <EmpireScene
            selectedPlatform={selectedPlatform}
            onSelectPlatform={setSelectedPlatform}
          />
        </Suspense>
      </Canvas>

      {/* Selected platform panel */}
      <AnimatePresence>
        {selectedData && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="absolute bottom-6 right-6 w-80 z-20"
          >
            <div
              className="backdrop-blur-xl border rounded-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,0,0,0.7))',
                borderColor: selectedData.color + '50'
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `linear-gradient(135deg, ${selectedData.color}40, ${selectedData.color}10)`,
                      boxShadow: `0 0 20px ${selectedData.color}30`
                    }}
                  >
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: selectedData.color }} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedData.name}</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-green-400 text-xs">ONLINE</span>
                    </div>
                  </div>
                </div>
                {'tagline' in selectedData && (
                  <p className="text-gray-400 text-sm mb-4">{selectedData.tagline}</p>
                )}
                {'desc' in selectedData && (
                  <p className="text-gray-400 text-sm mb-4">{selectedData.desc}</p>
                )}
              </div>
              <div className="p-4 border-t flex gap-2" style={{ borderColor: selectedData.color + '20' }}>
                {'url' in selectedData && (
                  <a
                    href={selectedData.url}
                    target="_blank"
                    className="flex-1 py-2.5 rounded-lg font-bold text-center text-sm transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${selectedData.color}, ${selectedData.color}80)`,
                      boxShadow: `0 0 15px ${selectedData.color}40`
                    }}
                  >
                    ENTER
                  </a>
                )}
                <button
                  onClick={() => setSelectedPlatform(null)}
                  className="px-4 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-gray-400"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none z-10" style={{
        background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0.8) 100%)'
      }} />

      {/* Scan line effect */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.015]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.1) 2px, rgba(0,255,255,0.1) 4px)'
        }}
      />
    </div>
  );
}
