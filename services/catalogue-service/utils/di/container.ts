import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { MongoConnection } from '../../infra/db/mongo';
import {
  EventPublisher,
  KafkaEventPublisher,
  RabbitMQEventPublisher,
} from '@microservices-ecommerce/event-bus';
import { MediaStorage } from '../../infra/storage/media-storage';
import { S3MediaStorage } from '../../infra/storage/s3-media-storage';
import {
  ProductRepository,
  MongoProductRepository,
} from '../../features/product/product.repository';
import { ProductService } from '../../features/product/product.service';
import { ProductController } from '../../features/product/product.controller';
import {
  CategoryRepository,
  MongoCategoryRepository,
} from '../../features/category/category.repository';
import { CategoryService } from '../../features/category/category.service';
import { CategoryController } from '../../features/category/category.controller';

const container = new Container();

// EVENT_BUS picks the EventPublisher binding: 'kafka' (default) or
// 'rabbitmq'. Both implement the same publish(topic, message) contract,
// so this is the only line that needs to change to switch message
// brokers — everything upstream (services, event schemas) is unaffected.
const EVENT_BUS = process.env.EVENT_BUS ?? 'kafka';
const eventPublisherImpl = EVENT_BUS === 'rabbitmq' ? RabbitMQEventPublisher : KafkaEventPublisher;

container.bind<MongoConnection>(TYPES.MongoConnection).to(MongoConnection).inSingletonScope();
container.bind<EventPublisher>(TYPES.EventPublisher).to(eventPublisherImpl).inSingletonScope();
container.bind<MediaStorage>(TYPES.MediaStorage).to(S3MediaStorage).inSingletonScope();

container
  .bind<ProductRepository>(TYPES.ProductRepository)
  .to(MongoProductRepository)
  .inSingletonScope();
container.bind<ProductService>(TYPES.ProductService).to(ProductService).inSingletonScope();
container.bind<ProductController>(TYPES.ProductController).to(ProductController).inSingletonScope();

container
  .bind<CategoryRepository>(TYPES.CategoryRepository)
  .to(MongoCategoryRepository)
  .inSingletonScope();
container.bind<CategoryService>(TYPES.CategoryService).to(CategoryService).inSingletonScope();
container
  .bind<CategoryController>(TYPES.CategoryController)
  .to(CategoryController)
  .inSingletonScope();

export { container };
