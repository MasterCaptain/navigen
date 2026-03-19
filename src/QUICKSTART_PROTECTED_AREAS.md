# ⚡ Quick Start: Svalbard Protected Areas

## 📌 This is an OPTIONAL feature

**Protected areas are not required for NAVIGEN to work.**  
If you see this message in console:
```
ℹ️ Protected areas: Not configured (optional feature)
```

**That's completely normal!** The app works perfectly without protected areas.

**Want to enable them? Follow the 3 steps below (takes 2 minutes):**

---

## ✅ Steg 1: Kjør Database Schema

1. **Åpne Supabase SQL Editor:**  
   👉 https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/sql

2. **Klikk "New query"**

3. **Kopier og lim inn HELE filen:**  
   📄 `/src/lib/database-schema.sql`

4. **Klikk "RUN" (eller Ctrl+Enter)**

✅ **Ferdig! Tabellen `protected_areas` er nå opprettet.**

---

## ✅ Steg 2: Last inn test-data (valgfritt)

**For å teste at systemet fungerer:**

1. **I samme SQL Editor, klikk "New query"**

2. **Kopier og lim inn:**  
   📄 `/TEST_PROTECTED_AREA.sql`

3. **Klikk "RUN"**

✅ **Et test-område ved Longyearbyen er nå lagt til!**

---

## ✅ Steg 3: Aktiver Protected Areas i NAVIGEN

1. **Refresh NAVIGEN** (Ctrl+Shift+R)

2. **Åpne ModuleBar (venstre side) → NAV**

3. **Klikk "Regulatory & Borders"**

4. **Expand "SVALBARD" → Enable "Protected Areas"**

5. **Zoom til Longyearbyen på kartet**

✅ **Du skal nå se et rødt polygon ved Longyearbyen!** 🎉

---

## 📥 Last opp din egen GeoJSON

**Når test-dataen fungerer, last opp dine egne områder:**

### Metode 1: Via Supabase Table Editor

1. **Åpne Table Editor:**  
   👉 https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/editor

2. **Velg `protected_areas` tabell**

3. **Klikk "Insert row"**

4. **Fyll ut:**
   - `area_id`: `PROTECTED_MITT_OMRADE`
   - `name`: "Mitt Verneområde"
   - `area_type`: Velg fra dropdown
   - `region`: `SVALBARD`
   - `geometry`: Lim inn GeoJSON (se eksempel under)
   - `status`: `active`

**GeoJSON geometry eksempel:**
```json
{
  "type": "Polygon",
  "coordinates": [[
    [15.6267, 78.2232],
    [15.7000, 78.2500],
    [15.6500, 78.2800],
    [15.6267, 78.2232]
  ]]
}
```

**VIKTIG: GeoJSON bruker [lng, lat] format!**

---

### Metode 2: Bulk Upload via SQL

**Hvis du har mange områder:**

```sql
INSERT INTO protected_areas (
  area_id, name, area_type, region, geometry, status
) VALUES 
(
  'PROTECTED_AREA1',
  'Område 1',
  'national_park',
  'SVALBARD',
  '{"type": "Polygon", "coordinates": [[[15.5, 78.2], [15.7, 78.2], [15.7, 78.25], [15.5, 78.25], [15.5, 78.2]]]}',
  'active'
),
(
  'PROTECTED_AREA2',
  'Område 2',
  'nature_reserve',
  'SVALBARD',
  '{"type": "Polygon", "coordinates": [[[16.0, 78.3], [16.2, 78.3], [16.2, 78.35], [16.0, 78.35], [16.0, 78.3]]]}',
  'active'
);
```

---

## 🔧 Feilsøking

### ❌ Får fortsatt PGRST205 error

**Løsning:** Verifiser at tabellen finnes:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'protected_areas';
```

Hvis tom: Kjør `/src/lib/database-schema.sql` på nytt.

---

### ❌ Områder vises ikke på kartet

**Løsning 1:** Sjekk at toggle er aktivert:
- ModuleBar → NAV → Regulatory & Borders → SVALBARD → Protected Areas = ON

**Løsning 2:** Sjekk konsollen:
```
✅ Loaded X protected areas from Supabase
🗺️ Rendering X protected areas from Supabase
```

**Løsning 3:** Verifiser data i Supabase:
```sql
SELECT * FROM protected_areas WHERE region = 'SVALBARD';
```

---

### ❌ Polygon vises på feil sted

**Årsak:** GeoJSON bruker [lng, lat], men du har angitt [lat, lng]

**Løsning:** Bytt om rekkefølgen i koordinatene:
```json
// ❌ FEIL (lat først):
[78.2232, 15.6267]

// ✅ RIKTIG (lng først):
[15.6267, 78.2232]
```

---

## 📚 Full dokumentasjon

Se `/PROTECTED_AREAS_SETUP.md` for komplett guide.

---

## ✅ Ferdig!

Når du har kjørt database schema, skal PGRST205-feilen forsvinne og protected areas kan lastes inn! 🎉