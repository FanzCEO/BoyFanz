// @ts-nocheck
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface StorageProvider {
  id: string;
  name: string;
  type: 'bunny' | 'fanzcloud' | 's3' | 'gcs';
  status: 'active' | 'inactive' | 'error';
  isDefault: boolean;
  usedBytes: number;
  totalBytes: number;
  features: string[];
  config: Record<string, any>;
}

interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  provider: string;
  createdAt: string;
  cdnUrl?: string;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function CloudStorage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configForm, setConfigForm] = useState<Record<string, string>>({});

  // Fetch Bunny CDN status
  const { data: bunnyStatus } = useQuery({
    queryKey: ["/api/bunny/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bunny/status");
      return res.json();
    },
  });

  // Fetch FanzCloud status
  const { data: fanzCloudStatus } = useQuery({
    queryKey: ["/api/fanzcloud/health"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/fanzcloud/health");
      return res.json();
    },
  });

  // Fetch Bunny CDN stats
  const { data: bunnyStats } = useQuery({
    queryKey: ["/api/bunny/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/bunny/stats");
      return res.json();
    },
    enabled: bunnyStatus?.data?.initialized,
  });

  // Fetch FanzCloud quota
  const { data: fanzCloudQuota } = useQuery({
    queryKey: ["/api/fanzcloud/quota"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/fanzcloud/quota");
      return res.json();
    },
    enabled: fanzCloudStatus?.configured,
  });

  // Build provider list from status
  const providers: StorageProvider[] = [
    {
      id: 'bunny',
      name: 'Bunny CDN',
      type: 'bunny',
      status: bunnyStatus?.data?.initialized ? 'active' : 'inactive',
      isDefault: true,
      usedBytes: bunnyStats?.data?.StorageUsed || 0,
      totalBytes: bunnyStats?.data?.StorageQuota || 50 * 1024 * 1024 * 1024, // 50GB default
      features: [
        'Edge Caching',
        'HLS Streaming',
        'Signed URLs',
        'Cache Purging',
        'Global CDN',
      ],
      config: bunnyStatus?.data || {},
    },
    {
      id: 'fanzcloud',
      name: 'FanzCloud (pCloud)',
      type: 'fanzcloud',
      status: fanzCloudStatus?.configured ? 'active' : 'inactive',
      isDefault: false,
      usedBytes: fanzCloudQuota?.data?.usedQuota || 0,
      totalBytes: fanzCloudQuota?.data?.quota || 10 * 1024 * 1024 * 1024, // 10GB default
      features: [
        'Secure Storage',
        'File Versioning',
        'Trash Recovery',
        'Folder Sharing',
        'ZIP Archives',
        'Public Links',
      ],
      config: fanzCloudStatus || {},
    },
  ];

  // Purge cache mutation
  const purgeCacheMutation = useMutation({
    mutationFn: async (urlOrPath: string) => {
      const res = await apiRequest("POST", "/api/bunny/purge", { urlOrPath });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Cache purged successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Cache purge failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cloud Storage Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage storage providers, CDN settings, and media delivery
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="bunny">Bunny CDN</TabsTrigger>
          <TabsTrigger value="fanzcloud">FanzCloud</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {providers.map((provider) => (
              <Card key={provider.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {provider.type === 'bunny' ? (
                        <i className="fas fa-rabbit text-orange-500 text-xl"></i>
                      ) : (
                        <i className="fas fa-cloud text-blue-500 text-xl"></i>
                      )}
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                    </div>
                    <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                      {provider.status}
                    </Badge>
                  </div>
                  {provider.isDefault && (
                    <Badge variant="outline" className="w-fit">Default Provider</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Storage Used</span>
                        <span>{formatBytes(provider.usedBytes)} / {formatBytes(provider.totalBytes)}</span>
                      </div>
                      <Progress
                        value={(provider.usedBytes / provider.totalBytes) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {provider.features.slice(0, 3).map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                      {provider.features.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{provider.features.length - 3} more
                        </Badge>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab(provider.type === 'bunny' ? 'bunny' : 'fanzcloud')}
                    >
                      Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Provider Card */}
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-lg text-muted-foreground">Add Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect additional storage providers like AWS S3, Google Cloud Storage, or Backblaze B2
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <i className="fas fa-plus mr-2"></i>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {formatBytes(providers.reduce((acc, p) => acc + p.usedBytes, 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Storage Used</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {providers.filter(p => p.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Providers</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {bunnyStatus?.data?.features?.streaming ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-muted-foreground">HLS Streaming</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    {bunnyStatus?.data?.features?.signedUrls ? 'Yes' : 'No'}
                  </p>
                  <p className="text-sm text-muted-foreground">Signed URLs</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bunny CDN Tab */}
        <TabsContent value="bunny">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-rabbit text-orange-500"></i>
                    Bunny CDN Configuration
                  </CardTitle>
                  <CardDescription>
                    Edge storage, CDN delivery, and video streaming
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!bunnyStatus?.data?.initialized ? (
                    <Alert>
                      <i className="fas fa-info-circle mr-2"></i>
                      <AlertDescription>
                        Bunny CDN is not configured. Add the following environment variables:
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>BUNNY_API_KEY</li>
                          <li>BUNNY_STORAGE_ZONE_NAME</li>
                          <li>BUNNY_STORAGE_ZONE_PASSWORD</li>
                          <li>BUNNY_PULL_ZONE_URL</li>
                          <li>BUNNY_STREAM_LIBRARY_ID (optional)</li>
                          <li>BUNNY_STREAM_API_KEY (optional)</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Storage Zone</Label>
                          <Input
                            value={bunnyStatus?.data?.storageZone || ''}
                            disabled
                          />
                        </div>
                        <div>
                          <Label>Pull Zone URL</Label>
                          <Input
                            value={bunnyStatus?.data?.pullZone || ''}
                            disabled
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Video Streaming (Bunny Stream)</p>
                          <p className="text-sm text-muted-foreground">
                            HLS adaptive bitrate streaming for videos
                          </p>
                        </div>
                        <Badge variant={bunnyStatus?.data?.streamEnabled ? 'default' : 'secondary'}>
                          {bunnyStatus?.data?.streamEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Signed URLs</p>
                          <p className="text-sm text-muted-foreground">
                            Token-based URL authentication for private content
                          </p>
                        </div>
                        <Badge variant={bunnyStatus?.data?.features?.signedUrls ? 'default' : 'secondary'}>
                          {bunnyStatus?.data?.features?.signedUrls ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {bunnyStatus?.data?.initialized && (
                <Card>
                  <CardHeader>
                    <CardTitle>Cache Management</CardTitle>
                    <CardDescription>Purge CDN cache for specific files or paths</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter URL or path to purge (e.g., /images/logo.png)"
                        id="purge-path"
                      />
                      <Button
                        onClick={() => {
                          const input = document.getElementById('purge-path') as HTMLInputElement;
                          if (input.value) {
                            purgeCacheMutation.mutate(input.value);
                            input.value = '';
                          }
                        }}
                        disabled={purgeCacheMutation.isPending}
                      >
                        {purgeCacheMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin mr-2"></i>
                        ) : (
                          <i className="fas fa-broom mr-2"></i>
                        )}
                        Purge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Used</span>
                      <span>{formatBytes(bunnyStats?.data?.StorageUsed || 0)}</span>
                    </div>
                    <Progress
                      value={bunnyStats?.data?.StorageUsed ?
                        (bunnyStats.data.StorageUsed / (bunnyStats.data.StorageQuota || 50 * 1024 * 1024 * 1024)) * 100
                        : 0
                      }
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Files Count</p>
                      <p className="font-medium">{bunnyStats?.data?.FileCount || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Bandwidth</p>
                      <p className="font-medium">{formatBytes(bunnyStats?.data?.MonthlyBandwidthUsed || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      { icon: 'fa-globe', label: 'Global Edge Network', enabled: true },
                      { icon: 'fa-film', label: 'HLS Streaming', enabled: bunnyStatus?.data?.streamEnabled },
                      { icon: 'fa-key', label: 'Signed URLs', enabled: bunnyStatus?.data?.features?.signedUrls },
                      { icon: 'fa-broom', label: 'Cache Purging', enabled: bunnyStatus?.data?.initialized },
                      { icon: 'fa-lock', label: 'Token Auth', enabled: bunnyStatus?.data?.features?.signedUrls },
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className={`fas ${feature.icon} text-muted-foreground`}></i>
                          <span>{feature.label}</span>
                        </div>
                        {feature.enabled ? (
                          <i className="fas fa-check text-green-500"></i>
                        ) : (
                          <i className="fas fa-times text-red-500"></i>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* FanzCloud Tab */}
        <TabsContent value="fanzcloud">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <i className="fas fa-cloud text-blue-500"></i>
                    FanzCloud Configuration
                  </CardTitle>
                  <CardDescription>
                    Secure cloud storage powered by pCloud
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!fanzCloudStatus?.configured ? (
                    <Alert>
                      <i className="fas fa-info-circle mr-2"></i>
                      <AlertDescription>
                        FanzCloud is not configured. Add one of the following environment variables:
                        <ul className="list-disc list-inside mt-2 text-sm">
                          <li>FANZCLOUD_ACCESS_TOKEN (OAuth token)</li>
                          <li>FANZCLOUD_AUTH_TOKEN (Auth token)</li>
                        </ul>
                        <p className="mt-2">
                          Or use the OAuth flow to authenticate with pCloud.
                        </p>
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label>Storage Used</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={formatBytes(fanzCloudQuota?.data?.usedQuota || 0)}
                              disabled
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Total Quota</Label>
                          <Input
                            value={formatBytes(fanzCloudQuota?.data?.quota || 0)}
                            disabled
                          />
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Premium Account</p>
                          <p className="text-sm text-muted-foreground">
                            Larger storage quota and faster transfers
                          </p>
                        </div>
                        <Badge variant={fanzCloudQuota?.data?.premium ? 'default' : 'secondary'}>
                          {fanzCloudQuota?.data?.premium ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {fanzCloudStatus?.configured && (
                <Card>
                  <CardHeader>
                    <CardTitle>Creator Vault</CardTitle>
                    <CardDescription>
                      Secure storage structure for creator content
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Each creator gets an organized vault with folders for photos, videos, audio, documents, and backups.
                    </p>
                    <div className="flex gap-2">
                      <Input placeholder="Creator ID" id="vault-creator-id" />
                      <Input placeholder="Creator Name" id="vault-creator-name" />
                      <Button variant="outline">
                        <i className="fas fa-folder-plus mr-2"></i>
                        Create Vault
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Storage Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Used</span>
                      <span>{fanzCloudQuota?.data?.percentUsed || 0}%</span>
                    </div>
                    <Progress
                      value={parseFloat(fanzCloudQuota?.data?.percentUsed || 0)}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Free Space</p>
                      <p className="font-medium">{formatBytes(fanzCloudQuota?.data?.freeQuota || 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Account Type</p>
                      <p className="font-medium">{fanzCloudQuota?.data?.premium ? 'Premium' : 'Free'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {[
                      { icon: 'fa-shield-alt', label: 'Secure Storage', enabled: true },
                      { icon: 'fa-history', label: 'File Versioning', enabled: true },
                      { icon: 'fa-trash-restore', label: 'Trash Recovery', enabled: true },
                      { icon: 'fa-share-alt', label: 'Folder Sharing', enabled: true },
                      { icon: 'fa-file-archive', label: 'ZIP Archives', enabled: true },
                      { icon: 'fa-link', label: 'Public Links', enabled: true },
                      { icon: 'fa-video', label: 'Video Streaming', enabled: true },
                      { icon: 'fa-image', label: 'Thumbnails', enabled: true },
                    ].map((feature, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <i className={`fas ${feature.icon} text-muted-foreground`}></i>
                          <span>{feature.label}</span>
                        </div>
                        <i className="fas fa-check text-green-500"></i>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Default Storage Provider</CardTitle>
                <CardDescription>
                  Choose which provider to use for new uploads
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select defaultValue="bunny">
                  <SelectTrigger>
                    <SelectValue placeholder="Select default provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bunny">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-rabbit text-orange-500"></i>
                        Bunny CDN (Recommended for media)
                      </div>
                    </SelectItem>
                    <SelectItem value="fanzcloud">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-cloud text-blue-500"></i>
                        FanzCloud (Recommended for documents)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Auto-backup to FanzCloud</p>
                      <p className="text-sm text-muted-foreground">
                        Automatically backup Bunny CDN uploads to FanzCloud
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">CDN for all media</p>
                      <p className="text-sm text-muted-foreground">
                        Serve all media through Bunny CDN for faster delivery
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Signed URLs for paid content</p>
                      <p className="text-sm text-muted-foreground">
                        Use time-limited signed URLs for subscriber-only content
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upload Settings</CardTitle>
                <CardDescription>
                  Configure upload limits and processing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input type="number" defaultValue={5000} />
                </div>

                <div>
                  <Label>Max Video Length (minutes)</Label>
                  <Input type="number" defaultValue={60} />
                </div>

                <div>
                  <Label>Allowed File Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['jpg', 'png', 'gif', 'webp', 'mp4', 'mov', 'webm', 'mp3', 'wav', 'pdf'].map((type) => (
                      <Badge key={type} variant="secondary">.{type}</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-generate thumbnails</p>
                    <p className="text-sm text-muted-foreground">
                      Create thumbnails for images and videos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">HLS transcoding for videos</p>
                    <p className="text-sm text-muted-foreground">
                      Convert videos to adaptive streaming format
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Content Delivery</CardTitle>
                <CardDescription>
                  CDN and caching settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Cache Duration (hours)</Label>
                  <Input type="number" defaultValue={24} />
                </div>

                <div>
                  <Label>Signed URL Expiry (seconds)</Label>
                  <Input type="number" defaultValue={3600} />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable CORS</p>
                    <p className="text-sm text-muted-foreground">
                      Allow cross-origin requests for media
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Hotlink Protection</p>
                    <p className="text-sm text-muted-foreground">
                      Prevent unauthorized embedding of media
                    </p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cleanup & Maintenance</CardTitle>
                <CardDescription>
                  Automated storage cleanup settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Delete orphaned files after (days)</Label>
                  <Input type="number" defaultValue={30} />
                </div>

                <div>
                  <Label>Empty trash after (days)</Label>
                  <Input type="number" defaultValue={7} />
                </div>

                <Separator />

                <Button variant="outline" className="w-full">
                  <i className="fas fa-broom mr-2"></i>
                  Run Storage Cleanup
                </Button>

                <Button variant="outline" className="w-full">
                  <i className="fas fa-sync mr-2"></i>
                  Sync Storage Stats
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Storage Breakdown</CardTitle>
                <CardDescription>Storage usage by content type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Videos', size: 45, color: 'bg-blue-500' },
                    { type: 'Images', size: 30, color: 'bg-green-500' },
                    { type: 'Audio', size: 15, color: 'bg-purple-500' },
                    { type: 'Documents', size: 10, color: 'bg-orange-500' },
                  ].map((item) => (
                    <div key={item.type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{item.type}</span>
                        <span>{item.size}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color}`}
                          style={{ width: `${item.size}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bandwidth Usage</CardTitle>
                <CardDescription>Monthly bandwidth by provider</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-rabbit text-orange-500"></i>
                      <span>Bunny CDN</span>
                    </div>
                    <span className="font-medium">
                      {formatBytes(bunnyStats?.data?.MonthlyBandwidthUsed || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-cloud text-blue-500"></i>
                      <span>FanzCloud</span>
                    </div>
                    <span className="font-medium">
                      {formatBytes(0)} {/* pCloud doesn't track bandwidth */}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Top Content</CardTitle>
                <CardDescription>Most accessed files this month</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>File</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Requests</TableHead>
                      <TableHead>Bandwidth</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        Analytics data will appear here once content is uploaded
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
