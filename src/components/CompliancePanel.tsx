import { AlertTriangle, CheckCircle, Info, Shield, ChevronDown, ChevronUp, Route } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { RouteWithWaypoints } from '../types/routes';
import { analyzeRouteCompliance } from '../lib/routeComplianceAnalyzer';
import { RuleDetailOverlay, type RuleReference } from './RuleDetailOverlay';
import { getWarningRule } from '../data/warningRuleMapping';
import { getActiveRules } from '../data/geoTriggers';
import type { RuleCard } from '../types/ruleCard';
import {
  evaluateGreenlandCompliance,
  type EvaluatedComplianceRule,
  type OperationMode,
} from '../lib/compliance/greenlandCompliance';

interface ComplianceRule {
  id: string;
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  category: string;
  title: string;
  description: string;
  reference: string;
  checked?: boolean;
  sortGroup?: number;
  sortWeight?: number;
  evaluationStatus?: 'ACTIVE' | 'CONDITIONAL' | 'INACTIVE';
  evaluationReason?: string;
}

type RouteComplianceEvent = {
  id: string;
  areaId: string;
  zoneName: string;
  eventType: 'ENTRY' | 'EXIT';
  lat: number;
  lon: number;
  legIndex: number;
  distanceFromLegStartNm: number;
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  title: string;
  action: string;
};

interface CompliancePanelProps {
  activeZone: string;
  activeActivity: string;
  activePolarCode: string;
  detectedAreas: string[];
  vesselPosition: { lat: number; lng: number };
  activeRoute?: RouteWithWaypoints | null;
  activeRulesFromEngine?: RuleCard[];
  routeComplianceEvents?: RouteComplianceEvent[];
}

