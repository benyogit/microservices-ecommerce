import { z } from 'zod';

// Mirrors Product (product.ts) exactly — kept separate on purpose: the
// event contract and the DB shape can drift over time (e.g. a field
// renamed internally shouldn't silently change what's on the wire for
// every consumer), and this schema is what actually gets validated
// before publish, not the DB type.
const productEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  categoryIds: z.array(z.string()),
  images: z.array(z.string()),
});

export const productCreatedEventSchema = z.object({
  type: z.literal('product.created'),
  product: productEventSchema,
});

export const productDeletedEventSchema = z.object({
  type: z.literal('product.deleted'),
  productId: z.string(),
});

export const productImageAddedEventSchema = z.object({
  type: z.literal('product.image_added'),
  productId: z.string(),
  key: z.string(),
});

export type ProductCreatedEvent = z.infer<typeof productCreatedEventSchema>;
export type ProductDeletedEvent = z.infer<typeof productDeletedEventSchema>;
export type ProductImageAddedEvent = z.infer<typeof productImageAddedEventSchema>;
