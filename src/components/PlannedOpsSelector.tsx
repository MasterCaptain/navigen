import { X, Plane, Fuel, Anchor, Snowflake, Users, Ship, Radio } from 'lucide-react';
import type { PlannedOp } from '../types/plannedOps';

interface PlannedOpsSelectorProps {
  onClose: () => void;
  selectedOps: PlannedOp[];
  onToggleOp: (op: PlannedOp) => void;
}

export function PlannedOpsSelector({ onClose, selectedOps, onToggleOp }: PlannedOpsSelectorProps) {
  const plannedOps = [
    {
      id: 'HELICOPTER_OPS' as PlannedOp,
      name: 'Helicopter Operations',
      description: 'HLO setup, weather limits, FOD checks',
      icon: <Plane className="w-5 h-5" />,
      color: 'cyan',
    },
    {
      id: 'BUNKERING' as PlannedOp,
      name: 'Bunkering',
      description: 'Fuel transfer, spill containment',
      icon: <Fuel className="w-5 h-5" />,
      color: 'amber',
    },
    {
      id: 'ANCHORING' as PlannedOp,
      name: 'Anchoring',
      description: 'Anchor operations and watch',
      icon: <Anchor className="w-5 h-5" />,
      color: 'blue',
    },
    {
      id: 'ICE_NAV' as PlannedOp,
      name: 'Ice Navigation',
      description: 'Ice operations and polar routing',
      icon: <Snowflake className="w-5 h-5" />,
      color: 'sky',
    },
    {
      id: 'DIVING' as PlannedOp,
      name: 'Diving Operations',
      description: 'Underwater operations and safety',
      icon: <Users className="w-5 h-5" />,
      color: 'purple',
    },
    {
      id: 'ZODIAC_OPS' as PlannedOp,
      name: 'Zodiac Operations',
      description: 'Small boat operations and transfers',
      icon: <Ship className="w-5 h-5" />,
      color: 'green',
    },
    {
      id: 'DRONE_OPS' as PlannedOp,
      name: 'Drone Operations',
      description: 'UAV operations and airspace control',
      icon: <Radio className="w-5 h-5" />,
      color: 'indigo',
    },
  ];

  const isSelected = (opId: PlannedOp) => selectedOps.includes(opId);

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[120px] z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[400px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Planned Operations</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="px-4 pt-3 pb-2 border-b border-slate-700/30 flex-shrink-0">
          <p className="text-xs text-slate-400 leading-relaxed">
            Select planned operations to show specific compliance requirements. Multiple selections allowed.
          </p>
        </div>

        {/* Planned Ops Options - Scrollable */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {plannedOps.map((op) => {
            const selected = isSelected(op.id);
            return (
              <button
                key={op.id}
                onClick={() => onToggleOp(op.id)}
                className={`w-full p-3 rounded-lg border transition-all text-left group ${
                  selected
                    ? 'bg-cyan-600/20 border-cyan-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      selected
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                    }`}
                  >
                    {op.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={`text-sm font-medium ${
                          selected ? 'text-cyan-400' : 'text-white'
                        }`}
                      >
                        {op.name}
                      </span>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {op.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer with selection count */}
        <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-slate-400">
            {selectedOps.length} operation{selectedOps.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs text-white font-medium transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}