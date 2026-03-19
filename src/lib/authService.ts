import { supabase } from './supabase';
import type { Vessel } from './supabase';

// ============================================================================
// PROTECTED AREAS - GeoJSON from Supabase
// ============================================================================

export interface ProtectedArea {
  id: string;
  area_id: string;
  name: string;
  name_en?: string;
  area_type: 'national_park' | 'nature_reserve' | 'bird_reserve' | 'geotope' | 'plant_protection' | 'marine_protected' | 'other';
  region: string;
  description?: string;
  regulations?: {
    entry_prohibited?: boolean;
    wildlife_distance?: number;
    landing_permit?: boolean;
    [key: string]: any;
  };
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
  established_date?: string;
  area_size_km2?: number;
  managing_authority?: string;
  source_url?: string;
  metadata?: any;
  status: 'active' | 'proposed' | 'expired';
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all active protected areas from Supabase
 * @param region Optional filter by region (e.g. 'SVALBARD', 'NORWAY', 'ANTARCTICA')
 * @throws Error if table doesn't exist or other database error
 */
export async function getProtectedAreas(region?: string): Promise<ProtectedArea[]> {
  let query = supabase
    .from('protected_areas')
    .select('*')
    .eq('status', 'active');
  
  if (region) {
    query = query.eq('region', region);
  }
  
  const { data, error } = await query;
  
  if (error) {
    // Don't log here - let caller handle it
    throw error;
  }
  
  return data || [];
}

/**
 * Convert GeoJSON coordinates to Leaflet LatLng format [lat, lng]
 * GeoJSON uses [lng, lat], Leaflet uses [lat, lng]
 */
export function convertGeoJSONToLeaflet(geometry: ProtectedArea['geometry']): number[][][] {
  if (geometry.type === 'Polygon') {
    // Polygon: [ [[lng, lat], [lng, lat], ...] ]
    return geometry.coordinates.map(ring => 
      ring.map(([lng, lat]) => [lat, lng])
    );
  } else if (geometry.type === 'MultiPolygon') {
    // MultiPolygon: [ [ [[lng, lat], ...] ], [ [[lng, lat], ...] ] ]
    return (geometry.coordinates as number[][][][]).flatMap(polygon =>
      polygon.map(ring => 
        ring.map(([lng, lat]) => [lat, lng])
      )
    );
  }
  
  return [];
}

// ============================================================================
// AUTH
// ============================================================================

// Sign in with email/password
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign up new user
export async function signUp(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current user
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// Get current session
export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// Create or update vessel for current user
export async function saveVessel(vesselData: Partial<Vessel>) {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('vessels')
    .upsert({
      ...vesselData,
      owner_id: user.id,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get vessels for current user
export async function getVessels() {
  const user = await getCurrentUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('vessels')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Get single vessel by ID
export async function getVessel(vesselId: string) {
  const { data, error } = await supabase
    .from('vessels')
    .select('*')
    .eq('id', vesselId)
    .single();

  if (error) throw error;
  return data;
}

// Save vessel position
export async function saveVesselPosition(
  vesselId: string,
  position: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    course?: number;
  }
) {
  const { data, error } = await supabase
    .from('vessel_positions')
    .insert({
      vessel_id: vesselId,
      ...position,
      timestamp: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get latest position for vessel
export async function getLatestVesselPosition(vesselId: string) {
  const { data, error } = await supabase
    .from('vessel_positions')
    .select('*')
    .eq('vessel_id', vesselId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data;
}

// Save route
export async function saveRoute(routeData: {
  vessel_id: string;
  name: string;
  description?: string;
  waypoints: any;
  source_type: 'manual' | 'rtz' | 'imported';
}) {
  const { data, error } = await supabase
    .from('routes')
    .insert(routeData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get routes for vessel
export async function getRoutes(vesselId: string) {
  const { data, error } = await supabase
    .from('routes')
    .select('*')
    .eq('vessel_id', vesselId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Delete route
export async function deleteRoute(routeId: string) {
  const { error } = await supabase
    .from('routes')
    .delete()
    .eq('id', routeId);

  if (error) throw error;
}

// Log compliance event
export async function logCompliance(logData: {
  vessel_id: string;
  route_id?: string;
  rule_type: 'MUST' | 'SHOULD' | 'CONSIDER';
  rule_category: string;
  rule_description: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'info';
  location?: { lat: number; lng: number };
}) {
  const { data, error } = await supabase
    .from('compliance_logs')
    .insert(logData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Get compliance logs for vessel
export async function getComplianceLogs(vesselId: string, limit = 100) {
  const { data, error } = await supabase
    .from('compliance_logs')
    .select('*')
    .eq('vessel_id', vesselId)
    .order('timestamp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}