import type { LatLng, RegulatoryPolygon } from '../geoTriggers';

const CANADA_NORDREG_OUTER: LatLng[] = [
  // ekte NORDREG-koordinater her i [lat, lng]
];

export const CANADA_NORDREG_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'canada_nordreg_zone',
    name: 'Canada NORDREG Zone',
    areaId: 'CANADA_NORDREG',
    triggerMode: 'inside',
    coordinates: CANADA_NORDREG_OUTER,
    useTurf: true,
    sourceType: 'national_law',
    layerKey: 'canadaNordreg',
    category: 'regulatory',
    rulecardId: 'CANADA_NORDREG',
  },
];