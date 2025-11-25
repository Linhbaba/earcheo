# GPU LiDAR Shader – vizualizační filtry

Technický předávací dokument pro novou WebGL vrstvu, která běží přímo v MapLibre (CustomLayerInterface) a vykresluje hillshade/DEM data s real‑time filtry. Shader pracuje nad float32 výškovými tily (DEM/DTM), renderuje v screen-space bez rozmazání (textury bindovat s `GL_NEAREST` nebo kvalitní bicubickou filtrací) a musí zůstat čistě klientský.

## Cíle
- Prosvětlit hluboké stíny a zachovat detail v údolích (gamma).
- Zvýraznit střední tóny reliéfu bez přepalu (sigmoid).
- Opticky zostřit hrany valu/cest (unsharp).
- Zobrazit strmé stěny jako overlay v rozsahu úhlů (slope threshold).
- Nabídnout volitelný RGB hillshade (3 směry světla).
- Přidat mikro-vrstevnice s dynamickým krokem 0.2–5 m.

## Datový tok
1. **Tile fetch** – backend/ČÚZK poskytne DEM jako 256² float32 RGBA (výška v metrech v `r32f` nebo `rgba8 + scale`). Vrstva drží dva textury: výšku a hillshade/aux data (volitelné).
2. **Custom layer** – MapLibre `custom` layer (`onAdd`, `render`). Do shaderu posíláme transformace mapy (Mercator → clip space), velikost tilu, pixel pitch v metrech a všechny UI uniformy.
3. **Fragment shader** – pro každý pixel:
   - Sampluje výšku plus okolní sousedy (centrální diference).
   - Počítá normálový vektor, základní hillshade a doplňkové efekty.
   - Mísí overlaye (slope, contour) do výsledné barvy.

## Uniformy a UI vazba

| Uniform | UI název | Rozsah / default | Poznámka |
| --- | --- | --- | --- |
| `sampler2D u_demTexture` | DEM tile | – | musíme bindovat s `gl.NEAREST` |
| `mat4 u_matrix` | Map transform | – | `matrix = transform * mercatorMatrix` |
| `vec2 u_tileSize` | velikost tilu | 256,256 | použito pro derivace |
| `float u_pixelSizeMeters` | odvozeno z zoomu | – | `resolutionAtLatitude` |
| `float u_exaggeration` | „Vertical exaggeration“ | 0.5–5 (1.5) | násobí gradient |
| `float u_sun_azimuth` | virtuální slunce | 0–360° (315) | používat radiany uvnitř |
| `float u_sun_elevation` | | 5–80° (45) | |
| `float u_contrast_sigmoid` | „Hloubka reliéfu“ | 0–10 (0 = vyp) | `k` ve sigmoid |
| `float u_gamma` | „Prosvětlení stínů“ | 0.5–2.5 (1) | expo. korekce |
| `float u_unsharp_strength` | „Ostrost“ | 0–1 (0) | 0 = off, 1 = 100 % |
| `vec2 u_slope_range` | „Detektor zdí“ | např. 35–90° | deg, min ≤ max |
| `vec4 u_overlay_color` | barva zdí | RGBA | default červená 50 % |
| `bool u_rgb_hillshade_enabled` | „Všesměrové světlo“ | checkbox | přepíná RGB režim |
| `float u_contour_step` | „Hustota vrstevnic“ | 0.2–5 m (0 = off) | interval v metrech |
| `float u_contour_thickness` | – | 0.05 | frakce tloušťky linky |
| `float u_contour_opacity` | – | 0.3–0.6 | mix do výsledku |

UI doplníme ve `CommandDeck` jako samostatný panel „Terrain Lab“ (slidery + checkbox). Hodnoty posílat do shaderu přes React state → MapLibre layer `setPaintProperty` nelze, proto přes `customLayer.program` uniformy.

## Pořadí výpočtů ve fragment shaderu
1. **Sampling** – načti `zCenter` + 4 sousedy (±x, ±y) jedním `texture(u_demTexture, uv + offset)`.
2. **Gradient** – `dZdx = (zRight - zLeft) / (2 * pixelSizeMeters)` (násob `u_exaggeration`), obdobně pro `dZdy`.
3. **Normal & slope** – `vec3 n = normalize(vec3(-dZdx, -dZdy, 1.0));`, `slope_rad = atan(length(dZ), 1.0)`.
4. **Hillshade intensity** – světlo ze slideru (`dir = spherical(u_sun_azimuth, u_sun_elevation)`), `shade = clamp(dot(n, dir), 0.0, 1.0)`.
5. **Sigmoid kontrast** – pokud `u_contrast_sigmoid > 0`: `shade = mix(shade, sigmoid(shade), weight)`; weight = `smoothstep(0.0, 10.0, u_contrast_sigmoid)`.
6. **Gamma** – `shade = pow(shade, 1.0 / u_gamma)`.
7. **Unsharp** – spočítej blur (průměr 4 orth sousedů). `high = shade - blur`. `shade += high * u_unsharp_strength`.
8. **RGB hillshade** – pokud povoleno, přepočti `shadeRGB` pro tři směry (315°, 225°, 90°) a výsledek ulož do `baseColor = vec3(red, green, blue)`. Jinak `baseColor = vec3(shade)`.
9. **Slope threshold overlay** – vypočti `slope_deg`. Pokud v rozsahu, `baseColor = mix(baseColor, u_overlay_color.rgb, u_overlay_color.a)`.
10. **Dynamic contours** – if `u_contour_step > 0`: `line = step(1.0 - u_contour_thickness, fract((zCenter - zOffset) / u_contour_step))`, `baseColor = mix(baseColor, vec3(0.0), line * u_contour_opacity)`.
11. **Výstup** – `gl_FragColor = vec4(baseColor, 1.0);`.

