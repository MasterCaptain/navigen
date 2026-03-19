import React from "react";
import { Ship, Route as RouteIcon, TrendingUp, History, Upload, FolderOpen, Map, AlertTriangle, Trash2, Clock, Navigation, CheckCircle } from "lucide-react";
import { ZoneSelectorDropdown } from "../components/ZoneSelectorDropdown";
import { ActivitySelectorDropdown } from "../components/ActivitySelectorDropdown";
import { PlannedOpsSelectorDropdown } from "../components/PlannedOpsSelectorDropdown";
import type { PlannedOp } from "../types/plannedOps";
import type { Route, RouteWithWaypoints, Voyage, ProjectionResult } from "../types/routes";
import { runProjection, formatTimeRemaining, formatETA } from "../lib/projectionEngine";
import { listRoutes } from "../lib/voyageRepo";
import { parseRtz } from "../lib/rtz/parseRtz";
import { importRtzToDb, mockRoutesStorage } from "../lib/rtz/importRtz";
import { generatePreDepartureChecklist } from "../lib/routeComplianceAnalyzer";

// Mock active voyage storage
let mockActiveVoyage: Voyage | null = null;

// Mock functions using shared storage
const getRoutes = async (): Promise<Route[]> => {
  return mockRoutesStorage.map(r => ({
    id: r.id,
    owner_id: r.owner_id,
    name: r.name,
    region_tag: r.region_tag,
    source_type: r.source_type,
    file_name: r.file_name,
    distance_nm: r.distance_nm,
    waypoint_count: r.waypoint_count,
    created_at: r.created_at,
    last_used: r.last_used
  }));
};

const deleteRoute = async (id: string): Promise<void> => {
  const index = mockRoutesStorage.findIndex(r => r.id === id);
  if (index !== -1) {
    mockRoutesStorage.splice(index, 1);
  }
};

const getRouteWithWaypoints = async (id: string): Promise<RouteWithWaypoints | null> => {
  const route = mockRoutesStorage.find(r => r.id === id);
  return route || null;
};

const createVoyage = async (routeId: string): Promise<Voyage> => {
  return {
    id: `voyage-${Date.now()}`,
    vessel_id: 'mock-vessel-id',
    route_id: routeId,
    departure_time: new Date().toISOString(),
    default_sog: 10,
    status: 'active',
    created_at: new Date().toISOString(),
  };
};

const getActiveVoyage = async (): Promise<Voyage | null> => {
  return mockActiveVoyage;
};

interface VoyageModuleV2Props {
  onClose?: () => void;
  activeZones: string[];
  onActiveZonesChange: (zones: string[]) => void;
  onManageZones: () => void;
  activeActivity: string;
  onActiveActivityChange: (activity: string) => void;
  plannedOps: PlannedOp[];
  onPlannedOpsChange: (ops: PlannedOp[]) => void;
  vesselPosition: { lat: number; lng: number };
  onRouteSelected?: (route: RouteWithWaypoints) => void;
}

type TabType = 'active' | 'routes' | 'projection' | 'checklist' | 'history';

