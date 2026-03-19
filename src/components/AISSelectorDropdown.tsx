import { X, Radio } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';

interface AISSelectorDropdownProps {
  aisPanelVisible: boolean;
  onToggleAIS: () => void;
}

export function AISSelectorDropdown({
  aisPanelVisible,
  onToggleAIS,
}: AISSelectorDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="h-10 px-3 flex items-center gap-2 bg-slate-800/80 border border-cyan-500/30 rounded-lg hover:bg-slate-700/80 transition-all group"
      >
        <Radio className="w-4 h-4 text-cyan-400" />
        <div className="flex flex-col items-start">
          <span className="text-[10px] text-slate-400 leading-none">AIS</span>
          <span className="text-xs text-cyan-400 font-medium leading-none mt-0.5">
            {aisPanelVisible ? 'PANEL OPEN' : 'TARGETS'}
          </span>
        </div>
        <div className="w-px h-6 bg-cyan-500/30 ml-1" />
        <svg className="w-3 h-3 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    );
  }

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[12px] z-[100]"
      onClick={() => setIsOpen(false)}
    >
      {/* Dialog */}
      <div 
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[420px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <div>
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">AIS Targets</h3>
              <p className="text-[10px] text-slate-400">Vessel Traffic Display</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* AIS Panel Toggle */}
          <div className="space-y-2">
            <label className="text-xs text-slate-300 font-medium block">AIS Traffic Panel</label>
            <button
              onClick={() => {
                onToggleAIS();
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 rounded-lg border transition-all text-sm font-medium ${
                aisPanelVisible
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {aisPanelVisible ? '✓ PANEL VISIBLE' : 'SHOW PANEL'}
            </button>
          </div>

          {/* Info */}
          <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-3">
            <div className="text-xs text-slate-400 space-y-1">
              <p>• Real-time vessel traffic around your position</p>
              <p>• CPA/TCPA collision avoidance calculations</p>
              <p>• Filter by vessel type</p>
              <p>• Click vessels for detailed information</p>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}