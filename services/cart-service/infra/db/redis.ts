import { injectable } from 'inversify';
import { createClient, RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
const REDIS_CONNECT_TIMEOUT_MS = Number(process.env.REDIS_CONNECT_TIMEOUT_MS ?? 5000);
const REDIS_MAX_CONNECT_RETRIES = Number(process.env.REDIS_MAX_CONNECT_RETRIES ?? 3);

@injectable()
export class RedisConnection {
  private client: RedisClientType | null = null;
  private connecting: Promise<RedisClientType> | null = null;

  async connect(): Promise<RedisClientType> {
    if (this.client) return this.client;
    if (!this.connecting) {
      this.connecting = this.createClient().catch((err) => {
        this.connecting = null;
        throw err;
      });
    }
    return this.connecting;
  }

  private async createClient(): Promise<RedisClientType> {
    const client: RedisClientType = createClient({
      url: REDIS_URL,
      socket: {
        connectTimeout: REDIS_CONNECT_TIMEOUT_MS,
        // Without a bound here, a client that can't reach Redis at all
        // retries forever and `connect()` never settles — callers would
        // hang instead of getting a fast, visible failure.
        reconnectStrategy: (retries) =>
          retries > REDIS_MAX_CONNECT_RETRIES
            ? new Error('Redis unreachable after max retries')
            : Math.min(retries * 100, 1000),
      },
    });
    client.on('error', (err) => console.error('Redis client error', err));

    await client.connect();
    this.client = client;
    return client;
  }

  async disconnect(): Promise<void> {
    await this.client?.quit();
    this.client = null;
    this.connecting = null;
  }
}
