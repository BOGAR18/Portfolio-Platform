import path from 'node:path';
import fs from 'node:fs';
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

const app = express();

app.disable('x-powered-by');
// Render berada di belakang proxy. Tanpa ini, rate limit membaca IP proxy, bukan IP pengunjung
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

app.use('/api', rateLimit({ windowMs: 60_000, limit: 120, standardHeaders: 'draft-7', legacyHeaders: false }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/projects', projectsRouter);
app.use('/api/profile', profileRouter);
app.use('/api/contact', contactRouter);
app.use('/api/chat', chatRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api', (_req, res) => res.status(404).json({ error: { message: 'Endpoint tidak ditemukan' } }));

// Saat production, Express juga menyajikan hasil build React (folder dist/)
const distPath = path.resolve('dist');
if (env.NODE_ENV === 'production' && fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Semua path selain /api dikembalikan ke index.html, agar refresh di /projects/abc tidak 404
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server berjalan di port ${env.PORT}`);
});