/**
 * Crypto Payment Button Component
 *
 * A reusable button for accepting crypto payments via Triple-A.io
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCryptoPayments, useCryptoPaymentStatus, useExchangeRates } from '@/hooks/use-crypto-payments';
import { Loader2, Bitcoin, DollarSign, CheckCircle, XCircle, Clock, Coins } from 'lucide-react';

interface CryptoPaymentButtonProps {
  amount: number;
  currency?: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  description?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
  onSuccess?: (paymentId: string) => void;
  onError?: (error: Error) => void;
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  disabled?: boolean;
}

// Network icons/colors for visual distinction
const networkColors: Record<string, string> = {
  'Bitcoin': 'text-orange-500',
  'Ethereum': 'text-blue-400',
  'TRON': 'text-red-500',
  'Solana': 'text-purple-500',
  'Polygon': 'text-violet-500',
  'BSC': 'text-yellow-500',
  'Arbitrum': 'text-blue-600',
  'Avalanche': 'text-red-600',
  'Litecoin': 'text-gray-400',
  'Dogecoin': 'text-yellow-400',
  'XRP Ledger': 'text-gray-600',
  'Bitcoin Cash': 'text-green-500',
};

const getCryptoIcon = (symbol: string) => {
  if (symbol === 'BTC' || symbol === 'tBTC') return <Bitcoin className="h-4 w-4" />;
  if (symbol === 'USDT' || symbol === 'USDC' || symbol === 'DAI' || symbol === 'BUSD') return <DollarSign className="h-4 w-4" />;
  return <Coins className="h-4 w-4" />;
};

const statusIcons: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="h-5 w-5 text-green-500" />,
  expired: <XCircle className="h-5 w-5 text-red-500" />,
  cancelled: <XCircle className="h-5 w-5 text-red-500" />,
  pending: <Clock className="h-5 w-5 text-yellow-500" />,
  new: <Clock className="h-5 w-5 text-blue-500" />,
};

export function CryptoPaymentButton({
  amount,
  currency = 'USD',
  userId,
  userEmail,
  userName,
  description,
  subscriptionId,
  metadata,
  onSuccess,
  onError,
  children,
  variant = 'default',
  size = 'default',
  className,
  disabled,
}: CryptoPaymentButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState<string>('');
  const [paymentStarted, setPaymentStarted] = useState(false);

  const { data: status, isLoading: statusLoading } = useCryptoPaymentStatus();
  const { data: rates } = useExchangeRates(currency);
  const {
    startPayment,
    isCreating,
    createError,
    currentPayment,
    clearCurrentPayment,
  } = useCryptoPayments();

  const handlePayment = async () => {
    try {
      setPaymentStarted(true);
      const result = await startPayment({
        amount,
        currency,
        cryptoCurrency: selectedCrypto || undefined,  // Any supported crypto
        userId,
        userEmail,
        userName,
        description,
        subscriptionId,
        metadata,
      });

      if (result.paymentId && onSuccess) {
        onSuccess(result.paymentId);
      }
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setPaymentStarted(false);
    setSelectedCrypto('');
    clearCurrentPayment();
  };

  // Get currencies grouped by network for organized display
  const currenciesByNetwork = status?.currenciesByNetwork || {};
  const enabledCurrencies = status?.enabledCurrencies || [];

  if (statusLoading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  if (!status?.enabled) {
    return null; // Don't show button if crypto not enabled
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          disabled={disabled}
        >
          {children || (
            <>
              <Bitcoin className="h-4 w-4 mr-2" />
              Pay with Crypto
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pay with Cryptocurrency</DialogTitle>
          <DialogDescription>
            {description || `Pay ${currency} ${amount.toFixed(2)} using crypto`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Amount Display */}
          <div className="text-center">
            <div className="text-3xl font-bold">
              {currency} {amount.toFixed(2)}
            </div>
            {selectedCrypto && rates?.rates[selectedCrypto] && (
              <div className="text-sm text-muted-foreground mt-1">
                ≈ {(amount / rates.rates[selectedCrypto].rate).toFixed(6)} {selectedCrypto}
              </div>
            )}
          </div>

          {/* Crypto Selection - Grouped by Network */}
          {!paymentStarted && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Cryptocurrency</label>
              <Select value={selectedCrypto} onValueChange={setSelectedCrypto}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a cryptocurrency" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-[300px]">
                    {/* Option to let user choose on Triple-A page */}
                    <SelectItem value="">
                      <span className="text-muted-foreground">Let me choose on payment page</span>
                    </SelectItem>

                    {/* Group by network */}
                    {Object.entries(currenciesByNetwork).map(([network, cryptos]) => (
                      <SelectGroup key={network}>
                        <SelectLabel className={`font-semibold ${networkColors[network] || ''}`}>
                          {network}
                        </SelectLabel>
                        {cryptos.map((crypto) => (
                          <SelectItem key={crypto.id} value={crypto.id}>
                            <div className="flex items-center gap-2">
                              {getCryptoIcon(crypto.symbol)}
                              <span>{crypto.name}</span>
                              <span className="text-muted-foreground text-xs">
                                ({crypto.symbol})
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>

              {/* Show selected crypto info */}
              {selectedCrypto && (
                <p className="text-xs text-muted-foreground">
                  {enabledCurrencies.find(c => c.id === selectedCrypto)?.name} on{' '}
                  {enabledCurrencies.find(c => c.id === selectedCrypto)?.network} network
                </p>
              )}
            </div>
          )}

          {/* Payment Status */}
          {currentPayment && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                {statusIcons[currentPayment.paymentId ? 'new' : 'pending']}
                <span className="font-medium">Payment Created</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete your payment in the popup window. The status will update automatically.
              </p>
              {currentPayment.hostedUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(currentPayment.hostedUrl, '_blank')}
                >
                  Open Payment Page
                </Button>
              )}
            </div>
          )}

          {/* Error Display */}
          {createError && (
            <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
              {createError.message}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleClose}>
              {currentPayment ? 'Close' : 'Cancel'}
            </Button>
            {!currentPayment && (
              <Button onClick={handlePayment} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating Payment...
                  </>
                ) : (
                  <>
                    <Bitcoin className="h-4 w-4 mr-2" />
                    Pay Now
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Simple inline crypto payment option
 */
export function CryptoPaymentOption({
  amount,
  currency = 'USD',
  onSelect,
}: {
  amount: number;
  currency?: string;
  onSelect: (crypto: string) => void;
}) {
  const { data: status } = useCryptoPaymentStatus();
  const { data: rates } = useExchangeRates(currency);

  if (!status?.enabled) return null;

  const availableCurrencies = Object.entries(status.supportedCurrencies || {})
    .filter(([_, available]) => available)
    .map(([currency]) => currency);

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Pay with Crypto</div>
      <div className="flex gap-2">
        {availableCurrencies.map((crypto) => (
          <Button
            key={crypto}
            variant="outline"
            size="sm"
            onClick={() => onSelect(crypto)}
            className="flex items-center gap-1"
          >
            {cryptoIcons[crypto]}
            <span>{crypto}</span>
            {rates?.rates[crypto] && (
              <span className="text-xs text-muted-foreground">
                ({(amount / rates.rates[crypto].rate).toFixed(4)})
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default CryptoPaymentButton;
