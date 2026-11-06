import { db } from './database';
import { UserEntity, SafeUser } from '../types';

export const userRepository = {
  findAll(): SafeUser[] {
    return db.get('users').map(this.toSafeUser);
  },

  findById(id: string): UserEntity | undefined {
    return db.get('users').find((u) => u.id === id);
  },

  findByEmail(email: string): UserEntity | undefined {
    const normalized = email.trim().toLowerCase();
    return db.get('users').find((u) => u.email.toLowerCase() === normalized);
  },

  findByCin(cin: string): UserEntity | undefined {
    const normalized = cin.trim().toUpperCase();
    return db.get('users').find((u) => u.cin.toUpperCase() === normalized);
  },

  create(user: UserEntity): UserEntity {
    db.get('users').push(user);
    db.save();
    return user;
  },

  update(id: string, updates: Partial<UserEntity>): UserEntity | undefined {
    const user = this.findById(id);
    if (!user) return undefined;

    Object.assign(user, updates, { updatedAt: new Date().toISOString().split('T')[0] });
    db.save();
    return user;
  },

  delete(id: string): boolean {
    const users = db.get('users');
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return false;

    users.splice(index, 1);
    db.save();
    return true;
  },

  toSafeUser(user: UserEntity): SafeUser {
    const { passwordHash, emailToken, resetToken, resetExpires, ...safe } = user;
    return safe;
  },
};
