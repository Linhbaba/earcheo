# SEO a Bezpečnostní Implementace - Shrnutí

## ✅ Implementované SEO standardy

### 1. Meta tagy a Open Graph
- ✅ Instalován `react-helmet-async` pro dynamické meta tagy
- ✅ Vytvořena `SEOHead` komponenta s:
  - Základními meta tagy (title, description, keywords)
  - Open Graph tagy pro social media
  - Twitter Card tagy
  - JSON-LD strukturovanými daty (WebSite, WebApplication, Organization schema)
- ✅ SEO implementováno na všech stránkách:
  - LandingPage - hlavní stránka s důrazem na klíčová slova
  - MapPage - interaktivní mapa
  - FeatureRequests - požadavky na funkce

### 2. HTML optimalizace
- ✅ Aktualizován `index.html`:
  - `lang="cs"` atribut pro český jazyk
  - Meta description a keywords
  - Theme color
  - Canonical URL
  - Geo tagging

### 3. Statické SEO soubory
- ✅ `robots.txt`:
  - Povolit indexování hlavní stránky
  - **Explicitně povoleny AI crawlery**: GPTBot, Claude-Web, ClaudeBot, PerplexityBot, Anthropic-AI, Google-Extended
  - Zakázáno crawlování auth endpointů a API
  - Odkaz na sitemap
- ✅ `sitemap.xml`:
  - Seznam všech veřejných stránek
  - Priority a frekvence aktualizací

### 4. AI Přístupnost
- ✅ Explicitní meta tagy pro AI crawlery
- ✅ JSON-LD strukturovaná data pro lepší pochopení obsahu
- ✅ Semantic HTML struktura

## ✅ Implementované bezpečnostní standardy

### 1. Security Headers (vercel.json)
- ✅ **Content-Security-Policy**: Zabezpečení proti XSS a injection útokům
  - Přesně definované zdroje pro skripty, styly, fonty
  - Povoleny pouze důvěryhodné domény (Auth0, Mapbox, ČÚZK)
- ✅ **X-Frame-Options**: `DENY` - ochrana proti clickjackingu
- ✅ **X-Content-Type-Options**: `nosniff` - prevence MIME type sniffing
- ✅ **Referrer-Policy**: `strict-origin-when-cross-origin`
- ✅ **Permissions-Policy**: Omezení přístupu k browser API
- ✅ **Strict-Transport-Security**: HTTPS vynucení (HSTS)
- ✅ **X-XSS-Protection**: Dodatečná ochrana proti XSS

### 2. API zabezpečení
Všechny proxy funkce (`wms-proxy.ts`, `ortofoto-proxy.ts`, `history-proxy.ts`) vylepšeny:
- ✅ **Input validace**: Whitelist povolených WMS parametrů
- ✅ **Sanitizace**: Odstranění nebezpečných znaků z query parametrů
- ✅ **Timeouts**: 25 sekundový timeout pro externí requesty
- ✅ **Error handling**: Bezpečné error messages bez citlivých informací
- ✅ **Method validation**: Pouze GET a OPTIONS metody
- ✅ **Query length limit**: Maximální délka query stringu (2000 znaků)

### 3. Security.txt
- ✅ Vytvořen `.well-known/security.txt` podle RFC 9116
  - Kontaktní informace pro hlášení bezpečnostních chyb
  - Preferované jazyky (cs, en)
  - Expiration date
  - Canonical URL

### 4. Environment Variables
- ✅ Dokumentace v `ENV_SETUP.md`
- ✅ Auth0 konfigurace
- ✅ Poznámky o bezpečnosti environment variables

## 📋 Další doporučení

### Pro produkci:
1. **Přidejte OG image**: Vytvořte `/frontend/public/og-image.png` (1200x630px)
2. **Nastavte Auth0**: Nakonfigurujte production Auth0 tenant
3. **Monitoring**: Zvažte přidání Sentry nebo podobného nástroje
4. **Analytics**: Přidejte Google Analytics nebo Plausible
5. **HTTPS**: Ujistěte se, že Vercel automaticky používá HTTPS

### Testování:
- Použijte [securityheaders.com](https://securityheaders.com) pro ověření security headers
- Otestujte SEO pomocí [Google Search Console](https://search.google.com/search-console)
- Ověřte Open Graph tagy na [opengraph.xyz](https://www.opengraph.xyz/)
- Testujte robots.txt a sitemap.xml

## 🔗 Užitečné odkazy

- [RFC 9116 - security.txt](https://www.rfc-editor.org/rfc/rfc9116.html)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Documentation](https://schema.org/)

## 📝 Poznámky

- CSP politika je nastavena pro SPA s Auth0 a Mapbox
- Pokud přidáte další externí služby, nezapomeňte je přidat do CSP
- AI crawlery mají explicitní povolení pro indexování veřejného obsahu
- Protected routes (/map, /features) jsou v robots.txt označeny jako noindex

