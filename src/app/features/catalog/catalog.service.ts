import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PageResponse, Product } from './product.model';

/**
 * providedIn: 'root' — same singleton pattern as AuthService, though the
 * "singleton" property matters less here (this service holds no state of its
 * own, unlike AuthService's token) — kept consistent with the established
 * convention regardless.
 */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/products`;

  /**
   * No Authorization header needed for this call — the authInterceptor only
   * ATTACHES a token if one exists (see that interceptor's own comment); it
   * never REQUIRES one. This call works identically whether the user is
   * logged in or not, matching the backend's public GET /api/products rule.
   */
  getProducts(page: number = 0, size: number = 20): Observable<PageResponse<Product>> {
    // HttpParams: Angular's type-safe way to build query strings
    // (?page=0&size=20) — preferred over manually concatenating strings into
    // the URL, which is more error-prone (encoding issues, easy typos).
    const params = new HttpParams().set('page', page).set('size', size);

    return this.http.get<PageResponse<Product>>(this.apiUrl, { params });
  }

  getProductBySlug(slug: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${slug}`);
  }
}