// Geographic trigger system - connects polygons to compliance rules

import { getRulesForArea, RULECARD_REGISTRY } from './ruleCards';
import type { RuleCard } from '../types/ruleCard';
import { TERRITORIAL_POLYGONS } from './polygons/territorial';
import { GREENLAND_SERMERSOOQ_POLYGONS } from './polygons/greenlandSermersooq';
import { GREENLAND_LOCAL_RESTRICTION_POLYGONS } from './polygons/greenlandLocalRestrictions';
import { GREENLAND_PROTECTED_POLYGONS } from './polygons/greenlandProtected';
import { booleanPointInPolygon } from '@turf/boolean-point-in-polygon';
import { polygon as turfPolygon, point as turfPoint } from '@turf/helpers';

export type LatLng = [number, number]; // [lat, lng]
export type LatLngObject = { lat: number; lng: number };

export type RegulatorySourceType =
  | 'imo'
  | 'national_law'
  | 'municipal_zone_proposal'
  | 'advisory';

export type RegulatoryLayerKey =
  | 'territorialWaters12nm'
  | 'contiguousZone24nm'
  | 'eez200nm'
  | 'imoN60'
  | 'imoS60'
  | 'svalbard12nm'
  | 'svalbardProtectedAreas'
  | 'greenlandSermersooq'
  | 'greenlandProtectedAreas'
  | 'greenlandLocalRestrictions'
  | 'marpolAreas'
  | 'solasZones';

export type RegulatoryCategory =
  | 'border'
  | 'protected'
  | 'regulatory'
  | 'proposal';

export type ZoneBehavior =
  | 'closed'
  | 'restricted'
  | 'advisory'
  | 'seasonal'
  | 'local_guide_required'
  | 'landing_restriction'
  | 'vessel_limit';

export interface RegulatoryPolygon {
  id: string;
  name: string;
  areaId: string;
  triggerMode: 'inside' | 'outside' | 'crossing';
  coordinates: LatLng[];
  useTurf?: boolean;

  sourceType?: RegulatorySourceType;
  rulecardId?: string | null;
  layerKey?: RegulatoryLayerKey;
  category?: RegulatoryCategory;
  behavior?: ZoneBehavior;
}

/**
 * Normalize longitude to [0, 360)
 */
function to360(lng: number): number {
  const x = lng % 360;
  return x < 0 ? x + 360 : x;
}

/**
 * Detect likely dateline crossing
 */
function polygonCrossesDateline(poly: LatLng[]): boolean {
  if (poly.length < 3) return false;
  const lngs = poly.map(([, lng]) => lng);
  const min = Math.min(...lngs);
  const max = Math.max(...lngs);
  return max - min > 180;
}

/**
 * Classic ray casting point-in-polygon
 * Assumes same longitude space for point and polygon
 */
function pointInPolyRayCast(point: LatLng, polygon: LatLng[]): boolean {
  const [lat, lng] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];

    const intersects =
      (lngI > lng) !== (lngJ > lng) &&
      lat < ((latJ - latI) * (lng - lngI)) / ((lngJ - lngI) || 1e-12) + latI;

    if (intersects) inside = !inside;
  }

  return inside;
}

/**
 * Generic point-in-polygon with dateline handling
 */
export function isPointInPolygon(point: LatLng, polygon: LatLng[]): boolean {
  if (polygon.length < 3) return false;

  if (polygonCrossesDateline(polygon)) {
    const p360: LatLng = [point[0], to360(point[1])];
    const poly360: LatLng[] = polygon.map(([la, ln]) => [la, to360(ln)]);
    return pointInPolyRayCast(p360, poly360);
  }

  return pointInPolyRayCast(point, polygon);
}

/**
 * Turf expects [lng, lat]
 */
export function isPointInPolygonTurf(point: LatLng, polygon: LatLng[]): boolean {
  if (polygon.length < 3) return false;

  try {
    const ring = polygon.map(([lat, lng]) => [lng, lat]);

    const first = ring[0];
    const last = ring[ring.length - 1];
    const closedRing =
      first[0] === last[0] && first[1] === last[1]
        ? ring
        : [...ring, first];

    const geoPoint = turfPoint([point[1], point[0]]);
    const geoPoly = turfPolygon([closedRing]);

    return booleanPointInPolygon(geoPoint, geoPoly);
  } catch (error) {
    console.error('Turf.js point-in-polygon error:', error);
    return isPointInPolygon(point, polygon);
  }
}

