import { Flame, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDarkMode, ThemeMode } from "@/hooks/useDarkMode";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  variant?: "icon" | "dropdown";
  className?: string;
}

const THEME_CONFIG: Record<ThemeMode, { icon: typeof Flame; label: string; color: string }> = {
  dungeon: { 
    icon: Flame, 
    label: "Dungeon", 
    color: "text-cyan-400 hover:text-cyan-300" 
  },
  night: { 
    icon: Moon, 
    label: "Night", 
    color: "text-blue-400 hover:text-blue-300" 
  },
  clean: { 
    icon: Sun, 
    label: "Clean", 
    color: "text-amber-400 hover:text-amber-300" 
  },
};

export function DarkModeToggle({ variant = "dropdown", className }: ThemeSelectorProps) {
  const { theme, setTheme, toggleTheme } = useDarkMode();
  const config = THEME_CONFIG[theme];
  const Icon = config.icon;

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn(
          "relative h-9 w-9 rounded-lg transition-all duration-300",
          config.color,
          className
        )}
        aria-label={`Current theme: ${config.label}. Click to cycle.`}
        data-testid="theme-toggle"
      >
        <Icon className="h-5 w-5" />
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
            "relative h-9 w-9 rounded-lg transition-all duration-300",
            config.color,
            className
          )}
          data-testid="theme-dropdown"
        >
          <Icon className="h-5 w-5" />
          <span className="sr-only">Select theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-44 bg-zinc-900/95 border-zinc-700 backdrop-blur-sm"
      >
        {(Object.entries(THEME_CONFIG) as [ThemeMode, typeof config][]).map(([mode, cfg]) => {
          const ItemIcon = cfg.icon;
          return (
            <DropdownMenuItem
              key={mode}
              onClick={() => setTheme(mode)}
              className={cn(
                "cursor-pointer flex items-center gap-2",
                theme === mode && "bg-cyan-500/20 text-cyan-400"
              )}
            >
              <ItemIcon className={cn("h-4 w-4", cfg.color)} />
              <span>{cfg.label}</span>
              {mode === "dungeon" && (
                <span className="ml-auto text-xs text-cyan-500 uppercase tracking-wider">
                  Default
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default DarkModeToggle;
