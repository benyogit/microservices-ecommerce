import { injectable, inject } from 'inversify';
import { TYPES } from '../../utils/di/types';
import { EventPublisher } from '../../infra/events/event-publisher';
import { CatalogueClient } from '../../infra/catalogue/catalogue-client';
import { AddCartItemInput } from './cart.schema';
import { Cart } from './cart';
import { CartRepository } from './cart.repository';
import {
  cartClearedEventSchema,
  cartItemAddedEventSchema,
  cartItemQuantityUpdatedEventSchema,
  cartItemRemovedEventSchema,
} from './cart.events';

const CART_TOPIC = process.env.CART_TOPIC ?? 'cart.events';

function emptyCart(userId: string): Cart {
  return { userId, items: [], updatedAt: new Date().toISOString() };
}

@injectable()
export class CartService {
  constructor(
    @inject(TYPES.CartRepository) private readonly repository: CartRepository,
    @inject(TYPES.CatalogueClient) private readonly catalogue: CatalogueClient,
    @inject(TYPES.EventPublisher) private readonly eventPublisher: EventPublisher,
  ) {}

  async getCart(userId: string): Promise<Cart> {
    const cart = await this.repository.getCart(userId);
    return cart ?? emptyCart(userId);
  }

  async addItem(userId: string, input: AddCartItemInput): Promise<Cart | null> {
    const product = await this.catalogue.getProduct(input.productId);
    if (!product) return null;

    const cart = await this.getCart(userId);
    const existing = cart.items.find((item) => item.productId === product.id);
    if (existing) {
      existing.quantity += input.quantity;
      existing.unitPrice = product.price;
      existing.name = product.name;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        unitPrice: product.price,
        quantity: input.quantity,
        addedAt: new Date().toISOString(),
      });
    }
    cart.updatedAt = new Date().toISOString();

    await this.repository.saveCart(cart);
    await this.eventPublisher.publish(
      CART_TOPIC,
      cartItemAddedEventSchema.parse({
        type: 'cart.item_added',
        userId,
        productId: product.id,
        quantity: input.quantity,
      }),
    );

    return cart;
  }

  async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<Cart | null> {
    const cart = await this.getCart(userId);
    const item = cart.items.find((i) => i.productId === productId);
    if (!item) return null;

    item.quantity = quantity;
    cart.updatedAt = new Date().toISOString();

    await this.repository.saveCart(cart);
    await this.eventPublisher.publish(
      CART_TOPIC,
      cartItemQuantityUpdatedEventSchema.parse({
        type: 'cart.item_quantity_updated',
        userId,
        productId,
        quantity,
      }),
    );

    return cart;
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((i) => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();

    await this.repository.saveCart(cart);
    await this.eventPublisher.publish(
      CART_TOPIC,
      cartItemRemovedEventSchema.parse({ type: 'cart.item_removed', userId, productId }),
    );

    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    await this.repository.deleteCart(userId);
    await this.eventPublisher.publish(
      CART_TOPIC,
      cartClearedEventSchema.parse({ type: 'cart.cleared', userId }),
    );
  }
}
