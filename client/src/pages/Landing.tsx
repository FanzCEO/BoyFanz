import { useState } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { BathhousePipes } from "@/components/bathhouse";
import Footer from "@/components/Footer";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import {
  Droplets,
  Lock,
  Flame,
  Users,
  Dumbbell,
  DoorOpen,
  Waves,
  ThermometerSun,
  Wind,
  Heart,
  Star,
  Play,
  Eye,
  ArrowRight,
  X,
  TrendingUp,
  Award,
  DollarSign,
  Zap
} from "lucide-react";

// Zone configuration
const BATHHOUSE_ZONES = {
  showers: {
    id: 'showers',
    name: 'The Showers',
    tagline: 'Get clean. Get ready.',
    description: 'Where every journey begins. Create your profile and step into the action.',
    icon: Droplets,
    color: '#00bfff',
    glowColor: 'rgba(0, 191, 255, 0.4)',
    action: 'Sign Up',
    route: '/fan-signup',
  },
  lockers: {
    id: 'lockers',
    name: 'Locker Room',
    tagline: 'Secure your gear.',
    description: 'Your private space. Manage your profile, settings, and preferences.',
    icon: Lock,
    color: '#8B8000',
    glowColor: 'rgba(139, 128, 0, 0.4)',
    action: 'My Locker',
    route: '/auth/login',
  },
  steamRoom: {
    id: 'steamRoom',
    name: 'Steam Room',
    tagline: 'Things get steamy.',
    description: 'Browse exclusive content from verified creators. Premium access only.',
    icon: Wind,
    color: '#87CEEB',
    glowColor: 'rgba(135, 206, 235, 0.3)',
    action: 'Enter',
    route: '/search',
  },
  sauna: {
    id: 'sauna',
    name: 'The Sauna',
    tagline: 'Turn up the heat.',
    description: 'Trending creators and hot new content. See who\'s on fire right now.',
    icon: ThermometerSun,
    color: '#ff6b35',
    glowColor: 'rgba(255, 107, 53, 0.4)',
    action: 'Get Hot',
    route: '/search?filter=trending',
  },
  hotTub: {
    id: 'hotTub',
    name: 'Hot Tub',
    tagline: 'Relax and connect.',
    description: 'Social lounge. Chat, connect, and find your next favorite creator.',
    icon: Waves,
    color: '#00CED1',
    glowColor: 'rgba(0, 206, 209, 0.4)',
    action: 'Jump In',
    route: '/messages',
  },
  pool: {
    id: 'pool',
    name: 'The Pool',
    tagline: 'Dive deep.',
    description: 'Explore endless content. Discover new creators across all categories.',
    icon: Waves,
    color: '#1E90FF',
    glowColor: 'rgba(30, 144, 255, 0.4)',
    action: 'Explore',
    route: '/search',
  },
  privateRooms: {
    id: 'privateRooms',
    name: 'Private Rooms',
    tagline: 'One on one.',
    description: 'Exclusive access to your subscribed creators. Private shows and DMs.',
    icon: DoorOpen,
    color: '#dc143c',
    glowColor: 'rgba(220, 20, 60, 0.5)',
    action: 'Enter Room',
    route: '/subscriptions',
  },
  gym: {
    id: 'gym',
    name: 'The Gym',
    tagline: 'Build your empire.',
    description: 'Creator tools. Grow your audience, track analytics, maximize earnings.',
    icon: Dumbbell,
    color: '#32CD32',
    glowColor: 'rgba(50, 205, 50, 0.4)',
    action: 'Start Training',
    route: '/creator-signup',
  },
  playroom: {
    id: 'playroom',
    name: 'The Playroom',
    tagline: 'No limits.',
    description: 'The darkest corner. Explicit content for verified adults only.',
    icon: Flame,
    color: '#8B0000',
    glowColor: 'rgba(139, 0, 0, 0.6)',
    action: 'Enter If You Dare',
    route: '/search?filter=explicit',
  },
};

