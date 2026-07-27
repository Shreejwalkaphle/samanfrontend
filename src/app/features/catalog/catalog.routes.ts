import { Routes } from '@angular/router';
import { ProductList } from './product-list/product-list';
import { ProductDetail } from './product-detail/product-detail';

export const CATALOG_ROUTES: Routes = [
  {
    path: 'products',
    component: ProductList
  },
  {
    // ":slug" here is what makes this a PARAMETERIZED route — the actual
    // value in the URL (e.g. "iphone-17") becomes available via the
    // ProductDetail component's slug input(), because its property name
    // ("slug") matches this segment name exactly.
    path: 'products/:slug',
    component: ProductDetail
  }
];