import type { RouteWithWaypoints, ZoneCrossingPoint } from '../types/routes';

type SimplePoint = { lat: number; lon: number };

type ProtectedAreaLike = {
  area_id: string;
  name: string;
  geometry: any;
};

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function distanceNm(a: SimplePoint, b: SimplePoint): number {
  const R = 3440.065;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);

  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

function lerpPoint(a: SimplePoint, b: SimplePoint, f: number): SimplePoint {
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lon: a.lon + (b.lon - a.lon) * f,
  };
}

function pointInBBox(
  p: SimplePoint,
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number
): boolean {
  return (
    p.lat >= minLat &&
    p.lat <= maxLat &&
    p.lon >= minLon &&
    p.lon <= maxLon
  );
}

function getGeometryBBox(geometry: any): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
} | null {
  try {
    let coords: number[][] = [];

    if (geometry?.type === 'Polygon') {
      coords = geometry.coordinates?.[0] ?? [];
    } else if (geometry?.type === 'MultiPolygon') {
      coords = geometry.coordinates?.[0]?.[0] ?? [];
    } else {
      return null;
    }

    if (!coords.length) return null;

    const lons = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLon: Math.min(...lons),
      maxLon: Math.max(...lons),
    };
  } catch {
    return null;
  }
}

// Ray-casting point-in-ring
// GeoJSON ring format: [ [lon, lat], [lon, lat], ... ]
function pointInRing(point: SimplePoint, ring: number[][]): boolean {
  let inside = false;
  const x = point.lon;
  const y = point.lat;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0];
    const yi = ring[i][1];
    const xj = ring[j][0];
    const yj = ring[j][1];

    const intersects =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / ((yj - yi) || Number.EPSILON) + xi;

    if (intersects) inside = !inside;
  }

  return inside;
}

// Polygon with holes support:
// outer ring must contain point, inner holes must NOT contain point
function pointInPolygonGeometry(point: SimplePoint, geometry: any): boolean {
  if (!geometry) return false;

  if (geometry.type === 'Polygon') {
    const rings: number[][][] = geometry.coordinates ?? [];
    if (!rings.length) return false;

    const outer = rings[0];
    const holes = rings.slice(1);

    if (!pointInRing(point, outer)) return false;
    for (const hole of holes) {
      if (pointInRing(point, hole)) return false;
    }
    return true;
  }

  if (geometry.type === 'MultiPolygon') {
    const polygons: number[][][][] = geometry.coordinates ?? [];
    for (const polygon of polygons) {
      if (!polygon.length) continue;

      const outer = polygon[0];
      const holes = polygon.slice(1);

      if (!pointInRing(point, outer)) continue;

      let inHole = false;
      for (const hole of holes) {
        if (pointInRing(point, hole)) {
          inHole = true;
          break;
        }
      }

      if (!inHole) return true;
    }
  }

  return false;
}

// Finds all inside/outside transitions along one leg.
// This catches:
// - outside -> inside
// - inside -> outside
// - outside -> inside -> outside on same leg
function findCrossingsAlongLeg(
  start: SimplePoint,
  end: SimplePoint,
  isInside: (p: SimplePoint) => boolean
): { crossingType: 'ENTRY' | 'EXIT'; lat: number; lon: number; fraction: number }[] {
  const crossings: { crossingType: 'ENTRY' | 'EXIT'; lat: number; lon: number; fraction: number }[] = [];

  // Higher sampling for long legs
  const legNm = distanceNm(start, end);
  const steps = Math.max(100, Math.min(1000, Math.round(legNm * 20)));

  let prevPoint = start;
  let prevInside = isInside(start);

  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    const currPoint = lerpPoint(start, end, f);
    const currInside = isInside(currPoint);

    if (currInside !== prevInside) {
      // refine by binary search between prev segment sample and current
      let lo = (i - 1) / steps;
      let hi = f;
      let crossingFraction = f;

      for (let iter = 0; iter < 20; iter++) {
        const mid = (lo + hi) / 2;
        const midPoint = lerpPoint(start, end, mid);
        const midInside = isInside(midPoint);

        if (midInside === prevInside) {
          lo = mid;
        } else {
          hi = mid;
          crossingFraction = mid;
        }
      }

      const crossingPoint = lerpPoint(start, end, crossingFraction);

      crossings.push({
        crossingType: currInside ? 'ENTRY' : 'EXIT',
        lat: crossingPoint.lat,
        lon: crossingPoint.lon,
        fraction: crossingFraction,
      });
    }

    prevPoint = currPoint;
    prevInside = currInside;
  }

  return crossings;
}

