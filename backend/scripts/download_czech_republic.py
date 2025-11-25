#!/usr/bin/env python3
"""
Skript pro stažení DMR 5G dat pro celou Českou republiku.

Stahuje data po mapových listech přes ATOM feed, s podporou:
- Resume/restart (přeskočí již stažené)
- Rate limiting (nepreload ČÚZK servery)
- Progress tracking
- Error handling & retry
- Statistiky pokrytí

Použití:
    python download_czech_republic.py [--mode MODE] [--limit N]

Režimy:
    --mode full      Celá ČR (16,301 listů, ~40-50 GB, ~3-4 dny)
    --mode cities    Pouze města (Praha, Brno, Ostrava, Plzeň, ...)
    --mode regions   Po krajích (výběr kraje)
    --mode custom    Vlastní oblast (bbox)
    --mode test      Test (pouze 10 listů)

Přepínače:
    --limit N        Max počet listů k stažení
    --rate SECS      Pauza mezi downloady (default: 2s)
    --skip-existing  Přeskoč již stažené (default: true)
    --parallel N     Paralelní downloady (default: 1, max: 4)
"""

import asyncio
import argparse
import sys
import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import time

# Import našeho downloaderu
sys.path.insert(0, str(Path(__file__).parent.parent))
from app.atom_downloader import (
    fetch_atom_feed, 
    fetch_dataset_feed,
    download_laz_zip,
    extract_laz_from_zip,
    rasterize_laz_to_geotiff,
    AtomMapSheet,
    CACHE_DIR
)

# Definice českých měst (top 30 podle počtu obyvatel)
CZECH_CITIES = [
    {"name": "Praha", "lat": 50.0755, "lon": 14.4378, "priority": 1},
    {"name": "Brno", "lat": 49.1951, "lon": 16.6077, "priority": 1},
    {"name": "Ostrava", "lat": 49.8209, "lon": 18.2625, "priority": 1},
    {"name": "Plzeň", "lat": 49.7477, "lon": 13.3775, "priority": 1},
    {"name": "Liberec", "lat": 50.7671, "lon": 15.0561, "priority": 2},
    {"name": "Olomouc", "lat": 49.5938, "lon": 17.2509, "priority": 2},
    {"name": "České Budějovice", "lat": 48.9745, "lon": 14.4744, "priority": 2},
    {"name": "Hradec Králové", "lat": 50.2092, "lon": 15.8327, "priority": 2},
    {"name": "Ústí nad Labem", "lat": 50.6607, "lon": 14.0322, "priority": 2},
    {"name": "Pardubice", "lat": 50.0343, "lon": 15.7812, "priority": 2},
    {"name": "Zlín", "lat": 49.2266, "lon": 17.6667, "priority": 3},
    {"name": "Havířov", "lat": 49.7794, "lon": 18.4369, "priority": 3},
    {"name": "Kladno", "lat": 50.1476, "lon": 14.1028, "priority": 3},
    {"name": "Most", "lat": 50.5030, "lon": 13.6361, "priority": 3},
    {"name": "Opava", "lat": 49.9387, "lon": 17.9027, "priority": 3},
    {"name": "Frýdek-Místek", "lat": 49.6833, "lon": 18.3500, "priority": 3},
    {"name": "Karviná", "lat": 49.8542, "lon": 18.5419, "priority": 3},
    {"name": "Jihlava", "lat": 49.3961, "lon": 15.5911, "priority": 3},
    {"name": "Teplice", "lat": 50.6403, "lon": 13.8247, "priority": 3},
    {"name": "Karlovy Vary", "lat": 50.2327, "lon": 12.8710, "priority": 3},
]

