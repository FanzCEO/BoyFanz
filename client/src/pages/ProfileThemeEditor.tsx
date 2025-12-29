import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  User, Camera, Video, Image as ImageIcon, Palette, Layout, Save, Upload,
  Trash2, Eye, RefreshCw, Sparkles, Type, Sun, Moon, Droplet, Brush,
  Square, Circle, Hexagon, Star, Heart, Flame, Crown, Settings2, Wand2,
  Layers, Grid3X3, X, Check, ChevronRight, Play, Pause, Volume2, VolumeX
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Predefined color palettes for the dungeon vibe
const COLOR_PALETTES = {
  blood: { primary: '#dc2626', secondary: '#7f1d1d', accent: '#fbbf24', name: 'Blood Red' },
  midnight: { primary: '#1e1b4b', secondary: '#312e81', accent: '#a855f7', name: 'Midnight Purple' },
  obsidian: { primary: '#0a0a0a', secondary: '#171717', accent: '#ef4444', name: 'Obsidian Black' },
  inferno: { primary: '#ea580c', secondary: '#9a3412', accent: '#fde047', name: 'Inferno Orange' },
  toxic: { primary: '#16a34a', secondary: '#14532d', accent: '#4ade80', name: 'Toxic Green' },
  electric: { primary: '#0284c7', secondary: '#0c4a6e', accent: '#22d3ee', name: 'Electric Blue' },
  crimson: { primary: '#be123c', secondary: '#881337', accent: '#fb7185', name: 'Crimson Rose' },
  gold: { primary: '#ca8a04', secondary: '#713f12', accent: '#facc15', name: 'Royal Gold' },
};

