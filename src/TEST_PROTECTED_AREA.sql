-- Quick test: Insert a protected area near Longyearbyen for testing
-- Run this AFTER you've run /src/lib/database-schema.sql

-- Delete test area if it exists (for re-running this script)
DELETE FROM protected_areas WHERE area_id = 'PROTECTED_TEST_LONGYEARBYEN';

-- Insert test protected area
INSERT INTO protected_areas (
  area_id, 
  name, 
  name_en, 
  area_type, 
  region, 
  description,
  geometry, 
  established_date, 
  area_size_km2, 
  managing_authority, 
  status,
  regulations
) VALUES (
  'PROTECTED_TEST_LONGYEARBYEN',
  'Test Verneområde Longyearbyen',
  'Test Protected Area Longyearbyen',
  'other',
  'SVALBARD',
  'Test area for development - visible near Longyearbyen airport',
  '{
    "type": "Polygon", 
    "coordinates": [[
      [15.5, 78.2], 
      [15.7, 78.2], 
      [15.7, 78.25], 
      [15.5, 78.25], 
      [15.5, 78.2]
    ]]
  }',
  '2024-01-01',
  50.5,
  'Sysselmannen på Svalbard',
  'active',
  '{
    "entry_prohibited": false,
    "wildlife_distance": 300,
    "landing_permit": true,
    "speed_limit_knots": 5
  }'
);

-- Verify insertion
SELECT 
  area_id, 
  name, 
  region, 
  area_type, 
  status,
  area_size_km2,
  established_date
FROM protected_areas 
WHERE region = 'SVALBARD';
