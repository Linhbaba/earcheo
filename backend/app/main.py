from fastapi import FastAPI, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse, Response
from pydantic import BaseModel
import whitebox
import rasterio
from rasterio.windows import Window
import numpy as np
from pathlib import Path
import tempfile
import os
import io
from PIL import Image
from datetime import datetime, timedelta
import math

from shapely.geometry import LineString, shape
from shapely.ops import transform
import pyproj
import httpx

from dotenv import load_dotenv
from sentinelhub import (
    SentinelHubRequest,
    DataCollection,
    MimeType,
    BBox,
    CRS,
    SHConfig,
    bbox_to_dimensions,
)
from app.atom_downloader import download_and_process_area, CACHE_DIR

app = FastAPI(
    title="eArcheo API",
    description="Backend pro dálkový průzkum krajiny a detekci archeologických struktur.",
    version="MVP 1.0"
)

# Povolení CORS pro frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize WhiteboxTools
wbt = whitebox.WhiteboxTools()
load_dotenv()

SENTINEL_CLIENT_ID = os.getenv("SENTINEL_CLIENT_ID")
SENTINEL_CLIENT_SECRET = os.getenv("SENTINEL_CLIENT_SECRET")

sh_config = SHConfig()
if SENTINEL_CLIENT_ID and SENTINEL_CLIENT_SECRET:
    sh_config.sh_client_id = SENTINEL_CLIENT_ID
    sh_config.sh_client_secret = SENTINEL_CLIENT_SECRET
else:
    # Leave defaults; endpoint will raise helpful error if creds missing
    pass

WGS84 = pyproj.CRS('EPSG:4326')
WEB_MERCATOR = pyproj.CRS('EPSG:3857')
# S-JTSK / Krovak East North - souřadnicový systém ČÚZK DMR 5G
# Oficiální specifikace: https://www.opengis.net/def/crs/EPSG/0/5514
SJTSK = pyproj.CRS('EPSG:5514')
# Baltic 1957 height - výškový referenční systém DMR 5G (Bpv)
# Oficiální specifikace: https://www.opengis.net/def/crs/EPSG/0/8357
BPV = pyproj.CRS('EPSG:8357')

_project_to_3857 = pyproj.Transformer.from_crs(WGS84, WEB_MERCATOR, always_xy=True).transform
_project_3857_to_sjtsk = pyproj.Transformer.from_crs(WEB_MERCATOR, SJTSK, always_xy=True).transform
_project_sjtsk_to_3857 = pyproj.Transformer.from_crs(SJTSK, WEB_MERCATOR, always_xy=True).transform


def mercator_tile_bounds(x: int, y: int, z: int) -> tuple[float, float, float, float]:
    """
    Vrátí bounding box dlaždice v souřadnicích EPSG:3857.
    """
    if z < 0:
        raise ValueError("Zoom level must be non-negative")
    n = 2 ** z
    lon_min = x / n * 360.0 - 180.0
    lon_max = (x + 1) / n * 360.0 - 180.0
    lat_min = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))
    lat_max = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    minx, miny = _project_to_3857(lon_min, lat_min)
    maxx, maxy = _project_to_3857(lon_max, lat_max)
    return minx, miny, maxx, maxy

NDVI_EVALSCRIPT = """
//VERSION=3
function setup() {
  return {
    input: [{bands: ["B08","B04","dataMask"]}],
    output: {bands: 3, sampleType: SampleType.FLOAT32}
  };
}

function evaluatePixel(sample) {
  let ndvi = (sample.B08 - sample.B04) / (sample.B08 + sample.B04);
  let normalized = (ndvi + 1.0) / 2.0;
  return [normalized, ndvi > 0 ? normalized : 0, ndvi < 0 ? Math.abs(ndvi) : 0];
}
"""

def ensure_sentinel_config():
    if not (SENTINEL_CLIENT_ID and SENTINEL_CLIENT_SECRET):
        raise HTTPException(
            status_code=500,
            detail="Chybí SENTINEL_CLIENT_ID / SENTINEL_CLIENT_SECRET v .env (Sentinel Hub API)."
        )

class BBoxRequest(BaseModel):
    min_lon: float
    min_lat: float
    max_lon: float
    max_lat: float


DEM_TILE_SIZE = 256