// Featured Creators (sample data - replace with API call)
const FEATURED_CREATORS = [
  {
    id: '1',
    username: 'Flex_Daddy',
    displayName: 'Flex Daddy',
    avatar: 'https://i.pravatar.cc/300?img=12',
    subscriberCount: 12500,
    description: 'Fitness model & lifestyle creator',
    verified: true,
  },
  {
    id: '2',
    username: 'Ink_Boi',
    displayName: 'Ink Boi',
    avatar: 'https://i.pravatar.cc/300?img=13',
    subscriberCount: 8300,
    description: 'Tattoo artist & urban explorer',
    verified: true,
  },
  {
    id: '3',
    username: 'Chef_Marco',
    displayName: 'Chef Marco',
    avatar: 'https://i.pravatar.cc/300?img=14',
    subscriberCount: 15200,
    description: 'Culinary content & cooking tutorials',
    verified: true,
  },
  {
    id: '4',
    username: 'DJ_Pulse',
    displayName: 'DJ Pulse',
    avatar: 'https://i.pravatar.cc/300?img=15',
    subscriberCount: 9800,
    description: 'Music producer & live sets',
    verified: false,
  },
  {
    id: '5',
    username: 'Gamer_King',
    displayName: 'Gamer King',
    avatar: 'https://i.pravatar.cc/300?img=16',
    subscriberCount: 21000,
    description: 'Gaming streams & walkthroughs',
    verified: true,
  },
];

// Featured Affiliates (sample data - replace with API call)
const FEATURED_AFFILIATES = [
  {
    id: '1',
    name: 'Premium Gear',
    logo: 'https://via.placeholder.com/150/8B0000/FFFFFF?text=PG',
    description: 'Exclusive fitness equipment & apparel',
    commission: '15%',
  },
  {
    id: '2',
    name: 'Lifestyle Luxury',
    logo: 'https://via.placeholder.com/150/00CED1/FFFFFF?text=LL',
    description: 'Premium lifestyle products',
    commission: '20%',
  },
  {
    id: '3',
    name: 'Tech & Gadgets',
    logo: 'https://via.placeholder.com/150/32CD32/FFFFFF?text=TG',
    description: 'Latest tech gear & accessories',
    commission: '12%',
  },
  {
    id: '4',
    name: 'Beauty Essentials',
    logo: 'https://via.placeholder.com/150/ff6b35/FFFFFF?text=BE',
    description: 'Grooming & beauty products',
    commission: '18%',
  },
];

// Interactive Zone Component
function BathhouseZone({
  zone,
  position,
  size,
  onSelect,
  isSelected
}: {
  zone: typeof BATHHOUSE_ZONES.showers;
  position: { x: number; y: number };
  size: { w: number; h: number };
  onSelect: () => void;
  isSelected: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = zone.icon;

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${size.w}%`,
        height: `${size.h}%`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Zone background */}
      <div
        className="absolute inset-0 rounded-lg transition-all duration-500"
        style={{
          background: isHovered || isSelected
            ? `linear-gradient(135deg, ${zone.color}15 0%, ${zone.color}30 100%)`
            : 'linear-gradient(135deg, rgba(20, 15, 15, 0.8) 0%, rgba(10, 8, 8, 0.9) 100%)',
          border: `2px solid ${isHovered || isSelected ? zone.color : 'rgba(60, 50, 50, 0.5)'}`,
          boxShadow: isHovered || isSelected
            ? `0 0 40px ${zone.glowColor}, inset 0 0 60px ${zone.glowColor}`
            : 'inset 0 0 30px rgba(0, 0, 0, 0.5)',
        }}
      />

      {/* Zone-specific ambient effects */}
      {zone.id === 'showers' && (
        <ShowerEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'steamRoom' && (
        <SteamEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'sauna' && (
        <HeatEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'hotTub' && (
        <BubbleEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'pool' && (
        <WaterEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'playroom' && (
        <FlameEffect isActive={isHovered || isSelected} />
      )}
      {zone.id === 'gym' && (
        <PulseEffect isActive={isHovered || isSelected} color={zone.color} />
      )}

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-4 z-10">
        <motion.div
          animate={isHovered ? { scale: 1.2, rotate: [0, -5, 5, 0] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className="w-8 h-8 md:w-12 md:h-12 mb-2"
            style={{
              color: isHovered || isSelected ? zone.color : 'rgba(255, 255, 255, 0.6)',
              filter: isHovered ? `drop-shadow(0 0 10px ${zone.color})` : 'none'
            }}
          />
        </motion.div>

        <h3
          className="text-sm md:text-lg font-black uppercase tracking-wide text-center"
          style={{
            color: isHovered || isSelected ? zone.color : 'rgba(255, 255, 255, 0.8)',
            textShadow: isHovered ? `0 0 20px ${zone.glowColor}` : 'none'
          }}
        >
          {zone.name}
        </h3>

        <p
          className="text-xs text-center mt-1 hidden md:block"
          style={{ color: 'rgba(255, 255, 255, 0.5)' }}
        >
          {zone.tagline}
        </p>
      </div>

      {/* Corner glow indicators */}
      {(isHovered || isSelected) && (
        <>
          <div
            className="absolute top-0 left-0 w-8 h-8"
            style={{
              background: `linear-gradient(135deg, ${zone.color}60 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-8 h-8"
            style={{
              background: `linear-gradient(-45deg, ${zone.color}60 0%, transparent 70%)`,
            }}
          />
        </>
      )}
    </motion.div>
  );
}

