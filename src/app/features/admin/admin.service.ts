import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorySummary } from '../catalog/product.model';
import { ShopApplication } from './shop.model';

interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId: string | null;
}

/**
 * Mirrors CategoryController/ProductController's create endpoints exactly.
 * No special "admin" auth handling needed here — the existing
 * authInterceptor (core/interceptors/auth.interceptor.ts) already attaches
 * whatever token exists to every request; the BACKEND is what decides
 * whether that token's role is sufficient (@PreAuthorize), not this service.
 * A non-admin calling these methods will simply receive a 403 from the
 * backend, same as any other HTTP error.
 */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  createCategory(request: CreateCategoryRequest): Observable<CategorySummary> {
    return this.http.post<CategorySummary>(`${environment.apiUrl}/categories`, request);
  }

  getRootCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${environment.apiUrl}/categories/root`);
  }

  getPendingShops(): Observable<{ content: ShopApplication[] }> {
    return this.http.get<{ content: ShopApplication[] }>(`${environment.apiUrl}/admin/shops/pending`);
  }

  approveShop(shopId: string): Observable<ShopApplication> {
    return this.http.patch<ShopApplication>(`${environment.apiUrl}/admin/shops/${shopId}/approve`, {});
  }

  rejectShop(shopId: string, reason: string): Observable<ShopApplication> {
    return this.http.patch<ShopApplication>(`${environment.apiUrl}/admin/shops/${shopId}/reject`, { reason });
  }
}
