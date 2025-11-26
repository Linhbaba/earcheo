# UI Design Plan - Profil, Vybavení & Nálezy

**Designová konzistence s existující mapovou aplikací**

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

### 1. **NAVIGAČNÍ STRUKTURA**

#### Top Bar Enhancement (rozšíření existujícího)

```
┌─────────────────────────────────────────────────┐
│ [Logo] eArcheo  [Search]     [🗺️ MAPA] [📦 NÁLEZY] [🔧 VYBAVENÍ] [👤 PROFIL]  [BETA v1.0] │
└─────────────────────────────────────────────────┘
```

**Implementace:**
- Rozšířit `AuthHeader.tsx`
- Přidat navigační menu mezi search a status
- Aktivní sekce zvýrazněna neon cyan
- Smooth transitions mezi sekcemi
- Mobile: Hamburger menu

---

### 2. **PROFILE PAGE** (`/profile`)

#### Layout Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR (stejný jako na mapě)                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │   PROFILE CARD   │  │    STATISTICS PANEL          │   │
│  │                  │  │                              │   │
│  │  [Avatar 120px]  │  │  📊 Statistiky               │   │
│  │                  │  │  ├─ Celkem nálezů: 12       │   │
│  │  TestArcheolog   │  │  ├─ Vybavení: 3             │   │
│  │  ✉️ test@.cz     │  │  ├─ Veřejných: 5            │   │
│  │  📍 Praha, ČR    │  │  └─ Registrace: 26.11.2024  │   │
│  │                  │  │                              │   │
│  │  [EDIT PROFILE]  │  │  🏆 Achievementy (volitelné) │   │
│  └──────────────────┘  │  └─ 🎖️ První nález          │   │
│                        │     🎖️ 10 nálezů            │   │
│  ┌────────────────────────────────────────────────────┐   │
│  │  CONTACT & SOCIAL                                  │   │
│  │  ├─ 📱 +420 123 456 789                            │   │
│  │  ├─ 🔗 facebook.com/user                          │   │
│  │  └─ [+ Přidat sociální síť]                       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  OBLÍBENÉ LOKALITY                                │   │
│  │  ┌────────────────────────────────────────────┐   │   │
│  │  │ 📍 Karlštejn                              │   │   │
│  │  │    49.9394, 14.1882                      │   │   │
│  │  │    "Dobrá lokalita pro hledání"          │   │   │
│  │  │    [Zobrazit na mapě] [Smazat]           │   │   │
│  │  └────────────────────────────────────────────┘   │   │
│  │  [+ Přidat lokalitu]                              │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Design:

**Profile Card:**
```tsx
- Background: bg-surface/80 backdrop-blur-md
- Border: border border-primary/20
- Glow: shadow-lg shadow-primary/10
- Corner decorations (sci-fi look)
- Avatar: Rounded-full s neon border
- Text: font-mono pro labels, font-sans pro hodnoty
- Edit button: Neon cyan hover effect
```

**Statistics Panel:**
```tsx
- Grid layout (2 columns na desktop)
- Animated counters (counting up effect)
- Icons s neon glow
- Hover tooltips s info
```

**Social Links:**
```tsx
- Platform icons (Facebook, Instagram, atd.)
- Glassmorphism cards
- Add button s + ikona
- Inline editing
```

**Favorite Locations:**
```tsx
- Mini map preview (thumbnail)
- GPS souřadnice (monospace)
- Quick action buttons
- Drag to reorder
```

---

### 3. **EQUIPMENT PAGE** (`/equipment`)

#### Layout Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MY EQUIPMENT                           [+ ADD NEW]  │  │
│  │                                                        │  │
│  │  Filters: [All] [Detektory] [GPS] [Ostatní]          │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐          │
│  │ 🔍         │  │ 📡         │  │ 🎒         │          │
│  │ Garrett    │  │ Garmin     │  │ Lopata     │          │
│  │ ACE 400i   │  │ eTrex 32x  │  │ Fiskars    │          │
│  │            │  │            │  │            │          │
│  │ DETECTOR   │  │ GPS        │  │ OTHER      │          │
│  │            │  │            │  │            │          │
│  │ Použito:   │  │ Použito:   │  │ Použito:   │          │
│  │ 12 nálezů  │  │ 12 nálezů  │  │ 8 nálezů   │          │
│  │            │  │            │  │            │          │
│  │ [Edit] [🗑]│  │ [Edit] [🗑]│  │ [Edit] [🗑]│          │
│  └────────────┘  └────────────┘  └────────────┘          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Design:

