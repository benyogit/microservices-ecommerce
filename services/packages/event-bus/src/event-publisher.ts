export interface EventPublisher {
  publish(topic: string, message: Record<string, unknown>): Promise<void>;
}
