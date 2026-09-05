import { Router } from 'express';
import { asyncHandler } from '../../utils/http/asyncHandler';
import { validateBody } from '../../utils/http/validate';
import { container } from '../../utils/di/container';
import { TYPES } from '../../utils/di/types';
import { ProductController } from './product.controller';
import { addProductImageSchema, createProductSchema } from './product.schema';

export const productRouter = Router();

const controller = container.get<ProductController>(TYPES.ProductController);

productRouter.get('/', asyncHandler(controller.list));
productRouter.get('/:id', asyncHandler(controller.get));
productRouter.post('/', validateBody(createProductSchema), asyncHandler(controller.create));
productRouter.delete('/:id', asyncHandler(controller.remove));
productRouter.post(
  '/:id/images',
  validateBody(addProductImageSchema),
  asyncHandler(controller.addImage),
);
