/**
 * FANZ Defend - Automated Enforcement Narrative
 *
 * Visual: Content exits boundary, fractures, metadata lights, response triggers
 * Never say "DMCA." Never say "takedown."
 * Show cause and consequence.
 *
 * This page should make thieves uncomfortable and creators feel protected.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EMPIRE_DEFEND, EMPIRE_FOOTER } from "@/constants/fanzEmpireCopy";

// Particle component for metadata visualization
function MetadataParticle({ delay, x, y }: { delay: number; x: number; y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0, 1, 1, 0.5],
        x: [0, x * 20],
        y: [0, y * 20],
      }}
      transition={{ 
        duration: 2,
        delay,
        repeat: Infinity,
        repeatDelay: 3,
      }}
      className="absolute w-1 h-1 bg-amber-400 rounded-full"
      style={{ 
        left: "50%",
        top: "50%",
        boxShadow: "0 0 10px #f59e0b, 0 0 20px #f59e0b",
      }}
    />
  );
}

// Boundary pulse effect
function BoundaryPulse({ active }: { active: boolean }) {
  if (!active) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.3, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="absolute inset-0 border-2 border-red-500/50 rounded-lg"
      style={{ boxShadow: "inset 0 0 60px rgba(239, 68, 68, 0.3)" }}
    />
  );
}

// Content node that "escapes" and gets caught
function ContentNode({ 
  stage 
}: { 
  stage: "idle" | "escaping" | "detected" | "responding" | "contained" 
}) {
  const getPosition = () => {
    switch (stage) {
      case "idle": return { x: 0, scale: 1 };
      case "escaping": return { x: 150, scale: 1 };
      case "detected": return { x: 180, scale: 1 };
      case "responding": return { x: 180, scale: 0.8 };
      case "contained": return { x: 0, scale: 0.6 };
    }
  };

  const getColor = () => {
    switch (stage) {
      case "idle": return "#22c55e";
      case "escaping": return "#f59e0b";
      case "detected": return "#ef4444";
      case "responding": return "#ef4444";
      case "contained": return "#22c55e";
    }
  };

  return (
    <motion.div
      animate={getPosition()}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="relative"
    >
      {/* Core content */}
      <motion.div
        animate={{ 
          backgroundColor: getColor(),
          boxShadow: `0 0 20px ${getColor()}, 0 0 40px ${getColor()}40`,
        }}
        transition={{ duration: 0.3 }}
        className="w-16 h-16 rounded-lg"
      />
      
      {/* Fragmentation effect */}
      <AnimatePresence>
        {(stage === "responding" || stage === "contained") && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: [1, 0],
                  x: (Math.random() - 0.5) * 100,
                  y: (Math.random() - 0.5) * 100,
                  rotate: Math.random() * 360,
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1, delay: i * 0.1 }}
                className="absolute top-1/2 left-1/2 w-3 h-3 bg-red-500 rounded-sm"
                style={{ transform: "translate(-50%, -50%)" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Response beam
function ResponseBeam({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 0 }}
      animate={{ scaleX: 1, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="absolute left-[calc(50%+32px)] top-1/2 w-32 h-0.5 bg-gradient-to-r from-red-500 to-transparent origin-left"
      style={{ 
        boxShadow: "0 0 10px #ef4444, 0 0 20px #ef4444",
        transform: "translateY(-50%)",
      }}
    />
  );
}

export default function FanzDefend() {
  const [stage, setStage] = useState<
    "idle" | "escaping" | "detected" | "responding" | "contained"
  >("idle");
  const [visibleLines, setVisibleLines] = useState<number[]>([]);
  const [showFinal, setShowFinal] = useState(false);

  // Run the defense simulation
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    // Start escaping
    timers.push(setTimeout(() => setStage("escaping"), 2000));

    // Detected
    timers.push(
      setTimeout(() => {
        setStage("detected");
        setVisibleLines([0]);
      }, 4000)
    );

    // Fingerprint confirmed
    timers.push(
      setTimeout(() => {
        setVisibleLines([0, 1]);
      }, 5500)
    );

    // Response initiated
    timers.push(
      setTimeout(() => {
        setStage("responding");
        setVisibleLines([0, 1, 2]);
      }, 7000)
    );

    // No manual action required
    timers.push(
      setTimeout(() => {
        setVisibleLines([0, 1, 2, 3]);
      }, 8500)
    );

    // Contained
    timers.push(
      setTimeout(() => {
        setStage("contained");
        setShowFinal(true);
      }, 10000)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  // Reset and replay
  const replay = () => {
    setStage("idle");
    setVisibleLines([]);
    setShowFinal(false);

    setTimeout(() => {
      const timers: NodeJS.Timeout[] = [];
      timers.push(setTimeout(() => setStage("escaping"), 2000));
      timers.push(
        setTimeout(() => {
          setStage("detected");
          setVisibleLines([0]);
        }, 4000)
      );
      timers.push(setTimeout(() => setVisibleLines([0, 1]), 5500));
      timers.push(
        setTimeout(() => {
          setStage("responding");
          setVisibleLines([0, 1, 2]);
        }, 7000)
      );
      timers.push(setTimeout(() => setVisibleLines([0, 1, 2, 3]), 8500));
      timers.push(
        setTimeout(() => {
          setStage("contained");
          setShowFinal(true);
        }, 10000)
      );
    }, 500);
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Scanlines */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,0,0,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 3px",
        }}
      />

      {/* Ambient glow */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: "radial-gradient(ellipse at center, rgba(15, 23, 42, 0.8) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20">
        <div className="text-center">
          <h1 className="text-red-200/90 text-2xl font-light tracking-[0.3em] font-mono">
            DEFEND
          </h1>
          <div className="text-red-400/40 text-xs font-mono tracking-wider mt-2">
            AUTOMATED ENFORCEMENT
          </div>
        </div>
      </div>

      {/* Defense sequence text */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 z-20 max-w-sm">
        <div className="space-y-4">
          {EMPIRE_DEFEND.sequence.map((line, i) => (
            <AnimatePresence key={i}>
              {visibleLines.includes(i) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      i === visibleLines[visibleLines.length - 1]
                        ? "bg-red-400 animate-pulse"
                        : "bg-red-600/50"
                    }`}
                  />
                  <p className="text-white/80 font-mono text-sm tracking-wider">
                    {line}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ))}

          {/* Final line */}
          <AnimatePresence>
            {showFinal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="pt-6 border-t border-red-500/20"
              >
                <p className="text-red-200 font-mono text-lg tracking-wider">
                  {EMPIRE_DEFEND.finalLine}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20">
        <div className="bg-black/50 backdrop-blur border border-red-500/20 rounded px-4 py-3">
          <div className="text-red-400/60 text-xs font-mono tracking-wider mb-2">
            STATUS
          </div>
          <div
            className={`text-sm font-mono tracking-wider ${
              stage === "contained"
                ? "text-green-400"
                : stage === "responding"
                ? "text-red-400"
                : stage === "detected"
                ? "text-yellow-400"
                : "text-gray-400"
            }`}
          >
            {stage.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Replay button */}
      {showFinal && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          onClick={replay}
          className="absolute bottom-8 right-8 z-20 bg-black/50 backdrop-blur border border-red-500/30 rounded px-4 py-2 text-red-400/60 text-xs font-mono tracking-wider hover:text-red-300 hover:border-red-500/50 transition-colors"
        >
          REPLAY SCENARIO
        </motion.button>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="text-gray-700 text-[10px] font-mono tracking-wider">
          {EMPIRE_FOOTER.singleLine}
        </div>
      </div>

      {/* Visual Defense Scene */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* Protected zone */}
        <div className="relative">
          {/* Zone boundary */}
          <motion.div
            animate={{
              borderColor: stage === "detected" || stage === "responding" 
                ? "rgba(239, 68, 68, 0.3)" 
                : "rgba(6, 182, 212, 0.2)",
            }}
            className="absolute -inset-20 border-2 border-dashed rounded-full"
          />
          
          {/* Inner glow */}
          <div 
            className="absolute -inset-16 rounded-full opacity-20"
            style={{
              background: "radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)",
            }}
          />

          {/* Boundary pulse on breach */}
          <BoundaryPulse active={stage === "detected" || stage === "responding"} />

          {/* Content node */}
          <ContentNode stage={stage} />

          {/* Response beam */}
          <AnimatePresence>
            {stage === "responding" && <ResponseBeam active={true} />}
          </AnimatePresence>

          {/* Metadata particles */}
          {(stage === "detected" || stage === "responding") && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <MetadataParticle 
                  key={i} 
                  delay={i * 0.15} 
                  x={Math.cos(i * 30 * Math.PI / 180)}
                  y={Math.sin(i * 30 * Math.PI / 180)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Boundary line indicator */}
        <motion.div
          animate={{
            opacity: stage !== "idle" ? 0.5 : 0.2,
            backgroundColor: stage === "detected" || stage === "responding" 
              ? "#ef4444" 
              : "#22c55e",
          }}
          className="absolute right-1/3 top-0 bottom-0 w-px"
          style={{ boxShadow: "0 0 10px currentColor" }}
        />
      </div>
    </div>
  );
}
