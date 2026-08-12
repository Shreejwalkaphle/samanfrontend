import { Routes } from '@angular/router';

/**
 * Root routing table. Each feature is registered here via loadChildren, NOT
 * loadComponent for a single component and NOT any NgModule import — this is
 * the Angular 22 replacement for Angular 4's per-module RouterModule.forChild()
 * wiring. Angular only downloads a feature's JS bundle the first time a user
 * actually navigates to its path — this is what "lazy-loaded" means in
 * practice, and is why features/ is organized as independent, self-contained
 * folders (a feature that imported another feature directly would break this
 * lazy-splitting benefit).
 */
export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  // catalog, cart, checkout, account, admin routes will be added here the same way, one feature at a time — matching roadmap doc's "lazy-loaded standalone routes per feature."
  {
    path: 'catalog',
    loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES),
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES),
  },
  {
    path: 'checkout',
    loadChildren: () =>
      import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: 'account',
    loadChildren: () => import('./features/account/account.routes').then((m) => m.ACCOUNT_ROUTES),
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
];