@app.get("/api/tiles/dem/{z}/{x}/{y}")
async def get_dem_tile(
    z: int,
    x: int,
    y: int,
    format: str = Query("float32", pattern="^(float32|terrarium)$"),
    nodata: float = Query(-32768.0, description="Hodnota použitá pro NoData pixely"),
    use_wcs: bool = Query(False, description="Pokusit se získat skutečná výšková data přes WCS"),
    use_atom: bool = Query(True, description="Použít skutečná DMR 5G data z ATOM cache")
):
    """
    Vrátí DEM dlaždici ve formátu float32 (raw buffer) nebo Terrarium RGB.
    Slouží jako zdroj pro GPU shader.
    
    Specifikace DMR 5G (ZABAGED):
    - Souřadnicový systém: S-JTSK / Krovak East North (EPSG:5514)
    - Výškový datum: Baltic 1957 height (Bpv, EPSG:8357)
    - Přesnost: 0.18m (odkrytý terén), 0.30m (zalesněný terén)
    - Zdroj: https://geoportal.cuzk.cz/Default.aspx?metadataID=CZ-CUZK-DMR5G-V
    - Dokumentace: https://www.opengis.net/def/crs/EPSG/0/8357
    
    Parametr use_wcs=true pokusí se stáhnout skutečná výšková data přes WCS.
    Fallback je WMS hillshade převedený na pseudo-elevaci (pouze vizuální).
    """
    try:
        minx, miny, maxx, maxy = mercator_tile_bounds(x, y, z)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    # Priorita 1: ATOM cache (skutečná DMR 5G data z LAZ)
    if use_atom:
        try:
            # Kontrola, zda máme cachovaný GeoTIFF pro tuto oblast
            # Převedeme střed tile do WGS84
            center_x = (minx + maxx) / 2
            center_y = (miny + maxy) / 2
            
            # Web Mercator → WGS84
            wgs84 = pyproj.CRS('EPSG:4326')
            web_merc = pyproj.CRS('EPSG:3857')
            transformer = pyproj.Transformer.from_crs(web_merc, wgs84, always_xy=True)
            lon, lat = transformer.transform(center_x, center_y)
            
            # Hledej GeoTIFF v cache
            geotiff_dir = CACHE_DIR / "geotiff"
            
            if geotiff_dir.exists():
                # Zkus najít odpovídající GeoTIFF
                for tif_path in geotiff_dir.glob("*.tif"):
                    try:
                        with rasterio.open(tif_path) as src:
                            # Transformuj tile bbox do S-JTSK (souřadnic GeoTIFF)
                            minx_sjtsk, miny_sjtsk = _project_3857_to_sjtsk(minx, miny)
                            maxx_sjtsk, maxy_sjtsk = _project_3857_to_sjtsk(maxx, maxy)
                            
                            # Získej GeoTIFF bounds v S-JTSK
                            tif_bounds = src.bounds
                            
                            # Kontrola překryvu bboxů
                            overlaps = not (
                                maxx_sjtsk < tif_bounds.left or
                                minx_sjtsk > tif_bounds.right or
                                maxy_sjtsk < tif_bounds.bottom or
                                miny_sjtsk > tif_bounds.top
                            )
                            
                            if overlaps:
                                from rasterio.warp import reproject, Resampling
                                from rasterio.transform import from_bounds
                                
                                # Výstupní pole 256x256 v souřadnicích Web Mercator
                                dst_array = np.full((DEM_TILE_SIZE, DEM_TILE_SIZE), nodata, dtype=np.float32)
                                
                                # Transformace výstupu: tile bbox ve Web Mercator (nativní projekce mapy)
                                dst_transform = from_bounds(
                                    minx, miny,
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
                                
                                # Filtruj extrémní hodnoty a NoData
                                valid_mask = (dst_array != nodata) & (dst_array > -1000) & (dst_array < 3000)
                                if valid_mask.any():
                                    print(f"[DEM] ✅ Použita ATOM cache: {tif_path.name}")
                                    print(f"      Výšky: {dst_array[valid_mask].min():.1f} - {dst_array[valid_mask].max():.1f} m n.m.")
                                    
                                    # Nahraď NoData hodnotou mimo rozsah (pro Terrarium encoding)
                                    # NoData bude -32768 → dekóduje se zpět jako -32768
                                    dst_array_clean = dst_array.copy()
                                    dst_array_clean[~valid_mask] = nodata
                                    
                                    if format == "float32":
                                        buffer = io.BytesIO(dst_array_clean.tobytes(order="C"))
                                        return Response(
                                            content=buffer.getvalue(),
                                            media_type="application/octet-stream",
                                            headers={
                                                "Cache-Control": "public, max-age=86400",
                                                "X-Data-Source": f"ATOM-Real-DMR5G-{tif_path.stem}"
                                            }
                                        )
                                    
                                    # Terrarium encoding s ošetřením NoData
                                    # Hodnoty: -1000 až 3000 m → 31768 až 35768 (po shiftu)
                                    shifted = np.clip(dst_array_clean + 32768.0, 0, 65535)
                                    r = np.floor(shifted / 256.0)
                                    g = shifted - r * 256.0
                                    b = np.floor((shifted - np.floor(shifted)) * 256.0)
                                    terrarium = np.stack([r, g, b], axis=-1).astype(np.uint8)
                                    img = Image.fromarray(terrarium, mode="RGB")
                                    buffer = io.BytesIO()
                                    img.save(buffer, format="PNG", optimize=True)
                                    buffer.seek(0)
                                    return StreamingResponse(
                                        buffer,
                                        media_type="image/png",
                                        headers={
                                            "Cache-Control": "public, max-age=86400",
                                            "X-Data-Source": f"ATOM-Real-DMR5G-{tif_path.stem}"
                                        }
                                    )
                    except Exception as e:
                        # Tento GeoTIFF nepokrývá tile nebo chyba při čtení
                        print(f"[DEM] ⚠️ Chyba při čtení {tif_path.name}: {e}")
                        continue
            
            # Pokud jsme nenašli v cache, pokus se stáhnout
            print(f"[DEM] ATOM cache miss pro tile {z}/{x}/{y}, pokouším se stáhnout...")
            # Toto může trvat dlouho (20 MB + rasterizace), nechť běží na pozadí
            # Pro production by bylo lepší queue systém
            
        except Exception as e:
            print(f"[DEM] ATOM selhalo: {e}, padám na WMS")
            # Pokračuj k fallbacku

    # Priorita 2: WCS pro skutečná výšková data (může selhat kvůli omezení služby)
    if use_wcs and z <= 14:  # WCS má limity na rozlišení a velikost požadavku
        try:
            # Transformace do S-JTSK (EPSG:5514) - nativní CRS DMR 5G
            minx_sjtsk, miny_sjtsk = _project_3857_to_sjtsk(minx, miny)
            maxx_sjtsk, maxy_sjtsk = _project_3857_to_sjtsk(maxx, maxy)
            
            wcs_url = "https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WCSServer"
            params = {
                "SERVICE": "WCS",
                "VERSION": "1.0.0",
                "REQUEST": "GetCoverage",
                "COVERAGE": "dmr5g",
                "BBOX": f"{minx_sjtsk},{miny_sjtsk},{maxx_sjtsk},{maxy_sjtsk}",
                "CRS": "EPSG:5514",
                "RESPONSE_CRS": "EPSG:5514",
                "FORMAT": "GeoTIFF",
                "WIDTH": DEM_TILE_SIZE,
                "HEIGHT": DEM_TILE_SIZE
            }
            
            headers_wcs = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": "https://geoportal.cuzk.cz/",
            }
            
            async with httpx.AsyncClient(timeout=20.0, verify=False) as client:
                resp = await client.get(wcs_url, params=params, headers=headers_wcs)
                
            if resp.status_code == 200 and resp.headers.get('content-type', '').startswith('image'):
                # Zpracování GeoTIFF s výškovými daty
                with io.BytesIO(resp.content) as mem_file:
                    with rasterio.open(mem_file) as src:
                        arr = src.read(1).astype(np.float32)
                        
                        # Ošetření NoData hodnot
                        if src.nodata is not None:
                            arr[arr == src.nodata] = nodata
                        
                        # DMR 5G je v metrech nad mořem (Bpv - Baltic 1957 height)
                        # Výška ČR se pohybuje cca 100-1600m
                        
                        if format == "float32":
                            buffer = io.BytesIO(arr.tobytes(order="C"))
                            return Response(
                                content=buffer.getvalue(),
                                media_type="application/octet-stream",
                                headers={
                                    "Cache-Control": "public, max-age=3600",
                                    "X-Data-Source": "WCS-Real-Elevation-DMR5G"
                                }
                            )
                        
                        # Terrarium encoding pro reálná data
                        shifted = np.clip(arr + 32768.0, 0, 65535)
                        r = np.floor(shifted / 256.0)
                        g = shifted - r * 256.0
                        b = np.floor((shifted - np.floor(shifted)) * 256.0)
                        terrarium = np.stack([r, g, b], axis=-1).astype(np.uint8)
                        img = Image.fromarray(terrarium, mode="RGB")
                        buffer = io.BytesIO()
                        img.save(buffer, format="PNG", optimize=True)
                        buffer.seek(0)
                        return StreamingResponse(
                            buffer,
                            media_type="image/png",
                            headers={
                                "Cache-Control": "public, max-age=3600",
                                "X-Data-Source": "WCS-Real-Elevation-DMR5G"
                            }
                        )
        except Exception as e:
            print(f"[DEM] WCS failed, falling back to WMS: {e}")
            # Pokračuj k WMS fallbacku

    # FALLBACK: WMS GrayscaleHillshade jako pseudo-DEM (pouze vizuální)
    wms_url = "https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WMSServer"
    
    params = {
        "SERVICE": "WMS",
        "VERSION": "1.3.0",
        "REQUEST": "GetMap",
        "LAYERS": "dmr5g:GrayscaleHillshade",
        "BBOX": f"{miny},{minx},{maxy},{maxx}",  # WMS 1.3.0 používá lat,lon pořadí pro EPSG:3857
        "CRS": "EPSG:3857",
        "WIDTH": DEM_TILE_SIZE,
        "HEIGHT": DEM_TILE_SIZE,
        "FORMAT": "image/png",
        "TRANSPARENT": "FALSE",
    }

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Referer": "https://geoportal.cuzk.cz/",
    }

    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        resp = await client.get(wms_url, params=params, headers=headers)
        print(f"[DEM] WMS Request URL: {resp.url}")
        print(f"[DEM] Status: {resp.status_code}")

    if resp.status_code != 200:
        detail = f"ČÚZK WMS error: {resp.status_code}"
        try:
            detail = f"{detail} - {resp.text[:200]}"
        except Exception:
            pass
        raise HTTPException(status_code=502, detail=detail)

    # Konverze PNG hillshade na pseudo-DEM data
    # UPOZORNĚNÍ: Toto nejsou skutečné výšky! Pouze aproximace pro vizualizaci.
    # Pro reálná data použijte parametr ?use_wcs=true
    with io.BytesIO(resp.content) as mem_file:
        img = Image.open(mem_file).convert('L')  # Grayscale
        arr = np.array(img, dtype=np.float32)
        
        # Normalizace 0-255 na typický výškový rozsah ČR (200-1000m střed)
        arr = 200.0 + (arr / 255.0) * 800.0

    if format == "float32":
        buffer = io.BytesIO(arr.tobytes(order="C"))
        return Response(
            content=buffer.getvalue(),
            media_type="application/octet-stream",
            headers={
                "Cache-Control": "public, max-age=3600",
                "X-Data-Source": "WMS-Pseudo-Elevation"
            }
        )

    # Terrarium fallback (RGB 8-bit)
    shifted = np.clip(arr + 32768.0, 0, 65535)
    r = np.floor(shifted / 256.0)
    g = shifted - r * 256.0
    b = np.floor((shifted - np.floor(shifted)) * 256.0)
    terrarium = np.stack([r, g, b], axis=-1).astype(np.uint8)
    img = Image.fromarray(terrarium, mode="RGB")
    buffer = io.BytesIO()
    img.save(buffer, format="PNG", optimize=True)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="image/png",
        headers={
            "Cache-Control": "public, max-age=3600",
            "X-Data-Source": "WMS-Pseudo-Elevation"
        }
    )

