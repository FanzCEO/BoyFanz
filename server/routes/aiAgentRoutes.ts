/**
 * AI Control Plane Routes for FANZ OS
 * API endpoints for AI Agent Registry, RBAC, Policy, and Audit
 */

import { Router, Request, Response } from 'express';
import { db } from '../db';
import {
  aiAgents,
  aiAgentVersions,
  aiRoles,
  aiAgentRoleBindings,
  aiAuditEvents,
  aiPolicyDecisions,
  aiApprovalTokens
} from '../../shared/schema';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

const router = Router();

// ===== FANZ BOT LAW - MANDATORY ENFORCEMENT =====
// ALL bots MUST start in advisory-only mode
// Execution capabilities require explicit toggle enablement after training

const FANZ_BOT_LAW = {
  // Mandatory configuration for ALL new bots
  mandatoryConfig: {
    mode: 'advisory_only',
    can_execute: false,
    can_restart: false,
    can_modify: false,
    can_delete: false,
    can_deploy: false,
    can_scale: false,
    requires_human_approval: true,
    requires_dual_approval: false,
    outputs: ['diagnostics_report', 'risk_assessment', 'root_cause_analysis', 'proposed_solution', 'prevention_plan'],
  },

  // Only these actions are allowed by default
  allowedActions: ['observe', 'analyze', 'diagnose', 'propose_solution', 'generate_report', 'assess_risk', 'recommend_prevention'],

  // These actions are ALWAYS denied until capability toggle is enabled
  deniedActions: ['execute', 'restart', 'deploy', 'modify', 'delete', 'scale', 'rollback', 'invalidate', 'reencode', 'publish', 'send', 'create', 'update', 'remove', 'terminate', 'purge'],

  // All capabilities that must have toggles created
  allCapabilities: [
    // Advisory (enabled by default)
    { id: 'observe', category: 'advisory', defaultEnabled: true },
    { id: 'analyze', category: 'advisory', defaultEnabled: true },
    { id: 'diagnose', category: 'advisory', defaultEnabled: true },
    { id: 'propose_solution', category: 'advisory', defaultEnabled: true },
    { id: 'generate_report', category: 'advisory', defaultEnabled: true },
    { id: 'assess_risk', category: 'advisory', defaultEnabled: true },
    { id: 'recommend_prevention', category: 'advisory', defaultEnabled: true },
    // Execution (disabled by default - requires training)
    { id: 'execute', category: 'execution', defaultEnabled: false },
    { id: 'restart', category: 'execution', defaultEnabled: false },
    { id: 'deploy', category: 'execution', defaultEnabled: false },
    { id: 'modify', category: 'execution', defaultEnabled: false },
    { id: 'delete', category: 'execution', defaultEnabled: false },
    { id: 'scale', category: 'execution', defaultEnabled: false },
  ],
};

// Helper: Create capability toggles for a new agent
async function createCapabilityTogglesForAgent(agentId: string, createdBy: string = 'system') {
  for (const cap of FANZ_BOT_LAW.allCapabilities) {
    await db.execute(sql`
      INSERT INTO ai_capability_toggles (agent_id, capability, enabled, enabled_at, enabled_by, notes)
      VALUES (
        ${agentId},
        ${cap.id},
        ${cap.defaultEnabled},
        ${cap.defaultEnabled ? new Date() : null},
        ${createdBy},
        ${cap.category === 'advisory' ? 'Advisory capability - safe by default' : 'Execution capability - requires training to enable'}
      )
      ON CONFLICT (agent_id, capability) DO NOTHING
    `);
  }
}

// Helper: Enforce FANZ BOT LAW on agent data
function enforceBotLaw(agentData: any): any {
  return {
    ...agentData,
    // Override any attempts to bypass restrictions
    config: {
      ...agentData.config,
      ...FANZ_BOT_LAW.mandatoryConfig,
    },
    allowedActions: FANZ_BOT_LAW.allowedActions,
    deniedActions: FANZ_BOT_LAW.deniedActions,
    constraints: {
      ...agentData.constraints,
      requires_approval_for_execution: true,
      advisory_only: true,
      no_autonomous_execution: true,
    },
  };
}

// ===== AGENT REGISTRY =====

/**
 * GET /api/ai/agents
 * List all AI agents with optional filters
 */
