# 🎯 Souhrn nastavení lokálního prostředí

## Co bylo provedeno

### 1. ✅ Aktualizace `frontend/.env`

Přidány chybějící environment proměnné:
- `VITE_AUTH0_AUDIENCE=https://api.earcheo.cz`
- `VITE_MAPBOX_TOKEN=pk.eyJ1IjoiZ2FuZGFsZi1wcmFndWUiLCJhIjoiY21pY3htMjc5MDBhcTJsc2JsaGozcWFicCJ9.uCxLiQ2kPfDdSsZmgUHsMQ`

### 2. ✅ Restart Vite dev serveru

Po aktualizaci `.env` byl restartován Vite dev server, aby se načetly nové proměnné.

### 3. ✅ Vytvořeny pomocné skripty

#### `LOCAL_DEV_GUIDE.md`
Kompletní návod pro lokální development včetně:
- Požadavků
- Konfigurace environment proměnných
- Spouštěcích příkazů
- Diagramu architektury
- Troubleshooting

#### `check-services.sh`
Skript pro kontrolu běžících služeb:
```bash
./check-services.sh
```

Kontroluje:
- ✅ Node.js proxy (port 3010)
- ✅ Vite dev server (port 5173)
- ✅ Python backend (port 8000) - volitelné
- ✅ Dostupnost frontendu
- ✅ Dostupnost API proxy
- ✅ Environment proměnné

## 🚀 Jak spustit aplikaci

### Jednoduchá varianta:
```bash
npm run dev
```

### Manuální varianta (pro debugging):
```bash
# Terminál 1: Node.js proxy
cd backend && node index.js

# Terminál 2: Frontend
cd frontend && npm run dev
```

## 🌐 Přístup k aplikaci

**Frontend:** http://localhost:5173

## ✅ Co nyní funguje na localhostu

1. **Auth0 přihlášení** - plně funkční s produkční konfigurací
2. **Databázové operace** - přes produkční Neon databázi
3. **Vercel Blob** - nahrávání a načítání obrázků
4. **WMS mapy** - LIDAR, ortofoto, historické mapy
5. **Všechny API endpointy** - proxované přes Node.js server

## 🔄 Architektura

```
Browser (localhost:5173)
    ↓
Vite Dev Server (:5173)
    ↓ /api/* proxy
Node.js Proxy (:3010)
    ↓
    ├─→ ČÚZK WMS (external)
    ├─→ Production API (earcheo.cz)
    └─→ Python Backend (:8000, volitelné)
```

## ⚠️ Důležité

- Lokální development používá **produkční databázi** (Neon)
- Změny v databázi se projeví i na produkci!
- Po změně `.env` vždy restartujte Vite dev server

## 🧪 Testování

Aplikace na localhostu má nyní **stejné chování jako na produkci**:
- ✅ Auth0 autentizace
- ✅ Plný přístup k databázi
- ✅ Ukládání/načítání nálezů
- ✅ Nahrávání fotek
- ✅ Feature requests s hlasováním
- ✅ Všechny mapové vrstvy

Pro testování prostě otevřete **http://localhost:5173** a používejte aplikaci stejně jako na produkci!

---

**Datum:** 27.11.2025
**Status:** ✅ Lokální development je plně funkční a odpovídá produkci

