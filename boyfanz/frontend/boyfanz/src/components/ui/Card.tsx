import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'neon' | 'surface' | 'glass' | 'glass-red' | 'glass-gold' | 'fight' | 'steel';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  glow = false,
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles = 'rounded-sm transition-all duration-300 overflow-hidden';

  const variants = {
    default: 'bg-gradient-to-br from-[#0a0a0a] to-[#050505] border-2 border-border shadow-steel hover:shadow-glow hover:border-primary/50 hover:-translate-y-1',
    neon: 'glass-neon-red hover:shadow-glow-xl hover:-translate-y-2 hover:scale-[1.02]',
    surface: 'bg-surface/80 border-2 border-border/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-glow',
    glass: 'glass-card hover:-translate-y-2 hover:scale-[1.02]',
    'glass-red': 'glass-neon-red hover:-translate-y-2 hover:scale-[1.02]',
    'glass-gold': 'glass-neon-gold hover:-translate-y-2 hover:scale-[1.02]',
    fight: 'card hover:-translate-y-2 hover:scale-[1.02]',
    steel: 'bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-2 border-steel-gray shadow-steel hover:border-white/50 hover:shadow-glow'
  };

  const glowClass = glow ? 'shadow-glow-xl animate-glow' : '';
  const pulseClass = pulse ? 'animate-fight-pulse' : '';

  return (
    <div
      className={cn(
        baseStyles,
        variants[variant],
        glowClass,
        pulseClass,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-6 pb-0', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn('p-6 pt-0 flex items-center justify-between', className)}
      {...props}
    >
      {children}
    </div>
  );
};