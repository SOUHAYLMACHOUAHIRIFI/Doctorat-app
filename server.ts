import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import apiRouter from './backend/src/routes/index';
import { errorHandler } from './backend/src/middlewares/errorHandler';
import { ENV } from './backend/src/config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // Parse CLI flags like --port 3000 --host 0.0.0.0
  const portArgIndex = process.argv.indexOf('--port');
  const cliPort = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? parseInt(process.argv[portArgIndex + 1], 10) : NaN;
  const PORT = !isNaN(cliPort) && cliPort > 0 ? cliPort : (ENV.PORT || 3000);

  const hostArgIndex = process.argv.indexOf('--host');
  const HOST = hostArgIndex !== -1 && process.argv[hostArgIndex + 1] ? process.argv[hostArgIndex + 1] : '0.0.0.0';

  // Trust reverse proxy (Cloud Run, Envoy, Nginx) so client IP and protocol are properly recognized
  app.set('trust proxy', 1);

  // 1. Security & Core Middlewares
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Vite inline scripts and blob/data: URLs in development
      crossOriginEmbedderPolicy: false,
    })
  );

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // 2. REST API Routes
  app.use('/api', apiRouter);

  // 3. Centralized API Error Handler
  app.use(errorHandler);

  // 4. Frontend Integration (Vite in dev, static files in production)
  if (ENV.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Fallback for HTML entry in dev mode to guarantee 200 OK on any direct sub-path
    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });

    console.log('⚡ Vite dev server middleware mounted with SPA fallback');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`📦 Serving static build from: ${distPath}`);
  }

  // 5. Start listening
  const server = app.listen(PORT, HOST, () => {
    console.log(`================================================================`);
    console.log(`🏛️  GCD USMBA — Gestion du Cycle Doctoral (Université Sidi Mohamed Ben Abdellah)`);
    console.log(`🚀 Serveur Full-Stack opérationnel sur http://${HOST}:${PORT}`);
    console.log(`🔒 Sécurité : RBAC, JWT HttpOnly Cookies, Bcrypt, Helmet & RateLimiter`);
    console.log(`📁 Base de données relationnelle centralisée : data/gcd_database.json`);
    console.log(`================================================================`);
  });

  // Graceful shutdown handling
  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
