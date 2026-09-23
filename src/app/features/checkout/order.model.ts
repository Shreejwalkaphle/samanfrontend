/**
 * Mirrors OrderResponse.java / OrderResponse.OrderItemResponse exactly.
 */
export interface OrderItem {
  productId: string;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  district: string;
  postalCode: string | null;
  phone: string;
  deliveryQuoteId: string;
  latitude: number;
  longitude: number;
}

export interface Order {
  id: string;
  status: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingCity: string | null;
  shippingLatitude: number | null;
  shippingLongitude: number | null;
  trackingNumber: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}
