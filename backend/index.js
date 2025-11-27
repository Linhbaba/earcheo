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

// HISTORICAL MAP PROXY (Císařské otisky)
app.get('/api/history-proxy', async (req, res) => {
    try {
        // Císařské otisky stabilního katastru (1824–1843)
        const targetUrl = 'https://ags.cuzk.cz/arcgis/services/Cisarske_otisky/MapServer/WMSServer';
        
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
        console.error("Proxy Error (History):", error.message);
        let errorData = "Error fetching historical map";
        if (error.response) {
            console.error("Status:", error.response.status);
            const dataStr = error.response.data.toString();
            console.error("Data Preview:", dataStr.substring(0, 500));
            errorData = `Proxy Error: ${error.response.status} - ${dataStr.substring(0, 200)}`;
        }
        res.status(500).send(errorData);
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

const PORT = 3010;
app.listen(PORT, () => {
    console.log(`[SYSTEM] Backend Proxy Online on port ${PORT}`);
    console.log(`[SYSTEM] WMS: ČÚZK DMR 5G`);
    console.log(`[SYSTEM] API: Proxying to ${PROD_API}`);
});

