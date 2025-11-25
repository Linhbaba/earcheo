# 🗺️ Kde Jsou Dostupná DMR 5G Data

## ✅ Máte Staženo: **2428 GeoTIFF souborů** (Režim: Města)

---

## 🏙️ Velká Města s Daty

Všechna tato města mají stažená DMR 5G data:

| Město | Souřadnice | Jak Navigovat |
|-------|------------|---------------|
| **Praha** 🏛️ | 50.0755°N, 14.4378°E | Vyhledejte "Praha" v search baru |
| **Brno** 🏰 | 49.1951°N, 16.6068°E | Vyhledejte "Brno" |
| **Ostrava** ⚒️ | 49.8209°N, 18.2625°E | Vyhledejte "Ostrava" |
| **Plzeň** 🍺 | 49.7477°N, 13.3775°E | Vyhledejte "Plzeň" |
| **Liberec** 🏔️ | 50.7663°N, 15.0543°E | Vyhledejte "Liberec" |
| **Olomouc** ⛪ | 49.5938°N, 17.2509°E | Vyhledejte "Olomouc" |
| **Hradec Králové** 🏯 | 50.2093°N, 15.8327°E | Vyhledejte "Hradec Králové" |
| **České Budějovice** 🏛️ | 48.9745°N, 14.4743°E | Vyhledejte "České Budějovice" |
| **Pardubice** 🐎 | 50.0343°N, 15.7812°E | Vyhledejte "Pardubice" |
| **Zlín** 👞 | 49.2265°N, 17.6679°E | Vyhledejte "Zlín" |

---

## 🎯 Jak Vyzkoušet Data

### Krok 1: Navigace na Lokaci

V aplikaci použijte **search bar** nahoře:

```
🔍 [Praha, Praha, Česko        ]
```

**Nebo** přímo zadejte souřadnice do URL:
```
http://localhost:5173/?lat=50.0755&lon=14.4378&zoom=14
```

---

### Krok 2: Zapněte DMR 5G

V dolní liště klikněte na tlačítko:

```
[DMR 5G] ⚪ → klikněte → [DMR 5G] 🟢
```

**Zelená barva** = data se načítají z ATOM cache

---

### Krok 3: Ověření

**Vizuálně:**
- ✅ Terén je **hladký a detailní**
- ✅ Vidíte **stíny a relief**
- ✅ GPU filtry fungují (TERRAIN LAB slidery)

**Technicky (DevTools):**
```javascript
// F12 → Network → Filtr: "dem"
// Měli byste vidět:
X-Data-Source: ATOM-Real-DMR5G-PRAH61  // ✅ Reálná data
```

---

## 🗺️ Doporučené Lokace pro Test

### 1. **Praha - Václavské Náměstí**
```
Souřadnice: 50.0813°N, 14.4268°E
Zoom: 16
Co vidět: Převýšení náměstí (195-215 m n.m.)
```

**Jak se tam dostat:**
1. Vyhledejte "Václavské náměstí, Praha"
2. Zapněte DMR 5G 🟢
3. Použijte SLICER tool pro měření převýšení

---

### 2. **Brno - Špilberk**
```
Souřadnice: 49.1943°N, 16.5989°E
Zoom: 15
Co vidět: Kopec s hradem (280-285 m n.m.)
```

**Jak se tam dostat:**
1. Vyhledejte "Špilberk, Brno"
2. Zapněte DMR 5G 🟢
3. Nastavte SLOPE MIN na 15° pro zvýraznění svahů

---

### 3. **Liberec - Ještěd**
```
Souřadnice: 50.7319°N, 15.0122°E
Zoom: 14
Co vidět: Horský hřeben (1000+ m n.m.)
```

**Jak se tam dostat:**
1. Vyhledejte "Ještěd"
2. Zapněte DMR 5G 🟢
3. Zvyšte VÝŠKOVOU EXAGGERACI na 2.0x

---

## ❓ Proč Někde Data Nevidím?

### Případ 1: Jste Mimo Stažené Oblasti

**Symptom**: DMR 5G je zapnutý 🟢, ale terén vypadá jako klasický hillshade

**Řešení**: 
```bash
# Zkontrolujte, kde přesně jste:
# DevTools → Network → "dem" requesty
# Pokud vidíte: X-Data-Source: WMS-Hillshade
# = Nemáte data pro tuto oblast

# Stáhněte data:
cd backend
./scripts/download_cz.sh test  # Pro testovací oblast kolem
```

---

### Případ 2: DMR 5G Je Vypnutý

**Symptom**: Terén vypadá jako černobílý hillshade

**Řešení**: Klikněte na `[DMR 5G]` → Zelená 🟢

---

### Případ 3: Cache Je Poškozená

**Symptom**: Chybové hlášky v console

**Řešení**:
```bash
cd backend
rm -rf data_cache/dmr5g/geotiff/*.tif
./scripts/download_cz.sh mesta  # Znovu stáhnout
```

---

## 📊 Statistiky Vaší Cache

```
Celkem GeoTIFF: 2428 souborů
Režim: města (--mode cities)
Velikost: ~7 GB
Pokrytí: Všechna velká města ČR
Stav: ✅ Kompletní
```

---

## 🚀 Rozšíření Pokrytí

### Chcete Data Pro Celou ČR?

```bash
cd backend
./scripts/download_cz.sh cela-cr

# ⚠️ Upozornění:
# - 16,301 listů
# - ~50 GB dat
# - 3-4 dny stahování
```

### Chcete Jen Konkrétní Kraj?

```bash
# Praha + Středočeský kraj
./scripts/download_cz.sh kraj praha

# Jihomoravský kraj
./scripts/download_cz.sh kraj jihomoravsky

# Seznam krajů:
./scripts/download_cz.sh help
```

---

## 🧪 Quick Test

**Nejrychlejší způsob, jak ověřit, že vše funguje:**

1. Otevřete aplikaci: `http://localhost:5173`
2. Vyhledejte: **"Praha"**
3. Zapněte: **DMR 5G** 🟢
4. Přibližte na **zoom 16**
5. Měli byste vidět:
   - ✅ Detailní 3D terén
   - ✅ Hladké stíny
   - ✅ Fungující GPU filtry

---

## 📚 Související Dokumentace

- **[PREPINAC-DMR5G.md](./PREPINAC-DMR5G.md)** - Jak používat přepínač
- **[QUICK-START-GUIDE.md](./QUICK-START-GUIDE.md)** - Ovládání aplikace
- **[FIX-TERRAIN-QUALITY.md](./FIX-TERRAIN-QUALITY.md)** - Technické detaily kvality

---

**Vytvořeno**: 2025-11-25  
**Aktualizováno**: Auto-scan cache  
**Cache Status**: ✅ 2428 GeoTIFF souborů

