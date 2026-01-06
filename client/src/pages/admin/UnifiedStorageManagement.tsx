import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  Cloud,
  HardDrive,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Settings,
  BarChart3,
  Trash2,
  RefreshCw,
  Database,
  DollarSign,
  Activity,
  Shield,
  Globe,
} from "lucide-react";

// Provider types
type StorageProvider =
  | "bunnycdn"
  | "contabo"
  | "scaleway"
  | "idrive-e2"
  | "storj"
  | "fanzcloud"
  | "aws-s3"
  | "digitalocean"
  | "wasabi"
  | "backblaze"
  | "vultr"
  | "pushr";

interface ProviderConfig {
  id: string;
  provider: StorageProvider;
  name: string;
  enabled: boolean;
  isPrimary: boolean;
  credentials: Record<string, string>;
  settings: {
    region?: string;
    bucket?: string;
    endpoint?: string;
    storageZone?: string;
    pullZone?: string;
    streamingLibrary?: string;
  };
  stats?: {
    totalStorage: number;
    usedStorage: number;
    bandwidth: number;
    files: number;
  };
  health?: {
    status: "healthy" | "degraded" | "down";
    lastCheck: string;
    uptime: number;
    latency: number;
  };
  cost?: {
    monthly: number;
    storage: number;
    bandwidth: number;
    operations: number;
  };
}

interface Alert {
  id: string;
  provider: StorageProvider;
  severity: "info" | "warning" | "error";
  message: string;
  timestamp: string;
  resolved: boolean;
}

// Provider metadata
const PROVIDER_INFO: Record<StorageProvider, {
  name: string;
  icon: string;
  description: string;
  adultFriendly: boolean;
  pricing: string;
  features: string[];
}> = {
  bunnycdn: {
    name: "Bunny CDN",
    icon: "🐰",
    description: "High-performance CDN with edge storage and streaming",
    adultFriendly: true,
    pricing: "$0.01/GB storage, $0.01/GB bandwidth",
    features: ["Edge Storage", "Video Streaming", "Image Optimization", "Global CDN"]
  },
  contabo: {
    name: "Contabo Object Storage",
    icon: "🇪🇺",
    description: "European provider with adult-friendly policies",
    adultFriendly: true,
    pricing: "$2.49/TB storage, $1.00/TB bandwidth",
    features: ["S3 Compatible", "EU Data Centers", "High Storage Limits", "Adult Content OK"]
  },
  scaleway: {
    name: "Scaleway Object Storage",
    icon: "🇫🇷",
    description: "French provider with competitive pricing",
    adultFriendly: true,
    pricing: "$0.01/GB storage, $0.01/GB bandwidth",
    features: ["S3 Compatible", "Multi-AZ", "Glacier Storage", "GDPR Compliant"]
  },
  "idrive-e2": {
    name: "iDrive e2",
    icon: "💾",
    description: "S3-compatible storage with adult content support",
    adultFriendly: true,
    pricing: "$0.004/GB storage, Free egress",
    features: ["S3 Compatible", "Free Bandwidth", "Immutable Storage", "Adult Friendly"]
  },
  storj: {
    name: "Storj",
    icon: "🌐",
    description: "Decentralized cloud storage",
    adultFriendly: true,
    pricing: "$0.004/GB storage, $0.007/GB bandwidth",
    features: ["Decentralized", "End-to-End Encryption", "S3 Compatible", "No Censorship"]
  },
  fanzcloud: {
    name: "FanzCloud (pCloud)",
    icon: "☁️",
    description: "Secure Swiss cloud storage",
    adultFriendly: true,
    pricing: "Lifetime plans available",
    features: ["Lifetime Storage", "Client-Side Encryption", "EU Servers", "Media Streaming"]
  },
  "aws-s3": {
    name: "Amazon S3",
    icon: "🔶",
    description: "Industry-standard object storage",
    adultFriendly: false,
    pricing: "$0.023/GB storage, $0.09/GB bandwidth",
    features: ["Global Infrastructure", "Versioning", "Lifecycle Policies", "IAM Integration"]
  },
  digitalocean: {
    name: "DigitalOcean Spaces",
    icon: "🌊",
    description: "Simple, scalable object storage",
    adultFriendly: false,
    pricing: "$5/month (250GB + 1TB bandwidth)",
    features: ["S3 Compatible", "CDN Included", "Simple Pricing", "Easy Setup"]
  },
  wasabi: {
    name: "Wasabi",
    icon: "🔥",
    description: "Hot cloud storage with no egress fees",
    adultFriendly: false,
    pricing: "$5.99/TB storage, Free egress",
    features: ["No Egress Fees", "S3 Compatible", "Immutable Storage", "Fast Performance"]
  },
  backblaze: {
    name: "Backblaze B2",
    icon: "💿",
    description: "Affordable cloud storage",
    adultFriendly: false,
    pricing: "$0.005/GB storage, $0.01/GB bandwidth",
    features: ["Low Cost", "S3 Compatible", "Free CDN", "Easy Integration"]
  },
  vultr: {
    name: "Vultr Object Storage",
    icon: "⚡",
    description: "High-performance object storage",
    adultFriendly: false,
    pricing: "$5/month (250GB + 1TB bandwidth)",
    features: ["S3 Compatible", "Global Locations", "NVMe Storage", "Low Latency"]
  },
  pushr: {
    name: "Pushr",
    icon: "📤",
    description: "Video streaming and storage",
    adultFriendly: false,
    pricing: "Custom pricing",
    features: ["Video Platform", "Adaptive Streaming", "Analytics", "Monetization"]
  }
};

