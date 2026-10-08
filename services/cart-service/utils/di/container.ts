import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { RedisConnection } from '../../infra/db/redis';
import {
  EventPublisher,
  KafkaEventPublisher,
  RabbitMQEventPublisher,
} from '@microservices-ecommerce/event-bus';
import { CatalogueClient } from '../../infra/catalogue/catalogue-client';
import { HttpCatalogueClient } from '../../infra/catalogue/http-catalogue-client';
import { CartRepository, RedisCartRepository } from '../../features/cart/cart.repository';
import { CartService } from '../../features/cart/cart.service';
import { CartController } from '../../features/cart/cart.controller';

const container = new Container();

// EVENT_BUS picks the EventPublisher binding: 'kafka' (default) or
// 'rabbitmq'. Both implement the same publish(topic, message) contract,
// so this is the only line that needs to change to switch message
// brokers — everything upstream (CartService, cart.events.ts) is
// unaffected.
const EVENT_BUS = process.env.EVENT_BUS ?? 'kafka';
const eventPublisherImpl = EVENT_BUS === 'rabbitmq' ? RabbitMQEventPublisher : KafkaEventPublisher;

container.bind<RedisConnection>(TYPES.RedisConnection).to(RedisConnection).inSingletonScope();
container.bind<EventPublisher>(TYPES.EventPublisher).to(eventPublisherImpl).inSingletonScope();
container
  .bind<CatalogueClient>(TYPES.CatalogueClient)
  .to(HttpCatalogueClient)
  .inSingletonScope();

container.bind<CartRepository>(TYPES.CartRepository).to(RedisCartRepository).inSingletonScope();
container.bind<CartService>(TYPES.CartService).to(CartService).inSingletonScope();
container.bind<CartController>(TYPES.CartController).to(CartController).inSingletonScope();

export { container };
