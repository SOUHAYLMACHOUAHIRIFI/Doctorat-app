import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/authService';
import {
  loginSchema,
  candidateRegisterSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema,
  updateProfileSchema,
} from '../validators/authValidator';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { ENV } from '../config/env';

export const authController = {
  async registerCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = candidateRegisterSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const { user, token } = await authService.registerCandidate({
        ...validated,
        ipAddress,
      });

      // Set secure session cookie
      res.cookie('gcd_session_token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ENV.SESSION_MAX_AGE,
      });

      res.status(201).json({
        success: true,
        message: 'Compte candidat créé avec succès. Bienvenue sur GCD USMBA !',
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const { user, token } = await authService.login(validated.email, validated.password, ipAddress);

      // Set secure session cookie
      res.cookie('gcd_session_token', token, {
        httpOnly: true,
        secure: ENV.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ENV.SESSION_MAX_AGE,
      });

      res.json({
        success: true,
        message: 'Connexion réussie.',
        user,
        token,
      });
    } catch (err) {
      next(err);
    }
  },

  async logout(req: Request, res: Response): Promise<void> {
    res.clearCookie('gcd_session_token', {
      httpOnly: true,
      secure: ENV.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({
      success: true,
      message: 'Vous avez été déconnecté avec succès.',
    });
  },

  async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Non authentifié' });
      return;
    }

    res.json({
      success: true,
      user: req.user,
    });
  },

  async updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Non authentifié' });
        return;
      }

      const validated = updateProfileSchema.parse(req.body);
      const updatedUser = authService.updateProfile(req.user.id, validated);

      res.json({
        success: true,
        message: 'Profil mis à jour avec succès.',
        user: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  },

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordRequestSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      const result = await authService.requestPasswordReset(validated.email, ipAddress);
      res.json({
        success: true,
        message: result.message,
      });
    } catch (err) {
      next(err);
    }
  },

  async confirmPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validated = resetPasswordConfirmSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;

      await authService.confirmPasswordReset(validated.token, validated.newPassword, ipAddress);

      res.json({
        success: true,
        message: 'Votre mot de passe a été réinitialisé. Vous pouvez désormais vous connecter.',
      });
    } catch (err) {
      next(err);
    }
  },
};
