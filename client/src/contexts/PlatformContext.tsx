import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FAN_PLATFORMS, type FanzPlatform } from '@/../../shared/fanzEcosystemRegistry';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlatformContextValue {
  currentPlatform: FanzPlatform;
  availablePlatforms: FanzPlatform[];
  switchPlatform: (platformId: string) => Promise<void>;
  isAdminOverride: boolean;
  clearOverride: () => Promise<void>;
  isLoading: boolean;
}

const PlatformContext = createContext<PlatformContextValue | undefined>(undefined);

interface PlatformProviderProps {
  children: ReactNode;
}

export function PlatformProvider({ children }: PlatformProviderProps) {
  const queryClient = useQueryClient();

  // Fetch current platform context from server
  const { data: platformData, isLoading } = useQuery({
    queryKey: ['/api/platform/current'],
    queryFn: () => apiRequest<{
      platform: FanzPlatform;
      isAdminOverride: boolean;
      availablePlatforms: FanzPlatform[];
    }>('GET', '/api/platform/current'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const currentPlatform = platformData?.platform || FAN_PLATFORMS.find(p => p.id === 'boyfanz')!;
  const isAdminOverride = platformData?.isAdminOverride || false;
  const availablePlatforms = platformData?.availablePlatforms || FAN_PLATFORMS.filter(p => p.status === 'active');

  // Switch platform mutation
  const switchMutation = useMutation({
    mutationFn: async (platformId: string) => {
      return apiRequest<{ success: boolean; redirectUrl: string }>(
        'POST',
        '/api/platform/switch',
        { body: { platformId } }
      );
    },
    onSuccess: (data) => {
      // Invalidate all queries
      queryClient.invalidateQueries();

      // Redirect to the new platform
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        window.location.reload();
      }
    },
  });

  // Clear admin override mutation
  const clearOverrideMutation = useMutation({
    mutationFn: async () => {
      return apiRequest<{ success: boolean }>('POST', '/api/platform/clear-override');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/platform/current'] });
      window.location.reload();
    },
  });

  const value: PlatformContextValue = {
    currentPlatform,
    availablePlatforms,
    switchPlatform: switchMutation.mutateAsync,
    isAdminOverride,
    clearOverride: clearOverrideMutation.mutateAsync,
    isLoading: isLoading || switchMutation.isPending || clearOverrideMutation.isPending,
  };

  return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within PlatformProvider');
  }
  return context;
}

// Utility hook for platform-specific features
export function usePlatformFeature(featureKey: string): boolean {
  const { currentPlatform } = usePlatform();
  return currentPlatform.features?.includes(featureKey) || false;
}

// Utility hook for platform branding
export function usePlatformBranding() {
  const { currentPlatform } = usePlatform();
  return {
    primaryColor: currentPlatform.primaryColor,
    secondaryColor: currentPlatform.secondaryColor,
    accentColor: currentPlatform.accentColor,
    backgroundColor: currentPlatform.backgroundColor,
    logoUrl: currentPlatform.logoUrl,
    name: currentPlatform.name,
    tagline: currentPlatform.tagline,
  };
}
