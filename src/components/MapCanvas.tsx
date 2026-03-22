import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapControls } from './MapControls';
import { ScaleWidget } from './ScaleWidget';
import { WindArrows } from './WindArrows';
import {
  REGULATORY_POLYGONS,
  getActiveAreaIds,
  IMO_N60_VISUALIZATION_SEGMENTS,
} from '../data/geoTriggers';
import { MOCK_AIS_VESSELS } from './AISOverlay';
import { getProtectedAreas, convertGeoJSONToLeaflet, type ProtectedArea } from '../lib/authService';

// ===============================
// GREENLAND STYLE RESOLVER
// ===============================
function getGreenlandZoneStyle(polygon: any, active: boolean) {
  const baseOpacity = active ? 0.95 : 0.8;
  const baseFillOpacity = active ? 0.18 : 0.08;

  if (
    polygon.areaId?.includes('AUGUST') ||
    polygon.areaId?.includes('SEPTEMBER') ||
    polygon.areaId?.includes('CLOSED')
  ) {
    return {
      color: '#FFA500',
      weight: active ? 3 : 2,
      opacity: baseOpacity,
      dashArray: '6 6',
      fillColor: '#FFA500',
      fillOpacity: active ? 0.14 : 0.08,
    };
  }

  if (polygon.layerKey === 'greenlandLocalRestrictions') {
    return {
      color: '#00B4D8',
      weight: active ? 3 : 2,
      opacity: baseOpacity,
      dashArray: undefined,
      fillColor: '#00B4D8',
      fillOpacity: active ? 0.18 : 0.10,
    };
  }

  if (polygon.layerKey === 'greenlandProtectedAreas') {
    return {
      color: '#FF3B3B',
      weight: active ? 3 : 2,
      opacity: active ? 0.95 : 0.85,
      dashArray: undefined,
      fillColor: '#FF3B3B',
      fillOpacity: active ? 0.20 : 0.12,
    };
  }

  if (polygon.layerKey === 'greenlandSermersooq') {
    return {
      color: '#A855F7',
      weight: active ? 3 : 2,
      opacity: baseOpacity,
      dashArray: '8 4',
      fillColor: '#A855F7',
      fillOpacity: active ? 0.10 : 0.05,
    };
  }

  return {
    color: '#00ffff',
    weight: active ? 3 : 2,
    opacity: baseOpacity,
    dashArray: '6 4',
    fillColor: '#00ffff',
    fillOpacity: baseFillOpacity,
  };
}

// ===============================
// CANADA STYLE RESOLVER
// ===============================
function getCanadaZoneStyle(polygon: any, active: boolean) {
  if (polygon.layerKey === 'canadaNordreg') {
    return {
      color: '#06b6d4',
      weight: active ? 3 : 2,
      opacity: active ? 0.95 : 0.8,
      dashArray: '8 4',
      fillColor: '#06b6d4',
      fillOpacity: active ? 0.12 : 0.05,
    };
  }

  if (polygon.layerKey === 'canadaLancasterSound') {
    return {
      color: '#ef4444',
      weight: active ? 3 : 2,
      opacity: active ? 0.95 : 0.85,
      dashArray: undefined,
      fillColor: '#ef4444',
      fillOpacity: active ? 0.18 : 0.10,
    };
  }

  if (polygon.layerKey === 'canadaNwpCorridor') {
    return {
      color: '#a855f7',
      weight: active ? 3 : 2,
      opacity: active ? 0.95 : 0.8,
      dashArray: '10 6',
      fillColor: '#a855f7',
      fillOpacity: active ? 0.10 : 0.04,
    };
  }

  return {
    color: '#00ffff',
    weight: active ? 3 : 2,
    opacity: active ? 0.95 : 0.8,
    dashArray: '6 4',
    fillColor: '#00ffff',
    fillOpacity: active ? 0.10 : 0.05,
  };
}

// Overlay Registry System
type BBox = { minLat: number; maxLat: number; minLng: number; maxLng: number };

type OverlayId =
  | 'openseamap_seamarks'
  | 'kartverket_sjokart'
  | 'tss_lanes'
  | 'weather_clouds'
  | 'weather_precipitation'
  | 'weather_wind'
  | 'weather_temperature';

type OverlayDef = {
  id: OverlayId;
  name: string;
  type: 'tile' | 'wms';
  url: string;
  layers?: string;
  attribution: string;
  pane: string;
  opacity: number;
  minZoom?: number;
  maxZoom?: number;
  noWrap?: boolean;
  coverage?: BBox | null;
};

const OVERLAY_REGISTRY: Record<OverlayId, OverlayDef> = {
  openseamap_seamarks: {
    id: 'openseamap_seamarks',
    name: 'OpenSeaMap Seamarks',
    type: 'tile',
    url: 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
    attribution: '© OpenSeaMap contributors',
    pane: 'seamarkPane',
    opacity: 0.8,
    minZoom: 11,
    maxZoom: 18,
    noWrap: true,
    coverage: null,
  },
  kartverket_sjokart: {
    id: 'kartverket_sjokart',
    name: 'Kartverket Sjøkart (Raster)',
    type: 'wms',
    url: 'https://wms.geonorge.no/skwms1/wms.sjokartraster',
    layers: 'sjokartraster',
    attribution: '© Kartverket',
    pane: 'overlayPane',
    opacity: 0.65,
    minZoom: 6,
    maxZoom: 18,
    noWrap: true,
    coverage: { minLat: 56, maxLat: 82.5, minLng: -10, maxLng: 40 },
  },
  tss_lanes: {
    id: 'tss_lanes',
    name: 'Traffic Separation Schemes (TSS)',
    type: 'wms',
    url: 'https://tiles.openseamap.org/seamark',
    layers: 'seamark',
    attribution: '© OpenSeaMap',
    pane: 'overlayPane',
    opacity: 0.8,
    minZoom: 8,
    maxZoom: 18,
    noWrap: true,
    coverage: null,
  },
  weather_clouds: {
    id: 'weather_clouds',
    name: 'Weather: Clouds',
    type: 'tile',
    url: 'https://tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png?appid=760cf2d2d93195c3aba357fb72093036',
    attribution: '© OpenWeatherMap',
    pane: 'overlayPane',
    opacity: 0.6,
    minZoom: 0,
    maxZoom: 18,
    noWrap: false,
    coverage: null,
  },
  weather_precipitation: {
    id: 'weather_precipitation',
    name: 'Weather: Precipitation (RainViewer - NO API KEY)',
    type: 'tile',
    url: 'https://tilecache.rainviewer.com/v2/radar/1733760000/{z}/{x}/{y}/256.png',
    attribution: '© RainViewer',
    pane: 'overlayPane',
    opacity: 0.7,
    minZoom: 0,
    maxZoom: 12,
    noWrap: false,
    coverage: null,
  },
  weather_wind: {
    id: 'weather_wind',
    name: 'Weather: Wind',
    type: 'tile',
    url: 'https://tile.openweathermap.org/map/wind/{z}/{x}/{y}.png?appid=760cf2d2d93195c3aba357fb72093036',
    attribution: '© OpenWeatherMap',
    pane: 'overlayPane',
    opacity: 0.5,
    minZoom: 0,
    maxZoom: 18,
    noWrap: false,
    coverage: null,
  },
  weather_temperature: {
    id: 'weather_temperature',
    name: 'Weather: Temperature',
    type: 'tile',
    url: 'https://tile.openweathermap.org/map/temp/{z}/{x}/{y}.png?appid=760cf2d2d93195c3aba357fb72093036',
    attribution: '© OpenWeatherMap',
    pane: 'overlayPane',
    opacity: 0.5,
    minZoom: 0,
    maxZoom: 18,
    noWrap: false,
    coverage: null,
  },
};

function inBBox(lat: number, lng: number, b: BBox) {
  return lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng;
}

function overlayAvailable(def: OverlayDef, lat: number, lng: number) {
  if (!def.coverage) return true;
  return inBBox(lat, lng, def.coverage);
}

function formatScale(scaleDenom: number): string {
  if (!isFinite(scaleDenom) || scaleDenom <= 0) return '1:—';
  if (scaleDenom >= 1_000_000) return `1:${Math.round(scaleDenom / 1_000_000)}M`;
  if (scaleDenom >= 1_000) return `1:${Math.round(scaleDenom / 1_000)}k`;
  return `1:${Math.round(scaleDenom)}`;
}

function formatDMS(lat: number, lng: number): string {
  const formatCoord = (value: number, isLat: boolean) => {
    const abs = Math.abs(value);
    const deg = Math.floor(abs);
    const minFloat = (abs - deg) * 60;
    const min = minFloat.toFixed(1);
    const dir = isLat ? (value >= 0 ? 'N' : 'S') : value >= 0 ? 'E' : 'W';
    return `${deg}°${min}'${dir}`;
  };
  return `${formatCoord(lat, true)} ${formatCoord(lng, false)}`;
}

function calculateBearing(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  const θ = Math.atan2(y, x);
  return (((θ * 180) / Math.PI) + 360) % 360;
}

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3440.065;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function niceNm(nm: number): number {
  const steps = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500];
  return steps.find((s) => s >= nm) ?? Math.ceil(nm / 500) * 500;
}

function computeScaleAndNm(map: any): { zoom: number; scaleText: string; nauticalMiles: number; widthPx: number } {
  const zoom = map.getZoom();
  const lat = map.getCenter().lat;
  const mpp = (156543.03392 * Math.cos((lat * Math.PI) / 180)) / Math.pow(2, zoom);
  const scaleDenom = mpp / 0.00028;

  const y = map.getSize().y / 2;
  const p1 = map.containerPointToLatLng([0, y]);
  const p2 = map.containerPointToLatLng([100, y]);
  const meters100px = map.distance(p1, p2);
  const nm100px = meters100px / 1852;

  const nm = niceNm(nm100px);
  const widthPx = (nm / nm100px) * 100;

  return { zoom, scaleText: formatScale(scaleDenom), nauticalMiles: nm, widthPx };
}

function computeOverlayStatus(
  vesselLat: number,
  vesselLng: number,
  zoom: number
): Record<OverlayId, { available: boolean; zoomOk: boolean; activeAllowed: boolean; reason?: string }> {
  const res = {} as Record<
    OverlayId,
    { available: boolean; zoomOk: boolean; activeAllowed: boolean; reason?: string }
  >;

  (Object.keys(OVERLAY_REGISTRY) as OverlayId[]).forEach((id) => {
    const def = OVERLAY_REGISTRY[id];
    const available = overlayAvailable(def, vesselLat, vesselLng);
    const minOk = def.minZoom !== undefined ? zoom >= def.minZoom : true;
    const maxOk = def.maxZoom !== undefined ? zoom <= def.maxZoom : true;
    const zoomOk = minOk && maxOk;

    res[id] = {
      available,
      zoomOk,
      activeAllowed: available && zoomOk,
      reason: !available ? 'Coverage not available' : !zoomOk ? `Zoom ${zoom} out of range` : undefined,
    };
  });

  return res;
}

