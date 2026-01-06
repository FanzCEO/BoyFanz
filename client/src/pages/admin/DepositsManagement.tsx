import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Wallet,
  Shield,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  Activity,
  Flag,
  FileText,
  Building,
  CreditCard,
  Banknote,
  Bitcoin,
  Globe,
  Settings,
  Zap,
  Play,
  FileSpreadsheet,
  Save,
  Copy,
  Target
} from "lucide-react";

// TypeScript interfaces
interface Deposit {
  id: string;
  userId: string;
  username?: string;
  userEmail?: string;
  amount: number;
  currency: string;
  method: string;
  provider: string;
  status: string;
  amlStatus: string;
  riskScore: number;
  reference: string;
  description?: string;
  metadata: any;
  processedBy?: string;
  processedAt?: string;
  adminNotes?: string;
  verificationDocuments: string[];
  sourceOfFunds?: string;
  createdAt: string;
  updatedAt: string;
}

interface AmlCheck {
  id: string;
  userId: string;
  checkType: string;
  status: string;
  riskLevel: string;
  findings: any;
  performedAt: string;
  performedBy: string;
  expiresAt?: string;
}

interface DepositAnalytics {
  totalDeposits: number;
  totalVolume: number;
  averageDeposit: number;
  pendingReview: number;
  amlCompliance: number;
  depositTrends: Array<{ date: string; amount: number; count: number }>;
  methodDistribution: Array<{ method: string; count: number; volume: number }>;
  statusDistribution: Array<{ status: string; count: number; percentage: number }>;
  riskDistribution: Array<{ level: string; count: number }>;
  amlStatusBreakdown: Array<{ status: string; count: number }>;
}

interface DepositFilters {
  page: number;
  limit: number;
  status?: string;
  amlStatus?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  method?: string;
  riskLevel?: string;
}

const STATUS_COLORS = {
  pending: "bg-yellow-500",
  approved: "bg-green-500",
  rejected: "bg-red-500",
  processing: "bg-blue-500",
  failed: "bg-red-600",
  cancelled: "bg-gray-500"
};

const AML_STATUS_COLORS = {
  pending: "bg-yellow-500",
  clear: "bg-green-500",
  flagged: "bg-orange-500",
  blocked: "bg-red-500",
  review: "bg-purple-500"
};

const RISK_COLORS = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  critical: "bg-red-500"
};

// Quick Action Templates
const QUICK_ACTION_TEMPLATES = [
  {
    id: "approve-low-risk",
    name: "Approve Low-Risk Deposits",
    description: "Auto-approve all pending deposits with risk score < 25",
    icon: CheckCircle,
    color: "green",
    filters: { status: "pending", maxRiskScore: 25 },
    action: "approve",
    requiresConfirmation: false
  },
  {
    id: "flag-high-risk",
    name: "Flag High-Risk Deposits",
    description: "Flag deposits with risk score > 75 for manual review",
    icon: Flag,
    color: "orange",
    filters: { minRiskScore: 75 },
    action: "flag_review",
    requiresConfirmation: true
  },
  {
    id: "review-large-amounts",
    name: "Review Large Deposits",
    description: "Flag deposits over $10,000 for AML compliance review",
    icon: DollarSign,
    color: "purple",
    filters: { minAmount: 1000000 }, // in cents
    action: "flag_review",
    requiresConfirmation: true
  },
  {
    id: "crypto-enhanced-review",
    name: "Enhanced Crypto Review",
    description: "Apply enhanced due diligence to all cryptocurrency deposits",
    icon: Bitcoin,
    color: "blue",
    filters: { method: "crypto" },
    action: "enhanced_review",
    requiresConfirmation: true
  },
  {
    id: "approve-verified-users",
    name: "Approve Verified Users",
    description: "Auto-approve deposits from KYC-verified users with good history",
    icon: Shield,
    color: "cyan",
    filters: { kycStatus: "verified", maxRiskScore: 50 },
    action: "approve",
    requiresConfirmation: false
  },
  {
    id: "export-suspicious",
    name: "Export Suspicious Activity",
    description: "Export all flagged deposits for SAR filing",
    icon: Download,
    color: "red",
    filters: { amlStatus: "flagged" },
    action: "export_sar",
    requiresConfirmation: false
  }
];

