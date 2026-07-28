import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional guard (Angular 15+ style, same pattern as authInterceptor —
 * plain function, not a class implementing CanActivate, which was the
 * Angular-4-era approach).
 *
 * IMPORTANT SCOPE NOTE: this is a UX convenience, NOT a security boundary.
 * The actual security enforcement is entirely on the backend
 * (SecurityConfig's anyRequest().authenticated(), plus JwtAuthenticationFilter
 * validating the token on every request). A user could theoretically bypass
 * this guard (disable JS, call the API directly, etc.) and would still be
 * correctly rejected by the backend with a 401. This guard exists purely to
 * redirect an unauthenticated user to the login page BEFORE they see a
 * broken/empty cart page and confusing API errors — a UX improvement, not a
 * protection mechanism.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};