import { prisma } from '../lib/prisma';
import { pickLocalized } from '../lib/i18n';
import type { Locale } from '../../shared/types';
import type { KnowledgeChunk } from './retrieval';

export const FALLBACK_TEXT: Record<Locale, string> = {
  en: "I don't have enough information to answer that accurately.",
  id: 'Saya belum memiliki informasi yang cukup untuk menjawab itu dengan akurat.',
};

// Memastikan teks berakhir dengan tanda baca, tanpa menambah titik ganda
const end = (s: string) => (/[.!?]$/.test(s.trim()) ? s.trim() : `${s.trim()}.`);

// Kalimat untuk chatbot, dibuat per bahasa
const TEXT = {
  en: {
    profile: (name: string, title: string, bio: string, location: string) =>
      `${name} is a ${title}. ${end(bio)} Based in ${location}.`,
    experienceTitle: (position: string, company: string) => `${position} at ${company}`,
    experience: (position: string, company: string, period: string, desc: string, tech: string) =>
      `${position} at ${company}, ${period}. ${end(desc)} Technologies: ${tech}.`,
    project: (p: { summary: string; problem: string; solution: string; role: string; tech: string }) =>
      [
        end(p.summary),
        p.problem && end(p.problem),
        p.solution && end(p.solution),
        p.role && `Role: ${p.role}.`,
        p.tech && `Technologies: ${p.tech}.`,
      ]
        .filter(Boolean)
        .join(' '),
    skill: (name: string, category: string, level: number, related: string) =>
      `${name} is a ${category} skill. Level ${level} of 5.${related ? ` Used in projects: ${related}.` : ''}`,
  },
  id: {
    profile: (name: string, title: string, bio: string, location: string) =>
      `${name} adalah ${title}. ${end(bio)} Berbasis di ${location}.`,
    experienceTitle: (position: string, company: string) => `${position} di ${company}`,
    experience: (position: string, company: string, period: string, desc: string, tech: string) =>
      `${position} di ${company}, ${period}. ${end(desc)} Teknologi: ${tech}.`,
    project: (p: { summary: string; problem: string; solution: string; role: string; tech: string }) =>
      [
        end(p.summary),
        p.problem && end(p.problem),
        p.solution && end(p.solution),
        p.role && `Peran: ${p.role}.`,
        p.tech && `Teknologi: ${p.tech}.`,
      ]
        .filter(Boolean)
        .join(' '),
    skill: (name: string, category: string, level: number, related: string) =>
      `${name} adalah skill ${category}. Level ${level} dari 5.${related ? ` Digunakan di proyek: ${related}.` : ''}`,
  },
};

// Mengubah data database menjadi potongan teks yang bisa dicari, dalam bahasa yang diminta.
// Email pribadi sengaja tidak dimasukkan agar tidak bocor lewat chatbot.
export async function loadKnowledge(lang: Locale): Promise<KnowledgeChunk[]> {
  const T = TEXT[lang];

  const [profile, projects, skills, experiences] = await Promise.all([
    prisma.profile.findFirst(),
    prisma.project.findMany({
      where: { published: true, deletedAt: null },
      include: { skills: { include: { skill: true } } },
    }),
    prisma.skill.findMany({ include: { projects: { include: { project: true } } } }),
    prisma.experience.findMany(),
  ]);

  const chunks: KnowledgeChunk[] = [];

  if (profile) {
    const p = pickLocalized(
      { name: profile.name, title: profile.title, bio: profile.bio, location: profile.location },
      profile.translations,
      lang,
    );
    chunks.push({
      sourceType: 'profile',
      sourceId: 'profile',
      title: p.name,
      text: T.profile(p.name, p.title, p.bio, p.location),
    });
  }

  for (const project of projects) {
    const pr = pickLocalized(
      {
        title: project.title,
        summary: project.summary,
        problem: project.problem ?? '',
        solution: project.solution ?? '',
        role: project.role ?? '',
      },
      project.translations,
      lang,
    );
    const tech = project.skills.map((s) => s.skill.name).join(', ');
    chunks.push({
      sourceType: 'project',
      sourceId: project.slug,
      title: pr.title,
      text: T.project({ summary: pr.summary, problem: pr.problem, solution: pr.solution, role: pr.role, tech }),
    });
  }

  for (const s of skills) {
    const related = s.projects.map((x) => x.project.title).join(', ');
    chunks.push({
      sourceType: 'skill',
      sourceId: s.id,
      title: s.name,
      text: T.skill(s.name, s.category, s.level, related),
    });
  }

  for (const e of experiences) {
    const pe = pickLocalized(
      { company: e.company, position: e.position, period: e.period, description: e.description },
      e.translations,
      lang,
    );
    chunks.push({
      sourceType: 'experience',
      sourceId: e.id,
      title: T.experienceTitle(pe.position, pe.company),
      text: T.experience(pe.position, pe.company, pe.period, pe.description, e.technologies.join(', ')),
    });
  }

  return chunks;
}