#!/usr/bin/env node
/**
 * 🗺️ NAVIGEN - Upload Protected Areas from Supabase Storage
 *
 * Leser GeoJSON-fil fra Supabase Storage og laster inn features i protected_areas.
 *
 * BRUK:
 * 1. Sett miljøvariabler:
 *    Windows PowerShell:
 *      $env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
 *      $env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
 *
 *    macOS / Linux:
 *      export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"
 *      export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
 *
 * 2. Kjør:
 *      node upload-from-storage.mjs
 */

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// KONFIGURASJON
// ============================================================================

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Supabase Storage konfigurasjon
const BUCKET_NAME = 'geojson-data';
const FILE_NAME = 'svalbard_protected_areas.geojson';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables.\n');
  console.error('Set these before running the script:\n');
  console.error('Windows PowerShell:');
  console.error('  $env:SUPABASE_URL="https://YOUR_PROJECT.supabase.co"');
  console.error('  $env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"\n');
  console.error('macOS / Linux:');
  console.error('  export SUPABASE_URL="https://YOUR_PROJECT.supabase.co"');
  console.error('  export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"\n');
  process.exit(1);
}

// ============================================================================
// MAPPING: GeoJSON properties → Database columns
// ============================================================================

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
  if (!verneformAggregert) return 'other';
  return AREA_TYPE_MAP[verneformAggregert] || 'other';
}

function normalizeString(value) {
  return String(value ?? '').trim();
}

function generateAreaId(navn) {
  const clean = normalizeString(navn) || crypto.randomUUID();

  return `PROTECTED_${clean
    .toUpperCase()
    .replace(/[ÆØÅÄÖ]/g, (c) => ({ Æ: 'AE', Ø: 'O', Å: 'AA', Ä: 'A', Ö: 'O' }[c]))
    .replace(/[^A-Z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')}`;
}

function safeDate(vernedato) {
  const raw = normalizeString(vernedato);
  if (!raw || raw.length !== 8) return null;

  const yyyy = raw.slice(0, 4);
  const mm = raw.slice(4, 6);
  const dd = raw.slice(6, 8);

  if (!/^\d{4}$/.test(yyyy) || !/^\d{2}$/.test(mm) || !/^\d{2}$/.test(dd)) {
    return null;
  }

  return `${yyyy}-${mm}-${dd}`;
}

function transformFeature(feature) {
  const props = feature?.properties ?? {};
  const geometry = feature?.geometry ?? null;

  if (!geometry || !geometry.type || !geometry.coordinates) {
    throw new Error('Feature missing valid geometry');
  }

  const navn = normalizeString(props.navn) || normalizeString(props.offisieltNavn) || 'Unnamed protected area';

  return {
    area_id: generateAreaId(navn),
    name: navn,
    name_en: normalizeString(props.offisieltNavn) || navn,
    area_type: mapAreaType(props.verneformAggregert),
    region: props.kommune === '2211' ? 'JAN_MAYEN' : 'SVALBARD',
    description: `${normalizeString(props.offisieltNavn) || navn}. IUCN: ${normalizeString(props.iucn) || 'N/A'}`,
    regulations: {
      entry_prohibited: false,
      wildlife_distance: 300,
      landing_permit: props.verneformAggregert === 'naturreservat',
      speed_limit_knots: null,
      no_drone_zone: true,
      iucn_category: props.iucn ?? null,
      marine_protection: props.marinBeskyttelse === 'ja',
      marine_area_percentage: props.marineAreaPercentage ?? null,
      forest_protection: props.skogvern === 'ja',
    },
    geometry,
    established_date: safeDate(props.vernedato),
    area_size_km2: null,
    managing_authority: normalizeString(props.forvaltningsmyndighet) || null,
    source: 'SUPABASE_STORAGE_IMPORT',
    source_url: normalizeString(props.verneforskrift) || normalizeString(props.faktaark) || null,
    metadata: {
      cdda_id: props.cddaId ?? null,
      uuid: props.uuid ?? null,
      major_ecosystem_type: props.majorEcosystemType ?? null,
      management_plan: props.forvaltningsplan ?? null,
      management_plan_date: props.forvaltningsplanDato ?? null,
      faktaark_url: props.faktaark ?? null,
      verneforskrift_url: props.verneforskrift ?? null,
    },
    status: 'active',
  };
}

