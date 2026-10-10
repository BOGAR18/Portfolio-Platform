import { buildTranslations } from '../server/services/translate';

buildTranslations({
  title: 'Sistem Inventori Gudang',
  summary: 'Aplikasi untuk memantau stok gudang secara real-time.',
}).then((r) => console.log(JSON.stringify(r, null, 2)));