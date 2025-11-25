# 🎮 Rychlý průvodce ovládáním Cyber Archeology

## 📍 Kde jsou ovládací prvky?

### 🎛️ HLAVNÍ COMMAND DECK (dole uprostřed)

```
┌─────────────────────────────────────────────┐
│  [Optic] [LIDAR] [Veg. Index]              │  ← Režimy
│  ────────────────────────────────────────   │
│  [SLICER] [LIGHT] [MESH] [další nástroje]  │  ← Nástroje
│  ────────────────────────────────────────   │
│  TERRAIN LAB - Slidery pro filtry          │  ← GPU filtry
└─────────────────────────────────────────────┘
```

### 🗺️ MAP LAYERS (vpravo nahoře)

```
┌──────────────┐
│ MAPY LAYERS  │
├──────────────┤
│ ⊕ Satelitní  │ ← Aktivní
│ 🌙 Tmavá     │
│ 🗺️ Klasická  │
└──────────────┘
```

### 🧭 KOMPAS (vpravo uprostřed)

```
┌──────────────┐
│   KOMPAS     │
│   🧭 N       │
│  HEADING     │
│     0°       │
│ [-15°][+15°] │ ← Otočit
│ [SEVERNÍ     │
│  REFERENCE]  │ ← Reset
└──────────────┘
```

### 📏 Z-SCALE (vpravo dole)

```
┌──────┐
│ 1.5x │ ← Vertikální nadsazení
└──────┘
```

## 🎯 Jak ovládat

### 1️⃣ POHYB PO MAPĚ

**Myš:**
- **Tažení levým tlačítkem** = Posun mapy
- **Kolečko myši** = Zoom in/out
- **Pravé tlačítko + tažení** = Rotace mapy (3D)

**Klávesnice:**
- **Šipky** = Posun
- **+/-** = Zoom
- **Ctrl + šipky** = Rotace

### 2️⃣ ZMĚNA REŽIMU

V **Command Deck** (dole uprostřed) klikněte:

```
[🗺️ Optic]     ← Satelitní snímky
[📡 LIDAR]     ← DMR 5G hillshade (TY CHCEŠ TOHLE!)
[🌿 Veg.Index] ← NDVI spektrální analýza
```

### 3️⃣ SPLIT VIEW (porovnání)

V Command Deck:

```
VIEW: [═══] [☰] [⤢]
       │     │    └─ Fullscreen
       │     └────── Horizontální split
       └──────────── Vertikální split (aktivní)
```

**Klikněte na ikonu pro změnu režimu:**
- `[═══]` = Vertikální rozdělení (levá/pravá)
- `[☰]` = Horizontální rozdělení (horní/dolní)
- `[⤢]` = Bez rozdělení (celá obrazovka)

**Tažení slideru:**
- Bílý slider uprostřed = táhněte pro změnu poměru

### 4️⃣ NÁSTROJE (dole v Command Deck)

```
[⚡ SLICER]    ← Split view režim
[☀️ LIGHT]     ← Sluneční pozice (azimut/elevace)
[#️⃣ MESH]      ← Mesh režim (mřížka bodů)
[📏 Profil]    ← Výškový profil (nakresli linii)
[📜 History]   ← Historické mapy (1840)
[💡 Flashlight]← Spotlight efekt
```

**Jak používat:**
1. **Klikněte na tlačítko** (zmodrá)
2. **Nástroj je aktivní**
3. **Klikněte znovu** pro vypnutí

### 5️⃣ TERRAIN LAB (GPU filtry)

Když otevřete **TERRAIN LAB** panel (dole):

```
GAMMA           [────●────] 1.0   ← Prosvětlení stínů
OSTROST         [●────────] 0%    ← Zostření
HLOUBKA RELIÉFU [────●────] 5.3   ← Sigmoid kontrast
KONTURY (M)     [────●────] 1.0   ← Vrstevnice krok
KONTURY OPACITY [────●────] 0.05  ← Průhlednost
SLOPE MIN (°)   [──────●──] 35°   ← Min úhel svahu
SLOPE MAX (°)   [────────●] 90°   ← Max úhel svahu

[○] VŠESMĚROVÉ SVĚTLO           ← RGB hillshade
```

**Slidery:**
- **Táhněte kuličkou** pro změnu hodnoty
- **Klikněte na pruh** pro skok
- **Efekt je REAL-TIME!**

### 6️⃣ SLUNEČNÍ POZIICE (☀️ LIGHT)

1. **Klikněte [☀️ LIGHT]** v Command Deck
2. **Objeví se SunDial** (kruhový ovladač)
3. **Táhněte kuličkou** kolem kruhu
4. **Stíny se mění v real-time!**

