// Parse Svalbard 12NM coordinates from CSV
const fs = require('fs');

// Read the CSV file
const csvData = fs.readFileSync('./imports/svalbard-norway-coordinates.csv', 'utf-8');

// The format is: metadata...LON LAT LON LAT LON LAT...
// First, skip metadata to find where coordinates start
// Coordinates start after "NOR578.0744.074.52" pattern

const match = csvData.match(/NOR\d+\.\d+\.\d+\.(\d+\.\d+\s+\d+\.\d+.*)/);
if (!match) {
  console.error('Could not find coordinates');
  process.exit(1);
}

const coordString = match[1];
const numbers = coordString.match(/\d+\.\d+/g);

if (!numbers || numbers.length < 2) {
  console.error('Could not parse coordinates');
  process.exit(1);
}

// Convert from LON LAT pairs to [LAT, LON] format
const coordinates = [];
for (let i = 0; i < numbers.length - 1; i += 2) {
  const lon = parseFloat(numbers[i]);
  const lat = parseFloat(numbers[i + 1]);
  coordinates.push([lat, lon]);
}

console.log(`Total coordinates: ${coordinates.length}`);
console.log('First 5:', coordinates.slice(0, 5));
console.log('Last 5:', coordinates.slice(-5));

// Write as TypeScript array
const tsCode = `import type { RegulatoryPolygon } from '../geoTriggers';
import type { LatLng } from '../geoTriggers';

// --- SVALBARD 12NM (Official Norwegian 12nm territorial waters boundary)
// Source: Norwegian Mapping Authority (Kartverket)
// Dataset: Norwegian 12 NM (Svalbard) - Official maritime boundary
// Contains ${coordinates.length} coordinate points defining the 12 nautical mile territorial limit
const SVALBARD_12NM: LatLng[] = [
${coordinates.map(c => `  [${c[0]}, ${c[1]}],`).join('\n')}
];

export const TERRITORIAL_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'SVALBARD_12NM_POLYGON',
    name: 'Territorial Waters - Svalbard (12NM)',
    areaId: 'SVALBARD_12NM',
    triggerMode: 'inside',
    coordinates: SVALBARD_12NM,
  },
];
`;

fs.writeFileSync('./data/polygons/territorial.ts', tsCode, 'utf-8');
console.log('\n✅ Written to data/polygons/territorial.ts');
