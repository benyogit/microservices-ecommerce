import { Router } from 'express';
import { asyncHandler } from '../infra/http/asyncHandler';
import {
  createCategoryHandler,
  deleteCategoryHandler,
  getCategoryHandler,
  listCategoriesHandler,
} from './category.controller';

export const categoryRouter = Router();

categoryRouter.get('/', asyncHandler(listCategoriesHandler));
categoryRouter.get('/:id', asyncHandler(getCategoryHandler));
categoryRouter.post('/', asyncHandler(createCategoryHandler));
categoryRouter.delete('/:id', asyncHandler(deleteCategoryHandler));
