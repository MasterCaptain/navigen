import { Info, Search } from 'lucide-react';
import { RuleCard } from './ui/RuleCard';
import { getRulesForModule, type Rule } from '../data/rulesets';
import type { PlannedOp } from '../types/plannedOps';
import { useState, useMemo } from 'react';
import { PlannedOpsPopover } from './PlannedOpsPopover';

interface RulePanelRightProps {
  zone: string;
  activity: string;
  plannedOps: PlannedOp[];
  onPlannedOpsChange: (ops: PlannedOp[]) => void;
  iaato: boolean;
  onShowExplanation: () => void;
  activeRules?: Rule[];
}

export function RulePanelRight({ 
  zone, 
  activity, 
  plannedOps, 
  onPlannedOpsChange,
  iaato, 
  onShowExplanation,
  activeRules = []
}: RulePanelRightProps) {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState({
    MUST: true,
    SHOULD: true,
    CONSIDER: true,
  });
  const [sourceFilter, setSourceFilter] = useState<Record<string, boolean>>({});

  // Get ALL rules for current module
  const allRawRules = useMemo(() => {
    try {
      return getRulesForModule(zone, activity, []);
    } catch (error) {
      console.error('Error getting rules:', error);
      return [];
    }
  }, [zone, activity]);

  // 🎯 Convert geographic rules to RuleCard format
  const geoRulesConverted = useMemo(() => {
    return activeRules.map(geoRule => ({
      id: geoRule.id,
      level: geoRule.level,
      source: geoRule.source,
      title: geoRule.title,
      text: geoRule.text,
      tags: geoRule.tags
    } as Rule));
  }, [activeRules]);

  // Merge geographic rules with zone/activity rules
  const allRulesWithGeo = useMemo(() => {
    // Combine geographic rules (from polygons) with zone/activity rules
    const combined = [...geoRulesConverted, ...allRawRules];
    // Deduplicate by id
    const uniqueRules = Array.from(
      new Map(combined.map(r => [r.id, r])).values()
    );
    return uniqueRules;
  }, [geoRulesConverted, allRawRules]);

  // Partition rules into General (no tags) and Planned Ops (with tags)
  const { generalRules, plannedOpsRules } = useMemo(() => {
    const opsSet = new Set(plannedOps);
    
    const general = allRulesWithGeo.filter(r => (r.tags ?? []).length === 0);
    
    // Only include tagged rules if they match selected ops
    const planned = allRulesWithGeo.filter(r => {
      const tags = r.tags ?? [];
      if (tags.length === 0) return false;
      return tags.some(t => opsSet.has(t));
    });

    return { generalRules: general, plannedOpsRules: planned };
  }, [allRulesWithGeo, plannedOps]);

  // Get available sources
  const availableSources = useMemo(() => {
    return Array.from(new Set(allRulesWithGeo.map(r => r.source))).sort();
  }, [allRulesWithGeo]);

  // Apply all filters to General rules
  const filteredGeneralRules = useMemo(() => {
    let filtered = generalRules;

    // Filter by IAATO toggle
    if (!iaato) {
      filtered = filtered.filter(r => r.source !== 'IAATO' && r.source !== 'AECO');
    }

    // Filter by level
    filtered = filtered.filter(r => levelFilter[r.level]);

    // Filter by source
    filtered = filtered.filter(r => sourceFilter[r.source] !== false);

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [generalRules, iaato, levelFilter, sourceFilter, searchQuery]);

  // Apply all filters to Planned Ops rules
  const filteredPlannedOpsRules = useMemo(() => {
    let filtered = plannedOpsRules;

    // Filter by IAATO toggle
    if (!iaato) {
      filtered = filtered.filter(r => r.source !== 'IAATO' && r.source !== 'AECO');
    }

    // Filter by level
    filtered = filtered.filter(r => levelFilter[r.level]);

    // Filter by source
    filtered = filtered.filter(r => sourceFilter[r.source] !== false);

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(q) ||
        r.text.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [plannedOpsRules, iaato, levelFilter, sourceFilter, searchQuery]);

  const showPlannedSection = plannedOps.length > 0;

  // Total counts (before filtering)
  const totalCounts = useMemo(() => {
    let baseRules = allRawRules;
    if (!iaato) {
      baseRules = baseRules.filter(r => r.source !== 'IAATO' && r.source !== 'AECO');
    }
    return {
      MUST: baseRules.filter(r => r.level === 'MUST').length,
      SHOULD: baseRules.filter(r => r.level === 'SHOULD').length,
      CONSIDER: baseRules.filter(r => r.level === 'CONSIDER').length,
    };
  }, [allRawRules, iaato]);

  return (
    <div className="absolute top-0 right-0 bottom-0 w-[384px] bg-slate-900/95 backdrop-blur-md border-l border-slate-700/50 shadow-2xl flex flex-col z-20">
      {/* Header */}
      <div className="border-b border-slate-700/50 px-6 pt-4 pb-3 bg-slate-900/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <h3 className="text-base text-white font-semibold uppercase tracking-wide">
              Compliance
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <PlannedOpsPopover 
              value={plannedOps} 
              onChange={onPlannedOpsChange}
            />
            <button
              onClick={onShowExplanation}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors group"
            >
              <Info className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
              <span className="text-xs text-slate-400 group-hover:text-amber-400 transition-colors">Why shown?</span>
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rules..."
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:bg-slate-800 transition-colors"
          />
        </div>

        {/* Level filter chips */}
        <div className="flex gap-2 mb-3">
          {(['MUST', 'SHOULD', 'CONSIDER'] as const).map(level => {
            const colors = {
              MUST: 'border-red-500/50 text-red-400 bg-red-950/30',
              SHOULD: 'border-amber-500/50 text-amber-400 bg-amber-950/30',
              CONSIDER: 'border-blue-500/50 text-blue-400 bg-blue-950/30',
            };
            const inactiveColors = {
              MUST: 'border-slate-700/50 text-slate-600 bg-slate-800/30',
              SHOULD: 'border-slate-700/50 text-slate-600 bg-slate-800/30',
              CONSIDER: 'border-slate-700/50 text-slate-600 bg-slate-800/30',
            };
            return (
              <button
                key={level}
                onClick={() => setLevelFilter(prev => ({ ...prev, [level]: !prev[level] }))}
                className={`px-2 py-1 text-[10px] font-semibold rounded-full border transition-all uppercase tracking-wide ${
                  levelFilter[level] ? colors[level] : inactiveColors[level]
                }`}
              >
                {level} • {totalCounts[level]}
              </button>
            );
          })}
        </div>

        {/* Source filter chips */}
        {availableSources.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableSources.map(source => (
              <button
                key={source}
                onClick={() => setSourceFilter(prev => ({ ...prev, [source]: !(prev[source] ?? true) }))}
                className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border transition-all uppercase tracking-wide ${
                  sourceFilter[source] !== false
                    ? 'border-emerald-500/50 text-emerald-400 bg-emerald-950/30'
                    : 'border-slate-700/50 text-slate-600 bg-slate-800/30'
                }`}
              >
                {source}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {filteredGeneralRules.length === 0 && (!showPlannedSection || filteredPlannedOpsRules.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4">
              <Info className="w-8 h-8 text-slate-600" />
            </div>
            <h4 className="text-base text-slate-400 font-medium mb-2">
              {searchQuery.trim() ? 'No matching rules' : 'No rules for this module'}
            </h4>
            <p className="text-sm text-slate-500 max-w-xs">
              {searchQuery.trim() 
                ? 'Try adjusting your search or filters'
                : `No compliance rules are defined for ${zone} • ${activity}`
              }
            </p>
          </div>
        ) : (
          <>
            {/* GENERAL SECTION (always visible) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-[13px] uppercase tracking-wider text-slate-300 font-semibold">
                  General
                </div>
                <div className="text-[11px] text-slate-500 font-mono">{filteredGeneralRules.length}</div>
              </div>

              {filteredGeneralRules.length === 0 ? (
                <div className="text-[12px] text-slate-500 italic">No general rules match your filters.</div>
              ) : (
                <div className="space-y-3">
                  {filteredGeneralRules.map(rule => (
                    <RuleCard key={rule.id} {...rule} />
                  ))}
                </div>
              )}
            </div>

            {/* PLANNED OPS SECTION (only when ops are selected) */}
            {showPlannedSection && (
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-[13px] uppercase tracking-wider text-amber-300 font-semibold">
                      Planned Operations
                    </div>
                    <div className="text-[11px] text-amber-200/70 font-mono">{filteredPlannedOpsRules.length}</div>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Active:{' '}
                    <span className="font-mono text-amber-200/80">
                      {plannedOps.slice().sort().map(op => op.replace('_OPS', '').replace('_', ' ')).join(', ')}
                    </span>
                  </div>
                </div>

                {filteredPlannedOpsRules.length === 0 ? (
                  <div className="text-[12px] text-slate-500 italic">
                    No Planned Ops rules match your selected operations and filters.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPlannedOpsRules.map(rule => (
                      <RuleCard key={rule.id} {...rule} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}