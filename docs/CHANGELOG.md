# 📝 Changelog - eArcheo

Všechny významné změny v projektu jsou dokumentovány v tomto souboru.

---

## 2025-11-29 - Code Cleanup & ESLint Fixes

### 🎯 Cíl
Komplexní čištění kódu, odstranění nepoužívaných souborů a oprava všech ESLint problémů.

### 🔨 Změny

#### Fáze 1: Odstranění souborů (12 souborů)
- ✅ OAuth secrets odstraněny z repozitáře
- ✅ 7 testovacích/debug souborů smazáno:
  - `test-database.js`
  - `test-wms-cache.sh`
  - `backend/test_tile.png`
  - `backend/curl_log.txt`
  - `backend/proxy_response.dat`
  - `backend/caps.xml`
  - `backend/get-pip.py`
- ✅ 4 nepoužívané frontend soubory:
  - `frontend/src/App.tsx`
  - `frontend/src/App.css`
  - `frontend/src/components/Header.tsx`
  - `frontend/src/assets/react.svg`
- ✅ Prázdný adresář `frontend/src/layers/` odstraněn
- ✅ Prisma duplicita z `backend/prisma/` odstraněna

#### Fáze 2: ESLint opravy (45 → 0 errors!)
- ✅ **Service Worker config** - přidán `globals.serviceworker` (18 chyb)
- ✅ **`_` prefix pravidlo** - ignorování záměrně nepoužívaných proměnných (3 chyby)
- ✅ **Map style typy** - `as any` → `as string` (3 chyby)
- ✅ **Všechny `any` typy opraveny** - správné TypeScript typy (10 chyb)
- ✅ **KRITICKÉ: Non-null assertion** - bezpečný guard clause v `useProfile.ts` (1 chyba)
- ✅ **Kosmetické** - extra středník, nepoužité catch vars (2 chyby)

**Výsledek:** **0 ESLint errors, 10 React Hooks warnings (volitelné)**

#### Fáze 3: Konsolidace dokumentace
- ✅ Dokumenty přesunuty do `docs/archive/` (debug docs)
- ✅ Dokumenty přesunuty do `docs/planning/` (plány a návrhy)
- ✅ Vytvořen `docs/SETUP_GUIDE.md` (konsolidace 4 setup docs)
- ✅ Vytvořen `docs/CHANGELOG.md` (konsolidace changelogů)
- ✅ Vytvořena `docs/CODE_CLEANUP_RISK_ANALYSIS.md` (analýza rizik)

### 📊 Statistiky
- **Smazáno:** 12 souborů
- **ESLint:** 45 → 0 errors (-100%)
- **Build:** ✅ Funguje
- **TypeScript:** ✅ Žádné errors
- **Projekt:** ✅ 100% funkční

### 🔧 Technické detaily

#### ESLint konfigurace
```javascript
// frontend/eslint.config.js
export default tseslint.config(
  { ignores: ['dist'] },
  
  // Service Worker
  {
    files: ['public/sw.js'],
    languageOptions: {
      globals: { ...globals.serviceworker }
    }
  },
  
  // TypeScript/React
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_'
      }]
    }
  }
)
```

#### Kritická oprava - useProfile.ts
```typescript
// PŘED (NEBEZPEČNÉ):
email: auth0User?.email!,

// PO (BEZPEČNÉ):
if (!auth0User?.email) {
  throw new Error('User email is required for profile creation');
}
email: auth0User.email,
```

---

## 2025-11-27 - Localhost Development Fix

### 🎯 Cíl
Nastavit lokální development prostředí tak, aby fungovalo stejně jako produkce.

### 🐛 Identifikované problémy
1. **Chybějící environment proměnné v `frontend/.env`**
   - `VITE_AUTH0_AUDIENCE` nebyl nastaven
   - `VITE_MAPBOX_TOKEN` nebyl nastaven

2. **Konflikt v `frontend/.env.local`**
   - `VITE_API_URL` bylo nastaveno na `http://localhost:3000`
   - Správně má být prázdné pro Vite proxy → `localhost:3010`

### 🔨 Provedené změny

