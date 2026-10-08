import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { loginSchema } from '../../shared/schemas';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { HttpError } from '../lib/errors';
import { requireAuth, signToken } from '../middleware/auth';

export const authRouter = Router();

// Dipakai saat email tidak ditemukan, agar waktu respons tetap sama
const DUMMY_HASH = bcrypt.hashSync('dummy-password', 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60_000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Terlalu banyak percobaan login, coba lagi nanti' } },
});

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

authRouter.post('/login', loginLimiter, async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !valid) throw new HttpError(401, 'Email atau password salah');

  const token = signToken({ id: user.id, role: user.role });
  res.cookie('token', token, cookieOptions);
  res.json({ user: { id: user.id, role: user.role } });
});

authRouter.post('/logout', (_req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax' });
  res.json({ ok: true });
});

authRouter.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});