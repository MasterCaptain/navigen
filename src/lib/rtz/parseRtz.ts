export type RtzWaypoint = {
  seq: number;
  name?: string;
  lat: number;
  lon: number;
  radius_m?: number;
  turn_rad_m?: number;
  speed_kt?: number;
  notes?: string;
};

export type ParsedRtz = {
  routeName: string;
  waypoints: RtzWaypoint[];
};

/**
 * Minimal RTZ parser.
 * Supports typical RTZ v1.0/v1.1 waypoint format with attributes like:
 *  - lat="N78 13.4" lon="E015 37.6"
 *  - or lat="78.2233" lon="15.6266"
 */
export function parseRtz(xmlText: string): ParsedRtz {
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("Invalid RTZ XML");

  const routeInfoEl = doc.querySelector("routeInfo");
  const routeEl = doc.querySelector("route");

  const routeName =
    routeInfoEl?.getAttribute("routeName")?.trim() ||
    routeInfoEl?.getAttribute("name")?.trim() ||
    doc.querySelector("route > name")?.textContent?.trim() ||
    routeEl?.getAttribute("name")?.trim() ||
    "Imported RTZ Route";

  const wpNodes = Array.from(doc.querySelectorAll("waypoint"));
  if (wpNodes.length === 0) throw new Error("No <waypoint> elements found in RTZ");

  const waypoints: RtzWaypoint[] = wpNodes.map((wp, i) => {
    const wpName =
      wp.querySelector("name")?.textContent?.trim() ||
      wp.getAttribute("name")?.trim() ||
      `WP${i + 1}`;

    const pos = wp.querySelector("position");
    if (!pos) throw new Error(`Waypoint ${i + 1} missing <position>`);

    const latRaw = pos.getAttribute("lat") || "";
    const lonRaw = pos.getAttribute("lon") || "";

    const lat = parseLatLon(latRaw, true);
    const lon = parseLatLon(lonRaw, false);

    const speedRaw =
      wp.querySelector("plannedSpeed")?.getAttribute("value") ||
      wp.querySelector("speed")?.textContent ||
      "";

    const speed_kt = speedRaw ? safeNum(speedRaw) : undefined;

    return {
      seq: i + 1,
      name: wpName,
      lat,
      lon,
      speed_kt: isFiniteNumber(speed_kt) ? speed_kt : undefined,
    };
  });

  return { routeName, waypoints };
}

function safeNum(v: string): number {
  return Number(String(v).trim());
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/**
 * Accept:
 * - Decimal degrees: "78.2233"
 * - DMS-ish: "N78 13.4" or "78 13.4 N"
 * - Compact: "N7813.4"
 */
function parseLatLon(input: string, isLat: boolean): number {
  const s = (input || "").trim();
  if (!s) throw new Error("Empty lat/lon");

  if (/^[+-]?\d+(\.\d+)?$/.test(s)) {
    const n = Number(s);
    validateRange(n, isLat);
    return n;
  }

  const hemiMatch = s.match(/[NSEW]/i);
  const hemi = hemiMatch ? hemiMatch[0].toUpperCase() : null;

  const nums = s
    .replace(/[NSEW]/gi, " ")
    .trim()
    .split(/[^\d.]+/)
    .filter(Boolean)
    .map(Number);

  if (nums.length === 0) throw new Error(`Cannot parse lat/lon: ${input}`);

  const deg = nums[0];
  const min = nums.length >= 2 ? nums[1] : 0;
  const sec = nums.length >= 3 ? nums[2] : 0;

  let val = Math.abs(deg) + min / 60 + sec / 3600;

  const negByDeg = Number(deg) < 0;
  const negByHemi = hemi ? hemi === "S" || hemi === "W" : false;

  if (negByDeg || negByHemi) val = -val;

  validateRange(val, isLat);
  return val;
}

function validateRange(v: number, isLat: boolean) {
  if (isLat && (v < -90 || v > 90)) {
    throw new Error(`Latitude out of range: ${v}`);
  }
  if (!isLat && (v < -180 || v > 180)) {
    throw new Error(`Longitude out of range: ${v}`);
  }
}