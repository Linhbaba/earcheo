#!/bin/bash
# Skript pro kontrolu běžících služeb

echo "🔍 Kontrola běžících služeb..."
echo ""

# Barvy pro výstup
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Kontrola Node.js proxy (port 3010)
if lsof -i :3010 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Node.js proxy běží na portu 3010${NC}"
else
    echo -e "${RED}❌ Node.js proxy NEBĚŽÍ na portu 3010${NC}"
    echo -e "${YELLOW}   Spusťte: cd backend && node index.js${NC}"
fi

# Kontrola Vite dev server (port 5173)
if lsof -i :5173 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Vite dev server běží na portu 5173${NC}"
else
    echo -e "${RED}❌ Vite dev server NEBĚŽÍ na portu 5173${NC}"
    echo -e "${YELLOW}   Spusťte: cd frontend && npm run dev${NC}"
fi

# Kontrola Python backend (port 8000) - volitelné
if lsof -i :8000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Python backend běží na portu 8000${NC}"
else
    echo -e "${YELLOW}⚠️  Python backend neběží (volitelné pro NDVI)${NC}"
fi

echo ""
echo "🌐 Testování dostupnosti..."

# Test frontendu
if curl -s http://localhost:5173 > /dev/null; then
    echo -e "${GREEN}✅ Frontend je dostupný na http://localhost:5173${NC}"
else
    echo -e "${RED}❌ Frontend není dostupný${NC}"
fi

# Test API proxy
if curl -s http://localhost:3010/api/findings > /dev/null; then
    echo -e "${GREEN}✅ API proxy odpovídá na requesty${NC}"
else
    echo -e "${RED}❌ API proxy neodpovídá${NC}"
fi

echo ""
echo "📋 Environment proměnné (frontend/.env):"

if [ -f "frontend/.env" ]; then
    if grep -q "VITE_AUTH0_AUDIENCE" frontend/.env; then
        echo -e "${GREEN}✅ VITE_AUTH0_AUDIENCE je nastaven${NC}"
    else
        echo -e "${RED}❌ VITE_AUTH0_AUDIENCE CHYBÍ${NC}"
    fi
    
    if grep -q "VITE_MAPBOX_TOKEN" frontend/.env; then
        echo -e "${GREEN}✅ VITE_MAPBOX_TOKEN je nastaven${NC}"
    else
        echo -e "${RED}❌ VITE_MAPBOX_TOKEN CHYBÍ${NC}"
    fi
    
    if grep -q "VITE_AUTH0_DOMAIN" frontend/.env; then
        echo -e "${GREEN}✅ VITE_AUTH0_DOMAIN je nastaven${NC}"
    else
        echo -e "${RED}❌ VITE_AUTH0_DOMAIN CHYBÍ${NC}"
    fi
    
    if grep -q "VITE_AUTH0_CLIENT_ID" frontend/.env; then
        echo -e "${GREEN}✅ VITE_AUTH0_CLIENT_ID je nastaven${NC}"
    else
        echo -e "${RED}❌ VITE_AUTH0_CLIENT_ID CHYBÍ${NC}"
    fi
else
    echo -e "${RED}❌ Soubor frontend/.env neexistuje!${NC}"
fi

echo ""
echo "✨ Vše hotovo! Pokud všechny služby běží, otevřete:"
echo -e "${GREEN}   👉 http://localhost:5173${NC}"


