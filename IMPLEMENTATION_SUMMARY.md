# Implementation Summary - Vercel Postgres + Prisma + Sharp.js

Tento dokument shrnuje implementaci databázového systému pro Earcheo aplikaci.

## ✅ Co bylo implementováno

### 1. Database Schema (Prisma)

**Soubor:** `prisma/schema.prisma`

**Modely:**
- ✅ User - Uživatelský profil s rozšířenými informacemi
- ✅ SocialLink - Sociální sítě (relační místo JSON)
- ✅ FavoriteLocation - Oblíbené lokality (relační místo JSON)
- ✅ Equipment - Vybavení uživatele (DETECTOR, GPS, OTHER)
- ✅ Finding - Archeologické nálezy s GPS + rozšířené info
- ✅ FindingImage - Fotky nálezů (3 velikosti: original, medium, thumbnail)
- ✅ FindingEquipment - M:N junction table pro nálezy ↔ vybavení

**Výhody tohoto designu:**
- Type-safe queries
- Relační integrita (foreign keys)
- Možnost filtrace a vyhledávání
- Indexy pro performance

### 2. API Infrastructure

**Vytvořené knihovny v `api/_lib/`:**

#### `db.ts` - Prisma Client singleton
- ✅ Connection pooling pro serverless
- ✅ Graceful shutdown
- ✅ Development logging

#### `auth.ts` - Auth0 JWT middleware
- ✅ JWT verifikace pomocí JWKS
- ✅ `withAuth()` wrapper pro protected routes
- ✅ `getUserId()` helper pro získání user ID z tokenu

#### `image-processor.ts` - Image processing + upload
- ✅ Sharp.js resize & WebP conversion
- ✅ 3 velikosti: original (2048x2048), medium (800x600), thumbnail (200x200)
- ✅ Vercel Blob upload
- ✅ Batch deletion helper

### 3. API Endpoints

#### Profile API (`/api/profile.ts`)
- ✅ GET - Získat profil
- ✅ POST - Vytvořit profil (první přihlášení)
- ✅ PUT - Aktualizovat profil + sociální linky + lokality
- ✅ Zod validace

#### Equipment API (`/api/equipment/`)
- ✅ GET `/api/equipment` - Seznam vybavení
- ✅ POST `/api/equipment` - Přidat vybavení
- ✅ GET `/api/equipment/:id` - Detail vybavení
- ✅ PUT `/api/equipment/:id` - Upravit vybavení
- ✅ DELETE `/api/equipment/:id` - Smazat vybavení
- ✅ Row-level security (pouze vlastní data)

#### Findings API (`/api/findings/`)
- ✅ GET `/api/findings` - Seznam nálezů (s filtry)
- ✅ POST `/api/findings` - Vytvořit nález
- ✅ GET `/api/findings/:id` - Detail nálezu
- ✅ PUT `/api/findings/:id` - Upravit nález
- ✅ DELETE `/api/findings/:id` - Smazat nález + fotky

#### Images API (`/api/findings/:id/images.ts`)
- ✅ POST - Nahrát fotku (base64 → Sharp → 3× WebP → Vercel Blob)
- ✅ DELETE - Smazat fotku (včetně všech velikostí z Blob)
- ✅ 10MB file size limit

### 4. Frontend Integration

#### TypeScript Types (`frontend/src/types/database.ts`)
- ✅ Všechny databázové typy
- ✅ Request/Response typy pro API
- ✅ Type-safe napříč celou aplikací

#### React Hooks (`frontend/src/hooks/`)
- ✅ `useProfile()` - CRUD operace s profilem
- ✅ `useEquipment()` - CRUD operace s vybavením
- ✅ `useFindings()` - CRUD operace s nálezy + upload/delete fotek
- ✅ Automatické Auth0 token handling
- ✅ Error handling
- ✅ Optimistic updates (state update před API response)

### 5. Configuration

#### Vercel Configuration (`vercel.json`)
- ✅ API routes rewrites pro všechny endpointy
- ✅ Security headers
- ✅ CORS headers pro API

#### Environment Variables (`.env.example`)
- ✅ Template pro DATABASE_URL
- ✅ Auth0 configuration
- ✅ Vercel Blob token

### 6. Documentation

- ✅ **DATABASE_SETUP.md** - Kompletní návod na setup databáze
- ✅ **API_TESTING.md** - Testování všech API endpointů s příklady
- ✅ **IMPLEMENTATION_SUMMARY.md** - Tento dokument
- ✅ Inline komentáře v kódu

### 7. Dependencies

**Nainstalované balíčky:**
```json
{
  "prisma": "^6.1.0",
  "@prisma/client": "^6.1.0",
  "@vercel/blob": "^0.27.0",
  "sharp": "^0.33.5",
  "zod": "^3.24.1",
  "express-jwt": "^8.4.1",
  "jwks-rsa": "^3.1.0"
}
```

