import React, { useMemo, useState } from "react";
import { getRulesForModule, Rule, SVALBARD_PROTECTED_AREA_RULES } from "../data/rulesets";
import { PolarCodeSelectorDropdown } from "../components/PolarCodeSelectorDropdown";
import { Maximize2, X, Ship } from "lucide-react";
import { RuleDetailsModal } from "../components/RuleDetailsModal";
import { RuleCard as RuleCardType } from "../types/ruleCard";
import type { PlannedOp } from "../types/plannedOps";
import { REGULATORY_POLYGONS } from "../data/geoTriggers";
import { ModuleSwitcher } from "../components/ModuleSwitcher";
import type { VesselProfile } from "../components/SettingsDialog";

type Level = Rule["level"];

const LEVEL_ORDER: Record<Level, number> = { MUST: 0, SHOULD: 1, CONSIDER: 2 };

// Helper function to get protected area name from ID
function getProtectedAreaName(areaId: string): string {
  const polygon = REGULATORY_POLYGONS.find(p => p.id === areaId);
  return polygon?.name || areaId;
}

// Convert simple Rule to rich RuleCard for modal display
function ruleToRuleCard(rule: Rule): RuleCardType {
  return {
    id: rule.id,
    version: "1.0.0",
    status: "Active",
    severity: rule.level as RuleCardType['severity'],
    statement: rule.text,
    authority: {
      regime: rule.source === 'IMO' ? 'IMO' : rule.source === 'SOLAS' ? 'IMO' : 'National',
      instrument: rule.source,
      reference: rule.source
    },
    applicability: {
      areas: [],
      vessel: { type: ["ANY"], iceClass: ["ANY"], flag: ["ANY"] },
      time: { start: null, end: null, season: null }
    },
    content: {
      rationale: rule.text,
      actions: [],
      exceptions: [],
      links: [],
      fullText: getFullRegulatoryText(rule),
      procedures: getProcedures(rule),
      complianceChecklist: getComplianceChecklist(rule),
      documentation: getDocumentation(rule)
    },
    ops: {
      audience: ["BRIDGE", "MASTER"],
      module: "COMPLIANCE",
      tags: rule.tags || []
    },
    ui: {
      title: rule.title,
      compact: true,
      suppressible: false,
      priority: 500
    },
    metadata: {
      createdBy: "NAVIGEN",
      createdAt: "2026-03-01T00:00:00Z",
      updatedAt: "2026-03-01T00:00:00Z"
    }
  };
}

