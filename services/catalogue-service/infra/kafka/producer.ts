import { Kafka, Producer } from 'kafkajs';

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(',');
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID ?? 'catalogue-service';

const kafka = new Kafka({ clientId: KAFKA_CLIENT_ID, brokers: KAFKA_BROKERS });

let producer: Producer | null = null;

async function getProducer(): Promise<Producer> {
  if (producer) return producer;
  producer = kafka.producer();
  await producer.connect();
  return producer;
}

export async function publishEvent(topic: string, message: Record<string, unknown>): Promise<void> {
  const activeProducer = await getProducer();
  await activeProducer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

export async function disconnectProducer(): Promise<void> {
  await producer?.disconnect();
  producer = null;
}
