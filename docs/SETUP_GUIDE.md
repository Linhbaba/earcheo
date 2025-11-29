# 🚀 Kompletní průvodce nastavením - eArcheo

Tento dokument sloučuje všechny setup guides do jednoho komplexního průvodce.

---

## 📋 Obsah

1. [Rychlý start (10 minut)](#-rychlý-start-10-minut)
2. [Environment proměnné](#-environment-proměnné)
3. [Lokální development](#-lokální-development)
4. [Troubleshooting](#-troubleshooting)

---

## ⚡ Rychlý start (10 minut)

### 1. Vytvořte databázi (3 minuty)

**Doporučeno: Neon (zdarma + connection pooling)**

1. Jděte na https://neon.tech
2. Sign up / Login
3. Create New Project:
   - Name: `earcheo`
   - Region: `Europe (Frankfurt)`
4. Zkopírujte connection stringy:
   ```
   DATABASE_URL (pooled): postgresql://...?pgbouncer=true
   DIRECT_URL (direct): postgresql://...
   ```

### 2. Vytvořte Auth0 API (2 minuty)

1. Jděte na https://manage.auth0.com/
2. Applications → APIs → Create API
3. Vyplňte:
   - Name: `Earcheo API`
   - Identifier: `https://api.earcheo.cz`
   - Signing Algorithm: `RS256`
4. Save

### 3. Vytvořte Auth0 Application (2 minuty)

1. V Auth0 Dashboard: Applications → Create Application
2. Vytvořte novou aplikaci typu "Single Page Application"
3. Nakonfigurujte:
   - **Allowed Callback URLs**: `http://localhost:5173, https://earcheo.cz`
   - **Allowed Logout URLs**: `http://localhost:5173, https://earcheo.cz`
   - **Allowed Web Origins**: `http://localhost:5173, https://earcheo.cz`
4. Zkopírujte Domain a Client ID

### 4. Vytvořte Vercel Blob Storage (1 minuta)

1. Jděte na https://vercel.com/dashboard
2. Vyberte projekt `earcheo`
3. Storage → Create → Blob
4. Name: `earcheo-images`
5. Token se automaticky přidá do ENV variables

### 5. Nastavte ENV variables (2 minuty)

#### Root `.env`:
```bash
# Z Neon dashboard
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."

# Auth0
AUTH0_DOMAIN="dev-jsfkqesvxjhvsnkd.us.auth0.com"
AUTH0_AUDIENCE="https://api.earcheo.cz"
AUTH0_ISSUER="https://dev-jsfkqesvxjhvsnkd.us.auth0.com/"

# Z Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

#### Frontend `frontend/.env`:
```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
VITE_AUTH0_CLIENT_ID=nmaeKAn8ceXcFeowxRu4fSrlYezSw70R
VITE_AUTH0_AUDIENCE=https://api.earcheo.cz
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ

# API URL (leave empty for localhost proxy)
VITE_API_URL=
```

### 6. Spusťte migrations (1 minuta)

```bash
# Generovat Prisma Client
npm run db:generate

# Spustit migrations
npm run db:migrate
```

Potvrďte název migrace (např. `init`).

---

## 🌐 Environment proměnné

### Veřejné proměnné (Frontend)

Všechny proměnné s prefixem `VITE_` jsou veřejné a dostupné v prohlížeči:

- `VITE_AUTH0_DOMAIN` - Auth0 tenant domain
- `VITE_AUTH0_CLIENT_ID` - Auth0 application client ID
- `VITE_AUTH0_AUDIENCE` - Auth0 API identifier
- `VITE_MAPBOX_TOKEN` - Mapbox access token pro mapy
- `VITE_API_URL` - API base URL (prázdné pro localhost proxy)

⚠️ **Nikdy neukládejte citlivé údaje (API keys, secrets) do proměnných s prefixem `VITE_`**

### Serverové proměnné (Backend/API)

Tyto proměnné jsou dostupné pouze na serveru:

- `DATABASE_URL` - PostgreSQL connection string (pooled)
- `DIRECT_URL` - Direct PostgreSQL connection (pro migrations)
- `AUTH0_DOMAIN` - Pro ověřování JWT tokenů
- `AUTH0_AUDIENCE` - Pro validaci audience
- `AUTH0_ISSUER` - Pro validaci issuera
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token

### Vercel Production ENV

V Vercel Dashboard (Settings → Environment Variables) nastavte všechny proměnné pro **Production**, **Preview** i **Development**.

---

## 🛠️ Lokální development

### Požadavky

- Node.js 18+ (pro frontend a proxy)
- Python 3.13+ (pro backend - volitelné)
- npm 9+

### Spuštění

#### Varianta A: Kompletní stack (doporučeno)

```bash
npm run dev
```

Tento příkaz spustí:
- Node.js proxy server (port 3010)
- Vite dev server (port 5173)

#### Varianta B: Manuální spuštění (pro debugging)

**Terminál 1 - Node.js Proxy Server (port 3010):**
```bash
cd backend
node index.js
```

**Terminál 2 - Vite Dev Server (port 5173):**
```bash
cd frontend
npm run dev
```

**Terminál 3 - Python Backend (port 8000) - VOLITELNÉ:**
```bash
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Přístup k aplikaci

Po spuštění otevřete v prohlížeči:

**http://localhost:5173**

### Jak to funguje

```
┌─────────────────┐
│   Browser       │
│ localhost:5173  │
└────────┬────────┘
         │
         │ HTTP requests
         │
┌────────▼────────┐
│  Vite Dev       │
│  Server :5173   │
└────────┬────────┘
         │
         │ /api/* requests proxied
         │
┌────────▼────────┐
│  Node.js Proxy  │
│  Server :3010   │
└────────┬────────┘
         │
         │ WMS, ortofoto, history requests
         │
         ├─────────────────┬──────────────────┐
         │                 │                  │
┌────────▼────────┐ ┌─────▼──────┐ ┌────────▼────────┐
│  ČÚZK WMS       │ │ Produkční  │ │  Python Backend │
│  Server         │ │ API        │ │  :8000          │
│  (external)     │ │ earcheo.cz │ │  (volitelné)    │
└─────────────────┘ └────────────┘ └─────────────────┘
```

### Klíčové body

1. **Frontend (Vite)** běží na portu **5173**
2. **Node.js proxy** běží na portu **3010** a řeší:
   - CORS proxy pro ČÚZK WMS servery
   - Přeposílání databázových API requestů na produkci (`https://earcheo.cz`)
3. **Python backend** (volitelný) na portu **8000** pro NDVI analýzy

### Co lokální development testuje

✅ Lokální development umožňuje testovat:
- Celý frontend včetně Auth0 přihlášení
- CRUD operace s nálezem, vybavením, feature requesty
- Nahrávání obrázků do Vercel Blob
- WMS mapy (LIDAR, ortofoto, historické mapy)
- Všechny API endpointy (proxované na produkci)

❌ Co lokální development **neemuluje**:
- Vercel Edge Functions (používá se Node.js Express místo toho)
- Vercel serverless routing
- Production build optimalizace

### Production build test

Pro testování production buildu použijte:

```bash
cd frontend
npm run build
npm run preview
```

---

## 🔧 Troubleshooting

### Port už používán

Pokud je nějaký port obsazený, ukončete proces:

```bash
# Zjistit PID procesu na portu
lsof -i :5173  # nebo :3010

# Ukončit proces
kill -9 <PID>
```

Nebo použijte pomocný skript:

```bash
./backend/scripts/check-services.sh
```

### Frontend nevidí Auth0 token

1. Zkontrolujte `frontend/.env` - musí obsahovat `VITE_AUTH0_AUDIENCE`
2. Restartujte Vite dev server (Ctrl+C a znovu `npm run dev`)
3. Vymažte cookies a localStorage v prohlížeči

### API requesty selhávají

1. Zkontrolujte, že Node.js proxy běží na portu 3010
2. Zkontrolujte konzoli proxy serveru pro chyby
3. Ověřte, že `frontend/vite.config.ts` má správné proxy nastavení:
   ```typescript
   proxy: {
     '/api': {
       target: 'http://localhost:3010',
       changeOrigin: true,
       secure: false,
     }
   }
   ```

### Změny v .env se neprojevují

Environment proměnné s prefixem `VITE_` se načítají pouze při startu dev serveru.
Po změně `.env` souboru **vždy restartujte Vite**:

```bash
# Ve frontendu
Ctrl+C
npm run dev
```

### "prisma: command not found"

```bash
npm install
```

### "Can't reach database server"

- Zkontrolujte `DATABASE_URL` v `.env`
- Zkontrolujte, že Neon databáze běží (měla by vždy)

### "Invalid token" při API volání

- Auth0 API vytvořené?
- `AUTH0_AUDIENCE` přesně odpovídá API identifieru?
- Token není expirovaný? (platnost 24h)

### "Module not found: @prisma/client"

```bash
npm run db:generate
```

### Cold start trvá 20+ sekund

- Normální při prvním requestu
- Neon pooling zkracuje na ~2s
- Pro produkční použití zvažte Prisma Accelerate ($25/měsíc)

---

## 🎯 Užitečné příkazy

### Database

```bash
npm run db:generate         # Generovat Prisma Client
npm run db:migrate          # Vytvořit a spustit migrations
npm run db:migrate:deploy   # Spustit migrations v production
npm run db:studio           # Otevřít Prisma Studio (GUI pro DB)
```

### Development

```bash
npm run dev                 # Spustit frontend + backend proxy
npm run vercel:dev          # Spustit Vercel dev server
./backend/scripts/check-services.sh  # Kontrola běžících služeb
```

### Vercel

```bash
vercel                      # Deploy do preview
vercel --prod               # Deploy do production
vercel logs                 # Zobrazit logy
vercel env ls               # Seznam ENV variables
```

---

## 📝 Důležité poznámky

- **Databáze**: Lokální development používá produkční Neon databázi (read/write)
- **Auth0**: Sdílená konfigurace s produkcí
- **Vercel Blob**: Sdílené úložiště s produkcí
- **WMS cache**: Není v local devu aktivní (pouze na Vercelu)

⚠️ **Upozornění**: Lokální změny v databázi se projeví i na produkci!

---

## 📋 Setup Checklist

- [ ] Neon databáze vytvořena
- [ ] Auth0 API vytvořené (`https://api.earcheo.cz`)
- [ ] Auth0 SPA application vytvořená
- [ ] Vercel Blob storage vytvořen
- [ ] Root `.env` soubor vytvořen
- [ ] Frontend `.env` soubor vytvořen
- [ ] `npm run db:generate` spuštěno
- [ ] `npm run db:migrate` spuštěno
- [ ] ENV variables nastaveny ve Vercel Dashboard
- [ ] Production migrations spuštěny
- [ ] Testováno lokálně přes `npm run dev`
- [ ] Deployováno na Vercel

---

## 📚 Související dokumentace

- **DATABASE.md** - Detailní informace o databázi
- **API_TESTING.md** - Testování všech API endpointů
- **AUTH0_SETUP.md** - Detailní Auth0 konfigurace
- **docs/planning/IMPLEMENTATION_SUMMARY.md** - Co bylo implementováno

---

**Datum aktualizace:** 29.11.2025  
**Status:** ✅ Lokální development je plně funkční a odpovídá produkci

