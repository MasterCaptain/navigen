/**
 * Script for å laste opp GeoJSON til Supabase protected_areas table
 * 
 * BRUK:
 * 1. Plasser din GeoJSON-fil i /data/geojson/
 * 2. Kjør: npm run upload-geojson
 * 3. Eller bruk Supabase Table Editor direkte
 */

import { supabase } from '../lib/supabase';

export interface GeoJSONFeature {
  type: 'Feature';
  properties: {
    name: string;
    name_en?: string;
    area_type: 'national_park' | 'nature_reserve' | 'bird_reserve' | 'geotope' | 'plant_protection' | 'marine_protected' | 'other';
    region: string;
    description?: string;
    established_date?: string;
    area_size_km2?: number;
    managing_authority?: string;
    source_url?: string;
    regulations?: {
      entry_prohibited?: boolean;
      wildlife_distance?: number;
      landing_permit?: boolean;
      [key: string]: any;
    };
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Upload GeoJSON FeatureCollection to Supabase
 */
export async function uploadGeoJSON(
  geojson: GeoJSONFeatureCollection,
  defaultRegion: string = 'SVALBARD'
): Promise<{ success: number; errors: any[] }> {
  const results = {
    success: 0,
    errors: [] as any[],
  };

  for (const feature of geojson.features) {
    try {
      // Generate area_id from name
      const areaId = `PROTECTED_${feature.properties.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')}`;

      const protectedArea = {
        area_id: areaId,
        name: feature.properties.name,
        name_en: feature.properties.name_en,
        area_type: feature.properties.area_type || 'other',
        region: feature.properties.region || defaultRegion,
        description: feature.properties.description,
        regulations: feature.properties.regulations,
        geometry: feature.geometry,
        established_date: feature.properties.established_date,
        area_size_km2: feature.properties.area_size_km2,
        managing_authority: feature.properties.managing_authority,
        source_url: feature.properties.source_url,
        metadata: feature.properties.metadata,
        status: 'active' as const,
      };

      const { error } = await supabase
        .from('protected_areas')
        .upsert(protectedArea, {
          onConflict: 'area_id',
        });

      if (error) {
        console.error(`❌ Failed to upload ${feature.properties.name}:`, error);
        results.errors.push({ name: feature.properties.name, error });
      } else {
        console.log(`✅ Uploaded: ${feature.properties.name}`);
        results.success++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${feature.properties.name}:`, error);
      results.errors.push({ name: feature.properties.name, error });
    }
  }

  return results;
}

/**
 * Delete all protected areas for a region
 */
export async function deleteProtectedAreasByRegion(region: string) {
  const { error } = await supabase
    .from('protected_areas')
    .delete()
    .eq('region', region);

  if (error) {
    console.error(`❌ Failed to delete areas for region ${region}:`, error);
    throw error;
  }

  console.log(`✅ Deleted all protected areas for region: ${region}`);
}

// Example usage:
// const geojson = await fetch('/data/geojson/svalbard-protected.geojson').then(r => r.json());
// const results = await uploadGeoJSON(geojson, 'SVALBARD');
// console.log(`Uploaded ${results.success} areas, ${results.errors.length} errors`);