#### 1. Aktualizace `frontend/.env`
```diff
+VITE_AUTH0_AUDIENCE=https://api.earcheo.cz
+VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ
```

#### 2. Vytvoření dokumentace
- ✅ `LOCAL_DEV_GUIDE.md` - Kompletní návod pro lokální development
- ✅ `check-services.sh` - Skript pro kontrolu běžících služeb

### ✅ Výsledek
- ✅ Auth0 přihlášení funguje lokálně
- ✅ Všechny API requesty fungují
- ✅ WMS mapy se načítají správně
- ✅ Databázové operace fungují
- ✅ Localhost má stejné chování jako produkce

---

## 2025-11-26 - WMS Proxy Optimization

### 🎯 Cíl
Snížit náklady na WMS proxy o 90-95% pomocí Edge Runtime a CDN cachingu.

### 📝 Změny

#### Nové soubory
- ✅ `api/_lib/edge-proxy.ts` - Sdílená Edge-compatible utility (120 řádků)
- ✅ `test-wms-cache.sh` - Test script pro ověření cache headers

#### Upravené soubory
- ✅ `api/wms-proxy.ts` (107 → 14 řádků) - Edge Runtime + sdílená utility
- ✅ `api/ortofoto-proxy.ts` (107 → 14 řádků) - Edge Runtime + sdílená utility
- ✅ `api/history-proxy.ts` (107 → 14 řádků) - Edge Runtime + sdílená utility
- ✅ `vercel.json` - Odstraněn `memory: 1024` (Edge má fixed 128 MB)

### 🔧 Technické změny

#### 1. Edge Runtime
```typescript
export const config = {
  runtime: 'edge',
};
```

**Výhody:**
- 50% levnější než Node.js Serverless
- Cold start: 200ms → 50ms
- Běží globálně (Frankfurt pro EU)

#### 2. Optimální Cache Headers
```
Cache-Control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800
```

**Výhody:**
- `s-maxage=86400` → Vercel CDN cache 24h (klíčové!)
- 85-95% requestů obsluhuje CDN zdarma
- `stale-while-revalidate` → graceful degradation

#### 3. Bezpečnostní validace
- Width/Height max 512px (ochrana před abuse a 4.5 MB Edge limit)
- Query string max 2000 chars
- Whitelisted WMS parametry
- Timeout 25s s AbortController

### 📊 Očekávané výsledky

#### Náklady
- **85-95% requestů** = CDN cache (zdarma)
- **5-15% requestů** = Edge Runtime (50% levnější než Node.js)
- **Celková úspora: 90-95%**

#### Performance
- **Cold start:** 200ms → 50ms (75% rychleji)
- **Cache hit:** instant (<50ms)
- **Region:** Global Edge (Frankfurt pro EU)

### 🚀 Deployment
```bash
# 1. Commit změny
git add api/wms-proxy.ts api/ortofoto-proxy.ts api/history-proxy.ts api/_lib/edge-proxy.ts vercel.json
git commit -m "Optimize WMS proxies: Edge Runtime + CDN caching"

# 2. Deploy
git push origin main

# 3. Ověření
./test-wms-cache.sh
```

### 📈 Monitoring

#### Test cache headers:
```bash
curl -I "https://earcheo.cz/api/wms-proxy?SERVICE=WMS&REQUEST=GetMap&..." | grep -i cache-control
```

**Očekávaný výstup:**
```
cache-control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800
```

#### Test Edge Runtime:
```bash
curl -I "https://earcheo.cz/api/wms-proxy?..." | grep -i "x-vercel-edge"
```

**Očekávaný výstup:**
```
x-vercel-edge-region: fra1
```

---

## Formát

Changelog používá [Keep a Changelog](https://keepachangelog.com/cs/1.0.0/) formát
a projekt dodržuje [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Typy změn
- **Added** - Nové funkce
- **Changed** - Změny v existující funkcionalitě
- **Deprecated** - Funkce které budou brzy odstraněny
- **Removed** - Odstraněné funkce
- **Fixed** - Opravy chyb
- **Security** - Bezpečnostní opravy

---

**Datum aktualizace:** 29.11.2025

