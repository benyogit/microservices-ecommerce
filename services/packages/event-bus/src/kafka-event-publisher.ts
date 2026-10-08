import { injectable } from 'inversify';
import { Kafka, Producer } from 'kafkajs';
import { EventPublisher } from './event-publisher';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
// Each service sets its own KAFKA_CLIENT_ID (see its docker-compose.yml
// entry / README) — this fallback is shared, generic code with no
// identity of its own, so it can't default to one service's name.
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'event-bus-client';

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