// Generate full regulatory text based on source and rule type
function getFullRegulatoryText(rule: Rule): string {
  // For COLREG lookout rule
  if (rule.id === 'colreg-lookout' || (rule.source === 'IMO' && rule.title.includes('lookout'))) {
    return `COLREG 1972 - RULE 5: LOOK-OUT

Every vessel shall at all times maintain a proper look-out by sight and hearing as well as by all available means appropriate in the prevailing circumstances and conditions so as to make a full appraisal of the situation and of the risk of collision.

INTERPRETATION AND APPLICATION:
The look-out must be maintained continuously, regardless of:
- Visibility conditions (clear weather, fog, rain, snow)
- Traffic density (open ocean, coastal waters, congested areas)
- Time of day (daylight, darkness)
- Presence of navigational equipment (radar, AIS, ECDIS)

The look-out serves multiple purposes:
1. Detection of other vessels and potential collision risks
2. Identification of navigational hazards (rocks, shoals, wrecks)
3. Monitoring of meteorological conditions
4. Observation of aids to navigation (lights, buoys, beacons)

A proper look-out requires:
- Visual observation by sight
- Audible awareness (sound signals, engine noise)
- Use of all available technical means (radar, AIS, ECDIS, VHF)
- Continuous assessment of the situation
- Full appraisal of collision risk`;
  }

  // For SOLAS safety rules
  if (rule.source === 'SOLAS') {
    return `SOLAS CHAPTER V - SAFETY OF NAVIGATION
${rule.title}

${rule.text}

APPLICATION:
This regulation applies to all ships on international voyages and requires compliance with established safety procedures and equipment standards.

Ships must ensure that:
- All navigational equipment is properly maintained and operational
- Crew are trained and competent in equipment use
- Proper watch procedures are followed at all times
- Safety management systems are implemented and followed`;
  }

  // For MARPOL discharge rules
  if (rule.source === 'MARPOL' && rule.title.toLowerCase().includes('discharge')) {
    return `MARPOL REGULATIONS - DISCHARGE RESTRICTIONS
${rule.title}

${rule.text}

COMPLIANCE REQUIREMENTS:
1. Position Verification: Confirm vessel position and distance from nearest land/ice shelf
2. Special Areas: Check if operating in MARPOL special area with enhanced restrictions
3. Equipment: Ensure oil content monitor (for oil) or other required equipment is operational
4. Recording: All discharges must be recorded in appropriate record book
5. Crew Training: All crew must understand discharge restrictions for the area

SPECIAL AREAS:
MARPOL designates certain sea areas as "special areas" where discharge restrictions are more stringent due to environmental sensitivity. These include:
- Antarctic area (south of 60°S)
- Baltic Sea
- Mediterranean Sea
- Black Sea
- Red Sea
- Gulfs area
- North Sea
- Wider Caribbean Region`;
  }

  // For Svalbardmiljøvernloven rules
  if (rule.source === 'Svalbardmiljøvernloven') {
    return `SVALBARD ENVIRONMENTAL PROTECTION ACT
${rule.title}

${rule.text}

BACKGROUND:
The Svalbard Environmental Protection Act (Svalbardmiljøvernloven) establishes special environmental protection measures for the Svalbard archipelago due to its unique and vulnerable Arctic ecosystem.

KEY PRINCIPLES:
1. Zero Discharge Policy: No discharge of pollutants permitted in most areas
2. Precautionary Approach: When in doubt, the most protective measures apply
3. Protected Areas: National parks and nature reserves have additional restrictions
4. Enforcement: Norwegian authorities actively monitor and enforce compliance

PENALTIES:
Violations may result in:
- Fines up to substantial amounts
- Vessel detention
- Criminal prosecution for serious violations
- Liability for environmental cleanup costs`;
  }

  // For IAATO guidelines
  if (rule.source === 'IAATO') {
    return `IAATO OPERATIONAL GUIDELINE
${rule.title}

${rule.text}

BACKGROUND:
The International Association of Antarctica Tour Operators (IAATO) has established comprehensive operational guidelines to ensure responsible tourism in Antarctica and Arctic regions.

COMPLIANCE:
These guidelines represent industry best practices and are:
- Mandatory for all IAATO member operators
- Based on Antarctic Treaty System requirements
- Regularly updated based on scientific research
- Enforced through member self-regulation and monitoring

IMPLEMENTATION:
Operators must:
- Brief all staff and passengers on guidelines before each landing
- Monitor compliance during all operations
- Report any violations or incidents to IAATO
- Maintain records of all landing activities`;
  }

  // For Polar Code rules
  if (rule.source === 'Polar Code' || rule.source === 'IMO Polar Code') {
    return `IMO POLAR CODE REQUIREMENT
${rule.title}

${rule.text}

APPLICABILITY:
The International Code for Ships Operating in Polar Waters (Polar Code) is mandatory under SOLAS and MARPOL for ships operating in Arctic waters (north of 60°N) and Antarctic waters (south of 60°S).

SHIP CATEGORIES:
- Category A: Year-round operation in polar waters including medium first-year ice
- Category B: Summer/autumn operation in polar waters including thin first-year ice  
- Category C: Operation in open water or less severe ice conditions

COMPLIANCE DOCUMENTATION:
Ships must carry:
- Polar Ship Certificate
- Polar Water Operational Manual (PWOM)
- Evidence of crew polar training
- Ice navigator qualifications (where required)`;
  }

  // For protected area specific rules
  if (rule.tags?.includes('protected-area') || rule.tags?.includes('national-park')) {
    return `PROTECTED AREA REGULATION
${rule.title}

${rule.text}

PROTECTED AREA STATUS:
This rule applies specifically to designated protected areas including national parks, nature reserves, and bird sanctuaries.

These areas are protected under:
- Svalbard Environmental Protection Act
- Specific area protection regulations
- International conservation agreements

Activities in protected areas require special consideration and may require advance permits or notifications to Norwegian authorities.`;
  }

  // Generic fallback for other rules - just use the rule text itself
  return `${rule.source} - ${rule.title}

${rule.text}

This regulation is part of the ${rule.source} regulatory framework and applies to maritime operations in applicable areas.`;
}

