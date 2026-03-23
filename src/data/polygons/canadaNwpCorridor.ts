import type { LatLng, RegulatoryPolygon } from '../geoTriggers';

// ==============================
// NWP CORRIDOR (OPERATIONAL)
// ==============================

const NWP_NORTHERN: LatLng[] = [
  [75.5, -78.0],
  [75.5, -95.0],
  [75.8, -115.0],
  [75.0, -125.0],
  [73.5, -125.0],
  [74.0, -115.0],
  [73.5, -95.0],
  [73.5, -78.0],
  [75.5, -78.0],
];

const NWP_SOUTHERN: LatLng[] = [
  [74.5, -92.0],
  [73.0, -98.5],
  [70.5, -103.0],
  [69.5, -115.0],
  [71.5, -125.0],
  [69.0, -125.0],
  [67.5, -115.0],
  [68.5, -100.0],
  [72.0, -94.5],
  [73.5, -90.0],
  [74.5, -92.0],
];

export const CANADA_NWP_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'canada_nwp_northern',
    name: 'NWP Corridor – Northern Route',
    areaId: 'CANADA_NWP',
    triggerMode: 'inside',
    coordinates: NWP_NORTHERN,
    useTurf: true,
    sourceType: 'advisory',
    layerKey: 'canadaNwpCorridor',
    category: 'proposal',
    rulecardId: 'CANADA_NWP_001',
  },
  {
    id: 'canada_nwp_southern',
    name: 'NWP Corridor – Southern Route',
    areaId: 'CANADA_NWP',
    triggerMode: 'inside',
    coordinates: NWP_SOUTHERN,
    useTurf: true,
    sourceType: 'advisory',
    layerKey: 'canadaNwpCorridor',
    category: 'proposal',
    rulecardId: 'CANADA_NWP_001',
  },
];