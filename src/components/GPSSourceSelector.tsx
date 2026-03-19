import { Satellite, Wifi, Monitor, Navigation } from 'lucide-react';
import { useState } from 'react';

export type GPSSource = 'device' | 'simulation' | 'websocket' | 'http' | 'static';

export interface SimulationConfig {
  lat: number;
  lng: number;
  speed: number; // knots
  course: number; // degrees
}

interface GPSSourceSelectorProps {
  onClose: () => void;
  currentSource: GPSSource;
  onSelectSource: (source: GPSSource) => void;
  simulationConfig: SimulationConfig;
  onUpdateSimulationConfig: (config: SimulationConfig) => void;
}

export function GPSSourceSelector({ onClose, currentSource, onSelectSource, simulationConfig, onUpdateSimulationConfig }: GPSSourceSelectorProps) {
  const [localConfig, setLocalConfig] = useState<SimulationConfig>(simulationConfig);
  
  // Convert decimal degrees to DDM format for display
  const decimalToDDM = (decimal: number, isLat: boolean) => {
    const abs = Math.abs(decimal);
    const degrees = Math.floor(abs);
    const minutes = (abs - degrees) * 60;
    const direction = isLat 
      ? (decimal >= 0 ? 'N' : 'S')
      : (decimal >= 0 ? 'E' : 'W');
    return { degrees, minutes, direction };
  };
  
  // Convert DDM to decimal degrees
  const ddmToDecimal = (degrees: number, minutes: number, direction: string) => {
    const decimal = degrees + (minutes / 60);
    return (direction === 'S' || direction === 'W') ? -decimal : decimal;
  };
  
  // Local state for DDM inputs
  const latDDM = decimalToDDM(localConfig.lat, true);
  const lngDDM = decimalToDDM(localConfig.lng, false);
  
  const [latDegrees, setLatDegrees] = useState(latDDM.degrees);
  const [latMinutes, setLatMinutes] = useState(latDDM.minutes);
  const [latDir, setLatDir] = useState<'N' | 'S'>(latDDM.direction as 'N' | 'S');
  
  const [lngDegrees, setLngDegrees] = useState(lngDDM.degrees);
  const [lngMinutes, setLngMinutes] = useState(lngDDM.minutes);
  const [lngDir, setLngDir] = useState<'E' | 'W'>(lngDDM.direction as 'E' | 'W');

  const sources = [
    {
      id: 'device' as GPSSource,
      name: 'Device GPS',
      description: 'Use GPS from this PC/phone',
      icon: Satellite,
      color: 'emerald',
      available: typeof navigator !== 'undefined' && 'geolocation' in navigator,
      requiresPermission: true,
    },
    {
      id: 'websocket' as GPSSource,
      name: 'WiFi WebSocket',
      description: 'Connect to NMEA via WiFi (gpsd)',
      icon: Wifi,
      color: 'cyan',
      available: true,
      requiresPermission: false,
    },
    {
      id: 'http' as GPSSource,
      name: 'HTTP Polling',
      description: 'NMEA data from HTTP endpoint',
      icon: Monitor,
      color: 'blue',
      available: true,
      requiresPermission: false,
    },
    {
      id: 'simulation' as GPSSource,
      name: 'Simulation',
      description: 'Simulated GPS for testing',
      icon: Navigation,
      color: 'amber',
      available: true,
      requiresPermission: false,
    },
  ];

  const handleSelect = (source: GPSSource) => {
    // Toggle: if clicking on active source, turn it off (go to static)
    if (currentSource === source) {
      onSelectSource('static');
      onClose();
    } else {
      onSelectSource(source);
      // Don't close for simulation - let user configure it first
      if (source !== 'simulation') {
        onClose();
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div 
        className="bg-slate-900 border border-slate-700 rounded-lg shadow-2xl p-6 max-w-lg w-full mx-4 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <Satellite className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-slate-100">GPS Data Source</h2>
          </div>
          <p className="text-sm text-slate-400">
            Select GPS source - click active source to turn it OFF
          </p>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 -mx-6 px-6">
          {/* Source options */}
          <div className="space-y-3 mb-6">
            {sources.map((source) => {
              const Icon = source.icon;
              const isActive = currentSource === source.id;
              const colorClasses = {
                emerald: 'border-emerald-500/50 bg-emerald-950/30',
                cyan: 'border-cyan-500/50 bg-cyan-950/30',
                blue: 'border-blue-500/50 bg-blue-950/30',
                amber: 'border-amber-500/50 bg-amber-950/30',
              };

              return (
                <button
                  key={source.id}
                  onClick={() => handleSelect(source.id)}
                  disabled={!source.available}
                  className={`
                    w-full p-4 rounded-lg border-2 transition-all text-left
                    ${isActive 
                      ? colorClasses[source.color] 
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800'
                    }
                    ${!source.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${isActive ? `text-${source.color}-400` : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-semibold ${isActive ? `text-${source.color}-300` : 'text-slate-200'}`}>
                          {source.name}
                        </span>
                        {isActive && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full">
                            ACTIVE
                          </span>
                        )}
                        {!source.available && (
                          <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                            UNAVAILABLE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {source.description}
                      </p>
                      {isActive && (
                        <p className="text-xs text-amber-400/80 mt-1">
                          💡 Click to deactivate
                        </p>
                      )}
                      {source.requiresPermission && !isActive && (
                        <p className="text-xs text-amber-400/80 mt-1">
                          ⚠ Requires browser permission
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Simulation Configuration Panel */}
          {(currentSource === 'simulation' || sources.find(s => s.id === 'simulation')) && (
            <div className="mb-6 p-4 bg-amber-950/20 border border-amber-900/30 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <Navigation className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-amber-300">Simulation Configuration</h3>
              </div>
              
              {currentSource !== 'simulation' && (
                <div className="mb-3 p-2 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-400">
                  💡 Select "Simulation" above to activate this configuration
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                {/* Latitude */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Latitude</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="90"
                      step="1"
                      value={latDegrees}
                      onChange={(e) => setLatDegrees(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="61"
                    />
                    <span className="text-slate-400 self-center text-xs">°</span>
                    <input
                      type="number"
                      min="0"
                      max="59.999"
                      step="0.001"
                      value={latMinutes.toFixed(3)}
                      onChange={(e) => setLatMinutes(Math.min(59.999, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="54.997"
                    />
                    <span className="text-slate-400 self-center text-xs">'</span>
                    <select
                      value={latDir}
                      onChange={(e) => setLatDir(e.target.value as 'N' | 'S')}
                      className="w-14 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="N">N</option>
                      <option value="S">S</option>
                    </select>
                  </div>
                </div>
                
                {/* Longitude */}
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Longitude</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="0"
                      max="180"
                      step="1"
                      value={lngDegrees}
                      onChange={(e) => setLngDegrees(Math.min(180, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-20 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="005"
                    />
                    <span className="text-slate-400 self-center text-xs">°</span>
                    <input
                      type="number"
                      min="0"
                      max="59.999"
                      step="0.001"
                      value={lngMinutes.toFixed(3)}
                      onChange={(e) => setLngMinutes(Math.min(59.999, Math.max(0, parseFloat(e.target.value) || 0)))}
                      className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      placeholder="06.000"
                    />
                    <span className="text-slate-400 self-center text-xs">'</span>
                    <select
                      value={lngDir}
                      onChange={(e) => setLngDir(e.target.value as 'E' | 'W')}
                      className="w-14 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="E">E</option>
                      <option value="W">W</option>
                    </select>
                  </div>
                </div>
                
                {/* Speed */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Speed (knots)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="40"
                    value={localConfig.speed}
                    onChange={(e) => setLocalConfig({ ...localConfig, speed: parseFloat(e.target.value) || 0 })}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="12.5"
                  />
                </div>
                
                {/* Course */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Course (°)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="359"
                    value={localConfig.course}
                    onChange={(e) => setLocalConfig({ ...localConfig, course: parseFloat(e.target.value) % 360 })}
                    className="w-full px-2 py-1.5 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    placeholder="42"
                  />
                </div>
              </div>

              {/* Apply Button */}
              <button
                onClick={() => {
                  // Convert DDM to decimal degrees
                  const newLat = ddmToDecimal(latDegrees, latMinutes, latDir);
                  const newLng = ddmToDecimal(lngDegrees, lngMinutes, lngDir);
                  
                  const newConfig = {
                    ...localConfig,
                    lat: newLat,
                    lng: newLng,
                  };
                  
                  onUpdateSimulationConfig(newConfig);
                  onSelectSource('simulation'); // Restart simulation with new config
                }}
                className="w-full px-3 py-2 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded text-xs font-semibold transition-colors"
              >
                Apply Configuration
              </button>

              <p className="text-xs text-amber-400/70 mt-2">
                💡 Configure position, speed, and course for simulation mode
              </p>
              <p className="text-xs text-red-400/80 mt-1 font-medium">
                ⚠️ Simulation does not represent certified navigation data
              </p>
            </div>
          )}

          {/* Status indicator */}
          {currentSource === 'static' && (
            <div className="mb-4 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg">
              <p className="text-sm text-slate-300">
                ⚓ <strong>Static mode:</strong> Vessel position fixed - no GPS source active
              </p>
            </div>
          )}

          {/* Info */}
          <div className="p-3 bg-cyan-950/20 border border-cyan-900/30 rounded-lg space-y-2 mb-4">
            <p className="text-xs text-cyan-400/90">
              💡 <strong>Toggle:</strong> Click on an active source to turn it OFF and enter static mode.
            </p>
            <p className="text-xs text-cyan-400/90">
              💡 <strong>Device GPS</strong> uses your PC/phone's built-in GPS or location services.
              You'll need to grant permission when prompted.
            </p>
            {typeof navigator !== 'undefined' && !navigator.geolocation && (
              <p className="text-xs text-red-400/90">
                ⚠️ Your browser doesn't support Geolocation API. Try using Chrome, Firefox, or Safari.
              </p>
            )}
            {typeof window !== 'undefined' && !window.isSecureContext && (
              <p className="text-xs text-amber-400/90">
                ⚠️ GPS requires HTTPS. If testing locally, use <code className="bg-slate-800 px-1 rounded">localhost</code> or enable HTTPS.
              </p>
            )}
            <p className="text-xs text-amber-400/90">
              ⚠️ <strong>Note:</strong> Device GPS may not work in sandboxed environments (like embedded apps).
              Use <strong>Simulation</strong> mode for testing.
            </p>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex-shrink-0"
        >
          Close
        </button>
      </div>
    </div>
  );
}