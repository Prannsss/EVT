import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserPayload } from '../types/user.js';

export const generateToken = (payload: UserPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET) as UserPayload;
  } catch (error) {
    return null;
  }
};
