import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  categoryId: z.string().min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const addProductImageSchema = z.object({
  contentType: z.string().min(1).optional(),
});

export type AddProductImageInput = z.infer<typeof addProductImageSchema>;
