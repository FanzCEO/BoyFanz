import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { FileCheck, Search, Download, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ConsentForm {
  id: string;
  creatorName: string;
  costarName: string;
  contentId: string;
  submittedAt: string;
  status: "pending" | "approved" | "rejected";
  verifiedBy?: string;
  formType: "photo" | "video" | "both";
}

export default function ConsentForms() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: forms, isLoading } = useQuery({
    queryKey: ["/api/admin/consent-forms"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/consent-forms");
      return res.json();
    },
  });

  const mockForms: ConsentForm[] = [
    {
      id: "CF001",
      creatorName: "Creator1",
      costarName: "Costar A",
      contentId: "POST123",
      submittedAt: new Date().toISOString(),
      status: "approved",
      formType: "video",
    },
  ];

  const filteredForms = mockForms.filter((form) =>
    form.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    form.costarName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <FileCheck className="h-8 w-8" />
            Costar Consent Forms
          </h1>
          <p className="text-gray-400 mt-2">Model release and consent documentation</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-cyan-500/20">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900 border-cyan-500/20">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-cyan-400">Submitted Forms</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by creator or costar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-cyan-500/20"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-cyan-500/20">
                <TableHead>Form ID</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>Costar</TableHead>
                <TableHead>Content</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredForms.map((form) => (
                <TableRow key={form.id} className="border-cyan-500/10">
                  <TableCell className="font-mono text-cyan-400">{form.id}</TableCell>
                  <TableCell>{form.creatorName}</TableCell>
                  <TableCell>{form.costarName}</TableCell>
                  <TableCell className="font-mono">{form.contentId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-cyan-500/20">
                      {form.formType}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(form.submittedAt), "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    {form.status === "approved" && (
                      <Badge className="bg-green-500/20 text-green-400">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Approved
                      </Badge>
                    )}
                    {form.status === "pending" && (
                      <Badge className="bg-yellow-500/20 text-yellow-400">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                    {form.status === "rejected" && (
                      <Badge className="bg-red-500/20 text-red-400">
                        <XCircle className="h-3 w-3 mr-1" />
                        Rejected
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="text-cyan-400">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
