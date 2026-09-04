import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
