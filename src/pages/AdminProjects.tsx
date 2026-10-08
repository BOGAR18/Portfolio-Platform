import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { FolderKanban, Star, Plus, Trash2, ExternalLink, Languages } from "lucide-react";
import type { z } from "zod";
import { projectInputSchema } from "@shared/schemas";
import { useT } from "@/i18n";
import { api } from "@/lib/api";
import { useProjects } from "@/features/projects/hooks";
import { LoadingState, EmptyState } from "@/components/PageState";

// Tipe input dari form, termasuk field terjemahan Indonesia yang hanya ada di form
type FormValues = z.input<typeof projectInputSchema> & {
  titleId?: string;
  summaryId?: string;
  problemId?: string;
  solutionId?: string;
};

function StatCard({
  label,
  value,
  icon: Icon,
  delay,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex size-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700 dark:bg-slate-800 dark:text-brand-300">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminProjects() {
  const t = useT();
  const queryClient = useQueryClient();
  const projects = useProjects({ q: "", skill: "", sort: "newest" });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["projects"] });

  const create = useMutation({
    mutationFn: (payload: unknown) =>
      api("/projects", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success(t("admin.created"));
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("admin.deleted"));
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
   resolver: zodResolver(projectInputSchema),
    defaultValues: {
      slug: "",
      title: "",
      summary: "",
      problem: "",
      solution: "",
      role: "",
      category: "",
      githubUrl: "",
      liveUrl: "",
      featured: false,
      published: true,
      skills: [],
    },
  });

  // Susun payload: teks Inggris dari field utama, teks Indonesia dari field *Id.
  // Jika field Indonesia kosong, teks Inggris dipakai sebagai cadangan.
  const onSubmit = handleSubmit((values) => {
    const { titleId, summaryId, problemId, solutionId, ...base } = values;

    const payload = {
      ...base,
      translations: {
        en: {
          title: base.title,
          summary: base.summary,
          problem: base.problem ?? "",
          solution: base.solution ?? "",
          role: base.role ?? "",
        },
        id: {
          title: titleId || base.title,
          summary: summaryId || base.summary,
          problem: problemId || base.problem || "",
          solution: solutionId || base.solution || "",
          role: base.role ?? "",
        },
      },
    };

    create.mutate(payload, { onSuccess: () => reset() });
  });

  const list = projects.data ?? [];
  const featuredCount = list.filter((p) => p.featured).length;

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-950";
  const textareaClass = `${inputClass} min-h-24 resize-y`;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-slate-900 p-8 text-white md:p-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
        <p className="text-sm font-medium uppercase tracking-widest text-brand-100">{t("admin.label")}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{t("admin.projects")}</h1>
      </motion.header>

      {/* Ringkasan */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label={t("admin.statTotal")} value={list.length} icon={FolderKanban} delay={0.1} />
        <StatCard label={t("admin.statFeatured")} value={featuredCount} icon={Star} delay={0.18} />
        <StatCard label={t("admin.statPublic")} value={list.length} icon={ExternalLink} delay={0.26} />
      </div>

      {/* Form tambah */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Plus className="size-5" aria-hidden />
          </div>
          <h2 className="text-lg font-semibold">{t("admin.create")}</h2>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-8">
          {/* Data umum */}
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <input placeholder={t("admin.slugPh")} className={inputClass} {...register("slug")} />
              {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
            </div>
            <div>
              <input placeholder={t("admin.categoryPh")} className={inputClass} {...register("category")} />
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category.message}</p>}
            </div>
            <div>
              <input placeholder={t("admin.skillsPh")} className={inputClass}
                {...register("skills", {
                  setValueAs: (v: string | string[]) =>
                    typeof v === "string" ? v.split(",").map((s) => s.trim()).filter(Boolean) : v,
                })}
              />
            </div>
            <div>
              <input placeholder={t("admin.githubPh")} className={inputClass} {...register("githubUrl")} />
              {errors.githubUrl && <p className="mt-1 text-xs text-red-600">{errors.githubUrl.message}</p>}
            </div>
            <div>
              <input placeholder={t("admin.liveUrlPh")} className={inputClass} {...register("liveUrl")} />
              {errors.liveUrl && <p className="mt-1 text-xs text-red-600">{errors.liveUrl.message}</p>}
            </div>
            <div>
              <input placeholder="Role (contoh: Full Stack Developer)" className={inputClass} {...register("role")} />
            </div>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" className="size-4 accent-brand-600" {...register("featured")} />
              {t("admin.featuredCheckbox")}
            </label>
          </div>

          {/* Teks Inggris */}
          <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <legend className="flex items-center gap-2 px-2 text-sm font-semibold">
              <Languages className="size-4 text-brand-600" aria-hidden /> English
            </legend>
            <div>
              <input placeholder="Title" className={inputClass} {...register("title")} />
              {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>}
            </div>
            <div>
              <textarea placeholder="Short summary" className={inputClass} {...register("summary")} />
              {errors.summary && <p className="mt-1 text-xs text-red-600">{errors.summary.message}</p>}
            </div>
            <div>
              <textarea placeholder="Problem" className={textareaClass} {...register("problem")} />
            </div>
            <div>
              <textarea placeholder="Solution" className={textareaClass} {...register("solution")} />
            </div>
          </fieldset>

          {/* Teks Indonesia */}
          <fieldset className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <legend className="flex items-center gap-2 px-2 text-sm font-semibold">
              <Languages className="size-4 text-brand-600" aria-hidden /> Bahasa Indonesia
            </legend>
            <p className="text-xs text-slate-500">
              Kosongkan jika sama dengan versi Inggris.
            </p>
            <div>
              <input placeholder="Judul" className={inputClass} {...register("titleId")} />
            </div>
            <div>
              <textarea placeholder="Ringkasan singkat" className={inputClass} {...register("summaryId")} />
            </div>
            <div>
              <textarea placeholder="Masalah" className={textareaClass} {...register("problemId")} />
            </div>
            <div>
              <textarea placeholder="Solusi" className={textareaClass} {...register("solutionId")} />
            </div>
          </fieldset>

          <div>
            <button type="submit" disabled={create.isPending} className="btn-primary">
              <Plus className="size-4" aria-hidden />
              {create.isPending ? t("common.loading") : t("admin.create")}
            </button>
          </div>
        </form>
      </motion.section>

      {/* Daftar proyek */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("admin.listTitle")}</h2>

        {projects.isLoading && <LoadingState />}
        {projects.data?.length === 0 && <EmptyState message={t("projects.empty")} />}

        <ul className="grid gap-3">
          <AnimatePresence initial={false}>
            {list.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                transition={{ delay: i * 0.03 }}
                className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{p.title}</p>
                    {p.featured && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {t("admin.featuredBadge")}
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {p.slug} · {p.category}
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(t("admin.confirmDelete", { title: p.title }))) remove.mutate(p.id);
                  }}
                  disabled={remove.isPending}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950"
                  aria-label={t("admin.deleteAria", { title: p.title })}
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t("admin.delete")}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </div>
  );
}