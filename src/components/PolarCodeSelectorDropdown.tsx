import { useState, useRef, useEffect } from 'react';
import { Snowflake, ChevronDown } from 'lucide-react';

interface PolarCodeSelectorDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const POLAR_CODES = [
  { id: 'CAT_A', name: 'Category A', description: 'Year-round operation' },
  { id: 'CAT_B', name: 'Category B', description: 'Summer/autumn operation' },
  { id: 'CAT_C', name: 'Category C', description: 'Summer in thin ice' },
];

export function PolarCodeSelectorDropdown({ value, onChange }: PolarCodeSelectorDropdownProps) {
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

  const currentCode = POLAR_CODES.find(c => c.id === value);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Snowflake className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">{currentCode?.name || value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded shadow-lg z-50 overflow-hidden min-w-[220px]">
          {POLAR_CODES.map(code => (
            <button
              key={code.id}
              onClick={() => {
                onChange(code.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left transition-colors ${
                value === code.id
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white hover:bg-slate-700'
              }`}
            >
              <div className="text-xs font-semibold">{code.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{code.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
