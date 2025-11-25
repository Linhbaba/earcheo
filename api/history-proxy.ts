import type { VercelRequest, VercelResponse } from '@vercel/node';

// Císařské otisky stabilního katastru (1824–1843)
const HISTORY_TARGET_URL = 'https://ags.cuzk.cz/arcgis/services/Cisarske_otisky/MapServer/WMSServer';
const TIMEOUT_MS = 25000; // 25 seconds
const MAX_QUERY_LENGTH = 2000;

// Whitelist of allowed WMS parameters
const ALLOWED_WMS_PARAMS = [
  'service', 'version', 'request', 'layers', 'styles', 'format',
  'transparent', 'width', 'height', 'crs', 'bbox', 'srs', 'time'
];

function validateAndSanitizeParams(query: Record<string, string | string[]>): URLSearchParams {
  const params = new URLSearchParams();
  
  for (const [key, value] of Object.entries(query)) {
    const lowerKey = key.toLowerCase();
    
    // Only allow whitelisted parameters
    if (!ALLOWED_WMS_PARAMS.includes(lowerKey)) {
      continue;
    }
    
    // Sanitize value - convert to string and remove any suspicious characters
    const stringValue = Array.isArray(value) ? value[0] : value;
    const sanitized = String(stringValue).replace(/[<>'"]/g, '');
    
    params.append(key, sanitized);
  }
  
  return params;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow GET and OPTIONS
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // Validate and sanitize query parameters
    const queryParams = validateAndSanitizeParams(req.query as Record<string, string>);
    const queryString = queryParams.toString();
    
    // Check query string length
    if (queryString.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({ error: 'Query string too long' });
    }
    
    const targetUrl = `${HISTORY_TARGET_URL}?${queryString}`;

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://geoportal.cuzk.cz/',
      },
        signal: controller.signal
    });

      clearTimeout(timeoutId);

    if (!response.ok) {
        console.error(`History proxy error: ${response.status}`);
        return res.status(502).json({ error: 'Upstream service error' });
    }

    // Get the image data as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Forward content type
    const contentType = response.headers.get('content-type') || 'image/png';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    
    return res.send(buffer);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      
      if (fetchError && typeof fetchError === 'object' && 'name' in fetchError && fetchError.name === 'AbortError') {
        return res.status(504).json({ error: 'Request timeout' });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error('History Proxy Error:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
