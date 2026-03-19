import type { RouteWithWaypoints } from '../types/routes';

export interface WaypointComplianceZone {
  waypointIndex: number;
  waypointName: string;
  lat: number;
  lon: number;
  zones: string[];
  detectedAreas: string[];
  isPolarWater: boolean;
  isSvalbard: boolean;
  isProtectedArea: boolean;
  specialRegulations: string[];
}

export interface RouteComplianceAnalysis {
  totalWaypoints: number;
  zonesEncountered: string[];
  detectedAreasAll: string[];
  polarWaterSegments: number;
  svalbardSegments: number;
  protectedAreaSegments: number;
  waypointAnalysis: WaypointComplianceZone[];
  criticalWarnings: string[];
  aggregatedRegulations: string[];
}

/**
 * Analyzes an entire route for compliance requirements
 * Returns detailed zone information for each waypoint
 */
export function analyzeRouteCompliance(route: RouteWithWaypoints | null): RouteComplianceAnalysis | null {
  if (!route || !route.waypoints || route.waypoints.length === 0) {
    return null;
  }

  const waypointAnalysis: WaypointComplianceZone[] = [];
  const allZones = new Set<string>();
  const allDetectedAreas = new Set<string>();
  const allRegulations = new Set<string>();
  const criticalWarnings: string[] = [];
  
  let polarWaterSegments = 0;
  let svalbardSegments = 0;
  let protectedAreaSegments = 0;

  // Analyze each waypoint
  route.waypoints.forEach((waypoint, index) => {
    const analysis = analyzeWaypointLocation(waypoint.lat, waypoint.lon);
    
    waypointAnalysis.push({
      waypointIndex: index,
      waypointName: waypoint.name || `WP${index + 1}`,
      lat: waypoint.lat,
      lon: waypoint.lon,
      zones: analysis.zones,
      detectedAreas: analysis.detectedAreas,
      isPolarWater: analysis.isPolarWater,
      isSvalbard: analysis.isSvalbard,
      isProtectedArea: analysis.isProtectedArea,
      specialRegulations: analysis.specialRegulations
    });

    // Aggregate data
    analysis.zones.forEach(z => allZones.add(z));
    analysis.detectedAreas.forEach(a => allDetectedAreas.add(a));
    analysis.specialRegulations.forEach(r => allRegulations.add(r));

    if (analysis.isPolarWater) polarWaterSegments++;
    if (analysis.isSvalbard) svalbardSegments++;
    if (analysis.isProtectedArea) protectedAreaSegments++;

    // Generate critical warnings
    if (analysis.isProtectedArea) {
      criticalWarnings.push(
        `WP${index + 1} (${waypoint.name || 'unnamed'}): Inside protected area - Special permits may be required`
      );
    }
    if (analysis.isSvalbard && analysis.isProtectedArea) {
      criticalWarnings.push(
        `WP${index + 1} (${waypoint.name || 'unnamed'}): Svalbard protected area - Strict wildlife and discharge regulations apply`
      );
    }
  });

  return {
    totalWaypoints: route.waypoints.length,
    zonesEncountered: Array.from(allZones),
    detectedAreasAll: Array.from(allDetectedAreas),
    polarWaterSegments,
    svalbardSegments,
    protectedAreaSegments,
    waypointAnalysis,
    criticalWarnings,
    aggregatedRegulations: Array.from(allRegulations)
  };
}

/**
 * Analyzes a single location for zone membership and regulations
 */
