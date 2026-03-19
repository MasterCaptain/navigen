import React from "react";
import { Upload, FolderOpen, FileText, Map, AlertTriangle } from "lucide-react";
import { ZoneSelectorDropdown } from "../components/ZoneSelectorDropdown";
import { ActivitySelectorDropdown } from "../components/ActivitySelectorDropdown";
import { PlannedOpsSelectorDropdown } from "../components/PlannedOpsSelectorDropdown";
import type { PlannedOp } from "../types/plannedOps";

interface VoyageModuleProps {
  onClose?: () => void;
  // Zone
  activeZones: string[];
  onActiveZonesChange: (zones: string[]) => void;
  onManageZones: () => void;
  // Activity
  activeActivity: string;
  onActiveActivityChange: (activity: string) => void;
  // Planned Ops
  plannedOps: PlannedOp[];
  onPlannedOpsChange: (ops: PlannedOp[]) => void;
  vesselPosition: { lat: number; lng: number };
}

export default function VoyageModule({
  onClose,
  activeZones,
  onActiveZonesChange,
  onManageZones,
  activeActivity,
  onActiveActivityChange,
  plannedOps,
  onPlannedOpsChange,
  vesselPosition,
}: VoyageModuleProps) {
  const [activeRouteTab, setActiveRouteTab] = React.useState<'recent' | 'favourites' | 'templates'>('recent');
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Mock route data
  const mockRoutes = {
    recent: [
      { id: 1, name: 'Longyearbyen - Ny-Ålesund', lastImported: '2026-02-19 14:30', region: 'Svalbard', notes: 'Ice conditions checked' },
      { id: 2, name: 'Pyramiden Transit', lastImported: '2026-02-18 09:15', region: 'Svalbard', notes: 'Wildlife survey route' },
      { id: 3, name: 'Barentsburg Approach', lastImported: '2026-02-17 16:45', region: 'Svalbard', notes: '' },
    ],
    favourites: [
      { id: 4, name: 'Kongsfjorden Circuit', lastImported: '2026-02-10 11:20', region: 'Svalbard', notes: 'Glacier monitoring' },
      { id: 5, name: 'Isfjorden Inner Loop', lastImported: '2026-02-05 08:00', region: 'Svalbard', notes: 'Research stations' },
    ],
    templates: [
      { id: 6, name: 'Standard Arctic Transit', lastImported: '2026-01-15 10:00', region: 'Arctic', notes: 'IMO approved' },
      { id: 7, name: 'Emergency Evacuation Route', lastImported: '2026-01-10 14:30', region: 'Svalbard', notes: 'SAR template' },
    ]
  };

  const currentRoutes = mockRoutes[activeRouteTab];

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0a1628", color: "#e2e8f0" }}>
      {/* Topbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid rgba(6, 182, 212, 0.2)", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, letterSpacing: 1, color: "#06b6d4" }}>NAVIGEN</div>
        
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", color: "#06b6d4", fontWeight: 700 }}>
          VOYAGE
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
          
          {/* Section: Operational Context */}
          <Section title="Operational Context">
            <ControlRow label="Zone / Area of Operations">
              <ZoneSelectorDropdown 
                value={activeZones} 
                onChange={onActiveZonesChange}
                onManageZones={onManageZones}
              />
            </ControlRow>
            <ControlRow label="Vessel Activity">
              <ActivitySelectorDropdown 
                value={activeActivity} 
                onChange={onActiveActivityChange} 
              />
            </ControlRow>
          </Section>

          {/* Section: Planned Operations */}
          <Section title="Planned Operations">
            <div style={{ padding: 16, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12 }}>
              <PlannedOpsSelectorDropdown 
                value={plannedOps}
                onChange={onPlannedOpsChange}
                vesselPosition={vesselPosition}
              />
            </div>
          </Section>

          {/* Section: Route Planning */}
          <Section title="Routes">
            <div style={{ 
              background: "rgba(15, 23, 42, 0.95)", 
              border: "1px solid rgba(71, 85, 105, 0.6)", 
              borderRadius: 12,
              overflow: "hidden"
            }}>
              {/* Header with Import RTZ button */}
              <div style={{ 
                padding: 16, 
                borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Route Management
                </div>
                <button
                  onClick={() => setShowImportDialog(true)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 8,
                    background: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.5)",
                    color: "#06b6d4",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                  }}
                >
                  <Upload size={14} />
                  IMPORT RTZ
                </button>
              </div>

              {/* Tabs */}
              <div style={{ 
                display: "flex", 
                gap: 0, 
                borderBottom: "1px solid rgba(71, 85, 105, 0.3)",
                background: "rgba(10, 22, 40, 0.5)"
              }}>
                {(['recent', 'favourites', 'templates'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveRouteTab(tab)}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      border: "none",
                      background: activeRouteTab === tab ? "rgba(6, 182, 212, 0.1)" : "transparent",
                      borderBottom: activeRouteTab === tab ? "2px solid #06b6d4" : "2px solid transparent",
                      color: activeRouteTab === tab ? "#06b6d4" : "#64748b",
                      fontWeight: 600,
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      if (activeRouteTab !== tab) {
                        e.currentTarget.style.background = "rgba(71, 85, 105, 0.1)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (activeRouteTab !== tab) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {tab === 'recent' ? 'Recent' : tab === 'favourites' ? 'Favourites' : 'Templates'}
                  </button>
                ))}
              </div>

              {/* Route list */}
              <div style={{ padding: 16 }}>
                {currentRoutes.length === 0 ? (
                  <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: 12 }}>
                    No routes in this category
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {currentRoutes.map(route => (
                      <div
                        key={route.id}
                        style={{
                          background: "rgba(10, 22, 40, 0.6)",
                          border: "1px solid rgba(71, 85, 105, 0.4)",
                          borderRadius: 8,
                          padding: 12,
                          display: "flex",
                          flexDirection: "column",
                          gap: 8
                        }}
                      >
                        {/* Route header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
                              {route.name}
                            </div>
                            <div style={{ fontSize: 10, color: "#64748b" }}>
                              Last imported: {route.lastImported}
                            </div>
                          </div>
                          <div style={{ 
                            padding: "4px 8px", 
                            background: "rgba(6, 182, 212, 0.15)", 
                            border: "1px solid rgba(6, 182, 212, 0.3)",
                            borderRadius: 4,
                            fontSize: 9,
                            fontWeight: 700,
                            color: "#06b6d4",
                            textTransform: "uppercase",
                            letterSpacing: 0.5
                          }}>
                            {route.region}
                          </div>
                        </div>

                        {/* Notes */}
                        {route.notes && (
                          <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                            {route.notes}
                          </div>
                        )}

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                          <button
                            style={{
                              flex: 1,
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "rgba(6, 182, 212, 0.15)",
                              border: "1px solid rgba(6, 182, 212, 0.4)",
                              color: "#06b6d4",
                              fontWeight: 600,
                              fontSize: 10,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(6, 182, 212, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                            }}
                          >
                            <Map size={12} />
                            OPEN IN MAP
                          </button>
                          <button
                            style={{
                              flex: 1,
                              padding: "6px 12px",
                              borderRadius: 6,
                              background: "rgba(251, 191, 36, 0.15)",
                              border: "1px solid rgba(251, 191, 36, 0.4)",
                              color: "#fbbf24",
                              fontWeight: 600,
                              fontSize: 10,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: 6,
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(251, 191, 36, 0.25)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(251, 191, 36, 0.15)";
                            }}
                          >
                            <AlertTriangle size={12} />
                            RUN COMPLIANCE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Section>

          {/* Section: Voyage Information */}
          <Section title="Voyage Information">
            <InfoBox label="Current Position">
              {vesselPosition.lat.toFixed(4)}°N, {vesselPosition.lng.toFixed(4)}°E
            </InfoBox>
            <InfoBox label="Active Zone">
              {activeZones.join(' + ')}
            </InfoBox>
            <InfoBox label="Current Activity">
              {activeActivity}
            </InfoBox>
            <InfoBox label="Planned Operations">
              {plannedOps.length} operation{plannedOps.length !== 1 ? 's' : ''} planned
            </InfoBox>
          </Section>

        </div>
      </div>

      {/* Import RTZ Dialog */}
      {showImportDialog && (
        <div 
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
          onClick={() => setShowImportDialog(false)}
        >
          <div 
            style={{
              background: "#0f172a",
              border: "2px solid rgba(6, 182, 212, 0.4)",
              borderRadius: 16,
              padding: 32,
              maxWidth: 500,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>
                Import RTZ Route
              </h2>
              <button
                onClick={() => setShowImportDialog(false)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#64748b",
                  fontSize: 24,
                  cursor: "pointer",
                  padding: 0,
                  width: 32,
                  height: 32,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                console.log('Files dropped:', e.dataTransfer.files);
              }}
              style={{
                border: `2px dashed ${isDragOver ? '#06b6d4' : 'rgba(71, 85, 105, 0.6)'}`,
                borderRadius: 12,
                padding: 48,
                textAlign: "center",
                background: isDragOver ? "rgba(6, 182, 212, 0.05)" : "rgba(10, 22, 40, 0.6)",
                marginBottom: 16,
                transition: "all 0.2s"
              }}
            >
              <Upload 
                size={48} 
                style={{ 
                  color: isDragOver ? "#06b6d4" : "#64748b", 
                  margin: "0 auto 16px",
                  display: "block"
                }} 
              />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                Drag & Drop RTZ files here
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                or use the options below
              </div>
            </div>

            {/* Import Options */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
                }}
              >
                <FileText size={20} style={{ color: "#06b6d4" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                    Browse Files
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Select RTZ files from your device
                  </div>
                </div>
                <input 
                  type="file" 
                  accept=".rtz" 
                  multiple 
                  style={{ display: "none" }}
                  onChange={(e) => {
                    console.log('Files selected:', e.target.files);
                  }}
                />
              </label>

              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 16,
                  background: "rgba(6, 182, 212, 0.1)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                  borderRadius: 8,
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(6, 182, 212, 0.1)";
                }}
              >
                <FolderOpen size={20} style={{ color: "#06b6d4" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                    Select Folder
                  </div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>
                    Import all RTZ files from a folder (desktop)
                  </div>
                </div>
                <input 
                  type="file"
                  {...({ webkitdirectory: "true" } as any)}
                  multiple 
                  style={{ display: "none" }}
                  onChange={(e) => {
                    console.log('Folder selected:', e.target.files);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}
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

function InfoBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ 
      padding: 12,
      background: "rgba(15, 23, 42, 0.95)",
      border: "1px solid rgba(71, 85, 105, 0.6)",
      borderRadius: 12
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
        {children}
      </div>
    </div>
  );
}