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
  CreditCard,
  Settings,
  Shield,
  Webhook,
  DollarSign,
  Globe,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  Edit,
  TestTube,
  CheckCircle,
  XCircle,
  AlertTriangle,
  MoreHorizontal,
  Key,
  Activity,
  Wallet,
  Bitcoin,
  Banknote,
  Clock,
  TrendingUp
} from "lucide-react";

// TypeScript interfaces
interface PaymentGateway {
  id: string;
  name: string;
  provider: string;
  isActive: boolean;
  supportedCurrencies: string[];
  supportedMethods: string[];
  credentials: Record<string, any>;
  webhookUrl?: string;
  webhookSecret?: string;
  feeStructure: {
    flatFee: number;
    percentageFee: number;
    currency: string;
  };
  limits: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
  };
  configuration: any;
  testMode: boolean;
  lastTestAt?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface PayoutSchedule {
  id: string;
  name: string;
  frequency: string;
  minThreshold: number;
  currency: string;
  isActive: boolean;
  nextPayoutDate: string;
  description?: string;
}

interface WebhookEvent {
  id: string;
  gatewayId: string;
  eventType: string;
  payload: any;
  status: string;
  attempts: number;
  lastAttempt?: string;
  response?: string;
  createdAt: string;
}

interface PaymentAnalytics {
  totalProcessed: number;
  totalFees: number;
  successRate: number;
  averageProcessingTime: number;
  gatewayPerformance: Array<{
    gateway: string;
    volume: number;
    successRate: number;
    averageFee: number;
  }>;
  methodDistribution: Array<{
    method: string;
    count: number;
    volume: number;
  }>;
  currencyBreakdown: Array<{
    currency: string;
    volume: number;
    percentage: number;
  }>;
}

const gatewaySchema = z.object({
  name: z.string().min(1, "Gateway name is required"),
  provider: z.enum(["ccbill", "epoch", "segpay", "verotel", "paxum", "crypto", "bank_transfer"]),
  supportedCurrencies: z.array(z.string()).min(1, "At least one currency must be supported"),
  supportedMethods: z.array(z.string()).min(1, "At least one payment method must be supported"),
  credentials: z.record(z.string()),
  webhookUrl: z.string().url().optional(),
  webhookSecret: z.string().optional(),
  feeStructure: z.object({
    flatFee: z.number().min(0),
    percentageFee: z.number().min(0).max(100),
    currency: z.string().default("USD")
  }),
  limits: z.object({
    minAmount: z.number().min(0),
    maxAmount: z.number().min(0),
    dailyLimit: z.number().min(0)
  }),
  testMode: z.boolean().default(true),
  isActive: z.boolean().default(false)
});

const payoutScheduleSchema = z.object({
  name: z.string().min(1, "Schedule name is required"),
  frequency: z.enum(["daily", "weekly", "monthly", "manual"]),
  minThreshold: z.number().min(0, "Minimum threshold must be non-negative"),
  currency: z.string().default("USD"),
  description: z.string().optional(),
  isActive: z.boolean().default(true)
});

const GATEWAY_STATUS_COLORS = {
  active: "bg-green-500",
  inactive: "bg-gray-500",
  testing: "bg-yellow-500",
  error: "bg-red-500"
};

const WEBHOOK_STATUS_COLORS = {
  success: "bg-green-500",
  failed: "bg-red-500",
  pending: "bg-yellow-500",
  retrying: "bg-orange-500"
};

const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "BTC", "ETH"];
const PAYMENT_METHODS = ["card", "bank_transfer", "crypto", "ach", "wire"];

