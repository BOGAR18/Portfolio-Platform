export const localeSchema = z.enum(['en', 'id']).default('en');
export const langQuery = z.object({ lang: localeSchema });

import { z } from 'zod';

// Aturan untuk form kontak
export const contactSchema = z.object({
  name: z.string().trim().min(2, 'Nama minimal 2 karakter').max(80),
  email: z.string().trim().email('Format email tidak valid'),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10, 'Pesan minimal 10 karakter').max(2000),
  // Honeypot: kolom ini disembunyikan dari pengunjung. Bot biasanya mengisinya.
  website: z.string().max(200).optional(),
});

// Aturan untuk login admin
export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1, 'Password wajib diisi'),
});

// Aturan untuk membuat atau mengubah proyek (dipakai dashboard admin)
export const projectInputSchema = z.object({
  slug: z
    .string()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9-]+$/, 'Gunakan huruf kecil, angka, dan tanda hubung'),
  title: z.string().trim().min(3).max(120),
  summary: z.string().trim().min(10).max(300),
  problem: z.string().max(2000).optional(),
  solution: z.string().max(2000).optional(),
  role: z.string().max(120).optional(),
  category: z.string().trim().min(2).max(60),
  githubUrl: z.string().url().optional().or(z.literal('')),
  liveUrl: z.string().url().optional().or(z.literal('')),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  skills: z.array(z.string().trim().min(1)).default([]),
  imageUrl: z.string().optional().or(z.literal('')),
    images: z
    .array(
      z.object({
        url: z.string().url(),
        caption: z.string().trim().max(120).optional(),
      }),
    )
    .max(20)
    .default([]),
  translations: z
  .object({
    en: z.record(z.string()).optional(),
    id: z.record(z.string()).optional(),
  })
  .default({}),
});

// Parameter untuk daftar proyek (search, filter, sorting)
export const listProjectsQuery = z.object({
  q: z.string().max(100).optional(),
  skill: z.string().max(60).optional(),
  sort: z.enum(['newest', 'title']).default('newest'),
  lang: localeSchema,
});

// Aturan untuk pesan chatbot
export const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(2, 'Pesan terlalu pendek')
    .max(500, 'Pesan maksimal 500 karakter'),
    lang: localeSchema,
});

// Aturan untuk event analytics
export const analyticsSchema = z.object({
  type: z.enum(['pageview', 'cv_download', 'contact_click', 'project_view']),
  path: z.string().max(200),
});

export const experienceInputSchema = z.object({
  company: z.string().trim().min(2).max(120),
  position: z.string().trim().min(2).max(120),
  period: z.string().trim().min(3).max(60),
  description: z.string().trim().min(10).max(2000),
  technologies: z.array(z.string().trim().min(1)).default([]),
  order: z.coerce.number().int().min(0).max(999).default(0),
});