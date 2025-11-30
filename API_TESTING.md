# API Testing Guide - Earcheo

Tento dokument popisuje, jak testovat REST API endpointy.

## Prerequisites

1. Databáze je vytvořená a migrovaná (viz `DATABASE_SETUP.md`)
2. Auth0 API je nakonfigurované
3. Environment variables jsou nastavené
4. Vercel Blob storage je vytvořený

## Získání Auth0 Tokenu

### Metoda 1: Z browseru (nejjednodušší)

1. Spusťte frontend: `cd frontend && npm run dev`
2. Přihlaste se přes Auth0
3. Otevřete DevTools → Console
4. Spusťte:
   ```javascript
   const auth = JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.includes('@@auth0spajs@@'))));
   console.log(auth.body.access_token);
   ```
5. Zkopírujte token

### Metoda 2: Pomocí Auth0 API

```bash
curl --request POST \
  --url https://dev-jsfkqesvxjhvsnkd.us.auth0.com/oauth/token \
  --header 'content-type: application/json' \
  --data '{
    "client_id":"YOUR_CLIENT_ID",
    "client_secret":"YOUR_CLIENT_SECRET",
    "audience":"https://api.earcheo.cz",
    "grant_type":"client_credentials"
  }'
```

## Lokální testování

### Spuštění Vercel Dev Server

```bash
# Z rootu projektu
npx vercel dev --listen 3000
```

Server poběží na `http://localhost:3000`

## API Endpointy

### 1. Profile API

#### GET /api/profile - Získat profil

```bash
curl http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{
  "id": "auth0|123456",
  "email": "user@example.com",
  "nickname": "TestUser",
  "bio": "Archeolog amatér",
  "avatarUrl": "https://...",
  "location": "Praha",
  "contact": "+420123456789",
  "experience": "5 let zkušeností",
  "socialLinks": [
    {
      "id": "cuid",
      "platform": "facebook",
      "url": "https://facebook.com/user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "favoriteLocations": [],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### POST /api/profile - Vytvořit profil (první přihlášení)

```bash
curl -X POST http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "nickname": "TestUser",
    "avatarUrl": "https://example.com/avatar.jpg"
  }'
```

**Response 201:** (stejná struktura jako GET)

#### PUT /api/profile - Aktualizovat profil

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nickname": "NewNickname",
    "bio": "Updated bio",
    "socialLinks": [
      {
        "platform": "instagram",
        "url": "https://instagram.com/user"
      }
    ],
    "favoriteLocations": [
      {
        "name": "Karlštejn",
        "latitude": 49.9394,
        "longitude": 14.1882,
        "notes": "Dobrá lokalita"
      }
    ]
  }'
```

**Response 200:** (aktualizovaný profil)

---

### 2. Equipment API

#### GET /api/equipment - Seznam vybavení

```bash
curl http://localhost:3000/api/equipment \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
[
  {
    "id": "cuid123",
    "userId": "auth0|123",
    "name": "Garrett ACE 400i",
    "type": "DETECTOR",
    "manufacturer": "Garrett",
    "model": "ACE 400i",
    "notes": "Velmi dobrý detektor",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### POST /api/equipment - Přidat vybavení

```bash
curl -X POST http://localhost:3000/api/equipment \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Garrett ACE 400i",
    "type": "DETECTOR",
    "manufacturer": "Garrett",
    "model": "ACE 400i",
    "notes": "Zakoupeno 2024"
  }'
```

**Response 201:** (vytvořené vybavení)

#### PUT /api/equipment/:id - Upravit vybavení

```bash
curl -X PUT http://localhost:3000/api/equipment/cuid123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "notes": "Aktualizované poznámky"
  }'
```

**Response 200:** (aktualizované vybavení)

#### DELETE /api/equipment/:id - Smazat vybavení

```bash
curl -X DELETE http://localhost:3000/api/equipment/cuid123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{ "success": true }
```

---

### 3. Findings API

#### GET /api/findings - Seznam nálezů

```bash
# Všechny nálezy
curl http://localhost:3000/api/findings \
  -H "Authorization: Bearer YOUR_TOKEN"

