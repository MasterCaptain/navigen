import { X, Anchor, Ship, Waves, Globe, Shield, MapPin } from 'lucide-react';

interface ZoneSelectorProps {
  onClose: () => void;
  highSeasZone: boolean;
  setHighSeasZone: (enabled: boolean) => void;
  svalbardZone: boolean;
  setSvalbardZone: (enabled: boolean) => void;
  expeditionZone: boolean;
  setExpeditionZone: (enabled: boolean) => void;
  zodiacZone: boolean;
  setZodiacZone: (enabled: boolean) => void;
  marpolZone: boolean;
  setMarpolZone: (enabled: boolean) => void;
  portZone: boolean;
  setPortZone: (enabled: boolean) => void;
}

export function ZoneSelector({
  onClose,
  highSeasZone,
  setHighSeasZone,
  svalbardZone,
  setSvalbardZone,
  expeditionZone,
  setExpeditionZone,
  zodiacZone,
  setZodiacZone,
  marpolZone,
  setMarpolZone,
  portZone,
  setPortZone,
}: ZoneSelectorProps) {
  const zones = [
    {
      id: 'highSeas',
      name: 'High Seas',
      description: 'International waters - IMO conventions apply',
      icon: <Waves className="w-5 h-5" />,
      enabled: highSeasZone,
      setEnabled: setHighSeasZone,
      color: 'cyan',
    },
    {
      id: 'svalbard',
      name: 'Svalbard Operations',
      description: 'Svalbard Environmental Protection Act compliance',
      icon: <MapPin className="w-5 h-5" />,
      enabled: svalbardZone,
      setEnabled: setSvalbardZone,
      color: 'blue',
    },
    {
      id: 'expedition',
      name: 'Expedition Mode',
      description: 'IAATO/AECO polar expedition guidelines',
      icon: <Globe className="w-5 h-5" />,
      enabled: expeditionZone,
      setEnabled: setExpeditionZone,
      color: 'purple',
    },
    {
      id: 'zodiac',
      name: 'Zodiac Operations',
      description: 'Small craft operations in sensitive areas',
      icon: <Ship className="w-5 h-5" />,
      enabled: zodiacZone,
      setEnabled: setZodiacZone,
      color: 'emerald',
    },
    {
      id: 'marpol',
      name: 'MARPOL Special Areas',
      description: 'Marine Pollution Convention compliance',
      icon: <Shield className="w-5 h-5" />,
      enabled: marpolZone,
      setEnabled: setMarpolZone,
      color: 'green',
    },
    {
      id: 'port',
      name: 'Port Operations',
      description: 'Port and harbor regulations',
      icon: <Anchor className="w-5 h-5" />,
      enabled: portZone,
      setEnabled: setPortZone,
      color: 'amber',
    },
  ];

  const activeCount = zones.filter(z => z.enabled).length;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-4 z-50"
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
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Select Zones</h3>
              <p className="text-[10px] text-slate-400">
                {activeCount} active • Multiple zones = combined compliance
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

        {/* Zone Options - Scrollable */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {zones.map((zone) => (
            <button
              key={zone.id}
              onClick={() => zone.setEnabled(!zone.enabled)}
              className={`w-full p-3 rounded-lg border transition-all text-left group ${
                zone.enabled
                  ? 'bg-amber-600/20 border-amber-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    zone.enabled
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {zone.icon}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        zone.enabled ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {zone.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{zone.description}</p>
                </div>

                {/* Checkbox */}
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    zone.enabled
                      ? 'bg-amber-500 border-amber-500'
                      : 'border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {zone.enabled && (
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

        {/* Footer Info */}
        <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-slate-400">
              Active zones combine to determine applicable rules
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}