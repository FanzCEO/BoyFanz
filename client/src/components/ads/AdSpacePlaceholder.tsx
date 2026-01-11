import { cn } from '@/lib/utils';

interface AdSpacePlaceholderProps {
  size?: 'small' | 'medium' | 'large' | 'banner' | 'rectangle' | 'skyscraper';
  className?: string;
}

const sizeConfig = {
  small: { width: '100%', height: '90px' },
  medium: { width: '100%', height: '150px' },
  large: { width: '100%', height: '250px' },
  banner: { width: '728px', height: '90px' },
  rectangle: { width: '300px', height: '250px' },
  skyscraper: { width: '160px', height: '600px' },
};

export function AdSpacePlaceholder({ size = 'medium', className }: AdSpacePlaceholderProps) {
  const config = sizeConfig[size];
  
  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-600/50 bg-gray-900/30',
        className
      )}
      style={{ 
        width: config.width, 
        minHeight: config.height,
        maxWidth: '100%'
      }}
    >
      {/* Platform Logo */}
      <div className="w-12 h-12 mb-2 rounded-lg bg-gradient-to-br from-red-600/20 to-red-800/20 flex items-center justify-center border border-red-600/30">
        <span className="font-bebas text-red-500 text-lg">F</span>
      </div>
      
      {/* AD Space Text */}
      <span className="font-bebas text-gray-500 text-xl tracking-wider">AD SPACE</span>
      <span className="text-[10px] text-gray-600 mt-1">Available for advertisers</span>
    </div>
  );
}

export default AdSpacePlaceholder;
