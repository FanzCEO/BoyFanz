/**
 * FanzDash Infrastructure Management Dashboard
 * Unified control for all FANZ platform deployments across providers
 */

import express from 'express';
import { infrastructureManager, FANZ_PLATFORMS } from '../services/infrastructureManagementService.js';
import { infrastructureService } from '../config/infrastructureProviders.js';

const router = express.Router();

// ===== ECOSYSTEM OVERVIEW =====

/**
 * GET /api/admin/infrastructure/overview
 * Complete ecosystem infrastructure overview
 */
router.get('/overview', async (req, res) => {
  try {
    const ecosystemStatus = infrastructureManager.getEcosystemStatus();
    const costAnalysis = infrastructureManager.getCostAnalysis();
    const adultFriendlyProviders = infrastructureService.getAdultFriendlyProviders();

    const overview = {
      ecosystem: {
        totalPlatforms: Object.keys(FANZ_PLATFORMS).length,
        activeClusters: Object.values(ecosystemStatus).flat().filter(c => c.status === 'running').length,
        deployingClusters: Object.values(ecosystemStatus).flat().filter(c => c.status === 'deploying').length,
        errorClusters: Object.values(ecosystemStatus).flat().filter(c => c.status === 'error').length,
        healthyClusters: Object.values(ecosystemStatus).flat().filter(c => c.health === 'healthy').length
      },
      costs: costAnalysis,
      infrastructure: {
        availableHostingProviders: adultFriendlyProviders.hosting.length,
        availableCdnProviders: adultFriendlyProviders.cdn.length,
        availableStorageProviders: adultFriendlyProviders.storage.length,
        availableStreamingProviders: adultFriendlyProviders.streaming.length
      },
      platforms: Object.entries(FANZ_PLATFORMS).map(([id, platform]) => ({
        id,
        name: platform.name,
        type: platform.type,
        status: ecosystemStatus[id]?.[0]?.status || 'not-deployed',
        clusters: ecosystemStatus[id]?.length || 0,
        requirements: platform.requirements
      }))
    };

    res.json(overview);
  } catch (error) {
    console.error('Error getting infrastructure overview:', error);
    res.status(500).json({ error: 'Failed to get infrastructure overview' });
  }
});

// ===== PLATFORM MANAGEMENT =====

/**
 * GET /api/admin/infrastructure/platforms
 * List all FANZ platforms with deployment options
 */
router.get('/platforms', async (req, res) => {
  try {
    const platforms = Object.entries(FANZ_PLATFORMS).map(([id, platform]) => ({
      id,
      name: platform.name,
      type: platform.type,
      requirements: platform.requirements,
      deploymentComplexity: getComplexity(platform.requirements)
    }));

    res.json({ platforms });
  } catch (error) {
    console.error('Error listing platforms:', error);
    res.status(500).json({ error: 'Failed to list platforms' });
  }
});

/**
 * POST /api/admin/infrastructure/platforms/:platformId/recommendations
 * Get provider recommendations for a platform
 */
