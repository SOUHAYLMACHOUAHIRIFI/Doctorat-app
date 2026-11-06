import { userRepository } from '../repositories/userRepository';
import { db } from '../repositories/database';
import { hashPassword, verifyPassword, generateToken, generateRandomToken } from '../utils/security';
import { auditService } from './auditService';
import { notificationService } from './notificationService';
import { ROLES } from '../config/constants';
import { UserEntity, SafeUser, CandidateEntity } from '../types';

export const authService = {
  async registerCandidate(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    cin: string;
    phone: string;
    etablissementOrigine: string;
    diplomeOrigine: string;
    ipAddress?: string;
  }): Promise<{ user: SafeUser; token: string }> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedCin = data.cin.trim().toUpperCase();

    // Enforce institutional domain
    if (!normalizedEmail.endsWith('@usmba.ac.ma')) {
      throw new Error('L’inscription nécessite impérativement une adresse email institutionnelle (@usmba.ac.ma).');
    }

    // Check existing email
    const existingByEmail = userRepository.findByEmail(normalizedEmail);
    if (existingByEmail) {
      throw new Error('Cette adresse email est déjà enregistrée sur la plateforme.');
    }

    // Check existing CIN
    const existingByCin = userRepository.findByCin(normalizedCin);
    if (existingByCin) {
      throw new Error('Ce code CIN est déjà associé à un compte existant.');
    }

    const passwordHash = await hashPassword(data.password);
    const userId = `usr-cand-${Date.now().toString(36)}`;
    const now = new Date().toISOString().split('T')[0];

    const newUser: UserEntity = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      cin: normalizedCin,
      phone: data.phone.trim(),
      establishment: data.etablissementOrigine.trim(),
      role: ROLES.CANDIDATE,
      isActive: true,
      isEmailVerified: true, // Activated for institutional @usmba.ac.ma
      createdAt: now,
      updatedAt: now,
    };

    userRepository.create(newUser);

    // Create Candidate entity record
    const candidateProfile: CandidateEntity = {
      id: `cand-${Date.now().toString(36)}`,
      userId,
      etablissementOrigine: data.etablissementOrigine.trim(),
      diplomeOrigine: data.diplomeOrigine.trim(),
      createdAt: now,
      updatedAt: now,
    };

    db.get('candidates').push(candidateProfile);
    db.save();

    const safeUser = userRepository.toSafeUser(newUser);
    const token = generateToken(safeUser);

    // Log in audit trail
    auditService.log(
      safeUser.email,
      safeUser.role,
      'REGISTER_CANDIDATE',
      'User',
      safeUser.id,
      { cin: safeUser.cin, etablissement: data.etablissementOrigine },
      safeUser.id,
      data.ipAddress
    );

    // Send welcome notification
    notificationService.notify(
      safeUser.id,
      'Compte candidat créé avec succès',
      'Bienvenue sur la plateforme GCD USMBA. Passez à l’Étape 1 pour scanner vos 4 pièces obligatoires.',
      'SUCCESS'
    );

    return { user: safeUser, token };
  },

  async login(
    email: string,
    password: string,
    ipAddress?: string
  ): Promise<{ user: SafeUser; token: string }> {
    const user = userRepository.findByEmail(email);

    if (!user) {
      auditService.log(
        email,
        'UNKNOWN',
        'LOGIN_FAILED',
        'User',
        undefined,
        { reason: 'User not found' },
        undefined,
        ipAddress
      );
      throw new Error('Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.');
    }

    if (!user.isActive) {
      throw new Error('Votre compte est désactivé. Veuillez contacter l’administration du CED USMBA.');
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      auditService.log(
        user.email,
        user.role,
        'LOGIN_FAILED',
        'User',
        user.id,
        { reason: 'Invalid password' },
        user.id,
        ipAddress
      );
      throw new Error('Identifiants incorrects. Veuillez vérifier votre mot de passe.');
    }

    // Update last login
    const now = new Date().toISOString();
    userRepository.update(user.id, { lastLoginAt: now });

    const safeUser = userRepository.toSafeUser(user);
    const token = generateToken(safeUser);

    auditService.log(
      safeUser.email,
      safeUser.role,
      'LOGIN_SUCCESS',
      'User',
      safeUser.id,
      { role: safeUser.role },
      safeUser.id,
      ipAddress
    );

    return { user: safeUser, token };
  },

  async requestPasswordReset(email: string, ipAddress?: string): Promise<{ message: string }> {
    const user = userRepository.findByEmail(email);
    if (!user) {
      // Return safe message without exposing whether email exists
      return { message: 'Si un compte correspond à cette adresse, un lien de réinitialisation a été généré.' };
    }

    const resetToken = generateRandomToken();
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hour

    userRepository.update(user.id, {
      resetToken,
      resetExpires: expires,
    });

    auditService.log(
      user.email,
      user.role,
      'PASSWORD_RESET_REQUESTED',
      'User',
      user.id,
      { tokenGenerated: true },
      user.id,
      ipAddress
    );

    notificationService.notify(
      user.id,
      'Demande de réinitialisation de mot de passe',
      'Une demande de réinitialisation de mot de passe a été enregistrée pour votre compte.',
      'WARNING'
    );

    return { message: 'Si un compte correspond à cette adresse, un lien de réinitialisation a été généré.' };
  },

  async confirmPasswordReset(token: string, newPass: string, ipAddress?: string): Promise<{ success: boolean }> {
    const users = db.get('users');
    const user = users.find((u) => u.resetToken === token);

    if (!user || !user.resetExpires) {
      throw new Error('Le lien ou jeton de réinitialisation est invalide ou expiré.');
    }

    if (new Date(user.resetExpires) < new Date()) {
      throw new Error('Ce jeton de réinitialisation a expiré. Veuillez renouveler votre demande.');
    }

    const passwordHash = await hashPassword(newPass);
    userRepository.update(user.id, {
      passwordHash,
      resetToken: undefined,
      resetExpires: undefined,
    });

    auditService.log(
      user.email,
      user.role,
      'PASSWORD_RESET_COMPLETED',
      'User',
      user.id,
      {},
      user.id,
      ipAddress
    );

    notificationService.notify(
      user.id,
      'Mot de passe mis à jour',
      'Votre mot de passe a été réinitialisé avec succès.',
      'SUCCESS'
    );

    return { success: true };
  },

  updateProfile(userId: string, data: Partial<UserEntity>): SafeUser {
    const updated = userRepository.update(userId, data);
    if (!updated) {
      throw new Error('Utilisateur non trouvé.');
    }
    return userRepository.toSafeUser(updated);
  },
};
