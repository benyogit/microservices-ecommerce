import { Request, Response } from 'express';
import { createProduct, getProduct, listProducts, removeProduct } from './product.service';

export async function listProductsHandler(_req: Request, res: Response): Promise<void> {
  const products = await listProducts();
  res.json(products);
}

export async function getProductHandler(req: Request, res: Response): Promise<void> {
  const product = await getProduct(req.params.id);
  if (!product) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }
  res.json(product);
}

export async function createProductHandler(req: Request, res: Response): Promise<void> {
  const product = await createProduct(req.body);
  res.status(201).json(product);
}

export async function deleteProductHandler(req: Request, res: Response): Promise<void> {
  await removeProduct(req.params.id);
  res.status(204).send();
}
