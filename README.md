# 🏛️ eArcheo - Dálkový průzkum krajiny

Pokročilý nástroj pro archeologický průzkum terénu pomocí LiDAR hillshade dat z ČÚZK a satelitních snímků.

## 🎯 Přehled

eArcheo je webová aplikace pro detekci archeologických struktur v krajině pomocí:
- **LiDAR hillshade** (ČÚZK WMS) s možností split-view porovnání
- **Spektrální analýzy** (NDVI) ze satelitních snímků Sentinel-2
- **Výškových profilů** pro detailní terénní struktury

## 📋 Specifikace dat

### DMR 5G (Digitální model reliéfu 5. generace)

- **Přesnost**: 0.18m (odkrytý terén), 0.30m (les)
- **Souřadnicové systémy**:
  - Horizontální: S-JTSK / Krovak East North ([EPSG:5514](https://www.opengis.net/def/crs/EPSG/0/5514))
  - Vertikální: Baltic 1957 height - Bpv ([EPSG:8357](https://www.opengis.net/def/crs/EPSG/0/8357))
- **Pokrytí**: 59.48% území ČR (k 2012)
- **Metoda**: Letecké laserové skenování (2009-2013)

Kompletní specifikace: [docs/cuzk-dmr5g-specification.md](docs/cuzk-dmr5g-specification.md)

### Dostupné datové zdroje

| Služba | Status | Použití | Dokumentace |
|--------|--------|---------|-------------|
| WMS Hillshade | ✅ Funkční | Vizualizace terénu | https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WMSServer |
| WCS Coverage | ❌ Nefunkční | Výšková data (plánováno) | - |
| ATOM Feed | ✅ Funkční | Download LAZ souborů | https://atom.cuzk.gov.cz/DMR5G-SJTSK/DMR5G-SJTSK.xml |
| Sentinel-2 | ✅ Funkční | NDVI spektrální analýza | Sentinel Hub API |

## 🚀 Quickstart

### Prerekvizity

- **Python 3.13+** (backend)
- **Node.js 18+** (frontend + proxy)
- **Sentinel Hub Account** (pro NDVI, volitelné)

### Instalace

```bash
# 1. Clone repository
git clone <repository-url>
cd earcheo

# 2. Backend setup (Python)
cd backend
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# 3. Frontend setup
cd ../frontend
npm install

# 4. Proxy setup (Node.js)
cd ../backend
npm install
```

### Konfigurace

Vytvořte `backend/.env`:

```env
# Volitelné - pro NDVI analýzu
SENTINEL_CLIENT_ID=your_client_id
SENTINEL_CLIENT_SECRET=your_client_secret
```

### Spuštění

```bash
# Terminál 1: Python backend (port 8000)
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000

# Terminál 2: Node.js proxy (port 3010)
cd backend
node index.js

# Terminál 3: Frontend (port 5173)
cd frontend
npm run dev
```

Aplikace běží na: **http://localhost:5173**

## 🎨 Funkce

### Mapa - režimy vizualizace

- **LIDAR (MVP)**: ČÚZK WMS hillshade, split-view, mesh/flashlight nástroje
- **OPTIC**: Klasický satelitní pohled
- **NDVI**: Spektrální analýza vegetace

> Reálná DMR 5G data (ATOM) a GPU Terrain Lab jsou v roadmapě po MVP – viz [docs/MVP-SCOPE-NOTE.md](docs/MVP-SCOPE-NOTE.md).

### Výškový profil

- Nástroj pro kreslení linií
- Volá backend `/api/analyze/profile` s WMS pseudo-DEM (pro MVP)
- Interaktivní graf s označením bodu na mapě
- Přesné GPS souřadnice každého vzorku

### Split View

- Vertikální / horizontální rozdělení mapy
- Srovnání různých vizualizačních módů
- Průhledný slider s "cyber" estetikou

## 🛠️ Technologie

### Frontend
- **React 18** + **TypeScript**
- **MapLibre GL** - mapová knihovna
- **WebGL Custom Layers** - GPU shader filtry
- **Recharts** - výškové profily
- **Tailwind CSS** - styling
- **Lucide Icons** - ikonografie

### Backend
- **FastAPI** - REST API
- **Rasterio** - GeoTIFF zpracování
- **WhiteboxTools** - terénní analýzy (Sky-View Factor)
- **Pyproj** - souřadnicové transformace (S-JTSK ↔ WGS84)
- **Sentinel Hub API** - satelitní snímky

### Proxy
- **Express.js** - CORS proxy pro ČÚZK WMS

## 📁 Struktura projektu

```
earcheo/
├── frontend/              # React + MapLibre aplikace
│   ├── src/
│   │   ├── components/    # React komponenty
│   │   ├── layers/        # MapLibre custom layers (GPU shader)
│   │   └── types/         # TypeScript definice
│   └── dist/              # Build output
│
├── backend/               # Python FastAPI + Node.js proxy
│   ├── app/
│   │   └── main.py        # FastAPI endpoints
│   ├── index.js           # CORS proxy (WMS)
│   └── venv/              # Python virtualenv
│
├── api/                   # Vercel serverless functions
│   ├── wms-proxy.ts       # ČÚZK DMR5G proxy
│   ├── ortofoto-proxy.ts  # ČÚZK Ortofoto proxy
│   └── history-proxy.ts   # Historické mapy proxy
│
└── docs/                  # Dokumentace
    ├── cuzk-dmr5g-specification.md    # Specifikace DMR 5G
    └── gpu-terrain-shader.md          # GPU filtry technická doc
```

## 🔬 API Endpoints

### DEM Tiles
```
GET /api/tiles/dem/{z}/{x}/{y}
  ?format=float32|terrarium
  &use_wcs=false
```

### Výškový profil
```
POST /api/analyze/profile
Content-Type: application/json

{
  "type": "LineString",
  "coordinates": [[lon1, lat1], [lon2, lat2], ...]
}
```

### NDVI Analýza
```
GET /api/analyze/ndvi
  ?min_lon=14.0&min_lat=50.0
  &max_lon=14.5&max_lat=50.5
  &from_date=2024-01-01
  &to_date=2024-12-31
  &resolution=40
```

### Sky-View Factor (upload)
```
POST /api/analyze/sky-view-factor/upload
Content-Type: multipart/form-data
file: <GeoTIFF>
```

## 🚀 Vercel Deployment

Tento projekt je připraven pro deployment na Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_AUTH0_DOMAIN` | Yes | Auth0 tenant domain |
| `VITE_AUTH0_CLIENT_ID` | Yes | Auth0 application client ID |
| `SENTINEL_CLIENT_ID` | No | Sentinel Hub API (for NDVI) |
| `SENTINEL_CLIENT_SECRET` | No | Sentinel Hub API (for NDVI) |

## 🧪 Testování

Všechny ČÚZK služby byly testovány 2025-11-24:

| Služba | Status | Poznámka |
|--------|--------|----------|
| WMS DMR5G | ✅ OK | Hillshade vizualizace funguje |
| WCS DMR5G | ❌ FAIL | HTTP 400 - služba nedostupná |
| ATOM Feed | ✅ OK | Stahování LAZ dat funguje |
| Profile Analysis | ✅ OK | Backend WCS wrapper OK |

## 📚 Reference a zdroje

- [ČÚZK Geoportál](https://geoportal.cuzk.gov.cz)
- [DMR 5G Metadata](https://geoportal.cuzk.gov.cz/Default.aspx?mode=TextMeta&metadataXSL=full&side=vyskopis&metadataID=CZ-CUZK-DMR5G-V)
- [EPSG:5514 - S-JTSK](https://www.opengis.net/def/crs/EPSG/0/5514)
- [EPSG:8357 - Baltic 1957 height](https://www.opengis.net/def/crs/EPSG/0/8357)
- [INSPIRE Directive](https://inspire.ec.europa.eu/)
- [Sentinel Hub Documentation](https://docs.sentinel-hub.com/)
- [WhiteboxTools Manual](https://www.whiteboxgeo.com/manual/wbt_book/)

## 🤝 Autor

Tento projekt vznikl pro potřeby dálkového archeologického průzkumu krajiny České republiky.

## 📄 Licence

Data DMR 5G: **Bez poplatků** (Open Data ČÚZK)  
Software: Kontaktujte autora

---

**Poznámka**: Pro produkční nasazení je doporučeno implementovat lokální cache LAZ souborů stažených přes ATOM feed, protože ČÚZK WCS služba není v současnosti dostupná.
