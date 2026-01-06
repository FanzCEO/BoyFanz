import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Video, Radio, Settings, Shield } from "lucide-react";

export default function LivestreamSettings() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    enabled: true,
    requireVerification: true,
    maxBitrate: 6000,
    maxViewers: 1000,
    chatEnabled: true,
    tipsEnabled: true,
    recordingEnabled: true,
    lowLatencyMode: false,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Radio className="h-8 w-8" />
          Live Streaming Settings
        </h1>
        <p className="text-gray-400 mt-2">Configure platform livestreaming</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-900 border border-cyan-500/20">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="quality">Quality</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Livestreaming</Label>
                <Switch checked={config.enabled} onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Require Verification</Label>
                <Switch checked={config.requireVerification} onCheckedChange={(checked) => setConfig({ ...config, requireVerification: checked })} />
              </div>
              <div>
                <Label>Max Concurrent Viewers</Label>
                <Input type="number" value={config.maxViewers} onChange={(e) => setConfig({ ...config, maxViewers: Number(e.target.value) })} className="bg-gray-800 border-cyan-500/20" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Stream Quality</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Bitrate (kbps)</Label>
                <Input type="number" value={config.maxBitrate} onChange={(e) => setConfig({ ...config, maxBitrate: Number(e.target.value) })} className="bg-gray-800 border-cyan-500/20" />
              </div>
              <div className="flex items-center justify-between">
                <Label>Low Latency Mode</Label>
                <Switch checked={config.lowLatencyMode} onCheckedChange={(checked) => setConfig({ ...config, lowLatencyMode: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Stream Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Chat</Label>
                <Switch checked={config.chatEnabled} onCheckedChange={(checked) => setConfig({ ...config, chatEnabled: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Tips</Label>
                <Switch checked={config.tipsEnabled} onCheckedChange={(checked) => setConfig({ ...config, tipsEnabled: checked })} />
              </div>
              <div className="flex items-center justify-between">
                <Label>Enable Recording</Label>
                <Switch checked={config.recordingEnabled} onCheckedChange={(checked) => setConfig({ ...config, recordingEnabled: checked })} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">Save Settings</Button>
      </div>
    </div>
  );
}
