import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Mail, Send, Clock, Users, BarChart3, Play, Pause, Plus,
  Eye, Trash2, TestTube2, Calendar, CheckCircle, XCircle,
  AlertTriangle, RefreshCw, Target, TrendingUp, Activity,
  FileText, Copy, Edit2, Code, Palette, Tag, Variable, Sparkles,
  LayoutTemplate, Download, Upload, Search, Filter
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  preheader?: string;
  htmlContent: string;
  textContent?: string;
  templateType: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled';
  targetAudience: string;
  scheduledFor?: string;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalRecipients: number;
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
}

interface SchedulerStats {
  isRunning: boolean;
  totalScheduled: number;
  pending: number;
  sent: number;
  failed: number;
  cancelled: number;
  verificationReminders: {
    usersTracked: number;
  };
}

interface EmailAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalBounced: number;
  totalUnsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
  campaignCount: number;
}

interface EmailTemplate {
  id: string;
  type: string;
  name: string;
  description: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  category: 'marketing' | 'transactional' | 'notification' | 'reminder' | 'promotional';
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TemplateVariable {
  name: string;
  description: string;
  example: string;
}

const AVAILABLE_VARIABLES: TemplateVariable[] = [
  { name: '{{username}}', description: 'User\'s display name', example: 'John' },
  { name: '{{email}}', description: 'User\'s email address', example: 'john@example.com' },
  { name: '{{platform_name}}', description: 'Platform name', example: 'BoyFanz' },
  { name: '{{platform_url}}', description: 'Platform URL', example: 'https://boyfanz.com' },
  { name: '{{unsubscribe_url}}', description: 'Unsubscribe link', example: 'https://boyfanz.com/unsubscribe/...' },
  { name: '{{verification_link}}', description: 'Email verification link', example: 'https://boyfanz.com/verify/...' },
  { name: '{{reset_password_link}}', description: 'Password reset link', example: 'https://boyfanz.com/reset/...' },
  { name: '{{current_date}}', description: 'Current date', example: 'December 22, 2025' },
  { name: '{{creator_name}}', description: 'Creator\'s display name', example: 'Creator Pro' },
  { name: '{{subscription_price}}', description: 'Subscription price', example: '$9.99/month' },
  { name: '{{earnings}}', description: 'Creator earnings', example: '$1,234.56' },
  { name: '{{new_subscribers}}', description: 'New subscriber count', example: '15' },
];

const PRE_BUILT_TEMPLATES = [
  {
    name: 'Welcome Email',
    type: 'welcome',
    category: 'transactional' as const,
    subject: 'Welcome to {{platform_name}}! 🎉',
    description: 'Sent to new users after registration',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #6366f1;">Welcome to {{platform_name}}!</h1>
  <p>Hey {{username}},</p>
  <p>We're thrilled to have you join our community! You're now part of an exclusive platform where creators and fans connect.</p>
  <p><strong>Here's what you can do next:</strong></p>
  <ul>
    <li>Complete your profile to stand out</li>
    <li>Explore featured creators</li>
    <li>Subscribe to your favorites</li>
  </ul>
  <a href="{{platform_url}}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Get Started</a>
  <p style="margin-top: 24px; color: #666; font-size: 12px;">
    If you didn't create this account, please ignore this email.
    <br><a href="{{unsubscribe_url}}">Unsubscribe</a>
  </p>
</div>`,
    variables: ['username', 'platform_name', 'platform_url', 'unsubscribe_url'],
  },
  {
    name: 'Verification Reminder',
    type: 'verification_reminder',
    category: 'reminder' as const,
    subject: '⚠️ Verify your email - Action required',
    description: 'Sent to users who haven\'t verified their email',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #f59e0b;">Almost There, {{username}}!</h1>
  <p>You're just one click away from unlocking all features on {{platform_name}}.</p>
  <p>Please verify your email address to:</p>
  <ul>
    <li>Access exclusive content</li>
    <li>Message creators directly</li>
    <li>Subscribe to your favorites</li>
  </ul>
  <a href="{{verification_link}}" style="display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px;">Verify My Email</a>
  <p style="margin-top: 24px; color: #666; font-size: 12px;">
    This link expires in 24 hours.
    <br><a href="{{unsubscribe_url}}">Unsubscribe</a>
  </p>
</div>`,
    variables: ['username', 'platform_name', 'verification_link', 'unsubscribe_url'],
  },
  {
    name: 'Password Reset',
    type: 'password_reset',
    category: 'transactional' as const,
    subject: 'Reset your {{platform_name}} password',
    description: 'Sent when user requests password reset',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #6366f1;">Password Reset Request</h1>
  <p>Hey {{username}},</p>
  <p>We received a request to reset your password. Click the button below to create a new password:</p>
  <a href="{{reset_password_link}}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
  <p style="margin-top: 24px; color: #666;">This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>
</div>`,
    variables: ['username', 'platform_name', 'reset_password_link'],
  },
  {
    name: 'Weekly Newsletter',
    type: 'newsletter_weekly',
    category: 'marketing' as const,
    subject: '🔥 This Week on {{platform_name}} - Don\'t Miss Out!',
    description: 'Weekly digest of platform activity',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #6366f1;">Weekly Highlights</h1>
  <p>Hey {{username}},</p>
  <p>Here's what's been happening on {{platform_name}} this week:</p>
  <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <h3 style="margin-top: 0;">🌟 Featured Creators</h3>
    <p>Check out this week's top performers and rising stars.</p>
  </div>
  <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0;">
    <h3 style="margin-top: 0;">📸 Trending Content</h3>
    <p>See what everyone's talking about.</p>
  </div>
  <a href="{{platform_url}}/explore" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Explore Now</a>
  <p style="margin-top: 24px; color: #666; font-size: 12px;">
    <a href="{{unsubscribe_url}}">Unsubscribe from weekly emails</a>
  </p>
</div>`,
    variables: ['username', 'platform_name', 'platform_url', 'unsubscribe_url'],
  },
  {
    name: 'Creator Earnings Report',
    type: 'creator_earnings',
    category: 'notification' as const,
    subject: '💰 Your {{platform_name}} Earnings This Month',
    description: 'Monthly earnings summary for creators',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #10b981;">Earnings Report</h1>
  <p>Hey {{creator_name}},</p>
  <p>Here's your earnings summary for this month:</p>
  <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 24px; border-radius: 12px; margin: 16px 0; text-align: center;">
    <p style="margin: 0; font-size: 14px;">Total Earnings</p>
    <p style="margin: 8px 0; font-size: 36px; font-weight: bold;">{{earnings}}</p>
  </div>
  <div style="display: flex; gap: 16px;">
    <div style="flex: 1; background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center;">
      <p style="margin: 0; color: #666;">New Subscribers</p>
      <p style="margin: 4px 0; font-size: 24px; font-weight: bold;">{{new_subscribers}}</p>
    </div>
  </div>
  <a href="{{platform_url}}/creator/earnings" style="display: inline-block; margin-top: 24px; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 6px;">View Full Report</a>
</div>`,
    variables: ['creator_name', 'platform_name', 'platform_url', 'earnings', 'new_subscribers'],
  },
  {
    name: 'New Subscriber Notification',
    type: 'new_subscriber',
    category: 'notification' as const,
    subject: '🎉 You have a new subscriber!',
    description: 'Sent to creators when they get a new subscriber',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #6366f1;">New Subscriber!</h1>
  <p>Hey {{creator_name}},</p>
  <p>Great news! <strong>{{username}}</strong> just subscribed to your content for {{subscription_price}}.</p>
  <p>Keep creating amazing content to keep your fans engaged!</p>
  <a href="{{platform_url}}/dashboard" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">View Dashboard</a>
</div>`,
    variables: ['creator_name', 'username', 'subscription_price', 'platform_url'],
  },
  {
    name: 'Special Promotion',
    type: 'promotion',
    category: 'promotional' as const,
    subject: '🎁 Special Offer Just For You!',
    description: 'Promotional email for special offers',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 32px; border-radius: 12px; text-align: center;">
    <h1 style="margin: 0;">SPECIAL OFFER</h1>
    <p style="font-size: 24px; margin: 16px 0;">Limited Time Only!</p>
  </div>
  <div style="padding: 24px;">
    <p>Hey {{username}},</p>
    <p>We've got something special just for you! For a limited time, enjoy exclusive benefits on {{platform_name}}.</p>
    <a href="{{platform_url}}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Claim Offer</a>
    <p style="margin-top: 24px; color: #666; font-size: 12px;">
      <a href="{{unsubscribe_url}}">Unsubscribe from promotional emails</a>
    </p>
  </div>
</div>`,
    variables: ['username', 'platform_name', 'platform_url', 'unsubscribe_url'],
  },
  {
    name: 'Inactivity Reminder',
    type: 'inactivity',
    category: 'reminder' as const,
    subject: 'We miss you on {{platform_name}}! 💙',
    description: 'Sent to users who haven\'t been active',
    htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #6366f1;">We Miss You!</h1>
  <p>Hey {{username}},</p>
  <p>It's been a while since we've seen you on {{platform_name}}. A lot has happened while you were away!</p>
  <p>Here's what you might have missed:</p>
  <ul>
    <li>New creators have joined</li>
    <li>Exclusive content from your favorites</li>
    <li>Platform improvements and new features</li>
  </ul>
  <a href="{{platform_url}}" style="display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 6px;">Come Back & Explore</a>
  <p style="margin-top: 24px; color: #666; font-size: 12px;">
    <a href="{{unsubscribe_url}}">Unsubscribe</a>
  </p>
</div>`,
    variables: ['username', 'platform_name', 'platform_url', 'unsubscribe_url'],
  },
];

export default function EmailManagement() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("overview");
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<typeof PRE_BUILT_TEMPLATES[0] | null>(null);
  const [templateFilter, setTemplateFilter] = useState<string>("all");
  const [testEmail, setTestEmail] = useState("");

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    type: "",
    subject: "",
    htmlContent: "",
    textContent: "",
    category: "marketing" as const,
  });

  // Form state for new campaign
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    preheader: "",
    htmlContent: "",
    textContent: "",
    templateType: "newsletter",
    targetAudience: "all",
    scheduledFor: "",
  });

  // Fetch analytics
  const { data: analytics } = useQuery<EmailAnalytics>({
    queryKey: ["/api/email-marketing/analytics"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-marketing/analytics");
      const data = await res.json();
      return data.data;
    },
  });

  // Fetch scheduler status
  const { data: schedulerStats, refetch: refetchScheduler } = useQuery<SchedulerStats>({
    queryKey: ["/api/email-marketing/scheduler/status"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-marketing/scheduler/status");
      const data = await res.json();
      return data.data;
    },
    refetchInterval: 10000,
  });

  // Fetch campaigns
  const { data: campaignsData, refetch: refetchCampaigns } = useQuery<{ campaigns: Campaign[]; total: number }>({
    queryKey: ["/api/email-marketing/campaigns"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-marketing/campaigns?limit=50");
      const data = await res.json();
      return { campaigns: data.data || [], total: data.pagination?.total || 0 };
    },
  });

  // Fetch templates
  const { data: templates } = useQuery<EmailTemplate[]>({
    queryKey: ["/api/email-marketing/templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/email-marketing/templates");
      const data = await res.json();
      return data.data || [];
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: typeof campaignForm) => {
      const res = await apiRequest("POST", "/api/email-marketing/campaigns", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign created successfully" });
      setShowCampaignDialog(false);
      resetCampaignForm();
      refetchCampaigns();
    },
    onError: (error: any) => {
      toast({ title: "Failed to create campaign", description: error.message, variant: "destructive" });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("POST", `/api/email-marketing/campaigns/${id}/send`);
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Campaign sent", description: `Sent to ${data.sent} recipients` });
      refetchCampaigns();
    },
    onError: (error: any) => {
      toast({ title: "Failed to send campaign", description: error.message, variant: "destructive" });
    },
  });

  // Send test email mutation
  const sendTestEmailMutation = useMutation({
    mutationFn: async ({ id, email }: { id: string; email: string }) => {
      const res = await apiRequest("POST", `/api/email-marketing/campaigns/${id}/test`, { testEmail: email });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Test email sent" });
      setShowTestEmailDialog(false);
      setTestEmail("");
    },
    onError: (error: any) => {
      toast({ title: "Failed to send test email", description: error.message, variant: "destructive" });
    },
  });

  // Delete campaign mutation
  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/email-marketing/campaigns/${id}`);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Campaign deleted" });
      refetchCampaigns();
    },
    onError: (error: any) => {
      toast({ title: "Failed to delete campaign", description: error.message, variant: "destructive" });
    },
  });

  // Start/stop scheduler mutations
  const startSchedulerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email-marketing/scheduler/start");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scheduler started" });
      refetchScheduler();
    },
  });

  const stopSchedulerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email-marketing/scheduler/stop");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Scheduler stopped" });
      refetchScheduler();
    },
  });

  // Send bulk verification reminders
  const sendBulkRemindersMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email-marketing/verification-reminder/bulk");
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "Verification reminders sent", description: `Sent: ${data.sent}, Failed: ${data.failed}` });
    },
    onError: (error: any) => {
      toast({ title: "Failed to send reminders", description: error.message, variant: "destructive" });
    },
  });

  const resetCampaignForm = () => {
    setCampaignForm({
      name: "",
      subject: "",
      preheader: "",
      htmlContent: "",
      textContent: "",
      templateType: "newsletter",
      targetAudience: "all",
      scheduledFor: "",
    });
  };

  const getStatusBadge = (status: Campaign['status']) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "secondary", label: "Draft" },
      scheduled: { variant: "outline", label: "Scheduled" },
      sending: { variant: "default", label: "Sending" },
      sent: { variant: "default", label: "Sent" },
      paused: { variant: "secondary", label: "Paused" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Mail className="h-8 w-8" />
            Email Marketing
          </h1>
          <p className="text-muted-foreground">Manage campaigns, reminders, and email analytics</p>
        </div>
        <Button onClick={() => setShowCampaignDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="scheduler">Scheduler</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.totalSent?.toLocaleString() || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Open Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.openRate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Click Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics?.clickRate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bounce Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">{analytics?.bounceRate?.toFixed(1) || 0}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduler Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Email Scheduler
              </CardTitle>
              <CardDescription>Automated verification reminders and scheduled emails</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {schedulerStats?.isRunning ? (
                      <Badge variant="default" className="bg-green-500">Running</Badge>
                    ) : (
                      <Badge variant="destructive">Stopped</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Pending: {schedulerStats?.pending || 0} |
                    Sent: {schedulerStats?.sent || 0} |
                    Failed: {schedulerStats?.failed || 0}
                  </div>
                </div>
                <div className="flex gap-2">
                  {schedulerStats?.isRunning ? (
                    <Button variant="outline" size="sm" onClick={() => stopSchedulerMutation.mutate()}>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => startSchedulerMutation.mutate()}>
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => sendBulkRemindersMutation.mutate()}
                disabled={sendBulkRemindersMutation.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Verification Reminders
              </Button>
              <Button variant="outline" onClick={() => setShowCampaignDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Newsletter
              </Button>
              <Button variant="outline" onClick={() => refetchCampaigns()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Campaigns</CardTitle>
              <CardDescription>{campaignsData?.total || 0} total campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              {campaignsData?.campaigns && campaignsData.campaigns.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Audience</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Opened</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaignsData.campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{campaign.subject}</TableCell>
                        <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                        <TableCell className="capitalize">{campaign.targetAudience}</TableCell>
                        <TableCell>{campaign.stats.sent.toLocaleString()}</TableCell>
                        <TableCell>
                          {campaign.stats.sent > 0
                            ? `${((campaign.stats.opened / campaign.stats.sent) * 100).toFixed(1)}%`
                            : '-'
                          }
                        </TableCell>
                        <TableCell>{format(new Date(campaign.createdAt), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {campaign.status === 'draft' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedCampaign(campaign);
                                    setShowTestEmailDialog(true);
                                  }}
                                >
                                  <TestTube2 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => sendCampaignMutation.mutate(campaign.id)}
                                  disabled={sendCampaignMutation.isPending}
                                >
                                  <Send className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns yet</p>
                  <Button className="mt-4" onClick={() => setShowCampaignDialog(true)}>
                    Create your first campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduler Tab */}
        <TabsContent value="scheduler" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                {schedulerStats?.isRunning ? (
                  <Badge variant="default" className="bg-green-500">Running</Badge>
                ) : (
                  <Badge variant="destructive">Stopped</Badge>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Emails</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedulerStats?.pending || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Users Tracked</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{schedulerStats?.verificationReminders?.usersTracked || 0}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Verification Reminder Schedule</CardTitle>
              <CardDescription>Automatic reminders sent to unverified users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">1 Hour After Signup</h4>
                    <p className="text-sm text-muted-foreground">First gentle reminder (23 hours remaining)</p>
                  </div>
                  <Badge>Low Priority</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">12 Hours After Signup</h4>
                    <p className="text-sm text-muted-foreground">Second reminder (12 hours remaining)</p>
                  </div>
                  <Badge variant="secondary">Medium Priority</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">20 Hours After Signup</h4>
                    <p className="text-sm text-muted-foreground">Urgent reminder (4 hours remaining)</p>
                  </div>
                  <Badge variant="destructive">High Priority</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          {/* Template Actions Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search templates..." className="pl-10" />
              </div>
              <Select value={templateFilter} onValueChange={setTemplateFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="transactional">Transactional</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="promotional">Promotional</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowTemplateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Template
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>

          {/* Available Variables Reference */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Variable className="h-5 w-5" />
                Available Template Variables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_VARIABLES.map((v) => (
                  <Button
                    key={v.name}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(v.name);
                      toast({ title: "Copied!", description: `${v.name} copied to clipboard` });
                    }}
                    title={`${v.description} (e.g., ${v.example})`}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {v.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pre-built Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5" />
                Pre-built Templates Library
              </CardTitle>
              <CardDescription>Ready-to-use templates for common email scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {PRE_BUILT_TEMPLATES
                  .filter(t => templateFilter === "all" || t.category === templateFilter)
                  .map((template) => (
                  <Card key={template.type} className="border hover:border-primary transition-colors cursor-pointer group">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <Badge variant={
                          template.category === 'transactional' ? 'default' :
                          template.category === 'marketing' ? 'secondary' :
                          template.category === 'promotional' ? 'destructive' :
                          'outline'
                        }>
                          {template.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <div className="text-xs font-mono bg-muted p-2 rounded truncate">
                        {template.subject}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.slice(0, 3).map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {v}
                          </Badge>
                        ))}
                        {template.variables.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.variables.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowTemplatePreview(true);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            setCampaignForm({
                              name: template.name,
                              subject: template.subject,
                              preheader: "",
                              htmlContent: template.htmlContent,
                              textContent: "",
                              templateType: template.type,
                              targetAudience: "all",
                              scheduledFor: "",
                            });
                            setShowCampaignDialog(true);
                          }}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          Use
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Templates from API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Custom Templates
              </CardTitle>
              <CardDescription>Templates you've created or imported</CardDescription>
            </CardHeader>
            <CardContent>
              {templates && templates.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template: any) => (
                      <TableRow key={template.id || template.type}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{template.type}</Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate font-mono text-sm">
                          {template.subject || "—"}
                        </TableCell>
                        <TableCell>
                          <Badge>{template.category || "custom"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No custom templates yet</p>
                  <p className="text-sm">Create your first template or use one from the library above</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Preview Dialog */}
      <Dialog open={showTemplatePreview} onOpenChange={setShowTemplatePreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview: {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Preview how this email template will look to recipients
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge>{selectedTemplate.category}</Badge>
                <span className="text-sm text-muted-foreground">Type: {selectedTemplate.type}</span>
              </div>
              <div className="space-y-2">
                <Label>Subject Line:</Label>
                <div className="font-mono bg-muted p-3 rounded">{selectedTemplate.subject}</div>
              </div>
              <div className="space-y-2">
                <Label>Variables Used:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.variables.map((v) => (
                    <Badge key={v} variant="secondary">{`{{${v}}}`}</Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Email Preview:</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Code className="h-4 w-4 mr-1" />
                      View HTML
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <div className="bg-muted px-4 py-2 border-b flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <span className="text-sm text-muted-foreground ml-2">Email Preview</span>
                  </div>
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{
                      __html: selectedTemplate.htmlContent
                        .replace(/\{\{username\}\}/g, 'John')
                        .replace(/\{\{email\}\}/g, 'john@example.com')
                        .replace(/\{\{platform_name\}\}/g, 'BoyFanz')
                        .replace(/\{\{platform_url\}\}/g, 'https://boyfanz.com')
                        .replace(/\{\{creator_name\}\}/g, 'Creator Pro')
                        .replace(/\{\{earnings\}\}/g, '$1,234.56')
                        .replace(/\{\{new_subscribers\}\}/g, '15')
                        .replace(/\{\{subscription_price\}\}/g, '$9.99/month')
                        .replace(/\{\{verification_link\}\}/g, '#')
                        .replace(/\{\{reset_password_link\}\}/g, '#')
                        .replace(/\{\{unsubscribe_url\}\}/g, '#')
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplatePreview(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedTemplate) {
                setCampaignForm({
                  name: selectedTemplate.name,
                  subject: selectedTemplate.subject,
                  preheader: "",
                  htmlContent: selectedTemplate.htmlContent,
                  textContent: "",
                  templateType: selectedTemplate.type,
                  targetAudience: "all",
                  scheduledFor: "",
                });
                setShowTemplatePreview(false);
                setShowCampaignDialog(true);
              }
            }}>
              <Send className="h-4 w-4 mr-2" />
              Use This Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Template Dialog */}
      <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Template</DialogTitle>
            <DialogDescription>Design a reusable email template for campaigns</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-6">
            {/* Left: Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Template Name</Label>
                  <Input
                    placeholder="e.g., Monthly Digest"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type Identifier</Label>
                  <Input
                    placeholder="e.g., monthly_digest"
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={templateForm.category}
                  onValueChange={(value: any) => setTemplateForm({ ...templateForm, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="transactional">Transactional</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="promotional">Promotional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  placeholder="Email subject with {{variables}}"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>HTML Content</Label>
                <Textarea
                  placeholder="<div>Your HTML email content...</div>"
                  value={templateForm.htmlContent}
                  onChange={(e) => setTemplateForm({ ...templateForm, htmlContent: e.target.value })}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label>Available Variables (click to insert)</Label>
                <div className="flex flex-wrap gap-1">
                  {AVAILABLE_VARIABLES.slice(0, 6).map((v) => (
                    <Button
                      key={v.name}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setTemplateForm({
                          ...templateForm,
                          htmlContent: templateForm.htmlContent + v.name
                        });
                      }}
                    >
                      {v.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
            {/* Right: Preview */}
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div className="border rounded-lg overflow-hidden bg-white h-[500px] overflow-y-auto">
                <div className="bg-muted px-4 py-2 border-b text-sm text-muted-foreground">
                  Subject: {templateForm.subject || "(No subject)"}
                </div>
                <div
                  className="p-4"
                  dangerouslySetInnerHTML={{
                    __html: (templateForm.htmlContent || "<p>Start typing to see preview...</p>")
                      .replace(/\{\{username\}\}/g, 'John')
                      .replace(/\{\{email\}\}/g, 'john@example.com')
                      .replace(/\{\{platform_name\}\}/g, 'BoyFanz')
                      .replace(/\{\{platform_url\}\}/g, 'https://boyfanz.com')
                      .replace(/\{\{creator_name\}\}/g, 'Creator Pro')
                      .replace(/\{\{earnings\}\}/g, '$1,234.56')
                      .replace(/\{\{new_subscribers\}\}/g, '15')
                      .replace(/\{\{subscription_price\}\}/g, '$9.99/month')
                  }}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>
              Cancel
            </Button>
            <Button disabled={!templateForm.name || !templateForm.subject || !templateForm.htmlContent}>
              Save Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Email Campaign</DialogTitle>
            <DialogDescription>Set up a new email campaign to send to your users</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Campaign Name</Label>
                <Input
                  placeholder="e.g., December Newsletter"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Template Type</Label>
                <Select
                  value={campaignForm.templateType}
                  onValueChange={(value) => setCampaignForm({ ...campaignForm, templateType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates?.map((t) => (
                      <SelectItem key={t.type} value={t.type}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Subject Line</Label>
              <Input
                placeholder="Email subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preheader (optional)</Label>
              <Input
                placeholder="Preview text shown in email clients"
                value={campaignForm.preheader}
                onChange={(e) => setCampaignForm({ ...campaignForm, preheader: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={campaignForm.targetAudience}
                onValueChange={(value) => setCampaignForm({ ...campaignForm, targetAudience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="creators">Creators Only</SelectItem>
                  <SelectItem value="fans">Fans Only</SelectItem>
                  <SelectItem value="unverified">Unverified Users</SelectItem>
                  <SelectItem value="inactive">Inactive Users (30+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Email Content (HTML)</Label>
              <Textarea
                placeholder="<p>Your email content here...</p>"
                value={campaignForm.htmlContent}
                onChange={(e) => setCampaignForm({ ...campaignForm, htmlContent: e.target.value })}
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Schedule (optional)</Label>
              <Input
                type="datetime-local"
                value={campaignForm.scheduledFor}
                onChange={(e) => setCampaignForm({ ...campaignForm, scheduledFor: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createCampaignMutation.mutate(campaignForm)}
              disabled={createCampaignMutation.isPending || !campaignForm.name || !campaignForm.subject || !campaignForm.htmlContent}
            >
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Email</DialogTitle>
            <DialogDescription>Send a test version of "{selectedCampaign?.name}" to verify it looks correct</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Test Email Address</Label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedCampaign && sendTestEmailMutation.mutate({ id: selectedCampaign.id, email: testEmail })}
              disabled={sendTestEmailMutation.isPending || !testEmail}
            >
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
