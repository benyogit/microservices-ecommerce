import { injectable, inject } from 'inversify';
import { Collection } from 'mongodb';
import { TYPES } from '../infra/di/types';
import { MongoConnection } from '../infra/db/mongo';
import { Category } from './category';

const COLLECTION_NAME = 'categories';

export interface CategoryRepository {
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  insert(category: Category): Promise<void>;
  delete(id: string): Promise<void>;
}

@injectable()
export class MongoCategoryRepository implements CategoryRepository {
  constructor(@inject(TYPES.MongoConnection) private readonly mongo: MongoConnection) {}

  private async getCollection(): Promise<Collection<Category>> {
    const db = await this.mongo.connect();
    return db.collection<Category>(COLLECTION_NAME);
  }

  async findById(id: string): Promise<Category | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  async findAll(): Promise<Category[]> {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  async insert(category: Category): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(category);
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
  }
}