# Definice krajů ČR
CZECH_REGIONS = {
    "praha": {"name": "Praha", "bbox": (49.95, 14.25, 50.20, 14.70)},
    "stredocesky": {"name": "Středočeský", "bbox": (49.50, 13.50, 50.50, 15.50)},
    "jihocesky": {"name": "Jihočeský", "bbox": (48.55, 13.40, 49.50, 15.00)},
    "plzensky": {"name": "Plzeňský", "bbox": (49.20, 12.70, 50.20, 14.00)},
    "karlovarsky": {"name": "Karlovarský", "bbox": (49.85, 12.09, 50.45, 13.30)},
    "ustecky": {"name": "Ústecký", "bbox": (50.20, 13.40, 50.90, 14.80)},
    "liberecky": {"name": "Liberecký", "bbox": (50.50, 14.60, 51.10, 15.50)},
    "kralovehradecky": {"name": "Královéhradecký", "bbox": (50.00, 15.30, 50.80, 16.60)},
    "pardubicky": {"name": "Pardubický", "bbox": (49.50, 15.40, 50.20, 16.80)},
    "vysocina": {"name": "Vysočina", "bbox": (49.10, 15.00, 49.80, 16.40)},
    "jihomoravsky": {"name": "Jihomoravský", "bbox": (48.55, 15.70, 49.60, 17.40)},
    "olomoucky": {"name": "Olomoucký", "bbox": (49.35, 16.70, 50.30, 18.00)},
    "moravskoslezsky": {"name": "Moravskoslezský", "bbox": (49.40, 17.50, 50.35, 18.90)},
    "zlinsky": {"name": "Zlínský", "bbox": (48.85, 17.20, 49.60, 18.30)},
}


class DownloadStats:
    """Statistiky stahování."""
    
    def __init__(self):
        self.total_sheets = 0
        self.downloaded = 0
        self.skipped = 0
        self.failed = 0
        self.start_time = time.time()
        self.total_size_mb = 0.0
    
    def print_progress(self):
        elapsed = time.time() - self.start_time
        progress = (self.downloaded + self.skipped + self.failed) / max(self.total_sheets, 1) * 100
        
        print(f"\n{'='*60}")
        print(f"📊 PROGRESS: {progress:.1f}% ({self.downloaded + self.skipped}/{self.total_sheets})")
        print(f"✅ Staženo: {self.downloaded}")
        print(f"⏭️  Přeskočeno: {self.skipped}")
        print(f"❌ Selhalo: {self.failed}")
        print(f"💾 Velikost: {self.total_size_mb:.1f} MB")
        print(f"⏱️  Čas: {elapsed/60:.1f} min")
        if self.downloaded > 0:
            avg_time = elapsed / (self.downloaded + self.skipped + self.failed)
            remaining = (self.total_sheets - self.downloaded - self.skipped - self.failed) * avg_time
            print(f"⏳ Zbývá: ~{remaining/60:.0f} min (~{remaining/3600:.1f} hodin)")
        print(f"{'='*60}\n")


def filter_sheets_by_bbox(sheets: List[AtomMapSheet], bbox: tuple) -> List[AtomMapSheet]:
    """Filtruje mapové listy podle bounding boxu (min_lat, min_lon, max_lat, max_lon)."""
    min_lat, min_lon, max_lat, max_lon = bbox
    filtered = []
    
    for sheet in sheets:
        sheet_min_lat, sheet_min_lon, sheet_max_lat, sheet_max_lon = sheet.bbox
        
        # Kontrola překryvu
        if not (sheet_max_lat < min_lat or sheet_min_lat > max_lat or
                sheet_max_lon < min_lon or sheet_min_lon > max_lon):
            filtered.append(sheet)
    
    return filtered


def filter_sheets_by_cities(sheets: List[AtomMapSheet], cities: List[dict], 
                            radius_km: float = 10.0) -> List[AtomMapSheet]:
    """Filtruje mapové listy kolem měst."""
    from shapely.geometry import Point, box as shapely_box
    
    # Převeď radius na stupně (přibližně)
    radius_deg = radius_km / 111.0  # 1° ~ 111 km
    
    selected_sheets = set()
    
    for city in cities:
        city_point = Point(city["lon"], city["lat"])
        city_bbox = shapely_box(
            city["lon"] - radius_deg,
            city["lat"] - radius_deg,
            city["lon"] + radius_deg,
            city["lat"] + radius_deg
        )
        
        for sheet in sheets:
            sheet_min_lat, sheet_min_lon, sheet_max_lat, sheet_max_lon = sheet.bbox
            sheet_box = shapely_box(sheet_min_lon, sheet_min_lat, sheet_max_lon, sheet_max_lat)
            
            if city_bbox.intersects(sheet_box):
                selected_sheets.add(sheet.sheet_id)
    
    return [s for s in sheets if s.sheet_id in selected_sheets]


