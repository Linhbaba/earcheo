# 🎛️ Přepínač DMR 5G - Ovládací Příručka

## 📍 Kde Najít Přepínač

Přepínač **DMR 5G** se nachází v dolní ovládací liště (Command Deck), mezi nástroji:

```
┌─────────────────────────────────────────────────────────────┐
│  [OPTIC] [LIDAR] [NDVI]  │  [SLICER] [LIGHT] [MESH] [DMR 5G] │
└─────────────────────────────────────────────────────────────┘
         Režimy                      Nástroje
```

**Pozice**: Hned za tlačítkem `MESH`, před přepínači pohledu  
**Ikona**: 🗄️ Database  
**Popisek**: `DMR 5G`

---

## 🔵 Co Přepínač Dělá

### ✅ ZAPNUTÝ (Zelený) - Skutečná Výšková Data + GPU Shader

```
┌──────────────────────────────────────────┐
│  [DMR 5G] 🟢 ZAPNUTÝ                     │
├──────────────────────────────────────────┤
│  Zdroj: ATOM Feed (LAZ → GeoTIFF)       │
│  Data:  Skutečné metry nad mořem (Bpv)  │
│  Cache: /backend/data_cache/dmr5g/       │
│  Header: X-Data-Source: ATOM-Real-DMR5G │
│  Rendering: GPU Terrain Shader (WebGL)  │
└──────────────────────────────────────────┘
```

**Když je zapnutý:**
- ✅ Používá **stažená DMR 5G data** z ATOM cache
- ✅ Skutečné výšky v **metrech nad mořem** (Baltic 1957)
- ✅ Přesnost **± 0.18 m** (dle ČÚZK specifikace)
- ✅ **GPU Terrain Shader** počítá hillshade real-time z výškových dat
- ✅ Fungující **GPU filtry** (svahy, kontury, RGB hillshade, exaggeration)

**Příklad zobrazených dat:**
```
Praha - Václavské náměstí: ~195-215 m n.m. ✅
Sluštice: ~330-380 m n.m. ✅
Krkonoše: až 1,602 m n.m. (Sněžka) ✅
```

---

### ⚪ VYPNUTÝ (Šedý) - WMS Pseudo-Elevation

```
┌──────────────────────────────────────────┐
│  [DMR 5G] ⚪ VYPNUTÝ                     │
├──────────────────────────────────────────┤
│  Zdroj: WMS Hillshade → Pseudo-DEM      │
│  Data:  Převedený hillshade na výšky    │
│  Přesnost: Aproximace (200-1000 m)      │
│  Header: X-Data-Source: WMS-Pseudo-El.  │
│  Rendering: GPU Terrain Shader          │
└──────────────────────────────────────────┘
```

**Když je vypnutý:**
- ⚪ Používá **WMS hillshade** konvertovaný na pseudo-výšky
- ✅ **GPU Terrain Shader** - stejný rendering jako DMR 5G ON
- ✅ **GPU filtry FUNGUJÍ** (gamma, svahy, kontury, RGB hillshade)
- ⚪ **Rychlé zobrazení** bez stahovací cache
- ⚠️ **Pseudo-výšky** - grayscale (0-255) → výšky (200-1000 m)
- ⚠️ **Není vhodné pro přesná měření** (pouze aproximace)

**Kdy vypnout?**
- 🚀 **Rychlý náhled** - okamžité zobrazení bez cache
- 🗺️ **Průzkum nových oblastí** - nemáte stažená data
- 💻 **Nižší výkon** - GPU shader může být náročný na starších zařízeních
- 🎨 **Preferujete klasický hillshade** - původní ČÚZK vizualizace

---

## 🎮 Jak Použít

### 1️⃣ Základní Postup

```bash
# 1. Stáhněte data pro vaši oblast
cd /backend
./scripts/download_cz.sh mesta  # Města (~2418 listů)
# NEBO
./scripts/download_cz.sh test   # Test (10 listů)

# 2. Otevřete aplikaci
http://localhost:5173

# 3. Zapněte DMR 5G přepínač
Klikněte na [DMR 5G] → Změní se na 🟢 zelený

# 4. Navigujte na oblast se staženými daty
Praha, Brno, Ostrava, atd.
```

