# Komplexní analýza rizik - Čištění kódu

**Datum:** 2025-11-29  
**Projekt:** eArcheo  
**ESLint nalezené problémy:** 45 (35 errors, 10 warnings)

---

## 🎯 Cíl

Bezpečně opravit všechny ESLint chyby bez poškození funkčnosti aplikace.

---

## 📊 Kategorizace problémů podle rizika

### 🟢 NÍZKÉ RIZIKO (Bezpečné opravy)

#### 1. Service Worker ESLint chyby (18×)
**Soubor:** `frontend/public/sw.js`

**Problém:**
```
13:1  error  'self' is not defined      no-undef
15:5  error  'caches' is not defined    no-undef
```

**Příčina:** ESLint nerozpoznává Service Worker globální proměnné (`self`, `caches`, `fetch`, `location`).

**Řešení:** ✅ BEZPEČNÉ
```js
// Přidat do eslint.config.js
{
  files: ['public/sw.js'],
  languageOptions: {
    globals: {
      ...globals.serviceworker
    }
  }
}
```

**Dopad:** Žádný - jen konfigurace lintu, Service Worker funguje správně.

**Testování:** Ověřit že SW funguje v production buildu.

---

#### 2. Extra středník (1×)
**Soubor:** `frontend/src/components/ProfileChart.tsx:112`

```typescript
}); // <-- extra středník
```

**Řešení:** ✅ BEZPEČNÉ - Odstranit jeden středník

**Dopad:** Čistě kosmetická oprava, žádný funkční dopad.

---

#### 3. Nepoužitá proměnná `err` (1×)
**Soubor:** `frontend/src/components/TopFeatureRequests.tsx:37`

**Kód:**
```typescript
} catch (err) {
  console.error('Failed to fetch top features:', err);
  // ... ale err se nepoužívá dál
}
```

**Řešení:** ✅ BEZPEČNÉ
```typescript
} catch (err) {
  console.error('Failed to fetch top features:', err);
}
```
Nebo přejmenovat na `_err` pokud chceme zachovat typ.

**Dopad:** Žádný.

---

### 🟡 STŘEDNÍ RIZIKO (Vyžaduje pozornost)

#### 4. Nepoužité prefixované proměnné (2×)
**Soubor:** `frontend/src/components/MobileCommandDeck.tsx:55,58`

**Kód:**
```typescript
bearing: _bearing,  // Line 55 - destrukturováno ale nepoužito
const [_isExpanded, setIsExpanded] = useState(false);  // Line 58
```

**Analýza:**
- `_bearing` - Props předáván ale nepoužíván v komponentě
- `_isExpanded` - State se nastavuje pomocí `setIsExpanded`, ale hodnota se nečte

**Možné řešení:**
1. **Option A (PREFEROVANÉ):** Ponechat `_` prefix - konvence pro záměrně nepoužité
2. **Option B:** Odstranit pokud opravdu nejsou potřeba

**RIZIKO:** Proměnné mohou být připravené pro budoucí funkci! Nutno zkontrolovat git historii.

**Doporučení:** ⚠️ Ponechat s `_` prefixem a upravit ESLint pravidlo:
```js
rules: {
  '@typescript-eslint/no-unused-vars': ['error', {
    argsIgnorePattern: '^_',
    varsIgnorePattern: '^_'
  }]
}
```

**Testování:** Ověřit že mobile command deck funguje (otevírání panelů, animace).

---

#### 5. TypeScript `any` typy v event handlerech (13×)

**Soubory:**
- `AuthHeader.tsx:49`
- `Header.tsx:41`  
- `MobileMapHeader.tsx:63`
- `LocationPicker.tsx:50`
- `EquipmentCard.tsx:24`
- `FindingForm.tsx:95`
- `SwipeMap.tsx:159,327,541` (3×)
- `ProfileChart.tsx:52`
- `types/database.ts:192`
- `useFeatureRequests.ts:142`

**Příklad (SwipeMap.tsx):**
```typescript
mapStyle={MAP_STYLES[mapStyleKey].style as any}
```

**Analýza:**
- **Příčina:** `react-map-gl` očekává `string | mapboxgl.Style`, ale předáváme `string`
- **Problém:** Type assertion `as any` obchází type checking
- **RIZIKO:** Pokud změníme na správný typ, může se objevit type error

**Řešení:** ⚠️ OPATRNĚ
```typescript
// Option A - Nejbezpečnější (ponechat as any s komentářem)
mapStyle={MAP_STYLES[mapStyleKey].style as any} // react-map-gl type issue

// Option B - Správný typ (může odhalit skutečné problémy!)
mapStyle={MAP_STYLES[mapStyleKey].style as string}

// Option C - Definovat správný typ
type MapStyleType = string | mapboxgl.Style;
mapStyle={MAP_STYLES[mapStyleKey].style as MapStyleType}
```

