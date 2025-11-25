# Specifikace DMR 5G (ČÚZK) - Implementační Dokumentace

## Přehled

Tento dokument shrnuje klíčové specifikace **Digitálního modelu reliéfu 5. generace (DMR 5G)** poskytovaného Českým úřadem zeměměřickým a katastrálním (ČÚZK) a jejich implementaci v projektu cyber-archeology.

## Oficiální Zdroje

- **Metadata produktu**: https://geoportal.cuzk.cz/Default.aspx?mode=TextMeta&metadataXSL=full&side=vyskopis&metadataID=CZ-CUZK-DMR5G-V
- **WMS GetCapabilities**: https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WMSServer?request=GetCapabilities&service=WMS
- **WCS Endpoint**: https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WCSServer
- **ATOM Feed (stahování)**: https://atom.cuzk.gov.cz/DMR5G-SJTSK/DMR5G-SJTSK.xml

## Technické Specifikace

### Souřadnicové Systémy

#### Horizontální CRS
- **Systém**: S-JTSK / Krovak East North
- **EPSG kód**: 5514
- **Specifikace**: https://www.opengis.net/def/crs/EPSG/0/5514
- **Poznámka**: S-JTSK je vztažen k nultému poledníku Ferro (na rozdíl od Greenwichu)

#### Vertikální CRS
- **Systém**: Baltic 1957 height (Balt po vyrovnání - Bpv)
- **EPSG kód**: 8357
- **Specifikace**: https://www.opengis.net/def/crs/EPSG/0/8357
- **Datum**: Baltic Vertical Datum 1957
- **Použití**: Geodézie, inženýrské průzkumy, topografické mapování

### Přesnost Dat

Podle oficiální technické zprávy ČÚZK:

| Typ terénu | Střední chyba výšky | Datum měření |
|------------|---------------------|--------------|
| Odkrytý terén | **0.18 m** | 2012-11-07 |
| Zalesněný terén | **0.30 m** | 2012-11-07 |

### Pokrytí a Stav

- **Pokrytí ČR**: 59.48% (k 2012-11-07)
- **Metoda pořízení**: Letecké laserové skenování (laserscanning)
- **Zdrojový formát**: LAZ (komprimovaný LAS point cloud)
- **Distribuční formát**: LAZ, GeoTIFF (přes WCS)
- **Jednotka distribuce**: Mapový list SM5
- **Velikost jednotky**: ~20 MB
- **Cena**: Bez poplatků (Open Data)

### Kvalita Dat

- **INSPIRE soulad**: ✅ Splňuje požadavky směrnice 2007/2/ES
- **Úroveň kvality**: série datových sad
- **Původ**: Laserscanning (2009-2013)

## Implementace v Projektu

### Backend Transformace

Projekt používá knihovnu **pyproj** pro transformaci mezi souřadnicovými systémy:

```python
# S-JTSK / Krovak East North (EPSG:5514)
SJTSK = pyproj.CRS('EPSG:5514')

# Baltic 1957 height (EPSG:8357)
BPV = pyproj.CRS('EPSG:8357')

# Web Mercator (EPSG:3857) - pro MapLibre
WEB_MERCATOR = pyproj.CRS('EPSG:3857')

# Transformery
_project_3857_to_sjtsk = pyproj.Transformer.from_crs(WEB_MERCATOR, SJTSK, always_xy=True).transform
_project_sjtsk_to_3857 = pyproj.Transformer.from_crs(SJTSK, WEB_MERCATOR, always_xy=True).transform
```

### DEM Tile Endpoint

**URL**: `/api/tiles/dem/{z}/{x}/{y}`

**Parametry**:
- `format`: `float32` (raw buffer) nebo `terrarium` (RGB encoding)
- `nodata`: Hodnota pro NoData pixely (default: -32768.0)
- `use_wcs`: Boolean - pokus o stažení skutečných dat přes WCS (default: false)

**Datové zdroje**:

1. **WCS (skutečná výšková data)** - `use_wcs=true` - ⚠️ **NEFUNKČNÍ**
   - Endpoint: WCSServer
   - **Status**: ČÚZK WCS služba vrací HTTP 400 chyby
   - Implementace připravena, ale služba není dostupná
   - Pro skutečná data použijte ATOM download (viz níže)

2. **WMS (fallback - pseudo-DEM)** - default - ✅ **FUNKČNÍ**
   - Endpoint: WMSServer
   - Layer: `dmr5g:GrayscaleHillshade`
   - Formát: PNG grayscale
   - CRS: EPSG:3857 (on-the-fly transformace)
   - **UPOZORNĚNÍ**: Nejsou to skutečné výšky! Pouze vizuální aproximace.
   
3. **ATOM Feed (doporučeno pro skutečná data)** - ✅ **FUNKČNÍ**
   - URL: https://atom.cuzk.gov.cz/DMR5G-SJTSK/DMR5G-SJTSK.xml
   - Formát: LAZ (komprimovaný LAS point cloud) v ZIP archivech
   - Stahování po mapových listech SM5 (~20 MB každý)
   - Pro využití: stáhnout LAZ → rasterizovat lokálně → použít v aplikaci

