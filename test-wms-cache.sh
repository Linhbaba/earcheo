#!/bin/bash
# Test script pro ověření Edge Runtime a cache headers
# Použití: ./test-wms-cache.sh [domain]
# Příklad: ./test-wms-cache.sh earcheo.cz

DOMAIN="${1:-earcheo.cz}"

echo "=== WMS Proxy Cache Headers Test ==="
echo "Domain: $DOMAIN"
echo ""

# Test WMS proxy
echo "1. Testing /api/wms-proxy (DMR5G hillshade)..."
curl -I "https://${DOMAIN}/api/wms-proxy?service=WMS&version=1.1.1&request=GetMap&layers=dmr5g:GrayscaleHillshade&styles=&bbox=1717081.4033982009,6517326.779707268,1718304.3958507627,6518549.77215983&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true" 2>&1 | grep -E "(HTTP|cache-control|x-vercel-cache|content-type|x-vercel-id)"
echo ""

# Test Ortofoto proxy
echo "2. Testing /api/ortofoto-proxy..."
curl -I "https://${DOMAIN}/api/ortofoto-proxy?service=WMS&version=1.1.1&request=GetMap&layers=GR_ORTFOTORGB&styles=&bbox=1717081.4033982009,6517326.779707268,1718304.3958507627,6518549.77215983&width=256&height=256&srs=EPSG:3857&format=image/png" 2>&1 | grep -E "(HTTP|cache-control|x-vercel-cache|content-type|x-vercel-id)"
echo ""

# Test History proxy
echo "3. Testing /api/history-proxy..."
curl -I "https://${DOMAIN}/api/history-proxy?service=WMS&version=1.1.1&request=GetMap&layers=0&styles=&bbox=1717081.4033982009,6517326.779707268,1718304.3958507627,6518549.77215983&width=256&height=256&srs=EPSG:3857&format=image/png&transparent=true" 2>&1 | grep -E "(HTTP|cache-control|x-vercel-cache|content-type|x-vercel-id)"
echo ""

echo "=== Co hledat ==="
echo "✓ cache-control: public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800"
echo "✓ x-vercel-cache: MISS (první request) nebo HIT (cached request)"
echo "✓ x-vercel-id: mělo by být edge runtime (kratší ID než serverless)"
echo ""
echo "=== Test size validation ==="
echo "4. Testing width validation (should fail with 400)..."
curl -I "https://${DOMAIN}/api/wms-proxy?service=WMS&version=1.1.1&request=GetMap&layers=dmr5g:GrayscaleHillshade&width=2048&height=256&bbox=0,0,1,1&srs=EPSG:3857&format=image/png" 2>&1 | grep -E "(HTTP|error)"
echo ""

