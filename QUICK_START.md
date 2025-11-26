# Quick Start Guide - Earcheo Database

Rychlý průvodce spuštěním databázového systému za 10 minut.

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

### 3. Vytvořte Vercel Blob Storage (1 minuta)

1. Jděte na https://vercel.com/dashboard
2. Vyberte projekt `earcheo`
3. Storage → Create → Blob
4. Name: `earcheo-images`
5. Token se automaticky přidá do ENV variables

### 4. Nastavte ENV variables lokálně (2 minuty)

Vytvořte `.env` v rootu projektu:

```bash
# Z Neon dashboard
DATABASE_URL="postgresql://...?pgbouncer=true"
DIRECT_URL="postgresql://..."

# Auth0
AUTH0_DOMAIN="dev-jsfkqesvxjhvsnkd.us.auth0.com"
AUTH0_AUDIENCE="https://api.earcheo.cz"
AUTH0_ISSUER="https://dev-jsfkqesvxjhvsnkd.us.auth0.com/"

# Z Vercel Blob (nebo nechte prázdné pro lokální dev)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

### 5. Spusťte migrations (1 minuta)

```bash
cd /home/gandalf/Projekty/cyber-archeology

# Generovat Prisma Client
npm run db:generate

# Spustit migrations
npm run db:migrate
```

Potvrďte název migrace (např. `init`).

### 6. Testujte! (1 minuta)

```bash
# Spusťte Vercel dev server
npm run vercel:dev

# V druhém terminálu - test
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Jak získat token:**
1. Spusťte frontend: `cd frontend && npm run dev`
2. Přihlaste se
3. DevTools → Console:
   ```javascript
   const key = Object.keys(localStorage).find(k => k.includes('@@auth0spajs@@'));
   const auth = JSON.parse(localStorage.getItem(key));
   console.log(auth.body.access_token);
   ```

---

## 🔧 Nastavení pro Vercel Production

### 1. Environment Variables ve Vercel Dashboard

Jděte do Settings → Environment Variables a přidejte:

```
DATABASE_URL=postgresql://...?pgbouncer=true
DIRECT_URL=postgresql://...
AUTH0_DOMAIN=dev-jsfkqesvxjhvsnkd.us.auth0.com
AUTH0_AUDIENCE=https://api.earcheo.cz
AUTH0_ISSUER=https://dev-jsfkqesvxjhvsnkd.us.auth0.com/
```

**⚠️ Důležité:** Nastavte pro **Production**, **Preview** i **Development**.

### 2. Spusťte production migrations

```bash
# Z lokálního PC s production DATABASE_URL
DATABASE_URL="postgresql://production..." npm run db:migrate:deploy
```

### 3. Deploy!

```bash
git add .
git commit -m "Add database support"
git push origin main
```

Vercel automaticky deployuje.

---

## 📋 Checklist

- [ ] Neon databáze vytvořena
- [ ] Auth0 API vytvořené (`https://api.earcheo.cz`)
- [ ] Vercel Blob storage vytvořen
- [ ] `.env` soubor vytvořen lokálně
- [ ] `npx prisma generate` spuštěno
- [ ] `npx prisma migrate dev` spuštěno
- [ ] ENV variables nastaveny ve Vercel Dashboard
- [ ] Production migrations spuštěny
- [ ] Testováno lokálně přes `npm run vercel:dev`
- [ ] Deployováno

---

## 🎯 Užitečné příkazy

```bash
# Database
npm run db:generate         # Generovat Prisma Client
npm run db:migrate          # Vytvořit a spustit migrations
npm run db:migrate:deploy   # Spustit migrations v production
npm run db:studio           # Otevřít Prisma Studio (GUI pro DB)

# Development
npm run vercel:dev          # Spustit Vercel dev server
npm run dev                 # Spustit frontend + backend proxy

# Vercel
vercel                      # Deploy do preview
vercel --prod               # Deploy do production
vercel logs                 # Zobrazit logy
vercel env ls               # Seznam ENV variables
```

---

## 🐛 Troubleshooting

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

## 📚 Další dokumentace

- **DATABASE_SETUP.md** - Detailní setup guide
- **API_TESTING.md** - Testování všech endpointů
- **IMPLEMENTATION_SUMMARY.md** - Co bylo implementováno

---

## 🚀 Další kroky

Po dokončení tohoto quick startu můžete:

1. **Prohlížet data**: `npm run db:studio`
2. **Testovat API**: Viz `API_TESTING.md`
3. **Vytvářet UI**: Použijte React hooks v `frontend/src/hooks/`
4. **Přidávat nálezy**: Přes API nebo později přes UI

---

## ❓ Potřebujete pomoc?

1. Zkontrolujte `DATABASE_SETUP.md` pro detaily
2. Zkontrolujte Vercel logs: `vercel logs --follow`
3. Zkontrolujte Prisma logs: `DEBUG="prisma:*" npm run vercel:dev`

Hodně štěstí! 🎉

