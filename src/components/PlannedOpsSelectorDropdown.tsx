import { useState, useRef, useEffect } from 'react';
import { Plane, ChevronDown, Fuel, Anchor, Snowflake, Users, Ship, Radio, Globe2 } from 'lucide-react';
import type { PlannedOp } from '../types/plannedOps';

interface PlannedOpsSelectorDropdownProps {
  value: PlannedOp[];
  onChange: (value: PlannedOp[]) => void;
  iaato: boolean;
  onIaatoChange: (value: boolean) => void;
}

const PLANNED_OPS_OPTIONS = [
  { id: 'HELICOPTER_OPS' as PlannedOp, name: 'Helicopter Ops', icon: Plane },
  { id: 'BUNKERING' as PlannedOp, name: 'Bunkering', icon: Fuel },
  { id: 'ANCHORING' as PlannedOp, name: 'Anchoring', icon: Anchor },
  { id: 'ICE_NAV' as PlannedOp, name: 'Ice Navigation', icon: Snowflake },
  { id: 'DIVING' as PlannedOp, name: 'Diving Ops', icon: Users },
  { id: 'ZODIAC_OPS' as PlannedOp, name: 'Zodiac Ops', icon: Ship },
  { id: 'CARGO_OPS' as PlannedOp, name: 'Cargo Ops', icon: Radio },
];

export function PlannedOpsSelectorDropdown({ value, onChange, iaato, onIaatoChange }: PlannedOpsSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const toggleOp = (opId: PlannedOp) => {
    if (value.includes(opId)) {
      onChange(value.filter(v => v !== opId));
    } else {
      onChange([...value, opId]);
    }
  };

  const displayText = value.length === 0 ? 'Planned Ops' : `${value.length} operation${value.length > 1 ? 's' : ''}`;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Plane className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">{displayText}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-[240px] bg-slate-800 border border-slate-700 rounded shadow-lg z-50 overflow-hidden max-h-[400px] overflow-y-auto">
          {PLANNED_OPS_OPTIONS.map(op => {
            const Icon = op.icon;
            const isSelected = value.includes(op.id);
            return (
              <button
                key={op.id}
                onClick={() => toggleOp(op.id)}
                className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white hover:bg-slate-700'
                }`}
              >
                <div className={`w-3 h-3 border-2 rounded flex items-center justify-center ${
                  isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
                }`}>
                  {isSelected && (
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-sm" />
                  )}
                </div>
                <Icon className="w-4 h-4" />
                {op.name}
              </button>
            );
          })}
          
          <div className="border-t border-slate-700 mt-1">
            <button
              onClick={() => onIaatoChange(!iaato)}
              className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
                iaato
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white hover:bg-slate-700'
              }`}
            >
              <div className={`w-3 h-3 border-2 rounded flex items-center justify-center ${
                iaato ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
              }`}>
                {iaato && (
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-sm" />
                )}
              </div>
              <Globe2 className="w-4 h-4" />
              IAATO Member
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
