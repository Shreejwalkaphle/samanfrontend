import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { EsewaResult } from './esewa-result/esewa-result';

export const PAYMENT_ROUTES: Routes = [
  {
    path: 'esewa/success',
    component: EsewaResult,
    canActivate: [authGuard],
    data: { outcome: 'success' },
  },
  {
    path: 'esewa/failure',
    component: EsewaResult,
    canActivate: [authGuard],
    data: { outcome: 'failure' },
  },
];
