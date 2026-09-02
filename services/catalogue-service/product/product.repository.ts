import { Collection } from 'mongodb';
import { connectMongo } from '../infra/db/mongo';
import { Product } from './product';

const COLLECTION_NAME = 'products';

async function getCollection(): Promise<Collection<Product>> {
  const db = await connectMongo();
  return db.collection<Product>(COLLECTION_NAME);
}

export async function findProductById(id: string): Promise<Product | null> {
  const collection = await getCollection();
  return collection.findOne({ id });
}

export async function findAllProducts(): Promise<Product[]> {
  const collection = await getCollection();
  return collection.find().toArray();
}

export async function insertProduct(product: Product): Promise<void> {
  const collection = await getCollection();
  await collection.insertOne(product);
}

export async function deleteProduct(id: string): Promise<void> {
  const collection = await getCollection();
  await collection.deleteOne({ id });
}
