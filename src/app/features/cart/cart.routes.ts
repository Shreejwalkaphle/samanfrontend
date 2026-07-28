import { Routes } from '@angular/router';
import { CartPage } from './cart-page/cart-page';
import { authGuard } from '../../core/guards/auth.guard';

export const CART_ROUTES: Routes = [
  {
    path: '',
    component: CartPage,
    // canActivate: guard(s) checked BEFORE this route is allowed to activate.
    // If authGuard returns false, navigation to this route is cancelled
    // entirely (and the guard itself redirects to /auth/login).
    canActivate: [authGuard]
  }
];