// Provider-specific credential configurations
const PROVIDER_CREDENTIALS: Record<string, Array<{
  key: string;
  label: string;
  placeholder: string;
  type: 'text' | 'password' | 'url';
  required: boolean;
  description?: string;
}>> = {
  ccbill: [
    { key: 'accountNumber', label: 'Account Number', placeholder: '954620', type: 'text', required: true, description: 'Your CCBill merchant account number' },
    { key: 'subaccountSubscriptions', label: 'SubAccount (Subscriptions)', placeholder: '0008', type: 'text', required: true, description: 'Subaccount for recurring subscription payments' },
    { key: 'subaccountOneTime', label: 'SubAccount (One-Time)', placeholder: '0009', type: 'text', required: true, description: 'Subaccount for single/one-time payments' },
    { key: 'flexFormId', label: 'Flex Form ID', placeholder: '9abdbe27-bd46-4727-bc89-453b8fa63a4f', type: 'text', required: true, description: 'UUID from CCBill FlexForms' },
    { key: 'saltKey', label: 'Salt Key', placeholder: 'Your CCBill salt key', type: 'password', required: true, description: 'Used for webhook signature verification' },
    { key: 'datalinkUsername', label: 'DataLink Username', placeholder: 'API username', type: 'text', required: true, description: 'CCBill DataLink API username' },
    { key: 'datalinkPassword', label: 'DataLink Password', placeholder: 'API password', type: 'password', required: true, description: 'CCBill DataLink API password' },
    { key: 'webhookUrl', label: 'Webhook Endpoint', placeholder: 'https://boyfanz.fanz.website/api/webhooks/ccbill', type: 'url', required: false, description: 'CCBill will POST events here' }
  ],
  epoch: [
    { key: 'companyNumber', label: 'Company Number', placeholder: 'Your Epoch company ID', type: 'text', required: true },
    { key: 'productId', label: 'Product ID', placeholder: 'Product ID', type: 'text', required: true },
    { key: 'apiKey', label: 'API Key', placeholder: 'Epoch API key', type: 'password', required: true },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'Epoch secret key', type: 'password', required: true }
  ],
  segpay: [
    { key: 'packageId', label: 'Package ID', placeholder: 'Your Segpay package', type: 'text', required: true },
    { key: 'userId', label: 'User ID', placeholder: 'Segpay user ID', type: 'text', required: true },
    { key: 'accessKey', label: 'Access Key', placeholder: 'API access key', type: 'password', required: true },
    { key: 'secretKey', label: 'Secret Key', placeholder: 'API secret key', type: 'password', required: true }
  ],
  verotel: [
    { key: 'siteId', label: 'Site ID', placeholder: 'Verotel site ID', type: 'text', required: true },
    { key: 'signatureKey', label: 'Signature Key', placeholder: 'Verotel signature key', type: 'password', required: true },
    { key: 'apiSecret', label: 'API Secret', placeholder: 'Verotel API secret', type: 'password', required: true }
  ],
  paxum: [
    { key: 'email', label: 'Paxum Email', placeholder: 'merchant@example.com', type: 'text', required: true },
    { key: 'sharedSecret', label: 'Shared Secret', placeholder: 'Paxum shared secret', type: 'password', required: true },
    { key: 'apiKey', label: 'API Key', placeholder: 'Paxum API key', type: 'password', required: true }
  ],
  crypto: [
    { key: 'walletAddress', label: 'Wallet Address', placeholder: '0x...', type: 'text', required: true },
    { key: 'network', label: 'Network', placeholder: 'ethereum, bitcoin, etc.', type: 'text', required: true },
    { key: 'apiKey', label: 'Exchange API Key', placeholder: 'Optional for auto-conversion', type: 'password', required: false }
  ],
  bank_transfer: [
    { key: 'bankName', label: 'Bank Name', placeholder: 'Bank of America', type: 'text', required: true },
    { key: 'routingNumber', label: 'Routing Number', placeholder: '121000358', type: 'text', required: true },
    { key: 'accountNumber', label: 'Account Number', placeholder: 'Account number', type: 'password', required: true },
    { key: 'accountType', label: 'Account Type', placeholder: 'checking or savings', type: 'text', required: true }
  ]
};

// Default credentials for CCBill (can be edited by admin)
const CCBILL_DEFAULT_CREDENTIALS = {
  accountNumber: '954620',
  subaccountSubscriptions: '0008',
  subaccountOneTime: '0009',
  flexFormId: '9abdbe27-bd46-4727-bc89-453b8fa63a4f',
  saltKey: '',  // Never prefill sensitive keys
  datalinkUsername: 'JStone1',
  datalinkPassword: '',  // Never prefill passwords
  webhookUrl: 'https://boyfanz.fanz.website/api/webhooks/ccbill'
};

