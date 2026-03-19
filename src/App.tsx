import navigenLogo from './assets/navigen-logo.png';
import React from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { ModuleBar } from './components/ModuleBar';
import { MapCanvas } from './components/MapCanvas';
import { CompliancePanel } from './components/CompliancePanel';
import { SettingsDialog, VesselProfile } from './components/SettingsDialog';
import { ExplanationDrawer } from './components/ExplanationDrawer';
import { ZoneManagerDialog } from './components/ZoneManagerDialog';
import { ZoneDrawingOverlay } from './components/ZoneDrawingOverlay';
import { ZoneDetailsDialog } from './components/ZoneDetailsDialog';
import type { CustomZone, LatLng } from './components/ZoneManagerDialog';
import { SimulatorConfigPanel } from './components/SimulatorConfigPanel';
import { AISPanel } from './components/AISPanel';
import { SmartAlerts } from './components/SmartAlerts';
import { CommsModule } from './components/CommsModule';
import RulesModule from './modules/RulesModule';
import VoyageModuleV2 from './modules/VoyageModuleV2';
import MARSECModule from './modules/MARSECModule';
import NAVModule from './modules/NAVModule';
import type { GPSSource, SimulationConfig } from './components/GPSSourceSelectorDropdown';
import type { DisplayMode } from './components/DayNightModeSelectorDropdown';
import type { PlannedOp } from './types/plannedOps';
import type { RouteWithWaypoints } from './types/routes';
import { evaluateCompliance } from './lib/complianceEngine';
import { ruleCards, RULECARD_REGISTRY } from './data/ruleCards';
import { getActiveAreaIds, REGULATORY_POLYGONS } from './data/geoTriggers';
import { getProtectedAreas } from './lib/authService';
import { generateZoneCrossingPoints } from './lib/zoneCrossingEngine';
import { detectGreenlandProtectedRouteHits } from './lib/greenlandProtectedRoute';
import type { ZoneActivityEvent } from './lib/compliance/zoneActivityLogger';