**RIZIKO:** Pokud změníme typy, můžeme odhalit skutečné type problémy které se projeví až za běhu!

**Doporučení:** 
1. Nejprve změnit `as any` → `as string` pro map styles
2. Testovat mapu ve všech stylech (SATELLITE, DARK, STREET)
3. Pak řešit další `any` typy individuálně

**Testování:** 
- ✅ Přepínat mezi styly map
- ✅ Ověřit terrain rendering
- ✅ Zkontrolovat console na runtime errors

---

### 🔴 VYSOKÉ RIZIKO (Kritické - funkční dopad)

#### 6. Non-null assertion operator (1×)
**Soubor:** `frontend/src/hooks/useProfile.ts:29`

**Kód:**
```typescript
email: auth0User?.email!,
```

**Problém:**
- Optional chaining `?.` vrátí `undefined` pokud `auth0User` je null
- Non-null assertion `!` TVRDÍ že hodnota NENÍ null/undefined
- **ROZPOR:** Pokud je `auth0User` null, výsledek je `undefined!` = runtime CHYBA!

**RIZIKO:** 🔴 VYSOKÉ
- Pokud Auth0 vrátí uživatele bez emailu → CRASH
- Pokud se uživatel odhlásí během volání → CRASH

**Řešení - BEZPEČNÉ:**
```typescript
// Option A - Default hodnota
email: auth0User?.email ?? 'unknown@earcheo.cz',

// Option B - Guard clause (PREFEROVANÉ)
if (!auth0User?.email) {
  throw new Error('User email is required for profile creation');
}
return await createProfile({
  email: auth0User.email,
  nickname: auth0User.nickname,
  avatarUrl: auth0User.picture,
});
```

**Doporučení:** ⚠️ Option B s guard clause

**Testování:**
- ✅ Login s novým uživatelem
- ✅ Login s existujícím uživatelem
- ✅ Zkontrolovat že profil se vytváří správně
- ⚠️ Test edge case: co když Auth0 neposkytne email?

---

#### 7. React Hooks exhaustive-deps (10×)

**Dotčené soubory:**
- `CommandDeck.tsx` - onFiltersChange, savedPresets
- `EquipmentModal.tsx` - fetchEquipment, loading
- `FindingsModal.tsx` - fetchFindings, loading  
- `PhotoGallery.tsx` - handleNext, handlePrevious
- `ProfileModal.tsx` - multiple fetch functions
- `useEquipment.ts` - fetchEquipment
- `useFeatureRequests.ts` - fetchFeatures, migrateFromLocalStorage
- `useFindings.ts` - autoFetch, fetchFindings
- `useProfile.ts` - fetchProfile

**Příklad:**
```typescript
useEffect(() => {
  fetchEquipment();
}, [autoFetch]); // ⚠️ Chybí fetchEquipment
```

**PROBLÉM:**
1. **Stale closure** - `fetchEquipment` se může změnit, ale effect se nespustí
2. **Nekonzistence** - Hook může používat zastaralou verzi funkce

**RIZIKO:** 🔴 VYSOKÉ
- Může způsobit race conditions
- Data mohou být zastaralá
- Nekonzistentní state

**Řešení - DVĚ MOŽNOSTI:**

**Option A - Přidat do dependencies (MŮŽE ZPŮSOBIT NEKONEČNOU SMYČKU!):**
```typescript
useEffect(() => {
  fetchEquipment();
}, [autoFetch, fetchEquipment]); // ⚠️ NEBEZPEČNÉ pokud fetchEquipment není memoizováno!
```

**Option B - Memoizovat funkci (PREFEROVANÉ):**
```typescript
const fetchEquipment = useCallback(async () => {
  // ... kód
}, [/* dependencies funkce */]);

useEffect(() => {
  fetchEquipment();
}, [autoFetch, fetchEquipment]); // ✅ BEZPEČNÉ
```

**Option C - Ignorovat warning s komentářem (DOČASNÉ):**
```typescript
useEffect(() => {
  fetchEquipment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [autoFetch]); // Intentionally only on autoFetch change
```

**KRITICKÉ ROZHODNUTÍ:**
- Většina fetch funkcí v custom hooks NENÍ memoizovaná
- Přidání do dependencies bez `useCallback` = NEKONEČNÁ SMYČKA RE-RENDERŮ
- Nutno upravit VŠECHNY custom hooks najednou

**Doporučení:** ⚠️ 
1. **Fáze 1:** Přidat komentáře s `eslint-disable-next-line` (dočasné)
2. **Fáze 2:** Systematicky přidat `useCallback` do všech hooks
3. **Fáze 3:** Odstranit eslint-disable komentáře