---

### 2️⃣ Ověření Dat

**Vizuální Indikátory:**

```
✅ Data dostupná:
   - Tlačítko svítí ZELENĚ
   - Terén se zobrazuje s detaily
   - V DevTools: X-Data-Source: ATOM-Real-DMR5G

❌ Data chybí:
   - Tlačítko ŠEDÉ
   - Terén se zobrazuje hillshade
   - V DevTools: X-Data-Source: WMS-Hillshade
```

**Jak ověřit v DevTools:**

```javascript
// Otevřete Console (F12)
// V Network → filtr "dem"
// Klikněte na tile request → Headers:

Response Headers:
  X-Data-Source: ATOM-Real-DMR5G-33-14-22  ✅ Reálná data!
  // NEBO
  X-Data-Source: WMS-Hillshade            ⚠️ Fallback
```

---

### 3️⃣ Stav Cache

```bash
# Zkontrolujte, co máte staženo
./scripts/download_cz.sh status

# Výstup:
📊 DMR 5G ATOM Cache Status
───────────────────────────────
Cache: /home/.../backend/data_cache/dmr5g
LAZ:      125 souborů (350 MB)
GeoTIFF:  125 souborů (820 MB)
Celkem:   1.17 GB
```

---

## 🗺️ Pokrytí Dat

### Co Je Staženo?

| Režim | Pokrytí | Listů | GB | Čas |
|-------|---------|-------|----|----|
| `test` | 10 náhodných | 10 | 0.1 | 1 min |
| `mesta` | Praha, Brno, Ostrava, ... | ~2418 | ~7 | 3-4 h |
| `kraj praha` | Celý Pražský kraj | ~800 | ~2.5 | 1-2 h |
| `cela-cr` | Celá ČR | 16,301 | ~50 | 3-4 dny |

### Jak Zjistit Pokrytí?

```bash
# 1. Stáhněte města
./scripts/download_cz.sh mesta

# 2. Počkejte na dokončení
tail -f /tmp/dmr5g_mesta.log

# 3. Zkontrolujte GeoTIFFs
ls -lh backend/data_cache/dmr5g/geotiff/

# 4. V aplikaci:
# - Zapněte DMR 5G
# - Jděte na Prahu → ZELENÉ ✅
# - Jděte na venkov → ŠEDÉ ⚪ (není staženo)
```

---

## 🛠️ Troubleshooting

### ❓ Přepínač je šedý i když mám data

**Důvody:**
1. ❌ Data nesedí s aktuální tile pozicí
2. ❌ GeoTIFF je poškozený
3. ❌ Cache path je nesprávný

**Řešení:**
```bash
# 1. Zkontrolujte cestu
ls backend/data_cache/dmr5g/geotiff/*.tif

# 2. Restartujte backend
pkill -f "uvicorn app.main"
cd backend && source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# 3. Hard reload frontendu
Ctrl+Shift+R (nebo Cmd+Shift+R)
```

---

### ❓ Data se nestahují

**Příčiny:**
- ❌ ČÚZK server nedostupný
- ❌ Rate limiting (příliš rychlé requesty)
- ❌ Chybí `laspy[lazrs]` dependency

**Řešení:**
```bash
# 1. Zkontrolujte závislosti
cd backend
source venv/bin/activate
pip install laspy[lazrs]

# 2. Test manuálního stahování
python -c "
from app.atom_downloader import download_and_rasterize_for_point
from pathlib import Path
download_and_rasterize_for_point(
    lat=50.0835, lon=14.4281,  # Praha
    output_dir=Path('data_cache/dmr5g')
)
"

# 3. Zkontrolujte log
cat /tmp/dmr5g_test.log
```

---

### ❓ Terén vypadá "divně"

**Možné důvody:**
1. ⚠️ Smíchání ATOM + WMS dat (různá rozlišení)
2. ⚠️ Nesprávná projekce (S-JTSK vs. WGS84)
3. ⚠️ NoData hodnoty zobrazené jako výšky

