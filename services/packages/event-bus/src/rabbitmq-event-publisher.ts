import { injectable } from 'inversify';
import amqp, { Channel, ChannelModel } from 'amqplib';
import { EventPublisher } from './event-publisher';

const RABBITMQ_URL = process.env.RABBITMQ_URL ?? 'amqp://localhost:5672';
const RABBITMQ_EXCHANGE = process.env.RABBITMQ_EXCHANGE ?? 'domain-events';
const RABBITMQ_CONNECT_TIMEOUT_MS = Number(process.env.RABBITMQ_CONNECT_TIMEOUT_MS ?? 5000);

// Maps the same publish(topic, message) shape used for Kafka onto
// RabbitMQ's model: `topic` becomes the routing key on one durable topic
// exchange, so a consumer binds a queue to "catalogue.product" (or
// "catalogue.*") the same way it would subscribe to that Kafka topic.
@injectable()
export class RabbitMQEventPublisher implements EventPublisher {
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;
  private connecting: Promise<Channel> | null = null;

  private async getChannel(): Promise<Channel> {
    if (this.channel) return this.channel;
    if (!this.connecting) {
      this.connecting = this.connect().catch((err) => {
        this.connecting = null;
        throw err;
      });
    }
    return this.connecting;
  }

  private async connect(): Promise<Channel> {
    const connection = await amqp.connect(RABBITMQ_URL, {
      timeout: RABBITMQ_CONNECT_TIMEOUT_MS,
    });
    const channel = await connection.createChannel();
    await channel.assertExchange(RABBITMQ_EXCHANGE, 'topic', { durable: true });

    this.connection = connection;
    this.channel = channel;
    return channel;
  }

  async publish(topic: string, message: Record<string, unknown>): Promise<void> {
    const channel = await this.getChannel();
    channel.publish(RABBITMQ_EXCHANGE, topic, Buffer.from(JSON.stringify(message)), {
      contentType: 'application/json',
      persistent: true,
    });
  }

  async disconnect(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
    this.channel = null;
    this.connection = null;
    this.connecting = null;
  }
}