// AML Report Templates
const AML_REPORT_TEMPLATES = [
  {
    id: "daily-summary",
    name: "Daily Deposit Summary",
    description: "Summary of all deposits in the last 24 hours",
    period: "24h",
    format: "pdf",
    includes: ["total_volume", "count", "avg_amount", "risk_distribution"]
  },
  {
    id: "weekly-aml",
    name: "Weekly AML Compliance Report",
    description: "Comprehensive AML review for the past week",
    period: "7d",
    format: "pdf",
    includes: ["flagged_transactions", "high_risk_users", "kyc_status", "sar_filed"]
  },
  {
    id: "monthly-regulatory",
    name: "Monthly Regulatory Filing",
    description: "Complete regulatory compliance report for the month",
    period: "30d",
    format: "excel",
    includes: ["all_deposits", "aml_checks", "blocked_users", "refunds"]
  },
  {
    id: "suspicious-activity",
    name: "Suspicious Activity Report (SAR)",
    description: "SAR-compliant report for flagged transactions",
    period: "custom",
    format: "pdf",
    includes: ["flagged_only", "user_details", "source_of_funds", "investigation_notes"]
  },
  {
    id: "large-transactions",
    name: "Large Transaction Report (CTR)",
    description: "Currency Transaction Report for deposits over $10,000",
    period: "custom",
    format: "pdf",
    includes: ["large_deposits", "user_identification", "purpose"]
  },
  {
    id: "risk-analysis",
    name: "Risk Analysis Dashboard",
    description: "Detailed risk scoring analysis and trends",
    period: "30d",
    format: "excel",
    includes: ["risk_scores", "trends", "anomalies", "recommendations"]
  }
];

