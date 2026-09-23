import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorySummary, PageResponse, Product } from '../catalog/product.model';

export type ShopStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'REJECTED' | 'SUSPENDED';
export interface Shop { id: string; name: string; slug: string; phone: string; addressLine1: string; city: string; district: string; latitude: number; longitude: number; status: ShopStatus; rejectionReason: string | null; }
export interface ShopApplicationRequest { name: string; phone: string; addressLine1: string; city: string; district: string; latitude: number; longitude: number; }
export interface ShopProductRequest { categoryId: string; name: string; description: string; price: number; stockQuantity: number; }
export interface CreateShopProductRequest extends ShopProductRequest { shopId: string; sku: string; }

@Injectable({ providedIn: 'root' })
export class ShopService {
  private http = inject(HttpClient);
  private shopsUrl = `${environment.apiUrl}/shops`;
  private productsUrl = `${environment.apiUrl}/products`;

  getMine(): Observable<Shop[]> { return this.http.get<Shop[]>(`${this.shopsUrl}/mine`); }
  apply(request: ShopApplicationRequest, idempotencyKey: string): Observable<Shop> {
    return this.http.post<Shop>(this.shopsUrl, request, { headers: { 'Idempotency-Key': idempotencyKey } });
  }
  getProducts(shopId: string): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.productsUrl}/shop/${shopId}/manage`, { params: new HttpParams().set('size', 100).set('sort', 'name,asc') });
  }
  getCategories(): Observable<CategorySummary[]> { return this.http.get<CategorySummary[]>(`${environment.apiUrl}/categories`); }
  create(request: CreateShopProductRequest): Observable<Product> { return this.http.post<Product>(this.productsUrl, request); }
  update(id: string, request: ShopProductRequest): Observable<Product> { return this.http.put<Product>(`${this.productsUrl}/${id}`, request); }
  deactivate(id: string): Observable<void> { return this.http.delete<void>(`${this.productsUrl}/${id}`); }
}
