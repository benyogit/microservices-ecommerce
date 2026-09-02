import { randomUUID } from 'crypto';
import { publishEvent } from '../infra/kafka/producer';
import { Category } from './category';
import {
  deleteCategory,
  findAllCategories,
  findCategoryById,
  insertCategory,
} from './category.repository';

const CATEGORY_TOPIC = 'catalogue.category';

export async function getCategory(id: string): Promise<Category | null> {
  return findCategoryById(id);
}

export async function listCategories(): Promise<Category[]> {
  return findAllCategories();
}

export async function createCategory(input: Omit<Category, 'id'>): Promise<Category> {
  const category: Category = { id: randomUUID(), ...input };
  await insertCategory(category);
  await publishEvent(CATEGORY_TOPIC, { type: 'category.created', category });
  return category;
}

export async function removeCategory(id: string): Promise<void> {
  await deleteCategory(id);
  await publishEvent(CATEGORY_TOPIC, { type: 'category.deleted', categoryId: id });
}
