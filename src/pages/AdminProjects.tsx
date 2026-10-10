import { useState, type ReactNode } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { FolderKanban, Star, Plus, Trash2, Pencil, ExternalLink, ChevronDown } from "lucide-react";
import { projectInputSchema } from "@shared/schemas";
import { useT } from "@/i18n";
import { api, ApiError } from "@/lib/api";
import { LoadingState, EmptyState } from "@/components/PageState";

interface AdminProject {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problem: string | null;
  solution: string | null;
  role: string | null;
  category: string;
  githubUrl: string | null;
  liveUrl: string | null;
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
  skills: string[];
  translations: { en?: Record<string, string>; id?: Record<string, string> };
  images: { url: string; caption: string | null }[];
}

type Status = "draft" | "public" | "featured";

interface FormValues {
  title: string;
  summary: string;
  category: string;
  skills: string;
  imageUrl: string;
  githubUrl: string;
  liveUrl: string;
  status: Status;
  role: string;
  problem: string;
  solution: string;
}

const defaultValues: FormValues = {
  title: "",
  summary: "",
  category: "",
  skills: "",
  imageUrl: "",
  githubUrl: "",
  liveUrl: "",
  status: "public",
  role: "",
  problem: "",
  solution: "",
};

const STATUS_OPTIONS: { value: Status; label: string; hint: string }[] = [
  { value: "draft", label: "Draft", hint: "Hanya terlihat oleh admin" },
  { value: "public", label: "Publik", hint: "Tampil di halaman Projects dan chatbot" },
  { value: "featured", label: "Unggulan", hint: "Publik, dan tampil di beranda" },
];

// Membuat slug dari judul. Schema mewajibkan minimal 3 karakter.
function makeSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return base.length >= 3 ? base : `project-${base || "baru"}`;
}

// Slug harus unik. Jika sudah dipakai, ditambah angka di belakang.
function uniqueSlug(base: string, taken: Set<string>): string {
  let slug = base;
  let n = 2;
  while (taken.has(slug)) slug = `${base}-${n++}`;
  return slug;
}

const normalizeSkills = (v: string): string[] =>
  v.split(",").map((s) => s.trim()).filter(Boolean);

// Validasi memakai schema yang sama dengan server
const resolver: Resolver<FormValues> = async (values, ctx, opts) => {
  const candidate = {
    slug: makeSlug(values.title),
    title: values.title.trim(),
    summary: values.summary.trim(),
    category: values.category.trim(),
    githubUrl: values.githubUrl.trim(),
    liveUrl: values.liveUrl.trim(),
    imageUrl: values.imageUrl.trim(),
    role: values.role.trim(),
    problem: values.problem.trim(),
    solution: values.solution.trim(),
    skills: normalizeSkills(values.skills),
    published: values.status !== "draft",
    featured: values.status === "featured",
    translations: {},
  };
  const res = await zodResolver(projectInputSchema)(candidate as never, ctx, opts);
  if (Object.keys(res.errors).length > 0) return res;
  return { values, errors: {} };
};

// Menampilkan rincian field dari server, misalnya "imageUrl: Invalid url"
function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.details && typeof err.details === "object") {
    const fields = Object.entries(err.details as Record<string, string[]>).map(
      ([field, messages]) => `${field}: ${messages.join(", ")}`,
    );
    if (fields.length > 0) return `${err.message} (${fields.join("; ")})`;
  }
  return err instanceof Error ? err.message : "Terjadi kesalahan";
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="min-w-0 space-y-4 rounded-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800">
      <legend className="px-2 text-sm font-semibold">{title}</legend>
      {children}
    </fieldset>
  );
}

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
      className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:gap-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700 sm:size-11 dark:bg-slate-800 dark:text-brand-300">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold">{value}</p>
        <p className="truncate text-xs uppercase tracking-wide text-slate-500">{label}</p>
      </div>
    </motion.div>
  );
}

