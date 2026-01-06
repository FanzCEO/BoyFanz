import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, Lock, UserX, Globe } from "lucide-react";

export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Privacy & Security</h1>
          <p className="text-muted-foreground">Control who can see your content and interact with you</p>
        </div>
      </div>

      {/* Profile Visibility */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" /> Profile Visibility
          </CardTitle>
          <CardDescription>Control who can see your profile and content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Show profile to non-subscribers</Label>
              <p className="text-sm text-muted-foreground">Allow anyone to view your profile page</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Show activity status</Label>
              <p className="text-sm text-muted-foreground">Let others see when you're online</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Show subscriber count</Label>
              <p className="text-sm text-muted-foreground">Display your subscriber count on your profile</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Appear in search results</Label>
              <p className="text-sm text-muted-foreground">Allow your profile to be discovered in search</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Content Protection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Content Protection
          </CardTitle>
          <CardDescription>Protect your content from unauthorized access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Watermark media</Label>
              <p className="text-sm text-muted-foreground">Add your username watermark to images and videos</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Block screenshots</Label>
              <p className="text-sm text-muted-foreground">Attempt to prevent screenshots (not guaranteed)</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Right-click protection</Label>
              <p className="text-sm text-muted-foreground">Disable right-click on your media</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Messaging */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" /> Messaging Privacy
          </CardTitle>
          <CardDescription>Control who can message you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Allow messages from non-subscribers</Label>
              <p className="text-sm text-muted-foreground">Let anyone send you messages</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Message requests</Label>
              <p className="text-sm text-muted-foreground">Require approval for messages from new users</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Read receipts</Label>
              <p className="text-sm text-muted-foreground">Show when you've read messages</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
