import { useState, useRef, useEffect } from 'react';
import { X, Check, Undo, MapPin, GripVertical, Plus, Trash2 } from 'lucide-react';
import type { LatLng } from './ZoneManagerDialog';

interface ZoneDrawingOverlayProps {
  points: LatLng[];
  onAddPoint: (point: LatLng) => void;
  onRemoveLastPoint: () => void;
  onRemovePoint: (index: number) => void;
  onComplete: () => void;
  onCancel: () => void;
}

export function ZoneDrawingOverlay({
  points,
  onAddPoint,
  onRemoveLastPoint,
  onRemovePoint,
  onComplete,
  onCancel
}: ZoneDrawingOverlayProps) {
  const [position, setPosition] = useState({ x: window.innerWidth / 2 - 300, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showManualInput, setShowManualInput] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // DDM (Degrees Decimal Minutes) format state
  const [latDegrees, setLatDegrees] = useState(0);
  const [latMinutes, setLatMinutes] = useState(0);
  const [latDir, setLatDir] = useState<'N' | 'S'>('N');
  
  const [lngDegrees, setLngDegrees] = useState(0);
  const [lngMinutes, setLngMinutes] = useState(0);
  const [lngDir, setLngDir] = useState<'E' | 'W'>('E');

  // Convert DDM to decimal degrees
  const ddmToDecimal = (degrees: number, minutes: number, direction: string) => {
    const decimal = degrees + (minutes / 60);
    return (direction === 'S' || direction === 'W') ? -decimal : decimal;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dialogRef.current) return;
    const rect = dialogRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const handleAddManualPoint = () => {
    const lat = ddmToDecimal(latDegrees, latMinutes, latDir);
    const lng = ddmToDecimal(lngDegrees, lngMinutes, lngDir);
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      onAddPoint([lat, lng]);
      setLatDegrees(0);
      setLatMinutes(0);
      setLatDir('N');
      setLngDegrees(0);
      setLngMinutes(0);
      setLngDir('E');
      setShowManualInput(false);
    } else {
      alert('Invalid coordinates. Lat: -90 to 90, Lng: -180 to 180');
    }
  };

  return (
    <>
      {/* Draggable Dialog */}
      <div
        ref={dialogRef}
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 60,
          cursor: isDragging ? 'grabbing' : 'default'
        }}
        className="bg-slate-900/98 backdrop-blur-md border border-cyan-500/50 rounded-xl shadow-2xl w-[600px] max-h-[600px] flex flex-col"
      >
        {/* Draggable Header */}
        <div
          onMouseDown={handleMouseDown}
          className="h-14 border-b border-slate-700/50 px-4 flex items-center gap-3 bg-slate-900/80 rounded-t-xl cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5 text-slate-600" />
          <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold flex items-center gap-2">
              Drawing Custom Zone
              <span className="text-xs text-cyan-400 font-mono bg-cyan-500/10 px-2 py-0.5 rounded">
                {points.length} points
              </span>
            </h3>
          </div>
        </div>

        {/* Instructions */}
        <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
          <div className="space-y-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span><strong>Click on the map</strong> to add boundary points</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span>Or use <strong>Manual Input</strong> to enter coordinates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span>Minimum <strong>3 points</strong> required to complete</span>
            </div>
          </div>
        </div>

        {/* Point List */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {points.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No points added yet. Click on the map or use manual input.
            </div>
          ) : (
            <div className="space-y-2">
              {points.map((point, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg hover:bg-slate-800/60 transition-colors"
                >
                  <div className="w-6 h-6 bg-cyan-500/20 border border-cyan-500/50 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-cyan-400 font-semibold">{index + 1}</span>
                  </div>
                  <div className="flex-1 font-mono text-xs text-slate-300">
                    <span className="text-cyan-400">Lat:</span> {point[0].toFixed(6)}
                    <span className="text-slate-600 mx-2">|</span>
                    <span className="text-cyan-400">Lng:</span> {point[1].toFixed(6)}
                  </div>
                  <button
                    onClick={() => onRemovePoint(index)}
                    className="w-7 h-7 rounded bg-slate-800/50 hover:bg-red-900/30 border border-slate-700/50 hover:border-red-500/50 flex items-center justify-center transition-colors group"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 transition-colors" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Manual Input Section */}
          {showManualInput && (
            <div className="mt-3 p-3 bg-cyan-500/5 border border-cyan-500/30 rounded-lg">
              <div className="text-xs text-cyan-400 font-semibold mb-3">Manual Coordinate Input (DDM Format)</div>
              
              {/* Latitude */}
              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1.5">Latitude</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="90"
                    step="1"
                    value={latDegrees}
                    onChange={(e) => setLatDegrees(Math.min(90, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="78"
                    className="w-16 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="text-xs text-slate-400">°</span>
                  <input
                    type="number"
                    min="0"
                    max="59.999"
                    step="0.001"
                    value={latMinutes.toFixed(3)}
                    onChange={(e) => setLatMinutes(Math.min(59.999, Math.max(0, parseFloat(e.target.value) || 0)))}
                    placeholder="13.380"
                    className="flex-1 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="text-xs text-slate-400">'</span>
                  <select
                    value={latDir}
                    onChange={(e) => setLatDir(e.target.value as 'N' | 'S')}
                    className="w-14 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="N">N</option>
                    <option value="S">S</option>
                  </select>
                </div>
              </div>
              
              {/* Longitude */}
              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1.5">Longitude</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="number"
                    min="0"
                    max="180"
                    step="1"
                    value={lngDegrees}
                    onChange={(e) => setLngDegrees(Math.min(180, Math.max(0, parseInt(e.target.value) || 0)))}
                    placeholder="15"
                    className="w-16 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="text-xs text-slate-400">°</span>
                  <input
                    type="number"
                    min="0"
                    max="59.999"
                    step="0.001"
                    value={lngMinutes.toFixed(3)}
                    onChange={(e) => setLngMinutes(Math.min(59.999, Math.max(0, parseFloat(e.target.value) || 0)))}
                    placeholder="37.602"
                    className="flex-1 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <span className="text-xs text-slate-400">'</span>
                  <select
                    value={lngDir}
                    onChange={(e) => setLngDir(e.target.value as 'E' | 'W')}
                    className="w-14 px-2 py-1.5 bg-slate-800/50 border border-slate-700 rounded text-xs text-white focus:outline-none focus:border-cyan-500 transition-colors"
                  >
                    <option value="E">E</option>
                    <option value="W">W</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddManualPoint}
                  className="flex-1 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded text-xs text-white font-medium transition-colors"
                >
                  Add Point
                </button>
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setLatDegrees(0);
                    setLatMinutes(0);
                    setLatDir('N');
                    setLngDegrees(0);
                    setLngMinutes(0);
                    setLngDir('E');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded text-xs text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/50 rounded-b-xl space-y-2">
          {/* Manual Input Toggle */}
          {!showManualInput && (
            <button
              onClick={() => setShowManualInput(true)}
              className="w-full px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-sm text-cyan-400 font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Point Manually
            </button>
          )}

          {/* Main Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            
            {points.length > 0 && (
              <button
                onClick={onRemoveLastPoint}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors flex items-center justify-center gap-2"
              >
                <Undo className="w-4 h-4" />
                Undo Last
              </button>
            )}
            
            <button
              onClick={() => {
                console.log('🟢 Complete Drawing button clicked!');
                console.log('   Points available:', points.length);
                onComplete();
              }}
              disabled={points.length < 3}
              className="flex-1 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Complete {points.length < 3 ? `(${3 - points.length} more)` : '✓'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}