/**
 * Empire Map - Interactive Network Visualization
 *
 * Shows the FANZ Empire as an expanding network of platforms.
 * CSS/Framer Motion version (no Three.js).
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  EMPIRE_MAP, 
  EMPIRE_PLATFORMS, 
  EMPIRE_FOOTER,
  EMPIRE_MANIFESTO,
  EMPIRE_FINAL,
} from "@/constants/fanzEmpireCopy";

// Platform node in the network
function PlatformNode({ 
  platform, 
  index, 
  active,
  onClick,
}: { 
  platform: typeof EMPIRE_PLATFORMS[number];
  index: number;
  active: boolean;
  onClick: () => void;
}) {
  // Position nodes in a circle around center
  const angle = (index / EMPIRE_PLATFORMS.length) * 2 * Math.PI - Math.PI / 2;
  const radius = 180;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
      animate={{ 
        scale: active ? 1 : 0,
        opacity: active ? 1 : 0,
        x,
        y,
      }}
      transition={{ 
        duration: 0.6,
        delay: index * 0.08,
        type: "spring",
        stiffness: 100,
      }}
      onClick={onClick}
      className="absolute cursor-pointer group"
      style={{ left: "50%", top: "50%" }}
    >
      {/* Connection line to center */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.3 }}
        className="absolute h-px origin-right"
        style={{
          width: radius,
          right: "50%",
          top: "50%",
          backgroundColor: `${platform.color}40`,
          transform: `translateY(-50%) rotate(${angle * 180 / Math.PI + 180}deg)`,
        }}
      />
      
      {/* Node */}
      <motion.div
        whileHover={{ scale: 1.2 }}
        className="relative -translate-x-1/2 -translate-y-1/2"
      >
        <div 
          className="w-4 h-4 rounded-full"
          style={{ 
            backgroundColor: platform.color,
            boxShadow: `0 0 15px ${platform.color}, 0 0 30px ${platform.color}60`,
          }}
        />
        
        {/* Label on hover */}
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          <span 
            className="text-xs font-mono tracking-wider"
            style={{ color: platform.color }}
          >
            {platform.name}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Central empire core
function EmpireCore({ pulsing }: { pulsing: boolean }) {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1, type: "spring" }}
      className="relative"
    >
      {/* Outer rings */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          animate={{
            scale: pulsing ? [1, 1.1, 1] : 1,
            opacity: pulsing ? [0.3, 0.5, 0.3] : 0.3,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: ring * 0.3,
          }}
          className="absolute rounded-full border border-cyan-500/30"
          style={{
            width: 60 + ring * 30,
            height: 60 + ring * 30,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      
      {/* Core */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)",
            "0 0 40px rgba(6, 182, 212, 0.7), 0 0 80px rgba(6, 182, 212, 0.4)",
            "0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600"
      />
      
      {/* EMPIRE text */}
      <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="text-cyan-300/60 text-xs font-mono tracking-[0.3em]">
          EMPIRE
        </span>
      </div>
    </motion.div>
  );
}

// Manifesto reveal
function ManifestoLine({ line, continuation, index, visible }: {
  line: string;
  continuation: string;
  index: number;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, delay: index * 0.15 }}
          className="text-center"
        >
          <span className="text-white/60 font-light">{line}</span>
          <span className="text-cyan-300 font-light"> {continuation}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function EmpireMap() {
  const [stage, setStage] = useState<"map" | "manifesto" | "final">("map");
  const [platformsRevealed, setPlatformsRevealed] = useState(false);
  const [visibleManifesto, setVisibleManifesto] = useState<number[]>([]);

  // Reveal platforms after mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setPlatformsRevealed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle manifesto progression
  useEffect(() => {
    if (stage !== "manifesto") return;
    
    const timers: NodeJS.Timeout[] = [];
    EMPIRE_MANIFESTO.lines.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setVisibleManifesto((prev) => [...prev, i]);
        }, i * 2000)
      );
    });

    // Show final after manifesto
    timers.push(
      setTimeout(() => {
        setStage("final");
      }, EMPIRE_MANIFESTO.lines.length * 2000 + 1000)
    );

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  const handleCenterClick = () => {
    if (stage === "map") {
      setStage("manifesto");
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px)",
          backgroundSize: "100% 4px",
        }}
      />

      {/* Background stars */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-px h-px bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-cyan-200/90 text-3xl font-light tracking-[0.3em] font-mono"
          >
            FANZ EMPIRE
          </motion.h1>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-cyan-400/40 text-xs font-mono tracking-wider mt-2"
          >
            {stage === "manifesto" ? "MANIFESTO" : stage === "final" ? "EXPANSION" : "NETWORK VISUALIZATION"}
          </motion.div>
        </div>
      </div>

      {/* Stats panel */}
      <AnimatePresence>
        {stage === "map" && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute left-8 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="space-y-4 bg-black/50 backdrop-blur border border-cyan-500/20 rounded p-4">
              <div>
                <div className="text-cyan-400/60 text-xs font-mono tracking-wider mb-1">
                  {EMPIRE_MAP.empireView.activeDomains}
                </div>
                <div className="text-cyan-200 text-2xl font-mono">
                  {EMPIRE_PLATFORMS.length}
                </div>
              </div>
              <div>
                <div className="text-cyan-400/60 text-xs font-mono tracking-wider">
                  {EMPIRE_MAP.empireView.operationalServices}
                </div>
              </div>
              <div>
                <div className="text-cyan-400/60 text-xs font-mono tracking-wider">
                  {EMPIRE_MAP.empireView.failureTolerance}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="text-gray-700 text-[10px] font-mono tracking-wider">
          {EMPIRE_FOOTER.singleLine}
        </div>
      </div>

      {/* Main content area */}
      <div className="absolute inset-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {/* Map view */}
          {stage === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative"
            >
              {/* Platform nodes */}
              {EMPIRE_PLATFORMS.map((platform, i) => (
                <PlatformNode
                  key={platform.id}
                  platform={platform}
                  index={i}
                  active={platformsRevealed}
                  onClick={() => {}}
                />
              ))}

              {/* Center core */}
              <div 
                className="cursor-pointer"
                onClick={handleCenterClick}
              >
                <EmpireCore pulsing={platformsRevealed} />
              </div>

              {/* Click hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: platformsRevealed ? 0.5 : 0 }}
                transition={{ delay: 2 }}
                className="absolute -bottom-32 left-1/2 -translate-x-1/2 text-center"
              >
                <span className="text-cyan-400/40 text-xs font-mono tracking-wider">
                  CLICK CORE TO CONTINUE
                </span>
              </motion.div>
            </motion.div>
          )}

          {/* Manifesto view */}
          {stage === "manifesto" && (
            <motion.div
              key="manifesto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl px-8 space-y-8"
            >
              {EMPIRE_MANIFESTO.lines.map((item, i) => (
                <ManifestoLine
                  key={i}
                  {...item}
                  index={i}
                  visible={visibleManifesto.includes(i)}
                />
              ))}
            </motion.div>
          )}

          {/* Final view */}
          {stage === "final" && (
            <motion.div
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                animate={{
                  textShadow: [
                    "0 0 20px rgba(6, 182, 212, 0.5)",
                    "0 0 40px rgba(6, 182, 212, 0.8)",
                    "0 0 20px rgba(6, 182, 212, 0.5)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-cyan-200 text-2xl font-light tracking-[0.2em] font-mono"
              >
                {EMPIRE_FINAL.maxZoomLine}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