router.get('/agents', async (req: Request, res: Response) => {
  try {
    const { tier, domain, status, platform } = req.query;

    let query = db.select().from(aiAgents);
    const conditions = [];

    if (tier) conditions.push(eq(aiAgents.tier, tier as string));
    if (domain) conditions.push(eq(aiAgents.domain, domain as string));
    if (status) conditions.push(eq(aiAgents.status, status as string));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const agents = await query.orderBy(desc(aiAgents.updatedAt));

    // Filter by platform if specified
    let filteredAgents = agents;
    if (platform) {
      filteredAgents = agents.filter((agent: any) =>
        agent.platformScopes?.includes(platform) || agent.platformScopes?.length === 0
      );
    }

    res.json(filteredAgents);
  } catch (error) {
    console.error('[AI Agents] Error listing agents:', error);
    res.status(500).json({ error: 'Failed to list agents' });
  }
});

/**
 * POST /api/ai/agents
 * Create a new AI agent
 *
 * FANZ BOT LAW ENFORCED: All new agents start in advisory-only mode
 */
router.post('/agents', async (req: Request, res: Response) => {
  try {
    const rawAgentData = req.body;

    // Validate required fields
    if (!rawAgentData.id || !rawAgentData.name || !rawAgentData.domain) {
      return res.status(400).json({ error: 'Missing required fields: id, name, domain' });
    }

    // Check if agent already exists
    const existing = await db.select().from(aiAgents).where(eq(aiAgents.id, rawAgentData.id));
    if (existing.length > 0) {
      return res.status(409).json({ error: `Agent with id '${rawAgentData.id}' already exists` });
    }

    // FANZ BOT LAW: Enforce mandatory restrictions
    const agentData = enforceBotLaw(rawAgentData);
    console.log(`[FANZ BOT LAW] Enforcing advisory-only mode for new agent: ${agentData.id}`);

    const [newAgent] = await db.insert(aiAgents).values({
      id: agentData.id,
      name: agentData.name,
      description: agentData.description,
      tier: agentData.tier || 'internal',
      domain: agentData.domain,
      status: 'draft', // FANZ BOT LAW: Always start as draft
      purpose: agentData.purpose,
      systemPrompt: agentData.system_prompt || agentData.systemPrompt,
      allowedActions: agentData.allowedActions, // Enforced by FANZ BOT LAW
      deniedActions: agentData.deniedActions, // Enforced by FANZ BOT LAW
      inputs: agentData.inputs || [],
      outputs: agentData.outputs || [],
      platformScopes: agentData.platform_scopes || agentData.platformScopes || [],
      dataScopes: agentData.data_scopes || agentData.dataScopes || [],
      effectScopes: agentData.effect_scopes || agentData.effectScopes || [],
      constraints: agentData.constraints, // Enforced by FANZ BOT LAW
      version: agentData.version || '1.0.0',
      ownerId: agentData.owner_id || agentData.ownerId,
      riskProfile: 'medium', // FANZ BOT LAW: Default to medium risk until trained
    }).returning();

    // FANZ BOT LAW: Create capability toggles for the new agent
    await createCapabilityTogglesForAgent(newAgent.id, (req as any).user?.id || 'system');
    console.log(`[FANZ BOT LAW] Created capability toggles for agent: ${newAgent.id}`);

    // Create initial version snapshot
    await db.insert(aiAgentVersions).values({
      agentId: newAgent.id,
      version: newAgent.version || '1.0.0',
      snapshot: newAgent,
      changeNote: 'Initial creation',
      changedBy: (req as any).user?.id || 'system',
    });

    // Audit log
    await db.insert(aiAuditEvents).values({
      actorType: 'human',
      actorId: (req as any).user?.id || 'system',
      action: 'create_agent',
      resourceType: 'ai_agent',
      resourceId: newAgent.id,
      result: 'allow',
      payloadRedacted: { agentId: newAgent.id, name: newAgent.name },
    });

    res.status(201).json(newAgent);
  } catch (error) {
    console.error('[AI Agents] Error creating agent:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

/**
 * POST /api/ai/agents/bulk
 * Bulk import agents from JSON
 *
 * FANZ BOT LAW ENFORCED: All imported agents start in advisory-only mode
 */
router.post('/agents/bulk', async (req: Request, res: Response) => {
  try {
    const { agents: agentsList } = req.body;

    if (!Array.isArray(agentsList)) {
      return res.status(400).json({ error: 'Expected agents array in request body' });
    }

    console.log(`[FANZ BOT LAW] Bulk import started for ${agentsList.length} agents - enforcing advisory-only mode`);

    const results = { created: [] as string[], skipped: [] as string[], errors: [] as string[] };

    for (const rawAgentData of agentsList) {
      try {
        // Check if exists
        const existing = await db.select().from(aiAgents).where(eq(aiAgents.id, rawAgentData.id));
        if (existing.length > 0) {
          results.skipped.push(rawAgentData.id);
          continue;
        }

        // FANZ BOT LAW: Enforce mandatory restrictions on ALL imported agents
        const agentData = enforceBotLaw(rawAgentData);

        await db.insert(aiAgents).values({
          id: agentData.id,
          name: agentData.name,
          description: agentData.description,
          tier: agentData.tier || 'internal',
          domain: agentData.domain,
          status: 'draft', // FANZ BOT LAW: Always start as draft
          purpose: agentData.purpose,
          systemPrompt: agentData.system_prompt,
          allowedActions: agentData.allowedActions, // Enforced by FANZ BOT LAW
          deniedActions: agentData.deniedActions, // Enforced by FANZ BOT LAW
          inputs: agentData.inputs || [],
          outputs: agentData.outputs || [],
          platformScopes: agentData.platform_scopes || [],
          dataScopes: agentData.data_scopes || [],
          effectScopes: agentData.effect_scopes || [],
          constraints: agentData.constraints, // Enforced by FANZ BOT LAW
          version: '1.0.0',
          riskProfile: 'medium', // FANZ BOT LAW: Default to medium risk
        });

        // FANZ BOT LAW: Create capability toggles for each imported agent
        await createCapabilityTogglesForAgent(agentData.id, (req as any).user?.id || 'system');

        results.created.push(agentData.id);
      } catch (err) {
        results.errors.push(`${rawAgentData.id}: ${(err as Error).message}`);
      }
    }

    console.log(`[FANZ BOT LAW] Bulk import complete: ${results.created.length} created, ${results.skipped.length} skipped`);

    // Audit log for bulk import
    await db.insert(aiAuditEvents).values({
      actorType: 'human',
      actorId: (req as any).user?.id || 'system',
      action: 'bulk_import_agents',
      resourceType: 'ai_agent',
      result: 'allow',
      payloadRedacted: {
        created: results.created.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
    });

    res.json(results);
  } catch (error) {
    console.error('[AI Agents] Error bulk importing agents:', error);
    res.status(500).json({ error: 'Failed to bulk import agents' });
  }
});

/**
 * GET /api/ai/agents/:id
 * Get a specific agent by ID
 */
router.get('/agents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));

    if (!agent) {
      return res.status(404).json({ error: `Agent '${id}' not found` });
    }

    res.json(agent);
  } catch (error) {
    console.error('[AI Agents] Error getting agent:', error);
    res.status(500).json({ error: 'Failed to get agent' });
  }
});

/**
 * PUT /api/ai/agents/:id
 * Update an existing agent
 */
router.put('/agents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [existing] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    if (!existing) {
      return res.status(404).json({ error: `Agent '${id}' not found` });
    }

    // Increment version
    const currentVersion = existing.version || '1.0.0';
    const versionParts = currentVersion.split('.').map(Number);
    versionParts[2]++; // Increment patch version
    const newVersion = versionParts.join('.');

    const [updated] = await db.update(aiAgents)
      .set({
        name: updateData.name ?? existing.name,
        description: updateData.description ?? existing.description,
        tier: updateData.tier ?? existing.tier,
        domain: updateData.domain ?? existing.domain,
        status: updateData.status ?? existing.status,
        purpose: updateData.purpose ?? existing.purpose,
        systemPrompt: updateData.system_prompt ?? updateData.systemPrompt ?? existing.systemPrompt,
        allowedActions: updateData.allowed_actions ?? updateData.allowedActions ?? existing.allowedActions,
        deniedActions: updateData.denied_actions ?? updateData.deniedActions ?? existing.deniedActions,
        inputs: updateData.inputs ?? existing.inputs,
        outputs: updateData.outputs ?? existing.outputs,
        platformScopes: updateData.platform_scopes ?? updateData.platformScopes ?? existing.platformScopes,
        dataScopes: updateData.data_scopes ?? updateData.dataScopes ?? existing.dataScopes,
        effectScopes: updateData.effect_scopes ?? updateData.effectScopes ?? existing.effectScopes,
        constraints: updateData.constraints ?? existing.constraints,
        version: newVersion,
        riskProfile: updateData.risk_profile ?? updateData.riskProfile ?? existing.riskProfile,
        updatedAt: new Date(),
      })
      .where(eq(aiAgents.id, id))
      .returning();

    // Create version snapshot
    await db.insert(aiAgentVersions).values({
      agentId: id,
      version: newVersion,
      snapshot: updated,
      changeNote: updateData.changeNote || 'Configuration update',
      changedBy: (req as any).user?.id || 'system',
    });

    // Audit log
    await db.insert(aiAuditEvents).values({
      actorType: 'human',
      actorId: (req as any).user?.id || 'system',
      action: 'update_agent',
      resourceType: 'ai_agent',
      resourceId: id,
      result: 'allow',
      payloadRedacted: { agentId: id, newVersion },
    });

    res.json(updated);
  } catch (error) {
    console.error('[AI Agents] Error updating agent:', error);
    res.status(500).json({ error: 'Failed to update agent' });
  }
});

