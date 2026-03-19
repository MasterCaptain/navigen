import type {
  BBox,
  DatasetCategory,
  DatasetRegistryItem,
  DatasetRegion,
} from '../data/regulations/datasetRegistry';
import {
  DATASET_REGISTRY,
  datasetMatchesBounds,
  datasetMatchesRegion,
} from '../data/regulations/datasetRegistry';

export type GeoJSONPolygon = {
  type: 'Polygon';
  coordinates: number[][][];
};

export type GeoJSONMultiPolygon = {
  type: 'MultiPolygon';
  coordinates: number[][][][];
};

export type RegulatoryGeometry = GeoJSONPolygon | GeoJSONMultiPolygon;

export type RegulatoryPolygonRecord = {
  id: string;
  name: string;
  areaId: string;
  category: DatasetCategory;
  region: DatasetRegion;
  sourceDatasetId: string;
  triggerMode?: string;
  geometry: RegulatoryGeometry;
  bbox: BBox | null;
  raw?: any;
};

type FeatureLike = {
  type?: string;
  geometry?: RegulatoryGeometry;
  properties?: Record<string, any>;
  id?: string | number;
};

type LoaderOptions = {
  datasetIds?: string[];
  regions?: DatasetRegion[];
  bounds?: BBox | null;
  categories?: DatasetCategory[];
  includeDisabledByDefault?: boolean;
};

const datasetCache = new Map<string, RegulatoryPolygonRecord[]>();

function computeGeometryBBox(geometry: RegulatoryGeometry): BBox | null {
  try {
    let coords: number[][] = [];

    if (geometry.type === 'Polygon') {
      coords = geometry.coordinates?.flat(1) ?? [];
    } else if (geometry.type === 'MultiPolygon') {
      coords = geometry.coordinates?.flat(2) ?? [];
    }

    if (!coords.length) return null;

    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  } catch {
    return null;
  }
}

function normalizeFeature(
  feature: FeatureLike,
  dataset: DatasetRegistryItem,
  index: number
): RegulatoryPolygonRecord | null {
  if (!feature?.geometry) return null;

  const geometry = feature.geometry;
  if (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon') return null;

  const props = feature.properties ?? {};
  const id =
    String(feature.id ?? props.id ?? props.area_id ?? `${dataset.id}-${index}`);
  const areaId =
    String(props.areaId ?? props.area_id ?? props.zoneId ?? id);
  const name =
    String(props.name ?? props.zoneName ?? props.title ?? areaId);

  return {
    id,
    name,
    areaId,
    category: dataset.category,
    region: dataset.region,
    sourceDatasetId: dataset.id,
    triggerMode: props.triggerMode ?? props.trigger_mode ?? 'CROSSING',
    geometry,
    bbox: computeGeometryBBox(geometry),
    raw: feature,
  };
}

function normalizeArrayItem(
  item: any,
  dataset: DatasetRegistryItem,
  index: number
): RegulatoryPolygonRecord | null {
  if (item?.geometry) {
    return normalizeFeature(
      {
        id: item.id,
        geometry: item.geometry,
        properties: item.properties ?? item,
      },
      dataset,
      index
    );
  }

  // fallback for legacy shape with coordinates only
  if (item?.coordinates && Array.isArray(item.coordinates)) {
    const geometry: RegulatoryGeometry = {
      type: 'Polygon',
      coordinates: [
        item.coordinates.map(([lat, lng]: [number, number]) => [lng, lat]),
      ],
    };

    return {
      id: String(item.id ?? `${dataset.id}-${index}`),
      name: String(item.name ?? item.areaId ?? item.area_id ?? `Area ${index + 1}`),
      areaId: String(item.areaId ?? item.area_id ?? item.id ?? `${dataset.id}-${index}`),
      category: dataset.category,
      region: dataset.region,
      sourceDatasetId: dataset.id,
      triggerMode: item.triggerMode ?? 'CROSSING',
      geometry,
      bbox: computeGeometryBBox(geometry),
      raw: item,
    };
  }

  return null;
}

function normalizeDatasetPayload(
  payload: any,
  dataset: DatasetRegistryItem
): RegulatoryPolygonRecord[] {
  // GeoJSON FeatureCollection
  if (payload?.type === 'FeatureCollection' && Array.isArray(payload.features)) {
    return payload.features
      .map((feature: FeatureLike, index: number) =>
        normalizeFeature(feature, dataset, index)
      )
      .filter(Boolean) as RegulatoryPolygonRecord[];
  }

  // Single GeoJSON Feature
  if (payload?.type === 'Feature' && payload.geometry) {
    const one = normalizeFeature(payload, dataset, 0);
    return one ? [one] : [];
  }

  // Raw array
  if (Array.isArray(payload)) {
    return payload
      .map((item, index) => normalizeArrayItem(item, dataset, index))
      .filter(Boolean) as RegulatoryPolygonRecord[];
  }

  return [];
}

function intersectsBBox(a: BBox, b: BBox): boolean {
  return (
    a.maxLat >= b.minLat &&
    a.minLat <= b.maxLat &&
    a.maxLng >= b.minLng &&
    a.minLng <= b.maxLng
  );
}

function filterByBounds(
  polygons: RegulatoryPolygonRecord[],
  bounds?: BBox | null
): RegulatoryPolygonRecord[] {
  if (!bounds) return polygons;
  return polygons.filter((p) => {
    if (!p.bbox) return true;
    return intersectsBBox(p.bbox, bounds);
  });
}

function pickDatasets(options: LoaderOptions): DatasetRegistryItem[] {
  const {
    datasetIds,
    regions,
    bounds,
    categories,
    includeDisabledByDefault = true,
  } = options;

  return DATASET_REGISTRY.filter((dataset) => {
    if (!includeDisabledByDefault && !dataset.enabledByDefault) return false;
    if (datasetIds?.length && !datasetIds.includes(dataset.id)) return false;
    if (regions?.length && !regions.some((r) => datasetMatchesRegion(dataset, r))) return false;
    if (categories?.length && !categories.includes(dataset.category)) return false;
    if (bounds && !datasetMatchesBounds(dataset, bounds)) return false;
    return true;
  }).sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
}

async function loadSingleDataset(
  dataset: DatasetRegistryItem,
  bounds?: BBox | null
): Promise<RegulatoryPolygonRecord[]> {
  if (datasetCache.has(dataset.id)) {
    const cached = datasetCache.get(dataset.id)!;
    return filterByBounds(cached, bounds);
  }

  const response = await fetch(dataset.source);
  if (!response.ok) {
    throw new Error(`Failed to load dataset ${dataset.id} from ${dataset.source}`);
  }

  const payload = await response.json();
  const normalized = normalizeDatasetPayload(payload, dataset);

  datasetCache.set(dataset.id, normalized);

  return filterByBounds(normalized, bounds);
}

export async function loadRegulatoryDatasets(
  options: LoaderOptions = {}
): Promise<RegulatoryPolygonRecord[]> {
  const datasets = pickDatasets(options);

  const loaded = await Promise.all(
    datasets.map((dataset) => loadSingleDataset(dataset, options.bounds))
  );

  return loaded.flat();
}

export function clearRegulatoryDatasetCache(datasetId?: string) {
  if (datasetId) {
    datasetCache.delete(datasetId);
    return;
  }

  datasetCache.clear();
}