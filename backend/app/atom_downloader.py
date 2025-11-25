"""
ATOM Feed Downloader pro DMR 5G data z ČÚZK.

Stahuje LAZ point cloud soubory, rasterizuje je do GeoTIFF
a poskytuje skutečné výškové hodnoty v metrech nad mořem (Bpv).

Reference:
- ATOM Feed: https://atom.cuzk.gov.cz/DMR5G-SJTSK/DMR5G-SJTSK.xml
- EPSG:5514 (S-JTSK): https://www.opengis.net/def/crs/EPSG/0/5514
- EPSG:8357 (Bpv): https://www.opengis.net/def/crs/EPSG/0/8357
"""

import httpx
import asyncio
import zipfile
import io
from pathlib import Path
from typing import List, Dict, Optional, Tuple
import xml.etree.ElementTree as ET
import numpy as np
import laspy
import rasterio
from rasterio.transform import from_bounds
from rasterio.crs import CRS as RioCRS
import pyproj
from shapely.geometry import Point, box as shapely_box
from shapely.ops import transform as shapely_transform


# ATOM Feed URL
ATOM_FEED_URL = "https://atom.cuzk.gov.cz/DMR5G-SJTSK/DMR5G-SJTSK.xml"

# Namespaces pro XML parsing
NAMESPACES = {
    'atom': 'http://www.w3.org/2005/Atom',
    'georss': 'http://www.georss.org/georss',
    'inspire_dls': 'http://inspire.ec.europa.eu/schemas/inspire_dls/1.0'
}

# Cache adresář pro stažená data
CACHE_DIR = Path(__file__).parent.parent / "data_cache" / "dmr5g"
CACHE_DIR.mkdir(parents=True, exist_ok=True)


class AtomMapSheet:
    """Reprezentace jednoho mapového listu DMR 5G."""
    
    def __init__(self, sheet_id: str, title: str, bbox: Tuple[float, float, float, float], 
                 dataset_feed_url: str, updated: str):
        self.sheet_id = sheet_id
        self.title = title
        self.bbox = bbox  # (min_lat, min_lon, max_lat, max_lon) v WGS84
        self.dataset_feed_url = dataset_feed_url
        self.updated = updated
    
    def __repr__(self):
        return f"<AtomMapSheet {self.sheet_id}: {self.title}>"


