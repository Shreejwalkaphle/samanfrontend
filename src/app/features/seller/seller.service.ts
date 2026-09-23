import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CategorySummary, PageResponse, Product } from '../catalog/product.model';

export interface SellerProductRequest {
  categoryId: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
}

export interface CreateSellerProductRequest extends SellerProductRequest {
  sku: string;
}

@Injectable({ providedIn: 'root' })
export class SellerService {
  private http = inject(HttpClient);
  private productsUrl = `${environment.apiUrl}/products`;

  getMine(): Observable<PageResponse<Product>> {
    return this.http.get<PageResponse<Product>>(`${this.productsUrl}/mine`, {
      params: new HttpParams().set('size', 100).set('sort', 'name,asc'),
    });
  }

  getCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${environment.apiUrl}/categories/root`);
  }

  create(request: CreateSellerProductRequest): Observable<Product> {
    return this.http.post<Product>(this.productsUrl, request);
  }

  update(id: string, request: SellerProductRequest): Observable<Product> {
    return this.http.put<Product>(`${this.productsUrl}/${id}`, request);
  }

  deactivate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.productsUrl}/${id}`);
  }
}
