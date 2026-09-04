export interface ProductImage {
  key: string;
  url: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  images: ProductImage[];
}
