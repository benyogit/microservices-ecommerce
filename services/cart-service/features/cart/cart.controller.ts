import { injectable, inject } from 'inversify';
import { Request, Response } from 'express';
import { TYPES } from '../../utils/di/types';
import { CartService } from './cart.service';
import { AddCartItemInput, UpdateCartItemInput } from './cart.schema';

@injectable()
export class CartController {
  constructor(@inject(TYPES.CartService) private readonly service: CartService) {}

  get = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.service.getCart(req.userId!);
    res.json(cart);
  };

  addItem = async (req: Request, res: Response): Promise<void> => {
    const input = req.body as AddCartItemInput;
    const cart = await this.service.addItem(req.userId!, input);
    if (!cart) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.status(201).json(cart);
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const { quantity } = req.body as UpdateCartItemInput;
    const cart = await this.service.updateItemQuantity(req.userId!, req.params.productId, quantity);
    if (!cart) {
      res.status(404).json({ error: 'Item not in cart' });
      return;
    }
    res.json(cart);
  };

  removeItem = async (req: Request, res: Response): Promise<void> => {
    const cart = await this.service.removeItem(req.userId!, req.params.productId);
    res.json(cart);
  };

  clear = async (req: Request, res: Response): Promise<void> => {
    await this.service.clearCart(req.userId!);
    res.status(204).send();
  };
}
