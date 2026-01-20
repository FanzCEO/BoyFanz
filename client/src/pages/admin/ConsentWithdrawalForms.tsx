import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiRequest } from "@/lib/queryClient";
import { FileX, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { format } from "date-fns";

export default function ConsentWithdrawalForms() {
  const { data: withdrawals } = useQuery({
    queryKey: ["/api/admin/consent-withdrawals"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/consent-withdrawals");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
          <FileX className="h-8 w-8" />
          Consent Withdrawal Forms
        </h1>
        <p className="text-gray-400 mt-2">Manage consent revocation requests</p>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="text-cyan-400">Withdrawal Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Request ID</TableHead>
                <TableHead>Costar Name</TableHead>
                <TableHead>Content Affected</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="border-cyan-500/10">
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No withdrawal requests submitted
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
