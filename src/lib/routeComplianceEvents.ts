export type RouteComplianceEvent = {
  id: string;
  areaId: string;
  zoneName: string;
  eventType: 'ENTRY' | 'EXIT';
  lat: number;
  lon: number;
  legIndex: number;
  distanceFromLegStartNm: number;
  level: 'MUST' | 'SHOULD' | 'CONSIDER';
  title: string;
  action: string;
};

type ZoneCrossingPoint = {
  id: string;
  lat: number;
  lon: number;
  crossingType: 'ENTRY' | 'EXIT';
  zoneName: string;
  legIndex: number;
  distanceFromLegStartNm: number;
};

export function buildRouteComplianceEvents(
  crossingPoints: ZoneCrossingPoint[]
): RouteComplianceEvent[] {
  const events: RouteComplianceEvent[] = [];

  for (const cp of crossingPoints) {
    // NORDREG
    if (cp.id.includes('CANADA_NORDREG') || cp.zoneName.toUpperCase().includes('NORDREG')) {
      events.push({
        id: `${cp.id}-route-event`,
        areaId: 'CANADA_NORDREG',
        zoneName: cp.zoneName,
        eventType: cp.crossingType,
        lat: cp.lat,
        lon: cp.lon,
        legIndex: cp.legIndex,
        distanceFromLegStartNm: cp.distanceFromLegStartNm,
        level: 'MUST',
        title:
          cp.crossingType === 'ENTRY'
            ? 'NORDREG entry reporting review'
            : 'NORDREG exit reporting review',
        action:
          cp.crossingType === 'ENTRY'
            ? 'Review whether initial / entry report must be submitted before entering Canadian Arctic reporting waters.'
            : 'Review whether final / exit report is required before leaving Canadian Arctic reporting waters.',
      });
    }

    // Lancaster MPA
    if (
      cp.id.includes('CANADA_LANCASTER_MPA') ||
      cp.zoneName.toUpperCase().includes('LANCASTER')
    ) {
      events.push({
        id: `${cp.id}-route-event`,
        areaId: 'CANADA_LANCASTER_MPA',
        zoneName: cp.zoneName,
        eventType: cp.crossingType,
        lat: cp.lat,
        lon: cp.lon,
        legIndex: cp.legIndex,
        distanceFromLegStartNm: cp.distanceFromLegStartNm,
        level: 'MUST',
        title:
          cp.crossingType === 'ENTRY'
            ? 'Lancaster Sound MPA entry review'
            : 'Lancaster Sound MPA exit review',
        action:
          cp.crossingType === 'ENTRY'
            ? 'Review protected-area operating restrictions before route execution.'
            : 'Confirm protected-area operating measures no longer apply after exit.',
      });
    }

    // NWP corridor = advisory/context
    if (cp.id.includes('CANADA_NWP') || cp.zoneName.toUpperCase().includes('NWP')) {
      events.push({
        id: `${cp.id}-route-event`,
        areaId: 'CANADA_NWP',
        zoneName: cp.zoneName,
        eventType: cp.crossingType,
        lat: cp.lat,
        lon: cp.lon,
        legIndex: cp.legIndex,
        distanceFromLegStartNm: cp.distanceFromLegStartNm,
        level: 'CONSIDER',
        title:
          cp.crossingType === 'ENTRY'
            ? 'Entering operational NWP corridor'
            : 'Leaving operational NWP corridor',
        action:
          cp.crossingType === 'ENTRY'
            ? 'Review ice, remoteness, SAR limitations, and route-specific constraints.'
            : 'Review whether NWP-specific operational context no longer applies after exit.',
      });
    }
  }

  return events;
}