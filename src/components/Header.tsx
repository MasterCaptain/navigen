import { Settings, Wifi, WifiOff, AlertTriangle, Bell, Satellite, Navigation, Monitor } from 'lucide-react';
import { NavigenLogo } from './NavigenLogo';
import type { GPSSource, SimulationConfig } from './GPSSourceSelectorDropdown';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
  offlineMode: boolean;
  activeZone: string;
  activeActivity: string;
  activePolarCode: string;
  vesselPosition: { lat: number; lng: number };
  isLiveGPS?: boolean;
  gpsSource: GPSSource;
  onGpsSourceChange: (source: GPSSource) => void;
  simulationConfig: SimulationConfig;
  onSimulationConfigChange: (config: SimulationConfig) => void;
  detectedAreas: string[];
  // Alert props
  alertCount?: number;
  criticalAlertCount?: number;
  warningAlertCount?: number;
  onToggleAlerts?: () => void;
  alertsPanelVisible?: boolean;
  // AIS props
  aisEnabled?: boolean;
  onToggleAIS?: () => void;
}

export function Header({ onOpenSettings, offlineMode, activeZone, activeActivity, activePolarCode, vesselPosition, isLiveGPS = false, gpsSource, onGpsSourceChange, simulationConfig, onSimulationConfigChange, detectedAreas, alertCount = 0, criticalAlertCount = 0, warningAlertCount = 0, onToggleAlerts, alertsPanelVisible, aisEnabled = true, onToggleAIS }: HeaderProps) {
  // Track internet connectivity
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format position to DMS (Degrees, Minutes)
  const formatDMS = (lat: number, lng: number): string => {
    const formatCoord = (value: number, isLat: boolean) => {
      const abs = Math.abs(value);
      const deg = Math.floor(abs);
      const minFloat = (abs - deg) * 60;
      const min = minFloat.toFixed(1);
      const dir = isLat ? (value >= 0 ? 'N' : 'S') : (value >= 0 ? 'E' : 'W');
      return `${deg}°${min}'${dir}`;
    };
    return `${formatCoord(lat, true)} ${formatCoord(lng, false)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-sm border-b border-cyan-900/20 px-6 flex items-center justify-between shadow-lg z-50">
      {/* Left - Logo and Title */}
      <div className="flex items-center gap-3">
        <NavigenLogo size={36} variant="default" />
        <h1 className="text-base text-white font-semibold tracking-wide">NAVIGEN</h1>
      </div>

      {/* Right - Active Module Status + System Status + Settings */}
      <div className="flex items-center gap-2">
        {/* Active Module Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 border border-cyan-500/30 rounded-md">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs text-cyan-400 font-medium whitespace-nowrap">
            {activeZone} • {activeActivity} • {activePolarCode}
          </span>
        </div>

        {/* Polar Code Detection Badge - Shows when IMO_N60 or IMO_S60 detected */}
        {(detectedAreas.includes('IMO_N60') || detectedAreas.includes('IMO_S60')) && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/30 border border-red-500/50 rounded-md">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
            <span className="text-xs text-red-400 font-bold whitespace-nowrap">
              {detectedAreas.includes('IMO_N60') ? 'POLAR CODE N60 ACTIVE' : 'POLAR CODE S60 ACTIVE'}
            </span>
          </div>
        )}

        {/* GPS Position Display - Shows current position */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border ${
          gpsSource === 'simulation'
            ? 'bg-amber-500/10 border-amber-500/30'
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            gpsSource === 'simulation' ? 'bg-amber-400' : 'bg-emerald-400'
          }`} />
          <span className={`text-xs font-medium ${
            gpsSource === 'simulation' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {gpsSource === 'simulation' ? 'GPS SIM' : 
             gpsSource === 'device' ? 'GPS OK' :
             gpsSource === 'websocket' ? 'WIFI WS' :
             gpsSource === 'http' ? 'HTTP' :
             'STATIC'}
          </span>
          <span className="text-xs text-slate-400 font-mono ml-2">{formatDMS(vesselPosition.lat, vesselPosition.lng)}</span>
        </div>
        
        {/* AIS Status */}
        <button
          onClick={onToggleAIS}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all cursor-pointer ${
            aisEnabled
              ? 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20'
              : 'bg-slate-500/10 border-slate-500/30 hover:bg-slate-600/20'
          }`}
          title={aisEnabled ? 'AIS Enabled - Click to disable' : 'AIS Disabled - Click to enable'}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${aisEnabled ? 'bg-emerald-400' : 'bg-slate-400'}`} />
          <span className={`text-xs font-medium ${aisEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
            AIS {aisEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
        
        {/* Online/Offline Status - Internet Connectivity */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border ${
          !isOnline
            ? 'bg-slate-500/10 border-slate-500/30' 
            : 'bg-emerald-500/10 border-emerald-500/30'
        }`}>
          {!isOnline ? (
            <>
              <WifiOff className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-400 font-medium">OFFLINE</span>
            </>
          ) : (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">ONLINE</span>
            </>
          )}
        </div>
        
        {/* Alerts Button - Only show if there are alerts */}
        {alertCount > 0 && (
          <button 
            onClick={onToggleAlerts}
            className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border transition-all ${
              criticalAlertCount > 0
                ? 'bg-red-500/20 border-red-500/50 hover:bg-red-500/30'
                : warningAlertCount > 0
                ? 'bg-amber-500/20 border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-cyan-500/20 border-cyan-500/50 hover:bg-cyan-500/30'
            }`}
          >
            <Bell className={`w-3.5 h-3.5 ${
              criticalAlertCount > 0 ? 'text-red-400' : warningAlertCount > 0 ? 'text-amber-400' : 'text-cyan-400'
            }`} />
            <span className={`text-xs font-bold ${
              criticalAlertCount > 0 ? 'text-red-400' : warningAlertCount > 0 ? 'text-amber-400' : 'text-cyan-400'
            }`}>
              ALERTS
            </span>
            {criticalAlertCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {criticalAlertCount}
              </span>
            )}
            {warningAlertCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                {warningAlertCount}
              </span>
            )}
          </button>
        )}
        
        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg bg-slate-800/50 hover:bg-slate-700 border border-slate-700/50 flex items-center justify-center transition-colors group ml-2"
        >
          <Settings className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        </button>
      </div>
    </header>
  );
}