import { useSearchParams } from "react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, ChevronDown, X} from "lucide-react";
import { useT } from "@/i18n";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useProjects, type ProjectFilters } from "@/features/projects/hooks";
import { useProfile } from "@/features/profile/hooks";
import ProjectCard from "@/features/projects/ProjectCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/PageState";

export default function Projects() {
  const t = useT();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);

  const skill = params.get("skill") ?? "";
  const sort = (params.get("sort") as ProjectFilters["sort"]) ?? "newest";

  const projects = useProjects({ q: debouncedSearch, skill, sort });
  const profile = useProfile();
  const skillOptions = profile.data?.skills.map((s) => s.name) ?? [];

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
      {/* Header */}
           <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-slate-200 pb-8 dark:border-slate-800"
      >
        <p className="eyebrow">{t("projects.title")}</p>
        <h1 className="mt-3 text-4xl leading-tight sm:text-5xl">{t("projects.title")}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {t("projects.found", { count: projects.data?.length ?? "…" })}
        </p>
      </motion.header>

      {/* Panel filter */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur sm:mt-6 sm:p-4 md:sticky md:top-20 md:z-30 dark:border-slate-800 dark:bg-slate-900/90"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("projects.search")}
              aria-label={t("projects.search")}
              className="w-full rounded-lg border border-slate-300 bg-transparent py-2.5 pl-9 pr-9 text-base outline-none transition-shadow focus:ring-2 focus:ring-brand-500 sm:text-sm dark:border-slate-700"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  aria-label={t("projects.clearSearch")}
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort */}
          <div className="relative w-full md:w-52">
            <select
              value={sort}
              onChange={(e) => setParam("sort", e.target.value)}
              aria-label={t("projects.sortLabel")}
              className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-4 pr-10 text-base outline-none transition-colors hover:border-brand-500 focus:ring-2 focus:ring-brand-500 sm:text-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <option value="newest">{t("projects.sort.newest")}</option>
              <option value="title">{t("projects.sort.title")}</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-500"
              aria-hidden
            />
          </div>
        </div>

        {/* Chip skill: bisa digeser ke samping di HP */}
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-visible"
          role="group"
          aria-label={t("projects.filterBySkill")}
        >
          {[{ name: "" }, ...skillOptions.map((n) => ({ name: n }))].map((opt) => {
            const active = skill === opt.name;
            return (
              <button
                key={opt.name || "all"}
                onClick={() => setParam("skill", opt.name)}
                aria-pressed={active}
                className={`relative shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "text-white"
                    : "border border-slate-300 text-slate-600 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:text-slate-300 dark:hover:text-brand-300"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="skill-chip"
                    className="absolute inset-0 rounded-full bg-brand-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative">{opt.name || t("projects.all")}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Daftar proyek */}
      <div className="mt-8 sm:mt-10">
        {projects.isLoading && <LoadingState />}
        {projects.isError && (
          <ErrorState message={t("common.error")} onRetry={() => projects.refetch()} />
        )}
        {projects.data && projects.data.length === 0 && (
          <EmptyState message={t("projects.empty")} />
        )}
        {projects.data && projects.data.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.data.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}