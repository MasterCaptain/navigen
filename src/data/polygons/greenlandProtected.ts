export const GREENLAND_PROTECTED_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'GREENLAND_PROTECTED_TEST',
    name: 'Greenland Protected Test Area',
    areaId: 'GREENLAND_PROTECTED',
    triggerMode: 'inside',

    coordinates: [
      [69.0, -56.0],
      [69.5, -54.0],
      [68.0, -52.0],
      [66.5, -53.5],
      [67.0, -56.5],
      [69.0, -56.0],
    ],

    useTurf: true,
    sourceType: 'advisory',
    layerKey: 'greenlandProtectedAreas',
    category: 'protected',
  },
];