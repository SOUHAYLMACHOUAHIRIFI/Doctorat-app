import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/security';
import { userRepository } from '../repositories/userRepository';
import { SafeUser } from '../types';

export interface AuthenticatedRequest extends Request {
  user?: SafeUser;
}

export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    // 1. Try reading from signed/HttpOnly cookie
    if (req.cookies && req.cookies.gcd_session_token) {
      token = req.cookies.gcd_session_token;
    }

    // 2. Or from Authorization header (Bearer)
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Accès non autorisé : Vous devez être connecté pour accéder à cette ressource.',
      });
      return;
    }

    const payload = verifyToken(token);
    const user = userRepository.findById(payload.userId);

    if (!user || !user.isActive) {
      res.status(401).json({
        success: false,
        message: 'Session expirée ou compte désactivé. Veuillez vous reconnecter.',
      });
      return;
    }

    req.user = userRepository.toSafeUser(user);
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      message: 'Jeton de session invalide ou expiré.',
    });
  }
};

export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    let token: string | undefined;

    if (req.cookies && req.cookies.gcd_session_token) {
      token = req.cookies.gcd_session_token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const payload = verifyToken(token);
      const user = userRepository.findById(payload.userId);
      if (user && user.isActive) {
        req.user = userRepository.toSafeUser(user);
      }
    }
  } catch (err) {
    // Ignore invalid optional tokens
  }
  next();
};
