import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff, Check, DollarSign, Shield, Users, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Notifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest('PUT', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (kind: string) => {
    switch (kind) {
      case 'payout': return <DollarSign className="h-5 w-5 text-primary" />;
      case 'moderation': return <Check className="h-5 w-5 text-accent" />;
      case 'kyc': return <Shield className="h-5 w-5 text-yellow-500" />;
      case 'fan_activity': return <Users className="h-5 w-5 text-secondary" />;
      case 'system': return <Settings className="h-5 w-5 text-muted-foreground" />;
      default: return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getNotificationBgColor = (kind: string) => {
    switch (kind) {
      case 'payout': return 'bg-primary/10';
      case 'moderation': return 'bg-accent/10';
      case 'kyc': return 'bg-yellow-500/10';
      case 'fan_activity': return 'bg-secondary/10';
      case 'system': return 'bg-muted/10';
      default: return 'bg-muted/10';
    }
  };

  const unreadNotifications = notifications?.filter((n: any) => !n.readAt) || [];
  const readNotifications = notifications?.filter((n: any) => n.readAt) || [];

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - notificationDate.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const NotificationItem = ({ notification, isUnread = false }: { notification: any; isUnread?: boolean }) => (
    <div 
      className={`flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors ${isUnread ? 'bg-primary/5 border-primary/20' : ''}`}
      data-testid={`notification-${notification.id}`}
    >
      <div className={`h-10 w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getNotificationBgColor(notification.kind)}`}>
        {getNotificationIcon(notification.kind)}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isUnread ? 'font-medium' : ''}`} data-testid={`notification-message-${notification.id}`}>
          {notification.payloadJson?.message || 'Notification'}
        </p>
        <p className="text-xs text-muted-foreground mt-1" data-testid={`notification-time-${notification.id}`}>
          {formatTimeAgo(notification.createdAt)}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {isUnread && (
          <Badge variant="secondary" className="h-2 w-2 p-0 rounded-full bg-primary"></Badge>
        )}
        {isUnread && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => markReadMutation.mutate(notification.id)}
            disabled={markReadMutation.isPending}
            data-testid={`mark-read-${notification.id}`}
          >
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6" data-testid="notifications-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" data-testid="page-title">Notifications</h1>
          <p className="text-muted-foreground" data-testid="page-description">
            Stay updated with your platform activity
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unreadNotifications.length > 0 && (
            <Badge variant="secondary" data-testid="unread-count">
              {unreadNotifications.length} unread
            </Badge>
          )}
          <Button variant="outline" data-testid="notification-settings-button">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Payout Updates</p>
                <p className="text-lg font-semibold" data-testid="payout-notifications-count">
                  {notifications?.filter((n: any) => n.kind === 'payout').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-accent/10 rounded-lg flex items-center justify-center">
                <Check className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moderation</p>
                <p className="text-lg font-semibold" data-testid="moderation-notifications-count">
                  {notifications?.filter((n: any) => n.kind === 'moderation').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Fan Activity</p>
                <p className="text-lg font-semibold" data-testid="fan-activity-notifications-count">
                  {notifications?.filter((n: any) => n.kind === 'fan_activity').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-yellow-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Compliance</p>
                <p className="text-lg font-semibold" data-testid="kyc-notifications-count">
                  {notifications?.filter((n: any) => n.kind === 'kyc').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Tabs */}
      <Tabs defaultValue="unread" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unread" data-testid="unread-tab">
            Unread ({unreadNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="all" data-testid="all-tab">
            All ({notifications?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unread" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : unreadNotifications.length > 0 ? (
            <div className="space-y-4">
              {unreadNotifications.map((notification: any) => (
                <NotificationItem key={notification.id} notification={notification} isUnread={true} />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <BellOff className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="no-unread-title">
                  All caught up!
                </h3>
                <p className="text-muted-foreground text-center" data-testid="no-unread-description">
                  You have no unread notifications at the moment.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg animate-pulse">
                  <div className="h-10 w-10 bg-muted rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications && notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification: any) => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification} 
                  isUnread={!notification.readAt}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-card border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2" data-testid="no-notifications-title">
                  No notifications yet
                </h3>
                <p className="text-muted-foreground text-center" data-testid="no-notifications-description">
                  We'll notify you when there's activity on your account.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
