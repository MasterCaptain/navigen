import React from "react";
import { MapsSelector } from "../components/MapsSelector";
import { GPSSourceSelectorDropdown, type GPSSource, type SimulationConfig } from "../components/GPSSourceSelectorDropdown";
import { DayNightModeSelectorDropdown, type DisplayMode } from "../components/DayNightModeSelectorDropdown";

interface NAVModuleProps {
  onClose?: () => void;
  // Maps & Overlays
  arcticPolarVisible: boolean;
  onArcticPolarVisibleChange: (visible: boolean) => void;
  antarcticPolarVisible: boolean;
  onAntarcticPolarVisibleChange: (visible: boolean) => void;
  openSeaMapLayer: boolean;
  onOpenSeaMapLayerChange: (visible: boolean) => void;
  fiskeridirLayer: boolean;
  onFiskeridirLayerChange: (visible: boolean) => void;
  tssLayer: boolean;
  onTssLayerChange: (visible: boolean) => void;
  // GPS Source
  gpsSource: GPSSource;
  onGpsSourceChange: (source: GPSSource) => void;
  simulationConfig: SimulationConfig;
  onSimulationConfigChange: (config: SimulationConfig) => void;
  // Display Mode
  displayMode: DisplayMode;
  onDisplayModeChange: (mode: DisplayMode) => void;
  // Tools
  cursorBoxVisible: boolean;
  onCursorBoxVisibleChange: (visible: boolean) => void;
  coursePredictorVisible: boolean;
  onCoursePredictorVisibleChange: (visible: boolean) => void;
  coursePredictorMinutes: number;
  onCoursePredictorMinutesChange: (minutes: number) => void;
  setDriftVisible: boolean;
  onSetDriftVisibleChange: (visible: boolean) => void;
}

