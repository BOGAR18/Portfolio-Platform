import { Router, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import { chatSchema } from '../../shared/schemas';
import type { ChatEvent } from '../../shared/types';
import { loadKnowledge, FALLBACK_TEXT } from '../services/knowledge';
import { rankChunks } from '../services/retrieval';
import { generateAnswer } from '../services/ai';

export const chatRouter = Router();

const chatLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: { message: 'Terlalu banyak pertanyaan, coba lagi beberapa menit lagi' } },
});

// Deteksi sederhana untuk prompt injection. Ini lapisan pertama, bukan satu-satunya.
const INJECTION_PATTERNS = [
  /ignore (all |the )?(previous|above|prior) (instructions|prompts?)/i,
  /system prompt/i,
  /reveal .*(instruction|prompt)/i,
  /abaikan .*(instruksi|perintah)/i,
];

function sendEvent(res: Response, event: ChatEvent) {
  res.write(`data: ${JSON.stringify(event)}\n\n`);
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

chatRouter.post('/', chatLimiter, async (req, res) => {
  const { message, lang } = chatSchema.parse(req.body);

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    if (INJECTION_PATTERNS.some((p) => p.test(message))) {
      sendEvent(res, { type: 'sources', sources: [] });
      sendEvent(res, { type: 'token', text: FALLBACK_TEXT[lang] });
      sendEvent(res, { type: 'done' });
      return;
    }

    const knowledge = await loadKnowledge(lang);
    const chunks = rankChunks(message, knowledge);
    const answer = chunks.length === 0 ? FALLBACK_TEXT[lang] : await generateAnswer(message, chunks);

    sendEvent(res, {
      type: 'sources',
      sources: chunks.map((c) => ({ type: c.sourceType, id: c.sourceId, title: c.title })),
    });

    for (const word of answer.split(/(\s+)/)) {
      if (!word) continue;
      sendEvent(res, { type: 'token', text: word });
      await sleep(12);
    }
    sendEvent(res, { type: 'done' });
  } catch (err) {
    console.error(err);
    sendEvent(res, { type: 'error', message: 'Asisten AI sedang tidak tersedia' });
  } finally {
    res.end();
  }
});