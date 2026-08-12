import { Routes } from '@angular/router';
import { OrderHistory } from './order-history/order-history';
import { authGuard } from '../../core/guards/auth.guard';

export const ACCOUNT_ROUTES: Routes = [
  {
    path: 'orders',
    component: OrderHistory,
    canActivate: [authGuard]
  }
];