// Database types for route management
export interface Route {
  id: string;
  vessel_id?: string;  // Optional for legacy compatibility
  owner_id?: string;   // New owner-based system
  name: string;
  region_tag: string | null;  // Nullable - may not be set on import
  source_type: 'rtz' | 'manual' | 'template';
  file_name?: string | null;
  distance_nm: number | null;  // Nullable - may not be calculated yet
  waypoint_count: number;
  created_at: string;
  last_used: string | null;
}

export interface RouteWaypoint {
  id: string;
  route_id: string;
  owner_id?: string;  // Required by RLS
  seq: number;  // Database column name is 'seq', not 'sequence'
  name?: string;  // Optional - may not be set on import
  lat: number;
  lon: number;
  planned_speed?: number | null;
  leg_distance_nm?: number;  // Calculated field
}

export interface Voyage {
  id: string;
  vessel_id: string;
  route_id: string;
  departure_time: string;
  default_sog: number;
  status: 'planned' | 'active' | 'completed';
  created_at: string;
}

export interface RouteWithWaypoints extends Route {
  waypoints: RouteWaypoint[];
}

// Projection types
export interface LegProjection {
  waypoint_index: number;
  waypoint_name: string;
  leg_distance_nm: number;
  estimated_time_hours: number;
  cumulative_eta: Date;
  zone_entries: ZoneEntry[];
}

export interface ZoneEntry {
  zone_type: string;
  zone_name: string;
  entry_time: Date;
  lat: number;
  lon: number;
}

export interface ProjectionResult {
  route_id: string;
  departure_time: Date;
  total_distance_nm: number;
  total_time_hours: number;
  arrival_time: Date;
  legs: LegProjection[];
  upcoming_entries: ZoneEntry[];
}
export type ZoneCrossingType = 'ENTRY' | 'EXIT';

export type ZoneType =
  | 'PROTECTED_AREA'
  | 'ECA'
  | 'POLAR'
  | 'TERRITORIAL'
  | 'CUSTOM';

export interface ZoneCrossingPoint {
  id: string;
  routeId: string;
  legIndex: number;
  crossingType: ZoneCrossingType;
  zoneType: ZoneType;
  zoneId: string;
  zoneName: string;
  lat: number;
  lon: number;
  distanceFromLegStartNm: number;
  eta?: string;
}