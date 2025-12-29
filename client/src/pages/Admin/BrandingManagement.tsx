/**
 * Branding Management - Platform branding assets
 */

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function BrandingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [colors, setColors] = useState({
    primary: "#6366f1",
    secondary: "#8b5cf6",
    accent: "#ec4899",
    background: "#0f0f23",
    surface: "#1a1a2e"
  });

  // Fetch branding
  const { data: branding, isLoading } = useQuery({
    queryKey: ["/api/admin/branding"],
    queryFn: async () => {
      const res = await fetch("/api/admin/branding");
      const data = await res.json();
      if (data.branding?.colors) {
        setColors(data.branding.colors);
      }
      return data.branding;
    }
  });

  // Upload asset mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ type, file }: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append(type, file);

      const res = await fetch(`/api/admin/branding/${type}`, {
        method: "POST",
        body: formData
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Asset uploaded successfully" });
      setSelectedAsset(null);
    },
    onError: () => {
      toast({ title: "Failed to upload asset", variant: "destructive" });
    }
  });

  // Update colors mutation
  const updateColorsMutation = useMutation({
    mutationFn: async (newColors: typeof colors) => {
      const res = await fetch("/api/admin/branding/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newColors)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Colors updated successfully" });
    }
  });

  // Update watermark mutation
  const updateWatermarkMutation = useMutation({
    mutationFn: async (settings: { opacity?: number; position?: string; enabled?: boolean }) => {
      const res = await fetch("/api/admin/branding/watermark", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Watermark settings updated" });
    }
  });

  const handleFileSelect = (type: string) => {
    setSelectedAsset(type);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedAsset) {
      uploadMutation.mutate({ type: selectedAsset, file });
    }
    e.target.value = "";
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Branding Management</h1>
          <p className="text-gray-400">Manage platform visual identity and assets</p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (confirm("Reset all branding to defaults?")) {
              fetch("/api/admin/branding/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ asset: "all" })
              }).then(() => queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] }));
            }
          }}
        >
          <i className="fas fa-undo mr-2" />
          Reset to Defaults
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <Tabs defaultValue="assets" className="space-y-4">
        <TabsList>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="colors">Colors</TabsTrigger>
          <TabsTrigger value="watermark">Watermark</TabsTrigger>
          <TabsTrigger value="fonts">Fonts</TabsTrigger>
        </TabsList>

        {/* Assets Tab */}
        <TabsContent value="assets" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo */}
            <Card>
              <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Main platform logo (recommended: 200x60px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center min-h-[120px]">
                  {branding?.logo?.url ? (
                    <img
                      src={branding.logo.url}
                      alt="Logo"
                      className="max-h-16 object-contain"
                    />
                  ) : (
                    <div className="text-gray-500">No logo uploaded</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFileSelect("logo")}
                    disabled={uploadMutation.isPending}
                    className="flex-1"
                  >
                    <i className="fas fa-upload mr-2" />
                    Upload Logo
                  </Button>
                  {branding?.logo?.url && (
                    <Button variant="outline" size="icon">
                      <i className="fas fa-trash text-red-500" />
                    </Button>
                  )}
                </div>
                {branding?.logo?.updatedAt && (
                  <p className="text-xs text-gray-500">
                    Last updated: {new Date(branding.logo.updatedAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Favicon */}
            <Card>
              <CardHeader>
                <CardTitle>Favicon</CardTitle>
                <CardDescription>Browser tab icon (recommended: 32x32px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center min-h-[120px]">
                  {branding?.favicon?.url ? (
                    <img
                      src={branding.favicon.url}
                      alt="Favicon"
                      className="w-8 h-8"
                    />
                  ) : (
                    <div className="text-gray-500">No favicon uploaded</div>
                  )}
                </div>
                <Button
                  onClick={() => handleFileSelect("favicon")}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2" />
                  Upload Favicon
                </Button>
              </CardContent>
            </Card>

            {/* Hero Image */}
            <Card>
              <CardHeader>
                <CardTitle>Hero Image</CardTitle>
                <CardDescription>Homepage banner (recommended: 1920x600px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg overflow-hidden min-h-[150px]">
                  {branding?.heroImage?.url ? (
                    <img
                      src={branding.heroImage.url}
                      alt="Hero"
                      className="w-full h-[150px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[150px] text-gray-500">
                      No hero image uploaded
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleFileSelect("hero")}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2" />
                  Upload Hero Image
                </Button>
              </CardContent>
            </Card>

            {/* OG Image */}
            <Card>
              <CardHeader>
                <CardTitle>Social Share Image</CardTitle>
                <CardDescription>Open Graph image (recommended: 1200x630px)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-800 rounded-lg overflow-hidden min-h-[150px]">
                  {branding?.ogImage?.url ? (
                    <img
                      src={branding.ogImage.url}
                      alt="OG Image"
                      className="w-full h-[150px] object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-[150px] text-gray-500">
                      No OG image uploaded
                    </div>
                  )}
                </div>
                <Button
                  onClick={() => handleFileSelect("og-image")}
                  disabled={uploadMutation.isPending}
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2" />
                  Upload OG Image
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Colors</CardTitle>
              <CardDescription>Customize your platform's color scheme</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="capitalize">{key.replace(/([A-Z])/g, " $1")}</Label>
                    <div className="flex gap-2">
                      <div
                        className="w-12 h-10 rounded-md border cursor-pointer"
                        style={{ backgroundColor: value }}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "color";
                          input.value = value;
                          input.onchange = (e) => {
                            setColors({ ...colors, [key]: (e.target as HTMLInputElement).value });
                          };
                          input.click();
                        }}
                      />
                      <Input
                        value={value}
                        onChange={(e) => setColors({ ...colors, [key]: e.target.value })}
                        className="font-mono"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex gap-4">
                  <div className="flex gap-2 items-center">
                    {Object.values(colors).map((color, i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Preview</span>
                </div>
                <Button
                  onClick={() => updateColorsMutation.mutate(colors)}
                  disabled={updateColorsMutation.isPending}
                >
                  <i className="fas fa-save mr-2" />
                  Save Colors
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Watermark Tab */}
        <TabsContent value="watermark" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Watermark</CardTitle>
              <CardDescription>Protect your content with automatic watermarking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Watermark</Label>
                  <p className="text-sm text-gray-400">Apply watermark to all uploaded content</p>
                </div>
                <Switch
                  checked={branding?.watermark?.enabled ?? true}
                  onCheckedChange={(enabled) => updateWatermarkMutation.mutate({ enabled })}
                />
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-6 flex items-center justify-center min-h-[100px]">
                  {branding?.watermark?.url ? (
                    <img
                      src={branding.watermark.url}
                      alt="Watermark"
                      className="max-h-16 opacity-50"
                    />
                  ) : (
                    <div className="text-gray-500">No watermark image</div>
                  )}
                </div>
                <Button
                  onClick={() => handleFileSelect("watermark/image")}
                  disabled={uploadMutation.isPending}
                  variant="outline"
                  className="w-full"
                >
                  <i className="fas fa-upload mr-2" />
                  Upload Watermark Image
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Opacity: {Math.round((branding?.watermark?.opacity ?? 0.3) * 100)}%</Label>
                  <Slider
                    value={[(branding?.watermark?.opacity ?? 0.3) * 100]}
                    min={10}
                    max={80}
                    step={5}
                    onValueChange={([val]) => updateWatermarkMutation.mutate({ opacity: val / 100 })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Position</Label>
                  <Select
                    value={branding?.watermark?.position ?? "bottom-right"}
                    onValueChange={(position) => updateWatermarkMutation.mutate({ position })}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fonts Tab */}
        <TabsContent value="fonts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typography</CardTitle>
              <CardDescription>Customize fonts used across the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Heading Font</Label>
                  <Select defaultValue={branding?.fonts?.heading ?? "Inter"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                      <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400">Used for titles and headings</p>
                </div>

                <div className="space-y-2">
                  <Label>Body Font</Label>
                  <Select defaultValue={branding?.fonts?.body ?? "Inter"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Lato">Lato</SelectItem>
                      <SelectItem value="Source Sans Pro">Source Sans Pro</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-400">Used for body text and UI</p>
                </div>
              </div>

              <div className="p-4 bg-gray-800 rounded-lg space-y-2">
                <h3 className="text-xl font-bold" style={{ fontFamily: branding?.fonts?.heading }}>
                  Preview Heading Text
                </h3>
                <p style={{ fontFamily: branding?.fonts?.body }}>
                  This is how your body text will look across the platform. Make sure it's easy to read.
                </p>
              </div>

              <Button className="w-full">
                <i className="fas fa-save mr-2" />
                Save Font Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
