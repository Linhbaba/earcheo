# Mapové Analytics (GA4)

Dokumentace implementace trackování uživatelských interakcí s mapou v Google Analytics 4.

## Přehled

Implementace využívá přímé volání `window.gtag()` pro odesílání eventů do GA4. Všechny eventy jsou automaticky trackované při uživatelských akcích.

## Trackované eventy

### 1. `map_click` - Kliknutí do mapy

Odešle se při každém kliknutí do mapy.

| Parametr | Typ | Popis |
|----------|-----|-------|
| `lng` | number | Zeměpisná délka (6 des. míst) |
| `lat` | number | Zeměpisná šířka (6 des. míst) |
| `zoom` | number | Úroveň přiblížení |
| `bearing` | number | Rotace mapy (stupně) |
| `pitch` | number | Sklon mapy (stupně) |

### 2. `layer_click` - Kliknutí na vrstvu/marker

Odešle se při kliknutí na interaktivní vrstvu nebo marker.

| Parametr | Typ | Popis |
|----------|-----|-------|
| `layer` | string | Název vrstvy (`sectors-fill`, `tracks-lines`, `findings`) |
| `feature_id` | string/number | ID prvku (pokud existuje) |
| `name` | string | Název prvku (max 100 znaků) |
| `type` | string | Typ prvku (max 50 znaků) |

### 3. `map_zoom_start` - Začátek zoomování

| Parametr | Typ | Popis |
|----------|-----|-------|
| `zoom` | number | Počáteční zoom level |
| `lng` | number | Střed mapy - délka |
| `lat` | number | Střed mapy - šířka |

### 4. `map_zoom_end` - Konec zoomování

| Parametr | Typ | Popis |
|----------|-----|-------|
| `zoom` | number | Konečný zoom level |
| `lng` | number | Střed mapy - délka |
| `lat` | number | Střed mapy - šířka |

### 5. `map_move` - Posun mapy (panning)

Throttled event - max 1× za 2 sekundy. Neposílá se během zoomování.

| Parametr | Typ | Popis |
|----------|-----|-------|
| `zoom` | number | Aktuální zoom |
| `center_lng` | number | Střed mapy - délka |
| `center_lat` | number | Střed mapy - šířka |

### 6. `layer_toggle` - Zapnutí/vypnutí vrstvy

| Parametr | Typ | Popis |
|----------|-----|-------|
| `layer` | string | Název vrstvy (`katastr`, `vrstevnice`, `place_names`, `sectors`, `gps`) |
| `state` | string | `on` nebo `off` |

## Soubory

```
frontend/src/
├── hooks/
│   └── useMapAnalytics.ts    # Hook a utility funkce pro tracking
├── types/
│   └── gtag.d.ts             # TypeScript deklarace pro window.gtag
├── components/
│   └── SwipeMap.tsx          # Hlavní mapová komponenta s integrovaným trackingem
└── pages/
    └── MapPage.tsx           # Stránka mapy s layer toggle trackingem
```

## Použití

### Automatický tracking (již integrován)

Tracking je automaticky aktivní v `SwipeMap.tsx`:
- Kliky do mapy
- Zoom start/end
- Posun mapy (throttled)
- Kliky na sektory a tracky
- Kliky na finding markery

### Manuální tracking vrstev

```typescript
import { trackLayerToggle } from '../hooks/useMapAnalytics';

// V toggle handleru
const handleToggleKatastr = () => {
  const newState = !isKatastrActive;
  setIsKatastrActive(newState);
  trackLayerToggle('katastr', newState);
};
```

### Použití hooku (alternativa)

```typescript
import { useLayerToggleTracking } from '../hooks/useMapAnalytics';

const MyComponent = () => {
  const { trackLayerToggle } = useLayerToggleTracking();
  
  const handleToggle = (layer: string, isActive: boolean) => {
    // ... toggle logic
    trackLayerToggle(layer, isActive);
  };
};
```

## Validace v GA4

1. Otevřete GA4 → **DebugView**
2. Zapněte debug mode v prohlížeči:
   ```javascript
   // V konzoli prohlížeče
   localStorage.setItem('debug_mode', 'true');
   ```
3. Nebo použijte Chrome extension **GA Debugger**
4. Proveďte interakce s mapou
5. Ověřte, že eventy přicházejí s korektními parametry

### Debug logy v development

V development režimu (`import.meta.env.DEV`) se všechny GA eventy logují do konzole:

```
[GA4] map_click {lng: 15.123456, lat: 49.123456, zoom: 12, ...}
[GA4] layer_toggle {layer: "katastr", state: "on"}
```

## Rozšíření

### Přidání nové interaktivní vrstvy

V `SwipeMap.tsx` přidejte název vrstvy do pole:

```typescript
const interactiveLayers = ['sectors-fill', 'tracks-lines', 'nova-vrstva'];
```

### Přidání nového toggle

1. Vytvořte handler v `MapPage.tsx`:
```typescript
const handleToggleNovaVrstva = useCallback(() => {
  const newState = !isNovaVrstvaActive;
  setIsNovaVrstvaActive(newState);
  trackLayerToggle('nova_vrstva', newState);
}, [isNovaVrstvaActive]);
```

2. Použijte handler v UI komponentě

### Vlastní event

```typescript
// Přímé volání
window.gtag?.('event', 'custom_event', {
  param1: 'value1',
  param2: 123,
});
```

## Omezení

- **Throttling pohybu**: `map_move` se odesílá max 1× za 2 sekundy
- **Bez zoomování**: `map_move` se neposílá během aktivního zoomování
- **Velikost parametrů**: `name` max 100 znaků, `type` max 50 znaků
- **Pouze user actions**: Eventy se neodesílají při programatických změnách (render, load setupu)

## GA4 Measurement ID

Aktuální Measurement ID: `G-RYL5BQZZTS`

Definováno v: `frontend/index.html`

