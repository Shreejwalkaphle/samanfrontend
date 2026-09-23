import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { ShopWorkspace } from './shop-workspace';
import { ShopService } from '../shop.service';

describe('ShopWorkspace', () => {
  let fixture: ComponentFixture<ShopWorkspace>;
  const service = {
    getMine: vi.fn(), getCategories: vi.fn(), getProducts: vi.fn(),
    apply: vi.fn(), create: vi.fn(), update: vi.fn(), deactivate: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    service.getCategories.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ShopWorkspace], providers: [{ provide: ShopService, useValue: service }],
    }).compileComponents();
  });

  it('shows the application form when the user has no shop', () => {
    service.getMine.mockReturnValue(of([]));
    fixture = TestBed.createComponent(ShopWorkspace);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Register your Biratnagar shop');
    expect(service.getProducts).not.toHaveBeenCalled();
  });

  it('loads inventory for an active shop', () => {
    const shop = { id: 'shop-1', name: 'Main Road Store', slug: 'main-road-store', phone: '9800000000', addressLine1: 'Main Road', city: 'Biratnagar', district: 'Morang', latitude: 26.45, longitude: 87.27, status: 'ACTIVE', rejectionReason: null };
    service.getMine.mockReturnValue(of([shop]));
    service.getProducts.mockReturnValue(of({ content: [], pageNumber: 0, pageSize: 100, totalElements: 0, totalPages: 0 }));
    fixture = TestBed.createComponent(ShopWorkspace);
    fixture.detectChanges();
    expect(service.getProducts).toHaveBeenCalledWith('shop-1');
    expect(fixture.nativeElement.textContent).toContain('Main Road Store');
    expect(fixture.nativeElement.textContent).toContain('Create a product');
  });
});
