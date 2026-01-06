/**
 * Triple-A.io Payment Gateway Service
 *
 * Comprehensive crypto payment integration supporting:
 * - Payment creation (hosted page & widget)
 * - Payment status checking
 * - Refunds (local currency)
 * - Withdrawals (local to crypto)
 * - Exchange rates
 * - Balance checking
 * - Webhook verification
 */

import crypto from 'crypto';

// Types
export interface TripleAConfig {
  clientId: string;
  clientSecret: string;  // API Key
  merchantKey: string;
  baseUrl?: string;
  sandbox?: boolean;
}

export interface PaymentRequest {
  type: 'triplea' | 'widget';
  orderAmount: number;
  orderCurrency?: string;
  payerId: string;
  payerName?: string;
  payerEmail?: string;
  successUrl?: string;
  cancelUrl?: string;
  notifyUrl?: string;
  notifySecret?: string;
  webhookData?: Record<string, any>;
  cart?: CartItem[];
  cryptoCurrency?: string;  // For direct account payments: USDC_ARB, USDT_ARB, testBTC
}

export interface CartItem {
  amount: number;
  quantity: number;
  label: string;
  sku?: string;
}

export interface PaymentResponse {
  paymentReference: string;
  accessToken: string;
  hostedUrl?: string;
  expiryDate?: string;
  status?: string;
}

export interface PaymentStatus {
  paymentReference: string;
  status: 'new' | 'pending' | 'hold' | 'paid' | 'expired' | 'cancelled' | 'refunded';
  orderAmount: number;
  orderCurrency: string;
  cryptoAmount?: number;
  cryptoCurrency?: string;
  exchangeRate?: number;
  paidDate?: string;
  transactions?: Transaction[];
}

export interface Transaction {
  txHash: string;
  cryptoAmount: number;
  status: string;
  confirmations: number;
}

export interface RefundRequest {
  paymentReference: string;
  email: string;
  refundAmount: number;
  remarks?: string;
  notifyUrl?: string;
}

export interface WithdrawRequest {
  email: string;
  withdrawCurrency: string;
  withdrawAmount: number;
  cryptoCurrency: string;
  address?: string;  // For direct withdrawals
  remarks?: string;
  notifyUrl?: string;
  notifySecret?: string;
}

export interface Balance {
  merchantKey: string;
  currency: string;
  available: number;
  pending: number;
}

export interface ExchangeRate {
  cryptoCurrency: string;
  localCurrency: string;
  rate: number;
  timestamp: string;
}

export interface WebhookPayload {
  payment_reference: string;
  status: string;
  order_amount: number;
  order_currency: string;
  crypto_amount?: number;
  crypto_currency?: string;
  webhook_data?: Record<string, any>;
  signature?: string;
}

/**
 * Triple-A Payment Service
 */
export class TripleAService {
  private config: TripleAConfig;
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(config: TripleAConfig) {
    this.config = {
      baseUrl: 'https://api.triple-a.io',
      sandbox: false,
      ...config,
    };
  }

