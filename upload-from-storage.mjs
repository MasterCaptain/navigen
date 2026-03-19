#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const BUCKET_NAME = 'geojson-data';
const FILE_NAME = 'svalbard_protected_areas.geojson';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables.');
  process.exit(1);
}

const AREA_TYPE_MAP = {
  nasjonalpark: 'national_park',
  naturreservat: 'nature_reserve',
  fuglereservat: 'bird_reserve',
  geotopVernområde: 'geotope',
  plantevernområde: 'plant_protection',
  marintVerneområde: 'marine_protected',
  naturreservatJanMayen: 'nature_reserve',
  nasjonalparkSvalbard: 'national_park',
};

function mapAreaType(verneformAggregert) {
  return AREA_TYPE_MAP[verneformAggregert] || 'other';
}

function generateAreaId(navn) {
  return `PROTECTED_${String(navn || 'UNKNOWN')
    .toUpperCase()
    .replace(/[ÆØÅÄÖ]/g, (c) => ({ Æ: 'AE', Ø: 'O', Å: 'AA', Ä: 'A', Ö: 'O' }[c]))
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')}`;
}

function transformFeature(feature) {
  const props = feature.properties || {};

  return {
    area_id: generateAreaId(props.navn),
    name: props.navn || 'Unknown',
    name_en: props.offisieltNavn || props.navn || 'Unknown',
    area_type: mapAreaType(props.verneformAggregert),
    region: props.kommune === '2211' ? 'JAN_MAYEN' : 'SVALBARD',
    description: `${props.offisieltNavn || props.navn || 'Unknown'}. IUCN: ${props.iucn || 'N/A'}`,
    regulations: {
      entry_prohibited: false,
      wildlife_distance: 300,
      landing_permit: props.verneformAggregert === 'naturreservat',
      speed_limit_knots: null,
      no_drone_zone: true,
    },
    geometry: feature.geometry,
    established_date: null,
    area_size_km2: null,
    managing_authority: props.forvaltningsmyndighet || null,
    source: 'SUPABASE_STORAGE_IMPORT',
    source_url: props.verneforskrift || props.faktaark || null,
    metadata: {
      uuid: props.uuid || null,
    },
    status: 'active',
  };
}

async function main() {
  console.log('Connecting to Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('Connected.');

  console.log(`Downloading file: ${BUCKET_NAME}/${FILE_NAME} ...`);
  const { data: fileData, error: downloadError } = await supabase
    .storage
    .from(BUCKET_NAME)
    .download(FILE_NAME);

  if (downloadError) {
    console.error('Download error:', downloadError);
    process.exit(1);
  }

  console.log('File downloaded.');
  console.log('Reading file text...');
  const text = await fileData.text();

  console.log('Parsing GeoJSON...');
  const geojson = JSON.parse(text);

  if (!geojson.features || !Array.isArray(geojson.features)) {
    console.error('Invalid GeoJSON: missing features array.');
    process.exit(1);
  }

  console.log(`Features found: ${geojson.features.length}`);

  let ok = 0;
  let fail = 0;

  for (let i = 0; i < geojson.features.length; i++) {
    const feature = geojson.features[i];
    const name = feature?.properties?.navn || `Area ${i + 1}`;

    try {
      const row = transformFeature(feature);

      const { error } = await supabase
        .from('protected_areas')
        .upsert(row, { onConflict: 'area_id' });

      if (error) {
        fail++;
        console.log(`FAIL ${i + 1}/${geojson.features.length}: ${name}`);
        console.log(error.message);
      } else {
        ok++;
        console.log(`OK ${i + 1}/${geojson.features.length}: ${name}`);
      }
    } catch (err) {
      fail++;
      console.log(`FAIL ${i + 1}/${geojson.features.length}: ${name}`);
      console.log(err);
    }
  }

  console.log('--- SUMMARY ---');
  console.log(`Success: ${ok}`);
  console.log(`Failed: ${fail}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});