// Generate procedures based on rule type
function getProcedures(rule: Rule): string[] {
  if (rule.title.includes('COLREG') || rule.title.includes('lookout')) {
    return [
      "Designate a dedicated lookout when traffic density or conditions warrant",
      "Ensure bridge team maintains visual and audible awareness at all times",
      "Use radar, AIS, and ECDIS to supplement visual lookout",
      "Monitor VHF Channel 16 and relevant traffic channels",
      "Brief all bridge watchkeepers on lookout responsibilities during handover",
      "Adjust lookout procedures based on visibility, traffic, and navigational complexity"
    ];
  }
  
  if (rule.title.includes('discharge') || rule.title.includes('MARPOL')) {
    return [
      "Verify vessel position and distance from nearest land before any discharge",
      "Check applicability of special area restrictions",
      "Ensure oil content monitor is operational and calibrated",
      "Record all discharges in Oil Record Book / Garbage Record Book",
      "Brief crew on MARPOL discharge restrictions for the operational area",
      "Maintain segregated garbage storage as per MARPOL categories"
    ];
  }
  
  if (rule.source === 'Svalbardmiljøvernloven') {
    return [
      "Review Svalbard environmental regulations before entering the protection zone",
      "Ensure zero discharge policy is understood by all crew",
      "Verify garbage retention capacity is sufficient for the voyage",
      "Confirm sewage treatment plant is operational or holding tank has capacity",
      "Brief expedition staff and passengers on environmental restrictions",
      "Monitor compliance throughout the stay in Svalbard waters"
    ];
  }
  
  return [
    `Review ${rule.source} requirements for compliance`,
    "Verify vessel equipment and documentation meets requirements",
    "Brief crew on specific obligations under this regulation",
    "Monitor ongoing compliance throughout operations"
  ];
}

// Generate compliance checklist
function getComplianceChecklist(rule: Rule): string[] {
  const source = rule.source.toUpperCase();
  const baseChecklist = [
    `${source} regulatory requirements reviewed and understood`,
    `Crew briefed on ${rule.title} obligations`,
    "Vessel equipment operational and verified",
    "Documentation on board and accessible"
  ];
  
  if (rule.title.includes('lookout')) {
    return [
      ...baseChecklist,
      "Proper lookout assigned and alert",
      "Radar operational and monitored",
      "AIS operational and monitored",
      "VHF radio monitored on appropriate channels",
      "Bridge team fully aware of traffic situation"
    ];
  }
  
  if (rule.title.includes('discharge')) {
    return [
      ...baseChecklist,
      "Vessel position verified (distance from land)",
      "Special area restrictions checked",
      "Oil content monitor operational",
      "Oil Record Book / Garbage Record Book up to date",
      "No prohibited items being discharged"
    ];
  }
  
  if (rule.source === 'Svalbardmiljøvernloven') {
    return [
      ...baseChecklist,
      "Zero discharge policy confirmed for Svalbard",
      "Garbage retention capacity sufficient",
      "Sewage system set to retention mode",
      "All crew and passengers briefed",
      "Environmental compliance monitored"
    ];
  }
  
  return baseChecklist;
}

// Generate required documentation
function getDocumentation(rule: Rule): string[] {
  const commonDocs = [
    "Certificate of registry",
    "Safety management certificate (ISM)",
    "Crew certificates and endorsements"
  ];
  
  if (rule.title.includes('discharge') || rule.source === 'MARPOL') {
    return [
      ...commonDocs,
      "IOPP Certificate (International Oil Pollution Prevention)",
      "Oil Record Book Part I and II",
      "Garbage Management Plan",
      "Garbage Record Book",
      "Sewage system approved drawings"
    ];
  }
  
  if (rule.source === 'Svalbardmiljøvernloven') {
    return [
      ...commonDocs,
      "Svalbard entry permit (if required)",
      "Environmental compliance plan",
      "Waste management plan specific to Svalbard",
      "Evidence of sewage retention capability"
    ];
  }
  
  return commonDocs;
}

