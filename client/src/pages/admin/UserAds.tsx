import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Megaphone, Eye, DollarSign, Plus } from "lucide-react";

export default function UserAds() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-400 flex items-center gap-2">
            <Megaphone className="h-8 w-8" />
            User Ads Management
          </h1>
          <p className="text-gray-400 mt-2">Manage creator-purchased advertising</p>
        </div>
        <Button className="bg-gradient-to-r from-slate-500 to-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          New Ad Campaign
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">24</div>
            <p className="text-gray-400">Active Campaigns</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">1.2M</div>
            <p className="text-gray-400">Total Impressions</p>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-slate-500/20">
          <CardContent className="pt-6">
            <div className="text-3xl font-bold text-slate-400">$4,250</div>
            <p className="text-gray-400">Ad Revenue</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-900 border-slate-500/20">
        <CardHeader>
          <CardTitle className="text-slate-400">Active Ad Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-500/20">
                <TableHead>Campaign</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Impressions</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Spend</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-slate-500/10">
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No active campaigns
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
