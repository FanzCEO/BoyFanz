import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  AlertTriangle,
  Info
} from "lucide-react";
import { Redirect } from "wouter";

interface OAuthProvider {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  configured: boolean;
  documentationUrl: string;
  requiredScopes: string[];
}

interface OAuthSettings {
  providers: OAuthProvider[];
  baseUrl: string;
}

// Provider icon components using brand colors
const providerIcons: Record<string, { icon: string; color: string; bgColor: string }> = {
  google: { icon: "G", color: "#4285F4", bgColor: "#E8F0FE" },
  github: { icon: "GH", color: "#24292E", bgColor: "#F1F1F1" },
  facebook: { icon: "f", color: "#1877F2", bgColor: "#E7F3FF" },
  twitter: { icon: "X", color: "#000000", bgColor: "#F5F5F5" },
  discord: { icon: "D", color: "#5865F2", bgColor: "#EBEEFF" },
};

const providerDocs: Record<string, { url: string; name: string; instructions: string[] }> = {
  google: {
    url: "https://console.developers.google.com/",
    name: "Google Cloud Console",
    instructions: [
      "1. Go to Google Cloud Console",
      "2. Create a new project or select existing",
      "3. Enable Google+ API and OAuth consent screen",
      "4. Create OAuth 2.0 credentials",
      "5. Add callback URL to authorized redirect URIs",
    ],
  },
  github: {
    url: "https://github.com/settings/developers",
    name: "GitHub Developer Settings",
    instructions: [
      "1. Go to GitHub Settings → Developer settings",
      "2. Click 'New OAuth App'",
      "3. Fill in application details",
      "4. Set callback URL",
      "5. Copy Client ID and generate Client Secret",
    ],
  },
  facebook: {
    url: "https://developers.facebook.com/apps/",
    name: "Facebook for Developers",
    instructions: [
      "1. Go to Facebook Developers",
      "2. Create a new app (Consumer type)",
      "3. Add Facebook Login product",
      "4. Configure OAuth settings",
      "5. Add callback URL to valid OAuth redirect URIs",
    ],
  },
  twitter: {
    url: "https://developer.twitter.com/en/portal/projects-and-apps",
    name: "Twitter Developer Portal",
    instructions: [
      "1. Apply for Twitter Developer account",
      "2. Create a new project and app",
      "3. Configure OAuth 1.0a settings",
      "4. Add callback URL",
      "5. Copy API Key (Consumer Key) and API Secret (Consumer Secret)",
    ],
  },
  discord: {
    url: "https://discord.com/developers/applications",
    name: "Discord Developer Portal",
    instructions: [
      "1. Go to Discord Developer Portal",
      "2. Create a new application",
      "3. Go to OAuth2 section",
      "4. Add redirect URL",
      "5. Copy Client ID and Client Secret",
    ],
  },
};

