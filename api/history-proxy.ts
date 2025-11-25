import type { VercelRequest, VercelResponse } from '@vercel/node';

// Císařské otisky stabilního katastru (1824–1843)
const HISTORY_TARGET_URL = 'https://ags.cuzk.cz/arcgis/services/Cisarske_otisky/MapServer/WMSServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  try {
    // Build query string from request params
    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const targetUrl = `${HISTORY_TARGET_URL}?${queryParams.toString()}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://geoportal.cuzk.cz/',
      },
    });

    if (!response.ok) {
      console.error(`History proxy error: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Error fetching historical map: ${response.statusText}`);
    }

    // Get the image data as buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Forward content type
    const contentType = response.headers.get('content-type') || 'image/png';
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
    
    return res.send(buffer);
  } catch (error) {
    console.error('History Proxy Error:', error);
    return res.status(500).send('Error fetching historical map from ČÚZK');
  }
}

