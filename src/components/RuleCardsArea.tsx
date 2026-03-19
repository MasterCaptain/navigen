import { Search } from 'lucide-react';
import { FilterChip } from './ui/FilterChip';
import { RuleCard as RuleCardUI } from './ui/RuleCard';
import { MiniMap } from './ui/MiniMap';
import { RuleCard as RuleCardType } from '../types/ruleCard';

interface RuleCardsAreaProps {
  filterLevel: 'ALL' | 'MUST' | 'SHOULD' | 'CONSIDER';
  setFilterLevel: (level: 'ALL' | 'MUST' | 'SHOULD' | 'CONSIDER') => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  zone: string;
  activeRules: RuleCardType[]; // Passed from engine
}

/**
 * Map RuleCardType (full schema) to simple UI format
 */
function mapRuleCardToUI(rule: RuleCardType): {
  id: string;
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  source: string;
  title: string;
  text: string;
  tags: string[];
} {
  return {
    id: rule.id,
    level: rule.severity,
    source: rule.authority.regime,
    title: rule.ui?.title || rule.statement.substring(0, 50) + '...',
    text: rule.statement,
    tags: rule.ops?.tags || [],
  };
}

export function RuleCardsArea({ 
  filterLevel, 
  setFilterLevel, 
  searchTerm, 
  setSearchTerm, 
  zone,
  activeRules 
}: RuleCardsAreaProps) {
  // Filter rules by severity and search
  const filteredRules = activeRules
    .filter(rule => {
      const matchesLevel = filterLevel === 'ALL' || rule.severity === filterLevel;
      const q = searchTerm.toLowerCase();
      const matchesSearch = 
        rule.ui?.title?.toLowerCase().includes(q) || 
        rule.statement?.toLowerCase().includes(q) ||
        rule.content?.rationale?.toLowerCase().includes(q) ||
        rule.ops?.tags?.some(tag => tag.toLowerCase().includes(q));
      return matchesLevel && matchesSearch;
    })
    .map(mapRuleCardToUI);

  return (
    <div className="flex-1 flex flex-col gap-6 overflow-hidden">
      {/* Title and Filters */}
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg text-white font-semibold">Active RuleCards</h3>
        
        <div className="flex items-center gap-3">
          <FilterChip
            label="ALL"
            active={filterLevel === 'ALL'}
            onClick={() => setFilterLevel('ALL')}
          />
          <FilterChip
            label="MUST"
            active={filterLevel === 'MUST'}
            onClick={() => setFilterLevel('MUST')}
            variant="must"
          />
          <FilterChip
            label="SHOULD"
            active={filterLevel === 'SHOULD'}
            onClick={() => setFilterLevel('SHOULD')}
            variant="should"
          />
          <FilterChip
            label="CONSIDER"
            active={filterLevel === 'CONSIDER'}
            onClick={() => setFilterLevel('CONSIDER')}
            variant="consider"
          />
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search rules…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 w-64 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Mini Map */}
      <MiniMap zone={zone} />

      {/* Rule Cards Grid */}
      <div className="flex-1 overflow-y-auto pr-2 -mr-2">
        {filteredRules.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            <div className="text-center">
              <p className="text-sm">No rules match your filters</p>
              <p className="text-xs mt-2">Try adjusting your search or filter settings</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 pb-4">
            {filteredRules.map(rule => (
              <RuleCardUI key={rule.id} {...rule} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}