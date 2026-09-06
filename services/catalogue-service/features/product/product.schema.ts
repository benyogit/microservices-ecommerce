import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  price: z.number().positive(),
  categoryIds: z.array(z.string().min(1)).min(1),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const addProductImageSchema = z.object({
  contentType: z.string().min(1).optional(),
});

export type AddProductImageInput = z.infer<typeof addProductImageSchema>;

export const listProductsQuerySchema = z
  .object({
    categoryId: z.string().min(1).optional(),
    q: z.string().min(1).optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().positive().optional(),
  })
  .refine((query) => query.minPrice === undefined || query.maxPrice === undefined || query.minPrice <= query.maxPrice, {
    message: 'minPrice must be less than or equal to maxPrice',
    path: ['minPrice'],
  });

export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
