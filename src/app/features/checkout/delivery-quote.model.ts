export interface DeliveryQuote {
  id: string;
  shopId: string;
  zoneCode: string;
  zoneName: string;
  distanceKm: number;
  fee: number;
  currency: string;
  pricingVersion: number;
  expiresAt: string;
}

export interface DeliveryQuoteRequest {
  latitude: number;
  longitude: number;
  city: string;
  district: string;
}