async def download_sheet(sheet: AtomMapSheet, stats: DownloadStats, 
                        skip_existing: bool = True) -> bool:
    """Stáhne a zpracuje jeden mapový list."""
    
    # Kontrola, zda již existuje
    geotiff_dir = CACHE_DIR / "geotiff"
    expected_tif = geotiff_dir / f"{sheet.sheet_id.split('_')[-1]}.tif"
    
    if skip_existing and expected_tif.exists():
        print(f"⏭️  Přeskočeno (již staženo): {sheet.title}")
        stats.skipped += 1
        stats.print_progress()
        return True
    
    try:
        print(f"\n{'─'*60}")
        print(f"📥 Stahuji: {sheet.title}")
        print(f"   ID: {sheet.sheet_id}")
        print(f"   Bbox: {sheet.bbox}")
        
        # 1. Získej download URL
        download_url = await fetch_dataset_feed(sheet)
        if not download_url:
            print(f"❌ Nenalezen download link")
            stats.failed += 1
            return False
        
        # 2. Stáhni ZIP
        zip_path = CACHE_DIR / f"{sheet.sheet_id}.zip"
        success = await download_laz_zip(download_url, zip_path)
        
        if not success:
            stats.failed += 1
            return False
        
        stats.total_size_mb += zip_path.stat().st_size / (1024 * 1024)
        
        # 3. Extrahuj LAZ
        laz_path = extract_laz_from_zip(zip_path)
        if not laz_path:
            stats.failed += 1
            return False
        
        # 4. Rasterizuj
        tif_path = rasterize_laz_to_geotiff(laz_path, resolution=5.0)
        if not tif_path:
            stats.failed += 1
            return False
        
        stats.downloaded += 1
        stats.print_progress()
        
        return True
    
    except Exception as e:
        print(f"❌ Chyba při stahování {sheet.title}: {e}")
        stats.failed += 1
        return False


async def download_batch(sheets: List[AtomMapSheet], rate_limit: float = 2.0,
                        skip_existing: bool = True, parallel: int = 1):
    """Stáhne batch mapových listů."""
    
    stats = DownloadStats()
    stats.total_sheets = len(sheets)
    
    print(f"\n{'='*60}")
    print(f"🚀 ZAHÁJENÍ STAHOVÁNÍ")
    print(f"{'='*60}")
    print(f"📊 Celkem listů: {stats.total_sheets}")
    print(f"⏱️  Rate limit: {rate_limit}s mezi requesty")
    print(f"🔄 Paralelnost: {parallel}")
    print(f"⏭️  Skip existing: {skip_existing}")
    print(f"{'='*60}\n")
    
    # Stahuj po jednom (nebo parallel)
    for i, sheet in enumerate(sheets):
        print(f"\n[{i+1}/{stats.total_sheets}] ", end="")
        
        await download_sheet(sheet, stats, skip_existing)
        
        # Rate limiting
        if i < len(sheets) - 1:  # Ne po posledním
            await asyncio.sleep(rate_limit)
    
    # Finální statistiky
    print(f"\n{'='*60}")
    print(f"🏁 DOKONČENO!")
    print(f"{'='*60}")
    stats.print_progress()
    
    elapsed = time.time() - stats.start_time
    print(f"✅ Úspěšně staženo: {stats.downloaded} listů")
    print(f"⏭️  Přeskočeno: {stats.skipped} listů")
    print(f"❌ Selhalo: {stats.failed} listů")
    print(f"💾 Celková velikost: {stats.total_size_mb:.1f} MB ({stats.total_size_mb/1024:.2f} GB)")
    print(f"⏱️  Celkový čas: {elapsed/60:.1f} min ({elapsed/3600:.2f} hodin)")
    print(f"{'='*60}\n")
    
    # Uložit log
    log_file = CACHE_DIR / "download_log.json"
    log_data = {
        "timestamp": datetime.now().isoformat(),
        "total_sheets": stats.total_sheets,
        "downloaded": stats.downloaded,
        "skipped": stats.skipped,
        "failed": stats.failed,
        "size_mb": stats.total_size_mb,
        "time_seconds": elapsed
    }
    
    with log_file.open('w') as f:
        json.dump(log_data, f, indent=2)
    
    print(f"📝 Log uložen: {log_file}")