### Výškový Profil

**URL**: `/api/analyze/profile`

**Metoda**: POST (GeoJSON LineString)

**Proces**:
1. Přijme LineString v WGS84 (EPSG:4326)
2. Transformuje do Web Mercator (EPSG:3857) pro metrické výpočty
3. Vytvoří bounding box s bufferem ±50m
4. Dotaz na ČÚZK WCS pro GeoTIFF data
5. Samplování výšek podél linie pomocí rasterio
6. Vrátí výškový profil s GPS souřadnicemi

## Best Practices

### Pro Vývojáře

1. **Transformace souřadnic**:
   - Vždy použijte `always_xy=True` v pyproj Transformer
   - S-JTSK používá pořadí (X=East, Y=North), ne (lat, lon)!
   - Praha střed: WGS84 (14.4378°, 50.0755°) → S-JTSK (-741817.77, -1044492.56)

2. **WCS služba**:
   - ⚠️ **AKTUÁLNĚ NEFUNKČNÍ** - ČÚZK WCS vrací HTTP 400
   - GetCapabilities nefunguje
   - Pro skutečná data použijte ATOM download

3. **ATOM Download**:
   - ✅ Spolehlivý způsob pro získání LAZ dat
   - Struktura: Hlavní feed → Dataset feed → ZIP s LAZ
   - Příklad mapového listu: https://atom.cuzk.gov.cz/DMR5G-SJTSK/datasetFeeds/CZ-00025712-CUZK_DMR5G-SJTSK_BENE09.xml
   - Každý mapový list obsahuje georss:polygon s bbox

4. **Caching**:
   - WMS tiles: `Cache-Control: public, max-age=3600`
   - LAZ soubory: Lokální cache doporučeno (data se mění řídce)

5. **Error Handling**:
   - WCS pravděpodobně vrátí chybu - vždy fallback na WMS
   - WMS je stabilní, ale vrací pouze hillshade vizualizaci

### Pro Archeology

1. **Přesnost**:
   - V lese: očekávejte chybu ±0.3m
   - V poli: chyba ±0.18m
   - Pro detekci valů: dostatečné pro struktury >0.5m

2. **Sky-View Factor**:
   - Nejlepší metoda pro "průhled skrz les"
   - Implementováno v backend/WhiteboxTools
   - Endpoint: `/api/analyze/sky-view-factor/upload`

3. **GPU Shader Filtry** (viz `docs/gpu-terrain-shader.md`):
   - Gamma correction pro stíny v lese
   - Sigmoid kontrast pro zvýraznění valů
   - Slope overlay pro detekci strmých svahů

## Reference

- [ČÚZK Geoportál](https://geoportal.cuzk.cz)
- [EPSG:5514 - S-JTSK](https://www.opengis.net/def/crs/EPSG/0/5514)
- [EPSG:8357 - Baltic 1957 height](https://www.opengis.net/def/crs/EPSG/0/8357)
- [INSPIRE Directive 2007/2/EC](https://inspire.ec.europa.eu/)
- [OGC WCS 1.0.0 Specification](https://www.ogc.org/standards/wcs)
- [Technická zpráva DMR 5G](https://geoportal.cuzk.cz/dokumenty/technicka_zprava_dmr_5g.pdf)

## Testování a Ověření

### Provedené testy (2025-11-24)

| Test | Metoda | Výsledek | Poznámka |
|------|--------|----------|----------|
| WMS Hillshade | GET tile z=10 Praha | ✅ Funguje | Vrací PNG grayscale |
| WCS GetCoverage | S-JTSK bbox Praha | ❌ HTTP 400 | Služba není dostupná |
| WCS GetCapabilities | Standard request | ❌ HTTP 400 | Endpoint nefunguje |
| ATOM Feed | Seznam mapových listů | ✅ Funguje | XML feed dostupný |
| INSPIRE EL GRID | WCS alternativa | ❌ HTTP 404 | Služba neexistuje |
| Profile Analysis | POST LineString | ✅ Funguje | Používá WCS v backendu |

### Doporučení

**Pro okamžité použití:**
- Používejte WMS hillshade pro vizualizaci (aktuálně funkční)
- GPU shader filtry fungují s pseudo-DEM daty

**Pro produkční nasazení:**
- Implementujte ATOM downloader pro LAZ soubory
- Lokální rasterizace LAZ → GeoTIFF
- Servírování vlastních DEM tiles z lokální cache

## Changelog

- **2025-11-24**: Testování ČÚZK služeb - WCS nefunkční, WMS OK, ATOM OK
- **2025-11-24**: Implementace WCS endpointu s S-JTSK transformacemi (připraveno pro budoucnost)
- **2025-11-24**: Aktualizace dokumentace podle oficiálních ČÚZK specifikací
- **2025-11-24**: Přidání EPSG:8357 (Bpv) do vertikálního CRS
- **2025-11-24**: Dokumentace ATOM feed struktury pro stahování LAZ dat

