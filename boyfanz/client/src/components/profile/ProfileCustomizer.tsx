// @ts-nocheck
/**
 * ProfileCustomizer - MySpace-style Profile Customization
 *
 * Allows creators to customize their profile with:
 * - Custom backgrounds (images, gradients, colors)
 * - Color themes
 * - Layout options
 * - Font styles
 * - Music/audio autoplay (optional)
 * - Custom CSS (limited)
 */

import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Palette,
  Image as ImageIcon,
  Layout,
  Type,
  Music,
  Sparkles,
  Save,
  RotateCcw,
  Eye,
  Upload,
  Wand2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

export interface ProfileTheme {
  // Background
  backgroundType: 'solid' | 'gradient' | 'image' | 'video';
  backgroundColor: string;
  backgroundGradient: string;
  backgroundImageUrl: string;
  backgroundVideoUrl: string;
  backgroundBlur: number;
  backgroundOpacity: number;

  // Colors
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  textColor: string;
  cardBackgroundColor: string;
  cardOpacity: number;

  // Typography
  fontFamily: string;
  headingFont: string;
  fontSize: 'small' | 'medium' | 'large';

  // Layout
  layout: 'classic' | 'modern' | 'minimal' | 'bold' | 'neon';
  postsLayout: 'grid' | 'masonry' | 'list' | 'carousel';
  showStats: boolean;
  showSocialLinks: boolean;

  // Effects
  enableAnimations: boolean;
  enableParticles: boolean;
  particleType: 'snow' | 'hearts' | 'stars' | 'confetti' | 'none';
  glowEffect: boolean;
  neonBorders: boolean;

  // Music
  profileMusicUrl: string;
  musicAutoplay: boolean;
  musicVolume: number;

  // Custom CSS (limited)
  customCSS: string;
}

const DEFAULT_THEME: ProfileTheme = {
  backgroundType: 'gradient',
  backgroundColor: '#1a1a2e',
  backgroundGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  backgroundImageUrl: '',
  backgroundVideoUrl: '',
  backgroundBlur: 0,
  backgroundOpacity: 100,

  primaryColor: '#ff0000',
  secondaryColor: '#d4a959',
  accentColor: '#ff6b6b',
  textColor: '#ffffff',
  cardBackgroundColor: '#1a1a2e',
  cardOpacity: 90,

  fontFamily: 'Inter',
  headingFont: 'Bebas Neue',
  fontSize: 'medium',

  layout: 'modern',
  postsLayout: 'grid',
  showStats: true,
  showSocialLinks: true,

  enableAnimations: true,
  enableParticles: false,
  particleType: 'none',
  glowEffect: true,
  neonBorders: false,

  profileMusicUrl: '',
  musicAutoplay: false,
  musicVolume: 50,

  customCSS: '',
};

const PRESET_THEMES = [
  {
    name: 'Dark Underground',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #0d0d0d 0%, #1a0a0a 50%, #2d0a0a 100%)',
      primaryColor: '#ff0000',
      neonBorders: true,
      glowEffect: true,
    },
  },
  {
    name: 'Golden Luxury',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #1a1a0a 0%, #2d2d0a 50%, #0a0a0a 100%)',
      primaryColor: '#d4a959',
      secondaryColor: '#ffd700',
      accentColor: '#b8860b',
    },
  },
  {
    name: 'Neon Nights',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #0a0a2e 0%, #1a0a3e 50%, #2e0a4e 100%)',
      primaryColor: '#ff00ff',
      secondaryColor: '#00ffff',
      accentColor: '#ff6bff',
      neonBorders: true,
      enableParticles: true,
      particleType: 'stars',
    },
  },
  {
    name: 'Sunset Vibes',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 50%, #ff9ff3 100%)',
      primaryColor: '#ff6b6b',
      secondaryColor: '#feca57',
      textColor: '#2d3436',
    },
  },
  {
    name: 'Ocean Blue',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #0a2e4e 0%, #0a4e6e 50%, #0a6e8e 100%)',
      primaryColor: '#00bcd4',
      secondaryColor: '#03a9f4',
      accentColor: '#4dd0e1',
    },
  },
  {
    name: 'Forest Green',
    theme: {
      ...DEFAULT_THEME,
      backgroundGradient: 'linear-gradient(135deg, #0a2e0a 0%, #0a4e1e 50%, #0a6e2e 100%)',
      primaryColor: '#4caf50',
      secondaryColor: '#8bc34a',
      accentColor: '#cddc39',
    },
  },
];

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Roboto', label: 'Roboto (Clean)' },
  { value: 'Playfair Display', label: 'Playfair (Elegant)' },
  { value: 'Montserrat', label: 'Montserrat (Bold)' },
  { value: 'Poppins', label: 'Poppins (Friendly)' },
  { value: 'Space Grotesk', label: 'Space Grotesk (Tech)' },
  { value: 'Comic Neue', label: 'Comic Neue (Fun)' },
];

