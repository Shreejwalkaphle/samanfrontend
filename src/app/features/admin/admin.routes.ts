import { Routes } from '@angular/router';
import { CreateCategory } from './create-category/create-category';
import { CreateProduct } from './create-product/create-product';
import { PendingSellers } from './pending-sellers/pending-sellers';
import { authGuard } from '../../core/guards/auth.guard';

/**
 * IMPORTANT SCOPE NOTE: authGuard here only checks "is someone logged in,"
 * NOT "is this person an ADMIN" — same limitation as every other guard in
 * this project (see auth.guard.ts's own comment: this is a UX convenience,
 * not a security boundary). A logged-in CUSTOMER can still SEE these forms
 * and attempt to submit them — they will correctly receive a 403 from the
 * backend's @PreAuthorize check when they do (verified yesterday). Building
 * a role-aware guard (redirecting non-admins away from even SEEING this UI)
 * is a legitimate UX improvement but deliberately not done in this pass —
 * flagged in PROGRESS.md as a follow-up, not silently skipped.
 */
export const ADMIN_ROUTES: Routes = [
  {
    path: 'categories/new',
    component: CreateCategory,
    canActivate: [authGuard]
  },
  {
    path: 'products/new',
    component: CreateProduct,
    canActivate: [authGuard]
  },
  {
    path: 'sellers/pending',
    component: PendingSellers,
    canActivate: [authGuard]
  }
];