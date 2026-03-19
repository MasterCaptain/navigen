import { SegmentedControl } from './ui/SegmentedControl';
import { Toggle } from './ui/Toggle';
import { RefreshCw } from 'lucide-react';

interface ContextPanelProps {
  zone: 'HIGH SEAS' | 'EXPEDITION' | 'PORT';
  setZone: (zone: 'HIGH SEAS' | 'EXPEDITION' | 'PORT') => void;
  activity: 'UNDERWAY' | 'ZODIAC OPS' | 'PORT OPS';
  setActivity: (activity: 'UNDERWAY' | 'ZODIAC OPS' | 'PORT OPS') => void;
  iaato: boolean;
  setIaato: (value: boolean) => void;
  companySop: boolean;
  setCompanySop: (value: boolean) => void;
  trainingMode: boolean;
  setTrainingMode: (value: boolean) => void;
  speed: string;
  setSpeed: (value: string) => void;
  wave: string;
  setWave: (value: string) => void;
  current: string;
  setCurrent: (value: string) => void;
  onReset: () => void;
}

export function ContextPanel({
  zone,
  setZone,
  activity,
  setActivity,
  iaato,
  setIaato,
  companySop,
  setCompanySop,
  trainingMode,
  setTrainingMode,
  speed,
  setSpeed,
  wave,
  setWave,
  current,
  setCurrent,
  onReset,
}: ContextPanelProps) {
  return (
    <div className="w-[320px] flex-shrink-0">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 sticky top-0">
        <h3 className="text-lg text-white font-semibold">Context</h3>

        {/* Zone Section */}
        <div className="space-y-3">
          <label className="text-sm text-slate-400 font-medium">Zone</label>
          <SegmentedControl
            options={['HIGH SEAS', 'EXPEDITION', 'PORT']}
            value={zone}
            onChange={setZone}
          />
        </div>

        {/* Activity Section */}
        <div className="space-y-3">
          <label className="text-sm text-slate-400 font-medium">Activity</label>
          <SegmentedControl
            options={['UNDERWAY', 'ZODIAC OPS', 'PORT OPS']}
            value={activity}
            onChange={setActivity}
          />
        </div>

        {/* Toggles Section */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <Toggle
            label="Industry guidelines (IAATO/AECO)"
            checked={iaato}
            onChange={setIaato}
          />
          <Toggle
            label="Company SOP overlay"
            checked={companySop}
            onChange={setCompanySop}
          />
          <Toggle
            label="Training mode"
            checked={trainingMode}
            onChange={setTrainingMode}
          />
        </div>

        {/* Inputs Section */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Speed (kts)</label>
            <input
              type="number"
              value={speed}
              onChange={(e) => setSpeed(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              step="0.1"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Wave (m)</label>
            <input
              type="number"
              value={wave}
              onChange={(e) => setWave(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              step="0.1"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-slate-400 font-medium">Current (kts)</label>
            <input
              type="number"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
              step="0.1"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-3 border-t border-slate-800">
          <button className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-amber-500/20">
            Simulate context change
          </button>
          <button
            onClick={onReset}
            className="w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors border border-slate-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}