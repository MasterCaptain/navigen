// NMEA 0183 Parser for maritime navigation data
// Supports: GGA (GPS), HDT/HDG (Heading), VTG (Speed/Course), RMC (Recommended Minimum)

export interface NMEAPosition {
  lat: number;
  lng: number;
  timestamp?: Date;
}

export interface NMEAHeading {
  heading: number; // degrees true
  timestamp?: Date;
}

export interface NMEASpeed {
  sog: number; // Speed over ground (knots)
  cog: number; // Course over ground (degrees)
  timestamp?: Date;
}

export interface NMEAData {
  position?: NMEAPosition;
  heading?: NMEAHeading;
  speed?: NMEASpeed;
}

// Parse NMEA 0183 sentence
export function parseNMEA(sentence: string): NMEAData | null {
  if (!sentence.startsWith('$')) return null;
  
  const parts = sentence.split(',');
  const messageType = parts[0].substring(3); // Remove '$GP' or '$HE' prefix
  
  try {
    switch (messageType) {
      case 'GGA': return parseGGA(parts);
      case 'HDT': return parseHDT(parts);
      case 'HDG': return parseHDG(parts);
      case 'VTG': return parseVTG(parts);
      case 'RMC': return parseRMC(parts);
      default: return null;
    }
  } catch (err) {
    console.warn('NMEA parse error:', err);
    return null;
  }
}

// $GPGGA - Global Positioning System Fix Data
// Example: $GPGGA,123519,4807.038,N,01131.000,E,1,08,0.9,545.4,M,46.9,M,,*47
function parseGGA(parts: string[]): NMEAData | null {
  if (parts.length < 10) return null;
  
  const lat = parseDMCoordinate(parts[2], parts[3]);
  const lng = parseDMCoordinate(parts[4], parts[5]);
  
  if (lat === null || lng === null) return null;
  
  return {
    position: {
      lat,
      lng,
      timestamp: new Date()
    }
  };
}

// $HEHDT or $GPHDT - Heading True
// Example: $HEHDT,274.07,T*03
function parseHDT(parts: string[]): NMEAData | null {
  if (parts.length < 2) return null;
  
  const heading = parseFloat(parts[1]);
  if (isNaN(heading)) return null;
  
  return {
    heading: {
      heading,
      timestamp: new Date()
    }
  };
}

// $GPHDG - Heading, Deviation & Variation
// Example: $GPHDG,98.3,0.0,E,12.6,W*4D
function parseHDG(parts: string[]): NMEAData | null {
  if (parts.length < 2) return null;
  
  const heading = parseFloat(parts[1]);
  if (isNaN(heading)) return null;
  
  // Note: This is magnetic heading, but we'll treat as true for demo
  // In production: apply deviation + variation to get true heading
  
  return {
    heading: {
      heading,
      timestamp: new Date()
    }
  };
}

// $GPVTG - Track Made Good and Ground Speed
// Example: $GPVTG,054.7,T,034.4,M,005.5,N,010.2,K*48
function parseVTG(parts: string[]): NMEAData | null {
  if (parts.length < 8) return null;
  
  const cog = parseFloat(parts[1]); // Course over ground (true)
  const sog = parseFloat(parts[5]); // Speed over ground (knots)
  
  if (isNaN(cog) || isNaN(sog)) return null;
  
  return {
    speed: {
      sog,
      cog,
      timestamp: new Date()
    }
  };
}

// $GPRMC - Recommended Minimum Specific GPS/Transit Data
// Example: $GPRMC,123519,A,4807.038,N,01131.000,E,022.4,084.4,230394,003.1,W*6A
function parseRMC(parts: string[]): NMEAData | null {
  if (parts.length < 10) return null;
  
  const lat = parseDMCoordinate(parts[3], parts[4]);
  const lng = parseDMCoordinate(parts[5], parts[6]);
  const sog = parseFloat(parts[7]);
  const cog = parseFloat(parts[8]);
  
  if (lat === null || lng === null) return null;
  
  const result: NMEAData = {
    position: {
      lat,
      lng,
      timestamp: new Date()
    }
  };
  
  if (!isNaN(sog) && !isNaN(cog)) {
    result.speed = {
      sog,
      cog,
      timestamp: new Date()
    };
  }
  
  return result;
}

