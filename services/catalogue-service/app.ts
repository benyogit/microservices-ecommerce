import express, { Express, NextFunction, Request, Response } from 'express';
import { categoryRouter } from './category/category.routes';
import { productRouter } from './product/product.routes';

export function createApp(): Express {
  const app = express();

  app.use(express.json());
  app.use('/products', productRouter);
  app.use('/categories', categoryRouter);

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
