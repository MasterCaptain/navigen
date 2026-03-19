import { X, Map, Layers, Fish, Shield } from 'lucide-react';
import React from 'react';

interface MapsSelectorProps {
  arcticPolarVisible: boolean;
  onArcticPolarChange: (enabled: boolean) => void;
  antarcticPolarVisible: boolean;
  onAntarcticPolarChange: (enabled: boolean) => void;
  solasZonesVisible?: boolean;
  onSolasZonesChange?: (enabled: boolean) => void;
  marpolAreasVisible?: boolean;
  onMarpolAreasChange?: (enabled: boolean) => void;
  openSeaMapLayer: boolean;
  onOpenSeaMapLayerChange: (enabled: boolean) => void;
  fiskeridirLayer: boolean;
  onFiskeridirLayerChange: (enabled: boolean) => void;
  tssLayer: boolean;
  onTssLayerChange: (enabled: boolean) => void;
}

export function MapsSelector({
  arcticPolarVisible,
  onArcticPolarChange,
  antarcticPolarVisible,
  onAntarcticPolarChange,
  solasZonesVisible,
  onSolasZonesChange,
  marpolAreasVisible,
  onMarpolAreasChange,
  openSeaMapLayer,
  onOpenSeaMapLayerChange,
  fiskeridirLayer,
  onFiskeridirLayerChange,
  tssLayer,
  onTssLayerChange,
}: MapsSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Base Map (always active, cannot be toggled)
  const baseMap = {
    name: 'Nautical Base Map',
    description: 'GEBCO Bathymetry + Natural Earth Geographic',
    status: 'Always Active',
  };

  // Overlay layers (can be toggled on/off)
  const overlayLayers = [
    {
      id: 'opensea',
      name: 'OpenSeaMap',
      description: 'Nautical features - buoys, lights, depth contours',
      icon: <Layers className="w-5 h-5" />,
      enabled: openSeaMapLayer,
      setEnabled: onOpenSeaMapLayerChange,
      color: 'cyan',
      global: true,
    },
    {
      id: 'fiskeridir-map',
      name: 'Kartverket Sjøkart',
      description: 'Norwegian nautical chart overlay',
      icon: <Map className="w-5 h-5" />,
      enabled: fiskeridirLayer,
      onChange: onFiskeridirLayerChange,
    },
    {
      id: 'tss-map',
      name: 'Traffic Separation Scheme',
      description: 'International maritime traffic separation scheme',
      icon: <Map className="w-5 h-5" />,
      enabled: tssLayer,
      onChange: onTssLayerChange,
    },
  ];

  const activeCount = overlayLayers.filter(l => l.enabled).length;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-48 px-3 py-2.5 bg-slate-900/95 backdrop-blur-md border border-cyan-900/30 rounded-lg text-left hover:bg-slate-800/95 hover:border-cyan-700/50 transition-all shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white font-medium">Maps & Overlays</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {activeCount} overlay{activeCount !== 1 ? 's' : ''} active
        </div>
      </button>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[360px] z-50"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[450px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-cyan-500 rounded-full" />
            <div>
              <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Map Module</h3>
              <p className="text-[10px] text-slate-400">
                {activeCount} overlay{activeCount !== 1 ? 's' : ''} active • Base map always visible
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        <div className="p-3 space-y-3 overflow-y-auto flex-1">
          {/* Base Map Section */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Map className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Base Map</h4>
            </div>
            <div className="p-3 rounded-lg border border-slate-700/50 bg-slate-800/30">
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-slate-700/50 text-slate-400">
                  <Map className="w-5 h-5" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-white">
                      {baseMap.name}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed mb-2">{baseMap.description}</p>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wide">
                      {baseMap.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Overlay Layers Section */}
          <div>
            <div className="flex items-center gap-2 mb-2 px-1">
              <Layers className="w-3.5 h-3.5 text-slate-500" />
              <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Overlay Layers</h4>
            </div>
            <div className="space-y-2">
              {overlayLayers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => {
                    console.log('🖱️ MapsSelector: Toggling layer', layer.id, 'from', layer.enabled, 'to', !layer.enabled);
                    if (typeof layer.setEnabled === 'function') {
                      layer.setEnabled(!layer.enabled);
                    } else if (typeof layer.onChange === 'function') {
                      layer.onChange(!layer.enabled);
                    }
                  }}
                  className={`w-full p-3 rounded-lg border transition-all text-left group ${
                    layer.enabled
                      ? 'bg-cyan-600/20 border-cyan-500/50'
                      : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        layer.enabled
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                      }`}
                    >
                      {layer.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold ${
                              layer.enabled ? 'text-cyan-400' : 'text-white'
                            }`}
                          >
                            {layer.name}
                          </span>
                          {!layer.global && (
                            <span className="text-[9px] text-slate-500 bg-slate-700/50 px-1.5 py-0.5 rounded uppercase tracking-wide">
                              {layer.region}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{layer.description}</p>
                    </div>

                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        layer.enabled
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {layer.enabled && (
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
          </div>
        </div>

        {/* Footer Info */}
        <div className="h-12 border-t border-slate-700/50 px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-400">
              Overlay layers stack above base map with transparency
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}