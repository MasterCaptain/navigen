// Compliance Projection Engine
// Calculates when vessel will enter different zones along route

import type { RouteWithWaypoints, LegProjection, ProjectionResult, ZoneEntry } from '../types/routes';

/**
 * Run compliance projection for a route
 */
export function runProjection(
  route: RouteWithWaypoints,
  departureTime: Date,
  defaultSOG: number,
  currentPosition?: { lat: number; lng: number }
): ProjectionResult {
  const legs: LegProjection[] = [];
  let cumulativeTime = 0; // hours

  // Process each leg
  for (let i = 0; i < route.waypoints.length; i++) {
    const wp = route.waypoints[i];
    
    // Calculate leg distance if not already set
    let legDistance = wp.leg_distance_nm || 0;
    if (i > 0 && legDistance === 0) {
      const prevWp = route.waypoints[i - 1];
      legDistance = calculateDistance(prevWp.lat, prevWp.lon, wp.lat, wp.lon);
    }
    
    const speed = wp.planned_speed || defaultSOG;
    const legTime = legDistance > 0 ? legDistance / speed : 0; // hours

    cumulativeTime += legTime;
    const eta = new Date(departureTime.getTime() + cumulativeTime * 60 * 60 * 1000);

    // Detect zone entries along this leg
    const zoneEntries: ZoneEntry[] = [];
    
    if (i > 0) {
      const prevWp = route.waypoints[i - 1];
      const detectedZones = detectZoneEntries(prevWp.lat, prevWp.lon, wp.lat, wp.lon, legTime, eta);
      zoneEntries.push(...detectedZones);
    }

    legs.push({
      waypoint_index: i,
      waypoint_name: wp.name || `WP${i + 1}`,
      leg_distance_nm: legDistance,
      estimated_time_hours: legTime,
      cumulative_eta: eta,
      zone_entries: zoneEntries
    });
  }

  // Collect all upcoming zone entries (sorted by time)
  const allEntries: ZoneEntry[] = [];
  legs.forEach(leg => allEntries.push(...leg.zone_entries));
  allEntries.sort((a, b) => a.entry_time.getTime() - b.entry_time.getTime());

  const totalDistance = legs.reduce((sum, leg) => sum + leg.leg_distance_nm, 0);
  const totalTime = cumulativeTime;
  const arrivalTime = new Date(departureTime.getTime() + totalTime * 60 * 60 * 1000);

  return {
    route_id: route.id,
    departure_time: departureTime,
    total_distance_nm: totalDistance,
    total_time_hours: totalTime,
    arrival_time: arrivalTime,
    legs,
    upcoming_entries: allEntries
  };
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in nautical miles
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Detect zone entries along a leg
 * This is a simplified version - production would use proper GIS intersection
 */
function detectZoneEntries(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  legTimeHours: number,
  legETA: Date
): ZoneEntry[] {
  const entries: ZoneEntry[] = [];

  // Svalbard Territorial Waters (12nm as per Svalbard Treaty and Norwegian law)
  if (crossesSvalbardFPZ(lat1, lon1, lat2, lon2)) {
    entries.push({
      zone_type: 'FPZ',
      zone_name: 'Svalbard Territorial Waters (12NM)',
      entry_time: new Date(legETA.getTime() - legTimeHours * 0.6 * 60 * 60 * 1000),
      lat: lat2,
      lon: lon2,
    });
  }

  // Arctic Polar Waters (>66.5°N)
  if (crossesArcticCircle(lat1, lat2)) {
    entries.push({
      zone_type: 'POLAR',
      zone_name: 'Arctic Polar Waters',
      entry_time: new Date(legETA.getTime() - legTimeHours * 0.5 * 60 * 60 * 1000),
      lat: 66.5,
      lon: (lon1 + lon2) / 2
    });
  }

  // Norwegian ECA (if applicable)
  if (crossesNorwegianECA(lat1, lon1, lat2, lon2)) {
    entries.push({
      zone_type: 'ECA',
      zone_name: 'Norwegian ECA',
      entry_time: new Date(legETA.getTime() - legTimeHours * 0.3 * 60 * 60 * 1000),
      lat: (lat1 + lat2) / 2,
      lon: (lon1 + lon2) / 2
    });
  }

  // Svalbard Nature Reserves
  if (crossesSvalbardNatureReserve(lat1, lon1, lat2, lon2)) {
    entries.push({
      zone_type: 'MPA',
      zone_name: 'Svalbard Nature Reserve',
      entry_time: new Date(legETA.getTime() - legTimeHours * 0.4 * 60 * 60 * 1000),
      lat: (lat1 + lat2) / 2,
      lon: (lon1 + lon2) / 2
    });
  }

  return entries;
}

/**
 * Check if leg crosses Svalbard FPZ (simplified)
 */
function crossesSvalbardFPZ(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  const svalbardLat = 78.2232;
  const svalbardLon = 15.6267;
  const fpzRadius = 4 / 60; // 4 nautical miles in degrees (approximation)

  // Check if either endpoint or midpoint is within FPZ
  const checks = [
    { lat: lat1, lon: lon1 },
    { lat: lat2, lon: lon2 },
    { lat: (lat1 + lat2) / 2, lon: (lon1 + lon2) / 2 }
  ];

  for (const point of checks) {
    const distance = Math.sqrt(
      Math.pow(point.lat - svalbardLat, 2) + 
      Math.pow(point.lon - svalbardLon, 2)
    );
    if (distance < fpzRadius && distance > fpzRadius * 0.5) {
      return true;
    }
  }

  return false;
}

/**
 * Check if leg crosses Arctic Circle (66.5°N)
 */
function crossesArcticCircle(lat1: number, lat2: number): boolean {
  return (lat1 < 66.5 && lat2 > 66.5) || (lat1 > 66.5 && lat2 < 66.5);
}

/**
 * Check if leg crosses Norwegian ECA (simplified)
 */
function crossesNorwegianECA(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  // Norwegian coast ECA: roughly 62-72°N, 4-30°E
  const inECA = (lat: number, lon: number) => 
    lat > 62 && lat < 72 && lon > 4 && lon < 30;

  return (inECA(lat1, lon1) !== inECA(lat2, lon2));
}

/**
 * Check if leg crosses Svalbard nature reserves (simplified)
 */
function crossesSvalbardNatureReserve(lat1: number, lon1: number, lat2: number, lon2: number): boolean {
  // Simplified: check if in Svalbard region (77-81°N, 10-34°E)
  const inSvalbard = (lat: number, lon: number) =>
    lat > 77 && lat < 81 && lon > 10 && lon < 34;

  const midLat = (lat1 + lat2) / 2;
  const midLon = (lon1 + lon2) / 2;

  return inSvalbard(midLat, midLon) && midLat > 78.5; // Northern Svalbard
}

/**
 * Format time remaining
 */
export function formatTimeRemaining(hours: number): string {
  const totalMinutes = Math.floor(hours * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h}h ${m}m`;
}

/**
 * Format ETA
 */
export function formatETA(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hours}:${minutes}`;
}