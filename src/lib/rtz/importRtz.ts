import type { ParsedRtz } from "./parseRtz";
import type { RouteWithWaypoints, RouteWaypoint } from "../../types/routes";

// Shared mock route storage - exported so VoyageModuleV2 can use the same reference
export const mockRoutesStorage: RouteWithWaypoints[] = [];

export async function importRtzToDb(parsed: ParsedRtz): Promise<RouteWithWaypoints> {
  // Create mock route with waypoints
  const routeId = `route-${Date.now()}`;
  const ownerId = 'mock-user-id';
  
  const route: RouteWithWaypoints = {
    id: routeId,
    owner_id: ownerId,
    name: parsed.routeName,
    region_tag: null,
    source_type: "rtz",
    file_name: `${parsed.routeName}.rtz`,
    distance_nm: null,
    waypoint_count: parsed.waypoints.length,
    created_at: new Date().toISOString(),
    last_used: null,
    waypoints: parsed.waypoints.map((w) => ({
      id: `wp-${routeId}-${w.seq}`,
      route_id: routeId,  // Use consistent route ID
      owner_id: ownerId,
      seq: w.seq,
      name: w.name,
      lat: w.lat,
      lon: w.lon,
      planned_speed: w.speed_kt || null,
      leg_distance_nm: undefined
    }))
  };

  // Store in shared memory
  mockRoutesStorage.push(route);

  console.log('✅ Mock imported route:', route.name, 'with', route.waypoints.length, 'waypoints');

  return route;
}