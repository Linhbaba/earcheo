# WMS Proxy Optimization - Deployment Guide

## ✅ Co bylo provedeno

### 1. Refactoring na Edge Runtime
- **3 proxy soubory** zrefaktorovány: `wms-proxy.ts`, `ortofoto-proxy.ts`, `history-proxy.ts`
- **Ze 107 → 14 řádků** každý (DRY principle)
- **Sdílená utility** `api/_lib/edge-proxy.ts` (120 řádků)

### 2. Klíčové optimalizace

#### Edge Runtime Config
```typescript
export const config = {
  runtime: 'edge',
};
```

#### Optimální Cache Headers
```
Cache-Control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800
```

- `s-maxage=86400` → Vercel Edge CDN cache 24h
- `max-age=3600` → Browser cache 1h
- `stale-while-revalidate=604800` → Může vrátit starou verzi během revalidace (7 dní)

#### Bezpečnostní validace
- Width/Height max 512px (ochrana před abuse)
- Query string max 2000 znaků
- Whitelisted parametry pouze
- Timeout 25s

### 3. Vercel Config
- Odstraněn `memory: 1024` (Edge má fixed 128 MB)
- Zachován `maxDuration: 30`

## 📊 Očekávané výsledky

### Náklady
- **85-95% requestů** = CDN cache (zdarma)
- **5-15% requestů** = Edge Runtime (50% levnější než Node.js)
- **Celková úspora: 90-95%**

### Performance
- **Cold start:** 200ms → 50ms
- **Cache hit:** instant (<50ms)
- **Region:** Global Edge (Frankfurt pro EU)

## 🚀 Deployment

### 1. Commit a push
```bash
git add api/ vercel.json test-wms-cache.sh
git commit -m "feat: optimalizace WMS proxy - Edge Runtime + CDN caching"
git push origin dev
```

### 2. Preview deployment
Vercel automaticky vytvoří preview:
```
https://earcheo-[hash]-[team].vercel.app
```

### 3. Test preview
```bash
./test-wms-cache.sh earcheo-[hash]-[team].vercel.app
```

**Co hledat:**
- ✅ HTTP 200 OK
- ✅ `cache-control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800`
- ✅ `x-vercel-cache: MISS` (první request) nebo `HIT` (cached)
- ✅ `content-type: image/png`
- ✅ Width validation test vrací 400

### 4. Production deployment
```bash
# Merge do main
git checkout main
git merge dev
git push origin main
```

## 🔍 Monitoring (první 24-48h)

### Vercel Dashboard
**Místo:** Dashboard → earcheo → Usage

#### Metriky ke sledování:

1. **Function Invocations**
   - **Before:** ~50,000-100,000 / den
   - **After:** ~2,500-10,000 / den (85-95% pokles) ✅

2. **Edge Requests**
   - Měly by být **vysoké** (cache hits)

3. **Bandwidth**
   - Může mírně vzrůst (více z cache, rychlejší načítání)

4. **Error Rate**
   - Měla by zůstat **< 1%**

5. **P95 Response Time**
   - Cache hits: **< 50ms**
   - Cache miss: **200-500ms** (fetch z ČÚZK)

### Real-time test v production
```bash
./test-wms-cache.sh earcheo.cz
```

Spusťte **2×** pro stejný request:
- 1. request: `x-vercel-cache: MISS`
- 2. request: `x-vercel-cache: HIT` ✅

## 🧪 Test v browseru

### DevTools test:
1. Otevřít https://earcheo.cz
2. DevTools → Network → filtr "wms-proxy"
3. Pohybovat mapou
4. Sledovat:
   - Status: **200**
   - Size: **~20-100 KB**
   - Time: **< 100ms** (cache hit)

### Cache behavior:
- Stejná dlaždice při 2. načtení: **instant** (CDN cache)
- Různé dlaždice: **200-500ms** (fetch z ČÚZK, pak cache)

## ⚠️ Troubleshooting

### Problém: Vysoké function invocations i po 24h
**Příčina:** Cache se nevyužívá  
**Řešení:**
1. Zkontrolovat `curl -I` output - musí obsahovat `s-maxage`
2. Zkontrolovat Vercel logs - hledat chyby
3. Ověřit Edge Runtime: Dashboard → Functions → měly by být "Edge"

### Problém: 502 Bad Gateway
**Příčina:** ČÚZK je down nebo timeout  
**Řešení:**
- Cache by měla vracet staré dlaždice (`stale-while-revalidate`)
- Zkontrolovat ČÚZK dostupnost: https://ags.cuzk.cz

### Problém: TypeScript build errors
**Příčina:** Edge Runtime má jiné typy  
**Řešení:**
- Ověřit že používáte `Request`/`Response` (ne `VercelRequest`/`VercelResponse`)
- Check `api/_lib/edge-proxy.ts` import cesty

## 🔄 Rollback plán

Pokud něco selže:

```bash
# 1. Revert commit
git revert HEAD

# 2. Push
git push origin main

# 3. Vercel redeploy automaticky
```

Cache headers (`s-maxage`) **zůstanou funkční** i v Node.js runtime, takže částečně optimalizace zůstane.

## 📈 Týdenní review

Po 7 dnech zkontrolovat:

### Vercel Usage Dashboard
- [ ] Function invocations klesly o 85-95%
- [ ] Edge requests jsou vysoké
- [ ] Error rate < 1%
- [ ] Billing estimate poklesl o ~90%

### User Experience
- [ ] Mapa se načítá rychleji
- [ ] Žádné reporty o chybějících dlaždicích
- [ ] Mobile experience vylepšena (rychlejší cache)

## 🎯 Další možné optimalizace

Pokud chcete ještě více optimalizovat:

1. **Zvýšit cache na 7 dní** pro statické vrstvy:
   ```typescript
   'Cache-Control': 'public, s-maxage=604800, ...'
   ```

2. **Přidat Cloudflare před Vercel:**
   - Extra CDN layer
   - DDoS protection
   - Může cache i Edge Functions

3. **Přejít na WMTS** (pokud ČÚZK vydá):
   - Pre-rendered tiles
   - Ještě rychlejší
   - Nulové function invocations

## 📝 Notes

- DMR5G data se aktualizují max 1×/rok → 24h cache je bezpečná
- Ortofoto se aktualizuje ~2×/rok → také OK
- History mapy jsou statické → můžete prodloužit cache na 7+ dní