function shouldActivate(
  triggerMode: RegulatoryPolygon['triggerMode'],
  isInside: boolean
): boolean {
  if (triggerMode === 'inside') return isInside;
  if (triggerMode === 'outside') return !isInside;
  return isInside;
}

// =====================
// IMO N60 CLEAN SOLUTION
// =====================

/**
 * This is ONLY for drawing on map.
 * West -> east ordered to avoid ugly zig-zag display.
 */
export const IMO_N60_VISUALIZATION_SEGMENTS: LatLng[][] = [
  [
    [60.0, -169.0],
    [60.0, -140.0],
    [60.0, -100.0],
    [60.0, -60.0],
    [58.0, -42.0],
    [64.616667, -35.45],
    [67.065, -26.556667],
    [70.826667, -8.9935],
    [73.526667, 19.016667],
    [68.638167, 43.384667],
    [73.0, 55.0],
    [75.0, 80.0],
    [77.0, 110.0],
    [75.0, 140.0],
    [70.0, 165.0],
    [70.0, 180.0],
  ],
];

/**
 * Same boundary points, flattened for interpolation-based detection.
 */
const IMO_N60_BOUNDARY_LINE: LatLng[] = [
  [60.0, -169.0],
  [60.0, -140.0],
  [60.0, -100.0],
  [60.0, -60.0],
  [58.0, -42.0],
  [64.616667, -35.45],
  [67.065, -26.556667],
  [70.826667, -8.9935],
  [73.526667, 19.016667],
  [68.638167, 43.384667],
  [73.0, 55.0],
  [75.0, 80.0],
  [77.0, 110.0],
  [75.0, 140.0],
  [70.0, 165.0],
  [70.0, 180.0],
];

/**
 * Normalize IMO boundary longitude into a continuous east-going range.
 * Example:
 *  -169 stays -169
 *  180 stays 180
 *  -179 would become 181 if needed
 */
function normalizeBoundaryLongitudes(boundary: LatLng[]): LatLng[] {
  if (boundary.length === 0) return [];

  const out: LatLng[] = [boundary[0]];
  let prevLng = boundary[0][1];

  for (let i = 1; i < boundary.length; i++) {
    let [lat, lng] = boundary[i];

    while (lng < prevLng) {
      lng += 360;
    }

    out.push([lat, lng]);
    prevLng = lng;
  }

  return out;
}

const IMO_N60_BOUNDARY_NORMALIZED = normalizeBoundaryLongitudes(IMO_N60_BOUNDARY_LINE);

/**
 * Convert vessel longitude into same continuous range as the normalized boundary.
 */
function normalizeLngForBoundary(lng: number): number {
  let out = lng;

  while (out < -169) out += 360;
  while (out > 180 && out - 360 >= -169) out -= 360;

  return out;
}

/**
 * Interpolate boundary latitude at given longitude.
 */
function getBoundaryLatitudeAtLng(lng: number, boundary: LatLng[]): number | null {
  for (let i = 0; i < boundary.length - 1; i++) {
    const [lat1, lng1] = boundary[i];
    const [lat2, lng2] = boundary[i + 1];

    const minLng = Math.min(lng1, lng2);
    const maxLng = Math.max(lng1, lng2);

    if (lng >= minLng && lng <= maxLng) {
      if (lng1 === lng2) {
        return Math.max(lat1, lat2);
      }

      const t = (lng - lng1) / (lng2 - lng1);
      return lat1 + t * (lat2 - lat1);
    }
  }

  return null;
}

/**
 * Dedicated IMO N60 detection.
 * Vessel is inside if its latitude is north of the interpolated boundary line.
 */
export function isInsideIMON60(vesselPosition: LatLngObject): boolean {
  const normalizedLng = normalizeLngForBoundary(vesselPosition.lng);
  const boundaryLat = getBoundaryLatitudeAtLng(normalizedLng, IMO_N60_BOUNDARY_NORMALIZED);

  if (boundaryLat === null) {
    // Safe fallback for longitudes outside the defined west/east range
    return vesselPosition.lat >= 60;
  }

  return vesselPosition.lat >= boundaryLat;
}

