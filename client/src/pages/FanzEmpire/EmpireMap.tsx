/**
 * Empire Map - State of the Art Experience
 * 
 * Cinematic, premium AAA-quality visualization.
 * Dramatic perspective, layered depth, living interfaces.
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { 
  EMPIRE_MAP, 
  EMPIRE_PLATFORMS, 
  EMPIRE_FOOTER,
  EMPIRE_MANIFESTO,
  EMPIRE_FINAL,
} from "@/constants/fanzEmpireCopy";

// Orbital platform with 3D perspective
function OrbitalPlatform({ 
  platform, 
  index, 
  total,
  active,
  onHover,
}: { 
  platform: typeof EMPIRE_PLATFORMS[number];
  index: number;
  total: number;
  active: boolean;
  onHover: (name: string | null) => void;
}) {
  const angle = (index / total) * 360;
  const delay = index * 0.12;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.5, delay }}
      className="absolute"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%) rotateX(60deg)",
        transformStyle: "preserve-3d",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{
          width: 500,
          height: 500,
          transformStyle: "preserve-3d",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: active ? 1 : 0 }}
          transition={{ duration: 0.6, delay: delay + 0.3, type: "spring" }}
          onMouseEnter={() => onHover(platform.name)}
          onMouseLeave={() => onHover(null)}
          className="absolute cursor-pointer group"
          style={{
            left: "50%",
            top: "50%",
            transform: "rotate(" + angle + "deg) translateX(200px) rotate(-" + angle + "deg) rotateX(-60deg)",
          }}
        >
          {/* Connection line */}
          <div 
            className="absolute h-[1px] right-full mr-2"
            style={{
              width: 180,
              background: "linear-gradient(90deg, transparent, " + platform.color + ")",
              boxShadow: "0 0 15px " + platform.color,
              transform: "rotate(" + (angle + 180) + "deg)",
              transformOrigin: "right center",
            }}
          />
          
          {/* Platform marker */}
          <div className="relative -translate-x-1/2 -translate-y-1/2">
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px " + platform.color + ", 0 0 40px " + platform.color + "60",
                  "0 0 30px " + platform.color + ", 0 0 60px " + platform.color + "80",
                  "0 0 20px " + platform.color + ", 0 0 40px " + platform.color + "60",
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
              className="w-4 h-4 rounded-full group-hover:scale-150 transition-transform duration-200"
              style={{ backgroundColor: platform.color }}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileHover={{ opacity: 1, y: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <span 
                className="text-xs font-mono tracking-wider px-2 py-1 rounded"
                style={{ 
                  color: platform.color,
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid " + platform.color + "40",
                }}
              >
                {platform.name}
              </span>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// Central command core
function CommandCore({ active, onClick }: { active: boolean; onClick: () => void }) {
  return (
    <motion.div
      initial={{ scale: 0, rotateX: 0 }}
      animate={{ scale: active ? 1 : 0 }}
      transition={{ duration: 1, type: "spring", delay: 0.5 }}
      onClick={onClick}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20"
      style={{ perspective: 1000 }}
    >
      {/* Hexagonal rings */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 30 - i * 5, repeat: Infinity, ease: "linear" }}
          className="absolute left-1/2 top-1/2"
          style={{
            width: 120 + i * 50,
            height: 120 + i * 50,
            marginLeft: -(60 + i * 25),
            marginTop: -(60 + i * 25),
            border: "1px solid rgba(6, 182, 212, " + (0.4 - i * 0.1) + ")",
            borderRadius: "50%",
            boxShadow: "0 0 20px rgba(6, 182, 212, 0.2), inset 0 0 20px rgba(6, 182, 212, 0.1)",
          }}
        />
      ))}
      
      {/* Core sphere */}
      <motion.div
        animate={{
          boxShadow: [
            "0 0 60px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.4), inset -10px -10px 30px rgba(0,0,0,0.3), inset 10px 10px 30px rgba(255,255,255,0.1)",
            "0 0 80px rgba(6, 182, 212, 0.8), 0 0 140px rgba(6, 182, 212, 0.5), inset -10px -10px 30px rgba(0,0,0,0.3), inset 10px 10px 30px rgba(255,255,255,0.2)",
            "0 0 60px rgba(6, 182, 212, 0.6), 0 0 100px rgba(6, 182, 212, 0.4), inset -10px -10px 30px rgba(0,0,0,0.3), inset 10px 10px 30px rgba(255,255,255,0.1)",
          ],
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className="relative w-28 h-28 rounded-full"
        style={{
          background: "radial-gradient(circle at 30% 30%, rgba(103, 232, 249, 0.9), rgba(6, 182, 212, 0.8) 50%, rgba(8, 145, 178, 0.9))",
        }}
      >
        {/* Inner detail */}
        <div 
          className="absolute inset-4 rounded-full"
          style={{
            background: "radial-gradient(circle at 40% 40%, rgba(255,255,255,0.3), transparent 60%)",
          }}
        />
      </motion.div>
      
      {/* Label */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-center"
      >
        <div 
          className="text-cyan-300 text-sm font-mono tracking-[0.5em] font-bold"
          style={{ textShadow: "0 0 20px rgba(6, 182, 212, 0.8)" }}
        >
          DOMINION
        </div>
        <div className="text-slate-500/50 text-xs font-mono tracking-wider mt-1">
          CONTROL CENTER
        </div>
      </motion.div>
    </motion.div>
  );
}

// Data stream overlay
function DataStream({ active }: { active: boolean }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 pointer-events-none overflow-hidden z-5"
        >
          {/* Vertical scan lines */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                delay: i * 1,
                ease: "linear"
              }}
              className="absolute h-full w-px"
              style={{
                left: (i * 12) + "%",
                background: "linear-gradient(180deg, transparent 0%, rgba(6, 182, 212, 0.1) 20%, rgba(6, 182, 212, 0.3) 50%, rgba(6, 182, 212, 0.1) 80%, transparent 100%)",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Telemetry display
function Telemetry({ visible }: { visible: boolean }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setCount(c => (c + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-20"
        >
          <div 
            className="p-6 rounded min-w-[200px]"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(6, 182, 212, 0.2)",
            }}
          >
            {/* Header bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-slate-400 animate-pulse" />
              <span className="text-slate-400/70 text-xs font-mono tracking-widest">TELEMETRY</span>
            </div>
            
            {/* Stats */}
            <div className="space-y-4">
              <div>
                <div className="text-gray-500 text-[10px] font-mono tracking-wider">DOMAINS ACTIVE</div>
                <div className="text-cyan-100 text-3xl font-mono font-bold mt-1">{EMPIRE_PLATFORMS.length}</div>
              </div>
              
              <div className="h-px bg-gradient-to-r from-slate-500/50 to-transparent" />
              
              <div>
                <div className="text-gray-500 text-[10px] font-mono tracking-wider">SERVICES</div>
                <div className="text-cyan-300/80 text-sm font-mono mt-1">200+</div>
              </div>
              
              <div>
                <div className="text-gray-500 text-[10px] font-mono tracking-wider">UPTIME</div>
                <div className="text-green-400/80 text-sm font-mono mt-1">99.99%</div>
              </div>
              
              <div>
                <div className="text-gray-500 text-[10px] font-mono tracking-wider">SYNC</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-gray-800 rounded overflow-hidden">
                    <motion.div 
                      animate={{ width: ["0%", "100%", "0%"] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="h-full bg-slate-500"
                    />
                  </div>
                  <span className="text-slate-400/60 text-xs font-mono">{count}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Manifesto with typewriter effect
function ManifestoReveal({ visible, lines }: { visible: boolean; lines: number[] }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ background: "rgba(0,0,0,0.9)" }}
        >
          <div className="max-w-4xl px-8">
            {EMPIRE_MANIFESTO.lines.map((item, i) => (
              <AnimatePresence key={i}>
                {lines.includes(i) && (
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-8 flex items-start gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="w-2 h-2 mt-3 rounded-full bg-slate-500 flex-shrink-0"
                    />
                    <div>
                      <span className="text-white/50 text-lg md:text-xl font-light">{item.line}</span>
                      <motion.span 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-cyan-300 text-lg md:text-xl font-light"
                        style={{ textShadow: "0 0 30px rgba(6, 182, 212, 0.5)" }}
                      > {item.continuation}</motion.span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Final statement
function FinalStatement({ visible }: { visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-30"
          style={{ background: "rgba(0,0,0,0.95)" }}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, type: "spring" }}
            className="text-center"
          >
            <motion.div
              animate={{
                textShadow: [
                  "0 0 40px rgba(6, 182, 212, 0.4)",
                  "0 0 80px rgba(6, 182, 212, 0.8)",
                  "0 0 40px rgba(6, 182, 212, 0.4)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-cyan-200 text-4xl md:text-6xl font-extralight tracking-[0.2em] font-mono"
            >
              {EMPIRE_FINAL.maxZoomLine}
            </motion.div>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="h-px w-64 mx-auto mt-8 bg-gradient-to-r from-transparent via-slate-500 to-transparent"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function EmpireMap() {
  const [stage, setStage] = useState<"map" | "manifesto" | "final">("map");
  const [active, setActive] = useState(false);
  const [hoveredPlatform, setHoveredPlatform] = useState<string | null>(null);
  const [visibleLines, setVisibleLines] = useState<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setActive(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (stage !== "manifesto") return;
    
    const timers: NodeJS.Timeout[] = [];
    EMPIRE_MANIFESTO.lines.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleLines(prev => [...prev, i]), i * 2000));
    });
    timers.push(setTimeout(() => setStage("final"), EMPIRE_MANIFESTO.lines.length * 2000 + 1500));

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ perspective: 1200 }}>
      {/* Deep space background */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(6, 30, 50, 1) 0%, rgba(0, 0, 0, 1) 70%)",
        }}
      />

      {/* Grid floor effect */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
          transform: "rotateX(60deg) translateY(-50%)",
          transformOrigin: "center center",
        }}
      />

      <DataStream active={stage === "map"} />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="absolute top-8 left-1/2 -translate-x-1/2 z-20 text-center"
      >
        <h1 
          className="text-cyan-200 text-4xl md:text-5xl font-thin tracking-[0.6em] font-mono"
          style={{ textShadow: "0 0 40px rgba(6, 182, 212, 0.5)" }}
        >
          FANZ EMPIRE
        </h1>
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent mt-4 w-96 mx-auto"
        />
        <p className="text-slate-500/40 text-xs font-mono tracking-[0.3em] mt-4">
          {stage === "manifesto" ? "MANIFESTO" : stage === "final" ? "DIRECTIVE" : "COMMAND INTERFACE"}
        </p>
      </motion.div>

      {/* Main visualization */}
      <AnimatePresence>
        {stage === "map" && (
          <motion.div exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.8 }}>
            {EMPIRE_PLATFORMS.map((platform, i) => (
              <OrbitalPlatform
                key={platform.id}
                platform={platform}
                index={i}
                total={EMPIRE_PLATFORMS.length}
                active={active}
                onHover={setHoveredPlatform}
              />
            ))}
            <CommandCore active={active} onClick={() => setStage("manifesto")} />
          </motion.div>
        )}
      </AnimatePresence>

      <Telemetry visible={stage === "map"} />
      <ManifestoReveal visible={stage === "manifesto"} lines={visibleLines} />
      <FinalStatement visible={stage === "final"} />

      {/* Hovered platform info */}
      <AnimatePresence>
        {hoveredPlatform && stage === "map" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 z-20"
          >
            <div className="p-4 rounded" style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(6, 182, 212, 0.3)" }}>
              <div className="text-slate-500/60 text-xs font-mono tracking-wider">SELECTED</div>
              <div className="text-cyan-100 text-xl font-mono mt-1">{hoveredPlatform}</div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                <span className="text-green-400/80 text-xs font-mono">ONLINE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue prompt */}
      <AnimatePresence>
        {stage === "map" && active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 2 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
          >
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-slate-500/60 text-xs font-mono tracking-[0.2em]"
            >
              [ CLICK CORE TO PROCEED ]
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="text-gray-700 text-[10px] font-mono tracking-wider">{EMPIRE_FOOTER.singleLine}</div>
      </div>
    </div>
  );
}
