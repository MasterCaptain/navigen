import { X, Plus, Edit2, Trash2, MapPin, Download, Upload, AlertCircle, Bell, BellOff, Eye, EyeOff, Anchor, Shield, Flag, Radio, Briefcase } from 'lucide-react';
import { useState, useEffect } from 'react';

export type LatLng = [number, number]; // [lat, lng]

export interface CustomZone {
  id: string;
  name: string;
  category: 'COMPANY_POLICY' | 'OPERATIONAL' | 'RESTRICTION' | 'NOTIFICATION' | 'CUSTOM';
  color: string; // hex color for polygon
  icon: string; // icon identifier
  coordinates: LatLng[]; // polygon boundary
  alerts: {
    onEntry: boolean;
    onExit: boolean;
    message: string;
  };
  metadata: {
    createdAt: string;
    notes: string;
  };
  status: 'ACTIVE' | 'INACTIVE';
}

interface ZoneManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartDrawing: () => void; // Trigger drawing mode on map
  zones?: CustomZone[]; // Current zones from parent
  onDeleteZone?: (zoneId: string) => void; // Delete callback
  onUpdateZone?: (zone: CustomZone) => void; // Update callback (for toggle status, edit, etc.)
}

const CATEGORY_CONFIG = {
  COMPANY_POLICY: {
    label: 'Company Policy',
    color: '#3b82f6',
    icon: 'Briefcase',
    description: 'Company-specific operational policies'
  },
  OPERATIONAL: {
    label: 'Operational',
    color: '#10b981',
    icon: 'Flag',
    description: 'Day-to-day operational zones'
  },
  RESTRICTION: {
    label: 'Restriction',
    color: '#ef4444',
    icon: 'Shield',
    description: 'Restricted or prohibited areas'
  },
  NOTIFICATION: {
    label: 'Notification',
    color: '#f59e0b',
    icon: 'Bell',
    description: 'Areas requiring notifications or actions'
  },
  CUSTOM: {
    label: 'Custom',
    color: '#8b5cf6',
    icon: 'MapPin',
    description: 'User-defined custom zones'
  }
};

