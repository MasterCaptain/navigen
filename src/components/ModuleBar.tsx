import { RegulatorySelectorDropdown } from './RegulatorySelectorDropdown';
import { NAVSelectorDropdown } from './NAVSelectorDropdown';
import { VoyageSelectorDropdown } from './VoyageSelectorDropdown';
import { AISSelectorDropdown } from './AISSelectorDropdown';
import type { GPSSource, SimulationConfig } from './GPSSourceSelectorDropdown';
import type { DisplayMode } from './DayNightModeSelectorDropdown';
import type { PlannedOp } from '../types/plannedOps';

interface ModuleBarProps {
  activeModule: string | null;
  onModuleChange: (module: string | null) => void;
  regLayers: {
  enabled: boolean;
  bordersEnabled: boolean;
  regulatoryZonesEnabled: boolean;
  territorialWaters12nm: boolean;
  contiguousZone24nm: boolean;
  eez200nm: boolean;
  imoN60: boolean;
  imoS60: boolean;

  svalbard12nm: boolean;
  svalbardProtectedAreas: boolean;

  greenlandExpanded: boolean;
  greenlandSermersooq: boolean;
  greenlandProtectedAreas: boolean;
  greenlandLocalRestrictions: boolean;

  marpolAreas: boolean;
  solasZones: boolean;
  debugBorders: boolean;
};
  onRegLayersChange: (layers: ModuleBarProps['regLayers']) => void;
  // NAV Settings
  openSeaMapLayer: boolean;
  onOpenSeaMapLayerChange: (visible: boolean) => void;
  fiskeridirLayer: boolean;
  onFiskeridirLayerChange: (visible: boolean) => void;
  tssLayer: boolean;
  onTssLayerChange: (visible: boolean) => void;
    basemapType: 'ocean' | 'geographic';
  onBasemapTypeChange: (type: 'ocean' | 'geographic') => void;
  gpsSource: GPSSource;
  onGpsSourceChange: (source: GPSSource) => void;
  simulationConfig: SimulationConfig;
  onSimulationConfigChange: (config: SimulationConfig) => void;
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  cursorBoxVisible: boolean;
  onCursorBoxVisibleChange: (visible: boolean) => void;
  coursePredictorVisible: boolean;
  onCoursePredictorVisibleChange: (visible: boolean) => void;
  coursePredictorMinutes: number;
  onCoursePredictorMinutesChange: (minutes: number) => void;
  setDriftVisible: boolean;
  onSetDriftVisibleChange: (visible: boolean) => void;
  // Voyage Settings
  activeZones: string[];
  onActiveZonesChange: (zones: string[]) => void;
  onManageZones: () => void;
  activeActivity: string;
  onActiveActivityChange: (activity: string) => void;
  plannedOps: PlannedOp[];
  onPlannedOpsChange: (ops: PlannedOp[]) => void;
  // AIS
  aisPanelVisible?: boolean;
  onToggleAIS?: () => void;
}

export function ModuleBar({ 
  activeModule, 
  onModuleChange, 
  regLayers, 
  onRegLayersChange,
    basemapType,
  onBasemapTypeChange,
  // NAV
  openSeaMapLayer,
  onOpenSeaMapLayerChange,
  fiskeridirLayer,
  onFiskeridirLayerChange,
  tssLayer,
  onTssLayerChange,
  gpsSource,
  onGpsSourceChange,
  simulationConfig,
  onSimulationConfigChange,
  displayMode,
  onDisplayModeChange,
  cursorBoxVisible,
  onCursorBoxVisibleChange,
  coursePredictorVisible,
  onCoursePredictorVisibleChange,
  coursePredictorMinutes,
  onCoursePredictorMinutesChange,
  setDriftVisible,
  onSetDriftVisibleChange,
  // Voyage
  activeZones,
  onActiveZonesChange,
  onManageZones,
  activeActivity,
  onActiveActivityChange,
  plannedOps,
  onPlannedOpsChange,
  // AIS
  aisPanelVisible,
  onToggleAIS,
}: ModuleBarProps) {
  const modules = [
    { id: 'RULES', label: 'RULES', description: 'Compliance Rules' },
    { id: 'COMMS', label: 'COMMS', description: 'Communications' },
    { id: 'MARSEC', label: 'MARSEC', description: 'Maritime Security' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-md border-t border-cyan-900/20 px-6 flex items-center justify-between shadow-2xl z-40">
      {/* Left side - REGULATORY, NAV, VOYAGE, AIS dropdowns */}
      <div className="flex items-center gap-1.5">
        <RegulatorySelectorDropdown 
          value={regLayers}
          onChange={onRegLayersChange}
        />
        
      <NAVSelectorDropdown
  value={{
    openSeaMapLayer,
    fiskeridirLayer,
    tssLayer,
    basemapType,
    gpsSource,
    simulationConfig,
    displayMode,
    cursorBoxVisible,
    coursePredictorVisible,
    coursePredictorMinutes,
    setDriftVisible,
  }}
  onChange={(next) => {
    onOpenSeaMapLayerChange(next.openSeaMapLayer);
    onFiskeridirLayerChange(next.fiskeridirLayer);
    onTssLayerChange(next.tssLayer);
    onBasemapTypeChange(next.basemapType);
    onGpsSourceChange(next.gpsSource);
    onSimulationConfigChange(next.simulationConfig);
    onDisplayModeChange(next.displayMode);
    onCursorBoxVisibleChange(next.cursorBoxVisible);
    onCoursePredictorVisibleChange(next.coursePredictorVisible);
    onCoursePredictorMinutesChange(next.coursePredictorMinutes);
    onSetDriftVisibleChange(next.setDriftVisible);
  }}
  onOpenNAVModule={() => onModuleChange('NAV')}
/>
        
        <VoyageSelectorDropdown
          value={{
            activeZones,
            activeActivity,
            plannedOps,
          }}
          onChange={(next) => {
            onActiveZonesChange(next.activeZones);
            onActiveActivityChange(next.activeActivity);
            onPlannedOpsChange(next.plannedOps);
          }}
          onManageZones={onManageZones}
          onOpenVoyagePlanner={() => onModuleChange('VOYAGE')}
        />
        
        <AISSelectorDropdown
          aisPanelVisible={aisPanelVisible || false}
          onToggleAIS={onToggleAIS || (() => {})}
        />
      </div>
      
      {/* Right side - RULES, COMMS, MARSEC */}
      <div className="flex items-center gap-1.5">
        {modules.map((module) => (
          <button
            key={module.id}
            onClick={() => onModuleChange(activeModule === module.id ? null : module.id)}
            className={`
              px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider
              transition-all duration-200 border
              ${activeModule === module.id
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
                : 'bg-slate-800/50 text-slate-400 border-slate-700/50 hover:bg-slate-700/50 hover:text-slate-300 hover:border-slate-600'
              }
            `}
            title={module.description}
          >
            {module.label}
          </button>
        ))}
      </div>
    </div>
  );
}