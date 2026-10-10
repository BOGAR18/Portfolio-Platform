import { Link } from "react-router";
import { useT } from "@/i18n";
import { NotFoundArt } from "@/components/Illustrations";

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <NotFoundArt className="h-32 w-32 text-slate-400 dark:text-slate-600" />
      <p className="eyebrow">404</p>
      <h1 className="text-3xl">{t("common.notFound")}</h1>
      <Link to="/" className="btn-outline">
        {t("common.backHome")}
      </Link>
    </div>
  );
}