import 'reflect-metadata';
import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 3001);

const app = createApp();

app.listen(PORT, () => {
  console.log(`cart-service listening on port ${PORT}`);
});