@app.get("/")
async def root():
    return {
        "system": "Cyber Archeology Terminal",
        "status": "ONLINE",
        "mode": "STANDBY",
        "whitebox_version": wbt.version().split('\n')[0]
    }

@app.get("/health")
async def health_check():
    return {"status": "ok", "whitebox": "ready"}

@app.post("/api/atom/download")
async def download_dmr5g_for_area(lat: float = Query(...), lon: float = Query(...)):
    """
    Stáhne a zpracuje DMR 5G data pro zadanou oblast (WGS84).
    
    UPOZORNĚNÍ: Může trvat 1-2 minuty (stahování ~20 MB + rasterizace).
    Pro produkci použít queue systém (Celery, Redis Queue, apod.).
    """
    try:
        result_path = await download_and_process_area(lat, lon)
        
        if result_path:
            return {
                "status": "success",
                "message": f"DMR 5G data stažena a zpracována",
                "geotiff_path": str(result_path),
                "lat": lat,
                "lon": lon,
                "note": "Data jsou nyní v cache a budou použita pro DEM tiles"
            }
        else:
            raise HTTPException(status_code=500, detail="Nepodařilo se stáhnout DMR 5G data")
    
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/atom/cache/list")
async def list_cached_geotiffs():
    """Vypíše cachované GeoTIFF soubory."""
    geotiff_dir = CACHE_DIR / "geotiff"
    
    if not geotiff_dir.exists():
        return {"cached_files": [], "count": 0}
    
    files = []
    for tif_path in geotiff_dir.glob("*.tif"):
        try:
            with rasterio.open(tif_path) as src:
                bounds = src.bounds
                files.append({
                    "filename": tif_path.name,
                    "size_mb": tif_path.stat().st_size / (1024 * 1024),
                    "bbox_sjtsk": {
                        "left": bounds.left,
                        "bottom": bounds.bottom,
                        "right": bounds.right,
                        "top": bounds.top
                    },
                    "dimensions": {"width": src.width, "height": src.height},
                    "crs": str(src.crs)
                })
        except Exception:
            continue
    
    return {"cached_files": files, "count": len(files)}

