import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface SteamParticle {
  id: number;
  left: string;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
}

interface SteamParticlesProps {
  count?: number;
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
  color?: 'white' | 'cyan' | 'warm';
}

/**
 * SteamParticles - Animated steam overlay component
 * Creates floating particles that rise and fade
 */
export function SteamParticles({
  count = 15,
  className = '',
  intensity = 'medium',
  color = 'white'
}: SteamParticlesProps) {
  const particles = useMemo<SteamParticle[]>(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 6 + Math.random() * 8,
      size: 20 + Math.random() * 60,
      opacity: 0.1 + Math.random() * 0.3
    }));
  }, [count]);

  const getOpacityMultiplier = () => {
    switch (intensity) {
      case 'light':
        return 0.5;
      case 'heavy':
        return 1.5;
      default:
        return 1;
    }
  };

  const getColor = () => {
    switch (color) {
      case 'cyan':
        return 'rgba(0, 229, 255, VAR)';
      case 'warm':
        return 'rgba(255, 220, 200, VAR)';
      default:
        return 'rgba(255, 255, 255, VAR)';
    }
  };

  return (
    <div
      className={`steam-particles absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: particle.left,
            bottom: '-20px',
            width: particle.size,
            height: particle.size,
            background: `radial-gradient(circle, ${getColor().replace('VAR', String(particle.opacity * getOpacityMultiplier()))} 0%, transparent 70%)`,
            filter: 'blur(8px)'
          }}
          animate={{
            y: [0, -200, -400],
            x: [0, Math.random() > 0.5 ? 30 : -30, Math.random() > 0.5 ? -20 : 20],
            scale: [1, 1.5, 2],
            opacity: [0, particle.opacity * getOpacityMultiplier(), 0]
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}

      {/* Fog layer at bottom */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background: `linear-gradient(to top, ${getColor().replace('VAR', '0.1')} 0%, transparent 100%)`
        }}
        animate={{
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
}

/**
 * FogOverlay - A drifting fog effect for ambient atmosphere
 */
export function FogOverlay({
  className = '',
  intensity = 'medium'
}: {
  className?: string;
  intensity?: 'light' | 'medium' | 'heavy';
}) {
  const getOpacity = () => {
    switch (intensity) {
      case 'light':
        return 0.05;
      case 'heavy':
        return 0.15;
      default:
        return 0.08;
    }
  };

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        background: `linear-gradient(180deg,
          rgba(200, 220, 255, ${getOpacity()}) 0%,
          rgba(150, 180, 220, ${getOpacity() * 0.5}) 30%,
          transparent 60%,
          rgba(0, 229, 255, ${getOpacity() * 0.3}) 100%)`
      }}
      animate={{
        x: ['-5%', '5%', '-5%'],
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
      aria-hidden="true"
    />
  );
}

/**
 * WaterRipples - Animated water surface effect
 */
export function WaterRipples({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      {/* Multiple ripple layers */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 100% 50% at 50% 100%,
              rgba(0, 229, 255, ${0.05 - i * 0.01}) 0%,
              transparent ${50 + i * 15}%)`
          }}
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 3 + i,
            delay: i * 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      ))}

      {/* Caustics effect */}
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 30% 20% at 20% 80%, rgba(0, 229, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 25% 15% at 70% 85%, rgba(0, 200, 220, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 35% 25% at 40% 90%, rgba(0, 180, 200, 0.06) 0%, transparent 50%)
          `
        }}
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}

export default SteamParticles;
