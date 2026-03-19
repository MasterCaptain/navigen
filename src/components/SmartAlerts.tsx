import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, AlertCircle, X, Bell, BellOff } from 'lucide-react';
import type { RouteWithWaypoints, RouteWaypoint } from '../src/types/routes';
import type { VesselProfile } from './SettingsDialog';
import type { CustomZone } from './ZoneManagerDialog';

export interface SmartAlert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  distance?: number; // nautical miles
  eta?: number; // minutes
  zoneName?: string;
  timestamp: Date;
  acknowledged?: boolean;
  waypointIndex?: number; // Which waypoint triggers this alert
  customColor?: string; // Custom hex color for user-defined zones
}

interface SmartAlertsProps {
  vesselPosition: { lat: number; lng: number };
  vesselSpeed: number; // knots
  vesselCourse: number; // degrees
  activeZones: string[];
  activeRoute?: RouteWithWaypoints | null; // The planned route
  onAcknowledge?: (alertId: string) => void;
  panelVisible?: boolean; // Controlled by parent (Header)
  onAlertCountsChange?: (total: number, critical: number, warning: number) => void;
  vesselProfile?: VesselProfile;
  customZones?: CustomZone[]; // Custom user-defined zones
}

// Zone boundary definitions
const ZONE_BOUNDARIES = {
  'IAATO_RESTRICTED': { lat: 78.1800, lng: 15.4000, radius: 5 / 60 },
  'PROTECTED_AREA_1': { lat: 78.2800, lng: 15.8500, radius: 3 / 60 },
  'PROTECTED_AREA_2': { lat: 78.3200, lng: 15.2000, radius: 4 / 60 },
  'SVALBARD_12NM': { lat: 78.2232, lng: 15.6267, radius: 12 / 60 },
  'EEZ_BOUNDARY': { lat: 78.5000, lng: 16.0000, radius: 25 / 60 },
  'POLAR_CODE_N60': { lat: 60.0, lng: 0, type: 'latitude' as const },
  'POLAR_CODE_S60': { lat: -60.0, lng: 0, type: 'latitude' as const },
};

