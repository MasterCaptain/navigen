import { useState } from 'react';
import { Navigation, X } from 'lucide-react';
import type { SimulationConfig } from './GPSSourceSelectorDropdown';

interface SimulatorConfigPanelProps {
  simulationConfig: SimulationConfig;
  onSimulationConfigChange: (config: SimulationConfig) => void;
  onClose: () => void;
}

// Convert decimal degrees to degrees + minutes + seconds
function decimalToDMS(decimal: number, isLat: boolean): { deg: number; min: number; sec: number; dir: string } {
  const absDecimal = Math.abs(decimal);
  const deg = Math.floor(absDecimal);
  const minDecimal = (absDecimal - deg) * 60;
  const min = Math.floor(minDecimal);
  const sec = (minDecimal - min) * 60;
  
  let dir: string;
  if (isLat) {
    dir = decimal >= 0 ? 'N' : 'S';
  } else {
    dir = decimal >= 0 ? 'E' : 'W';
  }
  
  return { deg, min, sec, dir };
}

// Convert degrees + minutes + seconds to decimal degrees
function dmsToDecimal(deg: number, min: number, sec: number, dir: string): number {
  const decimal = deg + min / 60 + sec / 3600;
  return (dir === 'S' || dir === 'W') ? -decimal : decimal;
}

