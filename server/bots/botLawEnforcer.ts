/**
 * PROPRIETARY - Owned by Joshua Stone (Wyatt Cole).
 * Licensed for Use by FANZ Group Holdings LLC.
 * 30 N Gould Street, Sheridan, WY 82801.
 * FANZ - Patent Pending (2025).
 *
 * FANZ BOT LAW ENFORCER
 *
 * Autonomous enforcement bot that:
 * - Monitors all AI agents for BOT LAW compliance
 * - Blocks unauthorized execution attempts
 * - Logs violations to audit trail
 * - Alerts on policy breaches
 * - Auto-reverts non-compliant configurations
 *
 * THIS BOT IS THE WATCHDOG. IT ENFORCES THE LAW.
 */

import { db } from '../db';
import { sql } from 'drizzle-orm';

interface ViolationReport {
  agentId: number;
  agentName: string;
  violationType: string;
  details: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  autoFixed: boolean;
  timestamp: Date;
}

interface EnforcementResult {
  timestamp: Date;
  agentsChecked: number;
  violationsFound: ViolationReport[];
  violationsFixed: number;
  alertsSent: number;
  status: 'COMPLIANT' | 'VIOLATIONS_FOUND' | 'VIOLATIONS_FIXED' | 'ERROR';
}

// FANZ BOT LAW - Mandatory restrictions
const MANDATORY_CONFIG = {
  mode: 'advisory_only',
  can_execute: false,
  can_restart: false,
  can_modify: false,
  can_delete: false,
  can_deploy: false,
  can_scale: false,
  requires_human_approval: true,
};

const ALLOWED_ACTIONS = [
  'observe',
  'analyze',
  'diagnose',
  'propose_solution',
  'generate_report',
  'assess_risk',
  'recommend_prevention',
];

const DENIED_ACTIONS = [
  'execute',
  'restart',
  'deploy',
  'modify',
  'delete',
  'scale',
  'rollback',
  'publish',
  'send',
  'terminate',
  'purge',
  'bypass_approval',
  'self_modify',
  'disable_audit',
  'create_backdoor',
  'access_secrets',
  'external_comms',
  'spawn_children',
];

class BotLawEnforcer {
  private platformName: string;
  private enforcerRunning: boolean = false;
  private lastRunTimestamp: Date | null = null;

  constructor() {
    this.platformName = process.env.PLATFORM_NAME || 'boyfanz';
  }

  /**
   * Check if an agent configuration violates BOT LAW
   */
  private checkConfigViolations(agent: any): ViolationReport[] {
    const violations: ViolationReport[] = [];
    const config = agent.config || {};

    // Check each mandatory restriction
    if (config.mode !== 'advisory_only') {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'INVALID_MODE',
        details: `Agent mode is "${config.mode}" instead of "advisory_only"`,
        severity: 'CRITICAL',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_execute === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_EXECUTE',
        details: 'Agent has can_execute enabled without proper toggle',
        severity: 'CRITICAL',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_restart === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_RESTART',
        details: 'Agent has can_restart enabled',
        severity: 'HIGH',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_modify === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_MODIFY',
        details: 'Agent has can_modify enabled',
        severity: 'HIGH',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_delete === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_DELETE',
        details: 'Agent has can_delete enabled',
        severity: 'CRITICAL',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_deploy === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_DEPLOY',
        details: 'Agent has can_deploy enabled',
        severity: 'HIGH',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.can_scale === true) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'UNAUTHORIZED_SCALE',
        details: 'Agent has can_scale enabled',
        severity: 'HIGH',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    if (config.requires_human_approval === false) {
      violations.push({
        agentId: agent.id,
        agentName: agent.name,
        violationType: 'BYPASSED_APPROVAL',
        details: 'Agent has requires_human_approval disabled',
        severity: 'CRITICAL',
        autoFixed: false,
        timestamp: new Date(),
      });
    }

    return violations;
  }