**Equipment Card:**
```tsx
- Grid layout (3 columns desktop, 1 mobile)
- Card s glassmorphism
- Hover: Lift effect + glow
- Type badge (DETECTOR/GPS/OTHER) s color coding:
  - DETECTOR: amber
  - GPS: blue  
  - OTHER: grey
- Usage statistics (kolika nálezů použito)
- Quick actions (edit, delete)
```

**Add Equipment Modal:**
```tsx
┌─────────────────────────────────┐
│  ADD EQUIPMENT                  │
│                                 │
│  Name *                         │
│  [________________]             │
│                                 │
│  Type *                         │
│  [Detektor ▼]                   │
│                                 │
│  Manufacturer                   │
│  [________________]             │
│                                 │
│  Model                          │
│  [________________]             │
│                                 │
│  Notes                          │
│  [________________]             │
│  [________________]             │
│                                 │
│  [CANCEL]  [SAVE EQUIPMENT]    │
└─────────────────────────────────┘
```

---

### 4. **FINDINGS PAGE** (`/findings`)

#### Layout Structure:

```
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR                                                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┬───────────────────────────────────────┐  │
│  │              │                                       │  │
│  │  SIDEBAR     │         MAP VIEW                      │  │
│  │              │                                       │  │
│  │  MY FINDS    │    🗺️ (MapLibre s nálezy pinned)    │  │
│  │  [+ NEW]     │                                       │  │
│  │              │    📍 = nález (kliknutelný)           │  │
│  │  Filters:    │                                       │  │
│  │  ☑ Coins     │    Hover: preview card                │  │
│  │  ☑ Tools     │    Click: detail panel                │  │
│  │  ☑ Pottery   │                                       │  │
│  │  ☐ Public    │                                       │  │
│  │              │                                       │  │
│  │  ────────    │                                       │  │
│  │              │                                       │  │
│  │  📍 Římská   │                                       │  │
│  │     mince    │                                       │  │
│  │     26.11.24 │                                       │  │
│  │     [VIEW]   │                                       │  │
│  │              │                                       │  │
│  │  📍 Bronz    │                                       │  │
│  │     přezka   │                                       │  │
│  │     15.10.24 │                                       │  │
│  │     [VIEW]   │                                       │  │
│  │              │                                       │  │
│  └──────────────┴───────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Na mobilu:** Bottom sheet s findings list

#### Finding Card (v sidebaru):

```
┌──────────────────────────┐
│ 🖼️ [Thumbnail]           │
│                          │
│ ŘÍMSKÁ MINCE             │
│ 📅 26.11.2024            │
│ 📍 Pole u Prahy          │
│ 🏷️ coins                 │
│                          │
│ ⚙️ Garrett ACE 400i     │
│                          │
│ [ZOBRAZIT DETAIL]       │
└──────────────────────────┘
```

---

### 5. **FINDING DETAIL PAGE** (`/findings/:id`)

#### Layout:

```
┌─────────────────────────────────────────────────────────────┐
│ TOP BAR                                          [← BACK]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────┐  ┌────────────────────────────┐ │
│  │                       │  │  ZÁKLADNÍ INFO            │ │
│  │   PHOTO GALLERY       │  │                            │ │
│  │                       │  │  📝 Římská mince           │ │
│  │  [< Main Image >]     │  │  📅 26.11.2024             │ │
│  │                       │  │  📍 50.0755, 14.4378       │ │
│  │  [○] [○] [●] [○]      │  │  🏷️ coins                  │ │
│  │                       │  │                            │ │
│  │  [⬆️ Upload Photo]    │  │  📝 POPIS                  │ │
│  │                       │  │  Stříbrná římská mince     │ │
│  └───────────────────────┘  │  nalezená u řeky...        │ │
│                              │                            │ │
│                              │  [▼ ZOBRAZIT VÍCE]         │ │
│                              │  ┌──────────────────────┐ │ │
│                              │  │ ROZŠÍŘENÉ INFO      │ │ │
│                              │  │ 🔧 Stav: dobrý       │ │ │
│                              │  │ 📏 Hloubka: 15.5 cm │ │ │
│                              │  │ 🏺 Materiál: stříbro│ │ │
│                              │  │ 📖 Historický kontext│ │ │
│                              │  └──────────────────────┘ │ │
│                              │                            │ │
│  ┌────────────────────────────────────────────────────┐ │ │
│  │  POUŽITÉ VYBAVENÍ                                  │ │ │
│  │  🔍 Garrett ACE 400i                               │ │ │
│  │  📡 Garmin eTrex 32x                              │ │ │
│  └────────────────────────────────────────────────────┘ │ │
│                                                              │
│  ┌────────────────────────────────────────────────────┐   │
│  │  MAPA LOKALITY                                     │   │
│  │  🗺️ [Mini map s pinned location]                  │   │
│  │  [Zobrazit na hlavní mapě]                        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                              │
│  [🗑️ SMAZAT NÁLEZ]  [✏️ UPRAVIT]  [🔗 SDÍLET]           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Visual Design:

