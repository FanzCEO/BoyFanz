import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'neon' | 'gold' | 'fight' | 'steel';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  glow?: boolean;
  pulse?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  className,
  variant = 'primary',
  size = 'md',
  glow = false,
  pulse = false,
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-display font-bold uppercase tracking-wider transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black';

  const variants = {
    primary: 'bg-gradient-fight border-2 border-primary text-primary shadow-glow hover:shadow-glow-xl hover:border-[#ff3333] hover:scale-105 hover:-translate-y-1 text-shadow-neon',
    secondary: 'bg-gradient-fight border-2 border-secondary text-secondary shadow-golden-glow hover:shadow-golden-glow hover:border-[hsl(45,100%,70%)] hover:scale-105 hover:-translate-y-1 text-shadow-golden',
    ghost: 'bg-transparent text-foreground hover:bg-surface/50 hover:text-primary hover:shadow-glow',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-gradient-fight hover:shadow-glow-lg hover:scale-105 hover:-translate-y-1 text-shadow-neon',
    neon: 'neon-button hover:scale-105 hover:-translate-y-2',
    gold: 'gold-button hover:scale-105 hover:-translate-y-2',
    fight: 'glass-button font-industrial hover:scale-110 hover:-translate-y-2',
    steel: 'bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] border-2 border-steel-gray text-foreground hover:border-white hover:shadow-steel hover:scale-105'
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded',
    md: 'px-6 py-3 text-sm rounded-sm',
    lg: 'px-8 py-4 text-base rounded-sm',
    xl: 'px-10 py-5 text-lg rounded-sm'
  };

  const glowClass = glow ? 'shadow-glow-xl animate-glow' : '';
  const pulseClass = pulse ? 'animate-fight-pulse' : '';

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        glowClass,
        pulseClass,
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};