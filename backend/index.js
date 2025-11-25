const express = require('express');
const cors = require('cors');
const axios = require('axios');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});
const app = express();

app.use(cors());

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

const PORT = 3010;
app.listen(PORT, () => {
    console.log(`[SYSTEM] Backend Proxy Online on port ${PORT}`);
    console.log(`[SYSTEM] Target: ČÚZK DMR 5G WMS`);
});

