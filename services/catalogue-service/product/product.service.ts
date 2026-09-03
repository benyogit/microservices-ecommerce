import { injectable, inject } from 'inversify';
import { randomUUID } from 'crypto';
import { TYPES } from '../infra/di/types';
import { EventPublisher } from '../infra/events/event-publisher';
import { Product } from './product';
import { ProductRepository } from './product.repository';

const PRODUCT_TOPIC = process.env.PRODUCT_TOPIC ?? 'catalogue.product';

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductRepository) private readonly repository: ProductRepository,
    @inject(TYPES.EventPublisher) private readonly eventPublisher: EventPublisher,
  ) {}

  async getProduct(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async listProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async createProduct(input: Omit<Product, 'id'>): Promise<Product> {
    const product: Product = { id: randomUUID(), ...input };
    await this.repository.insert(product);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.created', product });
    return product;
  }

  async removeProduct(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.deleted', productId: id });
  }
}
