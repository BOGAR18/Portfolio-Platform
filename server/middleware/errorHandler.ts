import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../lib/errors';

// Semua error dikembalikan dengan format yang sama: { error: { message, details? } }
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: { message: 'Data tidak valid', details: err.flatten().fieldErrors },
    });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { message: err.message, details: err.details } });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: { message: 'Body JSON tidak valid' } });
  }
  console.error(err);
  return res.status(500).json({ error: { message: 'Terjadi kesalahan di server' } });
}