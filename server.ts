import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './backend/src/routes/index';
import { errorHandler } from './backend/src/middlewares/errorHandler';
import { ENV } from './backend/src/config/env';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = ENV.PORT || 3000;

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
    console.log('⚡ Vite dev server middleware mounted');
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`📦 Serving static build from: ${distPath}`);
  }

  // 5. Start listening on 0.0.0.0:3000
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`================================================================`);
    console.log(`🏛️  GCD USMBA — Gestion du Cycle Doctoral (Université Sidi Mohamed Ben Abdellah)`);
    console.log(`🚀 Serveur Full-Stack opérationnel sur http://0.0.0.0:${PORT}`);
    console.log(`🔒 Sécurité : RBAC, JWT HttpOnly Cookies, Bcrypt, Helmet & RateLimiter`);
    console.log(`📁 Base de données relationnelle centralisée : data/gcd_database.json`);
    console.log(`================================================================`);
  });
}

startServer().catch((err) => {
  console.error('Fatal Server Startup Error:', err);
  process.exit(1);
});
