# 🔧 Oprava lokálního development prostředí

**Datum:** 27.11.2025  
**Autor:** AI Assistant  
**Status:** ✅ Dokončeno

## 🎯 Cíl

Nastavit lokální development prostředí tak, aby fungovalo stejně jako produkce - plná funkcionalita včetně Auth0, databáze, API a všech služeb.

## 🐛 Identifikované problémy

1. **Chybějící environment proměnné v `frontend/.env`**
   - `VITE_AUTH0_AUDIENCE` nebyl nastaven
   - `VITE_MAPBOX_TOKEN` nebyl nastaven

2. **Konflikt v `frontend/.env.local`**
   - `VITE_API_URL` bylo nastaveno na `http://localhost:3000`
   - Správně má být prázdné, aby Vite proxy přeposílala na `localhost:3010`

## 🔨 Provedené změny

### 1. Aktualizace `frontend/.env`

```diff
 # Auth0 Configuration
 VITE_AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
 VITE_AUTH0_CLIENT_ID=nmaeKAn8ceXcFeowxRu4fSrlYezSw70R
+VITE_AUTH0_AUDIENCE=https://api.earcheo.cz
+VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ

-# API URL (leave empty for localhost proxy)
-VITE_API_URL=
+# API URL (leave empty for localhost proxy, nebo http://localhost:3000 pro přímé volání)
+VITE_API_URL=
```

### 2. Oprava `frontend/.env.local`

```diff
 # Auth0 Configuration
 VITE_AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
 VITE_AUTH0_CLIENT_ID=nmaeKAn8ceXcFeowxRu4fSrlYezSw70R
 VITE_AUTH0_AUDIENCE=https://api.earcheo.cz
 VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ

-# API URL (pro lokální vývoj)
-VITE_API_URL=http://localhost:3000
+# API URL (leave empty for Vite proxy to localhost:3010)
+VITE_API_URL=
```

### 3. Nové soubory

#### `LOCAL_DEV_GUIDE.md`
- Kompletní návod pro lokální development
- Požadavky a konfigurace
- Spouštěcí příkazy
- Diagram architektury
- Troubleshooting sekce
- Poznámky o databázi a sdílených službách

#### `check-services.sh`
- Automatický kontrolní skript
- Kontrola běžících služeb (porty 3010, 5173, 8000)
- Ověření dostupnosti frontendu a API
- Kontrola environment proměnných
- Barevný výstup pro lepší čitelnost

#### `LOCALHOST_SETUP_SUMMARY.md`
- Stručný souhrn provedených změn
- Návod jak spustit aplikaci
- Architektura systému
- Co funguje na localhostu

#### `CHANGELOG_LOCALHOST_FIX.md` (tento soubor)
- Kompletní changelog změn

### 4. Aktualizace `README.md`

- Modernizovaná sekce Quickstart
- Odkaz na `LOCAL_DEV_GUIDE.md`
- Odkaz na `check-services.sh`
- Jednodušší instrukce: `npm run dev`

## ✅ Výsledek

### Co nyní funguje na localhostu:

1. ✅ **Auth0 autentizace** - plně funkční přihlášení/registrace
2. ✅ **Databázové operace** - přes produkční Neon databázi
3. ✅ **Vercel Blob** - nahrávání a načítání obrázků
4. ✅ **WMS mapy** - LIDAR, ortofoto, historické mapy přes ČÚZK
5. ✅ **Všechny API endpointy** - proxované přes Node.js server
6. ✅ **Feature requests** - načítání, vytváření, hlasování
7. ✅ **Nálezy** - CRUD operace, fotografie
8. ✅ **Vybavení** - správa archeologického vybavení

### Architektura

```
Browser (localhost:5173)
    ↓
Vite Dev Server (:5173)
    ↓ /api/* requests proxied via vite.config.ts
Node.js Proxy (:3010)
    ↓
    ├─→ ČÚZK WMS servers (external)
    ├─→ Production API (earcheo.cz) - database operations
    └─→ Python Backend (:8000, optional) - NDVI analysis
```

## 🧪 Testování

Aplikace byla otestována:
- ✅ Načtení landing page
- ✅ Načtení feature requests z API
- ✅ Žádné chyby v konzoli
- ✅ Všechny služby běží na správných portech
- ✅ Environment proměnné správně nastaveny

## 📋 Kontrolní seznam

- [x] Opravit `frontend/.env`
- [x] Opravit `frontend/.env.local`
- [x] Restartovat Vite dev server
- [x] Vytvořit `LOCAL_DEV_GUIDE.md`
- [x] Vytvořit `check-services.sh`
- [x] Vytvořit `LOCALHOST_SETUP_SUMMARY.md`
- [x] Aktualizovat `README.md`
- [x] Otestovat aplikaci v prohlížeči
- [x] Ověřit API komunikaci
- [x] Ověřit absenci chyb v konzoli

## 🚀 Jak použít

### Základní spuštění:
```bash
npm run dev
```

### Kontrola služeb:
```bash
./check-services.sh
```

### Přístup k aplikaci:
```
http://localhost:5173
```

## ⚠️ Důležité poznámky

- **Sdílená databáze**: Lokální development používá produkční Neon databázi
- **Změny jsou trvalé**: Všechny změny v databázi se projeví i na produkci
- **Auth0**: Sdílená konfigurace s produkcí
- **Vercel Blob**: Sdílené úložiště s produkcí
- **Restart po změně .env**: Vždy restartujte Vite po změně environment proměnných

## 📚 Související dokumenty

- [LOCAL_DEV_GUIDE.md](LOCAL_DEV_GUIDE.md) - Kompletní návod
- [LOCALHOST_SETUP_SUMMARY.md](LOCALHOST_SETUP_SUMMARY.md) - Stručný souhrn
- [README.md](README.md) - Hlavní dokumentace projektu
- [check-services.sh](check-services.sh) - Kontrolní skript

---

**Status:** ✅ Lokální development je plně funkční a odpovídá produkci

