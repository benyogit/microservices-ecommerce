import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { MongoConnection } from '../../infra/db/mongo';
import { EventPublisher } from '../../infra/events/event-publisher';
import { KafkaEventPublisher } from '../../infra/kafka/producer';
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

container.bind<MongoConnection>(TYPES.MongoConnection).to(MongoConnection).inSingletonScope();
container.bind<EventPublisher>(TYPES.EventPublisher).to(KafkaEventPublisher).inSingletonScope();
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
