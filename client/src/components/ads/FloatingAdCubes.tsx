/**
 * Floating Ad Cubes - 3D Rotating Ad Carousel
 * 
 * When sidebar collapses, these cubes float in that space,
 * rotating and flipping to reveal different ads on each face.
 * Stacked vertically with ethereal floating animation.
 * 
 * Now fetches ads from the database via API.
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
  icon?: string;
}

// Fallback ads if API fails
const fallbackAds: Ad[] = [
  {
    id: "empire",
    title: "FANZ EMPIRE",
    description: "Command your digital dynasty",
    cta: "Enter",
    link: "/empire",
    gradient: "from-cyan-600 via-blue-700 to-purple-800",
  },
  {
    id: "secure",
    title: "FANZ SECURE",
    description: "Multi-layer protection",
    cta: "Shield Up",
    link: "/fanz-secure",
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
  },
  {
    id: "defend",
    title: "FANZ DEFEND",
    description: "Automated enforcement",
    cta: "Activate",
    link: "/fanz-defend",
    gradient: "from-red-600 via-orange-600 to-amber-600",
  },
  {
    id: "vault",
    title: "FANZ VAULT",
    description: "Premium content storage",
    cta: "Unlock",
    link: "/vault",
    gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
  },
  {
    id: "analytics",
    title: "FANZ ANALYTICS",
    description: "Deep performance insights",
    cta: "Analyze",
    link: "/analytics",
    gradient: "from-blue-600 via-indigo-600 to-violet-600",
  },
  {
    id: "network",
    title: "FANZ NETWORK",
    description: "Creator collaboration hub",
    cta: "Connect",
    link: "/network",
    gradient: "from-pink-600 via-rose-600 to-red-600",
  },
];

// Single 3D Cube Component
function AdCube({ 
  ads, 
  index, 
  isVisible,
  onAdClick,
  onAdImpression,
}: { 
  ads: Ad[]; 
  index: number;
  isVisible: boolean;
  onAdClick?: (adId: string) => void;
  onAdImpression?: (adId: string) => void;
}) {
  const [currentFace, setCurrentFace] = useState(0);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Track impressions when cube becomes visible
  useEffect(() => {
    if (isVisible && onAdImpression && ads[0]?.id) {
      // Track impression for the initial visible face
      onAdImpression(ads[0].id);
    }
  }, [isVisible]);

  // Each cube rotates on its own schedule
  useEffect(() => {
    if (!isVisible) return;

    const rotationInterval = setInterval(() => {
      // Randomly decide rotation direction
      const directions = [
        { x: 90, y: 0 },   // flip forward
        { x: -90, y: 0 },  // flip backward
        { x: 0, y: 90 },   // rotate right
        { x: 0, y: -90 },  // rotate left
        { x: 90, y: 90 },  // diagonal flip
        { x: -90, y: -90 }, // reverse diagonal
      ];
      
      const randomDir = directions[Math.floor(Math.random() * directions.length)];
      
      setRotation(prev => ({
        x: prev.x + randomDir.x,
        y: prev.y + randomDir.y,
      }));
      
      const newFace = (currentFace + 1) % 6;
      setCurrentFace(newFace);
      
      // Track impression for the new face
      if (onAdImpression && ads[newFace]?.id) {
        onAdImpression(ads[newFace].id);
      }
    }, 3000 + index * 500); // Staggered timing

    return () => clearInterval(rotationInterval);
  }, [isVisible, index, currentFace, ads, onAdImpression]);

  // Floating animation offset based on index
  const floatDelay = index * 0.3;
  const floatDuration = 3 + index * 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, x: -50, scale: 0.5 }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        scale: 1,
        y: [0, -8, 0, 8, 0], // Floating effect
      }}
      exit={{ opacity: 0, x: -50, scale: 0.5 }}
      transition={{
        opacity: { duration: 0.4, delay: index * 0.1 },
        x: { duration: 0.5, delay: index * 0.1 },
        scale: { duration: 0.4, delay: index * 0.1 },
        y: { 
          duration: floatDuration, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: floatDelay,
        },
      }}
      className="relative w-16 h-16 mb-4"
      style={{ perspective: "500px" }}
    >
      {/* The rotating cube container */}
      <motion.div
        animate={{
          rotateX: rotation.x,
          rotateY: rotation.y,
        }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth flip
        }}
        className="w-full h-full relative"
        style={{ 
          transformStyle: "preserve-3d",
        }}
      >
        {/* Front face */}
        <CubeFace ad={ads[0]} transform="translateZ(32px)" onClick={() => onAdClick?.(ads[0]?.id)} />
        
        {/* Back face */}
        <CubeFace ad={ads[1]} transform="translateZ(-32px) rotateY(180deg)" onClick={() => onAdClick?.(ads[1]?.id)} />
        
        {/* Right face */}
        <CubeFace ad={ads[2]} transform="translateX(32px) rotateY(90deg)" onClick={() => onAdClick?.(ads[2]?.id)} />
        
        {/* Left face */}
        <CubeFace ad={ads[3]} transform="translateX(-32px) rotateY(-90deg)" onClick={() => onAdClick?.(ads[3]?.id)} />
        
        {/* Top face */}
        <CubeFace ad={ads[4]} transform="translateY(-32px) rotateX(90deg)" onClick={() => onAdClick?.(ads[4]?.id)} />
        
        {/* Bottom face */}
        <CubeFace ad={ads[5]} transform="translateY(32px) rotateX(-90deg)" onClick={() => onAdClick?.(ads[5]?.id)} />
      </motion.div>

      {/* Glow effect underneath */}
      <div 
        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-2 rounded-full opacity-30 blur-sm"
        style={{
          background: `linear-gradient(90deg, ${ads[currentFace % ads.length]?.gradient?.includes('cyan') ? '#06b6d4' : '#8b5cf6'}, transparent, ${ads[currentFace % ads.length]?.gradient?.includes('red') ? '#ef4444' : '#3b82f6'})`,
        }}
      />
    </motion.div>
  );
}

