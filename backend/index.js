const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});
const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON bodies

// ČÚZK WMS Proxy Endpoint
// Frontend will call: http://localhost:3001/api/wms-proxy?bbox=...&width=...
app.get('/api/wms-proxy', async (req, res) => {
    try {
        // Cílová URL ČÚZK (ta, která funguje v prohlížeči, ale blokuje CORS)
        // Nebo použijeme tu z ArcGIS Serveru, která je stabilnější
        const targetUrl = 'https://ags.cuzk.gov.cz/arcgis2/services/dmr5g/ImageServer/WMSServer';
        
        // Forward all query params
        const response = await axios.get(targetUrl, {
            params: req.query,
            responseType: 'arraybuffer', // Důležité pro obrázky!
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://geoportal.cuzk.cz/'
            }
        });

        // Forward Content-Type header (image/png)
        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error (LiDAR):", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data.toString());
        }
        res.status(500).send("Error fetching data from ČÚZK");
    }
});

// ORTOFOTO PROXY (ČÚZK Ortofoto ČR)
app.get('/api/ortofoto-proxy', async (req, res) => {
    try {
        // ČÚZK Ortofoto WMS služba (správný endpoint z GetCapabilities)
        const targetUrl = 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_PUB/service.svc/get';
        
        // Forward all query params
        const response = await axios.get(targetUrl, {
            params: req.query,
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Referer': 'https://geoportal.cuzk.cz/'
            }
        });

        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error (Ortofoto):", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data.toString());
        }
        res.status(500).send("Error fetching ortofoto from ČÚZK");
    }
});

// ARCHIVNÍ ORTOFOTO PROXY (1998-2022) - ČÚZK WMS
app.get('/api/ortofoto-archive-proxy', async (req, res) => {
    try {
        // Správná URL s prohlížečovými hlavičkami
        const targetUrl = 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_ARCHIV/service.svc/get';
        
        const response = await axios.get(targetUrl, {
            params: req.query,
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://geoportal.cuzk.cz/',
                'Accept': 'image/png,image/*,*/*;q=0.8'
            }
        });

        res.set('Content-Type', response.headers['content-type'] || 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error (Archive Ortofoto):", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
        res.status(500).send("Error fetching archive ortofoto");
    }
});

// KATASTRÁLNÍ MAPY PROXY
app.get('/api/katastr-proxy', async (req, res) => {
    try {
        const targetUrl = 'https://services.cuzk.cz/wms/wms.asp';
        
        const response = await axios.get(targetUrl, {
            params: req.query,
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://geoportal.cuzk.cz/'
            }
        });

        res.set('Content-Type', response.headers['content-type']);
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error (Katastr):", error.message);
        res.status(500).send("Error fetching katastr");
    }
});

// UNIFIED PROXY ENDPOINT (matches Vercel API)
const ARCHIVE_VALID_YEARS = [
    1998, 1999, 2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008,
    2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018,
    2019, 2020, 2021, 2022
];

app.get('/api/proxy', async (req, res) => {
    const type = req.query.type;
    
    const TARGETS = {
        wms: 'https://ags.cuzk.cz/arcgis2/services/dmr5g/ImageServer/WMSServer',
        ortofoto: 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_PUB/service.svc/get',
        katastr: 'https://services.cuzk.gov.cz/wms/wms.asp',
        zabaged: 'https://ags.cuzk.gov.cz/arcgis/services/ZABAGED_VRSTEVNICE/MapServer/WMSServer',
        archive: 'https://geoportal.cuzk.gov.cz/WMS_ORTOFOTO_ARCHIV/WMService.aspx',
    };

    if (!type || !TARGETS[type]) {
        return res.status(400).json({ error: `Invalid type. Valid types: ${Object.keys(TARGETS).join(', ')}` });
    }

    try {
        // Clone query params and remove 'type'
        const params = { ...req.query };
        delete params.type;

        // Special handling for archive - year parameter
        if (type === 'archive') {
            const year = parseInt(params.year, 10) || 2003;
            if (!ARCHIVE_VALID_YEARS.includes(year)) {
                return res.status(400).json({ error: `Invalid year. Valid years: ${ARCHIVE_VALID_YEARS.join(', ')}` });
            }
            // ČÚZK WMS layers jsou pojmenované jen jako rok (např. "2010")
            params.layers = String(year);
            delete params.year;
        }

        const response = await axios.get(TARGETS[type], {
            params,
            responseType: 'arraybuffer',
            httpsAgent: agent,
            timeout: 25000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://geoportal.cuzk.cz/',
                'Accept': 'image/png,image/*,*/*;q=0.8'
            }
        });

        res.set('Content-Type', response.headers['content-type'] || 'image/png');
        res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
        res.send(response.data);

    } catch (error) {
        console.error(`Proxy Error (${type}):`, error.message);
        res.status(500).send(`Error fetching ${type}`);
    }
});