// ============================================================================
// MAIN UPLOAD FUNCTION
// ============================================================================

async function uploadProtectedAreas() {
  console.log('🗺️  NAVIGEN Protected Areas Upload\n');
  console.log('═'.repeat(70));

  console.log('🔌 Connecting to Supabase...');
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log('✅ Connected!\n');

  console.log(`📥 Downloading from Storage: ${BUCKET_NAME}/${FILE_NAME}`);

  const { data: fileData, error: downloadError } = await supabase.storage
    .from(BUCKET_NAME)
    .download(FILE_NAME);

  if (downloadError) {
    console.error('❌ Failed to download file from Storage:', downloadError.message);
    console.log('\n💡 Troubleshooting:');
    console.log('   1. Check that bucket exists');
    console.log(`   2. Check that file exists in bucket: ${BUCKET_NAME}/${FILE_NAME}`);
    console.log('   3. Check that the bucket is public or that your key has access');
    process.exit(1);
  }

  console.log(`✅ Downloaded ${(fileData.size / 1024 / 1024).toFixed(2)} MB\n`);

  console.log('📄 Parsing GeoJSON...');
  const text = await fileData.text();
  const geojsonData = JSON.parse(text);

  if (!geojsonData.features || !Array.isArray(geojsonData.features)) {
    console.error('❌ Invalid GeoJSON format - missing features array');
    process.exit(1);
  }

  console.log(`✅ Found ${geojsonData.features.length} protected areas\n`);
  console.log('📤 Uploading to database...\n');

  const results = {
    success: 0,
    errors: [],
  };

  for (let i = 0; i < geojsonData.features.length; i++) {
    const feature = geojsonData.features[i];
    const areaName =
      feature?.properties?.navn ||
      feature?.properties?.offisieltNavn ||
      `Area ${i + 1}`;

    try {
      const protectedArea = transformFeature(feature);

      const { error } = await supabase
        .from('protected_areas')
        .upsert(protectedArea, {
          onConflict: 'area_id',
        });

      if (error) {
        console.log(`❌ [${i + 1}/${geojsonData.features.length}] ${areaName}`);
        console.log(`   Error: ${error.message}`);
        results.errors.push({ name: areaName, error: error.message });
      } else {
        console.log(`✅ [${i + 1}/${geojsonData.features.length}] ${areaName}`);
        results.success++;
      }
    } catch (error) {
      console.log(`❌ [${i + 1}/${geojsonData.features.length}] ${areaName}`);
      console.log(`   Error: ${error.message}`);
      results.errors.push({ name: areaName, error: error.message });
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log('📊 SUMMARY\n');
  console.log(`✅ Successfully uploaded: ${results.success} areas`);
  console.log(`❌ Failed: ${results.errors.length} areas`);

  if (results.errors.length > 0) {
    console.log('\n❌ Failed areas:');
    results.errors.forEach((err, i) => {
      console.log(`   ${i + 1}. ${err.name}: ${err.error}`);
    });
  }

  console.log('\n' + '═'.repeat(70));
  console.log('🎉 Upload complete!\n');
  console.log('📍 Next steps:');
  console.log('   1. Open NAVIGEN in browser');
  console.log('   2. Go to ModuleBar → NAV → Regulatory & Borders');
  console.log('   3. Expand "SVALBARD" section');
  console.log('   4. Toggle ON "Svalbard Protected Areas"');
  console.log('   5. Zoom to Svalbard / Longyearbyen to verify polygons\n');
}

// ============================================================================
// RUN SCRIPT
// ============================================================================

uploadProtectedAreas().catch((error) => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});