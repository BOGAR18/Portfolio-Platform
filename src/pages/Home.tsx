import { Link } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Download, ArrowRight, Copy, MessageCircle } from "lucide-react";
import { useT } from "@/i18n";
import { useProfile } from "@/features/profile/hooks";
import { useProjects } from "@/features/projects/hooks";
import ProjectCard from "@/features/projects/ProjectCard";
import SkillsShowcase from "@/features/skills/SkillsShowcase";
import { useCountUp } from "@/hooks/useCountUp";
import { track } from "@/lib/analytics";
import { LoadingState, ErrorState } from "@/components/PageState";
import { HeroArt } from "@/components/Illustrations";

// Diatur di file .env (lihat catatan di bawah)
const EMAIL = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
const WHATSAPP = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;
const AVAILABLE = import.meta.env.VITE_AVAILABLE === "true";

const ease = [0.22, 1, 0.36, 1] as const;

function Stat({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value);
  return (
    <div className="py-6">
      <div className="font-serif text-4xl text-slate-900 sm:text-5xl dark:text-slate-100">
        {count}
        <span className="text-brand-700 dark:text-brand-300">+</span>
      </div>
      <div className="mt-2 text-[11px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs">{label}</div>
    </div>
  );
}

function copyEmail() {
  if (!EMAIL) return;
  navigator.clipboard.writeText(EMAIL).then(
    () => toast.success("Email disalin"),
    () => toast.error("Gagal menyalin email"),
  );
}

export default function Home() {
  const t = useT();
  const profile = useProfile();
  const projects = useProjects({ q: "", skill: "", sort: "newest" });

  if (profile.isLoading) return <LoadingState />;
  if (profile.isError)
    return <ErrorState message={t("common.error")} onRetry={() => profile.refetch()} />;

  const data = profile.data!;
  const prof = data.profile;
  const featured = (projects.data ?? []).filter((p) => p.featured).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-20 px-4 py-10 sm:space-y-28 sm:py-16">
      {/* Hero: teks saja */}
      <section className="max-w-3xl">
        {prof ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
          >
            <div className="flex flex-wrap items-center gap-3">
              <p className="eyebrow">{prof.location}</p>
              {AVAILABLE && (
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
                  Terbuka untuk peluang baru
                </span>
              )}
            </div>

            <h1 className="mt-5 break-words text-5xl leading-[1.05] sm:text-6xl md:text-7xl">
              {prof.name}
            </h1>
            <p className="mt-4 text-lg text-slate-600 sm:text-xl dark:text-slate-300">{prof.title}</p>
            <p className="mt-6 leading-relaxed text-slate-600 dark:text-slate-400">{prof.bio}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/projects" className="btn-primary">
                {t("hero.cta.projects")}
              </Link>
              {prof.cvUrl && (
                <a
                  href={prof.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track("cv_download")}
                  className="btn-outline"
                >
                  <Download className="size-4" aria-hidden /> {t("hero.cta.cv")}
                </a>
              )}
            </div>
          </motion.div>
        ) : (
          <p className="text-slate-500">{t("hero.noProfile")}</p>
        )}
      </section>

      {/* Statistik */}
      <section
        aria-label={t("common.statistics")}
        className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 text-center dark:divide-slate-800 dark:border-slate-800"
      >
        <Stat label={t("stats.projects")} value={projects.data?.length ?? 0} />
        <Stat label={t("stats.skills")} value={data.skills.length} />
        <Stat label={t("stats.experience")} value={data.experiences.length} />
      </section>

      {/* Proyek unggulan */}
      <section className="space-y-8">
        <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
          <h2 className="text-3xl sm:text-4xl">{t("home.featured")}</h2>
          <Link
            to="/projects"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-slate-700 hover:text-brand-700 dark:text-slate-300 dark:hover:text-brand-300"
          >
            {t("projects.title")} <ArrowRight className="size-4" />
          </Link>
        </div>

        {projects.isLoading && <LoadingState />}
        {projects.isError && (
          <ErrorState message={t("common.error")} onRetry={() => projects.refetch()} />
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* Skill */}
      <section className="space-y-8">
        <h2 className="border-b border-slate-200 pb-4 text-3xl sm:text-4xl dark:border-slate-800">
          {t("home.skills")}
        </h2>
        <SkillsShowcase skills={data.skills} />
      </section>

      {/* Pengalaman */}
      <section className="space-y-8">
        <h2 className="border-b border-slate-200 pb-4 text-3xl sm:text-4xl dark:border-slate-800">
          {t("home.experience")}
        </h2>
        <ol className="relative ml-2 border-l border-slate-200 dark:border-slate-800">
          {data.experiences.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="relative mb-12 ml-6 last:mb-0"
            >
              <span
                className="absolute -left-[29px] top-2 size-2 rounded-full bg-brand-700 dark:bg-brand-300"
                aria-hidden
              />
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500">{e.period}</p>
              <h3 className="mt-2 break-words text-xl sm:text-2xl">
                {e.position}
                <span className="text-slate-400"> · </span>
                <span className="text-slate-600 dark:text-slate-300">{e.company}</span>
              </h3>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                {e.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {e.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded border border-slate-200 px-2 py-0.5 text-xs text-slate-600 dark:border-slate-700 dark:text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* Kontak: foto + tombol cepat */}
      <section className="grid items-center gap-10 rounded-xl border border-slate-200 p-6 sm:p-10 md:grid-cols-[240px_1fr] md:gap-12 dark:border-slate-800">
        <div className="mx-auto w-full max-w-[240px] md:mx-0">
          {prof?.photoUrl ? (
            <img
              src={prof.photoUrl}
              alt={prof.name}
              className="aspect-[4/5] w-full rounded-lg border border-slate-200 object-cover object-top dark:border-slate-800"
            />
          ) : (
            <HeroArt className="w-full text-brand-700 dark:text-brand-300" />
          )}
        </div>

        <div>
          <h2 className="text-3xl sm:text-4xl">{t("contact.title")}</h2>
          <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-400">{t("contact.subtitle")}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact" className="btn-primary">
              {t("hero.cta.contact")}
            </Link>
            {EMAIL && (
              <button type="button" onClick={copyEmail} className="btn-outline">
                <Copy className="size-4" aria-hidden /> Salin email
              </button>
            )}
            {WHATSAPP && (
              <a
                href={`https://wa.me/${WHATSAPP}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline"
              >
                <MessageCircle className="size-4" aria-hidden /> WhatsApp
              </a>
            )}
          </div>

          {EMAIL && <p className="mt-6 text-sm text-slate-500">{EMAIL}</p>}
        </div>
      </section>
    </div>
  );
}