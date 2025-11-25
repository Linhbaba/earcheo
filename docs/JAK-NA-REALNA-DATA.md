# 🎯 JAK ZOBRAZIT SKUTEČNÁ DMR 5G DATA

## ✅ HOTOVO! Data pro Václavské náměstí jsou připravena!

### 📍 Co se stalo:
- ✅ Staženo: DMR 5G pro Václavské náměstí (Praha střed)
- ✅ Oblast: 50.0813°N, 14.4281°E (PRAH62)
- ✅ Výškový rozsah: 191-280 m n.m.
- ✅ Skutečné metry nad mořem! 🏔️

---

## 🎮 JAK TO ZOBRAZIT V APLIKACI

### Krok 1: Otevři aplikaci
```
http://localhost:5173
```

### Krok 2: Přejdi na Václavské náměstí

**DŮLEŽITÉ:** Použij **SEARCH BOX** (nahoře):
```
┌─────────────────────────┐
│ 🔍 Vyhledat lokaci      │  ← Sem napište
└─────────────────────────┘
```

**Napiště:**
```
Václavské náměstí, Praha
```

**NEBO zadejte přímo souřadnice:**
```
50.0813, 14.4281
```

### Krok 3: Zapni LIDAR režim

**Dole uprostřed** klikněte:
```
[🗺️ Optic] [📡 LIDAR] [🌿 Veg.Index]
           ↑↑↑↑↑↑↑
        TADY KLIKNOUT!
```

### Krok 4: Ověř, že používáš skutečná data

**Vpravo nahoře** by mělo být:
```
┌──────────────────────┐
│ 📡 LIDAR: ONLINE     │
│    (ČÚZK)            │
└──────────────────────┘
```

**Console check** (F12 → Console):
```
[DEM] ✅ Použita ATOM cache: PRAH62.tif
```

---

## 🔍 JAK OVĚŘIT, ŽE TO JSOU SKUTEČNÁ DATA

### Test 1: Nakresli výškový profil

1. **Klikni** `[📏 Profil]` dole
2. **Nakresli linii** přes Václavák (sever → jih)
3. **Podívej se na graf**

**Očekávané výšky:**
```
Horní konec (Muzeum):    ~270m n.m.
Dolní konec (Můstek):    ~220m n.m.
Spád:                    ~50m
```

✅ Pokud vidíte tyto hodnoty = **SKUTEČNÁ DATA!**  
❌ Pokud vidíte 200-200m = stále WMS fallback

### Test 2: Console log

Otevřete Console (F12):
```javascript
// Měli byste vidět:
[DEM] ✅ Použita ATOM cache: PRAH62.tif, výšky: 191.0-279.7m
```

### Test 3: Network tab

F12 → Network → Filtr: "tiles/dem"

Zkontrolujte **Response Headers:**
```
X-Data-Source: ATOM-Real-DMR5G-PRAH62
```

✅ = Skutečná data!

---

## 📊 REÁLNÉ vs PSEUDO DATA

### PŘED (WMS Hillshade):
```
Min: 200.0 m
Max: 200.0 m
Std: 0.0 m
❌ Uniformní - vizuální aproximace
```

### PO (ATOM DMR 5G):
```
Min: 191.1 m
Max: 279.7 m
Std: 22.4 m
✅ Variabilní - SKUTEČNÉ metry!
```

---

## 🗺️ STAŽENÉ OBLASTI

### Aktuálně v cache:

| Mapový list | Oblast | Staženo |
|-------------|--------|---------|
| **PRAH62** | Praha střed (Václavák) | ✅ |
| **PRAH86** | Praha okolí | ✅ |

### Pokrytí mapy:

```
     14.3°E    14.4°E    14.5°E
      │         │         │
50.1°N─┼─────────┼─────────┼─
      │ PRAH86  │         │
50.0°N─┼─────────●─────────┼─  ← Václavské nám.
      │ PRAH62  │         │     (50.0813, 14.4281)
49.9°N─┼─────────┼─────────┼─
      │         │         │
```

---

## 🚀 STÁHNOUT VÍCE OBLASTÍ

### Praha - rozšířené pokrytí:

```bash
# Hradčany
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0904&lon=14.4006"

# Vinohrady
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0764&lon=14.4469"

# Karlín
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0931&lon=14.4508"

# Smíchov
curl -X POST "http://localhost:8000/api/atom/download?lat=50.0708&lon=14.4044"
```

### Jiná města:

```bash
# Brno
curl -X POST "http://localhost:8000/api/atom/download?lat=49.1951&lon=16.6077"

# Olomouc
curl -X POST "http://localhost:8000/api/atom/download?lat=49.5938&lon=17.2509"

# České Budějovice
curl -X POST "http://localhost:8000/api/atom/download?lat=48.9745&lon=14.4744"
```

**⏱️ Každý download: ~7-10 sekund**

---

## 🎨 DOPORUČENÉ NASTAVENÍ PRO VÁCLAVÁK

### GPU Filtry (Terrain Lab):

```
GAMMA:           1.2  ← Prosvětlí městské stíny
HLOUBKA RELIÉFU: 4.0  ← Mírný kontrast
KONTURY:         2m   ← Vrstevnice co 2m
SLOPE OVERLAY:   OFF  ← Město je ploché
```

### Zoom level:

```
Z=15-16  ← Ideální pro Václavák
Z=17-18  ← Detail budov (mírně experimentální)
```

### Split View:

```
VIEW: [═══]  ← Vertikální
```

Levá = Satelit (vidíš budovy)  
Pravá = LIDAR (vidíš terén)

---

## ❓ TROUBLESHOOTING

### "Stále vidím jen 200m"

✅ **Řešení:**
1. Obnovte stránku (Ctrl+F5)
2. Zkontrolujte zoom (musí být 12-18)
3. Zkontrolujte, že jste NA Václaváku (50.08, 14.43)
4. Console → hledejte "ATOM cache"

### "Graf profilu neukazuje správné hodnoty"

✅ **Řešení:**
- Backend endpoint `/api/analyze/profile` používá WCS (který nefunguje)
- Pro profil musíte upravit backend, aby používal ATOM cache
- **TODO:** Implementovat profil přes ATOM

### "Jak vím, že to jsou skutečná data?"

✅ **Testy:**
1. **Variabilita**: Std. dev > 10m
2. **Console**: "ATOM cache: PRAH62"
3. **Headers**: X-Data-Source obsahuje "ATOM"
4. **Vizuálně**: Vidíte detail, ne uniformní šedou

---

## 🎯 SHRNUTÍ - RYCHLÝ CHECKLIST

- ✅ Data stažena? → curl POST download
- ✅ Aplikace otevřená? → localhost:5173
- ✅ Na Václaváku? → 50.0813, 14.4281
- ✅ LIDAR režim? → Klik na [📡 LIDAR]
- ✅ Zoom 15-16? → Kolečkem myši
- ✅ Console OK? → F12, hledej "ATOM"

**Pokud ANO na všechno → MÁTE SKUTEČNÁ DMR 5G DATA! 🎉**

---

## 📞 Další pomoc

Pokud stále vidíte problémy:

1. **Zkontrolujte backend log:**
   ```bash
   tail -f /tmp/backend.log
   ```

2. **Restart backendu:**
   ```bash
   lsof -ti:8000 | xargs -r kill -9
   cd backend && source venv/bin/activate
   python -m uvicorn app.main:app --port 8000
   ```

3. **Seznam cache:**
   ```bash
   curl http://localhost:8000/api/atom/cache/list | jq
   ```

**Enjoy your real DMR 5G data! 🏔️**

