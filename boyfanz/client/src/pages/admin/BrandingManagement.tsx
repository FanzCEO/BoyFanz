import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Image, 
  Upload, 
  Trash2, 
  RefreshCw, 
  Check,
  X,
  Palette,
  Globe,
  Smartphone
} from "lucide-react";
import { useDropzone } from "react-dropzone";

interface BrandingAsset {
  id: string;
  type: "logo" | "favicon" | "hero" | "banner" | "og_image";
  url: string;
  filename: string;
  size: number;
  uploadedAt: string;
  dimensions?: { width: number; height: number };
}

interface BrandingConfig {
  platformName: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  assets: BrandingAsset[];
}

export default function BrandingManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch branding config
  const { data: branding, isLoading, refetch } = useQuery<BrandingConfig>({
    queryKey: ["/api/admin/branding"],
    queryFn: async () => {
      const res = await fetch("/api/admin/branding");
      if (!res.ok) throw new Error("Failed to load branding");
      return res.json();
    },
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      const res = await fetch("/api/admin/branding/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Asset uploaded", description: "Branding asset has been updated successfully." });
      setUploadingType(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      setUploadingType(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const res = await fetch(`/api/admin/branding/${assetId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Asset deleted", description: "Branding asset has been removed." });
    },
  });

  // Update colors mutation
  const updateColorsMutation = useMutation({
    mutationFn: async (colors: { primaryColor: string; secondaryColor: string }) => {
      const res = await fetch("/api/admin/branding/colors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(colors),
      });
      if (!res.ok) throw new Error("Update failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/branding"] });
      toast({ title: "Colors updated", description: "Platform colors have been updated." });
    },
  });

  // Dropzone for file uploads
  const onDrop = useCallback((acceptedFiles: File[], type: string) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setPreviewUrl(URL.createObjectURL(file));
      setUploadingType(type);
      uploadMutation.mutate({ file, type });
    }
  }, [uploadMutation]);

  const AssetUploader = ({ type, label, recommended }: { type: string; label: string; recommended: string }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (files) => onDrop(files, type),
      accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"] },
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    const asset = branding?.assets?.find(a => a.type === type);

    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Image className="h-5 w-5" />
            {label}
          </CardTitle>
          <CardDescription>{recommended}</CardDescription>
        </CardHeader>
        <CardContent>
          {asset ? (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border bg-muted">
                <img 
                  src={asset.url} 
                  alt={label}
                  className="w-full h-40 object-contain"
                />
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{asset.filename}</span>
                <span>{(asset.size / 1024).toFixed(1)} KB</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  {...getRootProps()}
                >
                  <input {...getInputProps()} />
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Replace
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => deleteMutation.mutate(asset.id)}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          ) : (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? "Drop file here..." : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, SVG up to 10MB</p>
            </div>
          )}
          {uploadingType === type && uploadMutation.isPending && (
            <div className="mt-3 flex items-center gap-2 text-sm text-primary">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Uploading...
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <X className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access branding management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-64 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Palette className="h-8 w-8" />
            Branding Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your platform's visual identity and branding assets
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Brand Colors
          </CardTitle>
          <CardDescription>
            Configure your platform's primary and secondary colors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  defaultValue={branding?.primaryColor || "#e94560"}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  defaultValue={branding?.primaryColor || "#e94560"}
                  placeholder="#e94560"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  defaultValue={branding?.secondaryColor || "#0f3460"}
                  className="w-16 h-10 p-1 cursor-pointer"
                />
                <Input
                  defaultValue={branding?.secondaryColor || "#0f3460"}
                  placeholder="#0f3460"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <Button className="mt-4" onClick={() => updateColorsMutation.mutate({
            primaryColor: (document.getElementById("primaryColor") as HTMLInputElement)?.value || "#e94560",
            secondaryColor: (document.getElementById("secondaryColor") as HTMLInputElement)?.value || "#0f3460",
          })}>
            <Check className="h-4 w-4 mr-2" />
            Save Colors
          </Button>
        </CardContent>
      </Card>

      {/* Asset Uploaders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AssetUploader 
          type="logo" 
          label="Platform Logo" 
          recommended="Recommended: 512x512px PNG with transparency"
        />
        <AssetUploader 
          type="favicon" 
          label="Favicon" 
          recommended="Recommended: 32x32px or 64x64px PNG/ICO"
        />
        <AssetUploader 
          type="hero" 
          label="Hero Image" 
          recommended="Recommended: 1920x600px JPG/PNG"
        />
        <AssetUploader 
          type="banner" 
          label="Banner Image" 
          recommended="Recommended: 1200x300px JPG/PNG"
        />
        <AssetUploader 
          type="og_image" 
          label="Social Share Image" 
          recommended="Recommended: 1200x630px for OpenGraph"
        />
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Live Preview
          </CardTitle>
          <CardDescription>
            See how your branding looks across different contexts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Desktop Header Preview
              </h4>
              <div className="bg-background border rounded-lg p-3 flex items-center gap-3">
                {branding?.assets?.find(a => a.type === "logo") ? (
                  <img 
                    src={branding.assets.find(a => a.type === "logo")?.url} 
                    alt="Logo" 
                    className="h-10 w-auto"
                  />
                ) : (
                  <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
                    <Image className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <span className="font-bold text-lg">{branding?.platformName || "BoyFanz"}</span>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Header Preview
              </h4>
              <div className="bg-background border rounded-lg p-2 flex items-center gap-2 max-w-[200px]">
                {branding?.assets?.find(a => a.type === "logo") ? (
                  <img 
                    src={branding.assets.find(a => a.type === "logo")?.url} 
                    alt="Logo" 
                    className="h-8 w-auto"
                  />
                ) : (
                  <div className="h-8 w-8 bg-muted rounded flex items-center justify-center">
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}
                <span className="font-bold text-sm truncate">{branding?.platformName || "BoyFanz"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
