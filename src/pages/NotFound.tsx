import { Link } from 'react-router';
import { useT } from '@/i18n';

export default function NotFound() {
  const t = useT();
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-7xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-semibold">{t('common.notFound')}</h1>
      <Link to="/" className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-500">
        {t('common.backHome')}
      </Link>
    </div>
  );
}