import { storage } from '../storage';
import { notificationService } from './notificationService';

export interface EarningsTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'subscription' | 'ppv' | 'tip' | 'live_token' | 'shop_sale';
  source: string; // fan user ID or source identifier
  mediaId?: string; // for PPV purchases
  description: string;
  platformFee: number;
  creatorEarnings: number;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: Date;
}

export interface EarningsStats {
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  dailyEarnings: number;
  transactionCount: number;
  topEarningContent: Array<{
    mediaId: string;
    title: string;
    earnings: number;
  }>;
}

export class EarningsService {
  private readonly PLATFORM_FEE_PERCENTAGE = 0; // 100% earnings to creators
  private readonly PAYMENT_PROCESSOR_FEE = 0.029; // 2.9% typical payment processor fee

  async recordTransaction(transaction: Omit<EarningsTransaction, 'id' | 'platformFee' | 'creatorEarnings' | 'createdAt'>): Promise<EarningsTransaction> {
    try {
      // Calculate fees - BoyFanz takes 0%, but payment processors take ~2.9%
      const platformFee = transaction.amount * this.PLATFORM_FEE_PERCENTAGE;
      const processorFee = transaction.amount * this.PAYMENT_PROCESSOR_FEE;
      const creatorEarnings = transaction.amount - platformFee - processorFee;

      const fullTransaction: EarningsTransaction = {
        ...transaction,
        id: crypto.randomUUID(),
        platformFee,
        creatorEarnings,
        createdAt: new Date()
      };

      // Store in database (would implement this in storage layer)
      await this.storeTransaction(fullTransaction);

      // Update user balance
      await this.updateUserBalance(transaction.userId, creatorEarnings);

      // Send notification to creator
      await notificationService.sendNotification(transaction.userId, {
        kind: 'system',
        payloadJson: {
          message: `You earned $${creatorEarnings.toFixed(2)} from ${transaction.type}`,
          amount: creatorEarnings,
          type: transaction.type
        }
      });

      // Create audit log
      await storage.createAuditLog({
        actorId: transaction.source,
        action: 'earnings_recorded',
        targetType: 'user',
        targetId: transaction.userId,
        diffJson: {
          amount: transaction.amount,
          type: transaction.type,
          creatorEarnings,
          platformFee,
          processorFee
        }
      });

      console.log(`💰 Recorded ${transaction.type} earnings: $${creatorEarnings.toFixed(2)} for user ${transaction.userId}`);
      
      return fullTransaction;
    } catch (error) {
      console.error('Error recording earnings transaction:', error);
      throw error;
    }
  }

  private async storeTransaction(transaction: EarningsTransaction): Promise<void> {
    // This would be implemented in the storage layer
    // For now, we'll store it as a simplified record
    console.log('Storing transaction:', transaction.id);
  }

  private async updateUserBalance(userId: string, amount: number): Promise<void> {
    // Update user's available balance
    const user = await storage.getUser(userId);
    if (user) {
      const currentBalance = (user as any).availableBalance || 0;
      await storage.updateUser(userId, {
        availableBalance: currentBalance + amount,
        totalEarnings: ((user as any).totalEarnings || 0) + amount
      });
    }
  }

  async getEarningsStats(userId: string, period?: '24h' | '7d' | '30d' | 'all'): Promise<EarningsStats> {
    try {
      // This would query the database for actual earnings data
      // For now, returning mock data structure
      const mockStats: EarningsStats = {
        totalEarnings: 0,
        platformFees: 0,
        netEarnings: 0,
        monthlyEarnings: 0,
        weeklyEarnings: 0,
        dailyEarnings: 0,
        transactionCount: 0,
        topEarningContent: []
      };

      return mockStats;
    } catch (error) {
      console.error('Error getting earnings stats:', error);
      throw error;
    }
  }

  async processSubscriptionPayment(fanUserId: string, creatorUserId: string, subscriptionAmount: number): Promise<EarningsTransaction> {
    return this.recordTransaction({
      userId: creatorUserId,
      amount: subscriptionAmount,
      type: 'subscription',
      source: fanUserId,
      description: `Monthly subscription from fan ${fanUserId}`,
      status: 'completed'
    });
  }

  async processPPVPurchase(fanUserId: string, creatorUserId: string, mediaId: string, ppvAmount: number): Promise<EarningsTransaction> {
    return this.recordTransaction({
      userId: creatorUserId,
      amount: ppvAmount,
      type: 'ppv',
      source: fanUserId,
      mediaId,
      description: `PPV purchase of media ${mediaId}`,
      status: 'completed'
    });
  }