// SHOWER EFFECT - Water droplets falling
function ShowerEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && [...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 bg-gradient-to-b from-slate-400/60 to-transparent"
          style={{
            left: `${10 + (i * 7)}%`,
            height: '30px',
          }}
          initial={{ top: '-30px', opacity: 0 }}
          animate={{
            top: ['0%', '100%'],
            opacity: [0.8, 0]
          }}
          transition={{
            duration: 0.8,
            delay: i * 0.1,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      ))}
      {/* Shower head silhouettes at top */}
      <div className="absolute top-2 left-1/4 w-6 h-3 bg-gray-600/50 rounded-b-full" />
      <div className="absolute top-2 right-1/4 w-6 h-3 bg-gray-600/50 rounded-b-full" />
    </div>
  );
}

// STEAM EFFECT - Rising steam clouds
function SteamEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && [...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${15 + (i * 10)}%`,
            bottom: '10%',
            width: '40px',
            height: '40px',
            background: 'radial-gradient(circle, rgba(200, 220, 255, 0.3) 0%, transparent 70%)',
          }}
          animate={{
            y: [0, -80, -120],
            x: [0, (i % 2 === 0 ? 15 : -15), 0],
            scale: [0.5, 1.2, 1.5],
            opacity: [0.6, 0.4, 0],
          }}
          transition={{
            duration: 3,
            delay: i * 0.3,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  );
}

// HEAT EFFECT - Rising heat waves
function HeatEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && (
        <>
          {/* Heat wave distortion lines */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-orange-400/30 to-transparent"
              style={{ bottom: `${20 + i * 15}%` }}
              animate={{
                scaleX: [1, 1.1, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
              }}
            />
          ))}
          {/* Hot coals glow at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-8"
            style={{
              background: 'linear-gradient(to top, rgba(255, 100, 0, 0.3), transparent)'
            }}
          />
        </>
      )}
    </div>
  );
}

// BUBBLE EFFECT - Hot tub bubbles
function BubbleEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && [...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-cyan-300/40"
          style={{
            left: `${5 + Math.random() * 90}%`,
            bottom: '5%',
            width: `${8 + Math.random() * 12}px`,
            height: `${8 + Math.random() * 12}px`,
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.3), transparent)',
          }}
          animate={{
            y: [0, -100 - Math.random() * 50],
            x: [0, (Math.random() - 0.5) * 30],
            opacity: [0.7, 0],
            scale: [1, 0.5],
          }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: i * 0.15,
            repeat: Infinity,
            ease: 'easeOut'
          }}
        />
      ))}
      {/* Water surface shimmer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/3"
        style={{
          background: 'linear-gradient(to top, rgba(0, 206, 209, 0.2), transparent)'
        }}
        animate={{ opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </div>
  );
}

// WATER EFFECT - Pool ripples
function WaterEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && (
        <>
          {/* Ripple circles */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-blue-400/30"
              initial={{ width: 0, height: 0, opacity: 0.8 }}
              animate={{
                width: [0, 150, 200],
                height: [0, 150, 200],
                opacity: [0.6, 0.3, 0],
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.8,
                repeat: Infinity,
                ease: 'easeOut'
              }}
            />
          ))}
          {/* Water caustics overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(30, 144, 255, 0.1) 0%, transparent 70%)'
            }}
          />
        </>
      )}
    </div>
  );
}

// FLAME EFFECT - For playroom
function FlameEffect({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && (
        <>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bottom-0"
              style={{
                left: `${10 + i * 11}%`,
                width: '20px',
                height: '40px',
                background: 'linear-gradient(to top, #8B0000, #ff4500, transparent)',
                borderRadius: '50% 50% 20% 20%',
                filter: 'blur(2px)',
              }}
              animate={{
                height: ['30px', '50px', '35px'],
                opacity: [0.7, 1, 0.7],
                scaleX: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5 + Math.random() * 0.3,
                delay: i * 0.1,
                repeat: Infinity,
              }}
            />
          ))}
          {/* Red ambient glow */}
          <div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at bottom, rgba(139, 0, 0, 0.3) 0%, transparent 60%)'
            }}
          />
        </>
      )}
    </div>
  );
}

// PULSE EFFECT - For gym
function PulseEffect({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none">
      {isActive && (
        <motion.div
          className="absolute inset-4 rounded-lg"
          style={{ border: `2px solid ${color}` }}
          animate={{
            opacity: [0.3, 0.7, 0.3],
            scale: [0.95, 1, 0.95],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        />
      )}
    </div>
  );
}

// Zone Detail Panel
function ZoneDetailPanel({
  zone,
  onClose,
  onAction
}: {
  zone: typeof BATHHOUSE_ZONES.showers | null;
  onClose: () => void;
  onAction: (route: string) => void;
}) {
  if (!zone) return null;

  const Icon = zone.icon;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="relative w-full max-w-lg p-8 rounded-lg"
        style={{
          background: `linear-gradient(135deg, rgba(20, 15, 15, 0.98) 0%, rgba(10, 8, 8, 0.99) 100%)`,
          border: `2px solid ${zone.color}`,
          boxShadow: `0 0 60px ${zone.glowColor}, inset 0 0 40px rgba(0, 0, 0, 0.5)`,
        }}
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Icon
              className="w-20 h-20 mx-auto mb-6"
              style={{
                color: zone.color,
                filter: `drop-shadow(0 0 20px ${zone.glowColor})`
              }}
            />
          </motion.div>

          <h2
            className="text-4xl font-black uppercase mb-2"
            style={{ color: zone.color }}
          >
            {zone.name}
          </h2>

          <p className="text-xl text-white/60 italic mb-6">
            {zone.tagline}
          </p>

          <p className="text-lg text-gray-400 mb-8 leading-relaxed">
            {zone.description}
          </p>

          <Button
            onClick={() => onAction(zone.route)}
            size="lg"
            className="px-12 py-6 text-xl font-black uppercase tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${zone.color} 0%, ${zone.color}aa 100%)`,
              boxShadow: `0 0 30px ${zone.glowColor}`,
            }}
          >
            {zone.action}
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const [, setLocation] = useLocation();
  const [selectedZone, setSelectedZone] = useState<typeof BATHHOUSE_ZONES.showers | null>(null);

  const handleZoneAction = (route: string) => {
    setSelectedZone(null);
    setLocation(route);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" data-testid="landing-page">
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Industrial Steam Pipes - Over the top bathhouse atmosphere */}
      <BathhousePipes pipeCount={8} steamInterval={6000} />

      {/* Dripping Water Animation - Sexy condensation effect */}
      <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`drip-${i}`}
            className="absolute w-0.5 bg-gradient-to-b from-slate-400/60 via-cyan-300/40 to-transparent"
            style={{
              left: `${5 + i * 8}%`,
              height: '60px',
            }}
            initial={{ top: '-60px', opacity: 0 }}
            animate={{
              top: ['0%', '100%'],
              opacity: [0.8, 0.3, 0]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              delay: i * 1.2 + Math.random() * 2,
              repeat: Infinity,
              ease: 'easeIn'
            }}
          />
        ))}
      </div>

      {/* Pulsing Red Light Effects - Like a dark room */}
      <div className="fixed inset-0 pointer-events-none z-5">
        <motion.div
          className="absolute top-0 left-1/4 w-4 h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 0, 50, 0.3) 0%, transparent 30%, transparent 70%, rgba(255, 0, 50, 0.2) 100%)'
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        <motion.div
          className="absolute top-0 right-1/4 w-4 h-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255, 0, 50, 0.3) 0%, transparent 30%, transparent 70%, rgba(255, 0, 50, 0.2) 100%)'
          }}
          animate={{
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            delay: 1.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </div>

      {/* Floating Mist Particles - Sexy steam room vibe */}
      <div className="fixed inset-0 pointer-events-none z-5 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`mist-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${30 + Math.random() * 50}px`,
              height: `${30 + Math.random() * 50}px`,
              background: `radial-gradient(circle, rgba(255, 255, 255, ${0.02 + Math.random() * 0.03}) 0%, transparent 70%)`,
              filter: 'blur(10px)'
            }}
            animate={{
              x: [0, (Math.random() - 0.5) * 100, 0],
              y: [0, (Math.random() - 0.5) * 100, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              delay: i * 0.5,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
        ))}
      </div>

      {/* ============================================
          HEADER - Neon sign
          ============================================ */}
      <header className="relative py-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Logo with dark red neon shadow and bright edges */}
          <img
            src="/boyfanz-logo.png"
            alt="BoyFanz"
            className="h-44 md:h-56 lg:h-64 w-auto mx-auto"
            style={{
              filter: 'brightness(1.3) contrast(1.1) drop-shadow(0 0 20px rgba(139, 0, 0, 0.9)) drop-shadow(0 0 40px rgba(100, 0, 0, 0.7)) drop-shadow(0 0 60px rgba(80, 0, 0, 0.5))',
            }}
          />

          <p className="mt-4 text-lg md:text-xl text-gray-400 uppercase tracking-[0.3em]">
            Step Inside. Explore. Indulge.
          </p>
        </motion.div>
      </header>

      {/* ============================================
          MAIN - Interactive Bathhouse Floor Plan
          ============================================ */}
      <main id="main-content" className="relative px-4 py-8" role="main">
        <div className="max-w-6xl mx-auto">
          {/* Floor plan title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-2">
              Choose Your <span className="text-red-500">Destination</span>
            </h1>
            <p className="text-gray-500">Click any zone to explore</p>
          </motion.div>

          {/* Interactive Floor Plan */}
          <motion.div
            className="relative w-full aspect-[16/10] md:aspect-[16/9] rounded-xl overflow-hidden"
            style={{
              background: `
                linear-gradient(180deg, rgba(15, 10, 10, 0.95) 0%, rgba(5, 3, 3, 0.98) 100%)
              `,
              border: '3px solid rgba(80, 60, 60, 0.5)',
              boxShadow: '0 0 100px rgba(0, 0, 0, 0.8), inset 0 0 100px rgba(0, 0, 0, 0.5)',
            }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {/* Ambient lighting effects */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Red overhead lights */}
              <div className="absolute top-0 left-1/4 w-2 h-24 bg-gradient-to-b from-red-600/20 to-transparent" />
              <div className="absolute top-0 left-1/2 w-2 h-24 bg-gradient-to-b from-red-600/20 to-transparent" />
              <div className="absolute top-0 right-1/4 w-2 h-24 bg-gradient-to-b from-red-600/20 to-transparent" />

              {/* Edge shadows for depth */}
              <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black/60 to-transparent" />
              <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black/60 to-transparent" />
            </div>

            {/* ZONE GRID - 3x3 layout */}
            {/* Row 1 */}
            <BathhouseZone
              zone={BATHHOUSE_ZONES.showers}
              position={{ x: 2, y: 2 }}
              size={{ w: 31, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.showers)}
              isSelected={selectedZone?.id === 'showers'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.lockers}
              position={{ x: 35, y: 2 }}
              size={{ w: 28, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.lockers)}
              isSelected={selectedZone?.id === 'lockers'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.gym}
              position={{ x: 65, y: 2 }}
              size={{ w: 33, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.gym)}
              isSelected={selectedZone?.id === 'gym'}
            />

            {/* Row 2 */}
            <BathhouseZone
              zone={BATHHOUSE_ZONES.steamRoom}
              position={{ x: 2, y: 34 }}
              size={{ w: 23, h: 32 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.steamRoom)}
              isSelected={selectedZone?.id === 'steamRoom'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.pool}
              position={{ x: 27, y: 34 }}
              size={{ w: 46, h: 32 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.pool)}
              isSelected={selectedZone?.id === 'pool'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.sauna}
              position={{ x: 75, y: 34 }}
              size={{ w: 23, h: 32 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.sauna)}
              isSelected={selectedZone?.id === 'sauna'}
            />

            {/* Row 3 */}
            <BathhouseZone
              zone={BATHHOUSE_ZONES.hotTub}
              position={{ x: 2, y: 68 }}
              size={{ w: 31, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.hotTub)}
              isSelected={selectedZone?.id === 'hotTub'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.privateRooms}
              position={{ x: 35, y: 68 }}
              size={{ w: 28, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.privateRooms)}
              isSelected={selectedZone?.id === 'privateRooms'}
            />
            <BathhouseZone
              zone={BATHHOUSE_ZONES.playroom}
              position={{ x: 65, y: 68 }}
              size={{ w: 33, h: 30 }}
              onSelect={() => setSelectedZone(BATHHOUSE_ZONES.playroom)}
              isSelected={selectedZone?.id === 'playroom'}
            />
          </motion.div>

          {/* ============================================
              VALUE PROPOSITIONS - Bold & Powerful
              ============================================ */}
          <motion.div
            className="mt-12 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Free to Join */}
              <div
                className="relative group rounded-xl p-8 overflow-hidden cursor-default transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(71, 85, 105, 0.08) 0%, rgba(0, 100, 150, 0.12) 100%)',
                  border: '2px solid rgba(71, 85, 105, 0.3)',
                  boxShadow: '0 0 40px rgba(71, 85, 105, 0.15)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-slate-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-full p-4"
                      style={{
                        background: 'linear-gradient(135deg, #475569 0%, #334155 100%)',
                        boxShadow: '0 0 30px rgba(71, 85, 105, 0.5)',
                      }}
                    >
                      <Zap className="w-8 h-8 text-black fill-black" />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1"
                      style={{
                        background: 'linear-gradient(135deg, #475569 0%, #18ffff 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 40px rgba(71, 85, 105, 0.3)',
                      }}
                    >
                      Free to Join
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base">
                      No upfront costs. Start exploring immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Creators Keep 100% */}
              <div
                className="relative group rounded-xl p-8 overflow-hidden cursor-default transition-all duration-300 hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.08) 0%, rgba(139, 0, 0, 0.12) 100%)',
                  border: '2px solid rgba(220, 20, 60, 0.3)',
                  boxShadow: '0 0 40px rgba(220, 20, 60, 0.15)',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-400/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div
                      className="rounded-full p-4"
                      style={{
                        background: 'linear-gradient(135deg, #dc143c 0%, #8B0000 100%)',
                        boxShadow: '0 0 30px rgba(220, 20, 60, 0.5)',
                      }}
                    >
                      <DollarSign className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3
                      className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-1"
                      style={{
                        background: 'linear-gradient(135deg, #dc143c 0%, #ff1744 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        textShadow: '0 0 40px rgba(220, 20, 60, 0.3)',
                      }}
                    >
                      Keep 100% Revenue
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base">
                      Creators earn every dollar. No platform fees.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick action buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Button
              onClick={() => setLocation('/fan-signup')}
              size="lg"
              className="px-8 py-6 text-lg font-bold uppercase tracking-wider bg-transparent border-2 border-white text-white hover:bg-white hover:text-black transition-all"
            >
              <Eye className="w-5 h-5 mr-3" />
              Watch Content
            </Button>
            <Button
              onClick={() => setLocation('/creator-signup')}
              size="lg"
              className="px-8 py-6 text-lg font-bold uppercase tracking-wider bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 border-2 border-red-500"
              style={{ boxShadow: '0 0 30px rgba(255, 0, 50, 0.3)' }}
            >
              <Play className="w-5 h-5 mr-3 fill-white" />
              Become a Creator
            </Button>
          </motion.div>

          {/* Already a member */}
          <motion.div
            className="text-center mt-6 mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <button
              onClick={() => setLocation('/auth/login')}
              className="text-gray-500 hover:text-white text-lg uppercase tracking-wider transition-colors"
            >
              Already a member? <span className="text-red-400">Sign In</span>
            </button>
          </motion.div>

          {/* ============================================
              FEATURED CREATORS CAROUSEL
              ============================================ */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                  Featured <span className="text-slate-400">Creators</span>
                </h2>
                <p className="text-gray-500 mt-1">Discover the hottest creators on BoyFanz</p>
              </div>
              <Button
                onClick={() => setLocation('/search')}
                variant="outline"
                className="border-slate-400/30 text-slate-400 hover:bg-slate-400/10"
              >
                View All <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {FEATURED_CREATORS.map((creator) => (
                  <CarouselItem key={creator.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                    <div
                      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20, 15, 15, 0.9) 0%, rgba(10, 8, 8, 0.95) 100%)',
                        border: '1px solid rgba(71, 85, 105, 0.2)',
                      }}
                      onClick={() => setLocation(`/creator/${creator.username}`)}
                    >
                      {/* Avatar */}
                      <div className="relative aspect-square overflow-hidden">
                        <img
                          src={creator.avatar}
                          alt={creator.displayName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                        {/* Verified badge */}
                        {creator.verified && (
                          <div className="absolute top-3 right-3 bg-slate-400 rounded-full p-1.5">
                            <Star className="w-4 h-4 text-black fill-black" />
                          </div>
                        )}
                      </div>

                      {/* Creator info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-1 truncate">
                          {creator.displayName}
                        </h3>
                        <p className="text-sm text-gray-400 mb-2 truncate">
                          @{creator.username}
                        </p>
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                          {creator.description}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <Users className="w-3 h-3" />
                          <span>{creator.subscriberCount.toLocaleString()} fans</span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-slate-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12 bg-black/80 border-slate-400/30 text-slate-400" />
              <CarouselNext className="right-0 md:-right-12 bg-black/80 border-slate-400/30 text-slate-400" />
            </Carousel>
          </motion.div>

          {/* ============================================
              FEATURED AFFILIATES CAROUSEL
              ============================================ */}
          <motion.div
            className="mt-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight">
                  Partner <span className="text-red-400">Brands</span>
                </h2>
                <p className="text-gray-500 mt-1">Exclusive deals from our affiliate partners</p>
              </div>
              <Button
                onClick={() => setLocation('/fanzfiliate')}
                variant="outline"
                className="border-red-400/30 text-red-400 hover:bg-red-400/10"
              >
                Become an Affiliate <Award className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {FEATURED_AFFILIATES.map((affiliate) => (
                  <CarouselItem key={affiliate.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/3">
                    <div
                      className="group relative rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 h-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(20, 15, 15, 0.9) 0%, rgba(10, 8, 8, 0.95) 100%)',
                        border: '1px solid rgba(255, 50, 50, 0.2)',
                      }}
                    >
                      {/* Logo */}
                      <div className="relative aspect-video overflow-hidden bg-black/40 flex items-center justify-center p-8">
                        <img
                          src={affiliate.logo}
                          alt={affiliate.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      {/* Affiliate info */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2">
                          {affiliate.name}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3">
                          {affiliate.description}
                        </p>

                        {/* Commission */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">Commission:</span>
                          <span className="text-sm font-bold text-red-400">{affiliate.commission}</span>
                        </div>
                      </div>

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12 bg-black/80 border-red-400/30 text-red-400" />
              <CarouselNext className="right-0 md:-right-12 bg-black/80 border-red-400/30 text-red-400" />
            </Carousel>
          </motion.div>
        </div>
      </main>

      {/* Footer with copyright and policy links */}
      <Footer />

      {/* Zone Detail Modal */}
      <AnimatePresence>
        {selectedZone && (
          <ZoneDetailPanel
            zone={selectedZone}
            onClose={() => setSelectedZone(null)}
            onAction={handleZoneAction}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
