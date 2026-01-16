import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Smartphone, Save, Upload, Bell, Download } from "lucide-react";

export default function PWASettings() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    enabled: true,
    appName: "BoyFanz",
    shortName: "BoyFanz",
    description: "Premium content creation platform for male creators",
    themeColor: "#475569",
    backgroundColor: "#050a0c",
    displayMode: "standalone",
    orientation: "portrait",
    offlineEnabled: true,
    pushNotifications: true,
    cacheStrategy: "networkFirst",
  });

  const handleSave = () => {
    toast({
      title: "PWA Settings Saved",
      description: "Progressive Web App settings have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
          <Smartphone className="h-8 w-8" />
          PWA Settings
        </h1>
        <p className="text-gray-400 mt-2">Configure Progressive Web App features</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">2,847</div>
            <p className="text-gray-400">PWA Installs</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">1,234</div>
            <p className="text-gray-400">Active Users</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">43.4%</div>
            <p className="text-gray-400">Install Rate</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">89.2%</div>
            <p className="text-gray-400">Retention Rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-900 border border-slate-500/20">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="icons">Icons</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable PWA</Label>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>
              <div>
                <Label>App Name</Label>
                <Input
                  value={config.appName}
                  onChange={(e) => setConfig({ ...config, appName: e.target.value })}
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="Full application name"
                />
                <p className="text-sm text-gray-500 mt-1">Displayed on the home screen</p>
              </div>
              <div>
                <Label>Short Name</Label>
                <Input
                  value={config.shortName}
                  onChange={(e) => setConfig({ ...config, shortName: e.target.value })}
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="Short app name (12 chars max)"
                />
                <p className="text-sm text-gray-500 mt-1">Used when space is limited</p>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={config.description}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="Brief description of the app"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Visual Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.themeColor}
                    onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                    className="w-16 h-10 bg-gray-800 border-slate-500/20"
                  />
                  <Input
                    value={config.themeColor}
                    onChange={(e) => setConfig({ ...config, themeColor: e.target.value })}
                    className="bg-gray-800 border-slate-500/20"
                    placeholder="#475569"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Status bar and browser UI color</p>
              </div>
              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-16 h-10 bg-gray-800 border-slate-500/20"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => setConfig({ ...config, backgroundColor: e.target.value })}
                    className="bg-gray-800 border-slate-500/20"
                    placeholder="#050a0c"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">Splash screen background color</p>
              </div>
              <div>
                <Label>Display Mode</Label>
                <select
                  value={config.displayMode}
                  onChange={(e) => setConfig({ ...config, displayMode: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-slate-500/20 rounded-md"
                >
                  <option value="standalone">Standalone (No browser UI)</option>
                  <option value="fullscreen">Fullscreen</option>
                  <option value="minimal-ui">Minimal UI</option>
                  <option value="browser">Browser</option>
                </select>
              </div>
              <div>
                <Label>Screen Orientation</Label>
                <select
                  value={config.orientation}
                  onChange={(e) => setConfig({ ...config, orientation: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-slate-500/20 rounded-md"
                >
                  <option value="any">Any</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">PWA Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Offline Mode</Label>
                  <p className="text-sm text-gray-500">Enable offline functionality</p>
                </div>
                <Switch
                  checked={config.offlineEnabled}
                  onCheckedChange={(checked) => setConfig({ ...config, offlineEnabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-gray-500">Enable push notification support</p>
                </div>
                <Switch
                  checked={config.pushNotifications}
                  onCheckedChange={(checked) => setConfig({ ...config, pushNotifications: checked })}
                />
              </div>
              <div>
                <Label>Cache Strategy</Label>
                <select
                  value={config.cacheStrategy}
                  onChange={(e) => setConfig({ ...config, cacheStrategy: e.target.value })}
                  className="w-full p-2 bg-gray-800 border border-slate-500/20 rounded-md"
                >
                  <option value="networkFirst">Network First (Online priority)</option>
                  <option value="cacheFirst">Cache First (Offline priority)</option>
                  <option value="networkOnly">Network Only</option>
                  <option value="cacheOnly">Cache Only</option>
                  <option value="staleWhileRevalidate">Stale While Revalidate</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">How resources are loaded</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icons" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">App Icons</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>App Icon (512x512)</Label>
                <div className="mt-2 border-2 border-dashed border-slate-500/20 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-gray-400 mb-2">Drop icon here or click to upload</p>
                  <Button variant="outline" className="border-slate-500/20">
                    Choose File
                  </Button>
                </div>
              </div>
              <div>
                <Label>App Icon (192x192)</Label>
                <div className="mt-2 border-2 border-dashed border-slate-500/20 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-gray-400 mb-2">Drop icon here or click to upload</p>
                  <Button variant="outline" className="border-slate-500/20">
                    Choose File
                  </Button>
                </div>
              </div>
              <div>
                <Label>Splash Screen Image</Label>
                <div className="mt-2 border-2 border-dashed border-slate-500/20 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <p className="text-gray-400 mb-2">Drop image here or click to upload</p>
                  <Button variant="outline" className="border-slate-500/20">
                    Choose File
                  </Button>
                </div>
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
