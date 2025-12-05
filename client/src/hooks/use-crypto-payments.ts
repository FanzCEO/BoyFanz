/**
 * Triple-A Crypto Payments Hook
 *
 * React hook for integrating crypto payments via Triple-A.io
 */

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface EnabledCurrency {
  id: string;
  accountId: string;
  name: string;
  network: string;
  symbol: string;
}

interface CryptoPaymentStatus {
  enabled: boolean;
  // All enabled cryptocurrencies with full details
  enabledCurrencies: EnabledCurrency[];
  // Grouped by network for UI display
  currenciesByNetwork: Record<string, Array<{
    id: string;
    accountId: string;
    name: string;
    symbol: string;
  }>>;
  // Legacy format for backwards compatibility
  supportedCurrencies: Record<string, boolean>;
  // All possible currencies Triple-A can support
  allSupportedCurrencies: string[];
}

interface PaymentRequest {
  amount: number;
  currency?: string;
  cryptoCurrency?: string;  // Any supported crypto: USDT_TRC20, USDC_ARB, BTC, SOL, etc.
  userId: string;
  userEmail?: string;
  userName?: string;
  description?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  paymentId: string;
  paymentReference: string;
  hostedUrl?: string;
  expiryDate?: string;
}

interface PaymentDetails {
  paymentId: string;
  status: 'new' | 'pending' | 'hold' | 'paid' | 'expired' | 'cancelled' | 'refunded';
  amount: string;
  currency: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  exchangeRate?: number;
  paidDate?: string;
  transactions?: Array<{
    txHash: string;
    cryptoAmount: number;
    status: string;
    confirmations: number;
  }>;
}

interface ExchangeRates {
  rates: Record<string, {
    cryptoCurrency: string;
    localCurrency: string;
    rate: number;
    timestamp: string;
  }>;
  baseCurrency: string;
}

interface WithdrawRequest {
  userId: string;
  email: string;
  amount: number;
  currency?: string;
  cryptoCurrency?: string;
  walletAddress?: string;
  remarks?: string;
}

/**
 * Hook for checking crypto payment availability
 */
