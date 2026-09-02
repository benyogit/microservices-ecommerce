import { randomUUID } from 'crypto';
import { publishEvent } from '../infra/kafka/producer';
import { Product } from './product';
import {
  deleteProduct,
  findAllProducts,
  findProductById,
  insertProduct,
} from './product.repository';

const PRODUCT_TOPIC = 'catalogue.product';

export async function getProduct(id: string): Promise<Product | null> {
  return findProductById(id);
}

export async function listProducts(): Promise<Product[]> {
  return findAllProducts();
}

export async function createProduct(input: Omit<Product, 'id'>): Promise<Product> {
  const product: Product = { id: randomUUID(), ...input };
  await insertProduct(product);
  await publishEvent(PRODUCT_TOPIC, { type: 'product.created', product });
  return product;
}

export async function removeProduct(id: string): Promise<void> {
  await deleteProduct(id);
  await publishEvent(PRODUCT_TOPIC, { type: 'product.deleted', productId: id });
}
