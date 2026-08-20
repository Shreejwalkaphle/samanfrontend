import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSellers } from './pending-sellers';

describe('PendingSellers', () => {
  let component: PendingSellers;
  let fixture: ComponentFixture<PendingSellers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingSellers],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingSellers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