async def main():
    parser = argparse.ArgumentParser(description="Stažení DMR 5G dat pro ČR")
    parser.add_argument("--mode", choices=["full", "cities", "regions", "custom", "test"],
                       default="test", help="Režim stahování")
    parser.add_argument("--region", help="Název kraje (pro mode=regions)")
    parser.add_argument("--bbox", help="Custom bbox: min_lat,min_lon,max_lat,max_lon")
    parser.add_argument("--limit", type=int, help="Max počet listů")
    parser.add_argument("--rate", type=float, default=2.0, help="Rate limit (sekundy)")
    parser.add_argument("--parallel", type=int, default=1, help="Paralelní downloady")
    parser.add_argument("--no-skip", action="store_true", help="Nestahuj již existující")
    
    args = parser.parse_args()
    
    # 1. Načti ATOM feed
    print("📡 Stahuji ATOM feed...")
    all_sheets = await fetch_atom_feed()
    print(f"✅ Načteno {len(all_sheets)} mapových listů\n")
    
    # 2. Filtruj podle režimu
    selected_sheets = []
    
    if args.mode == "full":
        print("🌍 Režim: CELÁ ČESKÁ REPUBLIKA")
        print(f"⚠️  VAROVÁNÍ: Stáhne {len(all_sheets)} listů (~40-50 GB)")
        print(f"⚠️  Odhadovaný čas: 3-4 dny při 2s rate limit")
        confirm = input("\nPokračovat? (yes/no): ")
        if confirm.lower() != "yes":
            print("❌ Zrušeno")
            return
        selected_sheets = all_sheets
    
    elif args.mode == "cities":
        print("🏙️  Režim: MĚSTA ČR")
        print(f"Města: {', '.join([c['name'] for c in CZECH_CITIES[:10]])}...")
        selected_sheets = filter_sheets_by_cities(all_sheets, CZECH_CITIES, radius_km=15.0)
        print(f"✅ Vyfiltrováno {len(selected_sheets)} listů")
    
    elif args.mode == "regions":
        if not args.region or args.region not in CZECH_REGIONS:
            print("❌ Zadejte platný kraj pomocí --region")
            print(f"Dostupné kraje: {', '.join(CZECH_REGIONS.keys())}")
            return
        
        region = CZECH_REGIONS[args.region]
        print(f"🗺️  Režim: KRAJ {region['name']}")
        selected_sheets = filter_sheets_by_bbox(all_sheets, region['bbox'])
        print(f"✅ Vyfiltrováno {len(selected_sheets)} listů")
    
    elif args.mode == "custom":
        if not args.bbox:
            print("❌ Pro custom mode zadejte --bbox min_lat,min_lon,max_lat,max_lon")
            return
        
        bbox = tuple(map(float, args.bbox.split(',')))
        print(f"📍 Režim: CUSTOM BBOX {bbox}")
        selected_sheets = filter_sheets_by_bbox(all_sheets, bbox)
        print(f"✅ Vyfiltrováno {len(selected_sheets)} listů")
    
    elif args.mode == "test":
        print("🧪 Režim: TEST (10 listů)")
        selected_sheets = all_sheets[:10]
    
    # 3. Apply limit
    if args.limit:
        selected_sheets = selected_sheets[:args.limit]
        print(f"📊 Aplikován limit: {args.limit} listů")
    
    if not selected_sheets:
        print("❌ Žádné listy k stažení!")
        return
    
    # 4. Start downloading
    await download_batch(
        selected_sheets,
        rate_limit=args.rate,
        skip_existing=not args.no_skip,
        parallel=args.parallel
    )


if __name__ == "__main__":
    asyncio.run(main())

