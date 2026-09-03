import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../infra/di/types';
import { CategoryService } from './category.service';

@injectable()
export class CategoryController {
  constructor(@inject(TYPES.CategoryService) private readonly service: CategoryService) {}

  list = async (_req: Request, res: Response): Promise<void> => {
    const categories = await this.service.listCategories();
    res.json(categories);
  };

  get = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.getCategory(req.params.id);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }
    res.json(category);
  };

  create = async (req: Request, res: Response): Promise<void> => {
    const category = await this.service.createCategory(req.body);
    res.status(201).json(category);
  };

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.removeCategory(req.params.id);
    res.status(204).send();
  };
}
