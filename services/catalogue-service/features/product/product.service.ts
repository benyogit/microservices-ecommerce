import { injectable, inject } from 'inversify';
import { randomUUID } from 'crypto';
import { TYPES } from '../../utils/di/types';
import { EventPublisher } from '../../infra/events/event-publisher';
import { MediaStorage } from '../../infra/storage/media-storage';
import { Product, ProductImage, ProductResponse } from './product';
import { ProductRepository } from './product.repository';

const PRODUCT_TOPIC = process.env.PRODUCT_TOPIC ?? 'catalogue.product';

export interface CreateProductResult {
  product: ProductResponse;
  imageUploadUrl: string;
}

export interface AddProductImageResult {
  image: ProductImage;
  uploadUrl: string;
}

@injectable()
export class ProductService {
  constructor(
    @inject(TYPES.ProductRepository) private readonly repository: ProductRepository,
    @inject(TYPES.EventPublisher) private readonly eventPublisher: EventPublisher,
    @inject(TYPES.MediaStorage) private readonly mediaStorage: MediaStorage,
  ) {}

  private toResponse(product: Product): ProductResponse {
    return {
      ...product,
      images: product.images.map((key) => ({ key, url: this.mediaStorage.getPublicUrl(key) })),
    };
  }

  async getProduct(id: string): Promise<ProductResponse | null> {
    const product = await this.repository.findById(id);
    return product ? this.toResponse(product) : null;
  }

  async listProducts(): Promise<ProductResponse[]> {
    const products = await this.repository.findAll();
    return products.map((product) => this.toResponse(product));
  }

  async createProduct(input: Omit<Product, 'id' | 'images'>): Promise<CreateProductResult> {
    const id = randomUUID();
    const key = `products/${id}/images/${randomUUID()}`;
    const product: Product = { id, images: [key], ...input };

    await this.repository.insert(product);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.created', product });
    const { uploadUrl } = await this.mediaStorage.getUploadUrl(key);

    return { product: this.toResponse(product), imageUploadUrl: uploadUrl };
  }

  async addProductImage(id: string, contentType?: string): Promise<AddProductImageResult | null> {
    const product = await this.repository.findById(id);
    if (!product) return null;

    const key = `products/${id}/images/${randomUUID()}`;
    const { uploadUrl } = await this.mediaStorage.getUploadUrl(key, contentType);

    await this.repository.addImage(id, key);
    await this.eventPublisher.publish(PRODUCT_TOPIC, {
      type: 'product.image_added',
      productId: id,
      key,
    });

    return { image: { key, url: this.mediaStorage.getPublicUrl(key) }, uploadUrl };
  }

  async removeProduct(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.eventPublisher.publish(PRODUCT_TOPIC, { type: 'product.deleted', productId: id });
  }
}
