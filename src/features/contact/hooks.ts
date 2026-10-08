import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { z } from 'zod';
import type { contactSchema } from '@shared/schemas';

export type ContactInput = z.input<typeof contactSchema>;

export function useSendContact() {
  return useMutation({
    mutationFn: (input: ContactInput) =>
      api<{ ok: boolean }>('/contact', { method: 'POST', body: JSON.stringify(input) }),
  });
}