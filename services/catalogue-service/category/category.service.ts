import { injectable, inject } from 'inversify';
import { randomUUID } from 'crypto';
import { TYPES } from '../infra/di/types';
import { EventPublisher } from '../infra/events/event-publisher';
import { Category } from './category';
import { CategoryRepository } from './category.repository';

const CATEGORY_TOPIC = process.env.CATEGORY_TOPIC ?? 'catalogue.category';

@injectable()
export class CategoryService {
  constructor(
    @inject(TYPES.CategoryRepository) private readonly repository: CategoryRepository,
    @inject(TYPES.EventPublisher) private readonly eventPublisher: EventPublisher,
  ) {}

  async getCategory(id: string): Promise<Category | null> {
    return this.repository.findById(id);
  }

  async listCategories(): Promise<Category[]> {
    return this.repository.findAll();
  }

  async createCategory(input: Omit<Category, 'id'>): Promise<Category> {
    const category: Category = { id: randomUUID(), ...input };
    await this.repository.insert(category);
    await this.eventPublisher.publish(CATEGORY_TOPIC, { type: 'category.created', category });
    return category;
  }

  async removeCategory(id: string): Promise<void> {
    await this.repository.delete(id);
    await this.eventPublisher.publish(CATEGORY_TOPIC, { type: 'category.deleted', categoryId: id });
  }
}
