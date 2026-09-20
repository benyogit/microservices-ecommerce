// Line items snapshot name/unitPrice from catalogue-service at add-time,
// so GET /cart is a single Redis read and doesn't depend on
// catalogue-service being up. This trades staleness (a price shown here
// can drift from the live product price) for availability and speed —
// acceptable until a checkout flow exists, which would need to
// re-validate against catalogue-service before finalizing an order.
export interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: string;
}
