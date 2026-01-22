import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDarkMode } from '@/hooks/useDarkMode';
import { cn } from '@/lib/utils';

interface DarkModeToggleProps {
  variant?: 'icon' | 'dropdown';
  className?: string;
}

export function DarkModeToggle({ variant = 'icon', className }: DarkModeToggleProps) {
  const { theme, isDark, setTheme, toggleTheme } = useDarkMode();

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          'relative h-9 w-9 rounded-lg transition-all duration-300',
          'hover:bg-primary/10 hover:text-primary',
          className
        )}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        data-testid="dark-mode-toggle"
      >
        <Sun
          className={cn(
            'h-5 w-5 rotate-0 scale-100 transition-all duration-300',
            isDark && 'rotate-90 scale-0'
          )}
        />
        <Moon
          className={cn(
            'absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300',
            isDark && 'rotate-0 scale-100'
          )}
        />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'relative h-9 w-9 rounded-lg transition-all duration-300',
            'hover:bg-primary/10 hover:text-primary',
            className
          )}
          data-testid="dark-mode-dropdown"
        >
          <Sun
            className={cn(
              'h-5 w-5 rotate-0 scale-100 transition-all duration-300',
              isDark && 'rotate-90 scale-0'
            )}
          />
          <Moon
            className={cn(
              'absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300',
              isDark && 'rotate-0 scale-100'
            )}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className={cn(
            'cursor-pointer',
            theme === 'dark' && 'bg-primary/10 text-primary'
          )}
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className={cn(
            'cursor-pointer',
            theme === 'light' && 'bg-primary/10 text-primary'
          )}
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className={cn(
            'cursor-pointer',
            theme === 'system' && 'bg-primary/10 text-primary'
          )}
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DarkModeToggle;
