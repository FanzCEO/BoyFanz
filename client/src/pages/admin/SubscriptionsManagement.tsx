import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Users, DollarSign, TrendingUp, UserPlus } from "lucide-react";

export default function SubscriptionsManagement() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Subscriptions Management
        </h1>
        <p className="text-gray-400 mt-2">Platform subscription analytics and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">7,038</div>
            <p className="text-gray-400">Total Subscriptions</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-green-400">+248</div>
            <p className="text-gray-400">This Month</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">$84.2K</div>
            <p className="text-gray-400">Monthly Recurring</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-cyan-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-cyan-400">94.2%</div>
            <p className="text-gray-400">Retention Rate</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Subscriber</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next Billing</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-cyan-500/10">
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Loading subscriptions...
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
