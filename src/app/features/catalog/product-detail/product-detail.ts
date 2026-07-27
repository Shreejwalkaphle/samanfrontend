import { Component, inject, input, signal, effect } from '@angular/core';
import { CatalogService } from '../catalog.service';
import { Product } from '../product.model';

@Component({
  selector: 'app-product-detail',
  imports: [],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetail {
  private catalogService = inject(CatalogService);

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
}