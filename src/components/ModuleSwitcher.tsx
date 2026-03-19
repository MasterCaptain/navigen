import { Shield, Radio, FileText } from 'lucide-react';

interface ModuleSwitcherProps {
  currentModule: string;
  onSwitchModule: (module: string) => void;
}

const MODULES = [
  { id: 'RULES', name: 'RULES', icon: FileText, color: 'cyan' },
  { id: 'COMMS', name: 'COMMS', icon: Radio, color: 'cyan' },
  { id: 'MARSEC', name: 'MARSEC', icon: Shield, color: 'red' },
];

export function ModuleSwitcher({ currentModule, onSwitchModule }: ModuleSwitcherProps) {
  // Filter out current module and NAVIGEN
  const availableModules = MODULES.filter(mod => mod.id !== currentModule);

  return (
    <div className="h-16 border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-md flex items-center justify-center gap-3 px-6">
      <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mr-2">
        SWITCH MODULE:
      </div>
      {availableModules.map((module) => {
        const Icon = module.icon;
        const isRed = module.color === 'red';
        
        return (
          <button
            key={module.id}
            onClick={() => onSwitchModule(module.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              isRed
                ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400'
                : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/50 hover:border-cyan-500/30 text-slate-300 hover:text-cyan-400'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-sm font-semibold">{module.name}</span>
          </button>
        );
      })}
      
      {/* Return to NAVIGEN */}
      <button
        onClick={() => onSwitchModule('NAVIGEN')}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 transition-all ml-2"
      >
        <div className="w-4 h-4 relative">
          <div className="absolute inset-0 bg-cyan-400 rounded-full"></div>
          <div className="absolute inset-0.5 bg-slate-900 rounded-full"></div>
          <div className="absolute inset-1 bg-cyan-400 rounded-full"></div>
        </div>
        <span className="text-sm font-semibold">NAVIGEN</span>
      </button>
    </div>
  );
}