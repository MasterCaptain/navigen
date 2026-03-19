// RTZ (Route Exchange Format) Parser
// Parses IEC 61174 compliant RTZ files

export interface RTZWaypoint {
  name: string;
  lat: number;
  lon: number;
  plannedSpeed?: number; // knots
  sequence: number;
}

export interface RTZRoute {
  name: string;
  waypoints: RTZWaypoint[];
}

/**
 * Parse RTZ XML file and extract route data
 */
export async function parseRTZ(file: File): Promise<RTZRoute> {
  const text = await file.text();
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    throw new Error("Invalid RTZ file format");
  }

  // Extract route name
  const routeElement = xmlDoc.querySelector("route");
  const routeName = routeElement?.getAttribute("name") || file.name.replace(".rtz", "");

  // Extract waypoints
  const waypointElements = xmlDoc.querySelectorAll("waypoint");
  if (waypointElements.length < 2) {
    throw new Error("Route must have at least 2 waypoints");
  }

  const waypoints: RTZWaypoint[] = [];
  
  waypointElements.forEach((wp, index) => {
    // Get position
    const position = wp.querySelector("position");
    const lat = parseFloat(position?.getAttribute("lat") || "0");
    const lon = parseFloat(position?.getAttribute("lon") || "0");

    // Validate coordinates
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      throw new Error(`Invalid coordinates at waypoint ${index + 1}`);
    }

    // Get waypoint name
    const name = wp.getAttribute("name") || `WP${index + 1}`;

    // Get planned speed (if exists)
    const leg = wp.querySelector("leg");
    const speedElement = leg?.querySelector("plannedSpeed");
    const plannedSpeed = speedElement ? parseFloat(speedElement.textContent || "0") : undefined;

    waypoints.push({
      name,
      lat,
      lon,
      plannedSpeed,
      sequence: index
    });
  });

  return {
    name: routeName,
    waypoints
  };
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in nautical miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3440.065; // Earth's radius in nautical miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * Math.PI / 180;
}

/**
 * Validate RTZ route data
 */
export function validateRoute(route: RTZRoute): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!route.name || route.name.trim().length === 0) {
    errors.push("Route name is required");
  }

  if (route.waypoints.length < 2) {
    errors.push("Route must have at least 2 waypoints");
  }

  // Check for reasonable leg distances (< 5000 nm)
  for (let i = 0; i < route.waypoints.length - 1; i++) {
    const wp1 = route.waypoints[i];
    const wp2 = route.waypoints[i + 1];
    const distance = calculateDistance(wp1.lat, wp1.lon, wp2.lat, wp2.lon);
    
    if (distance > 5000) {
      errors.push(`Unreasonable leg distance at ${wp1.name} -> ${wp2.name}: ${distance.toFixed(1)} nm`);
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
