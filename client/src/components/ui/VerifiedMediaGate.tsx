/**
 * VerifiedMediaGate - Content Protection Component
 *
 * Blurs all media content until:
 * 1. Fan/Viewer is age-verified through VerifyMy
 * 2. Creator is fully verified (ID, Age, 2257 compliance) and approved
 *
 * Displays appropriate prompts for verification based on user status.
 */

import { useState, memo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { OptimizedImage } from './OptimizedImage';

interface VerificationStatus {
  isAgeVerified: boolean;
  isIdVerified: boolean;
  is2257Verified: boolean;
  verificationProvider: string;
  verificationDate: string | null;
  verificationExpiry: string | null;
}

interface CreatorVerificationStatus {
  creatorId: string;
  isVerified: boolean;
  isAgeVerified: boolean;
  isIdVerified: boolean;
  is2257Compliant: boolean;
  isApproved: boolean;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'expired' | 'none';
}

interface VerifiedMediaGateProps {
  src: string;
  alt: string;
  creatorId: string;
  className?: string;
  width?: number;
  height?: number;
  aspectRatio?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  isVideo?: boolean;
  isSensitive?: boolean;
  thumbnailUrl?: string;
  onUnlock?: () => void;
  children?: React.ReactNode;
}

// Hook to get current user's verification status
function useViewerVerification() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['/api/user/verification-status'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/user/verification-status');
      return res.json();
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    isVerified: data?.isAgeVerified || false,
    verificationStatus: data as VerificationStatus | undefined,
    isLoading,
    isLoggedIn: !!user,
  };
}

