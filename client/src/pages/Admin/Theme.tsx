import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Palette,
  Sun,
  Moon,
  Paintbrush,
  Type,
  Layout,
  Sparkles,
  RotateCcw,
  Save,
  Eye,
  Monitor
} from 'lucide-react';

interface ThemeConfig {
  colors: {
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    accent: string;
    accentForeground: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    destructive: string;
    border: string;
  };
  effects: {
    neonGlowIntensity: number;
    neonGlowSpread: number;
    enableFlicker: boolean;
    flickerSpeed: number;
    enablePulse: boolean;
    pulseSpeed: number;
    glowBlur: number;
    glowOpacity: number;
  };
  typography: {
    fontSizeBase: number;
    lineHeightBase: number;
    headingWeight: number;
  };
  layout: {
    borderRadius: number;
    containerMaxWidth: string;
  };
  mode: 'light' | 'dark';
}

const defaultDarkTheme: ThemeConfig = {
  colors: {
    primary: '0 84% 60%',
    primaryForeground: '0 0% 100%',
    secondary: '43 74% 49%',
    secondaryForeground: '0 0% 100%',
    accent: '43 74% 49%',
    accentForeground: '0 0% 100%',
    background: '0 0% 2%',
    foreground: '0 0% 98%',
    card: '0 0% 4%',
    cardForeground: '0 0% 98%',
    muted: '0 0% 15%',
    mutedForeground: '0 0% 64%',
    destructive: '0 84% 60%',
    border: '0 0% 15%',
  },
  effects: {
    neonGlowIntensity: 60,
    neonGlowSpread: 20,
    enableFlicker: true,
    flickerSpeed: 3,
    enablePulse: true,
    pulseSpeed: 2,
    glowBlur: 24,
    glowOpacity: 40,
  },
  typography: {
    fontSizeBase: 16,
    lineHeightBase: 1.5,
    headingWeight: 700,
  },
  layout: {
    borderRadius: 0.5,
    containerMaxWidth: '1280px',
  },
  mode: 'dark',
};

const defaultLightTheme: ThemeConfig = {
  ...defaultDarkTheme,
  colors: {
    primary: '0 84% 50%',
    primaryForeground: '0 0% 100%',
    secondary: '43 74% 40%',
    secondaryForeground: '0 0% 100%',
    accent: '43 74% 40%',
    accentForeground: '0 0% 100%',
    background: '0 0% 100%',
    foreground: '0 0% 10%',
    card: '0 0% 98%',
    cardForeground: '0 0% 10%',
    muted: '0 0% 96%',
    mutedForeground: '0 0% 45%',
    destructive: '0 84% 60%',
    border: '0 0% 90%',
  },
  mode: 'light',
};