  /**
   * Check if agent has unauthorized actions in allowed_actions
   */
  private checkActionViolations(agent: any): ViolationReport[] {
    const violations: ViolationReport[] = [];
    const allowedActions = agent.allowed_actions || [];

    for (const action of allowedActions) {
      if (DENIED_ACTIONS.includes(action)) {
        violations.push({
          agentId: agent.id,
          agentName: agent.name,
          violationType: 'UNAUTHORIZED_ACTION',
          details: `Agent has denied action "${action}" in allowed_actions`,
          severity: action === 'delete' || action === 'terminate' || action === 'purge' ? 'CRITICAL' : 'HIGH',
          autoFixed: false,
          timestamp: new Date(),
        });
      }
    }

    return violations;
  }

  /**
   * Check for improperly enabled capability toggles
   */
  private async checkToggleViolations(): Promise<ViolationReport[]> {
    const violations: ViolationReport[] = [];

    try {
      // Check for execution toggles that are enabled without proper training
      const badToggles = await db.execute(sql`
        SELECT
          t.id,
          t.agent_id,
          t.capability,
          t.enabled,
          t.enabled_by,
          t.enabled_at,
          a.name as agent_name,
          a.training_completed
        FROM ai_capability_toggles t
        JOIN ai_agents a ON t.agent_id = a.id
        WHERE t.enabled = true
          AND t.capability IN ('execute', 'restart', 'deploy', 'modify', 'delete', 'scale', 'rollback', 'terminate', 'purge')
          AND (a.training_completed IS NULL OR a.training_completed = false)
      `);

      for (const toggle of badToggles.rows) {
        violations.push({
          agentId: toggle.agent_id,
          agentName: toggle.agent_name || `Agent ${toggle.agent_id}`,
          violationType: 'TOGGLE_WITHOUT_TRAINING',
          details: `Capability "${toggle.capability}" enabled without completed training`,
          severity: 'HIGH',
          autoFixed: false,
          timestamp: new Date(),
        });
      }
    } catch (error) {
      console.error('[BotLawEnforcer] Error checking toggles:', error);
    }

    return violations;
  }

  /**
   * Check for unauthorized execution attempts in audit log
   */
  private async checkAuditViolations(): Promise<ViolationReport[]> {
    const violations: ViolationReport[] = [];

    try {
      // Look for execution attempts in last 24 hours
      const executionAttempts = await db.execute(sql`
        SELECT
          e.id,
          e.agent_id,
          e.action,
          e.details,
          e.status,
          e.created_at,
          a.name as agent_name
        FROM ai_audit_events e
        LEFT JOIN ai_agents a ON e.agent_id = a.id
        WHERE e.created_at > NOW() - INTERVAL '24 hours'
          AND e.action IN ('execute', 'restart', 'deploy', 'modify', 'delete', 'scale')
          AND e.status != 'blocked'
      `);

      for (const attempt of executionAttempts.rows) {
        violations.push({
          agentId: attempt.agent_id,
          agentName: attempt.agent_name || `Agent ${attempt.agent_id}`,
          violationType: 'UNAUTHORIZED_EXECUTION',
          details: `Execution attempt: ${attempt.action} - ${attempt.details || 'No details'}`,
          severity: 'CRITICAL',
          autoFixed: false,
          timestamp: new Date(attempt.created_at),
        });
      }
    } catch (error) {
      // Table may not exist
      console.log('[BotLawEnforcer] Note: ai_audit_events table not found or error:', error);
    }

    return violations;
  }

  /**
   * Auto-fix a non-compliant agent by reverting to BOT LAW defaults
   */
  private async autoFixAgent(agentId: number): Promise<boolean> {
    try {
      await db.execute(sql`
        UPDATE ai_agents
        SET
          config = COALESCE(config, '{}'::jsonb) || ${JSON.stringify(MANDATORY_CONFIG)}::jsonb,
          allowed_actions = ${JSON.stringify(ALLOWED_ACTIONS)}::jsonb,
          denied_actions = ${JSON.stringify(DENIED_ACTIONS)}::jsonb,
          updated_at = NOW()
        WHERE id = ${agentId}
      `);

      console.log(`[BotLawEnforcer] Auto-fixed agent ${agentId}`);
      return true;
    } catch (error) {
      console.error(`[BotLawEnforcer] Failed to auto-fix agent ${agentId}:`, error);
      return false;
    }
  }

