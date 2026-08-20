/**
 * Mirrors RoleManagementController's SellerApplicationResponse (a nested
 * record on the backend) exactly.
 */
export interface SellerApplication {
  id: string;
  email: string;
  sellerStatus: string;
}