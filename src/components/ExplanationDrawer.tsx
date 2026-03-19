import { X, Clock, FileDown, Copy } from 'lucide-react';
import type { PlannedOp } from '../types/plannedOps';

interface ExplanationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  zone: string;
  activity: string;
  polarCode: string;
  plannedOps: PlannedOp[];
  vesselPosition: { lat: number; lng: number };
}

export function ExplanationDrawer({ open, onOpenChange, zone, activity, polarCode, plannedOps, vesselPosition }: ExplanationDrawerProps) {
  if (!open) return null;

  const decisionSteps = [
    { time: '14:32:01', text: `Context changed: Activity → ${activity}` },
    { time: '14:32:01', text: `Zone filter applied: ${zone}` },
    { time: '14:32:01', text: `Polar Code: ${polarCode}` },
    { time: '14:32:02', text: 'IAATO guidelines loaded (12 rules)' },
    { time: '14:32:02', text: 'Conflict resolution: 6 MUST, 2 SHOULD, 1 CONSIDER' },
  ];

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-700 bg-slate-800/50 flex-shrink-0">
          <h3 className="text-base text-white font-semibold">Why these rules are shown</h3>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Context Summary */}
          <div className="space-y-3 p-4 bg-slate-950/50 rounded-lg border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Zone:</span>
              <span className="text-sm text-white font-medium">{zone}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Activity:</span>
              <span className="text-sm text-white font-medium">{activity}</span>
            </div>
            
            <div className="pt-2 border-t border-slate-800">
              <div className="text-sm text-slate-400 mb-2">Active standards:</div>
              <div className="flex flex-wrap gap-1.5">
                {['IAATO', 'IMO', 'SOLAS', 'MARPOL'].map(std => (
                  <span
                    key={std}
                    className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400 font-medium"
                  >
                    {std}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-800">
              <div className="text-sm text-slate-400 mb-1">Conflict rule:</div>
              <div className="text-sm text-white">"Strictest applicable requirement"</div>
            </div>
          </div>

          {/* Decision Trace */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              <span>Decision Trace</span>
            </div>
            
            <div className="space-y-2">
              {decisionSteps.map((step, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ${idx === decisionSteps.length - 1 ? 'bg-amber-500' : 'bg-slate-600'}`} />
                    {idx < decisionSteps.length - 1 && (
                      <div className="w-px h-full bg-slate-700 mt-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-3">
                    <div className="text-xs text-slate-500 mb-1">{step.time}</div>
                    <div className="text-sm text-slate-300">{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Note */}
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Audit note</label>
            <textarea
              placeholder="Add context or override justification..."
              className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 rounded-lg text-white text-sm placeholder-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 resize-none transition-colors"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2">
              <FileDown className="w-4 h-4" />
              Export report
            </button>
            <button className="flex-1 px-4 py-2.5 bg-slate-950/50 hover:bg-slate-800 text-slate-400 rounded-lg text-sm font-medium transition-colors border border-slate-800 flex items-center justify-center gap-2">
              <Copy className="w-4 h-4" />
              Copy trace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}