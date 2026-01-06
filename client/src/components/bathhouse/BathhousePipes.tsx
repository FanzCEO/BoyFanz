import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Pipe {
  id: number;
  x: number; // percentage from left
  y: number; // percentage from top
  rotation: number; // angle of pipe
  size: 'small' | 'medium' | 'large';
  side: 'left' | 'right' | 'top';
}

interface SteamBurst {
  id: string;
  pipeId: number;
  timestamp: number;
}

interface BathhousePipesProps {
  pipeCount?: number;
  steamInterval?: number; // ms between steam bursts (per pipe)
  className?: string;
}

/**
 * BathhousePipes - Industrial pipes that occasionally blow steam
 * Creates an immersive bathhouse atmosphere without obscuring content
 */
export function BathhousePipes({
  pipeCount = 6,
  steamInterval = 8000, // Steam every 8 seconds per pipe (staggered)
  className = ''
}: BathhousePipesProps) {
  const [activeSteam, setActiveSteam] = useState<SteamBurst[]>([]);

  // Generate random pipe positions
  const pipes = useMemo<Pipe[]>(() => {
    return Array.from({ length: pipeCount }, (_, i) => {
      const side = ['left', 'right', 'top'][i % 3] as Pipe['side'];
      let x: number, y: number, rotation: number;

      switch (side) {
        case 'left':
          x = 0;
          y = 15 + Math.random() * 70;
          rotation = -15 + Math.random() * 30;
          break;
        case 'right':
          x = 100;
          y = 15 + Math.random() * 70;
          rotation = 165 + Math.random() * 30;
          break;
        case 'top':
        default:
          x = 10 + Math.random() * 80;
          y = 0;
          rotation = 75 + Math.random() * 30;
          break;
      }

      return {
        id: i,
        x,
        y,
        rotation,
        size: ['small', 'medium', 'large'][Math.floor(Math.random() * 3)] as Pipe['size'],
        side
      };
    });
  }, [pipeCount]);

  // Trigger steam bursts at random intervals
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    pipes.forEach((pipe, index) => {
      // Stagger initial steam bursts
      const initialDelay = (index * (steamInterval / pipeCount)) + Math.random() * 2000;

      const startSteam = () => {
        const burstId = `${pipe.id}-${Date.now()}`;
        setActiveSteam(prev => [...prev, { id: burstId, pipeId: pipe.id, timestamp: Date.now() }]);

        // Remove steam after animation completes (3 seconds)
        setTimeout(() => {
          setActiveSteam(prev => prev.filter(s => s.id !== burstId));
        }, 3000);
      };

      // Initial burst after delay
      const initialTimeout = setTimeout(() => {
        startSteam();

        // Then repeat at interval
        const interval = setInterval(startSteam, steamInterval + Math.random() * 4000);
        intervals.push(interval);
      }, initialDelay);

      intervals.push(initialTimeout as unknown as NodeJS.Timeout);
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [pipes, steamInterval]);

  const getPipeStyles = (pipe: Pipe) => {
    const sizeMap = {
      small: { width: 40, height: 12 },
      medium: { width: 60, height: 16 },
      large: { width: 80, height: 20 }
    };

    const { width, height } = sizeMap[pipe.size];

    return {
      width,
      height,
      left: pipe.side === 'left' ? 0 : pipe.side === 'right' ? 'auto' : `${pipe.x}%`,
      right: pipe.side === 'right' ? 0 : 'auto',
      top: pipe.side === 'top' ? 0 : `${pipe.y}%`,
      transform: `rotate(${pipe.rotation}deg)`,
    };
  };

  const getSteamDirection = (pipe: Pipe) => {
    switch (pipe.side) {
      case 'left':
        return { x: [0, 80, 120], y: [0, -20, -40] };
      case 'right':
        return { x: [0, -80, -120], y: [0, -20, -40] };
      case 'top':
      default:
        return { x: [0, 10, -10], y: [0, 60, 100] };
    }
  };

  return (
    <div
      className={`bathhouse-pipes fixed inset-0 overflow-hidden pointer-events-none z-10 ${className}`}
      aria-hidden="true"
    >
      {/* Render pipes */}
      {pipes.map((pipe) => (
        <div
          key={pipe.id}
          className="absolute"
          style={{
            ...getPipeStyles(pipe),
            transformOrigin: pipe.side === 'left' ? 'left center' : pipe.side === 'right' ? 'right center' : 'center top',
          }}
        >
          {/* Pipe body */}
          <div
            className="relative w-full h-full"
            style={{
              background: 'linear-gradient(180deg, #4a4a4a 0%, #2a2a2a 40%, #3a3a3a 60%, #252525 100%)',
              borderRadius: '4px',
              boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.5)',
              border: '1px solid rgba(80, 80, 80, 0.5)'
            }}
          >
            {/* Pipe rivets */}
            <div
              className="absolute top-1/2 left-2 w-2 h-2 rounded-full"
              style={{
                transform: 'translateY(-50%)',
                background: 'radial-gradient(circle at 30% 30%, #666 0%, #333 100%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            />
            <div
              className="absolute top-1/2 right-2 w-2 h-2 rounded-full"
              style={{
                transform: 'translateY(-50%)',
                background: 'radial-gradient(circle at 30% 30%, #666 0%, #333 100%)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
              }}
            />

            {/* Pipe nozzle */}
            <div
              className="absolute"
              style={{
                [pipe.side === 'right' ? 'left' : 'right']: -8,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 12,
                height: pipe.size === 'large' ? 14 : pipe.size === 'medium' ? 11 : 8,
                background: 'linear-gradient(90deg, #3a3a3a 0%, #555 50%, #3a3a3a 100%)',
                borderRadius: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
              }}
            />
          </div>

          {/* Steam bursts */}
          <AnimatePresence>
            {activeSteam
              .filter(s => s.pipeId === pipe.id)
              .map((steam) => {
                const direction = getSteamDirection(pipe);
                return (
                  <motion.div
                    key={steam.id}
                    className="absolute"
                    style={{
                      [pipe.side === 'right' ? 'left' : 'right']: pipe.side === 'top' ? '50%' : -20,
                      top: pipe.side === 'top' ? '100%' : '50%',
                      width: 60,
                      height: 60,
                    }}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{
                      opacity: [0, 0.6, 0.4, 0],
                      scale: [0.3, 1, 1.5, 2],
                      x: direction.x,
                      y: direction.y,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: 2.5,
                      ease: 'easeOut'
                    }}
                  >
                    {/* Steam cloud particles */}
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: 20 + i * 8,
                          height: 20 + i * 8,
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          background: `radial-gradient(circle, rgba(255, 255, 255, ${0.3 - i * 0.05}) 0%, transparent 70%)`,
                          filter: 'blur(4px)'
                        }}
                        animate={{
                          x: (Math.random() - 0.5) * 30,
                          y: (Math.random() - 0.5) * 30,
                          scale: [1, 1.2, 1.4],
                        }}
                        transition={{
                          duration: 2,
                          delay: i * 0.1,
                          ease: 'easeOut'
                        }}
                      />
                    ))}
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

/**
 * SubtleSteamAccent - Very light ambient steam for subtle atmosphere
 * Much less intrusive than the original SteamParticles
 */
export function SubtleSteamAccent({ className = '' }: { className?: string }) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {/* Very subtle bottom fog - almost invisible */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{
          background: 'linear-gradient(to top, rgba(255, 255, 255, 0.02) 0%, transparent 100%)',
        }}
      />
    </div>
  );
}

export default BathhousePipes;