export function SimulatorConfigPanel({ simulationConfig, onSimulationConfigChange, onClose }: SimulatorConfigPanelProps) {
  const latDMS = decimalToDMS(simulationConfig.lat, true);
  const lngDMS = decimalToDMS(simulationConfig.lng, false);
  
  const [latDeg, setLatDeg] = useState(latDMS.deg.toString());
  const [latMin, setLatMin] = useState(latDMS.min.toString());
  const [latSec, setLatSec] = useState(latDMS.sec.toFixed(3));
  const [latDir, setLatDir] = useState(latDMS.dir);
  
  const [lngDeg, setLngDeg] = useState(lngDMS.deg.toString());
  const [lngMin, setLngMin] = useState(lngDMS.min.toString());
  const [lngSec, setLngSec] = useState(lngDMS.sec.toFixed(3));
  const [lngDir, setLngDir] = useState(lngDMS.dir);
  
  const [localSpeed, setLocalSpeed] = useState(simulationConfig.speed.toString());
  const [localCourse, setLocalCourse] = useState(simulationConfig.course.toString());

  const handleApply = () => {
    const lat = dmsToDecimal(
      parseFloat(latDeg) || 0,
      parseFloat(latMin) || 0,
      parseFloat(latSec) || 0,
      latDir
    );
    
    const lng = dmsToDecimal(
      parseFloat(lngDeg) || 0,
      parseFloat(lngMin) || 0,
      parseFloat(lngSec) || 0,
      lngDir
    );
    
    const updatedConfig: SimulationConfig = {
      lat,
      lng,
      speed: parseFloat(localSpeed) || simulationConfig.speed,
      course: parseFloat(localCourse) % 360 || simulationConfig.course
    };
    
    console.log('✅ Applying simulation config:', updatedConfig);
    onSimulationConfigChange(updatedConfig);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200]"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-[640px] bg-slate-900 border-2 border-amber-500 rounded-lg shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Navigation className="w-6 h-6 text-amber-400" />
            <h3 className="text-lg font-bold text-amber-300">GPS SIMULATOR</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>
        
        <div className="space-y-4 mb-6">
          {/* Latitude */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Latitude</label>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                <input
                  type="text"
                  value={latDeg}
                  onChange={(e) => setLatDeg(e.target.value)}
                  className="w-14 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="78"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newDeg = Math.min(90, parseInt(latDeg) + 1);
                      setLatDeg(newDeg.toString());
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newDeg = Math.max(0, parseInt(latDeg) - 1);
                      setLatDeg(newDeg.toString());
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">°</span>
              <div className="flex gap-1 items-center flex-1">
                <input
                  type="text"
                  value={latMin}
                  onChange={(e) => setLatMin(e.target.value)}
                  className="flex-1 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="13"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newMin = parseFloat(latMin) + 1;
                      if (newMin >= 60) {
                        setLatMin('0');
                        setLatDeg((parseInt(latDeg) + 1).toString());
                      } else {
                        setLatMin(newMin.toFixed(0));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newMin = parseFloat(latMin) - 1;
                      if (newMin < 0 && parseInt(latDeg) > 0) {
                        setLatMin('59');
                        setLatDeg((parseInt(latDeg) - 1).toString());
                      } else {
                        setLatMin(Math.max(0, newMin).toFixed(0));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">'</span>
              <div className="flex gap-1 items-center flex-1">
                <input
                  type="text"
                  value={latSec}
                  onChange={(e) => setLatSec(e.target.value)}
                  className="flex-1 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="39.2"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newSec = parseFloat(latSec) + 1;
                      if (newSec >= 60) {
                        setLatSec('0.000');
                        setLatMin((parseInt(latMin) + 1).toString());
                      } else {
                        setLatSec(newSec.toFixed(3));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newSec = parseFloat(latSec) - 1;
                      if (newSec < 0 && parseInt(latMin) > 0) {
                        setLatSec('59.999');
                        setLatMin((parseInt(latMin) - 1).toString());
                      } else {
                        setLatSec(Math.max(0, newSec).toFixed(3));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">"</span>
              <select
                value={latDir}
                onChange={(e) => setLatDir(e.target.value)}
                className="w-12 px-1 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="N">N</option>
                <option value="S">S</option>
              </select>
            </div>
          </div>

          {/* Longitude */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Longitude</label>
            <div className="flex gap-2 items-center">
              <div className="flex gap-1 items-center">
                <input
                  type="text"
                  value={lngDeg}
                  onChange={(e) => setLngDeg(e.target.value)}
                  className="w-14 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="15"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newDeg = Math.min(180, parseInt(lngDeg) + 1);
                      setLngDeg(newDeg.toString());
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newDeg = Math.max(0, parseInt(lngDeg) - 1);
                      setLngDeg(newDeg.toString());
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">°</span>
              <div className="flex gap-1 items-center flex-1">
                <input
                  type="text"
                  value={lngMin}
                  onChange={(e) => setLngMin(e.target.value)}
                  className="flex-1 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="37"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newMin = parseFloat(lngMin) + 1;
                      if (newMin >= 60) {
                        setLngMin('0');
                        setLngDeg((parseInt(lngDeg) + 1).toString());
                      } else {
                        setLngMin(newMin.toFixed(0));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newMin = parseFloat(lngMin) - 1;
                      if (newMin < 0 && parseInt(lngDeg) > 0) {
                        setLngMin('59');
                        setLngDeg((parseInt(lngDeg) - 1).toString());
                      } else {
                        setLngMin(Math.max(0, newMin).toFixed(0));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">'</span>
              <div className="flex gap-1 items-center flex-1">
                <input
                  type="text"
                  value={lngSec}
                  onChange={(e) => setLngSec(e.target.value)}
                  className="flex-1 px-2 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="60.2"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newSec = parseFloat(lngSec) + 1;
                      if (newSec >= 60) {
                        setLngSec('0.000');
                        setLngMin((parseInt(lngMin) + 1).toString());
                      } else {
                        setLngSec(newSec.toFixed(3));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newSec = parseFloat(lngSec) - 1;
                      if (newSec < 0 && parseInt(lngMin) > 0) {
                        setLngSec('59.999');
                        setLngMin((parseInt(lngMin) - 1).toString());
                      } else {
                        setLngSec(Math.max(0, newSec).toFixed(3));
                      }
                    }}
                    className="w-6 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
              <span className="text-slate-400 text-sm">"</span>
              <select
                value={lngDir}
                onChange={(e) => setLngDir(e.target.value)}
                className="w-12 px-1 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white font-bold focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="E">E</option>
                <option value="W">W</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Speed */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Speed (knots)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={localSpeed}
                  onChange={(e) => setLocalSpeed(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="8.5"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newSpeed = parseFloat(localSpeed) + 0.5;
                      setLocalSpeed(newSpeed.toFixed(1));
                    }}
                    className="w-7 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newSpeed = Math.max(0, parseFloat(localSpeed) - 0.5);
                      setLocalSpeed(newSpeed.toFixed(1));
                    }}
                    className="w-7 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Course */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Course (°)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={localCourse}
                  onChange={(e) => setLocalCourse(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-600 rounded text-sm text-white focus:outline-none focus:border-amber-500 transition-colors text-right"
                  placeholder="42"
                />
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => {
                      const newCourse = (parseFloat(localCourse) + 1) % 360;
                      setLocalCourse(newCourse.toFixed(0));
                    }}
                    className="w-7 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">+</span>
                  </button>
                  <button
                    onClick={() => {
                      const newCourse = (parseFloat(localCourse) - 1 + 360) % 360;
                      setLocalCourse(newCourse.toFixed(0));
                    }}
                    className="w-7 h-4 bg-slate-700 hover:bg-slate-600 rounded-sm flex items-center justify-center transition-colors"
                  >
                    <span className="text-slate-300 text-xs leading-none">−</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-900 rounded font-bold transition-colors"
          >
            Apply & Start
          </button>
        </div>

        <p className="text-xs text-amber-400/80 mt-4 text-center">
          ⚠️ For testing purposes only
        </p>
      </div>
    </>
  );
}