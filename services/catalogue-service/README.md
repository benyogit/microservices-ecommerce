# Catalogue Service

Manages the product catalogue, including products and categories.

## Structure

- `product/` — product domain logic
- `category/` — category domain logic
- `index.ts` — single shared entry point re-exporting `product` and `category`,
  so each subfolder doesn't need its own duplicate `index.ts`
