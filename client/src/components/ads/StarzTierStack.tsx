import { Star, Crown, Award, Diamond, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const TIERS = [
  { 
    id: 'diamond_star', 
    name: 'Diamond Starz', 
    icon: Diamond, 
    color: 'from-slate-400 to-blue-500',
    bgColor: 'bg-gradient-to-r from-slate-400/20 to-blue-500/20',
    borderColor: 'border-slate-400/50',
    perks: ['All platform access', 'Priority AI tools', 'Custom analytics']
  },
  { 
    id: 'platinum_star', 
    name: 'Platinum Starz', 
    icon: Award, 
    color: 'from-gray-300 to-gray-400',
    bgColor: 'bg-gradient-to-r from-gray-300/20 to-gray-400/20',
    borderColor: 'border-gray-300/50',
    perks: ['Advanced AI features', 'Priority support']
  },
  { 
    id: 'gold_star', 
    name: 'Gold Starz', 
    icon: Crown, 
    color: 'from-yellow-400 to-amber-500',
    bgColor: 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20',
    borderColor: 'border-yellow-400/50',
    perks: ['AI content tools', 'Analytics dashboard']
  },
  { 
    id: 'silver_star', 
    name: 'Silver Starz', 
    icon: Star, 
    color: 'from-gray-400 to-gray-500',
    bgColor: 'bg-gradient-to-r from-gray-400/20 to-gray-500/20',
    borderColor: 'border-gray-400/50',
    perks: ['Basic AI tools', 'Performance insights']
  },
  { 
    id: 'bronze_star', 
    name: 'Bronze Starz', 
    icon: Star, 
    color: 'from-amber-600 to-orange-600',
    bgColor: 'bg-gradient-to-r from-amber-600/20 to-orange-600/20',
    borderColor: 'border-amber-600/50',
    perks: ['Starz Studio access', 'Basic features']
  },
];

export function StarzTierStack({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden', className)}>
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="font-bebas text-lg text-white">Starz Creator Program</span>
        </div>
        <p className="text-xs text-white/60 mt-1">Earn tiers through performance • Unlock AI tools & perks</p>
      </div>
      
      {/* Tier Stack */}
      <div className="p-3 space-y-2">
        {TIERS.map((tier, index) => {
          const Icon = tier.icon;
          return (
            <a 
              key={tier.id}
              href="/starz-studio"
              className={cn(
                'flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200',
                'hover:scale-[1.02] hover:shadow-lg cursor-pointer',
                tier.bgColor,
                tier.borderColor
              )}
            >
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br',
                tier.color
              )}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm text-white">{tier.name}</div>
                <div className="text-[10px] text-white/50 truncate">{tier.perks[0]}</div>
              </div>
              <div className="text-[10px] text-white/30 font-medium">
                #{TIERS.length - index}
              </div>
            </a>
          );
        })}
      </div>
      
      {/* CTA */}
      <div className="px-4 py-3 bg-white/5 border-t border-white/10">
        <a 
          href="/starz-studio" 
          className="block w-full py-2 text-center text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          View Your Tier Progress
        </a>
      </div>
    </div>
  );
}

export default StarzTierStack;