function includesText(rule: Rule, q: string) {
  const s = (rule.title + " " + rule.text + " " + rule.source).toLowerCase();
  return s.includes(q.toLowerCase());
}

interface RulesModuleProps {
  zone: string;
  activity: string;
  polarCode: string;
  onPolarCodeChange: (code: string) => void;
  onClose?: () => void;
  plannedOps?: PlannedOp[];
  selectedProtectedArea?: string | null;
  onSelectedProtectedAreaChange?: (areaId: string | null) => void;
  activeModule: string;
  onSwitchModule: (module: string | null) => void;
  vesselProfile?: VesselProfile;
}

export default function RulesModule({ zone, activity, polarCode, onPolarCodeChange, onClose, plannedOps = [], selectedProtectedArea, onSelectedProtectedAreaChange, activeModule, onSwitchModule, vesselProfile }: RulesModuleProps) {
  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<Record<Level, boolean>>({
    MUST: true,
    SHOULD: true,
    CONSIDER: true,
  });
  const [sourceFilter, setSourceFilter] = useState<Record<string, boolean>>({});

  // DEBUG: Log what zone, activity we receive
  console.log('🔍 RULES MODULE RECEIVED:', { zone, activity, plannedOps });

  const rawRules = useMemo(() => {
    const rules = getRulesForModule(zone, activity, plannedOps);
    console.log('📋 RAW RULES FROM getRulesForModule:', rules.length, rules);
    return rules;
  }, [zone, activity, plannedOps]);

  // Get Svalbard protected area rules if in Svalbard zone
  const svalbardProtectedRules = useMemo(() => {
    // Check if we're in any Svalbard-related zone
    const inSvalbard = zone.includes('SVALBARD') || 
                       zone.includes('SVALBARD_12NM') || 
                       zone.includes('SVALBARD_PROTECTED');
    
    if (!inSvalbard) return [];
    
    // If a specific protected area is selected, only show rules for that area
    if (selectedProtectedArea) {
      const specificRules = SVALBARD_PROTECTED_AREA_RULES[selectedProtectedArea] || [];
      
      // Also include general national park rules if applicable
      const generalRules = selectedProtectedArea.includes('NASJONALPARK') || 
                          selectedProtectedArea.startsWith('PROTECTED_') 
                            ? SVALBARD_PROTECTED_AREA_RULES['NASJONALPARK'] || []
                            : [];
      
      return [...specificRules, ...generalRules];
    }
    
    // Otherwise, show all protected area rules
    const allProtectedRules: Rule[] = [];
    
    // Add general national park rules
    if (SVALBARD_PROTECTED_AREA_RULES['NASJONALPARK']) {
      allProtectedRules.push(...SVALBARD_PROTECTED_AREA_RULES['NASJONALPARK']);
    }
    
    // Add specific protected area rules
    Object.entries(SVALBARD_PROTECTED_AREA_RULES).forEach(([areaId, rules]) => {
      if (areaId !== 'NASJONALPARK') {
        allProtectedRules.push(...rules);
      }
    });
    
    return allProtectedRules;
  }, [zone, selectedProtectedArea]);

  // Combine regular rules with protected area rules
  const allRules = useMemo(() => {
    // If a specific protected area is selected, ONLY show those rules
    if (selectedProtectedArea) {
      return svalbardProtectedRules;
    }
    // Otherwise, show all rules
    return [...rawRules, ...svalbardProtectedRules];
  }, [rawRules, svalbardProtectedRules, selectedProtectedArea]);

  const sources = useMemo(() => {
    const uniq = Array.from(new Set(allRules.map(r => r.source))).sort();
    return uniq;
  }, [allRules]);

  // init source filter (keep existing toggles)
  React.useEffect(() => {
    setSourceFilter(prev => {
      const next: Record<string, boolean> = { ...prev };
      for (const s of sources) if (next[s] === undefined) next[s] = true;
      // remove dead sources
      for (const k of Object.keys(next)) if (!sources.includes(k)) delete next[k];
      return next;
    });
  }, [sources]);

  const filtered = useMemo(() => {
    return allRules
      .filter(r => levelFilter[r.level])
      .filter(r => sourceFilter[r.source] ?? true)
      .filter(r => (query.trim() ? includesText(r, query.trim()) : true))
      .sort((a, b) => LEVEL_ORDER[a.level] - LEVEL_ORDER[b.level]);
  }, [allRules, levelFilter, sourceFilter, query]);

  const counts = useMemo(() => {
    const c = { MUST: 0, SHOULD: 0, CONSIDER: 0 };
    for (const r of filtered) c[r.level]++;
    return c;
  }, [filtered]);

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a1628", color: "#e2e8f0" }}>
      {/* Topbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid rgba(6, 182, 212, 0.2)", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, letterSpacing: 1, color: "#06b6d4" }}>NAVIGEN</div>
        
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", color: "#06b6d4", fontWeight: 700 }}>
          {zone}
        </div>
        
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", color: "#06b6d4", fontWeight: 700 }}>
          {activity}
        </div>

        <div style={{ marginLeft: "auto" }}>
          <PolarCodeSelectorDropdown value={polarCode} onChange={onPolarCodeChange} />
        </div>

        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search rules…"
          style={{ 
            width: 300,
            padding: 10, 
            borderRadius: 12, 
            border: "1px solid rgba(71, 85, 105, 0.6)",
            background: "rgba(15, 23, 42, 0.95)",
            color: "#e2e8f0"
          }}
        />
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.6)",
              color: "#ef4444",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            }}
          >
            CLOSE
          </button>
        )}
      </div>

      {/* Protected Area Focus Banner */}
      {selectedProtectedArea && onSelectedProtectedAreaChange && (
        <div style={{
          padding: "16px 20px",
          background: "linear-gradient(135deg, rgba(6, 182, 212, 0.25) 0%, rgba(14, 165, 233, 0.20) 100%)",
          borderBottom: "2px solid rgba(6, 182, 212, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
          boxShadow: "0 4px 12px rgba(6, 182, 212, 0.15)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "rgba(6, 182, 212, 0.2)",
              border: "2px solid rgba(6, 182, 212, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#06b6d4", letterSpacing: 0.8, textTransform: "uppercase" }}>
                {getProtectedAreaName(selectedProtectedArea)}
              </div>
              <div style={{ fontSize: 13, color: "#cbd5e1", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ 
                  display: "inline-block", 
                  width: 6, 
                  height: 6, 
                  borderRadius: "50%", 
                  background: "#06b6d4",
                  animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                }}></span>
                Showing {filtered.length} area-specific rule{filtered.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <button
            onClick={() => {
              onSelectedProtectedAreaChange(null);
            }}
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              background: "rgba(6, 182, 212, 0.2)",
              border: "2px solid rgba(6, 182, 212, 0.6)",
              color: "#06b6d4",
              fontWeight: 800,
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              fontSize: 14,
              letterSpacing: 0.5
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(6, 182, 212, 0.35)";
              e.currentTarget.style.transform = "translateX(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
              e.currentTarget.style.transform = "translateX(0)";
            }}
          >
            ← VIEW ALL RULES
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", padding: "16px 16px 16px", flexShrink: 0 }}>
        {zone.includes('SVALBARD') && svalbardProtectedRules.length > 0 && (
          <div style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "2px solid rgba(34, 197, 94, 0.6)",
            background: "rgba(34, 197, 94, 0.15)",
            fontWeight: 700,
            fontSize: 12,
            color: "#22c55e",
            display: "flex",
            alignItems: "center",
            gap: 6,
            width: "100%",
            marginBottom: 8
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            <span>SVALBARD PROTECTED AREAS: {svalbardProtectedRules.length} rules from national parks, nature reserves, and bird sanctuaries active</span>
          </div>
        )}

        {(["MUST", "SHOULD", "CONSIDER"] as Level[]).map(lvl => (
          <button
            key={lvl}
            onClick={() => setLevelFilter(p => ({ ...p, [lvl]: !p[lvl] }))}
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid rgba(6, 182, 212, 0.6)",
              background: levelFilter[lvl] ? "rgba(6, 182, 212, 0.2)" : "rgba(15, 23, 42, 0.95)",
              cursor: "pointer",
              fontWeight: 700,
              color: levelFilter[lvl] ? "#06b6d4" : "#64748b",
              transition: "all 0.2s"
            }}
            title={`${lvl} (${counts[lvl]})`}
          >
            {lvl} • {counts[lvl]}
          </button>
        ))}

        <div style={{ width: "100%" }} />

        {sources.map(s => (
          <button
            key={s}
            onClick={() => setSourceFilter(p => ({ ...p, [s]: !(p[s] ?? true) }))}
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid rgba(71, 85, 105, 0.6)",
              background: (sourceFilter[s] ?? true) ? "rgba(52, 211, 153, 0.15)" : "rgba(15, 23, 42, 0.95)",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
              color: (sourceFilter[s] ?? true) ? "#34d399" : "#64748b",
              transition: "all 0.2s"
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Rule list */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>
        <div style={{ display: "grid", gap: 12, maxWidth: 980, margin: "0 auto" }}>
          {filtered.map(rule => (
            <RuleCard key={rule.id} rule={rule} />
          ))}

          {filtered.length === 0 && (
            <div style={{ 
              padding: 20, 
              borderRadius: 16, 
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(71, 85, 105, 0.6)",
              textAlign: "center",
              color: "#64748b"
            }}>
              No rules match your filters.
            </div>
          )}
        </div>
      </div>

      {/* Module Switcher Bar */}
      <ModuleSwitcher 
        currentModule="RULES" 
        onSwitchModule={(moduleId) => {
          if (moduleId === 'NAVIGEN' && onClose) {
            onClose();
          } else {
            // Handle switching to other modules - would need to be passed via props
            onSwitchModule(moduleId);
          }
        }}
      />
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const [showModal, setShowModal] = useState(false);
  
  const badgeBg =
    rule.level === "MUST" ? "rgba(239, 68, 68, 0.2)"
    : rule.level === "SHOULD" ? "rgba(251, 191, 36, 0.2)"
    : "rgba(6, 182, 212, 0.2)";

  const badgeColor =
    rule.level === "MUST" ? "#ef4444"
    : rule.level === "SHOULD" ? "#fbbf24"
    : "#06b6d4";

  return (
    <>
      <div style={{ 
        background: "rgba(15, 23, 42, 0.95)", 
        borderRadius: 18, 
        padding: 16, 
        boxShadow: "0 10px 30px rgba(0,0,0,0.30)",
        border: "1px solid rgba(71, 85, 105, 0.6)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ 
              padding: "6px 10px", 
              borderRadius: 999, 
              background: badgeBg, 
              border: `1px solid ${badgeColor}`, 
              fontWeight: 800,
              color: badgeColor
            }}>
              {rule.level}
            </span>
            <span style={{ fontSize: 12, opacity: 0.8, fontWeight: 700, color: "#34d399" }}>{rule.source}</span>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setShowModal(true)}
              style={{ 
                padding: "8px 10px", 
                borderRadius: 12, 
                border: "1px solid rgba(6, 182, 212, 0.6)", 
                background: "rgba(6, 182, 212, 0.1)", 
                cursor: "pointer", 
                fontWeight: 700,
                color: "#06b6d4",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 6
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
              }}
            >
              <Maximize2 style={{ width: 14, height: 14 }} />
              Details
            </button>
            
            <button
              onClick={() => navigator.clipboard.writeText(`${rule.level} • ${rule.title}\n${rule.text}\nSource: ${rule.source}`)}
              style={{ 
                padding: "8px 10px", 
                borderRadius: 12, 
                border: "1px solid rgba(71, 85, 105, 0.6)", 
                background: "rgba(30, 41, 59, 0.95)", 
                cursor: "pointer", 
                fontWeight: 700,
                color: "#94a3b8",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(6, 182, 212, 0.2)";
                e.currentTarget.style.color = "#06b6d4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(30, 41, 59, 0.95)";
                e.currentTarget.style.color = "#94a3b8";
              }}
            >
              Copy
            </button>
          </div>
        </div>

        <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900, color: "#e2e8f0" }}>{rule.title}</div>
        <div style={{ marginTop: 8, lineHeight: 1.45, opacity: 0.9, color: "#cbd5e1" }}>{rule.text}</div>
      </div>

      {/* Simple Details Modal */}
      {showModal && <RuleDetailsModal rule={ruleToRuleCard(rule)} show={showModal} onClose={() => setShowModal(false)} />}
    </>
  );
}