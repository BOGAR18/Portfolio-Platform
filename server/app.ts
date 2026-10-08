import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './lib/env';
import { errorHandler } from './middleware/errorHandler';
import { authRouter } from './routes/auth';
import { projectsRouter } from './routes/projects';
import { profileRouter } from './routes/profile';
import { contactRouter } from './routes/contact';
import { chatRouter } from './routes/chat';
import { analyticsRouter } from './routes/analytics';

export const app = express();

app.disable('x-powered-by');
// Vercel berada di belakang proxy. Tanpa ini, rate limit membaca IP proxy, bukan IP pengunjung
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/session', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contact', contactRouter);
app.use('/api/chat', chatRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: { message: 'Endpoint tidak ditemukan' } }));
app.use(errorHandler);