# S filtry
curl "http://localhost:3000/api/findings?category=coins&limit=10&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
[
  {
    "id": "cuid123",
    "userId": "auth0|123",
    "title": "Římská mince",
    "latitude": 50.0755,
    "longitude": 14.4378,
    "date": "2024-01-15T10:30:00Z",
    "description": "Stříbrná římská mince",
    "category": "coins",
    "condition": "good",
    "depth": 15.5,
    "locationName": "Pole u Prahy",
    "historicalContext": "Římské období",
    "material": "stříbro",
    "isPublic": false,
    "images": [
      {
        "id": "img123",
        "originalUrl": "https://blob.vercel-storage.com/...-original.webp",
        "thumbnailUrl": "https://blob.vercel-storage.com/...-thumb.webp",
        "mediumUrl": "https://blob.vercel-storage.com/...-medium.webp",
        "filename": "coin.jpg",
        "filesize": 123456,
        "order": 0
      }
    ],
    "equipment": [
      {
        "id": "eq123",
        "name": "Garrett ACE 400i",
        "type": "DETECTOR"
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
]
```

#### POST /api/findings - Vytvořit nález

```bash
curl -X POST http://localhost:3000/api/findings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Římská mince",
    "latitude": 50.0755,
    "longitude": 14.4378,
    "date": "2024-01-15T10:30:00Z",
    "description": "Nalezena stříbrná římská mince",
    "category": "coins",
    "condition": "good",
    "depth": 15.5,
    "locationName": "Pole u Prahy",
    "material": "stříbro",
    "isPublic": false,
    "equipmentIds": ["eq123"]
  }'
```

**Response 201:** (vytvořený nález)

#### PUT /api/findings/:id - Upravit nález

```bash
curl -X PUT http://localhost:3000/api/findings/cuid123 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Aktualizovaný název",
    "historicalContext": "Přidán historický kontext"
  }'
```

**Response 200:** (aktualizovaný nález)

#### DELETE /api/findings/:id - Smazat nález

```bash
curl -X DELETE http://localhost:3000/api/findings/cuid123 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{ "success": true }
```

---

### 4. Images API

#### POST /api/findings/:id/images - Nahrát fotku

```bash
# Připravte base64 obrázek
BASE64_IMAGE=$(base64 -w 0 photo.jpg)

curl -X POST http://localhost:3000/api/findings/cuid123/images \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"image\": \"data:image/jpeg;base64,$BASE64_IMAGE\",
    \"filename\": \"photo.jpg\"
  }"
```

**Response 201:**
```json
{
  "id": "img123",
  "findingId": "cuid123",
  "originalUrl": "https://blob.vercel-storage.com/...-original.webp",
  "thumbnailUrl": "https://blob.vercel-storage.com/...-thumb.webp",
  "mediumUrl": "https://blob.vercel-storage.com/...-medium.webp",
  "filename": "photo.jpg",
  "filesize": 234567,
  "order": 0,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### DELETE /api/findings/:id/images?imageId=xxx - Smazat fotku

```bash
curl -X DELETE "http://localhost:3000/api/findings/cuid123/images?imageId=img123" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response 200:**
```json
{ "success": true }
```

---

## Error Responses

### 400 Bad Request - Validace selhala

```json
{
  "error": "Validation error",
  "details": [
    {
      "code": "too_small",
      "minimum": 1,
      "type": "string",
      "path": ["title"],
      "message": "String must contain at least 1 character(s)"
    }
  ]
}
```

### 401 Unauthorized - Chybí nebo neplatný token

```json
{
  "error": "Invalid or missing token"
}
```

### 404 Not Found - Záznam neexistuje

```json
{
  "error": "Finding not found"
}
```

### 413 Payload Too Large - Soubor je příliš velký

```json
{
  "error": "Image too large. Maximum size is 10MB"
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to create finding"
}
```

---

## Postman Collection

Pro rychlejší testování můžete použít Postman:

1. Importujte tuto kolekci
2. Nastavte proměnnou `{{token}}` = váš Auth0 token
3. Nastavte proměnnou `{{baseUrl}}` = `http://localhost:3000` nebo `https://earcheo.cz`

```json
{
  "info": {
    "name": "Earcheo API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "item": [
    {
      "name": "Profile",
      "item": [
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "url": "{{baseUrl}}/api/profile"
          }
        }
      ]
    }
  ]
}
```

---

## Integration Testing

Pro automatizované testy použijte Vitest nebo Jest:

```typescript
import { describe, it, expect } from 'vitest';

describe('Profile API', () => {
  it('should get user profile', async () => {
    const response = await fetch('http://localhost:3000/api/profile', {
      headers: {
        'Authorization': `Bearer ${process.env.TEST_TOKEN}`
      }
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data).toHaveProperty('email');
  });
});
```

---

## Production Testing

Pro testování na production:

```bash
# Změňte baseUrl na production
export API_URL="https://earcheo.cz"

curl $API_URL/api/profile \
  -H "Authorization: Bearer YOUR_PROD_TOKEN"
```

**⚠️ Pozor:** Nemazejte production data při testování!

---

## Monitoring & Debugging

### Vercel Logs

```bash
vercel logs --follow
```

### Database Queries (Prisma Studio)

```bash
npx prisma studio
```

### Sharp Image Processing Debug

Přidejte do `api/_lib/image-processor.ts`:

```typescript
console.log('Processing image:', {
  inputSize: buffer.length,
  filename,
  folder
});
```

---

## Performance Benchmarks

**Expected latencies:**

- GET /api/profile: ~200ms (cold start ~2s)
- POST /api/findings: ~300ms
- POST /api/findings/:id/images: ~1-3s (závisí na velikosti)
- DELETE operations: ~150ms

**Image processing:**

- 2MB JPEG → 3× WebP: ~500ms
- 10MB JPEG → 3× WebP: ~2s

---

## Hotovo! 🎉

API je plně funkční a připravené na použití ve frontendu.





