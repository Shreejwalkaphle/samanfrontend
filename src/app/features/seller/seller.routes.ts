import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { SellerProducts } from './seller-products/seller-products';

export const SELLER_ROUTES: Routes = [
  { path: 'products', component: SellerProducts, canActivate: [authGuard] },
];