```
       N (0°)
        │
    W ──┼── E
        │
       S (180°)
```

**Nebo použijte Compass:**
- `[-15°]` = Posun o 15° doleva
- `[+15°]` = Posun o 15° doprava

### 7️⃣ VÝŠKOVÝ PROFIL

1. **Klikněte [📏 Profil]**
2. **Nakreslete linii na mapě:**
   - Klik = První bod
   - Klik = Druhý bod
   - ... další body
   - Double-click = Dokončit
3. **Objeví se graf** s výškovým profilem
4. **Hover nad grafem** = Označí bod na mapě

**Zavření:**
- Křížek v rohu grafu
- Nebo klikněte [📏 Profil] znovu

### 8️⃣ ZMĚNA PODKLADOVÉ MAPY

**Vpravo nahoře** - MAP LAYERS panel:

```
┌─────────────────┐
│ [⊕] Satelitní   │ ← Klikněte pro změnu
│ [🌙] Tmavá      │
│ [🗺️] Klasická   │
└─────────────────┘
```

## 🎨 LIDAR MODE - Hlavní funkce

### Co vidíte v LIDAR režimu?

```
╔════════════════════════════════════╗
║  LEVÁ STRANA (Optic):              ║
║  • Satelitní snímky                ║
║  • Skutečné barvy                  ║
║  • Vidíte budovy, lesy, pole       ║
╠════════════════════════════════════╣
║  PRAVÁ STRANA (LIDAR):             ║
║  • DMR 5G hillshade                ║
║  • Stínovaný reliéf                ║
║  • Vidíte valy, příkopy, cesty     ║
║  • GPU filtry aktivní!             ║
╚════════════════════════════════════╝
```

### Doporučené nastavení pro archeologii:

```
REŽIM: LIDAR
GAMMA: 1.2-1.5        (prosvětlí stíny v lese)
HLOUBKA RELIÉFU: 5-8  (zvýrazní valy)
SLOPE: 30°-60°        (detekuje zdi/svahy)
MESH: OFF             (nebo ON pro "wireframe" efekt)
```

## 🔍 Tipy a triky

### Rychlé klávesy:

| Klávesa | Akce |
|---------|------|
| `Space` | Přepnout split mode |
| `L` | Přepnout na LIDAR |
| `O` | Přepnout na Optic |
| `N` | Přepnout na NDVI |
| `P` | Aktivovat profil |
| `M` | Mesh mode toggle |
| `Esc` | Zrušit aktivní nástroj |

*(Poznámka: Pokud klávesy nefungují, je možné že nejsou ještě implementované)*

### Optimální zoom level:

- **Z = 12-14**: Přehled oblasti (kilometry)
- **Z = 15-17**: Detail terénních struktur (stovky metrů)
- **Z = 18-19**: Detailní skenování (desítky metrů)

### Pro nejlepší výsledky:

1. **Zapněte LIDAR režim**
2. **Nastavte split view** (vertikální)
3. **Zvyšte Gamma** na ~1.3 (prosvětlí lesy)
4. **Přidejte kontrast** (Hloubka reliéfu ~6)
5. **Zoomněte na podezřelé místo**
6. **Nakreslete profil** přes strukturu

## ❓ Nejčastější problémy

### "Nic se neděje když klikám na tlačítka"

✅ **Řešení:**
- Kontrola: Je Command Deck vidět? (dole uprostřed)
- Zkuste obnovit stránku (F5)
- Zkuste jiný prohlížeč (Chrome/Firefox)

### "Nevidím LIDAR data"

✅ **Řešení:**
- Klikněte na `[📡 LIDAR]` tlačítko
- Počkejte 2-3 sekundy na načtení
- Badge vpravo nahoře by měl říct "LIDAR: ONLINE"

### "Slidery nereagují"

✅ **Řešení:**
- TERRAIN LAB panel musí být otevřený
- Zkuste kliknout přímo na slider
- Refresh stránky

### "Mapa je černá/prázdná"

✅ **Řešení:**
- Backend neběží → Spusťte: `uvicorn app.main:app --port 8000`
- Proxy neběží → Spusťte: `node backend/index.js`
- Zkontrolujte Console (F12) pro chyby

## 🎓 Video návody

*(Poznámka: Vytvořte video screencapture pro tyto úkony)*

1. ✅ Základní pohyb a zoom
2. ✅ Přepínání režimů
3. ✅ Kreslení výškového profilu
4. ✅ Nastavení GPU filtrů
5. ✅ Změna sluneční pozice

---

**TIP:** Začněte s **Praha, zoom 14** a vyzkoušejte všechny nástroje tam. Pak se přesuňte na své oblíbené archeologické lokality! 🏺