// Individual cube face
function CubeFace({ ad, transform, onClick }: { ad: Ad; transform: string; onClick?: () => void }) {
  if (!ad) return null;
  
  const handleClick = (e: React.MouseEvent) => {
    onClick?.();
    // Let the link navigate naturally
  };

  return (
    <a
      href={ad.link}
      onClick={handleClick}
      className="absolute w-16 h-16 flex flex-col items-center justify-center p-1 rounded-lg border border-white/20 backdrop-blur-sm cursor-pointer hover:border-white/40 transition-colors group"
      style={{
        transform,
        backfaceVisibility: "hidden",
        background: `linear-gradient(135deg, ${ad.gradient.replace('from-', '').split(' ')[0]}, ${ad.gradient.includes('to-') ? ad.gradient.split('to-')[1] : '#1a1a2e'})`,
      }}
    >
      <span className="text-[6px] text-white/40 uppercase tracking-wider absolute top-0.5 left-1">Ad</span>
      <div className="text-center">
        <h4 className="text-[8px] font-bold text-white leading-tight mb-0.5 group-hover:text-white/90">
          {ad.title}
        </h4>
        <p className="text-[6px] text-white/60 leading-tight hidden group-hover:block">
          {ad.cta}
        </p>
      </div>
    </a>
  );
}

// Main Floating Ad Cubes Component
export default function FloatingAdCubes({ 
  isVisible,
  onDismiss,
}: { 
  isVisible: boolean;
  onDismiss?: () => void;
}) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Fetch ads from API
  const { data: adsData } = useQuery({
    queryKey: ["cube-ads"],
    queryFn: async () => {
      const res = await fetch("/api/cube-ads");
      if (!res.ok) throw new Error("Failed to fetch ads");
      return res.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
  });

  const ads: Ad[] = adsData?.ads || fallbackAds;

  // Track click
  const handleAdClick = async (adId: string) => {
    if (!adId || adId.startsWith('fallback')) return;
    try {
      await fetch(`/api/cube-ads/${adId}/click`, { method: "POST" });
    } catch (e) {
      // Silent fail
    }
  };

  // Track impression
  const handleAdImpression = async (adId: string) => {
    if (!adId || adId.startsWith('fallback')) return;
    try {
      await fetch(`/api/cube-ads/${adId}/impression`, { method: "POST" });
    } catch (e) {
      // Silent fail
    }
  };

  // Create cube ad assignments (each cube gets 6 ads for its faces)
  const cubeAssignments = useMemo(() => {
    if (ads.length < 6) {
      // Repeat ads to fill faces
      const extended = [...ads];
      while (extended.length < 18) {
        extended.push(...ads);
      }
      return [
        extended.slice(0, 6),
        extended.slice(6, 12),
        extended.slice(12, 18),
      ];
    }
    
    const shuffled = [...ads].sort(() => Math.random() - 0.5);
    // We'll have 3 cubes, each needs 6 faces
    const allAds = [...shuffled, ...shuffled, ...shuffled];
    return [
      allAds.slice(0, 6),
      allAds.slice(6, 12),
      allAds.slice(12, 18),
    ];
  }, [ads]);

  if (isDismissed || !isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed left-20 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center"
        >
          {/* Dismiss button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => {
              setIsDismissed(true);
              onDismiss?.();
            }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-3 h-3 text-white/40 hover:text-white/60" />
          </motion.button>

          {/* Stack of floating cubes */}
          <div className="flex flex-col items-center">
            {cubeAssignments.map((cubeAds, index) => (
              <AdCube 
                key={index} 
                ads={cubeAds} 
                index={index}
                isVisible={isVisible}
                onAdClick={handleAdClick}
                onAdImpression={handleAdImpression}
              />
            ))}
          </div>

          {/* Ambient glow behind all cubes */}
          <div className="absolute inset-0 -z-10 blur-2xl opacity-20">
            <div className="w-20 h-64 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500 rounded-full" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
