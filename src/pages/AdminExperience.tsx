import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { LoadingState, EmptyState } from "@/components/PageState";

interface Experience {
  id: string;
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string[];
  order: number;
}

interface FormValues {
  company: string;
  position: string;
  period: string;
  description: string;
  technologies: string; // diketik dipisah koma, diubah jadi array saat dikirim
  order: number;
}

const emptyValues: FormValues = {
  company: "",
  position: "",
  period: "",
  description: "",
  technologies: "",
  order: 0,
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/15 dark:border-slate-700 dark:bg-slate-950";
const errorClass = "mt-1 text-xs text-red-600";

// Mengubah error dari server, termasuk rincian per field, menjadi satu teks untuk toast
function errorMessage(err: unknown): string {
  if (err instanceof ApiError && err.details && typeof err.details === "object") {
    const fields = Object.entries(err.details as Record<string, string[]>).map(
      ([field, messages]) => `${field}: ${messages.join(", ")}`,
    );
    if (fields.length > 0) return `${err.message} (${fields.join("; ")})`;
  }
  return err instanceof Error ? err.message : "Terjadi kesalahan";
}

export default function AdminExperience() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);

  const list = useQuery({
    queryKey: ["admin-experiences"],
    queryFn: () => api<{ data: Experience[] }>("/experiences").then((r) => r.data),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: emptyValues });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-experiences"] });
    qc.invalidateQueries({ queryKey: ["profile"] });
  };

  const save = useMutation({
    mutationFn: (payload: unknown) =>
      editingId
        ? api(`/experiences/${editingId}`, { method: "PUT", body: JSON.stringify(payload) })
        : api("/experiences", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success(editingId ? "Pengalaman diperbarui" : "Pengalaman ditambahkan");
      setEditingId(null);
      reset(emptyValues);
      refresh();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api(`/experiences/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Pengalaman dihapus");
      refresh();
    },
    onError: (err: unknown) => toast.error(errorMessage(err)),
  });

  const onSubmit = handleSubmit((v) => {
    save.mutate({
      company: v.company.trim(),
      position: v.position.trim(),
      period: v.period.trim(),
      description: v.description.trim(),
      technologies: v.technologies.split(",").map((s) => s.trim()).filter(Boolean),
      order: Number(v.order) || 0,
    });
  });

  function startEdit(e: Experience) {
    setEditingId(e.id);
    reset({
      company: e.company,
      position: e.position,
      period: e.period,
      description: e.description,
      technologies: e.technologies.join(", "),
      order: e.order,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    reset(emptyValues);
  }

  const items = list.data ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10">
      <h1 className="text-2xl font-bold">Kelola Pengalaman</h1>

      <form
        onSubmit={onSubmit}
        noValidate
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 className="font-semibold">{editingId ? "Edit pengalaman" : "Tambah pengalaman"}</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <input
              placeholder="Perusahaan"
              className={inputClass}
              {...register("company", {
                required: "Wajib diisi",
                minLength: { value: 2, message: "Minimal 2 karakter" },
                maxLength: { value: 120, message: "Maksimal 120 karakter" },
              })}
            />
            {errors.company && <p className={errorClass}>{errors.company.message}</p>}
          </div>

          <div>
            <input
              placeholder="Posisi"
              className={inputClass}
              {...register("position", {
                required: "Wajib diisi",
                minLength: { value: 2, message: "Minimal 2 karakter" },
                maxLength: { value: 120, message: "Maksimal 120 karakter" },
              })}
            />
            {errors.position && <p className={errorClass}>{errors.position.message}</p>}
          </div>

          <div>
            <input
              placeholder="Periode (contoh: Des 2025 - Sep 2026)"
              className={inputClass}
              {...register("period", {
                required: "Wajib diisi",
                minLength: { value: 3, message: "Minimal 3 karakter" },
                maxLength: { value: 60, message: "Maksimal 60 karakter" },
              })}
            />
            {errors.period && <p className={errorClass}>{errors.period.message}</p>}
          </div>

          <div>
            <input
              type="number"
              placeholder="Urutan (angka kecil tampil lebih dulu)"
              className={inputClass}
              {...register("order", {
                min: { value: 0, message: "Minimal 0" },
                max: { value: 999, message: "Maksimal 999" },
              })}
            />
            {errors.order && <p className={errorClass}>{errors.order.message}</p>}
          </div>
        </div>

        <div>
          <textarea
            placeholder="Deskripsi (minimal 10 karakter)"
            rows={4}
            className={inputClass}
            {...register("description", {
              required: "Wajib diisi",
              minLength: { value: 10, message: "Minimal 10 karakter" },
              maxLength: { value: 2000, message: "Maksimal 2000 karakter" },
            })}
          />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

        <input
          placeholder="Teknologi, pisahkan dengan koma (opsional)"
          className={inputClass}
          {...register("technologies")}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={save.isPending} className="btn-primary">
            {save.isPending ? "Menyimpan..." : editingId ? "Simpan perubahan" : "Tambah"}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit} className="btn-outline">
              Batal edit
            </button>
          )}
        </div>
      </form>

      {list.isLoading && <LoadingState />}
      {list.data?.length === 0 && <EmptyState message="Belum ada pengalaman" />}

      <ul className="space-y-3">
        {items.map((e) => (
          <li
            key={e.id}
            className="flex items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="min-w-0">
              <p className="font-semibold">
                {e.position} · {e.company}
              </p>
              <p className="text-sm text-slate-500">{e.period}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => startEdit(e)}
                aria-label={`Edit ${e.position}`}
                className="rounded-lg p-2 text-brand-700 hover:bg-brand-50"
              >
                <Pencil className="size-4" aria-hidden />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Hapus ${e.position} di ${e.company}?`)) remove.mutate(e.id);
                }}
                aria-label={`Hapus ${e.position}`}
                className="rounded-lg p-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}