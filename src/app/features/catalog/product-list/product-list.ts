import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CatalogService } from '../catalog.service';
import { Product } from '../product.model';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private catalogService = inject(CatalogService);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // OnInit (a lifecycle hook, same concept as Angular 4 — this part hasn't
  // changed): runs once when the component is first created. Data-fetching
  // components almost always kick off their initial load here, NOT in the
  // constructor (constructors should stay cheap/synchronous; ngOnInit is
  // Angular's designated place for "do real work once dependencies are
  // ready").
  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.catalogService.getProducts().subscribe({
      next: (response) => {
        this.products.set(response.content);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load products. Please try again.');
        this.isLoading.set(false);
      },
    });
  }
}