export default function DepositsManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState("deposits");
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showReportTemplates, setShowReportTemplates] = useState(false);
  const [selectedQuickAction, setSelectedQuickAction] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<string>("");
  const [filters, setFilters] = useState<DepositFilters>({
    page: 1,
    limit: 50
  });
  const [selectedDeposits, setSelectedDeposits] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>('');

  // Data fetching
  const { data: deposits, isLoading: depositsLoading, refetch: refetchDeposits } = useQuery({
    queryKey: ['/api/admin/financial/deposits', filters],
    queryFn: () => apiRequest(`/api/admin/financial/deposits?${new URLSearchParams(
      Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}`)
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['/api/admin/financial/deposits/analytics'],
    queryFn: () => apiRequest('/api/admin/financial/deposits/analytics')
  });

  const { data: amlChecks } = useQuery({
    queryKey: ['/api/admin/financial/aml/checks'],
    queryFn: () => apiRequest('/api/admin/financial/aml/checks?limit=20')
  });

  // Mutations
  const updateDepositStatusMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest(`/api/admin/financial/deposits/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Deposit status updated" });
      refetchDeposits();
      setSelectedDeposit(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update status", variant: "destructive" });
    }
  });

  const bulkOperationMutation = useMutation({
    mutationFn: (data: any) =>
      apiRequest('/api/admin/financial/deposits/bulk', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (result) => {
      toast({ title: "Success", description: `Bulk operation completed. Processed ${result.processed} deposits.` });
      refetchDeposits();
      setSelectedDeposits([]);
      setBulkAction('');
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Bulk operation failed", variant: "destructive" });
    }
  });

  const executeQuickActionMutation = useMutation({
    mutationFn: (templateId: string) => {
      const template = QUICK_ACTION_TEMPLATES.find(t => t.id === templateId);
      if (!template) throw new Error("Template not found");

      return apiRequest('/api/admin/financial/deposits/quick-action', {
        method: 'POST',
        body: JSON.stringify({
          action: template.action,
          filters: template.filters
        })
      });
    },
    onSuccess: (result) => {
      toast({
        title: "Success",
        description: `Quick action completed. Processed ${result.affected} deposits.`
      });
      refetchDeposits();
      setShowQuickActions(false);
      setSelectedQuickAction("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Quick action failed", variant: "destructive" });
    }
  });

  const generateReportMutation = useMutation({
    mutationFn: (templateId: string) => {
      const template = AML_REPORT_TEMPLATES.find(t => t.id === templateId);
      if (!template) throw new Error("Report template not found");

      return apiRequest('/api/admin/financial/deposits/generate-report', {
        method: 'POST',
        body: JSON.stringify({
          templateId,
          period: template.period,
          format: template.format,
          includes: template.includes
        })
      });
    },
    onSuccess: (data, templateId) => {
      const template = AML_REPORT_TEMPLATES.find(t => t.id === templateId);
      // Download report
      const blob = new Blob([data], {
        type: template?.format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateId}-${new Date().toISOString().split('T')[0]}.${template?.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Success", description: "Report generated successfully" });
      setShowReportTemplates(false);
      setSelectedReport("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Report generation failed", variant: "destructive" });
    }
  });

  // Event handlers
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleSelectDeposit = (depositId: string) => {
    setSelectedDeposits(prev => 
      prev.includes(depositId) 
        ? prev.filter(id => id !== depositId)
        : [...prev, depositId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDeposits.length === deposits?.data?.length) {
      setSelectedDeposits([]);
    } else {
      setSelectedDeposits(deposits?.data?.map((d: Deposit) => d.id) || []);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedDeposits.length === 0) return;

    bulkOperationMutation.mutate({
      depositIds: selectedDeposits,
      operation: bulkAction,
      data: {}
    });
  };

  const handleUpdateStatus = (status: string, amlStatus?: string, notes?: string) => {
    if (!selectedDeposit) return;

    updateDepositStatusMutation.mutate({
      id: selectedDeposit.id,
      data: {
        status,
        amlStatus,
        notes
      }
    });
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getRiskLevel = (score: number): string => {
    if (score <= 25) return 'low';
    if (score <= 50) return 'medium';
    if (score <= 75) return 'high';
    return 'critical';
  };

  if (depositsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading deposits...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="deposits-management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent" data-testid="page-title">
            Deposits Management
          </h1>
          <p className="text-muted-foreground">Monitor deposits, verify compliance, and manage AML requirements</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowQuickActions(true)}
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10"
            data-testid="button-quick-actions"
          >
            <Zap className="h-4 w-4 mr-2 text-cyan-400" />
            Quick Actions
          </Button>
          <Button
            onClick={() => setShowReportTemplates(true)}
            variant="outline"
            className="border-pink-500/30 hover:bg-pink-500/10"
            data-testid="button-report-templates"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2 text-pink-400" />
            AML Reports
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            data-testid="button-toggle-filters"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button
            onClick={() => refetchDeposits()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-deposits">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-deposits">
                {analytics.totalDeposits?.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg: {formatCurrency(analytics.averageDeposit)}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-volume">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-volume">
                {formatCurrency(analytics.totalVolume)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time deposits
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-pending-review">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-pending-review">
                {analytics.pendingReview}
              </div>
              <p className="text-xs text-muted-foreground">
                Requires attention
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-aml-compliance">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AML Compliance</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-aml-compliance">
                {analytics.amlCompliance}%
              </div>
              <Progress value={analytics.amlCompliance} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <Card data-testid="filters-panel">
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger data-testid="select-status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amlStatus">AML Status</Label>
                <Select
                  value={filters.amlStatus || ''}
                  onValueChange={(value) => handleFilterChange('amlStatus', value)}
                >
                  <SelectTrigger data-testid="select-aml-status">
                    <SelectValue placeholder="All AML Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All AML Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="clear">Clear</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="method">Method</Label>
                <Select
                  value={filters.method || ''}
                  onValueChange={(value) => handleFilterChange('method', value)}
                >
                  <SelectTrigger data-testid="select-method">
                    <SelectValue placeholder="All Methods" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Methods</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="card">Credit Card</SelectItem>
                    <SelectItem value="crypto">Cryptocurrency</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="wire">Wire Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate || ''}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  data-testid="input-start-date"
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate || ''}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  data-testid="input-end-date"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="deposits" data-testid="tab-deposits">Deposits</TabsTrigger>
          <TabsTrigger value="aml" data-testid="tab-aml">AML/KYC</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="deposits" className="space-y-4">
          {/* Bulk Actions */}
          {selectedDeposits.length > 0 && (
            <Card data-testid="bulk-actions">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium">
                    {selectedDeposits.length} selected
                  </span>
                  <Select value={bulkAction} onValueChange={setBulkAction}>
                    <SelectTrigger className="w-[200px]" data-testid="select-bulk-action">
                      <SelectValue placeholder="Choose action..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approve">Approve Selected</SelectItem>
                      <SelectItem value="flag_review">Flag for Review</SelectItem>
                      <SelectItem value="export">Export Selected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBulkAction}
                    disabled={!bulkAction || bulkOperationMutation.isPending}
                    data-testid="button-execute-bulk"
                  >
                    Execute
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Deposits Table */}
          <Card data-testid="deposits-table">
            <CardHeader>
              <CardTitle>Deposits</CardTitle>
              <CardDescription>
                Showing {deposits?.data?.length || 0} of {deposits?.total || 0} deposits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedDeposits.length === deposits?.data?.length}
                        onCheckedChange={handleSelectAll}
                        data-testid="checkbox-select-all"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>AML Status</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits?.data?.map((deposit: Deposit) => (
                    <TableRow key={deposit.id} data-testid={`row-deposit-${deposit.id}`}>
                      <TableCell>
                        <Checkbox
                          checked={selectedDeposits.includes(deposit.id)}
                          onCheckedChange={() => handleSelectDeposit(deposit.id)}
                          data-testid={`checkbox-select-${deposit.id}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{deposit.username}</div>
                          <div className="text-sm text-muted-foreground">{deposit.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(deposit.amount, deposit.currency)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {deposit.method === 'crypto' && <Bitcoin className="h-4 w-4 mr-2" />}
                          {deposit.method === 'card' && <CreditCard className="h-4 w-4 mr-2" />}
                          {deposit.method === 'bank_transfer' && <Building className="h-4 w-4 mr-2" />}
                          <span className="capitalize">{deposit.method.replace('_', ' ')}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${STATUS_COLORS[deposit.status as keyof typeof STATUS_COLORS]} text-white`}
                          data-testid={`badge-status-${deposit.id}`}
                        >
                          {deposit.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${AML_STATUS_COLORS[deposit.amlStatus as keyof typeof AML_STATUS_COLORS]} text-white`}
                          data-testid={`badge-aml-${deposit.id}`}
                        >
                          {deposit.amlStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div 
                            className={`w-2 h-2 rounded-full ${RISK_COLORS[getRiskLevel(deposit.riskScore) as keyof typeof RISK_COLORS]}`}
                          />
                          <span className="text-sm">{deposit.riskScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(deposit.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-actions-${deposit.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedDeposit(deposit)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedDeposit(deposit)}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedDeposit(deposit)}>
                              <Flag className="h-4 w-4 mr-2" />
                              Flag for Review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aml" className="space-y-4">
          <Card data-testid="aml-checks">
            <CardHeader>
              <CardTitle>Recent AML/KYC Checks</CardTitle>
              <CardDescription>Anti-Money Laundering and Know Your Customer compliance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {amlChecks?.data?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Check Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Performed At</TableHead>
                      <TableHead>Expires At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {amlChecks.data.map((check: AmlCheck) => (
                      <TableRow key={check.id} data-testid={`row-aml-${check.id}`}>
                        <TableCell>{check.userId}</TableCell>
                        <TableCell className="capitalize">{check.checkType.replace('_', ' ')}</TableCell>
                        <TableCell>
                          <Badge className={`${AML_STATUS_COLORS[check.status as keyof typeof AML_STATUS_COLORS]} text-white`}>
                            {check.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${RISK_COLORS[check.riskLevel as keyof typeof RISK_COLORS]} text-white`}>
                            {check.riskLevel}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(check.performedAt)}</TableCell>
                        <TableCell>
                          {check.expiresAt ? formatDate(check.expiresAt) : "Never"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No AML checks available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Deposit Trends */}
              <Card data-testid="chart-deposit-trends">
                <CardHeader>
                  <CardTitle>Deposit Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.depositTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Method Distribution */}
              <Card data-testid="chart-method-distribution">
                <CardHeader>
                  <CardTitle>Deposit Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.methodDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ method, volume }) => `${method} (${formatCurrency(volume)})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="volume"
                      >
                        {analytics.methodDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={['#8884d8', '#82ca9d', '#ffc658', '#ff7300'][index % 4]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Status Distribution */}
              <Card data-testid="chart-status-distribution">
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.statusDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="status" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card data-testid="chart-risk-distribution">
                <CardHeader>
                  <CardTitle>Risk Level Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.riskDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="level" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Deposit Details Modal */}
      <Dialog open={!!selectedDeposit} onOpenChange={() => setSelectedDeposit(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-deposit-details">
          <DialogHeader>
            <DialogTitle>Deposit Details</DialogTitle>
            <DialogDescription>
              Deposit ID: {selectedDeposit?.id}
            </DialogDescription>
          </DialogHeader>
          
          {selectedDeposit && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>User</Label>
                  <div className="font-medium">{selectedDeposit.username}</div>
                  <div className="text-sm text-muted-foreground">{selectedDeposit.userEmail}</div>
                </div>
                <div>
                  <Label>Amount</Label>
                  <div className="font-medium text-lg">
                    {formatCurrency(selectedDeposit.amount, selectedDeposit.currency)}
                  </div>
                </div>
                <div>
                  <Label>Method</Label>
                  <div className="capitalize">{selectedDeposit.method.replace('_', ' ')}</div>
                </div>
                <div>
                  <Label>Provider</Label>
                  <div>{selectedDeposit.provider}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={`${STATUS_COLORS[selectedDeposit.status as keyof typeof STATUS_COLORS]} text-white`}>
                    {selectedDeposit.status}
                  </Badge>
                </div>
                <div>
                  <Label>AML Status</Label>
                  <Badge className={`${AML_STATUS_COLORS[selectedDeposit.amlStatus as keyof typeof AML_STATUS_COLORS]} text-white`}>
                    {selectedDeposit.amlStatus}
                  </Badge>
                </div>
                <div>
                  <Label>Risk Score</Label>
                  <div className="flex items-center space-x-2">
                    <div 
                      className={`w-3 h-3 rounded-full ${RISK_COLORS[getRiskLevel(selectedDeposit.riskScore) as keyof typeof RISK_COLORS]}`}
                    />
                    <span>{selectedDeposit.riskScore}</span>
                  </div>
                </div>
                <div>
                  <Label>Reference</Label>
                  <div className="font-mono text-sm">{selectedDeposit.reference}</div>
                </div>
              </div>

              {selectedDeposit.description && (
                <div>
                  <Label>Description</Label>
                  <div className="text-sm">{selectedDeposit.description}</div>
                </div>
              )}

              {selectedDeposit.adminNotes && (
                <div>
                  <Label>Admin Notes</Label>
                  <div className="text-sm bg-muted p-2 rounded">{selectedDeposit.adminNotes}</div>
                </div>
              )}

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium">Update Status</h4>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus('approved', 'clear', 'Approved by admin')}
                    disabled={updateDepositStatusMutation.isPending}
                    data-testid="button-approve"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus('pending', 'review', 'Flagged for manual review')}
                    disabled={updateDepositStatusMutation.isPending}
                    data-testid="button-flag"
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Flag
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleUpdateStatus('rejected', 'blocked', 'Rejected due to compliance issues')}
                    disabled={updateDepositStatusMutation.isPending}
                    data-testid="button-reject"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Actions Dialog */}
      <Dialog open={showQuickActions} onOpenChange={setShowQuickActions}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-quick-actions">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-cyan-400" />
              Quick Action Templates
            </DialogTitle>
            <DialogDescription>
              Automated workflows for common deposit management tasks
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            {QUICK_ACTION_TEMPLATES.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all hover:border-cyan-500/50 ${
                    selectedQuickAction === template.id
                      ? 'border-cyan-500 bg-cyan-500/5'
                      : 'border-border'
                  }`}
                  onClick={() => setSelectedQuickAction(template.id)}
                  data-testid={`quick-action-${template.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-5 w-5 text-${template.color}-400`} />
                          <h4 className="font-semibold">{template.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                        <div className="flex items-center space-x-2">
                          {template.requiresConfirmation && (
                            <Badge variant="outline" className="text-xs text-orange-400">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Requires Confirmation
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {template.action.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                      {selectedQuickAction === template.id && (
                        <CheckCircle className="h-5 w-5 text-cyan-400 ml-2" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowQuickActions(false);
                setSelectedQuickAction("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedQuickAction) {
                  executeQuickActionMutation.mutate(selectedQuickAction);
                }
              }}
              disabled={!selectedQuickAction || executeQuickActionMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            >
              {executeQuickActionMutation.isPending ? 'Executing...' : 'Execute Action'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AML Report Templates Dialog */}
      <Dialog open={showReportTemplates} onOpenChange={setShowReportTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-report-templates">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <FileSpreadsheet className="h-5 w-5 mr-2 text-pink-400" />
              AML Compliance Report Templates
            </DialogTitle>
            <DialogDescription>
              Generate regulatory-compliant reports for deposits and AML monitoring
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            {AML_REPORT_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:border-pink-500/50 ${
                  selectedReport === template.id
                    ? 'border-pink-500 bg-pink-500/5'
                    : 'border-border'
                }`}
                onClick={() => setSelectedReport(template.id)}
                data-testid={`report-${template.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-pink-400" />
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">
                          {template.period}
                        </Badge>
                        <Badge variant="secondary" className="text-xs uppercase">
                          {template.format}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Includes: {template.includes.length} sections
                        </span>
                      </div>
                    </div>
                    {selectedReport === template.id && (
                      <CheckCircle className="h-5 w-5 text-pink-400 ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowReportTemplates(false);
                setSelectedReport("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedReport) {
                  generateReportMutation.mutate(selectedReport);
                }
              }}
              disabled={!selectedReport || generateReportMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            >
              {generateReportMutation.isPending ? 'Generating...' : 'Generate Report'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}