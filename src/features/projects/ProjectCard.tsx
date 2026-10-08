import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import type { ProjectDto } from "@shared/types";
import { useT } from "@/i18n";

export default function ProjectCard({ project, index = 0 }: { project: ProjectDto; index?: number }) {
  const t = useT();

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg sm:hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-900"
    >
      {project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          loading="lazy"
          className="aspect-video w-full object-cover"
        />
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <span className="text-[11px] font-medium uppercase tracking-wide text-brand-600 sm:text-xs dark:text-brand-500">
          {project.category}
        </span>
        <h3 className="mt-2 break-words text-base font-semibold sm:text-lg">{project.title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {project.summary}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">
          {project.skills.map((skill) => (
            <span
              key={skill}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] sm:text-xs dark:bg-slate-800"
            >
              {skill}
            </span>
          ))}
        </div>

        <Link
          to={`/projects/${project.slug}`}
          className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline dark:text-brand-500"
        >
          {t("projects.viewDetail")}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}