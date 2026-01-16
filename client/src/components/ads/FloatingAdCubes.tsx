/**
 * Floating Ad Cubes - 3D Rotating Ad Carousel
 * 
 * Horizontal row of 9 floating cubes that rotate and flip.
 */

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface Ad {
  id: string;
  title: string;
  description: string;
  cta: string;
  link: string;
  gradient: string;
}

const fallbackAds: Ad[] = [
  { id: "1", title: "FANZ EMPIRE", description: "Command your dynasty", cta: "Enter", link: "/empire", gradient: "from-slate-600 via-blue-700 to-purple-800" },
  { id: "2", title: "FANZ SECURE", description: "Multi-layer protection", cta: "Shield", link: "/fanz-secure", gradient: "from-emerald-600 via-teal-600 to-slate-700" },
  { id: "3", title: "FANZ DEFEND", description: "Auto enforcement", cta: "Activate", link: "/fanz-defend", gradient: "from-red-600 via-orange-600 to-amber-600" },
  { id: "4", title: "FANZ VAULT", description: "Premium storage", cta: "Unlock", link: "/vault", gradient: "from-violet-600 via-purple-600 to-fuchsia-600" },
  { id: "5", title: "ANALYTICS", description: "Deep insights", cta: "Analyze", link: "/analytics", gradient: "from-blue-600 via-indigo-600 to-violet-600" },
  { id: "6", title: "NETWORK", description: "Creator hub", cta: "Connect", link: "/network", gradient: "from-pink-600 via-rose-600 to-red-600" },
];

function AdCube({ ads, index, isVisible, onAdClick }: { ads: Ad[]; index: number; isVisible: boolean; onAdClick?: (id: string) => void }) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      const dirs = [{ x: 90, y: 0 }, { x: -90, y: 0 }, { x: 0, y: 90 }, { x: 0, y: -90 }, { x: 90, y: 90 }];
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      setRotation(prev => ({ x: prev.x + dir.x, y: prev.y + dir.y }));
    }, 2500 + index * 400);
    return () => clearInterval(interval);
  }, [isVisible, index]);

  const floatOffset = index % 2 === 0 ? [0, -6, 0, 6, 0] : [0, 6, 0, -6, 0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.5 }}
      animate={{ opacity: 1, y: floatOffset, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      transition={{
        opacity: { duration: 0.3, delay: index * 0.05 },
        y: { duration: 2.5 + index * 0.3, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.3, delay: index * 0.05 },
      }}
      className="relative w-14 h-14"
      style={{ perspective: "400px" }}
    >
      <motion.div
        animate={{ rotateX: rotation.x, rotateY: rotation.y }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full h-full relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        <CubeFace ad={ads[0]} transform="translateZ(28px)" onClick={() => onAdClick?.(ads[0]?.id)} />
        <CubeFace ad={ads[1]} transform="translateZ(-28px) rotateY(180deg)" onClick={() => onAdClick?.(ads[1]?.id)} />
        <CubeFace ad={ads[2]} transform="translateX(28px) rotateY(90deg)" onClick={() => onAdClick?.(ads[2]?.id)} />
        <CubeFace ad={ads[3]} transform="translateX(-28px) rotateY(-90deg)" onClick={() => onAdClick?.(ads[3]?.id)} />
        <CubeFace ad={ads[4]} transform="translateY(-28px) rotateX(90deg)" onClick={() => onAdClick?.(ads[4]?.id)} />
        <CubeFace ad={ads[5]} transform="translateY(28px) rotateX(-90deg)" onClick={() => onAdClick?.(ads[5]?.id)} />
      </motion.div>
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-500/20 blur-sm rounded-full" />
    </motion.div>
  );
}

function CubeFace({ ad, transform, onClick }: { ad: Ad; transform: string; onClick?: () => void }) {
  if (!ad) return null;
  return (
    <a
      href={ad.link}
      onClick={onClick}
      className="absolute w-14 h-14 flex flex-col items-center justify-center rounded-lg border border-white/20 backdrop-blur-sm cursor-pointer hover:border-white/40 transition-colors"
      style={{
        transform,
        backfaceVisibility: "hidden",
        background: `linear-gradient(135deg, ${ad.gradient.replace('from-', '').split(' ')[0]}, ${ad.gradient.split('to-')[1] || '#1a1a2e'})`,
      }}
    >
      <span className="text-[5px] text-white/30 uppercase tracking-wider absolute top-0.5 left-1">Ad</span>
      <h4 className="text-[7px] font-bold text-white leading-tight text-center px-1">{ad.title}</h4>
      <p className="text-[5px] text-white/60 mt-0.5">{ad.cta}</p>
    </a>
  );
}

export default function FloatingAdCubes({ isVisible, onDismiss }: { isVisible: boolean; onDismiss?: () => void }) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: adsData } = useQuery({
    queryKey: ["cube-ads"],
    queryFn: async () => {
      const res = await fetch("/api/cube-ads");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });

  const ads: Ad[] = adsData?.ads || fallbackAds;

  const handleAdClick = async (adId: string) => {
    if (!adId) return;
    try { await fetch(`/api/cube-ads/${adId}/click`, { method: "POST" }); } catch {}
  };

  // Create 9 cube assignments
  const cubeAssignments = useMemo(() => {
    const extended = [...ads];
    while (extended.length < 54) extended.push(...ads);
    return Array.from({ length: 9 }, (_, i) => extended.slice(i * 6, i * 6 + 6));
  }, [ads]);

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-20 top-20 z-40"
        >
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => { setIsDismissed(true); onDismiss?.(); }}
            className="absolute -top-6 -right-2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-white/40 hover:text-white/60" />
          </motion.button>

          {/* Horizontal row of 9 cubes */}
          <div className="flex flex-row items-center gap-2">
            {cubeAssignments.map((cubeAds, index) => (
              <AdCube key={index} ads={cubeAds} index={index} isVisible={isVisible} onAdClick={handleAdClick} />
            ))}
          </div>

          {/* Ambient glow */}
          <div className="absolute inset-0 -z-10 blur-3xl opacity-15">
            <div className="w-full h-20 bg-gradient-to-r from-slate-500 via-purple-500 to-pink-500 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
