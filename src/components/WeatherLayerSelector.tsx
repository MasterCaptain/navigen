import { Cloud, CloudRain, Wind, Thermometer } from 'lucide-react';
import { useState } from 'react';

export type WeatherLayerType = 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature';

interface WeatherLayerSelectorProps {
  activeLayer: WeatherLayerType;
  onLayerChange: (layer: WeatherLayerType) => void;
}

export function WeatherLayerSelector({ activeLayer, onLayerChange }: WeatherLayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const layers: { type: WeatherLayerType; icon: React.ReactNode; label: string; description?: string }[] = [
    { type: 'none', icon: <Cloud className="w-4 h-4" />, label: 'Off', description: 'No weather overlay' },
    { type: 'clouds', icon: <Cloud className="w-4 h-4" />, label: 'Clouds', description: 'Cloud coverage' },
    { type: 'precipitation', icon: <CloudRain className="w-4 h-4" />, label: 'Precipitation', description: 'Rain/snow radar' },
    { type: 'wind', icon: <Wind className="w-4 h-4" />, label: 'Wind Arrows', description: 'Wind speed & direction' },
    { type: 'temperature', icon: <Thermometer className="w-4 h-4" />, label: 'Temperature', description: 'Air temperature' },
  ];

  const activeLayerObj = layers.find(l => l.type === activeLayer) || layers[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-10 px-3 rounded-lg border backdrop-blur-sm transition-all flex items-center gap-2 ${
          activeLayer === 'none'
            ? 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:border-slate-600'
            : 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400 hover:border-cyan-400'
        }`}
      >
        {activeLayerObj.icon}
        <span className="text-xs font-medium uppercase tracking-wide">
          Weather: {activeLayerObj.label}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 w-56 bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl overflow-hidden z-50">
            <div className="p-2 border-b border-slate-700/50">
              <div className="text-xs text-slate-400 uppercase tracking-wide font-semibold px-2 py-1">
                Weather Overlay
              </div>
            </div>
            <div className="p-2 space-y-1">
              {layers.map((layer) => (
                <button
                  key={layer.type}
                  onClick={() => {
                    onLayerChange(layer.type);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    activeLayer === layer.type
                      ? 'bg-cyan-600/30 border border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border border-transparent text-slate-300 hover:bg-slate-800/50 hover:text-white'
                  }`}
                >
                  <div className="mt-0.5">{layer.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{layer.label}</div>
                    {layer.description && (
                      <div className="text-xs text-slate-500 mt-0.5">{layer.description}</div>
                    )}
                  </div>
                  {activeLayer === layer.type && (
                    <div className="mt-1.5 w-2 h-2 rounded-full bg-cyan-400" />
                  )}
                </button>
              ))}
            </div>
            <div className="p-2 border-t border-slate-700/50 bg-slate-900/50">
              <div className="text-xs text-slate-500 px-2 py-1">
                Data: OpenWeatherMap (TEST)
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
