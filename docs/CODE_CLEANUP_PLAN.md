# Plán čištění kódu - eArcheo

**Datum:** 2025-11-29  
**Status:** Plan mode - Připraveno k exekuci  
**Analýza rizik:** `docs/CODE_CLEANUP_RISK_ANALYSIS.md`

---

## 🎯 Cíle

1. Vyčistit nepoužívané soubory a kód
2. Opravit všech 45 ESLint problémů
3. Konsolidovat dokumentaci
4. Reorganizovat strukturu projektu
5. **ZACHOVAT 100% funkčnost**

---

## 📦 FÁZE 0: Bezpečnostní záloha (POVINNÉ!)

### 0.1 Git backup
```bash
git status
git add -A
git commit -m "Checkpoint před čištěním kódu"
git branch backup-before-cleanup-$(date +%Y%m%d)
```

### 0.2 Ověření výchozího stavu
```bash
cd frontend && npm run build
# Spustit aplikaci a ověřit že funguje
```

### 0.3 Seznam co bude smazáno
- [ ] Zkontrolovat že žádný soubor není kritický
- [ ] Backup citlivých dat (OAuth secrets)

---

## 📁 FÁZE 1: Odstranění souborů (1-2 hodiny)

### 1.1 Bezpečnostní cleanup

#### Odstranit citlivé soubory:
```bash
git rm client_secret_*.json
echo "client_secret_*.json" >> .gitignore
echo "*.secret" >> .gitignore
```

**Riziko:** 🟢 Nízké - soubory nejsou v kódu
**Test:** `git status` - soubor už není tracked

---

### 1.2 Testovací a debug soubory

#### Odstranit:
```bash
rm test-database.js
rm test-wms-cache.sh
rm backend/test_tile.png
rm backend/curl_log.txt
rm backend/proxy_response.dat
rm backend/caps.xml
rm backend/get-pip.py
```

**Riziko:** 🟢 Nízké - soubory jen pro lokální debug  
**Test:** `npm run build` - build musí projít

---

### 1.3 Přesunout skripty
```bash
mv check-services.sh backend/scripts/
```

**Riziko:** 🟢 Nízké - jen reorganizace  
**Test:** Spustit skript z nové lokace

---

### 1.4 Frontend cleanup - Nepoužívané soubory

#### Zkontrolovat a odstranit:
```bash
# Nejprve ověřit že nejsou importovány
grep -r "from.*App.tsx" frontend/src/
grep -r "App.css" frontend/src/

# Pokud nic nenajde → bezpečně smazat:
rm frontend/src/App.tsx
rm frontend/src/App.css
rm frontend/src/components/Header.tsx
rm frontend/src/assets/react.svg
rmdir frontend/src/layers/
```

**Riziko:** 🟡 Střední - zkontrolovat importy!  
**Test:** 
- `cd frontend && npm run build`
- Aplikace se spustí a funguje

---

### 1.5 Prisma duplicita

#### Analýza:
Projekt má dvě kopie Prisma:
- `/prisma/` (root)
- `/backend/prisma/`

#### Rozhodnout:
```bash
# Zkontrolovat které se používá:
grep -r "prisma/schema" .
cat backend/package.json | grep prisma
cat package.json | grep prisma
```

#### Akce:
- Pokud se používá jen root `/prisma/` → smazat `/backend/prisma/`
- **NEMAZAT migrations!** → přesunout do `/prisma/migrations/`

**Riziko:** 🔴 VYSOKÉ - může ovlivnit databázi!  
**Test:** 
- `npx prisma generate`
- `npm run db:studio` - ověřit připojení

---

## 🔧 FÁZE 2: Oprava ESLint (2-3 hodiny)

### 2.1 Service Worker config (Bezpečné)

**Změna:** `frontend/eslint.config.js`

```javascript
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  
  // Service Worker config
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: {
        ...globals.serviceworker
      }
    }
  },
  
  // TypeScript/React config
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Allow _ prefix for intentionally unused vars
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    },
  },
)
```

**Riziko:** 🟢 Nízké - jen konfigurace  
**Test:** `npm run lint` - SW chyby zmizí

---

### 2.2 Kosmetické opravy (Bezpečné)

#### Extra středník
**Soubor:** `frontend/src/components/ProfileChart.tsx:112`

```typescript
// Před:
});

// Po:
})
```

#### Nepoužitá catch proměnná
**Soubor:** `frontend/src/components/TopFeatureRequests.tsx:37`

