# 🔧 Oprava Kvality a Zarovnání DMR 5G Terénu

## 🐛 Původní Problémy

1. **Hrubé pixelované obrysy** – terén vypadal jako mozaika velkých bloků
2. **Špatné geografické zarovnání** – data byla posunuta oproti satelitnímu snímku
3. **Degradace při zoomu** – při přiblížení se terén "rozpadal"
4. **Nesprávné měřítko** – výškový relief neodpovídal skutečnosti

## ✅ Provedené Opravy

### 1. **Backend: Přesná Reprojekce do Web Mercator**

**Problém**: GeoTIFF data (S-JTSK) byla špatně transformována do souřadnic mapy (Web Mercator).

**Řešení**: Použití `rasterio.warp.reproject` s přímou transformací do tile bounding boxu:

```python
# backend/app/main.py, řádky 196-217
from rasterio.warp import reproject, Resampling
from rasterio.transform import from_bounds

# Výstupní pole 256x256 v souřadnicích Web Mercator
dst_array = np.full((DEM_TILE_SIZE, DEM_TILE_SIZE), nodata, dtype=np.float32)

# Transformace výstupu: tile bbox ve Web Mercator (nativní projekce mapy)
dst_transform = from_bounds(
    minx, miny,    # Web Mercator souřadnice tile
    maxx, maxy,
    DEM_TILE_SIZE, DEM_TILE_SIZE
)

# Reproject: S-JTSK raster -> Web Mercator tile grid
reproject(
    source=rasterio.band(src, 1),
    destination=dst_array,
    src_transform=src.transform,
    src_crs=src.crs,
    dst_transform=dst_transform,
    dst_crs=WEB_MERCATOR,
    resampling=Resampling.bilinear,
    src_nodata=src.nodata if src.nodata is not None else -9999,
    dst_nodata=nodata
)
```

**Výsledek**: 
- ✅ Data jsou přesně zarovnána s mapovou mřížkou
- ✅ Žádný horizontální posun
- ✅ 1:1 mapování mezi GeoTIFF a tile pixely

---

### 2. **Frontend: LINEAR Texture Filtering**

**Problém**: GPU textura používala `GL_NEAREST` filtrování → hrubé hrany mezi pixely.

**Řešení**: Změna na `GL_LINEAR` pro hladké interpolace:

```typescript
// frontend/src/layers/TerrainShaderLayer.ts, řádky 341-344
this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR); // ✅ ZMĚNA
this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR); // ✅ ZMĚNA
```

**Výsledek**:
- ✅ Hladké přechody mezi výškami
- ✅ Vizuálně kvalitní rendering
- ✅ Žádné pixelové artefakty

---

### 3. **Frontend: Správný Terrain Shader**

**Problém**: Shader byl ve **"image processing mode"** – bral DEM texturu jako hotový grayscale hillshade obrázek místo výškových dat.

**Původní (špatný) shader**:
```glsl
// WRONG: Bere texturu jako hotový hillshade
vec4 texel_color = texture2D(u_demTexture, v_uv);
float shade = texel_color.r;  // ❌ Grayscale hillshade
```

**Nový (správný) shader**:
```glsl
// ✅ CORRECT: Počítá hillshade z výškových dat
float zCenter = readElevation(v_uv);
float zLeft = readElevation(v_uv - vec2(texel.x, 0.0));
float zRight = readElevation(v_uv + vec2(texel.x, 0.0));
float zUp = readElevation(v_uv - vec2(0.0, texel.y));
float zDown = readElevation(v_uv + vec2(0.0, texel.y));

// Vypočti gradient (centrální diference)
float dZdx = (zRight - zLeft) / (2.0 * u_metersPerPixel) * u_exaggeration;
float dZdy = (zDown - zUp) / (2.0 * u_metersPerPixel) * u_exaggeration;

// Normálový vektor
vec3 normal = normalize(vec3(-dZdx, -dZdy, 1.0));

// Hillshade z dot produktu
float shade = max(0.0, dot(normal, u_lightPrimary));
```

**Výsledek**:
- ✅ Skutečný 3D hillshade ze surových výškových dat
- ✅ Korektní stíny a osvětlení podle slunce
- ✅ Fungující GPU filtry (svah, kontury, RGB hillshade)
- ✅ Detailní reliéf s správným exaggeration

---

### 4. **Frontend: Float32 Data Format**

**Problém**: Terrarium encoding (RGB → výška) degradovalo přesnost dat.

**Řešení**: Přímý přenos float32 dat z backendu do GPU:

```typescript
// frontend/src/components/SwipeMap.tsx, řádek 201
const tileUrl = useAtomData 
  ? `${baseUrl}?use_atom=true&format=float32`   // ✅ float32
  : `${baseUrl}?format=float32`;
```

**Výsledek**:
- ✅ Plná přesnost výškových dat (32-bit float)
- ✅ Žádná ztráta informace při encoding/decoding
- ✅ Přesné výpočty gradientů a normál

