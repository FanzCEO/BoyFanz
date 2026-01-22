import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { UserPlus, Shield, Users, Crown, Key, Settings, DollarSign, FileText, BarChart3, ChevronDown } from "lucide-react";

// All available permissions organized by category
const PERMISSION_CATEGORIES = {
  moderation: {
    label: "Moderation",
    icon: Shield,
    description: "Content moderation and queue management",
    permissions: [
      { id: "moderation_queue", label: "Moderation Queue", description: "Access and manage moderation queue" },
      { id: "moderation_actions", label: "Moderation Actions", description: "Take moderation actions (approve/reject/flag)" },
      { id: "moderation_reports", label: "View Reports", description: "View content reports from users" },
    ],
  },
  users: {
    label: "User Management",
    icon: Users,
    description: "User accounts and verification",
    permissions: [
      { id: "user_management", label: "Basic User Management", description: "Legacy - basic user management access" },
      { id: "users_view", label: "View Users", description: "View user list and profiles" },
      { id: "users_edit", label: "Edit Users", description: "Edit user profiles and information" },
      { id: "users_suspend", label: "Suspend Users", description: "Suspend or ban user accounts" },
      { id: "users_delete", label: "Delete Users", description: "Permanently delete user accounts" },
      { id: "users_verify", label: "Verify Users", description: "Process KYC verification requests" },
      { id: "users_roles", label: "Assign Roles", description: "Change user roles" },
    ],
  },
  content: {
    label: "Content Management",
    icon: FileText,
    description: "Posts, stories, streams, and more",
    permissions: [
      { id: "content_approval", label: "Content Approval", description: "Legacy - approve/reject content" },
      { id: "content_posts", label: "Manage Posts", description: "Create, edit, delete posts" },
      { id: "content_stories", label: "Manage Stories", description: "Manage user stories" },
      { id: "content_streams", label: "Manage Streams", description: "Manage live streams" },
      { id: "content_shop", label: "Manage Shop", description: "Manage shop items and products" },
      { id: "content_forums", label: "Manage Forums", description: "Manage forum categories and topics" },
      { id: "content_comments", label: "Manage Comments", description: "Moderate user comments" },
      { id: "content_messages", label: "View Messages", description: "View and moderate messages" },
    ],
  },
  financial: {
    label: "Financial Management",
    icon: DollarSign,
    description: "Transactions, withdrawals, and payments",
    permissions: [
      { id: "financial_transactions", label: "View Transactions", description: "View all platform transactions" },
      { id: "financial_withdrawals", label: "Process Withdrawals", description: "Approve/process withdrawal requests" },
      { id: "financial_deposits", label: "Manage Deposits", description: "View and manage deposits" },
      { id: "financial_billing", label: "Billing Management", description: "Manage billing and invoices" },
      { id: "financial_tax", label: "Tax Settings", description: "Configure tax rates and settings" },
      { id: "financial_payments", label: "Payment Settings", description: "Configure payment methods" },
      { id: "financial_refunds", label: "Process Refunds", description: "Issue refunds to users" },
    ],
  },
  system: {
    label: "System Management",
    icon: Settings,
    description: "Platform settings and configuration",
    permissions: [
      { id: "system_settings", label: "System Settings", description: "Legacy - basic system settings" },
      { id: "system_announcements", label: "Announcements", description: "Create and manage announcements" },
      { id: "system_push", label: "Push Notifications", description: "Send push notifications" },
      { id: "system_email", label: "Email Marketing", description: "Manage email campaigns" },
      { id: "system_storage", label: "Storage Management", description: "Manage file storage" },
      { id: "system_oauth", label: "OAuth Settings", description: "Configure social login providers" },
      { id: "system_themes", label: "Theme Management", description: "Create and manage themes" },
      { id: "system_delegation", label: "Delegation Management", description: "Grant/revoke permissions to others" },
    ],
  },
  analytics: {
    label: "Analytics & Reports",
    icon: BarChart3,
    description: "Platform analytics and reporting",
    permissions: [
      { id: "analytics_access", label: "Analytics Access", description: "Legacy - basic analytics access" },
      { id: "analytics_dashboard", label: "View Dashboard", description: "View admin dashboard" },
      { id: "analytics_reports", label: "View Reports", description: "View detailed reports" },
      { id: "analytics_export", label: "Export Data", description: "Export analytics data" },
    ],
  },
};

type Permission = string;

