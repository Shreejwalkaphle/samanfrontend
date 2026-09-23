export interface ShopApplication {
  id: string; name: string; slug: string; phone: string; addressLine1: string;
  city: string; district: string; latitude: number; longitude: number;
  status: string; rejectionReason: string | null;
}