## Filtry detailně

### Gamma Correction (Prosvětlení stínů)
- Slider 0.5–2.5 (default 1).
- Shader: `shade = pow(max(shade, 1e-4), 1.0 / u_gamma);`.
- Vyšší gamma (>1) vyrovná tmavé oblasti bez saturace highlightů.

### Sigmoid Contrast (Archeologický kontrast)
- UI „Hloubka reliéfu“ 0–10 (0 = off).
- Funkce: `sigmoid(x) = 1 / (1 + exp(-k * (x - 0.5)))`.
- V shaderu udržet numerickou stabilitu: clamp `k` na 12, aby se vyhnulo overflow.
- Umožňuje zvýraznit terénní mikrostruktury (střední šedé).

### Unsharp Mask (Ostrost)
- Použij jednoduchý Laplacian: `lap = sum(neighbours) - 4 * center`.
- Konverze: `high = center - blur` (blur = průměr sousedů).
- Nová intenzita: `center + high * u_unsharp_strength`.
- Při `strength = 1` zhruba +100 % detail; doporučeno clampnout do 0–1.

### Slope Threshold Overlay (Detektor zdí)
- Gradient z derivací výšky; úhel `slope_deg = degrees(atan(sqrt(dZx² + dZy²)))`.
- Porovnání s `u_slope_range`. Pokud uvnitř, míchej červenou (`u_overlay_color`).
- Overlay aplikuj až po RGB/sigmoid, aby barva byla čitelná.

### RGB Hillshade (Multidirekční)
- Předpočti tři normálové dot produkty s pevnými směry:
  - `dirR = azimuth 315°, elev 45°`
  - `dirG = 225°, elev 45°`
  - `dirB = 90°, elev 45°`
- Barvy: `vec3(red, green, blue)` (každý dot clamp 0..1). Pokud slider vypnutý, vrať grayscale.
- UI: checkbox „Všesměrové světlo“.

### Dynamic Contours (Mikro-vrstevnice)
- `interval = max(u_contour_step, 0.01)` (metre). Elevaci drž v absolutních metrech.
- `float normalized = fract((elevationMeters * 0.01) / interval);` (případně offset na snížení blikání).
- `line = 1.0 - step(1.0 - thickness, normalized);`.
- Mix s černou barvou podle `u_contour_opacity`. Pro jemnější výsledek lze použít `smoothstep` místo `step`.

## Integrace do MapLibre
1. **Source** – přidej `map.addSource('dem-float', { type: 'raster-dem', tiles: [backendURL], encoding: 'mapbox-terrain-rgb' nebo custom `tiles: [".../{z}/{x}/{y}.png?fmt=fp32"]` }. Pokud backend vrací čistý float32, použij `type: 'raster'` + `tileSize: 256`.
2. **Custom layer** – vytvoř objekt `const terrainShaderLayer: maplibregl.CustomLayerInterface` s `id`, `type: 'custom'`, `renderingMode: '2d'`.
3. **onAdd** – inicializuj program (vertex + fragment). Vertex shader transformuje `vec2 position` do clip space pomocí `u_matrix`. Buffer = fullscreen quad.
4. **render** – binduj program, aktualizuj uniformy každý frame (`gl.uniform1f/2f`, `gl.uniformMatrix4fv`). Texturu načti z `map.getSource('dem-float').texture` (přes `regl` nebo přímý WebGL hook). Zapni `gl.disable(gl.DEPTH_TEST)` a `gl.blendFuncSeparate(GL_ONE, GL_ZERO, GL_ONE, GL_ZERO)` pro čistý override.
5. **Lifecycle** – `map.addLayer(terrainShaderLayer, 'satellite-layer')` pro overlay nad base mapou. Při změně slideru zavolej `map.triggerRepaint()` a přepočti uniformy.
6. **Interpolace** – `gl.texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, GL_NEAREST)` + stejný pro `MAG` (nebo bicubic shader fallback).

## Výkon & best practices
- Jeden pass, žádná více-násobná textura. Derivace počítej z lokálního okolí (4–8 samplů). Cíl < 10 texture fetch per fragment.
- Při vysokém zoomu limituj `u_unsharp_strength` (např. `* smoothstep(0.0, 15.0, zoom)`), aby se nezesilnil šum.
- Clampuj výsledek `[0,1]` průběžně, aby se předešlo NaN.
- Dbej na `mediump` vs `highp`. Pro mobilní Safari vyžaduj `precision highp float;`.
- Pokud se nepodaří získat float32 texturu (kvůli iOS), fallback na Terrarium encoding: `elev = (r*256 + g + b/256) - 32768`.

## Testovací checklist
- [ ] Porovnat grayscale hillshade vs MapLibre default (vizuálně shodné při všech slidech = default).
- [ ] Gamma slider 0.5–2.5 plynule modifikuje tmavé údolí bez saturace highlightů.
- [ ] Sigmoid `k=10` zvýrazní hranu valu bez posterizace.
- [ ] Unsharp 100 % nezpůsobí ringing na plochách.
- [ ] Slope overlay reaguje jen na zadané úhly; test 30–40° na svazích.
- [ ] RGB hillshade barví svahy dle světových stran (S=červená, J=zel.).
- [ ] Dynamic contours 0.2 m kreslí souvislé čáry bez blikání při panoramování.
- [ ] Výkon: 60 fps na moderním laptopu při 4K zobrazení.

Tento dokument je závazný pro implementaci nové vrstvy. Následující sprint: doplnit UI (CommandDeck) a napojit slider hodnoty na uniformy, přidat backend endpoint pro float32 DEM tily, a napsat unit/integration testy pro shader parametry (vizual. regression screenshots).

