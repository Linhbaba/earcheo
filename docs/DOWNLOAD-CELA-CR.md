# 🌍 Stažení DMR 5G pro celou Českou republiku

## 🎯 Co dostanete

- **16,301 mapových listů** pokrývajících 59.48% ČR
- **Skutečné výškové hodnoty** (metry n.m., Bpv)
- **Přesnost**: 0.18-0.30m
- **Rozlišení**: 5m grid
- **Formát**: GeoTIFF (EPSG:5514)

## 📊 Velikost a čas

| Režim | Listy | Velikost | Čas (2s rate) |
|-------|-------|----------|---------------|
| **Test** | 10 | ~30 MB | 2 min |
| **Města** | ~800 | 2-3 GB | 4-6 hodin |
| **Kraj** | ~500-2000 | 1.5-5 GB | 6-12 hodin |
| **Celá ČR** | 16,301 | 40-50 GB | 3-4 dny |

## 🚀 Rychlý start

### 1️⃣ Jednoduchý způsob (bash skript)

```bash
cd backend/scripts

# TEST - ověření funkčnosti (10 listů)
./download_cz.sh test

# MĚSTA - Praha, Brno, Ostrava, ... (doporučeno)
./download_cz.sh mesta

# KRAJ - konkrétní kraj
./download_cz.sh kraj praha

# CELÁ ČR - všechna data (3-4 dny!)
./download_cz.sh cela-cr

# STATUS - co máte staženo
./download_cz.sh status
```

### 2️⃣ Pokročilý způsob (Python přímo)

```bash
cd backend
source venv/bin/activate

# Test
python scripts/download_czech_republic.py --mode test

# Města s limitem
python scripts/download_czech_republic.py --mode cities --limit 50

# Custom bbox (Praha širší)
python scripts/download_czech_republic.py --mode custom --bbox "49.95,14.25,50.20,14.70"

# Celá ČR s rychlejším rate limitem (POZOR!)
python scripts/download_czech_republic.py --mode full --rate 1.5

# Kraj s paralelním stahováním
python scripts/download_czech_republic.py --mode regions --region jihomoravsky --parallel 2
```

## 🎛️ Parametry

### --mode (režim)

| Režim | Popis |
|-------|-------|
| `test` | 10 listů pro test |
| `cities` | Top 20 měst ČR (15km radius) |
| `regions` | Konkrétní kraj (s --region) |
| `custom` | Vlastní bbox (s --bbox) |
| `full` | **Celá ČR** (vše!) |

### --region (kraje)

```
praha, stredocesky, jihocesky, plzensky, karlovarsky,
ustecky, liberecky, kralovehradecky, pardubicky,
vysocina, jihomoravsky, olomoucky, moravskoslezsky, zlinsky
```

### Další parametry

```bash
--limit N         # Max počet listů (např. --limit 100)
--rate SECS       # Pauza mezi downloady (default: 2s)
--parallel N      # Paralelní downloady (max 4, default: 1)
--no-skip         # Přestáhnout i existující
```

## 📋 Doporučené postupy

### Pro začátečníky:

```bash
# 1. TEST
./download_cz.sh test

# 2. Kontrola
./download_cz.sh status

# 3. MĚSTA (pokud test OK)
./download_cz.sh mesta

# 4. Nechat běžet přes noc
```

### Pro pokročilé:

```bash
# Custom Praha + okolí (větší radius)
python scripts/download_czech_republic.py \
  --mode custom \
  --bbox "49.8,14.0,50.3,14.8"

# Rychlejší stahování (POZOR na rate limit!)
python scripts/download_czech_republic.py \
  --mode cities \
  --rate 1.0 \
  --parallel 2
```

### Pro celou ČR:

```bash
# Spusťte v screen/tmux (aby přežilo odpojení)
screen -S dmr5g

cd backend/scripts
./download_cz.sh cela-cr

# Odpojit: Ctrl+A, D
# Připojit zpět: screen -r dmr5g
```

## 🔍 Monitoring průběhu

### Real-time progress

Skript vypisuje průběžné statistiky:

```
============================================================
📊 PROGRESS: 15.3% (248/1620)
✅ Staženo: 230
⏭️  Přeskočeno: 15
❌ Selhalo: 3
💾 Velikost: 567.2 MB
⏱️  Čas: 45.2 min
⏳ Zbývá: ~250 min (~4.2 hodin)
============================================================
```

### Log file

```bash
# Průběžný log
tail -f backend/data_cache/dmr5g/download_log.json

# Statistiky
cat backend/data_cache/dmr5g/download_log.json | jq
```

### Cache status

