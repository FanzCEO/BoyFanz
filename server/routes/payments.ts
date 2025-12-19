/**
 * Triple-A Payment Routes
 *
 * API endpoints for crypto payments via Triple-A.io
 */

import { Router, Request, Response } from 'express';
import {
  createTripleAService,
  getTripleACryptoAccounts,
  getEnabledCryptos,
  getEnabledCryptosByNetwork,
  getCryptoInfo,
  SUPPORTED_CRYPTO,
} from '../services/triplea';
import { db } from '../db';
import { payments, subscriptions, users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

const router = Router();

// Initialize Triple-A service
const getTripleA = () => {
  try {
    return createTripleAService();
  } catch (error) {
    console.error('Triple-A not configured:', error);
    return null;
  }
};

/**
 * Check if Triple-A is enabled and list supported currencies
 */
router.get('/crypto/status', async (req: Request, res: Response) => {
  const triplea = getTripleA();
  const enabledCryptos = getEnabledCryptos();
  const cryptosByNetwork = getEnabledCryptosByNetwork();

  res.json({
    enabled: !!triplea,
    // List of all enabled cryptocurrencies with details
    enabledCurrencies: enabledCryptos,
    // Grouped by network for UI display
    currenciesByNetwork: cryptosByNetwork,
    // Legacy format for backwards compatibility
    supportedCurrencies: enabledCryptos.reduce((acc, crypto) => {
      acc[crypto.id] = true;
      return acc;
    }, {} as Record<string, boolean>),
    // All supported currencies (for reference)
    allSupportedCurrencies: Object.keys(SUPPORTED_CRYPTO),
  });
});

/**
 * Create a crypto payment
 */
router.post('/crypto/create', async (req: Request, res: Response) => {
  try {
    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    const {
      amount,
      currency = 'USD',
      cryptoCurrency,
      userId,
      userEmail,
      userName,
      description,
      metadata,
      subscriptionId,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const accounts = getTripleACryptoAccounts();
    const baseUrl = process.env.APP_URL || `https://${req.get('host')}`;

    // Create payment reference for tracking
    const internalRef = `PAY_${nanoid(12)}`;

    // Determine which endpoint to use based on crypto currency
    let payment;
    const paymentRequest = {
      type: 'triplea' as const,
      orderAmount: amount,
      orderCurrency: currency,
      payerId: userId,
      payerName: userName,
      payerEmail: userEmail,
      successUrl: `${baseUrl}/payment/success?ref=${internalRef}`,
      cancelUrl: `${baseUrl}/payment/cancel?ref=${internalRef}`,
      notifyUrl: `${baseUrl}/api/payments/crypto/webhook`,
      notifySecret: process.env.TRIPLEA_WEBHOOK_SECRET || 'fanz_webhook_secret',
      webhookData: {
        internal_ref: internalRef,
        user_id: userId,
        subscription_id: subscriptionId,
        description,
        ...metadata,
      },
    };

    // Check if a specific crypto was requested and if we have an account for it
    if (cryptoCurrency && accounts[cryptoCurrency]) {
      // Use specific crypto account (USDT_TRC20, USDC_ARB, BTC, SOL, etc.)
      payment = await triplea.createPaymentWithAccount(accounts[cryptoCurrency]!, paymentRequest);
    } else {
      // Default: let user choose crypto on Triple-A hosted page
      payment = await triplea.createPayment(paymentRequest);
    }

    // Store payment record in database
    await db.insert(payments).values({
      id: internalRef,
      userId,
      amount: amount.toString(),
      currency,
      status: 'pending',
      provider: 'triplea',
      providerPaymentId: payment.paymentReference,
      metadata: JSON.stringify({
        accessToken: payment.accessToken,
        cryptoCurrency,
        subscriptionId,
        description,
        ...metadata,
      }),
      createdAt: new Date(),
    });

    res.json({
      success: true,
      paymentId: internalRef,
      paymentReference: payment.paymentReference,
      hostedUrl: payment.hostedUrl,
      expiryDate: payment.expiryDate,
    });
  } catch (error: any) {
    console.error('Create crypto payment error:', error);
    res.status(500).json({ error: error.message || 'Payment creation failed' });
  }
});

/**
 * Get payment status
 */
router.get('/crypto/:paymentId', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    // Get payment from database
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const triplea = getTripleA();
    if (!triplea || !payment.providerPaymentId) {
      return res.json({
        paymentId: payment.id,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
      });
    }

    // Get live status from Triple-A
    const metadata = payment.metadata ? JSON.parse(payment.metadata as string) : {};
    const status = await triplea.getPaymentStatus(
      payment.providerPaymentId,
      metadata.accessToken
    );

    // Update local status if changed
    if (status.status !== payment.status) {
      await db
        .update(payments)
        .set({ status: status.status, updatedAt: new Date() })
        .where(eq(payments.id, paymentId));
    }

    res.json({
      paymentId: payment.id,
      status: status.status,
      amount: payment.amount,
      currency: payment.currency,
      cryptoAmount: status.cryptoAmount,
      cryptoCurrency: status.cryptoCurrency,
      exchangeRate: status.exchangeRate,
      paidDate: status.paidDate,
      transactions: status.transactions,
    });
  } catch (error: any) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get payment status' });
  }
});

