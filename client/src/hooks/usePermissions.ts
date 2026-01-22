import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface UserPermissions {
  isAdmin: boolean;
  isModerator: boolean;
  permissions: string[];
  hasAdminAccess: boolean;
}

// Permission groups for sidebar sections
export const PERMISSION_GROUPS = {
  // Administration section
  administration: [
    "analytics_dashboard",
    "moderation_queue",
    "moderation_actions",
    "users_view",
    "users_edit",
    "system_delegation",
    "system_themes",
    "analytics_reports",
  ],

  // Content Management section
  contentManagement: [
    "content_posts",
    "content_streams",
    "content_stories",
    "content_shop",
    "content_forums",
  ],

  // Financial Management section
  financialManagement: [
    "financial_transactions",
    "financial_billing",
    "financial_tax",
    "financial_payments",
    "financial_deposits",
  ],

  // System Management section
  systemManagement: [
    "system_announcements",
    "system_push",
    "system_email",
    "system_settings",
    "system_oauth",
    "system_storage",
  ],
} as const;

// Map routes to required permissions
export const ROUTE_PERMISSIONS: Record<string, string[]> = {
  "/admin/dashboard": ["analytics_dashboard"],
  "/admin/complaints": ["moderation_actions", "moderation_reports"],
  "/admin/withdrawals": ["financial_withdrawals"],
  "/admin/verification": ["users_verify"],
  "/admin/moderation": ["moderation_queue", "moderation_actions"],
  "/admin/users": ["users_view", "users_edit"],
  "/admin/delegation": ["system_delegation"],
  "/admin/themes": ["system_themes"],
  "/admin/reports": ["analytics_reports"],
  "/admin/posts": ["content_posts"],
  "/admin/streaming": ["content_streams"],
  "/admin/stories": ["content_stories"],
  "/admin/shop": ["content_shop"],
  "/admin/categories": ["content_posts"],
  "/admin/transactions": ["financial_transactions"],
  "/admin/billing": ["financial_billing"],
  "/admin/tax-rates": ["financial_tax"],
  "/admin/payment-settings": ["financial_payments"],
  "/admin/deposits": ["financial_deposits"],
  "/admin/announcements": ["system_announcements"],
  "/admin/push-notifications": ["system_push"],
  "/admin/email-marketing": ["system_email"],
  "/admin/system-settings": ["system_settings"],
  "/admin/oauth-settings": ["system_oauth"],
  "/admin/storage": ["system_storage"],
  "/admin/cloud-storage": ["system_storage"],
  "/admin/forums": ["content_forums"],
  "/admin/platforms": ["system_settings"],
  "/admin/messages": ["moderation_actions"],
};

// Response from /api/auth/check-admin endpoint
interface CheckAdminResponse {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isModerator: boolean;
  bypassCharges: boolean;
  roles?: string[];
}

export function usePermissions() {
  // Use the working /api/auth/check-admin endpoint
  const { data: checkAdminData, isLoading, error } = useQuery<CheckAdminResponse>({
    queryKey: ["/api/auth/check-admin"],
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  // Transform check-admin response to UserPermissions format
  const data: UserPermissions | undefined = checkAdminData ? {
    isAdmin: checkAdminData.isAdmin || checkAdminData.isSuperAdmin,
    isModerator: checkAdminData.isModerator,
    permissions: checkAdminData.isAdmin || checkAdminData.isSuperAdmin ? ["*"] : [],
    hasAdminAccess: checkAdminData.isAdmin || checkAdminData.isSuperAdmin || checkAdminData.isModerator
  } : undefined;

  const hasPermission = (permission: string): boolean => {
    if (!data) return false;
    if (data.isAdmin) return true; // Admin has all permissions
    if (data.permissions.includes("*")) return true; // Wildcard
    return data.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!data) return false;
    if (data.isAdmin) return true;
    if (data.permissions.includes("*")) return true;
    return permissions.some((p) => data.permissions.includes(p));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    if (!data) return false;
    if (data.isAdmin) return true;
    if (data.permissions.includes("*")) return true;
    return permissions.every((p) => data.permissions.includes(p));
  };

  const canAccessRoute = (route: string): boolean => {
    if (!data) return false;
    if (data.isAdmin) return true;

    const requiredPermissions = ROUTE_PERMISSIONS[route];
    if (!requiredPermissions) return data.hasAdminAccess; // Default to admin access check

    return hasAnyPermission(requiredPermissions);
  };

  const canAccessSection = (section: keyof typeof PERMISSION_GROUPS): boolean => {
    if (!data) return false;
    if (data.isAdmin) return true;

    const sectionPermissions = PERMISSION_GROUPS[section];
    return hasAnyPermission([...sectionPermissions]);
  };

  return {
    permissions: data,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessRoute,
    canAccessSection,
    isAdmin: data?.isAdmin ?? false,
    isModerator: data?.isModerator ?? false,
    hasAdminAccess: data?.hasAdminAccess ?? false,
  };
}
