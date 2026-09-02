import { Request, Response } from 'express';
import { createCategory, getCategory, listCategories, removeCategory } from './category.service';

export async function listCategoriesHandler(_req: Request, res: Response): Promise<void> {
  const categories = await listCategories();
  res.json(categories);
}

export async function getCategoryHandler(req: Request, res: Response): Promise<void> {
  const category = await getCategory(req.params.id);
  if (!category) {
    res.status(404).json({ error: 'Category not found' });
    return;
  }
  res.json(category);
}

export async function createCategoryHandler(req: Request, res: Response): Promise<void> {
  const category = await createCategory(req.body);
  res.status(201).json(category);
}

export async function deleteCategoryHandler(req: Request, res: Response): Promise<void> {
  await removeCategory(req.params.id);
  res.status(204).send();
}
