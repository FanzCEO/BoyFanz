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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
  Globe,
  Calculator,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Filter,
  Search,
  MoreHorizontal,
  Plus,
  Edit,
  Building,
  Calendar,
  Settings,
  Shield,
  Flag,
  Percent,
  MapPin,
  Scale,
  Receipt,
  BookOpen,
  AlertCircle,
  Clock,
  Copy,
  Zap,
  FileSpreadsheet,
  History,
  Trash,
  Save
} from "lucide-react";

// TypeScript interfaces
interface TaxRate {
  id: string;
  jurisdiction: string;
  country: string;
  state?: string;
  taxType: string;
  taxName: string;
  rate: number;
  isActive: boolean;
  effectiveDate: string;
  expiryDate?: string;
  minAmount?: number;
  maxAmount?: number;
  applicableCategories: string[];
  exemptions: string[];
  metadata: any;
  createdAt: string;
  updatedAt: string;
}

interface TaxCalculation {
  subtotal: number;
  totalTax: number;
  breakdown: Array<{
    taxType: string;
    taxName: string;
    rate: number;
    amount: number;
    jurisdiction: string;
  }>;
  netAmount: number;
}

interface TaxCompliance {
  jurisdiction: string;
  lastFilingDate?: string;
  nextFilingDate: string;
  status: string;
  filingPeriod: string;
  requiredForms: string[];
  totalTaxCollected: number;
  taxOwed: number;
}

interface TaxAnalytics {
  totalCollected: number;
  totalOwed: number;
  complianceRate: number;
  jurisdictionCount: number;
  collectionsByJurisdiction: Array<{ jurisdiction: string; amount: number; transactions: number }>;
  complianceStatus: Array<{ status: string; count: number; percentage: number }>;
  taxTypesDistribution: Array<{ type: string; amount: number; rate: number }>;
  monthlyTrends: Array<{ month: string; collected: number; owed: number }>;
}

const taxRateSchema = z.object({
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().optional(),
  taxType: z.enum(["vat", "sales_tax", "income_tax", "withholding_tax", "service_tax"]),
  taxName: z.string().min(1, "Tax name is required"),
  rate: z.number().min(0).max(100, "Rate must be between 0 and 100"),
  isActive: z.boolean().default(true),
  effectiveDate: z.string().min(1, "Effective date is required"),
  expiryDate: z.string().optional(),
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),
  applicableCategories: z.array(z.string()).default([]),
  exemptions: z.array(z.string()).default([])
});

const calculationSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  jurisdiction: z.string().min(1, "Jurisdiction is required"),
  taxType: z.string().optional(),
  category: z.string().optional()
});

const TAX_TYPE_COLORS = {
  vat: "bg-blue-500",
  sales_tax: "bg-green-500",
  income_tax: "bg-purple-500",
  withholding_tax: "bg-orange-500",
  service_tax: "bg-pink-500"
};

const COMPLIANCE_COLORS = {
  compliant: "bg-green-500",
  pending: "bg-yellow-500",
  overdue: "bg-red-500",
  submitted: "bg-blue-500"
};

