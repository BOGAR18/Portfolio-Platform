import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Mail, Send, ShieldCheck } from "lucide-react";
import { contactSchema } from "@shared/schemas";
import { useT } from "@/i18n";
import { ApiError } from "@/lib/api";
import { track } from "@/lib/analytics";
import { useSendContact, type ContactInput } from "@/features/contact/hooks";

export default function Contact() {
  const t = useT();
  const send = useSendContact();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", website: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await send.mutateAsync(values);
      toast.success(t("contact.success"));
      track("contact_click", "/contact");
      reset();
    } catch (err) {
      if (err instanceof ApiError && err.status === 400 && err.details) {
        const fields = err.details as Record<string, string[]>;
        for (const [field, messages] of Object.entries(fields)) {
          setError(field as keyof ContactInput, { message: messages[0] });
        }
      } else {
        toast.error(err instanceof Error ? err.message : t("common.error"));
      }
    }
  });

  // text-base di HP mencegah iOS memperbesar layar saat input difokuskan
  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-base outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:text-sm dark:border-slate-700 dark:bg-slate-950 dark:focus:bg-slate-950";
  const labelClass = "mb-1.5 block text-sm font-medium";

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-8 sm:py-14 md:grid-cols-5 md:gap-10">
      {/* Kiri: ajakan */}
      <motion.aside
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="md:col-span-2"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-6 text-white sm:rounded-3xl sm:p-8">
          <div
            className="pointer-events-none absolute -bottom-16 -right-16 size-56 rounded-full bg-white/10 blur-3xl"
            aria-hidden
          />
          <Mail className="size-7 text-brand-100 sm:size-8" aria-hidden />
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:mt-6 sm:text-3xl">
            {t("contact.title")}
          </h1>
          <p className="mt-3 text-sm text-brand-100 sm:text-base">{t("contact.subtitle")}</p>
          <ul className="mt-6 space-y-3 text-sm text-brand-100 sm:mt-8">
            <li className="flex items-start gap-2">
              <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{t("contact.privacy")}</span>
            </li>
          </ul>
        </div>
      </motion.aside>

      {/* Kanan: form */}
      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={onSubmit}
        noValidate
        className="min-w-0 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:rounded-3xl sm:p-8 md:col-span-3 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="min-w-0">
            <label htmlFor="name" className={labelClass}>{t("contact.name")}</label>
            <input
              id="name"
              className={inputClass}
              placeholder={t("contact.namePh")}
              autoComplete="name"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
          </div>
          <div className="min-w-0">
            <label htmlFor="email" className={labelClass}>{t("contact.email")}</label>
            <input
              id="email"
              type="email"
              className={inputClass}
              placeholder={t("contact.emailPh")}
              autoComplete="email"
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="subject" className={labelClass}>{t("contact.subject")}</label>
          <input
            id="subject"
            className={inputClass}
            placeholder={t("contact.subjectPh")}
            {...register("subject")}
            aria-invalid={!!errors.subject}
          />
          {errors.subject && <p className="mt-1 text-xs text-red-600">{errors.subject.message}</p>}
        </div>

        <div>
          <label htmlFor="message" className={labelClass}>{t("contact.message")}</label>
          <textarea
            id="message"
            rows={5}
            className={inputClass}
            placeholder={t("contact.messagePh")}
            {...register("message")}
            aria-invalid={!!errors.message}
          />
          {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
        </div>

        {/* Honeypot: disembunyikan dari manusia */}
        <div className="hidden" aria-hidden>
          <label>
            Website
            <input tabIndex={-1} autoComplete="off" {...register("website")} />
          </label>
        </div>

        <button type="submit" disabled={send.isPending} className="btn-primary group w-full py-3">
          <Send className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          {send.isPending ? t("contact.sending") : t("contact.submit")}
        </button>
      </motion.form>
    </div>
  );
}