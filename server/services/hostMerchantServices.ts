import { storage } from '../storage';
import { logger } from '../logger';

// Host Merchant Services (HMS) Integration
// Provides MID management, risk monitoring, chargeback handling, and smart routing

export interface MerchantAccount {
  id: string;
  gatewayId: string;
  midIdentifier: string;
  descriptor: string;
  region: string;
  currency: string;
  status: 'active' | 'inactive' | 'suspended' | 'reviewing';
  monthlyVolumeLimit: number;
  currentMonthVolume: number;
  chargebackThreshold: number; // basis points
  currentChargebackRate: number; // basis points
  riskScore: number; // 0-100
  lastChargebackDate?: Date;
  configuration: any;
}

export interface ChargebackAlert {
  id: string;
  transactionId: string;
  midId: string;
  amount: number;
  currency: string;
  reason: 'fraud' | 'authorization' | 'processing_error' | 'consumer_dispute';
  reasonCode: string;
  reasonDescription: string;
  dueDate: Date;
  liabilityShift: boolean;
  evidence?: any;
}

export interface RiskAssessmentResult {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  action: 'approve' | 'review' | 'decline' | 'block';
  factors: string[];
  rules: any[];
  reviewRequired: boolean;
}

export interface MIDRecommendation {
  midId: string;
  gatewayId: string;
  confidence: number; // 0-1
  reason: string;
}

export class HostMerchantServices {
  private merchantAccounts: Map<string, MerchantAccount> = new Map();
  private chargebackAlerts: Map<string, ChargebackAlert> = new Map();
  private riskRules: any[] = [];

  constructor() {
    this.initializeRiskRules();
    this.loadMerchantAccounts();
  }

  // ===== MID MANAGEMENT =====

  async loadMerchantAccounts(): Promise<void> {
    try {
      // In production, load from database
      console.log('🏦 Loading merchant accounts from HMS...');
      
      // Mock merchant accounts for different gateways
      const mockAccounts: MerchantAccount[] = [
        {
          id: 'mid_ccbill_001',
          gatewayId: 'ccbill',
          midIdentifier: 'CCB-ADULT-001',
          descriptor: 'BOYFANZ.COM',
          region: 'US',
          currency: 'USD',
          status: 'active',
          monthlyVolumeLimit: 50000000, // $500K
          currentMonthVolume: 15000000, // $150K
          chargebackThreshold: 100, // 1%
          currentChargebackRate: 85, // 0.85%
          riskScore: 25,
          configuration: { clientAccnum: 'test-ccbill', clientSubacc: '0000' }
        },
        {
          id: 'mid_segpay_001',
          gatewayId: 'segpay',
          midIdentifier: 'SEG-ADULT-001',
          descriptor: 'BOYFANZ PLATFORM',
          region: 'US',
          currency: 'USD',
          status: 'active',
          monthlyVolumeLimit: 30000000, // $300K
          currentMonthVolume: 8000000, // $80K
          chargebackThreshold: 100, // 1%
          currentChargebackRate: 45, // 0.45%
          riskScore: 15,
          configuration: { packageId: 'test-segpay', userid: '12345' }
        },
        {
          id: 'mid_epoch_001',
          gatewayId: 'epoch',
          midIdentifier: 'EPO-ADULT-001',
          descriptor: 'BOYFANZ CREATOR',
          region: 'GLOBAL',
          currency: 'USD',
          status: 'active',
          monthlyVolumeLimit: 20000000, // $200K
          currentMonthVolume: 5000000, // $50K
          chargebackThreshold: 100, // 1%
          currentChargebackRate: 65, // 0.65%
          riskScore: 20,
          configuration: { pi: 'test-epoch', pf: 'BoyFanz' }
        }
      ];

      for (const account of mockAccounts) {
        this.merchantAccounts.set(account.id, account);
      }

      console.log(`✅ Loaded ${mockAccounts.length} merchant accounts`);
    } catch (error) {
      logger.error('Failed to load merchant accounts:', error);
    }
  }

  async getMerchantAccount(midId: string): Promise<MerchantAccount | null> {
    return this.merchantAccounts.get(midId) || null;
  }

  async getActiveAccountsForGateway(gatewayId: string): Promise<MerchantAccount[]> {
    return Array.from(this.merchantAccounts.values())
      .filter(account => 
        account.gatewayId === gatewayId && 
        account.status === 'active' &&
        account.currentChargebackRate < account.chargebackThreshold
      );
  }

