# 🗺️ NAVIGEN Protected Areas Setup Guide

## ⚠️ VIKTIG: Du må kjøre database schema først!

**Hvis du ser denne feilen i konsollen:**
```
Error: Could not find the table 'public.protected_areas' in the schema cache (PGRST205)
```

**Følg stegene under for å fikse det! ⬇️**

---

## 📋 Steg 1: Kjør Database Schema (OBLIGATORISK!)

**Tabellen `protected_areas` eksisterer ikke ennå i Supabase-databasen.**

1. **Åpne Supabase SQL Editor:**  
   https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/sql

2. **Klikk "New query"**

3. **Kopier HELE innholdet fra:**  
   `/src/lib/database-schema.sql`

4. **Lim inn i SQL Editor og klikk "RUN" (Ctrl+Enter)**

5. **Verifiser at tabellen er opprettet:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'protected_areas';
   ```
   
   Du skal få tilbake én rad med `protected_areas`.

6. **Refresh NAVIGEN** - feilen skal nå være borte! ✅

---

## 📥 Steg 2: Last opp din GeoJSON-fil

### Metode A: Via Supabase Table Editor (Enklest!)

1. Åpne **Supabase Table Editor**:  
   https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/editor

2. Velg `protected_areas` tabell

3. Klikk **Insert** → **Insert row**

4. Fyll ut feltene manuelt:
   - `area_id`: `PROTECTED_NAMEHERE` (unik ID)
   - `name`: Navnet på området (norsk)
   - `name_en`: Navnet på engelsk (optional)
   - `area_type`: Velg fra dropdown (`national_park`, `nature_reserve`, `bird_reserve`, etc.)
   - `region`: `SVALBARD` (eller `NORWAY`, `ANTARCTICA`)
   - `description`: Beskrivelse av området
   - `regulations`: JSON-objekt med regler (se eksempel under)
   - `geometry`: **Kopier inn GeoJSON geometry direkte**
   - `established_date`: `YYYY-MM-DD`
   - `area_size_km2`: Areal i km²
   - `managing_authority`: F.eks. "Sysselmannen på Svalbard"
   - `source_url`: Kilde-URL
   - `status`: `active`

**Eksempel på `regulations` JSON:**
```json
{
  "entry_prohibited": false,
  "wildlife_distance": 300,
  "landing_permit": true,
  "speed_limit_knots": 5,
  "no_drone_zone": true
}
```

**Eksempel på `geometry` (GeoJSON Polygon):**
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [15.6267, 78.2232],
      [15.7000, 78.2500],
      [15.6500, 78.2800],
      [15.6267, 78.2232]
    ]
  ]
}
```

**VIKTIG: GeoJSON bruker [lng, lat], IKKE [lat, lng]!**

---

### Metode B: Bulk Upload via Script

Hvis du har en komplett GeoJSON FeatureCollection-fil:

1. **Plasser filen** i `/data/geojson/svalbard-protected.geojson`

2. **Kjør upload-scriptet:**
   ```bash
   # TODO: Implementer npm script for bulk upload
   # npm run upload-geojson
   ```

3. **Eller bruk scriptet manuelt:**
   ```typescript
   import { uploadGeoJSON } from './src/scripts/upload-geojson';
   
   const geojson = await fetch('/data/geojson/svalbard-protected.geojson').then(r => r.json());
   const results = await uploadGeoJSON(geojson, 'SVALBARD');
   console.log(`✅ Uploaded ${results.success} areas`);
   ```

---

## 🎯 Steg 3: Verifiser at data vises på kartet

1. **Refresh NAVIGEN** (Ctrl+Shift+R)

2. **Åpne ModuleBar → NAV → Regulatory & Borders**

3. **Enable "SVALBARD" → "Protected Areas"**

4. **Zoom til Svalbard** - du skal nå se områdene rendret på kartet!

5. **Sjekk konsollen:**
   ```
   🗺️ Loading protected areas from Supabase...
   ✅ Loaded 8 protected areas from Supabase
   🗺️ Rendering 8 protected areas from Supabase
   ✅ Rendered protected area: Sassen-Bünsow Land Nasjonalpark
   ```

---

## 📐 GeoJSON Format Krav

