import { useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { motion } from "motion/react";
import { Lock, Mail, LogIn, AlertCircle } from "lucide-react";
import { loginSchema } from "@shared/schemas";
import { useT } from "@/i18n";
import { useLogin, useMe } from "@/features/auth/hooks";
import { ApiError } from "@/lib/api";

type LoginForm = z.input<typeof loginSchema>;

export default function Login() {
  const t = useT();
  const navigate = useNavigate();
  const me = useMe();
  const login = useLogin();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (me.data?.user.role === "ADMIN") return <Navigate to="/admin/projects" replace />;

  const onSubmit = handleSubmit(async (values) => {
    setServerError("");
    try {
      await login.mutateAsync(values);
      navigate("/admin/projects");
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : t("auth.invalid"));
    }
  });

  const inputClass =
    "w-full rounded-md border border-slate-300 bg-transparent py-2.5 pl-10 pr-4 text-base outline-none transition-colors placeholder:text-slate-400 focus:border-brand-700 focus:ring-2 focus:ring-brand-500/20 sm:text-sm dark:border-slate-700 dark:focus:border-brand-300";

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-md border border-slate-300 text-slate-800 dark:border-slate-700 dark:text-slate-100">
            <Lock className="size-5" aria-hidden />
          </div>
          <h1 className="mt-6 text-3xl leading-tight">{t("auth.login")}</h1>
          <p className="mt-2 text-sm text-slate-500">Area khusus administrator</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="admin@email.com"
                className={inputClass}
                {...register("email")}
                aria-invalid={!!errors.email}
              />
            </div>
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden />
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClass}
                {...register("password")}
                aria-invalid={!!errors.password}
              />
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
          </div>

          {serverError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="flex items-start gap-2 rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:text-red-300"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span className="min-w-0 break-words">{serverError}</span>
            </motion.div>
          )}

          <button type="submit" disabled={login.isPending} className="btn-primary group w-full py-3">
            <LogIn className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            {login.isPending ? t("common.loading") : t("auth.login")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}