export function generateZoneCrossingPoints(
  route: RouteWithWaypoints,
  protectedAreas: ProtectedAreaLike[]
): ZoneCrossingPoint[] {
  const results: ZoneCrossingPoint[] = [];

  if (!route?.waypoints?.length || route.waypoints.length < 2) {
    console.log('🧭 ZCP ENGINE - route missing or too short');
    return [];
  }

  if (!protectedAreas?.length) {
    console.log('🧭 ZCP ENGINE - no crossing areas provided');
    return [];
  }

  console.log('🧭 ZCP ENGINE - route id:', route.id);
  console.log('🧭 ZCP ENGINE - waypoint count:', route.waypoints.length);
  console.log('🧭 ZCP ENGINE - area count:', protectedAreas.length);

  for (let i = 1; i < route.waypoints.length; i++) {
    const prev = route.waypoints[i - 1];
    const curr = route.waypoints[i];

    const start = { lat: prev.lat, lon: prev.lon };
    const end = { lat: curr.lat, lon: curr.lon };
    const legDistance = distanceNm(start, end);

    console.log(`🧭 ZCP ENGINE - checking leg ${i - 1}`, {
      start,
      end,
      legDistanceNm: legDistance.toFixed(2),
    });

    for (const area of protectedAreas) {
      const bbox = getGeometryBBox(area.geometry);
      if (!bbox) {
        console.log(`⚠️ ZCP ENGINE - skipped area without valid bbox: ${area.name}`);
        continue;
      }

      // Quick reject using leg bbox vs area bbox
      const legMinLat = Math.min(start.lat, end.lat);
      const legMaxLat = Math.max(start.lat, end.lat);
      const legMinLon = Math.min(start.lon, end.lon);
      const legMaxLon = Math.max(start.lon, end.lon);

      const bboxOverlap =
        legMaxLat >= bbox.minLat &&
        legMinLat <= bbox.maxLat &&
        legMaxLon >= bbox.minLon &&
        legMinLon <= bbox.maxLon;

      if (!bboxOverlap) continue;

      const isInside = (p: SimplePoint) => pointInPolygonGeometry(p, area.geometry);

      const startInside = isInside(start);
      const endInside = isInside(end);

      console.log(`🧭 ZCP ENGINE - area ${area.name}`, {
        startInside,
        endInside,
      });

      const crossings = findCrossingsAlongLeg(start, end, isInside);

      if (!crossings.length) continue;

      console.log(`🟣 ZCP ENGINE - crossings found for ${area.name}:`, crossings);

      crossings.forEach((crossing, crossingIndex) => {
        results.push({
          id: `${route.id}-${area.area_id}-${i}-${crossing.crossingType}-${crossingIndex}`,
          routeId: route.id,
          legIndex: i - 1,
          crossingType: crossing.crossingType,
          zoneType: 'PROTECTED_AREA',
          zoneId: area.area_id,
          zoneName: area.name,
          lat: crossing.lat,
          lon: crossing.lon,
          distanceFromLegStartNm: legDistance * crossing.fraction,
        });
      });
    }
  }

  // Sort by leg then distance along leg
  results.sort((a, b) => {
    if (a.legIndex !== b.legIndex) return a.legIndex - b.legIndex;
    return a.distanceFromLegStartNm - b.distanceFromLegStartNm;
  });

  console.log('🧭 ZCP ENGINE - final result count:', results.length);
  console.log('🧭 ZCP ENGINE - final results:', results);

  return results;
}