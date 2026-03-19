# Kartverket GeoJSON Integration Guide

## 🚨 KNOWN ISSUE
**Norwegian fjords currently show "HIGH SEAS" instead of "COASTAL"**

This is because Norway mainland territorial waters (12NM) polygons are NOT yet implemented.

---

## 📋 Required Kartverket Data

### 1. **Norway Mainland - Territorialgrense 12NM** (Priority 1)
- **Source:** Kartverket / Geonorge
- **Dataset name:** "Territorialgrense 12 nautiske mil"
- **Coverage:** Norway mainland + all fjords (58-71°N, 4-31°E)
- **File to create:** `/data/polygons/norwayTerritorial.ts`
- **areaId:** `NORWAY_12NM`
- **Ruleset zone:** `COASTAL`

### 2. **Norway Economic Zone (EEZ) 200NM** (Optional)
- **Source:** Kartverket / Geonorge
- **Dataset name:** "Norsk økonomisk sone"
- **Coverage:** 12-200 NM from Norwegian baseline
- **File to create:** `/data/polygons/norwayEEZ.ts`
- **areaId:** `NORWAY_EEZ`
- **Ruleset zone:** `EEZ` (separate rules from territorial waters)

### 3. **Other countries** (Future)
- Denmark, Sweden, Iceland, Greenland, etc.
- Same structure as Norway

---

## 🛠️ Implementation Steps

### Step 1: Get GeoJSON data from Kartverket

#### Option A: Kartverket API (Recommended)
```bash
# Example API endpoint (adjust based on actual Kartverket API)
curl "https://kartkatalog.geonorge.no/api/datasets/{dataset-id}/geojson" > norway_12nm.geojson
```

#### Option B: Manual download from Geonorge
1. Go to https://kartkatalog.geonorge.no/
2. Search for "Territorialgrense 12 nautiske mil"
3. Download GeoJSON format
4. Save as `norway_12nm.geojson`

---

### Step 2: Convert GeoJSON to TypeScript

**CRITICAL: GeoJSON uses [lng, lat] but our format uses [lat, lng]**

```typescript
// Input: GeoJSON from Kartverket
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [5.123, 60.456],  // GeoJSON: [lng, lat]
            [5.789, 60.789],
            // ... more coordinates
          ]
        ]
      }
    }
  ]
}

// Output: Our TypeScript format
const NORWAY_MAINLAND_12NM: LatLng[] = [
  [60.456, 5.123],  // Our format: [lat, lng]
  [60.789, 5.789],
  // ... more coordinates
];
```

**Python conversion script:**
```python
import json

with open('norway_12nm.geojson') as f:
    data = json.load(f)

# Extract coordinates and swap lng/lat to lat/lng
coords = data['features'][0]['geometry']['coordinates'][0]
converted = [[lat, lng] for lng, lat in coords]

# Print TypeScript format
print("const NORWAY_MAINLAND_12NM: LatLng[] = [")
for lat, lng in converted:
    print(f"  [{lat}, {lng}],")
print("];")
```

---

### Step 3: Create `/data/polygons/norwayTerritorial.ts`

