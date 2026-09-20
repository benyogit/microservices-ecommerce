import { readFileSync } from 'fs';
import { join } from 'path';
import express, { Express, NextFunction, Request, Response } from 'express';
import { cartRouter } from './features/cart/cart.routes';

export function createApp(): Express {
  const app = express();

  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  app.use('/cart', cartRouter);

  app.get('/openapi.yaml', (_req: Request, res: Response) => {
    const spec = readFileSync(join(__dirname, 'openapi.yaml'), 'utf-8');
    res.type('application/yaml').send(spec);
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