export default function DelegationManager() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearch, setUserSearch] = useState("");
  const [roleUpdateDialog, setRoleUpdateDialog] = useState(false);

  // Show loading while auth is loading
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground ml-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Only admins can access delegation management
  if (user?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only administrators can access delegation management.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: user?.role === 'admin',
  });

  const { data: delegations, isLoading: delegationsLoading } = useQuery({
    queryKey: ['/api/admin/delegations'],
    enabled: user?.role === 'admin',
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return apiRequest('PUT', `/api/admin/users/${userId}/role`, { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setRoleUpdateDialog(false);
      setSelectedUser(null);
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const grantPermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Permission }) => {
      return apiRequest('POST', '/api/admin/delegations/grant', {
        userId,
        permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/delegations'] });
      toast({
        title: "Success",
        description: "Permission granted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const revokePermissionMutation = useMutation({
    mutationFn: async ({ userId, permission }: { userId: string; permission: Permission }) => {
      return apiRequest('POST', '/api/admin/delegations/revoke', {
        userId,
        permission,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/delegations'] });
      toast({
        title: "Success",
        description: "Permission revoked successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const grantAllInCategory = async (userId: string, categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
    for (const permission of category.permissions) {
      if (!hasPermission(userId, permission.id)) {
        await grantPermissionMutation.mutateAsync({ userId, permission: permission.id });
      }
    }
  };

  const revokeAllInCategory = async (userId: string, categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
    for (const permission of category.permissions) {
      if (hasPermission(userId, permission.id)) {
        await revokePermissionMutation.mutateAsync({ userId, permission: permission.id });
      }
    }
  };

  const filteredUsers = Array.isArray(users) ? users.filter((u: any) =>
    (u.username?.toLowerCase() ?? "").includes(userSearch.toLowerCase()) ||
    (u.email?.toLowerCase() ?? "").includes(userSearch.toLowerCase())
  ) : [];

  const getUserPermissions = (userId: string) => {
    return Array.isArray(delegations) ? delegations.filter((d: any) => d.userId === userId && d.granted) : [];
  };

  const hasPermission = (userId: string, permission: Permission) => {
    return getUserPermissions(userId).some((p: any) => p.permission === permission);
  };

  const getCategoryPermissionCount = (userId: string, categoryKey: string) => {
    const category = PERMISSION_CATEGORIES[categoryKey as keyof typeof PERMISSION_CATEGORIES];
    const granted = category.permissions.filter(p => hasPermission(userId, p.id)).length;
    return { granted, total: category.permissions.length };
  };

  const handleTogglePermission = (userId: string, permission: Permission) => {
    if (hasPermission(userId, permission)) {
      revokePermissionMutation.mutate({ userId, permission });
    } else {
      grantPermissionMutation.mutate({ userId, permission });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold font-display" data-testid="page-title">Delegation Manager</h1>
          <p className="text-muted-foreground">Manage user roles and delegate granular admin permissions</p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">User Permissions</TabsTrigger>
          <TabsTrigger value="overview">Delegation Overview</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Permission Management
              </CardTitle>
              <CardDescription>
                Search for users and manage their delegated permissions at micro and macro levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Label htmlFor="user-search">Search Users</Label>
                <Input
                  id="user-search"
                  placeholder="Search by username or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="mt-1"
                  data-testid="user-search-input"
                />
              </div>

              <div className="space-y-6">
                {usersLoading && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                )}

                {filteredUsers?.slice(0, 20).map((userData: any) => (
                  <Card key={userData.id} className="border-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            {userData.profileImageUrl ? (
                              <img src={userData.profileImageUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
                            ) : (
                              <span className="font-bold text-lg text-primary">
                                {(userData.username || userData.email || '?').charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-lg" data-testid={`user-name-${userData.username}`}>
                              {userData.displayName || userData.username || 'Unknown'}
                            </p>
                            <p className="text-sm text-muted-foreground">{userData.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant={
                            userData.role === 'admin' ? 'destructive' :
                            userData.role === 'moderator' ? 'default' :
                            userData.role === 'creator' ? 'secondary' : 'outline'
                          } className="text-sm py-1">
                            {userData.role === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                            {userData.role === 'moderator' && <Shield className="h-3 w-3 mr-1" />}
                            {userData.role}
                          </Badge>
                          {userData.role !== 'admin' && (
                            <Dialog open={selectedUser?.id === userData.id && roleUpdateDialog} onOpenChange={(open) => {
                              setRoleUpdateDialog(open);
                              if (!open) setSelectedUser(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(userData)}
                                  data-testid={`change-role-${userData.username}`}
                                >
                                  Change Role
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Change User Role</DialogTitle>
                                  <DialogDescription>
                                    Change the role for {userData.username}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div className="grid grid-cols-3 gap-2">
                                    <Button
                                      variant={userData.role === 'admin' ? 'default' : 'outline'}
                                      onClick={() => updateRoleMutation.mutate({ userId: userData.id, role: 'admin' })}
                                      disabled={updateRoleMutation.isPending}
                                      data-testid="role-admin"
                                    >
                                      <Crown className="h-4 w-4 mr-2" />
                                      Admin
                                    </Button>
                                    <Button
                                      variant={userData.role === 'moderator' ? 'default' : 'outline'}
                                      onClick={() => updateRoleMutation.mutate({ userId: userData.id, role: 'moderator' })}
                                      disabled={updateRoleMutation.isPending}
                                      data-testid="role-moderator"
                                    >
                                      <Shield className="h-4 w-4 mr-2" />
                                      Moderator
                                    </Button>
                                    <Button
                                      variant={userData.role === 'fan' ? 'default' : 'outline'}
                                      onClick={() => updateRoleMutation.mutate({ userId: userData.id, role: 'fan' })}
                                      disabled={updateRoleMutation.isPending}
                                      data-testid="role-fan"
                                    >
                                      Fan
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Permissions for non-admin users */}
                    {userData.role !== 'admin' && (
                      <CardContent className="pt-4">
                        <Separator className="mb-4" />
                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-base font-semibold">Delegated Permissions</Label>
                          <div className="text-sm text-muted-foreground">
                            {getUserPermissions(userData.id).length} permissions granted
                          </div>
                        </div>

                        <Accordion type="multiple" className="w-full">
                          {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                            const Icon = category.icon;
                            const counts = getCategoryPermissionCount(userData.id, key);

                            return (
                              <AccordionItem key={key} value={key}>
                                <AccordionTrigger className="hover:no-underline">
                                  <div className="flex items-center justify-between w-full pr-4">
                                    <div className="flex items-center gap-3">
                                      <Icon className="h-4 w-4 text-muted-foreground" />
                                      <span className="font-medium">{category.label}</span>
                                    </div>
                                    <Badge variant={counts.granted > 0 ? "default" : "outline"} className="ml-2">
                                      {counts.granted}/{counts.total}
                                    </Badge>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="space-y-3 pt-2">
                                    <div className="flex gap-2 mb-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => grantAllInCategory(userData.id, key)}
                                        disabled={grantPermissionMutation.isPending || revokePermissionMutation.isPending}
                                      >
                                        Grant All
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => revokeAllInCategory(userData.id, key)}
                                        disabled={grantPermissionMutation.isPending || revokePermissionMutation.isPending}
                                      >
                                        Revoke All
                                      </Button>
                                    </div>
                                    {category.permissions.map((permission) => (
                                      <div key={permission.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="flex-1">
                                          <p className="text-sm font-medium">{permission.label}</p>
                                          <p className="text-xs text-muted-foreground">{permission.description}</p>
                                        </div>
                                        <Switch
                                          checked={hasPermission(userData.id, permission.id)}
                                          onCheckedChange={() => handleTogglePermission(userData.id, permission.id)}
                                          disabled={grantPermissionMutation.isPending || revokePermissionMutation.isPending}
                                          data-testid={`permission-${permission.id}-${userData.username}`}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </CardContent>
                    )}

                    {userData.role === 'admin' && (
                      <CardContent className="pt-0">
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <Crown className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                          <p className="text-sm text-muted-foreground">
                            Administrators have full access to all features
                          </p>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}

                {filteredUsers?.length > 20 && (
                  <p className="text-center text-sm text-muted-foreground">
                    Showing first 20 results. Refine your search to see more.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Permission Categories Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Permission Categories</CardTitle>
                <CardDescription>
                  Overview of available permission categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(PERMISSION_CATEGORIES).map(([key, category]) => {
                    const Icon = category.icon;
                    return (
                      <div key={key} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{category.label}</p>
                          <p className="text-xs text-muted-foreground">{category.description}</p>
                        </div>
                        <Badge variant="outline">{category.permissions.length}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Active Delegations Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Active Delegations</CardTitle>
                <CardDescription>
                  Users with delegated permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {delegationsLoading && (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Loading delegations...</p>
                  </div>
                )}

                {Array.isArray(delegations) && delegations.length === 0 && (
                  <div className="text-center py-8">
                    <Key className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">No active delegations</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Grant permissions to users in the User Permissions tab
                    </p>
                  </div>
                )}

                {Array.isArray(delegations) && delegations.length > 0 && (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {delegations.filter((d: any) => d.granted).map((delegation: any) => {
                      const delegationUser = Array.isArray(users) ? users.find((u: any) => u.id === delegation.userId) : null;
                      return (
                        <div key={`${delegation.userId}-${delegation.permission}`} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-medium text-primary">
                                {(delegationUser?.username || '?').charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {delegationUser?.username || 'Unknown User'}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {delegation.permission.replace(/_/g, ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(delegation.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
