import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ThemeSettings {
  // Fonts
  fontNeon: string;
  fontDisplay: string;
  fontBody: string;

  // Neon Red Settings
  neonRedColor: string;
  neonRedGlow1: number;
  neonRedGlow2: number;
  neonRedGlow3: number;
  neonRedOpacity1: number;
  neonRedOpacity2: number;
  neonRedOpacity3: number;

  // Neon Golden Settings
  neonGoldenColor: string;
  neonGoldenGlow1: number;
  neonGoldenGlow2: number;
  neonGoldenGlow3: number;
  neonGoldenOpacity1: number;
  neonGoldenOpacity2: number;
  neonGoldenOpacity3: number;

  // Neon White Settings
  neonWhiteColor: string;
  neonWhiteGlow1: number;
  neonWhiteGlow2: number;
  neonWhiteGlow3: number;
  neonWhiteOpacity1: number;
  neonWhiteOpacity2: number;
  neonWhiteOpacity3: number;

  // Typography Settings
  letterSpacingNeon: number;
  letterSpacingDisplay: number;
  letterSpacingBody: number;

  // Body Text
  bodyTextColor: string;
  bodyTextBrightness: number;
}

const defaultSettings: ThemeSettings = {
  fontNeon: 'Monoton',
  fontDisplay: 'Bebas Neue',
  fontBody: 'Inter',

  neonRedColor: '#ff0000',
  neonRedGlow1: 7,
  neonRedGlow2: 12,
  neonRedGlow3: 18,
  neonRedOpacity1: 0.9,
  neonRedOpacity2: 0.7,
  neonRedOpacity3: 0.5,

  neonGoldenColor: '#d4a959',
  neonGoldenGlow1: 7,
  neonGoldenGlow2: 12,
  neonGoldenGlow3: 18,
  neonGoldenOpacity1: 0.85,
  neonGoldenOpacity2: 0.6,
  neonGoldenOpacity3: 0.4,

  neonWhiteColor: 'hsl(0, 0%, 93%)',
  neonWhiteGlow1: 2,
  neonWhiteGlow2: 4,
  neonWhiteGlow3: 7,
  neonWhiteOpacity1: 0.8,
  neonWhiteOpacity2: 0.6,
  neonWhiteOpacity3: 0.4,

  letterSpacingNeon: 0.05,
  letterSpacingDisplay: 0.08,
  letterSpacingBody: 0,

  bodyTextColor: 'hsl(0, 0%, 85%)',
  bodyTextBrightness: 85,
};

const fontOptions = [
  { value: 'Monoton', label: 'Monoton (Neon Tube)' },
  { value: 'Bebas Neue', label: 'Bebas Neue (Display)' },
  { value: 'Inter', label: 'Inter (Clean Sans)' },
  { value: 'Orbitron', label: 'Orbitron (Futuristic)' },
  { value: 'Bungee', label: 'Bungee (Bold Display)' },
  { value: 'Audiowide', label: 'Audiowide (Tech)' },
  { value: 'Russo One', label: 'Russo One (Strong)' },
  { value: 'Righteous', label: 'Righteous (Retro)' },
];

