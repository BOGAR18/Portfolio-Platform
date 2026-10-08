// Mesin pencarian sederhana berbasis kata kunci.
// Tidak butuh database atau API, sehingga mudah dipahami dan diuji.

export interface KnowledgeChunk {
  sourceType: 'profile' | 'project' | 'skill' | 'experience';
  sourceId: string;
  title: string;
  text: string;
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'what', 'which', 'does', 'do', 'tell', 'me', 'about',
  'show', 'his', 'he', 'has', 'have', 'and', 'or', 'of', 'in', 'to', 'for', 'with',
  'apa', 'yang', 'dan', 'di', 'ke', 'dari', 'itu', 'ini', 'tentang', 'bisa', 'ada',
]);

export function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreChunk(queryTerms: string[], chunk: KnowledgeChunk): number {
  const titleTerms = new Set(tokenize(chunk.title));
  const bodyTerms = new Set(tokenize(chunk.text));
  let score = 0;
  for (const term of queryTerms) {
    if (titleTerms.has(term)) score += 3; // kecocokan di judul lebih berharga
    else if (bodyTerms.has(term)) score += 1;
  }
  return score;
}

export function rankChunks(query: string, chunks: KnowledgeChunk[], topK = 4): KnowledgeChunk[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];

  return chunks
    .map((chunk) => ({ chunk, score: scoreChunk(terms, chunk) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((x) => x.chunk);
}