# Database Setup Guide - Earcheo

Tento dokument popisuje, jak nastavit databázi pro Earcheo aplikaci.

## Architektura

- **Database**: PostgreSQL (Vercel Postgres nebo Neon)
- **ORM**: Prisma 6.x
- **Image Storage**: Vercel Blob + Sharp.js preprocessing
- **API**: Vercel Serverless Functions (TypeScript)
- **Auth**: Auth0 JWT tokens

## 1. Vytvoření databáze

### Možnost A: Vercel Postgres (doporučeno pro production)

1. Jděte na [Vercel Dashboard](https://vercel.com/dashboard)
2. Vyberte projekt `earcheo`
3. Klikněte na "Storage" → "Create Database" → "Postgres"
4. Název: `earcheo-db`
5. Region: `Frankfurt (fra1)` (nejblíže ČR)
6. Po vytvoření zkopírujte connection stringy

### Možnost B: Neon (doporučeno pro development + connection pooling)

1. Jděte na [neon.tech](https://neon.tech) a registrujte se
2. Vytvořte nový projekt: `earcheo`
3. Region: `Europe (Frankfurt)`
4. Zkopírujte connection stringy:
   - `DATABASE_URL` (pooled) - pro Prisma Client
   - `DIRECT_URL` (direct) - pro Prisma Migrations

**Výhody Neon:**
- ✅ Built-in connection pooling (PgBouncer)
- ✅ Free tier: 0.5 GB storage, 100 compute hours
- ✅ Rychlejší cold starts v serverless

## 2. Nastavení Environment Variables

### Lokální development

Vytvořte soubor `.env` v rootu projektu:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Auth0
AUTH0_DOMAIN="dev-jsfkqesvxjhvsnkd.us.auth0.com"
AUTH0_AUDIENCE="https://api.earcheo.cz"
AUTH0_ISSUER="https://dev-jsfkqesvxjhvsnkd.us.auth0.com/"

# Vercel Blob (nechte prázdné pro lokální vývoj, nastaví se v Vercel Dashboard)
BLOB_READ_WRITE_TOKEN=""
```

### Vercel Dashboard

1. Jděte do [Vercel Dashboard](https://vercel.com/dashboard) → `earcheo` projekt
2. Settings → Environment Variables
3. Přidejte tyto proměnné pro **Production**, **Preview** i **Development**:

```
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
AUTH0_AUDIENCE=https://api.earcheo.cz
AUTH0_ISSUER=https://dev-jsfkqesvxjhvsnkd.us.auth0.com/
```

4. **Vercel Blob**: Jděte do Storage → Create → Blob → pojmenujte `earcheo-images`
   - Token se automaticky přidá do ENV variables

## 3. Nastavení Auth0 API

Aby JWT autentizace fungovala, musíte vytvořit Auth0 API:

1. Jděte do [Auth0 Dashboard](https://manage.auth0.com/)
2. Applications → APIs → "Create API"
3. Name: `Earcheo API`
4. Identifier: `https://api.earcheo.cz` (použijte přesně tento!)
5. Signing Algorithm: `RS256`
6. Enable RBAC: Ne (zatím nepotřebujeme)
7. Save

Tento `identifier` je váš `AUTH0_AUDIENCE`.

## 4. Spuštění Prisma Migrations

### Lokálně (první spuštění)

```bash
# Z rootu projektu
cd /home/gandalf/Projekty/cyber-archeology

# Generovat Prisma Client
npx prisma generate

# Vytvořit a spustit migrations
npx prisma migrate dev --name init

# (Volitelně) Otevřít Prisma Studio pro prohlížení dat
npx prisma studio
```

### Production (Vercel)

Migrations v production musíte spustit **před** deployem:

```bash
# Z lokálního PC s production DATABASE_URL
DATABASE_URL="postgresql://production..." npx prisma migrate deploy
```

**Nebo** použít GitHub Action (doporučeno):

Vytvořte `.github/workflows/migrate.yml`:

```yaml
name: Migrate Database
on:
  push:
    branches: [main]
    paths:
      - 'prisma/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## 5. Testování API

### Lokální test

```bash
# Spusťte Vercel dev server
npx vercel dev

# Test v druhém terminálu
curl -X GET http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"
```

### Získání Auth0 tokenu

1. Přihlaste se do frontendu (`http://localhost:5173`)
2. Otevřete DevTools → Application → Local Storage
3. Najděte Auth0 token (klíč začíná `@@auth0spajs@@`)
4. Zkopírujte hodnotu `access_token`

## 6. Database Schema

### Hlavní modely:

- **User** - Uživatelský profil (mapovaný na Auth0 `sub`)
- **Equipment** - Vybavení uživatele (detektory, GPS, atd.)
- **Finding** - Archeologické nálezy s GPS souřadnicemi
- **FindingImage** - Fotky nálezů (3 velikosti: original, medium, thumbnail)
- **SocialLink** - Sociální sítě uživatele
- **FavoriteLocation** - Oblíbené lokality
- **FindingEquipment** - M:N vztah mezi nálezy a vybavením

### Indexy pro performance:

- User email
- Finding userId, isPublic, date, category
- Equipment userId, type
- FindingImage findingId + order

## 7. Image Processing Flow

```
Upload → Sharp.js → [Original, Medium, Thumbnail] → Vercel Blob → DB URLs
       ↓
    Resize & WebP conversion
       ↓
    Original: max 2048x2048, 85% quality
    Medium: 800x600, 85% quality
    Thumbnail: 200x200 cover crop, 80% quality
```

**Náklady při 1000 nálezů × 3 fotky:**
- Storage: ~6.5GB × $0.15/GB = ~$1/měsíc
- Bandwidth: ~2GB × $0.30/GB = ~$0.60/měsíc
- **Celkem: ~$1.60/měsíc** ✅

## 8. Troubleshooting

### Problem: "Connection pool timeout"

**Řešení:** Použijte Neon s connection pooling nebo Prisma Accelerate.

### Problem: "P2002: Unique constraint failed"

**Řešení:** Uživatel s tímto emailem/ID už existuje. Použijte `findFirst` + `upsert`.

### Problem: "Cold start trvá 20s"

**Příčina:** Prisma generuje velký bundle.

**Řešení:**
1. Použijte Prisma Accelerate ($25/měsíc)
2. Nebo přejděte na Drizzle ORM (menší bundle)

### Problem: Auth0 token validace failuje

**Checklist:**
- [ ] `AUTH0_AUDIENCE` odpovídá API Identifier v Auth0
- [ ] `AUTH0_ISSUER` končí lomítkem `/`
- [ ] `AUTH0_DOMAIN` je správně nastavená
- [ ] Frontend posílá token v headeru `Authorization: Bearer <token>`
- [ ] Auth0 API je vytvořené a má správný identifier

## 9. Bezpečnost

✅ **Implementováno:**
- JWT ověření na všech endpointech
- Row-level security (userId check)
- Input validace (Zod)
- SQL injection protection (Prisma)
- File size limits (10MB)
- CORS headers

⚠️ **TODO:**
- Rate limiting (Express Rate Limit nebo Vercel Edge Middleware)
- Image virus scanning
- CSRF protection
- Audit logging

## 10. Monitoring

### Prisma Studio (lokálně)

```bash
npx prisma studio
```

Otevře se UI na `http://localhost:5555` pro prohlížení a editaci dat.

### Vercel Logs

```bash
vercel logs --follow
```

### Database Monitoring

- **Vercel Postgres**: Dashboard → Storage → Metrics
- **Neon**: Dashboard → Monitoring → Query Statistics

## Hotovo! 🎉

Nyní máte plně funkční databázi s REST API pro uživatelské profily, vybavení a nálezy.

**Next steps:**
1. Vytvořit frontend UI komponenty
2. Implementovat React hooks pro API calls
3. Přidat validaci formulářů
4. Otestovat upload fotek





