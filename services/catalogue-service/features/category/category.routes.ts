import { Router } from 'express';
import { asyncHandler } from '../../utils/http/asyncHandler';
import { validateBody } from '../../utils/http/validate';
import { container } from '../../utils/di/container';
import { TYPES } from '../../utils/di/types';
import { CategoryController } from './category.controller';
import { createCategorySchema } from './category.schema';

export const categoryRouter = Router();

const controller = container.get<CategoryController>(TYPES.CategoryController);

categoryRouter.get('/', asyncHandler(controller.list));
categoryRouter.get('/:id', asyncHandler(controller.get));
categoryRouter.post('/', validateBody(createCategorySchema), asyncHandler(controller.create));
categoryRouter.delete('/:id', asyncHandler(controller.remove));