interface MapCanvasProps {
  zone: string;
  arcticPolarVisible?: boolean;
  antarcticPolarVisible?: boolean;
  vesselHeading: number;
  openSeaMapLayer?: boolean;
  fiskeridirLayer?: boolean;
  tssLayer?: boolean;
  weatherLayer?: 'none' | 'clouds' | 'precipitation' | 'wind' | 'temperature';
  basemapType?: 'ocean' | 'geographic';
  vesselPosition: { lat: number; lng: number };
  isLiveData?: boolean;
  vesselSpeed?: number;
  vesselCourse?: number;
  cursorBoxVisible?: boolean;
  displayMode?: 'day' | 'dusk' | 'night';
  coursePredictorVisible?: boolean;
  coursePredictorMinutes?: number;
  setDriftVisible?: boolean;
  activeRouteId?: string | null;
  activeRoute?: { id: string; waypoints: Array<{ lat: number; lon: number; name?: string; seq: number }> } | null;
  debugBordersVisible?: boolean;
  onRulecardSelect?: (rulecardId: string | null) => void;
  regLayers?: {
    enabled: boolean;
    bordersEnabled: boolean;
    regulatoryZonesEnabled: boolean;
    baseline?: boolean;
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
    canadaNordreg?: boolean;
    canadaLancasterSound?: boolean;
    canadaNwpCorridor?: boolean;
    marpolAreas: boolean;
    solasZones: boolean;
    debugBorders: boolean;
  };
  onProtectedAreaClick?: (areaId: string) => void;
  zoneCrossingPoints?: {
    id: string;
    lat: number;
    lon: number;
    crossingType: 'ENTRY' | 'EXIT';
    zoneName: string;
    legIndex: number;
    distanceFromLegStartNm: number;
  }[];
  isDrawingZone?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
  drawingPoints?: [number, number][];
  customZones?: Array<{
    id: string;
    name: string;
    category: string;
    color: string;
    coordinates: [number, number][];
    status: string;
  }>;
  appZoneActivityLog?: {
    id: string;
    areaId: string;
    eventType: 'ENTRY' | 'EXIT';
    timestampUtc: string;
    lat: number;
    lng: number;
  }[];
  aisEnabled?: boolean;
}

