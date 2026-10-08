export type AnalyticsType = 'pageview' | 'cv_download' | 'contact_click' | 'project_view';

// Menghormati Do Not Track: jika aktif, tidak ada data yang dikirim
export function track(type: AnalyticsType, path: string = window.location.pathname) {
  if (navigator.doNotTrack === '1') return;

  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, path }),
    keepalive: true,
  }).catch(() => {
    // Analytics bersifat opsional, kegagalan tidak perlu mengganggu pengguna
  });
}