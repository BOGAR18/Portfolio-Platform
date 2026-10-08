import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useMe } from '@/features/auth/hooks';
import { LoadingState } from './PageState';

// Protected route: hanya admin yang boleh masuk
export default function RequireAdmin({ children }: { children: ReactNode }) {
  const me = useMe();

  if (me.isLoading) return <LoadingState />;
  if (me.isError || me.data?.user.role !== 'ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
}