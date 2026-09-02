import { Router } from 'express';
import { asyncHandler } from '../infra/http/asyncHandler';
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
} from './product.controller';

export const productRouter = Router();

productRouter.get('/', asyncHandler(listProductsHandler));
productRouter.get('/:id', asyncHandler(getProductHandler));
productRouter.post('/', asyncHandler(createProductHandler));
productRouter.delete('/:id', asyncHandler(deleteProductHandler));
