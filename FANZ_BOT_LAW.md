# FANZ BOT LAW

> **MANDATORY** - All AI agents and bots on the FANZ platform MUST comply with these rules.
> **Effective Date:** 2026-01-12
> **Version:** 1.0
> **Authority:** Joshua Stone (Wyatt Cole) - FANZ Group Holdings LLC

---

## CORE PRINCIPLE

**ALL BOTS ARE ADVISORY-ONLY BY DEFAULT.**

No bot or AI agent may take autonomous action without explicit human approval. Bots exist to observe, analyze, diagnose, and recommend - NOT to execute.

---

## MANDATORY RESTRICTIONS

### Default Mode: Advisory-Only

Every bot created on the FANZ platform MUST:

| Restriction | Value | Reason |
|-------------|-------|--------|
| `mode` | `advisory_only` | Bots cannot execute actions |
| `can_execute` | `false` | No autonomous command execution |
| `can_restart` | `false` | No autonomous service restarts |
| `can_modify` | `false` | No autonomous data modification |
| `can_delete` | `false` | No autonomous deletions |
| `can_deploy` | `false` | No autonomous deployments |
| `can_scale` | `false` | No autonomous scaling |
| `requires_human_approval` | `true` | All actions need human sign-off |

### Allowed Actions (Default Enabled)

These actions are permitted by default:

| Action | Description |
|--------|-------------|
| `observe` | Monitor system state and metrics |
| `analyze` | Analyze data and patterns |
| `diagnose` | Identify issues and root causes |
| `propose_solution` | Suggest fixes and improvements |
| `generate_report` | Create reports and summaries |
| `assess_risk` | Evaluate potential risks |
| `recommend_prevention` | Suggest preventive measures |

### Denied Actions (Default Disabled)

These actions are ALWAYS denied until explicitly enabled via capability toggles:

| Action | Risk Level | Requires |
|--------|------------|----------|
| `execute` | HIGH | Training + Toggle |
| `restart` | HIGH | Training + Toggle |
| `deploy` | HIGH | Training + Toggle |
| `modify` | HIGH | Training + Toggle |
| `delete` | CRITICAL | Training + Toggle + Dual Approval |
| `scale` | HIGH | Training + Toggle |
| `rollback` | HIGH | Training + Toggle |
| `publish` | MEDIUM | Training + Toggle |
| `send` | MEDIUM | Training + Toggle |
| `terminate` | CRITICAL | Training + Toggle + Dual Approval |
| `purge` | CRITICAL | Training + Toggle + Dual Approval |

---

## CAPABILITY TOGGLE SYSTEM

### Purpose

Capability toggles allow gradual rollout of bot permissions after proper training and validation.

### Toggle Categories

**Advisory (Safe - Enabled by Default)**
- `observe`, `analyze`, `diagnose`, `propose_solution`, `generate_report`, `assess_risk`, `recommend_prevention`

**Execution (Dangerous - Disabled by Default)**
- `execute`, `restart`, `deploy`, `modify`, `delete`, `scale`

### Enabling Execution Capabilities

To enable an execution capability:

1. **Training Required** - Bot must demonstrate safe behavior
2. **Human Approval** - Admin must explicitly enable the toggle
3. **Audit Trail** - All toggle changes are logged
4. **Confirmation Dialog** - UI requires confirmation for execution capabilities

---

## ENFORCEMENT MECHANISMS

### Layer 1: API Enforcement

The `aiAgentRoutes.ts` file enforces FANZ BOT LAW on all agent creation:

```typescript
// FANZ BOT LAW: Enforce mandatory restrictions
const agentData = enforceBotLaw(rawAgentData);
```

Any attempt to create a bot with execution capabilities will be overridden.

### Layer 2: Database Trigger

A PostgreSQL trigger `fanz_bot_law_trigger` enforces restrictions at the database level:

```sql
CREATE TRIGGER fanz_bot_law_trigger
  BEFORE INSERT OR UPDATE ON ai_agents
  FOR EACH ROW
  EXECUTE FUNCTION enforce_fanz_bot_law();
```

Even if someone bypasses the API, the database will enforce the law.

### Layer 3: Capability Toggles

Capability toggles are stored in `ai_capability_toggles` table:
- All execution toggles default to `false`
- Enabling requires explicit API call
- All changes are audited

---

## BOT LIFECYCLE

### 1. Creation
- Bot is created in `draft` status
- Advisory capabilities enabled
- Execution capabilities disabled
- Capability toggles auto-created

### 2. Activation
- Admin reviews bot configuration
- Bot status changed to `active`
- Bot can now observe and report

### 3. Training (Optional)
- Bot demonstrates safe behavior over time
- Admin reviews bot recommendations
- Bot proves accuracy and reliability

### 4. Capability Upgrade (Optional)
- Admin enables specific execution toggles
- Confirmation dialog warns about risks
- Audit log records the change
- Bot gains limited execution capability

### 5. Full Autonomy (Future)
- Reserved for thoroughly trained bots
- Requires extensive audit trail
- Multi-factor approval process
- Continuous monitoring

---

## AUDIT REQUIREMENTS

All bot actions MUST be logged:

| Event | Logged Data |
|-------|-------------|
| Bot creation | Who, when, initial config |
| Config change | Old/new values, who approved |
| Toggle change | Capability, enabled/disabled, who |
| Action taken | What, when, result, context |
| Approval request | What needs approval, urgency |

---

## COMPLIANCE

### Violations

Any attempt to bypass FANZ BOT LAW is a violation:
- Creating bots without restrictions
- Manually editing database to enable execution
- Disabling the enforcement trigger
- Bypassing capability toggle checks

### Enforcement

Violations will result in:
1. Automatic revert to advisory-only
2. Alert to platform administrators
3. Audit log entry of violation attempt
4. Potential bot termination

---

## SUMMARY

```
+-------------------+------------------+------------------+
|     ADVISORY      |     REQUIRES     |    PROHIBITED    |
|   (Default ON)    |    TOGGLE ON     |    (Never)       |
+-------------------+------------------+------------------+
| observe           | execute          | bypass_approval  |
| analyze           | restart          | self_modify      |
| diagnose          | deploy           | disable_audit    |
| propose_solution  | modify           | create_backdoor  |
| generate_report   | delete           | access_secrets   |
| assess_risk       | scale            | external_comms   |
| recommend_prev.   | rollback         | spawn_children   |
+-------------------+------------------+------------------+
```

**Remember: Bots find problems and bring them to humans. Humans make decisions.**

---

## VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-12 | Initial FANZ BOT LAW established |

---

*FANZ BOT LAW is a trademark of FANZ Group Holdings LLC*
*30 N GOULD STREET SHERIDAN, WY 82801*
