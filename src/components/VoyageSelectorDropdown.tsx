import { X, Ship, Map, Calendar } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import type { PlannedOp } from '../types/plannedOps';

type VoyageSettings = {
  activeZones: string[];
  activeActivity: string;
  plannedOps: PlannedOp[];
};

interface VoyageSelectorDropdownProps {
  value: VoyageSettings;
  onChange: (next: VoyageSettings) => void;
  onManageZones: () => void;
  onOpenVoyagePlanner: () => void;
}

const ACTIVITY_OPTIONS = [
  'AT ANCHOR',
  'UNDERWAY',
  'RESTRICTED MANEUVERABILITY',
  'ANCHORING',
  'MOORING',
  'WILDLIFE OBSERVATION',
  'ZODIAC OPERATIONS',
  'RESEARCH',
  'REFUELING',
  'CARGO OPS',
];

export function VoyageSelectorDropdown({
  value,
  onChange,
  onManageZones,
  onOpenVoyagePlanner,
}: VoyageSelectorDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Count active planned ops
  const plannedOpsCount = value.plannedOps.length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-40 px-3 py-1.5 backdrop-blur-md border rounded-lg text-left transition-all shadow-lg bg-slate-900/95 border-slate-700/50 hover:bg-slate-800/95 hover:border-slate-600/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ship className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white font-medium">Voyage</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5 truncate">
          {value.activeActivity}
        </div>
      </button>
    );
  }

  const dropdownContent = (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[12px] z-[100]"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[420px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <div>
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Voyage Settings</h3>
              <p className="text-[10px] text-slate-400">
                {value.activeZones.join(' + ')} • {value.activeActivity}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          
          {/* Active Zones */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Map className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Zones</h4>
            </div>
            <div className="p-3 rounded border border-slate-700/50 bg-slate-800/30">
              <div className="flex flex-wrap gap-1.5 mb-2">
                {value.activeZones.map((zone) => (
                  <div
                    key={zone}
                    className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/50 rounded text-[10px] text-cyan-400 font-medium"
                  >
                    {zone}
                  </div>
                ))}
                {value.activeZones.length === 0 && (
                  <div className="text-[10px] text-slate-500 italic">No zones selected</div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onManageZones();
                }}
                className="w-full p-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-[10px] text-slate-300 font-medium transition-all"
              >
                MANAGE ZONES
              </button>
            </div>
          </div>

          {/* Current Activity */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current Activity</h4>
            </div>
            <select
              value={value.activeActivity}
              onChange={(e) => {
                e.stopPropagation();
                onChange({ ...value, activeActivity: e.target.value });
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full p-2.5 bg-slate-800/50 border border-slate-700/50 rounded text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
            >
              {ACTIVITY_OPTIONS.map((activity) => (
                <option key={activity} value={activity}>
                  {activity}
                </option>
              ))}
            </select>
          </div>

          {/* Planned Operations */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Planned Operations</h4>
            </div>
            <div className="p-3 rounded border border-slate-700/50 bg-slate-800/30">
              {value.plannedOps.length > 0 ? (
                <div className="space-y-1.5 mb-2">
                  {value.plannedOps.map((op) => (
                    <div
                      key={op.id}
                      className="flex items-center justify-between p-2 bg-slate-900/50 border border-slate-700/30 rounded"
                    >
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-300 font-medium">{op.type}</div>
                        <div className="text-[9px] text-slate-500">{op.startTime} - {op.endTime}</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onChange({
                            ...value,
                            plannedOps: value.plannedOps.filter((p) => p.id !== op.id),
                          });
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic mb-2">No planned operations</div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onOpenVoyagePlanner();
                }}
                className="w-full p-2 bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600/50 rounded text-[10px] text-slate-300 font-medium transition-all"
              >
                OPEN VOYAGE PLANNER
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );

  return createPortal(dropdownContent, document.body);
}