import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Key, Shield, Smartphone } from "lucide-react";

export default function Password() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <Lock className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Password & Security</h1>
          <p className="text-muted-foreground">Manage your password and security settings</p>
        </div>
      </div>

      {/* Change Password */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" /> Change Password
          </CardTitle>
          <CardDescription>Update your password regularly to keep your account secure</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current">Current Password</Label>
            <Input id="current" type="password" placeholder="Enter current password" />
          </div>
          <div>
            <Label htmlFor="new">New Password</Label>
            <Input id="new" type="password" placeholder="Enter new password" />
            <p className="text-xs text-muted-foreground mt-1">
              At least 8 characters with a mix of letters, numbers, and symbols
            </p>
          </div>
          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" placeholder="Confirm new password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" /> Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Authenticator App</p>
              <p className="text-sm text-muted-foreground">Use an app like Google Authenticator or Authy</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <div className="flex items-center justify-between p-4 border rounded-lg mt-4">
            <div>
              <p className="font-medium">SMS Verification</p>
              <p className="text-sm text-muted-foreground">Receive codes via text message</p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Active Sessions
          </CardTitle>
          <CardDescription>Manage devices where you're logged in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Current Device</p>
                <p className="text-sm text-muted-foreground">This device • Last active now</p>
              </div>
              <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded">Active</span>
            </div>
          </div>
          <Button variant="destructive" className="w-full">Log Out All Other Devices</Button>
        </CardContent>
      </Card>
    </div>
  );
}
