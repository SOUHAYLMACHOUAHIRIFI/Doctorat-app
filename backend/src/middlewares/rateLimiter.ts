import rateLimit from 'express-rate-limit';
import type { Request } from 'express';
import { ENV } from '../config/env';

/**
 * Resolves the real client IP accurately in proxy environments (e.g. Google Cloud Run, Envoy)
 * using standard headers while preventing rate-limit misidentification.
 */
export const getClientIp = (req: Request): string => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim().length > 0) {
    return forwarded.split(',')[0].trim();
  }
  const standardForwarded = req.headers['forwarded'];
  if (typeof standardForwarded === 'string' && standardForwarded.trim().length > 0) {
    const match = standardForwarded.match(/for="?([^;,"]+)/i);
    if (match && match[1]) {
      return match[1].replace(/^\[|\]:\d+$/g, '').trim();
    }
  }
  return req.ip || req.socket?.remoteAddress || '127.0.0.1';
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: ENV.AUTH_RATE_LIMIT_MAX, // max 10 failed/repeated auth requests per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    trustProxy: false,
  },
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
  keyGenerator: (req) => getClientIp(req),
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
    trustProxy: false,
  },
  message: {
    success: false,
    message: 'Limite de requêtes API atteinte. Veuillez ralentir.',
  },
});