@app.post("/api/analyze/profile")
async def get_terrain_profile(geojson: dict):
    """
    Vypočítá výškový profil pro zadanou GeoJSON LineString.
    Data stahuje dynamicky z ČÚZK WCS (DMR 5G).
    """
    try:
        # 1. Parse Geometry
        geom = shape(geojson)
        if geom.geom_type != 'LineString':
            raise HTTPException(status_code=400, detail="Input must be a LineString")

        # 2. Reproject to EPSG:3857 (Web Mercator) for metric buffer calculations
        #    and WCS compatibility
        project = pyproj.Transformer.from_crs(WGS84, WEB_MERCATOR, always_xy=True).transform
        
        line_3857 = transform(project, geom)
        
        # 3. Prepare WCS Request
        # We need a bounding box around the line
        minx, miny, maxx, maxy = line_3857.bounds
        
        # Add buffer to ensure we have data even for diagonal lines
        buff = 50 # meters
        bbox_str = f"{minx-buff},{miny-buff},{maxx+buff},{maxy+buff}"
        
        # Calculate resolution (approx 1m usually, but let's ask for what we need)
        # Width/Height of the image.
        width = int((maxx - minx + 2*buff) / 2.0) # 2m resolution approx
        height = int((maxy - miny + 2*buff) / 2.0)
        
        # Cap max size to avoid huge requests
        max_dim = 2000
        if width > max_dim or height > max_dim:
             scale = max_dim / max(width, height)
             width = int(width * scale)
             height = int(height * scale)

        wcs_url = "https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WCSServer"
        params = {
            "SERVICE": "WCS",
            "VERSION": "1.0.0",
            "REQUEST": "GetCoverage",
            "COVERAGE": "dmr5g",
            "BBOX": bbox_str,
            "CRS": "EPSG:3857",
            "RESPONSE_CRS": "EPSG:3857",
            "FORMAT": "GeoTIFF",
            "WIDTH": width,
            "HEIGHT": height
        }
        
        async with httpx.AsyncClient() as client:
            resp = await client.get(wcs_url, params=params, timeout=30.0)
            
        if resp.status_code != 200:
            # Debug info
            print(f"WCS Error: {resp.status_code}, {resp.text[:200]}")
            raise HTTPException(status_code=502, detail="ČÚZK WCS Error")
            
        # 4. Process GeoTIFF in Memory
        with io.BytesIO(resp.content) as mem_file:
            with rasterio.open(mem_file) as src:
                # Sample points along the line
                length_m = line_3857.length
                
                # Determine number of points based on length (e.g., 1 point per 2 meters)
                # But cap it to keep graph performant
                num_points = min(int(length_m / 2), 200) 
                num_points = max(num_points, 10) # At least 10 points
                
                profile_data = []
                
                # Interpolate points
                for i in range(num_points + 1):
                    fraction = i / num_points
                    point = line_3857.interpolate(fraction, normalized=True)
                    
                    # Sample raster at this point
                    try:
                        # index() returns row, col
                        row, col = src.index(point.x, point.y)
                        
                        # Read value safely
                        window = Window(col, row, 1, 1)
                        val = src.read(1, window=window)[0][0]
                        
                        # Handle NoData (rasterio usually handles this, but explicit check is good)
                        if val < -1000: # DMR 5G nodata is usually very low negative
                            val = None
                        else:
                            val = float(val)
                    except Exception:
                        val = None
                    
                    # Get original Lat/Lng for this point
                    orig_point = geom.interpolate(fraction, normalized=True)
                        
                    profile_data.append({
                        "distance": round(fraction * length_m, 1),
                        "elevation": round(val, 2) if val is not None else 0,
                        "lat": orig_point.y,
                        "lng": orig_point.x
                    })
                    
        return {
            "length_m": round(length_m, 2),
            "samples": profile_data
        }

    except Exception as e:
        # Log error
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/sky-view-factor")
async def calculate_sky_view_factor(bbox: BBoxRequest):
    """
    Vypočítá Sky-View Factor pro daný bounding box.
    Sky-View Factor je hlavní metoda pro vizualizaci terénu v lese (vidí skrz stromy).
    """
    try:
        # TODO: Stáhnout DMR 5G data pro bbox z ČÚZK Atom služby
        # Pro MVP použijeme mock data nebo stáhneme skutečná data
        
        # Prozatím vracíme mock response
        return {
            "status": "processing",
            "bbox": bbox.dict(),
            "message": "Sky-View Factor calculation endpoint ready. Data download from ČÚZK needs to be implemented."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/analyze/ndvi")
async def calculate_ndvi(
    min_lon: float = Query(...),
    min_lat: float = Query(...),
    max_lon: float = Query(...),
    max_lat: float = Query(...),
    from_date: str = Query(None, description="ISO datum od (YYYY-MM-DD)"),
    to_date: str = Query(None, description="ISO datum do (YYYY-MM-DD)"),
    resolution: int = Query(40, description="Velikost pixelu v metrech (default 40 m)"),
):
    """
    Vygeneruje NDVI (Normalized Difference Vegetation Index) mosaiku pro zadaný bounding box
    pomocí Sentinel-2 (Sentinel Hub API). Výstupem je PNG heatmapa.
    """
    ensure_sentinel_config()

    try:
        bbox = BBox(bbox=[min_lon, min_lat, max_lon, max_lat], crs=CRS.WGS84)
    except ValueError:
        raise HTTPException(status_code=400, detail="Neplatný bounding box.")

    # Výchozí časové období = posledních 60 dní
    if not to_date:
        to_date = datetime.utcnow().date().isoformat()
    if not from_date:
        from_date = (datetime.utcnow().date() - timedelta(days=60)).isoformat()

    try:
        dims = bbox_to_dimensions(bbox, resolution=resolution)
    except Exception:
        raise HTTPException(status_code=400, detail="Nelze spočítat rozměry pro daný bbox.")

    request = SentinelHubRequest(
        evalscript=NDVI_EVALSCRIPT,
        input_data=[
            SentinelHubRequest.InputData(
                data_collection=DataCollection.SENTINEL2_L2A,
                time_interval=(from_date, to_date),
                mosaicking_order="mostRecent"
            )
        ],
        responses=[SentinelHubRequest.OutputResponse("default", MimeType.PNG)],
        bbox=bbox,
        size=dims,
        config=sh_config,
    )

    try:
        data_bytes = request.get_data(decode_data=False)[0]
    except Exception as exc:
        if "SentinelHub" in str(type(exc).__name__):
            raise HTTPException(status_code=502, detail=f"Sentinel Hub error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))

    return StreamingResponse(
        io.BytesIO(data_bytes),
        media_type="image/png",
        headers={"Content-Disposition": "inline; filename=ndvi.png"}
    )

@app.get("/api/tools/list")
async def list_whitebox_tools():
    """Vrátí seznam dostupných WhiteboxTools nástrojů."""
    try:
        tools = wbt.list_tools()
        return {"tools": tools, "count": len(tools)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tools/sky-view-factor/info")
async def sky_view_factor_info():
    """Vrátí informace o Sky-View Factor nástroji."""
    try:
        help_text = wbt.tool_help("SkyViewFactor")
        return {"tool": "SkyViewFactor", "help": help_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/analyze/sky-view-factor/upload")
async def sky_view_factor_from_upload(
    file: UploadFile = File(...),
    azimuth_interval: float = 15.0,
    altitude: float = 45.0,
    output: str = "png"
):
    """
    Přijme DEM (GeoTIFF) jako vstup a vrátí Sky-View Factor raster.
    Návratový formát může být PNG (default) nebo GeoTIFF.
    """
    if not file.filename.lower().endswith((".tif", ".tiff")):
        raise HTTPException(status_code=400, detail="Očekávám GeoTIFF (.tif/.tiff)")

    temp_dir = tempfile.mkdtemp(prefix="svf_")
    try:
        dem_path = Path(temp_dir) / "input_dem.tif"
        svf_path = Path(temp_dir) / "svf.tif"

        # Uložení uploadovaného DEM
        with dem_path.open("wb") as dst:
            content = await file.read()
            dst.write(content)

        # Výpočet Sky-View Factoru
        try:
            wbt.sky_view_factor(
                str(dem_path),
                str(svf_path),
                azimuth_interval=azimuth_interval,
                altitude=altitude,
                full_mode=True
            )
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"WhiteboxTools error: {exc}")

        if output.lower() == "geotiff":
            with svf_path.open("rb") as src:
                data = src.read()
            return StreamingResponse(
                io.BytesIO(data),
                media_type="image/tiff",
                headers={"Content-Disposition": "attachment; filename=sky_view_factor.tif"}
            )

        # Výchozí PNG normalizace
        with rasterio.open(svf_path) as src:
            arr = src.read(1)

        arr = np.nan_to_num(arr, nan=0.0)
        arr_min = float(arr.min())
        arr_max = float(arr.max())
        if arr_max - arr_min == 0:
            norm = np.zeros_like(arr, dtype=np.uint8)
        else:
            norm = ((arr - arr_min) / (arr_max - arr_min) * 255).astype(np.uint8)

        image = Image.fromarray(norm)
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)

        return StreamingResponse(
            buffer,
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=sky_view_factor.png"}
        )
    finally:
        # Clean up temp directory
        try:
            for item in Path(temp_dir).glob("*"):
                item.unlink(missing_ok=True)
            Path(temp_dir).rmdir()
        except Exception:
            pass


@app.get("/api/debug/tile-coords/{z}/{x}/{y}")
async def debug_tile_coords(z: int, x: int, y: int):
    """Debug endpoint pro kontrolu transformací souřadnic tile → S-JTSK"""
    minx, miny, maxx, maxy = mercator_tile_bounds(x, y, z)
    minx_sjtsk, miny_sjtsk = _project_3857_to_sjtsk(minx, miny)
    maxx_sjtsk, maxy_sjtsk = _project_3857_to_sjtsk(maxx, maxy)
    
    # Zkontroluj, které GeoTIFFy máme v cache
    geotiff_dir = CACHE_DIR / "geotiff"
    available_tiffs = []
    
    if geotiff_dir.exists():
        for tif_path in list(geotiff_dir.glob("*.tif"))[:10]:  # Prvních 10
            try:
                with rasterio.open(tif_path) as src:
                    bounds = src.bounds
                    overlaps = not (
                        maxx_sjtsk < bounds.left or
                        minx_sjtsk > bounds.right or
                        maxy_sjtsk < bounds.bottom or
                        miny_sjtsk > bounds.top
                    )
                    available_tiffs.append({
                        "file": tif_path.name,
                        "bounds_sjtsk": {
                            "left": float(bounds.left),
                            "bottom": float(bounds.bottom),
                            "right": float(bounds.right),
                            "top": float(bounds.top)
                        },
                        "crs": str(src.crs),
                        "overlaps": overlaps
                    })
            except:
                pass
    
    return {
        "tile": {"z": z, "x": x, "y": y},
        "mercator_bbox": {
            "minx": float(minx), "miny": float(miny),
            "maxx": float(maxx), "maxy": float(maxy)
        },
        "sjtsk_bbox": {
            "minx": float(minx_sjtsk), "miny": float(miny_sjtsk),
            "maxx": float(maxx_sjtsk), "maxy": float(maxy_sjtsk)
        },
        "available_geotiffs_sample": available_tiffs,
        "total_geotiffs": len(list(geotiff_dir.glob("*.tif"))) if geotiff_dir.exists() else 0
    }
