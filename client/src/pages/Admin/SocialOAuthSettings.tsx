import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OAuthCredential {
  id: string;
  platform: 'twitter' | 'tiktok' | 'instagram' | 'facebook' | 'youtube' | 'snapchat';
  clientId: string | null;
  clientSecret: string | null;
  redirectUri: string | null;
  additionalConfig: Record<string, any>;
  isActive: boolean;
  lastVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const platformConfig = {
  twitter: {
    name: 'Twitter / X',
    icon: Twitter,
    color: 'text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    description: 'Post videos and updates to Twitter automatically',
    fields: ['Client ID', 'Client Secret', 'Redirect URI'],
  },
  tiktok: {
    name: 'TikTok',
    icon: () => <div className="w-6 h-6 flex items-center justify-center font-bold">TT</div>,
    color: 'text-pink-500',
    bgColor: 'bg-pink-50 dark:bg-pink-950',
    description: 'Share short-form videos to TikTok',
    fields: ['Client Key', 'Client Secret', 'Redirect URI'],
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950',
    description: 'Post content to Instagram (via Facebook Graph API)',
    fields: ['App ID', 'App Secret', 'Redirect URI'],
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950',
    description: 'Share updates to Facebook pages',
    fields: ['App ID', 'App Secret', 'Redirect URI'],
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bgColor: 'bg-red-50 dark:bg-red-950',
    description: 'Upload videos to YouTube automatically',
    fields: ['Client ID', 'Client Secret', 'Redirect URI'],
  },
  snapchat: {
    name: 'Snapchat',
    icon: () => <div className="w-6 h-6 flex items-center justify-center font-bold">SC</div>,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    description: 'Post content to Snapchat Stories',
    fields: ['Client ID', 'Client Secret', 'Redirect URI'],
  },
};

export default function SocialOAuthSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Fetch all OAuth credentials
  const { data: credentials, isLoading } = useQuery<OAuthCredential[]>({
    queryKey: ["/api/admin/oauth-credentials"],
    queryFn: async () => {
      const res = await fetch("/api/admin/oauth-credentials");
      if (!res.ok) throw new Error("Failed to load OAuth credentials");
      return res.json();
    },
  });

  // Save credentials mutation
  const saveMutation = useMutation({
    mutationFn: async ({ platform, data }: { platform: string; data: any }) => {
      const res = await fetch(`/api/admin/oauth-credentials/${platform}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save credentials");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oauth-credentials"] });
      toast({
        title: "Credentials saved",
        description: "OAuth credentials have been updated successfully."
      });
      setEditingPlatform(null);
      setFormData({});
    },
    onError: (error) => {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Verify credentials mutation
  const verifyMutation = useMutation({
    mutationFn: async (platform: string) => {
      const res = await fetch(`/api/admin/oauth-credentials/${platform}/verify`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Verification failed");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/oauth-credentials"] });
      toast({
        title: data.verified ? "Credentials verified" : "Verification incomplete",
        description: data.message,
        variant: data.verified ? "default" : "destructive"
      });
    },
  });

  const handleEdit = (platform: string) => {
    const cred = credentials?.find((c) => c.platform === platform);
    setEditingPlatform(platform);
    setFormData({
      clientId: cred?.clientId || '',
      clientSecret: '', // Don't pre-fill secrets
      redirectUri: cred?.redirectUri || `http://localhost:3202/api/social-oauth/callback/${platform}`,
      isActive: cred?.isActive ?? true,
    });
  };

  const handleSave = (platform: string) => {
    saveMutation.mutate({ platform, data: formData });
  };

  const toggleSecret = (platform: string) => {
    setShowSecrets(prev => ({ ...prev, [platform]: !prev[platform] }));
  };

  const getCredential = (platform: string) => {
    return credentials?.find((c) => c.platform === platform);
  };

  const renderPlatformCard = (platform: keyof typeof platformConfig) => {
    const config = platformConfig[platform];
    const credential = getCredential(platform);
    const isEditing = editingPlatform === platform;
    const Icon = config.icon;
    const isConfigured = credential?.clientId && credential?.clientSecret;
    const isVerified = credential?.lastVerifiedAt;

    return (
      <Card key={platform} className={config.bgColor}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`${config.color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle>{config.name}</CardTitle>
                <CardDescription>{config.description}</CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isConfigured && (
                isVerified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                )
              )}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(platform)}
                >
                  {isConfigured ? 'Edit' : 'Configure'}
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPlatform(null)}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {!isEditing ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className={credential?.isActive ? "text-green-600" : "text-gray-500"}>
                  {credential?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              {isConfigured && (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Client ID:</span>
                    <code className="text-xs bg-white dark:bg-gray-800 px-2 py-1 rounded">
                      {credential?.clientId?.substring(0, 20)}...
                    </code>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last Verified:</span>
                    <span className="text-xs">
                      {isVerified ? new Date(credential.lastVerifiedAt!).toLocaleDateString() : 'Never'}
                    </span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => verifyMutation.mutate(platform)}
                    disabled={verifyMutation.isPending}
                  >
                    {verifyMutation.isPending ? 'Verifying...' : 'Test Connection'}
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor={`${platform}-clientId`}>
                  {config.fields[0]}
                </Label>
                <Input
                  id={`${platform}-clientId`}
                  value={formData.clientId || ''}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  placeholder="Enter client ID"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${platform}-clientSecret`}>
                  {config.fields[1]}
                </Label>
                <div className="flex gap-2">
                  <Input
                    id={`${platform}-clientSecret`}
                    type={showSecrets[platform] ? "text" : "password"}
                    value={formData.clientSecret || ''}
                    onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                    placeholder="Enter client secret"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecret(platform)}
                  >
                    {showSecrets[platform] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`${platform}-redirectUri`}>
                  {config.fields[2]}
                </Label>
                <Input
                  id={`${platform}-redirectUri`}
                  value={formData.redirectUri || ''}
                  onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
                  placeholder="Redirect URI"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor={`${platform}-active`}>Enable Platform</Label>
                <Switch
                  id={`${platform}-active`}
                  checked={formData.isActive ?? true}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <Button
                onClick={() => handleSave(platform)}
                disabled={saveMutation.isPending}
                className="w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveMutation.isPending ? 'Saving...' : 'Save Credentials'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Social Media OAuth Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure OAuth credentials for automatic content distribution to social media platforms
        </p>
      </div>

      <Tabs defaultValue="primary" className="space-y-6">
        <TabsList>
          <TabsTrigger value="primary">Primary Platforms</TabsTrigger>
          <TabsTrigger value="additional">Additional Platforms</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {renderPlatformCard('twitter')}
            {renderPlatformCard('tiktok')}
            {renderPlatformCard('instagram')}
            {renderPlatformCard('facebook')}
          </div>
        </TabsContent>

        <TabsContent value="additional" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {renderPlatformCard('youtube')}
            {renderPlatformCard('snapchat')}
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Guide</CardTitle>
          <CardDescription>
            How to obtain OAuth credentials for each platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Twitter / X</h3>
            <p className="text-sm text-muted-foreground">
              1. Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Twitter Developer Portal</a><br/>
              2. Create a new app or use existing one<br/>
              3. Get Client ID and Client Secret from OAuth 2.0 settings<br/>
              4. Add the redirect URI to your app's callback URLs
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">TikTok</h3>
            <p className="text-sm text-muted-foreground">
              1. Visit <a href="https://developers.tiktok.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">TikTok for Developers</a><br/>
              2. Create an app and enable Content Posting API<br/>
              3. Copy Client Key and Client Secret<br/>
              4. Configure redirect URI in app settings
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Instagram (via Facebook)</h3>
            <p className="text-sm text-muted-foreground">
              1. Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Meta for Developers</a><br/>
              2. Create an app with Instagram Graph API access<br/>
              3. Get App ID and App Secret<br/>
              4. Add redirect URI to Facebook Login settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
