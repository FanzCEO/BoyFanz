import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Lock, LockOpen } from 'lucide-react';

interface LockerCardProps {
  number: string | number;
  children: ReactNode;
  className?: string;
  isOpen?: boolean;
  onClick?: () => void;
}

/**
 * LockerCard - A card styled as a metal locker door
 * Used in the "Locker Room" zone for feature cards
 */
export function LockerCard({
  number,
  children,
  className = '',
  isOpen = false,
  onClick
}: LockerCardProps) {
  return (
    <motion.div
      className={`locker-card relative overflow-hidden ${className}`}
      whileHover={{
        scale: 1.02,
        boxShadow: '0 0 25px rgba(0, 229, 255, 0.2), inset 0 0 15px rgba(0, 229, 255, 0.05)'
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        background: `linear-gradient(135deg,
          rgba(60, 65, 75, 1) 0%,
          rgba(45, 50, 60, 1) 25%,
          rgba(55, 60, 70, 1) 50%,
          rgba(40, 45, 55, 1) 75%,
          rgba(50, 55, 65, 1) 100%)`,
        border: '1px solid rgba(80, 85, 95, 0.8)',
        borderRadius: '2px',
        boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 4px 20px rgba(0, 0, 0, 0.4)'
      }}
    >
      {/* Locker Vents at Top */}
      <div className="absolute top-0 left-0 right-0 h-8 flex items-center justify-center gap-1 bg-gradient-to-b from-black/20 to-transparent">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="w-8 h-1 bg-black/40 rounded-full"
            style={{
              boxShadow: 'inset 0 1px 0 rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)'
            }}
          />
        ))}
      </div>

      {/* Locker Number Badge */}
      <div
        className="absolute top-12 left-1/2 -translate-x-1/2 px-4 py-1 z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.9) 0%, rgba(255, 215, 0, 1) 30%, rgba(205, 127, 50, 0.9) 60%, rgba(180, 100, 40, 0.9) 100%)',
          color: 'rgba(40, 25, 10, 1)',
          fontFamily: '"Bebas Neue", "Teko", sans-serif',
          fontSize: '1.25rem',
          fontWeight: 700,
          letterSpacing: '0.1em',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
      >
        {String(number).padStart(3, '0')}
      </div>

      {/* Lock Icon */}
      <motion.div
        className="absolute top-12 right-4 text-gray-400"
        animate={{
          color: isOpen ? 'rgba(0, 229, 255, 0.8)' : 'rgba(156, 163, 175, 0.6)'
        }}
      >
        {isOpen ? (
          <LockOpen className="w-5 h-5" />
        ) : (
          <Lock className="w-5 h-5" />
        )}
      </motion.div>

      {/* Metal Gleam Effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.03) 50%, transparent 100%)',
          backgroundSize: '200% 100%'
        }}
        animate={{
          backgroundPosition: ['200% 0', '-200% 0']
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear'
        }}
      />

      {/* Content Area */}
      <div className="pt-20 p-6 relative z-0">
        {children}
      </div>

      {/* Bottom Edge Detail */}
      <div
        className="absolute bottom-0 left-0 right-0 h-2"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)',
          borderTop: '1px solid rgba(60, 65, 75, 0.5)'
        }}
      />

      {/* Corner Rivets */}
      <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
      <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
      <div className="absolute bottom-3 left-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
      <div className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-gray-600 shadow-inner" />
    </motion.div>
  );
}

export default LockerCard;
