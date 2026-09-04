import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../utils/di/types';
import { ProductService } from './product.service';

@injectable()
export class ProductController {
  constructor(@inject(TYPES.ProductService) private readonly service: ProductService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const products = await this.service.listProducts();
    res.json(products);
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const product = await this.service.getProduct(req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.createProduct(req.body);
    res.status(201).json(result);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.removeProduct(req.params.id);
    res.status(204).send();
  };
}