```typescript
// Před:
} catch (err) {
  console.error('Failed to fetch top features:', err);
}

// Po (pokud err není potřeba jinak):
} catch (error) {
  console.error('Failed to fetch top features:', error);
}
```

**Riziko:** 🟢 Nízké - čistě kosmetické  
**Test:** `npm run lint`, spustit aplikaci

---

### 2.3 Map style typy (Střední riziko)

**Soubor:** `frontend/src/components/SwipeMap.tsx`

```typescript
// Před (3 místa):
mapStyle={MAP_STYLES[mapStyleKey].style as any}

// Po:
mapStyle={MAP_STYLES[mapStyleKey].style as string}
```

**Riziko:** 🟡 Střední - může odhalit type problémy  
**Test:** 
- ✅ Přepnout mezi všemi styly (SATELLITE, DARK, STREET)
- ✅ Ověřit terrain rendering
- ✅ Zkontrolovat console - žádné warnings

---

### 2.4 Další `any` typy (Individuální)

**Postup:**
1. Najít všechny `any` typy: `grep -n "as any\|: any" frontend/src --include="*.ts*"`
2. Pro každý:
   - Zkontrolovat kontext
   - Určit správný typ
   - Otestovat změnu

**Soubory:**
- `AuthHeader.tsx:49`
- `Header.tsx:41`  
- `MobileMapHeader.tsx:63`
- atd.

**Riziko:** 🟡 Střední až 🔴 Vysoké  
**Doporučení:** Řešit až po předchozích fázích

---

### 2.5 Non-null assertion (KRITICKÉ!)

**Soubor:** `frontend/src/hooks/useProfile.ts:29`

```typescript
// Před (NEBEZPEČNÉ!):
email: auth0User?.email!,

// Po (BEZPEČNÉ):
if (!auth0User?.email) {
  throw new Error('User email is required for profile creation');
}

return await createProfile({
  email: auth0User.email,
  nickname: auth0User.nickname,
  avatarUrl: auth0User.picture,
});
```

**Riziko:** 🔴 VYSOKÉ - může crashnout při loginu!  
**Test:** 
- ✅ Login s novým uživatelem
- ✅ Login s existujícím uživatelem  
- ✅ Zkontrolovat že profil se vytváří
- ✅ Zkontrolovat error handling

---

### 2.6 React Hooks dependencies (KOMPLEXNÍ!)

**Strategie: Trojfázový přístup**

#### Fáze 2.6.1: Dočasné řešení
Přidat `eslint-disable` s dokumentací:

```typescript
useEffect(() => {
  fetchEquipment();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [autoFetch]); // Intentionally only on autoFetch change - fetchEquipment is stable
```

#### Fáze 2.6.2: useCallback refactoring
**Soubory k úpravě:**
- `hooks/useEquipment.ts`
- `hooks/useFindings.ts`
- `hooks/useProfile.ts`
- `hooks/useFeatureRequests.ts`

**Příklad:**
```typescript
const fetchEquipment = useCallback(async () => {
  if (!user) return;
  setLoading(true);
  try {
    // ... fetch logic
  } catch (error) {
    setError(error);
  } finally {
    setLoading(false);
  }
}, [user]); // dependencies funkce!

useEffect(() => {
  if (autoFetch) {
    fetchEquipment();
  }
}, [autoFetch, fetchEquipment]); // Nyní BEZPEČNÉ
```

#### Fáze 2.6.3: Odstranit eslint-disable

**Riziko:** 🔴 VELMI VYSOKÉ!
- ⚠️ Může způsobit infinite loops
- ⚠️ Může změnit chování načítání dat
- ⚠️ Vyžaduje důkladné testování každého hooku

**Test:**
- ✅ Otevřít React DevTools
- ✅ Sledovat re-renders (Profiler)
- ✅ Zkontrolovat Network tab (počet requestů)
- 🔴 KRITICKÉ: Žádné infinite loops!
- ✅ Data se načítají správně

---

## 📚 FÁZE 3: Konsolidace dokumentace (30-60 min)

### 3.1 Vytvořit hlavní dokumenty

#### docs/SETUP_GUIDE.md
Sloučit:
- `LOCAL_DEV_GUIDE.md`
- `LOCALHOST_SETUP_SUMMARY.md`
- `ENV_SETUP.md`
- `QUICK_START.md`