// ZABAGED VRSTEVNICE PROXY
app.get('/api/zabaged-proxy', async (req, res) => {
    try {
        const targetUrl = 'https://ags.cuzk.cz/arcgis/services/ZABAGED_VRSTEVNICE/MapServer/WMSServer';
        
        const response = await axios.get(targetUrl, {
            params: req.query,
            responseType: 'arraybuffer',
            httpsAgent: agent,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': 'https://geoportal.cuzk.cz/',
                'Accept': 'image/png,image/*,*/*;q=0.8'
            }
        });

        res.set('Content-Type', response.headers['content-type'] || 'image/png');
        res.send(response.data);

    } catch (error) {
        console.error("Proxy Error (Vrstevnice):", error.message);
        if (error.response) {
            console.error("Status:", error.response.status);
        }
        res.status(500).send("Error fetching vrstevnice");
    }
});

// DATABASE API PROXY - Forward to production Vercel API for development
// This allows local frontend to use the deployed API endpoints
const PROD_API = 'https://earcheo.cz';

// Generic API proxy handler
const proxyToVercel = async (req, res, endpoint) => {
    try {
        const method = req.method.toLowerCase();
        const url = `${PROD_API}${endpoint}`;
        
        console.log(`[PROXY] ${method.toUpperCase()} ${endpoint}`);
        
        // Clean headers - remove host and connection headers that cause issues
        const cleanHeaders = { ...req.headers };
        delete cleanHeaders.host;
        delete cleanHeaders.connection;
        delete cleanHeaders['content-length']; // Let axios calculate
        
        const config = {
            method,
            url,
            headers: cleanHeaders,
            httpsAgent: agent,
            validateStatus: () => true, // Don't throw on any status
        };

        // Add body for POST/PUT/PATCH
        if (['post', 'put', 'patch'].includes(method)) {
            config.data = req.body;
            console.log('[PROXY] Body:', JSON.stringify(req.body).substring(0, 200));
        }

        // Add query params
        if (Object.keys(req.query).length > 0) {
            config.params = req.query;
        }

        const response = await axios(config);
        
        console.log(`[PROXY] Response: ${response.status}`);
        
        // Forward status and data
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(`[PROXY ERROR] ${endpoint}:`, error.message);
        if (error.response) {
            console.error('[PROXY ERROR] Status:', error.response.status);
            console.error('[PROXY ERROR] Data:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Proxy error', message: error.message });
        }
    }
};

// Profile API
app.all('/api/profile', (req, res) => proxyToVercel(req, res, '/api/profile'));

// Equipment API
app.all('/api/equipment', (req, res) => proxyToVercel(req, res, '/api/equipment'));
app.all('/api/equipment/:id', (req, res) => proxyToVercel(req, res, `/api/equipment/${req.params.id}`));

// Findings API
app.all('/api/findings', (req, res) => proxyToVercel(req, res, '/api/findings'));
app.all('/api/findings/:id', (req, res) => proxyToVercel(req, res, `/api/findings/${req.params.id}`));
app.all('/api/findings/:id/images', (req, res) => proxyToVercel(req, res, `/api/findings/${req.params.id}/images`));

// Features API
app.all('/api/features', (req, res) => proxyToVercel(req, res, '/api/features'));
app.all('/api/features/:id', (req, res) => proxyToVercel(req, res, `/api/features/${req.params.id}`));
app.all('/api/features/:id/vote', (req, res) => proxyToVercel(req, res, `/api/features/${req.params.id}/vote`));

// Sectors API
app.all('/api/sectors', (req, res) => proxyToVercel(req, res, '/api/sectors'));
app.all('/api/sectors/:id', (req, res) => proxyToVercel(req, res, `/api/sectors/${req.params.id}`));

// Tracks API
app.all('/api/tracks', (req, res) => proxyToVercel(req, res, '/api/tracks'));
app.all('/api/tracks/:id', (req, res) => proxyToVercel(req, res, `/api/tracks/${req.params.id}`));

// Map Setups API
app.all('/api/map-setups', (req, res) => proxyToVercel(req, res, '/api/map-setups'));
app.all('/api/map-setups/:id', (req, res) => proxyToVercel(req, res, `/api/map-setups/${req.params.id}`));

// Custom Fields API
app.all('/api/custom-fields', (req, res) => proxyToVercel(req, res, '/api/custom-fields'));
app.all('/api/custom-fields/:id', (req, res) => proxyToVercel(req, res, `/api/custom-fields/${req.params.id}`));

// Stats API
app.all('/api/stats', (req, res) => proxyToVercel(req, res, '/api/stats'));

// Credits API (AI analýza)
app.all('/api/credits', (req, res) => proxyToVercel(req, res, '/api/credits'));

// Admin Credits API
app.all('/api/admin/credits', (req, res) => proxyToVercel(req, res, '/api/admin/credits'));

// Finding Analysis API
app.all('/api/findings/:id/analyze', (req, res) => proxyToVercel(req, res, `/api/findings/${req.params.id}/analyze`));

const PORT = 3010;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYSTEM] Backend Proxy Online on port ${PORT} (IPv4 + IPv6)`);
    console.log(`[SYSTEM] WMS: ČÚZK DMR 5G, Ortofoto, Archiv, Katastr, Vrstevnice`);
    console.log(`[SYSTEM] API: Proxying to ${PROD_API}`);
});

