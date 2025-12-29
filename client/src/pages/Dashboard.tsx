import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skull, Flame, DollarSign, Users, Eye, Clock, Upload, CreditCard, FileText, Settings, TrendingUp, Zap, Heart, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { formatRelativeTime } from "@/lib/dateUtils";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: recentMedia, isLoading: mediaLoading } = useQuery({
    queryKey: ['/api/media'],
    select: (data) => Array.isArray(data) ? data.slice(0, 5) : [],
  });

  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ['/api/notifications'],
    select: (data) => Array.isArray(data) ? data.slice(0, 6) : [],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getNotificationIcon = (kind: string) => {
    switch (kind) {
      case 'payout': return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'moderation': return <Eye className="h-4 w-4 text-yellow-400" />;
      case 'kyc': return <Skull className="h-4 w-4 text-red-400" />;
      case 'fan_activity': return <Heart className="h-4 w-4 text-pink-400" />;
      case 'message': return <MessageSquare className="h-4 w-4 text-orange-400" />;
      default: return <Zap className="h-4 w-4 text-orange-400" />;
    }
  };

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-950/80 via-black to-orange-950/80 border border-red-500/20 p-6">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
        <div className="relative flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-lg shadow-lg shadow-red-500/30">
            <Skull className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-yellow-500">
              Command Center
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              Welcome back, {user?.username || user?.firstName || 'Outlaw'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-950/50 to-black border-green-500/20 hover:border-green-500/40 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-400/80 uppercase tracking-wider font-semibold">Total Revenue</p>
                <p className="text-3xl font-black text-green-400 mt-1" data-testid="total-revenue">
                  ${statsLoading ? "..." : ((stats as any)?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-green-500/10 rounded-xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                <DollarSign className="text-green-400 h-7 w-7" />
              </div>
            </div>
            {!statsLoading && (stats as any)?.revenueChange && (
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="text-green-400 h-4 w-4 mr-1" />
                <span className="text-green-400 font-semibold">{(stats as any).revenueChange}%</span>
                <span className="text-gray-500 ml-1">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-950/50 to-black border-red-500/20 hover:border-red-500/40 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-400/80 uppercase tracking-wider font-semibold">Active Fans</p>
                <p className="text-3xl font-black text-red-400 mt-1" data-testid="active-fans">
                  {statsLoading ? "..." : ((stats as any)?.activeFans || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-red-500/10 rounded-xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                <Users className="text-red-400 h-7 w-7" />
              </div>
            </div>
            {!statsLoading && (stats as any)?.newFans && (
              <div className="mt-4 flex items-center text-sm">
                <Heart className="text-red-400 h-4 w-4 mr-1" />
                <span className="text-red-400 font-semibold">+{(stats as any).newFans}</span>
                <span className="text-gray-500 ml-1">new this week</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-950/50 to-black border-orange-500/20 hover:border-orange-500/40 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-400/80 uppercase tracking-wider font-semibold">Content Views</p>
                <p className="text-3xl font-black text-orange-400 mt-1" data-testid="content-views">
                  {statsLoading ? "..." : ((stats as any)?.contentViews || 0).toLocaleString()}
                </p>
              </div>
              <div className="h-14 w-14 bg-orange-500/10 rounded-xl flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                <Eye className="text-orange-400 h-7 w-7" />
              </div>
            </div>
            {!statsLoading && (stats as any)?.viewsChange && (
              <div className="mt-4 flex items-center text-sm">
                <Flame className="text-orange-400 h-4 w-4 mr-1" />
                <span className="text-orange-400 font-semibold">{(stats as any).viewsChange}%</span>
                <span className="text-gray-500 ml-1">engagement</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-950/50 to-black border-yellow-500/20 hover:border-yellow-500/40 transition-all group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-400/80 uppercase tracking-wider font-semibold">Pending Reviews</p>
                <p className="text-3xl font-black text-yellow-400 mt-1" data-testid="pending-reviews">
                  {statsLoading ? "..." : (stats as any)?.pendingReviews || 0}
                </p>
              </div>
              <div className="h-14 w-14 bg-yellow-500/10 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                <Clock className="text-yellow-400 h-7 w-7" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">Awaiting moderation</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Media Uploads */}
        <Card className="bg-gradient-to-br from-red-950/30 to-black border-red-500/20">
          <CardHeader className="border-b border-red-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Flame className="h-5 w-5 text-orange-500" />
                <CardTitle className="text-lg font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  Recent Uploads
                </CardTitle>
              </div>
              <Link href="/media">
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  View All →
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {mediaLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="h-16 w-16 bg-red-500/10 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-red-500/10 rounded mb-2 w-3/4"></div>
                      <div className="h-3 bg-red-500/10 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentMedia?.map((media: any) => (
                  <div key={media.id} className="flex items-center gap-4 p-3 rounded-lg bg-black/40 border border-red-500/10 hover:border-red-500/30 transition-all group" data-testid={`media-item-${media.id}`}>
                    <div className="h-16 w-16 bg-gradient-to-br from-red-600/20 to-orange-600/20 rounded-lg flex items-center justify-center group-hover:from-red-600/30 group-hover:to-orange-600/30 transition-colors">
                      <Upload className="text-red-400 h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate" data-testid={`media-title-${media.id}`}>
                        {media.title || 'Untitled'}
                      </p>
                      <p className="text-sm text-gray-500" data-testid={`media-date-${media.id}`}>
                        {formatRelativeTime(media.createdAt)}
                      </p>
                    </div>
                    <Badge className={getStatusColor(media.status)} data-testid={`media-status-${media.id}`}>
                      {media.status}
                    </Badge>
                  </div>
                ))}
                {(!recentMedia || recentMedia.length === 0) && (
                  <div className="text-center py-12">
                    <Upload className="h-12 w-12 text-red-500/30 mx-auto mb-4" />
                    <p className="text-gray-500">No uploads yet</p>
                    <Link href="/media">
                      <Button className="mt-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500">
                        Upload Your First Content
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="bg-gradient-to-br from-orange-950/30 to-black border-orange-500/20">
          <CardHeader className="border-b border-orange-500/20">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-yellow-500" />
              <CardTitle className="text-lg font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                Activity Feed
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {notificationsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="h-10 w-10 bg-orange-500/10 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-orange-500/10 rounded mb-2 w-full"></div>
                      <div className="h-3 bg-orange-500/10 rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {notifications?.map((notification: any) => (
                  <div key={notification.id} className="flex items-start gap-3 p-3 rounded-lg bg-black/40 border border-orange-500/10 hover:border-orange-500/30 transition-all" data-testid={`notification-${notification.id}`}>
                    <div className="h-10 w-10 bg-gradient-to-br from-orange-600/20 to-yellow-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      {getNotificationIcon(notification.kind)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white" data-testid={`notification-message-${notification.id}`}>
                        {notification.payloadJson?.message || 'New activity'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1" data-testid={`notification-time-${notification.id}`}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
                {(!notifications || notifications.length === 0) && (
                  <div className="text-center py-12">
                    <Zap className="h-12 w-12 text-orange-500/30 mx-auto mb-4" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-red-950/40 via-black to-orange-950/40 border-red-500/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Skull className="h-5 w-5 text-red-500" />
            <CardTitle className="text-lg font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Quick Actions
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/media">
              <Button className="w-full justify-start gap-3 h-auto p-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 shadow-lg shadow-red-500/20" data-testid="upload-content-button">
                <Upload className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Upload Content</div>
                  <div className="text-xs opacity-80">Share new media</div>
                </div>
              </Button>
            </Link>

            <Link href="/payouts">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto p-4 border-green-500/30 hover:bg-green-500/10 hover:border-green-500/50 text-green-400" data-testid="request-payout-button">
                <CreditCard className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Request Payout</div>
                  <div className="text-xs opacity-80">Get your earnings</div>
                </div>
              </Button>
            </Link>

            <Link href="/compliance">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto p-4 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50 text-yellow-400" data-testid="view-compliance-button">
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Compliance</div>
                  <div className="text-xs opacity-80">Legal & verification</div>
                </div>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="outline" className="w-full justify-start gap-3 h-auto p-4 border-gray-500/30 hover:bg-gray-500/10 hover:border-gray-500/50 text-gray-400" data-testid="settings-button">
                <Settings className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-bold">Settings</div>
                  <div className="text-xs opacity-80">Account & preferences</div>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