export default function ThemePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.role === 'admin';

  const [theme, setTheme] = useState<ThemeConfig>(defaultDarkTheme);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Apply theme preview in real-time
  useEffect(() => {
    if (previewMode) {
      applyThemeToDOM(theme);
    }
  }, [theme, previewMode]);

  const loadSavedTheme = async () => {
    try {
      const response = await fetch('/api/admin/theme');
      if (response.ok) {
        const savedTheme = await response.json();
        if (savedTheme && Object.keys(savedTheme).length > 0) {
          setTheme({ ...defaultDarkTheme, ...savedTheme });
        }
      }
    } catch (error) {
      // Use default theme if loading fails
      console.log('Using default theme');
    }
  };

  const applyThemeToDOM = (themeConfig: ThemeConfig) => {
    const root = document.documentElement;

    // Apply colors
    Object.entries(themeConfig.colors).forEach(([key, value]) => {
      const cssVar = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // Apply layout
    root.style.setProperty('--radius', `${themeConfig.layout.borderRadius}rem`);

    // Apply mode class
    if (themeConfig.mode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  };

  const updateColor = (colorKey: keyof ThemeConfig['colors'], value: string) => {
    setTheme(prev => ({
      ...prev,
      colors: { ...prev.colors, [colorKey]: value }
    }));
    setHasChanges(true);
  };

  const updateEffect = (effectKey: keyof ThemeConfig['effects'], value: number | boolean) => {
    setTheme(prev => ({
      ...prev,
      effects: { ...prev.effects, [effectKey]: value }
    }));
    setHasChanges(true);
  };

  const updateTypography = (key: keyof ThemeConfig['typography'], value: number) => {
    setTheme(prev => ({
      ...prev,
      typography: { ...prev.typography, [key]: value }
    }));
    setHasChanges(true);
  };

  const updateLayout = (key: keyof ThemeConfig['layout'], value: number | string) => {
    setTheme(prev => ({
      ...prev,
      layout: { ...prev.layout, [key]: value }
    }));
    setHasChanges(true);
  };

  const toggleMode = () => {
    const newMode = theme.mode === 'dark' ? 'light' : 'dark';
    const baseTheme = newMode === 'dark' ? defaultDarkTheme : defaultLightTheme;
    setTheme(prev => ({
      ...prev,
      colors: baseTheme.colors,
      mode: newMode,
    }));
    setHasChanges(true);
  };

  const resetToDefaults = () => {
    setTheme(theme.mode === 'dark' ? defaultDarkTheme : defaultLightTheme);
    setHasChanges(true);
    toast({
      title: "Theme Reset",
      description: "Theme has been reset to defaults. Save to apply.",
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(theme),
      });

      if (!response.ok) {
        throw new Error('Failed to save theme');
      }

      // Apply theme permanently
      applyThemeToDOM(theme);
      setHasChanges(false);

      toast({
        title: "Theme Saved",
        description: "Your theme settings have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save theme settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Convert HSL string to hex for color picker
  const hslToHex = (hsl: string): string => {
    const parts = hsl.split(' ').map(p => parseFloat(p));
    if (parts.length < 3) return '#ff0000';

    const h = parts[0] / 360;
    const s = parts[1] / 100;
    const l = parts[2] / 100;

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // Convert hex to HSL string for storage
  const hexToHsl = (hex: string): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return '0 0% 0%';

    let r = parseInt(result[1], 16) / 255;
    let g = parseInt(result[2], 16) / 255;
    let b = parseInt(result[3], 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  if (!user || !isAdmin) {
    return <Redirect to="/" />;
  }

  const ColorPicker = ({
    label,
    colorKey,
    description
  }: {
    label: string;
    colorKey: keyof ThemeConfig['colors'];
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Input
          type="color"
          value={hslToHex(theme.colors[colorKey])}
          onChange={(e) => updateColor(colorKey, hexToHsl(e.target.value))}
          className="w-12 h-10 p-1 cursor-pointer rounded border-2"
        />
        <div
          className="w-10 h-10 rounded-lg border-2 border-border shadow-inner"
          style={{ backgroundColor: `hsl(${theme.colors[colorKey]})` }}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-display">Theme Settings</h1>
          <p className="text-muted-foreground">
            Customize the look and feel of your platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={previewMode}
              onCheckedChange={setPreviewMode}
              id="preview-mode"
            />
            <Label htmlFor="preview-mode" className="text-sm flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Live Preview
            </Label>
          </div>
          <Button variant="outline" size="sm" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="glow-effect"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Display Mode
          </CardTitle>
          <CardDescription>
            Choose between light and dark mode for your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              variant={theme.mode === 'light' ? 'default' : 'outline'}
              size="lg"
              onClick={() => theme.mode !== 'light' && toggleMode()}
              className="flex-1 h-16"
            >
              <Sun className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Light Mode</div>
                <div className="text-xs opacity-70">Bright, clean interface</div>
              </div>
            </Button>
            <Button
              variant={theme.mode === 'dark' ? 'default' : 'outline'}
              size="lg"
              onClick={() => theme.mode !== 'dark' && toggleMode()}
              className="flex-1 h-16"
            >
              <Moon className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div className="font-semibold">Dark Mode</div>
                <div className="text-xs opacity-70">Easy on the eyes</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different settings */}
      <Tabs defaultValue="colors" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="colors" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Colors</span>
          </TabsTrigger>
          <TabsTrigger value="effects" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Effects</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">Typography</span>
          </TabsTrigger>
          <TabsTrigger value="layout" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            <span className="hidden sm:inline">Layout</span>
          </TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
                <CardDescription>Primary colors that define your brand identity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ColorPicker label="Primary" colorKey="primary" description="Main brand color" />
                <ColorPicker label="Primary Foreground" colorKey="primaryForeground" description="Text on primary" />
                <ColorPicker label="Secondary" colorKey="secondary" description="Secondary brand color" />
                <ColorPicker label="Secondary Foreground" colorKey="secondaryForeground" description="Text on secondary" />
                <ColorPicker label="Accent" colorKey="accent" description="Highlight color" />
                <ColorPicker label="Accent Foreground" colorKey="accentForeground" description="Text on accent" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Surface Colors</CardTitle>
                <CardDescription>Background and surface colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <ColorPicker label="Background" colorKey="background" description="Page background" />
                <ColorPicker label="Foreground" colorKey="foreground" description="Main text color" />
                <ColorPicker label="Card" colorKey="card" description="Card backgrounds" />
                <ColorPicker label="Card Foreground" colorKey="cardForeground" description="Card text" />
                <ColorPicker label="Muted" colorKey="muted" description="Muted backgrounds" />
                <ColorPicker label="Muted Foreground" colorKey="mutedForeground" description="Muted text" />
                <ColorPicker label="Border" colorKey="border" description="Border color" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paintbrush className="h-5 w-5" />
                  Neon Glow Effects
                </CardTitle>
                <CardDescription>Configure the signature neon glow effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Glow Intensity</Label>
                    <span className="text-sm text-muted-foreground">{theme.effects.neonGlowIntensity}%</span>
                  </div>
                  <Slider
                    value={[theme.effects.neonGlowIntensity]}
                    onValueChange={([v]) => updateEffect('neonGlowIntensity', v)}
                    max={100}
                    step={5}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Glow Spread</Label>
                    <span className="text-sm text-muted-foreground">{theme.effects.neonGlowSpread}px</span>
                  </div>
                  <Slider
                    value={[theme.effects.neonGlowSpread]}
                    onValueChange={([v]) => updateEffect('neonGlowSpread', v)}
                    max={50}
                    step={2}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Glow Blur</Label>
                    <span className="text-sm text-muted-foreground">{theme.effects.glowBlur}px</span>
                  </div>
                  <Slider
                    value={[theme.effects.glowBlur]}
                    onValueChange={([v]) => updateEffect('glowBlur', v)}
                    max={50}
                    step={2}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Glow Opacity</Label>
                    <span className="text-sm text-muted-foreground">{theme.effects.glowOpacity}%</span>
                  </div>
                  <Slider
                    value={[theme.effects.glowOpacity]}
                    onValueChange={([v]) => updateEffect('glowOpacity', v)}
                    max={100}
                    step={5}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Animation Effects
                </CardTitle>
                <CardDescription>Enable or disable animation effects</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Flicker Effect</Label>
                    <p className="text-xs text-muted-foreground">Subtle neon flicker animation</p>
                  </div>
                  <Switch
                    checked={theme.effects.enableFlicker}
                    onCheckedChange={(v) => updateEffect('enableFlicker', v)}
                  />
                </div>

                {theme.effects.enableFlicker && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <Label>Flicker Speed</Label>
                      <span className="text-sm text-muted-foreground">{theme.effects.flickerSpeed}s</span>
                    </div>
                    <Slider
                      value={[theme.effects.flickerSpeed]}
                      onValueChange={([v]) => updateEffect('flickerSpeed', v)}
                      min={1}
                      max={10}
                      step={0.5}
                    />
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Pulse Effect</Label>
                    <p className="text-xs text-muted-foreground">Gentle pulsing glow animation</p>
                  </div>
                  <Switch
                    checked={theme.effects.enablePulse}
                    onCheckedChange={(v) => updateEffect('enablePulse', v)}
                  />
                </div>

                {theme.effects.enablePulse && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/20">
                    <div className="flex items-center justify-between">
                      <Label>Pulse Speed</Label>
                      <span className="text-sm text-muted-foreground">{theme.effects.pulseSpeed}s</span>
                    </div>
                    <Slider
                      value={[theme.effects.pulseSpeed]}
                      onValueChange={([v]) => updateEffect('pulseSpeed', v)}
                      min={1}
                      max={10}
                      step={0.5}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Box */}
          <Card>
            <CardHeader>
              <CardTitle>Effect Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="p-8 rounded-xl text-center"
                style={{
                  background: `hsl(${theme.colors.card})`,
                  boxShadow: `0 0 ${theme.effects.glowBlur}px ${theme.effects.neonGlowSpread}px hsla(${theme.colors.primary}, ${theme.effects.glowOpacity / 100})`,
                }}
              >
                <h3
                  className="text-2xl font-bold mb-2"
                  style={{
                    color: `hsl(${theme.colors.primary})`,
                    textShadow: `0 0 ${theme.effects.glowBlur / 2}px hsl(${theme.colors.primary})`,
                  }}
                >
                  BoyFanz
                </h3>
                <p style={{ color: `hsl(${theme.colors.mutedForeground})` }}>
                  Preview of your glow effects
                </p>
                <Button
                  className="mt-4"
                  style={{
                    backgroundColor: `hsl(${theme.colors.primary})`,
                    color: `hsl(${theme.colors.primaryForeground})`,
                    boxShadow: `0 0 ${theme.effects.glowBlur / 2}px hsl(${theme.colors.primary})`,
                  }}
                >
                  Sample Button
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Typography Settings
              </CardTitle>
              <CardDescription>Configure font sizes and text styling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Base Font Size</Label>
                  <span className="text-sm text-muted-foreground">{theme.typography.fontSizeBase}px</span>
                </div>
                <Slider
                  value={[theme.typography.fontSizeBase]}
                  onValueChange={([v]) => updateTypography('fontSizeBase', v)}
                  min={12}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Line Height</Label>
                  <span className="text-sm text-muted-foreground">{theme.typography.lineHeightBase}</span>
                </div>
                <Slider
                  value={[theme.typography.lineHeightBase * 10]}
                  onValueChange={([v]) => updateTypography('lineHeightBase', v / 10)}
                  min={10}
                  max={25}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Heading Weight</Label>
                  <span className="text-sm text-muted-foreground">{theme.typography.headingWeight}</span>
                </div>
                <Slider
                  value={[theme.typography.headingWeight]}
                  onValueChange={([v]) => updateTypography('headingWeight', v)}
                  min={400}
                  max={900}
                  step={100}
                />
              </div>

              {/* Typography Preview */}
              <div className="mt-6 p-6 rounded-lg border border-border">
                <h2
                  className="mb-2"
                  style={{
                    fontSize: `${theme.typography.fontSizeBase * 1.5}px`,
                    fontWeight: theme.typography.headingWeight,
                    lineHeight: theme.typography.lineHeightBase,
                  }}
                >
                  Heading Preview
                </h2>
                <p
                  style={{
                    fontSize: `${theme.typography.fontSizeBase}px`,
                    lineHeight: theme.typography.lineHeightBase,
                  }}
                >
                  This is a preview of your typography settings. The quick brown fox jumps over the lazy dog.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Layout Settings
              </CardTitle>
              <CardDescription>Configure spacing and layout options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Border Radius</Label>
                  <span className="text-sm text-muted-foreground">{theme.layout.borderRadius}rem</span>
                </div>
                <Slider
                  value={[theme.layout.borderRadius * 10]}
                  onValueChange={([v]) => updateLayout('borderRadius', v / 10)}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-3">
                <Label>Container Max Width</Label>
                <div className="flex gap-2">
                  {['1024px', '1280px', '1536px', '100%'].map((width) => (
                    <Button
                      key={width}
                      variant={theme.layout.containerMaxWidth === width ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateLayout('containerMaxWidth', width)}
                    >
                      {width}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Layout Preview */}
              <div className="mt-6 space-y-4">
                <Label>Border Radius Preview</Label>
                <div className="flex gap-4 flex-wrap">
                  <div
                    className="w-20 h-20 bg-primary"
                    style={{ borderRadius: `${theme.layout.borderRadius}rem` }}
                  />
                  <div
                    className="w-32 h-12 bg-secondary flex items-center justify-center text-secondary-foreground text-sm"
                    style={{ borderRadius: `${theme.layout.borderRadius}rem` }}
                  >
                    Button
                  </div>
                  <div
                    className="w-48 h-24 bg-card border border-border p-4"
                    style={{ borderRadius: `${theme.layout.borderRadius}rem` }}
                  >
                    <div className="text-sm font-medium">Card</div>
                    <div className="text-xs text-muted-foreground">Preview</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