export default function UnifiedStorageManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<StorageProvider | null>(null);
  const [showAdultFriendlyOnly, setShowAdultFriendlyOnly] = useState(true);

  // Fetch all provider configurations
  const { data: providers = [], isLoading: loadingProviders } = useQuery<ProviderConfig[]>({
    queryKey: ["/api/admin/storage-providers"],
  });

  // Fetch alerts
  const { data: alerts = [], isLoading: loadingAlerts } = useQuery<Alert[]>({
    queryKey: ["/api/admin/storage-providers/alerts"],
  });

  // Fetch global settings
  const { data: globalSettings } = useQuery({
    queryKey: ["/api/admin/storage/settings"],
  });

  // Filter providers based on adult-friendly toggle
  const filteredProviders = providers.filter(p =>
    !showAdultFriendlyOnly || PROVIDER_INFO[p.provider]?.adultFriendly
  );

  // Calculate totals
  const totalStats = providers.reduce((acc, provider) => {
    const stats = provider.stats || { totalStorage: 0, usedStorage: 0, bandwidth: 0, files: 0 };
    return {
      totalStorage: acc.totalStorage + stats.totalStorage,
      usedStorage: acc.usedStorage + stats.usedStorage,
      bandwidth: acc.bandwidth + stats.bandwidth,
      files: acc.files + stats.files,
    };
  }, { totalStorage: 0, usedStorage: 0, bandwidth: 0, files: 0 });

  const totalCost = providers.reduce((acc, p) => acc + (p.cost?.monthly || 0), 0);

  // Mutations
  const updateProviderMutation = useMutation({
    mutationFn: async (config: Partial<ProviderConfig> & { id: string }) => {
      const res = await fetch(`/api/admin/storage-providers/${config.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/storage-providers"] });
      toast({ title: "Provider updated successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update provider", description: error.message, variant: "destructive" });
    },
  });

  const testProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const res = await fetch(`/api/admin/storage-providers/${providerId}/test`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Provider connection test successful" });
    },
    onError: (error: Error) => {
      toast({ title: "Provider connection test failed", description: error.message, variant: "destructive" });
    },
  });

  const purgeProviderCacheMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const res = await fetch(`/api/admin/storage-providers/${providerId}/purge-cache`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cache purged successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to purge cache", description: error.message, variant: "destructive" });
    },
  });

  const setPrimaryProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const res = await fetch(`/api/admin/storage-providers/${providerId}/set-primary`, {
        method: "PUT",
        credentials: "include",
      });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/storage-providers"] });
      toast({ title: "Primary provider updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to set primary provider", description: error.message, variant: "destructive" });
    },
  });

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Storage Management</h1>
          <p className="text-muted-foreground">
            Unified multi-cloud storage and CDN management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <Label htmlFor="adult-friendly">Adult-Friendly Only</Label>
            <Switch
              id="adult-friendly"
              checked={showAdultFriendlyOnly}
              onCheckedChange={setShowAdultFriendlyOnly}
            />
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalStats.usedStorage)}</div>
            <p className="text-xs text-muted-foreground">
              of {formatBytes(totalStats.totalStorage)}
            </p>
            <Progress
              value={(totalStats.usedStorage / totalStats.totalStorage) * 100}
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Bandwidth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(totalStats.bandwidth)}</div>
            <p className="text-xs text-muted-foreground">Across all providers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.files.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {providers.filter(p => p.enabled).length} active providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">Projected monthly total</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <Card className="border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Active Alerts ({alerts.filter(a => !a.resolved).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.filter(a => !a.resolved).slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    alert.severity === "error" ? "destructive" :
                    alert.severity === "warning" ? "outline" : "default"
                  }>
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="font-medium">{PROVIDER_INFO[alert.provider]?.name}</p>
                    <p className="text-sm text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Provider Status Grid */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Status</CardTitle>
                <CardDescription>Active storage providers and their health</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {filteredProviders.map((provider) => {
                  const info = PROVIDER_INFO[provider.provider];
                  const usagePercent = provider.stats
                    ? (provider.stats.usedStorage / provider.stats.totalStorage) * 100
                    : 0;

                  return (
                    <div key={provider.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{info.icon}</span>
                          <div>
                            <p className="font-medium">{info.name}</p>
                            <div className="flex items-center gap-2">
                              {provider.isPrimary && (
                                <Badge variant="default" className="text-xs">Primary</Badge>
                              )}
                              {provider.health?.status === "healthy" && (
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                              )}
                              {provider.health?.status === "degraded" && (
                                <AlertTriangle className="h-3 w-3 text-orange-500" />
                              )}
                              {provider.health?.status === "down" && (
                                <XCircle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {provider.stats ? formatBytes(provider.stats.usedStorage) : "N/A"}
                          </p>
                          <p className="text-muted-foreground">
                            {usagePercent.toFixed(1)}% used
                          </p>
                        </div>
                      </div>
                      <Progress value={usagePercent} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Available Providers */}
            <Card>
              <CardHeader>
                <CardTitle>Available Providers</CardTitle>
                <CardDescription>
                  {showAdultFriendlyOnly ? "Adult-friendly" : "All"} storage providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(PROVIDER_INFO)
                  .filter(([_, info]) => !showAdultFriendlyOnly || info.adultFriendly)
                  .map(([key, info]) => {
                    const provider = key as StorageProvider;
                    const isConfigured = providers.some(p => p.provider === provider);

                    return (
                      <div key={provider} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{info.icon}</span>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{info.name}</p>
                              {info.adultFriendly && (
                                <Badge variant="outline" className="text-xs">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Adult-Friendly
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{info.description}</p>
                            <p className="text-xs font-mono">{info.pricing}</p>
                          </div>
                        </div>
                        {isConfigured ? (
                          <Badge variant="default">Configured</Badge>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedProvider(provider)}
                          >
                            Configure
                          </Button>
                        )}
                      </div>
                    );
                  })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-4">
          <ProviderConfiguration
            providers={filteredProviders}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
            onUpdateProvider={(config) => updateProviderMutation.mutate(config)}
            onTestProvider={(id) => testProviderMutation.mutate(id)}
            onSetPrimary={(id) => setPrimaryProviderMutation.mutate(id)}
            onPurgeCache={(id) => purgeProviderCacheMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <HealthMonitoring providers={filteredProviders} />
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <CostAnalysis providers={filteredProviders} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <GlobalSettings settings={globalSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Sub-components for each tab
function ProviderConfiguration({
  providers,
  selectedProvider,
  onSelectProvider,
  onUpdateProvider,
  onTestProvider,
  onSetPrimary,
  onPurgeCache
}: {
  providers: ProviderConfig[];
  selectedProvider: StorageProvider | null;
  onSelectProvider: (provider: StorageProvider | null) => void;
  onUpdateProvider: (config: Partial<ProviderConfig> & { id: string }) => void;
  onTestProvider: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onPurgeCache: (id: string) => void;
}) {
  const [editingProvider, setEditingProvider] = useState<ProviderConfig | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Provider List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Configured Providers</CardTitle>
          <CardDescription>Click to edit configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {providers.map((provider) => {
            const info = PROVIDER_INFO[provider.provider];
            return (
              <Button
                key={provider.id}
                variant={editingProvider?.id === provider.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setEditingProvider(provider)}
              >
                <span className="mr-2">{info.icon}</span>
                {info.name}
                {provider.isPrimary && <Badge className="ml-auto" variant="secondary">Primary</Badge>}
              </Button>
            );
          })}
        </CardContent>
      </Card>

      {/* Provider Configuration Form */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>
            {editingProvider
              ? `Configure ${PROVIDER_INFO[editingProvider.provider].name}`
              : "Select a provider to configure"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {editingProvider ? (
            <ProviderConfigForm
              provider={editingProvider}
              onSave={onUpdateProvider}
              onTest={onTestProvider}
              onSetPrimary={onSetPrimary}
              onPurgeCache={onPurgeCache}
            />
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Select a provider from the list to edit its configuration
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProviderConfigForm({
  provider,
  onSave,
  onTest,
  onSetPrimary,
  onPurgeCache
}: {
  provider: ProviderConfig;
  onSave: (config: Partial<ProviderConfig> & { id: string }) => void;
  onTest: (id: string) => void;
  onSetPrimary: (id: string) => void;
  onPurgeCache: (id: string) => void;
}) {
  const [formData, setFormData] = useState(provider);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Render provider-specific fields
  const renderProviderFields = () => {
    switch (provider.provider) {
      case "bunnycdn":
        return (
          <>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={formData.credentials.apiKey || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, apiKey: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Storage Zone</Label>
              <Input
                value={formData.settings.storageZone || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, storageZone: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Pull Zone URL</Label>
              <Input
                value={formData.settings.pullZone || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, pullZone: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Streaming Library (Optional)</Label>
              <Input
                value={formData.settings.streamingLibrary || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, streamingLibrary: e.target.value }
                })}
              />
            </div>
          </>
        );

      case "contabo":
      case "scaleway":
      case "idrive-e2":
      case "storj":
      case "aws-s3":
      case "digitalocean":
      case "wasabi":
      case "backblaze":
      case "vultr":
        return (
          <>
            <div className="space-y-2">
              <Label>Access Key ID</Label>
              <Input
                value={formData.credentials.accessKeyId || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, accessKeyId: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Secret Access Key</Label>
              <Input
                type="password"
                value={formData.credentials.secretAccessKey || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, secretAccessKey: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Bucket Name</Label>
              <Input
                value={formData.settings.bucket || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, bucket: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input
                placeholder="e.g., https://s3.eu-central-1.wasabisys.com"
                value={formData.settings.endpoint || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, endpoint: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Region</Label>
              <Input
                value={formData.settings.region || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  settings: { ...formData.settings, region: e.target.value }
                })}
              />
            </div>
          </>
        );

      case "fanzcloud":
        return (
          <>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={formData.credentials.username || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, username: e.target.value }
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={formData.credentials.password || ""}
                onChange={(e) => setFormData({
                  ...formData,
                  credentials: { ...formData.credentials, password: e.target.value }
                })}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Provider Enabled</Label>
          <Switch
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
          />
        </div>

        {renderProviderFields()}

        <Separator />

        <div className="flex gap-2">
          <Button type="submit" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Save Configuration
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => onTest(provider.id)}
          >
            <Activity className="mr-2 h-4 w-4" />
            Test Connection
          </Button>
        </div>

        <div className="flex gap-2">
          {!provider.isPrimary && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSetPrimary(provider.id)}
              className="flex-1"
            >
              Set as Primary
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onPurgeCache(provider.id)}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Purge Cache
          </Button>
        </div>
      </div>
    </form>
  );
}

function HealthMonitoring({ providers }: { providers: ProviderConfig[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {providers.map((provider) => {
        const info = PROVIDER_INFO[provider.provider];
        const health = provider.health;

        return (
          <Card key={provider.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <span>{info.icon}</span>
                  {info.name}
                </CardTitle>
                {health?.status === "healthy" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                )}
                {health?.status === "degraded" && (
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                )}
                {health?.status === "down" && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={
                  health?.status === "healthy" ? "default" :
                  health?.status === "degraded" ? "outline" : "destructive"
                }>
                  {health?.status || "Unknown"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uptime</span>
                <span className="font-medium">{health?.uptime?.toFixed(2)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Latency</span>
                <span className="font-medium">{health?.latency}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Last Check</span>
                <span className="text-xs">{health?.lastCheck ? new Date(health.lastCheck).toLocaleTimeString() : "Never"}</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function CostAnalysis({ providers }: { providers: ProviderConfig[] }) {
  const totalCost = providers.reduce((acc, p) => acc + (p.cost?.monthly || 0), 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Total Monthly Cost</CardTitle>
          <CardDescription>Projected costs across all providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{formatCurrency(totalCost)}</div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const info = PROVIDER_INFO[provider.provider];
          const cost = provider.cost;

          return (
            <Card key={provider.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{info.icon}</span>
                  {info.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold">{formatCurrency(cost?.monthly || 0)}</span>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Storage</span>
                    <span>{formatCurrency(cost?.storage || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bandwidth</span>
                    <span>{formatCurrency(cost?.bandwidth || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Operations</span>
                    <span>{formatCurrency(cost?.operations || 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function GlobalSettings({ settings }: { settings: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Storage Settings</CardTitle>
        <CardDescription>Configure default storage behavior</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-Backup</Label>
              <p className="text-sm text-muted-foreground">
                Automatically backup content to secondary providers
              </p>
            </div>
            <Switch defaultChecked={settings?.autoBackup} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Signed URLs</Label>
              <p className="text-sm text-muted-foreground">
                Generate signed URLs for secure content access
              </p>
            </div>
            <Switch defaultChecked={settings?.signedUrls} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>CDN Caching</Label>
              <p className="text-sm text-muted-foreground">
                Enable edge caching for faster content delivery
              </p>
            </div>
            <Switch defaultChecked={settings?.cdnCaching} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Default Upload Provider</Label>
            <Select defaultValue={settings?.defaultProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select default provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bunnycdn">Bunny CDN</SelectItem>
                <SelectItem value="contabo">Contabo</SelectItem>
                <SelectItem value="scaleway">Scaleway</SelectItem>
                <SelectItem value="idrive-e2">iDrive e2</SelectItem>
                <SelectItem value="storj">Storj</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Cache TTL (seconds)</Label>
            <Input
              type="number"
              defaultValue={settings?.cacheTTL || 3600}
              placeholder="3600"
            />
          </div>

          <Button className="w-full">
            <Settings className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
