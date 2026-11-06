import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ENV } from '../config/env';
import { SafeUser } from '../types';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  cin: string;
}

export const generateToken = (user: SafeUser): string => {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    cin: user.cin,
  };

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
};

export const generateRandomToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};
