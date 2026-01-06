import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Settings2, 
  Save,
  RefreshCw,
  X,
  Globe,
  Search,
  Star,
  Link2,
  Layout,
  Eye,
  GripVertical,
  Plus,
  Trash2,
  Twitter,
  Instagram
} from "lucide-react";

interface FeaturedReview {
  id: string;
  author: string;
  content: string;
  rating: number;
  featured: boolean;
}

interface SocialLink {
  platform: string;
  url: string;
  enabled: boolean;
}

interface HomepageSection {
  id: string;
  name: string;
  enabled: boolean;
  order: number;
}

interface SiteSettings {
  tagline: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  featuredReviews: FeaturedReview[];
  socialLinks: SocialLink[];
  homepageSections: HomepageSection[];
  maintenanceMode: boolean;
  registrationOpen: boolean;
  creatorApplicationsOpen: boolean;
  footerText: string;
  customCss: string;
}

export default function SiteAppearance() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");

  // Fetch site settings
  const { data: settings, isLoading, refetch } = useQuery<SiteSettings>({
    queryKey: ["/api/admin/appearance"],
    queryFn: async () => {
      const res = await fetch("/api/admin/appearance");
      if (!res.ok) throw new Error("Failed to load settings");
      return res.json();
    },
  });

  // Save settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      const res = await fetch("/api/admin/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Save failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/appearance"] });
      toast({ title: "Settings saved", description: "Site appearance has been updated." });
    },
    onError: (error) => {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    },
  });

  const [formData, setFormData] = useState<Partial<SiteSettings>>({});

  // Update form when settings load
  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  if (user?.role !== "admin") {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center">
            <X className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You need admin privileges to access site appearance.</p>
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
          <div className="h-96 bg-muted rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings2 className="h-8 w-8" />
            Site Appearance
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your platform's appearance and content settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="homepage">Homepage</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>
                Basic site information and messaging
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="tagline">Site Tagline</Label>
                <Input
                  id="tagline"
                  defaultValue={settings?.tagline || ""}
                  placeholder="Your catchy tagline here..."
                  onChange={(e) => handleFieldChange("tagline", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Displayed prominently on the homepage</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Textarea
                  id="description"
                  defaultValue={settings?.description || ""}
                  placeholder="Describe your platform..."
                  rows={4}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Used in about sections and metadata</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerText">Footer Text</Label>
                <Input
                  id="footerText"
                  defaultValue={settings?.footerText || ""}
                  placeholder="© 2025 Your Platform. All rights reserved."
                  onChange={(e) => handleFieldChange("footerText", e.target.value)}
                />
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Platform Status</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-xs text-muted-foreground">Temporarily disable public access</p>
                  </div>
                  <Switch
                    checked={formData.maintenanceMode ?? settings?.maintenanceMode ?? false}
                    onCheckedChange={(checked) => handleFieldChange("maintenanceMode", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Open Registration</Label>
                    <p className="text-xs text-muted-foreground">Allow new users to sign up</p>
                  </div>
                  <Switch
                    checked={formData.registrationOpen ?? settings?.registrationOpen ?? true}
                    onCheckedChange={(checked) => handleFieldChange("registrationOpen", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Creator Applications</Label>
                    <p className="text-xs text-muted-foreground">Accept new creator applications</p>
                  </div>
                  <Switch
                    checked={formData.creatorApplicationsOpen ?? settings?.creatorApplicationsOpen ?? true}
                    onCheckedChange={(checked) => handleFieldChange("creatorApplicationsOpen", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                SEO Settings
              </CardTitle>
              <CardDescription>
                Search engine optimization and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  defaultValue={settings?.metaTitle || ""}
                  placeholder="BoyFanz - Premium Content Platform"
                  onChange={(e) => handleFieldChange("metaTitle", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Appears in browser tabs and search results (50-60 chars)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  defaultValue={settings?.metaDescription || ""}
                  placeholder="Discover exclusive content from your favorite creators..."
                  rows={3}
                  onChange={(e) => handleFieldChange("metaDescription", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Shown in search results (150-160 chars)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaKeywords">Meta Keywords</Label>
                <Input
                  id="metaKeywords"
                  defaultValue={settings?.metaKeywords || ""}
                  placeholder="creator, content, subscription, exclusive"
                  onChange={(e) => handleFieldChange("metaKeywords", e.target.value)}
                />
                <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
              </div>

              {/* SEO Preview */}
              <div className="border rounded-lg p-4 bg-muted/50">
                <h4 className="text-sm font-medium mb-3">Search Preview</h4>
                <div className="space-y-1">
                  <p className="text-blue-600 hover:underline cursor-pointer">
                    {formData.metaTitle || settings?.metaTitle || "BoyFanz - Premium Content Platform"}
                  </p>
                  <p className="text-green-700 text-sm">https://boy.fanz.website</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {formData.metaDescription || settings?.metaDescription || "Your site description will appear here..."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="homepage" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="h-5 w-5" />
                Homepage Sections
              </CardTitle>
              <CardDescription>
                Configure which sections appear on your homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(settings?.homepageSections || [
                  { id: "hero", name: "Hero Banner", enabled: true, order: 1 },
                  { id: "featured", name: "Featured Creators", enabled: true, order: 2 },
                  { id: "categories", name: "Categories Grid", enabled: true, order: 3 },
                  { id: "trending", name: "Trending Content", enabled: true, order: 4 },
                  { id: "reviews", name: "User Reviews", enabled: false, order: 5 },
                  { id: "cta", name: "Call to Action", enabled: true, order: 6 },
                ]).map((section) => (
                  <div key={section.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
                      <div>
                        <p className="font-medium">{section.name}</p>
                        <p className="text-xs text-muted-foreground">Order: {section.order}</p>
                      </div>
                    </div>
                    <Switch defaultChecked={section.enabled} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Featured Reviews
              </CardTitle>
              <CardDescription>
                Testimonials displayed on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(settings?.featuredReviews || []).map((review, index) => (
                  <div key={review.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{review.author}</p>
                        <div className="flex items-center gap-1 my-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted"}`} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground">{review.content}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                Social Links
              </CardTitle>
              <CardDescription>
                Connect your social media profiles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { platform: "twitter", icon: Twitter, label: "Twitter/X" },
                  { platform: "instagram", icon: Instagram, label: "Instagram" },
                ].map(({ platform, icon: Icon, label }) => (
                  <div key={platform} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <Label>{label}</Label>
                      <Input
                        placeholder={`https://${platform}.com/yourprofile`}
                        defaultValue={settings?.socialLinks?.find(s => s.platform === platform)?.url || ""}
                      />
                    </div>
                    <Switch 
                      defaultChecked={settings?.socialLinks?.find(s => s.platform === platform)?.enabled ?? false} 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Custom CSS
              </CardTitle>
              <CardDescription>
                Add custom styles to your platform (advanced users only)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                className="font-mono text-sm"
                rows={10}
                placeholder="/* Add your custom CSS here */&#10;.custom-class {&#10;  color: #e94560;&#10;}"
                defaultValue={settings?.customCss || ""}
                onChange={(e) => handleFieldChange("customCss", e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Warning: Invalid CSS may break your site's appearance
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
