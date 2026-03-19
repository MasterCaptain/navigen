import React, { useState } from 'react';
import { Ship, X, Filter } from 'lucide-react';
import { AISOverlay, MOCK_AIS_VESSELS, AISVessel } from './AISOverlay';

interface AISPanelProps {
  vesselPosition: { lat: number; lng: number; speed: number; heading: number };
  onClose: () => void;
}

export function AISPanel({ vesselPosition, onClose }: AISPanelProps) {
  const [selectedVessel, setSelectedVessel] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);

  const filteredVessels = filterType
    ? MOCK_AIS_VESSELS.filter(v => v.type === filterType)
    : MOCK_AIS_VESSELS;

  const vesselTypeCounts = {
    all: MOCK_AIS_VESSELS.length,
    passenger: MOCK_AIS_VESSELS.filter(v => v.type === 'passenger').length,
    cargo: MOCK_AIS_VESSELS.filter(v => v.type === 'cargo').length,
    fishing: MOCK_AIS_VESSELS.filter(v => v.type === 'fishing').length,
    research: MOCK_AIS_VESSELS.filter(v => v.type === 'research').length,
    other: MOCK_AIS_VESSELS.filter(v => v.type === 'other').length,
  };

  return (
    <div className="fixed top-20 left-20 z-[9999] w-96 max-h-[calc(100vh-100px)] flex flex-col bg-slate-900/95 backdrop-blur-md border border-cyan-500/30 rounded-lg shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/40 rounded flex items-center justify-center">
            <Ship className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">AIS Targets</h2>
            <p className="text-gray-400 text-xs">
              {filteredVessels.length} vessel{filteredVessels.length !== 1 ? 's' : ''} in range
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-3 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-2 mb-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
            Filter by Type
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType(null)}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              filterType === null
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold'
                : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-500/30'
            }`}
          >
            All ({vesselTypeCounts.all})
          </button>
          <button
            onClick={() => setFilterType('passenger')}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              filterType === 'passenger'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold'
                : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-500/30'
            }`}
          >
            🚢 Passenger ({vesselTypeCounts.passenger})
          </button>
          <button
            onClick={() => setFilterType('cargo')}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              filterType === 'cargo'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold'
                : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-500/30'
            }`}
          >
            📦 Cargo ({vesselTypeCounts.cargo})
          </button>
          <button
            onClick={() => setFilterType('research')}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              filterType === 'research'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold'
                : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-500/30'
            }`}
          >
            🔬 Research ({vesselTypeCounts.research})
          </button>
          <button
            onClick={() => setFilterType('fishing')}
            className={`text-xs px-3 py-1.5 rounded border transition-all ${
              filterType === 'fishing'
                ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 font-bold'
                : 'bg-slate-800/50 border-slate-600/50 text-gray-400 hover:border-cyan-500/30'
            }`}
          >
            🎣 Fishing ({vesselTypeCounts.fishing})
          </button>
        </div>
      </div>

      {/* Vessel List */}
      <div className="flex-1 overflow-y-auto p-3">
        <AISOverlay
          vessels={filteredVessels}
          ownVessel={vesselPosition}
          onVesselClick={(vessel) => setSelectedVessel(vessel.mmsi)}
          selectedVessel={selectedVessel}
        />
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-slate-700/50 bg-slate-800/30">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              Underway
            </div>
            <div className="text-lg font-bold text-green-400">
              {MOCK_AIS_VESSELS.filter(v => v.speed > 0.5).length}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              At Anchor
            </div>
            <div className="text-lg font-bold text-amber-400">
              {MOCK_AIS_VESSELS.filter(v => v.speed <= 0.5).length}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">
              Range
            </div>
            <div className="text-lg font-bold text-cyan-400">
              25 nm
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
