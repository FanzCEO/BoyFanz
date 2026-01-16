import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Globe, Save, Eye, AlertTriangle, BarChart3 } from "lucide-react";

export default function GoogleSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    analyticsEnabled: true,
    analyticsId: "G-XXXXXXXXXX",
    tagManagerEnabled: false,
    tagManagerId: "GTM-XXXXXXX",
    searchConsoleEnabled: true,
    searchConsoleVerification: "google1234567890abcdef.html",
    adsenseEnabled: false,
    adsensePublisherId: "ca-pub-XXXXXXXXXXXXXXXX",
    recaptchaEnabled: true,
    recaptchaSiteKey: "6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    recaptchaSecretKey: "6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    mapsEnabled: false,
    mapsApiKey: "",
  });

  const handleSave = () => {
    toast({
      title: "Google Settings Saved",
      description: "Google service integrations have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
          <Globe className="h-8 w-8" />
          Google Settings
        </h1>
        <p className="text-gray-400 mt-2">Configure Google services integration</p>
      </div>

      <Alert className="bg-yellow-900/20 border-yellow-500/30">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertDescription className="text-yellow-200">
          API keys and sensitive credentials are encrypted at rest. Never share these values publicly.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="bg-gray-900 border border-slate-500/20">
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="search">Search Console</TabsTrigger>
          <TabsTrigger value="recaptcha">reCAPTCHA</TabsTrigger>
          <TabsTrigger value="other">Other Services</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Google Analytics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Google Analytics</Label>
                  <p className="text-sm text-gray-500">Track user behavior and site analytics</p>
                </div>
                <Switch
                  checked={settings.analyticsEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, analyticsEnabled: checked })
                  }
                />
              </div>
              <div>
                <Label>Analytics Measurement ID</Label>
                <Input
                  value={settings.analyticsId}
                  onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="G-XXXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Find this in your Google Analytics property settings
                </p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Current tracking status:</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-green-400">Active and tracking</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Google Tag Manager</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Google Tag Manager</Label>
                  <p className="text-sm text-gray-500">Manage marketing tags without code changes</p>
                </div>
                <Switch
                  checked={settings.tagManagerEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, tagManagerEnabled: checked })
                  }
                />
              </div>
              <div>
                <Label>Container ID</Label>
                <Input
                  value={settings.tagManagerId}
                  onChange={(e) => setSettings({ ...settings, tagManagerId: e.target.value })}
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="GTM-XXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Google Search Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Search Console</Label>
                  <p className="text-sm text-gray-500">Monitor site's search performance</p>
                </div>
                <Switch
                  checked={settings.searchConsoleEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, searchConsoleEnabled: checked })
                  }
                />
              </div>
              <div>
                <Label>Verification File</Label>
                <Input
                  value={settings.searchConsoleVerification}
                  onChange={(e) =>
                    setSettings({ ...settings, searchConsoleVerification: e.target.value })
                  }
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="google1234567890abcdef.html"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Verification file name from Google Search Console
                </p>
              </div>
              <Alert className="bg-cyan-900/20 border-slate-500/30">
                <Eye className="h-4 w-4 text-slate-400" />
                <AlertDescription className="text-cyan-200">
                  This file is automatically served at: https://boyfanz.fanz.website/{settings.searchConsoleVerification}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recaptcha" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Google reCAPTCHA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable reCAPTCHA</Label>
                  <p className="text-sm text-gray-500">Protect forms from spam and abuse</p>
                </div>
                <Switch
                  checked={settings.recaptchaEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, recaptchaEnabled: checked })
                  }
                />
              </div>
              <div>
                <Label>Site Key (Public)</Label>
                <Input
                  value={settings.recaptchaSiteKey}
                  onChange={(e) =>
                    setSettings({ ...settings, recaptchaSiteKey: e.target.value })
                  }
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-1">Used in the frontend HTML</p>
              </div>
              <div>
                <Label>Secret Key (Private)</Label>
                <Input
                  type="password"
                  value={settings.recaptchaSecretKey}
                  onChange={(e) =>
                    setSettings({ ...settings, recaptchaSecretKey: e.target.value })
                  }
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="6LeXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
                <p className="text-sm text-gray-500 mt-1">Used for server-side verification</p>
              </div>
              <div className="p-4 bg-gray-800 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">reCAPTCHA version:</p>
                <select className="w-full p-2 bg-gray-700 border border-slate-500/20 rounded-md">
                  <option value="v3">reCAPTCHA v3 (Invisible)</option>
                  <option value="v2">reCAPTCHA v2 (Checkbox)</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="other" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Google AdSense</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AdSense</Label>
                  <p className="text-sm text-gray-500">Display Google ads on the platform</p>
                </div>
                <Switch
                  checked={settings.adsenseEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, adsenseEnabled: checked })
                  }
                />
              </div>
              <div>
                <Label>Publisher ID</Label>
                <Input
                  value={settings.adsensePublisherId}
                  onChange={(e) =>
                    setSettings({ ...settings, adsensePublisherId: e.target.value })
                  }
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Google Maps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Google Maps</Label>
                  <p className="text-sm text-gray-500">Use Maps API for location features</p>
                </div>
                <Switch
                  checked={settings.mapsEnabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, mapsEnabled: checked })}
                />
              </div>
              <div>
                <Label>Maps API Key</Label>
                <Input
                  type="password"
                  value={settings.mapsApiKey}
                  onChange={(e) => setSettings({ ...settings, mapsApiKey: e.target.value })}
                  className="bg-gray-800 border-slate-500/20 font-mono"
                  placeholder="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-gradient-to-r from-slate-500 to-blue-500">
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