export default function AdminProjects() {
  const t = useT();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminProject | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  const projects = useQuery({
    queryKey: ["admin-projects"],
    queryFn: () => api<{ data: AdminProject[] }>("/projects/admin/all").then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver, defaultValues });

  const imageUrl = watch("imageUrl").trim();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-projects"] });
    queryClient.invalidateQueries({ queryKey: ["projects"] });
  };

  const cancelEdit = () => {
    setEditing(null);
    setPreviewFailed(false);
    reset(defaultValues);
  };

  const save = useMutation({
    mutationFn: (payload: unknown) =>
      editing
        ? api<{ warning?: string }>(`/projects/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) })
        : api<{ warning?: string }>("/projects", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: (res) => {
      if (res?.warning) toast.warning(res.warning);
      else toast.success(editing ? "Project diperbarui" : "Project ditambahkan");
      cancelEdit();
      refresh();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/projects/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success(t("admin.deleted"));
      refresh();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const onSubmit = handleSubmit((v) => {
    // Project lama mempertahankan slug-nya agar link lama tidak rusak
    let slug = editing?.slug;
    if (!slug) {
      const taken = new Set((projects.data ?? []).map((p) => p.slug));
      slug = uniqueSlug(makeSlug(v.title), taken);
    }

    save.mutate({
      slug,
      title: v.title.trim(),
      summary: v.summary.trim(),
      category: v.category.trim(),
      githubUrl: v.githubUrl.trim(),
      liveUrl: v.liveUrl.trim(),
      imageUrl: v.imageUrl.trim(),
      role: v.role.trim(),
      problem: v.problem.trim(),
      solution: v.solution.trim(),
      skills: normalizeSkills(v.skills),
      published: v.status !== "draft",
      featured: v.status === "featured",
      // Galeri lama tetap dipertahankan saat edit, karena form ini tidak mengubahnya
      images: editing
        ? editing.images.map((i) => ({ url: i.url, caption: i.caption ?? undefined }))
        : [],
    });
  });

  function startEdit(p: AdminProject) {
    // Form memakai teks Indonesia. Jika belum ada, pakai teks utama.
    const idText: Record<string, string> = p.translations?.id ?? {};
    setEditing(p);
    setPreviewFailed(false);
    reset({
      title: idText.title ?? p.title,
      summary: idText.summary ?? p.summary,
      category: p.category,
      skills: p.skills.join(", "),
      githubUrl: p.githubUrl ?? "",
      liveUrl: p.liveUrl ?? "",
      imageUrl: p.imageUrl ?? "",
      status: p.published ? (p.featured ? "featured" : "public") : "draft",
      role: idText.role ?? p.role ?? "",
      problem: idText.problem ?? p.problem ?? "",
      solution: idText.solution ?? p.solution ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const list = projects.data ?? [];
  const featuredCount = list.filter((p) => p.featured).length;
  const publicCount = list.filter((p) => p.published).length;

  const inputClass =
    "w-full min-w-0 rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-base outline-none transition-all placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 sm:text-sm dark:border-slate-700 dark:bg-slate-950";
  const textareaClass = `${inputClass} min-h-24 resize-y`;
  const errorClass = "mt-1 text-xs text-red-600";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:py-12">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white sm:p-8 md:p-10 dark:border-slate-800"
      >
        <span className="block h-px w-12 bg-brand-400" aria-hidden />
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400 sm:text-sm">
          {t("admin.label")}
        </p>
        <h1 className="mt-2 break-words text-2xl font-semibold tracking-tight sm:text-3xl md:text-4xl">
          {t("admin.projects")}
        </h1>
      </motion.header>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard label={t("admin.statTotal")} value={list.length} icon={FolderKanban} delay={0.1} />
        <StatCard label={t("admin.statFeatured")} value={featuredCount} icon={Star} delay={0.18} />
        <StatCard label={t("admin.statPublic")} value={publicCount} icon={ExternalLink} delay={0.26} />
      </div>

      {/* Form */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 md:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="mb-5 flex items-center gap-3 sm:mb-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white">
            {editing ? <Pencil className="size-4" aria-hidden /> : <Plus className="size-5" aria-hidden />}
          </div>
          <h2 className="text-lg font-semibold">{editing ? "Edit project" : t("admin.create")}</h2>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-6">
          <Group title="Informasi utama">
            <div>
              <input placeholder="Judul project" className={inputClass} {...register("title")} />
              {errors.title && <p className={errorClass}>{errors.title.message}</p>}
            </div>
            <div>
              <textarea
                placeholder="Ringkasan singkat, 1 sampai 2 kalimat"
                className={textareaClass}
                {...register("summary")}
              />
              {errors.summary && <p className={errorClass}>{errors.summary.message}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input placeholder="Kategori, contoh: Mobile App" className={inputClass} {...register("category")} />
                {errors.category && <p className={errorClass}>{errors.category.message}</p>}
              </div>
              <div>
                <input placeholder="Teknologi, pisahkan dengan koma" className={inputClass} {...register("skills")} />
              </div>
            </div>
          </Group>

          <Group title="Foto & tautan">
            <div>
              <input
                placeholder="Link foto, berakhiran .jpg, .png, atau .webp"
                className={inputClass}
                {...register("imageUrl")}
              />
              {errors.imageUrl && <p className={errorClass}>{errors.imageUrl.message}</p>}
              <p className="mt-1 text-xs text-slate-500">
                Harus link langsung ke file. Cara termudah: upload di imgbb.com, lalu salin "Direct link".
              </p>
              {imageUrl && !previewFailed && (
                <img
                  src={imageUrl}
                  alt="Pratinjau foto"
                  onError={() => setPreviewFailed(true)}
                  onLoad={() => setPreviewFailed(false)}
                  className="mt-3 aspect-video w-full max-w-xs rounded-xl border border-slate-200 object-cover dark:border-slate-800"
                />
              )}
              {imageUrl && previewFailed && (
                <p className="mt-2 text-xs text-red-600">
                  Foto tidak bisa dimuat. Pastikan link bisa dibuka langsung di tab baru dan berakhiran .jpg atau .png.
                </p>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <input placeholder="Link GitHub (opsional)" className={inputClass} {...register("githubUrl")} />
                {errors.githubUrl && <p className={errorClass}>{errors.githubUrl.message}</p>}
              </div>
              <div>
                <input placeholder="Link demo (opsional)" className={inputClass} {...register("liveUrl")} />
                {errors.liveUrl && <p className={errorClass}>{errors.liveUrl.message}</p>}
              </div>
            </div>
          </Group>

          <details className="group rounded-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              Detail tambahan (opsional)
              <ChevronDown className="size-4 transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <div className="mt-4 space-y-4">
              <input placeholder="Peran Anda, contoh: Full Stack Developer" className={inputClass} {...register("role")} />
              <textarea placeholder="Masalah yang diselesaikan" className={textareaClass} {...register("problem")} />
              <textarea placeholder="Solusi yang dibuat" className={textareaClass} {...register("solution")} />
            </div>
          </details>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
            <div role="radiogroup" aria-label="Status" className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  title={opt.hint}
                  className="cursor-pointer rounded-full border border-slate-300 px-3.5 py-1.5 text-sm transition-colors has-[:checked]:border-brand-600 has-[:checked]:bg-brand-600 has-[:checked]:text-white dark:border-slate-700 dark:has-[:checked]:border-brand-500"
                >
                  <input type="radio" value={opt.value} className="sr-only" {...register("status")} />
                  {opt.label}
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {editing && (
                <button type="button" onClick={cancelEdit} className="btn-outline w-full sm:w-auto">
                  Batal
                </button>
              )}
              <button type="submit" disabled={save.isPending} className="btn-primary w-full sm:w-auto">
                {save.isPending ? t("common.loading") : editing ? "Simpan perubahan" : t("admin.create")}
              </button>
            </div>
          </div>
        </form>
      </motion.section>

      {/* Daftar project */}
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
                className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-md sm:gap-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{p.title}</p>
                    {p.featured && (
                      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                        {t("admin.featuredBadge")}
                      </span>
                    )}
                    {!p.published && (
                      <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        Draft
                      </span>
                    )}
                  </div>
                  <p className="truncate text-sm text-slate-500">
                    {p.slug} · {p.category}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => startEdit(p)}
                    aria-label={`Edit ${p.title}`}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50 sm:px-3 dark:text-brand-300 dark:hover:bg-slate-800"
                  >
                    <Pencil className="size-4" aria-hidden />
                    <span className="hidden sm:inline">Edit</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(t("admin.confirmDelete", { title: p.title }))) remove.mutate(p.id);
                    }}
                    disabled={remove.isPending}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 sm:px-3 dark:hover:bg-red-950"
                    aria-label={t("admin.deleteAria", { title: p.title })}
                  >
                    <Trash2 className="size-4" aria-hidden />
                    <span className="hidden sm:inline">{t("admin.delete")}</span>
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </section>
    </div>
  );
}