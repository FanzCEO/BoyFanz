import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Video, Settings, Zap, HardDrive, PlayCircle, Sliders } from "lucide-react";

interface EncodingPreset {
  name: string;
  resolution: string;
  bitrate: number;
  fps: number;
  codec: string;
}

export default function VideoEncoding() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    autoEncode: true,
    defaultCodec: "h264",
    defaultResolution: "1080p",
    enableHLS: true,
    enableDASH: false,
    generateThumbnails: true,
    thumbnailInterval: 5,
    maxConcurrentJobs: 4,
    priorityEncoding: true,
  });

  const presets: EncodingPreset[] = [
    { name: "4K UHD", resolution: "3840x2160", bitrate: 25000, fps: 60, codec: "h265" },
    { name: "1080p FHD", resolution: "1920x1080", bitrate: 8000, fps: 60, codec: "h264" },
    { name: "720p HD", resolution: "1280x720", bitrate: 5000, fps: 30, codec: "h264" },
    { name: "480p SD", resolution: "854x480", bitrate: 2500, fps: 30, codec: "h264" },
    { name: "360p Mobile", resolution: "640x360", bitrate: 1000, fps: 30, codec: "h264" },
  ];

  const saveMutation = useMutation({
    mutationFn: async (data: typeof config) => {
      const res = await apiRequest("POST", "/api/admin/video/encoding", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Settings Saved", description: "Video encoding configuration updated." });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
          <Video className="h-8 w-8" />
          Video Encoding Settings
        </h1>
        <p className="text-gray-400 mt-2">Configure video processing and transcoding</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-gray-900 border border-slate-500/20">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="presets">Encoding Presets</TabsTrigger>
          <TabsTrigger value="streaming">Streaming</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Auto-encode uploads</Label>
                <Switch
                  checked={config.autoEncode}
                  onCheckedChange={(checked) => setConfig({ ...config, autoEncode: checked })}
                />
              </div>
              <div>
                <Label>Default Codec</Label>
                <Select value={config.defaultCodec} onValueChange={(value) => setConfig({ ...config, defaultCodec: value })}>
                  <SelectTrigger className="bg-gray-800 border-slate-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h264">H.264 (AVC)</SelectItem>
                    <SelectItem value="h265">H.265 (HEVC)</SelectItem>
                    <SelectItem value="vp9">VP9</SelectItem>
                    <SelectItem value="av1">AV1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Default Resolution</Label>
                <Select value={config.defaultResolution} onValueChange={(value) => setConfig({ ...config, defaultResolution: value })}>
                  <SelectTrigger className="bg-gray-800 border-slate-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2160p">4K (2160p)</SelectItem>
                    <SelectItem value="1080p">Full HD (1080p)</SelectItem>
                    <SelectItem value="720p">HD (720p)</SelectItem>
                    <SelectItem value="480p">SD (480p)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Generate Thumbnails</Label>
                <Switch
                  checked={config.generateThumbnails}
                  onCheckedChange={(checked) => setConfig({ ...config, generateThumbnails: checked })}
                />
              </div>
              <div>
                <Label>Thumbnail Interval (seconds)</Label>
                <Input
                  type="number"
                  value={config.thumbnailInterval}
                  onChange={(e) => setConfig({ ...config, thumbnailInterval: Number(e.target.value) })}
                  className="bg-gray-800 border-slate-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="presets" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Encoding Presets</CardTitle>
              <CardDescription>Pre-configured quality settings for video encoding</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {presets.map((preset) => (
                  <div key={preset.name} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-slate-500/10">
                    <div>
                      <h3 className="font-semibold text-slate-400">{preset.name}</h3>
                      <p className="text-sm text-gray-400">{preset.resolution} • {preset.bitrate}kbps • {preset.fps}fps</p>
                    </div>
                    <Badge className="bg-slate-500/20 text-slate-400">{preset.codec.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="streaming" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Streaming Formats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable HLS</Label>
                  <p className="text-sm text-gray-400">HTTP Live Streaming (Apple)</p>
                </div>
                <Switch
                  checked={config.enableHLS}
                  onCheckedChange={(checked) => setConfig({ ...config, enableHLS: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable DASH</Label>
                  <p className="text-sm text-gray-400">Dynamic Adaptive Streaming</p>
                </div>
                <Switch
                  checked={config.enableDASH}
                  onCheckedChange={(checked) => setConfig({ ...config, enableDASH: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Performance Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Concurrent Encoding Jobs</Label>
                <Input
                  type="number"
                  value={config.maxConcurrentJobs}
                  onChange={(e) => setConfig({ ...config, maxConcurrentJobs: Number(e.target.value) })}
                  className="bg-gray-800 border-slate-500/20"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Priority Encoding for Verified Creators</Label>
                <Switch
                  checked={config.priorityEncoding}
                  onCheckedChange={(checked) => setConfig({ ...config, priorityEncoding: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(config)}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-slate-500 to-blue-500 hover:from-slate-600 hover:to-blue-600"
        >
          {saveMutation.isPending ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