export default function PaymentSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState("gateways");
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  const [showCreateGateway, setShowCreateGateway] = useState(false);
  const [showCreateSchedule, setShowCreateSchedule] = useState(false);
  const [showCredentials, setShowCredentials] = useState<Record<string, boolean>>({});
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [credentialVisibility, setCredentialVisibility] = useState<Record<string, boolean>>({});
  const [showEditGateway, setShowEditGateway] = useState(false);

  // Forms
  const gatewayForm = useForm<z.infer<typeof gatewaySchema>>({
    resolver: zodResolver(gatewaySchema),
    defaultValues: {
      name: "CCBill Primary",
      provider: "ccbill",
      supportedCurrencies: ["USD", "EUR", "GBP", "CAD", "AUD"],
      supportedMethods: ["card"],
      credentials: CCBILL_DEFAULT_CREDENTIALS,
      webhookUrl: "https://boyfanz.fanz.website/api/webhooks/ccbill",
      feeStructure: {
        flatFee: 0.55, // $0.55 flat fee per transaction
        percentageFee: 10.8, // CCBill typical rate for adult
        currency: "USD"
      },
      limits: {
        minAmount: 299, // $2.99 minimum in cents
        maxAmount: 100000, // $1000 max per transaction
        dailyLimit: 1000000 // $10,000 daily limit
      },
      testMode: true,
      isActive: false
    }
  });

  // Watch provider to dynamically update credential fields
  const selectedProvider = gatewayForm.watch("provider");

  // Toggle credential field visibility (for password fields)
  const toggleCredentialFieldVisibility = (fieldKey: string) => {
    setCredentialVisibility(prev => ({
      ...prev,
      [fieldKey]: !prev[fieldKey]
    }));
  };

  // Update credentials when provider changes
  useEffect(() => {
    if (selectedProvider === "ccbill") {
      gatewayForm.setValue("credentials", CCBILL_DEFAULT_CREDENTIALS);
      gatewayForm.setValue("feeStructure.percentageFee", 10.8);
      gatewayForm.setValue("feeStructure.flatFee", 0.55);
    } else {
      // Reset credentials for other providers
      gatewayForm.setValue("credentials", {});
      // Set default fees based on provider
      switch (selectedProvider) {
        case "epoch":
          gatewayForm.setValue("feeStructure.percentageFee", 11.5);
          gatewayForm.setValue("feeStructure.flatFee", 0.50);
          break;
        case "segpay":
          gatewayForm.setValue("feeStructure.percentageFee", 12.0);
          gatewayForm.setValue("feeStructure.flatFee", 0.40);
          break;
        case "verotel":
          gatewayForm.setValue("feeStructure.percentageFee", 10.0);
          gatewayForm.setValue("feeStructure.flatFee", 0.50);
          break;
        case "paxum":
          gatewayForm.setValue("feeStructure.percentageFee", 3.5);
          gatewayForm.setValue("feeStructure.flatFee", 0.25);
          break;
        case "crypto":
          gatewayForm.setValue("feeStructure.percentageFee", 1.0);
          gatewayForm.setValue("feeStructure.flatFee", 0);
          break;
        case "bank_transfer":
          gatewayForm.setValue("feeStructure.percentageFee", 0.5);
          gatewayForm.setValue("feeStructure.flatFee", 3.00);
          break;
      }
    }
  }, [selectedProvider, gatewayForm]);

  const scheduleForm = useForm<z.infer<typeof payoutScheduleSchema>>({
    resolver: zodResolver(payoutScheduleSchema),
    defaultValues: {
      frequency: "weekly",
      minThreshold: 100,
      currency: "USD",
      isActive: true
    }
  });

  // Data fetching
  const { data: gateways, isLoading: gatewaysLoading, refetch: refetchGateways } = useQuery({
    queryKey: ['/api/admin/financial/payment-gateways'],
    queryFn: () => apiRequest('/api/admin/financial/payment-gateways')
  });

  const { data: schedules, isLoading: schedulesLoading, refetch: refetchSchedules } = useQuery({
    queryKey: ['/api/admin/financial/payout-schedules'],
    queryFn: () => apiRequest('/api/admin/financial/payout-schedules')
  });

  const { data: webhookEvents } = useQuery({
    queryKey: ['/api/admin/financial/webhook-events'],
    queryFn: () => apiRequest('/api/admin/financial/webhook-events?limit=20')
  });

  const { data: analytics } = useQuery({
    queryKey: ['/api/admin/financial/payment-analytics'],
    queryFn: () => apiRequest('/api/admin/financial/payment-analytics')
  });

  // Mutations
  const createGatewayMutation = useMutation({
    mutationFn: (data: z.infer<typeof gatewaySchema>) =>
      apiRequest('/api/admin/financial/payment-gateways', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Payment gateway created successfully" });
      refetchGateways();
      setShowCreateGateway(false);
      gatewayForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create gateway", variant: "destructive" });
    }
  });

  const updateGatewayMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PaymentGateway> }) =>
      apiRequest(`/api/admin/financial/payment-gateways/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Gateway updated successfully" });
      refetchGateways();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to update gateway", variant: "destructive" });
    }
  });

  const testGatewayMutation = useMutation({
    mutationFn: (gatewayId: string) =>
      apiRequest(`/api/admin/financial/payment-gateways/${gatewayId}/test`, {
        method: 'POST'
      }),
    onSuccess: (result, gatewayId) => {
      setTestingGateway(null);
      if (result.success) {
        toast({ title: "Success", description: "Gateway test completed successfully" });
      } else {
        toast({ title: "Test Failed", description: result.error || "Gateway test failed", variant: "destructive" });
      }
    },
    onError: (error: any, gatewayId) => {
      setTestingGateway(null);
      toast({ title: "Error", description: error.message || "Test failed", variant: "destructive" });
    }
  });

  const createScheduleMutation = useMutation({
    mutationFn: (data: z.infer<typeof payoutScheduleSchema>) =>
      apiRequest('/api/admin/financial/payout-schedules', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Payout schedule created successfully" });
      refetchSchedules();
      setShowCreateSchedule(false);
      scheduleForm.reset();
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message || "Failed to create schedule", variant: "destructive" });
    }
  });

  // Event handlers
  const onSubmitGateway = (data: z.infer<typeof gatewaySchema>) => {
    createGatewayMutation.mutate(data);
  };

  const onSubmitSchedule = (data: z.infer<typeof payoutScheduleSchema>) => {
    createScheduleMutation.mutate(data);
  };

  const handleTestGateway = (gatewayId: string) => {
    setTestingGateway(gatewayId);
    testGatewayMutation.mutate(gatewayId);
  };

  const toggleCredentialVisibility = (gatewayId: string) => {
    setShowCredentials(prev => ({
      ...prev,
      [gatewayId]: !prev[gatewayId]
    }));
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
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

  if (gatewaysLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading payment settings...</span>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-testid="payment-settings">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" data-testid="page-title">Payment Settings</h1>
          <p className="text-muted-foreground">Configure payment gateways, schedules, and security settings</p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowCreateGateway(true)}
            data-testid="button-create-gateway"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Gateway
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateSchedule(true)}
            data-testid="button-create-schedule"
          >
            <Clock className="h-4 w-4 mr-2" />
            New Schedule
          </Button>
          <Button
            variant="outline"
            onClick={() => refetchGateways()}
            data-testid="button-refresh"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-processed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-processed">
                {formatCurrency(analytics.totalProcessed)}
              </div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-total-fees">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Processing Fees</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600" data-testid="text-total-fees">
                {formatCurrency(analytics.totalFees)}
              </div>
              <p className="text-xs text-muted-foreground">
                Gateway fees paid
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-success-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600" data-testid="text-success-rate">
                {analytics.successRate}%
              </div>
              <Progress value={analytics.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card data-testid="card-avg-processing-time">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-avg-processing-time">
                {analytics.averageProcessingTime}s
              </div>
              <p className="text-xs text-muted-foreground">
                Average response time
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="gateways" data-testid="tab-gateways">Payment Gateways</TabsTrigger>
          <TabsTrigger value="schedules" data-testid="tab-schedules">Payout Schedules</TabsTrigger>
          <TabsTrigger value="webhooks" data-testid="tab-webhooks">Webhooks</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          {/* Payment Gateways Table */}
          <Card data-testid="gateways-table">
            <CardHeader>
              <CardTitle>Payment Gateways</CardTitle>
              <CardDescription>
                Configure and manage payment processing gateways
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Supported Methods</TableHead>
                    <TableHead>Fee Structure</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gateways?.data?.map((gateway: PaymentGateway) => (
                    <TableRow key={gateway.id} data-testid={`row-gateway-${gateway.id}`}>
                      <TableCell className="font-medium">{gateway.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <CreditCard className="h-4 w-4" />
                          <span className="capitalize">{gateway.provider}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`${GATEWAY_STATUS_COLORS[gateway.status as keyof typeof GATEWAY_STATUS_COLORS]} text-white`}
                          data-testid={`badge-status-${gateway.id}`}
                        >
                          {gateway.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {gateway.supportedMethods.slice(0, 2).map(method => (
                            <Badge key={method} variant="outline" className="text-xs">
                              {method}
                            </Badge>
                          ))}
                          {gateway.supportedMethods.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{gateway.supportedMethods.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {gateway.feeStructure.percentageFee}%
                          {gateway.feeStructure.flatFee > 0 && 
                            ` + ${formatCurrency(gateway.feeStructure.flatFee)}`
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={gateway.testMode ? "secondary" : "default"}>
                          {gateway.testMode ? "Test" : "Live"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-testid={`button-actions-${gateway.id}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => setSelectedGateway(gateway)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setSelectedGateway(gateway)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Gateway
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleTestGateway(gateway.id)}
                              disabled={testingGateway === gateway.id}
                            >
                              <TestTube className="h-4 w-4 mr-2" />
                              {testingGateway === gateway.id ? "Testing..." : "Test Connection"}
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

        <TabsContent value="schedules" className="space-y-4">
          {/* Payout Schedules */}
          <Card data-testid="schedules-table">
            <CardHeader>
              <CardTitle>Payout Schedules</CardTitle>
              <CardDescription>
                Configure automated payout schedules and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Schedule Name</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Min Threshold</TableHead>
                    <TableHead>Next Payout</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules?.data?.map((schedule: PayoutSchedule) => (
                    <TableRow key={schedule.id} data-testid={`row-schedule-${schedule.id}`}>
                      <TableCell className="font-medium">{schedule.name}</TableCell>
                      <TableCell className="capitalize">{schedule.frequency}</TableCell>
                      <TableCell>{formatCurrency(schedule.minThreshold, schedule.currency)}</TableCell>
                      <TableCell>{formatDate(schedule.nextPayoutDate)}</TableCell>
                      <TableCell>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          {/* Webhook Events */}
          <Card data-testid="webhooks-table">
            <CardHeader>
              <CardTitle>Recent Webhook Events</CardTitle>
              <CardDescription>
                Monitor webhook deliveries and responses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Last Attempt</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhookEvents?.data?.map((event: WebhookEvent) => (
                    <TableRow key={event.id} data-testid={`row-webhook-${event.id}`}>
                      <TableCell className="font-mono text-sm">{event.eventType}</TableCell>
                      <TableCell>{event.gatewayId}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${WEBHOOK_STATUS_COLORS[event.status as keyof typeof WEBHOOK_STATUS_COLORS]} text-white`}
                        >
                          {event.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.attempts}</TableCell>
                      <TableCell>
                        {event.lastAttempt ? formatDate(event.lastAttempt) : "Never"}
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          {/* Security Settings */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="security-fraud-prevention">
              <CardHeader>
                <CardTitle>Fraud Prevention</CardTitle>
                <CardDescription>Configure fraud detection and prevention settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Real-time Fraud Detection</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable AI-powered fraud detection
                    </div>
                  </div>
                  <Switch defaultChecked data-testid="switch-fraud-detection" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Risk Score Threshold</Label>
                    <div className="text-sm text-muted-foreground">
                      Minimum score to flag transactions
                    </div>
                  </div>
                  <Input type="number" defaultValue="75" className="w-20" data-testid="input-risk-threshold" />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">3D Secure</Label>
                    <div className="text-sm text-muted-foreground">
                      Require 3D Secure for high-risk transactions
                    </div>
                  </div>
                  <Switch defaultChecked data-testid="switch-3d-secure" />
                </div>
              </CardContent>
            </Card>

            <Card data-testid="security-compliance">
              <CardHeader>
                <CardTitle>Compliance & Security</CardTitle>
                <CardDescription>PCI DSS and security compliance settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">PCI DSS Compliance</Label>
                    <div className="text-sm text-muted-foreground">
                      Enable PCI DSS compliant data handling
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Enabled
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Data Encryption</Label>
                    <div className="text-sm text-muted-foreground">
                      Encrypt sensitive payment data
                    </div>
                  </div>
                  <Badge className="bg-green-500 text-white">
                    <Shield className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Audit Logging</Label>
                    <div className="text-sm text-muted-foreground">
                      Log all payment-related activities
                    </div>
                  </div>
                  <Switch defaultChecked data-testid="switch-audit-logging" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Gateway Dialog */}
      <Dialog open={showCreateGateway} onOpenChange={setShowCreateGateway}>
        <DialogContent className="max-w-2xl" data-testid="dialog-create-gateway">
          <DialogHeader>
            <DialogTitle>Create Payment Gateway</DialogTitle>
            <DialogDescription>
              Configure a new payment processing gateway
            </DialogDescription>
          </DialogHeader>
          
          <Form {...gatewayForm}>
            <form onSubmit={gatewayForm.handleSubmit(onSubmitGateway)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={gatewayForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gateway Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Primary Stripe" {...field} data-testid="input-gateway-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={gatewayForm.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provider</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-provider">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ccbill">CCBill (Adult-Friendly)</SelectItem>
                          <SelectItem value="epoch">Epoch Payment Solutions</SelectItem>
                          <SelectItem value="segpay">Segpay</SelectItem>
                          <SelectItem value="verotel">Verotel</SelectItem>
                          <SelectItem value="paxum">Paxum</SelectItem>
                          <SelectItem value="crypto">Crypto Wallet</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer (ACH/Wire)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Provider-Specific Credentials */}
              {selectedProvider && PROVIDER_CREDENTIALS[selectedProvider] && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <h4 className="font-medium">
                        {selectedProvider.toUpperCase()} Credentials
                      </h4>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedProvider === 'ccbill' ? 'PRIMARY GATEWAY' : 'GATEWAY'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {PROVIDER_CREDENTIALS[selectedProvider].map((credField) => (
                      <div key={credField.key} className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          {credField.label}
                          {credField.required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            type={credField.type === 'password' && !credentialVisibility[credField.key]
                              ? 'password'
                              : 'text'}
                            placeholder={credField.placeholder}
                            value={gatewayForm.watch(`credentials.${credField.key}`) || ''}
                            onChange={(e) => {
                              const currentCredentials = gatewayForm.getValues('credentials') || {};
                              gatewayForm.setValue('credentials', {
                                ...currentCredentials,
                                [credField.key]: e.target.value
                              });
                            }}
                            className={credField.type === 'password' ? 'pr-10' : ''}
                            data-testid={`input-cred-${credField.key}`}
                          />
                          {credField.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleCredentialFieldVisibility(credField.key)}
                              data-testid={`toggle-visibility-${credField.key}`}
                            >
                              {credentialVisibility[credField.key] ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                        {credField.description && (
                          <p className="text-xs text-muted-foreground">{credField.description}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {selectedProvider === 'ccbill' && (
                    <Alert className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>CCBill Integration:</strong> FlexForms will be used for secure payment collection.
                        Ensure your Salt Key matches the one configured in CCBill Admin portal for webhook signature verification.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Fee Structure */}
              <div className="space-y-4">
                <h4 className="font-medium">Fee Structure</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={gatewayForm.control}
                    name="feeStructure.flatFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flat Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-flat-fee" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={gatewayForm.control}
                    name="feeStructure.percentageFee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Percentage Fee (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.1"
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-percentage-fee" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={gatewayForm.control}
                    name="feeStructure.currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-fee-currency">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SUPPORTED_CURRENCIES.map(currency => (
                              <SelectItem key={currency} value={currency}>
                                {currency}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Limits */}
              <div className="space-y-4">
                <h4 className="font-medium">Transaction Limits</h4>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={gatewayForm.control}
                    name="limits.minAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-min-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={gatewayForm.control}
                    name="limits.maxAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Amount</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-max-amount" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={gatewayForm.control}
                    name="limits.dailyLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Limit</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            data-testid="input-daily-limit" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateGateway(false)}
                  data-testid="button-cancel-gateway"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createGatewayMutation.isPending}
                  data-testid="button-create-gateway-submit"
                >
                  {createGatewayMutation.isPending ? 'Creating...' : 'Create Gateway'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={showCreateSchedule} onOpenChange={setShowCreateSchedule}>
        <DialogContent className="max-w-lg" data-testid="dialog-create-schedule">
          <DialogHeader>
            <DialogTitle>Create Payout Schedule</DialogTitle>
            <DialogDescription>
              Configure automated payout schedule and thresholds
            </DialogDescription>
          </DialogHeader>
          
          <Form {...scheduleForm}>
            <form onSubmit={scheduleForm.handleSubmit(onSubmitSchedule)} className="space-y-4">
              <FormField
                control={scheduleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Weekly Creator Payouts" {...field} data-testid="input-schedule-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={scheduleForm.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frequency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={scheduleForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-schedule-currency">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUPPORTED_CURRENCIES.map(currency => (
                            <SelectItem key={currency} value={currency}>
                              {currency}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={scheduleForm.control}
                name="minThreshold"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Threshold</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        {...field} 
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        data-testid="input-threshold" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={scheduleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="textarea-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateSchedule(false)}
                  data-testid="button-cancel-schedule"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createScheduleMutation.isPending}
                  data-testid="button-create-schedule-submit"
                >
                  {createScheduleMutation.isPending ? 'Creating...' : 'Create Schedule'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit/View Gateway Dialog */}
      <Dialog open={!!selectedGateway} onOpenChange={(open) => !open && setSelectedGateway(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit-gateway">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {selectedGateway?.name || 'Gateway Details'}
                </DialogTitle>
                <DialogDescription>
                  View and edit gateway configuration - Full admin control
                </DialogDescription>
              </div>
              {selectedGateway && (
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${GATEWAY_STATUS_COLORS[selectedGateway.status as keyof typeof GATEWAY_STATUS_COLORS]} text-white`}
                  >
                    {selectedGateway.status}
                  </Badge>
                  <Badge variant={selectedGateway.testMode ? "secondary" : "default"}>
                    {selectedGateway.testMode ? "Test Mode" : "Live"}
                  </Badge>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedGateway && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Basic Configuration
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Gateway Name</Label>
                    <Input
                      value={selectedGateway.name}
                      onChange={(e) => setSelectedGateway({ ...selectedGateway, name: e.target.value })}
                      data-testid="edit-gateway-name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={selectedGateway.provider}
                      onValueChange={(value) => setSelectedGateway({ ...selectedGateway, provider: value })}
                    >
                      <SelectTrigger data-testid="edit-provider">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ccbill">CCBill (Adult-Friendly)</SelectItem>
                        <SelectItem value="epoch">Epoch Payment Solutions</SelectItem>
                        <SelectItem value="segpay">Segpay</SelectItem>
                        <SelectItem value="verotel">Verotel</SelectItem>
                        <SelectItem value="paxum">Paxum</SelectItem>
                        <SelectItem value="crypto">Crypto Wallet</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer (ACH/Wire)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Credentials Section */}
              {PROVIDER_CREDENTIALS[selectedGateway.provider] && (
                <div className="space-y-4 border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      {selectedGateway.provider.toUpperCase()} Credentials
                    </h4>
                    <Badge variant="outline" className="text-xs">EDITABLE</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {PROVIDER_CREDENTIALS[selectedGateway.provider].map((credField) => (
                      <div key={credField.key} className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          {credField.label}
                          {credField.required && <span className="text-red-500">*</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            type={credField.type === 'password' && !credentialVisibility[`edit_${credField.key}`]
                              ? 'password'
                              : 'text'}
                            placeholder={credField.placeholder}
                            value={selectedGateway.credentials?.[credField.key] || ''}
                            onChange={(e) => {
                              setSelectedGateway({
                                ...selectedGateway,
                                credentials: {
                                  ...selectedGateway.credentials,
                                  [credField.key]: e.target.value
                                }
                              });
                            }}
                            className={credField.type === 'password' ? 'pr-10' : ''}
                            data-testid={`edit-cred-${credField.key}`}
                          />
                          {credField.type === 'password' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                              onClick={() => toggleCredentialFieldVisibility(`edit_${credField.key}`)}
                            >
                              {credentialVisibility[`edit_${credField.key}`] ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          )}
                        </div>
                        {credField.description && (
                          <p className="text-xs text-muted-foreground">{credField.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fee Structure */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Fee Structure
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Flat Fee ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={selectedGateway.feeStructure?.flatFee || 0}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        feeStructure: {
                          ...selectedGateway.feeStructure,
                          flatFee: parseFloat(e.target.value) || 0
                        }
                      })}
                      data-testid="edit-flat-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Percentage Fee (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={selectedGateway.feeStructure?.percentageFee || 0}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        feeStructure: {
                          ...selectedGateway.feeStructure,
                          percentageFee: parseFloat(e.target.value) || 0
                        }
                      })}
                      data-testid="edit-percentage-fee"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select
                      value={selectedGateway.feeStructure?.currency || 'USD'}
                      onValueChange={(value) => setSelectedGateway({
                        ...selectedGateway,
                        feeStructure: { ...selectedGateway.feeStructure, currency: value }
                      })}
                    >
                      <SelectTrigger data-testid="edit-fee-currency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPORTED_CURRENCIES.map(currency => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Transaction Limits */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Transaction Limits
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Amount (cents)</Label>
                    <Input
                      type="number"
                      value={selectedGateway.limits?.minAmount || 0}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        limits: { ...selectedGateway.limits, minAmount: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="edit-min-amount"
                    />
                    <p className="text-xs text-muted-foreground">
                      = ${((selectedGateway.limits?.minAmount || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Maximum Amount (cents)</Label>
                    <Input
                      type="number"
                      value={selectedGateway.limits?.maxAmount || 0}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        limits: { ...selectedGateway.limits, maxAmount: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="edit-max-amount"
                    />
                    <p className="text-xs text-muted-foreground">
                      = ${((selectedGateway.limits?.maxAmount || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Daily Limit (cents)</Label>
                    <Input
                      type="number"
                      value={selectedGateway.limits?.dailyLimit || 0}
                      onChange={(e) => setSelectedGateway({
                        ...selectedGateway,
                        limits: { ...selectedGateway.limits, dailyLimit: parseInt(e.target.value) || 0 }
                      })}
                      data-testid="edit-daily-limit"
                    />
                    <p className="text-xs text-muted-foreground">
                      = ${((selectedGateway.limits?.dailyLimit || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Controls */}
              <div className="space-y-4 border rounded-lg p-4">
                <h4 className="font-medium">Gateway Status</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Test Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Process test transactions only
                      </p>
                    </div>
                    <Switch
                      checked={selectedGateway.testMode}
                      onCheckedChange={(checked) => setSelectedGateway({
                        ...selectedGateway,
                        testMode: checked
                      })}
                      data-testid="edit-test-mode"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Active</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable gateway for payments
                      </p>
                    </div>
                    <Switch
                      checked={selectedGateway.isActive}
                      onCheckedChange={(checked) => setSelectedGateway({
                        ...selectedGateway,
                        isActive: checked
                      })}
                      data-testid="edit-is-active"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between pt-4 border-t">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleTestGateway(selectedGateway.id)}
                    disabled={testingGateway === selectedGateway.id}
                    data-testid="button-test-gateway"
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testingGateway === selectedGateway.id ? "Testing..." : "Test Connection"}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedGateway(null)}
                    data-testid="button-cancel-edit"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      updateGatewayMutation.mutate({
                        id: selectedGateway.id,
                        data: {
                          name: selectedGateway.name,
                          provider: selectedGateway.provider,
                          credentials: selectedGateway.credentials,
                          feeStructure: selectedGateway.feeStructure,
                          limits: selectedGateway.limits,
                          testMode: selectedGateway.testMode,
                          isActive: selectedGateway.isActive
                        }
                      });
                      setSelectedGateway(null);
                    }}
                    disabled={updateGatewayMutation.isPending}
                    data-testid="button-save-gateway"
                  >
                    {updateGatewayMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}