import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { pickLocalized } from '../lib/i18n';
import { langQuery } from '../../shared/schemas';
import type { ProfileResponse } from '../../shared/types';

export const profileRouter = Router();

profileRouter.get('/', async (req, res) => {
  const { lang } = langQuery.parse(req.query);

  const [profile, experiences, skills] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.experience.findMany({ orderBy: { order: 'asc' } }),
    prisma.skill.findMany({ orderBy: [{ category: 'asc' }, { name: 'asc' }] }),
  ]);

  const body: ProfileResponse = {
    profile: profile
      ? pickLocalized(
          {
            name: profile.name,
            title: profile.title,
            bio: profile.bio,
            location: profile.location,
            github: profile.github,
            linkedin: profile.linkedin,
            cvUrl: profile.cvUrl,
            photoUrl: profile.photoUrl,
          },
          profile.translations,
          lang,
        )
      : null,
    experiences: experiences.map((e) => {
      const loc = pickLocalized(
        { company: e.company, position: e.position, period: e.period, description: e.description },
        e.translations,
        lang,
      );
      return {
        id: e.id,
        company: loc.company,
        position: loc.position,
        period: loc.period,
        description: loc.description,
        technologies: e.technologies,
      };
    }),
    skills,
  };

  res.json({ data: body });
});