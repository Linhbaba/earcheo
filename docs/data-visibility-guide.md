# 👁️ Průvodce viditelností DMR 5G dat v aplikaci

## Kde data DMR 5G vidím PRÁVĚ TEĎ?

### 🗺️ Mapová vizualizace

**Krok 1**: Otevřete aplikaci na http://localhost:5173

**Krok 2**: V levém ovládacím panelu klikněte na ikonu **Scan** (třetí ikona)

**Krok 3**: Vidíte **stínovaný reliéf terénu** = to jsou data DMR 5G!

```
┌────────────────────────────────────────┐
│  Command Deck (levý panel)            │
├────────────────────────────────────────┤
│  [🧭] OPTIC    ← Satelitní mapa        │
│  [📡] LIDAR    ← ✅ DMR 5G HILLSHADE   │
│  [🌿] NDVI     ← Spektrální analýza    │
└────────────────────────────────────────┘
```

### 🔍 Co přesně vidíte

#### ✅ V LIDAR režimu vidíte:

1. **Vizuální reprezentace DMR 5G**
   - Stínovaný reliéf (hillshade)
   - Valy, příkopy, cesty jsou viditelné
   - Přesnost visualizace: 0.18-0.30m

2. **Badge v pravém horním rohu**
   ```
   [📡] LIDAR: ONLINE (ČÚZK)
   ```

3. **GPU filtry pracují s těmito daty**
   - Gamma correction
   - Sigmoid contrast
   - Slope overlay
   - Vše funguje na DMR 5G vizualizaci

### ⚠️ Co NEVIDÍTE (zatím)

#### ❌ Skutečné výškové hodnoty

Když použijete:
- **Výškový profil** (nástroj kreslení linie)
- **GPU shader** (Terrain Lab panel)

Data jsou **převedená z hillshade** na pseudo-výšky:
- Rozsah: 200-1000m
- Nejsou to skutečné metry nad mořem!
- Pro relativní analýzu to stačí

## 📊 Testování v Developer Tools

### Chrome/Firefox DevTools

1. Otevřete DevTools (F12)
2. Jděte na **Network** tab
3. Filtr: "dmr5g" nebo "tiles/dem"
4. Obnovte mapu v LIDAR režimu

**Měli byste vidět:**

```
Request URL: http://localhost:3010/api/wms-proxy?service=WMS&...
Status: 200
Type: image/png
Size: ~15-50 KB per tile
```

### Backend Response Headers

```bash
# Test DEM tile endpointu
curl -v "http://localhost:8000/api/tiles/dem/12/2200/1400?format=float32" \
  -o /tmp/test.bin 2>&1 | grep "< X-Data-Source"
```

**Očekávaný output:**
```
< X-Data-Source: WMS-Pseudo-Elevation
```

Pokud použijete `?use_wcs=true`:
```
< X-Data-Source: WMS-Pseudo-Elevation  (fallback, protože WCS nefunguje)
```

## 🎨 Vizuální rozdíly mezi režimy

### OPTIC režim
```
┌─────────────────────────┐
│  🛰️ Satelitní snímky    │
│  - Barvy skutečné       │
│  - Vidíte domy, lesy    │
│  - Bez terénních detailů│
└─────────────────────────┘
```

### LIDAR režim (DMR 5G)
```
┌─────────────────────────┐
│  📡 Stínovaný reliéf     │
│  - Černobílý            │
│  - Vidíte valy, příkopy │
│  - Terénní struktury ✅ │
│  - Data: ČÚZK DMR 5G    │
└─────────────────────────┘
```

### NDVI režim
```
┌─────────────────────────┐
│  🌿 Spektrální analýza   │
│  - Zelená = vegetace    │
│  - Červená = půda       │
│  - Data: Sentinel-2     │
└─────────────────────────┘
```

## 🔬 Pokročilé: Analýza skutečných dat

Pokud chcete vidět **číselné výšky z DMR 5G**:

### Metoda 1: Výškový profil (funguje částečně)

1. V LIDAR režimu klikněte **"Profil"** (ikona grafu)
2. Nakreslete linii na mapě
3. Zobrazí se graf s výškami

**⚠️ Upozornění**: Výšky jsou pseudo-data z hillshade!

### Metoda 2: ATOM Download (doporučeno pro přesná data)

```bash
# Stáhněte LAZ soubor z ATOM feedu
curl -o praha.zip "https://atom.cuzk.gov.cz/DMR5G-SJTSK/files/[mapovy-list].zip"

# Rozbalte LAZ point cloud
unzip praha.zip

# Konverze LAZ → GeoTIFF (vyžaduje PDAL nebo LAStools)
pdal pipeline convert-laz-to-tiff.json
```

## 💡 Shrnutí: Co vidím kde

| Funkce | Používá DMR 5G? | Přesnost dat | Poznámka |
|--------|-----------------|--------------|----------|
| **Mapa - LIDAR režim** | ✅ Ano (WMS) | Vizuálně 0.18-0.30m | Hillshade |
| **GPU Terrain Filtry** | ✅ Ano | Vizuálně správné | Pracuje s hillshade |
| **Výškový profil** | ⚠️ Částečně | Relativně správné | Pseudo-výšky |
| **Split View** | ✅ Ano | Vizuálně správné | Porovnání režimů |
| **Mesh Mode** | ✅ Ano | Vizuálně správné | Cyber overlay |

## ❓ FAQ

**Q: Proč nevidím skutečné výšky?**  
A: ČÚZK WCS služba vrací HTTP 400. Pro skutečná data potřebujete stáhnout LAZ přes ATOM feed.

**Q: Je hillshade dostatečný pro archeologii?**  
A: **Ano!** Pro vizuální detekci valů, příkopů a cest je hillshade perfektní. Absolutní výšky potřebujete jen pro přesná měření.

**Q: Jak poznám, že to jsou data DMR 5G?**  
A: 
1. Badge "LIDAR: ONLINE (ČÚZK)"
2. Viditelné mikrostruktury terénu
3. Network requests na `dmr5g/ImageServer`

**Q: Můžu si to stáhnout offline?**  
A: Ano! ATOM feed nabízí download celých mapových listů v LAZ formátu.

---

**Závěr**: DMR 5G data **vidíte právě teď** v aplikaci jako vizualizaci hillshade. Pro číselné výšky je třeba implementovat ATOM downloader.

