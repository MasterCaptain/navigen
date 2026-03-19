-- NAVIGEN Database Schema
-- Run this SQL in your Supabase SQL Editor (https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/sql)

-- 1. User Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'crew' CHECK (role IN ('admin', 'captain', 'crew')),
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
CREATE POLICY "Users can view own profile" 
  ON public.user_profiles FOR SELECT 
  USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- 2. Vessels Table
CREATE TABLE IF NOT EXISTS public.vessels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  imo_number TEXT UNIQUE NOT NULL,
  vessel_name TEXT NOT NULL,
  mmsi TEXT,
  vessel_type TEXT NOT NULL,
  flag_state TEXT NOT NULL,
  gross_tonnage INTEGER NOT NULL,
  polar_class TEXT,
  ice_class TEXT,
  length NUMERIC,
  beam NUMERIC,
  draft NUMERIC,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;

-- Users can view vessels they own
DROP POLICY IF EXISTS "Users can view own vessels" ON public.vessels;
CREATE POLICY "Users can view own vessels" 
  ON public.vessels FOR SELECT 
  USING (auth.uid() = owner_id);

-- Users can insert their own vessels
DROP POLICY IF EXISTS "Users can create vessels" ON public.vessels;
CREATE POLICY "Users can create vessels" 
  ON public.vessels FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own vessels
DROP POLICY IF EXISTS "Users can update own vessels" ON public.vessels;
CREATE POLICY "Users can update own vessels" 
  ON public.vessels FOR UPDATE 
  USING (auth.uid() = owner_id);

-- 3. Vessel Positions (realtime tracking)
CREATE TABLE IF NOT EXISTS public.vessel_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  heading NUMERIC,
  speed NUMERIC,
  course NUMERIC,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_vessel_positions_vessel_id ON public.vessel_positions(vessel_id);
CREATE INDEX IF NOT EXISTS idx_vessel_positions_timestamp ON public.vessel_positions(timestamp DESC);

ALTER TABLE public.vessel_positions ENABLE ROW LEVEL SECURITY;

-- Users can view positions for vessels they own
DROP POLICY IF EXISTS "Users can view positions for own vessels" ON public.vessel_positions;
CREATE POLICY "Users can view positions for own vessels" 
  ON public.vessel_positions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = vessel_positions.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- Users can insert positions for vessels they own
DROP POLICY IF EXISTS "Users can insert positions for own vessels" ON public.vessel_positions;
CREATE POLICY "Users can insert positions for own vessels" 
  ON public.vessel_positions FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = vessel_positions.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- 4. Routes Table
CREATE TABLE IF NOT EXISTS public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  waypoints JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_type TEXT NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'rtz', 'imported')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Users can view routes for vessels they own
DROP POLICY IF EXISTS "Users can view routes for own vessels" ON public.routes;
CREATE POLICY "Users can view routes for own vessels" 
  ON public.routes FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = routes.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- Users can insert routes for vessels they own
DROP POLICY IF EXISTS "Users can insert routes for own vessels" ON public.routes;
CREATE POLICY "Users can insert routes for own vessels" 
  ON public.routes FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = routes.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- Users can update routes for vessels they own
DROP POLICY IF EXISTS "Users can update routes for own vessels" ON public.routes;
CREATE POLICY "Users can update routes for own vessels" 
  ON public.routes FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = routes.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- Users can delete routes for vessels they own
DROP POLICY IF EXISTS "Users can delete routes for own vessels" ON public.routes;
CREATE POLICY "Users can delete routes for own vessels" 
  ON public.routes FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = routes.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- 5. Compliance Logs
CREATE TABLE IF NOT EXISTS public.compliance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vessel_id UUID REFERENCES public.vessels(id) ON DELETE CASCADE NOT NULL,
  route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN ('MUST', 'SHOULD', 'CONSIDER')),
  rule_category TEXT NOT NULL,
  rule_description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('compliant', 'non_compliant', 'warning', 'info')),
  location JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_logs_vessel_id ON public.compliance_logs(vessel_id);
CREATE INDEX IF NOT EXISTS idx_compliance_logs_timestamp ON public.compliance_logs(timestamp DESC);

ALTER TABLE public.compliance_logs ENABLE ROW LEVEL SECURITY;

-- Users can view compliance logs for vessels they own
DROP POLICY IF EXISTS "Users can view compliance logs for own vessels" ON public.compliance_logs;
CREATE POLICY "Users can view compliance logs for own vessels" 
  ON public.compliance_logs FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = compliance_logs.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- Users can insert compliance logs for vessels they own
DROP POLICY IF EXISTS "Users can insert compliance logs for own vessels" ON public.compliance_logs;
CREATE POLICY "Users can insert compliance logs for own vessels" 
  ON public.compliance_logs FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.vessels 
      WHERE vessels.id = compliance_logs.vessel_id 
      AND vessels.owner_id = auth.uid()
    )
  );

-- 6. Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'crew');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
DROP TRIGGER IF EXISTS update_vessels_updated_at ON public.vessels;
CREATE TRIGGER update_vessels_updated_at
  BEFORE UPDATE ON public.vessels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_updated_at ON public.routes;
CREATE TRIGGER update_routes_updated_at
  BEFORE UPDATE ON public.routes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Protected Areas (Svalbard verneområder og andre reguleringssoner)
-- Supports GeoJSON MultiPolygon format for complex geometries
CREATE TABLE IF NOT EXISTS public.protected_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id TEXT UNIQUE NOT NULL,  -- e.g. 'PROTECTED_SASSEN_BUNSOW'
  name TEXT NOT NULL,            -- e.g. 'Sassen-Bünsow Land Nasjonalpark'
  name_en TEXT,                  -- English name (optional)
  area_type TEXT NOT NULL CHECK (area_type IN ('national_park', 'nature_reserve', 'bird_reserve', 'geotope', 'plant_protection', 'marine_protected', 'other')),
  region TEXT NOT NULL,          -- e.g. 'SVALBARD', 'NORWAY', 'ANTARCTICA'
  description TEXT,
  regulations JSONB,             -- JSON object with rules: { "entry_prohibited": false, "wildlife_distance": 300, "landing_permit": true }
  geometry JSONB NOT NULL,       -- GeoJSON geometry (Polygon or MultiPolygon)
  established_date DATE,
  area_size_km2 NUMERIC,
  managing_authority TEXT,       -- e.g. 'Sysselmannen på Svalbard'
  source_url TEXT,
  metadata JSONB,                -- Additional metadata (language versions, etc.)
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'proposed', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_protected_areas_region ON public.protected_areas(region);
CREATE INDEX IF NOT EXISTS idx_protected_areas_type ON public.protected_areas(area_type);
CREATE INDEX IF NOT EXISTS idx_protected_areas_status ON public.protected_areas(status);

-- Enable RLS - Protected areas are public READ-ONLY
ALTER TABLE public.protected_areas ENABLE ROW LEVEL SECURITY;

-- Everyone can read protected areas (public data)
DROP POLICY IF EXISTS "Protected areas are publicly readable" ON public.protected_areas;
CREATE POLICY "Protected areas are publicly readable" 
  ON public.protected_areas FOR SELECT 
  USING (true);

-- Only admins can insert/update/delete (done via Supabase Dashboard or server-side)
-- No INSERT/UPDATE/DELETE policies = only service role can modify

-- Add update trigger
DROP TRIGGER IF EXISTS update_protected_areas_updated_at ON public.protected_areas;
CREATE TRIGGER update_protected_areas_updated_at
  BEFORE UPDATE ON public.protected_areas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Done! Your NAVIGEN database is ready 🚢