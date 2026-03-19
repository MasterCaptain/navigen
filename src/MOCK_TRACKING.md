# 🎭 Mock Data Tracking - NAVIGEN

Denne filen holder oversikt over alle mock/placeholder-implementasjoner som må erstattes med ekte API-er når Supabase er på plass.

---

## 🚢 1. AIS VESSELS (Real-time Ship Tracking)

**Status:** ✅ Mock implementert  
**Prioritet:** 🔴 HØYEST  
**Lokasjon:** `/components/AISOverlay.tsx` (linje 21-137)

### Nåværende mock:
- 8 hardkodede skip rundt Longyearbyen
- Statiske posisjoner, hastigheter og headings
- Skip: MS NORDSYSSEL, POLARSYSSEL, ARCTIC EXPLORER, KRONPRINS HAAKON, SYSSELMANNEN I, HAVSEL, ODEN, COASTAL SUPPLY
- ✅ **AIS Toggle implementert:** AIS kan slås ON/OFF via header-indikator (grønn = ON, grå = OFF)

### Må erstattes med: