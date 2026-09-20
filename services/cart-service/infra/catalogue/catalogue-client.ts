export interface ProductSummary {
  id: string;
  name: string;
  price: number;
}

export interface CatalogueClient {
  getProduct(id: string): Promise<ProductSummary | null>;
}
