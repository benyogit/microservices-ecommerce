import { Collection } from 'mongodb';
import { connectMongo } from '../db/mongo';
import { Category } from './category';

const COLLECTION_NAME = 'categories';

async function getCollection(): Promise<Collection<Category>> {
  const db = await connectMongo();
  return db.collection<Category>(COLLECTION_NAME);
}

export async function findCategoryById(id: string): Promise<Category | null> {
  const collection = await getCollection();
  return collection.findOne({ id });
}

export async function findAllCategories(): Promise<Category[]> {
  const collection = await getCollection();
  return collection.find().toArray();
}

export async function insertCategory(category: Category): Promise<void> {
  const collection = await getCollection();
  await collection.insertOne(category);
}

export async function deleteCategory(id: string): Promise<void> {
  const collection = await getCollection();
  await collection.deleteOne({ id });
}
