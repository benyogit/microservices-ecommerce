import { injectable, inject } from 'inversify';
import { Collection } from 'mongodb';
import { TYPES } from '../../utils/di/types';
import { MongoConnection } from '../../infra/db/mongo';
import { Product } from './product';

const COLLECTION_NAME = 'products';

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  insert(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  addImage(id: string, key: string): Promise<void>;
}

@injectable()
export class MongoProductRepository implements ProductRepository {
  constructor(@inject(TYPES.MongoConnection) private readonly mongo: MongoConnection) {}

  private async getCollection(): Promise<Collection<Product>> {
    const db = await this.mongo.connect();
    return db.collection<Product>(COLLECTION_NAME);
  }

  async findById(id: string): Promise<Product | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  async findAll(): Promise<Product[]> {
    const collection = await this.getCollection();
    return collection.find().toArray();
  }

  async insert(product: Product): Promise<void> {
    const collection = await this.getCollection();
    await collection.insertOne(product);
  }

  async delete(id: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.deleteOne({ id });
  }

  async addImage(id: string, key: string): Promise<void> {
    const collection = await this.getCollection();
    await collection.updateOne({ id }, { $push: { images: key } });
  }
}
