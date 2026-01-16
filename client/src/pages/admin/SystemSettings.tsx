import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Settings, Search, Save, RotateCcw, Shield, Mail, Palette, Code,
  Languages, Database, Clock, AlertTriangle, CheckCircle, XCircle,
  Monitor, Key, Globe, Server, HardDrive, Wifi, Eye, EyeOff,
  Download, Upload, RefreshCw, TestTube, Play, Pause, Calendar,
  User, Lock, Zap, FileText, Image, Video, Archive, History,
  Copy, Trash2, Plus, Activity, Link2, Send
} from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";

interface SystemSetting {
  id: string;
  key: string;
  value: string;
  type: "string" | "number" | "boolean" | "json" | "encrypted";
  category: "general" | "maintenance" | "email" | "theme" | "security" | "backup" | "api" | "features" | "languages" | "custom";
  description?: string;
  isPublic: boolean;
  isEditable: boolean;
  validationRules?: any;
  environmentOverride?: string;
  updatedAt: string;
  updatedBy: string;
}

interface EmailSettings {
  id: string;
  smtpHost: string;
  smtpPort: number;
  smtpUsername: string;
  smtpPassword: string;
  smtpSecure: boolean;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
  maxSendRate: number;
  isActive: boolean;
  lastTestedAt?: string;
  testResult?: any;
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  displayMessage: string;
  allowedUserRoles: string[];
  maintenanceType: string;
  createdBy: string;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  scopes: string[];
  rateLimit: number;
  rateLimitWindow: string;
  isActive: boolean;
  lastUsedAt?: string;
  requestCount: number;
  createdBy: string;
  createdAt: string;
  expiresAt?: string;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  isActive: boolean;
  retryAttempts: number;
  successCount: number;
  failureCount: number;
  lastTriggeredAt?: string;
  lastStatus?: string;
  createdBy: string;
  createdAt: string;
}

// Form schemas
const systemSettingFormSchema = z.object({
  key: z.string().min(1, "Key is required").regex(/^[a-z0-9_]+$/, "Key must contain only lowercase letters, numbers, and underscores"),
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json", "encrypted"]),
  category: z.enum(["general", "maintenance", "email", "theme", "security", "backup", "api", "features", "languages", "custom"]),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  isEditable: z.boolean().default(true),
});

const emailSettingsFormSchema = z.object({
  smtpHost: z.string().min(1, "SMTP host is required"),
  smtpPort: z.number().min(1).max(65535),
  smtpUsername: z.string().min(1, "Username is required"),
  smtpPassword: z.string().min(1, "Password is required"),
  smtpSecure: z.boolean().default(true),
  fromEmail: z.string().email("Valid email is required"),
  fromName: z.string().min(1, "From name is required"),
  replyToEmail: z.string().email("Valid email is required"),
  maxSendRate: z.number().min(1).default(100),
  isActive: z.boolean().default(true),
});

const maintenanceFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  displayMessage: z.string().min(1, "Display message is required"),
  allowedUserRoles: z.array(z.string()).default([]),
  maintenanceType: z.enum(["scheduled", "emergency", "security", "upgrade"]),
  isActive: z.boolean().default(false),
});

const apiKeyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  scopes: z.array(z.string()).min(1, "At least one scope is required"),
  rateLimit: z.number().min(1).default(1000),
  rateLimitWindow: z.enum(["minute", "hour", "day"]).default("hour"),
  expiresAt: z.string().optional(),
});

const webhookFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  events: z.array(z.string()).min(1, "At least one event is required"),
  retryAttempts: z.number().min(0).max(5).default(3),
  isActive: z.boolean().default(true),
});

type SystemSettingFormData = z.infer<typeof systemSettingFormSchema>;
type EmailSettingsFormData = z.infer<typeof emailSettingsFormSchema>;
type MaintenanceFormData = z.infer<typeof maintenanceFormSchema>;
type ApiKeyFormData = z.infer<typeof apiKeyFormSchema>;
type WebhookFormData = z.infer<typeof webhookFormSchema>;

