import { useEffect } from "react";
import { Link, useParams } from "react-router";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useT } from "@/i18n";
import { useProject } from "@/features/projects/hooks";
import { track } from "@/lib/analytics";
import { ApiError } from "@/lib/api";
import { ErrorState, LoadingState } from "@/components/PageState";
import Reveal from "@/components/Reveal";
import NotFound from "./NotFound";

export default function ProjectDetail() {
  const t = useT();
  const { slug = "" } = useParams();
  const project = useProject(slug);

  // Bar progres di atas layar yang mengikuti scroll
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Catat kunjungan hanya setelah data proyek berhasil dimuat
  const loadedSlug = project.data?.slug;
  useEffect(() => {
    if (loadedSlug) track("project_view", `/projects/${loadedSlug}`);
  }, [loadedSlug]);

  if (project.isLoading) return <LoadingState />;
  if (project.error instanceof ApiError && project.error.status === 404)
    return <NotFound />;
  if (project.isError)
    return (
      <ErrorState
        message={t("common.error")}
        onRetry={() => project.refetch()}
      />
    );

  const p = project.data!;

  const sections = [
    { title: t("detail.problem"), body: p.problem },
    { title: t("detail.solution"), body: p.solution },
  ].filter((s) => s.body);

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-gradient-to-r from-brand-500 to-brand-700"
        aria-hidden
      />

      <article className="mx-auto max-w-3xl px-4 py-12">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" /> {t("projects.title")}
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mt-6 text-sm font-medium uppercase tracking-wide text-brand-600 dark:text-brand-500"
        >
          {p.category}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-2 text-4xl font-bold tracking-tight md:text-5xl"
        >
          {p.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.5 }}
          className="mt-4 text-lg text-slate-600 dark:text-slate-300"
        >
          {p.summary}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-6 flex flex-wrap gap-3"
        >
          {p.githubUrl && (
            <a
              href={p.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              <Github className="size-4" /> {t("detail.github")}
            </a>
          )}
          {p.liveUrl && (
            <a
              href={p.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <ExternalLink className="size-4" /> {t("detail.live")}
            </a>
          )}
        </motion.div>

        {p.imageUrl && (
          <motion.img
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            src={p.imageUrl}
            alt={p.title}
            className="mt-8 w-full rounded-2xl border border-slate-200 shadow-md dark:border-slate-800"
          />
        )}

        {p.role && (
          <Reveal className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {t("detail.role")}
            </h2>
            <p className="mt-2">{p.role}</p>
          </Reveal>
        )}

        {sections.map((s) => (
          <Reveal key={s.title} className="mt-10">
            <h2 className="text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 leading-relaxed text-slate-600 dark:text-slate-300">
              {s.body}
            </p>
          </Reveal>
        ))}

        <Reveal className="mt-10">
          <h2 className="text-xl font-semibold">{t("detail.technologies")}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {p.skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700 dark:border-slate-700 dark:bg-slate-800 dark:text-brand-300"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </Reveal>
      </article>
    </>
  );
}