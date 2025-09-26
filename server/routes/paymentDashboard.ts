import { Router } from 'express';
import { z } from 'zod';
import { hostMerchantServices } from '../services/hostMerchantServices';
import { PaymentProcessingService } from '../services/paymentProcessingService';
import { storage } from '../storage';
import { requireAuth } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';

const router = Router();

// Initialize payment processing service
const paymentService = new PaymentProcessingService();

// ===== FANZ DASH PAYMENT CONTROL CENTER ROUTES =====

// All routes require admin authentication
router.use(requireAuth);
router.use((req, res, next) => {
  if ((req.user as any)?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// ===== SYSTEM HEALTH & OVERVIEW =====

// Get comprehensive payment system health
router.get('/health', async (req, res) => {
  try {
    const hmsHealth = await hostMerchantServices.getSystemHealth();
    const riskReport = await hostMerchantServices.generateRiskReport();
    
    // Get payment method statistics
    const availableCardMethods = paymentService.getAvailablePaymentMethods('USD').filter(p => p.type === 'card');
    const availableCryptoMethods = paymentService.getAvailablePaymentMethods('USD').filter(p => p.type === 'crypto');
    const availablePayoutMethods = paymentService.getAvailablePayoutMethods('USD');

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      hms: hmsHealth,
      gateways: {
        cardProcessors: availableCardMethods.length,
        cryptoGateways: availableCryptoMethods.length,
        payoutProviders: availablePayoutMethods.length,
        adultFriendly: availableCardMethods.filter(p => p.isAdultFriendly).length
      },
      risk: {
        avgRiskScore: riskReport.summary.avgRiskScore,
        highRiskMIDs: riskReport.highRiskMIDs.length,
        recentAlerts: riskReport.recentAlerts.length
      },
      recommendations: riskReport.recommendations
    });
  } catch (error) {
    console.error('Failed to get payment system health:', error);
    res.status(500).json({ message: 'Failed to retrieve system health' });
  }
});

// ===== GATEWAY MANAGEMENT =====

// Get all payment gateways with status
router.get('/gateways', async (req, res) => {
  try {
    const cardGateways = paymentService.getAvailablePaymentMethods('USD');
    const payoutProviders = paymentService.getAvailablePayoutMethods('USD');
    
    res.json({
      paymentGateways: cardGateways.map(gateway => ({
        name: gateway.name,
        type: gateway.type,
        isAdultFriendly: gateway.isAdultFriendly,
        supportedCurrencies: gateway.supportedCurrencies,
        processingFeeBps: gateway.processingFeeBps,
        status: 'active' // TODO: Get actual status from HMS
      })),
      payoutProviders: payoutProviders.map(provider => ({
        name: provider.name,
        type: provider.type,
        supportedCurrencies: provider.supportedCurrencies,
        supportedCountries: provider.supportedCountries,
        minimumPayoutCents: provider.minimumPayoutCents,
        processingFeeBps: provider.processingFeeBps
      }))
    });
  } catch (error) {
    console.error('Failed to get gateways:', error);
    res.status(500).json({ message: 'Failed to retrieve gateways' });
  }
});

// ===== MERCHANT ID MANAGEMENT =====

// Get all merchant accounts
router.get('/merchant-accounts', async (req, res) => {
  try {
    const accounts = await Promise.all([
      hostMerchantServices.getMerchantAccount('mid_ccbill_001'),
      hostMerchantServices.getMerchantAccount('mid_segpay_001'),
      hostMerchantServices.getMerchantAccount('mid_epoch_001')
    ]);

    const validAccounts = accounts.filter(account => account !== null);
    
    res.json({
      merchantAccounts: validAccounts.map(account => ({
        id: account!.id,
        gatewayId: account!.gatewayId,
        midIdentifier: account!.midIdentifier,
        descriptor: account!.descriptor,
        region: account!.region,
        currency: account!.currency,
        status: account!.status,
        monthlyVolumeUsage: account!.currentMonthVolume / account!.monthlyVolumeLimit,
        chargebackRate: account!.currentChargebackRate,
        chargebackThreshold: account!.chargebackThreshold,
        riskScore: account!.riskScore,
        lastChargebackDate: account!.lastChargebackDate
      }))
    });
  } catch (error) {
    console.error('Failed to get merchant accounts:', error);
    res.status(500).json({ message: 'Failed to retrieve merchant accounts' });
  }
});

// ===== CHARGEBACK MANAGEMENT =====

// Get chargeback alerts
router.get('/chargebacks', async (req, res) => {
  try {
    const { midId } = req.query;
    const alerts = await hostMerchantServices.getChargebackAlerts(midId as string);
    
    res.json({
      chargebacks: alerts.map(alert => ({
        id: alert.id,
        transactionId: alert.transactionId,
        midId: alert.midId,
        amount: alert.amount,
        currency: alert.currency,
        reason: alert.reason,
        reasonCode: alert.reasonCode,
        reasonDescription: alert.reasonDescription,
        dueDate: alert.dueDate,
        liabilityShift: alert.liabilityShift
      }))
    });
  } catch (error) {
    console.error('Failed to get chargebacks:', error);
    res.status(500).json({ message: 'Failed to retrieve chargebacks' });
  }
});

// Create test chargeback alert (for development)
const createChargebackSchema = z.object({
  transactionId: z.string(),
  midId: z.string(),
  amount: z.number().positive(),
  currency: z.string().length(3),
  reason: z.enum(['fraud', 'authorization', 'processing_error', 'consumer_dispute']),
  reasonCode: z.string(),
  reasonDescription: z.string()
});

router.post('/chargebacks', validateRequest({ body: createChargebackSchema }), async (req, res) => {
  try {
    const alertId = await hostMerchantServices.processChargebackAlert({
      ...req.body,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      liabilityShift: false
    });
    
    res.status(201).json({
      alertId,
      message: 'Chargeback alert created successfully'
    });
  } catch (error) {
    console.error('Failed to create chargeback alert:', error);
    res.status(500).json({ message: 'Failed to create chargeback alert' });
  }
});

// ===== RISK ASSESSMENT =====

// Assess transaction risk
const riskAssessmentSchema = z.object({
  amountCents: z.number().positive(),
  currency: z.string().length(3),
  userId: z.string(),
  userAgeDays: z.number().nonnegative(),
  userTransactionCount: z.number().nonnegative(),
  ipAddress: z.string(),
  country: z.string().length(2),
  billingCountry: z.string().length(2).optional(),
  cardCountry: z.string().length(2).optional(),
  vpnDetected: z.boolean().optional(),
  proxyDetected: z.boolean().optional()
});

router.post('/risk-assessment', validateRequest({ body: riskAssessmentSchema }), async (req, res) => {
  try {
    const assessment = await hostMerchantServices.assessTransactionRisk(req.body);
    
    res.json({
      riskAssessment: {
        riskScore: assessment.riskScore,
        riskLevel: assessment.riskLevel,
        action: assessment.action,
        factors: assessment.factors,
        reviewRequired: assessment.reviewRequired
      }
    });
  } catch (error) {
    console.error('Failed to assess risk:', error);
    res.status(500).json({ message: 'Failed to assess transaction risk' });
  }
});

// ===== PAYMENT ROUTING =====

// Get optimal payment route
const routingRequestSchema = z.object({
  amountCents: z.number().positive(),
  currency: z.string().length(3),
  region: z.string().length(2),
  riskScore: z.number().min(0).max(100).optional(),
  preferredGateways: z.array(z.string()).optional()
});

router.post('/routing/optimal', validateRequest({ body: routingRequestSchema }), async (req, res) => {
  try {
    const route = await hostMerchantServices.getOptimalPaymentRoute({
      ...req.body,
      riskScore: req.body.riskScore || 0
    });
    
    if (!route) {
      return res.status(404).json({
        message: 'No optimal payment route found',
        route: null
      });
    }
    
    res.json({
      route: {
        gatewayId: route.gatewayId,
        midId: route.midId,
        confidence: route.confidence
      }
    });
  } catch (error) {
    console.error('Failed to get optimal route:', error);
    res.status(500).json({ message: 'Failed to determine optimal route' });
  }
});

// ===== ANALYTICS & REPORTING =====

// Get payment analytics dashboard data
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    // Get recent transactions for analytics
    const auditLogs = await storage.getAuditLogs({
      limit: 1000,
      action: 'payment_processed'
    });
    
    const paymentLogs = auditLogs.filter(log => log.action === 'payment_processed');
    
    // Calculate basic analytics
    const totalTransactions = paymentLogs.length;
    const successfulTransactions = paymentLogs.filter(log => 
      log.diffJson && log.diffJson.status === 'completed'
    ).length;
    
    const totalVolume = paymentLogs.reduce((sum, log) => {
      return sum + (log.diffJson?.amountCents || 0);
    }, 0);
    
    const successRate = totalTransactions > 0 ? (successfulTransactions / totalTransactions) * 100 : 0;
    
    // Group by payment provider
    const providerStats = paymentLogs.reduce((stats: any, log) => {
      const provider = log.diffJson?.provider || 'unknown';
      if (!stats[provider]) {
        stats[provider] = {
          transactions: 0,
          volume: 0,
          successful: 0
        };
      }
      stats[provider].transactions++;
      stats[provider].volume += log.diffJson?.amountCents || 0;
      if (log.diffJson?.status === 'completed') {
        stats[provider].successful++;
      }
      return stats;
    }, {});
    
    res.json({
      analytics: {
        period,
        overview: {
          totalTransactions,
          successfulTransactions,
          totalVolumeCents: totalVolume,
          successRate: Math.round(successRate * 100) / 100,
          averageTransactionCents: totalTransactions > 0 ? Math.round(totalVolume / totalTransactions) : 0
        },
        providerBreakdown: Object.entries(providerStats).map(([provider, stats]: [string, any]) => ({
          provider,
          transactions: stats.transactions,
          volumeCents: stats.volume,
          successRate: Math.round((stats.successful / stats.transactions) * 10000) / 100
        })),
        hmsHealth: await hostMerchantServices.getSystemHealth()
      }
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ message: 'Failed to retrieve analytics' });
  }
});

