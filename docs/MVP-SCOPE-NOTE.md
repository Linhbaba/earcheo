# MVP Scope Note – Cyber Archeology

## 1. Co se již podařilo

- **DMR 5G integrace (backend)** – kompletní pipeline pro stahování LAZ (ATOM feed), rasterizaci do GeoTIFF a servis přes `/api/tiles/dem`. Cache aktuálně obsahuje ~2 400 listů velkých měst.
- **WMS fallback** – stabilní proxy na ČÚZK WMS (`GrayscaleHillshade`) s konverzí na pseudo-DEM, retry a logováním.
- **Stahovací skripty** – `scripts/download_cz.sh` + `download_czech_republic.py` pokrývají režimy test/města/kraje/celá ČR, s throttlingem a checkpointingem.
- **Frontend** – MapLibre split-view, LiDAR/Optic/NDVI módy, vyhledávání, výškový profil, kreslení řezu, mesh overlay, kompas a mapové styly.
- **Dokumentace** – vznikly manuály (`PREPINAC-DMR5G.md`, `JAK-NA-REALNA-DATA.md`, `FIX-*`) popisující celou integraci.

## 2. Co jsme dočasně vypnuli pro MVP

| Funkce | Stav | Důvod |
|--------|------|-------|
| Reálná DMR 5G data (ATOM) | ❌ deaktivováno v UI | Doposud fungovalo jen se stabilní cache + GPU shaderem, což brzdilo MVP harmonogram.
| DMR 5G přepínač & Terrain Lab | ❌ odstraněno | V kombinaci s pseudo-daty přinášelo nekonzistentní UX.
| Custom GPU Terrain Shader | ❌ odstraněno | Náročné na údržbu (OES texture float, retry mechaniky). Pro MVP používáme osvědčené WMS hillshade vrstvy.

> Backend logika (ATOM tile endpointy) **zůstává zachována** – lze ji znovu aktivovat, až připravíme stabilnější UI/UX.

## 3. Aktuální MVP Scope

- LiDAR mód = **ČÚZK WMS hillshade** renderovaný přímo MapLibre layerem.
- Optic + NDVI módy zůstávají (MapLibre styly + vizuální překryvy).
- Zachované nástroje: split-view, profil (SLICER), flashlight, mesh overlay, kompas a výběr mapových stylů.
- Dokumentace upravena tak, aby jasně oddělila MVP vs. roadmap features.

## 4. Roadmapa po MVP

1. **Reaktivovat DMR 5G data** – vylepšit cache management, progress UI a monitoring.
2. **V2 GPU shader** – doplnit fallbacky, sjednotit tile loader a přidat testy kvality.
3. **Download manager v UI** – spouštění skriptů přímo z aplikace, fronta úloh, logy.
4. **Historické mapy** – znovu zapojit II. vojenské mapování s plynulou průhledností.
5. **Export/reporting** – PDF snapshoty, export profilů a anotací.

## 5. Doporučení

- **Backend** – ponechat připravené endpoints; později doplnit unit testy reprojekce + Terrarium encoding.
- **Frontend** – archivovat GPU shader větev, aby šlo na ni navázat po MVP.
- **Komunikace** – v README jasně psát, že MVP stojí na WMS hillshade; reálná data jsou v roadmapě.

---
*25. 11. 2025 – stav před odevzdáním MVP bez reálných DMR 5G dat a bez GPU Terrain Labu.*
