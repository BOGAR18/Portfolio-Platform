import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { HttpError } from '../lib/errors';
import { toProjectDto } from '../lib/dto';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { langQuery, listProjectsQuery, projectInputSchema } from '../../shared/schemas';

export const projectsRouter = Router();

const include = { skills: { include: { skill: true } } } as const;

// Mengubah daftar nama skill menjadi relasi. Skill yang belum ada akan dibuat.
async function skillLinks(names: string[]) {
  const skills = await Promise.all(
    names.map((name) =>
      prisma.skill.upsert({ where: { name }, update: {}, create: { name, category: 'Other' } }),
    ),
  );
  return skills.map((s) => ({ skill: { connect: { id: s.id } } }));
}

projectsRouter.get('/', async (req, res) => {
  const { q, skill, sort, lang } = listProjectsQuery.parse(req.query);

  const projects = await prisma.project.findMany({
    where: {
      published: true,
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
      ...(skill ? { skills: { some: { skill: { name: skill } } } } : {}),
    },
    include,
    orderBy: sort === 'title' ? { title: 'asc' } : { createdAt: 'desc' },
  });

  // Perhatikan: map harus dibungkus fungsi, agar index array tidak ikut masuk sebagai argumen
  res.json({ data: projects.map((p) => toProjectDto(p, lang)) });
});

projectsRouter.get('/:slug', async (req, res) => {
  const { lang } = langQuery.parse(req.query);

  const project = await prisma.project.findFirst({
    where: { slug: String(req.params.slug), published: true, deletedAt: null },
    include,
  });
  if (!project) throw new HttpError(404, 'Project tidak ditemukan');
  res.json({ data: toProjectDto(project, lang) });
});

projectsRouter.post('/', requireAuth, requireAdmin, async (req, res) => {
  const { skills, ...data } = projectInputSchema.parse(req.body);

  const project = await prisma.project.create({
    data: {
      ...data,
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      skills: { create: await skillLinks(skills) },
    },
    include,
  });
  res.status(201).json({ data: toProjectDto(project) });
});

projectsRouter.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { skills, ...data } = projectInputSchema.parse(req.body);
  const id = String(req.params.id);

  const existing = await prisma.project.findFirst({ where: { id, deletedAt: null } });
  if (!existing) throw new HttpError(404, 'Project tidak ditemukan');

  const links = await skillLinks(skills);

  const project = await prisma.project.update({
    where: { id },
    data: {
      slug: data.slug,
      title: data.title,
      summary: data.summary,
      problem: data.problem ?? null,
      solution: data.solution ?? null,
      role: data.role ?? null,
      category: data.category,
      githubUrl: data.githubUrl || null,
      liveUrl: data.liveUrl || null,
      imageUrl: data.imageUrl || null,
      featured: data.featured,
      published: data.published,
      translations: data.translations,
      skills: {
        deleteMany: {},
        create: links,
      },
    },
    include,
  });

  res.json({ data: toProjectDto(project) });
});

// Soft delete: data tidak benar-benar dihapus, hanya ditandai deletedAt
projectsRouter.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const result = await prisma.project.updateMany({
    where: { id: String(req.params.id), deletedAt: null },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) throw new HttpError(404, 'Project tidak ditemukan');
  res.status(204).end();
});