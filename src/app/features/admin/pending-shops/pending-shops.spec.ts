import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingShops } from './pending-shops';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('PendingShops', () => {
  let component: PendingShops;
  let fixture: ComponentFixture<PendingShops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingShops],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingShops);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