export default function SystemSettingsManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Current tab
  const [activeTab, setActiveTab] = useState('general');
  
  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Dialogs
  const [showSettingDialog, setShowSettingDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [showWebhookDialog, setShowWebhookDialog] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Forms
  const settingForm = useForm<SystemSettingFormData>({
    resolver: zodResolver(systemSettingFormSchema),
    defaultValues: {
      key: "",
      value: "",
      type: "string",
      category: "general",
      description: "",
      isPublic: false,
      isEditable: true,
    },
  });

  const emailForm = useForm<EmailSettingsFormData>({
    resolver: zodResolver(emailSettingsFormSchema),
    defaultValues: {
      smtpHost: "",
      smtpPort: 587,
      smtpUsername: "",
      smtpPassword: "",
      smtpSecure: true,
      fromEmail: "",
      fromName: "",
      replyToEmail: "",
      maxSendRate: 100,
      isActive: true,
    },
  });

  const maintenanceForm = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      displayMessage: "",
      allowedUserRoles: [],
      maintenanceType: "scheduled",
      isActive: false,
    },
  });

  const apiKeyForm = useForm<ApiKeyFormData>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      name: "",
      scopes: [],
      rateLimit: 1000,
      rateLimitWindow: "hour",
      expiresAt: "",
    },
  });

  const webhookForm = useForm<WebhookFormData>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: {
      name: "",
      url: "",
      events: [],
      retryAttempts: 3,
      isActive: true,
    },
  });

  // Fetch system settings
  const { data: settings = [], isLoading: settingsLoading, refetch: refetchSettings } = useQuery<any[]>({
    queryKey: ['/api/admin/system-settings', { search: searchQuery, category: categoryFilter !== 'all' ? categoryFilter : undefined }]
  });

  // Fetch email settings
  const { data: emailSettings, isLoading: emailLoading, refetch: refetchEmail } = useQuery<any>({
    queryKey: ['/api/admin/email-settings'] && activeTab === 'email'
  });

  // Fetch maintenance schedules
  const { data: maintenanceSchedules = [], isLoading: maintenanceLoading, refetch: refetchMaintenance } = useQuery<any[]>({
    queryKey: ['/api/admin/maintenance-schedules'] && activeTab === 'maintenance'
  });

  // Fetch system info
  const { data: systemInfo, isLoading: systemInfoLoading } = useQuery<any>({
    queryKey: ['/api/admin/system-info'] && activeTab === 'general'
  });

  // Fetch API keys
  const { data: apiKeys = [], isLoading: apiKeysLoading, refetch: refetchApiKeys } = useQuery<ApiKey[]>({
    queryKey: ['/api/admin/api-keys'] && activeTab === 'api'
  });

  // Fetch webhooks
  const { data: webhooks = [], isLoading: webhooksLoading, refetch: refetchWebhooks } = useQuery<Webhook[]>({
    queryKey: ['/api/admin/webhooks'] && activeTab === 'api'
  });

  // Mutations
  const createSettingMutation = useMutation({
    mutationFn: (data: SystemSettingFormData) => 
      apiRequest('/api/admin/system-settings', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Setting created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      setShowSettingDialog(false);
      settingForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create setting" });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<SystemSettingFormData>) => 
      apiRequest(`/api/admin/system-settings/${id}`, {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Setting updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
      setShowSettingDialog(false);
      setSelectedSetting(null);
      settingForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update setting" });
    }
  });

  const deleteSettingMutation = useMutation({
    mutationFn: (id: string) => 
      apiRequest(`/api/admin/system-settings/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Setting deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/system-settings'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete setting" });
    }
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: (data: EmailSettingsFormData) => 
      apiRequest('/api/admin/email-settings', {
        method: 'PUT',
        body: data
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Email settings updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-settings'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to update email settings" });
    }
  });

  const testEmailMutation = useMutation({
    mutationFn: (email: string) => 
      apiRequest('/api/admin/email-settings/test', {
        method: 'POST',
        body: { email }
      }),
    onSuccess: () => {
      toast({ title: "Test Email Sent", description: "Check your inbox for the test email" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Test Failed", description: error.message || "Failed to send test email" });
    }
  });

  const createMaintenanceMutation = useMutation({
    mutationFn: (data: MaintenanceFormData) => 
      apiRequest('/api/admin/maintenance-schedules', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Maintenance schedule created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/maintenance-schedules'] });
      setShowMaintenanceDialog(false);
      maintenanceForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create maintenance schedule" });
    }
  });

  const backupMutation = useMutation({
    mutationFn: (type: string) =>
      apiRequest('/api/admin/backup', {
        method: 'POST',
        body: { type }
      }),
    onSuccess: () => {
      toast({ title: "Backup Started", description: "System backup has been initiated" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Backup Failed", description: error.message || "Failed to start backup" });
    }
  });

  const createApiKeyMutation = useMutation({
    mutationFn: (data: ApiKeyFormData) =>
      apiRequest('/api/admin/api-keys', {
        method: 'POST',
        body: data
      }),
    onSuccess: (data: any) => {
      toast({
        title: "API Key Created",
        description: "API key has been generated successfully. Copy it now - it won't be shown again."
      });
      setSelectedApiKey(data);
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      apiKeyForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create API key" });
    }
  });

  const revokeApiKeyMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/api-keys/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "API key revoked successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to revoke API key" });
    }
  });

  const createWebhookMutation = useMutation({
    mutationFn: (data: WebhookFormData) =>
      apiRequest('/api/admin/webhooks', {
        method: 'POST',
        body: data
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Webhook created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webhooks'] });
      setShowWebhookDialog(false);
      webhookForm.reset();
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create webhook" });
    }
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/webhooks/${id}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      toast({ title: "Success", description: "Webhook deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/webhooks'] });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to delete webhook" });
    }
  });

  const testWebhookMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/admin/webhooks/${id}/test`, {
        method: 'POST'
      }),
    onSuccess: () => {
      toast({ title: "Test Sent", description: "Webhook test payload delivered successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Test Failed", description: error.message || "Failed to send test webhook" });
    }
  });

  // Helper functions
  const getTypeIcon = (type: string) => {
    const icons = {
      string: <FileText className="h-4 w-4" />,
      number: <Zap className="h-4 w-4" />,
      boolean: <CheckCircle className="h-4 w-4" />,
      json: <Code className="h-4 w-4" />,
      encrypted: <Lock className="h-4 w-4" />
    };
    return icons[type as keyof typeof icons] || <FileText className="h-4 w-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const colors = {
      general: "bg-blue-100 text-blue-800",
      maintenance: "bg-yellow-100 text-yellow-800",
      email: "bg-green-100 text-green-800",
      theme: "bg-purple-100 text-purple-800",
      security: "bg-red-100 text-red-800",
      backup: "bg-gray-100 text-gray-800",
      api: "bg-indigo-100 text-indigo-800",
      features: "bg-orange-100 text-orange-800",
      languages: "bg-pink-100 text-pink-800",
      custom: "bg-teal-100 text-teal-800"
    };
    return (
      <Badge className={colors[category as keyof typeof colors] || colors.general}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    );
  };

  const handleEditSetting = (setting: SystemSetting) => {
    setSelectedSetting(setting);
    settingForm.reset({
      key: setting.key,
      value: setting.value,
      type: setting.type,
      category: setting.category,
      description: setting.description || "",
      isPublic: setting.isPublic,
      isEditable: setting.isEditable,
    });
    setShowSettingDialog(true);
  };

  const handleSubmitSetting = (data: SystemSettingFormData) => {
    if (selectedSetting) {
      updateSettingMutation.mutate({ id: selectedSetting.id, ...data });
    } else {
      createSettingMutation.mutate(data);
    }
  };

  const handleSubmitEmail = (data: EmailSettingsFormData) => {
    updateEmailSettingsMutation.mutate(data);
  };

  const handleSubmitMaintenance = (data: MaintenanceFormData) => {
    createMaintenanceMutation.mutate(data);
  };

  const handleSubmitApiKey = (data: ApiKeyFormData) => {
    createApiKeyMutation.mutate(data);
  };

  const handleSubmitWebhook = (data: WebhookFormData) => {
    createWebhookMutation.mutate(data);
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast({ title: "Copied", description: "API key copied to clipboard" });
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Load email settings into form when data is available
  useEffect(() => {
    if (emailSettings) {
      emailForm.reset({
        smtpHost: emailSettings.smtpHost || "",
        smtpPort: emailSettings.smtpPort || 587,
        smtpUsername: emailSettings.smtpUsername || "",
        smtpPassword: emailSettings.smtpPassword || "",
        smtpSecure: emailSettings.smtpSecure ?? true,
        fromEmail: emailSettings.fromEmail || "",
        fromName: emailSettings.fromName || "",
        replyToEmail: emailSettings.replyToEmail || "",
        maxSendRate: emailSettings.maxSendRate || 100,
        isActive: emailSettings.isActive ?? true,
      });
    }
  }, [emailSettings, emailForm]);

  return (
    <div className="space-y-6" data-testid="system-settings-management-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">
            System Settings Management
          </h1>
          <p className="text-muted-foreground mt-1" data-testid="page-description">
            Configure platform settings, maintenance schedules, email, themes, and security
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBackupDialog(true)}
            data-testid="button-backup"
          >
            <Archive className="h-4 w-4 mr-2" />
            Backup
          </Button>
          
          <Dialog open={showSettingDialog} onOpenChange={setShowSettingDialog}>
            <DialogTrigger asChild>
              <Button 
                onClick={() => {
                  setSelectedSetting(null);
                  settingForm.reset();
                }}
                data-testid="button-create-setting"
              >
                <Settings className="h-4 w-4 mr-2" />
                Add Setting
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle data-testid="dialog-title">
                  {selectedSetting ? 'Edit Setting' : 'Add New Setting'}
                </DialogTitle>
                <DialogDescription>
                  Configure system-wide settings with proper validation and security.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...settingForm}>
                <form onSubmit={settingForm.handleSubmit(handleSubmitSetting)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={settingForm.control}
                      name="key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Setting Key</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., max_upload_size" 
                              {...field} 
                              data-testid="input-key"
                              disabled={selectedSetting?.isEditable === false}
                            />
                          </FormControl>
                          <FormDescription>
                            Unique identifier using lowercase letters, numbers, and underscores
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-type">
                                <SelectValue placeholder="Select value type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="string">String</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="boolean">Boolean</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                              <SelectItem value="encrypted">Encrypted</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="theme">Theme</SelectItem>
                              <SelectItem value="security">Security</SelectItem>
                              <SelectItem value="backup">Backup</SelectItem>
                              <SelectItem value="api">API</SelectItem>
                              <SelectItem value="features">Features</SelectItem>
                              <SelectItem value="languages">Languages</SelectItem>
                              <SelectItem value="custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value</FormLabel>
                          <FormControl>
                            {settingForm.watch("type") === "boolean" ? (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger data-testid="select-boolean-value">
                                  <SelectValue placeholder="Select boolean value" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="true">True</SelectItem>
                                  <SelectItem value="false">False</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : settingForm.watch("type") === "json" ? (
                              <Textarea 
                                placeholder='{"key": "value"}' 
                                {...field} 
                                data-testid="textarea-json-value"
                              />
                            ) : (
                              <Input 
                                placeholder="Enter value" 
                                {...field} 
                                data-testid="input-value"
                                type={settingForm.watch("type") === "number" ? "number" : settingForm.watch("type") === "encrypted" ? "password" : "text"}
                              />
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={settingForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe what this setting does" 
                            {...field} 
                            data-testid="textarea-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={settingForm.control}
                      name="isPublic"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-public"
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Public Setting</FormLabel>
                            <FormDescription>
                              Whether this setting is visible to non-admin users
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={settingForm.control}
                      name="isEditable"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-editable"
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Editable</FormLabel>
                            <FormDescription>
                              Whether this setting can be modified
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowSettingDialog(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={createSettingMutation.isPending || updateSettingMutation.isPending}
                      data-testid="button-save"
                    >
                      {selectedSetting ? "Update" : "Create"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-8" data-testid="main-tabs">
          <TabsTrigger value="general" data-testid="tab-general">General</TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="email" data-testid="tab-email">Email</TabsTrigger>
          <TabsTrigger value="api" data-testid="tab-api">API & Webhooks</TabsTrigger>
          <TabsTrigger value="theme" data-testid="tab-theme">Theme</TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">Security</TabsTrigger>
          <TabsTrigger value="backup" data-testid="tab-backup">Backup</TabsTrigger>
          <TabsTrigger value="custom" data-testid="tab-custom">Custom</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Info */}
            <Card data-testid="card-system-info">
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system status and configuration</CardDescription>
              </CardHeader>
              <CardContent>
                {systemInfoLoading ? (
                  <div className="text-center py-4">Loading system info...</div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Platform Version:</span>
                      <span className="font-mono">{systemInfo?.version || "1.0.0"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Node.js Version:</span>
                      <span className="font-mono">{systemInfo?.nodeVersion || process.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Database Status:</span>
                      <Badge className="bg-green-100 text-green-800">Connected</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uptime:</span>
                      <span>{systemInfo?.uptime || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Memory Usage:</span>
                      <span>{systemInfo?.memoryUsage || "N/A"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card data-testid="card-quick-settings">
              <CardHeader>
                <CardTitle>Quick Settings</CardTitle>
                <CardDescription>Commonly used platform configurations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Registration Open</label>
                    <p className="text-sm text-muted-foreground">Allow new user registrations</p>
                  </div>
                  <Switch data-testid="switch-registration" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Content Moderation</label>
                    <p className="text-sm text-muted-foreground">Auto-moderate uploaded content</p>
                  </div>
                  <Switch data-testid="switch-moderation" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Analytics Tracking</label>
                    <p className="text-sm text-muted-foreground">Enable Google Analytics</p>
                  </div>
                  <Switch data-testid="switch-analytics" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-medium">Debug Mode</label>
                    <p className="text-sm text-muted-foreground">Show debug information</p>
                  </div>
                  <Switch data-testid="switch-debug" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings Table */}
          <Card data-testid="card-settings-table">
            <CardHeader>
              <CardTitle>All System Settings</CardTitle>
              <CardDescription>
                Complete list of system configuration values
              </CardDescription>
              
              <div className="flex items-center gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search settings..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-settings"
                  />
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48" data-testid="filter-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="theme">Theme</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="backup">Backup</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                    <SelectItem value="languages">Languages</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setting</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {settingsLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                          <span className="ml-2">Loading settings...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : settings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center">
                          <Settings className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-muted-foreground">No settings found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    settings.map((setting: any) => (
                      <TableRow key={setting.id} data-testid={`setting-row-${setting.id}`}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{setting.key}</p>
                            {setting.description && (
                              <p className="text-sm text-muted-foreground">{setting.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1">
                              {setting.isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
                              {!setting.isEditable && <Badge variant="outline" className="text-xs">Read-only</Badge>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getCategoryBadge(setting.category)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(setting.type)}
                            <span className="capitalize">{setting.type}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono text-sm max-w-48 truncate">
                            {setting.type === "encrypted" ? "••••••••" : 
                             setting.type === "json" ? JSON.stringify(setting.value).substring(0, 50) + "..." :
                             setting.value}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{format(new Date(setting.updatedAt), 'MMM dd, yyyy')}</p>
                            <p className="text-muted-foreground">{setting.updatedBy}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditSetting(setting)}
                              disabled={!setting.isEditable}
                              data-testid={`edit-setting-${setting.id}`}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteSettingMutation.mutate(setting.id)}
                              disabled={!setting.isEditable}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`delete-setting-${setting.id}`}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings Tab */}
        <TabsContent value="email" className="space-y-4">
          <Card data-testid="card-email-settings">
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure SMTP settings for system emails and notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...emailForm}>
                <form onSubmit={emailForm.handleSubmit(handleSubmitEmail)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={emailForm.control}
                      name="smtpHost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Host</FormLabel>
                          <FormControl>
                            <Input placeholder="smtp.gmail.com" {...field} data-testid="input-smtp-host" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPort"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Port</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="587" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              data-testid="input-smtp-port"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpUsername"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Username</FormLabel>
                          <FormControl>
                            <Input placeholder="your-email@gmail.com" {...field} data-testid="input-smtp-username" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="smtpPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SMTP Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} data-testid="input-smtp-password" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="fromEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Email</FormLabel>
                          <FormControl>
                            <Input placeholder="noreply@yoursite.com" {...field} data-testid="input-from-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="fromName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Name</FormLabel>
                          <FormControl>
                            <Input placeholder="BoyFanz Platform" {...field} data-testid="input-from-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <FormField
                      control={emailForm.control}
                      name="smtpSecure"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-smtp-secure"
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Use TLS/SSL</FormLabel>
                            <FormDescription>
                              Enable secure connection
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={emailForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              data-testid="checkbox-email-active"
                            />
                          </FormControl>
                          <div>
                            <FormLabel>Email Enabled</FormLabel>
                            <FormDescription>
                              Enable email sending
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <Button 
                      type="submit" 
                      disabled={updateEmailSettingsMutation.isPending}
                      data-testid="button-save-email"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Settings
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => testEmailMutation.mutate(user?.email || "")}
                      disabled={testEmailMutation.isPending}
                      data-testid="button-test-email"
                    >
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test Email
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Maintenance Mode</h3>
              <p className="text-sm text-muted-foreground">Schedule maintenance windows and enable maintenance mode</p>
            </div>
            
            <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
              <DialogTrigger asChild>
                <Button data-testid="button-schedule-maintenance">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Maintenance
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule Maintenance</DialogTitle>
                  <DialogDescription>
                    Create a scheduled maintenance window with custom messaging
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...maintenanceForm}>
                  <form onSubmit={maintenanceForm.handleSubmit(handleSubmitMaintenance)} className="space-y-4">
                    <FormField
                      control={maintenanceForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maintenance Title</FormLabel>
                          <FormControl>
                            <Input placeholder="System Upgrade" {...field} data-testid="input-maintenance-title" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the maintenance work" 
                              {...field} 
                              data-testid="textarea-maintenance-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={maintenanceForm.control}
                        name="startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                                data-testid="input-maintenance-start"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={maintenanceForm.control}
                        name="endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Time</FormLabel>
                            <FormControl>
                              <Input 
                                type="datetime-local" 
                                {...field} 
                                data-testid="input-maintenance-end"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={maintenanceForm.control}
                      name="displayMessage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>User Message</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Message shown to users during maintenance" 
                              {...field} 
                              data-testid="textarea-maintenance-message"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowMaintenanceDialog(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createMaintenanceMutation.isPending}>
                        Schedule
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <Card data-testid="card-maintenance-schedules">
            <CardHeader>
              <CardTitle>Scheduled Maintenance</CardTitle>
              <CardDescription>
                Upcoming and past maintenance windows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceLoading ? (
                <div className="text-center py-8">Loading maintenance schedules...</div>
              ) : maintenanceSchedules.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No maintenance scheduled</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceSchedules.map((schedule: any) => (
                    <div key={schedule.id} className="border rounded-lg p-4" data-testid={`maintenance-${schedule.id}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{schedule.title}</h4>
                          <p className="text-sm text-muted-foreground">{schedule.description}</p>
                          <p className="text-sm mt-1">
                            {format(new Date(schedule.startTime), 'MMM dd, yyyy HH:mm')} - 
                            {format(new Date(schedule.endTime), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={schedule.isActive ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}>
                            {schedule.isActive ? "Active" : "Scheduled"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* API & Webhooks Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {/* API Keys Section */}
            <Card data-testid="card-api-keys">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-slate-400 to-pink-500 bg-clip-text text-transparent">
                      API Keys
                    </CardTitle>
                    <CardDescription>
                      Manage API keys for platform integration and third-party access
                    </CardDescription>
                  </div>
                  <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-slate-500 to-pink-500 hover:from-slate-600 hover:to-pink-600"
                        onClick={() => {
                          setSelectedApiKey(null);
                          apiKeyForm.reset();
                        }}
                        data-testid="button-create-api-key"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create API Key
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-slate-400 to-pink-500 bg-clip-text text-transparent">
                          Create API Key
                        </DialogTitle>
                        <DialogDescription>
                          Generate a new API key with specific scopes and rate limits
                        </DialogDescription>
                      </DialogHeader>

                      {selectedApiKey ? (
                        <div className="space-y-4">
                          <Alert className="border-green-500/30 bg-green-500/10">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            <AlertDescription>
                              API key created successfully! Copy it now - it won't be shown again.
                            </AlertDescription>
                          </Alert>

                          <div className="p-4 bg-gray-900 rounded-lg border border-slate-500/30">
                            <label className="text-sm text-muted-foreground mb-2 block">API Key</label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 font-mono text-sm text-slate-400 break-all">
                                {selectedApiKey.key}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyKey(selectedApiKey.key)}
                                className="border-slate-500/30"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              onClick={() => {
                                setSelectedApiKey(null);
                                setShowApiKeyDialog(false);
                              }}
                            >
                              Done
                            </Button>
                          </DialogFooter>
                        </div>
                      ) : (
                        <Form {...apiKeyForm}>
                          <form onSubmit={apiKeyForm.handleSubmit(handleSubmitApiKey)} className="space-y-4">
                            <FormField
                              control={apiKeyForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Key Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="My Integration Key"
                                      {...field}
                                      data-testid="input-api-key-name"
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    A descriptive name to identify this API key
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={apiKeyForm.control}
                              name="scopes"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Scopes</FormLabel>
                                  <FormDescription>
                                    Select which API endpoints this key can access
                                  </FormDescription>
                                  <div className="grid grid-cols-2 gap-3 mt-2">
                                    {['read:users', 'write:users', 'read:posts', 'write:posts', 'read:messages', 'write:messages', 'read:payments', 'admin:all'].map((scope) => (
                                      <label key={scope} className="flex items-center space-x-2">
                                        <Checkbox
                                          checked={field.value?.includes(scope)}
                                          onCheckedChange={(checked) => {
                                            const current = field.value || [];
                                            if (checked) {
                                              field.onChange([...current, scope]);
                                            } else {
                                              field.onChange(current.filter((s: string) => s !== scope));
                                            }
                                          }}
                                        />
                                        <span className="text-sm font-mono">{scope}</span>
                                      </label>
                                    ))}
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={apiKeyForm.control}
                                name="rateLimit"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Rate Limit</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        placeholder="1000"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                                        data-testid="input-rate-limit"
                                      />
                                    </FormControl>
                                    <FormDescription>Requests allowed</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={apiKeyForm.control}
                                name="rateLimitWindow"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Per</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="minute">Minute</SelectItem>
                                        <SelectItem value="hour">Hour</SelectItem>
                                        <SelectItem value="day">Day</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormDescription>Time window</FormDescription>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <FormField
                              control={apiKeyForm.control}
                              name="expiresAt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Expiration Date (Optional)</FormLabel>
                                  <FormControl>
                                    <Input type="datetime-local" {...field} />
                                  </FormControl>
                                  <FormDescription>
                                    Leave blank for no expiration
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <DialogFooter>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowApiKeyDialog(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={createApiKeyMutation.isPending}
                                className="bg-gradient-to-r from-slate-500 to-pink-500"
                              >
                                Generate Key
                              </Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {apiKeysLoading ? (
                  <div className="text-center py-8">Loading API keys...</div>
                ) : apiKeys.length === 0 ? (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No API keys created yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create an API key to enable programmatic access to the platform
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Key Prefix</TableHead>
                        <TableHead>Scopes</TableHead>
                        <TableHead>Rate Limit</TableHead>
                        <TableHead>Last Used</TableHead>
                        <TableHead>Requests</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {apiKeys.map((apiKey) => (
                        <TableRow key={apiKey.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{apiKey.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(apiKey.createdAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-xs font-mono text-slate-400">
                              {apiKey.prefix}•••
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {apiKey.scopes.slice(0, 2).map((scope) => (
                                <Badge key={scope} variant="outline" className="text-xs">
                                  {scope}
                                </Badge>
                              ))}
                              {apiKey.scopes.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{apiKey.scopes.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {apiKey.rateLimit}/{apiKey.rateLimitWindow}
                            </span>
                          </TableCell>
                          <TableCell>
                            {apiKey.lastUsedAt ? (
                              <span className="text-sm">
                                {format(new Date(apiKey.lastUsedAt), 'MMM dd, HH:mm')}
                              </span>
                            ) : (
                              <span className="text-sm text-muted-foreground">Never</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono">{apiKey.requestCount}</span>
                          </TableCell>
                          <TableCell>
                            {apiKey.isActive ? (
                              apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date() ? (
                                <Badge className="bg-red-100 text-red-800">Expired</Badge>
                              ) : (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              )
                            ) : (
                              <Badge className="bg-gray-100 text-gray-800">Revoked</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => revokeApiKeyMutation.mutate(apiKey.id)}
                              disabled={!apiKey.isActive}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Webhooks Section */}
            <Card data-testid="card-webhooks">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="bg-gradient-to-r from-pink-400 to-slate-500 bg-clip-text text-transparent">
                      Webhooks
                    </CardTitle>
                    <CardDescription>
                      Configure webhooks to receive real-time event notifications
                    </CardDescription>
                  </div>
                  <Dialog open={showWebhookDialog} onOpenChange={setShowWebhookDialog}>
                    <DialogTrigger asChild>
                      <Button
                        className="bg-gradient-to-r from-pink-500 to-slate-500 hover:from-pink-600 hover:to-slate-600"
                        data-testid="button-create-webhook"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Webhook
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle className="bg-gradient-to-r from-pink-400 to-slate-500 bg-clip-text text-transparent">
                          Add Webhook
                        </DialogTitle>
                        <DialogDescription>
                          Configure a webhook endpoint to receive event notifications
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...webhookForm}>
                        <form onSubmit={webhookForm.handleSubmit(handleSubmitWebhook)} className="space-y-4">
                          <FormField
                            control={webhookForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Webhook Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Production Events Webhook"
                                    {...field}
                                    data-testid="input-webhook-name"
                                  />
                                </FormControl>
                                <FormDescription>
                                  A descriptive name for this webhook
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={webhookForm.control}
                            name="url"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Endpoint URL</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="https://yourapp.com/webhooks/boyfanz"
                                    {...field}
                                    data-testid="input-webhook-url"
                                  />
                                </FormControl>
                                <FormDescription>
                                  The URL where webhook payloads will be sent
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={webhookForm.control}
                            name="events"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Events</FormLabel>
                                <FormDescription>
                                  Select which events should trigger this webhook
                                </FormDescription>
                                <div className="grid grid-cols-2 gap-3 mt-2">
                                  {[
                                    'user.created', 'user.updated', 'user.deleted',
                                    'post.created', 'post.updated', 'post.deleted',
                                    'payment.succeeded', 'payment.failed',
                                    'subscription.created', 'subscription.cancelled',
                                    'message.created', 'livestream.started'
                                  ].map((event) => (
                                    <label key={event} className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={field.value?.includes(event)}
                                        onCheckedChange={(checked) => {
                                          const current = field.value || [];
                                          if (checked) {
                                            field.onChange([...current, event]);
                                          } else {
                                            field.onChange(current.filter((e: string) => e !== event));
                                          }
                                        }}
                                      />
                                      <span className="text-sm font-mono">{event}</span>
                                    </label>
                                  ))}
                                </div>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={webhookForm.control}
                            name="retryAttempts"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Retry Attempts</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="5"
                                    placeholder="3"
                                    {...field}
                                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                                    data-testid="input-retry-attempts"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Number of times to retry failed webhook deliveries (0-5)
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={webhookForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    data-testid="checkbox-webhook-active"
                                  />
                                </FormControl>
                                <div>
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Enable this webhook to start receiving events
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowWebhookDialog(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={createWebhookMutation.isPending}
                              className="bg-gradient-to-r from-pink-500 to-slate-500"
                            >
                              Create Webhook
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {webhooksLoading ? (
                  <div className="text-center py-8">Loading webhooks...</div>
                ) : webhooks.length === 0 ? (
                  <div className="text-center py-8">
                    <Link2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-muted-foreground">No webhooks configured</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add a webhook to receive real-time event notifications
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {webhooks.map((webhook) => (
                      <div
                        key={webhook.id}
                        className="border rounded-lg p-4 hover:border-pink-500/30 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium">{webhook.name}</h4>
                              {webhook.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                              )}
                              {webhook.lastStatus === 'success' && (
                                <Badge className="bg-blue-100 text-blue-800">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Last Success
                                </Badge>
                              )}
                              {webhook.lastStatus === 'failed' && (
                                <Badge className="bg-red-100 text-red-800">
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Last Failed
                                </Badge>
                              )}
                            </div>
                            <code className="text-sm text-muted-foreground break-all">
                              {webhook.url}
                            </code>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {webhook.events.slice(0, 4).map((event) => (
                                <Badge key={event} variant="outline" className="text-xs font-mono">
                                  {event}
                                </Badge>
                              ))}
                              {webhook.events.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{webhook.events.length - 4} more
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-6 mt-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span>{webhook.successCount} success</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <span>{webhook.failureCount} failed</span>
                              </div>
                              {webhook.lastTriggeredAt && (
                                <div className="flex items-center gap-1">
                                  <Activity className="h-4 w-4" />
                                  <span>Last: {format(new Date(webhook.lastTriggeredAt), 'MMM dd, HH:mm')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => testWebhookMutation.mutate(webhook.id)}
                              disabled={testWebhookMutation.isPending}
                              className="border-slate-500/30"
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteWebhookMutation.mutate(webhook.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Theme Tab */}
        <TabsContent value="theme" className="space-y-4">
          <Card data-testid="card-theme-settings">
            <CardHeader>
              <CardTitle>Theme Management</CardTitle>
              <CardDescription>
                Customize the platform's appearance and branding
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Palette className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Theme management interface will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Color schemes, logos, fonts, custom CSS/JS injection
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card data-testid="card-security-settings">
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Configure authentication, session management, and security policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Security settings interface will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Password policies, 2FA requirements, session timeouts, rate limiting
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup Tab */}
        <TabsContent value="backup" className="space-y-4">
          <Card data-testid="card-backup-settings">
            <CardHeader>
              <CardTitle>Backup & Restore</CardTitle>
              <CardDescription>
                Automated backup scheduling and system restoration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Backup management interface will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Automated backups, manual backups, restoration points, storage configuration
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Tab */}
        <TabsContent value="custom" className="space-y-4">
          <Card data-testid="card-custom-settings">
            <CardHeader>
              <CardTitle>Custom Configuration</CardTitle>
              <CardDescription>
                Advanced custom settings and feature flags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Custom settings interface will be implemented here</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Feature flags, experimental settings, custom integrations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Backup Dialog */}
      <Dialog open={showBackupDialog} onOpenChange={setShowBackupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle data-testid="backup-dialog-title">
              💾 System Backup
            </DialogTitle>
            <DialogDescription>
              Create a full system backup including database, files, and configuration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => backupMutation.mutate("database")}
                disabled={backupMutation.isPending}
                data-testid="button-backup-database"
              >
                <Database className="h-4 w-4 mr-2" />
                Database Only
              </Button>
              <Button
                variant="outline"
                onClick={() => backupMutation.mutate("files")}
                disabled={backupMutation.isPending}
                data-testid="button-backup-files"
              >
                <HardDrive className="h-4 w-4 mr-2" />
                Files Only
              </Button>
            </div>
            <Button
              className="w-full"
              onClick={() => backupMutation.mutate("full")}
              disabled={backupMutation.isPending}
              data-testid="button-backup-full"
            >
              <Archive className="h-4 w-4 mr-2" />
              Full System Backup
            </Button>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Backup operations may take several minutes depending on system size.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowBackupDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}