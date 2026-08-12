import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdminService } from '../admin.service';
import { CategorySummary } from '../../catalog/product.model';

@Component({
  selector: 'app-create-product',
  imports: [ReactiveFormsModule],
  templateUrl: './create-product.html',
  styleUrl: './create-product.scss',
})
export class CreateProduct implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);

  categories = signal<CategorySummary[]>([]);

  // Validators mirror backend's CreateProductRequest @Valid rules exactly
  // (min price 0.01, non-negative stock) — same UX-only reasoning noted on
  // every other form in this project; backend remains the real boundary.
  productForm = this.fb.group({
    categoryId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(2000)]],
    price: [0, [Validators.required, Validators.min(0.01)]],
    sku: ['', [Validators.required, Validators.maxLength(50)]],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.adminService.getRootCategories().subscribe((categories) => this.categories.set(categories));
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const raw = this.productForm.getRawValue();

    this.adminService
      .createProduct({
        categoryId: raw.categoryId!,
        name: raw.name!,
        description: raw.description ?? '',
        price: raw.price!,
        sku: raw.sku!,
        stockQuantity: raw.stockQuantity!,
      })
      .subscribe({
        next: (product) => {
          this.isSubmitting.set(false);
          this.successMessage.set(`Product "${product.name}" created successfully.`);
          this.productForm.reset({ price: 0, stockQuantity: 0 });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message ?? 'Failed to create product.');
        },
      });
  }
}