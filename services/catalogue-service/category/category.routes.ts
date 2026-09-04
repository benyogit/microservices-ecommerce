import { Router } from 'express';
import { asyncHandler } from '../infra/http/asyncHandler';
import { container } from '../utils/di/container';
import { TYPES } from '../utils/di/types';
import { CategoryController } from './category.controller';

export const categoryRouter = Router();

const controller = container.get<CategoryController>(TYPES.CategoryController);

categoryRouter.get('/', asyncHandler(controller.list));
categoryRouter.get('/:id', asyncHandler(controller.get));
categoryRouter.post('/', asyncHandler(controller.create));
categoryRouter.delete('/:id', asyncHandler(controller.remove));
