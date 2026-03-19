export type DatasetCategory =
  | 'polar'
  | 'eez'
  | 'marpol'
  | 'mpa'
  | 'solas'
  | 'maritime_border'
  | 'custom';

export type DatasetRegion =
  | 'arctic'
  | 'antarctic'
  | 'europe'
  | 'north_atlantic'
  | 'asia'
  | 'americas'
  | 'africa'
  | 'global'
  | 'local';

export type BBox = {
  minLat: number;
  maxLat: number;
  minLng: number;
  maxLng: number;
};

export type DatasetRegistryItem = {
  id: string;
  name: string;
  category: DatasetCategory;
  region: DatasetRegion;
  source: string; // Path under /public, example: /data/regulations/polar/imo_n60.json
  enabledByDefault?: boolean;
  priority?: number;
  coverage?: BBox | null;
  tags?: string[];
};

export const DATASET_REGISTRY: DatasetRegistryItem[] = [
  {
    id: 'imo_n60',
    name: 'IMO N60 Polar Boundary',
    category: 'polar',
    region: 'arctic',
    source: '/data/regulations/polar/imo_n60.json',
    enabledByDefault: true,
    priority: 10,
    coverage: { minLat: 58, maxLat: 90, minLng: -180, maxLng: 180 },
    tags: ['polar', 'imo', 'arctic'],
  },
  {
    id: 'imo_s60',
    name: 'IMO S60 Antarctic Boundary',
    category: 'polar',
    region: 'antarctic',
    source: '/data/regulations/polar/imo_s60.json',
    enabledByDefault: false,
    priority: 10,
    coverage: { minLat: -90, maxLat: -60, minLng: -180, maxLng: 180 },
    tags: ['polar', 'imo', 'antarctic'],
  },
  {
    id: 'svalbard_zones',
    name: 'Svalbard Zones',
    category: 'mpa',
    region: 'arctic',
    source: '/data/regulations/mpa/svalbard_zones.json',
    enabledByDefault: true,
    priority: 20,
    coverage: { minLat: 74, maxLat: 82, minLng: 5, maxLng: 40 },
    tags: ['svalbard', 'mpa', 'protected'],
  },
  {
    id: 'eez_arctic',
    name: 'Arctic EEZ',
    category: 'eez',
    region: 'arctic',
    source: '/data/regulations/eez/eez_arctic.json',
    enabledByDefault: false,
    priority: 30,
    coverage: { minLat: 55, maxLat: 90, minLng: -180, maxLng: 180 },
    tags: ['eez', 'arctic'],
  },
  {
    id: 'eez_europe',
    name: 'Europe EEZ',
    category: 'eez',
    region: 'europe',
    source: '/data/regulations/eez/eez_europe.json',
    enabledByDefault: false,
    priority: 30,
    coverage: { minLat: 30, maxLat: 75, minLng: -30, maxLng: 50 },
    tags: ['eez', 'europe'],
  },
  {
  id: 'eez_global',
  name: 'Global EEZ',
  category: 'eez',
  region: 'global',
  source: '/data/regulations/eez/eez_global.geojson',
  enabledByDefault: false,
  priority: 35,
  coverage: null,
  tags: ['eez', 'global'],
},
{
  id: 'territorial_12nm_global',
  name: 'Territorial Waters 12NM',
  category: 'maritime_border',
  region: 'global',
  source: '/data/regulations/12nm/12nm_global.geojson',
  enabledByDefault: false,
  priority: 36,
  coverage: null,
  tags: ['territorial', '12nm', 'global'],
},
  {
    id: 'marpol_special_areas',
    name: 'MARPOL Special Areas',
    category: 'marpol',
    region: 'global',
    source: '/data/regulations/marpol/marpol_special_areas.json',
    enabledByDefault: false,
    priority: 40,
    coverage: null,
    tags: ['marpol', 'special-area', 'global'],
  },
  {
    id: 'solas_reporting_zones',
    name: 'SOLAS Reporting / Safety Zones',
    category: 'solas',
    region: 'global',
    source: '/data/regulations/solas/solas_reporting_zones.json',
    enabledByDefault: false,
    priority: 50,
    coverage: null,
    tags: ['solas', 'global'],
  },
];

export function datasetMatchesRegion(
  dataset: DatasetRegistryItem,
  region: DatasetRegion
): boolean {
  if (dataset.region === 'global') return true;
  return dataset.region === region;
}

export function intersectsBBox(a: BBox, b: BBox): boolean {
  return (
    a.maxLat >= b.minLat &&
    a.minLat <= b.maxLat &&
    a.maxLng >= b.minLng &&
    a.minLng <= b.maxLng
  );
}

export function datasetMatchesBounds(
  dataset: DatasetRegistryItem,
  bounds?: BBox | null
): boolean {
  if (!bounds) return true;
  if (!dataset.coverage) return true;
  return intersectsBBox(dataset.coverage, bounds);
}

export function getDatasetsForRegion(region: DatasetRegion): DatasetRegistryItem[] {
  return DATASET_REGISTRY.filter((d) => datasetMatchesRegion(d, region)).sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );
}

export function getDatasetsForBounds(bounds: BBox): DatasetRegistryItem[] {
  return DATASET_REGISTRY.filter((d) => datasetMatchesBounds(d, bounds)).sort(
    (a, b) => (a.priority ?? 999) - (b.priority ?? 999)
  );
}