import { Link } from "react-router";
import { motion } from "motion/react";
import { Download, Mail, ArrowRight } from "lucide-react";
import { useT } from "@/i18n";
import { useProfile } from "@/features/profile/hooks";
import { useProjects } from "@/features/projects/hooks";
import ProjectCard from "@/features/projects/ProjectCard";
import { useCountUp } from "@/hooks/useCountUp";
import { track } from "@/lib/analytics";
import { LoadingState, ErrorState } from "@/components/PageState";
import SkillsShowcase from "@/features/skills/SkillsShowcase";

function Stat({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value);
  return (
    <div className="rounded-xl border border-slate-200 p-4 text-center dark:border-slate-800">
      <div className="text-3xl font-bold text-brand-600 dark:text-brand-500">
        {count}+
      </div>
      <div className="text-sm text-slate-500">{label}</div>
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
      <ErrorState
        message={t("common.error")}
        onRetry={() => profile.refetch()}
      />
    );

  const data = profile.data!;
  const featured = (projects.data ?? []).filter((p) => p.featured).slice(0, 3);



  return (
    <div className="mx-auto max-w-6xl space-y-14 px-4 py-10 sm:space-y-20 sm:py-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600/10 via-transparent to-transparent p-8 md:p-14">
        <div
          className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden
        />

        {data.profile ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between"
          >
            {/* Kolom teks */}
            <div className="max-w-2xl">
              <p className="text-sm font-medium uppercase tracking-widest text-brand-600 dark:text-brand-500">
                {data.profile.location}
              </p>
              <h1 className="mt-3 break-words text-3xl font-bold tracking-tight sm:text-4xl md:text-6xl">
                {data.profile.name}
              </h1>
              <p className="mt-2 text-xl text-slate-600 dark:text-slate-300">
                {data.profile.title}
              </p>
              <p className="mt-6 text-slate-600 dark:text-slate-400">
                {data.profile.bio}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/projects" className="btn-primary">
                  {t("hero.cta.projects")}
                </Link>
                <Link to="/contact" className="btn-outline">
                  <Mail className="size-4" /> {t("hero.cta.contact")}
                </Link>
                {data.profile.cvUrl && (
                  <a
                    href={data.profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => track("cv_download")}
                    className="btn-outline"
                  >
                    <Download className="size-4" /> {t("hero.cta.cv")}
                  </a>
                )}
              </div>
            </div>

            {/* Foto profil */}
            {data.profile.photoUrl && (
              <img
                src={data.profile.photoUrl}
                alt={data.profile.name}
              className="size-32 shrink-0 self-center rounded-2xl object-cover object-top shadow-xl ring-4 ring-white sm:size-40 md:size-56 dark:ring-slate-800"
              />
            )}
          </motion.div>
        ) : (
          <p className="text-slate-500">{t("hero.noProfile")}</p>
        )}
      </section>

      {/* Statistik */}
      <section className="grid grid-cols-3 gap-4" aria-label="Statistics">
        <Stat label={t("stats.projects")} value={projects.data?.length ?? 0} />
        <Stat label={t("stats.skills")} value={data.skills.length} />
        <Stat label={t("stats.experience")} value={data.experiences.length} />
      </section>

      {/* Proyek unggulan */}
      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("home.featured")}</h2>
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-500"
          >
            {t("projects.title")} <ArrowRight className="size-4" />
          </Link>
        </div>

        {projects.isLoading && <LoadingState />}
        {projects.isError && (
          <ErrorState
            message={t("common.error")}
            onRetry={() => projects.refetch()}
          />
        )}

       <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {featured.map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* Skill, dikelompokkan per kategori. Klik skill membuka daftar proyek terkait. */}
     <section className="space-y-6">
  <h2 className="text-2xl font-bold">{t("home.skills")}</h2>
  <SkillsShowcase skills={data.skills} />
</section>

      {/* Timeline pengalaman */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">{t("home.experience")}</h2>
        <ol className="relative ml-3 border-l border-slate-200 dark:border-slate-800">
          {data.experiences.map((e, i) => (
            <motion.li
              key={e.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="mb-8 ml-6"
            >
              <span
                className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full bg-brand-600"
                aria-hidden
              />
              <p className="text-sm text-slate-500">{e.period}</p>
              <h3 className="font-semibold">
                {e.position} ·{" "}
                <span className="text-slate-600 dark:text-slate-300">
                  {e.company}
                </span>
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {e.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {e.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800"
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