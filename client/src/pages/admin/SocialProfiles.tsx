import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Share2, Save, CheckCircle, Twitter, Facebook, Instagram, Youtube } from "lucide-react";

export default function SocialProfiles() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState({
    twitter: {
      enabled: true,
      handle: "@boyfanz",
      url: "https://twitter.com/boyfanz",
      followers: 12453,
    },
    facebook: {
      enabled: true,
      handle: "BoyFanzOfficial",
      url: "https://facebook.com/boyfanz",
      followers: 8921,
    },
    instagram: {
      enabled: true,
      handle: "@boyfanz_official",
      url: "https://instagram.com/boyfanz_official",
      followers: 34521,
    },
    youtube: {
      enabled: false,
      handle: "BoyFanz",
      url: "https://youtube.com/@boyfanz",
      followers: 0,
    },
    tiktok: {
      enabled: false,
      handle: "@boyfanz",
      url: "https://tiktok.com/@boyfanz",
      followers: 0,
    },
  });

  const [sharingSettings, setSharingSettings] = useState({
    enableSocialLogin: true,
    enableSocialSharing: true,
    showSocialLinks: true,
    autoPostNewContent: false,
  });

  const handleSave = () => {
    toast({
      title: "Social Profiles Saved",
      description: "Social media settings have been updated.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
          <Share2 className="h-8 w-8" />
          Social Profiles
        </h1>
        <p className="text-gray-400 mt-2">Manage social media integration and profiles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">4</div>
            <p className="text-gray-400">Connected Platforms</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">55.9K</div>
            <p className="text-gray-400">Total Followers</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">2,847</div>
            <p className="text-gray-400">Social Shares</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">1,234</div>
            <p className="text-gray-400">Social Signups</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="profiles" className="space-y-6">
        <TabsList className="bg-gray-900 border border-slate-500/20">
          <TabsTrigger value="profiles">Profiles</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="sharing">Sharing Options</TabsTrigger>
        </TabsList>

        <TabsContent value="profiles" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <Twitter className="h-5 w-5" />
                Twitter / X
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Twitter Integration</Label>
                <Switch
                  checked={profiles.twitter.enabled}
                  onCheckedChange={(checked) =>
                    setProfiles({ ...profiles, twitter: { ...profiles.twitter, enabled: checked } })
                  }
                />
              </div>
              <div>
                <Label>Twitter Handle</Label>
                <Input
                  value={profiles.twitter.handle}
                  onChange={(e) =>
                    setProfiles({ ...profiles, twitter: { ...profiles.twitter, handle: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="@boyfanz"
                />
              </div>
              <div>
                <Label>Profile URL</Label>
                <Input
                  value={profiles.twitter.url}
                  onChange={(e) =>
                    setProfiles({ ...profiles, twitter: { ...profiles.twitter, url: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="https://twitter.com/boyfanz"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                {profiles.twitter.followers.toLocaleString()} followers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <Facebook className="h-5 w-5" />
                Facebook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Facebook Integration</Label>
                <Switch
                  checked={profiles.facebook.enabled}
                  onCheckedChange={(checked) =>
                    setProfiles({ ...profiles, facebook: { ...profiles.facebook, enabled: checked } })
                  }
                />
              </div>
              <div>
                <Label>Facebook Page</Label>
                <Input
                  value={profiles.facebook.handle}
                  onChange={(e) =>
                    setProfiles({ ...profiles, facebook: { ...profiles.facebook, handle: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="BoyFanzOfficial"
                />
              </div>
              <div>
                <Label>Page URL</Label>
                <Input
                  value={profiles.facebook.url}
                  onChange={(e) =>
                    setProfiles({ ...profiles, facebook: { ...profiles.facebook, url: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="https://facebook.com/boyfanz"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                {profiles.facebook.followers.toLocaleString()} followers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <Instagram className="h-5 w-5" />
                Instagram
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable Instagram Integration</Label>
                <Switch
                  checked={profiles.instagram.enabled}
                  onCheckedChange={(checked) =>
                    setProfiles({ ...profiles, instagram: { ...profiles.instagram, enabled: checked } })
                  }
                />
              </div>
              <div>
                <Label>Instagram Handle</Label>
                <Input
                  value={profiles.instagram.handle}
                  onChange={(e) =>
                    setProfiles({ ...profiles, instagram: { ...profiles.instagram, handle: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="@boyfanz_official"
                />
              </div>
              <div>
                <Label>Profile URL</Label>
                <Input
                  value={profiles.instagram.url}
                  onChange={(e) =>
                    setProfiles({ ...profiles, instagram: { ...profiles.instagram, url: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="https://instagram.com/boyfanz_official"
                />
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <CheckCircle className="h-4 w-4 text-green-400" />
                {profiles.instagram.followers.toLocaleString()} followers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400 flex items-center gap-2">
                <Youtube className="h-5 w-5" />
                YouTube
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Enable YouTube Integration</Label>
                <Switch
                  checked={profiles.youtube.enabled}
                  onCheckedChange={(checked) =>
                    setProfiles({ ...profiles, youtube: { ...profiles.youtube, enabled: checked } })
                  }
                />
              </div>
              <div>
                <Label>YouTube Channel</Label>
                <Input
                  value={profiles.youtube.handle}
                  onChange={(e) =>
                    setProfiles({ ...profiles, youtube: { ...profiles.youtube, handle: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="BoyFanz"
                />
              </div>
              <div>
                <Label>Channel URL</Label>
                <Input
                  value={profiles.youtube.url}
                  onChange={(e) =>
                    setProfiles({ ...profiles, youtube: { ...profiles.youtube, url: e.target.value } })
                  }
                  className="bg-gray-800 border-slate-500/20"
                  placeholder="https://youtube.com/@boyfanz"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Social Media Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Login</Label>
                  <p className="text-sm text-gray-500">Allow users to sign in with social accounts</p>
                </div>
                <Switch
                  checked={sharingSettings.enableSocialLogin}
                  onCheckedChange={(checked) =>
                    setSharingSettings({ ...sharingSettings, enableSocialLogin: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Social Sharing</Label>
                  <p className="text-sm text-gray-500">Enable social media share buttons</p>
                </div>
                <Switch
                  checked={sharingSettings.enableSocialSharing}
                  onCheckedChange={(checked) =>
                    setSharingSettings({ ...sharingSettings, enableSocialSharing: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Social Links</Label>
                  <p className="text-sm text-gray-500">Display social media links in footer</p>
                </div>
                <Switch
                  checked={sharingSettings.showSocialLinks}
                  onCheckedChange={(checked) =>
                    setSharingSettings({ ...sharingSettings, showSocialLinks: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          <Card className="bg-gray-900 border-slate-500/20">
            <CardHeader>
              <CardTitle className="text-slate-400">Auto-Posting Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-Post New Content</Label>
                  <p className="text-sm text-gray-500">Automatically share new content to social media</p>
                </div>
                <Switch
                  checked={sharingSettings.autoPostNewContent}
                  onCheckedChange={(checked) =>
                    setSharingSettings({ ...sharingSettings, autoPostNewContent: checked })
                  }
                />
              </div>
              <p className="text-sm text-yellow-400">
                Note: Auto-posting requires OAuth authentication for each platform
              </p>
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
