import { Router } from "express";
import rateLimit from "express-rate-limit";
import { contactSchema } from "../../shared/schemas";
import { prisma } from "../lib/prisma";
import { notifyNewContact } from "../services/notify";

export const contactRouter = Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60_000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: { message: "Terlalu banyak pesan dikirim, coba lagi nanti" },
  },
});

contactRouter.post("/", contactLimiter, async (req, res) => {
  const { website, ...data } = contactSchema.parse(req.body);

  // Honeypot terisi berarti bot. Balas sukses agar bot tidak tahu dia tertangkap.
  if (website) return res.status(201).json({ ok: true });

  await prisma.contactMessage.create({ data });
  await notifyNewContact(data); // harus di-await, karena di Vercel proses bisa berhenti setelah response dikirim
  res.status(201).json({ ok: true });
});
