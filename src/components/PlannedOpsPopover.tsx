import * as React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { CheckSquare, X } from "lucide-react";
import type { PlannedOp } from '../types/plannedOps';

interface PlannedOpsPopoverProps {
  value: PlannedOp[];
  onChange: (next: PlannedOp[]) => void;
  className?: string;
  showChips?: boolean;
}

const OPS: { key: PlannedOp; label: string; hint?: string }[] = [
  { key: "HELICOPTER_OPS", label: "Helicopter", hint: "HLO / deck ops / fuel & FOD controls" },
  { key: "BUNKERING", label: "Bunkering", hint: "STS / spill prevention / permits" },
  { key: "ANCHORING", label: "Anchoring", hint: "ground tackle / chart checks / watchkeeping" },
  { key: "ICE_NAV", label: "Ice Nav", hint: "Polar code / ice watch / speed limits" },
  { key: "DIVING", label: "Diving", hint: "dive ops / launch & recovery / safety perimeter" },
  { key: "ZODIAC_OPS", label: "Zodiac", hint: "landing / pax limits / comms" },
  { key: "DRONE_OPS", label: "Drones", hint: "UAS permissions / no-fly / privacy" },
];

export function PlannedOpsPopover(props: PlannedOpsPopoverProps) {
  const { value, onChange, className, showChips = true } = props;
  const [open, setOpen] = React.useState(false);
  const set = React.useMemo(() => new Set<PlannedOp>(value), [value]);

  const setOp = (key: PlannedOp, checked: boolean) => {
    const next = new Set(set);
    if (checked) next.add(key);
    else next.delete(key);
    onChange(Array.from(next));
  };

  const clearAll = () => onChange([]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={`h-8 px-2 rounded-md bg-slate-900/90 border border-slate-700/60 text-slate-200 hover:text-cyan-300 flex items-center gap-2 text-[12px] font-medium transition-colors ${className || ''}`}>
          <CheckSquare className="h-4 w-4" />
          Planned Ops
          {value.length > 0 && (
            <span className="text-[11px] text-cyan-300/90 font-mono">
              ({value.length})
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent 
        className="w-[320px] p-3 bg-slate-900/95 border border-slate-700/60 text-slate-100 backdrop-blur-md"
        align="end"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] font-semibold tracking-wide">Planned Operations</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Toggle to filter MUST/SHOULD/CONSIDER.
            </div>
          </div>

          <button
            onClick={clearAll}
            className="h-8 w-8 rounded-lg hover:bg-slate-800/70 flex items-center justify-center transition-colors"
            title="Clear all"
          >
            <X className="h-4 w-4 text-slate-300" />
          </button>
        </div>

        <div className="my-3 h-px bg-slate-700/60" />

        <div className="space-y-2">
          {OPS.map((op) => (
            <div
              key={op.key}
              className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-slate-800/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-medium">{op.label}</div>
                {op.hint && (
                  <div className="text-[10px] text-slate-400 truncate">{op.hint}</div>
                )}
              </div>

              {/* Toggle Switch */}
              <button
                onClick={() => setOp(op.key, !set.has(op.key))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  set.has(op.key) ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    set.has(op.key) ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        {showChips && (
          <>
            <div className="my-3 h-px bg-slate-700/60" />
            <div className="text-[10px] text-slate-400 mb-2">Active:</div>
            <div className="flex flex-wrap gap-1.5">
              {value.length === 0 ? (
                <span className="text-[11px] text-slate-500">None</span>
              ) : (
                value
                  .slice()
                  .sort()
                  .map((k) => (
                    <span
                      key={k}
                      className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 font-mono"
                    >
                      {k.replace('_', ' ')}
                    </span>
                  ))
              )}
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
