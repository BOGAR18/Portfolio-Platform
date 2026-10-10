import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { Globe, Menu, Monitor, Moon, Sun, X } from "lucide-react";
import { useT } from "@/i18n";
import { useUiStore, type Theme } from "@/store/ui";
import { useMe, useLogout } from "@/features/auth/hooks";

const THEME_ORDER: Theme[] = ["light", "dark", "system"];
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };

export default function Navbar() {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { theme, setTheme, locale, setLocale } = useUiStore();
  const me = useMe();
  const logout = useLogout();

  const ThemeIcon = THEME_ICON[theme];
  const nextTheme = () =>
    setTheme(
      THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length],
    );

  const isAdmin = me.data?.user.role === "ADMIN";

  const desktopLink = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors hover:text-brand-600 dark:hover:text-brand-500 ${
      isActive
        ? "font-semibold text-brand-600 dark:text-brand-500"
        : "text-slate-600 dark:text-slate-300"
    }`;

  const mobileLink = ({ isActive }: { isActive: boolean }) =>
    `block rounded-lg px-3 py-2.5 text-base transition-colors ${
      isActive
        ? "bg-brand-50 font-semibold text-brand-600 dark:bg-slate-800 dark:text-brand-300"
        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
    }`;

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <nav
        className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:h-16"
        aria-label="Main"
      >
        <Link to="/" className="min-w-0 truncate font-serif text-xl tracking-tight">
          SATRIO TEGAR<span className="text-brand-500"></span>
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={desktopLink}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/projects" className={desktopLink}>
            {t("nav.projects")}
          </NavLink>
          <NavLink to="/contact" className={desktopLink}>
            {t("nav.contact")}
          </NavLink>
          {isAdmin && (
            <>
              <NavLink to="/admin/projects" className={desktopLink}>
                {t("nav.admin")}
              </NavLink>
              <NavLink to="/admin/experiences" className={desktopLink}>
                Pengalaman
              </NavLink>
            </>
          )}
        </div>

        {/* Tombol kanan */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
          <button
            onClick={() => setLocale(locale === "en" ? "id" : "en")}
            className="inline-flex items-center gap-1 rounded-md px-2 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("nav.changeLang")}
          >
            <Globe className="size-4" aria-hidden />
            {locale.toUpperCase()}
          </button>

          <button
            onClick={nextTheme}
            className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={t("nav.themeLabel", { mode: t(`theme.${theme}`) })}
            title={t("nav.themeLabel", { mode: t(`theme.${theme}`) })}
          >
            <ThemeIcon className="size-4" aria-hidden />
          </button>

          {isAdmin ? (
            <button
              onClick={() =>
                logout.mutate(undefined, { onSuccess: () => navigate("/") })
              }
              className="hidden rounded-md px-3 py-1.5 text-sm hover:bg-slate-100 md:block dark:hover:bg-slate-800"
            >
              {t("nav.logout")}
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden text-sm text-slate-500 hover:text-slate-900 md:block dark:text-slate-400 dark:hover:text-white"
            >
              {t("nav.login")}
            </Link>
          )}

          <button
            className="rounded-md p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={t("nav.toggleMenu")}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {/* Menu mobile: flex-col agar setiap link punya baris sendiri */}
      {open && (
        <div className="flex flex-col gap-1 border-t border-slate-200 px-3 py-3 md:hidden dark:border-slate-800">
          <NavLink to="/" end className={mobileLink} onClick={closeMenu}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/projects" className={mobileLink} onClick={closeMenu}>
            {t("nav.projects")}
          </NavLink>
          <NavLink to="/contact" className={mobileLink} onClick={closeMenu}>
            {t("nav.contact")}
          </NavLink>
          {isAdmin ? (
            <>
              <NavLink
                to="/admin/projects"
                className={mobileLink}
                onClick={closeMenu}
              >
                {t("nav.admin")}
              </NavLink>
              <NavLink
                to="/admin/experiences"
                className={mobileLink}
                onClick={closeMenu}
              >
                Pengalaman
              </NavLink>
              <button
                onClick={() => {
                  closeMenu();
                  logout.mutate(undefined, { onSuccess: () => navigate("/") });
                }}
                className="block rounded-lg px-3 py-2.5 text-left text-base text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <NavLink to="/login" className={mobileLink} onClick={closeMenu}>
              {t("nav.login")}
            </NavLink>
          )}
        </div>
      )}
    </header>
  );
}