/**
 * Triple-A webhook handler
 */
router.post('/crypto/webhook', async (req: Request, res: Response) => {
  try {
    const triplea = getTripleA();
    const signature = req.headers['x-triplea-signature'] as string;
    const webhookSecret = process.env.TRIPLEA_WEBHOOK_SECRET || 'fanz_webhook_secret';

    // Verify webhook signature
    if (triplea && signature) {
      const rawBody = JSON.stringify(req.body);
      const isValid = triplea.verifyWebhookSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.warn('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    const {
      payment_reference,
      status,
      order_amount,
      order_currency,
      crypto_amount,
      crypto_currency,
      webhook_data,
    } = req.body;

    console.log('Triple-A webhook received:', {
      payment_reference,
      status,
      order_amount,
      webhook_data,
    });

    if (!webhook_data?.internal_ref) {
      console.warn('Webhook missing internal_ref');
      return res.status(400).json({ error: 'Missing internal reference' });
    }

    const internalRef = webhook_data.internal_ref;

    // Update payment status
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, internalRef))
      .limit(1);

    if (!payment) {
      console.warn('Payment not found:', internalRef);
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Update payment record
    const metadata = payment.metadata ? JSON.parse(payment.metadata as string) : {};
    await db
      .update(payments)
      .set({
        status,
        metadata: JSON.stringify({
          ...metadata,
          cryptoAmount: crypto_amount,
          cryptoCurrency: crypto_currency,
          lastWebhook: new Date().toISOString(),
        }),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, internalRef));

    // Handle successful payment
    if (status === 'paid') {
      // If this is a subscription payment, activate the subscription
      if (webhook_data.subscription_id) {
        await db
          .update(subscriptions)
          .set({
            status: 'active',
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.id, webhook_data.subscription_id));
      }

      // Add credits to user if applicable
      if (webhook_data.credits) {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, payment.userId))
          .limit(1);

        if (user) {
          const currentCredits = Number(user.credits) || 0;
          await db
            .update(users)
            .set({
              credits: (currentCredits + Number(webhook_data.credits)).toString(),
            })
            .where(eq(users.id, payment.userId));
        }
      }
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message || 'Webhook processing failed' });
  }
});

/**
 * Get exchange rates
 */
router.get('/crypto/rates', async (req: Request, res: Response) => {
  try {
    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    const accounts = getTripleACryptoAccounts();
    const { currency = 'USD' } = req.query;

    const rates: Record<string, any> = {};

    if (accounts.USDC_ARB) {
      try {
        rates.USDC = await triplea.getExchangeRate(accounts.USDC_ARB, 'USDC', currency as string);
      } catch (e) {
        console.error('Failed to get USDC rate:', e);
      }
    }

    if (accounts.USDT_ARB) {
      try {
        rates.USDT = await triplea.getExchangeRate(accounts.USDT_ARB, 'USDT', currency as string);
      } catch (e) {
        console.error('Failed to get USDT rate:', e);
      }
    }

    if (accounts.testBTC) {
      try {
        rates.BTC = await triplea.getExchangeRate(accounts.testBTC, 'BTC', currency as string);
      } catch (e) {
        console.error('Failed to get BTC rate:', e);
      }
    }

    res.json({ rates, baseCurrency: currency });
  } catch (error: any) {
    console.error('Get exchange rates error:', error);
    res.status(500).json({ error: error.message || 'Failed to get exchange rates' });
  }
});

/**
 * Get merchant balances (admin only)
 */