// Preset gradients for backgrounds
const GRADIENT_PRESETS = [
  { id: 'dungeon', css: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a0a0a 100%)', name: 'Dungeon' },
  { id: 'blood-moon', css: 'linear-gradient(180deg, #0a0a0a 0%, #2d0a0a 50%, #0a0a0a 100%)', name: 'Blood Moon' },
  { id: 'abyss', css: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #000000 100%)', name: 'Abyss' },
  { id: 'inferno', css: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a0a 25%, #2d1a0a 50%, #1a0a0a 75%, #0a0a0a 100%)', name: 'Inferno' },
  { id: 'neon', css: 'linear-gradient(135deg, #0a0a0a 0%, #0a1a1a 50%, #0a0a0a 100%)', name: 'Neon Night' },
  { id: 'royal', css: 'linear-gradient(180deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a0a 100%)', name: 'Royal Purple' },
];

// Font options
const FONT_OPTIONS = [
  { id: 'bebas', name: 'Bebas Neue', className: 'font-bebas' },
  { id: 'inter', name: 'Inter', className: 'font-sans' },
  { id: 'poppins', name: 'Poppins', className: 'font-poppins' },
  { id: 'playfair', name: 'Playfair Display', className: 'font-serif' },
  { id: 'space-grotesk', name: 'Space Grotesk', className: 'font-space-grotesk' },
];

export default function ProfileThemeEditor() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Media refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const coverVideoRef = useRef<HTMLVideoElement>(null);

  // Theme state
  const [theme, setTheme] = useState({
    // Avatar & Cover
    avatarUrl: '',
    avatarFile: null as File | null,
    coverUrl: '',
    coverFile: null as File | null,
    coverType: 'image' as 'image' | 'video',
    coverVideoMuted: true,

    // Colors
    primaryColor: '#dc2626',
    secondaryColor: '#7f1d1d',
    accentColor: '#fbbf24',
    textColor: '#ffffff',
    backgroundColor: '#0a0a0a',

    // Background
    backgroundType: 'gradient' as 'solid' | 'gradient' | 'image' | 'video',
    backgroundGradient: GRADIENT_PRESETS[0].css,
    backgroundImageUrl: '',
    backgroundVideoUrl: '',
    backgroundOpacity: 100,
    backgroundBlur: 0,

    // Typography
    headingFont: 'bebas',
    bodyFont: 'inter',

    // Layout
    profileLayout: 'standard' as 'standard' | 'centered' | 'minimal' | 'magazine',
    showBadges: true,
    showStats: true,
    showSocialLinks: true,
    glowEffects: true,
    animatedBackground: false,
  });

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing theme
  const { data: savedTheme, isLoading } = useQuery({
    queryKey: ['/api/profile/theme'],
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (savedTheme) {
      setTheme(prev => ({ ...prev, ...savedTheme }));
    }
  }, [savedTheme]);

  // Handle file uploads
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTheme(prev => ({ ...prev, avatarUrl: url, avatarFile: file }));
      toast({ title: "Avatar ready!", description: "Click Save to apply changes" });
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const isVideo = file.type.startsWith('video/');
      setTheme(prev => ({
        ...prev,
        coverUrl: url,
        coverFile: file,
        coverType: isVideo ? 'video' : 'image'
      }));
      toast({
        title: isVideo ? "Cover video ready!" : "Cover photo ready!",
        description: "Click Save to apply changes"
      });
    }
  };

  // Apply color palette
  const applyPalette = (paletteKey: keyof typeof COLOR_PALETTES) => {
    const palette = COLOR_PALETTES[paletteKey];
    setTheme(prev => ({
      ...prev,
      primaryColor: palette.primary,
      secondaryColor: palette.secondary,
      accentColor: palette.accent,
    }));
    toast({ title: `${palette.name} palette applied!` });
  };

  // Save theme
  const saveMutation = useMutation({
    mutationFn: async (themeData: typeof theme) => {
      const formData = new FormData();

      // Add files if present
      if (themeData.avatarFile) {
        formData.append('avatar', themeData.avatarFile);
      }
      if (themeData.coverFile) {
        formData.append('cover', themeData.coverFile);
      }

      // Add theme settings
      formData.append('theme', JSON.stringify({
        ...themeData,
        avatarFile: undefined,
        coverFile: undefined,
      }));

      const response = await fetch('/api/profile/theme', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save theme');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile/theme'] });
      queryClient.invalidateQueries({ queryKey: ['/api/naughty-profile'] });
      toast({
        title: "🔥 Theme saved!",
        description: "Your profile now looks fire!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSave = () => {
    setIsSaving(true);
    saveMutation.mutate(theme);
    setIsSaving(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-purple-950/80 border border-red-500/20 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 opacity-10">
          <Wand2 className="h-48 w-48 text-red-500" />
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl shadow-lg shadow-red-500/30">
              <Palette className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-pink-400 to-purple-500 mb-1 font-bebas">
                Profile Theme Editor
              </h1>
              <p className="text-gray-400 text-lg">
                Make your space look exactly how you want - 100% customizable 🔥
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Preview'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-red-500/25"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Theme'}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="media" className="w-full">
            <TabsList className="w-full grid grid-cols-5 bg-black/50 border border-red-900/30 rounded-xl p-1.5 h-auto">
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
              >
                <Camera className="h-4 w-4 mr-2" />
                Media
              </TabsTrigger>
              <TabsTrigger
                value="colors"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
              >
                <Droplet className="h-4 w-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger
                value="background"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
              >
                <Layers className="h-4 w-4 mr-2" />
                BG
              </TabsTrigger>
              <TabsTrigger
                value="typography"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
              >
                <Type className="h-4 w-4 mr-2" />
                Fonts
              </TabsTrigger>
              <TabsTrigger
                value="layout"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
              >
                <Layout className="h-4 w-4 mr-2" />
                Layout
              </TabsTrigger>
            </TabsList>

            {/* Media Tab - Avatar & Cover */}
            <TabsContent value="media" className="mt-6 space-y-6">
              {/* Avatar Upload */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-600 to-pink-600 rounded-lg">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black uppercase text-white">
                        Profile Avatar / Logo
                      </CardTitle>
                      <CardDescription>
                        Upload your face, logo, or any image you want as your avatar
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="relative group">
                      <Avatar className="w-32 h-32 ring-4 ring-red-500/30 cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                        <AvatarImage src={theme.avatarUrl || user?.avatarUrl} />
                        <AvatarFallback className="bg-gradient-to-br from-red-800 to-red-950 text-4xl font-bebas">
                          {user?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button
                        variant="outline"
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => avatarInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Avatar
                      </Button>
                      {theme.avatarUrl && (
                        <Button
                          variant="ghost"
                          className="w-full text-gray-400 hover:text-red-400"
                          onClick={() => setTheme(prev => ({ ...prev, avatarUrl: '', avatarFile: null }))}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Cover Photo/Video Upload */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg">
                      <ImageIcon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black uppercase text-white">
                        Cover Photo or Video
                      </CardTitle>
                      <CardDescription>
                        Upload an image or video for your profile header - make it 🔥
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Cover Preview */}
                    <div
                      className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-r from-red-950/50 to-purple-950/50 cursor-pointer group border-2 border-dashed border-red-500/30 hover:border-red-500/60 transition-colors"
                      onClick={() => coverInputRef.current?.click()}
                    >
                      {theme.coverUrl ? (
                        theme.coverType === 'video' ? (
                          <>
                            <video
                              ref={coverVideoRef}
                              src={theme.coverUrl}
                              className="w-full h-full object-cover"
                              autoPlay
                              loop
                              muted={theme.coverVideoMuted}
                              playsInline
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80"
                              onClick={(e) => {
                                e.stopPropagation();
                                setTheme(prev => ({ ...prev, coverVideoMuted: !prev.coverVideoMuted }));
                              }}
                            >
                              {theme.coverVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                            </Button>
                          </>
                        ) : (
                          <img src={theme.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                          <Upload className="w-10 h-10 mb-2" />
                          <p className="font-bold">Click to upload cover image or video</p>
                          <p className="text-sm text-gray-500">Recommended: 1500x500px or 16:9 video</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-10 h-10 text-white" />
                      </div>
                    </div>

                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={handleCoverUpload}
                    />

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <Video className="w-4 h-4 mr-2" />
                        Upload Video
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="mt-6 space-y-6">
              {/* Quick Palettes */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-yellow-400" />
                    Quick Color Palettes
                  </CardTitle>
                  <CardDescription>One-click sexy color schemes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {Object.entries(COLOR_PALETTES).map(([key, palette]) => (
                      <button
                        key={key}
                        onClick={() => applyPalette(key as keyof typeof COLOR_PALETTES)}
                        className="group relative p-4 rounded-xl border-2 border-gray-700 hover:border-white/50 transition-all overflow-hidden"
                        style={{ background: `linear-gradient(135deg, ${palette.primary}, ${palette.secondary})` }}
                      >
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full" style={{ backgroundColor: palette.accent }} />
                        <p className="text-white text-xs font-bold mt-4 text-center drop-shadow-lg">
                          {palette.name}
                        </p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Colors */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white flex items-center gap-2">
                    <Brush className="h-5 w-5 text-pink-400" />
                    Custom Colors
                  </CardTitle>
                  <CardDescription>Fine-tune every color on your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Primary Color */}
                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.primaryColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                      />
                      <Input
                        value={theme.primaryColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="flex-1 bg-black/50 border-gray-700 font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.secondaryColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                      />
                      <Input
                        value={theme.secondaryColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="flex-1 bg-black/50 border-gray-700 font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">Accent Color (Highlights)</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                      />
                      <Input
                        value={theme.accentColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="flex-1 bg-black/50 border-gray-700 font-mono uppercase"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">Text Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={theme.textColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                        className="w-16 h-10 rounded-lg cursor-pointer border-2 border-gray-700"
                      />
                      <Input
                        value={theme.textColor}
                        onChange={(e) => setTheme(prev => ({ ...prev, textColor: e.target.value }))}
                        className="flex-1 bg-black/50 border-gray-700 font-mono uppercase"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="mt-6 space-y-6">
              {/* Background Type */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white">Background Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-3">
                    {['solid', 'gradient', 'image', 'video'].map((type) => (
                      <button
                        key={type}
                        onClick={() => setTheme(prev => ({ ...prev, backgroundType: type as any }))}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          theme.backgroundType === type
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        {type === 'solid' && <Square className="w-6 h-6 mx-auto mb-2 text-white" />}
                        {type === 'gradient' && <Layers className="w-6 h-6 mx-auto mb-2 text-white" />}
                        {type === 'image' && <ImageIcon className="w-6 h-6 mx-auto mb-2 text-white" />}
                        {type === 'video' && <Video className="w-6 h-6 mx-auto mb-2 text-white" />}
                        <p className="text-white text-xs font-bold uppercase">{type}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Gradient Presets */}
              {theme.backgroundType === 'gradient' && (
                <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                  <CardHeader>
                    <CardTitle className="text-xl font-black uppercase text-white">Gradient Presets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      {GRADIENT_PRESETS.map((gradient) => (
                        <button
                          key={gradient.id}
                          onClick={() => setTheme(prev => ({ ...prev, backgroundGradient: gradient.css }))}
                          className={`h-20 rounded-xl border-2 transition-all ${
                            theme.backgroundGradient === gradient.css
                              ? 'border-red-500 ring-2 ring-red-500/50'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                          style={{ background: gradient.css }}
                        >
                          <p className="text-white text-xs font-bold drop-shadow-lg">{gradient.name}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Background Opacity & Blur */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white">Effects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">
                      Opacity: {theme.backgroundOpacity}%
                    </Label>
                    <Slider
                      value={[theme.backgroundOpacity]}
                      onValueChange={(v) => setTheme(prev => ({ ...prev, backgroundOpacity: v[0] }))}
                      max={100}
                      step={5}
                      className="py-4"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white font-bold uppercase text-sm">
                      Blur: {theme.backgroundBlur}px
                    </Label>
                    <Slider
                      value={[theme.backgroundBlur]}
                      onValueChange={(v) => setTheme(prev => ({ ...prev, backgroundBlur: v[0] }))}
                      max={20}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-700">
                    <div>
                      <p className="text-white font-bold">Animated Background</p>
                      <p className="text-gray-400 text-sm">Subtle pulsing glow effect</p>
                    </div>
                    <Switch
                      checked={theme.animatedBackground}
                      onCheckedChange={(v) => setTheme(prev => ({ ...prev, animatedBackground: v }))}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Typography Tab */}
            <TabsContent value="typography" className="mt-6 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white">Font Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-white font-bold uppercase text-sm">Heading Font</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setTheme(prev => ({ ...prev, headingFont: font.id }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            theme.headingFont === font.id
                              ? 'border-red-500 bg-red-500/20'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <p className={`text-white text-xl ${font.className}`}>{font.name}</p>
                          <p className={`text-gray-400 text-sm ${font.className}`}>Preview Text</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-gray-800" />

                  <div className="space-y-3">
                    <Label className="text-white font-bold uppercase text-sm">Body Font</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.id}
                          onClick={() => setTheme(prev => ({ ...prev, bodyFont: font.id }))}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            theme.bodyFont === font.id
                              ? 'border-red-500 bg-red-500/20'
                              : 'border-gray-700 hover:border-gray-500'
                          }`}
                        >
                          <p className={`text-white ${font.className}`}>{font.name}</p>
                          <p className={`text-gray-400 text-sm ${font.className}`}>This is body text preview</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Layout Tab */}
            <TabsContent value="layout" className="mt-6 space-y-6">
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white">Profile Layout</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'standard', name: 'Standard', desc: 'Classic profile layout' },
                      { id: 'centered', name: 'Centered', desc: 'Avatar & info centered' },
                      { id: 'minimal', name: 'Minimal', desc: 'Clean, less clutter' },
                      { id: 'magazine', name: 'Magazine', desc: 'Editorial style' },
                    ].map((layout) => (
                      <button
                        key={layout.id}
                        onClick={() => setTheme(prev => ({ ...prev, profileLayout: layout.id as any }))}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          theme.profileLayout === layout.id
                            ? 'border-red-500 bg-red-500/20'
                            : 'border-gray-700 hover:border-gray-500'
                        }`}
                      >
                        <p className="text-white font-bold">{layout.name}</p>
                        <p className="text-gray-400 text-sm">{layout.desc}</p>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Toggle Options */}
              <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
                <CardHeader>
                  <CardTitle className="text-xl font-black uppercase text-white">Display Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { key: 'showBadges', label: 'Show Badges', desc: 'Display verification & role badges' },
                    { key: 'showStats', label: 'Show Stats', desc: 'Display follower/post counts' },
                    { key: 'showSocialLinks', label: 'Show Social Links', desc: 'Display linked social accounts' },
                    { key: 'glowEffects', label: 'Glow Effects', desc: 'Add neon glow to elements' },
                  ].map((option) => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-gray-700">
                      <div>
                        <p className="text-white font-bold">{option.label}</p>
                        <p className="text-gray-400 text-sm">{option.desc}</p>
                      </div>
                      <Switch
                        checked={(theme as any)[option.key]}
                        onCheckedChange={(v) => setTheme(prev => ({ ...prev, [option.key]: v }))}
                        className="data-[state=checked]:bg-red-600"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Panel */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-950/30 to-purple-950/30 border-b border-red-900/30">
                <CardTitle className="text-lg font-black uppercase text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-red-400" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {/* Mini Profile Preview */}
                <div
                  className="relative"
                  style={{
                    background: theme.backgroundType === 'gradient' ? theme.backgroundGradient : theme.backgroundColor,
                  }}
                >
                  {/* Cover */}
                  <div className="h-24 relative">
                    {theme.coverUrl ? (
                      theme.coverType === 'video' ? (
                        <video src={theme.coverUrl} className="w-full h-full object-cover" autoPlay loop muted />
                      ) : (
                        <img src={theme.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div
                        className="w-full h-full"
                        style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
                      />
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative -mt-10 px-4">
                    <Avatar
                      className="w-20 h-20 ring-4"
                      style={{
                        ['--tw-ring-color' as any]: theme.primaryColor,
                        boxShadow: theme.glowEffects ? `0 0 20px ${theme.primaryColor}40` : 'none'
                      }}
                    >
                      <AvatarImage src={theme.avatarUrl || user?.avatarUrl} />
                      <AvatarFallback
                        className="text-2xl font-bebas"
                        style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}
                      >
                        {user?.username?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="p-4 pt-2">
                    <h3
                      className="text-xl font-bebas"
                      style={{ color: theme.accentColor }}
                    >
                      {user?.displayName || user?.username}
                    </h3>
                    <p
                      className="text-sm"
                      style={{ color: `${theme.textColor}80` }}
                    >
                      @{user?.username}
                    </p>

                    {theme.showStats && (
                      <div className="flex gap-4 mt-3 text-xs">
                        <span style={{ color: theme.textColor }}>
                          <strong style={{ color: theme.accentColor }}>1.2K</strong> Fans
                        </span>
                        <span style={{ color: theme.textColor }}>
                          <strong style={{ color: theme.accentColor }}>89</strong> Posts
                        </span>
                      </div>
                    )}

                    {theme.showBadges && (
                      <div className="flex gap-2 mt-3">
                        <Badge
                          className="text-[10px]"
                          style={{ backgroundColor: theme.primaryColor, color: theme.textColor }}
                        >
                          🔥 CREATOR
                        </Badge>
                        <Badge
                          className="text-[10px]"
                          style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}
                        >
                          ✓ VERIFIED
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Color Preview Swatches */}
            <Card className="mt-4 bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-red-900/30">
              <CardContent className="p-4">
                <p className="text-xs text-gray-400 uppercase font-bold mb-3">Current Colors</p>
                <div className="flex gap-2">
                  <div
                    className="w-10 h-10 rounded-lg ring-2 ring-white/10"
                    style={{ backgroundColor: theme.primaryColor }}
                    title="Primary"
                  />
                  <div
                    className="w-10 h-10 rounded-lg ring-2 ring-white/10"
                    style={{ backgroundColor: theme.secondaryColor }}
                    title="Secondary"
                  />
                  <div
                    className="w-10 h-10 rounded-lg ring-2 ring-white/10"
                    style={{ backgroundColor: theme.accentColor }}
                    title="Accent"
                  />
                  <div
                    className="w-10 h-10 rounded-lg ring-2 ring-white/10"
                    style={{ backgroundColor: theme.textColor }}
                    title="Text"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
