import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fcwzmwoahottepzhmynz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd3ptd29haG90dGVwemhteW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxODUwODIsImV4cCI6MjA4ODc2MTA4Mn0.XiRsR8MZMCzAakmso0I25UgXaPif8whb98DBuxr-osE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Vessel {
  id: string;
  imo_number: string;
  vessel_name: string;
  mmsi?: string;
  vessel_type: string;
  flag_state: string;
  gross_tonnage: number;
  polar_class?: string;
  ice_class?: string;
  length?: number;
  beam?: number;
  draft?: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface VesselPosition {
  id: string;
  vessel_id: string;
  latitude: number;
  longitude: number;
  heading: number;
  speed: number;
  course: number;
  timestamp: string;
}

export interface Route {
  id: string;
  vessel_id: string;
  name: string;
  description?: string;
  waypoints: any; // JSONB
  source_type: 'manual' | 'rtz' | 'imported';
  created_at: string;
  updated_at: string;
}

export interface ComplianceLog {
  id: string;
  vessel_id: string;
  route_id?: string;
  rule_type: 'MUST' | 'SHOULD' | 'CONSIDER';
  rule_category: string; // IMO, SOLAS, MARPOL, IAATO, Svalbard
  rule_description: string;
  status: 'compliant' | 'non_compliant' | 'warning' | 'info';
  location?: any; // JSONB with lat/lng
  timestamp: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'captain' | 'crew';
  full_name?: string;
  created_at: string;
}
