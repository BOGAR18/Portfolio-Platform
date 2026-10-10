import { env } from '../lib/env';

type Fields = { title: string; summary: string; problem: string; solution: string; role: string };

// MyMemory menerima maksimal 500 byte per permintaan. Pakai 450 agar aman.
const MAX_BYTES = 450;

// Memecah teks panjang menjadi potongan kecil per kata
function chunkText(text: string): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (Buffer.byteLength(next, 'utf8') > MAX_BYTES) {
      if (current) chunks.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) chunks.push(current);
  return chunks;
}

async function translateChunk(text: string): Promise<string> {
  const url = new URL('https://api.mymemory.translated.net/get');
  url.searchParams.set('q', text);
  url.searchParams.set('langpair', 'id|en');
  if (env.TRANSLATE_EMAIL) url.searchParams.set('de', env.TRANSLATE_EMAIL);

  const res = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`MyMemory status ${res.status}`);

  const data = (await res.json()) as {
    responseStatus: number | string;
    responseData?: { translatedText?: string };
    responseDetails?: string;
  };
  if (Number(data.responseStatus) !== 200 || !data.responseData?.translatedText) {
    throw new Error(data.responseDetails || `MyMemory status ${data.responseStatus}`);
  }
  return data.responseData.translatedText;
}

// Dikerjakan berurutan agar tidak membebani layanan gratis
async function translateField(text: string): Promise<string> {
  if (!text.trim()) return '';
  const out: string[] = [];
  for (const chunk of chunkText(text)) out.push(await translateChunk(chunk));
  return out.join(' ');
}

export async function buildTranslations(f: {
  title: string;
  summary: string;
  problem?: string | null;
  solution?: string | null;
  role?: string | null;
}): Promise<{ translations: { id: Fields; en: Partial<Fields> }; warning?: string }> {
  const id: Fields = {
    title: f.title,
    summary: f.summary,
    problem: f.problem ?? '',
    solution: f.solution ?? '',
    role: f.role ?? '',
  };

  try {
    const en: Fields = {
      title: await translateField(id.title),
      summary: await translateField(id.summary),
      problem: await translateField(id.problem),
      solution: await translateField(id.solution),
      role: await translateField(id.role),
    };
    return { translations: { id, en } };
  } catch (err) {
    console.error('Terjemahan gagal:', err);
    return {
      // Versi Inggris dikosongkan, jadi halaman memakai teks Indonesia sebagai cadangan
      translations: { id, en: {} },
      warning:
        'Terjemahan Inggris otomatis gagal. Project tersimpan dengan teks Indonesia. Simpan ulang project ini nanti.',
    };
  }
}