#### docs/CHANGELOG.md
Sloučit:
- `CHANGELOG_LOCALHOST_FIX.md`
- `CHANGELOG-WMS-OPTIMIZATION.md`
- `WMS-OPTIMIZATION-DEPLOYMENT.md`

#### docs/DATABASE.md
Sloučit:
- `README_DATABASE.md`
- `DATABASE_SETUP.md`

**Riziko:** 🟢 Nízké - jen dokumentace  
**Test:** Projít dokumenty a ověřit že jsou kompletní

---

### 3.2 Archivovat debug dokumenty

```bash
mkdir -p docs/archive
mv docs/DEBUG-DMR5G-PREPINAC.md docs/archive/
mv docs/FIX-DMR5G-TOGGLE.md docs/archive/
mv docs/FIX-TERRAIN-QUALITY.md docs/archive/
mv docs/FIX-TILE-LOADING.md docs/archive/
mv docs/PREPINAC-DMR5G.md docs/archive/
```

**Riziko:** 🟢 Nízké  
**Test:** Žádný

---

### 3.3 Reorganizovat plány

```bash
mkdir -p docs/planning
mv GAMIFICATION_SYSTEM.md docs/planning/
mv UI_DESIGN_PLAN.md docs/planning/
mv PERFORMANCE_OPTIMIZATIONS.md docs/planning/
mv VERCEL_OPTIMIZATION_ANALYSIS.md docs/planning/
mv IMPLEMENTATION_SUMMARY.md docs/planning/
mv SEO_SECURITY_IMPLEMENTATION.md docs/planning/
```

**Riziko:** 🟢 Nízké  
**Test:** Žádný

---

### 3.4 Aktualizovat README.md

Přidat odkazy na novou strukturu:
```markdown
## 📚 Dokumentace

- [Hlavní README](README.md)
- [Setup Guide](docs/SETUP_GUIDE.md)
- [Database Guide](docs/DATABASE.md)
- [Auth0 Setup](AUTH0_SETUP.md)
- [Changelog](docs/CHANGELOG.md)
- [API Testing](API_TESTING.md)
- [Planning dokumenty](docs/planning/)
- [Archiv](docs/archive/)
```

---

## ✅ FÁZE 4: Finální ověření (30 min)

### 4.1 Build test
```bash
cd frontend
npm run build
npm run preview
```

### 4.2 Lint test
```bash
npm run lint
# Očekáváno: 0 errors (nebo jasně zdokumentované výjimky)
```

### 4.3 TypeScript test
```bash
npx tsc --noEmit
# Očekáváno: No errors
```

### 4.4 Funkční test
- [ ] Login/logout
- [ ] Navigace po mapě
- [ ] Přepínání stylů map
- [ ] Terrain controls
- [ ] Přidání nálezu
- [ ] Zobrazení profilu
- [ ] Equipment management
- [ ] Feature requests

### 4.5 Performance test
- [ ] Otevřít React DevTools Profiler
- [ ] Zkontrolovat re-renders
- [ ] Zkontrolovat Network tab
- [ ] Žádné infinite loops
- [ ] Přiměřený počet API calls

---

## 📊 Očekávané výsledky

### Před čištěním:
- ~200 souborů
- 45 ESLint problémů
- Duplicitní dokumentace
- Testovací soubory v repozitáři
- OAuth secrets v gitu

### Po čištění:
- ~180 souborů (-20)
- 0 ESLint problémů (-45)
- Konsolidovaná dokumentace
- Čistý git repozitář
- **100% funkčnost zachována**

---

## ⚠️ KRITICKÁ PRAVIDLA

### ❌ ZASTAVIT A PTÁT SE pokud:
1. Build failuje
2. Aplikace crashuje
3. Objeví se nekonečná smyčka
4. Data se nenačítají
5. Cokoli vypadá podezřele

### ✅ POKRAČOVAT pokud:
1. Testy procházejí
2. Lint warnings klesají
3. Aplikace funguje stejně
4. Git commits jsou čisté

---

## 🚀 Exekuce

**Připraveno k exekuci:** ANO  
**Čas exekuce:** 4-6 hodin  
**Prerekvizity:**
- ✅ Git backup vytvořen
- ✅ Analýza rizik přečtena
- ✅ Plán schválen

**Začít s:**
```bash
# Fáze 0
git checkout -b code-cleanup
git add -A
git commit -m "Checkpoint před čištěním"
```

**Pokračovat podle fází 1-4 v tomto dokumentu.**