**Photo Gallery:**
```tsx
- Lightbox s full-screen preview
- Swipe na mobilu
- Lazy loading
- Upload s drag&drop
- Progress bar při uploadu
- Thumbnail s loading skeleton
```

**Collapsible "Zobrazit více":**
```tsx
- Smooth expand/collapse
- Pouze když jsou vyplněná rozšířená pole
- Prevents UI clutter
```

**Equipment Pills:**
```tsx
- Chips s ikonami
- Link na equipment detail
- Tooltip s info
```

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

## 🔄 UX FLOWS

### 1. **Nový uživatel (první přihlášení):**
```
Auth0 Login 
  → POST /api/profile (create)
  → Welcome modal
  → "Přidat své první vybavení?"
  → Equipment form
  → "Vytvořit první nález?"
  → Map s pin
```

### 2. **Přidání nálezu:**
```
Findings page 
  → [+ NEW] button
  → Map picker (vybrat lokaci)
  → Form modal:
     - Základní info (title, date, category)
     - Upload fotka
     - Vybrat vybavení
     - [Rozšířené info] collapsible
  → POST /api/findings
  → Upload fotky → POST /api/findings/:id/images
  → Redirect na detail
  → Toast: "Nález přidán!"
```

### 3. **Editace profilu:**
```
Profile page 
  → [EDIT] button
  → Inline editing (contentEditable)
  → nebo Modal form
  → PUT /api/profile
  → Optimistic UI update
  → Toast: "Profil aktualizován"
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

## 📦 KOMPONENTY STRUKTURA

```
frontend/src/
  pages/
    ProfilePage.tsx         - Profil uživatele
    EquipmentPage.tsx       - Seznam vybavení
    FindingsPage.tsx        - Mapa s nálezy
    FindingDetailPage.tsx   - Detail nálezu
  
  components/
    profile/
      ProfileCard.tsx
      StatsPanel.tsx
      SocialLinks.tsx
      FavoriteLocations.tsx
    
    equipment/
      EquipmentCard.tsx
      EquipmentGrid.tsx
      EquipmentForm.tsx
      EquipmentModal.tsx
    
    findings/
      FindingCard.tsx
      FindingsList.tsx
      FindingMap.tsx
      FindingForm.tsx
      PhotoGallery.tsx
      ImageUploader.tsx
    
    shared/
      BaseCard.tsx
      SectionHeader.tsx
      StatusBadge.tsx
      AnimatedCounter.tsx
      LoadingSkeleton.tsx
      EmptyState.tsx
      ConfirmDialog.tsx
```

---

## 🚀 IMPLEMENTAČNÍ PLÁN

### Fáze 1: Základy (2-3 hodiny)
1. Navigace (rozšířit AuthHeader)
2. BaseCard + společné komponenty
3. ProfilePage (basic)
4. EquipmentPage (basic)

### Fáze 2: Findings (3-4 hodiny)
1. FindingsPage s mapou
2. FindingDetailPage
3. Photo gallery
4. Image upload

### Fáze 3: Polish (1-2 hodiny)
1. Animace
2. Loading states
3. Error handling
4. Mobile optimalizace
5. Accessibility

### Fáze 4: Testing
1. E2E testy
2. Performance audit
3. A11y audit

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

```
☐ Navigace + routing
☐ ProfilePage komponenty
☐ EquipmentPage komponenty  
☐ FindingsPage + mapa
☐ FindingDetailPage
☐ Photo upload + processing
☐ Forms + validace
☐ Loading states
☐ Error handling
☐ Mobile responsive
☐ Animace
☐ Accessibility
☐ Testing
```

---

**Chcete, abych to teď implementoval podle tohoto návrhu?** 🚀