export default function NAVModule({
  onClose,
  arcticPolarVisible,
  onArcticPolarVisibleChange,
  antarcticPolarVisible,
  onAntarcticPolarVisibleChange,
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
}: NAVModuleProps) {
  console.log('🟢 NAVModule rendered with gpsSource:', gpsSource);
  console.log('🟢 NAVModule simulationConfig:', simulationConfig);
  
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a1628", color: "#e2e8f0" }}>
      {/* Topbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid rgba(6, 182, 212, 0.2)", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, letterSpacing: 1, color: "#06b6d4" }}>NAVIGEN</div>
        
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", color: "#06b6d4", fontWeight: 700 }}>
          NAV
        </div>

        <div style={{ flex: 1 }} />
        
        {onClose && (
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 10,
              background: "rgba(239, 68, 68, 0.2)",
              border: "1px solid rgba(239, 68, 68, 0.6)",
              color: "#ef4444",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
            }}
          >
            CLOSE
          </button>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          
          {/* Section: Chart Display */}
          <Section title="Chart Display">
            <ControlRow label="Display Mode">
              <DayNightModeSelectorDropdown value={displayMode} onChange={onDisplayModeChange} />
            </ControlRow>
          </Section>

          {/* Section: GPS & Positioning */}
          <Section title="GPS & Positioning">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {/* STATIC */}
              <button
                onClick={() => onGpsSourceChange('static')}
                style={{
                  padding: 16,
                  background: gpsSource === 'static' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.95)',
                  border: gpsSource === 'static' ? '2px solid #06b6d4' : '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: 12,
                  color: gpsSource === 'static' ? '#06b6d4' : '#94a3b8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 13,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (gpsSource !== 'static') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gpsSource !== 'static') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
              >
                STATIC
              </button>
              
              {/* DEVICE GPS */}
              <button
                onClick={() => onGpsSourceChange('device')}
                style={{
                  padding: 16,
                  background: gpsSource === 'device' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.95)',
                  border: gpsSource === 'device' ? '2px solid #06b6d4' : '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: 12,
                  color: gpsSource === 'device' ? '#06b6d4' : '#94a3b8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 13,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (gpsSource !== 'device') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gpsSource !== 'device') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
              >
                DEVICE GPS
              </button>
              
              {/* WIFI WS */}
              <button
                onClick={() => onGpsSourceChange('websocket')}
                style={{
                  padding: 16,
                  background: gpsSource === 'websocket' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.95)',
                  border: gpsSource === 'websocket' ? '2px solid #06b6d4' : '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: 12,
                  color: gpsSource === 'websocket' ? '#06b6d4' : '#94a3b8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 13,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (gpsSource !== 'websocket') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gpsSource !== 'websocket') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
              >
                WIFI WS
              </button>
              
              {/* HTTP */}
              <button
                onClick={() => onGpsSourceChange('http')}
                style={{
                  padding: 16,
                  background: gpsSource === 'http' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(15, 23, 42, 0.95)',
                  border: gpsSource === 'http' ? '2px solid #06b6d4' : '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: 12,
                  color: gpsSource === 'http' ? '#06b6d4' : '#94a3b8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 13,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (gpsSource !== 'http') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gpsSource !== 'http') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
              >
                HTTP
              </button>
            </div>
            
            {/* Simulation Config - Full width below */}
            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  // If already in simulation mode, this opens the config (we'll add a modal/panel later)
                  // Otherwise, just switch to simulation
                  onGpsSourceChange('simulation');
                }}
                style={{
                  width: '100%',
                  padding: 16,
                  background: gpsSource === 'simulation' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(15, 23, 42, 0.95)',
                  border: gpsSource === 'simulation' ? '2px solid #fbbf24' : '1px solid rgba(71, 85, 105, 0.6)',
                  borderRadius: 12,
                  color: gpsSource === 'simulation' ? '#fbbf24' : '#94a3b8',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: 13,
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if (gpsSource !== 'simulation') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (gpsSource !== 'simulation') {
                    e.currentTarget.style.background = 'rgba(15, 23, 42, 0.95)';
                  }
                }}
              >
                SIMULATION
                {gpsSource === 'simulation' && (
                  <div style={{ fontSize: 11, marginTop: 4, opacity: 0.8 }}>
                    {simulationConfig.lat.toFixed(4)}°, {simulationConfig.lng.toFixed(4)}° • {simulationConfig.speed}kn @ {simulationConfig.course}°
                  </div>
                )}
              </button>
              
              {/* Simulation config editor when in sim mode */}
              {gpsSource === 'simulation' && (
                <div style={{ 
                  marginTop: 12, 
                  padding: 16, 
                  background: 'rgba(251, 191, 36, 0.1)', 
                  border: '1px solid rgba(251, 191, 36, 0.3)', 
                  borderRadius: 12 
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: 12 }}>
                    SIMULATOR CONFIG
                  </div>
                  
                  <div style={{ display: 'grid', gap: 12 }}>
                    {/* Latitude */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                        Latitude (°)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={simulationConfig.lat}
                        onChange={(e) => onSimulationConfigChange({ ...simulationConfig, lat: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(71, 85, 105, 0.6)',
                          borderRadius: 6,
                          color: '#e2e8f0',
                          fontSize: 12
                        }}
                      />
                    </div>
                    
                    {/* Longitude */}
                    <div>
                      <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                        Longitude (°)
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={simulationConfig.lng}
                        onChange={(e) => onSimulationConfigChange({ ...simulationConfig, lng: parseFloat(e.target.value) || 0 })}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          background: 'rgba(15, 23, 42, 0.95)',
                          border: '1px solid rgba(71, 85, 105, 0.6)',
                          borderRadius: 6,
                          color: '#e2e8f0',
                          fontSize: 12
                        }}
                      />
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      {/* Speed */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                          Speed (kn)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={simulationConfig.speed}
                          onChange={(e) => onSimulationConfigChange({ ...simulationConfig, speed: parseFloat(e.target.value) || 0 })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(71, 85, 105, 0.6)',
                            borderRadius: 6,
                            color: '#e2e8f0',
                            fontSize: 12
                          }}
                        />
                      </div>
                      
                      {/* Course */}
                      <div>
                        <label style={{ display: 'block', fontSize: 11, color: '#94a3b8', marginBottom: 4, fontWeight: 600 }}>
                          Course (°)
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          max="359"
                          value={simulationConfig.course}
                          onChange={(e) => onSimulationConfigChange({ ...simulationConfig, course: parseInt(e.target.value) % 360 || 0 })}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(15, 23, 42, 0.95)',
                            border: '1px solid rgba(71, 85, 105, 0.6)',
                            borderRadius: 6,
                            color: '#e2e8f0',
                            fontSize: 12
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Section: Maps & Overlays */}
          <Section title="Maps & Overlays">
            <div style={{ padding: 16, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12 }}>
              <MapsSelector 
                arcticPolarVisible={arcticPolarVisible}
                onArcticPolarChange={onArcticPolarVisibleChange}
                antarcticPolarVisible={antarcticPolarVisible}
                onAntarcticPolarChange={onAntarcticPolarVisibleChange}
                openSeaMapLayer={openSeaMapLayer}
                onOpenSeaMapLayerChange={onOpenSeaMapLayerChange}
                fiskeridirLayer={fiskeridirLayer}
                onFiskeridirLayerChange={onFiskeridirLayerChange}
                tssLayer={tssLayer}
                onTssLayerChange={onTssLayerChange}
              />
            </div>
          </Section>

          {/* Section: Tools */}
          <Section title="Tools">
            <ToggleRow 
              label="Cursor Box" 
              checked={cursorBoxVisible} 
              onChange={onCursorBoxVisibleChange}
            />
            <div style={{ 
              padding: 16,
              background: "rgba(15, 23, 42, 0.95)",
              border: "1px solid rgba(71, 85, 105, 0.6)",
              borderRadius: 12
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: "#e2e8f0" }}>Course Predictor</span>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={coursePredictorVisible}
                    onChange={(e) => onCoursePredictorVisibleChange(e.target.checked)}
                    style={{ 
                      width: 18, 
                      height: 18, 
                      cursor: "pointer",
                      accentColor: "#06b6d4"
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Enabled</span>
                </label>
              </div>
              {coursePredictorVisible && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(71, 85, 105, 0.3)" }}>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>Prediction time:</span>
                  <input
                    type="number"
                    value={coursePredictorMinutes}
                    onChange={(e) => onCoursePredictorMinutesChange(Number(e.target.value))}
                    min="1"
                    max="60"
                    style={{ 
                      width: 70,
                      padding: "6px 10px",
                      background: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(71, 85, 105, 0.6)",
                      borderRadius: 6,
                      color: "#e2e8f0",
                      fontSize: 13,
                      textAlign: "center"
                    }}
                  />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>minutes</span>
                </div>
              )}
            </div>
            <ToggleRow 
              label="Set & Drift" 
              checked={setDriftVisible} 
              onChange={onSetDriftVisibleChange}
            />
          </Section>

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ 
        fontSize: 14, 
        fontWeight: 700, 
        color: "#06b6d4", 
        marginBottom: 16,
        textTransform: "uppercase",
        letterSpacing: 1
      }}>
        {title}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {children}
      </div>
    </div>
  );
}

function ControlRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: 16,
      background: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(71, 85, 105, 0.6)",
      borderRadius: 12
    }}>
      <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "space-between",
      padding: 16,
      background: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(71, 85, 105, 0.6)",
      borderRadius: 12
    }}>
      <span style={{ fontWeight: 600, color: "#e2e8f0" }}>{label}</span>
      <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ 
            width: 18, 
            height: 18, 
            cursor: "pointer",
            accentColor: "#06b6d4"
          }}
        />
        <span style={{ fontSize: 13, color: "#94a3b8" }}>Enabled</span>
      </label>
    </div>
  );
}