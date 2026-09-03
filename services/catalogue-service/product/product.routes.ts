import { Router } from 'express';
import { asyncHandler } from '../infra/http/asyncHandler';
import { container } from '../infra/di/container';
import { TYPES } from '../infra/di/types';
import { ProductController } from './product.controller';

export const productRouter = Router();

const controller = container.get<ProductController>(TYPES.ProductController);

productRouter.get('/', asyncHandler(controller.list));
productRouter.get('/:id', asyncHandler(controller.get));
productRouter.post('/', asyncHandler(controller.create));
productRouter.delete('/:id', asyncHandler(controller.remove));