// Hook to get creator's verification status
function useCreatorVerification(creatorId: string) {
  const { data, isLoading } = useQuery({
    queryKey: ['/api/creators', creatorId, 'verification'],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/creators/${creatorId}/verification-status`);
      return res.json();
    },
    enabled: !!creatorId,
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  return {
    isCreatorVerified: data?.isApproved && data?.is2257Compliant,
    creatorStatus: data as CreatorVerificationStatus | undefined,
    isLoading,
  };
}

function VerifiedMediaGateComponent({
  src,
  alt,
  creatorId,
  className,
  width,
  height,
  aspectRatio = '16/9',
  objectFit = 'cover',
  isVideo = false,
  isSensitive = true,
  thumbnailUrl,
  onUnlock,
  children,
}: VerifiedMediaGateProps) {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [verifyType, setVerifyType] = useState<'age' | 'creator'>('age');

  const { isVerified: viewerVerified, isLoading: viewerLoading, isLoggedIn } = useViewerVerification();
  const { isCreatorVerified, creatorStatus, isLoading: creatorLoading } = useCreatorVerification(creatorId);

  const isLoading = viewerLoading || creatorLoading;

  // Determine if content should be shown
  const canViewContent = viewerVerified && isCreatorVerified;

  // Determine why content is blocked
  const getBlockReason = (): { reason: string; type: 'age' | 'creator' | 'login' } => {
    if (!isLoggedIn) {
      return { reason: 'Please log in to view this content', type: 'login' };
    }
    if (!viewerVerified) {
      return { reason: 'Age verification required', type: 'age' };
    }
    if (!isCreatorVerified) {
      if (creatorStatus?.verificationStatus === 'pending') {
        return { reason: 'Creator verification pending', type: 'creator' };
      }
      if (creatorStatus?.verificationStatus === 'rejected') {
        return { reason: 'Creator not verified', type: 'creator' };
      }
      if (creatorStatus?.verificationStatus === 'expired') {
        return { reason: 'Creator verification expired', type: 'creator' };
      }
      return { reason: 'Creator 2257 verification required', type: 'creator' };
    }
    return { reason: '', type: 'age' };
  };

  const blockInfo = getBlockReason();

  const handleVerifyClick = () => {
    if (!isLoggedIn) {
      window.location.href = '/login';
      return;
    }
    setVerifyType(blockInfo.type === 'age' ? 'age' : 'creator');
    setShowVerifyDialog(true);
  };

  const handleStartVerification = () => {
    // Redirect to VerifyMy age verification
    window.location.href = '/settings/verification';
  };

  // If content is viewable, render normally
  if (canViewContent && !isLoading) {
    if (children) {
      return <>{children}</>;
    }

    return (
      <OptimizedImage
        src={src}
        alt={alt}
        className={className}
        width={width}
        height={height}
        aspectRatio={aspectRatio}
        objectFit={objectFit}
      />
    );
  }

  // Render blurred/gated content
  return (
    <>
      <div
        className={cn(
          'relative overflow-hidden bg-muted',
          className
        )}
        style={{ aspectRatio }}
      >
        {/* Heavily blurred background image */}
        <div className="absolute inset-0">
          {thumbnailUrl || src ? (
            <img
              src={thumbnailUrl || src}
              alt=""
              className="w-full h-full object-cover blur-3xl scale-110 opacity-50"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          {isLoading ? (
            <div className="animate-pulse">
              <i className="fas fa-spinner fa-spin text-3xl text-white/50 mb-2"></i>
              <p className="text-white/50 text-sm">Checking verification...</p>
            </div>
          ) : (
            <>
              {/* Lock icon */}
              <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4">
                {blockInfo.type === 'login' ? (
                  <i className="fas fa-user-lock text-2xl text-white"></i>
                ) : blockInfo.type === 'age' ? (
                  <i className="fas fa-shield-alt text-2xl text-white"></i>
                ) : (
                  <i className="fas fa-user-check text-2xl text-white"></i>
                )}
              </div>

              {/* Status badge */}
              <Badge
                variant="outline"
                className="mb-3 bg-white/10 border-white/20 text-white"
              >
                {isVideo ? (
                  <><i className="fas fa-video mr-1"></i> Video</>
                ) : (
                  <><i className="fas fa-image mr-1"></i> Photo</>
                )}
                {isSensitive && (
                  <span className="ml-1 text-yellow-400">• Adult Content</span>
                )}
              </Badge>

              {/* Block reason */}
              <p className="text-white font-medium mb-2">{blockInfo.reason}</p>

              {/* Additional context */}
              {blockInfo.type === 'age' && (
                <p className="text-white/70 text-sm mb-4 max-w-xs">
                  This content requires age verification (18+) to view.
                  Verification is quick and secure through VerifyMy.
                </p>
              )}

              {blockInfo.type === 'creator' && (
                <p className="text-white/70 text-sm mb-4 max-w-xs">
                  This creator's content is temporarily unavailable pending
                  identity and 2257 compliance verification.
                </p>
              )}

              {blockInfo.type === 'login' && (
                <p className="text-white/70 text-sm mb-4 max-w-xs">
                  Create a free account to access content from verified creators.
                </p>
              )}

              {/* Action button */}
              {blockInfo.type !== 'creator' && (
                <Button
                  onClick={handleVerifyClick}
                  className="bg-white text-black hover:bg-white/90"
                >
                  {blockInfo.type === 'login' ? (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Log In / Sign Up
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check-circle mr-2"></i>
                      Verify Age
                    </>
                  )}
                </Button>
              )}

              {/* 18+ warning */}
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-center">
                <span className="text-white/50 text-xs">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  You must be 18+ to view this content
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <i className="fas fa-shield-alt text-primary"></i>
              Age Verification Required
            </DialogTitle>
            <DialogDescription>
              To access adult content, you must verify your age through our
              secure partner, VerifyMy.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Alert>
              <i className="fas fa-lock mr-2"></i>
              <AlertDescription>
                <strong>Privacy Protected:</strong> Your personal information is
                encrypted and never shared with creators or stored on our servers.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Verification Process:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500"></i>
                  Quick ID verification (under 2 minutes)
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500"></i>
                  No credit card required
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500"></i>
                  One-time verification for all platforms
                </li>
                <li className="flex items-center gap-2">
                  <i className="fas fa-check text-green-500"></i>
                  Compliant with all regulations
                </li>
              </ul>
            </div>

            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <img
                src="/verifymy-logo.png"
                alt="VerifyMy"
                className="h-8"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <span className="text-sm">
                Powered by <strong>VerifyMy</strong> - Trusted Age Verification
              </span>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleStartVerification}>
              <i className="fas fa-external-link-alt mr-2"></i>
              Start Verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const VerifiedMediaGate = memo(VerifiedMediaGateComponent);

/**
 * HOC to wrap any media component with verification gate
 */
export function withVerificationGate<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  getCreatorId: (props: P) => string
) {
  return function VerifiedComponent(props: P & { isSensitive?: boolean }) {
    const creatorId = getCreatorId(props);
    const { isVerified } = useViewerVerification();
    const { isCreatorVerified } = useCreatorVerification(creatorId);

    if (isVerified && isCreatorVerified) {
      return <WrappedComponent {...props} />;
    }

    return (
      <VerifiedMediaGate
        src=""
        alt=""
        creatorId={creatorId}
        isSensitive={props.isSensitive}
      >
        <WrappedComponent {...props} />
      </VerifiedMediaGate>
    );
  };
}

/**
 * Simple hook to check if current user can view adult content
 */
export function useCanViewAdultContent(creatorId: string) {
  const { isVerified: viewerVerified, isLoading: viewerLoading, isLoggedIn } = useViewerVerification();
  const { isCreatorVerified, isLoading: creatorLoading } = useCreatorVerification(creatorId);

  return {
    canView: isLoggedIn && viewerVerified && isCreatorVerified,
    isLoading: viewerLoading || creatorLoading,
    isLoggedIn,
    viewerVerified,
    creatorVerified: isCreatorVerified,
  };
}

export default VerifiedMediaGate;
