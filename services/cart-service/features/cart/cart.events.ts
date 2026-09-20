import { z } from 'zod';

export const cartItemAddedEventSchema = z.object({
  type: z.literal('cart.item_added'),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const cartItemQuantityUpdatedEventSchema = z.object({
  type: z.literal('cart.item_quantity_updated'),
  userId: z.string(),
  productId: z.string(),
  quantity: z.number().int().positive(),
});

export const cartItemRemovedEventSchema = z.object({
  type: z.literal('cart.item_removed'),
  userId: z.string(),
  productId: z.string(),
});

export const cartClearedEventSchema = z.object({
  type: z.literal('cart.cleared'),
  userId: z.string(),
});

export type CartItemAddedEvent = z.infer<typeof cartItemAddedEventSchema>;
export type CartItemQuantityUpdatedEvent = z.infer<typeof cartItemQuantityUpdatedEventSchema>;
export type CartItemRemovedEvent = z.infer<typeof cartItemRemovedEventSchema>;
export type CartClearedEvent = z.infer<typeof cartClearedEventSchema>;
