import { useState, useRef, useEffect } from 'react';
import { Navigation, ChevronDown, Anchor, Ship, Loader } from 'lucide-react';

interface ActivitySelectorDropdownProps {
  value: string;
  onChange: (value: string) => void;
}

const ACTIVITIES = [
  { id: 'UNDERWAY', name: 'Underway', icon: Navigation },
  { id: 'AT ANCHOR', name: 'At Anchor', icon: Anchor },
  { id: 'PORT OPS', name: 'Port Ops', icon: Ship },
  { id: 'MANEUVERING', name: 'Maneuvering', icon: Ship },
  { id: 'DRIFT', name: 'Drift', icon: Loader },
];

export function ActivitySelectorDropdown({ value, onChange }: ActivitySelectorDropdownProps) {
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

  const currentActivity = ACTIVITIES.find(a => a.id === value);
  const Icon = currentActivity?.icon || Navigation;

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-white">{currentActivity?.name || value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-slate-800 border border-slate-700 rounded shadow-lg z-50 overflow-hidden">
          {ACTIVITIES.map(activity => {
            const ActivityIcon = activity.icon;
            return (
              <button
                key={activity.id}
                onClick={() => {
                  onChange(activity.id);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold transition-colors flex items-center gap-2 ${
                  value === activity.id
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-white hover:bg-slate-700'
                }`}
              >
                <ActivityIcon className="w-4 h-4" />
                {activity.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
