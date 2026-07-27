import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * Functional interceptor (the modern Angular style — a plain function, not a
 * class implementing HttpInterceptor, which was the Angular 4-era pattern).
 * Registered once in app.config.ts (Step 1) via withInterceptors([...]) —
 * after that, EVERY HttpClient call anywhere in the app passes through this
 * function automatically, with zero per-call wiring needed.
 *
 * Job: if a token exists, attach it as "Authorization: Bearer <token>" —
 * exactly the header format JwtAuthenticationFilter expects on the backend.
 * If no token exists (user isn't logged in), the request passes through
 * unchanged — this correctly handles public endpoints (browsing
 * categories/products, login/register itself) which must work with NO token
 * attached at all.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      // HttpRequest objects are IMMUTABLE in Angular — we cannot modify req
      // directly, only produce a new, cloned copy with the header added. This
      // is deliberate (predictable, side-effect-free request handling).
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedRequest);
  }

  return next(req);
};