import { X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ToolsSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  cursorBoxVisible: boolean;
  onToggleCursorBox: () => void;
  coursePredictorVisible: boolean;
  onToggleCoursePredictor: () => void;
  coursePredictorMinutes: number;
  onSetCoursePredictorMinutes: (minutes: number) => void;
  setDriftVisible: boolean;
  onToggleSetDrift: () => void;
}

export function ToolsSelector({ 
  isOpen, 
  onClose, 
  cursorBoxVisible, 
  onToggleCursorBox,
  coursePredictorVisible,
  onToggleCoursePredictor,
  coursePredictorMinutes,
  onSetCoursePredictorMinutes,
  setDriftVisible,
  onToggleSetDrift
}: ToolsSelectorProps) {
  const [showMinutesMenu, setShowMinutesMenu] = useState(false);
  
  const minuteOptions = [3, 6, 9, 12, 15, 20, 30, 45, 60];
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[720px] z-50"
      onClick={onClose}
    >
      <div
        className="w-80 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 bg-slate-800/50 flex-shrink-0">
          <div>
            <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wide">Tools</h3>
            <p className="text-[10px] text-slate-500 mt-0.5">Display options and utilities</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-700/50 rounded transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {/* CURSOR Box Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">CURSOR Info Box</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Show/hide draggable cursor position display
              </div>
            </div>
            <button
              onClick={onToggleCursorBox}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                cursorBoxVisible ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  cursorBoxVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Course Predictor Section */}
          <div className="space-y-2">
            {/* Course Predictor Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
              <div className="flex-1">
                <div className="text-sm font-semibold text-slate-200">Course Predictor</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  Show COG vector with time markers
                </div>
              </div>
              <button
                onClick={onToggleCoursePredictor}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  coursePredictorVisible ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    coursePredictorVisible ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Course Predictor Time Range Selector */}
            {coursePredictorVisible && (
              <div className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    Predictor Range
                  </div>
                  <div className="text-xs font-mono text-cyan-400 font-bold">
                    {coursePredictorMinutes} min
                  </div>
                </div>
                
                {/* Preset buttons grid */}
                <div className="grid grid-cols-5 gap-1.5">
                  {minuteOptions.map((minutes) => (
                    <button
                      key={minutes}
                      onClick={() => onSetCoursePredictorMinutes(minutes)}
                      className={`px-2 py-1.5 rounded text-[10px] font-mono font-semibold transition-all ${
                        coursePredictorMinutes === minutes
                          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                          : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 hover:text-cyan-400'
                      }`}
                    >
                      {minutes}
                    </button>
                  ))}
                </div>
                
                <div className="mt-2 text-[9px] text-slate-500">
                  Predictor shows estimated position after selected time based on SOG and COG
                </div>
              </div>
            )}
          </div>

          {/* Set & Drift Vector Toggle */}
          <div className="flex items-center justify-between p-3 bg-slate-800/40 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-colors">
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-200">Set & Drift</div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Show heading vector and drift angle
              </div>
            </div>
            <button
              onClick={onToggleSetDrift}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                setDriftVisible ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  setDriftVisible ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Future tools can be added here */}
          <div className="pt-2 border-t border-slate-700/40">
            <div className="text-[9px] text-slate-600 uppercase tracking-wider font-semibold">
              More tools coming soon
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}