// Parse NMEA coordinate format (DDMM.MMMM) to decimal degrees
function parseDMCoordinate(value: string, direction: string): number | null {
  if (!value || !direction) return null;
  
  const floatValue = parseFloat(value);
  if (isNaN(floatValue)) return null;
  
  // Determine if latitude (2 digits) or longitude (3 digits)
  const isLat = direction === 'N' || direction === 'S';
  const degreeDigits = isLat ? 2 : 3;
  
  const degrees = Math.floor(floatValue / 100);
  const minutes = floatValue - (degrees * 100);
  
  let decimal = degrees + (minutes / 60);
  
  // Apply direction
  if (direction === 'S' || direction === 'W') {
    decimal = -decimal;
  }
  
  return decimal;
}

// Generate simulated NMEA data for testing (Longyearbyen area)
export function generateSimulatedNMEA(
  basePosition = { lat: 78.2232, lng: 15.6267 }, 
  baseHeading = 42,
  speedKnots = 8.5,
  course = 42
): string[] {
  const sentences: string[] = [];
  
  // Simulate movement: move vessel forward based on course and speed
  const distanceNm = (speedKnots / 3600); // Distance traveled in 1 second (nautical miles)
  
  // Convert course to radians
  const courseRad = (course * Math.PI) / 180;
  
  // Calculate new position (using simple flat-earth approximation for small distances)
  // At high latitudes like Svalbard, longitude degrees are much smaller
  const latChange = (distanceNm / 60) * Math.cos(courseRad); // 1 nm = 1/60 degree latitude
  const lngChange = (distanceNm / 60) * Math.sin(courseRad) / Math.cos(basePosition.lat * Math.PI / 180);
  
  const lat = basePosition.lat + latChange + (Math.random() - 0.5) * 0.00001; // Add small GPS noise
  const lng = basePosition.lng + lngChange + (Math.random() - 0.5) * 0.00001;
  
  // Simulate gradual heading changes (vessel slowly turns)
  const headingChange = (Math.random() - 0.5) * 0.5; // ±0.25° per update
  const heading = ((baseHeading + headingChange + 360) % 360);
  
  // Convert to NMEA format
  const latDM = toNMEACoordinate(lat, true);
  const lngDM = toNMEACoordinate(lng, false);
  
  // GGA sentence
  const time = new Date().toISOString().substring(11, 19).replace(/:/g, '');
  sentences.push(`$GPGGA,${time},${latDM.value},${latDM.dir},${lngDM.value},${lngDM.dir},1,08,0.9,10.2,M,46.9,M,,*47`);
  
  // HDT sentence
  sentences.push(`$HEHDT,${heading.toFixed(2)},T*03`);
  
  // VTG sentence (speed)
  const sog = speedKnots + (Math.random() - 0.5) * 0.5; // Add slight speed variation
  sentences.push(`$GPVTG,${course.toFixed(1)},T,,M,${sog.toFixed(1)},N,${(sog * 1.852).toFixed(1)},K*48`);
  
  return sentences;
}

// Convert decimal degrees to NMEA format (DDMM.MMMM)
function toNMEACoordinate(decimal: number, isLat: boolean): { value: string, dir: string } {
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutes = (abs - degrees) * 60;
  
  const value = `${degrees.toString().padStart(isLat ? 2 : 3, '0')}${minutes.toFixed(4).padStart(7, '0')}`;
  
  let dir: string;
  if (isLat) {
    dir = decimal >= 0 ? 'N' : 'S';
  } else {
    dir = decimal >= 0 ? 'E' : 'W';
  }
  
  return { value, dir };
}