router.get('/crypto/balances', async (req: Request, res: Response) => {
  try {
    // TODO: Add admin authentication check
    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    const balances = await triplea.getBalances();
    res.json({ balances });
  } catch (error: any) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: error.message || 'Failed to get balances' });
  }
});

/**
 * Request a refund
 */
router.post('/crypto/:paymentId/refund', async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { amount, reason } = req.body;

    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    // Get payment from database
    const [payment] = await db
      .select()
      .from(payments)
      .where(eq(payments.id, paymentId))
      .limit(1);

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({ error: 'Can only refund paid payments' });
    }

    // Get user email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payment.userId))
      .limit(1);

    if (!user?.email) {
      return res.status(400).json({ error: 'User email not found' });
    }

    const refundAmount = amount || Number(payment.amount);

    const result = await triplea.createRefund({
      paymentReference: payment.providerPaymentId!,
      email: user.email,
      refundAmount,
      remarks: reason || 'Refund requested',
      notifyUrl: `${process.env.APP_URL}/api/payments/crypto/refund-webhook`,
    });

    // Update payment status
    await db
      .update(payments)
      .set({
        status: 'refunded',
        metadata: JSON.stringify({
          ...(payment.metadata ? JSON.parse(payment.metadata as string) : {}),
          refundReference: result.payoutReference,
          refundAmount,
          refundReason: reason,
        }),
        updatedAt: new Date(),
      })
      .where(eq(payments.id, paymentId));

    res.json({
      success: true,
      refundReference: result.payoutReference,
      refundAmount,
    });
  } catch (error: any) {
    console.error('Refund error:', error);
    res.status(500).json({ error: error.message || 'Refund failed' });
  }
});

/**
 * Create a payout/withdrawal (for creator payouts)
 */
router.post('/crypto/withdraw', async (req: Request, res: Response) => {
  try {
    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    const {
      userId,
      email,
      amount,
      currency = 'USD',
      cryptoCurrency = 'USDT',
      walletAddress,
      remarks,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    if (!email) {
      return res.status(400).json({ error: 'Email required' });
    }

    let result;
    if (walletAddress) {
      // Direct withdrawal to specific address
      result = await triplea.createDirectWithdraw({
        email,
        withdrawCurrency: currency,
        withdrawAmount: amount,
        cryptoCurrency,
        address: walletAddress,
        remarks: remarks || `Payout for user ${userId}`,
        notifyUrl: `${process.env.APP_URL}/api/payments/crypto/payout-webhook`,
        notifySecret: process.env.TRIPLEA_WEBHOOK_SECRET || 'fanz_webhook_secret',
      });
    } else {
      // Withdrawal where user provides address later
      result = await triplea.createWithdraw({
        email,
        withdrawCurrency: currency,
        withdrawAmount: amount,
        cryptoCurrency,
        remarks: remarks || `Payout for user ${userId}`,
        notifyUrl: `${process.env.APP_URL}/api/payments/crypto/payout-webhook`,
        notifySecret: process.env.TRIPLEA_WEBHOOK_SECRET || 'fanz_webhook_secret',
      });
    }

    res.json({
      success: true,
      payoutReference: result.payoutReference,
      amount,
      currency,
      cryptoCurrency,
    });
  } catch (error: any) {
    console.error('Withdrawal error:', error);
    res.status(500).json({ error: error.message || 'Withdrawal failed' });
  }
});

/**
 * Confirm a pending withdrawal
 */
router.post('/crypto/withdraw/:payoutRef/confirm', async (req: Request, res: Response) => {
  try {
    const { payoutRef } = req.params;

    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    await triplea.confirmDirectWithdraw(payoutRef);
    res.json({ success: true, status: 'confirmed' });
  } catch (error: any) {
    console.error('Confirm withdrawal error:', error);
    res.status(500).json({ error: error.message || 'Confirmation failed' });
  }
});

/**
 * Cancel a pending withdrawal
 */
router.post('/crypto/withdraw/:payoutRef/cancel', async (req: Request, res: Response) => {
  try {
    const { payoutRef } = req.params;

    const triplea = getTripleA();
    if (!triplea) {
      return res.status(503).json({ error: 'Crypto payments not configured' });
    }

    await triplea.cancelDirectWithdraw(payoutRef);
    res.json({ success: true, status: 'cancelled' });
  } catch (error: any) {
    console.error('Cancel withdrawal error:', error);
    res.status(500).json({ error: error.message || 'Cancellation failed' });
  }
});

export default router;