**Řešení:**
```bash
# Vymažte cache a stáhněte znovu
rm -rf backend/data_cache/dmr5g/geotiff/*.tif
./scripts/download_cz.sh test

# Vypněte ATOM a použijte čistý WMS
[DMR 5G] → ⚪ VYPNOUT
```

---

## 📖 Příklady Použití

### Příklad 1: Architektonická Analýza

```
Úkol: Změřit výškový rozdíl na Václavském náměstí

1. Stáhněte Prahu:
   ./scripts/download_cz.sh kraj praha

2. Otevřete aplikaci → Zapněte DMR 5G 🟢

3. Navigujte na Václavské náměstí:
   Souřadnice: 50.0813°N, 14.4268°E

4. Použijte SLICER nástroj:
   - Klikněte [SLICER]
   - Nakreslete linii od spodku k vrcholu náměstí
   - Přečtěte: ~195 m → ~215 m = 20 m převýšení ✅
```

---

### Příklad 2: Archeologický Průzkum

```
Úkol: Identifikovat pahorkatiny u Sluštic

1. Stáhněte okolí:
   python scripts/download_czech_republic.py \
     --mode custom \
     --bbox 14.5 49.9 14.8 50.1

2. Zapněte DMR 5G + MESH mode

3. Použijte GPU filtry:
   - Slope: 5-15° (mírné svahy)
   - Height: 330-380 m n.m.
   - Visualize: Slopes

4. Hledejte pravidelné geometrické tvary
```

---

## 🔗 Související Dokumenty

- **[JAK-NA-REALNA-DATA.md](./JAK-NA-REALNA-DATA.md)** - Jak stahovat DMR 5G data
- **[QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md)** - Ovládání aplikace
- **[cuzk-dmr5g-specification.md](./cuzk-dmr5g-specification.md)** - Technická spec
- **[gpu-terrain-shader.md](./gpu-terrain-shader.md)** - GPU filtry

---

## ⚙️ Technické Detaily

### Backend Logika

```python
# backend/app/main.py

@app.get("/api/tiles/dem/{z}/{x}/{y}")
async def get_dem_tile(
    z: int, x: int, y: int,
    use_atom: bool = Query(False)  # ← Parametr přepínače
):
    if use_atom:
        # 1. Hledej v ATOM cache
        tif_path = get_cached_geotiff_path(bbox)
        if tif_path:
            return get_dem_tile_from_geotiff(tif_path, bbox)
    
    # 2. Fallback na WMS hillshade
    return get_wms_hillshade(bbox)
```

### Frontend Integrace

```typescript
// frontend/src/components/SwipeMap.tsx

const baseUrl = `${BACKEND}/api/tiles/dem/{z}/{x}/{y}`;
const tileUrl = useAtomData 
  ? `${baseUrl}?use_atom=true`  // ← ATOM data
  : baseUrl;                     // ← WMS fallback

const layer = new TerrainShaderLayer({
  demTileUrl: tileUrl,
  // ...
});
```

---

## 🎯 Doporučení

### ✅ KDY ZAPNOUT DMR 5G

- ✅ Přesná měření (profily, výšky)
- ✅ Vědecký výzkum (archeologie)
- ✅ Analýza terénu (svahy, expozice)
- ✅ Máte stažená data pro oblast

### ⚪ KDY VYPNOUT DMR 5G

- ⚪ Průzkum neznámé oblasti (bez cache)
- ⚪ Testování aplikace
- ⚪ Rychlý náhled terénu
- ⚪ Problémy s výkonem

---

## 📊 Statistiky

**Typické Použití:**

| Scénář | DMR 5G | Cache | Rychlost |
|--------|--------|-------|----------|
| Praha (staženo) | 🟢 ON | HIT | ⚡ Rychlé |
| Praha (bez cache) | ⚪ OFF | MISS | ⚡ WMS fallback |
| Venkov (bez cache) | ⚪ OFF | MISS | ⚡ WMS fallback |
| Celá ČR (staženo) | 🟢 ON | HIT | ⚡ Rychlé (50 GB) |

---

**Vytvořeno:** 2025-11-24  
**Verze:** 1.0  
**Autor:** Cyber Archeology Team  
**Licence:** Pro použití v rámci projektu