/**
 * Returns active areaIds for vessel position
 */
export function getActiveAreaIds(vesselPosition: LatLngObject): string[] {
  const active = new Set<string>();
  const point: LatLng = [vesselPosition.lat, vesselPosition.lng];

  for (const polygon of REGULATORY_POLYGONS) {
    let inside: boolean;

    if (polygon.areaId === 'IMO_N60') {
      inside = isInsideIMON60(vesselPosition);
    } else {
      inside = polygon.useTurf
        ? isPointInPolygonTurf(point, polygon.coordinates)
        : isPointInPolygon(point, polygon.coordinates);
    }

    if (
      polygon.areaId === 'IMO_N60' ||
      polygon.layerKey === 'greenlandProtectedAreas' ||
      polygon.layerKey === 'greenlandLocalRestrictions'
    ) {
      console.log('🔵 AREA TEST:', {
        polygonId: polygon.id,
        areaId: polygon.areaId,
        name: polygon.name,
        position: vesselPosition,
        inside,
        method: polygon.areaId === 'IMO_N60'
          ? 'Boundary interpolation'
          : polygon.useTurf
            ? 'Turf.js'
            : 'Ray Casting',
        polygonPoints: polygon.coordinates.length,
      });
    }

    if (shouldActivate(polygon.triggerMode, inside)) {
      active.add(polygon.areaId);
    }
  }

  return Array.from(active);
}

/**
 * Returns active RuleCard ids from polygons
 */
export function getActiveRulecardIds(vesselPosition: LatLngObject): string[] {
  const active = new Set<string>();
  const point: LatLng = [vesselPosition.lat, vesselPosition.lng];

  for (const polygon of REGULATORY_POLYGONS) {
    let inside: boolean;

    if (polygon.areaId === 'IMO_N60') {
      inside = isInsideIMON60(vesselPosition);
    } else {
      inside = polygon.useTurf
        ? isPointInPolygonTurf(point, polygon.coordinates)
        : isPointInPolygon(point, polygon.coordinates);
    }

    if (shouldActivate(polygon.triggerMode, inside) && polygon.rulecardId) {
      active.add(polygon.rulecardId);
    }
  }

  return Array.from(active);
}

/**
 * Get all active rules from current vessel position
 */
export function getActiveRules(vesselPosition: LatLngObject): RuleCard[] {
  const rulesMap = new Map<string, RuleCard>();

  const activeAreaIds = getActiveAreaIds(vesselPosition);
  for (const areaId of activeAreaIds) {
    const rules = getRulesForArea(areaId) ?? [];
    for (const rule of rules) {
      rulesMap.set(rule.id, rule);
    }
  }

  const activeRulecardIds = getActiveRulecardIds(vesselPosition);
  for (const rulecardId of activeRulecardIds) {
    const card = RULECARD_REGISTRY[rulecardId];
    if (card) {
      rulesMap.set(card.id, card);
    }
  }

  return Array.from(rulesMap.values()).sort((a, b) => {
    const ap = a.ui?.priority ?? 0;
    const bp = b.ui?.priority ?? 0;
    return bp - ap;
  });
}

// =====================
// POLYGONS
// =====================

export const REGULATORY_POLYGONS: RegulatoryPolygon[] = [
  ...TERRITORIAL_POLYGONS,

  /**
   * Detection object for IMO N60.
   * Coordinates remain here for structure consistency,
   * but actual detection uses isInsideIMON60().
   */
  {
    id: 'imo_n60_area',
    name: 'IMO Polar Code N60 Area',
    areaId: 'IMO_N60',
    triggerMode: 'inside',
    coordinates: IMO_N60_BOUNDARY_LINE,
    useTurf: false,
    sourceType: 'imo',
    layerKey: 'imoN60',
    category: 'regulatory',
    rulecardId: 'POLAR_001',
  },

  ...GREENLAND_SERMERSOOQ_POLYGONS,
  ...GREENLAND_LOCAL_RESTRICTION_POLYGONS,
  ...GREENLAND_PROTECTED_POLYGONS,
];