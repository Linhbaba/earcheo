/**
 * Sdílená Edge Runtime utility pro WMS proxy endpointy
 * - Edge-compatible (Web APIs only, no Node.js Buffer)
 * - Validace parametrů (ochrana před abuse)
 * - Optimální caching pro CDN
 * - Error handling + timeout
 */

const TIMEOUT_MS = 25000; // 25 seconds
const MAX_QUERY_LENGTH = 2000;
const MAX_TILE_SIZE = 512; // max width/height pro ochranu před abuse

// Whitelist povolených WMS parametrů
const ALLOWED_WMS_PARAMS = [
  'service', 'version', 'request', 'layers', 'styles', 'format',
  'transparent', 'width', 'height', 'crs', 'bbox', 'srs', 'time'
];

interface ProxyConfig {
  targetUrl: string;
  serviceName: string; // Pro logging
}

/**
 * Validuje a sanitizuje query parametry
 */
function validateAndSanitizeParams(url: URL): { params: URLSearchParams; error?: string } {
  const params = new URLSearchParams();
  
  for (const [key, value] of url.searchParams.entries()) {
    const lowerKey = key.toLowerCase();
    
    // Pouze whitelisted parametry
    if (!ALLOWED_WMS_PARAMS.includes(lowerKey)) {
      continue;
    }
    
    // Sanitizace hodnoty
    const sanitized = String(value).replace(/[<>'"]/g, '');
    
    // Validace width/height
    if (lowerKey === 'width' || lowerKey === 'height') {
      const numValue = parseInt(sanitized, 10);
      if (isNaN(numValue) || numValue <= 0 || numValue > MAX_TILE_SIZE) {
        return {
          params,
          error: `Invalid ${lowerKey}: must be between 1 and ${MAX_TILE_SIZE}`
        };
      }
    }
    
    params.append(key, sanitized);
  }
  
  return { params };
}

/**
 * Edge-compatible WMS proxy handler
 */
export async function handleWmsProxy(request: Request, config: ProxyConfig): Promise<Response> {
  // Pouze GET a OPTIONS
  if (request.method !== 'GET' && request.method !== 'OPTIONS') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    const requestUrl = new URL(request.url);
    
    // Validace a sanitizace parametrů
    const { params, error } = validateAndSanitizeParams(requestUrl);
    
    if (error) {
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const queryString = params.toString();
    
    // Kontrola délky query stringu
    if (queryString.length > MAX_QUERY_LENGTH) {
      return new Response(JSON.stringify({ error: 'Query string too long' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const targetUrl = `${config.targetUrl}?${queryString}`;

    // Timeout pomocí AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const upstreamResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://geoportal.cuzk.cz/',
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!upstreamResponse.ok) {
        console.error(`${config.serviceName} proxy error: ${upstreamResponse.status}`);
        return new Response(JSON.stringify({ error: 'Upstream service error' }), {
          status: 502,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Edge-compatible: použít Response přímo, ne Buffer
      const contentType = upstreamResponse.headers.get('content-type') || 'image/png';
      
      // Optimální cache headers pro Vercel Edge CDN
      const headers = new Headers({
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'X-Content-Type-Options': 'nosniff',
        // s-maxage = CDN cache (24h)
        // max-age = browser cache (1h)
        // stale-while-revalidate = může vrátit starou verzi během revalidace (7 dní)
        'Cache-Control': 'public, s-maxage=86400, max-age=3600, stale-while-revalidate=604800',
      });

      // Vrátit odpověď přímo (Edge-compatible)
      return new Response(upstreamResponse.body, {
        status: 200,
        headers
      });

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      // Timeout error
      if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
        console.error(`${config.serviceName} timeout after ${TIMEOUT_MS}ms`);
        return new Response(JSON.stringify({ error: 'Request timeout' }), {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      throw fetchError;
    }
  } catch (error) {
    console.error(`${config.serviceName} Error:`, error instanceof Error ? error.message : 'Unknown error');
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