  /**
   * Get OAuth2 access token using client credentials
   */
  async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await fetch(`${this.config.baseUrl}/api/v2/oauth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A auth failed: ${error}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Token typically expires in 1 hour, refresh 5 min early
    this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

    return this.accessToken!;
  }

  /**
   * Create a payment (hosted page or widget)
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    const token = await this.getAccessToken();

    const body: Record<string, any> = {
      type: request.type,
      merchant_key: this.config.merchantKey,
      order_currency: request.orderCurrency || 'USD',
      order_amount: request.orderAmount,
      payer_id: request.payerId,
      sandbox: this.config.sandbox,
    };

    if (request.payerName) body.payer_name = request.payerName;
    if (request.payerEmail) body.payer_email = request.payerEmail;
    if (request.successUrl) body.success_url = request.successUrl;
    if (request.cancelUrl) body.cancel_url = request.cancelUrl;
    if (request.notifyUrl) body.notify_url = request.notifyUrl;
    if (request.notifySecret) body.notify_secret = request.notifySecret;
    if (request.webhookData) body.webhook_data = request.webhookData;
    body.notify_txs = true;

    if (request.cart && request.cart.length > 0) {
      body.cart = {
        items: request.cart.map(item => ({
          amount: item.amount,
          quantity: item.quantity,
          label: item.label,
          sku: item.sku,
        })),
      };
    }

    const response = await fetch(`${this.config.baseUrl}/api/v2/payment`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A payment creation failed: ${error}`);
    }

    const data = await response.json();
    return {
      paymentReference: data.payment_reference,
      accessToken: data.access_token,
      hostedUrl: data.hosted_url,
      expiryDate: data.expiry_date,
      status: data.status,
    };
  }

  /**
   * Create a payment with a specific crypto account (USDC, USDT, BTC)
   */
  async createPaymentWithAccount(
    accountId: string,
    request: PaymentRequest
  ): Promise<PaymentResponse> {
    const token = await this.getAccessToken();

    const body: Record<string, any> = {
      type: request.type,
      order_currency: request.orderCurrency || 'USD',
      order_amount: request.orderAmount,
      payer_id: request.payerId,
    };

    if (request.payerName) body.payer_name = request.payerName;
    if (request.payerEmail) body.payer_email = request.payerEmail;
    if (request.successUrl) body.success_url = request.successUrl;
    if (request.cancelUrl) body.cancel_url = request.cancelUrl;
    if (request.notifyUrl) body.notify_url = request.notifyUrl;
    if (request.notifySecret) body.notify_secret = request.notifySecret;
    if (request.webhookData) body.webhook_data = request.webhookData;
    body.notify_txs = true;

    if (request.cart && request.cart.length > 0) {
      body.cart = {
        items: request.cart.map(item => ({
          amount: item.amount,
          quantity: item.quantity,
          label: item.label,
          sku: item.sku,
        })),
      };
    }

    const response = await fetch(
      `${this.config.baseUrl}/api/v2/payment/account/${accountId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A payment creation failed: ${error}`);
    }

    const data = await response.json();
    return {
      paymentReference: data.payment_reference,
      accessToken: data.access_token,
      hostedUrl: data.hosted_url,
      expiryDate: data.expiry_date,
      status: data.status,
    };
  }

  /**
   * Get payment status and details
   */
  async getPaymentStatus(
    paymentReference: string,
    paymentToken: string,
    verbose: boolean = true
  ): Promise<PaymentStatus> {
    const url = new URL(
      `${this.config.baseUrl}/api/v2/payment/${paymentReference}`
    );
    if (verbose) url.searchParams.set('verbose', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${paymentToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A payment status failed: ${error}`);
    }

    const data = await response.json();
    return {
      paymentReference: data.payment_reference,
      status: data.status,
      orderAmount: data.order_amount,
      orderCurrency: data.order_currency,
      cryptoAmount: data.crypto_amount,
      cryptoCurrency: data.crypto_currency,
      exchangeRate: data.exchange_rate,
      paidDate: data.paid_date,
      transactions: data.transactions?.map((tx: any) => ({
        txHash: tx.tx_hash,
        cryptoAmount: tx.crypto_amount,
        status: tx.status,
        confirmations: tx.confirmations,
      })),
    };
  }

  /**
   * Get account balances
   */
  async getBalances(): Promise<Balance[]> {
    const token = await this.getAccessToken();

    const response = await fetch(`${this.config.baseUrl}/api/v1/payout/balances`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A balances failed: ${error}`);
    }

    const data = await response.json();
    return data.map((b: any) => ({
      merchantKey: b.merchant_key,
      currency: b.currency,
      available: b.available,
      pending: b.pending,
    }));
  }

  /**
   * Create a refund (local currency)
   */
  async createRefund(request: RefundRequest): Promise<{ payoutReference: string }> {
    const token = await this.getAccessToken();

    const body: Record<string, any> = {
      payment_reference: request.paymentReference,
      email: request.email,
      refund_amount: request.refundAmount,
    };

    if (request.remarks) body.remarks = request.remarks;
    if (request.notifyUrl) body.notify_url = request.notifyUrl;

    const response = await fetch(`${this.config.baseUrl}/api/v1/payout/refund/local`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A refund failed: ${error}`);
    }

    const data = await response.json();
    return { payoutReference: data.payout_reference };
  }

  /**
   * Get refund details
   */
  async getRefundDetails(payoutReference: string): Promise<any> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.config.baseUrl}/api/v1/payout/refund/${payoutReference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A refund details failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Create a withdrawal (local to crypto)
   */
  async createWithdraw(request: WithdrawRequest): Promise<{ payoutReference: string }> {
    const token = await this.getAccessToken();

    const body: Record<string, any> = {
      merchant_key: this.config.merchantKey,
      email: request.email,
      withdraw_currency: request.withdrawCurrency,
      withdraw_amount: request.withdrawAmount,
      crypto_currency: request.cryptoCurrency,
    };

    if (request.remarks) body.remarks = request.remarks;
    if (request.notifyUrl) body.notify_url = request.notifyUrl;
    if (request.notifySecret) body.notify_secret = request.notifySecret;

    const response = await fetch(
      `${this.config.baseUrl}/api/v1/payout/withdraw/local/crypto`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A withdraw failed: ${error}`);
    }

    const data = await response.json();
    return { payoutReference: data.payout_reference };
  }

  /**
   * Create a direct withdrawal to a specific crypto address
   */
  async createDirectWithdraw(
    request: WithdrawRequest & { address: string }
  ): Promise<{ payoutReference: string }> {
    const token = await this.getAccessToken();

    const body: Record<string, any> = {
      merchant_key: this.config.merchantKey,
      email: request.email,
      withdraw_currency: request.withdrawCurrency,
      withdraw_amount: request.withdrawAmount,
      crypto_currency: request.cryptoCurrency,
      address: request.address,
    };

    if (request.remarks) body.remarks = request.remarks;
    if (request.notifyUrl) body.notify_url = request.notifyUrl;
    if (request.notifySecret) body.notify_secret = request.notifySecret;

    const response = await fetch(
      `${this.config.baseUrl}/api/v2/payout/withdraw/local/crypto/direct`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A direct withdraw failed: ${error}`);
    }

    const data = await response.json();
    return { payoutReference: data.payout_reference };
  }

  /**
   * Confirm a direct withdrawal
   */
  async confirmDirectWithdraw(payoutReference: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.config.baseUrl}/api/v2/payout/withdraw/${payoutReference}/local/crypto/confirm`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A confirm withdraw failed: ${error}`);
    }
  }

  /**
   * Cancel a direct withdrawal
   */
  async cancelDirectWithdraw(payoutReference: string): Promise<void> {
    const token = await this.getAccessToken();

    const response = await fetch(
      `${this.config.baseUrl}/api/v2/payout/withdraw/${payoutReference}/local/crypto/cancel`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A cancel withdraw failed: ${error}`);
    }
  }

  /**
   * Get exchange rate
   */
  async getExchangeRate(
    accountId: string,
    cryptoCurrency: string,
    localCurrency: string
  ): Promise<ExchangeRate> {
    const response = await fetch(
      `${this.config.baseUrl}/api/v1/exchange_rate/${accountId}/${cryptoCurrency}/${localCurrency}`,
      { method: 'GET' }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Triple-A exchange rate failed: ${error}`);
    }

    const data = await response.json();
    return {
      cryptoCurrency,
      localCurrency,
      rate: data.rate,
      timestamp: data.timestamp,
    };
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Parse and validate webhook payload
   */
  parseWebhook(
    body: string,
    signature: string,
    secret: string
  ): WebhookPayload | null {
    if (!this.verifyWebhookSignature(body, signature, secret)) {
      return null;
    }

    try {
      return JSON.parse(body);
    } catch {
      return null;
    }
  }
}

/**
 * Create Triple-A service from environment variables
 */
export function createTripleAService(): TripleAService {
  const clientId = process.env.TRIPLEA_CLIENT_ID;
  const clientSecret = process.env.TRIPLEA_API_KEY;
  const merchantKey = process.env.TRIPLEA_MERCHANT_KEY;

  if (!clientId || !clientSecret || !merchantKey) {
    throw new Error('Missing Triple-A configuration in environment variables');
  }

  return new TripleAService({
    clientId,
    clientSecret,
    merchantKey,
    sandbox: process.env.TRIPLEA_SANDBOX === 'true',
  });
}

/**
 * Supported Cryptocurrency Networks and Tokens
 * Triple-A supports multiple networks and tokens for payments
 */
export const SUPPORTED_CRYPTO = {
  // Bitcoin
  BTC: { name: 'Bitcoin', network: 'Bitcoin', symbol: 'BTC', decimals: 8 },

  // Ethereum Network
  ETH: { name: 'Ethereum', network: 'Ethereum', symbol: 'ETH', decimals: 18 },
  USDT_ETH: { name: 'Tether (ERC-20)', network: 'Ethereum', symbol: 'USDT', decimals: 6 },
  USDC_ETH: { name: 'USD Coin (ERC-20)', network: 'Ethereum', symbol: 'USDC', decimals: 6 },
  DAI: { name: 'Dai', network: 'Ethereum', symbol: 'DAI', decimals: 18 },

  // Arbitrum Network (Layer 2)
  USDC_ARB: { name: 'USD Coin (Arbitrum)', network: 'Arbitrum', symbol: 'USDC', decimals: 6 },
  USDT_ARB: { name: 'Tether (Arbitrum)', network: 'Arbitrum', symbol: 'USDT', decimals: 6 },
  ETH_ARB: { name: 'Ethereum (Arbitrum)', network: 'Arbitrum', symbol: 'ETH', decimals: 18 },

  // TRON Network (TRC-20) - Very popular, low fees
  TRX: { name: 'TRON', network: 'TRON', symbol: 'TRX', decimals: 6 },
  USDT_TRC20: { name: 'Tether (TRC-20)', network: 'TRON', symbol: 'USDT', decimals: 6 },
  USDC_TRC20: { name: 'USD Coin (TRC-20)', network: 'TRON', symbol: 'USDC', decimals: 6 },

  // Polygon Network (MATIC) - Low fees
  MATIC: { name: 'Polygon', network: 'Polygon', symbol: 'MATIC', decimals: 18 },
  USDT_POLYGON: { name: 'Tether (Polygon)', network: 'Polygon', symbol: 'USDT', decimals: 6 },
  USDC_POLYGON: { name: 'USD Coin (Polygon)', network: 'Polygon', symbol: 'USDC', decimals: 6 },

  // Solana Network - Fast & cheap
  SOL: { name: 'Solana', network: 'Solana', symbol: 'SOL', decimals: 9 },
  USDT_SOL: { name: 'Tether (Solana)', network: 'Solana', symbol: 'USDT', decimals: 6 },
  USDC_SOL: { name: 'USD Coin (Solana)', network: 'Solana', symbol: 'USDC', decimals: 6 },

  // BNB Smart Chain (BSC)
  BNB: { name: 'BNB', network: 'BSC', symbol: 'BNB', decimals: 18 },
  USDT_BSC: { name: 'Tether (BSC)', network: 'BSC', symbol: 'USDT', decimals: 18 },
  USDC_BSC: { name: 'USD Coin (BSC)', network: 'BSC', symbol: 'USDC', decimals: 18 },
  BUSD: { name: 'Binance USD', network: 'BSC', symbol: 'BUSD', decimals: 18 },

  // Litecoin
  LTC: { name: 'Litecoin', network: 'Litecoin', symbol: 'LTC', decimals: 8 },

  // Bitcoin Cash
  BCH: { name: 'Bitcoin Cash', network: 'Bitcoin Cash', symbol: 'BCH', decimals: 8 },

  // Dogecoin
  DOGE: { name: 'Dogecoin', network: 'Dogecoin', symbol: 'DOGE', decimals: 8 },

  // XRP (Ripple)
  XRP: { name: 'XRP', network: 'XRP Ledger', symbol: 'XRP', decimals: 6 },

  // Avalanche
  AVAX: { name: 'Avalanche', network: 'Avalanche', symbol: 'AVAX', decimals: 18 },
  USDT_AVAX: { name: 'Tether (Avalanche)', network: 'Avalanche', symbol: 'USDT', decimals: 6 },
  USDC_AVAX: { name: 'USD Coin (Avalanche)', network: 'Avalanche', symbol: 'USDC', decimals: 6 },

  // Test currencies
  testBTC: { name: 'Test Bitcoin', network: 'Bitcoin Testnet', symbol: 'tBTC', decimals: 8 },
  testETH: { name: 'Test Ethereum', network: 'Ethereum Testnet', symbol: 'tETH', decimals: 18 },
} as const;

export type CryptoCurrency = keyof typeof SUPPORTED_CRYPTO;

/**
 * Get crypto account IDs from environment
 * Supports all major cryptocurrencies
 */
export function getTripleACryptoAccounts(): Record<string, string | undefined> {
  return {
    // Bitcoin
    BTC: process.env.TRIPLEA_BTC_ID,
    testBTC: process.env.TRIPLEA_TEST_BTC_ID,

    // Ethereum Network
    ETH: process.env.TRIPLEA_ETH_ID,
    USDT_ETH: process.env.TRIPLEA_USDT_ETH_ID,
    USDC_ETH: process.env.TRIPLEA_USDC_ETH_ID,
    DAI: process.env.TRIPLEA_DAI_ID,

    // Arbitrum (Layer 2)
    USDC_ARB: process.env.TRIPLEA_USDC_ARB_ID,
    USDT_ARB: process.env.TRIPLEA_USDT_ARB_ID,
    ETH_ARB: process.env.TRIPLEA_ETH_ARB_ID,

    // TRON Network (TRC-20) - Very popular for USDT
    TRX: process.env.TRIPLEA_TRX_ID,
    USDT_TRC20: process.env.TRIPLEA_USDT_TRC20_ID,
    USDC_TRC20: process.env.TRIPLEA_USDC_TRC20_ID,

    // Polygon (MATIC)
    MATIC: process.env.TRIPLEA_MATIC_ID,
    USDT_POLYGON: process.env.TRIPLEA_USDT_POLYGON_ID,
    USDC_POLYGON: process.env.TRIPLEA_USDC_POLYGON_ID,

    // Solana
    SOL: process.env.TRIPLEA_SOL_ID,
    USDT_SOL: process.env.TRIPLEA_USDT_SOL_ID,
    USDC_SOL: process.env.TRIPLEA_USDC_SOL_ID,

    // BNB Smart Chain (BSC)
    BNB: process.env.TRIPLEA_BNB_ID,
    USDT_BSC: process.env.TRIPLEA_USDT_BSC_ID,
    USDC_BSC: process.env.TRIPLEA_USDC_BSC_ID,
    BUSD: process.env.TRIPLEA_BUSD_ID,

    // Other coins
    LTC: process.env.TRIPLEA_LTC_ID,
    BCH: process.env.TRIPLEA_BCH_ID,
    DOGE: process.env.TRIPLEA_DOGE_ID,
    XRP: process.env.TRIPLEA_XRP_ID,

    // Avalanche
    AVAX: process.env.TRIPLEA_AVAX_ID,
    USDT_AVAX: process.env.TRIPLEA_USDT_AVAX_ID,
    USDC_AVAX: process.env.TRIPLEA_USDC_AVAX_ID,
  };
}

/**
 * Get list of enabled crypto currencies (those with configured IDs)
 */
export function getEnabledCryptos(): Array<{
  id: string;
  accountId: string;
  name: string;
  network: string;
  symbol: string;
}> {
  const accounts = getTripleACryptoAccounts();
  const enabled: Array<{
    id: string;
    accountId: string;
    name: string;
    network: string;
    symbol: string;
  }> = [];

  for (const [id, accountId] of Object.entries(accounts)) {
    if (accountId && id in SUPPORTED_CRYPTO) {
      const crypto = SUPPORTED_CRYPTO[id as keyof typeof SUPPORTED_CRYPTO];
      enabled.push({
        id,
        accountId,
        name: crypto.name,
        network: crypto.network,
        symbol: crypto.symbol,
      });
    }
  }

  return enabled;
}

/**
 * Get crypto info by ID
 */
export function getCryptoInfo(cryptoId: string) {
  if (cryptoId in SUPPORTED_CRYPTO) {
    return SUPPORTED_CRYPTO[cryptoId as keyof typeof SUPPORTED_CRYPTO];
  }
  return null;
}

/**
 * Group enabled cryptos by network for UI display
 */
export function getEnabledCryptosByNetwork(): Record<string, Array<{
  id: string;
  accountId: string;
  name: string;
  symbol: string;
}>> {
  const enabled = getEnabledCryptos();
  const byNetwork: Record<string, Array<{
    id: string;
    accountId: string;
    name: string;
    symbol: string;
  }>> = {};

  for (const crypto of enabled) {
    if (!byNetwork[crypto.network]) {
      byNetwork[crypto.network] = [];
    }
    byNetwork[crypto.network].push({
      id: crypto.id,
      accountId: crypto.accountId,
      name: crypto.name,
      symbol: crypto.symbol,
    });
  }

  return byNetwork;
}

export default TripleAService;
