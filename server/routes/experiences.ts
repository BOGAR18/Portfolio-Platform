import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { experienceInputSchema } from '../../shared/schemas';

export const experiencesRouter = Router();

// Semua endpoint di sini hanya untuk admin
experiencesRouter.use(requireAuth, requireAdmin);

experiencesRouter.get('/', async (_req, res) => {
  const data = await prisma.experience.findMany({ orderBy: { order: 'asc' } });
  res.json({ data });
});

experiencesRouter.post('/', async (req, res) => {
  const data = experienceInputSchema.parse(req.body);
  const created = await prisma.experience.create({ data });
  res.status(201).json({ data: created });
});

experiencesRouter.put('/:id', async (req, res) => {
  const data = experienceInputSchema.parse(req.body);
  const id = String(req.params.id);
  const result = await prisma.experience.updateMany({ where: { id }, data });
  if (result.count === 0) throw new HttpError(404, 'Pengalaman tidak ditemukan');
  const updated = await prisma.experience.findUnique({ where: { id } });
  res.json({ data: updated });
});

experiencesRouter.delete('/:id', async (req, res) => {
  const result = await prisma.experience.deleteMany({ where: { id: String(req.params.id) } });
  if (result.count === 0) throw new HttpError(404, 'Pengalaman tidak ditemukan');
  res.status(204).end();
});