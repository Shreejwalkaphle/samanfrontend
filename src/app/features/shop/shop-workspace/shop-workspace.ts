import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategorySummary, Product } from '../../catalog/product.model';
import { Shop, ShopService } from '../shop.service';

@Component({ selector: 'app-shop-workspace', imports: [ReactiveFormsModule], templateUrl: './shop-workspace.html', styleUrl: './shop-workspace.scss' })
export class ShopWorkspace implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ShopService);
  shops = signal<Shop[]>([]); selectedShop = signal<Shop | null>(null);
  products = signal<Product[]>([]); categories = signal<CategorySummary[]>([]);
  editingId = signal<string | null>(null); isSubmitting = signal(false);
  message = signal<string | null>(null); errorMessage = signal<string | null>(null);

  applicationForm = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(160)]], phone: ['', [Validators.required, Validators.maxLength(20)]],
    addressLine1: ['', [Validators.required, Validators.maxLength(255)]], city: ['Biratnagar', [Validators.required, Validators.maxLength(100)]],
    district: ['Morang', [Validators.required, Validators.maxLength(100)]], latitude: [26.4525, [Validators.required, Validators.min(-90), Validators.max(90)]],
    longitude: [87.2718, [Validators.required, Validators.min(-180), Validators.max(180)]],
  });
  productForm = this.fb.group({
    categoryId: ['', Validators.required], name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.maxLength(2000)], price: [0, [Validators.required, Validators.min(0.01)]],
    sku: ['', [Validators.required, Validators.maxLength(50)]], stockQuantity: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void { this.loadShops(); this.service.getCategories().subscribe({ next: v => this.categories.set(v), error: e => this.fail(e, 'Could not load categories.') }); }
  loadShops(): void { this.service.getMine().subscribe({ next: shops => { this.shops.set(shops); const chosen = shops.find(s => s.status === 'ACTIVE') ?? shops[0] ?? null; this.selectShop(chosen); }, error: e => this.fail(e, 'Could not load your shops.') }); }
  selectShop(shop: Shop | null): void { this.selectedShop.set(shop); this.products.set([]); if (shop?.status === 'ACTIVE') this.loadProducts(shop.id); }
  apply(): void {
    if (this.applicationForm.invalid) { this.applicationForm.markAllAsTouched(); return; }
    this.busy();
    const value = this.applicationForm.getRawValue();
    this.service.apply({ name: value.name!, phone: value.phone!, addressLine1: value.addressLine1!, city: value.city!, district: value.district!, latitude: value.latitude!, longitude: value.longitude! }, crypto.randomUUID())
      .subscribe({ next: shop => { this.isSubmitting.set(false); this.message.set('Shop application submitted for admin review.'); this.shops.update(v => [...v, shop]); this.selectShop(shop); }, error: e => this.fail(e, 'Shop application failed.') });
  }
  loadProducts(shopId = this.selectedShop()?.id): void { if (!shopId) return; this.service.getProducts(shopId).subscribe({ next: p => this.products.set(p.content), error: e => this.fail(e, 'Could not load shop products.') }); }
  edit(product: Product): void { this.editingId.set(product.id); this.productForm.patchValue({ categoryId: product.category.id, name: product.name, description: product.description ?? '', price: product.price, sku: product.sku, stockQuantity: product.stockQuantity }); this.productForm.controls.sku.disable(); }
  cancelEdit(): void { this.editingId.set(null); this.productForm.controls.sku.enable(); this.productForm.reset({ price: 0, stockQuantity: 0 }); }
  submitProduct(): void {
    const shop = this.selectedShop(); if (!shop || shop.status !== 'ACTIVE' || this.productForm.invalid) { this.productForm.markAllAsTouched(); return; }
    const v = this.productForm.getRawValue(); const common = { categoryId: v.categoryId!, name: v.name!, description: v.description ?? '', price: v.price!, stockQuantity: v.stockQuantity! };
    this.busy(); const request = this.editingId() ? this.service.update(this.editingId()!, common) : this.service.create({ ...common, shopId: shop.id, sku: v.sku! });
    request.subscribe({ next: () => { this.isSubmitting.set(false); this.message.set(this.editingId() ? 'Product updated.' : 'Product created.'); this.cancelEdit(); this.loadProducts(); }, error: e => this.fail(e, 'Product operation failed.') });
  }
  deactivate(product: Product): void { if (!product.active || !confirm(`Deactivate ${product.name}?`)) return; this.service.deactivate(product.id).subscribe({ next: () => this.loadProducts(), error: e => this.fail(e, 'Could not deactivate product.') }); }
  private busy(): void { this.isSubmitting.set(true); this.message.set(null); this.errorMessage.set(null); }
  private fail(error: any, fallback: string): void { this.isSubmitting.set(false); this.errorMessage.set(error.error?.message ?? fallback); }
}
