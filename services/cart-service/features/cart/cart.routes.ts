import { Router } from 'express';
import { asyncHandler } from '../../utils/http/asyncHandler';
import { validateBody } from '../../utils/http/validate';
import { requireUserId } from '../../utils/http/currentUser';
import { container } from '../../utils/di/container';
import { TYPES } from '../../utils/di/types';
import { CartController } from './cart.controller';
import { addCartItemSchema, updateCartItemSchema } from './cart.schema';

export const cartRouter = Router();

const controller = container.get<CartController>(TYPES.CartController);

cartRouter.use(requireUserId);

cartRouter.get('/', asyncHandler(controller.get));
cartRouter.post('/items', validateBody(addCartItemSchema), asyncHandler(controller.addItem));
cartRouter.patch(
  '/items/:productId',
  validateBody(updateCartItemSchema),
  asyncHandler(controller.updateItem),
);
cartRouter.delete('/items/:productId', asyncHandler(controller.removeItem));
cartRouter.delete('/', asyncHandler(controller.clear));
