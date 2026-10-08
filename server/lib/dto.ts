import type { Project, ProjectSkill, Skill } from '@prisma/client';
import type { Locale, ProjectDto } from '../../shared/types';
import { pickLocalized } from './i18n';

type ProjectWithSkills = Project & { skills: (ProjectSkill & { skill: Skill })[] };

// Mengubah bentuk data database menjadi bentuk yang dikirim ke frontend, dalam bahasa yang diminta
export function toProjectDto(p: ProjectWithSkills, lang: Locale = 'en'): ProjectDto {
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
    createdAt: p.createdAt.toISOString(),
  };
}