import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SteamParticles, FogOverlay } from './SteamParticles';

interface ShowerSectionProps {
  children: ReactNode;
  className?: string;
  showShowerHeads?: boolean;
  showDrainGrate?: boolean;
  showHalfWall?: boolean;
  steamIntensity?: 'light' | 'medium' | 'heavy';
}

/**
 * ShowerSection - A section wrapper styled as a shower room area
 * Includes shower heads, half-walls, drain grates, and steam effects
 */
export function ShowerSection({
  children,
  className = '',
  showShowerHeads = true,
  showDrainGrate = true,
  showHalfWall = true,
  steamIntensity = 'medium'
}: ShowerSectionProps) {
  return (
    <section
      className={`shower-section relative overflow-hidden ${className}`}
      style={{
        background: `
          linear-gradient(180deg, rgba(200, 220, 255, 0.08) 0%, transparent 20%),
          radial-gradient(ellipse 100% 40% at 50% 100%, rgba(0, 180, 220, 0.06) 0%, transparent 50%),
          linear-gradient(180deg, rgba(30, 35, 42, 0.95) 0%, rgba(20, 25, 30, 0.98) 100%)
        `
      }}
    >
      {/* Half Wall at Top */}
      {showHalfWall && (
        <div className="relative h-16 mb-4">
          {/* Wall surface */}
          <div
            className="absolute bottom-0 left-0 right-0 h-12"
            style={{
              background: `linear-gradient(180deg,
                rgba(80, 85, 95, 1) 0%,
                rgba(60, 65, 75, 1) 50%,
                rgba(50, 55, 65, 1) 100%)`,
              borderBottom: '3px solid rgba(40, 45, 55, 1)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Tile pattern on wall */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px),
                  linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px)
                `,
                backgroundSize: '30px 30px'
              }}
            />
          </div>

          {/* Wall cap */}
          <div
            className="absolute bottom-12 left-0 right-0 h-4"
            style={{
              background: 'linear-gradient(180deg, rgba(100, 105, 115, 1) 0%, rgba(80, 85, 95, 1) 100%)',
              borderRadius: '2px 2px 0 0'
            }}
          />
        </div>
      )}

      {/* Shower Heads */}
      {showShowerHeads && (
        <div className="absolute top-0 left-0 right-0 flex justify-around px-8">
          {[...Array(5)].map((_, i) => (
            <ShowerHead key={i} delay={i * 0.3} />
          ))}
        </div>
      )}

      {/* Steam Effects */}
      <SteamParticles intensity={steamIntensity} color="white" count={20} />
      <FogOverlay intensity="light" />

      {/* Wet Tile Floor Pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(90deg, rgba(60, 65, 70, 0.15) 1px, transparent 1px),
            linear-gradient(rgba(60, 65, 70, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Wet shimmer effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%)'
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />

      {/* Content */}
      <div className="relative z-10 py-8 px-4">
        {children}
      </div>

      {/* Drain Grate at Bottom */}
      {showDrainGrate && (
        <div className="flex justify-center pb-8">
          <DrainGrate />
        </div>
      )}

      {/* Water pooling effect at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0, 180, 220, 0.05) 0%, transparent 100%)'
        }}
      />
    </section>
  );
}

/**
 * ShowerHead - Individual shower head fixture
 */
function ShowerHead({ delay = 0 }: { delay?: number }) {
  return (
    <div className="relative">
      {/* Pipe */}
      <div
        className="w-3 h-8"
        style={{
          background: 'linear-gradient(90deg, rgba(150, 155, 165, 1) 0%, rgba(180, 185, 195, 1) 50%, rgba(150, 155, 165, 1) 100%)',
          borderRadius: '2px',
          boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Shower head */}
      <div
        className="relative w-10 h-6 -ml-3.5"
        style={{
          background: 'linear-gradient(180deg, rgba(180, 185, 195, 1) 0%, rgba(150, 155, 165, 1) 100%)',
          borderRadius: '0 0 50% 50%',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Spray holes */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-1 h-1 rounded-full bg-gray-600" />
          ))}
        </div>
      </div>

      {/* Water droplets */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-2 rounded-full"
          style={{
            left: `${30 + i * 20}%`,
            top: '100%',
            background: 'rgba(200, 230, 255, 0.6)'
          }}
          animate={{
            y: [0, 60],
            opacity: [0.8, 0],
            scaleY: [1, 1.5]
          }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.2,
            repeat: Infinity,
            ease: 'easeIn'
          }}
        />
      ))}
    </div>
  );
}

/**
 * DrainGrate - Floor drain component
 */
function DrainGrate() {
  return (
    <div
      className="relative w-20 h-20 rounded-full"
      style={{
        background: 'linear-gradient(135deg, rgba(50, 55, 60, 1) 0%, rgba(35, 40, 45, 1) 100%)',
        border: '3px solid rgba(70, 75, 80, 0.8)',
        boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5), 0 2px 10px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Grate lines */}
      <div className="absolute inset-2 flex flex-col justify-around">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-0.5 bg-black/50 rounded-full"
            style={{
              boxShadow: '0 1px 0 rgba(80, 85, 90, 0.5)'
            }}
          />
        ))}
      </div>

      {/* Center hole */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.8)',
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 1)'
        }}
      />

      {/* Water swirl animation */}
      <motion.div
        className="absolute inset-3 rounded-full pointer-events-none"
        style={{
          background: 'conic-gradient(from 0deg, transparent, rgba(0, 180, 220, 0.1), transparent)'
        }}
        animate={{
          rotate: [0, 360]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

export default ShowerSection;
