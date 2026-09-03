import { injectable } from 'inversify';
import { Kafka, Producer } from 'kafkajs';
import { EventPublisher } from '../events/event-publisher';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'catalogue-service';

@injectable()
export class KafkaEventPublisher implements EventPublisher {
  private readonly kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: KAFKA_BROKERS });
  private producer: Producer | null = null;

  private async getProducer(): Promise<Producer> {
    if (this.producer) return this.producer;
    this.producer = this.kafka.producer();
    await this.producer.connect();
    return this.producer;
  }

  async publish(topic: string, message: Record<string, unknown>): Promise<void> {
    const producer = await this.getProducer();
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async disconnect(): Promise<void> {
    await this.producer?.disconnect();
    this.producer = null;
  }
}