### FeatureCollection format:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Sassen-Bünsow Land Nasjonalpark",
        "name_en": "Sassen-Bünsow Land National Park",
        "area_type": "national_park",
        "region": "SVALBARD",
        "description": "Established 2003. 1,230 km². Located east of Longyearbyen.",
        "established_date": "2003-09-26",
        "area_size_km2": 1230,
        "managing_authority": "Sysselmannen på Svalbard",
        "source_url": "https://naturbase.no",
        "regulations": {
          "entry_prohibited": false,
          "wildlife_distance": 300,
          "landing_permit": true
        }
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [
          [
            [16.88298805200003, 78.640244585],
            [17.440342048, 78.593853061],
            [17.726311947, 78.573675214],
            [16.88298805200003, 78.640244585]
          ]
        ]
      }
    }
  ]
}
```

**VIKTIG:**
- GeoJSON bruker `[lng, lat]` (longitude først!)
- Leaflet bruker `[lat, lng]` - konverteringen gjøres automatisk
- Polygoner må være "closed" (første og siste koordinat må være like)

---

## 🔧 Feilsøking

### Problem: Ingen områder vises på kartet

**Løsning 1: Sjekk at toggle er aktivert**
```
ModuleBar → NAV → Regulatory & Borders → SVALBARD → Protected Areas = ON
```

**Løsning 2: Sjekk konsollen for feil**
```javascript
// I nettleser-konsoll:
console.log(protectedAreas); // Skal vise array med områder
```

**Løsning 3: Verifiser data i Supabase**
```sql
SELECT area_id, name, region, status FROM protected_areas WHERE region = 'SVALBARD';
```

---

### Problem: GeoJSON-koordinater er feil

**Symptom:** Polygoner vises på feil sted (f.eks. Atlanterhavet i stedet for Svalbard)

**Løsning:** Sjekk at GeoJSON bruker [lng, lat] format:
```json
{
  "type": "Polygon",
  "coordinates": [
    [
      [15.6267, 78.2232],  // ✅ Korrekt: [lng, lat]
      [78.2232, 15.6267]   // ❌ FEIL: [lat, lng]
    ]
  ]
}
```

---

## 🗑️ Slette områder

### Via Supabase Table Editor:
1. Velg `protected_areas` tabell
2. Finn raden du vil slette
3. Klikk **Delete**

### Via SQL:
```sql
-- Slett ett område
DELETE FROM protected_areas WHERE area_id = 'PROTECTED_SASSEN_BUNSOW';

-- Slett alle områder for en region
DELETE FROM protected_areas WHERE region = 'SVALBARD';

-- Deaktiver i stedet for å slette
UPDATE protected_areas SET status = 'expired' WHERE area_id = 'PROTECTED_OLD_AREA';
```

---

## 🎨 Styling på kartet

**Protected areas vises med:**
- Farge: `#dc2626` (rød)
- Fill opacity: 15% (gjennomsiktig)
- Border: 2px solid
- Hover: Øker opacity til 25%
- Active (vessel inside): Mer synlig styling

**Toggle for synlighet:**
- `regLayers.svalbardProtectedAreas = true/false`

---

## 📊 Eksempel-data

Hvis du vil teste før du laster opp egen data, kjør dette i Supabase SQL Editor:

```sql
INSERT INTO protected_areas (
  area_id, name, name_en, area_type, region, description,
  geometry, established_date, area_size_km2, managing_authority, status
) VALUES (
  'PROTECTED_TEST_LONGYEARBYEN',
  'Test Verneområde Longyearbyen',
  'Test Protected Area Longyearbyen',
  'other',
  'SVALBARD',
  'Test area for development',
  '{"type": "Polygon", "coordinates": [[[15.5, 78.2], [15.7, 78.2], [15.7, 78.25], [15.5, 78.25], [15.5, 78.2]]]}',
  '2024-01-01',
  50.5,
  'Sysselmannen på Svalbard',
  'active'
);
```

---

## ✅ Done!

Din GeoJSON er nå lastet opp og vises dynamisk på kartet! 🎉

**Next steps:**
- Legg til flere områder (Norge, Antarktis, etc.)
- Konfigurer `regulations` JSON for compliance-regler
- Integrer med Rules Module for automatisk compliance-sjekk

---

**Need help?** Check:
- `/src/lib/authService.ts` - `getProtectedAreas()` funksjon
- `/components/MapCanvas.tsx` - Rendering logic
- `/src/scripts/upload-geojson.ts` - Bulk upload script