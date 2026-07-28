import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../features/cart/cart.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  authService = inject(AuthService);
  cartService = inject(CartService);
  private router = inject(Router);

  /**
   * Deliberately TOTAL QUANTITY across all cart items, not items.length
   * (which counts distinct line items — e.g. adding the same product twice
   * merges into ONE line item with quantity 2, per CartService.addItem()'s
   * merge logic, but a customer expects the badge to reflect "2 things in my
   * cart," not "1 distinct product"). computed() keeps this in sync
   * automatically whenever the underlying cart signal changes — no manual
   * recalculation needed anywhere.
   */
  cartItemCount = computed(() =>
    this.cartService.cart().items.reduce((sum, item) => sum + item.quantity, 0)
  );

  onLogout(): void {
    this.authService.logout();
    // Prevents a confusing state where the user stays visually parked on a
    // now-inaccessible page (e.g. /cart) after logging out — sends them
    // somewhere that works regardless of auth state.
    this.router.navigate(['/catalog/products']);
  }
}