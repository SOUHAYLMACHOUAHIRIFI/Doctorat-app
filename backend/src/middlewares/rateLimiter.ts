import rateLimit from 'express-rate-limit';
import { ENV } from '../config/env';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.AUTH_RATE_LIMIT_MAX, // max 10 failed/repeated auth requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion infructueuses. Veuillez patienter 15 minutes avant de réessayer.',
  },
});

export const generalApiLimiter = rateLimit({
  windowMs: ENV.RATE_LIMIT_WINDOW_MS,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Limite de requêtes API atteinte. Veuillez ralentir.',
  },
});
