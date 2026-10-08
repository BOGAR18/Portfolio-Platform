import { Link } from "react-router";
import { motion } from "motion/react";
import { Download, Mail, ArrowRight } from "lucide-react";
import { useT } from "@/i18n";
import { useProfile } from "@/features/profile/hooks";
import { useProjects } from "@/features/projects/hooks";
import ProjectCard from "@/features/projects/ProjectCard";
import SkillsShowcase from "@/features/skills/SkillsShowcase";
import { useCountUp } from "@/hooks/useCountUp";
import { track } from "@/lib/analytics";
import { LoadingState, ErrorState } from "@/components/PageState";


function Stat({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value);
  return (
    <div className="rounded-xl border border-slate-200 p-3 text-center sm:p-4 dark:border-slate-800">
      <div className="text-2xl font-bold text-brand-600 sm:text-3xl dark:text-brand-500">
        {count}+
      </div>
      <div className="mt-1 truncate text-[11px] text-slate-500 sm:text-sm">{label}</div>
    </div>
  );
}

export default function Home() {
  const t = useT();
  const profile = useProfile();
  const projects = useProjects({ q: "", skill: "", sort: "newest" });

  if (profile.isLoading) return <LoadingState />;
  if (profile.isError)
    return (
      <ErrorState message={t("common.error")} onRetry={() => profile.refetch()} />
    );

  const data = profile.data!;
  const featured = (projects.data ?? []).filter((p) => p.featured).slice(0, 3);

  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-8 sm:space-y-20 sm:py-14">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600/10 via-transparent to-transparent p-6 sm:rounded-3xl sm:p-10 md:p-14">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden
        />

        {data.profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left"
          >
            {data.profile.photoUrl && (
              <img
                src={data.profile.photoUrl}
                alt={data.profile.name}
                className="order-first size-36 shrink-0 rounded-2xl object-cover object-top shadow-xl ring-4 ring-white sm:size-44 md:order-last md:size-56 dark:ring-slate-800"
              />
            )}

            <div className="w-full min-w-0 md:max-w-2xl">
              <p className="text-xs font-medium uppercase tracking-widest text-brand-600 sm:text-sm dark:text-brand-500">
                {data.profile.location}
              </p>
              <h1 className="mt-3 break-words text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-6xl">
                {data.profile.name}
              </h1>
              <p className="mt-2 text-base text-slate-600 sm:text-xl dark:text-slate-300">
                {data.profile.title}
              </p>
              <p className="mt-5 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
                {data.profile.bio}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:justify-start">
                <Link to="/projects" className="btn-primary w-full sm:w-auto">
                  {t("hero.cta.projects")}
                </Link>
                <Link to="/contact" className="btn-outline w-full sm:w-auto">
                  <Mail className="size-4" /> {t("hero.cta.contact")}
                </Link>
                {data.profile.cvUrl && (
                  <a
                    href={data.profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("cv_download")}
                    className="btn-outline w-full sm:w-auto"
                  >
                    <Download className="size-4" /> {t("hero.cta.cv")}
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-slate-500">{t("hero.noProfile")}</p>
        )}
      </section>

      {/* Statistik */}
      <section className="grid grid-cols-3 gap-2 sm:gap-4" aria-label={t("common.statistics")}>
        <Stat label={t("stats.projects")} value={projects.data?.length ?? 0} />
        <Stat label={t("stats.skills")} value={data.skills.length} />
        <Stat label={t("stats.experience")} value={data.experiences.length} />
      </section>

      {/* Proyek unggulan */}
      <section className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-xl font-bold sm:text-2xl">{t("home.featured")}</h2>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-500"
          >
            {t("projects.title")} <ArrowRight className="size-4" />
          </Link>
        </div>

        {projects.isLoading && <LoadingState />}
        {projects.isError && (
          <ErrorState message={t("common.error")} onRetry={() => projects.refetch()} />
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* Skill */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold sm:text-2xl">{t("home.skills")}</h2>
        <SkillsShowcase skills={data.skills} />
      </section>

      {/* Pengalaman */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold sm:text-2xl">{t("home.experience")}</h2>
        <ol className="relative ml-2 border-l border-slate-200 sm:ml-3 dark:border-slate-800">
          {data.experiences.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative mb-8 ml-5 last:mb-0 sm:ml-6"
            >
              <span
                className="absolute -left-[25px] top-1.5 size-2.5 rounded-full bg-brand-600 sm:-left-[29px]"
                aria-hidden
              />
              <p className="text-xs text-slate-500 sm:text-sm">{e.period}</p>
              <h3 className="mt-0.5 break-words font-semibold">
                {e.position}
                <span className="text-slate-500"> · </span>
                <span className="text-slate-600 dark:text-slate-300">{e.company}</span>
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {e.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-slate-100 px-2 py-0.5 text-[11px] sm:text-xs dark:bg-slate-800"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </motion.li>
          ))}
        </ol>
      </section>
    </div>
  );
}