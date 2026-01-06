/**
 * Advanced Features Integration
 * Initializes all advanced systems for the platform
 */

import { initializeSelfHealing, getSelfHealingInstance } from '../shared/monitoring/SelfHealingSystem';
import { initializeFanzForensic, getFanzForensicInstance } from '../shared/security/FanzForensicSystem';
import { initializeContentAutomation, getContentAutomationInstance } from '../shared/automation/ContentAutomationSystem';

/**
 * Initialize all advanced features
 */
export function initializeAdvancedFeatures(dbPool?: any) {
  console.log('🚀 Initializing Advanced Features...');
  
  // Initialize Self-Healing
  const selfHealing = initializeSelfHealing(dbPool);
  selfHealing.on('healing-success', (action) => {
    console.log(`✅ Self-Healing: ${action.reason} resolved`);
  });
  
  // Initialize FanzForensic
  const forensic = initializeFanzForensic();
  forensic.on('signature-created', (sig) => {
    console.log(`🔐 Forensic signature created: ${sig.id}`);
  });
  
  // Initialize Content Automation
  const automation = initializeContentAutomation();
  automation.on('content-optimized', (data) => {
    console.log(`⚡ Content optimized: ${data.optimized.title}`);
  });
  
  console.log('✅ Advanced Features: All systems operational');
  
  return {
    selfHealing,
    forensic,
    automation,
  };
}

/**
 * Get all advanced feature instances
 */
export function getAdvancedFeatures() {
  return {
    selfHealing: getSelfHealingInstance(),
    forensic: getFanzForensicInstance(),
    automation: getContentAutomationInstance(),
  };
}

/**
 * Health check endpoint data
 */
export function getAdvancedFeaturesStatus() {
  const features = getAdvancedFeatures();
  
  return {
    selfHealing: features.selfHealing ? features.selfHealing.getHealthStatus() : null,
    forensic: features.forensic ? 'active' : 'inactive',
    automation: features.automation ? features.automation.getStats() : null,
  };
}
