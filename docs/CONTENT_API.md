# Content API - Dokumentace pro AI generátor

Tato dokumentace popisuje formát dat pro automatické vkládání článků do eArcheo Magazínu.

## Současný stav

Aktuálně jsou články uloženy **staticky** v souboru:
```
frontend/src/data/articles.ts
```

V budoucnu bude implementován API endpoint pro programatické vkládání.

---

## Datová struktura článku

### TypeScript definice

```typescript
type ArticleCategory = 'numismatika' | 'archeologie' | 'historie';

type Article = {
  id: string;           // Unikátní ID (generuje se automaticky)
  slug: string;         // URL slug (generuje se z title)
  title: string;        // Nadpis článku
  excerpt: string;      // Krátký popis (1-2 věty, max 160 znaků pro SEO)
  content: string;      // Obsah v Markdown formátu
  category: ArticleCategory;
  publishedAt: string;  // Datum publikace (ISO 8601: "2024-12-01")
  coverImage: string;   // URL cover obrázku
  focusKeyword: string; // Hlavní SEO klíčové slovo
};
```

### Příklad JSON payloadu

```json
{
  "title": "Objev 40 000 římských mincí ve francouzské vesnici Senon",
  "excerpt": "Ve francouzském Senonu archeologové objevili tři nádoby se zhruba 40 000 římskými mincemi z 3.–4. století n. l.",
  "content": "# Objev 40 000 římských mincí...\n\n*Perex článku*\n\n## První sekce\n\nObsah...",
  "category": "numismatika",
  "publishedAt": "2024-12-01",
  "coverImage": "https://example.com/image.jpg",
  "focusKeyword": "římské mince Senon"
}
```

---

## Formát obsahu (Markdown)

Obsah článku používá standardní **GitHub Flavored Markdown**:

### Podporované prvky

| Prvek | Syntax |
|-------|--------|
| Nadpisy | `# H1`, `## H2`, `### H3` |
| Tučné | `**text**` |
| Kurzíva | `*text*` |
| Seznamy | `- item` nebo `1. item` |
| Odkazy | `[text](url)` |
| Obrázky | `![alt](url)` |
| Kód | `` `inline` `` nebo ` ``` block ``` ` |
| Citace | `> citát` |

### Interní odkazy

Pro odkazy na jiné články používejte **absolutní cesty**:

```markdown
[Další článek](/magazin/slug-clanku)
```

**NE relativní cesty** jako `./slug.md`.

---

## Kategorie

Povolené hodnoty pro `category`:

| Hodnota | Popis | Barva UI |
|---------|-------|----------|
| `numismatika` | Mince, bankovky, numismatické nálezy | Amber |
| `archeologie` | Archeologické nálezy, výzkumy | Emerald |
| `historie` | Historické události, dokumenty | Purple |

---

## Cover obrázky

### Požadavky

- **Rozměry**: Ideálně 1200x630px (poměr 1.91:1 pro OG image)
- **Formát**: JPG nebo WebP
- **Velikost**: Max 500 KB
- **Hosting**: Veřejně dostupná URL

### Placeholder pro testování

```
https://picsum.photos/seed/{unique-id}/1200/630
```

---

## Budoucí API endpoint

### POST /api/articles

**Autorizace**: Bearer token (API key)

```bash
curl -X POST https://earcheo.cz/api/articles \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "...",
    "excerpt": "...",
    "content": "...",
    "category": "numismatika",
    "publishedAt": "2024-12-01",
    "coverImage": "https://...",
    "focusKeyword": "..."
  }'
```

**Response (201 Created)**:

```json
{
  "id": "clxyz123",
  "slug": "nazev-clanku",
  "title": "...",
  "publishedAt": "2024-12-01",
  "url": "https://earcheo.cz/magazin/nazev-clanku"
}
```

---

## SEO doporučení

1. **Title**: 50-60 znaků
2. **Excerpt/Description**: 150-160 znaků
3. **Focus keyword**: Použít v title, excerpt i prvním odstavci
4. **Headings**: Hierarchická struktura (H1 → H2 → H3)
5. **Interní odkazy**: Prolinkovat související články
6. **Obrázky**: Alt text pro přístupnost

---

## Workflow

```
AI Generátor
     │
     ▼
POST /api/articles (status: DRAFT)
     │
     ▼
Admin review v eArcheo
     │
     ▼
PATCH /api/articles/:id (status: PUBLISHED)
     │
     ▼
Článek živý na /magazin/:slug
```

---

## Kontakt

Pro technické dotazy: **podpora@earcheo.cz**