export function CompliancePanel({
  activeZone,
  activeActivity,
  activePolarCode,
  detectedAreas,
  vesselPosition,
  activeRoute,
  activeRulesFromEngine,
  routeComplianceEvents = []
}: CompliancePanelProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    MUST: false,
    SHOULD: true,
    CONSIDER: false,
    CHECKLIST: false,
    WARNINGS: false
  });

  const [checkedRules, setCheckedRules] = useState<Record<string, boolean>>({});
  const [selectedRule, setSelectedRule] = useState<RuleReference | null>(null);


  const nextEvent = useMemo(() => {
  return routeComplianceEvents
    .filter(event => event.eventType === 'ENTRY')
    .sort((a, b) => a.distanceFromLegStartNm - b.distanceFromLegStartNm)[0] ?? null;
}, [routeComplianceEvents]);

  const toggleSection = (level: string) => {
    setExpandedSections(prev => ({ ...prev, [level]: !prev[level] }));
  };

  const handleRuleClick = (rule: ComplianceRule) => {
    setSelectedRule({
      title: rule.title,
      description: rule.description,
      reference: rule.reference
    } as RuleReference);
  };

  const toggleRule = (ruleId: string) => {
    setCheckedRules(prev => ({ ...prev, [ruleId]: !prev[ruleId] }));
  };

  const handleWarningClick = (warningMessage: string) => {
    const rule = getWarningRule(warningMessage);
    if (rule) setSelectedRule(rule);
  };

  const handleCloseOverlay = () => {
    setSelectedRule(null);
  };

  const activeSpatialRules = useMemo(() => {
  if (activeRulesFromEngine && activeRulesFromEngine.length > 0) {
    return activeRulesFromEngine;
  }

  return getActiveRules(vesselPosition);
}, [activeRulesFromEngine, vesselPosition.lat, vesselPosition.lng]);

  const staticRules = useMemo(() => {
    return generateStaticComplianceRules(
      activeZone,
      activeActivity,
      activePolarCode,
      detectedAreas,
      vesselPosition
    );
  }, [activeZone, activeActivity, activePolarCode, detectedAreas, vesselPosition.lat, vesselPosition.lng]);

  const evaluatedGreenlandRules = useMemo(() => {
    return evaluateGreenlandCompliance({
      activeAreaIds: detectedAreas,
      operationMode: mapActivityToOperationMode(activeActivity),
      currentDate: new Date(),
      vesselProfile: {
        flagState: 'BS',
        hasLocalGuide: false,
        passengerCount: 120,
        iceClass: 'PC6',
      },
    });
  }, [detectedAreas, activeActivity]);

  const spatialRulesMapped = useMemo(() => {
    return activeSpatialRules
      .filter(rule => !isGreenlandRuleCard(rule))
      .map(mapRuleCardToComplianceRule);
  }, [activeSpatialRules]);
  
  const routeEventRules = useMemo(() => {
  return routeComplianceEvents.map(event => ({
    id: event.id,
    level: event.level,
    category: 'CANADA',
    title: event.title,
    description: event.action,
    reference: `${event.zoneName} • Leg ${event.legIndex + 1} • ${event.distanceFromLegStartNm.toFixed(1)} NM`,
    sortGroup: -1,
    sortWeight: 2000,
  }));
}, [routeComplianceEvents]);

  const evaluatedGreenlandRulesMapped = useMemo(() => {
    return evaluatedGreenlandRules.map(mapEvaluatedRuleToComplianceRule);
  }, [evaluatedGreenlandRules]);

  const rules = useMemo(() => {
    const merged = [
  ...evaluatedGreenlandRulesMapped,
  ...spatialRulesMapped,
  ...routeEventRules,
  ...staticRules,
];
    const deduped = new Map<string, ComplianceRule>();

    for (const rule of merged) {
      if (!deduped.has(rule.id)) {
        deduped.set(rule.id, rule);
      }
    }

    return Array.from(deduped.values());
  }, [evaluatedGreenlandRulesMapped, spatialRulesMapped, staticRules]);

  const mustRules = sortComplianceRules(rules.filter(r => r.level === 'MUST'));
  const shouldRules = sortComplianceRules(rules.filter(r => r.level === 'SHOULD'));
  const considerRules = sortComplianceRules(rules.filter(r => r.level === 'CONSIDER'));

  const mustCompleted = mustRules.filter(r => checkedRules[r.id]).length;
  const shouldCompleted = shouldRules.filter(r => checkedRules[r.id]).length;
  const considerCompleted = considerRules.filter(r => checkedRules[r.id]).length;

  const routeAnalysis = activeRoute ? analyzeRouteCompliance(activeRoute) : null;

  const hasGreenlandProposalRules = rules.some(
    rule => rule.category === 'GREENLAND PROPOSAL'
  );

  const hasGreenlandProtectedRules = rules.some(
    rule => rule.category === 'GREENLAND PROTECTED'
  );

  const hasGreenlandLocalRestrictionRules = rules.some(
    rule => rule.category === 'GREENLAND LOCAL'
  );

  return (
    <div className="fixed top-16 right-0 w-[420px] h-[calc(100vh-64px)] bg-slate-900/98 backdrop-blur-md border-l border-slate-700/80 shadow-2xl z-30 flex flex-col">
      <div className="px-4 py-2 bg-slate-800/90 border-b border-slate-700/50">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-cyan-400" />
          <div className="text-sm font-bold text-slate-200 uppercase tracking-wide">
            Compliance Status
          </div>
        </div>

        <div className="text-[10px] text-slate-400">
          {activeZone} • {activeActivity}
        </div>

        {activeRoute ? (
          <div className="text-[9px] text-purple-400 mt-1 flex items-center gap-1">
            <Route className="w-3 h-3" />
            Active Route: {activeRoute.name}
          </div>
        ) : (
          <div className="text-[9px] text-slate-500 mt-1 italic">
            No active route - Open VOYAGE to plan a route
          </div>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50 flex-shrink-0">
        <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5">
          Active Regulations
        </div>

        <div className="flex flex-wrap gap-1.5">
          {detectedAreas.includes('IMO_N60') && (
            <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-[10px] text-red-400 font-bold">
              IMO Polar Code (Arctic)
            </span>
          )}

          {detectedAreas.includes('IMO_S60') && (
            <span className="px-2 py-1 bg-red-500/20 border border-red-500/50 rounded text-[10px] text-red-400 font-bold">
              IMO Polar Code (Antarctic)
            </span>
          )}

          {detectedAreas.some(area => area.includes('SVALBARD')) && (
            <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[10px] text-cyan-400 font-bold">
              Svalbardmiljøloven
            </span>
          )}

          {hasGreenlandProposalRules && (
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] text-amber-400 font-bold">
              Greenland Zoning Proposal
            </span>
          )}

          {hasGreenlandProtectedRules && (
            <span className="px-2 py-1 bg-emerald-500/20 border border-emerald-500/50 rounded text-[10px] text-emerald-400 font-bold">
              Greenland Protected Areas
            </span>
          )}

          {hasGreenlandLocalRestrictionRules && (
            <span className="px-2 py-1 bg-orange-500/20 border border-orange-500/50 rounded text-[10px] text-orange-400 font-bold">
              Greenland Local Restrictions
            </span>
          )}

          {rules.some(rule => rule.category === 'CANADA') && (
            <span className="px-2 py-1 bg-amber-500/20 border border-amber-500/50 rounded text-[10px] text-amber-400 font-bold">
              Canada / NORDREG
            </span>
          )}

          <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[10px] text-cyan-400 font-bold">
            SOLAS
          </span>

          <span className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[10px] text-cyan-400 font-bold">
            MARPOL
          </span>

          {activeActivity === 'EXPEDITION' && (
            <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/50 rounded text-[10px] text-purple-400 font-bold">
              IAATO Guidelines
            </span>
          )}
        </div>
      </div>

      {nextEvent && (
  <div className="px-4 py-3 border-b border-slate-700/50 bg-amber-500/5 flex-shrink-0">
    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
        Upcoming Route Action
      </div>

      <div className="mt-2 text-sm font-semibold text-white">
        {nextEvent.title}
      </div>

      <div className="mt-1 text-xs text-slate-300">
        {nextEvent.action}
      </div>

      <div className="mt-2 text-[11px] text-slate-400">
        {nextEvent.zoneName} • Leg {nextEvent.legIndex + 1} •{' '}
        {nextEvent.distanceFromLegStartNm.toFixed(1)} NM
      </div>
    </div>
  </div>
)}

      <div className="flex-1 overflow-y-auto">
        {routeAnalysis && (
          <div className="border-b border-slate-700/50 bg-purple-500/5">
            <div className="px-4 py-3 bg-purple-500/10 border-b border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Route className="w-4 h-4 text-purple-400" />
                <div className="text-sm font-bold text-purple-400 uppercase tracking-wide">
                  Route Compliance Analysis
                </div>
              </div>

              <div className="text-[10px] text-slate-300">
                {activeRoute?.name || 'Active Route'} • {routeAnalysis.totalWaypoints} waypoints
              </div>
            </div>

            <div className="px-4 py-3 grid grid-cols-3 gap-2">
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{routeAnalysis.polarWaterSegments}</div>
                <div className="text-[9px] text-slate-400 uppercase">Polar WPs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{routeAnalysis.svalbardSegments}</div>
                <div className="text-[9px] text-slate-400 uppercase">Svalbard WPs</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-amber-400">{routeAnalysis.protectedAreaSegments}</div>
                <div className="text-[9px] text-slate-400 uppercase">Protected WPs</div>
              </div>
            </div>

            {routeAnalysis.criticalWarnings.length > 0 && (
              <div className="border-t border-slate-700/50">
                <button
                  onClick={() => toggleSection('WARNINGS')}
                  className="w-full px-4 py-3 flex items-center justify-between transition-colors bg-amber-500/10 hover:bg-amber-500/20"
                >
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <div className="text-[10px] text-amber-400 uppercase tracking-wider font-bold">
                      Critical Waypoint Warnings ({routeAnalysis.criticalWarnings.length}) - Click to view rules
                    </div>
                  </div>

                  {expandedSections.WARNINGS ? (
                    <ChevronUp className="w-4 h-4 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-amber-400" />
                  )}
                </button>

                {expandedSections.WARNINGS && (
                  <div className="px-4 py-3 space-y-1 max-h-[200px] overflow-y-auto pr-1">
                    {routeAnalysis.criticalWarnings.map((warning, i) => (
                      <button
                        key={i}
                        onClick={() => handleWarningClick(warning)}
                        className="w-full text-left text-[10px] text-slate-300 bg-amber-500/10 border border-amber-500/30 hover:border-cyan-400 rounded px-2 py-1 cursor-pointer transition-all hover:bg-amber-500/20 hover:translate-x-1"
                      >
                        {warning}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <ComplianceSection
          level="MUST"
          color="red"
          icon={AlertTriangle}
          rules={mustRules}
          expanded={expandedSections.MUST}
          onToggle={() => toggleSection('MUST')}
          completed={mustCompleted}
          total={mustRules.length}
          checkedRules={checkedRules}
          onToggleRule={toggleRule}
          onRuleClick={handleRuleClick}
        />

        <ComplianceSection
          level="SHOULD"
          color="amber"
          icon={Info}
          rules={shouldRules}
          expanded={expandedSections.SHOULD}
          onToggle={() => toggleSection('SHOULD')}
          completed={shouldCompleted}
          total={shouldRules.length}
          checkedRules={checkedRules}
          onToggleRule={toggleRule}
          onRuleClick={handleRuleClick}
        />

        <ComplianceSection
          level="CONSIDER"
          color="cyan"
          icon={CheckCircle}
          rules={considerRules}
          expanded={expandedSections.CONSIDER}
          onToggle={() => toggleSection('CONSIDER')}
          completed={considerCompleted}
          total={considerRules.length}
          checkedRules={checkedRules}
          onToggleRule={toggleRule}
          onRuleClick={handleRuleClick}
        />
      </div>

      <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0 bg-slate-800/50">
        <div className="text-[10px] text-slate-400">
          Overall Compliance:{' '}
          <span className="text-cyan-400 font-bold">
            {Math.round(
              ((mustCompleted + shouldCompleted + considerCompleted) /
                Math.max(1, mustRules.length + shouldRules.length + considerRules.length)) *
                100
            )}
            %
          </span>
        </div>

        <button className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider transition-colors">
          View All Rules →
        </button>
      </div>

      <RuleDetailOverlay rule={selectedRule} onClose={handleCloseOverlay} />
    </div>
  );
}

interface ComplianceSectionProps {
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  color: 'red' | 'amber' | 'cyan';
  icon: React.ElementType;
  rules: ComplianceRule[];
  expanded: boolean;
  onToggle: () => void;
  completed: number;
  total: number;
  checkedRules: Record<string, boolean>;
  onToggleRule: (ruleId: string) => void;
  onRuleClick?: (rule: ComplianceRule) => void;
}

function ComplianceSection({
  level,
  color,
  icon: Icon,
  rules,
  expanded,
  onToggle,
  completed,
  total,
  checkedRules,
  onToggleRule,
  onRuleClick
}: ComplianceSectionProps) {
  const colorClasses = {
    red: {
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      text: 'text-red-400',
      hover: 'hover:bg-red-500/20'
    },
    amber: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
      hover: 'hover:bg-amber-500/20'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      hover: 'hover:bg-cyan-500/20'
    }
  };

  const classes = colorClasses[color];

  const groupedRules = rules.reduce<Record<string, ComplianceRule[]>>((acc, rule) => {
    if (!acc[rule.category]) acc[rule.category] = [];
    acc[rule.category].push(rule);
    return acc;
  }, {});

  const orderedCategories = Object.keys(groupedRules).sort((a, b) => {
    const aGroup = groupedRules[a][0]?.sortGroup ?? 99;
    const bGroup = groupedRules[b][0]?.sortGroup ?? 99;

    if (aGroup !== bGroup) return aGroup - bGroup;
    return a.localeCompare(b);
  });

  return (
    <div className="border-b border-slate-700/50">
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${classes.bg} ${classes.hover}`}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${classes.text}`} />
          <div className="text-left">
            <div className={`text-sm font-bold ${classes.text} uppercase tracking-wide`}>{level}</div>
            <div className="text-[10px] text-slate-400">
              {completed} of {total} completed
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`text-xs font-mono ${classes.text}`}>
            {total > 0 ? Math.round((completed / total) * 100) : 0}%
          </div>
          {expanded ? (
            <ChevronUp className={`w-4 h-4 ${classes.text}`} />
          ) : (
            <ChevronDown className={`w-4 h-4 ${classes.text}`} />
          )}
        </div>
      </button>

      {expanded && (
        <div className="px-4 py-2 space-y-3">
          {rules.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-500">
              No {level.toLowerCase()} requirements for current context
            </div>
          ) : (
            orderedCategories.map(category => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 pt-1">
                  <div className={`h-px flex-1 ${classes.bg}`} />
                  <div className={`text-[9px] font-bold uppercase tracking-[0.16em] ${classes.text}`}>
                    {category}
                  </div>
                  <div className={`h-px flex-1 ${classes.bg}`} />
                </div>

                {groupedRules[category].map(rule => (
                  <div
                    key={rule.id}
                    onClick={() => onRuleClick?.(rule)}
                    className={`p-3 rounded border ${classes.border} ${classes.bg} transition-all cursor-pointer hover:translate-x-1 hover:border-cyan-400`}
                  >
                    <div className="flex items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={checkedRules[rule.id] || false}
                        onChange={() => onToggleRule(rule.id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`mt-0.5 w-4 h-4 rounded cursor-pointer accent-${color}-500`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="text-[11px] font-semibold text-white">{rule.title}</div>
                          <div className={`text-[8px] px-1.5 py-0.5 rounded ${classes.bg} ${classes.text} font-bold whitespace-nowrap`}>
                            {rule.category}
                          </div>
                        </div>

                        <p className="text-[10px] text-slate-300 leading-relaxed mb-1.5">
                          {rule.description}
                        </p>

                        <div className="space-y-1">
                          {(rule.evaluationStatus === 'ACTIVE' || rule.evaluationStatus === 'CONDITIONAL') && (
                            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-wide">
                              {rule.evaluationStatus === 'ACTIVE' && (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-green-400" />
                                  <span className="text-green-400">Active</span>
                                </>
                              )}

                              {rule.evaluationStatus === 'CONDITIONAL' && (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                                  <span className="text-amber-400">Conditional</span>
                                </>
                              )}
                            </div>
                          )}

                          {rule.evaluationStatus === 'CONDITIONAL' && rule.evaluationReason && (
                            <div className="text-[9px] text-amber-300 leading-relaxed">
                              {rule.evaluationReason}
                            </div>
                          )}

                          <div className="text-[9px] text-slate-500 font-mono">
                            Ref: {rule.reference}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function isGreenlandRuleCard(rule: RuleCard): boolean {
  const regime = rule.authority?.regime ?? '';
  const ruleId = rule.id ?? '';
  const areaIds = rule.applicability?.areas?.map(a => a.areaId) ?? [];

  return (
    regime === 'Municipal Proposal' ||
    ruleId.startsWith('GREENLAND_') ||
    areaIds.some(areaId =>
      areaId.startsWith('GREENLAND_TASIILAQ_') ||
      areaId.startsWith('GREENLAND_ITTOQQORTOORMIIT_') ||
      areaId.startsWith('GREENLAND_PROTECTED') ||
      areaId.startsWith('GREENLAND_LOCAL_')
    )
  );
}

function mapRuleCardToComplianceRule(rule: RuleCard): ComplianceRule {
  const category = formatCategory(rule);

  return {
    id: rule.id,
    level: rule.severity,
    category,
    title: rule.ui?.title ?? rule.id,
    description: rule.statement,
    reference: rule.authority?.reference ?? rule.authority?.instrument ?? '—',
    sortGroup: getCategorySortGroup(category),
    sortWeight: getRulePriorityWeight(rule),
    evaluationStatus: 'ACTIVE',
  };
}

function mapEvaluatedRuleToComplianceRule(rule: EvaluatedComplianceRule): ComplianceRule {
  const category = formatEvaluatedSourceCategory(rule.source);

  return {
    id: rule.id,
    level: rule.category,
    category,
    title: rule.title,
    description: rule.description,
    reference: rule.reference ?? '—',
    sortGroup: getCategorySortGroup(category),
    sortWeight: 1000,
    evaluationStatus: rule.evaluationStatus,
    evaluationReason: rule.reason,
  };
}

function formatEvaluatedSourceCategory(source: string): string {
  switch (source) {
    case 'GREENLAND_PROPOSAL':
      return 'GREENLAND PROPOSAL';
    case 'GREENLAND_LOCAL':
      return 'GREENLAND LOCAL';
    case 'CANADA':
    case 'CANADA_NORDREG':
      return 'CANADA';
    case 'IMO_POLAR':
      return 'IMO POLAR';
    case 'SOLAS':
      return 'SOLAS';
    case 'MARPOL':
      return 'MARPOL';
    default:
      return 'RULE';
  }
}

function formatCategory(rule: RuleCard): string {
  const regime = rule.authority?.regime ?? '';
  const instrument = rule.authority?.instrument ?? '';
  const ruleId = rule.id ?? '';
  const areaIds = rule.applicability?.areas?.map(a => a.areaId) ?? [];

  if (
    regime === 'Municipal Proposal' ||
    ruleId.includes('GREENLAND_TASIILAQ') ||
    ruleId.includes('GREENLAND_ITTOQQORTOORMIIT')
  ) {
    return 'GREENLAND PROPOSAL';
  }

  if (
    areaIds.includes('GREENLAND_PROTECTED') ||
    areaIds.some(areaId => areaId.startsWith('GREENLAND_PROTECTED')) ||
    ruleId.includes('GREENLAND_PROTECTED')
  ) {
    return 'GREENLAND PROTECTED';
  }

  if (
    areaIds.some(areaId => areaId.includes('GREENLAND_LOCAL_')) ||
    ruleId.includes('GREENLAND_LOCAL_')
  ) {
    return 'GREENLAND LOCAL';
  }

    if (
    areaIds.includes('CANADA_NORDREG') ||
    areaIds.some(areaId => areaId.startsWith('CANADA_')) ||
    ruleId.includes('CANADA') ||
    instrument.toLowerCase().includes('nordreg') ||
    regime.toLowerCase().includes('national')
  ) {
    return 'CANADA';
  }

  if (instrument.toLowerCase().includes('polar')) return 'IMO POLAR';
  if (instrument.toLowerCase().includes('svalbard')) return 'SVALBARD';
  if (instrument.toLowerCase().includes('marpol')) return 'MARPOL';
  if (instrument.toLowerCase().includes('solas')) return 'SOLAS';
  if (instrument.toLowerCase().includes('iaato')) return 'IAATO';

  return regime || instrument || 'RULE';
}

function getCategorySortGroup(category: string): number {
  switch (category) {
        case 'UPCOMING ROUTE ACTIONS':
      return 0;
    case 'GREENLAND PROPOSAL':
      return 1;
    case 'GREENLAND PROTECTED':
      return 2;
    case 'GREENLAND LOCAL':
      return 3;
    case 'CANADA':
      return 4;
    case 'SVALBARD':
      return 5;
    case 'IMO POLAR':
      return 6;
    case 'IAATO':
      return 7;
    case 'SOLAS':
      return 8;
    case 'MARPOL':
      return 9;
    default:
      return 99;
  }
}

function getRulePriorityWeight(rule: RuleCard): number {
  return rule.ui?.priority ?? 0;
}

function sortComplianceRules(rules: ComplianceRule[]): ComplianceRule[] {
  return [...rules].sort((a, b) => {
    const groupA = a.sortGroup ?? 99;
    const groupB = b.sortGroup ?? 99;
    if (groupA !== groupB) return groupA - groupB;

    const weightA = a.sortWeight ?? 0;
    const weightB = b.sortWeight ?? 0;
    if (weightA !== weightB) return weightB - weightA;

    return a.title.localeCompare(b.title);
  });
}

function mapActivityToOperationMode(activeActivity: string): OperationMode {
  const value = activeActivity.trim().toUpperCase();

  if (value.includes('ANCHOR')) return 'AT_ANCHOR';
  if (value.includes('EXPEDITION')) return 'LANDING';
  if (value.includes('LANDING')) return 'LANDING';
  if (value.includes('UNDERWAY')) return 'TRANSIT';
  if (value.includes('TRANSIT')) return 'TRANSIT';
  if (value.includes('CRUISE')) return 'CRUISING';

  return 'UNKNOWN';
}

function generateStaticComplianceRules(
  activeZone: string,
  activeActivity: string,
  activePolarCode: string,
  detectedAreas: string[],
  vesselPosition: { lat: number; lng: number }
): ComplianceRule[] {
  const rules: ComplianceRule[] = [];

  if (activeActivity === 'EXPEDITION') {
    rules.push(
      {
        id: 'iaato-landing',
        level: 'SHOULD',
        category: 'IAATO',
        title: 'Passenger Landing Limits',
        description: 'Maximum 100 passengers ashore at any one time. One guide per 20 passengers required.',
        reference: 'IAATO Field Operations Manual',
        sortGroup: getCategorySortGroup('IAATO'),
        sortWeight: 100
      },
      {
        id: 'iaato-wildlife-distance',
        level: 'SHOULD',
        category: 'IAATO',
        title: 'Wildlife Watching Distance',
        description: 'Maintain 5m distance from wildlife. Never surround or separate animals from their group.',
        reference: 'IAATO Wildlife Guidelines',
        sortGroup: getCategorySortGroup('IAATO'),
        sortWeight: 90
      },
      {
        id: 'iaato-biosecurity',
        level: 'MUST',
        category: 'IAATO',
        title: 'Biosecurity Protocol',
        description: 'All expedition clothing and equipment must be cleaned to prevent introduction of non-native species.',
        reference: 'IAATO Biosecurity Guidelines',
        sortGroup: getCategorySortGroup('IAATO'),
        sortWeight: 110
      },
      {
        id: 'iaato-briefing',
        level: 'CONSIDER',
        category: 'IAATO',
        title: 'Pre-Landing Briefing',
        description: 'Conduct site-specific briefing covering wildlife, terrain, and environmental protocols.',
        reference: 'IAATO Best Practice',
        sortGroup: getCategorySortGroup('IAATO'),
        sortWeight: 80
      }
    );
  }

  rules.push(
    {
      id: 'solas-watchkeeping',
      level: 'MUST',
      category: 'SOLAS',
      title: 'Bridge Watchkeeping',
      description: 'Qualified officer must maintain continuous bridge watch in accordance with STCW.',
      reference: 'SOLAS Chapter V, Reg 14',
      sortGroup: getCategorySortGroup('SOLAS'),
      sortWeight: 100
    },
    {
      id: 'solas-voyage-plan',
      level: 'MUST',
      category: 'SOLAS',
      title: 'Voyage Planning',
      description: 'Passage plan must be prepared covering entire voyage, reviewed, and monitored continuously.',
      reference: 'SOLAS Chapter V, Reg 34',
      sortGroup: getCategorySortGroup('SOLAS'),
      sortWeight: 95
    },
    {
      id: 'marpol-orb',
      level: 'MUST',
      category: 'MARPOL',
      title: 'Oil Record Book',
      description: 'All oil operations must be recorded in ORB Part I. Keep records for 3 years.',
      reference: 'MARPOL Annex I, Reg 17',
      sortGroup: getCategorySortGroup('MARPOL'),
      sortWeight: 100
    },
    {
      id: 'marpol-grb',
      level: 'MUST',
      category: 'MARPOL',
      title: 'Garbage Management',
      description: 'Garbage Record Book must document all disposal and discharge operations.',
      reference: 'MARPOL Annex V, Reg 10',
      sortGroup: getCategorySortGroup('MARPOL'),
      sortWeight: 95
    }
  );

  return rules;
}