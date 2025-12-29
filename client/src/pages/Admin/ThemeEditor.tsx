import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Upload,
  Image as ImageIcon,
  Palette,
  Layout,
  Type,
  Move,
  Trash2,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  GripVertical,
  X,
  Check,
  Settings,
  Layers
} from 'lucide-react';

interface ThemeSettings {
  headerImage: string | null;
  headerHeight: number;
  headerOverlay: boolean;
  headerOverlayColor: string;
  headerOverlayOpacity: number;
  logo: string | null;
  logoPosition: { x: number; y: number };
  logoSize: number;
  backgroundImage: string | null;
  backgroundColor: string;
  primaryColor: string;
  accentColor: string;
  customElements: CustomElement[];
}

interface CustomElement {
  id: string;
  type: 'image' | 'text';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  visible: boolean;
}

const defaultTheme: ThemeSettings = {
  headerImage: null,
  headerHeight: 300,
  headerOverlay: true,
  headerOverlayColor: '#000000',
  headerOverlayOpacity: 40,
  logo: null,
  logoPosition: { x: 50, y: 50 },
  logoSize: 120,
  backgroundImage: null,
  backgroundColor: '#0a0a0a',
  primaryColor: '#dc2626',
  accentColor: '#f97316',
  customElements: []
};

// Drag and drop upload zone
const UploadZone = ({
  onUpload,
  label,
  currentImage,
  onRemove,
  accept = 'image/*'
}: {
  onUpload: (file: File) => void;
  label: string;
  currentImage: string | null;
  onRemove: () => void;
  accept?: string;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200 min-h-[160px] flex flex-col items-center justify-center
          ${isDragging
            ? 'border-primary bg-primary/10'
            : 'border-gray-700 hover:border-gray-500 bg-gray-900/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
        />

        {currentImage ? (
          <div className="relative w-full">
            <img
              src={currentImage}
              alt={label}
              className="max-h-32 mx-auto rounded-lg object-contain"
            />
            <Button
              variant="destructive"
              size="sm"
              className="absolute top-0 right-0 h-8 w-8 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-500 mb-3" />
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xs text-gray-500 mt-1">Click or drag & drop</p>
          </>
        )}
      </div>
    </div>
  );
};

// Draggable element component
const DraggableElement = ({
  element,
  onUpdate,
  onDelete,
  isSelected,
  onSelect
}: {
  element: CustomElement;
  onUpdate: (updates: Partial<CustomElement>) => void;
  onDelete: () => void;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    setIsDragging(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...element.position };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      onUpdate({
        position: {
          x: Math.max(0, Math.min(100, startPos.x + (dx / 5))),
          y: Math.max(0, Math.min(100, startPos.y + (dy / 5)))
        }
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      ref={elementRef}
      className={`
        absolute cursor-move transition-all
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-black' : ''}
        ${isDragging ? 'opacity-80' : ''}
        ${!element.visible ? 'opacity-30' : ''}
      `}
      style={{
        left: `${element.position.x}%`,
        top: `${element.position.y}%`,
        width: element.size.width,
        height: element.size.height,
        zIndex: element.zIndex,
        transform: 'translate(-50%, -50%)'
      }}
      onMouseDown={handleMouseDown}
      onClick={onSelect}
    >
      {element.type === 'image' ? (
        <img
          src={element.content}
          alt="Custom element"
          className="w-full h-full object-contain pointer-events-none"
          draggable={false}
        />
      ) : (
        <div className="text-white font-bold text-xl whitespace-nowrap">
          {element.content}
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-6 w-6 p-0 bg-black/80"
            onClick={(e) => {
              e.stopPropagation();
              onUpdate({ visible: !element.visible });
            }}
          >
            {element.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default function ThemeEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved theme
  const { data: savedTheme, isLoading } = useQuery({
    queryKey: ['/api/admin/theme'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/theme');
        return response.json();
      } catch {
        return defaultTheme;
      }
    }
  });

  // Save theme mutation
  const saveMutation = useMutation({
    mutationFn: async (themeData: ThemeSettings) => {
      const response = await apiRequest('POST', '/api/admin/theme', themeData);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Theme saved!', description: 'Your changes have been applied.' });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/theme'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to save theme.', variant: 'destructive' });
    }
  });

  // File upload handler
  const handleFileUpload = useCallback(async (file: File, field: keyof ThemeSettings) => {
    // Create a local preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setTheme(prev => ({ ...prev, [field]: dataUrl }));
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  }, []);

  // Add custom element
  const addCustomElement = (type: 'image' | 'text', content: string) => {
    const newElement: CustomElement = {
      id: `elem_${Date.now()}`,
      type,
      content,
      position: { x: 50, y: 50 },
      size: type === 'image' ? { width: 100, height: 100 } : { width: 200, height: 40 },
      zIndex: theme.customElements.length + 1,
      visible: true
    };
    setTheme(prev => ({
      ...prev,
      customElements: [...prev.customElements, newElement]
    }));
    setSelectedElementId(newElement.id);
    setHasChanges(true);
  };

  // Update custom element
  const updateElement = (id: string, updates: Partial<CustomElement>) => {
    setTheme(prev => ({
      ...prev,
      customElements: prev.customElements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      )
    }));
    setHasChanges(true);
  };

  // Delete custom element
  const deleteElement = (id: string) => {
    setTheme(prev => ({
      ...prev,
      customElements: prev.customElements.filter(el => el.id !== id)
    }));
    setSelectedElementId(null);
    setHasChanges(true);
  };

  // Reset to defaults
  const resetTheme = () => {
    setTheme(defaultTheme);
    setSelectedElementId(null);
    setHasChanges(true);
  };

  const selectedElement = theme.customElements.find(el => el.id === selectedElementId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/90 backdrop-blur-lg border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-600 to-orange-500">
                <Palette className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Theme Editor</h1>
                <p className="text-xs text-gray-400">Complete control over your platform's look</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
                className="border-gray-700"
              >
                {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                {previewMode ? 'Edit' : 'Preview'}
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={resetTheme}
                className="border-gray-700"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={() => saveMutation.mutate(theme)}
                disabled={!hasChanges || saveMutation.isPending}
                className="bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600"
              >
                {saveMutation.isPending ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Theme
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900/50 border-gray-800 overflow-hidden">
              <CardHeader className="border-b border-gray-800">
                <CardTitle className="flex items-center gap-2 text-white">
                  <Layout className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Click and drag elements to reposition them
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {/* Preview Container */}
                <div
                  className="relative overflow-hidden"
                  style={{
                    height: theme.headerHeight + 200,
                    backgroundColor: theme.backgroundColor
                  }}
                  onClick={() => setSelectedElementId(null)}
                >
                  {/* Header Section */}
                  <div
                    className="relative w-full"
                    style={{ height: theme.headerHeight }}
                  >
                    {/* Header Background */}
                    {theme.headerImage ? (
                      <img
                        src={theme.headerImage}
                        alt="Header"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/50 to-orange-900/50" />
                    )}

                    {/* Header Overlay */}
                    {theme.headerOverlay && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundColor: theme.headerOverlayColor,
                          opacity: theme.headerOverlayOpacity / 100
                        }}
                      />
                    )}

                    {/* Logo */}
                    {theme.logo && (
                      <img
                        src={theme.logo}
                        alt="Logo"
                        className="absolute pointer-events-none"
                        style={{
                          left: `${theme.logoPosition.x}%`,
                          top: `${theme.logoPosition.y}%`,
                          width: theme.logoSize,
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    )}

                    {/* Custom Elements */}
                    {theme.customElements.map(element => (
                      <DraggableElement
                        key={element.id}
                        element={element}
                        onUpdate={(updates) => updateElement(element.id, updates)}
                        onDelete={() => deleteElement(element.id)}
                        isSelected={selectedElementId === element.id}
                        onSelect={() => setSelectedElementId(element.id)}
                      />
                    ))}
                  </div>

                  {/* Content Preview Area */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-orange-500" />
                      <div>
                        <div className="h-4 w-32 bg-gray-700 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-800 rounded" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="aspect-square bg-gray-800 rounded-lg" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls Panel */}
          <div className="space-y-4">
            <Tabs defaultValue="header" className="w-full">
              <TabsList className="w-full bg-gray-900 border border-gray-800">
                <TabsTrigger value="header" className="flex-1">
                  <ImageIcon className="h-4 w-4 mr-1" />
                  Header
                </TabsTrigger>
                <TabsTrigger value="colors" className="flex-1">
                  <Palette className="h-4 w-4 mr-1" />
                  Colors
                </TabsTrigger>
                <TabsTrigger value="elements" className="flex-1">
                  <Layers className="h-4 w-4 mr-1" />
                  Elements
                </TabsTrigger>
              </TabsList>

              {/* Header Tab */}
              <TabsContent value="header" className="space-y-4 mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Header Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadZone
                      label="Upload header image (1920x600 recommended)"
                      currentImage={theme.headerImage}
                      onUpload={(file) => handleFileUpload(file, 'headerImage')}
                      onRemove={() => {
                        setTheme(prev => ({ ...prev, headerImage: null }));
                        setHasChanges(true);
                      }}
                    />

                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                          Header Height: {theme.headerHeight}px
                        </label>
                        <Slider
                          value={[theme.headerHeight]}
                          onValueChange={([value]) => {
                            setTheme(prev => ({ ...prev, headerHeight: value }));
                            setHasChanges(true);
                          }}
                          min={150}
                          max={500}
                          step={10}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-sm text-gray-400">Dark Overlay</label>
                        <Switch
                          checked={theme.headerOverlay}
                          onCheckedChange={(checked) => {
                            setTheme(prev => ({ ...prev, headerOverlay: checked }));
                            setHasChanges(true);
                          }}
                        />
                      </div>

                      {theme.headerOverlay && (
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">
                            Overlay Opacity: {theme.headerOverlayOpacity}%
                          </label>
                          <Slider
                            value={[theme.headerOverlayOpacity]}
                            onValueChange={([value]) => {
                              setTheme(prev => ({ ...prev, headerOverlayOpacity: value }));
                              setHasChanges(true);
                            }}
                            min={0}
                            max={90}
                            step={5}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Logo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadZone
                      label="Upload logo (PNG with transparency)"
                      currentImage={theme.logo}
                      onUpload={(file) => handleFileUpload(file, 'logo')}
                      onRemove={() => {
                        setTheme(prev => ({ ...prev, logo: null }));
                        setHasChanges(true);
                      }}
                    />

                    {theme.logo && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <label className="text-sm text-gray-400 mb-2 block">
                            Logo Size: {theme.logoSize}px
                          </label>
                          <Slider
                            value={[theme.logoSize]}
                            onValueChange={([value]) => {
                              setTheme(prev => ({ ...prev, logoSize: value }));
                              setHasChanges(true);
                            }}
                            min={50}
                            max={300}
                            step={10}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                              X: {theme.logoPosition.x}%
                            </label>
                            <Slider
                              value={[theme.logoPosition.x]}
                              onValueChange={([value]) => {
                                setTheme(prev => ({
                                  ...prev,
                                  logoPosition: { ...prev.logoPosition, x: value }
                                }));
                                setHasChanges(true);
                              }}
                              min={0}
                              max={100}
                            />
                          </div>
                          <div>
                            <label className="text-sm text-gray-400 mb-2 block">
                              Y: {theme.logoPosition.y}%
                            </label>
                            <Slider
                              value={[theme.logoPosition.y]}
                              onValueChange={([value]) => {
                                setTheme(prev => ({
                                  ...prev,
                                  logoPosition: { ...prev.logoPosition, y: value }
                                }));
                                setHasChanges(true);
                              }}
                              min={0}
                              max={100}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Colors Tab */}
              <TabsContent value="colors" className="space-y-4 mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Theme Colors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Background Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.backgroundColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, backgroundColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={theme.backgroundColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, backgroundColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="flex-1 bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Primary Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.primaryColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, primaryColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={theme.primaryColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, primaryColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="flex-1 bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Accent Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.accentColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, accentColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={theme.accentColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, accentColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="flex-1 bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Header Overlay Color</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={theme.headerOverlayColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, headerOverlayColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="w-12 h-10 rounded cursor-pointer border-0"
                        />
                        <Input
                          value={theme.headerOverlayColor}
                          onChange={(e) => {
                            setTheme(prev => ({ ...prev, headerOverlayColor: e.target.value }));
                            setHasChanges(true);
                          }}
                          className="flex-1 bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Background Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <UploadZone
                      label="Upload background pattern/image"
                      currentImage={theme.backgroundImage}
                      onUpload={(file) => handleFileUpload(file, 'backgroundImage')}
                      onRemove={() => {
                        setTheme(prev => ({ ...prev, backgroundImage: null }));
                        setHasChanges(true);
                      }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Elements Tab */}
              <TabsContent value="elements" className="space-y-4 mt-4">
                <Card className="bg-gray-900/50 border-gray-800">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-white">Custom Elements</CardTitle>
                    <CardDescription>
                      Add images and text anywhere on your header
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                addCustomElement('image', e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          };
                          input.click();
                        }}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-700"
                        onClick={() => {
                          const text = prompt('Enter text:');
                          if (text) {
                            addCustomElement('text', text);
                          }
                        }}
                      >
                        <Type className="h-4 w-4 mr-2" />
                        Add Text
                      </Button>
                    </div>

                    {/* Element List */}
                    {theme.customElements.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {theme.customElements.map((element, index) => (
                          <div
                            key={element.id}
                            className={`
                              flex items-center gap-2 p-2 rounded-lg cursor-pointer
                              ${selectedElementId === element.id
                                ? 'bg-primary/20 border border-primary/50'
                                : 'bg-gray-800 hover:bg-gray-700'
                              }
                            `}
                            onClick={() => setSelectedElementId(element.id)}
                          >
                            <GripVertical className="h-4 w-4 text-gray-500" />
                            {element.type === 'image' ? (
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Type className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm text-gray-300 flex-1 truncate">
                              {element.type === 'text' ? element.content : `Image ${index + 1}`}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateElement(element.id, { visible: !element.visible });
                              }}
                            >
                              {element.visible ? (
                                <Eye className="h-3 w-3" />
                              ) : (
                                <EyeOff className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteElement(element.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Element Properties */}
                    {selectedElement && (
                      <Card className="bg-gray-800 border-gray-700">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xs text-gray-400">Element Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs text-gray-500">Width</label>
                              <Input
                                type="number"
                                value={selectedElement.size.width}
                                onChange={(e) => updateElement(selectedElement.id, {
                                  size: { ...selectedElement.size, width: parseInt(e.target.value) || 100 }
                                })}
                                className="h-8 bg-gray-900 border-gray-700"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500">Height</label>
                              <Input
                                type="number"
                                value={selectedElement.size.height}
                                onChange={(e) => updateElement(selectedElement.id, {
                                  size: { ...selectedElement.size, height: parseInt(e.target.value) || 100 }
                                })}
                                className="h-8 bg-gray-900 border-gray-700"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-xs text-gray-500">Layer (z-index)</label>
                            <Input
                              type="number"
                              value={selectedElement.zIndex}
                              onChange={(e) => updateElement(selectedElement.id, {
                                zIndex: parseInt(e.target.value) || 1
                              })}
                              className="h-8 bg-gray-900 border-gray-700"
                            />
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
