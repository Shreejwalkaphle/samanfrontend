import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingShops } from './pending-shops';

describe('PendingShops', () => {
  let component: PendingShops;
  let fixture: ComponentFixture<PendingShops>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingShops],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingShops);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
