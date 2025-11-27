# Analýza Optimalizací pro Vercel - eArcheo

Datum: 27. listopadu 2025

## 📊 Aktuální Stav

### Build Output
```
dist/index.html                         1.84 kB │ gzip:   0.90 kB
dist/assets/index-BlC4e7HB.css        112.17 kB │ gzip:  17.21 kB
dist/assets/react-vendor-CP--al2_.js  174.03 kB │ gzip:  57.31 kB
dist/assets/index-DjzJkzMf.js         369.58 kB │ gzip:  94.85 kB
dist/assets/maplibre-DU60XzP5.js      802.23 kB │ gzip: 216.94 kB
```

**Celkem:** ~1.46 MB (uncompressed), ~387 KB (gzipped)

---

## ✅ Co Máme Dobře Optimalizované

### 1. **Edge Functions pro WMS Proxy** ⚡
- **Runtime:** Edge (ne Serverless)
- **Výhody:** 
  - Minimální cold start
  - Globální distribuce přes Vercel Edge Network
  - Levnější než Serverless functions
  
```typescript
// api/wms-proxy.ts, ortofoto-proxy.ts, history-proxy.ts
export const config = { runtime: 'edge' };
```

### 2. **Agresivní Cache Strategie** 📦
```javascript
Cache-Control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800
```
- **CDN cache:** 24 hodin
- **Browser cache:** 1 hodina  
- **Stale-while-revalidate:** 7 dní
- **Impact:** Minimalizuje počet requestů na ČÚZK servery

### 3. **Optimalizace Obrázků** 🖼️
- **Formát:** Automatická konverze na WebP
- **Resize:** 3 verze (thumb 200x200, medium 800x600, original max 2048x2048)
- **Kvalita:** 80-85% (optimální poměr kvalita/velikost)
- **Sharp library:** Rychlé zpracování na serverless

```typescript
// api/_lib/image-processor.ts
await sharp(buffer)
  .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
  .webp({ quality: 85 })
  .toBuffer();
```

### 4. **Code Splitting** 📦
- **MapLibre:** Separátní chunk (největší library)
- **React vendor:** Izolované vendor balíčky
- **Manuální chunking:** Definováno ve Vite config

### 5. **Serverless Function Limity** ⏱️
```json
"functions": {
  "api/*.ts": {
    "maxDuration": 30
  }
}
```
- Předchází drahým dlouhým běhům

### 6. **Prisma Client Optimalizace** 🗄️
- **Generate:** V postinstall hooku
- **Single instance:** Connection pooling přes `prisma.ts`

---

## ⚠️ Oblasti k Vylepšení

### 1. **MapLibre Bundle Velikost** 🎯 PRIORITA
**Problém:** 802 KB (217 KB gzip) - největší chunk

**Doporučení:**
```typescript
// vite.config.ts - přidat lazy loading
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'maplibre': ['maplibre-gl'],
        'maplibre-css': ['maplibre-gl/dist/maplibre-gl.css'],
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'auth': ['@auth0/auth0-react'],
        'lucide': ['lucide-react'],
      }
    }
  }
}
```

**Úspora:** ~15-20 KB gzip, lepší caching

### 2. **Lazy Loading Komponent** 🔄
**Implementovat:**
```typescript
// Modály a velké komponenty
const FindingsModal = lazy(() => import('./components/findings/FindingsModal'));
const EquipmentModal = lazy(() => import('./components/equipment'));
const ProfileModal = lazy(() => import('./components/profile'));
```

**Úspora:** ~50-70 KB z initial bundle

### 3. **CSS Purge** 🎨
**Problém:** 112 KB CSS (17 KB gzip)

