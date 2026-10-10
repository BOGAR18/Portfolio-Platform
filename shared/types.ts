export type Locale = 'en' | 'id';

// Bentuk satu proyek saat dikirim dari server ke browser
export interface ProjectDto {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problem: string | null;
  solution: string | null;
  role: string | null;
  category: string;
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
  skills: string[];
  createdAt: string;
  imageUrl: string | null;
  images: { url: string; caption: string | null }[];
}

export interface SkillDto {
  id: string;
  name: string;
  category: string;
  level: number;
}

export interface ExperienceDto {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
}

export interface ProfileDto {
  name: string;
  title: string;
  bio: string;
  location: string;
  github: string | null;
  linkedin: string | null;
  cvUrl: string | null;
  photoUrl: string | null;
}

// Semua data yang dibutuhkan halaman utama, dikirim dalam satu respons
export interface ProfileResponse {
  profile: ProfileDto | null;
  experiences: ExperienceDto[];
  skills: SkillDto[];
}

export interface AuthUser {
  id: string;
  role: 'ADMIN' | 'VISITOR';
}

export interface ChatSource {
  type: 'profile' | 'project' | 'skill' | 'experience';
  id: string;
  title: string;
}

// Setiap potongan data yang dikirim saat chatbot menjawab
export type ChatEvent =
  | { type: 'sources'; sources: ChatSource[] }
  | { type: 'token'; text: string }
  | { type: 'done' }
  | { type: 'error'; message: string };