```typescript
import type { RegulatoryPolygon } from '../geoTriggers';
import type { LatLng } from '../geoTriggers';

// --- NORGE TERRITORIALGRENSE 12NM (EKSAKTE KOORDINATER) ---
// Kilde: Norsk Kartverket / Geonorge
// Dataset ID: [INSERT DATASET ID FROM KARTVERKET]
// Dataset name: "Territorialgrense 12 nautiske mil"
// Offisiell maritim grense: 12 nautiske mil fra grunnlinje ved Norge fastland
// Lokasjon: Norge fastland inkludert alle fjorder (ca. 58-71°N, 4-31°E)
// Downloaded: [INSERT DATE]
// VIKTIG: Koordinater konvertert fra GeoJSON [lng, lat] til vårt format [lat, lng]

const NORWAY_MAINLAND_12NM: LatLng[] = [
  // PASTE CONVERTED COORDINATES HERE
  // Format: [lat, lng], [lat, lng], ...
  // Example:
  // [60.456, 5.123],
  // [60.789, 5.789],
  // ...
];

// Optional: Add more specific regions if needed
// const NORWAY_NORTHERN_12NM: LatLng[] = [ ... ];
// const NORWAY_SOUTHERN_12NM: LatLng[] = [ ... ];

export const NORWAY_TERRITORIAL_POLYGONS: RegulatoryPolygon[] = [
  {
    id: 'NORWAY_MAINLAND_12NM_POLYGON',
    name: 'Territorial Waters - Norway Mainland (12NM)',
    areaId: 'NORWAY_12NM',
    triggerMode: 'inside',
    coordinates: NORWAY_MAINLAND_12NM,
    useTurf: true,  // Recommended for complex coastlines with fjords
  },
  // Add more regions if split into multiple polygons:
  // {
  //   id: 'NORWAY_NORTHERN_12NM_POLYGON',
  //   name: 'Territorial Waters - Northern Norway (12NM)',
  //   areaId: 'NORWAY_12NM',  // Same areaId to trigger same rules
  //   triggerMode: 'inside',
  //   coordinates: NORWAY_NORTHERN_12NM,
  //   useTurf: true,
  // },
];
```

---

### Step 4: Update `/data/polygons/territorial.ts`

**Current state (with TODO comments):**
```typescript
import type { RegulatoryPolygon } from '../geoTriggers';
import type { LatLng } from '../geoTriggers';

// NOTE: Norway mainland territorial waters (12NM) are NOT yet implemented
// TODO: Import from norwayTerritorial.ts when Kartverket GeoJSON data is available
// This will fix the issue where Norwegian fjords incorrectly show "HIGH SEAS"
// import { NORWAY_TERRITORIAL_POLYGONS } from './norwayTerritorial';

// ... existing Bjørnøya and Spitsbergen polygons ...

export const TERRITORIAL_POLYGONS: RegulatoryPolygon[] = [
  // ... existing polygons ...
  
  // TODO: Add Norway mainland territorial waters when Kartverket data is available
  // ...NORWAY_TERRITORIAL_POLYGONS,
];
```

**After adding data - uncomment these lines:**
```typescript
import { NORWAY_TERRITORIAL_POLYGONS } from './norwayTerritorial';

export const TERRITORIAL_POLYGONS: RegulatoryPolygon[] = [
  // ... existing polygons ...
  
  // Norway mainland territorial waters (12NM)
  ...NORWAY_TERRITORIAL_POLYGONS,
];
```

---

### Step 5: Verify implementation

**Console logging is already in place:**

```typescript
// In App.tsx, the useEffect will log:
console.log('📍 VESSEL POSITION:', vesselPosition, '| DETECTED AREAS:', areas);
console.log('🟢 ENTERED:', entered);
console.log('🔴 EXITED:', exited);
```

**Test cases:**
1. **Norwegian fjord (e.g., Sognefjorden 61°N, 5.5°E)**
   - Expected: `DETECTED AREAS: ['NORWAY_12NM']` → Zone: `COASTAL` ✅
   - Currently: `DETECTED AREAS: []` → Zone: `HIGH SEAS` ❌

2. **Oslo harbor (59.9°N, 10.7°E)**
   - Expected: `DETECTED AREAS: ['NORWAY_12NM']` → Zone: `COASTAL` ✅
   - Currently: `DETECTED AREAS: []` → Zone: `HIGH SEAS` ❌

3. **Norwegian Sea (65°N, 5°E, >12NM offshore)**
   - Expected: `DETECTED AREAS: []` → Zone: `HIGH SEAS` ✅
   - Currently: `DETECTED AREAS: []` → Zone: `HIGH SEAS` ✅ (correct by coincidence)

