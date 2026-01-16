import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Link2,
  QrCode,
  Plus,
  Copy,
  ExternalLink,
  MoreVertical,
  Trash2,
  Pause,
  Play,
  BarChart3,
  Users,
  Eye,
  MousePointer,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  Download,
  Wallet,
  Share2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Flame,
} from 'lucide-react';

interface FreeLink {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  freeDays: number;
  subscriptionPlanId: string | null;
  maxRedemptions: number | null;
  redemptionCount: number;
  maxRedemptionsPerUser: number;
  startsAt: string;
  expiresAt: string | null;
  status: 'active' | 'paused' | 'expired' | 'depleted';
  newSubscribersOnly: boolean;
  qrCodeData: string | null;
  qrCodeColor: string;
  qrCodeBackgroundColor: string;
  viewCount: number;
  scanCount: number;
  clickCount: number;
  source: string | null;
  campaignId: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  createdAt: string;
  url?: string;
}

interface FreeLinkAnalytics {
  link: FreeLink;
  totalViews: number;
  totalScans: number;
  totalClicks: number;
  totalRedemptions: number;
  conversionRate: number;
  recentRedemptions: Array<{
    id: number;
    userId: string;
    source: string;
    deviceType: string;
    redeemedAt: string;
    convertedToPaid: boolean;
  }>;
  dailyStats: Array<{
    date: string;
    views: number;
    qrScans: number;
    directClicks: number;
    redemptions: number;
  }>;
}

interface CreateLinkForm {
  name: string;
  description: string;
  freeDays: number;
  maxRedemptions: string;
  expiresAt: string;
  newSubscribersOnly: boolean;
  qrCodeColor: string;
  qrCodeBackgroundColor: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

export default function FreeLinksPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<FreeLink | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreateLinkForm>({
    name: '',
    description: '',
    freeDays: 7,
    maxRedemptions: '',
    expiresAt: '',
    newSubscribersOnly: true,
    qrCodeColor: '#8B0000',
    qrCodeBackgroundColor: '#FFFFFF',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
  });

  // Fetch all free links
  const { data: linksData, isLoading } = useQuery<{ links: FreeLink[]; total: number }>({
    queryKey: ['/api/creator/free-links'],
  });

  // Fetch analytics for selected link
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery<FreeLinkAnalytics>({
    queryKey: ['/api/creator/free-links', selectedLink?.id, 'analytics'],
    enabled: !!selectedLink && isAnalyticsDialogOpen,
  });

