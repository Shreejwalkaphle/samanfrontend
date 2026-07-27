/**
 * Mirrors the backend's ProductResponse DTO exactly (see
 * com.bajar.saman.dto.ProductResponse on the backend) — field names and types
 * must match what the JSON actually contains, since TypeScript has no runtime
 * awareness of the backend's Java types; this interface is purely a
 * compile-time contract WE maintain by hand, kept in sync manually.
 */
export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sku: string;
  stockQuantity: number;
  active: boolean;
  category: CategorySummary;
}

/**
 * Mirrors PageResponse<T> from the backend — the same generic pagination
 * wrapper pattern, reused here in TypeScript for the same reason it existed
 * on the backend: a stable, explicit shape independent of whatever internal
 * structure Spring Data's Page<T> happens to serialize to.
 */
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}