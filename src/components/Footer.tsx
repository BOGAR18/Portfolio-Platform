import { useT } from "@/i18n";

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
      {t("footer.text", { year: new Date().getFullYear() })}
    </footer>
  );
}