/**
 * DELETE /api/ai/agents/:id
 * Disable an agent (soft delete - sets status to disabled)
 */
router.delete('/agents/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [existing] = await db.select().from(aiAgents).where(eq(aiAgents.id, id));
    if (!existing) {
      return res.status(404).json({ error: `Agent '${id}' not found` });
    }

    await db.update(aiAgents)
      .set({ status: 'disabled', updatedAt: new Date() })
      .where(eq(aiAgents.id, id));

    // Audit log
    await db.insert(aiAuditEvents).values({
      actorType: 'human',
      actorId: (req as any).user?.id || 'system',
      action: 'disable_agent',
      resourceType: 'ai_agent',
      resourceId: id,
      result: 'allow',
    });

    res.status(204).send();
  } catch (error) {
    console.error('[AI Agents] Error disabling agent:', error);
    res.status(500).json({ error: 'Failed to disable agent' });
  }
});

// ===== ROLES & RBAC =====

/**
 * GET /api/ai/roles
 * List all roles
 */
router.get('/roles', async (_req: Request, res: Response) => {
  try {
    const roles = await db.select().from(aiRoles).orderBy(aiRoles.name);
    res.json(roles);
  } catch (error) {
    console.error('[AI Roles] Error listing roles:', error);
    res.status(500).json({ error: 'Failed to list roles' });
  }
});