  async processTip(fanUserId: string, creatorUserId: string, tipAmount: number, message?: string): Promise<EarningsTransaction> {
    return this.recordTransaction({
      userId: creatorUserId,
      amount: tipAmount,
      type: 'tip',
      source: fanUserId,
      description: message ? `Tip: ${message}` : `Tip from fan ${fanUserId}`,
      status: 'completed'
    });
  }

  async processLiveStreamTokens(fanUserId: string, creatorUserId: string, tokenCount: number, tokenValue: number): Promise<EarningsTransaction> {
    const totalAmount = tokenCount * tokenValue;
    
    return this.recordTransaction({
      userId: creatorUserId,
      amount: totalAmount,
      type: 'live_token',
      source: fanUserId,
      description: `${tokenCount} tokens during live stream`,
      status: 'completed'
    });
  }

  async processShopSale(buyerUserId: string, creatorUserId: string, productId: string, saleAmount: number): Promise<EarningsTransaction> {
    return this.recordTransaction({
      userId: creatorUserId,
      amount: saleAmount,
      type: 'shop_sale',
      source: buyerUserId,
      description: `Shop sale - product ${productId}`,
      status: 'completed'
    });
  }

  async getEarningsBreakdown(userId: string): Promise<{
    grossEarnings: number;
    platformFees: number;
    processorFees: number;
    netEarnings: number;
    availableBalance: number;
    pendingBalance: number;
    feeBreakdown: {
      boyfanzFee: number; // Always $0
      processorFee: number;
      taxWithholding?: number;
    };
  }> {
    try {
      const user = await storage.getUser(userId);
      
      // This would query actual transaction data
      const grossEarnings = (user as any)?.totalEarnings || 0;
      const processorFees = grossEarnings * this.PAYMENT_PROCESSOR_FEE;
      const platformFees = 0; // BoyFanz takes 0%
      const netEarnings = grossEarnings - processorFees - platformFees;
      
      return {
        grossEarnings,
        platformFees,
        processorFees,
        netEarnings,
        availableBalance: (user as any)?.availableBalance || 0,
        pendingBalance: (user as any)?.pendingBalance || 0,
        feeBreakdown: {
          boyfanzFee: 0, // Always $0 - 100% earnings
          processorFee: processorFees
        }
      };
    } catch (error) {
      console.error('Error getting earnings breakdown:', error);
      throw error;
    }
  }

  async getTopEarners(limit = 10): Promise<Array<{
    userId: string;
    username: string;
    totalEarnings: number;
    monthlyEarnings: number;
    rank: number;
  }>> {
    try {
      // This would query the database for top earners
      // For now, returning empty array
      return [];
    } catch (error) {
      console.error('Error getting top earners:', error);
      throw error;
    }
  }

  async calculateRoyaltySharing(mediaId: string, earnings: number): Promise<{
    primaryCreator: { userId: string; percentage: number; amount: number };
    collaborators: Array<{ userId: string; percentage: number; amount: number }>;
  }> {
    try {
      // Get media asset and check for collaborators
      const media = await storage.getMediaAsset(mediaId);
      if (!media) {
        throw new Error('Media not found');
      }

      // Default: 100% to primary creator
      const result = {
        primaryCreator: {
          userId: media.ownerId,
          percentage: 100,
          amount: earnings
        },
        collaborators: [] as Array<{ userId: string; percentage: number; amount: number }>
      };

      // Check if media has collaboration metadata
      const collaborationData = (media as any).collaborationData;
      if (collaborationData && collaborationData.collaborators) {
        // Redistribute earnings based on agreed percentages
        let remainingPercentage = 100;
        
        for (const collab of collaborationData.collaborators) {
          const amount = earnings * (collab.percentage / 100);
          result.collaborators.push({
            userId: collab.userId,
            percentage: collab.percentage,
            amount
          });
          remainingPercentage -= collab.percentage;
        }

        // Update primary creator's share
        result.primaryCreator.percentage = remainingPercentage;
        result.primaryCreator.amount = earnings * (remainingPercentage / 100);
      }

      return result;
    } catch (error) {
      console.error('Error calculating royalty sharing:', error);
      throw error;
    }
  }
}

export const earningsService = new EarningsService();