import { OpenAI } from "openai";

// DYNAMIC PRICING AI ENGINE
// Real-time price optimization using OpenAI GPT-4o-mini

interface PricingContext {
  contentId?: string;
  planId?: string;
  creatorId: string;
  currentPriceCents: number;
  
  // Market signals
  viewCount?: number;
  likeCount?: number;
  purchaseCount?: number;
  conversionRate?: number;
  
  // Time-based factors
  contentAge?: number; // days since published
  timeOfDay?: number; // 0-23
  dayOfWeek?: number; // 0-6
  
  // Creator metrics
  followerCount?: number;
  avgEngagementRate?: number;
  historicalRevenue?: number;
}

interface PricingRecommendation {
  suggestedPriceCents: number;
  confidence: number; // 0-100
  rationale: string;
  expectedImpactPercent: number;
  triggers: string[];
}

interface PricingConstraints {
  minPriceCents: number;
  maxPriceCents: number;
  strategy: 'fixed' | 'dynamic' | 'tiered' | 'demand_based';
}

// Lazy initialization - only create client when needed
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  if (!openai) {
    throw new Error("OpenAI API key not configured");
  }
  return openai;
}

export class DynamicPricingService {
  /**
   * Generate AI-powered price recommendation
   */
  async generatePriceRecommendation(
    context: PricingContext,
    constraints: PricingConstraints
  ): Promise<PricingRecommendation> {
    // Build data-driven prompt
    const prompt = this.buildPricingPrompt(context, constraints);
    
    try {
      const client = getOpenAIClient();
      const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert pricing strategist for a creator economy platform. Analyze market signals, engagement data, and creator performance to recommend optimal prices that maximize revenue while maintaining fan satisfaction.

Return your recommendation in JSON format:
{
  "suggestedPriceCents": <number>,
  "confidence": <0-100>,
  "rationale": "<explanation>",
  "expectedImpactPercent": <-100 to 100>,
  "triggers": ["<trigger1>", "<trigger2>"]
}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for consistent pricing decisions
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      
      // Validate and enforce constraints
      result.suggestedPriceCents = Math.max(
        constraints.minPriceCents,
        Math.min(constraints.maxPriceCents, result.suggestedPriceCents)
      );

      return result as PricingRecommendation;
    } catch (error) {
      console.error("Dynamic Pricing AI error:", error);
      // Fallback: no price change
      return {
        suggestedPriceCents: context.currentPriceCents,
        confidence: 0,
        rationale: "AI pricing unavailable, maintaining current price",
        expectedImpactPercent: 0,
        triggers: ["ai_error"]
      };
    }
  }

  /**
   * Build detailed pricing analysis prompt
   */
  private buildPricingPrompt(
    context: PricingContext,
    constraints: PricingConstraints
  ): string {
    const parts = [
      `Content/Plan ID: ${context.contentId || context.planId}`,
      `Creator ID: ${context.creatorId}`,
      `Current Price: $${(context.currentPriceCents / 100).toFixed(2)}`,
      `Price Range: $${(constraints.minPriceCents / 100).toFixed(2)} - $${(constraints.maxPriceCents / 100).toFixed(2)}`,
      `Strategy: ${constraints.strategy}`,
      ``
    ];

    // Add engagement metrics if available
    if (context.viewCount !== undefined) {
      parts.push(`Views: ${context.viewCount.toLocaleString()}`);
    }
    if (context.likeCount !== undefined) {
      parts.push(`Likes: ${context.likeCount.toLocaleString()}`);
    }
    if (context.purchaseCount !== undefined) {
      parts.push(`Purchases: ${context.purchaseCount.toLocaleString()}`);
    }
    if (context.conversionRate !== undefined) {
      parts.push(`Conversion Rate: ${(context.conversionRate * 100).toFixed(2)}%`);
    }

    // Add time factors
    if (context.contentAge !== undefined) {
      parts.push(`Content Age: ${context.contentAge} days`);
    }
    if (context.timeOfDay !== undefined) {
      parts.push(`Time of Day: ${context.timeOfDay}:00`);
    }
    if (context.dayOfWeek !== undefined) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      parts.push(`Day: ${days[context.dayOfWeek]}`);
    }

    // Add creator metrics
    if (context.followerCount !== undefined) {
      parts.push(`Creator Followers: ${context.followerCount.toLocaleString()}`);
    }
    if (context.avgEngagementRate !== undefined) {
      parts.push(`Avg Engagement: ${(context.avgEngagementRate * 100).toFixed(2)}%`);
    }
    if (context.historicalRevenue !== undefined) {
      parts.push(`Historical Revenue: $${(context.historicalRevenue / 100).toFixed(2)}`);
    }

    parts.push('');
    parts.push('Analyze the data and recommend an optimal price that:');
    parts.push('1. Maximizes revenue based on demand signals');
    parts.push('2. Considers content age (newer = premium, older = discount)');
    parts.push('3. Accounts for time-of-day/week patterns');
    parts.push('4. Balances creator reputation with fan affordability');
    parts.push('5. Stays within the allowed price range');

    return parts.join('\n');
  }

  /**
   * Calculate demand-based price adjustment
   * Simple algorithm for when AI is not available
   */
  calculateDemandPrice(
    basePriceCents: number,
    demandMultiplier: number, // 0.5 to 2.0
    constraints: PricingConstraints
  ): number {
    const adjustedPrice = Math.round(basePriceCents * demandMultiplier);
    return Math.max(
      constraints.minPriceCents,
      Math.min(constraints.maxPriceCents, adjustedPrice)
    );
  }

  /**
   * Time decay pricing (price drops over time)
   */
  calculateTimeDecayPrice(
    basePriceCents: number,
    ageInDays: number,
    decayRate: number = 0.05, // 5% per day
    constraints: PricingConstraints
  ): number {
    const decayMultiplier = Math.max(0.3, 1 - (ageInDays * decayRate));
    const adjustedPrice = Math.round(basePriceCents * decayMultiplier);
    return Math.max(
      constraints.minPriceCents,
      Math.min(constraints.maxPriceCents, adjustedPrice)
    );
  }

  /**
   * Competitive pricing analysis (mock for now)
   */
  async analyzeCompetitorPricing(
    contentType: string,
    creatorTier: string
  ): Promise<{
    avgPriceCents: number;
    minPriceCents: number;
    maxPriceCents: number;
    recommendedPriceCents: number;
  }> {
    // TODO: Implement real competitor analysis
    // For now, return mock data
    return {
      avgPriceCents: 1500, // $15
      minPriceCents: 500,  // $5
      maxPriceCents: 5000, // $50
      recommendedPriceCents: 1800 // $18
    };
  }
}

export const dynamicPricingService = new DynamicPricingService();