export function SmartAlerts({ 
  vesselPosition, 
  vesselSpeed, 
  vesselCourse, 
  activeZones, 
  activeRoute,
  onAcknowledge,
  panelVisible,
  onAlertCountsChange,
  vesselProfile,
  customZones
}: SmartAlertsProps) {
  const [alerts, setAlerts] = useState<SmartAlert[]>([]);
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [showPanel, setShowPanel] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Disable auto-alerts on initial load for 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate distance between two points (haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3440; // Earth radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Check if a point is inside a circular zone
  const isInsideZone = (lat: number, lng: number, zone: typeof ZONE_BOUNDARIES[keyof typeof ZONE_BOUNDARIES]): boolean => {
    if ('type' in zone && zone.type === 'latitude') {
      return zone.lat > 0 ? lat >= zone.lat : lat <= zone.lat;
    }
    const dist = calculateDistance(lat, lng, zone.lat, zone.lng);
    return dist <= zone.radius * 60; // Convert to nm
  };

  // Point-in-polygon algorithm (Ray Casting) for custom zones
  const isPointInPolygon = (lat: number, lng: number, polygon: [number, number][]): boolean => {
    if (polygon.length < 3) return false;
    
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][1], yi = polygon[i][0]; // lng, lat
      const xj = polygon[j][1], yj = polygon[j][0];
      
      const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  // Track which custom zones the vessel was inside (for entry/exit detection)
  const [insideZones, setInsideZones] = useState<Set<string>>(new Set());

  // Calculate cumulative distance along route from current position to waypoint
  const calculateRouteDistance = (waypoints: RouteWaypoint[], fromIndex: number): number => {
    let totalDist = 0;
    
    // Distance from vessel to first waypoint ahead
    if (waypoints[fromIndex]) {
      totalDist += calculateDistance(
        vesselPosition.lat, vesselPosition.lng,
        waypoints[fromIndex].lat, waypoints[fromIndex].lon
      );
    }
    
    // Sum leg distances
    for (let i = fromIndex; i < waypoints.length - 1; i++) {
      totalDist += calculateDistance(
        waypoints[i].lat, waypoints[i].lon,
        waypoints[i + 1].lat, waypoints[i + 1].lon
      );
    }
    
    return totalDist;
  };

  // Analyze route for zone intersections
  const analyzeRoute = (route: RouteWithWaypoints) => {
    const newAlerts: SmartAlert[] = [];
    const waypoints = route.waypoints;
    
    if (waypoints.length < 2) return newAlerts;

    // Find closest waypoint ahead
    let closestWaypointIndex = 0;
    let minDist = Infinity;
    
    for (let i = 0; i < waypoints.length; i++) {
      const dist = calculateDistance(
        vesselPosition.lat, vesselPosition.lng,
        waypoints[i].lat, waypoints[i].lon
      );
      if (dist < minDist) {
        minDist = dist;
        closestWaypointIndex = i;
      }
    }

    // Check each leg of the route ahead
    let cumulativeDistance = 0;
    
    for (let i = closestWaypointIndex; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const legDist = i === closestWaypointIndex 
        ? calculateDistance(vesselPosition.lat, vesselPosition.lng, wp.lat, wp.lon)
        : calculateDistance(waypoints[i - 1].lat, waypoints[i - 1].lon, wp.lat, wp.lon);
      
      cumulativeDistance += legDist;
      
      // Only check waypoints within reasonable range (e.g., next 50nm)
      if (cumulativeDistance > 50) break;

      // Check IAATO Restricted
      if (isInsideZone(wp.lat, wp.lon, ZONE_BOUNDARIES.IAATO_RESTRICTED)) {
        const eta = vesselSpeed > 0.5 ? (cumulativeDistance / vesselSpeed * 60).toFixed(0) : null;
        newAlerts.push({
          id: `route-iaato-wp${i}`,
          type: cumulativeDistance < 5 ? 'critical' : 'warning',
          title: 'Route enters IAATO Restricted Zone',
          message: `Waypoint "${wp.name || `WP${i + 1}`}" is inside IAATO restricted area. Landing restrictions apply.`,
          distance: cumulativeDistance,
          eta: eta ? parseInt(eta) : undefined,
          zoneName: 'IAATO Restricted',
          timestamp: new Date(),
          waypointIndex: i,
        });
      }

      // Check Protected Areas
      if (isInsideZone(wp.lat, wp.lon, ZONE_BOUNDARIES.PROTECTED_AREA_1)) {
        const eta = vesselSpeed > 0.5 ? (cumulativeDistance / vesselSpeed * 60).toFixed(0) : null;
        newAlerts.push({
          id: `route-protected1-wp${i}`,
          type: cumulativeDistance < 3 ? 'critical' : 'warning',
          title: 'Route enters Protected Area',
          message: `Waypoint "${wp.name || `WP${i + 1}`}" is in Svalbard Protected Natural Area. No anchoring permitted.`,
          distance: cumulativeDistance,
          eta: eta ? parseInt(eta) : undefined,
          zoneName: 'Protected Area',
          timestamp: new Date(),
          waypointIndex: i,
        });
      }

      // Check if crossing N60
      if (i > 0) {
        const prevWp = waypoints[i - 1];
        const crossesN60 = (prevWp.lat < 60 && wp.lat >= 60) || (prevWp.lat >= 60 && wp.lat < 60);
        
        if (crossesN60) {
          const eta = vesselSpeed > 0.5 ? (cumulativeDistance / vesselSpeed * 60).toFixed(0) : null;
          newAlerts.push({
            id: `route-n60-wp${i}`,
            type: 'info',
            title: 'Route crosses 60°N - Polar Code Area',
            message: `Route crosses IMO Polar Code boundary between WP${i} and WP${i + 1}. Ensure ice navigator on watch.`,
            distance: cumulativeDistance,
            eta: eta ? parseInt(eta) : undefined,
            zoneName: 'IMO N60',
            timestamp: new Date(),
            waypointIndex: i,
          });
        }
      }
    }

    return newAlerts;
  };

  // Generate alerts based on route or position
  useEffect(() => {
    if (!alertsEnabled || isInitialLoad) return;

    const newAlerts: SmartAlert[] = [];

    // ROUTE-BASED ALERTS (Proactive)
    if (activeRoute && activeRoute.waypoints.length > 0) {
      const routeAlerts = analyzeRoute(activeRoute);
      newAlerts.push(...routeAlerts);
      
      // Add route-specific reminders
      newAlerts.push({
        id: 'route-ballast-reminder',
        type: 'info',
        title: 'Pre-Voyage Checklist',
        message: 'Verify ballast water exchange completed before entering Arctic EEZ.',
        timestamp: new Date(),
      });
    }
    // POSITION-BASED ALERTS (Reactive - only if no active route)
    else {
      // Check IAATO proximity
      const distToIAATO = calculateDistance(
        vesselPosition.lat, vesselPosition.lng,
        ZONE_BOUNDARIES.IAATO_RESTRICTED.lat, ZONE_BOUNDARIES.IAATO_RESTRICTED.lng
      );
      
      if (distToIAATO < 5 && distToIAATO > 0.5) {
        const eta = vesselSpeed > 0.5 ? (distToIAATO / vesselSpeed * 60).toFixed(0) : null;
        newAlerts.push({
          id: 'iaato-proximity',
          type: distToIAATO < 2 ? 'critical' : 'warning',
          title: 'Approaching IAATO Restricted Zone',
          message: `You are ${distToIAATO.toFixed(1)} nm from IAATO restricted area. Landing restrictions apply.`,
          distance: distToIAATO,
          eta: eta ? parseInt(eta) : undefined,
          zoneName: 'IAATO Restricted',
          timestamp: new Date(),
        });
      }

      // Check Protected Area
      const distToProtected = calculateDistance(
        vesselPosition.lat, vesselPosition.lng,
        ZONE_BOUNDARIES.PROTECTED_AREA_1.lat, ZONE_BOUNDARIES.PROTECTED_AREA_1.lng
      );
      
      if (distToProtected < 3 && distToProtected > 0.3) {
        const eta = vesselSpeed > 0.5 ? (distToProtected / vesselSpeed * 60).toFixed(0) : null;
        newAlerts.push({
          id: 'protected-proximity',
          type: distToProtected < 1 ? 'critical' : 'warning',
          title: 'Approaching Protected Area',
          message: `${distToProtected.toFixed(1)} nm to Svalbard Protected Natural Area. No anchoring permitted.`,
          distance: distToProtected,
          eta: eta ? parseInt(eta) : undefined,
          zoneName: 'Protected Area',
          timestamp: new Date(),
        });
      }
    }

    // GENERAL ALERTS (Always active)
    
    // Check if vessel is stationary in restricted area - DISABLED: Don't auto-trigger on startup
    // if (vesselSpeed < 0.5 && !activeZones.includes('SAFE_ANCHORAGE')) {
    //   newAlerts.push({
    //     id: 'stationary-warning',
    //     type: 'info',
    //     title: 'Vessel Stationary',
    //     message: 'Vessel speed below 0.5 kts. Verify anchorage is permitted in this area.',
    //     timestamp: new Date(),
    //   });
    // }

    // Speed restriction warning in protected areas
    const distToIAATO2 = calculateDistance(
      vesselPosition.lat, vesselPosition.lng,
      ZONE_BOUNDARIES.IAATO_RESTRICTED.lat, ZONE_BOUNDARIES.IAATO_RESTRICTED.lng
    );
    
    if (vesselSpeed > 6 && distToIAATO2 < 5) {
      newAlerts.push({
        id: 'speed-restriction',
        type: 'warning',
        title: 'Speed Restriction',
        message: 'Reduce speed to 6 knots or less when approaching protected areas.',
        timestamp: new Date(),
      });
    }

    // Polar Code reminder at N60
    if (vesselPosition.lat > 59.5 && vesselPosition.lat < 60.5 && !activeRoute) {
      newAlerts.push({
        id: 'polar-code-n60',
        type: 'info',
        title: 'Polar Code Area Entry',
        message: 'Near 60°N - Polar Code regulations apply. Verify ice navigator on watch.',
        zoneName: 'IMO N60',
        timestamp: new Date(),
      });
    }

    // Environmental reporting reminder - DISABLED: Don't auto-trigger on startup in Svalbard
    // if (vesselPosition.lat > 74 && !activeZones.includes('ENVIRO_REPORTED')) {
    //   newAlerts.push({
    //     id: 'enviro-report',
    //     type: 'info',
    //     title: 'Environmental Reporting',
    //     message: 'Wildlife observation reporting required in Svalbard waters. Log all sightings.',
    //     timestamp: new Date(),
    //   });
    // }

    // CUSTOM ZONE ENTRY/EXIT DETECTION
    if (customZones && customZones.length > 0) {
      const currentlyInside = new Set<string>();
      
      // Check each ACTIVE custom zone
      customZones.filter(z => z.status === 'ACTIVE').forEach(zone => {
        const inside = isPointInPolygon(vesselPosition.lat, vesselPosition.lng, zone.coordinates);
        
        if (inside) {
          currentlyInside.add(zone.id);
          
          // ENTRY: Was not inside before, but is now
          if (!insideZones.has(zone.id) && zone.alerts.onEntry) {
            console.log(`🚢 Vessel entered custom zone: ${zone.name}`);
            
            // Use zone category to determine alert severity
            const alertType = zone.category === 'RESTRICTION' ? 'critical' : 
                             zone.category === 'NOTIFICATION' ? 'warning' : 'info';
            
            newAlerts.push({
              id: `custom-zone-entry-${zone.id}-${Date.now()}`,
              type: alertType,
              title: `Entered: ${zone.name}`,
              message: zone.alerts.message || `You have entered "${zone.name}".`,
              zoneName: zone.name,
              timestamp: new Date(),
              customColor: zone.color,
            });
          }
        } else {
          // EXIT: Was inside before, but not anymore
          if (insideZones.has(zone.id) && zone.alerts.onExit) {
            console.log(`🚢 Vessel exited custom zone: ${zone.name}`);
            
            // Use same severity as entry for exits
            const alertType = zone.category === 'RESTRICTION' ? 'critical' : 
                             zone.category === 'NOTIFICATION' ? 'warning' : 'info';
            
            newAlerts.push({
              id: `custom-zone-exit-${zone.id}-${Date.now()}`,
              type: alertType,
              title: `Exited: ${zone.name}`,
              message: zone.alerts.message ? `Exit: ${zone.alerts.message}` : `You have left "${zone.name}".`,
              zoneName: zone.name,
              timestamp: new Date(),
              customColor: zone.color,
            });
          }
        }
      });
      
      // Update the tracking state
      setInsideZones(currentlyInside);
    }

    // Update alerts (avoid duplicates)
    setAlerts(prev => {
      const existingIds = prev.map(a => a.id);
      const toAdd = newAlerts.filter(a => !existingIds.includes(a.id));
      // Keep existing alerts that are still valid
      const toKeep = prev.filter(a => {
        const stillValid = newAlerts.some(n => n.id === a.id);
        return stillValid || (Date.now() - a.timestamp.getTime() < 300000); // Keep for 5 min
      });
      return [...toKeep, ...toAdd];
    });

  }, [vesselPosition, vesselSpeed, vesselCourse, activeZones, alertsEnabled, activeRoute, customZones]);

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    onAcknowledge?.(alertId);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/50 text-red-400';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/50 text-amber-400';
      default:
        return 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400';
    }
  };

  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged);
  const criticalCount = unacknowledgedAlerts.filter(a => a.type === 'critical').length;
  const warningCount = unacknowledgedAlerts.filter(a => a.type === 'warning').length;

  // Notify parent of alert counts
  useEffect(() => {
    onAlertCountsChange?.(unacknowledgedAlerts.length, criticalCount, warningCount);
  }, [unacknowledgedAlerts.length, criticalCount, warningCount, onAlertCountsChange]);

  // If no alerts, don't render anything
  if (unacknowledgedAlerts.length === 0) {
    return null;
  }

  // If panelVisible is controlled by parent and is false, don't show panel
  if (panelVisible === false) {
    return null;
  }

  return (
    <div className="fixed top-20 right-[420px] z-[25] max-w-md">
      {/* Alert Panel - No badge, controlled by Header */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto">
        {unacknowledgedAlerts.map((alert) => {
          // Use custom color if available, otherwise default to type-based colors
          const customStyle = alert.customColor ? {
            backgroundColor: `${alert.customColor}15`,
            borderColor: `${alert.customColor}80`,
            color: alert.customColor
          } : undefined;
          
          return (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 backdrop-blur-sm animate-in slide-in-from-right duration-300 ${!alert.customColor ? getAlertStyle(alert.type) : ''}`}
              style={customStyle}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getAlertIcon(alert.type)}
                  <div className="font-bold text-sm">{alert.title}</div>
                </div>
                <button
                  onClick={() => handleAcknowledge(alert.id)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-gray-200 mb-2">
                {alert.message}
              </div>

              {(alert.distance || alert.eta) && (
                <div className="flex items-center gap-4 text-[10px] mt-2 pt-2 border-t border-white/10">
                  {alert.distance && (
                    <div>
                      <span className="text-gray-400">Distance:</span>
                      <span className="ml-1 font-mono font-bold">{alert.distance.toFixed(1)} nm</span>
                    </div>
                  )}
                  {alert.eta && (
                    <div>
                      <span className="text-gray-400">ETA:</span>
                      <span className="ml-1 font-mono font-bold">~{alert.eta} min</span>
                    </div>
                  )}
                </div>
              )}

              {alert.zoneName && (
                <div className="text-[10px] text-gray-400 mt-1">
                  Zone: {alert.zoneName}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}