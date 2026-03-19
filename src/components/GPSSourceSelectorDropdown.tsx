import { useState, useRef, useEffect } from 'react';
import { Satellite, Wifi, Monitor, Navigation, ChevronDown } from 'lucide-react';

export type GPSSource = 'device' | 'simulation' | 'websocket' | 'http' | 'static';

export interface SimulationConfig {
  lat: number;
  lng: number;
  speed: number; // knots
  course: number; // degrees
}

interface GPSSourceSelectorDropdownProps {
  value: GPSSource;
  onChange: (value: GPSSource) => void;
  simulationConfig: SimulationConfig;
  onSimulationConfigChange: (config: SimulationConfig) => void;
}

export function GPSSourceSelectorDropdown({ value, onChange, simulationConfig, onSimulationConfigChange }: GPSSourceSelectorDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSimConfig, setShowSimConfig] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hasAutoOpened = useRef(false);

  // Local state for simulation config
  const [localLat, setLocalLat] = useState(simulationConfig.lat.toFixed(4));
  const [localLng, setLocalLng] = useState(simulationConfig.lng.toFixed(4));
  const [localSpeed, setLocalSpeed] = useState(simulationConfig.speed.toString());
  const [localCourse, setLocalCourse] = useState(simulationConfig.course.toString());

  // Auto-open simulator config panel when component mounts if value is 'simulation'
  useEffect(() => {
    if (value === 'simulation' && !hasAutoOpened.current) {
      console.log('🟡 Auto-opening simulator config panel on mount because gpsSource is simulation');
      hasAutoOpened.current = true;
      setIsOpen(true);
      setShowSimConfig(true);
    }
  }, [value]);

  // Also auto-open when dropdown opens and value is simulation
  useEffect(() => {
    if (isOpen && value === 'simulation') {
      console.log('🟡 Auto-opening simulator config because dropdown opened with simulation');
      setShowSimConfig(true);
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowSimConfig(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const sources = {
    static: { label: 'STATIC', icon: Navigation, color: 'text-slate-400', desc: 'Fixed position' },
    device: { label: 'DEVICE GPS', icon: Satellite, color: 'text-emerald-400', desc: 'PC/Phone GPS' },
    simulation: { label: 'SIMULATION', icon: Navigation, color: 'text-amber-400', desc: 'Testing mode' },
    websocket: { label: 'WIFI WS', icon: Wifi, color: 'text-cyan-400', desc: 'NMEA via WiFi' },
    http: { label: 'HTTP', icon: Monitor, color: 'text-blue-400', desc: 'HTTP endpoint' }
  };

  const currentSource = sources[value];
  const Icon = currentSource.icon;

  const handleSourceSelect = (source: GPSSource) => {
    console.log('📍 Source selected:', source);
    if (source === 'simulation') {
      // Show simulation config panel
      console.log('🟡 Opening simulator config panel');
      setShowSimConfig(true);
    } else {
      onChange(source);
      setIsOpen(false);
      setShowSimConfig(false);
    }
  };

  const handleApplySimConfig = () => {
    const updatedConfig: SimulationConfig = {
      lat: parseFloat(localLat) || simulationConfig.lat,
      lng: parseFloat(localLng) || simulationConfig.lng,
      speed: parseFloat(localSpeed) || simulationConfig.speed,
      course: parseFloat(localCourse) % 360 || simulationConfig.course
    };
    
    console.log('✅ Applying simulation config:', updatedConfig);
    onSimulationConfigChange(updatedConfig);
    onChange('simulation');
    setIsOpen(false);
    setShowSimConfig(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => {
          const newIsOpen = !isOpen;
          console.log('🔘 Dropdown clicked, newIsOpen:', newIsOpen);
          setIsOpen(newIsOpen);
          if (newIsOpen && value === 'simulation') {
            setShowSimConfig(true);
          }
        }}
        className="flex items-center gap-2 px-3 py-2 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700/50 rounded transition-colors backdrop-blur-sm min-w-[180px] justify-between"
      >
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${currentSource.color}`} />
          <span className="text-xs font-semibold text-white">{currentSource.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Source list */}
      {isOpen && !showSimConfig && (
        <div className="absolute top-full left-0 mt-1 w-[240px] bg-slate-800 border border-slate-700 rounded shadow-lg z-[100] overflow-hidden">
          {Object.entries(sources).map(([key, source]) => {
            const SourceIcon = source.icon;
            const isActive = value === key;
            return (
              <button
                key={key}
                onClick={() => handleSourceSelect(key as GPSSource)}
                className={`w-full px-3 py-2.5 text-left transition-colors flex items-start gap-2 ${
                  isActive
                    ? 'bg-cyan-500/20'
                    : 'hover:bg-slate-700'
                }`}
              >
                <SourceIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? source.color : 'text-slate-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-white flex items-center gap-2">
                    {source.label}
                    {isActive && <span className="text-[10px] px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">ON</span>}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{source.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Simulation config panel */}
      {isOpen && showSimConfig && (
        <div className="absolute top-full left-0 mt-1 w-[340px] bg-slate-800 border-2 border-amber-500 rounded shadow-2xl z-[100] p-4">
          <div className="flex items-center gap-2 mb-4">
            <Navigation className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold text-amber-300">GPS SIMULATOR</h3>
          </div>
          
          <div className="space-y-3 mb-4">
            {/* Latitude */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Latitude (decimal degrees)</label>
              <input
                type="text"
                value={localLat}
                onChange={(e) => setLocalLat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="78.2232"
              />
            </div>

            {/* Longitude */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Longitude (decimal degrees)</label>
              <input
                type="text"
                value={localLng}
                onChange={(e) => setLocalLng(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500"
                placeholder="15.6267"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Speed */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Speed (knots)</label>
                <input
                  type="text"
                  value={localSpeed}
                  onChange={(e) => setLocalSpeed(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="8.5"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Course (°)</label>
                <input
                  type="text"
                  value={localCourse}
                  onChange={(e) => setLocalCourse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500"
                  placeholder="42"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                console.log('⬅️ Back clicked');
                setShowSimConfig(false);
              }}
              className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm font-bold transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleApplySimConfig}
              className="flex-1 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded text-sm font-bold transition-colors"
            >
              Apply & Start
            </button>
          </div>

          <p className="text-xs text-amber-400/80 mt-3 text-center">
            ⚠️ For testing purposes only
          </p>
        </div>
      )}
    </div>
  );
}