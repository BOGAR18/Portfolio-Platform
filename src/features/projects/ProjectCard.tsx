import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProjectDto } from "@shared/types";
import { useT } from "@/i18n";
import { ProjectArt } from "@/components/Illustrations";

export default function ProjectCard({ project, index = 0 }: { project: ProjectDto; index?: number }) {
  const t = useT();

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-colors hover:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-600"
    >
      <div className="flex aspect-video w-full items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800">
        {project.imageUrl ? (
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            className="size-full object-contain"
          />
        ) : (
          <ProjectArt className="size-full text-slate-400 dark:text-slate-500" />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="eyebrow">{project.category}</p>
        <h3 className="mt-2 break-words text-xl leading-snug">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {project.summary}
        </p>
        <p className="mt-4 text-xs text-slate-500">{project.skills.join(" · ")}</p>

        <Link
          to={`/projects/${project.slug}`}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-slate-900 underline-offset-4 hover:underline dark:text-slate-100"
        >
          {t("projects.viewDetail")}
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </motion.article>
  );
}