'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle, X as XIcon, Loader } from 'lucide-react';
import { getMultiplatformQueue, cancelQueuedPost } from '@/lib/api/crossposting';
import { MultiplatformQueueItemWithDetails, PlatformPostStatus } from '@/types/crossposting';

interface QueueStatusMonitorProps {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

export function QueueStatusMonitor({
  autoRefresh = true,
  refreshInterval = 10000, // 10 seconds
}: QueueStatusMonitorProps) {
  const [queueItems, setQueueItems] = useState<MultiplatformQueueItemWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingIds, setCancellingIds] = useState<Set<string>>(new Set());

  const loadQueue = async () => {
    try {
      setError(null);
      const items = await getMultiplatformQueue();
      setQueueItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();

    if (autoRefresh) {
      const interval = setInterval(loadQueue, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const handleCancel = async (itemId: string) => {
    setCancellingIds(prev => new Set(prev).add(itemId));

    try {
      await cancelQueuedPost(itemId);
      // Reload queue to show updated status
      await loadQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel post');
    } finally {
      setCancellingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    loadQueue();
  };

  const getStatusBadge = (status: PlatformPostStatus) => {
    switch (status) {
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-border/50 text-text-secondary border border-border">
            <Clock className="w-3 h-3" />
            Queued
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary border border-primary/30 animate-pulse">
            <Loader className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3" />
            Posted
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-border/50 text-text-secondary border border-border">
            <XIcon className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Group items by status
  const groupedItems = {
    active: queueItems.filter(item => ['queued', 'processing'].includes(item.status)),
    completed: queueItems.filter(item => item.status === 'posted'),
    failed: queueItems.filter(item => ['failed', 'cancelled'].includes(item.status)),
  };

  const totalActive = groupedItems.active.length;
  const totalCompleted = groupedItems.completed.length;
  const totalFailed = groupedItems.failed.length;

  if (loading && queueItems.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text">Post Queue Status</h3>
          <p className="text-sm text-text-secondary mt-1">
            Monitor cross-platform posting progress
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-lg border-2 border-border text-text hover:bg-surface hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p className="text-sm text-primary">{error}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-background/50 rounded-lg border border-border neon-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-text-secondary">Active</span>
          </div>
          <div className="text-2xl font-bold text-text">{totalActive}</div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg border border-border neon-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-text-secondary">Completed</span>
          </div>
          <div className="text-2xl font-bold text-text">{totalCompleted}</div>
        </div>

        <div className="p-4 bg-background/50 rounded-lg border border-border neon-border-subtle">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-medium text-text-secondary">Failed</span>
          </div>
          <div className="text-2xl font-bold text-text">{totalFailed}</div>
        </div>
      </div>

      {/* Queue Items */}
      {queueItems.length === 0 ? (
        <div className="p-8 bg-background/50 rounded-lg border border-border neon-border-subtle text-center">
          <Clock className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-50" />
          <p className="text-text-secondary">No items in queue</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Items */}
          {totalActive > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
                Active ({totalActive})
              </h4>
              {groupedItems.active.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  onCancel={handleCancel}
                  isCancelling={cancellingIds.has(item.id)}
                  getStatusBadge={getStatusBadge}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          )}

          {/* Completed Items */}
          {totalCompleted > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
                Completed ({totalCompleted})
              </h4>
              {groupedItems.completed.slice(0, 5).map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  onCancel={handleCancel}
                  isCancelling={false}
                  getStatusBadge={getStatusBadge}
                  formatTimestamp={formatTimestamp}
                />
              ))}
              {totalCompleted > 5 && (
                <p className="text-sm text-text-secondary text-center py-2">
                  Showing 5 of {totalCompleted} completed items
                </p>
              )}
            </div>
          )}

          {/* Failed Items */}
          {totalFailed > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text uppercase tracking-wider">
                Failed ({totalFailed})
              </h4>
              {groupedItems.failed.map((item) => (
                <QueueItem
                  key={item.id}
                  item={item}
                  onCancel={handleCancel}
                  isCancelling={false}
                  getStatusBadge={getStatusBadge}
                  formatTimestamp={formatTimestamp}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for individual queue items
interface QueueItemProps {
  item: MultiplatformQueueItemWithDetails;
  onCancel: (id: string) => void;
  isCancelling: boolean;
  getStatusBadge: (status: PlatformPostStatus) => React.ReactNode;
  formatTimestamp: (timestamp: string) => string;
}

function QueueItem({
  item,
  onCancel,
  isCancelling,
  getStatusBadge,
  formatTimestamp,
}: QueueItemProps) {
  const canCancel = ['queued'].includes(item.status);
  const showRetryInfo = item.status === 'failed' && item.retryCount < item.maxRetries;

  return (
    <div className="p-4 bg-surface rounded-lg border border-border hover:border-primary/30 transition-colors neon-border-subtle">
      <div className="flex items-start gap-4">
        {/* Platform Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-xl">
          {item.platform.icon || item.platform.name[0]}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h5 className="font-semibold text-text truncate">{item.platform.name}</h5>
                {getStatusBadge(item.status)}
              </div>
              {item.originalPost && (
                <p className="text-sm text-text-secondary line-clamp-1">
                  {item.originalPost.title || item.originalPost.content}
                </p>
              )}
            </div>

            {/* Actions */}
            {canCancel && (
              <button
                onClick={() => onCancel(item.id)}
                disabled={isCancelling}
                className="flex-shrink-0 p-2 rounded-lg hover:bg-background transition-colors text-text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel post"
              >
                {isCancelling ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <XIcon className="w-4 h-4" />
                )}
              </button>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
            <span>Queued {formatTimestamp(item.queuedAt)}</span>
            {item.scheduledFor && (
              <span>Scheduled for {new Date(item.scheduledFor).toLocaleString()}</span>
            )}
            {item.retryCount > 0 && (
              <span className="text-primary">
                Retry {item.retryCount}/{item.maxRetries}
              </span>
            )}
            {showRetryInfo && (
              <span className="text-primary">
                Will retry automatically
              </span>
            )}
          </div>

          {/* Error Message */}
          {item.errorMessage && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-400">
              {item.errorMessage}
            </div>
          )}

          {/* Target Post Link */}
          {item.targetPostId && item.status === 'posted' && (
            <div className="mt-2">
              <a
                href={`https://${item.platform.domain}/posts/${item.targetPostId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline"
              >
                View post on {item.platform.name} →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