function analyzeWaypointLocation(lat: number, lon: number) {
  const zones: string[] = [];
  const detectedAreas: string[] = [];
  const specialRegulations: string[] = [];
  let isPolarWater = false;
  let isSvalbard = false;
  let isProtectedArea = false;

  // IMO Polar Code Detection
  if (lat >= 60) {
    detectedAreas.push('IMO_N60');
    zones.push('ARCTIC POLAR');
    isPolarWater = true;
    specialRegulations.push('IMO Polar Code (Arctic)');
  }
  if (lat <= -60) {
    detectedAreas.push('IMO_S60');
    zones.push('ANTARCTIC POLAR');
    isPolarWater = true;
    specialRegulations.push('IMO Polar Code (Antarctic)');
  }

  // Svalbard Detection (rough bounding box: 74-81°N, 10-35°E)
  if (lat >= 74 && lat <= 81 && lon >= 10 && lon <= 35) {
    zones.push('SVALBARD');
    isSvalbard = true;
    specialRegulations.push('Svalbardmiljøloven');
    
    // Check for specific Svalbard protected areas
    const protectedArea = checkSvalbardProtectedAreas(lat, lon);
    if (protectedArea) {
      zones.push(protectedArea);
      isProtectedArea = true;
      specialRegulations.push(`${protectedArea} Regulations`);
    }
  }

  // Norwegian EEZ and territorial waters
  if (lat >= 58 && lat <= 72 && lon >= 4 && lon <= 31) {
    zones.push('NORWEGIAN EEZ');
    specialRegulations.push('Norwegian Maritime Regulations');
  }

  return {
    zones,
    detectedAreas,
    specialRegulations,
    isPolarWater,
    isSvalbard,
    isProtectedArea
  };
}

/**
 * Checks if a location is within specific Svalbard protected areas
 */
function checkSvalbardProtectedAreas(lat: number, lon: number): string | null {
  // Nordvest-Spitsbergen nasjonalpark (approximate bounds)
  if (lat >= 78.5 && lat <= 80.5 && lon >= 10 && lon <= 14) {
    return 'Nordvest-Spitsbergen NP';
  }
  
  // Sør-Spitsbergen nasjonalpark (approximate bounds)
  if (lat >= 76.5 && lat <= 77.5 && lon >= 15 && lon <= 18) {
    return 'Sør-Spitsbergen NP';
  }
  
  // Forlandet nasjonalpark (approximate bounds)
  if (lat >= 78 && lat <= 78.7 && lon >= 10.5 && lon <= 11.5) {
    return 'Forlandet NP';
  }
  
  // Nordaust-Svalbard naturreservat (approximate bounds)
  if (lat >= 79.5 && lat <= 80.5 && lon >= 18 && lon <= 29) {
    return 'Nordaust-Svalbard NR';
  }
  
  // Søraust-Svalbard naturreservat (approximate bounds)
  if (lat >= 77 && lat <= 78.5 && lon >= 22 && lon <= 28) {
    return 'Søraust-Svalbard NR';
  }

  return null;
}

/**
 * Generates a pre-departure compliance checklist based on route analysis
 */
export function generatePreDepartureChecklist(analysis: RouteComplianceAnalysis | null): string[] {
  if (!analysis) return [];

  const checklist: string[] = [];

  // Polar water requirements
  if (analysis.polarWaterSegments > 0) {
    checklist.push('✓ Polar Ship Certificate valid and onboard');
    checklist.push('✓ Polar Water Operations Manual (PWOM) accessible to crew');
    checklist.push('✓ Master and deck officers hold polar waters training certificates');
    checklist.push('✓ Ice navigation equipment operational');
  }

  // Svalbard requirements
  if (analysis.svalbardSegments > 0) {
    checklist.push('✓ All tanks ready for zero discharge compliance (Svalbard)');
    checklist.push('✓ Only low-sulfur fuel (<0.1%) onboard for Svalbard waters');
    checklist.push('✓ Crew briefed on 300m wildlife distance requirements');
    checklist.push('✓ Consider notifying Sysselmannen of expedition plans');
  }

  // Protected area requirements
  if (analysis.protectedAreaSegments > 0) {
    checklist.push('✓ Verify all required permits for protected areas');
    checklist.push('✓ Review specific landing restrictions for each protected area');
    checklist.push('✓ Ensure biosecurity protocols in place');
  }

  // General maritime requirements (always)
  checklist.push('✓ Voyage plan prepared, reviewed, and approved');
  checklist.push('✓ Bridge watch schedule confirmed (SOLAS/STCW)');
  checklist.push('✓ Oil Record Book (ORB) and Garbage Record Book (GRB) available');
  checklist.push('✓ NAVTEX and weather routing checked for entire route');

  return checklist;
}
