import { X, Navigation, Anchor, Ship, Loader } from 'lucide-react';

interface ActivitySelectorProps {
  onClose: () => void;
  onSelectActivity: (activity: string) => void;
  currentActivity: string;
}

export function ActivitySelector({ onClose, onSelectActivity, currentActivity }: ActivitySelectorProps) {
  const activities = [
    {
      id: 'UNDERWAY',
      name: 'Underway',
      description: 'Vessel in transit - navigation mode',
      icon: <Navigation className="w-5 h-5" />,
      color: 'cyan',
    },
    {
      id: 'PORT OPS',
      name: 'Port Operations',
      description: 'Berthing, loading/unloading cargo',
      icon: <Anchor className="w-5 h-5" />,
      color: 'amber',
    },
    {
      id: 'ANCHORED',
      name: 'Anchored',
      description: 'At anchor - holding position',
      icon: <Anchor className="w-5 h-5" />,
      color: 'blue',
    },
    {
      id: 'MANEUVERING',
      name: 'Maneuvering',
      description: 'Close quarters - reduced speed',
      icon: <Ship className="w-5 h-5" />,
      color: 'orange',
    },
    {
      id: 'DRIFT',
      name: 'Drift / NUC',
      description: 'Not under command or drifting',
      icon: <Loader className="w-5 h-5" />,
      color: 'red',
    },
  ];

  const handleSelect = (activityId: string) => {
    onSelectActivity(activityId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end justify-start pb-[5vh] pl-[120px] z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-lg shadow-2xl w-[380px] max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-14 border-b border-slate-700/50 px-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1 h-8 bg-amber-500 rounded-full" />
            <h3 className="text-sm text-white font-semibold uppercase tracking-wide">Select Activity</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
          >
            <X className="w-4 h-4 text-slate-400 group-hover:text-red-400 transition-colors" />
          </button>
        </div>

        {/* Activity Options - Scrollable */}
        <div className="p-3 space-y-2 overflow-y-auto flex-1">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => handleSelect(activity.id)}
              className={`w-full p-3 rounded-lg border transition-all text-left group ${
                currentActivity === activity.id
                  ? 'bg-amber-600/20 border-amber-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    currentActivity === activity.id
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-700/50 text-slate-400 group-hover:text-slate-300'
                  }`}
                >
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-semibold ${
                        currentActivity === activity.id ? 'text-amber-400' : 'text-white'
                      }`}
                    >
                      {activity.name}
                    </span>
                    {currentActivity === activity.id && (
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{activity.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}