# Vercel Serverless Function Limits

## Aktuální stav

**Plán:** Hobby (zdarma)  
**Limit:** 12 Serverless Functions  
**Aktuálně použito:** 12/12

## Sloučené endpointy

Kvůli limitu 12 funkcí byly některé API endpointy sloučeny do jednoho souboru:

### 1. `api/credits.ts`

| Metoda | Popis | Původně |
|--------|-------|---------|
| GET | Získat zůstatek uživatele | `credits.ts` |
| POST | Rezervovat kredity | `credits.ts` |
| PUT | **Admin:** Přidělit kredity | `admin/credits.ts` |
| PATCH | **Admin:** Seznam uživatelů | `admin/credits.ts` |

### 2. `api/findings.ts`

| Query | Popis | Původně |
|-------|-------|---------|
| (default) | Autentizované operace | `findings.ts` |
| `?public=true` | Veřejné nálezy (bez auth) | `findings/public.ts` |

### 3. `api/findings/[id]/images.ts`

| Query | Popis | Původně |
|-------|-------|---------|
| (default) | Upload/delete obrázků | `images.ts` |
| `?action=analyze` | AI analýza | `findings/[id]/analyze.ts` |

## Proč to není ideální

1. **Porušení SRP** – jeden soubor má více zodpovědností
2. **Méně čitelné URL** – query parametry místo REST cest
3. **Těžší debugování** – větší soubory, více logiky
4. **Limit na hraně** – další funkce = další sloučení

## Dlouhodobá řešení

### Možnost 1: Vercel Pro ($20/měsíc)
- Limit 100 funkcí
- Žádné sloučení potřeba
- Lepší výkon a monitoring

### Možnost 2: Monolitický backend
Přesunout API do jedné Express/Fastify aplikace:

```
api/
  index.ts  ← jeden entry point
  routes/
    credits.ts
    findings.ts
    admin/
      credits.ts
    ...
```

**Výhody:**
- Neomezený počet routes
- Lepší sdílení kódu
- Jednodušší lokální vývoj

**Nevýhody:**
- Delší cold start
- Větší bundle

### Možnost 3: Jiný hosting
- **Railway** – bez limitu funkcí
- **Fly.io** – kontejnery
- **Render** – free tier s limity

## Seznam aktuálních funkcí

```
api/
├── credits.ts           # Kredity + Admin kredity
├── custom-fields.ts     # Vlastní pole
├── equipment.ts         # Vybavení
├── features.ts          # Feature requesty
├── findings.ts          # Nálezy + Public nálezy
├── findings/
│   └── [id]/
│       └── images.ts    # Obrázky + AI analýza
├── map-setups.ts        # Nastavení mapy
├── profile.ts           # Profil uživatele
├── proxy.ts             # CORS proxy
├── sectors.ts           # Sektory
├── stats.ts             # Statistiky
└── tracks.ts            # Stopy/trasy
```

**Celkem: 12/12 funkcí**

## Poznámky

- Před přidáním nové funkce **musíš sloučit** existující
- Nebo upgradovat na Pro plán
- `_lib/` složka se nepočítá (sdílený kód)
