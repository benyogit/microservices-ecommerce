import { injectable, inject } from 'inversify';
import { randomUUID } from 'crypto';
import { TYPES } from '../utils/di/types';
import { EventPublisher } from '../infra/events/event-publisher';
import { MediaStorage } from '../infra/storage/media-storage';
import { Product } from './product';
import { ProductRepository } from './product.repository';

const PRODUCT_TOPIC = process.env.PRODUCT_TOPIC ?? 'catalogue.product';

export interface CreateProductResult {
  product: Product;
  imageUploadUrl: string;
}

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductRepository) private readonly repository: ProductRepository,
    @inject(TYPES.EventPublisher) private readonly eventPublisher: EventPublisher,
    @inject(TYPES.MediaStorage) private readonly mediaStorage: MediaStorage,
  ) {}

  async getProduct(id: string): Promise<Product | null> {
    return this.repository.findById(id);
  }

  async listProducts(): Promise<Product[]> {
    return this.repository.findAll();
  }

  async createProduct(input: Omit<Product, 'id' | 'imageKey'>): Promise<CreateProductResult> {
    const id = randomUUID();
    const imageKey = `products/${id}/image`;
    const product: Product = { id, imageKey, ...input };

    await this.repository.insert(product);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.created', product });
    const { uploadUrl } = await this.mediaStorage.getUploadUrl(imageKey);

    return { product, imageUploadUrl: uploadUrl };
  }

  async removeProduct(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.deleted', productId: id });
  }
}
