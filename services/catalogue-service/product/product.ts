// Persisted shape: only the storage key is stored. The public/CDN URL is
// derived at read time via MediaStorage.getPublicUrl — never persisted,
// since a stored URL would go stale if the bucket/CDN domain ever changes.
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
}

// View shape returned over HTTP: each image key resolved to a usable URL.
export interface ProductImage {
  key: string;
  url: string;
}

export interface ProductResponse extends Omit<Product, 'images'> {
  images: ProductImage[];
}
