/**
 * FANZ Secure - Architecture-Based Protection Narrative
 *
 * Visual: Empire zooms out, multi-layer translucent shield forms
 * No badges. No compliance logos.
 * Those are for companies asking to be trusted.
 * We are asserting inevitability.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMPIRE_SECURE, EMPIRE_FOOTER } from "@/constants/fanzEmpireCopy";

// Shield layer component
function ShieldLayer({ 
  radius, 
  opacity, 
  rotationDuration, 
  color, 
  active,
  index,
}: { 
  radius: number;
  opacity: number;
  rotationDuration: number;
  color: string;
  active: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ 
        scale: active ? 1 : 0,
        opacity: active ? opacity : 0,
      }}
      transition={{ 
        duration: 0.8,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      className="absolute rounded-full border-2"
      style={{
        width: radius * 2,
        height: radius * 2,
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        borderColor: color,
        boxShadow: `0 0 20px ${color}40, inset 0 0 30px ${color}20`,
        animation: active ? `spin ${rotationDuration}s linear infinite` : "none",
      }}
    />
  );
}

// Core protected element
function ProtectedCore() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="relative"
    >
      {/* Inner glow */}
      <div 
        className="absolute -inset-4 rounded-full opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.4) 0%, transparent 70%)",
        }}
      />
      
      {/* Core */}
      <motion.div
        animate={{ 
          boxShadow: [
            "0 0 20px rgba(14, 165, 233, 0.5), 0 0 40px rgba(14, 165, 233, 0.3)",
            "0 0 30px rgba(14, 165, 233, 0.7), 0 0 60px rgba(14, 165, 233, 0.4)",
            "0 0 20px rgba(14, 165, 233, 0.5), 0 0 40px rgba(14, 165, 233, 0.3)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-600"
        style={{
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
      />
    </motion.div>
  );
}

// Floating particles
function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
            opacity: 0,
          }}
          animate={{ 
            y: [null, "-100%"],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            boxShadow: "0 0 6px rgba(34, 211, 238, 0.8)",
          }}
        />
      ))}
    </div>
  );
}

export default function FanzSecure() {
  const [activeLayer, setActiveLayer] = useState(-1);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  const layers = [
    { radius: 80, opacity: 0.4, rotationDuration: 20, color: "#22d3ee" },
    { radius: 110, opacity: 0.35, rotationDuration: -25, color: "#06b6d4" },
    { radius: 140, opacity: 0.3, rotationDuration: 30, color: "#0891b2" },
    { radius: 170, opacity: 0.25, rotationDuration: -35, color: "#0e7490" },
    { radius: 200, opacity: 0.2, rotationDuration: 40, color: "#155e75" },
  ];

  // Reveal layers progressively
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    EMPIRE_SECURE.layers.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setActiveLayer(i);
          setVisibleLines((prev) => [...prev, i]);
        }, 1500 + i * 1200)
      );
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* CSS for rotation animation */}
      <style>{"\n        @keyframes spin {\n          from { transform: translate(-50%, -50%) rotate(0deg); }\n          to { transform: translate(-50%, -50%) rotate(360deg); }\n        }\n      "}</style>

      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Floating particles */}
      <FloatingParticles />

      {/* Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="text-center">
          <h1 className="text-cyan-200/90 text-2xl font-light tracking-[0.3em] font-mono">
            SECURE
          </h1>
          <div className="text-cyan-400/40 text-xs font-mono tracking-wider mt-2">
            ARCHITECTURE-BASED PROTECTION
          </div>
        </div>
      </div>

      {/* Security layers text */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 max-w-md">
        <div className="space-y-6">
          {EMPIRE_SECURE.layers.map((line, i) => (
            <AnimatePresence key={i}>
              {visibleLines.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                  className="flex items-start gap-4"
                >
                  <div
                    className={`w-1 h-1 rounded-full mt-2 ${
                      i === activeLayer ? "bg-cyan-400" : "bg-cyan-600/50"
                    }`}
                  />
                  <p
                    className={`text-lg font-light leading-relaxed transition-colors duration-500 ${
                      i === activeLayer ? "text-white/90" : "text-gray-500"
                    }`}
                  >
                    {line}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
      </div>

      {/* Shield count indicator */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20">
        <div className="space-y-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.2, scale: 0.8 }}
              animate={{
                opacity: i <= activeLayer ? 1 : 0.2,
                scale: i <= activeLayer ? 1 : 0.8,
              }}
              className={`w-3 h-3 rounded-full border-2 transition-colors duration-300 ${
                i <= activeLayer
                  ? "border-cyan-400 bg-cyan-400/30"
                  : "border-gray-700 bg-transparent"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="text-gray-700 text-[10px] font-mono tracking-wider">
          {EMPIRE_FOOTER.singleLine}
        </div>
      </div>

      {/* Visual Shield Scene */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Background glow */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 60%)",
          }}
        />

        {/* Shield layers */}
        {layers.map((layer, i) => (
          <ShieldLayer
            key={i}
            {...layer}
            active={i <= activeLayer}
            index={i}
          />
        ))}

        {/* Protected core */}
        <ProtectedCore />
      </div>
    </div>
  );
}