export function useCryptoPaymentStatus() {
  return useQuery<CryptoPaymentStatus>({
    queryKey: ['crypto-payment-status'],
    queryFn: async () => {
      const response = await fetch('/api/payments/crypto/status');
      if (!response.ok) throw new Error('Failed to get crypto status');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Hook for getting exchange rates
 */
export function useExchangeRates(currency: string = 'USD') {
  return useQuery<ExchangeRates>({
    queryKey: ['exchange-rates', currency],
    queryFn: async () => {
      const response = await fetch(`/api/payments/crypto/rates?currency=${currency}`);
      if (!response.ok) throw new Error('Failed to get exchange rates');
      return response.json();
    },
    staleTime: 60 * 1000, // Cache for 1 minute (rates change frequently)
    refetchInterval: 60 * 1000, // Refresh every minute
  });
}

/**
 * Hook for getting payment details
 */
export function usePaymentDetails(paymentId: string | null) {
  return useQuery<PaymentDetails>({
    queryKey: ['payment', paymentId],
    queryFn: async () => {
      if (!paymentId) throw new Error('Payment ID required');
      const response = await fetch(`/api/payments/crypto/${paymentId}`);
      if (!response.ok) throw new Error('Failed to get payment details');
      return response.json();
    },
    enabled: !!paymentId,
    refetchInterval: (data) => {
      // Poll more frequently for pending payments
      if (data?.status === 'pending' || data?.status === 'new') {
        return 5000; // 5 seconds
      }
      return false; // Stop polling for completed payments
    },
  });
}

/**
 * Main hook for crypto payments
 */
export function useCryptoPayments() {
  const queryClient = useQueryClient();
  const [currentPayment, setCurrentPayment] = useState<PaymentResponse | null>(null);

  // Create payment mutation
  const createPayment = useMutation({
    mutationFn: async (request: PaymentRequest): Promise<PaymentResponse> => {
      const response = await fetch('/api/payments/crypto/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment creation failed');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setCurrentPayment(data);
      queryClient.invalidateQueries({ queryKey: ['payment', data.paymentId] });
    },
  });

  // Refund mutation
  const refundPayment = useMutation({
    mutationFn: async ({ paymentId, amount, reason }: {
      paymentId: string;
      amount?: number;
      reason?: string;
    }) => {
      const response = await fetch(`/api/payments/crypto/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Refund failed');
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payment', variables.paymentId] });
    },
  });

  // Withdraw mutation (for creator payouts)
  const createWithdraw = useMutation({
    mutationFn: async (request: WithdrawRequest) => {
      const response = await fetch('/api/payments/crypto/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdrawal failed');
      }

      return response.json();
    },
  });

  // Open payment page in new window
  const openPaymentPage = useCallback((hostedUrl: string) => {
    window.open(hostedUrl, '_blank', 'width=600,height=800');
  }, []);

  // Start a payment flow
  const startPayment = useCallback(async (request: PaymentRequest) => {
    const result = await createPayment.mutateAsync(request);
    if (result.hostedUrl) {
      openPaymentPage(result.hostedUrl);
    }
    return result;
  }, [createPayment, openPaymentPage]);

  return {
    // State
    currentPayment,
    isCreating: createPayment.isPending,
    createError: createPayment.error,

    // Actions
    createPayment: createPayment.mutate,
    createPaymentAsync: createPayment.mutateAsync,
    startPayment,
    openPaymentPage,
    clearCurrentPayment: () => setCurrentPayment(null),

    // Refunds
    refundPayment: refundPayment.mutate,
    refundPaymentAsync: refundPayment.mutateAsync,
    isRefunding: refundPayment.isPending,

    // Withdrawals (creator payouts)
    createWithdraw: createWithdraw.mutate,
    createWithdrawAsync: createWithdraw.mutateAsync,
    isWithdrawing: createWithdraw.isPending,
  };
}

/**
 * Hook for subscription payments with crypto
 */
export function useSubscriptionPayment(creatorId: string, tierId: string) {
  const { startPayment, isCreating, currentPayment } = useCryptoPayments();
  const paymentDetails = usePaymentDetails(currentPayment?.paymentId || null);

  const subscribe = useCallback(async (
    userId: string,
    userEmail: string,
    amount: number,
    cryptoCurrency?: 'USDC' | 'USDT' | 'BTC'
  ) => {
    return startPayment({
      amount,
      userId,
      userEmail,
      cryptoCurrency,
      description: `Subscription to creator ${creatorId}`,
      metadata: {
        type: 'subscription',
        creatorId,
        tierId,
      },
    });
  }, [startPayment, creatorId, tierId]);

  return {
    subscribe,
    isProcessing: isCreating || paymentDetails.isLoading,
    paymentStatus: paymentDetails.data?.status,
    isPaid: paymentDetails.data?.status === 'paid',
    currentPayment,
    paymentDetails: paymentDetails.data,
  };
}

/**
 * Hook for tip/donation payments
 */
export function useTipPayment() {
  const { startPayment, isCreating, currentPayment } = useCryptoPayments();
  const paymentDetails = usePaymentDetails(currentPayment?.paymentId || null);

  const sendTip = useCallback(async (
    userId: string,
    userEmail: string,
    creatorId: string,
    amount: number,
    message?: string,
    cryptoCurrency?: 'USDC' | 'USDT' | 'BTC'
  ) => {
    return startPayment({
      amount,
      userId,
      userEmail,
      cryptoCurrency,
      description: `Tip for creator ${creatorId}`,
      metadata: {
        type: 'tip',
        creatorId,
        message,
      },
    });
  }, [startPayment]);

  return {
    sendTip,
    isProcessing: isCreating || paymentDetails.isLoading,
    paymentStatus: paymentDetails.data?.status,
    isPaid: paymentDetails.data?.status === 'paid',
    currentPayment,
  };
}

/**
 * Hook for buying credits/tokens
 */
export function useCreditPurchase() {
  const { startPayment, isCreating, currentPayment } = useCryptoPayments();
  const paymentDetails = usePaymentDetails(currentPayment?.paymentId || null);

  const buyCredits = useCallback(async (
    userId: string,
    userEmail: string,
    amount: number,
    credits: number,
    cryptoCurrency?: 'USDC' | 'USDT' | 'BTC'
  ) => {
    return startPayment({
      amount,
      userId,
      userEmail,
      cryptoCurrency,
      description: `Purchase ${credits} credits`,
      metadata: {
        type: 'credits',
        credits,
      },
    });
  }, [startPayment]);

  return {
    buyCredits,
    isProcessing: isCreating || paymentDetails.isLoading,
    paymentStatus: paymentDetails.data?.status,
    isPaid: paymentDetails.data?.status === 'paid',
    currentPayment,
  };
}

export default useCryptoPayments;
