import { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

interface ZoneSelectorDropdownProps {
  value: string[];
  onChange: (value: string[]) => void;
  onManageZones: () => void;
}

const ZONES = [
  { id: 'SVALBARD', name: 'Svalbard' },
  { id: 'HIGH_SEAS', name: 'High Seas' },
  { id: 'ANTARCTIC', name: 'Antarctic' },
  { id: 'ARCTIC', name: 'Arctic' },
  { id: 'PORT', name: 'Port' },
];

export function ZoneSelectorDropdown({ value, onChange, onManageZones }: ZoneSelectorDropdownProps) {
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

  const toggleZone = (zoneId: string) => {
    if (value.includes(zoneId)) {
      onChange(value.filter(z => z !== zoneId));
    } else {
      onChange([...value, zoneId]);
    }
  };

  const displayText = value.length === 0 ? 'No zones' : value.join(' + ');

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[200px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white truncate">{displayText}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded shadow-lg z-50 overflow-hidden">
          {ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => toggleZone(zone.id)}
              className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
                value.includes(zone.id)
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-white hover:bg-slate-700'
              }`}
            >
              <div className={`w-3 h-3 border-2 rounded flex items-center justify-center ${
                value.includes(zone.id) ? 'border-cyan-400 bg-cyan-400' : 'border-slate-500'
              }`}>
                {value.includes(zone.id) && (
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-sm" />
                )}
              </div>
              {zone.name}
            </button>
          ))}
          <div className="border-t border-slate-700 mt-1">
            <button
              onClick={() => {
                onManageZones();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 text-left text-xs font-semibold text-cyan-400 hover:bg-slate-700 transition-colors"
            >
              Manage Zones...
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
