// Simple Express server for local development
import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Earcheo API Server' });
});

// API Routes - dynamically import from api folder
const apiRoutes = [
  { path: '/api/profile', file: './api/profile.ts' },
  { path: '/api/equipment', file: './api/equipment/index.ts' },
  { path: '/api/equipment/:id', file: './api/equipment/[id].ts' },
  { path: '/api/findings', file: './api/findings/index.ts' },
  { path: '/api/findings/:id', file: './api/findings/[id].ts' },
  { path: '/api/findings/:id/images', file: './api/findings/[id]/images.ts' },
];

// Load API routes
async function loadRoutes() {
  for (const route of apiRoutes) {
    try {
      const module = await import(route.file);
      const handler = module.default;
      
      // Wrap Vercel-style handler to Express handler
      app.all(route.path, async (req, res) => {
        try {
          // Convert Express req/res to Vercel-style
          const vercelReq = {
            method: req.method,
            headers: req.headers,
            body: req.body,
            query: { ...req.query, ...req.params },
            url: req.url,
          };
          
          const vercelRes = {
            status: (code) => {
              res.status(code);
              return vercelRes;
            },
            json: (data) => {
              res.json(data);
            },
            send: (data) => {
              res.send(data);
            },
          };
          
          await handler(vercelReq, vercelRes);
        } catch (error) {
          console.error(`Error in ${route.path}:`, error);
          res.status(500).json({ error: 'Internal server error', message: error.message });
        }
      });
      
      console.log(`✓ Loaded ${route.path}`);
    } catch (error) {
      console.warn(`⚠ Failed to load ${route.path}:`, error.message);
    }
  }
}

// Start server
loadRoutes().then(() => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   eArcheo Development Server           ║
║   http://localhost:${PORT}              ║
╚════════════════════════════════════════╝

API Endpoints:
  GET    /api/profile
  POST   /api/profile
  PUT    /api/profile
  
  GET    /api/equipment
  POST   /api/equipment
  GET    /api/equipment/:id
  PUT    /api/equipment/:id
  DELETE /api/equipment/:id
  
  GET    /api/findings
  POST   /api/findings
  GET    /api/findings/:id
  PUT    /api/findings/:id
  DELETE /api/findings/:id
  POST   /api/findings/:id/images
  DELETE /api/findings/:id/images

Server started at ${new Date().toISOString()}
`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});