export function MapCanvas({
  zone,
  arcticPolarVisible = true,
  antarcticPolarVisible = true,
  vesselHeading,
  openSeaMapLayer = true,
  fiskeridirLayer = false,
  tssLayer = false,
  weatherLayer = 'none',
  basemapType = 'ocean',
  vesselPosition,
  isLiveData = false,
  vesselSpeed = 0,
  vesselCourse = 0,
  cursorBoxVisible = true,
  displayMode = 'day',
  coursePredictorVisible = false,
  coursePredictorMinutes = 6,
  setDriftVisible = false,
  activeRouteId = null,
  activeRoute = null,
  debugBordersVisible = false,
  regLayers,
  onRulecardSelect,
  onProtectedAreaClick,
  zoneCrossingPoints = [],
  isDrawingZone = false,
  onMapClick,
  drawingPoints = [],
  customZones = [],
  appZoneActivityLog = [],
  aisEnabled = true,
}: MapCanvasProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);

  const zoneActivityLayerRef = useRef<L.LayerGroup | null>(null);

  const greenlandProtectedGeoJsonRef = useRef<any>(null);
  const greenlandProtectedLayerRef = useRef<L.LayerGroup | null>(null);

  const vesselMarkerRef = useRef<any>(null);
  const relativeCenterMarkerRef = useRef<any>(null);
  const cursorLineRef = useRef<any>(null);
  const coursePredictorLineRef = useRef<any>(null);
  const coursePredictorMarkerRef = useRef<any>(null);
  const setDriftLineRef = useRef<any>(null);

  const activeRouteLineRef = useRef<any>(null);
  const activeRouteWpLayerRef = useRef<any>(null);

  const arcticPolarLayersRef = useRef<any[]>([]);
  const antarcticPolarLayersRef = useRef<any[]>([]);

  const regulatoryLayerRef = useRef<any>(null);
  const protectedLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const vesselLayerRef = useRef<any>(null);
  const alertLayerRef = useRef<any>(null);
  const drawLayerRef = useRef<any>(null);
  const customZoneLayerRef = useRef<any>(null);
  const polarLayerRef = useRef<any>(null);
  const aisLayerRef = useRef<any>(null);
  const eezLayerRef = useRef<any>(null);
  const territorial12nmLayerRef = useRef<any>(null);
  const greenlandSermersooqLayerRef = useRef<any>(null);
  const greenlandLocalRestrictionsLayerRef = useRef<any>(null);
  const canadaNordregLayerRef = useRef<any>(null);
  const canadaLancasterLayerRef = useRef<any>(null);
  const canadaNwpLayerRef = useRef<any>(null);

  const regulatoryPolygonRefs = useRef<Record<string, any>>({});
  const protectedPolygonRefs = useRef<Record<string, any[]>>({});

  const eezGeoJsonRef = useRef<any>(null);
  const territorial12nmGeoJsonRef = useRef<any>(null);

  const nordregGeoJsonRef = useRef<any>(null);

  const overlayLayersRef = useRef<Record<string, any>>({});

  const [protectedAreas, setProtectedAreas] = useState<ProtectedArea[]>([]);
  const [protectedAreasLoading, setProtectedAreasLoading] = useState(true);

  const activeAreaIds = useMemo(() => {
    return getActiveAreaIds(vesselPosition);
  }, [vesselPosition.lat, vesselPosition.lng]);

  const [overlayStatus, setOverlayStatus] = useState<Record<string, any>>({});
  const [weatherDebugInfo, setWeatherDebugInfo] = useState<{
    layer: string;
    loading: boolean;
    error: boolean;
    added: boolean;
  }>({ layer: 'none', loading: false, error: false, added: false });

  const [currentZoom, setCurrentZoom] = useState<number>(0);
  const [mapReady, setMapReady] = useState(false);

  const isUnmountingRef = useRef(false);

  const [scaleData, setScaleData] = useState({
    zoom: 0,
    scaleText: '1:—',
    nauticalMiles: 0,
    widthPx: 0,
  });

  const [centerLocked, setCenterLocked] = useState(false);
  const [lockedPixelOffset, setLockedPixelOffset] = useState<{ x: number; y: number } | null>(null);
  const [isSettingRelativeCenter, setIsSettingRelativeCenter] = useState(false);
  const [relativeCenter, setRelativeCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [cursorPosition, setCursorPosition] = useState<{ lat: number; lng: number } | null>(null);

  const [navPosition, setNavPosition] = useState({ x: 867, y: 62 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - navPosition.x,
      y: e.clientY - navPosition.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
      setNavPosition({
        x: e.clientX - dragOffsetRef.current.x,
        y: e.clientY - dragOffsetRef.current.y,
      });
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDragging(false);
  };

  useEffect(() => {
    if (!isDragging) return;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  useEffect(() => {
    const loadProtectedAreas = async () => {
      try {
        setProtectedAreasLoading(true);
        const areas = await getProtectedAreas();
        console.log(`✅ Loaded ${areas.length} protected areas from Supabase`);
        setProtectedAreas(areas);
      } catch (error: any) {
        if (error?.code === 'PGRST205' || error?.message?.includes('protected_areas')) {
          console.info('ℹ️ Protected areas: Not configured');
        } else {
          console.error('Error loading protected areas:', error);
        }
        setProtectedAreas([]);
      } finally {
        setProtectedAreasLoading(false);
      }
    };

    loadProtectedAreas();
  }, []);

  useEffect(() => {
    if (!leafletMapRef.current || !zoneActivityLayerRef.current) return;

    const layer = zoneActivityLayerRef.current;
    layer.clearLayers();

    appZoneActivityLog.forEach((entry) => {
      const color = entry.eventType === 'ENTRY' ? '#00ff88' : '#ff4444';

      const marker = L.circleMarker([entry.lat, entry.lng], {
        radius: 6,
        color,
        weight: 2,
        fillOpacity: 0.8,
      });

      marker.bindPopup(`
      <b>${entry.eventType}</b><br/>
      ${entry.areaId}<br/>
      ${entry.timestampUtc}<br/>
      Lat: ${entry.lat.toFixed(4)}<br/>
      Lng: ${entry.lng.toFixed(4)}
    `);

      marker.addTo(layer);
    });
  }, [appZoneActivityLog]);

  useEffect(() => {
    const fetchGreenlandProtectedGeoJson = async () => {
      try {
        console.log('🟥 Fetching Greenland protected GeoJSON...');

        const res = await fetch(
          'https://services-eu1.arcgis.com/0uK40YtWoUkQMlYW/ArcGIS/rest/services/Protected_Areas_of_Greenland_DisplayLayer/FeatureServer/0/query?where=1%3D1&outFields=*&f=geojson'
        );

        console.log('🟥 Greenland protected fetch status:', res.status);

        const data = await res.json();

        console.log('🟥 Greenland protected raw data:', data);
        console.log('🟥 Greenland protected feature count:', data?.features?.length);

        greenlandProtectedGeoJsonRef.current = data;

        console.log('✅ Greenland protected GeoJSON stored in ref');
      } catch (err) {
        console.error('❌ Failed loading Greenland protected GeoJSON:', err);
      }
    };

    fetchGreenlandProtectedGeoJson();
  }, []);

  // Greenland protected areas render
  useEffect(() => {
    console.log('🟥 GREENLAND PROTECTED effect fired', {
      mapReady,
      toggle: regLayers?.greenlandProtectedAreas,
      hasLayerRef: !!greenlandProtectedLayerRef.current,
      hasGeoJson: !!greenlandProtectedGeoJsonRef.current,
      featureCount: greenlandProtectedGeoJsonRef.current?.features?.length
    });

    if (!mapReady || !leafletMapRef.current || !greenlandProtectedLayerRef.current) return;

    const renderProtected = async () => {
      const layerGroup = greenlandProtectedLayerRef.current!;
      layerGroup.clearLayers();

      if (!regLayers?.greenlandProtectedAreas) return;
      if (!greenlandProtectedGeoJsonRef.current) return;

      try {
        const L = await import('leaflet');

        const geo = L.geoJSON(greenlandProtectedGeoJsonRef.current, {
          style: () => ({
            color: '#ff4d4f',
            weight: 2,
            opacity: 0.9,
            dashArray: '4 4',
            fill: false,
          }),
          onEachFeature: (feature, layer) => {
            layer.bindTooltip(
              feature?.properties?.NAME ||
              feature?.properties?.name ||
              'Greenland Protected Area'
            );
          }
        });

        geo.addTo(layerGroup);

        console.log('✅ Greenland protected rendered');
      } catch (err) {
        console.error('❌ Error rendering Greenland protected', err);
      }
    };

    renderProtected();
  }, [mapReady, regLayers?.greenlandProtectedAreas]);

  // Greenland local restrictions render
  useEffect(() => {
    console.log('🟧 GREENLAND LOCAL effect fired', {
      mapReady,
      enabled: regLayers?.greenlandLocalRestrictions,
      hasLayerRef: !!greenlandLocalRestrictionsLayerRef.current
    });

    if (!mapReady || !leafletMapRef.current || !greenlandLocalRestrictionsLayerRef.current) return;

    const renderLocalRestrictions = async () => {
      const layerGroup = greenlandLocalRestrictionsLayerRef.current;
      layerGroup.clearLayers();

      if (!regLayers?.greenlandLocalRestrictions) return;

      try {
        const L = await import('leaflet');

        const localZones = REGULATORY_POLYGONS.filter(
          (polygon) => polygon.layerKey === 'greenlandLocalRestrictions'
        );

        console.log('🟧 Greenland local zones:', localZones);

        localZones.forEach((zone) => {
          const active = activeAreaIds.includes(zone.areaId);

          const polygon = L.polygon(zone.coordinates, {
            ...getGreenlandZoneStyle(zone, active),
            pane: 'vectorPane',
          });

          layerGroup.addLayer(polygon);

          polygon.bindTooltip(
            `<strong>${zone.name}</strong><br/>Greenland Local Restriction`,
            {
              sticky: true,
              className: 'debug-polygon-tooltip',
            }
          );

          polygon.on('click', () => {
            console.log('🟧 Clicked Greenland local restriction:', zone.id, 'rulecardId:', zone.rulecardId);

            if (onRulecardSelect && zone.rulecardId) {
              onRulecardSelect(zone.rulecardId);
            }
          });
        });

        console.log('✅ Greenland local restrictions rendered');
      } catch (error) {
        console.error('❌ Greenland local restriction render error:', error);
      }
    };

    renderLocalRestrictions();
  }, [
    mapReady,
    regLayers?.greenlandLocalRestrictions,
    regLayers?.enabled,
    regLayers?.regulatoryZonesEnabled,
    onRulecardSelect,
    activeAreaIds,
  ]);

// Canada NORDREG render (real GeoJSON)
useEffect(() => {
  if (!mapReady || !leafletMapRef.current || !canadaNordregLayerRef.current) return;

  const renderCanadaNordreg = async () => {
    const layerGroup = canadaNordregLayerRef.current;
    layerGroup.clearLayers();

    if (!regLayers?.canadaNordreg) return;

    try {
      const L = await import('leaflet');

      if (!nordregGeoJsonRef.current) {
        const response = await fetch('/data/regulations/canada/nordreg.geojson');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} loading NORDREG GeoJSON`);
        }
        nordregGeoJsonRef.current = await response.json();
        console.log('✅ NORDREG GeoJSON cached');
      }

      const geoLayer = L.geoJSON(nordregGeoJsonRef.current, {
        style: {
          color: '#06b6d4',
          weight: 2,
          opacity: 0.95,
          dashArray: '8 4',
          fillColor: '#06b6d4',
          fillOpacity: 0.08,
        },
        pane: 'vectorPane',
        smoothFactor: 1,
        onEachFeature: (_feature, layer) => {
          layer.bindTooltip(
            `<strong>Canada NORDREG Reporting Zone</strong><br/>Mandatory reporting / Arctic Canada`,
            {
              sticky: true,
              className: 'debug-polygon-tooltip',
            }
          );

          layer.on('click', () => {
            if (onRulecardSelect) {
              onRulecardSelect('CANADA_NORDREG');
            }
          });
        },
      });

      geoLayer.addTo(layerGroup);
      console.log('✅ Canada NORDREG rendered from GeoJSON');
    } catch (error) {
      console.error('❌ Canada NORDREG render error:', error);
    }
  };

  renderCanadaNordreg();
}, [mapReady, regLayers?.canadaNordreg, onRulecardSelect]);

  // Canada Lancaster Sound render
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !canadaLancasterLayerRef.current) return;

    const renderCanadaLancaster = async () => {
      const layerGroup = canadaLancasterLayerRef.current;
      layerGroup.clearLayers();

      if (!regLayers?.canadaLancasterSound) return;

      try {
        const L = await import('leaflet');

        const zones = REGULATORY_POLYGONS.filter(
          (polygon) => polygon.layerKey === 'canadaLancasterSound'
        );

        zones.forEach((zone) => {
          const active = activeAreaIds.includes(zone.areaId);

          const polygon = L.polygon([zone.coordinates], {
            ...getCanadaZoneStyle(zone, active),
            pane: 'vectorPane',
            smoothFactor: 1,
          });

          layerGroup.addLayer(polygon);

          polygon.bindTooltip(
            `<strong>${zone.name}</strong><br/>Lancaster Sound / Tallurutiup Imanga`,
            {
              sticky: true,
              className: 'debug-polygon-tooltip',
            }
          );

          polygon.on('click', () => {
            if (onRulecardSelect && zone.rulecardId) {
              onRulecardSelect(zone.rulecardId);
            }
          });
        });
      } catch (error) {
        console.error('❌ Canada Lancaster render error:', error);
      }
    };

    renderCanadaLancaster();
  }, [mapReady, regLayers?.canadaLancasterSound, onRulecardSelect, activeAreaIds]);

  // Canada NWP Corridor render
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !canadaNwpLayerRef.current) return;

    const renderCanadaNwp = async () => {
      const layerGroup = canadaNwpLayerRef.current;
      layerGroup.clearLayers();

      if (!regLayers?.canadaNwpCorridor) return;

      try {
        const L = await import('leaflet');

        const zones = REGULATORY_POLYGONS.filter(
          (polygon) => polygon.layerKey === 'canadaNwpCorridor'
        );

        zones.forEach((zone) => {
          const active = activeAreaIds.includes(zone.areaId);

          const polygon = L.polygon(zone.coordinates, {
            ...getCanadaZoneStyle(zone, active),
            pane: 'vectorPane',
          });

          layerGroup.addLayer(polygon);

          polygon.bindTooltip(
            `<strong>${zone.name}</strong><br/>Northwest Passage transit corridor`,
            {
              sticky: true,
              className: 'debug-polygon-tooltip',
            }
          );

          polygon.on('click', () => {
            if (onRulecardSelect && zone.rulecardId) {
              onRulecardSelect(zone.rulecardId);
            }
          });
        });
      } catch (error) {
        console.error('❌ Canada NWP render error:', error);
      }
    };

    renderCanadaNwp();
  }, [mapReady, regLayers?.canadaNwpCorridor, onRulecardSelect, activeAreaIds]);

  // Map init
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadLeafletCSS = () => {
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
        link.crossOrigin = '';
        document.head.appendChild(link);
      }
    };

    loadLeafletCSS();

    import('leaflet')
      .then((L) => {
        if (!mapRef.current || leafletMapRef.current) return;

        const map = L.map(mapRef.current, {
          center: [vesselPosition.lat, vesselPosition.lng],
          zoom: 10,
          zoomControl: false,
          attributionControl: true,
          minZoom: 2,
          maxZoom: 18,
          maxBounds: undefined,
          maxBoundsViscosity: 1.0,
          worldCopyJump: true,
        });

        zoneActivityLayerRef.current = L.layerGroup().addTo(map);

        leafletMapRef.current = map;
        setCurrentZoom(10);
        setMapReady(true);

        setTimeout(() => {
  map.invalidateSize();
}, 0);

        map.createPane('basemapPane');
        map.getPane('basemapPane')!.style.zIndex = '200';

        map.createPane('seamarkPane');
        map.getPane('seamarkPane')!.style.zIndex = '350';

        map.createPane('overlayPane');
        map.getPane('overlayPane')!.style.zIndex = '400';

        map.createPane('vectorPane');
        map.getPane('vectorPane')!.style.zIndex = '500';

        map.createPane('labelsPane');
        map.getPane('labelsPane')!.style.zIndex = '650';

        map.createPane('markerPane');
        map.getPane('markerPane')!.style.zIndex = '680';

        map.createPane('shipPane');
        map.getPane('shipPane')!.style.zIndex = '700';

        regulatoryLayerRef.current = L.layerGroup().addTo(map);
        protectedLayerRef.current = L.layerGroup().addTo(map);
        routeLayerRef.current = L.layerGroup().addTo(map);
        vesselLayerRef.current = L.layerGroup().addTo(map);
        alertLayerRef.current = L.layerGroup().addTo(map);
        drawLayerRef.current = L.layerGroup().addTo(map);
        customZoneLayerRef.current = L.layerGroup().addTo(map);
        polarLayerRef.current = L.layerGroup().addTo(map);
        aisLayerRef.current = L.layerGroup().addTo(map);
        eezLayerRef.current = L.layerGroup().addTo(map);
        territorial12nmLayerRef.current = L.layerGroup().addTo(map);
        greenlandSermersooqLayerRef.current = L.layerGroup().addTo(map);
        greenlandProtectedLayerRef.current = L.layerGroup().addTo(map);
        greenlandLocalRestrictionsLayerRef.current = L.layerGroup().addTo(map);
        canadaNordregLayerRef.current = L.layerGroup().addTo(map);
        canadaLancasterLayerRef.current = L.layerGroup().addTo(map);
        canadaNwpLayerRef.current = L.layerGroup().addTo(map);

        const bathymetryLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
          {
            pane: 'basemapPane',
            noWrap: true,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
            minZoom: 2,
          }
        );

        const geographicLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
          {
            pane: 'basemapPane',
            noWrap: true,
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 20,
            minZoom: 2,
          }
        );

        const geographicLabelsLayer = L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/dark_only_labels/{z}/{x}/{y}{r}.png',
          {
            pane: 'labelsPane',
            subdomains: 'abcd',
            opacity: 0.9,
            minZoom: 2,
            maxZoom: 20,
            noWrap: true,
            attribution: '',
          }
        );

        if (basemapType === 'ocean') {
          bathymetryLayer.addTo(map);
        } else {
          geographicLayer.addTo(map);
          geographicLabelsLayer.addTo(map);
        }

        (map as any)._bathymetryLayer = bathymetryLayer;
        (map as any)._geographicLayer = geographicLayer;
        (map as any)._geographicLabelsLayer = geographicLabelsLayer;

        const vesselIcon = L.divIcon({
          className: 'vessel-marker',
          html: `
            <div style="position: relative; width: 40px; height: 40px;">
              <svg width="40" height="40" viewBox="0 0 40 40" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(${vesselHeading}deg);">
                <path d="M20 8 L28 28 L20 24 L12 28 Z" fill="#34d399" stroke="#0a1628" stroke-width="2" stroke-linejoin="miter" />
              </svg>
              <div style="position: absolute; top: -4px; left: -4px; right: -4px; bottom: -4px; background: rgba(52, 211, 153, 0.2); border-radius: 50%; animation: pulse 2s infinite;"></div>
            </div>
          `,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const vesselMarker = L.marker([vesselPosition.lat, vesselPosition.lng], {
          icon: vesselIcon,
          pane: 'shipPane',
        });

        vesselMarker.bindPopup(`
          <div style="font-family: system-ui; padding: 8px;">
            <div style="font-weight: bold; color: #34d399; margin-bottom: 4px;">MV EXPEDITION</div>
            <div style="font-size: 11px; color: #64748b; font-family: monospace;">
              SOG ${vesselSpeed.toFixed(1)} kts<br/>
              COG ${String(Math.round(vesselCourse)).padStart(3, '0')}°<br/>
              HDG ${String(Math.round(vesselHeading)).padStart(3, '0')}°
            </div>
          </div>
        `);

        vesselMarker.on('dblclick', function () {
          this.openPopup();
        });

        vesselMarker.addTo(vesselLayerRef.current);
        vesselMarkerRef.current = vesselMarker;

        MOCK_AIS_VESSELS.forEach((vessel) => {
          const aisIcon = L.divIcon({
            className: 'ais-vessel-icon',
            html: `
              <div style="transform: rotate(${vessel.heading}deg); width: 24px; height: 24px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 L4 20 L12 16 L20 20 Z" fill="${vessel.speed > 0 ? '#10b981' : '#ef4444'}" stroke="#1e293b" stroke-width="1.5"/>
                </svg>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const aisMarker = L.marker([vessel.lat, vessel.lng], {
            icon: aisIcon,
            pane: 'markerPane',
          });

          aisMarker.bindPopup(`
            <div style="font-family: system-ui; padding: 8px; min-width: 180px;">
              <div style="font-weight: bold; color: #10b981; margin-bottom: 4px;">${vessel.name}</div>
              <div style="font-size: 11px; color: #64748b; font-family: monospace; line-height: 1.6;">
                MMSI: ${vessel.mmsi}<br/>
                Type: ${vessel.type.toUpperCase()}<br/>
                ${vessel.flag ? `Flag: ${vessel.flag}<br/>` : ''}
                SOG: ${vessel.speed.toFixed(1)} kts<br/>
                COG: ${String(vessel.course).padStart(3, '0')}°<br/>
                HDG: ${String(vessel.heading).padStart(3, '0')}°<br/>
                ${vessel.destination ? `Dest: ${vessel.destination}<br/>` : ''}
                ${vessel.eta ? `ETA: ${vessel.eta}<br/>` : ''}
                ${vessel.length && vessel.beam ? `LOA: ${vessel.length}m, Beam: ${vessel.beam}m` : ''}
              </div>
            </div>
          `);

          if (aisEnabled) aisMarker.addTo(aisLayerRef.current);
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        arcticPolarLayersRef.current = [];
        IMO_N60_VISUALIZATION_SEGMENTS.forEach((segment) => {
          const line = L.polyline(segment, {
            color: '#06b6d4',
            weight: 2.5,
            opacity: 0.9,
            dashArray: '8, 6',
            pane: 'vectorPane',
          });

          line.bindTooltip('IMO Polar Code - Arctic N60 Boundary', {
            permanent: false,
            direction: 'center',
            className: 'polar-code-tooltip',
          });

          arcticPolarLayersRef.current.push(line);
        });

        const antarcticPolarArea = [
          [-180, -60],
          [180, -60],
          [180, -90],
          [-180, -90],
          [-180, -60],
        ].map(([lng, lat]) => [lat, lng] as [number, number]);

        const antarcticPoly = L.polygon(antarcticPolarArea, {
          color: '#fbbf24',
          fillColor: '#fbbf24',
          fillOpacity: 0.08,
          weight: 2.5,
          opacity: 0.5,
          dashArray: '8, 6',
          pane: 'vectorPane',
        });
        antarcticPoly.bindTooltip('IMO Polar Code - Antarctic Waters (<60°S)', {
          permanent: false,
          direction: 'center',
          className: 'polar-code-tooltip',
        });
        antarcticPolarLayersRef.current.push(antarcticPoly);

        (Object.keys(OVERLAY_REGISTRY) as OverlayId[]).forEach((id) => {
          const def = OVERLAY_REGISTRY[id];
          const layer =
            def.type === 'wms'
              ? (L.tileLayer as any).wms(def.url, {
                  layers: def.layers,
                  format: 'image/png',
                  transparent: true,
                  attribution: def.attribution,
                  pane: def.pane,
                  opacity: def.opacity,
                  minZoom: def.minZoom,
                  maxZoom: def.maxZoom,
                })
              : L.tileLayer(def.url, {
                  attribution: def.attribution,
                  pane: def.pane,
                  opacity: def.opacity,
                  minZoom: def.minZoom,
                  maxZoom: def.maxZoom,
                  noWrap: def.noWrap ?? true,
                });

          layer.on('tileloadstart', () => {
            if (id.startsWith('weather_')) {
              setWeatherDebugInfo({ layer: id, loading: true, error: false, added: true });
            }
          });
          layer.on('tileload', () => {
            if (id.startsWith('weather_')) {
              setWeatherDebugInfo({ layer: id, loading: false, error: false, added: true });
            }
          });
          layer.on('tileerror', () => {
            if (id.startsWith('weather_')) {
              setWeatherDebugInfo({ layer: id, loading: false, error: true, added: true });
            }
          });

          overlayLayersRef.current[id] = layer;
        });

        map.on('mousemove', (e: any) => {
          if (!isUnmountingRef.current) {
            setCursorPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
          }
        });

        map.on('mouseout', () => {
          if (!isUnmountingRef.current) {
            setCursorPosition(null);
          }
        });
      })
      .catch((err) => {
        console.error('Failed to load Leaflet:', err);
      });

    return () => {
      isUnmountingRef.current = true;
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch (error) {
          console.error('Error removing map:', error);
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  // EEZ dataset toggle
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !eezLayerRef.current) return;

    const shouldShowEEZ =
      !!regLayers?.enabled &&
      !!regLayers?.bordersEnabled &&
      !!regLayers?.eez200nm;

    const renderEEZ = async () => {
      const eezLayer = eezLayerRef.current;
      eezLayer.clearLayers();

      if (!shouldShowEEZ) return;

      try {
        if (!eezGeoJsonRef.current) {
          const response = await fetch('/data/regulations/eez/eez_global.geojson');
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} loading EEZ GeoJSON`);
          }
          eezGeoJsonRef.current = await response.json();
          console.log('✅ EEZ GeoJSON cached');
        }

        const layer = L.geoJSON(eezGeoJsonRef.current, {
          style: {
            color: '#00ffff',
            weight: 3,
            opacity: 1,
            dashArray: '6 4',
            fillOpacity: 0.12,
          },
          pane: 'vectorPane',
          smoothFactor: 1,
        });

        layer.addTo(eezLayer);
        console.log('✅ EEZ rendered via toggle');
      } catch (error) {
        console.error('❌ EEZ load/render error:', error);
      }
    };

    renderEEZ();
  }, [mapReady, regLayers?.enabled, regLayers?.bordersEnabled, regLayers?.eez200nm]);

  // Territorial 12NM dataset toggle
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !territorial12nmLayerRef.current) return;

    const shouldShow12NM =
      !!regLayers?.enabled &&
      !!regLayers?.bordersEnabled &&
      !!regLayers?.territorialWaters12nm;

    const render12NM = async () => {
      const layer = territorial12nmLayerRef.current;
      layer.clearLayers();

      if (!shouldShow12NM) return;

      try {
        if (!territorial12nmGeoJsonRef.current) {
          const response = await fetch('/data/regulations/12nm/12nm_global.geojson');
          if (!response.ok) {
            throw new Error(`HTTP ${response.status} loading 12NM GeoJSON`);
          }

          territorial12nmGeoJsonRef.current = await response.json();
          console.log('✅ 12NM GeoJSON cached');
        }

        const geoLayer = L.geoJSON(territorial12nmGeoJsonRef.current, {
          style: {
            color: '#22c55e',
            weight: 2,
            opacity: 0.9,
            fillOpacity: 0.05,
          },
          pane: 'vectorPane',
          smoothFactor: 1,
        });

        geoLayer.addTo(layer);
      } catch (err) {
        console.error('❌ Failed loading 12NM dataset:', err);
      }
    };

    render12NM();
  }, [
    mapReady,
    regLayers?.enabled,
    regLayers?.bordersEnabled,
    regLayers?.territorialWaters12nm
  ]);

  // Live style update
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const activeAreaIdsNow = getActiveAreaIds(vesselPosition);

    const REG_BASE = {
      color: '#4FD1C5',
      weight: 1,
      opacity: 0.6,
      dashArray: '6 6',
      fill: false,
      fillOpacity: 0,
    };

    const REG_ACTIVE = {
      color: '#4FD1C5',
      weight: 2,
      opacity: 0.95,
      dashArray: undefined,
      fill: false,
      fillOpacity: 0,
    };

    const PROTECTED_BASE = {
      color: '#ef4444',
      fillColor: '#ef4444',
      weight: 2,
      opacity: 0.5,
      fillOpacity: 0.06,
    };

    const PROTECTED_ACTIVE = {
      color: '#ef4444',
      fillColor: '#ef4444',
      weight: 3,
      opacity: 0.75,
      fillOpacity: 0.12,
    };

    REGULATORY_POLYGONS.forEach((polygon) => {
      const polyRef = regulatoryPolygonRefs.current[polygon.id];
      if (!polyRef) return;

      const active = activeAreaIdsNow.includes(polygon.areaId);
      const isProtected = polygon.id.startsWith('PROTECTED_');
      const isSvalbard12nm =
        polygon.id === 'BJORNOYA_12NM_POLYGON' || polygon.id === 'SPITSBERGEN_12NM_POLYGON';

      if (isProtected) {
        polyRef.setStyle(active ? PROTECTED_ACTIVE : PROTECTED_BASE);
      } else if (isSvalbard12nm) {
        polyRef.setStyle({
          color: '#000000',
          weight: 1,
          opacity: 0.8,
          dashArray: '5 5',
          fill: false,
          fillOpacity: 0,
        });
      } else {
        polyRef.setStyle(active ? REG_ACTIVE : REG_BASE);
      }
    });

    Object.entries(protectedPolygonRefs.current).forEach(([areaId, polyList]) => {
      const active = activeAreaIdsNow.includes(areaId);
      polyList.forEach((poly) => {
        poly.setStyle(active ? PROTECTED_ACTIVE : PROTECTED_BASE);
      });
    });
  }, [vesselPosition.lat, vesselPosition.lng]);

  // Greenland Sermersooq dataset toggle
  useEffect(() => {
    console.log('GREENLAND effect fired', {
      mapReady,
      enabled: regLayers?.enabled,
      regulatoryZonesEnabled: regLayers?.regulatoryZonesEnabled,
      greenlandSermersooq: regLayers?.greenlandSermersooq,
      hasLayerRef: !!greenlandSermersooqLayerRef.current,
    });

    if (!mapReady || !leafletMapRef.current || !greenlandSermersooqLayerRef.current) return;

    const shouldShowGreenlandSermersooq =
      !!regLayers?.enabled &&
      !!regLayers?.regulatoryZonesEnabled &&
      !!regLayers?.greenlandSermersooq;

    const renderGreenlandSermersooq = async () => {
      const layerGroup = greenlandSermersooqLayerRef.current;
      layerGroup.clearLayers();

      if (!shouldShowGreenlandSermersooq) return;

      try {
        const L = await import('leaflet');

        const greenlandZones = REGULATORY_POLYGONS.filter(
          (polygon) => polygon.layerKey === 'greenlandSermersooq'
        );

        console.log('Rendering Greenland zones now:', greenlandZones);

        greenlandZones.forEach((zone) => {
          const active = activeAreaIds.includes(zone.areaId);

          const polygon = L.polygon(zone.coordinates, {
            ...getGreenlandZoneStyle(zone, active),
            pane: 'vectorPane',
          });

          layerGroup.addLayer(polygon);

          polygon.bindTooltip(
            `<strong>${zone.name}</strong><br/>AECO / Sermersooq zoning proposal`,
            {
              sticky: true,
              className: 'debug-polygon-tooltip',
            }
          );

          polygon.on('click', () => {
            console.log('Clicked Greenland zone:', zone.id, 'rulecardId:', zone.rulecardId);

            if (onRulecardSelect && zone.rulecardId) {
              onRulecardSelect(zone.rulecardId);
            }
          });
        });
      } catch (error) {
        console.error('❌ Greenland Sermersooq render error:', error);
      }
    };

    renderGreenlandSermersooq();
  }, [
    mapReady,
    regLayers?.enabled,
    regLayers?.regulatoryZonesEnabled,
    regLayers?.greenlandSermersooq,
    onRulecardSelect,
    activeAreaIds,
  ]);

  // Regulatory polygons general debug render
  useEffect(() => {
    if (!leafletMapRef.current || !regulatoryLayerRef.current || !protectedLayerRef.current) return;

    import('leaflet').then((L) => {
      const regulatoryLayer = regulatoryLayerRef.current;
      const protectedLayer = protectedLayerRef.current;

      regulatoryLayer.clearLayers();
      protectedLayer.clearLayers();

      regulatoryPolygonRefs.current = {};
      protectedPolygonRefs.current = {};

      const showDebugBorders = regLayers?.debugBorders ?? debugBordersVisible ?? false;
      if (regLayers && !regLayers.enabled) return;
      if (!showDebugBorders) return;

      const REG_BASE = {
        color: '#4FD1C5',
        weight: 1,
        opacity: 0.6,
        dashArray: '6 6',
        fill: false,
        fillOpacity: 0,
      };

      const REG_ACTIVE = {
        color: '#4FD1C5',
        weight: 2,
        opacity: 0.95,
        dashArray: undefined,
        fill: false,
        fillOpacity: 0,
      };

      const PROTECTED_BASE = {
        color: '#ef4444',
        fillColor: '#ef4444',
        weight: 2,
        opacity: 0.5,
        fillOpacity: 0.06,
      };

      const PROTECTED_ACTIVE = {
        color: '#ef4444',
        fillColor: '#ef4444',
        weight: 3,
        opacity: 0.75,
        fillOpacity: 0.12,
      };

      const shouldShowPolygon = (polygon: any): boolean => {
        if (!regLayers) return true;
        if (!regLayers.enabled) return false;

        if (
          polygon.id === 'TERRITORIAL_12NM' &&
          regLayers.bordersEnabled &&
          regLayers.territorialWaters12nm
        ) return true;

        if (
          polygon.id === 'CONTIGUOUS_24NM' &&
          regLayers.bordersEnabled &&
          regLayers.contiguousZone24nm
        ) return true;

        if (polygon.id === 'EEZ_200NM') return false;

        if (
          polygon.areaId === 'IMO_N60' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.imoN60
        ) return true;

        if (
          polygon.areaId === 'IMO_S60' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.imoS60
        ) return true;

        if (
          (polygon.id === 'BJORNOYA_12NM_POLYGON' || polygon.id === 'SPITSBERGEN_12NM_POLYGON') &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.svalbard12nm
        ) {
          return true;
        }

        if (
          polygon.id.startsWith('PROTECTED_') &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.svalbardProtectedAreas
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'greenlandSermersooq' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.greenlandSermersooq
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'greenlandProtectedAreas' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.greenlandProtectedAreas
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'greenlandLocalRestrictions' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.greenlandLocalRestrictions
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'canadaNordreg' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.canadaNordreg
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'canadaLancasterSound' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.canadaLancasterSound
        ) {
          return true;
        }

        if (
          polygon.layerKey === 'canadaNwpCorridor' &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.canadaNwpCorridor
        ) {
          return true;
        }

        if (
          polygon.id.includes('MARPOL') &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.marpolAreas
        ) return true;

        if (
          polygon.id.includes('SOLAS') &&
          regLayers.regulatoryZonesEnabled &&
          regLayers.solasZones
        ) return true;

        return false;
      };

      REGULATORY_POLYGONS.forEach((polygon) => {
        if (!shouldShowPolygon(polygon)) return;

        if (
          polygon.areaId === 'IMO_N60' ||
          polygon.layerKey === 'greenlandSermersooq' ||
          polygon.layerKey === 'greenlandProtectedAreas' ||
          polygon.layerKey === 'greenlandLocalRestrictions' ||
          polygon.layerKey === 'canadaNordreg' ||
          polygon.layerKey === 'canadaLancasterSound' ||
          polygon.layerKey === 'canadaNwpCorridor'
        ) {
          return;
        }

        const active = activeAreaIds.includes(polygon.areaId);
        const isProtected = polygon.id.startsWith('PROTECTED_');
        const isSvalbard12nm =
          polygon.id === 'BJORNOYA_12NM_POLYGON' || polygon.id === 'SPITSBERGEN_12NM_POLYGON';

        let style: any;

        if (
          polygon.layerKey === 'greenlandLocalRestrictions' ||
          polygon.layerKey === 'greenlandProtectedAreas' ||
          polygon.layerKey === 'greenlandSermersooq' ||
          polygon.areaId?.includes('AUGUST') ||
          polygon.areaId?.includes('SEPTEMBER') ||
          polygon.areaId?.includes('CLOSED')
        ) {
          style = getGreenlandZoneStyle(polygon, active);
        } else if (
          polygon.layerKey === 'canadaNordreg' ||
          polygon.layerKey === 'canadaLancasterSound' ||
          polygon.layerKey === 'canadaNwpCorridor'
        ) {
          style = getCanadaZoneStyle(polygon, active);
        } else if (isProtected) {
          style = active ? PROTECTED_ACTIVE : PROTECTED_BASE;
        } else if (isSvalbard12nm) {
          style = {
            color: '#000000',
            weight: 1,
            opacity: 0.8,
            dashArray: '5 5',
            fill: false,
            fillOpacity: 0,
          };
        } else {
          style = active ? REG_ACTIVE : REG_BASE;
        }

        const poly = L.polygon(
          polygon.coordinates.map(([lat, lng]) => [lat, lng]),
          { ...style, pane: 'vectorPane' }
        ).addTo(regulatoryLayer);

        regulatoryPolygonRefs.current[polygon.id] = poly;

        poly.bindTooltip(
          `<strong>${polygon.name}</strong><br/>Area ID: ${polygon.areaId}<br/>Status: ${
            active ? '🟢 ACTIVE' : '⚪ INACTIVE'
          }<br/>Trigger: ${polygon.triggerMode}${isProtected ? '<br/><br/>🖱️ <em>Click to view specific rules</em>' : ''}`,
          {
            sticky: true,
            className: 'debug-polygon-tooltip',
          }
        );

        if (isProtected && onProtectedAreaClick) {
          poly.on('click', (e: any) => {
            L.DomEvent.stopPropagation(e);
            onProtectedAreaClick(polygon.id);
          });

          poly.on('mouseover', function () {
            this.setStyle({
              fillOpacity: active ? 0.4 : 0.25,
              weight: 3,
            });
          });

          poly.on('mouseout', function () {
            this.setStyle(style);
          });
        }
      });

      if (!protectedAreasLoading && regLayers?.regulatoryZonesEnabled && regLayers?.svalbardProtectedAreas) {
        protectedAreas.forEach((area) => {
          try {
            const leafletCoords = convertGeoJSONToLeaflet(area.geometry);
            const active = false;
            const style = active ? PROTECTED_ACTIVE : PROTECTED_BASE;

            leafletCoords.forEach((ring) => {
              const poly = L.polygon(ring as any, { ...style, pane: 'vectorPane' }).addTo(protectedLayer);

              if (!protectedPolygonRefs.current[area.area_id]) {
                protectedPolygonRefs.current[area.area_id] = [];
              }
              protectedPolygonRefs.current[area.area_id].push(poly);

              poly.bindTooltip(
                `<strong>${area.name}</strong><br/>Type: ${area.area_type}<br/>Region: ${area.region}${
                  area.description ? `<br/><br/>${area.description}` : ''
                }<br/><br/>🖱️ <em>Click for regulations</em>`,
                {
                  sticky: true,
                  className: 'debug-polygon-tooltip',
                }
              );

              if (onProtectedAreaClick) {
                poly.on('click', (e: any) => {
                  L.DomEvent.stopPropagation(e);
                  onProtectedAreaClick(area.area_id);
                });

                poly.on('mouseover', function () {
                  this.setStyle({
                    fillOpacity: active ? 0.4 : 0.25,
                    weight: 3,
                  });
                });

                poly.on('mouseout', function () {
                  this.setStyle(style);
                });
              }
            });
          } catch (error) {
            console.error(`❌ Failed to render protected area ${area.name}:`, error);
          }
        });
      }
    });
  }, [
    debugBordersVisible,
    regLayers?.enabled,
    regLayers?.bordersEnabled,
    regLayers?.regulatoryZonesEnabled,
    regLayers?.territorialWaters12nm,
    regLayers?.contiguousZone24nm,
    regLayers?.eez200nm,
    regLayers?.imoN60,
    regLayers?.imoS60,
    regLayers?.svalbard12nm,
    regLayers?.svalbardProtectedAreas,
    regLayers?.greenlandExpanded,
    regLayers?.greenlandSermersooq,
    regLayers?.greenlandProtectedAreas,
    regLayers?.greenlandLocalRestrictions,
    regLayers?.canadaNordreg,
    regLayers?.canadaLancasterSound,
    regLayers?.canadaNwpCorridor,
    regLayers?.marpolAreas,
    regLayers?.solasZones,
    regLayers?.debugBorders,
    protectedAreas,
    protectedAreasLoading,
    activeAreaIds,
  ]);

  // Active route
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current || !routeLayerRef.current) return;

    import('leaflet').then((L) => {
      const routeLayer = routeLayerRef.current;
      routeLayer.clearLayers();

      if (!activeRoute) return;

      const waypoints = activeRoute.waypoints || [];
      const points: [number, number][] = waypoints
        .filter((wp) => typeof wp.lat === 'number' && typeof wp.lon === 'number')
        .map((wp) => [wp.lat, wp.lon]);

      if (points.length < 2) return;

      const line = L.polyline(points, {
        color: '#06b6d4',
        weight: 3,
        opacity: 0.85,
        pane: 'vectorPane',
        smoothFactor: 1,
      }).addTo(routeLayer);

      activeRouteLineRef.current = line;

      waypoints.forEach((wp) => {
        const m = L.circleMarker([wp.lat, wp.lon], {
          radius: 5,
          fillColor: '#06b6d4',
          color: '#0a1628',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.9,
          pane: 'markerPane',
        });
        m.bindTooltip(wp.name ?? `WP ${wp.seq}`, { direction: 'top' });
        m.addTo(routeLayer);
      });

      leafletMapRef.current.fitBounds(line.getBounds(), { padding: [60, 60] });
    });
  }, [mapReady, activeRoute]);

  // Vessel marker movement
  useEffect(() => {
    if (!leafletMapRef.current || !vesselMarkerRef.current) return;

    const map = leafletMapRef.current;
    vesselMarkerRef.current.setLatLng([vesselPosition.lat, vesselPosition.lng]);

    if (centerLocked && lockedPixelOffset) {
      const vesselPoint = map.latLngToContainerPoint([vesselPosition.lat, vesselPosition.lng]);
      const newCenterPoint = {
        x: vesselPoint.x - lockedPixelOffset.x,
        y: vesselPoint.y - lockedPixelOffset.y,
      };
      const newMapCenter = map.containerPointToLatLng([newCenterPoint.x, newCenterPoint.y]);

      map.panTo(newMapCenter, {
        animate: true,
        duration: 0.3,
        noMoveStart: true,
      });
    }
  }, [vesselPosition.lat, vesselPosition.lng, centerLocked, lockedPixelOffset]);

  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    if (centerLocked) {
      map.setView([vesselPosition.lat, vesselPosition.lng], map.getZoom(), {
        animate: false,
        duration: 0,
      });

      const mapCenter = map.getCenter();
      const mapCenterPoint = map.latLngToContainerPoint(mapCenter);
      const vesselPoint = map.latLngToContainerPoint([vesselPosition.lat, vesselPosition.lng]);

      setLockedPixelOffset({
        x: vesselPoint.x - mapCenterPoint.x,
        y: vesselPoint.y - mapCenterPoint.y,
      });
    } else {
      setLockedPixelOffset(null);
    }
  }, [centerLocked, vesselPosition.lat, vesselPosition.lng]);

  // Scale / overlay status
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;

    const map = leafletMapRef.current;

    const refresh = () => {
      if (isUnmountingRef.current) return;
      const zoom = map.getZoom();
      setOverlayStatus(computeOverlayStatus(vesselPosition.lat, vesselPosition.lng, zoom));
      setScaleData(computeScaleAndNm(map));
      setCurrentZoom(zoom);
    };

    refresh();

    map.on('zoomend', refresh);
    map.on('moveend', refresh);
    map.on('resize', refresh);

    return () => {
      map.off('zoomend', refresh);
      map.off('moveend', refresh);
      map.off('resize', refresh);
    };
  }, [mapReady, vesselPosition.lat, vesselPosition.lng]);

  // Polar + overlay toggles
  useEffect(() => {
    if (!leafletMapRef.current || !polarLayerRef.current || isUnmountingRef.current) return;

    const map = leafletMapRef.current;
    const polarLayer = polarLayerRef.current;
    polarLayer.clearLayers();

    const shouldShowArcticLayers =
      arcticPolarVisible &&
      !!regLayers &&
      regLayers.enabled &&
      regLayers.regulatoryZonesEnabled &&
      regLayers.imoN60;

    if (shouldShowArcticLayers) {
      arcticPolarLayersRef.current.forEach((layer) => layer.addTo(polarLayer));
    }

    const shouldShowAntarcticLayers =
      antarcticPolarVisible &&
      !!regLayers &&
      regLayers.enabled &&
      regLayers.regulatoryZonesEnabled &&
      regLayers.imoS60;

    if (shouldShowAntarcticLayers) {
      antarcticPolarLayersRef.current.forEach((layer) => layer.addTo(polarLayer));
    }

    const desiredVisibility: Record<OverlayId, boolean> = {
      openseamap_seamarks: openSeaMapLayer,
      kartverket_sjokart: fiskeridirLayer,
      tss_lanes: tssLayer,
      weather_clouds: weatherLayer === 'clouds',
      weather_precipitation: weatherLayer === 'precipitation',
      weather_wind: weatherLayer === 'wind',
      weather_temperature: weatherLayer === 'temperature',
    };

    (Object.keys(OVERLAY_REGISTRY) as OverlayId[]).forEach((id) => {
      const layer = overlayLayersRef.current[id];
      const st = overlayStatus[id];
      if (!layer || !st) return;

      const shouldBeOn = desiredVisibility[id] && st.activeAllowed;

      try {
        if (shouldBeOn) {
          if (!map.hasLayer(layer)) {
            layer.addTo(map);
            if (id.startsWith('weather_')) {
              setWeatherDebugInfo({ layer: id, loading: false, error: false, added: true });
            }
          }
        } else {
          if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            if (id.startsWith('weather_')) {
              setWeatherDebugInfo({ layer: 'none', loading: false, error: false, added: false });
            }
          }
        }
      } catch (error) {
        console.error(`Error toggling overlay ${id}:`, error);
        if (id.startsWith('weather_')) {
          setWeatherDebugInfo({ layer: id, loading: false, error: true, added: false });
        }
      }
    });
  }, [regLayers, openSeaMapLayer, fiskeridirLayer, tssLayer, weatherLayer, overlayStatus, mapReady, arcticPolarVisible, antarcticPolarVisible]);

  // Basemap switch
  useEffect(() => {
    if (!leafletMapRef.current || !mapReady || isUnmountingRef.current) return;

    const map = leafletMapRef.current;
    const bathymetryLayerRef = (map as any)._bathymetryLayer;
    const geographicLayerRef = (map as any)._geographicLayer;
    const geographicLabelsLayerRef = (map as any)._geographicLabelsLayer;

    if (!bathymetryLayerRef || !geographicLayerRef || !geographicLabelsLayerRef) return;

    try {
      if (basemapType === 'ocean') {
        if (!map.hasLayer(bathymetryLayerRef)) bathymetryLayerRef.addTo(map);
        if (map.hasLayer(geographicLayerRef)) map.removeLayer(geographicLayerRef);
        if (map.hasLayer(geographicLabelsLayerRef)) map.removeLayer(geographicLabelsLayerRef);
      } else {
        if (map.hasLayer(bathymetryLayerRef)) map.removeLayer(bathymetryLayerRef);
        if (!map.hasLayer(geographicLayerRef)) geographicLayerRef.addTo(map);
        if (!map.hasLayer(geographicLabelsLayerRef)) geographicLabelsLayerRef.addTo(map);
      }
    } catch (error) {
      console.error('Error switching basemap:', error);
    }
  }, [basemapType, mapReady]);

  // Relative center click logic
  useEffect(() => {
    if (!leafletMapRef.current) return;
    const map = leafletMapRef.current;

    const handleRelativeClick = async (e: any) => {
      if (!isSettingRelativeCenter || isUnmountingRef.current) return;

      setRelativeCenter(e.latlng);
      setIsSettingRelativeCenter(false);

      if (relativeCenterMarkerRef.current) {
        try {
          map.removeLayer(relativeCenterMarkerRef.current);
        } catch {}
      }

      const L = await import('leaflet');
      const markerGroup = L.layerGroup();

      L.circleMarker(e.latlng, {
        radius: 12,
        fillColor: '#ffcc99',
        color: '#0a1628',
        weight: 1,
        opacity: 0.4,
        fillOpacity: 0.1,
        interactive: false,
        pane: 'markerPane',
      }).addTo(markerGroup);

      L.circleMarker(e.latlng, {
        radius: 6,
        fillColor: '#ffcc99',
        color: '#0a1628',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
        interactive: false,
        pane: 'markerPane',
      }).addTo(markerGroup);

      const crosshairIcon = L.divIcon({
        className: 'relative-center-crosshair',
        html: `
          <svg width="20" height="20" viewBox="0 0 20 20" style="position: absolute; top: -10px; left: -10px;">
            <line x1="10" y1="4" x2="10" y2="8" stroke="#ffcc99" stroke-width="2" />
            <line x1="10" y1="12" x2="10" y2="16" stroke="#ffcc99" stroke-width="2" />
            <line x1="4" y1="10" x2="8" y2="10" stroke="#ffcc99" stroke-width="2" />
            <line x1="12" y1="10" x2="16" y2="10" stroke="#ffcc99" stroke-width="2" />
          </svg>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      L.marker(e.latlng, {
        icon: crosshairIcon,
        interactive: false,
        pane: 'markerPane',
      }).addTo(markerGroup);

      markerGroup.addTo(map);
      relativeCenterMarkerRef.current = markerGroup;
    };

    if (isSettingRelativeCenter) {
      map.on('click', handleRelativeClick);
    }

    return () => {
      map.off('click', handleRelativeClick);
    };
  }, [isSettingRelativeCenter]);

  // Vessel icon rotation update
  useEffect(() => {
    if (!vesselMarkerRef.current) return;

    import('leaflet').then((L) => {
      const strokeColor = displayMode === 'night' ? '#fb923c' : '#0a1628';
      const strokeWidth = displayMode === 'night' ? '4' : '2';
      const fillColor = displayMode === 'night' ? '#fb923c' : '#34d399';

      const glowFilter =
        displayMode === 'night'
          ? `<filter id="glow"><feGaussianBlur stdDeviation="2.5" result="coloredBlur"/><feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`
          : '';

      const filterAttr = displayMode === 'night' ? 'filter="url(#glow)"' : '';

      const vesselIcon = L.divIcon({
        className: 'vessel-marker',
        html: `
          <div style="position: relative; width: 40px; height: 40px;">
            <svg width="40" height="40" viewBox="0 0 40 40" style="position:absolute;top:50%;left:50%;transform:translate(-50%, -50%) rotate(${vesselHeading}deg);">
              <defs>${glowFilter}</defs>
              <path d="M20 8 L28 28 L20 24 L12 28 Z"
                    fill="${fillColor}"
                    stroke="${strokeColor}"
                    stroke-width="${strokeWidth}"
                    stroke-linejoin="miter"
                    ${filterAttr} />
            </svg>
            <div style="position:absolute;top:-4px;left:-4px;right:-4px;bottom:-4px;background:rgba(52,211,153,0.2);border-radius:50%;animation:pulse 2s infinite;"></div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      vesselMarkerRef.current.setIcon(vesselIcon);
    });
  }, [vesselHeading, displayMode]);

  // AIS toggle
  useEffect(() => {
    if (!aisLayerRef.current) return;
    const aisLayer = aisLayerRef.current;

    if (aisEnabled) {
      aisLayer.eachLayer(() => {});
    } else {
      aisLayer.clearLayers();
      import('leaflet').then((L) => {
        if (!aisEnabled) return;
        MOCK_AIS_VESSELS.forEach((vessel) => {
          const aisIcon = L.divIcon({
            className: 'ais-vessel-icon',
            html: `
              <div style="transform: rotate(${vessel.heading}deg); width: 24px; height: 24px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2 L4 20 L12 16 L20 20 Z" fill="${vessel.speed > 0 ? '#10b981' : '#ef4444'}" stroke="#1e293b" stroke-width="1.5"/>
                </svg>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          L.marker([vessel.lat, vessel.lng], {
            icon: aisIcon,
            pane: 'markerPane',
          }).addTo(aisLayer);
        });
      });
    }
  }, [aisEnabled]);

  // Cursor line
  useEffect(() => {
    if (!leafletMapRef.current || isUnmountingRef.current) return;
    const map = leafletMapRef.current;

    import('leaflet').then((L) => {
      if (!cursorPosition || !cursorBoxVisible) {
        if (cursorLineRef.current) {
          try {
            map.removeLayer(cursorLineRef.current);
          } catch {}
          cursorLineRef.current = null;
        }
        return;
      }

      const lineCoords: [number, number][] = [
        [vesselPosition.lat, vesselPosition.lng],
        [cursorPosition.lat, cursorPosition.lng],
      ];

      if (cursorLineRef.current) {
        cursorLineRef.current.setLatLngs(lineCoords);
      } else {
        cursorLineRef.current = L.polyline(lineCoords, {
          color: '#06b6d4',
          weight: 1.5,
          opacity: 0.6,
          dashArray: '4, 6',
          interactive: false,
          pane: 'vectorPane',
        }).addTo(map);
      }
    });
  }, [cursorPosition, vesselPosition.lat, vesselPosition.lng, cursorBoxVisible]);

  // Display mode filter
  useEffect(() => {
    if (!mapRef.current) return;

    let filterValue = 'none';
    let opacityValue = '1';

    switch (displayMode) {
      case 'day':
        filterValue = 'none';
        opacityValue = '1';
        break;
      case 'dusk':
        filterValue = 'brightness(0.6) contrast(1.1)';
        opacityValue = '0.9';
        break;
      case 'night':
        filterValue = 'brightness(0.3) contrast(1.2) saturate(0.3) sepia(0.5) hue-rotate(-10deg)';
        opacityValue = '0.8';
        break;
    }

    mapRef.current.style.filter = filterValue;
    mapRef.current.style.opacity = opacityValue;
  }, [displayMode]);

  // Course predictor
  useEffect(() => {
    if (!leafletMapRef.current || isUnmountingRef.current) return;
    const map = leafletMapRef.current;

    import('leaflet').then((L) => {
      if (!coursePredictorVisible || vesselSpeed === 0) {
        if (coursePredictorLineRef.current) {
          try {
            map.removeLayer(coursePredictorLineRef.current);
          } catch {}
          coursePredictorLineRef.current = null;
        }
        if (coursePredictorMarkerRef.current) {
          try {
            map.removeLayer(coursePredictorMarkerRef.current);
          } catch {}
          coursePredictorMarkerRef.current = null;
        }
        return;
      }

      const calculatePosition = (minutes: number) => {
        const timeHours = minutes / 60;
        const distanceNM = vesselSpeed * timeHours;
        const R = 3440.065;
        const bearingRad = (vesselCourse * Math.PI) / 180;
        const lat1 = (vesselPosition.lat * Math.PI) / 180;
        const lng1 = (vesselPosition.lng * Math.PI) / 180;
        const angularDistance = distanceNM / R;

        const lat2 = Math.asin(
          Math.sin(lat1) * Math.cos(angularDistance) +
            Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
        );

        const lng2 =
          lng1 +
          Math.atan2(
            Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
            Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
          );

        return {
          lat: (lat2 * 180) / Math.PI,
          lng: (lng2 * 180) / Math.PI,
          distanceNM,
        };
      };

      const finalPos = calculatePosition(coursePredictorMinutes);
      const lineColor = displayMode === 'night' ? '#fb923c' : '#10b981';
      const markerColor = displayMode === 'night' ? '#fb923c' : '#10b981';

      const lineCoords: [number, number][] = [
        [vesselPosition.lat, vesselPosition.lng],
        [finalPos.lat, finalPos.lng],
      ];

      if (coursePredictorLineRef.current) {
        coursePredictorLineRef.current.setLatLngs(lineCoords);
        coursePredictorLineRef.current.setStyle({ color: lineColor });
      } else {
        coursePredictorLineRef.current = L.polyline(lineCoords, {
          color: lineColor,
          weight: 2,
          opacity: 0.8,
          interactive: false,
          pane: 'vectorPane',
        }).addTo(map);
      }

      if (coursePredictorMarkerRef.current) {
        try {
          map.removeLayer(coursePredictorMarkerRef.current);
        } catch {}
      }

      const markerGroup = L.layerGroup();

      let interval = 3;
      if (coursePredictorMinutes > 30) interval = 15;
      else if (coursePredictorMinutes > 15) interval = 6;

      for (let t = interval; t <= coursePredictorMinutes; t += interval) {
        const pos = calculatePosition(t);
        const perpAngle = ((vesselCourse + 90) * Math.PI) / 180;
        const tickLength = 0.0005;

        const tickStart = {
          lat: pos.lat - tickLength * Math.sin(perpAngle),
          lng: pos.lng - tickLength * Math.cos(perpAngle),
        };
        const tickEnd = {
          lat: pos.lat + tickLength * Math.sin(perpAngle),
          lng: pos.lng + tickLength * Math.cos(perpAngle),
        };

        L.polyline(
          [
            [tickStart.lat, tickStart.lng],
            [tickEnd.lat, tickEnd.lng],
          ],
          {
            color: markerColor,
            weight: 2,
            opacity: 0.8,
            interactive: false,
            pane: 'vectorPane',
          }
        ).addTo(markerGroup);

        const labelIcon = L.divIcon({
          className: 'predictor-time-label',
          html: `<div style="color: ${markerColor}; font-size: 9px; font-family: monospace; font-weight: 700; text-shadow: 0 0 3px rgba(0,0,0,0.8);">${t}</div>`,
          iconSize: [20, 10],
          iconAnchor: [-8, 5],
        });

        L.marker([pos.lat, pos.lng], {
          icon: labelIcon,
          interactive: false,
          pane: 'vectorPane',
        }).addTo(markerGroup);
      }

      const arrowIcon = L.divIcon({
        className: 'predictor-arrow',
        html: `
          <svg width="16" height="16" viewBox="0 0 16 16" style="transform: rotate(${vesselCourse}deg);">
            <path d="M8 2 L12 10 L8 8 L4 10 Z" fill="${markerColor}" stroke="#0a1628" stroke-width="1"/>
          </svg>
        `,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      L.marker([finalPos.lat, finalPos.lng], {
        icon: arrowIcon,
        interactive: false,
        pane: 'vectorPane',
      }).addTo(markerGroup);

      markerGroup.addTo(map);
      coursePredictorMarkerRef.current = markerGroup;
    });
  }, [
    coursePredictorVisible,
    coursePredictorMinutes,
    vesselPosition.lat,
    vesselPosition.lng,
    vesselSpeed,
    vesselCourse,
    displayMode,
    vesselHeading,
  ]);

  // Set & drift
  useEffect(() => {
    if (!leafletMapRef.current || isUnmountingRef.current) return;
    const map = leafletMapRef.current;

    import('leaflet').then((L) => {
      if (!setDriftVisible || vesselSpeed === 0 || vesselHeading === vesselCourse) {
        if (setDriftLineRef.current) {
          try {
            map.removeLayer(setDriftLineRef.current);
          } catch {}
          setDriftLineRef.current = null;
        }
        return;
      }

      let driftAngle = vesselCourse - vesselHeading;
      while (driftAngle > 180) driftAngle -= 360;
      while (driftAngle < -180) driftAngle += 360;

      const timeHours = 6 / 60;
      const distanceNM = vesselSpeed * timeHours;
      const R = 3440.065;
      const headingRad = (vesselHeading * Math.PI) / 180;
      const lat1 = (vesselPosition.lat * Math.PI) / 180;
      const lng1 = (vesselPosition.lng * Math.PI) / 180;
      const angularDistance = distanceNM / R;

      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(angularDistance) +
          Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(headingRad)
      );

      const lng2 =
        lng1 +
        Math.atan2(
          Math.sin(headingRad) * Math.sin(angularDistance) * Math.cos(lat1),
          Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
        );

      const headingEndLat = (lat2 * 180) / Math.PI;
      const headingEndLng = (lng2 * 180) / Math.PI;
      const driftColor = displayMode === 'night' ? '#fbbf24' : '#f59e0b';

      const lineCoords: [number, number][] = [
        [vesselPosition.lat, vesselPosition.lng],
        [headingEndLat, headingEndLng],
      ];

      if (setDriftLineRef.current) {
        setDriftLineRef.current.setLatLngs(lineCoords);
        setDriftLineRef.current.setStyle({ color: driftColor });
      } else {
        setDriftLineRef.current = L.polyline(lineCoords, {
          color: driftColor,
          weight: 2,
          opacity: 0.7,
          dashArray: '6, 4',
          interactive: false,
          pane: 'vectorPane',
        }).addTo(map);

        setDriftLineRef.current.bindTooltip(
          `Drift: ${driftAngle > 0 ? '+' : ''}${driftAngle.toFixed(1)}°<br>Heading: ${vesselHeading}°`,
          {
            permanent: false,
            direction: 'top',
            className: 'drift-vector-tooltip',
            sticky: true,
          }
        );
      }
    });
  }, [setDriftVisible, vesselPosition.lat, vesselPosition.lng, vesselSpeed, vesselHeading, vesselCourse, displayMode]);

  // Drawing visualization
  useEffect(() => {
    if (!mapReady || !drawLayerRef.current) return;

    import('leaflet').then((L) => {
      const drawLayer = drawLayerRef.current;
      drawLayer.clearLayers();

      if (isDrawingZone && drawingPoints && drawingPoints.length > 0) {
        drawingPoints.forEach((point, index) => {
          const marker = L.circleMarker([point[0], point[1]], {
            radius: 8,
            fillColor: '#06b6d4',
            fillOpacity: 0.8,
            color: '#fff',
            weight: 2,
            pane: 'overlayPane',
          }).addTo(drawLayer);

          marker.bindTooltip(`${index + 1}`, {
            permanent: true,
            direction: 'center',
            className: 'zone-drawing-label',
            offset: [0, 0],
          });
        });

        if (drawingPoints.length >= 2) {
          const options = {
            color: '#06b6d4',
            weight: 3,
            opacity: 0.8,
            fillColor: '#06b6d4',
            fillOpacity: 0.15,
            dashArray: '10, 10',
            pane: 'overlayPane',
          };

          if (drawingPoints.length >= 3) {
            L.polygon(drawingPoints, options).addTo(drawLayer);
          } else {
            L.polyline(drawingPoints, options).addTo(drawLayer);
          }
        }
      }
    });
  }, [mapReady, isDrawingZone, drawingPoints]);

  // Custom zones
  useEffect(() => {
    if (!mapReady || !customZoneLayerRef.current) return;

    import('leaflet').then((L) => {
      const customZoneLayer = customZoneLayerRef.current;
      customZoneLayer.clearLayers();

      customZones.forEach((zone) => {
        if (zone.status !== 'ACTIVE' || zone.coordinates.length < 3) return;

        const polygon = L.polygon(zone.coordinates, {
          color: zone.color,
          weight: 2,
          opacity: 0.8,
          fillColor: zone.color,
          fillOpacity: 0.2,
          pane: 'overlayPane',
        }).addTo(customZoneLayer);

        const bounds = polygon.getBounds();
        const center = bounds.getCenter();

        L.marker([center.lat, center.lng], {
          icon: L.divIcon({
            className: 'custom-zone-label',
            html: `<div style="
              background: ${zone.color}dd;
              color: white;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 1px solid rgba(255,255,255,0.2);
            ">${zone.name}</div>`,
            iconSize: [0, 0],
          }),
          pane: 'overlayPane',
        }).addTo(customZoneLayer);

        polygon.on('click', () => {
          console.log('🖱️ Custom zone clicked:', zone.name);
        });
      });
    });
  }, [mapReady, customZones]);

  // Zone crossing points
  useEffect(() => {
    if (!mapReady || !alertLayerRef.current) {
      console.log('🚨 alertLayer not ready', {
        mapReady,
        hasAlertLayer: !!alertLayerRef.current,
      });
      return;
    }

    import('leaflet').then((L) => {
      const alertLayer = alertLayerRef.current;
      alertLayer.clearLayers();

      console.log('🚨 zoneCrossingPoints received:', zoneCrossingPoints);

      if (!zoneCrossingPoints || zoneCrossingPoints.length === 0) {
        console.log('🚨 No zone crossing points to render');
        return;
      }

      zoneCrossingPoints.forEach((event, index) => {
        console.log(`🚨 Rendering crossing ${index}:`, event);

        const color = event.crossingType === 'ENTRY' ? '#22c55e' : '#ef4444';

        const marker = L.circleMarker([event.lat, event.lon], {
          radius: 5,
          weight: 2,
          color,
          fillColor: color,
          fillOpacity: 0.85,
          pane: 'markerPane',
        }).addTo(alertLayer);

        marker.bindTooltip(
          `<strong>${event.crossingType}</strong><br/>${event.zoneName}<br/>Leg ${event.legIndex + 1}<br/>${event.distanceFromLegStartNm.toFixed(2)} NM`,
          {
            sticky: true,
            className: 'debug-polygon-tooltip',
          }
        );
      });

      console.log('🚨 Zone crossings rendered:', zoneCrossingPoints.length);
    });
  }, [mapReady, zoneCrossingPoints]);

  // Zone drawing click handling
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!mapReady || !map) return;

    const clickHandler = (e: any) => {
      if (isDrawingZone && onMapClick) {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      }
    };

    map.on('click', clickHandler);
    return () => {
      map.off('click', clickHandler);
    };
  }, [mapReady, isDrawingZone, onMapClick]);

  return (
    <div className="absolute inset-0 bg-[#0a1628] z-0">
  <div
    ref={mapRef}
    className="absolute inset-0 w-full h-full"
    style={{
      cursor: 'grab',
      zIndex: 1,
    }}
  />

      {mapReady && leafletMapRef.current && (
        <WindArrows
          map={leafletMapRef.current}
          visible={weatherLayer === 'wind'}
          apiKey="760cf2d2d93195c3aba357fb72093036"
        />
      )}

      {cursorBoxVisible && (
        <div
          className="absolute z-[1001] pointer-events-auto"
          style={{
            left: `${navPosition.x}px`,
            top: `${navPosition.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab',
            minWidth: '180px',
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="px-3 py-2 bg-slate-900/98 backdrop-blur-md border-2 border-cyan-500/40 rounded shadow-2xl select-none">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="text-[9px] text-cyan-300 uppercase tracking-wide font-bold">CURSOR</div>
            </div>

            {cursorPosition ? (
              <div className="space-y-0.5">
                <div className="text-[9px] text-slate-200 font-mono">
                  {formatDMS(cursorPosition.lat, cursorPosition.lng)}
                </div>
                <div className="text-[9px] text-cyan-400 font-mono">
                  BRG{' '}
                  {calculateBearing(
                    vesselPosition.lat,
                    vesselPosition.lng,
                    cursorPosition.lat,
                    cursorPosition.lng
                  )
                    .toFixed(0)
                    .padStart(3, '0')}
                  °T
                </div>
                <div className="text-[9px] text-emerald-400 font-mono">
                  RNG {calculateDistance(vesselPosition.lat, vesselPosition.lng, cursorPosition.lat, cursorPosition.lng).toFixed(2)} NM
                </div>
              </div>
            ) : (
              <div className="text-[9px] text-slate-400 font-mono">Move cursor over map</div>
            )}
          </div>
        </div>
      )}

      <div className="absolute top-28 right-10 pointer-events-none z-10">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="49" fill="rgba(10, 22, 40, 0.9)" stroke="#1e4d6b" strokeWidth="0.8" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="#2d5a7e" strokeWidth="0.6" />
            <line x1="50" y1="5" x2="50" y2="18" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="50" y1="82" x2="50" y2="95" stroke="#5a9fb8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="50" x2="18" y2="50" stroke="#5a9fb8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="82" y1="50" x2="95" y2="50" stroke="#5a9fb8" strokeWidth="1.5" strokeLinecap="round" />
            <text x="50" y="14" textAnchor="middle" fill="#06b6d4" fontSize="14" fontWeight="bold">
              N
            </text>
            <text x="50" y="95" textAnchor="middle" fill="#5a9fb8" fontSize="10">
              S
            </text>
            <text x="12" y="55" textAnchor="middle" fill="#5a9fb8" fontSize="10">
              W
            </text>
            <text x="88" y="55" textAnchor="middle" fill="#5a9fb8" fontSize="10">
              E
            </text>
            <circle cx="50" cy="50" r="2" fill="#06b6d4" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="absolute bottom-10 -left-4 pointer-events-none z-20">
        <ScaleWidget zoom={currentZoom} displayMode={displayMode} />
      </div>

      <div className="absolute top-6 right-10 pointer-events-none z-[5]">
        <div className="px-4 py-3 bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-lg shadow-xl">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Basemap Source</div>
          {basemapType === 'ocean' ? (
            <>
              <div className="text-[11px] text-cyan-400 font-medium">EMODnet Bathymetry</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Marine bathymetry</div>
            </>
          ) : (
            <>
              <div className="text-[11px] text-cyan-400 font-medium">CARTO Dark</div>
              <div className="text-[9px] text-slate-500 mt-0.5">Dark geographic basemap</div>
            </>
          )}

          {fiskeridirLayer && (
            <>
              <div className="my-2 border-t border-slate-700/50" />
              <div className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Map Overlay Active
              </div>
              <div className="text-[9px] text-slate-400">Kartverket Sjøkart</div>
              <div className="text-[8px] text-slate-500 mt-0.5">National authority • Region-specific</div>
            </>
          )}
        </div>
      </div>

      <div className="absolute bottom-6 right-10 pointer-events-none z-10">
        <div className="px-3 py-1.5 bg-slate-900/70 backdrop-blur-sm border border-slate-700/40 rounded text-center">
          <div className="text-[9px] text-slate-500 uppercase tracking-wide">Illustrative Display • Not for Navigation</div>
        </div>
      </div>

      <MapControls
        onZoomIn={() => leafletMapRef.current?.zoomIn()}
        onZoomOut={() => leafletMapRef.current?.zoomOut()}
        onCenterShip={() =>
          leafletMapRef.current?.setView([vesselPosition.lat, vesselPosition.lng], leafletMapRef.current.getZoom())
        }
        onSetRelativeCenter={() => setIsSettingRelativeCenter(true)}
        isSettingRelativeCenter={isSettingRelativeCenter}
        hasRelativeCenter={relativeCenter !== null}
        centerLocked={centerLocked}
        onToggleCenterLock={() => setCenterLocked(!centerLocked)}
        onClearRelativeCenter={() => {
          const map = leafletMapRef.current;
          setRelativeCenter(null);
          if (relativeCenterMarkerRef.current && map) {
            try {
              map.removeLayer(relativeCenterMarkerRef.current);
            } catch {}
            relativeCenterMarkerRef.current = null;
          }
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.3);
          }
        }

        .leaflet-container {
          background: #0a1628 !important;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .leaflet-control-zoom {
          border: 1px solid rgba(71, 85, 105, 0.6) !important;
          border-radius: 0.5rem !important;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
        }

        .leaflet-control-zoom a {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(12px);
          color: #94a3b8 !important;
          border: none !important;
          width: 48px !important;
          height: 48px !important;
          line-height: 48px !important;
          font-size: 20px !important;
          transition: all 0.2s !important;
        }

        .leaflet-control-zoom a:hover {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #06b6d4 !important;
        }

        .leaflet-control-scale {
          background: rgba(15, 23, 42, 0.95) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(71, 85, 105, 0.6) !important;
          border-radius: 0.5rem !important;
          padding: 8px 12px !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1) !important;
        }

        .leaflet-control-scale-line {
          border: 2px solid #06b6d4 !important;
          border-top: none !important;
          color: #06b6d4 !important;
          font-family: ui-monospace, monospace !important;
          font-size: 11px !important;
          font-weight: 500 !important;
          line-height: 1.5 !important;
          padding: 2px 5px 1px !important;
          background: rgba(6, 182, 212, 0.1) !important;
        }

        .leaflet-control-attribution {
          background: rgba(15, 23, 42, 0.8) !important;
          backdrop-filter: blur(8px);
          color: #64748b !important;
          font-size: 9px !important;
          padding: 4px 8px !important;
          border-radius: 0.25rem !important;
        }

        .leaflet-control-attribution a {
          color: #06b6d4 !important;
        }

        .leaflet-popup-content-wrapper {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(52, 211, 153, 0.4) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.3) !important;
        }

        .leaflet-popup-tip {
          background: rgba(15, 23, 42, 0.98) !important;
          border: 1px solid rgba(52, 211, 153, 0.4) !important;
        }

        .vessel-marker {
          background: transparent !important;
          border: none !important;
        }

        .leaflet-tooltip {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(6, 182, 212, 0.5) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
          color: #06b6d4 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 6px 12px !important;
        }

        .leaflet-tooltip:before {
          border-top-color: rgba(15, 23, 42, 0.98) !important;
        }

        .polar-code-tooltip {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(6, 182, 212, 0.5) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
          color: #06b6d4 !important;
          font-family: system-ui, -apple-system, sans-serif !important;
          font-size: 12px !important;
          font-weight: 600 !important;
          padding: 6px 12px !important;
        }

        .polar-code-tooltip:before {
          border-top-color: rgba(15, 23, 42, 0.98) !important;
        }

        .relative-center-crosshair {
          background: transparent !important;
          border: none !important;
          pointer-events: none !important;
        }

        .drift-vector-tooltip {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(245, 158, 11, 0.6) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
          color: #f59e0b !important;
          font-family: ui-monospace, monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          padding: 4px 10px !important;
          text-align: center !important;
        }

        .drift-vector-tooltip:before {
          border-top-color: rgba(15, 23, 42, 0.98) !important;
        }

        .wind-arrow-icon {
          background: transparent !important;
          border: none !important;
        }

        .wind-tooltip {
          background: rgba(15, 23, 42, 0.98) !important;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(6, 182, 212, 0.6) !important;
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3) !important;
          padding: 0 !important;
        }

        .zone-drawing-label {
          background: rgba(6, 182, 212, 0.9) !important;
          border: none !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4) !important;
          color: white !important;
          font-family: ui-monospace, monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          padding: 0 !important;
          width: 16px !important;
          height: 16px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        .zone-drawing-label:before {
          display: none !important;
        }
      `}</style>
    </div>
  );
}