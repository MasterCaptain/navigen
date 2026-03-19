import { X, Navigation } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import type { GPSSource, SimulationConfig } from './GPSSourceSelectorDropdown';
import type { DisplayMode } from './DayNightModeSelectorDropdown';

type NAVSettings = {
  openSeaMapLayer: boolean;
  fiskeridirLayer: boolean;
  tssLayer: boolean;
  gpsSource: GPSSource;
  simulationConfig: SimulationConfig;
  displayMode: DisplayMode;
  cursorBoxVisible: boolean;
  coursePredictorVisible: boolean;
  coursePredictorMinutes: number;
  setDriftVisible: boolean;
  basemapType: 'ocean' | 'geographic';
};

interface NAVSelectorDropdownProps {
  value: NAVSettings;
  onChange: (next: NAVSettings) => void;
  onOpenNAVModule?: () => void;
}

export function NAVSelectorDropdown({
  value,
  onChange,
  onOpenNAVModule,
}: NAVSelectorDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Count active features
  const overlayCount = [
    value.openSeaMapLayer,
    value.fiskeridirLayer,
    value.tssLayer,
  ].filter(Boolean).length;

  const toolsCount = [
    value.cursorBoxVisible,
    value.coursePredictorVisible,
    value.setDriftVisible,
  ].filter(Boolean).length;

  const totalActive = overlayCount + toolsCount;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-40 px-3 py-1.5 backdrop-blur-md border rounded-lg text-left transition-all shadow-lg bg-slate-900/95 border-slate-700/50 hover:bg-slate-800/95 hover:border-slate-600/50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-white font-medium">Navigation</span>
          </div>
        </div>
        <div className="text-[10px] text-slate-400 mt-0.5">
          {totalActive} active
        </div>
      </button>
    );
  }

  const dropdownContent = (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[12px] z-[100]"
        onClick={() => setIsOpen(false)}
      >
        <div 
          className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[420px] max-h-[85vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-cyan-500 rounded-full" />
              <div>
                <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Navigation Settings</h3>
                <p className="text-[10px] text-slate-400">
                  {totalActive} active
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {/* Base Chart */}
<div>
  <div className="flex items-center gap-2 mb-2 px-1">
    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7l9-4 9 4-9 4-9-4zm0 5l9 4 9-4m-18 5l9 4 9-4" />
    </svg>
    <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Base Chart</h4>
  </div>

  <div className="grid grid-cols-2 gap-2">
    <button
      onClick={() => onChange({ ...value, basemapType: 'ocean' })}
      className={`p-2.5 rounded border text-center transition-all ${
        value.basemapType === 'ocean'
          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
          : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
  <span className="text-sm">🌊</span>
  <span className="text-[10px] font-bold">OCEAN</span>
</div>
<div className="text-[8px] mt-1 opacity-80">Bathymetry</div>
    </button>

    <button
      onClick={() => onChange({ ...value, basemapType: 'geographic' })}
      className={`p-2.5 rounded border text-center transition-all ${
        value.basemapType === 'geographic'
          ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
          : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
  <span className="text-sm">🗺️</span>
  <span className="text-[10px] font-bold">DARK</span>
</div>
<div className="text-[8px] mt-1 opacity-80">Operational dark</div>
    </button>
  </div>
</div>
            
            {/* Chart Overlays */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Chart Overlays</h4>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => onChange({ ...value, openSeaMapLayer: !value.openSeaMapLayer })}
                  className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.openSeaMapLayer
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.openSeaMapLayer && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-300">OpenSeaMap (Seamarks)</span>
                  </div>
                </button>

                <button
                  onClick={() => onChange({ ...value, fiskeridirLayer: !value.fiskeridirLayer })}
                  className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.fiskeridirLayer
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.fiskeridirLayer && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-300">Kartverket Sjøkart</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Navigation Tools */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
                </svg>
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Navigation Tools</h4>
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => onChange({ ...value, cursorBoxVisible: !value.cursorBoxVisible })}
                  className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.cursorBoxVisible
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.cursorBoxVisible && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-300">Cursor Position Box</span>
                  </div>
                </button>

                <button
                  onClick={() => onChange({ ...value, coursePredictorVisible: !value.coursePredictorVisible })}
                  className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.coursePredictorVisible
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.coursePredictorVisible && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-slate-300">Course Predictor Vector</span>
                      {value.coursePredictorVisible && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="range"
                            min="1"
                            max="30"
                            value={value.coursePredictorMinutes}
                            onChange={(e) => onChange({ ...value, coursePredictorMinutes: Number(e.target.value) })}
                            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-[10px] text-cyan-400 font-mono w-10 text-right">{value.coursePredictorMinutes}min</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => onChange({ ...value, setDriftVisible: !value.setDriftVisible })}
                  className="w-full p-2 rounded border border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50 transition-all text-left group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-3.5 h-3.5 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                        value.setDriftVisible
                          ? 'bg-cyan-500 border-cyan-500'
                          : 'border-slate-600 group-hover:border-slate-500'
                      }`}
                    >
                      {value.setDriftVisible && (
                        <svg
                          className="w-2 h-2 text-white"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-300">Set & Drift Vector</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Display Mode */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Display Mode</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onChange({ ...value, displayMode: 'day' })}
                  className={`flex-1 p-2.5 rounded border text-center transition-all ${
                    value.displayMode === 'day'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">DAY</div>
                </button>
                <button
                  onClick={() => onChange({ ...value, displayMode: 'night' })}
                  className={`flex-1 p-2.5 rounded border text-center transition-all ${
                    value.displayMode === 'night'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">NIGHT</div>
                </button>
                <button
                  onClick={() => onChange({ ...value, displayMode: 'dusk' })}
                  className={`flex-1 p-2.5 rounded border text-center transition-all ${
                    value.displayMode === 'dusk'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">DUSK</div>
                </button>
              </div>
            </div>

            {/* GPS Source */}
            <div>
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h4 className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">GPS Source</h4>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* STATIC */}
                <button
                  onClick={() => onChange({ ...value, gpsSource: 'static' })}
                  className={`p-2.5 rounded border text-center transition-all ${
                    value.gpsSource === 'static'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">STATIC</div>
                </button>
                
                {/* DEVICE GPS */}
                <button
                  onClick={() => onChange({ ...value, gpsSource: 'device' })}
                  className={`p-2.5 rounded border text-center transition-all ${
                    value.gpsSource === 'device'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">DEVICE GPS</div>
                </button>
                
                {/* WIFI WS */}
                <button
                  onClick={() => onChange({ ...value, gpsSource: 'websocket' })}
                  className={`p-2.5 rounded border text-center transition-all ${
                    value.gpsSource === 'websocket'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">WIFI WS</div>
                </button>
                
                {/* HTTP */}
                <button
                  onClick={() => onChange({ ...value, gpsSource: 'http' })}
                  className={`p-2.5 rounded border text-center transition-all ${
                    value.gpsSource === 'http'
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                      : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="text-[10px] font-bold">HTTP</div>
                </button>
              </div>
              
              {/* SIMULATION - Full width below */}
              <button
                onClick={() => onChange({ ...value, gpsSource: 'simulation' })}
                className={`w-full mt-2 p-2.5 rounded border text-center transition-all ${
                  value.gpsSource === 'simulation'
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                    : 'bg-slate-800/30 border-slate-700/50 text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <div className="text-[10px] font-bold">SIMULATION</div>
                {value.gpsSource === 'simulation' && (
                  <div className="text-[8px] mt-1 opacity-80">
                    {value.simulationConfig.lat.toFixed(4)}°, {value.simulationConfig.lng.toFixed(4)}° • {value.simulationConfig.speed}kn @ {value.simulationConfig.course}°
                  </div>
                )}
              </button>
              
              {/* Simulation Config Panel */}
              {value.gpsSource === 'simulation' && (
                <div className="mt-2 p-2.5 rounded border border-amber-500/30 bg-amber-500/5">
                  <div className="text-[9px] font-bold text-amber-400 mb-2 uppercase tracking-wider">Simulator Config</div>
                  <div className="space-y-2">
                    {/* Latitude */}
                    <div>
                      <label className="block text-[8px] text-slate-400 mb-1">Latitude (°)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={value.simulationConfig.lat}
                        onChange={(e) => onChange({ ...value, simulationConfig: { ...value.simulationConfig, lat: parseFloat(e.target.value) || 0 } })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-[10px] bg-slate-900/50 border border-slate-700/50 rounded text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                    
                    {/* Longitude */}
                    <div>
                      <label className="block text-[8px] text-slate-400 mb-1">Longitude (°)</label>
                      <input
                        type="number"
                        step="0.0001"
                        value={value.simulationConfig.lng}
                        onChange={(e) => onChange({ ...value, simulationConfig: { ...value.simulationConfig, lng: parseFloat(e.target.value) || 0 } })}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 text-[10px] bg-slate-900/50 border border-slate-700/50 rounded text-white focus:border-amber-500/50 focus:outline-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Speed */}
                      <div>
                        <label className="block text-[8px] text-slate-400 mb-1">Speed (kn)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={value.simulationConfig.speed}
                          onChange={(e) => onChange({ ...value, simulationConfig: { ...value.simulationConfig, speed: parseFloat(e.target.value) || 0 } })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-[10px] bg-slate-900/50 border border-slate-700/50 rounded text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                      
                      {/* Course */}
                      <div>
                        <label className="block text-[8px] text-slate-400 mb-1">Course (°)</label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="359"
                          value={value.simulationConfig.course}
                          onChange={(e) => onChange({ ...value, simulationConfig: { ...value.simulationConfig, course: parseInt(e.target.value) % 360 || 0 } })}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 text-[10px] bg-slate-900/50 border border-slate-700/50 rounded text-white focus:border-amber-500/50 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );

  return createPortal(dropdownContent, document.body);
}