import type { VercelRequest, VercelResponse } from '@vercel/node';

const WMS_TARGET_URL = 'https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(200).end();
  }

  try {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(req.query)) {
      if (typeof value === 'string') {
        params.append(key, value);
      }
    }

    const targetUrl = `${WMS_TARGET_URL}?${params.toString()}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://geoportal.cuzk.cz/',
      },
    });

    if (!response.ok) {
      return res.status(502).json({ error: 'Upstream error' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/png');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    
    return res.send(buffer);
  } catch (error) {
    console.error('WMS proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
