# 🔍 DEBUG: Protected Areas Not Showing

## Steg-for-steg feilsøking:

### 1️⃣ Sjekk at dataene ble lastet opp til Supabase

Gå til Supabase Dashboard:
```
https://fcwzmwoahottepzhmynz.supabase.co/project/fcwzmwoahottepzhmynz/editor
```

1. Klikk på "Table Editor" → `protected_areas`
2. **Sjekk at du har rader i tabellen**
3. Sjekk at `status` = `'active'` og `region` = `'SVALBARD'`

**Hvis tabellen er tom:** Kjør upload-scriptet på nytt:
```bash
node upload-from-storage.mjs
```

---

### 2️⃣ Sjekk Browser Console Logs

Åpne DevTools Console (F12) og se etter:

```javascript
🗺️ Loading protected areas from Supabase...
✅ Loaded X protected areas from Supabase
```

**Hvis du ser:**
- `✅ Loaded 0 protected areas` → Dataene er ikke i databasen (se steg 1)
- `❌ Error loading protected areas` → Database-feil (sjekk policies)
- Ingenting → Koden kjører ikke (se steg 3)

---

### 3️⃣ Sjekk Toggles i NAVIGEN

1. Gå til **ModuleBar → NAV** (kompass-ikon)
2. Klikk **"Regulatory & Borders"** (Shield-ikon)
3. Sjekk at **"Regulatory & Borders"** hovedtoggle er **ON**
4. Expand **"SVALBARD"** seksjonen (klikk pilen)
5. Sjekk at **"Svalbard Protected Areas"** er **CHECKED** ✓

**I Console skal du se:**
```javascript
🗺️ Rendering X protected areas from Supabase
✅ Rendered protected area: [NAME]
✅ Rendered X Supabase protected area polygons
```

---

### 4️⃣ Sjekk at du har zoomet til riktig område

Protected areas vises kun når du zoomer inn på Svalbard:

1. Klikk **"Jump to Longyearbyen"** knapp (øverst høyre)
2. Eller pan/zoom manuelt til:
   - **Latitude:** ~78°N
   - **Longitude:** ~16°E
   - **Zoom level:** 8-12

**Polygonene er røde med lav opacity** - de kan være vanskelige å se ved lav zoom.

---

### 5️⃣ Test manuelt i Console

Åpne DevTools Console og kjør:

```javascript
// Test Supabase connection
const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.39.0');
const supabase = createClient(
  'https://fcwzmwoahottepzhmynz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd3ptd29haG90dGVwemhteW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzg4MTEsImV4cCI6MjA1MTg1NDgxMX0.5GQfxlANUyJ1X3eSLEIFJ7g_PHKsRlkm_rQiPQjV_bI'
);

// Test query
const { data, error } = await supabase
  .from('protected_areas')
  .select('*')
  .eq('status', 'active');

console.log('Data:', data);
console.log('Error:', error);
```

**Forventet resultat:**
- `data`: Array med X objekter
- `error`: null

**Hvis error:**
- Sjekk RLS policies (steg 6)

---

### 6️⃣ Sjekk Row Level Security (RLS) Policies

Gå til Supabase Dashboard → SQL Editor og kjør:

```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE tablename = 'protected_areas';

-- If missing, recreate them:
DROP POLICY IF EXISTS "Allow anonymous read access to protected areas" ON protected_areas;
CREATE POLICY "Allow anonymous read access to protected areas"
  ON protected_areas FOR SELECT
  TO anon
  USING (true);

DROP POLICY IF EXISTS "Allow authenticated read access to protected areas" ON protected_areas;
CREATE POLICY "Allow authenticated read access to protected areas"
  ON protected_areas FOR SELECT
  TO authenticated
  USING (true);
```

---

### 7️⃣ Sjekk MapCanvas rendering-logikk

I Console, se etter:

```javascript
🔵 Drawing polygon X: [NAME] active: false
✅ Polygon added: [NAME]
```

**Hvis du IKKE ser disse:**
- Rendering-koden kjører ikke → Sjekk toggles (steg 3)

---

## 🎯 Quick Test Checklist

- [ ] Data finnes i Supabase `protected_areas` tabell
- [ ] Console viser: `✅ Loaded X protected areas from Supabase`
- [ ] "Regulatory & Borders" toggle er ON
- [ ] "SVALBARD" seksjon er expanded
- [ ] "Svalbard Protected Areas" checkbox er CHECKED ✓
- [ ] Zoomet til Svalbard (78°N, 16°E)
- [ ] Console viser: `✅ Rendered X Supabase protected area polygons`
- [ ] RLS policies er aktive

---

## 📞 Send meg disse detaljene:

Hvis det fortsatt ikke fungerer, send meg:

1. **Antall rader i `protected_areas` tabell:**
   ```sql
   SELECT COUNT(*) FROM protected_areas WHERE status = 'active';
   ```

2. **Console output** (copy/paste fra DevTools)

3. **Screenshot** av:
   - Regulatory & Borders dropdown (expanded til SVALBARD)
   - Kartet zoomet til Svalbard
   - Console logs

Da kan jeg hjelpe videre! 🚀
