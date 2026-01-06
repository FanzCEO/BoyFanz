'use client';

import { useState } from 'react';
import { X, Check, XCircle, User, Calendar, Eye } from 'lucide-react';
import { PostTagWithCreator } from '@/types/crossposting';
import { approveRejectTag } from '@/lib/api/crossposting';

interface TagApprovalModalProps {
  tag: PostTagWithCreator;
  isOpen: boolean;
  onClose: () => void;
  onApproved: () => void;
  onRejected: () => void;
}

export function TagApprovalModal({
  tag,
  isOpen,
  onClose,
  onApproved,
  onRejected,
}: TagApprovalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await approveRejectTag(tag.id, {
        action: 'approve',
      });
      onApproved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve tag');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await approveRejectTag(tag.id, {
        action: 'reject',
        rejectionReason: rejectionReason.trim(),
      });
      onRejected();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject tag');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-approval-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm transition-opacity" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-surface border border-border rounded-lg shadow-2xl neon-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-background/50">
          <h2 id="tag-approval-title" className="text-xl font-bold text-text">
            Tag Approval Request
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface transition-colors text-text-secondary hover:text-text"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Creator Info */}
          <div className="flex items-start gap-4 p-4 bg-background/50 rounded-lg border border-border neon-border-subtle">
            <div className="flex-shrink-0">
              {tag.taggedByCreator.avatarUrl ? (
                <img
                  src={tag.taggedByCreator.avatarUrl}
                  alt={tag.taggedByCreator.displayName}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-surface border-2 border-primary flex items-center justify-center">
                  <User className="w-8 h-8 text-text-secondary" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-text truncate">
                  {tag.taggedByCreator.displayName}
                </h3>
                {tag.taggedByCreator.isVerified && (
                  <svg
                    className="w-4 h-4 text-primary flex-shrink-0"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-text-secondary mb-2">
                @{tag.taggedByCreator.username}
              </p>

              <div className="flex flex-wrap gap-2 text-xs">
                {tag.taggedByCreator.isFollowing && (
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                    Following
                  </span>
                )}
                {tag.taggedByCreator.isSubscribed && (
                  <span className="px-2 py-1 bg-primary/20 text-primary rounded-full border border-primary/30">
                    Subscriber
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-xs text-text-secondary mb-1">
                <Calendar className="w-3 h-3" />
                <time dateTime={tag.taggedAt}>
                  {new Date(tag.taggedAt).toLocaleDateString()}
                </time>
              </div>
              <div className="text-xs text-text-secondary">
                {new Date(tag.taggedAt).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Post Preview */}
          {tag.post && (
            <div className="p-4 bg-background/50 rounded-lg border border-border neon-border-subtle">
              <div className="flex items-center gap-2 mb-3 text-text-secondary text-sm">
                <Eye className="w-4 h-4" />
                <span>Post Preview</span>
              </div>

              <div className="space-y-3">
                {tag.post.thumbnailUrl && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-border">
                    <img
                      src={tag.post.thumbnailUrl}
                      alt={tag.post.title || 'Post preview'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {tag.post.title && (
                  <h4 className="font-semibold text-text line-clamp-2">
                    {tag.post.title}
                  </h4>
                )}

                {tag.post.content && (
                  <p className="text-sm text-text-secondary line-clamp-3">
                    {tag.post.content}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Reject Form */}
          {showRejectForm && (
            <div className="space-y-3">
              <label htmlFor="rejection-reason" className="block text-sm font-medium text-text">
                Rejection Reason
              </label>
              <textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why you're rejecting this tag..."
                rows={3}
                className="w-full px-4 py-2 bg-surface border border-border rounded-lg text-text placeholder:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary neon-border-subtle resize-none"
                disabled={isProcessing}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-start gap-3">
              <XCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-sm text-primary">{error}</p>
            </div>
          )}

          {/* Info Message */}
          <div className="p-4 bg-background/50 border border-border/50 rounded-lg">
            <p className="text-sm text-text-secondary">
              <strong className="text-text">Approving this tag</strong> will allow this post to
              appear on your wall. The post will be visible to your followers with a "tagged by"
              attribution.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-background/50">
          {!showRejectForm ? (
            <>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-lg border-2 border-border text-text hover:bg-surface hover:border-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-lg bg-primary text-accent font-semibold hover:shadow-red-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                {isProcessing ? 'Approving...' : 'Approve Tag'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setShowRejectForm(false);
                  setRejectionReason('');
                  setError(null);
                }}
                disabled={isProcessing}
                className="px-6 py-2.5 rounded-lg border-2 border-border text-text hover:bg-surface transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-6 py-2.5 rounded-lg bg-primary text-accent font-semibold hover:shadow-red-glow transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
              >
                <XCircle className="w-5 h-5" />
                {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
