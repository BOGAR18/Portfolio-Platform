import { env } from '../lib/env';

type ContactPayload = { name: string; email: string; subject: string; message: string };

export async function notifyNewContact(msg: ContactPayload) {
  const tasks: Promise<unknown>[] = [];

  if (env.RESEND_API_KEY && env.CONTACT_TO_EMAIL) {
    tasks.push(sendEmail(msg, env.RESEND_API_KEY, env.CONTACT_TO_EMAIL));
  }
  if (env.FONNTE_TOKEN && env.WA_TARGET) {
    tasks.push(sendWhatsApp(msg, env.FONNTE_TOKEN, env.WA_TARGET));
  }

  // Gagal kirim notifikasi tidak boleh membuat pesan pengunjung terlihat gagal
  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === 'rejected') console.error('Notifikasi kontak gagal:', r.reason);
  }
}

async function sendEmail(m: ContactPayload, apiKey: string, to: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Portfolio <onboarding@resend.dev>',
      to: [to],
      reply_to: m.email,
      subject: `[Portfolio] ${m.subject}`,
      text: `Dari: ${m.name} <${m.email}>\n\n${m.message}`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

async function sendWhatsApp(m: ContactPayload, token: string, target: string) {
  const body = new URLSearchParams({
    target,
    message: `Pesan baru dari portfolio\nNama: ${m.name}\nEmail: ${m.email}\nSubjek: ${m.subject}\n\n${m.message}`,
  });
  const res = await fetch('https://api.fonnte.com/send', {
    method: 'POST',
    headers: { Authorization: token },
    body,
  });
  if (!res.ok) throw new Error(`Fonnte ${res.status}: ${await res.text()}`);
}