import { Routes } from '@angular/router';
import { CheckoutPage } from './checkout-page/checkout-page';
import { authGuard } from '../../core/guards/auth.guard';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    component: CheckoutPage,
    canActivate: [authGuard]
  }
];