**Testování:**
- ✅ Ověřit že se data načítají správně
- ✅ Zkontrolovat Network tab - počet requestů
- ⚠️ Sledovat re-rendery pomocí React DevTools
- 🔴 KRITICKÉ: Zkontrolovat že nejsou infinite loops!

---

## 📋 Doporučený plán oprav

### FÁZE 0: Příprava (KRITICKÉ!)
```bash
# 1. Backup aktuálního stavu
git add -A
git commit -m "Before ESLint cleanup"
git branch backup-before-cleanup

# 2. Ujistit se že projekt funguje
npm run build
# Spustit aplikaci a otestovat hlavní funkce
```

### FÁZE 1: Bezpečné opravy (Nízké riziko)
1. ✅ Service Worker ESLint config
2. ✅ Extra středník v ProfileChart
3. ✅ Nepoužitá proměnná `err`
4. ✅ ESLint pravidlo pro `_` prefix

**Test:** `npm run lint` - mělo by zůstat ~32 chyb

### FÁZE 2: Střední riziko
1. ⚠️ Změnit `as any` → `as string` pro map styles
2. ⚠️ Testovat všechny map styles

**Test:** Spustit aplikaci, přepínat styly map, ověřit terrain

### FÁZE 3: Vysoké riziko (OPATRNĚ!)
1. 🔴 Opravit non-null assertion v useProfile
2. 🔴 Testovat login flow důkladně

**Test:** Login, logout, vytvoření nového profilu

### FÁZE 4: React Hooks (KOMPLEXNÍ REFAKTORING)
1. 🔴 Přidat dočasné `eslint-disable` komentáře
2. 🔴 Systematicky přidat `useCallback` do hooks
3. 🔴 Testovat každý hook individuálně

**Test:** Kompletní test všech features

---

## ⚠️ KRITICKÁ VAROVÁNÍ

### ❌ CO NEDĚLAT:
1. ❌ Neopravovat všechny `any` typy najednou
2. ❌ Nepřidávat dependencies do useEffect bez `useCallback`
3. ❌ Neodstraňovat proměnné s `_` prefixem bez analýzy
4. ❌ Neignorovat warnings blanketově

### ✅ CO DĚLAT:
1. ✅ Opravovat po kategoriích (nízké → vysoké riziko)
2. ✅ Git commit po každé kategorii
3. ✅ Testovat po každé změně
4. ✅ Monitorovat console a Network tab
5. ✅ Mít připravený rollback (backup branch)

---

## 🧪 Testovací checklist

Po KAŽDÉ fázi oprav:

### Základní funkčnost:
- [ ] `npm run build` projde bez chyb
- [ ] Aplikace se spustí
- [ ] Login/logout funguje
- [ ] Navigace po mapě funguje

### Specifické testy podle fáze:
- [ ] Map styles (SATELLITE, DARK, STREET)
- [ ] Terrain exaggeration
- [ ] Mobile command deck
- [ ] Přidání nálezu
- [ ] Zobrazení profilu
- [ ] Equipment management
- [ ] Feature requests

### Performance:
- [ ] Žádné nekonečné smyčky
- [ ] Přiměřený počet API requestů
- [ ] Žádné memory leaky

---

## 📈 Očekávané výsledky

### Před opravami:
- 45 ESLint problémů
- Projekt funguje, ale s potenciálními bugs

### Po Fázi 1:
- ~13 ESLint problémů (service worker + kosmetika vyřešeny)
- Projekt funguje stejně

### Po Fázi 2:
- ~12 ESLint problémů (map style typy opraveny)
- Projekt funguje stejně

### Po Fázi 3:
- ~11 ESLint problémů (non-null assertion opraven)
- Projekt funguje BEZPEČNĚJI (lepší error handling)

### Po Fázi 4:
- 0 ESLint problémů ✅
- Všechny hooks korektně memoizované
- Lepší performance (méně re-renderů)

---

## 🚨 Eskalační plán

Pokud něco selže:

### Level 1: Build error
```bash
git status
git diff
git checkout -- <problematic-file>
```

### Level 2: Runtime error
```bash
git log --oneline -5
git revert HEAD
```

### Level 3: Nekonečná smyčka
```bash
git reset --hard backup-before-cleanup
```

### Level 4: Data corruption
⚠️ **KRITICKÉ:** Databáze by NEMĚLA být dotčena - pouze frontend kód.
Pokud ano → OKAMŽITĚ STOP a analýza.

---

## ✅ Závěr

Opravy jsou proveditelné, ale vyžadují:
1. **Systematický přístup** - fáze po fázi
2. **Důkladné testování** - po každé změně
3. **Git disciplína** - commit, test, commit
4. **Čas** - 2-4 hodiny práce
5. **Pozornost** - zejména u React hooks

**Pokud si nejsi jistý v jakémkoliv kroku → ZEPTEJ SE!**

