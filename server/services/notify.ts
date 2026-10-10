import { env } from '../lib/env';

type ContactPayload = { name: string; email: string; subject: string; message: string };

// Mengirim email notifikasi. Jika key atau email tujuan kosong, fitur ini dilewati.
export async function notifyNewContact(msg: ContactPayload) {
  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL) return;

  try {
    await sendEmail(msg, env.RESEND_API_KEY, env.CONTACT_TO_EMAIL);
  } catch (err) {
    // Kegagalan kirim email tidak boleh membuat pengunjung melihat error
    console.error('Notifikasi kontak gagal:', err);
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