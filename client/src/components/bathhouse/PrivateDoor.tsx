import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PrivateDoorProps {
  roomNumber: string | number;
  creatorName?: string;
  avatarUrl?: string;
  avatarFallback?: string;
  isOnline?: boolean;
  isOccupied?: boolean;
  onClick?: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * PrivateDoor - A creator card styled as a private room door
 * Used in the SearchCreators "Corridor" zone
 */
export function PrivateDoor({
  roomNumber,
  creatorName,
  avatarUrl,
  avatarFallback = 'C',
  isOnline = false,
  isOccupied = false,
  onClick,
  children,
  className = ''
}: PrivateDoorProps) {
  return (
    <motion.div
      className={`private-door relative cursor-pointer ${className}`}
      style={{
        background: `linear-gradient(180deg,
          rgba(50, 45, 40, 1) 0%,
          rgba(40, 35, 30, 1) 50%,
          rgba(45, 40, 35, 1) 100%)`,
        border: '3px solid rgba(70, 65, 60, 0.8)',
        borderRadius: '2px',
        transformStyle: 'preserve-3d',
        minHeight: '320px'
      }}
      whileHover={{
        rotateY: -5,
        boxShadow: '-10px 0 30px rgba(0, 229, 255, 0.15), 0 0 20px rgba(0, 229, 255, 0.1)'
      }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      {/* Door Frame Shadow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.5), inset -3px 0 10px rgba(0, 0, 0, 0.3)'
        }}
      />

      {/* Room Number Brass Plate */}
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 z-10"
        style={{
          background: 'linear-gradient(135deg, rgba(205, 127, 50, 0.9) 0%, rgba(255, 215, 0, 1) 30%, rgba(205, 127, 50, 0.9) 60%, rgba(180, 100, 40, 0.9) 100%)',
          color: 'rgba(40, 25, 10, 1)',
          fontFamily: '"Bebas Neue", "Teko", sans-serif',
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '0.15em',
          borderRadius: '2px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
        }}
        whileHover={{
          boxShadow: '0 0 15px rgba(255, 215, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.5)'
        }}
      >
        {String(roomNumber).padStart(3, '0')}
      </motion.div>

      {/* Occupied/Available Light */}
      <div className="absolute top-6 right-4">
        <motion.div
          className="w-3 h-3 rounded-full"
          style={{
            background: isOnline ? '#33ff33' : isOccupied ? '#ff3333' : '#666666',
            boxShadow: isOnline
              ? '0 0 10px #33ff33, 0 0 20px #33ff33'
              : isOccupied
              ? '0 0 10px #ff3333, 0 0 20px #ff3333'
              : 'none'
          }}
          animate={
            isOnline || isOccupied
              ? {
                  opacity: [1, 0.6, 1],
                  scale: [1, 1.1, 1]
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <span
          className="absolute top-4 right-0 text-xs whitespace-nowrap"
          style={{
            color: isOnline ? '#33ff33' : isOccupied ? '#ff3333' : '#666666',
            fontFamily: '"Bebas Neue", sans-serif',
            letterSpacing: '0.05em'
          }}
        >
          {isOnline ? 'ONLINE' : isOccupied ? 'BUSY' : 'AWAY'}
        </span>
      </div>

      {/* Peek Window */}
      <motion.div
        className="absolute top-20 left-1/2 -translate-x-1/2 overflow-hidden"
        style={{
          width: '80px',
          height: '100px',
          background: 'rgba(0, 0, 0, 0.9)',
          border: '3px solid rgba(100, 100, 110, 0.6)',
          borderRadius: '4px',
          boxShadow: 'inset 0 0 25px rgba(0, 229, 255, 0.08), 0 0 10px rgba(0, 0, 0, 0.5)'
        }}
        whileHover={{
          boxShadow: 'inset 0 0 35px rgba(0, 229, 255, 0.15), 0 0 15px rgba(0, 229, 255, 0.2)'
        }}
      >
        {/* Avatar inside peek window */}
        <div className="w-full h-full flex items-center justify-center p-2">
          <Avatar className="w-14 h-14 ring-2 ring-cyan-500/30">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="bg-cyan-900/50 text-cyan-400 text-lg">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Frosted glass effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(200, 220, 255, 0.05) 0%, transparent 50%, rgba(0, 229, 255, 0.03) 100%)'
          }}
          whileHover={{
            opacity: 0.5
          }}
        />
      </motion.div>

      {/* Door Handle */}
      <motion.div
        className="absolute top-1/2 right-4 -translate-y-1/2"
        whileHover={{
          rotate: -15,
          x: -2
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Handle Base */}
        <div
          className="w-4 h-12 rounded-sm"
          style={{
            background: 'linear-gradient(90deg, rgba(180, 160, 140, 0.9) 0%, rgba(140, 120, 100, 0.9) 50%, rgba(160, 140, 120, 0.9) 100%)',
            boxShadow: '2px 2px 8px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        />
        {/* Handle Lever */}
        <div
          className="absolute top-3 left-0 w-8 h-3 rounded-sm origin-left"
          style={{
            background: 'linear-gradient(180deg, rgba(200, 180, 160, 0.9) 0%, rgba(160, 140, 120, 0.9) 100%)',
            boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.3)'
          }}
        />
      </motion.div>

      {/* Creator Name Plate */}
      {creatorName && (
        <div
          className="absolute bottom-24 left-1/2 -translate-x-1/2 px-4 py-1"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(100, 100, 110, 0.4)',
            borderRadius: '2px'
          }}
        >
          <span
            className="text-sm text-cyan-400 font-medium"
            style={{ textShadow: '0 0 10px rgba(0, 229, 255, 0.5)' }}
          >
            {creatorName}
          </span>
        </div>
      )}

      {/* Content/Actions Area */}
      <div className="absolute bottom-4 left-4 right-4">
        {children}
      </div>

      {/* Wood grain texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.1) 2px,
            rgba(0, 0, 0, 0.1) 4px
          )`
        }}
      />

      {/* Light spill effect on hover */}
      <motion.div
        className="absolute -left-2 top-0 bottom-0 w-4 pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{
          opacity: 0.6,
          background: 'linear-gradient(90deg, rgba(0, 229, 255, 0.3) 0%, transparent 100%)'
        }}
      />
    </motion.div>
  );
}

export default PrivateDoor;
