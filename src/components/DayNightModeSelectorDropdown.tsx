import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Sunset, ChevronDown } from 'lucide-react';

export type DisplayMode = 'day' | 'dusk' | 'night';

interface DayNightModeSelectorDropdownProps {
  value: DisplayMode;
  onChange: (value: DisplayMode) => void;
}

export function DayNightModeSelectorDropdown({ value, onChange }: DayNightModeSelectorDropdownProps) {
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

  const modes = {
    day: { label: 'DAY MODE', icon: Sun, color: 'text-cyan-400' },
    dusk: { label: 'DUSK MODE', icon: Sunset, color: 'text-amber-400' },
    night: { label: 'NIGHT MODE', icon: Moon, color: 'text-red-400' }
  };

  const currentMode = modes[value];
  const Icon = currentMode.icon;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${currentMode.color}`} />
          <span className="text-xs font-semibold text-white">{currentMode.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded shadow-lg z-50 overflow-hidden">
          <button
            onClick={() => {
              onChange('day');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
              value === 'day'
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-white hover:bg-slate-700'
            }`}
          >
            <Sun className="w-4 h-4" />
            DAY MODE
          </button>
          <button
            onClick={() => {
              onChange('dusk');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
              value === 'dusk'
                ? 'bg-amber-500/20 text-amber-400'
                : 'text-white hover:bg-slate-700'
            }`}
          >
            <Sunset className="w-4 h-4" />
            DUSK MODE
          </button>
          <button
            onClick={() => {
              onChange('night');
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
              value === 'night'
                ? 'bg-red-500/20 text-red-400'
                : 'text-white hover:bg-slate-700'
            }`}
          >
            <Moon className="w-4 h-4" />
            NIGHT MODE
          </button>
        </div>
      )}
    </div>
  );
}
