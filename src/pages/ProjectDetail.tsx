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

const ease = [0.22, 1, 0.36, 1] as const;

export default function ProjectDetail() {
  const t = useT();
  const { slug = "" } = useParams();
  const project = useProject(slug);

  // Bar progres tipis di atas layar yang mengikuti scroll
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // Catat kunjungan hanya setelah data proyek berhasil dimuat
  const loadedSlug = project.data?.slug;
  useEffect(() => {
    if (loadedSlug) track("project_view", `/projects/${loadedSlug}`);
  }, [loadedSlug]);

  if (project.isLoading) return <LoadingState />;
  if (project.error instanceof ApiError && project.error.status === 404) return <NotFound />;
  if (project.isError)
    return <ErrorState message={t("common.error")} onRetry={() => project.refetch()} />;

  const p = project.data!;

  const sections = [
    { title: t("detail.problem"), body: p.problem },
    { title: t("detail.solution"), body: p.solution },
  ].filter((s) => s.body);

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-px origin-left bg-brand-700 dark:bg-brand-300"
        aria-hidden
      />

      <article className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease }}
        >
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900 dark:hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden />
            {t("projects.title")}
          </Link>
        </motion.div>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="mt-10"
        >
          <p className="eyebrow">{p.category}</p>
          <h1 className="mt-3 break-words text-4xl leading-[1.1] sm:text-5xl">{p.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600 dark:text-slate-300">{p.summary}</p>

          {(p.githubUrl || p.liveUrl) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {p.githubUrl && (
                <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">
                  <Github className="size-4" aria-hidden />
                  {t("detail.github")}
                </a>
              )}
              {p.liveUrl && (
                <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <ExternalLink className="size-4" aria-hidden />
                  {t("detail.live")}
                </a>
              )}
            </div>
          )}
        </motion.header>

                {p.imageUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6, ease }}
            className="mt-10 flex justify-center rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900"
          >
            <img
              src={p.imageUrl}
              alt={p.title}
              className="h-auto max-h-[480px] w-auto max-w-full object-contain"
            />
          </motion.div>
        )}

        {p.role && (
          <Reveal className="mt-14 border-t border-slate-200 pt-8 dark:border-slate-800">
            <h2 className="eyebrow">{t("detail.role")}</h2>
            <p className="mt-3 text-lg">{p.role}</p>
          </Reveal>
        )}

        {sections.map((s) => (
          <Reveal
            key={s.title}
            className="mt-14 border-t border-slate-200 pt-8 dark:border-slate-800"
          >
            <h2 className="text-2xl sm:text-3xl">{s.title}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-slate-600 dark:text-slate-300">{s.body}</p>
          </Reveal>
        ))}

        <Reveal className="mt-14 border-t border-slate-200 pt-8 dark:border-slate-800">
          <h2 className="eyebrow">{t("detail.technologies")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.skills.map((s, i) => (
              <motion.span
                key={s}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
                className="rounded border border-slate-200 px-2.5 py-1 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-300"
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