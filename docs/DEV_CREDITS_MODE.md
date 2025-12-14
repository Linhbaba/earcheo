# DEV Mode - Mock kredity pro lokální testování

## Problém

Při lokálním vývoji (`npm run dev`) backend proxy posílá API requesty na produkční server `https://earcheo.cz`. Endpoint `/api/credits` není v proxy definován a navíc by vyžadoval deployment na produkci.

## Řešení

Pro lokální testování AI analýzy jsou kredity mockované na hodnotu **9999**.

## Jak to funguje

V souboru `frontend/src/hooks/useCredits.ts`:

```typescript
// DEV MODE: Mock kredity pro lokální testování
const DEV_MOCK_CREDITS = import.meta.env.DEV;
```

Tato konstanta:
- `true` v development módu (`npm run dev`)
- `false` v produkci (build)

## Co se děje v DEV módu

1. Počáteční balance je **9999** místo 0
2. API call na `/api/credits` se přeskakuje
3. UI funguje normálně, jen s neomezenými kredity

## Jak zapnout produkční režim

### Možnost 1: Automaticky (doporučeno)
Při buildu (`npm run build`) je `import.meta.env.DEV` automaticky `false`.

### Možnost 2: Ručně pro testování
Změň v `useCredits.ts`:
```typescript
const DEV_MOCK_CREDITS = false; // Vynutit produkční chování
```

## Soubory k úpravě pro plnou produkci

1. **`frontend/src/hooks/useCredits.ts`** - smazat/upravit `DEV_MOCK_CREDITS`
2. **`backend/index.js`** - přidat routes pro:
   - `/api/credits`
   - `/api/admin/credits`
   - `/api/findings/:id/analyze`

## Poznámky

- Mock kredity se NEODEČÍTAJÍ při analýze (API call se neprovádí)
- Pro reálné testování kreditového systému je nutný deployment na Vercel
- Databázové tabulky (`UserCredits`, `CreditTransaction`, `FindingAnalysis`) jsou připravené

---

*Vytvořeno: 2024-12-14*

