import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface AgeVerificationState {
  isVerified: boolean;
  isLoading: boolean;
  verificationMethod: 'verifymy' | 'self-declaration' | null;
  verifiedAt: Date | null;
}

interface AgeVerificationContextType extends AgeVerificationState {
  initiateVerification: () => Promise<void>;
  checkVerificationStatus: () => Promise<boolean>;
  setVerified: (method: 'verifymy' | 'self-declaration') => void;
  clearVerification: () => void;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

const AGE_VERIFICATION_KEY = 'boyfanz_age_verified';
const AGE_VERIFICATION_EXPIRY_DAYS = 30;

interface AgeVerificationProviderProps {
  children: ReactNode;
}

export function AgeVerificationProvider({ children }: AgeVerificationProviderProps) {
  const [state, setState] = useState<AgeVerificationState>({
    isVerified: false,
    isLoading: true,
    verificationMethod: null,
    verifiedAt: null,
  });

  // Check localStorage and session on mount
  useEffect(() => {
    const checkStoredVerification = async () => {
      try {
        // Check localStorage first
        const storedVerification = localStorage.getItem(AGE_VERIFICATION_KEY);

        if (storedVerification) {
          const parsed = JSON.parse(storedVerification);
          const verifiedAt = new Date(parsed.verifiedAt);
          const expiryDate = new Date(verifiedAt);
          expiryDate.setDate(expiryDate.getDate() + AGE_VERIFICATION_EXPIRY_DAYS);

          if (new Date() < expiryDate) {
            setState({
              isVerified: true,
              isLoading: false,
              verificationMethod: parsed.method,
              verifiedAt,
            });
            return;
          } else {
            // Expired, remove from storage
            localStorage.removeItem(AGE_VERIFICATION_KEY);
          }
        }

        // Check with server
        const response = await fetch('/api/verification/age-check', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.verified) {
            setState({
              isVerified: true,
              isLoading: false,
              verificationMethod: data.method || 'verifymy',
              verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
            });
            return;
          }
        }

        setState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error('Error checking age verification:', error);
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkStoredVerification();
  }, []);

  const initiateVerification = useCallback(async () => {
    try {
      const response = await fetch('/api/verification/age-initiate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.redirectUrl) {
          // Redirect to VerifyMy
          window.location.href = data.redirectUrl;
        }
      }
    } catch (error) {
      console.error('Error initiating age verification:', error);
    }
  }, []);

  const checkVerificationStatus = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/verification/age-check', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.verified) {
          setState({
            isVerified: true,
            isLoading: false,
            verificationMethod: data.method || 'verifymy',
            verifiedAt: data.verifiedAt ? new Date(data.verifiedAt) : new Date(),
          });

          // Store in localStorage
          localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify({
            method: data.method || 'verifymy',
            verifiedAt: new Date().toISOString(),
          }));

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  }, []);

  const setVerified = useCallback((method: 'verifymy' | 'self-declaration') => {
    const verifiedAt = new Date();

    setState({
      isVerified: true,
      isLoading: false,
      verificationMethod: method,
      verifiedAt,
    });

    localStorage.setItem(AGE_VERIFICATION_KEY, JSON.stringify({
      method,
      verifiedAt: verifiedAt.toISOString(),
    }));

    // Also notify server
    fetch('/api/verification/age-confirm', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ method }),
    }).catch(console.error);
  }, []);

  const clearVerification = useCallback(() => {
    localStorage.removeItem(AGE_VERIFICATION_KEY);
    setState({
      isVerified: false,
      isLoading: false,
      verificationMethod: null,
      verifiedAt: null,
    });
  }, []);

  return (
    <AgeVerificationContext.Provider
      value={{
        ...state,
        initiateVerification,
        checkVerificationStatus,
        setVerified,
        clearVerification,
      }}
    >
      {children}
    </AgeVerificationContext.Provider>
  );
}

export function useAgeVerification() {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
}

export default AgeVerificationContext;
