# 🔧 Oprava Přepínače DMR 5G ↔ Klasický Hillshade

## 🐛 Problém

Po implementaci GPU terrain shaderu přestal fungovat přepínač mezi:
- **DMR 5G ON** (GPU shader s ATOM daty)
- **DMR 5G OFF** (klasický WMS hillshade)

**Symptom**: Přepínač byl viditelný, ale nic se neměnilo - vždy byl aktivní GPU shader.

---

## ✅ Řešení

Implementace **dvou různých rendering režimů** v `SwipeMap.tsx`:

### 1. DMR 5G ZAPNUTÝ (🟢)
```typescript
// Použij GPU Terrain Shader Layer
const layer = new TerrainShaderLayer({
  id: 'terrain-shader-layer',
  demTileUrl: `${baseUrl}?use_atom=true&format=float32`,
  settings: { sunAzimuth, sunElevation, exaggeration, filters }
});
map.addLayer(layer);
```

**Co to dělá:**
- ✅ Stahuje float32 DEM data z ATOM cache
- ✅ GPU shader počítá hillshade z výškových dat
- ✅ Fungují filtry (svahy, kontury, RGB hillshade)
- ✅ Skutečné metry nad mořem

---

### 2. DMR 5G VYPNUTÝ (⚪)
```typescript
// Použij klasický WMS raster layer
map.addSource('wms-hillshade-layer', {
  type: 'raster',
  tiles: [PROXY_WMS_URL], // WMS hillshade z ČÚZK
  tileSize: 256,
});

map.addLayer({
  id: 'wms-hillshade-layer',
  type: 'raster',
  source: 'wms-hillshade-layer',
  paint: { 'raster-opacity': 0.8 }
});
```

**Co to dělá:**
- ⚪ Stahuje předpočítaný hillshade obrázek z ČÚZK WMS
- ⚪ Klasický raster layer (žádné GPU zpracování)
- ⚪ Rychlé zobrazení bez cache
- ⚪ GPU filtry nejsou dostupné

---

## 📝 Změny v Kódu

### `frontend/src/components/SwipeMap.tsx`

```typescript
// Před opravou (ŠPATNĚ):
useEffect(() => {
  // Vždy používal GPU shader, jen měnil URL
  const tileUrl = useAtomData 
    ? `${baseUrl}?use_atom=true&format=float32`
    : `${baseUrl}?format=float32`;
  
  const layer = new TerrainShaderLayer({ demTileUrl: tileUrl });
  map.addLayer(layer);
}, [useAtomData]);

// Po opravě (SPRÁVNĚ):
useEffect(() => {
  if (useAtomData) {
    // DMR 5G ON → GPU shader
    removeRasterLayer();
    addShaderLayer();
  } else {
    // DMR 5G OFF → WMS raster
    removeShaderLayer();
    addRasterLayer();
  }
}, [useAtomData]);
```

---

## 🎯 Jak To Testovat

### Test 1: DMR 5G Zapnuto
1. Klikněte na `[DMR 5G]` → Zelená barva 🟢
2. Ověřte:
   - ✅ Terén je **hladký a detailní**
   - ✅ GPU filtry fungují (TERRAIN LAB slidery)
   - ✅ DevTools Network: `X-Data-Source: ATOM-Real-DMR5G-*`
   - ✅ Console: `[SwipeMap] GPU Terrain shader layer added`

### Test 2: DMR 5G Vypnuto
1. Klikněte na `[DMR 5G]` → Šedá barva ⚪
2. Ověřte:
   - ⚪ Terén vypadá jako **klasický hillshade**
   - ⚪ GPU filtry **nemají efekt** (očekávané chování)
   - ⚪ DevTools Network: Requesty na `/api/wms-proxy`
   - ⚪ Console: `[SwipeMap] WMS hillshade raster layer added`

### Test 3: Přepínání
1. Přepínejte mezi ON/OFF několikrát
2. Ověřte:
   - ✅ Plynulý přechod mezi režimy
   - ✅ Žádné chyby v Console
   - ✅ Vizuálně odlišné zobrazení

---

## 🔍 Debug

### Pokud přepínač nefunguje:

```javascript
// Otevřete Console (F12) a zadejte:
const map = document.querySelector('canvas').closest('div').__maplibreglMap;
console.log('Layers:', map.getStyle().layers.map(l => l.id));

// Očekávaný výstup:
// DMR 5G ON:  ['...', 'terrain-shader-layer']
// DMR 5G OFF: ['...', 'wms-hillshade-layer']
```

### Pokud vidíte oba layery najednou:
```bash
# Hard reload frontendu
Ctrl+Shift+R

# Případně vyčistěte cache:
Ctrl+Shift+Delete → Cached images
```

---

## 📊 Srovnání Režimů

| Vlastnost | 🟢 DMR 5G ON | ⚪ DMR 5G OFF |
|-----------|--------------|---------------|
| **Zdroj dat** | ATOM cache (LAZ → GeoTIFF) | WMS hillshade |
| **Rendering** | GPU Terrain Shader | Klasický raster |
| **Přesnost** | ±0.18 m (skutečné výšky) | Vizuální aproximace |
| **GPU filtry** | ✅ Fungují | ❌ Nefungují |
| **Rychlost** | Závisí na cache | ✅ Okamžité |
| **Offline** | ✅ Ano (s cache) | ❌ Ne |
| **Velikost dat** | ~3-7 MB/list | ~50 KB/tile |

---

## 🎨 Vizuální Rozdíly

### DMR 5G ON (🟢)
```
┌─────────────────────────┐
│  🏔️ Hladký 3D relief    │
│  ✨ Detailní stíny      │
│  🎨 RGB barevné světlo  │
│  📏 Přesné kontury      │
│  ⚡ GPU filtry aktivní  │
└─────────────────────────┘
```

### DMR 5G OFF (⚪)
```
┌─────────────────────────┐
│  🗺️ Klasický hillshade  │
│  ⬜ Plochý grayscale    │
│  🚫 Žádné GPU filtry    │
│  ⚡ Rychlé načítání     │
│  📡 Přímý WMS stream    │
└─────────────────────────┘
```

---

## 📚 Související Soubory

```
frontend/src/components/SwipeMap.tsx
├── Řádky 195-307: useEffect s přepínáním mezi shader/raster
├── addShaderLayer(): GPU terrain shader
└── addRasterLayer(): WMS hillshade raster

docs/PREPINAC-DMR5G.md
└── Aktualizovaná dokumentace s vysvětlením obou režimů
```

---

## ✅ Checklist Opravy

- [x] Implementovat `addRasterLayer()` pro klasický WMS
- [x] Implementovat `removeRasterLayer()` pro cleanup
- [x] Podmínka `if (useAtomData)` pro přepínání
- [x] Testovat přepínání ON/OFF/ON
- [x] Aktualizovat dokumentaci
- [x] Ověřit, že GPU filtry nefungují v OFF režimu (expected)

---

**Vytvořeno**: 2025-11-25  
**Verze**: 1.0  
**Autor**: Cyber Archeology Team  
**Status**: ✅ Funkční