### 8. Security

✅ **Implementováno:**
- JWT authentication na všech endpointech
- Row-level security (userId check)
- Input validace (Zod)
- SQL injection protection (Prisma ORM)
- File size limits
- CORS headers
- Security headers (CSP, X-Frame-Options, atd.)

---

## ⚠️ Co zbývá udělat (vyžaduje váš input)

### 1. Vytvořit databázi

**Musíte udělat manuálně:**

**Možnost A: Vercel Postgres**
1. Jděte na https://vercel.com/dashboard
2. Vyberte projekt `earcheo`
3. Storage → Create Database → Postgres
4. Zkopírujte `DATABASE_URL`

**Možnost B: Neon (doporučeno pro connection pooling)**
1. Jděte na https://neon.tech
2. Vytvořte projekt `earcheo`
3. Zkopírujte oba connection stringy:
   - `DATABASE_URL` (pooled)
   - `DIRECT_URL` (direct)

### 2. Vytvořit Auth0 API

**Musíte udělat manuálně:**

1. Jděte na https://manage.auth0.com/
2. Applications → APIs → Create API
3. Name: `Earcheo API`
4. Identifier: `https://api.earcheo.cz` (přesně tento!)
5. Signing Algorithm: RS256
6. Save

### 3. Vytvořit Vercel Blob Storage

**Musíte udělat manuálně:**

1. Vercel Dashboard → Storage → Create → Blob
2. Name: `earcheo-images`
3. Token se automaticky přidá do ENV variables

### 4. Nastavit Environment Variables

**Lokálně - vytvořte `.env`:**

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH0_DOMAIN="dev-jsfkqesvxjhvsnkd.us.auth0.com"
AUTH0_AUDIENCE="https://api.earcheo.cz"
AUTH0_ISSUER="https://dev-jsfkqesvxjhvsnkd.us.auth0.com/"
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

**Vercel Dashboard:**
- Přidejte všechny proměnné do Settings → Environment Variables
- Pro Production, Preview i Development

### 5. Spustit Prisma Migrations

**Z terminálu:**

```bash
cd /home/gandalf/Projekty/cyber-archeology

# Generovat Prisma Client
npx prisma generate

# Vytvořit a spustit migrace
npx prisma migrate dev --name init

# (Volitelně) Prohlížet data
npx prisma studio
```

### 6. Přidat VITE_API_URL do frontendu

**Soubor: `frontend/.env.local`**

Přidejte:
```
VITE_API_URL=
```

Pro production v Vercel:
```
VITE_API_URL=https://earcheo.cz
```

---

## 🧪 Testování

### Lokální testování

```bash
# 1. Spusťte Vercel dev server
npx vercel dev --listen 3000

# 2. V druhém terminálu - test API
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_AUTH0_TOKEN"
```

Detailní testovací příklady jsou v `API_TESTING.md`.

### Integration test

Vytvořte jednoduchou test stránku:

```typescript
// frontend/src/pages/TestPage.tsx
import { useProfile, useEquipment, useFindings } from '../hooks';

export default function TestPage() {
  const { profile, loading } = useProfile();
  const { equipment } = useEquipment();
  const { findings } = useFindings();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Profile: {profile?.nickname}</h1>
      <h2>Equipment: {equipment.length} items</h2>
      <h2>Findings: {findings.length} items</h2>
    </div>
  );
}
```

---

## 📊 Náklady

### Při 1000 nálezů × 3 fotky:

**Storage (Vercel Blob):**
- Original: ~6GB × $0.15/GB = **$0.90/měsíc**
- Thumbnail: ~0.3GB × $0.15/GB = **$0.05/měsíc**
- Medium: ~0.2GB × $0.15/GB = **$0.03/měsíc**

**Bandwidth:**
- ~2GB/měsíc × $0.30/GB = **$0.60/měsíc**

**Database (Neon free tier):**
- Free až do 0.5GB storage
- 100 compute hours/měsíc

**Total: ~$1.60/měsíc** ✅ Velmi levné!

---

## 🚀 Performance

### Expected latencies:

- GET /api/profile: ~200ms (cold start ~2s)
- POST /api/findings: ~300ms
- POST /api/findings/:id/images: ~1-3s (závisí na velikosti fotky)
- Image processing (2MB → 3× WebP): ~500ms

### Optimalizace:

1. **Connection pooling** (Neon) - eliminuje Prisma cold start problémy
2. **Sharp.js preprocessing** - jedna cena za upload místo N cen za zobrazení
3. **WebP format** - 30-50% menší soubory než JPEG
4. **Prisma indexy** - rychlé queries i při tisících záznamů

