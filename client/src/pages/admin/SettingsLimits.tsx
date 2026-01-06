import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Settings, Users, Upload, MessageSquare, Video, DollarSign, Clock, Shield } from "lucide-react";
import { useState } from "react";

interface PlatformLimits {
  maxUploadSizeMB: number;
  maxVideoLengthMinutes: number;
  maxPostsPerDay: number;
  maxMessagesPerHour: number;
  maxSubscriptionsPerUser: number;
  maxFollowsPerDay: number;
  maxWithdrawalPerDay: number;
  minWithdrawalAmount: number;
  maxStoragePerUserGB: number;
  rateLimitRequestsPerMinute: number;
  sessionTimeoutMinutes: number;
  maxLoginAttempts: number;
}

export default function SettingsLimits() {
  const { toast } = useToast();
  const [limits, setLimits] = useState<PlatformLimits>({
    maxUploadSizeMB: 500,
    maxVideoLengthMinutes: 60,
    maxPostsPerDay: 50,
    maxMessagesPerHour: 100,
    maxSubscriptionsPerUser: 1000,
    maxFollowsPerDay: 200,
    maxWithdrawalPerDay: 10000,
    minWithdrawalAmount: 20,
    maxStoragePerUserGB: 50,
    rateLimitRequestsPerMinute: 60,
    sessionTimeoutMinutes: 1440,
    maxLoginAttempts: 5,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: PlatformLimits) => {
      const res = await apiRequest("POST", "/api/admin/settings/limits", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Limits Updated", description: "Platform limits saved successfully." });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings/limits"] });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Platform Limits
        </h1>
        <p className="text-gray-400 mt-2">Configure rate limits and restrictions</p>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="bg-gray-900 border border-cyan-500/20">
          <TabsTrigger value="content">Content Limits</TabsTrigger>
          <TabsTrigger value="user">User Limits</TabsTrigger>
          <TabsTrigger value="financial">Financial Limits</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Content Upload Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Upload Size (MB)</Label>
                <Input
                  type="number"
                  value={limits.maxUploadSizeMB}
                  onChange={(e) => setLimits({ ...limits, maxUploadSizeMB: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Video Length (Minutes)</Label>
                <Input
                  type="number"
                  value={limits.maxVideoLengthMinutes}
                  onChange={(e) => setLimits({ ...limits, maxVideoLengthMinutes: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Posts Per Day</Label>
                <Input
                  type="number"
                  value={limits.maxPostsPerDay}
                  onChange={(e) => setLimits({ ...limits, maxPostsPerDay: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Storage Per User (GB)</Label>
                <Input
                  type="number"
                  value={limits.maxStoragePerUserGB}
                  onChange={(e) => setLimits({ ...limits, maxStoragePerUserGB: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Activity Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Messages Per Hour</Label>
                <Input
                  type="number"
                  value={limits.maxMessagesPerHour}
                  onChange={(e) => setLimits({ ...limits, maxMessagesPerHour: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Subscriptions Per User</Label>
                <Input
                  type="number"
                  value={limits.maxSubscriptionsPerUser}
                  onChange={(e) => setLimits({ ...limits, maxSubscriptionsPerUser: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Follows Per Day</Label>
                <Input
                  type="number"
                  value={limits.maxFollowsPerDay}
                  onChange={(e) => setLimits({ ...limits, maxFollowsPerDay: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Max Withdrawal Per Day ($)</Label>
                <Input
                  type="number"
                  value={limits.maxWithdrawalPerDay}
                  onChange={(e) => setLimits({ ...limits, maxWithdrawalPerDay: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Min Withdrawal Amount ($)</Label>
                <Input
                  type="number"
                  value={limits.minWithdrawalAmount}
                  onChange={(e) => setLimits({ ...limits, minWithdrawalAmount: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400 flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Limits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Rate Limit (Requests/Minute)</Label>
                <Input
                  type="number"
                  value={limits.rateLimitRequestsPerMinute}
                  onChange={(e) => setLimits({ ...limits, rateLimitRequestsPerMinute: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Session Timeout (Minutes)</Label>
                <Input
                  type="number"
                  value={limits.sessionTimeoutMinutes}
                  onChange={(e) => setLimits({ ...limits, sessionTimeoutMinutes: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
              <div>
                <Label>Max Login Attempts</Label>
                <Input
                  type="number"
                  value={limits.maxLoginAttempts}
                  onChange={(e) => setLimits({ ...limits, maxLoginAttempts: Number(e.target.value) })}
                  className="bg-gray-800 border-cyan-500/20"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate(limits)}
          disabled={saveMutation.isPending}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          {saveMutation.isPending ? "Saving..." : "Save Limits"}
        </Button>
      </div>
    </div>
  );
}
