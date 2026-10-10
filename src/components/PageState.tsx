import { Loader2, AlertTriangle } from "lucide-react";
import { useT } from "@/i18n";
import { EmptyArt } from "@/components/Illustrations";

export function LoadingState({ label }: { label?: string }) {
  const t = useT();
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500" role="status">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label ?? t("common.loading")}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center" role="alert">
      <AlertTriangle className="size-6 text-amber-600" aria-hidden />
      <p className="text-slate-600 dark:text-slate-300">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-outline py-2">
          {t("common.retry")}
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center text-slate-500">
      <EmptyArt className="h-24 w-auto text-slate-400 dark:text-slate-600" />
      <p>{message}</p>
    </div>
  );
}