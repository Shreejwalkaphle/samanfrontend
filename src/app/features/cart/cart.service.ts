import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Cart } from './cart.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/cart`;

  // Shared, app-wide cart state — same singleton reasoning as AuthService's
  // token. Deliberately NOT mutated directly from anywhere except this
  // service's own methods, all of which re-fetch the authoritative cart from
  // the backend after any mutation, rather than optimistically guessing the
  // new state client-side. This matters specifically because price/stock
  // validation happens server-side (see CartService.java's stock-check
  // logic) — a client-side-only update could show a quantity the backend
  // would have actually rejected.
  cart = signal<Cart>({ items: [], total: 0 });

  refreshCart(): void {
    this.http.get<Cart>(this.apiUrl).subscribe((cart) => this.cart.set(cart));
  }

  addItem(productId: string, quantity: number) {
    return this.http
      .post(`${this.apiUrl}/items`, { productId, quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  updateQuantity(itemId: string, quantity: number) {
    return this.http
      .patch(`${this.apiUrl}/items/${itemId}`, { quantity })
      .pipe(tap(() => this.refreshCart()));
  }

  removeItem(itemId: string) {
    return this.http
      .delete(`${this.apiUrl}/items/${itemId}`)
      .pipe(tap(() => this.refreshCart()));
  }
}