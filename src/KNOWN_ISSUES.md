# NAVIGEN - Known Issues

## 🚨 HIGH PRIORITY

### Norwegian fjords show "HIGH SEAS" instead of "COASTAL"
**Status:** 🚧 Awaiting Kartverket GeoJSON data

**Problem:**
When vessel is positioned in Norwegian fjords or territorial waters, the system incorrectly shows zone as "HIGH SEAS" instead of "COASTAL".

**Root Cause:**
Norway mainland territorial waters (12NM) polygons are NOT yet implemented in the geo-trigger system. Currently only Svalbard territorial waters (Bjørnøya + Spitsbergen) are defined.

**Impact:**
- ❌ Wrong compliance rules shown in Norwegian fjords
- ❌ Wrong regulatory framework displayed
- ✅ Does NOT affect Svalbard (works correctly)
- ✅ Does NOT affect IMO N60 polar zone (works correctly)
- ✅ Does NOT affect open ocean (works correctly)

**Solution:**
Add official Kartverket GeoJSON data for Norway 12NM territorial boundary.

**Implementation Guide:**
See `/data/polygons/README_KARTVERKET.md` for complete step-by-step instructions.

**Quick Steps:**
1. Download GeoJSON from Kartverket/Geonorge: "Territorialgrense 12 nautiske mil"
2. Convert using: `python3 scripts/convert_kartverket_geojson.py norway_12nm.geojson > output.ts`
3. Paste coordinates into `/data/polygons/norwayTerritorial.ts` (rename from TEMPLATE)
4. Uncomment import in `/data/polygons/territorial.ts`
5. Test in Norwegian fjords - should now show COASTAL ✅

**Files to Update:**
- [ ] `/data/polygons/norwayTerritorial.ts` (create from TEMPLATE)
- [ ] `/data/polygons/territorial.ts` (uncomment import)
- [ ] `/data/geoTriggers.ts` (remove TODO comment)
- [ ] `/App.tsx` (remove TODO comment)
- [ ] This file (mark as resolved)

**Related Code:**
- Detection: `/data/geoTriggers.ts` line 127 (`getActiveAreaIds`)
- Mapping: `/App.tsx` line 549 (`mapToRulesetZones`)
- Template: `/data/polygons/norwayTerritorial.TEMPLATE.ts`
- Conversion script: `/scripts/convert_kartverket_geojson.py`

**Test Cases After Fix:**
```typescript
// Sognefjorden (61°N, 5.5°E) → should show COASTAL
// Oslo harbor (59.9°N, 10.7°E) → should show COASTAL  
// Norwegian Sea (65°N, 5°E, >12NM) → should show HIGH SEAS
// Longyearbyen (78.22°N, 15.63°E) → should show SVALBARD + HIGH SEAS
```

---

## 📝 OTHER ISSUES

### IMO N60 polar boundary visualization
**Status:** ✅ Working correctly - DO NOT MODIFY without explicit request

**Note:**
The IMO N60 red stippled line and detection logic are functioning correctly. These were specifically requested to remain untouched in the project requirements.

---

### Security zones in MARSEC module
**Status:** ⏳ Deferred to backend/Supabase integration

**Note:**
Security zones should only be visible in MARSEC module (not on main map). Much of the MARSEC functionality will be implemented when RiskIntelligence API becomes available.

---

**Last Updated:** 2026-03-11
