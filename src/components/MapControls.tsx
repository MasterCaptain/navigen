import { Plus, Minus, Navigation, Crosshair, Lock } from 'lucide-react';
import { useState } from 'react';

interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onCenterShip: () => void;
  onSetRelativeCenter: () => void;
  isSettingRelativeCenter: boolean;
  hasRelativeCenter: boolean;
  onClearRelativeCenter: () => void;
  centerLocked?: boolean;
  onToggleCenterLock?: () => void;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onCenterShip,
  onSetRelativeCenter,
  isSettingRelativeCenter,
  hasRelativeCenter,
  onClearRelativeCenter,
  centerLocked = false,
  onToggleCenterLock,
}: MapControlsProps) {
  const [showCenterMenu, setShowCenterMenu] = useState(false);

  // Handle Center button click - toggle center lock
  const handleCenterClick = () => {
    if (onToggleCenterLock) {
      onToggleCenterLock();
    }
    // Also center the ship immediately
    onCenterShip();
  };

  return (
    <div className="absolute top-[65px] left-[1px] z-[100] flex flex-col gap-2 pointer-events-auto">
      {/* Combined Zoom + Center Controls */}
      <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl overflow-hidden">
        <button
          onClick={onZoomIn}
          className="w-8 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors border-b border-slate-700/50"
          title="Zoom inn"
        >
          <Plus className="w-5 h-5" />
        </button>
        
        {/* Center button with lock indicator */}
        <button
          onClick={handleCenterClick}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowCenterMenu(!showCenterMenu);
          }}
          className={`relative w-8 h-10 flex items-center justify-center transition-colors border-b border-slate-700/50 ${
            centerLocked
              ? 'text-cyan-400 bg-cyan-500/10'
              : isSettingRelativeCenter
              ? 'text-cyan-400 animate-pulse'
              : hasRelativeCenter
              ? 'text-cyan-400'
              : 'text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
          }`}
          title={centerLocked ? "Center Locked (click to unlock)" : "Center on vessel (click to lock)"}
        >
          <Navigation className="w-5 h-5" />
          
          {/* Lock indicator - small orange dot in corner */}
          {centerLocked && (
            <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          )}
        </button>
        
        <button
          onClick={onZoomOut}
          className="w-8 h-10 flex items-center justify-center text-slate-300 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
          title="Zoom ut"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>

      {/* Context Menu for Relative Center (right-click) */}
      {showCenterMenu && (
        <div
          className="absolute top-0 left-full ml-2 bg-slate-900/95 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-xl overflow-hidden min-w-[200px]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              onSetRelativeCenter();
              setShowCenterMenu(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
              isSettingRelativeCenter
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-slate-300 hover:bg-slate-800 hover:text-cyan-400'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            <span>Set relative center</span>
          </button>

          {hasRelativeCenter && (
            <button
              onClick={() => {
                onClearRelativeCenter();
                setShowCenterMenu(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2 border-t border-slate-700/50"
            >
              <Crosshair className="w-4 h-4" />
              <span>Clear relative center</span>
            </button>
          )}
        </div>
      )}

      {/* Relative Center Indicator */}
      {isSettingRelativeCenter && (
        <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-500 rounded-lg shadow-xl px-3 py-2 text-xs text-cyan-400 max-w-[200px]">
          Click map to set relative center
        </div>
      )}

      {hasRelativeCenter && !isSettingRelativeCenter && (
        <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-500 rounded-lg shadow-xl px-3 py-2 text-xs text-cyan-400 max-w-[200px]">
          Relative Motion active
        </div>
      )}
    </div>
  );
}