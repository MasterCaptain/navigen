import type { RegulatoryPolygon } from '../geoTriggers';
import type { LatLng } from '../geoTriggers';

// --- NORGE TERRITORIALGRENSE 12NM (EKSAKTE KOORDINATER) ---
// Kilde: Norsk Kartverket / Geonorge
// Dataset ID: [TODO: INSERT KARTVERKET DATASET ID]
// Dataset name: "Territorialgrense 12 nautiske mil"
// Dataset URL: [TODO: INSERT GEONORGE URL]
// Downloaded: [TODO: INSERT DATE]
// Offisiell maritim grense: 12 nautiske mil fra grunnlinje ved Norge fastland
// Lokasjon: Norge fastland inkludert alle fjorder (ca. 58-71°N, 4-31°E)
// VIKTIG: Koordinater konvertert fra GeoJSON [lng, lat] til vårt format [lat, lng]

// TODO: PASTE CONVERTED COORDINATES HERE
// Use the Python script from README_KARTVERKET.md to convert GeoJSON
const NORWAY_MAINLAND_12NM: LatLng[] = [
  // Format: [lat, lng], [lat, lng], ...
  // Example from Kartverket data:
  // [58.123456, 6.789012],
  // [58.234567, 6.890123],
  // ... (thousands of coordinates)
  
  // TEMPORARY PLACEHOLDER - REMOVE WHEN REAL DATA IS ADDED:
  [71.0, 31.0],  // Northeast corner (Russian border)
  [71.0, 25.0],  // North
  [70.0, 23.0],  // Nordkapp area
  [69.0, 18.0],  // Tromsø area
  [68.0, 16.0],  // Lofoten area
  [66.0, 13.0],  // Polar circle
  [64.0, 11.0],  // Trøndelag
  [62.0, 6.0],   // Western Norway
  [61.0, 5.0],   // Sognefjorden
  [60.0, 5.0],   // Bergen area
  [59.0, 5.5],   // Stavanger area
  [58.0, 6.5],   // Southern Norway
  [58.0, 8.0],   // Skagerrak
  [58.0, 10.0],  // Oslo fjord
  [59.0, 11.0],  // Eastern Norway
  [60.0, 11.0],  // Continuation
  [62.0, 11.0],  // Back north
  [64.0, 12.0],  // Helgeland
  [66.0, 14.0],  // Back to Lofoten
  [68.0, 17.0],  // Back to Tromsø
  [70.0, 24.0],  // Back to Nordkapp
  [71.0, 28.0],  // Back to border
  [71.0, 31.0],  // Close polygon
];

// Optional: If Kartverket provides multiple polygons for different regions,
// you can split them here for better organization and performance:

// const NORWAY_NORTHERN_12NM: LatLng[] = [
//   // Finnmark, Troms, Nordland (66-71°N)
// ];

// const NORWAY_WESTERN_12NM: LatLng[] = [
//   // Møre og Romsdal, Sogn og Fjordane, Hordaland, Rogaland (58-65°N, western coast)
// ];

// const NORWAY_SOUTHERN_12NM: LatLng[] = [
//   // Vest-Agder, Aust-Agder, Telemark, Vestfold, Oslo, Østfold (58-60°N, southern/eastern coast)
// ];

export const NORWAY_TERRITORIAL_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'NORWAY_MAINLAND_12NM_POLYGON',
    name: 'Territorial Waters - Norway Mainland (12NM)',
    areaId: 'NORWAY_12NM',  // This maps to 'COASTAL' zone in App.tsx
    triggerMode: 'inside',
    coordinates: NORWAY_MAINLAND_12NM,
    useTurf: true,  // CRITICAL: Set to true for complex Norwegian coastline with fjords
  },
  
  // Optional: Uncomment if splitting into multiple regions
  // {
  //   id: 'NORWAY_NORTHERN_12NM_POLYGON',
  //   name: 'Territorial Waters - Northern Norway (12NM)',
  //   areaId: 'NORWAY_12NM',  // Same areaId to trigger same 'COASTAL' rules
  //   triggerMode: 'inside',
  //   coordinates: NORWAY_NORTHERN_12NM,
  //   useTurf: true,
  // },
  // {
  //   id: 'NORWAY_WESTERN_12NM_POLYGON',
  //   name: 'Territorial Waters - Western Norway (12NM)',
  //   areaId: 'NORWAY_12NM',
  //   triggerMode: 'inside',
  //   coordinates: NORWAY_WESTERN_12NM,
  //   useTurf: true,
  // },
  // {
  //   id: 'NORWAY_SOUTHERN_12NM_POLYGON',
  //   name: 'Territorial Waters - Southern Norway (12NM)',
  //   areaId: 'NORWAY_12NM',
  //   triggerMode: 'inside',
  //   coordinates: NORWAY_SOUTHERN_12NM,
  //   useTurf: true,
  // },
];

// NOTE: When real Kartverket data is added:
// 1. Rename this file from norwayTerritorial.TEMPLATE.ts to norwayTerritorial.ts
// 2. Remove the TEMPORARY PLACEHOLDER coordinates above
// 3. Paste real coordinates from Kartverket GeoJSON (converted to [lat, lng] format)
// 4. Uncomment the import in /data/polygons/territorial.ts
// 5. Test in Norwegian fjords - should now show COASTAL instead of HIGH SEAS
// 6. Remove TODO comments from App.tsx and geoTriggers.ts
// 7. Update README_KARTVERKET.md with actual dataset ID and download date
