import { injectable, inject } from 'inversify';
import { TYPES } from '../../utils/di/types';
import { RedisConnection } from '../../infra/db/redis';
import { Cart } from './cart';

// 30 days: long enough that an abandoned cart survives a normal browsing
// gap, short enough that Redis doesn't accumulate carts forever.
const CART_TTL_SECONDS = Number(process.env.CART_TTL_SECONDS ?? 60 * 60 * 24 * 30);

export interface CartRepository {
  getCart(userId: string): Promise<Cart | null>;
  saveCart(cart: Cart): Promise<void>;
  deleteCart(userId: string): Promise<void>;
}

@injectable()
export class RedisCartRepository implements CartRepository {
  constructor(@inject(TYPES.RedisConnection) private readonly redis: RedisConnection) {}

  private key(userId: string): string {
    return `cart:${userId}`;
  }

  async getCart(userId: string): Promise<Cart | null> {
    const client = await this.redis.connect();
    const raw = await client.get(this.key(userId));
    return raw ? (JSON.parse(raw) as Cart) : null;
  }

  async saveCart(cart: Cart): Promise<void> {
    const client = await this.redis.connect();
    await client.set(this.key(cart.userId), JSON.stringify(cart), { EX: CART_TTL_SECONDS });
  }

  async deleteCart(userId: string): Promise<void> {
    const client = await this.redis.connect();
    await client.del(this.key(userId));
  }
}