export default function OAuthSettings() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [activeProvider, setActiveProvider] = useState("google");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [localSettings, setLocalSettings] = useState<Record<string, { clientId: string; clientSecret: string; enabled: boolean }>>({});

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Fetch OAuth settings
  const { data: oauthSettings, isLoading: settingsLoading, refetch } = useQuery<OAuthSettings>({
    queryKey: ['/api/admin/oauth-settings'],
    enabled: isAdmin,
  });

  // Fetch OAuth status from auth routes
  const { data: oauthStatus } = useQuery<{ providers: Record<string, boolean>; configured: string[] }>({
    queryKey: ['/auth/status'],
    enabled: isAdmin,
  });

  // Save OAuth settings mutation
  const saveMutation = useMutation({
    mutationFn: async (data: { provider: string; clientId: string; clientSecret: string; enabled: boolean }) => {
      return apiRequest('/api/admin/oauth-settings', {
        method: 'POST',
        body: data,
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "OAuth settings saved successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/oauth-settings'] });
      queryClient.invalidateQueries({ queryKey: ['/auth/status'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to save settings" });
    },
  });

  // Test OAuth connection mutation
  const testMutation = useMutation({
    mutationFn: async (provider: string) => {
      return apiRequest(`/api/admin/oauth-settings/test/${provider}`, { method: 'POST' });
    },
    onSuccess: (_, provider) => {
      toast({ title: "Connection Test", description: `${provider} OAuth configuration is valid` });
    },
    onError: (error: any, provider) => {
      toast({ variant: "destructive", title: "Test Failed", description: error.message || `Failed to test ${provider} connection` });
    },
  });

  // Initialize local settings from fetched data
  useEffect(() => {
    if (oauthSettings?.providers) {
      const settings: Record<string, { clientId: string; clientSecret: string; enabled: boolean }> = {};
      oauthSettings.providers.forEach((provider) => {
        settings[provider.id] = {
          clientId: provider.clientId || "",
          clientSecret: provider.clientSecret || "",
          enabled: provider.enabled,
        };
      });
      setLocalSettings(settings);
    }
  }, [oauthSettings]);

  // Default providers if not loaded from API
  const defaultProviders = [
    { id: "google", name: "Google", configured: false },
    { id: "github", name: "GitHub", configured: false },
    { id: "facebook", name: "Facebook", configured: false },
    { id: "twitter", name: "Twitter/X", configured: false },
    { id: "discord", name: "Discord", configured: false },
  ];

  const providers = oauthSettings?.providers || defaultProviders.map(p => ({
    ...p,
    enabled: false,
    clientId: "",
    clientSecret: "",
    callbackUrl: `${window.location.origin}/auth/${p.id}/callback`,
    documentationUrl: providerDocs[p.id]?.url || "",
    requiredScopes: [],
    icon: p.id,
  }));

  const handleSaveProvider = (providerId: string) => {
    const settings = localSettings[providerId];
    if (!settings) return;

    saveMutation.mutate({
      provider: providerId,
      clientId: settings.clientId,
      clientSecret: settings.clientSecret,
      enabled: settings.enabled,
    });
  };

  const handleCopyCallback = (callbackUrl: string) => {
    navigator.clipboard.writeText(callbackUrl);
    toast({ title: "Copied", description: "Callback URL copied to clipboard" });
  };

  const toggleSecretVisibility = (providerId: string) => {
    setShowSecrets((prev) => ({ ...prev, [providerId]: !prev[providerId] }));
  };

  const updateLocalSetting = (providerId: string, field: string, value: string | boolean) => {
    setLocalSettings((prev) => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        [field]: value,
      },
    }));
  };

  // Auth check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="space-y-6" data-testid="oauth-settings-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            Social Login Settings
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="page-description">
            Configure OAuth providers for social authentication
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => refetch()}
          disabled={settingsLoading}
          data-testid="button-refresh"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${settingsLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Status Overview */}
      <Card data-testid="card-status-overview">
        <CardHeader>
          <CardTitle>Provider Status</CardTitle>
          <CardDescription>Quick overview of configured OAuth providers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {providers.map((provider) => {
              const isConfigured = oauthStatus?.providers?.[provider.id] || provider.configured;
              const iconInfo = providerIcons[provider.id];

              return (
                <div
                  key={provider.id}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-all ${
                    activeProvider === provider.id ? 'border-primary bg-primary/5' : 'border-border'
                  }`}
                  onClick={() => setActiveProvider(provider.id)}
                  data-testid={`provider-status-${provider.id}`}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: iconInfo?.bgColor || '#f5f5f5', color: iconInfo?.color || '#333' }}
                  >
                    {iconInfo?.icon || provider.id[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{provider.name}</span>
                  {isConfigured ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration Tabs */}
      <Tabs value={activeProvider} onValueChange={setActiveProvider} className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full" data-testid="provider-tabs">
          {providers.map((provider) => (
            <TabsTrigger key={provider.id} value={provider.id} data-testid={`tab-${provider.id}`}>
              {provider.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {providers.map((provider) => {
          const settings = localSettings[provider.id] || { clientId: "", clientSecret: "", enabled: false };
          const docs = providerDocs[provider.id];
          const callbackUrl = `${window.location.origin}/auth/${provider.id}/callback`;
          const isConfigured = oauthStatus?.providers?.[provider.id] || provider.configured;

          return (
            <TabsContent key={provider.id} value={provider.id} className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Configuration Form */}
                <Card className="lg:col-span-2" data-testid={`card-config-${provider.id}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: providerIcons[provider.id]?.bgColor || '#f5f5f5',
                            color: providerIcons[provider.id]?.color || '#333'
                          }}
                        >
                          {providerIcons[provider.id]?.icon || provider.id[0].toUpperCase()}
                        </div>
                        <div>
                          <CardTitle>{provider.name} OAuth Configuration</CardTitle>
                          <CardDescription>
                            Configure {provider.name} OAuth credentials for social login
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`enable-${provider.id}`} className="text-sm">
                          {settings.enabled ? 'Enabled' : 'Disabled'}
                        </Label>
                        <Switch
                          id={`enable-${provider.id}`}
                          checked={settings.enabled}
                          onCheckedChange={(checked) => updateLocalSetting(provider.id, 'enabled', checked)}
                          data-testid={`switch-enable-${provider.id}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Callback URL */}
                    <div className="space-y-2">
                      <Label>Callback URL (Redirect URI)</Label>
                      <div className="flex gap-2">
                        <Input
                          value={callbackUrl}
                          readOnly
                          className="font-mono text-sm bg-muted"
                          data-testid={`input-callback-${provider.id}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopyCallback(callbackUrl)}
                          data-testid={`button-copy-callback-${provider.id}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Add this URL to your OAuth app's authorized redirect URIs
                      </p>
                    </div>

                    {/* Client ID */}
                    <div className="space-y-2">
                      <Label htmlFor={`clientId-${provider.id}`}>
                        {provider.id === 'twitter' ? 'API Key (Consumer Key)' : 'Client ID'}
                      </Label>
                      <Input
                        id={`clientId-${provider.id}`}
                        value={settings.clientId}
                        onChange={(e) => updateLocalSetting(provider.id, 'clientId', e.target.value)}
                        placeholder={`Enter ${provider.name} Client ID`}
                        data-testid={`input-clientId-${provider.id}`}
                      />
                    </div>

                    {/* Client Secret */}
                    <div className="space-y-2">
                      <Label htmlFor={`clientSecret-${provider.id}`}>
                        {provider.id === 'twitter' ? 'API Secret (Consumer Secret)' : 'Client Secret'}
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          id={`clientSecret-${provider.id}`}
                          type={showSecrets[provider.id] ? 'text' : 'password'}
                          value={settings.clientSecret}
                          onChange={(e) => updateLocalSetting(provider.id, 'clientSecret', e.target.value)}
                          placeholder={`Enter ${provider.name} Client Secret`}
                          data-testid={`input-clientSecret-${provider.id}`}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSecretVisibility(provider.id)}
                          data-testid={`button-toggle-secret-${provider.id}`}
                        >
                          {showSecrets[provider.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    {/* Status Alert */}
                    {isConfigured ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          {provider.name} OAuth is configured and ready to use
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-yellow-50 border-yellow-200">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-800">
                          {provider.name} OAuth is not configured. Enter credentials to enable.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={() => handleSaveProvider(provider.id)}
                        disabled={saveMutation.isPending}
                        data-testid={`button-save-${provider.id}`}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Settings
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => testMutation.mutate(provider.id)}
                        disabled={testMutation.isPending || !settings.clientId || !settings.clientSecret}
                        data-testid={`button-test-${provider.id}`}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${testMutation.isPending ? 'animate-spin' : ''}`} />
                        Test Connection
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Setup Instructions */}
                <Card data-testid={`card-instructions-${provider.id}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">Setup Instructions</CardTitle>
                    <CardDescription>
                      How to get {provider.name} OAuth credentials
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {docs && (
                      <>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          asChild
                        >
                          <a href={docs.url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Open {docs.name}
                          </a>
                        </Button>

                        <div className="space-y-2">
                          {docs.instructions.map((instruction, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              {instruction}
                            </p>
                          ))}
                        </div>
                      </>
                    )}

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-sm">
                        <strong>Important:</strong> Make sure to add the callback URL to your OAuth app configuration.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>

      {/* Environment Variables Info */}
      <Card data-testid="card-env-info">
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
          <CardDescription>
            Alternatively, you can set OAuth credentials via environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
            <pre>{`# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Facebook OAuth
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret

# Twitter OAuth (API v1.1)
TWITTER_CONSUMER_KEY=your_twitter_consumer_key
TWITTER_CONSUMER_SECRET=your_twitter_consumer_secret

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret`}</pre>
          </div>
          <p className="text-sm text-muted-foreground mt-3">
            Settings saved in the admin panel will override environment variables.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
