import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { Globe, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import { useT } from '@/i18n';
import { useUiStore, type Theme } from '@/store/ui';
import { useMe, useLogout } from '@/features/auth/hooks';

const THEME_ORDER: Theme[] = ['light', 'dark', 'system'];
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };

export default function Navbar() {
  const t = useT();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { theme, setTheme, locale, setLocale } = useUiStore();
  const me = useMe();
  const logout = useLogout();

  const ThemeIcon = THEME_ICON[theme];
  const nextTheme = () => setTheme(THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm transition-colors hover:text-brand-600 dark:hover:text-brand-500 ${
      isActive ? 'font-semibold text-brand-600 dark:text-brand-500' : 'text-slate-600 dark:text-slate-300'
    }`;

  const isAdmin = me.data?.user.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
     <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16" aria-label="Main">
        <Link to="/" className="font-bold tracking-tight">
          Bogar<span className="text-brand-500">25.dev</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={linkClass}>{t('nav.home')}</NavLink>
          <NavLink to="/projects" className={linkClass}>{t('nav.projects')}</NavLink>
          <NavLink to="/contact" className={linkClass}>{t('nav.contact')}</NavLink>
          {isAdmin && <NavLink to="/admin/projects" className={linkClass}>{t('nav.admin')}</NavLink>}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            onClick={() => setLocale(locale === 'en' ? 'id' : 'en')}
            className="rounded-md p-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Change language"
          >
            <Globe className="mr-1 inline size-4" aria-hidden />
            {locale.toUpperCase()}
          </button>

          <button
            onClick={nextTheme}
            className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label={`Theme: ${theme}`}
            title={`Theme: ${theme}`}
          >
            <ThemeIcon className="size-4" aria-hidden />
          </button>

          {isAdmin ? (
            <button
              onClick={() => logout.mutate(undefined, { onSuccess: () => navigate('/') })}
              className="hidden rounded-md px-3 py-1.5 text-sm hover:bg-slate-100 md:block dark:hover:bg-slate-800"
            >
              {t('nav.logout')}
            </button>
          ) : (
            <Link to="/login" className="hidden text-sm text-slate-500 hover:text-slate-900 md:block dark:text-slate-400 dark:hover:text-white">
              {t('nav.login')}
            </Link>
          )}

          <button className="rounded-md p-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="space-y-3 border-t border-slate-200 px-4 py-4 md:hidden dark:border-slate-800">
          <NavLink to="/" end className={linkClass} onClick={() => setOpen(false)}>{t('nav.home')}</NavLink>
          <NavLink to="/projects" className={linkClass} onClick={() => setOpen(false)}>{t('nav.projects')}</NavLink>
          <NavLink to="/contact" className={linkClass} onClick={() => setOpen(false)}>{t('nav.contact')}</NavLink>
          {isAdmin ? (
            <NavLink to="/admin/projects" className={linkClass} onClick={() => setOpen(false)}>{t('nav.admin')}</NavLink>
          ) : (
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>{t('nav.login')}</NavLink>
          )}
        </div>
      )}
    </header>
  );
}