async def fetch_atom_feed() -> List[AtomMapSheet]:
    """
    Stáhne hlavní ATOM feed a parsuje seznam dostupných mapových listů.
    
    Returns:
        List mapových listů s jejich metadaty
    """
    print(f"[ATOM] Stahuji hlavní feed: {ATOM_FEED_URL}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(ATOM_FEED_URL)
        resp.raise_for_status()
    
    # Parse XML
    root = ET.fromstring(resp.content)
    
    sheets = []
    for entry in root.findall('atom:entry', NAMESPACES):
        sheet_id_elem = entry.find('inspire_dls:spatial_dataset_identifier_code', NAMESPACES)
        title_elem = entry.find('atom:title', NAMESPACES)
        polygon_elem = entry.find('georss:polygon', NAMESPACES)
        link_elem = entry.find('atom:link[@rel="alternate"]', NAMESPACES)
        updated_elem = entry.find('atom:updated', NAMESPACES)
        
        if sheet_id_elem is not None and title_elem is not None and polygon_elem is not None and link_elem is not None:
            sheet_id = sheet_id_elem.text
            title = title_elem.text
            dataset_feed_url = link_elem.get('href')
            updated = updated_elem.text if updated_elem is not None else ""
            
            # Parse bbox z georss:polygon
            # Formát: "lat1 lon1 lat2 lon2 lat3 lon3 lat4 lon4 lat1 lon1"
            coords = list(map(float, polygon_elem.text.split()))
            lats = [coords[i] for i in range(0, len(coords), 2)]
            lons = [coords[i] for i in range(1, len(coords), 2)]
            
            bbox = (min(lats), min(lons), max(lats), max(lons))
            
            sheet = AtomMapSheet(sheet_id, title, bbox, dataset_feed_url, updated)
            sheets.append(sheet)
    
    print(f"[ATOM] Nalezeno {len(sheets)} mapových listů")
    return sheets


async def fetch_dataset_feed(sheet: AtomMapSheet) -> Optional[str]:
    """
    Stáhne dataset feed pro konkrétní mapový list a vrátí URL ke stažení LAZ.
    
    Returns:
        URL ke stažení ZIP s LAZ souborem
    """
    print(f"[ATOM] Stahuji dataset feed: {sheet.title}")
    
    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.get(sheet.dataset_feed_url)
        resp.raise_for_status()
    
    # Parse XML dataset feedu
    root = ET.fromstring(resp.content)
    
    # Hledáme link na download
    for entry in root.findall('atom:entry', NAMESPACES):
        for link in entry.findall('atom:link', NAMESPACES):
            link_type = link.get('type')
            if link.get('rel') == 'alternate' and link_type in ['application/vnd.laszip', 'application/zip']:
                download_url = link.get('href')
                print(f"[ATOM] Nalezen download URL: {download_url}")
                return download_url
    
    print(f"[ATOM] VAROVÁNÍ: Nenalezen download link pro {sheet.title}")
    return None


async def download_laz_zip(url: str, output_path: Path) -> bool:
    """
    Stáhne ZIP soubor obsahující LAZ data.
    
    Returns:
        True pokud úspěšné
    """
    if output_path.exists():
        print(f"[ATOM] Soubor již existuje: {output_path.name}")
        return True
    
    print(f"[ATOM] Stahuji LAZ ZIP (~20 MB): {output_path.name}")
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream('GET', url) as resp:
                resp.raise_for_status()
                
                with output_path.open('wb') as f:
                    total = 0
                    async for chunk in resp.aiter_bytes(chunk_size=8192):
                        f.write(chunk)
                        total += len(chunk)
                        if total % (1024 * 1024) == 0:  # Každý MB
                            print(f"[ATOM] Staženo: {total // (1024*1024)} MB")
        
        print(f"[ATOM] ✅ Staženo: {output_path.name}")
        return True
    
    except Exception as e:
        print(f"[ATOM] ❌ Chyba při stahování: {e}")
        if output_path.exists():
            output_path.unlink()
        return False


def extract_laz_from_zip(zip_path: Path) -> Optional[Path]:
    """
    Extrahuje LAZ soubor ze ZIP archivu.
    
    Returns:
        Path k LAZ souboru
    """
    laz_dir = zip_path.parent / "laz"
    laz_dir.mkdir(exist_ok=True)
    
    print(f"[ATOM] Rozbaluji ZIP: {zip_path.name}")
    
    try:
        with zipfile.ZipFile(zip_path, 'r') as zf:
            # Najdi LAZ soubor v archivu
            laz_files = [f for f in zf.namelist() if f.lower().endswith('.laz')]
            
            if not laz_files:
                print(f"[ATOM] ❌ LAZ soubor nenalezen v archivu!")
                return None
            
            laz_filename = laz_files[0]
            laz_path = laz_dir / Path(laz_filename).name
            
            if laz_path.exists():
                print(f"[ATOM] LAZ již existuje: {laz_path.name}")
                return laz_path
            
            # Extrahuj
            with zf.open(laz_filename) as source:
                with laz_path.open('wb') as target:
                    target.write(source.read())
            
            print(f"[ATOM] ✅ Extrahováno: {laz_path.name}")
            return laz_path
    
    except Exception as e:
        print(f"[ATOM] ❌ Chyba při rozbalování: {e}")
        return None


def rasterize_laz_to_geotiff(laz_path: Path, resolution: float = 5.0) -> Optional[Path]:
    """
    Rasterizuje LAZ point cloud do GeoTIFF DEMu.
    
    Args:
        laz_path: Cesta k LAZ souboru
        resolution: Rozlišení v metrech (default 5m = DMR 5G)
    
    Returns:
        Path k výstupnímu GeoTIFF
    """
    tif_dir = laz_path.parent.parent / "geotiff"
    tif_dir.mkdir(exist_ok=True)
    
    tif_path = tif_dir / f"{laz_path.stem}.tif"
    
    if tif_path.exists():
        print(f"[ATOM] GeoTIFF již existuje: {tif_path.name}")
        return tif_path
    
    print(f"[ATOM] Rasterizuji LAZ → GeoTIFF (rozlišení {resolution}m)")
    
    try:
        # Načti LAZ point cloud
        with laspy.open(laz_path) as las_file:
            las = las_file.read()
            
            # Získej souřadnice a výšky
            x = las.x
            y = las.y
            z = las.z
            
            print(f"[ATOM] Načteno {len(x):,} bodů z point cloudu")
            print(f"[ATOM] X rozsah: {x.min():.2f} - {x.max():.2f}")
            print(f"[ATOM] Y rozsah: {y.min():.2f} - {y.max():.2f}")
            print(f"[ATOM] Z rozsah (výška): {z.min():.2f} - {z.max():.2f} m")
            
            # Spočti bounding box
            minx, maxx = x.min(), x.max()
            miny, maxy = y.min(), y.max()
            
            # Vytvoř grid
            width = int((maxx - minx) / resolution) + 1
            height = int((maxy - miny) / resolution) + 1
            
            print(f"[ATOM] Raster rozměry: {width} x {height} pixelů")
            
            # Inicializuj prázdný raster
            raster = np.full((height, width), -32768.0, dtype=np.float32)
            counts = np.zeros((height, width), dtype=np.int32)
            
            # Rasterizace - průměrování bodů v každém pixelu
            for i in range(len(x)):
                col = int((x[i] - minx) / resolution)
                row = int((maxy - y[i]) / resolution)  # Y je převrácené
                
                if 0 <= row < height and 0 <= col < width:
                    if counts[row, col] == 0:
                        raster[row, col] = z[i]
                    else:
                        # Průměrování více bodů v pixelu
                        raster[row, col] = (raster[row, col] * counts[row, col] + z[i]) / (counts[row, col] + 1)
                    counts[row, col] += 1
            
            # Interpolace prázdných pixelů (jednoduchá - nearest neighbor by bylo lepší)
            # Pro produkci použít scipy.interpolate nebo gdal_fillnodata
            mask = (raster == -32768.0)
            filled_pixels = np.sum(~mask)
            print(f"[ATOM] Vyplněno {filled_pixels:,} / {raster.size:,} pixelů ({filled_pixels/raster.size*100:.1f}%)")
            
            # Vytvoř transformaci
            transform = from_bounds(minx, miny, maxx, maxy, width, height)
            
            # Zapiš GeoTIFF
            with rasterio.open(
                tif_path,
                'w',
                driver='GTiff',
                height=height,
                width=width,
                count=1,
                dtype=rasterio.float32,
                crs=RioCRS.from_epsg(5514),  # S-JTSK
                transform=transform,
                compress='deflate',
                nodata=-32768.0
            ) as dst:
                dst.write(raster, 1)
                dst.set_band_description(1, 'Elevation (m above Baltic 1957)')
            
            print(f"[ATOM] ✅ Vytvořen GeoTIFF: {tif_path.name}")
            return tif_path
    
    except Exception as e:
        print(f"[ATOM] ❌ Chyba při rasterizaci: {e}")
        import traceback
        traceback.print_exc()
        return None


def find_mapsheet_for_point(sheets: List[AtomMapSheet], lat: float, lon: float) -> Optional[AtomMapSheet]:
    """
    Najde mapový list obsahující daný bod (WGS84).
    """
    point = Point(lon, lat)
    
    for sheet in sheets:
        min_lat, min_lon, max_lat, max_lon = sheet.bbox
        bbox = shapely_box(min_lon, min_lat, max_lon, max_lat)
        
        if bbox.contains(point):
            return sheet
    
    return None


async def download_and_process_area(lat: float, lon: float) -> Optional[Path]:
    """
    Hlavní funkce: Stáhne a zpracuje DMR 5G data pro danou oblast.
    
    Args:
        lat, lon: WGS84 souřadnice bodu v oblasti zájmu
    
    Returns:
        Path k výslednému GeoTIFF
    """
    print(f"\n{'='*60}")
    print(f"[ATOM] Začínám download pro oblast: {lat:.4f}°N, {lon:.4f}°E")
    print(f"{'='*60}\n")
    
    # 1. Načti ATOM feed
    sheets = await fetch_atom_feed()
    
    # 2. Najdi relevantní mapový list
    sheet = find_mapsheet_for_point(sheets, lat, lon)
    
    if not sheet:
        print(f"[ATOM] ❌ Žádný mapový list pro zadaný bod!")
        return None
    
    print(f"[ATOM] ✅ Nalezen mapový list: {sheet.title}")
    
    # 3. Získej download URL
    download_url = await fetch_dataset_feed(sheet)
    
    if not download_url:
        return None
    
    # 4. Stáhni ZIP
    zip_path = CACHE_DIR / f"{sheet.sheet_id}.zip"
    success = await download_laz_zip(download_url, zip_path)
    
    if not success:
        return None
    
    # 5. Extrahuj LAZ
    laz_path = extract_laz_from_zip(zip_path)
    
    if not laz_path:
        return None
    
    # 6. Rasterizuj do GeoTIFF
    tif_path = rasterize_laz_to_geotiff(laz_path, resolution=5.0)
    
    if not tif_path:
        return None
    
    print(f"\n{'='*60}")
    print(f"[ATOM] ✅ HOTOVO! GeoTIFF: {tif_path}")
    print(f"{'='*60}\n")
    
    return tif_path


# CLI test
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python atom_downloader.py <lat> <lon>")
        print("Example: python atom_downloader.py 50.0755 14.4378  # Praha")
        sys.exit(1)
    
    lat = float(sys.argv[1])
    lon = float(sys.argv[2])
    
    result = asyncio.run(download_and_process_area(lat, lon))
    
    if result:
        print(f"\n✅ Úspěch! GeoTIFF uložen: {result}")
    else:
        print(f"\n❌ Selhalo!")