  // Create free link mutation
  const createLinkMutation = useMutation({
    mutationFn: async (data: Partial<CreateLinkForm>) => {
      const response = await fetch('/api/creator/free-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...data,
          maxRedemptions: data.maxRedemptions ? parseInt(data.maxRedemptions as string) : null,
          expiresAt: data.expiresAt || null,
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create free link');
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/free-links'] });
      toast({
        title: 'Free link created!',
        description: `Your link is ready: ${data.url}`,
      });
      setIsCreateDialogOpen(false);
      resetCreateForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update link status mutation
  const updateLinkMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`/api/creator/free-links/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update link');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/free-links'] });
      toast({ title: 'Link updated!' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update link', variant: 'destructive' });
    },
  });

  // Delete link mutation
  const deleteLinkMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/creator/free-links/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete link');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/creator/free-links'] });
      toast({ title: 'Link deleted!' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete link', variant: 'destructive' });
    },
  });

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      description: '',
      freeDays: 7,
      maxRedemptions: '',
      expiresAt: '',
      newSubscribersOnly: true,
      qrCodeColor: '#8B0000',
      qrCodeBackgroundColor: '#FFFFFF',
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    });
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  const downloadQRCode = (link: FreeLink) => {
    if (!link.qrCodeData) return;
    const blob = new Blob([link.qrCodeData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${link.slug}-qr.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'expired': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'depleted': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'expired': return <XCircle className="h-4 w-4" />;
      case 'depleted': return <AlertCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  const links = linksData?.links || [];
  const activeLinks = links.filter(l => l.status === 'active');
  const totalRedemptions = links.reduce((sum, l) => sum + l.redemptionCount, 0);
  const totalViews = links.reduce((sum, l) => sum + l.viewCount, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8" data-testid="free-links-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-3">
            <Link2 className="h-10 w-10 text-primary" />
            Free Links & Promos
          </h1>
          <p className="text-muted-foreground text-lg">
            Create shareable links to give fans free access to your content
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Create Free Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" />
                Create Free Access Link
              </DialogTitle>
              <DialogDescription>
                Generate a unique link that gives fans free subscription access
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Link Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Holiday Special, New Follower Gift"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this promo for?"
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  />
                </div>
              </div>

              <Separator />

              {/* Access Settings */}
              <div className="space-y-4">
                <h4 className="font-semibold">Access Settings</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="freeDays">Free Days</Label>
                    <Select
                      value={createForm.freeDays.toString()}
                      onValueChange={(v) => setCreateForm({ ...createForm, freeDays: parseInt(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="60">60 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                    <Input
                      id="maxRedemptions"
                      type="number"
                      placeholder="Unlimited"
                      value={createForm.maxRedemptions}
                      onChange={(e) => setCreateForm({ ...createForm, maxRedemptions: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expires On (optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={createForm.expiresAt}
                    onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>New Subscribers Only</Label>
                    <p className="text-sm text-muted-foreground">Only allow first-time fans to redeem</p>
                  </div>
                  <Switch
                    checked={createForm.newSubscribersOnly}
                    onCheckedChange={(checked) => setCreateForm({ ...createForm, newSubscribersOnly: checked })}
                  />
                </div>
              </div>

              <Separator />

              {/* QR Code Colors */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Code Style
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>QR Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={createForm.qrCodeColor}
                        onChange={(e) => setCreateForm({ ...createForm, qrCodeColor: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={createForm.qrCodeColor}
                        onChange={(e) => setCreateForm({ ...createForm, qrCodeColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={createForm.qrCodeBackgroundColor}
                        onChange={(e) => setCreateForm({ ...createForm, qrCodeBackgroundColor: e.target.value })}
                        className="w-14 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={createForm.qrCodeBackgroundColor}
                        onChange={(e) => setCreateForm({ ...createForm, qrCodeBackgroundColor: e.target.value })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* UTM Tracking */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Campaign Tracking (optional)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>UTM Source</Label>
                    <Input
                      placeholder="twitter"
                      value={createForm.utmSource}
                      onChange={(e) => setCreateForm({ ...createForm, utmSource: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UTM Medium</Label>
                    <Input
                      placeholder="social"
                      value={createForm.utmMedium}
                      onChange={(e) => setCreateForm({ ...createForm, utmMedium: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>UTM Campaign</Label>
                    <Input
                      placeholder="holiday2024"
                      value={createForm.utmCampaign}
                      onChange={(e) => setCreateForm({ ...createForm, utmCampaign: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={() => createLinkMutation.mutate(createForm)}
                disabled={!createForm.name || createLinkMutation.isPending}
                className="bg-gradient-to-r from-primary to-accent"
              >
                {createLinkMutation.isPending ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Create Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">Total Links</CardTitle>
            <Link2 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{links.length}</div>
            <p className="text-xs text-muted-foreground">{activeLinks.length} active</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Total Redemptions</CardTitle>
            <Users className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">Free subs given</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{totalViews}</div>
            <p className="text-xs text-muted-foreground">Link page views</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-amber-400">Conversion Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {totalViews > 0 ? ((totalRedemptions / totalViews) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Views to redemptions</p>
          </CardContent>
        </Card>
      </div>

      {/* Links List */}
      {links.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Link2 className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">No free links yet</h3>
            <p className="text-muted-foreground max-w-md">
              Create your first free access link to attract new fans with a taste of your exclusive content.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Link
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <Card key={link.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Link Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{link.name}</h3>
                      <Badge className={getStatusColor(link.status)}>
                        {getStatusIcon(link.status)}
                        <span className="ml-1 capitalize">{link.status}</span>
                      </Badge>
                      {link.newSubscribersOnly && (
                        <Badge variant="outline" className="border-slate-500/30 text-slate-400">
                          New Fans Only
                        </Badge>
                      )}
                    </div>
                    {link.description && (
                      <p className="text-sm text-muted-foreground">{link.description}</p>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <code className="px-2 py-1 bg-muted rounded text-xs">
                        boyfanz.fanz.website/free/{link.slug}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`https://boyfanz.fanz.website/free/${link.slug}`)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://boyfanz.fanz.website/free/${link.slug}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{link.freeDays}d free</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-green-400">{link.redemptionCount}</div>
                      <div className="text-xs text-muted-foreground">
                        {link.maxRedemptions ? `/ ${link.maxRedemptions}` : 'redeemed'}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-400">{link.viewCount}</div>
                      <div className="text-xs text-muted-foreground">views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-slate-400">{link.scanCount}</div>
                      <div className="text-xs text-muted-foreground">QR scans</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLink(link);
                        setIsQrDialogOpen(true);
                      }}
                    >
                      <QrCode className="h-4 w-4 mr-1" />
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedLink(link);
                        setIsAnalyticsDialogOpen(true);
                      }}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => copyToClipboard(`https://boyfanz.fanz.website/free/${link.slug}`)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadQRCode(link)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download QR
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`/api/free-links/${link.slug}/wallet-pass?platform=apple`, '_blank')}>
                          <Wallet className="h-4 w-4 mr-2" />
                          Wallet Pass
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {link.status === 'active' ? (
                          <DropdownMenuItem onClick={() => updateLinkMutation.mutate({ id: link.id, status: 'paused' })}>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause Link
                          </DropdownMenuItem>
                        ) : link.status === 'paused' ? (
                          <DropdownMenuItem onClick={() => updateLinkMutation.mutate({ id: link.id, status: 'active' })}>
                            <Play className="h-4 w-4 mr-2" />
                            Activate Link
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-400"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this link?')) {
                              deleteLinkMutation.mutate(link.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Expiry / Dates */}
                <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Created {new Date(link.createdAt).toLocaleDateString()}
                  </div>
                  {link.expiresAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Expires {new Date(link.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                  {link.utmCampaign && (
                    <Badge variant="outline" className="text-xs">
                      Campaign: {link.utmCampaign}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* QR Code Dialog */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-primary" />
              QR Code: {selectedLink?.name}
            </DialogTitle>
            <DialogDescription>
              Scan this code to access free subscription
            </DialogDescription>
          </DialogHeader>

          {selectedLink?.qrCodeData && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div
                className="p-4 bg-white rounded-lg"
                dangerouslySetInnerHTML={{ __html: selectedLink.qrCodeData }}
              />
              <div className="text-center text-sm text-muted-foreground">
                {selectedLink.freeDays} days free access
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => downloadQRCode(selectedLink)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download SVG
                </Button>
                <Button
                  variant="outline"
                  onClick={() => copyToClipboard(`https://boyfanz.fanz.website/free/${selectedLink.slug}`)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
              </div>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Add to Wallet
            </h4>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-auto py-3"
                onClick={() => window.open(`/api/free-links/${selectedLink?.slug}/wallet-pass?platform=apple`, '_blank')}
              >
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">Apple Wallet</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-3"
                onClick={() => window.open(`/api/free-links/${selectedLink?.slug}/wallet-pass?platform=google`, '_blank')}
              >
                <div className="flex flex-col items-center gap-1">
                  <Smartphone className="h-5 w-5" />
                  <span className="text-xs">Google Wallet</span>
                </div>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={isAnalyticsDialogOpen} onOpenChange={setIsAnalyticsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Analytics: {selectedLink?.name}
            </DialogTitle>
          </DialogHeader>

          {analyticsLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : analyticsData ? (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <Eye className="h-5 w-5 mx-auto text-purple-400 mb-2" />
                    <div className="text-2xl font-bold">{analyticsData.totalViews}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <QrCode className="h-5 w-5 mx-auto text-slate-400 mb-2" />
                    <div className="text-2xl font-bold">{analyticsData.totalScans}</div>
                    <div className="text-xs text-muted-foreground">QR Scans</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <MousePointer className="h-5 w-5 mx-auto text-blue-400 mb-2" />
                    <div className="text-2xl font-bold">{analyticsData.totalClicks}</div>
                    <div className="text-xs text-muted-foreground">Direct Clicks</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <Users className="h-5 w-5 mx-auto text-green-400 mb-2" />
                    <div className="text-2xl font-bold">{analyticsData.totalRedemptions}</div>
                    <div className="text-xs text-muted-foreground">Redemptions</div>
                  </Card>
                </div>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">Conversion Rate</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">
                      {analyticsData.conversionRate.toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      of link views resulted in redemption
                    </p>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="redemptions" className="mt-4">
                {analyticsData.recentRedemptions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No redemptions yet
                  </div>
                ) : (
                  <div className="space-y-2">
                    {analyticsData.recentRedemptions.map((r) => (
                      <Card key={r.id} className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {r.deviceType === 'mobile' ? (
                              <Smartphone className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Monitor className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="text-sm font-medium">User {r.userId.slice(0, 8)}...</div>
                              <div className="text-xs text-muted-foreground">
                                via {r.source.replace('_', ' ')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground">
                              {new Date(r.redeemedAt).toLocaleDateString()}
                            </div>
                            {r.convertedToPaid && (
                              <Badge className="bg-green-500/20 text-green-400 text-xs">
                                Converted
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No analytics data available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
