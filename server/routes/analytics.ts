import { createHash } from 'node:crypto';
import { Router, type Request } from 'express';
import rateLimit from 'express-rate-limit';
import { analyticsSchema } from '../../shared/schemas';
import { prisma } from '../lib/prisma';
import { env } from '../lib/env';
import { requireAuth, requireAdmin } from '../middleware/auth';

export const analyticsRouter = Router();

const analyticsLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
});

// Hash harian dari IP + user agent + secret. IP mentah tidak disimpan,
// dan hash tidak bisa dilacak lintas hari.
function visitorHash(req: Request): string {
  const day = new Date().toISOString().slice(0, 10);
  const raw = `${req.ip}|${req.get('user-agent') ?? ''}|${day}|${env.JWT_SECRET}`;
  return createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

analyticsRouter.post('/', analyticsLimiter, async (req, res) => {
  const { type, path } = analyticsSchema.parse(req.body);
  await prisma.analyticsEvent.create({
    data: { type, path, visitorHash: visitorHash(req) },
  });
  res.status(202).end();
});

analyticsRouter.get('/summary', requireAuth, requireAdmin, async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const events = await prisma.analyticsEvent.findMany({ where: { createdAt: { gte: since } } });

  const pageviews = events.filter((e) => e.type === 'pageview');
  const pathCounts = new Map<string, number>();
  for (const e of pageviews) pathCounts.set(e.path, (pathCounts.get(e.path) ?? 0) + 1);

  res.json({
    data: {
      pageviews: pageviews.length,
      uniqueVisitors: new Set(events.map((e) => e.visitorHash)).size,
      cvDownloads: events.filter((e) => e.type === 'cv_download').length,
      topPages: [...pathCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, views]) => ({ path, views })),
    },
  });
});