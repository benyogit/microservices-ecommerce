import { injectable, inject } from 'inversify';
import { Collection, Filter } from 'mongodb';
import { TYPES } from '../../utils/di/types';
import { MongoConnection } from '../../infra/db/mongo';
import { Product } from './product';

const COLLECTION_NAME = 'products';

export interface ProductFilter {
  categoryId?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(filter?: ProductFilter): Promise<Product[]>;
  insert(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
  addImage(id: string, key: string): Promise<void>;
}

@injectable()
export class MongoProductRepository implements ProductRepository {
  private indexesEnsured: Promise<void> | null = null;

  constructor(@inject(TYPES.MongoConnection) private readonly mongo: MongoConnection) {}

  private async getCollection(): Promise<Collection<Product>> {
    const db = await this.mongo.connect();
    const collection = db.collection<Product>(COLLECTION_NAME);
    if (!this.indexesEnsured) {
      // Serves both `categoryIds: categoryId` (equality prefix) and
      // `$text: { $search: q }` (name/description) in one index, so
      // listProducts can filter by category and search text together.
      this.indexesEnsured = collection
        .createIndex(
          { categoryIds: 1, name: 'text', description: 'text' },
          { name: 'categoryIds_text' },
        )
        .then(() => undefined);
    }
    await this.indexesEnsured;
    return collection;
  }

  async findById(id: string): Promise<Product | null> {
    const collection = await this.getCollection();
    return collection.findOne({ id });
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    const collection = await this.getCollection();
    const query: Filter<Product> = {};

    if (filter?.categoryId) {
      query.categoryIds = filter.categoryId;
    }
    if (filter?.q) {
      query.$text = { $search: filter.q };
    }
    if (filter?.minPrice !== undefined || filter?.maxPrice !== undefined) {
      query.price = {};
      if (filter.minPrice !== undefined) query.price.$gte = filter.minPrice;
      if (filter.maxPrice !== undefined) query.price.$lte = filter.maxPrice;
    }

    return collection.find(query).toArray();
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
