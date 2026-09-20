import { injectable } from 'inversify';
import { CatalogueClient, ProductSummary } from './catalogue-client';

const CATALOGUE_SERVICE_URL = process.env.CATALOGUE_SERVICE_URL ?? 'http://localhost:3000';
const CATALOGUE_REQUEST_TIMEOUT_MS = Number(process.env.CATALOGUE_REQUEST_TIMEOUT_MS ?? 5000);

interface CatalogueProductResponse {
  id: string;
  name: string;
  price: number;
}

@injectable()
export class HttpCatalogueClient implements CatalogueClient {
  async getProduct(id: string): Promise<ProductSummary | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), CATALOGUE_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${CATALOGUE_SERVICE_URL}/products/${encodeURIComponent(id)}`, {
        signal: controller.signal,
      });

      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error(`catalogue-service returned ${response.status} for product ${id}`);
      }

      const product = (await response.json()) as CatalogueProductResponse;
      return { id: product.id, name: product.name, price: product.price };
    } finally {
      clearTimeout(timeout);
    }
  }
}