/**
 * POST /api/ai/roles
 * Create a new role
 */
router.post('/roles', async (req: Request, res: Response) => {
  try {
    const roleData = req.body;

    if (!roleData.id || !roleData.name) {
      return res.status(400).json({ error: 'Missing required fields: id, name' });
    }

    const [newRole] = await db.insert(aiRoles).values({
      id: roleData.id,
      name: roleData.name,
      description: roleData.description,
      permissions: roleData.permissions || [],
      constraints: roleData.constraints || {},
      environment: roleData.environment || 'prod',
    }).returning();

    res.status(201).json(newRole);
  } catch (error) {
    console.error('[AI Roles] Error creating role:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
});

/**
 * GET /api/ai/roles/:id
 * Get a specific role
 */
router.get('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [role] = await db.select().from(aiRoles).where(eq(aiRoles.id, id));

    if (!role) {
      return res.status(404).json({ error: `Role '${id}' not found` });
    }

    res.json(role);
  } catch (error) {
    console.error('[AI Roles] Error getting role:', error);
    res.status(500).json({ error: 'Failed to get role' });
  }
});

/**
 * PUT /api/ai/roles/:id
 * Update a role
 */
router.put('/roles/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const [updated] = await db.update(aiRoles)
      .set({
        name: updateData.name,
        description: updateData.description,
        permissions: updateData.permissions,
        constraints: updateData.constraints,
        environment: updateData.environment,
        updatedAt: new Date(),
      })
      .where(eq(aiRoles.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: `Role '${id}' not found` });
    }

    res.json(updated);
  } catch (error) {
    console.error('[AI Roles] Error updating role:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

// ===== AGENT-ROLE BINDINGS =====

/**
 * POST /api/ai/bindings
 * Bind an agent to a role
 */
router.post('/bindings', async (req: Request, res: Response) => {
  try {
    const { agent_id, role_id, expires_at } = req.body;

    if (!agent_id || !role_id) {
      return res.status(400).json({ error: 'Missing required fields: agent_id, role_id' });
    }

    await db.insert(aiAgentRoleBindings).values({
      agentId: agent_id,
      roleId: role_id,
      expiresAt: expires_at ? new Date(expires_at) : null,
      grantedBy: (req as any).user?.id || 'system',
    });

    res.status(204).send();
  } catch (error) {
    console.error('[AI Bindings] Error creating binding:', error);
    res.status(500).json({ error: 'Failed to create binding' });
  }
});

/**
 * GET /api/ai/bindings/:agentId
 * Get all role bindings for an agent
 */
router.get('/bindings/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const bindings = await db.select()
      .from(aiAgentRoleBindings)
      .where(eq(aiAgentRoleBindings.agentId, agentId));

    res.json(bindings);
  } catch (error) {
    console.error('[AI Bindings] Error getting bindings:', error);
    res.status(500).json({ error: 'Failed to get bindings' });
  }
});

