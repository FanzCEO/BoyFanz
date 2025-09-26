/**
 * BoyFanz Infrastructure Providers Configuration
 * Adult-friendly hosting, CDN, storage, and cloud providers for scalable deployment
 */

export interface InfraProvider {
  name: string;
  type: 'hosting' | 'cdn' | 'storage' | 'cloud' | 'streaming';
  adultFriendly: boolean;
  globalCoverage: boolean;
  regions: string[];
  features: string[];
  pricing: {
    model: 'fixed' | 'pay-as-go' | 'tiered' | 'enterprise';
    startingPrice: string;
    bandwidth: string;
  };
  compliance: {
    gdpr: boolean;
    ada: boolean;
    dmca: boolean;
    ageVerification: boolean;
  };
  integration: {
    kubernetes: boolean;
    docker: boolean;
    cicd: boolean;
    api: boolean;
  };
  securityFeatures: {
    tokenizedUrls: boolean;
    geoBlocking: boolean;
    ddosProtection: boolean;
    ssl: boolean;
  };
  supportLevel: 'community' | 'standard' | 'premium' | 'enterprise';
  recommendation: 'startup' | 'growth' | 'enterprise' | 'specialized';
}

// ===== HOSTING PROVIDERS =====

export const hostingProviders: InfraProvider[] = [
  // Developer-Friendly Clouds
  {
    name: 'digitalocean',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['NYC', 'SFO', 'LON', 'AMS', 'SGP', 'TOR', 'BLR', 'FRA'],
    features: [
      'Managed Kubernetes',
      'One-click Docker',
      'Load Balancers',
      'Auto-scaling',
      'Spaces Storage',
      'CDN Integration'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '$5/month',
      bandwidth: '$0.01/GB'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: true,
      docker: true,
      cicd: true,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'linode',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['US-East', 'US-West', 'EU-West', 'EU-Central', 'AP-Southeast', 'AP-South'],
    features: [
      'Linode Kubernetes Engine (LKE)',
      'High Performance VPS',
      'NodeBalancers',
      'Object Storage',
      'Private Networking'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '$5/month',
      bandwidth: 'Included'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: true,
      docker: true,
      cicd: true,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'premium',
    recommendation: 'startup'
  },
  {
    name: 'vultr',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['US', 'EU', 'Asia', 'Australia', 'Africa'],
    features: [
      'Managed Kubernetes',
      'Global Cloud Compute',
      'Load Balancers',
      'Block Storage',
      'Private Networks'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$2.50/month',
      bandwidth: '$0.01/GB'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: true,
      docker: true,
      cicd: true,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'ovhcloud',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['EU', 'US', 'Canada', 'Singapore', 'Australia'],
    features: [
      'Managed Kubernetes',
      'Bare Metal Servers',
      'High Bandwidth (10Gbps+)',
      'Private Cloud',
      'Load Balancing'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '€3.50/month',
      bandwidth: 'Unlimited on dedicated'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: true,
      docker: true,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'growth'
  },
  // Specialized Adult Hosting
  {
    name: 'interserver',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: false,
    regions: ['US-East', 'US-West'],
    features: [
      'Adult Content Explicit Support',
      'Unmetered Bandwidth',
      'SSD Storage',
      'cPanel/WHM',
      'Free SSL'
    ],
    pricing: {
      model: 'fixed',
      startingPrice: '$6/month',
      bandwidth: 'Unlimited'
    },
    compliance: {
      gdpr: false,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: true,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'premium',
    recommendation: 'specialized'
  },
  {
    name: 'tmdhosting',
    type: 'hosting',
    adultFriendly: true,
    globalCoverage: false,
    regions: ['US', 'EU'],
    features: [
      'Fully Managed Adult Hosting',
      'Tube Script Optimization',
      'SSD Servers',
      '24/7 Adult Industry Support'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '$9.95/month',
      bandwidth: 'Unmetered'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: false
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'enterprise',
    recommendation: 'specialized'
  }
];

// ===== CDN PROVIDERS =====

export const cdnProviders: InfraProvider[] = [
  {
    name: 'cloudflare',
    type: 'cdn',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['Global - 275+ PoPs'],
    features: [
      'DDoS Protection',
      'Bot Management',
      'Workers (Edge Computing)',
      'Analytics',
      'Rate Limiting',
      'Image Optimization'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: 'Free',
      bandwidth: 'Unlimited on paid plans'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: true,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'bunnynet',
    type: 'cdn',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['114+ PoPs - Global'],
    features: [
      'Built-in Token Authentication',
      'Video Streaming Optimization',
      'Bunny Stream (Video Platform)',
      'Edge Storage',
      'Real-time Analytics'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$0.005/GB',
      bandwidth: '$0.005-0.01/GB by region'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'fastly',
    type: 'cdn',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['70+ PoPs - Global'],
    features: [
      'Real-time Purging',
      'Custom VCL Logic',
      'Compute@Edge',
      'Advanced Analytics',
      'Image Optimizer'
    ],
    pricing: {
      model: 'enterprise',
      startingPrice: '$50/month',
      bandwidth: '$0.12/GB + requests'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: true,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'enterprise',
    recommendation: 'growth'
  },
  {
    name: 'gcore',
    type: 'cdn',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['140+ PoPs - Strong EU/Russia/Asia'],
    features: [
      'Video Streaming Platform',
      'DDoS Protection',
      'Country/IP Access Control',
      'GPU Cloud Integration',
      'HTTP/3 Support'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '$20/month',
      bandwidth: 'Flat rate options'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'premium',
    recommendation: 'growth'
  }
];

// ===== OBJECT STORAGE PROVIDERS =====

export const storageProviders: InfraProvider[] = [
  {
    name: 'backblaze_b2',
    type: 'storage',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['US', 'EU'],
    features: [
      'S3-Compatible API',
      'Free Cloudflare Egress',
      'Versioning',
      'Lifecycle Rules',
      'Encryption at Rest'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$0.005/GB-month',
      bandwidth: '$0.01/GB (Free via Cloudflare)'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: false,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'cloudflare_r2',
    type: 'storage',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['Global Edge Network'],
    features: [
      'Zero Egress Fees',
      'S3-Compatible',
      'Global Distribution',
      'Cloudflare Integration'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$0.015/GB-month',
      bandwidth: '$0.00/GB egress'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'growth'
  },
  {
    name: 'bunny_storage',
    type: 'storage',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['EU', 'US', 'Asia'],
    features: [
      'CDN Integration',
      'FTP/HTTP Upload',
      'Replication',
      'Token Authentication'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$0.01/GB-month',
      bandwidth: '$0.005-0.01/GB'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  },
  {
    name: 'digitalocean_spaces',
    type: 'storage',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['NYC', 'AMS', 'SGP', 'SFO', 'FRA'],
    features: [
      'S3-Compatible',
      'Built-in CDN',
      'Simple Pricing',
      'DO Integration'
    ],
    pricing: {
      model: 'tiered',
      startingPrice: '$5/month (250GB + 1TB transfer)',
      bandwidth: '$0.01/GB over limits'
    },
    compliance: {
      gdpr: true,
      ada: true,
      dmca: true,
      ageVerification: false
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: false,
      geoBlocking: false,
      ddosProtection: false,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'startup'
  }
];

// ===== SPECIALIZED VIDEO/STREAMING PROVIDERS =====

export const streamingProviders: InfraProvider[] = [
  {
    name: 'reflected_networks',
    type: 'streaming',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['25+ PoPs Global'],
    features: [
      'Integrated CDN + Storage',
      'Video Encoding',
      'Adult Industry Focused',
      'High Bandwidth Optimization',
      'Analytics'
    ],
    pricing: {
      model: 'enterprise',
      startingPrice: 'Custom Contract',
      bandwidth: 'Flat rate global'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'enterprise',
    recommendation: 'enterprise'
  },
  {
    name: 'advanced_hosting',
    type: 'streaming',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['Global Network'],
    features: [
      'Video CDN with HLS Encryption',
      'On-the-fly Transcoding',
      'Multi-bitrate Streaming',
      'Anti-hotlink Protection',
      'DRM Support'
    ],
    pricing: {
      model: 'enterprise',
      startingPrice: 'Custom',
      bandwidth: 'Flat global pricing'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'enterprise',
    recommendation: 'enterprise'
  },
  {
    name: 'bunny_stream',
    type: 'streaming',
    adultFriendly: true,
    globalCoverage: true,
    regions: ['Global - 114+ PoPs'],
    features: [
      'Video Hosting & Encoding',
      'Adaptive Streaming',
      'Analytics Dashboard',
      'API Upload',
      'Player Embedding'
    ],
    pricing: {
      model: 'pay-as-go',
      startingPrice: '$1/1000 minutes',
      bandwidth: 'Included in storage'
    },
    compliance: {
      gdpr: true,
      ada: false,
      dmca: true,
      ageVerification: true
    },
    integration: {
      kubernetes: false,
      docker: false,
      cicd: false,
      api: true
    },
    securityFeatures: {
      tokenizedUrls: true,
      geoBlocking: true,
      ddosProtection: true,
      ssl: true
    },
    supportLevel: 'standard',
    recommendation: 'growth'
  }
];

// ===== PROVIDER SELECTION UTILITIES =====

export class InfrastructureService {
  
  /**
   * Get recommended providers based on business stage and requirements
   */
  getRecommendedStack(
    stage: 'startup' | 'growth' | 'enterprise',
    requirements: {
      globalCoverage?: boolean;
      videoStreaming?: boolean;
      highBandwidth?: boolean;
      budget?: 'low' | 'medium' | 'high';
      regions?: string[];
    }
  ) {
    const hosting = hostingProviders.filter(p => 
      p.recommendation === stage || p.recommendation === 'specialized'
    );
    
    const cdn = cdnProviders.filter(p => 
      p.recommendation === stage && 
      (!requirements.globalCoverage || p.globalCoverage)
    );
    
    const storage = storageProviders.filter(p => 
      p.recommendation === stage
    );
    
    const streaming = requirements.videoStreaming ? 
      streamingProviders.filter(p => p.recommendation === stage) : 
      [];
    
    return {
      hosting: this.rankProviders(hosting, requirements),
      cdn: this.rankProviders(cdn, requirements),
      storage: this.rankProviders(storage, requirements),
      streaming: this.rankProviders(streaming, requirements)
    };
  }
  
  /**
   * Get adult-friendly providers only
   */
  getAdultFriendlyProviders() {
    return {
      hosting: hostingProviders.filter(p => p.adultFriendly),
      cdn: cdnProviders.filter(p => p.adultFriendly),
      storage: storageProviders.filter(p => p.adultFriendly),
      streaming: streamingProviders.filter(p => p.adultFriendly)
    };
  }
  
  /**
   * Get providers with specific security features
   */
  getProvidersWithSecurity(features: (keyof InfraProvider['securityFeatures'])[]) {
    const checkFeatures = (provider: InfraProvider) => 
      features.every(feature => provider.securityFeatures[feature]);
    
    return {
      hosting: hostingProviders.filter(checkFeatures),
      cdn: cdnProviders.filter(checkFeatures),
      storage: storageProviders.filter(checkFeatures),
      streaming: streamingProviders.filter(checkFeatures)
    };
  }
  
  /**
   * Get cost-effective providers for high bandwidth
   */
  getHighBandwidthProviders() {
    // Providers known for good bandwidth pricing or unlimited bandwidth
    const goodBandwidthProviders = [
      'ovhcloud', 'interserver', 'bunnynet', 'backblaze_b2', 
      'cloudflare_r2', 'reflected_networks', 'advanced_hosting'
    ];
    
    return {
      hosting: hostingProviders.filter(p => goodBandwidthProviders.includes(p.name)),
      cdn: cdnProviders.filter(p => goodBandwidthProviders.includes(p.name)),
      storage: storageProviders.filter(p => goodBandwidthProviders.includes(p.name)),
      streaming: streamingProviders.filter(p => goodBandwidthProviders.includes(p.name))
    };
  }
  
  private rankProviders(providers: InfraProvider[], requirements: any): InfraProvider[] {
    // Simple ranking based on feature matching
    return providers.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      
      if (requirements.globalCoverage) {
        aScore += a.globalCoverage ? 2 : 0;
        bScore += b.globalCoverage ? 2 : 0;
      }
      
      if (requirements.videoStreaming && a.type === 'streaming') {
        aScore += 3;
      }
      if (requirements.videoStreaming && b.type === 'streaming') {
        bScore += 3;
      }
      
      // Prefer providers with better security features
      const aSecurityScore = Object.values(a.securityFeatures).filter(Boolean).length;
      const bSecurityScore = Object.values(b.securityFeatures).filter(Boolean).length;
      aScore += aSecurityScore;
      bScore += bSecurityScore;
      
      return bScore - aScore;
    });
  }
}

export const infrastructureService = new InfrastructureService();