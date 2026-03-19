export type ZoneEventType = 'ENTRY' | 'EXIT';

export type ZoneActivityEvent = {
  id: string;
  areaId: string;
  eventType: ZoneEventType;
  timestampUtc: string;
  lat: number;
  lng: number;
};

export function detectZoneTransitions(
  previousAreaIds: string[],
  currentAreaIds: string[],
  position: { lat: number; lng: number },
  now: Date = new Date()
): ZoneActivityEvent[] {
  const prev = new Set(previousAreaIds);
  const curr = new Set(currentAreaIds);

  const events: ZoneActivityEvent[] = [];

  for (const areaId of currentAreaIds) {
    if (!prev.has(areaId)) {
      events.push({
        id: `${areaId}-ENTRY-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        areaId,
        eventType: 'ENTRY',
        timestampUtc: now.toISOString(),
        lat: position.lat,
        lng: position.lng,
      });
    }
  }

  for (const areaId of previousAreaIds) {
    if (!curr.has(areaId)) {
      events.push({
        id: `${areaId}-EXIT-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
        areaId,
        eventType: 'EXIT',
        timestampUtc: now.toISOString(),
        lat: position.lat,
        lng: position.lng,
      });
    }
  }

  return events;
}