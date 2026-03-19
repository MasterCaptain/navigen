import booleanIntersects from '@turf/boolean-intersects';
import { lineString, featureCollection, type Feature, type LineString, type GeoJsonProperties, type GeoJSON } from '@turf/helpers';
import type { RouteWithWaypoints } from '../types/routes';

export interface GreenlandProtectedHit {
  protectedAreaName: string;
  featureIndex: number;
}

function routeToLineString(route: RouteWithWaypoints): Feature<LineString> | null {
  const coords = route.waypoints
    .filter((wp) => typeof wp.lat === 'number' && typeof wp.lon === 'number')
    .map((wp) => [wp.lon, wp.lat]);

  if (coords.length < 2) return null;

  return lineString(coords);
}

export function detectGreenlandProtectedRouteHits(
  route: RouteWithWaypoints | null | undefined,
  protectedGeoJson: any
): GreenlandProtectedHit[] {
  if (!route || !protectedGeoJson?.features?.length) return [];

  const routeLine = routeToLineString(route);
  if (!routeLine) return [];

  const hits: GreenlandProtectedHit[] = [];

  protectedGeoJson.features.forEach((feature: any, index: number) => {
    try {
      const intersects = booleanIntersects(routeLine as any, feature as any);

      if (intersects) {
        const props = feature?.properties ?? {};
        const name =
          props.NAME ||
          props.name ||
          props.OBJECTID ||
          `Protected Area ${index + 1}`;

        hits.push({
          protectedAreaName: String(name),
          featureIndex: index,
        });
      }
    } catch (err) {
        console.warn('Greenland protected intersection check failed for feature', index, err);
    }
  });

  return hits;
}