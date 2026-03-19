import { X, Snowflake, Mountain } from 'lucide-react';

interface PolarCodeSelectorProps {
  onClose: () => void;
  n60PolarCode: boolean;
  setN60PolarCode: (enabled: boolean) => void;
  s60PolarCode: boolean;
  setS60PolarCode: (enabled: boolean) => void;
}

export function PolarCodeSelector({
  onClose,
  n60PolarCode,
  setN60PolarCode,
  s60PolarCode,
  setS60PolarCode,
}: PolarCodeSelectorProps) {
  const polarCodes = [
    {
      id: 'n60',
      name: 'Arctic Polar Code (N60)',
      description: 'IMO Polar Code - North of 60°N latitude',
      icon: <Snowflake className="w-5 h-5" />,
      enabled: n60PolarCode,
      setEnabled: setN60PolarCode,
      color: 'cyan',
      region: 'Arctic',
    },
    {
      id: 's60',
      name: 'Antarctic Polar Code (S60)',
      description: 'IMO Polar Code - South of 60°S latitude',
      icon: <Mountain className="w-5 h-5" />,
      enabled: s60PolarCode,
      setEnabled: setS60PolarCode,
      color: 'blue',
      region: 'Antarctic',
    },
  ];

  const activeCount = polarCodes.filter(pc => pc.enabled).length;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[240px] z-50"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[400px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <div>
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">IMO Polar Code</h3>
              <p className="text-[10px] text-slate-400">
                {activeCount} active • Category A/B/C vessel compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Polar Code Options */}
        <div className="p-3 space-y-2 flex-1 overflow-y-auto">
          {polarCodes.map((code) => (
            <button
              key={code.id}
              onClick={() => code.setEnabled(!code.enabled)}
              className={`w-full p-4 rounded-lg border transition-all text-left group ${
                code.enabled
                  ? 'bg-amber-600/20 border-amber-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                    code.enabled
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {code.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span
                        className={`text-sm font-semibold block ${
                          code.enabled ? 'text-amber-400' : 'text-white'
                        }`}
                      >
                        {code.name}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {code.region} Region
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{code.description}</p>
                  
                  {/* Additional info */}
                  <div className="mt-2 flex gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                      Cat A/B/C
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                      Ice Navigation
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                      Environmental
                    </span>
                  </div>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    code.enabled
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {code.enabled && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info Box */}
        <div className="mx-3 mb-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-start gap-2">
            <div className="w-1 h-4 bg-amber-500 rounded-full mt-0.5" />
            <div className="text-xs text-slate-400 leading-relaxed">
              <span className="text-amber-400 font-semibold">IMO Polar Code</span> applies to vessels operating in polar waters.
              Requirements include ice navigation training, environmental protection measures, and enhanced safety equipment.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">
              Polar regions require enhanced operational standards
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}