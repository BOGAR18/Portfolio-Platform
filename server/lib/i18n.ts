import type { Locale } from '../../shared/types';

// Mengganti field dengan terjemahan jika tersedia. Jika tidak, teks asli dipakai.
// Format di database: { "en": { "title": "..." }, "id": { "title": "..." } }
export function pickLocalized<T extends object>(base: T, translations: unknown, lang: Locale): T {
  if (!translations || typeof translations !== 'object') return base;

  const overrides = (translations as Record<string, unknown>)[lang];
  if (!overrides || typeof overrides !== 'object') return base;

  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(overrides)) {
    if (typeof value === 'string' && value.trim() !== '') result[key] = value;
  }
  return result as T;
}