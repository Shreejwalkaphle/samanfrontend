import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { ShopWorkspace } from './shop-workspace/shop-workspace';

export const SHOP_ROUTES: Routes = [
  { path: '', component: ShopWorkspace, canActivate: [authGuard] },
];
