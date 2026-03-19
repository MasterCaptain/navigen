import { Sun, Moon, Sunset } from 'lucide-react';

export type DisplayMode = 'day' | 'dusk' | 'night';

interface DayNightModeSelectorProps {
  onClose: () => void;
  currentMode: DisplayMode;
  onSelectMode: (mode: DisplayMode) => void;
}

export function DayNightModeSelector({ onClose, currentMode, onSelectMode }: DayNightModeSelectorProps) {
  const modes = [
    {
      id: 'day' as DisplayMode,
      name: 'Day Mode',
      description: 'Full color display for daylight operations',
      icon: Sun,
      color: 'cyan',
      brightness: '100%',
    },
    {
      id: 'dusk' as DisplayMode,
      name: 'Dusk Mode',
      description: 'Reduced brightness for twilight conditions',
      icon: Sunset,
      color: 'amber',
      brightness: '60%',
    },
    {
      id: 'night' as DisplayMode,
      name: 'Night Mode',
      description: 'Red-filtered low brightness for night navigation',
      icon: Moon,
      color: 'red',
      brightness: '30%',
    },
  ];

  const handleSelect = (mode: DisplayMode) => {
    onSelectMode(mode);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Sun className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-100">Display Mode</h2>
          </div>
          <p className="text-sm text-slate-400">
            Select display mode for current lighting conditions
          </p>
        </div>

        {/* Mode options */}
        <div className="space-y-3 mb-6">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;
            const colorClasses = {
              cyan: 'border-cyan-500/50 bg-cyan-950/30',
              amber: 'border-amber-500/50 bg-amber-950/30',
              red: 'border-red-500/50 bg-red-950/30',
            };
            const textColorClasses = {
              cyan: 'text-cyan-400',
              amber: 'text-amber-400',
              red: 'text-red-400',
            };

            return (
              <button
                key={mode.id}
                onClick={() => handleSelect(mode.id)}
                className={`
                  w-full p-4 rounded-lg border-2 transition-all text-left
                  ${isActive 
                    ? colorClasses[mode.color] 
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                  }
                `}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 mt-0.5 ${isActive ? textColorClasses[mode.color] : 'text-slate-400'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${isActive ? textColorClasses[mode.color].replace('400', '300') : 'text-slate-200'}`}>
                        {mode.name}
                      </span>
                      {isActive && (
                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                      {mode.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${isActive ? `bg-${mode.color}-500` : 'bg-slate-600'}`}
                          style={{ width: mode.brightness }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{mode.brightness}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info panel */}
        <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-lg space-y-2 mb-4">
          <p className="text-xs text-cyan-400/90">
            💡 <strong>Day Mode:</strong> Standard ECDIS display with full color spectrum and brightness.
          </p>
          <p className="text-xs text-cyan-400/90">
            💡 <strong>Dusk Mode:</strong> Reduced brightness suitable for dawn/dusk navigation.
          </p>
          <p className="text-xs text-cyan-400/90">
            💡 <strong>Night Mode:</strong> Red-filtered display preserves night vision per SOLAS guidelines.
          </p>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