const HEADING_FONT_OPTIONS = [
  { value: 'Bebas Neue', label: 'Bebas Neue (Bold)' },
  { value: 'Playfair Display', label: 'Playfair (Elegant)' },
  { value: 'Oswald', label: 'Oswald (Strong)' },
  { value: 'Abril Fatface', label: 'Abril Fatface (Display)' },
  { value: 'Anton', label: 'Anton (Impact)' },
  { value: 'Righteous', label: 'Righteous (Retro)' },
];

interface ProfileCustomizerProps {
  userId: string;
  onSave?: (theme: ProfileTheme) => void;
}

export function ProfileCustomizer({ userId, onSave }: ProfileCustomizerProps) {
  const [theme, setTheme] = useState<ProfileTheme>(DEFAULT_THEME);
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing theme
  const { data: savedTheme } = useQuery({
    queryKey: ['/api/profile-themes', userId],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/profile-themes/${userId}`);
      return res.json();
    },
  });

  useEffect(() => {
    if (savedTheme?.theme) {
      setTheme({ ...DEFAULT_THEME, ...savedTheme.theme });
    }
  }, [savedTheme]);

  // Save theme mutation
  const saveMutation = useMutation({
    mutationFn: async (themeData: ProfileTheme) => {
      const res = await apiRequest('PUT', `/api/profile-themes/${userId}`, { theme: themeData });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile-themes', userId] });
      toast({
        title: 'Theme Saved!',
        description: 'Your profile customization has been saved.',
      });
      onSave?.(theme);
    },
    onError: () => {
      toast({
        title: 'Save Failed',
        description: 'Could not save your theme. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(theme);
  };

  const handleReset = () => {
    setTheme(DEFAULT_THEME);
    toast({
      title: 'Theme Reset',
      description: 'Your theme has been reset to defaults.',
    });
  };

  const applyPreset = (preset: typeof PRESET_THEMES[0]) => {
    setTheme({ ...DEFAULT_THEME, ...preset.theme });
    toast({
      title: 'Preset Applied',
      description: `Applied "${preset.name}" theme preset.`,
    });
  };

  const updateTheme = (key: keyof ProfileTheme, value: any) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Customize Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Profile Customization
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="presets" className="text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              Presets
            </TabsTrigger>
            <TabsTrigger value="background" className="text-xs">
              <ImageIcon className="h-3 w-3 mr-1" />
              Background
            </TabsTrigger>
            <TabsTrigger value="colors" className="text-xs">
              <Palette className="h-3 w-3 mr-1" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-xs">
              <Layout className="h-3 w-3 mr-1" />
              Layout
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-xs">
              <Type className="h-3 w-3 mr-1" />
              Fonts
            </TabsTrigger>
            <TabsTrigger value="effects" className="text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              Effects
            </TabsTrigger>
          </TabsList>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PRESET_THEMES.map((preset) => (
                <Card
                  key={preset.name}
                  className="cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => applyPreset(preset)}
                >
                  <div
                    className="h-24 rounded-t-lg"
                    style={{ background: preset.theme.backgroundGradient }}
                  />
                  <CardContent className="p-3">
                    <p className="font-medium text-sm">{preset.name}</p>
                    <div className="flex gap-1 mt-2">
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.theme.primaryColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.theme.secondaryColor }}
                      />
                      <div
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.theme.accentColor }}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Background Tab */}
          <TabsContent value="background" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Background Type</Label>
                <Select
                  value={theme.backgroundType}
                  onValueChange={(v) => updateTheme('backgroundType', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="solid">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video (Premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {theme.backgroundType === 'solid' && (
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme.backgroundColor}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                      className="w-16 h-10"
                    />
                    <Input
                      value={theme.backgroundColor}
                      onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              )}

              {theme.backgroundType === 'gradient' && (
                <div className="space-y-2">
                  <Label>Gradient CSS</Label>
                  <Textarea
                    value={theme.backgroundGradient}
                    onChange={(e) => updateTheme('backgroundGradient', e.target.value)}
                    placeholder="linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)"
                    rows={3}
                  />
                  <div
                    className="h-20 rounded-lg border"
                    style={{ background: theme.backgroundGradient }}
                  />
                </div>
              )}

              {theme.backgroundType === 'image' && (
                <div className="space-y-2">
                  <Label>Background Image URL</Label>
                  <Input
                    value={theme.backgroundImageUrl}
                    onChange={(e) => updateTheme('backgroundImageUrl', e.target.value)}
                    placeholder="https://example.com/background.jpg"
                  />
                  <Button variant="outline" className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              )}

              <div className="space-y-2">
                <Label>Background Blur: {theme.backgroundBlur}px</Label>
                <Slider
                  value={[theme.backgroundBlur]}
                  onValueChange={([v]) => updateTheme('backgroundBlur', v)}
                  max={20}
                  step={1}
                />
              </div>

              <div className="space-y-2">
                <Label>Background Opacity: {theme.backgroundOpacity}%</Label>
                <Slider
                  value={[theme.backgroundOpacity]}
                  onValueChange={([v]) => updateTheme('backgroundOpacity', v)}
                  max={100}
                  step={5}
                />
              </div>
            </div>
          </TabsContent>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'primaryColor', label: 'Primary Color' },
                { key: 'secondaryColor', label: 'Secondary Color' },
                { key: 'accentColor', label: 'Accent Color' },
                { key: 'textColor', label: 'Text Color' },
                { key: 'cardBackgroundColor', label: 'Card Background' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={theme[key as keyof ProfileTheme] as string}
                      onChange={(e) => updateTheme(key as keyof ProfileTheme, e.target.value)}
                      className="w-12 h-10"
                    />
                    <Input
                      value={theme[key as keyof ProfileTheme] as string}
                      onChange={(e) => updateTheme(key as keyof ProfileTheme, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label>Card Opacity: {theme.cardOpacity}%</Label>
              <Slider
                value={[theme.cardOpacity]}
                onValueChange={([v]) => updateTheme('cardOpacity', v)}
                max={100}
                step={5}
              />
            </div>
          </TabsContent>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Profile Layout</Label>
                <Select
                  value={theme.layout}
                  onValueChange={(v) => updateTheme('layout', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="neon">Neon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Posts Layout</Label>
                <Select
                  value={theme.postsLayout}
                  onValueChange={(v) => updateTheme('postsLayout', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="masonry">Masonry</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="carousel">Carousel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Statistics</Label>
                <Switch
                  checked={theme.showStats}
                  onCheckedChange={(v) => updateTheme('showStats', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Show Social Links</Label>
                <Switch
                  checked={theme.showSocialLinks}
                  onCheckedChange={(v) => updateTheme('showSocialLinks', v)}
                />
              </div>
            </div>
          </TabsContent>

          {/* Fonts Tab */}
          <TabsContent value="fonts" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Body Font</Label>
                <Select
                  value={theme.fontFamily}
                  onValueChange={(v) => updateTheme('fontFamily', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Heading Font</Label>
                <Select
                  value={theme.headingFont}
                  onValueChange={(v) => updateTheme('headingFont', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {HEADING_FONT_OPTIONS.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        <span style={{ fontFamily: font.value }}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Font Size</Label>
                <Select
                  value={theme.fontSize}
                  onValueChange={(v) => updateTheme('fontSize', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Animations</Label>
                  <p className="text-xs text-muted-foreground">Smooth transitions and hover effects</p>
                </div>
                <Switch
                  checked={theme.enableAnimations}
                  onCheckedChange={(v) => updateTheme('enableAnimations', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Glow Effect</Label>
                  <p className="text-xs text-muted-foreground">Soft glow around profile elements</p>
                </div>
                <Switch
                  checked={theme.glowEffect}
                  onCheckedChange={(v) => updateTheme('glowEffect', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Neon Borders</Label>
                  <p className="text-xs text-muted-foreground">Bright neon-style borders</p>
                </div>
                <Switch
                  checked={theme.neonBorders}
                  onCheckedChange={(v) => updateTheme('neonBorders', v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Background Particles</Label>
                  <p className="text-xs text-muted-foreground">Animated particles in background</p>
                </div>
                <Switch
                  checked={theme.enableParticles}
                  onCheckedChange={(v) => updateTheme('enableParticles', v)}
                />
              </div>

              {theme.enableParticles && (
                <div className="space-y-2">
                  <Label>Particle Type</Label>
                  <Select
                    value={theme.particleType}
                    onValueChange={(v) => updateTheme('particleType', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="snow">Snow</SelectItem>
                      <SelectItem value="hearts">Hearts</SelectItem>
                      <SelectItem value="stars">Stars</SelectItem>
                      <SelectItem value="confetti">Confetti</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Music className="h-4 w-4" />
                      Profile Music
                    </Label>
                    <p className="text-xs text-muted-foreground">Add background music to your profile</p>
                  </div>
                  <Switch
                    checked={theme.musicAutoplay}
                    onCheckedChange={(v) => updateTheme('musicAutoplay', v)}
                  />
                </div>

                {theme.musicAutoplay && (
                  <>
                    <Input
                      value={theme.profileMusicUrl}
                      onChange={(e) => updateTheme('profileMusicUrl', e.target.value)}
                      placeholder="https://example.com/music.mp3"
                      className="mb-2"
                    />
                    <div className="space-y-2">
                      <Label>Volume: {theme.musicVolume}%</Label>
                      <Slider
                        value={[theme.musicVolume]}
                        onValueChange={([v]) => updateTheme('musicVolume', v)}
                        max={100}
                        step={5}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Preview */}
        <div
          className="mt-4 h-32 rounded-lg border overflow-hidden"
          style={{
            background: theme.backgroundType === 'gradient' ? theme.backgroundGradient : theme.backgroundColor,
            filter: theme.backgroundBlur > 0 ? `blur(${theme.backgroundBlur}px)` : undefined,
            opacity: theme.backgroundOpacity / 100,
          }}
        >
          <div className="h-full flex items-center justify-center">
            <p style={{ color: theme.textColor, fontFamily: theme.fontFamily }}>
              Preview of your profile theme
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Theme'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ProfileCustomizer;
