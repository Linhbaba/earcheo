# UI Design Plan - Profil, Vybavení & Nálezy

**Designová konzistence s existující mapovou aplikací**

**Status:** 🟢 **V PRODUKCI** - Fáze 2 (Findings) dokončena | **BETA v1.2** | [earcheo.cz](https://earcheo.cz)

**Poslední aktualizace:** 27. listopadu 2024

---

## 📋 QUICK STATUS

| Komponenta | Status | Poznámka |
|-----------|--------|----------|
| **AuthHeader** | ✅ Hotovo | User menu + search + navigation |
| **FindingsModal** | ✅ Hotovo | Center overlay, dynamic categories |
| **FindingCard** | ✅ Hotovo | Grid layout, thumbnails |
| **FindingForm** | ✅ Hotovo | Create/Edit s rozšířenými poli |
| **FindingDetail** | ✅ Hotovo | Full detail view, z-60 layer |
| **PhotoGallery** | ✅ Hotovo | Lightbox + delete |
| **ImageUploader** | ✅ Hotovo | Drag & drop |
| **LocationPicker** | ✅ Hotovo | Interaktivní mapa |
| **TagInput** | ✅ Hotovo | Multi-tag kategorie |
| **Shared Components** | ✅ Hotovo | BaseCard, StatusBadge, etc. |
| **Map Integration** | ✅ Hotovo | Findings jako markers na mapě (SwipeMap) |
| **EquipmentModal** | ✅ Hotovo | Modal + CRUD operations |
| **EquipmentCard** | ✅ Hotovo | Grid cards s usage stats |
| **EquipmentForm** | ✅ Hotovo | Add/Edit form |
| **useEquipment hook** | ✅ Hotovo | API integrace |
| **ProfileModal** | ✅ Hotovo | Modal s editací + stats |

---

## 🎨 DESIGN SYSTEM ANALÝZA

### Vaše současné UI má:

**Barvy:**
```
background:      #050b14  (Deep Space Grey)
primary:         #00f3ff  (Neon Cyan - aktivní prvky)
alert:           #ffae00  (Amber - výstrahy/detekce)
surface:         #0f172a  (UI panely)
surface_highlight: #1e293b (hover stavy)
```

**Typografie:**
```
font-sans:    'Share Tech Mono'    (default - tech look)
font-display: 'Orbitron'           (headers)
font-mono:    'Share Tech Mono'    (labels, hodnoty)
```

**UI Patterns:**
```
✓ Glassmorphism (backdrop-blur-md, opacity)
✓ Corner decorations (border rámečky)
✓ Rounded controls (rounded-lg, rounded-xl)
✓ Neon glow effects (border-primary/30)
✓ Uppercase labels (tracking-wider)
✓ Kompaktní spacing
✓ Dark sci-fi aesthetic
```

**Layout:**
```
✓ Fullscreen background
✓ Overlay UI (absolute positioning)
✓ Top bar (logo + search + status)
✓ Control panels (pravá strana)
✓ CommandDeck (spodní panel)
✓ Mobile responsive
```

---

## 📐 NOVÝ UI DESIGN - KOMPLETNÍ NÁVRH

### 1. **NAVIGAČNÍ STRUKTURA** ✅ IMPLEMENTOVÁNO

#### Top Bar s Modal Triggers

```
┌────────────────────────────────────────────────────────────────┐
│ [Logo] eArcheo  [Mapa]  [Search Bar]  [BETA v1.2]  [User ▼]  │
└────────────────────────────────────────────────────────────────┘
```

**✅ Implementováno v `AuthHeader.tsx`:**

**Logo sekce:**
- **Custom SVG icon** - koncentrické kruhy (sci-fi design)
- **Two-line text** - "eArcheo" + "Dálkový průzkum krajiny"
- **Link to home** - navigace na "/"

**Navigace:**
- **Mapa tab** - aktivní state s primary border
- **Conditional render** - pouze když isAuthenticated
- **Active highlighting** - podle `location.pathname`

**Search Bar:**
- **Nominatim OSM** - free geocoding API
- **Czech focus** - countrycodes=cz
- **Debounced search** - minimum 3 znaky
- **Dropdown results** - absolutně pozicovaný
- **onLocationSelect callback** - předává lng, lat, label
- **Loading indicator** - pulsing cyan dot

**Version Badge:**
- **BETA v1.2** - amber color scheme
- **Tracking wider** - monospace font

**User Menu Dropdown:**
- **Avatar/User icon** - z Auth0 profile
- **Username/Email** - truncated display
- **ChevronDown** - indikátor dropdown
- **Backdrop** - fixed overlay pro zavření
- **z-index management** - 70/71 pro layering

**Menu Items:**
- ✅ **Nálezy** - volá `onOpenFindings()` callback
- ✅ **Navrhnout funkci** - volá `onOpenFeatureRequests()` callback
- ✅ **Smazat účet** - otevře ConfirmDialog
- ✅ **Odhlásit se** - Auth0 logout

**Delete Account Flow:**
- **ConfirmDialog** - varování s red theme
- **Info box** - co bude smazáno
- **Contact notice** - "ahoj@earcheo.cz"
- **Auto-logout** - po 3 sekundách

**Notification Modal:**
- **Success/Error variants** - conditional styling
- **Icon display** - CheckCircle / XCircle
- **Backdrop dismiss** - klik zavře
- **OK button** - manual dismiss

**Design:**
- **Glassmorphism** - bg-surface/80 backdrop-blur-md
- **Border** - border-b border-white/10
- **Pointer events** - none na wrapper, auto na interactive
- **Full-width** - absolute top-0, z-50
- **Mobile responsive** - hidden username na malých obrazovkách

---

### 2. **PROFILE MODAL** ⏳ PLANNED (Modal-First Design)

#### Důvod změny z page na modal:
- **Konzistence** - stejný přístup jako Findings
- **Rychlejší UX** - žádné page transitions
- **Context preservation** - mapa zůstává viditelná
- **Jednodušší routing** - méně routes

#### Plánovaný Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ BACKDROP (darkened blur)                                    │
│                                                              │
│    ┌────────────────────────────────────────────────┐      │
│    │ PROFIL                                  [✕]    │      │
│    ├────────────────────────────────────────────────┤      │
│    │                                                 │      │
│    │  ┌────────────┐  ┌──────────────────────────┐ │      │
│    │  │ [Avatar]   │  │ 📊 STATISTIKY           │ │      │
│    │  │  120x120   │  │ • Celkem nálezů: 12     │ │      │
│    │  │            │  │ • Vybavení: 3           │ │      │
│    │  │TestArcheolog│ │ • Veřejných: 5          │ │      │
│    │  │test@ea.cz  │  │ • Člen od: 26.11.2024   │ │      │
│    │  │            │  │                          │ │      │
│    │  │[Upravit]   │  │ 🏆 ACHIEVEMENTY         │ │      │
│    │  └────────────┘  │ 🎖️ První nález          │ │      │
│    │                  │ 🎖️ 10 nálezů            │ │      │
│    │                  └──────────────────────────┘ │      │
│    │                                                 │      │
│    │  KONTAKT & SOCIÁLNÍ SÍTĚ                       │      │
│    │  📱 +420 123 456 789                           │      │
│    │  🔗 facebook.com/user                          │      │
│    │  [+ Přidat]                                    │      │
│    │                                                 │      │
│    │  OBLÍBENÉ LOKALITY                             │      │
│    │  ┌──────────────────────────────────────┐     │      │
│    │  │ 📍 Karlštejn    [Zobrazit][Smazat]  │     │      │
│    │  │    49.9394, 14.1882                  │     │      │
│    │  └──────────────────────────────────────┘     │      │
│    │  [+ Přidat lokalitu]                           │      │
│    │                                                 │      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Plánované funkce:**
- **Modal overlay** - center positioned, max-w-3xl
- **Avatar management** - upload/change profile picture
- **Inline editing** - quick edit pro základní info
- **Stats calculation** - z databáze
- **Social links** - add/edit/remove
- **Favorite locations** - přidání oblíbených míst s poznámkami
- **"Zobrazit na mapě" action** - zavře modal, flyTo na mapu

---

### 3. **EQUIPMENT MODAL** ⏳ PLANNED (Modal-First Design)

#### Plánovaný Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ BACKDROP (darkened blur)                                    │
│                                                              │
│    ┌────────────────────────────────────────────────┐      │
│    │ MOJE VYBAVENÍ                   [+ Přidat][✕] │      │
│    ├────────────────────────────────────────────────┤      │
│    │                                                 │      │
│    │  [Vše (5)] [Detektory (2)] [GPS (1)] [Ostatní]│      │
│    │                                                 │      │
│    │  ┌────────────┐  ┌────────────┐  ┌──────────┐│      │
│    │  │ 🔍         │  │ 📡         │  │ 🎒       ││      │
│    │  │ Garrett    │  │ Garmin     │  │ Lopata   ││      │
│    │  │ ACE 400i   │  │ eTrex 32x  │  │ Fiskars  ││      │
│    │  │            │  │            │  │          ││      │
│    │  │ [DETECTOR] │  │ [GPS]      │  │ [OTHER]  ││      │
│    │  │            │  │            │  │          ││      │
│    │  │ Použito:   │  │ Použito:   │  │ Použito: ││      │
│    │  │ 12 nálezů  │  │ 12 nálezů  │  │ 8 nálezů ││      │
│    │  │            │  │            │  │          ││      │
│    │  │ [✏️] [🗑️] │  │ [✏️] [🗑️] │  │ [✏️][🗑️]││      │
│    │  └────────────┘  └────────────┘  └──────────┘│      │
│    │                                                 │      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Plánované funkce:**

**Equipment Card:**
- **Grid layout** - 3 columns (desktop), 2 (tablet), 1 (mobile)
- **BaseCard component** - glassmorphism + hover effects
- **Type badge** - StatusBadge s color coding:
  - DETECTOR: amber/yellow
  - GPS: blue/cyan
  - OTHER: grey
- **Usage stats** - počítadlo nálezů kde použito
- **Hover lift effect** - scale + glow
- **Quick actions** - inline edit & delete buttons

**Add/Edit Equipment Form:**
```
┌─────────────────────────────────────┐
│  PŘIDAT VYBAVENÍ              [✕]  │
├─────────────────────────────────────┤
│                                     │
│  Název *                            │
│  [Garrett ACE 400i________]        │
│                                     │
│  Typ *                              │
│  [Detektor ▼]                       │
│    • Detektor kovů                  │
│    • GPS zařízení                   │
│    • Ostatní                        │
│                                     │
│  Výrobce                            │
│  [Garrett_____________]             │
│                                     │
│  Model                              │
│  [ACE 400i____________]             │
│                                     │
│  Poznámky                           │
│  [Dobrá citlivost na_______]       │
│  [malé předměty________]            │
│                                     │
│  [ZRUŠIT]      [ULOŽIT VYBAVENÍ]   │
└─────────────────────────────────────┘
```

**Features:**
- **Modal overlay** - center positioned, max-w-2xl
- **CRUD operations** - create, read, update, delete
- **Filter tabs** - dynamické podle typů
- **Usage tracking** - vztah s findings
- **ConfirmDialog** - před smazáním
- **Empty state** - když žádné vybavení
- **Relation to findings** - propojení přes equipmentIds

---

### 4. **FINDINGS MODAL** ✅ IMPLEMENTOVÁNO

#### Modal Overlay Design (center overlay s backdrop):

```
┌─────────────────────────────────────────────────────────────┐
│ MAPA NA POZADÍ (blur + darkened)                           │
│                                                              │
│         ┌──────────────────────────────────────┐           │
│         │ MOJE NÁLEZY             [+ Přidat][✕]│           │
│         ├──────────────────────────────────────┤           │
│         │                                       │           │
│         │ [Vše (12)] [Mince (5)] [Nástroje (3)]│           │
│         │                                       │           │
│         │ ┌──────────┬────────────────────────┐│           │
│         │ │ [thumb]  │ ŘÍMSKÁ MINCE          ││           │
│         │ │          │ 📅 26.11.2024         ││           │
│         │ │          │ 📍 50.0755, 14.4378   ││           │
│         │ └──────────┴────────────────────────┘│           │
│         │                                       │           │
│         │ [více nálezů...]                     │           │
│         │                                       │           │
│         └──────────────────────────────────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**✅ Implementováno v `FindingsModal.tsx`:**

**Modal Features:**
- **Glassmorphism** - `bg-surface/95 backdrop-blur-md`
- **Center modal** - max-width 4xl, 80vh height, responsive
- **Corner decorations** - sci-fi border design
- **Close button** - top-right corner
- **Dynamické kategorie** - načítají se z databáze + počty
- **+ Přidat button** - neon cyan, otevírá FindingForm
- **Empty state** - EmptyState komponenta s Package ikonou
- **FindingCard grid** - 2 sloupce (desktop), 1 sloupec (mobile)
- **Nested modals** - FindingForm a FindingDetail overlay
- **Live filtering** - podle vybrané kategorie

#### Finding Card (v modalu) ✅ Implementováno:

```
┌──────────────────────────────────────┐
│ ┌────────┐                           │
│ │ 🖼️     │  ŘÍMSKÁ MINCE             │
│ │        │  [Mince] [Římské] 🔒      │
│ │ thumb  │  📅 26.11.2024            │
│ └────────┘  📍 50.0755, 14.4378      │
│             ⚙️ Garrett ACE 400i      │
└──────────────────────────────────────┘
```

**✅ Implementováno v `FindingCard.tsx`:**
- **BaseCard wrapper** - hover scale effect, cursor pointer
- **Thumbnail** - 80x80px (sm) / 96x96px (md), fallback s Package ikonou
- **Lazy loading** - optimalizované načítání obrázků
- **Category badges** - primary/10 background, multiple tags
- **Privacy indicator** - 🔒 Soukromé badge
- **GPS coordinates** - formátované na 4 desetinná místa
- **Equipment display** - první položka + počet dalších
- **Click handler** - otevře FindingDetail modal

**Responsive:** Grid 1 sloupec (mobile), 2 sloupce (desktop)

---

### 5. **FINDING FORM MODAL** ✅ IMPLEMENTOVÁNO

#### Add/Edit Finding Modal:

```
┌─────────────────────────────────────────────────────────────┐
│ BACKDROP (darkened)                                         │
│                                                              │
│    ┌────────────────────────────────────────────┐          │
│    │ PŘIDAT NÁLEZ / UPRAVIT NÁLEZ         [✕]  │          │
│    ├────────────────────────────────────────────┤          │
│    │                                             │          │
│    │  Název nálezu *                            │          │
│    │  [____________________________]            │          │
│    │                                             │          │
│    │  Kategorie * (TagInput)                    │          │
│    │  [Mince] [Římské] [+ Add...]               │          │
│    │                                             │          │
│    │  Datum * [2024-11-26]                      │          │
│    │                                             │          │
│    │  Poloha *          [📍 Vybrat na mapě]     │          │
│    │  Latitude:  [50.075500]                    │          │
│    │  Longitude: [14.437800]                    │          │
│    │                                             │          │
│    │  Popis * [textarea 4 řádky]                │          │
│    │                                             │          │
│    │  ☑️ Sdílet veřejně                         │          │
│    │                                             │          │
│    │  ▼ ROZŠÍŘENÉ INFORMACE (volitelné)        │          │
│    │    - Název lokality                        │          │
│    │    - Stav nálezu                           │          │
│    │    - Hloubka (cm)                          │          │
│    │    - Materiál                              │          │
│    │    - Historický kontext                    │          │
│    │                                             │          │
│    │  FOTOGRAFIE (volitelné)                    │          │
│    │  [+ Přidat fotky]                          │          │
│    │  [preview thumbnails...]                   │          │
│    │                                             │          │
│    │  [ZRUŠIT]              [PŘIDAT NÁLEZ]     │          │
│    └────────────────────────────────────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**✅ Implementováno v `FindingForm.tsx`:**

**Základní funkce:**
- **Required fields** - title, category, date, location, description
- **TagInput komponenta** - dynamické přidávání kategorií (max 3)
- **Date picker** - native HTML5 input type="date"
- **GPS coordinates** - manuální nebo LocationPicker
- **Textarea** - 4 řádky pro popis
- **Public/Private checkbox** - sdílení s ostatními
- **Loading state** - při ukládání s Loader spinner
- **Toast notifications** - úspěch/chyba feedback

**Rozšířené pole (collapsible):**
- **Location name** - např. "Karlštejn, u hradu"
- **Condition** - stav nálezu
- **Depth** - hloubka v cm (number)
- **Material** - materiál nálezu
- **Historical context** - textarea pro kontext
- **Smooth animation** - slide-in-from-top

**Photo upload:**
- **ImageUploader** - drag & drop nebo click
- **Pending images** - preview před upload (create mode)
- **Immediate upload** - při editaci
- **Batch processing** - všechny fotky nahrány po save
- **Thumbnail preview** - 3-column grid
- **Remove button** - pro pending images

**LocationPicker modal:**
- **Interactive map** - kliknutím vybrat polohu
- **Pre-fill** - current nebo default coords
- **Auto-update** - latitude/longitude fields

**Edit mode:**
- **Pre-filled form** - všechny existující hodnoty
- **Conditional extended** - zobrazí se pokud vyplněno
- **Update endpoint** - PUT /api/findings/:id
- **Immediate image upload** - fotky se ukládají okamžitě

### 6. **FINDING DETAIL MODAL** ✅ IMPLEMENTOVÁNO

#### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ BACKDROP (darkened blur)                                    │
│                                                              │
│    ┌────────────────────────────────────────────────┐      │
│    │ ŘÍMSKÁ MINCE                           [✕]     │      │
│    ├────────────────────────────────────────────────┤      │
│    │                                                 │      │
│    │  ┌─────────────────┐ ┌──────────────────────┐ │      │
│    │  │ FOTOGRAFIE      │ │ ZÁKLADNÍ INFORMACE   │ │      │
│    │  │                 │ │                      │ │      │
│    │  │ [Photo Gallery] │ │ 📅 26. listopadu 2024│ │      │
│    │  │  - Lightbox     │ │                      │ │      │
│    │  │  - Thumbnails   │ │ 📍 50.075500,        │ │      │
│    │  │  - Delete       │ │    14.437800         │ │      │
│    │  │                 │ │    Karlštejn         │ │      │
│    │  │ [+ Přidat fotky]│ │                      │ │      │
│    │  │                 │ │ 🏷️ [Mince][Římské]  │ │      │
│    │  │ [Uploader area] │ │                      │ │      │
│    │  │                 │ │ 📝 POPIS             │ │      │
│    │  │                 │ │ Stříbrná římská...   │ │      │
│    │  │                 │ │                      │ │      │
│    │  │                 │ │ 🌍 Veřejný / 🔒     │ │      │
│    │  │                 │ │                      │ │      │
│    │  │                 │ │ ⚙️ POUŽITÉ VYBAVENÍ │ │      │
│    │  │                 │ │ 🔍 Garrett ACE 400i │ │      │
│    │  │                 │ │                      │ │      │
│    │  │                 │ │ ▼ ROZŠÍŘENÉ INFO    │ │      │
│    │  │                 │ │   - Stav            │ │      │
│    │  │                 │ │   - Hloubka         │ │      │
│    │  │                 │ │   - Materiál        │ │      │
│    │  │                 │ │   - Historie        │ │      │
│    │  └─────────────────┘ └──────────────────────┘ │      │
│    │                                                 │      │
│    ├─────────────────────────────────────────────────┤      │
│    │ Vytvořeno: 26.11.2024  [✏️ Upravit][🗑️ Smazat]│      │
│    └─────────────────────────────────────────────────┘      │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**✅ Implementováno v `FindingDetail.tsx`:**

**Modal Layout:**
- **z-index [60]** - vyšší než FindingsModal (40/50)
- **Max-width 5xl** - široký layout pro grid
- **90vh height** - scrollable content area
- **Corner decorations** - všechny 4 rohy
- **Backdrop** - black/80 + blur
- **Grid layout** - 2 sloupce (desktop), 1 sloupec (mobile)

**Photo Gallery:**
- **PhotoGallery komponenta** - lightbox s plným zobrazením
- **Lazy loading** - optimalizované načítání
- **Delete button** - pro každou fotku
- **Image counter** - "X fotek/fotky/fotka"
- **Upload toggle** - + Přidat fotky button
- **ImageUploader** - inline v bordered area
- **Auto-save notice** - "Fotky se ukládají automaticky"
- **Live update** - použití live finding data z hook

**Info Section:**
- **Formatted date** - české locale (26. listopadu 2024)
- **GPS coordinates** - 6 desetinných míst
- **Location name** - pokud vyplněno
- **Category badges** - multiple tags s primary styling
- **Privacy badge** - 🌍 Veřejný / 🔒 Soukromý
- **Description** - whitespace-pre-wrap pro formátování
- **Equipment display** - Package ikona + cards

**Collapsible Extended Info:**
- **Auto-expand** - pokud jsou pole vyplněná
- **Smooth animation** - slide-in-from-top-2
- **Conditional render** - pouze pokud existují data
- **Fields:** Stav, Hloubka (cm), Materiál, Historický kontext

**Footer Actions:**
- **Timestamps** - Vytvořeno / Upraveno
- **Edit button** - otevře FindingForm s pre-filled data
- **Delete button** - red styling, otevře ConfirmDialog
- **Loading states** - disabled při mazání

**Modal Nesting:**
- FindingsModal (z-40) 
  → FindingDetail (z-60) 
    → ConfirmDialog (z-[61])

---

## 🎨 KOMPONENTY KNIHOVNA

### 1. **BaseCard**
```tsx
const BaseCard = ({ children, glow = false }) => (
  <div className={`
    bg-surface/80 backdrop-blur-md 
    border border-white/10 
    rounded-xl p-6
    ${glow ? 'shadow-lg shadow-primary/10' : ''}
    hover:border-primary/30 transition-all
  `}>
    {/* Corner decorations */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary/30" />
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary/30" />
    {children}
  </div>
);
```

### 2. **SectionHeader**
```tsx
const SectionHeader = ({ title, action }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="font-display text-2xl tracking-wider text-primary">
      {title}
    </h2>
    {action && (
      <button className="
        px-4 py-2 bg-primary/10 border border-primary/30 
        rounded-lg text-primary hover:bg-primary/20 
        transition-all font-mono text-sm tracking-wider
      ">
        {action}
      </button>
    )}
  </div>
);
```

### 3. **StatusBadge**
```tsx
const StatusBadge = ({ type, label }) => {
  const colors = {
    DETECTOR: 'amber',
    GPS: 'blue',
    OTHER: 'gray',
    coins: 'yellow',
    tools: 'gray',
  };
  
  return (
    <span className={`
      px-3 py-1 rounded-lg 
      bg-${colors[type]}-500/20 
      border border-${colors[type]}-500/30 
      text-${colors[type]}-400 
      text-xs font-mono tracking-wider uppercase
    `}>
      {label}
    </span>
  );
};
```

### 4. **AnimatedCounter**
```tsx
const AnimatedCounter = ({ value, label }) => {
  // Count up animation on mount
  return (
    <div className="text-center">
      <div className="text-4xl font-display text-primary">
        {value}
      </div>
      <div className="text-xs text-white/50 font-mono uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
};
```

### 5. **ImageUploader**
```tsx
const ImageUploader = ({ onUpload }) => (
  <div className="
    border-2 border-dashed border-primary/30 
    rounded-xl p-8 text-center
    hover:border-primary/50 hover:bg-primary/5
    transition-all cursor-pointer
  ">
    <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
    <p className="font-mono text-sm text-white/70">
      Drag & drop fotku nebo klikněte
    </p>
    <p className="font-mono text-xs text-white/40 mt-2">
      Max 10MB, JPG/PNG/WEBP
    </p>
  </div>
);
```

---

## 📱 MOBILE RESPONSIVE

### Breakpoints:
```
sm: 640px   - 1 column
md: 768px   - 2 columns
lg: 1024px  - 3 columns
xl: 1280px  - Full layout
```

### Mobile Adaptations:

**Profile:**
- Stack vertically
- Collapsible sections
- Bottom sheet pro edit

**Equipment:**
- 1 column grid
- Swipeable cards
- Floating + button

**Findings:**
- Map full-screen
- Bottom drawer s list
- Swipe up/down

---

## 🔄 UX FLOWS ✅ AKTUÁLNÍ IMPLEMENTACE

### 1. **Nový uživatel (první přihlášení):**
```
Auth0 Login 
  → Auto-create profile (Auth0 webhook)
  → Přistání na /map
  → User Menu → Nálezy
  → Empty state "Zatím žádné nálezy"
  → [Přidat první nález] CTA
  → FindingForm modal
```

### 2. **Přidání nálezu (aktuální flow):**
```
MapPage
  → User Menu → "Nálezy"
  → FindingsModal (center overlay)
  → [+ Přidat] button
  → FindingForm modal:
     - Název * (text input)
     - Kategorie * (TagInput, max 3)
     - Datum * (date picker)
     - Poloha * (lat/lng inputs + LocationPicker)
     - Popis * (textarea)
     - Public checkbox
     - ▼ Rozšířené info (collapsible):
       • Název lokality
       • Stav nálezu
       • Hloubka (cm)
       • Materiál
       • Historický kontext
     - Fotografie (ImageUploader):
       • Pending preview (create mode)
       • Immediate upload (edit mode)
  → [Uložit] → POST /api/findings
  → Upload fotky → POST /api/findings/:id/images (batch)
  → Toast: "Nález přidán!" + "Fotky nahrány!"
  → FindingsModal refresh (auto-reload)
```

### 3. **Zobrazení detailu nálezu:**
```
FindingsModal
  → Click na FindingCard
  → FindingDetail modal (z-60, over FindingsModal)
  → 2-column layout:
     - Left: PhotoGallery + upload
     - Right: Info + extended fields
  → Actions:
     - [+ Přidat fotky] → ImageUploader inline
     - [✏️ Upravit info] → FindingForm (pre-filled)
     - [🗑️ Smazat] → ConfirmDialog → DELETE
```

### 4. **Editace nálezu:**
```
FindingDetail
  → [Upravit info] button
  → FindingForm modal (edit mode):
     - Pre-filled všechna pole
     - TagInput s existujícími kategoriemi
     - Extended fields auto-expanded pokud vyplněno
     - Fotky se uploadují okamžitě (ne pending)
  → [Uložit změny] → PUT /api/findings/:id
  → Toast: "Nález aktualizován!"
  → Back to FindingDetail (updated data)
```

### 5. **Mazání nálezu:**
```
FindingDetail
  → [Smazat] button (red)
  → ConfirmDialog:
     - "Smazat nález?"
     - "Tato akce je nevratná. Všechny fotky budou také smazány."
     - [Zrušit] / [Ano, smazat]
  → DELETE /api/findings/:id
  → Cascade delete images
  → Toast: "Nález byl smazán"
  → Close modal → FindingsModal refresh
```

### 6. **Delete account flow:**
```
User Menu
  → [Smazat účet] (red)
  → ConfirmDialog:
     - Varování o nevratnosti
     - Info box co bude smazáno
  → [Ano, smazat]
  → localStorage.clear()
  → Notification: "Pro dokončení kontaktujte ahoj@earcheo.cz"
  → Auto-logout po 3s
```

---

## ⚡ PERFORMANCE

### Optimalizace:

```tsx
✓ Lazy load images (IntersectionObserver)
✓ Virtual scrolling pro dlouhé listy
✓ Debounce search inputs
✓ Optimistic UI updates
✓ React.memo pro těžké komponenty
✓ useMemo pro computed values
✓ Suspense boundaries
✓ Image thumbnails (200x200)
```

---

## 🎯 ACCESSIBILITY

```
✓ ARIA labels
✓ Keyboard navigation
✓ Focus indicators (neon glow)
✓ Alt texty pro obrázky
✓ Screen reader friendly
✓ Color contrast (WCAG AA)
✓ Skip links
```

---

## 📦 KOMPONENTY STRUKTURA ✅ AKTUÁLNÍ IMPLEMENTACE

```
frontend/src/
  pages/
    ✅ MapPage.tsx              - Hlavní stránka s mapou (modal triggers)
    ✅ LandingPage.tsx          - Landing page
    ✅ FindingsPage.tsx         - Dedikovaná stránka (optional fallback)
    ✅ FeatureRequests.tsx      - Feature requests page
  
  components/
    ✅ AuthHeader.tsx           - Top bar s navigací a user menu
    ✅ FeatureRequestsModal.tsx - Feature requests modal
    
    findings/ ✅ HOTOVO
      ✅ FindingsModal.tsx      - Main findings modal (center overlay)
      ✅ FindingForm.tsx        - Add/Edit form (nested modal)
      ✅ FindingCard.tsx        - Card v grid (thumbnail + info)
      ✅ FindingDetail.tsx      - Detail view (nested modal z-60)
      ✅ PhotoGallery.tsx       - Lightbox fotogalerie
      ✅ ImageUploader.tsx      - Drag & drop upload
      ✅ LocationPicker.tsx     - Interaktivní mapa pro GPS
    
    equipment/ ✅ HOTOVO
      ✅ EquipmentModal.tsx      - Main equipment modal (center overlay)
      ✅ EquipmentCard.tsx       - Card s usage stats + actions
      ✅ EquipmentForm.tsx       - Add/Edit form (nested modal)
      ✅ index.ts                - Exports
    
    profile/ ✅ HOTOVO
      ✅ ProfileModal.tsx        - Main profile modal (center overlay)
      ✅ index.ts                - Exports
      ⏳ SocialLinks.tsx         - TODO: Sociální sítě management
      ⏳ FavoriteLocations.tsx   - TODO: Oblíbené lokace
    
    shared/ ✅ HOTOVO
      ✅ BaseCard.tsx            - Reusable card s glassmorphism
      ✅ SectionHeader.tsx       - Section headers
      ✅ StatusBadge.tsx         - Type/status badges (+ color param)
      ✅ LoadingSkeleton.tsx     - Loading placeholder
      ✅ EmptyState.tsx          - Empty state s CTA
      ✅ ConfirmDialog.tsx       - Confirmation dialogs
      ✅ TagInput.tsx            - Multi-tag input pro kategorie
      ⏳ AnimatedCounter.tsx      - TODO: Animated number counters

  hooks/
    ✅ useFindings.ts           - Findings CRUD + image upload
    ✅ useEquipment.ts          - Equipment CRUD operations
    ✅ useProfile.ts            - Profile GET/PUT + auto-create
    ✅ useFeatureRequests.ts    - Feature requests + voting
    ✅ useIsMobile.ts           - Mobile detection

  api/ (Vercel Edge Functions)
    ✅ equipment/
      ✅ index.ts               - GET all, POST create
      ✅ [id].ts                - GET/PUT/DELETE single
    ✅ findings/
      ✅ index.ts               - GET all, POST create
      ✅ [id].ts                - GET/PUT/DELETE single
      ✅ [id]/images.ts         - POST upload, DELETE image
    ✅ features/
      ✅ index.ts               - GET all, POST create
      ✅ [id].ts                - DELETE feature
      ✅ [id]/vote.ts           - POST toggle vote
    ✅ profile.ts               - GET/POST/PUT profile
```

**Modal Hierarchy (z-index management):**
```
MapPage (base z-0)
  ├─ AuthHeader (z-50)
  │   └─ User dropdown (z-70/71)
  ├─ Backdrop (z-40)
  ├─ FindingsModal (z-50)
  │   ├─ FindingForm (z-50) - replace modal
  │   └─ FindingDetail (z-60)
  │       ├─ ImageUploader (inline)
  │       └─ ConfirmDialog (z-61)
  ├─ EquipmentModal (z-50) ✅
  │   ├─ EquipmentForm (z-60) ✅
  │   └─ ConfirmDialog (z-61) ✅
  ├─ ProfileModal (z-50) ✅
  │   └─ Inline editing ✅
  └─ FeatureRequestsModal (z-50)
      ├─ Form (z-70)
      └─ ConfirmDialog (z-61)
```

---

## 🚀 IMPLEMENTAČNÍ PLÁN

### ✅ Fáze 1: Základy (HOTOVO)
1. ✅ Navigace (AuthHeader s user menu)
2. ✅ FindingsModal - center overlay (full-screen responsive)
3. ✅ FindingForm - add/edit modal
4. ✅ Empty state
5. ✅ Dynamický kategoriový systém (tabs)
6. ✅ useFindings hook - API integrace
7. ✅ Toast notifications (Sonner)

### ✅ Fáze 2: Findings Features (DOKONČENO)
1. ✅ Vytváření nálezů s rozšířenými poli
2. ✅ FindingCard komponenta (s thumbnails)
3. ✅ FindingDetail modal (full detail view)
4. ✅ PhotoGallery komponenta (lightbox)
5. ✅ ImageUploader (drag & drop + click)
6. ✅ LocationPicker (interaktivní mapa)
7. ✅ Editace a mazání nálezů
8. ✅ ConfirmDialog pro destruktivní akce
9. ✅ TagInput pro kategorie
10. ✅ Zobrazení nálezů na mapě (markers v SwipeMap)

### ✅ Fáze 3: Equipment & Profile (DOKONČENO - Listopad 2024)
1. ✅ EquipmentModal - center overlay s grid cards
2. ✅ EquipmentForm - add/edit nested modal
3. ✅ EquipmentCard - s usage statistics
4. ✅ EquipmentType badges (DETECTOR/GPS/OTHER)
5. ✅ useEquipment hook - CRUD operations
6. ✅ API endpoints - /api/equipment + /api/equipment/[id]
7. ✅ ProfileModal - center overlay s editací
8. ✅ Stats dashboard - celkem nálezů, veřejných, vybavení
9. ✅ Inline editing profilu (nickname, bio, location, contact)
10. ✅ useProfile hook - existující, plně funkční
11. ✅ API endpoints - /api/profile už existují
12. ✅ Integrace do AuthHeader user menu

### 🎨 Fáze 4: Polish
1. ⏳ Animace (smooth transitions)
2. ⏳ Loading states (skeletons)
3. ⏳ Error handling
4. ⏳ Mobile optimalizace
5. ⏳ Accessibility audit

### 🧪 Fáze 5: Testing
1. ⏳ E2E testy
2. ⏳ Performance audit
3. ⏳ A11y audit

---

## 🎨 DESIGN MOCKUP SUMMARY

**Celkový feel:**
```
Dark sci-fi tech aesthetic
+ Glassmorphism overlays
+ Neon cyan accents
+ Monospace typography
+ Corner decorations
+ Smooth transitions
+ Map-first approach
```

**Konzistence:**
```
✓ Stejný color scheme
✓ Stejná typografie
✓ Stejné spacing
✓ Stejné border styles
✓ Stejné corner decorations
✓ Stejný glassmorphism
✓ Stejný interaction pattern
```

---

## 💡 EXTRA FEATURES (Nice-to-have)

1. **Export nálezů do KML/GPX**
2. **Statistiky dashboard** (grafy s nálezy)
3. **Timeline view** (nálezy chronologicky)
4. **Heatmap** (kde nejčastěji hledám)
5. **Sdílení profilu** (public URL)
6. **Dark/Light theme toggle** (ale dark je default)
7. **Offline mode** (PWA)
8. **Push notifications** (nový komentář atd.)

---

## ✅ CHECKLIST PRO IMPLEMENTACI

### ✅ HOTOVO (Listopad 2024 - Současnost)
```
✅ Navigace (AuthHeader s user menu + modal triggers)
✅ FindingsModal (center overlay, max-w-4xl, dynamic categories)
✅ FindingForm (nested modal s rozšířenými poli + LocationPicker)
✅ FindingCard (thumbnail + info, grid layout)
✅ FindingDetail (full detail view, z-60, photo management)
✅ PhotoGallery (lightbox s delete)
✅ ImageUploader (drag & drop)
✅ LocationPicker (interaktivní mapa pro GPS)
✅ TagInput (multi-tag pro kategorie, max 3)
✅ Dynamické kategorie (loading z DB + filtering)
✅ Map markers (findings zobrazené na mapě v SwipeMap)
✅ EquipmentModal (center overlay, type filtering)
✅ EquipmentCard (grid cards + usage statistics)
✅ EquipmentForm (add/edit with type selector)
✅ useEquipment hook (CRUD operations)
✅ Equipment API (/api/equipment + /api/equipment/[id])
✅ Equipment types (DETECTOR, GPS, OTHER)
✅ ProfileModal (center overlay s inline editing)
✅ Profile stats (nálezy, vybavení, member since)
✅ useProfile hook (GET/PUT profile)
✅ Profile API (/api/profile) - už existoval
✅ Forms + validace (inline validation)
✅ useFindings hook (API integrace + caching)
✅ Toast notifications (Sonner)
✅ Empty states (EmptyState komponenta)
✅ ConfirmDialog (pro destruktivní akce)
✅ LoadingSkeleton (loading states)
✅ BaseCard, StatusBadge, SectionHeader (shared komponenty)
✅ Auth0 integrace (login, logout, profile)
✅ Delete account flow (s confirmation)
✅ Database (Prisma + Neon PostgreSQL)
✅ Image processing API (Sharp.js, thumbnails)
✅ Geocoding (Nominatim OSM)
✅ Production deployment (earcheo.cz)
✅ Feature Requests Modal (s voting)
✅ Mobile responsive design
✅ Modal-first architecture (z-index hierarchy)
```

### ⏳ TODO - Budoucí vylepšení
```
⏳ AnimatedCounter komponenta (pro stats)
⏳ Social links management (v ProfileModal)
⏳ Favorite locations (save/edit/delete)
⏳ Click na map marker → open FindingDetail
⏳ Equipment selector v FindingForm
⏳ Mobile optimalizace (swipe gestures)
⏳ Animace (smooth transitions, Framer Motion)
⏳ Accessibility audit (ARIA, keyboard nav)
⏳ Performance optimization (React.memo, useMemo)
⏳ Testing (E2E s Playwright, unit testy)
⏳ PWA features (offline mode)
⏳ Push notifications
⏳ Export nálezů (CSV, KML, GPX)
⏳ Heatmap nálezů
```

---

## 🎯 ARCHITEKTONICKÝ PŘÍSTUP

### Modal-First Design ✅ IMPLEMENTOVÁNO

**Proč modaly místo full-page?**
1. ✅ **Zachování kontextu** - mapa zůstává viditelná na pozadí
2. ✅ **Rychlejší UX** - žádné page transitions, instant open
3. ✅ **Lepší pro exploraci** - quick peek do dat bez opuštění mapy
4. ✅ **Konzistentní UX** - všechny modaly stejný design pattern
5. ✅ **Jednodušší routing** - méně routes, state management v React
6. ✅ **Nested modals** - detail views layered (z-index hierarchy)
7. ✅ **Mobile responsive** - same pattern, jen fullscreen

**Modal Pattern (Aktuální implementace):**
```tsx
<MapPage>                           // Base layer z-0
  <Map />                           // Main content
  <AuthHeader />                    // z-50, top bar
  
  {/* Modal state management */}
  const [showFindings, setShowFindings] = useState(false);
  const [showFeatureRequests, setShowFeatureRequests] = useState(false);
  
  {/* Modal overlays */}
  <FindingsModal 
    isOpen={showFindings}
    onClose={() => setShowFindings(false)}
  />                                // z-40 backdrop, z-50 modal
    → FindingForm                   // z-50 (replaces FindingsModal)
    → FindingDetail                 // z-60 (over FindingsModal)
      → ConfirmDialog               // z-61 (over everything)
  
  <FeatureRequestsModal 
    isOpen={showFeatureRequests}
    onClose={() => setShowFeatureRequests(false)}
  />                                // z-50
  
  {/* Plánované */}
  <EquipmentModal />                // z-50 (TODO)
  <ProfileModal />                  // z-50 (TODO)
</MapPage>
```

**Z-Index Hierarchy:**
```
Level 0:  Map, background content
Level 40: Modal backdrops (blur + darken)
Level 50: Primary modals (Findings, Equipment, Profile, AuthHeader)
Level 60: Secondary modals (FindingDetail over FindingsModal)
Level 61: Tertiary modals (ConfirmDialog over detail)
Level 70: User menu dropdown (AuthHeader)
Level 71: Dropdown backdrop
Level 100: Critical alerts/notifications
```

**Modal Communication Pattern:**
```tsx
// Parent passes callbacks
<FindingsModal 
  onOpenForm={() => setShowForm(true)}
  onRefresh={() => fetchFindings()}
/>

// Child triggers actions
<FindingCard onClick={() => onOpenDetail(finding)} />

// Sibling communication via parent state
const [selectedFinding, setSelectedFinding] = useState(null);
```

**Benefits Realized:**
- ✅ 0ms navigation (instant modals)
- ✅ Context preservation (map visible)
- ✅ Natural stacking (detail over list)
- ✅ Easy dismiss (backdrop click, ESC key)
- ✅ Consistent animations (fade + scale)
- ✅ Mobile-friendly (same pattern, fullscreen on small screens)

---

## 📊 TECH STACK SUMMARY

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- MapLibre GL (maps)
- React Router (routing)
- Auth0 React SDK
- Sonner (toasts)
- Lucide React (icons)

**Backend:**
- Vercel Edge Functions
- Prisma ORM
- Neon PostgreSQL
- Sharp.js (image processing)
- Auth0 (authentication)

**APIs:**
- Nominatim OSM (geocoding)
- ČÚZK WMS (ortofoto, DMR5G)
- Custom findings API
- Custom image upload API

---

**Status: 🟢 V PRODUKCI - kontinuální development**

**Aktuální verze: BETA v1.2**

**Live URL: https://earcheo.cz**á