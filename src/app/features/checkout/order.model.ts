/**
 * Mirrors OrderResponse.java / OrderResponse.OrderItemResponse exactly.
 */
export interface OrderItem {
  productId: string;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
}