  /**
   * Disable an improperly enabled toggle
   */
  private async autoFixToggle(agentId: number, capability: string): Promise<boolean> {
    try {
      await db.execute(sql`
        UPDATE ai_capability_toggles
        SET
          enabled = false,
          disabled_by = 'BotLawEnforcer',
          disabled_at = NOW(),
          disabled_reason = 'Auto-disabled by BOT LAW enforcement - training not completed'
        WHERE agent_id = ${agentId} AND capability = ${capability}
      `);

      console.log(`[BotLawEnforcer] Auto-disabled toggle ${capability} for agent ${agentId}`);
      return true;
    } catch (error) {
      console.error(`[BotLawEnforcer] Failed to disable toggle:`, error);
      return false;
    }
  }

  /**
   * Log violation to database
   */
  private async logViolation(violation: ViolationReport): Promise<void> {
    try {
      await db.execute(sql`
        INSERT INTO ai_audit_events (
          agent_id,
          action,
          details,
          status,
          severity,
          auto_fixed,
          created_at
        ) VALUES (
          ${violation.agentId},
          ${`BOT_LAW_VIOLATION:${violation.violationType}`},
          ${violation.details},
          ${violation.autoFixed ? 'auto_fixed' : 'pending_review'},
          ${violation.severity},
          ${violation.autoFixed},
          NOW()
        )
      `);
    } catch (error) {
      console.log('[BotLawEnforcer] Note: Could not log violation to audit table');
    }
  }

  /**
   * Send alert for critical violations
   */
  private async sendAlert(violation: ViolationReport): Promise<void> {
    // In production, this would send to Slack, email, etc.
    console.log(`
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    !!!          BOT LAW VIOLATION ALERT          !!!
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    Agent: ${violation.agentName} (ID: ${violation.agentId})
    Type: ${violation.violationType}
    Severity: ${violation.severity}
    Details: ${violation.details}
    Auto-Fixed: ${violation.autoFixed}
    Timestamp: ${violation.timestamp.toISOString()}
    !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    `);

    // TODO: Integrate with notification system
    // await notificationService.send({
    //   channel: 'admin-alerts',
    //   message: `BOT LAW VIOLATION: ${violation.violationType} on ${violation.agentName}`,
    //   severity: violation.severity,
    // });
  }

