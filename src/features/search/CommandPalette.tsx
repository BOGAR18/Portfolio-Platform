import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useProfile } from "@/features/profile/hooks";
import { useUiStore } from "@/store/ui";
import { useT } from "@/i18n";

interface Command {
  id: string;
  label: string;
  run: () => void;
}

// Ctrl+K (atau Cmd+K di Mac) membuka palette. Navigasi dengan panah atas/bawah dan Enter.
export default function CommandPalette() {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const profile = useProfile();

  const toggleTheme = () => {
    const { theme, setTheme } = useUiStore.getState();
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const commands: Command[] = useMemo(
    () => [
      { id: "home", label: t("cmd.home"), run: () => navigate("/") },
      { id: "projects", label: t("cmd.projects"), run: () => navigate("/projects") },
      { id: "contact", label: t("cmd.contact"), run: () => navigate("/contact") },
      { id: "theme", label: t("cmd.theme"), run: toggleTheme },
      {
        id: "chat",
        label: t("cmd.chat"),
        run: () => window.dispatchEvent(new Event("open-chat")),
      },
      {
        id: "github",
        label: t("cmd.github"),
        run: () =>
          profile.data?.profile?.github &&
          window.open(profile.data.profile.github, "_blank", "noopener"),
      },
      {
        id: "linkedin",
        label: t("cmd.linkedin"),
        run: () =>
          profile.data?.profile?.linkedin &&
          window.open(profile.data.profile.linkedin, "_blank", "noopener"),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigate, profile.data, t],
  );

  const results = commands.filter((c) =>
    c.label.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActive(0);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  const runAt = (index: number) => {
    results[index]?.run();
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        role="dialog"
        aria-label={t("cmd.search")}
        className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setActive((i) => Math.min(i + 1, results.length - 1));
            if (e.key === "ArrowUp") setActive((i) => Math.max(i - 1, 0));
            if (e.key === "Enter") runAt(active);
          }}
          placeholder={t("cmd.placeholder")}
          className="w-full border-b border-slate-200 bg-transparent px-4 py-3 outline-none dark:border-slate-700"
          aria-label={t("cmd.search")}
        />
        <ul className="max-h-72 overflow-y-auto p-2">
          {results.map((c, i) => (
            <li key={c.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => runAt(i)}
                className={`w-full rounded-md px-3 py-2 text-left text-sm ${
                  i === active
                    ? "bg-brand-600 text-white"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {c.label}
              </button>
            </li>
          ))}
          {results.length === 0 && (
            <li className="px-3 py-2 text-sm text-slate-500">{t("cmd.empty")}</li>
          )}
        </ul>
      </div>
    </div>
  );
}