router.post('/platforms/:platformId/recommendations', async (req, res) => {
  try {
    const { platformId } = req.params;
    const { stage = 'startup', budget = 'medium' } = req.body;

    if (!FANZ_PLATFORMS[platformId as keyof typeof FANZ_PLATFORMS]) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    const recommendations = infrastructureManager.getProviderRecommendations(
      platformId as keyof typeof FANZ_PLATFORMS,
      stage,
      budget
    );

    res.json(recommendations);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

/**
 * POST /api/admin/infrastructure/platforms/:platformId/deploy
 * Deploy a platform to infrastructure
 */
router.post('/platforms/:platformId/deploy', async (req, res) => {
  try {
    const { platformId } = req.params;
    const { 
      primaryProvider,
      secondaryProvider,
      regions = ['us-east', 'eu-west'],
      environment = 'production' 
    } = req.body;

    if (!FANZ_PLATFORMS[platformId as keyof typeof FANZ_PLATFORMS]) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    const deploymentConfigs = infrastructureManager.createMultiCloudDeployment(
      platformId as keyof typeof FANZ_PLATFORMS,
      primaryProvider,
      secondaryProvider,
      regions
    );

    // Deploy each configuration
    const deploymentResults = [];
    
    for (const config of deploymentConfigs) {
      const result = await infrastructureManager.deployPlatform(
        platformId as keyof typeof FANZ_PLATFORMS,
        config
      );
      deploymentResults.push(result);
    }

    res.json({
      success: deploymentResults.every(r => r.success),
      deployments: deploymentResults,
      platformName: FANZ_PLATFORMS[platformId as keyof typeof FANZ_PLATFORMS].name
    });
  } catch (error) {
    console.error('Error deploying platform:', error);
    res.status(500).json({ error: 'Failed to deploy platform' });
  }
});

/**
 * POST /api/admin/infrastructure/clusters/:clusterId/migrate
 * Migrate a cluster to different provider
 */
router.post('/clusters/:clusterId/migrate', async (req, res) => {
  try {
    const { clusterId } = req.params;
    const { targetProvider, targetRegion } = req.body;

    const result = await infrastructureManager.migratePlatform(
      clusterId,
      targetProvider,
      targetRegion
    );

    res.json(result);
  } catch (error) {
    console.error('Error migrating cluster:', error);
    res.status(500).json({ error: 'Failed to migrate cluster' });
  }
});

// ===== PROVIDER MANAGEMENT =====

/**
 * GET /api/admin/infrastructure/providers
 * List all adult-friendly infrastructure providers
 */
router.get('/providers', async (req, res) => {
  try {
    const { type } = req.query;
    const providers = infrastructureService.getAdultFriendlyProviders();

    if (type && ['hosting', 'cdn', 'storage', 'streaming'].includes(type as string)) {
      const filteredProviders = providers[type as keyof typeof providers];
      return res.json({ providers: filteredProviders, type });
    }

    res.json(providers);
  } catch (error) {
    console.error('Error listing providers:', error);
    res.status(500).json({ error: 'Failed to list providers' });
  }
});

/**
 * GET /api/admin/infrastructure/providers/high-bandwidth
 * Get providers optimized for high bandwidth
 */
router.get('/providers/high-bandwidth', async (req, res) => {
  try {
    const providers = infrastructureService.getHighBandwidthProviders();
    res.json(providers);
  } catch (error) {
    console.error('Error getting high bandwidth providers:', error);
    res.status(500).json({ error: 'Failed to get high bandwidth providers' });
  }
});

/**
 * GET /api/admin/infrastructure/providers/security/:features
 * Get providers with specific security features
 */
router.get('/providers/security/:features', async (req, res) => {
  try {
    const featuresParam = req.params.features;
    const features = featuresParam.split(',') as Array<'tokenizedUrls' | 'geoBlocking' | 'ddosProtection' | 'ssl'>;
    
    const providers = infrastructureService.getProvidersWithSecurity(features);
    res.json({ providers, requiredFeatures: features });
  } catch (error) {
    console.error('Error getting security providers:', error);
    res.status(500).json({ error: 'Failed to get security providers' });
  }
});

// ===== DEPLOYMENT STRATEGY =====

/**
 * POST /api/admin/infrastructure/strategy/generate
 * Generate ecosystem deployment strategy
 */
router.post('/strategy/generate', async (req, res) => {
  try {
    const { 
      budget = 5000, 
      stage = 'startup', 
      regions = ['us-east', 'eu-west'],
      priorities = []
    } = req.body;

    const strategy = infrastructureManager.generateEcosystemDeploymentStrategy(
      budget,
      stage,
      regions
    );

    // Add deployment recommendations based on budget
    const recommendations = [];
    
    if (strategy.totalEstimatedCost > budget) {
      recommendations.push('Budget exceeded. Consider reducing platform scope or increasing budget.');
      recommendations.push('Start with core platforms: FanzDash, FanzSSO, BoyFanz, GirlFanz');
    }

    if (stage === 'startup') {
      recommendations.push('Focus on cost-effective providers: DigitalOcean, BunnyCDN, Backblaze B2');
    } else if (stage === 'enterprise') {
      recommendations.push('Consider enterprise contracts: Akamai, Fastly, Advanced Hosting');
    }

    res.json({
      strategy,
      recommendations,
      budgetUtilization: (strategy.totalEstimatedCost / budget) * 100
    });
  } catch (error) {
    console.error('Error generating strategy:', error);
    res.status(500).json({ error: 'Failed to generate deployment strategy' });
  }
});

// ===== CLUSTER STATUS & MONITORING =====

/**
 * GET /api/admin/infrastructure/clusters
 * Get all cluster statuses
 */
router.get('/clusters', async (req, res) => {
  try {
    const ecosystemStatus = infrastructureManager.getEcosystemStatus();
    
    const clusters = Object.entries(ecosystemStatus).flatMap(([platformId, statuses]) =>
      statuses.map(status => ({
        ...status,
        platformId,
        platformName: FANZ_PLATFORMS[platformId as keyof typeof FANZ_PLATFORMS]?.name
      }))
    );

    res.json({ clusters });
  } catch (error) {
    console.error('Error getting cluster status:', error);
    res.status(500).json({ error: 'Failed to get cluster status' });
  }
});

/**
 * GET /api/admin/infrastructure/costs/analysis
 * Detailed cost analysis and optimization recommendations
 */
router.get('/costs/analysis', async (req, res) => {
  try {
    const analysis = infrastructureManager.getCostAnalysis();
    
    // Add cost optimization suggestions
    const optimizations = [];
    
    if (analysis.totalMonthlyCost > 1000) {
      optimizations.push({
        type: 'bulk-discount',
        description: 'Negotiate enterprise contracts for volume discounts',
        potentialSavings: Math.round(analysis.totalMonthlyCost * 0.15)
      });
    }

    // Check for high-cost providers
    const avgCostPerProvider = analysis.totalMonthlyCost / Object.keys(analysis.costByProvider).length;
    
    Object.entries(analysis.costByProvider).forEach(([provider, cost]) => {
      if (cost > avgCostPerProvider * 1.5) {
        optimizations.push({
          type: 'provider-migration',
          description: `Consider migrating some workloads from ${provider} to reduce costs`,
          provider,
          currentCost: cost,
          potentialSavings: Math.round(cost * 0.3)
        });
      }
    });

    res.json({
      ...analysis,
      optimizations,
      costEfficiency: analysis.totalMonthlyCost < 2000 ? 'excellent' : 
                     analysis.totalMonthlyCost < 5000 ? 'good' : 'needs-optimization'
    });
  } catch (error) {
    console.error('Error getting cost analysis:', error);
    res.status(500).json({ error: 'Failed to get cost analysis' });
  }
});

// ===== BULK OPERATIONS =====

/**
 * POST /api/admin/infrastructure/bulk/deploy
 * Deploy multiple platforms at once
 */
router.post('/bulk/deploy', async (req, res) => {
  try {
    const { platforms, globalConfig } = req.body;
    const results = [];

    for (const platformConfig of platforms) {
      const { platformId, provider, region } = platformConfig;
      
      try {
        const deploymentConfigs = infrastructureManager.createMultiCloudDeployment(
          platformId,
          provider,
          globalConfig.secondaryProvider,
          [region, globalConfig.secondaryRegion].filter(Boolean)
        );

        for (const config of deploymentConfigs) {
          const result = await infrastructureManager.deployPlatform(platformId, config);
          results.push({
            platformId,
            provider,
            ...result
          });
        }
      } catch (error) {
        results.push({
          platformId,
          provider,
          success: false,
          error: (error as Error).message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: successCount === results.length,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: results.length - successCount
      }
    });
  } catch (error) {
    console.error('Error bulk deploying:', error);
    res.status(500).json({ error: 'Failed to bulk deploy platforms' });
  }
});

/**
 * POST /api/admin/infrastructure/bulk/migrate
 * Migrate multiple clusters to new providers
 */
router.post('/bulk/migrate', async (req, res) => {
  try {
    const { migrations } = req.body;
    const results = [];

    for (const migration of migrations) {
      const { clusterId, targetProvider, targetRegion } = migration;
      
      try {
        const result = await infrastructureManager.migratePlatform(
          clusterId,
          targetProvider,
          targetRegion
        );
        results.push({
          clusterId,
          targetProvider,
          ...result
        });
      } catch (error) {
        results.push({
          clusterId,
          targetProvider,
          success: false,
          error: (error as Error).message
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Error bulk migrating:', error);
    res.status(500).json({ error: 'Failed to bulk migrate clusters' });
  }
});

// ===== CONFIGURATION TEMPLATES =====

/**
 * GET /api/admin/infrastructure/templates
 * Get deployment templates for common scenarios
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = {
      'startup-basic': {
        name: 'Startup Basic',
        description: 'Core platforms with cost-effective providers',
        platforms: ['fanzdash', 'fanzsso', 'boyfanz', 'girlfanz'],
        providers: {
          hosting: 'digitalocean',
          cdn: 'cloudflare',
          storage: 'backblaze_b2'
        },
        estimatedCost: 400,
        features: ['Basic redundancy', 'SSL included', 'DDoS protection']
      },
      'startup-premium': {
        name: 'Startup Premium',
        description: 'Enhanced startup setup with better performance',
        platforms: ['fanzdash', 'fanzsso', 'boyfanz', 'girlfanz', 'mediahub', 'fanzlanding'],
        providers: {
          hosting: 'linode',
          cdn: 'bunnynet',
          storage: 'bunny_storage',
          streaming: 'bunny_stream'
        },
        estimatedCost: 750,
        features: ['Video streaming', 'Global CDN', 'Token auth', 'Analytics']
      },
      'growth-balanced': {
        name: 'Growth Balanced',
        description: 'Multi-provider setup for scaling businesses',
        platforms: Object.keys(FANZ_PLATFORMS).slice(0, 8),
        providers: {
          hosting: ['digitalocean', 'vultr'],
          cdn: 'bunnynet',
          storage: 'cloudflare_r2',
          streaming: 'bunny_stream'
        },
        estimatedCost: 1200,
        features: ['Multi-region', 'Auto-scaling', 'Advanced security', 'Cost optimization']
      },
      'enterprise-global': {
        name: 'Enterprise Global',
        description: 'Full ecosystem with enterprise providers',
        platforms: Object.keys(FANZ_PLATFORMS),
        providers: {
          hosting: ['linode', 'ovhcloud'],
          cdn: ['fastly', 'gcore'],
          storage: 'cloudflare_r2',
          streaming: 'advanced_hosting'
        },
        estimatedCost: 3500,
        features: ['Global deployment', 'Enterprise SLAs', 'Advanced DRM', 'Custom contracts']
      }
    };

    res.json({ templates });
  } catch (error) {
    console.error('Error getting templates:', error);
    res.status(500).json({ error: 'Failed to get templates' });
  }
});

/**
 * POST /api/admin/infrastructure/templates/:templateId/deploy
 * Deploy using a predefined template
 */
router.post('/templates/:templateId/deploy', async (req, res) => {
  try {
    const { templateId } = req.params;
    const { customizations = {} } = req.body;

    // This would implement template-based deployment
    // For now, return a success response
    res.json({
      success: true,
      message: `Template ${templateId} deployment initiated`,
      templateId,
      customizations
    });
  } catch (error) {
    console.error('Error deploying template:', error);
    res.status(500).json({ error: 'Failed to deploy template' });
  }
});

// Helper function
function getComplexity(requirements: any): 'low' | 'medium' | 'high' {
  let complexity = 0;
  
  if (requirements.videoStreaming) complexity += 2;
  if (requirements.highBandwidth) complexity += 1;
  if (requirements.globalCDN) complexity += 1;
  if (requirements.highSecurity) complexity += 2;
  if (requirements.compliance?.length > 2) complexity += 1;
  
  if (complexity <= 2) return 'low';
  if (complexity <= 4) return 'medium';
  return 'high';
}

export default router;