import { Component, inject, input, signal, effect } from '@angular/core';
import { CatalogService } from '../catalog.service';
import { Product } from '../product.model';
import { CartService } from '../../cart/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  imports: [RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private catalogService = inject(CatalogService);
  private cartService = inject(CartService);
  private router = inject(Router);
  authService = inject(AuthService); // public — template reads
  // authService.isAuthenticated() to
  // decide whether to show "Add to Cart"
  // or a "Log in to purchase" prompt.

  // input(): a Signal-based component input. Because withComponentInputBinding()
  // is enabled (Step 1), Angular automatically sets this to whatever the
  // ":slug" route segment currently is — this REPLACES what would have been
  // ActivatedRoute.snapshot.paramMap.get('slug') (or the params Observable) in
  // Angular 4. The name here ("slug") must match the route path's parameter
  // name exactly (see catalog.routes.ts, Step 3 below).
  slug = input.required<string>();

  product = signal<Product | null>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  addToCartMessage = signal<string | null>(null);

  constructor() {
    // effect(): runs automatically whenever any Signal it reads (here,
    // slug()) changes — including the FIRST time, when the component is
    // created. This replaces ngOnInit for this specific case, because we
    // specifically need to react to slug CHANGING too (e.g. navigating from
    // one product detail page directly to another one, without the component
    // being destroyed/recreated) — ngOnInit alone would only fire once and
    // miss that case.
    effect(() => {
      this.loadProduct(this.slug());
    });
  }

  private loadProduct(slug: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getProductBySlug(slug).subscribe({
      next: (product) => {
        this.product.set(product);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Product not found.');
        this.isLoading.set(false);
      },
    });
  }

  onAddToCart(): void {
    // Defensive check — the "Add to Cart" button is already hidden for
    // logged-out users in the template (see product-detail.html), but this
    // guards against the button somehow being triggered anyway (e.g. a stale
    // render). Redirecting rather than silently failing gives a clear next
    // step instead of a confusing no-op.
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentProduct = this.product();
    if (!currentProduct) return;

    this.addToCartMessage.set(null);

    this.cartService.addItem(currentProduct.id, 1).subscribe({
      next: () => {
        this.addToCartMessage.set('Added to cart!');
      },
      error: (err) => {
        // Surfaces backend messages directly — e.g.
        // InsufficientStockException's message, now correctly returning 400
        // per the fix made earlier in the backend's development. Safe to
        // show as-is, same GlobalExceptionHandler-message-safety reasoning
        // used throughout this project's error handling.
        this.addToCartMessage.set(err.error?.message ?? 'Failed to add to cart.');
      },
    });
  }
}