// ===== POLICY DECISION =====

/**
 * POST /api/ai/policy/decide
 * Evaluate policy + RBAC for an agent action
 */
router.post('/policy/decide', async (req: Request, res: Response) => {
  try {
    const { agent_id, action, resource, platform, tier, subject_id, context } = req.body;

    if (!agent_id || !action || !resource || !platform || !tier) {
      return res.status(400).json({
        error: 'Missing required fields: agent_id, action, resource, platform, tier'
      });
    }

    // Get agent
    const [agent] = await db.select().from(aiAgents).where(eq(aiAgents.id, agent_id));
    if (!agent) {
      return res.status(404).json({ error: `Agent '${agent_id}' not found` });
    }

    // Get agent's role bindings
    const bindings = await db.select()
      .from(aiAgentRoleBindings)
      .where(eq(aiAgentRoleBindings.agentId, agent_id));

    // Get all bound roles
    const roleIds = bindings.map(b => b.roleId);
    const roles = roleIds.length > 0
      ? await db.select().from(aiRoles).where(sql`${aiRoles.id} = ANY(${roleIds})`)
      : [];

    // Evaluate permissions
    const matchedRules: string[] = [];
    const violatedConstraints: string[] = [];
    const effectivePermissions: string[] = [];
    let allow = false;

    // Check if action is explicitly denied
    const deniedActions = (agent.deniedActions as string[]) || [];
    if (deniedActions.includes(action)) {
      violatedConstraints.push(`Action '${action}' is explicitly denied for this agent`);
    }

    // Check if action is allowed
    const allowedActions = (agent.allowedActions as string[]) || [];
    if (allowedActions.includes(action) || allowedActions.includes('*')) {
      matchedRules.push(`Agent allowed_actions includes '${action}'`);
      allow = true;
    }

    // Check RBAC permissions
    for (const role of roles) {
      const permissions = (role.permissions as string[]) || [];
      const permissionKey = `${resource}:${action}`;
      if (permissions.includes(permissionKey) || permissions.includes(`${resource}:*`)) {
        matchedRules.push(`Role '${role.name}' grants '${permissionKey}'`);
        effectivePermissions.push(permissionKey);
        allow = true;
      }
    }

    // Check constraints
    const constraints = (agent.constraints as Record<string, any>) || {};
    if (constraints.requires_approval_for_execution && tier === 'high_risk') {
      violatedConstraints.push('High-risk action requires approval token');
      allow = false;
    }

    // If still denied, check denied actions
    if (violatedConstraints.length > 0) {
      allow = false;
    }

    // Record decision
    const [decision] = await db.insert(aiPolicyDecisions).values({
      agentId: agent_id,
      action,
      resource,
      platform,
      tier: tier as any,
      subjectId: subject_id,
      context: context || {},
      allow,
      matchedRules,
      violatedConstraints,
      effectivePermissions,
    }).returning();

    // Audit log
    await db.insert(aiAuditEvents).values({
      actorType: 'agent',
      actorId: agent_id,
      action,
      resourceType: resource.split('/')[0],
      resourceId: subject_id,
      platform,
      result: allow ? 'allow' : 'deny',
      decisionId: decision.id,
      matchedRules,
      violatedConstraints,
    });

    res.json({
      decision_id: decision.id,
      allow,
      matched_rules: matchedRules,
      violated_constraints: violatedConstraints,
      obligations: allow ? [{ type: 'audit', event: 'action_executed' }] : [],
      effective_permissions: effectivePermissions,
    });
  } catch (error) {
    console.error('[AI Policy] Error evaluating policy:', error);
    res.status(500).json({ error: 'Failed to evaluate policy' });
  }
});

