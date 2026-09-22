import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { CategorySummary, Product } from '../../catalog/product.model';
import { SellerService } from '../seller.service';

@Component({
  selector: 'app-seller-products',
  imports: [ReactiveFormsModule],
  templateUrl: './seller-products.html',
  styleUrl: './seller-products.scss',
})
export class SellerProducts implements OnInit {
  private fb = inject(FormBuilder);
  private sellerService = inject(SellerService);
  authService = inject(AuthService);

  products = signal<Product[]>([]);
  categories = signal<CategorySummary[]>([]);
  editingId = signal<string | null>(null);
  isSubmitting = signal(false);
  message = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  form = this.fb.group({
    categoryId: ['', Validators.required],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)],
    price: [0, [Validators.required, Validators.min(0.01)]],
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.load();
    this.sellerService.getCategories().subscribe((categories) => this.categories.set(categories));
  }

  load(): void {
    this.sellerService.getMine().subscribe({
      next: (page) => this.products.set(page.content),
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Could not load seller products.'),
    });
  }

  edit(product: Product): void {
    this.editingId.set(product.id);
    this.form.patchValue({
      categoryId: product.category.id,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      sku: product.sku,
      stockQuantity: product.stockQuantity,
    });
    this.form.controls.sku.disable();
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.form.controls.sku.enable();
    this.form.reset({ price: 0, stockQuantity: 0 });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const common = {
      categoryId: value.categoryId!, name: value.name!,
      description: value.description ?? '', price: value.price!,
      stockQuantity: value.stockQuantity!,
    };
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    const request = this.editingId()
      ? this.sellerService.update(this.editingId()!, common)
      : this.sellerService.create({ ...common, sku: value.sku! });
    request.subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.message.set(this.editingId() ? 'Product updated.' : 'Product created.');
        this.cancelEdit();
        this.load();
      },
      error: (error) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(error.error?.message ?? 'Product operation failed.');
      },
    });
  }

  deactivate(product: Product): void {
    if (!product.active || !confirm(`Deactivate ${product.name}?`)) return;
    this.sellerService.deactivate(product.id).subscribe({
      next: () => { this.message.set('Product deactivated.'); this.load(); },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Could not deactivate product.'),
    });
  }
}
