import { useT } from "@/i18n";

export default function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-slate-200 py-8 text-center text-xs tracking-wide text-slate-500 dark:border-slate-800">
      {t("footer.text", { year: new Date().getFullYear() })}
    </footer>
  );
}