// ===== AUDIT EVENTS =====

/**
 * GET /api/ai/audit/events
 * Query audit events
 */
router.get('/audit/events', async (req: Request, res: Response) => {
  try {
    const {
      time_min, time_max, actor_type, actor_id, action,
      platform, decision_id, correlation_id, limit = '100'
    } = req.query;

    let query = db.select().from(aiAuditEvents);
    const conditions = [];

    if (time_min) conditions.push(gte(aiAuditEvents.time, new Date(time_min as string)));
    if (time_max) conditions.push(lte(aiAuditEvents.time, new Date(time_max as string)));
    if (actor_type) conditions.push(eq(aiAuditEvents.actorType, actor_type as any));
    if (actor_id) conditions.push(eq(aiAuditEvents.actorId, actor_id as string));
    if (action) conditions.push(eq(aiAuditEvents.action, action as string));
    if (platform) conditions.push(eq(aiAuditEvents.platform, platform as string));
    if (decision_id) conditions.push(eq(aiAuditEvents.decisionId, decision_id as string));
    if (correlation_id) conditions.push(eq(aiAuditEvents.correlationId, correlation_id as string));

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const events = await query
      .orderBy(desc(aiAuditEvents.time))
      .limit(parseInt(limit as string));

    res.json(events);
  } catch (error) {
    console.error('[AI Audit] Error querying events:', error);
    res.status(500).json({ error: 'Failed to query audit events' });
  }
});

// ===== CAPABILITY TOGGLES =====

/**
 * GET /api/ai-control/toggles/:agentId
 * Get all capability toggles for an agent
 */
router.get('/toggles/:agentId', async (req: Request, res: Response) => {
  try {
    const { agentId } = req.params;

    const toggles = await db.execute(sql`
      SELECT id, agent_id, capability, enabled, enabled_at, enabled_by, notes
      FROM ai_capability_toggles
      WHERE agent_id = ${agentId}
      ORDER BY capability
    `);

    res.json(toggles.rows);
  } catch (error) {
    console.error('[AI Toggles] Error getting toggles:', error);
    res.status(500).json({ error: 'Failed to get capability toggles' });
  }
});

/**
 * PUT /api/ai-control/toggles/:agentId/:capability
 * Enable or disable a capability for an agent
 */
router.put('/toggles/:agentId/:capability', async (req: Request, res: Response) => {
  try {
    const { agentId, capability } = req.params;
    const { enabled, notes } = req.body;

    if (typeof enabled !== 'boolean') {
      return res.status(400).json({ error: 'enabled must be a boolean' });
    }

    // Upsert the toggle
    const result = await db.execute(sql`
      INSERT INTO ai_capability_toggles (agent_id, capability, enabled, enabled_at, enabled_by, notes)
      VALUES (${agentId}, ${capability}, ${enabled}, ${enabled ? new Date() : null}, ${(req as any).user?.id || 'admin'}, ${notes || null})
      ON CONFLICT (agent_id, capability)
      DO UPDATE SET
        enabled = ${enabled},
        enabled_at = ${enabled ? new Date() : null},
        enabled_by = ${(req as any).user?.id || 'admin'},
        notes = COALESCE(${notes || null}, ai_capability_toggles.notes)
      RETURNING *
    `);

    // Audit log
    await db.insert(aiAuditEvents).values({
      actorType: 'human',
      actorId: (req as any).user?.id || 'admin',
      action: enabled ? 'enable_capability' : 'disable_capability',
      resourceType: 'ai_capability_toggle',
      resourceId: `${agentId}:${capability}`,
      result: 'allow',
      payloadRedacted: { agentId, capability, enabled },
    });

    res.json(result.rows[0]);
  } catch (error) {
    console.error('[AI Toggles] Error updating toggle:', error);
    res.status(500).json({ error: 'Failed to update capability toggle' });
  }
});

/**
 * GET /api/ai-control/toggles
 * Get all capability toggles for all agents
 */
router.get('/toggles', async (_req: Request, res: Response) => {
  try {
    const toggles = await db.execute(sql`
      SELECT id, agent_id, capability, enabled, enabled_at, enabled_by, notes
      FROM ai_capability_toggles
      ORDER BY agent_id, capability
    `);

    res.json(toggles.rows);
  } catch (error) {
    console.error('[AI Toggles] Error getting all toggles:', error);
    res.status(500).json({ error: 'Failed to get capability toggles' });
  }
});

export default router;