```bash
./download_cz.sh status

# Nebo manuálně:
ls -lh backend/data_cache/dmr5g/geotiff/ | wc -l
du -sh backend/data_cache/dmr5g/
```

## ⚠️ Důležité poznámky

### Rate limiting

**ČÚZK servery mají limity!**

- ✅ **Bezpečné**: `--rate 2.0` (2 sekundy, default)
- ⚠️ **Agresivní**: `--rate 1.0` (1 sekunda)
- ❌ **Nebezpečné**: `--rate 0.5` nebo `--parallel 4`

**Doporučení**: Nechte default 2s, budete dobrý soused.

### Resumable

Skript automaticky:
- ✅ Přeskakuje již stažené listy
- ✅ Ukládá progress do logu
- ✅ Můžete kdykoliv přerušit (Ctrl+C) a znovu spustit

### Chyby a retry

Pokud nějaké listy selžou:
```bash
# Zjistit kolik selhalo
grep "failed" backend/data_cache/dmr5g/download_log.json

# Znovu spustit (přeskočí OK, zkusí failed)
./download_cz.sh [mode]
```

### Disk space

**Před spuštěním zkontrolujte místo:**

```bash
df -h .

# Celá ČR potřebuje:
# - ZIP soubory: ~45 GB
# - LAZ soubory: ~40 GB  
# - GeoTIFF: ~10 GB
# CELKEM: ~95 GB (po cleanupu ~10 GB)
```

**Auto-cleanup ZIPů:**
```bash
# Smazat ZIP po extrakci (ušetří ~45 GB)
find backend/data_cache/dmr5g/*.zip -delete

# Smazat LAZ po rasterizaci (ušetří ~40 GB)
find backend/data_cache/dmr5g/laz/*.laz -delete
```

## 🎓 Příklady použití

### Praha kompletní pokrytí

```bash
# Custom bbox pokrývající celou Prahu
python scripts/download_czech_republic.py \
  --mode custom \
  --bbox "49.9,14.2,50.2,14.7"
```

### Archeologické oblasti

```bash
# Středočeský kraj (mnoho hradišť)
./download_cz.sh kraj stredocesky

# Jihomoravský (vinařská krajina, valové systémy)
./download_cz.sh kraj jihomoravsky
```

### Batch processing

```bash
#!/bin/bash
# Stáhnout postupně více krajů

for KRAJ in praha stredocesky jihocesky; do
  echo "Stahuji kraj: $KRAJ"
  ./download_cz.sh kraj $KRAJ
  sleep 300  # 5 min pauza mezi kraji
done
```

## 📈 Výsledek

Po dokončení budete mít:

```
backend/data_cache/dmr5g/
├── CZ-***.zip                # ZIP archivy (můžete smazat)
├── laz/
│   └── *.laz                 # LAZ point clouds (můžete smazat)
└── geotiff/
    └── *.tif                 # 🎯 TOTO POUŽÍVÁ APLIKACE!
```

**GeoTIFF soubory** jsou automaticky používány aplikací!

## ✅ Checklist před spuštěním

- [ ] Backend běží (`uvicorn app.main:app --port 8000`)
- [ ] Dostatek místa (~100 GB pro celou ČR)
- [ ] Stabilní internet připojení
- [ ] Screen/tmux pro dlouhé běhy
- [ ] Test režim funguje (`./download_cz.sh test`)

## 🏆 Po dokončení

```bash
# Zkontrolovat stav
./download_cz.sh status

# Testovat v aplikaci
curl "http://localhost:8000/api/atom/cache/list"

# Otevřít aplikaci
open http://localhost:5173
```

**Data jsou automaticky dostupná v aplikaci! 🎉**

---

## 💡 Pro optimalizaci

### Cleanup po stažení

```bash
# Smazat ZIP a LAZ, nechat pouze GeoTIFF
cd backend/data_cache/dmr5g

# Smazat ZIPy (~45 GB)
rm -f *.zip

# Smazat LAZ (~40 GB)
rm -rf laz/

# Výsledek: ~10 GB GeoTIFF
du -sh geotiff/
```

### Komprese cache

```bash
# Archivovat cache pro zálohu
cd backend/data_cache
tar -czf dmr5g_backup_$(date +%Y%m%d).tar.gz dmr5g/geotiff/

# Velikost ~3-4 GB komprimováno
```

### CDN deployment

Pro produkci:
1. Upload GeoTIFF na S3/CloudFlare
2. Změňte backend aby četl z CDN
3. Cache-Control: max-age=31536000 (1 rok)

---

**Hodně štěstí s archeologickými objevy! 🏺**

