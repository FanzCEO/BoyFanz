import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { UserPlus, DollarSign, Users, Link2, Settings } from "lucide-react";

export default function ReferralsManagement() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Link2 className="h-8 w-8" />
          Referrals Management
        </h1>
        <p className="text-gray-400 mt-2">Manage referral program and track commissions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">2,847</div>
            <p className="text-gray-400">Total Referrals</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">+184</div>
            <p className="text-gray-400">This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">$18,452</div>
            <p className="text-gray-400">Commissions Paid</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-yellow-400">$2,847</div>
            <p className="text-gray-400">Pending Payouts</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-900 border border-cyan-500/20">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Program Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Top Referrers</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20">
                    <TableHead>User</TableHead>
                    <TableHead>Total Referrals</TableHead>
                    <TableHead>Active Referrals</TableHead>
                    <TableHead>Total Earned</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-cyan-500/10">
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No referral data available
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-cyan-500/20">
                    <TableHead>Referrer</TableHead>
                    <TableHead>New User</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="border-cyan-500/10">
                    <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                      No recent referrals
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Referral Program Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Commission Percentage</Label>
                  <Input
                    type="number"
                    defaultValue="10"
                    className="bg-gray-800 border-cyan-500/20"
                    placeholder="Enter percentage (1-50)"
                  />
                  <p className="text-sm text-gray-500 mt-1">% of referred user's first purchase</p>
                </div>
                <div>
                  <Label>Recurring Commission Percentage</Label>
                  <Input
                    type="number"
                    defaultValue="5"
                    className="bg-gray-800 border-cyan-500/20"
                    placeholder="Enter percentage (1-25)"
                  />
                  <p className="text-sm text-gray-500 mt-1">% of referred user's recurring subscriptions</p>
                </div>
                <div>
                  <Label>Minimum Payout Amount</Label>
                  <Input
                    type="number"
                    defaultValue="50"
                    className="bg-gray-800 border-cyan-500/20"
                    placeholder="Minimum amount in dollars"
                  />
                  <p className="text-sm text-gray-500 mt-1">Minimum earnings before payout</p>
                </div>
                <div>
                  <Label>Cookie Duration (Days)</Label>
                  <Input
                    type="number"
                    defaultValue="30"
                    className="bg-gray-800 border-cyan-500/20"
                    placeholder="Days referral link is valid"
                  />
                  <p className="text-sm text-gray-500 mt-1">How long referral tracking lasts</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <Button className="bg-gradient-to-r from-cyan-500 to-blue-500">
                  <Settings className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-cyan-500/20">
            <CardHeader>
              <CardTitle className="text-cyan-400">Referral Link Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Base URL</Label>
                <Input
                  defaultValue="https://boyfanz.fanz.website/ref/"
                  className="bg-gray-800 border-cyan-500/20"
                  readOnly
                />
                <p className="text-sm text-gray-500 mt-1">Users will have unique codes appended to this URL</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
