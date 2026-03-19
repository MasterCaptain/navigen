import { X, Map, Layers, Bell, Route, Anchor, Shield, Globe, Wifi, WifiOff, Ship, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { NavigenLogo } from './NavigenLogo';
import type { DisplayMode } from './DayNightModeSelectorDropdown';

export interface VesselProfile {
  vesselType: 'passenger' | 'cruise' | 'cargo' | 'tanker' | 'research' | 'fishing' | 'other';
  polarClass: 'PC1' | 'PC2' | 'PC3' | 'PC4' | 'PC5' | 'PC6' | 'PC7' | 'none';
  iceClass: '1A_SUPER' | '1A' | '1B' | '1C' | 'II' | 'III' | 'none';
  flagState: string;
  grossTonnage?: number;
}

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offlineMode: boolean;
  onOfflineModeChange: (enabled: boolean) => void;
  // Display settings
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  cursorBoxVisible: boolean;
  onCursorBoxVisibleChange: (visible: boolean) => void;
  // Chart layer settings
  openSeaMapLayer: boolean;
  onOpenSeaMapLayerChange: (visible: boolean) => void;
  fiskeridirLayer: boolean;
  onFiskeridirLayerChange: (visible: boolean) => void;
  tssLayer: boolean;
  onTssLayerChange: (visible: boolean) => void;
  weatherLayer: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature';
  onWeatherLayerChange: (layer: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature') => void;
  basemapType: 'ocean' | 'geographic';
  onBasemapTypeChange: (type: 'ocean' | 'geographic') => void;
  // Navigation settings
  coursePredictorVisible: boolean;
  onCoursePredictorVisibleChange: (visible: boolean) => void;
  coursePredictorMinutes: number;
  onCoursePredictorMinutesChange: (minutes: number) => void;
  setDriftVisible: boolean;
  onSetDriftVisibleChange: (visible: boolean) => void;
  // Zone settings
  iaato: boolean;
  onIaatoChange: (enabled: boolean) => void;
  // Vessel profile
  vesselProfile: VesselProfile;
  onVesselProfileChange: (profile: VesselProfile) => void;
}

export function SettingsDialog({ 
  open,
  onOpenChange,
  offlineMode,
  onOfflineModeChange,
  displayMode,
  onDisplayModeChange,
  cursorBoxVisible,
  onCursorBoxVisibleChange,
  openSeaMapLayer,
  onOpenSeaMapLayerChange,
  fiskeridirLayer,
  onFiskeridirLayerChange,
  tssLayer,
  onTssLayerChange,
  weatherLayer,
  onWeatherLayerChange,
  basemapType,
  onBasemapTypeChange,
  coursePredictorVisible,
  onCoursePredictorVisibleChange,
  coursePredictorMinutes,
  onCoursePredictorMinutesChange,
  setDriftVisible,
  onSetDriftVisibleChange,
  iaato,
  onIaatoChange,
  vesselProfile,
  onVesselProfileChange
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<'display' | 'chart' | 'route' | 'vessel'>('display');
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  if (!open) return null;

  return (
    <>
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/98 backdrop-blur-md border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-[720px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-slate-700/50 px-6 flex items-center justify-between bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-10 bg-amber-500 rounded-full" />
            <h2 className="text-lg text-white font-semibold uppercase tracking-wide">Settings</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowWarningDialog(true)}
              className="w-9 h-9 rounded-lg bg-orange-900/30 hover:bg-orange-800/50 border border-orange-700/50 hover:border-orange-600 flex items-center justify-center transition-all group"
              title="Important Safety Information"
            >
              <Info className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors" />
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
            >
              <X className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-700/50 px-6 pt-4 shrink-0">
          <div className="flex gap-2 overflow-x-auto">
            <TabButton
              active={activeTab === 'display'}
              onClick={() => setActiveTab('display')}
              icon={<Map className="w-4 h-4" />}
              label="Display"
            />
            <TabButton
              active={activeTab === 'chart'}
              onClick={() => setActiveTab('chart')}
              icon={<Layers className="w-4 h-4" />}
              label="Chart Layers"
            />
            <TabButton
              active={activeTab === 'route'}
              onClick={() => setActiveTab('route')}
              icon={<Route className="w-4 h-4" />}
              label="Route"
            />
            <TabButton
              active={activeTab === 'vessel'}
              onClick={() => setActiveTab('vessel')}
              icon={<Ship className="w-4 h-4" />}
              label="Vessel Profile"
            />
          </div>
        </div>

        {/* Content Area - NOW WITH SCROLLING */}
        <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
          {activeTab === 'display' && (
            <DisplaySettings 
              displayMode={displayMode}
              onDisplayModeChange={onDisplayModeChange}
              cursorBoxVisible={cursorBoxVisible}
              onCursorBoxVisibleChange={onCursorBoxVisibleChange}
            />
          )}
          {activeTab === 'chart' && (
            <ChartSettings 
              openSeaMapLayer={openSeaMapLayer}
              onOpenSeaMapLayerChange={onOpenSeaMapLayerChange}
              fiskeridirLayer={fiskeridirLayer}
              onFiskeridirLayerChange={onFiskeridirLayerChange}
              tssLayer={tssLayer}
              onTssLayerChange={onTssLayerChange}
              weatherLayer={weatherLayer}
              onWeatherLayerChange={onWeatherLayerChange}
              basemapType={basemapType}
              onBasemapTypeChange={onBasemapTypeChange}
            />
          )}
          {activeTab === 'route' && (
            <RouteSettings 
              coursePredictorVisible={coursePredictorVisible}
              onCoursePredictorVisibleChange={onCoursePredictorVisibleChange}
              coursePredictorMinutes={coursePredictorMinutes}
              onCoursePredictorMinutesChange={onCoursePredictorMinutesChange}
              setDriftVisible={setDriftVisible}
              onSetDriftVisibleChange={onSetDriftVisibleChange}
            />
          )}
          {activeTab === 'vessel' && (
            <VesselProfileSettings 
              vesselProfile={vesselProfile}
              onVesselProfileChange={onVesselProfileChange}
            />
          )}
        </div>

        {/* Footer */}
        <div className="h-16 border-t border-slate-700/50 px-6 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-sm text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 rounded-lg text-sm text-white font-medium transition-colors"
          >
            Apply Changes
          </button>
        </div>
      </div>
    </div>

    {/* ECDIS Warning Dialog */}
    {showWarningDialog && (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
        <div className="bg-slate-900/98 backdrop-blur-md border-2 border-orange-600/50 rounded-xl shadow-2xl w-full max-w-[560px] max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="h-14 border-b border-orange-700/50 px-5 flex items-center justify-between bg-gradient-to-r from-orange-900/30 to-red-900/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-base text-white font-bold uppercase tracking-wide">Safety Warning</h2>
                <p className="text-xs text-orange-400">Critical Navigation Information</p>
              </div>
            </div>
            <button
              onClick={() => setShowWarningDialog(false)}
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group"
            >
              <X className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
            <div className="space-y-3">
              {/* Main Warning */}
              <div className="p-3 bg-red-900/20 border-2 border-red-600/40 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm text-red-400 font-bold mb-1 uppercase">NOT AN ECDIS SYSTEM</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      NAVIGEN is <strong>NOT</strong> a certified Electronic Chart Display and Information System (ECDIS) 
                      and does <strong>NOT</strong> comply with IMO SOLAS Chapter V requirements.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warnings List */}
              <div className="space-y-2">
                <h4 className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Critical Limitations</h4>
                
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300">
                      <strong className="text-orange-400">DO NOT USE</strong> for collision avoidance, primary navigation, or grounding prevention
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300">
                      <strong className="text-orange-400">NOT CERTIFIED</strong> for official chart carriage requirements under SOLAS
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300">
                      <strong className="text-orange-400">COMPLIANCE TOOL ONLY</strong> - designed for regulatory planning and compliance monitoring
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300">
                      <strong className="text-orange-400">CHART ACCURACY</strong> not guaranteed - always use official, updated nautical charts
                    </p>
                  </div>

                  <div className="flex items-start gap-2 p-2 bg-slate-800/40 border border-slate-700/50 rounded-lg">
                    <div className="w-1 h-1 rounded-full bg-orange-400 flex-shrink-0 mt-1.5" />
                    <p className="text-xs text-slate-300">
                      <strong className="text-orange-400">OFFICER RESPONSIBILITY</strong> - navigational decisions remain with the Master and bridge officers
                    </p>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="p-3 bg-cyan-900/10 border border-cyan-700/30 rounded-lg">
                <h4 className="text-xs text-cyan-400 font-semibold mb-1.5 uppercase">Intended Purpose</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  NAVIGEN is designed as a <strong>compliance planning tool</strong> for IMO, SOLAS, MARPOL, IAATO, 
                  and regional regulations. Use alongside certified ECDIS and paper charts for safe navigation.
                </p>
              </div>

              {/* Footer Note */}
              <div className="text-xs text-slate-500 text-center pt-2 border-t border-slate-700/50">
                By using NAVIGEN, you acknowledge these limitations and accept full responsibility for navigation safety
              </div>
            </div>
          </div>

          {/* Footer Button */}
          <div className="h-12 border-t border-slate-700/50 px-5 flex items-center justify-center shrink-0">
            <button
              onClick={() => setShowWarningDialog(false)}
              className="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-lg text-sm text-white font-semibold transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-t-lg border-b-2 transition-all ${
        active
          ? 'bg-slate-800/80 border-amber-500 text-amber-400'
          : 'bg-transparent border-transparent text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function DisplaySettings({ displayMode, onDisplayModeChange, cursorBoxVisible, onCursorBoxVisibleChange }: { displayMode: DisplayMode; onDisplayModeChange: (mode: DisplayMode) => void; cursorBoxVisible: boolean; onCursorBoxVisibleChange: (visible: boolean) => void }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Display Mode">
        <ControlledToggle 
          label="Day Mode" 
          description="High contrast for daylight operations" 
          checked={displayMode === 'day'}
          onChange={(enabled) => enabled && onDisplayModeChange('day')}
        />
        <ControlledToggle 
          label="Night Mode" 
          description="Reduced brightness for night navigation" 
          checked={displayMode === 'night'}
          onChange={(enabled) => enabled && onDisplayModeChange('night')}
        />
        <ControlledToggle 
          label="Dusk Mode" 
          description="Balanced visibility for twilight" 
          checked={displayMode === 'dusk'}
          onChange={(enabled) => enabled && onDisplayModeChange('dusk')}
        />
      </SettingSection>

      <SettingSection title="Map Display">
        <ControlledToggle 
          label="Cursor Position Box" 
          description="Show cursor coordinates and range/bearing" 
          checked={cursorBoxVisible}
          onChange={onCursorBoxVisibleChange}
        />
      </SettingSection>

      <SettingSection title="Chart Symbols">
        <SettingToggle label="Simplified Symbols" description="Use simplified chart symbols" defaultChecked={true} />
        <SettingToggle label="Traditional Symbols" description="Paper chart style symbols" />
      </SettingSection>

      <SettingSection title="Safety Contours">
        <SettingSlider label="Safety Depth" value="10m" />
        <SettingSlider label="Shallow Contour" value="5m" />
        <SettingSlider label="Deep Contour" value="30m" />
      </SettingSection>
    </div>
  );
}

function ChartSettings({ openSeaMapLayer, onOpenSeaMapLayerChange, fiskeridirLayer, onFiskeridirLayerChange, tssLayer, onTssLayerChange, weatherLayer, onWeatherLayerChange, basemapType, onBasemapTypeChange }: { openSeaMapLayer: boolean; onOpenSeaMapLayerChange: (visible: boolean) => void; fiskeridirLayer: boolean; onFiskeridirLayerChange: (visible: boolean) => void; tssLayer: boolean; onTssLayerChange: (visible: boolean) => void; weatherLayer: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature'; onWeatherLayerChange: (layer: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature') => void; basemapType: 'ocean' | 'geographic'; onBasemapTypeChange: (type: 'ocean' | 'geographic') => void }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Base Chart">
        <ControlledToggle 
          label="ESRI World Ocean" 
          description="Current base layer" 
          checked={basemapType === 'ocean'}
          onChange={() => onBasemapTypeChange('ocean')}
        />
        <ControlledToggle 
          label="OpenStreetMap Nautical" 
          description="Alternative nautical chart" 
          checked={basemapType === 'geographic'}
          onChange={() => onBasemapTypeChange('geographic')}
        />
      </SettingSection>

      <SettingSection title="Nautical Overlays">
        <ControlledToggle 
          label="OpenSeaMap" 
          description="Buoys, lights, and depth contours" 
          checked={openSeaMapLayer}
          onChange={onOpenSeaMapLayerChange}
        />
        <ControlledToggle 
          label="Kartverket Sjøkart" 
          description="Norwegian nautical chart overlay (raster)" 
          checked={fiskeridirLayer}
          onChange={onFiskeridirLayerChange}
        />
        <ControlledToggle 
          label="Traffic Separation Schemes (TSS)" 
          description="IMO-defined traffic lanes and separation zones" 
          checked={tssLayer}
          onChange={onTssLayerChange}
        />
      </SettingSection>

      <SettingSection title="Additional Layers">
        <WeatherLayerSetting
          value={weatherLayer}
          onChange={onWeatherLayerChange}
        />
        <SettingToggle label="Traffic Density" description="AIS vessel density heatmap" />
      </SettingSection>

      <SettingSection title="Information Display">
        <SettingToggle label="Depth Soundings" description="Show depth values on chart" defaultChecked={true} />
        <SettingToggle label="Light Sectors" description="Display lighthouse sectors" defaultChecked={true} />
      </SettingSection>
    </div>
  );
}

function RouteSettings({ coursePredictorVisible, onCoursePredictorVisibleChange, coursePredictorMinutes, onCoursePredictorMinutesChange, setDriftVisible, onSetDriftVisibleChange }: { coursePredictorVisible: boolean; onCoursePredictorVisibleChange: (visible: boolean) => void; coursePredictorMinutes: number; onCoursePredictorMinutesChange: (minutes: number) => void; setDriftVisible: boolean; onSetDriftVisibleChange: (visible: boolean) => void }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Navigation Vectors">
        <ControlledToggle 
          label="Course Predictor" 
          description="Show predicted vessel position based on COG/SOG" 
          checked={coursePredictorVisible}
          onChange={onCoursePredictorVisibleChange}
        />
        <ControlledSlider 
          label="Predictor Duration" 
          value={coursePredictorMinutes}
          onChange={onCoursePredictorMinutesChange}
          min={1}
          max={30}
          unit="min"
        />
        <ControlledToggle 
          label="Set & Drift Vector" 
          description="Display current/wind drift indicator" 
          checked={setDriftVisible}
          onChange={onSetDriftVisibleChange}
        />
      </SettingSection>

      <SettingSection title="Route Planning">
        <SettingToggle label="Auto Route Check" description="Validate route against hazards" defaultChecked={true} />
        <SettingToggle label="Safety Corridor" description="Display safety margins around route" defaultChecked={true} />
        <SettingSlider label="Corridor Width" value="0.5 NM" />
      </SettingSection>

      <SettingSection title="Waypoint Settings">
        <SettingToggle label="Turn Radius Display" description="Show turning circles at waypoints" defaultChecked={true} />
        <SettingSlider label="Wheel-Over Point" value="0.2 NM" />
      </SettingSection>

      <SettingSection title="Route Monitoring">
        <SettingToggle label="ETA Calculation" description="Continuous ETA updates" defaultChecked={true} />
        <SettingToggle label="Fuel Consumption" description="Track fuel usage on route" />
      </SettingSection>
    </div>
  );
}