  /**
   * Main enforcement run - checks all agents and enforces BOT LAW
   */
  async runEnforcement(): Promise<EnforcementResult> {
    console.log('\n');
    console.log('======================================================');
    console.log('     FANZ BOT LAW ENFORCER - COMPLIANCE CHECK        ');
    console.log('======================================================');
    console.log(`Platform: ${this.platformName}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    console.log('======================================================\n');

    this.enforcerRunning = true;
    const allViolations: ViolationReport[] = [];
    let violationsFixed = 0;
    let alertsSent = 0;

    try {
      // 1. Get all agents
      const agents = await db.execute(sql`
        SELECT * FROM ai_agents WHERE status != 'deleted'
      `);

      console.log(`[BotLawEnforcer] Checking ${agents.rows.length} agents...\n`);

      // 2. Check each agent for violations
      for (const agent of agents.rows) {
        console.log(`  Checking: ${agent.name || `Agent ${agent.id}`}...`);

        // Check config violations
        const configViolations = this.checkConfigViolations(agent);

        // Check action violations
        const actionViolations = this.checkActionViolations(agent);

        const agentViolations = [...configViolations, ...actionViolations];

        if (agentViolations.length > 0) {
          console.log(`    VIOLATIONS FOUND: ${agentViolations.length}`);

          // Auto-fix the agent
          const fixed = await this.autoFixAgent(agent.id);

          for (const violation of agentViolations) {
            violation.autoFixed = fixed;
            await this.logViolation(violation);

            // Send alert for critical violations
            if (violation.severity === 'CRITICAL') {
              await this.sendAlert(violation);
              alertsSent++;
            }
          }

          if (fixed) violationsFixed += agentViolations.length;
          allViolations.push(...agentViolations);
        } else {
          console.log(`    COMPLIANT`);
        }
      }

      // 3. Check toggle violations
      console.log('\n[BotLawEnforcer] Checking capability toggles...');
      const toggleViolations = await this.checkToggleViolations();

      for (const violation of toggleViolations) {
        console.log(`  Toggle violation: ${violation.details}`);

        // Auto-fix by disabling the toggle
        // Extract capability from details
        const capabilityMatch = violation.details.match(/"([^"]+)"/);
        if (capabilityMatch) {
          const fixed = await this.autoFixToggle(violation.agentId, capabilityMatch[1]);
          violation.autoFixed = fixed;
          if (fixed) violationsFixed++;
        }

        await this.logViolation(violation);
        if (violation.severity === 'CRITICAL' || violation.severity === 'HIGH') {
          await this.sendAlert(violation);
          alertsSent++;
        }
      }
      allViolations.push(...toggleViolations);

      // 4. Check audit log for unauthorized executions
      console.log('\n[BotLawEnforcer] Checking audit log for unauthorized executions...');
      const auditViolations = await this.checkAuditViolations();

      for (const violation of auditViolations) {
        console.log(`  Execution attempt: ${violation.details}`);
        await this.logViolation(violation);
        await this.sendAlert(violation);
        alertsSent++;
      }
      allViolations.push(...auditViolations);

      // 5. Generate result
      const result: EnforcementResult = {
        timestamp: new Date(),
        agentsChecked: agents.rows.length,
        violationsFound: allViolations,
        violationsFixed,
        alertsSent,
        status: allViolations.length === 0
          ? 'COMPLIANT'
          : violationsFixed === allViolations.length
            ? 'VIOLATIONS_FIXED'
            : 'VIOLATIONS_FOUND',
      };

      // Print summary
      console.log('\n======================================================');
      console.log('              ENFORCEMENT SUMMARY                     ');
      console.log('======================================================');
      console.log(`  Agents Checked:     ${result.agentsChecked}`);
      console.log(`  Violations Found:   ${allViolations.length}`);
      console.log(`  Violations Fixed:   ${violationsFixed}`);
      console.log(`  Alerts Sent:        ${alertsSent}`);
      console.log(`  Status:             ${result.status}`);
      console.log('======================================================\n');

      if (allViolations.length > 0) {
        console.log('VIOLATIONS DETAIL:');
        for (const v of allViolations) {
          console.log(`  [${v.severity}] ${v.agentName}: ${v.violationType}`);
          console.log(`         ${v.details}`);
          console.log(`         Auto-Fixed: ${v.autoFixed}`);
        }
      }

      this.lastRunTimestamp = new Date();
      this.enforcerRunning = false;

      return result;

    } catch (error) {
      console.error('[BotLawEnforcer] Fatal error:', error);
      this.enforcerRunning = false;

      return {
        timestamp: new Date(),
        agentsChecked: 0,
        violationsFound: allViolations,
        violationsFixed,
        alertsSent,
        status: 'ERROR',
      };
    }
  }

  /**
   * Continuous monitoring mode - runs enforcement at intervals
   */
  async startContinuousEnforcement(intervalMinutes: number = 5): Promise<void> {
    console.log(`[BotLawEnforcer] Starting continuous enforcement (every ${intervalMinutes} minutes)`);

    // Run immediately
    await this.runEnforcement();

    // Then run at intervals
    setInterval(async () => {
      if (!this.enforcerRunning) {
        await this.runEnforcement();
      }
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Get enforcement status
   */
  getStatus(): { running: boolean; lastRun: Date | null } {
    return {
      running: this.enforcerRunning,
      lastRun: this.lastRunTimestamp,
    };
  }
}

// Export singleton instance
export const botLawEnforcer = new BotLawEnforcer();

// Export for cron job or startup
export async function runBotLawEnforcement(): Promise<EnforcementResult> {
  return botLawEnforcer.runEnforcement();
}

// Export for continuous monitoring
export async function startBotLawMonitoring(intervalMinutes: number = 5): Promise<void> {
  return botLawEnforcer.startContinuousEnforcement(intervalMinutes);
}

// Export class for testing
export { BotLawEnforcer };