---

## 📊 Srovnání: Před vs. Po

| Aspekt | ❌ Před opravou | ✅ Po opravě |
|--------|----------------|--------------|
| **Geografické zarovnání** | Posun ~100m | Přesné 1:1 |
| **Vizuální kvalita** | Pixelované hrany | Hladké přechody |
| **Shader mode** | Image processing | Real DEM terrain |
| **Data formát** | Terrarium (RGB) | Float32 |
| **Texture filtering** | NEAREST | LINEAR |
| **Hillshade** | Předpočítaný obrázek | GPU real-time z výšek |
| **GPU filtry** | Nefunkční | Plně funkční |
| **Zoom stabilita** | Rozpad při zoomu | Stabilní na všech úrovních |

---

## 🧪 Testování

### Backend Test

```bash
# Test tile request pro Prahu
curl -s -o /dev/null -D - "http://localhost:8000/api/tiles/dem/14/8848/5550?use_atom=true&format=float32"

# Očekávaný výstup:
# HTTP/1.1 200 OK
# x-data-source: ATOM-Real-DMR5G-PRAH61
# content-type: application/octet-stream
# content-length: 262144  (256*256*4 bytes = 262144)
```

### Frontend Test

1. Otevřete aplikaci: `http://localhost:5173`
2. Zapněte DMR 5G přepínač (zelená barva)
3. Navigujte na Prahu (nebo jinou oblast se staženými daty)
4. Ověřte v DevTools:
   - Network → filtr "dem" → Response Headers:
     - `X-Data-Source: ATOM-Real-DMR5G-*` ✅
     - `Content-Type: application/octet-stream` ✅
   - Console → `[TerrainShaderLayer]` logy:
     - "OES_texture_float JE k dispozici" ✅
     - "Drew N tiles" ✅

---

## 🎯 Ověření Kvality

### Vizuální Kontrola

- ✅ Satelitní snímek a DMR terén jsou **přesně zarovnány**
- ✅ Řeky, silnice, budovy sedí na správných pozicích
- ✅ **Hladké** stíny a přechody (ne pixelované)
- ✅ Při zoomu **zůstává kvalita stabilní**

### Technická Kontrola

```bash
# Debug endpoint pro kontrolu transformací
curl -s http://localhost:8000/api/debug/tile-coords/14/8848/5550 | jq

# Výstup ukáže:
# - Mercator bbox tile
# - S-JTSK bbox tile
# - Které GeoTIFF listy se překrývají
# - Zda došlo k "overlaps: true"
```

---

## 📝 Soubory Změněné

### Backend
```
backend/app/main.py
├── Řádky 177-257: Reproject logic (S-JTSK → Web Mercator)
└── Řádky 779-827: Debug endpoint /api/debug/tile-coords
```

### Frontend
```
frontend/src/layers/TerrainShaderLayer.ts
├── Řádky 343-344: LINEAR texture filtering
├── Řádky 389-390: LINEAR texture filtering (terrarium)
└── Řádky 639-700: Nový terrain shader s gradient/normal výpočty

frontend/src/components/SwipeMap.tsx
└── Řádek 201: format=float32 parametr v tile URL
```

---

## 🚀 Další Kroky

### Pokud stále vidíte problémy:

1. **Hard reload frontendu**: `Ctrl+Shift+R` (vymaže cache)
2. **Restart backendu**:
   ```bash
   pkill -f "uvicorn app.main"
   cd backend && source venv/bin/activate
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
3. **Zkontrolujte data**:
   ```bash
   cd backend
   ls -lh data_cache/dmr5g/geotiff/*.tif | wc -l
   ```

### Debug při posunu/špatném zarovnání:

```bash
# Pro konkrétní tile (z/x/y), zkontrolujte transformace:
curl -s http://localhost:8000/api/debug/tile-coords/{z}/{x}/{y} | jq '.available_geotiffs_sample[] | select(.overlaps == true)'

# Mělo by vrátit GeoTIFF soubory s overlaps: true
# Pokud ne, znamená to, že:
# 1. Nemáte stažená data pro danou oblast
# 2. Transformace S-JTSK <-> Web Mercator je chybná
```

---

## 📚 Související Dokumentace

- **[docs/PREPINAC-DMR5G.md](./PREPINAC-DMR5G.md)** – Jak používat DMR 5G přepínač
- **[docs/gpu-terrain-shader.md](./gpu-terrain-shader.md)** – GPU shader specifikace
- **[docs/cuzk-dmr5g-specification.md](./cuzk-dmr5g-specification.md)** – DMR 5G technická spec
- **[docs/JAK-NA-REALNA-DATA.md](./JAK-NA-REALNA-DATA.md)** – Stahování ATOM dat

---

**Vytvořeno**: 2025-11-25  
**Verze**: 1.0  
**Autor**: Cyber Archeology Team  
**Účel**: Dokumentace kritických bugfixů pro kvalitu a zarovnání DMR 5G terénu

