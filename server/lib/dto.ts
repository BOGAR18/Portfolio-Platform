import type { Project, ProjectSkill, Skill, ProjectImage } from '@prisma/client';
import { pickLocalized } from './i18n';

// Project beserta relasi yang dipakai untuk membuat DTO
export type ProjectWithSkills = Project & {
  skills: (ProjectSkill & { skill: Skill })[];
  images?: ProjectImage[];
};

export function toProjectDto(p: ProjectWithSkills, lang: 'en' | 'id' = 'en') {
  const loc = pickLocalized(
    { title: p.title, summary: p.summary, problem: p.problem, solution: p.solution, role: p.role },
    p.translations,
    lang,
  );
  return {
    id: p.id,
    slug: p.slug,
    title: loc.title,
    summary: loc.summary,
    problem: loc.problem,
    solution: loc.solution,
    role: loc.role,
    category: p.category,
    githubUrl: p.githubUrl,
    liveUrl: p.liveUrl,
    featured: p.featured,
    imageUrl: p.imageUrl,
    skills: p.skills.map((s) => s.skill.name),
    images: (p.images ?? []).map((img) => ({ url: img.url, caption: img.caption })),
    createdAt: p.createdAt.toISOString(),
  };
}