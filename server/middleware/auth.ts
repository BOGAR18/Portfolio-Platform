import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env';
import { HttpError } from '../lib/errors';
import type { AuthUser } from '../../shared/types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function signToken(user: AuthUser): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: '7d',
  });
}

// Membaca token dari cookie HttpOnly. JavaScript di browser tidak bisa membacanya.
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.token as string | undefined;
  if (!token) return next(new HttpError(401, 'Anda belum login'));

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & { role: AuthUser['role'] };
    req.user = { id: payload.sub!, role: payload.role };
    next();
  } catch {
    next(new HttpError(401, 'Sesi sudah berakhir, silakan login ulang'));
  }
}

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return next(new HttpError(403, 'Akses hanya untuk admin'));
  next();
}