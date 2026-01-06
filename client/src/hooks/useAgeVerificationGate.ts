/**
 * Age Verification Gate Hook
 * Use this to gate subscribe/purchase actions behind age verification
 *
 * Example usage:
 * const { checkAgeVerification, AgeGateModal } = useAgeVerificationGate();
 *
 * const handleSubscribe = async () => {
 *   const verified = await checkAgeVerification();
 *   if (verified) {
 *     // Proceed with subscription
 *   }
 * };
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgeVerificationModal } from '../components/verification/AgeVerificationModal';

export function useAgeVerificationGate() {
  const [showModal, setShowModal] = useState(false);
  const [resolvePromise, setResolvePromise] = useState<((verified: boolean) => void) | null>(null);

  const { data: status } = useQuery({
    queryKey: ['/api/verification/status'],
    staleTime: 60000,
  });

  /**
   * Check if user is age verified, show modal if not
   * Returns a promise that resolves when verification is complete or user dismisses
   */
  const checkAgeVerification = useCallback((): Promise<boolean> => {
    // Already verified
    if (status?.ageVerified) {
      return Promise.resolve(true);
    }

    // Show modal and return promise
    return new Promise((resolve) => {
      setResolvePromise(() => resolve);
      setShowModal(true);
    });
  }, [status?.ageVerified]);

  const handleSuccess = useCallback(() => {
    setShowModal(false);
    if (resolvePromise) {
      resolvePromise(true);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const handleClose = useCallback(() => {
    setShowModal(false);
    if (resolvePromise) {
      resolvePromise(false);
      setResolvePromise(null);
    }
  }, [resolvePromise]);

  const AgeGateModal = useCallback(() => (
    <AgeVerificationModal
      isOpen={showModal}
      onClose={handleClose}
      onSuccess={handleSuccess}
    />
  ), [showModal, handleClose, handleSuccess]);

  return {
    checkAgeVerification,
    AgeGateModal,
    isVerified: status?.ageVerified || false,
  };
}
