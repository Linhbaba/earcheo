# 🎯 Průvodce: Skutečná výšková data z DMR 5G

## ✅ CO FUNGUJE PRÁVĚ TEĎ

Úspěšně jsem implementoval **ATOM downloader**, který stahuje skutečná DMR 5G data a poskytuje **přesné metry nad mořem** (Baltic 1957 height).

### 📊 Testovací výsledky

```
Stažena oblast: Praha 6-2 (50.0755°N, 14.4378°E)
Formát: LAZ point cloud → GeoTIFF
Bodů: 307,388
Rozlišení: 5m
Výškový rozsah: 191-280 m n.m. (Bpv)
✅ SKUTEČNÉ metry nad mořem!
```

## 🚀 Jak používat

### Metoda 1: Automaticky přes API (pro uživatele)

#### 1. Stáhni data pro oblast

```bash
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0755&lon=14.4378"
```

**Čekání**: 1-2 minuty (stahování ~20 MB + rasterizace)

#### 2. Data jsou automaticky v cache

Frontend nyní automaticky používá skutečná data když voláš:
```
http://localhost:8000/api/tiles/dem/{z}/{x}/{y}?use_atom=true
```

#### 3. Zkontroluj cache

```bash
curl "http://localhost:8000/api/atom/cache/list"
```

### Metoda 2: CLI pro batch stahování

```bash
cd backend
source venv/bin/activate

# Stáhni pro konkrétní bod
python app/atom_downloader.py 50.0755 14.4378

# Stáhni pro více míst
python app/atom_downloader.py 49.1951 16.6077  # Brno
python app/atom_downloader.py 49.5938 17.2509  # Olomouc
```

## 📁 Struktura Cache

```
backend/data_cache/dmr5g/
├── CZ-00025712-CUZK_DMR5G-SJTSK_PRAH62.zip  # Stažený ZIP (~2.8 MB)
├── laz/
│   └── PRAH62.laz                           # Rozbalený point cloud
└── geotiff/
    └── PRAH62.tif                            # Rasterizovaný DEM (426 KB)
```

## 🔍 Jak to funguje

### 1. ATOM Feed Parser

```python
# Stáhne hlavní feed
sheets = await fetch_atom_feed()
# → 16,301 mapových listů celé ČR

# Najde list pro daný bod
sheet = find_mapsheet_for_point(sheets, lat, lon)
# → Praha 6-2

# Získá download URL
url = await fetch_dataset_feed(sheet)
# → https://openzu.cuzk.gov.cz/opendata/DMR5G/epsg-5514/PRAH62.zip
```

### 2. Download & Extract

- Stáhne ZIP (2.8 MB komprimováno)
- Extrahuje LAZ point cloud
- **307,388 3D bodů** s přesností 0.18-0.30m

### 3. Rasterizace

```python
# Načte LAZ
with laspy.open('PRAH62.laz') as las_file:
    x, y, z = las.x, las.y, las.z  # S-JTSK souřadnice
    
# Vytvoří grid 5m × 5m
raster = grid_points(x, y, z, resolution=5.0)

# Uloží jako GeoTIFF
rasterio.write('PRAH62.tif', raster, crs='EPSG:5514')
```

### 4. Tile Serving

Když frontend požaduje tile:

```
GET /api/tiles/dem/14/8849/5551?use_atom=true
```

Backend:
1. Vypočte bbox tile v Web Mercator
2. Transformuje do S-JTSK
3. Najde GeoTIFF v cache s překryvem
4. Načte window z GeoTIFF
5. Resize na 256×256
6. Vrátí skutečné metry n.m.!

## 🎨 Rozdíl vizuálně

### Před (WMS Hillshade - pseudo-data)
```
Min výška: 200.00 m
Max výška: 200.00 m
Std. dev: 0.00 m
❌ Uniformní - nejsou to skutečné výšky
```

### Po (ATOM - skutečná data)
```
Min výška: 191.05 m
Max výška: 279.65 m  
Std. dev: 22.45 m
✅ Variabilní - SKUTEČNÉ metry nad mořem!
```

## 🌍 Pokrytí

ATOM feed obsahuje **16,301 mapových listů** pokrývajících **59.48% ČR**.

