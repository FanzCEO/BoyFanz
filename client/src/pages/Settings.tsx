import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  User, Shield, Bell, Key, Webhook, Save, Copy, Plus, Trash2,
  Skull, Flame, Lock, Eye, EyeOff, Zap, Settings2, AlertTriangle,
  LogOut, Fingerprint, Smartphone, Calendar, Video
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function Settings() {
  const { user } = useAuth();
  const [profileForm, setProfileForm] = useState({
    displayName: '',
    bio: '',
    avatarUrl: ''
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    marketing: false
  });
  const [showScheduleOnProfile, setShowScheduleOnProfile] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: profile } = useQuery({
    queryKey: ['/api/profile'],
    enabled: false,
  });

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery({
    queryKey: ['/api/api-keys'],
  });

  const { data: webhooks, isLoading: webhooksLoading } = useQuery({
    queryKey: ['/api/webhooks'],
  });

  const { data: creatorProfile } = useQuery<{ showScheduleOnProfile: boolean }>({
    queryKey: ['/api/creator-profiles/me'],
    enabled: !!user,
  });

  // Update state when creator profile loads
  useEffect(() => {
    if (creatorProfile?.showScheduleOnProfile !== undefined) {
      setShowScheduleOnProfile(creatorProfile.showScheduleOnProfile);
    }
  }, [creatorProfile?.showScheduleOnProfile]);

  const toggleScheduleVisibilityMutation = useMutation({
    mutationFn: async (show: boolean) => {
      return apiRequest('PATCH', '/api/scheduled-drops/schedule-visibility', { showScheduleOnProfile: show });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator-profiles/me'] });
      toast({
        title: "Setting Updated",
        description: showScheduleOnProfile ? "Schedule will now appear on your profile" : "Schedule hidden from profile",
      });
    },
    onError: (error) => {
      // Revert on error
      setShowScheduleOnProfile(!showScheduleOnProfile);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleScheduleToggle = (checked: boolean) => {
    setShowScheduleOnProfile(checked);
    toggleScheduleVisibilityMutation.mutate(checked);
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('PUT', '/api/profile', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/profile'] });
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createApiKeyMutation = useMutation({
    mutationFn: async (data: { scopes: string[] }) => {
      return apiRequest('POST', '/api/api-keys', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "API Key Created",
        description: "Your new key has been generated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createWebhookMutation = useMutation({
    mutationFn: async (data: { url: string; eventsJson: string[] }) => {
      return apiRequest('POST', '/api/webhooks', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/webhooks'] });
      toast({
        title: "Webhook Created",
        description: "Your endpoint has been registered",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl" data-testid="settings-page">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-950/80 via-black to-orange-950/80 border border-red-500/20 p-8 mb-8">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 opacity-10">
          <Settings2 className="h-48 w-48 text-red-500" />
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-xl shadow-lg shadow-red-500/30">
            <Skull className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500 mb-1" data-testid="page-title">
              Control Center
            </h1>
            <p className="text-gray-400 text-lg" data-testid="page-description">
              Manage your account, security, and integrations
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gradient-to-r from-gray-900 to-black border border-gray-800/50 rounded-xl p-1.5 h-auto">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
            data-testid="profile-tab"
          >
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
            data-testid="security-tab"
          >
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
            data-testid="notifications-tab"
          >
            <Bell className="h-4 w-4 mr-2" />
            Alerts
          </TabsTrigger>
          <TabsTrigger
            value="api-keys"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
            data-testid="api-keys-tab"
          >
            <Key className="h-4 w-4 mr-2" />
            Keys
          </TabsTrigger>
          <TabsTrigger
            value="webhooks"
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-orange-600 data-[state=active]:text-white py-3 font-bold uppercase tracking-wide"
            data-testid="webhooks-tab"
          >
            <Webhook className="h-4 w-4 mr-2" />
            Hooks
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                    Profile Information
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Update your personal details and public profile
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-red-950/20 to-orange-950/20 rounded-xl border border-red-500/20">
                <div className="relative">
                  <img
                    src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"}
                    alt="Profile Avatar"
                    className="h-24 w-24 rounded-full ring-4 ring-red-500/30 object-cover"
                    data-testid="profile-avatar"
                  />
                  <div className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-br from-red-600 to-orange-600 rounded-full border-2 border-black">
                    <Flame className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-black uppercase tracking-wide text-white" data-testid="profile-name">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-gray-400" data-testid="profile-email">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs font-bold uppercase tracking-wide rounded-full" data-testid="profile-role">
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-gray-800" />

              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-white font-bold uppercase tracking-wide text-sm">
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={profileForm.displayName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Your display name"
                      className="bg-gray-900/50 border-gray-700 focus:border-red-500/50 h-12"
                      data-testid="display-name-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="avatarUrl" className="text-white font-bold uppercase tracking-wide text-sm">
                      Avatar URL
                    </Label>
                    <Input
                      id="avatarUrl"
                      value={profileForm.avatarUrl}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://example.com/avatar.jpg"
                      className="bg-gray-900/50 border-gray-700 focus:border-red-500/50 h-12"
                      data-testid="avatar-url-input"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-white font-bold uppercase tracking-wide text-sm">
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="bg-gray-900/50 border-gray-700 focus:border-red-500/50 resize-none"
                    data-testid="bio-input"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                  data-testid="save-profile-button"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Creator Settings Card */}
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-orange-950/30 to-amber-950/30 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg">
                  <Video className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                    Creator Settings
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure your creator profile and content settings
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl hover:border-orange-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wide">Show Schedule on Profile</h4>
                    <p className="text-sm text-gray-400">
                      Display your upcoming content drops calendar on your public profile
                    </p>
                  </div>
                </div>
                <Switch
                  checked={showScheduleOnProfile}
                  onCheckedChange={handleScheduleToggle}
                  disabled={toggleScheduleVisibilityMutation.isPending}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-orange-600 data-[state=checked]:to-amber-600"
                  data-testid="schedule-visibility-switch"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                    Security Fortress
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Protect your account with advanced security measures
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-green-950/30 to-emerald-950/30 border-2 border-green-500/30 rounded-xl hover:border-green-400/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg shadow-lg shadow-green-500/25">
                      <Fingerprint className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">
                        Add an extra layer of protection to your account
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold uppercase tracking-wide" data-testid="setup-2fa-button">
                    Setup 2FA
                  </Button>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-red-950/30 to-orange-950/30 border-2 border-red-500/30 rounded-xl hover:border-red-400/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg shadow-red-500/25">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Change Password</h4>
                      <p className="text-sm text-gray-400">
                        Update your account password regularly
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide" data-testid="change-password-button">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-950/30 to-amber-950/30 border-2 border-orange-500/30 rounded-xl hover:border-orange-400/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg shadow-lg shadow-orange-500/25">
                      <Smartphone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Active Sessions</h4>
                      <p className="text-sm text-gray-400">
                        Manage your active login sessions
                      </p>
                    </div>
                  </div>
                  <Button className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold uppercase tracking-wide" data-testid="manage-sessions-button">
                    Manage
                  </Button>
                </div>
              </div>

              <Separator className="bg-gray-800 my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <h4 className="font-black text-red-400 uppercase tracking-wide">Danger Zone</h4>
                </div>
                <div className="p-5 border-2 border-red-500/30 rounded-xl bg-gradient-to-r from-red-950/20 to-orange-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg shadow-red-500/25">
                        <LogOut className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h5 className="font-bold text-white uppercase tracking-wide">Sign Out</h5>
                        <p className="text-sm text-gray-400">
                          End your current session
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                      data-testid="logout-button"
                    >
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border-b border-gray-800/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                    Alert Preferences
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Configure how you receive notifications
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                      <Zap className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Email Notifications</h4>
                      <p className="text-sm text-gray-400">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.email}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, email: checked }))}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-orange-600"
                    data-testid="email-notifications-switch"
                  />
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-600 to-amber-600 rounded-lg">
                      <Bell className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Push Notifications</h4>
                      <p className="text-sm text-gray-400">
                        Receive push notifications in your browser
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.push}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, push: checked }))}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-orange-600"
                    data-testid="push-notifications-switch"
                  />
                </div>

                <div className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-900/50 to-gray-800/50 border border-gray-700/50 rounded-xl hover:border-gray-600 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg">
                      <Flame className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white uppercase tracking-wide">Marketing Communications</h4>
                      <p className="text-sm text-gray-400">
                        Receive updates about new features and promotions
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={notificationSettings.marketing}
                    onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, marketing: checked }))}
                    className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-red-600 data-[state=checked]:to-orange-600"
                    data-testid="marketing-notifications-switch"
                  />
                </div>
              </div>

              <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25" data-testid="save-notifications-button">
                <Save className="mr-2 h-4 w-4" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                      API Keys
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Manage your API keys for programmatic access
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={() => createApiKeyMutation.mutate({ scopes: ['read'] })}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                  data-testid="create-api-key-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {apiKeysLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-5 border border-gray-800 rounded-xl animate-pulse bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700 rounded w-1/3 mb-2" />
                        <div className="h-4 bg-gray-800 rounded w-1/4" />
                      </div>
                      <div className="h-10 w-20 bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : apiKeys && Array.isArray(apiKeys) && apiKeys.length > 0 ? (
                <div className="space-y-4">
                  {apiKeys.map((apiKey: any) => (
                    <div key={apiKey.id} className="flex items-center justify-between p-5 border-2 border-gray-800/50 rounded-xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 hover:border-red-500/30 transition-all" data-testid={`api-key-${apiKey.id}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm bg-black/50 px-3 py-1.5 rounded-lg font-mono text-red-400 border border-red-500/20" data-testid={`api-key-hash-${apiKey.id}`}>
                            {apiKey.keyHash.substring(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(apiKey.keyHash)}
                            className="text-gray-400 hover:text-white"
                            data-testid={`copy-api-key-${apiKey.id}`}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500" data-testid={`api-key-created-${apiKey.id}`}>
                          Created: {new Date(apiKey.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                        data-testid={`delete-api-key-${apiKey.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-br from-red-950/30 to-orange-950/30 rounded-full w-fit mx-auto mb-4">
                    <Key className="h-12 w-12 text-red-400/50" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-2" data-testid="no-api-keys-title">
                    No API Keys
                  </h3>
                  <p className="text-gray-400 mb-6" data-testid="no-api-keys-description">
                    Create your first API key to access the BoyFanz API
                  </p>
                  <Button
                    onClick={() => createApiKeyMutation.mutate({ scopes: ['read'] })}
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                    data-testid="create-first-api-key-button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create API Key
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6 mt-6">
          <Card className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800/50 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-red-950/30 to-orange-950/30 border-b border-gray-800/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg">
                    <Webhook className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-black uppercase tracking-wide text-white">
                      Webhooks
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure webhooks to receive real-time notifications
                    </CardDescription>
                  </div>
                </div>
                <Button
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                  data-testid="create-webhook-button"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {webhooksLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-5 border border-gray-800 rounded-xl animate-pulse bg-gradient-to-r from-gray-900/50 to-gray-800/50">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-700 rounded w-2/3 mb-2" />
                        <div className="h-4 bg-gray-800 rounded w-1/3" />
                      </div>
                      <div className="h-10 w-20 bg-gray-700 rounded" />
                    </div>
                  ))}
                </div>
              ) : webhooks && Array.isArray(webhooks) && webhooks.length > 0 ? (
                <div className="space-y-4">
                  {webhooks.map((webhook: any) => (
                    <div key={webhook.id} className="flex items-center justify-between p-5 border-2 border-gray-800/50 rounded-xl bg-gradient-to-r from-gray-900/50 to-gray-800/50 hover:border-red-500/30 transition-all" data-testid={`webhook-${webhook.id}`}>
                      <div>
                        <p className="font-bold text-white" data-testid={`webhook-url-${webhook.id}`}>
                          {webhook.url}
                        </p>
                        <p className="text-sm text-gray-400" data-testid={`webhook-status-${webhook.id}`}>
                          Status: <span className={webhook.status === 'active' ? 'text-green-400' : 'text-red-400'}>{webhook.status}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:bg-gray-800" data-testid={`edit-webhook-${webhook.id}`}>
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10" data-testid={`delete-webhook-${webhook.id}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-br from-red-950/30 to-orange-950/30 rounded-full w-fit mx-auto mb-4">
                    <Webhook className="h-12 w-12 text-red-400/50" />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-wide text-white mb-2" data-testid="no-webhooks-title">
                    No Webhooks Configured
                  </h3>
                  <p className="text-gray-400 mb-6" data-testid="no-webhooks-description">
                    Set up webhooks to receive real-time event notifications
                  </p>
                  <Button
                    className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold uppercase tracking-wide shadow-lg shadow-red-500/25"
                    data-testid="create-first-webhook-button"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Webhook
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