export function ZoneManagerDialog({ open, onOpenChange, onStartDrawing, zones, onDeleteZone, onUpdateZone }: ZoneManagerDialogProps) {
  const [editingZone, setEditingZone] = useState<CustomZone | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 80, y: 80 }); // Initial position
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Use zones from parent prop (single source of truth)
  const displayZones = zones || [];

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag when clicking buttons
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  const handleDeleteZone = (id: string) => {
    if (onDeleteZone) {
      onDeleteZone(id);
    }
    setShowDeleteConfirm(null); // Close confirmation dialog
  };

  const handleToggleStatus = (id: string) => {
    const zone = displayZones.find(z => z.id === id);
    if (zone && onUpdateZone) {
      onUpdateZone({ ...zone, status: zone.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
    }
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(displayZones, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `navigen-zones-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          const newZones = [...displayZones, ...imported];
          if (onUpdateZone) {
            newZones.forEach(zone => onUpdateZone(zone));
          }
        }
      } catch (err) {
        alert('Failed to import zones. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };

  if (!open) return null;

  const activeZones = displayZones.filter(z => z.status === 'ACTIVE');
  const inactiveZones = displayZones.filter(z => z.status === 'INACTIVE');

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-50 pointer-events-none" />
      <div 
        className="fixed bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl w-[480px] max-h-[640px] flex flex-col z-50 cursor-move"
        style={{ 
          left: `${position.x}px`, 
          top: `${position.y}px`,
          userSelect: isDragging ? 'none' : 'auto'
        }}
      >
        {/* Header - Draggable */}
        <div 
          className="h-14 border-b border-slate-700/50 px-5 flex items-center justify-between bg-slate-900/50 cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm text-white font-semibold uppercase tracking-wide">Custom Zones</h2>
              <p className="text-[10px] text-slate-400">User-defined operational zones</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Toolbar */}
        <div className="h-14 border-b border-slate-700/50 px-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-400">
              <span className="text-cyan-400 font-semibold">{activeZones.length}</span> active
              {inactiveZones.length > 0 && (
                <span className="ml-2">
                  <span className="text-slate-500 font-semibold">{inactiveZones.length}</span> inactive
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Import */}
            <label className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium transition-colors cursor-pointer flex items-center gap-2">
              <Upload className="w-3.5 h-3.5" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            {/* Export */}
            {displayZones.length > 0 && (
              <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs text-slate-300 font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
            )}

            {/* Create New */}
            <button
              onClick={() => {
                onOpenChange(false);
                onStartDrawing();
              }}
              className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs text-white font-semibold transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Zone
            </button>
          </div>
        </div>

        {/* Zone List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {displayZones.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center mb-4">
                <MapPin className="w-7 h-7 text-slate-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">No Custom Zones</h3>
              <p className="text-sm text-slate-400 mb-4 max-w-md">
                Create custom operational zones for company policies, restrictions, or notifications.
              </p>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onStartDrawing();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm text-white font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Your First Zone
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayZones.map(zone => (
                <ZoneCard
                  key={zone.id}
                  zone={zone}
                  onToggleStatus={handleToggleStatus}
                  onEdit={setEditingZone}
                  onDelete={(id) => setShowDeleteConfirm(id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-slate-700/50 px-6 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            💡 Tip: Draw zones on the map to define custom operational areas
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>

      {/* Edit Dialog */}
      {editingZone && (
        <EditZoneDialog
          zone={editingZone}
          onClose={() => setEditingZone(null)}
          onSave={(updated) => {
            if (onUpdateZone) {
              onUpdateZone(updated);
            }
            setEditingZone(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-slate-900/98 backdrop-blur-md border border-red-900/50 rounded-xl shadow-2xl w-[420px]">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Delete Custom Zone?</h3>
                  <p className="text-sm text-slate-400">
                    This will permanently delete the zone. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteZone(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm text-white font-medium transition-colors"
                >
                  Delete Zone
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ZoneCard({ 
  zone, 
  onToggleStatus, 
  onEdit, 
  onDelete 
}: { 
  zone: CustomZone; 
  onToggleStatus: (id: string) => void;
  onEdit: (zone: CustomZone) => void;
  onDelete: (id: string) => void;
}) {
  const config = CATEGORY_CONFIG[zone.category];
  const IconComponent = {
    Briefcase,
    Flag,
    Shield,
    Bell,
    MapPin,
    Anchor,
    Radio
  }[config.icon] || MapPin;

  const hasAlerts = zone.alerts.onEntry || zone.alerts.onExit;

  return (
    <div className={`border rounded-lg p-3 transition-all cursor-default ${ 
      zone.status === 'ACTIVE' 
        ? 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/60' 
        : 'bg-slate-800/20 border-slate-700/30 opacity-60'
    }`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div 
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border"
          style={{ 
            backgroundColor: `${config.color}15`,
            borderColor: `${config.color}40`
          }}
        >
          <IconComponent className="w-4 h-4" style={{ color: config.color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1.5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-white font-semibold text-xs truncate">{zone.name}</h3>
                {hasAlerts && <Bell className="w-3 h-3 text-amber-400 flex-shrink-0" />}
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span 
                  className="px-1.5 py-0.5 border rounded text-[9px] font-semibold uppercase tracking-wide"
                  style={{ 
                    backgroundColor: `${config.color}15`,
                    borderColor: `${config.color}40`,
                    color: config.color
                  }}
                >
                  {config.label}
                </span>
                <span className={`text-[10px] font-medium flex items-center gap-1 ${zone.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                  <div className={`w-1 h-1 rounded-full ${zone.status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                  {zone.status}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-0.5 ml-2">
              {/* Toggle Active/Inactive */}
              <button 
                onClick={() => onToggleStatus(zone.id)}
                className="w-7 h-7 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
                title={zone.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
              >
                {zone.status === 'ACTIVE' ? (
                  <Eye className="w-3 h-3 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-500 group-hover:text-slate-400 transition-colors" />
                )}
              </button>

              {/* Edit */}
              <button 
                onClick={() => onEdit(zone)}
                className="w-7 h-7 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
              >
                <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              </button>

              {/* Delete */}
              <button 
                onClick={() => onDelete(zone.id)}
                className="w-7 h-7 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
              >
                <Trash2 className="w-3 h-3 text-slate-400 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          </div>

          {/* Alert Message - Only if there's a message */}
          {zone.alerts.message && (
            <div className="flex items-start gap-1.5 mt-2 p-1.5 bg-amber-500/5 border border-amber-500/20 rounded">
              <Bell className="w-3 h-3 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400 line-clamp-1">{zone.alerts.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EditZoneDialog({ 
  zone, 
  onClose, 
  onSave 
}: { 
  zone: CustomZone; 
  onClose: () => void;
  onSave: (zone: CustomZone) => void;
}) {
  const [name, setName] = useState(zone.name);
  const [category, setCategory] = useState(zone.category);
  const [notes, setNotes] = useState(zone.metadata.notes);
  const [alertOnEntry, setAlertOnEntry] = useState(zone.alerts.onEntry);
  const [alertOnExit, setAlertOnExit] = useState(zone.alerts.onExit);
  const [alertMessage, setAlertMessage] = useState(zone.alerts.message);

  const handleSave = () => {
    onSave({
      ...zone,
      name,
      category,
      color: CATEGORY_CONFIG[category].color,
      icon: CATEGORY_CONFIG[category].icon,
      metadata: {
        ...zone.metadata,
        notes
      },
      alerts: {
        onEntry: alertOnEntry,
        onExit: alertOnExit,
        message: alertMessage
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl w-[580px] flex flex-col max-h-[680px]">
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-6 flex items-center justify-between flex-shrink-0">
          <h3 className="text-base text-white font-semibold">Edit Zone</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Zone Name */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">Zone Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Company Slow Speed Area"
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const IconComponent = {
                  Briefcase,
                  Flag,
                  Shield,
                  Bell,
                  MapPin
                }[config.icon] || MapPin;

                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key as any)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      category === key
                        ? 'bg-slate-700/50 border-cyan-500/50'
                        : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4" style={{ color: config.color }} />
                      <span className="text-sm text-white font-medium">{config.label}</span>
                    </div>
                    <p className="text-xs text-slate-400">{config.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this zone..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Alerts */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-3">Alerts</label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={alertOnEntry}
                  onChange={(e) => setAlertOnEntry(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Alert on Entry</div>
                  <div className="text-xs text-slate-400">Show notification when entering this zone</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={alertOnExit}
                  onChange={(e) => setAlertOnExit(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Alert on Exit</div>
                  <div className="text-xs text-slate-400">Show notification when exiting this zone</div>
                </div>
              </label>

              {(alertOnEntry || alertOnExit) && (
                <div>
                  <label className="block text-xs text-slate-400 font-medium mb-2">Alert Message</label>
                  <input
                    type="text"
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="e.g., Reduce speed to 5 knots"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Coordinates Info */}
          <div className="p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg">
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Boundary:</span> {zone.coordinates.length} coordinate points
            </div>
            <div className="text-xs text-slate-500 mt-1">
              To modify the boundary, delete and recreate the zone
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-700/50 px-6 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 rounded-lg text-sm text-white font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}