---

## 📁 Struktura souborů

```
/home/gandalf/Projekty/cyber-archeology/
├── prisma/
│   └── schema.prisma            ✅ Database schema
├── api/
│   ├── _lib/
│   │   ├── db.ts               ✅ Prisma client
│   │   ├── auth.ts             ✅ Auth0 middleware
│   │   └── image-processor.ts  ✅ Sharp + Blob
│   ├── profile.ts              ✅ Profile API
│   ├── equipment/
│   │   ├── index.ts            ✅ List/Create
│   │   └── [id].ts             ✅ Get/Update/Delete
│   ├── findings/
│   │   ├── index.ts            ✅ List/Create
│   │   ├── [id].ts             ✅ Get/Update/Delete
│   │   └── [id]/
│   │       └── images.ts       ✅ Upload/Delete images
├── frontend/src/
│   ├── types/
│   │   └── database.ts          ✅ TypeScript types
│   └── hooks/
│       ├── useProfile.ts        ✅ Profile hook
│       ├── useEquipment.ts      ✅ Equipment hook
│       └── useFindings.ts       ✅ Findings hook
├── .env.example                 ✅ ENV template
├── vercel.json                  ✅ Updated with new routes
├── DATABASE_SETUP.md            ✅ Setup guide
├── API_TESTING.md               ✅ Testing guide
└── IMPLEMENTATION_SUMMARY.md    ✅ This file
```

---

## ✅ Checklist pro spuštění

Před tím, než API poběží, projděte tento checklist:

- [ ] Vytvořena databáze (Vercel Postgres nebo Neon)
- [ ] Vytvořeno Auth0 API s identifierem `https://api.earcheo.cz`
- [ ] Vytvořen Vercel Blob storage `earcheo-images`
- [ ] ENV variables nastavené lokálně (`.env`)
- [ ] ENV variables nastavené ve Vercel Dashboard
- [ ] Spuštěno `npx prisma generate`
- [ ] Spuštěno `npx prisma migrate dev --name init`
- [ ] Přidáno `VITE_API_URL` do `frontend/.env.local`
- [ ] Testováno lokálně přes `npx vercel dev`
- [ ] Deployováno na Vercel

---

## 🎯 Next Steps (po dokončení checklistu)

### Frontend UI komponenty:

1. **ProfilePage.tsx** - Zobrazení a editace profilu
2. **EquipmentPage.tsx** - Seznam vybavení + formulář
3. **FindingsPage.tsx** - Seznam nálezů na mapě
4. **FindingDetailPage.tsx** - Detail nálezu + fotogalerie
5. **FindingForm.tsx** - Vytvoření/editace nálezu
6. **ImageUploader.tsx** - Drag&drop upload s preview

### Advanced features:

- [ ] Rate limiting (Vercel Edge Middleware)
- [ ] Image virus scanning (ClamAV nebo VirusTotal)
- [ ] Pub/private switch pro nálezy (sdílení s komunitou)
- [ ] Export nálezů do KML/GPX
- [ ] Statistiky (kolik nálezů, nejčastější kategorie, atd.)
- [ ] Notifications (nový komentář, like, atd.)

---

## 🐛 Troubleshooting

### "Connection pool timeout"
**Řešení:** Použijte Neon s pooling nebo Prisma Accelerate.

### "Invalid token"
**Checklist:**
- Auth0 API vytvořené?
- `AUTH0_AUDIENCE` odpovídá API identifieru?
- `AUTH0_ISSUER` končí lomítkem `/`?

### "Image processing failed"
**Možné příčiny:**
- Sharp.js build failed (zkuste reinstall)
- File není obrázek
- File > 10MB

### "Cold start trvá 20s"
**Normální** při prvním requestu. Neon s poolingem zkracuje na ~2s.

---

## 🎉 Shrnutí

**Co máte hotové:**
- ✅ Kompletní databázové schéma (Prisma)
- ✅ REST API se 13 endpointy
- ✅ Auth0 JWT autentizace
- ✅ Image processing (Sharp + WebP)
- ✅ Vercel Blob integration
- ✅ TypeScript types
- ✅ React hooks pro všechny operace
- ✅ Kompletní dokumentace

**Co zbývá (vyžaduje vaši akci):**
- ⚠️ Vytvořit databázi
- ⚠️ Nastavit Auth0 API
- ⚠️ Nastavit environment variables
- ⚠️ Spustit migrations
- ⚠️ Otestovat API

**Odhadovaný čas na dokončení:** ~30 minut

**Poté můžete:**
- Začít vyvíjet frontend UI
- Přidat nálezy přes API
- Nahrávat fotky
- Sdílet nálezy s komunitou

Hodně štěstí! 🚀

