import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'gcd_usmba_jwt_super_secure_key_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_MAX_AGE: parseInt(process.env.SESSION_MAX_AGE || '604800000', 10), // 7 days in ms
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  AUTH_RATE_LIMIT_MAX: parseInt(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS || '10', 10),
  INSTITUTIONAL_EMAIL_DOMAIN: process.env.INSTITUTIONAL_EMAIL_DOMAIN || '@usmba.ac.ma',
};
