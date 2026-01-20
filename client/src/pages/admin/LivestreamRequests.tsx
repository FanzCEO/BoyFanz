import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { Radio, CheckCircle, XCircle, Clock } from "lucide-react";

export default function LivestreamRequests() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <Radio className="h-8 w-8" />
          Livestream Requests
        </h1>
        <p className="text-gray-400 mt-2">Manage creator livestream access requests</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">Pending Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Creator</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Requested</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-cyan-500/10">
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  No pending livestream requests
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