const COUNTRIES = [
  { code: "US", name: "United States", states: ["CA", "NY", "TX", "FL", "WA", "IL"] },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada", states: ["ON", "BC", "AB", "QC"] },
  { code: "AU", name: "Australia", states: ["NSW", "VIC", "QLD", "WA"] },
  { code: "IN", name: "India", states: ["MH", "DL", "KA", "TN"] },
  { code: "SG", name: "Singapore" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" }
];

// Pre-configured tax rate templates
const TAX_TEMPLATES = [
  {
    id: "us-ca-sales",
    name: "California Sales Tax",
    country: "US",
    state: "CA",
    taxType: "sales_tax" as const,
    taxName: "California State Sales Tax",
    rate: 7.25,
    description: "Standard California state sales tax rate"
  },
  {
    id: "us-ny-sales",
    name: "New York Sales Tax",
    country: "US",
    state: "NY",
    taxType: "sales_tax" as const,
    taxName: "New York State Sales Tax",
    rate: 4.0,
    description: "Standard New York state sales tax rate"
  },
  {
    id: "gb-vat",
    name: "UK VAT Standard",
    country: "GB",
    taxType: "vat" as const,
    taxName: "UK Value Added Tax",
    rate: 20.0,
    description: "Standard UK VAT rate"
  },
  {
    id: "de-vat",
    name: "Germany VAT",
    country: "DE",
    taxType: "vat" as const,
    taxName: "German Value Added Tax (MwSt)",
    rate: 19.0,
    description: "Standard German VAT rate"
  },
  {
    id: "fr-vat",
    name: "France VAT",
    country: "FR",
    taxType: "vat" as const,
    taxName: "French Value Added Tax (TVA)",
    rate: 20.0,
    description: "Standard French VAT rate"
  },
  {
    id: "ca-gst",
    name: "Canada GST",
    country: "CA",
    taxType: "sales_tax" as const,
    taxName: "Goods and Services Tax (GST)",
    rate: 5.0,
    description: "Canadian federal GST"
  },
  {
    id: "au-gst",
    name: "Australia GST",
    country: "AU",
    taxType: "sales_tax" as const,
    taxName: "Goods and Services Tax (GST)",
    rate: 10.0,
    description: "Australian GST"
  },
  {
    id: "in-gst",
    name: "India GST Standard",
    country: "IN",
    taxType: "vat" as const,
    taxName: "Goods and Services Tax",
    rate: 18.0,
    description: "Standard Indian GST rate"
  },
  {
    id: "sg-gst",
    name: "Singapore GST",
    country: "SG",
    taxType: "vat" as const,
    taxName: "Goods and Services Tax",
    rate: 8.0,
    description: "Singapore GST (2023 rate)"
  },
  {
    id: "nl-vat",
    name: "Netherlands VAT",
    country: "NL",
    taxType: "vat" as const,
    taxName: "Dutch VAT (BTW)",
    rate: 21.0,
    description: "Standard Netherlands VAT rate"
  },
  {
    id: "se-vat",
    name: "Sweden VAT",
    country: "SE",
    taxType: "vat" as const,
    taxName: "Swedish VAT (Moms)",
    rate: 25.0,
    description: "Standard Swedish VAT rate"
  }
];

export default function TaxRatesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState("rates");
  const [selectedTaxRate, setSelectedTaxRate] = useState<TaxRate | null>(null);
  const [showCreateRate, setShowCreateRate] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [showAuditHistory, setShowAuditHistory] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [bulkImportFile, setBulkImportFile] = useState<File | null>(null);
  const [taxFilters, setTaxFilters] = useState({
    page: 1,
    limit: 50,
    jurisdiction: "all",
    taxType: "all",
    isActive: "all"
  });
  const [calculationResult, setCalculationResult] = useState<TaxCalculation | null>(null);

  // Forms
  const taxRateForm = useForm<z.infer<typeof taxRateSchema>>({
    resolver: zodResolver(taxRateSchema),
    defaultValues: {
      taxType: "vat",
      rate: 0,
      isActive: true,
      applicableCategories: [],
      exemptions: []
    }
  });

  const calculationForm = useForm<z.infer<typeof calculationSchema>>({
    resolver: zodResolver(calculationSchema),
    defaultValues: {
      amount: 0
    }
  });

  // Data fetching
  const { data: taxRates, isLoading: taxRatesLoading, refetch: refetchTaxRates } = useQuery<any>({
    queryKey: ['/api/admin/financial/tax-rates', taxFilters],
    queryFn: () => apiRequest(`/api/admin/financial/tax-rates?${new URLSearchParams(
      Object.entries(taxFilters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== 'all') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString()}`)
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<any>({
    queryKey: ['/api/admin/financial/tax-rates/analytics'],
    queryFn: () => apiRequest('/api/admin/financial/tax-rates/analytics')
  });

  const { data: compliance, isLoading: complianceLoading } = useQuery<any>({
    queryKey: ['/api/admin/financial/tax-compliance'],
    queryFn: () => apiRequest('/api/admin/financial/tax-compliance')
  });

  const { data: auditHistory, isLoading: auditLoading } = useQuery<any>({
    queryKey: ['/api/admin/financial/tax-rates/audit'],
    queryFn: () => apiRequest('/api/admin/financial/tax-rates/audit'),
    enabled: showAuditHistory
  });

  // Mutations
  const createTaxRateMutation = useMutation({
    mutationFn: (data: z.infer<typeof taxRateSchema>) =>
      apiRequest('/api/admin/financial/tax-rates', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Tax rate created successfully" });
      refetchTaxRates();
      setShowCreateRate(false);
      taxRateForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create tax rate", variant: "destructive" });
    }
  });

  const updateTaxRateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TaxRate> }) =>
      apiRequest(`/api/admin/financial/tax-rates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Tax rate updated successfully" });
      refetchTaxRates();
      setSelectedTaxRate(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update tax rate", variant: "destructive" });
    }
  });

  const calculateTaxMutation = useMutation({
    mutationFn: (data: z.infer<typeof calculationSchema>) =>
      apiRequest('/api/admin/financial/tax-rates/calculate', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: (data) => {
      setCalculationResult(data);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Tax calculation failed", variant: "destructive" });
    }
  });

  const applyTemplateMutation = useMutation({
    mutationFn: (templateId: string) => {
      const template = TAX_TEMPLATES.find(t => t.id === templateId);
      if (!template) throw new Error("Template not found");

      return apiRequest('/api/admin/financial/tax-rates', {
        method: 'POST',
        body: JSON.stringify({
          ...template,
          jurisdiction: `${template.country}${template.state ? `-${template.state}` : ''}`,
          effectiveDate: new Date().toISOString().split('T')[0],
          isActive: true,
          applicableCategories: [],
          exemptions: []
        })
      });
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Tax template applied successfully" });
      refetchTaxRates();
      setShowTemplates(false);
      setSelectedTemplate("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to apply template", variant: "destructive" });
    }
  });

  const bulkImportMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/financial/tax-rates/bulk-import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Bulk import failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Imported ${data.imported} tax rates successfully. ${data.failed || 0} failed.`
      });
      refetchTaxRates();
      setShowBulkImport(false);
      setBulkImportFile(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Bulk import failed", variant: "destructive" });
    }
  });

  const exportTaxRatesMutation = useMutation({
    mutationFn: (format: 'csv' | 'excel') =>
      apiRequest(`/api/admin/financial/tax-rates/export?format=${format}`, {
        method: 'GET'
      }),
    onSuccess: (data, format) => {
      // Create download link
      const blob = new Blob([data], {
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tax-rates-${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: "Success", description: "Tax rates exported successfully" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Export failed", variant: "destructive" });
    }
  });

  // Event handlers
  const onSubmitTaxRate = (data: z.infer<typeof taxRateSchema>) => {
    createTaxRateMutation.mutate(data);
  };

  const onSubmitCalculation = (data: z.infer<typeof calculationSchema>) => {
    calculateTaxMutation.mutate(data);
  };

  const handleToggleActive = (taxRate: TaxRate) => {
    updateTaxRateMutation.mutate({
      id: taxRate.id,
      data: { isActive: !taxRate.isActive }
    });
  };

  const handleApplyTemplate = () => {
    if (!selectedTemplate) {
      toast({ title: "Error", description: "Please select a template", variant: "destructive" });
      return;
    }
    applyTemplateMutation.mutate(selectedTemplate);
  };

  const handleBulkImport = () => {
    if (!bulkImportFile) {
      toast({ title: "Error", description: "Please select a file to import", variant: "destructive" });
      return;
    }
    bulkImportMutation.mutate(bulkImportFile);
  };

  const handleExport = (format: 'csv' | 'excel') => {
    exportTaxRatesMutation.mutate(format);
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(dateString));
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find(country => country.code === code)?.name || code;
  };

  const getStatesForCountry = (countryCode: string) => {
    return COUNTRIES.find(country => country.code === countryCode)?.states || [];
  };

  if (taxRatesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading tax rates...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="tax-rates-management">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent" data-testid="page-title">
            Tax Rates Management
          </h1>
          <p className="text-muted-foreground">Configure tax rates by jurisdiction and manage compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowTemplates(true)}
            variant="outline"
            className="border-cyan-500/30 hover:bg-cyan-500/10"
            data-testid="button-templates"
          >
            <Zap className="h-4 w-4 mr-2 text-cyan-400" />
            Templates
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="border-pink-500/30 hover:bg-pink-500/10"
                data-testid="button-bulk-actions"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2 text-pink-400" />
                Bulk Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setShowBulkImport(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV/Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => setShowCreateRate(true)}
            className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            data-testid="button-create-rate"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Tax Rate
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCalculator(true)}
            data-testid="button-calculator"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAuditHistory(true)}
            data-testid="button-audit"
          >
            <History className="h-4 w-4 mr-2" />
            Audit
          </Button>
          <Button
            variant="outline"
            onClick={() => refetchTaxRates()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-collected">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tax Collected</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-collected">
                {formatCurrency(analytics.totalCollected)}
              </div>
              <p className="text-xs text-muted-foreground">
                This fiscal year
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-owed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tax Owed</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-total-owed">
                {formatCurrency(analytics.totalOwed)}
              </div>
              <p className="text-xs text-muted-foreground">
                Pending remittance
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-compliance-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-compliance-rate">
                {analytics.complianceRate}%
              </div>
              <Progress value={analytics.complianceRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card data-testid="card-jurisdictions">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jurisdictions</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-jurisdictions">
                {analytics.jurisdictionCount}
              </div>
              <p className="text-xs text-muted-foreground">
                Countries & states
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rates" data-testid="tab-rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="compliance" data-testid="tab-compliance">Compliance</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="rates" className="space-y-4">
          {/* Tax Rate Filters */}
          <Card data-testid="tax-filters">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select
                    value={taxFilters.jurisdiction}
                    onValueChange={(value) => setTaxFilters(prev => ({ ...prev, jurisdiction: value, page: 1 }))}
                  >
                    <SelectTrigger data-testid="select-jurisdiction">
                      <SelectValue placeholder="All Jurisdictions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jurisdictions</SelectItem>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="tax-type">Tax Type</Label>
                  <Select
                    value={taxFilters.taxType}
                    onValueChange={(value) => setTaxFilters(prev => ({ ...prev, taxType: value, page: 1 }))}
                  >
                    <SelectTrigger data-testid="select-tax-type">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="vat">VAT</SelectItem>
                      <SelectItem value="sales_tax">Sales Tax</SelectItem>
                      <SelectItem value="income_tax">Income Tax</SelectItem>
                      <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
                      <SelectItem value="service_tax">Service Tax</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={taxFilters.isActive}
                    onValueChange={(value) => setTaxFilters(prev => ({ ...prev, isActive: value, page: 1 }))}
                  >
                    <SelectTrigger data-testid="select-status">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="true">Active</SelectItem>
                      <SelectItem value="false">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax Rates Table */}
          <Card data-testid="tax-rates-table">
            <CardHeader>
              <CardTitle>Tax Rates</CardTitle>
              <CardDescription>
                Showing {taxRates?.data?.length || 0} of {taxRates?.total || 0} tax rates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Jurisdiction</TableHead>
                    <TableHead>Tax Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Rate</TableHead>
                    <TableHead>Effective Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {taxRates?.data?.map((taxRate: TaxRate) => (
                    <TableRow key={taxRate.id} data-testid={`row-tax-rate-${taxRate.id}`}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{getCountryName(taxRate.country)}</div>
                          {taxRate.state && (
                            <div className="text-sm text-muted-foreground">{taxRate.state}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{taxRate.taxName}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${TAX_TYPE_COLORS[taxRate.taxType as keyof typeof TAX_TYPE_COLORS]} text-white`}
                          data-testid={`badge-type-${taxRate.id}`}
                        >
                          {taxRate.taxType.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPercentage(taxRate.rate)}
                      </TableCell>
                      <TableCell>{formatDate(taxRate.effectiveDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={taxRate.isActive}
                            onCheckedChange={() => handleToggleActive(taxRate)}
                            data-testid={`switch-active-${taxRate.id}`}
                          />
                          <span className={taxRate.isActive ? "text-green-600" : "text-gray-500"}>
                            {taxRate.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-actions-${taxRate.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedTaxRate(taxRate)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedTaxRate(taxRate)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Rate
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

        <TabsContent value="compliance" className="space-y-4">
          <Card data-testid="compliance-overview">
            <CardHeader>
              <CardTitle>Tax Compliance Overview</CardTitle>
              <CardDescription>Filing status and requirements by jurisdiction</CardDescription>
            </CardHeader>
            <CardContent>
              {compliance?.data?.length > 0 ? (
                <div className="space-y-4">
                  {compliance.data.map((item: TaxCompliance, index: number) => (
                    <div key={index} className="border rounded-lg p-4" data-testid={`compliance-${index}`}>
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium">{item.jurisdiction}</h4>
                            <Badge 
                              className={`${COMPLIANCE_COLORS[item.status as keyof typeof COMPLIANCE_COLORS]} text-white`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Next Filing: </span>
                              <span className="font-medium">{formatDate(item.nextFilingDate)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Period: </span>
                              <span>{item.filingPeriod}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tax Collected: </span>
                              <span className="font-medium">{formatCurrency(item.totalTaxCollected)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Tax Owed: </span>
                              <span className="font-medium text-orange-600">{formatCurrency(item.taxOwed)}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Required Forms: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.requiredForms.map((form: string, formIndex: number) => (
                                <Badge key={formIndex} variant="outline" className="text-xs">
                                  {form}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <FileText className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                          <Button size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            File Return
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No compliance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {analytics && (
            <div className="grid gap-4 md:grid-cols-2">
              {/* Collections by Jurisdiction */}
              <Card data-testid="chart-collections-jurisdiction">
                <CardHeader>
                  <CardTitle>Tax Collections by Jurisdiction</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.collectionsByJurisdiction}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="jurisdiction" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Tax Types Distribution */}
              <Card data-testid="chart-tax-types">
                <CardHeader>
                  <CardTitle>Tax Types Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analytics.taxTypesDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, amount }) => `${type} (${formatCurrency(amount)})`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                      >
                        {analytics.taxTypesDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={TAX_TYPE_COLORS[entry.type as keyof typeof TAX_TYPE_COLORS] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trends */}
              <Card data-testid="chart-monthly-trends" className="col-span-2">
                <CardHeader>
                  <CardTitle>Monthly Tax Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthlyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                      <Line type="monotone" dataKey="collected" stroke="#82ca9d" name="Collected" />
                      <Line type="monotone" dataKey="owed" stroke="#ff7300" name="Owed" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Tax Rate Dialog */}
      <Dialog open={showCreateRate} onOpenChange={setShowCreateRate}>
        <DialogContent className="max-w-2xl" data-testid="dialog-create-rate">
          <DialogHeader>
            <DialogTitle>Create Tax Rate</DialogTitle>
            <DialogDescription>
              Configure a new tax rate for a specific jurisdiction
            </DialogDescription>
          </DialogHeader>
          
          <Form {...taxRateForm}>
            <form onSubmit={taxRateForm.handleSubmit(onSubmitTaxRate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={taxRateForm.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Select country..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRIES.map(country => (
                            <SelectItem key={country.code} value={country.code}>
                              {country.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="Select state..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {getStatesForCountry(taxRateForm.watch("country")).map(state => (
                            <SelectItem key={state} value={state}>
                              {state}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="taxType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-tax-type-create">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="vat">VAT</SelectItem>
                          <SelectItem value="sales_tax">Sales Tax</SelectItem>
                          <SelectItem value="income_tax">Income Tax</SelectItem>
                          <SelectItem value="withholding_tax">Withholding Tax</SelectItem>
                          <SelectItem value="service_tax">Service Tax</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="taxName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Standard VAT" {...field} data-testid="input-tax-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          {...field} 
                          onChange={e => field.onChange(parseFloat(e.target.value))}
                          data-testid="input-tax-rate" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-effective-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} data-testid="input-expiry-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={taxRateForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Active Status</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Enable this tax rate for calculations
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-active"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateRate(false)}
                  data-testid="button-cancel-rate"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createTaxRateMutation.isPending}
                  data-testid="button-create-rate-submit"
                >
                  {createTaxRateMutation.isPending ? 'Creating...' : 'Create Tax Rate'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Tax Calculator Dialog */}
      <Dialog open={showCalculator} onOpenChange={setShowCalculator}>
        <DialogContent className="max-w-lg" data-testid="dialog-calculator">
          <DialogHeader>
            <DialogTitle>Tax Calculator</DialogTitle>
            <DialogDescription>
              Calculate taxes for a specific amount and jurisdiction
            </DialogDescription>
          </DialogHeader>
          
          <Form {...calculationForm}>
            <form onSubmit={calculationForm.handleSubmit(onSubmitCalculation)} className="space-y-4">
              <FormField
                control={calculationForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-calc-amount" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={calculationForm.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-calc-jurisdiction">
                          <SelectValue placeholder="Select jurisdiction..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full"
                disabled={calculateTaxMutation.isPending}
                data-testid="button-calculate"
              >
                {calculateTaxMutation.isPending ? 'Calculating...' : 'Calculate Tax'}
              </Button>
            </form>
          </Form>

          {calculationResult && (
            <div className="mt-4 space-y-4 border-t pt-4" data-testid="calculation-result">
              <h4 className="font-medium">Tax Calculation Result</h4>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(calculationResult.subtotal)}</span>
                </div>
                
                {calculationResult.breakdown.map((tax: any, index: number) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{tax.taxName} ({formatPercentage(tax.rate)}):</span>
                    <span>{formatCurrency(tax.amount)}</span>
                  </div>
                ))}
                
                <div className="flex justify-between font-bold border-t pt-2">
                  <span>Total Tax:</span>
                  <span>{formatCurrency(calculationResult.totalTax)}</span>
                </div>
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(calculationResult.netAmount)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tax Rate Details Modal */}
      <Dialog open={!!selectedTaxRate} onOpenChange={() => setSelectedTaxRate(null)}>
        <DialogContent className="max-w-2xl" data-testid="dialog-tax-rate-details">
          <DialogHeader>
            <DialogTitle>Tax Rate Details</DialogTitle>
            <DialogDescription>
              {selectedTaxRate?.taxName} - {getCountryName(selectedTaxRate?.country || "")}
            </DialogDescription>
          </DialogHeader>

          {selectedTaxRate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Jurisdiction</Label>
                  <div className="font-medium">
                    {getCountryName(selectedTaxRate.country)}
                    {selectedTaxRate.state && ` - ${selectedTaxRate.state}`}
                  </div>
                </div>
                <div>
                  <Label>Tax Type</Label>
                  <Badge className={`${TAX_TYPE_COLORS[selectedTaxRate.taxType as keyof typeof TAX_TYPE_COLORS]} text-white`}>
                    {selectedTaxRate.taxType.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div>
                  <Label>Tax Rate</Label>
                  <div className="text-lg font-medium">{formatPercentage(selectedTaxRate.rate)}</div>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className={selectedTaxRate.isActive ? "text-green-600" : "text-gray-500"}>
                    {selectedTaxRate.isActive ? "Active" : "Inactive"}
                  </div>
                </div>
                <div>
                  <Label>Effective Date</Label>
                  <div>{formatDate(selectedTaxRate.effectiveDate)}</div>
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <div>{selectedTaxRate.expiryDate ? formatDate(selectedTaxRate.expiryDate) : "No expiry"}</div>
                </div>
              </div>

              {selectedTaxRate.applicableCategories.length > 0 && (
                <div>
                  <Label>Applicable Categories</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTaxRate.applicableCategories.map((category: string, index: number) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedTaxRate.exemptions.length > 0 && (
                <div>
                  <Label>Tax Exemptions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTaxRate.exemptions.map((exemption: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {exemption}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tax Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" data-testid="dialog-templates">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2 text-cyan-400" />
              Tax Rate Templates
            </DialogTitle>
            <DialogDescription>
              Quick-apply pre-configured tax rates for common jurisdictions
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            {TAX_TEMPLATES.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer transition-all hover:border-cyan-500/50 ${
                  selectedTemplate === template.id
                    ? 'border-cyan-500 bg-cyan-500/5'
                    : 'border-border'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
                data-testid={`template-${template.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold">{template.name}</h4>
                        <Badge className={`${TAX_TYPE_COLORS[template.taxType]} text-white text-xs`}>
                          {template.taxType.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Flag className="h-3 w-3 mr-1 text-cyan-400" />
                          <span>{getCountryName(template.country)}</span>
                          {template.state && <span className="ml-1 text-muted-foreground">({template.state})</span>}
                        </div>
                        <div className="flex items-center font-semibold text-cyan-400">
                          <Percent className="h-3 w-3 mr-1" />
                          <span>{template.rate}%</span>
                        </div>
                      </div>
                    </div>
                    {selectedTemplate === template.id && (
                      <CheckCircle className="h-5 w-5 text-cyan-400 ml-2" />
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
                setShowTemplates(false);
                setSelectedTemplate("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedTemplate || applyTemplateMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            >
              {applyTemplateMutation.isPending ? 'Applying...' : 'Apply Template'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={showBulkImport} onOpenChange={setShowBulkImport}>
        <DialogContent className="max-w-xl" data-testid="dialog-bulk-import">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2 text-pink-400" />
              Bulk Import Tax Rates
            </DialogTitle>
            <DialogDescription>
              Import multiple tax rates from CSV or Excel file
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Required columns:</strong> jurisdiction, country, taxType, taxName, rate, effectiveDate
                <br />
                <strong>Optional columns:</strong> state, isActive, expiryDate, minAmount, maxAmount
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <Input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setBulkImportFile(file);
                }}
                className="hidden"
                id="bulk-import-file"
              />
              <label htmlFor="bulk-import-file" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium">Click to select file or drag and drop</p>
                <p className="text-xs text-muted-foreground mt-1">CSV or Excel files up to 10MB</p>
              </label>
              {bulkImportFile && (
                <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded">
                  <p className="text-sm font-medium text-cyan-400">{bulkImportFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(bulkImportFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Download CSV Template
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkImport(false);
                setBulkImportFile(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={!bulkImportFile || bulkImportMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600"
            >
              {bulkImportMutation.isPending ? 'Importing...' : 'Import Tax Rates'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit History Dialog */}
      <Dialog open={showAuditHistory} onOpenChange={setShowAuditHistory}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto" data-testid="dialog-audit-history">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <History className="h-5 w-5 mr-2 text-purple-400" />
              Tax Rate Audit History
            </DialogTitle>
            <DialogDescription>
              Track all changes made to tax rates across jurisdictions
            </DialogDescription>
          </DialogHeader>

          {auditLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : auditHistory?.data?.length > 0 ? (
            <div className="space-y-3">
              {auditHistory.data.map((entry: any, index: number) => (
                <Card key={index} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <Badge variant={entry.action === 'create' ? 'default' : entry.action === 'update' ? 'secondary' : 'destructive'}>
                            {entry.action.toUpperCase()}
                          </Badge>
                          <span className="font-medium">{entry.taxRateName}</span>
                          <span className="text-sm text-muted-foreground">
                            {getCountryName(entry.country)}
                            {entry.state && ` - ${entry.state}`}
                          </span>
                        </div>

                        {entry.changes && Object.keys(entry.changes).length > 0 && (
                          <div className="text-sm space-y-1">
                            {Object.entries(entry.changes).map(([field, change]: [string, any]) => (
                              <div key={field} className="flex items-center space-x-2">
                                <span className="text-muted-foreground capitalize">{field}:</span>
                                <span className="line-through text-red-500">{String(change.old)}</span>
                                <span>→</span>
                                <span className="text-green-500">{String(change.new)}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(entry.timestamp)}
                          </div>
                          <div>by {entry.adminEmail || 'System'}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit history available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}