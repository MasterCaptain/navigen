/**
 * NAVIGEN Compliance Engine
 * 
 * Evaluates compliance rules based on vessel state, geographic position,
 * activity, and operational context.
 */

import type { RuleCard } from '../types/ruleCard';
import { getActiveAreaIds } from '../data/geoTriggers';

// =====================
// ENGINE INPUT TYPES
// =====================

export interface VesselState {
  lat: number;
  lng: number;
  activity?: string;      // e.g., 'AT_ANCHOR', 'ZODIAC_OPS', 'UNDERWAY'
  audience?: string;      // e.g., 'BRIDGE', 'MASTER', 'EXPEDITION'
  speed?: number;         // knots
  heading?: number;       // degrees
}

export interface ComplianceContext {
  vessel: VesselState;
  ruleCards: RuleCard[];
  activeZones?: string[]; // Pre-computed zones if available (fallback to geo-trigger)
}

// =====================
// ENGINE OUTPUT TYPES
// =====================

export interface ComplianceResult {
  activeRules: RuleCard[];
  reasons: Record<string, string[]>; // ruleId -> array of activation reasons
  stats: {
    totalActive: number;
    mustCount: number;
    shouldCount: number;
    considerCount: number;
  };
}

// =====================
// CORE EVALUATION LOGIC
// =====================

export function evaluateCompliance(context: ComplianceContext): ComplianceResult {
  const { vessel, ruleCards, activeZones } = context;

  // Step 1: Determine active geographic areas
  const geoAreaIds = getActiveAreaIds({ lat: vessel.lat, lng: vessel.lng });
  
  // Merge with pre-computed zones if available
  const allActiveAreas = activeZones 
    ? [...new Set([...geoAreaIds, ...activeZones])]
    : geoAreaIds;

  // Step 2: Evaluate each rule
  const rulesMap = new Map<string, { rule: RuleCard; reasons: string[] }>();

  for (const rule of ruleCards) {
    // Skip inactive rules
    if (rule.status !== 'Active') continue;

    const reasons: string[] = [];

    // Check area applicability
    const areaMatch = checkAreaApplicability(rule, allActiveAreas);
    if (!areaMatch.applies) continue; // Rule not applicable in current areas
    reasons.push(...areaMatch.reasons);

    // Check activity applicability (optional filter)
    if (vessel.activity) {
      const activityMatch = checkActivityApplicability(rule, vessel.activity);
      if (activityMatch) {
        reasons.push(`Activity: ${vessel.activity}`);
      }
    }

    // Check audience applicability (optional filter)
    if (vessel.audience) {
      const audienceMatch = checkAudienceApplicability(rule, vessel.audience);
      if (audienceMatch) {
        reasons.push(`Audience: ${vessel.audience}`);
      }
    }

    // Rule is active - add to map
    rulesMap.set(rule.id, { rule, reasons });
  }

  // Step 3: Extract and sort rules by priority
  const activeRules = Array.from(rulesMap.values())
    .sort((a, b) => {
      const priorityA = a.rule.ui?.priority ?? 0;
      const priorityB = b.rule.ui?.priority ?? 0;
      return priorityB - priorityA; // Descending
    })
    .map(entry => entry.rule);

  // Step 4: Build reasons map
  const reasons: Record<string, string[]> = {};
  for (const [ruleId, entry] of rulesMap.entries()) {
    reasons[ruleId] = entry.reasons;
  }

  // Step 5: Calculate statistics
  const stats = {
    totalActive: activeRules.length,
    mustCount: activeRules.filter(r => r.severity === 'MUST').length,
    shouldCount: activeRules.filter(r => r.severity === 'SHOULD').length,
    considerCount: activeRules.filter(r => r.severity === 'CONSIDER').length,
  };

  return {
    activeRules,
    reasons,
    stats,
  };
}

// =====================
// APPLICABILITY CHECKS
// =====================

interface AreaApplicabilityResult {
  applies: boolean;
  reasons: string[];
}

function checkAreaApplicability(
  rule: RuleCard,
  activeAreas: string[]
): AreaApplicabilityResult {
  const reasons: string[] = [];

  // If rule has no area restrictions, it applies everywhere
  if (!rule.applicability?.areas || rule.applicability.areas.length === 0) {
    reasons.push('Global rule');
    return { applies: true, reasons };
  }

  for (const areaCondition of rule.applicability.areas) {
    const { areaId, condition } = areaCondition;
    const vesselInArea = activeAreas.includes(areaId);

    let conditionMet = false;

    switch (condition) {
      case 'INSIDE':
        conditionMet = vesselInArea;
        if (conditionMet) reasons.push(`Inside ${areaId}`);
        break;
      case 'OUTSIDE':
        conditionMet = !vesselInArea;
        if (conditionMet) reasons.push(`Outside ${areaId}`);
        break;
      case 'INTERSECTS':
        conditionMet = vesselInArea;
        if (conditionMet) reasons.push(`Intersects ${areaId}`);
        break;
    }

    if (conditionMet) {
      return { applies: true, reasons };
    }
  }

  return { applies: false, reasons: [] };
}

function checkActivityApplicability(rule: RuleCard, activity: string): boolean {
  const activityTag = activity.toUpperCase().replace(/\s+/g, '_');
  return rule.ops?.tags?.some(tag => 
    tag.toUpperCase().includes(activityTag)
  ) ?? false;
}

function checkAudienceApplicability(rule: RuleCard, audience: string): boolean {
  if (!rule.ops?.audience || rule.ops.audience.length === 0) {
    return true;
  }

  const audienceUpper = audience.toUpperCase();
  return rule.ops.audience.some(aud => aud.toUpperCase() === audienceUpper);
}

// =====================
// UTILITY FUNCTIONS
// =====================

export function getRuleSummary(result: ComplianceResult): string {
  const { stats } = result;
  const parts: string[] = [];

  if (stats.mustCount > 0) parts.push(`${stats.mustCount} MUST`);
  if (stats.shouldCount > 0) parts.push(`${stats.shouldCount} SHOULD`);
  if (stats.considerCount > 0) parts.push(`${stats.considerCount} CONSIDER`);

  return parts.join(' · ') || 'No active rules';
}

export function filterBySeverity(
  rules: RuleCard[],
  level: 'MUST' | 'SHOULD' | 'CONSIDER' | 'ALL'
): RuleCard[] {
  if (level === 'ALL') return rules;
  return rules.filter(rule => rule.severity === level);
}

export function searchRules(rules: RuleCard[], query: string): RuleCard[] {
  if (!query || query.trim() === '') return rules;

  const q = query.toLowerCase();
  return rules.filter(rule => {
    return (
      rule.ui?.title?.toLowerCase().includes(q) ||
      rule.statement?.toLowerCase().includes(q) ||
      rule.content?.rationale?.toLowerCase().includes(q) ||
      rule.ops?.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  });
}