export default function ThemeTypographyControl() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [previewText, setPreviewText] = useState("BOYFANZ");

  // Load saved settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('themeSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load theme settings:', e);
      }
    }
  }, []);

  // Apply settings to CSS
  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);

  const applyThemeSettings = (settings: ThemeSettings) => {
    const root = document.documentElement;

    // Create dynamic style element
    const styleId = 'dynamic-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Generate CSS
    const css = `
      .seedy-neon-red {
        font-family: '${settings.fontNeon}', cursive !important;
        color: ${settings.neonRedColor} !important;
        text-shadow:
          0 0 2px #fff,
          0 0 4px #fff,
          0 0 ${settings.neonRedGlow1}px rgba(255, 0, 0, ${settings.neonRedOpacity1}),
          0 0 ${settings.neonRedGlow2}px rgba(255, 0, 0, ${settings.neonRedOpacity2}),
          0 0 ${settings.neonRedGlow3}px rgba(255, 0, 0, ${settings.neonRedOpacity3}) !important;
        letter-spacing: ${settings.letterSpacingNeon}em !important;
      }

      .seedy-neon-golden {
        font-family: '${settings.fontNeon}', cursive !important;
        color: ${settings.neonGoldenColor} !important;
        text-shadow:
          0 0 2px #fff,
          0 0 4px #fff,
          0 0 ${settings.neonGoldenGlow1}px rgba(212, 169, 89, ${settings.neonGoldenOpacity1}),
          0 0 ${settings.neonGoldenGlow2}px rgba(212, 169, 89, ${settings.neonGoldenOpacity2}),
          0 0 ${settings.neonGoldenGlow3}px rgba(212, 169, 89, ${settings.neonGoldenOpacity3}) !important;
        letter-spacing: ${settings.letterSpacingNeon}em !important;
      }

      .seedy-neon-white, .seedy-neon-silver, .neon-white-body {
        font-family: '${settings.fontNeon}', cursive !important;
        color: ${settings.neonWhiteColor} !important;
        text-shadow:
          0 0 ${settings.neonWhiteGlow1}px rgba(255, 255, 255, ${settings.neonWhiteOpacity1}),
          0 0 ${settings.neonWhiteGlow2}px rgba(255, 255, 255, ${settings.neonWhiteOpacity2}),
          0 0 ${settings.neonWhiteGlow3}px rgba(255, 255, 255, ${settings.neonWhiteOpacity3}) !important;
        letter-spacing: ${settings.letterSpacingNeon}em !important;
      }

      .neon-heading-red, .neon-heading-golden {
        font-family: '${settings.fontDisplay}', sans-serif !important;
        letter-spacing: ${settings.letterSpacingDisplay}em !important;
      }

      .neon-body-text, body {
        font-family: '${settings.fontBody}', sans-serif !important;
        letter-spacing: ${settings.letterSpacingBody}em !important;
        color: hsl(0, 0%, ${settings.bodyTextBrightness}%) !important;
      }
    `;

    styleElement.textContent = css;
  };

  const handleSave = () => {
    localStorage.setItem('themeSettings', JSON.stringify(settings));
    applyThemeSettings(settings);
    toast({
      title: "Theme Saved",
      description: "Typography settings have been applied and saved.",
    });
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('themeSettings');
    toast({
      title: "Theme Reset",
      description: "Typography settings have been reset to defaults.",
    });
  };

  const updateSetting = <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold seedy-neon-red">Theme & Typography Control</h1>
          <p className="text-muted-foreground mt-2">
            Customize fonts, colors, and glow effects for the entire platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline">
            Reset to Default
          </Button>
          <Button onClick={handleSave} className="bg-red-600 hover:bg-red-700">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Live Preview */}
      <Card className="bg-black border-red-600">
        <CardHeader>
          <CardTitle className="seedy-neon-golden">Live Preview</CardTitle>
          <CardDescription>See your changes in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preview Text</Label>
            <Input
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              className="mt-2"
            />
          </div>
          <div className="bg-card p-8 rounded-lg border border-border space-y-4">
            <h1 className="text-6xl seedy-neon-red text-center">{previewText}</h1>
            <h2 className="text-4xl seedy-neon-golden text-center">{previewText}</h2>
            <p className="text-2xl seedy-neon-white text-center">{previewText}</p>
            <p className="text-lg neon-heading-red text-center">HEADING STYLE</p>
            <p className="text-base neon-body-text text-center">This is body text for reading content and descriptions.</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="fonts" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
          <TabsTrigger value="red">Red Neon</TabsTrigger>
          <TabsTrigger value="golden">Golden Neon</TabsTrigger>
          <TabsTrigger value="white">White Neon</TabsTrigger>
          <TabsTrigger value="body">Body Text</TabsTrigger>
        </TabsList>

        {/* Fonts Tab */}
        <TabsContent value="fonts">
          <Card>
            <CardHeader>
              <CardTitle>Font Families</CardTitle>
              <CardDescription>Select fonts for different text types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Logo & Display Font (Neon)</Label>
                <Select
                  value={settings.fontNeon}
                  onValueChange={(value) => updateSetting('fontNeon', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Headings Font (Display)</Label>
                <Select
                  value={settings.fontDisplay}
                  onValueChange={(value) => updateSetting('fontDisplay', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Body Text Font</Label>
                <Select
                  value={settings.fontBody}
                  onValueChange={(value) => updateSetting('fontBody', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Neon Letter Spacing: {settings.letterSpacingNeon.toFixed(2)}em</Label>
                  <Slider
                    value={[settings.letterSpacingNeon]}
                    onValueChange={([value]) => updateSetting('letterSpacingNeon', value)}
                    min={0}
                    max={0.2}
                    step={0.01}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Display Letter Spacing: {settings.letterSpacingDisplay.toFixed(2)}em</Label>
                  <Slider
                    value={[settings.letterSpacingDisplay]}
                    onValueChange={([value]) => updateSetting('letterSpacingDisplay', value)}
                    min={0}
                    max={0.3}
                    step={0.01}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Body Letter Spacing: {settings.letterSpacingBody.toFixed(2)}em</Label>
                  <Slider
                    value={[settings.letterSpacingBody]}
                    onValueChange={([value]) => updateSetting('letterSpacingBody', value)}
                    min={0}
                    max={0.1}
                    step={0.01}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Red Neon Tab */}
        <TabsContent value="red">
          <Card>
            <CardHeader>
              <CardTitle className="seedy-neon-red">Red Neon Settings</CardTitle>
              <CardDescription>Adjust the red neon glow effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={settings.neonRedColor}
                    onChange={(e) => updateSetting('neonRedColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.neonRedColor}
                    onChange={(e) => updateSetting('neonRedColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inner Glow: {settings.neonRedGlow1}px</Label>
                  <Slider
                    value={[settings.neonRedGlow1]}
                    onValueChange={([value]) => updateSetting('neonRedGlow1', value)}
                    min={0}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Inner Opacity: {(settings.neonRedOpacity1 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonRedOpacity1]}
                    onValueChange={([value]) => updateSetting('neonRedOpacity1', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Glow: {settings.neonRedGlow2}px</Label>
                  <Slider
                    value={[settings.neonRedGlow2]}
                    onValueChange={([value]) => updateSetting('neonRedGlow2', value)}
                    min={0}
                    max={40}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Opacity: {(settings.neonRedOpacity2 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonRedOpacity2]}
                    onValueChange={([value]) => updateSetting('neonRedOpacity2', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Glow: {settings.neonRedGlow3}px</Label>
                  <Slider
                    value={[settings.neonRedGlow3]}
                    onValueChange={([value]) => updateSetting('neonRedGlow3', value)}
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Opacity: {(settings.neonRedOpacity3 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonRedOpacity3]}
                    onValueChange={([value]) => updateSetting('neonRedOpacity3', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Golden Neon Tab */}
        <TabsContent value="golden">
          <Card>
            <CardHeader>
              <CardTitle className="seedy-neon-golden">Golden Neon Settings</CardTitle>
              <CardDescription>Adjust the golden neon glow effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={settings.neonGoldenColor}
                    onChange={(e) => updateSetting('neonGoldenColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    value={settings.neonGoldenColor}
                    onChange={(e) => updateSetting('neonGoldenColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inner Glow: {settings.neonGoldenGlow1}px</Label>
                  <Slider
                    value={[settings.neonGoldenGlow1]}
                    onValueChange={([value]) => updateSetting('neonGoldenGlow1', value)}
                    min={0}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Inner Opacity: {(settings.neonGoldenOpacity1 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonGoldenOpacity1]}
                    onValueChange={([value]) => updateSetting('neonGoldenOpacity1', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Glow: {settings.neonGoldenGlow2}px</Label>
                  <Slider
                    value={[settings.neonGoldenGlow2]}
                    onValueChange={([value]) => updateSetting('neonGoldenGlow2', value)}
                    min={0}
                    max={40}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Opacity: {(settings.neonGoldenOpacity2 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonGoldenOpacity2]}
                    onValueChange={([value]) => updateSetting('neonGoldenOpacity2', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Glow: {settings.neonGoldenGlow3}px</Label>
                  <Slider
                    value={[settings.neonGoldenGlow3]}
                    onValueChange={([value]) => updateSetting('neonGoldenGlow3', value)}
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Opacity: {(settings.neonGoldenOpacity3 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonGoldenOpacity3]}
                    onValueChange={([value]) => updateSetting('neonGoldenOpacity3', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* White Neon Tab */}
        <TabsContent value="white">
          <Card>
            <CardHeader>
              <CardTitle className="seedy-neon-white">White Neon Settings</CardTitle>
              <CardDescription>Adjust the white neon glow effect</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Base Color</Label>
                <Input
                  value={settings.neonWhiteColor}
                  onChange={(e) => updateSetting('neonWhiteColor', e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inner Glow: {settings.neonWhiteGlow1}px</Label>
                  <Slider
                    value={[settings.neonWhiteGlow1]}
                    onValueChange={([value]) => updateSetting('neonWhiteGlow1', value)}
                    min={0}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Inner Opacity: {(settings.neonWhiteOpacity1 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonWhiteOpacity1]}
                    onValueChange={([value]) => updateSetting('neonWhiteOpacity1', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Glow: {settings.neonWhiteGlow2}px</Label>
                  <Slider
                    value={[settings.neonWhiteGlow2]}
                    onValueChange={([value]) => updateSetting('neonWhiteGlow2', value)}
                    min={0}
                    max={30}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Middle Opacity: {(settings.neonWhiteOpacity2 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonWhiteOpacity2]}
                    onValueChange={([value]) => updateSetting('neonWhiteOpacity2', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Glow: {settings.neonWhiteGlow3}px</Label>
                  <Slider
                    value={[settings.neonWhiteGlow3]}
                    onValueChange={([value]) => updateSetting('neonWhiteGlow3', value)}
                    min={0}
                    max={40}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Outer Opacity: {(settings.neonWhiteOpacity3 * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.neonWhiteOpacity3]}
                    onValueChange={([value]) => updateSetting('neonWhiteOpacity3', value)}
                    min={0}
                    max={1}
                    step={0.05}
                    className="mt-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Text Tab */}
        <TabsContent value="body">
          <Card>
            <CardHeader>
              <CardTitle>Body Text Settings</CardTitle>
              <CardDescription>Adjust body text appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Text Color (HSL)</Label>
                <Input
                  value={settings.bodyTextColor}
                  onChange={(e) => updateSetting('bodyTextColor', e.target.value)}
                  className="mt-2"
                  placeholder="hsl(0, 0%, 85%)"
                />
              </div>

              <div>
                <Label>Text Brightness: {settings.bodyTextBrightness}%</Label>
                <Slider
                  value={[settings.bodyTextBrightness]}
                  onValueChange={([value]) => updateSetting('bodyTextBrightness', value)}
                  min={50}
                  max={100}
                  step={1}
                  className="mt-2"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Adjust the overall brightness of body text throughout the platform
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
