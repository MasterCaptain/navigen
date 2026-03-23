import type { LatLng, RegulatoryPolygon } from '../geoTriggers';
import nordregGeoJson from '../regulations/nordreg.json';

type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

type GeoJSONMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: number[][][][];
};

type GeoJSONFeature = {
  type: 'Feature';
  properties?: Record<string, unknown>;
  geometry: GeoJSONPolygon | GeoJSONMultiPolygon | null;
};

type GeoJSONFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
};

const geojson = nordregGeoJson as GeoJSONFeatureCollection;

function ringToLatLng(ring: number[][]): LatLng[] {
  return ring.map(([lng, lat]) => [lat, lng]);
}

function makeNordregPolygon(
  coordinates: LatLng[],
  index: number
): RegulatoryPolygon {
  return {
    id: `canada_nordreg_${index + 1}`,
    name: 'Canada NORDREG Zone',
    areaId: 'CANADA_NORDREG',
    triggerMode: 'inside',
    coordinates,
    useTurf: true,
    sourceType: 'national_law',
    layerKey: 'canadaNordreg',
    category: 'regulatory',
    rulecardId: 'CANADA_NORDREG',
  };
}

export const CANADA_NORDREG_POLYGONS: RegulatoryPolygon[] = geojson.features.flatMap(
  (feature, featureIndex) => {
    if (!feature.geometry) return [];

    if (feature.geometry.type === 'Polygon') {
      const outerRing = feature.geometry.coordinates[0];
      if (!outerRing || outerRing.length < 4) return [];
      return [makeNordregPolygon(ringToLatLng(outerRing), featureIndex)];
    }

    if (feature.geometry.type === 'MultiPolygon') {
      return feature.geometry.coordinates
        .map((polygonCoords, polygonIndex) => {
          const outerRing = polygonCoords[0];
          if (!outerRing || outerRing.length < 4) return null;
          return makeNordregPolygon(
            ringToLatLng(outerRing),
            featureIndex * 1000 + polygonIndex
          );
        })
        .filter((p): p is RegulatoryPolygon => p !== null);
    }

    return [];
  }
);