  async recommendBestMID(request: {
    gatewayId: string;
    amount: number;
    currency: string;
    region?: string;
  }): Promise<MIDRecommendation | null> {
    const availableAccounts = await this.getActiveAccountsForGateway(request.gatewayId);
    
    if (availableAccounts.length === 0) {
      return null;
    }

    // Score each account based on multiple factors
    const scoredAccounts = availableAccounts.map(account => {
      let score = 1.0;

      // Prefer accounts with lower risk scores
      score -= (account.riskScore / 100) * 0.3;

      // Prefer accounts with lower chargeback rates
      score -= (account.currentChargebackRate / account.chargebackThreshold) * 0.2;

      // Prefer accounts with available volume capacity
      const volumeUsage = account.currentMonthVolume / account.monthlyVolumeLimit;
      if (volumeUsage > 0.8) score -= 0.2; // Penalize high volume usage

      // Currency matching bonus
      if (account.currency === request.currency) score += 0.1;

      // Region matching bonus
      if (request.region && account.region === request.region) score += 0.1;

      return {
        account,
        score: Math.max(0, score) // Ensure non-negative
      };
    });

    // Sort by score descending and pick the best
    scoredAccounts.sort((a, b) => b.score - a.score);
    const best = scoredAccounts[0];

    if (best.score === 0) {
      return null; // No suitable account found
    }

    return {
      midId: best.account.id,
      gatewayId: best.account.gatewayId,
      confidence: best.score,
      reason: `Selected based on risk score ${best.account.riskScore}, chargeback rate ${best.account.currentChargebackRate}bp`
    };
  }

  // ===== CHARGEBACK MANAGEMENT =====

  async processChargebackAlert(alert: Omit<ChargebackAlert, 'id'>): Promise<string> {
    const alertId = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const chargebackAlert: ChargebackAlert = {
      id: alertId,
      ...alert
    };

    this.chargebackAlerts.set(alertId, chargebackAlert);

    // Update MID chargeback statistics
    const mid = this.merchantAccounts.get(alert.midId);
    if (mid) {
      mid.lastChargebackDate = new Date();
      // Recalculate chargeback rate (simplified)
      mid.currentChargebackRate += 10; // Increase by 0.1%
      mid.riskScore = Math.min(100, mid.riskScore + 5);

      // Check if MID needs to be suspended
      if (mid.currentChargebackRate > mid.chargebackThreshold) {
        mid.status = 'reviewing';
        console.warn(`⚠️ MID ${mid.midIdentifier} exceeds chargeback threshold: ${mid.currentChargebackRate}bp > ${mid.chargebackThreshold}bp`);
      }
    }

    // Log chargeback for audit trail
    await storage.createAuditLog({
      actorId: 'system',
      action: 'chargeback_received',
      targetType: 'merchant_account',
      targetId: alert.midId,
      diffJson: chargebackAlert
    });

    // Notify administrators
    console.log(`🚨 Chargeback alert created: ${alertId} for MID ${alert.midId}`);

    return alertId;
  }

  async getChargebackAlerts(midId?: string): Promise<ChargebackAlert[]> {
    const alerts = Array.from(this.chargebackAlerts.values());
    return midId ? alerts.filter(alert => alert.midId === midId) : alerts;
  }

  // ===== RISK ASSESSMENT =====

  private initializeRiskRules(): void {
    this.riskRules = [
      {
        id: 'high_amount',
        condition: (request: any) => request.amountCents > 50000, // $500+
        score: 20,
        factor: 'High transaction amount'
      },
      {
        id: 'velocity_check',
        condition: (request: any) => request.userTransactionCount > 5, // 5+ transactions today
        score: 15,
        factor: 'High transaction velocity'
      },
      {
        id: 'new_user',
        condition: (request: any) => request.userAgeDays < 7, // Account less than 7 days old
        score: 25,
        factor: 'New user account'
      },
      {
        id: 'suspicious_ip',
        condition: (request: any) => request.vpnDetected || request.proxyDetected,
        score: 30,
        factor: 'Suspicious IP address'
      },
      {
        id: 'high_risk_country',
        condition: (request: any) => ['CN', 'RU', 'NG', 'ID'].includes(request.country),
        score: 20,
        factor: 'High-risk country'
      },
      {
        id: 'card_mismatch',
        condition: (request: any) => request.billingCountry !== request.cardCountry,
        score: 15,
        factor: 'Card and billing country mismatch'
      }
    ];
  }

