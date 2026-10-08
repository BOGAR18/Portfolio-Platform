import { app } from './app';
import { env } from './lib/env';

app.listen(env.PORT, () => {
  console.log(`API berjalan di http://localhost:${env.PORT}`);
});