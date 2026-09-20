import { z } from 'zod';

const categoryEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
});

export const categoryCreatedEventSchema = z.object({
  type: z.literal('category.created'),
  category: categoryEventSchema,
});

export const categoryDeletedEventSchema = z.object({
  type: z.literal('category.deleted'),
  categoryId: z.string(),
});

export type CategoryCreatedEvent = z.infer<typeof categoryCreatedEventSchema>;
export type CategoryDeletedEvent = z.infer<typeof categoryDeletedEventSchema>;
