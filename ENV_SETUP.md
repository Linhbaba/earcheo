# Environment Variables Setup

## Frontend Environment Variables

Pro správnou funkci aplikace vytvořte soubor `.env` v adresáři `frontend/` s následujícími proměnnými:

```env
# Auth0 Configuration
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=http://localhost:5173

# API Configuration (pro development)
VITE_API_BASE_URL=http://localhost:3010

# Development
NODE_ENV=development
```

## Auth0 Setup

1. Přihlaste se do [Auth0 Dashboard](https://manage.auth0.com/)
2. Vytvořte novou aplikaci typu "Single Page Application"
3. Nakonfigurujte:
   - **Allowed Callback URLs**: `http://localhost:5173, https://earcheo.cz`
   - **Allowed Logout URLs**: `http://localhost:5173, https://earcheo.cz`
   - **Allowed Web Origins**: `http://localhost:5173, https://earcheo.cz`
4. Zkopírujte Domain a Client ID do `.env` souboru

## Vercel Deployment

Pro nasazení na Vercel nastavte environment variables v Vercel Dashboard:

```
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your_client_id_here
VITE_AUTH0_AUDIENCE=https://your-api-identifier
VITE_AUTH0_REDIRECT_URI=https://earcheo.cz
```

## Poznámky

- Všechny proměnné s prefixem `VITE_` jsou veřejné a dostupné v prohlížeči
- Nikdy neukládejte citlivé údaje (API keys, secrets) do proměnných s prefixem `VITE_`
- Pro produkci vždy používejte HTTPS

