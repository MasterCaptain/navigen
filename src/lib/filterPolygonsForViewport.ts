import type { BBox } from '../data/regulations/datasetRegistry';
import type { RegulatoryPolygonRecord } from './loadRegulatoryDatasets';

export type RegLayerFilter = {
  enabled: boolean;
  bordersEnabled?: boolean;
  regulatoryZonesEnabled?: boolean;
  territorialWaters12nm?: boolean;
  contiguousZone24nm?: boolean;
  eez200nm?: boolean;
  imoN60?: boolean;
  imoS60?: boolean;
  svalbard12nm?: boolean;

  greenlandExpanded?: boolean;
greenlandSermersooq?: boolean;
greenlandProtectedAreas?: boolean;
greenlandLocalRestrictions?: boolean;

  svalbardProtectedAreas?: boolean;
  marpolAreas?: boolean;
  solasZones?: boolean;
};

function intersectsBBox(a: BBox, b: BBox): boolean {
  return (
    a.maxLat >= b.minLat &&
    a.minLat <= b.maxLat &&
    a.maxLng >= b.minLng &&
    a.minLng <= b.maxLng
  );
}

export function polygonMatchesViewport(
  polygon: RegulatoryPolygonRecord,
  viewport?: BBox | null
): boolean {
  if (!viewport) return true;
  if (!polygon.bbox) return true;
  return intersectsBBox(polygon.bbox, viewport);
}

export function polygonMatchesRouteCorridor(
  polygon: RegulatoryPolygonRecord,
  corridor?: BBox | null
): boolean {
  if (!corridor) return true;
  if (!polygon.bbox) return true;
  return intersectsBBox(polygon.bbox, corridor);
}

export function polygonMatchesRegLayerSettings(
  polygon: RegulatoryPolygonRecord,
  regLayers?: RegLayerFilter | null
): boolean {
  if (!regLayers) return true;
  if (!regLayers.enabled) return false;

  const sourceId = polygon.sourceDatasetId;
  const areaId = polygon.areaId.toUpperCase();
  const name = polygon.name.toUpperCase();

  // EEZ / borders
  if (
    sourceId.includes('eez') ||
    areaId.includes('EEZ') ||
    name.includes('EEZ')
  ) {
    return !!regLayers.bordersEnabled && !!regLayers.eez200nm;
  }

  if (
    areaId.includes('TERRITORIAL') ||
    name.includes('12NM')
  ) {
    return !!regLayers.bordersEnabled && !!regLayers.territorialWaters12nm;
  }

  if (
    areaId.includes('CONTIGUOUS') ||
    name.includes('24NM')
  ) {
    return !!regLayers.bordersEnabled && !!regLayers.contiguousZone24nm;
  }

  // Polar
  if (
    sourceId.includes('imo_n60') ||
    areaId.includes('IMO_N60') ||
    name.includes('N60')
  ) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.imoN60;
  }

  if (
    sourceId.includes('imo_s60') ||
    areaId.includes('IMO_S60') ||
    name.includes('S60')
  ) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.imoS60;
  }

  // Svalbard protected
  if (
    sourceId.includes('svalbard') ||
    areaId.includes('SVALBARD') ||
    name.includes('SVALBARD')
  ) {
    if (name.includes('12NM') || areaId.includes('12NM')) {
      return !!regLayers.regulatoryZonesEnabled && !!regLayers.svalbard12nm;
    }
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.svalbardProtectedAreas;
  }

// Greenland
if (
  sourceId.includes('greenland') ||
  areaId.includes('GREENLAND') ||
  name.includes('GREENLAND')
) {
  // 12NM / territorial
  if (name.includes('12NM') || areaId.includes('12NM')) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.greenlandLocalRestrictions;
  }

  // Sermersooq / zoning
  if (name.includes('SERMERSOOQ') || areaId.includes('SERMERSOOQ')) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.greenlandSermersooq;
  }

  // Protected areas
  if (
    name.includes('PROTECTED') ||
    areaId.includes('PROTECTED')
  ) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.greenlandProtectedAreas;
  }

  // fallback (hvis bare "Greenland")
  return !!regLayers.regulatoryZonesEnabled && !!regLayers.greenlandExpanded;
}

  // MARPOL
  if (
    polygon.category === 'marpol' ||
    sourceId.includes('marpol') ||
    areaId.includes('MARPOL') ||
    name.includes('MARPOL')
  ) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.marpolAreas;
  }

  // SOLAS
  if (
    polygon.category === 'solas' ||
    sourceId.includes('solas') ||
    areaId.includes('SOLAS') ||
    name.includes('SOLAS')
  ) {
    return !!regLayers.regulatoryZonesEnabled && !!regLayers.solasZones;
  }

  // Default allow if master enabled
  return true;
}

export type FilterPolygonsOptions = {
  viewport?: BBox | null;
  routeCorridor?: BBox | null;
  regLayers?: RegLayerFilter | null;
};

export function filterPolygonsForViewport(
  polygons: RegulatoryPolygonRecord[],
  options: FilterPolygonsOptions = {}
): RegulatoryPolygonRecord[] {
  const { viewport, routeCorridor, regLayers } = options;

  return polygons.filter((polygon) => {
    if (!polygonMatchesRegLayerSettings(polygon, regLayers)) return false;
    if (!polygonMatchesViewport(polygon, viewport)) return false;
    if (!polygonMatchesRouteCorridor(polygon, routeCorridor)) return false;
    return true;
  });
}