export default function VoyageModuleV2({
  onClose,
  activeZones,
  onActiveZonesChange,
  onManageZones,
  activeActivity,
  onActiveActivityChange,
  plannedOps,
  onPlannedOpsChange,
  vesselPosition,
  onRouteSelected
}: VoyageModuleV2Props) {
  const [activeTab, setActiveTab] = React.useState<TabType>('routes');
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = React.useState<RouteWithWaypoints | null>(null);
  const [activeVoyage, setActiveVoyage] = React.useState<Voyage | null>(null);
  const [projection, setProjection] = React.useState<ProjectionResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Import dialog state
  const [showImportDialog, setShowImportDialog] = React.useState(false);
  const [importing, setImporting] = React.useState(false);
  const [isDragOver, setIsDragOver] = React.useState(false);

  // Test database connection on mount
  React.useEffect(() => {
    listRoutes().then((rows) => {
      console.log('✅ Database connection test successful. Routes:', rows);
    }).catch((error) => {
      console.error('❌ Database connection test failed:', error);
    });
  }, []);

  // Load routes on mount
  React.useEffect(() => {
    loadRoutes();
    loadActiveVoyage();
  }, []);

  async function loadRoutes() {
    try {
      setLoading(true);
      const data = await getRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load routes:', err);
      setError('Failed to load routes');
    } finally {
      setLoading(false);
    }
  }

  async function loadActiveVoyage() {
    try {
      const voyage = await getActiveVoyage();
      setActiveVoyage(voyage);
      
      if (voyage) {
        // Load route and projection
        const route = await getRouteWithWaypoints(voyage.route_id);
        if (route) {
          setSelectedRoute(route);
          const proj = runProjection(route, new Date(voyage.departure_time), voyage.default_sog, vesselPosition);
          setProjection(proj);
        }
      }
    } catch (err) {
      console.error('Failed to load active voyage:', err);
    }
  }

  async function handleImportRTZ(file: File) {
    try {
      setImporting(true);
      setError(null);

      // Read file content
      const text = await file.text();
      
      // Parse RTZ using new parser
      const parsed = parseRtz(text);
      
      // Import to database using new importer
      const route = await importRtzToDb(parsed);
      
      console.log(`✅ Imported route: ${route.name} with ${parsed.waypoints.length} waypoints`);
      
      // Reload routes
      await loadRoutes();
      setShowImportDialog(false);
    } catch (err) {
      console.error('Import failed:', err);
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  }

  async function handleDeleteRoute(routeId: string) {
    if (!confirm('Delete this route?')) return;
    
    try {
      await deleteRoute(routeId);
      await loadRoutes();
      if (selectedRoute?.id === routeId) {
        setSelectedRoute(null);
        setProjection(null);
      }
    } catch (err) {
      console.error('Delete failed:', err);
      setError('Failed to delete route');
    }
  }

  async function handleOpenOnMap(routeId: string) {
    try {
      const route = await getRouteWithWaypoints(routeId);
      if (route) {
        setSelectedRoute(route);
        if (onRouteSelected) {
          onRouteSelected(route);
        }
      }
    } catch (err) {
      console.error('Failed to load route:', err);
    }
  }

  async function handleRunProjection(routeId: string) {
    try {
      setLoading(true);
      const route = await getRouteWithWaypoints(routeId);
      if (route) {
        setSelectedRoute(route);
        const departureTime = new Date();
        const defaultSOG = 10; // Default 10 knots
        const proj = runProjection(route, departureTime, defaultSOG, vesselPosition);
        setProjection(proj);
        setActiveTab('projection');
      }
    } catch (err) {
      console.error('Projection failed:', err);
      setError('Failed to run projection');
    } finally {
      setLoading(false);
    }
  }

  async function handleSetAsActive(routeId: string) {
    try {
      const departureTime = new Date();
      const defaultSOG = 10;
      const voyage = await createVoyage(routeId);
      mockActiveVoyage = voyage;
      await loadActiveVoyage();
      setActiveTab('active');
    } catch (err) {
      console.error('Failed to set active voyage:', err);
      setError('Failed to activate voyage');
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#0B1C2D", color: "#e2e8f0" }}>
      {/* Topbar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16, borderBottom: "1px solid rgba(6, 182, 212, 0.2)", flexShrink: 0 }}>
        <div style={{ fontWeight: 800, letterSpacing: 1, color: "#06b6d4" }}>NAVIGEN</div>
        
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", color: "#06b6d4", fontWeight: 700 }}>
          VOYAGE
        </div>

        <div style={{ flex: 1 }} />
        
        {error && (
          <div style={{ padding: "8px 12px", background: "rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239, 68, 68, 0.4)", borderRadius: 8, fontSize: 12, color: "#ef4444" }}>
            {error}
          </div>
        )}
        
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

      {/* Tab Bar */}
      <div style={{ display: "flex", borderBottom: "1px solid rgba(6, 182, 212, 0.2)", background: "rgba(10, 20, 35, 0.8)" }}>
        {[
          { id: 'active' as TabType, label: 'Active Voyage', icon: Ship },
          { id: 'routes' as TabType, label: 'Routes', icon: RouteIcon },
          { id: 'projection' as TabType, label: 'Projection', icon: TrendingUp },
          { id: 'checklist' as TabType, label: 'Checklist', icon: CheckCircle },
          { id: 'history' as TabType, label: 'History', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "none",
              background: activeTab === tab.id ? "rgba(6, 182, 212, 0.1)" : "transparent",
              borderBottom: activeTab === tab.id ? "2px solid #06b6d4" : "2px solid transparent",
              color: activeTab === tab.id ? "#06b6d4" : "#64748b",
              fontWeight: 600,
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: 0.5,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          
          {/* ACTIVE VOYAGE TAB */}
          {activeTab === 'active' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>
                Active Voyage
              </h2>
              {activeVoyage && selectedRoute ? (
                <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, padding: 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
                    {selectedRoute.name}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    <InfoBox label="Distance" value={selectedRoute.distance_nm ? `${selectedRoute.distance_nm.toFixed(1)} nm` : 'N/A'} />
                    <InfoBox label="Waypoints" value={selectedRoute.waypoint_count.toString()} />
                    <InfoBox label="SOG" value={`${activeVoyage.default_sog} kts`} />
                    <InfoBox label="Status" value={activeVoyage.status.toUpperCase()} />
                  </div>
                  {projection && (
                    <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(71, 85, 105, 0.3)" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#06b6d4", marginBottom: 12 }}>
                        UPCOMING ZONE ENTRIES
                      </div>
                      {projection.upcoming_entries.slice(0, 5).map((entry, i) => (
                        <div key={i} style={{ padding: 12, background: "rgba(10, 22, 40, 0.6)", borderLeft: "3px solid #fbbf24", marginBottom: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{entry.zone_name}</div>
                          <div style={{ fontSize: 11, color: "#64748b" }}>ETA: {formatETA(entry.entry_time)}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                  <Ship size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                  <div style={{ fontSize: 14, marginBottom: 8 }}>No active voyage</div>
                  <div style={{ fontSize: 12 }}>Import a route and set it as active to begin</div>
                </div>
              )}
            </div>
          )}

          {/* ROUTES TAB */}
          {activeTab === 'routes' && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
                  Route Library
                </h2>
                <button
                  onClick={() => setShowImportDialog(true)}
                  style={{
                    padding: "10px 20px",
                    borderRadius: 8,
                    background: "rgba(6, 182, 212, 0.15)",
                    border: "1px solid rgba(6, 182, 212, 0.5)",
                    color: "#06b6d4",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.25)";
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(6, 182, 212, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(6, 182, 212, 0.15)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <Upload size={16} />
                  IMPORT RTZ
                </button>
              </div>

              {loading && routes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                  Loading routes...
                </div>
              ) : routes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                  <RouteIcon size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                  <div style={{ fontSize: 14, marginBottom: 8 }}>No routes imported</div>
                  <div style={{ fontSize: 12 }}>Click "Import RTZ" to add your first route</div>
                </div>
              ) : (
                <RouteTable
                  routes={routes}
                  onOpenOnMap={handleOpenOnMap}
                  onRunProjection={handleRunProjection}
                  onSetAsActive={handleSetAsActive}
                  onDelete={handleDeleteRoute}
                />
              )}
            </div>
          )}

          {/* PROJECTION TAB */}
          {activeTab === 'projection' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>
                Compliance Projection
              </h2>
              {projection && selectedRoute ? (
                <ProjectionView projection={projection} route={selectedRoute} />
              ) : (
                <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                  <TrendingUp size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                  <div style={{ fontSize: 14, marginBottom: 8 }}>No projection available</div>
                  <div style={{ fontSize: 12 }}>Select a route and click "Run Projection"</div>
                </div>
              )}
            </div>
          )}

          {/* CHECKLIST TAB */}
          {activeTab === 'checklist' && (() => {
            // Analyze route and generate checklist if available
            const routeAnalysis = selectedRoute && projection 
              ? { 
                  totalWaypoints: selectedRoute.waypoint_count,
                  polarWaterSegments: projection.upcoming_entries.filter(e => e.zone_type.includes('IMO')).length,
                  svalbardSegments: projection.upcoming_entries.filter(e => e.zone_name.includes('Svalbard')).length,
                  protectedAreaSegments: projection.upcoming_entries.filter(e => e.zone_type.includes('Protected') || e.zone_type.includes('NR')).length,
                  criticalWarnings: []
                }
              : null;
            
            const checklist = routeAnalysis 
              ? generatePreDepartureChecklist(routeAnalysis)
              : [];

            return (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>
                  Pre-Departure Checklist
                </h2>
                {selectedRoute && checklist.length > 0 ? (
                  <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>
                      {selectedRoute.name}
                    </div>
                    <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 24 }}>
                      {checklist.length} items to review before departure
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {checklist.map((item, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "start", gap: 12, padding: 16, background: "rgba(10, 22, 40, 0.6)", borderLeft: "3px solid #06b6d4", borderRadius: 4 }}>
                          <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(6, 182, 212, 0.2)", border: "2px solid #06b6d4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                            <CheckCircle size={12} style={{ color: "#06b6d4" }} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6 }}>
                              {item}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {projection && projection.upcoming_entries.length > 0 && (
                      <div style={{ marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(71, 85, 105, 0.3)" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#06b6d4", marginBottom: 12 }}>
                          UPCOMING ZONE ENTRIES
                        </div>
                        {projection.upcoming_entries.slice(0, 5).map((entry, i) => (
                          <div key={i} style={{ padding: 12, background: "rgba(10, 22, 40, 0.6)", borderLeft: "3px solid #fbbf24", marginBottom: 8 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0" }}>{entry.zone_name}</div>
                            <div style={{ fontSize: 11, color: "#64748b" }}>ETA: {formatETA(entry.entry_time)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                    <CheckCircle size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                    <div style={{ fontSize: 14, marginBottom: 8 }}>No checklist available</div>
                    <div style={{ fontSize: 12 }}>Run a projection on a route to generate a pre-departure checklist</div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1 }}>
                Voyage History
              </h2>
              <div style={{ textAlign: "center", padding: 48, color: "#64748b" }}>
                <History size={48} style={{ margin: "0 auto 16px", opacity: 0.3 }} />
                <div style={{ fontSize: 14 }}>History view coming soon</div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Import Dialog */}
      {showImportDialog && (
        <ImportDialog
          onClose={() => setShowImportDialog(false)}
          onImport={handleImportRTZ}
          importing={importing}
          isDragOver={isDragOver}
          setIsDragOver={setIsDragOver}
        />
      )}
    </div>
  );
}

// Route Table Component
function RouteTable({ routes, onOpenOnMap, onRunProjection, onSetAsActive, onDelete }: {
  routes: Route[];
  onOpenOnMap: (id: string) => void;
  onRunProjection: (id: string) => void;
  onSetAsActive: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, overflow: "hidden" }}>
      {/* Table Header */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr 1fr 2fr", gap: 16, padding: "12px 16px", background: "rgba(10, 20, 35, 0.8)", borderBottom: "1px solid rgba(71, 85, 105, 0.3)" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Name</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Region</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Imported</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>WPs</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Length</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Last Used</div>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5 }}>Actions</div>
      </div>

      {/* Table Rows */}
      {routes.map(route => (
        <div key={route.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 0.8fr 0.8fr 1fr 2fr", gap: 16, padding: "12px 16px", borderBottom: "1px solid rgba(71, 85, 105, 0.15)", transition: "background 0.2s" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(6, 182, 212, 0.05)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{route.name}</div>
          <div><span style={{ padding: "4px 8px", background: "rgba(6, 182, 212, 0.15)", border: "1px solid rgba(6, 182, 212, 0.3)", borderRadius: 4, fontSize: 10, fontWeight: 700, color: "#06b6d4" }}>{route.region_tag || 'N/A'}</span></div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{new Date(route.created_at).toLocaleDateString()}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{route.waypoint_count}</div>
          <div style={{ fontSize: 11, color: "#94a3b8" }}>{route.distance_nm ? route.distance_nm.toFixed(0) + ' nm' : '-'}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{route.last_used ? new Date(route.last_used).toLocaleDateString() : '-'}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <ActionButton icon={Map} onClick={() => onOpenOnMap(route.id)} color="cyan" tooltip="Open on Map" />
            <ActionButton icon={AlertTriangle} onClick={() => onRunProjection(route.id)} color="yellow" tooltip="Run Projection" />
            <ActionButton icon={Navigation} onClick={() => onSetAsActive(route.id)} color="green" tooltip="Set as Active" />
            <ActionButton icon={Trash2} onClick={() => onDelete(route.id)} color="red" tooltip="Delete" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Action Button
function ActionButton({ icon: Icon, onClick, color, tooltip }: { icon: any; onClick: () => void; color: string; tooltip: string }) {
  const colors = {
    cyan: { bg: "rgba(6, 182, 212, 0.15)", border: "rgba(6, 182, 212, 0.4)", text: "#06b6d4", hover: "rgba(6, 182, 212, 0.25)" },
    yellow: { bg: "rgba(251, 191, 36, 0.15)", border: "rgba(251, 191, 36, 0.4)", text: "#fbbf24", hover: "rgba(251, 191, 36, 0.25)" },
    green: { bg: "rgba(34, 197, 94, 0.15)", border: "rgba(34, 197, 94, 0.4)", text: "#22c55e", hover: "rgba(34, 197, 94, 0.25)" },
    red: { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.4)", text: "#ef4444", hover: "rgba(239, 68, 68, 0.25)" }
  };
  const c = colors[color as keyof typeof colors];

  return (
    <button
      onClick={onClick}
      title={tooltip}
      style={{
        padding: "6px",
        borderRadius: 6,
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s"
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = c.hover}
      onMouseLeave={(e) => e.currentTarget.style.background = c.bg}
    >
      <Icon size={14} />
    </button>
  );
}

// Projection View
function ProjectionView({ projection, route }: { projection: ProjectionResult; route: RouteWithWaypoints }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Summary */}
      <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>{route.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <InfoBox label="Total Distance" value={`${projection.total_distance_nm.toFixed(1)} nm`} />
          <InfoBox label="Total Time" value={formatTimeRemaining(projection.total_time_hours)} />
          <InfoBox label="Departure" value={formatETA(projection.departure_time)} />
          <InfoBox label="Arrival" value={formatETA(projection.arrival_time)} />
        </div>
      </div>

      {/* Upcoming Zone Entries */}
      <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#06b6d4", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Upcoming Zone Entries
        </div>
        {projection.upcoming_entries.length === 0 ? (
          <div style={{ textAlign: "center", padding: 24, color: "#64748b", fontSize: 12 }}>
            No zone entries detected on this route
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {projection.upcoming_entries.map((entry, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "rgba(10, 22, 40, 0.6)", borderLeft: "3px solid #fbbf24", borderRadius: 4 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{entry.zone_name}</div>
                  <div style={{ fontSize: 11, color: "#64748b" }}>{entry.zone_type}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#06b6d4" }}>{formatETA(entry.entry_time)}</div>
                  <div style={{ fontSize: 10, color: "#64748b" }}>{entry.lat.toFixed(2)}°N, {entry.lon.toFixed(2)}°E</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waypoint List */}
      <div style={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(71, 85, 105, 0.6)", borderRadius: 12, padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#06b6d4", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Waypoint Schedule
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {projection.legs.map((leg, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "rgba(10, 22, 40, 0.6)", borderRadius: 4 }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(6, 182, 212, 0.2)", border: "2px solid #06b6d4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#06b6d4" }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>{leg.waypoint_name}</div>
                <div style={{ fontSize: 11, color: "#64748b" }}>{leg.leg_distance_nm.toFixed(1)} nm · {formatTimeRemaining(leg.estimated_time_hours)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#06b6d4" }}>ETA: {formatETA(leg.cumulative_eta)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Import Dialog
function ImportDialog({ onClose, onImport, importing, isDragOver, setIsDragOver }: {
  onClose: () => void;
  onImport: (file: File) => void;
  importing: boolean;
  isDragOver: boolean;
  setIsDragOver: (v: boolean) => void;
}) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const rtzFile = files.find(f => f.name.endsWith('.rtz'));
    if (rtzFile) {
      onImport(rtzFile);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      onImport(files[0]);
    }
  }

  return (
    <div 
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: "#0f172a",
          border: "2px solid rgba(6, 182, 212, 0.4)",
          borderRadius: 16,
          padding: 32,
          maxWidth: 500,
          width: "90%",
          boxShadow: "0 0 40px rgba(6, 182, 212, 0.2)"
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: "#06b6d4", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>
            Import RTZ Route
          </h2>
          <button
            onClick={onClose}
            disabled={importing}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: 24,
              cursor: importing ? "not-allowed" : "pointer",
              padding: 0
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
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${isDragOver ? '#06b6d4' : 'rgba(71, 85, 105, 0.6)'}`,
            borderRadius: 12,
            padding: 48,
            textAlign: "center",
            background: isDragOver ? "rgba(6, 182, 212, 0.05)" : "rgba(10, 22, 40, 0.6)",
            cursor: importing ? "not-allowed" : "pointer",
            transition: "all 0.2s",
            position: "relative"
          }}
        >
          {importing ? (
            <>
              <Clock size={48} style={{ color: "#06b6d4", margin: "0 auto 16px", display: "block", animation: "pulse 2s infinite" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#06b6d4" }}>Importing route...</div>
            </>
          ) : (
            <>
              <Upload size={48} style={{ color: isDragOver ? "#06b6d4" : "#64748b", margin: "0 auto 16px", display: "block" }} />
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 8 }}>
                Drag & Drop RTZ file here
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>
                or click to browse
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".rtz"
            onChange={handleFileSelect}
            disabled={importing}
            style={{ display: "none" }}
          />
        </div>

        <div style={{ marginTop: 16, padding: 12, background: "rgba(6, 182, 212, 0.1)", borderRadius: 8, fontSize: 11, color: "#94a3b8" }}>
          <strong style={{ color: "#06b6d4" }}>RTZ Format:</strong> IEC 61174 compliant route exchange files (.rtz)
        </div>
      </div>
    </div>
  );
}

// Info Box
function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>
        {value}
      </div>
    </div>
  );
}