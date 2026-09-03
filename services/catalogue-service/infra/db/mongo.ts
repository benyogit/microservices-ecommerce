import { injectable } from 'inversify';
import { Db, MongoClient } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
const MONGO_DB_NAME = process.env.MONGO_DB_NAME ?? 'catalogue';

@injectable()
export class MongoConnection {
  private client: MongoClient | null = null;
  private db: Db | null = null;

  async connect(): Promise<Db> {
    if (this.db) return this.db;
    this.client = new MongoClient(MONGO_URI);
    await this.client.connect();
    this.db = this.client.db(MONGO_DB_NAME);
    return this.db;
  }

  async disconnect(): Promise<void> {
    await this.client?.close();
    this.client = null;
    this.db = null;
  }
}
