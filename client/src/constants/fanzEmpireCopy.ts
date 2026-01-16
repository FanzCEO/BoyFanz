/**
 * FANZ EMPIRE - Canonical Copy Constants
 *
 * DO NOT EDIT WITHOUT AUTHORIZATION
 * All copy is locked and canonical.
 */

export const EMPIRE_STRUCTURE = {
  publicName: "FANZ EMPIRE",
  operationalLayer: "FANZ DOMINION",
  infrastructureLayer: "FANZ NEXUS",
  intelligenceLayer: "FANZ NEUROVERSE",
} as const;

export const EMPIRE_AUTH = {
  title: "AUTHORIZATION REQUIRED",
  primaryLine: "Empire access is restricted.",
  secondaryLine: "Additional verification is required to proceed.",
  primaryAction: "Continue",
  secondaryAction: "Use Authorization Key",
  footer: "Authorization uses device security when available. No biometric data is stored.",

  // Password fallback
  passwordTitle: "MANUAL AUTHORIZATION",
  passwordLine: "Confirm identity to enter controlled territory.",
  inputLabel: "Authorization Key",
  inputPlaceholder: "........",
  authorizeAction: "Authorize",
  cancelAction: "Cancel",

  // States
  failureMessage: "Authorization failed.",
  rateLimitMessage: "Authorization temporarily restricted.",
  deviceUnavailable: "Device authorization unavailable.",
  sessionExpired: "Authorization expired.",
  accessDenied: "Access denied.",
  insufficientClearance: "Clearance insufficient.",

  // Success
  identityVerified: "Identity Verified",
  accessGranted: "ACCESS GRANTED",
} as const;

export const EMPIRE_OPENING = {
  entryLine: "You are inside controlled territory.",
  idleMessage: "The system remains operational.",
  idleTimeout: 30000, // 30 seconds

  // Processing state
  processingLines: [
    "FANZ DOMINION - SECURED",
    "ACTIVATED",
    "NEURO LAYER ONLINE",
    "PROPRIETARY SYSTEMS: TRANSMITTING",
  ],
} as const;

export const EMPIRE_MAP = {
  // Level 1 - Empire View
  empireView: {
    activeDomains: "Active domains:",
    operationalServices: "Operational services: 200+",
    failureTolerance: "Failure tolerance: irrelevant",
  },

  // Level 2 - Platform View structures
  platformStructures: [
    "Media Core",
    "Creator Vaults",
    "Payment Rails",
    "Verification Spine",
    "Moderation Engines",
    "Enforcement Nodes",
  ],

  // Level 3 - Function depth
  functionNodes: [
    "Identity Lock",
    "Revenue Isolation",
    "Content Fingerprinting",
    "Audit Memory",
    "Automated Enforcement",
    "Signal Analysis",
  ],

  // Hover states (only these, nothing else)
  hoverStates: {
    operational: "Operational",
    contained: "Contained",
    verified: "Verified",
    autonomous: "Autonomous",
  },
} as const;

export const EMPIRE_SECURE = {
  // One sentence per layer
  layers: [
    "Identity is verified before access exists.",
    "Content is encrypted at rest and in motion.",
    "Revenue flows are isolated by design.",
    "Platforms do not share blast radius.",
    "AI observes continuously. Humans intervene selectively.",
  ],
} as const;

export const EMPIRE_DEFEND = {
  // Text sequence
  sequence: [
    "Unauthorized movement detected.",
    "Fingerprint confirmed.",
    "Response initiated.",
    "No manual action required.",
  ],
  finalLine: "Defense is automatic.",
} as const;

export const EMPIRE_MANIFESTO = {
  lines: [
    { line: "We don't host creators.", continuation: "We grant territory." },
    { line: "Content isn't uploaded here.", continuation: "It is secured." },
    { line: "Revenue is not shared.", continuation: "It is protected." },
    { line: "Safety is not policy.", continuation: "It is architecture." },
    { line: "We didn't disrupt an industry.", continuation: "We replaced its foundation." },
    { line: "Empires don't compete.", continuation: "They expand." },
  ],
} as const;

export const EMPIRE_FOOTER = {
  nexus: "Built on Fanz Nexus",
  neuroverse: "Powered by Fanz Neuroverse",
  empire: "Within Fanz Empire",
  singleLine: "Built on Fanz Nexus · Powered by Fanz Neuroverse · Within Fanz Empire",
} as const;

export const EMPIRE_CEO = {
  line: "I don't fit molds. I melt them down and build empires.",
} as const;

export const EMPIRE_FINAL = {
  maxZoomLine: "Expansion is not optional.",
} as const;

// Platform-specific copy template
export const getPlatformCopy = (platformName: string) => ({
  line1: `${platformName} operates within FANZ EMPIRE.`,
  line2: "Its creators inherit Dominion-grade infrastructure and protection.",
});

// Platforms in the Empire
export const EMPIRE_PLATFORMS = [
  { id: "boyfanz", name: "BoyFanz", domain: "boyfanz.fanz.website", color: "#ef4444" },
  { id: "girlfanz", name: "GirlFanz", domain: "girlfanz.fanz.website", color: "#ec4899" },
  { id: "pupfanz", name: "PupFanz", domain: "pupfanz.fanz.website", color: "#22c55e" },
  { id: "taboofanz", name: "TabooFanz", domain: "taboofanz.fanz.website", color: "#a855f7" },
  { id: "bearfanz", name: "BearFanz", domain: "bearfanz.fanz.website", color: "#38bdf8" },
  { id: "transfanz", name: "TransFanz", domain: "transfanz.fanz.website", color: "#f97316" },
  { id: "daddyfanz", name: "DaddyFanz", domain: "daddyfanz.fanz.website", color: "#f59e0b" },
  { id: "milffanz", name: "MilfFanz", domain: "milffanz.fanz.website", color: "#f43f5e" },
  { id: "cougarfanz", name: "CougarFanz", domain: "cougarfanz.fanz.website", color: "#d946ef" },
  { id: "femmefanz", name: "FemmeFanz", domain: "femmefanz.fanz.website", color: "#8b5cf6" },
  { id: "brofanz", name: "BroFanz", domain: "brofanz.fanz.website", color: "#64748b" },
  { id: "gayfanz", name: "GayFanz", domain: "gayfanz.fanz.website", color: "#14b8a6" },
  { id: "southernfanz", name: "SouthernFanz", domain: "southernfanz.fanz.website", color: "#84cc16" },
] as const;