function VesselProfileSettings({ vesselProfile, onVesselProfileChange }: { vesselProfile: VesselProfile; onVesselProfileChange: (profile: VesselProfile) => void }) {
  const [profile, setProfile] = useState(vesselProfile);

  const handleChange = (key: keyof VesselProfile, value: any) => {
    setProfile(prev => ({ ...prev, [key]: value }));
    onVesselProfileChange({ ...profile, [key]: value });
  };

  return (
    <div className="space-y-6">
      <SettingSection title="Vessel Type">
        <SettingSelect
          label="Vessel Type"
          value={profile.vesselType}
          onChange={(value) => handleChange('vesselType', value)}
          options={[
            { value: 'passenger', label: 'Passenger' },
            { value: 'cruise', label: 'Cruise' },
            { value: 'cargo', label: 'Cargo' },
            { value: 'tanker', label: 'Tanker' },
            { value: 'research', label: 'Research' },
            { value: 'fishing', label: 'Fishing' },
            { value: 'other', label: 'Other' },
          ]}
        />
      </SettingSection>

      <SettingSection title="Polar Class">
        <SettingSelect
          label="Polar Class"
          value={profile.polarClass}
          onChange={(value) => handleChange('polarClass', value)}
          options={[
            { value: 'PC1', label: 'PC1' },
            { value: 'PC2', label: 'PC2' },
            { value: 'PC3', label: 'PC3' },
            { value: 'PC4', label: 'PC4' },
            { value: 'PC5', label: 'PC5' },
            { value: 'PC6', label: 'PC6' },
            { value: 'PC7', label: 'PC7' },
            { value: 'none', label: 'None' },
          ]}
        />
      </SettingSection>

      <SettingSection title="Ice Class">
        <SettingSelect
          label="Ice Class"
          value={profile.iceClass}
          onChange={(value) => handleChange('iceClass', value)}
          options={[
            { value: '1A_SUPER', label: '1A Super' },
            { value: '1A', label: '1A' },
            { value: '1B', label: '1B' },
            { value: '1C', label: '1C' },
            { value: 'II', label: 'II' },
            { value: 'III', label: 'III' },
            { value: 'none', label: 'None' },
          ]}
        />
      </SettingSection>

      <SettingSection title="Flag State">
        <SettingInput
          label="Flag State"
          value={profile.flagState}
          onChange={(value) => handleChange('flagState', value)}
        />
      </SettingSection>

      <SettingSection title="Gross Tonnage">
        <SettingInput
          label="Gross Tonnage"
          value={profile.grossTonnage?.toString() || ''}
          onChange={(value) => handleChange('grossTonnage', value ? parseInt(value) : undefined)}
          type="number"
        />
      </SettingSection>
    </div>
  );
}

function SettingSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm text-slate-400 font-semibold uppercase tracking-wide">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function SettingToggle({ label, description, defaultChecked = false }: { label: string; description: string; defaultChecked?: boolean }) {
  const [checked, setChecked] = useState(defaultChecked);
  
  return (
    <div className="flex items-start justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors">
      <div className="flex-1 pr-4">
        <div className="text-sm text-white font-medium mb-0.5">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-amber-600' : 'bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function ControlledToggle({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <div className="flex items-start justify-between p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors">
      <div className="flex-1 pr-4">
        <div className="text-sm text-white font-medium mb-0.5">{label}</div>
        <div className="text-xs text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? 'bg-amber-600' : 'bg-slate-700'
        }`}
      >
        <div
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function SettingSlider({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-xs text-amber-400 font-mono">{value}</div>
      </div>
      <input
        type="range"
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-600"
        defaultValue={50}
      />
    </div>
  );
}

function ControlledSlider({ label, value, onChange, min, max, unit }: { label: string; value: number; onChange: (value: number) => void; min: number; max: number; unit: string }) {
  return (
    <div className="p-3 bg-slate-800/30 border border-slate-700/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-white font-medium">{label}</div>
        <div className="text-xs text-amber-400 font-mono">{value} {unit}</div>
      </div>
      <input
        type="range"
        className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-amber-600"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        min={min}
        max={max}
      />
    </div>
  );
}

function WeatherLayerSetting({ value, onChange }: { value: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature'; onChange: (value: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature') => void }) {
  const options = [
    { value: 'none' as const, label: 'Off', description: 'No weather overlay' },
    { value: 'clouds' as const, label: 'Clouds', description: 'Global cloud cover' },
    { value: 'precipitation' as const, label: 'Precipitation', description: 'Rain and snow' },
    { value: 'wind' as const, label: 'Wind Arrows', description: 'Wind speed and direction vectors' },
    { value: 'temperature' as const, label: 'Temperature', description: 'Air temperature' },
  ];

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm text-white font-medium mb-0.5">Weather Layer</div>
          <div className="text-xs text-slate-400">{selected.description}</div>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as typeof value)}
        className="w-full mt-2 px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} - {option.description}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingSelect({ label, value, onChange, options }: { label: string; value: any; onChange: (value: any) => void; options: { value: any; label: string }[] }) {
  return (
    <div className="p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm text-white font-medium mb-0.5">{label}</div>
        </div>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SettingInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: 'text' | 'number' }) {
  return (
    <div className="p-3 bg-slate-800/30 hover:bg-slate-800/50 border border-slate-700/30 rounded-lg transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="text-sm text-white font-medium mb-0.5">{label}</div>
        </div>
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-2 px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
      />
    </div>
  );
}