**Doporučení:**
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Přidat PurgeCSS pro produkci
}
```

**Úspora:** ~5-10 KB gzip

### 4. **React Production Mode** ⚛️
**Ověřit:**
```typescript
// vite.config.ts
define: {
  'process.env.NODE_ENV': JSON.stringify('production')
}
```

### 5. **Database Query Optimalizace** 🗄️

**Aktuální stav:**
```typescript
// Bez selectu = načítá všechna pole
const findings = await prisma.finding.findMany({
  where: { userId },
  include: { images: true, equipment: true }
});
```

**Doporučení:**
```typescript
// Vybrat pouze potřebná pole
const findings = await prisma.finding.findMany({
  where: { userId },
  select: {
    id: true,
    title: true,
    latitude: true,
    longitude: true,
    date: true,
    category: true,
    images: {
      select: {
        id: true,
        thumbnailUrl: true, // ne originalUrl
        order: true
      },
      take: 1 // jen první obrázek
    },
    equipment: {
      select: {
        id: true,
        name: true
      }
    }
  }
});
```

**Úspora:** 30-50% data transferu na dotaz

### 6. **API Response Caching** 💾
**Přidat pro:**
- `/api/findings` - cache 5 minut
- `/api/equipment` - cache 10 minut
- `/api/profile` - cache 1 minuta

```typescript
// api/findings/index.ts
res.setHeader('Cache-Control', 'private, max-age=300');
```

### 7. **Vercel Blob Optimalizace** 📦
**Aktuální:** Vše v jednom folderu `findings/{id}/`

**Doporučení:**
- **TTL policy:** Nastavit automatické smazání starých verzí
- **CDN caching:** Vercel Blob má automatický CDN
- **Monitoring:** Sledovat storage usage

### 8. **Compression** 🗜️
**Ověřit Brotli:**
```json
// vercel.json - není potřeba konfigurovat, Vercel používá Brotli automaticky
```

**Benefit:** 15-20% lepší komprese než gzip

---

## 💰 Náklady a Metriky

### Vercel Free Tier Limity
- ✅ **Bandwidth:** 100 GB/měsíc
- ✅ **Function Executions:** 100 GB-hours/měsíc  
- ✅ **Edge Middleware:** Unlimited
- ✅ **Build Time:** 100 hours/měsíc

### Odhadované Náklady (Pro Tier potřebný při růstu)
**Při 10,000 uživatelů/měsíc:**
- **Bandwidth:** ~40 GB (initial load) + ~160 GB (API) = **200 GB**
  - Cena: $40/měsíc nad limit
  
- **Serverless Functions:** ~50 GB-hours
  - Cena: $0 (v limitu)
  
- **Edge Functions:** Unlimited (FREE)
  
- **Vercel Blob Storage:** ~50 GB
  - Cena: $0.15/GB = **$7.50/měsíc**

**Celkem: ~$50/měsíc** pro 10K uživatelů

### Optimalizace Nákladů
1. **Edge Functions priorita** - VŽDY použít kde možné
2. **Cache headers** - Minimalizovat origin requests
3. **Image optimization** - WebP + správné velikosti
4. **Query optimization** - Omezit data transfer

---

## 🎯 Akční Plán (Priority)

### Vysoká Priorita 🔴
1. **Database query select** - Implementovat ihned
   - Úspora: 30-50% API bandwidth
   - Effort: 2-3 hodiny

2. **Lazy loading modálů** - Týden 1
   - Úspora: 50-70 KB initial bundle
   - Effort: 1 hodina

3. **API response caching** - Týden 1
   - Úspora: 60-80% API requests
   - Effort: 30 minut

### Střední Priorita 🟡
4. **MapLibre chunking** - Týden 2
   - Úspora: 15-20 KB gzip
   - Effort: 1 hodina

5. **CSS purge** - Týden 2  
   - Úspora: 5-10 KB gzip
   - Effort: 30 minut

### Nízká Priorita 🟢
6. **Monitoring setup** - Týden 3
   - Vercel Analytics
   - Sentry error tracking
   - Effort: 2 hodiny

---

## 📈 Očekávané Výsledky Po Optimalizaci

### Bundle Size
- **Aktuálně:** 387 KB (gzip)
- **Po optimalizaci:** ~300 KB (gzip)
- **Zlepšení:** ~22%

### API Bandwidth
- **Aktuálně:** 100% (baseline)
- **Po optimalizaci:** ~40-50%
- **Zlepšení:** 50-60% úspora

### Function Costs
- **Aktuálně:** Edge-optimized ✅
- **Po optimalizaci:** Stejné (již optimální)

### Time to Interactive (TTI)
- **Aktuálně:** ~2.5s (3G)
- **Po optimalizaci:** ~1.8s (3G)
- **Zlepšení:** ~28%

---

## ✅ Závěr

**Stávající stav:** 
- Dobře optimalizováno pro Edge functions
- Agresivní caching WMS dat
- Image optimization funkční

**Hlavní slabiny:**
- Bundle size (MapLibre)
- Database queries bez selectu
- Chybějící API caching
- Žádný lazy loading modálů

**Doporučení:**
1. **IHNED:** Implementovat database select
2. **TÝDEN 1:** Lazy loading + API caching
3. **TÝDEN 2:** Bundle optimalizace
4. **TÝDEN 3:** Monitoring a měření

**Náklady:**
- Free tier postačí pro testování a <1000 uživatelů
- Pro 10K uživatelů: ~$50/měsíc
- Edge functions zdarma = klíčová výhoda ✅

---

## 📚 Reference

- [Vercel Pricing](https://vercel.com/pricing)
- [Edge Functions Best Practices](https://vercel.com/docs/functions/edge-functions)
- [Bundle Analysis](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

