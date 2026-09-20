import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { RedisConnection } from '../../infra/db/redis';
import { EventPublisher } from '../../infra/events/event-publisher';
import { KafkaEventPublisher } from '../../infra/kafka/producer';
import { CatalogueClient } from '../../infra/catalogue/catalogue-client';
import { HttpCatalogueClient } from '../../infra/catalogue/http-catalogue-client';
import { CartRepository, RedisCartRepository } from '../../features/cart/cart.repository';
import { CartService } from '../../features/cart/cart.service';
import { CartController } from '../../features/cart/cart.controller';

const container = new Container();

container.bind<RedisConnection>(TYPES.RedisConnection).to(RedisConnection).inSingletonScope();
container.bind<EventPublisher>(TYPES.EventPublisher).to(KafkaEventPublisher).inSingletonScope();
container
  .bind<CatalogueClient>(TYPES.CatalogueClient)
  .to(HttpCatalogueClient)
  .inSingletonScope();

container.bind<CartRepository>(TYPES.CartRepository).to(RedisCartRepository).inSingletonScope();
container.bind<CartService>(TYPES.CartService).to(CartService).inSingletonScope();
container.bind<CartController>(TYPES.CartController).to(CartController).inSingletonScope();

export { container };