type CrossingArea = {
  area_id: string;
  name: string;
  geometry: any;
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);
  const [currentUser, setCurrentUser] = React.useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(false);

  const [vesselPosition, setVesselPosition] = React.useState({ lat: 78.2232, lng: 15.6267 });
  const [vesselHeading, setVesselHeading] = React.useState(42);
  const [vesselSpeed, setVesselSpeed] = React.useState(8.5);
  const [vesselCourse, setVesselCourse] = React.useState(42);

  const [vesselProfile, setVesselProfile] = React.useState<VesselProfile>({
    vesselType: 'cruise',
    polarClass: 'PC6',
    iceClass: '1A',
    flagState: 'Norway',
    grossTonnage: 5000,
  });

  const [gpsSource, setGpsSource] = React.useState<GPSSource>('static');
  const [simulationConfig, setSimulationConfig] = React.useState<SimulationConfig>({
    lat: 78.2232,
    lng: 15.6267,
    speed: 8.5,
    course: 42,
  });
  const [showSimulatorPanel, setShowSimulatorPanel] = React.useState(false);

  const [offlineMode, setOfflineMode] = React.useState(false);
  const [displayMode, setDisplayMode] = React.useState<DisplayMode>('day');
  const [cursorBoxVisible, setCursorBoxVisible] = React.useState(true);

  const [activeModule, setActiveModule] = React.useState<string | null>(null);

  const [aisPanelVisible, setAisPanelVisible] = React.useState(false);
  const [aisEnabled, setAisEnabled] = React.useState(true);

  const [alertsPanelVisible, setAlertsPanelVisible] = React.useState(true);
  const [alertCount, setAlertCount] = React.useState(0);
  const [criticalAlertCount, setCriticalAlertCount] = React.useState(0);
  const [warningAlertCount, setWarningAlertCount] = React.useState(0);

  const [coursePredictorVisible, setCoursePredictorVisible] = React.useState(false);
  const [coursePredictorMinutes, setCoursePredictorMinutes] = React.useState(6);

  const [setDriftVisible, setSetDriftVisible] = React.useState(false);

  const [activeZones, setActiveZones] = React.useState<string[]>(['SVALBARD']);

  const [activeActivity, setActiveActivity] = React.useState('AT ANCHOR');

  const [polarCode, setPolarCode] = React.useState('CAT_C');

  const [plannedOps, setPlannedOps] = React.useState<PlannedOp[]>([]);

  const [iaato, setIaato] = React.useState(true);

  const [selectedProtectedArea, setSelectedProtectedArea] = React.useState<string | null>(null);

  const [activeRouteId, setActiveRouteId] = React.useState<string | null>(null);
  const [activeRoute, setActiveRoute] = React.useState<RouteWithWaypoints | null>(null);

  const [protectedAreas, setProtectedAreas] = React.useState<CrossingArea[]>([]);
  const [zoneActivityLog, setZoneActivityLog] = React.useState<ZoneActivityEvent[]>([]);

  const [arcticPolarVisible, setArcticPolarVisible] = React.useState(true);
  const [antarcticPolarVisible, setAntarcticPolarVisible] = React.useState(true);
  const [openSeaMapLayer, setOpenSeaMapLayer] = React.useState(true);
  const [fiskeridirLayer, setFiskeridirLayer] = React.useState(false);
  const [tssLayer, setTssLayer] = React.useState(false);
  const [weatherLayer, setWeatherLayer] =
    React.useState<'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature'>('none');
  const [basemapType, setBasemapType] = React.useState<'ocean' | 'geographic'>('ocean');
  const [debugBordersVisible, setDebugBordersVisible] = React.useState(() => {
    const saved = localStorage.getItem('navigen_debugBordersVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [regLayers, setRegLayers] = React.useState({
    enabled: true,
    bordersEnabled: true,
    regulatoryZonesEnabled: true,

    baseline: false,
    territorialWaters12nm: true,
    contiguousZone24nm: false,
    eez200nm: false,

    imoN60: true,
    imoS60: false,

    svalbard12nm: true,
    svalbardProtectedAreas: false,

    greenlandExpanded: false,
    greenlandSermersooq: false,
    greenlandProtectedAreas: false,
    greenlandLocalRestrictions: false,

    marpolAreas: false,
    solasZones: false,

    debugBorders: true,
  });

  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [explanationOpen, setExplanationOpen] = React.useState(false);
  const [zoneManagerOpen, setZoneManagerOpen] = React.useState(false);

  const [isDrawingZone, setIsDrawingZone] = React.useState(false);
  const [drawingPoints, setDrawingPoints] = React.useState<LatLng[]>([]);
  const [showZoneDetailsDialog, setShowZoneDetailsDialog] = React.useState(false);
  const [customZones, setCustomZones] = React.useState<CustomZone[]>([]);
  const [alertsInitialized, setAlertsInitialized] = React.useState(false);

  const [selectedRulecardId, setSelectedRulecardId] = React.useState<string | null>(null);
  const rule = selectedRulecardId ? RULECARD_REGISTRY[selectedRulecardId] : null;

  const handleLogin = (shipData: any) => {
    setCurrentUser(shipData);
    setIsLoggedIn(true);
  };

  React.useEffect(() => {
    const loadProtectedAreas = async () => {
      try {
        const data = await getProtectedAreas();
        console.log('🧭 RAW protected areas from Supabase:', data);
        if (Array.isArray(data)) {
          setProtectedAreas(data as CrossingArea[]);
          console.log(`🗺️ Loaded protected areas for Zone Crossing Engine: ${data.length}`);
        } else {
          console.warn('⚠️ getProtectedAreas() did not return an array');
          setProtectedAreas([]);
        }
      } catch (error) {
        console.error('❌ Failed to load protected areas for Zone Crossing Engine:', error);
        setProtectedAreas([]);
      }
    };

    loadProtectedAreas();
  }, []);

  const regulatoryCrossingAreas = React.useMemo<CrossingArea[]>(() => {
    const shouldIncludePolygon = (polygonId: string): boolean => {
      if (!regLayers.enabled) return false;

      if (polygonId === 'TERRITORIAL_12NM' && regLayers.bordersEnabled && regLayers.territorialWaters12nm) return true;
      if (polygonId === 'CONTIGUOUS_24NM' && regLayers.bordersEnabled && regLayers.contiguousZone24nm) return true;
      if (polygonId === 'EEZ_200NM' && regLayers.bordersEnabled && regLayers.eez200nm) return true;

      if (polygonId === 'IMO_N60_POLYGON' && regLayers.regulatoryZonesEnabled && regLayers.imoN60) return true;
      if (polygonId === 'IMO_S60_POLYGON' && regLayers.regulatoryZonesEnabled && regLayers.imoS60) return true;

      if (
        (polygonId === 'BJORNOYA_12NM_POLYGON' || polygonId === 'SPITSBERGEN_12NM_POLYGON') &&
        regLayers.regulatoryZonesEnabled &&
        regLayers.svalbard12nm
      ) {
        return true;
      }

      if (
        polygonId.includes('GREENLAND') &&
        regLayers.regulatoryZonesEnabled &&
        regLayers.greenlandProtectedAreas
      ) return true;

      if (
        polygonId.startsWith('PROTECTED_') &&
        regLayers.regulatoryZonesEnabled &&
        regLayers.svalbardProtectedAreas
      ) return true;

      if (
        polygonId.includes('MARPOL') &&
        regLayers.regulatoryZonesEnabled &&
        regLayers.marpolAreas
      ) return true;

      if (
        polygonId.includes('SOLAS') &&
        regLayers.regulatoryZonesEnabled &&
        regLayers.solasZones
      ) return true;

      return false;
    };

    const mapped = REGULATORY_POLYGONS
      .filter((polygon) => shouldIncludePolygon(polygon.id))
      .map((polygon) => ({
        area_id: polygon.areaId,
        name: polygon.name,
        geometry: {
          type: 'Polygon',
          coordinates: [
            polygon.coordinates.map(([lat, lng]) => [lng, lat]),
          ],
        },
      }));

    console.log('🧭 Regulatory crossing areas:', mapped.length);
    console.log('🧭 Regulatory crossing sample:', mapped[0]);

    return mapped;
  }, [regLayers]);

  const crossingAreas = React.useMemo<CrossingArea[]>(() => {
    const merged = [...regulatoryCrossingAreas, ...protectedAreas];

    console.log('🧭 crossingAreas total:', merged.length);
    console.log('🧭 protectedAreas count:', protectedAreas.length);
    console.log('🧭 regulatoryCrossingAreas count:', regulatoryCrossingAreas.length);

    return merged;
  }, [regulatoryCrossingAreas, protectedAreas]);

  const [greenlandProtectedGeoJson, setGreenlandProtectedGeoJson] = React.useState<any>(null);

  const greenlandProtectedHits = React.useMemo(() => {
    const hits = detectGreenlandProtectedRouteHits(
      activeRoute,
      greenlandProtectedGeoJson
    );

    console.log('🟥 Greenland protected hits:', hits);

    return hits;
  }, [activeRoute, greenlandProtectedGeoJson]);

  const zoneCrossingPoints = React.useMemo(() => {
    console.log('🧭 ZCP DEBUG - activeRoute:', activeRoute);
    console.log('🧭 ZCP DEBUG - crossingAreas count:', crossingAreas.length);

    if (!activeRoute || !crossingAreas.length) {
      console.log('🧭 ZCP DEBUG - skipped: missing activeRoute or crossingAreas');
      return [];
    }

    try {
      const result = generateZoneCrossingPoints(activeRoute, crossingAreas);
      console.log('🧭 ZCP DEBUG - generated crossings:', result);
      return result;
    } catch (error) {
      console.error('❌ Error generating Zone Crossing Points:', error);
      return [];
    }
  }, [activeRoute, crossingAreas]);

  React.useEffect(() => {
    if (activeRoute) {
      console.log('🧭 ACTIVE ROUTE WAYPOINT SAMPLE:', activeRoute.waypoints?.slice(0, 3));
    }
  }, [activeRoute]);

  React.useEffect(() => {
    if (zoneCrossingPoints.length > 0) {
      console.log('🟣 Zone Crossing Points generated:', zoneCrossingPoints);
    } else {
      console.log('🟡 ZCP DEBUG - no crossings generated');
    }
  }, [zoneCrossingPoints]);

  React.useEffect(() => {
    const saved = localStorage.getItem('navigen_custom_zones');
    if (saved) {
      try {
        setCustomZones(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load custom zones:', e);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!alertsInitialized) {
      customZones.forEach((zone) => {
        if (zone.status === 'ACTIVE' && (zone.alerts.onEntry || zone.alerts.onExit)) {
          const isInside = isPointInPolygon([vesselPosition.lat, vesselPosition.lng], zone.coordinates);
          const wasInsideKey = `wasInside_${zone.id}`;
          sessionStorage.setItem(wasInsideKey, isInside.toString());
        }
      });
      setAlertsInitialized(true);
      return;
    }

    customZones.forEach((zone) => {
      if (zone.status === 'ACTIVE' && (zone.alerts.onEntry || zone.alerts.onExit)) {
        const isInside = isPointInPolygon([vesselPosition.lat, vesselPosition.lng], zone.coordinates);
        const wasInsideKey = `wasInside_${zone.id}`;
        const wasInside = sessionStorage.getItem(wasInsideKey) === 'true';

        if (isInside && !wasInside && zone.alerts.onEntry) {
          console.log(`🟢 ENTERED CUSTOM ZONE: ${zone.name} - ${zone.alerts.message}`);
        } else if (!isInside && wasInside && zone.alerts.onExit) {
          console.log(`🔴 EXITED CUSTOM ZONE: ${zone.name} - ${zone.alerts.message}`);
        }

        sessionStorage.setItem(wasInsideKey, isInside.toString());
      }
    });
  }, [vesselPosition, customZones, alertsInitialized]);

  const isPointInPolygon = (point: LatLng, polygon: LatLng[]): boolean => {
    const [lat, lng] = point;
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const [latI, lngI] = polygon[i];
      const [latJ, lngJ] = polygon[j];

      const intersect =
        (lngI > lng) !== (lngJ > lng) &&
        lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI;

      if (intersect) inside = !inside;
    }

    return inside;
  };

  const handleStartDrawing = () => {
    setZoneManagerOpen(false);
    setIsDrawingZone(true);
    setDrawingPoints([]);
  };

  const handleAddPoint = (point: LatLng) => {
    setDrawingPoints([...drawingPoints, point]);
  };

  const handleRemoveLastPoint = () => {
    setDrawingPoints(drawingPoints.slice(0, -1));
  };

  const handleRemovePoint = (index: number) => {
    setDrawingPoints(drawingPoints.filter((_, i) => i !== index));
  };

  const handleCompleteDrawing = () => {
    console.log('🎯 handleCompleteDrawing called');
    console.log('   Drawing points:', drawingPoints.length);
    console.log('   Points:', drawingPoints);

    if (drawingPoints.length >= 3) {
      console.log('✅ Valid polygon (>= 3 points)');
      setIsDrawingZone(false);
      setShowZoneDetailsDialog(true);
      console.log('   State updated: isDrawingZone=false, showZoneDetailsDialog=true');
    } else {
      console.log('❌ Not enough points:', drawingPoints.length);
    }
  };

  const handleCancelDrawing = () => {
    setIsDrawingZone(false);
    setDrawingPoints([]);
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawingZone) {
        handleCancelDrawing();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawingZone]);

  const handleSaveZone = (zone: Omit<CustomZone, 'id'>) => {
    console.log('💾 handleSaveZone called with:', zone);

    const newZone: CustomZone = {
      ...zone,
      id: `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    console.log('💾 Generated zone with ID:', newZone);

    const updatedZones = [...customZones, newZone];
    setCustomZones(updatedZones);
    localStorage.setItem('navigen_custom_zones', JSON.stringify(updatedZones));

    console.log('✅ Zone saved successfully! Total zones:', updatedZones.length);

    setShowZoneDetailsDialog(false);
    setDrawingPoints([]);
  };

  const handleDeleteZone = (zoneId: string) => {
    console.log('🗑️ Deleting zone:', zoneId);
    const updatedZones = customZones.filter((z) => z.id !== zoneId);
    setCustomZones(updatedZones);
    localStorage.setItem('navigen_custom_zones', JSON.stringify(updatedZones));
    console.log('✅ Zone deleted! Remaining zones:', updatedZones.length);
  };

  const handleUpdateZone = (updatedZone: CustomZone) => {
    console.log('✏️ Updating zone:', updatedZone.id);
    const updatedZones = customZones.map((z) => (z.id === updatedZone.id ? updatedZone : z));
    setCustomZones(updatedZones);
    localStorage.setItem('navigen_custom_zones', JSON.stringify(updatedZones));
    console.log('✅ Zone updated!');
  };

  const handleCancelZoneDetails = () => {
    setShowZoneDetailsDialog(false);
    setDrawingPoints([]);
  };

  React.useEffect(() => {
    localStorage.setItem('navigen_debugBordersVisible', JSON.stringify(debugBordersVisible));
  }, [debugBordersVisible]);

  const complianceResult = React.useMemo(() => {
    try {
      return evaluateCompliance({
        vessel: {
          lat: vesselPosition.lat,
          lng: vesselPosition.lng,
          activity: activeActivity,
          speed: vesselSpeed,
          heading: vesselHeading,
        },
        ruleCards,
        activeZones,
      });
    } catch (error) {
      console.error('Error evaluating compliance:', error);
      return { activeRules: [], reasons: [] };
    }
  }, [vesselPosition, activeActivity, vesselSpeed, vesselHeading, activeZones]);

  const activeGeoRules = complianceResult.activeRules;

  React.useEffect(() => {
    if (gpsSource === 'simulation') {
      setVesselPosition({ lat: simulationConfig.lat, lng: simulationConfig.lng });
      setVesselHeading(simulationConfig.course);
      setVesselSpeed(simulationConfig.speed);
      setVesselCourse(simulationConfig.course);

      const interval = setInterval(() => {
        setVesselPosition((prev) => {
          const distanceKm = (simulationConfig.speed * 1.852) / 3600;
          const earthRadius = 6371;

          const lat1 = (prev.lat * Math.PI) / 180;
          const lng1 = (prev.lng * Math.PI) / 180;
          const bearing = (simulationConfig.course * Math.PI) / 180;

          const lat2 = Math.asin(
            Math.sin(lat1) * Math.cos(distanceKm / earthRadius) +
              Math.cos(lat1) * Math.sin(distanceKm / earthRadius) * Math.cos(bearing)
          );

          const lng2 =
            lng1 +
            Math.atan2(
              Math.sin(bearing) * Math.sin(distanceKm / earthRadius) * Math.cos(lat1),
              Math.cos(distanceKm / earthRadius) - Math.sin(lat1) * Math.sin(lat2)
            );

          return {
            lat: (lat2 * 180) / Math.PI,
            lng: (lng2 * 180) / Math.PI,
          };
        });
      }, 1000);

      return () => clearInterval(interval);
    } else if (gpsSource === 'device') {
      console.log('📍 Activating DEVICE GPS via browser Geolocation API');

      if (!navigator.geolocation) {
        console.error('❌ Geolocation not supported by browser');
        alert('GPS not supported by your browser');
        setGpsSource('static');
        return;
      }

      let watchId: number | null = null;

      const tryIPGeolocation = async () => {
        console.log('🌐 Trying IP-based geolocation as fallback...');
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();

          if (data.latitude && data.longitude) {
            console.log('✅ IP Geolocation success:', data.city, data.country_name);
            console.log('   Position:', data.latitude, data.longitude);
            console.log('   Accuracy: ~', data.city ? '10-50km (city level)' : '50-200km (country level)');

            setVesselPosition({
              lat: data.latitude,
              lng: data.longitude,
            });
            setVesselSpeed(0);

            alert(
              `📍 Using IP-based location:\n${data.city}, ${data.country_name}\n\nAccuracy: ~${data.city ? '10-50km' : '50-200km'}\n\nNote: This works well with Starlink Maritime!\n\n✅ For GPS precision:\n• Enable location permissions (DEVICE GPS)\n• Use NMEA (WiFi WS) from ship's GPS\n• Or use SIMULATION mode`
            );
          } else {
            throw new Error('No location data in response');
          }
        } catch (error) {
          console.error('❌ IP Geolocation failed:', error);
          alert('Could not determine location via IP. Switching to STATIC mode.\n\nTip: Use SIMULATION mode to manually set your position.');
          setGpsSource('static');
        }
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('✅ Device GPS position:', position.coords.latitude, position.coords.longitude);
          console.log('   Accuracy:', position.coords.accuracy, 'meters');
          console.log('   Method: GPS + WiFi + IP (browser Geolocation API)');

          setVesselPosition({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setVesselHeading(position.coords.heading || 0);
          setVesselSpeed(position.coords.speed ? position.coords.speed * 1.94384 : 0);
          setVesselCourse(position.coords.heading || 0);

          console.log('🔄 Starting GPS watch...');
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              console.log('📍 GPS update:', position.coords.latitude, position.coords.longitude);
              setVesselPosition({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
              if (position.coords.heading !== null) {
                setVesselHeading(position.coords.heading);
                setVesselCourse(position.coords.heading);
              }
              if (position.coords.speed !== null) {
                setVesselSpeed(position.coords.speed * 1.94384);
              }
            },
            (error) => {
              console.error('❌ GPS Watch Error:', error);
              console.error('GPS Watch Error details:', {
                code: error.code,
                message: error.message,
              });

              if (error.code === error.PERMISSION_DENIED) {
                alert('Location permission was revoked. Switching to static mode.');
                setGpsSource('static');
              }
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            }
          );
        },
        (error) => {
          let errorMessage = 'Unknown GPS error';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              console.log('⚠️ GPS Permission Denied - Trying IP-based geolocation fallback...');
              tryIPGeolocation();
              return;
            case error.POSITION_UNAVAILABLE:
              console.log('⚠️ GPS Unavailable - Trying IP-based geolocation fallback...');
              tryIPGeolocation();
              return;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = error.message || 'Failed to get GPS location';
          }

          console.error(
            '❌ GPS Error:',
            JSON.stringify({
              code: error.code,
              message: error.message,
              name: error.name,
            })
          );

          alert(`GPS Error: ${errorMessage}`);
          setGpsSource('static');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => {
        console.log('🛑 Stopping GPS watch');
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
        }
      };
    } else if (gpsSource === 'static') {
      setVesselPosition({ lat: simulationConfig.lat, lng: simulationConfig.lng });
      setVesselHeading(simulationConfig.course);
      setVesselSpeed(simulationConfig.speed);
      setVesselCourse(simulationConfig.course);
    }
  }, [gpsSource, simulationConfig]);

  React.useEffect(() => {
    console.log('⚓ NAVIGEN Maritime Compliance Platform');
    console.log('   Version: 2.0 | Database: Supabase ✅');
    console.log('   Position: Longyearbyen, Svalbard (78.22°N, 15.63°E)');
    console.log('');
    console.log('📚 Optional Features:');
    console.log('   • Protected Areas: See /QUICKSTART_PROTECTED_AREAS.md');
    console.log('   • Authentication: Currently bypassed for development');
    console.log('');
  }, []);

  React.useEffect(() => {
    const fetchProtected = async () => {
      try {
        const res = await fetch(
          'https://services-eu1.arcgis.com/0uK40YtWoUkQMlYW/ArcGIS/rest/services/Protected_Areas_of_Greenland_DisplayLayer/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson'
        );

        const data = await res.json();

        console.log('🟥 App: Greenland protected loaded', data?.features?.length);

        setGreenlandProtectedGeoJson(data);
      } catch (err) {
        console.error('❌ App fetch failed', err);
      }
    };

    fetchProtected();
  }, []);

  const prevAreasRef = React.useRef<string[]>([]);

  React.useEffect(() => {
    const areas = getActiveAreaIds(vesselPosition);
    const prev = prevAreasRef.current;

    const entered = areas.filter((a) => !prev.includes(a));
    const exited = prev.filter((a) => !areas.includes(a));

    if (entered.length) {
      console.log('🟢 ENTERED:', entered);
    }

    if (exited.length) {
      console.log('🔴 EXITED:', exited);
    }

    const now = new Date();
    const zoneEvents: ZoneActivityEvent[] = [
      ...entered.map((areaId) => ({
        id: `${areaId}-ENTRY-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        areaId,
        eventType: 'ENTRY' as const,
        timestampUtc: now.toISOString(),
        lat: vesselPosition.lat,
        lng: vesselPosition.lng,
      })),
      ...exited.map((areaId) => ({
        id: `${areaId}-EXIT-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        areaId,
        eventType: 'EXIT' as const,
        timestampUtc: now.toISOString(),
        lat: vesselPosition.lat,
        lng: vesselPosition.lng,
      })),
    ];

    if (zoneEvents.length > 0) {
      console.log('🧭 APP ZONE ACTIVITY EVENTS:', zoneEvents);
      setZoneActivityLog((prevLog) => [...zoneEvents, ...prevLog].slice(0, 500));
    }

    console.log('📍 VESSEL POSITION:', vesselPosition, '| DETECTED AREAS:', areas);

    prevAreasRef.current = areas;

    const mapToRulesetZones = (geoAreas: string[]): string[] => {
      const rulesetZones = new Set<string>();

      for (const area of geoAreas) {
        if (area.includes('SVALBARD') || area.includes('LONGYEARBYEN')) {
          rulesetZones.add('SVALBARD');
        } else if (area.includes('TERRITORIAL') || area.includes('PORT')) {
          rulesetZones.add('PORT');
        } else if (area.includes('EXPEDITION') || area.includes('IAATO')) {
          rulesetZones.add('EXPEDITION');
        }

        if (area.includes('NORWAY_12NM') || area.includes('NORWAY_EEZ')) {
          rulesetZones.add('COASTAL');
        }

        if (area.includes('IMO_N60') || area.includes('POLAR')) {
          rulesetZones.add('HIGH SEAS');
        }
      }

      if (rulesetZones.size === 0) {
        rulesetZones.add('HIGH SEAS');
      }

      return Array.from(rulesetZones);
    };

    setActiveZones(mapToRulesetZones(areas.length > 0 ? areas : ['OPEN_OCEAN']));
  }, [vesselPosition]);

  React.useEffect(() => {
    if (zoneActivityLog.length > 0) {
      console.log('🧭 Latest app zone activity event:', zoneActivityLog[0]);
      console.log('🧭 Full app zone activity log:', zoneActivityLog);
    }
  }, [zoneActivityLog]);

  const detectedAreas = getActiveAreaIds(vesselPosition);

  const handleProtectedAreaClick = (areaId: string) => {
    console.log('🗺️ Protected area clicked:', areaId);
    setSelectedProtectedArea(areaId);
    setActiveModule('RULES');
  };

  const handleRulecardSelect = React.useCallback((id: string | null) => {
    setSelectedRulecardId((prev) => (prev === id ? null : id));
  }, []);

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-slate-800 to-slate-900">
        <div className="text-white text-xl">Loading NAVIGEN...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="w-full h-screen bg-slate-900 text-white overflow-hidden relative">
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        offlineMode={offlineMode}
        activeZone={activeZones.join(' + ')}
        activeActivity={activeActivity}
        activePolarCode={polarCode}
        vesselPosition={vesselPosition}
        isLiveGPS={gpsSource === 'device' || gpsSource === 'nmea'}
        gpsSource={gpsSource}
        onGpsSourceChange={setGpsSource}
        simulationConfig={simulationConfig}
        onSimulationConfigChange={setSimulationConfig}
        detectedAreas={detectedAreas}
        alertCount={alertCount}
        criticalAlertCount={criticalAlertCount}
        warningAlertCount={warningAlertCount}
        onToggleAlerts={() => setAlertsPanelVisible(!alertsPanelVisible)}
        alertsPanelVisible={alertsPanelVisible}
        aisEnabled={aisEnabled}
        onToggleAIS={() => setAisEnabled(!aisEnabled)}
      />

      <ModuleBar
        activeModule={activeModule}
        onModuleChange={setActiveModule}
        regLayers={regLayers}
        onRegLayersChange={setRegLayers}
        openSeaMapLayer={openSeaMapLayer}
        onOpenSeaMapLayerChange={setOpenSeaMapLayer}
        fiskeridirLayer={fiskeridirLayer}
        onFiskeridirLayerChange={setFiskeridirLayer}
        tssLayer={tssLayer}
        onTssLayerChange={setTssLayer}
        basemapType={basemapType}
        onBasemapTypeChange={setBasemapType}
        gpsSource={gpsSource}
        onGpsSourceChange={setGpsSource}
        simulationConfig={simulationConfig}
        onSimulationConfigChange={setSimulationConfig}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        cursorBoxVisible={cursorBoxVisible}
        onCursorBoxVisibleChange={setCursorBoxVisible}
        coursePredictorVisible={coursePredictorVisible}
        onCoursePredictorVisibleChange={setCoursePredictorVisible}
        coursePredictorMinutes={coursePredictorMinutes}
        onCoursePredictorMinutesChange={setCoursePredictorMinutes}
        setDriftVisible={setDriftVisible}
        onSetDriftVisibleChange={setSetDriftVisible}
        activeZones={activeZones}
        onActiveZonesChange={setActiveZones}
        onManageZones={() => setZoneManagerOpen(true)}
        activeActivity={activeActivity}
        onActiveActivityChange={setActiveActivity}
        plannedOps={plannedOps}
        onPlannedOpsChange={setPlannedOps}
        aisPanelVisible={aisPanelVisible}
        onToggleAIS={() => setAisPanelVisible(!aisPanelVisible)}
      />

      <div className="fixed top-4 left-20 z-40 pointer-events-none">
        <img src={navigenLogo} alt="NAVIGEN" className="h-12 w-auto object-contain drop-shadow-lg" />
      </div>

      {activeModule === 'RULES' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <RulesModule
            zone={activeZones.join(' + ')}
            activity={activeActivity}
            polarCode={polarCode}
            onPolarCodeChange={setPolarCode}
            onClose={() => setActiveModule(null)}
            plannedOps={plannedOps}
            selectedProtectedArea={selectedProtectedArea}
            onSelectedProtectedAreaChange={setSelectedProtectedArea}
            activeModule={activeModule}
            onSwitchModule={setActiveModule}
            vesselProfile={vesselProfile}
          />
        </div>
      )}

      {activeModule === 'VOYAGE' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <VoyageModuleV2
            onClose={() => setActiveModule(null)}
            activeZones={activeZones}
            onActiveZonesChange={setActiveZones}
            onManageZones={() => setZoneManagerOpen(true)}
            activeActivity={activeActivity}
            onActiveActivityChange={setActiveActivity}
            plannedOps={plannedOps}
            onPlannedOpsChange={setPlannedOps}
            vesselPosition={vesselPosition}
            onRouteSelected={(route) => {
              setActiveRouteId(route.id);
              setActiveRoute(route);
            }}
          />
        </div>
      )}

      {activeModule === 'COMMS' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <CommsModule
            onClose={() => setActiveModule(null)}
            vesselPosition={vesselPosition}
            activeModule={activeModule}
            onSwitchModule={setActiveModule}
            vesselSpeed={vesselSpeed}
            vesselCourse={vesselCourse}
          />
        </div>
      )}

      {activeModule === 'MARSEC' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <MARSECModule onClose={() => setActiveModule(null)} activeModule={activeModule} onSwitchModule={setActiveModule} />
        </div>
      )}

      {activeModule === 'NAV' && (
        <div className="fixed inset-0 z-50 bg-slate-900">
          <NAVModule
            onClose={() => setActiveModule(null)}
            arcticPolarVisible={arcticPolarVisible}
            onArcticPolarVisibleChange={setArcticPolarVisible}
            antarcticPolarVisible={antarcticPolarVisible}
            onAntarcticPolarVisibleChange={setAntarcticPolarVisible}
            openSeaMapLayer={openSeaMapLayer}
            onOpenSeaMapLayerChange={setOpenSeaMapLayer}
            fiskeridirLayer={fiskeridirLayer}
            onFiskeridirLayerChange={setFiskeridirLayer}
            tssLayer={tssLayer}
            onTssLayerChange={setTssLayer}
            gpsSource={gpsSource}
            onGpsSourceChange={setGpsSource}
            simulationConfig={simulationConfig}
            onSimulationConfigChange={setSimulationConfig}
            displayMode={displayMode}
            onDisplayModeChange={setDisplayMode}
            cursorBoxVisible={cursorBoxVisible}
            onCursorBoxVisibleChange={setCursorBoxVisible}
            coursePredictorVisible={coursePredictorVisible}
            onCoursePredictorVisibleChange={setCoursePredictorVisible}
            coursePredictorMinutes={coursePredictorMinutes}
            onCoursePredictorMinutesChange={setCoursePredictorMinutes}
            setDriftVisible={setDriftVisible}
            onSetDriftVisibleChange={setSetDriftVisible}
          />
        </div>
      )}

      <MapCanvas
        zone={activeZones.join(' + ')}
        arcticPolarVisible={arcticPolarVisible}
        antarcticPolarVisible={antarcticPolarVisible}
        openSeaMapLayer={openSeaMapLayer}
        fiskeridirLayer={fiskeridirLayer}
        tssLayer={tssLayer}
        weatherLayer={weatherLayer}
        basemapType={basemapType}
        vesselPosition={vesselPosition}
        vesselHeading={vesselHeading}
        isLiveData={gpsSource === 'device' || gpsSource === 'nmea' || gpsSource === 'simulation'}
        vesselSpeed={vesselSpeed}
        vesselCourse={vesselCourse}
        cursorBoxVisible={cursorBoxVisible}
        displayMode={displayMode}
        coursePredictorVisible={coursePredictorVisible}
        coursePredictorMinutes={coursePredictorMinutes}
        setDriftVisible={setDriftVisible}
        activeRouteId={activeRouteId}
        activeRoute={activeRoute}
        debugBordersVisible={debugBordersVisible}
        regLayers={regLayers}
        onProtectedAreaClick={handleProtectedAreaClick}
        isDrawingZone={isDrawingZone}
        onMapClick={(lat, lng) => handleAddPoint([lat, lng])}
        onRulecardSelect={handleRulecardSelect}
        drawingPoints={drawingPoints}
        customZones={customZones}
        aisEnabled={aisEnabled}
        zoneCrossingPoints={zoneCrossingPoints}
      />

      {rule && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            background: '#111',
            color: '#0ff',
            padding: 12,
            borderRadius: 8,
            zIndex: 9999,
            maxWidth: 360,
            boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontWeight: 700 }}>
              {rule.ui?.title ?? rule.id}
            </div>
            <button
              onClick={() => setSelectedRulecardId(null)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#0ff',
                cursor: 'pointer',
                fontSize: 16,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginTop: 8 }}>
            {rule.statement}
          </div>

          {rule.content?.rationale && (
            <div style={{ marginTop: 8, opacity: 0.85, fontSize: 13 }}>
              {rule.content.rationale}
            </div>
          )}

          <div style={{ marginTop: 8, opacity: 0.75, fontSize: 12 }}>
            Authority: {rule.authority?.instrument ?? '—'}
          </div>

          <div style={{ marginTop: 4, opacity: 0.75, fontSize: 12 }}>
            Severity: {rule.severity}
          </div>
        </div>
      )}

      <CompliancePanel
        activeZone={activeZones.join(' + ') || 'OPEN WATER'}
        activeActivity={activeActivity}
        activePolarCode={polarCode}
        detectedAreas={detectedAreas}
        vesselPosition={vesselPosition}
        activeRoute={activeRoute}
      />

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        offlineMode={offlineMode}
        onOfflineModeChange={setOfflineMode}
        displayMode={displayMode}
        onDisplayModeChange={setDisplayMode}
        cursorBoxVisible={cursorBoxVisible}
        onCursorBoxVisibleChange={setCursorBoxVisible}
        openSeaMapLayer={openSeaMapLayer}
        onOpenSeaMapLayerChange={setOpenSeaMapLayer}
        fiskeridirLayer={fiskeridirLayer}
        onFiskeridirLayerChange={setFiskeridirLayer}
        tssLayer={tssLayer}
        onTssLayerChange={setTssLayer}
        weatherLayer={weatherLayer}
        onWeatherLayerChange={setWeatherLayer}
        basemapType={basemapType}
        onBasemapTypeChange={setBasemapType}
        coursePredictorVisible={coursePredictorVisible}
        onCoursePredictorVisibleChange={setCoursePredictorVisible}
        coursePredictorMinutes={coursePredictorMinutes}
        onCoursePredictorMinutesChange={setCoursePredictorMinutes}
        setDriftVisible={setDriftVisible}
        onSetDriftVisibleChange={setSetDriftVisible}
        iaato={iaato}
        onIaatoChange={setIaato}
        vesselProfile={vesselProfile}
        onVesselProfileChange={setVesselProfile}
      />

      <ExplanationDrawer
        open={explanationOpen}
        onOpenChange={setExplanationOpen}
        zone={activeZones.join(' + ')}
        activity={activeActivity}
        polarCode={polarCode}
        plannedOps={plannedOps}
        vesselPosition={vesselPosition}
      />

      <ZoneManagerDialog
        open={zoneManagerOpen}
        onOpenChange={setZoneManagerOpen}
        onStartDrawing={handleStartDrawing}
        zones={customZones}
        onDeleteZone={handleDeleteZone}
        onUpdateZone={handleUpdateZone}
      />

      {showSimulatorPanel && (
        <SimulatorConfigPanel
          simulationConfig={simulationConfig}
          onSimulationConfigChange={setSimulationConfig}
          onClose={() => setShowSimulatorPanel(false)}
        />
      )}

      {gpsSource === 'simulation' && (
        <button
          onClick={() => setShowSimulatorPanel(true)}
          className="fixed bottom-4 right-32 z-[9998] bg-amber-600 hover:bg-amber-700 text-white px-4 py-3 rounded-lg shadow-lg transition-all flex items-center gap-2 text-sm font-bold border-2 border-amber-500"
          title="Configure GPS Simulator"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
            />
          </svg>
          SIMULATOR CONFIG
        </button>
      )}

      {aisPanelVisible && (
        <AISPanel
          vesselPosition={{ lat: vesselPosition.lat, lng: vesselPosition.lng, speed: vesselSpeed, heading: vesselHeading }}
          onClose={() => setAisPanelVisible(false)}
        />
      )}

      <SmartAlerts
        vesselPosition={vesselPosition}
        vesselSpeed={vesselSpeed}
        vesselCourse={vesselCourse}
        activeZones={activeZones}
        panelVisible={alertsPanelVisible}
        onAlertCountsChange={(total, critical, warning) => {
          setAlertCount(total);
          setCriticalAlertCount(critical);
          setWarningAlertCount(warning);
        }}
        vesselProfile={vesselProfile}
        customZones={customZones}
      />

      {isDrawingZone && (
        <ZoneDrawingOverlay
          points={drawingPoints}
          onAddPoint={handleAddPoint}
          onRemoveLastPoint={handleRemoveLastPoint}
          onRemovePoint={handleRemovePoint}
          onComplete={handleCompleteDrawing}
          onCancel={handleCancelDrawing}
        />
      )}

      {showZoneDetailsDialog && (
        <ZoneDetailsDialog coordinates={drawingPoints} onSave={handleSaveZone} onCancel={handleCancelZoneDetails} />
      )}
    </div>
  );
};

export default App;