4. **Longyearbyen (78.22°N, 15.63°E)**
   - Expected: `DETECTED AREAS: ['SVALBARD_12NM', 'IMO_N60']` → Zone: `SVALBARD + HIGH SEAS` ✅
   - Currently: `DETECTED AREAS: ['SVALBARD_12NM', 'IMO_N60']` → Zone: `SVALBARD + HIGH SEAS` ✅

---

## 🔄 Zone Mapping Flow

```
GeoJSON Polygon → REGULATORY_POLYGONS → getActiveAreaIds() → areaId → mapToRulesetZones() → Ruleset Zone
                                                                ↓
                                                         'NORWAY_12NM'
                                                                ↓
                                                            'COASTAL'
```

**Mapping logic in App.tsx:**
```typescript
if (area.includes('NORWAY_12NM') || area.includes('NORWAY_EEZ')) {
  rulesetZones.add('COASTAL');
}
```

---

## 📊 Expected File Sizes

| Dataset | Approximate Size | Coordinate Count |
|---------|-----------------|------------------|
| Bjørnøya 12NM (current) | ~40KB | ~350 points |
| Spitsbergen Baseline (current) | ~3KB | ~41 points |
| **Norway Mainland 12NM** | **~500KB - 2MB** | **~5,000 - 20,000 points** |
| Norway EEZ 200NM | ~200KB - 1MB | ~2,000 - 10,000 points |

**Note:** Norwegian coastline with fjords is extremely complex. Consider:
- Simplifying the polygon (e.g., Douglas-Peucker algorithm) if too large
- Splitting into multiple regions (North, South, West)
- Using Turf.js for better performance (`useTurf: true`)

---

## 🔗 Useful Links

- **Geonorge (Kartverket):** https://kartkatalog.geonorge.no/
- **Kartverket Maritime Boundaries:** https://www.kartverket.no/en/at-sea/maritime-boundaries
- **IMO Polar Code:** https://www.imo.org/en/MediaCentre/HotTopics/Pages/Polar-default.aspx
- **Turf.js Documentation:** https://turfjs.org/docs/

---

## ✅ Checklist

Before marking this as complete:

- [ ] Downloaded Norway 12NM GeoJSON from Kartverket
- [ ] Converted coordinates from [lng, lat] to [lat, lng]
- [ ] Created `/data/polygons/norwayTerritorial.ts`
- [ ] Uncommented import in `/data/polygons/territorial.ts`
- [ ] Tested in Norwegian fjords (shows COASTAL not HIGH SEAS)
- [ ] Tested outside 12NM (still shows HIGH SEAS)
- [ ] Tested in Longyearbyen (still shows SVALBARD + HIGH SEAS)
- [ ] Performance is acceptable (no lag on map interaction)
- [ ] Removed all TODO comments from codebase
- [ ] Updated this README with actual dataset IDs and download date

---

## 🐛 Troubleshooting

### Issue: "Still showing HIGH SEAS in Norwegian fjords after adding data"

**Possible causes:**
1. **Coordinates not converted properly** (still [lng, lat] instead of [lat, lng])
   - Check: Log the polygon coordinates and compare with GeoJSON
   
2. **Import not activated**
   - Check: Uncommented import in `territorial.ts`?
   - Check: Spread operator `...NORWAY_TERRITORIAL_POLYGONS` in array?

3. **Polygon not closed**
   - GeoJSON requires first and last coordinate to be identical
   - Check: `coordinates[0] === coordinates[coordinates.length - 1]`

4. **Wrong triggerMode**
   - Should be `'inside'` not `'outside'`

5. **Turf.js conversion issue**
   - Try setting `useTurf: false` temporarily to test ray-casting fallback

### Issue: "Performance lag on map when moving vessel"

**Solutions:**
1. Simplify polygon with fewer points (use mapshaper.org or Turf.js simplify)
2. Split into multiple smaller polygons (North, South, West regions)
3. Use `useTurf: true` (should be faster for complex polygons)
4. Cache point-in-polygon results for same position

---

**Last updated:** 2026-03-11
**Status:** 🚧 AWAITING KARTVERKET DATA