// Get detailed risk report
router.get('/reports/risk', async (req, res) => {
  try {
    const report = await hostMerchantServices.generateRiskReport();
    res.json({ riskReport: report });
  } catch (error) {
    console.error('Failed to generate risk report:', error);
    res.status(500).json({ message: 'Failed to generate risk report' });
  }
});

// ===== PAYOUT MANAGEMENT =====

// Get creator payout accounts summary
router.get('/payouts/accounts', async (req, res) => {
  try {
    const availableProviders = paymentService.getAvailablePayoutMethods('USD');
    
    // Mock payout account data - in production, get from database
    const mockPayoutData = {
      totalCreators: 150,
      totalAccounts: 285,
      pendingVerifications: 23,
      recentPayouts: 47,
      totalPayoutVolume: 125000000, // $1.25M
      averagePayoutSize: 2659574 // $26,595.74
    };
    
    res.json({
      payoutAccounts: {
        ...mockPayoutData,
        providerDistribution: availableProviders.map(provider => ({
          provider: provider.name,
          accounts: Math.floor(Math.random() * 50) + 10,
          totalPayouts: Math.floor(Math.random() * 10000000) + 1000000
        }))
      }
    });
  } catch (error) {
    console.error('Failed to get payout accounts:', error);
    res.status(500).json({ message: 'Failed to retrieve payout accounts' });
  }
});

export default router;