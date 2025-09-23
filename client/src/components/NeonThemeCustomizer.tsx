import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Palette, Download, Upload, Eye, RotateCcw, Zap } from "lucide-react";

interface NeonThemeConfig {
  neonColors: {
    red: string;
    gold: string;
    cyan: string;
    purple: string;
    blue: string;
    green: string;
    pink: string;
    orange: string;
  };
  glowIntensity: {
    textShadow: number;
    boxShadow: number;
    borderGlow: number;
  };
  animations: {
    flickerEnabled: boolean;
    flickerSpeed: number;
    subtleFlicker: boolean;
  };
  effects: {
    neonSigns: boolean;
    glowButtons: boolean;
    neonBorders: boolean;
    ambientGlow: boolean;
  };
}

export default function NeonThemeCustomizer() {
  const [config, setConfig] = useState<NeonThemeConfig>({
    neonColors: {
      red: "hsl(352, 90%, 58%)",
      gold: "hsl(45, 100%, 55%)", 
      cyan: "hsl(188, 100%, 54%)",
      purple: "hsl(300, 100%, 66%)",
      blue: "hsl(200, 100%, 55%)",
      green: "hsl(120, 100%, 50%)",
      pink: "hsl(330, 100%, 60%)",
      orange: "hsl(30, 100%, 55%)"
    },
    glowIntensity: {
      textShadow: 28,
      boxShadow: 42,
      borderGlow: 12
    },
    animations: {
      flickerEnabled: true,
      flickerSpeed: 6,
      subtleFlicker: true
    },
    effects: {
      neonSigns: true,
      glowButtons: true,
      neonBorders: true,
      ambientGlow: true
    }
  });

  // Apply changes to CSS variables in real-time
  useEffect(() => {
    const root = document.documentElement;
    
    // Update neon color variables
    Object.entries(config.neonColors).forEach(([color, value]) => {
      root.style.setProperty(`--neon-${color}`, value);
    });

    // Update glow intensities
    root.style.setProperty('--glow-text-shadow', `${config.glowIntensity.textShadow}px`);
    root.style.setProperty('--glow-box-shadow', `${config.glowIntensity.boxShadow}px`);
    root.style.setProperty('--glow-border', `${config.glowIntensity.borderGlow}px`);

    // Update animation speeds
    root.style.setProperty('--flicker-speed', `${config.animations.flickerSpeed}s`);

    // Toggle effect classes
    root.classList.toggle('neon-signs-disabled', !config.effects.neonSigns);
    root.classList.toggle('glow-buttons-disabled', !config.effects.glowButtons);
    root.classList.toggle('neon-borders-disabled', !config.effects.neonBorders);
    root.classList.toggle('ambient-glow-disabled', !config.effects.ambientGlow);
    root.classList.toggle('flicker-disabled', !config.animations.flickerEnabled);
  }, [config]);

  const updateNeonColor = (color: keyof typeof config.neonColors, value: string) => {
    setConfig(prev => ({
      ...prev,
      neonColors: {
        ...prev.neonColors,
        [color]: value
      }
    }));
  };

  const updateGlowIntensity = (type: keyof typeof config.glowIntensity, value: number[]) => {
    setConfig(prev => ({
      ...prev,
      glowIntensity: {
        ...prev.glowIntensity,
        [type]: value[0]
      }
    }));
  };

  const resetToDefaults = () => {
    setConfig({
      neonColors: {
        red: "hsl(352, 90%, 58%)",
        gold: "hsl(45, 100%, 55%)", 
        cyan: "hsl(188, 100%, 54%)",
        purple: "hsl(300, 100%, 66%)",
        blue: "hsl(200, 100%, 55%)",
        green: "hsl(120, 100%, 50%)",
        pink: "hsl(330, 100%, 60%)",
        orange: "hsl(30, 100%, 55%)"
      },
      glowIntensity: {
        textShadow: 28,
        boxShadow: 42,
        borderGlow: 12
      },
      animations: {
        flickerEnabled: true,
        flickerSpeed: 6,
        subtleFlicker: true
      },
      effects: {
        neonSigns: true,
        glowButtons: true,
        neonBorders: true,
        ambientGlow: true
      }
    });
  };

  const ColorPicker = ({ 
    label, 
    color, 
    value, 
    onChange 
  }: { 
    label: string; 
    color: keyof typeof config.neonColors;
    value: string; 
    onChange: (value: string) => void;
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded border-2 border-border shadow-sm"
          style={{ 
            backgroundColor: value,
            boxShadow: `0 0 8px ${value}` 
          }}
        />
        {label}
      </Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="hsl(352, 90%, 58%)"
        className="font-mono text-sm"
        data-testid={`color-input-${color}`}
      />
    </div>
  );

  return (
    <div className="space-y-6" data-testid="neon-theme-customizer">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold neon-sign-golden flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Live Neon Customizer
          </h2>
          <p className="text-muted-foreground">
            Adjust neon colors, glow intensity, and effects in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults} data-testid="reset-button">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button className="neon-glow" data-testid="save-theme-button">
            <Download className="h-4 w-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Neon Colors Section */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 neon-red">
              <Palette className="h-5 w-5" />
              Neon Colors
            </CardTitle>
            <CardDescription>
              Customize individual neon colors for different elements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorPicker
                label="Neon Red"
                color="red"
                value={config.neonColors.red}
                onChange={(value) => updateNeonColor('red', value)}
              />
              <ColorPicker
                label="Neon Gold"
                color="gold"
                value={config.neonColors.gold}
                onChange={(value) => updateNeonColor('gold', value)}
              />
              <ColorPicker
                label="Neon Cyan"
                color="cyan"
                value={config.neonColors.cyan}
                onChange={(value) => updateNeonColor('cyan', value)}
              />
              <ColorPicker
                label="Neon Purple"
                color="purple"
                value={config.neonColors.purple}
                onChange={(value) => updateNeonColor('purple', value)}
              />
              <ColorPicker
                label="Neon Blue"
                color="blue"
                value={config.neonColors.blue}
                onChange={(value) => updateNeonColor('blue', value)}
              />
              <ColorPicker
                label="Neon Green"
                color="green"
                value={config.neonColors.green}
                onChange={(value) => updateNeonColor('green', value)}
              />
              <ColorPicker
                label="Neon Pink"
                color="pink"
                value={config.neonColors.pink}
                onChange={(value) => updateNeonColor('pink', value)}
              />
              <ColorPicker
                label="Neon Orange"
                color="orange"
                value={config.neonColors.orange}
                onChange={(value) => updateNeonColor('orange', value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Glow Intensity Section */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 neon-cyan">
              <Eye className="h-5 w-5" />
              Glow Intensity
            </CardTitle>
            <CardDescription>
              Control the intensity of different glow effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Text Shadow Glow
                <Badge variant="outline" className="font-mono">
                  {config.glowIntensity.textShadow}px
                </Badge>
              </Label>
              <Slider
                value={[config.glowIntensity.textShadow]}
                onValueChange={(value) => updateGlowIntensity('textShadow', value)}
                max={60}
                min={0}
                step={2}
                className="w-full"
                data-testid="text-shadow-slider"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Box Shadow Glow
                <Badge variant="outline" className="font-mono">
                  {config.glowIntensity.boxShadow}px
                </Badge>
              </Label>
              <Slider
                value={[config.glowIntensity.boxShadow]}
                onValueChange={(value) => updateGlowIntensity('boxShadow', value)}
                max={80}
                min={0}
                step={2}
                className="w-full"
                data-testid="box-shadow-slider"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Border Glow
                <Badge variant="outline" className="font-mono">
                  {config.glowIntensity.borderGlow}px
                </Badge>
              </Label>
              <Slider
                value={[config.glowIntensity.borderGlow]}
                onValueChange={(value) => updateGlowIntensity('borderGlow', value)}
                max={40}
                min={0}
                step={1}
                className="w-full"
                data-testid="border-glow-slider"
              />
            </div>
          </CardContent>
        </Card>

        {/* Animation Controls */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="neon-purple">Animation Controls</CardTitle>
            <CardDescription>
              Control flicker and animation effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Enable Flickering</Label>
              <Switch
                checked={config.animations.flickerEnabled}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    animations: { ...prev.animations, flickerEnabled: checked }
                  }))
                }
                data-testid="flicker-toggle"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Flicker Speed
                <Badge variant="outline" className="font-mono">
                  {config.animations.flickerSpeed}s
                </Badge>
              </Label>
              <Slider
                value={[config.animations.flickerSpeed]}
                onValueChange={(value) => 
                  setConfig(prev => ({
                    ...prev,
                    animations: { ...prev.animations, flickerSpeed: value[0] }
                  }))
                }
                max={12}
                min={2}
                step={0.5}
                className="w-full"
                data-testid="flicker-speed-slider"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Subtle Flicker Mode</Label>
              <Switch
                checked={config.animations.subtleFlicker}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    animations: { ...prev.animations, subtleFlicker: checked }
                  }))
                }
                data-testid="subtle-flicker-toggle"
              />
            </div>
          </CardContent>
        </Card>

        {/* Effect Toggles */}
        <Card className="neon-border">
          <CardHeader>
            <CardTitle className="neon-pink">Effect Toggles</CardTitle>
            <CardDescription>
              Enable or disable specific neon effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Neon Signs</Label>
              <Switch
                checked={config.effects.neonSigns}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    effects: { ...prev.effects, neonSigns: checked }
                  }))
                }
                data-testid="neon-signs-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Glow Buttons</Label>
              <Switch
                checked={config.effects.glowButtons}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    effects: { ...prev.effects, glowButtons: checked }
                  }))
                }
                data-testid="glow-buttons-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Neon Borders</Label>
              <Switch
                checked={config.effects.neonBorders}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    effects: { ...prev.effects, neonBorders: checked }
                  }))
                }
                data-testid="neon-borders-toggle"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Ambient Glow</Label>
              <Switch
                checked={config.effects.ambientGlow}
                onCheckedChange={(checked) => 
                  setConfig(prev => ({
                    ...prev,
                    effects: { ...prev.effects, ambientGlow: checked }
                  }))
                }
                data-testid="ambient-glow-toggle"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Preview Section */}
      <Card className="neon-glow">
        <CardHeader>
          <CardTitle className="neon-sign-golden">Live Preview</CardTitle>
          <CardDescription>
            See your changes applied to different elements in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-card rounded-lg border neon-border text-center">
              <h3 className="neon-sign-golden">Golden Sign</h3>
              <p className="text-sm text-muted-foreground mt-2">Every Man's Playground</p>
            </div>
            
            <div className="p-4 bg-card rounded-lg border neon-border text-center">
              <h3 className="neon-red">Red Neon</h3>
              <Button className="neon-button mt-2" size="sm">
                Glow Button
              </Button>
            </div>
            
            <div className="p-4 bg-card rounded-lg border neon-border text-center">
              <h3 className="neon-text" style={{ color: config.neonColors.cyan }}>
                Cyan Effect
              </h3>
              <div className="w-full h-2 bg-muted rounded mt-2" style={{
                boxShadow: `0 0 ${config.glowIntensity.borderGlow}px ${config.neonColors.cyan}`
              }} />
            </div>
            
            <div className="p-4 bg-card rounded-lg border neon-border text-center">
              <h3 className="seedy-neon-blue">Blue Seedy</h3>
              <p className="text-xs text-muted-foreground mt-2">Underground vibes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}