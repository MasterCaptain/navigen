import { useState } from 'react';
import { X, Briefcase, Flag, Shield, Bell, MapPin } from 'lucide-react';
import type { CustomZone, LatLng } from './ZoneManagerDialog';

interface ZoneDetailsDialogProps {
  coordinates: LatLng[];
  onSave: (zone: Omit<CustomZone, 'id'>) => void;
  onCancel: () => void;
}

const CATEGORY_CONFIG = {
  COMPANY_POLICY: {
    label: 'Company Policy',
    color: '#3b82f6',
    icon: 'Briefcase',
    description: 'Company-specific operational policies',
    examples: ['Slow speed areas', 'No discharge zones', 'Mandatory pilot areas']
  },
  OPERATIONAL: {
    label: 'Operational',
    color: '#10b981',
    icon: 'Flag',
    description: 'Day-to-day operational zones',
    examples: ['Research transects', 'Tourist viewing areas', 'Training zones']
  },
  RESTRICTION: {
    label: 'Restriction',
    color: '#ef4444',
    icon: 'Shield',
    description: 'Restricted or prohibited areas',
    examples: ['Wildlife exclusion', 'No anchoring', 'Known hazards']
  },
  NOTIFICATION: {
    label: 'Notification',
    color: '#f59e0b',
    icon: 'Bell',
    description: 'Areas requiring notifications',
    examples: ['Call harbor master', 'Switch VHF channel', 'Additional lookout']
  },
  CUSTOM: {
    label: 'Custom',
    color: '#8b5cf6',
    icon: 'MapPin',
    description: 'User-defined custom zones',
    examples: ['Custom operational areas', 'Project-specific zones']
  }
};

export function ZoneDetailsDialog({ coordinates, onSave, onCancel }: ZoneDetailsDialogProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<keyof typeof CATEGORY_CONFIG>('OPERATIONAL');
  const [notes, setNotes] = useState('');
  const [alertOnEntry, setAlertOnEntry] = useState(false);
  const [alertOnExit, setAlertOnExit] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSave = () => {
    if (!name.trim()) return;

    const config = CATEGORY_CONFIG[category];
    
    const zone: Omit<CustomZone, 'id'> = {
      name: name.trim(),
      category,
      color: config.color,
      icon: config.icon,
      coordinates,
      alerts: {
        onEntry: alertOnEntry,
        onExit: alertOnExit,
        message: alertMessage.trim()
      },
      metadata: {
        createdAt: new Date().toISOString(),
        notes: notes.trim()
      },
      status: 'ACTIVE'
    };

    console.log('📝 ZoneDetailsDialog: Creating zone object:', zone);
    onSave(zone);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl w-[620px] flex flex-col max-h-[720px]">
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-base text-white font-semibold">New Custom Zone</h3>
            <p className="text-xs text-slate-400">{coordinates.length} boundary points defined</p>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Zone Name */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">
              Zone Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Company Slow Speed Area"
              autoFocus
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-3">
              Category <span className="text-red-400">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const IconComponent = {
                  Briefcase,
                  Flag,
                  Shield,
                  Bell,
                  MapPin
                }[config.icon] || MapPin;

                const isSelected = category === key;

                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key as any)}
                    className={`p-3 rounded-lg border transition-all text-left ${
                      isSelected
                        ? 'bg-slate-700/50 border-cyan-500/50 ring-1 ring-cyan-500/30'
                        : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border"
                        style={{ 
                          backgroundColor: `${config.color}15`,
                          borderColor: `${config.color}40`
                        }}
                      >
                        <IconComponent className="w-5 h-5" style={{ color: config.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-white font-medium mb-0.5">{config.label}</div>
                        <div className="text-xs text-slate-400 mb-1.5">{config.description}</div>
                        <div className="flex flex-wrap gap-1">
                          {config.examples.map((ex, idx) => (
                            <span 
                              key={idx} 
                              className="text-[10px] text-slate-500 bg-slate-900/50 px-1.5 py-0.5 rounded"
                            >
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-2">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional information about this zone..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none"
            />
          </div>

          {/* Alert Configuration */}
          <div>
            <label className="block text-sm text-slate-300 font-medium mb-3">Alert Settings</label>
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={alertOnEntry}
                  onChange={(e) => setAlertOnEntry(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Alert on Entry</div>
                  <div className="text-xs text-slate-400">Show notification when vessel enters this zone</div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 bg-slate-800/30 border border-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-800/50 transition-colors">
                <input
                  type="checkbox"
                  checked={alertOnExit}
                  onChange={(e) => setAlertOnExit(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="text-sm text-white font-medium">Alert on Exit</div>
                  <div className="text-xs text-slate-400">Show notification when vessel exits this zone</div>
                </div>
              </label>

              {(alertOnEntry || alertOnExit) && (
                <div className="ml-0 pt-1">
                  <label className="block text-xs text-slate-400 font-medium mb-2">Alert Message</label>
                  <input
                    type="text"
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="e.g., Reduce speed to 5 knots or contact harbor master on VHF Ch 16"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 border-t border-slate-700/50 px-6 flex items-center justify-end gap-3 flex-shrink-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed rounded-lg text-sm text-white font-medium transition-colors"
          >
            Create Zone
          </button>
        </div>
      </div>
    </div>
  );
}