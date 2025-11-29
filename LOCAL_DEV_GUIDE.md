# 🚀 Průvodce lokálním vývojem

Tento návod popisuje, jak spustit aplikaci lokálně pro testování s produkční databází.

## 📋 Požadavky

- Node.js 18+ (pro frontend a proxy)
- Python 3.13+ (pro backend - volitelné)
- npm 9+

## ⚙️ Konfigurace

### 1. Environment proměnné

Zkontrolujte, že máte správně nastavené tyto soubory:

#### `frontend/.env`
```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
VITE_AUTH0_CLIENT_ID=nmaeKAn8ceXcFeowxRu4fSrlYezSw70R
VITE_AUTH0_AUDIENCE=https://api.earcheo.cz
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ

# API URL (leave empty for localhost proxy)
VITE_API_URL=
```

#### `.env` (root)
```env
# Neon Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Auth0
AUTH0_DOMAIN="dev-jsfkqesvxjhvsnkd.us.auth0.com"
AUTH0_AUDIENCE="https://api.earcheo.cz"
AUTH0_ISSUER="https://dev-jsfkqesvxjhvsnkd.us.auth0.com/"

# Vercel Blob
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## 🚀 Spuštění

### Varianta A: Kompletní stack (doporučeno)

Spusťte všechny služby najednou:

```bash
npm run dev
```

Tento příkaz spustí:
- Node.js proxy server (port 3010)
- Vite dev server (port 5173)

### Varianta B: Manuální spuštění (pro debugging)

#### 1. Node.js Proxy Server (port 3010)
```bash
# Terminál 1
cd backend
node index.js
```

#### 2. Vite Dev Server (port 5173)
```bash
# Terminál 2
cd frontend
npm run dev
```

#### 3. Python Backend (port 8000) - VOLITELNÉ
```bash
# Terminál 3 - pouze pokud potřebujete NDVI analýzy
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 🌐 Přístup

Po spuštění otevřete v prohlížeči:

**http://localhost:5173**

## 🔄 Jak to funguje

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

### Klíčové body:

1. **Frontend (Vite)** běží na portu **5173**
2. **Node.js proxy** běží na portu **3010** a řeší:
   - CORS proxy pro ČÚZK WMS servery
   - Přeposílání databázových API requestů na produkci (`https://earcheo.cz`)
3. **Python backend** (volitelný) na portu **8000** pro NDVI analýzy

## 🔧 Troubleshooting

### Port už používán

Pokud je nějaký port obsazený, ukončete proces:

```bash
# Zjistit PID procesu na portu
lsof -i :5173  # nebo :3010

# Ukončit proces
kill -9 <PID>
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

## 📝 Poznámky

- **Databáze**: Lokální development používá produkční Neon databázi (read/write)
- **Auth0**: Sdílená konfigurace s produkcí
- **Vercel Blob**: Sdílené úložiště s produkcí
- **WMS cache**: Není v local devu aktivní (pouze na Vercelu)

⚠️ **Upozornění**: Lokální změny v databázi se projeví i na produkci!

## 🎯 Testování

Lokální development umožňuje testovat:
- ✅ Celý frontend včetně Auth0 přihlášení
- ✅ CRUD operace s nálezem, vybavením, feature requesty
- ✅ Nahrávání obrázků do Vercel Blob
- ✅ WMS mapy (LIDAR, ortofoto, historické mapy)
- ✅ Všechny API endpointy (proxované na produkci)

Co lokální development **neemuluje**:
- ❌ Vercel Edge Functions (používá se Node.js Express místo toho)
- ❌ Vercel serverless routing
- ❌ Production build optimalizace

Pro testování production buildu použijte:
```bash
cd frontend
npm run build
npm run preview
```


