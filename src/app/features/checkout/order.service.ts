import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Order } from './order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  /**
   * Mirrors OrderController.checkout() exactly: Idempotency-Key is a
   * REQUIRED HTTP header (@RequestHeader on the backend), not a body field —
   * the body is empty, since the backend derives everything from the
   * authenticated user's server-side cart.
   */
  checkout(idempotencyKey: string): Observable<Order> {
    const headers = new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
    return this.http.post<Order>(`${this.apiUrl}/checkout`, {}, { headers });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(this.apiUrl);
  }
}