export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  priceAtAddition: number;
  lineTotal: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}