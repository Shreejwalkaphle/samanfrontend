import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorySummary, Product } from '../catalog/product.model';
import { SellerApplication } from './seller-application.model';

interface CreateCategoryRequest {
  name: string;
  description: string;
  parentId: string | null;
}

interface CreateProductRequest {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  sku: string;
  stockQuantity: number;
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

  createProduct(request: CreateProductRequest): Observable<Product> {
    return this.http.post<Product>(`${environment.apiUrl}/products`, request);
  }

  getRootCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${environment.apiUrl}/categories/root`);
  }

  getPendingSellers(): Observable<SellerApplication[]> {
    return this.http.get<SellerApplication[]>(`${environment.apiUrl}/admin/sellers/pending`);
  }

  approveSeller(userId: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${environment.apiUrl}/admin/sellers/${userId}/approve`, {});
  }

  rejectSeller(userId: string): Observable<SellerApplication> {
    return this.http.patch<SellerApplication>(`${environment.apiUrl}/admin/sellers/${userId}/reject`, {});
  }
}