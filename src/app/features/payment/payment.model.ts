/**
 * Mirrors GatewayType.java exactly — Jackson serializes/deserializes Java
 * enums by their name() string by default, so these string literals must
 * match the backend enum's constant names exactly (case-sensitive).
 */
export type GatewayType = 'ESEWA' | 'KHALTI' | 'STRIPE';

/**
 * Mirrors PaymentResponse.java exactly.
 */
export interface PaymentResponse {
  id: string;
  orderId: string;
  gateway: GatewayType;
  status: string;
  amount: number;
  currency: string;
  redirectUrl: string | null;
}