Staženo je potřeba:
- **Po mapových listech SM5** (~2-3 MB každý)
- Pro celou Prahu: ~50-100 listů = 150-300 MB
- Pro celou ČR: ~20 GB (pokud máte storage)

## ⚡ Výkon

| Operace | Čas | Velikost |
|---------|-----|----------|
| Download ZIP | ~10-20s | 2.8 MB |
| Extrakce LAZ | ~1s | - |
| Rasterizace | ~5-10s | 426 KB GeoTIFF |
| **Celkem** | **~30-60s** | **Per maplist** |

## 🔧 API Endpoints

### POST /api/atom/download

Stáhne a zpracuje DMR 5G pro oblast.

**Query params:**
- `lat` (float): WGS84 latitude
- `lon` (float): WGS84 longitude

**Response:**
```json
{
  "status": "success",
  "message": "DMR 5G data stažena a zpracována",
  "geotiff_path": "/path/to/PRAH62.tif",
  "lat": 50.0755,
  "lon": 14.4378
}
```

### GET /api/atom/cache/list

Vypíše cachované GeoTIFF soubory.

**Response:**
```json
{
  "cached_files": [
    {
      "filename": "PRAH62.tif",
      "size_mb": 0.426,
      "bbox_sjtsk": {
        "left": -742500.0,
        "bottom": -1046000.0,
        "right": -740000.0,
        "top": -1044000.0
      },
      "dimensions": {"width": 500, "height": 400},
      "crs": "EPSG:5514"
    }
  ],
  "count": 1
}
```

### GET /api/tiles/dem/{z}/{x}/{y}

Servíruje DEM tile.

**Query params:**
- `format`: `float32` nebo `terrarium` (default: `float32`)
- `use_atom`: `true` pro použití ATOM cache (default: `true`)
- `use_wcs`: `false` (WCS nefunguje)

**Response Headers:**
```
X-Data-Source: ATOM-Real-DMR5G-PRAH62
```

## 💡 Tips & Tricks

### Batch Download pro celé město

```bash
#!/bin/bash
# download_prague.sh

# Grid bodů pokrývající Prahu
for lat in $(seq 49.95 0.05 50.20); do
  for lon in $(seq 14.20 0.05 14.70); do
    echo "Stahuji: $lat, $lon"
    curl -X POST "http://localhost:8000/api/atom/download?lat=$lat&lon=$lon" \
      || echo "Selhalo: $lat, $lon"
    sleep 5  # Rate limiting
  done
done
```

### Kontrola pokrytí

```python
import rasterio
from shapely.geometry import box

# Načti všechny GeoTIFF
geotiffs = list(Path('data_cache/dmr5g/geotiff').glob('*.tif'))

for tif in geotiffs:
    with rasterio.open(tif) as src:
        bounds = src.bounds
        print(f"{tif.name}: {bounds.left:.0f}, {bounds.bottom:.0f} - {bounds.right:.0f}, {bounds.top:.0f}")
```

### Vizualizace v QGIS

1. File → Open → `backend/data_cache/dmr5g/geotiff/PRAH62.tif`
2. Properties → Symbology → Singleband pseudocolor
3. CRS: EPSG:5514 (S-JTSK)
4. ✅ Vidíte skutečný DMR 5G!

## 🐛 Troubleshooting

### "No LazBackend selected"

```bash
pip install 'laspy[lazrs]'
```

### "ATOM cache miss"

Data ještě nejsou stažená. Použij:
```bash
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0&lon=14.4"
```

### Pomalé tile loading

První request pro novou oblast trvá déle (stahování). Další requesty jsou z cache (rychlé).

## 🎯 Shrnutí

✅ **FUNGUJE**: Skutečná DMR 5G data (metry n.m.)  
✅ **TESTED**: Praha střed - 191-280m (správný rozsah)  
✅ **CACHED**: Rychlé opakované načítání  
✅ **API**: Připraveno pro frontend integraci  

🚀 **Použití ve frontendu**: Automatické! Stačí mít data v cache.

---

**Poznámka**: Pro produkci doporučuji:
1. Background queue systém (Celery + Redis)
2. Předstažení populárních oblastí
3. CDN pro cachované tiles