  async assessTransactionRisk(request: {
    amountCents: number;
    currency: string;
    userId: string;
    userAgeDays: number;
    userTransactionCount: number;
    ipAddress: string;
    country: string;
    billingCountry?: string;
    cardCountry?: string;
    vpnDetected?: boolean;
    proxyDetected?: boolean;
  }): Promise<RiskAssessmentResult> {
    let totalScore = 0;
    const firedRules: any[] = [];
    const factors: string[] = [];

    // Evaluate each risk rule
    for (const rule of this.riskRules) {
      if (rule.condition(request)) {
        totalScore += rule.score;
        firedRules.push(rule);
        factors.push(rule.factor);
      }
    }

    // Determine risk level and action
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let action: 'approve' | 'review' | 'decline' | 'block';
    let reviewRequired = false;

    if (totalScore <= 20) {
      riskLevel = 'low';
      action = 'approve';
    } else if (totalScore <= 40) {
      riskLevel = 'medium';
      action = 'approve';
    } else if (totalScore <= 60) {
      riskLevel = 'high';
      action = 'review';
      reviewRequired = true;
    } else {
      riskLevel = 'critical';
      action = 'decline';
    }

    const result: RiskAssessmentResult = {
      riskScore: Math.min(100, totalScore),
      riskLevel,
      action,
      factors,
      rules: firedRules,
      reviewRequired
    };

    // Log risk assessment
    await storage.createAuditLog({
      actorId: 'system',
      action: 'risk_assessment',
      targetType: 'transaction',
      targetId: request.userId,
      diffJson: { request, result }
    });

    return result;
  }

  // ===== SMART ROUTING =====

  async getOptimalPaymentRoute(request: {
    amountCents: number;
    currency: string;
    region: string;
    riskScore: number;
    preferredGateways?: string[];
  }): Promise<{ gatewayId: string; midId: string; confidence: number } | null> {
    // Determine suitable gateways based on region and risk
    let suitableGateways: string[] = [];

    if (request.region === 'US') {
      suitableGateways = ['ccbill', 'segpay', 'epoch'];
    } else if (request.region === 'EU') {
      suitableGateways = ['verotel', 'commercegate', 'epoch'];
    } else {
      suitableGateways = ['vendo', 'centrobill', 'epoch'];
    }

    // Apply preferred gateways if provided
    if (request.preferredGateways && request.preferredGateways.length > 0) {
      suitableGateways = suitableGateways.filter(g => 
        request.preferredGateways!.includes(g)
      );
    }

    // For high-risk transactions, prefer more robust processors
    if (request.riskScore > 50) {
      suitableGateways = suitableGateways.filter(g => 
        ['ccbill', 'epoch', 'verotel'].includes(g)
      );
    }

    // Try to find the best MID for each suitable gateway
    for (const gatewayId of suitableGateways) {
      const recommendation = await this.recommendBestMID({
        gatewayId,
        amount: request.amountCents,
        currency: request.currency,
        region: request.region
      });

      if (recommendation && recommendation.confidence > 0.5) {
        return {
          gatewayId: recommendation.gatewayId,
          midId: recommendation.midId,
          confidence: recommendation.confidence
        };
      }
    }

    return null;
  }

  // ===== MONITORING AND HEALTH =====

  async getSystemHealth(): Promise<{
    totalMIDs: number;
    activeMIDs: number;
    suspendedMIDs: number;
    avgChargebackRate: number;
    avgRiskScore: number;
    recentChargebacks: number;
  }> {
    const accounts = Array.from(this.merchantAccounts.values());
    
    const totalMIDs = accounts.length;
    const activeMIDs = accounts.filter(a => a.status === 'active').length;
    const suspendedMIDs = accounts.filter(a => a.status === 'suspended').length;
    
    const avgChargebackRate = accounts.reduce((sum, a) => sum + a.currentChargebackRate, 0) / totalMIDs;
    const avgRiskScore = accounts.reduce((sum, a) => sum + a.riskScore, 0) / totalMIDs;
    
    const recentChargebacks = Array.from(this.chargebackAlerts.values())
      .filter(alert => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return new Date(alert.dueDate) > dayAgo;
      }).length;

    return {
      totalMIDs,
      activeMIDs,
      suspendedMIDs,
      avgChargebackRate: Math.round(avgChargebackRate),
      avgRiskScore: Math.round(avgRiskScore),
      recentChargebacks
    };
  }

  async generateRiskReport(): Promise<any> {
    const health = await this.getSystemHealth();
    const accounts = Array.from(this.merchantAccounts.values());
    const alerts = Array.from(this.chargebackAlerts.values());

    return {
      summary: health,
      highRiskMIDs: accounts
        .filter(a => a.riskScore > 70)
        .map(a => ({
          id: a.id,
          identifier: a.midIdentifier,
          riskScore: a.riskScore,
          chargebackRate: a.currentChargebackRate
        })),
      recentAlerts: alerts
        .slice(-10) // Last 10 alerts
        .map(a => ({
          id: a.id,
          midId: a.midId,
          reason: a.reason,
          amount: a.amount,
          dueDate: a.dueDate
        })),
      recommendations: [
        ...(health.avgChargebackRate > 80 ? ['Consider implementing stricter risk controls'] : []),
        ...(health.suspendedMIDs > 0 ? ['Review suspended MIDs for reactivation'] : []),
        ...(health.avgRiskScore > 50 ? ['Investigate high-risk merchant accounts'] : [])
      ]
    };
  }
}

// Export singleton instance
export const hostMerchantServices = new HostMerchantServices();